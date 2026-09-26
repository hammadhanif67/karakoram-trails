// Protects the static /admin page itself. Cloudflare Access should already block it at the edge;
// this makes the page unreachable even if the Access application is missing or misconfigured.
import { requireAdmin } from "../../server/access";
import type { Env } from "../../server/env";
import { HttpError } from "../../server/http";

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  try {
    await requireAdmin(request, env);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return new Response(status === 503 ? "Admin is not configured." : "Not authorised.", {
      status,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    });
  }
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", "no-store");
  out.headers.set("Referrer-Policy", "no-referrer");
  out.headers.set("X-Robots-Tag", "noindex");
  out.headers.set("X-Frame-Options", "DENY");
  return out;
};
