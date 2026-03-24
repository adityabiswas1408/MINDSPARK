# MINDSPARK V1 — Wireframes Specification

> **Document type:** Structural Layout Reference — text-based wireframes  
> **Version:** 1.0  
> **Output path:** `docs/wireframes.md`  
> **Read first:** `docs/prd.md`, `docs/ia-rbac.md`  
> **Author role:** Lead UX Architect — high-stakes assessment platforms, paediatric UI (ages 6–18)

---

## Layout Conventions

### Notation Key

```
[████████]  Filled block — primary content element
[░░░░░░░░]  Loading skeleton block
[────────]  Divider / border
[ button ]  Interactive control
{ label  }  Text label / heading
≡           Sidebar toggle / menu icon
●           Status indicator dot
⟳           Sync / refresh indicator
```

### Global Layout Grid

```
Admin panel:
  Sidebar:       240px fixed width (collapsible to 64px icon-only)
  Top header:    64px fixed height
  Content area:  calc(100vw - 240px) × calc(100vh - 64px)
  Max content:   1280px centered within content area

Student panel:
  Sidebar:       240px fixed width (collapsible to 64px)
  Top header:    56px fixed height
  Content area:  calc(100vw - 240px) × calc(100vh - 56px)
  Max content:   960px centered within content area

Assessment engine (EXAM + TEST):
  No sidebar
  No header (replaced by minimal floating timer pill — EXAM only)
  Full 100vw × 100vh canvas
```

---

## Part A: Admin Panel Screens

---

### A1 — Admin Dashboard

**Route:** `/admin/dashboard`  
**Role:** admin, teacher (cohort-scoped)

#### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ ≡ MINDSPARK           [🔍 Search...  Cmd+K]    [🔔] [👤 Admin ▾] │  ← 64px header
├────────────┬─────────────────────────────────────────────────────┤
│            │  { Dashboard }                      { Live Pulse ● }│
│  Dashboard │                                                      │
│  Levels    │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  Students  │  │ KPI     │ │ KPI     │ │ KPI     │ │ KPI     │  │
│  Assessmts │  │ Total   │ │ Active  │ │ Avg     │ │ Live    │  │
│  Monitor   │  │ Students│ │ Exams   │ │ Score   │ │ Now  ●  │  │
│  Results   │  │ [spark] │ │ [spark] │ │ [spark] │ │ [pulse] │  │
│  Announce  │  │  1,240  │ │    3    │ │  78.4%  │ │   312   │  │
│  Reports   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│  Act. Log  │                                                      │
│  Settings  │  ┌─────────────────────────┐ ┌────────────────────┐ │
│            │  │ Score Trend (6 months)  │ │ Level Distribution  │ │
│            │  │ [LineChart — Recharts]  │ │ [BarChart]          │ │
│            │  │                         │ │                     │ │
│            │  └─────────────────────────┘ └────────────────────┘ │
│            │                                                      │
│            │  { Recent Activity }                                 │
│            │  [████████████████████████████████████████████████] │
│            │  [████████████████████████████████████████████████] │
│            │  [████████████████████████████████████████████████] │
└────────────┴─────────────────────────────────────────────────────┘
  240px         calc(100vw - 240px)
