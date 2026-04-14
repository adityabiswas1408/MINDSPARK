# Admin Dashboard Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Replace the current `/admin/dashboard` with an operational command center focused on real-time activity rather than analytics.

---

## 1. Goal

Transform the admin dashboard from an analytics-heavy overview (charts, trends, sparklines) into an **operational command center** that answers the question *"What's happening in my institution right now?"* The admin lands here, instantly sees active live assessments, and can jump into monitoring them with one click.

Charts and multi-month trends are removed from this page. They can live on a future `/admin/analytics` sub-page if needed. The dashboard is a daily-use operational tool, not a reporting surface.

---

## 2. Layout

Single page at `/admin/dashboard`. Top-down structure:

1. Page header (H1 + dynamic subtitle)
2. KPI row (3 cards)
3. Main grid (2/3 left, 1/3 right)
   - Left: **Active Live Assessments** stack
   - Right: **Activity Feed**

No footer. No charts. No sparklines. No level-distribution bar charts.

---

## 3. Page Header

```
Dashboard
● 48 students active across 3 live exams right now
```

- **H1:** "Dashboard" in DM Sans 30/700 color `#0A0F1A`, letter-spacing -0.018em. Matches the breadcrumb (no "Command Center" rebranding).
- **Dynamic subtitle:** DM Sans 15/500 `#1E293B` with a pulsing red dot on the left.
- The subtitle is computed live from two values:
  - **Student count** = count of active `assessment_sessions` WHERE `closed_at IS NULL` for this institution's LIVE papers
  - **Live exam count** = count of `exam_papers` WHERE `status = 'LIVE'` AND `institution_id = currentInstitution`
- Both numbers rendered in DM Mono 700 tabular inline with the sentence: "**48** students active across **3** live exams right now"
- **Empty state subtitle:** when `liveExamCount === 0`, the subtitle becomes "No live exams running right now. Check scheduled assessments on the Assessments page." (no red dot)

---

## 4. KPI Row — 3 Cards

Grid: `repeat(3, 1fr)`, 16px gap, 28px bottom margin.

### Card anatomy

Each KPI card is a flat horizontal layout (no sparkline, no trend arrow, no secondary chart):

```
┌──────────────────────────────┐
│ LABEL                  [ICON]│
│ 247                          │
└──────────────────────────────┘
```

- White bg, `#E2E8F0` border 1px, **14px radius**, `box-shadow: 0 1px 3px rgba(10,15,26,0.06)`, padding 22×24
- **flex row, items-center, justify-between**
- Left side: label (DM Sans 13/700 uppercase `#334155` letter-spacing 0.06em) + value (DM Mono 36/700 tabular `#0A0F1A`, line-height 1, letter-spacing -0.02em)
- Right side: 44×44 rounded-icon chip with a 12px radius, tinted background, centered lucide icon (20×20, stroke 1.75)

### The three KPIs

| KPI | Value source | Icon | Icon tint |
|---|---|---|---|
| **Total Students** | `SELECT count(*) FROM students WHERE institution_id = $1` | `users` | blue (`#EFF6FF` bg, `#1E3A8A` icon) |
| **Active Exams** | `SELECT count(*) FROM exam_papers WHERE institution_id = $1 AND status = 'LIVE'` | `book-open` | amber (`#FEF3C7` bg, `#92400E` icon) |
| **Live Now** | `SELECT count(*) FROM assessment_sessions WHERE student_id IS NOT NULL AND closed_at IS NULL AND paper_id IN (live papers)` | `radio` | green (`#EFFAF4` bg, `#1A3829` icon) |

### Live Now special treatment

The **Live Now** KPI gets two visual differentiators because it's the most time-sensitive metric:

1. Value text color is forest green `#1A3829` instead of charcoal `#0A0F1A`
2. A small "● Active" pulse pill sits below the value — `#DCFCE7` bg, `#14532D` text, DM Sans 11/700 uppercase, 4px×10px padding, 6px dot that softly pulses 2s ease-in-out. Only shown when value > 0; hidden when zero.

### Removed from current implementation

