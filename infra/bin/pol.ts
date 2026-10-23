import { App, Tags } from "aws-cdk-lib";
import { PolStack } from "../lib/pol-stack.js";

// Pinned to the PERSONAL account. CDK refuses to deploy if the active credentials belong to
// another account (e.g. the "work" profile), so a wrong AWS_PROFILE fails safely.
const ACCOUNT = "294983767092";
const REGION = "eu-west-2"; // London: the closest enabled region to Nigeria

const app = new App();
const stage = app.node.tryGetContext("stage") ?? "dev";
const webOrigins = String(app.node.tryGetContext("webOrigins") ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const stack = new PolStack(app, `pol-${stage}`, {
  stage,
  webOrigins,
  env: { account: ACCOUNT, region: REGION },
  description: `POL ${stage}: API, Aurora Serverless v2, Cognito, media, ingest`,
});
Tags.of(stack).add("project", "pol");
Tags.of(stack).add("stage", stage);
