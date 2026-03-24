# MINDSPARK — Antigravity Agent Context (GEMINI.md)

> This file loads into every Antigravity session automatically.
> Read it completely. Then read CLAUDE.md completely. Both files together are your context.

---

## MANDATORY STARTUP SEQUENCE — every session, every time

```
STEP 1  Read GEMINI.md completely (this file — do not skim)
STEP 2  Read CLAUDE.md completely — all 683 lines without truncation
STEP 3  Read PROGRESS.md completely — find last completed task and current phase
STEP 4  Read docs/17_task-breakdown.md — find first unchecked [ ] task
STEP 5  Read the phase-specific docs from the Phase Routing table below
STEP 6  State exactly which file you will write first
STEP 7  Write the file
STEP 8  Run npm run tsc — fix ALL errors before touching the next file
STEP 9  Check the completed task off in docs/17_task-breakdown.md
STEP 10 After 8+ files written: write PROGRESS.md and notify the user
```

Do not write any code before completing Steps 1–6.
Do not move to a new file before Step 8 passes with zero errors.

---

## PROJECT IDENTITY

MINDSPARK — mental arithmetic assessment platform. Single institution. Ages 6–18. V1 only.
No PWA. No leaderboards. No parent portal. These are not in scope.

Two assessment types — these are the only two things the platform does:

EXAM type:
- Vertical abacus equations displayed in DM Mono font
- 4-option MCQ answer grid (A/B/C/D) with 64x64px minimum touch targets
- Question Navigator MOUNTED throughout the entire exam
- 1,200ms RAF-based input cooldown between answer selections
- Each answer submitted via submitAnswer Server Action

TEST type — Flash Anzan:
- Numbers flash on screen at configured ms intervals (200ms minimum hard floor, 3000ms maximum)
- Three sequential phases — never skip or reorder:
  - PHASE_1_START — equation display, student preparation
  - PHASE_2_FLASH — full-screen flash sequence, zero peripheral UI, Navigator UNMOUNTED
  - PHASE_3_MCQ — MCQ answer grid after flash, Navigator UNMOUNTED
- Timing driven exclusively by requestAnimationFrame delta accumulator
- setTimeout and setInterval are absolutely banned for flash timing

---

## FULL TECH STACK

Do not add any package not listed here without asking the user first.

next@15.x                 App Router, RSC, Server Actions, Edge Middleware, next/font
@supabase/supabase-js     PostgreSQL, Auth, Realtime Broadcast, RPC, RLS
@supabase/ssr             SSR client for cookie-based auth in Server Components and middleware
shadcn/ui                 Radix Primitives + Tailwind component layer (14 components)
tailwindcss@4.x           Utility-first CSS
zustand                   Client state — UI FLAGS ONLY. Never stores role or email.
dexie@4.x                 IndexedDB — offline answer queue written before every network call
lottie-react              Abacus loader animation — reads /public/abacus-loader.json
lucide-react              Primary icon set
@phosphor-icons/react     Secondary icon set
@tanstack/react-table     Student directory and exam tables with sort, filter, facets
@hello-pangea/dnd         Drag-and-drop for level ordering only
recharts                  Dashboard KPI charts, sparklines, distribution charts
tiptap                    Announcement WYSIWYG — headless, dynamic import to avoid RSC crash
papaparse                 Client-side CSV parsing for student bulk import
sanitize-html             Server-safe HTML sanitization for TipTap output — SERVER ONLY
date-fns + date-fns-tz    UTC storage, IST display for all timestamps
zod                       Schema validation in all Server Actions and Route Handlers

BANNED — do not install:
DOMPurify      crashes RSC with ReferenceError: window is not defined
localForage    use Dexie.js only

---

## PROJECT FOLDER STRUCTURE

