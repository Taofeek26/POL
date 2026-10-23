import { LocationPicker } from "@/components/LocationPicker";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const states = await api<{ id: string; name: string }[]>("/geo/states", { revalidate: 3600 });
  return (
    <>
      <h1>Who represents you?</h1>
      <p className="muted">Pick your ward to see every office holder who represents you, from councillor to President.</p>
      <LocationPicker states={states} />
    </>
  );
}
