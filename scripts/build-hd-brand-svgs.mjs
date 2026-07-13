import opentype from "opentype.js";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const fontPath = process.env.BRAND_FONT ?? "C:/Windows/Fonts/ariblk.ttf";

if (!fs.existsSync(fontPath)) {
  console.error(`Font not found: ${fontPath}`);
  process.exit(1);
}

const font = opentype.parse(fs.readFileSync(fontPath));

/** Trophy-style brief cutout (centered), matches approved reference geometry. */
const CUTOUT_128 =
  "M54 22h18v7h-5v9h-7c-2.5 0-4.5 2-4.5 4.5v31c0 2.5 2 4.5 4.5 4.5h7v9c0 3.5-2.8 6.2-6.2 6.2h-3.6c-4.6 0-8.2-3.6-8.2-8.2V27.5c0-2.5 2-4.5 4.5-4.5z";

function centeredPath(char, baseline, size, canvas) {
  const probe = font.getPath(char, 0, baseline, size);
  const bb = probe.getBoundingBox();
  const w = bb.x2 - bb.x1;
  const x = (canvas - w) / 2 - bb.x1;
  return font.getPath(char, x, baseline, size).toPathData(2);
}

function markSvg({ id = "pb-cut", bg = "#0B1F5C", pFill = "#7AA2FF", bFill = "#2B60F5", size = 58 }) {
  const pPath = centeredPath("P", 56, size, 128);
  const bPath = centeredPath("B", 116, size, 128);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none" role="img" aria-label="PixelBrief">
  <rect width="128" height="128" rx="28" fill="${bg}"/>
  <defs>
    <mask id="${id}">
      <rect width="128" height="128" fill="white"/>
      <path fill="black" d="${CUTOUT_128}"/>
    </mask>
  </defs>
  <g mask="url(#${id})" shape-rendering="geometricPrecision">
    <path fill="${pFill}" d="${pPath}"/>
    <path fill="${bFill}" d="${bPath}"/>
  </g>
</svg>
`;
}

function faviconSvg() {
  const pPath = centeredPath("P", 14, 13, 32);
  const bPath = centeredPath("B", 29, 13, 32);
  const cut =
    "M13.5 5.5h4.5v1.75h-1.25v2.25h-1.75c-.6 0-1.1.5-1.1 1.1v7.75c0 .6.5 1.1 1.1 1.1h1.75v2.25c0 .9-.7 1.55-1.55 1.55h-0.9c-1.15 0-2.05-.9-2.05-2.05V6.85c0-.6.5-1.1 1.1-1.1z";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" role="img" aria-label="PixelBrief">
  <rect width="32" height="32" rx="8" fill="#0B1F5C"/>
  <defs>
    <mask id="pb-fav">
      <rect width="32" height="32" fill="white"/>
      <path fill="black" d="${cut}"/>
    </mask>
  </defs>
  <g mask="url(#pb-fav)" shape-rendering="geometricPrecision">
    <path fill="#7AA2FF" d="${pPath}"/>
    <path fill="#2B60F5" d="${bPath}"/>
  </g>
</svg>`;
}

function navSvg() {
  const pPath = centeredPath("P", 21, 19, 48);
  const bPath = centeredPath("B", 41, 19, 48);
  const cut =
    "M19.5 9h6.8v2.6h-1.9v3.4h-2.6c-.95 0-1.7.75-1.7 1.7v11.7c0 .95.75 1.7 1.7 1.7h2.6v3.4c0 1.3-1.05 2.35-2.35 2.35h-1.35c-1.75 0-3.1-1.35-3.1-3.1V10.9c0-.95.75-1.7 1.7-1.7z";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48" fill="none" role="img" aria-label="PixelBrief">
  <rect width="220" height="48" rx="14" fill="#0B1F5C"/>
  <defs>
    <mask id="pb-nav">
      <rect width="48" height="48" fill="white"/>
      <path fill="black" d="${cut}"/>
    </mask>
  </defs>
  <g mask="url(#pb-nav)" shape-rendering="geometricPrecision">
    <path fill="#7AA2FF" d="${pPath}"/>
    <path fill="#2B60F5" d="${bPath}"/>
  </g>
  <text x="62" y="31" font-family="Manrope, Helvetica Neue, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="-0.4" fill="#FFFFFF">PixelBrief</text>
</svg>`;
}

function lockupSvg() {
  const pPath = centeredPath("P", 42, 38, 96);
  const bPath = centeredPath("B", 82, 38, 96);
  const cut =
    "M39 18h13.5v5.2h-3.8v6.8h-5.2c-1.9 0-3.4 1.5-3.4 3.4v23.4c0 1.9 1.5 3.4 3.4 3.4h5.2v6.8c0 2.6-2.1 4.7-4.7 4.7h-2.7c-3.5 0-6.2-2.7-6.2-6.2V21.8c0-1.9 1.5-3.4 3.4-3.4z";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 96" fill="none" role="img" aria-label="PixelBrief">
  <rect width="520" height="96" rx="24" fill="#0B1F5C"/>
  <defs>
    <mask id="pb-lock">
      <rect width="96" height="96" fill="white"/>
      <path fill="black" d="${cut}"/>
    </mask>
  </defs>
  <g mask="url(#pb-lock)" shape-rendering="geometricPrecision">
    <path fill="#7AA2FF" d="${pPath}"/>
    <path fill="#2B60F5" d="${bPath}"/>
  </g>
  <text x="124" y="60" font-family="Manrope, Helvetica Neue, Arial, sans-serif" font-size="42" font-weight="700" letter-spacing="-1.2" fill="#FFFFFF">PixelBrief</text>
</svg>`;
}

const outputs = [
  [markSvg({ id: "pb-cut" }), "public/brand/logo-mark.svg"],
  [markSvg({ id: "pb-cut" }), "brand/logo-mark.svg"],
  [markSvg({ id: "pb-cut-dark", bg: "#050D2E" }), "public/brand/logo-mark-dark.svg"],
  [markSvg({ id: "pb-cut-dark", bg: "#050D2E" }), "brand/logo-mark-dark.svg"],
  [faviconSvg(), "public/favicon.svg"],
  [faviconSvg(), "favicon.svg"],
  [navSvg(), "public/brand/logo-nav.svg"],
  [navSvg(), "brand/logo-nav.svg"],
  [lockupSvg(), "public/brand/logo-lockup.svg"],
  [lockupSvg(), "brand/logo-lockup.svg"],
];

for (const [svg, rel] of outputs) {
  fs.writeFileSync(path.join(root, rel), `${svg}\n`);
  console.log(`wrote ${rel}`);
}
