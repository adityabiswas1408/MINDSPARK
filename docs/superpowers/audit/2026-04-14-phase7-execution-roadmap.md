# Phase 7 — Execution Roadmap for MINDSPARK v1

**Date:** 2026-04-14
**Model:** Opus 4.6 (1M context) + high effort — explicit synthesis-grade task
**Inputs:** All 13 specs (post-Phase 2 + Phase 3 patches), 3 plans (post-Phase 5.8 + 5.9 patches), audit doc §1–§6, live DB schema, live code state (post-Phase 5 + Phase 6 changes)
**Scope:** Produce a single ordered build plan for v1 that (a) resolves every cross-plan dependency, (b) fixes the 1 real bundle bug Phase 6 flagged, (c) lists every remaining blocker, (d) answers every question "what do I build next?"

---

## 0. Executive summary

**Current state (commit `4f7fe69c`):**

- 20 commits ahead of `origin/main`, all on `docs/superpowers/` and two surgical code fixes from Phase 5.
- 6 audit phases complete. Every spec has been patched for consistency, every DB gap is documented, every action gap is catalogued.
- **3 implementation plans are ready to execute** (`student-assessment-taking-flow`, `student-results-flow`, `student-profile`).
- **10 specs still need implementation plans** (all of the 2026-04-13 batch minus announcements + activity-log, which are dropped from v1).
- **1 production-breaking bug:** `student_answers.is_correct` is never written anywhere, so every paper currently scores 0%. The assessment-taking plan's Task 1.5 fixes it when it runs.
- **1 real bundle bug:** `/student/exams/[id]` ships 248 kB because the read-only info page imports the full assessment engine. Fix: split `ExamPageClient` into `ExamInfoCard` (lightweight) and `ExamTakerClient` (full engine). Belongs in the assessment-taking refactor path.
- **Performance budget is met:** every route ≤ 300 kB First Load JS. Highest is `/admin/results` at 250 kB.

**The v1 critical path has 5 waves** (Wave 1 unblocks everything; Waves 2 and 3 can run in parallel; Waves 4 and 5 are polish):

| Wave | Name | Ships | Blocks |
|---|---|---|---|
| **1** | Foundation DB + scoring fix | DB schema and the `is_correct` fix wired through 10 touchpoints | Everything downstream |
| **2** | Student v1 UI | 3 ready plans executed in parallel after Wave 1 | Student-facing demo |
| **3** | Admin v1 foundation | Migrations for 4 admin specs (schemas + RPCs + cron + storage bucket) | Admin UI plans in Wave 4 |
| **4** | Admin v1 UI | 8 admin plans written + executed | Admin demo |
| **5** | Polish + cleanup | dpm DROP, bundle bug fix, data cleanup, GOTCHAS final pass | v1 ship |

**Minimum wall-clock order** (one engineer, sequential — not parallel):

```
Wave 1  →  Wave 2 (student-profile, then student-results-flow, then assessment-taking)
        →  Wave 3 (4 admin migrations — can be batched)
        →  Wave 4 (8 admin plans in dependency order)
        →  Wave 5 (polish)
```

**If parallelised across 2+ engineers:**

```
Engineer A: Wave 1 → Wave 2 (student plans) → Wave 5 (polish)
Engineer B:            Wave 3 (admin migrations) → Wave 4 (admin plans)
```

---

## 1. Reading this document

This roadmap is structured around **waves** (ordered groups of work that can run together), **tracks** (the student vs admin split), and **blocker edges** (when work in one plan must land before work in another).

- A ✅ means the work has a committed spec and a committed plan.
- A 🟨 means the work has a committed spec but no plan yet (needs to be written in the `writing-plans` skill).
- A ⚠️ means the work has a known gap that blocks execution.
- A 🔴 means the work is a game-breaking bug that must ship before anything else is user-visible.

Cross-plan dependencies are expressed as "A → B": A must land before B starts.

---

## 2. Wave 1 — Foundation DB + scoring fix

