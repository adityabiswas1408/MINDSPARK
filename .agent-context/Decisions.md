# Architecture & Project Decisions Log

> Running chronological log of architectural and operational decisions. Newest entries at the bottom.

---

### DEC-001: Maintain Existing Tech Stack
- **What:** Retain Next.js App Router, Supabase (PostgreSQL + Auth + Realtime), Tailwind CSS v4, Dexie 4, and Vitest.
- **Why:** Existing baseline is solid with 27 migrations applied and 49 tests passing; rewriting would discard working anti-cheat and timing logic.
- **Status:** APPROVED & ACTIVE

---

### DEC-002: Next.js Upgrade Target Scheduled
- **What:** Plan Next.js 15 → 16.3+ upgrade before the hard deadline of 2026-10-21.
- **Why:** Avoid deprecation and ensure long-term framework maintenance.
- **Status:** SCHEDULED (Targeted for early dedicated Phase 5)

---

### DEC-003: Project Approach — Refactor & Finish (Scope Lock)
- **What:** Follow "Refactor & Finish" strategy with strict scope lock: fixing verified defects, implementing the named 10-item roadmap, and completing the specced frontend without open-ended feature creep.
- **Why:** Prevents scope expansion while delivering production-grade stability and UI Polish.
- **Status:** APPROVED & ACTIVE

---

### DEC-004: Tiered Agent Context System (.agent-context/)
- **What:** Maintain a lightweight, 7-file evidence-based `.agent-context/` system and enforce terminal verification before claiming tasks complete.
- **Why:** Replaces documentation guesswork with empirical code reality.
- **Status:** ADOPTED (Initialized 2026-08-23)

---

### DEC-005: Recon Findings — Rogue Routes & Admin Prefixes
- **What:** Mark doc-reported defect `/api/sync` and missing `/admin/` prefixes as already resolved/non-existent.
- **Why:** Master recon confirmed `/api/sync` does not exist and all admin routes are nested under `src/app/(admin)/admin/`.
- **Status:** VERIFIED & CLOSED
