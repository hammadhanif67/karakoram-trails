"use client";

// Adapted from "3D Card" (Destination Card) by kavikatiyar on 21st.dev.
// Changes: Karakoram Trails palette and fonts, fluid width, responsive srcSet images,
// in-page anchors instead of an external link, tilt disabled under reduced motion,
// and extra detail rows (blurb, best season).

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveTravelCardProps {
  title: string;
  subtitle: string;
  image: { src: string; srcSet: string };
  blurb: string;
  season: string;
  actionText: string;
  href: string;
  className?: string;
}

export const InteractiveTravelCard = React.forwardRef<HTMLDivElement, InteractiveTravelCardProps>(
  ({ title, subtitle, image, blurb, season, actionText, href, className }, ref) => {
    const reduce = useReducedMotion();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);
    const rotateX = useTransform(springY, [-0.5, 0.5], ["9deg", "-9deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-9deg", "9deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce) return;
      const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - left) / width - 0.5);
      mouseY.set((e.clientY - top) / height - 0.5);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "group relative h-[30rem] w-full rounded-3xl border border-white/10 bg-pine-deep shadow-2xl shadow-night/40",
          className,
        )}
      >
        <div
          style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
          className="absolute inset-3 grid grid-rows-[1fr_auto] overflow-hidden rounded-2xl shadow-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-optimized srcSet */}
          <img
            src={image.src}
            srcSet={image.srcSet}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={`${title}, ${subtitle}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-night/50 via-transparent to-night/90" />

          <div className="relative flex flex-col justify-between p-5 text-cream">
            <div className="flex items-start justify-between gap-4">
              <div style={{ transform: "translateZ(50px)" }}>
                <h3 className="font-serif text-3xl leading-none font-semibold">{title}</h3>
                <p className="mt-2 text-xs tracking-wide text-cream/85">{subtitle}</p>
              </div>
              <motion.a
                href={href}
                whileHover={{ scale: 1.1, rotate: "2.5deg" }}
                whileTap={{ scale: 0.9 }}
                aria-label={`See tours to ${title}`}
                style={{ transform: "translateZ(60px)" }}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm ring-inset transition-colors hover:bg-white/25"
              >
                <ArrowUpRight className="h-5 w-5" />
              </motion.a>
            </div>

            <div style={{ transform: "translateZ(40px)" }} className="space-y-4">
              <p className="text-sm leading-relaxed text-cream/90">{blurb}</p>
              <p className="text-xs tracking-[0.2em] text-apricot uppercase">Best season · {season}</p>
              <motion.a
                href={href}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="block w-full cursor-pointer rounded-full bg-white/10 py-3 text-center text-sm font-medium ring-1 ring-white/25 backdrop-blur-md ring-inset transition-colors hover:bg-apricot hover:text-apricot-ink"
              >
                {actionText}
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);
InteractiveTravelCard.displayName = "InteractiveTravelCard";
