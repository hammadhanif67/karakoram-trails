"use client";

import { MotionConfig } from "framer-motion";

/**
 * Honour the visitor's reduce-motion setting in every framer-motion animation on the site,
 * including Magic UI components (Blur Fade, Word Rotate, ...) that don't check it themselves.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
