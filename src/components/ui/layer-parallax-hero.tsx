"use client";

// Adapted from "Layer Parallax Hero" by erikvalencia1 on 21st.dev.
// Changes: a photo background with scroll parallax instead of the original pointer-follow shapes (the
// background never moves with the cursor), a bottom `footer` slot, and content that lifts and fades
// out as you scroll away (it no longer drifts down and reappears lower on the page). Scroll motion is
// switched off under prefers-reduced-motion.

import { useRef } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { Photo } from "@/components/ui/photo";
import type { ImageName } from "@/lib/images";
import { useReducedMotionSafe } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Props = {
  image: { name: ImageName; alt: string };
  children: React.ReactNode;
  /** Pinned to the bottom edge of the hero (e.g. a facts strip). */
  footer?: React.ReactNode;
  className?: string;
};

export function LayeredParallaxHero({ image, children, footer, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Photo drifts slower than the page (classic parallax).
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.04, reduce ? 1.04 : 1.12]);
  // Content lifts slightly and is fully gone by the time half the hero has scrolled past.
  const contentY = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? ["0%", "0%", "0%"] : ["0%", "-12%", "-12%"]);
  // Spell out the whole 0..1 range: framer runs scroll-linked opacity on the browser's native
  // ScrollTimeline, and with a partial range ([0, 0.45]) it faded back IN past 0.45, so the hero
  // text reappeared while scrolling down.
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45, 1], reduce ? [1, 1, 1] : [1, 0, 0]);

  return (
    <section ref={ref} className={cn("relative isolate flex min-h-svh flex-col overflow-hidden bg-night", className)}>
      <m.div className="absolute inset-0 -z-10" style={{ y: photoY, scale: photoScale }}>
        <Photo name={image.name} alt={image.alt} priority sizes="100vw" className="h-full w-full object-cover" />
      </m.div>

      {/* Tints keep text at 4.5:1 contrast on any part of the photo */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-night/75 via-night/30 to-night/90" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night/70 via-night/20 to-transparent" />

      <m.div className="relative z-10 flex w-full flex-1 items-center" style={{ y: contentY, opacity: contentOpacity }}>
        {children}
      </m.div>

      {footer && (
        <m.div className="relative z-10 w-full" style={{ opacity: contentOpacity }}>
          {footer}
        </m.div>
      )}
    </section>
  );
}
