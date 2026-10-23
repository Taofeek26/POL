// EventBridge nightly schedule -> score engine.
import { runScoreEngine } from "../scoreEngine.js";

export const handler = async () => {
  const result = await runScoreEngine("schedule:nightly");
  console.log(JSON.stringify({ msg: "scores recomputed", ...result }));
  return result;
};
