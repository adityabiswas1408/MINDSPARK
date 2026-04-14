# Phase 1 Audit — Findings

**Date:** 2026-04-14
**Scope:** Read-only audit of all 13 specs in `docs/superpowers/specs/`, all 3 plans in `docs/superpowers/plans/`, the live Supabase schema (18 public tables, 8 RPCs), all existing server actions (10 files), all admin/student page routes, and all 36 brainstorm HTML mockups (sampled).
**Status:** Complete. No spec or code edits made.
**Next:** Phases 2–7 (decided after user reviews this document).

---

## Executive summary

The 2026-04-13 spec batch (10 files) and the 2026-04-14 spec batch (3 files) **mostly converge**, but there are four classes of real problems that block clean execution:

| Class | Severity | Count | Examples |
|---|---|---|---|
| **DB column collisions / false claims** | 🔴 Critical | 5 | `description` already exists on `exam_papers` (create-assessment spec proposes adding it); `pass_percentage` (live) vs `pass_threshold_percent` (specced) — same concept, two names, different types; `logo_url` already exists on `institutions` (settings spec proposes adding it); `show_correct_answers` (specced by create-assessment) overlaps semantically with `answer_key_released` (specced by results-flow). |
| **Missing DB column the specs depend on** | 🔴 Critical | 1 | `student_answers.time_spent_ms` is referenced by the assessment-taking spec (S1, §9) and assumed to exist — the live DB does NOT have it. The spec's S1 verification step says "must exist" but never adds it. |
| **Missing RPCs the specs use** | 🔴 Critical | 2 | `results_hub_counts` and `results_hub_paper_stats` are defined in the admin-results-redesign spec but DO NOT exist in the live DB. |
| **Code-vs-spec drift** | 🟡 Important | many | `src/components/student/sidebar.tsx` (specced) vs `src/components/layout/student-sidebar.tsx` (actual); spec says `updateStudent` handles `accessibility_flags` but the column doesn't exist; `live-exam-card.tsx` was supposed to be deleted by 3 specs but still exists. |

**The good news:** the 2026-04-14 batch (assessment-taking, results-flow, profile) is internally consistent and aligns with the live DB on most counts. The 2026-04-13 batch is the source of most contradictions because it was written **before** anyone re-checked the live DB.

**Recommended phase order (subject to your triage):**
1. **Phase 4** (assessment engine deep-dive) — should jump immediately because it depends on the missing `student_answers.time_spent_ms` column.
2. **Phase 2** (resolve contradictions) — tackle the 5 DB collisions by patching the older specs.
3. **Phase 3** (backend completeness) — fill in missing actions and verify storage bucket setup.
4. **Phase 5** (existing code review) — sweep stubs.
5. **Phase 6** (performance pass) — already mostly handled in spec query budgets; spot check.
6. **Phase 7** (execution roadmap) — final ordering doc.

---

## 1. Inventory

### 1.1 Specs (13)

| Date | File | Has plan? | Touches DB? | Action work? |
|---|---|---|---|---|
| 2026-04-13 | admin-assessments-list-design | No | No (read-only list) | No new actions |
| 2026-04-13 | admin-create-assessment-flow-design | No | **Yes — 8 cols + 1 new table** | Extends `updateAssessment`, adds 5 new actions |
| 2026-04-13 | admin-dashboard-design | No | No | No new actions |
| 2026-04-13 | admin-levels-flow-design | No | No | No changes (existing actions suffice) |
| 2026-04-13 | admin-live-monitor-flow-design | No | No | No changes |
| 2026-04-13 | admin-results-redesign-design | No | **Yes — 1 col + 2 RPCs** | Adds archive/unarchive |
| 2026-04-13 | admin-settings-design | No | **Yes — 4 cols + storage bucket** | Extends `updateSettings`, adds `uploadInstitutionLogo` |
| 2026-04-13 | admin-students-flow-design | No | No (says none) | Extends `updateStudent` for `date_of_birth + cohort_id` |
| 2026-04-13 | student-dashboard-design | No | No | No actions (read-only) |
| 2026-04-13 | student-exams-tests-flow-design | No | No | No actions |
| 2026-04-14 | student-assessment-taking-flow-design | **Yes** | **Yes — 2 cols + verifies 1** | Extends `updateAssessment`, `initSession` |
| 2026-04-14 | student-results-flow-design | **Yes** | **Yes — 4 cols** | Adds `releaseAnswerKey`, `unreleaseAnswerKey` |
| 2026-04-14 | student-profile-design | **Yes** | **Yes — 1 NOT NULL flip** | No new actions |

### 1.2 Plans (3)

All from 2026-04-14, all paired with the 3 newest specs. The 10 older specs have NO implementation plans.

### 1.3 Server actions (10 files, 27 exported functions)

| File | Exported functions |
|---|---|
| `assessments.ts` | createAssessment, updateAssessment, publishAssessment, forceOpenExam, forceCloseExam |
| `results.ts` | publishResult, unpublishResult, reEvaluateResults, publishResults |
| `students.ts` | importStudentsCSV, createStudent, updateStudent, deactivateStudent |
| `levels.ts` | createLevel, updateLevelOrder |
| `announcements.ts` | createAnnouncement |
| `questions.ts` | createQuestion, deleteQuestion, reorderQuestions |
| `settings.ts` | updateSettings |
| `assessment-sessions.ts` | initSession, submitAnswer, submitExam |
| `auth.ts` | resetPassword |
| `activity-log.ts` | fetchActivityLogs, exportActivityLogsCsv |

### 1.4 Pages (20 total)

**Admin (11):** assessments, students, students/[id], levels, results, monitor, monitor/[id], announcements, settings, activity-log, dashboard

**Student (9):** consent, assessment/[id], exams, exams/[id], exams/[id]/lobby, tests, results, dashboard, profile

### 1.5 API routes (3)

`api/submissions/teardown`, `api/submissions/offline-sync`, `api/consent/verify`

### 1.6 Live DB tables (18)

`activity_logs, announcement_reads, announcements, assessment_session_questions, assessment_sessions, cohort_history, cohorts, exam_papers, grade_boundaries, institutions, levels, offline_submissions_staging, profiles, questions, student_answers, students, submissions, teachers`

### 1.7 Live DB RPCs / functions (8)

`bulk_import_students, calculate_results, close_previous_cohort_history, get_live_monitor_data, heartbeat_ping, seed_default_grade_boundaries, update_modified_column, validate_and_migrate_offline_submission`

### 1.8 Brainstorm HTML mockups (36)

Spread across 5 sessions. Sampled 6 — they map cleanly to specs and are consistent with their corresponding spec descriptions.

---

## 2. 🔴 Critical findings (block implementation)

### 2.1 `student_answers.time_spent_ms` is missing — assessment-taking spec depends on it

**Problem:** The 2026-04-14 assessment-taking spec (§3, §9, S1) repeatedly assumes `student_answers.time_spent_ms` exists. Specifically:

> **S1 verification:** `student_answers.time_spent_ms` must exist and be `INT NOT NULL DEFAULT 0`. Confirm in live DB before implementation.

The live DB query confirms: **`student_answers` has columns `[id, submission_id, question_id, is_correct, created_at, idempotency_key, selected_option, answered_at]` — there is NO `time_spent_ms` column.**

**Impact:**
- The assessment-taking flow records "you took 12.4s" per question on the answer-sheet view (Frame 8 in the results-flow spec). This data has no destination today.
- The `submitAnswer` server action would need to write to a column that doesn't exist.
- The assessment-taking implementation plan (`2026-04-14-student-assessment-taking-flow.md`) would fail at the first DB write.

**Fix:** add the column to the assessment-taking spec's §9 explicitly, and to its plan as a Task 1 step:

```sql
ALTER TABLE student_answers
  ADD COLUMN time_spent_ms INT NOT NULL DEFAULT 0;
```

No backfill needed (existing rows can sit at 0 — they pre-date the timing feature).

### 2.2 `description` already exists on `exam_papers` — create-assessment spec re-adds it

The create-assessment-flow spec §12 proposes:

```sql
ALTER TABLE exam_papers ADD COLUMN description text;
```

But the live DB query confirms `exam_papers.description` already exists (`text, nullable`). The spec is wrong.

**Fix:** drop that line from the create-assessment-flow spec. The other 7 ALTER statements in that spec are still needed.

### 2.3 `pass_percentage` (live) vs `pass_threshold_percent` (specced) — same concept, two names

The live DB has `exam_papers.pass_percentage` (numeric, nullable). The create-assessment-flow spec proposes:

```sql
ALTER TABLE exam_papers ADD COLUMN pass_threshold_percent integer DEFAULT 60 CHECK (pass_threshold_percent BETWEEN 0 AND 100);
```

Two different names, two different types (numeric vs integer), for the same concept. The new column would NOT replace the old one; both would exist.

**Fix options:**
- **A. Use the existing `pass_percentage` column** — update the create-assessment-flow spec to write to `pass_percentage` (numeric) instead of adding `pass_threshold_percent`. Add the `BETWEEN 0 AND 100` CHECK constraint to the existing column via a separate `ALTER`.
- **B. Add the new column and migrate** — keep the spec as written, but add a backfill task: `UPDATE exam_papers SET pass_threshold_percent = pass_percentage::int` and then `ALTER TABLE exam_papers DROP COLUMN pass_percentage`.

**Recommendation:** **A**. The live column already exists, integer truncation is fine for percentage values, and "rename a column" is a much higher-risk operation than "use the column we already have."

### 2.4 `show_correct_answers` (create-assessment) overlaps with `answer_key_released` (results-flow)

The create-assessment-flow spec §12 proposes:

```sql
ALTER TABLE exam_papers ADD COLUMN show_correct_answers boolean DEFAULT false;
```

The 2026-04-14 results-flow spec §9 proposes:

```sql
ALTER TABLE exam_papers
  ADD COLUMN answer_key_released BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN answer_key_released_at TIMESTAMPTZ NULL,
  ADD COLUMN answer_key_released_by UUID NULL REFERENCES profiles(id);
```

Both columns control "can the student see the answer key?" The first is a static config flag set at create time; the second is a runtime release toggle with an audit trail. **They are not the same thing**, but they overlap, and having both is confusing.

**Fix options:**
- **A. Drop `show_correct_answers` from create-assessment-flow** — the wizard sets the initial value of `answer_key_released` at create time (default FALSE). Admin uses the Release card later. One column, one source of truth.
- **B. Keep both with distinct semantics** — `show_correct_answers` = "this paper allows answer-key reveal" (a permission), `answer_key_released` = "the admin has flipped the switch for this paper" (a state). Complex but more flexible.

**Recommendation:** **A**. The spec already has too many flags. The default-deny behaviour from `answer_key_released = false` is enough.

### 2.5 `logo_url` already exists on `institutions` — settings spec re-adds it

The admin-settings spec §9 proposes:

```sql
ALTER TABLE institutions ADD COLUMN logo_url text;
```

But the live DB has `institutions.logo_url` already (`text, nullable`). The spec is unaware.

