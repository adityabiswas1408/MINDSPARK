CREATE INDEX IF NOT EXISTS activity_logs_timestamp_brin_idx 
ON activity_logs USING BRIN (timestamp) WITH (pages_per_range = 128);

CREATE INDEX IF NOT EXISTS submissions_pending_idx
ON submissions (updated_at) WHERE completed_at IS NULL;
