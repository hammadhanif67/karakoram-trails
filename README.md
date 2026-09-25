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

This writes responsive WebP files (640/1280/2400 px) and gallery crops to `public/images/`.

## Before launch

Placeholders to replace:

- `src/lib/content.ts`: testimonials, package prices (phone, WhatsApp and email are set in `brand`)
- `src/components/sections/hero.tsx`: headline stats (years, travellers, rating)

The contact form has no backend: on submit it opens WhatsApp with the enquiry pre-filled.

## Credits

- Hero adapted from "Layer Parallax Hero" by erikvalencia1 on 21st.dev
- Destination cards adapted from "3D Card" by kavikatiyar on 21st.dev
- Shine Border, Blur Fade and Marquee from Magic UI (magicui.design), in `src/components/magicui/`
- Skewed buttons: `src/components/ui/skew-button.tsx`
- Photos from Pexels
