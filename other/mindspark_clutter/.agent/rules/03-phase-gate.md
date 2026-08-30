---
name: phase-gate
description: Use when starting a new phase, completing a phase, or deciding whether to proceed. Contains entry requirements and exit criteria for all 8 phases. Read docs/17_task-breakdown.md alongside this file — it has the exact task list for each phase.
---

# MINDSPARK — Phase Gate Rules

> Each phase has mandatory entry requirements and exit criteria.
> Do not start a phase until all entry requirements are met.
> Do not proceed to the next phase until all exit criteria pass.
> Read docs/17_task-breakdown.md for the exact task checklist per phase.

---

## Phase 0 — Project Scaffold

### Entry requirements
- [ ] CLAUDE.md read completely (all 683 lines)
- [ ] GEMINI.md read completely
- [ ] **docs/20_devops.md read completely — no truncation**
      CI/CD pipeline · GitHub Actions workflow · 3 environments · migration deployment rules · rollback procedures.
      Read before Phase 0 so the GitHub Actions pipeline and next.config.ts CSP are built correctly from day one.
- [ ] docs/17_task-breakdown.md Phase 0 section read
- [ ] Empty mindspark/ folder exists and is open in Antigravity
- [ ] .env.local created with placeholder values

### Files to create (in order)
```
package.json
next.config.ts                  ← CSP headers with nonce pattern
tailwind.config.ts              ← design tokens
tsconfig.json                   ← strict mode + @/ path alias to src/
.eslintrc.json                  ← no-restricted-imports blocking admin.ts in (student)/ routes
postcss.config.js
.gitignore                      ← must include .env.local
.env.example                    ← all required keys, empty values
src/middleware.ts               ← JWT inspection at Edge, nonce injection
src/app/layout.tsx              ← DM Sans + DM Mono via next/font/google
src/lib/constants.ts            ← all magic numbers (see CLAUDE.md §CONSTANTS)
```

### Exit criteria
- [ ] npm install → 0 errors
- [ ] npm run dev → starts without errors
- [ ] npm run tsc → 0 errors
- [ ] npm run build → completes (confirms no config errors)
- [ ] .env.local is in .gitignore (verify with: git check-ignore .env.local)
- [ ] All Phase 0 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 0 complete: project scaffold"

---

## Phase 1 — Database (26 Migrations)

### Entry requirements
- [ ] Phase 0 exit criteria all passing
- [ ] Docker Desktop is running
- [ ] npx supabase start is running and healthy
- [ ] .env.local filled with credentials from supabase start output
- [ ] **docs/11_database.md read completely — all 1,684 lines, no truncation**
      Read this file in full before writing migration 001. Every table, every column,
      every constraint, every RLS policy, every RPC definition.

### Process — run in this exact order
Write one migration, verify it, then continue. Run supabase db push after every 3.

```
001 → supabase db push
002 → 003 → 004 → supabase db push
005 → 006 → 007 → supabase db push
008 → 009 → 010 → supabase db push
011 → 012 → 013 → supabase db push
014 → supabase db push    ← student_answers — verify Design A schema before continuing
015 → 016 → 017 → supabase db push
018 → 019 → supabase db push    ← RLS policies
020 → supabase db push    ← 3 Security Definer RPCs — verify function names
021 → 022 → 023 → supabase db push
024 → 025 → supabase db push    ← consent_verified (DPDP)
026 → supabase db push    ← deletion_scheduled_at on submissions + activity_logs
```

Critical checks during Phase 1:
- Migration 014: student_answers must have submission_id UUID FK + question_id UUID FK.
  No session_id. No question_index. Read docs/11_database.md §12.
- Migration 019: RLS must use (auth.jwt() -> 'app_metadata') ->> 'role'.
  Never auth.jwt() ->> 'role'.
- Migration 020: RPC name is validate_and_migrate_offline_submission (full name).
  bulk_import_students is skip-per-row (not full atomic rollback).
- Migration 025: consent_verified BOOLEAN DEFAULT false on students. DPDP required.
- Migration 026: deletion_scheduled_at on BOTH submissions AND activity_logs in one migration.

### After all 26 pass
```bash
npx supabase gen types typescript --local > types/supabase.ts
```
This file is required for all subsequent phases. Verify it is non-empty.

