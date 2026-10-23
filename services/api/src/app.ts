import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { REACTION_TYPES, TOPICS, type LeaderSummary } from "@pol/shared";
import { authenticate, requireEditor, requireUser, type AppEnv } from "./auth.js";
import { db, one, type Params } from "./db.js";
import { refreshApproval, runScoreEngine } from "./scoreEngine.js";

const q = <T = any>(sql: string, params?: Params) => db().query<T>(sql, params);

export const app = new Hono<AppEnv>();

const origins = (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((s) => s.trim());
app.use("*", cors({ origin: origins, allowHeaders: ["authorization", "content-type", "x-dev-user"] }));
app.use("*", authenticate);

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  if (err instanceof z.ZodError) return c.json({ error: "Invalid request", issues: err.issues }, 400);
  console.error(err);
  return c.json({ error: "Internal error" }, 500);
});

async function body<T extends z.ZodTypeAny>(c: { req: { json: () => Promise<unknown> } }, schema: T): Promise<z.infer<T>> {
  const raw = await c.req.json().catch(() => {
    throw new HTTPException(400, { message: "Body must be JSON" });
  });
  return schema.parse(raw);
}

const uuid = z.string().uuid();
function uuidParam(v: string): string {
  if (!uuid.safeParse(v).success) throw new HTTPException(404, { message: "Not found" });
  return v;
}

// Leaders -------------------------------------------------------------------------

const LEADER_SELECT = `
  select t.id as tenure_id, p.id as person_id, p.name, p.photo_url, t.party, o.office_type, o.title as office_title,
         o.level, t.start_date, s.performance, coalesce(s.confidence, 'insufficient') as confidence, s.approve_pct,
         coalesce(s.verified_residents, 0) as verified_residents, coalesce(s.approval_low_sample, true) as approval_low_sample
  from tenures t
  join people p on p.id = t.person_id
  join offices o on o.id = t.office_id
  left join scorecards s on s.tenure_id = t.id
  where (t.end_date is null or t.end_date > now())`;

const OFFICE_ORDER = `case o.office_type
  when 'councillor' then 1 when 'lga_chair' then 2 when 'state_assembly' then 3 when 'deputy_governor' then 5
  when 'governor' then 4 when 'rep' then 6 when 'senator' then 7 when 'vice_president' then 9 when 'president' then 8 else 10 end`;

function toLeader(r: any): LeaderSummary {
  return {
    tenureId: r.tenure_id,
    personId: r.person_id,
    name: r.name,
    photoUrl: r.photo_url,
    party: r.party,
    officeType: r.office_type,
    officeTitle: r.office_title,
    level: r.level,
    startDate: r.start_date,
    performance: r.performance,
    confidence: r.confidence,
    approvePct: r.approve_pct,
    verifiedResidents: r.verified_residents,
    approvalLowSample: r.approval_low_sample,
  };
}

const WARD_LEADERS_FILTER = `
  and (
    (o.level = 'federal' and o.constituency_id is null)
    or o.constituency_id in (select constituency_id from constituency_wards where ward_id = :ward)
    or o.ward_id = :ward
    or o.lga_id = (select lga_id from wards where id = :ward)
    or o.state_id = (select l.state_id from wards w join lgas l on l.id = w.lga_id where w.id = :ward)
  )`;

/** The state an office belongs to, whichever way it's tied to geography. Null for national offices. */
const OFFICE_STATE = `coalesce(o.state_id,
  (select state_id from constituencies where id = o.constituency_id),
  (select state_id from lgas where id = o.lga_id),
  (select l.state_id from wards w join lgas l on l.id = w.lga_id where w.id = o.ward_id))`;

// Health & geography ---------------------------------------------------------------

app.get("/health", async (c) => {
  await q("select 1 as ok");
  return c.json({ ok: true });
});

app.get("/geo/states", async (c) => c.json(await q(`select id, name, zone from states order by name`)));

app.get("/geo/states/:id/lgas", async (c) =>
  c.json(await q(`select id, name from lgas where state_id = :id order by name`, { id: c.req.param("id") })),
);

