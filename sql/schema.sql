-- Neon DB / PostgreSQL schema  (multi-poll)
-- Run once: node scripts/migrate.mjs

-- ── Polls ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS polls (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    status       VARCHAR(10)  NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open','closed')),
    multi_choice BOOLEAN      NOT NULL DEFAULT FALSE,
    hidden       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  DEFAULT NOW(),
    closed_at    TIMESTAMPTZ
);

-- ── Options per poll ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS poll_options (
    id       SERIAL  PRIMARY KEY,
    poll_id  INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    text     VARCHAR(200) NOT NULL,
    position SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options (poll_id);

-- ── Dedup: one vote per user per poll ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS poll_voters (
    poll_id    INTEGER  NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    email_hash CHAR(64) NOT NULL,
    PRIMARY KEY (poll_id, email_hash)
);

-- ── Vote records ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS poll_votes (
    id         SERIAL  PRIMARY KEY,
    poll_id    INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id  INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_option ON poll_votes (option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll   ON poll_votes (poll_id);

-- ── Seed poll #1 ──────────────────────────────────────────────────────────────
INSERT INTO polls (id, title, status) VALUES
  (1, 'Mecanismo de movilización', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO poll_options (poll_id, text, position) VALUES
  (1, 'Anormalidad Académica', 0),
  (1, 'Asamblea Escalonada',   1),
  (1, 'Asamblea Permanente',   2),
  (1, 'Paro',                  3),
  (1, 'Normalidad',            4)
ON CONFLICT DO NOTHING;
