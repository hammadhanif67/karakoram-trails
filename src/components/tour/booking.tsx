"use client";

import { useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { CurrencyToggle } from "@/components/ui/currency-toggle";
import { CtaButton } from "@/components/ui/cta-button";
import { formatDate, formatPrice, whatsappLink, type Tour } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { useDepartures, useLiveData, useTourPrice } from "@/lib/live-data";

/** Live price per person for a tour (D1 via /api/departures, content.ts as fallback). */
export function TourPrice({ slug, prefix = "", className }: { slug: string; prefix?: string; className?: string }) {
  const { currency } = useCurrency();
  const pkr = useTourPrice(slug);
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {formatPrice(pkr, currency)}
    </span>
  );
}

const FLEXIBLE = "flexible";

/**
 * Booking panel: a sticky card beside the itinerary on desktop (inline at the end on phones),
 * plus a fixed "Book on WhatsApp" bar at the bottom of the screen on phones and tablets.
 */
export function TourBooking({ tour }: { tour: Tour }) {
  const { currency } = useCurrency();
  const { status } = useLiveData();
  // Only departures that can still be booked online and have seats; the rest go through WhatsApp.
  const all = useDepartures(tour.slug);
  const departures = all.filter((d) => d.bookable && d.seatsLeft > 0);
  // null = "first available", so the default follows the live data when it arrives.
  const [choice, setChoice] = useState<string | null>(null);
  const date = choice ?? departures[0]?.date ?? FLEXIBLE;
  const setDate = setChoice;

  const when = date === FLEXIBLE ? "on my own dates" : `departing ${formatDate(date)}`;
  const whatsapp = whatsappLink(`Assalam o Alaikum, I'd like to book ${tour.name} (${tour.days} days) ${when}.`);
  // Online checkout for a scheduled departure once live data is loaded; private trips go to WhatsApp.
  const chosen = departures.find((d) => d.date === date);
  const checkout = status === "live" && chosen?.id != null ? `/checkout/?departure=${chosen.id}` : null;
  const link = checkout ?? whatsapp;
  const external = checkout ? {} : { target: "_blank", rel: "noopener noreferrer" };
  const price = formatPrice(useTourPrice(tour.slug), currency);

  return (
    <>
      <aside aria-label="Book this tour" className="lg:relative">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-white/80 p-7 shadow-xl shadow-night/5 lg:sticky lg:top-28">
          <ShineBorder borderWidth={1.5} duration={12} shineColor={["#d08a3c", "#f6f1e7", "#d08a3c"]} />
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs tracking-[0.2em] text-mist uppercase">From, per person</p>
            <CurrencyToggle tone="light" />
          </div>
          <p className="mt-3 font-serif text-5xl font-medium text-ink tabular-nums">{price}</p>
          {currency === "USD" && <p className="mt-1 text-xs text-mist">Approximate. Final price is in PKR.</p>}

          <label htmlFor="departure" className="mt-7 block text-sm font-medium text-ink">
            Departure
          </label>
          <select
            id="departure"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-line bg-white px-4 text-base text-ink focus:border-pine focus:outline-none"
          >
            {departures.map((d) => (
              <option key={d.id ?? d.date} value={d.date}>
                {formatDate(d.date)} · {d.seatsLeft} seats left
              </option>
            ))}
            <option value={FLEXIBLE}>Private trip, my own dates</option>
          </select>

          <CtaButton
            href={link}
            {...external}
            size="lg"
            shine
            arrow={!!checkout}
            icon={checkout ? undefined : <MessageCircle className="h-4 w-4" aria-hidden />}
            className="mt-6 w-full"
          >
            {checkout ? "Reserve seats" : "Book on WhatsApp"}
          </CtaButton>
          {checkout && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 text-sm text-pine underline-offset-4 hover:underline">
              <MessageCircle className="h-4 w-4" aria-hidden /> Questions first? Ask on WhatsApp
            </a>
          )}
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mist">
            <ShieldCheck className="h-4 w-4 shrink-0 text-pine" aria-hidden />
            {checkout
              ? "Reserve now and pay a deposit by bank transfer. Nothing is charged on this site."
              : "No payment now. We confirm availability and send a day-by-day plan on WhatsApp."}
          </p>
        </div>
      </aside>

      {/* Phones and tablets: always-visible booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-night/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-cream backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-cream/70">From · {tour.days} days</p>
            <p className="font-serif text-xl leading-tight whitespace-nowrap text-apricot tabular-nums sm:text-2xl">{price}</p>
          </div>
          <CtaButton
            href={link}
            {...external}
            icon={checkout ? undefined : <MessageCircle className="h-4 w-4" aria-hidden />}
            arrow={!!checkout}
            className="shrink-0"
            aria-label={checkout ? "Reserve seats" : "Book on WhatsApp"}
          >
            {/* Short label on narrow phones so the price keeps its room */}
            <span className="min-[400px]:hidden">{checkout ? "Reserve" : "Book"}</span>
            <span className="hidden min-[400px]:inline">{checkout ? "Reserve seats" : "Book on WhatsApp"}</span>
          </CtaButton>
        </div>
      </div>
    </>
  );
}
