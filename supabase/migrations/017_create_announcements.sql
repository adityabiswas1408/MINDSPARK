CREATE TABLE IF NOT EXISTS announcements (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id    UUID         NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  title             TEXT         NOT NULL,
  content           TEXT         NOT NULL,
  target_audience   TEXT[]       NOT NULL, -- e.g., ['teacher', 'student'] or ['all']
  priority          TEXT         NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_by        UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS announcements_inst_idx ON announcements (institution_id);
