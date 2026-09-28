// Builds responsive AVIF + WebP images in public/images/ from photos-original/, and the manifest
// src/lib/images.generated.json that the site reads (sizes, intrinsic width/height, blur placeholder).
// - Each output is re-encoded at decreasing quality (and, for very grainy photos, a light denoise) until it
//   fits its byte budget. AVIF gets a tighter budget than WebP.
// - File names carry a hash of their bytes (name-1280.3f9a1c2b.avif), so /images/* can be cached for a
//   year: a changed photo gets a new name. Each slot has its own photo; the destination pages reuse some of
//   them (their hero is the photo of the destination's home-page panel).
// Run with: npm run optimize-images (commit public/images and the manifest afterwards).

import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const SRC = "photos-original";
const OUT = "public/images";
const MANIFEST = "src/lib/images.generated.json";
const KB = 1024;

// aspect: crop to width/height ratio (cover, focused on the most detailed area) for slots that
// are always landscape, e.g. full-width destination panels and tour-page heroes. The crop follows the
// most detailed area unless `position` overrides it.
// Licences: every photo is free to use; we still credit each one on /credits/ and in public/images/CREDITS.md.
const PEXELS = { site: "Pexels", license: "Pexels License", licenseUrl: "https://www.pexels.com/license/" };
const UNSPLASH = { site: "Unsplash", license: "Unsplash License", licenseUrl: "https://unsplash.com/license" };

// subject: what the photo shows (for the credits); the alt text for each use lives with the component/content.
const images = [
  // Home hero. 1600 sits between 1280 and 1920 so a 1440 px desktop doesn't download the 1920 file.
  // AVIF capped at q45: under the hero scrim it looked the same as q60 side by side, at about 55-70% of the
  // bytes (1280 px: 163 -> 89 KB).
  {
    file: "hero-passu-cones-abdul-rafay.jpg", name: "hero-passu-cones", widths: [480, 768, 1280, 1600, 1920], budget: 300 * KB,
    maxQuality: { avif: 45 },
    credit: { ...UNSPLASH, author: "Abdul Rafay", url: "https://unsplash.com/photos/-lL3UsOn41A", subject: "Passu Cones from the viewpoint at Passu, Hunza" },
  },

  // Destinations (pinned full-width panels)
  {
    file: "pexels-faysal9-35061891.jpg", name: "dest-hunza", widths: [640, 1024, 1280], aspect: 16 / 10, // dense foliage: 1600px cannot fit 150 KB
    credit: { ...PEXELS, author: "Faysal Khan", url: "https://www.pexels.com/photo/35061891/", subject: "Autumn road in Hunza Valley" },
  },
  {
    file: "skardu-katpana-desert.jpg", name: "dest-skardu", widths: [640, 1024, 1600], aspect: 16 / 10,
    credit: { ...PEXELS, author: "Wasif Mehmood", url: "https://www.pexels.com/photo/19442073/", subject: "Sand dunes near Skardu" },
  },
  {
    file: "nanga-parbat-sunrise.jpg", name: "dest-fairy-meadows", widths: [640, 1024, 1600], aspect: 16 / 10,
    credit: { ...PEXELS, author: "Maaz Kalia", url: "https://www.pexels.com/photo/29401243/", subject: "Sunrise on Nanga Parbat" },
  },

  // Why us (tall editorial photo)
  {
    file: "hunza-altit-fort-view.jpg", name: "why-altit-fort", widths: [480, 800, 1000],
    credit: { ...PEXELS, author: "Aakash Ashraf", url: "https://www.pexels.com/photo/1454405/", subject: "Hunza Valley seen from Altit Fort" },
  },

  // Packages: card image and tour-page hero
  {
    file: "attabad-harbor-wasif-mehmood.jpg", name: "tour-hunza-escape", widths: [480, 800, 1280, 1600], aspect: 16 / 10,
    credit: { ...PEXELS, author: "Wasif Mehmood", url: "https://www.pexels.com/photo/15573399/", subject: "Harbour on Attabad Lake, Hunza" },
  },
  {
    file: "fairy-meadows-aqib-bilal.jpg", name: "tour-grand-karakoram", widths: [480, 800, 1280, 1600], aspect: 16 / 10,
    credit: { ...UNSPLASH, author: "Aqib Bilal", url: "https://unsplash.com/photos/217Zug9Ryq0", subject: "Forest and snow peaks at Fairy Meadows" },
  },
  {
    file: "pexels-arifesapzai-35302567.jpg", name: "tour-skardu-lakes", widths: [480, 800, 1280, 1600], aspect: 16 / 10,
    credit: { ...PEXELS, author: "Arif Esapzai", url: "https://www.pexels.com/photo/35302567/", subject: "Shangrila Resort on Lower Kachura Lake, Skardu" },
  },

  // Gallery (the shot list in CONTENT_BRIEF.md; places we could not verify are left out)
  {
    file: "baltit-fort-mansoor-haider.jpg", name: "gallery-baltit-fort", widths: [400, 800],
    credit: { ...PEXELS, author: "Mansoor Haider", url: "https://www.pexels.com/photo/31839248/", subject: "Baltit Fort, Karimabad" },
  },
  {
    file: "attabad-lake-arif-esapzai.jpg", name: "gallery-attabad-lake", widths: [400, 800],
    credit: { ...PEXELS, author: "Arif Esapzai", url: "https://www.pexels.com/photo/35302565/", subject: "Attabad Lake, Hunza" },
  },
  {
    file: "khunjerab-gate-muffaddal-qutbuddin.jpg", name: "gallery-khunjerab-gate", widths: [400, 800],
    credit: { ...PEXELS, author: "Muffaddal Qutbuddin", url: "https://www.pexels.com/photo/28903980/", subject: "Khunjerab Pass border gate" },
  },
  {
    file: "kkh-ganish-pakistan-tourism.jpg", name: "gallery-kkh-ganish", widths: [400, 800],
    credit: { ...UNSPLASH, author: "Pakistan Tourism", url: "https://unsplash.com/photos/SUazSOyCb3o", subject: "Karakoram Highway above the Hunza River at Ganish" },
  },
  {
    file: "fairy-meadows-night-obaid-awan.jpg", name: "gallery-fairy-meadows-night", widths: [400, 800],
    credit: { ...UNSPLASH, author: "Obaid Awan", url: "https://unsplash.com/photos/nUc5Hba1McA", subject: "Nanga Parbat at night from Fairy Meadows" },
  },
  {
    file: "deosai-road-umar-farooq.jpg", name: "gallery-deosai", widths: [400, 800],
    credit: { ...UNSPLASH, author: "Umar Farooq", url: "https://unsplash.com/photos/DX_HQ7M_WC0", subject: "Road across the Deosai Plains" },
  },
];

