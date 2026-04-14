# Student Assessment-Taking Flow — Design Spec

**Date:** 2026-04-14
**Scope:** Full redesign of the student exam/test-taking surfaces — the screens a student sees from the moment they click "Start Exam" on the Exams & Tests page through to returning to the dashboard after submission.
**Status:** Approved (visual mockup `student-assessment-v5.html` locked)
**Supersedes:** Ad-hoc flash/MCQ screens in `src/app/(student)/student/assessment/[id]/`

---

## 1. Goals

- A single distraction-free route group `(student-focus)` where sidebar and topbar are hidden so the student cannot accidentally leave the exam.
- Unified 7-screen flow that serves both EXAM and TEST assessments, switching behaviour — not layout — based on the assessment's `type` and settings.
- Deterministic equation rendering in **vertical table format** (approved v5) with crimson negatives, tabular-nums alignment, and no horizontal scrolling for 10-operand sequences.
- Per-question timer and optional confirm-button toggle configurable per assessment at creation time.
- Auto-redirect completion screen that returns the student to the dashboard without further input.
- Continued compliance with the Flash Anzan engine's sacred rules in `src/lib/anzan/` (no `setTimeout`, `PHASE_2_FLASH` phase string, `#991B1B` negatives only).

## 2. Non-goals

- Rewriting the Flash Anzan timing engine. The RAF loop, accumulator, and phase-state machine stay.
- Rewriting the anti-cheat or offline-sync subsystems. Only the UI around them changes.
- Changing the underlying `exam_papers` → `questions` → `submissions` → `student_answers` schema apart from the two new columns called out in §9.
- Announcements, activity log, or profile editing (out of scope for this pass).

---

## 3. New Logic (locked decisions)

These four behaviours are new to the platform and must be wired end-to-end by the implementation plan.

### 3.1 Per-question timer
- Every question has its own countdown in addition to the overall exam timer.
- Configured at assessment creation: `exam_papers.per_question_time_seconds` (int, nullable). If NULL, per-question timer is disabled for that paper.
- When the per-question timer hits 0 the current answer (if any) is auto-submitted and the flow advances. If no option is selected the answer is recorded as NULL.
- Primary visual is the 22px forest-green timer pill in the top strip labelled **This Question**. A smaller slate-grey **Exam** timer sits next to it.
- Last 10 seconds → timer pill pulses once (transform only, no colour flash — colour flash is banned by the flash-engine rules).

### 3.2 Confirm button toggle
- Per-assessment setting: `exam_papers.require_answer_confirmation` (bool, not null, defaults based on type).
- Default ON for EXAM, default OFF for TEST.
- When ON: student selects option → must click **Confirm Answer** → flow advances.
- When OFF: student clicks an option → flow advances immediately after a 120 ms visual acknowledgement (tile stays highlighted for the duration to confirm the click registered).
- Confirm button is not rendered at all when the setting is OFF; there is no greyed-out confirm button. The footer keyboard hint changes from "A B C D select · Enter confirm" to "A B C D to answer".

### 3.3 Hidden sidebar and topbar during assessment
- The assessment route lives in a **new route group** `(student-focus)` parallel to `(student)`. Its `layout.tsx` does **not** render the student sidebar or topbar. Only the exam strip (§5.2) and the MCQ main area appear.
- Browser history is rewritten on entry so the back button triggers the Exit-Exam confirmation flow (not the previous student page).
- Exit button inside the exam strip is the only sanctioned way out mid-exam.

### 3.4 Auto-redirect completion screen
- After successful submission the student sees Screen 7 (Completion).
- A 10-second countdown auto-redirects to `/student/dashboard`.
- Student can press **Back to Dashboard** to skip the countdown.
- Countdown uses RAF-backed interval in the client component (not `setTimeout`), matching the engine rule. See §8.

## 4. Pro suggestions accepted (S1–S9)

All nine were approved by the user.

