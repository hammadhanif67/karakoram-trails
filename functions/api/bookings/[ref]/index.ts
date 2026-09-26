// GET /api/bookings/:ref?t=<access token>: the customer's own booking status.
import { getBookingForCustomer, publicBooking } from "../../../../server/bookings";
import type { Env } from "../../../../server/env";
import { handle, json } from "../../../../server/http";

export const onRequestGet: PagesFunction<Env, "ref"> = ({ request, env, params }) =>
  handle(async () => {
    const token = new URL(request.url).searchParams.get("t");
    const booking = await getBookingForCustomer(env, String(params.ref), token);
    return json(publicBooking(booking));
  });
