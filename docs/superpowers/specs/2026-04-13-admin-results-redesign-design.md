# Admin Results Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Complete replacement of the current `/admin/results` page and its data model with a four-screen drill-down flow.

---

## 1. Goal

Replace the existing flat "pick an assessment → see a table of submissions" Results page with a **drill-down hub** that treats each assessment as a first-class object the admin can inspect, evaluate, publish, and archive. The redesign adds:

- A card-grid hub with EXAM/TEST segmented toggle and status filter pills (Published / Yet to Evaluate / Archived)
- A per-assessment detail page with KPIs and the full question paper (answer key view)
- A full-page student list split into "Gave" and "Missed" sections
- A per-student answer sheet showing all questions, student picks, and correct answers side by side

The redesign also introduces a new **status lifecycle** at the paper level: `Yet to Evaluate → Published → Archived`, with archive as a soft-hide state.

---

## 2. Route Map

```
/admin/results                                              → Hub (card grid)
/admin/results/[paperId]                                    → Detail page
/admin/results/[paperId]/students                           → Student list (full page)
/admin/results/[paperId]/students/[studentId]               → Student answer sheet
```

Each level uses a breadcrumb that matches the URL depth. Back links navigate one level up.

---

## 3. Status Lifecycle

Assessments on the results hub exist in exactly one of three states at a time. A card can never appear in more than one filter view.

```
   exam paper CLOSED
          │
          ▼
   auto-calculate_results RPC runs on all submissions
          │
          ▼
   ┌──────────────────┐
   │ Yet to Evaluate  │  ← admin reviews auto-calculated results
   └──────────────────┘
          │
          │ admin publishes (sets result_published_at on all submissions)
          ▼
   ┌──────────────────┐
   │    Published     │  ← students can now see their results
   └──────────────────┘
          │
          │ admin archives
          ▼
   ┌──────────────────┐
   │     Archived     │  ← soft-hidden from default views, still in DB
   └──────────────────┘
```

### Database changes required

- **New column:** `exam_papers.archived_at timestamptz nullable`. When not null, the paper is archived.
  - Archive is a paper-level flag, not per-submission. Archiving archives the whole result set at once.
- The existing `submissions.result_published_at` column continues to drive the Published/Unpublished distinction.
- **"Yet to Evaluate" derivation:** a paper is in this state when `status = 'CLOSED'` AND `archived_at IS NULL` AND at least one of its submissions has `result_published_at IS NULL`. The admin hasn't published yet.
- **"Published" derivation:** a paper is in this state when `status = 'CLOSED'` AND `archived_at IS NULL` AND ALL of its submissions have `result_published_at IS NOT NULL`.
- **"Archived" derivation:** `archived_at IS NOT NULL`.

The three states are mutually exclusive.

### Server actions

A new server action file `src/app/actions/results.ts` gets these additions (and keeps the existing `publishResult`, `publishResults`, `unpublishResult`, `reEvaluateResults`):

- `archiveAssessmentResult(paperId: string)` → sets `exam_papers.archived_at = now()`, logs to `activity_logs` with action_type `ARCHIVE_RESULT`. Requires admin role.
- `unarchiveAssessmentResult(paperId: string)` → sets `archived_at = null`, logs `UNARCHIVE_RESULT`.

---

## 4. Design System

This redesign uses the existing MINDSPARK design tokens from `src/app/globals.css` with **one refinement**: text colors shift to darker charcoal shades for stronger visual weight. All hex values below are final.

### Color tokens (charcoal-shifted)

