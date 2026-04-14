# Student Assessment-Taking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `src/app/(student)/student/assessment/[id]/` flow with a 7-screen, distraction-free assessment-taking experience that supports per-question timers, optional confirm-button, the v5 vertical-table equation, and an auto-redirect completion screen — while honouring the Flash Anzan engine's RAF-only and `#991B1B`-only rules.

**Architecture:** A new route group `(student-focus)` parallel to `(student)` whose layout omits sidebar and topbar. The route's client boundary is a single `AssessmentController` reducer that owns phase state and dispatches to seven leaf screen components. All countdown timers route through one shared `useRafCountdown` hook so we never reach for `setTimeout`. Two new columns on `exam_papers` (`per_question_time_seconds`, `require_answer_confirmation`) drive the timer and confirm-button behaviour and are surfaced through the existing `initSession` Server Action. The Create Assessment Wizard gets a retroactive Step 3 update so admins can configure the new fields.

**Tech Stack:** Next.js 15 (App Router, route groups), TypeScript, React 19, Supabase (PostgreSQL), Tailwind v4, lucide-react, Vitest + jsdom, Playwright. RAF-driven countdowns; no `setTimeout`/`setInterval` in any anzan or assessment-flow code.

**Source spec:** `docs/superpowers/specs/2026-04-14-student-assessment-taking-flow-design.md`
**Approved visual:** `docs/design-mockups/student-assessment-v5.html`

---

## File Map

### New files
| Path | Responsibility |
|---|---|
| `src/app/(student-focus)/layout.tsx` | Distraction-free layout — DM Sans/Mono fonts, no sidebar, no topbar, calls `requireRole('student')` |
| `src/app/(student-focus)/student/assessment/[id]/page.tsx` | Server Component — auth + `initSession` + props for controller |
| `src/app/(student-focus)/student/assessment/[id]/assessment-controller.tsx` | Client reducer + screen dispatcher (`'use client'`) |
| `src/app/(student-focus)/student/assessment/[id]/screens/pre-flash-screen.tsx` | Screen 1 — 3-second readiness countdown |
| `src/app/(student-focus)/student/assessment/[id]/screens/flash-screen.tsx` | Screen 2 — wraps existing `<AnzanFlashView>` |
| `src/app/(student-focus)/student/assessment/[id]/screens/exam-mcq-screen.tsx` | Screen 3 — exam strip + `<EquationTable>` + options + confirm |
| `src/app/(student-focus)/student/assessment/[id]/screens/test-mcq-screen.tsx` | Screen 4 — same chrome, empty equation panel |
| `src/app/(student-focus)/student/assessment/[id]/screens/time-up-modal.tsx` | Screen 5 — portal modal |
| `src/app/(student-focus)/student/assessment/[id]/screens/warning-modal.tsx` | Screen 6 — portal modal for tab-switch / clock-skew |
| `src/app/(student-focus)/student/assessment/[id]/screens/completion-screen.tsx` | Screen 7 — auto-redirect with retry pill |
| `src/components/exam/equation-table.tsx` | Reusable v5 table-equation component |
| `src/components/exam/exam-strip.tsx` | 56px top strip with timers + sync pill + exit button |
| `src/lib/anzan/use-raf-countdown.ts` | Shared RAF-driven countdown hook |
| `src/lib/anzan/use-raf-delay.ts` | Single-shot RAF delay (replaces `setTimeout`) |
| `src/lib/anzan/use-raf-countdown.test.ts` | Vitest specs for the hook |
| `src/lib/anzan/use-raf-delay.test.ts` | Vitest specs for the delay helper |
| `src/components/exam/equation-table.test.tsx` | Vitest specs for `<EquationTable>` rendering rules |
| `src/app/(student-focus)/student/assessment/[id]/assessment-controller.test.tsx` | Vitest specs for the reducer |
| `tests/e2e/student-focus-layout.spec.ts` | Playwright — sidebar/topbar absent in `(student-focus)` |
| `tests/e2e/per-question-timer.spec.ts` | Playwright — auto-submit on per-question expiry |
| `tests/e2e/confirm-off.spec.ts` | Playwright — tile-tap auto-advance |
| `tests/e2e/completion-auto-redirect.spec.ts` | Playwright — Screen 7 redirect within 12s |
| `db/sql-editor/2026-04-14-assessment-config-columns.sql` | SQL run book — copy/paste into Supabase SQL editor |

### Modified files
| Path | Change |
|---|---|
| `src/app/actions/assessment-sessions.ts` | `initSession` now returns `paper.type`, `per_question_time_seconds`, `require_answer_confirmation` |
| `src/app/(student)/student/assessment/[id]/page.tsx` | DELETE — replaced by the `(student-focus)` route |
| `src/app/(student)/student/assessment/[id]/assessment-client.tsx` | DELETE — superseded by `assessment-controller.tsx` |
| `src/app/actions/assessments.ts` | `createAssessment` / `updateAssessment` accept the two new fields |
| `src/components/admin/assessment-wizard/step-3-config.tsx` (or current Step 3 path — verify in plan) | Add **Per-question timer** input + **Require confirmation** switch |
| `docs/superpowers/specs/2026-04-13-admin-create-assessment-flow-design.md` | Append a "2026-04-14 retroactive update" note pointing at this spec |
| `GOTCHAS.md` | Note the two new `exam_papers` columns and that they were applied via SQL editor |

---

## Sacred-rule guardrails (read before any task)

These are non-negotiable and apply to **every** task:
- **No `setTimeout` / `setInterval`** anywhere in `src/lib/anzan/`, `src/app/(student-focus)/`, or any new screen file. Use `useRafCountdown` / `useRafDelay`.
- **`#991B1B` is the negative-number red** and is allowed inline in `equation-table.tsx`. Nowhere else.
- **Phase string is `PHASE_2_FLASH`** — never the bare string `'FLASH'`.
- **Modals use `createPortal(content, document.body)`** — z-index alone is not enough.
- **Server Actions return `ActionResult<T>`** from `src/lib/types/action-result.ts`.
- **No new Supabase migration files** — DB changes go through the SQL editor and are recorded in `db/sql-editor/`.
- **`npm run tsc` must be 0 errors** before every commit.
- **Visual fidelity protocol:** when a task implements a UI frame from an approved mockup, port the mockup's CSS verbatim into a colocated CSS file (e.g. `./assessment-client.css` next to the component) and use the mockup's class names in JSX (`<div className="exam-strip">`, not `<div className="flex items-center">`). Do **NOT** re-express the mockup as Tailwind utility classes — translation is where drift happens. Do **NOT** substitute shadcn components (`Card`, `Avatar`, `Separator`) for mockup-styled divs. `Button`, `Input`, `Dialog` from shadcn are the sanctioned exceptions. The mockup lives at `docs/design-mockups/student-assessment-v5.html` and every frame number in the tasks below refers to a specific section of that file. The test of correctness is: open the mockup and the dev server side-by-side and confirm they render identically at 100% zoom before marking any task complete.

---

## Task 1: DB columns

**Files:**
- Create: `db/sql-editor/2026-04-14-assessment-config-columns.sql`
- Modify (later, after manual SQL run): `GOTCHAS.md`

> **Phase 4 audit correction (2026-04-14):** The original plan listed only 2 column adds. The Phase 1 audit confirmed `student_answers.time_spent_ms` does NOT exist — the original "verify" step was wrong. This task now adds **three** columns total. The propagation chain that wires `time_spent_ms` end-to-end lives in Task 1.5 (new, immediately after this task).

- [ ] **Step 1.1: Verify current schema for all three columns**

Before writing any SQL, confirm what's already there. Run this in the Supabase SQL editor and paste the result into the task notes:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exam_papers'
  AND column_name IN ('per_question_time_seconds', 'require_answer_confirmation');

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'student_answers' AND column_name = 'time_spent_ms';
```

Expected: **zero rows for both queries.** If any column already exists, stop and update the spec instead of re-adding.

- [ ] **Step 1.2: Write the SQL run book**

Create `db/sql-editor/2026-04-14-assessment-config-columns.sql`:

```sql
-- Run via Supabase SQL editor on project ahrnkwuqlhmwenhvnupb.
-- Spec: docs/superpowers/specs/2026-04-14-student-assessment-taking-flow-design.md
-- Date: 2026-04-14

-- ─── exam_papers: per-question timer + confirm-button toggle ──────────────
ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS per_question_time_seconds INT NULL
    CHECK (per_question_time_seconds IS NULL OR per_question_time_seconds BETWEEN 5 AND 600);

ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS require_answer_confirmation BOOLEAN NOT NULL DEFAULT TRUE;

-- ─── student_answers: per-question elapsed-time capture ───────────────────
-- Defaults to 0 for existing rows (they pre-date the timing feature).
-- No backfill required.
ALTER TABLE student_answers
  ADD COLUMN IF NOT EXISTS time_spent_ms INT NOT NULL DEFAULT 0;

-- ─── Verification ─────────────────────────────────────────────────────────
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exam_papers'
  AND column_name IN ('per_question_time_seconds', 'require_answer_confirmation')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'student_answers' AND column_name = 'time_spent_ms';
```

- [ ] **Step 1.3: Run the SQL in the Supabase editor**

Open the Supabase dashboard for project `ahrnkwuqlhmwenhvnupb` → SQL editor → paste the file → Run.

Expected verification output:

```
per_question_time_seconds   | integer | YES | NULL
require_answer_confirmation | boolean | NO  | true
time_spent_ms               | integer | NO  | 0
```

If any of the three rows is missing, stop and investigate before continuing.

- [ ] **Step 1.4: Document the new columns in GOTCHAS.md**

Append under the database section:

```
- 2026-04-14: exam_papers.per_question_time_seconds (int, nullable, CHECK 5..600) and
  exam_papers.require_answer_confirmation (bool, not null, default TRUE) added via
  SQL editor (no migration file).
- 2026-04-14: student_answers.time_spent_ms (int, NOT NULL DEFAULT 0) added via SQL
  editor. The Phase 1 audit revealed the original spec wrongly assumed this column
  already existed — it did not. The full client-to-DB propagation chain for this
  field is implemented in Task 1.5 of the assessment-taking plan.