### Exit criteria
- [ ] SELECT count(*) FROM schema_migrations → 26
- [ ] types/supabase.ts generated and non-empty
- [ ] RLS test: student JWT cannot SELECT another student's submissions
      (verify in Supabase SQL editor with a test student JWT)
- [ ] RPC test: SELECT bulk_import_students(...) returns JSONB (not error)
- [ ] All Phase 1 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 1 complete: 26 migrations + types generated"

---

## Phase 2 — Auth Foundation

### Entry requirements
- [ ] Phase 1 exit criteria all passing
- [ ] **docs/05_ia-rbac.md read completely — all lines, no truncation**
      Route map, RBAC rules, cohort_history temporal join patterns.
- [ ] **docs/14_security.md read completely — all lines, no truncation**
      §2 Vector 1 (service-role client), §3 (CSP), §2 Vector 2 (JWT role manipulation).

### Files to create (in order)
```
src/lib/supabase/client.ts        ← createBrowserClient — NEXT_PUBLIC_ vars only
src/lib/supabase/server.ts        ← createServerClient — reads cookies from next/headers
src/lib/supabase/middleware.ts    ← JWT refresh helper for Edge
src/lib/supabase/admin.ts         ← service-role client — throws if typeof window !== undefined
src/lib/auth/rbac.ts              ← requireRole() — role from app_metadata always
src/lib/auth/session.ts           ← idle timeout + forced_password_reset redirect
src/stores/auth-store.ts          ← UI flags ONLY — no role, no email, no profile data
```

### Exit criteria
- [ ] npm run tsc → 0 errors
- [ ] npm run lint → importing admin.ts in (student)/ triggers ESLint error
- [ ] admin.ts throws ReferenceError if imported in browser (typeof window guard)
- [ ] requireRole('admin') with student JWT returns FORBIDDEN error object (not throws)
- [ ] forced_password_reset = true in profile → redirect before any UI renders
- [ ] All Phase 2 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 2 complete: auth foundation"

---

## Phase 3 — State + Offline

### Entry requirements
- [ ] Phase 2 exit criteria all passing
- [ ] **docs/09_fsd.md §3, §4, and §5 read completely — no truncation**
      These sections cover the exam session state machine, Dexie schema, and sync engine.

### Files to create (in order)
```
src/stores/exam-session-store.ts      ← active exam state — NO localStorage
src/stores/ui-store.ts                ← sidebar collapse, modal, UI toggle state
src/lib/offline/indexed-db-store.ts   ← Dexie schema — pendingAnswers keyed by idempotency_key
src/lib/offline/sync-engine.ts        ← flushes on 'online' event to offline-sync Route Handler
src/lib/offline/storage-probe.ts      ← navigator.storage.persist() + estimate() on app init
```

### Exit criteria
- [ ] npm run tsc → 0 errors
- [ ] Answer written to Dexie survives page refresh (test manually in browser)
- [ ] navigator.storage.persist() called before first answer write
- [ ] exam-session-store has zero localStorage usage (grep -r "localStorage" src/stores/)
- [ ] All Phase 3 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 3 complete: state and offline"

---

## Phase 4 — Server Actions + Route Handlers

### Entry requirements
- [ ] Phase 3 exit criteria all passing
- [ ] **docs/12_api-contracts.md read completely — all 1,025 lines, no truncation**
      Every Server Action signature. Every Route Handler. Every error code. Every side effect.
      Do not write a single action before reading this file fully.

### Build order — Route Handlers first
```
src/app/api/submissions/teardown/route.ts     ← pagehide keepalive, JWT from Authorization header
src/app/api/submissions/offline-sync/route.ts ← Dexie flush, HMAC validation, rate limit 10/60s
src/app/api/consent/verify/route.ts           ← unauthenticated, ?token= query, redirects
```

