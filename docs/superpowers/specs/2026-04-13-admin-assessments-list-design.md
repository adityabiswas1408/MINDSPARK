# Admin Assessments List Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Redesign of the `/admin/assessments` list page — segmented EXAM/TEST toggle, 6-pill status filter row, filter bar, full-width row cards with state-aware actions, and two empty states.

---

## 1. Goal

Replace the current plain list of assessment cards with an operational hub where admins can quickly filter by type, status, and date range, then take the most appropriate action for each assessment's state with a single click. The list adapts its per-row action button to the assessment's current lifecycle state — Edit for drafts, Preview for published, Monitor for live, View Results for closed or archived.

Create is out of scope for this spec (handled by the separate Create Assessment wizard flow). Detail/edit routing is covered here only as click destinations; the detail pages themselves will be designed in follow-up specs.

---

## 2. Route Map

```
/admin/assessments                                      → List page
/admin/assessments?type=EXAM&status=live                → List page with filters applied
/admin/assessments?type=TEST&level=lvl-3&search=drill   → Fully-filtered state
```

All filter state lives in the URL query string so admins can share filtered views and the browser back button works naturally.

### Destinations (not designed here, referenced only)

- `/admin/assessments/[id]/edit` — Draft edit page (part of Create Assessment wizard flow)
- `/admin/assessments/[id]` — Published read-only preview (future spec, or reuse wizard in preview mode)
- `/admin/monitor/[id]` — Live monitor detail (already designed, from Live Monitor flow)
- `/admin/results/[id]` — Closed/archived results detail (already designed, from Results flow)

---

## 3. Design System Notes

Uses the established MINDSPARK tokens from earlier specs in this session:
- DM Sans for UI, DM Mono for numbers/dates
- Forest Green `#1A3829` primary, `#EFFAF4` light accent, `#B7E4C7` pill border
- Charcoal text scale: `#0A0F1A` / `#1E293B` / `#334155` / `#475569`
- Card radius 14px (row cards), 16px (hero cards elsewhere)
- Base font size 16px
- Lucide-react line icons, stroke 1.75
- Global admin sidebar with Sign Out footer

---

## 4. Screen 1 — Populated List

**Route:** `/admin/assessments`

### Layout (top to bottom)

1. **Admin chrome** — standard sidebar + top bar. Breadcrumb: `Admin › Assessments`.

2. **Page header row:**
   - Left: H1 "Assessments" (30/700 `#0A0F1A` -0.018em) + subtitle "Create, publish, monitor, and review exams and tests." (14/500 `#334155`)
   - Right: **+ Create Assessment** primary button (forest green, h-42, plus icon + text). Opens the Create Assessment wizard from a future spec.

3. **Segmented toggle** — EXAM vs TEST, 4px inner padding, `#F1F5F9` bg, `#E2E8F0` border 1px, 12px radius. Each segment shows:
   - Icon (clipboard-list for EXAM, zap for TEST) + label + count pill
   - Active segment: white bg + shadow, count pill background `#EFFAF4` with `#1A3829` text
   - Inactive segment: `#64748B` text, count pill `#E2E8F0` bg with `#334155` text
   - Clicking swaps `?type=EXAM` or `?type=TEST` in the URL

4. **Status pills row** (14px margin-top from segmented toggle):
   - 6 pills, single-select, one active at a time
   - Pills: **All** (default, selected) · **Draft** · **Published** · **Live** · **Closed** · **Archived**
   - Pill anatomy: label + count pill inside
   - Inactive pill: white bg, `#E2E8F0` border, `#475569` text
   - Active pill: `#1A3829` bg, white text, nested count bg `rgba(255,255,255,0.15)` with white text
   - **Live pill** has a special 6×6 `#DC2626` pulse dot before the label (always visible, even when inactive)
   - "All" shows everything **except Archived** — archived is opt-in via its dedicated pill
   - Counts reflect the current EXAM/TEST filter (e.g. "22 EXAMs total: 4 Draft, 8 Published, 2 Live, 6 Closed, 2 Archived")

