// POST /api/admin/logout: clears the admin session cookie.
import { logoutCookie } from "../../../server/admin-session";
import type { Env } from "../../../server/env";
import { PRIVATE_HEADERS } from "../../../server/http";

export const onRequestPost: PagesFunction<Env> = () =>
  Response.json({ ok: true }, { headers: { ...PRIVATE_HEADERS, "Set-Cookie": logoutCookie() } });
