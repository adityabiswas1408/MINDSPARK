# MINDSPARK — Complete Antigravity Setup and Execution Guide

This file is your single reference for everything needed to start and run the
MINDSPARK build in Google Antigravity. Keep it open alongside Antigravity.

---

## Step 1 — Accounts to Create (All Free)

Create all four before downloading Antigravity. You will need credentials on day one.

### 1. GitHub
URL: github.com
Plan: Free
Actions:
- Create account
- Create private repository named `mindspark`
- Do not initialise with README (Antigravity generates it)
What to save:
- Your GitHub username
- Repository URL: https://github.com/[your-username]/mindspark
- Personal Access Token:
  Settings → Developer settings → Personal access tokens → Tokens classic
  → Generate new token → scopes: repo + workflow

### 2. Supabase
URL: supabase.com
Plan: Free tier (sufficient for development and investor demos)
Actions:
- Create account
- New project → name: mindspark → region: ap-south-1 (Mumbai) or ap-southeast-1 (Singapore)
- Set a strong database password and save it immediately
- Wait ~2 minutes for project to provision
What to save from Settings → API:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]   ← never expose this
```
Also save:
- Database password
- Project reference ID (the part before .supabase.co)

### 3. Vercel
URL: vercel.com
Plan: Hobby (Free)
Actions:
- Create account using "Continue with GitHub" (links accounts automatically)
- Import your mindspark repository
- Framework preset: Next.js (auto-detected)
- Do NOT deploy yet — environment variables must be set first
What to save:
- Your Vercel team URL: https://vercel.com/[your-team]
- Production domain (e.g. mindspark.vercel.app)

### 4. Resend (guardian consent emails)
URL: resend.com
Plan: Free (3,000 emails/month — sufficient for demos)
Actions:
- Create account
- Add and verify your domain
- Create an API key
What to save:
```
RESEND_API_KEY=[your-api-key]
EMAIL_FROM=noreply@yourdomain.com
```

---

## Step 2 — Local Machine Setup

### Install required tools

```bash
# Node.js 20 LTS
nvm install 20
nvm use 20
node --version    # should show v20.x.x

# Supabase CLI
npm install -g supabase
supabase --version

# Docker Desktop (required for Supabase local)
# Download from: docker.com/products/docker-desktop
# Launch Docker Desktop before running supabase start

# Git (usually already installed)
git --version
```

### Create your project folder

```bash
mkdir mindspark
cd mindspark
git init
git remote add origin https://github.com/[your-username]/mindspark.git
```

### Generate your two secrets

```bash
openssl rand -hex 32   # copy output → OFFLINE_SYNC_SECRET
openssl rand -hex 32   # copy output → HMAC_SECRET
```

### Create .env.local

Create this file in your mindspark/ folder. Fill in all values now.

```bash
# .env.local — NEVER commit this file

# Supabase (local dev — replace with Supabase cloud values for production)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from supabase start output]
SUPABASE_SERVICE_ROLE_KEY=[from supabase start output]

# Security secrets
OFFLINE_SYNC_SECRET=[from openssl rand -hex 32]
HMAC_SECRET=[from openssl rand -hex 32]

# Email
RESEND_API_KEY=[from resend.com]
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Start Supabase local

```bash
supabase init
supabase start
```

This prints your local credentials. Copy them into .env.local above.

### Add environment variables to Vercel

In your Vercel project: Settings → Environment Variables. Add all of the above.
Use your Supabase cloud project values (not localhost) for the Vercel Supabase variables.

---

## Step 3 — Download and Install Antigravity

```
1. Go to: antigravity.google
2. Click Download for your OS
3. Run the installer
4. On first launch: sign in with personal Gmail account
5. On the Agent Manager configuration screen:
   → Select: Agent-assisted development (recommended)
   → Terminal Policy: Auto
6. Select model: Gemini 3 Pro
7. Import VS Code settings if you have them (or skip)
```

---

## Step 4 — Create the Folder Structure

Create this exact structure in your mindspark/ folder before opening it in Antigravity.
All spec files (docs/) should already be in your outputs folder from the audit.