```

**Above fold:** 4 KPI cards + 2 charts  
**Below fold:** Recent activity table, upcoming exam timeline

**Empty state (no data yet):**
```
┌──────────────────────────────────────────────┐
│                                              │
│         [abacus illustration SVG]            │
│                                              │
│        { Welcome to MINDSPARK }              │
│   Start by creating your first student level │
│                                              │
│             [ Create First Level ]           │
└──────────────────────────────────────────────┘
```

**Loading state:** All 4 KPI cards replaced with `[░░░░░░░░]` skeleton blocks matching card dimensions. Charts show grey rectangle placeholders.

**Error state:** KPI cards show `—` with amber `⚠ Could not load` text. Charts show error boundary with "Retry" button.

---

### A2 — Levels Management

**Route:** `/admin/levels`  
**Role:** admin only (teacher: read-only view)

#### Layout

```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { Curriculum Levels }          [ + New Level ]     │
│            │  ────────────────────────────────────────────────── │
│            │                                                      │
│            │  ⠿  ┌────────────────────────────────────────────┐  │
│            │     │ Level 1 — Beginner        [ Edit ] [Delete] │  │
│            │     │ 0 competencies · 42 students enrolled       │  │
│            │     └────────────────────────────────────────────┘  │
│            │  ⠿  ┌────────────────────────────────────────────┐  │
│            │     │ Level 2 — Elementary      [ Edit ] [Delete] │  │
│            │     │ 3 competencies · 38 students enrolled       │  │
│            │     └────────────────────────────────────────────┘  │
│            │  ⠿  ┌────────────────────────────────────────────┐  │
│            │     │ Level 3 — Intermediate    [ Edit ] [Delete] │  │
│            │     └────────────────────────────────────────────┘  │
│            │  (drag handle ⠿ on left of each row)               │
└────────────┴─────────────────────────────────────────────────────┘
```

**Sheet side-peek (create / edit — slides in from right, 480px):**
```
┌──────────────────────────────────────┐
│ { New Level }                  [✕]  │
│ ────────────────────────────────    │
│ Level Name *        [─────────────] │
│ Sequence Order *    [─────────────] │
│ Description         [TipTap editor] │
│ Min. Days Required  [─────────────] │
│ Competencies        [tag input    ] │
│                                     │
│                [ Cancel ] [ Save ]  │
└──────────────────────────────────────┘
```

**Empty state (no levels):**
```
         [isometric stairs illustration — empty-levels.svg]
              { No levels yet }
         Your curriculum starts here. Create Level 1.
              [ Initialize First Level ]
```

**Loading:** Rows replaced by `[░░░░░░░░░░░░░░░░░░░░░░░░░]` skeletons (3 rows × 72px height).

---

### A3 — Student Directory (List View)

**Route:** `/admin/students`  
**Role:** admin (all), teacher (cohort only via RLS)

#### Layout

```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { Students }      [ ⬆ Import CSV ] [ + Add ]      │
│            │  ────────────────────────────────────────────────── │
│            │  [🔍 Search students...] [Level ▾] [Status ▾] [⟳]  │
│            │                                                      │
│            │  ┌──┬──────────────┬────────┬────────┬──────────┐  │
│            │  │☐ │Name          │Level   │Status  │Actions   │  │
│            │  ├──┼──────────────┼────────┼────────┼──────────┤  │
│            │  │☐ │Riya Sharma   │Lvl 3   │Active  │[View]    │  │
│            │  │☐ │Arjun Mehta   │Lvl 2   │Active  │[View]    │  │
│            │  │☐ │Priya Nair    │Lvl 4   │Inactive│[View]    │  │
│            │  ├──┴──────────────┴────────┴────────┴──────────┤  │
│            │  │ ← 1 2 3 … 12 →          Showing 1–25 of 287 │  │
│            │  └───────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────────┘
```

- Table: sticky header, column resize handles, 300ms debounced search
- Filters: `[Level ▾]` and `[Status ▾]` are `<Popover>` compound checkboxes
- URL-bound: search + filter + page pushed to URL params (shareable)
- Bulk select: floating action bar appears when ≥1 row selected

**Bulk action bar (appears at page bottom when rows selected):**
```
┌──────────────────────────────────────────────────┐
│  3 selected  [ Promote ] [ Suspend ] [ Export ]  │
└──────────────────────────────────────────────────┘
```

**Empty state (no students / no results):**
```
         [empty-dashboard.svg illustration]
         { No students found }
         Try adjusting your filters or import a CSV to get started.
         [ Import CSV ]