| # | Suggestion | Applied where |
|---|---|---|
| S1 | Save a per-question `time_spent_ms` on every answer row | `student_answers.time_spent_ms` int (already exists — confirm not null default) |
| S2 | Pause the exam timer during Time's Up and warning modals | §5.5, §5.6 |
| S3 | Prefetch the next question's question body on selection | Implementation note in §8 |
| S4 | Autosave draft answer on every option click, even when confirmation is ON | §8 — offline-queue write fires before confirm click |
| S5 | Keyboard shortcuts: A/B/C/D to select, Enter to confirm, Esc to request exit | §5.3 |
| S6 | Sync pill in exam strip shows offline-queue state (Saved / Syncing / Offline) | §5.2 |
| S7 | Warning modal on tab-visibility loss and clock-skew detection (not session exit) | §5.6 |
| S8 | On submission failure, stay on Completion screen with a retry pill rather than error-bouncing | §5.7 |
| S9 | After final question, Confirm button copy becomes "Submit Exam" (not "Confirm Answer") and uses a dedicated colour treatment | §5.3 |

---

## 5. Screens

Seven screens total. Each is rendered inside the same `(student-focus)` layout. State transitions between them are managed by an `AssessmentController` client component (§8).

### 5.1 Screen 1 — Pre-flash interstitial (TEST only)

**Purpose:** Brief readiness card shown only before the **first** flash question of a TEST assessment. It is not shown before every question — that was a common source of confusion in v1.

- Full-bleed white background. Centred card, max-width 480 px.
- Headline: *"Get ready, Q<n>"*
- 3-second RAF countdown with a circular progress ring (DM Mono, tabular-nums, centred number 3 → 2 → 1).
- No Exit button. No keyboard shortcut to skip. The full 3 seconds are required.
- On completion, transitions to Screen 2 (Flash view).

### 5.2 Screen 2 — Flash view (TEST only)

**Purpose:** The Flash Anzan viewport. Numbers are emitted one at a time by the RAF engine and the student has to add them mentally.

- Governed entirely by `src/lib/anzan/timing-engine.ts`. This spec does **not** change the engine.
- Number rendering: centred, DM Mono, 128px, `tabular-nums`, `transition: none !important`, `will-change: contents` — per sacred rules.
- Negative numbers in `#991B1B` only. No other colour use of that hex.
- Phase string: `PHASE_2_FLASH` (never the bare `'FLASH'`).
- Chrome: minimal 56px top strip identical to Screen 3 (§5.3) **without** the timer cluster — no ticking timer during flash because the engine drives timing. Only the progress label, sync pill, and Exit button are visible.
- No per-question timer tick during flash phase — the per-question timer starts on the MCQ transition, not during the flash itself.

### 5.3 Screen 3 — EXAM MCQ view (vertical table equation)

**Purpose:** An EXAM student sees the full equation on-screen and chooses an answer. This is the screen the v5 mockup is locked to.

Layout top to bottom:

1. **Exam strip (56 px)**
   - Left: question title + `Q <n> / <total>` pill
   - Centre: primary **This Question** timer (22 px, forest green pill) + secondary **Exam** timer (13 px, slate pill)
   - Right: sync status pill (Saved / Syncing / Offline) + Exit button
2. **Equation panel** — white card, border `#E2E8F0`, radius 16
   - Small uppercase label "Question <n>"
   - The table-equation component (see §6)
3. **2×2 option grid** — four tiles, each 92 px tall, letter chip + value
4. **Confirm button** (only if §3.2 is ON) — forest-green pill, 54 px tall
5. **Keyboard hint strip** — bottom-right absolute-positioned kbd hints

**Interaction rules (EXAM path):**
- A/B/C/D keys toggle selection.
- Enter confirms selection when a tile is selected.
- Esc opens the Exit-Exam confirmation dialog.
- On confirm: advance animation (150 ms slide out) → next question fade-in (150 ms).
- On final question: confirm button copy changes to **"Submit Exam"** and uses the darker forest-green treatment (S9).

### 5.4 Screen 4 — TEST MCQ view

**Purpose:** TEST variant of the MCQ step. Identical layout to Screen 3 with two behavioural differences:

- Confirm button toggle default is OFF, so tapping a tile advances after the 120 ms acknowledgement window described in §3.2.
- Equation panel is empty/omitted — the question was seen via the Flash view in Screen 2. The panel area is replaced with a short instruction line: *"Select the correct sum."*
- Remaining chrome (strip, timers, options, keyboard hints) matches Screen 3.

