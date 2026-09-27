"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

// The animation features are a separate chunk, fetched after hydration instead of with the first load.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

/**
 * framer-motion with the smaller `m` components: LazyMotion supplies only the domAnimation features
 * (no layout or drag, which the site doesn't use), loaded asynchronously so they stay out of the first
 * load. `strict` makes any leftover full `motion.*` component throw instead of silently loading the
 * whole library.
 * MotionConfig honours the visitor's reduce-motion setting in every animation, including Magic UI
 * components (Word Rotate, ...) that don't check it themselves.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
