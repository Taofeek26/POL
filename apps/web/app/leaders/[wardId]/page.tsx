import Link from "next/link";
import { notFound } from "next/navigation";
import type { LeaderSummary } from "@pol/shared";
import { LeaderCard } from "@/components/Score";
import { api, ApiError } from "@/lib/api";

type Place = { ward_id: string; ward_name: string; lga_name: string; state_id: string; state_name: string };

export default async function Leaders({ params }: { params: Promise<{ wardId: string }> }) {
  const { wardId } = await params;
  const data = await api<{ place: Place; leaders: LeaderSummary[] }>(`/wards/${wardId}/leaders`).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const { place, leaders } = data;
  return (
    <>
      <h1>My Leaders</h1>
      <p className="muted">
        {place.ward_name}, {place.lga_name}, {place.state_name} · <Link href="/">change</Link> ·{" "}
        <Link href={`/feed?wardId=${wardId}`}>news about them</Link>
      </p>
      <div className="grid two">
        {leaders.map((l) => (
          <LeaderCard key={l.tenureId} l={l} />
        ))}
      </div>
    </>
  );
}
