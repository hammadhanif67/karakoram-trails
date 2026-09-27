// PATCH /api/admin/departures/:id/seats { seats, expected }: changes the seat total (never below booked + held).
import { setSeats } from "../../../../../server/catalog";
import type { Env } from "../../../../../server/env";
import { handle, json, readJson } from "../../../../../server/http";
import type { AdminData } from "../../_middleware";

export const onRequestPatch: PagesFunction<Env, "id", AdminData> = ({ request, env, params, data }) =>
  handle(async () => {
    await setSeats(env, data.admin, Number(params.id), ((await readJson(request)) ?? {}) as Record<string, unknown>);
    return json({ ok: true });
  });
