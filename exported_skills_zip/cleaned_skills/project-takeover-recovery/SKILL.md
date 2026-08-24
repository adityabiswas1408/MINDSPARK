---
name: project-takeover-recovery
description: >-
  Takes over an existing, unfamiliar codebase in any language or stack — fixes broken features, cleans up AI-slop or amateur UI, and gets it working exactly as originally intended — under a strict, user-defined scope contract (no features added, no features removed, unless explicitly told otherwise). Use this whenever the user hands over someone else's project, an old project of their own, or a "half-built" / "some stuff doesn't work" codebase and wants it debugged, finished, or cleaned up rather than rebuilt. Trigger on phrases like "my friend's project is broken", "take over this codebase", "fix and clean up this project", "finish this half-done app", "the UI looks AI-generated, make it look real", or any request to inherit and repair code the agent didn't write and doesn't yet understand. Do not use this for building something new from scratch — that's project-context-system or mvp-c...
---

# Project Takeover & Recovery

A protocol for the specific, high-risk situation of inheriting code you didn't write, don't yet understand, and could easily make worse by guessing. The core discipline is: **recon before diagnosis, diagnosis before fixing, and a scope contract that gets checked at the end, not just agreed to at the start.**

This skill is stack-agnostic by design — everything in Phase 1 adapts to whatever the recon actually finds, rather than assuming a particular language or framework.

## Prerequisites — the Takeover Brief

Before real work starts, you need a filled-out brief. If the user hasn't given you one, use `clarifying-requests` (if installed) or ask directly — in one batch, not a drip of questions — for whatever's missing from this list. Don't guess any of these; a wrong guess here is the difference between "fixed the login bug" and "quietly redesigned the auth system."

1. **Tech stack** — or "figure it out" if they don't know; Phase 1 handles that case.
2. **Scope lock** — what's explicitly in scope (debug/fix, cleanup, UI pass) and what's explicitly out (new features, feature removal, framework changes). Default assumption if unstated: **fix-only, zero features added, zero features removed.**
3. **Feature parity requirement** — must every existing feature keep working exactly as originally designed? (Usually yes — confirm rather than assume.)
4. **Environment & credentials rule** — almost always: use what's already in the codebase (`.env`, existing credentials), never overwrite or lose them. Confirm this explicitly since it's the single easiest thing to accidentally break.
5. **Server/launch automation** — does the user want a start script (e.g. `start-server.bat`, `start.sh`, a `docker-compose up`, a `Procfile`) that boots everything needed concurrently? What should it be named/placed?
6. **UI/aesthetic tier**, only if UI work is in scope — see Phase 4. Get a concrete anchor ("looks handcrafted by a student," "looks like a real internal tool," "premium/agency-level") rather than just "make it look better."
7. **Which sibling skills to lean on** — default recommendation if the user has no preference: `codebase-onboarding` or `inherit-legacy-style` for recon, `systematic-debugging` for fixes, `redesign-existing-projects` for UI, `verification-before-completion` before declaring anything done, `karpathy-guidelines` throughout to keep diffs surgical, and `ponytail` when a fix seems to call for a new helper or dependency — a takeover is exactly the wrong moment to introduce a library the original codebase didn't have; reach for stdlib or the project's own existing utils first. `ponytail-review` is worth running on the diff before Phase 6 handover to catch any fix that quietly got more complex than the bug required.

A worked example of a fully-specified brief — a real MERN-stack case, used here to show the *level of detail* a good brief needs, not as something to run against a real repo unless one is actually attached — is in `references/example-takeover-brief.md`. Read it once to calibrate what "specific enough" looks like; don't execute it.

## Entry Point

Do this first, every time this skill is invoked:

1. Look for `RECON.md` at the repo root.
   - **Found it** → recon already happened in a prior session. Read `RECON.md`, `FEATURE-AUDIT.md`, and `STATE.md` if present. Summarize where things stand and ask what to continue with. Resume at whichever phase the audit shows is incomplete.
   - **Not found** → first run. Confirm the Takeover Brief (above) is complete enough to proceed. If it isn't, get it now — don't start touching code on partial information.
