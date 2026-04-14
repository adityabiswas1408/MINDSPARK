-- Run via Supabase SQL editor on project ahrnkwuqlhmwenhvnupb.
-- Spec: docs/superpowers/plans/2026-04-14-student-assessment-taking-flow.md (Task 1.5.7)
-- Date: 2026-04-14
--
-- Rewrite: validate_and_migrate_offline_submission
--
-- Changes vs. prior version:
--   1. INSERT now writes `answered_at` from the client payload
--      (falls back to NOW() if the field is missing — backward-compat for
--      any queued rows produced before the time_spent_ms cutover).
--   2. INSERT now writes `time_spent_ms` from the client payload
--      (COALESCE → 0 for backward-compat).
--   3. INSERT now writes SERVER-AUTHORITATIVE `is_correct` by looking up
--      the question's correct_option and comparing it to the client's
--      selected_option. Client-supplied is_correct is NEVER trusted.
--
-- Everything else (HMAC validation, timestamp window, staging update,
-- activity_logs on rejection, error handler) is unchanged.

CREATE OR REPLACE FUNCTION public.validate_and_migrate_offline_submission(
    p_staging_id uuid,
    p_hmac_timestamp text,
    p_client_ts bigint,
    p_secret text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_staging_row RECORD;
    v_session_id TEXT;
    v_submission_id UUID;
    v_secret TEXT;
    v_expected_hmac TEXT;
    v_answer_obj JSONB;
    v_written_count INT := 0;
    v_question_id UUID;
    v_selected_option TEXT;
    v_correct_option TEXT;
    v_is_correct BOOLEAN;
    v_answered_at TIMESTAMPTZ;
    v_time_spent_ms INT;
BEGIN
    SELECT * INTO v_staging_row FROM offline_submissions_staging WHERE id = p_staging_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('status', 'error', 'reason', 'STAGING_NOT_FOUND');
    END IF;

    v_session_id := v_staging_row.session_id::text;

    IF NOW() - to_timestamp(p_client_ts / 1000.0) > interval '300 seconds' THEN
        RETURN jsonb_build_object('status', 'rejected', 'reason', 'TIMESTAMP_EXPIRED');
    END IF;

    v_secret := p_secret;

    v_expected_hmac := encode(
        hmac((v_session_id || ':' || p_client_ts::text)::bytea, v_secret::bytea, 'sha256'),
        'hex'
    );

    IF p_hmac_timestamp != v_expected_hmac THEN
        INSERT INTO activity_logs (institution_id, user_id, action_type, entity_type, entity_id, metadata)
        VALUES (
            v_staging_row.institution_id,
            v_staging_row.student_id,
            'HMAC_REJECTION',
            'offline_submissions_staging',
            p_staging_id,
            jsonb_build_object('provided', p_hmac_timestamp, 'expected', v_expected_hmac)
        );
        RETURN jsonb_build_object('status', 'rejected', 'reason', 'HMAC_MISMATCH');
    END IF;

    SELECT id INTO v_submission_id FROM submissions WHERE session_id = v_session_id::uuid;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'SUBMISSION_NOT_FOUND_FOR_SESSION %', v_session_id;
    END IF;

    FOR v_answer_obj IN SELECT * FROM jsonb_array_elements(v_staging_row.payload->'answers')
    LOOP
        BEGIN
            v_question_id := (v_answer_obj->>'question_id')::uuid;
            v_selected_option := v_answer_obj->>'selected_option';

            -- Server-authoritative is_correct: look up correct_option and
            -- compare. Client never influences this field.
            SELECT correct_option INTO v_correct_option
            FROM questions
            WHERE id = v_question_id;

            v_is_correct := (
                v_correct_option IS NOT NULL
                AND v_selected_option IS NOT NULL
                AND v_correct_option = v_selected_option
            );

            -- Client-supplied answered_at (ms epoch) → timestamptz.
            -- COALESCE to NOW() for backward-compat with queued rows that
            -- pre-date the field being surfaced in the client payload.
            v_answered_at := COALESCE(
                to_timestamp(((v_answer_obj->>'answered_at')::bigint) / 1000.0),
                NOW()
            );

            v_time_spent_ms := COALESCE((v_answer_obj->>'time_spent_ms')::int, 0);

            INSERT INTO student_answers (
                submission_id,
                question_id,
                selected_option,
                idempotency_key,
                answered_at,
                time_spent_ms,
                is_correct
            ) VALUES (
                v_submission_id,
                v_question_id,
                v_selected_option,
                (v_answer_obj->>'idempotency_key')::uuid,
                v_answered_at,
                v_time_spent_ms,
                v_is_correct
            )
            ON CONFLICT ON CONSTRAINT student_answers_submission_id_question_id_key DO NOTHING;

            v_written_count := v_written_count + 1;
        EXCEPTION WHEN unique_violation THEN
            NULL;
        END;
    END LOOP;

    UPDATE offline_submissions_staging
    SET status = 'processed', completed_at = NOW()
    WHERE id = p_staging_id;

    RETURN jsonb_build_object('status', 'migrated', 'answers_written', v_written_count);

EXCEPTION WHEN OTHERS THEN
    IF v_staging_row.institution_id IS NOT NULL THEN
        INSERT INTO activity_logs (institution_id, action_type, metadata)
        VALUES (v_staging_row.institution_id, 'SYNC_ERROR', jsonb_build_object('error', SQLERRM, 'staging_id', p_staging_id));
    END IF;
    RETURN jsonb_build_object('status', 'error', 'reason', SQLERRM);
END;
$function$;

-- ─── Verification ─────────────────────────────────────────────────────────
-- Confirm the new body is in place by searching for the new column names.
SELECT
    CASE
        WHEN pg_get_functiondef(oid) LIKE '%time_spent_ms%'
         AND pg_get_functiondef(oid) LIKE '%is_correct%'
         AND pg_get_functiondef(oid) LIKE '%v_correct_option%'
        THEN 'OK'
        ELSE 'MISSING FIELDS'
    END AS rewrite_status
FROM pg_proc
WHERE proname = 'validate_and_migrate_offline_submission';
