"use client";
// Citizens can react but never post (blueprint 6.2).
import { useEffect, useState } from "react";
import type { ReactionType } from "@pol/shared";
import { api, ApiError, AUTH_MODE, devUser } from "@/lib/api";
import { useAuthVersion } from "./DevUserSwitcher";

const BUTTONS: { type: ReactionType; label: string; title: string }[] = [
  { type: "up", label: "👍", title: "Good work" },
  { type: "down", label: "👎", title: "Bad / not enough" },
  { type: "impactful", label: "⭐ Impactful", title: "This changed my community" },
  { type: "disputed", label: "⚠️ Disputed", title: "This claim is false or exaggerated" },
  { type: "evidence", label: "🔍 Show evidence", title: "I want proof" },
];

type Detail = { myReactions: string[]; reactionCounts: Record<string, number> };

const signedIn = () => (AUTH_MODE === "dev" ? !!devUser.get() : false);

/** `mine` comes from the feed when known; otherwise it's fetched once, only for signed-in users. */
export function ReactionBar({ newsId, counts: initial, mine: initialMine }: { newsId: string; counts: Record<string, number>; mine?: string[] }) {
  const [counts, setCounts] = useState(initial);
  const [mine, setMine] = useState<string[]>(initialMine ?? []);
  const [error, setError] = useState("");
  const authVersion = useAuthVersion();

  useEffect(() => {
    if (initialMine && authVersion === 0) return;
    if (!signedIn()) {
      setMine([]);
      return;
    }
    api<Detail>(`/news/${newsId}`)
      .then((d) => {
        setMine(d.myReactions);
        setCounts(d.reactionCounts);
      })
      .catch(() => {});
  }, [newsId, authVersion]);

  const toggle = async (type: ReactionType) => {
    setError("");
    try {
      if (mine.includes(type)) {
        await api(`/news/${newsId}/reactions/${type}`, { method: "DELETE" });
      } else {
        await api(`/news/${newsId}/reactions`, { method: "POST", body: JSON.stringify({ type }) });
      }
      const d = await api<Detail>(`/news/${newsId}`);
      setMine(d.myReactions);
      setCounts(d.reactionCounts);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? "Sign in to react." : "Could not save your reaction.");
    }
  };

  return (
    <>
      <div className="reactions">
        {BUTTONS.map((b) => (
          <button key={b.type} title={b.title} className={mine.includes(b.type) ? "on" : ""} onClick={() => toggle(b.type)}>
            {b.label} {counts[b.type] ?? 0}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </>
  );
}
