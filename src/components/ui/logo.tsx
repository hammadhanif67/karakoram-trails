import { Mountain } from "lucide-react";
import { site } from "@/lib/site";

/** The brand mark from site.config.ts: the built-in mountain, or your own SVG from /public. */
export function LogoMark({ className }: { className?: string }) {
  if (site.logo.mark === "mountain") return <Mountain className={className} aria-hidden />;
  // A plain <img>: an SVG logo needs no resizing, and next/image can't optimise in a static export.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={site.logo.mark} alt="" aria-hidden className={className} />;
}
