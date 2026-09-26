// Server-side Cloudflare Turnstile verification (canonical siteverify: success, action and hostname
// must all match; any network or parsing problem fails closed). Tokens are single-use.
import type { Env } from "./env";
import { HttpError } from "./http";

export type TurnstileAction = "booking_create" | "receipt_upload";

type SiteverifyResult = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
  metadata?: { result_with_testing_key?: boolean };
};

export async function verifyTurnstile(
  env: Env,
  token: unknown,
  expectedAction: TurnstileAction,
  remoteIp: string | null,
): Promise<void> {
  const reject = () => {
    throw new HttpError(403, "verification_failed", "Security check failed. Please retry the check and submit again.");
  };
  const hostnames = new Set(
    (env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean),
  );
  if (!env.TURNSTILE_SECRET_KEY || hostnames.size === 0) {
    console.error("Turnstile is not configured (TURNSTILE_SECRET_KEY / TURNSTILE_HOSTNAMES)");
    throw new HttpError(503, "not_configured", "Online booking is not available right now. Please contact us on WhatsApp.");
  }
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) reject();

  let result: SiteverifyResult;
  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token as string });
    if (remoteIp) body.set("remoteip", remoteIp);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = (await r.json()) as SiteverifyResult;
  } catch (err) {
    console.error("Turnstile siteverify failed", err);
    return reject();
  }

  // Cloudflare's testing keys return no action; accept them only where explicitly allowed (local dev).
  const testKey = result.metadata?.result_with_testing_key === true;
  const actionOk = result.action === expectedAction || (testKey && env.TURNSTILE_ALLOW_TEST_KEYS === "true");
  if (testKey && env.TURNSTILE_ALLOW_TEST_KEYS !== "true") reject();
  if (!result.success || !actionOk || !result.hostname || !hostnames.has(result.hostname)) reject();
}
