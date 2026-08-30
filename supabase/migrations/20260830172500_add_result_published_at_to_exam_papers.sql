-- Add result_published_at to exam_papers for paper-level publication status

ALTER TABLE exam_papers
ADD COLUMN result_published_at TIMESTAMPTZ;
