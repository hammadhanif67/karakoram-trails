import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { SeasonLegend, SeasonStrip } from "@/components/ui/season-strip";
import { destinations, months, seasonNotes } from "@/lib/content";

/** Month-by-month chart for the three destinations, plus one line per season. */
export function WhenToGo() {
  return (
    <section id="when-to-go" className="bg-[#efe8da] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="When to go"
          title={
            <>
              Pick your month, <em className="text-pine">then your valley</em>
            </>
          }
          intro="Seasons in the north are short and roads depend on snow. Dates below are approximate and change from year to year."
        />

        <Reveal className="mt-12 rounded-3xl border border-line bg-cream p-5 sm:p-8">
          {/* Month header, aligned with the strips (wider screens only; phones get initials under each strip) */}
          <div aria-hidden className="hidden grid-cols-[11rem_minmax(0,1fr)] gap-6 pb-3 sm:grid">
            <span />
            <div className="grid grid-cols-12 gap-1 text-center text-xs text-mist">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-line">
            {destinations.map((d) => (
              <li key={d.slug} className="grid gap-3 py-5 first:pt-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                <div>
                  <p className="font-serif text-2xl leading-tight text-ink">{d.title}</p>
                  <p className="mt-0.5 text-xs text-mist">Best {d.best}</p>
                </div>
                <SeasonStrip codes={d.season} label={`${d.title}: season by month`} className="[&_li>span:first-child]:h-4 sm:[&_li>span:nth-child(2)]:hidden" />
              </li>
            ))}
          </ul>
          <SeasonLegend className="mt-4 border-t border-line pt-5" />
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {seasonNotes.map((s, i) => (
            <li key={s.name}>
              <Reveal delay={i * 0.08} className="h-full rounded-2xl border border-line bg-cream/60 p-6">
                <p className="font-serif text-2xl text-pine">{s.name}</p>
                <p className="mt-1 text-xs tracking-[0.15em] text-apricot-deep uppercase">{s.when}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
