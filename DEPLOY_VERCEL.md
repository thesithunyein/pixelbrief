# Deploy PixelBrief on Vercel (free)

## 1) Push is done
Repo: https://github.com/thesithunyein/pixelbrief

## 2) Import on Vercel
1. Go to https://vercel.com/new
2. Import `thesithunyein/pixelbrief`
3. Framework preset: **Other**
4. Build Command: leave empty (or `npm run vercel-build`)
5. Output Directory: leave empty (static from `/public`)
6. Install Command: `npm install`

## 3) Environment variables
Add in Vercel → Project → Settings → Environment Variables:

| Name | Value |
|------|--------|
| `REQUIRE_PAYMENT` | `false` first (so the site works before OKX keys) |
| `PUBLIC_BASE_URL` | `https://YOUR-PROJECT.vercel.app` |
| `X402_NETWORK` | `eip155:196` |
| `PAY_TO_ADDRESS` | your Agentic Wallet (when ready) |
| `OKX_API_KEY` | from Developer Portal |
| `OKX_SECRET_KEY` | … |
| `OKX_PASSPHRASE` | … |

Then set `REQUIRE_PAYMENT=true` once keys work.

## 4) After deploy
- Open `/` — studio UI
- Open `/health` — `{ ok: true }`
- Open `/v1/brand-kit?name=Demo&mood=tech`
- Use `/brand/listing-avatar.png` as OKX.AI listing icon

## 5) Wire into listing
Update `LISTING.md` endpoint base to your Vercel URL, then register A2MCP.
