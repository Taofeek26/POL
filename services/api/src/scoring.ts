// Performance Score and Citizen Approval (blueprint section 8). Pure functions, no I/O.
import {
  APPROVAL_HALF_LIFE_DAYS,
  APPROVAL_MIN_RESIDENTS,
  APPROVAL_PRIOR_WEIGHT,
  APPROVAL_WEIGHT,
  COMPONENT_WEIGHTS,
  OFFICE_CATEGORY,
  STATUS_MULTIPLIER,
  VERIFICATION_MULTIPLIER,
  type ComponentScore,
  type ConfidenceLabel,
  type OfficeType,
  type ProjectStatus,
  type PromiseStatus,
  type ScoreComponent,
  type ScoreConfidence,
  type VerificationLevel,
} from "@pol/shared";

export interface TenureRecord {
  tenureId: string;
  officeType: OfficeType;
  projects: { status: ProjectStatus; verification: ConfidenceLabel; valueTier: number }[];
  promises: { status: PromiseStatus }[];
  budgets: { published: boolean; capitalImplementationPct: number | null }[];
  legislative: { billsSponsored: number; billsPassed: number; motions: number; attendancePct: number | null } | null;
  foi: { sent: number; responded: number };
  townHalls: number | null;
}

export interface PerformanceResult {
  performance: number | null;
  confidence: ScoreConfidence;
  components: ComponentScore[];
}

const PROMISE_VALUE: Record<PromiseStatus, number | null> = {
  kept: 1,
  in_progress: 0.5,
  stalled: 0.25,
  broken: 0,
  not_rated: null,
};

export function projectPoints(projects: TenureRecord["projects"]): number {
  return projects.reduce(
    (sum, p) => sum + p.valueTier * STATUS_MULTIPLIER[p.status] * VERIFICATION_MULTIPLIER[p.verification],
    0,
  );
}

export function legislativePoints(l: NonNullable<TenureRecord["legislative"]>): number {
  return l.billsPassed * 3 + l.billsSponsored + l.motions * 0.5;
}

/** Percentile rank among peers: the median peer scores 50. */
export function percentileRank(value: number, peers: number[]): number {
  if (peers.length === 0) return 50;
  let below = 0;
  let equal = 0;
  for (const p of peers) {
    if (p < value) below++;
    else if (p === value) equal++;
  }
  return round(((below + 0.5 * equal) / peers.length) * 100);
}

/**
 * Raw (not yet peer-normalised) values that need comparing against others holding the same office type.
 * Returns null when the tenure has no data for that component.
 */
export function peerRawValues(r: TenureRecord): Partial<Record<"projects" | "legislative" | "engagement", number>> {
  const out: Partial<Record<"projects" | "legislative" | "engagement", number>> = {};
  if (r.projects.length > 0) out.projects = projectPoints(r.projects);
  if (r.legislative) out.legislative = legislativePoints(r.legislative);
  if (r.townHalls !== null) out.engagement = r.townHalls;
  return out;
}

export type PeerTable = Map<OfficeType, Record<"projects" | "legislative" | "engagement", number[]>>;

export function buildPeerTable(records: TenureRecord[]): PeerTable {
  const table: PeerTable = new Map();
  for (const r of records) {
    let entry = table.get(r.officeType);
    if (!entry) table.set(r.officeType, (entry = { projects: [], legislative: [], engagement: [] }));
    const raw = peerRawValues(r);
    if (raw.projects !== undefined) entry.projects.push(raw.projects);
    if (raw.legislative !== undefined) entry.legislative.push(raw.legislative);
    if (raw.engagement !== undefined) entry.engagement.push(raw.engagement);
  }
  return table;
}

