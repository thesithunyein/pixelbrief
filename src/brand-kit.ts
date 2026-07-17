import { aiConfigured, generateAiLogo } from "./ai-logo.js";

export type BrandMood =
  | "bold"
  | "calm"
  | "luxury"
  | "playful"
  | "tech"
  | "organic";

export type BrandKitRequest = {
  name: string;
  tagline?: string;
  industry?: string;
  mood?: BrandMood;
  style?: "mark" | "wordmark" | "badge";
  useAi?: boolean;
};

export type BrandKit = {
  service: "PixelBrief";
  version: "1.1.0";
  brand: {
    name: string;
    tagline: string;
    industry: string;
    mood: BrandMood;
    voice: string[];
    positioning: string;
  };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    cssVariables: Record<string, string>;
  };
  typography: {
    display: string;
    body: string;
    pairingReason: string;
  };
  logo: {
    style: string;
    svg: string;
    markSvg: string;
    imageDataUrl?: string;
    engine: "procedural" | "gemini" | "openai";
    usage: string[];
  };
  socialPosts: Array<{
    platform: "x" | "linkedin" | "instagram";
    caption: string;
    visualDirection: string;
  }>;
  thumbnailBrief: {
    title: string;
    subtitle: string;
    composition: string;
    colors: string[];
  };
  deliverables: string[];
  meta: {
    generatedAt: string;
    priceHintUsd: string;
    seed: number;
    aiConfigured: boolean;
    aiError?: string;
    aiModel?: string;
    mode?: string;
    paidRoute?: string;
  };
};

type Palette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

const MOOD_PALETTES: Record<BrandMood, Palette> = {
  bold: {
    primary: "#E11D48",
    secondary: "#0F172A",
    accent: "#FBBF24",
    background: "#FFF7ED",
    text: "#1C1917",
  },
  calm: {
    primary: "#0D9488",
    secondary: "#164E63",
    accent: "#A5F3FC",
    background: "#F0FDFA",
    text: "#134E4A",
  },
  luxury: {
    primary: "#B45309",
    secondary: "#1C1917",
    accent: "#D6D3D1",
    background: "#FAFAF9",
    text: "#0C0A09",
  },
  playful: {
    primary: "#7C3AED",
    secondary: "#DB2777",
    accent: "#FDE047",
    background: "#FFFBEB",
    text: "#312E81",
  },
  tech: {
    // Distinct from Apple system blue / near-black — electric indigo + slate.
    primary: "#4F46E5",
    secondary: "#0F172A",
    accent: "#22D3EE",
    background: "#F1F5F9",
    text: "#0F172A",
  },
  organic: {
    primary: "#65A30D",
    secondary: "#3F6212",
    accent: "#FDE68A",
    background: "#FEFCE8",
    text: "#1A2E05",
  },
};

const TYPE_PAIRS: Record<BrandMood, { display: string; body: string; reason: string }> = {
  bold: {
    display: "Archivo Black",
    body: "Source Sans 3",
    reason: "Heavy display for impact; clean sans for UI and captions.",
  },
  calm: {
    display: "Fraunces",
    body: "Nunito Sans",
    reason: "Soft serif warmth with readable, friendly body text.",
  },
  luxury: {
    display: "Cormorant Garamond",
    body: "Manrope",
    reason: "Editorial serif prestige with modern geometric body.",
  },
  playful: {
    display: "Baloo 2",
    body: "DM Sans",
    reason: "Rounded display energy with crisp product copy.",
  },
  tech: {
    display: "Space Grotesk",
    body: "IBM Plex Sans",
    reason: "Engineered display geometry with developer-native body.",
  },
  organic: {
    display: "Literata",
    body: "Karla",
    reason: "Natural bookish display with honest utilitarian body.",
  },
};

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Shifts a color's hue (and lightly its saturation) so every brand name gets a
// distinct palette while staying inside the mood's tonal family.
function shiftColor(hex: string, hueDelta: number, satDelta = 0, ligDelta = 0): string {
  const { h, s, l } = hexToHsl(hex);
  // Near-grey colors (low saturation) keep their neutrality; only tint slightly.
  const effectiveHue = s < 12 ? hueDelta * 0.25 : hueDelta;
  return hslToHex(h + effectiveHue, s + satDelta, l + ligDelta);
}

