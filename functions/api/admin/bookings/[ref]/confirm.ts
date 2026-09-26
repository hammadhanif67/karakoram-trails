// POST /api/admin/bookings/:ref/confirm { note? }: deposit received; seats move from held to booked.
import { confirmBooking } from "../../../../../server/admin";
import type { Env } from "../../../../../server/env";
import { handle, json, readJson } from "../../../../../server/http";
import { deliverPending } from "../../../../../server/notify";
import type { AdminData } from "../../_middleware";

export const onRequestPost: PagesFunction<Env, "ref", AdminData> = ({ request, env, params, data, waitUntil }) =>
  handle(async () => {
    const body = (await readJson(request)) as { note?: unknown };
    await confirmBooking(env, String(params.ref), data.admin, typeof body.note === "string" ? body.note.slice(0, 300) : "");
    waitUntil(deliverPending(env));
    return json({ ok: true });
  });
