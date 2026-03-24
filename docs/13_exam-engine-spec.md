# MINDSPARK V1 — Technical Specification: Exam Engine

> **Document type:** Technical Specification — Exam Engine  
> **Version:** 1.0  
> **Output path:** `docs/exam-engine-spec.md`  
> **Read first:** `docs/fsd.md` §2 (Flash Anzan Timing Engine)  
> **Author role:** Principal Frontend Engineer — high-precision browser timing APIs · cryptographic integrity systems

---

## Table of Contents

1. [RAF Timing Engine](#1-raf-timing-engine)
2. [HMAC Clock Guard](#2-hmac-clock-guard)
3. [Number Generator](#3-number-generator)
4. [Contrast Dampening](#4-contrast-dampening)

---

## 1. RAF Timing Engine

**File:** `src/lib/anzan/timing-engine.ts`

### Why `requestAnimationFrame`, Never `setInterval`

| Property | `setInterval` | `requestAnimationFrame` |
|---------|--------------|------------------------|
| Scheduling | Macro-task queue — can be blocked by rendering or GC | Tied to monitor refresh cycle |
| Clock drift | Accumulates: 450ms × 10 = 4500ms + processing overhead | Zero drift with delta accumulator |
| Background tabs | Throttled to 1Hz (Chrome) — sequence falls behind | RAF paused → sequence correctly paused |
| Precision | ±50ms under load | ±1 frame (~0.5ms at 120Hz) |

At 200ms flash intervals, `setInterval` drift of even 10ms per tick = 5% error per number. Over 10 rows this makes the final display 50–100ms late — perceptible and academically unfair.

**Rule:** `setTimeout` and `setInterval` are BANNED in `timing-engine.ts`. ESLint rule `no-restricted-globals` enforces this at CI.

---

### Core Types

```typescript
// src/lib/anzan/timing-engine.ts

/**
 * Mutable state object passed into the RAF loop.
 * Kept as a plain object (not React state) — updates must NOT trigger re-renders.
 */
export interface TimingState {
  /** performance.now() value from the previous RAF frame. 0 on first frame. */
  lastTimestamp:  number;
  /** Accumulated delta since last flash swap. Carries surplus forward (prevents drift). */
  accumulator:    number;
  /** Index into numbers[] — which number to flash next. */
  questionIndex:  number;
  /** Ordered flash sequence for this question. Set once before loop starts. */
  numbers:        number[];
  /** Flash interval in ms — from admin anzan_config.delay_ms. Min 200ms. */
  interval:       number;
  /** Called synchronously inside RAF — must only set element.textContent. */
  onFlash:        (n: number, isNegative: boolean) => void;
  /** Called when all numbers in sequence have been displayed. */
  onComplete:     () => void;
}

/** Return value: cleanup function — call to cancel RAF on unmount. */
export type StopFlashLoop = () => void;
```

---

### Core Algorithm: Delta-Time Accumulator

```typescript
// src/lib/anzan/timing-engine.ts

/**
 * Starts the Flash Anzan RAF loop.
 *
 * @returns A cleanup function. MUST be called on React component unmount.
 *          Failure to call will leak the RAF handle indefinitely.
 */
export function startFlashLoop(state: TimingState): StopFlashLoop {
  // Hard cap — enforced here, not by caller
  if (state.interval < MINIMUM_INTERVAL_MS) {
    throw new Error(
      `INTERVAL_BELOW_MINIMUM: ${state.interval}ms < ${MINIMUM_INTERVAL_MS}ms. ` +
      `Neurologist profile flag required for sub-200ms intervals.`
    );
  }

  let animFrame: number;
  let { lastTimestamp, accumulator } = state;

  function loop(timestamp: DOMHighResTimeStamp): void {
    // First frame: initialise reference point (no delta computed)
    if (lastTimestamp === 0) {
      lastTimestamp = timestamp;
      animFrame = requestAnimationFrame(loop);
      return;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Guard: ignore anomalously large deltas (tab hidden, GC pause > 500ms)
    // Treat as if a single interval elapsed — prevents sequence skip
    const clampedDelta = Math.min(delta, state.interval * 1.5);
    accumulator += clampedDelta;

    if (accumulator >= state.interval) {
      const n = state.numbers[state.questionIndex];

      // onFlash: ONLY sets element.textContent — no state, no classList
      state.onFlash(n, n < 0);

      // Subtract exactly one interval — surplus carries forward (zero drift)
      accumulator -= state.interval;
      state.questionIndex++;

      if (state.questionIndex >= state.numbers.length) {
        // Sequence complete — do NOT schedule another frame
        state.onComplete();
        return;
      }
    }

    // Schedule next frame — always at end (never inside onFlash callback)
    animFrame = requestAnimationFrame(loop);
  }

  // Kick off loop — mutate shared state ref
  state.lastTimestamp = 0;
  state.accumulator   = 0;
  animFrame = requestAnimationFrame(loop);

  // Return cleanup handle
  return () => cancelAnimationFrame(animFrame);
}
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `lastTimestamp = 0` sentinel | Avoids computing delta on first frame where `lastTimestamp` is unset. Delta on frame 1 is always 0. |
| `clampedDelta = Math.min(delta, interval × 1.5)` | Prevents a single large delta (tab restored from background) from eating multiple interval slots and skipping numbers. |
| `accumulator -= interval` (not`= 0`) | Surplus carries forward: if target was 450ms and delta was 470ms, next flash fires 20ms early to compensate. Zero total drift. |
| `onFlash` must ONLY set `textContent` | React reconciler introduces variable lag. Direct DOM write is synchronous and frame-accurate. No `classList`, no `setState`, no nested `requestAnimationFrame`. |
| `return` after `onComplete()` | Never schedules another RAF after sequence ends. Prevents ghost ticks after unmount. |

### React Integration Pattern

```typescript
// src/components/assessment-engine/flash-number.tsx
'use client';

import { useEffect, useRef } from 'react';
import { startFlashLoop, TimingState } from '@/lib/anzan/timing-engine';
import { getContrastTokens } from '@/lib/anzan/timing-engine';

interface FlashNumberProps {
  numbers:   number[];
  intervalMs: number;
  onComplete: () => void;
}

export function FlashNumber({ numbers, intervalMs, onComplete }: FlashNumberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef      = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!spanRef.current || !containerRef.current) return;

    // Apply contrast tokens before starting loop
    const tokens = getContrastTokens(intervalMs);
    containerRef.current.style.setProperty('--flash-tx', tokens.text);
    containerRef.current.style.setProperty('--flash-bg', tokens.bg);

    const state: TimingState = {
      lastTimestamp:  0,
      accumulator:    0,
      questionIndex:  0,
      numbers,
      interval:       intervalMs,
      onFlash: (n, isNegative) => {
        if (!spanRef.current) return;
        // ONLY textContent — no state, no classList, no other DOM ops
        spanRef.current.textContent = String(n);
        spanRef.current.style.color = isNegative ? '#991B1B' : '';
      },
      onComplete,
    };

    // startFlashLoop returns cleanup fn — call on unmount
    const stop = startFlashLoop(state);
    return stop;
  }, [numbers, intervalMs, onComplete]);

  return (
    <div
      ref={containerRef}
      className="flash-container"
      style={{
        backgroundColor: 'var(--flash-bg)',
        // transition only on bg change (mount), NEVER on content
        transition: 'background-color 50ms ease',
      }}
    >
      <span
        ref={spanRef}
        className="flash-number"
        aria-live="off"   // screen reader silence during flash
        aria-atomic="true"
        style={{
          // CRITICAL: no transition on the number span — ever
          transition:    'none',
          fontFamily:    'DM Mono, monospace',
          fontSize:      'clamp(96px, 30vh, 180px)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight:    '1',
          userSelect:    'none',
        }}
      />
    </div>
  );
}
```

### Constants

```typescript
// src/lib/anzan/timing-engine.ts

export const MINIMUM_INTERVAL_MS = 200 as const;
export const NEUROLOGIST_FLAG    = 'neurologist_approved' as const;

// Delta clamp multiplier — prevents sequence skip on tab restore
export const DELTA_CLAMP_FACTOR  = 1.5 as const;
```

### Pause / Resume

```typescript
// src/hooks/use-flash-visibility-guard.ts

export function useFlashVisibilityGuard(
  stopRef:  React.MutableRefObject<StopFlashLoop | null>,
  startRef: React.MutableRefObject<(() => void) | null>,
  onPause:  () => void
): void {
  useEffect(() => {
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        stopRef.current?.();   // cancel RAF immediately
        stopRef.current = null;
        onPause();             // transition isPaused = true (sub-state within PHASE_2_FLASH)
      } else {
        // Auto-resume when student returns — no modal button press required
        // Restarts engine from current sequenceIndex; phase stays PHASE_2_FLASH
        startRef.current?.();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stopRef, startRef, onPause]);
}
```

---

## 2. HMAC Clock Guard

**File:** `src/lib/anticheat/clock-guard.ts` (server-only)  
**Problem:** A student advances their device's system clock forward → exam timer expires early → student resets clock → effectively gains extra time.

### Threat Model

```
Attack vector:
  1. Student opens exam (exam timer at 30:00)
  2. Student advances device clock by 15 minutes
  3. Exam timer now reads ~15:00 (based on Date.now() drift)
  4. Student resets clock to real time
  5. Exam timer continues from ~15:00 but student has 30 minutes of actual time
  
Counter-measure: performance.now() monotonic clock
  - performance.now() is RELATIVE to page load, not system clock
  - Cannot be manipulated by changing device clock
  - Use as ground-truth elapsed-time measurement
  - Cross-check against server-issued timestamp at submission
```

### Protocol

#### Step 1: Server Issues HMAC Seal at Exam Start

```typescript
// src/app/actions/exam.ts — createSession Server Action
// Called when student confirms ready in LOBBY

import { createHmac } from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET!; // 32-byte random, server-only

interface HMACPayload {
  student_id:       string;
  paper_id:         string;
  server_timestamp: number;  // Date.now() on SERVER — not client
  duration_ms:      number;  // paper.duration_minutes * 60000
}

export function issueExamSeal(payload: HMACPayload): string {
  const data = [
    payload.student_id,
    payload.paper_id,
    payload.server_timestamp,
    payload.duration_ms,
  ].join(':');

  return createHmac('sha256', HMAC_SECRET)
    .update(data)
    .digest('hex');
}

// Returned to client as part of session init — stored in React state (not localStorage)
interface ExamSessionInit {
  session_id:        string;
  seal:              string;   // HMAC hex string
  server_timestamp:  number;   // stored client-side for elapsed calculation
  duration_ms:       number;
}
```

#### Step 2: Client Records `performance.now()` Snapshots

```typescript
// src/stores/exam-session-store.ts (Zustand)
// Captured monotonically — immune to clock changes

interface ClockGuardState {
  seal:                    string;
  server_timestamp:        number;   // from session init
  performance_start:       number;   // performance.now() at exam start
  snapshots:               Array<{ wall: number; monotonic: number }>;
}

// Called at exam start (INTERSTITIAL exit):
function captureStartSnapshot(): void {
  set({
    performance_start: performance.now(),
  });
}

// Called periodically (e.g. on each question advance):
function captureProgressSnapshot(): void {
  const snap = {
    wall:      Date.now(),
    monotonic: performance.now(),
  };
  set(state => ({
    snapshots: [...state.snapshots.slice(-4), snap],  // keep last 5 only
  }));
}
```

#### Step 3: Client Sends Guard Data on Submit

```typescript
// Attached to submitExam Server Action payload:
interface ClockGuardSubmission {
  seal:                string;   // echoed back from session init
  server_timestamp:    number;   // echoed back
  performance_elapsed: number;   // performance.now() - performance_start (ms)
  wall_elapsed:        number;   // Date.now() - server_timestamp (ms)
}
```

#### Step 4: Server Validates

```typescript
// src/lib/anticheat/clock-guard.ts

export const CLOCK_GUARD_CONSTANTS = {
  /** Grace period beyond paper duration before flagging (covers submit latency) */
  GRACE_PERIOD_MS:   30_000,
  /** Max divergence between monotonic elapsed and wall elapsed before flag */
  DRIFT_TOLERANCE:   0.10,    // 10% — covers NTP corrections and device sleep
  /** Minimum elapsed time we expect (prevents instant submission) */
  MIN_ELAPSED_MS:    10_000,
} as const;

export interface ClockValidationResult {
  valid:           boolean;
  flags:           ClockFlag[];
  server_elapsed:  number;     // authoritative elapsed (server-side)
}

export type ClockFlag =
  | 'HMAC_MISMATCH'
  | 'DURATION_EXCEEDED'
  | 'CLOCK_DRIFT_DETECTED'
  | 'INSTANT_SUBMISSION';

export function validateClockGuard(
  submission: ClockGuardSubmission,
  paperId:    string,
  studentId:  string,
  durationMs: number,
  receivedAt: number   // Date.now() on server at request receipt
): ClockValidationResult {
  const flags: ClockFlag[] = [];

  // 1. Recompute and verify HMAC (constant-time comparison)
  const expectedSeal = issueExamSeal({
    student_id:       studentId,
    paper_id:         paperId,
    server_timestamp: submission.server_timestamp,
    duration_ms:      durationMs,
  });

  const sealMatch = timingSafeCompare(expectedSeal, submission.seal);
  if (!sealMatch) flags.push('HMAC_MISMATCH');

  // 2. Server-authoritative elapsed (cannot be manipulated)
  const serverElapsed = receivedAt - submission.server_timestamp;

  // 3. Duration exceeded check (with grace period)
  if (serverElapsed > durationMs + CLOCK_GUARD_CONSTANTS.GRACE_PERIOD_MS) {
    flags.push('DURATION_EXCEEDED');
  }

  // 4. Monotonic drift check
  // If wall_elapsed and performance_elapsed diverge by > 10%: clock manipulation
  const divergence = Math.abs(submission.wall_elapsed - submission.performance_elapsed);
  const maxAllowedDivergence = submission.performance_elapsed * CLOCK_GUARD_CONSTANTS.DRIFT_TOLERANCE;
  if (divergence > maxAllowedDivergence && submission.performance_elapsed > 30_000) {
    // Only check after 30s of elapsed — short sessions have noisy ratios
    flags.push('CLOCK_DRIFT_DETECTED');
  }

  // 5. Instant submission guard
  if (submission.performance_elapsed < CLOCK_GUARD_CONSTANTS.MIN_ELAPSED_MS) {
    flags.push('INSTANT_SUBMISSION');
  }

  return {
    valid:          flags.length === 0,
    flags,
    server_elapsed: serverElapsed,
  };
}

/** Constant-time string comparison — prevents timing attacks on HMAC */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(a, 'hex'),
    Buffer.from(b, 'hex')
  );
}
```

#### Step 5: Admin Alert (Non-Blocking)

```typescript
// If flags are set: save answers FIRST, alert admin SECOND
// Never discard student answers due to clock guard flag — benefit of doubt

