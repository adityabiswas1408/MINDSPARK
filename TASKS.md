# MINDSPARK — Master Task Board

## HOW TO USE THIS FILE

1. The top item in UP NEXT is always the next task.
2. Before starting: move it to IN PROGRESS, commit.
3. Read every file listed under "Files to read" before
   writing any code.
4. Do not write code until the plan is approved.
5. After completing: run every item in the Validator.
6. Only move to DONE when every Validator item passes.
7. Update this file after every task:
   git add TASKS.md
   git commit -m "chore: task board update — [task name]"
   git push

---

## IN PROGRESS
None.

---

## UP NEXT

---
### TASK 1: Exam Submit Flow — Completion Card for EXAM Type
**Why this matters:**
When a student clicks "Submit Exam" on an EXAM-type paper, the app calls `submitExam`,
saves answers, and immediately routes to `/student/dashboard` — the student never sees a
completion card, their score, or how long they took. The `CompletionCard` component exists
and is fully built but is only rendered by `AnzanFlashView` (TEST type). EXAM type bypasses
it entirely. Without this, students have no confirmation their exam was received.

**Files to read before touching anything:**
- `src/components/exam/exam-page-client.tsx` — where `handleSubmit` calls `submitExam` then `router.push('/student/dashboard')` instead of showing completion card
- `src/components/exam/exam-vertical-view.tsx` — owns `onSubmit` prop, calls `handleSubmit`, hosts `ConfirmSubmit`; look at how phase transitions work here
- `src/components/exam/completion-card.tsx` — accepts `visible`, `assessmentType`, `onViewResults`, `onBackToDashboard` props; no score/time props yet
- `src/components/exam/confirm-submit.tsx` — already wired correctly, no changes needed here
- `src/app/actions/assessment-sessions.ts` — `submitExam` returns `{ submitted: true, completed_at }` and already writes `student_answers`, creates `submissions` row, closes session
- `src/stores/exam-session-store.ts` — understand `SUBMITTED` phase and how `setPhase` works

**What currently exists:**
`exam-page-client.tsx` `handleSubmit` calls `submitExam` then immediately calls `router.push('/student/dashboard')`. There is a TODO comment on line 84 acknowledging this. For TEST type, `AnzanFlashView` transitions to `SUBMITTED` phase and renders `CompletionCard`. For EXAM type there is no equivalent — the card is never shown. `CompletionCard` does not currently display score, correct count, or time taken; it only shows a generic "Exam Submitted" message.

**Changes to make:**
1. `src/components/exam/completion-card.tsx` — add optional props: `scorePercent?: number`, `correctCount?: number`, `totalCount?: number`, `timeTakenSeconds?: number`. Render these below the checkmark icon: score percentage in large DM Mono font, a row showing "X / Y correct", and time taken formatted as mm:ss.
2. `src/components/exam/exam-page-client.tsx` — add `const [submitted, setSubmitted] = useState(false)` and `const [completedAt, setCompletedAt] = useState<string | null>(null)`. In `handleSubmit`, after awaiting `submitExam`, set `submitted = true` and store `completedAt` from the result instead of calling `router.push`. Calculate score by counting answers that match correct options. Render `<CompletionCard visible={submitted} assessmentType="EXAM" ... />` at the end of the EXAM branch return.
3. `src/components/exam/exam-page-client.tsx` — `handleTimeExpired` must do the same: call `submitExam`, set `submitted = true`, show completion card rather than redirecting.
4. `src/components/exam/exam-page-client.tsx` — `onViewResults` prop of `CompletionCard` must navigate to `/student/results` (not `/student/dashboard`) once that page exists. Use `router.push('/student/results')` — update both TODO comments.
5. Auto-submit must be idempotent: if `submitExam` returns `session.closed_at` already set (double-fire), still show completion card with that `completed_at` timestamp.

**Hard constraints:**
- `npm run tsc` must report 0 errors before commit
- `src/lib/supabase/admin.ts` is already used in the server action — do not call it from any client component
- No new Supabase migrations
- Do not add error handling for scenarios that cannot happen (e.g. `submitExam` returning null)
- All actions return `ActionResult<T>` — check `result.ok` before reading `result.data`

**Performance requirement:**
Submit must complete within 3 seconds for a 500-question exam at 500 concurrent students. The `submitExam` action uses a single upsert for all answers — do not fan out to individual inserts. Verify that the upsert batch does not hit Supabase row limits (max 1000 rows per upsert call; split if > 500 questions).

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Click "Submit Exam" on an EXAM paper → ConfirmSubmit dialog appears → click "Submit Exam" in dialog → completion card slides up with confetti, shows score percentage and correct count
- [ ] Frontend: Wait for timer to expire → auto-submit fires → completion card appears (not a redirect to dashboard)
- [ ] Frontend: Completion card "View Results →" button navigates to `/student/results` (or dashboard until Task 4 is done)
- [ ] Frontend: "Back to Dashboard" button navigates to `/student/dashboard`
- [ ] Supabase DB check: `SELECT id, completed_at FROM submissions WHERE session_id = '<session_id>';` — row exists, `completed_at` is not null
- [ ] Supabase DB check: `SELECT COUNT(*) FROM student_answers WHERE submission_id = '<submission_id>';` — count equals number of questions answered
- [ ] Supabase DB check: `SELECT closed_at FROM assessment_sessions WHERE id = '<session_id>';` — `closed_at` is not null
- [ ] Edge case: Click "Submit Exam" twice rapidly — second call is a no-op (`isSubmitting` guard); only one `submissions` row created (upsert on conflict `session_id`)
- [ ] Edge case: Submit with 0 answers answered — completion card still appears, score shows 0%
- [ ] Performance: In browser DevTools, confirm network request for `submitExam` completes < 3000ms on a 10-question exam
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Exam Submit Flow to DONE"
git push
```

---
### TASK 2: Skeleton Loaders on All Data-Fetching Pages
**Why this matters:**
Every page in the app currently shows a blank white screen while server data loads. On a slow
connection (3G, school Wi-Fi) students and admins see nothing for 1–4 seconds before content
appears. This is particularly bad during exam day when many students hit the dashboard
simultaneously. Skeleton loaders communicate that something is happening and prevent users
from assuming the app is broken.

**Files to read before touching anything:**
- `src/app/(admin)/admin/assessments/page.tsx` — async server component; understand how data is fetched
- `src/app/(admin)/admin/dashboard/page.tsx` — check current state; likely a placeholder
- `src/app/(admin)/admin/students/page.tsx` — check current state
- `src/app/(admin)/admin/results/page.tsx` — check current state
- `src/app/(student)/student/dashboard/page.tsx` — two-column layout with live exam card and upcoming list
- `src/app/(student)/student/exams/page.tsx` — check current state
- `src/app/(student)/student/results/page.tsx` — check current state
- `src/components/shared/` — check if a skeleton component already exists

**What currently exists:**
All pages are Server Components that `await` Supabase queries before rendering. Next.js streams
these by default but there are no `loading.tsx` files in any route segment, so the browser shows
nothing until the server responds. No skeleton components exist in the shared component library.

**Changes to make:**
1. Create `src/components/shared/skeleton.tsx` — a base `Skeleton` component: `<div className="animate-pulse bg-slate-200 rounded" style={style} />`. Accept `className` and `style` props.
2. Create `src/app/(admin)/admin/assessments/loading.tsx` — skeleton that mirrors assessment cards layout: header row with title + button placeholder, then 3 card-shaped skeleton blocks (height 80px each).
3. Create `src/app/(admin)/admin/dashboard/loading.tsx` — 4 KPI card skeletons in a row, then two chart placeholder boxes.
4. Create `src/app/(admin)/admin/students/loading.tsx` — filter bar skeleton, then a table skeleton with 5 row placeholders.
5. Create `src/app/(admin)/admin/results/loading.tsx` — assessment selector skeleton, chart skeleton, table skeleton.
6. Create `src/app/(admin)/admin/monitor/loading.tsx` — summary count row skeleton, table skeleton.
7. Create `src/app/(admin)/admin/announcements/loading.tsx` — editor skeleton (tall box) + history panel skeleton.
8. Create `src/app/(admin)/admin/settings/loading.tsx` — two section card skeletons.
9. Create `src/app/(admin)/admin/activity/loading.tsx` — filter bar skeleton, table skeleton.
10. Create `src/app/(admin)/admin/levels/loading.tsx` — level card skeletons.
11. Create `src/app/(student)/student/dashboard/loading.tsx` — hero card skeleton (200px tall), upcoming list skeleton (3 row placeholders), right column skeletons.
12. Create `src/app/(student)/student/exams/loading.tsx` — 3 exam card skeletons.
13. Create `src/app/(student)/student/results/loading.tsx` — hero card skeleton, table skeleton.
14. All skeleton shapes must match the actual content dimensions within 10% — measure by eye against the real rendered page.

**Hard constraints:**
- Use `animate-pulse` from Tailwind — do not use `setTimeout` or JS animations
- Skeleton colour must be `bg-slate-200` (compiles correctly in Tailwind v4 with the `@theme inline` block in `globals.css`)
- No `bg-gray-*` — use the slate palette
- Do not introduce new dependencies for skeleton loaders

**Performance requirement:**
Skeleton must be visible within 200ms of navigation on a throttled Slow 3G connection. Since
`loading.tsx` is rendered immediately by Next.js App Router before the async Server Component
resolves, this is guaranteed by the framework — verify it holds.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Open DevTools → Network → throttle to Slow 3G. Navigate to each admin page. Skeleton appears immediately, then content replaces it. No blank white flash on any page.
- [ ] Frontend: Navigate to `/student/dashboard` on Slow 3G — live exam hero skeleton is visible before the real card loads
- [ ] Frontend: Skeleton shapes visually match the layout of real content (no wildly different proportions)
- [ ] Frontend: At full speed (no throttling), skeletons still briefly appear and fade — no hydration errors in console
- [ ] Supabase DB check: No DB query needed — this is a purely frontend task. Verify no extra DB calls are introduced.
- [ ] Performance: In Lighthouse (Mobile preset), FCP must not regress from baseline. Run before and after.
- [ ] TypeScript: `npm run tsc` reports 0 errors
- [ ] Edge case: If data fetch fails (Supabase returns error), page renders the real component with empty state — skeleton does not stay on screen forever

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Skeleton Loaders to DONE"
git push
```

---
### TASK 3: Student Exams List Page
**Why this matters:**
The student dashboard shows a single LIVE exam card and up to 5 upcoming exams. There is no
dedicated page where a student can see all their exams — past, present, and future. The "View
All" link on the dashboard points to `/student/exams` but that route either does not exist or is
an empty shell. Students have no way to browse the full exam catalogue or check past attempts.

**Files to read before touching anything:**
- `src/app/(student)/student/exams/page.tsx` — check current state; likely a shell or missing
- `src/app/(student)/student/dashboard/page.tsx` — see the query pattern used for LIVE/PUBLISHED exams; replicate and extend it
- `src/app/(student)/student/exams/[id]/page.tsx` — understand the redirect logic so the list links correctly to lobby or exam
- `src/app/(student)/student/exams/[id]/lobby/page.tsx` — understand lobby entry point
- `src/lib/auth/rbac.ts` — understand `requireRole('student')` return shape to get `institutionId` and `userId`
- `src/lib/supabase/server.ts` — server client for data fetching

