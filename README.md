# POL

A fact-based public scorecard for every elected and appointed office in Nigeria, from ward councillor to President.

POL tracks what each office holder has done since taking office. It gathers verified news, budget data and projects and links them to the right official. Citizens react to each item. Every official gets two separate scores:

- **Performance Score:** built from facts that can be checked (verified projects, budget performance, promises kept, legislative work).
- **Citizen Approval:** built from reactions, weighted toward verified residents of the official's constituency.

## Documents

- [Project Blueprint (Markdown)](docs/POL_PROJECT_BLUEPRINT.md)
- [Project Blueprint (HTML)](docs/POL_PROJECT_BLUEPRINT.html): download it and open it in a browser

To rebuild the HTML after editing the Markdown, run `docs/build/build-html.sh` (requires [pandoc](https://pandoc.org)).

## Code layout

| Path | What |
|---|---|
| `apps/web` | Next.js site (deploys to Vercel) |
| `services/api` | API (Hono on Lambda), score engine, ingest worker |
| `packages/shared` | Types and scoring constants shared by web, API and the future mobile app |
| `db/migrations` | SQL schema |
| `db/seed` | Fake data generator (every person, party and story is fictional) |
| `infra` | AWS CDK stack |

## Run locally

Needs Node 22, pnpm and a local Postgres 14+ (user `postgres`, no password).

```sh
pnpm install
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
createdb -h localhost -U postgres pol
pnpm db:reset        # schema + fake data + scores
pnpm api:dev         # http://localhost:4000
pnpm web:dev         # http://localhost:3000
pnpm test            # scoring unit tests
```

In local mode, the menu at the top right switches between seeded test users (citizen, unverified citizen, editor, admin).

## AWS

Everything runs in the **personal** account `294983767092` (profile `default`), region `eu-west-2`. The stack is pinned to that account, so a deploy with the `work` profile fails.

| Service | Use | Idle cost |
|---|---|---|
| API Gateway (HTTP API) + Lambda (arm64) | API | Pay per request |
| Aurora Serverless v2 (PostgreSQL 16, min 0 ACU) | Database, auto-pauses after 5 min idle | Storage only (~$0.10/GB-month) |
| RDS Data API | Lambda to Aurora over HTTPS, so no VPC Lambdas or NAT Gateway | Pay per request |
| Cognito (Lite) | Sign-up, `editors` and `admins` groups | Free to 10k monthly users; SMS billed per message |
| S3 + CloudFront | Photos and media | Pay per use |
| SQS (+ dead-letter queue) | News ingest | Pay per request |
| EventBridge | Nightly score run (01:00 WAT) | Free |
| Secrets Manager | DB credentials | ~$0.40/month |
| CloudWatch Logs | 1-month retention | Pay per GB |

The first request after Aurora pauses takes about 15 s while it resumes. The API retries instead of failing.

```sh
cd infra
AWS_PROFILE=default npx cdk bootstrap        # once per account/region
AWS_PROFILE=default npx cdk deploy pol-dev
# then point .env at the stack outputs (DB_DRIVER=data-api, DB_CLUSTER_ARN, DB_SECRET_ARN) and:
pnpm db:migrate && pnpm db:seed
```

After the web app is on Vercel, allow its domain:
`npx cdk deploy pol-dev -c webOrigins=https://<app>.vercel.app,http://localhost:3000`

## Vercel

Import the repo in Vercel with **Root Directory** `apps/web` and set:

- `NEXT_PUBLIC_API_URL` = the stack's `ApiUrl` output
- `NEXT_PUBLIC_AUTH_MODE` = `cognito` (never `dev`)
