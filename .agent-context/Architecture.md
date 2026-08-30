# Verified System Architecture

> Every statement in this document is backed by empirical verification performed during Master Recon on 2026-08-23.

---

## 1. Stack & Versions
- **Runtime & Framework:** Next.js `^16.3.2` (App Router, Turbopack default bundler), React `^19.0.0` (*Source: `package.json`*). Floor: Node 20.9+ / TypeScript 5.1+.
- **Middleware:** `src/proxy.ts` acts as the edge proxy router, previously named `middleware.ts`.
- **Styling:** Tailwind CSS `latest` (unpinned range in `package.json`, currently resolved to `tailwindcss@4.2.2` and `@tailwindcss/postcss@4.2.2`), `tw-animate-css` (*Source: `package.json`, `npm list`*).
- **Backend / Database:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL with 27 migrations in `supabase/migrations/`).
- **Offline / Local DB:** Dexie `latest` (unpinned range in `package.json`, currently resolved to `dexie@4.3.0`) (*Source: `package.json`, `npm list`*).
- **Test Runners:** Vitest `v4.1.2` (devDependency `latest`, currently resolved to `4.1.2`), Playwright `^1.59.1` (*Source: `package.json`, `npm run test`*).
- **Dependency Risk Note:** Multiple dependencies in `package.json` are specified with the `"latest"` tag rather than semver ranges. This presents a non-reproducible install risk across fresh machine environments. Range pinning will be reviewed in Phase 5.

---

## 2. Route Groups & Layouts
- **Admin Section:** `src/app/(admin)/admin/` (*Source: `Get-ChildItem src/app`*)
  - Pages: `activity-log`, `announcements`, `assessments`, `dashboard`, `levels`, `monitor`, `monitor/[id]`, `results`, `settings`, `students`, `students/[id]`.
- **Student Section:** `src/app/(student)/student/` (*Source: `Get-ChildItem src/app`*)
  - Pages: `assessment/[id]`, `consent`, `dashboard`, `exams`, `exams/[id]`, `exams/[id]/lobby`, `profile`, `results`, `results/[submissionId]`, `tests`.
- **API Route Handlers:** `src/app/api/` (*Source: `Get-ChildItem src/app/api`*)
  - `api/consent/verify/route.ts`
  - `api/submissions/offline-sync/route.ts`
  - `api/submissions/teardown/route.ts`

---

## 3. Authentication & RBAC Model
- **Auth Verification:** Enforced via `requireRole(allowed)` helper in `src/lib/auth/rbac.ts`.
- **Session Resolution:** Strictly calls `supabase.auth.getUser()`. Never trusts client JWT payloads directly (*Source: `src/lib/auth/rbac.ts#L16-L20`*).
- **Role Derivation:** Derived strictly from `user.app_metadata.role` (`'student' | 'teacher' | 'admin'`) (*Source: `src/lib/auth/rbac.ts#L25-L35`*).
- **Service Role Isolation:** `src/lib/supabase/admin.ts` (`adminSupabase`) is restricted to server actions, server routes, admin server components, and test mocks (*Source: `grep_search supabase/admin`*).
- **API Route Gap:** `/api/submissions/offline-sync` and `/teardown` do not enforce RBAC roles (missing `app_metadata.role === 'student'` check) (*Source: Audit*).

---

## 4. Server Actions Pattern
- **Location:** `src/app/actions/*.ts` (`activity-log.ts`, `announcements.ts`, `assessment-sessions.ts`, `assessments.ts`, `auth.ts`, `levels.ts`, `questions.ts`, `results.ts`, `settings.ts`, `students.ts`).
- **Data Validation (Vulnerability):** No Zod runtime schemas exist for payload validation. User input is blindly trusted against TypeScript interfaces (*Source: Audit*).
- **Error Handling:** Mutations return typed action result objects (`{ ok: true, data: T }` or `{ ok: false, error: string }`).
- **Conflict Resolution:** Submissions upserted with `{ onConflict: 'session_id,student_id' }` (*Source: `src/app/actions/assessment-sessions.ts#L255`*).

---

## 5. Timing Engine Mechanics
- **Location:** `src/lib/anzan/timing-engine.ts`.
- **Clock Source:** Driven exclusively by `requestAnimationFrame` delta accumulator; zero `setTimeout` or `setInterval` calls (*Source: `grep_search setTimeout|setInterval src/lib/anzan`*).
- **4-Phase State Machine:** Preparation → Flash → MCQ → Confirmation (*Source: `src/lib/anzan/timing-engine.test.ts`*).

---

## 6. Anti-Cheat Subsystem
- **Clock Drift & Tampering:** `src/lib/anticheat/clock-guard.ts` verifies client timestamps against cryptographic bounds (*Source: `clock-guard.test.ts`*).
- **Teardown & Visibility:** `src/lib/anticheat/tab-monitor.ts` and `src/app/api/submissions/teardown/route.ts` record and handle tab switches and page unload events.
- **Coverage Gap:** Anti-cheat is exclusively wired into `use-anzan-engine.ts`. Standard exams (`EXAM`/`TEST`) bypass these mechanisms entirely (*Source: Audit*).

---

## 7. Offline Sync Pipeline
- **Staging Table:** `offline_submissions_staging` stores pending answer snapshots with HMAC signature (*Source: `src/app/api/submissions/offline-sync/route.ts#L114-L128`*).
- **Atomic Processing:** PostgreSQL RPC `validate_and_migrate_offline_submission` verifies HMAC and migrates records to `student_answers` (*Source: `src/app/api/submissions/offline-sync/route.ts#L135-L145`*).

---

## 8. Not Yet Mapped (Doc Claims Unverified this Pass)
- Full end-to-end Realtime Broadcast/Presence channel behavior (`exam:{paper_id}`, `lobby:{paper_id}`).
- TipTap WYSIWYG editor integration and rendering in announcements.
- Live Recharts visualizations across various dataset volumes in Admin Dashboard.
- Playwright E2E full browser run execution.
