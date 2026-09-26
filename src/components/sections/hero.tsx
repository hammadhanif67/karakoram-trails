"use client";

import { MapPin } from "lucide-react";
import { LayeredParallaxHero } from "@/components/ui/layer-parallax-hero";
import { CtaButton } from "@/components/ui/cta-button";
import { WordRotate } from "@/components/magicui/word-rotate";
import { photo } from "@/lib/content";
import { useReducedMotionSafe } from "@/lib/use-media-query";

const places = ["Hunza", "Skardu", "Fairy Meadows", "Deosai", "Naran"];

export function Hero() {
  const reduce = useReducedMotionSafe();
  // Entrance is plain CSS (animate-hero-rise), so the text shows on first paint instead of
  // staying invisible until JavaScript has loaded and hydrated.
  const rise = (delay: number) => ({ style: { animationDelay: `${delay}s` } });

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
        <p
          {...rise(0.05)}
          className="animate-hero-rise flex items-center gap-2 text-xs font-medium tracking-[0.3em] text-apricot uppercase"
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
        </p>

        <h1
          {...rise(0.15)}
          className="animate-hero-rise mt-6 max-w-4xl font-serif text-[3.25rem] leading-[0.95] font-medium text-cream sm:text-7xl lg:text-8xl xl:text-[7.5rem]"
        >
          Where the mountains <em className="text-apricot">still keep secrets</em>
        </h1>

        <p {...rise(0.3)} className="animate-hero-rise mt-6 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
          Curated journeys through the Karakoram and Himalaya with local guides, small groups and stays we have
          chosen ourselves.
        </p>

        <div {...rise(0.45)} className="animate-hero-rise mt-9 flex flex-wrap gap-4">
          <CtaButton href="#tours" size="lg" arrow>
            Explore tours
          </CtaButton>
          <CtaButton href="#destinations" variant="outline" size="lg">
            See destinations
          </CtaButton>
        </div>

        {/* Scroll cue: part of the content, so it fades with it and slides behind the mountains */}
        <a
          href="#destinations"
          {...rise(0.7)}
          className="animate-hero-rise group mt-14 hidden w-fit items-center gap-4 text-[0.7rem] tracking-[0.3em] text-cream/70 uppercase transition-colors hover:text-cream lg:flex"
        >
          <span aria-hidden className="relative h-12 w-px overflow-hidden bg-cream/25">
            <span className="animate-scroll-cue absolute inset-x-0 top-0 h-4 bg-apricot" />
          </span>
          Scroll to explore
        </a>
      </div>
    </LayeredParallaxHero>
  );
}
