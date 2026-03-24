CREATE TABLE IF NOT EXISTS submissions (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID         NOT NULL REFERENCES assessment_sessions(id) ON DELETE RESTRICT,
  student_id       UUID         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score            INTEGER      NOT NULL DEFAULT 0,
  percentage       NUMERIC      DEFAULT 0 CHECK (percentage BETWEEN 0 AND 100),
  grade            TEXT,
  sync_status      TEXT         NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced','pending','error')),
  idempotency_key  UUID         UNIQUE,
  completed_at     TIMESTAMPTZ,
  result_published_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
) WITH (fillfactor = 80);

CREATE UNIQUE INDEX IF NOT EXISTS submissions_session_student_idx ON submissions (session_id, student_id);
CREATE INDEX IF NOT EXISTS submissions_student_idx ON submissions (student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_pending ON submissions (updated_at) WHERE completed_at IS NULL;
