// Prices and departures baked into the static site at build time: the snapshot written by
// scripts/snapshot-catalog.mjs (live D1 data on Cloudflare builds). The live /api/departures replaces
// these after the page loads; the server always re-checks prices and seats when a booking is made.
import snapshot from "./catalog-snapshot.json";

export type PublishedDeparture = { id: number | null; tour: string; date: string; seats: number; seatsLeft: number };

export const publishedCatalog = {
  source: snapshot.source as "live" | "content.ts",
  /** ISO time the snapshot was taken (the build time). */
  generatedAt: snapshot.generatedAt,
  /** Why the content.ts fallback was used (local builds only). */
  reason: "reason" in snapshot ? String(snapshot.reason) : null,
  prices: Object.fromEntries(snapshot.tours.map((t) => [t.slug, t.pricePKR])) as Record<string, number>,
  departures: snapshot.departures as PublishedDeparture[],
};
