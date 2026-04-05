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
