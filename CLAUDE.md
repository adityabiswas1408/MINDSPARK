# MINDSPARK — Claude Code Agent Context
> **READ THIS FILE COMPLETELY BEFORE WRITING A SINGLE LINE OF CODE.**
> This file is the contract between you and the codebase. Violations cause silent runtime failures.

---

## SESSION STARTUP PROTOCOL

Every session, in this exact order:

```
1. Read this file completely (do not skim)
2. Read PROGRESS.md if it exists — find your last save point
3. Read docs/17_task-breakdown.md — find the first unchecked [ ] task
4. State out loud what you are about to do and which file you will write first
5. Wait for confirmation if the task is ambiguous
6. Write the file
7. Run: npm run tsc — fix ALL errors before moving to the next file
8. Check the task off in docs/17_task-breakdown.md
9. If context reaches 60%: write PROGRESS.md, tell the user, stop
```

**Never start a new file until `npm run tsc` passes cleanly on the previous one.**

---

## PROGRESS TRACKING

When context reaches 60%, write this to `PROGRESS.md` before stopping:

```markdown
## Last completed task
[exact task name from 17_task-breakdown.md]

## Files written this session
- [list every file]

## Current phase
Phase X — [name]

## Next task
[exact next unchecked task]

## Open issues
[anything that needs attention]
```

To resume: read `CLAUDE.md` + `PROGRESS.md` + `docs/17_task-breakdown.md`, find first unchecked task.

---

## PROJECT

**MINDSPARK** — mental arithmetic assessment platform, ages 6–18, single institution.

Two assessment types only. Nothing else exists in V1:
- **EXAM** — vertical abacus equations + 4-option MCQ. Question Navigator MOUNTED throughout.
- **TEST** — Flash Anzan. Numbers flash at millisecond intervals. Navigator UNMOUNTED during Phase 2 (`PHASE_2_FLASH`) and Phase 3 (`PHASE_3_MCQ`).

---

## STACK

```
next@15.x                 App Router · RSC · Server Actions · Edge Middleware
@supabase/supabase-js     PostgreSQL · Auth · Realtime Broadcast · RPC · RLS
shadcn/ui                 Radix Primitives + Tailwind component layer
tailwindcss@4.x           Utility-first CSS
zustand                   Client state — UI FLAGS ONLY (never role, never email)
dexie@4.x                 IndexedDB offline answer queue
lottie-react              Abacus loader animation (abacus-loader.json)
lucide-react              Icons
@phosphor-icons/react     Icons
@tanstack/react-table     Student/exam data tables
@hello-pangea/dnd         Drag-and-drop level ordering
recharts                  Dashboard KPI charts
tiptap                    Announcement rich-text editor (headless, dynamic import)
papaparse                 Client-side CSV parsing
sanitize-html             Server-safe HTML sanitization — DOMPurify BANNED
date-fns + date-fns-tz    UTC storage + IST display
```

---

## COMMANDS

```bash
npm run dev                                                    # development server
npm run build                                                  # production build
npm run tsc                                                    # run after EVERY file
npm run lint                                                   # ESLint
npm run test                                                   # Vitest unit + integration
npm run test:e2e                                               # Playwright
npx supabase start                                             # start local Supabase
npx supabase db push                                           # push migrations to local
npx supabase gen types typescript --local > types/supabase.ts  # regenerate after migrations
```

---

## PROJECT STRUCTURE

```
src/
  app/
    (admin)/              Admin panel route group
    (student)/            Student panel route group
    api/
      submissions/
        teardown/         POST — keepalive pagehide handler
        offline-sync/     POST — Dexie queue flush
      consent/
        verify/           GET — guardian email link handler (unauthenticated)
    actions/              Server Actions (9 files — see Phase 4)
  components/             Shared React components
  lib/
    supabase/             client.ts · server.ts · middleware.ts · admin.ts
    auth/                 rbac.ts · session.ts
    anzan/                timing-engine.ts · visibility-guard.ts · contrast-dampener.ts
    anticheat/            clock-guard.ts · tab-monitor.ts · teardown.ts
    offline/              indexed-db-store.ts · sync-engine.ts · storage-probe.ts
    constants.ts          ALL magic numbers live here
  stores/                 Zustand stores (exam-session · ui · auth)
  hooks/                  Custom React hooks
  types/                  supabase.ts (generated) · api.ts · enums.ts
supabase/
  migrations/             001–026 — run in strict order
  rollbacks/              One rollback file per migration
docs/                     All spec files (read-only — do not modify)
```

