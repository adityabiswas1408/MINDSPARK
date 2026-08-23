# Project Process Gotchas & Learning Log

> **MANDATORY READING BEFORE STARTING ANY PHASE.**  
> This file documents confirmed process and verification failures from earlier phases.  
> Every entry identifies a concrete mechanism, recurrence risk, and a mechanical check to prevent repeat errors.

---

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
