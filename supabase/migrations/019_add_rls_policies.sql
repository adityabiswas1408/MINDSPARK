-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_submissions_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- 1. INSTITUTIONS
CREATE POLICY "Admins can manage institutions" ON institutions
FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');

CREATE POLICY "Everyone can view institutions" ON institutions
FOR SELECT USING (true);

-- 2. PROFILES
CREATE POLICY "Admins manage profiles" ON profiles
FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');

CREATE POLICY "Users view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- 3. LEVELS & COHORTS
CREATE POLICY "Admins manage levels" ON levels FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Read levels" ON levels FOR SELECT USING (true);

CREATE POLICY "Admins manage cohorts" ON cohorts FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Read cohorts" ON cohorts FOR SELECT USING (true);

-- 4. STUDENTS & TEACHERS
CREATE POLICY "Admins manage students" ON students FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Students read own record" ON students FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins manage teachers" ON teachers FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Teachers read own record" ON teachers FOR SELECT USING (id = auth.uid());

-- 5. EXAM PAPERS & QUESTIONS
CREATE POLICY "Admins manage exams" ON exam_papers FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Students read published exams" ON exam_papers FOR SELECT USING (status = 'published');

CREATE POLICY "Admins manage questions" ON questions FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Students read questions" ON questions FOR SELECT USING (true); 

-- 6. ASSESSMENT SESSIONS
CREATE POLICY "Admins manage sessions" ON assessment_sessions FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Read sessions" ON assessment_sessions FOR SELECT USING (true);

CREATE POLICY "Admins manage session questions" ON assessment_session_questions FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Read session questions" ON assessment_session_questions FOR SELECT USING (true);

-- 7. SUBMISSIONS & ANSWERS
CREATE POLICY "Admins manage submissions" ON submissions FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Students own submissions" ON submissions FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Admins manage answers" ON student_answers FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Students answers" ON student_answers FOR ALL USING (
  submission_id IN (SELECT id FROM submissions WHERE student_id = auth.uid())
);

-- Misc (Logs, Announcements, etc)
CREATE POLICY "Admins manage announcements" ON announcements FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Read announcements" ON announcements FOR SELECT USING (true);

CREATE POLICY "Manage announcement reads" ON announcement_reads FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins manage staging" ON offline_submissions_staging FOR ALL USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Admins view logs" ON activity_logs FOR SELECT USING ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin');
CREATE POLICY "Insert logs" ON activity_logs FOR INSERT WITH CHECK (true);
