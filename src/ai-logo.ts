import type { BrandMood } from "./brand-kit.js";

export type AiLogoResult = {
  dataUrl: string;
  provider: "gemini" | "openai";
  mimeType: string;
  model?: string;
};

export type AiLogoAttempt = {
  result: AiLogoResult | null;
  error?: string;
};

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
};

function logoPrompt(input: {
  name: string;
  industry: string;
  mood: BrandMood;
  primary: string;
  secondary: string;
  accent: string;
}): string {
  return [
    `Create a square app icon / brand mark for the company "${input.name}".`,
    `Industry: ${input.industry}. Mood/style: ${input.mood}.`,
    `Premium flat vector look, Apple-tier minimal, centered composition.`,
    `Color palette guidance: primary ${input.primary}, secondary ${input.secondary}, accent ${input.accent}.`,
    `Abstract geometric logo mark on a rounded-square background.`,
    `Do not render fake random lettermarks or unreadable text.`,
    `No mockup scenes, no watermarks, no collage. Clean single icon, 1:1.`,
  ].join(" ");
}

function extractGeminiImage(data: unknown): { mimeType: string; data: string } | null {
  const root = data as {
    candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
    error?: { message?: string };
  };
  const parts = root.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    const b64 = inline?.data;
    if (!b64) continue;
    const mimeType = part.inlineData?.mimeType || part.inline_data?.mime_type || "image/png";
    return { mimeType, data: b64 };
  }
  return null;
}

