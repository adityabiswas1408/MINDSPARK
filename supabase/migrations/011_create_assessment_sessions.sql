CREATE TABLE IF NOT EXISTS assessment_sessions (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id       UUID         NOT NULL REFERENCES exam_papers(id) ON DELETE RESTRICT,
  cohort_id      UUID         NOT NULL REFERENCES cohorts(id) ON DELETE RESTRICT,
  scheduled_at   TIMESTAMPTZ  NOT NULL,
  expires_at     TIMESTAMPTZ  NOT NULL,
  status         TEXT         NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','active','completed','cancelled')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ,
  CHECK (expires_at > scheduled_at)
);

CREATE INDEX IF NOT EXISTS assessment_sessions_paper_idx ON assessment_sessions (paper_id);
CREATE INDEX IF NOT EXISTS assessment_sessions_cohort_idx ON assessment_sessions (cohort_id);