---

## CANONICAL SOURCE HIERARCHY

When two documents conflict, the lower number wins. Always check before guessing.

| Priority | File | Authority |
|----------|------|-----------|
| 1 | `docs/11_database.md` | Schema · column names · migration sequence · RPC names · RLS |
| 2 | `docs/09_fsd.md` | State machines · phase strings · ExamPhase enum · event names |
| 3 | `docs/12_api-contracts.md` | Route Handlers · Server Actions · HTTP codes · error codes |
| 4 | `design-system.html` | ALL colour values · typography · spacing |
| 5 | `CLAUDE.md` (this file) | Implementation warnings — most current |
| 6 | `docs/08_a11y.md` | WCAG requirements · ARIA patterns · Ticker Mode |
| 7 | `docs/05_ia-rbac.md` | Route map · RBAC roles · cohort_history RLS |
| 8 | Everything else | Subordinate to all above |

---

## PHASE ROUTING — WHICH DOCS TO READ PER PHASE

Read only the docs listed for your current phase. Do not pre-read future phases.

| Phase | Must read before starting |
|-------|--------------------------|
| 0 — Scaffold | This file only |
| 1 — Database | `docs/11_database.md` (all 1,684 lines) |
| 2 — Auth | `docs/05_ia-rbac.md` · `docs/14_security.md` |
| 3 — State + Offline | `docs/09_fsd.md` §3–§5 |
| 4 — Server Actions | `docs/12_api-contracts.md` (all 1,025 lines) |
| 5 — Components | `docs/07_hifi-spec.md` · `docs/08_a11y.md` |
| 6 — Admin Panel | `docs/06_wireframes.md` Part A · `docs/07_hifi-spec.md` §5 · `docs/23_admin-manual.md` |
| 7 — Student Panel | `docs/06_wireframes.md` Part B · `docs/07_hifi-spec.md` §6 · `docs/24_student-guide.md` |
| 8 — Assessment Engine | `docs/09_fsd.md` (full) · `docs/13_exam-engine-spec.md` (full) — read both completely first |

---

## HARD RULES — VIOLATIONS CAUSE SILENT RUNTIME FAILURES

### Rule 1 — Phase string
```typescript
// CORRECT
{phase !== 'PHASE_2_FLASH' && <Navigator/>}

// WRONG — 'FLASH' does not exist in ExamPhase enum
// This condition is always true — Navigator is never unmounted
{phase !== 'FLASH' && <Navigator/>}
```

### Rule 2 — Flash timing
```typescript
// CORRECT — RAF delta accumulator
function loop(ts: number) {
  const delta = ts - lastTs;
  lastTs = ts;
  accumulator += delta;
  while (accumulator >= interval) { advance(); accumulator -= interval; }
  rafHandle = requestAnimationFrame(loop);
}

// WRONG — drifts on slow devices and background tabs
setInterval(advance, interval);
```

### Rule 3 — Navigator unmount (not hide)
```tsx
// CORRECT — truly unmounted from DOM
{phase !== 'PHASE_2_FLASH' && <Navigator/>}

// WRONG — still in DOM, still consumes memory
<Navigator style={{ display: phase === 'PHASE_2_FLASH' ? 'none' : 'block' }}/>
```

### Rule 4 — Flash number CSS
```css
/* CORRECT */
.flash-number { transition: none !important; }

/* WRONG — any transition causes retinal ghosting */
/* Note: the 30ms opacity fade is on the CONTAINER wrapper, not .flash-number */
```

### Rule 5 — JWT role claim
```typescript
// CORRECT
const role = user.app_metadata.role;

// WRONG — returns 'authenticated', not the app role
const role = session.user.role;
```

