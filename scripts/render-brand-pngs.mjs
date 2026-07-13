import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function renderSvg(svgPath, outPath, width) {
  const svg = fs.readFileSync(svgPath);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: true },
  });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, resvg.render().asPng());
}

const markSvg = path.join(root, "public/brand/logo-mark.svg");
const outputs = [
  [path.join(root, "public/brand/app-icon.png"), 1024],
  [path.join(root, "public/brand/listing-avatar.png"), 1024],
  [path.join(root, "public/apple-touch-icon.png"), 180],
  [path.join(root, "public/icon-192.png"), 192],
  [path.join(root, "public/icon-512.png"), 512],
  [path.join(root, "brand/app-icon.png"), 1024],
  [path.join(root, "brand/listing-avatar.png"), 1024],
];

for (const [outPath, width] of outputs) {
  renderSvg(markSvg, outPath, width);
  console.log(`wrote ${path.relative(root, outPath)} (${width}px)`);
}
