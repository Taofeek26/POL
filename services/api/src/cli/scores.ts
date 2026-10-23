// `pnpm scores`: run the score engine against whichever DB .env points at.
import { db } from "../db.js";
import { runScoreEngine } from "../scoreEngine.js";

const result = await runScoreEngine("cli");
console.log(`Scored ${result.scored} tenures`);
await db().close();