### 5.5 Screen 5 — Time's Up modal

**Purpose:** Overlay shown when either the per-question or overall exam timer hits 0.

- Rendered via `createPortal` to `document.body` so it escapes the parent's stacking context (see CLAUDE.md modal rules).
- Centred card, radius 16, drop shadow.
- Headline **"Time's up."** with a clock icon (lucide-react, not Material Symbols).
- Sub-line explains which timer expired: *"Your time for this question is over."* or *"The exam window has ended."*
- Body pauses the exam timer while the modal is up (S2).
- Single button: **Continue** → submits current answer and advances (question-level) or goes straight to Screen 7 (exam-level).

### 5.6 Screen 6 — Warning modal

**Purpose:** Shown when anti-cheat detects tab-visibility loss or clock skew. Does **not** terminate the session.

- `createPortal` to body, same as Screen 5.
- Non-dismissable until the student clicks **I understand**.
- Pauses the exam timer while visible (S2).
- Body copy:
  - Tab-switch: *"Leaving the exam tab is not allowed. This warning has been recorded."*
  - Clock skew: *"Your device clock has changed unexpectedly. Please do not attempt to modify the clock during an exam."*
- On dismiss: `POST /api/anticheat/warning` with the warning type (already exists, do not change API surface).

### 5.7 Screen 7 — Completion

**Purpose:** End-of-exam landing.

- Centred card max-width 520 px.
- Checkmark icon (lucide-react `CircleCheck`) in forest green.
- Headline **"Exam submitted"**.
- Sub-line shows exam title and submission timestamp.
- **No score** — results are published later by the admin.
- 10-second countdown ring → auto-redirect to `/student/dashboard`.
- Primary button: **Back to Dashboard** (skips the countdown).
- **Failure state (S8):** if the submission POST fails, the card flips to show a retry pill ("Saved offline — will sync when online") instead of the countdown. The countdown does not start until submission confirms.

---

## 6. The equation table component

The visual treatment was locked in `student-assessment-v5.html`. This is the canonical CSS contract. Implement it as a client component `<EquationTable operands={…} size="lg"|"sm" />`.

```css
.table-equation {
  border-collapse: separate;
  border-spacing: 0;
  border: 2px solid var(--clr-green-800);      /* #1A3829 */
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(26, 56, 41, 0.1);
}
.table-equation td {
  padding: 14px 0;
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  border-bottom: 1.5px solid #94A3B8;
  background: #FFFFFF;
  font-weight: 600;
}
.table-equation .op-col {
  width: 40px;
  text-align: right;
  padding-right: 8px;
  color: var(--text-secondary);
  background: #F1F5F9;
  border-right: 1px solid #CBD5E1;
  font-weight: 700;
}
.table-equation .op-col.minus { color: #991B1B; }
.table-equation .num-col {
  text-align: right;
  padding-left: 10px;
  padding-right: 22px;
  color: var(--text-primary);
  min-width: 112px;
}
.table-equation .num-col.negative { color: #991B1B; }
.table-equation .result-row .op-col {
  background: #EFFAF4;
  color: var(--clr-green-800);
  font-size: 1.2em;
  border-top: 2px solid var(--text-primary);
}
.table-equation .result-row .num-col {
  background: #F8FAFC;
  color: #94A3B8;
  border-top: 2px solid var(--text-primary);
}
.table-equation.size-lg td { font-size: 34px; }
.table-equation.size-sm td { font-size: 22px; padding: 10px 0; }
```

**Size heuristic:** use `size-lg` when operand count ≤ 6; use `size-sm` when ≥ 7. Break points based on typical equation-panel viewport of 720 × ~420 px.

**Hardcoded-hex exceptions:** `#991B1B` is the sacred negative-number red and is intentionally inline. All other colours should migrate to tokens during implementation (`var(--clr-green-800)`, `var(--text-secondary)`, etc.).

---

## 7. Route group `(student-focus)`

New layout tree:

```
src/app/
  (student)/
    layout.tsx               ← keeps existing sidebar + topbar
    student/
      dashboard/page.tsx
      exams/page.tsx
      ...
  (student-focus)/
    layout.tsx               ← NO sidebar, NO topbar, no footer
    student/
      assessment/
        [id]/
          page.tsx           ← server component: requireRole('student') + fetch paper
          assessment-client.tsx  ← AssessmentController (§8)
```

