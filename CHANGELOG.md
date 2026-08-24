# Changelog

All notable changes to MINDSPARK will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

<!--
╔══════════════════════════════════════════════════════════════════╗
║                  MANDATORY CHANGELOG RULES                       ║
║ Violations block production deploy (enforced in PR template)     ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║ RULE 1: Every DB migration = CHANGELOG entry BEFORE it deploys   ║
║         Migrations are irreversible without data loss.           ║
║         If it's not in CHANGELOG, the PR must not merge.         ║
║                                                                  ║
║ RULE 2: RLS policy changes = entry under ### Security            ║
║         RLS changes directly control data access. Two-person     ║
║         review required in addition to this entry.              ║
║                                                                  ║
║ RULE 3: API contract changes = entry under ### Changed           ║
║         Include migration notes if clients must update.          ║
║                                                                  ║
║ RULE 4: Version bump on every production deploy                  ║
║         Move [Unreleased] content to [x.y.z] — YYYY-MM-DD       ║
║         before merging the release PR.                           ║
║                                                                  ║
║ HOW TO ADD AN ENTRY:                                             ║
║   1. Add to ## [Unreleased] → correct section                    ║
║   2. Format: "- [Migration/feature]: description. Rollback: ..." ║
║   3. For DB changes, state: Additive YES/NO, Data loss YES/NO    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
-->

---

## [Unreleased]

_No unreleased changes._

---

## [1.0.0] — 2026-03-16

Initial production release. Complete MINDSPARK V1 platform.

### Database

#### Schema (27 Migrations — run in strict order 001→027)

- **001** `create_institutions` — `institutions` table (name, timezone, session_timeout_seconds, branding).
  Additive: YES. Rollback: `supabase/rollbacks/001_rollback_create_institutions.sql`

- **002** `create_profiles` — `profiles` table with `role` CHECK (`admin`, `teacher`, `student`), `version_seq INT`, `forced_password_reset BOOLEAN`, `locked_at TIMESTAMPTZ`. FK → institutions.
  Additive: YES. Rollback: `supabase/rollbacks/002_rollback_create_profiles.sql`

- **003** `create_levels` — `levels` table with `sequence_order UNIQUE`, `deleted_at` soft-delete. FK → institutions.
  Additive: YES. Rollback: `supabase/rollbacks/003_rollback_create_levels.sql`

- **004** `create_cohorts` — `cohorts` table. FK → levels.
  Additive: YES. Rollback: `supabase/rollbacks/004_rollback_create_cohorts.sql`

- **005** `create_students` — `students` table with `roll_number UNIQUE`, FK → cohorts, levels, institutions.
  Additive: YES. Rollback: `supabase/rollbacks/005_rollback_create_students.sql`

- **006** `create_teachers` — `teachers` table. FK → institutions.
  Additive: YES. Rollback: `supabase/rollbacks/006_rollback_create_teachers.sql`

- **007** `create_cohort_history` — `cohort_history` temporal join table (`valid_from TIMESTAMPTZ`, `valid_to TIMESTAMPTZ NULLABLE`). Enables teacher historical access to student data after reassignment.
  Additive: YES. Rollback: `supabase/rollbacks/007_rollback_create_cohort_history.sql`

- **008** `create_exam_papers` — `exam_papers` table with `type IN('EXAM','TEST')`, `status IN('DRAFT','PUBLISHED','LIVE','CLOSED')`, `anzan_delay_ms >= 200 CHECK`.
  Additive: YES. Rollback: `supabase/rollbacks/008_rollback_create_exam_papers.sql`

- **009** `create_questions` — `questions` table. FK → exam_papers ON DELETE CASCADE.
  Additive: YES. Rollback: `supabase/rollbacks/009_rollback_create_questions.sql`

- **010** `create_grade_boundaries` — `grade_boundaries` with `CHECK (min_score < max_score)` and no-overlap constraint. FK → institutions.
  Additive: YES. Rollback: `supabase/rollbacks/010_rollback_create_grade_boundaries.sql`