**What currently exists:**
The `/student/exams` route likely does not exist as a full page. The dashboard already queries
`exam_papers` for LIVE and PUBLISHED status filtered by institution and level. There is no query
for CLOSED papers from the student's perspective and no dedicated list UI. The "View All" link
on the dashboard navigates here but lands on a blank or missing page.

**Changes to make:**
1. `src/app/(student)/student/exams/page.tsx` — implement as a Server Component. Call `requireRole('student')` to get `userId` and `institutionId`. Fetch the student row to get `level_id`. Then fetch ALL `exam_papers` for this institution and level across all statuses (LIVE, PUBLISHED, CLOSED, DRAFT — show DRAFT only if the student has an existing session). Order by `created_at` descending.
2. Group results into three sections: **Live Now** (status = LIVE), **Upcoming** (status = PUBLISHED), **Past** (status = CLOSED).
3. LIVE exam card: red pulse badge "LIVE", exam title, type badge (EXAM/TEST), duration. "Enter Now" button links to `/student/exams/[id]/lobby`. Card border: `1px solid #EF4444`.
4. PUBLISHED exam card: date badge (month + day), exam title, type, duration. No action button — show "Scheduled" badge.
5. CLOSED exam card: greyed out. Title, type, date. If student has a submission for this paper, show "Completed" badge (green). If no submission, show "Missed" badge (slate).
6. Empty state for each section: if no LIVE exams, show "No live exams right now" inline note (not a full empty state component). If no upcoming, show "No upcoming assessments". If no past, show "No completed exams yet".
7. Page header: "All Assessments" h1, subtitle showing student name and level.

**Hard constraints:**
- Use `src/lib/supabase/server.ts` — not the admin client
- Role check at the top: `const authResult = await requireRole('student'); if ('error' in authResult) redirect('/login');`
- Do not use `src/lib/supabase/admin.ts` in this student route
- LIVE badge colour: `#EF4444` on `#FFFFFF` per design system (Live badge spec)
- No banned colours: `#FF6B6B` `#121212` `#1A1A1A` `#E0E0E0`

**Performance requirement:**
Page must render within 2 seconds at 500 concurrent students. Use a single Supabase query with
`in('status', ['LIVE', 'PUBLISHED', 'CLOSED'])` rather than three parallel queries. Join
submissions in the same query using `.select('*, submissions(id)')` filtered to `student_id`.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Navigate to `/student/exams` — page renders with three sections. LIVE exam (if any) shows pulse badge. PUBLISHED exams appear in Upcoming.
- [ ] Frontend: Click "Enter Now" on a LIVE exam → redirects to `/student/exams/[id]/lobby`
- [ ] Frontend: CLOSED exam with a submission shows green "Completed" badge; CLOSED exam without submission shows grey "Missed" badge
- [ ] Frontend: All three sections show their empty-state message when no exams exist in that category
- [ ] Supabase DB check: `SELECT COUNT(*) FROM exam_papers WHERE institution_id = '<id>' AND status = 'LIVE';` — count matches number of LIVE cards shown
- [ ] Supabase DB check: `SELECT id FROM submissions WHERE student_id = '<student_id>' AND paper_id = '<paper_id>';` — "Completed" badge appears iff this row exists
- [ ] Performance: Page renders in < 2000ms on production Vercel deployment (check Vercel function logs)
- [ ] Edge case: Student has no `level_id` set — page still loads, shows institution-wide exams without level filter
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Student Exams List to DONE"
git push
```

---
### TASK 4: Student Results Page
**Why this matters:**
After submitting an exam, students are routed to the dashboard with no visibility into their
score, grade, or historical performance. The `CompletionCard` "View Results →" button currently
navigates to `/student/dashboard` as a placeholder. There is no results page. Students and
parents cannot see assessment outcomes. This is a core product requirement.

**Files to read before touching anything:**
- `src/app/(student)/student/results/page.tsx` — check current state (likely empty shell)
- `src/app/actions/assessment-sessions.ts` — understand the `submissions` table columns available
- `src/components/exam/completion-card.tsx` — understand the "View Results →" navigation target
- `src/components/exam/exam-page-client.tsx` — understand the TODO comment on results navigation
- `src/lib/auth/rbac.ts` — understand `requireRole('student')` return shape

**What currently exists:**
`/student/results` is either a missing route or empty shell. The `submissions` table has
`completed_at`, `paper_id`, `student_id`, `session_id`. The `exam_papers` table has `title`,
`type`, `duration_minutes`. There is no `result_published_at` on submissions yet — check the
live schema in Supabase SQL editor before building. The `student_answers` table has
`selected_option` and `question_id`; `questions` has `correct_option` for grading.

**Changes to make:**
1. Run `SELECT column_name FROM information_schema.columns WHERE table_name = 'submissions';` in Supabase SQL editor to confirm actual columns before writing any query.
2. `src/app/(student)/student/results/page.tsx` — implement as Server Component. Fetch all submissions for this student joined with `exam_papers(title, type, duration_minutes)`. Only show submissions where a result has been published (check for `result_published_at` column; if it does not exist in live DB, show all submissions with `completed_at`).
3. Hero card: most recent result — exam title, date, score percentage in large DM Mono, grade badge (A+/A/B/C/F based on score).
4. Academic ledger table: columns = Exam Name, Date, Type badge, Duration, Score %, Grade badge. Sort by `completed_at` descending.
5. GPA trend: recharts `LineChart` — X axis = submission dates, Y axis = score percentage 0–100. Show last 12 results. If fewer than 2 results, show "Not enough data" placeholder instead of the chart.
6. Pending evaluation section: submissions where result not yet published — show exam title and "Awaiting Results" badge.
7. Export Report button: renders as a disabled button with "Coming Soon" tooltip — placeholder, no functionality.
8. Once this page exists, update `exam-page-client.tsx` to remove both TODO comments and replace `router.push('/student/dashboard')` with `router.push('/student/results')` in both `handleSubmit` and `onNavigateResults`.

**Hard constraints:**
- Use `src/lib/supabase/server.ts` — not admin client
- recharts is already installed — do not add new chart libraries
- DM Mono for all numbers (score %, GPA values): `fontFamily: 'var(--font-mono), monospace'`
- Grade boundaries: A+ ≥ 90, A ≥ 80, B ≥ 70, C ≥ 60, F < 60 (use these until Settings page persists custom boundaries)
- Banned colours must not appear anywhere on this page

**Performance requirement:**
Page must load in < 2 seconds for a student with 50 past exams. Do not fetch `student_answers`
on this page — compute score server-side via a Supabase RPC or compute it from a pre-existing
`score` column on `submissions` if it exists (check live schema first).

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Navigate to `/student/results` after submitting an exam — hero card shows latest result, table shows all results
- [ ] Frontend: GPA trend chart renders with at least 2 data points; Y axis is 0–100
- [ ] Frontend: Pending evaluation section shows exams with no published result separately from graded ones
- [ ] Frontend: "View Results →" button on CompletionCard navigates to `/student/results` (update exam-page-client.tsx)
- [ ] Supabase DB check: `SELECT id, completed_at FROM submissions WHERE student_id = '<id>' ORDER BY completed_at DESC;` — matches rows shown in the table
- [ ] Supabase DB check: Confirm `result_published_at` column exists or does not: `SELECT column_name FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'result_published_at';`
- [ ] Performance: Page loads in < 2000ms on Vercel production (check function duration in Vercel dashboard)
- [ ] Edge case: Student with zero submissions — page shows "No results yet" empty state, hero card is hidden
- [ ] Edge case: Student with 1 submission — GPA trend shows "Not enough data" instead of a chart with one point
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Student Results Page to DONE"
git push
```

---
### TASK 5: Admin Dashboard Charts
**Why this matters:**
The admin dashboard is a placeholder shell. Admins currently have no visibility into platform
health — how many students are enrolled, how many exams are live, what the average score is,
or how many students are in an active session right now. Without this, admins must query
Supabase directly to understand platform state during an exam session.

**Files to read before touching anything:**
- `src/app/(admin)/admin/dashboard/page.tsx` — current state; likely minimal or placeholder
- `src/app/actions/` — check if a `dashboard` or `analytics` action file exists
- `src/lib/supabase/server.ts` — server client
- `src/lib/auth/rbac.ts` — admin role check pattern

**What currently exists:**
The admin dashboard at `/admin/dashboard` likely renders a heading and nothing else. There are
no pre-built dashboard query actions. The `activity_logs` table exists and is written to by
every server action. No materialized view named `dashboard_aggregates` has been confirmed to
exist in the live DB — verify before using it.

**Changes to make:**
1. Before writing any code: run `SELECT table_name FROM information_schema.tables WHERE table_name = 'dashboard_aggregates';` in Supabase SQL editor. If it does not exist, use direct queries.
2. `src/app/(admin)/admin/dashboard/page.tsx` — four parallel Supabase queries wrapped in `Promise.all`: (a) `COUNT(*)` from `students` where `institution_id` matches, (b) `COUNT(*)` from `exam_papers` where `status = 'LIVE'`, (c) `AVG(score)` from `submissions` — check if `score` column exists first, (d) `COUNT(*)` from `assessment_sessions` where `closed_at IS NULL`.
3. Four KPI cards: Total Students, Active Exams, Avg Score, Live Now. Each card: large number in DM Mono, label below, small recharts `Sparkline` (AreaChart with no axes) showing 7-day trend. For Phase 1, the sparkline data can be static placeholder data — note this in a comment.
4. Score Trend chart: recharts `LineChart`. Query: group `submissions` by month for the last 6 months, compute avg score per month. X axis = month labels, Y axis = 0–100. Render at 100% width, height 280px.
5. Level Distribution chart: recharts `BarChart`. Query: `COUNT(students.id)` grouped by `level_id` joined with `levels(name)`. Render bars with label on X axis.
6. Recent Activity table: `SELECT * FROM activity_logs WHERE institution_id = ? ORDER BY created_at DESC LIMIT 10`. Columns: timestamp (formatted), actor `user_id` (show last 8 chars), `action_type` badge (colour-coded), `entity_type`. No expand functionality needed here (that is in Task 12).
7. All chart containers must have a fixed height to prevent layout shift. Use `style={{ height: '280px' }}` wrappers.

**Hard constraints:**
- recharts already installed — use it, do not add `chart.js` or `victory`
- All DB queries must be scoped to `institution_id` — never query platform-wide without the filter
- DM Mono for all number displays
- Do not create a materialized view via SQL — no new migrations

