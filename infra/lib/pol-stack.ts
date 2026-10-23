// Everything POL runs on in AWS, sized to cost ~nothing while idle:
//   API Gateway (HTTP API) -> Lambda -> RDS Data API -> Aurora Serverless v2 (scales to 0 ACU)
//   Cognito (users, editor/admin groups), S3 + CloudFront (media), SQS (news ingest),
//   EventBridge (nightly score engine), CloudWatch Logs (1-month retention).
// Lambdas use the Data API over HTTPS, so they run outside any VPC and no NAT Gateway is needed.
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export interface PolStackProps extends StackProps {
  stage: string;
  /** Browser origins allowed to call the API (Vercel domains, localhost). */
  webOrigins: string[];
}

export class PolStack extends Stack {
  constructor(scope: Construct, id: string, props: PolStackProps) {
    super(scope, id, props);
    const { stage } = props;
    const prod = stage === "prod";
    const name = (n: string) => `pol-${stage}-${n}`;

    // Database --------------------------------------------------------------------------
    // Aurora needs subnets to live in; the account's default VPC is free. Nothing connects
    // over the network: the security group has no inbound rules and access is Data API only.
    const vpc = ec2.Vpc.fromLookup(this, "DefaultVpc", { isDefault: true });
    const dbSg = new ec2.SecurityGroup(this, "DbSg", {
      vpc,
      allowAllOutbound: false,
      description: "POL Aurora: no inbound, access via RDS Data API only",
    });
    const cluster = new rds.DatabaseCluster(this, "Db", {
      clusterIdentifier: name("db"),
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_16_13 }),
      writer: rds.ClusterInstance.serverlessV2("writer", { publiclyAccessible: false }),
      serverlessV2MinCapacity: 0, // auto-pauses when idle: storage-only cost
      serverlessV2MaxCapacity: prod ? 8 : 2,
      serverlessV2AutoPauseDuration: Duration.minutes(prod ? 60 : 5),
      enableDataApi: true,
      defaultDatabaseName: "pol",
      credentials: rds.Credentials.fromGeneratedSecret("pol_admin", { secretName: `pol-${stage}/db` }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [dbSg],
      storageEncrypted: true, // AWS-managed key, no KMS charge
      backup: { retention: Duration.days(prod ? 14 : 1) },
      deletionProtection: prod,
      removalPolicy: prod ? RemovalPolicy.SNAPSHOT : RemovalPolicy.DESTROY,
    });

