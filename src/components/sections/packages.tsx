"use client";

import { Check, Clock, Route } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { CurrencyToggle } from "@/components/ui/currency-toggle";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaButton } from "@/components/ui/cta-button";
import { formatPrice, tours } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function Packages() {
  const { currency } = useCurrency();

  return (
    <section id="tours" className="relative overflow-hidden bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Tour packages"
            title={
              <>
                Journeys planned <em className="text-pine">down to the last chai stop</em>
              </>
            }
            intro="Transport from Islamabad, stays, breakfast and dinner, a local guide and all permits in one price."
          />
          <Reveal delay={0.1} className="flex items-center gap-3">
            <span className="text-xs tracking-[0.2em] text-mist uppercase">Prices in</span>
            <CurrencyToggle tone="light" />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tours.map((t, i) => {
            const href = `/tours/${t.slug}/`;
            return (
              <Reveal key={t.slug} delay={i * 0.1} className="h-full">
                <article
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/70 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-night/10",
                    t.featured ? "border-apricot/60" : "border-line",
                  )}
                >
                  {t.featured && <ShineBorder borderWidth={1.5} duration={10} shineColor={["#d08a3c", "#f6f1e7", "#d08a3c"]} />}
                  <a href={href} className="relative block aspect-[16/10] overflow-hidden" tabIndex={-1} aria-hidden>
                    <Photo
                      name={t.image}
                      alt={`${t.name} tour: ${t.alt}`}
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {t.featured && (
                      <span className="absolute top-4 left-4 rounded-full bg-apricot px-3 py-1 text-xs font-medium text-apricot-ink">
                        Most booked
                      </span>
                    )}
                  </a>

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <h3 className="font-serif text-3xl font-semibold text-ink">
                      <a href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                        {t.name}
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-mist">{t.tagline}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mist">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-pine" aria-hidden /> {t.days} days
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Route className="h-4 w-4 text-pine" aria-hidden /> {t.route}
                      </span>
                    </div>

                    <ul className="mt-5 flex-1 space-y-2.5 text-sm text-ink">
                      {t.highlights.slice(0, 3).map((h) => (
                        <li key={h} className="flex gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-apricot" aria-hidden />
                          {h}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
                      <div>
                        <p className="text-xs text-mist">From, per person</p>
                        <p className="font-serif text-3xl font-medium whitespace-nowrap text-ink tabular-nums">{formatPrice(t.pricePKR, currency)}</p>
                      </div>
                      <CtaButton
                        href={href}
                        variant={t.featured ? "solid" : "outline"}
                        tone="light"
                        arrow
                        className="relative z-10 shrink-0"
                        aria-label={`View itinerary for ${t.name}`}
                      >
                        Itinerary
                      </CtaButton>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-mist">
          {currency === "USD" ? "US dollar prices are approximate. " : ""}Private and family departures available on any date.
        </p>
      </div>
    </section>
  );
}
