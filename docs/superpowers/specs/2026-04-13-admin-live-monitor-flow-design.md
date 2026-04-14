# Admin Live Monitor Flow Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** 4-screen real-time monitoring flow for LIVE exams — Hub picker, Detail page with KPI hero and student table, type-to-confirm Force Close dialog, and the post-close Session Summary state.

---

## 1. Goal

Give admins a focused, operational view of currently running exams so they can answer three questions at any moment:

1. **"Which live exams do I care about right now?"** — answered by the Hub screen
2. **"Who's doing what inside this specific exam?"** — answered by the Detail screen's KPI hero + real-time student table
3. **"How did the session end?"** — answered by the Closed Summary state

The redesign builds on the existing realtime infrastructure (Supabase Broadcast channels for `exam:{paperId}` events + Presence channels for `lobby:{paperId}` join/leave) and the existing `forceCloseExam` server action. **No realtime or database changes** beyond what already exists.

---

## 2. Route Map

```
/admin/monitor                      → Hub — grid of all currently LIVE exams
/admin/monitor/[id]                 → Detail — real-time monitoring for one exam
/admin/monitor/[id] (post-close)    → Same route, Closed Summary state
```

The Force Close dialog is a modal over the Detail page, not a separate route.

**The Closed Summary is NOT a separate route.** When the exam transitions from LIVE → CLOSED (either via `forceCloseExam` or the duration timer expiring), the Detail page reacts to the status change and swaps into the Closed Summary state without navigating. Admin can click "Back to Live Monitor" to return to the Hub or "Go to Results →" to jump into the Results Detail page.

---

## 3. Design System Notes

Uses the MINDSPARK tokens from earlier specs in this session:
- DM Sans for UI, DM Mono for numbers/timers/IDs
- Forest Green `#1A3829` primary
- **Red `#DC2626`** (urgent), `#991B1B` (deep red for text), `#FEE2E2` (pink bg tint) — used heavily on this flow because LIVE = urgent
- Charcoal text scale: `#0A0F1A` / `#1E293B` / `#334155` / `#475569`
- Card radius 14px / 16px hero
- Base font size 16px
- Lucide-react line icons, stroke 1.75
- Global admin sidebar with Sign Out footer

**Red is the visual anchor of this entire flow.** The Live Monitor nav item is active in the sidebar, all hero cards get a red left accent bar, the Force Close button is destructive red, and all live-urgency states use pulsing red dots.

---

## 4. Status Model (existing, for reference)

From `src/app/(admin)/admin/monitor/[id]/monitor-client.tsx`:

```ts
type StudentStatus = 'in_progress' | 'submitted' | 'disconnected' | 'waiting';
```

- **in_progress** — Student is actively taking the exam. Heartbeats flowing via `exam:{paperId}` broadcast channel. Presence shows them in `lobby:{paperId}`.
- **submitted** — `submissions.completed_at` is set. Student has finished and locked in.
- **disconnected** — Student was in_progress but their presence left the `lobby:{paperId}` channel without submitting. May have lost wifi, closed tab, browser crashed. `submissions` row still exists with partial answers.
- **waiting** — Enrolled in target level, session row exists, but student hasn't entered the exam URL yet. `session_status === 'scheduled'`.

```
WAITING → IN PROGRESS → SUBMITTED       (happy path)
              ↓
         DISCONNECTED                   (session dropped)
```

Realtime events that drive status transitions (from existing `monitor-client.tsx`):
- `heartbeat` on `exam:{paperId}` — updates `answered_count`, bumps `last_seen`
- `answer_saved` on `exam:{paperId}` — increments `answered_count`
- `submitted` / `lifecycle` on `exam:{paperId}` — flips to `submitted`
- `status_change` on `exam:{paperId}` — generic status flip
- `exam_closed` on `exam:{paperId}` — triggers Closed Summary state
- `join` on `lobby:{paperId}` — flips `disconnected` back to `in_progress` if reconnected
- `leave` on `lobby:{paperId}` — flips `in_progress` to `disconnected`

**No changes to this wire protocol** in this spec.

---

## 5. Screen 1 — Monitor Hub

