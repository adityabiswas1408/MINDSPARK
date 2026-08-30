-- 028_secure_results_rls.sql
BEGIN;

-- 1. Fix student_answers RLS (Answer Sheet Gate)
DROP POLICY IF EXISTS "Students answers" ON "public"."student_answers";

CREATE POLICY "Students answers" ON "public"."student_answers"
AS PERMISSIVE FOR SELECT
TO public
USING (
  submission_id IN (
    SELECT s.id FROM submissions s
    JOIN exam_papers ep ON s.paper_id = ep.id
    WHERE s.student_id = auth.uid()
    AND ep.answer_key_released = true
  )
);

-- 2. Fix submissions RLS (Score Gate)
-- Create a secure view that redacts score/grade/percentage before result_published_at
CREATE OR REPLACE VIEW public.student_submissions_view AS
SELECT 
    id,
    session_id,
    student_id,
    paper_id,
    CASE WHEN result_published_at IS NOT NULL THEN score ELSE NULL END AS score,
    CASE WHEN result_published_at IS NOT NULL THEN percentage ELSE NULL END AS percentage,
    CASE WHEN result_published_at IS NOT NULL THEN grade ELSE NULL END AS grade,
    sync_status,
    idempotency_key,
    created_at,
    updated_at,
    completed_at,
    total_questions,
    dpm,
    result_published_at
FROM public.submissions
WHERE student_id = auth.uid();

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.student_submissions_view TO authenticated;

-- Remove student direct SELECT access to raw submissions
DROP POLICY IF EXISTS "Students select own submissions" ON "public"."submissions";

COMMIT;