### Rule 6 — RLS role claim
```sql
-- CORRECT
(auth.jwt() -> 'app_metadata') ->> 'role' = 'admin'

-- WRONG — returns 'authenticated'
auth.jwt() ->> 'role' = 'admin'
```

### Rule 7 — Realtime channel separation
```typescript
// CORRECT
supabase.channel(`exam:${paperId}`)    // Broadcast lifecycle events
supabase.channel(`lobby:${paperId}`)   // Presence only

// WRONG — lifecycle events on lobby channel are never received by students in the engine
supabase.channel(`lobby:${paperId}`).on('broadcast', { event: 'exam_live' }, ...)
```

### Rule 8 — Colour semantics
```
#991B1B  →  negative arithmetic operands ONLY (Flash Anzan n < 0)
#DC2626  →  wrong-answer verdicts · error states · validation failures · destructive actions
#EF4444  →  LIVE badge dot ONLY
#FF6B6B  →  BANNED everywhere (fails WCAG AA)
```

### Rule 9 — Supabase channel cleanup
```typescript
// CORRECT — every useEffect that subscribes must unsubscribe
useEffect(() => {
  const channel = supabase.channel(name).subscribe();
  return () => { supabase.removeChannel(channel); };
}, []);
```

### Rule 10 — Teardown endpoint
```typescript
// CORRECT — stable URL required for pagehide keepalive
document.addEventListener('pagehide', () => {
  fetch('/api/submissions/teardown', { method: 'POST', keepalive: true, ... });
});

// WRONG — Server Actions have no stable URL for pagehide fetch
document.addEventListener('pagehide', () => { submitAnswersAction(payload); });
```

---

## NEVER

| Banned | Reason | Replacement |
|--------|--------|-------------|
| `setTimeout` / `setInterval` for flash | Drifts on slow hardware | RAF + delta accumulator |
| `DOMPurify` | `window is not defined` in RSC | `sanitize-html` server-side only |
| `#FF6B6B` | Fails WCAG AA (3.6:1) | `#991B1B` negatives · `#EF4444` LIVE badge |
| `#1A1A1A` | Banned everywhere | `#F1F5F9` for <300ms flash bg |
| `#E0E0E0` | Banned everywhere | `#334155` for <300ms flash text |
| `#121212` | Banned as any background | `#F8FAFC` page bg |
| `Inter` font | Banned UI font | DM Sans |
| Roboto Mono | Banned numeric font | DM Mono |
| `display:none` on Phase 2 UI | Still in DOM | Conditional unmount via JSX |
| `admin.ts` in client components | Service-role key exposure | Server-only import |
| `admin.ts` in `(student)/` routes | ESLint rule blocks it | Use `server.ts` |
| `validate_offline_submission` | Does not exist in DB | `validate_and_migrate_offline_submission` |
| `assessment.ts` (singular) | Wrong file name | `assessments.ts` (plural) |
| `clock_guard_events` table | Does not exist | `activity_logs` with `action_type = 'CLOCK_GUARD_FLAG'` |
| `assessment_sessions.status` | Column does not exist | Use `closed_at IS NOT NULL` |
| `offline_submissions_staging.created_at` | Column does not exist | `server_received_at` |
| `question_index` in student_answers | Column does not exist | `question_id UUID FK → questions(id)` |
| `session_id` join on student_answers | Column does not exist | Join via `submission_id` |
| Postgres Changes for exam events | WAL overflow at 2,500+ users | Supabase Broadcast |
| PWA · leaderboards · parent portal | V1 non-goals | Do not build |
| `.env.local` committed to git | Secret exposure | Always in `.gitignore` |

---

## ALWAYS

```
npm run tsc                               after every file — zero errors before next file
docs/17_task-breakdown.md                check off task when complete
PROGRESS.md                              write at 60% context, before /clear
setTimeout(connect, Math.random() * 5000) all WebSocket connect calls (thundering herd)
font-variant-numeric: tabular-nums       all elements using DM Mono
ON CONFLICT (idempotency_key) DO NOTHING all student_answers upserts
supabase.removeChannel()                in every useEffect cleanup that subscribes
```

---

## ASK BEFORE