app.get("/geo/lgas/:id/wards", async (c) =>
  c.json(await q(`select id, name from wards where lga_id = :id order by name`, { id: c.req.param("id") })),
);

app.get("/wards/:id/leaders", async (c) => {
  const ward = c.req.param("id");
  const place = await one(
    `select w.id as ward_id, w.name as ward_name, l.id as lga_id, l.name as lga_name, s.id as state_id, s.name as state_name
     from wards w join lgas l on l.id = w.lga_id join states s on s.id = l.state_id where w.id = :ward`,
    { ward },
  );
  if (!place) throw new HTTPException(404, { message: "Ward not found" });
  const rows = await q(`${LEADER_SELECT} ${WARD_LEADERS_FILTER} order by ${OFFICE_ORDER}, p.name`, { ward });
  return c.json({ place, leaders: rows.map(toLeader) });
});

app.get("/officials/search", async (c) => {
  const term = (c.req.query("q") ?? "").trim();
  if (term.length < 2) return c.json([]);
  const rows = await q(`${LEADER_SELECT} and (p.name ilike :term or o.title ilike :term) order by p.name limit 20`, {
    term: `%${term}%`,
  });
  return c.json(rows.map(toLeader));
});

async function profile(tenureId: string) {
  const head = await one<any>(
    `${LEADER_SELECT.replace("select t.id", "select p.bio, p.education, p.gender, p.is_fictional, t.end_date, t.how_obtained, s.components, s.computed_at, s.method_version, s.unverified_reactions, o.id as office_id, t.id")}
     and t.id = :id::uuid`,
    { id: tenureId },
  );
  if (!head) return null;
  const [promises, projects, timeline, replies, legislative, history] = await Promise.all([
    q(`select id, text, source_url, made_on, category, status from promises where tenure_id = :id::uuid order by made_on nulls last`, {
      id: tenureId,
    }),
    q(
      `select p.id, p.title, p.topic, p.status, p.verification_level, p.budget_amount::float8 as budget_amount, p.value_tier,
              p.lat, p.lng, p.started_on, l.name as lga_name
       from project_tenures pt join projects p on p.id = pt.project_id left join lgas l on l.id = p.lga_id
       where pt.tenure_id = :id::uuid order by p.started_on desc nulls last`,
      { id: tenureId },
    ),
    q(
      `select n.id, n.headline, n.summary, n.topic, n.claim_type, n.confidence_label, n.published_at
       from news_tenures nt join news_items n on n.id = nt.news_id
       where nt.tenure_id = :id::uuid and n.status = 'published' order by n.published_at desc limit 50`,
      { id: tenureId },
    ),
    q(`select id, news_id, text, created_at from replies where tenure_id = :id::uuid order by created_at desc`, { id: tenureId }),
    one(
      `select bills_sponsored, bills_passed, motions, attendance_pct from legislative_records where tenure_id = :id::uuid`,
      { id: tenureId },
    ),
    q(
      `select performance, approve_pct, confidence, computed_at from score_history
       where tenure_id = :id::uuid order by computed_at desc limit 30`,
      { id: tenureId },
    ),
  ]);
  return {
    ...toLeader(head),
    bio: head.bio,
    education: head.education,
    gender: head.gender,
    isFictional: head.is_fictional,
    endDate: head.end_date,
    howObtained: head.how_obtained,
    methodVersion: head.method_version,
    computedAt: head.computed_at,
    unverifiedReactions: head.unverified_reactions ?? 0,
    components: head.components ?? [],
    promises,
    projects,
    timeline,
    replies,
    legislative: legislative ?? null,
    history,
  };
}

app.get("/officials/:id", async (c) => {
  const p = await profile(uuidParam(c.req.param("id")));
  if (!p) throw new HTTPException(404, { message: "Official not found" });
  const user = c.get("user");
  const mine = user
    ? await one<{ value: number }>(`select value from official_ratings where user_id = :u::uuid and tenure_id = :t::uuid`, {
        u: user.id,
        t: p.tenureId,
      })
    : undefined;
  return c.json({ ...p, myRating: mine?.value ?? null });
});