// Quality starts at the top of the list (or at an image's maxQuality) and never drops below 50 for WebP / 35
// for AVIF (visible blockiness). Very grainy photos (e.g. dense
// foliage) that still don't fit get a light denoise first, which removes sensor grain that the encoder
// spends bytes on.
const DENOISE = [0, 0.5, 0.8, 1.1];
const FORMATS = {
  webp: { qualities: [80, 75, 70, 65, 60, 55, 50], encode: (p, quality) => p.webp({ quality, effort: 6, smartSubsample: true }), budgetFactor: 1 },
  avif: { qualities: [60, 55, 50, 45, 40, 35], encode: (p, quality) => p.avif({ quality, effort: 5 }), budgetFactor: 0.75 },
};

async function encodeWithin(pipeline, format, budget, maxQuality = 100) {
  const { encode } = FORMATS[format];
  const qualities = FORMATS[format].qualities.filter((q) => q <= maxQuality);
  let last;
  for (const sigma of DENOISE) {
    const base = sigma ? pipeline.clone().blur(sigma).sharpen({ sigma: 0.6 }) : pipeline.clone();
    for (const quality of qualities) {
      const { data, info } = await encode(base.clone(), quality).toBuffer({ resolveWithObject: true });
      last = { data, info, quality, sigma };
      if (data.length <= budget) break;
    }
    if (last.data.length <= budget) break;
  }
  return last;
}

const hash = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 8);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const manifest = {};
for (const { file, name, widths, budget = 150 * KB, aspect, position = sharp.strategy.attention, maxQuality = {}, credit } of images) {
  const entry = { width: 0, height: 0, placeholder: "", avif: [], webp: [], credit };
  for (const w of widths) {
    const resize = aspect ? { width: w, height: Math.round(w / aspect), fit: "cover", position } : { width: w, withoutEnlargement: true };
    const pipeline = sharp(`${SRC}/${file}`).rotate().resize(resize);
    for (const format of ["avif", "webp"]) {
      const out = await encodeWithin(pipeline, format, budget * FORMATS[format].budgetFactor, maxQuality[format]);
      // Write the exact bytes; sharp().toFile() would re-encode.
      const path = `${name}-${w}.${hash(out.data)}.${format}`;
      writeFileSync(`${OUT}/${path}`, out.data);
      entry[format].push([out.info.width, `/images/${path}`]);
      const over = out.data.length > budget * FORMATS[format].budgetFactor;
      const notes = [out.sigma && `denoise ${out.sigma}`, over && "OVER BUDGET"].filter(Boolean);
      console.log(`${path.padEnd(52)} q${out.quality}  ${(out.data.length / KB).toFixed(0)} KB  ${notes.join(", ")}`);
      if (out.info.width >= entry.width) Object.assign(entry, { width: out.info.width, height: out.info.height });
    }
  }
  // Tiny blurred preview, inlined as a CSS background until the real image paints (~200-400 bytes).
  const tiny = await sharp(`${SRC}/${file}`)
    .rotate()
    .resize(aspect ? { width: 16, height: Math.round(16 / aspect), fit: "cover", position } : { width: 16 })
    .webp({ quality: 40 })
    .toBuffer();
  entry.placeholder = `data:image/webp;base64,${tiny.toString("base64")}`;
  manifest[name] = entry;
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

// Human-readable record of every photo (also shown on /credits/).
const rows = Object.entries(manifest).map(
  ([name, e]) => `| ${name} | ${e.credit.subject} | ${e.credit.author} | [${e.credit.site}](${e.credit.url}) | [${e.credit.license}](${e.credit.licenseUrl}) |`,
);
writeFileSync(
  `${OUT}/CREDITS.md`,
  [
    "# Photo credits",
    "",
    "Generated by scripts/optimize-images.mjs. Every photo was checked to show the named place (title, description and",
    "location on its source page) and is used under the licence listed.",
    "",
    "| File | Shows | Photographer | Source | Licence |",
    "|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n"),
);
console.log(`\nWrote ${Object.keys(manifest).length} images, ${MANIFEST} and ${OUT}/CREDITS.md`);
