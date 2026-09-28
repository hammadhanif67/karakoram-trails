"use client";

// Interactive parts of the hero; the rest of the hero is a server component (hero.tsx).
import { CalendarDays, Users, Wallet } from "lucide-react";
import { WordRotate } from "@/components/magicui/word-rotate";
import { formatDate, formatPrice, getTour, maxGroupSize } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { useDepartures, useFromPrice } from "@/lib/live-data";
import { cn } from "@/lib/utils";

/**
 * "Journeys to <place>": a slow Word Rotate, or the full list under reduced motion. Both are in the HTML and
 * CSS (motion-reduce) picks one, so the line never changes length after hydration.
 */
export function HeroPlaces({ places }: { places: string[] }) {
  return (
    <>
      <span className="sr-only">{places.join(", ")}</span>
      <span aria-hidden className="hidden motion-reduce:inline">
        {places.join(" · ")}
      </span>
      {/* Magic UI Word Rotate, kept slow and subtle */}
      <span aria-hidden className="text-cream motion-reduce:hidden">
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
  );
}

/** Facts strip along the bottom edge of the hero: useful at a glance, and a clean straight edge. */
export function HeroFacts() {
  const { currency } = useCurrency();
  const fromPrice = useFromPrice();
  const nextDeparture = useDepartures()[0];
  const tour = nextDeparture ? getTour(nextDeparture.tour) : undefined;
  // `short` is shown below 1024px so every value stays on one line on phones and tablets.
  const fullDate = nextDeparture ? formatDate(nextDeparture.date) : "";
  const facts = [
    nextDeparture && tour
      ? {
          icon: CalendarDays,
          label: "Next departure",
          value: `${fullDate} · ${tour.name}`,
          short: `${fullDate.replace(/ \d{4}$/, "")} · ${tour.name}`,
          href: `/tours/${tour.slug}/`,
        }
      : { icon: CalendarDays, label: "Departures", value: "Private trips on your dates", short: "Private trips", href: "#contact" },
    { icon: Wallet, label: "Tours from", value: `${formatPrice(fromPrice, currency)} per person`, short: formatPrice(fromPrice, currency), href: "#tours" },
    { icon: Users, label: "Group size", value: `Small groups, max ${maxGroupSize}`, short: `Max ${maxGroupSize} travellers`, href: "#why-us" },
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
