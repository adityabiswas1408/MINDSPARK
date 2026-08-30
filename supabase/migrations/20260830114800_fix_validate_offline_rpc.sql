-- Drop any existing variants to avoid signature conflicts
DROP FUNCTION IF EXISTS validate_and_migrate_offline_submission(JSONB);
DROP FUNCTION IF EXISTS validate_and_migrate_offline_submission(UUID);
DROP FUNCTION IF EXISTS validate_and_migrate_offline_submission(UUID, TEXT, BIGINT, TEXT);

-- Redefine the RPC to match the arguments passed from Node route (1-param)
-- This restores the is_correct computation missing from 027
CREATE OR REPLACE FUNCTION public.validate_and_migrate_offline_submission(
  p_staging_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staging_row RECORD;
  v_answer_obj JSONB;
  v_written_count INT := 0;
  v_question_id UUID;
  v_selected_option TEXT;
  v_correct_option TEXT;
  v_is_correct BOOLEAN;
  v_answered_at TIMESTAMPTZ;
  v_time_spent_ms INT;
  v_submission_id UUID;
BEGIN
  -- 1. Fetch the staging row
  SELECT * INTO v_staging_row
  FROM offline_submissions_staging
  WHERE id = p_staging_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'STAGING_NOT_FOUND');
  END IF;

  v_submission_id := (v_staging_row.payload->>'submission_id')::UUID;

  -- 2. Migrate answers from JSON payload to student_answers
  FOR v_answer_obj IN SELECT * FROM jsonb_array_elements(v_staging_row.payload->'answers')
  LOOP
    BEGIN
      v_question_id := (v_answer_obj->>'question_id')::UUID;
      v_selected_option := v_answer_obj->>'selected_option';

      -- Compute is_correct server-side
      SELECT correct_option INTO v_correct_option
      FROM questions
      WHERE id = v_question_id;

      v_is_correct := (
          v_correct_option IS NOT NULL
          AND v_selected_option IS NOT NULL
          AND v_correct_option = v_selected_option
      );

      v_answered_at := COALESCE(
          to_timestamp(((v_answer_obj->>'answered_at')::BIGINT) / 1000.0),
          NOW()
      );

      v_time_spent_ms := COALESCE((v_answer_obj->>'time_spent_ms')::INT, 0);

      INSERT INTO student_answers (
        submission_id,
        question_id,
        selected_option,
        answered_at,
        time_spent_ms,
        idempotency_key,
        is_correct
      ) VALUES (
        v_submission_id,
        v_question_id,
        v_selected_option,
        v_answered_at,
        v_time_spent_ms,
        (v_answer_obj->>'idempotency_key')::UUID,
        v_is_correct
      )
      ON CONFLICT (idempotency_key) DO NOTHING;

      v_written_count := v_written_count + 1;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END LOOP;

  -- 3. Mark staging row as processed
  UPDATE offline_submissions_staging
  SET status = 'processed', completed_at = NOW(), updated_at = NOW()
  WHERE id = p_staging_id;

  RETURN jsonb_build_object('status', 'success', 'answers_written', v_written_count);

EXCEPTION WHEN OTHERS THEN
  UPDATE offline_submissions_staging
  SET status = 'error', error_message = SQLERRM, updated_at = NOW()
  WHERE id = p_staging_id;
  RETURN jsonb_build_object('status', 'error', 'reason', SQLERRM);
END;
$$;
