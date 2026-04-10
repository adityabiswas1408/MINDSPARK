Create the file A:\MS\mindspark\TASKS.md with the 
complete contents below. Overwrite any existing file.
Read CLAUDE.md first. Then write this file exactly
as specified. Do not summarise. Do not skip sections.

After writing, run:
Get-Content A:\MS\mindspark\TASKS.md | Measure-Object -Line
Report line count. Must exceed 600 lines.

Then commit:
git add TASKS.md
git commit -m "chore: comprehensive TASKS.md rewrite — all tasks, validators, skill invocations"
git push

Installed packages confirmed:
recharts, @tanstack/react-table, @hello-pangea/dnd,
@tiptap/react, @tiptap/starter-kit, dexie,
sanitize-html, lucide-react, zustand, zod,
date-fns, papaparse, lottie-react
Skip all package verification.

════════════════════════════════════════════════════════
FILE CONTENTS — write everything below exactly
════════════════════════════════════════════════════════

# MINDSPARK — Master Task Board
# Last updated: 2026-04-10
# Rule: Top item in UP NEXT is always the next task.

---

## HOW TO USE THIS FILE

1. Read KNOWN BUGS first — every session, every task.
2. Read IN PROGRESS to know the current task.
3. Before coding: read every file under "Files to read".
4. Invoke skills listed under "Skills to invoke" first.
5. Propose a 3-bullet plan. Wait for "proceed".
6. Run every Validator item before marking DONE.
7. After completing: update this file.
   git add TASKS.md
   git commit -m "chore: task board — [task] done"
   git push

---

## CODE QUALITY RULES
## Every task inherits these rules. No exceptions.

### Planning
- Invoke /superpowers at the start of every task
- State 3 bullet plan before writing any code
- Wait for explicit "proceed" before editing files
- If blocked after 2 attempts: stop, report blocker,
  do not retry same approach a third time

### Response Style
- Concise responses only
- After each step: one line — PASS / FAIL / NEEDS ATTENTION
- No detailed summaries unless asked

### File Reading
- Read files sequentially in current context
- Do NOT spawn subagents for file reading
- Do NOT parallelize unless task says "run in parallel"

### Database Rules
- Before ANY UPDATE or INSERT:
  Run SELECT with same WHERE clause first
  Show row count. Only proceed if count > 0
  If count = 0: stop and investigate
- Before ANY status/enum column update:
  SELECT constraint_name, check_clause
  FROM information_schema.check_constraints
  WHERE table_name = '[table]';
  Verify exact casing of allowed values
- Before ANY upsert:
  SELECT indexname, indexdef
  FROM pg_indexes WHERE tablename = '[table]';
  Use exact columns from the unique index

### Build and Deploy
- Run npm run tsc after every file change
- Zero TypeScript errors before committing
- After every deploy:
  Use chrome-devtools to navigate affected route
  Confirm HTTP 200 not 404
  Take one screenshot to confirm render
  Never declare done from build logs alone
- Before debugging any build error:
  Run git diff HEAD~1 --name-only
  Check if a recent Claude-made change is the cause
  Revert first, rebuild, confirm — then add new fixes

### Browser Testing
- Maximum 3 screenshots per session
- Use take_snapshot or get_page_text for functional
  verification — costs ~200 tokens vs ~6k for screenshot
- Never use evaluate() or querySelector for clicking
  interactive UI elements — bypasses React events
- When clicking inside Base UI dialogs:
  Verify dialog is open first
  Use chrome-devtools click tool on exact button text
  If click times out: check for data-base-ui-inert overlay

### Test Reset (run before every exam flow test)
Run scripts/reset-test-state.sql in Supabase SQL editor:
  UPDATE assessment_sessions
  SET closed_at = NOW()
  WHERE student_id = (
    SELECT id FROM students
    WHERE roll_number = 'STUDENT-001'
  ) AND closed_at IS NULL;
  SELECT COUNT(*) as open_sessions
  FROM assessment_sessions
  WHERE student_id = (
    SELECT id FROM students
    WHERE roll_number = 'STUDENT-001'
  ) AND closed_at IS NULL;