```
Adding any npm package not in the stack list
Modifying any file in supabase/migrations/ (irreversible without full db reset)
Changing any column name, table name, or RLS policy
Creating a new Zustand store
Deviating from the Canonical Source Hierarchy
```

---

## DATABASE — CRITICAL FACTS

**Migration count:** 26 (001→026). Run in strict order. Do not skip.

**student_answers schema (canonical — Design A):**
```sql
submission_id   UUID NOT NULL FK → submissions(id) ON DELETE CASCADE
question_id     UUID NOT NULL FK → questions(id)
idempotency_key UUID NOT NULL UNIQUE
selected_option TEXT NULL          -- NULL = skipped
is_correct      BOOLEAN NULL       -- set by calculate_results RPC
answered_at     TIMESTAMPTZ NOT NULL
UNIQUE (submission_id, question_id)
```

**The three Security Definer RPCs (migration 020):**
```
bulk_import_students()                      per-row skip on duplicate → {inserted, skipped, errors}
validate_and_migrate_offline_submission()   HMAC validation → staging → student_answers + submissions
calculate_results(p_paper_id)               SKIP LOCKED → recalculates is_correct + score + grade
```

**Key column names — use these exactly:**
```
exam_papers            NOT assessments
paper_id               NOT assessment_id (FK on submissions and assessment_sessions)
forced_password_reset  NOT force_password_reset (with 'd')
session_timeout_seconds NOT session_timeout
valid_from / valid_to  NOT start_date / end_date (on cohort_history)
result_published_at    NOT published (TIMESTAMPTZ — not BOOLEAN)
server_received_at     NOT created_at (on offline_submissions_staging)
```

**Tables without a status column:**
- `assessment_sessions` — use `closed_at IS NOT NULL` for completed sessions
- Status lives on `exam_papers` only

**Deletion FK order (always child before parent):**
```
student_answers → submissions → activity_logs → students
```

---

## API CONTRACTS — CRITICAL FACTS

**3 Route Handlers:**
```
POST /api/submissions/teardown     pagehide keepalive · JWT from Authorization header
POST /api/submissions/offline-sync Dexie queue flush · HMAC validated · rate limited 10/60s
GET  /api/consent/verify           unauthenticated · ?token= · guardian email link · redirects
```

**16 Server Actions across 9 files:**
```
src/app/actions/assessments.ts          createAssessment · updateAssessment · publishAssessment
                                         forceOpenExam · forceCloseExam
src/app/actions/students.ts             importStudentsCSV · createStudent · updateStudent · deactivateStudent
src/app/actions/assessment-sessions.ts  initSession · submitAnswer · submitExam
src/app/actions/results.ts              publishResult · unpublishResult · reEvaluateResults · bulkPublish
src/app/actions/announcements.ts        createAnnouncement · publishAnnouncement
src/app/actions/settings.ts             updateSettings
src/app/actions/auth.ts                 login · logout · resetPassword · refreshSession
src/app/actions/levels.ts               createLevel · updateLevel · reorderLevels · softDeleteLevel
src/app/actions/activity-log.ts         getActivityLog (admin read — required for Activity Log page)
```

**submitAnswer payload:**
```typescript
{
  session_id:      string;   // UUID
  question_id:     string;   // UUID FK → questions(id) — NOT question_index
  selected_option: 'A'|'B'|'C'|'D'|null;
  answered_at:     number;   // client ms timestamp
  idempotency_key: string;   // UUID v5
}
```

**forceOpenExam — two valid transitions:**
```
PUBLISHED → LIVE   standard open · broadcasts exam_live on exam:{paper_id}
CLOSED → LIVE      recovery · within 10 minutes of closed_at only
                   broadcasts exam_reopened on exam:{paper_id}
                   after 10 minutes → ASSESSMENT_LOCKED
```

---

## DESIGN SYSTEM

All values from `design-system.html`. No hex code outside this table is permitted.

**Backgrounds**
```
#F8FAFC   bg-page     Page background — BOTH admin and student panels
#FFFFFF   bg-card     Cards · modals · sidebars
```

