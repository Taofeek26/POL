"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { COMPONENT_LABEL, type ComponentScore, type LeaderSummary, type ScoreComponent } from "@pol/shared";
import { ApprovalBar, PerformanceScore } from "@/components/Score";
import { api } from "@/lib/api";

type Profile = LeaderSummary & { components: ComponentScore[]; promises: { status: string }[]; projects: unknown[] };

function Picker({ label, onPick }: { label: string; onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<LeaderSummary[]>([]);
  useEffect(() => {
    if (q.trim().length < 2) return setResults([]);
    const t = setTimeout(() => api<LeaderSummary[]>(`/officials/search?q=${encodeURIComponent(q)}`).then(setResults), 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div className="field">
      <label>{label}</label>
      <input placeholder="Name or office, e.g. Kano governor" value={q} onChange={(e) => setQ(e.target.value)} />
      {results.length > 0 && (
        <div className="card" style={{ marginTop: 4, padding: 6 }}>
          {results.map((r) => (
            <div key={r.tenureId}>
              <button
                style={{ border: 0, width: "100%", textAlign: "left" }}
                onClick={() => {
                  onPick(r.tenureId);
                  setQ(r.name);
                  setResults([]);
                }}
              >
                {r.name} <small>{r.officeTitle}</small>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Compare() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [data, setData] = useState<{ a: Profile; b: Profile } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!a || !b) return;
    setError("");
    api<{ a: Profile; b: Profile }>(`/compare?a=${a}&b=${b}`).then(setData).catch(() => setError("Could not load comparison."));
  }, [a, b]);

  const sameOffice = data && data.a.officeType === data.b.officeType;
  const components = data ? [...new Set([...data.a.components, ...data.b.components].map((c) => c.component))] : [];
  const score = (p: Profile, c: string) => p.components.find((x) => x.component === c)?.score;

  return (
    <>
      <h1>Compare</h1>
      <div className="grid two">
        <Picker label="First official" onPick={setA} />
        <Picker label="Second official" onPick={setB} />
      </div>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          {!sameOffice && (
            <p className="banner">
              These two hold different types of office, so their scores are measured against different peers and different
              weights. Compare with care.
            </p>
          )}
          <div className="card table-scroll">
            <table>
              <thead>
                <tr>
                  <th />
                  {[data.a, data.b].map((p) => (
                    <th key={p.tenureId}>
                      <Link href={`/officials/${p.tenureId}`}>{p.name}</Link>
                      <br />
                      <small>{p.officeTitle}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Performance</td>
                  {[data.a, data.b].map((p) => (
                    <td key={p.tenureId}>
                      <PerformanceScore value={p.performance} confidence={p.confidence} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Citizen Approval</td>
                  {[data.a, data.b].map((p) => (
                    <td key={p.tenureId} style={{ minWidth: 160 }}>
                      <ApprovalBar pct={p.approvePct} residents={p.verifiedResidents} low={p.approvalLowSample} />
                    </td>
                  ))}
                </tr>
                {components.map((c) => (
                  <tr key={c}>
                    <td>{COMPONENT_LABEL[c as ScoreComponent]}</td>
                    {[data.a, data.b].map((p) => {
                      const s = score(p, c);
                      return <td key={p.tenureId}>{s == null ? <small>No data</small> : Math.round(s)}</td>;
                    })}
                  </tr>
                ))}
                <tr>
                  <td>Promises kept</td>
                  {[data.a, data.b].map((p) => (
                    <td key={p.tenureId}>
                      {p.promises.filter((x) => x.status === "kept").length} of {p.promises.length}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Projects logged</td>
                  {[data.a, data.b].map((p) => (
                    <td key={p.tenureId}>{p.projects.length}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
