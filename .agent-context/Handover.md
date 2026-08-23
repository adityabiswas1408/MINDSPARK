# MINDSPARK Living State Handover

> **Protocol Note:** This file is rewritten every session to maintain a concise, evidence-backed summary of current reality. Never append old conversational logs here.

## Last updated
2026-08-23T15:40:00+05:30 (Master Recon & Context Initialization)

## Where things actually stand
- **Codebase Health:** Clean TypeScript build (`npm run tsc` exited with code 0).
- **Test Suite:** 7 test suites passing (49/49 unit/integration tests green via `vitest run`).
- **Database Migrations:** 27 migrations present in `supabase/migrations/`, verified additive-only in git history.
- **Rogue Route / Prefix Audit:** `/api/sync` confirmed non-existent in repo. All admin routes are correctly nested under `src/app/(admin)/admin/`.
- **RBAC & Security:** Server actions strictly guarded with `requireRole()` using `supabase.auth.getUser()`. `adminSupabase` restricted to server handlers, server actions, and admin pages.
- **Timing & Visual Engine:** `src/lib/anzan/` verified free of `setTimeout`/`setInterval`. Frame timing governed by delta timing.

## What's done
- Base database schema and 27 migrations.
- Flash Anzan timing engine (`src/lib/anzan/timing-engine.ts`) & number generator.
- Anti-cheat sub-system (`src/lib/anticheat/clock-guard.ts`, teardown & tab monitor).
- Offline sync engine and staging table RPC handler.
- Core admin pages (`dashboard`, `assessments`, `levels`, `monitor`, `results`, `settings`, `students`, `announcements`, `activity-log`).
- Student exam flow (`lobby`, `assessment/[id]`, `results`).
- Unit tests for timing engine, clock guard, profile helpers, results actions, and score components.

## What's in progress
- Initializing the 7-file `.agent-context/` system and structured `PHASE-PLAN.md`.
- Preparing for Phase 1-2 extensive audit and remaining feature wiring.

## What's confirmed broken (evidence-backed)
- **Trigger bug on `student_answers`:** `update_student_answers_modtime` trigger executes `update_modified_column()` setting `NEW.updated_at = NOW()`, but `student_answers` table has no `updated_at` column. Any `UPDATE` or `ON CONFLICT DO UPDATE` on `student_answers` fails with `ERROR 42703 (record "new" has no field "updated_at")`.

## What's unverified (not yet exercised — absence of evidence is not evidence of correctness)
- Create Level button wiring
- Full student submission-completion flow
- TipTap editor integration
- Realtime broadcast/presence channels (`exam:{paper_id}`, `lobby:{paper_id}`)
- Recharts rendering at real dataset volumes
- Playwright E2E execution

## What to avoid
- **NEVER** use `getSession()` for authorization decisions.
- **NEVER** import `src/lib/supabase/admin.ts` into client components or student routes.
- **NEVER** use `setTimeout` or `setInterval` in Anzan timing code.
- **NEVER** modify applied migrations directly; always write new additive migration files.
- **NEVER** use banned color hex codes (`#FF6B6B`, `#121212`, `#1A1A1A`, `#E0E0E0`).
- **NEVER** execute `git push` without explicit user permission.
- **NEVER** start a new phase without reading `GOTCHAS.md` first — known mistakes from earlier phases live there.

## Immediate next action
- Wait for user approval on Master Recon, `.agent-context/` generation, and `PHASE-PLAN.md` (Step H Hard Stop).
