# Student Exams & Tests Flow Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Two parallel flows for student-facing assessment lists — `/student/exams` (vertical EXAM-type) and `/student/tests` (Flash Anzan TEST-type) — plus the read-only exam info detail page and the pre-assessment Lobby page. Both list pages use a tabbed Live Now / Upcoming / Completed structure.

---

## 1. Goal

Replace the current single-page stacked sections with a focused **tabbed list** that shows one state at a time. Students see exactly the bucket they care about — what's live right now, what's coming up, or what they've finished — without scrolling past the others.

Two parallel pages:
- **`/student/exams`** filters to `type=EXAM` (vertical arithmetic with MCQ)
- **`/student/tests`** filters to `type=TEST` (Flash Anzan speed drills)

Both pages share the same structure, components, and behaviors. The only differences are the page heading, type-specific copy, type icon color, and the wording of empty states.

The Detail page (read-only when not yet live) and the Lobby page (calm pre-assessment screen with breathing circle and consent) are also covered in this spec because they're the natural drill-down destinations from the list rows.

---

## 2. Route Map

```
/student/exams                          → Exams list (EXAM type)
/student/exams?tab=live                  → Default — Live Now tab active
/student/exams?tab=upcoming              → Upcoming tab active
/student/exams?tab=completed             → Completed tab active

/student/exams/[id]                     → Read-only exam info detail page
/student/exams/[id]/lobby                → Pre-assessment lobby (full-canvas)

/student/tests                          → Tests list (TEST type) — same structure
/student/tests?tab=live                  → Default — Live Now tab active
/student/tests?tab=upcoming              → Upcoming tab active
/student/tests?tab=completed             → Completed tab active

/student/tests/[id]                     → Read-only test info detail page
/student/tests/[id]/lobby                → Same lobby route mirrored for tests
```

The `?tab=` query param drives which tab is active. Default tab on first load is `live` so students immediately see if they have anything urgent.

---

## 3. Design System Notes

Uses the established MINDSPARK tokens from `docs/DESIGN.md` and earlier specs in this session:
- DM Sans for UI, DM Mono tabular for numbers/timers/dates
- Forest Green `#1A3829` primary
- Red `#DC2626` for live urgency
- Charcoal text scale: `#0A0F1A` / `#1E293B` / `#334155` / `#475569`
- Card radius 14–20px (varies by container weight)
- Base 16px font
- Lucide-react line icons, stroke 1.75
- Global student sidebar (240px) + student top header (56px) from the Student Dashboard spec

Type-specific accents (consistent across admin and student panels):
- **EXAM** — blue tint (`#EFF6FF` bg, `#1E3A8A` text, `#DBEAFE` border)
- **TEST** — purple tint (`#F5F3FF` bg, `#6D28D9` text, `#EDE9FE` border)

---

## 4. Tab Strip

The same tab strip pattern is used on both `/student/exams` and `/student/tests`.

### Visual

- `inline-flex`, padding 4, white bg, `#E2E8F0` border 1px, 12px radius, 24px margin-bottom
- Subtle shadow: `0 1px 3px rgba(10, 15, 26, 0.04)`
- 3 tabs with 2px gap between them

### Each tab

- Padding 10×20, 14/600, 9px radius, 14px font, letter-spacing 0.01em
- Inactive: `#475569` text, transparent bg, hover `#F8FAFC` bg
- **Active:** `#0A0F1A` (near-black) bg, white text, shadow `0 2px 6px rgba(10, 15, 26, 0.2)` — high contrast so the active state is unmistakable
- Each tab includes a count pill: 2×8 padding, 9999 radius, 11/700 DM Mono
  - Inactive count: `#F1F5F9` bg, `#64748B` text
  - Active count: `rgba(255,255,255,0.15)` bg, white text

### Live Now tab — special pulse dot

