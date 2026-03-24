CREATE TABLE IF NOT EXISTS cohorts (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id   UUID         NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  name             TEXT         NOT NULL,
  status           TEXT         NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS cohorts_institution_status_idx ON cohorts (institution_id, status);
