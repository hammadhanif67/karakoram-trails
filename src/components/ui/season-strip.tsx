import { months, seasonLabel, type SeasonCode } from "@/lib/content";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

const fill: Record<Tone, Record<SeasonCode, string>> = {
  light: { g: "bg-[#4f8a63]", a: "bg-apricot", x: "bg-[#d6ccb9]" },
  dark: { g: "bg-[#6fae84]", a: "bg-apricot", x: "bg-cream/20" },
};

/** Twelve month cells: green = best, amber = possible, grey = closed or not advised. */
export function SeasonStrip({
  codes,
  tone = "light",
  labels = true,
  className,
  label = "Season by month",
}: {
  codes: SeasonCode[];
  tone?: Tone;
  labels?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <ul aria-label={label} className={cn("grid grid-cols-12 gap-1", className)}>
      {codes.map((c, i) => (
        <li key={months[i]} title={`${months[i]}: ${seasonLabel[c]}`} className="flex min-w-0 flex-col items-center gap-1">
          <span aria-hidden className={cn("h-2.5 w-full rounded-[2px]", fill[tone][c])} />
          {labels && (
            <span aria-hidden className={cn("text-[0.6rem] leading-none", tone === "dark" ? "text-cream/60" : "text-mist")}>
              {months[i][0]}
            </span>
          )}
          <span className="sr-only">
            {months[i]}: {seasonLabel[c]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SeasonLegend({ tone = "light", className }: { tone?: Tone; className?: string }) {
  return (
    <ul aria-hidden className={cn("flex flex-wrap gap-x-5 gap-y-2 text-xs", tone === "dark" ? "text-cream/70" : "text-mist", className)}>
      {(["g", "a", "x"] as const).map((c) => (
        <li key={c} className="flex items-center gap-2">
          <span className={cn("h-2.5 w-5 rounded-[2px]", fill[tone][c])} />
          {seasonLabel[c]}
        </li>
      ))}
    </ul>
  );
}