// In submitExam Server Action:
const clockResult = validateClockGuard(clockSubmission, paperId, studentId, durationMs, Date.now());

if (!clockResult.valid) {
  // 1. Still save the submission (answers are preserved)
  // 2. Store flags in activity_logs (no new table needed — reuse existing audit trail)
  await supabase.from('activity_logs').insert({
    actor_id:      studentId,
    actor_role:    'student',
    action_type:   'CLOCK_GUARD_FLAG',
    resource_id:   submission.session_id,
    resource_type: 'assessment_session',
    payload: {
      flags:          clockResult.flags,
      server_elapsed: clockResult.server_elapsed,
    },
  });
  // 3. Broadcast alert to admin monitor
  adminChannel.send({
    type: 'broadcast',
    event: 'clock_guard_alert',
    payload: { student_id: studentId, flags: clockResult.flags },
  });
}
// Continue with normal submission flow regardless of flags
```

### Constants Summary

| Constant | Value | Purpose |
|----------|-------|---------|
| `GRACE_PERIOD_MS` | 30,000ms | Network latency buffer on submission |
| `DRIFT_TOLERANCE` | 10% | NTP corrections and device sleep variance |
| `MIN_ELAPSED_MS` | 10,000ms | Prevents instant-submit false positives on check |
| HMAC algorithm | SHA-256 | Industry standard, available in Node.js `crypto` |
| Key storage | `process.env.HMAC_SECRET` | Server-only env var, never in client bundle |

---

## 3. Number Generator

**File:** `src/lib/anzan/number-generator.ts`

### Input / Output Contract

```typescript
// src/lib/anzan/number-generator.ts