export function computePerformance(r: TenureRecord, peers: PeerTable): PerformanceResult {
  const weights = COMPONENT_WEIGHTS[OFFICE_CATEGORY[r.officeType]];
  const peerVals = peers.get(r.officeType) ?? { projects: [], legislative: [], engagement: [] };
  const raw = peerRawValues(r);

  const scoreFor = (c: ScoreComponent): { score: number | null; dataPoints: number } => {
    switch (c) {
      case "projects":
        return raw.projects === undefined
          ? { score: null, dataPoints: 0 }
          : { score: percentileRank(raw.projects, peerVals.projects), dataPoints: r.projects.length };
      case "promises": {
        const rated = r.promises.map((p) => PROMISE_VALUE[p.status]).filter((v): v is number => v !== null);
        if (rated.length === 0) return { score: null, dataPoints: 0 };
        return { score: round((rated.reduce((a, b) => a + b, 0) / rated.length) * 100), dataPoints: rated.length };
      }
      case "budget": {
        const years = r.budgets;
        if (years.length === 0) return { score: null, dataPoints: 0 };
        // 40% for publishing the budget at all, 60% for how much of the capital budget was implemented.
        const perYear = years.map((b) => 0.4 * (b.published ? 100 : 0) + 0.6 * (b.capitalImplementationPct ?? 0));
        return { score: round(avg(perYear)), dataPoints: years.length };
      }
      case "legislative":
        return raw.legislative === undefined
          ? { score: null, dataPoints: 0 }
          : {
              score: percentileRank(raw.legislative, peerVals.legislative),
              dataPoints: r.legislative!.billsSponsored + r.legislative!.motions,
            };
      case "attendance":
        return r.legislative?.attendancePct == null
          ? { score: null, dataPoints: 0 }
          : { score: round(r.legislative.attendancePct), dataPoints: 1 };
      case "transparency": {
        const parts: number[] = [];
        if (r.foi.sent > 0) parts.push((r.foi.responded / r.foi.sent) * 100);
        if (r.budgets.length > 0) parts.push((r.budgets.filter((b) => b.published).length / r.budgets.length) * 100);
        if (parts.length === 0) return { score: null, dataPoints: 0 };
        return { score: round(avg(parts)), dataPoints: r.foi.sent + r.budgets.length };
      }
      case "engagement":
        return raw.engagement === undefined
          ? { score: null, dataPoints: 0 }
          : { score: percentileRank(raw.engagement, peerVals.engagement), dataPoints: 1 };
      case "outcomes":
        // No outcome data source wired up yet: weight is redistributed.
        return { score: null, dataPoints: 0 };
    }
  };

  const components: ComponentScore[] = (Object.entries(weights) as [ScoreComponent, number][]).map(([c, w]) => ({
    component: c,
    weight: w,
    ...scoreFor(c),
  }));

  const scored = components.filter((c) => c.score !== null);
  const coveredWeight = scored.reduce((s, c) => s + c.weight, 0);
  const dataPoints = components.reduce((s, c) => s + c.dataPoints, 0);
  const confidence = confidenceFor(dataPoints, coveredWeight);
  const performance =
    confidence === "insufficient" || coveredWeight === 0
      ? null
      : round(scored.reduce((s, c) => s + c.weight * c.score!, 0) / coveredWeight);

  return { performance, confidence, components };
}

export function confidenceFor(dataPoints: number, coveredWeight: number): ScoreConfidence {
  if (dataPoints < 4 || coveredWeight < 0.3) return "insufficient";
  let level: ScoreConfidence = dataPoints >= 20 ? "high" : dataPoints >= 10 ? "medium" : "low";
  // A score resting on under half the method's weight can't be better than "low".
  if (coveredWeight < 0.5) level = "low";
  return level;
}

// Citizen Approval -----------------------------------------------------------------

export interface RatingInput {
  value: -1 | 1;
  updatedAt: string;
  isResident: boolean;
  verification: VerificationLevel;
  flagged: boolean;
  /** Number of identical ratings this row stands for (rows are grouped in SQL). Default 1. */
  count?: number;
}

export interface ApprovalResult {
  approvePct: number | null;
  verifiedResidents: number;
  unverifiedReactions: number;
  lowSample: boolean;
}

export function ratingWeight(r: RatingInput, now: Date): number {
  let base: number;
  if (r.flagged) base = APPROVAL_WEIGHT.flagged;
  else if (r.verification === "unverified") base = APPROVAL_WEIGHT.unverified;
  else if (r.isResident) base = APPROVAL_WEIGHT.resident;
  else base = APPROVAL_WEIGHT.verifiedNonResident;
  const ageDays = Math.max(0, (now.getTime() - new Date(r.updatedAt).getTime()) / 86_400_000);
  return base * Math.pow(0.5, ageDays / APPROVAL_HALF_LIFE_DAYS);
}

export function computeApproval(ratings: RatingInput[], now = new Date()): ApprovalResult {
  let up = 0;
  let total = 0;
  let verifiedResidents = 0;
  let unverifiedReactions = 0;
  for (const r of ratings) {
    const n = r.count ?? 1;
    if (r.verification === "unverified") unverifiedReactions += n;
    if (r.isResident && r.verification !== "unverified" && !r.flagged) verifiedResidents += n;
    const w = ratingWeight(r, now) * n;
    total += w;
    if (r.value === 1) up += w;
  }
  if (total === 0) {
    return { approvePct: null, verifiedResidents, unverifiedReactions, lowSample: true };
  }
  // Pull small samples toward 50/50.
  const approvePct = round(((up + APPROVAL_PRIOR_WEIGHT / 2) / (total + APPROVAL_PRIOR_WEIGHT)) * 100);
  return { approvePct, verifiedResidents, unverifiedReactions, lowSample: verifiedResidents < APPROVAL_MIN_RESIDENTS };
}

function avg(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function round(x: number) {
  return Math.round(x * 100) / 100;
}
