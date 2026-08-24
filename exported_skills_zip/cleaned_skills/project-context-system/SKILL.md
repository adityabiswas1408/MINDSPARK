---
name: project-context-system
description: >-
  Bootstraps and then continuously maintains the full tiered agent-context file system for a codebase being built to real, production/SaaS standard — AGENTS.md/CLAUDE.md, ARCHITECTURE.md, CONSTRAINTS.md, SECURITY.md, per-feature SPEC/PLAN/TASKS, STATE.md, DECISIONS.md, bug/feature trace files, TESTING.md, ROLLBACK.md, and an on-demand skills layer. Use this whenever the user starts a serious new project, says things like "set up my project docs", "give this project a memory system", "my AI agent keeps losing context between sessions", "this needs proper docs for AI agents to work in", mentions CLAUDE.md, AGENTS.md, or context engineering, or is scaling something past MVP and needs the docs to keep themselves current as the codebase grows — not a one-time README. Also trigger when the user has an existing project with messy or missing agent-facing documentation and wants it retrofitted w...
---

# Project Context System

A living, self-updating documentation layer that lets any AI coding agent (Claude, another Claude session, or a different model entirely) pick up a project cold and work on it correctly — without either re-reading the whole codebase every time, or drowning in a pile of stale markdown.

## The problem this solves

Two failure modes, and this skill exists to dodge both:

1. **No context system at all.** Every session starts from zero. The agent re-derives the architecture, forgets why a decision was made, and repeats mistakes that were already fixed.
2. **Too much context system.** A pile of always-loaded files that never gets pruned. Research on this exact setup found that bloated, ever-growing context files can make agents follow stale or irrelevant instructions almost to a fault, and Anthropic's own guidance is blunt about it: a bloated CLAUDE.md causes an agent to ignore real instructions, not follow them better.

The fix is **tiered loading**: a small set of always-loaded files kept short by discipline, a per-feature layer that opens and closes, and an on-demand layer that only loads when relevant. That is the whole design behind everything below.

## Prerequisites & compatibility

- Works with any language or stack — nothing below is framework-specific.
- Needs read access to the repo now, and write access when it's time to create or update files (ask first if you're not sure you have it).
- Works standalone. It gets stronger if any of these sibling skills are also installed, but never depends on them:
  `codebase-onboarding`, `clarifying-requests`, `living-docs-governance`, `architecture-decision-records`, `brainstorming`, `writing-plans`, `blueprint`, `intent-driven-coding`, `inherit-legacy-style`, `systematic-debugging`, `tdd-workflow`, `verification-before-completion`, `karpathy-guidelines`, `full-output-enforcement`, `ponytail`, `ponytail-audit`, `ponytail-review`, `ponytail-debt`.
- If a sibling skill isn't installed, this skill does that step itself with a lean inline fallback (noted at each step below) rather than blocking.
- **If `living-docs-governance` is also installed:** its four-role documentation taxonomy (Constitution / Map / Status / History) maps directly onto this skill's `CONSTRAINTS.md` / `ARCHITECTURE.md` / `STATE.md` / `DECISIONS.md`. Don't run both as separate, parallel taxonomies on the same repo — that's two sources of truth for the same four roles under different names. Whichever skill was set up on this repo first owns the file set; the other defers to it by reference rather than duplicating it.

## Entry Point

Do this first, every time this skill is invoked, before anything else:

1. Look for `STATE.md` at the repo root.
   - **Found it** → this project already has the system. Read `STATE.md` first, then `ARCHITECTURE.md` and `CONSTRAINTS.md`. Summarize current status back to the user in one short paragraph ("Here's where this project stands...") and ask what they want to work on. You're now in **maintenance mode** — skip straight to whichever phase matches what they ask for, and keep the Self-Maintenance Triggers (Phase 3) running in the background for the rest of the session.
   - **Not found** → this is a first run. Say so plainly, then move to Mode Detection below. You're in **bootstrap mode**.

2. **Mode Detection** (bootstrap mode only): check whether the repo has existing source files beyond scaffolding.
   - **New/empty project** → start at Phase 1 and build forward.
   - **Existing project** → don't invent an architecture from assumptions. If `codebase-onboarding` is installed, invoke it now to do the reconnaissance; otherwise spend a first task reading the repo yourself (entry points, package manifests, folder layout, existing README) before writing anything. Everything you write in Phase 1 must come from what you actually found, not from a guess — correct any wrong guess the moment you see contradicting code.

