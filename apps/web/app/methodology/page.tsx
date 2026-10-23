import {
  APPROVAL_HALF_LIFE_DAYS,
  APPROVAL_MIN_RESIDENTS,
  APPROVAL_WEIGHT,
  COMPONENT_LABEL,
  COMPONENT_WEIGHTS,
  METHOD_VERSION,
  STATUS_MULTIPLIER,
  VERIFICATION_MULTIPLIER,
  type ScoreComponent,
} from "@pol/shared";

export const metadata = { title: "How scores work" };

const pct = (x: number | undefined) => (x === undefined ? "—" : `${Math.round(x * 100)}%`);

export default function Methodology() {
  const components = Object.keys(COMPONENT_LABEL) as ScoreComponent[];
  return (
    <>
      <h1>How scores work · v{METHOD_VERSION}</h1>
      <p>
        Every official has two separate numbers, never merged. The <strong>Performance Score</strong> (0–100) is built only from
        facts that can be checked. <strong>Citizen Approval</strong> is what POL users think. The gap between them is itself
        worth looking at.
      </p>

      <h2>Performance Score weights</h2>
      <div className="card table-scroll">
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Executive</th>
              <th>Legislator</th>
              <th>Councillor</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c}>
                <td>{COMPONENT_LABEL[c]}</td>
                <td>{pct(COMPONENT_WEIGHTS.executive[c])}</td>
                <td>{pct(COMPONENT_WEIGHTS.legislator[c])}</td>
                <td>{pct(COMPONENT_WEIGHTS.councillor[c])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        When a component has no data, its weight is shared out among the others. When there is too little verified data overall,
        no number is shown: <em>“Insufficient data”</em> is more honest than a guess.
      </p>

      <h2>Projects</h2>
      <p>Each project earns: value tier (1–5) × status × evidence. Totals are compared with others in the same office, so 50 means average.</p>
      <div className="grid two">
        <div className="card">
          <h3>Status</h3>
          <table>
            <tbody>
              {Object.entries(STATUS_MULTIPLIER).map(([k, v]) => (
                <tr key={k}>
                  <td>{k.replaceAll("_", " ")}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Evidence</h3>
          <table>
            <tbody>
              {Object.entries(VERIFICATION_MULTIPLIER).map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2>Citizen Approval</h2>
      <ul>
        <li>Verified residents of the official’s area count {APPROVAL_WEIGHT.resident}.</li>
        <li>Other verified Nigerians count {APPROVAL_WEIGHT.verifiedNonResident}.</li>
        <li>Unverified and flagged accounts count 0. Unverified ratings are shown separately.</li>
        <li>One rating per person per official. Reacting to news about them updates that one rating.</li>
        <li>Ratings lose half their weight every {APPROVAL_HALF_LIFE_DAYS} days, so the bar reflects current opinion.</li>
        <li>Below {APPROVAL_MIN_RESIDENTS} verified residents the bar is greyed out and pulled toward 50/50.</li>
      </ul>
      <p className="muted">Citizen Approval is the opinion of POL users. It is not a scientific poll or an election prediction.</p>
    </>
  );
}
