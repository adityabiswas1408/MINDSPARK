-- ==============================================================================
-- P1: FIX CROSS-TENANT ADMIN/TEACHER WRITE ACCESS
-- Add strict institution_id scoping to all role-gated policies.
-- ==============================================================================

-- 1. INSTITUTIONS
DROP POLICY IF EXISTS "Admins can manage institutions" ON institutions;
CREATE POLICY "Admins manage institutions" ON institutions
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);

-- 2. LEVELS
DROP POLICY IF EXISTS "Admins manage levels" ON levels;
CREATE POLICY "Admins manage levels" ON levels
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);

-- 3. COHORTS
DROP POLICY IF EXISTS "Admins manage cohorts" ON cohorts;
CREATE POLICY "Admins manage cohorts" ON cohorts
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);

-- 4. PROFILES
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;
CREATE POLICY "Admins manage profiles" ON profiles
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);

-- 5. STUDENTS
DROP POLICY IF EXISTS "Admins manage students" ON students;
CREATE POLICY "Admins manage students" ON students
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);

-- 6. TEACHERS (joined through profiles)
DROP POLICY IF EXISTS "Admins manage teachers" ON teachers;
CREATE POLICY "Admins manage teachers" ON teachers
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (id IN (SELECT id FROM profiles WHERE institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid))
);

-- 7. EXAM PAPERS
DROP POLICY IF EXISTS "Admins manage exams" ON exam_papers;
CREATE POLICY "Admins manage exams" ON exam_papers
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);

-- 8. QUESTIONS (joined through exam_papers)
DROP POLICY IF EXISTS "Admins manage questions" ON questions;
CREATE POLICY "Admins manage questions" ON questions
FOR ALL USING (
  (((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'teacher')) AND
  (paper_id IN (SELECT id FROM exam_papers WHERE institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid))
);

-- 9. ASSESSMENT SESSIONS (joined through cohorts)
DROP POLICY IF EXISTS "Admins manage sessions" ON assessment_sessions;
CREATE POLICY "Admins manage sessions" ON assessment_sessions
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (cohort_id IN (SELECT id FROM cohorts WHERE institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid))
);

-- 10. ASSESSMENT SESSION QUESTIONS (joined through assessment_sessions -> cohorts)
DROP POLICY IF EXISTS "Admins manage session questions" ON assessment_session_questions;
CREATE POLICY "Admins manage session questions" ON assessment_session_questions
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (session_id IN (
    SELECT id FROM assessment_sessions WHERE cohort_id IN (
      SELECT id FROM cohorts WHERE institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
    )
  ))
);

-- 11. SUBMISSIONS (joined through students)
DROP POLICY IF EXISTS "Admins manage submissions" ON submissions;
CREATE POLICY "Admins manage submissions" ON submissions
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (student_id IN (SELECT id FROM students WHERE institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid))
);

-- 12. STUDENT ANSWERS (joined through submissions -> students)
DROP POLICY IF EXISTS "Admins manage answers" ON student_answers;
CREATE POLICY "Admins manage answers" ON student_answers
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (submission_id IN (
    SELECT id FROM submissions WHERE student_id IN (
      SELECT id FROM students WHERE institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
    )
  ))
);

-- 13. OFFLINE SUBMISSIONS STAGING
DROP POLICY IF EXISTS "Admins manage staging" ON offline_submissions_staging;
CREATE POLICY "Admins manage staging" ON offline_submissions_staging
FOR ALL USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);

-- 14. ACTIVITY LOGS (SELECT leak fix)
DROP POLICY IF EXISTS "Admins view logs" ON activity_logs;
CREATE POLICY "Admins view logs" ON activity_logs
FOR SELECT USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);