State the mode you've detected to the user in one sentence before continuing.

## Phases

Work moves through five phases. Phases are not fixed-length — each one can take one task or twenty, depending on the size of the project. A phase is done when its exit criteria are met, not when some step count is reached. Never skip a phase's exit criteria to move faster.

### Phase 0 — Recon & Mode Detection
*(see Entry Point above — this phase is the Entry Point itself)*
**Exit criteria:** you know whether this is new or existing, and if existing, you've actually looked at the code rather than guessed.

### Phase 1 — Foundation Layer (always-loaded tier)

These four files load into every future session. Keep every one of them short — the budget is roughly under 100 lines each. If a file is growing past that, it's a sign detail belongs one tier down, not that the budget is wrong.

| File | Owner | What goes in it |
|---|---|---|
| `AGENTS.md` / `CLAUDE.md` (repo root) | `codebase-onboarding` if installed, else this skill | Stack, build/test commands, code style deltas from language defaults, repo etiquette. Nothing the agent can infer by reading the code. |
| `ARCHITECTURE.md` (repo root) | this skill | The system map: services, data flow, and *why* it's shaped this way. No file-by-file inventory — that goes stale the next commit. |
| `CONSTRAINTS.md` (repo root) | this skill | Three tiers: **Always** / **Ask First** / **Never**. If `inherit-legacy-style` is installed and has produced `.ai-style-rules.md`, fold its hard rules in here rather than duplicating a second source of truth. |
| `SECURITY.md` (repo root) | this skill | SaaS-specific non-negotiables: secrets never in code or shipped to the client, parameterized queries only, auth/session rules, tenant isolation, baseline input validation. This is the one file with no owner anywhere else in your skill set — audits of AI-generated code keep finding hardcoded credentials and missing access controls, and nothing catches that without a dedicated file. |

Templates for all four are in `references/file-templates.md` — use them as a starting shape, not a script to fill in blindly; delete any section that doesn't apply rather than leaving it as a placeholder.

**Important on `CONSTRAINTS.md`'s Never tier:** a rule written only in markdown can still get talked past mid-session under pressure. For anything truly non-negotiable (never touch migrations directly, never commit a `.env`), tell the user this deserves a real enforcement mechanism too — a pre-commit hook or permission rule — not just a sentence in a file. Flag it; don't silently assume the sentence is enough.

**Exit criteria:** all four files exist, are accurate to the actual codebase, and each is short enough that a new session could read all four in under a minute.

### Phase 2 — Feature Layer (opens and closes, never accumulates)

This is where day-to-day work happens. Don't build a new spec/plan/task system — route into the skills that already own this:

