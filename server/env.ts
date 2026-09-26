// Shared server-only code for Pages Functions. Kept out of src/ so the Next.js build never sees Cloudflare types.
// Bindings and variables available to Pages Functions (see wrangler.toml and .dev.vars.example).
export interface Env {
  DB: D1Database;
  RECEIPTS: R2Bucket;

  // wrangler.toml [vars]
  DEPOSIT_PERCENT?: string;
  HOLD_HOURS?: string;

  // Turnstile (stage 2)
  TURNSTILE_SECRET_KEY?: string;
  /** Comma-separated frontend hostnames Turnstile tokens may come from. Never include localhost in production. */
  TURNSTILE_HOSTNAMES?: string;
  /** Local development only: accept Cloudflare's Turnstile testing keys (they return no action). */
  TURNSTILE_ALLOW_TEST_KEYS?: string;

  // Bank transfer (stage 2)
  BANK_NAME?: string;
  BANK_ACCOUNT_TITLE?: string;
  BANK_IBAN?: string;
  RAAST_ID?: string;

  // Admin via Cloudflare Access (stage 3)
  /** e.g. "yourteam.cloudflareaccess.com" */
  ACCESS_TEAM_DOMAIN?: string;
  /** Application Audience (AUD) tag of the Access application protecting /admin and /api/admin. */
  ACCESS_AUD?: string;
  /** Comma-separated emails allowed into the admin, checked in addition to the Access policy. */
  ADMIN_EMAILS?: string;
  /** Local development only (honoured only on localhost / 127.0.0.1): pretend to be this Access user. */
  ADMIN_DEV_EMAIL?: string;
  /** Password login: "pbkdf2-sha256$iterations$salt$hash" from scripts/hash-admin-password.mjs */
  ADMIN_PASSWORD_HASH?: string;
  /** At least 32 random characters; signs admin session cookies. */
  SESSION_SECRET?: string;

  // Telegram admin alerts (stage 4)
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  /** Local testing only; defaults to https://api.telegram.org */
  TELEGRAM_API_BASE?: string;

  // Notifications (stage 4)
  N8N_WEBHOOK_URL?: string;
  N8N_WEBHOOK_SECRET?: string;
  EMAIL_API_KEY?: string;
  /** Defaults to Resend. Overridable for local testing. */
  EMAIL_API_URL?: string;
  MAIL_FROM?: string;
  /** Public site origin used in email links, e.g. https://karakoramtrails.com */
  PUBLIC_SITE_URL?: string;
}

export const depositPercent = (env: Env) => clampInt(env.DEPOSIT_PERCENT, 30, 1, 100);
export const holdHours = (env: Env) => clampInt(env.HOLD_HOURS, 48, 1, 24 * 14);

function clampInt(v: string | undefined, fallback: number, min: number, max: number) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** Splits a comma-separated setting into trimmed, non-empty, lower-cased values. */
export const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