**Performance requirement:**
Dashboard must load in < 3 seconds with full data at 500 students and 50 exams. Use `Promise.all`
to run all four KPI queries in parallel. The score trend query must use a single SQL aggregate,
not N queries for N months.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Admin dashboard shows 4 KPI cards with real numbers from DB, not hardcoded placeholders
- [ ] Frontend: Score trend LineChart renders with 6 months of data (or fewer if DB has less history)
- [ ] Frontend: Level Distribution BarChart renders with one bar per level
- [ ] Frontend: Recent Activity table shows last 10 log entries with correct timestamps
- [ ] Supabase DB check: `SELECT COUNT(*) FROM students WHERE institution_id = '<id>';` — matches Total Students card
- [ ] Supabase DB check: `SELECT COUNT(*) FROM exam_papers WHERE status = 'LIVE' AND institution_id = '<id>';` — matches Active Exams card
- [ ] Supabase DB check: `SELECT COUNT(*) FROM assessment_sessions WHERE closed_at IS NULL;` — matches Live Now card
- [ ] Performance: All 4 KPI queries complete in < 1000ms total (use Supabase query log to verify)
- [ ] Edge case: Institution with zero students — KPI cards show 0, charts show empty state text, no JS errors
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Admin Dashboard Charts to DONE"
git push
```

---
### TASK 6: Admin Students Page
**Why this matters:**
Admins have no way to view, search, or manage the student roster. Student accounts are created
in Supabase Auth but there is no UI to browse them, filter by level, check status, or view a
student's academic profile. This is required before any real institution can use MindSpark —
admins need to know who is enrolled and be able to manage their accounts.

**Files to read before touching anything:**
- `src/app/(admin)/admin/students/page.tsx` — current state; likely empty shell
- `src/app/actions/students.ts` — check what student actions exist (create, update, suspend etc.)
- `src/lib/supabase/server.ts` — server client
- `src/lib/auth/rbac.ts` — admin role check
- `src/lib/supabase/admin.ts` — needed for Supabase Auth operations (promote, suspend, reset password)

**What currently exists:**
The `students` table has `id, roll_number, full_name, level_id, institution_id, consent_verified`
at minimum (check live schema for extra columns). The `levels` table has `id, name`. There is
no student management UI. The admin client is needed to call `supabase.auth.admin.*` methods
for password reset and suspend operations.

**Changes to make:**
1. `src/app/(admin)/admin/students/page.tsx` — Server Component. Fetch students joined with levels. Accept `searchParams` for `level` and `status` filter query params. Pass data to a `StudentsClient` component.
2. Create `src/components/students/students-client.tsx` — `'use client'`. Filter bar with Level `<select>` and Status `<select>` (Active/Inactive). Table using `@tanstack/react-table` with columns: checkbox, initials avatar circle, name, roll number, level badge, status badge, "View Profile" link.
3. Checkbox selection — when rows are selected, show a bulk action bar above the table with Promote, Suspend, Export buttons. Promote and Suspend call server actions. Export is placeholder.
4. Pagination: 20 rows per page. Implement client-side pagination against the full fetched dataset (do not re-query on page change for MVP).
5. Student profile page: `src/app/(admin)/admin/students/[id]/page.tsx` — Server Component. Fetch student by id, their submissions, and level. Left panel: initials avatar (64×64, green bg), full name, roll number, level, join date, status badge. Promote button, Suspend button, Reset Password button — each calls a server action. Right panel: Academic tab — recharts LineChart of scores over time, exam history table (exam name, date, score, grade).
6. "Add Student" button in page header opens a `Dialog` with a simple form: full name, roll number, level select. Calls `createStudent` action.
7. Import CSV button opens a `Dialog` with a file upload input — placeholder modal, no actual import logic needed.

**Hard constraints:**
- `@tanstack/react-table` already installed — use it
- `src/lib/supabase/admin.ts` is allowed in admin server actions but NOT in client components or hooks
- Every server action must start with `const authResult = await requireRole('admin'); if ('error' in authResult) return { error: authResult.error };`
- Avatar colour: `#1A3829` background, `#FFFFFF` initials — DM Sans font

**Performance requirement:**
Table must render 500 students without lag. Use virtual scrolling via `@tanstack/react-virtual`
if row count exceeds 200, otherwise simple pagination suffices.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: `/admin/students` shows all students in a table with correct level and status badges
- [ ] Frontend: Filter by Level dropdown updates table immediately (client-side filter)
- [ ] Frontend: Select 3 rows → bulk action bar appears with Promote/Suspend/Export buttons
- [ ] Frontend: Click "View Profile" → student profile page loads with correct data
- [ ] Frontend: "Add Student" button opens dialog; submit form → new row appears in table
- [ ] Supabase DB check: `SELECT COUNT(*) FROM students WHERE institution_id = '<id>';` — matches row count in table
- [ ] Supabase DB check: After promoting a student: `SELECT level_id FROM students WHERE id = '<id>';` — new level_id is set
- [ ] Performance: Table renders 500 rows in < 500ms (measure with React DevTools Profiler)
- [ ] Edge case: Student with no submissions — profile page academic tab shows "No exam history" empty state
- [ ] Edge case: No students exist — page shows empty state with "Add Student" CTA
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Admin Students Page to DONE"
git push
```

---
### TASK 7: Admin Levels Page — Wire Create Level and Drag Reorder
**Why this matters:**
The Levels page already renders level cards but the "Create Level" button has no `onClick`
handler. Admins cannot create new levels through the UI. Additionally, levels cannot be
reordered — `sequence_order` exists in the DB but there is no drag-and-drop reorder UI.
Without this, institutions are stuck with whatever levels were seeded at setup time.

**Files to read before touching anything:**
- `src/app/(admin)/admin/levels/page.tsx` — current state; understand existing card rendering
- `src/app/actions/levels.ts` — confirm `createLevel` action exists and its input shape
- `src/lib/auth/rbac.ts` — admin role check pattern

**What currently exists:**
The levels page renders existing level cards but has no create functionality wired. The
`createLevel` action likely exists in `src/app/actions/levels.ts` — verify its signature before
building the dialog. The `@hello-pangea/dnd` package is installed for drag-and-drop.

**Changes to make:**
1. Verify `createLevel` action input shape by reading `src/app/actions/levels.ts`. Note the required fields.
2. Create `src/components/levels/create-level-dialog.tsx` — a `Dialog` with two inputs: name (text) and sequence_order (number). Submit calls `createLevel`. On success: close dialog, `router.refresh()`.
3. Wire the "Create Level" button in the levels page to open `CreateLevelDialog`.
4. Level cards must show: name, status badge (ACTIVE/DRAFT based on a status column — check if this exists in live schema), enrolled student count (query `COUNT(students) WHERE level_id = ?`), drag handle icon on the left.
5. Wrap the level cards list in `DragDropContext` and `Droppable` from `@hello-pangea/dnd`. Each card is a `Draggable`. On `onDragEnd`: call an `updateLevelOrder` server action that updates `sequence_order` for the moved item.
6. Stats row at bottom: Total Student Load (sum of all students across levels), Average Competencies (placeholder — 0 until competency tracking is built), Curriculum Density (placeholder).

**Hard constraints:**
- `@hello-pangea/dnd` is already installed — do not add `react-beautiful-dnd` or `dnd-kit`
- No new Supabase migrations — if `status` column does not exist on `levels`, omit the status badge
- `createLevel` action must follow the `ActionResult<T>` return type pattern

**Performance requirement:**
Drag reorder must feel instant. Optimistically update the card order in React state on
`onDragEnd` before the server action resolves. Revert if the server action returns an error.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Click "Create Level" → dialog opens → fill name → submit → new level card appears without page reload
- [ ] Frontend: Drag a level card to reorder → cards snap to new position immediately (optimistic update)
- [ ] Frontend: Level card shows enrolled student count as a real number
- [ ] Supabase DB check: After creating a level: `SELECT * FROM levels WHERE name = '<name>';` — row exists with correct `institution_id` and `sequence_order`
- [ ] Supabase DB check: After drag reorder: `SELECT name, sequence_order FROM levels ORDER BY sequence_order;` — order matches what is shown on screen
- [ ] Edge case: Create level with duplicate name — server action returns error; toast shown; dialog stays open
- [ ] Edge case: Single level — drag handle is visible but dragging has no effect (no reorder needed with one item)
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Admin Levels to DONE"
git push
```

---
### TASK 8: Admin Results Page
**Why this matters:**
After an exam closes, admins need to see the grade distribution, per-student scores, and publish
results to students. Currently there is no results management UI. Results remain invisible to
students (`CompletionCard` shows a generic message) until manually published. Without this page,
the assessment lifecycle is incomplete — exams are taken but results are never surfaced.

**Files to read before touching anything:**
- `src/app/(admin)/admin/results/page.tsx` — current state
- `src/app/actions/assessments.ts` — check `forceCloseExam` and any results-related actions
- `src/lib/supabase/server.ts` — server client
- Database schema section in CLAUDE.md — understand `submissions` and `student_answers` columns
- Check live schema: `SELECT column_name FROM information_schema.columns WHERE table_name = 'submissions';`

**What currently exists:**
The results page is a placeholder. The `submissions` table has `completed_at`, `paper_id`,
`student_id`. Check if `result_published_at` and `score` columns exist in the live DB before
building — they may have been added manually outside migrations (per CLAUDE.md gotcha about
live DB having extra columns not in migrations). The `student_answers` table has
`selected_option`; `questions` has `correct_option` for grading.

**Changes to make:**
1. `src/app/(admin)/admin/results/page.tsx` — fetch all CLOSED `exam_papers` for the institution. Pass to a `ResultsClient` component.
2. Assessment selector: a dropdown or tab list of CLOSED exams. When an exam is selected, fetch its submissions joined with student info.
3. Grade distribution: recharts `AreaChart` (bell curve approximation). Compute score distribution — bin students into 10-point score ranges (0-9, 10-19, ..., 90-100), plot as an area chart.
4. Stats bar below chart: Mean score, Median score, DPM Average (digits per minute — placeholder 0 until computed).
5. Results table: columns = checkbox, student avatar (initials), name, score, grade badge (A+/A/B/C/F), status badge (Published/Unpublished). Per-row "Publish" button calls `publishResult` server action.
6. Create `src/app/actions/results.ts` — `publishResult({ submission_id })` action: sets `result_published_at = now()` on the `submissions` row (or appends this column via a SQL update if it does not exist yet).
7. Bulk action bar: Publish Selected (calls `publishResult` for each selected `submission_id`), Export (placeholder).
8. Re-evaluate button: calls `calculateResults({ paper_id })` — computes score by comparing `student_answers.selected_option` to `questions.correct_option` and stores result. This is a server action, not an RPC, unless an RPC already exists.

**Hard constraints:**
- No new Supabase migrations — use `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS result_published_at timestamptz;` only via Supabase SQL editor if needed, not a migration file
- Grade boundaries: A+ ≥ 90, A ≥ 80, B ≥ 70, C ≥ 60, F < 60
- recharts already installed
- `publishResult` action must log to `activity_logs`