2. State the detected or confirmed scope lock back to the user in one sentence before doing anything else, so there's no ambiguity about what "done" means later: *"Got it — fix-only, zero features added or removed, and I'll use your existing .env as-is."*

## Non-negotiable rules (apply across every phase)

- **Scope lock is absolute.** If a "fix" seems to require adding a feature or dropping a broken one, stop and ask — never resolve that tension by silently expanding or shrinking scope.
- **Never overwrite or lose existing credentials.** Diff `.env`/secrets files before and after your session; if anything changed that you didn't intend, that's a stop-and-report situation, not a fix-it-quietly one.
- **Surgical diffs only.** Touch the lines tied directly to the feature you're fixing. This is `karpathy-guidelines`'s discipline if installed — this skill enforces the same rule even without it.
- **No claiming "fixed" without running it.** Every fix gets an actual reproduction and an actual re-verification, not a plausible-sounding explanation. This is `verification-before-completion`'s discipline if installed — enforced here regardless.
- **No truncated or elided fixes.** Every file this skill touches gets written in full — no `// rest of file unchanged` placeholders standing in for a real edit. This is `full-output-enforcement`'s discipline if installed — enforced here regardless, since a half-written fix on someone else's working code is worse than no fix at all.

## Phases

Phases are not fixed-length — a phase this size on a small app might be one task; on a large inherited codebase it could be dozens. A phase ends when its exit criteria are met.

### Phase 0 — Intake
*(see Entry Point and Prerequisites above)*
**Exit criteria:** a complete Takeover Brief, confirmed back to the user in plain language.

### Phase 1 — Recon (any language)

Don't diagnose or fix anything yet — just map what exists. If `codebase-onboarding` and/or `inherit-legacy-style` are installed, invoke them now; otherwise do this inline:

- **Detect the stack** from what's actually present — manifest/lockfiles are the fastest signal (`package.json`, `requirements.txt`/`pyproject.toml`, `go.mod`, `Cargo.toml`, `composer.json`, `Gemfile`, `pom.xml`/`build.gradle`, `*.csproj`, etc.). Confirm against the brief rather than overriding it — if they disagree, ask.
- **Find entry points** — how the app actually starts (scripts in the manifest, a `main`, a `Procfile`, existing `.bat`/`.sh` launchers).
- **Find environment/credentials** — locate `.env`/config files and note what they contain *without* copying secret values into any document you write.
- **Find existing tests**, if any, and whether they currently pass.
- **Map the routes/pages/modules** that exist right now — this becomes the master list for Phase 2's audit, so be exhaustive here rather than sampling.
- **Optionally check for existing bloat**, if `ponytail-audit` is installed — a whole-repo pass here can surface over-engineered abstractions worth knowing about. Report it as an observation for the user to weigh in on, not something to fix unprompted; the scope lock in Phase 0 still governs what actually gets touched.

Write findings to `RECON.md`:

```markdown
# Recon

## Detected stack
<what you found, and how you confirmed it>

## Entry points
<how the app starts, current launch method if any>

## Environment
<where secrets live — names/locations only, never values>

## Existing tests
<what exists, current pass/fail status>

## Feature inventory
<every route/page/module found, unannotated — the audit happens in Phase 2>
```

**Exit criteria:** `RECON.md` exists and its feature inventory is exhaustive enough that Phase 2 isn't still discovering new features mid-audit.

### Phase 2 — Feature Audit

Take the feature inventory from `RECON.md` and mark each one Working / Broken / Unknown by actually exercising it, not by reading the code and guessing. Write `FEATURE-AUDIT.md`:

```markdown
# Feature Audit

| Feature | Status | Notes |
|---|---|---|
| <name> | Working / Broken / Unknown | <what you observed> |
```

This table is the scope-lock enforcement mechanism: the row count at the end of Phase 6 must match the row count here. Nothing added, nothing removed — only statuses change.

**Exit criteria:** every row has a real status, none left as "Unknown" without at least one attempt to exercise it.

### Phase 3 — Fix Loop