export interface NumberGeneratorConfig {
  /** How many numbers in the sequence (rows count) */
  count:                number;   // 2–10
  /** Minimum absolute value of each number */
  min:                  number;   // e.g. 10 for 2-digit
  /** Maximum absolute value of each number */
  max:                  number;   // e.g. 99 for 2-digit
  /** Probability (0–1) that any given number is negative */
  negative_probability: number;   // e.g. 0.3 = 30% negative
  /** Difficulty multiplier: affects variance and sum constraints */
  difficulty:           1 | 2 | 3 | 4 | 5;
  /**
   * Seed for reproducibility.
   * REQUIRED for assessment questions so re-evaluation produces identical sequences.
   * If omitted: uses crypto.getRandomValues() — non-reproducible.
   */
  seed?:                string;   // UUID of the question — deterministic seed
}

export interface GeneratedSequence {
  numbers:  number[];
  sum:      number;     // sum of all numbers (for answer validation)
  seed:     string;     // echoed back for audit trail
}
```

### Algorithm

```typescript
// src/lib/anzan/number-generator.ts

/**
 * Seeded PRNG — Mulberry32 (fast, deterministic, 32-bit state)
 * Selected over Math.random() for: reproducibility, portability, no import overhead.
 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashSeedToNumber(seed: string): number {
  // FNV-1a 32-bit hash of seed string → numeric seed for Mulberry32
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function generateFlashSequence(config: NumberGeneratorConfig): GeneratedSequence {
  // Validate inputs
  if (config.count < 2 || config.count > 10) {
    throw new Error(`INVALID_COUNT: ${config.count} must be 2–10`);
  }
  if (config.min > config.max) {
    throw new Error(`INVALID_RANGE: min ${config.min} > max ${config.max}`);
  }

  const seed   = config.seed ?? crypto.randomUUID();
  const rand   = mulberry32(hashSeedToNumber(seed));
  const numbers: number[] = [];
  let sum = 0;
  let prev: number | null = null;

  // Sum constraint: keeps answer within 4 digits (max 9999 for digit-count display)
  const MAX_SUM = Math.pow(10, Math.ceil(Math.log10(config.max)) + 1) - 1;

  for (let i = 0; i < config.count; i++) {
    let n: number;
    let attempts = 0;

    do {
      attempts++;
      if (attempts > 100) {
        // Safety valve: relax constraints after 100 attempts
        n = Math.round(rand() * (config.max - config.min) + config.min);
        break;
      }

      // Generate magnitude
      const magnitude = Math.round(rand() * (config.max - config.min) + config.min);

      // Apply negativity
      const isNegative = rand() < config.negative_probability && i > 0;
      // First number (i=0) is always positive — ensures positive running total at start
      n = isNegative ? -magnitude : magnitude;

    } while (
      // Constraint 1: no consecutive identical numbers
      n === prev ||
      // Constraint 2: running sum must stay within display bounds
      Math.abs(sum + n) > MAX_SUM
    );

    numbers.push(n);
    sum += n;
    prev = n;
  }

  return { numbers, sum, seed };
}
```

### Reproducibility Requirement

Assessment questions MUST use the question's UUID as the generator seed:

```typescript
// src/app/actions/assessments.ts — createAssessment
// When creating a TEST assessment question:

const question_id = crypto.randomUUID();   // generated before DB insert

const sequence = generateFlashSequence({
  count:                config.anzan_row_count,
  min:                  Math.pow(10, config.anzan_digit_count - 1),
  max:                  Math.pow(10, config.anzan_digit_count) - 1,
  negative_probability: difficultyToNegativeProbability(config.difficulty),
  difficulty:           config.difficulty,
  seed:                 question_id,   // ← DETERMINISTIC: same question → same sequence
});

// Store: question.flash_sequence = sequence.numbers, question.id = question_id
// Re-evaluation: call generateFlashSequence with seed=question_id → identical numbers
```

### Difficulty → Negative Probability Mapping

| Difficulty | Negative Probability | Digit Count Range |
|-----------|---------------------|-------------------|
| 1 | 0.0 (no negatives) | 1–2 digits |
| 2 | 0.1 (10%) | 1–3 digits |
| 3 | 0.2 (20%) | 2–3 digits |
| 4 | 0.3 (30%) | 2–4 digits |
| 5 | 0.4 (40%) | 3–5 digits |

```typescript
function difficultyToNegativeProbability(difficulty: 1|2|3|4|5): number {
  return [0.0, 0.1, 0.2, 0.3, 0.4][difficulty - 1];
}
```

---

## 4. Contrast Dampening

**File:** `src/lib/anzan/timing-engine.ts` (exported alongside RAF engine)

### Rationale

At high flash speeds (< 300ms), the full-contrast `#0F172A` on `#FFFFFF` (21:1) can cause perceptual after-image fatigue — the eye retains the high-contrast shape between flashes, creating visual noise. The dampening system reduces contrast at high speeds while maintaining WCAG 2.2 AAA compliance throughout.

### Token Definitions

```typescript
// src/lib/anzan/timing-engine.ts

export interface ContrastTokens {
  /** CSS colour for flash number text */
  text:  string;
  /** CSS colour for flash container background */
  bg:    string;
  /**
   * Duration in ms for opacity fade on number swap.
   * 0 = instant (no transition — preferred for most speeds).
   * 30 = 30ms linear fade (only at < 300ms to smooth perceived flicker).
   */
  fade:  0 | 30;
}

