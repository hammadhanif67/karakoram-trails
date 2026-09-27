// POST /api/admin/departures { tour, date, seats, acknowledgeSeason? }: adds a departure.
import { addDeparture } from "../../../../server/catalog";
import type { Env } from "../../../../server/env";
import { handle, json, readJson } from "../../../../server/http";
import type { AdminData } from "../_middleware";

export const onRequestPost: PagesFunction<Env, string, AdminData> = ({ request, env, data }) =>
  handle(async () => {
    await addDeparture(env, data.admin, ((await readJson(request)) ?? {}) as Record<string, unknown>);
    return json({ ok: true }, 201);
  });