mindspark/
  CLAUDE.md                        read every session
  GEMINI.md                        this file
  PROGRESS.md                      write before clearing context or switching phases
  CHANGELOG.md                     do not edit during build
  pre-launch-checklist.md          5-gate sign-off before any live exam

  .agent/
    rules/                         injected into every Antigravity message automatically
      00-core.md                   always-on core constraints
      01-schema.md                 database rules
      02-design.md                 colour and typography rules
      03-phase-gate.md             phase start and end requirements
    workflows/                     triggered by /command in chat
      start-phase.md               /start-phase
      complete-task.md             /complete-task
      debug-handoff.md             /debug-handoff

  docs/                            read-only spec files — never modify
    01_prd.md                      full PRD and feature requirements
    05_ia-rbac.md                  route map, role definitions, RBAC
    06_wireframes.md               all screen wireframes (Part A admin, Part B student)
    07_hifi-spec.md                pixel-precise design tokens for every screen
    08_a11y.md                     WCAG 2.2 AAA, ARIA patterns, Ticker Mode
    09_fsd.md                      exam state machine, RAF engine, offline reconciliation
    10_architecture.md             6 vulnerability zones, Realtime topology
    11_database.md                 PRIORITY 1 — all schemas, migrations, RPCs, RLS
    12_api-contracts.md            3 Route Handlers, 16 Server Actions, error codes
    13_exam-engine-spec.md         RAF loop, HMAC Clock Guard, contrast dampening
    14_security.md                 8 attack vectors, CSP, sanitize-html allowlist
    15_incident-response.md        P0/P1 runbooks, recovery SQL
    17_task-breakdown.md           TASK CHECKLIST — check off every completed task
    18_performance-budget.md       flash latency, CWV targets, bundle budget
    19_test-plan.md                Vitest, Playwright E2E, k6 load, axe-playwright
    20_devops.md                   CI/CD, 3 environments, migration rules
    23_admin-manual.md             11-chapter admin operations guide
    24_student-guide.md            student experience, login, exam flow
    25_maintenance.md              on-call SLAs, DPDP retention, upgrade cadence
    legal/
      dpia.md
      privacy-policy.md
      terms-of-service.md

  src/
    app/
      (admin)/admin/
        dashboard/
        levels/
        students/
        assessments/
        results/
        announcements/
        reports/
        activity-log/
        settings/
        monitor/                   live exam monitor — built LAST (requires Realtime)
      (student)/student/
        dashboard/
        exams/                     PLURAL — not /student/exam
        tests/                     PLURAL — not /student/test
        lobby/[id]/
        assessment/[id]/           the exam engine page
        results/
        results/[id]/
        profile/
        consent/                   guardian email redirect target
      api/
        submissions/
          teardown/route.ts        POST — pagehide keepalive — JWT from Authorization header
          offline-sync/route.ts    POST — Dexie queue flush — HMAC validated — rate limited 10/60s
        consent/
          verify/route.ts          GET — unauthenticated — ?token= query param — guardian email
      actions/                     16 Server Actions across 9 files — all file names plural
        assessments.ts             createAssessment, updateAssessment, publishAssessment, forceOpenExam, forceCloseExam
        students.ts                importStudentsCSV, createStudent, updateStudent, deactivateStudent
        assessment-sessions.ts     initSession, submitAnswer, submitExam
        results.ts                 publishResult, unpublishResult, reEvaluateResults, bulkPublish
        announcements.ts           createAnnouncement, publishAnnouncement
        settings.ts                updateSettings
        auth.ts                    login, logout, resetPassword, refreshSession
        levels.ts                  createLevel, updateLevel, reorderLevels, softDeleteLevel
        activity-log.ts            getActivityLog — required for Activity Log admin page

    components/                    shared React components
    lib/
      supabase/
        client.ts                  createBrowserClient — client components only
        server.ts                  createServerClient — RSC and Server Actions only
        middleware.ts              JWT refresh helper
        admin.ts                   service-role client — server-only — ESLint blocks import in (student)/
      auth/
        rbac.ts                    requireRole() — called at top of every Server Action
        session.ts                 idle timeout, forced_password_reset redirect
      anzan/
        number-generator.ts        Mulberry32 seeded PRNG, no consecutive duplicates
        timing-engine.ts           RAF delta accumulator, throws INTERVAL_BELOW_MINIMUM below 200ms
        visibility-guard.ts        visibilitychange handler, cancelAnimationFrame
        contrast-dampener.ts       3-tier contrast ramp
        color-calibration.ts       #991B1B for n < 0 flash numbers
      anticheat/
        clock-guard.ts             HMAC + performance.now() monotonic — writes to activity_logs
        tab-monitor.ts             visibilitychange Broadcast telemetry
        teardown.ts                pagehide keepalive fetch
      offline/
        indexed-db-store.ts        Dexie schema — pendingAnswers keyed by idempotency_key
        sync-engine.ts             flushes queue on 'online' event
        storage-probe.ts           navigator.storage.persist() and estimate() on app init
      constants.ts                 ALL magic numbers — no inline numbers anywhere else
    stores/
      exam-session-store.ts        active exam state, UI flags only
      ui-store.ts                  sidebar, modal, toast states
      auth-store.ts                UI flags ONLY — role never stored here
    hooks/                         custom React hooks
    types/
      supabase.ts                  generated — never hand-edit
      api.ts                       shared request/response interfaces
      enums.ts                     ExamPhase, ExamType, UserRole enums

  supabase/
    migrations/                    001–026 — strict order — never skip
    rollbacks/                     one rollback SQL file per migration

  .env.local                       never commit — must be in .gitignore

