-- Reset STUDENT-001 to a clean state for exam flow testing.
-- Run in Supabase SQL editor before any exam flow test session.

-- Close all open sessions
UPDATE assessment_sessions
SET closed_at = NOW()
WHERE student_id = (
  SELECT id FROM students
  WHERE roll_number = 'STUDENT-001'
)
AND closed_at IS NULL;

-- Clear test answers
DELETE FROM student_answers
WHERE submission_id IN (
  SELECT id FROM submissions
  WHERE student_id = (
    SELECT id FROM students
    WHERE roll_number = 'STUDENT-001'
  )
);

-- Clear test submissions
DELETE FROM submissions
WHERE student_id = (
  SELECT id FROM students
  WHERE roll_number = 'STUDENT-001'
);

-- Verify clean state
SELECT
  (SELECT COUNT(*) FROM assessment_sessions
   WHERE student_id = (
     SELECT id FROM students
     WHERE roll_number = 'STUDENT-001'
   ) AND closed_at IS NULL) as open_sessions,
  (SELECT COUNT(*) FROM student_answers
   WHERE submission_id IN (
     SELECT id FROM submissions WHERE student_id = (
       SELECT id FROM students
       WHERE roll_number = 'STUDENT-001'
     )
   )) as answer_rows;

-- Expected: open_sessions = 0, answer_rows = 0
