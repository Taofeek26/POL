import Link from "next/link";
import { fmtDate } from "@/lib/api";
import { ConfidencePill } from "./Score";
import { ReactionBar } from "./ReactionBar";

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  topic: string;
  confidenceLabel: "announced" | "reported" | "verified" | "disputed";
  aiGenerated: boolean;
  publishedAt: string | null;
  sources: { outlet: string; url: string }[];
  officials: { tenureId: string; name: string; officeTitle: string }[];
  reactionCounts: Record<string, number>;
  myReactions?: string[];
};

export function NewsCard({ n, reactions = true }: { n: NewsItem; reactions?: boolean }) {
  return (
    <article className="card">
      <div className="meta">
        <ConfidencePill label={n.confidenceLabel} />
        <span className="tag">{n.topic}</span>
        <span>{fmtDate(n.publishedAt)}</span>
      </div>
      <h3 style={{ marginTop: 8 }}>
        <Link href={`/news/${n.id}`}>{n.headline}</Link>
      </h3>
      <p>{n.summary}</p>
      <div className="meta">
        {n.officials.map((o) => (
          <Link key={o.tenureId} href={`/officials/${o.tenureId}`}>
            {o.name}
          </Link>
        ))}
        <span>
          · {n.sources.length} source{n.sources.length === 1 ? "" : "s"}
        </span>
        {n.aiGenerated && <span>· summary auto-generated</span>}
      </div>
      {reactions && <ReactionBar newsId={n.id} counts={n.reactionCounts} mine={n.myReactions} />}
    </article>
  );
}
