# MINDSPARK Task Breakdown
This file is the source of truth for build progress.
Check a box when a task is complete.
If context exceeds 60%, save state to PROGRESS.md and /clear context.
Resume: read CLAUDE.md + task-breakdown.md + PROGRESS.md.
Total tasks: 196 across 8 phases.

---

## Phase 0 — Project Scaffold
> Must complete before any Phase 1 work. Run commands from repo root.

- [x] `package.json` — Install all packages from CLAUDE.md stack list. Run `npm install` and verify 0 peer-dep errors.
  Criterion: `npm run dev` starts without error
- [x] `next.config.ts` — Configure CSP headers (nonce pattern), image domains (`*.supabase.co`), env validation at build time.
  Criterion: `npm run build` completes, CSP header visible in response headers
- [x] `tailwind.config.ts` — Import design tokens: bg-page `#F8FAFC`, green-800 `#1A3829`, text-negative `#991B1B`. Remove `#121212` and `#FF6B6B`.
  Criterion: `npm run build` — no Tailwind warnings, token values present in output CSS
- [x] `postcss.config.js` — Standard PostCSS + Tailwind plugins.
  Criterion: CSS compiles without errors
- [x] `tsconfig.json` — Strict mode, `@/` path alias → `src/`.
  Criterion: `npm run tsc` passes with 0 errors
- [x] `.env.local` — Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  Criterion: File exists, not committed to git (`.gitignore` includes `.env.local`)
- [x] `.env.example` — Placeholder values for all required vars.
  Criterion: File exists, committed to git
- [x] `.eslintrc.json` — Add `no-restricted-imports` rule for `admin.ts` (prevents client components from importing admin SDK).
  Criterion: `npm run lint` catches violations
- [x] `middleware.ts` — Implement basic JWT inspection to redirect unauthenticated users from `/dashboard` and `/flash-anzan`.
  Criterion: Middleware intercepts requests, no infinite redirects (`/admin` → admin only, `/` → student only), 403 redirect.
  Criterion: Unauthenticated GET `/admin/dashboard` returns 302 to `/login`
- [x] Supabase project setup — Create project, copy URL and keys, generate initial types.
  Criterion: `npx supabase gen types typescript --local > types/supabase.ts` succeeds

---

## Phase 1 — Database Layer
> Run ALL 26 migrations before writing any application code. Dependencies are strict — run in order.

- [ ] `supabase/migrations/001_create_institutions.sql` — `institutions` table.
  Depends: Supabase project exists
  Criterion: `SELECT * FROM institutions` returns empty table, no error
- [ ] `supabase/migrations/002_create_roles_and_users.sql` — `profiles` table with role enum, `version_seq`, `forced_password_reset`, `locked_at`.
  Depends: 001
  Criterion: `profiles` table exists; `role` column has CHECK constraint
- [ ] `supabase/migrations/003_create_levels.sql` — `levels` with `sequence_order UNIQUE`, `deleted_at` soft-delete.
  Depends: 001
  Criterion: `INSERT` with duplicate `sequence_order` returns unique violation
- [ ] `supabase/migrations/004_create_students.sql` — `students` with `roll_number UNIQUE`, FK to `profiles` and `levels`.
  Depends: 002, 003
  Criterion: `roll_number` UNIQUE constraint enforced on insert
- [ ] `supabase/migrations/005_create_assessments.sql` — `exam_papers` with `type IN('EXAM','TEST')`, `status IN('DRAFT','PUBLISHED','LIVE','CLOSED')`, `anzan_delay_ms >= 200` CHECK.
  Depends: 001, 003
  Criterion: INSERT with `anzan_delay_ms = 100` fails CHECK constraint
- [ ] `supabase/migrations/006_create_assessment_sessions.sql` — `assessment_sessions` with status enum, `expires_at`, `started_at`, `closed_at`.
  Depends: 005
  Criterion: Table exists with all required columns
- [ ] `supabase/migrations/007_create_session_snapshots.sql` — `assessment_session_questions` immutable snapshot table.
  Depends: 006
  Criterion: Table exists; no FK CASCADE DELETE (immutable)
