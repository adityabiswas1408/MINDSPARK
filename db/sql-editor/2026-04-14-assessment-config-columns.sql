-- Run via Supabase SQL editor on project ahrnkwuqlhmwenhvnupb.
-- Spec: docs/superpowers/specs/2026-04-14-student-assessment-taking-flow-design.md
-- Date: 2026-04-14

-- ─── exam_papers: per-question timer + confirm-button toggle ──────────────
ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS per_question_time_seconds INT NULL
    CHECK (per_question_time_seconds IS NULL OR per_question_time_seconds BETWEEN 5 AND 600);

ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS require_answer_confirmation BOOLEAN NOT NULL DEFAULT TRUE;

-- ─── student_answers: per-question elapsed-time capture ───────────────────
-- Defaults to 0 for existing rows (they pre-date the timing feature).
-- No backfill required.
ALTER TABLE student_answers
  ADD COLUMN IF NOT EXISTS time_spent_ms INT NOT NULL DEFAULT 0;

-- ─── Verification ─────────────────────────────────────────────────────────
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exam_papers'
  AND column_name IN ('per_question_time_seconds', 'require_answer_confirmation')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'student_answers' AND column_name = 'time_spent_ms';
