// Notifications outbox (stage 4). booking_events rows are the queue: each has telegram_sent /
// webhook_sent / email_sent (0 pending, 1 sent, 2 not applicable or not configured).
// Telegram: admin alerts. n8n webhook: optional, skipped while N8N_WEBHOOK_URL is empty.
// Email: customer emails, off until an email provider is configured (server/email/provider.ts). deliverPending() runs after a response with
// waitUntil, sends what is pending, and records failures for up to MAX_ATTEMPTS tries. Payloads carry
// the event id so n8n can ignore a duplicate if two deliveries ever overlap.
import { emailProvider } from "./email/provider";
import { emailFor, type EmailBooking } from "./email-templates";
import { sendTelegram, telegramConfigured, telegramText } from "./telegram";
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
  telegram_sent: number;
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

const webhookConfigured = (env: Env) => !!(env.N8N_WEBHOOK_URL && env.N8N_WEBHOOK_SECRET);

/** Sends pending notifications. With includeFailed, also retries events that used up their attempts. */
export async function deliverPending(env: Env, opts: { includeFailed?: boolean; limit?: number } = {}) {
  const db = env.DB;
  const { results } = await db
    .prepare(
      `SELECT e.id, e.type, e.actor, e.data, e.created_at, e.webhook_sent, e.email_sent, e.telegram_sent, e.attempts,
              b.ref, b.access_token, b.status, b.travellers, b.lead_name, b.email, b.phone, b.notes,
              b.total_pkr, b.deposit_pkr, b.deposit_percent, b.payment_method, b.hold_expires_at,
              d.start_date, t.name AS tour_name
         FROM booking_events e JOIN bookings b ON b.id = e.booking_id
         JOIN departures d ON d.id = b.departure_id JOIN tours t ON t.id = d.tour_id
        WHERE (e.webhook_sent = 0 OR e.email_sent = 0 OR e.telegram_sent = 0) ${opts.includeFailed ? "" : "AND e.attempts < ?1"}
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

    let telegram = e.telegram_sent;
    if (telegram === 0) {
      const text = telegramText(e, env);
      if (!text || !telegramConfigured(env)) telegram = 2;
      else {
        try {
          await sendTelegram(env, text);
          telegram = 1;
        } catch (err) {
          errors.push(`telegram: ${(err as Error).message}`);
        }
      }
    }

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
      const provider = emailProvider(env);
      const messages = provider ? emailFor(e, env) : [];
      if (!provider || messages.length === 0) email = 2;
      else {
        try {
          for (const m of messages) await provider.send(m);
          email = 1;
        } catch (err) {
          errors.push(`email: ${(err as Error).message}`);
        }
      }
    }

    await db
      .prepare("UPDATE booking_events SET webhook_sent = ?2, email_sent = ?3, telegram_sent = ?4, last_error = ?5 WHERE id = ?1")
      .bind(e.id, webhook, email, telegram, errors.length ? errors.join("; ").slice(0, 300) : null)
      .run();
    if (errors.length) {
      summary.failed++;
      console.error(`notification for event ${e.id} (${e.ref} ${e.type}) failed:`, errors.join("; "));
    } else summary.sent++;
  }
  return summary;
}

