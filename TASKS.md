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
### TASK 9: Admin Monitor — Real-time Student Table

**Why this matters:**
During a LIVE exam admin cannot see what students
are doing. If a student disconnects, admin has no
way to know. The monitor page is the control room
for live exams — critical for exam integrity.

**Skills to invoke:**
- /superpowers — plan before writing
- /frontend-design — real-time table design
- /ui-ux-pro-max — live monitoring UX
- /shadcn — table, badge, toast components

**Files to read before touching anything:**
- src/app/(admin)/admin/monitor/page.tsx
  — current empty shell
- src/app/(admin)/admin/monitor/[id]/page.tsx
  — check if detail page exists
- src/app/actions/assessment-sessions.ts
  — session fetch patterns
- supabase/migrations/ — realtime setup

**What currently exists:**
Monitor page is an empty shell.
Supabase realtime is configured for exam channels.

**Changes to make:**
1. Monitor index page (/admin/monitor):
   List of LIVE exam_papers
   Each with: title, student count, time remaining
   Click → goes to /admin/monitor/[paper_id]

2. Monitor detail page (/admin/monitor/[id]):
   Header: exam title, LIVE badge, Export Report,
   Force Close Exam button

   Summary row: In Progress count, Submitted count,
   Disconnected count, Waiting count

   Filter tabs: All Statuses, by level/grade
   Search: filter by student name

   Real-time table (Supabase realtime subscription):
   Columns: avatar, name, ID, current status badge,
   progress bar (questions answered / total),
   last seen timestamp, actions menu (⋮)

   Status colours:
   In Progress: green dot
   Submitted: blue checkmark
   Disconnected: red warning
   Waiting: grey dash

   Actions menu per row:
   Alert Student (placeholder toast)
   View Profile link

   Session Update toast: "System-wide auto-sync
   completed for all X active users. Latency: Xms"

3. Real-time subscription:
   Subscribe to assessment_sessions changes
   WHERE paper_id = [id]
   Update table row on INSERT/UPDATE without
   full page reload

**Hard constraints:**
- Realtime subscription must unsubscribe on
  component unmount (cleanup in useEffect return)
- Force Close Exam calls forceCloseExam action
  from assessments.ts — do not duplicate logic

**Performance requirement:**
Table must update within 3 seconds of student
status change. At 500 concurrent students:
realtime subscription must handle 500 simultaneous
presence updates without dropping events.
Test: open exam in two browser tabs simultaneously,
verify both show in monitor within 3 seconds.

**Validator — task is DONE only when ALL pass:**
[ ] /admin/monitor shows LIVE exams list
[ ] Click exam → detail page loads
[ ] Student table shows STUDENT-001 as active
[ ] Open exam in second browser tab as student
    — student appears in monitor within 3 seconds
[ ] Answer a question — progress bar updates
[ ] Student status changes to Submitted after submit
[ ] Force Close Exam button calls forceCloseExam
    — exam status changes to CLOSED in DB:
    SELECT status FROM exam_papers
    WHERE id = '[id]';
[ ] Realtime subscription cleaned up on navigate away
    — no memory leak (check DevTools Performance)
[ ] npm run tsc — exit 0
[ ] Zero console errors

**After completing this task:**
git add TASKS.md
git commit -m "chore: task board — admin monitor done,
move Task 10 to IN PROGRESS"
git push

---

## UP NEXT
### TASK 10: Admin Announcements Page

**Why this matters:**
Admin has no way to communicate with students.
Announcements are how admins broadcast exam
schedules, result publications, and policy updates.
TipTap is already installed but completely unused.

**Skills to invoke:**
- /superpowers — plan before writing
- /frontend-design — editor and history panel design
- /shadcn — select, input, button components

**Files to read before touching anything:**
- src/app/(admin)/admin/announcements/page.tsx
  — current empty shell
- src/app/actions/announcements.ts
  — createAnnouncement action if exists

**What currently exists:**
Announcements page is an empty shell.
TipTap installed as dependency but not used.

**Changes to make:**
1. Left panel — compose form:
   Title input (required)
   Target Level select (All Levels or specific level)
   Message Body: TipTap rich text editor
   Load TipTap with next/dynamic ssr:false
   Toolbar: Bold, Italic, Bullet List, Link
   Publish Announcement button

2. Right panel — Recent History:
   Last 5 announcements as cards:
   Title, sent time, read percentage bar,
   level badge, "Read by X of Y students"

