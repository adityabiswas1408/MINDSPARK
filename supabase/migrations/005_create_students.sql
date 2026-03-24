CREATE TABLE IF NOT EXISTS students (
  id                     UUID         PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  level_id               UUID         NOT NULL REFERENCES levels(id) ON DELETE RESTRICT,
  cohort_id              UUID         NOT NULL REFERENCES cohorts(id) ON DELETE RESTRICT,
  full_name              TEXT         NOT NULL,
  roll_number            TEXT,
  grade_section          TEXT,
  dob                    DATE,
  gender                 TEXT         CHECK (gender IN ('M','F','Other')),
  guardian_name          TEXT,
  guardian_email         TEXT,
  guardian_phone         TEXT,
  id_card_url            TEXT,
  device_id              TEXT         UNIQUE,
  created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS students_cohort_idx ON students (cohort_id);
CREATE INDEX IF NOT EXISTS students_level_idx ON students (level_id);
