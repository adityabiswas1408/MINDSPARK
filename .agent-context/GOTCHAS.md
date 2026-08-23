# Project Process Gotchas & Runtime Lessons

> **MANDATORY READING BEFORE STARTING ANY PHASE.**  
> This file documents confirmed process and codebase mistakes from earlier phases.  
> Every entry identifies a concrete mechanism, recurrence risk, and a mechanical check to prevent repeat errors.

---

## Part 1: Process & Verification Mistakes (GOTCHA-00X)

### GOTCHA-001: Asymmetric Invariant Verification (Checking Deletions but Not In-Place Edits)
- **Category:** Evidence Standard
- **First observed:** Phase 1-2 Master Recon, 2026-08-23
- **What happened:** Invariant 6 in `Constraints.md` claimed applied migrations are strictly additive (never edited or deleted), citing `git log --diff-filter=D` (zero deletions) as proof, but did not check if existing migration files had multiple commits representing in-place edits.
- **Why it happened:** The verification command `git log --diff-filter=D` was treated as an operational proxy for "never modified." In git, deleting a file and modifying a file in-place produce completely distinct diff events; testing one does not test the other.
- **Recurrence risk:** High across later phases. For example, verifying "no unauthorized roles access an action" by only checking positive cases (`allowedRole`), or verifying "no secret leaks" by checking only `git status` instead of searching commit diffs.
- **How to catch it next time:** Test all components of a compound claim with dedicated commands. For migration immutability, run a per-file commit count check:
  ```bash
  for f in supabase/migrations/*.sql; do n=$(git log --oneline --follow -- "$f" | wc -l); [ "$n" -gt 1 ] && echo "MODIFIED: $f ($n commits)"; done
  ```
- **Status:** Fixed this phase

---

### GOTCHA-002: Unpinned Dependency Citation Blindness (`latest` Passed Through as Pinned Version)
- **Category:** Evidence Standard
- **First observed:** Phase 1-2 Master Recon, 2026-08-23
- **What happened:** `Architecture.md` cited `Tailwind CSS latest` and `Dexie latest` in the stack summary table directly alongside exact semver versions (like `Vitest v4.1.2`), treating `"latest"` as a benign version string rather than flagging it as an unpinned, non-reproducible dependency risk.
- **Why it happened:** Surface inspection of `package.json` extracted dependency values verbatim without validating whether each value satisfied the invariant of a deterministic, pinned semver range versus an open-ended tag.
- **Recurrence risk:** Could recur in Phase 5 (Next.js upgrade) or Phase 8 (E2E & test setup) when adding new testing tools, UI libraries, or plugins without enforcing locked versions.
- **How to catch it next time:** Run `npm list --depth=0` to extract actual installed versions and audit `package.json` dependencies with `grep -rn '"latest"' package.json`. Any occurrence must be flagged as an open dependency risk.
- **Status:** Fixed this phase

---

### GOTCHA-003: Partial Historical Item Reconciliation (Dropping Unresolved Tasks from Scope)
- **Category:** Scope Coverage
- **First observed:** Phase 1-2 Master Recon, 2026-08-23
- **What happened:** Master Recon reconciled 2 items from the 5-item "Immediate Next Steps" list in `ai_onboarding_brief.md` (the `/api/sync` rogue route and `/admin/` prefixes) but left the remaining 3 items (Vitest unit tests status, Playwright E2E configuration status, zero broken runtime paths) completely untracked in `Decisions.md`.
- **Why it happened:** The recon focused on closing false/active defects and stopped once the immediate blockers were addressed, rather than completing a 1:1 line-item audit of the entire input checklist.
- **Recurrence risk:** When inheriting multi-item checklists in Phase 1-2 audit, Phase 8 pre-launch gates, or Phase 9 roadmap tasks, items that are "partially done" or "in progress" could be silently omitted from handover logs.
- **How to catch it next time:** When reconciling an N-item checklist, enforce a strict 1-to-1 cardinality rule: count the input items, output exactly N structured reconciliation records (`Resolved`, `Partially Resolved`, or `Still Open`), and assert that `count(output) == count(input)`.
- **Status:** Fixed this phase

---

### GOTCHA-004: Missing Temporal Metadata on Decision Records
- **Category:** Process Gate
- **First observed:** Phase 1-2 Master Recon, 2026-08-23
- **What happened:** DEC-001 through DEC-005 in `Decisions.md` were recorded without explicit `Date:` fields.
- **Why it happened:** The initial decision schema was defined informally (`What / Why / Status`) without a required timestamp, making it impossible to determine sequence or age when reviewing the log in future sessions.
- **Recurrence risk:** Decisions added in later phases (Phase 3 through Phase 9) could lose chronology, complicating rollback decisions or retrospective audits.
- **How to catch it next time:** Enforce a strict markdown schema lint for every new entry in `Decisions.md`: all entries must have `Date: YYYY-MM-DD`, `What:`, `Why:`, and `Status:`.
- **Status:** Fixed this phase

---

