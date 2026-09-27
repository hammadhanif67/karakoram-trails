// Booking creation, lookup and hold expiry on D1.
import { depositFor, holdExpiresAt, isBookableOnline } from "../src/lib/booking-rules";
import { depositPercent, holdHours, type Env } from "./env";
import { HttpError } from "./http";
import { randomToken, safeEqual } from "./tokens";

/** Terms / booking conditions version the customer accepts at checkout (bump when the texts change). */
export const TERMS_VERSION = "2026-09-27";

export const PAYMENT_METHODS = ["bank_transfer"] as const; // JazzCash, Easypaisa, card: later providers
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type BookingInput = {
  departureId: number;
  travellers: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  paymentMethod: PaymentMethod;
};

/** Validates and normalises the checkout form. Throws HttpError(422) with a field-specific message. */
export function parseBookingInput(body: unknown): BookingInput & { acceptTerms: true; turnstileToken: unknown } {
  const b = (body ?? {}) as Record<string, unknown>;
  const bad = (field: string, message: string): never => {
    throw new HttpError(422, `invalid_${field}`, message);
  };
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const departureId = Number(b.departureId);
  if (!Number.isInteger(departureId) || departureId <= 0) bad("departure", "Choose a departure.");
  const travellers = Number(b.travellers);
  if (!Number.isInteger(travellers) || travellers < 1 || travellers > 12) bad("travellers", "Travellers must be between 1 and 12.");
  const name = str(b.name);
  if (name.length < 2 || name.length > 80) bad("name", "Enter the lead traveller's full name.");
  const email = str(b.email).toLowerCase();
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) bad("email", "Enter a valid email address.");
  const phone = str(b.phone);
  if (!/^\+?[\d\s-]{8,20}$/.test(phone) || phone.replace(/\D/g, "").length < 8) bad("phone", "Enter a phone number with at least 8 digits.");
  const notes = str(b.notes);
  if (notes.length > 500) bad("notes", "Notes can be up to 500 characters.");
  const paymentMethod = str(b.paymentMethod) as PaymentMethod;
  if (!PAYMENT_METHODS.includes(paymentMethod)) bad("payment_method", "Choose a payment method.");
  if (b.acceptTerms !== true) bad("terms", "Please accept the booking conditions.");

  return { departureId, travellers, name, email, phone, notes, paymentMethod, acceptTerms: true, turnstileToken: b.turnstileToken };
}

/**
 * Releases seats held by unpaid bookings whose hold has expired and marks them cancelled.
 * Only 'pending_payment' bookings expire; 'verifying' bookings (receipt uploaded) never do.
 * Runs lazily on reads and writes until the scheduled clean-up Worker exists (stage 6).
 */
export async function releaseExpiredHolds(db: D1Database, now = new Date()) {
  const t = now.toISOString(); // hold_expires_at is stored as an ISO string, so text comparison works
  // Same condition in all three statements; they run in order inside one transaction.
  await db.batch([
    db
      .prepare(
        `UPDATE departures
            SET seats_held = seats_held - (
                  SELECT COALESCE(SUM(b.travellers), 0) FROM bookings b
                   WHERE b.departure_id = departures.id AND b.status = 'pending_payment'
                     AND b.hold_expires_at IS NOT NULL AND b.hold_expires_at <= ?1)
          WHERE id IN (SELECT departure_id FROM bookings
                        WHERE status = 'pending_payment' AND hold_expires_at IS NOT NULL AND hold_expires_at <= ?1)`,
      )
      .bind(t),
    db
      .prepare(
        `INSERT INTO booking_events (booking_id, type, actor)
         SELECT id, 'hold_expired', 'system' FROM bookings
          WHERE status = 'pending_payment' AND hold_expires_at IS NOT NULL AND hold_expires_at <= ?1`,
      )
      .bind(t),
    db
      .prepare(
        `UPDATE bookings SET status = 'cancelled', updated_at = datetime('now')
          WHERE status = 'pending_payment' AND hold_expires_at IS NOT NULL AND hold_expires_at <= ?1`,
      )
      .bind(t),
  ]);
}

type DepartureRow = {
  id: number;
  start_date: string;
  status: string;
  seats_left: number;
  price_pkr: number;
  tour_name: string;
  tour_slug: string;
  tour_active: number;
};

/**
 * Creates a 'pending_payment' booking and holds its seats atomically: the seat update, the booking
 * insert (only if the seat update succeeded), its reference and its audit event run in one D1 batch.
 */
