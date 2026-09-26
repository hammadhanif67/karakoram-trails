// Builds responsive WebP images in public/images/ from photos-original/.
// Each output is re-encoded at decreasing quality (and, for very grainy photos, a light denoise)
// until it fits its byte budget. Every photo is used in exactly one place on the site.
// Run with: npm run optimize-images

import sharp from "sharp";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const SRC = "photos-original";
const OUT = "public/images";
const KB = 1024;

// aspect: crop to width/height ratio (cover, focused on the most detailed area) for slots that
// are always landscape, e.g. full-width destination panels and tour-page heroes. The crop follows the
// most detailed area unless `position` overrides it.
const images = [
  // Home hero may reach ~300 KB at its largest size; everything else stays under 150 KB.
  { file: "pexels-arifesapzai-35302567.jpg", name: "hero-skardu-shangrila", widths: [480, 768, 1280, 1920], budget: 300 * KB },

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

// Quality never drops below 50 (visible blockiness). Very grainy photos (e.g. dense foliage) that
// still don't fit get a light denoise first, which removes sensor grain that WebP spends bytes on.
const DENOISE = [0, 0.5, 0.8, 1.1];

async function encodeWithin(pipeline, path, budget) {
  let last;
  for (const sigma of DENOISE) {
    const base = sigma ? pipeline.clone().blur(sigma).sharpen({ sigma: 0.6 }) : pipeline.clone();
    for (let quality = 80; quality >= 50; quality -= 5) {
      const buf = await base.clone().webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
      last = { buf, quality, sigma };
      if (buf.length <= budget) break;
    }
    if (last.buf.length <= budget) break;
  }
  writeFileSync(path, last.buf); // write the exact bytes; sharp().toFile() would re-encode
  const kb = (last.buf.length / KB).toFixed(0);
  const notes = [last.sigma && `denoise ${last.sigma}`, last.buf.length > budget && "OVER BUDGET"].filter(Boolean);
  console.log(`${path.padEnd(52)} q${last.quality}  ${kb} KB  ${notes.join(", ")}`);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const { file, name, widths, budget = 150 * KB, aspect, position = sharp.strategy.attention } of images) {
  for (const w of widths) {
    const resize = aspect
      ? { width: w, height: Math.round(w / aspect), fit: "cover", position }
      : { width: w, withoutEnlargement: true };
    const pipeline = sharp(`${SRC}/${file}`).rotate().resize(resize);
    await encodeWithin(pipeline, `${OUT}/${name}-${w}.webp`, budget);
  }
}
