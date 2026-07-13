/**
 * DISABLED — PixelBrief logo is locked to public/brand/logo-mark.png (see brand.md).
 * Do not regenerate SVG marks.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const lock = path.join(root, "public/brand/logo-mark.png");
if (!fs.existsSync(lock)) {
  console.error("Missing locked logo: public/brand/logo-mark.png");
  process.exit(1);
}
console.error("Logo is locked PNG. Edit brand.md to change policy before regenerating.");
process.exit(1);
