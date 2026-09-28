import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { brand, faqs, whatsappLink } from "@/lib/content";

type Faq = (typeof faqs)[number];

/**
 * FAQ list on native <details>/<summary>: opens and closes without JavaScript, works with the keyboard and
 * screen readers, and `name` keeps one answer open at a time (older browsers may open several).
 */
export function FaqList({ items = faqs }: { items?: Faq[] }) {
  return (
    <div className="border-t border-line">
      {items.map((f) => (
        <details key={f.q} name="faq" className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md py-6 text-left font-serif text-xl leading-snug font-medium text-ink outline-none hover:text-pine focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-2xl [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown aria-hidden className="mt-1 size-5 shrink-0 text-apricot transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="max-w-3xl pb-6 text-base leading-relaxed text-mist">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section id="faq" className="bg-sand py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-5 sm:px-8 lg:grid-cols-[4fr_7fr] lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title={
              <>
                Good questions, <em className="text-pine">straight answers</em>
              </>
            }
          />
          <Reveal delay={0.1}>
            <p className="mt-6 leading-relaxed text-mist">
              Something else on your mind?{" "}
              <a
                href={whatsappLink("Assalam o Alaikum, I have a question about your tours.")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-pine underline decoration-apricot underline-offset-4 hover:text-apricot"
              >
                Ask us on WhatsApp
              </a>{" "}
              or call {brand.phoneDisplay}.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.05}>
          <FaqList />
        </Reveal>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
