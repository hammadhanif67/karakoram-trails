"use client";

// Adapted from "Layer Parallax Hero" by erikvalencia1 on 21st.dev.
// Changes: photo + mountain layers instead of abstract shapes, scroll parallax on top of the
// pointer depth effect, motion values instead of React state (no re-render per mousemove),
// and pointer/scroll motion switched off under prefers-reduced-motion.

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

type Layer = { depth: number; className?: string; children: React.ReactNode; front?: boolean };

type Props = {
  image: { src: string; srcSet: string; alt: string };
  children: React.ReactNode;
  /** Foreground layers drawn in front of the photo. Larger depth = moves more with the pointer. */
  layers?: Layer[];
  className?: string;
};

function DepthLayer({ layer, px, py }: { layer: Layer; px: MotionValue<number>; py: MotionValue<number> }) {
  const x = useTransform(px, (v) => v * -layer.depth);
  const y = useTransform(py, (v) => v * -layer.depth);
  return (
    <motion.div aria-hidden className={cn("pointer-events-none absolute inset-0", layer.className)} style={{ x, y }}>
      {layer.children}
    </motion.div>
  );
}

export function LayeredParallaxHero({ image, children, layers = [], className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Pointer depth (mouse only; touch devices never fire mousemove over the section).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 20 });
  const py = useSpring(my, { stiffness: 60, damping: 20 });
  const photoX = useTransform(px, (v) => v * -18);
  const photoPY = useTransform(py, (v) => v * -12);

  // Scroll parallax: photo drifts slower than the page, content lifts and fades out.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "25%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.08, reduce ? 1.08 : 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    my.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn("relative isolate flex min-h-svh items-center overflow-hidden bg-night", className)}
    >
      {/* Layer 1: photo (furthest back) */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: photoY, scale: photoScale }}>
        <motion.img
          src={image.src}
          srcSet={image.srcSet}
          sizes="100vw"
          alt={image.alt}
          fetchPriority="high"
          className="h-full w-full object-cover"
          style={{ x: photoX, y: photoPY }}
        />
      </motion.div>

      {/* Layer 2: tint so text keeps 4.5:1 contrast on any part of the photo */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-night/70 via-night/35 to-night/85" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night/70 via-night/20 to-transparent" />

      {/* Layer 3+: depth layers behind the content */}
      {layers.filter((l) => !l.front).map((layer, i) => (
        <DepthLayer key={i} layer={layer} px={px} py={py} />
      ))}

      {/* Content: scrolls down and fades, sliding behind any `front` layers */}
      <motion.div className="relative z-10 w-full" style={{ y: contentY, opacity: contentOpacity }}>
        {children}
      </motion.div>

      {/* Front layers (closest): drawn over the content */}
      {layers.filter((l) => l.front).map((layer, i) => (
        <DepthLayer key={`front-${i}`} layer={{ ...layer, className: cn("z-20", layer.className) }} px={px} py={py} />
      ))}
    </section>
  );
}
