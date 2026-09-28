// Responsive photos from the manifest written by scripts/optimize-images.mjs (npm run optimize-images).
import manifest from "./images.generated.json";

export type ImageName = keyof typeof manifest;

export type Credit = { site: string; license: string; licenseUrl: string; author: string; url: string; subject: string };
type Entry = { width: number; height: number; placeholder: string; avif: [number, string][]; webp: [number, string][]; credit: Credit };

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

/** What a photo shows, as checked against its source page (used as a caption). */
export const photoSubject = (name: ImageName) => (manifest[name] as Entry).credit.subject;

/** Every photo with its source, photographer and licence (for /credits/). */
export const photoCredits = () =>
  (Object.keys(manifest) as ImageName[]).map((name) => ({ name, ...(manifest[name] as Entry).credit }));
