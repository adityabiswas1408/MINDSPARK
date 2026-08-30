-- Add missing columns to offline_submissions_staging
ALTER TABLE offline_submissions_staging
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS client_ts BIGINT,
  ADD COLUMN IF NOT EXISTS hmac_timestamp TEXT;

-- Drop the old signature to prevent overload conflicts
DROP FUNCTION IF EXISTS validate_and_migrate_offline_submission(JSONB);

-- Redefine the RPC to match the arguments passed from Node route
CREATE OR REPLACE FUNCTION validate_and_migrate_offline_submission(
  p_staging_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staging_row RECORD;
  v_answer JSONB;
  v_success_count INT := 0;
BEGIN
  -- 1. Fetch the staging row
  SELECT * INTO v_staging_row
  FROM offline_submissions_staging
  WHERE id = p_staging_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'rejected', 'reason', 'STAGING_ROW_NOT_FOUND');
  END IF;

  -- 3. Migrate answers from JSON payload to student_answers
  FOR v_answer IN SELECT * FROM jsonb_array_elements(v_staging_row.payload->'answers')
  LOOP
    -- UPSERT behavior to handle retries gracefully using idempotency_key
    INSERT INTO student_answers (
      submission_id,
      question_id,
      selected_option,
      answered_at,
      time_spent_ms,
      idempotency_key
    ) VALUES (
      (v_staging_row.payload->>'submission_id')::UUID,
      (v_answer->>'question_id')::UUID,
      v_answer->>'selected_option',
      to_timestamp((v_answer->>'answered_at')::BIGINT / 1000.0),
      (v_answer->>'time_spent_ms')::INT,
      (v_answer->>'idempotency_key')::UUID
    )
    ON CONFLICT (idempotency_key) DO NOTHING;

    v_success_count := v_success_count + 1;
  END LOOP;

  -- 4. Mark staging row as processed
  UPDATE offline_submissions_staging
  SET status = 'processed', completed_at = NOW(), updated_at = NOW()
  WHERE id = p_staging_id;

  RETURN jsonb_build_object('status', 'success', 'synced_count', v_success_count);
EXCEPTION WHEN OTHERS THEN
  UPDATE offline_submissions_staging
  SET status = 'error', error_message = SQLERRM, updated_at = NOW()
  WHERE id = p_staging_id;
  RETURN jsonb_build_object('status', 'rejected', 'reason', SQLERRM);
END;
$$;