- **011** `create_assessment_sessions` — `assessment_sessions` with `paper_id` FK, `expires_at` (+10s Flash Anzan padding), `started_at`, `closed_at`. No `status` column — use `closed_at IS NOT NULL` to identify closed sessions.
  Additive: YES. Rollback: `supabase/rollbacks/011_rollback_create_assessment_sessions.sql`

- **012** `create_assessment_session_questions` — `assessment_session_questions` immutable snapshot table. No FK CASCADE DELETE — snapshots are permanent.
  Additive: YES. Rollback: `supabase/rollbacks/012_rollback_create_assessment_session_questions.sql`

- **013** `create_submissions` — `submissions` with `idempotency_key UUID UNIQUE` (DB-level deduplication), `sync_status`, `completed_at`, `result_published_at TIMESTAMPTZ`, `dpm DECIMAL`. `fillfactor = 80`.
  Additive: YES. Rollback: `supabase/rollbacks/013_rollback_create_submissions.sql`

- **014** `create_student_answers` — `student_answers` — individual MCQ answer per question per submission. Columns: `submission_id UUID FK → submissions(id) ON DELETE CASCADE`, `question_id UUID FK → questions(id)`, `idempotency_key UUID UNIQUE`, `selected_option TEXT NULL` (null = skipped), `is_correct BOOLEAN NULL` (set by calculate_results RPC), `answered_at TIMESTAMPTZ`. UNIQUE `(submission_id, question_id)`. `fillfactor = 80`. **Distinct from `submissions` (session header only).**
  Additive: YES. Rollback: `supabase/rollbacks/014_rollback_create_student_answers.sql`

- **015** `create_offline_submissions_staging` — `offline_submissions_staging` with permissive RLS (INSERT allowed post-session-close for offline reconnecting students). `server_received_at TIMESTAMPTZ` (not `created_at`). Rows deleted by `validate_and_migrate_offline_submission` RPC after processing.
  Additive: YES. Rollback: `supabase/rollbacks/015_rollback_create_offline_submissions_staging.sql`

- **016** `create_activity_logs` — `activity_logs` immutable audit table, partitioned by month, no DELETE RLS policy.
  Additive: YES. Rollback: `supabase/rollbacks/016_rollback_create_activity_logs.sql`

- **017** `create_announcements` — `announcements` with `published_at`, `target_level_id NULLABLE`, `body_html TEXT` (pre-sanitized via `sanitize-html`).
  Additive: YES. Rollback: `supabase/rollbacks/017_rollback_create_announcements.sql`

- **018** `create_announcement_reads` — `announcement_reads` junction table. Composite key `(announcement_id, student_id)` prevents duplicate read receipts.
  Additive: YES. Rollback: `supabase/rollbacks/018_rollback_create_announcement_reads.sql`

- **019** `add_rls_policies` — `ENABLE ROW LEVEL SECURITY` on all tables. RLS policies: student→own data, teacher→assigned cohort (+historical via `cohort_history` temporal join), admin→all.
  Additive: YES. Data access: RESTRICTED. Rollback: `supabase/rollbacks/019_rollback_add_rls_policies.sql`

- **020** `create_security_definer_functions` — Three Security Definer RPCs:
  - `bulk_import_students()` — per-row EXCEPTION handling; skips duplicates, returns `{inserted, skipped, errors}`
  - `validate_and_migrate_offline_submission()` — HMAC validation before migration to `student_answers` and `submissions`
  - `calculate_results(p_paper_id)` — SKIP LOCKED to avoid deadlocks on re-evaluation
  Additive: YES. Rollback: `supabase/rollbacks/020_rollback_create_security_definer_functions.sql`

- **021** `create_indexes` — Performance indexes:
  - BTREE on `submissions(session_id, student_id)`
  - PARTIAL on `submissions WHERE completed_at IS NULL` (in-flight exams)
  - BRIN on `activity_logs(timestamp)` (monthly partitions, range scans)
  - BTREE on `assessment_sessions(paper_id, started_at)` (session lookup by paper + start time)
  - BTREE on `student_answers(submission_id)` (per-submission answer lookup)
  Additive: YES. Rollback: `supabase/rollbacks/021_rollback_create_indexes.sql`

