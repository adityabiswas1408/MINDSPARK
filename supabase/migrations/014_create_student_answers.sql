CREATE TABLE IF NOT EXISTS student_answers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id    UUID        NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id      UUID        NOT NULL REFERENCES questions(id),
  idempotency_key  UUID        NOT NULL UNIQUE,
  selected_option  TEXT        CHECK (selected_option IN ('A','B','C','D')),
  is_correct       BOOLEAN,
  answered_at      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, question_id)
) WITH (fillfactor = 80);

CREATE INDEX IF NOT EXISTS student_answers_submission_idx ON student_answers (submission_id);
