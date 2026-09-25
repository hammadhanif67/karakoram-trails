import { photo, type ImageName } from "@/lib/content";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  name: ImageName;
  alt: string;
  /** Load immediately (above-the-fold images). */
  priority?: boolean;
};

/** Pre-optimized responsive WebP from public/images (see scripts/optimize-images.mjs). */
export function Photo({ name, alt, priority, sizes = "100vw", ...rest }: Props) {
  const { src, srcSet } = photo(name);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export; images are pre-optimized
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      {...rest}
    />
  );
}
