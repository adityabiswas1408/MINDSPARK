# Execution Prompt Template

Each phase in `PHASE-PLAN.md` generates its own series of these — do not write all of them for all phases up front. Generate Phase N's steps only when Phase N actually starts, using what Phase N−1's real findings were, not what was originally guessed in the skeleton.

---

```
### Step <phase>.<n>: <one-line goal>

**Read first:** `GOTCHAS.md` (mandatory), <which other .agent-context/ files this step needs — usually a subset, not all seven>
**Skill(s):** <exact skill name(s) + canonical path from AGENT_SKILLS_MANIFEST.md, and why>
**Files in scope:** <exact paths this step is allowed to touch — nothing outside this list>
**Out of scope:** <explicitly what NOT to touch, even if tempting mid-step>

**Task:**
<the actual instruction, concrete enough that zero prior context is needed>

**Verification:**
<the exact command(s) to run and what output proves success — e.g. `npm run tsc` → 0 errors,
specific test file → pass. No verification = step isn't done.>

**STOP AND REPLAN if:**
<the specific condition under which this step should NOT just push forward with a guess —
e.g. "the file structure doesn't match what Architecture.md claims," "the fix requires touching
a file outside scope," "the test can't be written without a decision the user hasn't made."
When this triggers: stop, write what you found to Decisions.md, update Handover.md, and ask —
don't silently improvise a workaround and call it done.>

**On completion, update:**
- [ ] `Handover.md` — one line: what changed
- [ ] `Decisions.md` — only if a real tradeoff was made this step
- [ ] `Flow.md` — only if this step traced or changed an execution path
- [ ] `Architecture.md` / `Constraints.md` — only if this step invalidated or confirmed something in them
- [ ] `git commit` — small, scoped to this step's files only
```

---

## Worked example

```
### Step 4.1: Investigate and resolve the rogue /api/sync route

**Read first:** Architecture.md (Known Documented Defects section), Constraints.md §A
**Skill(s):** systematic-debugging (.agents/skills/systematic-debugging/SKILL.md) —
              reproduce before removing, don't assume it's dead just because it's undocumented
**Files in scope:** src/app/api/sync/**, any file that imports from it
**Out of scope:** the real sync logic in the offline-resilience pipeline — don't touch that
                   even if it looks related

**Task:**
Trace every caller of /api/sync. If it has zero live callers and its logic is fully
superseded by the documented offline-sync pipeline, delete it. If it has live callers,
STOP AND REPLAN (see below) rather than deleting something in use.

**Verification:**
`grep -r "api/sync" src/` returns nothing after the change. `npm run tsc` → 0 errors.
Existing offline-sync tests still pass.

**STOP AND REPLAN if:**
Any caller of /api/sync is found in a live code path — that means it's not dead code,
and this becomes an architecture question (why does it exist alongside the documented
pipeline?) that needs a Decisions.md entry and possibly an ADR, not a deletion.

**On completion, update:**
- [x] Handover.md — "rogue /api/sync route: confirmed dead, removed" or "confirmed live, deferred — see Decisions.md D9"
- [x] Decisions.md — if it turned out to be live
- [ ] Flow.md — only if tracing it revealed a path worth keeping on record
- [x] git commit — "fix: remove dead /api/sync route" (or the deferral, if that's the outcome)
```
