---
name: mvp-context-kit
description: >-
  Sets up a minimal, fast agent-context system for a small project, hackathon build, weekend project, or MVP — a single AGENTS.md, a reusable BUILD.md per feature, and a two-line STATE.md, instead of the full 12-file production system. Use this whenever the user is starting something small and wants to move fast — "just get me going", "quick prototype", "hackathon project", "30-day build", "MVP", "weekend project" — and explicitly prefer this over the full project-context-system skill unless the user already mentions SaaS scale, multiple services, paying customers, or a team of contributors, in which case use project-context-system instead. Also trigger when a user is partway through a small project and it's getting hard to track what's built vs broken without any structure at all.
---

# MVP Context Kit

The same idea as `project-context-system`, sized down for something that needs to exist by tomorrow, not something that needs to survive five years of contributors. If this project outgrows "small," this skill tells you exactly when and how to hand off to the full system — see Graduation Path at the end.

## Why a separate skill instead of just "the small version"

Speed is the actual feature here. A hackathon or 30-day-program build doesn't need SPEC/PLAN/TASKS as three separate files, a security posture doc, or a rollback plan — it needs one place to say what's being built, one place to say what's done, and a way to not lose track of what's broken. Loading the full 12-file system onto a weekend project is its own kind of bloat.

## Prerequisites & compatibility

- Works with any language or stack.
- Needs write access to the repo root.
- Optional, not required: `writing-plans`, `karpathy-guidelines`, `tdd-workflow`, `verification-before-completion`, `full-output-enforcement` — use them if the user wants extra rigor on a specific feature, but don't require them for the default fast path.
- `clarifying-requests` covers the same one-question check this skill's own Entry Point already does inline (step 2 below) — if it's installed, defer to it instead of improvising the same triage informally.
- `ponytail` fits this kit especially well even though it's optional: its YAGNI ladder (standard library > native platform features > a one-liner > minimal custom code > a new dependency) is exactly the discipline that keeps an MVP from accumulating dependencies it didn't need. Lean on it by default when installed, not just on request — speed and a light dependency tree are the same goal here.
- If something breaks mid-build, `systematic-debugging` (if installed) gives the actual reproduce → trace root cause → minimal fix → verify cycle instead of guessing at a patch; without it, at minimum reproduce the break before trying a fix.

## Entry Point

Do this first, every time this skill is invoked:

1. Look for `AGENTS.md` at the repo root.
   - **Found it** → this project already has the kit. Read `AGENTS.md` and `STATE.md`, summarize current status in one sentence, ask what to build next. Skip straight to Phase 2.
   - **Not found** → first run. Confirm this is meant to be a small/MVP build, not a SaaS-scale one — if the user's description sounds like it needs multi-service architecture, a real security posture, or long-term maintainability by a team, say so and suggest `project-context-system` instead before proceeding.
2. Ask (briefly, one question) what's being built if it isn't already clear from the conversation, then move to Phase 1.

## Phases

Same rule as the full system: phases aren't fixed-length. A phase ends when its exit criteria are met.

### Phase 1 — One-File Foundation

Create a single `AGENTS.md` at the repo root — stack, how to run it, and the ground rules, all in one short file. Don't split this into four files the way the full system does; at MVP size, splitting adds overhead without adding clarity.

```markdown
# <Project Name>

## Stack
<languages, frameworks, database — one line each>

## Run it
- Install: `<command>`
- Dev: `<command>`
- Test: `<command>`

## Ground rules
<the handful of things that must never happen — e.g. "don't touch the seed data script",
"auth logic stays in /auth, don't scatter it">

## Map
<3-6 lines on how the pieces fit together — not a full architecture doc, just enough that
a new session isn't lost>
```

Only add a separate `SECURITY.md` if this MVP actually touches real user data, auth, or payments — most don't, and forcing one in for a to-do app adds nothing. If it does apply, keep it to a handful of bullets, not the full production template.

**Exit criteria:** `AGENTS.md` exists and is accurate; a new session could read it in under 30 seconds.

### Phase 2 — Fast Feature Loop

One reusable file per feature, not three: `BUILD.md` (create fresh per feature, in `docs/build/<feature-slug>.md` if there's more than one at a time, or just `BUILD.md` at root if it's genuinely one feature at a time).

```markdown
# Building: <feature name>

## What it does
<one or two sentences>

## Steps
- [ ] <step>
- [ ] <step>
- [ ] <step>

## Done when
<the actual check that proves it works — a command, a manual click-through, whatever's real>
```

