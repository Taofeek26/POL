"use client";
// Onboarding step: state -> LGA -> ward (blueprint 6.1). Remembers the ward on this device.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, homeWard } from "@/lib/api";

type Opt = { id: string; name: string };

export function LocationPicker({ states }: { states: Opt[] }) {
  const router = useRouter();
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");
  const [lgas, setLgas] = useState<Opt[]>([]);
  const [wards, setWards] = useState<Opt[]>([]);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => setSaved(homeWard.get()), []);
  useEffect(() => {
    setLga("");
    setLgas([]);
    if (state) api<Opt[]>(`/geo/states/${state}/lgas`).then(setLgas);
  }, [state]);
  useEffect(() => {
    setWard("");
    setWards([]);
    if (lga) api<Opt[]>(`/geo/lgas/${lga}/wards`).then(setWards);
  }, [lga]);

  const go = () => {
    homeWard.set(ward);
    router.push(`/leaders/${ward}`);
  };

  return (
    <div className="card">
      {saved && (
        <p>
          <a href={`/leaders/${saved}`}>Go to my saved ward →</a>
        </p>
      )}
      <div className="row">
        <div className="field">
          <label htmlFor="state">State</label>
          <select id="state" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Choose…</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="lga">LGA</label>
          <select id="lga" value={lga} onChange={(e) => setLga(e.target.value)} disabled={!lgas.length}>
            <option value="">Choose…</option>
            {lgas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ward">Ward</label>
          <select id="ward" value={ward} onChange={(e) => setWard(e.target.value)} disabled={!wards.length}>
            <option value="">Choose…</option>
            {wards.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button className="primary" disabled={!ward} onClick={go}>
        Show my leaders
      </button>
    </div>
  );
}