- [ ] `supabase/migrations/008_create_submissions.sql` — `submissions` with `idempotency_key UUID UNIQUE`, `sync_status`, `completed_at`.
  Depends: 006, 004
  Criterion: Duplicate `idempotency_key` INSERT returns unique violation
- [ ] `supabase/migrations/009_create_offline_staging.sql` — `offline_submissions_staging` with permissive RLS (INSERT allowed without full auth match).
  Depends: 008
  Criterion: Authenticated user can INSERT without owning the session
- [ ] `supabase/migrations/010_create_grade_boundaries.sql` — `grade_boundaries` with `no_overlap CHECK (min_score < max_score)`.
  Depends: 001
  Criterion: Overlapping grade ranges rejected by CHECK
- [ ] `supabase/migrations/011_create_announcements.sql` — `announcements` with `published_at`, `target_level_id` nullable.
  Depends: 001, 003
  Criterion: Table exists with all columns
- [ ] `supabase/migrations/012_create_announcement_reads.sql` — `announcement_reads` junction table.
  Depends: 011, 004
  Criterion: Composite key `(announcement_id, student_id)` prevents duplicates
- [ ] `supabase/migrations/013_create_activity_logs.sql` — `activity_logs` immutable, no `updated_at`, no DELETE policy.
  Depends: 002
  Criterion: Table exists; no DELETE RLS policy
- [ ] `supabase/migrations/014_create_cohort_history.sql` — `cohort_history` temporal join: `valid_from`, `valid_to NULLABLE`.
  Depends: 004, 002
  Criterion: `valid_to IS NULL` query returns current assignments only
- [ ] `supabase/migrations/015_create_dashboard_materialized_view.sql` — `dashboard_aggregates` materialized view + `pg_cron` 300s refresh.
  Depends: 001–014
  Criterion: `REFRESH MATERIALIZED VIEW dashboard_aggregates` runs without error
- [ ] `supabase/migrations/016_create_rls_policies.sql` — ENABLE ROW LEVEL SECURITY on all tables + CREATE POLICY on all tables.
  Depends: 001–015
  Criterion: Student JWT cannot SELECT from `submissions` of another student
- [ ] `supabase/migrations/020_create_security_definer_functions.sql` — `bulk_import_students()`, `validate_and_migrate_offline_submission()` (SECURITY DEFINER), `calculate_results(p_paper_id)` (SKIP LOCKED).
  Depends: 019
  Criterion: `SELECT validate_and_migrate_offline_submission(NULL, NULL, NULL)` returns error (not exception)
- [ ] `supabase/migrations/018_create_triggers.sql` — Grade calculation trigger on `raw_score` update; `version_seq` increment trigger.
  Depends: 016
  Criterion: UPDATE `submissions.score` → `grade` column auto-populated from `grade_boundaries`
- [ ] `supabase/migrations/019_set_fillfactor.sql` — `ALTER TABLE submissions SET (fillfactor = 80)`.
  Depends: 008
  Criterion: `SELECT reloptions FROM pg_class WHERE relname = 'submissions'` includes `fillfactor=80`
- [ ] `supabase/migrations/020_create_indexes.sql` — BTREE on `(session_id, student_id)`, PARTIAL on `submissions WHERE completed_at IS NULL`, BRIN on `activity_logs(timestamp)`.
  Depends: 001–019
  Criterion: `\di` in psql shows all 3 indexes
- [ ] `supabase/migrations/021_create_student_answers.sql` — `student_answers` table: `idempotency_key UUID UNIQUE`, `selected_option TEXT NULL` (NULL = skipped), FK to `assessment_sessions` and `profiles`.
  Depends: 006, 004
  Criterion: Duplicate `idempotency_key` INSERT returns unique violation; NULL `selected_option` allowed
- [ ] `supabase/migrations/022_add_announcement_reads.sql` — `announcement_reads` junction: composite PK `(announcement_id, student_id)`, FK to `announcements` and `students`.
  Depends: 011, 004
  Criterion: Composite key `(announcement_id, student_id)` prevents duplicates
- [ ] `supabase/migrations/023_add_version_seq_trigger.sql` — Trigger incrementing `profiles.version_seq` on every UPDATE to that row.
  Depends: 002
  Criterion: UPDATE `profiles` row → `version_seq` increments by 1
