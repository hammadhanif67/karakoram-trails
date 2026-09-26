"use client";

import { CalendarDays, MapPin, Users, Wallet } from "lucide-react";
import { LayeredParallaxHero } from "@/components/ui/layer-parallax-hero";
import { CtaButton } from "@/components/ui/cta-button";
import { WordRotate } from "@/components/magicui/word-rotate";
import { departures, formatDate, formatPrice, getTour, photo, tours } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-media-query";

const places = ["Hunza", "Skardu", "Fairy Meadows", "Deosai", "Naran"];
const nextDeparture = [...departures].sort((a, b) => a.date.localeCompare(b.date))[0];
const fromPrice = Math.min(...tours.map((t) => t.pricePKR));

/** Facts strip along the bottom edge of the hero: useful at a glance, and a clean straight edge. */
function HeroFacts() {
  const { currency } = useCurrency();
  const tour = getTour(nextDeparture.tour)!;
  // `short` is shown below 1024px so every value stays on one line on phones and tablets.
  const fullDate = formatDate(nextDeparture.date);
  const facts = [
    {
      icon: CalendarDays,
      label: "Next departure",
      value: `${fullDate} · ${tour.name}`,
      short: `${fullDate.replace(/ \d{4}$/, "")} · ${tour.name}`,
      href: `/tours/${tour.slug}/`,
    },
    { icon: Wallet, label: "Tours from", value: `${formatPrice(fromPrice, currency)} per person`, short: formatPrice(fromPrice, currency), href: "#tours" },
    { icon: Users, label: "Group size", value: "Small groups, max 12", short: "Max 12 travellers", href: "#why-us" },
  ];
  return (
    <div className="animate-hero-rise border-t border-cream/15 bg-night/35 backdrop-blur-md" style={{ animationDelay: "0.6s" }}>
      {/* Phones: the first two facts side by side; wider screens: all three plus the scroll cue */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-cream/10 px-5 sm:grid-cols-3 sm:px-8 lg:grid-cols-[1fr_1fr_1fr_auto]">
        {facts.map((f, i) => (
          <a
            key={f.label}
            href={f.href}
            className={cn(
              "group flex min-w-0 items-center gap-3 py-4 pl-4 transition-colors first:pl-0 max-[359px]:pl-3 sm:px-5 sm:py-5 lg:gap-4 lg:px-6 lg:py-6",
              i === 2 && "hidden sm:flex",
            )}
          >
            <f.icon className="hidden h-5 w-5 shrink-0 text-apricot md:block" aria-hidden />
            <span className="min-w-0">
              <span className="block truncate text-[0.6rem] tracking-[0.22em] text-cream/60 uppercase sm:text-[0.65rem] sm:tracking-[0.25em]">
                {f.label}
              </span>
              <span className="mt-1 block truncate text-[0.8rem] text-cream transition-colors group-hover:text-apricot max-[359px]:text-[0.72rem] sm:text-sm">
                <span className="lg:hidden">{f.short}</span>
                <span className="hidden lg:inline">{f.value}</span>
              </span>
            </span>
          </a>
        ))}
        <a
          href="#destinations"
          className="hidden items-center gap-3 pl-8 text-[0.65rem] tracking-[0.3em] text-cream/70 uppercase transition-colors hover:text-cream lg:flex"
        >
          <span aria-hidden className="relative h-10 w-px overflow-hidden bg-cream/25">
            <span className="animate-scroll-cue absolute inset-x-0 top-0 h-3 bg-apricot" />
          </span>
          Scroll
        </a>
      </div>
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotionSafe();
  // Entrance is plain CSS (animate-hero-rise), so the text shows on first paint instead of
  // staying invisible until JavaScript has loaded and hydrated.
  const rise = (delay: number) => ({ style: { animationDelay: `${delay}s` } });

  return (
    <LayeredParallaxHero
      image={{ ...photo("hero-skardu-shangrila"), alt: "Shangrila lake in Skardu beneath snow-capped Karakoram peaks" }}
      footer={<HeroFacts />}
    >
      <div id="top" className="mx-auto w-full max-w-7xl px-5 pt-28 pb-12 sm:px-8 [@media(max-height:720px)]:pt-20 [@media(max-height:720px)]:pb-8">
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
          className="animate-hero-rise mt-6 max-w-4xl font-serif text-[3.25rem] leading-[0.95] font-medium text-cream sm:text-7xl lg:text-8xl xl:text-[7.5rem] [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:text-[2.6rem] [@media(max-height:720px)_and_(min-width:640px)]:text-6xl"
        >
          Where the mountains <em className="text-apricot">still keep secrets</em>
        </h1>

        <p {...rise(0.3)} className="animate-hero-rise mt-6 max-w-xl [@media(max-height:720px)]:mt-4 text-base leading-relaxed text-cream/85 sm:text-lg">
          Curated journeys through the Karakoram and Himalaya with local guides, small groups and stays we have
          chosen ourselves.
        </p>

        <div {...rise(0.45)} className="animate-hero-rise mt-9 flex flex-wrap gap-3 sm:gap-4 [@media(max-height:720px)]:mt-6">
          <CtaButton href="#tours" size="lg" arrow>
            Explore tours
          </CtaButton>
          <CtaButton href="#destinations" variant="outline" size="lg">
            See destinations
          </CtaButton>
        </div>

      </div>
    </LayeredParallaxHero>
  );
}