```
mindspark/
├── CLAUDE.md                         ← from outputs (683 lines)
├── GEMINI.md                         ← from outputs/antigravity/
├── PROGRESS.md                       ← from outputs/antigravity/ (starter)
├── .env.local                        ← created above (never commit)
├── .agent/
│   ├── rules/
│   │   ├── 00-core.md               ← from outputs/antigravity/.agent/rules/
│   │   ├── 01-schema.md             ← from outputs/antigravity/.agent/rules/
│   │   ├── 02-design.md             ← from outputs/antigravity/.agent/rules/
│   │   └── 03-phase-gate.md         ← from outputs/antigravity/.agent/rules/
│   └── workflows/
│       ├── start-phase.md           ← from outputs/antigravity/.agent/workflows/
│       ├── complete-task.md         ← from outputs/antigravity/.agent/workflows/
│       └── debug-handoff.md         ← from outputs/antigravity/.agent/workflows/
├── docs/
│   ├── 01_prd.md
│   ├── 05_ia-rbac.md
│   ├── 06_wireframes.md
│   ├── 07_hifi-spec.md
│   ├── 08_a11y.md
│   ├── 09_fsd.md
│   ├── 10_architecture.md
│   ├── 11_database.md               ← MOST IMPORTANT — 1,684 lines
│   ├── 12_api-contracts.md
│   ├── 13_exam-engine-spec.md
│   ├── 14_security.md
│   ├── 15_incident-response.md
│   ├── 17_task-breakdown.md         ← task checklist — updated throughout build
│   ├── 18_performance-budget.md
│   ├── 19_test-plan.md
│   ├── 20_devops.md
│   ├── 23_admin-manual.md
│   ├── 24_student-guide.md
│   ├── 25_maintenance.md
│   └── legal/
│       ├── dpia.md
│       ├── privacy-policy.md
│       └── terms-of-service.md
├── pre-launch-checklist.md
└── CHANGELOG.md
```

---

## Step 5 — Open Project in Antigravity

```
1. Launch Antigravity
2. File → Open Folder → select your mindspark/ folder
3. Confirm Antigravity can see CLAUDE.md and GEMINI.md in the file tree
4. Confirm Antigravity can see .agent/rules/ and .agent/workflows/ folders
5. Open Agent Manager panel
6. Click: New Task
```

---

## Step 6 — First Message to Antigravity (Copy Exactly)

Paste this as your very first message. Do not modify it.

```
/start-phase

Read CLAUDE.md completely — all 683 lines, no truncation.
Then read GEMINI.md completely.
Then read PROGRESS.md.
Then read docs/17_task-breakdown.md and find the first unchecked [ ] task in Phase 0.

State:
1. Which task you are starting
2. Which file you will create first
3. Which canonical source you will check before writing it

Wait for my confirmation before writing anything.
```

Antigravity will read all four files and tell you the first task. You confirm, it begins.

---

## Phase-by-Phase Opening Prompts

Use these at the start of each phase's first session.
Always prefix with /start-phase.

---

### Phase 0 — Scaffold

```
/start-phase

Phase 0 — Project Scaffold.

Read CLAUDE.md completely.
Read @docs/20_devops.md completely — all lines, no truncation.
  This file defines the GitHub Actions CI/CD pipeline, 3 environments, migration deployment
  rules, and rollback procedures. Reading it now ensures the pipeline is built correctly
  from the first commit, not bolted on afterwards.
Then read docs/17_task-breakdown.md Phase 0 section.

Create these files in strict order:
package.json → next.config.ts → tailwind.config.ts → tsconfig.json →
.eslintrc.json → postcss.config.js → .gitignore → .env.example →
src/middleware.ts → src/app/layout.tsx → src/lib/constants.ts

Rules:
- After EVERY file: run npm run tsc. Fix all errors before the next file.
- tsconfig.json: strict mode + @/ path alias to src/
- .eslintrc.json: no-restricted-imports blocking admin.ts in (student)/ routes
- layout.tsx: DM Sans + DM Mono via next/font/google
- constants.ts: all values from CLAUDE.md §CONSTANTS (all 8 constants, exact values)
- .gitignore must include .env.local

Check each task off in docs/17_task-breakdown.md as you complete it.
Do not proceed to Phase 1 until: npm run dev starts, npm run tsc → 0 errors, npm run build completes.
```

---

### Phase 1 — Database