- [ ] `supabase/migrations/024_add_ticker_mode.sql` — `ALTER TABLE profiles ADD COLUMN ticker_mode BOOLEAN NOT NULL DEFAULT false`.
  Depends: 002
  Criterion: Column exists; default false; toggle updates it correctly
- [ ] `supabase/migrations/025_add_consent_verified.sql` — `ALTER TABLE students ADD COLUMN consent_verified BOOLEAN NOT NULL DEFAULT false`.
  Depends: 004
  Criterion: Column exists; `consent_verified = false` for all seeded students initially
- [ ] `supabase/migrations/026_add_deletion_scheduled_at.sql` — `ALTER TABLE students ADD COLUMN deletion_scheduled_at TIMESTAMPTZ` for DPDP data-retention pipeline.
  Depends: 004
  Criterion: Column exists; NULL = active student; non-null = scheduled for deletion
- [ ] `supabase/migrations/027_add_deletion_scheduled_at_submissions.sql` — `ALTER TABLE submissions ADD COLUMN deletion_scheduled_at TIMESTAMPTZ` for automated 3-year exam result retention pipeline.
  Depends: 008
  Criterion: Column exists; `execute_scheduled_deletions()` RPC can mark and delete rows
- [ ] `supabase/migrations/028_add_deletion_scheduled_at_activity_logs.sql` — `ALTER TABLE activity_logs ADD COLUMN deletion_scheduled_at TIMESTAMPTZ` for automated 1-year activity log retention pipeline.
  Depends: 013
  Criterion: Column exists; `DATA_RETENTION_EXECUTION` log entries are exempt from deletion
- [ ] Generate types — `npx supabase gen types typescript --local > types/supabase.ts`
  Criterion: File exists, all table names present as TypeScript interfaces

---

## Phase 2 — Supabase Clients + Auth Foundation

- [ ] `src/lib/supabase/client.ts` — `createBrowserClient()` with `NEXT_PUBLIC_` vars; never imports service role.
  Depends: Phase 0, Phase 1 types
  Criterion: `npm run tsc` — no type errors; `window` check not required
- [ ] `src/lib/supabase/server.ts` — `createServerClient()` with cookies from `next/headers`; server-only import.
  Depends: 10
  Criterion: Importing in a client component (`'use client'`) throws tsc error
- [ ] `src/lib/supabase/middleware.ts` — Supabase middleware helper for JWT refresh on every request.
  Depends: 10, 11
  Criterion: Token refresh logic runs without hydration errors
- [ ] `src/lib/supabase/admin.ts` — Service-role client; `window` runtime guard throws if called in browser.
  Depends: 10
  Criterion: `typeof window !== 'undefined'` guard throws in test; ESLint rule blocks import in `(student)/`
- [ ] `src/lib/auth/rbac.ts` — `requireRole()` — extracts role from `user.app_metadata.role`; never from Zustand.
  Depends: 11
  Criterion: Passing wrong role to `requireRole('admin')` returns `FORBIDDEN` ActionError, not throw
- [ ] `src/lib/auth/session.ts` — Idle timeout detection; forced password reset redirect; account lockout.
  Depends: 14
  Criterion: User with `forced_password_reset = true` redirected to `/reset-password`
- [ ] `src/stores/auth-store.ts` — Zustand: `forced_password_reset` and `locked_at` flags ONLY. No role, no profile.
  Depends: Phase 2 clients
  Criterion: `npm run tsc` — store has no `role` or `email` field

---

## Phase 3 — Zustand Stores + Dexie.js

- [ ] `src/stores/exam-session-store.ts` — Active exam state: `questionIndex`, `answers[]`, `timer`, `offlineQueue`, `sessionId`, `clockGuardStart`.
  Depends: Phase 2
  Criterion: Store persists across re-renders; does not persist to localStorage
- [ ] `src/stores/ui-store.ts` — Sidebar collapse, modal visibility, auto-advance toggle.
  Depends: Phase 2
  Criterion: Sidebar toggle state survives page navigation within session