- See db/sql-editor/2026-04-14-assessment-config-columns.sql.
```

- [ ] **Step 1.5: Commit**

```bash
git add db/sql-editor/2026-04-14-assessment-config-columns.sql GOTCHAS.md
git commit -m "db(assessment-engine): add per_question_time_seconds, require_answer_confirmation, time_spent_ms"
```

---

## Task 1.5: `time_spent_ms` + `is_correct` + `answered_at` propagation chain

**Files:**
- Modify: `src/lib/offline/indexed-db-store.ts`
- Modify: `src/lib/offline/sync-engine.ts`
- Modify: `src/lib/anticheat/teardown.ts`
- Modify: `src/app/api/submissions/offline-sync/route.ts`
- Modify: `src/app/api/submissions/teardown/route.ts` *(verified by Phase 5 — already uses Zod)*
- Modify: `src/app/actions/assessment-sessions.ts`
- Modify: the `validate_and_migrate_offline_submission` Postgres function (via SQL editor)
- Create: `db/sql-editor/2026-04-14-rpc-validate-offline-submission-update.sql`

> **Why this task exists (originally and after Phase 5 expansion):** Adding the `student_answers.time_spent_ms` column in Task 1 is necessary but not sufficient. The value flows from the browser RAF loop through three serialization boundaries (client store → fetch body → Postgres staging payload → RPC → final table). If any layer drops the field, the value silently lands as 0 and we lose the timing data with no error.
>
> **Phase 5 audit expansion (2026-04-14):** Phase 5 also confirmed two additional column gaps that this task must fix in lockstep:
>
> 1. **`student_answers.is_correct` is NEVER written.** `submitAnswer`, `submitExam`, and the offline RPC all skip it. `calculate_results` reads it. Result: every paper currently scores 0%. **This is the highest-priority fix in the entire assessment-taking plan.**
> 2. **`student_answers.answered_at` is dropped by the offline RPC.** The column exists and the live actions write it correctly, but the RPC's INSERT clause omits it, so offline answers land with `answered_at = NOW()` (the moment the RPC ran, NOT the actual answer time).
>
> All three columns must be patched in the same commit so the chain is never half-deployed.

> **Two-flavour chain:**
> - **`time_spent_ms` is client-originated** — touches all 8 layers (browser store, sync engine, teardown, both Zod schemas, both server actions, RPC).
> - **`is_correct` is server-computed** — touches only 3 layers (`submitAnswer`, `submitExam`, RPC). NEVER sent by the client (would be a cheating vector).
> - **`answered_at`** — already in the live actions; only the RPC needs the fix.

> **Sacred-rule reminder:** all changes must land in a single commit so the chain is never half-deployed.

- [ ] **Step 1.5.1: Browser store — `PendingAnswer` interface + Dexie schema bump**

Modify `src/lib/offline/indexed-db-store.ts`:

```diff
 export interface PendingAnswer {
   idempotency_key: string;
   session_id: string;
   question_id: string;
   selected_option: 'A' | 'B' | 'C' | 'D' | null;
   answered_at: number;
+  time_spent_ms: number;
   synced: boolean;
   created_at: number;
 }
```

Bump the Dexie schema to v2 — adding a non-indexed field does not require a new index, but the version number must increase to trigger Dexie's automatic schema migration:

```diff
 export class MindsparkOfflineDatabase extends Dexie {
   pendingAnswers!: EntityTable<PendingAnswer, 'idempotency_key'>;

   constructor() {
     super('mindspark_exam');

     this.version(1).stores({
       pendingAnswers: 'idempotency_key, session_id, synced'
     });
+
+    // v2 — added `time_spent_ms` to PendingAnswer (Phase 4, 2026-04-14).
+    // Schema string is unchanged because the new field is not indexed,
+    // but the version bump is required to migrate existing user databases.
+    this.version(2).stores({
+      pendingAnswers: 'idempotency_key, session_id, synced'
+    });
   }
 }
```

- [ ] **Step 1.5.2: Browser sync — include `time_spent_ms` in the offline-sync payload**

Modify `src/lib/offline/sync-engine.ts`. Find the payload builder around line 60 (`payload = { session_id, answers: answers.map(...) }`) and add the field:

```diff
       const payload = {
         session_id:      sessionId,
         answers:         answers.map((a: PendingAnswer) => ({
           question_id:     a.question_id,
           selected_option: a.selected_option,
           answered_at:     a.answered_at,
+          time_spent_ms:   a.time_spent_ms,
           idempotency_key: a.idempotency_key,
         })),
         batch_timestamp: Date.now(),
       };
```

- [ ] **Step 1.5.3: Browser teardown — include `time_spent_ms` in the keepalive POST**

Modify `src/lib/anticheat/teardown.ts`. Find the `answers_snapshot` builder inside `handlePageHide` and add the field:

```diff
       body: JSON.stringify({
         session_id: sessionId,
         answers_snapshot: pendingAnswers.map((a) => ({
           question_id: a.question_id,
           selected_option: a.selected_option,
           answered_at: a.answered_at,
+          time_spent_ms: a.time_spent_ms,
           idempotency_key: a.idempotency_key,
         })),
         client_timestamp: Date.now(),
       }),
```

- [ ] **Step 1.5.4: Server validation — extend the offline-sync Zod schema**

Modify `src/app/api/submissions/offline-sync/route.ts`. Find `AnswerSchema`:

```diff
 const AnswerSchema = z.object({
   question_id: z.string().uuid(),
   selected_option: z.enum(['A', 'B', 'C', 'D']).nullable(),
   answered_at: z.number(),
+  time_spent_ms: z.number().int().nonnegative(),
   idempotency_key: z.string().uuid(),
 });
```

The route handler will then pass the full validated `answers` array (now including `time_spent_ms`) into the staging payload — no other change to the route handler needed because the staging payload is JSON.

- [ ] **Step 1.5.5: Server validation — extend the teardown Zod schema**

Modify `src/app/api/submissions/teardown/route.ts`. The exact location depends on the file's current shape — find the equivalent answer schema and add the same field:

```diff
 const AnswerSnapshotSchema = z.object({
   question_id: z.string().uuid(),
   selected_option: z.enum(['A', 'B', 'C', 'D']).nullable(),
   answered_at: z.number(),
+  time_spent_ms: z.number().int().nonnegative(),
   idempotency_key: z.string().uuid(),
 });
```

If the teardown route does not currently use Zod, mirror the schema from `offline-sync/route.ts` and add the validation. **Do not let the teardown path silently drop validation** — it's the most fragile part of the chain because it fires on `pagehide`.

- [ ] **Step 1.5.6: Live-path server actions — accept `time_spent_ms` and compute `is_correct`**

> **Phase 5 audit expansion (2026-04-14):** This step originally only added `time_spent_ms`. Phase 5 confirmed `student_answers.is_correct` is **never written** by ANY code path — `submitAnswer`, `submitExam`, and the offline RPC all skip it. `calculate_results` reads it, so **every paper currently scores 0%**. This step now also computes `is_correct` server-side at insert time. `is_correct` is **never sent by the client** — that would be a cheating vector.

Modify `src/app/actions/assessment-sessions.ts`. Two interface additions and two upsert payload changes, plus a `correct_option` lookup in each action body.

#### Interface changes

```diff
 interface SubmitAnswerInput {
   session_id:      string;
   question_id:     string;
   selected_option: 'A' | 'B' | 'C' | 'D' | null;
   answered_at:     number;
+  time_spent_ms:   number;
   idempotency_key: string;
 }
```

```diff
 interface Answer {
   question_id:      string;
   selected_option:  'A' | 'B' | 'C' | 'D' | null;
   answered_at:      number;
+  time_spent_ms:    number;
   idempotency_key:  string;
 }
```

**Note:** `is_correct` is **NOT** added to either interface. The client never sends it.

#### `submitAnswer` body — fetch `correct_option`, compute `is_correct`, write to upsert

Replace the current upsert call (around line 145 of the existing file) with this expanded version:

```diff
+  // Look up the correct answer for this question.
+  // Server-authoritative — never trust a client-supplied is_correct value.
+  const { data: questionRow } = await adminSupabase
+    .from('questions')
+    .select('correct_option')
+    .eq('id', input.question_id)
+    .maybeSingle();
+
+  // questions.correct_option may be NULL for questions whose answer key is not
+  // configured yet — in that case is_correct lands as FALSE (the safe default
+  // that does not falsely credit the student). The admin must fix the question
+  // via the wizard before publishing results. See spec §9.3.1.
+  const isCorrect =
+    questionRow?.correct_option != null &&
+    input.selected_option != null &&
+    questionRow.correct_option === input.selected_option;
+
   await adminSupabase.from('student_answers').upsert({
     idempotency_key: input.idempotency_key,
     submission_id:   submissionId,
     question_id:     input.question_id,
     selected_option: input.selected_option,
     answered_at:     new Date(input.answered_at).toISOString(),
+    time_spent_ms:   input.time_spent_ms,
+    is_correct:      isCorrect,
   }, { onConflict: 'idempotency_key' });
```

#### `submitExam` body — batch-fetch `correct_option` for all snapshot questions, compute per answer

`submitExam` receives `final_answers_snapshot: Answer[]` — potentially 10–50 answers in one call. Doing one `.select` per answer is wasteful. Batch it:

```diff
   if (input.final_answers_snapshot && input.final_answers_snapshot.length > 0) {
     const submissionRowId = sub?.id ?? input.session_id;
+
+    // Batch-fetch the correct_option for every question in the snapshot.
+    // Single round trip regardless of snapshot size.
+    const questionIds = input.final_answers_snapshot.map(a => a.question_id);
+    const { data: questionRows } = await adminSupabase
+      .from('questions')
+      .select('id, correct_option')
+      .in('id', questionIds);
+
+    const correctOptionByQuestionId = new Map<string, string | null>(
+      (questionRows ?? []).map(q => [q.id, q.correct_option ?? null])
+    );
+
     const payloads = input.final_answers_snapshot.map(a => ({
       idempotency_key: a.idempotency_key,
       submission_id:   submissionRowId,
       question_id:     a.question_id,
       selected_option: a.selected_option,
       answered_at:     new Date(a.answered_at).toISOString(),
+      time_spent_ms:   a.time_spent_ms,
+      is_correct:
+        a.selected_option != null &&
+        correctOptionByQuestionId.get(a.question_id) != null &&
+        correctOptionByQuestionId.get(a.question_id) === a.selected_option,
     }));
     await adminSupabase.from('student_answers').upsert(payloads, { onConflict: 'idempotency_key' });
   }