**Performance requirement:**
Results table must handle 500 students with scores computed server-side. Do not compute scores
client-side on 500 rows. Compute them in a single SQL aggregate query or RPC.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Select a closed exam from dropdown → grade distribution chart renders, stats bar shows real mean/median
- [ ] Frontend: Results table shows all students with scores and grade badges
- [ ] Frontend: Click "Publish" on one row → status badge changes to "Published" without page reload
- [ ] Frontend: Select 3 rows → bulk publish → all 3 change to "Published"
- [ ] Supabase DB check: After publishing: `SELECT result_published_at FROM submissions WHERE id = '<id>';` — not null
- [ ] Supabase DB check: After re-evaluate: `SELECT score FROM submissions WHERE paper_id = '<id>' LIMIT 5;` — scores are populated (if score column exists)
- [ ] Student side: After admin publishes, student visits `/student/results` and sees the result listed (not in Pending section)
- [ ] Performance: Results table with 500 students loads in < 3 seconds
- [ ] Edge case: Exam with zero submissions — table shows empty state, chart shows "No data"
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Admin Results Page to DONE"
git push
```

---
### TASK 9: Admin Monitor Page — Real-Time Student Table
**Why this matters:**
During a live exam, admins cannot see which students are connected, how many questions they have
answered, or whether any student has disconnected. If a student loses connection mid-exam,
admins have no way to identify and assist them. The monitor page is the admin's real-time
control panel during live exam sessions.

**Files to read before touching anything:**
- `src/app/(admin)/admin/monitor/page.tsx` — current state
- `src/app/actions/assessments.ts` — understand `forceOpenExam` and `forceCloseExam` for context
- `src/lib/supabase/server.ts` — server client for initial fetch
- `src/lib/supabase/client.ts` — needed for Supabase Realtime subscription in the client component

**What currently exists:**
The monitor page is a placeholder shell. The `assessment_sessions` table has `student_id`,
`paper_id`, `started_at`, `closed_at`, `expires_at`, `status`. The `student_answers` table
can be counted per session to compute progress. Supabase Realtime is already used in the lobby
and exam pages for broadcast events.

**Changes to make:**
1. `src/app/(admin)/admin/monitor/page.tsx` — Server Component. Fetch all active sessions (`closed_at IS NULL`) for LIVE exams in this institution. Join with `students(full_name, roll_number)` and `exam_papers(title)`. Pass to `MonitorClient`.
2. Create `src/components/monitor/monitor-client.tsx` — `'use client'`. Subscribe to Supabase Realtime on the `assessment_sessions` table for INSERT/UPDATE events where `paper_id` matches a LIVE exam. Update the rows table in state on each event.
3. Summary counts row at top: In Progress count, Submitted count, Disconnected count (where `status = 'disconnected'`), Waiting count.
4. Filters: Status tab bar (All / In Progress / Submitted / Disconnected / Waiting). Text search input for student name.
5. Table columns: student initials avatar, name, roll number, current status badge, progress bar (`answered_count / total_questions`), last seen timestamp (relative, e.g. "2m ago"), Actions menu (Alert Student — placeholder).
6. Progress bar: fetch `COUNT(student_answers) WHERE submission_id = ?` for each session. This is expensive at 500 students — use a server-side pre-computed snapshot passed as initial props, then update via Realtime.
7. Session Update toast: when a Realtime event fires, show a shadcn `toast` notification with the student name and event type.

**Hard constraints:**
- Use `src/lib/supabase/client.ts` (not server) for Realtime subscriptions in the client component
- Realtime subscription must be cleaned up in `useEffect` return function to prevent memory leaks
- Do not use `src/lib/supabase/admin.ts` in any client component
- Status badge colours: In Progress = green (#1A3829 bg), Submitted = blue (#2563EB bg), Disconnected = red (#DC2626 bg), Waiting = slate (#475569 bg)

**Performance requirement:**
Monitor must update within 3 seconds of a student event (answer submitted, session created).
Supabase Realtime latency is typically < 500ms — the remaining budget is React re-render time.
Table must not re-render all 500 rows on every Realtime event — use `useMemo` and keyed updates.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Open monitor page during a live exam — table shows all active sessions with correct student names
- [ ] Frontend: Student answers a question → progress bar updates within 3 seconds (without page refresh)
- [ ] Frontend: Filter by "Submitted" tab → shows only students with `closed_at` not null
- [ ] Frontend: Search for a student name → table filters in real-time (client-side)
- [ ] Supabase DB check: `SELECT COUNT(*) FROM assessment_sessions WHERE closed_at IS NULL;` — matches "In Progress" count on monitor page
- [ ] Supabase DB check: `SELECT COUNT(*) FROM student_answers WHERE submission_id = '<id>';` — matches progress bar denominator for that student
- [ ] Performance: Monitor page initial load < 3 seconds. Realtime event reflected in UI < 3 seconds.
- [ ] Edge case: No live exams — monitor shows "No active sessions" empty state
- [ ] Edge case: Student closes browser tab — after 30 seconds, status changes to "Disconnected" (if implemented) or last-seen timestamp stops updating
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Admin Monitor Page to DONE"
git push
```

---
### TASK 10: Admin Announcements Page — TipTap Editor Wired
**Why this matters:**
Admins have no way to communicate with students through the platform. Announcements are a core
feature for notifying students of exam schedules, results releases, or policy changes. The
TipTap dependency is already installed but the editor is not wired. The student dashboard has
an Announcements section that currently shows nothing.

**Files to read before touching anything:**
- `src/app/(admin)/admin/announcements/page.tsx` — current state
- `src/app/actions/` — check if `announcements.ts` exists with a `createAnnouncement` action
- `src/app/(student)/student/dashboard/page.tsx` — check if announcements are fetched for students
- `package.json` — verify TipTap packages installed (`@tiptap/react`, `@tiptap/starter-kit`)

**What currently exists:**
The announcements page is a placeholder. TipTap is listed as a dependency. There may or may not
be an `announcements` table in the live DB — check with `SELECT table_name FROM information_schema.tables WHERE table_name = 'announcements';`. If it does not exist, the table must be created via the Supabase SQL editor (not a migration file).

**Changes to make:**
1. Check if `announcements` table exists. If not: run in Supabase SQL editor:
   ```sql
   CREATE TABLE IF NOT EXISTS announcements (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     institution_id uuid NOT NULL,
     title text NOT NULL,
     body text NOT NULL,
     target_level_id uuid REFERENCES levels(id),
     created_by uuid NOT NULL,
     created_at timestamptz DEFAULT now(),
     published_at timestamptz
   );
   ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
   ```
2. Create `src/app/actions/announcements.ts` if it does not exist — `createAnnouncement({ title, body, target_level_id? })` action. Validates non-empty title and body. Inserts into `announcements`. Logs to `activity_logs`.
3. `src/app/(admin)/admin/announcements/page.tsx` — two-column layout. Left: Publish New Announcement section. Right: Recent History panel.
4. Create `src/components/announcements/announcement-editor.tsx` — `'use client'`. Load TipTap with `next/dynamic` and `ssr: false`. Use `useEditor` from `@tiptap/react` with `StarterKit`. Title input above the editor. Target Level `<select>` below. "Publish Announcement" button calls `createAnnouncement`.
5. Right panel: Recent History — fetch last 5 announcements from the `announcements` table. Each item: title, published date, level badge (or "All Levels"), read percentage (placeholder: "—").
6. Engagement Insights card at bottom: placeholder card with "Coming Soon" content.
7. Student dashboard: fetch and render announcements for the student's level (add to `dashboard/page.tsx` — only if the table exists).

**Hard constraints:**
- TipTap must be loaded with `next/dynamic({ ssr: false })` — never imported directly in a Server Component
- `sanitize-html` (already installed) must be used server-side to sanitize `body` before storing — DOMPurify is banned
- The `announcements` table must have RLS enabled
- No new migration files — use Supabase SQL editor only

**Performance requirement:**
TipTap editor initialises client-side only (SSR false). Editor must be interactive within 2
seconds of page load. The dynamic import ensures no SSR overhead.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Announcements page loads with TipTap editor and title input visible
- [ ] Frontend: Type a title and body, click "Publish Announcement" → success toast, announcement appears in Recent History
- [ ] Frontend: Student dashboard shows the published announcement (once student dashboard fetch is updated)
- [ ] Supabase DB check: `SELECT id, title, created_at FROM announcements ORDER BY created_at DESC LIMIT 5;` — the published announcement appears
- [ ] Supabase DB check: Confirm `announcements` table has RLS enabled: `SELECT relrowsecurity FROM pg_class WHERE relname = 'announcements';` — returns `t`
- [ ] Edge case: Publish with empty title → form validation blocks submission, error shown inline
- [ ] Edge case: Publish with empty body → same validation
- [ ] Performance: Editor is interactive (cursor visible, typing works) within 2 seconds of page load
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Admin Announcements to DONE"
git push
```

---
### TASK 11: Admin Settings Page
**Why this matters:**
Admins cannot change the institution name, configure session timeout, or set grade boundaries
through the UI. These settings are either hardcoded or missing entirely. Grade boundaries (A+/A/B
etc.) affect how student results are displayed on the results page. Without this page, every
institution is locked to default settings.

**Files to read before touching anything:**
- `src/app/(admin)/admin/settings/page.tsx` — current state
- `src/app/actions/settings.ts` — check if it exists and what actions are available
- Database schema: check if an `institution_settings` or `institutions` table exists with the relevant columns

**What currently exists:**
Settings page is a placeholder. Check if a `settings.ts` action file exists. The `profiles`
table has `institution_id`. There may be an `institutions` table with `name` and other fields —
verify in live DB. Grade boundaries are currently hardcoded in the results and student results
pages.

**Changes to make:**
1. Check live DB: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('institutions', 'institution_settings');`.
2. If `institutions` table exists with `name` column, use it. If not, store settings on the `profiles` table or create a minimal settings table via Supabase SQL editor.
3. `src/app/(admin)/admin/settings/page.tsx` — three section cards:
   - **Institution Profile**: Institution name input, Primary timezone `<select>` (list of IANA timezones), Session timeout input (number, seconds, default 3600). "Save Institution" button calls `updateSettings`.
   - **Grade Boundaries**: A table with rows for A+, A, B, C, F. Each row: grade label, min score input, max score input. Overlap detection: if any range overlaps another, highlight the conflicting row in red (`border: '1px solid #DC2626'`). "Save Boundaries" button (disabled while overlapping). "Reset to Defaults" button restores A+≥90, A≥80, B≥70, C≥60.
   - **Data Retention Policy**: Toggle switch: "Auto-Archive Records" (placeholder, no backend wiring needed).
4. Support card: static card with institution email and "Open Developer Docs" link (placeholder href).
5. Current Session timer: bottom-left corner — a `useEffect` that counts up seconds since page load. Format as mm:ss.
6. Create or update `src/app/actions/settings.ts` — `updateSettings({ name?, timezone?, session_timeout_seconds?, grade_boundaries? })`. Store in DB. Log to `activity_logs`.

**Hard constraints:**
- Overlap detection must be client-side (real-time as user types) — do not round-trip to server for this
- `npm run tsc` 0 errors
- No banned colours for error states — use `#DC2626` on `#FEE2E2` per design system Error spec