- [ ] `src/lib/offline/indexed-db-store.ts` — Dexie.js schema: `pendingAnswers` table with `idempotency_key` as primary key.
  Depends: Phase 2
  Criterion: Answer added to Dexie survives page refresh (IndexedDB persisted)
- [ ] `src/lib/offline/sync-engine.ts` — Queue flush on `online` event; calls `/api/submissions/offline-sync`.
  Depends: 30, 114
  Criterion: On `navigator.onLine` true event, pending answers POST to offline-sync endpoint
- [ ] `src/lib/offline/storage-probe.ts` — `navigator.storage.estimate()` on init; call `persist()` if < 50MB.
  Depends: none (browser API)
  Criterion: `persist()` called before first answer write; estimate value logged

---

## Phase 4 — Server Actions + Route Handlers
> ⚠️ Context note: This phase has 12 files. Consider /clear after completing Route Handlers if context > 60%.

- [ ] `src/app/api/submissions/teardown/route.ts` — POST Route Handler; JWT from `Authorization` header; upsert answers; idempotent on duplicate call.
  Depends: Phase 2, Phase 1 migrations
  Criterion: `fetch('/api/submissions/teardown', { keepalive: true })` returns 200 with valid JWT; 401 without
- [ ] `src/app/api/submissions/offline-sync/route.ts` — POST Route Handler; HMAC validation; calls `validate_and_migrate_offline_submission` RPC; rate limit 10/60s.
  Depends: Phase 2, migration 017
  Criterion: Duplicate `idempotency_key` returns `{ synced_count: 0 }`, not error
- [ ] `src/app/api/consent/verify/route.ts` — GET Route Handler; unauthenticated; reads JWT from `?token=` query param; validates it; sets `students.consent_verified = true` via service-role client; returns success/error state for UI.
  Depends: Phase 2 admin client, migration 025
  Criterion: GET with valid JWT returns 200 and sets `consent_verified = true`; GET with expired/invalid JWT returns 401 with `{ error: 'LINK_EXPIRED' }` — no raw stack trace in response
- [ ] `src/app/actions/levels.ts` — `createLevel`, `updateLevel`, `reorderLevels`, `softDeleteLevel`. Admin role required.
  Depends: rbac.ts, migration 003
  Criterion: Student JWT calling `createLevel` returns `FORBIDDEN`
- [ ] `src/app/actions/students.ts` — `createStudent`, `updateStudent`, `deactivateStudent`, `importStudentsCSV`. Admin only.
  Depends: rbac.ts, migration 004, 017
  Criterion: `importStudentsCSV` with 501 rows returns `QUOTA_EXCEEDED`
- [ ] `src/app/actions/assessments.ts` — `createAssessment`, `updateAssessment`, `publishAssessment`, `forceOpenExam`, `forceCloseExam`.
  Depends: rbac.ts, migrations 005–007
  Criterion: `updateAssessment` on LIVE paper returns `ASSESSMENT_LOCKED`
- [ ] `src/app/actions/assessment-sessions.ts` — `initSession`, `submitAnswer` (with idempotency to `student_answers`), `submitExam`.
  Depends: migrations 006–009, 021, exam-session-store
  Criterion: Duplicate `idempotency_key` on `submitAnswer` returns `{ ok: true }`, not duplicate error; answer written to `student_answers` not `submissions`
- [ ] `src/app/actions/results.ts` — `publishResult`, `unpublishResult`, `reEvaluateResults` (calls `calculate_results(p_paper_id)`), `bulkPublish`.
  Depends: rbac.ts, migrations 008, 010
  Criterion: `reEvaluateResults` on non-CLOSED paper returns `ASSESSMENT_NOT_CLOSED`
- [ ] `src/app/actions/announcements.ts` — `createAnnouncement`, `publishAnnouncement`. Sanitize via `sanitize-html` before write.
  Depends: rbac.ts, migrations 011–012, sanitize.ts
  Criterion: `<script>` tag in body_html stripped before DB insert
- [ ] `src/app/actions/settings.ts` — `updateSettings`, grade boundary validation (no overlap).
  Depends: rbac.ts, migration 010
  Criterion: Overlapping grade boundaries return `VALIDATION_ERROR`