- `(student-focus)/layout.tsx` still runs `requireRole('student')` and applies the DM Sans / DM Mono font-face setup, but returns only `{children}` inside a plain `<body>` wrapper.
- Middleware does not need changes — both route groups share the same `/student/*` URL prefix because route groups are invisible to the URL.
- The existing file `src/app/(student)/student/assessment/[id]/assessment-client.tsx` moves to the new group as part of the implementation plan. Its `if (assessmentType === 'TEST') <AnzanFlashView/> else <ExamVerticalView/>` dispatch becomes the entry point of `AssessmentController`.

## 8. Client state machine — `AssessmentController`

Single `'use client'` component that owns the flow. Shape of its state:

```ts
type AssessmentState = {
  phase: 'PRE_FLASH' | 'PHASE_2_FLASH' | 'MCQ' | 'TIME_UP' | 'WARNING' | 'COMPLETE'
  questionIndex: number
  selectedOption: 'A' | 'B' | 'C' | 'D' | null
  isFinalQuestion: boolean
  perQuestionElapsedMs: number
  examElapsedMs: number
  confirmationRequired: boolean  // mirrors exam_papers.require_answer_confirmation
  perQuestionLimitSeconds: number | null
  submitStatus: 'idle' | 'pending' | 'ok' | 'failed'
}
```

Reducers:
- `SELECT_OPTION` — records draft answer, fires Dexie put (autosave, S4)
- `CONFIRM_OR_ADVANCE` — branches on `confirmationRequired`. If ON, only fires on explicit button/Enter; if OFF, fires automatically on SELECT_OPTION after 120 ms.
- `PER_QUESTION_TIMER_EXPIRED` — auto-submits and advances. Sets phase to `TIME_UP` first, then `MCQ` for next.
- `EXAM_TIMER_EXPIRED` — jumps to Screen 7 via `COMPLETE`.
- `WARNING_RAISED` — phase → `WARNING`, pauses both timers (S2).
- `DISMISS_WARNING` — resumes timers, back to `MCQ`.
- `SUBMIT_EXAM` — fires final POST, phase → `COMPLETE` regardless of network result (S8). Retry loop lives in the COMPLETE screen effect, not the controller.

**Timing rules — all RAF-driven, never `setTimeout`:**
- Per-question countdown uses the same accumulator pattern as `src/lib/anzan/timing-engine.ts` but for seconds. Extract a shared `useRafCountdown(durationSec, onExpire)` hook and reuse it for:
  - Per-question timer
  - Exam timer
  - Pre-flash 3-second countdown
  - Completion 10-second auto-redirect
- The 120 ms "TEST tile-advance acknowledgement" (§3.2 OFF path) also uses RAF, not `setTimeout`. A small `useRafDelay(ms, fn)` helper.

**Prefetch (S3):** on `SELECT_OPTION`, fire a `router.prefetch(`/student/assessment/${id}?q=${nextIndex}`)` if we use query-string routing, or warm the Supabase cache for `questions[nextIndex]` if we stay on a single route. Prefer the second option.

---

## 9. Database changes

Two new columns on `exam_papers`. One existing column to verify.

```sql
ALTER TABLE exam_papers
  ADD COLUMN per_question_time_seconds INT NULL
    CHECK (per_question_time_seconds IS NULL OR per_question_time_seconds BETWEEN 5 AND 600);

ALTER TABLE exam_papers
  ADD COLUMN require_answer_confirmation BOOLEAN NOT NULL DEFAULT TRUE;
```

- `per_question_time_seconds` NULL = no per-question timer for this paper.
- `require_answer_confirmation` default TRUE matches existing EXAM behaviour; a separate trigger or app-level default will flip it to FALSE when `type = 'TEST'`. That decision happens inside the Create Assessment Wizard, not at the DB level.

**S1 verification:** `student_answers.time_spent_ms` must exist and be `INT NOT NULL DEFAULT 0`. Confirm in live DB before implementation (per CLAUDE.md DB rules — run a `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student_answers'` first).

