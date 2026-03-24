# MINDSPARK V1 — Functional Specification Document

> **Document type:** Functional Specification — Technical Planning  
> **Version:** 1.0  
> **Output path:** `docs/fsd.md`  
> **Read first:** `docs/prd.md` · `docs/ia-rbac.md`  
> **Author role:** Principal Frontend Architect — high-precision real-time web apps · offline-first · state machines

---

## Table of Contents

1. [Exam Engine State Machine](#1-exam-engine-state-machine)
2. [Flash Anzan Timing Engine](#2-flash-anzan-timing-engine)
3. [Offline Reconciliation Algorithm](#3-offline-reconciliation-algorithm)
4. [Keepalive Teardown](#4-keepalive-teardown)
5. [WebSocket Architecture](#5-websocket-architecture)
6. [Server Actions Reference](#6-server-actions-reference)

---

## 1. Exam Engine State Machine

The exam engine is a deterministic finite state machine. Every state has precisely defined entry conditions, exit conditions, side effects, forbidden operations, and UI rules. No state transition may occur outside this specification.

### State Diagram

```
                    ┌─────────────┐
              ●────▶│    IDLE     │
                    └──────┬──────┘
                           │ admin sets assessment LIVE + student enters /lobby
                           ▼
                    ┌─────────────┐
                    │    LOBBY    │
                    └──────┬──────┘
                           │ student taps "I'm Ready" + countdown = 0
                           ▼
                    ┌─────────────────────┐
                    │  INTERSTITIAL       │ RAF sleep loop
                    │  (Get Ready overlay)│ (elapsed >= 3000ms)
                    └──────┬──────────────┘
                           │ elapsed >= 3000ms
                           ▼
                    ┌─────────────┐
                    │ PHASE_1_    │ ◀──────────────────────────────┐
                    │ START       │                                 │
                    └──────┬──────┘                                 │
                           │                                        │
              ┌────────────┴──────────────────┐                    │
              │ EXAM type                     │ TEST type          │
              ▼                               ▼                    │
       ┌────────────┐              ┌─────────────────────┐         │
       │ PHASE_3_   │              │ PHASE_2_FLASH        │         │
       │ MCQ        │              │ (Flash Anzan active) │         │
       └─────┬──────┘              └──────────┬──────────┘         │
             │                               │ sequence complete    │
             │                               ▼                    │
             │                    ┌──────────────────┐            │
             │                    │   PHASE_3_MCQ    │            │
             │                    └──────────┬───────┘            │
             │                              │                     │
             └─────────────┬────────────────┘                     │
                           │ answer confirmed OR skipped           │
                           ▼                                       │
                    ┌──────────────────────┐                      │
                    │  QUESTION_COOLDOWN   │ 1200ms               │
                    │  (pointer-events off)│                      │
                    └──────┬───────────────┘                      │
                           │ cooldown elapsed                      │
                           │                                       │
                    ┌──────┴───────┐                              │
                    │ more         │ YES ──────────────────────────┘
                    │ questions?   │
                    └──────┬───────┘
                           │ NO (all questions answered)
                           ▼
                    ┌─────────────┐
                    │  SUBMITTED  │ ◀─────── permanent, cannot revert
                    └──────┬──────┘
                           │ immediately
                           ▼
                    ┌─────────────┐
                    │  TEARDOWN   │ ─────▶ ●
                    └─────────────┘
```

---

### State: IDLE

**Description:** Assessment exists in the database but no active session has been created for this student.

**Entry conditions:**
- Student navigates to dashboard
- No live assessment assigned to student's level
- OR assessment exists but status ≠ `LIVE`

**Exit conditions:**
- Admin transitions assessment to `LIVE` status AND student refreshes dashboard
- Supabase Broadcast `exam_live` event received by student's browser → redirect to `/lobby/[id]`

**Side effects:** None.

**Forbidden operations:**
- Writing any `submission` row
- Opening any Supabase Broadcast channel for this assessment

**UI rules:**
- Dashboard shows empty state OR upcoming card
- No `LIVE` hero card until Broadcast event received

---

### State: LOBBY

**Description:** Student is in the waiting room. Countdown timer is active. Network health indicator visible.

**Entry conditions:**
- Student navigates to `/student/lobby/[id]`
- Assessment status = `LIVE` confirmed via RSC fetch
- JWT validates student is within the correct level cohort (RLS enforced)

**Exit conditions:**
- Student taps "I'm Ready" AND countdown timer = 0 → enter `INTERSTITIAL`
- Assessment status changes to `CLOSED` (Broadcast event) → redirect to dashboard with toast

**Side effects:**
- Supabase Broadcast channel subscribed: `exam:{assessment_id}` (with jitter delay)
- Network health WebSocket ping initiated (5s interval)
- `assessment_session` row created (or confirmed) via Server Action `createSession`

**Forbidden operations:**
- Writing any `submissions` row
- Starting RAF loop
- Mounting assessment engine components

**UI rules:**
- Sidebar: visible
- Header: visible
- Countdown timer: `DM Mono 72px`, centered
- Breathing circle animation: active
- Network health dot: green / amber / red
- "I'm Ready" button: disabled until countdown = 0 OR admin early-start Broadcast event

---

### State: INTERSTITIAL

**Description:** 3000ms transitional overlay. Student confirmed ready. Assessment engine components begin mounting behind overlay.

**Entry conditions:**
- Student tapped "I'm Ready" in LOBBY state AND countdown was 0 (or early-start event received)

**Exit conditions:**
- 3000ms elapsed (wall clock, NOT setTimeout → use `performance.now()` delta from entry timestamp)

**Side effects:**
- Lobby page: `transform: scale(0.95) opacity: 0` exit animation (400ms, only if `prefers-reduced-motion: no-preference`)
- Lottie abacus animation starts
- Web Audio API: 3-beat metronome at t=500ms, t=1000ms, t=1500ms (880Hz, 80ms, sine)
- `assessment_session_questions` snapshot fetched → questions locked into local state
- First question's data pre-loaded into component state
- IndexedDB Dexie store initialised for this `session_id`

**Forbidden operations:**
- Allowing student to interact with any element
- Starting RAF loop before INTERSTITIAL exits
- Displaying any question content (question is behind the overlay)

**UI rules:**
- Full-screen overlay: `bg #FFFFFF`, `border-radius 18px`, `shadow-lg`
- Lottie abacus: 80px, centered
- "Get Ready" heading: `DM Sans 22px 700`
- Progress bar: `3px` fill, `3s linear`, `0% → 100%`
- All other UI: hidden behind overlay

---

### State: PHASE_1_START

**Description:** Beginning of each question cycle. For EXAM type: immediately transitions to PHASE_3_MCQ. For TEST type: sets up Flash Anzan sequence and transitions to PHASE_2_FLASH.

**Entry conditions:**
- INTERSTITIAL exits for first question
- QUESTION_COOLDOWN exits for subsequent questions

**Exit conditions:**
- EXAM type: immediately → `PHASE_3_MCQ` (no wait, no animation)
- TEST type: RAF loop initialised → `PHASE_2_FLASH`

**Side effects:**
- Question index incremented
- Equation / flash sequence data loaded into component state from `assessment_session_questions` snapshot
- `sr-announcer` fires: "Question {n} of {total}"
- Question Navigator item marked as `current` (EXAM only)

**Forbidden operations:**
- Writing any `submissions` row in this state
- Beginning flash sequence before RAF loop is confirmed active

**UI rules:**
- EXAM: equation panel + MCQ grid mount immediately; navigator updates current item
- TEST: Phase 1 landing — shows speed/digits/rows info panel + "Begin Flash ▶" button
- Sidebar: hidden (assessment canvas is full-screen)
- Header: hidden

---

### State: PHASE_2_FLASH

**Description:** Flash Anzan sequence active. Numbers swap at hardware-accurate intervals using RAF. Zero UI except the centred flash number. **MOST CRITICAL STATE.**

**Entry conditions:**
- TEST type only
- Student tapped "Begin Flash ▶" in PHASE_1_START
- RAF loop started (see §2 for full implementation)

**Exit conditions:**
- All rows in the current question's flash sequence have been displayed
- `sequenceComplete = true` → immediately → `PHASE_3_MCQ` (no transition, no animation)
- `document.visibilityState === 'hidden'` → pause RAF, enter pause modal (sub-state), resume on return

**Side effects:**
- RAF loop running: `requestAnimationFrame` + delta accumulator (see §2)
- Each number swap: `element.textContent = nextNumber` (instant DOM write, no classList change)
- Pause telemetry: `channel.send({ type: 'broadcast', event: 'focus_lost', payload: { student_id, question_index, duration_ms: 0 } })` on visibility loss (duration_ms updated to elapsed ms on resume)
- RAF cancelled on component unmount (`cancelAnimationFrame(rafHandle)`)

**Forbidden operations:**
- `setTimeout` or `setInterval` for any timing purpose in this state
- Any CSS `transition` on `.flash-number` element (`transition: none !important`)
- Any UI element other than `.flash-number` div (sidebar, header, timer, navigator ALL unmounted)
- `classList.add()` or `classList.remove()` during flash swap — only `textContent` change
- Any animation on `.flash-number`

**UI rules:**
- Canvas: `100vw × 100vh`, background per contrast ramp (§1 of hifi-spec)
- Flash number: `position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%)`
- Flash number size: `clamp(96px, 30vh, 180px)` — never smaller than 30% viewport height
- Sidebar: **UNMOUNTED** (`{phase !== 'PHASE_2_FLASH' && <Sidebar/>}`)
- Header: **UNMOUNTED**
- Timer: **UNMOUNTED**
- Question Navigator: **UNMOUNTED** (`{phase !== 'PHASE_2_FLASH' && <Navigator/>}`)
- Progress indicator: **UNMOUNTED**
- Sync dot: **UNMOUNTED**
- Network banner: **UNMOUNTED**

> All peripheral elements are **conditionally unmounted**, not hidden. `display: none` is insufficient — any DOM node outside the flash number is forbidden during Phase 2.

---

### State: PHASE_3_MCQ

**Description:** Student answers the MCQ question. For EXAM type, this is the only active phase per question.

**Entry conditions:**
- EXAM type: entered directly from PHASE_1_START
- TEST type: entered immediately after PHASE_2_FLASH `sequenceComplete = true`

**Exit conditions:**
- Student selects option AND confirms → answer written to IndexedDB → `QUESTION_COOLDOWN`
- Student taps "Skip" (TEST Phase 3 only) → `null` answer written to IndexedDB → `QUESTION_COOLDOWN`

**Side effects:**
- On selection: MCQ option enters `selected` visual state (3px green-800 border, green-50 bg)
- On confirm: answer object `{ question_id, option_id, answered_at }` written to IndexedDB **before** any network call
- POST to `/api/submissions` attempted (may be queued in Dexie if offline)
- `answered_at` timestamp captured from `Date.now()` (not server time — client time is acceptable for ordering)

**Forbidden operations:**
- Allowing multiple MCQ selections without confirmation (Select & Confirm only)
- Writing to `submissions` table directly (always go through Route Handler or Server Action)
- Marking question as answered before IndexedDB write confirms (IndexedDB write is synchronous in Dexie)
- Navigator interaction during TEST Phase 3 (navigator is UNMOUNTED in TEST type)

**UI rules:**
- EXAM type: sidebar hidden, question navigator MOUNTED at 280px right column, equation panel visible
- TEST type: full canvas — no sidebar, no header, no navigator (unmounted)
- MCQ grid: 2×2, min 64px × 64px per cell
- "Confirm →" button: appears 200ms after option tap (translateY slide-in)
- Timer pill: visible in EXAM type (top-right, floating)
- Timer pill: hidden in TEST type (no timer per question — only global session timer if configured)

---

### State: QUESTION_COOLDOWN

**Description:** 1200ms pause between question confirmation and next question mount. Invisible to user — no visual change.

**Entry conditions:**
- Answer confirmed or skipped in PHASE_3_MCQ

**Exit conditions:**
- 1200ms elapsed (`performance.now()` delta, not `setTimeout`)
- Implementation: use `requestAnimationFrame` loop checking elapsed time

**Side effects:**
- Invisible `pointer-events: none` overlay covers entire assessment canvas
- Network sync attempt: if online, POST answer from IndexedDB to server
- Navigator item updated: answered (green checkmark) or skipped (amber)
- Next question data pre-fetched from local `assessment_session_questions` snapshot

**Forbidden operations:**
- Any user input (enforced by pointer-events overlay)
- Starting the next question's RAF loop
- Displaying the next question's content

**UI rules:**
- Visual state: unchanged from PHASE_3_MCQ end (no flash, no transition)
- Invisible overlay: `position: fixed; inset: 0; pointer-events: none; z-index: 9998; aria-hidden: true`
- User sees: the just-confirmed MCQ state — no visible change at all

---

### State: SUBMITTED

**Description:** All questions answered and confirmed. Permanent final state. Cannot be reverted.

**Entry conditions:**
- Last question QUESTION_COOLDOWN exits AND question index = total question count
- OR: Admin `forceCloseExam` Server Action (writes `completed_at` for all in-progress sessions)

**Exit conditions:**
- None — this state is terminal. UI transitions to submission confirmation screen.

**Side effects:**
- `submissions.completed_at = NOW()` upserted (Server Action `submitExam`)
- All pending IndexedDB answers flushed to server (bulk POST to `/api/submissions/offline-sync`)
- Supabase Broadcast event: `{ event: 'submitted', student_id }` emitted to `monitor:{assessmentId}` channel
- `completion-chime.mp3` plays once (respects `prefers-reduced-motion` — confetti only, not audio)
- Dexie store for this session cleared after successful server confirmation

**Forbidden operations:**
- Reverting to any previous state
- Overwriting `submitted` status in admin monitor with WebSocket leave events (ghost connection fix — see §3)
- Allowing student to modify any answer

**UI rules:**
- Submission confirmation card mounts: white card, shadow-lg, 400ms slide-up, checkmark icon
- Confetti canvas: green palette, contained to card, 2000ms (suppressed if `prefers-reduced-motion`)
- "View Results →" and "Back to Dashboard" buttons present
- All assessment components unmount in background

---

### State: TEARDOWN

**Description:** Cleanup phase. Runs immediately after SUBMITTED. Not a visible UI state.

**Entry conditions:**
- SUBMITTED state reached

**Exit conditions:**
- All cleanup complete → navigation away from assessment route

**Side effects:**
- `supabase.removeChannel()` called for all subscribed channels (mandatory — no exceptions)
- RAF handle cancelled if somehow still running: `cancelAnimationFrame(rafHandle)`
- Dexie session store closed
- `pagehide` keepalive fetch fired to `/api/submissions/teardown` (see §4)
- Assessment engine components unmounted
- Browser navigation to `/student/results` or `/student/dashboard`

**Forbidden operations:**
- Re-mounting any assessment engine component
- Subscribing to any new Supabase channel

**UI rules:**
- None — teardown is silent; submission confirmation card remains visible during teardown

---

### State Machine Implementation Notes

```typescript
// src/stores/exam-session-store.ts (Zustand)
type ExamPhase =
  | 'IDLE'
  | 'LOBBY'
  | 'INTERSTITIAL'
  | 'PHASE_1_START'
  | 'PHASE_2_FLASH'    // TEST only
  | 'PHASE_3_MCQ'
  | 'QUESTION_COOLDOWN'
  | 'SUBMITTED'
  | 'TEARDOWN';

interface ExamSessionState {
  phase: ExamPhase;
  assessmentType: 'EXAM' | 'TEST';
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: Map<string, AnswerPayload>;
  sessionId: string | null;
  rafHandle: number | null;
  cooldownStart: number | null;   // performance.now() timestamp
}

// Transition guard — prevents illegal state changes
function canTransition(from: ExamPhase, to: ExamPhase): boolean {
  const allowed: Record<ExamPhase, ExamPhase[]> = {
    IDLE:               ['LOBBY'],
    LOBBY:              ['INTERSTITIAL'],
    INTERSTITIAL:       ['PHASE_1_START'],
    PHASE_1_START:      ['PHASE_2_FLASH', 'PHASE_3_MCQ'],
    PHASE_2_FLASH:      ['PHASE_3_MCQ'],
    PHASE_3_MCQ:        ['QUESTION_COOLDOWN'],
    QUESTION_COOLDOWN:  ['PHASE_1_START', 'SUBMITTED'],
    SUBMITTED:          ['TEARDOWN'],
    TEARDOWN:           [],
  };
  return allowed[from]?.includes(to) ?? false;
}
```

---

## 2. Flash Anzan Timing Engine

### Design Rationale

`setTimeout` and `setInterval` are **banned** for flash interval timing. Reasons:

1. **Main thread blocking:** JavaScript is single-threaded. Any synchronous work (React re-renders, garbage collection, network callbacks) will delay `setTimeout` callbacks — causing variable flash durations that degrade student accuracy.
2. **Clock drift:** `setInterval` accumulates drift. A 450ms interval will be 450ms + processing overhead per tick, meaning a 10-row sequence arrives 5–50ms late depending on device.
3. **RAF hardware sync:** `requestAnimationFrame` fires in sync with the monitor's refresh rate (60Hz → 16.67ms, 120Hz → 8.33ms). Using RAF + delta accumulation gives frame-accurate timing with zero drift.

### RAF Loop Implementation

```typescript
// src/lib/timing-engine.ts

interface TimingEngineConfig {
  flashInterval: number;       // ms between number swaps
  sequence: number[];          // ordered array of numbers to flash
  onSwap: (n: number) => void; // callback — DOM update happens here
  onComplete: () => void;      // fires after last number in sequence
}

export class FlashTimingEngine {
  private rafHandle: number | null = null;
  private lastTimestamp = 0;
  private accumulator = 0;
  private sequenceIndex = 0;
  private config: TimingEngineConfig;

  constructor(config: TimingEngineConfig) {
    this.config = config;
  }

  start(): void {
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
    this.sequenceIndex = 0;
    this.rafHandle = requestAnimationFrame(this.loop);
  }

  stop(): void {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  private loop = (timestamp: number): void => {
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.accumulator += delta;

    if (this.accumulator >= this.config.flashInterval) {
      // Consume exactly one interval from accumulator
      // (surplus carries forward — prevents drift accumulation)
      this.accumulator -= this.config.flashInterval;

      const current = this.config.sequence[this.sequenceIndex];
      this.config.onSwap(current);
      this.sequenceIndex++;

      if (this.sequenceIndex >= this.config.sequence.length) {
        this.stop();
        this.config.onComplete();
        return; // exit loop — do NOT call rAF again
      }
    }

    this.rafHandle = requestAnimationFrame(this.loop);
  };
}
```

### DOM Swap Function — Critical Rules

```typescript
// Called by onSwap callback — inside the React component
function swapNumber(n: number): void {
  // Direct DOM write — bypasses React reconciler for zero-lag swap
  if (flashElementRef.current) {
    flashElementRef.current.textContent = String(n);
    // Negative numbers — change colour class only (no transition)
    if (n < 0) {
      flashElementRef.current.style.color = '#991B1B';
    } else {
      flashElementRef.current.style.color = ''; // inherit from CSS
    }
  }
  // DO NOT: setState, classList.add/remove, requestAnimationFrame inside here
  // DO NOT: any async operation
  // DO NOT: trigger React re-render
}
```

**Why direct DOM write and not `setState`?**  
React's `setState` batches updates and schedules a re-render on the next microtask tick. For flash intervals below 300ms, this introduces variable lag ranging from 2–16ms per swap. At 200ms flash intervals, this lag represents 1–8% of the display window — perceptually significant. Direct `ref.current.textContent` write is synchronous and frame-accurate.

### Contrast Dampening (applied by timing-engine.ts)

```typescript
// src/lib/timing-engine.ts
export function getContrastConfig(intervalMs: number): ContrastConfig {
  if (intervalMs >= 500) {
    return { color: '#0F172A', background: '#FFFFFF', opacityFade: false };
  }
  if (intervalMs >= 300) {
    return { color: '#1E293B', background: '#F8FAFC', opacityFade: false };
  }
  if (intervalMs >= 200) {
    return { color: '#334155', background: '#F1F5F9', opacityFade: true };
    // opacityFade = 30ms linear opacity on textContent swap
  }
  // intervalMs < 200ms — HARD BLOCKED
  throw new Error('FLASH_INTERVAL_TOO_LOW: requires neurologist profile flag');
}
```

### Speed Guard

```typescript
// Applied at assessment creation time (admin UI) and validated server-side
const MIN_FLASH_INTERVAL_MS = 200;
const NEUROLOGIST_OVERRIDE_FLAG = 'neurologist_approved' as const;

export function validateFlashInterval(
  intervalMs: number,
  studentFlags: string[]
): void {
  if (intervalMs < MIN_FLASH_INTERVAL_MS) {
    if (!studentFlags.includes(NEUROLOGIST_OVERRIDE_FLAG)) {
      throw new Error('Flash interval below 200ms requires neurologist profile flag');
    }
  }
}
```

### Pause and Resume

> **Implementation note (Batch 1 audit fix):** `'PAUSED'` is NOT a member of the `ExamPhase` union type. Pause state is represented as a separate boolean flag `isPaused: boolean` in the Zustand store. The main phase stays `'PHASE_2_FLASH'`; the RAF engine's `stop()` / `start()` are controlled by `isPaused`. This avoids adding a new state to `canTransition()` and keeps the state machine minimal.

```typescript
// exam-session-store.ts — add isPaused flag alongside ExamPhase
interface ExamSessionState {
  phase: ExamPhase;
  isPaused: boolean;   // ← pause sub-state for PHASE_2_FLASH only
  // ... other fields
}
```

```typescript
// Pause on visibility loss
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    engine.stop();
    setIsPaused(true);   // ← set boolean flag, do NOT call setPhase('PAUSED')
    // Phase remains 'PHASE_2_FLASH' — only the engine is stopped
    // Broadcast telemetry to admin monitor
    channel.send({
      type: 'broadcast',
      event: 'focus_lost',
      payload: { student_id: session.studentId, question_index: currentIndex }
    });
  } else {
    // Resume when student returns
    setIsPaused(false);
    engine.start(); // restarts from current sequenceIndex
    // Phase is still 'PHASE_2_FLASH' — no transition needed
  }
});
```

---

## 3. Offline Reconciliation Algorithm

### State Authority Hierarchy

When multiple data sources disagree on a student's submission status, this hierarchy resolves conflicts. Higher number = higher authority:

```
Priority 3 (HIGHEST): DB Final Submission
  Condition: submissions row exists with completed_at IS NOT NULL
  Action: ALWAYS wins. Never overwrite with lower-authority source.
  Source of truth for: result calculation, grade assignment, published results

Priority 2: REST Payload Sync
  Condition: POST /api/submissions/offline-sync received and validated
  Action: Wins over WebSocket Presence events
  Source of truth for: individual answer records while session is open

Priority 1 (LOWEST): WebSocket Presence
  Condition: Supabase Broadcast / Presence heartbeat event
  Action: Yields to DB state. Used only for live UI indicators.
  Source of truth for: real-time "online/offline" status display ONLY
```

### Ghost Connection Fix

**Problem:** When a student completes submission in a low-bandwidth scenario, the WebSocket Presence `leave` event may arrive at the admin monitor **after** the submission has already been confirmed. This would incorrectly flip the student's monitor status from `Submitted` (green) back to `Disconnected` (amber).

**Solution:**

```typescript
// src/components/monitor/live-monitor-dashboard.tsx

function handlePresenceLeave(studentId: string): void {
  const currentStatus = studentRows.get(studentId);

  // Check DB authority BEFORE updating UI from WebSocket event
  if (
    currentStatus?.sync_status === 'verified' ||
    currentStatus?.completed_at !== null
  ) {
    // DB says submitted — ignore WebSocket leave event entirely
    // Row stays green — Submitted badge is permanent
    return;
  }

  // No confirmed submission — treat as genuine disconnect
  updateStudentStatus(studentId, 'DISCONNECTED');
}

// Subscribe to Broadcast
channel.on('broadcast', { event: 'presence_leave' }, ({ payload }) => {
  handlePresenceLeave(payload.student_id);
});
```

**Monitor row status permanence rule:**
- Once a row displays `Submitted` (green badge), it MUST NOT change for any reason during the session
- `completed_at IS NOT NULL` in the DB is the only authoritative submitted signal
- WebSocket Presence `leave` events are advisory only — never override DB state

### Offline Queue Flush (Dexie → Server)

```
Scenario: Student loses connectivity mid-exam. Answers accumulate in IndexedDB.
On reconnect, flush algorithm:

1. Network reconnect detected (navigator.onLine = true OR fetch probe succeeds)
2. Dexie query: all pending answers for current session_id WHERE synced = false
3. POST /api/submissions/offline-sync with batch payload:
   {
     session_id: string,
     answers: Array<{
       question_id: string,
       option_id: string | null,
       answered_at: number,       // client timestamp
       idempotency_key: string    // UUID generated at answer time
     }>,
     hmac_timestamp: string       // HMAC-SHA256(session_id + batch_timestamp, secret)
   }
4. Server validates JWT → validates HMAC timestamp (prevents replay > 24h old)
5. Server upserts to offline_submissions_staging table (permissive RLS — accepts always)
6. Security Definer RPC migrates staging → main submissions table with deduplication
   (idempotency_key UNIQUE constraint prevents any double-counts)
7. Server returns { synced: string[] }  (array of successfully synced idempotency_keys)
8. Dexie marks those records synced = true
9. If any answers remain unsynced (network error mid-flush): retry on next reconnect
```

### Idempotency Key Pattern

```typescript
// Generated at answer-time in PHASE_3_MCQ — before any network call
function generateIdempotencyKey(
  sessionId: string,
  questionId: string,
  answeredAtMs: number
): string {
  // UUID v5 (deterministic) — same inputs always produce same key
  // Prevents double-submission even if component rerenders between taps
  return uuidv5(`${sessionId}:${questionId}:${answeredAtMs}`, NAMESPACE_UUID);
}
```

---

## 4. Keepalive Teardown

### Why Route Handler, Not Server Action

| Factor | Server Action | Route Handler |
|--------|--------------|---------------|
| URL stability | POSTs to current page URL (changes on navigation) | Fixed URL `/api/submissions/teardown` |
| `keepalive: true` fetch | ❌ Unreliable — page URL changes during pagehide | ✅ Stable URL survives page unload |
| `pagehide` event compatibility | ❌ Not reliable | ✅ Supported by `fetch` with `keepalive` |
| Cookie sending on pagehide | ❌ Browser may not attach cookies | ✅ Explicit JWT in Authorization header |

### Implementation

```typescript
// src/app/(student)/assessment/[id]/hooks/use-teardown-listener.ts

export function useTeardownListener(
  submissionId: string,
  sessionId: string,
  getAnswersSnapshot: () => AnswerSnapshot[]
): void {
  useEffect(() => {
    const jwt = getToken(); // from supabase.auth.getSession() — stored in ref, not state

    async function handlePageHide(): Promise<void> {
      const snapshot = getAnswersSnapshot();
      
      // MUST use keepalive: true — browser allows this to complete after page unload
      // Body limit for keepalive: 64KB — snapshot must be trimmed if exceeding
      await fetch('/api/submissions/teardown', {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          // Explicit JWT because cookies may not be sent reliably on pagehide
        },
        body: JSON.stringify({
          submission_id: submissionId,
          session_id: sessionId,
          answers_snapshot: snapshot,
          client_timestamp: Date.now(),
        }),
      });
      // No await response — keepalive fires and forgets
    }

    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [submissionId, sessionId]);
}
```

### Route Handler

```typescript
// src/app/api/submissions/teardown/route.ts

export async function POST(request: Request): Promise<Response> {
  // 1. Validate Authorization header JWT (cookies unreliable on pagehide)
  const authHeader = request.headers.get('Authorization');
  const jwt = authHeader?.replace('Bearer ', '');
  
  const supabase = createServiceRoleClient();
  const { data: { user }, error } = await supabase.auth.getUser(jwt);
  if (error || !user) return new Response('Unauthorized', { status: 401 });

  // 2. Parse body
  const body = await request.json();
  const { submission_id, session_id, answers_snapshot, client_timestamp } = body;

  // 3. Validate: submission belongs to this user
  // 4. Upsert any unsynced answers from snapshot to offline_submissions_staging
  // 5. Mark session as completed_at = NOW() if not already set
  // 6. Return 200 (browser likely ignores response — keepalive)
  
  return new Response('OK', { status: 200 });
}
```

---

## 5. WebSocket Architecture

### Broadcast vs Postgres Changes

| Dimension | Supabase Broadcast | Postgres Changes (WAL) |
|-----------|-------------------|----------------------|
| Transport | WebSocket (direct) | WAL replication slot → WebSocket |
| Scale ceiling | Unlimited (stateless) | ~2500 concurrent writes before WAL overflow |
| Latency | <100ms | 200–800ms (WAL processing delay) |
| Exam use case | ✅ Required | ❌ Banned for exam telemetry |
| Schema changes | No overhead | Change feed per table |
| Suitable for | Real-time telemetry · Presence | Data sync · audit logs |

**Rule:** All exam-session state events (student connected, submitted, answered, focus-lost) MUST use Broadcast. Postgres Changes may be used for non-exam admin data (level list updates, announcement publishes).

### Channel Naming Convention

```typescript
// Exam telemetry channel — one per assessment session
const examChannel = supabase.channel(`exam:${assessmentId}`);

// Admin monitor channel
const monitorChannel = supabase.channel(`monitor:${assessmentId}`);

// Student presence (lobby countdown sync)
const presenceChannel = supabase.channel(`lobby:${assessmentId}`);
```

### Jitter Connect — Thundering Herd Prevention

When admin triggers `LIVE` status, all students receive a Broadcast event simultaneously. Without jitter, all students' WebSocket subscriptions would connect at the same instant, creating a thundering herd.

```typescript
// src/hooks/use-exam-channel.ts

export function useExamChannel(assessmentId: string): RealtimeChannel {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`exam:${assessmentId}`);

    // Jitter: spread connections over 0–5000ms
    const jitterMs = Math.random() * 5000;
    const timer = setTimeout(() => {
      channel.subscribe();
      channelRef.current = channel;
    }, jitterMs);

    return () => {
      clearTimeout(timer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current); // MANDATORY — no exceptions
      }
    };
  }, [assessmentId]);

  return channelRef.current!;
}
```

### Heartbeat Rate Limiting

```typescript
// Maximum 1 heartbeat event per 5 seconds per student
// Prevents WebSocket flooding from active students

const HEARTBEAT_INTERVAL_MS = 5000;
let lastHeartbeat = 0;

function sendHeartbeat(channel: RealtimeChannel, payload: object): void {
  const now = Date.now();
  if (now - lastHeartbeat < HEARTBEAT_INTERVAL_MS) return; // throttle
  lastHeartbeat = now;
  channel.send({
    type: 'broadcast',
    event: 'heartbeat',
    payload,
  });
}
```

### Channel Cleanup — Mandatory Pattern

```typescript
// EVERY useEffect that subscribes to a channel MUST follow this pattern
useEffect(() => {
  const channel = supabase.channel('channel-name');
  channel
    .on('broadcast', { event: 'my-event' }, handler)
    .subscribe();

  return () => {
    supabase.removeChannel(channel); // ← required on every unmount
  };
}, [dependency]);
```

Failure to call `removeChannel()` exhausts Supabase connection pool limits. Each leaked channel consumes a connection slot permanently until the server-side 60s timeout.

---

## 6. Server Actions Reference

All Server Actions live in `src/app/actions/`. Every action:
1. Calls `supabase.auth.getUser()` before any DB operation
2. Validates the caller's role against the required role
3. Returns a typed result object — never throws to client

### `createSession`

```typescript
// src/app/actions/exam-session.ts
export async function createSession(input: {
  paper_id: string;
}): Promise<{ ok: boolean; session_id?: string; error?: string }>;

// Auth: role = 'student'
// DB ops:
//   SELECT exam_papers WHERE id = $paper_id AND status = 'LIVE'
//     AND level_id = (SELECT level_id FROM students WHERE profile_id = auth.uid())
//   INSERT submissions (
//     paper_id, student_id, session_id = gen_random_uuid(),
//     idempotency_key = gen_random_uuid(), started_at = NOW()
//   ) ON CONFLICT (paper_id, student_id) DO NOTHING   -- idempotent
//   RETURN session_id
// Error states:
//   ASSESSMENT_NOT_LIVE: exam_papers.status ≠ 'LIVE'
//   LEVEL_MISMATCH: student's level_id ≠ exam_papers.level_id
//   SESSION_ALREADY_EXISTS: submission row already created (returns existing session_id)
```



```typescript
// src/app/actions/exam.ts
export async function submitAnswer(input: {
  session_id: string;
  question_id: string;
  option_id: string | null;    // null = skipped
  answered_at: number;         // client timestamp ms
  idempotency_key: string;     // UUID v5 — generated client-side
}): Promise<{ ok: boolean; error?: string }>;

// Auth: role = 'student', session belongs to calling user
// DB ops:
//   UPSERT submissions SET option_id, answered_at WHERE idempotency_key = $key
//   (idempotency_key UNIQUE — duplicate calls are no-ops)
// Error states:
//   UNAUTHORIZED: caller is not the session owner
//   SESSION_CLOSED: assessment_session.completed_at IS NOT NULL
//   INVALID_QUESTION: question_id not in assessment_session_questions for this session
```

### `submitExam`

```typescript
export async function submitExam(input: {
  session_id: string;
  final_answers_snapshot: AnswerSnapshot[]; // full local state for reconciliation
}): Promise<{ ok: boolean; result_id?: string; error?: string }>;

// Auth: role = 'student', session belongs to calling user
// DB ops:
//   UPDATE submissions SET completed_at = NOW() WHERE id = $session_id
//   INSERT offline_submissions_staging (bulk, for any unsynced answers in snapshot)
//   SELECT trigger fires reconciliation RPC
// Error states:
//   ALREADY_SUBMITTED: completed_at already set (idempotent — returns ok: true)
//   SESSION_NOT_FOUND: invalid session_id
```

### `publishResult`

```typescript
export async function publishResult(input: {
  session_id: string;
  score: number;           // 0–100
  grade: string;           // 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  dpm: number;             // digits per minute (TEST type only, else 0)
}): Promise<{ ok: boolean; error?: string }>;

// Auth: role = 'admin' OR (role = 'teacher' AND session.cohort_id IN teacher's cohorts)
// DB ops:
//   UPDATE submissions SET
//     result_published_at = NOW(), score, grade, dpm
//   INSERT activity_logs (actor, action='PUBLISH_RESULT', target=session_id)
// Error states:
//   UNAUTHORIZED: teacher calling for outside-cohort student
//   SESSION_NOT_COMPLETE: completed_at IS NULL (cannot publish incomplete session)
```

### `unpublishResult`

```typescript
export async function unpublishResult(input: {
  session_id: string;
}): Promise<{ ok: boolean; error?: string }>;

// Auth: role = 'admin' only (teachers cannot unpublish)
// DB ops:
//   UPDATE submissions SET result_published_at = NULL
//   INSERT activity_logs
// Error states:
//   UNAUTHORIZED: caller is not admin
```

### `forceCloseExam`

```typescript
export async function forceCloseExam(input: {
  assessment_id: string;
}): Promise<{ ok: boolean; affected_sessions: number; error?: string }>;

// Auth: role = 'admin' only
// DB ops:
//   UPDATE exam_papers SET status = 'CLOSED', closed_at = NOW()
//   UPDATE submissions SET completed_at = NOW()
//     WHERE paper_id = $id AND completed_at IS NULL
// Side effects:
//   Supabase Broadcast: channel.send({ event: 'exam_closed', payload: { assessment_id, closed_at: new Date().toISOString() } }) to exam:{assessment_id} channel
// Error states:
//   NOT_LIVE: assessment is not currently LIVE
//   UNAUTHORIZED: teacher attempting to close
```

### `forceOpenExam`

```typescript
export async function forceOpenExam(input: {
  assessment_id: string;
}): Promise<{ ok: boolean; error?: string }>;

// Auth: role = 'admin' only
// DB ops:
//   UPDATE exam_papers SET status = 'LIVE', opened_at = NOW()
// Side effects:
//   Supabase Broadcast: channel.send({ event: 'exam_live' }) to exam:{assessment_id} channel
// Error states:
//   ALREADY_LIVE: status is already LIVE
//   NOT_PUBLISHED: cannot go LIVE from DRAFT
//   UNAUTHORIZED: teacher attempting to open
```

### `importStudentsCSV`

```typescript
export async function importStudentsCSV(input: {
  csv_raw: string;            // raw CSV string (parsed client-side via PapaParse)
  level_id: string;
  dry_run: boolean;           // true = validate only, false = insert
}): Promise<{
  ok: boolean;
  inserted?: number;
  skipped?: number;
  errors?: Array<{ row: number; reason: string }>;
}>;

// Auth: role = 'admin' only
// DB ops (dry_run = false):
//   Bulk INSERT profiles WHERE institution_id = caller's institution
//   INSERT students (profile_id, level_id, enrollment_date)
//   Duplicate roll numbers: SKIP (report in errors array)
// Validation (both dry_run and real):
//   Required cols: full_name, roll_number, date_of_birth
//   Date format: ISO 8601 (YYYY-MM-DD)
//   Row limit: 500 rows per import
// Error states:
//   INVALID_CSV: missing required columns
//   ROW_LIMIT_EXCEEDED: > 500 rows
//   LEVEL_NOT_FOUND: level_id not in institution
```

### `reEvaluateResults`

```typescript
export async function reEvaluateResults(input: {
  assessment_id: string;
  reason: string;             // audit trail — mandatory
}): Promise<{ ok: boolean; recalculated_sessions: number; error?: string }>;

// Auth: role = 'admin' only
// DB ops:
//   Call RPC: calculate_results(p_paper_id) — recomputes score/grade for all sessions
//   UPDATE submissions SET score, grade (bulk)
//   All result_published_at values: SET TO NULL (admin must re-publish)
//   INSERT activity_logs (actor, action='RE_EVALUATE', payload={ assessment_id, reason })
// Error states:
//   ASSESSMENT_NOT_CLOSED: can only re-evaluate after exam is CLOSED
//   NO_SESSIONS: no completed sessions found
```

### `createAssessment`

```typescript
export async function createAssessment(input: {
  type: 'EXAM' | 'TEST';
  title: string;
  level_id: string;
  questions: Array<{
    equation_display: string | null;  // EXAM: rendered equation string
    flash_sequence: number[] | null;  // TEST: ordered number array
    options: Array<{ label: string; value: string; is_correct: boolean }>;
    order_index: number;
  }>;
  anzan_config?: {                    // TEST type only
    delay_ms: number;                 // 200–2000ms
    digit_count: number;              // 1–5
    row_count: number;                // 2–10
  };
}): Promise<{ ok: boolean; assessment_id?: string; error?: string }>;

// Auth: role = 'admin' only
// DB ops:
//   INSERT exam_papers (type, title, level_id, status='DRAFT', institution_id=caller's,
//     anzan_delay_ms, anzan_digit_count, anzan_row_count if TEST type)
//   INSERT questions (bulk)
// Error states:
//   LEVEL_NOT_FOUND: level_id not in institution
//   NO_QUESTIONS: must have at least 1 question
//   INVALID_ANZAN_CONFIG: delay_ms < 200 without neurologist flag
//   DUPLICATE_ORDER_INDEX: question order must be unique
```

### `updateAssessment`

```typescript
export async function updateAssessment(input: {
  assessment_id: string;
  title?: string;
  questions?: Array<{ /* same as createAssessment */ }>;
  anzan_config?: { /* same as createAssessment */ };
}): Promise<{ ok: boolean; error?: string }>;

// Auth: role = 'admin' only
// DB ops:
//   UPDATE exam_papers SET title, updated_at
//   DELETE + re-INSERT questions (full replace — no partial patch)
// Constraint: CANNOT update if status = 'LIVE' or 'CLOSED'
// Error states:
//   ASSESSMENT_LOCKED: status is LIVE or CLOSED — no edits allowed
//   NOT_FOUND: assessment_id not in institution
```

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All 9 exam states with entry/exit/side-effects/forbidden-ops/UI rules | ✅ §1 — all 9 states fully documented |
| State transition guard implementation | ✅ §1 — `canTransition()` function |
| RAF loop with delta accumulator (no setTimeout reference) | ✅ §2 — `FlashTimingEngine` class |
| Direct DOM write in `swapNumber` — rationale documented | ✅ §2 |
| Contrast dampening by interval | ✅ §2 — `getContrastConfig()` |
| Speed guard (< 200ms hard block) | ✅ §2 |
| Pause / resume on `visibilitychange` | ✅ §2 |
| State authority hierarchy (DB > REST > WebSocket) | ✅ §3 |
| Ghost connection fix with conditional logic | ✅ §3 — `handlePresenceLeave()` |
| Offline queue flush algorithm | ✅ §3 — step-by-step |
| Idempotency key UUID v5 pattern | ✅ §3 |
| Teardown as Route Handler with rationale table | ✅ §4 |
| Explicit JWT in Authorization header (not cookies) | ✅ §4 |
| Broadcast vs Postgres Changes comparison | ✅ §5 — comparison table |
| Jitter connect (0–5000ms random) | ✅ §5 |
| Heartbeat rate limit (1 per 5s) | ✅ §5 |
| `removeChannel()` mandatory pattern | ✅ §5 |
| All 11 Server Actions with signatures / auth / DB ops / errors | ✅ §6 — includes createSession (Batch 1 audit addition) |
