// Admin editor for departures and tour prices. D1 is the source of truth. Every change is one D1 batch:
// the guarded UPDATE/INSERT and its admin_events row (chained with changes() = 1), so a change is never
// logged without happening or the other way round.
import { isBookableOnline } from "../src/lib/booking-rules";
import { maxGroupSize, seasonWarnings } from "../src/lib/content";
import type { Admin } from "./access";
import { releaseExpiredHolds } from "./bookings";
import type { Env } from "./env";
import { HttpError } from "./http";
import { deployHook, publishRetryAfter } from "./publish";

export const PRICE_MIN = 1_000;
export const PRICE_MAX = 1_000_000;

type DepartureRow = {
  id: number;
  tour: string;
  start_date: string;
  seats_total: number;
  seats_booked: number;
  seats_held: number;
  status: "open" | "closed" | "cancelled";
};

const ACTIVE = "('pending_payment', 'verifying', 'confirmed')";

const logEvent = (env: Env, admin: Admin, action: string, entity: string, entityId: string | null, oldValue: unknown, newValue: unknown, note?: unknown) =>
  env.DB.prepare(
    `INSERT INTO admin_events (actor, action, entity, entity_id, old_value, new_value, note)
     SELECT ?1, ?2, ?3, COALESCE(?4, last_insert_rowid()), ?5, ?6, ?7 WHERE changes() = 1`,
  ).bind(
    admin.email,
    action,
    entity,
    entityId,
    oldValue === undefined ? null : JSON.stringify(oldValue),
    JSON.stringify(newValue),
    note === undefined ? null : JSON.stringify(note),
  );

const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : NaN);

export async function getCatalog(env: Env, requestUrl: string) {
  await releaseExpiredHolds(env.DB);
  const tours = await env.DB.prepare("SELECT slug, name, price_pkr, active FROM tours ORDER BY id").all();
  const departures = await env.DB.prepare(
    `SELECT d.id, t.slug AS tour, d.start_date, d.seats_total, d.seats_booked, d.seats_held, d.status,
            (SELECT COUNT(*) FROM bookings b WHERE b.departure_id = d.id AND b.status IN ${ACTIVE}) AS active_bookings
       FROM departures d JOIN tours t ON t.id = d.tour_id
      ORDER BY d.start_date, t.slug`,
  ).all();
  const events = await env.DB.prepare(
    "SELECT id, created_at, actor, action, entity, entity_id, old_value, new_value, note FROM admin_events ORDER BY id DESC LIMIT 50",
  ).all();
  const publish = { configured: deployHook(env, requestUrl) !== null, retryAfter: await publishRetryAfter(env) };
  return { maxGroupSize, tours: tours.results, departures: departures.results, events: events.results, publish };
}

async function departure(env: Env, id: number): Promise<DepartureRow> {
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, "not_found", "Departure not found.");
  const d = await env.DB.prepare(
    `SELECT d.id, t.slug AS tour, d.start_date, d.seats_total, d.seats_booked, d.seats_held, d.status
       FROM departures d JOIN tours t ON t.id = d.tour_id WHERE d.id = ?1`,
  )
    .bind(id)
    .first<DepartureRow>();
  if (!d) throw new HttpError(404, "not_found", "Departure not found.");
  return d;
}

function checkSeats(seats: number) {
  if (!Number.isInteger(seats) || seats < 1 || seats > maxGroupSize) {
    throw new HttpError(422, "invalid_seats", `Seats must be a whole number from 1 to ${maxGroupSize}.`);
  }
}

/** Adds a departure. Season warnings must be acknowledged (409 season_warning lists them otherwise). */
export async function addDeparture(env: Env, admin: Admin, body: Record<string, unknown>) {
  const tour = typeof body.tour === "string" ? body.tour : "";
  const date = typeof body.date === "string" ? body.date : "";
  const seats = int(body.seats);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new HttpError(422, "invalid_date", "Enter a valid date.");
  }
  if (!isBookableOnline(date)) throw new HttpError(422, "date_too_soon", "Pick a date at least 72 hours from now.");
  checkSeats(seats);
  const t = await env.DB.prepare("SELECT id, slug FROM tours WHERE slug = ?1 AND active = 1").bind(tour).first<{ id: number; slug: string }>();
  if (!t) throw new HttpError(422, "invalid_tour", "Choose a tour.");

  const warnings = seasonWarnings(t.slug, date);
  const serious = warnings.filter((w) => w.level === "warning");
  if (serious.length && body.acknowledgeSeason !== true) {
    throw new HttpError(409, "season_warning", "This date is outside the usual season.", { warnings });
  }

  const existing = await env.DB.prepare("SELECT id, status FROM departures WHERE tour_id = ?1 AND start_date = ?2")
    .bind(t.id, date)
    .first<{ id: number; status: string }>();
  if (existing) {
    throw new HttpError(
      409,
      "duplicate",
      existing.status === "open" ? "This tour already has a departure on that date." : "A closed departure exists on that date. Reopen it instead.",
    );
  }

  const db = env.DB;
  await db.batch([
    db.prepare("INSERT INTO departures (tour_id, start_date, seats_total) VALUES (?1, ?2, ?3)").bind(t.id, date, seats),
    logEvent(
      env,
      admin,
      "departure_added",
      "departure",
      null,
      undefined,
      { tour: t.slug, date, seats },
      warnings.length
        ? { seasonWarningsAcknowledged: serious.map((w) => w.message), seasonNotes: warnings.filter((w) => w.level === "info").map((w) => w.message) }
        : undefined,
    ),
  ]);
}