export async function createBooking(env: Env, input: BookingInput, now = new Date()) {
  const db = env.DB;
  await releaseExpiredHolds(db, now);

  const dep = await db
    .prepare(
      `SELECT d.id, d.start_date, d.status, d.seats_total - d.seats_booked - d.seats_held AS seats_left,
              t.price_pkr, t.name AS tour_name, t.slug AS tour_slug, t.active AS tour_active
         FROM departures d JOIN tours t ON t.id = d.tour_id WHERE d.id = ?1`,
    )
    .bind(input.departureId)
    .first<DepartureRow>();

  if (!dep || dep.status !== "open" || !dep.tour_active) throw new HttpError(404, "departure_unavailable", "This departure is no longer available.");
  if (!isBookableOnline(dep.start_date, now))
    throw new HttpError(409, "too_close", "This departure starts within 72 hours. Please contact us on WhatsApp to book.");
  if (dep.seats_left < input.travellers)
    throw new HttpError(409, "not_enough_seats", dep.seats_left > 0 ? `Only ${dep.seats_left} seat(s) left on this departure.` : "This departure is fully booked.");

  const total = dep.price_pkr * input.travellers;
  const pct = depositPercent(env);
  const deposit = depositFor(total, pct);
  const expires = holdExpiresAt(dep.start_date, holdHours(env), now).toISOString();
  const token = randomToken();
  const tmpRef = `TMP-${randomToken(9)}`;

  await db.batch([
    db
      .prepare(
        `UPDATE departures SET seats_held = seats_held + ?1
          WHERE id = ?2 AND status = 'open' AND seats_total - seats_booked - seats_held >= ?1`,
      )
      .bind(input.travellers, dep.id),
    // Inserted only if the seat hold above changed exactly one row.
    db
      .prepare(
        `INSERT INTO bookings (ref, access_token, departure_id, travellers, lead_name, email, phone, notes,
                               total_pkr, deposit_percent, deposit_pkr, payment_method, terms_version, hold_expires_at)
         SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14 WHERE changes() = 1`,
      )
      .bind(tmpRef, token, dep.id, input.travellers, input.name, input.email, input.phone, input.notes || null,
        total, pct, deposit, input.paymentMethod, TERMS_VERSION, expires),
    db.prepare(`UPDATE bookings SET ref = 'KT-' || (1000 + id) WHERE access_token = ?1`).bind(token),
    db
      .prepare(`INSERT INTO booking_events (booking_id, type, actor, data) SELECT id, 'created', 'customer', ?2 FROM bookings WHERE access_token = ?1`)
      .bind(token, JSON.stringify({ travellers: input.travellers, total_pkr: total, deposit_pkr: deposit })),
  ]);

  const created = await db.prepare("SELECT ref FROM bookings WHERE access_token = ?1").bind(token).first<{ ref: string }>();
  // Another booking took the last seats between our check and the batch.
  if (!created) throw new HttpError(409, "not_enough_seats", "Those seats were just taken. Please choose fewer travellers or another date.");

  return { ref: created.ref, token, tour: dep.tour_name, date: dep.start_date, totalPkr: total, depositPkr: deposit, holdExpiresAt: expires };
}

export type BookingRow = {
  id: number;
  ref: string;
  access_token: string;
  status: "pending_payment" | "verifying" | "confirmed" | "cancelled";
  travellers: number;
  lead_name: string;
  total_pkr: number;
  deposit_percent: number;
  deposit_pkr: number;
  payment_method: string;
  hold_expires_at: string | null;
  created_at: string;
  start_date: string;
  tour_name: string;
  tour_slug: string;
};

/** Looks up a booking by reference and verifies the customer's access token (constant time). */
export async function getBookingForCustomer(env: Env, ref: string, token: string | null): Promise<BookingRow> {
  const notFound = new HttpError(404, "not_found", "Booking not found. Check the link in your email.");
  if (!/^KT-\d{4,9}$/.test(ref) || !token || token.length > 100) throw notFound;
  await releaseExpiredHolds(env.DB);
  const row = await env.DB.prepare(
    `SELECT b.id, b.ref, b.access_token, b.status, b.travellers, b.lead_name, b.total_pkr, b.deposit_percent, b.deposit_pkr,
            b.payment_method, b.hold_expires_at, b.created_at, d.start_date, t.name AS tour_name, t.slug AS tour_slug
       FROM bookings b JOIN departures d ON d.id = b.departure_id JOIN tours t ON t.id = d.tour_id
      WHERE b.ref = ?1`,
  )
    .bind(ref)
    .first<BookingRow>();
  if (!row || !safeEqual(row.access_token, token)) throw notFound;
  return row;
}

/** What the customer may see about their booking (never the token or other customers' data). */
export function publicBooking(b: BookingRow) {
  return {
    ref: b.ref,
    status: b.status,
    tour: b.tour_name,
    tourSlug: b.tour_slug,
    date: b.start_date,
    travellers: b.travellers,
    leadName: b.lead_name,
    totalPkr: b.total_pkr,
    depositPercent: b.deposit_percent,
    depositPkr: b.deposit_pkr,
    paymentMethod: b.payment_method,
    holdExpiresAt: b.status === "pending_payment" ? b.hold_expires_at : null,
    createdAt: b.created_at,
  };
}
