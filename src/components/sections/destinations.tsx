"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Calendar, Car, Check, Mountain } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Photo } from "@/components/ui/photo";
import { CtaButton } from "@/components/ui/cta-button";
import { SeasonStrip } from "@/components/ui/season-strip";
import { destinations } from "@/lib/content";
import { useMediaQuery, useReducedMotionSafe } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Destination = (typeof destinations)[number];

function Panel({ d, index, pinned }: { d: Destination; index: number; pinned: boolean }) {
  return (
    <article
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${destinations.length}: ${d.title}`}
      className={cn(
        "relative isolate flex shrink-0 overflow-hidden bg-night text-cream",
        pinned ? "h-svh w-screen items-end" : "h-[82svh] min-h-[38rem] w-[86vw] snap-center items-end rounded-3xl sm:w-[70vw]",
      )}
    >
      <Photo
        name={d.image}
        alt={d.alt}
        sizes="(min-width: 1024px) 100vw, (min-width: 640px) 70vw, 86vw"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/40 to-night/10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night/60 to-transparent" />

      <div className={cn("w-full", pinned ? "mx-auto max-w-7xl px-8 pb-20" : "p-6 pb-7")}>
        <BlurFade inView direction="up" offset={16} duration={0.7}>
          <p className="font-serif text-lg text-apricot italic">
            {String(index + 1).padStart(2, "0")} / {String(destinations.length).padStart(2, "0")}
          </p>
          <h3
            className={cn(
              "mt-2 font-serif leading-[0.9] font-medium",
              pinned ? "text-8xl xl:text-[9rem]" : "text-5xl sm:text-6xl",
            )}
          >
            {d.title}
          </h3>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.2em] text-cream/80 uppercase">
            <span className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-apricot" aria-hidden /> {d.altitudeNote} {d.altitude}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-apricot" aria-hidden /> Best {d.best}
            </span>
          </div>
          <p className={cn("mt-4 flex max-w-xl gap-2 text-cream/90", pinned ? "text-base" : "text-sm")}>
            <Car className="mt-0.5 h-4 w-4 shrink-0 text-apricot" aria-hidden /> {d.gettingThere}
          </p>
          <ul className={cn("mt-4 max-w-xl space-y-1.5 text-cream/90", pinned ? "text-base" : "text-sm")}>
            {d.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-apricot" aria-hidden /> {h}
              </li>
            ))}
          </ul>
          <SeasonStrip codes={d.season} tone="dark" label={`${d.title}: season by month`} className="mt-5 max-w-sm" />
          <CtaButton href="#tours" variant="outline" arrow className={pinned ? "mt-7" : "mt-5"}>
            See tours
          </CtaButton>
        </BlurFade>
      </div>
    </article>
  );
}

function Progress({ progress }: { progress: MotionValue<number> }) {
  const scaleX = progress;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-8 z-10 mx-auto flex max-w-7xl items-center gap-4 px-8">
      <span className="text-xs tracking-[0.25em] text-cream/70 uppercase">Scroll</span>
      <div className="h-px flex-1 bg-cream/20">
        <motion.div className="h-px origin-left bg-apricot" style={{ scaleX }} />
      </div>
    </div>
  );
}

/**
 * Desktop: the section pins and the three full-width panels slide horizontally as you scroll.
 * Phones, tablets and reduced motion: a native swipe carousel with scroll snapping (no scroll-jacking).
 */
export function Destinations() {
  const reduce = useReducedMotionSafe();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const pinned = desktop && !reduce;

  const ref = useRef<HTMLDivElement>(null);
  // The pinned track (and its ref) only exists on desktop; without it, don't hand useScroll a target
  // that never mounts (framer throws "Target ref is defined but not hydrated").
  const { scrollYProgress } = useScroll(pinned ? { target: ref, offset: ["start start", "end end"] } : {});
  const n = destinations.length;
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${(n - 1) * 100}vw`]);

  const intro = (
    <div className={cn("mx-auto max-w-7xl px-5 sm:px-8", pinned ? "pt-24 sm:pt-32" : "py-24 sm:py-32 pb-10 sm:pb-12")}>
      <BlurFade inView direction="up" offset={20}>
        <p className="text-xs font-medium tracking-[0.25em] text-apricot uppercase">Popular destinations</p>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] font-medium text-balance text-ink sm:text-5xl lg:text-6xl">
          Three valleys, <em className="text-pine">one unforgettable north</em>
        </h2>
      </BlurFade>
    </div>
  );

  if (!pinned) {
    return (
      <section id="destinations" className="bg-cream" aria-label="Popular destinations">
        {intro}
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-24 [scrollbar-width:none] sm:px-8 sm:pb-32 [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          aria-label="Destinations carousel, swipe or use arrow keys"
        >
          {destinations.map((d, i) => (
            <Panel key={d.slug} d={d} index={i} pinned={false} />
          ))}
          <div aria-hidden className="w-1 shrink-0" />
        </div>
      </section>
    );
  }

  return (
    <section id="destinations" className="bg-cream" aria-label="Popular destinations">
      {intro}
      <div ref={ref} className="relative mt-16" style={{ height: `${n * 100}svh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          <motion.div className="flex h-full" style={{ x }}>
            {destinations.map((d, i) => (
              <Panel key={d.slug} d={d} index={i} pinned />
            ))}
          </motion.div>
          <Progress progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}
