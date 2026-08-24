# MINDSPARK Living State Handover

> **Protocol Note:** This file is rewritten every session to maintain a concise, evidence-backed summary of current reality. Never append old conversational logs here.

## Last updated
2026-08-24 (Phase 4 Close-Out)

## Where things actually stand
- **Codebase Health:** Clean TypeScript build (`npm run tsc` exited with code 0).
- **Test Suite:** 8 test suites passing (51/51 unit/integration tests green via `vitest run`).
- **Database Migrations:** 28 migrations present in `supabase/migrations/` (added rich text support for announcements).
- **RBAC & Security:** Server actions strictly guarded with `requireRole()` using `supabase.auth.getUser()`. TipTap inputs sanitized via `isomorphic-dompurify`.
- **Timing & Visual Engine:** `src/lib/anzan/` verified free of `setTimeout`/`setInterval`.

## What's done
- Base database schema and 28 migrations.
- Flash Anzan timing engine (`src/lib/anzan/timing-engine.ts`) & number generator.
- Anti-cheat sub-system (`src/lib/anticheat/clock-guard.ts`, teardown & tab monitor).
- Offline sync engine and staging table RPC handler.
- Core admin pages (`dashboard`, `assessments`, `levels`, `monitor`, `results`, `settings`, `students`, `announcements`, `activity-log`).
- Admin Announcements UI wired with a dynamically loaded, isolated TipTap editor.
- Announcements server action (`createAnnouncement`) fully secured with Zod schema and XSS sanitization.
- Student exam flow (`lobby`, `assessment/[id]`, `results`).
## Phase 4 Status: CLOSED
All core requirements for Phase 4 (Admin Announcements TipTap Editor) have been fully verified and merged to `main`. 

### Deferred Items (Must carry forward)
- **Teacher Route & UI:** Scaffold the `(teacher)` route group and teacher-facing announcements UI. The current RBAC allows teachers to author announcements, but the interface does not exist yet.
- **DEC-010 Re-scope:** Re-evaluate the `adminSupabase` bypass for dashboard aggregates once RLS boundaries settle before Phase 6+.
- **Migration Reconciliation:** Local Docker is unreachable, so migrations `20260824000000` and `20260825000000` were applied directly to remote via MCP. Reconciling this local migration history remains a critical open follow-up.

## What's confirmed broken (evidence-backed)
- **Trigger bug on `student_answers`:** `update_student_answers_modtime` trigger executes `update_modified_column()` setting `NEW.updated_at = NOW()`, but `student_answers` table has no `updated_at` column.
- **Server Action Validation:** Most files in `src/app/actions/` trust user input directly via TS interfaces without Zod runtime validation schemas (except `announcements.ts`).
- **API Route RBAC:** `/api/submissions/offline-sync` and `teardown` do not check `app_metadata.role === 'student'`.
- **Anti-Cheat Bypass:** Standard exams (`EXAM`/`TEST`) do not wire up `clock-guard`, `tab-monitor`, or `teardown`.
- **SSR Hydration Error:** `exam-page-client.tsx` accesses `document.body` synchronously for `createPortal`, which will crash on SSR.

## What's unverified (not yet exercised — absence of evidence is not evidence of correctness)
- Create Level button wiring
- Full student submission-completion flow
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
- **NEVER** start a new phase without reading `GOTCHAS.md` first.

## Immediate next action
- Wait for user approval to close Phase 4 and move to Phase 5.