async function tryGeminiModel(apiKey: string, model: string, prompt: string): Promise<AiLogoAttempt> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  async function post(body: Record<string, unknown>) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
    const rawText = await res.text();
    let json: unknown = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      return { ok: false as const, status: res.status, json: null, error: `non-JSON response (${res.status})` };
    }
    return { ok: res.ok, status: res.status, json, error: null as string | null };
  }

  const baseContents = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };

  // Prefer current image config; fall back if a model rejects imageConfig.
  const payloads = [
    {
      ...baseContents,
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: "1:1" },
      },
    },
    {
      ...baseContents,
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    },
    // Some models auto-return images from a simple prompt (official curl example).
    baseContents,
  ];

  const errors: string[] = [];
  for (const body of payloads) {
    const res = await post(body);
    if (!res.json) {
      errors.push(`Gemini ${model}: ${res.error}`);
      continue;
    }
    if (!res.ok) {
      const msg = (res.json as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`;
      errors.push(`Gemini ${model}: ${msg}`);
      continue;
    }
    const image = extractGeminiImage(res.json);
    if (image) {
      return {
        result: {
          provider: "gemini",
          model,
          mimeType: image.mimeType,
          dataUrl: `data:${image.mimeType};base64,${image.data}`,
        },
      };
    }
    const blockReason = (res.json as { promptFeedback?: { blockReason?: string } })?.promptFeedback?.blockReason;
    const finish = (res.json as { candidates?: Array<{ finishReason?: string }> })?.candidates?.[0]?.finishReason;
    errors.push(
      `Gemini ${model}: no image${blockReason ? ` (blocked: ${blockReason})` : ""}${finish ? ` (finish: ${finish})` : ""}`,
    );
  }

  return { result: null, error: errors[errors.length - 1] || `Gemini ${model}: failed` };
}

async function tryOpenAIModel(apiKey: string, model: string, prompt: string): Promise<AiLogoAttempt> {
  const isGptImage = model.startsWith("gpt-image");
  const body: Record<string, unknown> = {
    model,
    prompt,
    size: "1024x1024",
    n: 1,
  };

  // gpt-image-* uses low/medium/high/auto — not standard/hd.
  if (isGptImage) {
    body.quality = process.env.OPENAI_IMAGE_QUALITY || "medium";
  }

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(rawText);
  } catch {
    return { result: null, error: `OpenAI ${model}: non-JSON response (${res.status})` };
  }

  if (!res.ok) {
    const msg = (json as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`;
    return { result: null, error: `OpenAI ${model}: ${msg}` };
  }

  const first = (json as { data?: Array<{ b64_json?: string; url?: string }> })?.data?.[0];
  if (first?.b64_json) {
    return {
      result: {
        provider: "openai",
        model,
        mimeType: "image/png",
        dataUrl: `data:image/png;base64,${first.b64_json}`,
      },
    };
  }
  if (first?.url) {
    const img = await fetch(first.url);
    if (!img.ok) {
      return { result: null, error: `OpenAI ${model}: failed to download image URL (${img.status})` };
    }
    const buf = Buffer.from(await img.arrayBuffer());
    return {
      result: {
        provider: "openai",
        model,
        mimeType: "image/png",
        dataUrl: `data:image/png;base64,${buf.toString("base64")}`,
      },
    };
  }
  return { result: null, error: `OpenAI ${model}: no image payload` };
}

async function tryOpenAI(apiKey: string, prompt: string): Promise<AiLogoAttempt> {
  // dall-e-2 / dall-e-3 were retired May 12, 2026. Use gpt-image-* only.
  const configured = process.env.OPENAI_IMAGE_MODEL?.trim();
  const models = [
    configured,
    "gpt-image-1",
    "gpt-image-1-mini",
    "gpt-image-1.5",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i && !String(m).startsWith("dall-e"));

  const errors: string[] = [];
  for (const model of models) {
    try {
      const attempt = await tryOpenAIModel(apiKey, model, prompt);
      if (attempt.result) return attempt;
      if (attempt.error) errors.push(attempt.error);
      if (attempt.error?.includes("does not exist") || attempt.error?.includes("model_not_found")) {
        continue;
      }
    } catch (err) {
      errors.push(`OpenAI ${model}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    result: null,
    error: errors.join(" | ") || "OpenAI: no working gpt-image model",
  };
}

/**
 * Prefers OpenAI when OPENAI_API_KEY is set (recommended).
 * Gemini is optional fallback — many free Gemini keys have image quota = 0.
 */
export async function generateAiLogo(input: {
  name: string;
  industry: string;
  mood: BrandMood;
  primary: string;
  secondary: string;
  accent: string;
}): Promise<AiLogoAttempt> {
  const prompt = logoPrompt(input);
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const prefer = (process.env.AI_IMAGE_PROVIDER || "").toLowerCase();
  const errors: string[] = [];

  if (!geminiKey && !openaiKey) {
    return { result: null, error: "No OPENAI_API_KEY / GEMINI_API_KEY configured" };
  }

  const runOpenAI = async () => {
    if (!openaiKey) return;
    try {
      const attempt = await tryOpenAI(openaiKey, prompt);
      if (attempt.result) return attempt;
      if (attempt.error) errors.push(attempt.error);
    } catch (err) {
      errors.push(`OpenAI: ${err instanceof Error ? err.message : String(err)}`);
    }
    return null;
  };

  const runGemini = async () => {
    if (!geminiKey) return;
    const configured = process.env.GEMINI_IMAGE_MODEL?.trim();
    const models = [
      configured,
      "gemini-3.1-flash-image",
      "gemini-2.5-flash-image",
      "gemini-3.1-flash-lite-image",
    ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    for (const model of models) {
      try {
        const attempt = await tryGeminiModel(geminiKey, model, prompt);
        if (attempt.result) return attempt;
        if (attempt.error) errors.push(attempt.error);
        // Free-tier image quota is often 0 — don't burn retries on every model.
        if (attempt.error?.includes("Quota exceeded") || attempt.error?.includes("limit: 0")) {
          break;
        }
      } catch (err) {
        errors.push(`Gemini ${model}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return null;
  };

  const order =
    prefer === "gemini"
      ? [runGemini, runOpenAI]
      : prefer === "openai" || openaiKey
        ? [runOpenAI, runGemini]
        : [runGemini, runOpenAI];

  for (const step of order) {
    const hit = await step();
    if (hit?.result) return hit;
  }

  return {
    result: null,
    error: errors.join(" | ") || "AI logo generation failed",
  };
}

export function aiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY);
}