**Route:** `/admin/monitor`
**Purpose:** Pick which live exam to watch when multiple are running at once.

### Layout

1. **Admin chrome.** Breadcrumb: `Admin › Live Monitor`. Live Monitor sidebar nav item active.

2. **Page header row:**
   - Left: H1 "Live Monitor" (30/700 `#0A0F1A` -0.018em)
   - Left subtitle (below H1): dynamic live indicator — `● {N} exams running · {M} students active`
     - Red pulsing dot (8×8, `#DC2626` with `#FEE2E2` halo) before the text
     - Numbers in DM Mono 700 `#0A0F1A`
     - Animation: pulse 2s ease-in-out infinite (opacity 0.35 ↔ 1)

3. **Live exam card grid** — `grid-template-columns: repeat(3, 1fr)`, 16px gap.

### Live exam card anatomy

Each card is a white card, `#E2E8F0` border 1px, 16px radius, padding 22×24, `box-shadow: 0 1px 3px rgba(10,15,26,0.04)`, relative + overflow-hidden, with a **3px `#DC2626` left accent bar** that's always visible (not just on hover — this is a live exam, the red urgency is persistent).

- **Hover:** border `#DC2626`, `transform: translateY(-2px)`, shadow deepens to `0 12px 24px rgba(220,38,38,0.08)` (red-tinted shadow for the "live" feeling)
- **Cursor pointer** on the whole card; entire card is clickable

**Top badge row** (margin-bottom 12):
- Status badge: `Live` in `#FEE2E2` bg with `#991B1B` text + pulsing red 5×5 dot before text
- Type badge: `Exam` (`#EFF6FF` bg + `#1E3A8A` text + `#DBEAFE` border) or `Test` (`#F5F3FF` bg + `#6D28D9` text + `#EDE9FE` border)
- Level pill: `#EFFAF4` bg, `#B7E4C7` border, `#1A3829` text, layers icon

**Title** (margin-bottom 14): DM Sans 17/700 `#0A0F1A` letter-spacing -0.012em line-height 1.3.

**Timer strip** (margin-bottom 14):
- `#FEF2F2` bg, `#FECACA` border 1px, 10px radius, padding 10×14
- Flex row 10px gap: clock icon (16×16 `#991B1B`) + "TIME REMAINING" label (11/700 uppercase `#991B1B`) + right-aligned DM Mono 18/700 `#991B1B` countdown value
- Countdown updates every second client-side via `setInterval`, same pattern as the existing `monitor-client.tsx`

**Mini stats grid** (2-column, 12px gap, padding-top 12, top border `#F1F5F9`):
- **Active** stat: label "ACTIVE" (10/700 uppercase `#475569`) + value in DM Mono 20/700 `#991B1B` with a pulsing 8×8 red dot before the number. Displays the current `in_progress` count.
- **Submitted** stat: label "SUBMITTED" + value in DM Mono 20/700 `#0A0F1A`. Format: `8 / 24` where 8 is submitted count and 24 is total enrolled in the level.

**Monitor button** (margin-top 14):
- Full-width, height 42, `#DC2626` bg, white text, 10px radius, DM Sans 14/700
- Monitor icon (from lucide `monitor`) + "Monitor Session" text
- Shadow `0 1px 3px rgba(220,38,38,0.3)`
- On click: navigates to `/admin/monitor/[id]`

### Empty state

When no exams are currently live:
- Centered empty card (max-width 520, padding 64×24, text-center, shadow-sm)
- 64×64 round icon chip (`#F1F5F9` bg, `#475569` monitor-off icon)
- Title: "No live exams right now" (20/700 `#0A0F1A`)
- Subtitle: "When an exam goes live, it will appear here for real-time monitoring." (15/500 `#475569`, max-width 440)
- Footer link: "Go to Assessments →" in 14/700 `#1A3829`, navigates to `/admin/assessments`

### Data flow

