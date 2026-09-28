// Runs before `next build` (and `next dev`): writes src/lib/catalog-snapshot.json, the prices and upcoming
// departures baked into the static HTML (what visitors see before /api/departures answers, or without JS).
//
// Source: the live /api/departures (D1). If that fails or looks wrong:
//   - on Cloudflare Pages builds (CF_PAGES is set) the build FAILS, so Cloudflare keeps the previous good
//     deployment live and stale prices are never published;
//   - on local builds, or when SNAPSHOT_ALLOW_FALLBACK=1 (e.g. a brand-new project's first deploy), the
//     values in src/lib/content.ts are used instead.
//
// SNAPSHOT_API_URL overrides the API address (default: <NEXT_PUBLIC_SITE_URL>/api/departures).

import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { buildSync } from "esbuild";

// Bundle content.ts (and the site.config.ts it imports) with esbuild instead of relying on Node's TypeScript
// support, so this works on whatever Node version the Cloudflare build image uses.
const compiled = buildSync({
  stdin: {
    contents: 'export { departures, tours } from "./src/lib/content.ts"; export { site } from "./site.config.ts";',
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "neutral",
  write: false,
}).outputFiles[0].text;
mkdirSync("node_modules/.cache", { recursive: true });
writeFileSync("node_modules/.cache/snapshot-content.mjs", compiled);
const { departures: contentDepartures, tours: contentTours, site: siteConfig } = await import(
  `${pathToFileURL("node_modules/.cache/snapshot-content.mjs").href}?t=${Date.now()}`
);

const OUT = "src/lib/catalog-snapshot.json";
const site = (process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url).replace(/\/$/, "");
const apiUrl = process.env.SNAPSHOT_API_URL ?? `${site}/api/departures`;
const onCloudflare = !!process.env.CF_PAGES;
const allowFallback = !onCloudflare || process.env.SNAPSHOT_ALLOW_FALLBACK === "1";

const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const posInt = (n) => Number.isInteger(n) && n > 0;

/** Returns a list of problems; empty when the response is usable. */
function validate(r) {
  const problems = [];
  if (!r || !Array.isArray(r.tours) || !Array.isArray(r.departures)) return ["response has no tours/departures arrays"];
  for (const t of r.tours) {
    if (typeof t?.slug !== "string" || !posInt(t?.pricePKR)) problems.push(`bad tour row ${JSON.stringify(t)}`);
  }
  for (const t of contentTours) {
    if (!r.tours.some((x) => x.slug === t.slug)) problems.push(`tour "${t.slug}" is missing from the API`);
  }
  for (const d of r.departures) {
    const ok =
      posInt(d?.id) &&
      typeof d?.tour === "string" &&
      isDate(d?.date) &&
      posInt(d?.seats) &&
      Number.isInteger(d?.seatsLeft) &&
      d.seatsLeft >= 0 &&
      d.seatsLeft <= d.seats;
    if (!ok) problems.push(`bad departure row ${JSON.stringify(d)}`);
  }
  return problems;
}

async function fetchLive() {
  const url = `${apiUrl}${apiUrl.includes("?") ? "&" : "?"}snapshot=${Date.now()}`;
  const res = await fetch(url, { headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`${apiUrl} answered ${res.status}`);
  const body = await res.json();
  const problems = validate(body);
  if (problems.length) throw new Error(`${apiUrl} returned unexpected data: ${problems.slice(0, 5).join("; ")}`);
  return body;
}

function write(snapshot) {
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + "\n");
}

try {
  const live = await fetchLive();
  write({
    source: "live",
    generatedAt: new Date().toISOString(),
    tours: live.tours.map((t) => ({ slug: t.slug, pricePKR: t.pricePKR })),
    departures: live.departures.map((d) => ({ id: d.id, tour: d.tour, date: d.date, seats: d.seats, seatsLeft: d.seatsLeft })),
  });
  console.log(`catalog snapshot: ${live.tours.length} tours, ${live.departures.length} departures from ${apiUrl}`);
} catch (err) {
  const reason = err instanceof Error ? err.message : String(err);
  if (!allowFallback) {
    console.error(`\ncatalog snapshot FAILED on a Cloudflare build: ${reason}`);
    console.error("Stopping the build so the previous deployment stays live. Set SNAPSHOT_ALLOW_FALLBACK=1 only for a first deploy.\n");
    process.exit(1);
  }
  write({
    source: "content.ts",
    reason,
    generatedAt: new Date().toISOString(),
    tours: contentTours.map((t) => ({ slug: t.slug, pricePKR: t.pricePKR })),
    departures: contentDepartures.map((d) => ({ id: null, tour: d.tour, date: d.date, seats: d.seats, seatsLeft: d.seatsLeft })),
  });
  console.warn(`catalog snapshot: live fetch failed (${reason}); using content.ts values.`);
}
