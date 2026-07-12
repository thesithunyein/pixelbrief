import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app.js";

const app = await createApp();

/**
 * Vercel rewrites `/health` and `/v1/*` → `/api`.
 * Restore the original path so Express route matching still works.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const forwarded =
    (typeof req.headers["x-forwarded-uri"] === "string" && req.headers["x-forwarded-uri"]) ||
    (typeof req.headers["x-invoke-path"] === "string" && req.headers["x-invoke-path"]) ||
    "";

  if (forwarded.startsWith("/v1") || forwarded === "/health" || forwarded.startsWith("/api")) {
    const queryIndex = typeof req.url === "string" ? req.url.indexOf("?") : -1;
    const query = queryIndex >= 0 ? req.url!.slice(queryIndex) : "";
    const pathOnly = forwarded.split("?")[0] || forwarded;
    req.url = `${pathOnly}${query}`;
  }

  return app(req as never, res as never);
}
