"use client";
// One active rating per user per official (blueprint 8.3).
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { ApprovalBar } from "./Score";
import { useAuthVersion } from "./DevUserSwitcher";

type P = { approvePct: number | null; verifiedResidents: number; approvalLowSample: boolean; unverifiedReactions: number; myRating: number | null };

export function RateOfficial({ tenureId, initial }: { tenureId: string; initial: P }) {
  const [p, setP] = useState(initial);
  const [error, setError] = useState("");
  const authVersion = useAuthVersion();

  const refresh = () => api<P>(`/officials/${tenureId}`).then(setP);
  useEffect(() => {
    refresh().catch(() => {});
  }, [tenureId, authVersion]);

  const rate = async (value: 1 | -1) => {
    setError("");
    try {
      if (p.myRating === value) await api(`/officials/${tenureId}/rating`, { method: "DELETE" });
      else await api(`/officials/${tenureId}/rating`, { method: "PUT", body: JSON.stringify({ value }) });
      await refresh();
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? "Sign in to rate." : "Could not save your rating.");
    }
  };

  return (
    <div className="card">
      <h3>Citizen Approval</h3>
      <ApprovalBar pct={p.approvePct} residents={p.verifiedResidents} low={p.approvalLowSample} />
      <p className="muted" style={{ fontSize: "0.8rem", marginTop: 6 }}>
        Opinion of POL users, not a poll. Verified residents count fully, other verified users count a quarter, and{" "}
        {p.unverifiedReactions.toLocaleString()} unverified ratings count for nothing.
      </p>
      <div className="reactions">
        <button className={p.myRating === 1 ? "on" : ""} onClick={() => rate(1)}>
          👍 Approve
        </button>
        <button className={p.myRating === -1 ? "on" : ""} onClick={() => rate(-1)}>
          👎 Disapprove
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
