# SUBMIT — OKX.AI Genesis (final runbook)

**Deadline:** Jul 17, 2026 23:59 UTC  
**Form:** https://forms.gle/mddEUagmDbyV37ws8  
**Live ASP:** https://pixelbrief.vercel.app

Run automated checks first:

```bash
npm run verify:submission
```

---

## Already done (code + deploy)

- [x] Live HTTPS studio + API
- [x] `/health` → `{ ok: true, payment: "x402" }`
- [x] Paid routes return **402** with `Payment-Required` header
- [x] Free preview at `/v1/preview/brand-kit` (studio demo)
- [x] Category **Art creation**, type **A2MCP**
- [x] Locked logo PNG (`public/brand/logo-mark.png`)
- [x] Listing copy in `LISTING.md`
- [x] X thread copy in `X_POST.md`
- [x] Google form answers in `GOOGLE_FORM.md`

---

## YOU must do (≈2–3 hours total)

### Step 1 — Register + list ASP (45–90 min) **CRITICAL**

Without live OKX listing, entry is **invalid**.

1. Open your OKX Agent / Onchain OS session
2. Run prompts from `LISTING.md` (URLs already set to `https://pixelbrief.vercel.app`)
3. Upload icon: `public/brand/app-icon.png`
4. Category: **Art creation** · Type: **A2MCP**
5. Submit for marketplace review
6. **Save Agent ID** → paste into `GOOGLE_FORM.md`

### Step 2 — Confirm one paid call (15 min)

In Agent chat (buyer mode):

```text
I'd like to use the PixelBrief A2MCP service.
Service title: Full brand kit
Endpoint: https://pixelbrief.vercel.app/v1/brand-kit?name=NovaMint&industry=fintech&mood=tech&style=badge
Please pay via x402 and return the palette + SVG length.
```

Repeat 5× yourself, then ask 5–10 friends/agents (see `SEED_REVENUE.md`).

### Step 3 — Record + post X demo (30 min)

Follow `DEMO_SCRIPT.md` (≤90s). Post thread from `X_POST.md` with **#OKXAI**. Pin it.

### Step 4 — Google form (5 min)

Copy answers from `GOOGLE_FORM.md`. Submit before deadline.

---

## Prize strategy (max plausible stack)

| Track | $ | Your lever |
|-------|---|------------|
| Artistic Excellence | 7,500 | Art category + visual demo |
| Creative Genius | 20,000 | Full brand kit in one call |
| Social Buzz | 10,000 | #OKXAI video + engagement |
| Revenue Rocket | 20,000 | 30+ paid calls + reviews |
| Best Product | 20,000 | Reviews + complete deliverable |

**Do not** pivot to Finance. **Do not** change logo or pricing before deadline.

---

## After Agent ID is known

1. Fill `GOOGLE_FORM.md` placeholders
2. Update `X_POST.md` post 3 with Agent ID
3. Re-run `npm run verify:submission`

---

## Support links

- Hackathon: https://www.hackquest.io/hackathons/OKXAI-Genesis-Hackathon
- OKX.AI: https://okx.ai/
- Repo: https://github.com/thesithunyein/pixelbrief
