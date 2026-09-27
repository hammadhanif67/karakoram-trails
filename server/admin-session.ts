// Password login for the admin (used while the site has no custom domain for Cloudflare Access).
// - ADMIN_PASSWORD_HASH: "pbkdf2-sha256$<iterations>$<salt b64>$<hash b64>" (scripts/hash-admin-password.mjs)
// - SESSION_SECRET: random string; signs the session cookie. Rotating it signs everyone out.
// - Sessions are stateless HMAC-signed cookies: __Host- prefix, HttpOnly, Secure, SameSite=Strict, 12 h.
// - Failed logins are throttled per IP (5 per 15 minutes) in D1.
import type { Env } from "./env";
import { HttpError } from "./http";
import { safeEqual } from "./tokens";

export const SESSION_COOKIE = "__Host-kt_admin";
const SESSION_HOURS = 12;
const MAX_FAILS = 5;
const WINDOW_MIN = 15;

const enc = new TextEncoder();
const b64url = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hmac(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}

/**
 * Secrets pasted into a prompt often pick up surrounding whitespace, quotes, a "NAME=" prefix or extra
 * lines. Strip those so an otherwise correct value still works.
 */
function cleanSecret(raw: string | undefined, name: string): string {
  let v = (raw ?? "").trim();
  if (v.startsWith(`${name}=`)) v = v.slice(name.length + 1).trim();
  while (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) v = v.slice(1, -1).trim();
  // Neither value ever contains whitespace: if more text was pasted (e.g. the script's next line), keep the first token.
  return v.split(/\s+/)[0] ?? "";
}

const passwordHash = (env: Env) => cleanSecret(env.ADMIN_PASSWORD_HASH, "ADMIN_PASSWORD_HASH");
const sessionSecret = (env: Env) => cleanSecret(env.SESSION_SECRET, "SESSION_SECRET");

/** Shape of the stored hash for logs: counts and lengths only, never the value. */
function describeHash(stored: string) {
  const parts = stored.split("$");
  return (
    `parts=${parts.length} (expected 4), scheme_ok=${parts[0] === "pbkdf2-sha256"}, iterations=${/^\d+$/.test(parts[1] ?? "") ? parts[1] : "not a number"}, ` +
    `salt_len=${parts[2]?.length ?? 0}, hash_len=${parts[3]?.length ?? 0}, total_len=${stored.length}`
  );
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterStr, saltB64, hashB64] = stored.split("$");
  const iterations = Number(iterStr);
  if (scheme !== "pbkdf2-sha256" || !Number.isInteger(iterations) || iterations < 50_000 || iterations > 100_000 || !saltB64 || !hashB64 || stored.split("$").length !== 4) {
    throw new Error(`ADMIN_PASSWORD_HASH has an unexpected format: ${describeHash(stored)}`);
  }
  let salt: Uint8Array, expected: Uint8Array;
  try {
    salt = fromB64(saltB64);
    expected = fromB64(hashB64);
  } catch {
    throw new Error(`ADMIN_PASSWORD_HASH salt/hash is not valid base64: ${describeHash(stored)}`);
  }
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  const a = new Uint8Array(bits);
  return a.byteLength === expected.byteLength && crypto.subtle.timingSafeEqual(a, expected);
}

export const passwordLoginConfigured = (env: Env) => !!(passwordHash(env) && sessionSecret(env).length >= 32);

/** Checks the password with per-IP throttling. Returns a Set-Cookie header value on success. */
export async function login(env: Env, password: unknown, ip: string): Promise<string> {
  if (!passwordLoginConfigured(env)) throw new HttpError(503, "not_configured", "Admin login is not configured.");
  const db = env.DB;
  const recent = await db
    .prepare(`SELECT COUNT(*) AS n FROM admin_login_attempts WHERE ip = ?1 AND success = 0 AND created_at > datetime('now', ?2)`)
    .bind(ip, `-${WINDOW_MIN} minutes`)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= MAX_FAILS) throw new HttpError(429, "too_many_attempts", `Too many attempts. Try again in ${WINDOW_MIN} minutes.`);

  const ok = typeof password === "string" && password.length > 0 && password.length <= 200 && (await verifyPassword(password, passwordHash(env)));
  await db.batch([
    db.prepare("INSERT INTO admin_login_attempts (ip, success) VALUES (?1, ?2)").bind(ip, ok ? 1 : 0),
    db.prepare("DELETE FROM admin_login_attempts WHERE created_at < datetime('now', '-7 days')"),
  ]);
  if (!ok) throw new HttpError(401, "bad_password", "Wrong password.");

  const exp = Math.floor(Date.now() / 1000) + SESSION_HOURS * 3600;
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(12)));
  const payload = `v1.${exp}.${nonce}`;
  const value = `${payload}.${await hmac(sessionSecret(env), payload)}`;
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`;
}

export const logoutCookie = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

/** True when the request carries a valid, unexpired session cookie. */
export async function hasValidSession(request: Request, env: Env): Promise<boolean> {
  if (!passwordLoginConfigured(env)) return false;
  const cookie = request.headers.get("Cookie") ?? "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!m) return false;
  const parts = m[1].split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const [v, exp, nonce, sig] = parts;
  if (!(Number(exp) > Math.floor(Date.now() / 1000))) return false;
  return safeEqual(sig, await hmac(sessionSecret(env), `${v}.${exp}.${nonce}`));
}
