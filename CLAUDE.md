# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
Mental arithmetic assessment platform for ages 6–18.
Stack: Next.js 15, Supabase (PostgreSQL), shadcn/ui, Tailwind v4, Zustand, Dexie 4.

Production: https://mindspark-one.vercel.app
Supabase project: ahrnkwuqlhmwenhvnupb
GitHub: https://github.com/adityabiswas1408/MINDSPARK
Branch: main

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run tsc          # type-check (must be 0 errors before every commit)
npm run lint         # ESLint on src/
npm run test         # vitest unit tests (jsdom env)
npm run test:unit    # same with verbose reporter
npm run test:e2e     # Playwright end-to-end
npm run test:integration  # vitest with vitest.config.integration.ts
```

Run a single test file: `npx vitest run src/lib/anzan/timing-engine.test.ts`

Coverage thresholds (enforced in CI): 90% lines and functions across `src/lib/anzan/`, `src/lib/anticheat/`, `src/lib/offline/`.

**Shell note (Windows):** Use `;` not `&&` when chaining commands in PowerShell.

## Architecture

### Route Groups
- `src/app/(admin)/admin/` — 10 admin pages, each behind `requireRole('admin')`
- `src/app/(student)/student/` — student pages, behind `requireRole('student')`
- `src/app/api/` — Route Handlers: `offline-sync`, `teardown`, `consent/verify`
- `src/app/actions/` — Server Actions for every domain (assessments, students, results, levels, announcements, settings, activity-log, auth)

### Auth & RBAC
Role is read from JWT `app_metadata.role` — **never** from the client payload.
`requireRole()` in `src/lib/auth/rbac.ts` calls `supabase.auth.getUser()` (server-validated), not `getSession()`.
Every Server Action starts with:
```ts
const authResult = await requireRole('admin');
if ('error' in authResult) return { error: authResult.error };
const { userId, institutionId } = authResult;
```
`src/lib/supabase/admin.ts` is banned inside `(student)/` routes, client components, and hooks.

### Server Action Return Type
All actions return `ActionResult<T>` from `src/lib/types/action-result.ts`:
```ts
{ ok: true; data: T }          // success
{ ok?: false; error: string }  // failure
```

### Flash Anzan Engine (`src/lib/anzan/`)
Uses `requestAnimationFrame` — **no `setTimeout`/`setInterval`**. The RAF loop is in `timing-engine.ts`:
- Accumulator pattern prevents drift across frames
- Delta clamped at `1.5 × interval` to handle tab-restore spikes
- Hard minimum: 200 ms per flash (`MINIMUM_INTERVAL_MS`)
- Sub-200 ms requires `neurologist_approved` flag on the student profile
- Phase constant: always `PHASE_2_FLASH`, never the bare string `'FLASH'`
- Negative numbers rendered in `#991B1B` only — no other use of that colour

### Anti-Cheat (`src/lib/anticheat/`)
- `clock-guard.ts` — detects system clock skew
- `tab-monitor.ts` — detects tab switching during exams
- `teardown.ts` — forced session close path (called by Route Handler, not client)

### Offline Sync (`src/lib/offline/`)
- Dexie 4 IndexedDB store (`indexed-db-store.ts`) queues `PendingAnswer` rows
- `sync-engine.ts` flushes to `/api/submissions/offline-sync` when online
- HMAC signing is server-side only — the secret never reaches the browser
- RPC for submission: `validate_and_migrate_offline_submission`

### Supabase Clients
| File | When to use |
|------|-------------|
| `src/lib/supabase/client.ts` | Client components |
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| `src/lib/supabase/admin.ts` | Admin-only server code (never in student routes) |
| `src/lib/supabase/middleware.ts` | `middleware.ts` only |

### Component Pattern
Pages are Server Components that fetch data and pass it to `'use client'` sub-components.
shadcn/ui components are Base UI–based — use them as-is from `src/components/ui/`.
Charts use `recharts` (already installed). Drag-and-drop uses `@hello-pangea/dnd`. Rich text uses TipTap.
Tables use `@tanstack/react-table`.

