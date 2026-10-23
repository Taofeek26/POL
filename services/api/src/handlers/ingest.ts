// SQS ingest queue -> pending news items for editor review (blueprint 7.2, steps 1-2).
// Messages are raw articles from RSS/API pollers: { headline, summary, outlet, url, publishedAt?, topic? }.
// AI classification and entity linking will slot in here; for now items land as "pending", unlinked.
import type { SQSBatchResponse, SQSEvent } from "aws-lambda";
import { TOPICS } from "@pol/shared";
import { z } from "zod";
import { one } from "../db.js";

const article = z.object({
  headline: z.string().min(5).max(300),
  summary: z.string().min(1).max(2000),
  outlet: z.string().min(1),
  url: z.string().url(),
  publishedAt: z.string().datetime().optional(),
  topic: z.enum(TOPICS as [string, ...string[]]).optional(),
});

export async function ingestArticle(raw: unknown): Promise<"created" | "duplicate"> {
  const a = article.parse(raw);
  // De-duplicate by source URL. Grouping different outlets' coverage of the same story comes with AI classification.
  const dupe = await one(`select 1 as ok from news_sources where url = :url`, { url: a.url });
  if (dupe) return "duplicate";
  await one(
    `with n as (
       insert into news_items (headline, summary, topic, claim_type, confidence_label, status)
       values (:headline, :summary, :topic, 'general', 'announced', 'pending') returning id)
     insert into news_sources (news_id, outlet, url, published_at)
     select n.id, :outlet, :url, :publishedAt::timestamptz from n returning news_id`,
    { ...a, topic: a.topic ?? "governance", publishedAt: a.publishedAt ?? null },
  );
  return "created";
}

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchResponse["batchItemFailures"] = [];
  for (const record of event.Records) {
    try {
      await ingestArticle(JSON.parse(record.body));
    } catch (err) {
      console.error(JSON.stringify({ msg: "ingest failed", messageId: record.messageId, error: String(err) }));
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures };
};
