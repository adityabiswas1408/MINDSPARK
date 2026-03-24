CREATE TABLE IF NOT EXISTS assessment_session_questions (
  session_id     UUID         NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id    UUID         NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  question_type  TEXT         NOT NULL,
  question_text  TEXT         NOT NULL,
  options        JSONB,
  correct_answer JSONB        NOT NULL,
  marks          INTEGER      NOT NULL,
  order_index    INTEGER      NOT NULL,
  PRIMARY KEY (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS assess_sess_quest_type_idx ON assessment_session_questions (question_type);
