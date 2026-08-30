# MINDSPARK Master Phase Plan

> **Authoritative Phase Execution Roadmap**
> Generated from empirical Master Recon findings on 2026-08-23.
> Governed by strict scope lock, terminal verification gates, and branch-per-phase safety protocols.

---

## Global Phase Execution Protocol

Before starting **any** phase:

1. Create and checkout a dedicated working branch: `phase-<N>-<slug>`.
2. Read `.agent-context/GOTCHAS.md` (mandatory), `.agent-context/Handover.md`, `.agent-context/Architecture.md`, and `.agent-context/Constraints.md`.
3. Check `.env.local` integrity.

Upon concluding **any** phase:

1. Run `npm run tsc` (must be 0 errors) and `npm run test` (all tests green).
2. Update `.agent-context/Handover.md` and any relevant `.agent-context/` files with empirical evidence.
3. Commit locally. Never `git push` without explicit user permission.

---

## Phase Matrix

| Phase           | Goal                                                      | Primary Skill(s)                                                                                                                                             | Exit Gate                                                    |
| :-------------- | :-------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **1–2**  | Recon + Ranked Deep Audit                                 | `project-takeover-recovery` (`.agents/skills/project-takeover-recovery/SKILL.md`), `codebase-onboarding`, `ponytail-audit`, `inherit-legacy-style` | `extensive_codebase_audit.md` produced, user sign-off      |
| **3**     | Critical Security & Data Fixes                            | `systematic-debugging` (`.agents/skills/systematic-debugging/SKILL.md`), `karpathy-guidelines`, `tdd-workflow`                                       | `tsc` 0 errors, security tests pass, `.env` diffed clean |
| **4**     | Admin Announcements TipTap Editor                         | `writing-plans`, `minimalist-ui`                                                                                                                         | **CLOSED**                                             |
| **5**     | Next.js Upgrade (15 → 16.3+)                             | `search-dependencies`, `verification-before-completion`                                                                                                  | **CLOSED**                                             |
| **6**     | Core Engine Hardening (Timing & Anti-Cheat)               | `karpathy-guidelines`, `tdd-workflow`                                                                                                                    | Timing engine <5ms jitter verified, clock guard green        |
| **7**     | State & Storage Refactor (Dexie & Hydration)              | `inherit-legacy-style`, `ponytail-audit`                                                                                                                 | Local storage sync & state lifecycles verified               |
| **8**     | Test Suite Completion & E2E Setup                         | `tdd-workflow` (`.agents/skills/tdd-workflow/SKILL.md`)                                                                                                  | Vitest unit + Playwright E2E smoke tests green               |
| **9.1**   | Feature: Submit → Completion Screen Flow                 | `writing-plans`, `tdd-workflow`, `minimalist-ui`                                                                                                       | Live exam submission redirects to completion screen          |
| **9.2**   | Feature: Student Results View (`/student/results/[id]`) | `writing-plans`, `minimalist-ui`                                                                                                                         | Verified score & breakdown display with correct RBAC         |
| **9.3**   | Feature: Admin Results Publish Flow                       | `writing-plans`, `tdd-workflow`                                                                                                                          | Batch publish action transitions exam status cleanly         |
| **9.4**   | Feature: Wire "Create Level" Dialog & Action              | `writing-plans`, `minimalist-ui`                                                                                                                         | Level creation persists to DB and updates table              |
| **9.5**   | Feature: Admin Students Roster Table                      | `writing-plans`, `minimalist-ui`                                                                                                                         | Roster search, pagination, and student profile drawer        |
| **9.6**   | Feature: Admin Realtime Live Monitor Table                | `writing-plans`, `tdd-workflow`                                                                                                                          | Presence/broadcast state updates live during active test     |
| **9.7**   | Feature: Admin Dashboard Charts (Recharts)                | `writing-plans`, `design-taste-frontend`                                                                                                                 | Dynamic aggregate metrics & charts render smoothly           |
| **9.8**   | Orphaned Code & Audit-Identified Defect Cleanup           | `systematic-debugging`, `full-output-enforcement`                                                                                                        | Verified working routes, dead code removed                   |
| **9.9**   | Feature: Admin Settings Forms                             | `writing-plans`, `minimalist-ui`                                                                                                                         | Institution profile & timing settings save cleanly           |
| **9.10**  | Feature: Admin Activity Log Audit Trail                   | `writing-plans`, `minimalist-ui`                                                                                                                         | Security & exam events filterable by type and user           |
| **Final** | Staging Deployment & 5-Gate Checklist                     | `verification-before-completion`                                                                                                                           | 5-gate pre-launch checklist verified, staging live           |

