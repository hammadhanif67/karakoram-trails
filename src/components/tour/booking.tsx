"use client";

import { useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { CurrencyToggle } from "@/components/ui/currency-toggle";
import { CtaButton } from "@/components/ui/cta-button";
import { departures as allDepartures, formatDate, formatPrice, whatsappLink, type Tour } from "@/lib/content";
import { useCurrency } from "@/lib/currency";

export function TourPrice({ pkr, prefix = "", className }: { pkr: number; prefix?: string; className?: string }) {
  const { currency } = useCurrency();
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {formatPrice(pkr, currency)}
    </span>
  );
}

type Departure = (typeof allDepartures)[number];

const FLEXIBLE = "flexible";

/**
 * Booking panel: a sticky card beside the itinerary on desktop (inline at the end on phones),
 * plus a fixed "Book on WhatsApp" bar at the bottom of the screen on phones and tablets.
 */
export function TourBooking({ tour, departures }: { tour: Tour; departures: Departure[] }) {
  const { currency } = useCurrency();
  const [date, setDate] = useState(departures[0]?.date ?? FLEXIBLE);

  const when = date === FLEXIBLE ? "on my own dates" : `departing ${formatDate(date)}`;
  const link = whatsappLink(`Assalam o Alaikum, I'd like to book ${tour.name} (${tour.days} days) ${when}.`);
  const price = formatPrice(tour.pricePKR, currency);

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
              <option key={d.date} value={d.date}>
                {formatDate(d.date)} · {d.seatsLeft} seats left
              </option>
            ))}
            <option value={FLEXIBLE}>Private trip, my own dates</option>
          </select>

          <CtaButton
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            shine
            icon={<MessageCircle className="h-4 w-4" aria-hidden />}
            className="mt-6 w-full"
          >
            Book on WhatsApp
          </CtaButton>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mist">
            <ShieldCheck className="h-4 w-4 shrink-0 text-pine" aria-hidden />
            No payment now. We confirm availability and send a day-by-day plan on WhatsApp.
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
            target="_blank"
            rel="noopener noreferrer"
            icon={<MessageCircle className="h-4 w-4" aria-hidden />}
            className="shrink-0"
            aria-label="Book on WhatsApp"
          >
            {/* Short label on narrow phones so the price keeps its room */}
            <span className="min-[400px]:hidden">Book</span>
            <span className="hidden min-[400px]:inline">Book on WhatsApp</span>
          </CtaButton>
        </div>
      </div>
    </>
  );
}
