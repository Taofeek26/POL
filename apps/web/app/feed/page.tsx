"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TOPICS } from "@pol/shared";
import { NewsCard, type NewsItem } from "@/components/NewsCard";
import { useAuthVersion } from "@/components/DevUserSwitcher";
import { api, homeWard } from "@/lib/api";

function Feed() {
  const search = useSearchParams();
  const [ward, setWard] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [next, setNext] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const authVersion = useAuthVersion();

  useEffect(() => setWard(search.get("wardId") ?? homeWard.get()), [search]);

  const load = async (offset: number, replace: boolean) => {
    setLoading(true);
    const qs = new URLSearchParams({ offset: String(offset), limit: "20" });
    if (ward) qs.set("wardId", ward);
    if (topic) qs.set("topic", topic);
    if (level) qs.set("level", level);
    try {
      const d = await api<{ items: NewsItem[]; nextOffset: number | null }>(`/feed?${qs}`);
      setItems((prev) => (replace ? d.items : [...prev, ...d.items]));
      setNext(d.nextOffset);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0, true);
  }, [ward, topic, level, authVersion]);

  return (
    <>
      <h1>Feed</h1>
      <p className="muted">{ward ? "News about your leaders first, then your state, then national." : "Pick your ward on My Leaders to see your leaders first."}</p>
      <div className="row" style={{ marginBottom: 12 }}>
        <div>
          <label htmlFor="topic">Topic</label>
          <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">All topics</option>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="level">Level</label>
          <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All levels</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
            <option value="lga">LGA</option>
            <option value="ward">Ward</option>
          </select>
        </div>
      </div>
      {items.map((n) => (
        <NewsCard key={n.id} n={n} />
      ))}
      {!loading && items.length === 0 && <p className="muted">Nothing matches these filters.</p>}
      {next !== null && (
        <button disabled={loading} onClick={() => load(next, false)}>
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </>
  );
}

export default function FeedPage() {
  return (
    <Suspense>
      <Feed />
    </Suspense>
  );
}