app.get("/compare", async (c) => {
  const a = c.req.query("a");
  const b = c.req.query("b");
  if (!a || !b) throw new HTTPException(400, { message: "Pass ?a=<tenureId>&b=<tenureId>" });
  const [pa, pb] = await Promise.all([profile(uuidParam(a)), profile(uuidParam(b))]);
  if (!pa || !pb) throw new HTTPException(404, { message: "Official not found" });
  return c.json({ a: pa, b: pb });
});

app.get("/rankings", async (c) => {
  const officeType = c.req.query("officeType") ?? "governor";
  const stateId = c.req.query("stateId");
  const by = c.req.query("by") === "approval" ? "approval" : "performance";
  const params: Params = { officeType };
  let where = ` and o.office_type = :officeType`;
  if (stateId) {
    where += ` and ${OFFICE_STATE} = :stateId`;
    params.stateId = stateId;
  }
  // Only rank scores that rest on enough data (blueprint 13.3).
  where +=
    by === "performance"
      ? ` and s.performance is not null and s.confidence in ('medium', 'high')`
      : ` and s.approve_pct is not null and s.approval_low_sample = false`;
  const order = by === "performance" ? "s.performance desc" : "s.approve_pct desc";
  const rows = await q(`${LEADER_SELECT} ${where} order by ${order}, p.name limit 100`, params);
  return c.json({ officeType, by, results: rows.map(toLeader) });
});

// Feed & news ----------------------------------------------------------------------

const NEWS_SELECT = `
  select n.id, n.headline, n.summary, n.topic, n.claim_type, n.confidence_label, n.status, n.affects_score,
         n.ai_generated, n.published_at, n.created_at,
         coalesce((select json_agg(json_build_object('outlet', s.outlet, 'url', s.url) order by s.published_at)
                   from news_sources s where s.news_id = n.id), '[]'::json) as sources,
         coalesce((select json_agg(json_build_object('tenureId', t.id, 'name', p.name, 'officeTitle', o.title))
                   from news_tenures nt join tenures t on t.id = nt.tenure_id join people p on p.id = t.person_id
                   join offices o on o.id = t.office_id where nt.news_id = n.id), '[]'::json) as officials,
         (select json_object_agg(type, cnt) from (select type, count(*)::int as cnt from reactions r
            where r.news_id = n.id group by type) rc) as reaction_counts
  from news_items n`;

function toNews(r: any) {
  return {
    id: r.id,
    headline: r.headline,
    summary: r.summary,
    topic: r.topic,
    claimType: r.claim_type,
    confidenceLabel: r.confidence_label,
    status: r.status,
    affectsScore: r.affects_score,
    aiGenerated: r.ai_generated,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    sources: r.sources ?? [],
    officials: r.officials ?? [],
    reactionCounts: r.reaction_counts ?? {},
  };
}

app.get("/feed", async (c) => {
  const wardId = c.req.query("wardId");
  const topic = c.req.query("topic");
  const level = c.req.query("level");
  const limit = Math.min(Number(c.req.query("limit") ?? 20) || 20, 50);
  const offset = Math.max(Number(c.req.query("offset") ?? 0) || 0, 0);
  const params: Params = { limit, offset };
  let where = ` where n.status = 'published'`;
  if (topic) {
    where += ` and n.topic = :topic`;
    params.topic = topic;
  }
  if (level) {
    where += ` and exists (select 1 from news_tenures nt join tenures t on t.id = nt.tenure_id join offices o on o.id = t.office_id
                           where nt.news_id = n.id and o.level = :level)`;
    params.level = level;
  }
  let order = `n.published_at desc`;
  if (wardId) {
    // My leaders first, then my state, then everything else (blueprint 6.1).
    params.ward = wardId;
    const linked = `select 1 from news_tenures nt join tenures t on t.id = nt.tenure_id join offices o on o.id = t.office_id
                    where nt.news_id = n.id`;
    order = `case
      when exists (${linked} and ${OFFICE_STATE} is not null ${WARD_LEADERS_FILTER}) then 0
      when exists (${linked} and ${OFFICE_STATE} =
        (select l.state_id from wards w join lgas l on l.id = w.lga_id where w.id = :ward)) then 1
      else 2 end, n.published_at desc`;
  }
  const rows = await q(`${NEWS_SELECT} ${where} order by ${order} limit :limit offset :offset`, params);
  const items = rows.map((r) => ({ ...toNews(r), myReactions: [] as string[] }));
  const user = c.get("user");
  if (user && items.length) {
    // The signed-in user's own reactions, so cards don't each need a request.
    const mine = await q<{ news_id: string; type: string }>(
      `select news_id, type from reactions where user_id = :u::uuid
       and news_id in (select x::uuid from jsonb_array_elements_text(:ids::jsonb) as x)`,
      { u: user.id, ids: items.map((i) => i.id) },
    );
    for (const m of mine) items.find((i) => i.id === m.news_id)?.myReactions.push(m.type);
  }
  return c.json({ items, nextOffset: rows.length === limit ? offset + limit : null });
});

