CREATE TABLE IF NOT EXISTS institutions (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT         NOT NULL CHECK (char_length(name) <= 255),
  slug                     TEXT         NOT NULL UNIQUE,
  timezone                 TEXT         NOT NULL DEFAULT 'Asia/Kolkata',
  session_timeout_seconds  INTEGER      NOT NULL DEFAULT 3600 CHECK (session_timeout_seconds > 0),
  logo_url                 TEXT,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at               TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS institutions_slug_idx ON institutions (slug);