- [ ] `src/app/actions/activity-log.ts` — `readActivityLog` (paginated, filterable by actor/action/date range). Admin role required.
  Depends: rbac.ts, migration 013
  Criterion: Student JWT calling `readActivityLog` returns `FORBIDDEN`; date range filter returns only matching rows
- [ ] `src/app/actions/auth.ts` — `login`, `logout`, `resetPassword`, `refreshSession`.
  Depends: Phase 2 clients
  Criterion: `login` with wrong credentials returns `INVALID_CREDENTIALS` (no raw Supabase error)

---

## Phase 5 — Shared Components + Design System
> ⚠️ Context note: 50 component files. Split into two /clear sessions at shadcn (44–57) and composite (58–112).

- [ ] `src/app/globals.css` — Tailwind base; CSS custom properties from design system: `--color-page`, `--color-green-800`, `--font-mono`.
  Criterion: `--color-page: #F8FAFC` visible in browser DevTools computed styles
- [ ] `src/app/layout.tsx` — Root layout: DM Sans + DM Mono fonts via `next/font/google`; global providers.
  Criterion: DevTools shows DM Mono for `.font-mono` elements
- [ ] `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/loading.tsx` — Global fallback pages.
  Criterion: Navigating to `/nonexistent` shows custom 404
- [ ] shadcn/ui installs (files 44–57) — `npx shadcn@latest add card badge button sheet tabs popover skeleton slider input select dialog tooltip separator`. Add custom `stepper.tsx`.
  Criterion: All 14 components import without TypeScript errors
- [ ] `src/lib/utils.ts` — `cn()` classname merger.
  Criterion: `cn('a', undefined, 'b')` returns `'a b'`
- [ ] `src/lib/constants.ts` — Heartbeat `5000`, jitter `5000`, debounce `300`, cooldown `1200`, min flash `200`.
  Criterion: All constants exported; no magic numbers elsewhere
- [ ] `src/lib/types/enums.ts` — `UserRole`, `AssessmentType`, `AssessmentStatus`, `SyncStatus`.
  Criterion: `npm run tsc` passes; enums used in Server Actions type-correctly
- [ ] `src/lib/validators/csv-validator.ts` — Column mapping + inline validation for CSV.
  Criterion: Row with missing `roll_number` returns `{ errors: [{ row: N, reason: 'missing roll_number' }] }`
- [ ] `src/lib/validators/grade-boundary-validator.ts` — Anti-overlap math.
  Criterion: Overlapping ranges `[60–80, 70–90]` returns validation error
- [ ] `src/lib/sanitize.ts` — `sanitize-html` wrapper with announcement allowlist.
  Criterion: `<script>alert(1)</script>` input returns empty string
- [ ] `src/lib/timezone.ts` — UTC → IST display with `date-fns-tz`.
  Criterion: UTC `2024-01-01T00:00:00Z` displays as `01 Jan 2024, 05:30 AM IST`
- [ ] `src/lib/idempotency.ts` — UUID v5 generator seeded from `session_id + question_id`.
  Criterion: Same inputs always produce same UUID; different inputs produce different UUIDs
- [ ] Layout components (files 58–61) — `admin-sidebar.tsx`, `student-sidebar.tsx`, `top-header.tsx`, `command-palette.tsx`.
  Criterion: Admin sidebar renders all 10 nav items; active item highlighted
- [ ] Dashboard components (files 62–65) — `kpi-card.tsx`, `live-pulse.tsx`, `student-dashboard.tsx`, `teacher-dashboard.tsx`.
  Criterion: KPI card renders sparkline; `live-pulse.tsx` has `'use client'`
- [ ] Level components (files 66–68) — `level-list.tsx`, `level-form-sheet.tsx`, `level-empty-state.tsx`.
  Criterion: Drag-and-drop reorder fires optimistic update before server confirmation
- [ ] Student components (files 69–73) — Data table, faceted filter, profile view, portfolio chart, CSV wizard.
  Criterion: 300ms debounced search — rapid typing does not fire multiple requests
- [ ] Assessment components (files 74–77) — Type selector, question author, pipeline stepper, anzan config panel.
  Criterion: Slider for flash speed enforces 200ms minimum
