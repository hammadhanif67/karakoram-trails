import { photo, type ImageName } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height"> & {
  name: ImageName;
  alt: string;
  /** Load immediately (above-the-fold images). */
  priority?: boolean;
};

/**
 * Pre-optimized responsive photo (scripts/optimize-images.mjs): AVIF with a WebP fallback, the intrinsic
 * width/height (so the browser reserves the right space), and a tiny blurred placeholder painted as the
 * image's background until the real file arrives. No JavaScript involved.
 */
export function Photo({ name, alt, priority, sizes = "100vw", className, style, ...rest }: Props) {
  const p = photo(name);
  return (
    // `contents`: the <picture> wrapper takes no box, so sizing classes on the <img> behave as before.
    <picture className="contents">
      <source type="image/avif" srcSet={p.avifSrcSet} sizes={sizes} />
      <img
        src={p.src}
        srcSet={p.webpSrcSet}
        sizes={sizes}
        width={p.width}
        height={p.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn("bg-cover bg-center", className)}
        style={{ backgroundImage: `url("${p.placeholder}")`, ...style }}
        {...rest}
      />
    </picture>
  );
}
