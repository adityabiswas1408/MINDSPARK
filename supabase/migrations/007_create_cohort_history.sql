CREATE TABLE IF NOT EXISTS cohort_history (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  cohort_id        UUID         NOT NULL REFERENCES cohorts(id) ON DELETE RESTRICT,
  valid_from       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  valid_to         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cohort_history_student_idx ON cohort_history (student_id);