Expected: 0

### UI and Components
- Skeleton loaders: Tailwind animate-pulse only
  No external skeleton libraries
- Modals and overlays: always use
  createPortal(content, document.body)
  Never rely on z-index alone when parent has
  overflow: auto or overflow: hidden
- Skeleton shape must match real content layout

### Skills
- /superpowers — every task, plan before code
- /frontend-design — every UI component task
- /shadcn — forms, dialogs, tables, inputs, badges
- /ui-ux-pro-max — all student-facing pages
- /web-design-guidelines — layout, spacing, typography

---

## KNOWN BUGS
## Read this section before starting any task.

### BUG 1: tickerMode hardcoded false
Severity: MEDIUM
Where: src/stores/exam-session-store.ts
What happens: ticker mode never activates regardless
  of student profile setting
Root cause: hardcoded false, not read from
  profiles.ticker_mode
Fix: read profiles.ticker_mode for student on
  session init, pass to store
Blocks: Task 12 (exam engine)

### BUG 2: Anzan config hardcoded
Severity: MEDIUM
Where: src/components/exam/anzan-flash-view.tsx
What happens: digit count and row count use hardcoded
  values instead of exam configuration
Root cause: anzan_digit_count and anzan_row_count
  not passed from exam_papers record
Fix: read from exam_papers and pass as props
Blocks: Task 12 (exam engine)

### BUG 3: No lobby polling fallback
Severity: HIGH
Where: src/app/(student)/student/exams/[id]/lobby/
  lobby-client.tsx
What happens: if student misses WebSocket broadcast
  they stay in lobby forever
Root cause: lobby only listens to WebSocket,
  no polling fallback
Fix: add 30-second polling interval checking
  exam_papers.status directly
Blocks: Task 15 (lobby polling)

### BUG 4: No storage buckets in Supabase
Severity: MEDIUM
Where: Supabase project ahrnkwuqlhmwenhvnupb
What happens: avatar uploads, CSV imports, logo
  uploads all fail silently
Root cause: buckets never created
Fix: create via Supabase dashboard or SQL:
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars','avatars',false),
         ('logos','logos',true),
         ('csv-imports','csv-imports',false)
Blocks: Task 5 (admin students)

### BUG 5: Student results page is empty shell
Severity: HIGH
Where: src/app/(student)/student/results/page.tsx
What happens: blank page, no data
Blocks: Task 4 (student results)

### BUG 6: Student exams list page is empty shell
Severity: HIGH
Where: src/app/(student)/student/exams/page.tsx
What happens: blank page, no exam cards
Blocks: Task 2 (student exams list)

### BUG 7: onConflict key mismatch risk
Severity: HIGH
Where: any upsert on submissions table
What happens: upsert silently does nothing if
  conflict key does not match actual unique index
Root cause: submissions has composite unique index
  (session_id, student_id) — both columns required
Fix: always verify indexes before upsert (see
  DATABASE RULES above)
Blocks: none currently — fixed in Task 1

### BUG 8: tickerMode reads false until DB column added
Severity: LOW
Where: src/app/(student)/student/exams/[id]/page.tsx line ~37
What happens: ticker mode never activates even if
  profiles table has ticker_mode column
Root cause: prop chain is wired but DB fetch is
  commented out pending schema addition
Fix: Run in Supabase SQL editor:
  ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ticker_mode
  BOOLEAN DEFAULT false;
  Then uncomment the fetch on line ~37 of page.tsx
Blocks: nothing critical — ticker mode is enhancement only

---

After writing the complete file:
1. Count lines:
   Get-Content A:\MS\mindspark\TASKS.md |
   Measure-Object -Line
   Must be over 600 lines. If not, something
   was skipped — check and complete it.

2. Verify every task has all sections:
   Why it matters, Skills to invoke,
   Files to read, Changes to make,
   Hard constraints, Performance requirement,
   Validator, After completing

