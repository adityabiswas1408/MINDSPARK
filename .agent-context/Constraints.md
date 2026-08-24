# Project Invariants & Operational Constraints

## Part 1: Product & Security Invariants

1. **RBAC Gate Pattern** `[VERIFIED]`
   - Every Server Action must invoke `requireRole()` at the top.
   - `getUser()` must be used to validate sessions; `getSession()` is banned for authorization decisions.
   - *Evidence:* `src/lib/auth/rbac.ts#L16-L35`

2. **Service Role Isolation** `[VERIFIED]`
   - `src/lib/supabase/admin.ts` (`adminSupabase`) must never be imported in client components (`'use client'`) or student route bundles.
   - *Evidence:* Grep confirmed `adminSupabase` only in server actions, server handlers, admin server components, and test mocks.

3. **Anzan Timing Purity** `[VERIFIED]`
   - `setTimeout` and `setInterval` are strictly banned inside `src/lib/anzan/`. All frame transitions must use delta-accumulated RAF timing.
   - *Evidence:* Grep across `src/lib/anzan/` returned 0 matches.

4. **Banned Colors** `[VERIFIED]`
   - Hex values `#FF6B6B`, `#121212`, `#1A1A1A`, `#E0E0E0` are disallowed across all UI files and stylesheets.
   - *Evidence:* Grep across `src/` returned 0 matches.

5. **Submission Upsert Conflict Target** `[VERIFIED]`
   - Submission upserts must explicitly target `{ onConflict: 'session_id,student_id' }`.
   - *Evidence:* `src/app/actions/assessment-sessions.ts#L255`.

6. **Additive-Only Migrations** `[VERIFIED]`
   - Applied migrations must never be edited or deleted retroactively. All database schema updates must be introduced as new numbered migration scripts in `supabase/migrations/`.
   - *Evidence:* Git log verified 0 deleted migration files, and per-file commit counts confirm exactly 1 commit for every file across all 27 migrations in `supabase/migrations/` (0 post-creation edits).

7. **Postgres Numeric Type Coercion** `[VERIFIED]`
   - Numeric and decimal outputs from Supabase should be wrapped in `Number(val ?? 0)` to handle string serialization safely. 
   - *Evidence:* Grep confirmed that across `results-client.tsx`, `dashboard/page.tsx`, and `students/[id]/page.tsx`, every read of `percentage` is strictly mapped as `Number(s.percentage)`.

8. **Server Action Data Validation** `[VIOLATED - PENDING FIX]`
   - All server actions must strictly validate input payloads using Zod schemas at runtime before mutating state.
   - *Evidence:* Audit revealed 0 Zod schemas in `src/app/actions/`. User input is currently completely trusted.

---

## Part 2: Workflow & Process Invariants

1. **Strict Scope Lock:** Work is limited strictly to fixing confirmed defects, implementing the 10-item roadmap, and completing the specced frontend. Zero unplanned features.
2. **Migration-Only DB Modifications:** Direct edits to the remote Supabase schema via dashboard/SQL without a local migration file are strictly banned.
3. **No Unapproved Git Push:** `git push` is never executed without explicit user instruction. All phase work is committed locally to dedicated branches.
4. **Clean Environment Isolation:** `.env` and `.env.local` files must never have credentials removed, corrupted, or exposed in commits.
5. **Terminal Evidence Requirement:** No task or test is marked "done" or "passing" without live command execution and actual output attached.
6. **Concise Context Files:** Keep context files trimmed, scannable, and up-to-date. Prune outdated claims rather than appending unbounded text.
7. **Gotchas Check:** Before starting any phase — recon, audit, or execution — read `GOTCHAS.md` in full. It documents confirmed process mistakes from earlier phases. This is mandatory and takes priority over assuming a prior recon pass was complete.
8. **Evidence before status change:** A finding's severity or resolution status never changes in the same edit that introduces the claim justifying it. The evidence gets pasted, reviewed, *then* the status changes as a separate, later edit.
9. **Gate questions get updated on every revision:** Any document ending in an approval question ("Do you approve moving to Phase N?") must have that question re-evaluated and corrected on every edit to the document — not just the findings above it.
10. **Reconciliation is all-or-nothing-visible:** When closing out a tracked list of items, every item gets an explicit status, not just the ones that got attention. Silent omission reads as "handled."
11. **No vague deferrals:** "Deferred to Phase N" is not a valid status — cite a real phase number that exists in `PHASE-PLAN.md`, or mark it explicitly unscheduled.
12. **Explicit status vocabulary:** Declared at the top of every phase document: `PROPOSED` → `APPROVED` → `EXECUTING` → `APPLIED` (has terminal evidence) → `VERIFIED` (independently reviewed) → `CLOSED`. State it plainly rather than leaving the reader to infer a document's stage from its prose tense.
13. **Static code review alone misses live-system facts:** Every phase's recon step includes at least one live-system check (DB query, actual render, actual run) alongside static review.
14. **Quick verifications finish inside the prompt that raises them:** If a check is flagged as fast (a grep, a single query), it gets done in that same run — not deferred. If it turns out not to be fast, that itself is new information worth stating, not a reason to silently punt.
