// Shared server-only code for Pages Functions. Kept out of src/ so the Next.js build never sees Cloudflare types.
// Bindings and variables available to Pages Functions (see wrangler.toml and .dev.vars.example).
// Secrets (Turnstile, email, n8n, bank details) are added in later stages.
export interface Env {
  DB: D1Database;
  RECEIPTS: R2Bucket;
  DEPOSIT_PERCENT?: string;
  HOLD_HOURS?: string;
}
