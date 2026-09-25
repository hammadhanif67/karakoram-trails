import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { brand, faqs, whatsappLink } from "@/lib/content";

type Faq = (typeof faqs)[number];

/** FAQ list on shadcn Accordion, styled for the site. */
export function FaqList({ items = faqs }: { items?: Faq[] }) {
  return (
    <Accordion type="single" collapsible className="border-t border-line">
      {items.map((f, i) => (
        <AccordionItem key={f.q} value={`q${i}`} className="border-line">
          <AccordionTrigger className="cursor-pointer py-6 font-serif text-xl leading-snug font-medium text-ink hover:text-pine hover:no-underline sm:text-2xl [&>svg]:size-5 [&>svg]:text-apricot">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="max-w-3xl pb-6 text-base leading-relaxed text-mist">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section id="faq" className="bg-[#efe8da] py-24 sm:py-32">
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