- [ ] Monitor components (files 78–80) — Live monitor dashboard, student status row, offline badge.
  Criterion: Student status row shows amber after 25s missing heartbeat
- [ ] Results components (files 81–86) — Distribution chart, floating action bar, result hub, result detail, filters.
  Criterion: Bulk-select FAB appears only when ≥1 row selected
- [ ] Announcement components (files 87–88) — TipTap editor, announcement list.
  Criterion: TipTap dynamically imported; `<img>` tag not in allowed output list
- [ ] Reports + Activity + Settings components (files 89–94) — All render without TypeScript errors.
  Criterion: `npm run tsc` — 0 errors after all Phase 5 components
- [ ] Auth components (files 106–108) — Login form, force reset, lobby.
  Criterion: DOB field auto-formats `DD/MM/YYYY`; submit disabled until valid
- [ ] Accessibility components (files 109–110) — SR announcer, Ticker Mode.
  Criterion: `aria-live="polite"` present on SR announcer div
- [ ] Profile components (files 111–112) — Student ID card, level progress bar.
  Criterion: Both render without TypeScript errors; DM Mono used for roll number

---

## Phase 6 — Admin Panel (11 modules)
> Start with Dashboard (depends on KPI data), finish with Monitor (depends on Realtime).

- [ ] `src/app/(admin)/layout.tsx` — Admin layout: sidebar + header + RBAC guard (redirect non-admin users).
  Depends: Phase 5 layout components, rbac.ts
  Criterion: Teacher JWT redirected to teacher dashboard; student JWT → `/`
- [ ] `src/app/(admin)/dashboard/page.tsx` — RSC; reads `dashboard_aggregates` materialized view.
  Depends: migration 015, kpi-card.tsx
  Criterion: Page renders with static data; no client-side fetch waterfall
- [ ] `src/app/(admin)/levels/page.tsx` — Drag-and-drop levels list; empty state.
  Depends: level components, Phase 4 levels actions
  Criterion: Reorder persists after page refresh
- [ ] `src/app/(admin)/students/page.tsx` — Student data table with URL-bound filters.
  Depends: student components, Phase 4 student actions
  Criterion: Filter in URL (`?status=active`) persists on reload
- [ ] `src/app/(admin)/students/[id]/page.tsx` — Student profile detail.
  Depends: student-profile-view.tsx
  Criterion: Portfolio chart renders Recharts LineChart
- [ ] `src/app/(admin)/students/import/page.tsx` — CSV import wizard.
  Depends: csv-import-wizard.tsx
  Criterion: 501-row CSV shows `QUOTA_EXCEEDED` error before submit
- [ ] `src/app/(admin)/assessments/page.tsx` — Assessment list with pipeline status badges.
  Depends: assessment components
  Criterion: LIVE assessments sorted to top
- [ ] `src/app/(admin)/assessments/new/page.tsx` — Assessment creation flow.
  Depends: assessment-type-selector.tsx, question-author-form.tsx, anzan-config-panel.tsx
  Criterion: Flash speed slider minimum enforced at 200ms; form disabled on submit
- [ ] `src/app/(admin)/assessments/[id]/page.tsx` — Assessment detail with pipeline stepper.
  Depends: assessment-pipeline.tsx
  Criterion: Stepper shows correct active step; past steps not clickable
- [ ] `src/app/(admin)/results/page.tsx` + `results/[id]/page.tsx` — Results overview + detail.
  Depends: results components
  Criterion: Grade distribution area chart renders; bulk select triggers FAB
- [ ] `src/app/(admin)/announcements/page.tsx` — TipTap editor (dynamic import).
  Depends: announcement-editor.tsx
  Criterion: TipTap NOT in initial JS bundle (verify with bundle analyzer)
- [ ] `src/app/(admin)/reports/page.tsx` — BI charts + date range picker.
  Depends: reports components
  Criterion: Date range filter updates chart without page reload
- [ ] `src/app/(admin)/activity-log/page.tsx` — Compound filtered audit trail.
  Depends: activity-log-table.tsx
  Criterion: JSON diff viewer renders payload differences
