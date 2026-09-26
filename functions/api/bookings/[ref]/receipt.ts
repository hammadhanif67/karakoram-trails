// POST /api/bookings/:ref/receipt?t=<access token> (multipart: receipt, turnstileToken)
// Stores the payment receipt in private R2 and moves the booking to 'verifying' (no auto-expiry).
import { getBookingForCustomer, publicBooking } from "../../../../server/bookings";
import type { Env } from "../../../../server/env";
import { HttpError, handle, json } from "../../../../server/http";
import { MAX_RECEIPT_BYTES, checkReceipt } from "../../../../server/receipts";
import { randomToken } from "../../../../server/tokens";
import { deliverPending } from "../../../../server/notify";
import { verifyTurnstile } from "../../../../server/turnstile";

export const onRequestPost: PagesFunction<Env, "ref"> = ({ request, env, params, waitUntil }) =>
  handle(async () => {
    const token = new URL(request.url).searchParams.get("t");
    const len = Number(request.headers.get("content-length") ?? "0");
    if (len > MAX_RECEIPT_BYTES + 64 * 1024) throw new HttpError(413, "receipt_too_large", "Receipt must be 5 MB or smaller.");
    if (!(request.headers.get("content-type") ?? "").includes("multipart/form-data"))
      throw new HttpError(415, "unsupported_type", "Upload the receipt as a form.");

    // Check ownership and state before spending a Turnstile verification or storage.
    const booking = await getBookingForCustomer(env, String(params.ref), token);
    if (booking.status === "cancelled") throw new HttpError(410, "cancelled", "This booking is cancelled (the seat hold expired). Please book again or contact us.");
    if (booking.status === "confirmed") throw new HttpError(409, "already_confirmed", "This booking is already confirmed.");

    const form = await request.formData();
    await verifyTurnstile(env, form.get("turnstileToken"), "receipt_upload", request.headers.get("CF-Connecting-IP"));
    const receipt = await checkReceipt(form.get("receipt"));

    const key = `receipts/${booking.ref}/${new Date().toISOString().replace(/[:.]/g, "-")}-${randomToken(6)}.${receipt.ext}`;
    await env.RECEIPTS.put(key, receipt.bytes, {
      httpMetadata: { contentType: receipt.mime },
      customMetadata: { bookingRef: booking.ref },
    });

    const db = env.DB;
    const results = await db.batch([
      // Only from pending_payment / verifying: never resurrects a booking that expired meanwhile.
      db
        .prepare(
          `UPDATE bookings SET status = 'verifying', hold_expires_at = NULL, updated_at = datetime('now')
            WHERE id = ?1 AND status IN ('pending_payment', 'verifying')`,
        )
        .bind(booking.id),
      db
        .prepare(
          `INSERT INTO payments (booking_id, provider, amount_pkr, status, receipt_key)
           SELECT ?1, 'bank_transfer', ?2, 'submitted', ?3 WHERE changes() = 1`,
        )
        .bind(booking.id, booking.deposit_pkr, key),
      db
        .prepare(
          `INSERT INTO booking_events (booking_id, type, actor, data)
           SELECT ?1, 'receipt_uploaded', 'customer', ?2 WHERE changes() = 1`,
        )
        .bind(booking.id, JSON.stringify({ receipt_key: key })),
    ]);
    if (results[0].meta.changes !== 1) {
      await env.RECEIPTS.delete(key);
      throw new HttpError(409, "state_changed", "This booking changed while uploading. Please reload the page.");
    }

    waitUntil(deliverPending(env));
    const updated = await getBookingForCustomer(env, booking.ref, token);
    return json(publicBooking(updated));
  });
