import Link from "next/link";
import type { ConfidenceLabel, LeaderSummary, ScoreConfidence } from "@pol/shared";
import { yearsInOffice } from "@/lib/api";

export function Initials({ name, large }: { name: string; large?: boolean }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div className={`avatar${large ? " lg" : ""}`} aria-hidden>
      {initials}
    </div>
  );
}

const CONFIDENCE_TEXT: Record<ScoreConfidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
  insufficient: "Insufficient data",
};

export function PerformanceScore({ value, confidence }: { value: number | null; confidence: ScoreConfidence }) {
  if (value === null || confidence === "insufficient") {
    return (
      <div className="perf none" title="Not enough verified data to give a number yet">
        <div className="num">Insufficient data</div>
        <div className="lbl">Performance</div>
      </div>
    );
  }
  return (
    <div className="perf" title={CONFIDENCE_TEXT[confidence]}>
      <div className="num">{Math.round(value)}</div>
      <div className="lbl">Performance · {confidence}</div>
    </div>
  );
}

export function ApprovalBar({ pct, residents, low }: { pct: number | null; residents: number; low: boolean }) {
  if (pct === null) {
    return (
      <div className="approval low">
        <div className="bar" aria-hidden />
        <div className="legend">
          <span className="muted">No verified ratings yet</span>
        </div>
      </div>
    );
  }
  const up = Math.round(pct);
  const down = 100 - up;
  return (
    <div className={`approval${low ? " low" : ""}`} aria-label={`Citizen approval ${up}% approve, ${down}% disapprove`}>
      <div className="bar" aria-hidden>
        <div className="up" style={{ width: `${up}%` }} />
        <div className="down" style={{ width: `${down}%` }} />
      </div>
      <div className="legend">
        <span>👍 {up}% approve</span>
        <span>👎 {down}% disapprove</span>
      </div>
      <div className="legend">
        <small>
          {residents.toLocaleString()} verified resident{residents === 1 ? "" : "s"}
          {low ? " · too few to be reliable" : ""}
        </small>
      </div>
    </div>
  );
}

const LABEL_TEXT: Record<ConfidenceLabel, string> = {
  announced: "🟡 Announced",
  reported: "🔵 Reported",
  verified: "🟢 Verified on ground",
  disputed: "🔴 Disputed",
};

export function ConfidencePill({ label }: { label: ConfidenceLabel }) {
  return <span className={`pill ${label}`}>{LABEL_TEXT[label]}</span>;
}

export function LeaderCard({ l }: { l: LeaderSummary }) {
  return (
    <div className="card">
      <div className="leader">
        <Initials name={l.name} />
        <div>
          <div>
            <Link href={`/officials/${l.tenureId}`}>
              <strong>{l.name}</strong>
            </Link>{" "}
            <span className="tag">{l.party}</span>
          </div>
          <div className="office">{l.officeTitle}</div>
          <div className="office">In office {yearsInOffice(l.startDate)}</div>
        </div>
      </div>
      <div className="scores">
        <PerformanceScore value={l.performance} confidence={l.confidence} />
        <ApprovalBar pct={l.approvePct} residents={l.verifiedResidents} low={l.approvalLowSample} />
      </div>
    </div>
  );
}