---

## Detailed Phase Breakdown

### Phase 1–2: Reconnaissance + Ranked Deep Audit

- **Goal:** Exhaustive scan of the full codebase, database schemas, and client components to produce a prioritized defect and optimization catalog.
- **Entry Criteria:** Phase Plan approved by user.
- **Skills:**
  - `project-takeover-recovery` (`.agents/skills/project-takeover-recovery/SKILL.md`)
  - `codebase-onboarding` (`.agents/skills/codebase-onboarding/SKILL.md`)
  - `ponytail-audit` (`.agents/skills/ponytail-audit/SKILL.md`)
  - `inherit-legacy-style` (`.agents/skills/inherit-legacy-style/SKILL.md`)
- **Context Files:**
  - *Reads:* `.agent-context/Handover.md`, `.agent-context/Architecture.md`, `.agent-context/Constraints.md`
  - *Updates:* `.agent-context/Handover.md`, `.agent-context/Decisions.md`
- **Exit Gate:** Production of `extensive_codebase_audit.md` with user sign-off.

---

### Phase 3: Critical Security & Data Fixes

- **Goal:** Resolve any authorization gaps, validate server actions input boundaries with Zod, and ensure numeric wrapper compliance.
- **Entry Criteria:** Phase 1–2 audit findings signed off.
- **Skills:**
  - `systematic-debugging` (`.agents/skills/systematic-debugging/SKILL.md`)
  - `karpathy-guidelines` (`.agents/skills/karpathy-guidelines/SKILL.md`)
  - `tdd-workflow` (`.agents/skills/tdd-workflow/SKILL.md`)
- **Context Files:**
  - *Reads:* `.agent-context/Constraints.md`, `.agent-context/Architecture.md`
  - *Updates:* `.agent-context/Handover.md`, `.agent-context/traces/`
- **Exit Gate:** `npm run tsc` passes with 0 errors, security tests pass, `.env` verified intact.

---

### Phase 4: Admin Announcements TipTap Editor

- **Goal:** Integrate TipTap WYSIWYG editor for admin announcements, ensuring it loads safely without SSR crashes.
- **Entry Criteria:** Phase 3 complete and clean.
- **Skills:**
  - `writing-plans` (`.agents/skills/writing-plans/SKILL.md`)
  - `minimalist-ui` (`.agents/skills/minimalist-ui/SKILL.md`)
- **Context Files:**
  - *Reads:* `.agent-context/Handover.md`, `.agent-context/GOTCHAS.md`
  - *Updates:* `.agent-context/Handover.md`
- **Exit Gate:** **CLOSED** (Rich text formatted announcements can be created, saved securely, and displayed correctly)
- **Deferred Items:**
  - **Teacher Route & UI:** Scaffold the `(teacher)` route group and teacher-facing announcements UI.
  - **DEC-010 Re-scope:** Re-evaluate the `adminSupabase` bypass for dashboard aggregates once RLS boundaries settle before Phase 6+.
  - **Migration Reconciliation:** Reconcile the local Docker migration history with the two remote-only MCP migrations (`20260824000000`, `20260825000000`).

---

### Phase 5: Next.js Upgrade (15 → 16.3+)

- **Goal:** Upgrade Next.js to 16.3+ and verify compatibility with React 19 and Tailwind v4 ahead of the 2026-10-21 deadline.
- **Entry Criteria:** Clean baseline on Phase 4.
- **Skills:**
  - `search-dependencies` (`.agents/skills/search-dependencies/SKILL.md`)
  - `verification-before-completion` (`.agents/skills/verification-before-completion/SKILL.md`)
- **Context Files:**
  - *Reads:* `.agent-context/Architecture.md`
  - *Updates:* `.agent-context/Architecture.md`, `.agent-context/Decisions.md`, `.agent-context/Handover.md`
- **Exit Gate:** `npm run build`, `npm run tsc`, and `npm run test` green on Next.js 16.3+.

---

### Phase 6: Core Engine Hardening (Timing Engine & Anti-Cheat)

- **Goal:** Verify microsecond accuracy of the Flash Anzan engine, eliminate any frame jitter, and test tab-teardown/clock-guard edge cases.
- **Entry Criteria:** Phase 5 complete.
- **Skills:**
  - `karpathy-guidelines` (`.agents/skills/karpathy-guidelines/SKILL.md`)
  - `tdd-workflow` (`.agents/skills/tdd-workflow/SKILL.md`)
