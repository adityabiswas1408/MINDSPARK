-- Run via Supabase SQL editor on project ahrnkwuqlhmwenhvnupb.
-- Spec: docs/superpowers/specs/2026-04-14-student-profile-design.md
-- Date: 2026-04-14

-- ─── Pre-flight (already verified 2026-04-14, repeat before applying) ──
SELECT COUNT(*) AS missing_roll
FROM students
WHERE (roll_number IS NULL OR roll_number = '')
  AND deleted_at IS NULL;
-- Expected: 0

-- ─── Apply ────────────────────────────────────────────────────────────
ALTER TABLE students ALTER COLUMN roll_number SET NOT NULL;

-- ─── Verification ─────────────────────────────────────────────────────
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'roll_number';
-- Expected: roll_number | text | NO
