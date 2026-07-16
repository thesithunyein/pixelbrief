import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { generateBrandKit, generatePaletteOnly, type BrandMood } from "./brand-kit.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const PORT = Number(process.env.PORT || 4000);
const NETWORK = (process.env.X402_NETWORK || "eip155:196") as `${string}:${string}`;
const PAY_TO = process.env.PAY_TO_ADDRESS || "";
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

const hasPaymentKeys = Boolean(
  PAY_TO && process.env.OKX_API_KEY && process.env.OKX_SECRET_KEY && process.env.OKX_PASSPHRASE,
);

/** Explicit false disables; otherwise auto-on when OKX keys + pay address exist. */
const REQUIRE_PAYMENT =
  (process.env.REQUIRE_PAYMENT ?? "").toLowerCase() === "true"
    ? true
    : (process.env.REQUIRE_PAYMENT ?? "").toLowerCase() === "false"
      ? false
      : hasPaymentKeys;

const moodSchema = z.enum(["bold", "calm", "luxury", "playful", "tech", "organic"]);

const brandQuerySchema = z.object({
  name: z.string().min(1).max(64),
  tagline: z.string().max(140).optional(),
  industry: z.string().max(64).optional(),
  mood: moodSchema.optional(),
  style: z.enum(["mark", "wordmark", "badge"]).optional(),
  useAi: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === "true")),
});

export async function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // On Vercel, static files are served from /public by the CDN.
  // express.static against a missing lambda filesystem path crashes the function.
  if (!process.env.VERCEL) {
    app.use(express.static(publicDir, { maxAge: "1h", etag: true }));
  }

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "PixelBrief",
      payment: REQUIRE_PAYMENT ? "x402" : "disabled-local",
      network: NETWORK,
      publicBaseUrl: PUBLIC_BASE_URL,
      ai: {
        configured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY),
        gemini: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
        preferredModel: process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image",
      },
    });
  });

  app.get("/api", (_req, res) => {
    res.json({
      name: "PixelBrief",
      category: "Art creation",
      type: "A2MCP",
      pitch: "One prompt → full brand kit (logo SVG, palette, type, social posts, thumbnail brief).",
      endpoints: {
        health: `${PUBLIC_BASE_URL}/health`,
        preview: `${PUBLIC_BASE_URL}/v1/preview/brand-kit?name=Acme&mood=tech`,
        brandKit: `${PUBLIC_BASE_URL}/v1/brand-kit?name=Acme&industry=saas&mood=tech&style=wordmark`,
        logo: `${PUBLIC_BASE_URL}/v1/logo?name=Acme&style=mark`,
        palette: `${PUBLIC_BASE_URL}/v1/palette?mood=tech`,
      },
      pricesUsd: {
        preview: "free",
        brandKit: "$0.25",
        logo: "$0.05",
        palette: "$0.02",
      },
      brand: {
        mark: `${PUBLIC_BASE_URL}/brand/logo-mark.png`,
        lockup: `${PUBLIC_BASE_URL}/brand/logo-mark.png`,
        appIcon: `${PUBLIC_BASE_URL}/brand/app-icon.png`,
      },
      okxai: {
        listingCategory: "Art creation",
        tracks: ["Artistic Excellence", "Creative Genius", "Best Product", "Revenue Rocket", "Social Buzz"],
      },
    });
  });

  // Free studio preview (browser demo). Paid ASP routes stay behind x402.
  app.get("/v1/preview/brand-kit", async (req, res) => {
    const parsed = brandQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
      return;
    }
    // Studio stays instant: procedural logo by default, AI only if explicitly requested.
    const kit = await generateBrandKit({ ...parsed.data, useAi: parsed.data.useAi === true });
    res.json({ ...kit, meta: { ...kit.meta, mode: "preview", paidRoute: "/v1/brand-kit" } });
  });

  if (REQUIRE_PAYMENT) {
    if (!hasPaymentKeys) {
      throw new Error(
        "Payment enabled but missing PAY_TO_ADDRESS / OKX_API_KEY / OKX_SECRET_KEY / OKX_PASSPHRASE. Set REQUIRE_PAYMENT=false for free preview.",
      );
    }

    const { paymentMiddleware, x402ResourceServer } = await import("@okxweb3/x402-express");
    const { ExactEvmScheme } = await import("@okxweb3/x402-evm/exact/server");
    const { OKXFacilitatorClient } = await import("@okxweb3/x402-core");

    const facilitatorClient = new OKXFacilitatorClient({
      apiKey: process.env.OKX_API_KEY!,
      secretKey: process.env.OKX_SECRET_KEY!,
      passphrase: process.env.OKX_PASSPHRASE!,
    });

    const resourceServer = new x402ResourceServer(facilitatorClient);
    resourceServer.register(NETWORK, new ExactEvmScheme());

    app.use(
      paymentMiddleware(
        {
          "GET /v1/brand-kit": {
            accepts: [
              {
                scheme: "exact",
                network: NETWORK,
                payTo: PAY_TO,
                price: "$0.25",
              },
            ],
            description: "PixelBrief full brand kit: logo SVG, palette, type, social posts, thumbnail brief",
            mimeType: "application/json",
          },
          "GET /v1/logo": {
            accepts: [
              {
                scheme: "exact",
                network: NETWORK,
                payTo: PAY_TO,
                price: "$0.05",
              },
            ],
            description: "PixelBrief logo SVG only",
            mimeType: "application/json",
          },
          "GET /v1/palette": {
            accepts: [
              {
                scheme: "exact",
                network: NETWORK,
                payTo: PAY_TO,
                price: "$0.02",
              },
            ],
            description: "PixelBrief palette + font pairing",
            mimeType: "application/json",
          },
        },
        resourceServer,
      ),
    );
  }

  app.get("/v1/brand-kit", async (req, res) => {
    const parsed = brandQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
      return;
    }
    res.json(await generateBrandKit(parsed.data));
  });

  app.get("/v1/logo", async (req, res) => {
    const parsed = brandQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
      return;
    }
    const kit = await generateBrandKit(parsed.data);
    res.json({
      service: "PixelBrief",
      brand: kit.brand.name,
      style: kit.logo.style,
      svg: kit.logo.svg,
      markSvg: kit.logo.markSvg,
      imageDataUrl: kit.logo.imageDataUrl,
      engine: kit.logo.engine,
      palette: kit.palette,
      meta: kit.meta,
    });
  });

  app.get("/v1/palette", (req, res) => {
    const mood = moodSchema.safeParse(req.query.mood ?? "tech");
    if (!mood.success) {
      res.status(400).json({ error: "mood must be bold|calm|luxury|playful|tech|organic" });
      return;
    }
    const nameParam = typeof req.query.name === "string" ? req.query.name : undefined;
    res.json(generatePaletteOnly(mood.data as BrandMood, nameParam));
  });

  return app;
}

export const runtimeConfig = {
  PORT,
  REQUIRE_PAYMENT,
  NETWORK,
  PUBLIC_BASE_URL,
};
