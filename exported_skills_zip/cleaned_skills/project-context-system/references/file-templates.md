# File Templates — Project Context System

Use these as starting shapes. Delete sections that don't apply to this project rather than leaving them as unfilled placeholders — an empty template section left in place is worse than not having the file. Everything in angle brackets `< >` is meant to be replaced or removed.

---

## `AGENTS.md` / `CLAUDE.md` (root) — fallback, only if `codebase-onboarding` isn't installed

```markdown
# <Project Name>

## Stack
<languages, frameworks, database, key infra — one line each>

## Build & test
- Install: `<command>`
- Run dev: `<command>`
- Test: `<command>`
- Build: `<command>`

## Code style deltas
<only things that differ from the language/framework default — don't restate defaults>

## Repo etiquette
<branch naming, commit format, PR expectations — only if the repo actually enforces these>

## Where things live
<a few sentences, not a file tree — point to ARCHITECTURE.md for the real map>
```

---

## `ARCHITECTURE.md` (root)

```markdown
# Architecture

## System map
<services/modules and how they talk to each other — a short diagram-in-prose or an actual diagram>

## Why it's shaped this way
<the load-bearing reasons — not a history lesson, just what a new session needs to not accidentally undo>

## Data flow
<request lifecycle at a high level — one paragraph or a short list>

## Key boundaries
<what owns what — e.g. "auth service is the only thing that reads the users table">
```

Keep this to the map, not an inventory. A file-by-file listing goes stale on the next commit — don't include one.

---

## `CONSTRAINTS.md` (root)

```markdown
# Constraints

## Always
<things every change must do — e.g. "all DB access goes through the repository layer">

## Ask First
<things that need a human sign-off before proceeding — e.g. "changing the public API shape">

## Never
<hard lines — e.g. "never touch migrations directly", "never commit .env">

> Any "Never" item that's truly non-negotiable should also be backed by a real enforcement
> mechanism (pre-commit hook, permission rule) — flag these to the user rather than trusting
> the sentence alone to hold under pressure mid-session.
```

If `.ai-style-rules.md` exists (from `inherit-legacy-style`), pull its hard rules in here instead of keeping two separate sources of truth for the same thing.

---

## `SECURITY.md` (root)

```markdown
# Security

## Secrets
<never in code or shipped to the client — where they actually live instead (env vars, secret manager)>

## Data access
<parameterized queries only; no string-built SQL; ORM usage rules if applicable>

## Auth & sessions
<how auth works, session/token lifetime, what a protected route must check>

## Tenant isolation
<if multi-tenant: what guarantees no tenant can see another's data — name the actual mechanism>

## Input validation baseline
<where validation happens — edge, API layer, or both — and what's non-negotiable>
```

This file has no owner anywhere else in a typical skill set — don't skip it because it feels like it overlaps with `CONSTRAINTS.md`. Constraints is behavioral ("don't touch X"); this is the actual security posture ("here's how auth works and why it's safe").

---

## `STATE.md` (root) — rewritten, not appended, every session

```markdown
# State

**Last updated:** <date>

## Status
<one line: healthy / needs attention / broken>

## Done
<what's actually finished and verified>

## In progress
<what's being worked on right now, and by which feature's SPEC/PLAN>

## Broken
<known-broken things, with a pointer to the relevant bugs/<slug>.md if one exists>

## Avoid
<things that look fine but aren't — traps for the next session>
```

---

## `DECISIONS.md` (root) — only if `architecture-decision-records` isn't installed; otherwise use its ADR index instead

```markdown
# Decisions

## <YYYY-MM-DD> — <short title>
**Decision:** <what was decided>
**Why:** <the actual reasoning, including what was rejected and why>
```

Append-only. Never edit past entries to "correct" them — add a new entry that supersedes the old one and say so.

---

## `bugs/<slug>.md`

```markdown
# Bug: <short description>

**Status:** open / fixed
**Found:** <date>

## Reproduction
<minimal steps to trigger it>

## Root cause
<the actual cause, not the symptom>

## Fix
<what changed, and why this and not a workaround>

## Verification
<the actual command/output that proves it's fixed>
```

---

## `features/<slug>.md`

```markdown
# Feature: <name>

**Shipped:** <date>

## What it does
<from the user's perspective>

## How it works
<the non-obvious parts — skip anything a reader could get from the code itself>

## Verification
<the actual check that proves it works end to end>
```

---

## `TESTING.md` (root)

```markdown
# Testing

## Commands
- Unit: `<command>` — expected: <what a clean run looks like>
- Integration: `<command>` — expected: <...>
- E2E: `<command>` — expected: <...>

## Manual checks
<anything that can't be automated yet — be specific about steps and expected result>
```

If `tdd-workflow` is installed and producing `docs/testing/<task>.tdd.md` reports, this file aggregates the durable commands from those reports — it doesn't duplicate every report in full.

---

## `ROLLBACK.md` (root)

```markdown
# Rollback

## <deploy/change type>
**How to undo:** <actual steps — revert command, migration-down, feature flag off>
**How to confirm it worked:** <what to check afterward>
```

Only needs its own file once real deploys exist. Before that, a short section in `DECISIONS.md` covering "how would we undo this" is enough.

---

## `FLOW.md` (root) — only once the project has more than one service

```markdown
# Flow

## <name of a key request/data path>
<the lifecycle across service boundaries — where it starts, what it touches, where it ends,
and what happens on failure at each hop>
```

This is where multi-service bugs actually hide — a request that looks fine at each individual service can still be broken in how it crosses between them.