**Goal:** Land every DB change and code fix that unblocks downstream work, in a single coordinated pass. Everything in Waves 2–5 depends on this wave.

### 2.1 What ships

| Task | Source | Kind | Blocker for |
|---|---|---|---|
| 🔴 `student_answers.time_spent_ms` + `is_correct` + `answered_at` chain (Task 1.5 of `2026-04-14-student-assessment-taking-flow.md`) | Ready plan | DDL + 8 code edits + RPC update | Every paper's scoring works correctly. **This is the #1 priority in the entire project.** |
| ✅ `exam_papers.per_question_time_seconds` + `require_answer_confirmation` (Task 1 of same plan) | Ready plan | DDL | Assessment wizard Step 3 config, per-question countdown |
| ✅ `exam_papers.answer_key_released*` + `submissions.total_questions` (Task 1 of `2026-04-14-student-results-flow.md`) | Ready plan | DDL | Two-gate release model, got/total score display, admin-results-redesign |
| ✅ `students.roll_number SET NOT NULL` (Task 1 of `2026-04-14-student-profile.md`) | Ready plan | DDL | Profile spec canonical assumption |

### 2.2 Execution order within Wave 1

Run the three ready plans' Task 1 (and 1.5 for assessment-taking) in this order:

1. **`student-profile.md` Task 1** — single `ALTER TABLE students ALTER COLUMN roll_number SET NOT NULL`. Verified safe (0 NULL rows). Fast commit.
2. **`student-results-flow.md` Task 1** — 4 column adds + 1 backfill. Safe. No downstream impact until UI ships in Wave 2.
3. **`student-assessment-taking-flow.md` Task 1 + Task 1.5** — the big one. 3 column adds + 10 code edits spanning 8 files + 1 RPC rewrite. **This is the `is_correct` fix**. Do not skip Task 1.5 — running Task 1 without 1.5 leaves the bug in place.

After Wave 1 commits, `calculate_results` will actually work — run it against one test submission and confirm `score > 0` before moving to Wave 2.

### 2.3 Gates between Wave 1 and Wave 2

- `npm run tsc` → 0 errors
- `npm run build` → 0 errors
- Manual test: call `calculate_results('<any-live-paper-id>')` → confirm scoring path produces non-zero scores for papers that have correct answers

**If any of these fail, stop.** Do not start Wave 2 until Wave 1 is verified end-to-end.

---

## 3. Wave 2 — Student v1 UI (the 3 ready plans)

**Goal:** Ship the entire student-facing surface of v1. These three plans are largely independent of each other after Wave 1 and can run in parallel if you have multiple engineers.

### 3.1 Plan 1 — `2026-04-14-student-profile.md` ✅

**8 tasks**, small in scope (one page, one component, one DB flip).

- Task 1 already done in Wave 1 (DB flip).
- Tasks 2–8 are pure TypeScript + Playwright.
- **No blockers.** Run independently.

**Critical step:** Task 6 (remove the dangling `Support` nav entry from `src/components/layout/student-sidebar.tsx`). Phase 1 audit confirmed the `HelpCircle` import on line 7 and the `Support` entry on line 21 — both must be removed.

**Gate:** `/verify-exam-flow` passes, Playwright 3 tests pass, sidebar shows no Support entry.

### 3.2 Plan 2 — `2026-04-14-student-results-flow.md` ✅

**18 tasks**, medium scope (list page + detail page + answer sheet + admin release card + Playwright).

- Task 1 already done in Wave 1 (DB adds + backfill).
- **Task 13 is critical for Wave 5**: drops the `submissions.dpm` column and removes all 3 readers (admin `results-client.tsx`, admin `results/page.tsx`, and the old student page which Task 5 replaces). Phase 5.9 locked this in.
- Task 11 creates a minimal `/admin/assessments/[id]/page.tsx` stub. Wave 4's `admin-results-redesign` plan will merge that stub into a richer per-paper page. Leave the TODO marker in place.
- **No blockers** apart from Wave 1 having landed.