```
/start-phase

Phase 1 — Database Layer.

MANDATORY: Read @docs/11_database.md completely — all 1,684 lines — before writing migration 001.
Do not write a single migration until you have read the entire file.
Confirm you can see the student_answers DDL in §12 before continuing.

Create all 26 migration files in supabase/migrations/ in strict order 001→026.
Run: supabase db push after every 3 migrations to catch FK errors early.

Critical rules:
- Migration 014 student_answers: submission_id UUID FK → submissions(id) ON DELETE CASCADE
  AND question_id UUID FK → questions(id). NO session_id. NO question_index.
- Migration 019 RLS: use (auth.jwt() -> 'app_metadata') ->> 'role' — never auth.jwt() ->> 'role'
- Migration 020 RPCs: validate_and_migrate_offline_submission (full name — no shorter form)
- Migration 020 bulk_import: per-row skip on duplicate, returns {inserted, skipped, errors}
- Migration 025: consent_verified BOOLEAN DEFAULT false on students (DPDP required)
- Migration 026: deletion_scheduled_at on BOTH submissions AND activity_logs in one migration

After migration 026 passes:
npx supabase gen types typescript --local > types/supabase.ts

Do not proceed to Phase 2 until all 26 pass and types/supabase.ts is generated.
```

---

### Phase 2 — Auth Foundation

```
/start-phase

Phase 2 — Auth Foundation.

Read @docs/05_ia-rbac.md completely.
Read @docs/14_security.md completely.
Both files fully before writing any code.

Build in this exact order:
src/lib/supabase/client.ts → server.ts → middleware.ts → admin.ts →
src/lib/auth/rbac.ts → session.ts → src/stores/auth-store.ts

Rules:
- admin.ts: window guard (throws if typeof window !== undefined)
- rbac.ts: role ALWAYS from user.app_metadata.role — never from Zustand
- auth-store.ts: UI flags ONLY — no role, no email, no profile data
- session.ts: forced_password_reset (with 'd') redirect before any UI

npm run tsc after every file. Zero errors before next file.
```

---

### Phase 3 — State and Offline

```
/start-phase

Phase 3 — Zustand Stores and Dexie.js.

Read @docs/09_fsd.md §3, §4, and §5 completely before writing any code.

Build in this exact order:
src/stores/exam-session-store.ts
src/stores/ui-store.ts
src/lib/offline/indexed-db-store.ts
src/lib/offline/sync-engine.ts
src/lib/offline/storage-probe.ts

Rules:
- exam-session-store: NO localStorage. IndexedDB (Dexie) only.
- indexed-db-store: pendingAnswers table keyed by idempotency_key
- sync-engine: flushes pendingAnswers to POST /api/submissions/offline-sync on 'online' event
- storage-probe: calls navigator.storage.persist() AND navigator.storage.estimate() on app init

npm run tsc after every file.
```

---

### Phase 4 — Server Actions and Route Handlers

```
/start-phase

Phase 4 — Server Actions and Route Handlers.

MANDATORY: Read @docs/12_api-contracts.md completely — all 1,025 lines — before writing any file.
Read every action signature. Every error code. Every side effect. All 16 actions.

Build Route Handlers FIRST (they have external callers with stable URLs):
1. src/app/api/submissions/teardown/route.ts
2. src/app/api/submissions/offline-sync/route.ts
3. src/app/api/consent/verify/route.ts

Then 9 Server Action files (ALL plural or hyphenated — never singular):
4. src/app/actions/assessments.ts
5. src/app/actions/students.ts
6. src/app/actions/assessment-sessions.ts
7. src/app/actions/results.ts
8. src/app/actions/announcements.ts
9. src/app/actions/settings.ts
10. src/app/actions/auth.ts
11. src/app/actions/levels.ts
12. src/app/actions/activity-log.ts

Critical rules:
- submitAnswer payload uses question_id UUID (NOT question_index)
- importStudentsCSV: skip-per-row (NOT full rollback). Returns {inserted, skipped, errors}.
- offline-sync calls validate_and_migrate_offline_submission (full name)
- consent/verify: unauthenticated, ?token= param, sets consent_verified = true, redirects
- activity-log.ts is REQUIRED — Activity Log admin page has no data source without it

npm run tsc after every file. Context warning: save PROGRESS.md every 4 files.
```

---