3. Engagement Insights card at bottom of right panel:
   "Announcements sent on Tuesday mornings have
   a 25% higher read rate" (static text ok)

4. createAnnouncement action (create if not exists):
   Insert to announcements table:
   institution_id, created_by, title, body (HTML),
   target_level_id (null = all levels),
   published_at = NOW()

**Hard constraints:**
- TipTap must load with next/dynamic ssr:false
  or it will crash Next.js server rendering
- Announcement body stored as HTML string
  Sanitize with sanitize-html server-side
  DOMPurify is BANNED — use sanitize-html only

**Performance requirement:**
TipTap editor must be interactive within 2 seconds
of page load. Editor bundle loaded separately
from page shell via dynamic import.

**Validator — task is DONE only when ALL pass:**
[ ] /admin/announcements loads — editor visible
[ ] TipTap toolbar renders (Bold, Italic, List, Link)
[ ] Type announcement, click Publish
[ ] DB check:
    SELECT id, title, published_at
    FROM announcements
    ORDER BY published_at DESC LIMIT 1;
    New row must exist
[ ] Recent History panel shows published announcement
[ ] Target Level filter works — announcement stored
    with correct target_level_id
[ ] npm run tsc — exit 0
[ ] Zero console errors

**After completing this task:**
git add TASKS.md
git commit -m "chore: task board — announcements done,
move Task 11 to IN PROGRESS"
git push

---
### TASK 11: Admin Settings Page

**Why this matters:**
Admin cannot save institution configuration.
Grade boundaries are hardcoded. Session timeout
cannot be adjusted. Data retention policy has
no toggle. All forms render but save nothing.

**Skills to invoke:**
- /superpowers — plan before writing
- /shadcn — form, input, select, toggle, table
- /frontend-design — settings page layout

**Files to read before touching anything:**
- src/app/(admin)/admin/settings/page.tsx
  — current state, what renders
- src/app/actions/settings.ts
  — updateSettings, updateGradeBoundaries actions

**What currently exists:**
Settings page renders three sections but no form
saves any data. Actions may exist in settings.ts.

**Changes to make:**
1. Institution Profile section:
   Institution name input
   Primary timezone select (list of IANA timezones)
   Session timeout input (seconds, default 3600)
   Save Institution button → calls updateSettings
   On success: toast "Settings saved"

2. Grade Boundaries section:
   Table with rows: A+ / A / B / C
   Each row: grade label, min score input,
   max score input, status badge
   Overlap detection (client-side):
   If B.min > A.max or ranges overlap:
   highlight conflicting inputs in red
   Show "⚠ Overlap Detected — Min > Max value"
   Save Boundaries button → calls updateGradeBoundaries
   Reset to Defaults button

3. Data Retention Policy section:
   Auto-Archive Records toggle
   Description: "Move inactive student data to
   cold storage after 12 months"
   Save with institution settings

4. Support card (right side):
   "Need help with advanced config?"
   Open Developer Docs button (link only)

5. Current Session timer (bottom left):
   "CURRENT SESSION — Expires in: [countdown]"
   Reads from session expiry

**Hard constraints:**
- updateSettings must validate server-side
- Grade boundaries must not allow gaps or overlaps
  Validate both client-side (UX) and server-side
  (security)

**Validator — task is DONE only when ALL pass:**
[ ] Change institution name, click Save
[ ] DB check:
    SELECT name FROM institutions
    WHERE id = '[id]';
    Name must match what was saved
[ ] Set overlapping grade boundaries
    — overlap warning appears in UI
    — Save is blocked or shows error
[ ] Valid grade boundaries save successfully:
    SELECT * FROM grade_boundaries
    WHERE institution_id = '[id]';
[ ] Data retention toggle saves to DB
[ ] npm run tsc — exit 0
[ ] Zero console errors

**After completing this task:**
git add TASKS.md
git commit -m "chore: task board — admin settings done,
move Task 12 to IN PROGRESS"
git push

---
### TASK 12: Admin Activity Log Page

**Why this matters:**
Admin has no audit trail UI. Activity logs are
written to DB on every action but are invisible
to admins. For compliance, debugging, and security
review this page is essential.

**Skills to invoke:**
- /superpowers — plan before writing
- /shadcn — table, input, select, date picker
- /frontend-design — log table design

**Files to read before touching anything:**
- src/app/(admin)/admin/activity-log/page.tsx
  — current empty shell
- src/app/actions/activity-log.ts
  — fetch actions if exist