5. **Filter bar** — single white card, `#E2E8F0` border, 14px radius, padding 14×18, flex row with 12px gap:
   - Search input (flex 1, max-width 460, h-40, 10px radius, search icon left-padded). Placeholder: "Search assessments by title…"
   - "All Levels" dropdown (min-width 160, h-40, 10px radius)
   - Date range filter button (min-width 180, h-40, 10px radius) with calendar icon + current range label + chevron. On click opens a popover with "Single date" / "Date range" tabs (same as Results Hub).
   - Right-aligned count: "**22** assessments" in DM Mono 13/500 `#334155`

6. **Row cards stack** — `flex-direction: column`, 12px gap. Each row is a full-width card (see §5).

### Data flow

```ts
// Server component, queries scoped to institution.
const { data: papers, count } = await supabase
  .from('exam_papers')
  .select(`
    id, title, type, status, level_id, duration_minutes,
    created_at, opened_at, closed_at, archived_at,
    levels(id, name),
    questions(count)
  `, { count: 'exact' })
  .eq('institution_id', institutionId)
  .eq('type', typeFilter)       // EXAM or TEST from URL
  .ilike('title', `%${search}%`)
  .eq('level_id', levelFilter)   // If set
  .gte('created_at', dateFrom)   // If set
  .lte('created_at', dateTo)     // If set
  .order('created_at', { ascending: false });

// Status filtering happens in the same query:
//   All:       exclude WHERE archived_at IS NOT NULL
//   Draft:     WHERE status = 'DRAFT' AND archived_at IS NULL
//   Published: WHERE status = 'PUBLISHED' AND archived_at IS NULL
//   Live:      WHERE status = 'LIVE' AND archived_at IS NULL
//   Closed:    WHERE status = 'CLOSED' AND archived_at IS NULL
//   Archived:  WHERE archived_at IS NOT NULL

// For Live and Closed rows, fetch active/submitted counts in parallel:
const { data: liveCounts } = await supabase
  .from('assessment_sessions')
  .select('paper_id')
  .in('paper_id', livePaperIds)
  .not('student_id', 'is', null)
  .is('closed_at', null);

const { data: submissionCounts } = await supabase
  .from('submissions')
  .select('paper_id')
  .in('paper_id', closedPaperIds)
  .not('completed_at', 'is', null);
```

---

## 5. Row Card Anatomy

Each row is a full-width white card, `#E2E8F0` border 1px, 14px radius, padding 18×22, `box-shadow: 0 1px 3px rgba(10,15,26,0.04)`, flex row with 20px gap.

### Default structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [ICON]  Status · Type · Level                              [Action Button] │
│         Title                                                              │
│         30 min · 20 questions · Created Apr 8, 2026 · [state-stat]          │
└────────────────────────────────────────────────────────────────────────────┘
```

### Left — Type icon

- 46×46 rounded 12px square
- **EXAM type:** `#EFF6FF` bg, `#1E3A8A` `clipboard-list` icon 20×20 stroke 1.75
- **TEST type:** `#F5F3FF` bg, `#6D28D9` `zap` icon 20×20 stroke 1.75

### Middle — Body (flex 1, min-w 0)

**Top line (badges, 8px gap, flex-wrap):**
- **Status badge** (state-dependent, see §6)
- **Type badge** (EXAM blue, TEST purple — matches existing pattern from Results Hub)
- **Level pill** — `#EFFAF4` bg, `#B7E4C7` border, `#1A3829` text, layers icon + level name in 11/700

All badges: 3×10 padding, 9999 radius, 10/700 uppercase, letter-spacing 0.05em.

**Title line (6px margin-top):**
- DM Sans 17/700 `#0A0F1A`, letter-spacing -0.012em, line-height 1.25
- Max 1 line, text-overflow ellipsis if too long
- Draft with no title shows "Untitled Draft — `{short-id}`" as a placeholder