/** Changes the seat total; never below booked + held. `expected` guards against overwriting a change from another tab. */
export async function setSeats(env: Env, admin: Admin, id: number, body: Record<string, unknown>) {
  const seats = int(body.seats);
  const expected = int(body.expected);
  checkSeats(seats);
  const d = await departure(env, id);
  if (d.seats_total !== expected) throw new HttpError(409, "state_changed", "Seats were changed meanwhile. Reload and try again.");
  if (seats === d.seats_total) return;
  const taken = d.seats_booked + d.seats_held;
  if (seats < taken) throw new HttpError(422, "below_taken", `This departure has ${taken} seats booked or held; the total can't go below that.`);

  const db = env.DB;
  const r = await db.batch([
    db
      .prepare("UPDATE departures SET seats_total = ?1 WHERE id = ?2 AND seats_total = ?3 AND seats_booked + seats_held <= ?1")
      .bind(seats, id, expected),
    logEvent(env, admin, "seats_changed", "departure", String(id), { seats: d.seats_total }, { seats }, { tour: d.tour, date: d.start_date }),
  ]);
  if (r[0].meta.changes !== 1) throw new HttpError(409, "state_changed", "Seats changed meanwhile (a booking may have come in). Reload and try again.");
}

/** Active bookings on a departure, listed before closing it. */
async function activeBookings(env: Env, id: number) {
  const { results } = await env.DB.prepare(
    `SELECT ref, status, travellers, lead_name FROM bookings WHERE departure_id = ?1 AND status IN ${ACTIVE} ORDER BY id`,
  )
    .bind(id)
    .all<{ ref: string; status: string; travellers: number; lead_name: string }>();
  return results;
}

/** Closes a departure to new bookings. Existing bookings stay as they are. */
export async function closeDeparture(env: Env, admin: Admin, id: number, body: Record<string, unknown>) {
  await releaseExpiredHolds(env.DB);
  const d = await departure(env, id);
  if (d.status !== "open") throw new HttpError(409, "not_open", "This departure is not open.");
  const bookings = await activeBookings(env, id);
  if (bookings.length && body.force !== true) {
    throw new HttpError(409, "active_bookings", "This departure has active bookings.", { bookings });
  }
  const db = env.DB;
  const r = await db.batch([
    db.prepare("UPDATE departures SET status = 'closed' WHERE id = ?1 AND status = 'open'").bind(id),
    logEvent(env, admin, "departure_closed", "departure", String(id), { status: "open" }, { status: "closed" }, {
      tour: d.tour,
      date: d.start_date,
      activeBookings: bookings.map((b) => b.ref),
    }),
  ]);
  if (r[0].meta.changes !== 1) throw new HttpError(409, "state_changed", "The departure changed meanwhile. Reload and try again.");
}

/** Reopens a closed departure. Returns a warning when it is already inside the online-booking cutoff. */
export async function reopenDeparture(env: Env, admin: Admin, id: number) {
  const d = await departure(env, id);
  if (d.status !== "closed") throw new HttpError(409, "not_closed", "Only closed departures can be reopened.");
  const db = env.DB;
  const r = await db.batch([
    db.prepare("UPDATE departures SET status = 'open' WHERE id = ?1 AND status = 'closed'").bind(id),
    logEvent(env, admin, "departure_reopened", "departure", String(id), { status: "closed" }, { status: "open" }, { tour: d.tour, date: d.start_date }),
  ]);
  if (r[0].meta.changes !== 1) throw new HttpError(409, "state_changed", "The departure changed meanwhile. Reload and try again.");
  return isBookableOnline(d.start_date) ? null : "Reopened, but it is less than 72 hours away, so it can't be booked online.";
}

/** Changes a tour's price for new bookings. Existing bookings keep the total frozen at booking time. */
export async function setPrice(env: Env, admin: Admin, slug: string, body: Record<string, unknown>) {
  const price = int(body.price);
  const expected = int(body.expected);
  if (!Number.isInteger(price) || price < PRICE_MIN || price > PRICE_MAX) {
    throw new HttpError(422, "invalid_price", `Price must be a whole number of rupees from ${PRICE_MIN.toLocaleString("en-US")} to ${PRICE_MAX.toLocaleString("en-US")}.`);
  }
  const t = await env.DB.prepare("SELECT slug, price_pkr FROM tours WHERE slug = ?1").bind(slug).first<{ slug: string; price_pkr: number }>();
  if (!t) throw new HttpError(404, "not_found", "Tour not found.");
  if (t.price_pkr !== expected) throw new HttpError(409, "state_changed", "The price was changed meanwhile. Reload and try again.");
  if (price === t.price_pkr) return;
  const db = env.DB;
  const r = await db.batch([
    db.prepare("UPDATE tours SET price_pkr = ?1 WHERE slug = ?2 AND price_pkr = ?3").bind(price, slug, expected),
    logEvent(env, admin, "price_changed", "tour", slug, { price: t.price_pkr }, { price }),
  ]);
  if (r[0].meta.changes !== 1) throw new HttpError(409, "state_changed", "The price was changed meanwhile. Reload and try again.");
}