- **Avg Score KPI** — removed. Belongs on analytics, not the command center.
- **Sparklines** — removed from all KPI cards. Dashboard is "right now", not "last 7 days".
- **Trend badges** — removed.

---

## 5. Main Grid

Two columns: `grid-template-columns: 2fr 1fr`, 24px gap, `align-items: start`.

On smaller screens (<1280px viewport), the grid collapses to single column with the Active Live Assessments stack first, Activity Feed second.

---

## 6. Active Live Assessments (Left Column)

### Section header

```
ACTIVE LIVE ASSESSMENTS          [● 3 Running]
```

- Uppercase label on the left: DM Sans 13/700 `#475569`, letter-spacing 0.1em
- Right-aligned count pill: forest green 50 bg (`#EFFAF4`), green 200 border (`#B7E4C7`), `#1A3829` text, 4×12 padding, 9999 radius, DM Sans 12/700, with a 6×6 dark green dot before the number

### Assessment card (one per live exam)

Vertical stack (`flex-direction: column`, 12px gap). Each card:

```
┌────────────────────────────────────────────────────────┐
│ [ICON]  Q3 Mental Arithmetic                 [Monitor] │
│         ◆ Level 3 · ⏱ 30 min · ● 22 active             │
└────────────────────────────────────────────────────────┘
```

- White bg, `#E2E8F0` border 1px, **16px radius**, padding 18×20
- `box-shadow: 0 1px 3px rgba(10,15,26,0.04)`
- Flex row, items-center, justify-between, 16px gap
- Hover state: border `#1A3829`, `transform: translateY(-1px)`, shadow deepens to `0 8px 20px rgba(15,23,42,0.06)`, a 3px forest-green accent bar reveals on the left edge via `::before` (opacity 0 → 1, 180ms transition)
- Cursor pointer, entire card is clickable (same destination as Monitor button)

### Card left section

- **Type icon badge** — 44×44 rounded 12px square:
  - EXAM: `#EFF6FF` bg, `#1E3A8A` icon (`clipboard-list` lucide)
  - TEST: `#F5F3FF` bg, `#6D28D9` icon (`zap` lucide)
- **Body:**
  - Title: DM Sans 16/700 `#0A0F1A`, letter-spacing -0.008em, 4px margin-bottom
  - Meta row: flex row, items-center, 10px gap, DM Sans 13/500 `#475569`
    - Level pill: lucide `layers` icon 13×13 + "Level 3"
    - Separator: `·` in `#CBD5E1`
    - Duration: lucide `clock` icon 13×13 + "30 min"
    - Separator: `·`
    - **Active count badge:** `#FEE2E2` bg, `#991B1B` text, 9999 radius, 2×8 padding, DM Mono 12/700 tabular, with a 5×5 red dot before the text that pulses 2s ease-in-out. Example: "● 22 active"

### Card right section — Monitor button

- Primary button: `#1A3829` bg, white text, 10px radius, height 40, padding 0 16, DM Sans 14/600
- Icon: arrow-right lucide 15×15 after the text
- Box-shadow: `0 1px 3px rgba(26, 56, 41, 0.3)`
- Hover: `#0F2319` bg (darker)
- On click: navigates to `/admin/monitor/[paperId]`
- The whole card is also clickable to the same destination — the button is just a visible affordance

### Data source

```ts
const { data: livePapers } = await supabase
  .from('exam_papers')
  .select('id, title, type, level_id, duration_minutes, levels(name)')
  .eq('institution_id', institutionId)
  .eq('status', 'LIVE')
  .order('opened_at', { ascending: false });

// For each paper, fetch live session count
const { data: activeCountsPerPaper } = await supabase
  .from('assessment_sessions')
  .select('paper_id')
  .in('paper_id', livePapers.map(p => p.id))
  .not('student_id', 'is', null)
  .is('closed_at', null);
// Then client-side groupBy.
```

### Empty state (no live exams)

When `livePapers.length === 0`, render a single centered empty card:

