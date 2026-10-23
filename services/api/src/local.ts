// Local development server: same Hono app as the Lambda, on http://localhost:4000.
import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`POL API on http://localhost:${port} (DB_DRIVER=${process.env.DB_DRIVER ?? "pg"}, AUTH_MODE=${process.env.AUTH_MODE})`);
});
