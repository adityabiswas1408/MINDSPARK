# Student Dashboard Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Replace `/student/dashboard` with a radically focused live-exam landing page. One question answered: "Can I take an exam right now?"

---

## 1. Goal

The student dashboard is visited ~95% of the time when nothing is happening. When an exam *is* running, that one fact dominates the page. The redesign collapses the old two-column layout (live hero + upcoming list + right sidebar) into a single centered column with exactly **one card** that switches between two states:

- **LIVE state** — pulsing hero inviting the student to enter the exam
- **Empty state** — reassuring "all clear" card with an escape link to results

No charts, no upcoming list, no recent results, no right sidebar. Students don't use the dashboard as a history browser or progress tracker — those live on `/student/results`.

---

## 2. Route Map

```
/student/dashboard     → single page, two states (live / empty)
```

No sub-routes. No query params. The state is driven entirely by whether the student has a currently-LIVE exam paper for their level.

---

## 3. Design System Notes

Uses the MINDSPARK tokens from `docs/DESIGN.md`:
- DM Sans for UI, DM Mono tabular for numbers/timers/roll numbers
- Forest Green `#1A3829` primary (brand anchor)
- `#EFFAF4` Forest Green 50 for subtle tints
- `#B7E4C7` Forest Green 200 for pill borders
- Charcoal text scale: `#0A0F1A` / `#1E293B` / `#334155` / `#475569`
- Card radius 20px on this page (slightly larger than admin 14–16px — softer, friendlier feel for young students)
- Base 16px font size
- Lucide-react line icons, stroke 1.75
- **Student sidebar is 240px** (same width as admin sidebar), **student top header is 56px** (shorter than admin 64–68px per `docs/DESIGN.md`)

### Student sidebar contents (global — applies to this and every student page)

```
MINDSPARK (logo)
─────────────
Dashboard    (grid icon)
Exams        (book-open icon)
Tests        (zap icon)
My Results   (bar-chart-2 icon)
Profile      (user icon)
─────── (1px separator)
Help & Support  (help-circle icon)
─────────────
[Student avatar + name + "Student · Level 3"]
[Sign Out button]
```

### Student top header contents (global)

- Height 56px, white bg, 1px `#E2E8F0` bottom border
- Left: "Welcome back, **Aditi Sharma**" (14/500 `#475569`, name bold `#0A0F1A`)
- Right: bell icon button (36×36, red dot when notifications) + 36×36 avatar circle (`#1A3829` bg, white initials)

---

## 4. Page Structure

Main content area has:
- Padding 48×32 (generous vertical space so the card feels breathable)
- `justify-content: center` to horizontally center the inner column
- Inner wrapper: `max-width: 760px; width: 100%`

Two elements stacked inside the inner wrapper:

1. **Greeting header** (margin-bottom 32)
2. **Single hero card** — LIVE variant OR empty variant

That's it. No right sidebar, no footer.

---

## 5. Greeting Header

- **H1** "Hello, {first_name} 👋" — DM Sans 34/700 `#0A0F1A` letter-spacing -0.022em line-height 1.15, margin-bottom 6
- **Subtitle** — DM Sans 16/500 `#334155`
  - LIVE state: "An exam is live right now — enter when you're ready."
  - Empty state: "Nothing on right now — check back when your teacher starts an exam."
