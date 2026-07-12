import type { BrandMood } from "./brand-kit.js";

export type AiLogoResult = {
  dataUrl: string;
  provider: "gemini" | "openai";
  mimeType: string;
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
    `Design a premium app icon / brand mark for "${input.name}".`,
    `Industry: ${input.industry}. Mood: ${input.mood}.`,
    `Flat vector style, Apple-tier minimal, centered on a rounded square.`,
    `Use brand colors approximately ${input.primary}, ${input.secondary}, ${input.accent}.`,
    `No fake text logos with random letters. Abstract geometric mark only.`,
    `No mockups, no shadows collage, no watermark, square 1:1, high contrast.`,
  ].join(" ");
}

export async function generateAiLogo(input: {
  name: string;
  industry: string;
  mood: BrandMood;
  primary: string;
  secondary: string;
  accent: string;
}): Promise<AiLogoResult | null> {
  const prompt = logoPrompt(input);
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.0-flash-preview-image-generation";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        },
      );
      if (!res.ok) {
        console.error("[PixelBrief] Gemini logo failed", res.status, await res.text());
      } else {
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }>;
        };
        const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
        if (part?.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          return {
            provider: "gemini",
            mimeType,
            dataUrl: `data:${mimeType};base64,${part.inlineData.data}`,
          };
        }
      }
    } catch (err) {
      console.error("[PixelBrief] Gemini logo error", err);
    }
  }

  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
          prompt,
          size: "1024x1024",
        }),
      });
      if (!res.ok) {
        console.error("[PixelBrief] OpenAI logo failed", res.status, await res.text());
      } else {
        const data = (await res.json()) as {
          data?: Array<{ b64_json?: string; url?: string }>;
        };
        const first = data.data?.[0];
        if (first?.b64_json) {
          return {
            provider: "openai",
            mimeType: "image/png",
            dataUrl: `data:image/png;base64,${first.b64_json}`,
          };
        }
        if (first?.url) {
          const img = await fetch(first.url);
          const buf = Buffer.from(await img.arrayBuffer());
          return {
            provider: "openai",
            mimeType: "image/png",
            dataUrl: `data:image/png;base64,${buf.toString("base64")}`,
          };
        }
      }
    } catch (err) {
      console.error("[PixelBrief] OpenAI logo error", err);
    }
  }

  return null;
}

export function aiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY);
}