- **022** `create_triggers` — cohort_history close trigger (auto-sets `valid_to` when new assignment opens). `updated_at` auto-update triggers.
  Additive: YES. Rollback: `supabase/rollbacks/022_rollback_create_triggers.sql`

- **023** `add_realtime_broadcast_policies` — Supabase Realtime channel access policies. Students: subscribe to `exam:{paper_id}` (Broadcast) and `lobby:{paper_id}` (Presence). Admins: subscribe to both. `lobby:` is Presence-only — lifecycle events use `exam:` channel.
  Additive: YES. Rollback: `supabase/rollbacks/023_rollback_add_realtime_broadcast_policies.sql`

- **024** `seed_default_grade_boundaries` — INSERT default grade boundaries (A+/A/B/C/D/F) for the institution. **Not a schema migration — data seed.** Safe to re-run (`ON CONFLICT DO NOTHING`).
  Additive: YES. Rollback: `supabase/rollbacks/024_rollback_seed_default_grade_boundaries.sql`

- **025** `add_consent_verified_to_students` — `ALTER TABLE students ADD COLUMN consent_verified BOOLEAN NOT NULL DEFAULT false`. **DPDP Act 2023 Section 9 legal requirement.** No student account may be used until `consent_verified = true`. Set via `GET /api/consent/verify` Route Handler after guardian email link click.
  Additive: YES. Data access impact: students without consent blocked at login. Rollback: `supabase/rollbacks/025_rollback_add_consent_verified_to_students.sql`

- **026** `add_deletion_scheduled` — `ALTER TABLE submissions ADD COLUMN deletion_scheduled_at TIMESTAMPTZ` and `ALTER TABLE activity_logs ADD COLUMN deletion_scheduled_at TIMESTAMPTZ`. **DPDP retention pipeline** — `pg_cron` marks rows for scheduled erasure; `execute_scheduled_deletions()` Security Definer function runs deletion in FK-safe order (`student_answers` first, then `submissions`, then `activity_logs`).
  Additive: YES. Rollback: `supabase/rollbacks/026_rollback_add_deletion_scheduled.sql`

- **027** `20260325000000_dashboard_aggregates` — Creates materialized performance aggregation RPCs for the admin dashboard KPI cards and sparkline charts. Provides pre-computed institutional metrics (active students, average scores, session counts) refreshed via `pg_cron` every 5 minutes during active exam periods.
  Additive: YES. Rollback: Drop the aggregation functions via `DROP FUNCTION IF EXISTS dashboard_aggregates();`

### Security

- Enabled RLS on all 14 tables (migration 016)
- `validate_and_migrate_offline_submission` RPC runs as SECURITY DEFINER to bypass RLS for HMAC-validated payloads only — service-role client not exposed to students
- `offline_submissions_staging` has permissive INSERT (no student ownership check) — intentional; validated by HMAC before migration to `student_answers` and `submissions`
- `activity_logs` has no DELETE policy — immutable audit trail by design
- `admin.ts` (service-role client) restricted to server-only scope via ESLint rule blocking import in `src/app/(student)/`

### Added

#### Admin Panel
- Dashboard with KPI cards (Recharts sparklines) and live exam pulse widget
- Levels management with drag-and-drop reorder (`@hello-pangea/dnd`) and soft-delete
- Student directory with `@tanstack/react-table`: debounced search, URL-bound filters, faceted status + level filters
- CSV student import wizard with column mapping, inline validation, and `bulk_import_students` RPC
- Student profile view: split-pane with academic history, portfolio chart, level timeline
- Assessment creation: EXAM (vertical equations + MCQ) and TEST (Flash Anzan + MCQ) types
- Assessment lifecycle pipeline: Draft → Published → Live → Closed (admin-controlled)
- Live exam monitor: Supabase Broadcast split-view dashboard, per-student heartbeat status, amber ghost detection (25s timeout)
- Force Close and Force Open (10-min reopen window) exam controls
- Results: grade distribution area chart, bulk publish, CSV export
- Announcements: TipTap WYSIWYG editor with `sanitize-html` server-side sanitisation
- Reports: 6-month trailing charts, pass rate by level, growth trajectories
- Activity log: compound filters, paginated, JSON diff visualiser
- Settings: institution config, grade boundary editor (anti-overlap validation), timezone picker

