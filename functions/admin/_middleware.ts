// Protects the static /admin pages. Signed-in admins (password session or Cloudflare Access) get the
// page; everyone else is sent to /admin/login/, which is the only admin page served without a session.
import { requireAdmin } from "../../server/access";
import type { Env } from "../../server/env";
import { HttpError } from "../../server/http";

const secure = (res: Response) => {
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", "no-store");
  out.headers.set("Referrer-Policy", "no-referrer");
  out.headers.set("X-Robots-Tag", "noindex");
  out.headers.set("X-Frame-Options", "DENY");
  return out;
};

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/admin/login")) return secure(await next());
  try {
    await requireAdmin(request, env);
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      return secure(new Response(null, { status: 302, headers: { Location: "/admin/login/" } }));
    }
    const status = err instanceof HttpError ? err.status : 500;
    return secure(new Response(status === 503 ? "Admin is not configured." : "Not authorised.", { status, headers: { "Content-Type": "text/plain; charset=utf-8" } }));
  }
  return secure(await next());
};
