// Builds responsive AVIF + WebP images in public/images/ from photos-original/, and the manifest
// src/lib/images.generated.json that the site reads (sizes, intrinsic width/height, blur placeholder).
// - Each output is re-encoded at decreasing quality (and, for very grainy photos, a light denoise) until it
//   fits its byte budget. AVIF gets a tighter budget than WebP.
// - File names carry a hash of their bytes (name-1280.3f9a1c2b.avif), so /images/* can be cached for a
//   year: a changed photo gets a new name. Every photo is used in exactly one place on the site.
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
const images = [
  // Home hero may reach ~300 KB at its largest size; everything else stays under 150 KB.
  // 1600 sits between 1280 and 1920 so a 1440 px desktop doesn't download the 1920 file.
  { file: "pexels-arifesapzai-35302567.jpg", name: "hero-skardu-shangrila", widths: [480, 768, 1280, 1600, 1920], budget: 300 * KB },

  // Destinations (pinned full-width panels)
  { file: "pexels-faysal9-35061891.jpg", name: "dest-hunza", widths: [640, 1024, 1280], aspect: 16 / 10 }, // dense foliage: 1600px cannot fit 150 KB
  { file: "skardu-katpana-desert.jpg", name: "dest-skardu", widths: [640, 1024, 1600], aspect: 16 / 10 },
  { file: "nanga-parbat-sunrise.jpg", name: "dest-fairy-meadows", widths: [640, 1024, 1600], aspect: 16 / 10 }, // Nanga Parbat, the view from Fairy Meadows

  // Why us (tall editorial photo)
  { file: "hunza-altit-fort-view.jpg", name: "why-altit-fort", widths: [480, 800, 1000] },

  // Packages: card image and tour-page hero
  { file: "attabad-lake.jpg", name: "tour-hunza-escape", widths: [480, 800, 1280, 1600], aspect: 16 / 10 },
  { file: "passu-cones.jpg", name: "tour-grand-karakoram", widths: [480, 800, 1280, 1600], aspect: 16 / 10 },
  { file: "skardu-lake-village.jpg", name: "tour-skardu-lakes", widths: [480, 800, 1280, 1600], aspect: 16 / 10, position: "centre" },

  // Gallery
  { file: "deosai-plains.jpg", name: "gallery-deosai", widths: [400, 800] },
  { file: "kaghan-lake.jpg", name: "gallery-kaghan-lake", widths: [400, 800] },
  { file: "rakaposhi.jpg", name: "gallery-rakaposhi", widths: [400, 800] },
  { file: "karimabad-night.jpg", name: "gallery-karimabad-night", widths: [400, 800] },
  { file: "khunjerab-yaks.jpg", name: "gallery-khunjerab", widths: [400, 800] },
  { file: "fairy-meadows-cabins.jpg", name: "gallery-fairy-meadows-cabins", widths: [400, 800] },
];

// Quality never drops below 50 for WebP / 35 for AVIF (visible blockiness). Very grainy photos (e.g. dense
// foliage) that still don't fit get a light denoise first, which removes sensor grain that the encoder
// spends bytes on.
const DENOISE = [0, 0.5, 0.8, 1.1];
const FORMATS = {
  webp: { qualities: [80, 75, 70, 65, 60, 55, 50], encode: (p, quality) => p.webp({ quality, effort: 6, smartSubsample: true }), budgetFactor: 1 },
  avif: { qualities: [60, 55, 50, 45, 40, 35], encode: (p, quality) => p.avif({ quality, effort: 5 }), budgetFactor: 0.75 },
};

async function encodeWithin(pipeline, format, budget) {
  const { qualities, encode } = FORMATS[format];
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
for (const { file, name, widths, budget = 150 * KB, aspect, position = sharp.strategy.attention } of images) {
  const entry = { width: 0, height: 0, placeholder: "", avif: [], webp: [] };
  for (const w of widths) {
    const resize = aspect ? { width: w, height: Math.round(w / aspect), fit: "cover", position } : { width: w, withoutEnlargement: true };
    const pipeline = sharp(`${SRC}/${file}`).rotate().resize(resize);
    for (const format of ["avif", "webp"]) {
      const out = await encodeWithin(pipeline, format, budget * FORMATS[format].budgetFactor);
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
console.log(`\nWrote ${Object.keys(manifest).length} images and ${MANIFEST}`);