**Gate:** `/verify-exam-flow` passes, 4 Playwright specs pass, student sees `got/total` format on every surface, zero DPM references in the codebase outside tests.

### 3.3 Plan 3 — `2026-04-14-student-assessment-taking-flow.md` ✅

**22 tasks + Task 1.5**, largest scope (entire assessment-taking experience — flash view, MCQ view, modals, auto-redirect).

- Task 1 + 1.5 already done in Wave 1.
- Tasks 2–22 are the `(student-focus)` route group, screens, RAF countdown hook, equation table component, controller reducer, Playwright.
- **This plan also owns the `(student-focus)` layout** — the `student-exams-tests-flow` lobby page will reuse this layout when that spec gets a plan. Do not delete or rename the group later.

**Bundle bug fix (NEW requirement from Phase 7):** Phase 6 flagged `/student/exams/[id]` at 248 kB. Root cause: the info page imports `@/components/exam/exam-page-client.tsx` which pulls in `AnzanFlashView`, `ExamVerticalView`, `CompletionCard`, and the Dexie offline store. The info page is a read-only preview — it should not load the engine.

**Fix:** split `exam-page-client.tsx` into two components:
- `ExamInfoCard` — lightweight read-only card (no engine imports). Used by `/student/exams/[id]/page.tsx`.
- `ExamTakerClient` — full engine controller. Used by `/student/assessment/[id]/page.tsx`.

Add this as **Task 22.5** to the assessment-taking plan during execution. Single commit. Verify with `npm run build` — `/student/exams/[id]` should drop from 248 kB to ~110 kB after the split.

**Gate:** `/verify-exam-flow` passes, all 4 Playwright specs (`student-focus-layout`, `per-question-timer`, `confirm-off`, `completion-auto-redirect`) pass, `/student/exams/[id]` First Load JS is ≤ 120 kB after the refactor.

### 3.4 Parallel execution of Wave 2

If you have two engineers:

- **Engineer A** takes `student-profile` (smallest, fastest) first, then `student-results-flow`.
- **Engineer B** takes `student-assessment-taking-flow` (biggest, runs throughout).
- **One engineer only:** run in the order listed above. `student-profile` is a warm-up, `student-results-flow` covers the results surface, `student-assessment-taking-flow` is the main lift.

---

## 4. Wave 3 — Admin v1 foundation (DB migrations + cron + storage)

**Goal:** Land every admin-side DB change and infrastructure prerequisite so the admin plans in Wave 4 can run without hitting "the column doesn't exist yet" walls. Can run in parallel with Wave 2 — no dependency on student UI landing first.

### 4.1 Ordered DB migrations

These are **not plans** — they are discrete SQL run books that should be landed before Wave 4 plans are written. Each one is 5–30 minutes of work.

| # | Migration | Source spec | Adds | Creates |
|---|---|---|---|---|
| 1 | Results-redesign schema | `2026-04-13-admin-results-redesign-design.md` §10 | `exam_papers.archived_at` (+ partial index) | `results_hub_counts` RPC, `results_hub_paper_stats` RPC |
| 2 | Create-assessment schema | `2026-04-13-admin-create-assessment-flow-design.md` §12 (post-Phase 2) | `exam_papers.scheduled_start_at`, `scheduled_end_at`, `max_attempts`, `time_limit_mode`, `randomize_questions`, CHECK constraint on `pass_percentage` | `assessment_defaults` table + RLS |
| 3 | Settings schema | `2026-04-13-admin-settings-design.md` §9 (post-Phase 2) | `institutions.primary_contact_email`, `primary_contact_phone`, `address` | `institution-logos` Supabase Storage bucket (manual creation via dashboard — see §9) |
| 4 | Levels RPC | `2026-04-13-admin-levels-flow-design.md` Query Budget (Phase 6) | — | `get_levels_with_counts(institution_id uuid)` RPC that returns levels joined with student and assessment counts in a single call |

