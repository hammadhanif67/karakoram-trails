"use client";

// Adapted from "Layer Parallax Hero" by erikvalencia1 on 21st.dev.
// Changes: photo + mountain layers instead of abstract shapes, and scroll parallax instead of the
// original pointer-follow effect (the background no longer moves with the cursor). Scroll motion is
// switched off under prefers-reduced-motion.

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Layer = { className?: string; children: React.ReactNode; front?: boolean };

type Props = {
  image: { src: string; srcSet: string; alt: string };
  children: React.ReactNode;
  /** Decorative layers drawn over the photo; `front` layers also cover the content as it scrolls away. */
  layers?: Layer[];
  className?: string;
};

export function LayeredParallaxHero({ image, children, layers = [], className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();

  // Scroll parallax: photo drifts slower than the page, content lifts and fades out.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "25%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.05, reduce ? 1.05 : 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);

  return (
    <section ref={ref} className={cn("relative isolate flex min-h-svh items-center overflow-hidden bg-night", className)}>
      {/* Photo (furthest back) */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: photoY, scale: photoScale }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export; images are pre-optimized */}
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="100vw"
          alt={image.alt}
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Tint so text keeps 4.5:1 contrast on any part of the photo */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-night/70 via-night/35 to-night/85" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night/70 via-night/20 to-transparent" />

      {layers
        .filter((l) => !l.front)
        .map((layer, i) => (
          <div key={i} aria-hidden className={cn("pointer-events-none absolute inset-0", layer.className)}>
            {layer.children}
          </div>
        ))}

      {/* Content: scrolls down and fades, sliding behind any `front` layers */}
      <motion.div className="relative z-10 w-full" style={{ y: contentY, opacity: contentOpacity }}>
        {children}
      </motion.div>

      {layers
        .filter((l) => l.front)
        .map((layer, i) => (
          <div key={`front-${i}`} aria-hidden className={cn("pointer-events-none absolute inset-0 z-20", layer.className)}>
            {layer.children}
          </div>
        ))}
    </section>
  );
}