- Centered, max-width 480px, white bg, `#E2E8F0` border, 16px radius, 48px padding, text-center
- Lucide `inbox` icon 40×40 `#CBD5E1`
- Title: "No live assessments right now" DM Sans 18/700 `#0A0F1A`, 12px margin-top
- Subtitle: "Schedule a new assessment or start an existing one to see activity here." DM Sans 14/500 `#475569`, 6px margin-top, max-width 320px
- Footer link: "Go to Assessments →" DM Sans 13/600 `#1A3829`, 16px margin-top, clickable, navigates to `/admin/assessments`

---

## 7. Activity Feed (Right Column)

### Card container

White bg, `#E2E8F0` border 1px, **16px radius**, overflow-hidden, `box-shadow: 0 1px 3px rgba(10,15,26,0.04)`.

### Feed header

```
ACTIVITY FEED                               [🕐]
```

- Padding 18×20, bottom border `#F1F5F9`
- Flex row, items-center, justify-between
- Label: "ACTIVITY FEED" DM Sans 13/700 `#475569` uppercase, letter-spacing 0.1em
- Right icon: lucide `clock` 18×18 `#CBD5E1` (decorative)

### Feed body — 5 items max

- Padding 4×8
- Each item:
  - Flex row, 14px gap, padding 14×12, rounded 10px
  - Hover: `#FAFBFC` bg
  - Items separated by 1px `#F1F5F9` top borders (except the first item)

### Feed item anatomy

```
[ICON]  Aditi Sharma
        Completed "Q3 Mental Arithmetic" with 19/20 score
        2 MINS AGO
```

- **Icon chip (36×36, 10px radius, centered icon 16×16 stroke 2):** Color depends on event kind:

| Event kind | Icon | Icon chip color |
|---|---|---|
| Student completion | `check` | green (`#DCFCE7` bg, `#14532D` icon) |
| Student submission | `upload` | green (`#DCFCE7` bg, `#14532D` icon) |
| Student progression (level up) | `trending-up` | purple (`#F5F3FF` bg, `#6D28D9` icon) |
| Admin action — publish | `dial` / `zap` | blue (`#EFF6FF` bg, `#1E3A8A` icon) |
| Admin action — create | `plus` | blue (`#EFF6FF` bg, `#1E3A8A` icon) |
| Admin action — archive | `archive` | slate (`#F1F5F9` bg, `#334155` icon) |
| System warning / auto-close | `lock` | red (`#FEE2E2` bg, `#991B1B` icon) |

- **Text block (flex 1, min-width 0):**
  - **Actor name:** DM Sans 14/700 `#0A0F1A`. For admin-initiated events, actor is "You". For system events, actor is "System". For student events, actor is the student's full name.
  - **Description:** DM Sans 13/500 `#334155`, line-height 1.4. Includes the relevant object name in quotes.
  - **Timestamp:** DM Mono 11/600 `#64748B`, uppercase, letter-spacing 0.06em, 4px margin-top. Relative time via `date-fns formatDistanceToNow`: "2 MINS AGO", "1 HOUR AGO", "3 HOURS AGO", etc.

### Feed footer

- Padding 14×16, top border `#F1F5F9`, `#FAFBFC` bg, text-center
- Text link: "VIEW FULL ACTIVITY LOG →" DM Sans 12/700 `#1A3829`, uppercase, letter-spacing 0.08em, no underline
- On click: navigates to `/admin/activity-log` (future page)

### Data source — mixed feed

The feed combines two sources and interleaves by timestamp:

```ts
// Source 1: student events from submissions
const { data: studentEvents } = await supabase
  .from('submissions')
  .select('id, student_id, paper_id, score, total_questions, completed_at, students(full_name), exam_papers(title)')
  .eq('exam_papers.institution_id', institutionId)
  .not('completed_at', 'is', null)
  .order('completed_at', { ascending: false })
  .limit(10);

// Source 2: admin audit events from activity_logs
const { data: adminEvents } = await supabase
  .from('activity_logs')
  .select('id, user_id, action_type, entity_type, entity_id, metadata, timestamp')
  .eq('institution_id', institutionId)
  .order('timestamp', { ascending: false })
  .limit(10);

// Client-side: normalize both to FeedItem shape, merge, sort by timestamp desc, slice(0, 5).
```

FeedItem shape:

