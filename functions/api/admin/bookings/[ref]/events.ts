// GET /api/admin/bookings/:ref/events: audit trail and notification status.
import { bookingEvents } from "../../../../../server/admin";
import type { Env } from "../../../../../server/env";
import { handle, json } from "../../../../../server/http";

export const onRequestGet: PagesFunction<Env, "ref"> = ({ env, params }) => handle(async () => json({ events: await bookingEvents(env, String(params.ref)) }));