- **Context Files:**
  - *Reads:* `.agent-context/Architecture.md`, `.agent-context/Constraints.md`
  - *Updates:* `.agent-context/Handover.md`, `.agent-context/Flow.md`
- **Exit Gate:** Engine tests green, timing jitter verified <5ms.

---

### Phase 7: State & Storage Refactor (Dexie & Offline Sync)

- **Goal:** Audit IndexedDB schema migrations in Dexie, eliminate hydration mismatches, and verify offline-to-online submission batching.
- **Entry Criteria:** Phase 6 complete.
- **Skills:**
  - `inherit-legacy-style` (`.agents/skills/inherit-legacy-style/SKILL.md`)
  - `ponytail-audit` (`.agents/skills/ponytail-audit/SKILL.md`)
- **Context Files:**
  - *Reads:* `.agent-context/Architecture.md`
  - *Updates:* `.agent-context/Handover.md`, `.agent-context/Flow.md`
- **Exit Gate:** Offline sync and staging queue tests passing.

---

### Phase 8: Test Suite Completion & E2E Smoke Tests

- **Goal:** Add missing Vitest unit tests (reaching full coverage on actions/helpers) and configure Playwright E2E smoke tests.
- **Entry Criteria:** Phase 7 complete.
- **Skills:**
  - `tdd-workflow` (`.agents/skills/tdd-workflow/SKILL.md`)
- **Context Files:**
  - *Reads:* `.agent-context/Architecture.md`, `.agent-context/Constraints.md`
  - *Updates:* `.agent-context/Handover.md`
- **Exit Gate:** Full Vitest suite green + Playwright smoke test passes in headless browser.

---

### Phase 9+: Roadmap Features (Execution Prompts Generated Just-in-Time)

- **Phase 9.1:** Exam Submit → Completion Screen (`writing-plans`, `tdd-workflow`, `minimalist-ui`)
- **Phase 9.2:** Student Results Page (`writing-plans`, `minimalist-ui`)
- **Phase 9.3:** Admin Results Publish Flow (`writing-plans`, `tdd-workflow`)
- **Phase 9.4:** Wire "Create Level" Button (`writing-plans`, `minimalist-ui`)
- **Phase 9.5:** Admin Students Table (`writing-plans`, `minimalist-ui`)
- **Phase 9.6:** Admin Monitor Realtime Table (`writing-plans`, `tdd-workflow`)
- **Phase 9.7:** Admin Dashboard Charts (`writing-plans`, `design-taste-frontend`)
- **Phase 9.8:** Orphaned Code & Audit-Identified Defect Cleanup (`systematic-debugging`, `full-output-enforcement`)
- **Phase 9.9:** Admin Settings Forms (`writing-plans`, `minimalist-ui`)
- **Phase 9.10:** Admin Activity Log Table (`writing-plans`, `minimalist-ui`)
- **Phase 9.11:** Feature: Scaffold Teacher Route & UI (`writing-plans`, `minimalist-ui`)

---

### Final Phase: Staging Deployment & Handover

- **Goal:** Execute full 5-gate pre-launch checklist, deploy to staging, run end-to-end verification, and complete operational handover.
- **Skills:** `verification-before-completion` (`.agents/skills/verification-before-completion/SKILL.md`).
- **Exit Gate:** Staging deployment healthy, all 5 gates passed.

# PHASE 9 — Prerequisites & Standing Counter-Measures

## Status

Phase 8 is CLOSED. One consolidated, unfiltered `npx vitest run` showed
13 test files / 71 tests passing, including `cross-tenant-isolation.test.ts`
and the real Dexie migration test together with no cross-file interference.
Phases 1 through 8 are all closed. Entry criteria for Phase 9 are met per
PHASE-PLAN.md.

Per the plan, Phase 9 is 11 independent feature slices (9.1-9.11), each
with its own skills and exit gate, generated "just-in-time" — this prompt
is the shared setup, not a specific feature. The specific 9.x prompt gets
written when you're ready to start that feature.

## Standing Counter-Measures (apply to every Phase 9.x prompt from here on)

These are drawn directly from real failures that happened across Phases
5-8 of this project. Each one caused real rework. They are not
hypothetical — treat them as hard rules, not suggestions.

1. **Scope Lock.** Do only what the current prompt's task list says. If you
   discover something else that needs fixing, name it and stop — don't
   implement it. (Phase 5.3b shipped a full anti-cheat system and a live
   database migration when only two narrow verification items were asked
   for.)