```ts
type FeedItem = {
  id: string;
  kind: 'student-complete' | 'student-submit' | 'student-level-up'
      | 'admin-publish' | 'admin-create' | 'admin-archive'
      | 'system-warn' | 'system-close';
  actor: string;                    // "Aditi Sharma" | "You" | "System"
  description: string;              // "Completed \"Q3 Mental Arithmetic\" with 19/20 score"
  timestamp: Date;
};
```

### Event description templates

| Source row | Normalized description template |
|---|---|
| `submissions` with `completed_at` | `Completed "<paper.title>" with <score>/<total_questions> score` |
| `activity_logs.action_type = 'PUBLISH_RESULT' \| 'BULK_PUBLISH_RESULTS'` | `Published results for "<paper.title>"` |
| `activity_logs.action_type = 'FORCE_CLOSE_EXAM'` | `Force-closed "<paper.title>"` |
| `activity_logs.action_type = 'CREATE_ASSESSMENT'` | `Created new assessment "<paper.title>"` |
| `activity_logs.action_type = 'ARCHIVE_RESULT'` | `Archived "<paper.title>" result set` |
| `activity_logs.action_type = 'RE_EVALUATE_RESULTS'` | `Re-evaluated "<paper.title>"` |

For any action_type not in the list, fall back to: `<human-readable action_type> — <entity_type>`.

### Empty state (no events in last 7 days)

Render a single cell with:
- Centered, padding 48×16, text-center
- Lucide `inbox` icon 28×28 `#CBD5E1`, 12px margin-bottom
- Message: "No recent activity" DM Sans 14/600 `#475569`
- Sub: "Student and admin actions will appear here." DM Sans 12/500 `#94A3B8`

Footer link remains visible so admin can still navigate to the full log.

---

## 8. Removed Elements (from current dashboard)

- **Score Trend chart** — gone. Moved to `/admin/analytics` (future page, out of scope).
- **Level Distribution chart** — gone. Same destination.
- **KPI sparklines** — gone.
- **Avg Score KPI** — gone.
- **Live Pulse widget** (the small floating card at the top) — consolidated into the main "Active Live Assessments" list instead of being a standalone widget.

---

## 9. What Stays Unchanged

- Sidebar (global, gets sign-out footer added per earlier spec)
- Top header bar shape
- The `/admin/monitor/[paperId]` destination for the Monitor button
- The `/admin/activity-log` page linked from the feed footer (to be designed in a later spec)
- `requireRole('admin' | 'teacher')` auth pattern — unchanged

---

## 10. Files to Change

### Modified files

```
src/app/(admin)/admin/dashboard/page.tsx        — full rewrite (simpler query set)
src/components/dashboard/kpi-card.tsx            — simplify: remove sparkline, remove trend, add pulse pill variant
src/components/dashboard/live-pulse.tsx          — DELETE (consolidated into new component)
src/components/dashboard/recent-activity-feed.tsx — rewrite to accept mixed feed items
src/components/dashboard/dashboard-charts.tsx    — DELETE
src/components/dashboard/score-trend-chart.tsx   — DELETE
src/components/dashboard/level-distribution-chart.tsx — DELETE
src/components/dashboard/sparkline-chart.tsx     — DELETE (if only used in dashboard)
```

### New files

```
src/components/dashboard/live-exam-card.tsx       — single live exam row card
src/components/dashboard/live-exam-stack.tsx      — the list + empty state
src/components/dashboard/activity-feed.tsx        — the new mixed feed (replaces recent-activity-feed.tsx)
src/components/dashboard/dashboard-header.tsx     — H1 + dynamic subtitle with live counts
```

### No database changes

This redesign is client-UI only. All data comes from tables that already exist (`students`, `exam_papers`, `assessment_sessions`, `submissions`, `activity_logs`).

### Query optimizations

The new dashboard query set should be significantly lighter than the current one (which fetches 12 parallel queries including 6 months of submissions for the trend chart). New count:

1. `SELECT count students WHERE institution_id` (KPI 1)
2. `SELECT count exam_papers WHERE status=LIVE` (KPI 2)
3. `SELECT paper_id FROM assessment_sessions WHERE closed_at IS NULL AND paper_id IN (...)` (KPI 3 + per-card active counts, in one query)
4. `SELECT live paper metadata` (cards + header subtitle data)
5. `SELECT student events last 10` (feed source 1)
6. `SELECT admin events last 10` (feed source 2)

