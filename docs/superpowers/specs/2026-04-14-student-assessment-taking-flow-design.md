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

Three column adds — two on `exam_papers`, one on `student_answers`. The `student_answers.time_spent_ms` column triggers an 8-file propagation chain detailed in §9.1.

```sql
ALTER TABLE exam_papers
  ADD COLUMN per_question_time_seconds INT NULL
    CHECK (per_question_time_seconds IS NULL OR per_question_time_seconds BETWEEN 5 AND 600);

ALTER TABLE exam_papers
  ADD COLUMN require_answer_confirmation BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE student_answers
  ADD COLUMN time_spent_ms INT NOT NULL DEFAULT 0;
```

- `per_question_time_seconds` NULL = no per-question timer for this paper.
- `require_answer_confirmation` default TRUE matches existing EXAM behaviour; a separate trigger or app-level default will flip it to FALSE when `type = 'TEST'`. That decision happens inside the Create Assessment Wizard, not at the DB level.
- `student_answers.time_spent_ms` defaults to 0 — existing rows pre-date the timing feature and are correct at 0. **No backfill needed.**

**Audit-time correction (Phase 4, 2026-04-14):** the original spec assumed `time_spent_ms` already existed in the live DB and only required verification. The Phase 1 audit confirmed it does NOT exist (`student_answers` columns are `[id, submission_id, question_id, is_correct, created_at, idempotency_key, selected_option, answered_at]`). The column add is now part of this spec.

**Migration policy:** Per CLAUDE.md, no new migration files. All three columns get applied through the Supabase SQL editor. GOTCHAS.md updated with the new columns.

### 9.1 `time_spent_ms` propagation chain

Adding the column to `student_answers` is **not enough** — the value has to flow from the client, through the offline queue, through both the live and the offline server paths, and into the column. The propagation chain has **two flavours**:

- **`time_spent_ms`** — client-originated. Captured by the assessment controller, written by the client into Dexie, sent through every serialization boundary, and finally inserted by both the live actions and the offline RPC. **8 touchpoints.**
- **`is_correct`** — server-computed. NEVER sent by the client (would be a cheating vector). Computed at insert time by the server from `questions.correct_option`. **3 touchpoints.**
- **`answered_at`** — already exists on `student_answers` and is written by the live path, but **not by the RPC** — Phase 5 confirmed the RPC's INSERT clause omits it, so offline answers land with `answered_at = now()` (the column default = the time the RPC ran, NOT the actual answer time). The RPC fix in Task 1.5 must add `answered_at` alongside `time_spent_ms`.

Combined chain (10 file/object touchpoints across the three columns):

| # | Layer | File / object | Change for `time_spent_ms` | Change for `is_correct` | Change for `answered_at` |
|---|---|---|---|---|---|
| 1 | DB | `student_answers` | `ADD COLUMN time_spent_ms INT NOT NULL DEFAULT 0` | column already exists (`boolean DEFAULT false`); no DDL needed | column already exists; no DDL needed |
| 2 | Browser store | `src/lib/offline/indexed-db-store.ts` | Add `time_spent_ms: number` to `PendingAnswer`; bump Dexie schema to v2 | — (server-only) | — (already in PendingAnswer) |
| 3 | Browser sync | `src/lib/offline/sync-engine.ts` | Include `time_spent_ms` in the per-answer payload mapping inside `flushOfflineQueue` | — | — (already mapped) |
| 4 | Browser teardown | `src/lib/anticheat/teardown.ts` | Include `time_spent_ms` in the keepalive POST `answers_snapshot` mapping | — | — (already mapped) |
| 5 | Server validation (offline) | `src/app/api/submissions/offline-sync/route.ts` | Add `time_spent_ms: z.number().int().nonnegative()` to `AnswerSchema` | — | — (already in AnswerSchema) |
| 6 | Server validation (teardown) | `src/app/api/submissions/teardown/route.ts` | Same Zod schema update — Phase 5 verified the route already uses Zod | — | — (already in AnswerSnapshotSchema) |
| 7 | Server actions (live path) | `src/app/actions/assessment-sessions.ts` | Add `time_spent_ms: number` to `SubmitAnswerInput` and `Answer`; write to upsert payload | **`submitAnswer`:** look up `questions.correct_option` for the answered question_id, compute `is_correct = (correct_option === selected_option)`, include in the upsert payload. **`submitExam`:** batch-fetch `correct_option` for all question_ids in the snapshot via a single `IN` query, build a map, compute per answer | already written by both actions; no change |
| 8 | RPC (DB-side) | `validate_and_migrate_offline_submission` | Add `time_spent_ms` from `v_answer_obj->>'time_spent_ms'` to the INSERT clause | Add a join-style subquery: `(v_answer_obj->>'selected_option') = (SELECT correct_option FROM questions WHERE id = (v_answer_obj->>'question_id')::uuid)` | Add `answered_at` from `to_timestamp((v_answer_obj->>'answered_at')::bigint / 1000.0)` |