**Performance requirement:**
Settings page is low-traffic — one admin at a time. No performance constraints beyond normal
page load < 2 seconds.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Settings page loads with all three sections visible
- [ ] Frontend: Change institution name, click Save → success toast
- [ ] Frontend: Reload page → institution name persists (from DB, not just React state)
- [ ] Frontend: Set grade boundary with overlapping ranges → row highlights red, Save button disabled
- [ ] Frontend: Reset to Defaults → inputs reset to A+≥90, A≥80, B≥70, C≥60
- [ ] Frontend: Current Session timer counts up in bottom-left corner
- [ ] Supabase DB check: After saving institution name: `SELECT name FROM institutions WHERE id = '<id>';` (or equivalent table) — new name persists
- [ ] Supabase DB check: After saving grade boundaries: verify stored correctly in whatever table is used
- [ ] Edge case: Two ranges overlap (e.g. A: 70–100 and B: 60–80) → overlap highlighted immediately on input change
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Admin Settings Page to DONE"
git push
```

---
### TASK 12: Admin Activity Log Page
**Why this matters:**
Every server action writes to `activity_logs`. This data exists but is invisible to admins.
Without an activity log UI, admins cannot audit who did what, when an exam was opened or closed,
or which student submitted. This is required for compliance and incident investigation.

**Files to read before touching anything:**
- `src/app/(admin)/admin/activity/page.tsx` — current state
- `src/app/actions/assessments.ts` — see how `activity_logs` inserts work to understand the data structure
- Database schema: `SELECT column_name FROM information_schema.columns WHERE table_name = 'activity_logs';` — confirm actual columns

**What currently exists:**
The activity log page is a placeholder. `activity_logs` has `id, user_id, institution_id, action_type, entity_type, entity_id, metadata, created_at` at minimum. The `metadata` column is JSONB. Every server action already inserts into this table.

**Changes to make:**
1. `src/app/(admin)/admin/activity/page.tsx` — Server Component. Fetch most recent 100 log entries for the institution. Accept `searchParams` for filter query params. Pass to `ActivityClient`.
2. Create `src/components/activity/activity-client.tsx` — `'use client'`. Filter bar: User Search text input (filters by `user_id` contains), Action Type `<select>` (dropdown of distinct action types), Timestamp Range (two `<input type="date">` pickers), Export CSV button (placeholder).
3. Table: timestamp (formatted "Apr 9, 2026 14:23"), actor (`user_id` — last 8 chars with avatar initials circle), action badge (colour-coded: CREATE = green, UPDATE = blue, DELETE = red, SUBMIT = purple, OPEN/CLOSE = orange), target entity (`entity_type` + `entity_id` last 6 chars), expand chevron button.
4. Expanded row: full-width panel below the row. Two sub-panels side by side:
   - Metadata panel: IP (not currently stored — show "N/A"), user agent (not currently stored — show "N/A"), trace ID (use `entity_id`).
   - JSON Payload panel: render `metadata` JSONB as a formatted `<pre>` block with syntax-like styling (no library needed — just monospace font).
5. System Status bar at bottom: three static cards — Database Performance (placeholder "Normal"), Log Retention (placeholder "90 days"), Security Audit (placeholder "Passed").
6. Pagination: 100 rows per page. "Load More" button fetches the next 100 (cursor-based using `created_at` as cursor).

**Hard constraints:**
- Do not expose full UUIDs in the UI — show last 6–8 characters only
- `metadata` JSONB must be rendered in a `<pre>` block using `JSON.stringify(metadata, null, 2)` — do not use DOMPurify or sanitize-html for this (it is not user-generated content)
- Export CSV is a placeholder — do not implement actual CSV generation yet

**Performance requirement:**
Initial page load of 100 rows must complete in < 2 seconds. Use cursor-based pagination, not
`OFFSET/LIMIT` — at 10,000 log entries, `OFFSET 9900` is very slow.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Activity log page shows 100 most recent entries with correct timestamps and action badges
- [ ] Frontend: Click expand chevron on a row → metadata panel opens below showing JSON payload
- [ ] Frontend: Filter by Action Type "CREATE_ASSESSMENT" → table shows only those rows
- [ ] Frontend: User search for a partial user_id → table filters
- [ ] Supabase DB check: `SELECT COUNT(*) FROM activity_logs WHERE institution_id = '<id>';` — total row count consistent with pagination
- [ ] Supabase DB check: After any action (e.g. create assessment), refresh activity log → new row appears at top within 5 seconds
- [ ] Performance: Page loads 100 rows in < 2000ms. Load More fetches next 100 in < 1000ms.
- [ ] Edge case: Zero log entries — page shows "No activity yet" empty state
- [ ] Edge case: `metadata` is null for some rows — JSON panel shows "No metadata" instead of crashing
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Admin Activity Log to DONE"
git push
```

---
### TASK 13: Flash Phase — TEST Type Exam Engine Verification
**Why this matters:**
The `AnzanFlashView` component exists and the phase state machine is wired, but the full flash
sequence has never been verified end-to-end in production with real exam data from the DB. The
timing engine, digit count, and row count must come from the DB record. `tickerMode` is
hardcoded `false`. If the flash sequence does not play correctly, TEST-type exams are broken for
all students.

**Files to read before touching anything:**
- `src/components/exam/anzan-flash-view.tsx` — understand current phase transitions; note `tickerMode = false` hardcoded on line 66
- `src/app/(student)/student/exams/[id]/page.tsx` — how `anzanConfig` is passed from DB fields
- `src/hooks/use-anzan-engine.ts` — understand how flash sequences are generated and timed
- `src/lib/anzan/timing-engine.ts` — verify RAF loop, accumulator pattern, `MINIMUM_INTERVAL_MS`
- `src/stores/exam-session-store.ts` — verify phase constants include `PHASE_2_FLASH` (the string, not a bare `'FLASH'`)

**What currently exists:**
`AnzanFlashView` is built and phase-aware. `anzanConfig` is read from `exam_papers.anzan_delay_ms`,
`anzan_digit_count`, `anzan_row_count` in the server component and passed as props — this is
correct. `tickerMode` is hardcoded `false` on line 66 of `anzan-flash-view.tsx`. The timing
engine uses RAF and accumulator pattern. `PHASE_2_FLASH` must be used as the phase string.

**Changes to make:**
1. Create a TEST exam in admin with `anzan_delay_ms = 800`, `anzan_digit_count = 2`, `anzan_row_count = 5`. Add 3 questions with valid `flash_sequence` arrays (e.g. `[12, 34, 56, 78, 90]`). Publish and set LIVE.
2. Log in as a student and enter the exam. Observe the full phase sequence: INTERSTITIAL → PHASE_1_START → PHASE_2_FLASH → PHASE_3_MCQ → SUBMITTED.
3. If any phase transition is broken, trace the fault in `exam-session-store.ts` and fix the guard.
4. Verify `PHASE_2_FLASH` is used as the phase constant everywhere — search codebase for bare string `'FLASH'` and replace with `PHASE_2_FLASH` if found.
5. Verify `timing-engine.ts` uses `requestAnimationFrame` only — search `src/lib/anzan/` for `setTimeout` and `setInterval` (should be zero).
6. Document any timing discrepancy found (e.g. if 800ms flashes feel longer). Do NOT fix by adjusting timing constants unless a real bug is found.
7. Note: `tickerMode` fix is tracked separately in Task 17. Do not wire it here.

**Hard constraints:**
- `PHASE_2_FLASH` — never the bare string `'FLASH'`
- No `setTimeout` or `setInterval` anywhere in `src/lib/anzan/`
- `MINIMUM_INTERVAL_MS = 200` — flash timing must never go below 200ms
- `neurologist_approved` flag required for sub-200ms timing — do not add sub-200ms paths without this gate

**Performance requirement:**
Flash sequence must not drift more than 50ms per flash over a 20-flash sequence. The RAF
accumulator pattern prevents drift — verify by logging timestamps in development mode only.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: TEST exam shows INTERSTITIAL screen for 3 seconds, then "Begin Flash ▶" button
- [ ] Frontend: Click "Begin Flash ▶" → full-screen flash number displays at correct timing
- [ ] Frontend: After last flash, MCQ grid appears immediately
- [ ] Frontend: Select an answer → next question's flash begins
- [ ] Frontend: After last question is answered → CompletionCard appears
- [ ] Supabase DB check: `SELECT COUNT(*) FROM student_answers WHERE submission_id = '<id>';` — count matches questions answered
- [ ] Supabase DB check: `SELECT closed_at FROM assessment_sessions WHERE id = '<session_id>';` — not null after submission
- [ ] Grep check: `grep -r "setInterval\|setTimeout" src/lib/anzan/` — zero matches
- [ ] Grep check: `grep -rn "'FLASH'" src/` — zero matches (only `PHASE_2_FLASH` used)
- [ ] Performance: Flash timing at 800ms shows numbers for ~800ms each — measure with stopwatch on 5 consecutive flashes
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Flash Phase Verification to DONE"
git push
```

---
### TASK 14: Offline Sync Verification
**Why this matters:**
MindSpark is designed for school environments with unreliable internet. The offline sync system
(Dexie + HMAC + `/api/submissions/offline-sync`) is architecturally complete but has never been
verified end-to-end. If offline sync is broken, students who lose connection during an exam lose
all their answers — catastrophic data loss during high-stakes assessments.

**Files to read before touching anything:**
- `src/lib/offline/indexed-db-store.ts` — understand Dexie schema and `PendingAnswer` row shape
- `src/lib/offline/sync-engine.ts` — understand flush trigger and the `/api/submissions/offline-sync` endpoint
- `src/app/api/submissions/offline-sync/route.ts` — verify HMAC validation logic
- `src/components/exam/sync-indicator.tsx` — understand how offline state is surfaced to user
- `src/components/exam/network-banner.tsx` — understand the offline banner component

**What currently exists:**
Dexie 4 `IndexedDB` store queues `PendingAnswer` rows. `sync-engine.ts` flushes when online.
The `/api/offline-sync` route validates HMAC signatures. The exam client tracks `isOnline` via
`navigator.onLine` events. `SyncIndicator` and `ExamNetworkBanner` show offline state. This
has not been tested end-to-end.

**Changes to make:**
1. This task is primarily verification, not new code. Follow the steps below and fix any bugs discovered.
2. Start a TEST or EXAM exam as a student. Answer 3 questions while online — verify `student_answers` rows appear in Supabase.
3. Go to DevTools → Network → Offline. Answer 2 more questions. Verify `SyncIndicator` shows "offline" state and the network banner appears.
4. Check Dexie store: in DevTools → Application → IndexedDB → mindspark-offline → pendingAnswers. Verify 2 rows exist.
5. Come back online (DevTools → Network → No throttling). Verify sync-engine flushes — the 2 rows should disappear from IndexedDB and appear in Supabase `student_answers`.
6. Verify HMAC rejection: manually craft a fetch to `/api/submissions/offline-sync` with a tampered payload. Verify 401 response.
7. Fix any bugs found during steps 2–6. Common failure modes: sync-engine does not trigger when coming back online, HMAC secret not set in production env vars, Dexie table schema mismatch.
8. Verify `activity_logs` has an `OFFLINE_SYNC` row after flush.

**Hard constraints:**
- HMAC signing is server-side only — the secret `HMAC_SECRET` must never appear in client-side code or be logged
- Do not change the Dexie schema version without understanding migration implications
- Do not bypass HMAC validation — this is an anti-cheat measure

**Performance requirement:**
Sync flush must complete within 10 seconds of coming back online. At 100 queued answers (worst
case), the flush must complete as a single batch call, not 100 individual requests.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Go offline mid-exam → network banner appears, SyncIndicator shows "offline"
- [ ] Frontend: Answer 2 questions offline → DevTools IndexedDB shows 2 `PendingAnswer` rows
- [ ] Frontend: Come back online → IndexedDB pendingAnswers table empties within 10 seconds
- [ ] Supabase DB check: `SELECT COUNT(*) FROM student_answers WHERE submission_id = '<id>';` — count = 5 (3 online + 2 offline synced)
- [ ] Supabase DB check: `SELECT * FROM activity_logs WHERE action_type = 'OFFLINE_SYNC' ORDER BY created_at DESC LIMIT 1;` — row exists after sync
- [ ] Network check: Craft tampered request to `/api/submissions/offline-sync` (change one byte of HMAC) → 401 Unauthorized
- [ ] Performance: 100 queued answers sync in < 10 seconds as a single batch
- [ ] Edge case: Student closes browser tab while offline → on next load, pending answers are still in Dexie and sync on reconnect
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Offline Sync Verification to DONE"
git push
```

