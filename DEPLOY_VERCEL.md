# Deploy PixelBrief on Vercel

**Production (live):** https://pixelbrief.tech  
**Submission runbook:** [SUBMIT.md](./SUBMIT.md)

## Production status

| Check | URL |
|-------|-----|
| Studio | https://pixelbrief.tech/ |
| Health | https://pixelbrief.tech/health → `payment: "x402"` |
| Paid route | `/v1/brand-kit` → **402** without payment |
| Free demo | `/v1/preview/brand-kit` |

Verify: `npm run verify:submission`

## Env vars (already set on production)

| Name | Value |
|------|--------|
| `PUBLIC_BASE_URL` | `https://pixelbrief.tech` |
| `X402_NETWORK` | `eip155:196` |
| `REQUIRE_PAYMENT` | `true` (or auto when OKX keys present) |
| `PAY_TO_ADDRESS` | Agentic Wallet |
| `OKX_API_KEY` / `SECRET` / `PASSPHRASE` | Developer Portal |
| `OPENAI_API_KEY` | optional AI logos |

## OKX listing icon

Upload `public/brand/app-icon.png` (locked logo PNG).