---

## CANONICAL SOURCE HIERARCHY

When any two documents contradict each other, the lower priority number wins.
Never guess a column name, table name, or RPC name. Always check docs/11_database.md.

Priority 1 — docs/11_database.md
  Controls: all 17 table schemas, every column name and type, 26 migration sequence,
  3 RPC function signatures and parameters, all RLS policies.
  When in doubt: read this file. It is always right.

Priority 2 — docs/09_fsd.md
  Controls: ExamPhase enum exact values, state machine transitions,
  offline reconciliation logic, RAF loop specification.

Priority 3 — docs/12_api-contracts.md
  Controls: all 3 Route Handler specs, all 16 Server Action signatures,
  error code taxonomy, request/response payload shapes.

Priority 4 — design-system.html
  Controls: every permitted hex colour value, typography tokens, spacing scale,
  component size specifications.

Priority 5 — CLAUDE.md
  Controls: 54 implementation warnings from the 6-batch audit. Most current source.

Priority 6 — docs/08_a11y.md
  Controls: WCAG 2.2 AAA requirements, all ARIA patterns, Ticker Mode spec.

Priority 7 — docs/05_ia-rbac.md
  Controls: route map, role definitions, temporal cohort_history join in RLS.

Priority 8 — everything else
  Subordinate to all seven above.

---

## PHASE ROUTING — read only the docs for the current phase

Phase 0 — Scaffold
  Read: CLAUDE.md — all 683 lines
  Read: docs/20_devops.md — read completely without truncation
    (GitHub Actions CI/CD · 3 environments · migration deployment rules · rollback)

Phase 1 — Database (26 migrations)
  Read: docs/11_database.md — read ALL 1,684 lines without truncation before writing migration 001

Phase 2 — Auth Foundation
  Read: docs/05_ia-rbac.md — read fully without truncation
  Read: docs/14_security.md — read fully without truncation

Phase 3 — State and Offline
  Read: docs/09_fsd.md sections 3, 4, and 5 — read without truncation

Phase 4 — Server Actions and Route Handlers
  Read: docs/12_api-contracts.md — read ALL 1,025 lines without truncation

Phase 5 — Shared Components
  Read: docs/07_hifi-spec.md — read fully without truncation
  Read: docs/08_a11y.md — read fully without truncation

Phase 6 — Admin Panel
  Read: docs/06_wireframes.md Part A — without truncation
  Read: docs/07_hifi-spec.md section 5 — without truncation
  Read: docs/23_admin-manual.md — without truncation