**What currently exists:**
Activity log page is an empty shell.

**Changes to make:**
1. Filter bar:
   User Search input
   Action Type dropdown (all action_type values)
   Timestamp Range: two date inputs (from/to)
   Export CSV button (generates CSV download)

2. Table:
   Columns: Timestamp (UTC), Actor (avatar + email),
   Action badge (colour coded by type),
   Target Entity, Details expand chevron

   Action badge colours:
   PUBLISH_RESULT: green
   FORCE_CLOSE: red
   CREATE_ASSESSMENT: blue
   LOGIN_SUCCESS: grey
   SYSTEM_LOCK: orange

3. Expanded row:
   Metadata panel: IP Address, User Agent, Trace ID
   JSON Payload Diff panel: before/after values

4. System Status bar (bottom):
   Database Performance: INDEX_HEALTH: 99%
   Log Retention: RETENTION: 365D
   Security Audit: ALERTS: ACTIVE
   (Static values ok for now)

5. Pagination: 50 rows per page
   Show total: "Showing 1-50 of 12,402 events"

**Hard constraints:**
- Activity log is read-only — no mutations allowed
- Timestamp must display in UTC with timezone label
- Filter queries must use timestamp indexes
  EXPLAIN ANALYZE to verify

**Performance requirement:**
With 12,000+ log entries: paginated query must
return in under 200ms using BRIN index on
timestamps. Do not load all rows at once.

**Validator — task is DONE only when ALL pass:**
[ ] /admin/activity-log loads with real log entries
[ ] Filter by action type works
[ ] Filter by date range works
[ ] Expand row shows metadata panel
[ ] DB check — filter matches:
    SELECT COUNT(*) FROM activity_logs
    WHERE action_type = 'CREATE_ASSESSMENT'
    AND institution_id = '[id]';
    Count must match filtered table row count
[ ] Export CSV downloads a file
[ ] Pagination works — page 2 loads different rows
[ ] npm run tsc — exit 0
[ ] Zero console errors

**After completing this task:**
git add TASKS.md
git commit -m "chore: task board — activity log done,
move Task 13 to IN PROGRESS"
git push

---
### TASK 13: Offline Sync Verification

**Why this matters:**
Students in low-connectivity areas will lose
connection mid-exam. If answers are lost when
connection drops, the platform is not deployable
in real institutions. Offline sync must work
reliably before any real student takes an exam.

**Skills to invoke:**
- /superpowers — plan before writing

**Files to read before touching anything:**
- src/lib/offline/sync-engine.ts
  — current offline sync implementation
- src/lib/offline/indexed-db-store.ts
  — Dexie IndexedDB store
- src/app/api/submissions/offline-sync/route.ts
  — server endpoint for sync
- src/components/exam/sync-indicator.tsx
  — UI indicator for sync status

**What currently exists:**
Sync engine exists. HMAC validation exists server-side.
app.hmac_secret is set in production DB.
sync-indicator component exists.

**Changes to make:**
1. Verify sync engine works end to end:
   No code changes expected — this is verification.
   If bugs found: fix them.

2. Test plan:
   - Answer 3 questions while online
   - DevTools → Network → Offline
   - Answer 2 more questions
   - Verify sync-indicator shows offline state
   - DevTools → Network → Online
   - Verify sync-indicator shows syncing then synced
   - Verify all 5 answers in student_answers table

3. HMAC rejection test:
   Manually craft a payload with wrong HMAC
   POST to /api/submissions/offline-sync
   Verify 401 response
   Verify HMAC_REJECTION logged in activity_logs

**Hard constraints:**
- Do NOT use setTimeout in src/lib/anzan/
- HMAC secret read from app.hmac_secret only
  Never from NEXT_PUBLIC_ env vars

**Performance requirement:**
Sync of 50 queued answers must complete within
5 seconds of reconnection.
At 500 students reconnecting simultaneously:
offline-sync endpoint must handle burst traffic.

**Validator — task is DONE only when ALL pass:**
[ ] Answer 3 questions online — 3 rows in DB
[ ] Go offline — sync indicator shows offline
[ ] Answer 2 questions offline — 0 new rows in DB
[ ] Come back online — sync indicator shows syncing
[ ] After sync: 5 total rows in student_answers:
    SELECT COUNT(*) FROM student_answers
    WHERE submission_id IN (
      SELECT id FROM submissions
      WHERE student_id = '[STUDENT-001 id]'
    );
    Expected: 5
