import assert from "node:assert/strict";
import { test } from "node:test";
import { toPositional } from "./db.js";
import {
  buildPeerTable,
  computeApproval,
  computePerformance,
  confidenceFor,
  percentileRank,
  projectPoints,
  type RatingInput,
  type TenureRecord,
} from "./scoring.js";

const base = (over: Partial<TenureRecord> = {}): TenureRecord => ({
  tenureId: "t",
  officeType: "lga_chair",
  projects: [],
  promises: [],
  budgets: [],
  legislative: null,
  foi: { sent: 0, responded: 0 },
  townHalls: null,
  ...over,
});

test("project points follow tier x status x verification", () => {
  assert.equal(projectPoints([{ valueTier: 3, status: "completed_working", verification: "verified" }]), 3);
  assert.equal(projectPoints([{ valueTier: 2, status: "abandoned", verification: "reported" }]), 2 * -0.3 * 0.7);
  assert.equal(projectPoints([{ valueTier: 5, status: "completed_working", verification: "disputed" }]), 0);
});

test("percentile rank puts the median peer at 50", () => {
  assert.equal(percentileRank(5, [1, 5, 9]), 50);
  assert.equal(percentileRank(9, [1, 5, 9]), 83.33);
  assert.equal(percentileRank(1, []), 50);
});

test("components without data are left out and their weight redistributed", () => {
  const r = base({
    promises: [{ status: "kept" }, { status: "kept" }, { status: "broken" }, { status: "in_progress" }],
    budgets: [{ published: true, capitalImplementationPct: 50 }],
    foi: { sent: 2, responded: 1 },
  });
  const out = computePerformance(r, buildPeerTable([r]));
  const promises = out.components.find((c) => c.component === "promises")!;
  assert.equal(promises.score, 62.5);
  assert.equal(out.components.find((c) => c.component === "outcomes")!.score, null);
  // budget 70, promises 62.5, transparency 75 over weights 0.2/0.2/0.15
  assert.equal(out.performance, Math.round(((0.2 * 70 + 0.2 * 62.5 + 0.15 * 75) / 0.55) * 100) / 100);
});

test("too little data gives 'insufficient' and hides the number", () => {
  const r = base({ promises: [{ status: "kept" }] });
  const out = computePerformance(r, buildPeerTable([r]));
  assert.equal(out.confidence, "insufficient");
  assert.equal(out.performance, null);
});

test("confidence thresholds", () => {
  assert.equal(confidenceFor(3, 1), "insufficient");
  assert.equal(confidenceFor(5, 1), "low");
  assert.equal(confidenceFor(12, 1), "medium");
  assert.equal(confidenceFor(25, 1), "high");
  assert.equal(confidenceFor(25, 0.4), "low");
});

const rating = (over: Partial<RatingInput>): RatingInput => ({
  value: 1,
  updatedAt: new Date().toISOString(),
  isResident: true,
  verification: "phone",
  flagged: false,
  ...over,
});

test("unverified and flagged ratings never count", () => {
  const out = computeApproval([
    rating({ value: -1, verification: "unverified", count: 1000 }),
    rating({ value: -1, flagged: true, count: 1000 }),
  ]);
  assert.equal(out.approvePct, null);
  assert.equal(out.unverifiedReactions, 1000);
  assert.equal(out.verifiedResidents, 0);
});

test("residents outweigh non-residents and small samples are smoothed", () => {
  const out = computeApproval([rating({ value: 1, count: 200 }), rating({ value: -1, isResident: false, count: 200 })]);
  // 200 up vs 50 down (0.25 weight), plus 20 pseudo-votes split 50/50
  assert.equal(out.approvePct, Math.round(((200 + 10) / (250 + 20)) * 10000) / 100);
  assert.equal(out.verifiedResidents, 200);
  assert.equal(out.lowSample, false);
  assert.equal(computeApproval([rating({ count: 5 })]).lowSample, true);
});

test("ratings decay with a 12-month half-life", () => {
  const now = new Date("2027-06-01T00:00:00Z");
  const old = rating({ value: -1, updatedAt: "2026-06-01T00:00:00Z", count: 100 });
  const fresh = rating({ value: 1, updatedAt: "2027-06-01T00:00:00Z", count: 100 });
  const out = computeApproval([old, fresh], now);
  assert.ok(out.approvePct! > 60, `expected fresh opinion to dominate, got ${out.approvePct}`);
});

test("named params become positional and casts are preserved", () => {
  const { text, values } = toPositional("select :a::uuid, :b, :a where x = :b::jsonb", { a: "1", b: { k: 1 } });
  assert.equal(text, "select $1::uuid, $2, $1 where x = $2::jsonb");
  assert.deepEqual(values, ["1", '{"k":1}']);
  assert.throws(() => toPositional("select :missing", {}));
});
