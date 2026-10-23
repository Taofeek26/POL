import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPONENT_LABEL, type ComponentScore, type LeaderSummary, type ScoreComponent } from "@pol/shared";
import { RateOfficial } from "@/components/RateOfficial";
import { ConfidencePill, Initials, PerformanceScore } from "@/components/Score";
import { api, ApiError, fmtDate, yearsInOffice } from "@/lib/api";

type Profile = LeaderSummary & {
  bio: string | null;
  education: string | null;
  isFictional: boolean;
  methodVersion: string | null;
  computedAt: string | null;
  unverifiedReactions: number;
  components: ComponentScore[];
  promises: { id: string; text: string; status: string; category: string; made_on: string }[];
  projects: { id: string; title: string; status: string; verification_level: any; budget_amount: number | null; lga_name: string | null }[];
  timeline: { id: string; headline: string; confidence_label: any; published_at: string }[];
  replies: { id: string; text: string; created_at: string }[];
  legislative: { bills_sponsored: number; bills_passed: number; motions: number; attendance_pct: number | null } | null;
  myRating: number | null;
};

const PROMISE_ICON: Record<string, string> = { kept: "✅ Kept", in_progress: "⏳ In progress", stalled: "⏸ Stalled", broken: "❌ Broken", not_rated: "· Not rated" };
const STATUS_TEXT: Record<string, string> = {
  completed_working: "Completed, working",
  completed_not_working: "Completed, not working",
  ongoing: "Ongoing",
  stalled: "Stalled",
  abandoned: "Abandoned",
  never_started: "Never started",
};

export default async function Official({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await api<Profile>(`/officials/${id}`).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const promiseCounts = p.promises.reduce<Record<string, number>>((acc, x) => ((acc[x.status] = (acc[x.status] ?? 0) + 1), acc), {});

  return (
    <>
      <div className="leader" style={{ gridTemplateColumns: "72px 1fr", marginBottom: 16 }}>
        <Initials name={p.name} large />
        <div>
          <h1 style={{ marginBottom: 2 }}>{p.name}</h1>
          <div className="muted">{p.officeTitle}</div>
          <div className="meta">
            <span className="tag">{p.party}</span>
            <span>
              Since {fmtDate(p.startDate)} ({yearsInOffice(p.startDate)})
            </span>
            {p.isFictional && <span className="pill neutral">Fictional test profile</span>}
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>Performance Score</h3>
          <PerformanceScore value={p.performance} confidence={p.confidence} />
          <table style={{ marginTop: 10 }}>
            <tbody>
              {p.components.map((c) => (
                <tr key={c.component}>
                  <td>
                    {COMPONENT_LABEL[c.component as ScoreComponent]}
                    <br />
                    <small>
                      weight {Math.round(c.weight * 100)}% · {c.dataPoints} data point{c.dataPoints === 1 ? "" : "s"}
                    </small>
                  </td>
                  <td style={{ width: 110 }}>
                    {c.score === null ? (
                      <small>No data</small>
                    ) : (
                      <>
                        <strong>{Math.round(c.score)}</strong>
                        <div className="meter">
                          <span style={{ width: `${c.score}%` }} />
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <small>
            Method v{p.methodVersion ?? "–"} · computed {fmtDate(p.computedAt)} · <Link href="/methodology">how this is calculated</Link>
          </small>
        </div>
        <RateOfficial
          tenureId={p.tenureId}
          initial={{
            approvePct: p.approvePct,
            verifiedResidents: p.verifiedResidents,
            approvalLowSample: p.approvalLowSample,
            unverifiedReactions: p.unverifiedReactions,
            myRating: p.myRating,
          }}
        />
      </div>

      {p.legislative && (
        <>
          <h2>Legislative record</h2>
          <div className="card meta" style={{ gap: 16 }}>
            <span>Bills sponsored: <strong>{p.legislative.bills_sponsored}</strong></span>
            <span>Bills passed: <strong>{p.legislative.bills_passed}</strong></span>
            <span>Motions: <strong>{p.legislative.motions}</strong></span>
            <span>Attendance: <strong>{p.legislative.attendance_pct ?? "–"}%</strong></span>
          </div>
        </>
      )}

      <h2>Promises ({p.promises.length})</h2>
      {p.promises.length === 0 ? (
        <p className="muted">No promises logged yet.</p>
      ) : (
        <div className="card">
          <div className="meta" style={{ marginBottom: 8 }}>
            {Object.entries(promiseCounts).map(([k, v]) => (
              <span key={k}>
                {PROMISE_ICON[k]}: {v}
              </span>
            ))}
          </div>
          <table>
            <tbody>
              {p.promises.map((x) => (
                <tr key={x.id}>
                  <td>{x.text}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{PROMISE_ICON[x.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Projects ({p.projects.length})</h2>
      {p.projects.length === 0 ? (
        <p className="muted">No projects logged yet.</p>
      ) : (
        <div className="card table-scroll">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Evidence</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {p.projects.map((x) => (
                <tr key={x.id}>
                  <td>
                    {x.title}
                    {x.lga_name && <br />}
                    <small>{x.lga_name}</small>
                  </td>
                  <td>{STATUS_TEXT[x.status]}</td>
                  <td>
                    <ConfidencePill label={x.verification_level} />
                  </td>
                  <td>{x.budget_amount ? `₦${(x.budget_amount / 1e6).toLocaleString()}M` : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Timeline</h2>
      {p.timeline.length === 0 ? (
        <p className="muted">No published items yet.</p>
      ) : (
        p.timeline.map((n) => (
          <div key={n.id} className="card">
            <div className="meta">
              <ConfidencePill label={n.confidence_label} />
              <span>{fmtDate(n.published_at)}</span>
            </div>
            <Link href={`/news/${n.id}`}>{n.headline}</Link>
          </div>
        ))
      )}

      <h2>Right of reply</h2>
      {p.replies.length === 0 ? (
        <p className="muted">This office has not responded to any item yet. Every official can reply to any item about them.</p>
      ) : (
        p.replies.map((r) => (
          <div key={r.id} className="card">
            <small>Response from the office of {p.name} · {fmtDate(r.created_at)}</small>
            <p>{r.text}</p>
          </div>
        ))
      )}
    </>
  );
}