- If the request is a vague one-liner with material unknowns, `clarifying-requests` (if installed) triages it first — don't send an underspecified ask straight to `brainstorming` and hope the shape resolves itself mid-session.
- A new feature or idea → hand off to `brainstorming` (produces `docs/specs/YYYY-MM-DD-<topic>-design.md`) if the shape is still open, or `intent-driven-coding` if it's a high-impact backend/schema/auth change that needs acceptance criteria more than exploration.
- Once a spec exists → hand off to `writing-plans` for a single-PR feature (produces `docs/plans/YYYY-MM-DD-<feature>.md`), or `blueprint` if it's genuinely multi-session/multi-PR (produces `plans/<name>.md`). Don't default to the heavier one — most features are single-PR.
- If neither `brainstorming` nor `writing-plans`/`blueprint` is installed, do it inline: write a short `SPEC.md` (what this feature does and doesn't do) and `PLAN.md` (files/interfaces touched, the end-to-end check that proves it works) in `docs/specs/<feature-slug>/`, and only add a separate `TASKS.md` checklist if the feature is big enough to span multiple sessions.
- While implementing, `karpathy-guidelines` applies if installed (surface assumptions, surgical diffs, minimum code) — this skill doesn't duplicate that discipline, it just makes sure the resulting spec/plan get filed and later closed out correctly. `full-output-enforcement` applies the same way if installed — no elided code or `// rest unchanged` placeholders in anything written under a feature's PLAN.md; this skill enforces that rule directly even without it, since a half-written feature isn't a closed one.

**Exit criteria for a feature:** it's implemented, verified (Phase 4), and closed out (Phase 3 fires the "feature shipped" trigger).

### Phase 3 — Continuity Layer & Self-Maintenance (the part that keeps this system alive)

This is the actual answer to "automatically updates itself as the project grows." It isn't magic — it's a fixed set of triggers you (the agent) check after every meaningful action, for the rest of the project's life, not just during setup.

| File | Owner | Update trigger |
|---|---|---|
| `STATE.md` (root) | this skill | Rewritten — not appended — at the end of every session. Current status only: done / in progress / broken / avoid. This is the one file every future session reads first. |
| `DECISIONS.md` (root) *or* `docs/adr/README.md` | this skill, unless `architecture-decision-records` is installed, in which case its ADR index **is** your decisions log — don't create a second, conflicting one | Append-only, dated, one entry per meaningful choice: what was decided and why, not just what. |
| `bugs/<slug>.md` | this skill (pairs with `systematic-debugging` for the actual fix process) | One trace file per bug worth reconstructing later: repro → root cause → fix → verification. Not every commit — only ones with a story worth keeping. |
| `features/<slug>.md` | this skill | Same idea, for a shipped feature's own trace, if it's non-obvious enough to be worth one. |

If `ponytail-debt` is installed and already harvesting `// ponytail:` comments into its own ledger, don't duplicate that list here — treat its ledger as the record of known shortcuts, and only promote an entry into a full `bugs/<slug>.md` trace once it's actually worth reconstructing later.

**The trigger table — check this after every task, not just at session end:**

| Event | What fires |
|---|---|
| Session starts | Read `STATE.md` first, always |
| A task from a plan is completed | Check it off; update `STATE.md`'s "in progress" line |
| A feature ships and passes Phase 4 verification | Run `ponytail-review` on the diff first if installed; close its spec/plan/tasks trio; rewrite `STATE.md`; append a `DECISIONS.md`/ADR entry if a real choice was involved |
| A bug is found and fixed | Write `bugs/<slug>.md` |
| An architectural choice is made (new service, new datastore, auth strategy, framework swap) | Update the touched section of `ARCHITECTURE.md`; append a decision entry — hand off to `architecture-decision-records` if installed |
| A genuinely non-negotiable rule emerges | Add it to `CONSTRAINTS.md`'s correct tier; flag for a hook if it's a Never-tier item |
| Auth, secrets, tenant boundaries, or a new input path changes | Update `SECURITY.md` before shipping, not after |
| Test commands or expected output change | Update `TESTING.md` (Phase 4) |
| A risky change is about to deploy | Confirm `ROLLBACK.md` (Phase 4) covers it before proceeding |
| The project grows past one service | Bootstrap `FLOW.md` — the request/data lifecycle across boundaries is where multi-service bugs actually hide |
| Any always-loaded file (Phase 1) is creeping past its budget | Prune it per Anti-Bloat Governance below — this is not optional maintenance, it's what keeps the whole system from becoming the exact bloat problem this skill exists to prevent |

**Exit criteria:** there is no such thing as "done" for this phase — it runs for the life of the project. Treat it as always-on background behavior, not a phase you complete and leave.

### Phase 4 — Verification & Safety Net

| File | Owner | Contents |
|---|---|---|
| `TESTING.md` (root) | this skill, aggregating `docs/testing/<task>.tdd.md` if `tdd-workflow` is installed | Actual commands and their expected output. This is the single highest-leverage habit here — a runnable check, not a vibe check. |
| `ROLLBACK.md` (root) | this skill | How to undo a bad change. Earns its own file once real deploys exist; before that, a section in `DECISIONS.md` is enough — don't force it early. |

Before anything gets marked done anywhere in this system, `verification-before-completion` applies if installed: run the actual command, look at the actual output, then update the file. Never write "tests pass" into `STATE.md` or `TESTING.md` from reasoning alone.

**Exit criteria:** `TESTING.md` commands actually run and match their documented expected output right now, not as of some earlier session.

### Phase 5 — On-Demand Layer & Growth Checks

Nothing here loads by default — that's the point.

- `.claude/skills/<name>/SKILL.md` or `.agents/skills/<name>/SKILL.md` — deployment steps, a payments integration, or anything domain-specific that would otherwise bloat Phase 1's files. This skill doesn't create these; it just makes sure Phase 1 files point to them by name instead of inlining their content.
- `FLOW.md` (optional) — created only once the project crosses into multi-service territory (see the trigger table above).

**Growth checks — ask these periodically, not just once:**
- Is any Phase 1 file past its budget? → prune (below).
- Has a `bugs/` or `features/` folder grown past a couple dozen files with no index? → offer to add a short index, don't let it become unnavigable.
- Has the project outgrown a single `DECISIONS.md`? → that's exactly the signal to hand off to `architecture-decision-records` if not already installed.
- Is the *code itself* (not just the docs) accumulating unused wrappers, single-caller abstractions, or dependencies that duplicate stdlib features? → that's not this skill's job to fix by hand-reviewing; hand off to `ponytail-audit` for a whole-repo scan if installed, and file what it finds as a `bugs/`-style cleanup entry.

## Anti-Bloat Governance

The one rule underneath all of it: **fewer always-loaded files, ruthlessly pruned, beats a complete-looking pile every time.** This section governs the *docs* this skill owns. It's the doc-layer counterpart to `ponytail`'s code-layer YAGNI ladder (standard library > existing repo utils > native platform features > minimal custom logic > third-party dependencies) — if `ponytail`/`ponytail-audit` are installed, let them own code-level simplicity; this skill only owns keeping the files themselves lean.

- Phase 1 files: budget ~100 lines each. When a file is pushing past that, move the detail that's *specific to one situation* down a tier (into a feature's own SPEC.md, into a skill, into a bug trace) and leave only what's true for *every* session. `context-budget`, if installed, is a sharper way to confirm this than eyeballing line counts — it measures actual token consumption across what's loaded rather than just totaling lines.
- Rewrite, don't accumulate. `STATE.md` and `ARCHITECTURE.md` get rewritten to reflect current reality — they are not append-only logs. `DECISIONS.md` and bug/feature traces are the append-only ones; that asymmetry is intentional.
- If you (the agent) ever catch yourself about to write something into a Phase 1 file that only matters for the feature you're currently working on, stop — that belongs in Phase 2's SPEC/PLAN, not Phase 1.
- Periodically (e.g. once a project has shipped several features), if `ponytail-audit` is installed, run it against the codebase itself and fold any findings worth remembering into `DECISIONS.md` or a cleanup entry in `features/` — this skill prunes docs, `ponytail-audit` prunes code, and neither substitutes for the other.