- The waving hand emoji `👋` is intentional — this is a student surface, warmth is appropriate. (It's the only emoji anywhere in the app per DESIGN.md's "no emoji in production UI" rule — I'm treating the greeting as a single explicit exception for the student dashboard only.)

**Implementation note:** The greeting subtitle changes based on whether a LIVE exam exists. Both strings are rendered on the server based on the query result.

---

## 6. LIVE Hero Card

Shown when the query returns a currently-LIVE `exam_papers` row for the student's level.

### Container

- White bg, **2px `#1A3829` border** (strong brand anchor), 20px radius
- Padding 32×36
- Box shadow: `0 8px 28px rgba(26, 56, 41, 0.08), 0 2px 6px rgba(10, 15, 26, 0.04)` — forest-green-tinted shadow
- Relative positioning + `overflow: hidden` for the radial glow effect below

### Radial glow decoration

- Absolute positioned in the top-right corner of the card
- 280×280, `background: radial-gradient(circle, rgba(26, 56, 41, 0.05) 0%, transparent 70%)`
- `pointer-events: none`
- Purely decorative — gives the card a subtle depth

### Identity strip (top of card)

A pill-shaped strip showing the student's level and candidate ID:

- `inline-flex`, items-center, 10px gap
- Padding 5×12×5×5 (left is flush with the level pill)
- Background `#EFFAF4`, border `#B7E4C7`, radius 9999
- Margin-bottom 20
- Contents:
  - **Level pill** (nested inside): 4×10 padding, `#1A3829` bg, white 11/700 uppercase text, 9999 radius, layers icon 11×11
  - `·` separator in `#94A3B8`
  - **Roll number** in DM Mono 12/700 `#1A3829`

### Top row

Flex row, items-start, 24px gap, margin-bottom 24:

**Left side (flex 1):**
- **LIVE NOW badge** — `inline-flex`, padding 6×14×6×10, `#DC2626` bg, white 11/800 uppercase letter-spacing 0.1em, 9999 radius, shadow `0 4px 12px rgba(220, 38, 38, 0.3)`, margin-bottom 14
  - Pulsing 8×8 white dot before text with `box-shadow: 0 0 0 4px rgba(255,255,255,0.25)` halo
  - `animation: pulse 2s ease-in-out infinite` — scale 1↔1.15, opacity 1↔0.5
- **Title** — DM Sans 30/700 `#0A0F1A` letter-spacing -0.02em line-height 1.15, margin-bottom 8
- **Meta row** — flex, items-center, 12px gap, 14/500 `#334155`, flex-wrap
  - Type badge (`Exam` `#EFF6FF`/`#1E3A8A` or `Test` `#F5F3FF`/`#6D28D9`, 3×10 padding, 10/700 uppercase)
  - `·` separator in `#CBD5E1`
  - Clock icon + "30 min total"
  - `·` separator
  - File-text icon + "20 questions"

**Right side (flex-shrink 0, flex-col, items-end):**
- **Label** — "TIME LEFT" (10/700 uppercase `#475569` letter-spacing 0.1em, margin-bottom 4)
- **Value** — DM Mono 44/700 `#1A3829` letter-spacing -0.035em line-height 1
- **Sub** — "to start this session" (11/500 `#475569`, margin-top 4)
- The timer counts down from `exam_papers.opened_at + duration_minutes * 60_000 - Date.now()`
- Updates every second via `setInterval`
- **Urgent state** (< 60 seconds remaining): value color changes to `#DC2626` (red) and adds a subtle pulse animation

### CTA row

Padding-top 24, top border `#F1F5F9`, flex row items-center justify-between 16px gap:

**Left — CTA hint:**
- Flex row, items-center, 10px gap
- Shield-check icon (16×16 `#1A3829`)
- Text "Make sure you're in a quiet space before you enter." (13/500 `#475569`)

**Right — Enter button:**
- `inline-flex`, items-center, 10px gap
- Padding 0×26, **height 56** (extra-large, inviting click target)
- `#1A3829` bg, white text, **14px radius**, DM Sans 16/700 letter-spacing -0.005em
- Box shadow: `0 8px 24px rgba(26, 56, 41, 0.3), 0 2px 6px rgba(26, 56, 41, 0.2)` — strong, inviting
- Text: "Enter Examination Hall"
- Arrow-right icon after the text (18×18, stroke 2.5)
- Hover: bg `#0F2319`
- On click: navigates to `/student/exams/[id]/lobby` (the lobby route, which will be designed in the upcoming Exams & Tests flow spec)

### Data flow

```ts
// Server component — fetches current student + level + any LIVE exam for their level
const { data: student } = await supabase
  .from('students')
  .select('full_name, roll_number, level_id, levels(id, name)')
  .eq('id', userId)
  .single();

const { data: liveExam } = await supabase
  .from('exam_papers')
  .select('id, title, type, duration_minutes, opened_at, question_count')
  .eq('status', 'LIVE')
  .eq('institution_id', institutionId)
  .eq('level_id', student.level_id)
  .limit(1)
  .maybeSingle();
```

Simple query — 1 round-trip to get the student + 1 to get the possible live exam. Could be combined into an RPC if needed.

---

## 7. Empty State Card

Shown when there is no LIVE exam for the student's level.

### Container

- White bg, `#E2E8F0` border 1px, 20px radius (same radius as LIVE hero for visual consistency), padding 56×40
- Shadow `0 1px 3px rgba(10, 15, 26, 0.04)` (much lighter than LIVE hero — the empty state is calm, not urgent)
- Text-center

### Content

**Shield icon (decorative anchor):**
- 88×88 round circle, `#EFFAF4` bg, `#1A3829` shield-check icon 40×40 stroke 1.75 (same icon as the LIVE state's "quiet space" hint, which creates a consistent "we've got you" motif)
- Absolute positioned `::after` pseudo-element: dashed `#B7E4C7` border, offset -8px from the circle, radius 9999 — creates a soft halo
- Margin-bottom 24

**Title:**
- "All clear — no exams right now" — DM Sans 24/700 `#0A0F1A` letter-spacing -0.018em, margin-bottom 10

**Subtitle:**
- "Your teacher will start an exam when it's time. Until then, you can rest or review how you did on your last assessments."
- DM Sans 15/500 `#334155` line-height 1.6 max-width 440 mx-auto

**Divider (decorative):**
- 48×2 line, `#E2E8F0`, 9999 radius, margin 28 0

**Escape link:**
- `inline-flex`, items-center, 6px gap
- Padding 10×18, white bg, `#E2E8F0` border, 10px radius, 14/600 `#1A3829`
- Text: "View My Results"
- Left icon: bar-chart-2 (14×14 stroke 2)
- Right icon: chevron-right (14×14 stroke 2)
- Hover: `#EFFAF4` bg, `#1A3829` border
- On click: navigates to `/student/results`

This link is the only interactive element on the empty state. It gives students something useful to do instead of stranding them on an empty page.

---

## 8. State Transitions

Three things can cause the dashboard to change state:

1. **On page load** — Server Component fetches the student's level + checks for any LIVE exam in that level. Renders the appropriate state.
2. **A new exam goes LIVE while the student is on the dashboard** — Admin clicks "Start Session Now" on the assessment, which calls `forceOpenExam`. A broadcast event on `exam:institution:{institutionId}` fires. A small client-side subscription on the student dashboard listens for this event, and when one arrives for an exam matching the student's level, the page auto-refreshes (or swaps state in place without a full reload).
3. **The LIVE exam closes while the student is on the dashboard** — Another broadcast event `exam_closed`. The page reverts to the empty state.

The client-side subscription is optional but recommended — without it, a student might sit on the empty dashboard for minutes while their teacher starts an exam, not realizing they should refresh.

Implementation sketch (out of scope for this spec but noted):

```ts
useEffect(() => {
  const supabase = createClient();
  const ch = supabase
    .channel(`student-level:${levelId}`)
    .on('broadcast', { event: 'exam_live' }, () => router.refresh())
    .on('broadcast', { event: 'exam_closed' }, () => router.refresh())
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}, [levelId]);
```

---

## 9. Database Changes

**None.** Uses existing `students`, `levels`, `exam_papers` tables.

### Server actions used

None. The dashboard is a read-only Server Component. The "Enter Examination Hall" button is a `<Link>` to the lobby route.

---

## 10. Files to Change

### New files

```
src/components/student/dashboard-hero-live.tsx       (new — LIVE hero card with identity strip + badge + timer + CTA)
src/components/student/dashboard-hero-empty.tsx      (new — reassuring empty state card)
src/components/student/dashboard-greeting.tsx        (new — H1 + subtitle, switches string based on state)
src/components/student/dashboard-live-timer.tsx      (new — client component for the DM Mono countdown)
```

### Modified files

```
src/app/(student)/student/dashboard/page.tsx              — rewrite for new layout
src/components/student/live-exam-card.tsx                  — DELETE (replaced by dashboard-hero-live)
```

### Global chrome (affects every student page, not just dashboard)

These are changes to the student layout that this spec depends on but also benefit all other student pages:

```
src/app/(student)/layout.tsx                               — add sidebar with Sign Out footer
src/components/student/student-sidebar.tsx                 — new — 5 main nav items + Help & Support + sidebar footer
src/components/student/student-topbar.tsx                  — new — 56px bar with welcome text + bell + avatar
```

These chrome changes will be re-referenced by the future Student Exams, Tests, Results, and Profile specs — they're written here once.

---

## 11. Out of Scope

- **Upcoming assessments list** — removed per Q3 decision. Lives on `/student/exams` and `/student/tests`.
- **Recent results preview** — removed per Q4 decision. Lives on `/student/results`.
- **Progress tracking / streak / stats** — no dashboard-level analytics. Students see performance on the Results page.
- **Announcements feed** — admin Announcements are out of scope for this version per user decision. No banner on the student dashboard.
- **Notifications panel** — bell icon is present but notification center UI is out of scope.
- **Scheduled exam countdown** — there's no `scheduled_start_at` column yet, so "your next exam starts in 2 hours" isn't possible.
- **Dashboard customization** — students can't rearrange or hide elements.
- **Dark mode** — light theme only (same as admin).
- **Multi-student profiles per device** — one session = one student.

---

## 12. Decisions Locked in Brainstorm

- **Q1 (primary job):** Option A — Operational. "Can I take an exam right now?" is the only question this page answers.
- **Q2 (live exam treatment):** Option B — Full-width hero card with pulsing LIVE NOW badge and extra-large CTA button.
- **Q3 (upcoming section):** REMOVED. Dashboard is live-only.
- **Q4 (recent results):** Option A — No results on dashboard.
- **Q5 (identity):** Option D — Embedded in the hero card as a pill strip at the top (Level + Candidate ID).
- **Q6 (empty state):** Option A — Reassuring calm card with shield icon + friendly copy + subtle "View My Results" escape link.
- **Q7 (header greeting):** Option C — Large personalized H1 "Hello, Aditi 👋" + contextual subtitle that changes based on live/empty state.

---

## Appendix A — Visual Reference

Browser mockup saved at:
- `.superpowers/brainstorm/223-1776020821/content/student-dashboard.html` — both states (LIVE exam and empty) stacked in one file

### Earlier admin specs for pattern reference

- `2026-04-13-admin-dashboard-design.md` — admin dashboard shares the "operational command center" framing. The student version is the simpler mirror — live action at the top, minimal decoration.
- `2026-04-12-admin-results-redesign-design.md` — the LIVE hero card's red badge with pulsing dot is the same pattern used for the Live Monitor state.
- `2026-04-13-admin-create-assessment-flow-design.md` — "Start Session Now" on the Success page is what flips an assessment to LIVE, which is what triggers this dashboard's LIVE state.