**Meta line (4px margin-top, flex 12px gap, 13/500 `#475569`):**
- Duration: clock icon + "**30** min" (number in DM Mono 700 `#0A0F1A`)
- `·` separator
- Question count: file-text icon + "**20** questions" (number in DM Mono 700 `#0A0F1A`)
- `·` separator
- Created date: "Created **Apr 8, 2026**" (date in DM Mono)
- `·` separator
- **State-dependent stat chip** (conditional, see §6 matrix)

### Right — Action button cluster (flex-shrink 0)

- Single context-aware action button (see §6 matrix)
- Button height 40, padding 0×16, 10px radius, 14/600

### Card states

- **Default:** white bg, slate border
- **Hover:** border `#1A3829`, `transform: translateY(-1px)`, shadow deepens to `0 8px 20px rgba(15,23,42,0.06)`, 3px forest-green left accent bar reveals via `::before`
- **Live row (persistent, not a hover state):** border `#FCA5A5`, left accent bar is 3px `#DC2626` **always visible** (not just on hover). This makes live exams instantly recognizable from a skim.
- **Cursor pointer** on the whole card. Clicking the body goes to the same destination as the button.

---

## 6. State Matrix — Badge + Stat + Action

Each assessment's state determines three things: the status badge style, what contextual stat appears in the meta row, and the action button on the right.

| Status | Badge colours | Meta row stat | Action button | Button colour | Destination |
|---|---|---|---|---|---|
| **DRAFT** | `#F1F5F9` bg, `#334155` text | (none) | "Edit Draft" | Forest green filled (primary) | `/admin/assessments/[id]/edit` |
| **PUBLISHED** | `#DCFCE7` bg, `#14532D` text, 5×5 green dot before text | (none) | "Preview" with eye icon | Outline | `/admin/assessments/[id]` (read-only preview page) |
| **LIVE** | `#FEE2E2` bg, `#991B1B` text, 5×5 pulsing red dot before text | `stat-chip.active`: `#FEE2E2` bg, `#991B1B` text, "22 active" with pulsing dot | "Monitor →" with arrow icon | **Red filled (destructive-style primary)**, `#DC2626` bg, white text | `/admin/monitor/[id]` |
| **CLOSED** | `#E2E8F0` bg, `#475569` text | `stat-chip.submitted`: `#DCFCE7` bg, `#14532D` text, "26 / 26 submitted" | "View Results" with bar-chart icon | Outline | `/admin/results/[id]` |
| **ARCHIVED** | `#F1F5F9` bg, `#64748B` text, dashed `#CBD5E1` border | (none) | "View Results" with bar-chart icon | Outline | `/admin/results/[id]` |

### Why Monitor is red-filled

The Live state is time-sensitive — admin action may be immediately required (monitor progress, force close if things go wrong). A red filled button is the strongest visual anchor on the page and matches the LIVE badge colour scheme. This is deliberate visual asymmetry; other rows use outline or forest-green buttons.

### Why the state chip on Live/Closed rows

