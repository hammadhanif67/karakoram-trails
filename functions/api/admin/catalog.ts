// GET /api/admin/catalog: tours, all departures (with seat use and active bookings) and the change log.
import { getCatalog } from "../../../server/catalog";
import type { Env } from "../../../server/env";
import { handle, json } from "../../../server/http";

export const onRequestGet: PagesFunction<Env> = ({ request, env }) => handle(async () => json(await getCatalog(env, request.url)));
