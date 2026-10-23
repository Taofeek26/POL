// Types and method constants shared by the API, the web app and (later) the mobile app.
// The scoring constants mirror blueprint section 8. Changing them means a new METHOD_VERSION.

export const METHOD_VERSION = "1.0";

export type OfficeLevel = "federal" | "state" | "lga" | "ward";

export type OfficeType =
  | "president"
  | "vice_president"
  | "senator"
  | "rep"
  | "governor"
  | "deputy_governor"
  | "state_assembly"
  | "lga_chair"
  | "councillor";

/** Which scoring table an office uses (blueprint 8.2). */
export type OfficeCategory = "executive" | "legislator" | "councillor";

export const OFFICE_CATEGORY: Record<OfficeType, OfficeCategory> = {
  president: "executive",
  vice_president: "executive",
  governor: "executive",
  deputy_governor: "executive",
  lga_chair: "executive",
  senator: "legislator",
  rep: "legislator",
  state_assembly: "legislator",
  councillor: "councillor",
};

export const OFFICE_LABEL: Record<OfficeType, string> = {
  president: "President",
  vice_president: "Vice President",
  senator: "Senator",
  rep: "Member, House of Representatives",
  governor: "Governor",
  deputy_governor: "Deputy Governor",
  state_assembly: "Member, State House of Assembly",
  lga_chair: "LGA Chairman",
  councillor: "Councillor",
};

export type ScoreComponent =
  | "projects"
  | "budget"
  | "promises"
  | "legislative"
  | "attendance"
  | "outcomes"
  | "transparency"
  | "engagement";

export const COMPONENT_LABEL: Record<ScoreComponent, string> = {
  projects: "Projects delivered & verified",
  budget: "Budget performance & transparency",
  promises: "Promises kept",
  legislative: "Legislative work",
  attendance: "Attendance & participation",
  outcomes: "Outcome indicators",
  transparency: "Transparency & accountability",
  engagement: "Constituency engagement",
};

export const COMPONENT_WEIGHTS: Record<OfficeCategory, Partial<Record<ScoreComponent, number>>> = {
  executive: { projects: 0.3, budget: 0.2, promises: 0.2, outcomes: 0.15, transparency: 0.15 },
  legislator: {
    projects: 0.15,
    budget: 0.1,
    promises: 0.15,
    legislative: 0.25,
    attendance: 0.15,
    transparency: 0.1,
    engagement: 0.1,
  },
  councillor: { projects: 0.35, budget: 0.15, promises: 0.15, attendance: 0.1, transparency: 0.15, engagement: 0.1 },
};

export type ProjectStatus =
  | "completed_working"
  | "completed_not_working"
  | "ongoing"
  | "stalled"
  | "abandoned"
  | "never_started";

export const STATUS_MULTIPLIER: Record<ProjectStatus, number> = {
  completed_working: 1.0,
  completed_not_working: 0.4,
  ongoing: 0.5,
  stalled: 0.1,
  abandoned: -0.3,
  never_started: -0.6,
};

export type ConfidenceLabel = "announced" | "reported" | "verified" | "disputed";

export const VERIFICATION_MULTIPLIER: Record<ConfidenceLabel, number> = {
  verified: 1.0,
  reported: 0.7,
  announced: 0.3,
  disputed: 0,
};

export type ScoreConfidence = "high" | "medium" | "low" | "insufficient";

export type PromiseStatus = "kept" | "in_progress" | "stalled" | "broken" | "not_rated";

export type ClaimType = "announcement" | "contract_awarded" | "completed" | "disputed" | "general";

export type NewsStatus = "pending" | "published" | "rejected";

export type ReactionType = "up" | "down" | "impactful" | "disputed" | "evidence";

export const REACTION_TYPES: ReactionType[] = ["up", "down", "impactful", "disputed", "evidence"];

export type Topic =
  | "roads"
  | "health"
  | "education"
  | "water"
  | "security"
  | "power"
  | "agriculture"
  | "governance";

export const TOPICS: Topic[] = ["roads", "health", "education", "water", "security", "power", "agriculture", "governance"];

export type VerificationLevel = "unverified" | "phone" | "kyc";

/** Citizen Approval weights (blueprint 8.3). */
export const APPROVAL_WEIGHT = {
  resident: 1.0,
  verifiedNonResident: 0.25,
  unverified: 0,
  flagged: 0,
};
export const APPROVAL_HALF_LIFE_DAYS = 365;
/** Below this many verified residents the bar is greyed out and pulled toward 50/50. */
export const APPROVAL_MIN_RESIDENTS = 100;
/** Pseudo-votes (split 50/50) added for smoothing small samples. */
export const APPROVAL_PRIOR_WEIGHT = 20;

export interface ComponentScore {
  component: ScoreComponent;
  weight: number;
  /** null = no data; its weight is redistributed. */
  score: number | null;
  dataPoints: number;
}

export interface Scorecard {
  tenureId: string;
  methodVersion: string;
  performance: number | null;
  confidence: ScoreConfidence;
  components: ComponentScore[];
  approvePct: number | null;
  verifiedResidents: number;
  unverifiedReactions: number;
  approvalLowSample: boolean;
  computedAt: string;
}

export interface LeaderSummary {
  tenureId: string;
  personId: string;
  name: string;
  photoUrl: string | null;
  party: string;
  officeType: OfficeType;
  officeTitle: string;
  level: OfficeLevel;
  startDate: string;
  performance: number | null;
  confidence: ScoreConfidence;
  approvePct: number | null;
  verifiedResidents: number;
  approvalLowSample: boolean;
}