- [ ] `src/app/(admin)/settings/page.tsx` — Institution + grade boundaries + timezone.
  Depends: settings components, Phase 4 settings action
  Criterion: Grade boundary anti-overlap validation blocks save
- [ ] `src/app/(admin)/monitor/page.tsx` + `monitor/[id]/page.tsx` — Live monitor listing + real-time dashboard.
  Depends: monitor components, use-heartbeat.ts, use-broadcast.ts
  Criterion: Student card turns amber after 25s; Broadcast channel cleaned up on unmount

---

## Phase 7 — Student Panel (9 modules)

- [ ] `src/app/(student)/layout.tsx` — Collapsible sidebar + RBAC guard (student only).
  Depends: student-sidebar.tsx, rbac.ts
  Criterion: Admin JWT redirected to `/admin/dashboard`
- [ ] `src/app/(student)/dashboard/page.tsx` — \"Live Now\" hero + upcoming assessments.
  Depends: student-dashboard.tsx
  Criterion: \"Live Now\" card shows only LIVE exams at student's level
- [ ] `src/app/(student)/exams/page.tsx` — Exam list: 3-column grid, LIVE/locked states.
  Depends: assessment-type-selector.tsx
  Criterion: Non-LIVE exams show lock icon; click does nothing
- [ ] `src/app/(student)/tests/page.tsx` — Test (Flash Anzan) list.
  Depends: assessment-type-selector.tsx
  Criterion: Speed/digit config tags render correctly
- [ ] `src/app/(student)/lobby/[id]/page.tsx` — Pre-assessment lobby: countdown, network check.
  Depends: pre-assessment-lobby.tsx, use-realtime-presence.ts
  Criterion: Network traffic light shows Red when `navigator.onLine = false`
- [ ] `src/app/(student)/results/page.tsx` — Result hub: published + pending.
  Depends: student-result-hub.tsx
  Criterion: Pending results have no click affordance (pointer-events: none)
- [ ] `src/app/(student)/results/[id]/page.tsx` — Result detail: score, donut, review grid.
  Depends: result-detail-view.tsx
  Criterion: \"Incorrect\" filter shows only wrong-answer rows; \"Skipped\" shows NULL answers
- [ ] `src/app/(student)/profile/page.tsx` — Digital ID card + level progress + Ticker Mode toggle.
  Depends: student-id-card.tsx, level-progress-bar.tsx, migration 024
  Criterion: Roll number rendered in DM Mono font; Ticker Mode toggle updates `profiles.ticker_mode`
- [ ] `src/app/(student)/consent/page.tsx` — Guardian consent verification landing page. Unauthenticated — no sidebar, no login required. Reads JWT from `?token=` URL param, calls `/api/consent/verify`, renders success or friendly error state.
  Depends: /api/consent/verify route handler (Phase 4), migration 025
  Criterion: Valid token sets `students.consent_verified = true` and shows success card; expired token shows error card with no raw stack trace; page renders without authenticated session

---

## Phase 8 — Assessment Engine (LAST — depends on everything)
> ⚠️ Most complex phase. Do not start until Phases 0–7 are fully passing tsc + lint.
> ⚠️ Context note: /clear before starting this phase. Read CLAUDE.md + PROGRESS.md fresh.

- [ ] `src/lib/anzan/number-generator.ts` — Mulberry32 seeded PRNG; no consecutive duplicates; `seed = question_id`.
  Depends: Phase 1 types
  Criterion: `generateFlashSequence({ seed: 'same-uuid', ... })` returns identical array on repeated calls
- [ ] `src/lib/anzan/timing-engine.ts` — RAF loop, delta accumulator, `onFlash` textContent-only, 200ms hard cap, contrast tokens.
  Depends: constants.ts
  Criterion: `startFlashLoop` with `interval = 100` throws `INTERVAL_BELOW_MINIMUM`; no `setInterval` in file (grep)
- [ ] `src/lib/anzan/visibility-guard.ts` — `visibilitychange` → `cancelAnimationFrame`; pause state machine.
  Depends: timing-engine.ts
  Criterion: Tab going hidden stops RAF; `performance.now()` snapshot saved