```ts
// Server component — initial fetch
const { data: livePapers } = await supabase
  .from('exam_papers')
  .select('id, title, type, level_id, duration_minutes, opened_at, levels(name)')
  .eq('institution_id', institutionId)
  .eq('status', 'LIVE')
  .order('opened_at', { ascending: false });

// Per-paper counts via single bulk query
const { data: sessionRows } = await supabase
  .from('assessment_sessions')
  .select('paper_id, status, submissions(completed_at)')
  .in('paper_id', livePapers.map(p => p.id))
  .not('student_id', 'is', null);

// Client-side: groupBy paper_id, compute active vs submitted counts
```

The Hub subscribes to a lightweight per-paper broadcast channel for count updates, or polls every 10–15 seconds as a simpler alternative. Precise implementation is for the plan phase.

---

## 6. Screen 2 — Live Monitor Detail

**Route:** `/admin/monitor/[id]`
**Purpose:** Real-time view of one exam in progress. This is the hero screen of the flow.

### Layout

1. **Admin chrome.** Breadcrumb: `Admin › Live Monitor › Q3 Mental Arithmetic`.

2. **Back link:** "← Back to Live Monitor" (15/500 `#334155`).

3. **Hero card** (see §6a below).

4. **Filter strip** — white card, 14px radius, padding 14×18, flex row:
   - Search input (max-width 400, h-40, 10px radius): "Search by name or roll number…"
   - Right-aligned **"Live Updating" pill**: `#DCFCE7` bg, `#BBF7D0` border, `#14532D` text, 9999 radius, padding 7×14, 12/700 uppercase letter-spacing 0.04em, with a pulsing 7×7 dark-green dot before the text. This is the realtime status indicator — if the channel disconnects, this pill changes to amber "Reconnecting…" state.

5. **Student table** (see §6b below).

### 6a. Hero card anatomy

White card, `#E2E8F0` border 1px, 16px radius, padding 28×32, `box-shadow: 0 1px 3px rgba(10,15,26,0.06)`, relative + overflow-hidden, with a **4px `#DC2626` left accent bar** via `::before`.

#### Top row (flex, justify-between, items-start, 24px gap, margin-bottom 24)

**Left — title group (flex 1):**
- Label "MONITORING LIVE SESSION" (13/700 uppercase `#475569` letter-spacing 0.08em, margin-bottom 4)
- **Title + badges row** (flex, items-center, 10px gap, wrap, margin-bottom 10):
  - H1 title — DM Sans 28/700 `#0A0F1A` letter-spacing -0.018em
  - Live badge (red with pulsing dot)
  - Type badge (Exam blue or Test purple)
  - Level pill (forest green 50 tint)
- **Meta row** (flex, 12px gap, 14/500 `#334155`, wrap):
  - Clock icon + "30 min total"
  - `·` separator
  - File icon + "20 questions"
  - `·` separator
  - Play icon + "Started at 2:15 PM"

**Right — controls group (flex, 24px gap, shrink 0):**
- **Big timer card:**
  - `#FEF2F2` bg, `#FECACA` border 1px, 14px radius, padding 12×18
  - Label "TIME REMAINING" (11/700 uppercase `#991B1B` letter-spacing 0.08em)
  - Value — DM Mono 36/700 `#991B1B` letter-spacing -0.03em line-height 1
  - Format: `MM:SS` when ≥ 1 hour switch to `HH:MM:SS`
  - **Urgent state** (≤ 60 seconds remaining): the value text gets `animation: pulse 1s ease-in-out infinite`
- **Force Close button:**
  - Outline destructive — `#FFFFFF` bg, `#FECACA` border, `#991B1B` text, h-42, padding 0×18, 10px radius, DM Sans 15/600
  - circle-slash lucide icon + "Force Close Exam" text
  - Hover: `#FEE2E2` bg, `#FCA5A5` border
  - On click: opens the Force Close dialog (Screen 3)

#### KPI row (inside the hero card, padding-top 22, top border `#F1F5F9`)

`grid-template-columns: repeat(4, 1fr)`, 14px gap. One card per StudentStatus value.

Each KPI cell:
- Padding 16×18, `#E2E8F0` border 1px, 12px radius, `#FAFBFC` bg
- **Label row:** inline-flex, items-center, 6px gap, 11/700 uppercase letter-spacing 0.06em
  - Coloured 6×6 dot as `::before` pseudo-element
  - Label text
