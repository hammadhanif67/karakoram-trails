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
- Shangrila hero: arifesapzai · Hunza autumn road: faysal9 · Fairy Meadows meadow and cabins: Zia uddin Shah
- Katpana desert and Karimabad at night: Wasif Mehmood · Altit Fort view: Aakash Ashraf
- Attabad Lake: Hamayoon Riaz · Passu Cones: Raj Kumar Lohana · Skardu lake: Osama Bin Younis
- Deosai: Neha Siraj Khan · Kaghan lake: Sameer Bhatti · Rakaposhi: Adnan Temur Barcha · Khunjerab: Kamran Sabir
