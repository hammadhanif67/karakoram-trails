import { Reveal } from "@/components/ui/reveal";

/** Eyebrow + serif heading used by the tour and destination pages. */
export function SectionTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <p className="text-xs font-medium tracking-[0.25em] text-apricot-deep uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl leading-tight font-medium text-ink sm:text-5xl">{children}</h2>
    </Reveal>
  );
}
