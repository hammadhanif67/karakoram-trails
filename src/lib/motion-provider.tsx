"use client";

import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";

/**
 * framer-motion with the smaller `m` components: LazyMotion supplies only the domAnimation features
 * (no layout or drag, which the site doesn't use). `strict` makes any leftover full `motion.*`
 * component throw during development instead of silently loading the whole library.
 * MotionConfig honours the visitor's reduce-motion setting in every animation, including Magic UI
 * components (Word Rotate, ...) that don't check it themselves.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