3. Commit:
   git add TASKS.md
   git commit -m "chore: comprehensive TASKS.md —
   17 tasks with validators, skill invocations,
   deployment checklist"
   git push

4. Report: line count and commit hash.

## IN PROGRESS
_(none — all tasks complete)_

---

## UP NEXT

## DONE

### Task 15: Performance — 500 Concurrent Students
Completed: 2026-04-11
Commit: c4719ebe
What was built: Installed k6 v1.7.1, fixed all three load test scripts (VUs 2500→500, field name mismatch, UUID format, missing apikey header, 204 check fix, jitter), created heartbeat_ping RPC, seeded test session/submission, ran all three tests, wrote k6-results/load-test-report.md.
Key findings: Supabase Nano compute has hard 200-connection limit. LT-01 (WebSocket) PASS at 500 VUs (p95=675ms). LT-02 (Heartbeat RPC) FAIL p95=3.98s — plan-level constraint not app bug. LT-03 (Offline Sync) FAIL p95=56.69s at 500 VUs — connection pool exhaustion. Safe concurrent limit on Nano tier is ~150 students. Upgrade to Small/Medium compute required for 500-student deployment.

### Task 14: Lobby Polling Fallback
Completed: 2026-04-11
Commit: fbf207bd
What was built: Added 30-second setInterval polling to lobby-client.tsx that queries exam_papers.status via Supabase client on each tick. CLOSED status triggers redirect to /student/exams. LIVE/PUBLISHED/DRAFT are no-ops. Shared `navigated` ref guards both the polling redirect and the existing countdown-timer redirect, preventing duplicate router.push calls.
Key findings: No WebSocket subscription existed in lobby-client.tsx (task description was outdated — "subscribes to WebSocket broadcast" was never implemented). Countdown timer's existing redirect was not guarded — added navigated ref check there too. Expired exam sessions (timer=0 on mount) redirect immediately on first tick, which is correct behavior.

### Task 13: Offline Sync Verification
Completed: 2026-04-11
Commit: d1e164ab
What was built: Fixed 4 bugs blocking offline sync: (1) route removed hmac_timestamp from client schema and computes HMAC server-side via createHmac; (2) RPC updated to accept p_secret TEXT param instead of current_setting('app.hmac_secret') which cannot be set on Supabase managed Postgres; (3) sync-indicator gained 'syncing' state (blue pulse); (4) exam-page-client and assessment-client gained proper offline→syncing→synced state transitions. Old 3-param RPC overload dropped.
Key findings: ALTER DATABASE SET app.hmac_secret is blocked on Supabase (permission denied even for postgres role); CREATE OR REPLACE FUNCTION with new param signature creates an overload — must DROP old signature separately; RPC was reading session_id from payload JSON (missing key) instead of staging row column; outer EXCEPTION handler INSERT was missing institution_id causing silent SYNC_ERROR failures; HMAC_REJECTION path in RPC verified working via direct MCP call; route now returns 401 specifically for HMAC_MISMATCH reason.

### Task 12: Admin Activity Log Page
Completed: 2026-04-10
Commit: 938fb720
What was built: Rewrote activity-log.ts action with pagination, filtering (action type, actor search, date range), and CSV export. Created activity-log-client.tsx with expandable rows, colour-coded badges for all 13 real action_types, and system status bar. Page.tsx fetches initial 50 rows server-side with two-step profile lookup.
Key findings: existing action sorted on non-existent `created_at` (DB column is `timestamp`); badge colours mapped to actual DB action_types (FORCE_CLOSE_EXAM not FORCE_CLOSE; no LOGIN_SUCCESS); profiles.email is accessible for actor display — no auth.users join needed; adminSupabase bypasses RLS for reliable reads.

### Task 11: Admin Settings Page
Completed: 2026-04-10
Commit: 43d4266a
What was built: Institution Profile form (name, timezone, session timeout) wired to updateSettings action; Grade Boundaries table loading all 5 grades (O/A+/A/B/C) from DB with client-side overlap detection; Data Retention toggle as UI-only with support note; session countdown timer via getSession(); Support card.
Key findings: updateSettings had no name field — extended action to accept name; grade_boundaries min_score/max_score were NULL in DB so max is derived from next grade's min_percentage - 1 on init; no auto_archive column exists — toggle is UI-only; delete-then-insert wrapped with backup/restore for atomicity protection; Switch component not in shadcn — built custom toggle button.