### 4.2 Infrastructure: Vercel Cron

The create-assessment-flow spec §13.5 (post-Phase 2) requires a Vercel Cron job for automated status transitions:

1. Create `src/app/api/cron/assessment-scheduler/route.ts` — reads `CRON_SECRET` from env, verifies the `Authorization: Bearer ${CRON_SECRET}` header, runs two idempotent `UPDATE exam_papers SET ...` queries (open + close), writes `BULK_AUTO_OPEN` / `BULK_AUTO_CLOSE` activity logs.
2. Add to `vercel.json`:
   ```json
   {
     "crons": [
       { "path": "/api/cron/assessment-scheduler", "schedule": "*/5 * * * *" }
     ]
   }
   ```
3. Add `CRON_SECRET` to Vercel project env vars (Production scope only — Vercel Cron does not run on Preview).

**Verify:** deploy to preview, then check Vercel dashboard → Crons tab shows the job. Deploy to production, wait 5 minutes, check logs for a successful cron run with the expected `opened:0, closed:0` response (baseline, no work to do).

### 4.3 Storage bucket: `institution-logos`

**⚠️ Q8 from the audit — manual verification required.** Cannot be confirmed from SQL.

Steps:
1. Open Supabase dashboard → project `ahrnkwuqlhmwenhvnupb` → Storage
2. Check if `institution-logos` bucket exists
3. If not: create it with settings per admin-settings spec §9 (public, 2 MB file size limit, MIME whitelist `image/png image/jpeg image/svg+xml`, RLS policy scoped to `{institution_id}/` prefix for writes).
4. Record the creation timestamp in GOTCHAS.md.

### 4.4 Wave 3 gates

- 4 migrations applied via Supabase SQL editor. Each has a pre-flight + verification query per its source spec. **Do not skip the pre-flights.**
- Vercel Cron deployed and visible in the Vercel dashboard.
- Storage bucket exists and is writable by a test admin upload.
- `information_schema.columns` confirms every new column exists.
- `pg_proc` confirms every new RPC exists.
- GOTCHAS.md has 4 new entries (one per migration) + 1 for the storage bucket.

---

## 5. Wave 4 — Admin v1 UI (8 plans)

**Goal:** Write and execute implementation plans for the 8 admin specs that don't have plans yet. Each spec already has a Backend Dependencies section from Phase 3, so plan writing is faster than it would be otherwise — the dependency graph is pre-computed.

### 5.1 Plan-writing order (dependency-sorted)

Each arrow is a **hard ordering constraint** — the upstream plan's DB work and shared component work must exist before the downstream plan's implementation starts.

```
admin-dashboard ←── (pure read; depends on LIVE state existing)
       ↓
admin-students-flow ─────┐
       │                 │
       ↓                 ↓
admin-levels-flow ── uses admin-students-flow's CreateStudentDialog
       │
       ↓
admin-create-assessment-flow (THE BIG ONE — 5-step wizard)
       │
       ↓
admin-assessments-list (consumes scheduled_* and archived_at)
       │
       ↓
admin-live-monitor-flow (consumes LIVE state + realtime channels)
       │
       ↓
admin-results-redesign (consumes everything above + results-flow column adds)
       │
       ↓
admin-settings (consumes: activity log patterns + grade_boundaries editor)
```

### 5.2 Per-plan scope summary