For each Broken (and resolved-Unknown-turned-Broken) row: one full cycle, ideally via `systematic-debugging` if installed (reproduce with a minimal case → trace the actual root cause → apply the minimal fix → verify without regressions), done inline with the same four steps if it isn't. When choosing *how* to fix something, follow `ponytail`'s minimalism ladder if installed — standard library, then the project's own existing utils, then native platform features, before reaching for a new dependency; the brief's tech-stack lock (Phase 0) usually already forbids new frameworks, but this covers the smaller case of "just one little helper package" too. If the ladder is genuinely exhausted and a new dependency really is the minimal fix, run it past `search-dependencies` (if installed) before adding it — vet what's actually being pulled in rather than grabbing the first package that looks right.

- If a genuine fix seems to require scope creep (new feature, dropped feature, new dependency the brief didn't allow), **stop and ask** — don't resolve it unilaterally in either direction.
- If three consecutive fix attempts on the same feature fail, stop and re-examine your assumptions about the root cause rather than trying a fourth speculative fix.
- Update `FEATURE-AUDIT.md`'s status the moment a feature is verified fixed — don't batch these updates.

**Exit criteria:** every row in `FEATURE-AUDIT.md` is Working, or explicitly flagged and discussed with the user as an exception to the parity requirement.

### Phase 4 — Environment & Ops

- **Confirm credentials are untouched** — re-diff `.env`/secrets against Phase 1's recon; anything unexpected gets reported before you continue.
- **Build or update the launch automation** requested in the brief, matched to the detected stack (a `.bat` for Windows-targeted Node/Mongo stacks, a `.sh` or `Procfile`/`docker-compose.yml` otherwise) — it should start every required process concurrently with one command, using the existing credentials in place, not new placeholder ones.

**Exit criteria:** one command boots the whole stack, using the project's real, existing configuration.

### Phase 5 — UI/Aesthetic Pass (only if the brief puts UI in scope)

Hand off to `redesign-existing-projects` at the tier the brief specified, with `inherit-legacy-style` informing what to preserve versus what to change. If neither is installed, apply the same principle directly: match the stated tier (e.g. a clean, handcrafted "student/bootcamp" look — structured and neat, but not enterprise-polished) while avoiding generic AI-default tells regardless of tier — no purple glow gradients, no interchangeable equal-width feature cards with no visual hierarchy, no unearned motion or shadow stacking. The goal is a UI that looks like a specific person made deliberate choices, at whatever polish level the brief asked for — not "more AI slop at a different intensity."

This phase never adds or removes a feature to "improve" the UI — restyling existing screens only.

**Exit criteria:** every screen in the feature audit still does exactly what it did before, and matches the requested aesthetic tier.

### Phase 6 — Verification & Handover

- Run `verification-before-completion`'s discipline (or the same steps inline): actual commands, actual output, for every claim about to be made.
- Reconcile `FEATURE-AUDIT.md` one last time — row count must match Phase 2's original count, every row Working (or an agreed, explicit exception).
- Write `HANDOVER.md` (or update `STATE.md` if `project-context-system`/`mvp-context-kit` is also in use on this repo):

```markdown
# Handover

**Completed:** <date>

## What was fixed
<per-feature summary, plain language>

## What changed in the environment/launch setup
<the start script, and confirmation credentials are untouched>

## Anything still open
<explicit exceptions to parity, if any, and why>
```

**Exit criteria:** the user has a working project matching the original feature set exactly, a way to launch it in one step, and a plain-language record of what was done.

## Checkpoint Protocol

After every completed task — not just at phase boundaries:

1. Update `FEATURE-AUDIT.md` and/or `RECON.md`/`HANDOVER.md` for whatever this task touched.
2. A short, plain-language summary of what just got fixed or found — describe the user-visible effect, not the code change.
3. A plain-language description of what's next and why.
4. Ask explicitly whether to continue, and stop — wait for the reply.

Example: *"Fixed it — the login button wasn't actually checking the password against the database, so anyone could log in as anyone. It's now verifying properly and I tested it with both a correct and incorrect password. Next I'll look at the broken profile page. Want me to keep going?"*

## Reference files

- `references/example-takeover-brief.md` — a fully worked, real-world MERN-stack Takeover Brief, included to show what "specific enough" looks like. Treat it as a calibration example, not a task to execute, unless the user has attached an actual matching project and confirmed they want it run.
