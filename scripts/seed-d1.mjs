// Seeds D1 with the tours and departures from src/lib/content.ts, then compares the two. D1 is the source
// of truth: seeding only inserts rows that don't exist yet and never overwrites prices or seats already in D1.
// The public site no longer needs content.ts to match: every build snapshots D1 (scripts/snapshot-catalog.mjs)
// and the admin's "Publish changes to site" rebuilds it.
//
// Usage:
//   node scripts/seed-d1.mjs --local            seed + check the local D1 (wrangler pages dev)
//   node scripts/seed-d1.mjs --remote           seed + check the production D1
//   node scripts/seed-d1.mjs --local --check    check only
//
// Exits with code 1 only if a tour is missing on either side (tour pages are generated from content.ts).
// Different prices or departures are reported as notes: content.ts is just the seed and last-resort fallback.

import { execFileSync, execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { departures, tours } from "../src/lib/content.ts";

const DB = "karakoram-trails";
const target = process.argv.includes("--remote") ? "--remote" : "--local";
const checkOnly = process.argv.includes("--check");
const tmp = join(".wrangler", "tmp-seed");

const sql = (v) => `'${String(v).replace(/'/g, "''")}'`;

function d1File(name, statements) {
  mkdirSync(tmp, { recursive: true });
  const file = join(tmp, name);
  writeFileSync(file, statements.join("\n") + "\n");
  const out = execSync(`npx wrangler d1 execute ${DB} ${target} --file=${file}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  return out;
}

// Pakistan date (UTC+5), same rule as /api/departures.
const today = new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);

if (!checkOnly) {
  const statements = [
    ...tours.map(
      (t) => `INSERT OR IGNORE INTO tours (slug, name, price_pkr) VALUES (${sql(t.slug)}, ${sql(t.name)}, ${t.pricePKR});`,
    ),
    // Seats already taken in content.ts are recorded as confirmed (offline) bookings.
    ...departures.map(
      (d) =>
        `INSERT OR IGNORE INTO departures (tour_id, start_date, seats_total, seats_booked)
           SELECT id, ${sql(d.date)}, ${d.seats}, ${d.seats - d.seatsLeft} FROM tours WHERE slug = ${sql(d.tour)};`,
    ),
  ];
  d1File("seed.sql", statements);
  console.log(`Seeded ${tours.length} tours and ${departures.length} departures (existing rows left unchanged).`);
}

// ---- consistency check: content.ts fallback vs D1 ----
// Read-only queries via --command (a --file run returns a different JSON shape on --remote). Wrangler's
// CLI is run with node directly, without a shell, so the SQL needs no shell quoting.
function d1Query(sqlText) {
  const out = execFileSync(
    process.execPath,
    [join("node_modules", "wrangler", "bin", "wrangler.js"), "d1", "execute", DB, target, "--json", "--command", sqlText],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  const start = out.indexOf("["); // --remote prints progress lines before the JSON
  if (start < 0) throw new Error(`wrangler returned no JSON:
${out}`);
  return JSON.parse(out.slice(start))[0].results;
}
const dbTours = d1Query("SELECT slug, name, price_pkr FROM tours WHERE active = 1 ORDER BY slug");
const dbDeps = d1Query(
  `SELECT t.slug AS tour, d.start_date AS date, d.seats_total AS seats
     FROM departures d JOIN tours t ON t.id = d.tour_id
    WHERE d.status = 'open' AND t.active = 1 AND d.start_date >= ${sql(today)}
    ORDER BY d.start_date, t.slug`,
);

const problems = []; // exit 1
const notes = []; // informational
const dbTourBySlug = new Map(dbTours.map((t) => [t.slug, t]));
for (const t of tours) {
  const db = dbTourBySlug.get(t.slug);
  if (!db) problems.push(`tour ${t.slug}: in content.ts, missing (or inactive) in D1`);
  else {
    if (db.price_pkr !== t.pricePKR) notes.push(`tour ${t.slug}: price content.ts ${t.pricePKR} ≠ D1 ${db.price_pkr}`);
    if (db.name !== t.name) notes.push(`tour ${t.slug}: name content.ts "${t.name}" ≠ D1 "${db.name}"`);
  }
}
for (const db of dbTours) if (!tours.some((t) => t.slug === db.slug)) problems.push(`tour ${db.slug}: active in D1, missing in content.ts`);

const key = (d) => `${d.tour} ${d.date} (${d.seats} seats)`;
const fallbackKeys = new Set(departures.filter((d) => d.date >= today).map(key));
const dbKeys = new Set(dbDeps.map(key));
for (const k of fallbackKeys) if (!dbKeys.has(k)) notes.push(`departure ${k}: in content.ts, not open in D1`);
for (const k of dbKeys) if (!fallbackKeys.has(k)) notes.push(`departure ${k}: open in D1, missing in content.ts`);

rmSync(tmp, { recursive: true, force: true });

if (problems.length) {
  console.error(`\n✗ tours differ between content.ts and D1 (${target.slice(2)}):\n  - ${problems.join("\n  - ")}`);
  console.error("\nEvery active tour needs a page in content.ts (and a row in D1).");
  process.exit(1);
}
if (notes.length) {
  console.log(`\nℹ content.ts (seed / fallback) differs from D1 (${target.slice(2)}), which is fine after admin edits:\n  - ${notes.join("\n  - ")}`);
  console.log("The public site is built from D1; use \"Publish changes to site\" in the admin to refresh it.");
}
console.log(`✓ tours match D1 (${target.slice(2)}): ${dbTours.length} tours, ${dbDeps.length} upcoming departures.`);