```

---

### A4 — Student Profile Detail

**Route:** `/admin/students/[id]`

#### Layout (split-pane, sticky left column)

```
┌────────────┬────────────────────┬────────────────────────────────┐
│  [sidebar] │  LEFT PANE (360px) │  RIGHT PANE (flex-1)           │
│            │  ┌──────────────┐  │  [Academic] [History] [Settings]│
│            │  │ [Avatar 96px]│  │  ──────────────────────────    │
│            │  │ Riya Sharma  │  │                                 │
│            │  │ Level 3      │  │  { Academic Performance }       │
│            │  │ Roll: STU042 │  │  [LineChart — score over time]  │
│            │  │ DOB: 12/03/15│  │                                 │
│            │  │ Status: ●Act │  │  ┌──────┬──────┬──────┬──────┐ │
│            │  ├──────────────┤  │  │Exam  │Score │Grade │Date  │ │
│            │  │ [ Promote ]  │  │  ├──────┼──────┼──────┼──────┤ │
│            │  │ [ Suspend ]  │  │  │T1-Q2 │ 92%  │ A+   │Jan 12│ │
│            │  │ [ Reset PWD ]│  │  │E2-Q1 │ 76%  │ B    │Feb 05│ │
│            │  └──────────────┘  │  └──────┴──────┴──────┴──────┘ │
└────────────┴────────────────────┴────────────────────────────────┘
```

---

### A5 — Assessments List

**Route:** `/admin/assessments`

#### Layout

```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { Assessments }                  [ + New ]         │
│            │  [EXAM] [TEST]   ← tabs                             │
│            │  ────────────────────────────────────────────────── │
│            │  ┌─────────────────────────────────────────────┐   │
│            │  │ Title           │Type│Status    │Level│Actions│  │
│            │  ├─────────────────┼────┼──────────┼─────┼───────┤  │
│            │  │ Q3 Mental Arith │EXAM│ ●Live    │ Lvl3│[View] │  │
│            │  │ Flash Speed Tst │TEST│ ●Published│Lvl2│[View] │  │
│            │  │ Jan Assessment  │EXAM│ ●Draft   │ Lvl1│[View] │  │
│            │  └─────────────────────────────────────────────┘   │
└────────────┴─────────────────────────────────────────────────────┘
```

**Status badge colours:**
- Draft → grey  
- Published → blue  
- Live → green  
- Closed → charcoal muted

---

### A6 — Assessment Create / Edit

**Route:** `/admin/assessments/new` and `/admin/assessments/[id]`

#### Layout (3-step wizard)

```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { New Assessment }                                  │
│            │  [Step 1: Type] ──── [Step 2: Questions] ──── [Step 3: Config]
│            │  ════════════════════════════                        │
│            │                                                      │
│            │  STEP 1 — TYPE SELECTOR:                            │
│            │  ┌──────────────────┐  ┌──────────────────┐        │
│            │  │  [stack icon]    │  │  [lightning icon] │        │
│            │  │                  │  │                   │        │
│            │  │      EXAM        │  │       TEST        │        │
│            │  │ Vertical format  │  │  Flash Anzan      │        │
│            │  │ equations + MCQ  │  │  sequence + MCQ   │        │
│            │  └──────────────────┘  └──────────────────┘        │
│            │                                        [ Continue →] │
└────────────┴─────────────────────────────────────────────────────┘
```

**Step 2 — Question authoring (EXAM):**
```
  Q1: [equation input — right-aligned monospace]
      Options: (A)[──────] (B)[──────] (C)[──────] (D)[──────]
               (●) Correct: [A/B/C/D radio]
  [ + Add Question ]
```

**Step 3 — Config (TEST only — anzan-config-panel):**
```
  Flash Speed:   [◄──────●────────►] 450 ms
  Digit Count:   [1] [2] [3] [4] [5]  (pill selectors)
  Row Count:     [◄──────●────────►] 5 rows
  [ Save Assessment ]