- [ ] `src/lib/anzan/contrast-dampener.ts` — `getContrastTokens()`: 3 tiers; throws for < 200ms.
  Depends: timing-engine.ts
  Criterion: `getContrastTokens(250)` returns `#334155` text on `#F1F5F9` bg
- [ ] `src/lib/anzan/color-calibration.ts` — CIELAB equiluminance; `#991B1B` for negatives.
  Depends: none
  Criterion: Negative number rendered with `color: #991B1B`
- [ ] `src/lib/anticheat/clock-guard.ts` — HMAC seal, monotonic tracking.
      Criterion: `crypto.timingSafeEqual` used.
- [ ] `src/lib/anticheat/tab-monitor.ts` — visibilitychange listener, Broadcast telemetry.
      Criterion: fires Broadcast on hidden.
- [ ] `src/lib/anticheat/teardown.ts` — pagehide + keepalive fetch.
      Criterion: dispatchEvent('pagehide') fires keepalive to /api/submissions/teardown.
- [ ] Realtime hooks (files 157–168) — All 12 hooks: presence, broadcast, heartbeat, offline-sync, clock-guard, anzan-engine, debounce, url-state, optimistic-reorder, version-cache, storage-estimate, input-cooldown.
  Depends: Phase 2–5
  Criterion: `npm run tsc` — all hooks pass; `useAnzanEngine` has no `setInterval` (grep)
- [ ] `src/components/assessment-engine/anzan-flash-view.tsx` — Phase 2 (full blackout): `question-navigator` unmounted, `transition: none !important` on `.flash-number`.
  Depends: timing-engine.ts, contrast-dampener.ts
  Criterion: `.flash-number` has no CSS transition in computed styles; `question-navigator` absent from DOM during Phase 2
- [ ] `src/components/assessment-engine/` — All remaining engine components (files 95–105): exam-vertical-view, mcq-grid, exam-timer, question-navigator, sync-indicator, paused-overlay, transition-interstitial, network-banner, confirm-submit, completion-card.
  Depends: anzan-flash-view.tsx
  Criterion: `npm run tsc` — 0 errors; MCQ grid touch targets ≥ 64×64px (verified in browser)
- [ ] `src/hooks/use-anzan-engine.ts` — Full RAF hook integrating timing, visibility, contrast, pause/resume.
  Depends: all anzan lib files
  Criterion: Hook returns cleanup fn; `cancelAnimationFrame` called on unmount (verify with React StrictMode)
- [ ] `src/app/(student)/assessment/[id]/page.tsx` — **Assessment Engine page**: renders EXAM or TEST via `type`; full offline + anti-cheat + teardown.
  Depends: all Phase 8 files, Phases 4–7
  Criterion: EXAM renders `exam-vertical-view`; TEST renders `anzan-flash-view`; submitting offline stores to Dexie
- [ ] Public assets (files 191–196) — Copy fonts, SVGs, audio files to `public/`.
  Criterion: `public/fonts/` has DM Mono `.woff2`; audio plays on completion
- [ ] Supabase scaffold — `supabase/config.toml`, `supabase/seed.sql` with demo institution + students.
  Criterion: `npx supabase db reset` populates test data; demo student can log in

---

## Final Verification Checklist

- [ ] `npm run tsc` — 0 errors across entire codebase
- [ ] `npm run lint` — 0 errors; `admin.ts` import in `(student)/` triggers lint error
- [ ] `npm run build` — production build completes; CSP headers in response
- [ ] Lighthouse: Admin dashboard LCP < 2.5s; Student dashboard LCP < 3.5s
- [ ] Flash timing: `performance.mark()` around `swapNumber()` — max measured latency ≤ 16.6ms
- [ ] WebSocket jitter: all connections use `setTimeout(connect, Math.random() * 5000)`
- [ ] `grep -r "setInterval\|setTimeout" src/lib/anzan/` — returns 0 results
- [ ] `grep -r "FF6B6B" src/` — returns 0 results (banned colour)
- [ ] `grep -r "121212" src/` — returns 0 results (banned background)
- [ ] All Realtime hooks have `supabase.removeChannel()` in cleanup
