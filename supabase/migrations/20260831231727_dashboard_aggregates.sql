-- 20260831231727_dashboard_aggregates.sql
-- RPC to fetch aggregated dashboard metrics in one query, ensuring
-- explicit institution_id filtering for index usage and avoiding in-memory reduces.

CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_institution_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_students integer;
  v_active_exams integer;
  v_live_sessions integer;
  v_avg_score numeric;
  v_student_sparkline jsonb;
  v_exam_sparkline jsonb;
  v_score_sparkline jsonb;
  v_session_sparkline jsonb;
  v_score_trend jsonb;
  v_level_dist jsonb;
BEGIN
  -- 1. Total students (not deleted)
  SELECT count(*) INTO v_total_students
  FROM students
  WHERE institution_id = p_institution_id
    AND deleted_at IS NULL;

  -- 2. Active exams
  SELECT count(*) INTO v_active_exams
  FROM exam_papers
  WHERE institution_id = p_institution_id
    AND status = 'LIVE';

  -- 3. Live sessions
  SELECT count(*) INTO v_live_sessions
  FROM assessment_sessions sess
  JOIN exam_papers ep ON ep.id = sess.paper_id
  WHERE ep.institution_id = p_institution_id
    AND sess.status = 'active';

  -- 4. Avg score across published exams
  SELECT COALESCE(ROUND(AVG(s.percentage), 1), 0) INTO v_avg_score
  FROM submissions s
  JOIN assessment_sessions sess ON s.session_id = sess.id
  JOIN exam_papers ep ON ep.id = sess.paper_id
  WHERE ep.institution_id = p_institution_id
    AND s.completed_at IS NOT NULL;

  -- 5. Student sparkline (last 7 days, 1 item per day)
  WITH days AS (
    SELECT generate_series(
      date_trunc('day', NOW() - INTERVAL '6 days'),
      date_trunc('day', NOW()),
      '1 day'::interval
    ) AS d
  )
  SELECT jsonb_agg(COALESCE(cnt, 0) ORDER BY d ASC) INTO v_student_sparkline
  FROM days
  LEFT JOIN (
    SELECT date_trunc('day', created_at) AS day, count(*) AS cnt
    FROM students
    WHERE institution_id = p_institution_id
      AND created_at >= date_trunc('day', NOW() - INTERVAL '6 days')
      AND deleted_at IS NULL
    GROUP BY 1
  ) s ON days.d = s.day;

  -- 6. Exam sparkline (last 7 days)
  WITH days AS (
    SELECT generate_series(
      date_trunc('day', NOW() - INTERVAL '6 days'),
      date_trunc('day', NOW()),
      '1 day'::interval
    ) AS d
  )
  SELECT jsonb_agg(COALESCE(cnt, 0) ORDER BY d ASC) INTO v_exam_sparkline
  FROM days
  LEFT JOIN (
    SELECT date_trunc('day', created_at) AS day, count(*) AS cnt
    FROM exam_papers
    WHERE institution_id = p_institution_id
      AND created_at >= date_trunc('day', NOW() - INTERVAL '6 days')
    GROUP BY 1
  ) s ON days.d = s.day;

  -- 7. Score sparkline (last 7 days avg)
  WITH days AS (
    SELECT generate_series(
      date_trunc('day', NOW() - INTERVAL '6 days'),
      date_trunc('day', NOW()),
      '1 day'::interval
    ) AS d
  )
  SELECT jsonb_agg(COALESCE(avg_s, 0) ORDER BY d ASC) INTO v_score_sparkline
  FROM days
  LEFT JOIN (
    SELECT date_trunc('day', s.created_at) AS day, ROUND(AVG(s.percentage), 1) AS avg_s
    FROM submissions s
    JOIN assessment_sessions sess ON s.session_id = sess.id
    JOIN exam_papers ep ON ep.id = sess.paper_id
    WHERE ep.institution_id = p_institution_id
      AND s.completed_at IS NOT NULL
      AND s.created_at >= date_trunc('day', NOW() - INTERVAL '6 days')
    GROUP BY 1
  ) s ON days.d = s.day;

  -- 8. Session sparkline (last 7 days)
  WITH days AS (
    SELECT generate_series(
      date_trunc('day', NOW() - INTERVAL '6 days'),
      date_trunc('day', NOW()),
      '1 day'::interval
    ) AS d
  )
  SELECT jsonb_agg(COALESCE(cnt, 0) ORDER BY d ASC) INTO v_session_sparkline
  FROM days
  LEFT JOIN (
    SELECT date_trunc('day', sess.created_at) AS day, count(*) AS cnt
    FROM assessment_sessions sess
    JOIN exam_papers ep ON ep.id = sess.paper_id
    WHERE ep.institution_id = p_institution_id
      AND sess.created_at >= date_trunc('day', NOW() - INTERVAL '6 days')
    GROUP BY 1
  ) s ON days.d = s.day;

  -- 9. Score trend (6 months)
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', NOW() - INTERVAL '5 months'),
      date_trunc('month', NOW()),
      '1 month'::interval
    ) AS m
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'month', to_char(m, 'Mon'),
      'avgScore', COALESCE(avg_s, 0)
    ) ORDER BY m ASC
  ), '[]'::jsonb) INTO v_score_trend
  FROM months
  LEFT JOIN (
    SELECT date_trunc('month', s.created_at) AS mth, ROUND(AVG(s.percentage), 1) AS avg_s
    FROM submissions s
    JOIN assessment_sessions sess ON s.session_id = sess.id
    JOIN exam_papers ep ON ep.id = sess.paper_id
    WHERE ep.institution_id = p_institution_id
      AND s.completed_at IS NOT NULL
      AND s.created_at >= date_trunc('month', NOW() - INTERVAL '5 months')
    GROUP BY 1
  ) s ON months.m = s.mth;

  -- 10. Level distribution
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'level', l.name,
      'students', COALESCE(sc.cnt, 0)
    ) ORDER BY l.sequence_order ASC
  ), '[]'::jsonb) INTO v_level_dist
  FROM levels l
  LEFT JOIN (
    SELECT level_id, count(*) AS cnt
    FROM students
    WHERE deleted_at IS NULL
      AND institution_id = p_institution_id
    GROUP BY level_id
  ) sc ON sc.level_id = l.id
  WHERE l.institution_id = p_institution_id;

  RETURN jsonb_build_object(
    'totalStudents', v_total_students,
    'activeExams', v_active_exams,
    'liveSessions', v_live_sessions,
    'avgScore', v_avg_score,
    'studentSparkline', v_student_sparkline,
    'examSparkline', v_exam_sparkline,
    'scoreSparkline', v_score_sparkline,
    'sessionSparkline', v_session_sparkline,
    'scoreTrend', v_score_trend,
    'levelDist', v_level_dist
  );
END;
$$;
