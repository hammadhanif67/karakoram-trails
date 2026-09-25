// Builds responsive WebP images in public/images/ from photos-original/.
// Each output is re-encoded at decreasing quality until it fits its byte budget.
// Run with: npm run optimize-images

import sharp from "sharp";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const SRC = "photos-original";
const OUT = "public/images";
const KB = 1024;

// Hero may reach ~300 KB at its largest size; every other file stays under 150 KB.
const photos = [
  { file: "pexels-arifesapzai-35302567.jpg", name: "skardu", widths: [480, 768, 1280, 1920], budget: 300 * KB },
  { file: "pexels-faysal9-35061891.jpg", name: "hunza", widths: [480, 720, 880], budget: 150 * KB },
  { file: "pexels-zia-uddin-shah-392997573-14795281.jpg", name: "fairy-meadows", widths: [480, 800, 1200], budget: 150 * KB },
];

// Gallery detail crops (fractions of the original: left, top, width, height).
const crops = [
  ["pexels-arifesapzai-35302567.jpg", "gallery-skardu-peaks", [0.0, 0.1, 0.62, 0.5]],
  ["pexels-arifesapzai-35302567.jpg", "gallery-skardu-lake", [0.2, 0.62, 0.6, 0.38]],
  ["pexels-faysal9-35061891.jpg", "gallery-hunza-rider", [0.25, 0.35, 0.5, 0.35]],
  ["pexels-faysal9-35061891.jpg", "gallery-hunza-poplars", [0.5, 0.0, 0.5, 0.55]],
  ["pexels-zia-uddin-shah-392997573-14795281.jpg", "gallery-fm-glacier", [0.15, 0.3, 0.7, 0.4]],
  ["pexels-zia-uddin-shah-392997573-14795281.jpg", "gallery-fm-meadow", [0.2, 0.6, 0.8, 0.4]],
];
const CROP_WIDTHS = [400, 800];

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
  console.log(`${path.padEnd(44)} q${last.quality}  ${kb} KB  ${notes.join(", ")}`);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const { file, name, widths, budget } of photos) {
  for (const w of widths) {
    const pipeline = sharp(`${SRC}/${file}`).rotate().resize({ width: w, withoutEnlargement: true });
    await encodeWithin(pipeline, `${OUT}/${name}-${w}.webp`, budget);
  }
}

for (const [file, name, [l, t, w, h]] of crops) {
  const { info } = await sharp(`${SRC}/${file}`).rotate().toBuffer({ resolveWithObject: true });
  const region = {
    left: Math.round(l * info.width),
    top: Math.round(t * info.height),
    width: Math.round(w * info.width),
    height: Math.round(h * info.height),
  };
  for (const cw of CROP_WIDTHS) {
    const pipeline = sharp(`${SRC}/${file}`).rotate().extract(region).resize({ width: cw, withoutEnlargement: true });
    await encodeWithin(pipeline, `${OUT}/${name}-${cw}.webp`, 150 * KB);
  }
}
