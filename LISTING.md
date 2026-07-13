# OKX.AI listing copy + prompts

## Marketplace listing (paste into ASP registration)

**Name:** PixelBrief

**One-liner:** One prompt → full brand kit (logo SVG, palette, fonts, social posts, thumbnail brief).

**Full description:**
PixelBrief is an Art Creation ASP for founders and agents who need a shippable brand system in one call. Give it a name, industry, and mood — get logo SVGs, a 5-color palette with CSS variables, font pairing, 3 social captions with art direction, and a thumbnail composition brief. Pay-per-call via x402 on X Layer. Built for agents that hire creative services without waiting on a human designer.

**Category:** Art creation

**Type:** A2MCP

**Services / prices:**
1. Full brand kit — `GET /v1/brand-kit` — **$0.25**
2. Logo only — `GET /v1/logo` — **$0.05**
3. Palette + type — `GET /v1/palette` — **$0.02**

**Keywords / triggers:** brand kit, logo, palette, identity, visual system, thumbnail, social creative, ASP art, PixelBrief

## Onchain OS prompts (run in your Agent)

### 1) Install
```text
npx skills add okx/onchainos-skills --yes -g
```

### 2) Wallet
```text
Log in to Agentic Wallet on Onchain OS with my email
```

### 3) Register A2MCP
```text
Help me register an A2MCP ASP on OKX.AI using OKX Agent Identity from Onchain OS.

ASP name: PixelBrief
Category: Art creation
Description: One prompt → full brand kit (logo SVG, palette, fonts, social posts, thumbnail brief). Pay-per-call x402 creative service for agents and founders.
Endpoint base: https://YOUR_PUBLIC_HOST
Services:
- GET /v1/brand-kit (price $0.25) — full brand kit JSON + SVG
- GET /v1/logo (price $0.05) — logo SVG pack
- GET /v1/palette (price $0.02) — palette + font pairing
Network: eip155:196 (X Layer)
```

### 4) List on marketplace
```text
Help me list my ASP on OKX.AI using Onchain OS. ASP name PixelBrief, category Art creation. Make sure it is submitted for marketplace review so it can go live.
```

### 5) After approval — smoke test via buyer agent
```text
I’d like to use the PixelBrief A2MCP service.
Service title: Full brand kit
Endpoint: https://YOUR_PUBLIC_HOST/v1/brand-kit?name=NovaMint&industry=fintech&mood=tech&style=badge
Please call it and show me the palette + confirm the SVG length.
```

## Icon / avatar notes
- Upload `public/brand/app-icon.png` (or `listing-avatar.png`) as the OKX.AI avatar
- Same mark geometry as favicon / nav / lockup: stacked PB + center brief cutout (blue duotone on navy)
- Keep category **Art creation** and show the live studio URL in the listing description

## After listing
Save and never lose:
- Agent ID
- ASP listing URL
- Public endpoint URL
- Telegram handle (required on Google form)
