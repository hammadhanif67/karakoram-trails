"use client";

import { CalendarDays, Users } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaButton } from "@/components/ui/cta-button";
import { departures, formatDate, formatPrice, getTour, whatsappLink } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

/** Departure rows; pass `tourSlug` to show one tour's dates (tour pages). */
export function DepartureList({ tourSlug, tone = "dark" }: { tourSlug?: string; tone?: "dark" | "light" }) {
  const { currency } = useCurrency();
  const rows = departures.filter((d) => !tourSlug || d.tour === tourSlug);
  const dark = tone === "dark";

  return (
    <ul className={cn("divide-y border-y", dark ? "divide-cream/10 border-cream/10" : "divide-line border-line")}>
      {rows.map((d, i) => {
        const tour = getTour(d.tour)!;
        const date = formatDate(d.date);
        const low = d.seatsLeft <= 4;
        const taken = ((d.seats - d.seatsLeft) / d.seats) * 100;
        return (
          <li key={`${d.tour}-${d.date}`}>
            <BlurFade inView direction="up" offset={10} delay={i * 0.05}>
              <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-4 py-6 sm:grid-cols-[10rem_minmax(0,1fr)_12rem_auto] sm:gap-8">
                <div className="flex items-center gap-3 sm:block">
                  <CalendarDays className={cn("h-5 w-5 sm:hidden", dark ? "text-apricot" : "text-pine")} aria-hidden />
                  <p className="font-serif text-2xl sm:text-3xl">{date}</p>
                </div>

                <div>
                  {!tourSlug && (
                    <a href={`/tours/${tour.slug}/`} className="font-serif text-2xl hover:text-apricot">
                      {tour.name}
                    </a>
                  )}
                  <p className={cn("text-sm", dark ? "text-cream/70" : "text-mist")}>
                    {tour.days} days · from {formatPrice(tour.pricePKR, currency)}
                  </p>
                </div>

                <div>
                  <p className={cn("flex items-center gap-2 text-sm", low ? "text-apricot" : dark ? "text-cream/80" : "text-ink")}>
                    <Users className="h-4 w-4" aria-hidden />
                    {d.seatsLeft === d.seats ? "All seats open" : `${d.seatsLeft} of ${d.seats} seats left`}
                  </p>
                  <div
                    className={cn("mt-2 h-1.5 overflow-hidden rounded-full", dark ? "bg-cream/10" : "bg-line")}
                    role="meter"
                    aria-label={`${d.seats - d.seatsLeft} of ${d.seats} seats booked`}
                    aria-valuemin={0}
                    aria-valuemax={d.seats}
                    aria-valuenow={d.seats - d.seatsLeft}
                  >
                    <div className={cn("h-full rounded-full", low ? "bg-apricot" : dark ? "bg-cream/50" : "bg-pine")} style={{ width: `${taken}%` }} />
                  </div>
                </div>

                <CtaButton
                  href={whatsappLink(`Assalam o Alaikum, I'd like to book ${tour.name} departing ${date}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant={low ? "primary" : "outline"}
                  tone={tone}
                  className="w-full sm:w-auto"
                  aria-label={`Book ${tour.name} on ${date} via WhatsApp`}
                >
                  Book seats
                </CtaButton>
              </div>
            </BlurFade>
          </li>
        );
      })}
    </ul>
  );
}

export function Departures() {
  return (
    <section id="departures" className="bg-night py-24 text-cream sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          tone="dark"
          eyebrow="Upcoming departures"
          title={
            <>
              Fixed dates, <em className="text-apricot">small groups</em>
            </>
          }
          intro="Join a scheduled group departure, or ask us for a private trip on your own dates."
        />
        <div className="mt-12">
          <DepartureList />
        </div>
      </div>
    </section>
  );
}
