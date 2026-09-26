// Every /api/admin/* request: verified Cloudflare Access identity, and same-origin for changes (CSRF).
import { requireAdmin, type Admin } from "../../../server/access";
import type { Env } from "../../../server/env";
import { fail, handle } from "../../../server/http";

export type AdminData = { admin: Admin };

export const onRequest: PagesFunction<Env, string, AdminData> = ({ request, env, next, data }) =>
  handle(async () => {
    data.admin = await requireAdmin(request, env);
    if (request.method !== "GET" && request.method !== "HEAD") {
      const origin = request.headers.get("Origin");
      if (!origin || origin !== new URL(request.url).origin) return fail(403, "bad_origin", "Cross-site request blocked.");
    }
    return next();
  });
