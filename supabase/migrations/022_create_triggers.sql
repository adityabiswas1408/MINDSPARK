CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
          'institutions', 'profiles', 'levels', 'cohorts', 'students', 'teachers',
          'cohort_history', 'exam_papers', 'questions', 'grade_boundaries',
          'assessment_sessions', 'submissions', 'student_answers',
          'offline_submissions_staging', 'announcements'
        )
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_modtime 
            BEFORE UPDATE ON %I 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
        ', t, t);
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION close_previous_cohort_history()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cohort_history
  SET valid_to = NOW()
  WHERE student_id = NEW.student_id AND valid_to IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER close_cohort_history_before_insert
BEFORE INSERT ON cohort_history
FOR EACH ROW EXECUTE FUNCTION close_previous_cohort_history();
