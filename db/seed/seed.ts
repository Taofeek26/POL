// Fills an empty database with FAKE data so the whole product can be tested end to end.
// States, their zones and the office structure are real. Every person, party, outlet, LGA name,
// ward, project and news item is invented, and every person is marked is_fictional.
//   pnpm db:seed           (after pnpm db:migrate)
//   pnpm db:reset          (drop, migrate, seed)
import { randomUUID } from "node:crypto";
import { db } from "../../services/api/src/db.ts";
import { runScoreEngine } from "../../services/api/src/scoreEngine.ts";

const q = db().query.bind(db());

// Deterministic randomness so every seed produces the same dataset shape.
let s = 20270529;
const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
const chance = (p: number) => rand() < p;
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const STATES: [string, string, string][] = [
  ["abia", "Abia", "South East"], ["adamawa", "Adamawa", "North East"], ["akwa-ibom", "Akwa Ibom", "South South"],
  ["anambra", "Anambra", "South East"], ["bauchi", "Bauchi", "North East"], ["bayelsa", "Bayelsa", "South South"],
  ["benue", "Benue", "North Central"], ["borno", "Borno", "North East"], ["cross-river", "Cross River", "South South"],
  ["delta", "Delta", "South South"], ["ebonyi", "Ebonyi", "South East"], ["edo", "Edo", "South South"],
  ["ekiti", "Ekiti", "South West"], ["enugu", "Enugu", "South East"], ["gombe", "Gombe", "North East"],
  ["imo", "Imo", "South East"], ["jigawa", "Jigawa", "North West"], ["kaduna", "Kaduna", "North West"],
  ["kano", "Kano", "North West"], ["katsina", "Katsina", "North West"], ["kebbi", "Kebbi", "North West"],
  ["kogi", "Kogi", "North Central"], ["kwara", "Kwara", "North Central"], ["lagos", "Lagos", "South West"],
  ["nasarawa", "Nasarawa", "North Central"], ["niger", "Niger", "North Central"], ["ogun", "Ogun", "South West"],
  ["ondo", "Ondo", "South West"], ["osun", "Osun", "South West"], ["oyo", "Oyo", "South West"],
  ["plateau", "Plateau", "North Central"], ["rivers", "Rivers", "South South"], ["sokoto", "Sokoto", "North West"],
  ["taraba", "Taraba", "North East"], ["yobe", "Yobe", "North East"], ["zamfara", "Zamfara", "North West"],
  ["fct", "Federal Capital Territory", "North Central"],
];
// Most fake users live here, so these states' officials pass the 100-verified-residents bar.
const POPULOUS = ["lagos", "kano", "rivers"];

const FIRST = ["Adaeze", "Bello", "Chinedu", "Damilola", "Emeka", "Fatima", "Garba", "Halima", "Ibrahim", "Jumoke",
  "Kelechi", "Ladi", "Musa", "Ngozi", "Olumide", "Patience", "Rasheed", "Sadiya", "Tunde", "Uche", "Yetunde", "Zainab",
  "Aminu", "Bisi", "Chiamaka", "Danjuma", "Efosa", "Funke", "Hauwa", "Ikenna", "Kunle", "Nneka", "Sani", "Tamuno"];
const LAST = ["Abiodun", "Bakare", "Chukwu", "Dauda", "Eze", "Fashola", "Gambo", "Haruna", "Igwe", "Jimoh", "Kalu",
  "Lawal", "Mohammed", "Nwosu", "Okafor", "Popoola", "Quadri", "Sule", "Tanko", "Umar", "Wike", "Yusuf", "Zubairu",
  "Adeyemi", "Bassey", "Ekpo", "Ibekwe", "Ogunleye", "Usman", "Danladi"];
const PARTIES = ["Sample Party A", "Sample Party B", "Sample Party C", "Sample Party D"];
const OUTLETS = ["Sample Daily", "Example Times", "Demo Gazette", "Test Herald", "Mock Tribune", "Placeholder Post"];
const TOPICS = ["roads", "health", "education", "water", "security", "power", "agriculture", "governance"] as const;
const LGA_SUFFIX = ["Central", "East", "West"];

type Row = Record<string, unknown>;
const tables: Record<string, Row[]> = {};
const add = (table: string, row: Row) => (tables[table] ??= []).push(row);