## Hard Constraints — Never Violate
- No new Supabase migrations — all DB fixes via Supabase SQL editor
- JWT role path: `(auth.jwt() -> 'app_metadata') ->> 'role'`
- Never commit `.env` files or secrets
- Banned colours: `#FF6B6B` `#121212` `#1A1A1A` `#E0E0E0`
- `#991B1B` for negative arithmetic flash numbers ONLY
- No `setTimeout`/`setInterval` anywhere in `src/lib/anzan/`
- Phase string: `PHASE_2_FLASH` — never just `'FLASH'`
- `src/lib/supabase/admin.ts` banned in `(student)/` routes, client components, hooks
- `npm run tsc` must report 0 errors before every commit
- DOMPurify is banned — use `sanitize-html` server-side

## Design System
```
Primary green:    #1A3829  (sidebar, CTAs, primary buttons)
Brand navy:       #204074  (login page background)
Page background:  #F8FAFC
Card background:  #FFFFFF
Card border:      #E2E8F0
Body text:        #0F172A
Secondary text:   #475569
Error:            #DC2626 on #FEE2E2
Live badge:       #FFFFFF on #EF4444
Font UI:          DM Sans
Font numbers:     DM Mono (always tabular-nums)
```

## Tailwind v4 Notes
- Colour tokens defined via `@theme inline` in `globals.css` — **not** in `tailwind.config.ts`
- Slate palette lives in that `@theme inline` block
- Sidebar uses `.admin-sidebar` CSS class — never `hidden md:flex` (v4 cascade bug)
- `bg-bg-page`, `bg-green-800`, `border-slate-200` all compile correctly

## Before Any DB Operation
Read GOTCHAS.md database section first.
Known live DB divergences are documented there.
Never assume migration files reflect live DB.

## Database Schema (key tables)
| Table | Key columns |
|-------|-------------|
| `exam_papers` | `id, title, type (EXAM\|TEST), status (DRAFT\|PUBLISHED\|LIVE\|CLOSED)` |
| `questions` | `id, paper_id, question_type, content, options, correct_option` |
| `assessment_sessions` | `id, paper_id, student_id, started_at, closed_at` |
| `submissions` | `id, session_id, student_id, paper_id, completed_at` |
| `student_answers` | `id, submission_id, question_id, selected_option, idempotency_key` |
| `students` | `id, roll_number, full_name, level_id, institution_id, consent_verified` |
| `levels` | `id, name, institution_id, sort_order` |
| `activity_logs` | `id, user_id, institution_id, action_type, entity_type, metadata` |
| `profiles` | `id, institution_id, role, forced_password_reset` |

## What Needs Building
All admin and student pages are placeholder shells. Designs are in `docs/designs/` (admin.pdf, student.pdf).

Priority:
1. Create Assessment wizard (3 steps: Type → Questions → Config) — button exists, handler missing
2. Admin Dashboard (recharts KPI cards, score trend, level distribution)
3. Student Dashboard (live exam hero card, upcoming list)
4. Admin Students (filters, paginated table, profile page)
5. Admin Assessments (EXAM/TEST tabs, status management)
6. Student exam flow (lobby → flash → MCQ → submit)
7. Admin Results (grade distribution chart, publish flow)
8. Admin Monitor (real-time student table)
9. Admin Announcements (TipTap editor)
10. Admin Levels (drag-handle cards)
11. Admin Settings (institution form, grade boundaries)
12. Admin Activity Log (filterable table)

## Vercel Env Vars (production)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `HMAC_SECRET`, `OFFLINE_SYNC_SECRET`

## MCP Tools: code-review-graph

**ALWAYS use graph tools BEFORE Grep/Glob/Read.** The graph is faster and gives structural context file scanning cannot.