| Role | Hex | Notes |
|---|---|---|
| Primary brand | `#1A3829` | Forest Green 800 — unchanged |
| Hover primary | `#1E4A35` | unchanged |
| Active nav bg | `#EFFAF4` | Forest Green 50 — unchanged |
| Page bg | `#F8FAFC` | unchanged |
| Card surface | `#FFFFFF` | unchanged |
| Card border | `#E2E8F0` | unchanged |
| **Text primary** | `#0A0F1A` | **Darker near-black** (was #0F172A) |
| **Body text** | `#1E293B` | **Dark charcoal** (was #475569) |
| **Secondary text** | `#334155` | **Medium charcoal** (was #64748B) |
| **Micro labels** | `#475569` | **Charcoal** (was #94A3B8) |
| Muted subtle | `#94A3B8` | unchanged — only used for separators and true placeholders |
| Error red | `#991B1B` | Deeper red than #DC2626 |
| Published green (text) | `#14532D` | Deeper than #166534 |
| Exam blue (text) | `#1E3A8A` | Deeper than #1E40AF |

### Typography scale (+2px from current spec)

Base body is **16px**. Every element is bumped 2px from the current MINDSPARK spec.

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Page H1 | DM Sans | 30px | 700 | letter-spacing -0.018em |
| Detail H1 (exam title) | DM Sans | 28px | 700 | letter-spacing -0.018em |
| Profile name | DM Sans | 26px | 700 | letter-spacing -0.018em |
| Section H3 | DM Sans | 19px | 700 | letter-spacing -0.01em |
| Logo wordmark | DM Sans | 20px | 700 | letter-spacing -0.01em |
| Body default | DM Sans | 16px | 400/500 | 1.5 line-height |
| Nav items | DM Sans | 16px | 500/600 | |
| Table cells | DM Sans | 15px | 500 | |
| Name cells | DM Sans | 16px | 600 | |
| Meta text | DM Sans | 15px | 500 | |
| Labels (uppercase) | DM Sans | 13px | 700 | letter-spacing 0.06–0.08em |
| Micro labels | DM Sans | 12–13px | 700 | uppercase, tracking tight |
| Card title (hub) | DM Sans | 17px | 700 | letter-spacing -0.012em |
| KPI value | DM Mono | 34px | 700 | tabular-nums |
| Profile score | DM Mono | 42px | 700 | tabular-nums |
| Table number | DM Mono | 15–16px | 700 | tabular-nums |
| Question sequence | DM Mono | 16px | 600 | letter-spacing 0.02em |
| Option value | DM Mono | 14–15px | 500 | |

### Component tokens

- **Card radius:** 14–16px (cards use 14, panels/hero cards use 16)
- **Dialog radius:** 18px
- **Button radius:** 10–12px
- **Pill radius:** 9999px (full pill)
- **Card shadow sm:** `0 1px 3px rgba(10, 15, 26, 0.06)`
- **Card shadow hover:** `0 12px 24px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)`
- **Frame shadow:** `0 8px 32px rgba(10, 15, 26, 0.08)`
- **Interactive target minimum:** 40×40px
- **Icons:** lucide-react line icons, 1.75 stroke width, 18×18 in sidebar, 16×16 inline, 14×14 in buttons

### Sidebar additions (global)

**New sidebar footer** — applies to the entire admin layout, not just results pages:

- User card at bottom: 36×36 forest-green avatar with initials, name (15/600 `#0A0F1A`), role (13 `#475569`)
- Sign Out button below the user card: white bg, slate-200 border, 10px radius, log-out icon + "Sign Out" text, hover state turns red-50 bg + red-700 text
- Border-top separator `#E2E8F0` above the footer
- The sidebar becomes `display: flex; flex-direction: column` so the footer uses `margin-top: auto`

### Hub card hover state

Result cards on the hub use a modern lift effect:
- Default: `border: 1px solid #E2E8F0; transform: none`
- Hover: `border-color: #1A3829; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08)`
- Hover also reveals a 3px forest-green accent bar on the left edge (via `::before`, `opacity: 0 → 1`, transition 180ms)

---

## 5. Screen 1 — Results Hub

**Route:** `/admin/results`
**Purpose:** Browse all closed assessments filtered by EXAM/TEST, by lifecycle status, and by date range. Search within the current filter.

### Layout (top to bottom)

1. **Sidebar** — global admin sidebar with "Results" nav item active. Sidebar footer with user card and Sign Out button.

2. **Top header** — breadcrumb (`Admin › Results`), bell + help + avatar on the right.

3. **Page title** — "Results" H1 (30/700 `#0A0F1A`) with an optional subtitle ("Manage evaluation, publish results, and review student performance across assessments.")

4. **EXAM / TEST segmented toggle** — inline flex, 4px inner padding, `#F1F5F9` bg with `#E2E8F0` border, 12px radius. Active segment: white bg, subtle shadow, `#0A0F1A` text. Controls which type of assessment the hub is showing. Each toggle state has its own filter counts (a paper is counted in EXAM or TEST, never both).

5. **Filter row** — horizontal flex:
   - **Status pills** (left, three pills):
     - Published — count pill shows number of published papers for current type
     - Yet to Evaluate — count pill
     - Archived — count pill
     - Active pill is solid `#1A3829` bg with white text. Inactive pills are white bg with slate border.
     - Selecting a pill replaces the URL query param `?status=published|pending|archived`
   - **Spacer** (flex: 1)
   - **Date filter** (right) — button with calendar icon + "Last 30 days" text + chevron. On click, opens a popover with two tabs:
     - "Single date" — shows one calendar, picks a specific day
     - "Date range" — shows two calendars or a range picker, picks a from-to range
     - Selection updates the URL query param `?from=…&to=…`

6. **Search row** — below the filter row, a single search input (h-42, 12px radius, `#E2E8F0` border, max-width 420px, search icon left-padded). Placeholder: "Search assessments by name…". Filters by `exam_papers.title` (case-insensitive substring). Debounced 200ms.

7. **Card grid** — `grid-template-columns: repeat(3, 1fr)`, 20px gap. Responsive: 2 columns on md, 1 on sm.

### Card anatomy

```
┌─────────────────────────────────────┐
│ [Published] [Exam]                  │ ← badge row (status + type)
│                                     │
│ Q3 Mental Arithmetic                │ ← title (17/700 -0.012em)
│ ◆ Level 3 · ⏱ 30 min · 20 questions│ ← meta row with inline icons
│                                     │
│ ─────────────────────────────────── │ ← divider
│ GAVE    │ MISSED   │ AVG           │ ← stat labels (10/700 uppercase)
│   22    │    2     │   17/20        │ ← stat values (20/700 DM Mono)
└─────────────────────────────────────┘
```

- Card radius **16px**, padding 24px
- Status badge colors (pill with status dot):
  - Published: `#DCFCE7` bg, `#14532D` text, 5×5 `#14532D` dot before text
  - Yet to Evaluate: `#FEF3C7` bg, `#92400E` text (amber theme)
  - Archived: `#F1F5F9` bg, `#334155` text (neutral)
- Type badge: bordered rounded pill
  - EXAM: `#EFF6FF` bg, `#1E3A8A` text, `#DBEAFE` border
  - TEST: `#F5F3FF` bg, `#6D28D9` text, `#EDE9FE` border
- Avg stat uses `17/20` format (correct/total across all submissions), not percentage
- Avg stat color: `#1A3829` for normal, `#CBD5E1` ("—") when Avg Score is unavailable (no graded submissions yet, e.g. Yet to Evaluate state)

### Filter behavior

- Only ONE status pill is active at a time. Status is a hard filter — the grid shows only cards matching the selected status. Users cannot mix "Published" and "Yet to Evaluate" in one view.
- The EXAM/TEST toggle is independent and filters by `exam_papers.type`.
- Search filters within the current filtered set.
- Date filter applies to `exam_papers.created_at` (or `closed_at` if we prefer — to be decided in implementation plan).

### Data flow

Page is a Server Component. Queries:

```ts
// 1. Get count by status for the filter pills
const counts = await supabase.rpc('results_hub_counts', {
  p_institution_id: institutionId,
  p_type: type  // 'EXAM' | 'TEST'
});
// Returns { published: n, pending: n, archived: n }

// 2. Get papers for the current filter
const { data: papers } = await supabase
  .from('exam_papers')
  .select('id, title, type, level_id, duration_minutes, created_at, closed_at, archived_at')
  .eq('institution_id', institutionId)
  .eq('type', type)
  .eq('status', 'CLOSED')
  .ilike('title', `%${search}%`)
  .gte('created_at', from)
  .lte('created_at', to);

// 3. For each paper, fetch aggregate stats (gave/missed/avg_score)
//    via an RPC `results_hub_paper_stats(paper_ids uuid[])` that returns:
//    { paper_id, gave_count, missed_count, total_enrolled, avg_score_num, avg_score_denom }
```

The RPC approach avoids N+1 queries. `missed_count` = enrolled students in the paper's level who have no submission row for this paper.

---

## 6. Screen 2 — Result Detail

**Route:** `/admin/results/[paperId]`
**Purpose:** See the full context of one assessment: aggregate stats, the question paper (answer key), and jump-off points to student list or CSV export.

### Layout

1. **Sidebar + top header** — same global layout. Breadcrumb now shows `Admin › Results › Q3 Mental Arithmetic`.

2. **Back link** — "← Back to Results" above the page content.

3. **Detail header card** — white card with 4px forest-green left accent bar:
   - Badge row: status badge + type badge
   - Title: exam title (28/700 -0.018em `#0A0F1A`)
   - Meta row: Level · Duration · Question count · Published date (all with inline lucide icons)
   - Top-right action: **"Archive" button** (outline, slate-200 border, 42px tall). On click: calls `archiveAssessmentResult`, shows toast, router.refresh(). If already archived, button text becomes "Unarchive" and action flips.

4. **KPI row** — 4 cards in a grid (16px gap):
   - **Students Gave** — value `22`, sub "of 24 enrolled students", blue icon tint (people)
   - **Students Missed** — value `2`, sub "did not attend", red icon tint (x-circle)
   - **Level** — value `3`, sub "curriculum level", neutral slate icon
   - **Average Score** — value `17/20` (NOT percentage), sub "across all submissions", green icon tint (trending-up). Shows "—" if no graded submissions yet.

   Each KPI card: white bg, 14px radius, 20px padding, `#E2E8F0` border, `shadow-sm`. Label 13/700 uppercase `#334155`. Value 34/700 DM Mono `#0A0F1A`. Sub 14/500 `#334155`. Icon badge 32×32 in a tinted rounded square.

5. **Question Paper section**:
   - Section header: "Question Paper" H3 (19/700 `#0A0F1A`) + sub line "20 questions · sequence shown as flashed during the exam"
   - Table card with 7 columns:
     - `#` (60px, DM Mono 15/700 `#475569`)
     - `Sequence` — flash format like `245 | -242 | +466` (DM Mono 16/600 `#0A0F1A`, pipes in `#94A3B8`)
     - `A` / `B` / `C` / `D` — centered columns, option values (DM Mono 15/500 `#1E293B`)
     - `Correct` (120px, centered) — the correct letter inside a green pill (`#DCFCE7` bg, `#14532D` text, check icon + letter in DM Mono 13/700)
   - Row hover: `#FAFBFC` bg tint
   - This is a **read-only answer key view**. No per-student data here.

6. **CTA row** (bottom, flex row, 12px gap):
   - **"Export as CSV"** (outline button, 50px tall, download icon + text)
   - **"View Student List (24)"** (primary button, 50px tall, forest green, people icon + text + arrow-right icon). The count in parens is total enrolled.

### TEST-type question paper variant

For TEST (Flash Anzan) papers:
- The Question Paper table stays the same 7-column shape
- The Sequence column shows the flash numbers separated by pipes exactly like EXAM papers — this is the actual flash sequence, not a prose question
- After the flash sequence in the app, the student is shown 4 MCQ options A/B/C/D — those are the same columns shown here
- An additional mini KPI could be added later for DPM average, but we're deferring that for now to keep EXAM and TEST unified

### CSV Export contents

Single CSV file with four sections stacked vertically, separated by blank rows and section header rows:

```
ASSESSMENT INFO
Title,Q3 Mental Arithmetic
Type,EXAM
Level,3
Duration,30 min
Total Questions,20
Status,Published
Published At,2026-04-10
Gave,22
Missed,2
Enrolled,24
Average Score,17/20

QUESTION PAPER
#,Sequence,A,B,C,D,Correct
01,"245 | -242 | +466",449,469,479,489,B
02,"892 | -456 | +124",540,550,560,570,C
...

STUDENTS WHO GAVE
S.No,Roll No,Name,Score
01,MS-L3-001,Aditi Sharma,19/20
02,MS-L3-002,Rahul Verma,18/20
...

STUDENTS WHO MISSED
S.No,Roll No,Name
01,MS-L3-006,Meera Reddy
02,MS-L3-010,Ishaan Gupta
```

Export endpoint: `GET /api/admin/results/[paperId]/export.csv`. Streams a `text/csv` response. No per-student answer data in the export — that stays gated behind the UI drill-down.

---

## 7. Screen 3 — Student List

**Route:** `/admin/results/[paperId]/students`
**Purpose:** See every student who was supposed to take this assessment, split into "Gave" and "Missed" buckets, with a button to drill into each student's answer sheet.

### Layout

1. **Sidebar + top header** — breadcrumb now 4 levels: `Admin › Results › Q3 Mental Arithmetic › Students`

2. **Back link** — "← Back to Q3 Mental Arithmetic"

3. **Page header** — uppercase label "STUDENT LIST" + H1 exam title (30/700) + sub meta line ("Level 3 · Published Apr 10, 2026 · 22 of 24 students attempted")

4. **KPI row (4 cards)** — Gave / Missed / Enrolled / Average Score. Average Score shown as `17/20` format (NOT percentage). Same visual treatment as Screen 2.

5. **Filter row** — search input (max-width 420px) + sort button. Search filters both the "Gave" and "Missed" tables simultaneously by name OR roll number.

6. **"Gave the Exam" section**:
   - Header: green dot + "Gave the Exam" H3 + count pill (`22`)
   - Table card with columns: `S.No` | `Roll No.` | `Name` | `Score` | (action column)
   - Score format: `19/20` (correct out of total), DM Mono 18/700. Color coded:
     - `good` (≥80%): `#1A3829` text
     - `mid` (60–79%): `#92400E` text
     - `bad` (<60%): `#991B1B` text
     - The `/20` denominator is in lighter weight `#475569`
   - Action column: "See Answer Sheet" button (outline, 10px radius, eye icon + text, hover: forest-green-50 bg + forest-green border + forest-green text)
   - **Initially shows only 8 rows**, followed by a full-width "Show all 22 students" expand button at the bottom of the table:
     - Row has `#FAFBFC` bg
     - Button contains a 22×22 circular green `+` icon on the left + "Show all [count] students" label + the count in DM Mono
     - On click: client-side state expands the list to show all rows (no navigation)
     - Once expanded, the button disappears

7. **"Missed the Exam" section**:
   - Header: red dot + "Missed the Exam" H3 + count pill (`2`)
   - Table card with `missed` variant styling: `#FECACA` border, `#FEF2F2` header bg, `#991B1B` header text
   - Columns: `S.No` | `Roll No.` | `Name` only — no score column, no action column
   - No expand button needed here (typically a small list)
   - **No judgment or per-student commentary.** Just the facts.

### Data flow

Page is a Server Component. Queries:

```ts
// 1. Get the paper metadata
const { data: paper } = await supabase
  .from('exam_papers')
  .select('id, title, level_id, type, duration_minutes, status, closed_at, result_published_at')
  .eq('id', paperId)
  .single();

// 2. Get all enrolled students for this paper's level
const { data: enrolled } = await supabase
  .from('students')
  .select('id, roll_number, full_name')
  .eq('level_id', paper.level_id)
  .eq('institution_id', institutionId)
  .order('roll_number');

// 3. Get all submissions for this paper
const { data: submissions } = await supabase
  .from('submissions')
  .select('id, student_id, score, total_questions, result_published_at')
  .eq('paper_id', paperId)
  .not('completed_at', 'is', null);

// 4. Client-side partition: gave = enrolled ∩ submissions, missed = enrolled - gave
```

---

## 8. Screen 4 — Student Answer Sheet

**Route:** `/admin/results/[paperId]/students/[studentId]`
**Purpose:** See every question this student attempted, their pick, the correct answer, and a visual indicator of wrong answers.

### Layout

1. **Sidebar + top header** — breadcrumb 5 levels: `Admin › Results › Q3 Mental Arithmetic › Students › Aditi Sharma`

2. **Back link** — "← Back to Student List"

3. **Profile card** — white card with 4px forest-green left accent bar, flex row:
   - **Left:** 72×72 forest-green avatar with white DM Sans 26/700 initials
   - **Middle:** uppercase label "ANSWER SHEET", student name H1 (26/700 `#0A0F1A`), meta row (roll, level, exam title, attempted date — all with lucide icons)
   - **Right:** score block separated by a 1px vertical divider
     - Label "FINAL SCORE" (11/700 uppercase `#475569`)
     - Value `19/20` in DM Mono 42/700 forest-green with smaller `/20` in `#334155`
     - Sub line "95% accuracy" with the percentage in DM Mono forest green bold

4. **Mini KPI row (3 cards)**:
   - **Correct** — green bg icon (check), value `19`
   - **Wrong** — red bg icon (x), value `1`
   - **Time Taken** — blue bg icon (clock), value `26:42` (MM:SS format from submission completion time - start time)

5. **Section header** — "Answer Sheet" H3 + sub "20 questions" + legend on the right:
   - Correct swatch (white bg, `#E2E8F0` border) + label
   - Wrong swatch (`#FEF2F2` bg, `#FECACA` border) + label

6. **Answer sheet table** — 8 columns:

   | Column | Width | Content |
   |---|---|---|
   | `#` | 62 | Question number, DM Mono 15/700 |
   | `Sequence` | flex | Flash format, DM Mono 16/600 |
   | `A` | 90 | Option A value in a boxed pill |
   | `B` | 90 | Option B value in a boxed pill |
   | `C` | 90 | Option C value in a boxed pill |
   | `D` | 90 | Option D value in a boxed pill |
   | `Student` | 110 | Student's pick in a status pill |
   | `Correct` | 110 | Correct answer in a green pill |

   **Option box states:**
   - Default: white bg, `#E2E8F0` border, `#1E293B` text, 8px radius, 6×10 padding, DM Mono 14/500
   - Student-picked (correct): `#EFFAF4` bg, `#1A3829` border, `#1A3829` text, font-weight 700
   - Student-picked (wrong): `#FEE2E2` bg, `#DC2626` border, `#991B1B` text, font-weight 700

   **Answer pill states:**
   - Student right: `#DCFCE7` bg, `#14532D` text, check icon before letter
   - Student wrong: `#FEE2E2` bg, `#991B1B` text, x icon before letter
   - Correct (always green): `#DCFCE7` bg, `#14532D` text, letter only

   **Wrong row tint:** When the student got a question wrong, the entire `<tr>` has `background: #FEF2F2` and `border-bottom-color: #FEE2E2`. This makes it immediately scannable at a glance to spot problem areas.

7. **Summary bar** (below table): white card with a sentence "Student answered **19 out of 20** questions correctly — **95% accuracy**" on the left, and a "Print" button on the right.

### Data flow

```ts
// 1. Get the submission for this student + paper
const { data: submission } = await supabase
  .from('submissions')
  .select('id, student_id, paper_id, score, total_questions, completed_at, started_at, percentage')
  .eq('paper_id', paperId)
  .eq('student_id', studentId)
  .single();

// 2. Get the questions for this paper (with correct answers)
const { data: questions } = await supabase
  .from('questions')
  .select('id, question_index, content, options, correct_option')
  .eq('paper_id', paperId)
  .order('question_index');

// 3. Get the student's answers
const { data: answers } = await supabase
  .from('student_answers')
  .select('question_id, selected_option')
  .eq('submission_id', submission.id);

// 4. Client-side: for each question, join with the student's selected_option and the correct_option
```

The `questions.content` field currently stores arbitrary JSON — for a flash-format exam it should store the sequence like `[245, -242, 466]`. The render function on the client joins this with ` | ` separators. For EXAM type, the content may also represent a vertical arithmetic equation — we'll render both the same way (as a sequence with pipe separators) since that's what the user requested.

### Time Taken calculation

`submission.completed_at - submission.started_at`, formatted as `MM:SS` (or `HH:MM:SS` if > 1 hour). If `started_at` is null, show "—".

---

## 9. What Stays Unchanged

- All existing Supabase tables except for the new `exam_papers.archived_at` column
- The `calculate_results` RPC — still triggers on CLOSED state
- The student-facing results page (`/student/results`) — out of scope for this redesign
- Authentication, RBAC, institution scoping — use existing patterns from `requireRole('admin')`
- The existing component library — shadcn/ui, recharts, @tanstack/react-table
- Global admin layout shell (`src/app/(admin)/layout.tsx`) — gets the sidebar footer addition but keeps its existing structure

---

## 10. Files to Change

### New files

```
src/app/(admin)/admin/results/page.tsx                                  (rewrite)
src/app/(admin)/admin/results/[paperId]/page.tsx                        (new)
src/app/(admin)/admin/results/[paperId]/students/page.tsx               (new)
src/app/(admin)/admin/results/[paperId]/students/[studentId]/page.tsx   (new)
src/app/api/admin/results/[paperId]/export.csv/route.ts                 (new)

src/components/results/hub-client.tsx                                   (new)
src/components/results/result-card.tsx                                  (new)
src/components/results/status-filter-pills.tsx                          (new)
src/components/results/date-range-filter.tsx                            (new)
src/components/results/detail-header.tsx                                (new)
src/components/results/kpi-card.tsx                                     (new or reuse dashboard/kpi-card.tsx)
src/components/results/question-paper-table.tsx                         (new)
src/components/results/student-list-section.tsx                         (new)
src/components/results/answer-sheet-table.tsx                           (new)
src/components/results/profile-card.tsx                                 (new)
```

### Modified files

```
src/app/actions/results.ts                     — add archive/unarchive actions
src/app/(admin)/layout.tsx                     — add sidebar footer with sign-out
src/components/admin/admin-sidebar.tsx         — wire up sidebar footer
src/lib/types/exam.ts                          — add `archived_at` to the ExamPaper type
```

### Database migration (via Supabase SQL editor — no migration files per CLAUDE.md)

```sql
-- Add archived_at column to exam_papers
ALTER TABLE exam_papers ADD COLUMN archived_at timestamptz;
CREATE INDEX idx_exam_papers_archived_at ON exam_papers(archived_at) WHERE archived_at IS NOT NULL;

-- RPC for hub counts
CREATE OR REPLACE FUNCTION results_hub_counts(p_institution_id uuid, p_type text)
RETURNS TABLE(published bigint, pending bigint, archived bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*) FILTER (WHERE ep.archived_at IS NULL AND NOT EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.paper_id = ep.id AND s.completed_at IS NOT NULL AND s.result_published_at IS NULL
    )) AS published,
    COUNT(*) FILTER (WHERE ep.archived_at IS NULL AND EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.paper_id = ep.id AND s.completed_at IS NOT NULL AND s.result_published_at IS NULL
    )) AS pending,
    COUNT(*) FILTER (WHERE ep.archived_at IS NOT NULL) AS archived
  FROM exam_papers ep
  WHERE ep.institution_id = p_institution_id
    AND ep.type = p_type
    AND ep.status = 'CLOSED';
$$;

-- RPC for per-paper stats on the hub
CREATE OR REPLACE FUNCTION results_hub_paper_stats(p_paper_ids uuid[])
RETURNS TABLE(
  paper_id uuid,
  gave_count bigint,
  missed_count bigint,
  total_enrolled bigint,
  avg_score_num numeric,
  avg_score_denom numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH paper_levels AS (
    SELECT id AS paper_id, level_id, institution_id
    FROM exam_papers
    WHERE id = ANY(p_paper_ids)
  ),
  enrolled AS (
    SELECT pl.paper_id, COUNT(s.id) AS total
    FROM paper_levels pl
    JOIN students s ON s.level_id = pl.level_id AND s.institution_id = pl.institution_id
    GROUP BY pl.paper_id
  ),
  gave AS (
    SELECT sub.paper_id, COUNT(*) AS total, AVG(sub.score) AS avg_score, MAX(sub.total_questions) AS total_qs
    FROM submissions sub
    WHERE sub.paper_id = ANY(p_paper_ids) AND sub.completed_at IS NOT NULL
    GROUP BY sub.paper_id
  )
  SELECT
    pl.paper_id,
    COALESCE(g.total, 0) AS gave_count,
    COALESCE(e.total, 0) - COALESCE(g.total, 0) AS missed_count,
    COALESCE(e.total, 0) AS total_enrolled,
    ROUND(COALESCE(g.avg_score, 0)) AS avg_score_num,
    COALESCE(g.total_qs, 20) AS avg_score_denom
  FROM paper_levels pl
  LEFT JOIN enrolled e USING(paper_id)
  LEFT JOIN gave g USING(paper_id);
$$;
```

(The SQL above is a starting draft — will be validated against the live DB during implementation.)

---

## 11. Out of Scope for This Spec

- **Student-facing results page** (`/student/results`) — unchanged
- **DPM metric for TEST results** — deferred. Screen 2 KPI row stays unified for EXAM and TEST. A DPM column can be added to the student answer sheet later.
- **Bulk actions across multiple assessments** on the hub — not in this redesign. Hub cards are single-click to drill in. Bulk publish/archive at the hub level is a future enhancement.
- **Re-evaluate flow** — the existing `reEvaluateResults` server action is preserved but no UI is added in this redesign. If admin needs to re-evaluate, they use the existing flow (to be relocated in a future pass).
- **Pagination** on the student list or answer sheet — not needed at current scale. The "Show all" expand button replaces pagination on the student list.

---

## 12. Open Questions

None at the moment. The user has confirmed:

- Hub card represents one assessment (not one student)
- Three-state lifecycle: Published → Yet to Evaluate → Archive
- Question paper table format with `245 | -242 | +466` syntax
- Color-coded wrong-row tint on the answer sheet (Option C: both tinted row AND inline correct answer)
- No judgment for missed students
- CSV export as a single stacked file
- Unified format for EXAM and TEST (same answer sheet shape)
- Search filters assessment titles only
- Sign-out button restored to sidebar
- Score format: `scored/total` everywhere (not percentages)
- Student list is its own full page (not a drawer)
- Three-page drill: hub → detail → students → answer sheet

---

## Appendix A — Visual Reference

Browser mockups saved in `.superpowers/brainstorm/223-1776020821/content/`:

- `hub-layout-v4.html` — Results Hub (final)
- `detail-layout-v3.html` — Result Detail (final)
- `students-page-v2.html` — Student List (final)
- `answer-sheet.html` — Student Answer Sheet (final)