#### Student Panel
- Dashboard: "Live Now" hero card with pulse animation, upcoming assessments grid
- Exam list: 3-column grid with LIVE badge, locked state for non-LIVE papers
- Test list: Flash Anzan cards with speed/digit configuration tags
- Pre-assessment lobby: countdown timer, network traffic light (Green/Yellow/Red), breathing animation
- EXAM engine: vertical equation display (DM Mono, tabular-nums), 2×2 MCQ grid (64×64px minimum touch targets), 1,200ms cooldown, Question Navigator
- TEST engine (Flash Anzan): 3-phase (equation → flash sequence → MCQ reveal)
  - `requestAnimationFrame` delta-time accumulator — no `setInterval`
  - `transition: none !important` on `.flash-number` (retinal ghosting prevention)
  - Dynamic contrast dampening for intervals < 300ms
  - Question Navigator unmounted (not hidden) during Phase 2
- Offline-first: IndexedDB (Dexie.js) answer queue, `online` event flush, Supabase Broadcast sync status indicator
- Anti-cheat: HMAC Clock Guard, tab visibility monitoring (silent, no popup), keepalive teardown on `pagehide`
- Results hub: published (highlighted) + pending (muted, not clickable) cards
- Result detail: score %, donut chart, 3-column review grid, Incorrect/Skipped filter chips
- Student profile: digital ID card aesthetic with DM Mono roll number, level progress timeline

#### Core Infrastructure
- Flash Anzan RAF timing engine (`timing-engine.ts`) — delta accumulator, 200ms minimum interval guard, `performance.mark()` instrumentation
- HMAC Clock Guard — dual-layer: IndexedDB high-water mark + `performance.now()` monotonic, non-blocking flag (benefit-of-doubt policy)
- Offline sync pipeline — Dexie.js → `/api/submissions/offline-sync` → `validate_and_migrate_offline_submission` RPC
- Keepalive teardown — `/api/submissions/teardown` Route Handler (not Server Action — stable URL requirement for `pagehide` keepalive fetch)
- WebSocket thundering herd prevention — `setTimeout(connect, Math.random() * 5000)` jitter on all connections
- `sanitize-html` server-side HTML sanitisation (DOMPurify banned — crashes RSC/Server Actions)
- Accessibility: WCAG 2.2 AAA on all screens, `aria-live="polite"` on timer (5min + 1min announcements only), `aria-hidden="true"` on flash number, Ticker Mode alternative for low-vision

#### DevOps & Quality
- GitHub Actions CI/CD: PR pipeline (tsc → lint → build → unit → integration → bundle size → Playwright E2E → axe-playwright)
- Production deploy pipeline: Vercel auto-deploy → `supabase db push` → smoke test → Slack notification
- Lighthouse CI with `lighthouse-budget.json` (admin LCP < 2.5s, student LCP < 3.5s)
- k6 load test suite (LT-01 thundering herd, LT-02 heartbeat storm, LT-03 offline sync storm) — required before first live exam
- Vitest unit tests: RAF drift precision, number generator, HMAC guard, LRU purge, auth-store shape
- Playwright E2E: full EXAM flow, TEST flow (Phase 1→2→3), offline resume + sync, force close, result publish
- axe-playwright accessibility: all admin and student routes, WCAG 2.2 AAA zero violations

---

<!--
FUTURE VERSIONS — add below this line in descending order

## [1.1.0] — YYYY-MM-DD
### Database
### Security
### Added
### Changed
### Fixed
-->

---

[unreleased]: https://github.com/[org]/mindspark/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/[org]/mindspark/releases/tag/v1.0.0