Then Server Actions (9 files — all plural or hyphenated):
```
src/app/actions/assessments.ts         ← createAssessment, updateAssessment, publishAssessment, forceOpenExam, forceCloseExam
src/app/actions/students.ts            ← importStudentsCSV, createStudent, updateStudent, deactivateStudent
src/app/actions/assessment-sessions.ts ← initSession, submitAnswer, submitExam
src/app/actions/results.ts             ← publishResult, unpublishResult, reEvaluateResults, bulkPublish
src/app/actions/announcements.ts       ← createAnnouncement, publishAnnouncement
src/app/actions/settings.ts            ← updateSettings
src/app/actions/auth.ts                ← login, logout, resetPassword, refreshSession
src/app/actions/levels.ts              ← createLevel, updateLevel, reorderLevels, softDeleteLevel
src/app/actions/activity-log.ts        ← getActivityLog (REQUIRED — Activity Log page needs this)
```

### Exit criteria
- [ ] npm run tsc → 0 errors on all 12 files
- [ ] student JWT calling createAssessment returns FORBIDDEN (not throws)
- [ ] duplicate idempotency_key on submitAnswer returns { ok: true } (idempotent)
- [ ] importStudentsCSV with one duplicate: that row skipped, others inserted
- [ ] consent/verify Route Handler: valid token sets consent_verified = true and redirects
- [ ] All Phase 4 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 4 complete: 3 Route Handlers + 16 Server Actions"

---

## Phase 5 — Shared Components (50+ components)

### Entry requirements
- [ ] Phase 4 exit criteria all passing
- [ ] **docs/07_hifi-spec.md read completely — no truncation**
      Every pixel spec, every component design, every token value.
- [ ] **docs/08_a11y.md read completely — no truncation**
      WCAG 2.2 AAA requirements, ARIA patterns, Ticker Mode implementation.

### Build order (dependencies flow downward)
```
src/app/globals.css                 ← Tailwind base + CSS custom properties
src/app/layout.tsx                  ← DM Sans + DM Mono (update from Phase 0)
shadcn installs                     ← see docs/17_task-breakdown.md Phase 5 for list
src/components/ui/                  ← shadcn base components
src/components/shared/              ← SRAnnouncerRef (forwardRef required), network-banner, etc
src/components/admin/               ← all admin panel components
src/components/student/             ← all student panel components
src/hooks/                          ← useInputCooldown (RAF), useHeartbeat, useExamTimer, etc
```

### Critical Phase 5 rules
- SRAnnouncerRef MUST use React.forwardRef — without it, all AT announcements break silently
- useInputCooldown MUST use RAF + performance.now() — never setTimeout
- No hex code outside the approved colour table in any component
- DM Mono + tabular-nums on every numeric display

### Exit criteria
- [ ] npm run tsc → 0 errors across all components
- [ ] npm run lint → 0 errors
- [ ] grep -r "setTimeout" src/hooks/ → 0 results (useInputCooldown is RAF)
- [ ] SRAnnouncerRef uses React.forwardRef (verify in source, not just types)
- [ ] All Phase 5 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 5 complete: shared components"

---

## Phase 6 — Admin Panel (11 screens)

### Entry requirements
- [ ] Phase 5 exit criteria all passing
- [ ] **docs/06_wireframes.md Part A read completely — no truncation**
- [ ] **docs/07_hifi-spec.md §5 read completely**
- [ ] **docs/23_admin-manual.md read completely — no truncation**
      Understand admin workflows before building UI for them.

### Build order (Monitor is LAST — requires Realtime)
```
src/app/(admin)/layout.tsx                ← sidebar + role guard
src/app/(admin)/dashboard/page.tsx        ← KPI cards + Recharts sparklines + live pulse
src/app/(admin)/levels/page.tsx           ← @hello-pangea/dnd drag-and-drop
src/app/(admin)/students/page.tsx         ← @tanstack/react-table + CSV import wizard
src/app/(admin)/assessments/page.tsx      ← Draft→Published→Live→Closed lifecycle
src/app/(admin)/results/page.tsx          ← grade distribution + bulk publish
src/app/(admin)/announcements/page.tsx    ← TipTap WYSIWYG + sanitize-html
src/app/(admin)/reports/page.tsx          ← 6-month charts + pass rate by level
src/app/(admin)/activity-log/page.tsx     ← paginated + JSON diff visualiser
src/app/(admin)/settings/page.tsx         ← grade boundaries with anti-overlap validation
src/app/(admin)/monitor/[id]/page.tsx     ← LAST — Realtime Broadcast + Presence
```