| # | Plan to write | Est. tasks | Notable gotchas |
|---|---|---|---|
| 4.1 | `admin-dashboard` 🟨 | 8–10 | Read-only; depends on realtime `exam:{paperId}` channel namespace |
| 4.2 | `admin-students-flow` 🟨 | 15–18 | Includes the `updateStudent` runtime-bug cleanup already done in Phase 5 — plan must document the field list corrections. Q9 from Phase 5.5: `createStudent` at line 121 has same `cohort_id as unknown as string` smell — fix as part of this plan. |
| 4.3 | `admin-levels-flow` 🟨 | 10–12 | Query Budget section (Phase 6) requires the new `get_levels_with_counts` RPC from Wave 3 to avoid 1 + 2N round-trips. Reuses `CreateStudentDialog` with `lockedLevelId`. |
| 4.4 | `admin-create-assessment-flow` 🟨 ⚠️ | 25–30 | **The biggest plan in the project.** 5-step wizard with a new route group, per-step draft saves, Flash Config for TEST, question editor with COLUMNAR form (`option_a/b/c/d` — NOT JSON per Phase 4.3), and the `updateQuestion` action which doesn't exist yet (Phase 1 §4.1 gap — must be added). Plan should also consume the post-Phase-2 scheduled-vs-actual time model (§12.1) and the cron infrastructure from Wave 3. |
| 4.5 | `admin-assessments-list` 🟨 | 10–12 | Minimal work. Consumes `archived_at` from Wave 3 migration 1. |
| 4.6 | `admin-live-monitor-flow` 🟨 | 15–18 | Consumes `exam:{paperId}` Broadcast and `lobby:{paperId}` Presence from assessment-taking engine. Realtime-driven — 500 ms debounce per row (Phase 6 Query Budget). The `get_live_monitor_data` RPC exists and is used. |
| 4.7 | `admin-results-redesign` 🟨 | 18–22 | Depends on `submissions.total_questions` from student-results-flow (Wave 1). Merges with the minimal admin stub from student-results-flow Task 11 — plan must include "extend the existing page" not "create new". Includes the two new RPCs from Wave 3 migration 1. |
| 4.8 | `admin-settings` 🟨 | 12–15 | Depends on storage bucket (Wave 3) + 3 new columns (Wave 3 migration 3). Includes the grade boundaries editor — **Q5 from Phase 1 is still open** about the grade_boundaries schema duplication (3 columns for "grade letter", 3 for boundary, etc.). Plan must pick canonical columns before Step 1 runs. |

### 5.3 Plan-writing cost estimate

Each plan is ~500–2500 lines (the 3 existing plans average 1,700 lines). Writing 8 new plans is roughly 10,000–15,000 lines of documentation. This is **not one session**. Budget:

- **3 small plans** (dashboard, assessments-list, levels-flow) → 1 session each on standard Opus
- **4 medium plans** (students-flow, settings, live-monitor, results-redesign) → 1 session each on standard Opus
- **1 huge plan** (create-assessment-flow) → 1 session on Opus 1M + high effort. This plan is bigger than any existing one.

Total: ~8 sessions of plan writing before Wave 4 execution starts. Or: write the plans on-demand — one plan, one execution pass, next plan.

### 5.4 Wave 4 gates per plan

Each admin plan should end with the same verification gauntlet as the student plans:

- `npm run tsc` + `npm run lint` → 0 errors
- `npm run build` → 0 errors, no new route exceeds 300 kB First Load JS
- `/verify-admin-pages` passes
- Task-specific Playwright spec passes (each plan ships its own spec file)

**After all 8 admin plans ship, run `/verify-exam-flow` one more time** to confirm the student flow still works — admin work should never break the student path, but the sweep is cheap insurance.

---

## 6. Wave 5 — Polish + cleanup

**Goal:** Final cleanup pass before v1 ship. Nothing in this wave is functional work — it's debt retirement.

### 6.1 Items

