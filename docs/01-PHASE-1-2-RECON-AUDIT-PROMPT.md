# Phase 1 & 2 — Recon / Ruthless Feature Audit

Run this only after `prompts/00-PHASE-DISTRIBUTION-MASTER-PROMPT.md` has completed Steps A–D (environment confirmed, repo inventory done, `Architecture.md`/`Constraints.md` reconciled against reality). This prompt goes deeper on the same three priority areas, and turns findings into a ranked, actionable audit.

> [!IMPORTANT]
> **Mandatory Prerequisite:** Read `.agent-context/GOTCHAS.md` in full before starting this audit. Known process and verification mistakes from earlier phases live there.

## Hard gate
Do not write or modify any code. This phase produces documents only. If you find yourself about to "just quickly fix" something while auditing — don't. Log it as a finding instead.

## Skills to invoke, and why

- **`project-takeover-recovery`** (`.agents/skills/project-takeover-recovery/SKILL.md`) — the primary framework for this whole phase. Produces `RECON.md` and `FEATURE-AUDIT.md`. Enforces zero credential loss (diff `.env`), zero elided output when reporting findings.
- **`codebase-onboarding`** (`.agents/skills/codebase-onboarding/SKILL.md`) — structured recon method for building the architecture map and entry-points guide. Per the manifest's own disambiguation matrix, this alone is *not* sufficient for a takeover — it's an aid inside `project-takeover-recovery`, not a substitute for it.
- **`ponytail-audit`** (`.agents/skills/ponytail-audit/SKILL.md`) — whole-repo bloat scan: over-engineered abstractions, unused wrappers, single-caller layers. Run this specifically against the State & Architecture area (priority 3).
- **`inherit-legacy-style`** (`.agents/skills/inherit-legacy-style/SKILL.md`) — scans file anatomy, state control, utils structure, and error habits to catch AI-style drift in the existing component state management.
- **`full-output-enforcement`** (`.agents/skills/full-output-enforcement/SKILL.md`) — applied to the audit artifact itself: no truncated findings, no "...and other similar issues," every flagged file gets its actual evidence shown.
- **`verification-before-completion`** (`.agents/skills/verification-before-completion/SKILL.md`) — any factual claim in the audit (test counts, "this works," "this is solid") needs terminal output attached, not just reasoning.
- **`architecture-decision-records`** (`.agents/skills/architecture-decision-records/SKILL.md`) — invoke *only if* a finding forces a real architectural call (e.g. "the offline sync approach needs a redesign, not a patch"). Don't force an ADR for routine findings.

Not invoked here, but flag forward for later phases: `systematic-debugging` (Phase 3–4, for actually fixing the confirmed defects) and `tdd-workflow` (any phase that writes production code).

**Gap worth knowing about:** the 49-skill manifest has no dedicated security-audit skill, despite Security & Data being this audit's #1 priority and the product handling minors' data under the DPDP Act. `project-takeover-recovery` + manual RBAC/validation review is covering that gap here — if this project keeps growing, that's a real hole to fill with a proper skill, not just this one prompt.

## Audit scope

### 1. Security & Data
- `src/app/actions/` — every Server Action: does it run `requireRole()` as line 1? Does it return `ActionResult<T>` consistently? What's actually validated vs. assumed?
- Supabase RBAC — confirm `getUser()` is used everywhere authorization happens, and that `app_metadata.role` (not `user_metadata`) is the only role source. Any exception is a finding, not a footnote.
- Data validation — where is user input trusted without a schema check?

### 2. Core Engines
- `src/lib/anzan/timing-engine.ts` — confirm `requestAnimationFrame` accumulator, no `setTimeout`/`setInterval`, and actually measure jitter if a way to test it exists. Don't just read the code and assume the comment is true.
- `src/lib/anticheat/` — HMAC clock-guard, visibility teardown listeners. Are they wired into every exam entry point, or only some?

### 3. State & Architecture
- Component state management patterns — consistency, prop drilling, unnecessary re-renders.
- Dexie offline buffering — actual schema, actual sync-on-reconnect logic, failure modes if sync conflicts.
- Hydration — any client/server mismatch risks in the exam player components specifically (highest stakes given the timing precision requirement).

## Output

Produce `extensive_codebase_audit.md`:

1. **Ranked "Major Improvement" list** — file/component, exact reason (security flaw / performance / messy logic / style drift), severity (Critical / High / Medium), and the evidence (code excerpt or command output) backing the claim.
2. **"Leave alone" list** — components confirmed solid, with what you checked to confirm it (not just "looks fine").
3. **Step-by-step refactor plan** — safe order of operations to fix the flawed areas *before* new feature work starts, cross-referenced to `PHASE-PLAN.md`'s phase numbers.

## Context files to update when done

- `Architecture.md` — mark every relevant item `[VERIFIED]`/`[FALSE]`/`[PARTIAL]` with evidence.
- `Constraints.md` — add any new invariant this audit surfaced that isn't already listed.
- `Decisions.md` — log any judgment call made while triaging severity.
- `Handover.md` — rewrite "What's broken / flagged" and "Immediate next action" to reflect this audit's actual findings.
- `Flow.md` — add any execution paths you traced while auditing the engines (don't skip this just because the phase is audit-focused — traced flows are exactly what this phase produces).

## Hard stop

Present `extensive_codebase_audit.md` and wait for approval before Phase 3 (fixes) begins.
