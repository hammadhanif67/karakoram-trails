# Karakoram Trails

Landing page for a Northern Pakistan tour agency (Hunza, Skardu, Fairy Meadows).
Next.js 16 + Tailwind CSS 4 + Framer Motion, exported as a fully static site.

## Develop

```bash
npm install
npm run dev
```

## Build and preview the static site

```bash
npm run build     # writes the static site to out/
npm run preview   # serves out/ on http://localhost:4173
```

## Deploy to Cloudflare Pages

- Framework preset: **Next.js (Static HTML Export)**
- Build command: `npm run build`
- Build output directory: `out`

## Booking backend (Cloudflare Pages Functions + D1)

Stage 1 of the booking system. D1 is the single source of truth for tour prices and departures:
the site renders the `src/lib/content.ts` values in the static HTML, then replaces them in the
browser with `GET /api/departures` (`functions/api/departures.ts`). On hosts without Pages Functions
the request 404s and the static values stay.

- `wrangler.toml`: Pages config, D1 (`DB`) and R2 (`RECEIPTS`) bindings. No secrets.
- `migrations/`: D1 schema. `server/`: server-only code for functions (kept out of the Next build).
- `src/lib/booking-rules.ts`: shared rules. Online booking closes 72 h before departure; unpaid holds
  expire at the earlier of now + `HOLD_HOURS` and departure − 72 h (only `pending_payment` expires).

Local development:

```bash
npm run db:migrate:local   # create tables in the local D1
npm run db:seed:local      # insert content.ts tours/departures, then check they match D1
npm run build
npm run pages:dev          # static site + functions + local D1 on http://127.0.0.1:8788
```

`db:seed:*` and `db:check:*` exit with an error if `content.ts` and D1 disagree on a tour name,
price or the upcoming departures. D1 wins: update `content.ts` to match.

One-time production setup (needs your Cloudflare login):

```bash
npx wrangler login
npx wrangler d1 create karakoram-trails     # paste the printed database_id into wrangler.toml
npx wrangler r2 bucket create karakoram-trails-receipts
npm run db:migrate:remote
npm run db:seed:remote
```

### Stages 2–4: checkout, admin, notifications

- Checkout `/checkout/?departure=<id>`, booking status `/booking/?ref=&t=` (WhatsApp "Send booking to us"
  button shares details, never the private link), receipt upload to private R2.
- Admin `/admin/` behind **Cloudflare Access**; every `/api/admin/*` request also verifies the Access JWT
  (signature, audience, issuer, expiry) and the email against `ADMIN_EMAILS`. State changes require a
  same-origin request.
- Notifications: `booking_events` is an outbox. After each request, pending events are sent to the n8n
  webhook (`X-KT-Signature: sha256=HMAC_SHA256(N8N_WEBHOOK_SECRET, "<X-KT-Timestamp>.<body>")`) and by
  email through Resend. Failures are retried up to 5 times; the admin has "Retry notifications".

Before going live (Cloudflare dashboard):
1. Zero Trust → Access → Applications → Self-hosted: protect `your-domain/admin*` and
   `your-domain/api/admin*` (and the `*.pages.dev` hostname) with an email policy. Copy the team domain
   and the Application Audience (AUD) tag.
2. Turnstile widget for your domain.
3. Pages → Settings → Variables and Secrets: every variable in `.dev.vars.example` (never
   `TURNSTILE_ALLOW_TEST_KEYS` or `ADMIN_DEV_EMAIL`), plus build variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
4. `npm run db:migrate:remote` (applies `0002_notifications.sql`).

## Photos

Originals live in `photos-original/`. After adding or replacing a photo, update the file map in
`scripts/optimize-images.mjs` and run:

```bash
npm run optimize-images
```

This writes responsive WebP files (400 px up to 1920 px for the hero) to `public/images/`, one photo per slot,
lowering quality (never below 50) and lightly denoising until each file fits its budget: hero up to
300 KB, everything else under 150 KB.

## Before launch

Everything marked `PLACEHOLDER` in `src/lib/content.ts` needs real information:

- Tour prices and the PKR to USD rate (`USD_RATE`)
- Departure dates and seats left
- Day-by-day itineraries, included / not included lists
- FAQ answers (booking, payment, cancellation policy)
- Stats (years guiding, travellers, rating) and testimonials

The contact form and booking buttons have no backend: they open WhatsApp with the enquiry pre-filled.

## Build notes

`npm run build` also runs `scripts/flatten-segment-files.mjs` (as `postbuild`). Next.js 16.3 writes the
prefetch files of dynamic routes (`/tours/[slug]`) into nested folders while the browser asks for
dot-joined names; the script adds the flat copies so tour-page links don't 404. It can be removed once
Next.js fixes this.

## Credits

Components
- Hero adapted from "Layer Parallax Hero" by erikvalencia1 on 21st.dev
- Magic UI (magicui.design): Shine Border, Blur Fade, Marquee, Scroll Progress, Word Rotate, Text Reveal,
  Number Ticker, Animated Beam, in `src/components/magicui/`
- shadcn/ui: Accordion, Toggle, Toggle Group, Input, Textarea, Label, in `src/components/ui/`
- Call-to-action buttons (`src/components/ui/cta-button.tsx`), pinned destinations, route map and tour pages were built for this site

Photos (Pexels)
- Shangrila hero: arifesapzai · Hunza autumn road: faysal9 · Nanga Parbat sunrise: maazkalia · Fairy Meadows cabins: Zia uddin Shah
- Katpana desert and Karimabad at night: Wasif Mehmood · Altit Fort view: Aakash Ashraf
- Attabad Lake: Hamayoon Riaz · Passu Cones: Raj Kumar Lohana · Skardu lake: Osama Bin Younis
- Deosai: Neha Siraj Khan · Kaghan lake: Sameer Bhatti · Rakaposhi: Adnan Temur Barcha · Khunjerab: Kamran Sabir
