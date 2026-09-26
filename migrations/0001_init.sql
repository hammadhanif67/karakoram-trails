-- Karakoram Trails booking schema. D1 (SQLite).
-- D1 is the single source of truth for tour prices, departures and seats; the site's content.ts
-- keeps only a build-time fallback copy (checked by `npm run db:check`).

CREATE TABLE tours (
  id         INTEGER PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,           -- matches content.ts (hunza-escape, ...)
  name       TEXT NOT NULL,
  price_pkr  INTEGER NOT NULL CHECK (price_pkr > 0),  -- per person, whole rupees; one price per tour
  active     INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE departures (
  id            INTEGER PRIMARY KEY,
  tour_id       INTEGER NOT NULL REFERENCES tours(id),
  start_date    TEXT NOT NULL,                -- ISO date (YYYY-MM-DD), Pakistan time
  seats_total   INTEGER NOT NULL CHECK (seats_total > 0),
  seats_booked  INTEGER NOT NULL DEFAULT 0 CHECK (seats_booked >= 0),  -- confirmed (incl. offline bookings)
  seats_held    INTEGER NOT NULL DEFAULT 0 CHECK (seats_held >= 0),    -- pending_payment + verifying
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  CHECK (seats_booked + seats_held <= seats_total),
  UNIQUE (tour_id, start_date)
);
CREATE INDEX departures_open ON departures(status, start_date);

CREATE TABLE bookings (
  id               INTEGER PRIMARY KEY,       -- ref = 'KT-' || (1000 + id)
  ref              TEXT NOT NULL UNIQUE,
  access_token     TEXT NOT NULL,             -- random; lets the customer view their own booking
  departure_id     INTEGER NOT NULL REFERENCES departures(id),
  status           TEXT NOT NULL DEFAULT 'pending_payment'
                   CHECK (status IN ('pending_payment', 'verifying', 'confirmed', 'cancelled')),
  travellers       INTEGER NOT NULL CHECK (travellers BETWEEN 1 AND 12),
  lead_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  notes            TEXT,
  total_pkr        INTEGER NOT NULL,          -- price x travellers, frozen at booking time
  deposit_percent  INTEGER NOT NULL,          -- frozen from DEPOSIT_PERCENT at booking time
  deposit_pkr      INTEGER NOT NULL,
  payment_method   TEXT NOT NULL,             -- 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'card'
  terms_version    TEXT NOT NULL,             -- which terms / booking conditions were accepted
  hold_expires_at  TEXT,                      -- only enforced while status = 'pending_payment'
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX bookings_status ON bookings(status, created_at);
CREATE INDEX bookings_departure ON bookings(departure_id);
-- Finds expired holds quickly. 'verifying' bookings never auto-expire.
CREATE INDEX bookings_hold ON bookings(hold_expires_at) WHERE status = 'pending_payment';

CREATE TABLE payments (
  id               INTEGER PRIMARY KEY,
  booking_id       INTEGER NOT NULL REFERENCES bookings(id),
  provider         TEXT NOT NULL,
  amount_pkr       INTEGER NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('initiated', 'submitted', 'succeeded', 'failed', 'refunded')),
  provider_txn_id  TEXT,                      -- unique per provider: makes callbacks idempotent
  receipt_key      TEXT,                      -- R2 object key (bank transfer)
  raw_callback     TEXT,                      -- verified provider payload, for audit
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (provider, provider_txn_id)
);
CREATE INDEX payments_booking ON payments(booking_id);

CREATE TABLE booking_events (                 -- audit trail + outbox for n8n / email retries
  id            INTEGER PRIMARY KEY,
  booking_id    INTEGER NOT NULL REFERENCES bookings(id),
  type          TEXT NOT NULL,                -- created, receipt_uploaded, confirmed, cancelled, hold_expired
  actor         TEXT NOT NULL,                -- customer | admin | system | provider id
  data          TEXT,                         -- JSON
  webhook_sent  INTEGER NOT NULL DEFAULT 0,
  email_sent    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX booking_events_booking ON booking_events(booking_id);
