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
};

export type BrandKit = {
  service: "PixelBrief";
  version: "1.0.0";
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
  };
};

const MOOD_PALETTES: Record<
  BrandMood,
  { primary: string; secondary: string; accent: string; background: string; text: string }
> = {
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
    primary: "#2563EB",
    secondary: "#020617",
    accent: "#22D3EE",
    background: "#F8FAFC",
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

function pickMood(name: string, industry: string, requested?: BrandMood): BrandMood {
  if (requested) return requested;
  const blob = `${name} ${industry}`.toLowerCase();
  if (/(ai|dev|saas|crypto|chain|data|api)/.test(blob)) return "tech";
  if (/(food|farm|garden|health|wellness|eco)/.test(blob)) return "organic";
  if (/(bank|wealth|watch|law|hotel|wine)/.test(blob)) return "luxury";
  if (/(kid|game|toy|social|creator)/.test(blob)) return "playful";
  if (/(yoga|spa|therapy|sleep|mind)/.test(blob)) return "calm";
  return "bold";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PB";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildMarkSvg(
  name: string,
  palette: (typeof MOOD_PALETTES)[BrandMood],
  seed: number,
  style: "mark" | "wordmark" | "badge",
): { full: string; mark: string } {
  const mono = initials(name);
  const safeName = escapeXml(name);
  const r1 = 40 + (seed % 30);
  const r2 = 18 + ((seed >> 3) % 20);
  const rot = seed % 45;

  const mark = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${safeName} mark">
  <rect width="512" height="512" rx="96" fill="${palette.background}"/>
  <g transform="translate(256 256) rotate(${rot})">
    <circle r="${r1 + 40}" fill="${palette.primary}" opacity="0.18"/>
    <circle r="${r1}" fill="${palette.primary}"/>
    <circle cx="${r2}" cy="${-r2}" r="${Math.max(12, r2)}" fill="${palette.accent}"/>
    <rect x="${-r1}" y="${-8}" width="${r1 * 2}" height="16" rx="8" fill="${palette.secondary}" opacity="0.85"/>
  </g>
  <text x="256" y="292" text-anchor="middle" font-family="Space Grotesk, Arial, sans-serif" font-size="120" font-weight="700" fill="${palette.text}">${escapeXml(mono)}</text>
</svg>`;

  if (style === "mark") {
    return { full: mark, mark };
  }

  if (style === "badge") {
    const badge = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="280" viewBox="0 0 800 280" role="img" aria-label="${safeName} badge">
  <rect width="800" height="280" rx="40" fill="${palette.secondary}"/>
  <circle cx="140" cy="140" r="78" fill="${palette.primary}"/>
  <circle cx="168" cy="112" r="22" fill="${palette.accent}"/>
  <text x="140" y="158" text-anchor="middle" font-family="Space Grotesk, Arial, sans-serif" font-size="52" font-weight="700" fill="${palette.background}">${escapeXml(mono)}</text>
  <text x="250" y="130" font-family="Space Grotesk, Arial, sans-serif" font-size="56" font-weight="700" fill="${palette.background}">${safeName}</text>
  <text x="250" y="180" font-family="IBM Plex Sans, Arial, sans-serif" font-size="24" fill="${palette.accent}">Brand mark · ready to ship</text>
</svg>`;
    return { full: badge, mark };
  }

  const wordmark = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="280" viewBox="0 0 1000 280" role="img" aria-label="${safeName} wordmark">
  <rect width="1000" height="280" fill="${palette.background}"/>
  <circle cx="90" cy="140" r="54" fill="${palette.primary}"/>
  <circle cx="112" cy="118" r="16" fill="${palette.accent}"/>
  <text x="170" y="160" font-family="Space Grotesk, Arial, sans-serif" font-size="72" font-weight="700" fill="${palette.text}">${safeName}</text>
  <rect x="170" y="190" width="220" height="8" rx="4" fill="${palette.primary}"/>
</svg>`;
  return { full: wordmark, mark };
}

function defaultTagline(name: string, industry: string, mood: BrandMood): string {
  const templates: Record<BrandMood, string> = {
    bold: `${name}: make every first impression hit harder.`,
    calm: `${name}: quieter tools for clearer days.`,
    luxury: `${name}: crafted presence for ${industry || "discerning"} brands.`,
    playful: `${name}: serious results, unserious energy.`,
    tech: `${name}: agent-ready identity for ${industry || "builders"}.`,
    organic: `${name}: grounded brand systems that grow with you.`,
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

export function generateBrandKit(input: BrandKitRequest): BrandKit {
  const name = input.name.trim() || "Untitled";
  const industry = (input.industry ?? "general").trim() || "general";
  const mood = pickMood(name, industry, input.mood);
  const style = input.style ?? "wordmark";
  const seed = hashSeed(`${name}|${industry}|${mood}|${style}`);
  const palette = MOOD_PALETTES[mood];
  const type = TYPE_PAIRS[mood];
  const tagline = (input.tagline?.trim() || defaultTagline(name, industry, mood)).slice(0, 140);
  const { full, mark } = buildMarkSvg(name, palette, seed, style);

  return {
    service: "PixelBrief",
    version: "1.0.0",
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
      svg: full,
      markSvg: mark,
      usage: [
        "Use mark on app icons and favicons",
        "Use wordmark/badge in headers and social avatars",
        "Keep clear space equal to the mark radius",
        "Do not recolor accent without testing contrast",
      ],
    },
    socialPosts: [
      {
        platform: "x",
        caption: `Launching ${name}. ${tagline} #OKXAI`,
        visualDirection: `Center the mark on ${palette.background}; one line of ${palette.text}; accent underline.`,
      },
      {
        platform: "linkedin",
        caption: `${name} just got a full brand kit from an agent — palette, type, logo, and posts in one call.`,
        visualDirection: `Split layout: left mark, right 3 palette swatches.`,
      },
      {
        platform: "instagram",
        caption: `${name} / ${mood} system. Save this kit.`,
        visualDirection: `Grid of mark + 4 color tiles + tagline.`,
      },
    ],
    thumbnailBrief: {
      title: name,
      subtitle: tagline,
      composition: "Left third: logo mark. Right two-thirds: bold title + thin subtitle. High contrast.",
      colors: [palette.primary, palette.secondary, palette.accent, palette.background],
    },
    deliverables: [
      "Logo SVG (mark + selected style)",
      "5-color palette + CSS variables",
      "Font pairing with rationale",
      "3 social captions with art direction",
      "YouTube/thumbnail composition brief",
    ],
    meta: {
      generatedAt: new Date().toISOString(),
      priceHintUsd: "0.25",
      seed,
    },
  };
}

export function generatePaletteOnly(mood: BrandMood = "tech") {
  const palette = MOOD_PALETTES[mood];
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
