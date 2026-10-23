// Loads every active tenure's record, computes scores and writes scorecards + history.
// Runs nightly from EventBridge, or on demand from the editor dashboard / `pnpm scores`.
import { METHOD_VERSION, type OfficeType } from "@pol/shared";
import { db } from "./db.js";
import {
  buildPeerTable,
  computeApproval,
  computePerformance,
  type RatingInput,
  type TenureRecord,
} from "./scoring.js";

const RESIDENT_SQL = `
  case
    when u.home_ward_id is null then false
    when o.constituency_id is not null then exists (
      select 1 from constituency_wards cw where cw.constituency_id = o.constituency_id and cw.ward_id = u.home_ward_id)
    when o.ward_id is not null then o.ward_id = u.home_ward_id
    when o.lga_id is not null then w.lga_id = o.lga_id
    when o.state_id is not null then l.state_id = o.state_id
    when o.level = 'federal' then true
    else false
  end`;

// Ratings grouped per day so the result stays small (the Data API caps responses at 1 MB).
const RATINGS_SQL = `
  select r.tenure_id, r.value::int as value, u.verification_level, u.flagged,
         (${RESIDENT_SQL}) as is_resident,
         date_trunc('day', r.updated_at) as day, count(*)::int as n
  from official_ratings r
  join users u on u.id = r.user_id
  join tenures t on t.id = r.tenure_id
  join offices o on o.id = t.office_id
  left join wards w on w.id = u.home_ward_id
  left join lgas l on l.id = w.lga_id`;

type RatingRow = {
  tenure_id: string;
  value: -1 | 1;
  verification_level: RatingInput["verification"];
  flagged: boolean;
  is_resident: boolean;
  day: string;
  n: number;
};

const toRating = (r: RatingRow): RatingInput => ({
  value: r.value,
  updatedAt: r.day,
  verification: r.verification_level,
  flagged: r.flagged,
  isResident: r.is_resident,
  count: r.n,
});

