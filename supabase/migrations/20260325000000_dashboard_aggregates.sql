CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_aggregates AS
SELECT
  i.id AS institution_id,
  COUNT(DISTINCT s.id) FILTER (WHERE s.deleted_at IS NULL) AS total_students,
  COUNT(DISTINCT ep.id) AS total_assessments,
  COUNT(DISTINCT ep.id) FILTER (WHERE ep.status = 'LIVE') AS live_exams,
  COUNT(DISTINCT sub.id) FILTER (WHERE sub.completed_at IS NOT NULL) AS total_submissions,
  NOW() AS refreshed_at
FROM institutions i
LEFT JOIN students s ON s.institution_id = i.id
LEFT JOIN exam_papers ep ON ep.institution_id = i.id
LEFT JOIN submissions sub ON sub.paper_id = ep.id
GROUP BY i.id;

CREATE UNIQUE INDEX IF NOT EXISTS dashboard_aggregates_institution_idx
  ON dashboard_aggregates (institution_id);
