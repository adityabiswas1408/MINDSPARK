# MINDSPARK — Development Progress

## Current Phase
Post Phase 8 — Bug Fixes + Test Infrastructure + Pre-Launch

## Last Completed Task
- fix: move student pages into /student/ subdirectory — committed and pushed
- fix: sidebar hydration error and login page layout — committed and pushed
- set up offline IndexedDB structure (db.ts, indexed-db-store.ts) — local

## Phase Completion Status
Phase 0 — ✅ Complete (755e1b92)
Phase 1 — ✅ Complete (bd558096) — 26 migrations, verified on remote DB
Phase 2 — ✅ Complete (7e9618a1)
Phase 3 — ✅ Complete (e7a030ad)
Phase 4 — ✅ Complete (37665008)
Phase 5 — ✅ Complete (d5715ef0)
Phase 6 — ✅ Complete (2081fe83)
Phase 7 — ✅ Complete (2be6bfc0)
Phase 8 — ✅ Complete (9139db17)

## Current Route Structure (verified correct)
Admin routes:   /dashboard /levels /students /assessments /results
                /announcements /reports /activity-log /settings /monitor/[id]
                ⚠️ PROBLEM — these are missing the /admin/ prefix
                They should be /admin/dashboard /admin/levels etc.
                This is the NEXT thing to fix.

Student routes: /student/dashboard /student/exams /student/tests
                /student/lobby/[id] /student/profile /student/consent
                /student/results /student/assessment/[id]
                ✅ These are correct

Unknown route:  /api/sync — this should not exist
                The correct route is /api/submissions/offline-sync
                Must be investigated and deleted if rogue.

## Immediate Next Tasks (in this exact order)

### Task 1 — Investigate /api/sync rogue route
Run in PowerShell:
Get-ChildItem -Recurse src/app/api -Filter "route.ts" | Select-Object FullName
If src/app/api/sync/route.ts exists — delete it.
The correct routes are:
- src/app/api/submissions/teardown/route.ts
- src/app/api/submissions/offline-sync/route.ts
- src/app/api/consent/verify/route.ts

### Task 2 — Fix admin routes missing /admin/ prefix
Admin pages are in (admin)/dashboard/page.tsx → resolves to /dashboard (WRONG)
They should resolve to /admin/dashboard
Fix: Move all admin pages into (admin)/admin/ subdirectory — same fix as student pages.

Files to move:
src/app/(admin)/activity-log/page.tsx    → src/app/(admin)/admin/activity-log/page.tsx
src/app/(admin)/announcements/page.tsx   → src/app/(admin)/admin/announcements/page.tsx
src/app/(admin)/assessments/page.tsx     → src/app/(admin)/admin/assessments/page.tsx
src/app/(admin)/dashboard/page.tsx       → src/app/(admin)/admin/dashboard/page.tsx
src/app/(admin)/levels/page.tsx          → src/app/(admin)/admin/levels/page.tsx
src/app/(admin)/monitor/[id]/page.tsx    → src/app/(admin)/admin/monitor/[id]/page.tsx
src/app/(admin)/reports/page.tsx         → src/app/(admin)/admin/reports/page.tsx
src/app/(admin)/results/page.tsx         → src/app/(admin)/admin/results/page.tsx
src/app/(admin)/settings/page.tsx        → src/app/(admin)/admin/settings/page.tsx
src/app/(admin)/students/page.tsx        → src/app/(admin)/admin/students/page.tsx

After moving: npm run build → confirm /admin/dashboard etc. appear in route list
Then: npm run tsc → 0 errors
Then: npm run lint → 0 errors
Then commit.

### Task 3 — Set up Vitest unit tests
Create vitest.config.ts in project root.
Write these 3 test files from docs/19_test-plan.md:
- src/lib/anzan/timing-engine.test.ts    (RAF drift < 5ms over 10s)
- src/lib/anticheat/clock-guard.test.ts  (HMAC guard)
- src/lib/anzan/number-generator.test.ts (no consecutive duplicates)
Run: npm run test → all pass

### Task 4 — Set up Playwright E2E
Create playwright.config.ts in project root.
Write smoke test: e2e/smoke.spec.ts
Test: student can navigate to /student/dashboard after login
Run: npm run test:e2e → passes

### Task 5 — Work through pre-launch-checklist.md
Gate 1: Legal
Gate 2: Technical
Gate 3: Performance
Gate 4: Security
Gate 5: Operational

## Known Issues (must fix before production)
1. Admin routes missing /admin/ prefix — CRITICAL — Task 2 above
2. /api/sync rogue route — must investigate — Task 1 above
3. bulk_import_students p_cohort_id typed as string not UUID|null
   Location: types/supabase.ts + RPC definition
   Fix: Update RPC to accept nullable UUID
4. dashboard_aggregates view not applied to production DB
   Location: supabase/migrations/20260325000000_dashboard_aggregates.sql
   Fix: Run the migration on remote Supabase
5. No unit tests written yet — Task 3 above
6. No Playwright E2E config — Task 4 above
7. IPv6 blocking Supabase CLI type generation
   Workaround: Use MCP tool or Supabase dashboard download

## Schema Discrepancies Resolved (do not redo these)
- exam_papers: type, closed_at, opened_at, result_published_at, anzan_delay_ms,
  anzan_digit_count, anzan_row_count — all added via ALTER TABLE
- questions: equation_display, flash_sequence, option_a-d, correct_option — added via ALTER
- assessment_sessions: started_at, closed_at, student_id — added via ALTER
- submissions: paper_id, completion_seal, dpm — added via ALTER
- announcements: body_html, published_at, target_level_id — added via ALTER
- grade_boundaries: min_score, max_score, grade, label, assessment_type — added via ALTER
- students: institution_id, deletion_scheduled_at, date_of_birth — added via ALTER
- bulk_import_students RPC: rewritten with correct parameters
- validate_and_migrate_offline_submission: implemented with Vault secret
- activity_logs actual columns: user_id, entity_type, entity_id, metadata, action_type

## Critical Canonical Facts (never change these)
- Migration count: 26 (001→026) on remote Supabase ahrnkwuqlhmwenhvnupb
- student_answers: submission_id FK + question_id UUID FK (Design A)
- RPC: validate_and_migrate_offline_submission (full name — no shorter form)
- 3 Route Handlers: teardown, offline-sync, consent/verify
- 16 Server Actions across 9 files (all plural or hyphenated)
- Phase string: PHASE_2_FLASH (never 'FLASH')
- #991B1B: negative arithmetic numbers ONLY
- #DC2626: wrong answers, errors, validation failures
- student.id = profile.id = auth user UUID (1:1 mapping)
- admin monitor route: /admin/monitor/[id] (not /admin/live-monitor)
- student routes: plural (/student/exams /student/tests)

## Repository
GitHub: https://github.com/adityabiswas1408/MINDSPARK
Remote Supabase: ahrnkwuqlhmwenhvnupb
Stack: Next.js 15, Supabase, shadcn/ui (Base UI), Tailwind 4, Zustand, Dexie 4

## PowerShell Command Reference
grep → Select-String -Path "file" -Pattern "pattern"
head → Get-Content file -TotalCount 5
cat  → Get-Content file
ls   → Get-ChildItem
&&   → use ; instead
>    → use | Set-Content (for type generation)
git add paths with () → always use quotes: git add "src/app/(admin)/..."
