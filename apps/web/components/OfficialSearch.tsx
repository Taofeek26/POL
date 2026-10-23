"use client";
import { useEffect, useState } from "react";
import type { LeaderSummary } from "@pol/shared";
import { api } from "@/lib/api";

export function OfficialSearch({ onPick, placeholder = "Search by name or office" }: { onPick: (l: LeaderSummary) => void; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<LeaderSummary[]>([]);
  useEffect(() => {
    if (q.trim().length < 2) return setResults([]);
    const t = setTimeout(() => api<LeaderSummary[]>(`/officials/search?q=${encodeURIComponent(q)}`).then(setResults).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div>
      <input placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
      {results.length > 0 && (
        <div className="card" style={{ marginTop: 4, padding: 6 }}>
          {results.map((r) => (
            <button
              type="button"
              key={r.tenureId}
              style={{ display: "block", border: 0, textAlign: "left", width: "100%" }}
              onClick={() => {
                onPick(r);
                setQ("");
                setResults([]);
              }}
            >
              {r.name} <small>{r.officeTitle}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