// Geography + constituencies -------------------------------------------------------------
const wardsByState = new Map<string, string[]>();
for (const [id, name, zone] of STATES) {
  add("states", { id, name, zone });
  const isFct = id === "fct";
  const wards: string[] = [];
  const lgaCount = isFct ? 2 : 3;
  for (let i = 0; i < lgaCount; i++) {
    const lgaId = `${id}-${i + 1}`;
    add("lgas", { id: lgaId, state_id: id, name: `${name} ${LGA_SUFFIX[i]} (sample LGA)` });
    // Senatorial district i covers LGA i (FCT has a single district).
    const sen = `${id}-sen-${isFct ? 1 : i + 1}`;
    if (!isFct || i === 0) add("constituencies", { id: sen, kind: "senatorial", state_id: id, name: `${name} ${isFct ? "" : LGA_SUFFIX[i] + " "}Senatorial District`.replace("  ", " ") });
    const fed = `${lgaId}-fed`;
    add("constituencies", { id: fed, kind: "federal", state_id: id, name: `${name} ${LGA_SUFFIX[i]} Federal Constituency` });
    const st = `${lgaId}-st`;
    if (!isFct) add("constituencies", { id: st, kind: "state", state_id: id, name: `${name} ${LGA_SUFFIX[i]} State Constituency` });
    for (let w = 0; w < 4; w++) {
      const wardId = `${lgaId}-w${w + 1}`;
      add("wards", { id: wardId, lga_id: lgaId, name: `Ward ${w + 1}` });
      wards.push(wardId);
      add("constituency_wards", { constituency_id: sen, ward_id: wardId });
      add("constituency_wards", { constituency_id: fed, ward_id: wardId });
      if (!isFct) add("constituency_wards", { constituency_id: st, ward_id: wardId });
    }
  }
  wardsByState.set(id, wards);
}

// Offices, people, tenures -----------------------------------------------------------------
type Tenure = { id: string; officeType: string; level: string; quality: number; popularity: number; stateId: string | null; wards: string[] };
const tenures: Tenure[] = [];
const allWards = [...wardsByState.values()].flat();

function office(o: { id: string; type: string; level: string; title: string; state_id?: string; lga_id?: string; ward_id?: string; constituency_id?: string }, stateId: string | null, wards: string[]) {
  add("offices", { id: o.id, office_type: o.type, level: o.level, title: o.title, state_id: o.state_id ?? null, lga_id: o.lga_id ?? null, ward_id: o.ward_id ?? null, constituency_id: o.constituency_id ?? null });
  const personId = randomUUID();
  const gender = chance(0.2) ? "female" : "male";
  add("people", { id: personId, name: `${pick(FIRST)} ${pick(LAST)}`, gender, is_fictional: true, bio: "Fictional official generated for testing.", education: pick(["B.Sc.", "LL.B.", "M.Sc.", "HND", "MBA"]) });
  const tenureId = randomUUID();
  add("tenures", { id: tenureId, person_id: personId, office_id: o.id, party: pick(PARTIES), start_date: "2023-05-29", how_obtained: "elected" });
  tenures.push({ id: tenureId, officeType: o.type, level: o.level, quality: rand(), popularity: 0.2 + rand() * 0.6, stateId, wards });
}

office({ id: "president", type: "president", level: "federal", title: "President of Nigeria" }, null, allWards);
office({ id: "vice-president", type: "vice_president", level: "federal", title: "Vice President of Nigeria" }, null, allWards);
for (const [id, name] of STATES) {
  const wards = wardsByState.get(id)!;
  if (id !== "fct") {
    office({ id: `${id}-governor`, type: "governor", level: "state", title: `Governor of ${name} State`, state_id: id }, id, wards);
    office({ id: `${id}-deputy-governor`, type: "deputy_governor", level: "state", title: `Deputy Governor of ${name} State`, state_id: id }, id, wards);
  }
}
for (const c of tables.constituencies) {
  const wards = tables.constituency_wards.filter((cw) => cw.constituency_id === c.id).map((cw) => cw.ward_id as string);
  const map = { senatorial: ["senator", "federal", "Senator"], federal: ["rep", "federal", "Member, House of Reps"], state: ["state_assembly", "state", "Member, State Assembly"] } as const;
  const [type, level, label] = map[c.kind as keyof typeof map];
  office({ id: `${c.id}-office`, type, level, title: `${label} — ${c.name}`, constituency_id: c.id as string }, c.state_id as string, wards);
}
for (const l of tables.lgas) {
  const wards = tables.wards.filter((w) => w.lga_id === l.id).map((w) => w.id as string);
  office({ id: `${l.id}-chair`, type: "lga_chair", level: "lga", title: `Chairman, ${l.name}`, lga_id: l.id as string }, l.state_id as string, wards);
  for (const w of wards) {
    office({ id: `${w}-councillor`, type: "councillor", level: "ward", title: `Councillor, ${tables.wards.find((x) => x.id === w)!.name}, ${l.name}`, ward_id: w }, l.state_id as string, [w]);
  }
}

