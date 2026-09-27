-- Audit log for the admin departures/prices editor. Append-only: the app only ever INSERTs here.
CREATE TABLE admin_events (
  id          INTEGER PRIMARY KEY,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  actor       TEXT NOT NULL,              -- admin email (Cloudflare Access) or "admin" (password login)
  action      TEXT NOT NULL,              -- departure_added | seats_changed | departure_closed | departure_reopened | price_changed
  entity      TEXT NOT NULL,              -- departure | tour
  entity_id   TEXT NOT NULL,              -- departures.id or tours.slug
  old_value   TEXT,                       -- JSON
  new_value   TEXT,                       -- JSON
  note        TEXT                        -- JSON: extra context (season warnings acknowledged, active bookings at close)
);
CREATE INDEX admin_events_created ON admin_events(created_at);
