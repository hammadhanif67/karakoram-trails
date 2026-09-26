// GET /api/bookings/:ref/payment?t=<access token>: bank transfer instructions for an unpaid booking.
// Bank details come from environment variables and are only shown to the booking's owner.
import { getBookingForCustomer } from "../../../../server/bookings";
import type { Env } from "../../../../server/env";
import { HttpError, handle, json } from "../../../../server/http";

export const onRequestGet: PagesFunction<Env, "ref"> = ({ request, env, params }) =>
  handle(async () => {
    const token = new URL(request.url).searchParams.get("t");
    const b = await getBookingForCustomer(env, String(params.ref), token);
    if (b.status === "cancelled") throw new HttpError(410, "cancelled", "This booking is cancelled.");
    if (b.payment_method !== "bank_transfer") throw new HttpError(409, "wrong_method", "This booking uses a different payment method.");
    if (!env.BANK_IBAN || !env.BANK_ACCOUNT_TITLE || !env.BANK_NAME) {
      console.error("Bank transfer details are not configured");
      throw new HttpError(503, "not_configured", "Payment details are not available right now. Please contact us on WhatsApp.");
    }
    return json({
      method: "bank_transfer",
      amountPkr: b.deposit_pkr,
      reference: b.ref, // customer writes this in the transfer description
      bankName: env.BANK_NAME,
      accountTitle: env.BANK_ACCOUNT_TITLE,
      iban: env.BANK_IBAN,
      raastId: env.RAAST_ID || null,
    });
  });
