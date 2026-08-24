-- Fix for trigger crash on student_answers (update_student_answers_modtime)
-- The trigger attempts to set NEW.updated_at = NOW(), but the column was missing.
ALTER TABLE student_answers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
