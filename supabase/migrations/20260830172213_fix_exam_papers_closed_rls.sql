BEGIN;

DROP POLICY IF EXISTS "Students read live exams" ON exam_papers;

CREATE POLICY "Students read live exams" ON exam_papers
FOR SELECT
USING (
  status IN ('LIVE', 'CLOSED') AND
  institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
);

COMMIT;
