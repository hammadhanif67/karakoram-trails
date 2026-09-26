// Cloudflare Access authentication for the admin area.
// Access blocks unauthenticated visitors at the edge; this code additionally verifies the signed
// Cf-Access-Jwt-Assertion on every request (signature, audience, issuer, expiry) and checks the email
// against ADMIN_EMAILS, so the admin never depends on the dashboard policy alone.
import { list, type Env } from "./env";
import { HttpError } from "./http";

type Jwk = JsonWebKey & { kid: string };
type Claims = { aud?: string | string[]; iss?: string; exp?: number; nbf?: number; email?: string };

let certCache: { team: string; keys: Jwk[]; fetchedAt: number } | null = null;
const CERT_TTL_MS = 60 * 60 * 1000;

async function accessKeys(team: string, force = false): Promise<Jwk[]> {
  if (!force && certCache && certCache.team === team && Date.now() - certCache.fetchedAt < CERT_TTL_MS) return certCache.keys;
  const r = await fetch(`https://${team}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(10_000) });
  if (!r.ok) throw new Error(`Access certs ${r.status}`);
  const { keys } = (await r.json()) as { keys: Jwk[] };
  certCache = { team, keys, fetchedAt: Date.now() };
  return keys;
}

const b64urlToBytes = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function verifyJwt(token: string, env: Env): Promise<Claims> {
  const team = (env.ACCESS_TEAM_DOMAIN ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) throw new Error("malformed token");
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h))) as { alg?: string; kid?: string };
  if (header.alg !== "RS256" || !header.kid) throw new Error("unexpected token header");

  let key = (await accessKeys(team)).find((k) => k.kid === header.kid);
  if (!key) key = (await accessKeys(team, true)).find((k) => k.kid === header.kid); // keys rotate
  if (!key) throw new Error("unknown signing key");

  const cryptoKey = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, b64urlToBytes(s), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) throw new Error("bad signature");

  const claims = JSON.parse(new TextDecoder().decode(b64urlToBytes(p))) as Claims;
  const now = Math.floor(Date.now() / 1000);
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(env.ACCESS_AUD)) throw new Error("wrong audience");
  if (claims.iss !== `https://${team}`) throw new Error("wrong issuer");
  if (!claims.exp || claims.exp < now - 30) throw new Error("expired");
  if (claims.nbf && claims.nbf > now + 30) throw new Error("not yet valid");
  return claims;
}

export type Admin = { email: string };

/** Returns the signed-in admin or throws 401/403. */
export async function requireAdmin(request: Request, env: Env): Promise<Admin> {
  const allowed = list(env.ADMIN_EMAILS);
  const host = new URL(request.url).hostname;

  // Local development only: never honoured on a real hostname, even if the variable is set.
  if (env.ADMIN_DEV_EMAIL && (host === "127.0.0.1" || host === "localhost")) {
    const email = env.ADMIN_DEV_EMAIL.trim().toLowerCase();
    if (!allowed.includes(email)) throw new HttpError(403, "forbidden", "Not an admin.");
    return { email };
  }

  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || allowed.length === 0) {
    console.error("Admin is not configured (ACCESS_TEAM_DOMAIN / ACCESS_AUD / ADMIN_EMAILS)");
    throw new HttpError(503, "not_configured", "Admin is not configured.");
  }
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) throw new HttpError(401, "unauthenticated", "Sign in through Cloudflare Access.");
  let claims: Claims;
  try {
    claims = await verifyJwt(token, env);
  } catch (err) {
    console.warn("Access token rejected:", (err as Error).message);
    throw new HttpError(401, "unauthenticated", "Your admin session is invalid or expired. Reload to sign in again.");
  }
  const email = (claims.email ?? "").toLowerCase();
  if (!email || !allowed.includes(email)) throw new HttpError(403, "forbidden", "This account is not an admin.");
  return { email };
}
