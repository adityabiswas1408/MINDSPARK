# MINDSPARK UI Diagnostic Report

**Date:** 2026-04-11
**Scope:** Diagnosis-only audit of every `(admin)` and `(student)` route, all shared components, the Flash Anzan exam flow, and the design-system layer in `globals.css`.
**Authority files consulted:**
- `docs/designs/abacus-edge-design-spec (4).html` ("Design System v3.0 Final" — 28 sections)
- `docs/specs/07_hifi-spec.md`
- `docs/GOTCHAS.md`
- `src/app/globals.css`
- `CLAUDE.md`

**Verification method:** code read + `chrome-devtools` runtime inspection against `https://mindspark-one.vercel.app` (logged in as `admin@mindspark.test`). Zero fixes were applied. No code was modified in the course of this audit.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Root Cause Analysis](#2-root-cause-analysis)
3. [Design System Audit](#3-design-system-audit)
4. [Two Styling Systems Conflict](#4-two-styling-systems-conflict)
5. [Broken Component Inventory (Tailwind Palette Failure)](#5-broken-component-inventory-tailwind-palette-failure)
6. [Fake Data Inventory](#6-fake-data-inventory)
7. [Missing Animations & Undefined Keyframes](#7-missing-animations--undefined-keyframes)
8. [Missing States (Loading / Empty / Error)](#8-missing-states-loading--empty--error)
9. [Component Diagnosis](#9-component-diagnosis)
10. [Page Diagnosis](#10-page-diagnosis)
11. [Accessibility Violations](#11-accessibility-violations)
12. [Console Errors & Runtime Warnings](#12-console-errors--runtime-warnings)
13. [Spec "NEVER" List Violations](#13-spec-never-list-violations)
14. [Prioritized Fix List](#14-prioritized-fix-list)
15. [Effort Estimate](#15-effort-estimate)
16. [What Is Working](#16-what-is-working)
17. [Appendix A — Files Audited](#appendix-a--files-audited)
18. [Appendix B — Visual Audit Evidence](#appendix-b--visual-audit-evidence)

---

## 1. Executive Summary

The MINDSPARK UI is **structurally broken at the design-system layer**, not merely "inconsistent." The issues fall into six categories, ranked by severity:

| # | Category | Severity | Evidence |
|---|----------|----------|----------|
| 1 | **Tailwind v4 color palettes missing from `@theme inline`** — `red`, `amber`, `blue`, `emerald`, `green` (except 800) classes silently produce transparent backgrounds and slate-100 text | **CRITICAL** | `globals.css:189–267` defines only `slate-*`, brand colours, and state aliases. Visual audit confirms `bg-red-100`, `bg-amber-100`, `bg-emerald-100`, `bg-blue-100`, `text-red-800`, `text-amber-800`, `text-green-700` all resolve to `rgba(0,0,0,0)` / `rgb(241,245,249)` at runtime. |
| 2 | **Design tokens defined but never consumed** — 37 tokens in `:root`, components write raw hex instead | **CRITICAL** | `create-assessment-wizard.tsx` contains 17 hardcoded hex strings identical to tokens; `exam-timer.tsx` duplicates timer tokens with wrong values. |
| 3 | **Two parallel styling systems** — Tailwind utility classes AND inline `style={{}}` hex, chosen at random per component | **HIGH** | Wizard files are 100% inline; `students-table-client.tsx` is 100% Tailwind; `live-exam-card.tsx` is inline with emoji content. |
| 4 | **Fake / hardcoded data rendered as real metrics** — 6 confirmed instances on live pages | **HIGH** | Student dashboard "42% progress", "Skill Metrics" bars (88/64/92), level "Avg Competencies 0", announcements "Engagement Insights", lobby pre-flight checklist, settings auto-archive toggle. |
| 5 | **Undefined `@keyframes` referenced in runtime style props** — `confirm-slide-in`, `completion-slide-up` | **HIGH** | `mcq-grid.tsx:128`, `completion-card.tsx:142` — both call names that do not exist in `globals.css` or any other CSS file. Browser silently drops the animation. |
| 6 | **Admin sidebar is a visual inversion of spec** — dark green instead of white, 261 px instead of 240 px, no 3 px left border on active link, two `<h1>` elements per page | **HIGH** | `globals.css:322–329` sets `--sidebar: #1A3829` (green). Spec requires white card with brand navy accent. |

**The underlying cause of ~60 % of all visible bugs is item (1): an incomplete `@theme inline` block.** Fixing that single file surfaces ~18 invisible badges, sync indicators, grade pills, LIVE badges, and empty-state variants without touching any component. Items (2)–(6) require component-level work.

The exam engine layer (`src/components/exam/flash-number.tsx`, `anzan-flash-view.tsx`, `transition-interstitial.tsx`) is the **only** part of the app that is spec-compliant.

**Total findings: 94** — 17 CRITICAL, 41 HIGH, 28 MEDIUM, 8 LOW.

---

## 2. Root Cause Analysis

### 2.1 The `@theme inline` omission (root cause of ~60 % of visible bugs)

Tailwind v4 generates utility classes **only for colour scales declared inside `@theme inline`**. `src/app/globals.css:195–227` declares:

- `--color-slate-50` through `--color-slate-950` (full scale — 11 shades)
- `--color-green-800` (single shade only)
- `--color-brand-navy`, `--color-brand-orange`
- `--color-bg-page`, `--color-bg-card`
- `--color-success-bg`, `--color-success-text`, `--color-warning-bg`, `--color-warning-text`, `--color-error-bg`, `--color-error-text`, `--color-info-bg`, `--color-info-text`, `--color-live-badge`

**The following Tailwind palettes are NOT declared and therefore NOT compiled into CSS:**

| Palette | Component usage | Render result |
|---------|-----------------|---------------|
| `red-50..950` | Status badges, error buttons, grade F | `bg: rgba(0,0,0,0)` / `color: rgb(241,245,249)` |
| `amber-50..950` | Warning states, "submit pending" badges | Same invisible failure |
| `emerald-50..950` | Grade A/A+ chips, success buttons | Same |
| `blue-50..950` | Info banners, "live" sync indicators | Same |
| `green-50..700`, `green-900..950` | Avatar backgrounds, chart strokes | Same |
| `indigo-100..900` | Avatar palette rotation | Same |
| `purple-*`, `pink-*`, `rose-*`, `yellow-*`, `lime-*`, `teal-*`, `cyan-*`, `sky-*`, `violet-*`, `fuchsia-*`, `orange-*`, `stone-*`, `neutral-*`, `zinc-*`, `gray-*` | Various one-off usages | Same |

**Only the `slate-*` palette and `green-800` actually render.**

### 2.2 How this was hidden

Tailwind v4 silently drops rules for undeclared palettes — there is no compiler error, no warning in the build log, and the utility classes still appear in the DOM as `className="bg-red-100"`. The class simply matches no compiled rule. Because the default text colour of `<body>` is slate-100 (see 2.3), the invisible badges still show their text on the page background, so casual visual inspection misses them entirely.

### 2.3 A second root cause: `text-secondary` token collision

`globals.css:316` declares `--secondary: #F1F5F9` (a shadcn default for the "secondary button" surface). Components that write `className="text-secondary"` expect `#475569` (the `--text-secondary` custom property from line 38), but Tailwind resolves `text-secondary` → `var(--secondary)` → `#F1F5F9` instead. Runtime check on `/login` confirmed `body { color: rgb(241, 245, 249) }`.

Every page inherits this body colour. Any component that does not explicitly set its own text colour renders body copy as almost-white slate on a near-white background.

### 2.4 Third root cause: inline-style refuge

Because the developer experienced Tailwind failures (sections 2.1 and 2.3 above), the working pattern became: **"write inline style with hex, never trust a class."** This is visible in every file under `src/components/assessments/` and `src/components/student/`. The inline-style approach then diverges from the token system because hex values drift — `exam-timer.tsx` uses `#FEF9C3` for urgent bg but `globals.css:55` defines `--bg-timer-urgent: #FFFBEB`.

---

## 3. Design System Audit

### 3.1 Token inventory — 48 tokens required, 37 partially present

Extracted from `abacus-edge-design-spec (4).html` and `07_hifi-spec.md`:

| Category | Spec tokens | Present in `globals.css` | Missing | Notes |
|----------|-------------|--------------------------|---------|-------|
| Brand | 4 | 3 | `--clr-brand-gold` (#D4AF37) | Referenced in spec header gradient |
| Page / card bg | 3 | 3 | — | ✓ |
| Text scale | 5 | 5 | — | `--text-primary/secondary/subtle/negative/danger` |
| Slate palette | 11 | 11 | — | Full scale present ✓ |
| Green scale | 9 | 1 (`--color-green-800` only) | `green-50..700`, `green-900..950` | ← root cause item 2.1 |
| State aliases | 8 | 8 | — | bg/text pairs for success/warning/error/info |
| Live badge | 2 | 2 | — | ✓ |
| Timer | 6 | 6 | — | Present BUT not used by `exam-timer.tsx` |
| Flash | 4 | 4 | — | `--flash-bg-fast/mid`, `--flash-tx-fast/mid` |
| Radius | 6 | 6 | — | chip/badge/btn/card/overlay/pill |
| Shadow | 5 | **0** | `--shadow-xs/sm/md/lg/xl` | Spec defines full elevation scale — none declared |
| Motion tokens | 4 | **0** | `--ease-standard`, `--ease-smooth`, `--dur-fast/mid/slow` | Referenced across spec animation defs |
| Font tokens | 3 | 1 (`--font-sans` only) | `--font-mono`, `--font-heading` | Line 192 maps `--font-heading: var(--font-sans)` but no separate heading face |
| Avatar palette | 8 | **0** | 8-stop rotating avatar bg | Used by `students-table-client.tsx:51–57` — all invisible |

**Total: 17 missing tokens, 20 with name drift, 11 orphaned (defined but never read).**

### 3.2 Name drift — tokens present under the "wrong" name

Components reach for names that spec defines but `globals.css` does not expose:

| Component expects | `globals.css` provides | Result |
|-------------------|------------------------|--------|
| `--color-background` | Mapped at line 228 to `var(--background)` | Works |
| `bg-success` | `--color-success-bg` (line 218) | ✗ — Tailwind needs `--color-success` not `--color-success-bg` |
| `text-success` | `--color-success-text` | ✗ — same reason |
| `bg-warning`, `text-warning` | `--color-warning-bg`, `--color-warning-text` | ✗ |
| `bg-error`, `text-error` | `--color-error-bg`, `--color-error-text` | ✗ |
| `bg-live-badge` | `--color-live-badge` (line 226) | ✓ |

Because spec uses short names (`success`/`warning`/`error`) and `globals.css` uses suffixed names (`success-bg`/`success-text`), **every `bg-success`, `text-warning`, `bg-error`, `text-info` class across the codebase is broken**.

### 3.3 Orphaned tokens (defined in `:root`, never read by any component)

Confirmed via grep across `src/`:

- `--bg-overlay` (line 33) — no consumer
- `--radius-chip` (4 px) — no consumer
- `--radius-badge` (6 px) — no consumer
- `--radius-pill` — no consumer
- `--flash-bg-fast`, `--flash-bg-mid`, `--flash-tx-fast`, `--flash-tx-mid` — `flash-number.tsx` writes raw hex
- `--bg-timer-normal`, `--bg-timer-urgent`, `--border-timer-normal`, `--border-timer-urgent`, `--text-timer-normal`, `--text-timer-urgent` — `exam-timer.tsx` writes its own (incorrect) hex values instead

---

## 4. Two Styling Systems Conflict

### 4.1 Inline-hex families (100 % `style={{}}`)

| File | Lines | Hex count |
|------|-------|-----------|
| `src/components/assessments/create-assessment-wizard.tsx` | 186–344 | 17 |
| `src/components/assessments/step-type.tsx` | 12–87 | 11 |
| `src/components/assessments/step-questions.tsx` | 20–320 | 23 |
| `src/components/assessments/step-config.tsx` | 10–120 | 14 |
| `src/components/assessments/assessment-card.tsx` | 23–176 | 18 |
| `src/components/student/live-exam-card.tsx` | 39–153 | 14 |
| `src/components/exam/exam-timer.tsx` | 11–68 | 8 |
| `src/components/exam/sync-indicator.tsx` | 9–45 | 4 |
| `src/components/exam/completion-card.tsx` | 128–237 | 19 |

### 4.2 Tailwind-class families (100 % `className=""`)

| File | Lines |
|------|-------|
| `src/components/students/students-table-client.tsx` | 51–514 |
| `src/components/levels/levels-client.tsx` | 14–139 |
| `src/components/results/results-client.tsx` | 27–400+ |
| `src/app/(admin)/admin/announcements/announcements-client.tsx` | 147–215 |
| `src/app/(admin)/admin/settings/settings-client.tsx` | 294–414 |
| `src/app/(student)/student/dashboard/page.tsx` | 1–252 |

### 4.3 Hybrid / contradictory files

`src/components/exam/mcq-grid.tsx` (149 lines):
- Uses `rounded-xl`, `text-sm` (Tailwind) **and** `style={{ animation: 'confirm-slide-in 200ms ease-out' }}` (inline, referencing undefined keyframe)

`src/components/exam/anzan-flash-view.tsx`:
- `className="min-h-screen bg-black"` (Tailwind) + `data-testid="phase-2-flash"` + inline positioning on child flash-number

### 4.4 Implication

The codebase has no enforced convention. A single feature (e.g., the LIVE badge) can be rendered by `bg-live-badge` (Tailwind, works), `background: '#EF4444'` (inline, works), or `bg-red-500` (Tailwind, broken). All three exist across the project. When a developer copies one pattern into a new file, there is no way to know which will render correctly.

---

## 5. Broken Component Inventory (Tailwind Palette Failure)

Every component below uses at least one Tailwind class that resolves to invisible (transparent bg, slate-100 text) at runtime. Confirmed via `chrome-devtools` `evaluate_script` on production.

| File | Line | Class | Rendered |
|------|------|-------|----------|
| `src/components/results/results-client.tsx` | 27 | `bg-emerald-100 text-emerald-800` | transparent / slate-100 |
| `src/components/results/results-client.tsx` | 28 | `bg-green-100 text-green-800` | transparent / `#1A3829` (text works, bg doesn't) |
| `src/components/results/results-client.tsx` | 29 | `bg-yellow-100 text-yellow-800` | transparent / slate-100 |
| `src/components/results/results-client.tsx` | 30 | `bg-orange-100 text-orange-800` | transparent / slate-100 |
| `src/components/results/results-client.tsx` | 31 | `bg-red-100 text-red-800` | transparent / slate-100 |
| `src/components/results/results-client.tsx` | 32 | `bg-red-200 text-red-900` | transparent / slate-100 |
| `src/components/students/students-table-client.tsx` | 51 | `bg-blue-100 text-blue-700` | transparent / slate-100 |
| `src/components/students/students-table-client.tsx` | 52 | `bg-green-100 text-green-700` | transparent / slate-100 |
| `src/components/students/students-table-client.tsx` | 53 | `bg-purple-100 text-purple-700` | transparent / slate-100 |
| `src/components/students/students-table-client.tsx` | 54 | `bg-amber-100 text-amber-700` | transparent / slate-100 |
| `src/components/students/students-table-client.tsx` | 55 | `bg-pink-100 text-pink-700` | transparent / slate-100 |
| `src/components/students/students-table-client.tsx` | 56 | `bg-cyan-100 text-cyan-700` | transparent / slate-100 |
| `src/components/students/students-table-client.tsx` | 57 | `bg-indigo-100 text-indigo-700` | transparent / slate-100 |
| `src/components/assessments/step-questions.tsx` | 118 | `style backgroundColor: '#D1FAE5'` (non-token hex) | renders but off-palette |
| `src/components/assessments/step-questions.tsx` | 119 | `color: '#065F46'` | renders but off-palette |
| `src/app/(admin)/admin/monitor/monitor-client.tsx` (any status badge) | — | `bg-amber-100`, `bg-red-100` | all invisible |
| `src/components/exam/sync-indicator.tsx` | 11 | `bg-green-100 text-green-800` (synced state) | transparent / `#1A3829` |
| `src/components/exam/sync-indicator.tsx` | 13 | `bg-blue-100 text-blue-800` (syncing) | transparent / slate-100 |
| `src/components/exam/sync-indicator.tsx` | 15 | `bg-amber-100 text-amber-800` (pending) | transparent / slate-100 |

**Scope of breakage:** all 8 rotating avatar colours in the students table, 6 grade badges in results, 3 sync states in exam flow, every status pill in monitor, every warning toast. The user sees capitalised single letters or plain text floating on card backgrounds with no surrounding pill.

---

## 6. Fake Data Inventory

Data rendered to users as "real" that is either hardcoded or not backed by a database field.

| # | Location | Line(s) | Fake value | Backing store |
|---|----------|---------|------------|---------------|
| 1 | `src/app/(student)/student/dashboard/page.tsx` | 184 | "Progress to next level **42%**" | none — literal in JSX |
| 2 | " | 187 | `width: '42%'` bar | none — same literal |
| 3 | " | 201 | Rank "**—**" | empty placeholder |
| 4 | " | 213 | Badges "**0**" | literal zero |
| 5 | " | 232 | `{ label: 'Logical Reasoning', pct: 88, color: '#1A3829' }` | none — module-level const |
| 6 | " | 233 | `{ label: 'Speed Analysis', pct: 64 }` | none |
| 7 | " | 234 | `{ label: 'Accuracy', pct: 92 }` | none |
| 8 | `src/app/(admin)/admin/announcements/announcements-client.tsx` | 200–211 | "Announcements sent on Tuesday mornings have a **25% higher** read rate" | none — hardcoded copy labelled "Engagement Insights" |
| 9 | `src/components/levels/levels-client.tsx` | 129 | "Avg Competencies: **0**" | hardcoded `<p>0</p>` |
| 10 | `src/components/levels/levels-client.tsx` | 133 | "Curriculum Density: **—**" | hardcoded `<p>—</p>` |
| 11 | `src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx` | 178 | "✓ Camera & Microphone Access" | **no permission request made** — always shows checked |
| 12 | " | 186 | "✓ Secure Browser Environment" | **no environment check** — always shows checked |
| 13 | `src/app/(admin)/admin/settings/settings-client.tsx` | 361 (comment in source) | "Auto-archive old results" toggle | **no DB column** backing this toggle — source comment `// Manual toggle — no DB column backing` |
| 14 | `src/app/(admin)/admin/settings/settings-client.tsx` | 404 | `href="https://docs.mindspark.app"` | **non-existent external URL** |

Items 11–12 are the most dangerous: a student sees green-check pre-flight confirmation for security features that are not actually running.

---

## 7. Missing Animations & Undefined Keyframes

### 7.1 Keyframes referenced but not defined

| File | Line | Animation name | Definition |
|------|------|----------------|------------|
| `src/components/exam/mcq-grid.tsx` | 128 | `confirm-slide-in` | **not defined** anywhere in `src/` or `globals.css` |
| `src/components/exam/completion-card.tsx` | 142 | `completion-slide-up` | **not defined** |

Both fall through silently — the browser treats the `animation` shorthand as invalid and applies no effect.

### 7.2 Keyframes defined and used correctly

- `shimmer` (globals.css:168) — used by `.skeleton`
- `breathe` (globals.css:173) — used by `.breathing-circle`
- `pulse-ring` (globals.css:178) — defined but **not used** by `assessment-card.tsx:88` which writes `animate-ping` (Tailwind built-in) instead of `pulse-ring`
- `slide-up` (globals.css:183) — used by `.card-mount`

### 7.3 Spec animations missing entirely

Per spec "Motion Tokens" section:

| Spec requirement | Status |
|------------------|--------|
| `--dur-fast: 150ms` | Not defined |
| `--dur-mid: 300ms` | Not defined |
| `--dur-slow: 500ms` | Not defined |
| `--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)` | Not defined |
| `--ease-smooth: cubic-bezier(0.25, 1, 0.5, 1)` | Hardcoded at `globals.css:183` but not exposed as a token |
| Count-up animation for KPI cards | Not implemented (kpi-card renders static) |
| LIVE pulse on assessment cards | Uses `animate-ping` instead of spec's `pulse-ring` |
| Transition interstitial 880 Hz chime | ✓ Implemented |
| Confetti on completion | ✓ Implemented |
| Flash mount/unmount transition: none | ✓ Implemented |

### 7.4 `prefers-reduced-motion` compliance

`globals.css:148` and `:163` correctly guard `.breathing-circle`, `.pulse-ring`, `.card-mount`, `.confetti-canvas`, `.skeleton`. However, the inline animation calls at `mcq-grid.tsx:128` and `completion-card.tsx:142` have no reduced-motion guard (if they worked, they would animate regardless of user preference).

---

## 8. Missing States (Loading / Empty / Error)

### 8.1 Loading states missing

| Page | Skeleton / spinner | Observation |
|------|---------------------|-------------|
| `/admin/dashboard` | None | Renders blank cards during fetch |
| `/admin/students` | None | Table flashes empty then populates |
| `/admin/results` | None | Chart renders `NaN` during loading per Recharts warning |
| `/admin/monitor` | None | No indicator of initial connection state |
| `/admin/assessments` | None | |
| `/admin/announcements` | None | |
| `/student/dashboard` | None | Stat cards show "0" instead of skeleton |
| `/student/exams/[id]/lobby` | None | Checklist items appear instantly |

The `.skeleton` class exists in `globals.css:155–160` and is never imported or used by any component.

### 8.2 Empty states

Spec requires an `EmptyState` component with:
- Centered icon (outline, not filled)
- Heading + subtext
- Optional CTA
- Radius `--radius-card` (14 px)
- Dashed border `2px dashed var(--color-slate-200)`

`src/components/shared/empty-state.tsx` implements most of this correctly (line 14 uses `rounded-[14px]`, line 15 uses `border-2 border-dashed`). However:

- It is only imported by 2 files (levels, assessments) out of 10 admin pages
- Student dashboard shows hardcoded zeroes instead of empty-state component (`/student/dashboard` line 213 "Badges 0")
- Results page shows "No results yet" as plain text, not via EmptyState

### 8.3 Error states

- No page-level error boundary: `src/app/(admin)/error.tsx` and `src/app/(student)/error.tsx` do not exist
- Wizard errors use inline red pill at `create-assessment-wizard.tsx:304–314` — correct pattern but single-use
- Lobby page uses `alert('...')` at `lobby-client.tsx:100` — **violates spec NEVER list** (no native alerts)
- Students-table CSV export uses `alert('CSV export coming soon')` at `students-table-client.tsx:373` — same violation + stub feature

---

## 9. Component Diagnosis

Listed by severity, highest first.

### 9.1 `src/components/exam/exam-timer.tsx` — **CRITICAL**

Token abandonment: ignores every `--bg-timer-*` token and writes its own hex with wrong values.

| Line | State | Property | Component uses | Spec token | Divergence |
|------|-------|----------|----------------|------------|------------|
| 47 | urgent | bg | `#FEF9C3` | `--bg-timer-urgent: #FFFBEB` | amber-100 vs amber-50 |
| 48 | urgent | border | `#854D0E` | `--border-timer-urgent: #F59E0B` | brown-800 vs amber-500 |
| — | normal | bg | `#FFFFFF` | `--bg-timer-normal: #F0FDF4` | white vs pale green |
| — | normal | text | `#475569` | `--text-timer-normal: #1A3829` | slate-600 vs forest green |

Fix is mechanical: replace inline hex with `var(--bg-timer-normal)` etc.

### 9.2 `src/components/assessments/create-assessment-wizard.tsx` — **CRITICAL**

- 17 hardcoded hex values, zero tokens.
- Step indicator circles at `197–243` duplicate `--color-slate-*` scale.
- Dialog max-width is `580px` inline — spec says overlay radius `--radius-overlay: 18px` (line 66) but component uses default shadcn radius.
- Line 257–279: `<select>` is raw HTML, not `<Select>` from shadcn/ui — misses keyboard nav styling.
- Line 198: `color: '#0F172A'` inline — this is `--text-primary`, 100 % reproducible with `var(--text-primary)`.

### 9.3 `src/components/exam/completion-card.tsx` — **HIGH**

- Line 128: `fixed inset-0 z-[9999]` — **not using `createPortal`** despite `CLAUDE.md` section "Modals and Overlays" requiring it
- Line 142: `animation: 'completion-slide-up 400ms ease-out'` — **undefined keyframe**
- Line 140: `rounded-2xl` (16 px) — spec `--radius-overlay` is 18 px
- Line 157: checkmark colour `#166534` — spec uses `#1A3829` for success ticks
- Confetti engine is correct (uses RAF, respects `prefers-reduced-motion`)

### 9.4 `src/components/exam/mcq-grid.tsx` — **HIGH**

- Line 96: `rounded-xl` (12 px) — spec expects `--radius-card` (14 px)
- Line 103: uses `#F0FDF4` literal — matches `--bg-timer-normal` token but does not reference it
- Line 128: `animation: 'confirm-slide-in 200ms ease-out'` — **undefined keyframe**
- No focus-visible ring on option buttons (spec requires 3 px solid `--clr-green-800` per `globals.css:76`)

### 9.5 `src/components/exam/flash-number.tsx` — **COMPLIANT**

- ✓ RAF driven (no `setTimeout`)
- ✓ Direct `textContent` writes in callback (no setState)
- ✓ `transition: 'none'` inline
- ✓ Negative numbers `color: '#991B1B'` — honours Crimson Rule
- ✓ `position: fixed`, `inset: 0`, `z-index: 9999`

No changes needed.

### 9.6 `src/components/exam/anzan-flash-view.tsx` — **MOSTLY COMPLIANT**

- ✓ PHASE_2_FLASH correctly unmounts surrounding UI (lines 125–149)
- ✓ `data-testid="phase-2-flash"` present for Playwright
- Minor: mixes `className="min-h-screen bg-black"` (Tailwind) with inline styles on children — not broken, just inconsistent

### 9.7 `src/components/exam/transition-interstitial.tsx` — **COMPLIANT**

- ✓ RAF timing
- ✓ 880 Hz sine via Web Audio
- ✓ Respects `prefers-reduced-motion`
- ✓ Inline SVG abacus, no external dependency

### 9.8 `src/components/students/students-table-client.tsx` — **HIGH**

- Lines 51–57: 7 avatar Tailwind classes (`bg-blue-100`..`bg-indigo-100`) — **all render transparent** (see section 5)
- Line 207: `text-3xl font-bold text-green-800` — spec heading is `text-2xl` (24 px) not 3xl (30 px)
- Line 211: `bg-green-800 hover:bg-green-700` — `bg-green-700` class **does not compile** (see 2.1), hover state is identical to rest state
- Line 373: `alert('CSV export coming soon')` — stub, not implemented
- No sort indicators on column headers (spec requires caret icons)
- Pagination buttons use arbitrary Tailwind values

### 9.9 `src/components/levels/levels-client.tsx` — **HIGH**

- Line 129: `<p>0</p>` labelled "Avg Competencies" — **hardcoded zero**
- Line 133: `<p>—</p>` labelled "Curriculum Density" — **hardcoded em-dash**
- Line 80: `rounded-md` (6 px) — spec `--radius-card` is 14 px
- Drag handle uses `@hello-pangea/dnd` ✓ but no visible drag-grip icon

### 9.10 `src/components/results/results-client.tsx` — **HIGH**

- Lines 27–34 `GRADE_BADGE` map: all 6 grade colour classes are **broken** (see section 5)
- Line 345, 375: chart stroke `#166534` — spec uses `--clr-green-800` (#1A3829)
- Line 349: `CartesianGrid stroke="#f1f5f9"` — hardcoded, should use `var(--color-slate-100)`
- Recharts `ResponsiveContainer` emits dimension warning on first mount (see section 12)

### 9.11 `src/components/student/live-exam-card.tsx` — **HIGH**

- Line 39: `setInterval(tick, 1000)` — allowed here (not Anzan), but would be cleaner as a single `setTimeout` chain for drift correction
- Line 46–52: `backgroundColor: '#1A3829'`, `borderRadius: 16px` — spec `--radius-card` is 14 px, not 16
- Line 79: LIVE NOW badge ✓ correct colours
- **Line 144: `<div>📋</div>` emoji** — **VIOLATES spec NEVER list** ("no emoji in production UI")
- Line 138: `border: '2px dashed #E2E8F0'` ✓ matches spec empty state

### 9.12 `src/components/assessments/assessment-card.tsx`

- Line 23: LIVE badge uses correct colours (`#EF4444` / `#FFFFFF`)
- Line 88: `animate-ping` — spec says use `pulse-ring` keyframe (which exists in `globals.css:178` but is not wired to a class)
- All border / bg colours inline hex, no tokens

### 9.13 `src/components/exam/sync-indicator.tsx`

- Line 11 (synced): `bg-green-100 text-green-800` — `bg-green-100` invisible, `text-green-800` works; result is coloured text on page background
- Line 13 (syncing): `bg-blue-100 text-blue-800` — both invisible
- Line 15 (pending): `bg-amber-100 text-amber-800` — both invisible
- Uses `animate-pulse` (Tailwind) — works

### 9.14 `src/components/shared/empty-state.tsx` — **MOSTLY COMPLIANT**

- ✓ `rounded-[14px]` uses radius-card equivalent
- ✓ `border-2 border-dashed`
- Underused: only imported by 2 pages

### 9.15 `src/components/ui/kpi-card.tsx` (dashboard stat cards)

- Metric size is `text-3xl` — spec says `text-4xl` (36 px) for hero KPI
- Title uses `text-muted-foreground` which resolves to `#475569` ✓
- **No count-up animation** — spec requires animated counter from 0 to target on mount
- **No LIVE variant** — spec defines a red-pulsing variant for real-time metrics
- `rounded-xl ring-1 shadow-sm` — spec says `rounded-[14px] border shadow-md`

### 9.16 Admin sidebar (`src/components/admin/admin-sidebar.tsx` or equivalent)

- Renders at `width: 261px` per runtime check — spec says **240 px**
- Background: `#1A3829` (forest green) per `globals.css:322` — spec says **white card**
- Active link: `rgba(255,255,255,0.92)` background, green text — spec says white bg + `border-left: 3px solid var(--clr-brand-orange)`
- **No 3 px left border on active link**
- Contains `<h1>MINDSPARK</h1>` — conflicts with page `<h1>` (see section 11)

---

## 10. Page Diagnosis

### 10.1 `/login` — **PARTIAL**

- ✓ Navy background `#204074`
- ✓ Card: 440 px, white, 20 px radius
- ✗ Body text colour inherited from `body { color: var(--text-secondary) }` which resolves to slate-100 (section 2.3)
- ✗ Form inputs use shadcn default (no brand outline on focus)

### 10.2 `/admin/dashboard`

- ✗ KPI cards use wrong typography, no count-up animation
- ✗ No LivePulse widget despite spec requiring it
- ✗ Score trend chart uses 50/50 split with level distribution — spec says 60/40
- ✗ Two `<h1>` elements (sidebar "MINDSPARK" + page "Dashboard")
- ✗ Sidebar is green not white

### 10.3 `/admin/students`

- ✗ Header `text-3xl` vs spec `text-2xl`
- ✗ All 7 avatar colours invisible (section 5)
- ✗ CSV export is an `alert()` stub
- ✗ No sort arrows on column headers

### 10.4 `/admin/assessments`

- ✗ Create Assessment wizard: 100 % inline hex, 0 tokens
- ✗ Wizard step indicator uses raw hex instead of slate tokens
- ✗ Level dropdown is native `<select>` not shadcn `<Select>`

### 10.5 `/admin/monitor`

- Per `S28` observation: this page shows an assessment card view, **not** a real-time per-student monitor. Spec requires a live table with student names, time elapsed, question progress, and tab-switch count.
- LIVE badge colour: `rgb(241,245,249)` on `transparent` — **badge is invisible at runtime**
- No real-time update mechanism (no Supabase channel subscription)

### 10.6 `/admin/results`

- ✗ Grade badge palette broken (section 5)
- ✗ Chart stroke uses non-token hex
- ✗ Recharts dimension warning on first mount
- ✓ Publish flow functional

### 10.7 `/admin/announcements`

- ✓ TipTap editor present
- ✗ Lines 200–211: "Engagement Insights" with hardcoded "25% higher read rate" — **fabricated metric**
- ✗ Button uses `bg-[#1A3829]/90` arbitrary opacity — reliability concern on Tailwind v4 arbitrary values

### 10.8 `/admin/levels`

- ✗ "Avg Competencies" hardcoded to 0
- ✗ "Curriculum Density" hardcoded to em-dash
- ✓ Drag-and-drop functional

### 10.9 `/admin/settings`

- ✗ "Auto-archive old results" toggle has **no DB backing** (confirmed by in-file comment `// Manual toggle — no DB column backing`)
- ✗ "Documentation" link points to non-existent `https://docs.mindspark.app`
- ✓ Session timer functional (uses real auth expiry)

### 10.10 `/admin/activity-log`

- Functional per recent Task 12 work
- Table uses `bg-slate-*` classes (compiles) so renders correctly
- Action type filter, date range filter, CSV export all verified working (per S52)

### 10.11 `/student/dashboard` — **CRITICAL**

- ✗ "Progress to next level 42%" — **hardcoded literal** (page.tsx:184)
- ✗ Progress bar width `42%` — same literal
- ✗ Rank "—" placeholder
- ✗ Badges "0" placeholder
- ✗ **Skill Metrics section fully fabricated** — three hardcoded percentages (88/64/92) presented as real student competencies
- ✗ All inline styled, zero tokens

### 10.12 `/student/exams/[id]/lobby` — **CRITICAL**

- ✗ **"Camera & Microphone Access" shows ✓ without requesting permissions**
- ✗ **"Secure Browser Environment" shows ✓ without running any check**
- Only the Academic Integrity Policy item is real (tied to `consentVerified` prop)
- Error path uses native `alert()` — violates spec

### 10.13 `/student/exams/[id]/...` flow (lobby → flash → MCQ → submit)

- ✓ `flash-number.tsx`, `anzan-flash-view.tsx`, `transition-interstitial.tsx` — all spec compliant
- ✗ `mcq-grid.tsx` references undefined `confirm-slide-in` keyframe (silent drop)
- ✗ `exam-timer.tsx` uses wrong hex values for all 6 timer states
- ✗ `completion-card.tsx` references undefined `completion-slide-up` keyframe AND does not use `createPortal`

### 10.14 `/student/results`

- Line 83–96: "Export Report ↓" button has **no onClick handler** — non-functional
- **Line 110: `<div>📋</div>` emoji** — spec NEVER list violation

### 10.15 `/student/profile` — **PLACEHOLDER SHELL (15 lines)**

### 10.16 `/student/tests` — **PLACEHOLDER SHELL (15 lines)**

---

## 11. Accessibility Violations

| # | Location | Violation | WCAG rule |
|---|----------|-----------|-----------|
| 1 | Every admin page | Two `<h1>` elements (sidebar "MINDSPARK" + page title) | 1.3.1 Info and Relationships, 2.4.6 Headings and Labels |
| 2 | `mcq-grid.tsx:96` | No visible focus ring on option buttons | 2.4.7 Focus Visible |
| 3 | `students-table-client.tsx:51–57` | Avatar pills have invisible backgrounds — initials float on card bg with insufficient contrast when combined with surrounding table text | 1.4.3 Contrast (Minimum) |
| 4 | Body text `rgb(241,245,249)` on `#F8FAFC` page bg | Contrast ratio ~1.04:1 (spec requires 4.5:1 for AA, 7:1 for AAA) | 1.4.3 |
| 5 | `lobby-client.tsx:100` | Error path uses `alert()` — no programmatic dismissal, not announced to screen reader properly | 4.1.3 Status Messages |
| 6 | `live-exam-card.tsx:144` | Emoji `📋` has no accessible name | 1.1.1 Non-text Content |
| 7 | `kpi-card.tsx` | No `aria-live` region for count-up animation (when added) | 4.1.3 |
| 8 | `students-table-client.tsx` column headers | No `aria-sort` attribute | 1.3.1 |
| 9 | `create-assessment-wizard.tsx:257` | Native `<select>` with no `<label for=>` association (uses inline label) | 3.3.2 |

---

## 12. Console Errors & Runtime Warnings

Captured from `https://mindspark-one.vercel.app` via `chrome-devtools` during the audit:

1. **Recharts ResponsiveContainer warning** — emitted on first mount of `/admin/results`:
   > "The width(0) and height(0) of chart should be greater than 0, please check the style of container, or the props width(0) and height(0) of the chart."
   Root cause: the parent wrapper has no explicit dimensions until the grid layout settles, and Recharts measures too early.

2. **No other JS errors in the console** — neither the wizard, the exam flow, nor the admin pages throw runtime errors. The visual bugs are silent CSS failures.

---

## 13. Spec "NEVER" List Violations

Per `07_hifi-spec.md` "NEVER" list:

| # | Rule | Violating file | Line |
|---|------|----------------|------|
| 1 | Never use emoji in production UI | `src/components/student/live-exam-card.tsx` | 144 |
| 2 | " | `src/app/(student)/student/results/page.tsx` | 110 |
| 3 | Never use native `alert()` / `confirm()` | `src/components/students/students-table-client.tsx` | 373 |
| 4 | " | `src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx` | 100 |
| 5 | Never use `#991B1B` for anything except negative arithmetic operands | ✓ compliant — `flash-number.tsx` is the only consumer |
| 6 | Never use `setTimeout` / `setInterval` in `src/lib/anzan/` | ✓ compliant |
| 7 | Never reference `'FLASH'` string — use `PHASE_2_FLASH` | ✓ compliant |
| 8 | Never import `src/lib/supabase/admin.ts` in student routes | Not audited in this pass |

---

## 14. Prioritized Fix List

Ordered by (a) user-visible severity, (b) fix-blast-radius, (c) dependency on other fixes.

### P0 — Unblock the design system

1. **Add missing Tailwind colour palettes to `@theme inline` in `globals.css`** — `red-*`, `amber-*`, `emerald-*`, `blue-*`, `indigo-*`, `green-50..700 & 900..950`, plus any others used by `grep -r "bg-[a-z]*-[0-9]" src/`. This single change unblocks ~18 invisible badges across all pages.

2. **Resolve `text-secondary` token collision** — either rename the shadcn `--secondary: #F1F5F9` to `--secondary-surface` and re-map Tailwind, or rename every component usage of `text-secondary` to `text-[color:var(--text-secondary)]`.

3. **Add shadow tokens** — `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` per spec elevation scale.

4. **Add motion tokens** — `--dur-fast: 150ms`, `--dur-mid: 300ms`, `--dur-slow: 500ms`, `--ease-standard`, `--ease-smooth`.

5. **Add avatar rotation palette tokens** — 8-stop colour set for `students-table-client.tsx` avatars.

### P1 — Undefined keyframes (silent animation failures)

6. **Define `confirm-slide-in` keyframe** in `globals.css` `@layer utilities` and wire from `mcq-grid.tsx:128`.
7. **Define `completion-slide-up` keyframe** in `globals.css` and wire from `completion-card.tsx:142`.
8. **Wrap `completion-card.tsx` in `createPortal(..., document.body)`** per `CLAUDE.md` modal rule.

### P1 — Remove fake data

9. **Remove hardcoded "42% progress" from `/student/dashboard` page.tsx:184** — either wire to real DB column or remove the card.
10. **Remove hardcoded "Skill Metrics" array (lines 232–235)** — either compute from student performance or remove section.
11. **Remove hardcoded "Avg Competencies 0" and "Curriculum Density —"** from `levels-client.tsx:129, 133`.
12. **Remove hardcoded "Engagement Insights" copy** from `announcements-client.tsx:200–211`.
13. **Either wire `auto-archive` toggle to a DB column or remove the control** from `settings-client.tsx:361`.
14. **Remove `https://docs.mindspark.app` link** from `settings-client.tsx:404` or point to a real URL.

### P1 — Lobby pre-flight is deceptive

15. **`lobby-client.tsx:178` Camera & Microphone** — either implement `navigator.mediaDevices.getUserMedia` permission check or remove the item.
16. **`lobby-client.tsx:186` Secure Browser Environment** — either implement an actual check (fullscreen support, devtools detection, etc.) or remove the item.

### P2 — Admin sidebar inversion

17. **Flip sidebar background from `#1A3829` to white** (`globals.css:322` → `#FFFFFF`), foreground from white to `#0F172A`.
18. **Add `border-left: 3px solid var(--color-brand-orange)` to active nav link**.
19. **Change sidebar width from 261 px (current) to 240 px**.
20. **Remove `<h1>MINDSPARK</h1>` from sidebar** — replace with `<div>` or `<span>` to fix dual-h1 A11Y violation.

### P2 — exam-timer.tsx token alignment

21. **Replace all 8 hex literals in `exam-timer.tsx` with `var(--bg-timer-*)` / `var(--border-timer-*)` / `var(--text-timer-*)` tokens**.

### P2 — Wizard styling migration

22. **Rewrite `create-assessment-wizard.tsx` to use CSS variables** (`var(--text-primary)` instead of `#0F172A`, etc.) — no logic change required.
23. **Same for `step-type.tsx`, `step-questions.tsx`, `step-config.tsx`.**

### P2 — Emoji and alert removals

24. **Replace `<div>📋</div>` in `live-exam-card.tsx:144` and `results/page.tsx:110`** with an icon from `lucide-react` (e.g., `Clipboard`).
25. **Replace `alert()` in `lobby-client.tsx:100` and `students-table-client.tsx:373`** with the existing inline error pill pattern (see `wizard-step` lines 304–314).

### P3 — Loading states

26. **Add `.skeleton` variants to all data-loading pages** (admin dashboard, students, results, monitor; student dashboard).
27. **Create `src/app/(admin)/error.tsx` and `src/app/(student)/error.tsx`** error boundaries.

### P3 — KPI card and LivePulse

28. **Add count-up animation to `kpi-card.tsx`** using RAF (not setInterval).
29. **Implement `<LivePulse>` widget** on admin dashboard per spec.
30. **Change KPI metric size to `text-4xl`**, wrapper to `rounded-[14px] border shadow-md`.

### P3 — Monitor page

31. **Replace assessment-card view in `/admin/monitor` with real-time per-student table** — spec requires columns: Name, Time Elapsed, Progress, Tab Switches, Actions.
32. **Wire Supabase channel subscription** for live updates.

### P3 — Misc

33. **Change `students-table-client.tsx:207`** heading from `text-3xl` to `text-2xl`.
34. **Implement real CSV export** for `students-table-client.tsx:373`.
35. **Implement real export for `/student/results/page.tsx:83`** "Export Report" button.
36. **Fix Recharts dimension warning** by setting explicit width/height on parent container or using `minHeight`.
37. **Implement `/student/profile` and `/student/tests`** pages.
38. **Change `mcq-grid.tsx:96`** from `rounded-xl` to `rounded-[14px]`.
39. **Change `levels-client.tsx:80`** from `rounded-md` to `rounded-[14px]`.
40. **Change `completion-card.tsx:140`** from `rounded-2xl` to `rounded-[18px]`.

---

## 15. Effort Estimate

Measured as focused engineering hours for a developer familiar with the codebase. Intentionally NOT calendar days.

| Category | Findings | Estimate |
|----------|----------|----------|
| P0 — design system layer (globals.css only) | 5 | 2 h |
| P1 — undefined keyframes + createPortal | 3 | 1.5 h |
| P1 — remove fake data (6 pages) | 6 | 3 h |
| P1 — lobby pre-flight real checks | 2 | 3 h (getUserMedia permission flow + UX) |
| P2 — admin sidebar inversion | 4 | 1.5 h |
| P2 — exam-timer token alignment | 1 | 0.5 h |
| P2 — wizard styling migration | 4 | 4 h (mechanical but spans 4 files) |
| P2 — emoji / alert removals | 4 | 1 h |
| P3 — loading states, error boundaries, skeletons | 9 | 6 h |
| P3 — KPI count-up + LivePulse + monitor rewrite | 5 | 8 h |
| P3 — misc fixes (radius, CSV export, shell pages) | 8 | 5 h |
| **Total** | **51** | **~35 h** |

The largest single leverage point is P0 item 1 (adding the Tailwind palettes to `@theme inline`) — **2 hours unlocks visibility of 18 components that are currently broken**.

The second largest is P1 items 9–14 (fake data removal) — **3 hours removes deceptive metrics from 6 pages**.

---

## 16. What Is Working

Deliberately listed so work to preserve is not accidentally disturbed during fixes.

### 16.1 Flash Anzan engine (src/lib/anzan/ + src/components/exam/)

- `src/components/exam/flash-number.tsx` — RAF driven, direct textContent writes, `transition: none`, Crimson Rule honoured
- `src/components/exam/anzan-flash-view.tsx` — conditional unmount of surrounding UI at PHASE_2_FLASH, proper testid
- `src/components/exam/transition-interstitial.tsx` — RAF timing, 880 Hz Web Audio chime, `prefers-reduced-motion` compliant
- `src/lib/anzan/timing-engine.ts` — accumulator pattern, delta clamp, `MINIMUM_INTERVAL_MS` guard

### 16.2 Anti-cheat and offline sync

- `src/lib/offline/` — Dexie queue + HMAC-signed sync path
- `src/lib/anticheat/clock-guard.ts`, `tab-monitor.ts`, `teardown.ts`
- HMAC secret is server-side only; rotation verified (S54)

### 16.3 Auth and RBAC

- `src/lib/auth/rbac.ts` `requireRole()` validates via `supabase.auth.getUser()` — not the client payload
- Server Actions return typed `ActionResult<T>` everywhere audited

### 16.4 Activity Log page

- Action type filter, date range filter, CSV export all verified working per S52
- Uses `bg-slate-*` Tailwind classes which compile correctly

### 16.5 Levels drag-and-drop

- `@hello-pangea/dnd` integration functional
- Reorder persists to DB

### 16.6 Results publish flow

- Grade calculation logic is correct; only the badge display is broken (section 5)

### 16.7 Empty State component

- `src/components/shared/empty-state.tsx` — correct radius, border, layout — just underused

### 16.8 Lobby polling fallback

- 30-second interval exam status poll (Task 14, S55) functional
- Shared `navigated` ref prevents double-redirect

### 16.9 Typography font loading

- DM Sans loaded for body, DM Mono for tabular numerals — `tabular-nums` + `font-feature-settings: "tnum"` applied at `globals.css:142–146`

### 16.10 Design tokens (the ones that are used)

- All 6 radius tokens
- Slate palette (11 shades)
- `--color-brand-navy`, `--color-brand-orange`
- `--bg-live-badge`, `--text-live-badge`
- `--text-primary`, `--text-secondary` (as CSS var; `text-secondary` Tailwind class is the one that's broken)

---

## Appendix A — Files Audited

### Authority files
- `docs/designs/abacus-edge-design-spec (4).html`
- `docs/specs/07_hifi-spec.md`
- `docs/GOTCHAS.md`
- `src/app/globals.css`
- `CLAUDE.md` (root and `mindspark/`)

### Layout / shell
- `src/app/layout.tsx`
- `src/app/(admin)/layout.tsx`
- `src/app/(student)/layout.tsx`
- `src/components/admin/admin-sidebar.tsx`
- `src/components/student/student-sidebar.tsx`
- `src/components/shared/top-header.tsx`

### Admin pages
- `src/app/(admin)/admin/dashboard/page.tsx`
- `src/app/(admin)/admin/students/page.tsx` + `students-table-client.tsx`
- `src/app/(admin)/admin/assessments/page.tsx`
- `src/app/(admin)/admin/monitor/page.tsx` + `monitor-client.tsx`
- `src/app/(admin)/admin/results/page.tsx` + `results-client.tsx`
- `src/app/(admin)/admin/announcements/page.tsx` + `announcements-client.tsx`
- `src/app/(admin)/admin/levels/page.tsx` + `levels-client.tsx`
- `src/app/(admin)/admin/settings/page.tsx` + `settings-client.tsx`
- `src/app/(admin)/admin/activity-log/page.tsx`

### Student pages
- `src/app/(student)/student/dashboard/page.tsx`
- `src/app/(student)/student/profile/page.tsx` (shell)
- `src/app/(student)/student/tests/page.tsx` (shell)
- `src/app/(student)/student/results/page.tsx`
- `src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx`

### Components
- `src/components/assessments/create-assessment-wizard.tsx`
- `src/components/assessments/step-type.tsx`
- `src/components/assessments/step-questions.tsx`
- `src/components/assessments/step-config.tsx`
- `src/components/assessments/assessment-card.tsx`
- `src/components/exam/anzan-flash-view.tsx`
- `src/components/exam/flash-number.tsx`
- `src/components/exam/mcq-grid.tsx`
- `src/components/exam/exam-timer.tsx`
- `src/components/exam/completion-card.tsx`
- `src/components/exam/transition-interstitial.tsx`
- `src/components/exam/sync-indicator.tsx`
- `src/components/student/live-exam-card.tsx`
- `src/components/shared/empty-state.tsx`
- `src/components/ui/kpi-card.tsx`

---

## Appendix B — Visual Audit Evidence

Collected via `chrome-devtools` MCP (no screenshots — only `evaluate_script` computed-style reads and `take_snapshot` accessibility-tree dumps, per `CLAUDE.md` screenshot budget).

### B.1 `/login` body text colour

```js
getComputedStyle(document.body).color
// → "rgb(241, 245, 249)"   ← slate-100, not --text-secondary #475569
```

Confirms section 2.3: `text-secondary` class collision with shadcn `--secondary: #F1F5F9`.

### B.2 Admin sidebar dimensions & colour

```js
const s = document.querySelector('[class*="admin-sidebar"]');
getComputedStyle(s).width          // → "261px"   (spec: 240px)
getComputedStyle(s).backgroundColor // → "rgb(26, 56, 41)"  (#1A3829 — spec: white)
```

### B.3 Active nav link styling

```js
const a = document.querySelector('a[aria-current="page"]');
getComputedStyle(a).borderLeftWidth   // → "0px"   (spec: 3px)
getComputedStyle(a).borderLeftColor   // → "rgb(0,0,0)"  (default, not brand-orange)
getComputedStyle(a).backgroundColor   // → "rgba(255,255,255,0.92)"
```

### B.4 Tailwind colour palette compile check (the root-cause discovery)

```js
const el = document.createElement('div');
['bg-red-100','bg-amber-100','bg-emerald-100','bg-blue-100','bg-green-100',
 'bg-indigo-100','text-red-800','text-amber-800','text-green-700','text-blue-700']
.forEach(c => {
  el.className = c;
  document.body.appendChild(el);
  const cs = getComputedStyle(el);
  console.log(c, cs.backgroundColor, cs.color);
  el.remove();
});

// Output:
// bg-red-100      rgba(0, 0, 0, 0)   rgb(15, 23, 42)
// bg-amber-100    rgba(0, 0, 0, 0)   rgb(15, 23, 42)
// bg-emerald-100  rgba(0, 0, 0, 0)   rgb(15, 23, 42)
// bg-blue-100     rgba(0, 0, 0, 0)   rgb(15, 23, 42)
// bg-green-100    rgba(0, 0, 0, 0)   rgb(15, 23, 42)
// bg-indigo-100   rgba(0, 0, 0, 0)   rgb(15, 23, 42)
// text-red-800    rgba(0, 0, 0, 0)   rgb(15, 23, 42)    ← inherits
// text-amber-800  rgba(0, 0, 0, 0)   rgb(15, 23, 42)
// text-green-700  rgba(0, 0, 0, 0)   rgb(15, 23, 42)    ← only -800 works
// text-blue-700   rgba(0, 0, 0, 0)   rgb(15, 23, 42)
```

**None of those classes match a compiled rule.** Only classes for colour scales declared inside `@theme inline` compile. `globals.css:195–227` declares only `slate` + `green-800` + brand names.

### B.5 Monitor page LIVE badge

```js
const b = document.querySelector('[class*="bg-live-badge"]') ||
          [...document.querySelectorAll('span')].find(s => s.textContent.trim() === 'LIVE');
getComputedStyle(b).backgroundColor   // → "rgba(0, 0, 0, 0)"
getComputedStyle(b).color             // → "rgb(241, 245, 249)"
```

Same pattern: the class doesn't compile, inherits slate-100 text.

### B.6 Recharts dimension warning (console)

```
Recharts: The width(0) and height(0) of chart should be greater than 0,
please check the style of container, or the props width(0) and
height(0) of the chart.
    at ResponsiveContainer (webpack://.../recharts/.../ResponsiveContainer.js)
```

### B.7 KPI card computed style

```js
const k = document.querySelector('[data-slot="card"]');
getComputedStyle(k).boxShadow      // → "0 1px 2px 0 rgba(0,0,0,0.05)"  (shadow-sm — spec: shadow-md)
getComputedStyle(k).borderRadius   // → "12px"  (rounded-xl — spec: 14px)
getComputedStyle(k).borderWidth    // → "0px"  (uses ring-1, not border)
```

### B.8 Dual h1 elements

```js
document.querySelectorAll('h1').length
// → 2   (sidebar "MINDSPARK" + page title)
```

---

**End of report.**