### Monitor page rules
- Route: /admin/monitor/[id] — NOT /admin/live-monitor/[id]
- Broadcast on exam:{paper_id} for ALL lifecycle events
- Presence on lobby:{paper_id} for student status ONLY
- State hierarchy: DB Record > REST Sync > WebSocket Presence
- Submitted = permanently green (completed_at IS NOT NULL or sync_status = 'verified')
  Subsequent Presence leave events are IGNORED
- Heartbeat timeout: 25s (HEARTBEAT_TIMEOUT_MS) → amber
- WebSocket jitter: setTimeout(() => channel.subscribe(), Math.random() * JITTER_WINDOW_MS)

### Exit criteria
- [ ] npm run tsc → 0 errors
- [ ] Student card amber after exactly 25s of missed heartbeats
- [ ] Submitted status never overwritten by Presence leave
- [ ] All admin routes redirect non-admin role to /login
- [ ] All Phase 6 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 6 complete: admin panel 11 screens"

---

## Phase 7 — Student Panel (9 screens)

### Entry requirements
- [ ] Phase 6 exit criteria all passing
- [ ] **docs/06_wireframes.md Part B read completely — no truncation**
- [ ] **docs/07_hifi-spec.md §6 read completely**
- [ ] **docs/24_student-guide.md read completely — no truncation**
      Understand the student experience before building it.

### Build order
```
src/app/(student)/layout.tsx              ← role guard — redirect non-students
src/app/(student)/dashboard/page.tsx      ← "Live Now" hero + upcoming grid
src/app/(student)/exams/page.tsx          ← PLURAL route /student/exams
src/app/(student)/tests/page.tsx          ← PLURAL route /student/tests
src/app/(student)/lobby/[id]/page.tsx     ← countdown + network light + metronome
src/app/(student)/results/page.tsx        ← published highlighted, pending pointer-events:none
src/app/(student)/results/[id]/page.tsx   ← donut chart + 3-column review + filter chips
src/app/(student)/profile/page.tsx        ← digital ID card + DM Mono roll number
src/app/(student)/consent/page.tsx        ← ?status=verified/expired/invalid/already_verified
```

### Student routes are PLURAL
```
/student/exams   (NOT /student/exam)
/student/tests   (NOT /student/test)
```

### Lobby metronome — Web Audio API only
```typescript
// CORRECT — no network dependency
const audioCtx = new AudioContext();
[500, 1000, 1500].forEach(t => {
  const osc = audioCtx.createOscillator();
  osc.frequency.value = 880; osc.type = 'sine';
  const gain = audioCtx.createGain(); gain.gain.value = 0.3;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + t / 1000);
  osc.stop(audioCtx.currentTime + t / 1000 + 0.080);
});

// WRONG — MP3 does not exist, creates network dependency
new Audio('/public/audio/metronome-beat.mp3').play();
```

### Exit criteria
- [ ] npm run tsc → 0 errors
- [ ] Non-LIVE assessments show lock icon — clicks do nothing
- [ ] Pending results have pointer-events: none
- [ ] Consent page renders for all 4 ?status= values
- [ ] /student/exams and /student/tests both load (plural routes)
- [ ] All Phase 7 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 7 complete: student panel 9 screens"

---

## Phase 8 — Assessment Engine

### Entry requirements
⚠️ START WITH A COMPLETELY FRESH AGENT SESSION. Clear all context before beginning.

- [ ] Phase 7 exit criteria all passing
- [ ] **docs/09_fsd.md read completely — ALL sections, all lines, no truncation**
      State machine. RAF engine. Phase transitions. Offline reconciliation.
- [ ] **docs/13_exam-engine-spec.md read completely — all lines, no truncation**
      RAF loop · HMAC Clock Guard · contrast dampening · Ticker Mode implementation.
- [ ] **docs/19_test-plan.md read completely — no truncation**
      Vitest unit test specs (RAF drift, HMAC, number generator, LRU purge, auth-store shape) ·
      Playwright E2E flows (EXAM, TEST Phase 1→2→3, offline resume, force close, result publish) ·
      k6 load test parameters (LT-01 thundering herd, LT-02 heartbeat storm, LT-03 offline sync storm) ·
      axe-playwright WCAG 2.2 AAA scan configuration.
      Read before Phase 8 so tests are written alongside implementation.
