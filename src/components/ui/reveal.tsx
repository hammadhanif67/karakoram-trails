"use client";

import { useReducedMotion } from "framer-motion";
import { BlurFade } from "@/components/magicui/blur-fade";

type RevealProps = { delay?: number; className?: string; children: React.ReactNode };

/**
 * Scroll-in animation used across sections: Magic UI Blur Fade (fade + lift + de-blur),
 * triggered once when the block enters the viewport. Renders static under reduced motion.
 */
export function Reveal({ delay = 0, className, children }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <BlurFade inView inViewMargin="-80px" direction="up" offset={24} blur="8px" duration={0.7} delay={delay} className={className}>
      {children}
    </BlurFade>
  );
}