### Task 10: Admin Announcements Page
Completed: 2026-04-10
Commit: 9c3aaa3c
What was built: 3-file feature — tiptap-editor.tsx (Bold/Italic/BulletList toolbar, dynamic ssr:false), announcements-client.tsx (compose form + history panel + engagement insights), page.tsx (server component fetching levels, last 5 announcements, read counts via adminSupabase). createAnnouncement action already existed.
Key findings: announcement_reads has RLS enabled — must use adminSupabase for count queries. priority column is NOT NULL but defaults to 'normal' so no explicit value needed. body_html is the column name (not body). Select onValueChange returns string|null — wrap with v ?? 'all' to satisfy TypeScript.

### Task 9: Admin Monitor — Real-time Student Table
Completed: 2026-04-10
Commit: a3e910a1
What was built: Monitor index page with student count + time remaining cards; detail page server component fetching sessions/students/answers; MonitorClient with TanStack table, 3 realtime channels (postgres_changes, broadcast, presence), countdown timer, Force Close button.
Key findings: assessment_sessions has cohort-level rows with student_id = NULL — must filter IS NOT NULL on all queries. Submitted state derived from submissions.completed_at NOT sessions.status. supabase_realtime publication was empty — added assessment_sessions + student_answers via MCP. forceCloseExam takes { assessment_id } not { paper_id }.

### Task 8: Admin Results Page
Completed: 2026-04-10
Commit: 1cbcadb3
What was built: publishResults batch action in results.ts, ResultsClient with TanStack table + recharts AreaChart grade distribution + bulk publish + re-evaluate, admin page.tsx with URL-driven paper selection and server-side submissions fetch.
Key findings: (1) No shadcn Checkbox exists — use native <input type="checkbox"> with ref callback for indeterminate state. (2) recharts ResponsiveContainer requires explicit px height on parent div (h-[280px]). (3) calculate_results RPC requires grade boundaries configured to assign grades — without them grade stays null. (4) searchParams is a Promise in Next.js 15 — must await before destructuring.

### Task 7: Admin Levels — Wire Create Level Button
Completed: 2026-04-10
Commit: c26874ac
What was built: CreateLevelDialog with auto-incrementing sequence_order, LevelsClient with optimistic drag-reorder via @hello-pangea/dnd, updateLevelOrder server action, secure page.tsx with institution_id filter and enrolled counts.
Key findings: (1) useState(initialLevels) doesn't re-init on prop change — useEffect sync needed after router.refresh(). (2) UNIQUE constraint on (institution_id, sequence_order) blocks parallel swap — fixed with two-phase offset update (add 10000 first, then set final values).

### Task 6: Admin Students Page
Completed: 2026-04-10
Commit: 3577b7e0
What was built: Paginated students table with level/status filters, client-side search, checkbox bulk actions (promote/suspend), Add Student modal, and full profile page with academic history tab.
Key findings: students table uses deleted_at for soft-delete (no status column); levels use sequence_order not sort_order; Base UI DialogTrigger needs render prop not asChild; Select onValueChange returns string|null requiring null guard.

### Task 5: Admin Dashboard Charts
Completed: 2026-04-10
Commit: 1780b207
What was built: KPI cards with 7-day sparklines (bucketByDay/bucketAvgByDay helpers), Score Trend LineChart (6-month monthly avg), Level Distribution BarChart, Recent Activity feed with colour-coded badges. DashboardCharts client wrapper created to fix Next.js 15 `ssr: false` Server Component restriction.
Key findings: submissions columns are `percentage`/`created_at` (not `score_percentage`/`submitted_at`); activity_logs timestamp column is `timestamp` (not `created_at`); `dashboard_aggregates` view does not exist — direct queries used; `assessment_sessions.status = 'active'` (lowercase); `next/dynamic` with `ssr: false` must live in a `'use client'` component, never in a Server Component.

