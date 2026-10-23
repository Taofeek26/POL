"use client";
// Editors confirm anything before it can affect a score (blueprint 7.2 step 4, 9.4).
import { useEffect, useState } from "react";
import { TOPICS, type LeaderSummary } from "@pol/shared";
import { NewsCard, type NewsItem } from "@/components/NewsCard";
import { OfficialSearch } from "@/components/OfficialSearch";
import { useAuthVersion } from "@/components/DevUserSwitcher";
import { api, ApiError, fmtDate } from "@/lib/api";

type Queue = { pending: NewsItem[]; disputed: NewsItem[]; disputeThreshold: number };
type Audit = { id: number; actor: string; action: string; entity: string; entity_id: string | null; at: string };
const LABELS = ["announced", "reported", "verified", "disputed"] as const;

function ReviewItem({ n, onDone }: { n: NewsItem; onDone: () => void }) {
  const [label, setLabel] = useState(n.confidenceLabel);
  const [busy, setBusy] = useState(false);
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      onDone();
    } finally {
      setBusy(false);
    }
  };
  const link = (tenureIds: string[]) =>
    act(() => api(`/editor/news/${n.id}`, { method: "PATCH", body: JSON.stringify({ tenureIds }) }));
  const linkedIds = n.officials.map((o) => o.tenureId);
  return (
    <div>
      <NewsCard n={n} reactions={false} />
      <div className="field" style={{ marginTop: -4 }}>
        <label>Linked officials</label>
        <div className="meta" style={{ marginBottom: 6 }}>
          {n.officials.length === 0 && <span className="error">None yet: link at least one before publishing.</span>}
          {n.officials.map((o) => (
            <button key={o.tenureId} disabled={busy} title="Unlink" onClick={() => link(linkedIds.filter((x) => x !== o.tenureId))}>
              {o.name} ✕
            </button>
          ))}
        </div>
        <OfficialSearch placeholder="Link an official…" onPick={(l) => !linkedIds.includes(l.tenureId) && link([...linkedIds, l.tenureId])} />
      </div>
      <div className="row" style={{ marginBottom: 16 }}>
        <div>
          <label>Confidence label</label>
          <select value={label} onChange={(e) => setLabel(e.target.value as any)}>
            {LABELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: "0 0 auto", display: "flex", gap: 6 }}>
          <button
            disabled={busy || label === n.confidenceLabel}
            onClick={() => act(() => api(`/editor/news/${n.id}`, { method: "PATCH", body: JSON.stringify({ confidenceLabel: label }) }))}
          >
            Save label
          </button>
          {n.publishedAt === null && (
            <button className="primary" disabled={busy || n.officials.length === 0} title={n.officials.length === 0 ? "Link at least one official first" : ""} onClick={() => act(() => api(`/editor/news/${n.id}/publish`, { method: "POST" }))}>
              Publish
            </button>
          )}
          <button disabled={busy} onClick={() => act(() => api(`/editor/news/${n.id}/reject`, { method: "POST" }))}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function NewItemForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ headline: "", summary: "", topic: "roads", claimType: "announcement", confidenceLabel: "announced", affectsScore: false, outlet: "", url: "" });
  const [officials, setOfficials] = useState<LeaderSummary[]>([]);
  const [error, setError] = useState("");
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api("/editor/news", {
        method: "POST",
        body: JSON.stringify({
          headline: form.headline,
          summary: form.summary,
          topic: form.topic,
          claimType: form.claimType,
          confidenceLabel: form.confidenceLabel,
          affectsScore: form.affectsScore,
          sources: [{ outlet: form.outlet, url: form.url }],
          tenureIds: officials.map((o) => o.tenureId),
        }),
      });
      setForm({ ...form, headline: "", summary: "", outlet: "", url: "" });
      setOfficials([]);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create item");
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <div className="field">
        <label>Headline</label>
        <input required minLength={5} value={form.headline} onChange={(e) => set("headline", e.target.value)} />
      </div>
      <div className="field">
        <label>Neutral summary (2–3 sentences)</label>
        <textarea required minLength={10} rows={3} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
      </div>
      <div className="row">
        <div className="field">
          <label>Topic</label>
          <select value={form.topic} onChange={(e) => set("topic", e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Claim type</label>
          <select value={form.claimType} onChange={(e) => set("claimType", e.target.value)}>
            {["announcement", "contract_awarded", "completed", "disputed", "general"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Confidence label</label>
          <select value={form.confidenceLabel} onChange={(e) => set("confidenceLabel", e.target.value)}>
            {LABELS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label>Source outlet</label>
          <input required value={form.outlet} onChange={(e) => set("outlet", e.target.value)} />
        </div>
        <div className="field">
          <label>Source URL</label>
          <input required type="url" value={form.url} onChange={(e) => set("url", e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Link officials</label>
        <OfficialSearch onPick={(r) => !officials.some((o) => o.tenureId === r.tenureId) && setOfficials([...officials, r])} />
        <div className="meta" style={{ marginTop: 6 }}>
          {officials.map((o) => (
            <button type="button" key={o.tenureId} onClick={() => setOfficials(officials.filter((x) => x.tenureId !== o.tenureId))}>
              {o.name} ✕
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
          <input type="checkbox" style={{ width: "auto", minHeight: 0 }} checked={form.affectsScore} onChange={(e) => set("affectsScore", e.target.checked)} />
          This item affects a score
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="primary" type="submit">
        Add to review queue
      </button>
    </form>
  );
}

export default function Editor() {
  const [tab, setTab] = useState<"pending" | "disputed" | "new" | "audit">("pending");
  const [queue, setQueue] = useState<Queue | null>(null);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [status, setStatus] = useState("");
  const [denied, setDenied] = useState(false);
  const authVersion = useAuthVersion();

  const load = async () => {
    try {
      const [q, a] = await Promise.all([api<Queue>("/editor/queue"), api<Audit[]>("/editor/audit")]);
      setQueue(q);
      setAudit(a);
      setDenied(false);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) setDenied(true);
    }
  };
  useEffect(() => {
    load();
  }, [authVersion]);

  if (denied) return <p className="banner">Editors only. In this test build, pick “Editor” in the user menu at the top.</p>;
  if (!queue) return <p className="muted">Loading…</p>;

  const recompute = async () => {
    setStatus("Recomputing…");
    const r = await api<{ scored: number }>("/editor/scores/recompute", { method: "POST" });
    setStatus(`Recomputed ${r.scored} scorecards.`);
    load();
  };

  return (
    <>
      <h1>Editor</h1>
      <div className="reactions" style={{ marginBottom: 16 }}>
        <button className={tab === "pending" ? "on" : ""} onClick={() => setTab("pending")}>
          Pending ({queue.pending.length})
        </button>
        <button className={tab === "disputed" ? "on" : ""} onClick={() => setTab("disputed")}>
          Crowd-disputed ({queue.disputed.length})
        </button>
        <button className={tab === "new" ? "on" : ""} onClick={() => setTab("new")}>
          New item
        </button>
        <button className={tab === "audit" ? "on" : ""} onClick={() => setTab("audit")}>
          Audit log
        </button>
        <button onClick={recompute}>Recompute scores</button>
      </div>
      {status && <p className="muted">{status}</p>}

      {tab === "pending" && (queue.pending.length === 0 ? <p className="muted">Queue is empty.</p> : queue.pending.map((n) => <ReviewItem key={n.id} n={n} onDone={load} />))}
      {tab === "disputed" && (
        <>
          <p className="muted">Published items that {queue.disputeThreshold}+ verified users marked as disputed. Check the claim and relabel if needed.</p>
          {queue.disputed.map((n) => (
            <ReviewItem key={n.id} n={n} onDone={load} />
          ))}
        </>
      )}
      {tab === "new" && <NewItemForm onCreated={() => { setTab("pending"); load(); }} />}
      {tab === "audit" && (
        <div className="card table-scroll">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>What</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id}>
                  <td>{fmtDate(a.at)}</td>
                  <td>
                    <small>{a.actor.slice(0, 18)}</small>
                  </td>
                  <td>{a.action}</td>
                  <td>
                    {a.entity} <small>{a.entity_id?.slice(0, 8)}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