### Phase 5 — Shared Components

```
/start-phase

Phase 5 — Shared Components.

Read @docs/07_hifi-spec.md completely.
Read @docs/08_a11y.md completely.
Both files fully before writing any component.

Start with:
1. src/app/globals.css
2. src/app/layout.tsx (DM Sans + DM Mono — update from Phase 0)
3. shadcn installs: npx shadcn@latest add [components from docs/17_task-breakdown.md Phase 5]
4. All shared components in order from docs/17_task-breakdown.md

Rules:
- SRAnnouncerRef MUST use React.forwardRef (without it AT announcements silently break)
- useInputCooldown MUST use RAF + performance.now() — never setTimeout
- No hex colour outside the approved table in CLAUDE.md §DESIGN SYSTEM
- DM Mono + tabular-nums on every numeric display
- #991B1B for negative arithmetic numbers ONLY — never errors or wrong answers

Context warning: 50+ components. Save PROGRESS.md every 10 files. Plan for 3–4 sessions.
```

---

### Phase 6 — Admin Panel

```
/start-phase

Phase 6 — Admin Panel (11 screens).

Read @docs/06_wireframes.md Part A completely.
Read @docs/07_hifi-spec.md §5 completely.
Read @docs/23_admin-manual.md completely.
All three before writing any page.

Build in this order (Monitor is LAST — it requires Realtime):
layout → dashboard → levels → students → assessments →
results → announcements → reports → activity-log → settings → monitor

For the Live Monitor page:
- Route: /admin/monitor/[id] — NOT /admin/live-monitor
- Broadcast channel: exam:{paper_id} for ALL lifecycle events (exam_live, exam_closed, exam_reopened)
- Presence channel: lobby:{paper_id} for student status display ONLY
- State hierarchy: DB Record > REST Offline Sync > WebSocket Presence
- Heartbeat timeout: 25 seconds (HEARTBEAT_TIMEOUT_MS) → amber status
- Submitted status is PERMANENTLY green — never overwritten by Presence leave events
- WebSocket jitter: setTimeout(() => channel.subscribe(), Math.random() * JITTER_WINDOW_MS)

npm run tsc after each page. Check tasks off in docs/17_task-breakdown.md.
```

---

### Phase 7 — Student Panel

```
/start-phase

Phase 7 — Student Panel (9 screens).

Read @docs/06_wireframes.md Part B completely.
Read @docs/07_hifi-spec.md §6 completely.
Read @docs/24_student-guide.md completely.
All three before writing any page.

Build in this order:
layout → dashboard → /student/exams → /student/tests → /student/lobby/[id] →
/student/results → /student/results/[id] → /student/profile → /student/consent

Critical rules:
- Routes are PLURAL: /student/exams and /student/tests (NOT /student/exam or /student/test)
- Lobby metronome: Web Audio API ONLY — 880Hz sine, 80ms, 3 beats at t=500/1000/1500ms
  No MP3. No network dependency.
- Consent page handles: ?status=verified / expired / invalid / already_verified (all four)
- Pending results: pointer-events: none (muted, not clickable)
- Non-LIVE assessments: show lock icon, clicks do nothing

npm run tsc after each page.
```

---

### Phase 8 — Assessment Engine