app.get("/news/:id", async (c) => {
  const id = uuidParam(c.req.param("id"));
  const row = await one(`${NEWS_SELECT} where n.id = :id::uuid`, { id });
  const user = c.get("user");
  if (!row || (row.status !== "published" && user?.role !== "editor" && user?.role !== "admin"))
    throw new HTTPException(404, { message: "Item not found" });
  const [replies, projects, mine] = await Promise.all([
    q(
      `select r.id, r.text, r.created_at, p.name, o.title as office_title from replies r
       join tenures t on t.id = r.tenure_id join people p on p.id = t.person_id join offices o on o.id = t.office_id
       where r.news_id = :id::uuid order by r.created_at`,
      { id },
    ),
    q(
      `select p.id, p.title, p.status, p.verification_level from news_projects np join projects p on p.id = np.project_id
       where np.news_id = :id::uuid`,
      { id },
    ),
    user
      ? q<{ type: string }>(`select type from reactions where news_id = :id::uuid and user_id = :u::uuid`, { id, u: user.id })
      : Promise.resolve([]),
  ]);
  return c.json({ ...toNews(row), replies, projects, myReactions: mine.map((m) => m.type) });
});

const reactionSchema = z.object({ type: z.enum(REACTION_TYPES as [string, ...string[]]) });

app.post("/news/:id/reactions", async (c) => {
  const user = requireUser(c);
  const id = uuidParam(c.req.param("id"));
  const { type } = await body(c, reactionSchema);
  const item = await one(`select status from news_items where id = :id::uuid`, { id });
  if (!item || item.status !== "published") throw new HTTPException(404, { message: "Item not found" });

  if (type === "up" || type === "down") {
    // Thumbs up and down are mutually exclusive on an item.
    await q(`delete from reactions where user_id = :u::uuid and news_id = :id::uuid and type = :other`, {
      u: user.id,
      id,
      other: type === "up" ? "down" : "up",
    });
  }
  await q(
    `insert into reactions (user_id, news_id, type) values (:u::uuid, :id::uuid, :type) on conflict do nothing`,
    { u: user.id, id, type },
  );

  if (type === "up" || type === "down") {
    // Item reactions roll up into the user's single rating of each linked official (blueprint 8.3).
    const linked = await q<{ tenure_id: string }>(
      `insert into official_ratings (user_id, tenure_id, value, updated_at)
       select :u::uuid, tenure_id, :value::smallint, now() from news_tenures where news_id = :id::uuid
       on conflict (user_id, tenure_id) do update set value = excluded.value, updated_at = now()
       returning tenure_id`,
      { u: user.id, id, value: type === "up" ? 1 : -1 },
    );
    await Promise.all(linked.map((l) => refreshApproval(l.tenure_id)));
  }
  return c.json({ ok: true });
});

app.delete("/news/:id/reactions/:type", async (c) => {
  const user = requireUser(c);
  const id = uuidParam(c.req.param("id"));
  await q(`delete from reactions where user_id = :u::uuid and news_id = :id::uuid and type = :type`, {
    u: user.id,
    id,
    type: c.req.param("type"),
  });
  return c.json({ ok: true });
});