**Migration policy:** Per CLAUDE.md, no new migration files. Both columns get applied through the Supabase SQL editor. GOTCHAS.md updated with the new columns.

## 10. Retroactive change to the Create Assessment Wizard spec

The Create Assessment Wizard spec (`2026-04-13-admin-create-assessment-flow-design.md`) must grow two new fields in **Step 3 — Configuration**:

1. **Per-question timer (seconds)**
   - Numeric input, range 5–600, optional.
   - Leaving blank disables the per-question timer for this paper.
   - Help text: *"If set, each question gets its own countdown. When the timer runs out the question auto-submits."*

2. **Require answer confirmation**
   - Switch, defaults ON for EXAM / OFF for TEST.
   - Help text: *"When off, tapping an answer moves the student to the next question immediately. When on, the student must tap Confirm Answer first."*

Both fields write to `exam_papers.per_question_time_seconds` and `exam_papers.require_answer_confirmation` via `src/app/actions/assessments.ts`.

A short note is appended to the wizard spec linking back to this document. The writing-plans step will produce the retroactive edit as the first implementation task.

## 11. Error handling

- **Network failure on submission:** autosaves live in the Dexie offline queue. Screen 7 shows "Saved offline — will sync when online." The existing `/api/submissions/offline-sync` handler drains the queue.
- **Tab visibility loss:** `tab-monitor.ts` already detects; wire it to `WARNING_RAISED` with type `'tab_switch'`.
- **Clock skew:** `clock-guard.ts` already detects; wire it to `WARNING_RAISED` with type `'clock_skew'`.
- **Hard refresh mid-exam:** on rehydration the controller reads the latest draft from Dexie and jumps to the correct `questionIndex`. Existing logic — verify in plan phase.
- **Unauthorized access:** `page.tsx` still calls `requireRole('student')` and 404s if the paper is not PUBLISHED/LIVE or the student is not enrolled.

## 12. Testing

### Unit (Vitest)
- `useRafCountdown` expires within ±1 frame of the expected time under jsdom RAF shim.
- `AssessmentController` reducer transitions for every locked decision in §3.
- `confirmationRequired=false` triggers `CONFIRM_OR_ADVANCE` after 120 ms delay.
- `PER_QUESTION_TIMER_EXPIRED` records a NULL answer when `selectedOption` is null.
- Submission retry after initial failure eventually marks `submitStatus: 'ok'`.

### Integration
- Full EXAM happy path: start → 5 questions → submit → Screen 7 → auto-redirect.
- Full TEST happy path: pre-flash → flash → MCQ → tile-tap advance → submit → Screen 7.
- Warning modal path: tab blur while mid-question → warning → dismiss → timer resumes.
- Time's Up path: per-question timer → Time's Up → Continue → next question.

### E2E (Playwright)
- `test:e2e` covers the existing flash path; extend with:
  - `student-focus-layout.spec.ts` — asserts sidebar and topbar are absent in the `(student-focus)` group
  - `per-question-timer.spec.ts` — verifies auto-submit on timer expiry
  - `confirm-off.spec.ts` — verifies tile-tap advance when `require_answer_confirmation = false`
  - `completion-auto-redirect.spec.ts` — verifies URL transitions to `/student/dashboard` within 12 s of submission

## 13. Open questions for the plan phase

None of these block the spec — they are for the writing-plans step.

1. Should `AssessmentController` live in `src/components/student/assessment/` or stay inside the route folder? Leaning towards the route folder since no other consumer exists.
2. Should `useRafCountdown` move to `src/lib/anzan/` (where RAF logic already lives) or to a generic `src/lib/hooks/`? Leaning `src/lib/anzan/countdown.ts` so all RAF discipline is co-located.
3. How is the enrolment check wired for per-student exam access? Existing query path needs confirmation from the graph.

---

## 14. Approved visual reference

- **Mockup:** `.superpowers/brainstorm/1798-1776124309/content/student-assessment-v5.html`
- **Screens 1 & 2 in mockup:** two table-format preview screens (4 operands + 10 operands) with the tightened spacing — canonical for §5.3, §5.4, and §6.
- **Approved by:** user, 2026-04-14 session.