Phase 7 — Student Panel
  Read: docs/06_wireframes.md Part B — without truncation
  Read: docs/07_hifi-spec.md section 6 — without truncation
  Read: docs/24_student-guide.md — without truncation

Phase 8 — Assessment Engine
  ⚠️ Start a completely fresh agent session before beginning Phase 8.
  Read: docs/09_fsd.md — ALL sections, fully, without any truncation
    (state machine · phase strings · RAF engine · offline reconciliation)
  Read: docs/13_exam-engine-spec.md — fully, without any truncation
    (RAF loop · HMAC Clock Guard · contrast dampening · Ticker Mode)
  Read: docs/19_test-plan.md — fully, without any truncation
    (Vitest unit specs · Playwright E2E flows · k6 parameters · axe-playwright config)
  Read: docs/18_performance-budget.md — fully, without any truncation
    (RAF drift < 5ms · LCP targets · bundle budget · k6 concurrency thresholds)
  Read all four files completely before writing a single line of Phase 8 code.

---

## COMMANDS

npm run dev                                                     dev server
npm run build                                                   production build
npm run tsc                                                     TYPE CHECK — run after every file
npm run lint                                                     ESLint — run at end of each phase
npm run test                                                     Vitest unit and integration
npm run test:e2e                                                 Playwright E2E
npx supabase start                                               start local Supabase (Docker required)
npx supabase db push                                             apply migrations to local DB
npx supabase gen types typescript --local > types/supabase.ts   regenerate after any migration change
git add -A && git commit -m "Phase X: description"              commit at end of every phase

---

## CONSTANTS — all live in src/lib/constants.ts, nowhere else

export const HEARTBEAT_INTERVAL_MS  = 5_000     WebSocket heartbeat cadence
export const JITTER_WINDOW_MS       = 5_000     WebSocket connect jitter window
export const DEBOUNCE_MS            = 300       search input debounce
export const INPUT_COOLDOWN_MS      = 1_200     MCQ inter-tap cooldown
export const MIN_FLASH_INTERVAL_MS  = 200       hard floor enforced by DB CHECK constraint
export const HEARTBEAT_TIMEOUT_MS   = 25_000    admin monitor amber threshold (5 missed beats)
export const REOPEN_WINDOW_MS       = 600_000   CLOSED-to-LIVE accidental-close recovery window
export const INTERSTITIAL_MS        = 3_000     lobby to exam metronome transition

---

## ENVIRONMENT VARIABLES

NEXT_PUBLIC_SUPABASE_URL            Supabase project URL (from Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY       Supabase anon key (safe for client bundles)
SUPABASE_SERVICE_ROLE_KEY           NEVER in client code — server-only — never commit

OFFLINE_SYNC_SECRET                 HMAC key for offline-sync route — generate: openssl rand -hex 32
HMAC_SECRET                         HMAC key for clock guard and consent JWT — generate: openssl rand -hex 32

RESEND_API_KEY                      from resend.com after domain verification
EMAIL_FROM                          noreply@yourinstitution.com

NEXT_PUBLIC_APP_URL                 http://localhost:3000 locally

---

## PROGRESS.MD TEMPLATE

Write this to PROGRESS.md at end of session or before phase switch:

# MINDSPARK Build Progress

## Status
Phase X — [Phase Name] — [IN PROGRESS / COMPLETE]

## Last Completed Task
[exact task text copied from docs/17_task-breakdown.md]

## Files Written This Session
- path/to/file.ts — what it does

## Next Task
[exact next unchecked task from docs/17_task-breakdown.md]

## Verified Canonical Values
[any table names, column names, RPC names confirmed against docs/11_database.md]

## Errors and Open Issues
[any tsc errors, bugs, or blocked items]

## Git
Last commit: [message]

---

End of GEMINI.md. Read CLAUDE.md now. Then PROGRESS.md. Then begin.