The "Live Now" tab gets a persistent red pulse dot before the label (visible even when the tab is inactive — it's a constant visual reminder that this state matters):
- 6×6 round dot, `#DC2626` bg, `#FEE2E2` halo (2px box-shadow)
- `animation: pulse 2s ease-in-out infinite` — opacity 1 ↔ 0.5
- When the tab is active, the halo color shifts to `rgba(220, 38, 38, 0.3)` for visibility on the dark background

### Counts

The counts in each tab reflect the current student's filtered totals (their level + their type). Live Now might show 0 most of the time; Completed grows over time.

### Tab order (left to right)

Always **Live Now → Upcoming → Completed**. This matches the lifecycle order and the visual urgency order (most urgent first).

---

## 5. Live Now Tab Content

### State A — Has a live exam

When the count is ≥ 1, the tab content is a **single full-width hero card** (the same big card from the Student Dashboard spec, slightly adapted for the list page context):

- White bg, **2px `#1A3829` border**, 20px radius, padding 32×36
- Box shadow: `0 8px 28px rgba(26, 56, 41, 0.08), 0 2px 6px rgba(10, 15, 26, 0.04)`
- Decorative radial-gradient glow in the top-right corner (forest green, 5% opacity)

**Top row (flex justify-between, 24px gap, margin-bottom 24):**
- **Left side:**
  - **LIVE NOW badge** — red pill, 6×14 padding, `#DC2626` bg, white 11/800 uppercase text, pulsing 8×8 white dot prefix, shadow `0 4px 12px rgba(220, 38, 38, 0.3)`, margin-bottom 14
  - **Title** — DM Sans 28/700 `#0A0F1A` letter-spacing -0.02em, margin-bottom 8
  - **Meta row** — flex 12px gap, 14/500 `#334155`, items:
    - Type badge (Exam blue or Test purple, 10/700 uppercase pill)
    - `·` separator
    - Clock icon + duration (e.g. "30 min total" / "15 min total")
    - `·` separator
    - File icon + count (e.g. "20 questions" for EXAM / "10 sequences" for TEST)
- **Right side — countdown:**
  - "CLOSES IN" label (10/700 uppercase `#475569`)
  - Value in DM Mono 42/700 `#1A3829` letter-spacing -0.035em
  - "to start this session" subtext (11/500 `#475569`)

**CTA row (padding-top 24, top border `#F1F5F9`):**
- **Left:** shield-check icon + hint text (13/500 `#475569`)
  - For Exams: "Make sure you're in a quiet space before you enter."
  - For Tests: "Focus on the center — numbers will flash fast."
- **Right:** Enter button — `#1A3829` bg, white text, h-54, padding 0×26, 14px radius, 16/700, deep shadow `0 8px 24px rgba(26, 56, 41, 0.3), 0 2px 6px rgba(26, 56, 41, 0.2)`
  - Exams button label: "Enter Examination Hall →"
  - Tests button label: "Start Flash Test →"
  - On click: navigates to `/student/exams/[id]/lobby` (or the equivalent tests route)

### State B — No live exam (empty state)

When count is 0, the tab content is a centered empty state card:

- White bg, `#E2E8F0` border 1px, 20px radius, padding 56×40, text-center
- 72×72 round icon chip — **`#FEE2E2` bg, `#991B1B` color** (red theme matches the tab)
  - Icon: lucide `monitor` (32×32, stroke 1.75)
- **Title** (20/700 `#0A0F1A`): "No exam is live right now" / "No test is live right now"
- **Subtitle** (14/500 `#475569` max-width 420 line-height 1.6):
  - For Exams: "Your teacher will start an exam when it's time. Check the Upcoming tab to see what's scheduled next."
  - For Tests: "Your teacher will start a test when it's time. Check the Upcoming tab to see what's scheduled next."

---

## 6. Upcoming Tab Content

### State A — Has upcoming exams/tests

A vertical list of upcoming row cards, 12px gap.

**Each upcoming row:**
- Flex row, items-center, 16px gap
- Padding 18×20, white bg, `#E2E8F0` border 1px, 14px radius
- Box shadow: `0 1px 3px rgba(10, 15, 26, 0.04)`
- Cursor pointer, on click navigates to `/student/exams/[id]` (the read-only Detail page)
- Hover: border `#1A3829`, `transform: translateY(-1px)`, shadow deepens

**Row contents:**
1. **Date badge (56×varies, flex-shrink 0):**
   - `#EFFAF4` bg, `#B7E4C7` border 1px, 12px radius, padding 8×4, text-center
   - Top line: month abbreviation in 10/800 uppercase `#1A3829` letter-spacing 0.06em (e.g. "APR")
   - Bottom line: day in DM Mono 22/700 `#0A0F1A` line-height 1
2. **Info column (flex 1, min-w 0):**
   - Title: 16/700 `#0A0F1A` letter-spacing -0.008em, margin-bottom 5
   - Meta row: 13/500 `#475569` flex 8px gap
     - Type mini-badge (EXAM blue / TEST purple, 2×8 padding, 10/700)
     - `·` separator
     - Duration (e.g. "20 min")
     - `·` separator
     - Count (e.g. "15 questions" / "10 sequences")
3. **Right cluster (flex-shrink 0, flex 12px gap):**
   - **"Scheduled" pill** — amber theme: `#FEF3C7` bg, `#FDE68A` border, `#92400E` text, 5×12 padding, 9999 radius, 11/700, with a 6×6 amber dot prefix
   - **Chevron icon** — 18×18 `#CBD5E1` stroke 2

### State B — No upcoming exams (empty state)

- Same empty-card shell as the Live Now empty state
- Icon chip: **`#FEF3C7` bg, `#92400E` color** (amber theme matches the tab's "scheduled" pills)
- Icon: lucide `calendar` (32×32)
- Title: "No upcoming exams" / "No upcoming tests"
- Subtitle: "Your teacher hasn't scheduled any new exams yet." / "Your teacher hasn't scheduled any new tests yet."

---

## 7. Completed Tab Content

### State A — Has completed assessments

A vertical list of completed row cards, 12px gap.

**Each completed row:**
- Flex row, items-center, 16px gap
- Padding 18×20, white bg, `#E2E8F0` border 1px, 14px radius, shadow-sm
- Cursor pointer → navigates to the Result Detail page in the Results flow
- Hover: border `#1A3829`, lift effect

**Row contents:**
1. **Status icon chip (48×48, 12px radius):**
   - `#DCFCE7` bg, `#14532D` icon color
   - Icon: lucide `check` (22×22, stroke 2.5)
   - Acts as the visual anchor — tells the student "this is done and you have a result"
2. **Info column (flex 1, min-w 0):**
   - Title: 16/700 `#0A0F1A` letter-spacing -0.008em, margin-bottom 5
   - Meta row: 13/500 `#475569` flex 10px gap
     - Date (e.g. "Apr 10, 2026")
     - `·` separator (in `#CBD5E1`)
     - Duration (e.g. "30 min")
3. **Score chip (flex-shrink 0):**
   - Inline-flex, baseline-aligned
   - 6×14 padding, `#DCFCE7` bg, `#14532D` text, 9999 radius
   - Score in DM Mono 16/700 (e.g. "19")
   - Denominator in DM Mono 13/500 `#166534` opacity 0.8 (e.g. "/20")
4. **"View Result" link (flex-shrink 0):**
   - 6×12 padding, white bg, `#E2E8F0` border, 8px radius
   - 13/600 `#1A3829` text + chevron-right 12×12 icon
   - Cursor pointer → navigates to `/student/results/[id]` (Result Detail from the Results flow)

**Important visual choice:** Completed rows are **NOT muted/grayed**. They look as alive as the upcoming rows. These are the student's accomplishments — the design should honor them, not bury them. Removed the `opacity: 0.7` from the current implementation.

### State B — No completed exams (empty state)

- Same empty-card shell
- Icon chip: **`#F1F5F9` bg, `#475569` color** (slate theme matches the tab)
- Icon: lucide `clipboard-check` (32×32)
- Title: "No completed exams yet" / "No completed tests yet"
- Subtitle: "After you finish your first exam, it'll appear here." / "After you finish your first test, it'll appear here."

---

## 8. Page Header (above the tab strip)

Same on both Exams and Tests pages, only the title and subtitle differ:

- **H1 "Exams"** or **H1 "Tests"** — DM Sans 30/700 `#0A0F1A` letter-spacing -0.018em, margin-bottom 6
- **Subtitle**:
  - Exams: "Your vertical arithmetic assessments."
  - Tests: "Flash Anzan speed drills. Numbers flash fast — compute mentally."
- Margin-bottom 28 to separate from the tab strip

---

## 9. Offline Banner (global to all student pages, not just this flow)

When the student's browser is offline, a yellow banner appears at the top of the page (between the top header and the main content):

- Background `#FEF3C7`, bottom border `#FDE68A` 1px
- Padding 10×24
- Icon: lucide `wifi-off` (16×16 `#92400E`, stroke 2)
- Text (13/600 `#92400E`): "You're offline. Your answers will sync when you reconnect."

The banner is **only shown when offline** — when online, no indicator at all. Detected via `navigator.onLine` + the `online`/`offline` window events.

This banner is global to the student layout, so it applies to every student page (dashboard, exams, tests, results, profile). It belongs in the layout file, not this spec's components.

---

## 10. Exam/Test Info Detail Page (read-only)

**Route:** `/student/exams/[id]` and `/student/tests/[id]`

When a student clicks an Upcoming row, they land on a read-only info page. PUBLISHED but not yet LIVE.

### Layout

1. **Admin chrome** — student sidebar + top header
2. **Back link** — "← Back to Exams" / "← Back to Tests" (DM Sans 14/500 `#334155`)
3. **Single white card** centered (max-width 820, white bg, `#E2E8F0` border, 20px radius, padding 32×36, shadow-sm)

### Card contents

- **Status pill at the top:** amber-themed
  - `#FEF3C7` bg, `#FDE68A` border 1px, `#92400E` text, 9999 radius, 5×12 padding, 11/700 uppercase letter-spacing 0.05em, clock icon + "Not Yet Available"
- **Title** — DM Sans 28/700 `#0A0F1A` letter-spacing -0.018em margin-bottom 8
- **Subtitle** — 15/500 `#475569` (e.g. "Level 3 · Scheduled for Apr 22, 2026")

- **Info grid (margin-top 28, padding-top 28, top border `#F1F5F9`):**
  - `grid-template-columns: repeat(3, 1fr)`, 14px gap
  - Three info cells, each:
    - Padding 16×18, `#F8FAFC` bg, `#E2E8F0` border, 12px radius
    - Label (10/700 uppercase `#475569` letter-spacing 0.06em, margin-bottom 6)
    - Value (DM Mono 22/700 `#0A0F1A` letter-spacing -0.02em line-height 1) with optional inline unit suffix in 14/500 `#475569`
    - Sub line (11/500 `#475569` margin-top 6)
  - Three cells:
    1. **Duration** — value `45` + unit `min` + sub "time limit"
    2. **Questions** (or **Sequences** for TEST) — value `25` + sub "vertical arithmetic" / "flash sequences"
    3. **Level** — value `3` + sub "intermediate"

- **Notice block (margin-top 28):**
  - Padding 18×22, `#EFF6FF` bg, `#DBEAFE` border 1px, 14px radius
  - Flex row, items-start, 12px gap
  - Info-circle icon (20×20 `#1E3A8A` stroke 2)
  - Content:
    - Title: "Not yet available" (14/700 `#1E3A8A`)
    - Sub: "This exam isn't open yet. Your teacher will start it when it's time. Check back or keep this page open — it will update automatically when the exam goes live." (13/500 `#334155` line-height 1.5)

### Behavior

- The page is **read-only** — no Enter button, no countdown
- **Auto-refresh on status change:** a client-side subscription on the broadcast channel `exam:institution:{institutionId}` listens for `exam_live` events. When one arrives matching this paper's ID, the page refreshes and the student is redirected to the lobby (or the page transitions in-place to show the LIVE state with an Enter button)

---

## 11. Lobby Page (full-canvas)

**Route:** `/student/exams/[id]/lobby` (and the equivalent tests route)

The calm pre-assessment screen. Sidebar is **hidden** for this route — the lobby is full-canvas focus mode.

### Layout

- Full white canvas, min-height matching the viewport
- Centered content column, max-width 520, text-center
- 60×40 padding around the canvas
- Position relative for the exit button

### Exit button (top-left)

- Absolute positioned top 32 / left 32
- White bg, `#E2E8F0` border, 10px radius, padding 8×14, 13/600 `#475569`
- X icon + "Leave Lobby" text
- On click: returns to the previous page (`/student/exams` typically)

### Centered content stack (top to bottom)

1. **Breathing circle**
   - 132×132, 9999 radius
   - Border 2px `rgba(26, 56, 41, 0.3)`
   - Background `rgba(26, 56, 41, 0.04)`
   - `animation: breathe 4s ease-in-out infinite` — scale 1 ↔ 1.08
   - Margin 0 auto 32

2. **Countdown timer**
   - DM Mono 76/700 `#1A3829` letter-spacing -0.04em line-height 1
   - Format: `MM:SS` (e.g. "00:28")
   - Counts down to when the exam opens (or how long it's been open if already live)
   - Margin-bottom 10

3. **"TIME REMAINING" label**
   - 11/800 uppercase `#94A3B8` letter-spacing 0.12em
   - Margin-bottom 32

4. **Exam title**
   - 26/700 `#0A0F1A` letter-spacing -0.018em margin-bottom 10

5. **Subtitle**
   - "Prepare your workspace. The assessment will begin when you click I'm Ready."
   - 15/500 `#475569` max-width 380 line-height 1.5 margin-bottom 28

6. **Network status pill**
   - Inline-flex, padding 8×18, 9999 radius, gap 10
   - Background varies by state:
     - **Optimal** — `#DCFCE7` bg, `#BBF7D0` border, `#14532D` text
     - **Degraded** — `#FEF3C7` bg, `#FDE68A` border, `#92400E` text
     - **Severed** — `#FEE2E2` bg, `#FECACA` border, `#991B1B` text
   - Pulsing 8×8 dot in matching darker color
   - Wifi icon (14×14 stroke 2)
   - Two-line text block:
     - Big line: state in 11/800 uppercase letter-spacing 0.08em ("OPTIMAL", etc.)
     - Small line: 10/500 opacity 0.8 (e.g. "Latency < 500 ms")
   - Margin-bottom 28

7. **Consent row**
   - Inline-flex, padding 12×18, 12px gap
   - `#F8FAFC` bg, `#E2E8F0` border, 12px radius
   - 22×22 round green check chip (`#DCFCE7` bg, `#14532D` check icon)
   - Text: "**Academic Integrity Policy** acknowledged" (13/500 `#334155`, bold part `#0A0F1A`)
   - Margin-bottom 24

8. **"I'm Ready →" button**
   - Width 100%, max-width 340, mx-auto
   - Height 60, padding 0×30
   - `#1A3829` bg, white text, 14px radius, 17/700
   - Deep shadow: `0 12px 28px rgba(26, 56, 41, 0.3), 0 4px 8px rgba(26, 56, 41, 0.2)`
   - Arrow-right icon (18×18, stroke 2.5)
   - On click: navigates to `/student/assessment/[id]` (the actual exam-taking surface — designed in the next spec)

9. **Legal caption**
   - 12/500 `#94A3B8` max-width 340 mx-auto line-height 1.5
   - Text: "By clicking I'm Ready, you agree to begin the assessment under monitored conditions."
   - Margin-top 18

### Network state engine

- Lobby uses the existing `useNetworkStatus` hook (or equivalent) from `src/lib/anticheat/` or `src/lib/offline/`
- Polls a small endpoint every 5 seconds to measure latency
- < 500 ms = Optimal
- 500–1500 ms = Degraded
- No response or > 3000 ms = Severed
- The "I'm Ready" button is **disabled** when network state is Severed (with hint text "Reconnect before starting")

### Anti-cheat integration (existing, unchanged)

The lobby is the entry point to the exam. Before navigating to `/student/assessment/[id]`, the lobby:
1. Asserts consent has been recorded (legal/compliance — already exists in `src/app/(student)/student/consent/`)
2. Records a clock skew baseline via `src/lib/anticheat/clock-guard.ts`
3. Initializes the offline IndexedDB store via `src/lib/offline/indexed-db-store.ts`
4. Subscribes to the lobby presence channel `lobby:{paperId}`

These are existing behaviors and the redesign doesn't change them.

---

## 12. Database Changes

**None.** Uses existing `exam_papers`, `students`, `levels`, `submissions` tables.

### Server actions used

None on the list pages — they're Server Components doing reads.

The Lobby page calls into existing anti-cheat / offline-sync infrastructure (out of scope for this spec — that's the existing `src/lib/anticheat/` and `src/lib/offline/` codebases).

---

## 13. Files to Change

### New files

```
src/app/(student)/student/exams/page.tsx                          (rewrite — tabbed list)
src/app/(student)/student/tests/page.tsx                          (rewrite — tabbed list)
src/app/(student)/student/exams/[id]/page.tsx                     (rewrite — read-only info)
src/app/(student)/student/exams/[id]/lobby/page.tsx               (rewrite — full-canvas lobby)
src/app/(student)/student/tests/[id]/page.tsx                     (new — symmetric to exams/[id])
src/app/(student)/student/tests/[id]/lobby/page.tsx               (new — symmetric to exams lobby)

src/components/student/assessments-tab-strip.tsx                  (new — Live/Upcoming/Completed pill toggle)
src/components/student/live-hero-card.tsx                         (new — big bordered live card, shared with dashboard)
src/components/student/upcoming-row.tsx                           (new — date badge + title + scheduled pill)
src/components/student/completed-row.tsx                          (new — check icon + title + score chip + view link)
src/components/student/tab-empty-state.tsx                        (new — themed empty card per tab type)

src/components/student/exam-info-card.tsx                         (new — read-only detail card with 3 stat cells + notice)
src/components/student/lobby-canvas.tsx                           (new — full-canvas lobby orchestrator)
src/components/student/lobby-breathing-circle.tsx                 (new — 132×132 css-animated circle)
src/components/student/lobby-network-pill.tsx                     (new — Optimal/Degraded/Severed pill)
src/components/student/lobby-consent-row.tsx                      (new — green check + "policy acknowledged" row)
src/components/student/offline-banner.tsx                          (new — global yellow banner)

src/app/(student)/layout.tsx                                       (modify — add offline banner + sidebar/topbar from Dashboard spec)
```

### Deleted files (from current implementation)

```
src/components/student/live-exam-card.tsx        (replaced by live-hero-card)
```

### Layout note: hiding the sidebar on the lobby route

The Lobby page is full-canvas. Two options:
1. Move the lobby route into a `(student-focus)` route group with its own layout that doesn't render the sidebar
2. Conditional render in `(student)/layout.tsx` checking `pathname.endsWith('/lobby')`

Option 1 is cleaner. Recommended.

> **Phase 2 audit note (2026-04-14):** The `(student-focus)` route group is **created by the 2026-04-14 student-assessment-taking-flow plan** (`docs/superpowers/plans/2026-04-14-student-assessment-taking-flow.md` Task 3). This spec's lobby route should mount inside that same group when its plan is written — do NOT create a separate `(student-focus)` layout. The plan dependency is one-way: assessment-taking-flow creates the group, exams-tests-flow reuses it.

> **Phase 2 audit correction (2026-04-14):** §13's "Modified files" entry says `src/app/(student)/layout.tsx — modify — add offline banner + sidebar/topbar from Dashboard spec`. The sidebar and topbar already exist in the live layout (verified by reading `src/app/(student)/layout.tsx`) — wrapped via `<StudentSidebar />` and `<StudentHeader />`. The plan task should say **"verify, do not re-add"** for the sidebar/topbar. The offline banner is a real new addition.

---

## 14. Out of Scope

- **Filters and search on the list pages** — students don't have enough exams to need filtering. Tabs are enough.
- **Sorting** — completed exams are sorted most-recent-first by default. No user-controlled sort.
- **Pagination** — student exam counts are typically small (dozens at most over a school year). No pagination needed in this version. If a school has 100+ completed exams per student over multiple years, a "View All" archive page can be added later.
- **Sharing exam results** — no share button on completed rows. Results sharing is out of scope.
- **Practice mode** — no "take a sample exam" functionality. All exams are admin-scheduled.
- **Estimated time remaining for upcoming exams** — no countdown to the scheduled start time on upcoming rows. The amber "Scheduled" pill is enough.
- **Notifications when an upcoming exam goes live** — handled at the Dashboard level (the dashboard auto-refreshes via realtime channel).
- **Push notifications / email reminders** — out of scope.

---

## 15. Decisions Locked in Brainstorm

- **Q1 (single page or two):** Option A — Two separate pages `/student/exams` and `/student/tests`. Each page filters strictly to one type. Same structure mirrored.
- **Q2 (sections layout):** Option D — **Tabbed sections**. Live Now / Upcoming / Completed as a tab strip. Only one tab visible at a time. Each tab has its own content + own empty state.
- **Q3 (PUBLISHED clickability):** Option B — Read-only exam info page. Upcoming rows click into `/student/exams/[id]` showing details + "Not Yet Available" notice. No way to enter early.
- **Q4 (lobby design):** Option A — Keep the existing DESIGN.md lobby with breathing circle, countdown, network pill, consent row, and "I'm Ready" CTA. Charcoal text + +2px type updates applied.
- **Q5 (offline indicator):** Option C — Warning banner only when offline. Yellow banner at the top of the page (and every student page). No persistent green "online" pill.
- **Q6 (empty states):** Option B (per-type) + the per-tab subdivision from Q2 — Each tab has its own themed empty state with type-specific copy. No combined "first-time" empty page.

### Sub-decision from re-asking Q2

When all 3 tabs are 0 (first-time student), the per-tab empty state on the active (Live Now) tab is what they see. No separate "first-time student" landing.

---

## Appendix A — Visual Reference

Browser mockups in `docs/design-mockups/`:

- `student-exams-v2.html` — All 5 list states stacked:
  1. Exams · Live Now tab active (with live exam)
  2. Exams · Upcoming tab active (with upcoming rows)
  3. Exams · Completed tab active (with completed rows)
  4. Exams · Live Now tab empty (no live exam)
  5. Tests · Live Now tab active (with live test, purple type badge)

- `student-exams-tests.html` (older v1, partially superseded by v2) — Detail page + Lobby screens still relevant:
  - Read-only Exam info detail (PUBLISHED state with "Not Yet Available" notice)
  - Lobby with breathing circle, countdown, network pill, consent row, ready button

### Earlier specs this one builds on

- `2026-04-13-student-dashboard-design.md` — defines the global student sidebar + top header chrome + the LIVE hero card pattern that's reused here on the Live Now tab content
- `2026-04-12-admin-results-redesign-design.md` — the EXAM/TEST type badge colors (blue / purple) come from the admin Results flow and are kept consistent here on the student side
- `2026-04-13-admin-live-monitor-flow-design.md` — the red urgency theme + pulsing dot pattern for the Live state was first locked there

---

## Backend Dependencies

### Tables touched
**Existing columns read:**
- `students` — `id, full_name, level_id, institution_id, consent_verified, deleted_at` (identity + eligibility gate)
- `levels` — `id, name, institution_id` (lookup for level-scoped queries)
- `exam_papers` — `id, title, type, status, level_id, institution_id, opened_at, closed_at, duration_minutes, scheduled_start_at, scheduled_end_at` filtered by `institution_id = student.institution_id AND level_id = student.level_id AND type IN ('EXAM','TEST')`
- `assessment_sessions` — read (to determine "already joined"/"completed" state) and write on lobby entry (`initSession`): `id, paper_id, student_id, started_at, closed_at`
- `submissions` — read for the Completed tab: `id, paper_id, student_id, score, percentage, completed_at, result_published_at`
- `activity_logs` — insert on lobby entry and any `initSession` outcome

**No new columns required.**

### Server actions called
**Existing (in `src/app/actions/assessment-session.ts` or similar):**
- `initSession({ paperId }): Promise<ActionResult<{ sessionId: string; paperSnapshot: ... }>>` — called when the student clicks "I'm Ready" in the lobby. Creates or resumes the `assessment_sessions` row, writes `started_at` if new, returns the three additional paper fields (`question_count`, `shuffle_seed`, `flash_config`) required by the assessment-taking flow per memory observation 1796.
- Navigation helpers reuse the existing `getStudentLiveExam`/`getStudentExamsList`/`getStudentCompletedExams` queries (may be inline SELECTs in Server Components — no dedicated action layer needed for read-only list pages).

**New:** none for v1. Any additions land in the 2026-04-14 student-assessment-taking-flow plan, not here.

### RPCs / functions referenced
**Existing:**
- None called directly by the list or detail pages (direct table reads only).
- `initSession` may be implemented as a Server Action that wraps a future RPC — implementation decision deferred to the assessment-taking-flow plan.

**New:** none.

### Realtime channels
- **Broadcast** `exam:institution:{institutionId}` with event `exam_live` → list page refresh when any paper flips to LIVE in this institution. Scoped broader than the dashboard's `exam:{paperId}` because the list needs to react to arbitrary paper transitions.
- **Presence** `lobby:{paperId}` — subscribed from the lobby page to show "other students are here" (optional in v1; Q6 leaves this to implementation). Presence channel is the same namespace the admin-live-monitor-flow spec reads.

### Routes / HTTP endpoints
- `/student/exams` + `/student/tests` — list pages (5 tab states each)
- `/student/exams/[id]` + `/student/tests/[id]` — detail pages (read-only info pre-LIVE)
- `/student/exams/[id]/lobby` + `/student/tests/[id]/lobby` — full-canvas lobby, **mounted inside `(student-focus)` route group created by the 2026-04-14 student-assessment-taking-flow plan, NOT a new group**.

### Cross-spec dependencies
- **2026-04-14-student-assessment-taking-flow** — owner of the `(student-focus)` layout group + `initSession` server action extensions (3 new paper fields). Hard ordering: that plan creates the group first; this spec mounts its lobby inside it. Memory obs 1795/1796 document the `time_spent_ms` 8-layer propagation chain + `initSession` return-shape contract.
- **student-dashboard-design** — shares the `exam:{paperId}` Broadcast channel and the LIVE hero card pattern. Dashboard routes students here via the CTA.
- **admin-create-assessment-flow-design** — producer of `exam_papers.scheduled_start_at`, `scheduled_end_at`, `opened_at`, `status='LIVE'`. The Upcoming tab reads `scheduled_start_at`; Live tab reads `status='LIVE' AND opened_at IS NOT NULL`.
- **admin-live-monitor-flow-design** — shares the `lobby:{paperId}` Presence channel. Student lobby joins as a presence client; monitor page subscribes as an observer.
- **admin-results-redesign-design** — owner of `submissions.result_published_at` + `exam_papers.answer_key_released`. Completed tab must honour Gate A (`result_published_at IS NOT NULL`) before showing percentage/grade; otherwise show "Result pending".
- **admin-levels-flow-design** — `level_id` scoping of all list queries. Students must never see papers from other levels or institutions.
- **2026-04-14-student-results-flow-design** — destination for the "View Result" link on Completed rows (gated on `result_published_at`).