// Deterministic per-name palette derived from the mood base palette.
function personalizePalette(base: Palette, seed: number): Palette {
  const primaryShift = (seed % 71) - 35; // -35..+35 deg
  const accentShift = primaryShift + (((seed >> 6) % 31) - 15);
  const secondaryShift = Math.round(primaryShift / 2);
  const satNudge = (((seed >> 3) % 17) - 8); // -8..+8
  return {
    primary: shiftColor(base.primary, primaryShift, satNudge),
    secondary: shiftColor(base.secondary, secondaryShift),
    accent: shiftColor(base.accent, accentShift, satNudge),
    background: shiftColor(base.background, Math.round(primaryShift / 3)),
    text: base.text,
  };
}

function pickMood(name: string, industry: string, requested?: BrandMood): BrandMood {
  if (requested) return requested;
  const blob = `${name} ${industry}`.toLowerCase();
  if (/(ai|dev|saas|crypto|chain|data|api)/.test(blob)) return "tech";
  if (/(food|farm|garden|health|wellness|eco|lgbt|pride)/.test(blob)) return "organic";
  if (/(bank|wealth|watch|law|hotel|wine)/.test(blob)) return "luxury";
  if (/(kid|game|toy|social|creator)/.test(blob)) return "playful";
  if (/(yoga|spa|therapy|sleep|mind)/.test(blob)) return "calm";
  return "bold";
}

/** App-icon monogram: one letter for a single word, two letters for multi-word names. */
function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) {
    const letter = parts[0]!.replace(/[^a-zA-Z0-9]/g, "").charAt(0);
    return (letter || "P").toUpperCase();
  }
  const a = (parts[0]!.replace(/[^a-zA-Z0-9]/g, "").charAt(0) || "P").toUpperCase();
  const b = (parts[1]!.replace(/[^a-zA-Z0-9]/g, "").charAt(0) || "").toUpperCase();
  return `${a}${b}`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildProceduralMark(name: string, palette: Palette, seed: number): string {
  const mono = escapeXml(monogram(name));
  const variant = seed % 6;
  const gid = `g${seed.toString(16)}`;

  const commonDefs = `
  <defs>
    <linearGradient id="${gid}-a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.primary}"/>
      <stop offset="100%" stop-color="${palette.accent}"/>
    </linearGradient>
    <radialGradient id="${gid}-b" cx="30%" cy="25%" r="75%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="${palette.primary}"/>
      <stop offset="100%" stop-color="${palette.secondary}"/>
    </radialGradient>
    <filter id="${gid}-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

  // Container shape (variant-based). Brand initial is the only focal glyph.
  let container = "";
  if (variant === 0) {
    container = `<circle cx="256" cy="256" r="184" fill="url(#${gid}-b)"/>`;
  } else if (variant === 1) {
    container = `<rect x="72" y="72" width="368" height="368" rx="104" fill="url(#${gid}-a)"/>`;
  } else if (variant === 2) {
    container = `
    <circle cx="256" cy="256" r="184" fill="${palette.secondary}"/>
    <circle cx="256" cy="256" r="184" fill="none" stroke="url(#${gid}-a)" stroke-width="20"/>
    <circle cx="256" cy="256" r="150" fill="url(#${gid}-a)"/>`;
  } else if (variant === 3) {
    container = `<rect x="72" y="72" width="368" height="368" rx="104" fill="${palette.secondary}"/>`;
  } else if (variant === 4) {
    container = `<circle cx="256" cy="256" r="180" fill="url(#${gid}-a)" filter="url(#${gid}-soft)"/>`;
  } else {
    container = `
    <rect x="72" y="72" width="368" height="368" rx="120" fill="url(#${gid}-b)"/>
    <circle cx="366" cy="146" r="30" fill="${palette.accent}"/>`;
  }

  const glyphSize = mono.length >= 2 ? 168 : 260;
  const artwork = `${container}
    <text x="256" y="256" text-anchor="middle" dominant-baseline="central" font-family="Space Grotesk, Arial, sans-serif" font-size="${glyphSize}" font-weight="700" letter-spacing="-8" fill="${palette.background}" data-pb="background">${mono}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escapeXml(name)} mark" data-pb-mark="1">
  ${commonDefs}
  <rect width="512" height="512" rx="112" fill="${palette.background}" data-pb="background"/>
  ${artwork}
