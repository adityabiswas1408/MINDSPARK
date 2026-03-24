CREATE TABLE IF NOT EXISTS grade_boundaries (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  UUID         NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  grade_name      TEXT         NOT NULL,
  min_percentage  NUMERIC      NOT NULL CHECK (min_percentage BETWEEN 0 AND 100),
  color_hex       TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, min_percentage)
);

CREATE INDEX IF NOT EXISTS grade_boundaries_inst_idx ON grade_boundaries (institution_id);
