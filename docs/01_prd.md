# MINDSPARK V1 — Product Requirements Document

> **Document type:** Production PRD — human stakeholders + AI coding agents  
> **Version:** 1.0  
> **Scope:** Single-institution build  
> **Status:** FINAL — V1 scope locked  
> **Output path:** `docs/prd.md`  
> **Related legal docs to read first:** `docs/legal/dpia.md` · `docs/legal/privacy-policy.md`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack — Exact Packages](#2-tech-stack--exact-packages)
3. [V1 RBAC Roles](#3-v1-rbac-roles)
4. [Assessment Types (EXAM and TEST)](#4-assessment-types-exam-and-test)
5. [P0 Features — Machine-Verifiable Acceptance Criteria](#5-p0-features--machine-verifiable-acceptance-criteria)
6. [Database Schema](#6-database-schema)
7. [File Index Summary](#7-file-index-summary)
8. [Design System & UX Constraints](#8-design-system--ux-constraints)
9. [V1 Non-Goals](#9-v1-non-goals)
10. [Architectural Vulnerability and Mitigation Audit](#10-architectural-vulnerability-and-mitigation-audit)
11. [UX/Cognitive Vulnerability and Mitigation Audit](#11-uxcognitive-vulnerability-and-mitigation-audit)
12. [Acceptance Criteria Checklist](#12-acceptance-criteria-checklist)

---

## 1. Executive Summary

MINDSPARK V1 is a production-grade, single-institution EdTech assessment platform purpose-built for abacus and mental arithmetic institutes. The platform serves three distinct roles — Admin, Teacher, and Student — across two precisely specified assessment formats: a vertical-format EXAM and a Flash Anzan-format TEST. The platform is engineered for offline-first resilience, millisecond-precision rendering, and real-time live monitoring. All V1 scope is strictly bounded; features outside this document must not be built.

**Primary constraints driving all architectural decisions:**
- Students aged 6–18; working memory and motor skill limitations must inform every UI decision.
- Deployment in under-resourced regions with intermittent network connectivity.
- Up to 2,500+ concurrent WebSocket connections per live examination event.
- Flash Anzan sequences require sub-millisecond rendering precision that `setTimeout` cannot provide.
- All answers must be durable even if the browser tab is closed, the network drops, or the device loses power.

---

## 2. Tech Stack — Exact Packages

All packages below are mandatory for V1. No substitutions without an explicit PRD amendment.

| Layer | Package / Technology | Version Constraint | Purpose |
|---|---|---|---|
| **Framework** | `next` | 15.x (App Router, RSC, Server Actions, Edge Middleware) | Full-stack framework |
| **Database / Auth** | `@supabase/supabase-js` | Latest stable | PostgreSQL, Auth, Realtime Broadcast, RPC, RLS, Storage |
| **UI Components** | `shadcn/ui` | Latest stable | Radix Primitives + Tailwind CSS component layer |
| **Styling** | `tailwindcss` | 4.x | Utility-first CSS |
| **Client State** | `zustand` | Latest stable | Global client state (UI flags only — not answer persistence) |
| **Offline Storage** | `dexie` | 4.x | IndexedDB wrapper for offline answer queue |
| **Charts** | `recharts` | Latest stable | Dashboard KPI visualizations, score donut charts |
| **Data Tables** | `@tanstack/react-table` | Latest stable | Student management, exam listing, activity logs |
| **Drag & Drop** | `@hello-pangea/dnd` | Latest stable | Level reordering with optimistic UI |
| **Rich Text** | `tiptap` (headless) | Latest stable | Announcement body editor |
| **CSV Parsing** | `papaparse` | Latest stable | Client-side CSV parsing for student import |
| **Date / Time** | `date-fns` + `date-fns-tz` | Latest stable | UTC storage + timezone-offset display |
| **HTML Sanitization** | `sanitize-html` | Latest stable | **Server-safe only** — DOMPurify is PROHIBITED (requires `window`/`document`, throws `ReferenceError` in RSC/Server Actions) |
| **Animation** | `lottie-react` | Latest stable | Abacus loader animation (`abacus-loader.json`) |
| **Icons** | `lucide-react` + `@phosphor-icons/react` | Latest stable | UI iconography |

### Supabase Services Used

| Service | Usage |
|---|---|
| PostgreSQL | Primary database, all persistent data |
| Supabase Auth | JWT-based authentication with custom claims (`role`) |
| Realtime **Broadcast** | Exam state transitions, heartbeat pings, anomaly events (**NOT** Postgres Changes — see Vulnerability §1) |
| Realtime **Presence** | Per-student live status tracking on admin monitor |
| RPC (Remote Procedure Calls) | `bulk_import_students()`, `validate_and_migrate_offline_submission()`, `calculate_results(p_paper_id)` |
| Row Level Security | All table-level authorization |
| Storage | Avatar images (optional) |

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-only; never exposed to client
```

---

## 3. V1 RBAC Roles

| Role | Scope | Capabilities |
|---|---|---|
| **Admin** | Platform-wide | Full access: all students, all assessments, all results, all settings, all logs, grade boundary configuration |
| **Teacher** | Own cohort only | View and manage assigned students; create/manage own assessments; live monitor for own sessions |
| **Student** | Own data only | View own live/upcoming assessments; take assessments; view own published results; view own profile |

**Role storage:** Custom claim `role` embedded in Supabase Auth JWT. Validated at two layers:
1. **Edge Middleware** (`middleware.ts`): JWT inspection, RBAC route protection, 403 redirect for unauthorized route access.
2. **PostgreSQL RLS policies**: Row-level enforcement on every table.

**Teacher cohort isolation:** RLS policies use `cohort_history` temporal join table (see §6), not a simple `assigned_teacher_id` foreign key, to preserve historical access after student reassignment.

---

## 4. Assessment Types (EXAM and TEST)

### 4.1 EXAM — Vertical Format

**Definition:** An assessment that visually mimics the vertical layer format of a physical abacus question paper.

**Layout:**
- Questions rendered as right-aligned tabular equations in a vertical column, using DM Mono (monospace) font.
- Faint alternating row background colors guide eye tracking horizontally across wide equation rows.
- Equation layout MUST mirror physical abacus paper column alignment — right-aligned numbers with consistent column widths per digit.

**Answer mechanism:**
- 4-option MCQ grid displayed below or beside each question.
- Student selects one option. Selection is immediately written to IndexedDB.
- No time pressure per question; the exam-level timer is the only constraint.
- **Question Navigator** is MOUNTED and available — side drawer listing all questions with completion indicators.

**Navigation:**
- Navigator drawer allows non-linear navigation between questions.
- "Next Question" button advances the sequence.
- Answered questions show completion indicator in navigator.

**Timer:** Global countdown from `session.expires_at`. Displayed persistently in header.

**Acceptance criteria for EXAM renderer:**
- ✓ Questions render as right-aligned monospace tabular equations.
- ✓ 4-option MCQ grid present on every question.
- ✓ Navigator drawer is mounted and functional.
- ✓ Every answer selection immediately writes to IndexedDB before any network call.
- ✓ No mid-exam session-expiry surprises — timer visible at all times.

---

### 4.2 TEST — Flash Anzan Format

**Definition:** An assessment where numbers are flashed at configured millisecond intervals. Student observes the sequence mentally, then selects the answer from a 4-option MCQ grid.

**TEST has three strictly ordered phases. Zero regression between phases is permitted.**

#### Phase 1 — START

- Displays assessment metadata: title, digit count, row count, flash interval in ms.
- Single large **"Begin"** button.
- All peripheral UI visible.
- **Question Navigator is MOUNTED** at this phase.

#### Phase 2 — FLASH

- **Question Navigator is UNMOUNTED** — zero peripheral UI.
- A single number fills the viewport at maximum readable scale.
- Rendered using `performance.now()` + `requestAnimationFrame()` delta-time accumulator loop (NOT `setTimeout`/`setInterval` — see Vulnerability §8–9).
- Flash interval: configurable `delay_ms` from `anzan_config`.
- Numbers generated by `src/lib/anzan/number-generator.ts` — random based on `digit_count` and `row_count` from assessment config.
- **High-speed contrast dampening:** When `delay_ms` < 300ms, text color shifts to `#334155` on `#F1F5F9` background with 30ms opacity fade to prevent visual after-image burn.
- **Negative numbers** use CIELAB equiluminance color: soft crimson `#991B1B` (not default red — maintains perceptual brightness parity). _"Changed from #FF6B6B (3.6:1, fails WCAG AA)"_
- **Visibility guard:** If `document.visibilityState === 'hidden'` during flash, `cancelAnimationFrame()` is called immediately; sequence halts; "Assessment Paused – Focus Lost" modal shown; telemetry warning broadcast to admin monitor.

#### Phase 3 — MCQ

- 4-option MCQ grid illuminates (appearing as psychological release after Phase 2 tension).
- **Question Navigator remains UNMOUNTED** in Phase 3.
- **Skip button** is available on Phase 3 only.
- Student selects one option; answer written to IndexedDB immediately.
- After selection (or Skip), advances to next question's Phase 1 START.

**Flash Anzan configuration parameters (stored as columns on `exam_papers`):**

| Parameter | Type | Description |
|---|---|---|
| `delay_ms` | integer | Flash interval per number in milliseconds |
| `digit_count` | integer | Number of digits per displayed number (e.g., 2 = two-digit numbers) |
| `row_count` | integer | How many numbers per sequence |

**Acceptance criteria for TEST renderer:**
- ✓ Phase progression is strictly START → FLASH → MCQ; no back-navigation.
- ✓ Question Navigator is unmounted during Phase 2 and Phase 3.
- ✓ Flash timing loop uses `requestAnimationFrame` + delta-time accumulator, NOT `setTimeout`.
- ✓ `visibilitychange` event halts sequence and fires admin telemetry.
- ✓ Skip button present only on Phase 3.
- ✓ Every MCQ answer written to IndexedDB before network call.
- ✓ High-speed contrast dampening active for `delay_ms` < 300ms.

---

## 5. P0 Features — Machine-Verifiable Acceptance Criteria

Every criterion below must produce a deterministic, testable result. "User can log in" is NOT an acceptable criterion.

---

### 5.1 Authentication

| # | Criterion | HTTP / Observable Outcome |
|---|---|---|
| AUTH-1 | `POST /auth` with valid `roll_number` + `dob` | Returns `HTTP 200` + JWT in response body |
| AUTH-2 | `POST /auth` with invalid credentials | Returns `HTTP 401` with body `{ "error_code": "INVALID_CREDENTIALS" }` |
| AUTH-3 | 5 failed `POST /auth` attempts within 60 seconds from same IP/user | Returns `HTTP 429` (rate limit) on the 5th attempt and beyond |
| AUTH-4 | Session with no activity for 60 minutes | JWT invalidated; subsequent authenticated request returns `HTTP 401` |
| AUTH-5 | Student provisioned via CSV accesses platform for the first time | Forced password reset flow presented before any other UI |

**Implementation notes:**
- Rate limiting enforced in Edge Middleware (`middleware.ts`) using a sliding window counter.
- Session inactivity enforced via JWT expiry; Supabase Auth configured with `session_timeout_seconds` from `institutions` table (default 3600s). No `last_active_at` column exists in `profiles`.
- `forced_password_reset` flag in `profiles` table; checked on login, blocks all non-password-reset routes.

---

### 5.2 Assessment Lifecycle

| # | Criterion | Observable Outcome |
|---|---|---|
| ASSESS-1 | Admin creates an assessment with `type = EXAM` | Record inserted into `exam_papers` with `type = 'EXAM'`, initial `status = 'DRAFT'` |
| ASSESS-2 | Admin creates an assessment with `type = TEST` | Record inserted into `exam_papers` with `type = 'TEST'`, `anzan_config` JSONB populated, `status = 'DRAFT'` |
| ASSESS-3 | Admin attempts to create any `type` other than `EXAM` or `TEST` | Request rejected with `HTTP 400`; no record inserted |
| ASSESS-4 | Assessment state transition `DRAFT → PUBLISHED → LIVE → CLOSED` | Only forward transitions allowed; `PATCH` attempting `LIVE → PUBLISHED` returns `HTTP 409` |
| ASSESS-5 | Admin triggers "Force Live" on a Published assessment | `status` immediately set to `'LIVE'`; Broadcast event fires to all student clients |
| ASSESS-6 | Student attempts to load assessment with `status != 'LIVE'` | Returns `HTTP 403`; student sees "Assessment not available" state |
| ASSESS-7 | Admin attempts `CLOSED → LIVE` transition more than 10 minutes after close | Returns `HTTP 409`; state unchanged |
| ASSESS-8 | Admin uses `forceOpenExam` within 10 minutes of closing | `status` returns to `'LIVE'`; `closed_at` set to NULL; Broadcast event `exam_reopened` fires on `exam:{paper_id}` channel; students may resume |

---

### 5.3 Offline-First

| # | Criterion | Observable Outcome |
|---|---|---|
| OFF-1 | Student selects any MCQ option | Answer written to IndexedDB **before** any network call; observable in browser DevTools > Application > IndexedDB |
| OFF-2 | Application initializes | `navigator.storage.persist()` called; `navigator.storage.estimate()` executed; both observable via browser Storage Manager API |
| OFF-3 | Device goes offline mid-exam | Student can continue selecting answers; all written to IndexedDB without errors |
| OFF-4 | Device comes back online | `POST /api/submissions/offline-sync` automatically called; IndexedDB queue flushed to server |
| OFF-5 | `POST /api/submissions/offline-sync` called with valid queued payload | Returns `HTTP 200`; records moved from `offline_submissions_staging` to `student_answers` (individual answers) and session header updated in `submissions` |
| OFF-6 | IndexedDB throws `QuotaExceededError` | LRU purge executed: oldest non-critical entries removed first; exam answer entries preserved |
| OFF-7 | Student closes browser tab during active exam | `fetch` with `keepalive: true` fires from `pagehide` / `visibilitychange` event; payload delivered to server even if process terminates |

---

### 5.4 Idempotency

| # | Criterion | Observable Outcome |
|---|---|---|
| IDEM-1 | Client generates `idempotency_key` (UUID v4) on session initialization | Key stored client-side and sent in every `submitAnswer` Server Action call |
| IDEM-2 | Two concurrent `submitAnswer` Server Action calls with identical `idempotency_key` arrive | First succeeds (`{ ok: true }`); second returns `{ ok: true }` (not error); `student_answers` table contains exactly one record for that key |
| IDEM-3 | Offline sync worker retries a previously-synced payload | Same `idempotency_key` triggers deduplicated response; score not double-counted |

**Implementation:** `UNIQUE` constraint on `student_answers.idempotency_key` column. Database-level enforcement guarantees no application-layer race condition can produce duplicates.

---

### 5.5 Live Monitor

| # | Criterion | Observable Outcome |
|---|---|---|
| MON-1 | Student connects to live exam WebSocket | Admin monitor shows student status as `"In Progress"` within 5 seconds |
| MON-2 | Student's submission is recorded (`completed_at` not null OR `sync_status = 'verified'`) | Admin monitor shows `"Submitted"` (green); this status is PERMANENT |
| MON-3 | Student's WebSocket heartbeat not received for > 25 seconds | Admin monitor transitions student to `"Disconnected"` (amber), NOT `"Submitted"` |
| MON-4 | Student's WebSocket drops AFTER submission recorded | Status remains `"Submitted"` — not overwritten by subsequent Presence leave events |
| MON-5 | Student never connected to session | Status shows `"Waiting"` |
| MON-6 | Admin monitor state machine receives Presence `leave` event for a `"Submitted"` student | State reducer ignores the event; status locked at `"Submitted"` |

**State authority hierarchy (enforced in admin state reducer):**
`Database Submission Record > REST Offline Sync Payload > Ephemeral WebSocket Presence`

---

### 5.6 Results

| # | Criterion | Observable Outcome |
|---|---|---|
| RES-1 | Admin has not set `published = true` | Student Result Hub shows assessment in "Pending" (muted) zone; result data returns `HTTP 403` |
| RES-2 | Admin sets `published = true` | Assessment moves to "Recently Published" zone; student can view score |
| RES-3 | Admin triggers "Re-evaluate" for an assessment | `calculate_results(p_paper_id)` RPC recalculates all scores and grades; `raw_score` updated; grade trigger fires |
| RES-4 | Admin modifies grade boundaries | Existing grades are NOT retroactively changed until "Re-evaluate" is triggered |
| RES-5 | Grade boundary configuration saved with overlapping ranges | Request rejected with `HTTP 400`; anti-overlap validator in `grade-boundary-validator.ts` fires |

**Grade boundaries:** Configurable per institution in `grade_boundaries` table. NO hardcoded grade labels, score thresholds, or letter grades in application code. Boundary application logic lives exclusively in the PostgreSQL trigger on `raw_score` update.

---

## 6. Database Schema

_"Database schema summary only — canonical DDL is in `11_database.md`. In case of conflict, that document takes precedence."_

All migrations in `supabase/migrations/`, executed in numerical order.

### Core Tables

#### `institutions`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
name          TEXT NOT NULL
timezone      TEXT NOT NULL  -- IANA tz string e.g. 'Asia/Kolkata'
session_timeout INT NOT NULL DEFAULT 3600  -- seconds
branding      JSONB
```

#### `profiles`
```sql
id                    UUID PRIMARY KEY REFERENCES auth.users
role                  TEXT NOT NULL CHECK (role IN ('admin','teacher','student'))
email                 TEXT UNIQUE
full_name             TEXT
avatar_url            TEXT
assigned_teacher_id   UUID REFERENCES profiles(id)
version_seq           INT NOT NULL DEFAULT 0  -- monotonic; incremented on every update
forced_password_reset BOOLEAN NOT NULL DEFAULT false
locked_at             TIMESTAMPTZ
```

#### `levels`
```sql
id                   UUID PRIMARY KEY DEFAULT gen_random_uuid()
name                 TEXT NOT NULL
sequence_order       INT NOT NULL UNIQUE
description          TEXT
minimum_days_required INT
competencies         JSONB  -- array of skill strings
deleted_at           TIMESTAMPTZ  -- soft delete; NULL = active
```

#### `students`
```sql
id              UUID PRIMARY KEY REFERENCES profiles(id)
level_id        UUID REFERENCES levels(id)
dob             DATE NOT NULL
roll_number     TEXT NOT NULL UNIQUE
status          TEXT NOT NULL CHECK (status IN ('active','inactive','suspended'))
enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now()
```

#### `exam_papers`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
type          TEXT NOT NULL CHECK (type IN ('EXAM','TEST'))
level_id      UUID REFERENCES levels(id)
title         TEXT NOT NULL
questions     JSONB NOT NULL  -- array of question objects
anzan_config  JSONB  -- {delay_ms, digit_count, row_count} — required when type='TEST'
created_by    UUID NOT NULL REFERENCES profiles(id)
status        TEXT NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','LIVE','CLOSED'))
              DEFAULT 'DRAFT'
deleted_at    TIMESTAMPTZ  -- soft delete; NULL = active
```

#### `assessment_sessions`
```sql
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
paper_id       UUID NOT NULL REFERENCES exam_papers(id)
status         TEXT NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','LIVE','CLOSED'))
               DEFAULT 'DRAFT'
scheduled_at   TIMESTAMPTZ
started_at     TIMESTAMPTZ
closed_at      TIMESTAMPTZ
cohort_config  JSONB  -- which levels/students can access
expires_at     TIMESTAMPTZ  -- session hard deadline; Flash tests get +10s padding
```
> **Critical:** `expires_at` for Flash Anzan TEST sessions includes a +10s server-side padding beyond the last flash number's calculated completion time to account for network latency and rendering overhead.

#### `assessment_session_questions` (Immutable Snapshot)
```sql
session_id     UUID NOT NULL REFERENCES assessment_sessions(id)
question_index INT NOT NULL
question_data  JSONB NOT NULL  -- deep-copied from exam_papers.questions at session init
                               -- IMMUTABLE after creation; admin edits do NOT affect active sessions
PRIMARY KEY (session_id, question_index)
```
> This snapshot architecture (Vulnerability §12) prevents admin mutations from corrupting in-flight exams.

#### `submissions`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
session_id        UUID NOT NULL REFERENCES assessment_sessions(id)
student_id        UUID NOT NULL REFERENCES profiles(id)
raw_score         INT
calculated_grade  VARCHAR  -- populated by trigger from grade_boundaries
dpm               DECIMAL  -- digits per minute performance metric
idempotency_key   UUID NOT NULL UNIQUE  -- enforces deduplication at DB level
completed_at      TIMESTAMPTZ
sync_status       TEXT NOT NULL DEFAULT 'pending'
                  CHECK (sync_status IN ('pending','synced','verified'))
submitted_at      TIMESTAMPTZ
published         BOOLEAN NOT NULL DEFAULT false
```
> `fillfactor = 80` set on this table (migration `019`) for HOT updates during grade recalculation (Vulnerability §11).
> **Note:** Individual MCQ answers are stored in `student_answers`, not here. `submissions` is the one-row-per-session header record.

#### `student_answers`
```sql
id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
session_id       UUID NOT NULL REFERENCES assessment_sessions(id)
student_id       UUID NOT NULL REFERENCES profiles(id)
question_index   INT NOT NULL
selected_option  TEXT  -- NULL = skipped
answered_at      TIMESTAMPTZ NOT NULL
idempotency_key  UUID NOT NULL UNIQUE  -- deduplication at DB level
```
> Individual MCQ answer rows. The offline sync RPC promotes records from `offline_submissions_staging` into this table (individual answers) and updates the `submissions` header record.

#### `offline_submissions_staging`
```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
student_id          UUID NOT NULL
session_id          UUID NOT NULL
payload             JSONB NOT NULL
client_timestamp    TIMESTAMPTZ
server_received_at  TIMESTAMPTZ NOT NULL DEFAULT now()
```
> RLS on this table is intentionally **permissive** — `auth.uid() = student_id`. Accepts late offline submissions even after session `CLOSED` state (Vulnerability §4). Promoted to `student_answers` (individual answers) and `submissions` (header) by a `SECURITY DEFINER` RPC.

#### `grade_boundaries`
```sql
institution_id  UUID NOT NULL REFERENCES institutions(id)
label           TEXT NOT NULL  -- e.g. 'A+', 'Merit', 'Distinction' — NOT hardcoded
min_score       INT NOT NULL
max_score       INT NOT NULL
PRIMARY KEY (institution_id, label)
```
> Trigger on `submissions.raw_score` auto-calculates `calculated_grade` by joining against this table.

#### `announcements`
```sql
id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
title            TEXT NOT NULL
body_html        TEXT NOT NULL  -- sanitized via sanitize-html server-side
target_level_id  UUID REFERENCES levels(id)  -- NULL = all levels if target_all=true
target_all       BOOLEAN NOT NULL DEFAULT false
published_at     TIMESTAMPTZ
created_by       UUID NOT NULL REFERENCES profiles(id)
```

#### `activity_logs`
```sql
id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
timestamp        TIMESTAMPTZ NOT NULL DEFAULT now()  -- UTC always
actor_id         UUID NOT NULL REFERENCES profiles(id)
role             TEXT NOT NULL
ip_address       INET
action_type      TEXT NOT NULL
target_entity_id UUID
payload          JSONB
```
> Partitioned by month for query performance. BRIN index on `timestamp`.

#### `cohort_history`
```sql
student_id  UUID NOT NULL REFERENCES profiles(id)
teacher_id  UUID NOT NULL REFERENCES profiles(id)
valid_from  TIMESTAMPTZ NOT NULL
valid_to    TIMESTAMPTZ  -- NULL = current assignment
```
> Immutable temporal join table for historical RLS (Vulnerability §15). RLS on `submissions` evaluates access based on whether `exam_papers.created_at` falls within the teacher's `valid_from`–`valid_to` window.

#### `dashboard_aggregates` (Materialized View)
- Refreshed by `pg_cron` every 300 seconds.
- Prevents heavy `COUNT()` queries from acquiring read-locks during peak exam periods.

### Performance Indexes (Migration `021`)
```sql
-- Live Monitor query optimization
CREATE INDEX ON submissions(session_id, student_id);
CREATE INDEX ON assessment_sessions(paper_id, status);

-- In-flight exam optimization
CREATE PARTIAL INDEX ON submissions(student_id)
  WHERE completed_at IS NULL;

-- Activity log range scans (BRIN for append-only partitioned table)
CREATE INDEX ON activity_logs USING BRIN(timestamp);
```

---

## 7. File Index Summary

Total files in V1 build: **196**

| Category | Count |
|---|---|
| Root configuration files | 9 |
| Library / utility files (`src/lib/`) | 31 |
| Zustand stores (`src/stores/`) | 3 |
| shadcn/ui base components | 14 |
| Composite UI components | 52 |
| API route handlers (`src/app/api/`) | 3 |
| Server Actions (`src/actions/`) | 9 |
| App Router pages and layouts | 34 |
| React hooks (`src/hooks/`) | 12 |
| Database migrations (`supabase/migrations/`) | 26 |
| Supabase scaffold files | 2 |
| Public assets | 6 |

**Key files agents must implement correctly:**

| File | Critical Notes |
|---|---|
| `src/lib/anzan/timing-engine.ts` | MUST use `requestAnimationFrame` + delta-time accumulator; NEVER `setTimeout` for flash intervals |
| `src/lib/sanitize.ts` | MUST use `sanitize-html`; NEVER `DOMPurify` (browser DOM dependency, crashes RSC) |
| `src/lib/realtime/broadcast.ts` | MUST use Broadcast, NEVER Postgres Changes for exam telemetry |
| `src/lib/realtime/connection-jitter.ts` | MUST apply `setTimeout(connect, Math.random() * 5000)` on init |
| `src/lib/anticheat/teardown.ts` | `pagehide` keepalive MUST target `/api/submissions/teardown` — NEVER `/api/submissions/offline-sync`. These are two separate Route Handlers with different validation logic. |
| `src/lib/idempotency.ts` | UUID generated client-side on session init; sent with every `submitAnswer` call |
| `middleware.ts` | JWT inspection + RBAC route guard at Edge; 403 for unauthorized role access |
| `supabase/migrations/016_create_rls_policies.sql` | All RLS policies; teacher access via `cohort_history`; offline staging permissive |
| `supabase/migrations/020_create_security_definer_functions.sql` | `validate_and_migrate_offline_submission()` MUST be SECURITY DEFINER |

---

## 8. Design System & UX Constraints

_"Section removed to prevent source-of-truth conflicts. Refer to `07_hifi-spec.md` for current design system tokens."_

---

## 9. V1 Non-Goals

The following features are explicitly out of scope for V1. AI coding agents MUST NOT build these. Any implementation of these features in V1 will be rejected.

| Feature | Reason Deferred |
|---|---|
| Student self-initiated practice | Admin-scheduled only in V1; practice mode is Phase 2 |
| PWA / Service Workers | Not V1; no offline shell caching |
| Peer leaderboards | Phase 2; legal and design review required |
| Parent-facing portal | Phase 2; requires new RBAC role and DPIA update |
| Gamified badges or streaks | Phase 2; requires custom asset procurement |
| Multi-institution support | Phase 2; requires tenant isolation architecture |
| Post-assessment review replay (Flash Anzan playback) | Phase 2; legal review of recorded sequence data in progress |
| Biometric login | Phase 2; hardware API variability across target devices |
| SSO login | Phase 2 |
| DigiLocker integration | Phase 2; legal compliance not cleared for V1 |
| Fee management / GST invoicing | Phase 3 |
| Advanced AI proctoring (gaze tracking, WebGazer.js) | Phase 3 |

---

## 10. Architectural Vulnerability and Mitigation Audit

This section documents all identified architectural vulnerabilities across the Next.js, Supabase, PostgreSQL, and IndexedDB stack, with mandatory mitigations. Agents must implement every mitigation described. This is not advisory — these are implementation requirements.

---

### Zone 1: Live Examination State and Supabase Telemetry (Synchronous)

#### Vulnerability 1 — Thundering Herd & Postgres Replication Overflow

**Subsystem:** Student Client (WebSockets) ↔ Supabase Realtime (Elixir/Phoenix) ↔ PostgreSQL (Logical Replication)

**Severity:** CRITICAL

**Trigger:** An administrator transitions a large cohort assessment to 'Live'. Up to 2,500 students attempt simultaneous WebSocket channel joins at the exact same second, followed immediately by heartbeat ping transmission. This creates an instantaneous connection barrage. Additionally, relying on the "Postgres Changes" API for high-frequency events causes WAL bloat when the replication slot falls behind.

**Root cause:** Supabase Realtime has a hard `too_many_joins` per-second channel join limit. Postgres Changes routes all events through the WAL replication slot, which cannot sustain thousands of concurrent readers.

**Mandatory Mitigation:**
1. **Migrate entirely to Supabase Realtime Broadcast** (`src/lib/realtime/broadcast.ts`) for all exam state telemetry. Broadcast routes through the in-memory Phoenix.PubSub adapter, bypassing the WAL replication slot entirely.
2. **Temporal jitter on WebSocket connect** (`src/lib/realtime/connection-jitter.ts`):
   ```typescript
   setTimeout(() => supabase.channel(channelName).subscribe(), Math.random() * 5000);
   ```
   This distributes the connection barrage evenly over a 5-second window, eliminating the thundering herd.

**Constants:** Jitter window = 5000ms (defined in `src/lib/constants.ts`).

---

#### Vulnerability 2 — Ghost Connection State Desynchronization

**Subsystem:** Supabase Realtime Presence ↔ Admin Panel Dashboard State ↔ PostgreSQL Submissions Table

**Severity:** HIGH

**Trigger:** A student's TCP connection drops silently (no FIN packet — severe packet loss). Heartbeat times out; admin monitor transitions student to "Disconnected." The student's client switches to offline mode, completes the exam, and later syncs via background REST POST.

**Root cause:** React state in the admin panel performs asymmetrical reconciliation if it overwrites student status based solely on the latest WebSocket Presence differential. A submitted student would incorrectly show as "Disconnected."

**Mandatory Mitigation:**

Implement a deterministic state machine in the admin monitor (`src/stores/exam-monitor-store.ts`) enforcing this authority hierarchy:

```
Database Submission Record > REST Offline Sync Payload > Ephemeral WebSocket Presence
```

The state reducer MUST:
1. On every Presence sync, check `submissions` table for `completed_at IS NOT NULL` OR `sync_status = 'verified'`.
2. If either condition is true, lock student status to `"Submitted"` (green) permanently.
3. Explicitly ignore all subsequent WebSocket `leave` events for that student.

---

#### Vulnerability 3 — Asynchronous Teardown & Payload Termination

**Subsystem:** Admin Panel Command ↔ Student Client (Browser Unload) ↔ PostgreSQL API

**Severity:** CRITICAL

**Trigger:** Administrator forces "Close Exam." Student simultaneously closes the browser tab. Standard `fetch` calls are aborted when the document unloads. `navigator.sendBeacon()` cannot inject `Authorization: Bearer <token>` headers required to pass Supabase RLS.

**Root cause:** Browsers terminate pending network requests on tab close. `sendBeacon` lacks custom header support. `beforeunload`/`unload` events interfere with the browser's Back-Forward Cache (bfcache).

**Mandatory Mitigation:**

Use the Page Lifecycle API with `fetch` + `keepalive: true`:

```typescript
// src/lib/anticheat/teardown.ts — teardown handler
// NEVER target offline-sync here — that endpoint validates HMAC-sealed offline payloads.
// This keepalive goes to the dedicated teardown Route Handler which upserts answers idempotently.
document.addEventListener('pagehide', (event) => {
  fetch('/api/submissions/teardown', {
    method: 'POST',
    keepalive: true,  // OS network stack fulfills even if browser terminates
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pendingPayload),
  });
});
```

The `visibilitychange` event should also trigger a sync attempt as an earlier warning. The `pagehide` event is the most reliable unload signal without breaking bfcache.

---

### Zone 2: Offline-First Architecture and Network Partitioning (Asynchronous)

#### Vulnerability 4 — The Late Submission RLS Paradox

**Subsystem:** Local IndexedDB Queue ↔ Supabase Auth ↔ PostgreSQL Row Level Security

**Severity:** HIGH

**Trigger:** Student loses network 5 minutes into a 60-minute exam. Exam timer expires locally. Student reconnects 14 hours later. Background sync attempts to POST to Supabase, but the session `status = 'Closed'`. Standard RLS policy rejects the insert with `HTTP 403`.

**Root cause:** Standard RLS on `submissions` requires `status = 'Live'`. Late offline submissions legitimately arrive after session closure.

**Mandatory Mitigation:**

1. Dedicated staging table: `offline_submissions_staging` with permissive RLS — auth context only: `auth.uid() = student_id`. This table accepts payloads regardless of session status.
2. A `SECURITY DEFINER` PostgreSQL function (`validate_and_migrate_offline_submission()`) — executing with superuser-equivalent privileges to bypass standard RLS — validates:
   - HMAC seal on the client-side payload using monotonic `performance.now()` time.
   - Completion timestamp delta against `sessions.started_at` + grace period.
3. If valid, the function moves the payload to `submissions`. If invalid, it flags for manual review.

---

#### Vulnerability 5 — Storage Volatility & IndexedDB Quota Cliffs

**Subsystem:** Browser Storage API (IndexedDB/Dexie.js) ↔ Hardware File System

**Severity:** HIGH

**Trigger:** Platform accessed on a shared Android tablet with < 1GB free disk space. Chromium's storage engine requires a minimum 1GB free space reservation. When breached, it revokes all IndexedDB write permissions immediately, throwing `QuotaExceededError`. By default, IndexedDB is "best-effort" — the browser may silently evict it under memory pressure.

**Mandatory Mitigation** (`src/lib/offline/storage-probe.ts`):

```typescript
// Called on application initialization
const estimate = await navigator.storage.estimate();
// estimate.quota and estimate.usage are now available for UI warnings

await navigator.storage.persist();
// Requests persistent storage — prevents silent browser eviction
```

In all Dexie.js transaction blocks (`src/lib/offline/indexed-db-store.ts`):
```typescript
try {
  await db.answers.put(answerRecord);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    await performLRUPurge(); // Remove oldest non-critical telemetry entries
    await db.answers.put(answerRecord); // Retry
  }
}
```

---

#### Vulnerability 6 — The Double Submission Race Condition

**Subsystem:** Client UI (Network Drop) ↔ API Layer ↔ PostgreSQL UNIQUE Constraint

**Severity:** CRITICAL

**Trigger:** Student completes exam during network instability. Multiple aggressive "Submit" clicks plus the background sync worker simultaneously POST the same payload. Naive `SELECT` then `INSERT` application-level checks fail under concurrency — both requests pass the SELECT before either commits.

**Root cause:** Application-level idempotency checks are not atomic. Concurrent requests create duplicate database entries, potentially double-counting exam attempts or corrupting scores.

**Mandatory Mitigation:**

Database-level idempotency via UNIQUE constraint:

```sql
-- Migration 008: submissions table
idempotency_key UUID NOT NULL UNIQUE
```

The UUID is generated **client-side** on session initialization (`src/lib/idempotency.ts`) and included in every submission POST. The database engine — not application code — enforces uniqueness. Concurrent duplicates trigger a constraint violation on all but the first; the API handler returns `HTTP 200` (not `4xx`) on constraint violation to prevent client retry loops.

---

#### Vulnerability 7 — Client-Side Clock Spoofing & Temporal Drift

**Subsystem:** Student Device OS Clock ↔ JavaScript Runtime ↔ Exam Timer Logic

**Severity:** CRITICAL

**Trigger:** Malicious student disables NTP and reverses system clock by 30 minutes. `Date.now()` registers the backward time leap, artificially extending exam duration to infinite.

**Mandatory Mitigation** (`src/lib/anticheat/clock-guard.ts`):

**Layer 1 — Client-side high-water mark:**
```typescript
// On every timer tick:
const highWaterMark = await db.clockState.get('high_water_mark');
if (Date.now() < highWaterMark - TOLERANCE_MS) {
  // Clock moved backward — lock exam
  lockExam('CLOCK_MANIPULATION_DETECTED');
}
await db.clockState.put('high_water_mark', Date.now());
```

**Layer 2 — Monotonic time via `performance.now()`:**
Elapsed time is cross-checked against `performance.now()` which is strictly monotonically increasing and immune to OS clock manipulation. Final payload is HMAC-sealed with this monotonic time.

**Layer 3 — Server-side validation:**
On offline sync, the server calculates:
```
delta = server_now - sessions.started_at
```
If `delta` wildly exceeds `permitted_duration + GRACE_PERIOD_MS`, the submission is flagged as temporally invalid. The PostgreSQL server clock is the absolute source of truth.

---

### Zone 3: Flash Anzan High-Precision Execution Constraints

#### Vulnerability 8 — Browser Tab Throttling via Visibility API

**Subsystem:** Browser Main Thread ↔ `requestAnimationFrame` Pipeline

**Severity:** CRITICAL

**Trigger:** During a Flash Anzan sequence, an OS notification obscures the screen or the student switches to another tab. Modern browsers throttle `requestAnimationFrame` to 0Hz and `setTimeout` to 1Hz in background tabs.

**Mandatory Mitigation** (`src/lib/anzan/visibility-guard.ts`):

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    cancelAnimationFrame(currentRafHandle);
    showPauseModal('FOCUS_LOST');
    broadcastTelemetry({ type: 'VISIBILITY_LOSS', studentId, sessionId });
  }
});
```

The delta-time accumulator MUST NOT attempt to "catch up" on lost time when the tab regains focus. Sequence resumes fresh from current position.

---

#### Vulnerability 9 — Hardware Frame Drops & Fixed-Step Coupling

**Subsystem:** Browser `requestAnimationFrame` ↔ Flash Anzan Timing Loop

**Severity:** CRITICAL

**Trigger:** Underpowered device (budget Android tablet) experiences frame drops during the Flash Anzan sequence. A fixed-step loop increments numbers based on frame count rather than elapsed real time, causing numbers to display for longer than configured on low-end hardware.

**Mandatory Mitigation** (`src/lib/anzan/timing-engine.ts`):

```typescript
// Delta-time accumulator pattern
let lastTimestamp = performance.now();
let accumulator = 0;

function loop(timestamp: number) {
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  accumulator += delta;

  while (accumulator >= targetIntervalMs) {
    advanceFlashNumber();
    accumulator -= targetIntervalMs;
  }

  if (!sequenceComplete) {
    rafHandle = requestAnimationFrame(loop);
  }
}
rafHandle = requestAnimationFrame(loop);
```

The accumulator pattern decouples flash timing from frame rate, guaranteeing each number is displayed for exactly `targetIntervalMs` of real time regardless of hardware performance.

---

### Zone 4: Background Evaluation and Database Operations (Asynchronous)

#### Vulnerability 10 — The Destructive Re-Evaluation Race Condition

**Subsystem:** Admin API Action ↔ PostgreSQL Background Workers ↔ Grading Logic

**Severity:** CRITICAL

**Trigger:** Admin triggers "Re-evaluate All" background job for 5,000 grades. Seconds later, admin clicks "Publish Selected" for a subset of those same students. Concurrent transactions targeting the same rows risk deadlock or data corruption.

**Root cause:** Session-level `pg_advisory_lock` is not transaction-scoped; a crashed worker holds the lock indefinitely until manual intervention.

**Mandatory Mitigation:**

Use `SELECT ... FOR UPDATE SKIP LOCKED` for all async worker queues:

```sql
-- In calculate_results(p_paper_id) RPC
SELECT id FROM submissions
  WHERE session_id = $1 AND sync_status = 'synced'
  FOR UPDATE SKIP LOCKED;
```

`SKIP LOCKED` is transaction-scoped: if the worker crashes, PostgreSQL automatically releases the lock. Concurrent "Publish" actions targeting locked rows safely skip them rather than blocking or deadlocking.

---

#### Vulnerability 11 — Massive Cascading Updates & MVCC Bloat

**Subsystem:** Admin Grade Boundaries ↔ PostgreSQL MVCC Engine ↔ Read/Write Queries

**Severity:** HIGH

**Trigger:** Institution-wide grade boundary change requires cascading UPDATE across 100,000 historical `submissions` records. PostgreSQL MVCC creates 100,000 dead tuples. Foreign key lock contention generates MultiXact entries, causing CPU pressure and query stalls.

**Mandatory Mitigation:**

1. **`FILLFACTOR = 80`** on `submissions` table (migration `019`):
   ```sql
   ALTER TABLE submissions SET (fillfactor = 80);
   ```
   This reserves 20% of each 8KB data page. Updates to `calculated_grade` (a non-indexed column) use PostgreSQL HOT (Heap-Only Tuple) updates, reusing space within the same physical page and bypassing index modification — dramatically reducing I/O.

2. **Micro-batching:** Grade recalculation jobs process records in chunks of 500 with inter-batch `pg_sleep(0.1)` pauses to allow the VACUUM daemon to clean dead tuples progressively.

---

### Zone 5: Curriculum Progression and Relational Integrity

#### Vulnerability 12 — Active Session Data Mutation & Assessment Integrity

**Subsystem:** Admin Dashboard (Mutations) ↔ PostgreSQL ↔ Active Student Exam Session

**Severity:** CRITICAL

**Trigger:** Admin edits exam questions (alters a question, changes time limit) while a cohort of students is actively taking that exam. If the student panel queries master `exam_papers` table directly, concurrent admin mutations corrupt evaluation metrics and break active UI state.

**Mandatory Mitigation — Snapshotting Architecture:**

At the moment a session initializes, the backend MUST deep-copy questions from `exam_papers.questions` into `assessment_session_questions` tied to the unique `session_id`. The student panel MUST query ONLY this immutable snapshot — never the master `exam_papers` table during an active session. This eliminates all read/write lock contention between student reads and admin writes.

---

#### Vulnerability 13 — In-Flight Referential Integrity & Cascading Deletions

**Subsystem:** Admin Dashboard (Drag and Drop) ↔ PostgreSQL Foreign Keys ↔ Student Submission

**Severity:** CRITICAL

**Trigger:** Admin deletes Level 4. A student is actively taking a final exam referencing Level 4 and submits 10 minutes after the delete. `ON DELETE CASCADE` obliterates all historical student exams. `ON DELETE RESTRICT` blocks the admin's action with a constraint violation.

**Mandatory Mitigation — Soft Deletion:**

```sql
-- All core curriculum entities (levels, assessments):
deleted_at TIMESTAMPTZ DEFAULT NULL
```

Admin "delete" merely sets `deleted_at = now()`. Active session submissions with the foreign key of the "deleted" level insert successfully. Application-level queries filter `WHERE deleted_at IS NULL` for active records. Historical data is never destroyed.

---

#### Vulnerability 14 — Global State Invalidation

**Subsystem:** Admin Promotion Action ↔ Supabase Realtime ↔ React Client State

**Severity:** MEDIUM

**Trigger:** Admin promotes a student to a new level. Student's cached React dashboard remains stale until a hard refresh. Emitting the full row payload via Broadcast exceeds the 3,000 KB message size limit for complex nested curriculum structures.

**Mandatory Mitigation — Version-Based Cache Invalidation:**

Every `profiles` and `levels` record has a `version_seq INT` column. When an admin updates a record, a database trigger increments `version_seq`. The Broadcast channel transmits only:

```json
{ "type": "CACHE_INVALIDATE", "entity": "profile", "id": "...", "version": 42 }
```

The React client (`src/hooks/use-version-cache.ts`) compares the broadcast version against the local cache version. If `broadcast.version > local.version`, it triggers a silent background refetch. No large payloads are transmitted.

---

### Zone 6: Authentication, CSV Imports, and Strict RLS Boundaries

#### Vulnerability 15 — RLS Visibility & Historical Access

**Subsystem:** RLS Policy Engine ↔ Supabase Auth Context ↔ Admin Teacher Assignment

**Severity:** HIGH

**Trigger:** Student transferred from Teacher A to Teacher B. Teacher A's historical analytics reports now show zero data for that student — all records vanished because standard ownership RLS (`auth.uid() = teacher_id`) evaluates dynamically.

**Mandatory Mitigation — Historical Access Mapping:**

The `cohort_history` temporal join table:
```sql
(student_id, teacher_id, valid_from, valid_to)
```

RLS USING policy on `submissions`:
```sql
CREATE POLICY "Teachers can view historical student submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cohort_history ch
      WHERE ch.teacher_id = auth.uid()
        AND ch.student_id = submissions.student_id
        AND ch.valid_from <= submissions.submitted_at
        AND (ch.valid_to IS NULL OR ch.valid_to >= submissions.submitted_at)
    )
  );
```

---

#### Vulnerability 16 — Bulk Ingestion Transaction Atomicity

**Subsystem:** Admin Panel Data Upload ↔ PostgreSQL Transactions ↔ Unique Constraints

**Severity:** CRITICAL

**Trigger:** Admin uploads a 500-row CSV. Row 499 contains a duplicate `roll_number`. Without transactional atomicity, rows 1–498 commit, row 499 fails, row 500 is dropped. Database left in partial, polluted state.

**Mandatory Mitigation:**

The `bulk_import_students()` RPC wraps the entire operation in an explicit `BEGIN ... EXCEPTION ... ROLLBACK` block:

```sql
CREATE OR REPLACE FUNCTION bulk_import_students(student_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Load all rows to temporary staging
  -- Validate constraints
  -- If any violation: ROLLBACK entire batch
  -- On success: move to production tables atomically
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Duplicate roll_number at row %. Rolling back all %s rows.',
      get_error_row(), jsonb_array_length(student_data);
END;
$$;
```

The client-side CSV processor (Papaparse) validates formatting BEFORE the RPC call. Only a clean, pre-validated JSON array is transmitted to the server. This two-step validation prevents needless RPC round-trips for obviously malformed data.

---

## 11. UX/Cognitive Vulnerability and Mitigation Audit

This section documents cognitive ergonomics vulnerabilities arising from the intersection of the Admin and Student panels. These are mandatory implementation requirements — not design suggestions. The student demographic (ages 6–18) makes cognitive load failures directly measurable through assessment score degradation.

---

### UX Vulnerability 1 — The "Live State" Cognitive Desynchronization

#### 1.1 — Abrupt DOM Swap on Force Live

**Interface Junction:** Admin "Force Live" Command ↔ Student Lobby Viewport

**Severity:** HIGH (Psychological)

**Failure:** Admin clicks "Force Live." WebSocket payload instantly unmounts the lobby and mounts the exam grid. The instantaneous, unbuffered layout shift triggers an acute startle response in the student, causing cortisol release and working memory impairment at the exact moment maximum cognitive capacity is required. The absence of soft transitions in the original design exacerbates the visual violence.

**Mandatory Mitigation:**

1. When the client receives the `'Live'` broadcast, do NOT immediately unmount the lobby.
2. Transition to a `"Match Starting"` interstitial overlay for a hard-coded **3000ms**.
3. Apply exit animation to lobby elements:
   ```css
   transform: scale(0.95);
   opacity: 0;
   transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1);
   ```
4. Trigger the 3-beat metronome audio (`metronome-beat.mp3`) at 500ms intervals during the 3000ms buffer. This auditory anchor chronologically grounds the student and allows the autonomic nervous system to regulate before the exam grid renders.

---

#### 1.2 — Heartbeat Reconnection Indicator

**Interface Junction:** Student Client Reconnection ↔ Admin Disconnected Status

**Severity:** MEDIUM

**Failure:** Student loses connection briefly. Admin monitor shows "Disconnected" (amber). Student UI shows no feedback about connectivity state, increasing test anxiety.

**Mandatory Mitigation:**
- Student UI must show a subtle, non-alarming connectivity indicator (not a modal; not a blocker).
- Heartbeat timeout: 25 seconds to transition admin to amber state.
- Student-facing reconnection feedback: 2-second threshold before displaying a minimal "Reconnecting..." status strip.
- On reconnect: strip disappears without any animation that could disrupt the student's cognitive state.

---

### UX Vulnerability 2 — Flash Anzan Visual Rendering Failures

#### 2.1 — High-Contrast Burn-In at High Speed

**Interface Junction:** Flash Anzan Renderer ↔ Student Visual Cortex

**Severity:** MEDIUM

**Failure:** At intervals < 300ms, standard black-on-white rendering causes pronounced visual after-images ("burn-in" effect) due to the high luminance contrast of white backgrounds against the dark inter-flash gap. The after-image overlaps with the subsequent number, corrupting perception.

**Mandatory Mitigation** (`src/lib/anzan/contrast-dampener.ts`):

When `delay_ms < 300`:
- Background: `#F1F5F9` (slate-100 — reduces luminance contrast at high speed)
- Text: `#334155` (slate-700 — 11:1 contrast on #F1F5F9, WCAG AAA)
- Apply 30ms opacity fade between numbers using CSS `transition: opacity 30ms ease`

This reduces the luminance delta from ~90 to ~60, eliminating after-image while maintaining legibility.

---

#### 2.2 — Negative Number Color Perceptual Inequality

**Interface Junction:** Flash Anzan Number Generator ↔ Student Color Perception

**Severity:** LOW-MEDIUM

**Failure:** Standard red (`#FF0000`) for negative numbers has significantly different perceptual luminance from standard black numbers. In high-speed sequences, the sudden luminance change for negative numbers creates a perceptual "pop" that is cognitively processed as a threat signal rather than a number, disrupting mental arithmetic.

**Mandatory Mitigation** (`src/lib/anzan/color-calibration.ts`):

Use CIELAB equiluminance calculation to select a color with the same perceptual lightness as the positive number color. The result is soft crimson `#991B1B` — visually distinct from positive numbers but perceptually equal in luminance. _"Original design specified #FF6B6B (fails WCAG AA 3.6:1). Implemented value: #991B1B (9.7:1 AAA) — see 08_a11y.md §1."_ Students process the color change as categorical information without a luminance-driven startle response.

---

#### 2.3 — Pre-Assessment Auditory Calibration

**Interface Junction:** Assessment Phase START ↔ Student Nervous System State

**Severity:** MEDIUM

**Failure:** Entering the Flash Anzan phase without a calibration cue leaves the student's temporal attention system unprimed, degrading mental arithmetic performance on the first few numbers.

**Mandatory Mitigation:**

3-beat metronome audio (`metronome-beat.mp3`) plays at 500ms intervals during the Phase 1 → Phase 2 transition. This is the same pattern used in the "Live State" transition (Vulnerability 1.1). Consistent auditory anchoring across both contexts reduces cognitive load associated with anticipating phase transitions.

---

### UX Vulnerability 3 — Mis-Tap Prevention and Motor Skill Constraints

**Interface Junction:** MCQ Answer Grid ↔ Student Touch Input (Tablet/Mobile)

**Severity:** HIGH

**Target demographic:** Children aged 6–18 have underdeveloped proprioceptive precision. Fitts' Law analysis of pediatric touch targets establishes a minimum tap target of **48×48px** for reliable selection in this age group.

**Failure:** Standard shadcn/ui button defaults produce tap targets smaller than 44px. For students on touchscreen devices, mis-taps on adjacent MCQ options occur at rates sufficient to invalidate exam results.

**Mandatory Mitigation:**
1. **Minimum touch target:** All MCQ option buttons must be at minimum `min-h-[48px] min-w-[48px]` (Tailwind utility).
2. **1200ms input cooldown** (`src/hooks/use-input-cooldown.ts`): After each question transition, apply `pointer-events: none` overlay for 1200ms to prevent mis-taps during the visual transition. This cooldown is distinct from any animation duration.
3. **No answer modification without confirmation:** Once an MCQ option is selected, it should be visually confirmed (highlighted) but should NOT advance automatically. The student must explicitly click "Next" to advance. This prevents accidental double-taps from registering a selection and skipping to the next question.

---

### UX Vulnerability 4 — Result Presentation and Psychological Safety

**Interface Junction:** Admin "Publish Results" Action ↔ Student Result Hub

**Severity:** MEDIUM

**Failure:** When results are published, no visual differentiation between published and pending results. Students who perform below expectations receive results with no psychological buffering — abrupt score revelation without positive framing damages motivation and increases anxiety for future assessments.

**Mandatory Mitigation:**
1. **Result Hub zones:** Clearly separated "Recently Published" (highlighted, with "New" pulsing badge until viewed) and "Pending" (muted, non-interactive) zones.
2. **Score presentation:** Lead with performance-positive framing. Scores ≥ 80% receive premium color treatment. Donut chart for score visualization — circular format is less confrontational than a raw percentage.
3. **Review grid semantics:** Monospace font on equation column aligns character positions for direct error identification. Green = correct; red with strikethrough = incorrect. No yellow/amber states in result review — binary feedback reduces cognitive load for error analysis.
4. **Language:** All error messages and result feedback written in plain, encouraging language. "Check your Roll Number again" not "Invalid credentials." "You got 7 out of 10" not "70%."

---

### UX Vulnerability 5 — Empty State and Onboarding Failure

**Interface Junction:** Admin Panel Empty States ↔ New Institution Onboarding

**Severity:** MEDIUM

**Failure:** When a new institution is provisioned, empty states for Levels, Students, and Assessments show blank tables with no guidance. Administrators abandon setup because the next action is not obvious.

**Mandatory Mitigation:**

Empty states are treated as critical onboarding moments, not development afterthoughts:

| Module | Empty State Illustration | CTA |
|---|---|---|
| Levels | Isometric staircase SVG (`empty-levels.svg`) | "Initialize First Level" primary button + explanatory paragraph |
| Students | Resting abacus / closed vault SVG (`empty-dashboard.svg`) | "Import Students via CSV" primary button |
| Assessments | Minimal sheet/paper illustration | "Create Your First Assessment" primary button |

---

### UX Vulnerability 6 — WCAG 2.2 Compliance in Dynamic Contexts

**Interface Junction:** Flash Anzan Timer ↔ Assistive Technologies (Screen Readers)

**Severity:** HIGH (Accessibility + Legal)

**Failure:** Flash Anzan countdown and dynamically updating number sequences, if naively implemented as updating DOM text, will be read aloud by screen readers on every update — creating an overwhelming auditory stream that defeats the assessment's purpose for visually impaired students using assistive technology.

**Mandatory Mitigation:**

1. **Flash numbers:** Use `aria-hidden="true"` on the flash number display element. Screen reader users must not receive number-by-number readout during Phase 2.
2. **Timer announcements:** Use a hidden `aria-live="assertive"` region with strategic temporal warnings ONLY:
   ```html
   <div role="alert" aria-live="assertive" class="sr-only" id="timer-announcer">
     <!-- Injected only at: "5 minutes remaining", "1 minute remaining", "30 seconds" -->
   </div>
   ```
   Do NOT update this region every second — that produces an unusable experience for screen reader users.
3. **Data tables:** All `@tanstack/react-table` instances MUST include `aria-sort` attributes on sortable column headers and `aria-describedby` on complex cells.
4. **Focus management:** After every exam phase transition, programmatic focus (`element.focus()`) MUST be called on the primary interactive element of the new phase. Students navigating by keyboard must not lose their position.

---

## 12. Acceptance Criteria Checklist

This checklist confirms all PRD requirements are documented. Agents must not begin implementation until all boxes can be verified against this document.

### Documentation completeness

| # | Requirement | Status |
|---|---|---|
| DC-1 | Tech stack with exact packages documented | ✓ Section 2 |
| DC-2 | All P0 features have machine-verifiable criteria | ✓ Section 5 |
| DC-3 | Non-goals explicitly listed | ✓ Section 9 |
| DC-4 | EXAM assessment type precisely specified | ✓ Section 4.1 |
| DC-5 | TEST (Flash Anzan) assessment type precisely specified with all 3 phases | ✓ Section 4.2 |
| DC-6 | Idempotency requirement documented with database-level enforcement | ✓ Sections 5.4, 10.V6 |
| DC-7 | Offline-first criteria are machine-verifiable | ✓ Section 5.3 |
| DC-8 | Grade boundaries configurable — not hardcoded | ✓ Section 5.6, 6 |
| DC-9 | Zero vague acceptance criteria | ✓ All criteria in Section 5 are testable |
| DC-10 | No V2 features included in V1 requirements | ✓ Section 9 |
| DC-11 | Architectural Vulnerability Audit included (16 vulnerabilities) | ✓ Section 10 |
| DC-12 | UX/Cognitive Vulnerability Audit included | ✓ Section 11 |
| DC-13 | RBAC roles documented with enforcement mechanism | ✓ Section 3 |
| DC-14 | Database schema documented with migration order | ✓ Section 6 |
| DC-15 | DOMPurify prohibition documented | ✓ Sections 2, 7 |
| DC-16 | Postgres Changes prohibition documented | ✓ Sections 2, 10.V1 |
| DC-17 | `setTimeout` prohibition for Flash Anzan documented | ✓ Sections 4.2, 10.V8-V9 |
| DC-18 | Soft deletion mandate documented | ✓ Section 10.V13 |
| DC-19 | Lottie animation asset (`abacus-loader.json`) referenced | ✓ Section 2 |
| DC-20 | Audio assets referenced with trigger conditions | ✓ Section 8 |

---

*MINDSPARK V1 PRD — Version 1.0 — Single Institution Production Build*  
*This document is the source of truth for V1 scope. All deviations require a PRD amendment with explicit stakeholder sign-off.*
