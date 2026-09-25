"use client";

import { useSyncExternalStore } from "react";

/**
 * True when the media query matches. Always false during static rendering, so layouts
 * render their mobile / reduced version first and upgrade after hydration.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Hydration-safe prefers-reduced-motion. Framer Motion's useReducedMotion reads the media query
 * during hydration, so markup that depends on it differs from the static HTML (React error #418).
 */
export const useReducedMotionSafe = () => useMediaQuery("(prefers-reduced-motion: reduce)");
