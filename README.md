# PixelBrief

**One prompt → full brand kit.** Logo SVG, palette, type pairing, social captions, thumbnail brief.  
Built as an **A2MCP** Agent Service Provider for the [OKX.AI Genesis Hackathon](https://www.hackquest.io/hackathons/OKXAI-Genesis-Hackathon).

| | |
|---|---|
| Category | **Art creation** |
| Type | **A2MCP** (x402 pay-per-call) |
| Prices | Brand kit **$0.25** · Logo **$0.05** · Palette **$0.02** |
| Deploy | **Vercel free** — see [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) |
| Tracks | Artistic Excellence · Creative Genius · Best Product · Revenue Rocket · Social Buzz |

## Brand

Matched mark system (favicon, nav, lockup, app icon, OKX listing avatar): open frame + blue pixel + brief bar.  
See [brand.md](./brand.md) and `/public/brand/`.

## Quick start (local, free)

```bash
cp .env.example .env
# set REQUIRE_PAYMENT=false for local
npm install
npm run demo:local
npm run dev
```

Open:
- http://localhost:4000/
- http://localhost:4000/health
- http://localhost:4000/v1/brand-kit?name=Acme&industry=saas&mood=tech

## Live payments (required for hackathon)

1. Create Agentic Wallet via Onchain OS (see [PLAYBOOK.md](./PLAYBOOK.md)).
2. Get OKX API keys from the [Developer Portal](https://web3.okx.com/onchainos/dev-docs/home/developer-portal).
3. Set env on Vercel (or `.env` locally):

```env
REQUIRE_PAYMENT=true
OKX_API_KEY=...
OKX_SECRET_KEY=...
OKX_PASSPHRASE=...
PAY_TO_ADDRESS=0xYourAgenticWallet
X402_NETWORK=eip155:196
PUBLIC_BASE_URL=https://your-project.vercel.app
```

4. Deploy on Vercel → register + list ASP ([LISTING.md](./LISTING.md)).
5. Seed 20–50 paid calls, ask for positive reviews.
6. Post on X with `#OKXAI` + ≤90s demo ([X_POST.md](./X_POST.md)).
7. Submit [Google form](https://forms.gle/mddEUagmDbyV37ws8) before **Jul 17, 23:59 UTC**.

## Endpoints

| Method | Path | Price | What you get |
|--------|------|-------|--------------|
| GET | `/health` | free | status |
| GET | `/v1/brand-kit` | $0.25 | full kit JSON + SVG |
| GET | `/v1/logo` | $0.05 | logo SVGs only |
| GET | `/v1/palette` | $0.02 | palette + fonts |

Query params for brand kit / logo: `name` (required), `tagline`, `industry`, `mood` (`bold|calm|luxury|playful|tech|organic`), `style` (`mark|wordmark|badge`).

## Docs

- [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) — free hosting
- [PLAYBOOK.md](./PLAYBOOK.md) — day-by-day max-prize plan
- [LISTING.md](./LISTING.md) — OKX.AI register/list prompts + copy
- [X_POST.md](./X_POST.md) — demo + tweet script
- [CHECKLIST.md](./CHECKLIST.md) — submission gate