```
/start-phase

⚠️ FRESH SESSION REQUIRED. This is the most complex phase.
Clear all context before starting. Read everything fresh.

Phase 8 — Assessment Engine.

MANDATORY — read all four documents completely before writing a single line of code:

Read @docs/09_fsd.md completely — all sections, all lines.
  State machine · phase strings · ExamPhase enum · RAF engine · offline reconciliation.

Read @docs/13_exam-engine-spec.md completely — all lines.
  RAF loop · HMAC Clock Guard · contrast dampening · Ticker Mode.

Read @docs/19_test-plan.md completely — all lines, no truncation.
  Vitest unit tests (RAF drift < 5ms, HMAC guard, number generator, LRU purge, auth-store shape) ·
  Playwright E2E flows (full EXAM, full TEST Phase 1→2→3, offline resume, force close, result publish) ·
  k6 load test parameters (LT-01 thundering herd 2,500 concurrent, LT-02 heartbeat storm, LT-03 offline sync storm) ·
  axe-playwright WCAG 2.2 AAA scan configuration.
  Read now so tests are written alongside implementation. Do not write tests from memory.

Read @docs/18_performance-budget.md completely — all lines, no truncation.
  RAF timing drift target: < 5ms over a 10-second simulated run ·
  Admin LCP: < 2.5s · Student LCP: < 3.5s on 4G throttle ·
  JS bundle: < 150KB gzipped · WebSocket: 2,500 concurrent connections < 1% error rate ·
  Lighthouse CI budget file values and k6 script thresholds.
  Read now so timing-engine.ts, Lighthouse CI config, and k6 scripts are calibrated correctly.

Confirm you have read all four files before stating your first task.

Build in strict dependency order:

ANZAN LIBRARY — src/lib/anzan/:
1. number-generator.ts     Mulberry32 seeded PRNG, no consecutive duplicates
2. timing-engine.ts        RAF delta accumulator, throws INTERVAL_BELOW_MINIMUM < 200ms
3. visibility-guard.ts     visibilitychange → cancelAnimationFrame
4. contrast-dampener.ts    3-tier ramp: ≥500ms white, 300–499ms #F8FAFC/#1E293B, <300ms #F1F5F9/#334155
5. color-calibration.ts    #991B1B for n < 0 ONLY

ANTI-CHEAT — src/lib/anticheat/:
6. clock-guard.ts          HMAC + monotonic performance.now() — NON-BLOCKING
7. tab-monitor.ts          visibilitychange → aggregate count in Zustand exam store
8. teardown.ts             pagehide → fetch /api/submissions/teardown keepalive

ENGINE COMPONENTS — src/components/exam/:
9.  anzan-flash-view.tsx   PHASE_2_FLASH full canvas, Navigator UNMOUNTED
10. exam-vertical-view.tsx
11. mcq-grid.tsx           64×64px minimum
12. exam-timer.tsx         aria-live at 5min + 1min ONLY
13. question-navigator.tsx mounted for EXAM, UNMOUNTED for PHASE_2_FLASH + PHASE_3_MCQ
14. sync-indicator.tsx
15. paused-overlay.tsx
16. transition-interstitial.tsx  3000ms, Web Audio API metronome
17. network-banner.tsx
18. confirm-submit.tsx
19. completion-card.tsx

HOOK:
20. src/hooks/use-anzan-engine.ts

PAGE:
21. src/app/(student)/assessment/[id]/page.tsx

After completing: run ALL self-verification commands from CLAUDE.md §SELF-VERIFICATION COMMANDS.
Every grep must return 0 results. npm run tsc → 0 errors. npm run build → completes.
```

---

## How to Use @ References in Antigravity

When you want Antigravity to read a specific file in context, type @ followed by the path:

```
@docs/11_database.md — check the student_answers schema in §12
@docs/12_api-contracts.md — check the submitAnswer payload
@docs/07_hifi-spec.md — check the colour values for this component
```

Antigravity will load the file into the active conversation context.
Use @ references whenever writing code that depends on a spec document.

---

## How to Switch to Claude Sonnet Mid-Build

For Phase 8 complex reasoning, or when Gemini 3 Pro produces incorrect logic:

```
1. In Agent Manager: click the model dropdown on the active conversation
2. Select: Claude Sonnet 4.5 or Claude Sonnet 4.6
3. The conversation context carries over automatically
4. Switch back to Gemini 3 Pro for faster/cheaper generation when debugging is done
```

---

## Handing Off to Claude Code

When Antigravity hits a bug it cannot resolve, or when you want Claude Code to review
a completed phase:

1. Antigravity runs /debug-handoff workflow
2. Commits and pushes current state to GitHub
3. You open terminal in mindspark/ folder
4. Run: claude
5. First message:
   ```
   Read CLAUDE.md completely. Then read PROGRESS.md completely.
   [paste the specific instruction from PROGRESS.md ## What Claude Code Should Do]
   ```

---

## Git Commit Cadence

```bash
# After every phase:
git add -A
git commit -m "Phase X complete: [one-line description]"
git push origin main

# After every Claude Code debug fix:
git add -A
git commit -m "fix: [what was fixed] — verified by npm run tsc 0 errors"
git push origin main
```

Vercel auto-deploys on every push to main.
Your live preview URL is available after Phase 0 completes.
