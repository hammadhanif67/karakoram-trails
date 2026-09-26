// POST /api/admin/bookings/:ref/cancel { reason? }: cancels and releases the seats.
import { cancelBooking } from "../../../../../server/admin";
import type { Env } from "../../../../../server/env";
import { handle, json, readJson } from "../../../../../server/http";
import { deliverPending } from "../../../../../server/notify";
import type { AdminData } from "../../_middleware";

export const onRequestPost: PagesFunction<Env, "ref", AdminData> = ({ request, env, params, data, waitUntil }) =>
  handle(async () => {
    const body = (await readJson(request)) as { reason?: unknown };
    await cancelBooking(env, String(params.ref), data.admin, typeof body.reason === "string" ? body.reason.slice(0, 300) : "");
    waitUntil(deliverPending(env));
    return json({ ok: true });
  });