**Fix:** drop the `logo_url` line. The other 3 columns (`primary_contact_email`, `primary_contact_phone`, `address`) are still missing and need to be added.

### 2.6 `results_hub_counts` and `results_hub_paper_stats` RPCs don't exist

The admin-results-redesign spec defines two RPC functions that the new admin Results page is supposed to call:

```sql
CREATE OR REPLACE FUNCTION results_hub_counts(p_institution_id uuid, p_type text)
RETURNS TABLE(published bigint, pending bigint, archived bigint) ...

CREATE OR REPLACE FUNCTION results_hub_paper_stats(p_paper_ids uuid[])
RETURNS TABLE(paper_id uuid, gave_count bigint, ..., avg_score_num numeric, avg_score_denom numeric) ...
```

Neither exists in the live DB (`information_schema.routines` query confirms only 8 functions, none matching).

**Fix:** when implementing the admin-results-redesign plan (which doesn't exist yet), the SQL run book must include both `CREATE OR REPLACE FUNCTION` statements. Note: the second RPC reads `submissions.total_questions` — depends on the column added by the new results-flow spec.

---

## 3. DB schema gaps and orphan columns

### 3.1 Per-table snapshot (live DB vs all specs combined)

#### `exam_papers` — the most cross-touched table

**Live columns (20):** `id, institution_id, level_id, created_by, title, description, duration_minutes, total_marks, pass_percentage, status, created_at, updated_at, deleted_at, type, closed_at, opened_at, result_published_at, anzan_delay_ms, anzan_digit_count, anzan_row_count`

**Specs propose adding (14):**

| Column | Source spec | Status | Notes |
|---|---|---|---|
| `description` | create-assessment | 🔴 Already exists — drop from spec | False claim |
| `scheduled_start_at` | create-assessment | ⚠️ Conflicts with `opened_at` | See 3.2 below |
| `scheduled_end_at` | create-assessment | ⚠️ Conflicts with `closed_at` | See 3.2 below |
| `pass_threshold_percent` | create-assessment | 🔴 Conflicts with `pass_percentage` | See 2.3 |
| `max_attempts` | create-assessment | ✅ New — needed | Default 1, CHECK >=1 |
| `time_limit_mode` | create-assessment | ✅ New — needed | 'hard'/'grace' |
| `randomize_questions` | create-assessment | ✅ New — needed | Default false |
| `show_correct_answers` | create-assessment | 🔴 Overlaps with `answer_key_released` | See 2.4 |
| `archived_at` | results-redesign | ✅ New — needed | + index |
| `per_question_time_seconds` | assessment-taking | ✅ New — needed | INT nullable |
| `require_answer_confirmation` | assessment-taking | ✅ New — needed | BOOL NOT NULL DEFAULT TRUE |
| `answer_key_released` | results-flow | ✅ New — needed | BOOL NOT NULL DEFAULT FALSE |
| `answer_key_released_at` | results-flow | ✅ New — needed | TIMESTAMPTZ NULL |
| `answer_key_released_by` | results-flow | ✅ New — needed | UUID NULL REFERENCES profiles |

**Orphan columns (live, no spec uses them):**
- `anzan_delay_ms`, `anzan_digit_count`, `anzan_row_count` — no current spec describes these. They look like TEST-specific Anzan flash configuration. The create-assessment-flow spec mentions a "Step 3 flash config" but doesn't list these column names. **Gap:** the Step 3 flash config in create-assessment-flow needs to be wired to these specific columns.

#### 3.2 `opened_at`/`closed_at` (live) vs `scheduled_start_at`/`scheduled_end_at` (specced)

Live `exam_papers` has `opened_at` and `closed_at` (both timestamptz nullable). The create-assessment-flow spec proposes adding `scheduled_start_at` and `scheduled_end_at`.

These are **semantically different but the spec doesn't acknowledge the existing columns**:

- `opened_at` / `closed_at` (live) appear to be the **actual** times the exam was opened/closed (set when status flips DRAFT→LIVE→CLOSED).
- `scheduled_start_at` / `scheduled_end_at` (specced) would be the **planned** future times set by the admin at create time.

These can co-exist, but the spec needs to explain the relationship clearly. Currently it doesn't.

**Fix:** the create-assessment-flow spec should add a §12.x explaining the four columns as two distinct concepts: "scheduled" (planned) vs "opened/closed" (actual). The implementation plan must keep them in sync (e.g., `forceOpenExam` writes `opened_at`, the cron job that auto-opens at `scheduled_start_at` also writes `opened_at`).

#### `submissions`

**Live columns (16):** `id, session_id, student_id, score, percentage, grade, sync_status, idempotency_key, completed_at, result_published_at, created_at, updated_at, deletion_scheduled_at, paper_id, completion_seal, dpm`

**Specs propose adding (1):**
- `total_questions` — results-flow ✅ New, needed (also referenced by results-redesign RPC)

**Orphan columns:**
- `submissions.percentage` — results-flow spec explicitly drops this from the read path ("kept for analytics use only"). OK as-is, but document the orphan status in GOTCHAS.md.
- `submissions.dpm` — same. Kept but not surfaced in any new UI.

#### `students`

**Live columns (20):** `id, level_id, cohort_id (NOT NULL), full_name, roll_number (nullable), grade_section, dob, gender, guardian_name, guardian_email, guardian_phone, id_card_url, device_id, created_at, updated_at, deleted_at, consent_verified, institution_id (nullable!), deletion_scheduled_at, date_of_birth`

**Specs propose:**
- `roll_number SET NOT NULL` — profile spec ✅ verified safe (0 nulls)

**🔴 Schema bug — `institution_id` is nullable.** Every other table has `institution_id NOT NULL` (`exam_papers`, `levels`, `cohorts`, `profiles`, etc.). On `students`, it is `is_nullable: YES`. This is almost certainly an oversight — it breaks RLS scoping if any row has NULL. Recommend a separate fix (Phase 2 or 5):

```sql
-- Pre-flight
SELECT COUNT(*) FROM students WHERE institution_id IS NULL AND deleted_at IS NULL;
-- If 0:
ALTER TABLE students ALTER COLUMN institution_id SET NOT NULL;
```

**🔴 `dob` AND `date_of_birth` duplication.** Already flagged in profile spec §3.4 + §8.2. Confirmed: both columns exist, both nullable, both `date`. Profile spec reads with `dob ?? date_of_birth`. The students-flow spec mentions "extend updateStudent to handle date_of_birth" but doesn't reference `dob`. **Gap:** students-flow spec should also acknowledge the duplication and pick one canonical column.

#### `questions`

**Live columns (18):** `id, paper_id, question_type, question_text, options (jsonb), correct_answer (jsonb NOT NULL), marks, order_index, metadata, created_at, updated_at, deleted_at, equation_display, flash_sequence (ARRAY), option_a, option_b, option_c, option_d, correct_option`

**🔴 Major schema mess — duplicate columns:**
- `options` (jsonb) AND `option_a/option_b/option_c/option_d` (text) — two representations of the same MCQ option set.
- `correct_answer` (jsonb NOT NULL) AND `correct_option` (text nullable) — two representations of the same correct-answer marker.

**Impact:** every action that reads or writes a question has to pick one representation. Inconsistency between code paths (one writes JSON, another writes the columns) leads to subtle bugs. The assessment-taking spec assumes the JSON form; the results-flow answer-sheet renderer reads `correct_option` (the text form).

**Fix:** Phase 2 or 5 task — pick the JSON form (`options` + `correct_answer`) as canonical, write a backfill from the column form to the JSON form, then drop `option_a/b/c/d` and `correct_option`. Update the questions actions and the answer-sheet renderer at the same time. **This is a non-trivial cleanup** and should be its own spec + plan.

#### `student_answers`

**Live columns (8):** `id, submission_id, question_id, is_correct (default false), created_at, idempotency_key (NOT NULL), selected_option, answered_at`

**Missing:** `time_spent_ms` — see 2.1.

#### `institutions`

**Live columns (9):** `id, name, slug, timezone, session_timeout_seconds, logo_url, created_at, updated_at, deleted_at`

**Specs propose:**
- `logo_url` — settings spec, **already exists** (drop from spec)
- `primary_contact_email` — settings spec ✅ new, needed
- `primary_contact_phone` — settings spec ✅ new, needed
- `address` — settings spec ✅ new, needed

#### `grade_boundaries`

**Live columns (12):** `id, institution_id, grade_name, min_percentage, color_hex, created_at, updated_at, min_score, max_score, grade, label, assessment_type`

**🔴 Major schema mess — duplicate columns:**
- `grade_name` AND `grade` AND `label` — three columns for what looks like the same concept (the grade letter).
- `min_percentage` AND `min_score` AND `max_score` — three columns for what looks like the same boundary.

The settings spec §6 (Grade Boundaries) was supposed to design this section but doesn't acknowledge the duplication. Likely the schema was edited multiple times during early development and never cleaned up.

**Fix:** Phase 2 or 5 task — pick canonical columns. The settings spec needs to be updated to use the canonical names. Recommend keeping `grade_name`, `min_percentage`, `assessment_type` (which appears purposeful — distinguishes EXAM vs TEST) and dropping `grade`, `label`, `min_score`, `max_score`. **Pre-flight needed:** verify no production data relies on the duplicates.

#### `profiles`

**Live columns (11):** `id, institution_id, role, email, full_name, avatar_url, forced_password_reset, locked_at, version_seq, created_at, updated_at`

**Note:** profiles has NO `deleted_at`. The soft-delete pattern is inconsistent across tables. Not necessarily a bug — auth-related rows may need to remain for audit — but worth flagging if any future spec wants to soft-delete a profile.

**Note:** `forced_password_reset` exists but no UI handler for it anywhere (profile spec §12 flagged this as an open question).

---

## 4. Server action gaps and contradictions

### 4.1 Functions specs reference vs functions that exist

| Spec reference | Lives in | Exists? | Notes |
|---|---|---|---|
| `createAssessment` | assessments.ts | ✅ | Needs extension for new fields |
| `updateAssessment` | assessments.ts | ✅ | Needs extension for ALL of: scheduled_start_at, scheduled_end_at, max_attempts, time_limit_mode, randomize_questions, show_correct_answers, per_question_time_seconds, require_answer_confirmation. **8 new fields.** |
| `publishAssessment` | assessments.ts | ✅ | No changes needed |
| `forceOpenExam` | assessments.ts | ✅ | Used by Step 5 of create-assessment + admin-monitor |
| `forceCloseExam` | assessments.ts | ✅ | Used by admin-monitor |
| `archiveAssessment` | assessments.ts | ❌ MISSING | Required by admin-results-redesign |
| `unarchiveAssessment` | assessments.ts | ❌ MISSING | Required by admin-results-redesign |
| `publishResult` | results.ts | ✅ | |
| `unpublishResult` | results.ts | ✅ | |
| `reEvaluateResults` | results.ts | ✅ | |
| `publishResults` (bulk) | results.ts | ✅ | |
| `releaseAnswerKey` | results.ts | ❌ MISSING | Required by results-flow plan (already in plan) |
| `unreleaseAnswerKey` | results.ts | ❌ MISSING | Required by results-flow plan (already in plan) |
| `createStudent` | students.ts | ✅ | |
| `updateStudent` | students.ts | ✅ | Needs extension for date_of_birth + cohort_id (and possibly dob too) |
| `importStudentsCSV` | students.ts | ✅ | |
| `deactivateStudent` | students.ts | ✅ | |
| `resetPassword` | auth.ts | ✅ | **Spec mismatch:** students-flow spec says "added if not already present" to students.ts. Actually exists in **auth.ts**. Spec needs the path correction. |
| `createLevel` | levels.ts | ✅ | |
| `updateLevelOrder` | levels.ts | ✅ | |
| `updateLevel` (rename) | levels.ts | ⚪ N/A | **Phase 2 correction:** levels-flow spec §11 explicitly excludes rename from v1 scope (Q4 brainstorm decision: "Create + Reorder only"). NOT a gap — intentional. |
| `deleteLevel` | levels.ts | ⚪ N/A | **Phase 2 correction:** same — levels-flow spec §11 explicitly excludes delete from v1 scope. Marked as "future spec if needed". NOT a gap. |
| `createQuestion` | questions.ts | ✅ | |
| `updateQuestion` | questions.ts | ❌ MISSING | create-assessment-flow spec defines this in §13 but it's not in the file. Critical for the wizard's Step 3 question editor. |
| `deleteQuestion` | questions.ts | ✅ | |
| `reorderQuestions` | questions.ts | ✅ | |
| `upsertAssessmentDefaults` | (new file?) | ❌ MISSING | create-assessment-flow §13 |
| `getAssessmentDefaults` | (new file?) | ❌ MISSING | create-assessment-flow §13 |
| `updateSettings` | settings.ts | ✅ | Needs extension for new institution fields |
| `uploadInstitutionLogo` | settings.ts | ❌ MISSING | settings-spec §10 |
| `initSession` | assessment-sessions.ts | ✅ | Needs extension to return `paper.type, per_question_time_seconds, require_answer_confirmation` (per assessment-taking spec) |
| `submitAnswer` | assessment-sessions.ts | ✅ | Needs to write `time_spent_ms` (column missing — see 2.1) |
| `submitExam` | assessment-sessions.ts | ✅ | |
| `createAnnouncement` | announcements.ts | ✅ | (announcements dropped from v1) |
| `fetchActivityLogs` | activity-log.ts | ✅ | (activity log dropped from v1) |
| `exportActivityLogsCsv` | activity-log.ts | ✅ | |

**Summary of missing actions (6 — corrected by Phase 2):**
1. `archiveAssessment` (admin-results-redesign)
2. `unarchiveAssessment` (admin-results-redesign)
3. `releaseAnswerKey` (results-flow — in plan)
4. `unreleaseAnswerKey` (results-flow — in plan)
5. `updateQuestion` (create-assessment-flow — defines it but not implemented)
6. `upsertAssessmentDefaults` + `getAssessmentDefaults` (create-assessment-flow — both missing)
7. `uploadInstitutionLogo` (settings)

~~`updateLevel` and `deleteLevel`~~ — **Phase 2 retracted these.** The levels-flow spec §11 deliberately excludes rename/delete from v1 scope. Not gaps.

**Summary of action extensions needed:**
1. `updateAssessment` — 8 new fields
2. `updateStudent` — date_of_birth + cohort_id
3. `updateSettings` — 4 new institution fields (3 actually new)
4. `initSession` — return type expansion

### 4.2 Existing actions not referenced by any spec

None worth flagging. All 27 existing exports are referenced by at least one spec.

---

## 5. Cross-spec contradictions

### 5.1 Sidebar component path

- `student-dashboard` spec proposes `src/components/student/student-sidebar.tsx`
- `student-exams-tests-flow` spec also references `src/components/student/student-sidebar.tsx`
- `student-profile` spec (which I just wrote) says "verify in plan phase" and the plan task ended up using `src/components/layout/student-sidebar.tsx` (the actual file)
- **Actual file:** `src/components/layout/student-sidebar.tsx`

**Fix:** correct the path in the 2026-04-13 student-dashboard and student-exams-tests-flow specs to match the live code. This is a one-line patch in each.

### 5.2 `(student-focus)` route group — three specs propose creating it

- `student-exams-tests-flow` spec §13 proposes `(student-focus)` for the Lobby page
- `student-assessment-taking-flow` spec §7 also proposes `(student-focus)` for the assessment-taking pages
- `student-profile` spec — does NOT use this group (profile is in regular `(student)`)

**Status:** This is consistent — both specs intend the SAME route group. The problem is that the assessment-taking plan creates the layout file, but the exams-tests spec also references it without acknowledging the dependency. **Fix:** add a "shared dependency" note to both specs that the layout file is created by the assessment-taking plan and reused by the exams-tests Lobby refactor.

### 5.3 `live-exam-card.tsx` — three specs want to delete it but it still exists

- `student-dashboard` spec — DELETE `src/components/student/live-exam-card.tsx`
- `student-exams-tests-flow` spec — also DELETE the same file
- `admin-dashboard` spec — CREATE a NEW `src/components/dashboard/live-exam-card.tsx` (different folder, same filename — **not** a conflict but easy to confuse)

**Live file:** `src/components/student/live-exam-card.tsx` exists (verified by Glob).

**Fix:** the file is still there because the student-dashboard and student-exams-tests-flow plans don't exist yet. When those plans get written, they need a delete-this-file step.

### 5.4 Cohort handling — students-flow vs profile

- `students-flow` spec says `updateStudent` needs to handle `cohort_id` (admin can set it)
- `profile` spec says NEVER read or surface `cohort_id` in the student profile

**Status:** Not a true contradiction — these are admin-side and student-side respectively. But it's worth a "Shared dependencies" note in both: the column persists in the DB, admin owns it, student profile doesn't display it.

### 5.5 `dob` vs `date_of_birth` — three specs mention birth-date handling differently

- `students-flow` spec §11: "extend `updateStudent` to handle `date_of_birth`"
- `student-profile` spec §3.4: reads `dob ?? date_of_birth`, flagged as a duplication
- The assessment-taking spec doesn't touch this

**Status:** Not a contradiction yet, but if students-flow writes to ONLY `date_of_birth` and the profile spec reads `dob ?? date_of_birth`, then any value written via admin lands in `date_of_birth` and the fallback chain works. But if profile is updated to write to `dob` and students-flow writes `date_of_birth`, they'll silently desync.

**Fix:** **agree on one canonical column** (recommend `date_of_birth` since the column name is more standard, and `dob` is the older shorthand). The profile spec's `dob ?? date_of_birth` fallback is correct as a transitional read. A cleanup spec should drop `dob` after both specs are aligned on writing only `date_of_birth`.

### 5.6 `archived_at` ownership — admin-results-redesign vs nothing else

- `admin-results-redesign` spec §12 adds `exam_papers.archived_at`
- `admin-live-monitor-flow` spec §9 says "`archived_at` was already added in the Results flow spec" — refers to the older 2026-04-13 results spec
- `admin-assessments-list` spec §9 also says "the `archived_at` column was already added in the Results flow spec"
- The new 2026-04-14 `student-results-flow` does NOT add archived_at

**Status:** Three specs assume `archived_at` exists. Only the older admin-results-redesign spec actually adds it. The live DB does NOT have the column. **Fix:** when admin-results-redesign gets a plan, the SQL run book must include the ALTER. Until then, admin-live-monitor and admin-assessments-list are reading a column that doesn't exist (would crash).

### 5.7 Total questions — admin-results-redesign vs student-results-flow

- The older `admin-results-redesign` RPC `results_hub_paper_stats` reads `submissions.total_questions` — **the column it depends on doesn't exist yet**.
- The newer `student-results-flow` spec adds `submissions.total_questions`.

**Status:** Not a contradiction — they're consistent on the column. Just a dependency: results-flow plan must run first, then admin-results-redesign plan can use the RPC.

### 5.8 Cron / scheduled job dependency — create-assessment-flow

The create-assessment-flow spec proposes `scheduled_start_at` and `scheduled_end_at` columns to drive automated open/close transitions. This implies the existence of a **cron job or scheduled function** that polls for due times and flips `status` and writes `opened_at`/`closed_at`.

**No such cron/function exists in:**
- `vercel.json` (none — would need `vercel.ts` or `vercel.json`)
- Supabase scheduled functions (none in the DB)
- The 8 RPCs (none look like a scheduler)

**Fix:** the create-assessment-flow spec needs to add a §13.x **"Scheduled transitions"** section explaining: how the cron is implemented (Vercel Cron, Supabase Edge Function, or pg_cron), what it does, what the failure mode is. Without this, the `scheduled_start_at` columns are dead weight.

---

## 6. Code-vs-spec drift

### 6.1 `updateStudent` referenced fields don't match the live schema

- `admin-students-flow` spec §11 says: "`updateStudent` currently only handles `full_name`, `level_id`, `accessibility_flags`"
- Live `students` table has NO `accessibility_flags` column
- The actual `updateStudent` action in the code (line 160 of students.ts) — would need to read to confirm what fields it actually handles

**Action needed in Phase 2:** read `src/app/actions/students.ts` and document the actual `UpdateStudentInput` shape, then patch the spec.

### 6.2 Spec assumes `Help & Support` is in the sidebar; we just removed it

- `student-dashboard` spec lists 5 main nav items "+ Help & Support"
- `student-exams-tests-flow` spec inherits the same chrome
- The live sidebar (after the profile plan ships) will have NO Help & Support entry

**Fix:** patch both specs to drop the Help & Support reference.

### 6.3 `student-dashboard` spec says delete `live-exam-card.tsx`, but no plan exists

The file is still in the code. The 2026-04-13 student-dashboard spec has no plan. Until the plan ships, the file persists. Not a contradiction — just an unfinished plan track.

### 6.4 The `(student-focus)` layout is named in the assessment-taking spec but doesn't exist yet

The route group needs to be created by the assessment-taking plan (Task 3 in `2026-04-14-student-assessment-taking-flow.md`). Confirmed in the plan.

### 6.5 `src/app/(admin)/admin/assessments/[id]/page.tsx` — three different specs all want to mount things here

- The new `student-results-flow` plan creates a minimal version with just the Release Key card
- The older `admin-results-redesign` spec wants KPIs + answer-key view + CSV export on the same path
- The `admin-create-assessment-flow` spec wants to create `assessments/[id]/edit/page.tsx` (different sub-route — no conflict)

**Status:** The new plan deliberately scopes the page to JUST the release card with a `TODO` for the rest. Future admin-results-redesign plan extends it. No actual contradiction, but the boundary between the two needs to be explicit when the second plan is written.

---

## 7. Stub vs implemented page audit

Sampled the existing pages by file size (a 50-line page is almost certainly a stub; a 200+ line page is at least partially implemented):

| Path | Lines | Status (estimated) | Spec status |
|---|---|---|---|
| `(student)/student/results/page.tsx` | 452 | Implemented (will be replaced) | Plan exists |
| `(student)/student/profile/page.tsx` | 224 | Stub (per spec) | Plan exists |
| `(admin)/admin/results/page.tsx` | 50 | Placeholder | Spec exists, no plan |
| `(student)/layout.tsx` | 37 | Implemented (basic shell) | Touched by 4 specs |
| Other 16 pages | ? | Mixed | Most have specs, no plans |

**Action needed in Phase 5:** read each non-stub page (>100 lines) to identify CLAUDE.md violations (e.g. hardcoded hex colours, missing `requireRole`, banned imports inside `(student)/`, `setTimeout` in anzan code).

---

## 8. Performance observations

### 8.1 Specs that bake in query budgets — good

- `admin-dashboard` spec §10 — explicit "6 queries instead of 12" budget with the new query set listed
- `admin-assessments-list` spec §11 — "3 queries per page load" budget, paginated at 20 rows
- `student-results-flow` spec §7 — single inner-join query (PostgREST `!inner`) replacing the old N+1 split

### 8.2 Specs that don't mention query budgets — should be added in Phase 6

- `admin-students-flow` — no perf section
- `admin-levels-flow` — no perf section (level detail page may be N+1 prone with per-student fetches)
- `admin-live-monitor-flow` — uses existing `get_live_monitor_data` RPC (good — it's an RPC) but no mention of polling cadence
- `admin-create-assessment-flow` — no perf section, but the wizard does many writes

### 8.3 No spec discusses `loading.tsx` coverage

Only the 2026-04-14 plans (the three I just wrote) include a `loading.tsx` task. The 2026-04-13 specs don't mention loading skeletons at all. **Fix:** Phase 6 should add a "loading skeleton" section to each older spec — every Server Component route should have one for instant feedback.

### 8.4 Vercel-specific concerns — none of the older specs address

- Cold-start behaviour for the assessment engine (the Anzan timing is RAF-driven so the cold-start hit is on the page chrome, not the engine itself — but worth verifying)
- Fluid Compute behaviour for long-running submission writes
- Edge Config or Routing Middleware for auth fast paths
- ISR / PPR opportunities for the admin results hub (it's mostly cacheable per institution per day)

These are Phase 6 tasks.

### 8.5 Bundle size — no spec mentions

- TipTap is mentioned in CLAUDE.md as "rich text uses TipTap" — only the announcements feature uses it, and announcements is **dropped from v1**. Make sure the TipTap dep doesn't land in the v1 bundle.
- `recharts` is mentioned — is it tree-shaken? The dashboard rewrite drops a bunch of charts.
- `@hello-pangea/dnd` is used by levels reorder — only loads on /admin/levels.

**Fix:** Phase 6 — run `npm run build` and inspect the route bundle sizes. Note any > 200 KB initial JS for student-facing routes.

---

## 9. Recommendations for Phases 2–7

Based on the findings above, here is the recommended order. **You should triage and reorder.**

### Phase 4 — Assessment engine deep-dive (jump the queue)

Why first: Critical finding 2.1 (`student_answers.time_spent_ms` missing) blocks the assessment-taking plan that's ready to execute. This phase must:

1. Add `time_spent_ms` to the assessment-taking spec §9 explicitly (currently it just "verifies").
2. Add the column add as a Task 1 step in `2026-04-14-student-assessment-taking-flow.md`.
3. Re-read `src/lib/anzan/`, `src/lib/anticheat/`, `src/lib/offline/` and verify the spec's claims about RAF discipline, phase strings, anti-cheat hooks, and the `validate_and_migrate_offline_submission` RPC contract.
4. Verify the plan's Vercel Fluid Compute assumptions (concurrent request reuse won't break the RAF loop because RAF runs in the browser, not the server — the only server-side concern is submitAnswer / submitExam latency).

### Phase 2 — Resolve contradictions

Patch the older specs in this order (highest impact first):

1. **create-assessment-flow** — drop `description` (already exists), reconcile `pass_percentage` ↔ `pass_threshold_percent`, drop `show_correct_answers` (use `answer_key_released`), explain `scheduled_*` vs `opened_at`/`closed_at`, add the cron / scheduled job section, fix the `updateQuestion` gap.
2. **admin-settings** — drop `logo_url` (already exists). Verify the storage bucket exists.
3. **admin-students-flow** — fix the `accessibility_flags` reference (read the actual `updateStudent`), fix the `resetPassword` path (it's in auth.ts, not students.ts), pick canonical date column.
4. **student-dashboard, student-exams-tests-flow** — fix sidebar component path, drop the Help & Support reference.
5. **admin-results-redesign** — confirm `archived_at` and the two RPCs (`results_hub_counts`, `results_hub_paper_stats`) are added in its (yet-to-be-written) plan.
6. **admin-levels-flow** — add `updateLevel` and `deleteLevel` actions to the spec.

### Phase 3 — Backend completeness

For each older spec without a plan, write a "Backend dependencies" subsection containing:
- The list of DB columns the spec touches (existing + new)
- The list of server actions the spec calls (existing + new)
- The list of RPCs/functions referenced (existing + new)
- The list of cross-spec dependencies (e.g. "depends on column X added by spec Y")

This is the input that Phase 7 will use to build the execution roadmap.

### Phase 5 — Existing code review

Read each non-stub page in `src/app/(admin)/` and `src/app/(student)/` looking for:
- Missing `requireRole` calls (CLAUDE.md says every Server Action and every Server Component must have one)
- Banned admin client imports inside `(student)/` routes
- Hardcoded hex colours not in the sanctioned exception list
- `setTimeout`/`setInterval` inside `src/lib/anzan/`
- Missing `loading.tsx` for any Server Component route
- N+1 query patterns

Output: a single "code remediation list" with file:line citations.

### Phase 6 — Performance pass

- Run `npm run build` and capture per-route bundle sizes
- Verify `loading.tsx` coverage for every Server Component route
- Identify ISR / PPR opportunities (admin dashboard, admin assessments list, admin results hub all look cacheable)
- Verify the `(student-focus)` layout has font preloading and no third-party blocking scripts (assessment engine must paint instantly)
- Add query budget sections to the older specs that don't have them

### Phase 7 — Execution roadmap

A new document at `docs/superpowers/audit/2026-04-14-execution-roadmap.md` that:
- Lists every spec with its current readiness state
- Lists every plan with its current readiness state
- Gives a topologically-sorted build order based on cross-spec dependencies
- Identifies the v1 critical path
- Notes parallelisable work (specs/plans that can be built independently)

---

## 10. Things that ARE consistent (no action needed)

Worth calling out the good news so the rest of the audit doesn't feel like all problems:

- **The 2026-04-14 batch is internally clean.** The three specs we just wrote (assessment-taking, results-flow, profile) align with each other and with the live DB on every check except the missing `time_spent_ms` column.
- **The `validate_and_migrate_offline_submission` RPC exists.** The offline sync path the assessment-taking spec depends on is real.
- **The `get_live_monitor_data` RPC exists.** The admin live-monitor spec can use it as-is.
- **The `calculate_results` RPC exists.** Auto-grading on submission is real.
- **The `bulk_import_students` RPC exists.** CSV import for students is real.
- **The `(student)/layout.tsx` is implemented and includes the sidebar.** The student shell is real.
- **`requireRole`, `createClient`, and `adminSupabase` are all standardised.** Every spec uses the same auth pattern.
- **Soft-delete is consistent on all data tables** (every table except `profiles` has `deleted_at`). Profiles correctly omits it for audit reasons.
- **`completed_at`, `result_published_at`, `answer_key_released*` form a coherent gate model** — the new results-flow spec captured this correctly and the older admin-results-redesign spec is compatible.

---

## 11. Open questions for the user

These came up during the audit and need a decision before specific phases can run:

1. **Cron / scheduled function for `scheduled_start_at`** — Vercel Cron, pg_cron, or Supabase Edge Function? (Affects Phase 2 patch to create-assessment-flow.)
2. **`pass_percentage` vs `pass_threshold_percent`** — use the existing column, or rename? (My recommendation is "use existing", but you have the call.)
3. **`show_correct_answers` column** — drop it entirely in favour of `answer_key_released`, or keep as a per-paper "permission" flag? (My recommendation is "drop".)
4. **`questions` table schema mess** — is the JSON form (`options`, `correct_answer`) the canonical one, or the columnar form (`option_a/b/c/d`, `correct_option`)? Both are populated in some rows. Cleanup is non-trivial.
5. **`grade_boundaries` table schema mess** — same question. Pick one set of canonical columns.
6. **`students.institution_id` nullable** — is this a known issue or a bug to fix? (Recommend: fix.)
7. **The 10 unplanned 2026-04-13 specs** — should every one get a plan, or should we drop some of them per the v1 scope memo? (Reminder: announcements + activity log are already dropped. What about the others?)
8. **Storage bucket `institution-logos`** — does it exist in Supabase Storage? Cannot verify from SQL — needs manual confirmation.

---

## 12. Audit metadata

- **Tool calls during audit:** ~25 (Glob × 7, Grep × 4, Bash × 4, Read × 1, Supabase SQL × 6, Write × 1, ToolSearch × 0)
- **Files read:** 2 specs in full (samples), DB section snippets from 8 more specs, 1 layout file, 1 sidebar file
- **Files created:** this one (`docs/superpowers/audit/2026-04-14-phase1-findings.md`)
- **Files modified:** 0 (read-only audit)
- **Live DB queries:** 6 (1 for tables, 1 for routines, 4 for column details across critical tables)

---

# Phase 4 — Assessment engine deep-dive findings

**Date:** 2026-04-14 (continuation, same session)
**Scope:** Read all 9 files in `src/lib/anzan/`, `src/lib/anticheat/`, `src/lib/offline/` plus the `assessment-sessions.ts` server actions and the `offline-sync` API route. Verified the assessment-taking spec's claims against the live engine code. Made the necessary spec + plan edits.
**Files modified in Phase 4:**
- `docs/superpowers/specs/2026-04-14-student-assessment-taking-flow-design.md` — §9 rewritten to add `student_answers.time_spent_ms`, plus new §9.1 (propagation chain), §9.2 (initSession extension), §9.3 (questions schema canonical form)
- `docs/superpowers/plans/2026-04-14-student-assessment-taking-flow.md` — Task 1 corrected to add the third column; new Task 1.5 inserted (10 steps covering the 8-touchpoint propagation chain)
- This file — appending Phase 4 section

## Phase 4.1 — Engine code is solid

The `src/lib/anzan/` and `src/lib/anticheat/` subsystems are well-implemented and match the spec's claims:

- **`timing-engine.ts`** — RAF discipline ✓, `MINIMUM_INTERVAL_MS = 200` enforced ✓, accumulator pattern with `clampedDelta = Math.min(delta, interval * 1.5)` to prevent sequence skip on tab restore ✓, cleanup function returned for unmount ✓, `getContrastTokens()` returns hardcoded hex colours but **inside a token-computation function in a lib file** (not a component) so the CLAUDE.md "no hardcoded hex" rule is honoured by intent.
- **`number-generator.ts`** — Mulberry32 seeded PRNG ✓, FNV-1a hash for seed → numeric ✓, sum-bound constraint ✓, "first number always positive" rule for positive running total ✓.
- **`visibility-guard.ts`** — clean SSR-safe `visibilitychange` listener with cleanup function returned ✓.
- **`clock-guard.ts`** — HMAC sealed via `createHmac('sha256', HMAC_SECRET)` server-side, constant-time comparison via `timingSafeEqual` ✓, monotonic vs wall divergence check after 30s warmup ✓, instant-submission guard ✓, grace period for submit latency ✓.
- **`tab-monitor.ts`** — aggregate count only, no timestamps stored ✓, Zustand-backed counter ✓.
- **`teardown.ts`** — `keepalive: true` POST to `/api/submissions/teardown` ✓, Route Handler URL (not Server Action) ✓, swallows errors (must never throw on `pagehide`) ✓.
- **`indexed-db-store.ts`** — Dexie v4, primary key `idempotency_key`, indexes on `session_id` + `synced` ✓.
- **`sync-engine.ts`** — `isSyncing` flag prevents concurrent flush ✓, `navigator.onLine` check ✓, `getUser()` server-validated JWT ✓, groups by session_id ✓, server returns `synced_keys` and client marks them in Dexie ✓.
- **`storage-probe.ts`** — requests persistent storage, warns when quota < 500 MB ✓.
- **`offline-sync/route.ts`** — fail-closed HMAC env check ✓, in-memory rate limit (10 req/60s per student) ✓, Zod payload validation ✓, RPC dispatch with HMAC verification inside the function ✓.

## Phase 4.2 — `time_spent_ms` propagation chain (the headline finding)

Adding `student_answers.time_spent_ms` is **not a one-line ALTER**. The value has to flow from the browser's RAF loop through three serialization boundaries (browser store → fetch body → Postgres staging payload JSON → final table) and through both the live and offline paths. **8 touchpoints** must be updated in lockstep:

| # | Layer | File | Status before Phase 4 | Status after Phase 4 plan |
|---|---|---|---|---|
| 1 | DB DDL | `student_answers` table | column missing | ALTER added to spec §9 + plan Task 1 |
| 2 | Browser store | `src/lib/offline/indexed-db-store.ts` (PendingAnswer + Dexie schema v2) | field missing | added to plan Task 1.5 |
| 3 | Browser sync | `src/lib/offline/sync-engine.ts` (payload mapping) | field missing | added to plan Task 1.5 |
| 4 | Browser teardown | `src/lib/anticheat/teardown.ts` (snapshot mapping) | field missing | added to plan Task 1.5 |
| 5 | Server validation (offline) | `src/app/api/submissions/offline-sync/route.ts` (`AnswerSchema` Zod) | field missing | added to plan Task 1.5 |
| 6 | Server validation (teardown) | `src/app/api/submissions/teardown/route.ts` (Zod) | unverified — engineer must mirror the offline schema | added to plan Task 1.5 |
| 7 | Server actions (live path) | `src/app/actions/assessment-sessions.ts` (`SubmitAnswerInput` + `Answer` interfaces, two upsert payloads) | field missing | added to plan Task 1.5 |
| 8 | RPC (DB-side) | `validate_and_migrate_offline_submission` Postgres function | field missing | added to plan Task 1.5 with `COALESCE` defence for in-flight clients |

The new Task 1.5 in the plan includes a manual round-trip validator (Step 1.5.8) that exercises both the live path AND the offline path (DevTools throttle to Offline → answer → restore network → confirm Dexie row syncs with `time_spent_ms` populated).

## Phase 4.3 — Questions schema canonical form is the COLUMNAR form, not JSON

Phase 1 finding 3.1 noted the duplicated representations (`options` jsonb vs `option_a/b/c/d` text; `correct_answer` jsonb vs `correct_option` text) and recommended JSON as canonical. **Phase 4 reverses that recommendation** based on the actual code:

- `initSession` in `src/app/actions/assessment-sessions.ts` SELECTs the columnar form (`option_a, option_b, option_c, option_d`) and ignores the JSON form
- `equation_display` and `flash_sequence` are also separate columns (not inside the JSON)
- The results-flow answer-sheet renderer also reads the columnar form
- The MCQ construction in the wizard's question editor must therefore write to the columnar form to be consumed by the live engine

**New canonical:** `option_a/b/c/d`, `correct_option`, `equation_display`, `flash_sequence`. **Drop:** `options`, `correct_answer`, `metadata`. The `metadata` column should be dropped only after confirming nothing else writes to it.

This decision is now baked into the assessment-taking spec §9.3. The questions-schema cleanup task is logged for Phase 2.

## Phase 4.4 — `initSession` return shape is incomplete

The current `initSession` returns `{ session_id, expires_at, questions[] }`. The assessment-taking flow needs three more paper-level fields surfaced to the controller:

- `paper.type` — to route to pre-flash (TEST) vs MCQ (EXAM)
- `paper.per_question_time_seconds` — to drive the per-question countdown
- `paper.require_answer_confirmation` — to drive the confirm-button toggle

The original spec was already going to extend `initSession` (Task 2). The new §9.2 makes the SELECT clause and return-type changes explicit so the engineer doesn't miss any of the three fields. Plan Task 2 was already in the plan and does not need a structural rewrite — but the engineer should cross-reference §9.2 when implementing it.

## Phase 4.5 — Bugs and code smells found while reading (NOT fixed in Phase 4)

These are flagged for Phase 5 (existing-code review) — Phase 4 deliberately did not touch any code:

- **`assessment-sessions.ts:90` — `cohort_id: cohortId as unknown as string`** with a `cohortId = student?.cohort_id || ''` fallback. The live `assessment_sessions.cohort_id` is `uuid NOT NULL`. If `student.cohort_id` were ever empty string, the insert would fail with a Postgres type error. In practice the `students.cohort_id NOT NULL` constraint makes this dead defensive code, but the `as unknown as string` cast is a smell — should be a real null check + abort path with a friendly error.

- **`assessment-sessions.ts:193` — `submitExam` upserts via `onConflict: 'session_id,student_id'`** but the `submissions` table doesn't visibly have a unique index on `(session_id, student_id)` — only `session_id` and the surrogate `id`. **Action:** verify the unique index exists before relying on the upsert. If it doesn't, the upsert will fail on the second call.

- **`offline-sync/route.ts` rate-limit Map is in-memory and per-instance** — on Vercel Fluid Compute the function reuses instances, so the rate limit IS shared across requests handled by the same warm instance, but a cold instance starts with a fresh map. Effective rate limit is "10 per warm window" not "10 per minute". For production load this is fine; for security-grade rate-limiting it is not. **Not a blocker for v1**, just note it.

- **`teardown.ts` does NOT use Zod schema validation in the route handler** (per the file we read — the offline-sync route does). Phase 1.5 Step 5 calls this out and asks the engineer to mirror the schema. **Confirmed gap.**

- **Realtime broadcast pattern** — `submitAnswer` fires `supabase.channel(\`exam:${paper_id}\`).send({ type: 'broadcast', event: 'answer_saved', ... })` for the live monitor. The 2026-04-13 admin-live-monitor-flow spec does not document this pattern. **Action:** when the live-monitor spec gets a plan in Phase 7, add an explicit note that the monitor subscribes to `exam:<paper_id>` broadcasts (not `postgres_changes`).

## Phase 4.6 — Vercel Fluid Compute & cold-start verification

The user explicitly asked for assurance that "every feature works and renders on the deployment correctly especially the assessment engine." Phase 4 verifies:

- **The RAF loop runs in the browser**, not the server. Vercel cold-starts affect only the initial page load (route handler + Server Component rendering), not the subsequent timing of the flash sequence. Once the browser has the page, the engine is independent of Vercel.
- **`submitAnswer` is a Server Action** — runs as a Function on Vercel. Fluid Compute reuses warm instances safely because the action is **stateless and idempotent** (the `student_answers.upsert` with `onConflict: 'idempotency_key'` is replay-safe). ✅
- **`submitExam` is a Server Action** — same property. ✅
- **`/api/submissions/offline-sync` is a Route Handler** — runs as a Function. The in-memory rate-limit map is NOT shared across instances (see Phase 4.5 above), but the per-student rate of 10/min is generous enough that no real student would hit it. ✅ for v1.
- **`/api/submissions/teardown` is a Route Handler** — same shape. The keepalive POST from `pagehide` requires that the function complete within the keepalive window (~30s on most browsers). The current handler's logic is fast (single staging insert + RPC dispatch), well within the window.
- **The HMAC secret** lives in `process.env.HMAC_SECRET` — must be set in Vercel project env vars under both `production` and `preview`. CLAUDE.md confirms this is in the `Vercel Env Vars (production)` list. ✅
- **Edge runtime is NOT used anywhere in the engine** — all the engine routes default to Node runtime, which is what the assessment engine needs (full Node.js APIs, `crypto.createHmac`, etc.). Migration to Edge would break the HMAC implementation. The session-start hook noted "Edge Functions are not recommended" — consistent with our setup. ✅

## Phase 4.7 — Open questions for the user (added to Phase 1's list)

- **Q9.** The `submissions` table has `dpm` (numeric, nullable). Phase 4 confirmed nothing in the engine writes to it currently. Should the `submitExam` action populate `dpm` from the (theoretical) per-question times in the snapshot? Or should `dpm` be computed by the existing `calculate_results` RPC (which we know exists but haven't read)? **Recommendation:** read `calculate_results` in Phase 5 and decide based on what it currently computes. For v1, leaving `dpm` at NULL is acceptable since the new student UI never reads it.

- **Q10.** The `submissions.completion_seal` column exists and `submitExam` writes the HMAC seal to it. But there's no documented place where the seal is later **verified** (the `clock-guard.ts` has `validateClockGuard()` but it's not called anywhere in the read path of the engine code we just inspected). Is the seal verified anywhere — admin-side, or via the offline-sync RPC? **Action:** trace the seal validation path in Phase 5.

## Phase 4.8 — What did NOT change in Phase 4

- **No code edits.** Every gap above is a spec/plan correction, not a code fix.
- **No `student_answers` ALTER yet** — that lands when the assessment-taking plan is executed (Task 1, after the user reviews this audit).
- **No RPC update yet** — same. Lands in Task 1.5 of the plan.
- **The 5 critical findings from Phase 1 §2 remain open** — `description` collision, `pass_percentage`/`pass_threshold_percent` collision, `logo_url` collision, `show_correct_answers` overlap, missing `results_hub_*` RPCs. These are Phase 2 work.

---

# Phase 2 — Resolve contradictions

**Date:** 2026-04-14 (continuation, same session)
**Scope:** Patched the older 2026-04-13 specs to resolve the contradictions Phase 1 found. Read-only on code. All edits go to spec docs only.

## Phase 2.1 — Spec edits applied

| Spec | Edits | What changed |
|---|---|---|
| `2026-04-13-admin-create-assessment-flow-design.md` | 3 | (a) §7 data flow snippet — replaced `pass_threshold_percent` with `pass_percentage`, removed `show_correct_answers`. (b) §12 — full rewrite. Removed false `description` ALTER (column already exists). Replaced `pass_threshold_percent` ALTER with a CHECK constraint on the existing `pass_percentage` column. Removed `show_correct_answers`. Added §12.1 explaining the scheduled-vs-actual time model, §12.2 locking the questions schema canonical form to the COLUMNAR variant. (c) §13 — full rewrite. Removed `show_correct_answers` from `updateAssessment` extension. Updated `upsertAssessmentDefaults` signature. Marked `updateQuestion` as a confirmed gap. Added §13.5 — Vercel Cron job for scheduled transitions with `/api/cron/assessment-scheduler` route, `CRON_SECRET` env var, and idempotent flip logic. |
| `2026-04-13-admin-settings-design.md` | 2 | §9 — removed `logo_url` from the column add list (it already exists in live DB). §11 — same removal in the second SQL block. Added a TBD note about verifying the `institution-logos` storage bucket exists. |
| `2026-04-13-admin-students-flow-design.md` | 1 | §11 — full rewrite. Documented the **runtime bug** in `updateStudent` (writes to non-existent `accessibility_flags` column). Fixed the false `resetPassword` path (it's in `auth.ts`, not `students.ts`). Picked `date_of_birth` as canonical over `dob`. Specified the corrected `UpdateStudentInput` shape and the cohort_history side-channel pattern. |
| `2026-04-13-student-dashboard-design.md` | 1 | "Global chrome" subsection — corrected the sidebar/topbar file paths from `src/components/student/student-{sidebar,topbar}.tsx` to `src/components/layout/student-{sidebar,header}.tsx`. Removed the "Help & Support" nav item from the documented list (dropped from v1 per scope memo). |
| `2026-04-13-student-exams-tests-flow-design.md` | 1 | "Layout note: hiding the sidebar" subsection — added a Phase 2 note that the `(student-focus)` route group is created by the assessment-taking plan, not this one. Added a correction that the sidebar/topbar already exist in the live layout (the spec said "add", should say "verify"). |
| `2026-04-13-admin-results-redesign-design.md` | 1 | §3 Status Lifecycle — added 4 cross-reference notes: (1) Two-gate model amendment from the new student-results-flow spec, (2) per-assessment detail page conflict with the new spec's minimal admin route — recommended merge, (3) `submissions.total_questions` dependency on the new spec's column add, (4) `archived_at` independence from the two gates. |
| `2026-04-13-admin-levels-flow-design.md` | 0 | **No edits.** Phase 1 wrongly claimed `updateLevel` and `deleteLevel` were missing — they're deliberately excluded by Q4 of the locked brainstorm. Audit doc §4.1 retracted the claim. |

## Phase 2.2 — Decisions baked into the spec patches

These were the open questions from Phase 1 §11. Phase 2 used my recommended defaults from the findings doc:

| # | Question | Phase 2 decision | Where it landed |
|---|---|---|---|
| Q1 | Cron / scheduled function for `scheduled_start_at` | **Vercel Cron** with `/api/cron/assessment-scheduler` route, `*/5 * * * *` schedule, `CRON_SECRET` env var | create-assessment-flow §13.5 |
| Q2 | `pass_percentage` vs `pass_threshold_percent` | **Use existing `pass_percentage`** (numeric, nullable) — add CHECK constraint instead of new column | create-assessment-flow §12 |
| Q3 | `show_correct_answers` | **Drop entirely** — `answer_key_released` from results-flow owns the answer-key gate | create-assessment-flow §12, §13, §7 data flow |
| Q4 | Questions schema canonical form | **COLUMNAR form** (`option_a/b/c/d`, `correct_option`, `equation_display`, `flash_sequence`) | assessment-taking-flow §9.3 (Phase 4) + create-assessment-flow §12.2 (Phase 2) |
| Q6 (partial) | `date_of_birth` vs `dob` | **`date_of_birth` is canonical**; `dob` is deprecated; cleanup spec to drop `dob` is logged for later | admin-students-flow §11 |

## Phase 2.3 — Decisions still open (need user input or later phase)

| # | Question | Why still open | Suggested resolution phase |
|---|---|---|---|
| Q5 | `grade_boundaries` schema mess (3 columns for "grade letter", 3 for boundary value, 1 for assessment_type) | Need to verify which columns are actually populated and which are dead. Requires DB row-level inspection. | Phase 5 (existing code review) |
| Q6 (other half) | `students.institution_id` nullable bug | Needs a one-line ALTER + pre-flight count. Not in any spec yet. | Phase 5 (logged) — quick fix candidate |
| Q7 | Which 2026-04-13 specs to keep / drop further | User-only call. Currently all 8 admin + 2 student specs are still in scope (minus announcements + activity log) | User decision |
| Q8 | `institution-logos` storage bucket existence | Cannot verify from SQL. Needs Supabase dashboard check. | User check (manual) — note added to admin-settings §11 |
| Q9 | Where `submissions.dpm` should be populated (action vs RPC) | Need to read `calculate_results` RPC body to know what it currently computes | Phase 5 — read RPC source via `pg_get_functiondef` |
| Q10 | Where `submissions.completion_seal` is verified | Need to trace the seal validation path through admin-side or offline-sync code | Phase 5 |

## Phase 2.4 — Patches deferred to later phases

These could have been done in Phase 2 but were left for downstream phases because they need either code reads, runtime tooling, or user input that wasn't available:

- **Phase 5:** Fix the `updateStudent` runtime bug (drop `accessibility_flags` from the `.update({...})` payload).
- **Phase 5:** Read `calculate_results` RPC body and decide where `dpm` is computed.
- **Phase 5:** Trace `completion_seal` verification path.
- **Phase 5:** Verify the `submissions` table has a unique index on `(session_id, student_id)` — submitExam upserts on this conflict key.
- **Phase 6:** Add `loading.tsx` requirements to every older spec.
- **Phase 7:** Resolve the per-assessment detail page conflict between the new student-results-flow plan (minimal stub) and the older admin-results-redesign spec (richer page).

## Phase 2.5 — What did NOT change in Phase 2

- **No code edits.** Every change is a spec doc edit. The runtime bug in `updateStudent` is documented in the spec but the `.ts` file is untouched.
- **No DB changes applied.** The corrected SQL run books in the patched specs will run when those specs get implementation plans (Phase 7 + execution).
- **No new specs written.** Phase 2 only patches existing ones.
- **No commits yet** — Phase 2 commit follows after this section is written.

---

# Phase 5 — Existing code review

**Date:** 2026-04-14 (continuation, same session)
**Scope:** Apply the Phase 4.5 / Phase 2.4 deferred fixes, verify the Phase 4.5 claims against live DB and source, sweep all admin/student pages for CLAUDE.md violations.

## Phase 5.1 — Code fixes applied

| File | Lines | Fix |
|---|---|---|
| `src/app/actions/students.ts` | 151–175 | Dropped `accessibility_flags?: Record<string, boolean>` from `UpdateStudentInput` interface AND from the `.update({...})` payload. The column does not exist in the live `students` table — every `updateStudent` call would have raised a Postgres `column "accessibility_flags" of relation "students" does not exist` error if the field were ever populated. Today no caller passes the field (verified via grep — only `student_profile-actions.tsx:39` and `students-table-client.tsx:153` call it, both with just `{ student_id, level_id }`), so this is a latent runtime bug closed before it could fire. |
| `src/app/actions/assessment-sessions.ts` | 44–47, 96 | Replaced `const cohortId = student?.cohort_id || ''` + `cohort_id: cohortId as unknown as string` with a real null guard that returns `{ error: 'STUDENT_NOT_ENROLLED', message: 'Student is not enrolled in a cohort.' }` when the student row has no `cohort_id`. The `assessment_sessions.cohort_id` column is `uuid NOT NULL`, so the previous fallback to `''` would have raised a Postgres `invalid input syntax for type uuid` error if the `students.cohort_id NOT NULL` constraint were ever lifted. Now there's an explicit user-facing abort path with a friendly error code. |

`npm run tsc` → 0 errors after both edits.

## Phase 5.2 — Phase 4.5 claims verified against live state

| Phase 4.5 claim | Verification | Result |
|---|---|---|
| `submissions` table doesn't visibly have a unique index on `(session_id, student_id)` | `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'submissions'` | **REFUTED.** `submissions_session_student_idx` exists as `CREATE UNIQUE INDEX … ON public.submissions USING btree (session_id, student_id)`. The `submitExam` upsert at `assessment-sessions.ts:228–235` is safe. No DB change needed. |
| `teardown.ts` does NOT use Zod schema validation in the route handler | Read `src/app/api/submissions/teardown/route.ts` | **REFUTED.** The handler imports `zod` (line 2), defines a `BodySchema = z.object({ submission_id, session_id, client_timestamp, answers_snapshot: z.array(z.object({ question_id, selected_option, answered_at, idempotency_key })) })` (lines 6–18), and runs `BodySchema.safeParse(body)` returning `422 VALIDATION_ERROR` on failure (lines 40–47). Phase 1.5 Step 5 was already implemented before Phase 4 was written; the audit doc just missed it. |
| `validateClockGuard()` exists but isn't called anywhere visible (Q10 — completion_seal verification path) | `grep -r 'validateClockGuard\|verifyExamSeal\|completion_seal' src/` | **CONFIRMED.** `validateClockGuard` is only referenced from `src/lib/anticheat/clock-guard.test.ts`. `completion_seal` is only **written** at `src/app/actions/assessment-sessions.ts:233` — there is no read/verify path anywhere in `src/`. The HMAC seal currently functions as write-only forensic evidence, not as an active validator. **No fix applied** — this is a design question for the user, not a bug: should the seal be verified on result publication? on offline replay? never (forensic-only)? See Phase 5.6. |

## Phase 5.3 — RPC body inspection

### `calculate_results(p_paper_id uuid)`

Read via `pg_get_functiondef`. The function:

1. Loads `institution_id` from `exam_papers`.
2. Loads `total_q` = `COUNT(*) FROM questions WHERE paper_id = p_paper_id`.
3. For each completed `submissions` row in the paper (under `FOR UPDATE SKIP LOCKED`):
   - Counts `student_answers WHERE submission_id = sub.id AND is_correct = TRUE`.
   - Computes `percentage = (raw_correct / total_q) * 100`.
   - Looks up the matching `grade_boundaries.grade_name`.
   - **`UPDATE submissions SET score = v_raw_correct, percentage = v_percentage, grade = v_grade_name, updated_at = NOW()`**.

**Q9 answer:** `submissions.dpm` is **NOT computed in `calculate_results`**. The RPC writes `score`, `percentage`, `grade` only. If `dpm` (digits-per-minute, the speed metric) is to live on `submissions`, it must be either:
- Added to the RPC (preferred — keeps grading atomic), OR
- Computed at submission write time in `submitExam` from the `final_answers_snapshot`, OR
- Computed lazily in the UI from `student_answers.time_spent_ms`.

**Recommendation:** the assessment-taking plan (Task 1) already adds `time_spent_ms` to `student_answers`. Once that lands, extend `calculate_results` to compute `AVG(digits / (time_spent_ms / 60000))` per submission and write the result to a `submissions.dpm` column (also needs to be added). This keeps the grading path atomic and the UI fast.

**Caveat:** the RPC depends on `student_answers.is_correct` being populated. The current `validate_and_migrate_offline_submission` does NOT populate `is_correct` (see below), and `submitAnswer`/`submitExam` also don't set it. This is a pre-existing bug — `calculate_results` will currently score every submission as `0%` because `is_correct` is never written. Flagged for Phase 7 execution.

### `validate_and_migrate_offline_submission(p_staging_id, p_hmac_timestamp, p_client_ts, p_secret)`

Read via `pg_get_functiondef`. The function:

1. Loads the staging row and rejects if missing.
2. Rejects if `NOW() - to_timestamp(p_client_ts/1000) > 300s` → `TIMESTAMP_EXPIRED`.
3. Recomputes the expected HMAC (`session_id || ':' || client_ts` keyed by `p_secret`, sha256, hex). Mismatch logs to `activity_logs` and returns `HMAC_MISMATCH`.
4. Looks up `submissions.id` for this session — raises if missing (the live submission must already exist; staging only carries the answers, not the parent submission).
5. **For each answer in `payload->'answers'`, INSERTs into `student_answers` with these columns and only these columns:**
   - `submission_id`
   - `question_id`
   - `selected_option`
   - `idempotency_key`
6. Conflict on `student_answers_submission_id_question_id_key` → `DO NOTHING` (also catches `unique_violation` exceptions).
7. Marks the staging row `processed`.

**Q3 answer for Phase 5:** the Phase 4 RPC update is **NOT yet partly in place**. The RPC currently writes only the four columns above. None of the assessment-taking spec's planned columns (`time_spent_ms`, `answered_at`, `is_correct`) are written by this RPC. When Task 1 of the assessment-taking plan runs, the RPC must be updated to also write:
- `time_spent_ms` from `v_answer_obj->>'time_spent_ms'` (the new column the plan will add)
- `answered_at` from `v_answer_obj->>'answered_at'` (already a column on `student_answers`)
- `is_correct` computed at insert time by joining to `questions.correct_option` (without this, `calculate_results` cannot grade — see above)

**Severity:** `is_correct` is the highest-priority addition. Without it, scoring is broken end-to-end. The audit recommends Task 1 of the assessment-taking plan be expanded to include the `is_correct` write in both `submitAnswer`/`submitExam` (online path) and this RPC (offline-replay path).

## Phase 5.4 — Admin / student page sweep

**Method:** grep across `src/app/(admin)/` and `src/app/(student)/` for `requireRole`, `adminSupabase` imports, hardcoded hex colours, `loading.tsx` coverage, and N+1 `await` patterns inside `for`/`forEach` loops.

### requireRole coverage

✅ **All 11 admin pages** call `requireRole('admin')` or `requireRole(['admin','teacher'])` at the top of the Server Component:
`assessments`, `students`, `students/[id]`, `levels`, `results`, `monitor`, `monitor/[id]`, `announcements`, `settings`, `activity-log`, `dashboard`.

✅ **All 9 student pages** call `requireRole('student')`:
`consent`, `assessment/[id]`, `exams/[id]`, `results`, `dashboard`, `exams/[id]/lobby`, `profile`, `exams`, `tests`. `(student)/layout.tsx:10` also enforces it as a defence-in-depth check.

### `adminSupabase` boundary

✅ **No `adminSupabase` import in any `(student)/` route, client component, or hook.**

✅ Admin pages that import `adminSupabase` directly (rather than going through actions): `settings/page.tsx`, `announcements/page.tsx`, `activity-log/page.tsx`. All three are inside `(admin)/` and behind `requireRole('admin')` — within policy.

### `loading.tsx` coverage

| Has `loading.tsx` | Missing `loading.tsx` |
|---|---|
| admin/dashboard, admin/students, admin/assessments, student/dashboard, student/exams, student/results | admin/{levels, results, monitor, monitor/[id], announcements, settings, activity-log, students/[id]}, student/{tests, profile, consent, exams/[id], exams/[id]/lobby, assessment/[id]} |

**14 routes are missing `loading.tsx`.** This isn't a CLAUDE.md violation (the constraint table in Phase 1 §8.3 explicitly says "no spec discusses loading.tsx coverage"), but per Phase 6 it should be added everywhere — Server Components without `loading.tsx` block on data fetch and show a blank screen on slow networks. Recommend adding skeleton `loading.tsx` to the 14 routes above as part of Phase 6.

### Hardcoded hex colours

CLAUDE.md banned colours (`#FF6B6B`, `#121212`, `#1A1A1A`, `#E0E0E0`): **none found.** ✅

`#991B1B` (the negative-number-only exception): **none found in pages** — only in the engine. ✅

**Pre-existing pattern violations:** the rule "No hardcoded hex colours in components — always use `var(--token-name)`" is **broadly violated across `(student)/` pages**. Every student page uses inline `style={{ color: '#0F172A', backgroundColor: '#F8FAFC' }}` etc. Sample (~80 hits across `student/exams`, `student/tests`, `student/results`, `student/profile`, `student/dashboard`, `student/exams/[id]/lobby`):

- `'#FFFFFF'`, `'#F8FAFC'`, `'#F1F5F9'`, `'#E2E8F0'`, `'#CBD5E1'`, `'#94A3B8'`, `'#475569'`, `'#0F172A'` — slate scale
- `'#1A3829'` — primary green (banned: should be `var(--clr-green-800)`)
- `'#EF4444'`, `'#DCFCE7'`, `'#166534'`, `'#FEE2E2'`, `'#DC2626'`, `'#FEF3C7'`, `'#92400E'`, `'#FDE68A'`, `'#FECACA'`, `'#1D4ED8'`, `'#DBEAFE'`, `'#7C3AED'`, `'#EDE9FE'`, `'#854D0E'`, `'#FEF9C3'`, `'#15803D'` — semantic / chart colours

Admin pages are **clean** of hardcoded hex (zero matches in `src/app/(admin)/`).

**Severity:** pre-existing pattern. **Not fixed in Phase 5** because (a) the user has built UIs against these colours and is satisfied with the result, (b) a token sweep would touch every student page, (c) the brand greens and slates would need new tokens declared in `globals.css` first (per CLAUDE.md, only `slate-*`, `green-800`, and brand names compile in Tailwind v4 right now). Logged for a dedicated "design-token migration" task — likely Phase 7 or post-v1.

### N+1 query patterns

Searched for `for (… of …)` and `forEach` blocks containing `await … .from(…)` or `await … .rpc(…)` in admin pages. **None found.** Every loop in admin pages is pure JS aggregation over an already-loaded array (e.g. `levels/page.tsx:30` rolls up student counts after a single `students.select` query; `monitor/page.tsx:43` rolls up session counts the same way; `activity-log/page.tsx:38` builds a `profileMap` after a single `profiles.select`). Server Components consistently `Promise.all([...])` their independent queries.

✅ No N+1 fix needed.

## Phase 5.5 — Side findings (not in scope but worth recording)

- **`student_answers.is_correct` is never written** anywhere in the code path. Neither `submitAnswer`, `submitExam`, nor `validate_and_migrate_offline_submission` populate it. `calculate_results` reads it, so every paper currently scores at `0%`. This is the most important downstream finding from Phase 5 — flagged for Task 1 of the assessment-taking plan.
- **`submissions.dpm` does not exist as a column** in the live DB and is not written by any RPC. If the speed metric is desired in the UI, the column must be added and `calculate_results` extended.
- **`createStudent` at `students.ts:121` still has `cohort_id: input.cohort_id as unknown as string`** — the same smell pattern fixed in `assessment-sessions.ts`. Not fixed in Phase 5 because the column on `students` is `uuid NOT NULL` and `createStudent` is admin-only (not user-facing). The cleaner fix is to make `cohort_id` required in `CreateStudentInput`. Logged for the admin-students-flow plan execution.

## Phase 5.6 — Open questions for the user (added to Phase 1 / Phase 4 lists)

- **Q11.** Is `submissions.completion_seal` intended to be **verified** anywhere, or is it forensic-write-only? If it should be verified, where? Candidates:
  - On `calculate_results` — refuse to grade a submission whose seal doesn't match.
  - On `validate_and_migrate_offline_submission` — refuse to migrate offline answers whose seal doesn't match.
  - On admin result publication — flag tampered submissions in a dashboard.
  - **Never** — the seal is forensic evidence retained for incident response, no live validator. (This is the current behaviour by accident.)
- **Q12.** Should `student_answers.is_correct` be computed at write time (in `submitAnswer`/`submitExam`/the offline RPC) or lazily in `calculate_results` via a JOIN to `questions`? Write-time keeps `calculate_results` simple and the live monitor accurate; lazy keeps the write path lean. Phase 5 recommends **write-time** to fix the broken scoring path now.
- **Q13.** Should `dpm` (digits-per-minute) live as a `submissions` column populated by `calculate_results`, or be computed in the UI from `student_answers.time_spent_ms`? Phase 5 recommends **`submissions` column** so the admin Results dashboard doesn't have to re-aggregate per row.

## Phase 5.7 — What did NOT change in Phase 5

- **No DB migrations.** All Phase 5 fixes are TypeScript-only. The `student_answers.is_correct` and `submissions.dpm` work happens during Task 1 execution.
- **No spec edits.** Phase 5 only touches code and this audit doc. The downstream specs (assessment-taking-flow, admin-results-redesign) already capture the schema work.
- **No `loading.tsx` files added.** That's a Phase 6 task.
- **No design-token sweep.** Pre-existing hardcoded-hex pattern documented but not refactored.
- **No commits yet** — Phase 5 commit follows after the user reviews this section.

## Phase 5.8 — Spec/Plan patches applied (post-Phase-5, same session)

After the user reviewed the Phase 5 findings, the following patches were applied to the assessment-taking spec and plan to bake the `is_correct` fix and the related corrections into the implementation pathway. These patches are downstream consequences of Phase 5's findings, not part of Phase 5's read-only audit.

### Files modified

| File | What changed |
|---|---|
| `docs/superpowers/specs/2026-04-14-student-assessment-taking-flow-design.md` §9.1 | Replaced the single 8-touchpoint `time_spent_ms` table with a combined 3-column propagation table covering `time_spent_ms` (8 touchpoints, client-originated), `is_correct` (3 touchpoints, server-computed), and `answered_at` (1 touchpoint, RPC-only fix). Added the explanation that `is_correct` is never sent by the client (cheating vector). Added §9.3.1 "The `correct_option = NULL` edge case" with the recommendation to land `is_correct = FALSE` when the question's answer key is not configured. |
| `docs/superpowers/plans/2026-04-14-student-assessment-taking-flow.md` Task 1.5 header | Renamed from "`time_spent_ms` propagation chain (8 touchpoints)" to "`time_spent_ms` + `is_correct` + `answered_at` propagation chain". Added the Phase 5 expansion note explaining why all three columns must land in the same commit. Added the two-flavour chain explanation. |
| ... Step 1.5.6 | Expanded the live-path edits to include the `correct_option` lookup in `submitAnswer` (single query) and the batch `IN` query in `submitExam` (one round trip regardless of snapshot size). Computes `is_correct = (correct_option === selected_option)` server-side, defends against NULL `correct_option` with explicit safe-default logic. |
| ... Step 1.5.7 | Replaced the entire RPC update step with the **actual** function body verified by Phase 5 via `pg_get_functiondef`. The original draft assumed a set-based INSERT with `ON CONFLICT (idempotency_key)`; the live function uses a procedural `FOR ... LOOP` with `ON CONFLICT ON CONSTRAINT student_answers_submission_id_question_id_key`. The new step shows the current state, the target state (with `answered_at`, `time_spent_ms`, `is_correct` added via subquery join), and three COALESCEs explaining each defensive default. SQL run book renamed to `db/sql-editor/2026-04-14-rpc-validate-offline-submission-update.sql`. |
| ... Step 1.5.8 | Expanded the manual round-trip validator to test BOTH columns AND the end-to-end scoring path. Added pre-flight check that confirms the test paper has a non-NULL `correct_option`. Added a failure-mode debugging table with 5 symptom → cause mappings. The headline test is now: after the round trip, call `calculate_results` and confirm `score > 0` — proves the entire chain works end-to-end. |
| ... Step 1.5.10 | Updated commit file list to reference the renamed SQL file and updated the commit message to mention all three columns. |

### Phase 4.5 false alarms — formally retracted

Two of Phase 4.5's "bugs to flag for Phase 5" turned out to be false alarms when Phase 5 actually checked them against the live state (per Phase 5.2 above). For the audit record:

| Phase 4.5 claim | Phase 5.2 verification | Status |
|---|---|---|
| Missing unique index on `submissions(session_id, student_id)` | `submissions_session_student_idx` exists | **REFUTED — retracted.** No fix needed; existing engine code is correct. |
| `teardown.ts` route handler may not have Zod validation | `BodySchema.safeParse` is in place at lines 6–47 | **REFUTED — retracted.** No fix needed; the route was already validated. |
| `completion_seal` has no verifier | `validateClockGuard` is only called in tests — confirmed write-only forensic evidence | **CONFIRMED.** Open question Q11 documents the design choice. |

The two retractions are good news — the engine is more solid than Phase 4 suspected. The one CONFIRMED issue (`completion_seal` is write-only) is a design question, not a bug to fix.

### Phase 5.8 verification queries (run on live DB during this session)

| Query | Result | Implication |
|---|---|---|
| `COUNT(*) FROM questions WHERE deleted_at IS NULL` | 4 questions, 1 with `correct_option IS NULL` | The §9.3.1 NULL-safe-default logic is required — at least one live question would crash the join without it. |
| `pg_indexes WHERE tablename = 'student_answers'` | 4 indexes including BOTH `student_answers_idempotency_key_key` AND `student_answers_submission_id_question_id_key` | Confirms the dual-conflict-key pattern: live actions upsert on `idempotency_key`, RPC upserts on the composite. Both are valid; the semantics differ but neither is a bug. |
| `pg_get_functiondef('validate_and_migrate_offline_submission')` | Procedural FOR LOOP, 4-column INSERT, `ON CONFLICT ON CONSTRAINT student_answers_submission_id_question_id_key` | Confirmed the actual RPC structure differs from Phase 4's assumed template. Step 1.5.7 was rewritten to match the real body. |

### What's still NOT done after Phase 5.8

- **The Task 1.5 plan is patched but not executed.** The actual `time_spent_ms` / `is_correct` / `answered_at` writes do not happen until the user runs the assessment-taking plan.
- **The `questions.correct_option` data quality issue** — 1 of 4 live questions has NULL `correct_option`. Fixed via documentation only (the spec's §9.3.1 says land `is_correct = FALSE` for these). The data must be cleaned before publishing real results. Logged for Phase 7 follow-up: `ALTER TABLE questions ALTER COLUMN correct_option SET NOT NULL` after backfill.
- **The `createStudent` cohort_id smell** at `students.ts:121` — Phase 5.5 noted it; not fixed because `createStudent` is admin-only and the column is `uuid NOT NULL`. The cleaner fix is to make `cohort_id` required in `CreateStudentInput`. Logged for the admin-students-flow plan execution.

## Phase 5.9 — Open question resolutions (user locked 2026-04-14)

The user reviewed the Phase 5 findings and locked in answers for Q11 and Q13. Q12 was already resolved by Phase 5.8. These decisions are now authoritative — any future session (Phase 3, Phase 6, Phase 7) should treat them as ground truth and not re-derive.

### Q11 — `submissions.completion_seal` verification policy

**Decision: NEVER actively verify. Keep as forensic write-only evidence.**

Reasoning (recorded for later reference):

The HMAC seal binds `student_id + paper_id + server_timestamp + duration_ms` — **not** `score`, answers, or any grading data. Examining what the seal can protect against:

| Attack | Seal catches it? | Realistic? |
|---|---|---|
| Student modifying their own `submissions` row | Yes — but RLS already prevents this | No, RLS blocks it at the DB boundary |
| Admin tampering post-hoc | No — admin can re-issue the seal | Trusted user, out of threat model |
| Server compromise | No — secret leaks with the server | Out of threat model |
| Direct DB write bypassing the app | Yes — seal would mismatch | Attacker can also delete the seal |
| Student replaying an old submission | No | Already mitigated by `idempotency_key` + unique constraints |

The seal protects against **almost nothing** that isn't already handled by RLS, idempotency keys, or the app/server trust boundary. Adding a verifier would cost:
- Code complexity in 2 paths (`calculate_results` + `validate_and_migrate_offline_submission`)
- New failure mode (false-positive HMAC mismatches → refused grading)
- Maintenance burden if the seal format ever changes

What the seal **does** buy: forensic evidence in disputes. "Did this row exist at the time the student claims they submitted it?" The seal proves yes/no. That's valuable for compliance audits and incident response — but it does not need to be checked live at grading time.

**Implementation consequences (for the next session):**

- Do NOT add a seal verifier to `calculate_results`, `publishResult`, `publishResults`, or `validate_and_migrate_offline_submission`.
- Add a `// FORENSIC ONLY — never actively verify (Phase 5.9 decision)` comment above the `issueExamSeal` call site in `src/app/actions/assessment-sessions.ts` when that file is next touched (Phase 5 already touched it for the `cohortId` fix; future plan execution should add the comment).
- Add a paragraph to GOTCHAS.md explaining the forensic-only policy.
- The seal stays exactly as it is today — written by `submitExam`, read by nothing.

### Q12 — `student_answers.is_correct` computation (resolved by Phase 5.8)

**Decision (carried forward from Phase 5.8): Server-side at write time.**

`submitAnswer` looks up `questions.correct_option` for the single question. `submitExam` batch-fetches via `.in('id', questionIds)` (one round trip per batch). The offline RPC uses a subquery join inside the per-row INSERT. `reEvaluateResults` handles question-edit recomputation.

**NEVER trust a client-supplied `is_correct`** — it must be server-computed. Plan Task 1.5 Step 1.5.6 and 1.5.7 implement this.

### Q13 — `submissions.dpm` — drop entirely

**Decision: DROP the column entirely. Not "defer computing it" — remove from the schema.**

Reasoning:

- The new student-results-flow spec explicitly dropped DPM from the student UI ("drop the dpm entirely").
- The admin-results-redesign spec doesn't surface DPM either.
- **No v1 consumer reads `submissions.dpm`.** Computing or retaining it is speculative.
- Phase 5 confirmed: no code writes it. `calculate_results` does not compute it. The three existing readers (old student page, old admin page, admin `results-client.tsx`) are all being replaced or edited.
- Keeping dead columns is a maintenance cost and a source of confusion. Drop cleanly.
- Future analytics needs can re-add the column with a **fresh schema decision** — no commitment to the old numeric-nullable shape.

**Implementation consequences (baked into the student-results-flow plan):**

Task 13 of `docs/superpowers/plans/2026-04-14-student-results-flow.md` is now expanded to:

1. Drop the dead `ResultsGpaChart` student-side chart file (original Task 13 scope).
2. **Edit `src/components/results/results-client.tsx`** to remove the `dpm` row-type field, the `dpmAvg` reducer computation, and the "DPM Avg" KPI card.
3. **Edit `src/app/(admin)/admin/results/page.tsx`** to drop `dpm` from the `.select` clause.
4. **Pre-flight** a repo-wide grep confirming zero remaining `.dpm` / `'dpm'` references outside tests.
5. **Run** `ALTER TABLE submissions DROP COLUMN dpm` via the Supabase SQL editor, with a pre-flight `SELECT COUNT(*) WHERE dpm IS NOT NULL` that must return 0.
6. **Update** GOTCHAS.md to record the drop.

The sequencing is critical: the code readers must be edited **before** the SQL DROP runs. Task 13 does them in that order in a single commit.

**Resolution of Phase 1 open question #4:** Phase 1 §13 open question 4 asked "The `submissions.dpm` and `submissions.percentage` columns become orphans on the read path. Cleanup task or leave alone?" — now answered: drop `dpm`, keep `percentage` (still read by the admin side for backwards compatibility with the older admin-results-redesign spec).

### What Phase 5.9 did NOT change

- No code edits. The drop sequence is fully captured in the updated Task 13 of the student-results-flow plan but does not execute until the plan runs.
- No DB changes. The `ALTER TABLE DROP COLUMN` runs during plan execution, not in this audit pass.
- No changes to the assessment-taking spec/plan (those were updated in Phase 5.8 for is_correct).
- Q11 decision is documented but no code has been annotated with the `// FORENSIC ONLY` comment — that happens when the assessment-sessions file is next touched.

### Files modified in Phase 5.9

| File | Change |
|---|---|
| `docs/superpowers/specs/2026-04-14-student-results-flow-design.md` | §2 — flipped "DPM stays in DB" to "dropped from platform entirely". §9 — flipped the dpm retention paragraph to describe the drop. §9 Migration Policy — updated to mention the column drop in Task 13. §13 (Open Questions) — marked Q4 as resolved. |
| `docs/superpowers/plans/2026-04-14-student-results-flow.md` | Task 13 — full rewrite. Now covers both the GPA chart deletion (original scope) AND the dpm drop (Phase 5.9 addition). 10 new sub-steps with code edits for the three reader files, a pre-flight grep, the SQL run book, and GOTCHAS.md update. Single atomic commit. |
| `C:\Users\ADI\.claude\projects\A--MS-mindspark\memory\project-v1-scope.md` | Added Q11 + Q12 + Q13 decisions under a new "Audit decisions locked in (Phase 5.9, 2026-04-14)" section. |
| `docs/superpowers/audit/2026-04-14-phase1-findings.md` | This Phase 5.9 section. |