| # | Item | Source | Effort |
|---|---|---|---|
| 5.1 | **Drop `submissions.dpm` column** | `student-results-flow.md` Task 13 (Phase 5.9 lock-in) | 30 min — runs after all 3 readers are gone |
| 5.2 | **`/student/exams/[id]` bundle refactor** | Phase 7 finding (§3.3 above) — split ExamPageClient | 1 hour — one commit |
| 5.3 | **`questions.correct_option SET NOT NULL`** | Phase 5.9 flag — 1 of 4 live questions has NULL, data cleanup required first | 30 min — admin fixes the bad question via the wizard, then ALTER runs |
| 5.4 | **Q5 — `grade_boundaries` schema cleanup** | Phase 1 §3.1 + Phase 1 §11.5 | 2 hours — pick canonical columns (recommend: `grade_name`, `min_percentage`, `assessment_type`), migrate `calculate_results` if it reads the orphans, drop the duplicates |
| 5.5 | **Q6 — `students.institution_id SET NOT NULL`** | Phase 1 §3.1 | 15 min — 1 ALTER after a pre-flight count check |
| 5.6 | **`dob` vs `date_of_birth` column dedup** | Phase 1 §3.1 + Phase 2 students-flow patch | 1 hour — backfill `date_of_birth ← dob` where needed, drop `dob` |
| 5.7 | **GOTCHAS.md consolidated update** | Every wave appends to GOTCHAS; Wave 5 re-reads the whole file for consistency | 30 min |
| 5.8 | **Post-ship `/verify-exam-flow` + `/verify-admin-pages` final sweep** | Per CLAUDE.md verification rules | 30 min |

### 6.2 Wave 5 gate — v1 ship checklist

Before deploying v1 to production, confirm every item:

- [ ] All 3 student plans executed, committed, verified
- [ ] All 8 admin plans executed, committed, verified
- [ ] All 4 Wave 3 migrations applied via SQL editor
- [ ] Vercel Cron job running successfully (5 min schedule)
- [ ] `institution-logos` bucket exists
- [ ] `calculate_results` produces non-zero scores on test submissions (confirms Wave 1.2 `is_correct` fix is live)
- [ ] `submissions.dpm` column is gone (Phase 5.9 decision applied)
- [ ] `/student/exams/[id]` First Load JS ≤ 120 kB (bundle refactor applied)
- [ ] `questions.correct_option IS NOT NULL` for every non-deleted question
- [ ] `grade_boundaries` schema cleaned (single canonical column set)
- [ ] `students.institution_id IS NOT NULL` for every non-deleted student
- [ ] `dob` column dropped; `date_of_birth` is canonical
- [ ] `npm run tsc` + `npm run lint` + `npm run build` → 0 errors each
- [ ] `/verify-exam-flow` → PASS
- [ ] `/verify-admin-pages` → PASS
- [ ] GOTCHAS.md is up to date

---

## 7. Risk register (top 10)