// Records: projects, promises, budgets, legislative, FOI, engagement ---------------------------
const isExec = (t: Tenure) => ["president", "vice_president", "governor", "deputy_governor", "lga_chair"].includes(t.officeType);
const isLeg = (t: Tenure) => ["senator", "rep", "state_assembly"].includes(t.officeType);
const projectsByTenure = new Map<string, string[]>();

for (const t of tenures) {
  // ~12% of officials have almost no record, so "Insufficient data" shows up.
  const sparse = chance(0.12) && t.officeType !== "president";
  const good = t.quality;
  const nProjects = sparse ? 0 : isExec(t) ? int(3, 10) : isLeg(t) ? int(1, 4) : int(1, 3);
  for (let i = 0; i < nProjects; i++) {
    const id = randomUUID();
    const r = rand();
    const status = r < good * 0.6 ? "completed_working" : r < good * 0.75 ? "ongoing" : pick(["completed_not_working", "stalled", "abandoned", "never_started", "ongoing"]);
    const ward = pick(t.wards);
    const lga = ward.replace(/-w\d+$/, "");
    const topic = pick(TOPICS);
    add("projects", {
      id, title: `${topic[0].toUpperCase() + topic.slice(1)} project ${i + 1} (sample)`, topic,
      state_id: lga.replace(/-\d+$/, ""), lga_id: lga, ward_id: ward,
      lat: 4 + rand() * 9, lng: 3 + rand() * 11, budget_amount: int(5, 5000) * 1_000_000, value_tier: int(1, 5),
      funding_source: pick(["Federal", "State", "LGA", "Constituency"]), contractor: "Sample Contractors Ltd",
      status, verification_level: pick(["announced", "reported", "reported", "verified", "verified", "disputed"]), started_on: daysAgo(int(60, 1100)).slice(0, 10),
    });
    add("project_tenures", { project_id: id, tenure_id: t.id });
    (projectsByTenure.get(t.id) ?? projectsByTenure.set(t.id, []).get(t.id)!).push(id);
  }
  const nPromises = sparse ? int(0, 1) : isExec(t) ? int(5, 15) : int(3, 8);
  for (let i = 0; i < nPromises; i++) {
    const r = rand();
    const status = r < 0.15 ? "not_rated" : r < 0.15 + good * 0.4 ? "kept" : r < 0.75 ? "in_progress" : pick(["stalled", "broken"]);
    add("promises", { id: randomUUID(), tenure_id: t.id, text: `Sample promise ${i + 1}: improve ${pick(TOPICS)} services`, category: pick(TOPICS), status, made_on: "2023-05-29", source_url: "https://example.com/manifesto" });
  }
  if (!sparse && !isLeg(t)) {
    for (const year of [2023, 2024, 2025]) add("budget_records", { tenure_id: t.id, year, published: chance(0.4 + good * 0.5), capital_implementation_pct: Math.round(20 + good * 60 + rand() * 20) });
  }
  if (!sparse && isLeg(t)) {
    add("legislative_records", { tenure_id: t.id, bills_sponsored: int(0, 12), bills_passed: int(0, 4), motions: int(0, 20), attendance_pct: Math.round(40 + good * 50 + rand() * 10) });
  }
  if (!sparse && t.officeType !== "president" && t.officeType !== "vice_president") {
    const n = int(0, 4);
    for (let i = 0; i < n; i++) add("foi_requests", { id: randomUUID(), tenure_id: t.id, subject: "Request for budget and project list", sent_on: daysAgo(int(90, 600)).slice(0, 10), responded_on: chance(good) ? daysAgo(int(10, 80)).slice(0, 10) : null });
  }
  if (!sparse && (isLeg(t) || t.officeType === "councillor")) add("engagements", { tenure_id: t.id, town_halls: int(0, 12) });
}

