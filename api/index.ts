import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app.js";

const appPromise = createApp();

function originalPath(req: VercelRequest): string {
  const forwarded =
    (typeof req.headers["x-forwarded-uri"] === "string" && req.headers["x-forwarded-uri"]) ||
    (typeof req.headers["x-invoke-path"] === "string" && req.headers["x-invoke-path"]) ||
    req.url ||
    "/";
  return forwarded.split("?")[0] || "/";
}

/**
 * Vercel rewrites `/health` and `/v1/*` → `/api`.
 * Never let `/` or static asset paths fall into Express on Vercel.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = originalPath(req);

    if (path === "/" || path === "") {
      res.statusCode = 308;
      res.setHeader("Location", "/index.html");
      res.end();
      return;
    }

    // Static assets must not be handled by this function.
    if (
      path.startsWith("/brand/") ||
      path.endsWith(".svg") ||
      path.endsWith(".png") ||
      path.endsWith(".html") ||
      path.endsWith(".webmanifest") ||
      path === "/favicon.ico"
    ) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "static_miss", path }));
      return;
    }

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

    const app = await appPromise;
    return app(req as never, res as never);
  } catch (err) {
    console.error("[PixelBrief] api handler error", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "pixelbrief_api_crash",
        message: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}