| Tool | Use when |
|------|----------|
| `semantic_search_nodes` / `query_graph` | Exploring code instead of Grep |
| `get_impact_radius` | Blast radius of a change |
| `detect_changes` + `get_review_context` | Code review without reading full files |
| `query_graph` callers_of/callees_of/imports_of/tests_for | Tracing relationships |
| `get_architecture_overview` + `list_communities` | Architecture questions |
| `refactor_tool` | Planning renames, finding dead code |

Fall back to Grep/Glob/Read only when the graph doesn't cover what you need. Graph auto-updates on file changes via hooks.

## Mandatory Before Any Code Change
Before writing or editing any file, state in 3 bullet points:
1. What file(s) will change
2. What the change is
3. What could go wrong
Wait for user confirmation before proceeding.
Exception: single-line fixes and import additions.

## Working Rules — Follow These Without Exception

### Before Any Changes
Before making ANY changes, provide:
- 3 bullet points describing your approach
- If debugging: what broke, root cause, and 
  proposed fix (one line each)
- Wait for explicit "proceed" before writing 
  any code or making any edits

### Response Style
- Be concise in all responses
- No explanations unless I ask
- After completing a step: one line summary 
  with status: PASS / FAIL / NEEDS ATTENTION
- Never summarize what you just did in detail

### MCP Tool Results
After any MCP tool returns a large result,
summarize the key finding in 1-3 lines only.
Do not reproduce the full result in your response.
suggest to Use /compact only when the session exceeds 30 messages.

### Database Mutations
- Before ANY UPDATE or INSERT, run SELECT 
  with the same WHERE clause first
- Show matching row count
- Only proceed with mutation if count > 0
- If count = 0, stop and investigate why

### Task Scope
- Each session has exactly one goal
- State the goal in the first message
- Do not start a new goal until current 
  goal's validator fully passes
- If blocked for more than 2 attempts, 
  stop and report blocker — do not retry 
  same approach a third time

## Before Debugging Any Build Error
1. Run: git diff HEAD~1 --name-only
2. Check if a recent Claude-made change 
   could be the cause
3. If yes, revert it first and rebuild
4. Only add new fixes after ruling out 
   own changes as the cause

## Webpack
- Never override webpack hash functions
- sha256/WasmHash overrides cause build failures
- If build fails: run git diff HEAD~1 --name-only
  and revert any webpack config changes first

## Code-Review-Graph Build
- If build stalls on same file for more than 120s: abort
- Do not retry the same approach
- Continue the task without the graph
- Skip detect_changes_tool — it is known slow
## Before Any Status/Enum Column Update
Run this first:
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE table_name = '[table]';
Verify the exact allowed values match 
what you plan to insert.
Never assume casing — always verify.

### Before Any Upsert Operation
Run this first to verify the exact unique index:
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = '[table]';

Never guess the conflict key.
Use the exact columns from the unique index.
Composite indexes require all columns listed.

### Modals and Overlays
Any component that must appear above all content
(completion cards, dialogs, toasts) must use:
  createPortal(content, document.body)

Never rely on z-index alone when parent has
overflow: auto or overflow: hidden.
These create stacking contexts that trap 
fixed/absolute children.

### Browser Testing Rules
Never use evaluate() or querySelector clicks 
for interactive UI elements.
Always use chrome-devtools click tool which
goes through the real browser event system.

If an element cannot be clicked via the click
tool, find out why — do not fall back to JS
evaluate() as it bypasses React synthetic events
and Zustand store updates will not fire.

### Clicking Dialog Buttons (Base UI Components)
Base UI dialogs render a data-base-ui-inert overlay
that blocks automated clicks on background elements.

When clicking inside a dialog:
1. First verify the dialog is open:
   document.querySelector('[role="dialog"]')
2. Click buttons using the chrome-devtools 
   click tool by targeting the exact button text
3. Never use querySelector fallback for dialog 
   confirm buttons — find the correct selector first
4. If click times out: check for inert overlay
   before assuming the button is missing

### Screenshot Policy
Screenshots cost ~6k tokens each.
Maximum 3 screenshots per session.

Use snapshots (accessibility tree) instead:
chrome-devtools get_page_text or take_snapshot
returns text content at ~200 tokens.

