CREATE TABLE IF NOT EXISTS levels (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id   UUID         NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  name             TEXT         NOT NULL,
  sequence_order   INTEGER      NOT NULL CHECK (sequence_order > 0),
  description      TEXT,
  min_days_required INTEGER,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  UNIQUE (institution_id, sequence_order)
);

CREATE INDEX IF NOT EXISTS levels_institution_order_idx ON levels (institution_id, sequence_order);
CREATE INDEX IF NOT EXISTS levels_not_deleted_idx ON levels (institution_id) WHERE deleted_at IS NULL;