</svg>`;
}

function buildWordmark(name: string, palette: Palette, seed: number, style: "wordmark" | "badge"): string {
  const safe = escapeXml(name);
  const mono = escapeXml(monogram(name));
  const gid = `w${seed.toString(16)}`;
  const markSize = mono.length >= 2 ? 36 : 52;
  const badgeMarkSize = mono.length >= 2 ? 42 : 64;

  if (style === "badge") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="920" height="300" viewBox="0 0 920 300" role="img" aria-label="${safe} badge">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.primary}"/>
      <stop offset="100%" stop-color="${palette.accent}"/>
    </linearGradient>
  </defs>
  <rect width="920" height="300" rx="48" fill="${palette.secondary}" data-pb="secondary"/>
  <circle cx="150" cy="150" r="78" fill="url(#${gid})"/>
  <text x="150" y="150" text-anchor="middle" dominant-baseline="central" font-family="Space Grotesk, Arial, sans-serif" font-size="${badgeMarkSize}" font-weight="700" fill="${palette.background}" data-pb="background">${mono}</text>
  <text x="270" y="138" font-family="Space Grotesk, Arial, sans-serif" font-size="60" font-weight="700" fill="${palette.background}" data-pb="background">${safe}</text>
  <text x="270" y="186" font-family="IBM Plex Sans, Arial, sans-serif" font-size="24" fill="${palette.accent}" data-pb="accent">Brand system · ready to ship</text>
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="300" viewBox="0 0 1000 300" role="img" aria-label="${safe} wordmark">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.primary}"/>
      <stop offset="100%" stop-color="${palette.accent}"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="300" fill="${palette.background}" data-pb="background"/>
  <circle cx="110" cy="150" r="62" fill="url(#${gid})"/>
  <text x="110" y="150" text-anchor="middle" dominant-baseline="central" font-family="Space Grotesk, Arial, sans-serif" font-size="${markSize}" font-weight="700" fill="${palette.background}" data-pb="background">${mono}</text>
  <text x="210" y="162" font-family="Space Grotesk, Arial, sans-serif" font-size="72" font-weight="700" fill="${palette.text}" data-pb="text">${safe}</text>
  <rect x="210" y="190" width="240" height="10" rx="5" fill="${palette.primary}" data-pb="primary"/>
</svg>`;
}

function defaultTagline(name: string, industry: string, mood: BrandMood): string {
  const templates: Record<BrandMood, string> = {
    bold: `${name} helps you make a stronger first impression.`,
    calm: `${name} keeps things quiet, clear, and easy.`,
    luxury: `${name} is a refined look for ${industry || "premium"} brands.`,
    playful: `${name} is serious about results, with a lighter vibe.`,
    tech: `${name} gives ${industry || "builders"} an agent ready identity.`,
    organic: `${name} grows a grounded brand system that still feels human.`,
  };
  return templates[mood];
}

function voiceFor(mood: BrandMood): string[] {
  const map: Record<BrandMood, string[]> = {
    bold: ["direct", "confident", "urgent", "clear"],
    calm: ["steady", "warm", "reassuring", "simple"],
    luxury: ["precise", "restrained", "elevated", "tactile"],
    playful: ["witty", "bright", "human", "curious"],
    tech: ["exact", "modular", "fast", "credible"],
    organic: ["honest", "earthy", "patient", "local"],
  };
  return map[mood];
}

function hashtagToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, "");
}

function socialCopy(name: string, tagline: string, mood: BrandMood, industry: string) {
  const brandTag = hashtagToken(name) || "Brand";
  const industryTag = hashtagToken(industry) || "Startup";
  const moodTag = hashtagToken(mood);

  return [
    {
      platform: "x" as const,
      caption: `Meet ${name}.\n${tagline}\n\nFresh logo, colors, and captions ready to post.\n\n#${brandTag} #${industryTag} #BrandKit #OKXAI`,
      visualDirection: `Put the logo dead center. Keep space around it. One short line of text under the mark.`,
    },
    {
      platform: "linkedin" as const,
      caption: `We just locked the visual identity for ${name}.\n\n${tagline}\n\nThis kit covers the logo, palette, type pairing, and social copy for ${industry}. Mood: ${mood}.\n\nIf you are hiring an agent for creative work, this is the kind of deliverable you want back.\n\n#${brandTag} #${industryTag} #${moodTag} #Branding #OKXAI`,
      visualDirection: `Logo on the left. Three color swatches on the right. Keep it clean and corporate.`,
    },
    {
      platform: "instagram" as const,
      caption: `${name} lookbook\n${tagline}\n\nLogo + palette + captions in one pass.\nSave this if you are building in public.\n\n#${brandTag} #${industryTag} #LogoDesign #BrandIdentity #OKXAI`,
      visualDirection: `Square crop of the logo. Soft background from the palette. Caption sticker optional.`,
    },
  ];
}