Only use take_screenshot when:
- Verifying visual layout (colours, positioning)
- Something is invisible and you need to see why

For all functional verification (button exists,
text content, URL, form values) use:
take_snapshot or get_page_text instead.

## Agent Behavior
- Do NOT spawn subagents for file reading or planning.
  Read files sequentially in the current context.
- Do NOT parallelize tool calls unless the task 
  explicitly states "run in parallel".
- Complete all file reads, planning, and coding 
  in a single agent context.
- Prefer sequential tool calls over concurrent 
  subagent dispatch.
- Exception: load testing scripts (k6) and 
  independent shell commands may run in parallel.

## Session Management
- One Claude Code session per day
- Use /compact between tasks, not new sessions
- MCP servers stay connected across /compact
- Use /clear only if context confusion persists
  after /compact
- Never close and reopen session just to start 
  a new task

## Editing TASKS.md
- TASKS.md is ~2000 lines
- Use Grep to locate sections before any edit
- Use targeted Edit with exact old_string only
- Never rewrite the full file
- Never replace section headers with placeholders
- Use /task-advance skill for all task promotions

## If frontend-design Skill Is Missing
Run: npx skills add https://github.com/anthropics/skills 
     --skill frontend-design --yes --global
This must be re-run on any new machine or after 
clearing .agents/skills/ cache.

## Verification After Every Deploy

### Step 1 — Always run core flow first
After any deploy, always run /verify-exam-flow first.
This confirms existing student flow is not broken
by the new changes. Never skip this step even for
admin-only changes.

### Step 2 — Add task-specific checks after
After /verify-exam-flow passes, run the additional
checks from the current task's Validator in TASKS.md.

Pattern for every deploy:
  /verify-exam-flow
  → PASS: continue to task-specific checks
  → FAIL: stop, fix the regression before continuing

### Step 3 — Admin page changes
If the task touched admin pages, also run:
  /verify-admin-pages
Then run task-specific DB queries from TASKS.md.

### Task-specific verification format
After the skill runs, paste only the relevant
Validator items from TASKS.md for the current task:

  "Also verify these task-specific items:
  1. [exact check from TASKS.md validator]
  2. [exact DB query from TASKS.md validator]
  3. [exact UI element from TASKS.md validator]"

### Screenshot budget
Maximum 3 screenshots total across both skill
and task-specific verification.
Use take_snapshot for all functional checks.
Use take_screenshot only for visual layout checks.

### Declaring a task done
A task is DONE only when:
  /verify-exam-flow → all steps PASS
  /verify-admin-pages → all steps PASS (if admin)
  All TASKS.md Validator items → PASS
  Zero console errors confirmed
  DB state confirmed via SQL query
Never declare done from build logs or tsc alone.

## Before Any Task Touching the DB
Run schema verification for all tables involved:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = '[table]'
ORDER BY ordinal_position;
Cross-reference with GOTCHAS.md known divergences.

## Plan Requirements — Before Any Proceed

Every 3-bullet plan must include a 4th item:

Bullet 4 — Hidden assumptions:
List every assumption the plan makes that could
be wrong:
- DB column names assumed (verify before coding)
- FK constraints assumed (verify before joining)
- CSS containment assumed (verify before fixed pos)
- Package APIs assumed (verify against context7)
- Existing component props assumed (verify by reading)

If any assumption is unverified — verify it first.
Add the verification result to the plan.
Only then say proceed.

Example of a good plan:
- Files changing: X, Y, Z
- What changes: [description]
- What could go wrong: [risk]
- Assumptions to verify first:
  submissions.paper_id exists → confirmed via 
  information_schema query above
  parent has no overflow:auto → confirmed via 
  chrome-devtools computed styles check

Example of a bad plan:
- Files changing: X, Y, Z  
- What changes: [description]
- What could go wrong: [risk]
← no assumption verification = not ready to proceed

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes   gives risk-scored analysis |
| `get_review_context` | Need source snippets for review   token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