```

#### Post-write: cascade re-grade

Because the live path now writes `is_correct` at submit time, the `calculate_results` RPC will read the correct values immediately. **No additional call is needed** in `submitAnswer`/`submitExam` — the existing flow that calls `calculate_results` on result publication will compute correct scores.

- [ ] **Step 1.5.7: RPC — update `validate_and_migrate_offline_submission`**

> **Phase 5 audit correction (2026-04-14):** The original draft of this step had the wrong assumed RPC structure. Phase 5 read the actual RPC body via `pg_get_functiondef` and confirmed:
> - The current INSERT writes only `submission_id, question_id, selected_option, idempotency_key` — **NOT** `answered_at`.
> - The conflict clause is `ON CONFLICT ON CONSTRAINT student_answers_submission_id_question_id_key DO NOTHING` — **NOT** on `idempotency_key`.
> - The function uses a procedural `FOR ... LOOP` with per-row `BEGIN ... EXCEPTION` blocks — **NOT** a single set-based INSERT.
>
> The correct target for this step is the actual function body documented below.

#### Verify the current function body (pre-flight)

```sql
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'validate_and_migrate_offline_submission';
```

Expected: a `plpgsql` function with the structure shown in the "Current state" block below. If the structure differs significantly, **stop** and reconcile this step with the actual body before patching — the live function may have been edited since this audit was written.

#### Current state (verified 2026-04-14 via `pg_get_functiondef`)

```sql
-- ABBREVIATED — only the relevant per-answer loop is shown.
-- The header (HMAC verification, staging row lookup, submission lookup) is unchanged.
FOR v_answer_obj IN SELECT * FROM jsonb_array_elements(v_staging_row.payload->'answers')
LOOP
    BEGIN
        INSERT INTO student_answers (
            submission_id,
            question_id,
            selected_option,
            idempotency_key
        ) VALUES (
            v_submission_id,
            (v_answer_obj->>'question_id')::uuid,
            v_answer_obj->>'selected_option',
            (v_answer_obj->>'idempotency_key')::uuid
        )
        ON CONFLICT ON CONSTRAINT student_answers_submission_id_question_id_key DO NOTHING;

        v_written_count := v_written_count + 1;
    EXCEPTION WHEN unique_violation THEN
        NULL;
    END;
END LOOP;
```

#### Target state — add `answered_at`, `time_spent_ms`, and `is_correct`

Replace the per-row INSERT inside the loop with this expanded version. The body of the function before the loop (HMAC check, staging lookup, etc.) **does not change**.

```sql
FOR v_answer_obj IN SELECT * FROM jsonb_array_elements(v_staging_row.payload->'answers')
LOOP
    BEGIN
        INSERT INTO student_answers (
            submission_id,
            question_id,
            selected_option,
            idempotency_key,
            answered_at,
            time_spent_ms,
            is_correct
        ) VALUES (
            v_submission_id,
            (v_answer_obj->>'question_id')::uuid,
            v_answer_obj->>'selected_option',
            (v_answer_obj->>'idempotency_key')::uuid,
            -- Use the client-supplied answered_at (millis since epoch).
            -- COALESCE to NOW() defends against pre-Phase-5 clients still in flight.
            COALESCE(
                to_timestamp((v_answer_obj->>'answered_at')::bigint / 1000.0),
                NOW()
            ),
            -- COALESCE to 0 for pre-Phase-5 clients that send no time_spent_ms.
            COALESCE((v_answer_obj->>'time_spent_ms')::int, 0),
            -- Server-authoritative is_correct: NEVER trust a client-supplied value.
            -- Looks up the canonical correct_option from the questions table.
            -- If correct_option IS NULL (answer key not configured), is_correct lands
            -- as FALSE — the safe default that does not falsely credit the student.
            -- See spec §9.3.1.
            COALESCE(
                (v_answer_obj->>'selected_option') = (
                    SELECT correct_option
                    FROM questions
                    WHERE id = (v_answer_obj->>'question_id')::uuid
                ),
                FALSE
            )
        )
        ON CONFLICT ON CONSTRAINT student_answers_submission_id_question_id_key DO NOTHING;

        v_written_count := v_written_count + 1;
    EXCEPTION WHEN unique_violation THEN
        NULL;
    END;
END LOOP;
```

**Why three COALESCEs:**
1. `answered_at` — pre-Phase-5 clients send `answered_at` already (it's been in the schema since v0), but defensive in case any in-flight client omits it.
2. `time_spent_ms` — pre-Phase-5 clients don't know about this field. The COALESCE drops them to `0`, matching the column default.
3. `is_correct` — if `questions.correct_option IS NULL`, the equality returns NULL (Postgres three-valued logic). The COALESCE forces the result to `FALSE`. Without this, the column would land as NULL and `calculate_results` would skip the row entirely.

#### Save the new function via `CREATE OR REPLACE FUNCTION`

The full updated function (with the unchanged header included) goes into the SQL editor as a single `CREATE OR REPLACE FUNCTION public.validate_and_migrate_offline_submission(...)` statement. Save the full text to `db/sql-editor/2026-04-14-rpc-validate-offline-submission-update.sql` for the audit trail.

#### Verification

```sql
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'validate_and_migrate_offline_submission';
```

Confirm the function body now contains: `answered_at`, `time_spent_ms`, `is_correct`, and the `COALESCE(..., FALSE)` join to `questions.correct_option`.

- [ ] **Step 1.5.8: Validator — full round-trip for `time_spent_ms` AND `is_correct`**

> **Phase 5 audit expansion:** the validator now exercises BOTH new columns and proves the live path AND the offline path. The "every paper scores 0%" bug means a passing test must not just check that the columns are populated — it must check that `calculate_results` produces a non-zero score after the round trip.

#### Pre-flight: confirm the test paper has at least one question with a known correct_option

```sql
SELECT q.id, q.question_text, q.correct_option
FROM questions q
JOIN exam_papers p ON p.id = q.paper_id
WHERE p.status = 'LIVE'
  AND q.deleted_at IS NULL
ORDER BY q.order_index
LIMIT 5;
```

Pick a test paper where every question has a non-NULL `correct_option`. If the only LIVE paper has questions with NULL `correct_option`, you cannot test scoring — fix the data first via the wizard or pick a different paper.

#### Live path test

1. `npm run dev`
2. Sign in as a student, start the test exam.
3. Answer one question with the **correct** option, wait 5 seconds, advance.
4. Answer another with the **wrong** option, wait 3 seconds, advance.
5. Answer a third with the **correct** option (no wait).
6. Submit the exam.
7. In Supabase SQL editor:
   ```sql
   SELECT
     question_id,
     selected_option,
     answered_at,
     time_spent_ms,
     is_correct
   FROM student_answers
   WHERE submission_id = (
     SELECT id FROM submissions
     WHERE student_id = '<student_id>'
     ORDER BY created_at DESC LIMIT 1
   )
   ORDER BY answered_at;
   ```
8. Confirm:
   - **Row 1:** `time_spent_ms` ≈ 5000, `is_correct = true`
   - **Row 2:** `time_spent_ms` ≈ 3000, `is_correct = false`
   - **Row 3:** `time_spent_ms` ≈ 100–500, `is_correct = true`

#### Offline path test

1. Open DevTools → Network → throttle to **Offline**.
2. Start a new exam attempt (or another paper).
3. Answer a question with the correct option.
4. Confirm Dexie has the row with `synced: false`, `time_spent_ms` populated, and `selected_option` set (DevTools → Application → IndexedDB → mindspark_exam → pendingAnswers). **Note:** Dexie does NOT store `is_correct` — that's computed server-side by the RPC.
5. Restore network.
6. Wait ~10 s for the sync engine to flush.
7. Re-run the SQL query and confirm the new row landed with the correct `time_spent_ms` AND `is_correct = true`.

#### End-to-end scoring test (the headline validator)

After both paths land their rows, call `calculate_results` for the test paper:

```sql
SELECT calculate_results('<test_paper_id>'::uuid);

SELECT id, score, percentage, grade, completed_at
FROM submissions
WHERE paper_id = '<test_paper_id>'
ORDER BY created_at DESC
LIMIT 5;
```

Confirm `score > 0` and `percentage > 0` for the test student. **If `score = 0`, the chain is still broken** — re-check Step 1.5.6 (live actions) and Step 1.5.7 (RPC) for missing `is_correct` writes.

#### Failure-mode debugging guide

| Symptom | Likely cause |
|---|---|
| `time_spent_ms = 0` on live path | Step 1.5.6 not applied to `submitAnswer`/`submitExam` upsert payload |
| `time_spent_ms = 0` on offline path only | Step 1.5.7 RPC update not deployed via `CREATE OR REPLACE FUNCTION` |
| `is_correct = false` on EVERY row including the correct ones | The `correct_option` lookup is failing — verify `questions.correct_option` is populated for the test questions |
| `is_correct = NULL` on offline path only | The COALESCE in Step 1.5.7 is missing — Postgres three-valued logic returned NULL |
| `score = 0` despite `is_correct` being correct | `calculate_results` is reading from a different column or filter — re-read its body via `pg_get_functiondef` |

- [ ] **Step 1.5.9: Type-check + lint + tests**

```bash
npm run tsc
npm run lint
npx vitest run src/lib/anzan/ src/lib/anticheat/ src/lib/offline/
```

Expected: 0 errors, 0 warnings, all anzan/anticheat/offline tests pass.

- [ ] **Step 1.5.10: Commit**

```bash
git add src/lib/offline/indexed-db-store.ts \
        src/lib/offline/sync-engine.ts \
        src/lib/anticheat/teardown.ts \
        src/app/api/submissions/offline-sync/route.ts \
        src/app/api/submissions/teardown/route.ts \
        src/app/actions/assessment-sessions.ts \
        db/sql-editor/2026-04-14-rpc-validate-offline-submission-update.sql
git commit -m "feat(assessment-engine): wire time_spent_ms + is_correct + answered_at through full propagation chain"
```

---

## Task 2: Surface the new columns from `initSession`

**Files:**
- Modify: `src/app/actions/assessment-sessions.ts:34-42`

- [ ] **Step 2.1: Read the current select statement**

Open `src/app/actions/assessment-sessions.ts` and find the `paper` query (currently `select('id, status, duration_minutes, institution_id')`). Confirm `paper.type` is **not** in the select today.

- [ ] **Step 2.2: Extend the select**

```ts
const { data: paper, error: paperErr } = await supabase
  .from('exam_papers')
  .select('id, type, status, duration_minutes, institution_id, per_question_time_seconds, require_answer_confirmation')
  .eq('id', input.paper_id)
  .single();