6 queries total, all scoped. No 6-month scan.

---

## 11. Out of Scope

- **Scheduled assessments preview** — showing "next exam starts in 2 hours" was considered and deferred. Needs a `scheduled_start_at` column that doesn't exist.
- **Time-remaining per live exam** — showing "14 min left" was considered and dropped per user decision. Kept rows minimal.
- **Analytics page** — future destination for removed charts. Not designed here.
- **Per-KPI drill-down on click** — KPI cards are display-only. Clicking doesn't navigate anywhere.
- **Teacher role differentiation** — teachers see the same dashboard as admins for now. If teachers should see scoped data only (their own students), that's a future pass.

---

## 12. Decisions Locked in Brainstorm

- **Q1 (primary job):** Operational command center, not analytics
- **Q2 (KPI set):** 3 KPIs — Total Students, Active Exams, Live Now (no Avg Score)
- **Q3 (live exam row fields):** Minimal — type icon, title, level, duration, live-student count, Monitor button. No ID, no status pills, no time-remaining.
- **Q4 (no live exams state):** Empty state card with "Go to Assessments" link
- **Q5 (activity feed content):** Mixed — student events + admin audit events interleaved
- **Q6 (feed depth + footer):** 5 items, keep "View Full Activity Log" footer
- **Q7 (page header):** Hybrid — H1 "Dashboard" + dynamic subtitle "**N** students active across **M** live exams right now"

---

## Appendix A — Visual Reference

Browser mockup saved at `.superpowers/brainstorm/223-1776020821/content/dashboard-layout.html`.

---

## Backend Dependencies

> Added by Phase 3 of the 2026-04-14 audit (see `docs/superpowers/audit/2026-04-14-phase1-findings.md` §9). This section is additive and does not change any existing requirements.

### (a) Database columns touched

All existing columns — no new schema:

- `students(id, institution_id, full_name, level_id)` — KPI 1 (`count`), Activity Feed student display name join.
- `exam_papers(id, title, type, level_id, duration_minutes, institution_id, status, opened_at)` — KPI 2 (count where `status='LIVE'`), Active Live Assessments cards, Activity Feed paper title join.
- `assessment_sessions(paper_id, student_id, closed_at)` — KPI 3 and per-card active counts (active = `student_id IS NOT NULL AND closed_at IS NULL`).
- `submissions(id, student_id, paper_id, score, total_questions, completed_at)` — Activity Feed student-completion events, joined to `exam_papers` for the paper title.
- `activity_logs(id, user_id, institution_id, action_type, entity_type, entity_id, metadata, timestamp)` — Activity Feed admin-event source.
- `levels(id, name)` — denormalised level label on assessment cards.

### (b) Server actions called

**None.** The dashboard is a read-only Server Component performing direct Supabase reads. No mutations originate here.

### (c) RPCs / functions referenced

**None.** All six queries (§10) use `supabase.from(...)`. If the parallel KPI / feed queries become a latency hotspot, a single `admin_dashboard_payload` RPC could replace them in a future optimisation — not in scope for v1.

### (d) Cross-spec dependencies

- **`admin-activity-log` (dropped from v1):** The "VIEW FULL ACTIVITY LOG →" footer link still navigates to `/admin/activity-log`, which per memory `project-v1-scope.md` is a v0 placeholder. Plan phase must keep the link functional (landing on the existing stub) without blocking on the dropped feature.
- **`admin-create-assessment-flow`:** The `forceOpenExam` action it exposes is the only producer of the `exam_papers.status = 'LIVE'` state that drives KPI 2 and the Active Live Assessments list. No direct import — runtime dependency only.
- **`admin-live-monitor-flow`:** Each Active Live Assessment card links into `/admin/monitor/[paperId]` owned by that spec. No schema coupling.
- **`admin-results-redesign`:** The dashboard filters out archived papers implicitly (`status='LIVE'` cannot coexist with `archived_at IS NOT NULL`), so the `exam_papers.archived_at` column added by the results spec does not need to be read here.

