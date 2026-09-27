// POST /api/admin/departures/:id/close { force? }: closes to new bookings; 409 lists active bookings unless force.
import { closeDeparture } from "../../../../../server/catalog";
import type { Env } from "../../../../../server/env";
import { handle, json, readJson } from "../../../../../server/http";
import type { AdminData } from "../../_middleware";

export const onRequestPost: PagesFunction<Env, "id", AdminData> = ({ request, env, params, data }) =>
  handle(async () => {
    await closeDeparture(env, data.admin, Number(params.id), ((await readJson(request)) ?? {}) as Record<string, unknown>);
    return json({ ok: true });
  });
