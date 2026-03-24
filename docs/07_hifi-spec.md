# MINDSPARK V1 — HI-FI UI Specification

> **Document type:** Pixel-Precise Visual Specification  
> **Version:** 1.0  
> **Output path:** `docs/hifi-spec.md`  
> **Read first:** `docs/wireframes.md` · `design-system.html` · `docs/prd.md`  
> **Author role:** Lead UI Designer — forest green light-mode design systems · WCAG 2.2 AAA

---

## Table of Contents

1. [Design Token Reference](#1-design-token-reference)
2. [Typography System](#2-typography-system)
3. [Spacing, Radius & Shadow Scale](#3-spacing-radius--shadow-scale)
4. [Component Specifications](#4-component-specifications)
5. [Admin Panel Screens — HI-FI](#5-admin-panel-screens--hi-fi)
6. [Student Panel Screens — HI-FI](#6-student-panel-screens--hi-fi)
7. [Flash Anzan Phase 2 — Zero-UI Spec](#7-flash-anzan-phase-2--zero-ui-spec)
8. [Loading & Skeleton System](#8-loading--skeleton-system)
9. [Empty States](#9-empty-states)
10. [Microcopy Standards](#10-microcopy-standards)
11. [NEVER List](#11-never-list)

---

## 1. Design Token Reference

All values below are the **only** permitted colour values in V1. No other hex codes.

### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-page` | `#F8FAFC` | Page background — BOTH admin and student panels |
| `bg-card` | `#FFFFFF` | Card surfaces, modals, sidebars |
| `bg-overlay` | `rgba(15,23,42,0.4)` | Modal backdrops |

### Brand & Primary

| Token | Hex | Contrast on `#F8FAFC` | Usage |
|-------|-----|----------------------|-------|
| `green-800` | `#1A3829` | 12.3:1 AAA | Primary CTA · LIVE card border · KPI hero · selected states |
| `brand-navy` | `#204074` | — | App boot screen · login page · footer ONLY |
| `brand-orange` | `#F57A39` | — | Progress bar on `#204074` background ONLY |

### Text

| Token | Hex | Contrast on `#FFFFFF` | Usage |
|-------|-----|----------------------|-------|
| `text-primary` | `#0F172A` | 21:1 AAA | Primary text · page headings · flash numbers (≥500ms) |
| `text-secondary` | `#475569` | 7.2:1 AAA | Body copy · table cells |
| `text-subtle` | `#94A3B8` | 3.6:1 — labels only | Placeholder · disabled · timestamps |
| `text-negative` | `#991B1B` | 9.7:1 AAA | **Negative arithmetic operands ONLY** — Flash Anzan negative numbers. Never for errors, wrong answers, or danger states. |

### Semantic States

| Token | Background | Text/Border | Usage |
|-------|-----------|-------------|-------|
| success-bg | `#DCFCE7` | `#166534` | Correct answer · submission confirmed · Submitted badge |
| warning-bg | `#FEF9C3` | `#854D0E` | Offline banner · urgent timer ≤20% |
| error-bg | `#FEE2E2` | `#DC2626` | Wrong-answer review row · form validation error |
| info-bg | `#EFF6FF` | `#1D4ED8` | Info toasts · general notices |
| live-badge | `#EF4444` | `#FFFFFF` | LIVE badge in sidebar and assessment cards |

### Timer States (exact thresholds)

| Phase | Background | Border | Text | Trigger |
|-------|-----------|--------|------|---------|
| Normal | `#F0FDF4` (green-50) | `#86EFAC` (green-300) | `#1A3829` (green-800) | > 20% time remaining |
| Urgent | `#FFFBEB` | `#F59E0B` | `#92400E` | ≤ 20% time remaining |
| Transition | — | — | — | 800ms `ease` colour animate between Normal→Urgent |

> **NEVER:** Red background. Pulsing animation. Flashing animation on timer.

### Flash Anzan Contrast Ramp

| Speed | Background | Text | Contrast | WCAG |
|-------|-----------|------|----------|------|
| ≥ 500ms | `#FFFFFF` | `#0F172A` | 21:1 | AAA |
| 300–499ms | `#F8FAFC` | `#1E293B` | ~17:1 | AAA |
| < 300ms | `#F1F5F9` | `#334155` | ~11:1 | AAA |

> **Range note:** The 300–499ms tier applies to all values from 300ms up to (but not including) 500ms. The <300ms tier applies strictly to values below 300ms. There is no unspecified gap. `contrast-dampener.ts` must implement: `if (delay_ms < 300) → tier 3; else if (delay_ms < 500) → tier 2; else → tier 1`.

`< 300ms` additionally applies: `transition: opacity 30ms linear` on number mount/unmount (reduces retinal streak). All other transitions on `.flash-number`: `none !important`.

---

## 2. Typography System

### Font Families

| Role | Family | Fallback | Usage |
|------|--------|---------|-------|
| `font-sans` | DM Sans | system-ui, sans-serif | ALL UI text — headings, labels, body, buttons |
| `font-mono` | DM Mono | monospace | ALL numbers, timers, equations, roll numbers, shortcuts |

> **NEVER** Roboto Mono. **NEVER** system-mono as a numeric fallback.  
> Every numeric display must load DM Mono or render nothing until loaded.

### Type Scale

| Role | Size | Weight | Line-height | Family | Usage |
|------|------|--------|-------------|--------|-------|
| `heading-xl` | 30px | 700 | 1.2 | DM Sans | Page titles |
| `heading-lg` | 22px | 700 | 1.3 | DM Sans | Section headings · Card titles |
| `heading-md` | 18px | 600 | 1.4 | DM Sans | Sub-section · modal titles |
| `body-lg` | 16px | 400 | 1.6 | DM Sans | Primary body copy |
| `body-sm` | 14px | 400 | 1.5 | DM Sans | Table cells · secondary copy |
| `caption` | 12px | 400 | 1.4 | DM Sans | Timestamps · metadata |
| `mono-flash` | `clamp(96px, 30vh, 180px)` | 700 | 1 | DM Mono | Flash Anzan number |
| `mono-timer` | 30px | 500 | 1 | DM Mono | Exam countdown timer |
| `mono-equation` | 26px | 400 | 1.4 | DM Mono | EXAM vertical equations |
| `mono-score` | 48px | 700 | 1 | DM Mono | Result detail hero score |
| `mono-data` | 16px | 400 | 1.5 | DM Mono | Table numeric cells · roll numbers |

### Global numeric rules

```css
/* Applied to every element using font-mono */
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum";
letter-spacing: 0;
```

---

## 3. Spacing, Radius & Shadow Scale

### Border Radius

| Token | Value | Applied to |
|-------|-------|-----------|
| `radius-chip` | 4px | Filter chips · tags |
| `radius-badge` | 6px | Status badges · grade labels |
| `radius-btn` | 10px | All buttons |
| `radius-card` | 14px | Cards · panels · table containers |
| `radius-overlay` | 18px | Modals · drawers · interstitials |
| `radius-pill` | 999px | Timer pill · search bars · toggle switches |

### Shadow Scale

| Token | Value | Applied to |
|-------|-------|-----------|
| `shadow-sm` | `0 1px 2px rgba(15,23,42,0.06)` | Inactive cards · sidebar |
| `shadow-md` | `0 4px 12px rgba(15,23,42,0.10)` | LIVE card · lobby · result cards |
| `shadow-lg` | `0 8px 32px rgba(15,23,42,0.16)` | Modals · interstitial overlay |

### Spacing (8px base grid)

```
4px  — icon padding, tight chip internal
8px  — intra-component gap
12px — compact row padding
16px — card padding (mobile), inline form gap
24px — card padding (desktop), section gap
32px — page-level section spacing
48px — hero / empty-state vertical margin
```

---

## 4. Component Specifications

### 4.1 Buttons

| Variant | Background | Text | Border | Hover | Active |
|---------|-----------|------|--------|-------|--------|
| Primary | `#1A3829` | `#FFFFFF` | none | `#0F2018` (darken 8%) | `scale(0.98)` |
| Secondary | `#FFFFFF` | `#1A3829` | 1.5px `#1A3829` | `#F0FAF4` bg | `scale(0.98)` |
| Destructive | `#FEE2E2` | `#DC2626` | 1.5px `#DC2626` | `#FECACA` bg | `scale(0.98)` |
| Ghost | transparent | `#475569` | none | `#F1F5F9` bg | `scale(0.98)` |

All buttons: height 40px (default), 48px (large CTAs), radius `10px`, DM Sans 15px 600.  
Focus: `3px` solid `#1A3829` outline, `2px` offset.  
Disabled: `opacity: 0.4`, `cursor: not-allowed`.

### 4.2 MCQ Option Grid

```
Grid:     2 columns × 2 rows
Gap:      12px
Cell:     min 64px × 64px (Fitts Law hard floor — NEVER smaller)
Radius:   14px (card radius)
Border:   1.5px solid #E2E8F0 (default)
Bg:       #FFFFFF (default)
Font:     DM Mono 20px 600, color #0F172A, tabular-nums
```

**State machine — single option cycle:**

| State | Border | Background | Text colour |
|-------|--------|-----------|------------|
| Default | `1.5px #E2E8F0` | `#FFFFFF` | `#0F172A` |
| Hover | `1.5px #1A3829` | `#F0FDF4` | `#1A3829` |
| Selected (pre-confirm) | `3px solid #1A3829` | `#DCFCE7` (green-50) | `#1A3829` |
| Confirmed correct (result) | `2px solid #166534` | `#DCFCE7` | `#166534` |
| Confirmed wrong (result) | `2px solid #DC2626` | `#FEE2E2` | `#DC2626` |

**1200ms cooldown:** After question transition, invisible `pointer-events: none` overlay covers entire MCQ grid. No visual change to user.

**Select & Confirm pattern:**
1. Tap option → option enters Selected state + "Confirm →" button slides in below (200ms `ease-out` translateY)
2. Tap "Confirm →" → answer locked, cooldown starts, question advances

### 4.3 Status Badges

```
LIVE:        bg #EF4444   text #FFFFFF   6px radius   10px DM Sans 700
In Progress: bg #DCFCE7   text #166534   6px radius
Submitted:   bg #DCFCE7   text #166534   6px radius   — permanent, never overwritten
Disconnected:bg #FEF9C3   text #854D0E   6px radius
Waiting:     bg #F1F5F9   text #475569   6px radius
Draft:       bg #F1F5F9   text #475569   6px radius
Published:   bg #EFF6FF   text #1D4ED8   6px radius
Closed:      bg #0F172A   text #FFFFFF   6px radius
```

### 4.4 KPI Cards

```
Container:   bg #FFFFFF, shadow-md, radius-card 14px, padding 24px
Metric:      DM Mono 36px 700, color #0F172A, tabular-nums
Label:       DM Sans 13px 500, color #475569, uppercase tracking-wide
Trend badge: ↑ success-bg / ↓ error-bg, 11px DM Sans
Sparkline:   Recharts 60×28px, stroke #1A3829, no axes, no grid
LIVE card:   border 2px solid #1A3829 (green-800), pulse ring animation
```

Pulse ring: `box-shadow: 0 0 0 0 rgba(26,56,41,0.4)` → `0 0 0 12px rgba(26,56,41,0)`, 2s infinite.

### 4.5 Data Table

```
Header:      bg #F8FAFC, DM Sans 12px 600, #475569, uppercase, padding 12px 16px
Row:         bg #FFFFFF, border-bottom 1px #F1F5F9, padding 14px 16px
Row hover:   bg #F0FDF4
Numeric cells: DM Mono 14px, tabular-nums, right-aligned
Sticky header: position sticky, top 0, z-index 10
```

### 4.6 Sidebar

```
Width:       240px (expanded) · 64px (icon-only collapsed)
Background:  #FFFFFF
Border-right: 1px solid #E2E8F0
Nav item:    height 40px, radius 8px, padding 0 12px
Nav active:  bg #F0FDF4, text #1A3829, left border 3px solid #1A3829
Nav hover:   bg #F8FAFC
LIVE badge:  positioned right of label, bg #EF4444
```

### 4.7 Network Banner

```
Height:      44px
Background:  #FEF9C3 (warning-bg)
Border-top:  4px solid #F59E0B
Text:        DM Sans 14px 500, color #854D0E
Icon:        16px warning icon, left-aligned with 16px padding
aria-live:   "assertive" (screen reader immediate interrupt)
Position:    fixed top 0, full width, z-index 9999
```

### 4.8 Sync Indicator

```
Size:     8px × 8px circle
Position: fixed, top 16px right 16px within exam canvas
Syncing:  bg #22C55E (green-500), no animation
Offline:  bg #F59E0B (amber-400), no animation
Error:    bg #EF4444, no animation
Tooltip:  "Saving locally" on hover (DM Sans 12px, shadow-sm popover)
```

### 4.9 Timer Pill

```
Shape:     pill (radius-pill 999px)
Size:      auto-width × 36px
Padding:   0 16px
Font:      DM Mono 30px 500, tabular-nums
Normal:    bg #F0FDF4, border 1.5px #86EFAC, text #1A3829
Urgent:    bg #FFFBEB, border 1.5px #F59E0B, text #92400E
Transition: color + bg + border: 800ms ease (Normal→Urgent only, no reverse)
Position:  floating — fixed top-right corner within exam canvas, margin 16px
aria-live: "polite", aria-label: "Time remaining: {mm:ss}"
```

---

## 5. Admin Panel Screens — HI-FI

### Admin Dashboard

**Page background:** `#F8FAFC`  
**Content max-width:** 1280px, centered

**KPI cards row:** 4-column grid, 16px gap, full-width
- Total Students · Active Exams · Avg Score (DM Mono %) · Live Now (pulse animation)

**Charts row (below KPI):** 2-column 60/40 split
- Left: `<LineChart>` — 6-month score trend, stroke `#1A3829`, fill `rgba(26,56,41,0.06)`
- Right: `<BarChart>` — level distribution, fill `#1A3829`

**Recent Activity:** full-width table, last 10 events, paginated

**Live Pulse widget (top-right corner of header):**
```
DM Sans 13px · "● 3 exams live" · dot bg #EF4444 · pulse animation
```

---

### Live Monitor

**Student status row heights:** 52px  
**Status column width:** 140px  
**Status transitions:** `transition: background-color 300ms ease` (row colour)

**Aggregate gauges row:**
```
4 cards × 25% width
In Progress: green-50 bg, green-800 number
Submitted:   white bg, green-800 number (permanent once set)
Disconnected:warning-bg, warning text
Waiting:     subtle-bg, subtle text
```

**Disconnected state (25s heartbeat timeout):**
Row colour: `#FEF9C3`, no animation — calm amber, not alarming.

---

### Results Detail

**Grade distribution chart:**  
`<AreaChart>` — Recharts, x-axis = score ranges, y-axis = student count  
Fill: `rgba(26,56,41,0.12)`, stroke: `#1A3829`, no dots

**Floating Action Bar (appears on row selection):**
```
Position: fixed bottom 24px, centered
Background: #1A3829, radius 999px (pill)
Padding: 12px 24px
Text: #FFFFFF DM Sans 14px 500
Buttons: "Publish Selected" (white outline btn), "Export CSV" (ghost)
Shadow: shadow-lg
```

---

### Settings — Grade Boundary Editor

**Inputs:** DM Mono 16px, right-aligned, `#0F172A`  
**Auto-adjust:** adjacent field updates with 150ms transition on value change  
**Overlap error:** red inline text (DM Sans 12px `#DC2626`) + `1.5px solid #DC2626` border — no toast

---

## 6. Student Panel Screens — HI-FI

### Student Dashboard — Live State (Hero Card)

```
Background:  #FFFFFF card, shadow-md, radius 14px
Border:      2px solid #1A3829
Border-radius: 14px
Padding:     32px
"LIVE NOW" badge: bg #EF4444, text #FFFFFF, radius 6px, 12px DM Sans 700
Pulse ring:  box-shadow animation (green-800 alpha) on badge
Heading:     22px DM Sans 700, #0F172A
Subtext:     16px DM Sans 400, #475569
CTA button:  Primary (green-800), full-width, 48px height, "Enter Exam →"
```

### Student Dashboard — Empty State

```
Illustration:  geometric SVG (no photos, no characters), 160px × 160px
Heading:       "No live exams right now" — 22px DM Sans 700, #0F172A
Body:          "Your teacher hasn't scheduled anything yet. Check back soon."
               16px DM Sans 400, #475569
Level progress bar (always shown, even in empty state):
  track: #E2E8F0 (8px tall, radius 999px)
  fill:  #1A3829 (animated width on mount, 600ms ease-out)
  label: "Level 3 · 58% to Level 4" — DM Sans 13px, #475569
```

### Pre-Assessment Lobby

**Countdown timer:**
```
Font:     DM Mono 72px 700, #1A3829, tabular-nums
Align:    centered horizontally
Sub-text: "seconds until exam opens" — DM Sans 14px, #94A3B8
```

**Breathing circle:**
```
Shape:   perfect circle, 120px diameter
Border:  2px solid rgba(26,56,41,0.3)
BG:      rgba(26,56,41,0.04)
Keyframe: scale(1) → scale(1.08) → scale(1), 4s ease-in-out infinite
```

**Network health indicator:**

| State | Dot | Label | Sublabel |
|-------|-----|-------|----------|
| Optimal | 8px `#22C55E` | "Network: Optimal" DM Sans 14px `#166534` | "All answers sync in real time" 12px `#94A3B8` |
| Degraded | 8px `#F59E0B` | "Network: Unstable" `#854D0E` | "Answers saving locally" 12px |
| Severed | 8px `#EF4444` | "Offline" `#854D0E` | "Test paused. Teacher knows." 12px |

**"I'm Ready" button:** Primary full-width 48px — only enabled when lobby countdown = 0 OR admin triggers early start.

---

### EXAM Engine

**Canvas:**
```
Background: #F8FAFC (not white — reduces eye strain on equations)
No sidebar, no standard header
```

**Equation panel:**
```
Max-width:   560px (centered in 60% content column)
Background:  #FFFFFF
Radius:      14px
Padding:     32px
Border:      1px solid #E2E8F0
Font:        DM Mono 26px 400, tabular-nums, right-aligned
Line-height: 1.6
Negative numbers: #991B1B (equiluminant)
Alternating rows: even rows bg #F8FAFC, odd rows bg #FFFFFF (eye-tracking aid)
```

**MCQ grid:** max 200px below equation bottom edge, full spec in §4.2.

**Question Navigator (EXAM — mounted):**
```
Width:       280px
Background:  #FFFFFF
Border-left: 1px solid #E2E8F0
Padding:     20px
Grid:        auto-flow, 4 columns, 8px gap
Item size:   36px × 36px, radius 8px
Unanswered:  bg #F1F5F9, text #475569
Current:     bg #1A3829, text #FFFFFF
Answered:    bg #DCFCE7, text #166534, checkmark icon 12px
Skipped:     bg #FEF9C3, text #854D0E
```

---

### TEST Engine — Phase 1 (START)

Same layout as EXAM with navigator MOUNTED. Replaces equation panel with:
```
Config display panel:
  Speed:  "450ms per number" — DM Mono 18px, #0F172A
  Digits: "2-digit" — DM Sans 16px, #475569
  Rows:   "5 numbers" — DM Sans 16px, #475569
  Separator: 1px #E2E8F0

Begin button:
  Full-width Primary 56px tall (larger than normal — single focus point)
  "Begin Flash ▶"
  Below: breathing circle animation (same as lobby)
```

---

### TEST Engine — Phase 3 (MCQ)

Navigator UNMOUNTED. Full canvas:
```
Background:  #FFFFFF
Question:    "What was the total?" — DM Sans 22px 600, #0F172A
             centered, 48px below top
MCQ grid:    centered, max-width 480px
             full spec §4.2 — min 64×64px
Skip button: Ghost variant, below grid, "Skip this question →"
             DM Sans 14px, #94A3B8
```

---

### Student Profile

**Digital ID card:** same spec as B10 wireframe.

**Level progress bar:**
```
Track:  #E2E8F0 (8px tall, radius 999px, full width)
Fill:   #1A3829 (animated width on mount, 600ms ease-out)
Label:  "Level 3 · 58% to Level 4" — DM Sans 13px, #475569
```

**Ticker Mode accessibility toggle:**
```
Section heading: "Accessibility" — DM Sans 14px 600, #475569, uppercase, tracking-wide
                 1px #E2E8F0 separator above

Toggle row:
  Label:     "Ticker Mode" — DM Sans 15px 500, #0F172A
  Sub-label: "Scroll numbers as a tape instead of full-screen flash"
             DM Sans 13px 400, #475569
  Switch:    shadcn/ui Switch component
             Checked (ON):  thumb #FFFFFF, track #1A3829
             Unchecked (OFF): thumb #FFFFFF, track #CBD5E1
             Focus: 3px solid #1A3829 outline, 2px offset
  Persistence: setting written to profiles.ticker_mode BOOLEAN on toggle
  aria-label: "Ticker Mode — display flash numbers as scrolling tape"
```

> When Ticker Mode is ON, Flash Phase 2 renders numbers as a horizontally scrolling tape at the bottom 20% of the viewport rather than a full-centred flash. Implementation detail is in `docs/08_a11y.md` §Ticker Mode.

**Hero section:**
```
Score display:   DM Mono 48px 700, #0F172A, centered
                 "92%" — tabular-nums
Grade badge:     20px DM Sans 700, bg #DCFCE7, text #166534, radius 6px
                 "A+" — 32px DM Mono 600

Donut chart:     Recharts 140px, stroke-width 16px
                 Progress arc: #1A3829
                 Track:        #E2E8F0
                 DPM metric inside: DM Mono 18px, "54 DPM"
```

**Review table:**
```
Equation column:    DM Mono 16px, right-aligned, tabular-nums
Your answer column: DM Mono 16px
Verdict column:     "✓ Correct" — DM Sans 14px #166534
                    "✗ Wrong (B)" — DM Sans 14px #DC2626
Row bg (wrong):     #FEE2E2
Row bg (correct):   #FFFFFF (no highlight — only wrong rows are flagged)
Row bg (skipped):   #FEF9C3
```

**Filter chips:**
```
"All"       active: bg #1A3829 text #FFFFFF radius 4px
"Incorrect" inactive: bg #F1F5F9 text #475569
"Skipped"   inactive: bg #F1F5F9 text #475569
Height: 32px, padding 0 14px
```

---

### Submission Confirmation

```
Canvas:   full 100vw × 100vh, bg #F8FAFC
Card:     bg #FFFFFF, shadow-lg, radius 18px, max-width 440px, centered
          padding 48px 40px
          mount animation: translateY(24px)→translateY(0) + opacity 0→1, 400ms ease-out

Icon:     checkmark circle — 56px, bg #DCFCE7, icon #166534
Heading:  "Assessment Submitted" — DM Sans 22px 700, #0F172A
Body:     "Your answers are saved and sent to your teacher." — 16px #475569
Subtext:  "Results will appear here once published." — 14px #94A3B8

Confetti: canvas element, contained to card bounding box
          particles: #1A3829 · #22C55E · #86EFAC (green palette only)
          duration: 2000ms, no repeat

Audio:    completion-chime.mp3, single play on mount
          respects prefers-reduced-motion (no confetti if reduced-motion set)

Buttons:  "View Results →" Primary full-width 48px
          "Back to Dashboard" Secondary below
```

---

## 7. Flash Anzan Phase 2 — Zero-UI Spec

This is the most critical UI in the platform. Every constraint is a hard requirement.

### Canvas

```
Dimensions:  100vw × 100vh
Overflow:    hidden
Background:  per speed ramp — §1 Flash Anzan Contrast Ramp
```

### Flash Number

```css
.flash-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'DM Mono', monospace;
  font-size: clamp(96px, 30vh, 180px);  /* MUST be at least 30% viewport height */
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: /* from contrast ramp */;
  transition: none !important;          /* ABSOLUTE — any transition = retinal ghosting */
  user-select: none;
  pointer-events: none;
  line-height: 1;
}

/* Negative numbers only */
.flash-number--negative {
  color: #991B1B; /* equiluminant crimson — 9.7:1 AAA */
}

/* High-speed opacity fade (<300ms) */
.flash-number--high-speed {
  /* transition: none !important still applies to all props EXCEPT: */
  /* opacity fade applied via JS: element.style.opacity = '0' → '1', 30ms */
}
```

### Zero-UI Enforcement

| Element | Phase 2 State | Implementation |
|---------|--------------|----------------|
| Sidebar | Not rendered | `{phase !== 'PHASE_2_FLASH' && <Sidebar/>}` |
| Header/timer | Not rendered | `{phase !== 'PHASE_2_FLASH' && <Timer/>}` |
| Question Navigator | Not rendered | `{phase !== 'PHASE_2_FLASH' && <Navigator/>}` |
| Progress bar | Not rendered | `{phase !== 'PHASE_2_FLASH' && <Progress/>}` |
| Sync indicator | Not rendered | `{phase !== 'PHASE_2_FLASH' && <SyncDot/>}` |
| Network banner | Not rendered | `{phase !== 'PHASE_2_FLASH' && <NetworkBanner/>}` |

> All elements are **conditionally unmounted** — not hidden with CSS.  
> `display: none` and `visibility: hidden` are insufficient. Unmount.  
> **Phase string:** `'PHASE_2_FLASH'` — never `'FLASH'`. The ExamPhase enum has no `'FLASH'` value. Using `'FLASH'` means the condition is permanently true and all elements remain mounted throughout Phase 2.

### Pause Modal (focus loss)

```
Trigger: document.visibilityState === 'hidden' → cancelAnimationFrame()
Overlay: full canvas, bg rgba(248,250,252,0.96) backdrop-blur 4px
Card:    bg #FFFFFF, shadow-lg, radius 18px, centered

Icon:    pause circle, 48px, #1A3829
Heading: "Assessment Paused" — DM Sans 22px 700, #0F172A
Body:    "Focus was lost. Your sequence has stopped. Teacher has been notified."
         DM Sans 16px, #475569

No dismiss button — auto-resumes on visibilityState === 'visible'
Telemetry: Broadcast event fires to admin monitor immediately
```

---

## 8. Loading & Skeleton System

### App Boot Screen

```
Background:  #204074 (brand-navy — ONLY context where navy is used)
Logo mark:   centered, 80px × 80px, white
Wordmark:    "MINDSPARK" below logo, DM Sans 24px 700, #FFFFFF
             letter-spacing: 0.15em
Progress bar: #F57A39 (brand-orange), 3px height, full-width at bottom of logo card
              indeterminate: 40% width, translateX loop 1.5s ease-in-out infinite
```

### 3000ms Get Ready Interstitial

```
Lobby exit:  transform:scale(0.95) opacity:0, 400ms cubic-bezier(.25,1,.5,1)
Overlay:     full canvas, bg rgba(248,250,252,0.92), backdrop-blur 8px
Card:        bg #FFFFFF, shadow-lg, radius 18px, max-width 400px, centered
             padding 40px

Lottie:      abacus-loader.json, 80px × 80px, centered, loop
Heading:     "Get Ready" — DM Sans 22px 700, #0F172A, 16px below Lottie
Body:        "The sequence will begin in a moment." — DM Sans 15px, #475569

Progress bar:
  height: 3px, radius 999px
  track:  #E2E8F0, full width below card content
  fill:   #166534 (green-600), animates 0%→100% over 3000ms linear
  timing: width transition: 3000ms linear (no easing — constant expectation)

Metronome:   Web Audio API, 3 beats at 500ms intervals (t=500, t=1000, t=1500)
             NOT MP3 — Web Audio API for zero network dependency and timing precision
             Frequency: 880Hz, duration: 80ms, sine wave
```

### Skeleton Screens

```css
/* Applied to all skeleton blocks */
.skeleton {
  background: linear-gradient(
    90deg,
    #F1F5F9 25%,
    #E2E8F0 50%,
    #F1F5F9 75%
  );
  background-size: 400% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;  /* matches content radius */
}

@keyframes shimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
```

**Synchrony rule:** All skeleton blocks on the same page use the same 1.5s duration. They must pulse in visual sync — identical `animation-delay: 0ms` for every block on the page.

**Accessibility:**
```html
<!-- Applied to skeleton container -->
<div aria-busy="true" aria-label="Loading content">
  <div class="skeleton" aria-hidden="true" />
</div>

<!-- When data loads, swap to: -->
<div aria-busy="false">
  {/* real content */}
</div>
```

### Inline Loading (operations)

```
Small Lottie instance (40px) embedded in Toast notification
Toast: bg #0F172A, text #FFFFFF, radius-pill 999px, shadow-lg
       "Saving…" / "Syncing…" — DM Sans 13px
Duration: persists until operation resolves, then 2s fade-out
Position: fixed bottom-right, 24px inset
```

---

## 9. Empty States

Every list view requires an empty state. All states use:
- Geometric SVG illustration (no photos, no characters, no people)
- Encouraging microcopy (never clinical, never system language)
- One primary CTA

| Screen | Illustration | Heading | Body | CTA |
|--------|-------------|---------|------|-----|
| Levels | Isometric staircase (upward) | "Every journey starts somewhere" | "Create your first curriculum level to begin." | "Create Level 1" |
| Student list | Abstract grid of dots (growing) | "No students yet" | "Import a CSV or add students manually to get started." | "Import CSV" |
| Assessment list | Abstract lightning bolt outline | "No assessments yet" | "Create your first exam or flash test for your students." | "Create Assessment" |
| Results list | Abstract score card outline | "No results to show yet" | "Results will appear here once an assessment is closed." | — (no CTA) |
| Announcements | Abstract megaphone outline | "Nothing published yet" | "Write your first announcement for the whole school." | "Write Announcement" |
| Activity log | Abstract timeline line | "No activity recorded yet" | "Actions taken will appear here automatically." | — |
| Student dashboard (empty) | Resting abacus outline | "No live exams right now" | "Your brain gets a rest today! Check back when your teacher posts an exam." | — |
| Student results (pending only) | Hourglass outline | "Still waiting…" | microcopy — see §10 | — |

**Empty state layout:**
```
Margin-top:    80px (from content area top)
Illustration:  160px × 160px, centered, color #E2E8F0 (subtle)
Heading:       DM Sans 20px 700, #0F172A, 24px below illustration
Body:          DM Sans 15px 400, #475569, max-width 320px, centered, 8px below heading
CTA button:    Primary 40px, 20px below body, auto-width
```

---

## 10. Microcopy Standards

### Approved microcopy

| Context | APPROVED text |
|---------|---------------|
| Pending results | "Your brain worked hard! 🧠 Teacher is reviewing your math." |
| Network severed | "The network is taking a quick break. Test paused. Teacher knows." |
| Network degraded | "Going offline — saving your answers locally. Keep going!" |
| Offline submit success | "All done! Your answers were saved safely." |
| Focus lost (Phase 2) | "Assessment paused — focus lost. Teacher notified." |
| Account locked | "Your account is temporarily locked. Ask your teacher." |
| Force-reset required | "First time? Set a new password to get started." |
| No live exams | "No live exams right now — check back soon!" |
| Exam submitted | "Your answers are saved and sent to your teacher." |

### NEVER use

| Context | PROHIBITED text |
|---------|----------------|
| Any error | Raw error codes: "Error 503", "Error 404", "ERR_CONNECTION" |
| Network loss | "Connection Lost" |
| Results | "Status: Pending", "result_status: null" |
| Any context | "Something went wrong. Please try again." (too vague) |
| Any context | "Unauthorized" (show redirect, not this message) |

---

## 11. NEVER List

| Prohibited | Replacement |
|------------|------------|
| `#FF6B6B` anywhere | `#991B1B` for negative arithmetic operands, `#EF4444` for LIVE badge |
| `#1A1A1A` anywhere | **BANNED without exception.** Flash dampen bg is `#F1F5F9` — never `#1A1A1A` |
| `#E0E0E0` anywhere | **BANNED without exception.** Flash dampen text is `#334155` — never `#E0E0E0` |
| `#121212` as any background | `#F8FAFC` page bg (both panels, no exceptions) |
| `#FFD700` as any UI colour | `#1A3829` green-800 for primary actions |
| `#3A9ED1` in any component | Use info-bg `#EFF6FF` / `#1D4ED8` for info states |
| Roboto Mono font | DM Mono — no exceptions |
| Red timer background | Warning amber `#FFFBEB` at ≤20% |
| Pulsing/flashing timer | Colour-only transition at 800ms ease |
| `#F57A39` on interactive elements | Brand orange: loading bar on navy bg ONLY |
| `#204074` as page/card bg | Brand navy: boot screen + login ONLY |
| `transition` on `.flash-number` | `transition: none !important` — always |
| `setTimeout` / `setInterval` for flash timing | `requestAnimationFrame` + delta accumulator |
| DOMPurify | `sanitize-html` server-side only |
| `display:none` to hide Phase 2 peripheral UI | Conditional unmount via JSX `{condition && <Component/>}` |

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All colour values match Design System v3 tokens | ✅ §1 — full token table |
| DM Mono on ALL numeric elements, no exceptions | ✅ §2 — typography table + NEVER §11 |
| Flash Phase 2: white canvas, 30vh number, zero UI | ✅ §7 — full spec + constraint table |
| MCQ 64px minimum specified (Fitts Law) | ✅ §4.2 |
| Timer amber at EXACTLY 20% remaining | ✅ §1 + §4.9 |
| `#991B1B` crimson for negative numbers ONLY | ✅ §1 + §4.2 + §7 |
| `transition: none !important` on flash number | ✅ §7 CSS block |
| Skeleton shimmer spec with `aria-busy` pattern | ✅ §8 |
| Empty states for all list views | ✅ §9 — full table |
| Brand colours (`#204074`, `#F57A39`) designated contexts only | ✅ §1 + §11 |
| Microcopy standards — no raw error codes | ✅ §10 |
| 3000ms interstitial — Web Audio API (not MP3) | ✅ §8 |
| Skeleton visual sync — identical animation-delay | ✅ §8 |
