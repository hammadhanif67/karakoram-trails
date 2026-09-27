// POST /api/admin/departures/:id/reopen: reopens a closed departure.
import { reopenDeparture } from "../../../../../server/catalog";
import type { Env } from "../../../../../server/env";
import { handle, json } from "../../../../../server/http";
import type { AdminData } from "../../_middleware";

export const onRequestPost: PagesFunction<Env, "id", AdminData> = ({ env, params, data }) =>
  handle(async () => json({ ok: true, warning: await reopenDeparture(env, data.admin, Number(params.id)) }));
