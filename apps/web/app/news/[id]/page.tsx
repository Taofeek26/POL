import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactionBar } from "@/components/ReactionBar";
import { ConfidencePill } from "@/components/Score";
import type { NewsItem } from "@/components/NewsCard";
import { api, ApiError, fmtDate } from "@/lib/api";

type Detail = NewsItem & {
  claimType: string;
  replies: { id: string; text: string; created_at: string; name: string; office_title: string }[];
  projects: { id: string; title: string; status: string; verification_level: any }[];
};

export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = await api<Detail>(`/news/${id}`).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  return (
    <>
      <div className="meta">
        <ConfidencePill label={n.confidenceLabel} />
        <span className="tag">{n.topic}</span>
        <span>{fmtDate(n.publishedAt)}</span>
      </div>
      <h1 style={{ marginTop: 8 }}>{n.headline}</h1>
      <p>{n.summary}</p>
      {n.aiGenerated && <p className="muted">Summary auto-generated, checked by a POL editor.</p>}
      <ReactionBar newsId={n.id} counts={n.reactionCounts} />

      <h2>Officials</h2>
      <ul>
        {n.officials.map((o) => (
          <li key={o.tenureId}>
            <Link href={`/officials/${o.tenureId}`}>{o.name}</Link> <small>{o.officeTitle}</small>
          </li>
        ))}
      </ul>

      {n.projects.length > 0 && (
        <>
          <h2>Projects</h2>
          <ul>
            {n.projects.map((p) => (
              <li key={p.id}>
                {p.title} <ConfidencePill label={p.verification_level} />
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Sources ({n.sources.length})</h2>
      <ul>
        {n.sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">
              {s.outlet}
            </a>
          </li>
        ))}
      </ul>

      <h2>Right of reply</h2>
      {n.replies.length === 0 ? (
        <p className="muted">No response from the offices involved yet.</p>
      ) : (
        n.replies.map((r) => (
          <div className="card" key={r.id}>
            <small>
              Response from the office of {r.name}, {r.office_title}
            </small>
            <p>{r.text}</p>
          </div>
        ))
      )}
    </>
  );
}