**Brand**
```
#1A3829   green-800    Primary CTA · LIVE card border · selected states
#204074   brand-navy   Boot screen + login page ONLY
#F57A39   brand-orange Progress bar on navy bg ONLY
```

**Text**
```
#0F172A   text-primary    Headings · flash numbers ≥500ms (19.6:1 on white)
#475569   text-secondary  Body copy · table cells
#94A3B8   text-subtle     Placeholder · disabled (labels only)
#991B1B   text-negative   Negative arithmetic operands ONLY — 9.7:1 AAA
#DC2626   text-danger     Wrong answers · errors · validation failures
```

**Semantic states**
```
success:  #DCFCE7 bg · #166534 text   Correct answer · Submitted badge
warning:  #FEF9C3 bg · #854D0E text   Offline banner · timer ≤20% · Disconnected row
error:    #FEE2E2 bg · #DC2626 text   Wrong-answer row · form validation error
info:     #EFF6FF bg · #1D4ED8 text   Info toasts · notices
live:     #EF4444 bg · #FFFFFF text   LIVE badge ONLY
```

**Flash Anzan contrast ramp**
```
≥500ms      #FFFFFF bg · #0F172A text   21:1 AAA · no fade
300–499ms   #F8FAFC bg · #1E293B text   ~14:1 AAA · no fade
<300ms      #F1F5F9 bg · #334155 text   ~11:1 AAA · 30ms opacity fade on CONTAINER
```

**Typography**
```
DM Sans   ALL UI text — headings · labels · body · buttons
DM Mono   ALL numbers — timers · equations · scores · roll numbers · flash numbers
          font-variant-numeric: tabular-nums on every DM Mono element
```

**Touch targets**
```
MCQ option buttons   min 64×64px (Fitts Law — ages 6–18)
CTA buttons          min 48px height
Standard buttons     40px height
```

---

## RBAC

| Role | Scope | Auth source |
|------|-------|-------------|
| admin | Platform-wide | `user.app_metadata.role` via `requireRole()` |
| teacher | Own cohort + historical via cohort_history | `user.app_metadata.role` |
| student | Own data only | JWT · RLS enforces at DB level |

Student panel layout: redirect non-students immediately.
Admin panel layout: redirect non-admin/teacher users immediately.
`middleware.ts`: JWT inspection at Edge before any route handler runs.

---

## ENVIRONMENT VARIABLES

```bash
# Required — .env.local for local · Vercel dashboard for production
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only — NEVER in client code

OFFLINE_SYNC_SECRET=            # HMAC key for offline-sync route
HMAC_SECRET=                    # HMAC key for clock guard + consent JWT

RESEND_API_KEY=                 # guardian consent emails
EMAIL_FROM=                     # noreply@yourdomain.com

NEXT_PUBLIC_APP_URL=            # https://yourdomain.com in production
```

---

## CONSTANTS — all in src/lib/constants.ts

```typescript
export const HEARTBEAT_INTERVAL_MS  = 5_000;    // 5s — WebSocket heartbeat
export const JITTER_WINDOW_MS       = 5_000;    // 5s — WebSocket connect jitter
export const DEBOUNCE_MS            = 300;      // search input debounce
export const INPUT_COOLDOWN_MS      = 1_200;    // MCQ inter-tap cooldown
export const MIN_FLASH_INTERVAL_MS  = 200;      // hard floor — DB CHECK enforces this
export const HEARTBEAT_TIMEOUT_MS   = 25_000;   // 25s — admin monitor amber threshold
export const REOPEN_WINDOW_MS       = 600_000;  // 10min — CLOSED→LIVE reopen window
export const INTERSTITIAL_MS        = 3_000;    // lobby → exam transition
```

No magic numbers anywhere else. If a constant is needed, add it here.

---

## SELF-VERIFICATION COMMANDS

Run these before marking Phase 8 complete:

```bash
# No setTimeout/setInterval in flash timing code
grep -r "setInterval\|setTimeout" src/lib/anzan/
# Expected: 0 results

# No banned colours in src/
grep -r "FF6B6B\|1A1A1A\|E0E0E0" src/
# Expected: 0 results

# No singular assessment.ts
grep -r "actions/assessment\.ts\b" src/
# Expected: 0 results

# No wrong RPC short-form name
grep -r "validate_offline_submission\b" src/
# Expected: 0 results

# No question_index in student_answers writes
grep -r "question_index" src/app/actions/ src/app/api/
# Expected: 0 results

# No banned phase string in conditionals
grep -r "phase.*!==.*'FLASH'\|phase.*===.*'FLASH'" src/
# Expected: 0 results

# Realtime hooks clean up
grep -r "supabase\.channel" src/hooks/
# Every match must have supabase.removeChannel() in same file

# TypeScript
npm run tsc
# Expected: 0 errors

# Lint
npm run lint
# Expected: 0 errors · admin.ts import in (student)/ must trigger error
```

---

## IMPLEMENTATION WARNINGS — BY TOPIC

> Every warning represents a real failure found during the pre-development audit.
> Violating these causes silent runtime failures, not build errors.

---

### Schema & Database

⚠️ **student_answers has submission_id FK** — `submission_id UUID NOT NULL FK → submissions(id)`. Join via `submission_id`. There is no `session_id` column on `student_answers`. Any `WHERE student_answers.session_id = ...` fails at runtime.

⚠️ **student_answers uses question_id UUID** — `question_id UUID FK → questions(id)`. There is no `question_index` column. Any code writing `question_index` to `student_answers` fails at runtime.

⚠️ **assessment_sessions has no status column** — Status lives on `exam_papers` only. Use `closed_at IS NOT NULL` to identify completed sessions. `WHERE assessment_sessions.status = 'CLOSED'` fails at runtime.

⚠️ **offline_submissions_staging column is server_received_at** — Not `created_at`. All staleness queries must use `server_received_at`.

⚠️ **Deletion FK order is mandatory** — Delete `student_answers` BEFORE `submissions`. Any retention job that deletes `submissions` first fails with a foreign key violation.

⚠️ **cohort_history uses valid_from/valid_to TIMESTAMPTZ** — Not `start_date DATE` / `end_date DATE`. Wrong column names fail at runtime in all temporal join queries and RLS policies.

⚠️ **forced_password_reset has a 'd'** — Column is `forced_password_reset`. `force_password_reset` does not exist. Reading the wrong column always returns null — the password reset gate never fires.

⚠️ **result_published_at is TIMESTAMPTZ** — Not `published BOOLEAN`. Published state = `result_published_at IS NOT NULL`. Setting `published = true` fails at runtime.

⚠️ **session_timeout_seconds has _seconds suffix** — `session_timeout_seconds`. `session_timeout` does not exist.

---

### RPC Functions

⚠️ **RPC name is validate_and_migrate_offline_submission** — Full name only. `validate_offline_submission` does not exist. `supabase.rpc('validate_offline_submission', ...)` returns "function does not exist".

⚠️ **RPC file is supabase/migrations/020_create_security_definer_functions.sql** — Not `supabase/functions/`. Edge Functions and database RPCs are completely separate systems.

⚠️ **calculate_results takes p_paper_id** — `calculate_results(p_paper_id := paperId)`. Not `reevaluate_results`, not `recalculate_scores`.

⚠️ **bulk_import_students is skip-per-row** — Per-row EXCEPTION handling. Duplicate `roll_number` skips that row, others continue. Returns `{inserted, skipped, errors}`. Partial imports are valid and expected.

---

### Assessment Engine

⚠️ **Phase string is PHASE_2_FLASH** — ExamPhase enum has no `'FLASH'`. `phase !== 'FLASH'` is permanently true — every component stays mounted forever. Use `phase !== 'PHASE_2_FLASH'`.

⚠️ **isPaused is a boolean flag, not a phase** — `'PAUSED'` is not in ExamPhase. Use `isPaused: boolean` in `exam-session-store.ts`. `setPhase('PAUSED')` fails TypeScript.

⚠️ **transition: none on .flash-number is absolute** — Any CSS transition causes retinal ghosting. The 30ms opacity fade belongs on the wrapper container, not `.flash-number`.