Draft and Published assessments have no submission data yet (or results aren't published to students), so there's nothing meaningful to show. Live rows should expose the current active-session count as the most urgent operational number. Closed rows should show the final submission ratio so admins can see completion at a glance.

---

## 7. Empty States

### 7a. First-time empty (no assessments exist at all)

- Full chrome visible (sidebar, top bar, page header with Create button)
- **Neither the segmented toggle nor the status pills row nor the filter bar render** — there's nothing to filter
- Single centered empty card:
  - White bg, `#E2E8F0` border, 14px radius, padding 64×24, text-center, shadow-sm
  - 64×64 round icon chip: `#F1F5F9` bg, `#475569` `clipboard-list` icon 28×28
  - Title: "No assessments yet" (20/700 `#0A0F1A`)
  - Subtitle: "Create your first exam or test to start building your question bank. Students can take them once they're published." (15/500 `#475569`, max-width 420, line-height 1.5)
  - Action: "+ Create Assessment" primary button below (duplicating the one in the header for clarity)

### 7b. Filtered no-results

- Full chrome **plus** segmented toggle, status pills row, and filter bar all visible
- **Active filters are visually highlighted:** a pill in the active state (e.g. "Archived"), or a dropdown with `#EFFAF4` bg + `#B7E4C7` border + `#1A3829` text, or a search input with non-empty value
- Filter count shows "**0** assessments"
- Below the filter bar: the same empty card shell, but:
  - Icon chip: `#FEF9C3` bg, `#92400E` search icon (amber theme, differentiates from first-time)
  - Title: "No assessments match your filters" (20/700 `#0A0F1A`)
  - Subtitle: "Try a different search term, level, or status, or clear the filters to see everything." (15/500 `#475569`)
  - Action: "Clear all filters" subtle text link in 14/700 `#1A3829` with X icon. NOT a button — the visual weight is intentionally lower because admin just needs to reset state, not take creative action.

Clicking "Clear all filters" resets all URL query params and reloads the list with default filters (type=EXAM, status=All, no search, no level, default date range).

---

## 8. Non-goals / Out of Scope

- **Create Assessment flow** — The "+ Create Assessment" button opens a wizard that lives in a separate spec (Create Assessment Flow — 6 steps, upcoming).
- **Assessment detail / preview page** — The "Preview" action destination `/admin/assessments/[id]` needs its own spec. For now this spec just routes to it.
- **Assessment edit page** — The "Edit Draft" action destination `/admin/assessments/[id]/edit` is part of the Create Assessment wizard flow (treated as a re-entry into the wizard).
- **Bulk operations** — No multi-select, no floating bulk action bar. Per-decision Q8. If archiving 10 closed assessments at once becomes a real pain point later, it can be added as a follow-up.
- **Duplicate assessment** — Useful but not in this spec. Can be added to the Preview page or as an overflow menu item on row cards later.
- **Delete draft** — Draft assessments that are no longer wanted can be deleted from the edit page (part of the Create Assessment wizard spec), not from the row list. Keeps the row actions focused on the happy path.
- **Assessment analytics** — Row cards don't show avg score or completion rates. Those live on the Results pages.
- **Assessment scheduling** — No UI for "start this exam at 9 AM on Tuesday" in this spec. That's a future feature that would add a `scheduled_start_at` column.

---

## 9. Database Changes

**None.** Uses existing `exam_papers`, `levels`, `assessment_sessions`, `submissions` tables unchanged. The `archived_at` column was already added in the Results flow spec.

### Server actions used

All actions already exist:
- Status filtering queries the existing `status` column
- Archived filtering queries the existing `archived_at` column (added by Results spec)
- No new server actions needed for the list page itself. Actions are invoked from the destination pages (`forceCloseExam` from Monitor, `publishResult` from Results, etc.)

---

## 10. Files to Change

### New files

```
src/app/(admin)/admin/assessments/page.tsx                (rewrite)
src/components/assessments/assessments-list-client.tsx    (new — filter + stack orchestration)
src/components/assessments/assessments-segmented-toggle.tsx (new — EXAM/TEST)
src/components/assessments/assessments-status-pills.tsx   (new — 6 pills)
src/components/assessments/assessments-filter-bar.tsx     (new — search + level + date range)
src/components/assessments/assessment-row-card.tsx        (new — row with state-aware action)
src/components/assessments/assessments-empty-first.tsx    (new)
src/components/assessments/assessments-empty-filtered.tsx (new)
```

### Modified files

```
src/components/assessments/assessment-card.tsx            — DELETE (replaced by row-card)
```

### No changes to server actions

The existing assessment server actions (createAssessment, publishAssessment, forceOpenExam, forceCloseExam) remain untouched by this spec. They're invoked from the destination pages (Create wizard, Monitor, Results), not from the list.

---

## 11. Query / Rendering Performance Notes

- The list is paginated with `PAGE_SIZE = 20` rows per page (matches Students list convention)
- Total query count per page load: **1 main papers query + 1 live-counts query + 1 submissions-counts query = 3 queries**
- Live/submitted counts only query papers in the visible page, not all papers — keeps this O(page size), not O(total papers)
- Pagination via `?page=N` URL param with standard cursor buttons at the bottom of the rows stack (ChevronLeft · 1 · 2 · 3 · … · N · ChevronRight, same pattern as Students list)

---

## 12. Decisions Locked in Brainstorm

- **Q1 (type toggle):** Segmented EXAM/TEST toggle. Same pattern as Results Hub.
- **Q2 (status filter):** 6-pill row, single-select. `All · Draft · Published · Live · Closed · Archived`. Live pill has persistent red pulse dot.
- **Q3 (layout):** Full-width row list (stacked vertically, not card grid). Matches existing codebase pattern and Stitch mockup.
- **Q4 (row content):** Standard row with state-dependent stats. Draft has no stats, Live has active count, Closed has submission ratio.
- **Q5 (click behavior):** Context-aware single button per row. Labels and destinations vary by state. Card body click goes to the same destination.
- **Q6 (filter bar):** Search + Level dropdown + Date range picker.
- **Q7 (empty states):** Two distinct states — first-time welcoming and filtered amber. Same pattern as Students flow and Results Hub.
- **Q8 (bulk actions):** No bulk operations. Per-row actions cover the needed cases.

---

## Appendix A — Visual Reference

Browser mockup saved at:

- `.superpowers/brainstorm/223-1776020821/content/assessments-list.html` — populated view + both empty states

Earlier specs that this one builds on:

- `2026-04-12-admin-results-redesign-design.md` — Results Hub pattern that inspired the 6-pill status row and segmented toggle
- `2026-04-13-admin-students-flow-design.md` — Students list pattern for filter bar layout, empty states, pagination footer
- `2026-04-13-admin-dashboard-design.md` — Live exam card patterns (red pulse dot, forest green Monitor button)

---

## Backend Dependencies

> Added by Phase 3 of the 2026-04-14 audit (see `docs/superpowers/audit/2026-04-14-phase1-findings.md` §9).

### (a) Database columns touched

All existing columns — no new schema from this spec:

- `exam_papers(id, title, type, status, level_id, duration_minutes, created_at, opened_at, closed_at, archived_at, institution_id)` — main query, status filtering, Live row accent detection.
- `levels(id, name)` — denormalised level pill on each row card.
- `questions(paper_id)` — aggregated via `questions(count)` embed for the "20 questions" meta line.
- `assessment_sessions(paper_id, student_id, closed_at)` — live-row active counts (`student_id IS NOT NULL AND closed_at IS NULL`).
- `submissions(paper_id, completed_at)` — closed-row submitted counts.

### (b) Server actions called

**None from the list page itself.** Per §9 of the spec, all per-row actions (Edit, Preview, Monitor, View Results) navigate to destination pages which own their own mutations (`publishAssessment`, `forceOpenExam`, `forceCloseExam`, `archiveAssessmentResult`, etc.). The list is a read-only Server Component.

### (c) RPCs / functions referenced

**None.** All queries (§4 data flow + §11 perf notes) go through PostgREST. Paginated at `PAGE_SIZE = 20` with 3 queries per page load.

### (d) Cross-spec dependencies

- **`admin-results-redesign`:** depends on the `exam_papers.archived_at` column added by its §10 migration. Without that column, the Archived pill cannot filter. Plan order: results-redesign migration must land before assessments-list plan executes.
- **`admin-create-assessment-flow`:** the `exam_papers.scheduled_start_at` / `scheduled_end_at` columns it adds are NOT read by the list page (scheduled state isn't a first-class pill in this spec). The list page still reads `status` only — `scheduled_*` is internal to the scheduler cron.
- **`admin-live-monitor-flow`:** each Live row's Monitor button navigates to `/admin/monitor/[id]`. No schema coupling.
- **`admin-results-redesign`:** each Closed/Archived row's "View Results" navigates to `/admin/results/[id]`. No schema coupling.
- **`admin-create-assessment-flow`:** the "+ Create Assessment" header button opens the wizard defined in that spec. No schema coupling.

