CREATE TABLE IF NOT EXISTS teachers (
  id               UUID         PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  full_name        TEXT         NOT NULL,
  employee_id      TEXT,
  designation      TEXT,
  specialization   TEXT[],
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);
