# MINDSPARK Master Phase Plan

> **Authoritative Phase Execution Roadmap**  
> Generated from empirical Master Recon findings on 2026-08-23.  
> Governed by strict scope lock, terminal verification gates, and branch-per-phase safety protocols.

---

## Global Phase Execution Protocol
Before starting **any** phase:
1. Create and checkout a dedicated working branch: `phase-<N>-<slug>`.
2. Read `.agent-context/Handover.md`, `.agent-context/Architecture.md`, and `.agent-context/Constraints.md`.
3. Check `.env.local` integrity.

Upon concluding **any** phase:
1. Run `npm run tsc` (must be 0 errors) and `npm run test` (all tests green).
2. Update `.agent-context/Handover.md` and any relevant `.agent-context/` files with empirical evidence.
3. Commit locally. Never `git push` without explicit user permission.

---

## Phase Matrix

| Phase | Goal | Primary Skill(s) | Exit Gate |
| :--- | :--- | :--- | :--- |
| **1–2** | Recon + Ranked Deep Audit | `project-takeover-recovery` (`.agents/skills/project-takeover-recovery/SKILL.md`), `codebase-onboarding`, `ponytail-audit`, `inherit-legacy-style` | `extensive_codebase_audit.md` produced, user sign-off |
| **3** | Critical Security & Data Fixes | `systematic-debugging` (`.agents/skills/systematic-debugging/SKILL.md`), `karpathy-guidelines`, `tdd-workflow` | `tsc` 0 errors, security tests pass, `.env` diffed clean |
| **4** | Orphaned Code & Audit-Identified Defect Cleanup | `systematic-debugging`, `full-output-enforcement` | Verified working routes, dead code removed |
| **5** | Next.js Upgrade (15 → 16.3+) | `search-dependencies`, `verification-before-completion` | Full build + test suite green on updated runtime |
| **6** | Core Engine Hardening (Timing & Anti-Cheat) | `karpathy-guidelines`, `tdd-workflow` | Timing engine <5ms jitter verified, clock guard green |
| **7** | State & Storage Refactor (Dexie & Hydration) | `inherit-legacy-style`, `ponytail-audit` | Local storage sync & state lifecycles verified |
| **8** | Test Suite Completion & E2E Setup | `tdd-workflow` (`.agents/skills/tdd-workflow/SKILL.md`) | Vitest unit + Playwright E2E smoke tests green |
| **9.1** | Feature: Submit → Completion Screen Flow | `writing-plans`, `tdd-workflow`, `minimalist-ui` | Live exam submission redirects to completion screen |
| **9.2** | Feature: Student Results View (`/student/results/[id]`) | `writing-plans`, `minimalist-ui` | Verified score & breakdown display with correct RBAC |
| **9.3** | Feature: Admin Results Publish Flow | `writing-plans`, `tdd-workflow` | Batch publish action transitions exam status cleanly |
| **9.4** | Feature: Wire "Create Level" Dialog & Action | `writing-plans`, `minimalist-ui` | Level creation persists to DB and updates table |
| **9.5** | Feature: Admin Students Roster Table | `writing-plans`, `minimalist-ui` | Roster search, pagination, and student profile drawer |
| **9.6** | Feature: Admin Realtime Live Monitor Table | `writing-plans`, `tdd-workflow` | Presence/broadcast state updates live during active test |
| **9.7** | Feature: Admin Dashboard Charts (Recharts) | `writing-plans`, `design-taste-frontend` | Dynamic aggregate metrics & charts render smoothly |
| **9.8** | Feature: Admin Announcements TipTap Editor | `writing-plans`, `minimalist-ui` | Rich text formatted announcements create & display |
| **9.9** | Feature: Admin Settings Forms | `writing-plans`, `minimalist-ui` | Institution profile & timing settings save cleanly |
| **9.10** | Feature: Admin Activity Log Audit Trail | `writing-plans`, `minimalist-ui` | Security & exam events filterable by type and user |
| **Final** | Staging Deployment & 5-Gate Checklist | `verification-before-completion` | 5-gate pre-launch checklist verified, staging live |

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

### Phase 4: Orphaned Code & Audit-Identified Defect Cleanup
- **Goal:** Clean up unused imports, dead handlers, or orphaned components discovered in the Phase 1–2 audit. (Note: Step C confirmed `/api/sync` and missing `/admin/` prefixes are already resolved).
- **Entry Criteria:** Phase 3 complete and clean.
- **Skills:**
  - `systematic-debugging` (`.agents/skills/systematic-debugging/SKILL.md`)
  - `full-output-enforcement` (`.agents/skills/full-output-enforcement/SKILL.md`)
- **Context Files:**
  - *Reads:* `.agent-context/Handover.md`
  - *Updates:* `.agent-context/Handover.md`, `.agent-context/Architecture.md`
- **Exit Gate:** Zero dead code paths, all routes verified intact.

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
- **Phase 9.8:** Admin Announcements TipTap Integration (`writing-plans`, `minimalist-ui`)
- **Phase 9.9:** Admin Settings Forms (`writing-plans`, `minimalist-ui`)
- **Phase 9.10:** Admin Activity Log Table (`writing-plans`, `minimalist-ui`)

---

### Final Phase: Staging Deployment & Handover
- **Goal:** Execute full 5-gate pre-launch checklist, deploy to staging, run end-to-end verification, and complete operational handover.
- **Skills:** `verification-before-completion` (`.agents/skills/verification-before-completion/SKILL.md`).
- **Exit Gate:** Staging deployment healthy, all 5 gates passed.