## Checkpoint Protocol

After finishing any single task — not just at the end of a phase — do this before starting the next one:

1. Update whichever file(s) the trigger table says this task touches. Don't batch updates for later.
2. Give the user a short plain-language summary of what just got done — one or two sentences, no jargon they didn't already use themselves.
3. Say what the next step will be, in plain terms — what it accomplishes for them, not the internal mechanics of which file gets touched.
4. Ask explicitly whether to continue, and stop. Wait for their reply before doing anything else. Never chain multiple tasks together without this checkpoint in between, even if the next step seems obvious.

A good checkpoint reads like: *"Done — I've mapped out how your app is structured and written that down so future sessions don't have to re-figure it out. Next up: writing down the ground rules for what an AI agent should never touch in this codebase (like your payments code or database migrations). Want me to go ahead with that?"*

A bad checkpoint just says "Phase 1 complete, proceeding to Phase 2" — that tells the user nothing and doesn't ask.

## Reference files

- `references/file-templates.md` — ready-to-use markdown templates for every file this skill owns (`ARCHITECTURE.md`, `CONSTRAINTS.md`, `SECURITY.md`, `STATE.md`, `DECISIONS.md` fallback, `bugs/<slug>.md`, `features/<slug>.md`, `TESTING.md`, `ROLLBACK.md`, `FLOW.md`, and a lean `AGENTS.md`/`CLAUDE.md` fallback for when `codebase-onboarding` isn't installed). Load this when you're about to create any of these files for the first time — don't freehand the structure.