export async function generateBrandKit(input: BrandKitRequest): Promise<BrandKit> {
  const name = input.name.trim() || "Untitled";
  const industry = (input.industry ?? "general").trim() || "general";
  const mood = pickMood(name, industry, input.mood);
  const style = input.style ?? "wordmark";
  const seed = hashSeed(`${name}|${industry}|${mood}|${style}`);
  const palette = personalizePalette(MOOD_PALETTES[mood], seed);
  const type = TYPE_PAIRS[mood];
  const tagline = (input.tagline?.trim() || defaultTagline(name, industry, mood)).slice(0, 140);
  const markSvg = buildProceduralMark(name, palette, seed);
  const fullSvg =
    style === "mark" ? markSvg : buildWordmark(name, palette, seed, style === "badge" ? "badge" : "wordmark");

  let engine: BrandKit["logo"]["engine"] = "procedural";
  let imageDataUrl: string | undefined;
  let aiError: string | undefined;
  let aiModel: string | undefined;

  const wantAi = input.useAi !== false && aiConfigured();
  if (wantAi) {
    const attempt = await generateAiLogo({
      name,
      industry,
      mood,
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
    });
    if (attempt.result) {
      engine = attempt.result.provider;
      imageDataUrl = attempt.result.dataUrl;
      aiModel = attempt.result.model;
    } else {
      aiError = attempt.error || "AI logo generation failed";
    }
  }

  return {
    service: "PixelBrief",
    version: "1.1.0",
    brand: {
      name,
      tagline,
      industry,
      mood,
      voice: voiceFor(mood),
      positioning: `${name} is a ${mood} ${industry} brand that turns a vague brief into a shippable visual system in one agent call.`,
    },
    palette: {
      ...palette,
      cssVariables: {
        "--pb-primary": palette.primary,
        "--pb-secondary": palette.secondary,
        "--pb-accent": palette.accent,
        "--pb-bg": palette.background,
        "--pb-text": palette.text,
      },
    },
    typography: {
      display: type.display,
      body: type.body,
      pairingReason: type.reason,
    },
    logo: {
      style,
      svg: fullSvg,
      markSvg,
      imageDataUrl,
      engine,
      usage: [
        "Use mark on app icons and favicons",
        "Use wordmark/badge in headers and social avatars",
        "Keep clear space equal to the mark radius",
        "Recolor via studio swatches or CSS variables",
      ],
    },
    socialPosts: socialCopy(name, tagline, mood, industry),
    thumbnailBrief: {
      title: name,
      subtitle: tagline,
      composition: "Left third: logo mark. Right two-thirds: bold title + thin subtitle. High contrast.",
      colors: [palette.primary, palette.secondary, palette.accent, palette.background],
    },
    deliverables: [
      engine === "procedural" ? "Logo SVG (procedural system)" : `AI logo (${engine}${aiModel ? ` / ${aiModel}` : ""}) + SVG system`,
      "5-color palette + CSS variables",
      "Font pairing with rationale",
      "3 social captions with art direction",
      "YouTube/thumbnail composition brief",
    ],
    meta: {
      generatedAt: new Date().toISOString(),
      priceHintUsd: "0.25",
      seed,
      aiConfigured: aiConfigured(),
      aiError,
      aiModel,
    },
  };
}

export function generatePaletteOnly(mood: BrandMood = "tech", variant?: string) {
  const base = MOOD_PALETTES[mood];
  const palette = variant?.trim() ? personalizePalette(base, hashSeed(`${variant}|${mood}`)) : base;
  return {
    service: "PixelBrief",
    mood,
    palette: {
      ...palette,
      cssVariables: {
        "--pb-primary": palette.primary,
        "--pb-secondary": palette.secondary,
        "--pb-accent": palette.accent,
        "--pb-bg": palette.background,
        "--pb-text": palette.text,
      },
    },
    typography: TYPE_PAIRS[mood],
  };
}
