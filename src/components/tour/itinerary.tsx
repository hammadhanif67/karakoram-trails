"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { BedDouble } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import type { Tour } from "@/lib/content";
import { useReducedMotionSafe } from "@/lib/use-media-query";

/** Day-by-day timeline whose connecting line draws down the page as you scroll. */
export function Itinerary({ days }: { days: Tour["itinerary"] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });

  return (
    <ol ref={ref} className="relative mt-10 space-y-10">
      <span aria-hidden className="absolute top-2 bottom-2 left-[1.6rem] w-px bg-line" />
      <motion.span
        aria-hidden
        className="absolute top-2 bottom-2 left-[1.6rem] w-px origin-top bg-apricot"
        style={{ scaleY: reduce ? 1 : scrollYProgress }}
      />
      {days.map((d, i) => (
        <li key={d.title} className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-5 sm:gap-7">
          <div className="relative z-10 flex h-[3.25rem] w-[3.25rem] flex-col items-center justify-center rounded-full border border-line bg-cream text-center shadow-sm">
            <span className="text-[0.6rem] leading-none tracking-[0.15em] text-mist uppercase">Day</span>
            <span className="font-serif text-xl leading-none text-pine">{i + 1}</span>
          </div>
          <BlurFade inView direction="up" offset={12} duration={0.6}>
            <h3 className="pt-2 font-serif text-2xl leading-snug font-medium text-ink sm:text-3xl">{d.title}</h3>
            <p className="mt-2 leading-relaxed text-mist">{d.text}</p>
            {d.stay && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#efe8da] px-3 py-1 text-xs text-ink">
                <BedDouble className="h-3.5 w-3.5 text-pine" aria-hidden /> Overnight in {d.stay}
              </p>
            )}
          </BlurFade>
        </li>
      ))}
    </ol>
  );
}
