CREATE TABLE IF NOT EXISTS activity_logs (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  UUID         NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  user_id         UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  action_type     TEXT         NOT NULL,
  entity_type     TEXT         NOT NULL,
  entity_id       UUID,
  metadata        JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  timestamp       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Note: BRIN index on timestamp will be created in 021_create_indexes.sql
CREATE INDEX IF NOT EXISTS activity_logs_inst_idx ON activity_logs (institution_id);
CREATE INDEX IF NOT EXISTS activity_logs_user_idx ON activity_logs (user_id);