### GOTCHA-005: High-Risk Subsystem Omission in Safety Procedures
- **Category:** Scope Coverage
- **First observed:** Phase 1-2 Master Recon, 2026-08-23
- **What happened:** `Rollback.md` §2 listed Timing Engine, Anti-Cheat, and Auth & RBAC as high-risk subsystems requiring safety tags before edits, but omitted the Offline Sync Pipeline (`src/app/api/submissions/offline-sync/`, staging table, and DB migration RPC).
- **Why it happened:** Subsystem classification focused on frontend client-side engines (timing, tabs) and core auth, overlooking the complex offline-to-online staging RPC and cryptographic HMAC boundary.
- **Recurrence risk:** In Phase 7 (Offline sync & Dexie refactor), edits could be made to the offline synchronization pipeline without a prior rollback safety tag checkpoint.
- **How to catch it next time:** Maintain an explicit registry of critical, state-mutating subsystems in `Constraints.md` and ensure `Rollback.md` references the complete registry.
- **Status:** Fixed this phase

---

## Part 2: Codebase Runtime Gotchas

## Database

### Live DB ≠ Migration files
Columns added via SQL editor don't appear in migrations. Always verify with `information_schema.columns`.
**Known live divergences (Confirmed):**
- `submissions.paper_id` — in live DB, not in migrations
- `submissions.dpm` — in live DB, not in migrations
- `submissions.percentage` — in live DB, not in migrations
- `submissions.total_questions` — in live DB, not in migrations (Supersedes `percentage`/`dpm` on the read path)
- `students.roll_number` — NOT NULL in live DB, nullable in migrations
- `students.date_of_birth` — in live DB (duplicates `dob`), not in migrations
- `exam_papers.answer_key_released` (and `_at`, `_by`) — in live DB, not in migrations
- `exam_papers.per_question_time_seconds` — in live DB, not in migrations
- `exam_papers.require_answer_confirmation` — in live DB, not in migrations
- `student_answers.time_spent_ms` — in live DB, not in migrations

*(Note: The old claim that `percentage` and `dpm` are active read-path fields is superseded. `total_questions` is the active denominator; `percentage` and `dpm` are orphaned on the read path but remain in the DB.)*

### Supabase numeric → JS string
Postgres `NUMERIC` columns come back as strings from the Supabase JS client. Always wrap with `Number()` before arithmetic or display:
```ts
Math.round(Number(row.percentage ?? 0))
```

### Composite unique indexes
The `submissions` table has a composite unique index: `(session_id, student_id)`.
Upserts must list ALL columns: `onConflict: 'session_id,student_id'`.
Using only `'session_id'` causes a silent no-op.

### Zero-row UPDATEs are silent
Supabase does not error on `UPDATE` that matches 0 rows. Always run `SELECT` with the same `WHERE` first to verify row count.

### Enum/status casing is exact
Check constraints are case-sensitive. `'active' ≠ 'ACTIVE'`.

### No FK constraint on submissions.paper_id
`paper_id` was added manually to `submissions` — no foreign key exists. Supabase JS join syntax `exam_papers(...)` in `.select()` will fail. Use a two-query pattern instead:
1. Fetch `submissions`, collect `paper_ids`.
2. Fetch `exam_papers` with `.in('id', paperIds)`.

### assessment_sessions.status values
Exact values: `'scheduled' | 'active' | 'completed' | 'cancelled'`. All lowercase. NOT `'LIVE'` or `'ACTIVE'`.
- `assessment_sessions.status = 'active'` (lowercase)
- `exam_papers.status = 'LIVE'` (uppercase)

### updateStudent silently ignores status field
`updateStudent()` TypeScript interface has a `status` field, but the Supabase update does NOT write it to DB. Suspend must call `deactivateStudent()` — which sets `deleted_at`.

### levels.sequence_order not sort_order
Column is `sequence_order` (integer). UNIQUE constraint on `(institution_id, sequence_order)`. Parallel swap of two values fails — use two-phase offset update (+1000 then target).

### activity_logs uses timestamp not created_at
`ORDER BY timestamp DESC` — not `created_at`. `activity_logs` has no `created_at` column.

### grade is free-form text — no enum constraint
No check constraint on `submissions.grade`. Null grades must be filtered before stats/charts:
`WHERE grade IS NOT NULL AND completed_at IS NOT NULL`.

### app.hmac_secret cannot be set via ALTER DATABASE
Pass secret as `p_secret` TEXT parameter to RPC instead of using `current_setting()`.

### Supabase Nano compute hard limits
Max 200 concurrent client connections (fixed at Nano tier; `max_connections = 60` for direct Postgres). Safe concurrent students at Nano: ~150. PgBouncer is active at Nano — not the bottleneck.

### exam_papers and assessment_sessions in realtime
`assessment_sessions` and `student_answers` manually added to `supabase_realtime` publication. *(Note: `exam_papers` is missing from the realtime publication in the current live DB).*

---

## CSS / Layout

### overflow:auto creates a fixed-position trap
Any ancestor with `overflow:auto` or `hidden` traps `position:fixed` children in Chrome. Fix: `createPortal(content, document.body)`.

