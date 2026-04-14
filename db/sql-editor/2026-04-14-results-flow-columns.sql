-- Run via Supabase SQL editor on project ahrnkwuqlhmwenhvnupb.
-- Spec: docs/superpowers/specs/2026-04-14-student-results-flow-design.md
-- Date: 2026-04-14

-- ─── Gate B: per-paper answer-key release ──────────────────────────────────
ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS answer_key_released BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS answer_key_released_at TIMESTAMPTZ NULL;

ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS answer_key_released_by UUID NULL REFERENCES profiles(id);

-- ─── Got/total denominator on submissions ──────────────────────────────────
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS total_questions INT NOT NULL DEFAULT 0;

-- ─── Backfill: count questions per paper for existing rows ────────────────
UPDATE submissions s
SET total_questions = (
  SELECT COUNT(*) FROM questions q WHERE q.paper_id = s.paper_id
)
WHERE total_questions = 0;

-- ─── Verification ─────────────────────────────────────────────────────────
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exam_papers'
  AND column_name IN ('answer_key_released','answer_key_released_at','answer_key_released_by')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'submissions' AND column_name = 'total_questions';

-- Backfill check — should report 0 rows where the join produced a positive count
-- but the column is still 0
SELECT COUNT(*) AS unbackfilled
FROM submissions s
WHERE total_questions = 0
  AND EXISTS (SELECT 1 FROM questions q WHERE q.paper_id = s.paper_id);
