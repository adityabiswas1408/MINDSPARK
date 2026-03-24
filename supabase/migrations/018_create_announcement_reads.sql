CREATE TABLE IF NOT EXISTS announcement_reads (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id  UUID         NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id          UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS announcement_reads_user_idx ON announcement_reads (user_id);