Ranked by v1-ship impact × likelihood. Mitigation notes point at the wave that handles each.

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| 1 | **Wave 1 `is_correct` fix doesn't land.** Every paper scores 0%. | Catastrophic — nothing works | Low — plan is specific | Wave 1.2 has an integration test (§2.3 gate) that calls `calculate_results` and verifies non-zero score. Do not advance without the gate. |
| 2 | **`questions.correct_option = NULL` for any live question after Wave 1.** `is_correct` defaults to FALSE for those questions, admin grades are lower than expected. | High — silent data issue | Low — 1 question known bad, easy to fix | Pre-flight check in Wave 5.3 must run before v1 ship. Admin must manually fix the bad question via the wizard. |
| 3 | **Create-assessment-flow plan scope creep.** It's already the biggest plan in the project; writing it conservatively could double Wave 4 timeline. | High — v1 timeline | Medium | Plan phase should explicitly scope to the 5 Phase 2 column adds + columnar question form + Vercel Cron + basic Step 3 editor. No TEST-specific Flash config polish until v2. |
| 4 | **Vercel Cron doesn't trigger in production.** Scheduled papers never go LIVE. | High — admin workflow broken | Medium — Cron is deploy-scope-only | Wave 3.2 gate: verify cron runs at least once in production with baseline output. Add Vercel Agent alert on 3 consecutive 500 responses from the route. |
| 5 | **`(student-focus)` route group ownership confusion.** Two specs (assessment-taking + exams-tests) mount lobby routes inside it. Conflict risk if both plans execute simultaneously. | Medium — merge conflict | Low | Phase 2 audit note locked ownership to assessment-taking plan. Exams-tests plan (Wave 4.something, when it ships) reuses without modifying. |
| 6 | **Admin-results-redesign merges with the stub from student-results-flow Task 11.** Route path conflict (`/admin/assessments/[id]` vs `/admin/results/[paperId]`). | Medium — route refactor | High — this spec has two proposed paths | Phase 2 recommendation: merge into single route at `/admin/assessments/[id]`. Confirm and document before the plan is written. |
| 7 | **Tiptap bundle leaks into non-announcement pages** if the create-assessment wizard's Step 3 question editor uses it. | Medium — bundle regression | Medium | Plan phase: pin the question editor to plain textareas, not rich text. Phase 6 build budget is 300 kB; wizard can't exceed it. |
| 8 | **Realtime channel naming mismatch between assessment-taking engine and admin-live-monitor.** Engine broadcasts on `exam:{paperId}`; monitor subscribes on the same namespace. Typo risk. | Medium — monitor silent | Low — both specs reference the same string | Live-monitor plan must import the channel name from a shared constant in `src/lib/realtime/channels.ts` (new file). Constants in one place. |
| 9 | **Offline queue RPC update (Task 1.5.7) contains a typo in the correct_option subquery.** Offline answers land with `is_correct = NULL` instead of the correct boolean. | High — silent data loss | Low — step has a manual validator | Step 1.5.8 has an offline-path test that catches this. Do not skip. |
| 10 | **Data quality issues with `grade_boundaries` duplicated columns** break `calculate_results` after Wave 5.4 cleanup. | Medium — admin grades shift | Low — change is scoped | Before dropping any grade_boundaries columns, read `calculate_results` body via `pg_get_functiondef`, confirm only the canonical columns are used, then drop. |

---

## 8. Critical path (single engineer, sequential)

If you have exactly one engineer and want the minimum wall-clock sequence to ship v1:

```
Day 1 — Wave 1: Foundation (all three Task 1s + Task 1.5)
                + verification test for calculate_results

Day 2–3 — Wave 2.1: student-profile plan execution
                  + student-results-flow Tasks 2–18 (parallel if possible with profile)

Day 4–7 — Wave 2.2: student-assessment-taking-flow plan execution (the big student plan)
                   + inline bundle refactor fix (Task 22.5)
                   + /verify-exam-flow sweep

Day 8 — Wave 3: All 4 admin migrations + Vercel Cron setup
              + institution-logos bucket creation
              + verify

Day 9–10 — Wave 4 plan-writing: admin-dashboard, admin-assessments-list, admin-levels-flow
                               (the 3 smallest plans)

Day 11 — Wave 4 plan execution: admin-dashboard, admin-assessments-list, admin-levels-flow

Day 12–14 — Wave 4 plan-writing: admin-students-flow, admin-settings, admin-live-monitor-flow,
                                admin-results-redesign (4 medium plans)

Day 15–18 — Wave 4 plan execution: 4 medium plans

Day 19–22 — Wave 4 plan-writing + execution: admin-create-assessment-flow
                                             (the biggest plan — Opus 1M)

Day 23 — Wave 5: drop dpm, fix bundle, fix correct_option NOT NULL,
               grade_boundaries cleanup, students.institution_id NOT NULL,
               dob/date_of_birth dedup

Day 24 — Ship checklist + final /verify sweeps
```

**23–24 days** of sequential single-engineer work. Parallelised across 2 engineers, the student track and admin track can overlap, compressing this to ~15 days.

**This estimate assumes no unknowns.** Every day Wave 4 spends blocked on a spec gap adds 0.5–1 day. The audit was designed to eliminate spec gaps so this estimate should hold.

---

## 9. Things this roadmap explicitly does NOT cover

