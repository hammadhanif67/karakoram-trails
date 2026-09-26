// Admin queries and state changes. Every change is a single D1 batch whose steps are chained with
// changes() = 1, so a booking's status and its departure's seat counts can never drift apart.
import type { Admin } from "./access";
import { releaseExpiredHolds } from "./bookings";
import type { Env } from "./env";
import { HttpError } from "./http";

const STATUSES = ["pending_payment", "verifying", "confirmed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

export async function listBookings(env: Env, url: URL) {
  await releaseExpiredHolds(env.DB);
  const status = url.searchParams.get("status");
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
  const where: string[] = [];
  const args: unknown[] = [];
  if (status && (STATUSES as readonly string[]).includes(status)) {
    args.push(status);
    where.push(`b.status = ?${args.length}`);
  }
  if (q) {
    args.push(`%${q.replace(/[%_]/g, "")}%`);
    const i = args.length;
    where.push(`(b.ref LIKE ?${i} OR b.lead_name LIKE ?${i} OR b.email LIKE ?${i} OR b.phone LIKE ?${i})`);
  }
  const { results } = await env.DB.prepare(
    `SELECT b.ref, b.access_token, b.status, b.travellers, b.lead_name, b.email, b.phone, b.notes, b.total_pkr, b.deposit_pkr,
            b.payment_method, b.hold_expires_at, b.created_at, b.updated_at,
            d.id AS departure_id, d.start_date, d.seats_total, d.seats_booked, d.seats_held, t.name AS tour_name,
            (SELECT p.id FROM payments p WHERE p.booking_id = b.id AND p.receipt_key IS NOT NULL ORDER BY p.id DESC LIMIT 1) AS receipt_payment_id
       FROM bookings b JOIN departures d ON d.id = b.departure_id JOIN tours t ON t.id = d.tour_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY CASE b.status WHEN 'verifying' THEN 0 WHEN 'pending_payment' THEN 1 WHEN 'confirmed' THEN 2 ELSE 3 END, b.id DESC
      LIMIT 200`,
  )
    .bind(...args)
    .all();
  const counts = await env.DB.prepare("SELECT status, COUNT(*) AS n FROM bookings GROUP BY status").all<{ status: Status; n: number }>();
  return { bookings: results, counts: Object.fromEntries(counts.results.map((c) => [c.status, c.n])) };
}

type Current = { id: number; status: Status; travellers: number; departure_id: number };

async function current(env: Env, ref: string): Promise<Current> {
  if (!/^KT-\d{4,9}$/.test(ref)) throw new HttpError(404, "not_found", "Booking not found.");
  const b = await env.DB.prepare("SELECT id, status, travellers, departure_id FROM bookings WHERE ref = ?1").bind(ref).first<Current>();
  if (!b) throw new HttpError(404, "not_found", "Booking not found.");
  return b;
}

/** Deposit received: held seats become booked. Allowed from pending_payment (e.g. paid in person) or verifying. */
export async function confirmBooking(env: Env, ref: string, admin: Admin, note: string) {
  await releaseExpiredHolds(env.DB);
  const b = await current(env, ref);
  if (b.status === "confirmed") throw new HttpError(409, "already_confirmed", "Already confirmed.");
  if (b.status === "cancelled") throw new HttpError(409, "cancelled", "This booking is cancelled (its hold may have expired). Create a new booking instead.");

  const db = env.DB;
  const r = await db.batch([
    db
      .prepare(`UPDATE bookings SET status = 'confirmed', hold_expires_at = NULL, updated_at = datetime('now') WHERE id = ?1 AND status = ?2`)
      .bind(b.id, b.status),
    db
      .prepare(`UPDATE departures SET seats_held = seats_held - ?1, seats_booked = seats_booked + ?1 WHERE id = ?2 AND changes() = 1`)
      .bind(b.travellers, b.departure_id),
    db
      .prepare(`INSERT INTO booking_events (booking_id, type, actor, data) SELECT ?1, 'confirmed', 'admin', ?2 WHERE changes() = 1`)
      .bind(b.id, JSON.stringify({ by: admin.email, note: note || undefined })),
    db
      .prepare(
        `UPDATE payments SET status = 'succeeded'
          WHERE booking_id = ?1 AND status = 'submitted' AND EXISTS (SELECT 1 FROM bookings WHERE id = ?1 AND status = 'confirmed')`,
      )
      .bind(b.id),
  ]);
  if (r[0].meta.changes !== 1) throw new HttpError(409, "state_changed", "The booking changed meanwhile. Reload and try again.");
}

/** Cancels a booking and releases its seats (held for unpaid/verifying, booked for confirmed). */
export async function cancelBooking(env: Env, ref: string, admin: Admin, reason: string) {
  await releaseExpiredHolds(env.DB);
  const b = await current(env, ref);
  if (b.status === "cancelled") throw new HttpError(409, "already_cancelled", "Already cancelled.");
  const column = b.status === "confirmed" ? "seats_booked" : "seats_held";

  const db = env.DB;
  const r = await db.batch([
    db
      .prepare(`UPDATE bookings SET status = 'cancelled', hold_expires_at = NULL, updated_at = datetime('now') WHERE id = ?1 AND status = ?2`)
      .bind(b.id, b.status),
    db.prepare(`UPDATE departures SET ${column} = ${column} - ?1 WHERE id = ?2 AND changes() = 1`).bind(b.travellers, b.departure_id),
    db
      .prepare(`INSERT INTO booking_events (booking_id, type, actor, data) SELECT ?1, 'cancelled', 'admin', ?2 WHERE changes() = 1`)
      .bind(b.id, JSON.stringify({ by: admin.email, from: b.status, reason: reason || undefined })),
  ]);
  if (r[0].meta.changes !== 1) throw new HttpError(409, "state_changed", "The booking changed meanwhile. Reload and try again.");
}

export async function bookingEvents(env: Env, ref: string) {
  const b = await current(env, ref);
  const { results } = await env.DB.prepare(
    "SELECT type, actor, data, created_at, webhook_sent, email_sent, telegram_sent, attempts, last_error FROM booking_events WHERE booking_id = ?1 ORDER BY id",
  )
    .bind(b.id)
    .all();
  return results;
}

/** Streams a receipt from the private bucket. */
export async function receiptResponse(env: Env, paymentId: number) {
  if (!Number.isInteger(paymentId) || paymentId <= 0) throw new HttpError(404, "not_found", "Receipt not found.");
  const p = await env.DB.prepare("SELECT receipt_key FROM payments WHERE id = ?1").bind(paymentId).first<{ receipt_key: string | null }>();
  if (!p?.receipt_key) throw new HttpError(404, "not_found", "Receipt not found.");
  const obj = await env.RECEIPTS.get(p.receipt_key);
  if (!obj) throw new HttpError(404, "not_found", "Receipt file is missing.");
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${p.receipt_key.split("/").pop()}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      // Receipts are customer uploads: never let one run script or reach the rest of the site.
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
