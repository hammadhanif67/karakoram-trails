// PATCH /api/admin/tours/:slug/price { price, expected }: new price for new bookings only.
import { setPrice } from "../../../../../server/catalog";
import type { Env } from "../../../../../server/env";
import { handle, json, readJson } from "../../../../../server/http";
import type { AdminData } from "../../_middleware";

export const onRequestPatch: PagesFunction<Env, "slug", AdminData> = ({ request, env, params, data }) =>
  handle(async () => {
    await setPrice(env, data.admin, String(params.slug), ((await readJson(request)) ?? {}) as Record<string, unknown>);
    return json({ ok: true });
  });
