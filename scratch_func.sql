CREATE OR REPLACE FUNCTION check_answer_key_released(p_submission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_released BOOLEAN;
BEGIN
  SELECT ep.answer_key_released INTO v_released
  FROM submissions s
  JOIN exam_papers ep ON s.paper_id = ep.id
  WHERE s.id = p_submission_id;
  
  RETURN COALESCE(v_released, false);
END;
$$;

DROP POLICY IF EXISTS "Students answers" ON "public"."student_answers";

CREATE POLICY "Students answers" ON "public"."student_answers"
AS PERMISSIVE FOR SELECT
TO public
USING (
  check_answer_key_released(submission_id)
);
