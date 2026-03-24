CREATE TABLE IF NOT EXISTS exam_papers (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id    UUID         NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  level_id          UUID         NOT NULL REFERENCES levels(id) ON DELETE RESTRICT,
  created_by        UUID         NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  title             TEXT         NOT NULL,
  description       TEXT,
  duration_minutes  INTEGER      NOT NULL CHECK (duration_minutes > 0),
  total_marks       INTEGER      NOT NULL DEFAULT 0 CHECK (total_marks >= 0),
  pass_percentage   NUMERIC      CHECK (pass_percentage BETWEEN 0 AND 100),
  status            TEXT         NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS exam_papers_institution_idx ON exam_papers (institution_id);
CREATE INDEX IF NOT EXISTS exam_papers_level_idx ON exam_papers (level_id);
