CREATE TABLE IF NOT EXISTS profiles (
  id                     UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id         UUID         NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  role                   TEXT         NOT NULL CHECK (role IN ('admin','teacher','student')),
  email                  TEXT         NOT NULL UNIQUE,
  full_name              TEXT         NOT NULL,
  avatar_url             TEXT,
  forced_password_reset  BOOLEAN      NOT NULL DEFAULT FALSE,
  locked_at              TIMESTAMPTZ,
  version_seq            INTEGER      NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_institution_idx ON profiles (institution_id);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
