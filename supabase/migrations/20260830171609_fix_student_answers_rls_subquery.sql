BEGIN;

-- Drop the current policy that relied on direct access to submissions
DROP POLICY IF EXISTS "Students answers" ON "public"."student_answers";

-- Re-create it using the secure view which the student HAS SELECT access to
CREATE POLICY "Students answers" ON "public"."student_answers"
AS PERMISSIVE FOR SELECT
TO public
USING (
  submission_id IN (
    SELECT s.id FROM student_submissions_view s
    JOIN exam_papers ep ON s.paper_id = ep.id
    WHERE ep.answer_key_released = true
  )
);

COMMIT;
