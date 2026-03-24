# MINDSPARK V1 — System Architecture Document

> **Document type:** System Architecture — Technical Planning  
> **Version:** 1.0  
> **Output path:** `docs/architecture.md`  
> **Read first:** `docs/prd.md` · `docs/fsd.md`  
> **Author role:** Principal Systems Architect — Next.js · Supabase · distributed systems · high-concurrency EdTech

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Component Boundaries](#2-component-boundaries)
3. [Supabase Realtime Topology](#3-supabase-realtime-topology)
4. [Offline-First Data Flow](#4-offline-first-data-flow)
5. [Six Vulnerability Zones](#5-six-vulnerability-zones)
6. [Infrastructure Diagram](#6-infrastructure-diagram)
7. [Database Architecture](#7-database-architecture)
8. [Security Architecture](#8-security-architecture)

---

## 1. System Overview

MINDSPARK is a **single-institution EdTech assessment platform** built on a Next.js 15 App Router frontend with Supabase as the unified backend. The architecture is optimised for:

1. **High-concurrency exam delivery** — single institution, up to 2,500 students in simultaneous assessment
2. **Offline resilience** — answers persist locally on device loss of connectivity; no answer loss
3. **Frame-accurate timing** — Flash Anzan engine requires hardware-refresh-rate timing precision
4. **Row-level security** — all data access enforced by PostgreSQL RLS; client trust model is zero-trust

### Technology Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 15 App Router | RSC for server-side data · Edge Middleware for auth |
| Database | Supabase PostgreSQL | RLS · RPC · Realtime · Auth in one managed service |
| Realtime | Supabase Broadcast | No WAL overhead (see Zone 1) |
| Client state | Zustand | UI flags only — never user data |
| Offline queue | Dexie.js (IndexedDB) | Structured, typed, queryable offline store |
| Timing | `requestAnimationFrame` | Frame-accurate; immune to main-thread jitter |
| Teardown | Fetch `keepalive: true` | Only reliable mechanism for `pagehide` HTTP calls |

---

## 2. Component Boundaries

### Guiding Principle

Next.js App Router defaults all components to **Server Components**. Components only become Client Components (`"use client"`) when they require browser-only APIs: WebSocket subscriptions, `requestAnimationFrame`, user interaction state, or browser storage.

```
src/app/
  (admin)/                ← Server Components (default)
    dashboard/page.tsx    ← RSC: fetches KPI data server-side
    students/page.tsx     ← RSC: fetches paginated student list
    monitor/[id]/page.tsx ← RSC shell → passes data to <LiveMonitorWidget>

  (student)/              ← Server Components (default)
    dashboard/page.tsx    ← RSC: checks for live exam via server client
    assessment/[id]/
      page.tsx            ← RSC shell: validates session, fetches snapshot
                             passes snapshot to <ExamEngine> as prop

  api/
    submissions/
      teardown/route.ts   ← Route Handler (keepalive, POST)
      offline-sync/route.ts ← Route Handler (offline queue flush, POST)
```

### Server Components (No `"use client"`)

These components run only on the server — never shipped to the browser bundle:

| Component | Data source | Notes |
|-----------|------------|-------|
| All `page.tsx` files | Supabase server client | RSC fetch, cached at build or per-request |
| Admin data tables | Supabase server client | `@tanstack/react-table` used server-side |
| Student Dashboard shell | Supabase server client | Determines live exam presence |
| Assessment page shell | Supabase server client | Fetches `assessment_session_questions` snapshot |
| Layout components | — | Sidebar structure, header shell |
| Result Detail | Supabase server client | Score, grade, answer review |

### Client Components (`"use client"` — explicit allowlist)

Only these components carry the `"use client"` directive. Adding to this list requires explicit justification in code review.

| Component | File | Reason for client |
|-----------|------|-------------------|
| `<LiveMonitorWidget>` | `components/monitor/live-monitor-dashboard.tsx` | Supabase Broadcast subscription |
| `<ExamEngine>` | `components/assessment-engine/exam-engine.tsx` | RAF loop, Dexie writes, state machine |
| `<ExamTimer>` | `components/assessment-engine/exam-timer.tsx` | Countdown interval (read-only, no WebSocket) |
| `<MCQGrid>` | `components/assessment-engine/mcq-grid.tsx` | User interaction, answer selection |
| `<FlashNumber>` | `components/assessment-engine/flash-number.tsx` | Direct DOM writes, RAF |
| `<OfflineStatusIndicator>` | `components/assessment-engine/offline-status.tsx` | `navigator.onLine`, Dexie status |
| `<NetworkBanner>` | `components/assessment-engine/network-banner.tsx` | `navigator.onLine` event listener |
| `<QuestionNavigator>` | `components/assessment-engine/question-navigator.tsx` | Click handlers, active-state tracking |
| `<SRAnnouncerRef>` | `components/a11y/sr-announcer.tsx` | `useImperativeHandle`, DOM ref |
| `<AuthStore>` | `stores/auth-store.ts` | Zustand — UI flags only |

### Route Handlers (Not Server Actions)

Two operations require Route Handlers because Server Actions cannot serve as stable URL targets for browser-level HTTP calls:

| Route | Method | Purpose | Why not Server Action |
|-------|--------|---------|----------------------|
| `/api/submissions/teardown` | POST | Final answer flush on page unload | `pagehide` + `keepalive: true` needs stable URL |
| `/api/submissions/offline-sync` | POST | Bulk offline answer reconciliation | Called by Dexie sync worker, not form submission |

---

## 3. Supabase Realtime Topology

### Channel Architecture

```
Supabase Realtime Server
        │
        ├── Channel: exam:{assessment_id}
        │     Participants: all students in this assessment + admin monitor
        │     Mode: Broadcast (NOT Postgres Changes)
        │     Events: exam telemetry (heartbeat, answer_saved, focus_lost, submitted)
        │             AND admin lifecycle commands (exam_live, early_start, exam_closed)
        │
        ├── Channel: monitor:{assessment_id}
        │     Participants: admin/teacher monitoring this assessment
        │     Mode: Broadcast (receive-only for teacher)
        │
        └── Channel: lobby:{assessment_id}
              Participants: students in LOBBY state
              Mode: Presence ONLY (tracks who is in the lobby — join/leave counts)
              NOTE: admin lifecycle events (exam_live etc.) go on exam: channel above
```

### Broadcast Events Reference

#### Channel: `exam:{assessment_id}` — student telemetry + admin lifecycle commands

| Event | Payload | Direction | Frequency |
|-------|---------|-----------|-----------|
| `heartbeat` | `{ student_id, timestamp, question_index }` | Student → Server → Admin | Max 1 per 5s |
| `answer_saved` | `{ student_id, question_id }` | Student → Server → Admin | Per answer |
| `status_change` | `{ student_id, status, timestamp }` | Student → Server → Admin | On status change |
| `focus_lost` | `{ student_id, question_index, duration_ms }` | Student → Server → Admin | On visibility hidden |
| `submitted` | `{ student_id, total_questions, completed_at }` | Student → Server → Admin | Once, final |
| `exam_live` | `{ assessment_id, opened_at }` | Admin → All students | Triggers lobby entry |
| `early_start` | `{ assessment_id }` | Admin → All students | Unlocks "I'm Ready" early |
| `exam_closed` | `{ assessment_id, closed_at }` | Admin → All students | Redirects to dashboard |

> **Channel alignment note:** Students subscribe to `exam:{assessment_id}` from IDLE state onwards.
> All admin-to-student commands use this same channel so students never miss lifecycle events.
> `lobby:{assessment_id}` is Presence-only — use it for counting/tracking lobby occupants, not commands.

### Connection Health Protocol

```
Connect:      setTimeout(subscribe, Math.random() * 5000)  ← jitter
Heartbeat:    student sends ping every 5s
Timeout:      no heartbeat received in 25s → mark student as Disconnected (amber)
Reconnect:    exponential backoff starting at 1s, max 30s
Cleanup:      supabase.removeChannel() on EVERY useEffect unmount
```

### Why Broadcast, Not Postgres Changes

```
Postgres Changes architecture:
  DB write → WAL entry → WAL replication slot → decoded event → WebSocket push

Problems at scale:
  1. WAL replication slots: each Supabase project has a limited slot count
  2. WAL throughput: 2500 students × ~5 events/min = 12,500 WAL events/min
     This saturates the WAL replication slot and causes lag > 5s per event
  3. WAL overflow: if consumer falls behind, the WAL slot accumulates
     unbounded log data → disk exhaustion → DB crash

Broadcast architecture:
  Client SDK → Supabase Realtime Server (stateless pubsub) → all subscribers
  Zero WAL involvement. Infinite horizontal scale.
  Latency: <100ms vs Postgres Changes 200–800ms.

RULE: Postgres Changes permitted ONLY for:
  - Admin panel list refreshes (low frequency, non-exam context)
  - Level / announcement updates
  NEVER for any exam-session data
```

---

## 4. Offline-First Data Flow

The system treats offline connectivity as a **normal operating condition**, not an error state. No answer is ever lost due to network failure.

### Step-by-Step Data Flow (Single Answer)

```
Step 1: Student selects MCQ option
  └─ UI: option border highlights yellow + "Confirm →" appears

Step 2: Student taps "Confirm →"
  └─ generateIdempotencyKey(sessionId, questionId, Date.now())
  └─ Answer object: { question_id, option_id, answered_at, idempotency_key }

Step 3: Write to IndexedDB (Dexie.js) — SYNCHRONOUS, BLOCKING
  └─ dexie.answers.put({ ...answer, synced: false })
  └─ Only after this write succeeds → advance to QUESTION_COOLDOWN
  └─ If IndexedDB write fails → QuotaExceededError handler fires (see Zone 5)

Step 4: Update React state optimistically
  └─ Mark question as answered in exam-session-store
  └─ Question Navigator updates: current → answered (green tick)

Step 5: Enqueue for background sync
  └─ SyncQueue.enqueue(answer) — in-memory queue, processed async

Step 6: Background sync attempt (non-blocking)
  └─ Check navigator.onLine
  └─ If ONLINE:  Call `submitAnswer` Server Action (single answer — online path)
  └─ If OFFLINE: remain in Dexie, no network call

Step 7: Route Handler — /api/submissions/offline-sync
  └─ Validate JWT (Authorization header)
  └─ Validate idempotency_key format (UUID v4/v5)
  └─ UPSERT to offline_submissions_staging
       (permissive RLS allows this INSERT always — late submissions accepted)
  └─ Trigger Security Definer RPC

Step 8: Security Definer RPC
  └─ Validate HMAC-SHA256 timestamp (server secret)
  └─ Check: answered_at ≤ assessment_session.completed_at + grace_period
  └─ UPSERT to submissions (main table)
       ON CONFLICT (idempotency_key) DO NOTHING  ← deduplication
  └─ Return { migrated: string[], rejected: string[] }

Step 9: Client receives response
  └─ Mark Dexie records synced = true for migrated IDs
  └─ Log rejected IDs (timestamp manipulation detected)
```

### Reconnect Flush Algorithm

```typescript
// src/lib/sync-manager.ts

async function flushOnReconnect(sessionId: string): Promise<void> {
  const pending = await dexie.answers
    .where({ session_id: sessionId, synced: false })
    .toArray();

  if (pending.length === 0) return;

  // Batch: max 50 answers per POST (avoids 64KB keepalive limit)
  const batches = chunk(pending, 50);

  for (const batch of batches) {
    const response = await fetch('/api/submissions/offline-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
        answers: batch,
        hmac_timestamp: generateHMAC(sessionId, Date.now()),
      }),
    });

    if (response.ok) {
      const { synced } = await response.json();
      await dexie.answers
        .where('idempotency_key')
        .anyOf(synced)
        .modify({ synced: true });
    }
    // On failure: leave synced = false, retry on next reconnect
  }
}

// Listen for reconnect
window.addEventListener('online', () => flushOnReconnect(currentSessionId));
```

---

## 5. Six Vulnerability Zones

### Zone 1: WAL Replication Slot Overflow ⚠️ HIGH

**Risk description:**  
Supabase Realtime's Postgres Changes feature uses WAL (Write-Ahead Log) replication slots. Each database write by 2,500+ concurrent students creates a WAL entry. The replication slot consumer (Realtime server) must process these entries faster than they are produced. At 2,500 students × 5 writes/min = 12,500 WAL entries/min, consumer lag grows unbounded, eventually exhausting disk and crashing the database.

**Impact:** Full platform outage during peak exam period. All in-progress exam data at risk.

**Mitigation:**

| Action | Implementation |
|--------|---------------|
| Exam telemetry via Broadcast | All `heartbeat`, `answer_saved`, `status_change` events use `channel.send()` — zero WAL involvement |
| Postgres Changes scope | Permitted ONLY for admin-facing non-exam data (level lists, announcements) at low frequency |
| Lint rule | ESLint custom rule: `no-postgres-changes-in-exam-context` — fails CI if `.on('postgres_changes')` appears in `/assessment/` files |
| Architecture review gate | PR to exam engine files requires explicit sign-off from tech lead |

```typescript
// ❌ BANNED in exam context
channel.on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, handler);

// ✅ REQUIRED pattern
channel.on('broadcast', { event: 'answer_saved' }, handler);
```

---

### Zone 2: Thundering Herd at Exam Start ⚠️ HIGH

**Risk description:**  
When admin triggers `LIVE` status, the `exam_live` Broadcast event pushes to all students simultaneously. Without mitigation, all 2,500 students' WebSocket subscription calls fire within milliseconds — creating a thundering herd that overwhelms the Supabase Realtime connection pool.

**Impact:** Connection pool exhaustion → partial connectivity failures for students → some students cannot join exam, creating inequitable conditions.

**Mitigation 1: Jitter Connect**

```typescript
// src/hooks/use-exam-channel.ts
const jitterMs = Math.random() * 5000; // 0 to 5000ms random
setTimeout(() => {
  channel.subscribe();
}, jitterMs);
// Result: 2500 connections spread over 5s → ~500 connects/s (manageable)
```

**Mitigation 2: Heartbeat Rate Limiting**

```typescript
// Maximum 1 broadcast event per 5 seconds per student
const HEARTBEAT_INTERVAL_MS = 5_000;
let lastSent = 0;

function throttledBroadcast(event: object): void {
  const now = Date.now();
  if (now - lastSent < HEARTBEAT_INTERVAL_MS) return;
  lastSent = now;
  channel.send(event);
}
// Result: 2500 students × 1 event/5s = 500 events/s (vs. 12,500/s without throttle)
```

**Mitigation 3: Presence Debounce**  
Lobby Presence updates debounced at 2s — multiple join events within the window are collapsed to one.

---

### Zone 3: Offline Payload Tampering ⚠️ HIGH

**Risk description:**  
`offline_submissions_staging` has permissive RLS to accept late offline submissions even after `assessment_session.completed_at`. A malicious student could craft POST requests with fabricated answers (higher scores, correct options for questions they didn't answer) and send them after viewing the answer key.

**Impact:** Score manipulation, academic integrity violation.

**Mitigation: HMAC Clock Guard + Security Definer RPC**

```typescript
// Client: HMAC generated at submission time (not later)
// src/lib/hmac-guard.ts

const HMAC_SECRET = process.env.OFFLINE_SYNC_SECRET!; // server-only — distinct from HMAC_SECRET (clock guard)

export function generateHMAC(sessionId: string, timestampMs: number): string {
  const message = `${sessionId}:${timestampMs}`;
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(message)
    .digest('hex');
}

export function validateHMAC(
  sessionId: string,
  timestampMs: number,
  providedHmac: string,
  gracePeriodMs = 86_400_000 // 24 hours
): boolean {
  // 1. Recompute expected HMAC
  const expected = generateHMAC(sessionId, timestampMs);

  // 2. Constant-time comparison (prevent timing attacks)
  const match = crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(providedHmac, 'hex')
  );

  // 3. Timestamp freshness check (replay prevention)
  const age = Date.now() - timestampMs;
  const fresh = age >= 0 && age <= gracePeriodMs;

  return match && fresh;
}
```

**Security Definer RPC (`supabase/migrations/`):**
```sql
-- Runs as SECURITY DEFINER (postgres role) — bypasses RLS but validates HMAC
CREATE OR REPLACE FUNCTION migrate_staging_to_submissions(
  p_session_id UUID,
  p_hmac_timestamp TEXT,
  p_client_timestamp BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expected_hmac TEXT;
  v_session_end   TIMESTAMPTZ;
  v_grace_period  INTERVAL := INTERVAL '24 hours';
BEGIN
  -- 1. Validate HMAC (server computes expected, compares with provided)
  v_expected_hmac := encode(
    hmac(p_session_id::TEXT || ':' || p_client_timestamp::TEXT,
         current_setting('app.offline_sync_secret'), 'sha256'),
    'hex'
  );
  IF v_expected_hmac <> p_hmac_timestamp THEN
    RETURN jsonb_build_object('error', 'HMAC_INVALID');
  END IF;

  -- 2. Validate timestamp freshness
  IF to_timestamp(p_client_timestamp / 1000.0) < NOW() - v_grace_period THEN
    RETURN jsonb_build_object('error', 'TIMESTAMP_EXPIRED');
  END IF;

  -- 3. Migrate from staging with idempotency — target student_answers, NOT submissions
  -- submissions is the per-session header row; student_answers holds individual MCQ answers
  INSERT INTO student_answers (
    submission_id, question_id, idempotency_key, selected_option, answered_at
  )
  SELECT
    s.id, oss.question_id, oss.idempotency_key, oss.selected_option, oss.answered_at
  FROM offline_submissions_staging oss
  JOIN submissions s ON s.session_id = oss.session_id
  WHERE oss.session_id = p_session_id
    AND oss.migrated_at IS NULL
  ON CONFLICT (idempotency_key) DO NOTHING;

  -- 4. Mark migrated
  UPDATE offline_submissions_staging
  SET migrated_at = NOW()
  WHERE session_id = p_session_id AND migrated_at IS NULL;

  RETURN jsonb_build_object('ok', true);
END;
$$;
```

---

### Zone 4: Ghost Connection (Submitted Student Appears Active) ⚠️ MEDIUM

**Risk description:**  
Network timing means a WebSocket `leave` event from a just-submitted student may arrive at the admin monitor after their `completed_at` is written to the DB. Without mitigation, the admin monitor would revert the student's status from `Submitted` (green) to `Disconnected` (amber) — causing false alerts and potentially triggering admin intervention for a student who has already finished.

**Impact:** Unnecessary admin stress · false integrity flags · admin wastes time on non-issues mid-exam.

**Mitigation: DB-Authority Check in Live Monitor Reducer**

```typescript
// src/components/monitor/live-monitor-dashboard.tsx

type StudentRow = {
  student_id: string;
  status: 'waiting' | 'in_progress' | 'submitted' | 'disconnected';
  completed_at: string | null;  // ISO timestamp | null
  sync_status: 'pending' | 'verified' | null;
};

function monitorReducer(
  state: Map<string, StudentRow>,
  action: MonitorAction
): Map<string, StudentRow> {
  switch (action.type) {
    case 'PRESENCE_LEAVE': {
      const row = state.get(action.student_id);
      if (!row) return state;

      // GHOST CONNECTION FIX:
      // Check DB authority before processing WebSocket leave
      const isSubmitted =
        row.completed_at !== null ||
        row.sync_status === 'verified';

      if (isSubmitted) {
        // DB says submitted — ignore WebSocket leave entirely
        // Row is PERMANENT green — no state change
        return state;
      }

      // Genuine disconnect — no confirmed submission
      return new Map(state).set(action.student_id, {
        ...row,
        status: 'disconnected',
      });
    }

    case 'DB_SUBMITTED': {
      // DB submission confirmed — override everything, permanent
      const row = state.get(action.student_id);
      return new Map(state).set(action.student_id, {
        ...row!,
        status: 'submitted',
        completed_at: action.completed_at,
        sync_status: 'verified',
      });
    }

    default:
      return state;
  }
}
```

**Permanence rule:** A row that reaches `status: 'submitted'` can never transition to any other status for the remainder of the session.

---

### Zone 5: IndexedDB Quota Exhaustion ⚠️ MEDIUM

**Risk description:**  
Low-end devices (Chromebooks, budget Android tablets) with limited free storage can exhaust the IndexedDB quota mid-exam. A `QuotaExceededError` thrown by Dexie.js without a handler would silently drop answers — the student continues the exam believing answers are saved.

**Impact:** Silent data loss — student believes exam is progressing but answers are discarded.

**Mitigation: Persist + LRU Purge**

```typescript
// src/lib/dexie-client.ts

const db = new Dexie('mindspark_exam');

export async function initExamStorage(sessionId: string): Promise<void> {
  // 1. Request persistent storage — prevents browser eviction under pressure
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const persisted = await navigator.storage.persist();
    if (!persisted) {
      // Log: persistent storage denied — elevated quota risk
      notifyMonitor('storage_persistence_denied', { studentId: session.studentId });
    }
  }

  // 2. Check available quota before starting exam
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    const freeBytes = (quota ?? 0) - (usage ?? 0);
    const MIN_REQUIRED_BYTES = 5 * 1024 * 1024; // 5MB minimum

    if (freeBytes < MIN_REQUIRED_BYTES) {
      // Trigger LRU purge of old sessions before exam starts
      await purgeOldSessions(sessionId);
    }
  }
}

async function purgeOldSessions(currentSessionId: string): Promise<void> {
  // LRU: delete oldest sessions first, keeping current
  const sessions = await db.sessions
    .where('id').notEqual(currentSessionId)
    .sortBy('last_accessed');

  for (const session of sessions) {
    await db.answers.where({ session_id: session.id }).delete();
    await db.sessions.delete(session.id);

    const { usage, quota } = await navigator.storage.estimate();
    const freeBytes = (quota ?? 0) - (usage ?? 0);
    if (freeBytes >= 5 * 1024 * 1024) break; // sufficient space — stop purging
  }
}

// QuotaExceededError handler — fires on every Dexie write
async function safeWrite(answer: AnswerPayload): Promise<void> {
  try {
    await db.answers.put(answer);
  } catch (e) {
    if ((e as Error).name === 'QuotaExceededError') {
      await purgeOldSessions(answer.session_id);
      await db.answers.put(answer); // retry after purge

      // Alert: notify admin monitor of storage pressure
      examChannel.send({
        type: 'broadcast',
        event: 'storage_warning',
        payload: { student_id: answer.student_id },
      });
    } else {
      throw e;
    }
  }
}
```

---

### Zone 6: Clock Manipulation (Student Extends Exam Time) ⚠️ MEDIUM

**Risk description:**  
A student could advance their system clock forward to expire the exam timer early, then reset it to the correct time — extending the effective time-on-task by as many minutes as desired. The client-side timer (`performance.now()` relative) is immune, but `answered_at` timestamps in submitted answers would be inconsistent, potentially undetectable.

**Impact:** Academic integrity — student gains extra time on timed assessment.

**Mitigation: HMAC Clock Guard using `performance.now()` + Server Validation**

```typescript
// src/lib/hmac-guard.ts — monotonic clock binding

interface ClockSnapshot {
  monotonic_ms: number;    // performance.now() — immune to clock manipulation
  wall_clock_ms: number;   // Date.now() — can be manipulated
  session_start_monotonic: number; // reference point from session init
}

export function captureClockSnapshot(
  sessionStartMonotonic: number
): ClockSnapshot {
  return {
    monotonic_ms: performance.now(),
    wall_clock_ms: Date.now(),
    session_start_monotonic: sessionStartMonotonic,
  };
}

export function detectClockManipulation(snapshot: ClockSnapshot): boolean {
  // Elapsed by monotonic clock (reliable)
  const monotonicElapsed = snapshot.monotonic_ms - snapshot.session_start_monotonic;

  // Elapsed by wall clock (potentially manipulated)
  const wallElapsed = snapshot.wall_clock_ms - sessionStartWallMs;

  // If wall clock and monotonic diverge by > 10 seconds → manipulation detected
  const divergenceMs = Math.abs(monotonicElapsed - wallElapsed);
  return divergenceMs > 10_000;
}
```

**Server-side validation (in `/api/submissions` Route Handler):**
```typescript
// Validate that answered_at is within plausible session bounds
function validateSubmissionTimestamp(
  answeredAt: number,          // client timestamp
  sessionStartedAt: string,    // DB: assessment_sessions.started_at  (NOT created_at)
  sessionMaxDuration: number   // DB: exam_papers.duration_minutes × 60000  (NOT assessments)
): boolean {
  const sessionStart = new Date(sessionStartedAt).getTime();
  const sessionEnd = sessionStart + sessionMaxDuration + GRACE_PERIOD_MS;
  return answeredAt >= sessionStart && answeredAt <= sessionEnd;
}
```

**Cryptographic completion seal:**
```sql
-- On session completion, server seals the timestamp (not trusting client)
UPDATE assessment_sessions
SET
  completed_at = NOW(),                      -- server timestamp, not client
  completion_seal = encode(
    hmac(id::TEXT || NOW()::TEXT, current_setting('app.seal_secret'), 'sha256'),
    'hex'
  )
WHERE id = p_session_id;
```

---

## 6. Infrastructure Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Student)                            │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │
│  │  Next.js RSC   │  │  Client Comp.  │  │  Dexie.js (IndexedDB)  │ │
│  │  Shell Pages   │  │  Exam Engine   │  │  Offline answer queue  │ │
│  │  (Server HTML) │  │  RAF Loop      │  │  Session snapshots     │ │
│  └───────┬────────┘  └──────┬─────────┘  └──────────┬─────────────┘ │
│          │                  │                        │               │
└──────────┼──────────────────┼────────────────────────┼───────────────┘
           │ HTTP/2           │ WebSocket               │ On reconnect
           │ (RSC payload)    │ (Supabase Broadcast)    │ HTTP POST
           ▼                  ▼                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS EDGE (Vercel)                           │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ Edge Middleware  │  │           Route Handlers                 │  │
│  │ middleware.ts    │  │  /api/submissions/teardown  (keepalive)  │  │
│  │ Auth gating      │  │  /api/submissions/offline-sync (flush)   │  │
│  │ Role redirects   │  └───────────────────────────────────────  │  │
│  │ JWT refresh      │                                              │  │
│  └─────────────────┘  ┌──────────────────────────────────────────┐  │
│                        │         Server Actions                   │  │
│                        │  submitAnswer · submitExam              │  │
│                        │  publishResult · forceCloseExam         │  │
│                        │  importStudentsCSV · createAssessment   │  │
│                        └──────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTPS + WSS
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                   │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │
│  │   PostgreSQL    │  │   Realtime      │  │   Auth               │ │
│  │   RLS on all    │  │   Broadcast     │  │   JWT + custom       │ │
│  │   tables        │  │   (zero WAL)    │  │   claims (role)      │ │
│  │   RPC functions │  │                 │  │                      │ │
│  │   26 migrations │  │   NO Postgres   │  │   JWT refresh        │ │
│  │                 │  │   Changes for   │  │   token rotation     │ │
│  │   Materialized  │  │   exam data     │  │                      │ │
│  │   view: 300s    │  └─────────────────┘  └──────────────────────┘ │
│  └─────────────────┘                                                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 7. Database Architecture

### Table Dependency Order (migration sequence)

> **Canonical sequence — 26 migrations. Run strictly in order. Never skip.**
> Matches 11_database.md §16. Table names corrected from old draft names.

```
001: institutions
002: profiles (FK → institutions)
003: levels (FK → institutions)
004: cohorts (FK → institutions, levels)
005: students (FK → profiles, levels, cohorts)
006: teachers (FK → institutions)
007: cohort_history (FK → students, profiles[teacher], cohorts)
008: exam_papers (FK → levels, institutions)            ← canonical name (not "assessments")
009: questions (FK → exam_papers)                       ← canonical name (not "assessment_questions")
     anzan config stored as columns on exam_papers      ← no separate anzan_configs table
010: grade_boundaries (FK → institutions)
011: assessment_sessions (FK → exam_papers, students)
     ← session_id UNIQUE · fillfactor=80 for HOT updates
012: assessment_session_questions (FK → assessment_sessions, questions)
     ← IMMUTABLE SNAPSHOT — never modified after creation
013: submissions (FK → exam_papers, students)
     ← idempotency_key UNIQUE · fillfactor=80 for HOT updates
014: student_answers (FK → submissions, questions)
     ← idempotency_key UNIQUE per answer
015: offline_submissions_staging (permissive RLS)
016: activity_logs (FK → profiles)
017: announcements (FK → institutions, levels)
018: announcement_reads (FK → announcements, students)
019: RLS policies (all tables)
020: Security Definer RPC functions (validate_and_migrate_offline_submission etc.)
021: Performance indexes + fillfactor settings
022: Triggers (cohort_history close trigger · updated_at triggers)
023: Supabase Realtime Broadcast channel access policies
024: Seed default grade boundaries
025: ALTER TABLE students ADD consent_verified
026: ALTER TABLE submissions/activity_logs ADD deletion_scheduled_at
```

### Key Constraints

| Constraint | Table | Type | Purpose |
|-----------|-------|------|---------|
| `idempotency_key UNIQUE` | `submissions` | Unique index | Deduplication |
| `fillfactor=80` | `submissions` | Storage param | HOT updates — avoids full page rewrites |
| `deleted_at` | `levels`, `students` | Soft delete | Historical cohort data preserved |
| Immutable rows | `assessment_session_questions` | Never UPDATE after INSERT | Student always reads snapshot, never live assessment |
| `completed_at` | `assessment_sessions` | Timestamp | Ground truth for submission — server-set only |

### RLS Policy Summary

| Table | Student policy | Teacher policy | Admin policy |
|-------|---------------|----------------|--------------|
| `submissions` | Own session only | cohort_history temporal join | All |
| `assessment_sessions` | Own only | cohort_history | All |
| `students` | Own profile | Own cohort | All |
| `offline_submissions_staging` | Permissive INSERT | — | All |
| `activity_logs` | No access | No access | All |

---

## 8. Security Architecture

### Supabase Client Types

| Client | File | Auth context | Used for |
|--------|------|-------------|---------|
| Browser | `src/lib/supabase/client.ts` | Student/teacher session JWT | Client components |
| Server | `lib/supabase/server.ts` | Caller's session JWT (cookies) | RSC, Server Actions |
| Middleware | `lib/supabase/middleware.ts` | Cookie-based JWT refresh | `middleware.ts` only |
| Service Role | `lib/supabase/admin.ts` | Service role key | Server-only ops (never client) |

> `admin.ts` (service-role client) must never be imported from any `"use client"` component. Lint rule enforced.

### JWT Custom Claims

```json
{
  "sub": "user-uuid",
  "role": "authenticated",    // ← always "authenticated" (PostgREST DB role)
  "aud": "authenticated",
  "exp": 1710000000,
  "app_metadata": {
    "role": "admin",          // ← "admin" | "teacher" | "student" — app role lives HERE
    "forced_password_reset": false,
    "institution_id": "inst-uuid"
  }
}
```

Role is extracted from `app_metadata` at every request:
- Edge Middleware: `session?.user?.app_metadata?.role` for path-level protection
- Server Actions: `supabase.auth.getUser()` → `user.app_metadata.role`
- RLS policies: `(auth.jwt() -> 'app_metadata') ->> 'role'`

### Three-Layer Security Model

```
Layer 1: Edge Middleware (fastest — request level)
  Redirects unauthenticated users to /login
  Redirects wrong-role users to their correct panel
  Refreshes JWT on every request (sliding window)
  No DB query — pure JWT validation

Layer 2: Server Action / Route Handler Guards
  Explicit role check before any DB operation
  Returns structured error (not raw Postgres errors)
  Logs to activity_logs for audit trail

Layer 3: PostgreSQL RLS (deepest — row level)
  Enforced for every query regardless of Layer 1/2
  Cannot be bypassed by client code
  Provides defence-in-depth if Layer 1/2 fails
```

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All 6 vulnerability zones documented with specific mitigations | ✅ §5 — Zones 1–6 |
| Broadcast vs Postgres Changes with WAL rationale | ✅ §3 |
| Jitter connect documented | ✅ §3, §5 Zone 2 |
| Heartbeat rate limiting | ✅ §3, §5 Zone 2 |
| Offline data flow step-by-step | ✅ §4 |
| Reconnect flush algorithm | ✅ §4 |
| Server vs Client Component boundary | ✅ §2 — full allowlists |
| Route Handler vs Server Action boundary | ✅ §2 |
| HMAC Clock Guard | ✅ §5 Zone 6 |
| Security Definer RPC for staging migration | ✅ §5 Zone 3 |
| DB authority check for ghost connection | ✅ §5 Zone 4 |
| IndexedDB quota handling with LRU purge | ✅ §5 Zone 5 |
| Infrastructure diagram | ✅ §6 |
| Three-layer security model | ✅ §8 |
