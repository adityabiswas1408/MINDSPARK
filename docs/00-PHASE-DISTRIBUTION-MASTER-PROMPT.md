# Phase Distribution — Master Prompt

Paste this as the first message in a fresh agent session that has real access to the MINDSPARK repository. This prompt does not write or fix code. Its job is: verify it can actually see the project, audit what's real vs. documented, generate the project's context-file system from what it actually finds, and produce a phase plan. It ends with a hard stop for your approval.

**Nothing about the codebase is assumed true going in — not even by this prompt's author.** Every fact that ends up in a context file must trace to something Step C actually checked, not to a claim in the planning docs.

---

## Step A — Environment check (do this first, before reading any project file)

Confirm, and report back explicitly, whether you currently have:

1. Direct filesystem access to a cloned copy of the MINDSPARK repo (not just the four planning docs).
2. Working `git` access (branch, commit — push is separate, see the Constraints.md you'll generate below).
3. The GitHub MCP server connected and callable.
4. The Supabase MCP server connected and callable.

**If any of 1–4 is missing, STOP here.** Report exactly which ones, and do not proceed by "reasoning about" the codebase from the docs alone — that produces exactly the doc/code confidence gap this workflow exists to close. Ask the user how to get the missing access before continuing.

## Step B — Load available context

Read the four project docs: `ai_onboarding_brief.md`, `PROJECT_EXPLAINED.md`, `chat_context_handover.md`, `AGENT_SKILLS_MANIFEST.md`.

Then check: does `.agent-context/` already exist in the repo?

- **No (first run):** there is no prior context-file state. You'll create it in Step E, from Step C's findings — not from the docs.
- **Yes (this is a later phase, continuing the workflow):** read `.agent-context/GOTCHAS.md` and `.agent-context/Handover.md` first, then the rest, before proceeding — this is a continuation and Step E becomes "update," not "create."

Treat everything in the four project docs as **claims to check, not facts** — specifically the docs' own admission that they claim to be "synchronized with the codebase" while also listing known unresolved defects. That tension is exactly what Step C exists to resolve.

## Step C — Full repo inventory (skill: `codebase-onboarding`, `.agents/skills/codebase-onboarding/SKILL.md`)

Produce a real file tree, `package.json` + lockfile versions, and a list of every file under `src/app/actions/`, `src/lib/anzan/`, `src/lib/anticheat/`, and every applied migration. Then specifically check, and report pass/fail with evidence for each:

- Does `/api/sync` exist? If yes, what does it do — is it actually dead code?
- Which admin routes are missing the `/admin/` prefix, if any?
- Actual test count: run the test suite, paste real output. Compare against the doc's claimed "49/49 passing."
- `grep` for `setTimeout`/`setInterval` inside `src/lib/anzan/` — should return nothing.
- `grep` for `getSession(` anywhere used for authorization — should return nothing.
- `grep` for imports of `src/lib/supabase/admin.ts` outside server-only/admin paths — should return nothing.
- `grep` for the four banned colors (`#FF6B6B`, `#121212`, `#1A1A1A`, `#E0E0E0`) across stylesheets/components.
- Confirm submission upserts specify `onConflict: 'session_id,student_id'`.
- Confirm whether migrations are additive-only in practice (no edited/deleted applied migrations in history).

This step produces evidence, not opinions. Every claim needs a file path or command output attached. Anything you can't confirm this pass, don't guess — mark it explicitly unresolved and carry it into Step E as a TBD, not a fact.

## Step D — Reconcile

Diff Step C's actual findings against the claims in the four project docs. Produce a discrepancy list: confirmed true, confirmed false, partially true, or unresolved (needs a deeper look in a later phase). This list is the *only* source Step E is allowed to draw from — not the docs directly.

## Step E — Generate the context-file system

If `.agent-context/` doesn't exist yet, create it now, using **only** what Step C verified and what Step D reconciled. If it already exists (continuing session), update it the same way. Either way, apply the sourcing rule strictly: if a line in one of these files isn't backed by something Step C actually checked, it doesn't go in as fact — it goes in as `TBD — unverified as of <date>`.

Create these seven, each with the structure below:

**`.agent-context/Handover.md`** — living state summary, rewritten each session, not appended to. Sections: *Last updated* / *Where things actually stand* (from Step D, not the docs) / *What's done* / *What's in progress* / *What's broken* (only Step C-confirmed defects, with evidence) / *What to avoid* / *Immediate next action*.

**`.agent-context/Decisions.md`** — a running log, newest at the bottom, entry = What / Why / Status. Seed it with the actual decisions already made across the planning sessions (stack kept, Next.js upgrade required by 2026-10-21, Refactor & Finish chosen, scope defined as fix + the named 10-item roadmap + specced frontend) — these are real decisions that happened, not code claims, so they're safe to carry forward as-is. Add a new entry for anything this recon itself resolved or discovered.

**`.agent-context/Architecture.md`** — system structure, but only the parts Step C actually confirmed: stack + versions, route groups, auth model, Server Actions pattern, timing engine mechanics, anti-cheat mechanics, realtime channel topology, offline pipeline. Every section cites the file/command that proves it. A "Not yet mapped" section lists anything the docs claim but Step C didn't reach this pass — explicitly, so nobody mistakes silence for confirmation.

**`.agent-context/Constraints.md`** — two parts. (1) Product/security invariants — only include ones Step C could actually check (RBAC pattern, service-role isolation, numeric wrapping, banned colors, etc.), each tagged `[VERIFIED]` with evidence or `[UNCONFIRMED]` if Step C didn't reach it. (2) Process invariants for this workflow itself — scope lock as defined in Step D of the planning conversation (fix + named roadmap + specced frontend, not open-ended), no schema edits outside migrations, no `git push` without explicit go-ahead, `.env` diffed every session, no "done" claims without terminal evidence, keep every context file short — prune before appending.

**`.agent-context/Flow.md`** — starts empty except for the entry format (trigger → path → files touched → verified-by). Only add an entry once a flow has actually been traced through real code, this phase or later. Don't backfill from documentation.

**`.agent-context/Rollback.md`** — git branch-per-phase, tag before touching timing engine/anti-cheat/auth, revert procedure if `tsc` or tests fail after an edit, migration-only DB changes (confirm the additive-only convention from Step C rather than asserting it), `.env` diff-and-restore procedure. This one's mostly process, safe to write directly — cite Step C only where it establishes a project-specific convention (e.g., migration behavior).

**`.agent-context/traces/TEMPLATE.md`** — the reusable Bug/Feature trace template (copied per issue as `BUG-<slug>.md` / `FEATURE-<slug>.md`, never edited directly). Fields: Title, Type, Phase, Related files, Related Decision/ADR, Scope, Attempts (chronological, keep failed ones), What worked, Verification (actual command + output), Context files updated (checklist). This file is pure structure — no MINDSPARK-specific content goes in the template itself.

## Step F — Build the phase plan

Produce `PHASE-PLAN.md` at the repo root, using Step D's reconciled findings — not the original doc claims — to decide what each phase actually needs to do. Use the skeleton below as a **starting point you're expected to revise**; if Step C turned up something the skeleton didn't anticipate, restructure around reality and log why in `Decisions.md`.

**Starting skeleton** (adjust freely):

| Phase | Goal                                                                                                                                                                                                                                                | Primary skill(s)                                                                                                    | Exit gate                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1–2  | Recon + ranked audit                                                                                                                                                                                                                                | `project-takeover-recovery`, `codebase-onboarding`, `ponytail-audit`, `inherit-legacy-style`                | `extensive_codebase_audit.md` produced, user sign-off — see `prompts/01-PHASE-1-2-RECON-AUDIT-PROMPT.md` |
| 3     | Critical security & data fixes (RBAC, Server Actions validation, anti-cheat gaps found in audit)                                                                                                                                                    | `systematic-debugging`, `karpathy-guidelines`, `tdd-workflow`                                                 | `tsc` 0 errors, relevant tests pass, `.env` diffed clean                                                  |
| 4     | Known active defects (`/api/sync`, missing `/admin/` prefixes) — only the ones Step C actually confirmed                                                                                                                                       | `systematic-debugging`, `full-output-enforcement`                                                               | routes verified working, no dead code left behind                                                             |
| 5     | Next.js 15 → 16.3+ upgrade —**deadline 2026-10-21, schedule this early, not last**                                                                                                                                                          | `search-dependencies`, `verification-before-completion`                                                         | full build + test suite green on new version                                                                  |
| 6     | Core engine hardening (timing engine, anti-cheat) per audit findings                                                                                                                                                                                | `karpathy-guidelines`, `tdd-workflow`                                                                           | timing jitter + anti-cheat behavior re-verified                                                               |
| 7     | State/architecture refactor (Dexie, hydration, component state) per audit findings                                                                                                                                                                  | `inherit-legacy-style`, `ponytail-audit`                                                                        | audit's flagged files resolved or explicitly deferred with reason                                             |
| 8     | Test suite completion — remaining Vitest files, Playwright E2E, 5-gate pre-launch checklist                                                                                                                                                        | `tdd-workflow`                                                                                                    | full suite green, evidence pasted                                                                             |
| 9+    | One phase per roadmap item (submit→completion, dashboard charts, results page, students table, publish flow, Create Level wiring, monitor table, announcements TipTap, settings forms, activity log) — order by actual dependency, not list order | `writing-plans` per feature, `design-taste-frontend`/`minimalist-ui` per `Constraints.md`, `tdd-workflow` | each feature's own acceptance criteria met, UI constraints verified                                           |
| Final | Staging deployment, 5-gate checklist re-run, production handover                                                                                                                                                                                    | `verification-before-completion`                                                                                  | staging green end-to-end                                                                                      |

For every phase you finalize: goal, entry criteria, exact skill(s) with canonical path, which `.agent-context/` files it reads before starting and updates when it ends, and the exit/verification gate. Don't pre-write Phase 9+'s individual execution prompts yet — generate those when each phase actually starts (see `prompts/EXECUTION-PROMPT-TEMPLATE.md`), informed by what the prior phase found.

## Step G — Commit, don't push

Create a working branch, commit the newly generated `.agent-context/` and `PHASE-PLAN.md`. Do not `git push`. Report the branch name and commit hash.

## Step H — Hard stop

Present: the Step C evidence summary, the Step D discrepancy list, the generated context files, and `PHASE-PLAN.md`. Wait for explicit user approval before starting Phase 1 execution. This mirrors the manifest's own Pre-Execution Gate rule (`AGENT_SKILLS_MANIFEST.md` §1.1) — don't skip it because this feels like "just planning."
