begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

ALTER PUBLICATION supabase_realtime ADD TABLE assessment_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE student_answers;
