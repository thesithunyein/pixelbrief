import { generateBrandKit } from "../src/brand-kit.js";

const kit = await generateBrandKit({
  name: "PixelBrief",
  tagline: "One prompt. Full brand kit. Paid on OKX.AI.",
  industry: "agent marketplace",
  mood: "tech",
  style: "badge",
  useAi: false,
});

console.log(
  JSON.stringify(
    {
      name: kit.brand.name,
      tagline: kit.brand.tagline,
      mood: kit.brand.mood,
      engine: kit.logo.engine,
      palette: kit.palette,
      typography: kit.typography,
      socialPosts: kit.socialPosts,
      svgBytes: kit.logo.svg.length,
    },
    null,
    2,
  ),
);
