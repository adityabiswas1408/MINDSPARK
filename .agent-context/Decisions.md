# Architecture & Project Decisions Log

> Running chronological log of architectural and operational decisions. Newest entries at the bottom.
> **Required Entry Schema:** `Date`, `What`, `Why`, `Status`.

---

### DEC-001: Maintain Existing Tech Stack
- **Date:** 2026-08-23
- **What:** Retain Next.js App Router, Supabase (PostgreSQL + Auth + Realtime), Tailwind CSS v4, Dexie 4, and Vitest.
- **Why:** Existing baseline is solid with 27 migrations applied and 49 tests passing; rewriting would discard working anti-cheat and timing logic.
- **Status:** APPROVED & ACTIVE

---

### DEC-002: Next.js Upgrade Target Scheduled
- **Date:** 2026-08-23
- **What:** Plan Next.js 15 → 16.3+ upgrade before the hard deadline of 2026-10-21.
- **Why:** Avoid deprecation and ensure long-term framework maintenance.
- **Status:** SCHEDULED (Targeted for early dedicated Phase 5)

---

### DEC-003: Project Approach — Refactor & Finish (Scope Lock)
- **Date:** 2026-08-23
- **What:** Follow "Refactor & Finish" strategy with strict scope lock: fixing verified defects, implementing the named 10-item roadmap, and completing the specced frontend without open-ended feature creep.
- **Why:** Prevents scope expansion while delivering production-grade stability and UI Polish.
- **Status:** APPROVED & ACTIVE

---

### DEC-004: Tiered Agent Context System (.agent-context/)
- **Date:** 2026-08-23
- **What:** Maintain a lightweight, 7-file evidence-based `.agent-context/` system and enforce terminal verification before claiming tasks complete.
- **Why:** Replaces documentation guesswork with empirical code reality.
- **Status:** ADOPTED (Initialized 2026-08-23)

---

### DEC-005: Master Recon — Reconciliation of Original 5 "Immediate Next Steps"
- **Date:** 2026-08-23
- **What:** Reconcile the 5 items originally flagged in `ai_onboarding_brief.md` against live repository verification.
  1. **Fix rogue `/api/sync` route:** `RESOLVED / NON-EXISTENT` (Terminal check confirmed route does not exist in `src/app/api/` and 0 references in code).
  2. **Fix admin routes missing `/admin/` prefix:** `RESOLVED / CORRECT` (All 11 admin pages verified in `src/app/(admin)/admin/`).
  3. **Set up Vitest unit tests (3 remaining files):** `PARTIALLY RESOLVED / 7 SUITES ACTIVE` (Terminal check confirmed 7 suites with 49/49 passing tests; remaining unit test additions mapped to Phase 8).
  4. **Set up Playwright E2E (`playwright.config.ts` + smoke test):** `PARTIALLY RESOLVED / CONFIGURED` (Verified `playwright.config.ts`, `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `e2e/student-profile.spec.ts` exist; execution verification mapped to Phase 8).
  5. **Zero active broken runtime paths / Pre-launch checklist (5 gates):** `STILL OPEN / SCHEDULED` (Scheduled for Phase 8 / Final Pre-Launch Phase).
- **Why:** Establishes an unambiguous, empirical baseline for all historically documented action items.
- **Status:** VERIFIED & RECONCILED

---

### DEC-006: clock-guard `validateClockGuard` (Deferred Decision)
- **Date:** 2026-08-23
- **What:** `validateClockGuard` exists as an anti-cheat mechanism, but is intentionally never invoked during live exam sessions or on submission. It acts strictly as a post-hoc forensic log via `completion_seal`. 
- **Why:** To prevent legitimate intermittent connectivity issues from instantly terminating exams.
- **Status:** DEFERRED (Open product decision — not a bug)

---

### DEC-007: Phase 3 Verification Tests (Missing Coverage)
- **Date:** 2026-08-23
- **What:** API route RBAC tests (`offline-sync`/`teardown`) and Zod schema rejection tests on server actions were not added during Phase 3 execution.
- **Why:** Unit testing Next.js App Router API routes and server actions requires a heavier testing harness that is better suited for Phase 8.
- **Status:** OUTSTANDING (Tracked for Phase 8)

---

### DEC-008: Announcements Role Authorization
- **Date:** 2026-08-24
- **What:** Default to `requireRole('admin')` for the `createAnnouncement` action, restricting teachers from posting announcements.
- **Why:** Safest default for broad communication features unless explicit teacher-broadcast requirements exist.
- **Status:** PROPOSED

---

### DEC-009: Preserve TipTap JSON format
- **Date:** 2026-08-24
- **What:** Add a dedicated column (`body_json`) to the `announcements` table to preserve the original TipTap JSON structure alongside the sanitized `body_html`.
- **Why:** Allows announcements to be re-opened and edited losslessly in the TipTap editor rather than relying on HTML parsing.
- **Status:** PROPOSED

---

### DEC-010: Admin Announcements Page Data Fetching (RLS Bypass)
- **Date:** 2026-08-24
- **What:** Retain `adminSupabase` for fetching announcements, read counts, and total students in `src/app/(admin)/admin/announcements/page.tsx`.
- **Why:** While RLS-respecting clients are preferred, querying aggregate read counts and total student populations for the entire institution often exceeds the bounds of standard RLS policies (which may restrict users to their own data or specific cohorts). Using `adminSupabase` here ensures accurate dashboard metrics without complex RLS aggregate workarounds.
- **Status:** PROPOSED

---

### DEC-011: Announcements RLS Institution Scoping & Teacher Access
- **Date:** 2026-08-24
- **What:** Replaced the global `USING (true)` read policy on `announcements` with a strict `institution_id` scoped policy for all users. Also updated `createAnnouncement` action and RLS to allow teachers to INSERT and SELECT (but not UPDATE/DELETE) announcements within their institution.
- **Why:** The previous RLS policy created a massive cross-tenant data leak by allowing any authenticated user to read all announcements globally. Teacher write access was added to unblock scoped classroom broadcasts.
- **Status:** PROPOSED