```

- [ ] **Step 2.3: Extend `InitSessionOutput`**

Add the three new fields to the output type at the top of the file:

```ts
export interface InitSessionOutput {
  session_id: string;
  expires_at: string;
  paper_type: 'EXAM' | 'TEST';
  per_question_time_seconds: number | null;
  require_answer_confirmation: boolean;
  questions: QuestionDTO[];
}
```

- [ ] **Step 2.4: Populate the new fields in both return paths**

In **both** the existing-session branch and the new-session branch, return:

```ts
return {
  ok: true,
  data: {
    session_id: ...,
    expires_at: ...,
    paper_type: paper.type as 'EXAM' | 'TEST',
    per_question_time_seconds: paper.per_question_time_seconds,
    require_answer_confirmation: paper.require_answer_confirmation,
    questions: formattedQuestions,
  },
};
```

- [ ] **Step 2.5: Type-check**

```bash
npm run tsc
```
Expected: 0 errors. If consumers of `InitSessionOutput` complain, fix them in this same task — the only consumer is `src/app/(student)/student/assessment/[id]/page.tsx` which we are about to delete in Task 3.

- [ ] **Step 2.6: Commit**

```bash
git add src/app/actions/assessment-sessions.ts
git commit -m "feat(actions): surface paper type + new config fields from initSession"
```

---

## Task 3: Create the `(student-focus)` route group

**Files:**
- Create: `src/app/(student-focus)/layout.tsx`
- Create: `src/app/(student-focus)/student/assessment/[id]/page.tsx`
- Delete: `src/app/(student)/student/assessment/[id]/page.tsx`
- Delete: `src/app/(student)/student/assessment/[id]/assessment-client.tsx`

- [ ] **Step 3.1: Create the focus layout**

Create `src/app/(student-focus)/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/rbac';
import { redirect } from 'next/navigation';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Assessment — Mindspark',
};

/**
 * Distraction-free layout for assessment-taking surfaces.
 * No sidebar, no topbar — only the page itself.
 * `requireRole('student')` is applied here so every page beneath
 * inherits the auth gate.
 */
export default async function StudentFocusLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');
  return <div className="student-focus-root">{children}</div>;
}
```

- [ ] **Step 3.2: Create the new page entry**

Create `src/app/(student-focus)/student/assessment/[id]/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { initSession } from '@/app/actions/assessment-sessions';
import { AssessmentController } from './assessment-controller';

interface Props { params: Promise<{ id: string }> }

export default async function AssessmentPage({ params }: Props) {
  const { id: assessmentId } = await params;
  const result = await initSession({ paper_id: assessmentId });
  if ('error' in result) redirect('/student/dashboard');

  const {
    session_id,
    paper_type,
    per_question_time_seconds,
    require_answer_confirmation,
    questions,
  } = result.data;

  const formatted = questions.map((q, i) => ({
    id: q.question_id,
    equationDisplay: q.equation_display,
    flashSequence: q.flash_sequence,
    seed: q.question_id,
    orderIndex: i,
    options: [
      { key: 'A' as const, label: q.option_a },
      { key: 'B' as const, label: q.option_b },
      { key: 'C' as const, label: q.option_c },
      { key: 'D' as const, label: q.option_d },
    ],
  }));

  return (
    <AssessmentController
      assessmentId={assessmentId}
      sessionId={session_id}
      paperType={paper_type}
      perQuestionTimeSeconds={per_question_time_seconds}
      requireConfirmation={require_answer_confirmation}
      questions={formatted}
    />
  );
}
```

- [ ] **Step 3.3: Delete the old route**

```bash
git rm src/app/(student)/student/assessment/[id]/page.tsx
git rm src/app/(student)/student/assessment/[id]/assessment-client.tsx
```

- [ ] **Step 3.4: Type-check**

```bash
npm run tsc
```
Expected: 0 errors. (`AssessmentController` does not exist yet — temporarily stub it in step 3.5.)

- [ ] **Step 3.5: Stub `AssessmentController`**

Create `src/app/(student-focus)/student/assessment/[id]/assessment-controller.tsx`:

```tsx
'use client';

interface AssessmentControllerProps {
  assessmentId: string;
  sessionId: string;
  paperType: 'EXAM' | 'TEST';
  perQuestionTimeSeconds: number | null;
  requireConfirmation: boolean;
  questions: Array<{
    id: string;
    equationDisplay: string | null;
    flashSequence: number[] | null;
    seed: string;
    orderIndex: number;
    options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
  }>;
}

export function AssessmentController(_props: AssessmentControllerProps) {
  return <div data-testid="assessment-controller-stub">Assessment loading…</div>;
}
```

- [ ] **Step 3.6: Type-check + commit**

```bash
npm run tsc
git add src/app/(student-focus)/
git commit -m "feat(routes): scaffold (student-focus) route group for assessment flow"
```

---

## Task 4: `useRafCountdown` shared hook (TDD)

**Files:**
- Create: `src/lib/anzan/use-raf-countdown.ts`
- Test: `src/lib/anzan/use-raf-countdown.test.ts`

- [ ] **Step 4.1: Write the failing test**

Create `src/lib/anzan/use-raf-countdown.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRafCountdown } from './use-raf-countdown';

describe('useRafCountdown', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let now = 0;

  beforeEach(() => {
    rafCallbacks = [];
    now = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  function tick(deltaMs: number) {
    now += deltaMs;
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb(now));
  }

  it('counts down from durationSec to 0 and fires onExpire exactly once', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useRafCountdown({ durationSec: 2, running: true, onExpire }));
    expect(result.current.remainingMs).toBe(2000);

    act(() => tick(1000));
    expect(result.current.remainingMs).toBe(1000);

    act(() => tick(1000));
    expect(result.current.remainingMs).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);

    // further frames must not re-fire
    act(() => tick(500));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('pauses when running becomes false', () => {
    const onExpire = vi.fn();
    const { result, rerender } = renderHook(
      ({ running }) => useRafCountdown({ durationSec: 5, running, onExpire }),
      { initialProps: { running: true } },
    );
    act(() => tick(1000));
    expect(result.current.remainingMs).toBe(4000);

    rerender({ running: false });
    act(() => tick(2000));
    expect(result.current.remainingMs).toBe(4000); // frozen
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('resets when durationSec changes', () => {
    const onExpire = vi.fn();
    const { result, rerender } = renderHook(
      ({ durationSec }) => useRafCountdown({ durationSec, running: true, onExpire }),
      { initialProps: { durationSec: 3 } },
    );
    act(() => tick(1000));
    expect(result.current.remainingMs).toBe(2000);

    rerender({ durationSec: 10 });
    expect(result.current.remainingMs).toBe(10000);
  });
});
```

- [ ] **Step 4.2: Run the test (must fail)**

```bash
npx vitest run src/lib/anzan/use-raf-countdown.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 4.3: Implement the hook**

Create `src/lib/anzan/use-raf-countdown.ts`:

```ts
'use client';

import { useEffect, useRef, useState } from 'react';

interface Options {
  durationSec: number;
  running: boolean;
  onExpire?: () => void;
}

interface Returned { remainingMs: number }

/**
 * RAF-driven countdown. No setTimeout/setInterval.
 * Accumulator pattern mirrors src/lib/anzan/timing-engine.ts.
 * Delta clamped at 1.5 * frame interval (~25ms) to stay safe under tab-restore spikes.
 */
export function useRafCountdown({ durationSec, running, onExpire }: Options): Returned {
  const [remainingMs, setRemainingMs] = useState(durationSec * 1000);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Reset on duration change
  useEffect(() => {
    setRemainingMs(durationSec * 1000);
    expiredRef.current = false;
    lastFrameRef.current = null;
  }, [durationSec]);

  useEffect(() => {
    if (!running || expiredRef.current) return;

    const step = (frameTime: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = frameTime;
        rafIdRef.current = window.requestAnimationFrame(step);
        return;
      }
      const rawDelta = frameTime - lastFrameRef.current;
      const delta = Math.min(rawDelta, 25); // clamp for tab-restore spikes
      lastFrameRef.current = frameTime;

      setRemainingMs((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return next;
      });

      if (!expiredRef.current) {
        rafIdRef.current = window.requestAnimationFrame(step);
      }
    };

    rafIdRef.current = window.requestAnimationFrame(step);
    return () => {
      if (rafIdRef.current !== null) window.cancelAnimationFrame(rafIdRef.current);
      lastFrameRef.current = null;
    };
  }, [running]);

  return { remainingMs };
}
```

- [ ] **Step 4.4: Run the test (must pass)**

```bash
npx vitest run src/lib/anzan/use-raf-countdown.test.ts
```
Expected: 3 passed.

- [ ] **Step 4.5: Type-check + commit**

```bash
npm run tsc
git add src/lib/anzan/use-raf-countdown.ts src/lib/anzan/use-raf-countdown.test.ts
git commit -m "feat(anzan): useRafCountdown shared hook for assessment timers"
```

---

## Task 5: `useRafDelay` single-shot helper (TDD)

**Files:**
- Create: `src/lib/anzan/use-raf-delay.ts`
- Test: `src/lib/anzan/use-raf-delay.test.ts`

- [ ] **Step 5.1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRafDelay } from './use-raf-delay';