### Student Results Page
Completed: 2026-04-10
Commit: f724c0ce
What was built: Server Component fetching submissions
joined to exam_papers via paper_id (confirmed in live
DB via dashboard_aggregates migration). Hero card
(dark green, score + grade badge). Pending Evaluation
section. Academic Ledger table (percentage/grade/dpm
columns from live DB). Score Trend recharts LineChart
in separate 'use client' component. Empty state.
Key findings: column is `percentage` not
`score_percentage`; `paper_id` added to live DB
manually (no FK constraint — used two-query pattern).

### Exam Engine Improvements
Completed: 2026-04-10
What was built: Fullscreen exam layout via createPortal
to document.body (escapes overflow:auto parent; fixed
inset-0 z-9999 covers sidebar/header). Equation container
scrolls vertically for 8+ rows; font scales at 10/15+
rows. Navigator sidebar widened to 120px with Remaining
count header. Large "Submit Exam →" on last question.
ConfirmSubmit shows unanswered indices list, renamed
buttons to "Review Answers"/"Submit Final". tickerMode
prop threaded page→ExamPageClient→AnzanFlashView
(DB column pending). BUG 2 and flash gating already
correct — not touched.
Verified by: screenshot confirmed sidebar fully hidden,
exam fullscreen, remaining counter, submit button visible.
Commit: 997f415f

### Student Exams List Page
Completed: 2026-04-10
What was built: Rewrote /student/exams as Server Component
with 3 sections — LIVE NOW (reuses LiveExamCard with timer),
UPCOMING (date-badge rows matching dashboard style),
COMPLETED (greyed cards with View Results link). Empty state
when no exams for student's level. Fetches exam_papers
filtered by institution_id + level_id across LIVE/PUBLISHED/
CLOSED statuses. STUDENT-001 password set to Student@123456.
Verified by: page renders live exam, upcoming exam visible,
correct lobby URL, zero console errors.

### Skeleton Loaders — All Pages
Completed: 2026-04-10
What was built: src/components/shared/skeletons.tsx
with 6 named exports (KpiCardSkeleton, TableRowSkeleton,
AssessmentCardSkeleton, DashboardHeroSkeleton,
ExamCardSkeleton, ResultsRowSkeleton). Six loading.tsx
files added for admin/dashboard, admin/students,
admin/assessments, student/dashboard, student/exams,
student/results. DashboardHeroSkeleton uses bg-slate-600
(not bg-slate-200) to match the dark #1A3829 hero card.
All inline styles from real pages reproduced exactly.
Verified by: tsc 0 errors. No console errors on admin
routes. No external deps added.

### Exam Submit Flow
Completed: 2026-04-09
What was built: submitExam action wired to
confirm-submit dialog. student_answers rows saved.
assessment_sessions.closed_at set. Completion card
renders via createPortal to document.body.
Score and time taken displayed on completion card.
Bugs fixed: onConflict key mismatch (composite index
session_id + student_id required both columns).
Portal stacking context (overflow:auto on parent
trapped fixed children — fixed with createPortal).
Verified by: student_answers rows confirmed in DB
after submit. completion card rendered correctly.

### Exam MCQ Page
Completed: 2026-04-09
What was built: /student/exams/[id]/page.tsx.
Vertical equation display, MCQ grid, question
navigator, countdown timer, Submit Exam button.
Phase chain fixed: IDLE→LOBBY→INTERSTITIAL→
PHASE_1_START→PHASE_2_FLASH→PHASE_3_MCQ.
Bugs fixed: phase transition guard blocked chain.
Verified by: equation renders, MCQ grid works,
navigator shows pills, timer counts down.

