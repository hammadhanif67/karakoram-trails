import { NumberTicker } from "@/components/magicui/number-ticker";
import { Reveal } from "@/components/ui/reveal";
import { whyUs } from "@/lib/content";
import { WhyUsPhoto, WhyUsStatement } from "./why-us-client";

// Server component; the Text Reveal statement, the parallax photo and the number tickers are client parts.
export function WhyUs() {
  return (
    <section id="why-us" className="bg-cream">
      <WhyUsStatement />

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-5 pt-8 pb-24 sm:px-8 sm:pb-32 lg:grid-cols-[6fr_5fr] lg:gap-20">
        <WhyUsPhoto />

        <div className="flex flex-col justify-center">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.25em] text-apricot-deep uppercase">Why travel with us</p>
          </Reveal>
          <ol className="mt-8 space-y-10">
            {whyUs.points.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.1} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-t border-line pt-8">
                  <span className="font-serif text-5xl leading-none text-apricot-deep italic" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-3xl leading-tight font-medium text-ink">{p.title}</h3>
                    <p className="mt-3 leading-relaxed text-mist">{p.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Stats in large type on a dark band, counted up with Magic UI Number Ticker */}
      <div className="bg-night text-cream">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 px-5 pb-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-x-0 lg:pb-0">
          {whyUs.stats.map((s, i) => (
            <div key={s.label} className="border-cream/10 py-10 not-first:border-t sm:nth-2:border-t-0 lg:not-first:border-t-0 lg:px-8 lg:py-16 lg:not-first:border-l lg:first:pl-0">
              <dt className="text-xs tracking-[0.25em] text-cream/60 uppercase">{s.label}</dt>
              <dd className="mt-4 flex items-baseline font-serif text-7xl leading-none font-medium tabular-nums lg:text-6xl xl:text-7xl">
                <NumberTicker
                  value={s.value}
                  startValue={s.start}
                  delay={0.15 * i}
                  className="tracking-normal text-cream"
                />
                {s.suffix && <span className="ml-2 text-4xl text-apricot lg:text-4xl xl:text-5xl">{s.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
