"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, MessageCircle } from "lucide-react";
import { CurrencyToggle } from "@/components/ui/currency-toggle";
import { CtaButton } from "@/components/ui/cta-button";
import { formatDate, formatPrice, whatsappLink, type Tour } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { useDepartures, useTourPrice } from "@/lib/live-data";

function TourRow({ tour }: { tour: Tour }) {
  const { currency } = useCurrency();
  const price = formatPrice(useTourPrice(tour.slug), currency);
  const next = useDepartures(tour.slug).find((d) => d.seatsLeft > 0);
  return (
    <li>
      <Link href={`/tours/${tour.slug}/`} className="group block py-5">
        <span className="flex items-start justify-between gap-4">
          <span className="font-serif text-2xl leading-tight text-ink group-hover:text-pine">{tour.name}</span>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-apricot transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
        <span className="mt-1 block text-sm text-mist">
          {tour.days} days · from <span className="font-medium whitespace-nowrap text-pine tabular-nums">{price}</span>
        </span>
        <span className="mt-2 flex items-center gap-2 text-sm text-ink">
          <CalendarDays className="h-4 w-4 shrink-0 text-pine" aria-hidden />
          {next ? (
            <>
              Next departure {formatDate(next.date)} · {next.seatsLeft} seats left
            </>
          ) : (
            "No group departure scheduled"
          )}
        </span>
      </Link>
    </li>
  );
}

/**
 * Desktop only: a sticky card beside the destination page's content with its tours (live price and next
 * departure) and a WhatsApp button. Phones keep the single-column page, where the same tours are listed
 * in the "Tours that visit" section.
 */
export function DestinationSidebar({ title, tours }: { title: string; tours: Tour[] }) {
  return (
    <aside aria-label={`Tours to ${title}`} className="hidden lg:relative lg:block">
      <div className="rounded-3xl border border-line bg-white/80 p-7 shadow-xl shadow-night/5 lg:sticky lg:top-28">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs tracking-[0.2em] text-mist uppercase">Tours to {title}</p>
          <CurrencyToggle tone="light" />
        </div>
        <ul className="mt-2 divide-y divide-line">
          {tours.map((t) => (
            <TourRow key={t.slug} tour={t} />
          ))}
        </ul>
        <CtaButton
          href={whatsappLink(`Assalam o Alaikum, I'd like to plan a trip to ${title}.`)}
          target="_blank"
          rel="noopener noreferrer"
          icon={<MessageCircle className="h-4 w-4" aria-hidden />}
          className="mt-4 w-full"
        >
          Ask on WhatsApp
        </CtaButton>
        <p className="mt-4 text-xs leading-relaxed text-mist">Private and family departures available on any date.</p>
      </div>
    </aside>
  );
}
