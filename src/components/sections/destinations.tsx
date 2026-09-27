"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Calendar, Car, Check, Mountain } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Photo } from "@/components/ui/photo";
import { CtaButton } from "@/components/ui/cta-button";
import { SeasonStrip } from "@/components/ui/season-strip";
import { destinations } from "@/lib/content";
import { useMediaQuery, useReducedMotionSafe } from "@/lib/use-media-query";

type Destination = (typeof destinations)[number];

// Layout is pure CSS: base classes are the swipe carousel (phones, tablets, reduced motion) and `pin:`
// classes (desktop with motion allowed, see globals.css) the pinned full-screen panels. The static HTML
// therefore already has the right layout; JavaScript only adds the horizontal scroll movement.

function Panel({ d, index }: { d: Destination; index: number }) {
  return (
    <article
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${destinations.length}: ${d.title}`}
      className="relative isolate flex h-[82svh] min-h-[38rem] w-[86vw] shrink-0 snap-center items-end overflow-hidden rounded-3xl bg-night text-cream sm:w-[70vw] pin:h-svh pin:min-h-0 pin:w-screen pin:rounded-none"
    >
      <Photo
        name={d.image}
        alt={d.alt}
        sizes="(min-width: 1024px) 100vw, (min-width: 640px) 70vw, 86vw"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/40 to-night/10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night/60 to-transparent" />

      <div className="w-full p-6 pb-7 pin:mx-auto pin:max-w-7xl pin:px-8 pin:pt-0 pin:pb-20">
        <Reveal>
          <p className="font-serif text-lg text-apricot italic">
            {String(index + 1).padStart(2, "0")} / {String(destinations.length).padStart(2, "0")}
          </p>
          <h3 className="mt-2 font-serif text-5xl leading-[0.9] font-medium sm:text-6xl pin:text-8xl xl:pin:text-[9rem]">{d.title}</h3>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.2em] text-cream/80 uppercase">
            <span className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-apricot" aria-hidden /> {d.altitudeNote} {d.altitude}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-apricot" aria-hidden /> Best {d.best}
            </span>
          </div>
          <p className="mt-4 flex max-w-xl gap-2 text-sm text-cream/90 pin:text-base">
            <Car className="mt-0.5 h-4 w-4 shrink-0 text-apricot" aria-hidden /> {d.gettingThere}
          </p>
          <ul className="mt-4 max-w-xl space-y-1.5 text-sm text-cream/90 pin:text-base">
            {d.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-apricot" aria-hidden /> {h}
              </li>
            ))}
          </ul>
          <SeasonStrip codes={d.season} tone="dark" label={`${d.title}: season by month`} className="mt-5 max-w-sm" />
          <CtaButton href="#tours" variant="outline" arrow className="mt-5 pin:mt-7">
            See tours
          </CtaButton>
        </Reveal>
      </div>
    </article>
  );
}

function Progress({ progress }: { progress: MotionValue<number> }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-8 z-10 mx-auto hidden max-w-7xl items-center gap-4 px-8 pin:flex">
      <span className="text-xs tracking-[0.25em] text-cream/70 uppercase">Scroll</span>
      <div className="h-px flex-1 bg-cream/20">
        <motion.div className="h-px origin-left bg-apricot" style={{ scaleX: progress }} />
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
  const pinned = desktop && !reduce; // must match the `pin` variant in globals.css

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = destinations.length;
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${(n - 1) * 100}vw`]);

  return (
    <section id="destinations" className="bg-cream" aria-label="Popular destinations">
      <div className="mx-auto max-w-7xl px-5 pt-24 pb-10 sm:px-8 sm:pt-32 sm:pb-12 pin:pb-0">
        <Reveal>
          <p className="text-xs font-medium tracking-[0.25em] text-apricot-deep uppercase">Popular destinations</p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] font-medium text-balance text-ink sm:text-5xl lg:text-6xl">
            Three valleys, <em className="text-pine">one unforgettable north</em>
          </h2>
        </Reveal>
      </div>

      {/* Pinned: a tall scroll area with a sticky viewport. Carousel: these wrappers are plain blocks. */}
      <div ref={ref} className="relative pin:mt-16 pin:h-(--pin-h)" style={{ "--pin-h": `${n * 100}svh` } as React.CSSProperties}>
        <div className="pin:sticky pin:top-0 pin:h-svh pin:overflow-hidden">
          <motion.div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-24 [scrollbar-width:none] sm:px-8 sm:pb-32 [&::-webkit-scrollbar]:hidden pin:h-full pin:snap-none pin:gap-0 pin:overflow-visible pin:p-0 pin:sm:p-0"
            style={pinned ? { x } : undefined}
            tabIndex={pinned ? undefined : 0}
            aria-label="Destinations carousel, swipe or use arrow keys"
          >
            {destinations.map((d, i) => (
              <Panel key={d.slug} d={d} index={i} />
            ))}
            <div aria-hidden className="w-1 shrink-0 pin:hidden" />
          </motion.div>
          <Progress progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}
