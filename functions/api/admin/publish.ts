// POST /api/admin/publish: starts a Cloudflare Pages build (deploy hook); rate-limited to once per 2 minutes.
import type { Env } from "../../../server/env";
import { handle, json } from "../../../server/http";
import { publishSite } from "../../../server/publish";
import type { AdminData } from "./_middleware";

export const onRequestPost: PagesFunction<Env, string, AdminData> = ({ request, env, data }) =>
  handle(async () => {
    await publishSite(env, data.admin, request.url);
    return json({ ok: true }, 202);
  });