### Student Lobby Page
Completed: 2026-04-09
What was built: /student/exams/[id]/lobby/page.tsx
and lobby-client.tsx. Circular countdown timer,
network status badge, pre-flight checklist,
I'm Ready button, session creation, bottom info bar.
Bugs fixed: consent_verified was false (patched in DB).
Status 'ACTIVE' should be 'active' (fixed in action).
Webpack WasmHash crash (reverted sha256 override).
Stale file at wrong path deleted.
Verified by: session row created in DB, timer counted
down, I'm Ready navigated to exam page.

### Student Dashboard
Completed: 2026-04-08
What was built: LIVE NOW hero card with countdown,
upcoming assessments list, candidate profile panel,
skill metrics. Sidebar and top header.
Bugs fixed: opened_at was not set on forceOpenExam
(fixed in assessments.ts). Timer showed --:-- (fixed).
Verified by: countdown showed 29:36 and ticked down.

### Create Assessment Wizard
Completed: 2026-04-07
What was built: 3-step wizard. Step 1 type picker,
Step 2 question builder with add/delete, Step 3
config with title/level/duration. Assessment cards
with status badges. Go Live and Force Close buttons.
Bugs fixed: wizard flashed Step 1 on close (close
first, reset state after 300ms). LIVE badge had no
pulse (fixed with animate-ping).
Verified by: full E2E — create→publish→live→student
sees exam in 7/7 steps passing.

### Question Server Actions
Completed: 2026-04-07
What was built: src/app/actions/questions.ts with
createQuestion, deleteQuestion, reorderQuestions.
Verified by: questions saved to DB during wizard.

### Admin Sidebar and Sign Out
Completed: 2026-04-06
What was built: Green #1A3829 sidebar with white
nav links, active state white pill. Sign Out calls
supabase.auth.signOut() and redirects to /login.
Bugs fixed: text-white/80 Tailwind v4 opacity variant
not compiling. hidden md:flex cascade ordering bug.
Verified by: sidebar rgb(26,56,41) confirmed in
computed styles. Sign Out redirects correctly.

### Tailwind v4 CSS Fixes
Completed: 2026-04-06
What was fixed: Slate palette added to @theme inline
(border-slate-200, text-slate-400 etc now compile).
Cascade bug fixed (.admin-sidebar CSS class replaces
hidden md:flex). bg-bg-page and text-green-800
now compile correctly.
Note: downgrade to Tailwind v3 was NOT possible.
Shadcn components use v4-only syntax (has-data-[],
in-data-[], ring-3, rounded-4xl). v3 would have
broken all shadcn components.
Verified by: all named colour classes compile,
sidebar visible at correct colour.

### MCP Infrastructure
Completed: 2026-04-08
What was set up: code-review-graph (402 nodes,
2260 edges), Chrome DevTools MCP, Supabase MCP,
Context7 MCP. All Windows cmd /c wrapper warnings
fixed. Duplicate chrome-devtools server removed.
skills: superpowers, frontend-design, shadcn,
ui-ux-pro-max, web-design-guidelines installed.

---

## BEFORE DEPLOYMENT TO REAL STUDENTS

### PRE-1: Rotate Compromised Credentials
What to do:
  Supabase service role key — exposed in git history
  Generate new key in Supabase dashboard → API settings
  Update SUPABASE_SERVICE_ROLE_KEY in Vercel env vars
  Database superuser password — change in Supabase
  HMAC_SECRET — generate new value:
    node -e "console.log(require('crypto')
    .randomBytes(32).toString('hex'))"
  Update HMAC_SECRET in Vercel env vars
  Update app.hmac_secret in production DB:
    ALTER DATABASE postgres
    SET app.hmac_secret = '[new value]';
    SELECT pg_reload_conf();
  OFFLINE_SYNC_SECRET — same process
How to verify:
  Old key returns 401 when used in API call
  New key works in Supabase client
Consequence of skipping:
  Any attacker with git history access can query
  your production database directly.

### PRE-2: Verify app.hmac_secret in Production
What to do:
  Run in Supabase SQL editor:
  SELECT
    current_setting('app.hmac_secret', true)
    IS NOT NULL AS configured,
    length(current_setting('app.hmac_secret',
    true)) AS secret_length;