- **Post-v1 features** — announcements, activity log, help & support (all dropped from v1 per `project-v1-scope.md`).
- **Rewrite of the question schema** — the dual columnar/JSON form is documented as canonical-columnar per Phase 4.3, but cleanup of the unused `options` and `correct_answer` JSON columns is **not** in this roadmap. Deferred to post-v1.
- **Supabase compute upgrade** — the load testing constraint from CLAUDE.md says Nano handles ~150 concurrent students; anything more requires upgrading to Small/Medium. **This is a deploy-time decision, not a code decision.** Flag for the user when scheduling the real launch.
- **Real email infrastructure** — the user explicitly dropped Help & Support (which would have needed email) from v1. No v1 feature needs outbound email. If that changes, Vercel AI Gateway or Resend marketplace can be added in one session.
- **Cross-institution features** — the entire data model is institution-scoped. Multi-tenancy for a single admin managing multiple institutions is out of scope.
- **Mobile-responsive pass** — every spec was written against desktop viewports. Mobile is a v2 concern.
- **Accessibility audit beyond WCAG AAA contrast tokens** — keyboard navigation, focus traps, screen reader testing are deferred.

---

## 10. How to use this roadmap

**For single-person development:** Execute Waves 1 → 2 → 3 → 4 → 5 in order. Use the `/day N` sequence in §8 as a working estimate. When a plan executes successfully, check the gate, commit, and move on.

**For two-person development:** Person A runs the student track (Waves 1 → 2 → 5.1–5.3), Person B runs the admin track (Waves 3 → 4 → 5.4–5.8). The two tracks only touch each other at Wave 5 for the final polish pass.

**For any unexpected blocker:** Stop, re-read the relevant audit doc section (Phase 1 findings, Phase 4 engine notes, Phase 5.9 question resolutions), and update the roadmap if a finding invalidates a wave. Do not silently work around the roadmap — update it and commit.

**If a plan's execution reveals a spec gap:** That's Phase 2 debt — patch the spec, commit the patch, then re-run the plan step. The audit philosophy has been "spec is the contract, code follows" throughout; maintain that discipline.

---

## 11. Summary one-pager

```
v1 SHIP ORDER:

Wave 1  Foundation
  ├── student-profile Task 1          roll_number NOT NULL
  ├── student-results-flow Task 1     4 column adds + backfill
  └── assessment-taking Task 1 + 1.5  3 cols + 10-file is_correct chain  🔴

Wave 2  Student UI (parallel-safe)
  ├── student-profile Tasks 2–8         8-task small plan
  ├── student-results-flow Tasks 2–18   18-task medium plan
  └── assessment-taking Tasks 2–22      22-task large plan
      + Task 22.5 (NEW) — bundle bug fix for /student/exams/[id]

Wave 3  Admin foundation
  ├── Migration 1: results-redesign (archived_at + 2 RPCs)
  ├── Migration 2: create-assessment (5 cols + CHECK + assessment_defaults)
  ├── Migration 3: settings (3 cols)
  ├── Migration 4: levels (get_levels_with_counts RPC)
  ├── Vercel Cron /api/cron/assessment-scheduler
  └── institution-logos storage bucket (manual)

Wave 4  Admin UI (8 plans to write + execute — dependency-ordered)
  1. admin-dashboard
  2. admin-students-flow
  3. admin-levels-flow
  4. admin-create-assessment-flow  ← biggest plan; Opus 1M session
  5. admin-assessments-list
  6. admin-live-monitor-flow
  7. admin-results-redesign (merge with results-flow stub)
  8. admin-settings

Wave 5  Polish
  ├── Drop submissions.dpm
  ├── questions.correct_option NOT NULL (after data fix)
  ├── grade_boundaries schema cleanup (Q5)
  ├── students.institution_id NOT NULL (Q6)
  ├── dob/date_of_birth dedup
  └── GOTCHAS.md final pass

GATE: /verify-exam-flow + /verify-admin-pages + ship checklist (§6.2)
```

**v1 ship is ~23 sequential days for one engineer, or ~15 days parallelised.** The critical path is gated on Wave 1.2 (the `is_correct` fix) — every downstream wave assumes that's landed. Verify before advancing.
