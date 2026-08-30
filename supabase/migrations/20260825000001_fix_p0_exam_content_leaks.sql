-- ==============================================================================
-- P0: FIX EXAM CONTENT LEAKAGE
-- Drop global read policies that allowed any student to read any live exam
-- and recreate them with strict institution_id scoping.
-- ==============================================================================

-- 1. EXAM PAPERS
DROP POLICY IF EXISTS "Students read live exams" ON exam_papers;
DROP POLICY IF EXISTS "Students read published exams" ON exam_papers;

CREATE POLICY "Students read live exams" ON exam_papers
FOR SELECT
USING (
  status = 'LIVE' AND
  institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
);

CREATE POLICY "Students read published exams" ON exam_papers
FOR SELECT
USING (
  status = 'PUBLISHED' AND
  institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
);

-- 2. QUESTIONS
DROP POLICY IF EXISTS "Students read live questions" ON questions;

CREATE POLICY "Students read live questions" ON questions
FOR SELECT
USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role') = 'student' AND
  paper_id IN (
    SELECT id FROM exam_papers 
    WHERE status IN ('LIVE', 'CLOSED') 
    AND institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
  )
);
