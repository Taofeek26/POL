// One query interface over two drivers:
//   - "pg": local Postgres for development
//   - "data-api": Aurora Serverless v2 via the RDS Data API (HTTPS, so Lambdas need no VPC or NAT)
//
// SQL uses named parameters (:name). Cast in SQL where Postgres needs a type, e.g. :id::uuid,
// :data::jsonb, :day::date, because the Data API sends strings as varchar.
// Rows come back with the same shapes from both drivers: numeric -> number,
// timestamptz -> ISO string, date -> "YYYY-MM-DD", json/jsonb -> parsed value.

export type Params = Record<string, unknown>;

export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: Params): Promise<T[]>;
  close(): Promise<void>;
}

let instance: Db | undefined;

export function db(): Db {
  if (!instance) {
    instance = process.env.DB_DRIVER === "data-api" ? dataApiDb() : pgDb();
  }
  return instance;
}

export async function one<T = Record<string, unknown>>(sql: string, params?: Params): Promise<T | undefined> {
  const rows = await db().query<T>(sql, params);
  return rows[0];
}

function normaliseParam(value: unknown): unknown {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (value !== null && typeof value === "object") return JSON.stringify(value);
  return value;
}

/** Rewrites :name placeholders to $1..$n for node-postgres. Leaves ::casts alone. */
export function toPositional(sql: string, params: Params = {}): { text: string; values: unknown[] } {
  const order: string[] = [];
  const text = sql.replace(/(?<![:\w]):([a-zA-Z_]\w*)/g, (_, name: string) => {
    if (!(name in params)) throw new Error(`Missing SQL parameter :${name}`);
    let idx = order.indexOf(name);
    if (idx === -1) idx = order.push(name) - 1;
    return `$${idx + 1}`;
  });
  return { text, values: order.map((n) => normaliseParam(params[n])) };
}

function pgDb(): Db {
  // Loaded lazily so the Lambda bundle (Data API only) never needs pg.
  let poolPromise: Promise<import("pg").Pool> | undefined;
  const pool = () =>
    (poolPromise ??= import("pg").then(({ default: pg }) => {
      pg.types.setTypeParser(1700, (v) => parseFloat(v)); // numeric
      pg.types.setTypeParser(20, (v) => parseInt(v, 10)); // int8 / count(*)
      pg.types.setTypeParser(1184, (v) => new Date(v).toISOString()); // timestamptz
      pg.types.setTypeParser(1082, (v) => v); // date stays "YYYY-MM-DD"
      return new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
    }));
  return {
    async query<T>(sql: string, params?: Params) {
      const { text, values } = toPositional(sql, params);
      const res = await (await pool()).query(text, values);
      return res.rows as T[];
    },
    async close() {
      if (poolPromise) await (await poolPromise).end();
    },
  };
}

function dataApiDb(): Db {
  const resourceArn = required("DB_CLUSTER_ARN");
  const secretArn = required("DB_SECRET_ARN");
  const database = process.env.DB_NAME ?? "pol";
  let clientPromise: Promise<{ send: (cmd: unknown) => Promise<any>; Cmd: any }> | undefined;
  const client = () =>
    (clientPromise ??= import("@aws-sdk/client-rds-data").then((m) => {
      const c = new m.RDSDataClient({});
      return { send: (cmd: unknown) => c.send(cmd as any), Cmd: m.ExecuteStatementCommand };
    }));

  return {
    async query<T>(sql: string, params: Params = {}) {
      const names = new Set<string>();
      sql.replace(/(?<![:\w]):([a-zA-Z_]\w*)/g, (_, n: string) => {
        names.add(n);
        return "";
      });
      const parameters = [...names].map((name) => {
        if (!(name in params)) throw new Error(`Missing SQL parameter :${name}`);
        return { name, value: toField(normaliseParam(params[name])) };
      });
      const { send, Cmd } = await client();
      const out = await withResumeRetry(() =>
        send(
          new Cmd({
            resourceArn,
            secretArn,
            database,
            sql,
            parameters,
            formatRecordsAs: "JSON",
            includeResultMetadata: true,
          }),
        ),
      );
      if (!out.formattedRecords) return [];
      const rows = JSON.parse(out.formattedRecords) as Record<string, unknown>[];
      const meta: { label?: string; name?: string; typeName?: string }[] = out.columnMetadata ?? [];
      for (const col of meta) {
        const key = col.label ?? col.name;
        const type = (col.typeName ?? "").toLowerCase();
        if (!key) continue;
        for (const row of rows) row[key] = fromDataApi(row[key], type);
      }
      return rows as T[];
    },
    async close() {},
  };
}

function toField(v: unknown) {
  if (v === null) return { isNull: true };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { longValue: v } : { doubleValue: v };
  return { stringValue: String(v) };
}

function fromDataApi(v: unknown, type: string): unknown {
  if (v === null || v === undefined) return null;
  if (type === "numeric" && typeof v === "string") return parseFloat(v);
  if ((type === "json" || type === "jsonb") && typeof v === "string") return JSON.parse(v);
  if (type === "timestamptz" && typeof v === "string") return new Date(v.replace(" ", "T") + (/[zZ+]/.test(v.slice(10)) ? "" : "Z")).toISOString();
  return v;
}

/** A paused Aurora cluster (min 0 ACU) takes ~15s to resume; the Data API fails until then. */
async function withResumeRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [1000, 2000, 4000, 8000, 10000];
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const resuming = err?.name === "DatabaseResumingException" || /resuming/i.test(err?.message ?? "");
      if (!resuming || attempt >= delays.length) throw err;
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
  }
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}