const ratingSchema = z.object({ value: z.union([z.literal(1), z.literal(-1)]) });

app.put("/officials/:id/rating", async (c) => {
  const user = requireUser(c);
  const id = uuidParam(c.req.param("id"));
  const { value } = await body(c, ratingSchema);
  const exists = await one(`select 1 as ok from tenures where id = :id::uuid`, { id });
  if (!exists) throw new HTTPException(404, { message: "Official not found" });
  await q(
    `insert into official_ratings (user_id, tenure_id, value, updated_at) values (:u::uuid, :id::uuid, :value, now())
     on conflict (user_id, tenure_id) do update set value = excluded.value, updated_at = now()`,
    { u: user.id, id, value },
  );
  await refreshApproval(id);
  return c.json({ ok: true });
});

app.delete("/officials/:id/rating", async (c) => {
  const user = requireUser(c);
  const id = uuidParam(c.req.param("id"));
  await q(`delete from official_ratings where user_id = :u::uuid and tenure_id = :id::uuid`, { u: user.id, id });
  await refreshApproval(id);
  return c.json({ ok: true });
});

// Me -------------------------------------------------------------------------------

app.get("/me", (c) => c.json(requireUser(c)));

const meSchema = z.object({
  homeWardId: z.string().min(1).nullable().optional(),
  language: z.enum(["en", "pcm", "ha", "yo", "ig"]).optional(),
});

app.put("/me", async (c) => {
  const user = requireUser(c);
  const input = await body(c, meSchema);
  if (input.homeWardId) {
    const ward = await one(`select 1 as ok from wards where id = :id`, { id: input.homeWardId });
    if (!ward) throw new HTTPException(400, { message: "Unknown ward" });
  }
  const row = await one(
    `update users set home_ward_id = :ward, language = :lang where id = :id::uuid
     returning id, role, verification_level, home_ward_id, language`,
    {
      id: user.id,
      ward: input.homeWardId === undefined ? user.homeWardId : input.homeWardId,
      lang: input.language ?? user.language,
    },
  );
  return c.json({
    id: row!.id,
    role: row!.role,
    verificationLevel: row!.verification_level,
    homeWardId: row!.home_ward_id,
    language: row!.language,
  });
});

// Editor ---------------------------------------------------------------------------

/** Published items with this many "disputed" reactions from verified users go back to the queue. */
const DISPUTE_THRESHOLD = 10;

app.get("/editor/queue", async (c) => {
  requireEditor(c);
  const [pending, disputed] = await Promise.all([
    q(`${NEWS_SELECT} where n.status = 'pending' order by n.created_at desc limit 100`),
    q(
      `${NEWS_SELECT} where n.status = 'published' and n.confidence_label <> 'disputed' and (
         select count(*) from reactions r join users u on u.id = r.user_id
         where r.news_id = n.id and r.type = 'disputed' and u.verification_level <> 'unverified') >= :threshold
       order by n.published_at desc limit 100`,
      { threshold: DISPUTE_THRESHOLD },
    ),
  ]);
  return c.json({ pending: pending.map(toNews), disputed: disputed.map(toNews), disputeThreshold: DISPUTE_THRESHOLD });
});

const newsInput = z.object({
  headline: z.string().min(5).max(300),
  summary: z.string().min(10).max(2000),
  topic: z.enum(TOPICS as [string, ...string[]]),
  claimType: z.enum(["announcement", "contract_awarded", "completed", "disputed", "general"]),
  confidenceLabel: z.enum(["announced", "reported", "verified", "disputed"]),
  affectsScore: z.boolean().default(false),
  sources: z.array(z.object({ outlet: z.string().min(1), url: z.string().url() })).min(1),
  tenureIds: z.array(uuid).default([]),
  projectIds: z.array(uuid).default([]),
});

