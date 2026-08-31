CREATE OR REPLACE FUNCTION public.bulk_import_students(p_institution_id uuid, p_rows jsonb, p_level_id uuid, p_cohort_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    inserted INT := 0;
    skipped INT := 0;
    errors JSONB := '[]'::JSONB;
    v_row JSONB;
    v_uuid UUID;
    v_roll_number TEXT;
    v_cohort_uuid UUID;
BEGIN
    v_cohort_uuid := NULLIF(p_cohort_id, '')::uuid;

    FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows)
    LOOP
        v_roll_number := v_row->>'roll_number';
        BEGIN
            v_uuid := (v_row->>'auth_user_id')::uuid;
            
            INSERT INTO profiles (
                id, institution_id, role, email, full_name, forced_password_reset
            ) VALUES (
                v_uuid,
                p_institution_id,
                'student',
                v_roll_number || '@mindspark.local',
                v_row->>'full_name',
                TRUE
            );

            INSERT INTO students (
                id, level_id, cohort_id, full_name, roll_number, dob
            ) VALUES (
                v_uuid,
                p_level_id,
                v_cohort_uuid,
                v_row->>'full_name',
                v_roll_number,
                (v_row->>'dob')::DATE
            );

            inserted := inserted + 1;
        EXCEPTION WHEN OTHERS THEN
            skipped := skipped + 1;
            errors := errors || jsonb_build_object('roll_number', v_roll_number, 'reason', SQLERRM);
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'inserted', inserted,
        'skipped', skipped,
        'errors', errors
    );
END;
$function$
