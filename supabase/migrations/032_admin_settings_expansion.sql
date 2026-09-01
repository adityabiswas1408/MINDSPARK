-- Add auto_archive_enabled and default timing settings to institutions
ALTER TABLE institutions
ADD COLUMN auto_archive_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN default_duration_minutes integer,
ADD COLUMN default_per_question_time_seconds integer;
