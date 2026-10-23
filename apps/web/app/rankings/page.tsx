import Link from "next/link";
import { OFFICE_LABEL, type LeaderSummary, type OfficeType } from "@pol/shared";
import { ApprovalBar, PerformanceScore } from "@/components/Score";
import { api } from "@/lib/api";

export const metadata = { title: "Rankings" };

export default async function Rankings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const officeType = (sp.officeType ?? "governor") as OfficeType;
  const by = sp.by === "approval" ? "approval" : "performance";
  const stateId = sp.stateId ?? "";
  const qs = new URLSearchParams({ officeType, by, ...(stateId ? { stateId } : {}) });
  const [data, states] = await Promise.all([
    api<{ results: LeaderSummary[] }>(`/rankings?${qs}`),
    api<{ id: string; name: string }[]>("/geo/states", { revalidate: 3600 }),
  ]);

  return (
    <>
      <h1>Rankings</h1>
      <p className="muted">
        Officials are only ranked against others holding the same office.{" "}
        {by === "performance"
          ? "Only scores with medium or high confidence are ranked."
          : "Only officials with at least 100 verified residents rating them are ranked."}{" "}
        <Link href="/methodology">Method</Link>
      </p>
      <form className="row card" method="get">
        <div>
          <label htmlFor="officeType">Office</label>
          <select id="officeType" name="officeType" defaultValue={officeType}>
            {(Object.keys(OFFICE_LABEL) as OfficeType[])
              .filter((t) => t !== "president" && t !== "vice_president")
              .map((t) => (
                <option key={t} value={t}>
                  {OFFICE_LABEL[t]}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="by">Rank by</label>
          <select id="by" name="by" defaultValue={by}>
            <option value="performance">Performance Score</option>
            <option value="approval">Citizen Approval</option>
          </select>
        </div>
        <div>
          <label htmlFor="stateId">State</label>
          <select id="stateId" name="stateId" defaultValue={stateId}>
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <button className="primary" type="submit">
            Show
          </button>
        </div>
      </form>

      {data.results.length === 0 && <p className="muted">No one qualifies for this ranking yet.</p>}
      {data.results.map((l, i) => (
        <div key={l.tenureId} className="card scores" style={{ gridTemplateColumns: "32px auto 1fr" }}>
          <strong>{i + 1}</strong>
          <PerformanceScore value={l.performance} confidence={l.confidence} />
          <div>
            <Link href={`/officials/${l.tenureId}`}>
              <strong>{l.name}</strong>
            </Link>{" "}
            <span className="tag">{l.party}</span>
            <div className="muted" style={{ fontSize: "0.85rem", marginBottom: 6 }}>
              {l.officeTitle}
            </div>
            <ApprovalBar pct={l.approvePct} residents={l.verifiedResidents} low={l.approvalLowSample} />
          </div>
        </div>
      ))}
    </>
  );
}