- **Value:** DM Mono 32/700 `#0A0F1A` letter-spacing -0.02em line-height 1

Color pairs for each KPI:
- **In Progress** — label color `#14532D`, dot `#1A3829`
- **Submitted** — label color `#1E40AF`, dot `#1E40AF`
- **Disconnected** — label color `#991B1B`, dot `#DC2626`
- **Waiting** — label color `#475569`, dot `#94A3B8`

Values come from the existing `counts` memo in `monitor-client.tsx`:

```ts
const counts = useMemo(() => ({
  in_progress:  rows.filter(r => r.status === 'in_progress').length,
  submitted:    rows.filter(r => r.status === 'submitted').length,
  disconnected: rows.filter(r => r.status === 'disconnected').length,
  waiting:      rows.filter(r => r.status === 'waiting').length,
}), [rows]);
```

All 4 counts update in real time as broadcast events arrive.

### 6b. Student table

White card, `#E2E8F0` border 1px, 14px radius, overflow-hidden, shadow-sm.

**4 columns** (decision Q4 — simpler than current codebase which has 5):

| Column | Width | Content |
|---|---|---|
| **Student** | flex | 36×36 forest-green avatar with white initials + full name (15/600 `#0A0F1A`) + roll number below (12/600 DM Mono `#475569`) |
| **Status** | 160px | Status badge with colored dot (see color spec below) |
| **Progress** | 240px | Horizontal progress bar (6px tall, `#F1F5F9` track, `#1A3829` fill, 500ms width transition) + DM Mono fraction `{answered}/{total}` right-aligned |
| **Actions** | 140px (text-right) | "View Profile →" text link (13/600 `#1A3829`, chevron-right icon) |

Dropped from current implementation: **Last Seen column**. The Status badge already conveys whether the student is active or disconnected.

**Header row:** `#F8FAFC` bg, 13/700 uppercase `#334155` labels, letter-spacing 0.06em.
**Body rows:** divided by 1px `#F1F5F9`, hover `#FAFBFC` bg.

#### Status badge colors

```css
.status-badge.in-progress { bg: #DCFCE7; text: #14532D; dot: #1A3829; }
.status-badge.submitted   { bg: #DBEAFE; text: #1E40AF; dot: #1E40AF; }
.status-badge.disconnected{ bg: #FEE2E2; text: #991B1B; dot: #DC2626 pulsing; }
.status-badge.waiting     { bg: #F1F5F9; text: #475569; dot: #94A3B8; }
```

Disconnected badge dot has `animation: pulse 2s ease-in-out infinite` to draw the eye.

### Empty student table state

