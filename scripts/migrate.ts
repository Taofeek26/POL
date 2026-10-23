// Applies db/migrations/*.sql in order, once each. Works on local Postgres and on Aurora (Data API).
//   pnpm db:migrate            apply pending migrations
//   pnpm db:migrate --reset    drop everything first (local only unless --force)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../services/api/src/db.ts";

const dir = join(import.meta.dirname, "..", "db", "migrations");
const args = process.argv.slice(2);
const q = db().query.bind(db());

function statements(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const target = process.env.DB_DRIVER === "data-api" ? `Aurora ${process.env.DB_CLUSTER_ARN}` : process.env.DATABASE_URL;
console.log(`Migrating ${target}`);

if (args.includes("--reset")) {
  if (process.env.DB_DRIVER === "data-api" && !args.includes("--force")) {
    console.error("Refusing to reset an AWS database without --force.");
    process.exit(1);
  }
  await q("drop schema public cascade");
  await q("create schema public");
  console.log("Reset schema");
}

await q(`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`);
const applied = new Set((await q<{ name: string }>(`select name from schema_migrations`)).map((r) => r.name));

for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  if (applied.has(file)) continue;
  const stmts = statements(readFileSync(join(dir, file), "utf8"));
  for (const s of stmts) await q(s);
  await q(`insert into schema_migrations (name) values (:name)`, { name: file });
  console.log(`Applied ${file} (${stmts.length} statements)`);
}
console.log("Migrations up to date");
await db().close();