// News ----------------------------------------------------------------------------------------
const newsIds: { id: string; published: boolean; tenures: string[] }[] = [];
const newsworthy = tenures.filter((t) => t.officeType !== "councillor" || chance(0.3));
for (let i = 0; i < 600; i++) {
  const t = pick(newsworthy);
  const linked = [t.id];
  if (chance(0.15)) linked.push(pick(newsworthy).id);
  const id = randomUUID();
  const published = i >= 40; // first 40 wait in the editor queue
  const label = pick(["announced", "reported", "reported", "verified", "disputed"]);
  const topic = pick(TOPICS);
  add("news_items", {
    id, headline: `Sample story ${i + 1}: ${topic} update`, summary: `A fictional ${topic} story generated for testing the feed. Linked to ${linked.length} official(s).`,
    topic, claim_type: label === "verified" ? "completed" : label === "disputed" ? "disputed" : pick(["announcement", "contract_awarded", "general"]),
    confidence_label: label, status: published ? "published" : "pending", affects_score: chance(0.4), ai_generated: chance(0.5),
    published_at: published ? daysAgo(int(0, 500)) : null,
  });
  const nSources = int(1, 4);
  for (let k = 0; k < nSources; k++) add("news_sources", { id: randomUUID(), news_id: id, outlet: OUTLETS[(i + k) % OUTLETS.length], url: `https://example.com/news/${i + 1}/${k + 1}`, published_at: daysAgo(int(0, 500)) });
  for (const tid of new Set(linked)) add("news_tenures", { news_id: id, tenure_id: tid });
  const proj = projectsByTenure.get(t.id);
  if (proj && chance(0.4)) add("news_projects", { news_id: id, project_id: pick(proj) });
  newsIds.push({ id, published, tenures: [...new Set(linked)] });
}

// Users, ratings, reactions ---------------------------------------------------------------
const users: { id: string; ward: string; verification: string; flagged: boolean }[] = [];
const dev = [
  { sub: "dev-citizen", role: "citizen", verification: "phone", ward: "lagos-1-w1" },
  { sub: "dev-unverified", role: "citizen", verification: "unverified", ward: "kano-1-w1" },
  { sub: "dev-editor", role: "editor", verification: "kyc", ward: "fct-1-w1" },
  { sub: "dev-admin", role: "admin", verification: "kyc", ward: "fct-1-w2" },
];
for (const d of dev) add("users", { id: randomUUID(), cognito_sub: d.sub, role: d.role, verification_level: d.verification, home_ward_id: d.ward, language: "en", trust_score: 0, flagged: false });

for (let i = 0; i < 6000; i++) {
  const stateId = chance(0.55) ? pick(POPULOUS) : pick(STATES)[0];
  const ward = pick(wardsByState.get(stateId)!);
  const r = rand();
  const verification = r < 0.3 ? "unverified" : r < 0.9 ? "phone" : "kyc";
  const u = { id: randomUUID(), ward, verification, flagged: chance(0.02) };
  users.push(u);
  add("users", { id: u.id, cognito_sub: `seed-${i}`, verification_level: verification, home_ward_id: ward, language: "en", trust_score: 0, flagged: u.flagged, role: "citizen" });
}

const leadersOf = (ward: string) => tenures.filter((t) => t.wards.includes(ward));
const leaderCache = new Map<string, Tenure[]>();
const tenureById = new Map(tenures.map((t) => [t.id, t]));
for (const u of users) {
  const mine = leaderCache.get(u.ward) ?? leaderCache.set(u.ward, leadersOf(u.ward)).get(u.ward)!;
  const rated = new Set<string>();
  for (const t of mine) {
    const p = t.level === "federal" && t.wards === allWards ? 0.7 : t.officeType === "councillor" ? 0.3 : 0.5;
    if (chance(p)) rated.add(t.id);
  }
  if (chance(0.2)) rated.add(pick(tenures).id); // the occasional non-resident opinion
  for (const tid of rated) {
    const t = tenureById.get(tid)!;
    add("official_ratings", { user_id: u.id, tenure_id: tid, value: chance(t.popularity) ? 1 : -1, updated_at: daysAgo(int(0, 540)) });
  }
}