[ ] HMAC rejection test:
    POST tampered payload to offline-sync
    Response must be 401
    SELECT * FROM activity_logs
    WHERE action_type = 'HMAC_REJECTION'
    ORDER BY created_at DESC LIMIT 1;
    Must exist
[ ] Zero console errors during sync

**After completing this task:**
git add TASKS.md
git commit -m "chore: task board — offline sync done,
move Task 14 to IN PROGRESS"
git push

---
### TASK 14: Lobby Polling Fallback

**Why this matters:**
The lobby currently relies only on a WebSocket
broadcast to know the exam is live. If a student
misses this broadcast (page load timing, network
blip) they stay in the lobby forever even when
the exam is already live. This is a reliability
bug that will affect real students.

**Skills to invoke:**
- /superpowers — plan before writing

**Files to read before touching anything:**
- src/app/(student)/student/exams/[id]/lobby/
  lobby-client.tsx
  — find the WebSocket subscription code
  — find where exam status is checked

**What currently exists:**
Lobby client subscribes to WebSocket broadcast.
No polling fallback exists (BUG 3).

**Changes to make:**
1. Add 30-second polling interval in lobby-client.tsx:
   useEffect with setInterval 30000ms
   On each tick: fetch exam_papers.status directly
   from Supabase client
   If status === 'LIVE': keep showing lobby (already there)
   If status === 'CLOSED': redirect to /student/exams
   If status === 'PUBLISHED': show "Exam starting soon"

2. Cleanup: interval must clear on unmount
   return () => clearInterval(intervalId)

3. Do NOT remove the WebSocket subscription —
   keep both. Polling is a fallback only.

**Hard constraints:**
- setInterval is allowed in lobby-client.tsx
- No setTimeout in src/lib/anzan/ (different file)
- Polling must not cause duplicate navigations
  if WebSocket fires at same time as poll

**Validator — task is DONE only when ALL pass:**
[ ] Student in lobby — disable WebSocket in DevTools
[ ] Wait 31 seconds — page still shows correct state
[ ] Enable WebSocket — no duplicate navigation
[ ] Force close exam — within 31 seconds lobby
    redirects to /student/exams even without WebSocket
[ ] Component unmounts cleanly — interval cleared:
    Navigate away from lobby, check DevTools
    Performance — no interval still firing
[ ] npm run tsc — exit 0

**After completing this task:**
git add TASKS.md
git commit -m "chore: task board — lobby polling done,
move Task 15 to IN PROGRESS"
git push

---
### TASK 15: Performance — 500 Concurrent Students

**Why this matters:**
The platform has never been tested under real load.
A single institution could have 500+ students taking
an exam simultaneously. Without load testing we do
not know if Vercel Edge functions, Supabase
connection pooling, or realtime subscriptions can
handle the load.

**Skills to invoke:**
- /superpowers — plan before writing

**Files to read before touching anything:**
- k6/lt-01-thundering-herd.js
- k6/lt-02-heartbeat-storm.js
- k6/lt-03-offline-sync-storm.js

**What currently exists:**
k6 scripts exist but have never been run against
production. Results unknown.

**Changes to make:**
1. Install k6 if not installed:
   winget install k6 or download from k6.io

2. Run each test in order:
   k6 run k6/lt-01-thundering-herd.js
   k6 run k6/lt-02-heartbeat-storm.js
   k6 run k6/lt-03-offline-sync-storm.js

3. For each test record:
   p95 response time (target: < 2000ms)
   Error rate (target: < 1%)
   Requests per second peak
   Any 500 errors

4. If tests fail:
   Check Supabase connection pool settings
   Check for N+1 queries in exam page
   Add database indexes if missing
   Check Vercel function timeout settings

**Performance requirement:**
All three k6 tests must pass with:
p95 < 2000ms
Error rate < 1%
Zero 500 errors
Zero database connection pool exhaustion errors

**Validator — task is DONE only when ALL pass:**
[ ] k6 lt-01 completes — p95 < 2000ms, errors < 1%
[ ] k6 lt-02 completes — same thresholds
[ ] k6 lt-03 completes — same thresholds
[ ] Supabase logs show no connection pool exhaustion
[ ] Vercel logs show no function timeouts
[ ] Report saved: k6-results/[date]-report.txt

**After completing this task:**
git add TASKS.md
git commit -m "chore: task board — load tests done,
move BEFORE DEPLOYMENT checklist to IN PROGRESS"
git push

---

## DONE

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

