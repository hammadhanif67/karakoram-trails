"use client";

import { CalendarDays, Users } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaButton } from "@/components/ui/cta-button";
import { formatDate, formatPrice, getTour, whatsappLink } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { useDepartures, useLiveData } from "@/lib/live-data";
import { cn } from "@/lib/utils";

/** Departure rows; pass `tourSlug` to show one tour's dates (tour pages). */
export function DepartureList({ tourSlug, tone = "dark" }: { tourSlug?: string; tone?: "dark" | "light" }) {
  const { currency } = useCurrency();
  const { prices, status } = useLiveData();
  const rows = useDepartures(tourSlug);
  const dark = tone === "dark";

  if (rows.length === 0) {
    return (
      <p className={cn("border-y py-8", dark ? "border-cream/10 text-cream/80" : "border-line text-mist")}>
        No scheduled departures right now.{" "}
        <a href={whatsappLink("Assalam o Alaikum, I'd like to ask about a private trip.")} target="_blank" rel="noopener noreferrer" className="underline decoration-apricot underline-offset-4 hover:text-apricot">
          Ask us for a private date on WhatsApp
        </a>
        .
      </p>
    );
  }

  return (
    <ul className={cn("divide-y border-y", dark ? "divide-cream/10 border-cream/10" : "divide-line border-line")}>
      {rows.map((d, i) => {
        const tour = getTour(d.tour)!;
        const date = formatDate(d.date);
        const full = d.seatsLeft <= 0;
        const low = !full && d.seatsLeft <= 4;
        // Within the online cutoff (72 h) or full: no online booking, talk to us instead.
        // Online checkout when the live API is up and this departure can be booked; otherwise WhatsApp.
        const online = status === "live" && d.id !== null && d.bookable && !full;
        const cta = full
          ? { label: "Join the waitlist", href: whatsappLink(`Assalam o Alaikum, ${tour.name} on ${date} is full. Please add me to the waitlist.`) }
          : online
            ? { label: "Book seats", href: `/checkout/?departure=${d.id}` }
            : d.bookable
              ? { label: "Book seats", href: whatsappLink(`Assalam o Alaikum, I'd like to book ${tour.name} departing ${date}.`) }
              : { label: "Contact us on WhatsApp", href: whatsappLink(`Assalam o Alaikum, is there still space on ${tour.name} departing ${date}?`) };
        const taken = ((d.seats - d.seatsLeft) / d.seats) * 100;
        return (
          <li key={d.id ?? `${d.tour}-${d.date}`}>
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
                    {tour.days} days · from {formatPrice(prices[tour.slug], currency)}
                  </p>
                </div>

                <div>
                  <p className={cn("flex items-center gap-2 text-sm", low ? "text-apricot" : dark ? "text-cream/80" : "text-ink")}>
                    <Users className="h-4 w-4" aria-hidden />
                    {full ? "Fully booked" : d.seatsLeft === d.seats ? "All seats open" : `${d.seatsLeft} of ${d.seats} seats left`}
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
                  href={cta.href}
                  {...(online ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  variant={low && d.bookable ? "primary" : "outline"}
                  tone={tone}
                  className="w-full sm:w-auto"
                  aria-label={`${cta.label}: ${tour.name} on ${date}${online ? "" : " (opens WhatsApp)"}`}
                >
                  {cta.label}
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
