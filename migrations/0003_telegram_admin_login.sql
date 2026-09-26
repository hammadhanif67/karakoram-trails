-- Telegram admin alerts (0 pending, 1 sent, 2 not applicable / not configured) and admin login throttling.
ALTER TABLE booking_events ADD COLUMN telegram_sent INTEGER NOT NULL DEFAULT 0;
DROP INDEX IF EXISTS booking_events_outbox;
CREATE INDEX booking_events_outbox ON booking_events(id) WHERE webhook_sent = 0 OR email_sent = 0 OR telegram_sent = 0;

CREATE TABLE admin_login_attempts (
  id          INTEGER PRIMARY KEY,
  ip          TEXT NOT NULL,
  success     INTEGER NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX admin_login_attempts_ip ON admin_login_attempts(ip, created_at);
