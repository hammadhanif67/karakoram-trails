// Every /api/admin/* request: same-origin for changes (CSRF), and a signed-in admin
// (password session or Cloudflare Access) except for login / logout themselves.
import { requireAdmin, type Admin } from "../../../server/access";
import type { Env } from "../../../server/env";
import { fail, handle } from "../../../server/http";

export type AdminData = { admin: Admin };

const PUBLIC = new Set(["/api/admin/login", "/api/admin/logout"]);

export const onRequest: PagesFunction<Env, string, AdminData> = ({ request, env, next, data }) =>
  handle(async () => {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      const origin = request.headers.get("Origin");
      if (!origin || origin !== url.origin) return fail(403, "bad_origin", "Cross-site request blocked.");
    }
    if (!PUBLIC.has(url.pathname.replace(/\/$/, ""))) data.admin = await requireAdmin(request, env);
    return next();
  });
