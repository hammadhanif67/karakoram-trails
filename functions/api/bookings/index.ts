// POST /api/bookings: create a booking (Turnstile-protected). Prices are always computed on the
// server from D1; nothing the browser sends about money is trusted.
import { createBooking, parseBookingInput } from "../../../server/bookings";
import type { Env } from "../../../server/env";
import { handle, json, readJson } from "../../../server/http";
import { deliverPending } from "../../../server/notify";
import { verifyTurnstile } from "../../../server/turnstile";

export const onRequestPost: PagesFunction<Env> = ({ request, env, waitUntil }) =>
  handle(async () => {
    const input = parseBookingInput(await readJson(request));
    await verifyTurnstile(env, input.turnstileToken, "booking_create", request.headers.get("CF-Connecting-IP"));
    const booking = await createBooking(env, input);
    waitUntil(deliverPending(env)); // n8n + emails after the response
    return json(
      {
        ref: booking.ref,
        token: booking.token,
        statusUrl: `/booking/?ref=${encodeURIComponent(booking.ref)}&t=${encodeURIComponent(booking.token)}`,
        totalPkr: booking.totalPkr,
        depositPkr: booking.depositPkr,
        holdExpiresAt: booking.holdExpiresAt,
      },
      201,
    );
  });
