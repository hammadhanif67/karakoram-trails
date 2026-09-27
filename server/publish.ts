// "Publish changes to site": starts a Cloudflare Pages build through a deploy hook. The build snapshots
// the live D1 prices and departures into the static site (scripts/snapshot-catalog.mjs).
// - Global rate limit: one attempt per PUBLISH_INTERVAL_S, failed attempts included. The slot is claimed
//   with one conditional INSERT, so two admins clicking at once still start only one build.
// - The hook URL is a secret; it never appears in logs, responses or admin_events.
import type { Admin } from "./access";
import type { Env } from "./env";
import { HttpError } from "./http";

export const PUBLISH_INTERVAL_S = 120;
const HOOK_PREFIX = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/";

/**
 * The deploy hook URL, or null when not configured. Only Cloudflare's deploy-hook endpoint is accepted, so
 * a mistyped secret can never send the request anywhere else. A 127.0.0.1/localhost mock is accepted
 * only when the admin itself is running on localhost (local testing).
 */
export function deployHook(env: Env, requestUrl: string): string | null {
  const raw = (env.DEPLOY_HOOK_URL ?? "").trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    console.error("DEPLOY_HOOK_URL is not a valid URL");
    return null;
  }
  if (url.href.startsWith(HOOK_PREFIX) && url.pathname.length > new URL(HOOK_PREFIX).pathname.length) return url.href;
  const local = (h: string) => h === "127.0.0.1" || h === "localhost";
  if (local(new URL(requestUrl).hostname) && local(url.hostname)) return url.href;
  console.error("DEPLOY_HOOK_URL is not a Cloudflare Pages deploy hook URL; publishing is disabled");
  return null;
}

/** Seconds until the next publish is allowed (0 when allowed now). */
export async function publishRetryAfter(env: Env): Promise<number> {
  const row = await env.DB.prepare(
    `SELECT CAST(?1 - (strftime('%s', 'now') - strftime('%s', MAX(created_at))) AS INTEGER) AS wait
       FROM admin_events WHERE action = 'site_publish_requested'`,
  )
    .bind(PUBLISH_INTERVAL_S)
    .first<{ wait: number | null }>();
  return Math.max(0, row?.wait ?? 0);
}

const event = (env: Env, admin: Admin, action: string, value: unknown) =>
  env.DB.prepare("INSERT INTO admin_events (actor, action, entity, entity_id, new_value) VALUES (?1, ?2, 'site', 'pages', ?3)").bind(
    admin.email,
    action,
    JSON.stringify(value),
  );

export async function publishSite(env: Env, admin: Admin, requestUrl: string) {
  const hook = deployHook(env, requestUrl);
  if (!hook) throw new HttpError(503, "not_configured", "Publishing isn't configured (DEPLOY_HOOK_URL).");

  // Claim the slot: only succeeds when no attempt was made in the last PUBLISH_INTERVAL_S seconds.
  const claim = await env.DB.prepare(
    `INSERT INTO admin_events (actor, action, entity, entity_id, new_value)
     SELECT ?1, 'site_publish_requested', 'site', 'pages', '{}'
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_events
         WHERE action = 'site_publish_requested' AND created_at > datetime('now', ?2)
      )`,
  )
    .bind(admin.email, `-${PUBLISH_INTERVAL_S} seconds`)
    .run();
  if (claim.meta.changes !== 1) {
    const wait = await publishRetryAfter(env);
    throw new HttpError(429, "too_soon", `A publish was started less than 2 minutes ago. Try again in ${wait} seconds.`, { retryAfter: wait });
  }

  let error: string | null = null;
  let buildId: string | null = null;
  try {
    const res = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(10_000) });
    if (!res.ok) error = `deploy hook answered ${res.status}`;
    else {
      const body = (await res.json().catch(() => null)) as { result?: { id?: unknown } } | null;
      buildId = typeof body?.result?.id === "string" ? body.result.id : null;
    }
  } catch (err) {
    error = `deploy hook request failed (${err instanceof Error ? err.name : "error"})`;
  }

  if (error) {
    await event(env, admin, "site_publish_failed", { error }).run();
    console.error(`publish failed: ${error}`);
    throw new HttpError(502, "publish_failed", `Publishing failed: ${error}. Try again in 2 minutes.`);
  }
  await event(env, admin, "site_publish_started", { buildId }).run();
}
