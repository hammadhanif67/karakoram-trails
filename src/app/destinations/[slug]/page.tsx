import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Calendar, Car, Check, Info, MapPin, MessageCircle, Mountain } from "lucide-react";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { CtaButton } from "@/components/ui/cta-button";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { SeasonLegend, SeasonStrip } from "@/components/ui/season-strip";
import { SectionTitle } from "@/components/ui/section-title";
import { TourPrice } from "@/components/ui/tour-price";
import { destinations, getDestination, getTour, goodToKnow, passWindow, tours, whatsappLink } from "@/lib/content";
import { photoSubject } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

// Only the destinations listed in content.ts exist; anything else is a 404 in the static export.
export const dynamicParams = false;

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) return {};
  return pageMetadata({
    title: `${d.title}: when to go, travel times and tours | Karakoram Trails`,
    description: d.blurb,
    path: `/destinations/${d.slug}/`,
    image: d.image,
    imageAlt: d.alt,
  });
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) notFound();

  const facts = [
    { icon: MapPin, label: "Region", value: d.region },
    { icon: Mountain, label: "Altitude", value: d.altitude, note: d.altitudeNote },
    { icon: Calendar, label: "Best time", value: d.best },
    { icon: Car, label: "Getting there", value: d.gettingThere },
  ];
  const visiting = tours.filter((t) => t.destinations.includes(d.slug));
  // Travel-times rows are itinerary days, read straight from the tours (content.ts checks they exist).
  const legs = d.travel.map(({ tour, day }) => ({ tour: getTour(tour)!, day, leg: getTour(tour)!.itinerary[day - 1] }));
  const others = destinations.filter((x) => x.slug !== d.slug);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero: the same photo as the destination's panel on the home page */}
        <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-night text-cream">
          <Photo name={d.image} alt={d.alt} priority className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div aria-hidden className="destination-scrim absolute inset-0 -z-10" />
          <div className="mx-auto w-full max-w-7xl px-5 pt-32 pb-14 sm:px-8 sm:pb-20">
            <Link href="/#destinations" className="inline-flex items-center gap-2 text-sm text-cream/80 hover:text-apricot">
              <ArrowLeft className="h-4 w-4" aria-hidden /> All destinations
            </Link>
            <p className="mt-6 text-xs tracking-[0.25em] text-apricot-bright uppercase">{d.region}</p>
            <h1 className="mt-3 font-serif text-6xl leading-[0.92] font-medium sm:text-7xl lg:text-8xl">{d.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/85">{d.blurb}</p>
          </div>
        </section>

        {/* Quick facts */}
        <section aria-label="Quick facts" className="border-b border-line bg-[#efe8da]">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-6 px-5 py-8 sm:px-8 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="relative pl-8">
                <dt className="text-xs tracking-[0.15em] text-mist uppercase">
                  <f.icon className="absolute top-0.5 left-0 h-5 w-5 text-pine" aria-hidden />
                  {f.label}
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  {f.value}
                  {f.note && <span className="block text-sm font-normal text-mist">{f.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mx-auto max-w-7xl space-y-24 px-5 py-20 sm:px-8 sm:py-24">
          {/* Overview */}
          <section aria-labelledby="overview">
            <SectionTitle eyebrow="Overview">
              <span id="overview">About {d.title}</span>
            </SectionTitle>
            <Reveal className="mt-6 max-w-3xl space-y-5 text-lg leading-relaxed text-ink">
              {d.intro.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </Reveal>
          </section>

          {/* Highlights and photos */}
          <section aria-labelledby="highlights">
            <SectionTitle eyebrow="Highlights">
              <span id="highlights">What to see</span>
            </SectionTitle>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {d.highlights.map((h) => (
                <li key={h} className="flex gap-3 rounded-2xl border border-line bg-white/60 p-5 text-ink">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-apricot" aria-hidden /> {h}
                </li>
              ))}
            </ul>
            <ul className={cn("mt-10 grid gap-6 sm:grid-cols-2", d.photos.length % 3 === 0 && "lg:grid-cols-3")}>
              {d.photos.map((p) => (
                <li key={p.image}>
                  <figure>
                    <Photo
                      name={p.image}
                      alt={p.alt}
                      sizes={d.photos.length % 3 === 0 ? "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" : "(min-width: 1280px) 600px, (min-width: 640px) 50vw, 100vw"}
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                    />
                    <figcaption className="mt-3 text-sm text-mist">{photoSubject(p.image)}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>

          {/* When to go */}
          <section aria-labelledby="when-to-go">
            <SectionTitle eyebrow="When to go">
              <span id="when-to-go">Seasons</span>
            </SectionTitle>
            <Reveal className="mt-8 max-w-3xl rounded-3xl border border-line bg-white/60 p-7">
              <SeasonStrip codes={d.season} label={`${d.title}: season by month`} />
              <SeasonLegend className="mt-5" />
              <p className="mt-6 leading-relaxed text-ink">
                <span className="font-medium">Best time:</span> {d.bestDetail}.
              </p>
              <ul className="mt-3 space-y-2 text-ink">
                {d.passes.map((name) => {
                  const w = passWindow(name);
                  return (
                    <li key={name} className="leading-relaxed">
                      <span className="font-medium">{w.name}:</span> open roughly {w.open}.
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </section>

          {/* Getting there */}
          <section aria-labelledby="travel-times">
            <SectionTitle eyebrow="Getting there">
              <span id="travel-times">Travel times</span>
            </SectionTitle>
            <Reveal>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink">{d.gettingThereDetail}</p>
            </Reveal>
            <div className="mt-8 max-w-3xl overflow-hidden rounded-3xl border border-line bg-white/60">
              <table className="w-full text-left">
                <caption className="sr-only">Travel times on our itineraries through {d.title}</caption>
                <thead className="border-b border-line text-xs tracking-[0.15em] text-mist uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium sm:px-7">
                      Leg
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium sm:px-7">
                      Approx. time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {legs.map(({ tour, day, leg }) => (
                    <tr key={`${tour.slug}-${day}`} className="align-top">
                      <th scope="row" className="px-5 py-4 font-normal sm:px-7">
                        <span className="block font-medium text-ink">{leg.title}</span>
                        <span className="mt-1 block text-sm text-mist">
                          {leg.stay && <>Night in {leg.stay} · </>}
                          <Link href={`/tours/${tour.slug}/`} className="underline-offset-4 hover:text-pine hover:underline">
                            {tour.name}, day {day}
                          </Link>
                        </span>
                      </th>
                      <td className="px-5 py-4 text-ink sm:px-7">{leg.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mist">
              All drive and hike times are approximate. Roads in Gilgit-Baltistan change with weather, roadworks and
              landslides.
            </p>
          </section>

          {/* Tours that stay here */}
          <section aria-labelledby="tours">
            <SectionTitle eyebrow="Tours">
              <span id="tours">Tours that visit {d.title}</span>
            </SectionTitle>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {visiting.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tours/${t.slug}/`}
                  className="group flex items-center justify-between gap-6 rounded-3xl border border-line bg-white/60 p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-night/10"
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
          </section>

          {/* Good to know */}
          <section aria-labelledby="good-to-know">
            <SectionTitle eyebrow="Before you go">
              <span id="good-to-know">Good to know</span>
            </SectionTitle>
            <Reveal className="mt-8 max-w-3xl rounded-3xl border border-line bg-white/60 p-7">
              <ul className="space-y-4">
                {goodToKnow.map((x) => (
                  <li key={x} className="flex gap-3 leading-relaxed text-ink">
                    <Info className="mt-1 h-5 w-5 shrink-0 text-apricot" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>
        </div>

        {/* Plan a trip */}
        <section className="bg-night py-20 text-cream sm:py-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-[0.25em] text-apricot-bright uppercase">Plan a trip</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight font-medium sm:text-5xl">Questions about {d.title}?</h2>
              <p className="mt-4 text-lg leading-relaxed text-cream/85">
                Ask us on WhatsApp about dates, the route or a private trip.
              </p>
            </div>
            <CtaButton
              href={whatsappLink(`Assalam o Alaikum, I'd like to plan a trip to ${d.title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              icon={<MessageCircle className="h-4 w-4" aria-hidden />}
              className="self-start lg:self-auto"
            >
              Ask on WhatsApp
            </CtaButton>
          </div>
        </section>

        {/* Other destinations */}
        <section aria-labelledby="other-destinations" className="bg-[#efe8da] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionTitle eyebrow="Keep exploring">
              <span id="other-destinations">Other destinations</span>
            </SectionTitle>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {others.map((x) => (
                <Link
                  key={x.slug}
                  href={`/destinations/${x.slug}/`}
                  className="group flex items-center justify-between gap-6 rounded-3xl border border-line bg-cream p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-night/10"
                >
                  <div>
                    <p className="font-serif text-3xl text-ink group-hover:text-pine">{x.title}</p>
                    <p className="mt-2 text-sm text-mist">{x.blurb}</p>
                    <p className="mt-3 text-sm font-medium text-pine">Best {x.best}</p>
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
