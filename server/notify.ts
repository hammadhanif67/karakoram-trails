// Notifications outbox (stage 4). booking_events rows are the queue: each has webhook_sent / email_sent
// (0 pending, 1 sent, 2 not applicable / not configured). deliverPending() runs after a response with
// waitUntil, sends what is pending, and records failures for up to MAX_ATTEMPTS tries. Payloads carry
// the event id so n8n can ignore a duplicate if two deliveries ever overlap.
import { emailFor, type EmailBooking } from "./email-templates";
import type { Env } from "./env";

const MAX_ATTEMPTS = 5;

type EventRow = {
  id: number;
  type: string;
  actor: string;
  data: string | null;
  created_at: string;
  webhook_sent: number;
  email_sent: number;
  attempts: number;
} & EmailBooking;

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendWebhook(env: Env, e: EventRow) {
  const body = JSON.stringify({
    eventId: e.id,
    event: `booking.${e.type}`,
    actor: e.actor,
    occurredAt: `${e.created_at.replace(" ", "T")}Z`,
    data: e.data ? JSON.parse(e.data) : null,
    booking: {
      ref: e.ref,
      status: e.status,
      tour: e.tour_name,
      date: e.start_date,
      travellers: e.travellers,
      leadName: e.lead_name,
      email: e.email,
      phone: e.phone,
      notes: e.notes,
      totalPkr: e.total_pkr,
      depositPkr: e.deposit_pkr,
      paymentMethod: e.payment_method,
    },
  });
  const ts = Math.floor(Date.now() / 1000).toString();
  const r = await fetch(env.N8N_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-KT-Event": `booking.${e.type}`,
      "X-KT-Timestamp": ts,
      // n8n: recompute HMAC-SHA256(secret, `${timestamp}.${rawBody}`) and compare; reject old timestamps.
      "X-KT-Signature": `sha256=${await hmacHex(env.N8N_WEBHOOK_SECRET!, `${ts}.${body}`)}`,
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`webhook HTTP ${r.status}`);
}

async function sendEmail(env: Env, to: string, msg: { subject: string; html: string; text: string }) {
  const r = await fetch(env.EMAIL_API_URL || "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject: msg.subject, html: msg.html, text: msg.text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`email HTTP ${r.status}`);
}

const webhookConfigured = (env: Env) => !!(env.N8N_WEBHOOK_URL && env.N8N_WEBHOOK_SECRET);
const emailConfigured = (env: Env) => !!(env.EMAIL_API_KEY && env.MAIL_FROM);

/** Sends pending notifications. With includeFailed, also retries events that used up their attempts. */
export async function deliverPending(env: Env, opts: { includeFailed?: boolean; limit?: number } = {}) {
  const db = env.DB;
  const { results } = await db
    .prepare(
      `SELECT e.id, e.type, e.actor, e.data, e.created_at, e.webhook_sent, e.email_sent, e.attempts,
              b.ref, b.access_token, b.status, b.travellers, b.lead_name, b.email, b.phone, b.notes,
              b.total_pkr, b.deposit_pkr, b.deposit_percent, b.payment_method, b.hold_expires_at,
              d.start_date, t.name AS tour_name
         FROM booking_events e JOIN bookings b ON b.id = e.booking_id
         JOIN departures d ON d.id = b.departure_id JOIN tours t ON t.id = d.tour_id
        WHERE (e.webhook_sent = 0 OR e.email_sent = 0) ${opts.includeFailed ? "" : "AND e.attempts < ?1"}
        ORDER BY e.id LIMIT ${Math.min(opts.limit ?? 20, 50)}`,
    )
    .bind(...(opts.includeFailed ? [] : [MAX_ATTEMPTS]))
    .all<EventRow>();

  const summary = { processed: 0, sent: 0, failed: 0 };
  for (const e of results) {
    // Claim the row (optimistic): skip it if another delivery run got there first.
    const claim = await db.prepare("UPDATE booking_events SET attempts = attempts + 1 WHERE id = ?1 AND attempts = ?2").bind(e.id, e.attempts).run();
    if (claim.meta.changes !== 1) continue;
    summary.processed++;
    const errors: string[] = [];

    let webhook = e.webhook_sent;
    if (webhook === 0) {
      if (!webhookConfigured(env)) webhook = 2;
      else {
        try {
          await sendWebhook(env, e);
          webhook = 1;
        } catch (err) {
          errors.push(`webhook: ${(err as Error).message}`);
        }
      }
    }

    let email = e.email_sent;
    if (email === 0) {
      const messages = emailFor(e, env);
      if (messages.length === 0) email = 2;
      else if (!emailConfigured(env)) email = 2;
      else {
        try {
          for (const m of messages) await sendEmail(env, m.to, m);
          email = 1;
        } catch (err) {
          errors.push(`email: ${(err as Error).message}`);
        }
      }
    }

    await db
      .prepare("UPDATE booking_events SET webhook_sent = ?2, email_sent = ?3, last_error = ?4 WHERE id = ?1")
      .bind(e.id, webhook, email, errors.length ? errors.join("; ").slice(0, 300) : null)
      .run();
    if (errors.length) {
      summary.failed++;
      console.error(`notification for event ${e.id} (${e.ref} ${e.type}) failed:`, errors.join("; "));
    } else summary.sent++;
  }
  return summary;
}

