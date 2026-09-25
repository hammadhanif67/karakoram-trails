import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, intro, tone = "light", align = "left" }: Props) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className="text-xs font-medium tracking-[0.25em] text-apricot uppercase">{eyebrow}</p>
      <h2
        className={cn(
          "mt-3 font-serif text-4xl leading-[1.05] font-medium text-balance sm:text-5xl lg:text-6xl",
          tone === "dark" ? "text-cream" : "text-ink",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-base leading-relaxed sm:text-lg", tone === "dark" ? "text-cream/75" : "text-mist")}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}
