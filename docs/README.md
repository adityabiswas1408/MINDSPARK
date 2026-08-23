# MINDSPARK Agent Workflow — How to use this

## Before anything else

**This package needs to run in an environment with real access to the MINDSPARK repo** — filesystem, git, and (per the earlier design) the GitHub and Supabase MCP servers. It was assembled in a plain chat session that had none of those, using only the four planning docs. Nothing in here has been checked against actual code yet. Claude Code (or an equivalent agentic coding tool with those connectors) is almost certainly what "the agent" means for day-to-day execution — this package doesn't assume a specific one by name, but it does assume real tool access, and `prompts/00-...` checks for that before doing anything else.

## What's actually in this delivery

Four files: this README and three prompts. **No `.agent-context/` folder is included.** An earlier pass of this package pre-filled those seven context files from the planning docs — that was a mistake, caught and reversed: those files make claims about the codebase, and nothing here has looked at the codebase yet. `prompts/00-...` now generates `.agent-context/` itself, from what it actually finds when it runs against your real repo. Until then, it doesn't exist.

## Where these files go

`prompts/` can live wherever's convenient in your working environment — it's not meant to ship with the app. When `prompts/00-...` runs, it creates `.agent-context/` at your repo root, alongside the existing 18-volume spec suite — supplementing it, not replacing it.

## Order of operations

1. **Run `prompts/00-PHASE-DISTRIBUTION-MASTER-PROMPT.md`** in your agent. It checks tool access, does a real repo inventory, reconciles the four planning docs against what's actually true, and from that — not from the docs directly — generates the full `.agent-context/` file system plus `PHASE-PLAN.md`. It stops and waits for your sign-off before anything executes.
2. **Review the Step C evidence, the discrepancy list, the generated context files, and `PHASE-PLAN.md`.** This is the moment to catch a wrong assumption before any code moves.
3. **Run `prompts/01-PHASE-1-2-RECON-AUDIT-PROMPT.md`** for the ranked audit. Also stops for sign-off.
4. From Phase 3 onward, each phase generates its own execution prompts from `prompts/EXECUTION-PROMPT-TEMPLATE.md`, informed by what the previous phase actually found — not pre-written in bulk. Update `.agent-context/` at the end of every step, not just every phase.
5. **At the end of every phase**, `Handover.md` gets rewritten fresh (not appended to). That's what you paste into a new chat to start the next phase clean.

## File index

| File | Purpose | Exists yet? |
|---|---|---|
| `prompts/00-PHASE-DISTRIBUTION-MASTER-PROMPT.md` | Kickoff: environment check, repo inventory, generates context files + phase plan | Yes — in this delivery |
| `prompts/01-PHASE-1-2-RECON-AUDIT-PROMPT.md` | The ranked audit | Yes — in this delivery |
| `prompts/EXECUTION-PROMPT-TEMPLATE.md` | Template every phase's step-prompts follow | Yes — in this delivery |
| `.agent-context/Handover.md` | Current state — read this first in any new session | No — created by Step 00 |
| `.agent-context/Decisions.md` | Why past choices were made | No — created by Step 00 |
| `.agent-context/Architecture.md` | System structure — verified vs. documented, clearly tagged | No — created by Step 00 |
| `.agent-context/Constraints.md` | Hard invariants, product and process | No — created by Step 00 |
| `.agent-context/Flow.md` | Traced execution paths (starts empty, fills in over time) | No — created by Step 00 |
| `.agent-context/Rollback.md` | How to undo things safely | No — created by Step 00 |
| `.agent-context/traces/TEMPLATE.md` | Copy per bug/feature as `BUG-<slug>.md` / `FEATURE-<slug>.md`; never edit the template itself | No — created by Step 00 |
| `PHASE-PLAN.md` | The phase-by-phase plan, revised against real findings | No — created by Step 00 |

## The one rule that matters more than the others

Keep these files small. The prior audit already flagged that a 55-skill manifest plus an 18-volume spec suite is a lot of scaffolding for a project that stalled at 40–60%. This context system exists to fix drift and context loss — not to become a second version of the same problem. If a file is growing past a few hundred lines, summarize and archive, don't just append.