---
### TASK 15: Performance — 500 Concurrent Students Load Testing
**Why this matters:**
MindSpark will be used in exam halls with all students starting simultaneously. The "thundering
herd" scenario — 500 students hitting the session init endpoint at the same second — is the
highest-risk moment. Without load testing, we have no evidence the platform can handle this.
A production failure during an exam is catastrophic and unrecoverable.

**Files to read before touching anything:**
- `k6/` directory — check if k6 test files exist; if not, they must be created
- `src/app/actions/assessment-sessions.ts` — understand `initSession` — this is the hot path
- `src/app/api/submissions/offline-sync/route.ts` — second hot path
- `src/app/(student)/student/exams/[id]/page.tsx` — understand data fetching; check for N+1 queries

**What currently exists:**
No k6 load test files have been confirmed to exist. The `initSession` server action creates
assessment sessions and fetches questions. It uses `adminSupabase` for the insert — check
Supabase connection pool limits (default: 60 connections on free tier, 200 on Pro). The exam
page fetches questions in a separate query from the session — potential N+1 if questions are
fetched per student rather than once.

**Changes to make:**
1. Check if `k6/` directory exists. Create it if not.
2. Create `k6/lt-01-thundering-herd.js` — 500 VUs all call `initSession` simultaneously. Scenario: ramp to 500 VUs in 5 seconds, hold for 30 seconds. Target: p95 < 2000ms, error rate < 1%.
3. Create `k6/lt-02-heartbeat-storm.js` — 500 VUs each submit an answer every 10 seconds for 5 minutes. Target: p95 < 500ms.
4. Create `k6/lt-03-offline-sync-storm.js` — 100 VUs each submit a batch of 20 answers via `/api/offline-sync` simultaneously. Target: p95 < 3000ms.
5. Check for N+1 queries: `exam page` fetches session + questions in two queries — this is fine. Check if `initSession` makes additional per-student queries (the `students.cohort_id` fetch on line 43 of `assessment-sessions.ts` is a separate round-trip — consider moving it into the session insert logic or caching it).
6. If Supabase connection pool errors appear under load, add connection pool documentation in a code comment and note the Supabase plan required.

**Hard constraints:**
- k6 must target the production Vercel URL, not localhost
- Load test must not run against production DB with real student data — use test institution only
- Do not store k6 results files in git — add `k6/results/` to `.gitignore`

**Performance requirement:**
All three load tests must pass:
- lt-01: p95 < 2000ms, error rate < 1%, zero 500 errors
- lt-02: p95 < 500ms, error rate < 0.1%
- lt-03: p95 < 3000ms, error rate < 1%

**Validator — task is DONE only when ALL pass:**
- [ ] k6 lt-01 thundering herd: run `k6 run k6/lt-01-thundering-herd.js` → all thresholds pass in output summary
- [ ] k6 lt-02 heartbeat storm: run `k6 run k6/lt-02-heartbeat-storm.js` → all thresholds pass
- [ ] k6 lt-03 offline sync storm: run `k6 run k6/lt-03-offline-sync-storm.js` → all thresholds pass
- [ ] Supabase DB check: After lt-01, check for duplicate sessions: `SELECT paper_id, student_id, COUNT(*) FROM assessment_sessions GROUP BY paper_id, student_id HAVING COUNT(*) > 1;` — zero rows (upsert idempotency holds)
- [ ] Supabase logs: Check Supabase dashboard for connection pool exhaustion errors during lt-01 — should be zero
- [ ] Network check: Zero 500-status responses in k6 output for all three tests
- [ ] Performance: Vercel function duration (in Vercel dashboard) for `initSession` p95 < 2000ms during lt-01
- [ ] Edge case: k6 terminates early due to high error rate → investigate root cause before marking done

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Load Testing to DONE"
git push
```

---
### TASK 16: Lobby 30-Second Polling Fallback
**Why this matters:**
The lobby page relies exclusively on a Supabase Realtime WebSocket broadcast (`exam_live` event)
to detect when the admin opens the exam. If the student's WebSocket connection drops, or if the
student loads the lobby page after the broadcast was already sent, they will wait in the lobby
forever. This is a silent failure — no error, no redirect, just a stuck countdown. The polling
fallback ensures every student reaches the exam regardless of WebSocket reliability.

**Files to read before touching anything:**
- `src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx` — current WebSocket subscription; understand where the `exam_live` event handler is
- `src/app/(student)/student/exams/[id]/lobby/page.tsx` — server component wrapper; understand what data is passed to LobbyClient
- `src/lib/supabase/client.ts` — client for Supabase Realtime and polling queries

**What currently exists:**
`LobbyClient` subscribes to `supabase.channel('exam:<paperId>')` and listens for `exam_live`
broadcast event. On event: calls `initSession` then navigates to `/student/exams/[id]`. There
is no polling fallback. If the WebSocket connection is lost or the student arrives late, they
stay on the lobby page indefinitely.

**Changes to make:**
1. In `lobby-client.tsx`, add a `useEffect` that sets up a 30-second `setInterval` polling interval. Note: `setInterval` is allowed outside `src/lib/anzan/` — the ban is only in the anzan timing engine.
2. Every 30 seconds: query `supabase.from('exam_papers').select('status').eq('id', paperId).single()`.
3. If `status === 'LIVE'`: trigger the same `initSession` + navigation flow as the WebSocket handler.
4. If `status === 'CLOSED'`: redirect to `/student/exams` with a toast: "This exam has ended."
5. Cleanup: clear the interval in the `useEffect` return function — critical to prevent memory leaks and navigation after unmount.
6. Guard: if the WebSocket event fires first and navigation has already started, the polling interval must not fire again. Use a `useRef<boolean>` flag `hasNavigated` set to `true` before any `router.push`.
7. The polling interval starts immediately on mount — do not wait 30 seconds for the first check. Use `checkStatus()` immediately, then poll every 30 seconds.

**Hard constraints:**
- `setInterval` is allowed here (this is `lobby-client.tsx`, not `src/lib/anzan/`)
- The interval must be cleared on component unmount — no interval leaks
- Do not add polling to the exam page itself — only the lobby needs this
- `hasNavigated` ref prevents double-navigation

**Performance requirement:**
Each poll is a single lightweight Supabase query (HEAD request equivalent — just status column).
At 500 students in the lobby polling every 30 seconds, this is ~17 requests/second — well
within Supabase rate limits.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Student in lobby. Open DevTools → Application → Network → block WebSocket connections. Wait 30 seconds. Verify the page makes a GET/POST to Supabase `exam_papers` endpoint at 30-second intervals.
- [ ] Frontend: With WebSocket blocked, admin opens the exam. Within 30 seconds, student is automatically redirected to the exam page (not stuck in lobby).
- [ ] Frontend: Admin closes the exam while student is in lobby. Within 30 seconds (or immediately if WebSocket works), student is redirected to `/student/exams`.
- [ ] Frontend: Student navigates away from lobby page — no "setState on unmounted component" errors in console (interval is cleaned up).
- [ ] Supabase DB check: `SELECT status FROM exam_papers WHERE id = '<id>';` — matches the redirect behaviour observed
- [ ] Performance: Polling adds < 1KB of network traffic per 30-second interval per student
- [ ] Edge case: `initSession` called by both WebSocket handler and polling simultaneously — second call is idempotent (existing session returned, no duplicate created)
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move Lobby Polling Fallback to DONE"
git push
```

---
### TASK 17: tickerMode and Anzan Config from DB
**Why this matters:**
`tickerMode` is hardcoded `false` in `anzan-flash-view.tsx` line 66. Students with visual
impairments or specific accessibility needs who have `ticker_mode = true` on their profile
will never get the accessible ticker interface. Additionally, if `anzan_digit_count`,
`anzan_row_count`, and `anzan_delay_ms` are ever wrong in the DB (e.g. null), the hardcoded
defaults in the fallback may produce incorrect exam configs — digit counts and timing are
exam-integrity-critical.

**Files to read before touching anything:**
- `src/components/exam/anzan-flash-view.tsx` — line 66: `const tickerMode = false; // TODO`
- `src/app/(student)/student/exams/[id]/page.tsx` — how `anzanConfig` is constructed and passed; also understand the student fetch shape (does it include `ticker_mode`?)
- `src/lib/auth/rbac.ts` — `requireRole('student')` return shape — does it expose profile fields?
- Database: `SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';` — confirm `ticker_mode` column exists

**What currently exists:**
The server component at `student/exams/[id]/page.tsx` fetches the paper and session but does NOT
fetch the student profile's `ticker_mode`. The `anzanConfig` is correctly read from
`exam_papers.anzan_delay_ms`, `anzan_digit_count`, `anzan_row_count` and passed as props — this
part is already correct. `tickerMode` is hardcoded `false` client-side.