2. **Audit Before Fix, In Order.** If a prompt has a Part A (inventory) and
   Part B (fix), Part A's findings must be shown and can't be skipped —
   even if you're confident you already know the answer. (Phase 7's first
   walkthrough skipped the audit entirely and silently dropped a third of
   the phase's actual goal as a result.)
3. **Evidence Is Pasted, Not Narrated.** Every claim — "already covered,"
   "fixed," "passes," "no issue found" — needs the actual raw command
   output, file content, or query result in the response. A sentence
   describing what you did is not evidence of it. (This has been violated
   repeatedly — Phase 5.3's doc updates, Phase 8's first walkthrough with
   zero raw output for four separate claims.)
4. **No Full-File Overwrites on Existing Test Files.** Never replace an
   existing test file wholesale (`cat << EOF >`, or equivalent). Edit
   incrementally. If a full rewrite is genuinely necessary, paste the
   original file's test list first and explicitly confirm each one is
   still represented in the new version. (This silently deleted 5
   previously-verified Zod validation tests in Phase 8 before being
   caught and restored.)
5. **"Already Validated" Requires Re-Confirmation.** Never justify skipping
   something because a prior phase already covered it, without first
   confirming that thing still exists and still runs right now. (A test
   file confidently described as passing in Phase 7b turned out to never
   have existed on disk at all — discovered two phases later.)
6. **External-Blame Requires Independent Proof.** If something fails and
   the explanation is "the remote service / infrastructure is the
   problem," that explanation needs direct, out-of-band verification (a
   raw curl against the actual endpoint, a standalone script) before it's
   accepted — not narrative reasoning alone. (An auth hang was blamed on
   Supabase rate-limiting and GoTrue infrastructure across three separate
   rounds before a direct curl call proved it was actually a local jsdom
   environment bug the whole time.)
7. **No Silent Test Exclusion.** Any `-t` filter, `.skip`, file rename, or
   other exclusion used during iteration must be explicitly disclosed, and
   the final baseline for any phase must be one full run with nothing
   filtered out. (`-t "(?!Cross-Tenant Isolation)"` was used through
   nearly an entire phase's debugging session without being surfaced.)
8. **Exact-Match Assertions for Absence Claims.** When a test's entire
   purpose is proving something is NOT happening (a secret not leaking, a
   value not present), use exact-match assertions
   (`toHaveBeenCalledWith(exactArgs)`), not partial matchers
   (`objectContaining`) that would still pass even if the bad thing crept
   back in.

## Required Setup (Global Protocol, per PHASE-PLAN.md)

1. Create and checkout a dedicated branch per feature:
   `phase-9.<N>-<slug>` (e.g. `phase-9.1-submit-completion-flow`).
2. Read `.agent-context/GOTCHAS.md` (mandatory), `.agent-context/Handover.md`,
   `.agent-context/Architecture.md`, `.agent-context/Constraints.md`.
3. Confirm `.env.local` integrity.
4. Paste the starting `npm run tsc` / `npm run test` baseline before any
   change, for that specific feature's branch.

## Phase 9 Feature Menu (per PHASE-PLAN.md, skills noted)

- 9.1 Submit → Completion Screen Flow — `writing-plans`, `tdd-workflow`, `minimalist-ui`
- 9.2 Student Results View — `writing-plans`, `minimalist-ui`
- 9.3 Admin Results Publish Flow — `writing-plans`, `tdd-workflow`
- 9.4 "Create Level" Dialog & Action — `writing-plans`, `minimalist-ui`
- 9.5 Admin Students Roster Table — `writing-plans`, `minimalist-ui`
- 9.6 Admin Realtime Live Monitor Table — `writing-plans`, `tdd-workflow`
- 9.7 Admin Dashboard Charts (Recharts) — `writing-plans`, `design-taste-frontend`
- 9.8 Orphaned Code & Defect Cleanup — `systematic-debugging`, `full-output-enforcement`
- 9.9 Admin Settings Forms — `writing-plans`, `minimalist-ui`
- 9.10 Admin Activity Log Audit Trail — `writing-plans`, `minimalist-ui`
- 9.11 Teacher Route & UI Scaffold — `writing-plans`, `minimalist-ui`

Each individual 9.x prompt will explicitly invoke its listed skill(s), per
your standing preference, plus the 8 counter-measures above.

## Exit Gate for This Prerequisites Step

- [ ] Confirm which 9.x feature to generate the actual execution prompt for first
