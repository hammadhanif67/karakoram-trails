// Responsive photos from the manifest written by scripts/optimize-images.mjs (npm run optimize-images).
import manifest from "./images.generated.json";

export type ImageName = keyof typeof manifest;

type Entry = { width: number; height: number; placeholder: string; avif: [number, string][]; webp: [number, string][] };

const srcSet = (files: [number, string][]) => files.map(([w, path]) => `${path} ${w}w`).join(", ");

/** Source sets (AVIF first, WebP fallback), intrinsic size and the tiny blur placeholder for one photo. */
export function photo(name: ImageName) {
  const e = manifest[name] as Entry;
  const middle = e.webp[Math.min(1, e.webp.length - 1)];
  return {
    src: middle[1],
    webpSrcSet: srcSet(e.webp),
    avifSrcSet: srcSet(e.avif),
    width: e.width,
    height: e.height,
    placeholder: e.placeholder,
  };
}