**Changes to make:**
1. In Supabase SQL editor, verify: `SELECT ticker_mode FROM profiles WHERE id = '<student_user_id>';` — confirm the column exists and is boolean.
2. `src/app/(student)/student/exams/[id]/page.tsx` — add a query to fetch `profiles.ticker_mode` for the authenticated student (use `requireRole` result's `userId`): `supabase.from('profiles').select('ticker_mode').eq('id', userId).single()`.
3. Pass `tickerMode: profile?.ticker_mode ?? false` as a prop to `ExamPageClient`.
4. Update `ExamPageClientProps` interface to accept `tickerMode?: boolean`.
5. Pass `tickerMode` through to `AnzanFlashView` as a prop.
6. Update `AnzanFlashViewProps` to accept `tickerMode: boolean`.
7. In `anzan-flash-view.tsx`, replace `const tickerMode = false;` with `const { tickerMode } = props;` (or destructure from props).
8. Verify `TickerMode` component renders correctly when `tickerMode = true`: it should show a large text counter without the visual flash animation.

**Hard constraints:**
- `ticker_mode` must come from `profiles` (server-fetched, not client-settable)
- Do not expose `ticker_mode` as a client-controllable parameter — students must not be able to toggle it via URL params or local storage
- `npm run tsc` 0 errors after interface changes

**Performance requirement:**
One additional Supabase query per page load. This is negligible — the profiles fetch is a
single-row lookup by primary key and will complete in < 50ms.

**Validator — task is DONE only when ALL pass:**
- [ ] Frontend: Set `ticker_mode = true` for a test student in Supabase. Log in as that student and start a TEST exam. Verify TickerMode component renders (text counter visible, no flash animation).
- [ ] Frontend: Set `ticker_mode = false` — normal FlashNumber component renders.
- [ ] Frontend: `anzan_digit_count = 3` on exam paper → 3-digit numbers appear in flash sequence
- [ ] Frontend: `anzan_delay_ms = 500` on exam paper → flashes feel approximately 500ms each
- [ ] Supabase DB check: `SELECT ticker_mode FROM profiles WHERE id = '<student_id>';` — value matches what is rendered
- [ ] Grep check: `grep -n "tickerMode = false" src/components/exam/anzan-flash-view.tsx` — zero matches (hardcoded false is removed)
- [ ] Edge case: `ticker_mode` column does not exist in live DB — fallback to `false`, no crash
- [ ] TypeScript: `npm run tsc` reports 0 errors

**After completing this task:**
```
git add TASKS.md
git commit -m "chore: task board — move tickerMode DB wiring to DONE"
git push
```

---

## DONE

### Admin Login + Sidebar Navigation
**Completed:** Apr 2026
**What was built:** Full admin authentication flow with Supabase Auth. Sidebar renders with white
link text on primary green (#1A3829) background, active state highlight, and Sign Out button
wired to Supabase `signOut()`. Role check via `requireRole('admin')` on every admin page.
**Bugs fixed during this task:** White text on green sidebar initially broken by Tailwind v4 cascade rules — fixed with explicit `.admin-sidebar` CSS class.
**Verified by:** Manual login test with admin credentials; sidebar links all navigate correctly.

---

### Tailwind v4 CSS Fixes
**Completed:** Apr 2026
**What was built:** Slate palette registered in `globals.css` via `@theme inline`. Fixed cascade
bug where `hidden md:flex` was conflicting with Tailwind v4 specificity rules — replaced with
`.admin-sidebar` CSS class. Colour tokens for `bg-bg-page`, `bg-green-800`, `border-slate-200`
all compile correctly.
**Bugs fixed during this task:** `hidden md:flex` bug causing sidebar to disappear; slate palette missing from compiled CSS.
**Verified by:** Visual inspection; `npm run build` passes with no CSS warnings.

---

### Create Assessment Wizard (3-Step)
**Completed:** Apr 2026
**What was built:** 3-step wizard: Step 1 = Type (EXAM/TEST toggle), Step 2 = Questions (add/
edit/delete questions with equation_display and option fields), Step 3 = Config (title, duration,
level assignment). Calls `createAssessment` then question server actions. Assessment card appears
in list on completion.
**Bugs fixed during this task:** None during this task.
**Verified by:** Created multiple EXAM and TEST assessments end-to-end; verified rows in `exam_papers` and `questions` tables.

---

### Assessment Cards with Status Badges and Actions
**Completed:** Apr 2026
**What was built:** `AssessmentCard` component renders for each paper: title, type badge (EXAM/TEST),
status badge (DRAFT/PUBLISHED/LIVE/CLOSED), duration, question count. Action buttons: Publish
(DRAFT → PUBLISHED), Open (PUBLISHED → LIVE), Close (LIVE → CLOSED), with correct disabled states
per status.
**Bugs fixed during this task:** None.
**Verified by:** Cycled through all status transitions in admin UI; verified Supabase status column updates.

---

### opened_at Set on forceOpenExam
**Completed:** Apr 2026
**What was built:** `forceOpenExam` action sets `opened_at = now()` on the `exam_papers` row when
status transitions to LIVE. `opened_at` is passed to `LobbyClient` to drive the countdown timer.
**Bugs fixed during this task:** Initial implementation did not set `opened_at` — lobby countdown showed NaN.
**Verified by:** Opened exam, verified `opened_at` in Supabase; lobby countdown displayed correctly.

---

### Question Server Actions (Create, Delete, Reorder)
**Completed:** Apr 2026
**What was built:** Server actions for question management: `createQuestion`, `deleteQuestion`,
`reorderQuestions`. All scoped to institution via `paper_id` ownership check. Used in the
Create Assessment Wizard Step 2.
**Bugs fixed during this task:** None.
**Verified by:** Added, deleted, and reordered questions in wizard; verified `order_index` updates in DB.

---

### Student Dashboard with LIVE Exam Card and Countdown
**Completed:** Apr 2026
**What was built:** Student dashboard fetches LIVE and PUBLISHED exams for student's level and
institution. LIVE exam renders as a hero card with red badge, exam title, duration, and "Enter
Exam" button linking to lobby. Upcoming exams in a list below. Candidate profile card in right column.
**Bugs fixed during this task:** None.
**Verified by:** Student 001 dashboard showed correct LIVE exam card during E2E test session.

---

### Student Lobby Page (Timer, Checklist, I'm Ready)
**Completed:** Apr 2026
**What was built:** Lobby page server component fetches paper and student consent status. `LobbyClient`
shows exam title, timer counting down from exam open time, pre-flight checklist (internet, device,
consent), and "I'm Ready" button. Button calls `initSession` and navigates to `/student/exams/[id]`.
**Bugs fixed during this task:** `consent_verified` bug — was checking wrong field; fixed. `status = 'ACTIVE'` casing bug — fixed to `'active'`.
**Verified by:** Student 001 pressed "I'm Ready", session created in DB, redirected to exam page.

---

### Exam MCQ Page (Vertical View, Navigator, Timer)
**Completed:** Apr 2026
**What was built:** `ExamPageClient` dispatches to `ExamVerticalView` (EXAM type) or `AnzanFlashView`
(TEST type). `ExamVerticalView` shows equation display panel, MCQ grid, question navigator sidebar,
exam timer pill, sync indicator, and Submit Exam button. `ConfirmSubmit` dialog wired to `onSubmit`.
**Bugs fixed during this task:** Phase transition chain bug (`IDLE → INTERSTITIAL` was illegal) — fixed by adding `LOBBY` intermediate state. `AnzanFlashView` did not accept LOBBY as a valid starting phase — fixed. `white-space: pre` added to equation display for multi-line rendering.
**Verified by:** E2E test with Student 001 — exam page rendered, questions navigable, equation displayed with correct whitespace.

---

### All MCP Servers Configured
**Completed:** Apr 2026
**What was built:** `code-review-graph`, Chrome DevTools, Supabase, and Context7 MCP servers configured
in Claude Code settings. Graph auto-updates on file changes via hooks. TypeScript check hook added
as PostToolUse hook in `settings.json`.
**Bugs fixed during this task:** settings.json missing hook section; fixed by merging hook config.
**Verified by:** MCP tools respond in conversation; TypeScript hook fires after file edits.

---

### Stale Lobby File at Wrong Path Deleted
**Completed:** Apr 2026
**What was built:** Not a feature — a file at an incorrect path was deleted to prevent import confusion.
**Bugs fixed during this task:** Stale file was causing incorrect import resolution.
**Verified by:** Build passes; correct lobby page renders.

---

### Webpack WasmHash Build Crash Fixed
**Completed:** Apr 2026
**What was built:** Fixed a build-time crash caused by a Webpack WasmHash configuration issue. The
exact fix details are in git history.
**Bugs fixed during this task:** `npm run build` was crashing at WasmHash step.
**Verified by:** `npm run build` completes successfully; Vercel deployment succeeds.

---

## KNOWN BUGS

---
### BUG 1: tickerMode Hardcoded False
**Severity:** MEDIUM
**Where:** `src/components/exam/anzan-flash-view.tsx` line 66
**What happens:** All students get the visual FlashNumber component regardless of whether their profile has `ticker_mode = true`. Students with accessibility needs requiring TickerMode never get it.
**Root cause:** Hardcoded `const tickerMode = false;` — profile is not fetched at exam page level.
**Fix required:** Fetch `profiles.ticker_mode` in `student/exams/[id]/page.tsx` and pass it as a prop through `ExamPageClient` → `AnzanFlashView`. See Task 17.
**Blocks:** Task 17

---
### BUG 2: Anzan Config Not Fully Verified from DB
**Severity:** MEDIUM
**Where:** `src/components/exam/anzan-flash-view.tsx` — `anzanConfig` is passed as props correctly from `page.tsx`, but the end-to-end flow with real DB data has not been verified in production
**What happens:** If `anzan_digit_count`, `anzan_row_count`, or `anzan_delay_ms` are null in the DB, fallback defaults (`{ delayMs: 1000, digitCount: 1, rowCount: 5 }`) are used silently — the exam runs with wrong config.
**Root cause:** No null-check warning or logging when DB fields are null.
**Fix required:** Add a console.warn in development when null values are used. Validate that exam paper config is non-null before allowing PUBLISHED status in `publishAssessment` action. See Task 13.
**Blocks:** Task 13

---
### BUG 3: No Lobby Polling Fallback
**Severity:** HIGH
**Where:** `src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx`
**What happens:** If the student's WebSocket connection drops before the `exam_live` broadcast, or if the student loads the lobby after the broadcast was already sent, they remain stuck in the lobby indefinitely. No error is shown; the countdown continues but the "I'm Ready" button is gone.
**Root cause:** Lobby relies solely on Supabase Realtime WebSocket broadcast. No polling fallback exists.
**Fix required:** Add 30-second polling interval in `lobby-client.tsx` that queries `exam_papers.status` directly. See Task 16.
**Blocks:** Task 16, production readiness

---
### BUG 4: No Supabase Storage Buckets
**Severity:** LOW
**Where:** Supabase project — no storage buckets configured
**What happens:** Any feature that uploads files (avatar images, CSV imports, PDF exports) has no storage destination. Currently no feature actively requires this, but future development will hit this gap.
**Root cause:** Storage buckets were never created in the Supabase project.
**Fix required:** Create buckets `avatars` (public), `documents` (private) in Supabase Storage dashboard. Set RLS policies.
**Blocks:** Student avatar upload, PDF export features

---
### BUG 5: Student Results Page is Empty Shell
**Severity:** HIGH
**Where:** `src/app/(student)/student/results/page.tsx`
**What happens:** Students cannot see their exam scores or history. The "View Results →" button on `CompletionCard` navigates to dashboard as a placeholder because this page does not exist.
**Root cause:** Not yet built.
**Fix required:** See Task 4.
**Blocks:** Task 4, complete student exam flow

---
### BUG 6: Student Exams List Page is Empty Shell
**Severity:** HIGH
**Where:** `src/app/(student)/student/exams/page.tsx`
**What happens:** "View All" link on student dashboard navigates to a blank or missing page. Students cannot browse all their exams.
**Root cause:** Not yet built.
**Fix required:** See Task 3.
**Blocks:** Task 3

---

## BEFORE DEPLOYMENT TO REAL STUDENTS

---
### PRE-1: Rotate All Compromised Credentials
**What to do:**
1. Generate a new Supabase service role key in the Supabase dashboard (Project Settings → API → Rotate Service Role Key).
2. Generate a new Supabase DB password (Project Settings → Database → Reset Database Password).
3. Generate a new `HMAC_SECRET` value: `openssl rand -hex 32`.
4. Generate a new `OFFLINE_SYNC_SECRET` value: `openssl rand -hex 32`.
5. Update all four values in Vercel environment variables (Production, Preview, Development).
6. Redeploy the production deployment to pick up new env vars.
7. Revoke the old service role key in Supabase after verifying the new deployment works.
**Files involved:** None — environment variables only, not committed to git.
**How to verify:** Run `vercel env ls` (after installing Vercel CLI) to confirm all four vars are set. Make a test API call that uses the service role key — it should succeed.
**Consequence of skipping:** Credentials from development sessions are in git history and accessible to anyone with repo access. A malicious actor could use the service role key to read or delete all student data, bypass RLS, and access auth users.

---
### PRE-2: Verify app.hmac_secret in Production DB
**What to do:**
1. In Supabase SQL editor: `SELECT current_setting('app.hmac_secret', true);`
2. If empty or null: `ALTER DATABASE postgres SET app.hmac_secret = '<new_secret>';` where `<new_secret>` matches the `HMAC_SECRET` env var set in PRE-1.
3. Restart the Supabase DB connection pool (toggle "Pause" then "Resume" in dashboard, or contact Supabase support).
**Files involved:** None.
**How to verify:** Run the `SELECT` query again — must return the correct secret value. Then submit an offline sync payload from the client — it must be accepted (200) with the correct HMAC.
**Consequence of skipping:** The `/api/submissions/offline-sync` route will reject all offline submissions with 401 Unauthorized because HMAC validation will fail — all offline answers are lost.

---
### PRE-3: Run Lighthouse on Every Page and Fix Scores Below 90
**What to do:**
1. Open Chrome DevTools → Lighthouse.
2. Run Mobile preset audit on: `/admin/dashboard`, `/admin/assessments`, `/admin/students`, `/admin/results`, `/student/dashboard`, `/student/exams`, `/student/results`, `/student/exams/[id]` (exam page).
3. For any page scoring below 90 on Performance, Accessibility, or Best Practices: identify the failing audits and fix them.
4. Common fixes: image sizes (add `width`/`height` to any `<img>`), missing `alt` attributes, colour contrast failures (check against design system), render-blocking resources.
**Files involved:** Varies — fix in the specific page or component flagged.
**How to verify:** Re-run Lighthouse after fixes — all pages must score ≥ 90 on Performance, Accessibility, Best Practices.
**Consequence of skipping:** Students on mobile devices or slow connections have poor experience. Accessibility failures may exclude students with disabilities from taking exams — legal and ethical risk.

---
### PRE-4: Run axe-core Accessibility Scan and Fix CRITICAL Issues
**What to do:**
1. Install axe browser extension or use `@axe-core/react` in dev mode.
2. Scan every page in the student flow: dashboard, exams list, lobby, exam page, results.
3. Scan every admin page.
4. Fix all CRITICAL and SERIOUS violations. MODERATE violations: document and schedule for post-launch.
5. Pay special attention to: focus management in dialogs (ConfirmSubmit must trap focus), keyboard navigation on MCQ grid, ARIA labels on sync indicator and flash number region.
**Files involved:** Specific components flagged by axe scan.
**How to verify:** Re-run axe scan — zero CRITICAL violations on all pages.
**Consequence of skipping:** Students with screen readers or keyboard-only navigation cannot take exams. This is a legal accessibility requirement in most jurisdictions.

---
### PRE-5: Run All Three k6 Load Tests
**What to do:**
Run in sequence (not simultaneously — each test needs a clean DB state):
1. `k6 run k6/lt-01-thundering-herd.js` — wait for completion, record p95 and error rate.
2. `k6 run k6/lt-02-heartbeat-storm.js` — record p95 and error rate.
3. `k6 run k6/lt-03-offline-sync-storm.js` — record p95 and error rate.
All tests must target a test institution with seeded test data, not real student data.
**Files involved:** `k6/lt-01-thundering-herd.js`, `k6/lt-02-heartbeat-storm.js`, `k6/lt-03-offline-sync-storm.js`
**How to verify:** All three k6 tests exit with green summary (all thresholds pass). See Task 15 for threshold values.
**Consequence of skipping:** Unknown platform capacity. A real exam with 500 students may crash the platform. Session data loss is possible if the DB connection pool is exhausted.

---
### PRE-6: Full Admin Walkthrough End to End
**What to do:**
Using a fresh admin account:
1. Log in → dashboard loads with charts.
2. Create a Level.
3. Create a student and assign to the level.
4. Create an EXAM assessment (3 questions).
5. Create a TEST assessment (3 questions with flash sequences).
6. Publish the EXAM assessment.
7. Open the EXAM → status changes to LIVE.
8. Monitor page shows the session as active while student is in exam.
9. Close the EXAM.
10. View results → grade distribution appears, publish one result.
11. Publish an announcement → appears in student dashboard.
12. Check activity log → all actions from steps 1–11 appear.
**Files involved:** All admin pages.
**How to verify:** Every step completes without errors or blank screens. All DB writes are verified in Supabase.
**Consequence of skipping:** Undetected admin UI bugs that break exam management on exam day.

---
### PRE-7: Full Student Walkthrough End to End
**What to do:**
Using a fresh student account:
1. Log in → dashboard shows live exam card (if one is live) and upcoming list.
2. Navigate to exams list → all exams visible in correct sections.
3. Enter lobby for a LIVE exam → countdown timer, checklist, I'm Ready button.
4. Click I'm Ready → session created, navigated to exam page.
5. Answer all questions (EXAM type) → submit → completion card appears with score.
6. Repeat with TEST type exam → flash sequence plays → MCQ answered → completion card.
7. Navigate to results page → both submissions appear with scores and grade badges.
8. Go offline mid-exam → answer 2 questions → come back online → verify answers synced.
**Files involved:** All student pages.
**How to verify:** Every step completes without errors. All answers verified in Supabase `student_answers` table.
**Consequence of skipping:** Undetected student flow bugs. Students may lose answers or be unable to submit.

---
### PRE-8: Verify HMAC Rejection Works
**What to do:**
1. Use `curl` or a browser fetch to call `/api/submissions/offline-sync` with a valid payload but a tampered HMAC signature (change the last character of the signature).
2. Verify the response is 401 Unauthorized.
3. Then call with a correctly signed payload → 200 OK.
**Files involved:** `src/app/api/submissions/offline-sync/route.ts`
**How to verify:** 401 for tampered request, 200 for valid request.
**Consequence of skipping:** Anti-cheat protection is silently broken. Students could submit fake answers by bypassing HMAC.

---
### PRE-9: Verify Offline Sync Works End to End
**What to do:** Follow the Validator steps in Task 14 exactly — go offline, answer questions, come back online, verify all answers in Supabase. This is a repeat verification in a production environment (not just dev).
**Files involved:** `src/lib/offline/sync-engine.ts`, `src/app/api/submissions/offline-sync/route.ts`
**How to verify:** All Task 14 validator checks pass against the production Vercel deployment.
**Consequence of skipping:** Offline sync may work in dev but fail in production due to env var differences (especially `HMAC_SECRET`).

---
### PRE-10: Create Supabase Storage Buckets
**What to do:**
1. In Supabase dashboard → Storage → New bucket.
2. Create `avatars` bucket — Public, 5MB max file size.
3. Create `documents` bucket — Private, 10MB max file size.
4. Set RLS policies: `avatars` — anyone can read, authenticated users can upload their own. `documents` — only admin role can read/write.
**Files involved:** None — dashboard only.
**How to verify:** Upload a test file via Supabase dashboard → file appears in bucket. Attempt unauthenticated access to `documents` → 403.
**Consequence of skipping:** Any future avatar upload or PDF export feature will fail at the storage layer. BUG 4 will surface as a runtime error.

---
### PRE-11: Fix All KNOWN BUGS Marked HIGH or CRITICAL
**What to do:** Complete Tasks 3, 4, and 16 (BUG 3, 5, 6 are HIGH severity). Verify each with its respective validator.
**Files involved:** See individual task definitions above.
**How to verify:** All HIGH bugs resolved — no empty shells in student flow, lobby has polling fallback.
**Consequence of skipping:** Students experience broken flows: stuck in lobby, no results page, no exams list. Platform is not usable for real students.

---

## AFTER DEPLOYMENT

---
### POST-1: Monitor First 24 Hours
**What to do:**
1. Open Vercel dashboard → Functions tab → watch for error rate on `initSession`, `submitAnswer`, `submitExam` functions.
2. Open Supabase dashboard → Logs → watch for DB errors, connection pool exhaustion, slow queries.
3. Watch for Realtime connection errors in Supabase Logs.
4. Set up a Vercel alert for error rate > 1% on any function.
**Files involved:** None — monitoring only.
**How to verify:** After 24 hours: Vercel function error rate < 0.5%, no DB connection pool errors, no Realtime subscription errors.
**Consequence of skipping:** Silent production failures may go undetected for hours. Student data may be lost before the issue is identified.

---
### POST-2: Verify pg_cron Dashboard Refresh
**What to do:**
1. Check if a `pg_cron` job exists to refresh any materialized views: `SELECT * FROM cron.job;` in Supabase SQL editor.
2. If `dashboard_aggregates` materialized view exists: verify the cron job refreshes it at the expected interval.
3. If no cron job: verify the admin dashboard queries are performing acceptably without a materialized view (check Supabase slow query log).
**Files involved:** None — Supabase SQL editor only.
**How to verify:** Check Supabase logs for cron execution 24 hours after deployment. Dashboard KPI numbers should update within the cron interval.
**Consequence of skipping:** Dashboard charts show stale data. Admins see incorrect student counts or scores.

---
### POST-3: Check activity_logs for Errors
**What to do:**
1. Query `activity_logs` for any unexpected `action_type` values: `SELECT DISTINCT action_type FROM activity_logs;`
2. Check for any action_type that suggests a failed operation (e.g. `INIT_SESSION_ERROR` or similar).
3. Verify log volume is healthy — at 500 students taking one exam, expect approximately 500 `INIT_SESSION` rows and 500 `SUBMIT_EXAM` rows.
**Files involved:** None — Supabase SQL editor only.
**How to verify:** Zero error-pattern action_types in logs. Row counts match expected exam activity.
**Consequence of skipping:** Silent server-action errors may not be noticed until students report missing submissions.

---
### POST-4: Verify All Student Sessions Close Cleanly
**What to do:**
1. After the first exam session: `SELECT COUNT(*) FROM assessment_sessions WHERE closed_at IS NULL AND expires_at < now();`
2. This query finds sessions that expired without being explicitly closed (student closed tab without submitting).
3. If count > 0: these students did not submit. Cross-reference with `student_answers` to see if their answers were captured.
4. Implement a cleanup job if needed: `UPDATE assessment_sessions SET closed_at = expires_at WHERE closed_at IS NULL AND expires_at < now();`
**Files involved:** None — Supabase SQL editor only.
**How to verify:** After cleanup: zero rows match the query above. Monitor for the same issue in the next exam session.
**Consequence of skipping:** Open sessions accumulate in the DB. The monitor page shows ghost "In Progress" students who finished long ago. The next exam's session init may conflict with an unclosed old session.
