// POST /api/admin/login { password, turnstileToken }: sets the admin session cookie.
import { login } from "../../../server/admin-session";
import type { Env } from "../../../server/env";
import { PRIVATE_HEADERS, handle, readJson } from "../../../server/http";
import { verifyTurnstile } from "../../../server/turnstile";

export const onRequestPost: PagesFunction<Env> = ({ request, env }) =>
  handle(async () => {
    const body = (await readJson(request)) as { password?: unknown; turnstileToken?: unknown };
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    await verifyTurnstile(env, body.turnstileToken, "admin_login", ip === "unknown" ? null : ip);
    const cookie = await login(env, body.password, ip);
    return Response.json({ ok: true }, { headers: { ...PRIVATE_HEADERS, "Set-Cookie": cookie } });
  });
