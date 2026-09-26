// Email provider interface. Customer emails are sent through whichever provider is configured;
// with no EMAIL_API_KEY there is no provider and email stays switched off (events are marked n/a).
import type { Env } from "../env";

export type EmailMessage = { to: string; subject: string; html: string; text: string };

export interface EmailProvider {
  readonly id: string;
  send(msg: EmailMessage): Promise<void>;
}

/** Resend (https://resend.com). MAIL_FROM must be on a domain verified in Resend. */
function resend(env: Env): EmailProvider {
  return {
    id: "resend",
    async send(msg) {
      const r = await fetch(env.EMAIL_API_URL || "https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.MAIL_FROM, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!r.ok) throw new Error(`email HTTP ${r.status}`);
    },
  };
}

/** The configured provider, or null while email is disabled. Add other providers here. */
export function emailProvider(env: Env): EmailProvider | null {
  if (!env.EMAIL_API_KEY || !env.MAIL_FROM || !env.PUBLIC_SITE_URL) return null;
  return resend(env);
}
