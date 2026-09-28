import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Clock, Gauge, Info, MapPin, Mountain, Sun, Users, X } from "lucide-react";
import { DepartureList } from "@/components/sections/departures";
import { FaqList } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { Itinerary } from "@/components/tour/itinerary";
import { TourBooking } from "@/components/tour/booking";
import { TourPrice } from "@/components/ui/tour-price";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { faqs, getTour, goodToKnow, tours } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

// Only the tours listed in content.ts exist; anything else is a 404 in the static export.
export const dynamicParams = false;

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) return {};
  return pageMetadata({
    title: `${tour.name}: ${tour.days}-day tour | Karakoram Trails`,
    description: tour.overview,
    path: `/tours/${tour.slug}/`,
    image: tour.image,
    imageAlt: tour.alt,
  });
}

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <p className="text-xs font-medium tracking-[0.25em] text-apricot-deep uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl leading-tight font-medium text-ink sm:text-5xl">{children}</h2>
    </Reveal>
  );
}

export default async function TourPage({ params }: PageProps<"/tours/[slug]">) {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) notFound();

  const facts = [
    { icon: Clock, label: "Duration", value: `${tour.days} days / ${tour.nights} nights` },
    { icon: Gauge, label: "Difficulty", value: tour.difficultyNote ? `${tour.difficulty} (${tour.difficultyNote})` : tour.difficulty },
    { icon: Mountain, label: "Max altitude", value: tour.maxAltitude },
    { icon: Users, label: "Group size", value: tour.groupSize },
    { icon: Sun, label: "Best season", value: tour.season },
    { icon: MapPin, label: "Start / end", value: tour.startEnd },
  ];
  const others = tours.filter((t) => t.slug !== tour.slug);
  // Route stops, split in half for the two-line route on phones.
  const stops = tour.route.split(" · ");
  const half = Math.ceil(stops.length / 2);

  return (
    <>
      <Navbar />
      <main className="pb-24 lg:pb-0">
        {/* Hero */}
        <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-night text-cream">
          <Photo name={tour.image} alt={tour.alt} priority className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/45 to-night/30" />
          <div className="mx-auto w-full max-w-7xl px-5 pt-32 pb-14 sm:px-8 sm:pb-20">
            <Link href="/#tours" className="inline-flex items-center gap-2 text-sm text-cream/80 hover:text-apricot">
              <ArrowLeft className="h-4 w-4" aria-hidden /> All tours
            </Link>
            <h1 className="mt-6 font-serif text-6xl leading-[0.92] font-medium sm:text-7xl lg:text-8xl">{tour.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/85">{tour.tagline}</p>
            {/* Phones: always two lines, split between stops. Left to wrap on its own, the route took two lines in
                the fallback font but one in Montserrat on some phones, so the font swap moved the hero text. */}
            <p className="mt-3 text-xs tracking-[0.2em] text-cream/70 uppercase">
              {stops.slice(0, half).join(" · ")} ·<br className="sm:hidden" /> {stops.slice(half).join(" · ")}
            </p>
            <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm text-cream/70">From</span>
              <TourPrice slug={tour.slug} className="font-serif text-4xl whitespace-nowrap text-apricot sm:text-5xl" />
              <span className="text-sm text-cream/70">per person</span>
            </div>
          </div>
        </section>

        {/* Quick facts */}
        <section aria-label="Quick facts" className="border-b border-line bg-[#efe8da]">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-6 px-5 py-8 sm:px-8 md:grid-cols-3 xl:grid-cols-6">
            {facts.map((f) => (
              <div key={f.label} className="relative pl-8">
                <dt className="text-xs tracking-[0.15em] text-mist uppercase">
                  <f.icon className="absolute top-0.5 left-0 h-5 w-5 text-pine" aria-hidden />
                  {f.label}
                </dt>
                <dd className="mt-1 font-medium text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-16 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-24">
            {/* Highlights */}
            <section aria-labelledby="highlights">
              <SectionTitle eyebrow="Highlights">
                <span id="highlights">Why you&apos;ll love it</span>
              </SectionTitle>
              <Reveal>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink">{tour.overview}</p>
              </Reveal>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex gap-3 rounded-2xl border border-line bg-white/60 p-5 text-ink">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-apricot" aria-hidden /> {h}
                  </li>
                ))}
              </ul>
            </section>

            {/* Itinerary */}
            <section aria-labelledby="itinerary">
              <SectionTitle eyebrow="Day by day">
                <span id="itinerary">The itinerary</span>
              </SectionTitle>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
                All drive and hike times are approximate. Roads in Gilgit-Baltistan change with weather, roadworks and
                landslides.
              </p>
              <Itinerary days={tour.itinerary} />
            </section>

            {/* Included / not included */}
            <section aria-labelledby="included">
              <SectionTitle eyebrow="The details">
                <span id="included">What&apos;s included</span>
              </SectionTitle>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <Reveal className="rounded-3xl border border-line bg-white/60 p-7">
                  <h3 className="font-serif text-2xl text-pine">Included</h3>
                  <ul className="mt-5 space-y-3">
                    {tour.included.map((x) => (
                      <li key={x} className="flex gap-3 text-ink">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-pine" aria-hidden />
                        {x}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={0.1} className="rounded-3xl border border-line p-7">
                  <h3 className="font-serif text-2xl text-mist">Not included</h3>
                  <ul className="mt-5 space-y-3">
                    {tour.excluded.map((x) => (
                      <li key={x} className="flex gap-3 text-mist">
                        <X className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                        {x}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>

            {/* Route/season notes and the shared "good to know" list */}
            <section aria-labelledby="good-to-know">
              <SectionTitle eyebrow="Before you book">
                <span id="good-to-know">Good to know</span>
              </SectionTitle>
              <Reveal className="mt-8 rounded-3xl border border-line bg-white/60 p-7">
                <ul className="space-y-4">
                  {[...tour.notes, ...goodToKnow].map((x) => (
                    <li key={x} className="flex gap-3 leading-relaxed text-ink">
                      <Info className="mt-1 h-5 w-5 shrink-0 text-apricot" aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </section>

            {/* Departures (live from D1; the list shows its own empty state) */}
            <section aria-labelledby="dates">
              <SectionTitle eyebrow="Upcoming departures">
                <span id="dates">Join a group</span>
              </SectionTitle>
              <div className="mt-8">
                <DepartureList tourSlug={tour.slug} tone="light" />
              </div>
            </section>

            {/* FAQ */}
            <section aria-labelledby="tour-faq">
              <SectionTitle eyebrow="FAQ">
                <span id="tour-faq">Before you go</span>
              </SectionTitle>
              <div className="mt-8">
                <FaqList items={faqs.filter((f) => f.tour)} />
              </div>
            </section>
          </div>

          <TourBooking tour={tour} />
        </div>

        {/* Other tours */}
        <section aria-labelledby="other-tours" className="border-t border-line bg-[#efe8da] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionTitle eyebrow="Keep exploring">
              <span id="other-tours">Other tours</span>
            </SectionTitle>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {others.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tours/${t.slug}/`}
                  className="group flex items-center justify-between gap-6 rounded-3xl border border-line bg-cream p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-night/10"
                >
                  <div>
                    <p className="font-serif text-3xl text-ink group-hover:text-pine">{t.name}</p>
                    <p className="mt-2 text-sm text-mist">
                      {t.days} days · {t.route}
                    </p>
                    <TourPrice slug={t.slug} prefix="From " className="mt-3 block font-medium text-pine" />
                  </div>
                  <ArrowUpRight className="h-6 w-6 shrink-0 text-apricot transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
