"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/content";
import { cn } from "@/lib/utils";

/** PKR/USD switch built on shadcn Toggle Group. */
export function CurrencyToggle({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <ToggleGroup
      type="single"
      value={currency}
      onValueChange={(v) => v && setCurrency(v as Currency)}
      aria-label="Show prices in"
      className={cn(
        "rounded-full border p-1",
        tone === "dark" ? "border-cream/25 bg-night/40" : "border-line bg-white/70",
        className,
      )}
    >
      {(["PKR", "USD"] as const).map((c) => (
        <ToggleGroupItem
          key={c}
          value={c}
          aria-label={c === "PKR" ? "PKR, Pakistani rupees" : "USD, US dollars"}
          className={cn(
            "h-10 min-w-16 cursor-pointer rounded-full! px-4 text-xs font-medium tracking-[0.15em] transition-colors",
            tone === "dark"
              ? "text-cream/75 hover:bg-cream/10 hover:text-cream data-[state=on]:bg-apricot data-[state=on]:text-apricot-ink"
              : "text-mist hover:bg-pine/10 hover:text-pine data-[state=on]:bg-pine data-[state=on]:text-cream",
          )}
        >
          {c}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
