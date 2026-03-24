CREATE TABLE IF NOT EXISTS offline_submissions_staging (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id      UUID         NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  payload             JSONB        NOT NULL,
  status              TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processed','error')),
  error_message       TEXT,
  processing_started_at TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS offline_staging_inst_status_idx ON offline_submissions_staging (institution_id, status);
CREATE INDEX IF NOT EXISTS offline_staging_status_idx ON offline_submissions_staging (status) WHERE status = 'pending';
