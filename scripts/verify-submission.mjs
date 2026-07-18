#!/usr/bin/env node
/**
 * Pre-submission gate checker. Run before OKX listing + Google form.
 * Usage: npm run verify:submission
 */
const BASE = (process.env.SUBMISSION_BASE || "https://pixelbrief.tech").replace(/\/$/, "");

const gates = [];

async function check(name, fn) {
  try {
    const result = await fn();
    gates.push({ name, ok: true, detail: result });
    console.log(`✓ ${name}: ${result}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    gates.push({ name, ok: false, detail: msg });
    console.error(`✗ ${name}: ${msg}`);
  }
}

await check("GET /health", async () => {
  const r = await fetch(`${BASE}/health`);
  const j = await r.json();
  if (!r.ok || !j.ok) throw new Error(`status ${r.status}`);
  if (j.payment !== "x402") throw new Error(`payment=${j.payment} (expected x402)`);
  return `ok, payment=x402, ai=${j.ai?.configured}`;
});

await check("GET /v1/brand-kit → 402", async () => {
  const r = await fetch(`${BASE}/v1/brand-kit?name=Verify&mood=tech`);
  if (r.status !== 402) throw new Error(`status ${r.status} (expected 402)`);
  if (!r.headers.get("payment-required")) throw new Error("missing Payment-Required header");
  return "x402 payment gate active";
});

await check("GET /v1/preview/brand-kit → 200", async () => {
  const r = await fetch(`${BASE}/v1/preview/brand-kit?name=Verify&mood=tech&useAi=false`);
  const j = await r.json();
  if (!r.ok) throw new Error(`status ${r.status}`);
  if (!j.logo?.svg || j.logo.svg.length < 100) throw new Error("missing SVG");
  return `${j.brand.name}, svg=${j.logo.svg.length}b, engine=${j.logo.engine}`;
});

await check("GET /api metadata", async () => {
  const r = await fetch(`${BASE}/api`);
  const j = await r.json();
  if (j.type !== "A2MCP" || j.category !== "Art creation") throw new Error("wrong ASP metadata");
  return `${j.type} · ${j.category}`;
});

await check("GET /brand/logo-mark.png", async () => {
  const r = await fetch(`${BASE}/brand/logo-mark.png`);
  if (!r.ok) throw new Error(`status ${r.status}`);
  return `${r.headers.get("content-type")}, ${r.headers.get("content-length")}b`;
});

const failed = gates.filter((g) => !g.ok);
console.log("");
if (failed.length) {
  console.error(`${failed.length} gate(s) failed. Fix before submitting.`);
  process.exit(1);
}
console.log("All automated gates passed.");