**Why the chain matters:** the offline queue path passes answers through three serialization boundaries (browser → fetch → Postgres staging table → RPC → final table). If any one of those boundaries drops `time_spent_ms` or `answered_at`, the value silently lands as the column default and we lose the data without any error. **`is_correct` is even worse**: today the column is never written by ANY path, which means `calculate_results` reads the default (`false`) for every row and **every paper currently scores 0%**. Phase 5 of the audit confirmed this end-to-end. The implementation plan must add all the changes in a single task (Task 1.5 below) and validate the full round-trip with an integration test that:

1. Submits an answer via the live path → confirms `is_correct`, `time_spent_ms`, and `answered_at` all land correctly.
2. Submits an answer via the offline path (DevTools → throttle Offline → answer → restore) → confirms the same three columns land correctly via the RPC.
3. Calls `calculate_results` for the test paper → confirms the resulting `submissions.score` matches the manual count of correctly-answered questions.

If the integration test runs and the score is still 0, one of the layers is dropping `is_correct`.

### 9.3.1 The `correct_option = NULL` edge case

The live DB has at least one question with `correct_option = NULL` (verified 2026-04-14: 1 of 4 questions). For these:
- The lookup `(selected_option) = (correct_option)` in the SQL or TypeScript path returns NULL/false depending on language.
- **Recommendation:** treat NULL `correct_option` as "answer key not configured for this question" — `is_correct` lands as `FALSE` (the safe default that does not falsely credit the student), and the admin must fix the data via the wizard before publishing results.
- A separate cleanup task should add `ALTER TABLE questions ALTER COLUMN correct_option SET NOT NULL` after the live data is cleaned up. **Out of scope for Task 1.5** — flagged as Phase 7 follow-up.

### 9.2 `initSession` return shape extension

Today's `initSession` (in `src/app/actions/assessment-sessions.ts`) selects `id, status, duration_minutes, institution_id` from `exam_papers` and returns only `session_id, expires_at, questions`. The assessment-taking flow needs three more fields surfaced:

- `paper.type` — so the controller can route to the pre-flash interstitial for TEST or directly to MCQ for EXAM
- `paper.per_question_time_seconds` — to drive the per-question countdown
- `paper.require_answer_confirmation` — to drive the confirm-button toggle

The plan task that extends `initSession` must update the SELECT clause AND the return type AND every consumer.

### 9.3 Question schema — columnar form is canonical

Phase 4 audit confirmed: the existing `initSession` reads from `questions.option_a/b/c/d`, `questions.correct_option`, `questions.equation_display`, and `questions.flash_sequence`. The JSON columns (`questions.options`, `questions.correct_answer`) are **not** consulted by the live code path.

For this spec, the **columnar form is canonical** for all engine-side reads. The answer-sheet renderer in the results-flow spec (Frame 8 / Frame 9) must also read from the columnar form to stay consistent.

A future cleanup spec should drop the unused JSON columns. **Out of scope here** — flagged as Phase 2 follow-up in the audit doc.

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
