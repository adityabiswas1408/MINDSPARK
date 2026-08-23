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
