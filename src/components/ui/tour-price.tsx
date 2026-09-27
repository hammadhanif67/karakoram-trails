"use client";

import { formatPrice } from "@/lib/content";
import { useCurrency } from "@/lib/currency";
import { useTourPrice } from "@/lib/live-data";

/** Live price per person for a tour (D1 via /api/departures, the build-time snapshot as fallback). */
export function TourPrice({ slug, prefix = "", className }: { slug: string; prefix?: string; className?: string }) {
  const { currency } = useCurrency();
  const pkr = useTourPrice(slug);
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {formatPrice(pkr, currency)}
    </span>
  );
}

/** "US dollar prices are approximate." while USD is selected. */
export function UsdApproxNote() {
  const { currency } = useCurrency();
  return currency === "USD" ? <>US dollar prices are approximate. </> : null;
}