app.post("/editor/news", async (c) => {
  const editor = requireEditor(c);
  const n = await body(c, newsInput);
  const row = await one<{ id: string }>(
    `with n as (
       insert into news_items (headline, summary, topic, claim_type, confidence_label, affects_score, editor_id)
       values (:headline, :summary, :topic, :claimType, :confidenceLabel, :affectsScore, :editor::uuid) returning id),
     s as (insert into news_sources (news_id, outlet, url, published_at)
           select n.id, x.outlet, x.url, now() from n, jsonb_to_recordset(:sources::jsonb) as x(outlet text, url text)),
     t as (insert into news_tenures (news_id, tenure_id)
           select n.id, x::uuid from n, jsonb_array_elements_text(:tenureIds::jsonb) as x),
     p as (insert into news_projects (news_id, project_id)
           select n.id, x::uuid from n, jsonb_array_elements_text(:projectIds::jsonb) as x)
     select id from n`,
    { ...n, editor: editor.id },
  );
  await audit(editor.id, "create", "news_item", row!.id, { headline: n.headline });
  return c.json({ id: row!.id }, 201);
});

// Written out rather than newsInput.partial(): partial() keeps .default() values, so an edit that
// only changes the label would silently reset affectsScore and unlink every official.
const newsPatch = z.object({
  headline: newsInput.shape.headline.optional(),
  summary: newsInput.shape.summary.optional(),
  topic: newsInput.shape.topic.optional(),
  claimType: newsInput.shape.claimType.optional(),
  confidenceLabel: newsInput.shape.confidenceLabel.optional(),
  affectsScore: z.boolean().optional(),
  tenureIds: z.array(uuid).optional(),
});

app.patch("/editor/news/:id", async (c) => {
  const editor = requireEditor(c);
  const id = uuidParam(c.req.param("id"));
  const patch = await body(c, newsPatch);
  const cols: Record<string, string> = {
    headline: "headline",
    summary: "summary",
    topic: "topic",
    claimType: "claim_type",
    confidenceLabel: "confidence_label",
    affectsScore: "affects_score",
  };
  const sets = Object.keys(cols)
    .filter((k) => (patch as any)[k] !== undefined)
    .map((k) => `${cols[k]} = :${k}`);
  const params: Params = { id, ...patch };
  if (sets.length) await q(`update news_items set ${sets.join(", ")} where id = :id::uuid`, params);
  if (patch.tenureIds) {
    await q(`delete from news_tenures where news_id = :id::uuid`, { id });
    await q(
      `insert into news_tenures (news_id, tenure_id)
       select :id::uuid, x::uuid from jsonb_array_elements_text(:tenureIds::jsonb) as x on conflict do nothing`,
      { id, tenureIds: patch.tenureIds },
    );
  }
  await audit(editor.id, "update", "news_item", id, patch);
  return c.json({ ok: true });
});

for (const action of ["publish", "reject"] as const) {
  app.post(`/editor/news/:id/${action}`, async (c) => {
    const editor = requireEditor(c);
    const id = uuidParam(c.req.param("id"));
    const row = await one(
      action === "publish"
        ? `update news_items set status = 'published', published_at = coalesce(published_at, now()), editor_id = :e::uuid
           where id = :id::uuid returning id`
        : `update news_items set status = 'rejected', editor_id = :e::uuid where id = :id::uuid returning id`,
      { id, e: editor.id },
    );
    if (!row) throw new HTTPException(404, { message: "Item not found" });
    await audit(editor.id, action, "news_item", id);
    return c.json({ ok: true });
  });
}

app.post("/editor/scores/recompute", async (c) => {
  const editor = requireEditor(c);
  return c.json(await runScoreEngine(`editor:${editor.id}`));
});

app.get("/editor/audit", async (c) => {
  requireEditor(c);
  return c.json(await q(`select id, actor, action, entity, entity_id, detail, at from audit_log order by at desc limit 100`));
});

async function audit(actor: string, action: string, entity: string, entityId: string, detail?: unknown) {
  await q(
    `insert into audit_log (actor, action, entity, entity_id, detail) values (:actor, :action, :entity, :entityId, :detail::jsonb)`,
    { actor, action, entity, entityId, detail: detail ?? null },
  );
}