    // Users -----------------------------------------------------------------------------
    const userPool = new cognito.UserPool(this, "Users", {
      userPoolName: name("users"),
      featurePlan: cognito.FeaturePlan.LITE,
      selfSignUpEnabled: true,
      signInAliases: { phone: true, email: true },
      autoVerify: { phone: true, email: true },
      accountRecovery: cognito.AccountRecovery.PHONE_WITHOUT_MFA_AND_EMAIL,
      removalPolicy: prod ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
    const userPoolClient = userPool.addClient("WebClient", {
      userPoolClientName: name("web"),
      generateSecret: false,
      authFlows: { userSrp: true },
      preventUserExistenceErrors: true,
    });
    new cognito.CfnUserPoolGroup(this, "EditorsGroup", { userPoolId: userPool.userPoolId, groupName: "editors" });
    new cognito.CfnUserPoolGroup(this, "AdminsGroup", { userPoolId: userPool.userPoolId, groupName: "admins" });

    // Media -----------------------------------------------------------------------------
    const media = new s3.Bucket(this, "Media", {
      bucketName: `${name("media")}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: prod ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !prod,
    });
    const cdn = new cloudfront.Distribution(this, "MediaCdn", {
      comment: name("media"),
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(media),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200, // includes African edge locations
    });

    // News ingest queue --------------------------------------------------------------------
    const ingestDlq = new sqs.Queue(this, "IngestDlq", {
      queueName: name("ingest-dlq"),
      retentionPeriod: Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
    });
    const ingestQueue = new sqs.Queue(this, "IngestQueue", {
      queueName: name("ingest"),
      visibilityTimeout: Duration.minutes(6),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: { queue: ingestDlq, maxReceiveCount: 3 },
    });

    // Lambdas -----------------------------------------------------------------------------
    const env = {
      DB_DRIVER: "data-api",
      DB_CLUSTER_ARN: cluster.clusterArn,
      DB_SECRET_ARN: cluster.secret!.secretArn,
      DB_NAME: "pol",
      AUTH_MODE: "cognito",
      COGNITO_USER_POOL_ID: userPool.userPoolId,
      COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
      MEDIA_BUCKET: media.bucketName,
      MEDIA_CDN_DOMAIN: cdn.distributionDomainName,
      CORS_ORIGINS: props.webOrigins.join(","),
      NODE_OPTIONS: "--enable-source-maps",
    };
    const fn = (id: string, entry: string, opts: Partial<nodejs.NodejsFunctionProps> = {}) => {
      const f = new nodejs.NodejsFunction(this, id, {
        functionName: name(id.toLowerCase()),
        entry: path.join(root, "services/api/src/handlers", entry),
        projectRoot: root,
        depsLockFilePath: path.join(root, "pnpm-lock.yaml"),
        runtime: lambda.Runtime.NODEJS_22_X,
        architecture: lambda.Architecture.ARM_64, // cheaper per ms than x86
        memorySize: 512,
        timeout: Duration.seconds(29),
        environment: env,
        bundling: {
          format: nodejs.OutputFormat.CJS,
          target: "node22",
          minify: true,
          sourceMap: true,
          // The AWS SDK ships with the runtime; pg is only for local development.
          externalModules: ["@aws-sdk/*", "pg", "pg-native"],
        },
        logGroup: new logs.LogGroup(this, `${id}Logs`, {
          logGroupName: `/aws/lambda/${name(id.toLowerCase())}`,
          retention: logs.RetentionDays.ONE_MONTH,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        ...opts,
      });
      cluster.grantDataApiAccess(f);
      return f;
    };

    const apiFn = fn("Api", "api.ts");
    media.grantReadWrite(apiFn);

    const scoresFn = fn("Scores", "scores.ts", { timeout: Duration.minutes(5), memorySize: 1024 });
    // 00:00 UTC = 01:00 in Nigeria (WAT).
    new events.Rule(this, "NightlyScores", {
      ruleName: name("nightly-scores"),
      schedule: events.Schedule.cron({ minute: "0", hour: "0" }),
      targets: [new targets.LambdaFunction(scoresFn)],
    });

    const ingestFn = fn("Ingest", "ingest.ts", { timeout: Duration.seconds(60) });
    ingestFn.addEventSource(new SqsEventSource(ingestQueue, { batchSize: 10, reportBatchItemFailures: true }));

    // HTTP API ------------------------------------------------------------------------------
    // CORS is answered by the Lambda (Hono), so it behaves the same locally and on AWS.
    const api = new apigw.HttpApi(this, "HttpApi", {
      apiName: name("api"),
      defaultIntegration: new HttpLambdaIntegration("ApiIntegration", apiFn),
    });
    const stageRes = api.defaultStage!.node.defaultChild as apigw.CfnStage;
    stageRes.defaultRouteSettings = { throttlingRateLimit: prod ? 500 : 50, throttlingBurstLimit: prod ? 1000 : 100 };

    // Outputs -------------------------------------------------------------------------------
    new CfnOutput(this, "ApiUrl", { value: api.apiEndpoint });
    new CfnOutput(this, "DbClusterArn", { value: cluster.clusterArn });
    new CfnOutput(this, "DbSecretArn", { value: cluster.secret!.secretArn });
    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: userPoolClient.userPoolClientId });
    new CfnOutput(this, "MediaBucket", { value: media.bucketName });
    new CfnOutput(this, "MediaCdnDomain", { value: cdn.distributionDomainName });
    new CfnOutput(this, "IngestQueueUrl", { value: ingestQueue.queueUrl });
  }
}