const published = newsIds.filter((n) => n.published);
for (let i = 0; i < 8000; i++) {
  const u = pick(users);
  const n = pick(published);
  add("reactions", { user_id: u.id, news_id: n.id, type: pick(["up", "down", "impactful", "evidence", "up", "down"]), created_at: daysAgo(int(0, 400)) });
}
// A handful of items crowd-disputed past the threshold, so the editor queue has something to review.
for (const n of published.slice(0, 5)) {
  for (const u of users.filter((x) => x.verification !== "unverified").slice(0, 12)) add("reactions", { user_id: u.id, news_id: n.id, type: "disputed", created_at: daysAgo(1) });
}

// Write --------------------------------------------------------------------------------
const COLUMNS: Record<string, string> = {
  states: "id text, name text, zone text",
  lgas: "id text, state_id text, name text",
  wards: "id text, lga_id text, name text",
  constituencies: "id text, kind text, state_id text, name text",
  constituency_wards: "constituency_id text, ward_id text",
  offices: "id text, office_type text, level text, title text, state_id text, lga_id text, ward_id text, constituency_id text",
  people: "id uuid, name text, gender text, is_fictional boolean, bio text, education text",
  tenures: "id uuid, person_id uuid, office_id text, party text, start_date date, how_obtained text",
  projects: "id uuid, title text, topic text, state_id text, lga_id text, ward_id text, lat float8, lng float8, budget_amount numeric, value_tier int, funding_source text, contractor text, status text, verification_level text, started_on date",
  project_tenures: "project_id uuid, tenure_id uuid",
  promises: "id uuid, tenure_id uuid, text text, category text, status text, made_on date, source_url text",
  budget_records: "tenure_id uuid, year int, published boolean, capital_implementation_pct numeric",
  legislative_records: "tenure_id uuid, bills_sponsored int, bills_passed int, motions int, attendance_pct numeric",
  foi_requests: "id uuid, tenure_id uuid, subject text, sent_on date, responded_on date",
  engagements: "tenure_id uuid, town_halls int",
  news_items: "id uuid, headline text, summary text, topic text, claim_type text, confidence_label text, status text, affects_score boolean, ai_generated boolean, published_at timestamptz",
  news_sources: "id uuid, news_id uuid, outlet text, url text, published_at timestamptz",
  news_tenures: "news_id uuid, tenure_id uuid",
  news_projects: "news_id uuid, project_id uuid",
  users: "id uuid, cognito_sub text, role text, verification_level text, home_ward_id text, language text, trust_score numeric, flagged boolean",
  official_ratings: "user_id uuid, tenure_id uuid, value smallint, updated_at timestamptz",
  reactions: "user_id uuid, news_id uuid, type text, created_at timestamptz",
};

const target = process.env.DB_DRIVER === "data-api" ? `Aurora ${process.env.DB_CLUSTER_ARN}` : process.env.DATABASE_URL;
console.log(`Seeding ${target}`);
const existing = await q<{ n: number }>(`select count(*)::int as n from states`);
if (existing[0].n > 0) {
  console.error("Database already has data. Run `pnpm db:reset` to start over.");
  process.exit(1);
}

// Data API requests are size-limited, so send modest chunks there.
const CHUNK = process.env.DB_DRIVER === "data-api" ? 150 : 2000;
for (const [table, cols] of Object.entries(COLUMNS)) {
  const rows = tables[table] ?? [];
  const names = cols.split(",").map((c) => c.trim().split(" ")[0]).join(", ");
  for (let i = 0; i < rows.length; i += CHUNK) {
    await q(`insert into ${table} (${names}) select ${names} from jsonb_to_recordset(:rows::jsonb) as x(${cols}) on conflict do nothing`, {
      rows: rows.slice(i, i + CHUNK),
    });
  }
  console.log(`  ${table.padEnd(20)} ${rows.length}`);
}

const { scored } = await runScoreEngine("seed");
console.log(`Scored ${scored} officials. Done.`);
await db().close();