export async function runScoreEngine(actor = "score-engine"): Promise<{ scored: number }> {
  const q = db().query.bind(db());
  const [tenures, projects, promises, budgets, legislative, foi, engagements, ratings] = await Promise.all([
    q<{ id: string; office_type: OfficeType }>(
      `select t.id, o.office_type from tenures t join offices o on o.id = t.office_id
       where t.end_date is null or t.end_date > now()`,
    ),
    q<{ tenure_id: string; status: any; verification_level: any; value_tier: number }>(
      `select pt.tenure_id, p.status, p.verification_level, p.value_tier
       from project_tenures pt join projects p on p.id = pt.project_id`,
    ),
    q<{ tenure_id: string; status: any }>(`select tenure_id, status from promises`),
    q<{ tenure_id: string; published: boolean; capital_implementation_pct: number | null }>(
      `select tenure_id, published, capital_implementation_pct from budget_records`,
    ),
    q<{ tenure_id: string; bills_sponsored: number; bills_passed: number; motions: number; attendance_pct: number | null }>(
      `select tenure_id, bills_sponsored, bills_passed, motions, attendance_pct from legislative_records`,
    ),
    q<{ tenure_id: string; sent: number; responded: number }>(
      `select tenure_id, count(*)::int as sent, count(responded_on)::int as responded from foi_requests group by tenure_id`,
    ),
    q<{ tenure_id: string; town_halls: number }>(`select tenure_id, town_halls from engagements`),
    q<RatingRow>(`${RATINGS_SQL} group by 1, 2, 3, 4, 5, 6`),
  ]);

  const records = new Map<string, TenureRecord>();
  for (const t of tenures) {
    records.set(t.id, {
      tenureId: t.id,
      officeType: t.office_type,
      projects: [],
      promises: [],
      budgets: [],
      legislative: null,
      foi: { sent: 0, responded: 0 },
      townHalls: null,
    });
  }
  for (const p of projects)
    records.get(p.tenure_id)?.projects.push({ status: p.status, verification: p.verification_level, valueTier: p.value_tier });
  for (const p of promises) records.get(p.tenure_id)?.promises.push({ status: p.status });
  for (const b of budgets)
    records.get(b.tenure_id)?.budgets.push({ published: b.published, capitalImplementationPct: b.capital_implementation_pct });
  for (const l of legislative) {
    const r = records.get(l.tenure_id);
    if (r)
      r.legislative = {
        billsSponsored: l.bills_sponsored,
        billsPassed: l.bills_passed,
        motions: l.motions,
        attendancePct: l.attendance_pct,
      };
  }
  for (const f of foi) {
    const r = records.get(f.tenure_id);
    if (r) r.foi = { sent: f.sent, responded: f.responded };
  }
  for (const e of engagements) {
    const r = records.get(e.tenure_id);
    if (r) r.townHalls = e.town_halls;
  }
  const ratingsByTenure = new Map<string, RatingInput[]>();
  for (const r of ratings) {
    const list = ratingsByTenure.get(r.tenure_id) ?? [];
    list.push(toRating(r));
    ratingsByTenure.set(r.tenure_id, list);
  }

  const peers = buildPeerTable([...records.values()]);
  const now = new Date();
  const rows = [...records.values()].map((r) => {
    const perf = computePerformance(r, peers);
    const appr = computeApproval(ratingsByTenure.get(r.tenureId) ?? [], now);
    return {
      tenure_id: r.tenureId,
      method_version: METHOD_VERSION,
      performance: perf.performance,
      confidence: perf.confidence,
      components: perf.components,
      approve_pct: appr.approvePct,
      verified_residents: appr.verifiedResidents,
      unverified_reactions: appr.unverifiedReactions,
      approval_low_sample: appr.lowSample,
    };
  });

  // Batched upserts: one statement per chunk keeps Data API round-trips low.
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    await q(
      `insert into scorecards (tenure_id, method_version, performance, confidence, components, approve_pct,
                               verified_residents, unverified_reactions, approval_low_sample, computed_at)
       select x.tenure_id, x.method_version, x.performance, x.confidence, x.components, x.approve_pct,
              x.verified_residents, x.unverified_reactions, x.approval_low_sample, now()
       from jsonb_to_recordset(:rows::jsonb) as x(
         tenure_id uuid, method_version text, performance numeric, confidence text, components jsonb,
         approve_pct numeric, verified_residents int, unverified_reactions int, approval_low_sample boolean)
       on conflict (tenure_id) do update set
         method_version = excluded.method_version, performance = excluded.performance,
         confidence = excluded.confidence, components = excluded.components, approve_pct = excluded.approve_pct,
         verified_residents = excluded.verified_residents, unverified_reactions = excluded.unverified_reactions,
         approval_low_sample = excluded.approval_low_sample, computed_at = excluded.computed_at`,
      { rows: chunk },
    );
    await q(
      `insert into score_history (tenure_id, method_version, performance, confidence, components, approve_pct)
       select x.tenure_id, x.method_version, x.performance, x.confidence, x.components, x.approve_pct
       from jsonb_to_recordset(:rows::jsonb) as x(
         tenure_id uuid, method_version text, performance numeric, confidence text, components jsonb, approve_pct numeric)`,
      { rows: chunk },
    );
  }

  await q(
    `insert into audit_log (actor, action, entity, detail) values (:actor, 'recompute', 'scorecards', :detail::jsonb)`,
    { actor, detail: { scored: rows.length, methodVersion: METHOD_VERSION } },
  );
  return { scored: rows.length };
}

/** Refreshes only the Citizen Approval part of one scorecard, right after a rating changes. */
export async function refreshApproval(tenureId: string): Promise<void> {
  const ratings = await db().query<RatingRow>(`${RATINGS_SQL} where r.tenure_id = :id::uuid group by 1, 2, 3, 4, 5, 6`, {
    id: tenureId,
  });
  const appr = computeApproval(ratings.map(toRating));
  await db().query(
    `update scorecards set approve_pct = :pct, verified_residents = :residents,
       unverified_reactions = :unverified, approval_low_sample = :low
     where tenure_id = :id::uuid`,
    {
      id: tenureId,
      pct: appr.approvePct,
      residents: appr.verifiedResidents,
      unverified: appr.unverifiedReactions,
      low: appr.lowSample,
    },
  );
}
