// GET /api/admin/bookings?status=&q=
import { listBookings } from "../../../../server/admin";
import type { Env } from "../../../../server/env";
import { handle, json } from "../../../../server/http";

export const onRequestGet: PagesFunction<Env> = ({ request, env }) => handle(async () => json(await listBookings(env, new URL(request.url))));