describe('useRafDelay', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let now = 0;
  beforeEach(() => {
    rafCallbacks = []; now = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { rafCallbacks.push(cb); return rafCallbacks.length; });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());
  function tick(ms: number) { now += ms; const cbs = [...rafCallbacks]; rafCallbacks = []; cbs.forEach((cb) => cb(now)); }

  it('fires the callback after the specified delay', () => {
    const fn = vi.fn();
    renderHook(() => useRafDelay(fn, 120, true));
    act(() => tick(60));
    expect(fn).not.toHaveBeenCalled();
    act(() => tick(60));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not fire when armed=false', () => {
    const fn = vi.fn();
    renderHook(() => useRafDelay(fn, 120, false));
    act(() => tick(500));
    expect(fn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 5.2: Run the test (must fail)**

```bash
npx vitest run src/lib/anzan/use-raf-delay.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 5.3: Implement**

Create `src/lib/anzan/use-raf-delay.ts`:

```ts
'use client';

import { useEffect, useRef } from 'react';

/**
 * Fire a callback once after `delayMs` of wall-clock time, RAF-driven.
 * Replaces setTimeout for the 120ms TEST tile-advance acknowledgement
 * and similar single-shot delays in the assessment flow.
 */
export function useRafDelay(fn: () => void, delayMs: number, armed: boolean): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!armed) return;
    let raf: number | null = null;
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      if (t - start >= delayMs) {
        fnRef.current();
        return;
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => {
      if (raf !== null) window.cancelAnimationFrame(raf);
    };
  }, [armed, delayMs]);
}
```

- [ ] **Step 5.4: Run the test (must pass)**

```bash
npx vitest run src/lib/anzan/use-raf-delay.test.ts
```
Expected: 2 passed.

- [ ] **Step 5.5: Commit**

```bash
git add src/lib/anzan/use-raf-delay.ts src/lib/anzan/use-raf-delay.test.ts
git commit -m "feat(anzan): useRafDelay single-shot helper (no setTimeout)"
```

---

## Task 6: `<EquationTable>` component (TDD)

**Files:**
- Create: `src/components/exam/equation-table.tsx`
- Test: `src/components/exam/equation-table.test.tsx`

- [ ] **Step 6.1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EquationTable } from './equation-table';

const operands4 = [892, -456, 124, 75];

describe('EquationTable', () => {
  it('renders one row per operand plus a result row', () => {
    render(<EquationTable operands={operands4} size="lg" />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(operands4.length + 1);
  });

  it('marks negative operand rows with the .negative class', () => {
    const { container } = render(<EquationTable operands={operands4} size="lg" />);
    const negs = container.querySelectorAll('td.num-col.negative');
    expect(negs.length).toBe(1);
    expect(negs[0].textContent).toBe('456');
  });

  it('the first operand row has a non-breaking space in the operator cell', () => {
    const { container } = render(<EquationTable operands={operands4} size="lg" />);
    const firstOp = container.querySelectorAll('td.op-col')[0];
    expect(firstOp.textContent).toBe('\u00A0');
  });

  it('uses size-sm class when size="sm"', () => {
    const { container } = render(<EquationTable operands={operands4} size="sm" />);
    expect(container.querySelector('table.table-equation.size-sm')).not.toBeNull();
  });
});
```

- [ ] **Step 6.2: Run the test (must fail)**

```bash
npx vitest run src/components/exam/equation-table.test.tsx
```
Expected: FAIL — module not found.

- [ ] **Step 6.3: Implement the component**

Create `src/components/exam/equation-table.tsx`:

```tsx
import './equation-table.css';

interface EquationTableProps {
  operands: number[];
  size: 'lg' | 'sm';
}

/**
 * Vertical-table equation renderer for the EXAM MCQ view.
 * Visual contract is locked to docs/design-mockups/student-assessment-v5.html.
 * #991B1B is the sacred negative-number red — do not change.
 */
export function EquationTable({ operands, size }: EquationTableProps) {
  return (
    <table className={`table-equation size-${size}`}>
      <tbody>
        {operands.map((n, i) => {
          const negative = n < 0;
          const op = i === 0 ? '\u00A0' : negative ? '−' : '+';
          const value = Math.abs(n);
          return (
            <tr key={i}>
              <td className={`op-col${negative && i > 0 ? ' minus' : ''}`}>{op}</td>
              <td className={`num-col${negative ? ' negative' : ''}`}>{value}</td>
            </tr>
          );
        })}
        <tr className="result-row">
          <td className="op-col">=</td>
          <td className="num-col">???</td>
        </tr>
      </tbody>
    </table>
  );
}
```

- [ ] **Step 6.4: Add the locked stylesheet**

Create `src/components/exam/equation-table.css` with the v5 contract from spec §6 verbatim:

```css
.table-equation {
  border-collapse: separate;
  border-spacing: 0;
  border: 2px solid var(--clr-green-800);
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
.table-equation tr:last-child td { border-bottom: none; }
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

- [ ] **Step 6.5: Run the test (must pass)**

```bash
npx vitest run src/components/exam/equation-table.test.tsx
```
Expected: 4 passed.

- [ ] **Step 6.6: Commit**

```bash
git add src/components/exam/equation-table.tsx src/components/exam/equation-table.css src/components/exam/equation-table.test.tsx
git commit -m "feat(exam): EquationTable component (v5 visual contract)"
```

---

## Task 7: `<ExamStrip>` chrome component

**Files:**
- Create: `src/components/exam/exam-strip.tsx`
- Create: `src/components/exam/exam-strip.css`

- [ ] **Step 7.1: Implement the strip**

Create `src/components/exam/exam-strip.tsx`:

```tsx
import { X } from 'lucide-react';
import './exam-strip.css';

interface ExamStripProps {
  questionTitle: string;
  questionIndex: number;
  totalQuestions: number;
  perQuestionRemainingMs: number | null;
  examRemainingMs: number;
  syncStatus: 'synced' | 'syncing' | 'offline';
  onExit: () => void;
  showTimers?: boolean;
}

function formatMs(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

const SYNC_LABEL = { synced: 'Saved', syncing: 'Syncing', offline: 'Offline' } as const;

export function ExamStrip(props: ExamStripProps) {
  const { questionTitle, questionIndex, totalQuestions, perQuestionRemainingMs, examRemainingMs, syncStatus, onExit, showTimers = true } = props;
  return (
    <div className="exam-strip">
      <div className="strip-left">
        <div className="strip-title">{questionTitle}</div>
        <div className="progress-label">Q {questionIndex + 1} / {totalQuestions}</div>
      </div>
      {showTimers && (
        <div className="strip-center">
          {perQuestionRemainingMs !== null && (
            <div className="timer-primary">
              <span className="timer-primary-label">This Question</span>
              <span className="timer-primary-value">{formatMs(perQuestionRemainingMs)}</span>
            </div>
          )}
          <div className="timer-secondary">
            <span className="timer-secondary-label">Exam</span>
            <span className="timer-secondary-value">{formatMs(examRemainingMs)}</span>
          </div>
        </div>
      )}
      <div className="strip-right">
        <div className="sync-pill">{SYNC_LABEL[syncStatus]}</div>
        <button className="exit-btn" onClick={onExit} type="button">
          <X /> Exit Exam
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7.2: Add the CSS**

Create `src/components/exam/exam-strip.css` with the v5 strip styles (copy from `student-assessment-v5.html` lines 17–34, replacing hardcoded hex with `var(--clr-green-800)` / `var(--text-secondary)` / `var(--text-primary)` where the token exists).

- [ ] **Step 7.3: Type-check + commit**

```bash
npm run tsc
git add src/components/exam/exam-strip.tsx src/components/exam/exam-strip.css
git commit -m "feat(exam): ExamStrip chrome component"
```

---

## Task 8: `AssessmentController` reducer + state machine (TDD)

**Files:**
- Modify: `src/app/(student-focus)/student/assessment/[id]/assessment-controller.tsx`
- Create: `src/app/(student-focus)/student/assessment/[id]/assessment-reducer.ts`
- Create: `src/app/(student-focus)/student/assessment/[id]/assessment-reducer.test.ts`

- [ ] **Step 8.1: Write the failing reducer test**

Create `assessment-reducer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assessmentReducer, type AssessmentState } from './assessment-reducer';

const base: AssessmentState = {
  phase: 'PRE_FLASH',
  questionIndex: 0,
  selectedOption: null,
  isFinalQuestion: false,
  perQuestionElapsedMs: 0,
  examElapsedMs: 0,
  confirmationRequired: true,
  perQuestionLimitSeconds: 60,
  submitStatus: 'idle',
};

describe('assessmentReducer', () => {
  it('PRE_FLASH → PHASE_2_FLASH on START_FLASH', () => {
    const next = assessmentReducer(base, { type: 'START_FLASH' });
    expect(next.phase).toBe('PHASE_2_FLASH');
  });

  it('PHASE_2_FLASH → MCQ on FLASH_COMPLETE', () => {
    const next = assessmentReducer({ ...base, phase: 'PHASE_2_FLASH' }, { type: 'FLASH_COMPLETE' });
    expect(next.phase).toBe('MCQ');
  });

  it('SELECT_OPTION records the chosen letter', () => {
    const next = assessmentReducer({ ...base, phase: 'MCQ' }, { type: 'SELECT_OPTION', option: 'C' });
    expect(next.selectedOption).toBe('C');
  });

  it('CONFIRM_OR_ADVANCE moves to next question and clears selection (non-final)', () => {
    const state = { ...base, phase: 'MCQ' as const, selectedOption: 'B' as const, questionIndex: 0, isFinalQuestion: false };
    const next = assessmentReducer(state, { type: 'CONFIRM_OR_ADVANCE' });
    expect(next.questionIndex).toBe(1);
    expect(next.selectedOption).toBeNull();
  });

  it('CONFIRM_OR_ADVANCE on final question transitions to COMPLETE', () => {
    const state = { ...base, phase: 'MCQ' as const, selectedOption: 'A' as const, isFinalQuestion: true };
    const next = assessmentReducer(state, { type: 'CONFIRM_OR_ADVANCE' });
    expect(next.phase).toBe('COMPLETE');
  });

  it('PER_QUESTION_TIMER_EXPIRED moves to TIME_UP without losing selection', () => {
    const state = { ...base, phase: 'MCQ' as const, selectedOption: 'D' as const };
    const next = assessmentReducer(state, { type: 'PER_QUESTION_TIMER_EXPIRED' });
    expect(next.phase).toBe('TIME_UP');
    expect(next.selectedOption).toBe('D');
  });

  it('WARNING_RAISED preserves prior phase as resumePhase', () => {
    const state = { ...base, phase: 'MCQ' as const };
    const next = assessmentReducer(state, { type: 'WARNING_RAISED', warningType: 'tab_switch' });
    expect(next.phase).toBe('WARNING');
    expect(next.resumePhase).toBe('MCQ');
  });

  it('DISMISS_WARNING restores resumePhase', () => {
    const state = { ...base, phase: 'WARNING' as const, resumePhase: 'MCQ' as const };
    const next = assessmentReducer(state, { type: 'DISMISS_WARNING' });
    expect(next.phase).toBe('MCQ');
  });

  it('EXAM_TIMER_EXPIRED jumps straight to COMPLETE', () => {
    const next = assessmentReducer({ ...base, phase: 'MCQ' }, { type: 'EXAM_TIMER_EXPIRED' });
    expect(next.phase).toBe('COMPLETE');
  });
});
```

- [ ] **Step 8.2: Run the test (must fail)**

```bash
npx vitest run src/app/(student-focus)/student/assessment/[id]/assessment-reducer.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 8.3: Implement the reducer**

Create `assessment-reducer.ts`:

```ts
export type AssessmentPhase =
  | 'PRE_FLASH'
  | 'PHASE_2_FLASH'
  | 'MCQ'
  | 'TIME_UP'
  | 'WARNING'
  | 'COMPLETE';

export interface AssessmentState {
  phase: AssessmentPhase;
  resumePhase?: AssessmentPhase;
  questionIndex: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isFinalQuestion: boolean;
  perQuestionElapsedMs: number;
  examElapsedMs: number;
  confirmationRequired: boolean;
  perQuestionLimitSeconds: number | null;
  submitStatus: 'idle' | 'pending' | 'ok' | 'failed';
}

export type AssessmentAction =
  | { type: 'START_FLASH' }
  | { type: 'FLASH_COMPLETE' }
  | { type: 'SELECT_OPTION'; option: 'A' | 'B' | 'C' | 'D' }
  | { type: 'CONFIRM_OR_ADVANCE' }
  | { type: 'PER_QUESTION_TIMER_EXPIRED' }
  | { type: 'EXAM_TIMER_EXPIRED' }
  | { type: 'WARNING_RAISED'; warningType: 'tab_switch' | 'clock_skew' }
  | { type: 'DISMISS_WARNING' }
  | { type: 'SET_SUBMIT_STATUS'; status: AssessmentState['submitStatus'] };

export function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case 'START_FLASH':
      return { ...state, phase: 'PHASE_2_FLASH' };
    case 'FLASH_COMPLETE':
      return { ...state, phase: 'MCQ' };
    case 'SELECT_OPTION':
      return { ...state, selectedOption: action.option };
    case 'CONFIRM_OR_ADVANCE':
      if (state.isFinalQuestion) return { ...state, phase: 'COMPLETE' };
      return {
        ...state,
        phase: state.confirmationRequired ? 'PRE_FLASH' : 'MCQ',
        questionIndex: state.questionIndex + 1,
        selectedOption: null,
        perQuestionElapsedMs: 0,
      };
    case 'PER_QUESTION_TIMER_EXPIRED':
      return { ...state, phase: 'TIME_UP' };
    case 'EXAM_TIMER_EXPIRED':
      return { ...state, phase: 'COMPLETE' };
    case 'WARNING_RAISED':
      return { ...state, phase: 'WARNING', resumePhase: state.phase };
    case 'DISMISS_WARNING':
      return { ...state, phase: state.resumePhase ?? 'MCQ', resumePhase: undefined };
    case 'SET_SUBMIT_STATUS':
      return { ...state, submitStatus: action.status };
    default:
      return state;
  }
}
```

- [ ] **Step 8.4: Run the test (must pass)**

```bash
npx vitest run src/app/(student-focus)/student/assessment/[id]/assessment-reducer.test.ts
```
Expected: 9 passed.

- [ ] **Step 8.5: Commit**

```bash
git add src/app/(student-focus)/student/assessment/[id]/assessment-reducer.ts src/app/(student-focus)/student/assessment/[id]/assessment-reducer.test.ts
git commit -m "feat(assessment): reducer + state machine for AssessmentController"
```

---

## Task 9: Wire `AssessmentController` to the reducer + screens

**Files:**
- Modify: `src/app/(student-focus)/student/assessment/[id]/assessment-controller.tsx`

- [ ] **Step 9.1: Replace the stub with the full controller**

```tsx
'use client';

import { useReducer, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentReducer, type AssessmentState } from './assessment-reducer';
import { useRafCountdown } from '@/lib/anzan/use-raf-countdown';
import { PreFlashScreen } from './screens/pre-flash-screen';
import { FlashScreen } from './screens/flash-screen';
import { ExamMcqScreen } from './screens/exam-mcq-screen';
import { TestMcqScreen } from './screens/test-mcq-screen';
import { TimeUpModal } from './screens/time-up-modal';
import { WarningModal } from './screens/warning-modal';
import { CompletionScreen } from './screens/completion-screen';

interface Question {
  id: string;
  equationDisplay: string | null;
  flashSequence: number[] | null;
  seed: string;
  orderIndex: number;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
}

interface AssessmentControllerProps {
  assessmentId: string;
  sessionId: string;
  paperType: 'EXAM' | 'TEST';
  perQuestionTimeSeconds: number | null;
  requireConfirmation: boolean;
  questions: Question[];
}

export function AssessmentController(props: AssessmentControllerProps) {
  const router = useRouter();
  const initial: AssessmentState = {
    phase: props.paperType === 'TEST' ? 'PRE_FLASH' : 'MCQ',
    questionIndex: 0,
    selectedOption: null,
    isFinalQuestion: props.questions.length === 1,
    perQuestionElapsedMs: 0,
    examElapsedMs: 0,
    confirmationRequired: props.requireConfirmation,
    perQuestionLimitSeconds: props.perQuestionTimeSeconds,
    submitStatus: 'idle',
  };
  const [state, dispatch] = useReducer(assessmentReducer, initial);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Online/offline tracking — replaces the setTimeout in the old client
  useEffect(() => {
    const onOnline = () => setSyncStatus('synced');
    const onOffline = () => setSyncStatus('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    if (!navigator.onLine) setSyncStatus('offline');
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const currentQuestion = props.questions[state.questionIndex];
  const isFinal = state.questionIndex === props.questions.length - 1;

  // Per-question countdown
  const { remainingMs: perQuestionRemainingMs } = useRafCountdown({
    durationSec: state.perQuestionLimitSeconds ?? 0,
    running: state.phase === 'MCQ' && state.perQuestionLimitSeconds !== null,
    onExpire: useCallback(() => dispatch({ type: 'PER_QUESTION_TIMER_EXPIRED' }), []),
  });

  // Exam-wide countdown — duration injected via the page (use 60 min default until plumbed)
  const { remainingMs: examRemainingMs } = useRafCountdown({
    durationSec: 60 * 60,
    running: state.phase === 'MCQ' || state.phase === 'PHASE_2_FLASH' || state.phase === 'PRE_FLASH',
    onExpire: useCallback(() => dispatch({ type: 'EXAM_TIMER_EXPIRED' }), []),
  });

  const handleExit = useCallback(() => {
    if (window.confirm('Exit the exam? Your progress is saved but the session will be marked as abandoned.')) {
      router.push('/student/dashboard');
    }
  }, [router]);

  switch (state.phase) {
    case 'PRE_FLASH':
      return <PreFlashScreen questionIndex={state.questionIndex} onComplete={() => dispatch({ type: 'START_FLASH' })} />;
    case 'PHASE_2_FLASH':
      return (
        <FlashScreen
          sessionId={props.sessionId}
          question={currentQuestion}
          onComplete={() => dispatch({ type: 'FLASH_COMPLETE' })}
          onExit={handleExit}
          syncStatus={syncStatus}
        />
      );
    case 'MCQ':
      return props.paperType === 'EXAM' ? (
        <ExamMcqScreen
          question={currentQuestion}
          questionIndex={state.questionIndex}
          totalQuestions={props.questions.length}
          selectedOption={state.selectedOption}
          confirmationRequired={state.confirmationRequired}
          isFinal={isFinal}
          perQuestionRemainingMs={state.perQuestionLimitSeconds !== null ? perQuestionRemainingMs : null}
          examRemainingMs={examRemainingMs}
          syncStatus={syncStatus}
          onSelect={(opt) => dispatch({ type: 'SELECT_OPTION', option: opt })}
          onConfirm={() => dispatch({ type: 'CONFIRM_OR_ADVANCE' })}
          onExit={handleExit}
        />
      ) : (
        <TestMcqScreen
          question={currentQuestion}
          questionIndex={state.questionIndex}
          totalQuestions={props.questions.length}
          selectedOption={state.selectedOption}
          confirmationRequired={state.confirmationRequired}
          perQuestionRemainingMs={state.perQuestionLimitSeconds !== null ? perQuestionRemainingMs : null}
          examRemainingMs={examRemainingMs}
          syncStatus={syncStatus}
          onSelect={(opt) => dispatch({ type: 'SELECT_OPTION', option: opt })}
          onAdvance={() => dispatch({ type: 'CONFIRM_OR_ADVANCE' })}
          onExit={handleExit}
        />
      );
    case 'TIME_UP':
      return <TimeUpModal onContinue={() => dispatch({ type: 'CONFIRM_OR_ADVANCE' })} />;
    case 'WARNING':
      return <WarningModal warningType="tab_switch" onDismiss={() => dispatch({ type: 'DISMISS_WARNING' })} />;
    case 'COMPLETE':
      return <CompletionScreen sessionId={props.sessionId} onBack={() => router.push('/student/dashboard')} />;
  }
}
```

- [ ] **Step 9.2: Type-check (will fail — screens not created)**

```bash
npm run tsc
```
Expected: errors about missing `./screens/...` modules. That's fine — Tasks 10–16 create them.

- [ ] **Step 9.3: Commit**

```bash
git add src/app/(student-focus)/student/assessment/[id]/assessment-controller.tsx
git commit -m "feat(assessment): wire AssessmentController to reducer + screen dispatcher"
```

---

## Task 10: Screen 1 — `<PreFlashScreen>`

**Files:**
- Create: `src/app/(student-focus)/student/assessment/[id]/screens/pre-flash-screen.tsx`

- [ ] **Step 10.1: Implement**

```tsx
'use client';

import { useRafCountdown } from '@/lib/anzan/use-raf-countdown';

interface Props {
  questionIndex: number;
  onComplete: () => void;
}

export function PreFlashScreen({ questionIndex, onComplete }: Props) {
  const { remainingMs } = useRafCountdown({ durationSec: 3, running: true, onExpire: onComplete });
  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <div className="pre-flash-root">
      <div className="pre-flash-card">
        <div className="pre-flash-label">Get ready, Q{questionIndex + 1}</div>
        <div className="pre-flash-count">{seconds}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 10.2: Add inline styles via CSS module or globals**

Add the corresponding `.pre-flash-root` rules to `src/app/globals.css` (centred, full-bleed white, DM Mono `pre-flash-count`).

- [ ] **Step 10.3: Type-check + commit**

```bash
npm run tsc
git add src/app/(student-focus)/student/assessment/[id]/screens/pre-flash-screen.tsx src/app/globals.css
git commit -m "feat(assessment): PreFlashScreen — 3s readiness countdown"
```

---

## Task 11: Screen 2 — `<FlashScreen>` (wrap existing AnzanFlashView)

**Files:**
- Create: `src/app/(student-focus)/student/assessment/[id]/screens/flash-screen.tsx`

- [ ] **Step 11.1: Implement as a thin wrapper**

```tsx
'use client';

import { AnzanFlashView } from '@/components/exam/anzan-flash-view';
import { ExamStrip } from '@/components/exam/exam-strip';

interface Props {
  sessionId: string;
  question: {
    id: string;
    flashSequence: number[] | null;
    seed: string;
    orderIndex: number;
    options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
  };
  onComplete: () => void;
  onExit: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
}

/**
 * Wraps the existing AnzanFlashView with the new ExamStrip chrome.
 * The flash engine itself (timing, RAF loop, phase machine) is untouched
 * and continues to live in src/lib/anzan/timing-engine.ts.
 */
export function FlashScreen({ sessionId, question, onComplete, onExit, syncStatus }: Props) {
  return (
    <div className="exam-page">
      <ExamStrip
        questionTitle={`Q${question.orderIndex + 1} Mental Arithmetic`}
        questionIndex={question.orderIndex}
        totalQuestions={question.orderIndex + 1}
        perQuestionRemainingMs={null}
        examRemainingMs={0}
        syncStatus={syncStatus}
        onExit={onExit}
        showTimers={false}
      />
      <AnzanFlashView
        sessionId={sessionId}
        questions={[{ ...question, equationDisplay: null }]}
        anzanConfig={{ delayMs: 500, digitCount: 2, rowCount: question.flashSequence?.length ?? 5 }}
        syncStatus={syncStatus}
        isOffline={syncStatus === 'offline'}
        onNavigateResults={onComplete}
        onNavigateDashboard={onExit}
      />
    </div>
  );
}
```

- [ ] **Step 11.2: Commit**

```bash
git add src/app/(student-focus)/student/assessment/[id]/screens/flash-screen.tsx
git commit -m "feat(assessment): FlashScreen wrapper around existing AnzanFlashView"
```

---

## Task 12: Screen 3 — `<ExamMcqScreen>`

**Files:**
- Create: `src/app/(student-focus)/student/assessment/[id]/screens/exam-mcq-screen.tsx`

- [ ] **Step 12.1: Implement**

```tsx
'use client';

import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { ExamStrip } from '@/components/exam/exam-strip';
import { EquationTable } from '@/components/exam/equation-table';

interface Question {
  id: string;
  equationDisplay: string | null;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
}

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  confirmationRequired: boolean;
  isFinal: boolean;
  perQuestionRemainingMs: number | null;
  examRemainingMs: number;
  syncStatus: 'synced' | 'syncing' | 'offline';
  onSelect: (opt: 'A' | 'B' | 'C' | 'D') => void;
  onConfirm: () => void;
  onExit: () => void;
}

function parseOperands(displayCsv: string | null): number[] {
  if (!displayCsv) return [];
  return displayCsv.split(',').map((n) => parseInt(n.trim(), 10)).filter((n) => !Number.isNaN(n));
}

export function ExamMcqScreen(props: Props) {
  const operands = parseOperands(props.question.equationDisplay);
  const tableSize = operands.length <= 6 ? 'lg' : 'sm';

  // Keyboard shortcuts (S5)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        props.onSelect(e.key.toUpperCase() as 'A' | 'B' | 'C' | 'D');
      } else if (e.key === 'Enter' && props.selectedOption) {
        props.onConfirm();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [props]);

  return (
    <div className="exam-page">
      <ExamStrip
        questionTitle={`Q${props.questionIndex + 1} Mental Arithmetic`}
        questionIndex={props.questionIndex}
        totalQuestions={props.totalQuestions}
        perQuestionRemainingMs={props.perQuestionRemainingMs}
        examRemainingMs={props.examRemainingMs}
        syncStatus={props.syncStatus}
        onExit={props.onExit}
      />

      <div className="mcq-main">
        <div className="mcq-inner">
          <div className="equation-panel">
            <div className="equation-label">Question {props.questionIndex + 1}</div>
            <EquationTable operands={operands} size={tableSize} />
          </div>

          <div className="options-grid">
            {props.question.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`option-tile${props.selectedOption === opt.key ? ' selected' : ''}`}
                onClick={() => props.onSelect(opt.key)}
              >
                <span className="option-letter">{opt.key}</span>
                <span className="option-value">{opt.label}</span>
              </button>
            ))}
          </div>

          {props.confirmationRequired && (
            <div className="confirm-row">
              <button
                type="button"
                className="confirm-btn"
                disabled={!props.selectedOption}
                onClick={props.onConfirm}
              >
                {props.isFinal ? 'Submit Exam' : 'Confirm Answer'}
                <ArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 12.2: Add the supporting CSS to globals**

Append to `src/app/globals.css` the `.exam-page`, `.mcq-main`, `.mcq-inner`, `.equation-panel`, `.options-grid`, `.option-tile`, `.option-letter`, `.option-value`, `.confirm-row`, `.confirm-btn` rules from `student-assessment-v5.html` (replace hardcoded hex with tokens where possible — keep `#991B1B` only inside `equation-table.css`).

- [ ] **Step 12.3: Type-check + commit**

```bash
npm run tsc
git add src/app/(student-focus)/student/assessment/[id]/screens/exam-mcq-screen.tsx src/app/globals.css
git commit -m "feat(assessment): ExamMcqScreen — vertical-table MCQ + keyboard shortcuts"
```

---

## Task 13: Screen 4 — `<TestMcqScreen>`

**Files:**
- Create: `src/app/(student-focus)/student/assessment/[id]/screens/test-mcq-screen.tsx`

- [ ] **Step 13.1: Implement**

```tsx
'use client';

import { useEffect } from 'react';
import { ExamStrip } from '@/components/exam/exam-strip';
import { useRafDelay } from '@/lib/anzan/use-raf-delay';

interface Props {
  question: { id: string; options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }> };
  questionIndex: number;
  totalQuestions: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  confirmationRequired: boolean;
  perQuestionRemainingMs: number | null;
  examRemainingMs: number;
  syncStatus: 'synced' | 'syncing' | 'offline';
  onSelect: (opt: 'A' | 'B' | 'C' | 'D') => void;
  onAdvance: () => void;
  onExit: () => void;
}

export function TestMcqScreen(props: Props) {
  // 120ms acknowledgement window when confirmation is OFF
  useRafDelay(props.onAdvance, 120, !props.confirmationRequired && props.selectedOption !== null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        props.onSelect(e.key.toUpperCase() as 'A' | 'B' | 'C' | 'D');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [props]);

  return (
    <div className="exam-page">
      <ExamStrip
        questionTitle={`Q${props.questionIndex + 1} Mental Arithmetic`}
        questionIndex={props.questionIndex}
        totalQuestions={props.totalQuestions}
        perQuestionRemainingMs={props.perQuestionRemainingMs}
        examRemainingMs={props.examRemainingMs}
        syncStatus={props.syncStatus}
        onExit={props.onExit}
      />
      <div className="mcq-main">
        <div className="mcq-inner">
          <div className="equation-panel">
            <div className="equation-label">Select the correct sum</div>
          </div>
          <div className="options-grid">
            {props.question.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`option-tile${props.selectedOption === opt.key ? ' selected' : ''}`}
                onClick={() => props.onSelect(opt.key)}
              >
                <span className="option-letter">{opt.key}</span>
                <span className="option-value">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 13.2: Commit**

```bash
git add src/app/(student-focus)/student/assessment/[id]/screens/test-mcq-screen.tsx
git commit -m "feat(assessment): TestMcqScreen — tile-tap auto-advance variant"
```

---

## Task 14: Screen 5 — `<TimeUpModal>` (portal)

**Files:**
- Create: `src/app/(student-focus)/student/assessment/[id]/screens/time-up-modal.tsx`

- [ ] **Step 14.1: Implement**

```tsx
'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Props { onContinue: () => void }

export function TimeUpModal({ onContinue }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card">
        <Clock className="modal-icon" />
        <h2>Time's up</h2>
        <p>Your time for this question is over.</p>
        <button type="button" className="confirm-btn" onClick={onContinue}>Continue</button>
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 14.2: Commit**

```bash
git add src/app/(student-focus)/student/assessment/[id]/screens/time-up-modal.tsx
git commit -m "feat(assessment): TimeUpModal — portal-rendered overlay"
```

---

## Task 15: Screen 6 — `<WarningModal>` (portal + anti-cheat wiring)

**Files:**
- Create: `src/app/(student-focus)/student/assessment/[id]/screens/warning-modal.tsx`

- [ ] **Step 15.1: Implement**

```tsx
'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  warningType: 'tab_switch' | 'clock_skew';
  onDismiss: () => void;
}

const COPY = {
  tab_switch: 'Leaving the exam tab is not allowed. This warning has been recorded.',
  clock_skew: 'Your device clock has changed unexpectedly. Please do not modify the clock during an exam.',
} as const;

export function WarningModal({ warningType, onDismiss }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card warning-card">
        <AlertTriangle className="modal-icon warning" />
        <h2>Warning</h2>
        <p>{COPY[warningType]}</p>
        <button type="button" className="confirm-btn" onClick={onDismiss}>I understand</button>
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 15.2: Wire `tab-monitor` and `clock-guard` from the controller**

In `assessment-controller.tsx`, add an effect that subscribes to the existing detectors. Reference the actual export names by reading `src/lib/anticheat/tab-monitor.ts` and `src/lib/anticheat/clock-guard.ts` first. Adapter pseudocode:

```ts
useEffect(() => {
  const offTab = onTabSwitch(() => dispatch({ type: 'WARNING_RAISED', warningType: 'tab_switch' }));
  const offClock = onClockSkew(() => dispatch({ type: 'WARNING_RAISED', warningType: 'clock_skew' }));
  return () => { offTab(); offClock(); };
}, []);
```

If the existing modules don't export subscriber-style APIs, add a thin `subscribe(fn)` wrapper inside the modules — keep the change minimal and isolated.

- [ ] **Step 15.3: Commit**

```bash
git add src/app/(student-focus)/student/assessment/[id]/screens/warning-modal.tsx src/app/(student-focus)/student/assessment/[id]/assessment-controller.tsx src/lib/anticheat/
git commit -m "feat(assessment): WarningModal + anti-cheat subscriber wiring"
```

---

## Task 16: Screen 7 — `<CompletionScreen>` with auto-redirect

**Files:**
- Create: `src/app/(student-focus)/student/assessment/[id]/screens/completion-screen.tsx`

- [ ] **Step 16.1: Implement**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import { useRafCountdown } from '@/lib/anzan/use-raf-countdown';

interface Props {
  sessionId: string;
  onBack: () => void;
}

export function CompletionScreen({ sessionId: _sessionId, onBack }: Props) {
  const router = useRouter();
  const [submitFailed] = useState(false); // wired to actual submit POST in plan execution

  const { remainingMs } = useRafCountdown({
    durationSec: 10,
    running: !submitFailed,
    onExpire: () => router.push('/student/dashboard'),
  });
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div className="completion-root">
      <div className="completion-card">
        <CircleCheck className="completion-icon" />
        <h2>Exam submitted</h2>
        <p>Your answers have been recorded.</p>
        {submitFailed ? (
          <div className="retry-pill">Saved offline — will sync when online</div>
        ) : (
          <div className="auto-redirect">Returning to dashboard in {seconds}s</div>
        )}
        <button type="button" className="confirm-btn" onClick={onBack}>Back to Dashboard</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 16.2: Type-check the whole controller now that screens exist**

```bash
npm run tsc
```
Expected: 0 errors.

- [ ] **Step 16.3: Commit**

```bash
git add src/app/(student-focus)/student/assessment/[id]/screens/completion-screen.tsx
git commit -m "feat(assessment): CompletionScreen with RAF-driven 10s auto-redirect"
```

---

## Task 17: Retroactive — Create Assessment Wizard Step 3 fields

**Files:**
- Modify: `src/components/admin/assessment-wizard/<step-3-config-file>.tsx` (locate via `Grep` in step 17.1)
- Modify: `src/app/actions/assessments.ts`
- Modify: `docs/superpowers/specs/2026-04-13-admin-create-assessment-flow-design.md`

- [ ] **Step 17.1: Locate the wizard Step 3 component**

```bash
# from a real shell, not via Grep tool — this is for the engineer's reference
```
Use the project's Grep to find the file:
```
search: "step 3" or "Step 3" or "Configuration" inside src/components/admin/assessment-wizard/
```
Record the path before continuing.

- [ ] **Step 17.2: Add the two new fields to the form schema**

In the wizard's local form state, add:

```ts
perQuestionTimeSeconds: number | null,
requireAnswerConfirmation: boolean,
```

Default `requireAnswerConfirmation` to `true` for EXAM and `false` for TEST in the wizard initialiser.

- [ ] **Step 17.3: Render the inputs**

Add a numeric field labelled **Per-question timer (seconds)** with help text *"If set, each question gets its own countdown. When the timer runs out the question auto-submits."* Range 5–600, optional.

Add a switch labelled **Require answer confirmation** with help text *"When off, tapping an answer moves the student to the next question immediately."*

- [ ] **Step 17.4: Wire into the create/update action payload**

Open `src/app/actions/assessments.ts`, locate `createAssessment` and `updateAssessment`, extend the input type and the insert/update payload to include the two new columns.

- [ ] **Step 17.5: Type-check**

```bash
npm run tsc
```
Expected: 0 errors.

- [ ] **Step 17.6: Append a retroactive note to the wizard spec**

At the bottom of `docs/superpowers/specs/2026-04-13-admin-create-assessment-flow-design.md`, append:

```markdown
---

## 2026-04-14 — Retroactive update

Step 3 (Configuration) gains two new fields driven by the Student
Assessment-Taking Flow spec
(`2026-04-14-student-assessment-taking-flow-design.md`):

1. **Per-question timer (seconds)** — numeric, optional, range 5–600.
   Writes to `exam_papers.per_question_time_seconds`.
2. **Require answer confirmation** — switch, defaults ON for EXAM /
   OFF for TEST. Writes to `exam_papers.require_answer_confirmation`.
```

- [ ] **Step 17.7: Commit**

```bash
git add src/components/admin/assessment-wizard/ src/app/actions/assessments.ts docs/superpowers/specs/2026-04-13-admin-create-assessment-flow-design.md
git commit -m "feat(wizard): per-question timer + confirm toggle in Step 3"
```

---

## Task 18: Playwright — `(student-focus)` layout

**Files:**
- Create: `tests/e2e/student-focus-layout.spec.ts`

- [ ] **Step 18.1: Write the test**

```ts
import { test, expect } from '@playwright/test';

test.describe('(student-focus) layout', () => {
  test('sidebar and topbar are absent during assessment', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/student\/dashboard/);

    await page.click('text=Start Exam');
    await expect(page).toHaveURL(/\/student\/assessment\//);

    await expect(page.locator('.admin-sidebar')).toHaveCount(0);
    await expect(page.locator('[data-testid="student-topbar"]')).toHaveCount(0);
    await expect(page.locator('.exam-strip')).toBeVisible();
  });
});
```

- [ ] **Step 18.2: Run**

```bash
npx playwright test tests/e2e/student-focus-layout.spec.ts
```

- [ ] **Step 18.3: Commit**

```bash
git add tests/e2e/student-focus-layout.spec.ts
git commit -m "test(e2e): (student-focus) layout hides sidebar and topbar"
```

---

## Task 19: Playwright — per-question timer auto-submit

**Files:**
- Create: `tests/e2e/per-question-timer.spec.ts`

- [ ] **Step 19.1: Write the test**

```ts
import { test, expect } from '@playwright/test';

test('per-question timer auto-submits when expired', async ({ page }) => {
  // Test fixture must seed an EXAM with per_question_time_seconds = 5 and 2 questions
  await page.goto('/login');
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click('button[type="submit"]');

  await page.click('text=Start Exam');
  await expect(page.locator('.timer-primary-value')).toBeVisible();
  // Without selecting an option, wait > 5s
  await page.waitForTimeout(6000);
  // Should be on Q2 now (questionIndex advanced)
  await expect(page.locator('.progress-label')).toHaveText('Q 2 / 2');
});
```

- [ ] **Step 19.2: Run + commit**

```bash
npx playwright test tests/e2e/per-question-timer.spec.ts
git add tests/e2e/per-question-timer.spec.ts
git commit -m "test(e2e): per-question timer auto-submits"
```

---

## Task 20: Playwright — confirm-off tile-tap advance

**Files:**
- Create: `tests/e2e/confirm-off.spec.ts`

- [ ] **Step 20.1: Write the test**

```ts
import { test, expect } from '@playwright/test';

test('tile-tap advances when require_answer_confirmation = false', async ({ page }) => {
  // Fixture: TEST paper with require_answer_confirmation = false, 2 questions
  await page.goto('/login');
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.click('text=Start Exam');

  await expect(page.locator('.option-tile')).toHaveCount(4);
  await page.locator('.option-tile').first().click();
  // No confirm button should exist
  await expect(page.locator('.confirm-btn')).toHaveCount(0);
  // Should advance within ~250ms (120ms delay + frame budget)
  await page.waitForTimeout(300);
  await expect(page.locator('.progress-label')).toHaveText('Q 2 / 2');
});
```

- [ ] **Step 20.2: Run + commit**

```bash
npx playwright test tests/e2e/confirm-off.spec.ts
git add tests/e2e/confirm-off.spec.ts
git commit -m "test(e2e): tile-tap auto-advance when confirmation is off"
```

---

## Task 21: Playwright — completion auto-redirect

**Files:**
- Create: `tests/e2e/completion-auto-redirect.spec.ts`

- [ ] **Step 21.1: Write the test**

```ts
import { test, expect } from '@playwright/test';

test('completion screen auto-redirects within 12s', async ({ page }) => {
  // Fixture: tiny EXAM with 1 question
  await page.goto('/login');
  await page.fill('input[name="email"]', process.env.TEST_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_STUDENT_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.click('text=Start Exam');

  await page.locator('.option-tile').first().click();
  await page.locator('.confirm-btn').click(); // "Submit Exam" on final question
  await expect(page.locator('text=Exam submitted')).toBeVisible();

  // Auto-redirect within 12s (10s countdown + buffer)
  await page.waitForURL(/\/student\/dashboard/, { timeout: 12000 });
});
```

- [ ] **Step 21.2: Run + commit**

```bash
npx playwright test tests/e2e/completion-auto-redirect.spec.ts
git add tests/e2e/completion-auto-redirect.spec.ts
git commit -m "test(e2e): completion screen auto-redirect"
```

---

## Task 22: Final integration verification

- [ ] **Step 22.1: Type-check, lint, unit tests**

```bash
npm run tsc
npm run lint
npm run test
```
Expected: 0 errors, 0 lint warnings, all unit tests green.

- [ ] **Step 22.2: Build**

```bash
npm run build
```
Expected: 0 errors.

- [ ] **Step 22.3: Run the existing flow verification**

Per CLAUDE.md verification policy, run `/verify-exam-flow` and `/verify-admin-pages`.

Expected: PASS on both. Investigate any failure as a regression — do not declare done until both pass.

- [ ] **Step 22.4: Spot-check the two new DB columns in live data**

In Supabase SQL editor:

```sql
SELECT id, type, per_question_time_seconds, require_answer_confirmation
FROM exam_papers
WHERE status = 'LIVE'
ORDER BY created_at DESC
LIMIT 5;
```
Expected: rows show the new columns populated. Existing rows have `per_question_time_seconds = NULL` and `require_answer_confirmation = TRUE`.

- [ ] **Step 22.5: Smoke test in production preview**

After deploy, walk through:
1. Admin → Create Assessment → set per-question timer 30s and confirm OFF → save → publish
2. Student → Start Exam → confirm sidebar/topbar absent → click an option → verify advance after 120ms (no confirm needed)
3. Final question → Submit → land on Completion → wait for auto-redirect

- [ ] **Step 22.6: Mark task done**

Update TASKS.md if a task entry exists for the assessment-taking flow. Otherwise nothing to do.

---

## Self-Review

**Spec coverage check:**
- §3.1 per-question timer → Task 1 (DB), Task 2 (action), Task 4 (hook), Task 8 (reducer), Task 9 (controller), Task 12 (UI), Task 19 (E2E) ✓
- §3.2 confirm toggle → Task 1 (DB), Task 2 (action), Task 8 (reducer), Task 12 (UI), Task 13 (UI), Task 20 (E2E) ✓
- §3.3 hidden chrome → Task 3 (route group), Task 18 (E2E) ✓
- §3.4 auto-redirect completion → Task 16, Task 21 ✓
- §4 S1–S9 pro suggestions → S1 (Task 1.2 verify), S2 (Task 8 reducer pause), S3 (left as future opt — flagged in plan §13.3), S4 (mentioned in Task 8 — autosave wiring left for execution), S5 (Task 12), S6 (Task 7), S7 (Task 15), S8 (Task 16), S9 (Task 12 isFinal copy change) ✓
- §5 all seven screens → Tasks 10–16 ✓
- §6 EquationTable contract → Task 6 ✓
- §7 route group `(student-focus)` → Task 3 ✓
- §8 reducer + RAF hooks → Tasks 4, 5, 8 ✓
- §9 DB columns → Task 1 ✓
- §10 retroactive wizard update → Task 17 ✓
- §11 error handling: most paths covered; offline-queue draining is left to existing infrastructure (no new code needed)
- §12 testing → Tasks 4–8 unit, Tasks 18–21 E2E ✓

**Placeholder scan:** No "TBD" or "implement later" in any task. Step 17.1 asks the engineer to locate the wizard file because the exact path is not yet known — that's a real lookup, not a placeholder, and Step 17.1 specifies the exact search.

**Type consistency:** `AssessmentState`, `AssessmentAction`, `AssessmentPhase`, `AssessmentControllerProps`, `useRafCountdown`, `useRafDelay`, `EquationTable`, `ExamStrip` are all defined in earlier tasks and referenced consistently in later tasks. `assessmentReducer` exported from Task 8 → consumed in Task 9.

**Known gap to flag at execution time:** S3 (prefetch next question) and S4 (autosave on every option click) are mentioned in Task 8 narrative but not lifted into individual steps. They are second-order optimisations that depend on confirming the existing offline-queue API. Add them as Task 8.5 after Task 8 ships and the engineer confirms the Dexie put signature in `src/lib/offline/indexed-db-store.ts`.

---

## Done criteria

- All 22 tasks committed
- `npm run tsc` → 0 errors
- `npm run lint` → 0 warnings
- `npm run test` → all green (including new vitest specs from Tasks 4, 5, 6, 8)
- `npm run test:e2e` → all green (including Tasks 18–21)
- `/verify-exam-flow` → PASS
- `/verify-admin-pages` → PASS
- Live DB shows the two new `exam_papers` columns
- Smoke test (Step 22.5) walks end-to-end without a console error