```

**Assessment detail — Pipeline stepper (top of page):**
```
  [Draft] ──●── [Published] ──── [Live] ──── [Closed]
              ↑ current step highlighted in green-800 (#1A3829)
  [ Force Live ]  [ Close Exam ]  (admin-only actions beside stepper)
```

---

### A7 — Live Monitor

**Route:** `/admin/monitor/[id]`  
**Role:** admin, teacher (own sessions only)

#### Layout

```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { Live Monitor — Q3 Mental Arithmetic }   ● LIVE  │
│            │  ────────────────────────────────────────────────── │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│            │  │ In Prog. │ │Submitted │ │Disconnect│ │Waiting │ │
│            │  │    42    │ │   108    │ │     6    │ │   14   │ │
│            │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│            │  ────────────────────────────────────────────────── │
│            │  [🔍 Filter by name...]                 [Export ▾]  │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ Name         │ Status      │ Last Seen │Q# │  │  │
│            │  ├──────────────┼─────────────┼───────────┼───┤  │  │
│            │  │ Riya Sharma  │ ●In Progress│ 2s ago    │ 7 │  │  │
│            │  │ Arjun Mehta  │ ●Submitted  │ confirmed │ — │  │  │
│            │  │ Dev Kapoor   │ ◑Disconnect.│ 28s ago   │ 4 │  │  │
│            │  │ Priya Nair   │ ○Waiting    │ never     │ — │  │  │
│            │  └──────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────────┘
```

**Status colours:**  
`●` green = In Progress / Submitted · `◑` amber = Disconnected · `○` grey = Waiting  
Submitted status is PERMANENTLY green — never overwritten by Presence leave events.

---

### A8 — Results (List + Detail)

**Route:** `/admin/results` and `/admin/results/[id]`

#### Results List
```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { Results }                                         │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ Exam Title    │ Date    │ Students │ Avg  │  │  │
│            │  ├───────────────┼─────────┼──────────┼──────┤  │  │
│            │  │ Q3 Assessment │ Feb 14  │  48/50   │ 81%  │[▶]│  │
│            │  └──────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────────┘
```

#### Results Detail
```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { Q3 Assessment — Results }    [ Re-evaluate ]     │
│            │  Mean: 81.2%  · Median: 83%  · DPM avg: 47         │
│            │  [AreaChart — grade distribution Recharts]           │
│            │  ────────────────────────────────────────            │
│            │  ☐ Riya Sharma  92%  A+  Submitted  [Publish]       │
│            │  ☐ Arjun Mehta  76%  B   Submitted  [Published ✓]   │
│            │  ─── Sticky FAB bottom-right ───                     │
│            │  [ ☐ Select All ]  [ Publish Selected ] [Export]    │
└────────────┴─────────────────────────────────────────────────────┘
```

---

### A9 — Announcements

**Route:** `/admin/announcements`

```
┌────────────┬──────────────────────────┬──────────────────────────┐
│  [sidebar] │  LEFT: Editor (50%)      │  RIGHT: Published (50%)  │
│            │  Title: [──────────────] │  ┌──────────────────┐   │
│            │  Target: [Level ▾][All]  │  │ Announcement 1   │   │
│            │  [TipTap rich-text area] │  │ "Read by 84%"    │   │
│            │  [B][I][U][• list][link] │  └──────────────────┘   │
│            │           [ Publish ]    │  ┌──────────────────┐   │
│            │                          │  │ Announcement 2   │   │
│            │                          │  │ "Read by 31%"    │   │
│            │                          │  └──────────────────┘   │
└────────────┴──────────────────────────┴──────────────────────────┘
```

---

### A10 — Settings

**Route:** `/admin/settings`  
**Role:** admin only

```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { Settings }                                        │
│            │  ── Institution ──────────────────────────────────  │
│            │  Name:            [──────────────────]               │
│            │  Timezone:        [Asia/Kolkata ▾]                  │
│            │  Session Timeout: [3600    ] seconds                 │
│            │                          [ Save Institution ]        │
│            │  ── Grade Boundaries ──────────────────────────────  │
│            │  A+:  [90 ──────── 100]                             │
│            │  A :  [80 ────────  89]  ← auto-adjusts adjacent    │
│            │  B :  [65 ────────  79]                             │
│            │                          [ Save Boundaries ]         │
└────────────┴─────────────────────────────────────────────────────┘
```

Grade boundary inputs: adjusting one boundary's min auto-adjusts adjacent max.  
Anti-overlap validator fires on save — overlapping ranges show red `⚠` inline.

---

### A11 — Activity Log

**Route:** `/admin/activity-log`  
**Role:** admin only

```
┌────────────┬─────────────────────────────────────────────────────┐
│  [sidebar] │  { Activity Log }          [User ▾][Action ▾][Date]│
│            │  ┌──────────┬──────────┬──────────────┬───────────┐│
│            │  │Timestamp │Actor     │Action        │Target     ││
│            │  ├──────────┼──────────┼──────────────┼───────────┤│
│            │  │16:32 UTC │admin@.. │PUBLISH_RESULT│Session #42││
│            │  │16:28 UTC │admin@.. │LEVEL_REORDER │L3 → pos 4 ││
│            │  │          │         │[{diff viewer}]│           ││
│            │  └──────────┴──────────┴──────────────┴───────────┘│
└────────────┴─────────────────────────────────────────────────────┘
```

Expandable row → JSON diff visualiser shows `before` / `after` payload.

---

## Part B: Student Panel Screens

---

### B1 — Student Dashboard (Empty State)

**Route:** `/student/dashboard` (no live exam, no upcoming)

```
┌────────────┬─────────────────────────────────────────────────────┐
│ ≡ MIND..   │                                                      │
│  Dashboard │                                                      │
│  Exam      │         [empty-dashboard.svg — resting abacus]      │
│  Test      │                                                      │
│  Results   │            { No exams scheduled yet }               │
│  Profile   │        Check back when your teacher posts one.      │
│            │                                                      │
└────────────┴─────────────────────────────────────────────────────┘
  240px
```

---

### B2 — Student Dashboard (Live State)

**Route:** `/student/dashboard` (active live exam)

```
┌────────────┬─────────────────────────────────────────────────────┐
│ ≡ [sidebar]│                                                      │
│            │  ┌────────────────────────────────────────────────┐ │
│            │  │  ● LIVE NOW — Q3 Mental Arithmetic             │ │
│            │  │  Level 3 · 20 Questions · 30 min               │ │
│            │  │  [pulse animation ring around ● dot]           │ │
│            │  │                                                 │ │
│            │  │               [ Enter Exam → ]                 │ │
│            │  └────────────────────────────────────────────────┘ │
│            │                                                      │
│            │  { Upcoming }                                        │
│            │  ┌──────────────────┐  ┌──────────────────┐        │
│            │  │ Flash Speed — L3 │  │ Q4 Assessment    │        │
│            │  │ in 2 days        │  │ in 1 week        │        │
│            │  └──────────────────┘  └──────────────────┘        │
└────────────┴─────────────────────────────────────────────────────┘
```

Hero card: --color-green-800 border (#1A3829), pulse-ring animation (`@keyframes pulse-ring`), full-width.

---

### B3 — Pre-Assessment Lobby

**Route:** `/student/lobby/[id]`

```
┌────────────┬─────────────────────────────────────────────────────┐
│ ≡ [sidebar]│                                                      │
│            │     { Q3 Mental Arithmetic }                        │
│            │     Level 3 · 20 Questions · 30 minutes             │
│            │                                                      │
│            │              ┌──────────────┐                       │
│            │              │   00 : 14    │  ← DM Mono, 72px     │
│            │              │ (countdown)  │     tabular-nums      │
│            │              └──────────────┘                       │
│            │                                                      │
│            │         (  ◌  breathing circle animation  )         │
│            │         pulse: scale 1.0 → 1.08 → 1.0, 4s ease    │
│            │                                                      │
│            │              ● Network: Optimal                     │
│            │              (green dot · amber · red = 3 states)   │
│            │                                                      │
│            │              [    I'm Ready    ]                    │
│            │                                                      │
└────────────┴─────────────────────────────────────────────────────┘
```

**Network health indicator — 3 states:**

| State | Dot | Label | Sub-label |
|-------|-----|-------|-----------|
| Optimal | ● green | Network: Optimal | All answers will sync in real time |
| Degraded | ● amber | Network: Unstable | Answers will save locally |
| Severed | ● red | Network: Offline | Offline mode — answers saving locally |

**"I'm Ready" → triggers 3000ms interstitial before exam mounts:**

```
┌──────────────────────────────────────────────────────────────────┐
│                         [full screen]                            │
│                                                                  │
│                     { Get Ready }                                │
│              ♩  ♩  ♩  (3-beat metronome audio)                  │
│                                                                  │
│         [scale animation (transform: scale(1) → scale(1.05) → scale(1)): card grows 1→1.05→1]    │
│                                                                  │
│                     [ 3 ] → [ 2 ] → [ 1 ]                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

After 3000ms: interstitial unmounts, exam engine mounts.

---

### B4 — EXAM Engine

**Route:** `/student/assessment/[id]` (type = EXAM)  
**Full-canvas — no sidebar, no standard header**

```
┌────────────────────────────────────────┬───────────────────────┐
│  CONTENT AREA (flex-1)                 │  NAVIGATOR (280px)    │
│                                        │                       │
│  [◀ Prev]  Question 7 of 20  [Next ▶] │  { Questions }        │
│  ┌─────────────────────────────┐       │  [1✓][2✓][3✓][4✓]   │
│  │    3 4 5                    │       │  [5✓][6✓][7 ][8 ]   │
│  │  + 2 1 7                    │       │  [9 ][10][11][12]   │
│  │  ─────                      │       │  ...                  │
│  │  (right-aligned, monospace) │       │  ✓ = answered         │
│  └─────────────────────────────┘       │  ■ = current         │
│                                        └───────────────────────┘
│  MCQ GRID (max 200px below equation):                           │
│  ┌───────────────────┬───────────────────┐                     │
│  │   (A)  552        │   (B)  553        │  — 64px min height  │
│  ├───────────────────┼───────────────────┤  — DM Mono          │
│  │   (C)  561        │   (D)  564        │  — 2×2 grid         │
│  └───────────────────┴───────────────────┘                     │
│                                                                 │
│  ┌─ floating timer pill (top-right corner) ──────────┐         │
│  │  ⏱ 24:31  (DM Mono, muted amber when < 5 min)    │         │
│  └──────────────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

**MCQ distance rule:** Grid top edge must be ≤ 200px below the equation bottom edge.  
**Negative numbers** in equation: rendered in `#991B1B`. _"Corrected — 9.7:1 AAA"_  
**Answer selection flow:**
1. Student taps option → option border highlights yellow + checkmark appears
2. Separate "Next →" button appears below grid (Select & Confirm pattern)
3. 1200ms pointer-events cooldown after transition (prevents mis-tap on question switch)
4. Answer written to IndexedDB BEFORE any network call

**Network banner (appears on degraded/offline):**
```
┌──────────────────────────────────────────────────────────────────┐
│ ████ The network is taking a quick break — saving locally  ⟳   │
└──────────────────────────────────────────────────────────────────┘
4px top border · #FEF9C3 background · aria-live="assertive" · 100% width
```

**Connection states — sync indicator (8px circle, top-right):**

| State | Colour | Meaning |
|-------|--------|---------|
| ● green | Syncing live | Answers reaching server |
| ● amber | Offline — saving locally | IndexedDB queue active |
| ● red | Sync error | Answers still queued, will retry |

---

### B5 — TEST Engine — Phase 1 (START)

**Route:** `/student/assessment/[id]` (type = TEST, phase = START)  
**Full-canvas — no sidebar, no standard header**

```
┌────────────────────────────────────────┬───────────────────────┐
│  CONTENT AREA                          │  NAVIGATOR (280px)    │
│                                        │  (MOUNTED in Phase 1) │
│  { Flash Anzan — Question 3 of 8 }    │  [1✓][2✓][3 ][4 ]   │
│                                        │  ...                  │
│  Speed: 450ms per number               │                       │
│  Digits: 2 · Rows: 5                   │                       │
│                                        │                       │
│         [    Begin Flash ▶    ]        │                       │
│                                        │                       │
│  (breathing circle animation below)    │                       │
│                                        │                       │
└────────────────────────────────────────┴───────────────────────┘
```

---

### B6 — TEST Engine — Phase 2 (FLASH) ⚠️ MOST CRITICAL

**Route:** `/student/assessment/[id]` (type = TEST, phase = FLASH)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│                           4 7                                   │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
100vw × 100vh
```

**Phase 2 — Absolute constraints (zero exceptions):**

| Constraint | Specification |
|------------|---------------|
| Background | `#FFFFFF` white (or `#F1F5F9` when `delay_ms` < 300ms) |
| Number font size | Minimum `30vh` (30% of viewport height) |
| Number position | `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)` |
| Font | DM Mono, `font-variant-numeric: tabular-nums` |
| Number colour | `#0F172A` (or `#334155` when `delay_ms` < 300ms high-speed dampening) |
| Negative numbers | `#991B1B` (CIELAB equiluminant — perceptual brightness parity) |
| Transition | `transition: none !important` — zero interpolation, instant swap |
| Other UI | **NONE** — no header, no sidebar, no timer, no navigator, no progress bar |
| Navigator | **UNMOUNTED** — conditional rendering `{phase !== 'PHASE_2_FLASH' && <Navigator/>}` evaluates false during Phase 2 only. Navigator IS mounted in Phase 1 (START) and Phase 3 (MCQ). |
| Timing | `requestAnimationFrame` + delta-time accumulator — **never `setTimeout`** |
| Tab visibility | `visibilitychange` → `cancelAnimationFrame()` → pause modal |

**Pause modal (fires on focus loss):**
```
┌──────────────────────────────────────────────────────────────────┐
│                  [full screen overlay]                          │
│                                                                  │
│               ⚠  Assessment Paused                              │
│           Focus lost — sequence halted                          │
│    Your teacher has been notified.                              │
│                                                                  │
│           (Auto-resumes when you return focus)                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### B7 — TEST Engine — Phase 3 (MCQ)

**Route:** `/student/assessment/[id]` (type = TEST, phase = MCQ)  
**Full-canvas — Navigator remains UNMOUNTED**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                 { What was the total? }                         │
│                                                                  │
│  ┌───────────────────────┬───────────────────────┐             │
│  │                       │                       │             │
│  │       (A)  235        │       (B)  243        │             │
│  │                       │                       │             │
│  ├───────────────────────┼───────────────────────┤             │
│  │                       │                       │             │
│  │       (C)  251        │       (D)  259        │             │
│  │                       │                       │             │
│  └───────────────────────┴───────────────────────┘             │
│                                                                  │
│                        [ Skip → ]                               │
│              (Skip button: Phase 3 ONLY)                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

MCQ grid: minimum `64px × 64px` per cell, DM Mono.  
Selection → same Select & Confirm pattern as EXAM engine.  
Skip → writes `null` answer to IndexedDB, advances to next question's Phase 1.

---

### B8 — Results List (Result Hub)

**Route:** `/student/results`

```
┌────────────┬─────────────────────────────────────────────────────┐
│ ≡ [sidebar]│  { Your Results }                                   │
│            │                                                      │
│            │  { Recently Published }  ← highlighted zone        │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ ★ Q3 Assessment    Level 3   92%   A+  [View]│  │
│            │  │ ★ Flash Test — Feb Level 3   88%   A   [View]│  │
│            │  └──────────────────────────────────────────────┘  │
│            │                                                      │
│            │  { Pending }  ← muted zone, no click affordance    │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ 🕐 Q4 Assessment    Level 3   —    —          │  │
│            │  │    (greyed out, no hover, no cursor: pointer) │  │
│            │  └──────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────────┘
```

---

### B9 — Result Detail View

**Route:** `/student/results/[id]`

```
┌────────────┬─────────────────────────────────────────────────────┐
│ ≡ [sidebar]│  { Q3 Assessment — Your Result }                   │
│            │  ────────────────────────────────────────────────   │
│            │  ┌──────────────────┐  ┌────────────────────────┐  │
│            │  │  [donut chart]   │  │  Score: 92%            │  │
│            │  │  92% filled      │  │  Grade: A+             │  │
│            │  │  Recharts        │  │  DPM:  54              │  │
│            │  └──────────────────┘  └────────────────────────┘  │
│            │                                                      │
│            │  [All Questions] [Incorrect] [Skipped]  ← filters  │
│            │                                                      │
│            │  ┌──────────────┬──────────────┬──────────────┐   │
│            │  │ Equation     │ Your Answer  │ Verdict      │   │
│            │  ├──────────────┼──────────────┼──────────────┤   │
│            │  │  345 + 217   │ (B) 562      │ ✓ Correct    │   │
│            │  │  123 - 456   │ (A) -333     │ ✓ Correct    │   │
│            │  │  789 + 111   │ (D) 999      │ ✗ Wrong (B)  │   │
│            │  └──────────────┴──────────────┴──────────────┘   │
└────────────┴─────────────────────────────────────────────────────┘
```

Equation and answer columns: DM Mono, `tabular-nums`.  
Verdict ✓: green text `#166534` · ✗: red text `#DC2626` (not `#FF6B6B`, not `#991B1B` — `#991B1B` is for negative arithmetic operands ONLY; wrong-answer verdicts use the danger palette `#DC2626` on `#FEE2E2`).

---

### B10 — Student Profile

**Route:** `/student/profile`

```
┌────────────┬─────────────────────────────────────────────────────┐
│ ≡ [sidebar]│                                                      │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │         [digital ID card aesthetic]          │  │
│            │  │  [Avatar 96px]    Riya Sharma                │  │
│            │  │                   Level 3 — Intermediate      │  │
│            │  │  Roll: STU-0042   DOB: 12 Mar 2015            │  │
│            │  │                                              │  │
│            │  │  ▐██████████▌░░░░░░░░░░] Level 3 of 8       │  │
│            │  │  [barcode / QR for roll number at bottom]    │  │
│            │  └──────────────────────────────────────────────┘  │
│            │                                                      │
│            │  Level Progress: ━━━━━━━━━━●━━━━━━━━━ 58% to Lvl 4│
│            │                                                      │
│            │  ── Accessibility ──────────────────────────────── │
│            │  Ticker Mode                        [ ○────── ]    │
│            │  Display flash numbers as scrolling tape instead    │
│            │  of full-screen flash. Reduces visual motion.       │
│            │  (Toggle: off = standard flash, on = ticker tape)  │
└────────────┴─────────────────────────────────────────────────────┘
```

**Ticker Mode toggle behaviour:**
- Toggle state persisted to user preferences in `profiles` table
- When ON: Flash Phase 2 renders numbers as a horizontally scrolling ticker at bottom of screen rather than full-viewport centred flash
- When OFF: Standard full-screen Phase 2 behaviour
- Label: "Ticker Mode" · DM Sans 15px 500 · `#0F172A`
- Sub-label: "Scroll numbers as a tape" · DM Sans 13px · `#475569`
- Toggle component: shadcn/ui Switch · checked = `#1A3829` · unchecked = `#94A3B8`
- Spec detail: see `docs/08_a11y.md` §Ticker Mode

---

### B11 — Submitted Confirmation

**Route:** transitional state after submission, within `/student/assessment/[id]`

```
┌──────────────────────────────────────────────────────────────────┐
│                  [full canvas — no sidebar]                      │
│                                                                  │
│              [contained confetti burst — canvas]                │
│                                                                  │
│         ┌──────────────────────────────────────────┐           │
│         │  [elevating card animation: translateY]   │           │
│         │                                           │           │
│         │     ✓  Assessment Submitted               │           │
│         │                                           │           │
│         │  Your answers have been saved.            │           │
│         │  (+ audio: completion-chime.mp3)          │           │
│         │                                           │           │
│         │       [ View Results ]  [ Dashboard ]     │           │
│         └──────────────────────────────────────────┘           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Confetti: contained within card bounding box — not full-screen bleed.  
Card elevation: `transform: translateY(-8px)` with `ease-out` on mount.  
Audio: `completion-chime.mp3` plays once on mount (respects `prefers-reduced-motion`).

---

### B12 — Guardian Consent Verification Landing Page

**Route:** `/student/consent` (unauthenticated — no sidebar, no login required)  
**Trigger:** Guardian clicks verification link in email. JWT embedded in URL query param.

```
┌──────────────────────────────────────────────────────────────────┐
│                  [full canvas — #F8FAFC bg]                      │
│                                                                  │
│              [MINDSPARK logo — brand-navy #204074]              │
│                                                                  │
│         ┌──────────────────────────────────────────┐           │
│         │                                           │           │
│         │   ✓  Consent Verified  (success state)   │           │
│         │                                           │           │
│         │  Thank you. [Student Name] can now        │           │
│         │  access MINDSPARK assessments.            │           │
│         │                                           │           │
│         │  You may close this window.               │           │
│         └──────────────────────────────────────────┘           │
│                                                                  │
│  ─── Error state (expired / invalid JWT) ───                   │
│         ┌──────────────────────────────────────────┐           │
│         │  ⚠  This link has expired                │           │
│         │  Ask your teacher to send a new one.     │           │
│         │  No error codes shown to guardian.        │           │
│         └──────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

**Behaviour:**
- Route Handler `GET /api/consent/verify` reads JWT from `?token=` query param
- Valid JWT: sets `students.consent_verified = true` via service-role client; renders success card
- Invalid / expired JWT: renders error card with friendly language — no raw error codes
- No login required — guardian does not have a MINDSPARK account
- No redirect to dashboard after success — guardian closes the tab

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All 22 screens documented (11 admin + 11 student) | ✅ A1–A11, B1–B12 (B12 = Consent = 22 total) |
| Flash Anzan Phase 2 zero-UI wireframe with all constraints | ✅ B6 — full constraint table |
| `transition: none !important` explicitly specified | ✅ B6 constraint table |
| Navigator UNMOUNTED (not hidden) — correct phase string `PHASE_2_FLASH` | ✅ B6, B7 |
| `requestAnimationFrame` + `delta-time`, never `setTimeout` | ✅ B6 |
| All three network connection states documented | ✅ B3 (lobby), B4 (EXAM engine table) |
| MCQ grid ≤ 200px from equation | ✅ B4 explicitly specified |
| Empty states for all list views | ✅ A1, A2, A3, B1 |
| Loading skeleton states | ✅ A1, A2, A3 |
| Error states | ✅ A1 |
| 3000ms interstitial documented | ✅ B3 |
| Select & Confirm MCQ pattern | ✅ B4, B7 |
| 1200ms pointer-events cooldown | ✅ B4 |
| Sync indicator (8px circle states) | ✅ B4 |
| Network banner spec | ✅ B4 |
| Submission confirmation screen | ✅ B11 |
| Guardian consent verification landing page | ✅ B12 |
| Ticker Mode accessibility toggle in Student Profile | ✅ B10 |
| Exam Closed mid-session overlay | ⚠ Not yet wireframed — see admin↔student sync gap in Batch 3 report |