How to verify: configured = true, length > 0
Consequence of skipping: all offline sync fails.

### PRE-3: Create Storage Buckets
What to do:
  Run in Supabase SQL editor:
  INSERT INTO storage.buckets (id, name, public)
  VALUES
    ('avatars','avatars',false),
    ('logos','logos',true),
    ('csv-imports','csv-imports',false)
  ON CONFLICT DO NOTHING;
How to verify: buckets visible in Supabase Storage tab
Consequence of skipping: avatar uploads fail.

### PRE-4: Lighthouse Audit — All Pages
What to do:
  Run Lighthouse in Chrome DevTools on:
  /admin/dashboard, /admin/students,
  /admin/assessments, /student/dashboard,
  /student/exams/[id]/lobby,
  /student/exams/[id]
  Fix any score below 90 in:
  Performance, Accessibility, Best Practices, SEO
How to verify: all pages score 90+ in all categories
Consequence of skipping: poor accessibility and
performance on student-facing exam pages.

### PRE-5: axe Accessibility Scan
What to do:
  Run axe-core on every page:
  npx playwright test e2e/a11y.spec.ts
  Fix ALL violations marked CRITICAL or SERIOUS
  Common issues to check:
  - Timer has aria-live="polite" and aria-atomic="true"
  - Flash number has aria-hidden="true"
  - Network banner has role="alert"
  - MCQ buttons minimum 44px touch target
  - All form inputs have associated labels
How to verify: zero CRITICAL or SERIOUS violations
Consequence of skipping: platform is inaccessible
to students with disabilities.

### PRE-6: Load Test — 500 Concurrent Students
Covered in Task 15 above.
Must complete before deployment.

### PRE-7: Full Admin Walkthrough
What to do:
  Complete full admin flow without any help:
  Login → create level → create assessment →
  add questions → publish → go live →
  monitor students → force close →
  view results → publish results → logout
  Document any friction or confusion.
How to verify: walkthrough completes without errors
Consequence of skipping: admin discovers broken
flows during first real exam.

### PRE-8: Full Student Walkthrough
What to do:
  Complete full student flow without any help:
  Login → dashboard → see live exam →
  enter lobby → I'm Ready → take exam →
  answer all questions → submit → view results
  Do this for both EXAM type and TEST type.
How to verify: both walkthroughs complete cleanly
Consequence of skipping: students hit broken flows
during first real exam.

### PRE-9: Verify HMAC Rejection
Covered in Task 13 Validator.
HMAC_REJECTION must appear in activity_logs.

### PRE-10: Verify Offline Sync
Covered in Task 13 Validator.
All 5 queued answers must sync on reconnection.

---

## AFTER DEPLOYMENT

### POST-1: Monitor Vercel Logs — First 24 Hours
What to do:
  Open Vercel dashboard → Functions tab
  Watch for any 500 errors or function timeouts
  Check every 2 hours for first day
How to verify: error rate below 0.1%

### POST-2: Verify pg_cron Dashboard Refresh
What to do:
  Run in Supabase SQL editor:
  SELECT * FROM cron.job
  WHERE jobname LIKE '%dashboard%';
  Wait 5 minutes, check dashboard KPI numbers
  updated vs previous values
How to verify: dashboard numbers change every
5 minutes during active exam periods

### POST-3: Check activity_logs for Errors
What to do:
  SELECT action_type, COUNT(*) as count
  FROM activity_logs
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY action_type
  ORDER BY count DESC;
  Flag any unexpected action types or
  unusually high error counts
How to verify: no HMAC_REJECTION or SYSTEM_LOCK
entries from legitimate student activity

### POST-4: Verify All Sessions Close Cleanly
What to do:
  After first real exam closes, check:
  SELECT COUNT(*) FROM assessment_sessions
  WHERE paper_id = '[first real exam id]'
  AND closed_at IS NULL;
  Expected: 0 (all sessions closed)
  If > 0: manually close and investigate why

════════════════════════════════════════════════════════
END OF FILE
════════════════════════════════════════════════════════