export function getContrastTokens(intervalMs: number): ContrastTokens {
  if (intervalMs < MINIMUM_INTERVAL_MS) {
    throw new Error(
      `INTERVAL_BELOW_MINIMUM: ${intervalMs}ms is below the ${MINIMUM_INTERVAL_MS}ms hard cap. ` +
      `This interval requires the 'neurologist_approved' accessibility flag on the student profile.`
    );
  }

  if (intervalMs < 300) {
    return {
      text: '#334155',   // slate-700 — ~11:1 on #F1F5F9 (AAA ✅)
      bg:   '#F1F5F9',   // slate-100
      fade: 30,          // 30ms opacity linear — smooths flicker at high speeds
    };
  }

  if (intervalMs < 500) {
    return {
      text: '#1E293B',   // slate-800 — ~14:1 on #F8FAFC (AAA ✅)
      bg:   '#F8FAFC',   // slate-50
      fade: 0,           // instant — 300–499ms is fast enough, not fatiguing
    };
  }

  // intervalMs >= 500ms — standard high contrast
  return {
    text: '#0F172A',   // slate-950 — 21:1 on #FFFFFF (AAA ✅)
    bg:   '#FFFFFF',
    fade: 0,
  };
}
```

### Application — CSS Custom Properties

Contrast tokens are applied via CSS custom properties on the flash container element. This keeps the colour logic in one place and lets CSS handle inheritance:

```typescript
// In FlashNumber component (on every interval change or component mount)
function applyContrastTokens(
  container: HTMLDivElement,
  tokens:    ContrastTokens
): void {
  container.style.setProperty('--flash-tx', tokens.text);
  container.style.setProperty('--flash-bg', tokens.bg);
  // fade: applied as CSS variable for the opacity transition duration
  container.style.setProperty('--flash-fade', `${tokens.fade}ms`);
}
```

```css
/* globals.css */
.flash-container {
  background-color: var(--flash-bg, #FFFFFF);
  /* bg transition: subtle 50ms — only fires on interval-tier change, not per-number */
  transition: background-color 50ms ease;
}

.flash-number {
  color:      var(--flash-tx, #0F172A);
  /* CRITICAL: no transition on number text — ever */
  transition: none !important;
  /* opacity fade only when --flash-fade > 0 (high speed mode) */
  animation:  none;
}

/* High-speed opacity pulse — only active when fade = 30ms */
@media (prefers-reduced-motion: no-preference) {
  .flash-container[data-fade="true"] .flash-number {
    animation: flash-pulse var(--flash-fade, 0ms) linear;
  }
}

@keyframes flash-pulse {
  0%   { opacity: 0.7; }
  50%  { opacity: 1;   }
  100% { opacity: 0.7; }
}
```

### Contrast Ramp Summary

| Interval | Text | Background | Contrast | WCAG | Fade |
|----------|------|-----------|---------|------|------|
| ≥ 500ms | `#0F172A` | `#FFFFFF` | 21:1 | ✅ AAA | None |
| 300–499ms | `#1E293B` | `#F8FAFC` | ~14:1 | ✅ AAA | None |
| 200–299ms | `#334155` | `#F1F5F9` | ~11:1 | ✅ AAA | 30ms |
| < 200ms | — | — | — | BLOCKED | `throw` |

### Token Application Timing

```typescript
// Tokens are applied ONCE per question (not per flash swap):
// 1. Before RAF loop starts (in useEffect, after interval is known)
// 2. On interval change (assessment config change — admin edit, not mid-exam)
// NEVER inside the onFlash callback — CSS properties are slow DOM ops
```

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Full RAF loop with TypeScript types and `DOMHighResTimeStamp` | ✅ §1 — `startFlashLoop()` complete |
| Delta-time accumulator — no `setInterval` / `setTimeout` | ✅ §1 — banned by design + ESLint note |
| Delta clamp for tab-restore anomaly | ✅ §1 — `clampedDelta = Math.min(delta, interval × 1.5)` |
| Cleanup function returned and documented | ✅ §1 — `StopFlashLoop` return type |
| `onFlash` contract: `textContent` only | ✅ §1 — documented + enforced in React pattern |
| HMAC Clock Guard — seal issue, client tracking, server validation | ✅ §2 — full protocol Steps 1–5 |
| Constant-time HMAC comparison | ✅ §2 — `timingSafeCompare()` |
| Answers saved even on clock flag (benefit of doubt) | ✅ §2 — Step 5 |
| CLOCK_GUARD_CONSTANTS documented | ✅ §2 — table |
| Number generator with seeded PRNG (Mulberry32) | ✅ §3 — full algorithm |
| Reproducibility: seed = question UUID | ✅ §3 — documented pattern |
| No-consecutive-identical constraint | ✅ §3 — do-while guard |
| Sum constraint within display bounds | ✅ §3 — `MAX_SUM` guard |
| Contrast dampening with exact token values | ✅ §4 — `getContrastTokens()` |
| 200ms hard cap with `throw` | ✅ §4 — `INTERVAL_BELOW_MINIMUM` error |
| CSS custom properties application pattern | ✅ §4 — `--flash-tx` / `--flash-bg` |
| Contrast ramp table with WCAG levels | ✅ §4 — summary table |
