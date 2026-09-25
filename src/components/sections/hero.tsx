"use client";

import { motion } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { LayeredParallaxHero } from "@/components/ui/layer-parallax-hero";
import { CtaButton } from "@/components/ui/cta-button";
import { WordRotate } from "@/components/magicui/word-rotate";
import { photo } from "@/lib/content";
import { useReducedMotionSafe } from "@/lib/use-media-query";

const places = ["Hunza", "Skardu", "Fairy Meadows", "Deosai", "Naran"];

export function Hero() {
  const reduce = useReducedMotionSafe();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <LayeredParallaxHero
      image={{ ...photo("hero-skardu-shangrila"), alt: "Shangrila lake in Skardu beneath snow-capped Karakoram peaks" }}
      layers={[
        {
          children: (
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute -bottom-2 left-[-5%] h-[22vh] w-[110%]">
              <path
                d="M0 320V210l120-60 110 40 140-110 120 80 150-120 160 110 120-50 170 90 130-70 170 100v100z"
                fill="var(--night)"
                opacity="0.55"
              />
            </svg>
          ),
        },
        {
          front: true,
          children: (
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute -bottom-2 left-[-5%] h-[12vh] w-[110%]">
              <path d="M0 200V120l180-50 200 60 220-80 240 70 200-40 220 60 180-30v110z" fill="var(--cream)" />
            </svg>
          ),
        },
      ]}
    >
      <div id="top" className="mx-auto max-w-7xl px-5 pt-28 pb-40 sm:px-8">
        <motion.p
          {...rise(0.1)}
          className="flex items-center gap-2 text-xs font-medium tracking-[0.3em] text-apricot uppercase"
        >
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <span>Journeys to</span>
          {reduce ? (
            <span>{places.join(" · ")}</span>
          ) : (
            <>
              <span className="sr-only">{places.join(", ")}</span>
              {/* Magic UI Word Rotate, kept slow and subtle */}
              <span aria-hidden className="text-cream">
                <WordRotate
                  words={places}
                  duration={3800}
                  motionProps={{
                    initial: { opacity: 0, y: 10, filter: "blur(4px)" },
                    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
                    exit: { opacity: 0, y: -10, filter: "blur(4px)" },
                    transition: { duration: 0.8, ease: "easeOut" },
                  }}
                />
              </span>
            </>
          )}
        </motion.p>

        <motion.h1
          {...rise(0.25)}
          className="mt-6 max-w-4xl font-serif text-[3.25rem] leading-[0.95] font-medium text-cream sm:text-7xl lg:text-8xl xl:text-[7.5rem]"
        >
          Where the mountains <em className="text-apricot">still keep secrets</em>
        </motion.h1>

        <motion.p {...rise(0.45)} className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
          Curated journeys through the Karakoram and Himalaya with local guides, small groups and stays we have
          chosen ourselves.
        </motion.p>

        <motion.div {...rise(0.6)} className="mt-9 flex flex-wrap gap-4">
          <CtaButton href="#tours" size="lg" arrow>
            Explore tours
          </CtaButton>
          <CtaButton href="#destinations" variant="outline" size="lg">
            See destinations
          </CtaButton>
        </motion.div>

      </div>

      <motion.a
        href="#destinations"
        aria-label="Scroll to destinations"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1, y: reduce ? 0 : [0, 8, 0] }}
        transition={{ opacity: { delay: 1.2 }, y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } }}
        className="absolute bottom-[14vh] left-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-cream/40 text-cream lg:flex"
      >
        <ArrowDown className="h-5 w-5" />
      </motion.a>
    </LayeredParallaxHero>
  );
}
