ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS submissions_deletion_scheduled_idx ON submissions (deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;

ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS activity_logs_deletion_scheduled_idx ON activity_logs (deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;