⚠️ **Flash minimum is 200ms** — `anzan_delay_ms >= 200 CHECK` in DDL. Timing engine must throw `INTERVAL_BELOW_MINIMUM` below 200ms.

⚠️ **Metronome is Web Audio API, not MP3** — 880Hz sine · 80ms · 3 beats at t=500ms, t=1000ms, t=1500ms. No network dependency.

⚠️ **forceOpenExam reopen is type-specific** — EXAM returns to ACTIVE with current question. TEST restarts from PHASE_1_START. Never transition TEST directly to PHASE_3_MCQ on reopen.

---

### Realtime & Channels

⚠️ **Lifecycle events on exam: channel only** — `exam_live`, `exam_closed`, `exam_reopened` fire on `exam:{paper_id}`. `lobby:{paper_id}` is Presence-only. Students in the engine never receive events on the lobby channel.

⚠️ **WebSocket jitter is mandatory** — All connect calls: `setTimeout(() => channel.subscribe(), Math.random() * 5000)`. Without this, 2,500 simultaneous connections cause `too_many_joins`.

⚠️ **Submitted status is permanent** — Once `completed_at IS NOT NULL` or `sync_status = 'verified'`, student status is locked green on the admin monitor. Subsequent Presence `leave` events are ignored.

---

### Auth & Security

⚠️ **DOMPurify is banned** — Crashes RSC with `ReferenceError: window is not defined`. Use `sanitize-html` server-side at write time only.

⚠️ **JWT role is in app_metadata** — `user.app_metadata.role`. Never `session.user.role` (returns `'authenticated'`). Never `auth.jwt() ->> 'role'` in RLS (also returns `'authenticated'`).

⚠️ **Student email is not collected** — Students log in with `roll_number + date_of_birth`. The only email is the guardian's — for consent and deletion notification only.

⚠️ **DOB vs initial password are different inputs** — Login DOB field: `YYYY-MM-DD` (e.g. `2011-04-15`). First-login initial password: `DDMMYYYY` no dashes (e.g. `15042011`).

---

### Route Handlers & Server Actions

⚠️ **Teardown is a Route Handler, not Server Action** — `pagehide` keepalive requires a stable URL. Server Actions post to the current page URL — unreliable for unload events.

⚠️ **3 Route Handlers, 16 Server Actions** — The third Route Handler is `GET /api/consent/verify`. It is unauthenticated and cannot be a Server Action.

⚠️ **assessments.ts is plural** — `src/app/actions/assessments.ts`. Singular `assessment.ts` does not exist.

⚠️ **activity-log.ts Server Action is required** — The Activity Log admin page has no data source without it.

⚠️ **consent/verify Route Handler is required** — Without it, `consent_verified` can never be set to true. No student can log in.

---

### Offline & Data Persistence

⚠️ **IndexedDB before network — always** — Every answer writes to IndexedDB before any network call. The IndexedDB write is the durable record.

⚠️ **Lobby needs polling fallback** — If a student misses the `exam_closed` Broadcast, they stay in the lobby forever. Add 30-second polling that re-fetches `exam_papers.status`. If `CLOSED`, redirect to dashboard.

---

### Design & Accessibility

⚠️ **#991B1B is for negative arithmetic numbers only** — Wrong answers, errors, and validation failures use `#DC2626` text on `#FEE2E2` bg (danger palette).

⚠️ **SRAnnouncerRef requires React.forwardRef** — Without it, `useImperativeHandle(ref, ...)` silently does nothing. All exam screen reader announcements break.

⚠️ **useInputCooldown uses RAF + performance.now()** — Not `setTimeout`. 1,200ms inter-tap cooldown must use `requestAnimationFrame` + delta accumulator.

⚠️ **Student routes are plural** — `/student/exams` and `/student/tests`. Singular forms 404.

⚠️ **Admin monitor route is /admin/monitor** — Not `/admin/live-monitor`. Wrong path 404s during live incidents.

⚠️ **WCAG level is 2.2 AAA** — Not AA. All axe-playwright scans use `wcag2a, wcag2aa, wcag21aa, wcag21aaa, wcag22aa`.

---

*End of CLAUDE.md — you have read all required context. State your first task and begin.*
