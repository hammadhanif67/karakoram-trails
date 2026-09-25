import { Check, Clock, Route } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SkewButton } from "@/components/ui/skew-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { packages } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Packages() {
  return (
    <section id="tours" className="relative overflow-hidden bg-night py-24 text-cream sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-pine/40 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          tone="dark"
          align="center"
          eyebrow="Tour packages"
          title={
            <>
              Journeys planned <em className="text-apricot">down to the last chai stop</em>
            </>
          }
          intro="Every package includes transport from Islamabad, stays, breakfast and dinner, a local guide and all permits."
        />

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {packages.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.12} className="h-full">
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8",
                  p.featured
                    ? "border-apricot bg-cream text-ink shadow-2xl shadow-apricot/10 lg:-mt-4 lg:mb-4"
                    : "border-cream/15 bg-pine-deep/60",
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-8 rounded-full bg-apricot px-4 py-1 text-xs font-medium text-apricot-ink">
                    Most booked
                  </span>
                )}
                <h3 className="font-serif text-3xl font-semibold">{p.name}</h3>
                <div className={cn("mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm", p.featured ? "text-mist" : "text-cream/75")}>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden /> {p.days} days
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Route className="h-4 w-4" aria-hidden /> {p.route}
                  </span>
                </div>

                <p className="mt-7 font-serif text-5xl font-medium">{p.price}</p>
                <p className={cn("mt-1 text-xs", p.featured ? "text-mist" : "text-cream/70")}>{p.note}</p>

                <ul className="mt-7 flex-1 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.featured ? "text-pine" : "text-apricot")} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>

                <SkewButton
                  href="#contact"
                  variant={p.featured ? "solid" : "outline"}
                  tone={p.featured ? "light" : "dark"}
                  shine={p.featured}
                  className="mx-1.5 mt-8"
                >
                  Book {p.name}
                </SkewButton>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-cream/70">
            Private and family departures available on any date. Prices are indicative and depend on season and group size.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