### Tailwind inset-0 can fail to resolve
After a portal, Tailwind class `inset-0` may not compute to `top:0, left:0`. Fix: replace with explicit inline styles:
```tsx
style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
```

### z-index alone is not enough
A parent with `transform`, `filter`, `will-change`, or `overflow` creates a new stacking context that traps children regardless of z-index. Use `createPortal`.

### Two styling systems coexist — root cause of drift
- Admin pages: Tailwind utility classes + shadcn tokens.
- Student pages: raw inline `style={{}}` with hex values.
No shared token usage. Fix: migrate inline hex values to `var(--token)` refs.

### Design tokens defined but not consumed
`globals.css` defines `--clr-green-800`, `--radius-card`, etc. Components hardcode `#1A3829` inline. Before writing any colour value: check `globals.css` first.

### Tailwind v4 opacity variants unreliable
`text-white/80` and similar opacity variants may not compile in Tailwind v4 depending on `@theme` inline config. Use inline style or CSS variable.

---

## React / Next.js

### Recharts Tooltip formatter type
Don't annotate the value parameter as number: `formatter={(value: number) => ...}` throws TS error. `ValueType` is `number | string | undefined`. Use `formatter={(value) => [`${value}%`, 'Score']}`.

### Recharts requires 'use client' + next/dynamic
Recharts accesses `window` on import — crashes SSR. Always load chart components with `dynamic(() => import('./chart'), { ssr: false })`.

### Server Component buttons have no onClick
Buttons in Server Components render as static HTML. Interactivity requires `'use client'` or a form action.

### Phase strings are exact constants
Never use bare strings (e.g. `'FLASH'`) — always use the constant (e.g. `PHASE_2_FLASH`), otherwise it breaks the phase guard.

### TipTap must load via next/dynamic ssr:false
TipTap accesses browser APIs on import — crashes SSR.

### Recharts ResponsiveContainer needs explicit height
Without explicit height on parent div, renders at 0px. Always wrap in `<div style={{ height: 280 }}><ResponsiveContainer width="100%" height="100%">`.

---

## Skills / MCP / Tooling

### code-review-graph build hangs
The graph build stalls at ~4050/46502 files consistently. If build stalls on the same file twice, abort. Do not retry. Continue the task without the graph.

### sentence-transformers embeddings never worked
`semantic_search_nodes` falls back to text search. Do not spend session time trying to fix embeddings.

### Vercel CLI is not installed
`vercel env pull`, `vercel deploy`, `vercel logs` won't work in terminal. Deployments go via git push → Vercel GitHub integration.

---

## Patterns That Burned Us

### Don't debug before checking your own changes
Before diagnosing any build error: `git diff HEAD~1 --name-only`. Revert first, confirm clean build, then add new fixes.

### assessment_sessions requires cohort_id + scheduled_at
Creating a test session via SQL requires both (`cohort_id` and `scheduled_at = NOW()`).

### result_published_at gate requires completed_at too
The results page query filters `completed_at IS NOT NULL`. Test submissions created directly in DB won't appear unless both are set.

### Supabase JS join syntax requires a FK constraint
`exam_papers(...)` nested select only works if a FK exists.

---

## Fake Data Landmines
*Verified hardcoded values shipping as real data. Fix before deployment to real students.*

- `student/dashboard/page.tsx` — "Progress to next level 42%" is a hardcoded literal, not a DB query
- `student/dashboard/page.tsx` — Skill Metrics `{Logical Reasoning: 88, Speed: 64, Accuracy: 92}` are a module-level const — not from DB
- `levels-client.tsx` — "Avg Competencies: 0" and "Curriculum Density: —" are hardcoded literals
- `announcements-client.tsx` — "Engagement Insights: 25% higher read rate" is hardcoded marketing copy
- `settings-client.tsx` — Auto-archive toggle has no DB column backing (comment in file confirms this)

*Rule: before rendering any number, percentage, or toggle, verify it is backed by a DB column or computation.*

---

## HMAC and Security

### HMAC_SECRET cannot be read back from Vercel CLI
Encrypted env vars return empty string via CLI pull. Set manually in Vercel dashboard and in DB via `p_secret` RPC parameter approach.

### k6 scripts use batch_timestamp not hmac_timestamp
The offline-sync route reads `batch_timestamp` field. Always use `batch_timestamp` in test payloads. `question_id` must be valid UUID.

---

## Broken Triggers

### LIVE BUG: student_answers.update_student_answers_modtime is broken
The trigger `update_student_answers_modtime` runs `update_modified_column()` which sets `NEW.updated_at = NOW()` — but `student_answers` has NO `updated_at` column. Every `UPDATE` on `student_answers` errors with `ERROR 42703: record "new" has no field "updated_at"`.

*Implications:*
- All existing INSERTs via `ON CONFLICT ... DO NOTHING` were fine because DO NOTHING skips the UPDATE path.
- Any `ON CONFLICT ... DO UPDATE` or standalone `UPDATE student_answers` fails silently in production (or loudly when tested).
- When running a backfill, wrap the UPDATE in `ALTER TABLE student_answers DISABLE TRIGGER update_student_answers_modtime;`.
