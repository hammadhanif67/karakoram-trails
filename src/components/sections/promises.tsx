import { Clock, MessageCircle, Users, Wallet } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { promises } from "@/lib/content";

const icons = [Clock, Users, Wallet, MessageCircle];

/** Shown in place of testimonials until there are real reviews (features.showTestimonials). */
export function Promises() {
  return (
    <section id="promises" className="bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our promises"
          title={
            <>
              What you can <em className="text-pine">count on</em>
            </>
          }
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((p, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li key={p.title}>
                <Reveal delay={i * 0.08} className="h-full rounded-3xl border border-line bg-cream p-7">
                  <Icon className="h-7 w-7 text-apricot" aria-hidden />
                  <h3 className="mt-5 font-serif text-2xl leading-tight font-medium text-ink">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-mist">{p.text}</p>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
