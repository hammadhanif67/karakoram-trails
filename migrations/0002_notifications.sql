-- Notification outbox bookkeeping for booking_events (stage 4).
-- webhook_sent / email_sent: 0 = pending, 1 = sent, 2 = not applicable or not configured.
ALTER TABLE booking_events ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE booking_events ADD COLUMN last_error TEXT;
CREATE INDEX booking_events_outbox ON booking_events(id) WHERE webhook_sent = 0 OR email_sent = 0;
