// Shared server-only code for Pages Functions. Kept out of src/ so the Next.js build never sees Cloudflare types.
// Bindings and variables available to Pages Functions (see wrangler.toml and .dev.vars.example).
export interface Env {
  DB: D1Database;
  RECEIPTS: R2Bucket;

  // wrangler.toml [vars]
  DEPOSIT_PERCENT?: string;
  HOLD_HOURS?: string;

  // Secrets / per-environment settings (.dev.vars locally, Pages settings in production)
  TURNSTILE_SECRET_KEY?: string;
  /** Comma-separated frontend hostnames Turnstile tokens may come from. Never include localhost in production. */
  TURNSTILE_HOSTNAMES?: string;
  /** Local development only: accept Cloudflare's Turnstile testing keys (they return no action). */
  TURNSTILE_ALLOW_TEST_KEYS?: string;

  BANK_NAME?: string;
  BANK_ACCOUNT_TITLE?: string;
  BANK_IBAN?: string;
  RAAST_ID?: string;
}

export const depositPercent = (env: Env) => clampInt(env.DEPOSIT_PERCENT, 30, 1, 100);
export const holdHours = (env: Env) => clampInt(env.HOLD_HOURS, 48, 1, 24 * 14);

function clampInt(v: string | undefined, fallback: number, min: number, max: number) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