- [ ] **docs/18_performance-budget.md read completely — no truncation**
      Flash latency targets (RAF drift < 5ms over 10s run) · CWV targets (admin LCP < 2.5s, student LCP < 3.5s on 4G) ·
      JS bundle budget (< 150KB gzipped) · k6 concurrency parameters (2,500 concurrent WebSocket connections).
      Read before Phase 8 so timing-engine.ts, Lighthouse CI config, and k6 scripts meet budgets from the start.
- [ ] All four spec files read fully before writing a single line of Phase 8 code.

### Build order (strict dependency chain)
```
# 1. Anzan library (src/lib/anzan/)
number-generator.ts         ← Mulberry32 PRNG, no consecutive duplicates
timing-engine.ts            ← RAF delta accumulator, throws INTERVAL_BELOW_MINIMUM < 200ms
visibility-guard.ts         ← visibilitychange → cancelAnimationFrame
contrast-dampener.ts        ← 3-tier ramp (white/F8FAFC/F1F5F9 — see 02-design rules)
color-calibration.ts        ← #991B1B for n < 0 only

# 2. Anti-cheat (src/lib/anticheat/)
clock-guard.ts              ← HMAC + performance.now() monotonic, NON-BLOCKING
tab-monitor.ts              ← visibilitychange → aggregate count in Zustand exam store
teardown.ts                 ← pagehide → fetch /api/submissions/teardown keepalive

# 3. Engine components (src/components/exam/)
anzan-flash-view.tsx        ← PHASE_2_FLASH full canvas, Navigator UNMOUNTED
exam-vertical-view.tsx      ← EXAM equations display
mcq-grid.tsx                ← 64×64px minimum touch targets
exam-timer.tsx              ← aria-live at 5min and 1min only
question-navigator.tsx      ← MOUNTED for EXAM, UNMOUNTED for PHASE_2_FLASH + PHASE_3_MCQ
sync-indicator.tsx
paused-overlay.tsx
transition-interstitial.tsx ← 3000ms, Web Audio API metronome
network-banner.tsx
confirm-submit.tsx
completion-card.tsx

# 4. Hook
src/hooks/use-anzan-engine.ts    ← full RAF hook

# 5. Assessment page
src/app/(student)/assessment/[id]/page.tsx
```

### Exit criteria — ALL self-verification commands must pass

```bash
# No setTimeout/setInterval in flash timing
grep -r "setInterval\|setTimeout" src/lib/anzan/
# Must return: 0 results

# No wrong phase string
grep -r "phase.*!==.*'FLASH'\b\|phase.*===.*'FLASH'\b" src/
# Must return: 0 results

# No question_index in API payloads
grep -r "question_index" src/app/actions/ src/app/api/
# Must return: 0 results

# No wrong RPC name
grep -r "validate_offline_submission\b" src/
# Must return: 0 results

# No banned colours
grep -r "FF6B6B\|1A1A1A\|E0E0E0\|121212" src/
# Must return: 0 results

# No singular assessment.ts
grep -r "actions/assessment\.ts\b" src/
# Must return: 0 results

# Realtime cleanup in all hooks
grep -r "supabase\.channel" src/hooks/
# Every result must have matching supabase.removeChannel() in same file

# TypeScript
npm run tsc
# Must return: 0 errors

# Lint
npm run lint
# Must return: 0 errors. admin.ts in (student)/ must trigger error.

# Build
npm run build
# Must complete with 0 errors

# Unit tests
npm run test
# Must pass including RAF drift precision test

# E2E
npm run test:e2e
# Must pass: EXAM flow, TEST flow, offline resume, force close, result publish

# Browser verification (manual)
# Open TEST assessment in DevTools → Elements
# Confirm QuestionNavigator is ABSENT from DOM during PHASE_2_FLASH (not just hidden)
# Open DevTools → Computed → .flash-number → confirm transition: none
```

- [ ] All self-verification commands passing
- [ ] All Phase 8 tasks checked off in docs/17_task-breakdown.md
- [ ] git add -A && git commit -m "Phase 8 complete: assessment engine"
- [ ] git push origin main → Vercel deployment succeeds

---

## Pre-Launch Gate

After all 8 phases pass, work through pre-launch-checklist.md gate by gate.
Every item requires a verifier name and date.
Platform not authorised for live exam until all 5 gates are signed off.
