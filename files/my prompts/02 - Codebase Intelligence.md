# 02 — Codebase Intelligence (standalone)

**What this does:** point this at an unfamiliar codebase and it maps it end-to-end, then writes the full set of AI context files (`AGENTS.md`, `ARCHITECTURE.md`, `CONSTRAINTS.md`, `SECURITY.md`, `STATE.md`, `CODEBASE-MAP.md`, `.ai-style-rules.md`) so any AI coding tool can pick the project up cold. It documents; it does not build features or fix bugs. Self-contained — works in Antigravity, Claude Code, Cursor, or a plain chat with the repo attached.

---

## Fill in before sending

**Repo / scope:**
[Path to repo root, or a specific app/package if this is a monorepo and only part of it needs mapping.]

**Already known** (optional — skip anything you don't want re-derived):
[e.g. "Next.js 14 + Supabase, I know the stack already, just want conventions + docs."]

**Mode:**
- [ ] Full pipeline (recommended) — analyze everything, write all context files, apply the smallest fix needed if the app doesn't boot at all
- [ ] Docs only — don't touch any code, not even to fix a trivial boot blocker; just report if it doesn't boot

---

## Instructions (leave as-is)

You're mapping this codebase so any AI agent — including a future you with no memory of this session — can work on it correctly from the first message. Work autonomously; don't check in until you're done or genuinely blocked.

1. **Classify the codebase.** Hand-coded, AI-generated without structure, or abandoned/partially broken — from file signatures, not a guess. Note any existing context files and what's stale or wrong about them.

2. **Reconnaissance, then try to boot it — immediately, not at the end.** Stack, entry points, env/credential requirements, test setup, directory structure. Then actually attempt to start the app. Everything after this step is more reliable verified against a running app than guessed from source, so do this first.
   - If "Docs only" was checked above: don't fix anything even if it doesn't boot — just report exactly what failed.
   - Otherwise: if it doesn't boot, make one focused attempt at the smallest fix that makes it boot — a missing `.env` template, one broken import, one syntax error. Nothing more. Still broken after that? Stop trying, document what's broken and why in `STATE.md`, and continue the rest of the analysis statically.

3. **Deep-analyze every layer that exists:** frontend (components, design tokens — colors/type/spacing, routing, state management), backend (API routes, middleware, auth flow, business logic, error handling), database (schema, relationships, migrations, RLS/permissions, seed data, ORM conventions). If it's a monorepo, do this per app — never merge two apps into one architecture description.

4. **Extract conventions, don't invent them.** Scan file organization, state/control-flow patterns, infrastructure patterns, and error handling across the real codebase. Where you find genuinely conflicting conventions (half camelCase, half snake_case), flag the conflict — don't silently pick a winner.

5. **Write the context files, split into two tiers:**
   - **Always-loaded** (~100 lines each, summary + pointers, not the full detail): `AGENTS.md` (stack, commands, conventions — written inline, not a redirect elsewhere), `ARCHITECTURE.md` (system map + data-flow summary, links out for detail), `CONSTRAINTS.md` (Always / Ask First / Never), `SECURITY.md` (secrets policy, auth rules; flag hardcoded secrets by location, never copy the value), `STATE.md` (current status, known issues, boot status).
   - **On-demand, no line cap** — the exhaustive detail lives here: `CODEBASE-MAP.md` (directory-to-purpose map, full route/page/feature inventory, DB schema and relationships, design tokens) and `.ai-style-rules.md` (the codified conventions from step 4).
   - The always-loaded files must link to the on-demand files, never duplicate their content — that's how these docs rot.
   - If a `CLAUDE.md` (or similar tool-specific file) already exists, reconcile it with `AGENTS.md` rather than maintaining two sources of truth — merge one into the other and say which way you went.

6. **Trace one real request lifecycle end-to-end** (entry → validation → logic → database → response) and write it into `CODEBASE-MAP.md`. Verify it live if the app boots; say clearly if it's a static trace instead.

7. **Ship every file complete** — no truncated sections, no "similar for the rest."

8. **Before reporting done**, re-confirm boot status hasn't regressed, and walk your own output against this checklist — don't claim a file covers something it doesn't:
   - [ ] Stack/framework/DB/build/CI all identified
   - [ ] All 5 always-loaded files exist, each under the line budget
   - [ ] `CODEBASE-MAP.md` has directory map, route inventory, DB schema, and design tokens
   - [ ] `.ai-style-rules.md` written, conflicts flagged not silently resolved
   - [ ] One request lifecycle traced
   - [ ] Any found bugs are logged in `STATE.md`, not fixed — that's a separate pass

If you find an actual logic bug, feature gap, or design inconsistency while doing this: don't fix it. Note it in `STATE.md` with enough detail (what's wrong, where, how to reproduce) that it can be handed straight to a dedicated bug-fix pass afterward.