If the exam is live but no students have enrolled sessions yet (edge case — shouldn't happen in practice):
- Single cell spanning all columns
- Centered, padding 56×16
- Icon: users-x (40×40 `#CBD5E1`)
- Title: "No students in this session yet" (16/700 `#475569`)
- Subtitle: "Students will appear here as they join." (13/500 `#94A3B8`)

### Data flow (existing, unchanged)

The existing `monitor-client.tsx` already wires up:
- Server fetch of initial sessions (with student info and submission state)
- Broadcast channel `exam:{paperId}` subscription (heartbeat, answer_saved, submitted, status_change, lifecycle, exam_closed)
- Presence channel `lobby:{paperId}` subscription (join, leave)
- Countdown timer via `setInterval`

The redesign reuses all of this. Only the rendered JSX changes.

---

## 7. Screen 3 — Force Close Dialog

**Trigger:** Click "Force Close Exam" button on the Detail hero.

### Dialog shell

- Full viewport backdrop: `rgba(10, 15, 26, 0.5)` (slightly darker than standard dialog backdrop because this is destructive)
- Max-width 520px, white bg, 18px radius, shadow `0 24px 64px rgba(10,15,26,0.3)`
- **Red top border 4px (`#DC2626`)** — visual "this is destructive" flag

### Head (padding 28×32×20, text-center)

- **Big warning icon** — 72×72 round circle, `#FEE2E2` bg, centered alert-triangle lucide icon (34×34, `#991B1B`, stroke 2)
- **Title** — "Force Close Exam?" (22/700 `#0A0F1A` -0.018em, margin-bottom 8)
- **Description** (14/500 `#334155` line-height 1.5, max-width 420, mx-auto):
  > "This will immediately end **Q3 Mental Arithmetic** for all active students. Students who haven't submitted yet will **lose any in-progress answers**. This action cannot be undone."
- Bold parts in `#0A0F1A` 700

### Body (padding 0×32×24)

**Impact box:**
- `#FEF2F2` bg, `#FECACA` border 1px, 12px radius, padding 18×20, margin-bottom 18
- **Title line:** "IMPACT SUMMARY" (11/700 uppercase `#991B1B` letter-spacing 0.08em)
- **Three rows** (padding 6×0, internal dividers `#FECACA`):
  - "Students currently taking the exam" → value in DM Mono 700 `#991B1B` (count of `in_progress`)
  - "Already submitted" → value in DM Mono 700 `#0A0F1A` (count of `submitted`)
  - "Will be force-closed mid-answer" → value in DM Mono 700 `#991B1B` (count of `in_progress`, same as first row — repeated as a direct consequence statement)

**Type-to-confirm input:**
- Label: "Type **CLOSE** to confirm" (13/700 `#334155`)
  - The word `CLOSE` inside the label is styled as a chip: DM Mono, `#FEE2E2` bg, `#991B1B` text, 2×6 padding, 4px radius
- Input: full width, h-46, 2px `#FECACA` border, 10px radius, DM Mono 16/700 `#0A0F1A` letter-spacing 0.04em
- Placeholder: "CLOSE" in `#CBD5E1` 500
- Focus state: border `#DC2626`, glow `0 0 0 3px rgba(220,38,38,0.1)`

### Footer (padding 18×32, `#FAFBFC` bg, `#F1F5F9` top border, flex justify-end, 10px gap)

- **Cancel button** — outline (`#FFFFFF` bg, `#E2E8F0` border, `#1E293B` text, h-42)
- **Force Close Exam button** — `#DC2626` bg, white text, h-42, circle-slash icon + text
  - **Disabled state (default):** opacity 0.5, cursor not-allowed
  - **Enabled state:** when the confirm input value **exactly equals** the string `"CLOSE"` (case-sensitive)
  - On click: calls `forceCloseExam({ assessment_id })` (existing action), closes dialog, the Detail page transitions to the Closed Summary state via the broadcast `exam_closed` event

### Behavior

- Backdrop click: does NOT close the dialog (to prevent accidental dismissal of a destructive flow)
- Escape key: closes the dialog
- Cancel button: closes the dialog
- Admin can only proceed by typing `CLOSE` and clicking the Force Close button

---

## 8. Screen 4 — Closed Summary (same route, different state)

**When:** The Detail page transitions into this state when the exam status changes to `CLOSED`. Triggered by:
1. `exam_closed` broadcast event (from Force Close action)
2. Duration timer reaching zero on the client (could also be driven by server)
3. Page load after the paper's status is already CLOSED (admin navigates back to a closed exam)

The state change is **purely visual** — same route, same component, different rendering branch.

### Changes to the Hero card

- Left accent bar changes from `#DC2626` → `#94A3B8` (gray)
- **"MONITORING LIVE SESSION" label** → **"SESSION COMPLETE"**
- **Live badge** → **Closed badge** (`#E2E8F0` bg, `#475569` text, no pulse dot)
- **Big timer card** changes:
  - Label "TIME REMAINING" → **"ENDED AT"**
  - Value changes to the wall-clock time the exam ended (e.g. "2:47 PM") in DM Mono 18/700 `#334155`
  - Container bg changes from `#FEF2F2` → `#F1F5F9`, border from `#FECACA` → `#CBD5E1`
- **Force Close button** → **"View in Results →" primary forest-green button**
  - `#1A3829` bg, white text, h-42, bar-chart-2 icon + "View in Results →"
  - On click: navigates to `/admin/results/[paperId]` (Results Detail from the Results flow spec)

### KPI row (unchanged structure, just shows final values)

- **In Progress** should be 0 (everyone has either submitted or dropped)
- **Submitted** shows final count
- **Disconnected** shows final count (stays as-is)
- **Waiting** shows students who never showed up — now labeled as "no-shows" conceptually, but the count/label don't change

### New Session Summary card (below the hero)

White card, `#E2E8F0` border 1px, 14px radius, padding 24×26, shadow-sm.

**Head:**
- Left: 36×36 blue icon chip (`#EFF6FF` bg, `#1E3A8A` file-text icon) + "Session Summary" title (17/700 `#0A0F1A`)
- Right: "Closed **2:47 PM** · Duration **32 min**" (13/500 `#475569`, bold parts in DM Mono 700 `#0A0F1A`)

**Stats grid** — `grid-template-columns: repeat(4, 1fr)`, 16px gap. Each stat card:
- Padding 16×18, `#F8FAFC` bg, `#E2E8F0` border, 12px radius
- **Label** (11/700 uppercase `#475569` letter-spacing 0.06em, margin-bottom 8)
- **Value** (DM Mono 28/700 line-height 1 letter-spacing -0.02em)
- **Sub line** (11/500 `#475569`, margin-top 6)

Four stats:
- **Total Enrolled** — 24 / "students in Level 3"
- **Submitted** — 22 (green `#1A3829`) / "91.7% completion"
- **Incomplete** — 2 (red `#991B1B`) / "1 disconnected · 1 no-show"
- **Avg Progress** — 91% / "across all attempts"

### Student table changes

- Realtime pill above the table is **hidden** (no more updates coming)
- Filter strip stays but the realtime pill is removed
- Table column header "Status" → "Final Status"
- Status badges are frozen at final values
- The "View Profile →" action link on each row becomes **"Answer Sheet →"** — clicking navigates to `/admin/results/[paperId]/students/[studentId]` (the answer sheet screen from the Results flow)
- For the **"waiting" / no-show rows:** status badge label changes from "Waiting" to "No-show"; the action column shows an em-dash "—" instead of a link (no answer sheet for a student who never started)
- No new rows will be added; no realtime updates are processed

### Action row (new, at the bottom of the main content)

- Flex justify-end, 10px gap, margin-top 20
- **Export Summary** — outline button (`#FFFFFF` bg, `#E2E8F0` border, `#1E293B` text, h-42, download icon + text). Exports a CSV of the session (session metadata + student roster with final status + progress — no per-question answers, those live on Results)
- **Go to Results →** — primary large button (`btn-lg`, 50px tall, 16/700, `#1A3829` bg, bar-chart-2 icon + text). Navigates to `/admin/results/[paperId]` (the Results Detail page from the Results flow)

### Realtime behavior after close

- The Broadcast and Presence channel subscriptions are **unsubscribed** when the status flips to CLOSED
- No more events are processed
- The component is essentially a read-only view of the frozen state

---

## 9. Database Changes

**None.** Uses existing `exam_papers`, `assessment_sessions`, `submissions`, `student_answers` tables unchanged. The `archived_at` column from the Results flow is also used but was already added in that spec.

### Server actions used

All already exist in `src/app/actions/assessments.ts`:
- `forceCloseExam({ assessment_id })` — existing, unchanged. Called from the Force Close dialog confirm.

No new server actions needed for this flow.

---

## 10. Files to Change

### New files

```
src/app/(admin)/admin/monitor/page.tsx                          (rewrite — new Hub UI)
src/app/(admin)/admin/monitor/[id]/page.tsx                     (minor update — pass closed state)
src/app/(admin)/admin/monitor/[id]/monitor-client.tsx           (rewrite — new layout but same realtime wiring)

src/components/monitor/monitor-hub-grid.tsx                     (new — Hub card grid)
src/components/monitor/monitor-hub-card.tsx                     (new — single live exam card)
src/components/monitor/monitor-detail-hero.tsx                  (new — hero with timer + KPIs + Force Close)
src/components/monitor/monitor-detail-hero-closed.tsx            (new — closed variant of the same hero)
src/components/monitor/monitor-student-table.tsx                (new — 4-column real-time table)
src/components/monitor/monitor-student-row.tsx                   (new — single row with status badge + progress bar)
src/components/monitor/monitor-status-badge.tsx                  (new — shared badge component)
src/components/monitor/monitor-progress-bar.tsx                  (new — shared progress bar)
src/components/monitor/force-close-dialog.tsx                   (new — type-to-confirm dialog)
src/components/monitor/session-summary-card.tsx                 (new — 4-stat summary card)
src/components/monitor/monitor-empty-hub.tsx                    (new — empty state for Hub)

src/app/api/admin/monitor/[id]/export-summary.csv/route.ts      (new — CSV export for Closed state)
```

### Modified files

```
src/app/(admin)/layout.tsx                 — no changes
src/app/actions/assessments.ts             — no changes (forceCloseExam unchanged)
```

### Deleted files (from current implementation)

None — the rewrite keeps the same file paths but replaces their contents.

---

## 11. Out of Scope

- **Individual student force-close** — The current Force Close only closes the whole exam. No per-student actions (kick, extend, message). Future enhancement.
- **Live chat with students** — No messaging from admin to student during the exam. Future enhancement.
- **Extending the timer** — No UI to add 5 more minutes mid-exam. If admin needs this, they can Force Close and re-publish.
- **Pause/Resume** — The lifecycle is LIVE → CLOSED, not LIVE → PAUSED → LIVE. Paused state doesn't exist in the schema.
- **Camera/proctoring** — No webcam integration, screen recording, or anti-cheat beyond the existing `src/lib/anticheat/` systems.
- **Heatmap of active questions** — No per-question aggregate view showing "how many students are currently on Q7". Nice-to-have but not essential.
- **Admin-side notes/annotations** — No "flag this student" or "add a note" on rows. Future enhancement.
- **Multi-admin presence** — No indication of "another admin is also watching this exam". Future enhancement.

---

## 12. Decisions Locked in Brainstorm

- **Q1 (scope):** Option A — Keep all 4 screens: Hub + Detail + Force Close Dialog + Closed Summary. The Hub is useful when multiple exams are live simultaneously. The Closed Summary fills the gap between the LIVE experience and the Results Detail page.
- **Q2 (Hub card anatomy):** Option B — Standard card with title + badges + level + red time-remaining strip + active/submitted mini-stats + Monitor button. No progress timeline or sparkline.
- **Q3 (Detail hero):** Option B — Hero card with 4 inline KPI mini-cards (In Progress / Submitted / Disconnected / Waiting) + big red countdown timer + Force Close button. 4px red left accent bar on the hero card. All context in one visual unit.
- **Q4 (student table columns):** Option B — Slimmer 4-column table: Student / Status / Progress / Actions. Dropped Last Seen column because disconnected state already captures the "not active" case.
- **Q5 (Force Close confirmation):** Option B — Type-to-confirm pattern. Admin must type `CLOSE` in an input before the destructive button becomes enabled. Same pattern as GitHub/Vercel destructive flows.
- **Q6 (Closed Summary):** Option A — Same page, different state. No new route, no redirect. The Detail component handles both LIVE and CLOSED rendering branches. Closed state adds a Session Summary card and flips the action buttons to Export + Go to Results.

---

## Appendix A — Visual Reference

Browser mockup saved at:
- `docs/design-mockups/live-monitor.html` — all 4 screens stacked (Hub / Detail / Force Close Dialog / Closed Summary)

### Earlier specs this one integrates with

- `2026-04-12-admin-results-redesign-design.md` — destination of "View in Results →" button from Closed Summary, destination of "Answer Sheet →" links from the frozen student table
- `2026-04-13-admin-dashboard-design.md` — "Active Live Assessments" card section on the Dashboard also links into `/admin/monitor/[id]`, so the Detail page serves two entry points
- `2026-04-13-admin-assessments-list-design.md` — "Monitor" button on the Live rows also navigates to `/admin/monitor/[id]`, a third entry point into the same detail page

---

## Backend Dependencies

> Added by Phase 3 of the 2026-04-14 audit (see `docs/superpowers/audit/2026-04-14-phase1-findings.md` §9).

### (a) Database columns touched

All existing columns — no new schema:

- `exam_papers(id, title, type, level_id, duration_minutes, opened_at, closed_at, status, institution_id, archived_at)` — Hub list (status=LIVE) + Detail hero + Closed Summary state transition.
- `assessment_sessions(paper_id, student_id, status, closed_at, started_at)` — per-paper status partition into in-progress / submitted / disconnected / waiting.
- `submissions(id, session_id, student_id, paper_id, completed_at, score)` — "Submitted" bucket count + Closed Summary final aggregates.
- `student_answers(submission_id, question_id, selected_option)` — referenced by the post-close "Go to Results →" drill-down, not read by this spec's pages directly.
- `students(id, full_name, roll_number, level_id, institution_id)` — display names + roll numbers in the real-time table.
- `levels(name)` — denormalised on the Hub cards and Detail hero.

### (b) Server actions called

- `forceCloseExam({ assessment_id })` from `src/app/actions/assessments.ts` — existing. Called from the Force Close confirmation dialog on the Detail screen.

No other mutations. Everything else is read-only + realtime subscriptions.

### (c) RPCs / functions referenced

- **`get_live_monitor_data`** — existing live DB function (confirmed present in Phase 1 audit §1.7). The Detail page's `monitor-client.tsx` uses this RPC for the in-memory counts memo rather than hand-rolling N+1 queries. The Phase 1 §10 "Things that ARE consistent" entry confirms the RPC is usable as-is.
- No other RPCs.

### (d) Cross-spec dependencies

- **Supabase realtime infrastructure:** this spec is the primary consumer of the `exam:{paperId}` Broadcast channel (answer events) and the `lobby:{paperId}` Presence channel (join/leave). These channels are produced by the student-assessment-taking flow (`src/lib/anticheat/` + assessment-session code). No schema coupling; runtime contract only.
- **`admin-dashboard`:** the "Active Live Assessments" card on the dashboard links into `/admin/monitor/[id]`, so this detail page is a shared destination — not a dependency either way.
- **`admin-assessments-list`:** Live-row "Monitor" button is another entry point. No coupling.
- **`admin-results-redesign`:** the "Go to Results →" link from the Closed Summary state navigates to `/admin/results/[paperId]`, and "Answer Sheet →" navigates to `/admin/results/[paperId]/students/[studentId]`. Depends on the results-redesign routes existing; no schema coupling.
- **`admin-create-assessment-flow`:** the `forceOpenExam` action from that spec is the only producer of the `status = 'LIVE'` state this page lists.

---

## Query Budget

### List page (`/admin/monitor`)
**Target: ≤ 2 queries per page load.**

1. `SELECT exam_papers WHERE status = 'LIVE' AND institution_id = $1` with embedded `levels(id, name)` — single PostgREST round-trip.
2. `results_hub_paper_stats(p_paper_ids uuid[])` equivalent aggregate for live papers — or a new `get_live_exams_overview(p_institution_id)` RPC that returns paper + join_count + submit_count + level_name in one call. Implementation choice deferred to plan.

### Detail page (`/admin/monitor/[id]`)
**Target: ≤ 2 queries per page load, realtime-driven updates thereafter.**

1. `get_live_monitor_data(p_paper_id uuid)` — **existing RPC** returns paper metadata + all enrolled students + per-student session/submission state + answered-count in a single round-trip. This is the canonical way to populate the live table.
2. (Optional) initial Presence snapshot via `channel.presenceState()` after subscribing — not a DB query.

**Realtime updates (NOT page-load queries — amortised over the session):**
- Broadcast events on `exam:{paperId}` update per-row answered count. Must be debounced at 500ms per row to avoid re-rendering the whole table on every keystroke.
- Presence join/leave events on `lobby:{paperId}` update the "joined" column.

**N+1 risks to avoid:**
- ❌ Polling `get_live_monitor_data` every 2 seconds as a fallback — use realtime only. If realtime drops, show a "Reconnecting…" banner, do not poll.
- ❌ Fetching per-student `student_answers` rows individually for the answered-count. The RPC must aggregate server-side.
- ❌ Looping `students` by id for names — they're already embedded in the RPC return shape.

### Mutations
- `forceCloseExam`: 1 UPDATE + 1 activity_logs INSERT.