This one file plays the role SPEC.md, PLAN.md, and TASKS.md play in the full system, collapsed into a checklist. If the user wants more rigor on a particular feature — genuinely ambiguous scope, high-stakes logic — it's fine to hand that one feature off to `writing-plans` instead of using `BUILD.md`; don't force every feature through the same weight of process.

When a feature is done, delete or archive its `BUILD.md` rather than letting finished ones pile up at the root — that's the accumulation this kit is built to avoid.

**Exit criteria (per feature):** every box in `BUILD.md` is checked and the "Done when" check actually passes.

### Phase 3 — Minimal Continuity

Two files, both light:

- `STATE.md` (root) — rewritten each session, not appended:
  ```markdown
  # State
  **Updated:** <date>
  **Working:** <what's done and works>
  **Broken:** <what's known broken>
  **Next:** <what's next>
  ```
- `DECISIONS.md` (root) — only add an entry when a choice would genuinely confuse someone later ("why did we use X instead of Y"). Most MVP decisions don't need one — don't force a log entry for every small call.
  ```markdown
  # Decisions
  ## <date> — <title>
  <what and why, one or two sentences>
  ```

**Trigger table (lighter than the full system's — check after finishing a feature, not after every task):**

| Event | What fires |
|---|---|
| A `BUILD.md` feature is completed | Archive/delete it; rewrite `STATE.md` |
| Something breaks that wasn't broken before | Update `STATE.md`'s Broken line immediately, don't wait for session end; if `systematic-debugging` is installed, run its reproduce → root-cause → fix → verify cycle rather than guessing at a patch |
| A confusing/non-obvious choice gets made | One `DECISIONS.md` entry |
| The ground rules in `AGENTS.md` need a new entry | Add it directly — no separate CONSTRAINTS.md at this scale |

**Exit criteria:** ongoing for the life of the MVP, same as the full system's Phase 3 — this doesn't "finish," it just keeps running.

### Phase 4 — Ship Check

Before calling anything done:

- Run the actual test/build command from `AGENTS.md` and look at the real output — don't mark something working from reasoning alone. If `verification-before-completion` is installed, it governs this step; otherwise this skill enforces the same rule directly: no "should work," only "ran it, here's the output."
- No truncated or elided code in anything this touches. If `full-output-enforcement` is installed, it governs this too; otherwise this skill enforces the same rule directly — a `// rest stays the same` placeholder isn't a finished feature.
- If this is going to be demoed or deployed, add a one-line note to `STATE.md` on how to run it end to end.

No separate `TESTING.md` or `ROLLBACK.md` at MVP scale — the ship check is a step, not a file, unless the project is about to have a real deploy with real users, in which case add a short `ROLLBACK.md` (see Graduation Path).

## Checkpoint Protocol

Same as the full system, sized to match the pace of MVP work:

1. Update `STATE.md` (and `BUILD.md`'s checklist) for whatever just got done.
2. One or two plain-language sentences on what just happened.
3. One plain-language sentence on what's next and why it matters.
4. Ask whether to continue, and stop — wait for the reply.

Example: *"Login page's built and working — I tested it end to end with a real signup. Next I'd wire up the dashboard so it actually shows the logged-in user's data instead of a placeholder. Want me to go ahead?"*

## Graduation Path — when to switch to `project-context-system`

Watch for these signals, and say so to the user rather than quietly staying on the lightweight kit past its usefulness:

- The project gets real users, a team of more than one or two contributors, or outside funding/stakeholders.
- It grows past one service (a second backend, a worker process, a separate API).
- Auth, payments, or real user data become central rather than incidental.
- `AGENTS.md` is creeping past a couple hundred lines because the single-file shape no longer fits — `context-budget`, if installed, can confirm this directly instead of eyeballing line count.

When you see one of these, tell the user directly and offer the migration:

| MVP kit file | Becomes, under the full system |
|---|---|
| `AGENTS.md` | Split into `AGENTS.md`/`CLAUDE.md` + `ARCHITECTURE.md` + `CONSTRAINTS.md` |
| `BUILD.md` (per feature) | `SPEC.md` + `PLAN.md` (+ `TASKS.md` if large) per feature |
| `STATE.md` | Carries over as-is |
| `DECISIONS.md` | Carries over as-is, or hands off to `architecture-decision-records` if installed |
| *(none)* | New: `SECURITY.md`, `TESTING.md`, `ROLLBACK.md` — genuinely new needs at this scale, not a renaming of something that already existed |

Don't do this migration preemptively "just in case" — the whole point of this kit is staying light until the signals above actually show up.
