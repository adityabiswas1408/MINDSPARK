---
name: schema-rules
description: Use when writing any migration file, Supabase query, Server Action, Route Handler, or any code that touches the database. Read docs/11_database.md completely before writing migration 001.
---

# MINDSPARK — Database Schema Rules

## Canonical source
docs/11_database.md is Priority 1. Read it fully before any database work.
When uncertain about any column name, table name, or type: open docs/11_database.md and check.
Never guess.

## Migration sequence
26 migrations total. Run in strict order 001 through 026. Never skip. Never reorder.
Run: npx supabase db push after every 3 migrations to catch errors early.
After migration 026 passes: run npx supabase gen types typescript --local > types/supabase.ts

## Correct table names
exam_papers           NOT assessments
submissions           session header — one row per student per exam
student_answers       individual MCQ answers — submission_id FK + question_id FK
assessment_sessions   student session state — no status column
offline_submissions_staging   temporary staging for offline sync
activity_logs         immutable audit trail — no DELETE RLS policy
cohort_history        temporal assignment table
grade_boundaries      scoring configuration

## Correct column names (use these exactly)
paper_id              FK on submissions and assessment_sessions (NOT assessment_id)
forced_password_reset BOOLEAN on profiles (with 'd' — NOT force_password_reset)
session_timeout_seconds INT on institutions (NOT session_timeout)
valid_from            TIMESTAMPTZ on cohort_history (NOT start_date)
valid_to              TIMESTAMPTZ on cohort_history (NOT end_date)
result_published_at   TIMESTAMPTZ on submissions (NOT published BOOLEAN)
server_received_at    TIMESTAMPTZ on offline_submissions_staging (NOT created_at)
anzan_delay_ms        INT on exam_papers with CHECK anzan_delay_ms >= 200

## student_answers schema — Design A (canonical from docs/11_database.md §12)
id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
submission_id    UUID NOT NULL FK to submissions(id) ON DELETE CASCADE
question_id      UUID NOT NULL FK to questions(id)
idempotency_key  UUID NOT NULL UNIQUE
selected_option  TEXT NULL — NULL means skipped
is_correct       BOOLEAN NULL — set by calculate_results RPC, not by client
answered_at      TIMESTAMPTZ NOT NULL
created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
UNIQUE (submission_id, question_id)

There is no session_id column on student_answers.
There is no question_index column on student_answers.
There is no migration_status column on offline_submissions_staging.

## assessment_sessions — no status column
assessment_sessions has: paper_id FK, student_id FK, expires_at, started_at, closed_at
Status lives on exam_papers only (DRAFT, PUBLISHED, LIVE, CLOSED)
To check if a session is complete: closed_at IS NOT NULL

## Three Security Definer RPCs (migration 020)
bulk_import_students(p_institution_id, p_level_id, p_cohort_id, p_students)
  — per-row EXCEPTION handling — skips duplicate roll_number rows, others continue
  — returns JSONB: {inserted, skipped, errors}
  — partial imports are valid: inserted > 0 and skipped > 0 can both be true

validate_and_migrate_offline_submission(p_staging_id, p_hmac_timestamp, p_client_ts)
  — FULL NAME — no shorter form exists in the database
  — calling validate_offline_submission returns: function does not exist
  — lives in supabase/migrations/020_create_security_definer_functions.sql
  — NOT in supabase/functions/ (that is for Edge Functions — different system)

calculate_results(p_paper_id UUID)
  — correct parameter name is p_paper_id
  — NOT reevaluate_results, NOT recalculate_scores

## RLS role claim in policies
CORRECT:   (auth.jwt() -> 'app_metadata') ->> 'role' = 'admin'
WRONG:     auth.jwt() ->> 'role' = 'admin'  — returns 'authenticated', not app role

## Deletion FK order — mandatory
Must delete child rows before parent rows or FK constraint fails:
student_answers → submissions → activity_logs → students

## submitAnswer payload
session_id:      string UUID
question_id:     string UUID FK to questions(id) — NOT question_index INTEGER
selected_option: 'A' | 'B' | 'C' | 'D' | null
answered_at:     number (client ms timestamp)
idempotency_key: string UUID v5

## forceOpenExam transitions
PUBLISHED → LIVE  standard open — broadcasts exam_live on exam:{paper_id}
CLOSED → LIVE     recovery within 10 minutes of closed_at — broadcasts exam_reopened on exam:{paper_id}
                  after 10 minutes returns ASSESSMENT_LOCKED

## Realtime channels
exam:{paper_id}   Broadcast only — exam_live, exam_closed, exam_reopened
lobby:{paper_id}  Presence only — student status tracking
Never broadcast lifecycle events on lobby channel.
Never use Postgres Changes for exam state — WAL overflow at 2,500+ concurrent sessions.

## cohort_history temporal join in RLS
teacher can access students who were in their cohort at the time of the submission:
WHERE ch.valid_from <= submissions.started_at
  AND (ch.valid_to IS NULL OR ch.valid_to >= submissions.started_at)
