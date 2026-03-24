CREATE TABLE IF NOT EXISTS questions (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id       UUID         NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
  question_type  TEXT         NOT NULL CHECK (question_type IN ('mcq','fill_blank','flash_anzan')),
  question_text  TEXT         NOT NULL,
  options        JSONB,
  correct_answer JSONB        NOT NULL,
  marks          INTEGER      NOT NULL DEFAULT 1 CHECK (marks > 0),
  order_index    INTEGER      NOT NULL CHECK (order_index >= 0),
  metadata       JSONB,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ,
  UNIQUE (paper_id, order_index)
);

CREATE INDEX IF NOT EXISTS questions_paper_idx ON questions (paper_id);
