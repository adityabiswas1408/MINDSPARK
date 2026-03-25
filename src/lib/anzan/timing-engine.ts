export interface TimingState {
  /** performance.now() value from the previous RAF frame. 0 on first frame. */
  lastTimestamp: number;
  /** Accumulated delta since last flash swap. Carries surplus forward (prevents drift). */
  accumulator: number;
  /** Index into numbers[] — which number to flash next. */
  questionIndex: number;
  /** Ordered flash sequence for this question. Set once before loop starts. */
  numbers: number[];
  /** Flash interval in ms — from admin anzan_config.delay_ms. Min 200ms. */
  interval: number;
  /** Called synchronously inside RAF — must only set element.textContent. */
  onFlash: (n: number, isNegative: boolean) => void;
  /** Called when all numbers in sequence have been displayed. */
  onComplete: () => void;
}

/** Return value: cleanup function — call to cancel RAF on unmount. */
export type StopFlashLoop = () => void;

export const MINIMUM_INTERVAL_MS = 200 as const;
export const NEUROLOGIST_FLAG = 'neurologist_approved' as const;

// Delta clamp multiplier — prevents sequence skip on tab restore
export const DELTA_CLAMP_FACTOR = 1.5 as const;

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
  // Use let inside the closure to allow updates without mutating caller state unnecessarily,
  // but the spec expects state fields to be mutated if they were intended as refs.
  // Actually, specs says "mutate shared state ref", let's use the object directly.

  function loop(timestamp: number): void {
    // First frame: initialise reference point (no delta computed)
    if (state.lastTimestamp === 0) {
      state.lastTimestamp = timestamp;
      animFrame = requestAnimationFrame(loop);
      return;
    }

    const delta = timestamp - state.lastTimestamp;
    state.lastTimestamp = timestamp;

    // Guard: ignore anomalously large deltas (tab hidden, GC pause > 500ms)
    // Treat as if a single interval elapsed — prevents sequence skip
    const clampedDelta = Math.min(delta, state.interval * DELTA_CLAMP_FACTOR);
    state.accumulator += clampedDelta;

    if (state.accumulator >= state.interval) {
      const n = state.numbers[state.questionIndex];

      // onFlash: ONLY sets element.textContent — no state, no classList
      state.onFlash(n, n < 0);

      // Subtract exactly one interval — surplus carries forward (zero drift)
      state.accumulator -= state.interval;
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
  state.accumulator = 0;
  animFrame = requestAnimationFrame(loop);

  // Return cleanup handle
  return () => cancelAnimationFrame(animFrame);
}

export interface ContrastTokens {
  /** CSS colour for flash number text */
  text: string;
  /** CSS colour for flash container background */
  bg: string;
  /**
   * Duration in ms for opacity fade on number swap.
   * 0 = instant (no transition — preferred for most speeds).
   * 30 = 30ms linear fade (only at < 300ms to smooth perceived flicker).
   */
  fade: 0 | 30;
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
      text: '#334155', // slate-700 — ~11:1 on #F1F5F9 (AAA ✅)
      bg: '#F1F5F9', // slate-100
      fade: 30, // 30ms opacity linear — smooths flicker at high speeds
    };
  }

  if (intervalMs < 500) {
    return {
      text: '#1E293B', // slate-800 — ~14:1 on #F8FAFC (AAA ✅)
      bg: '#F8FAFC', // slate-50
      fade: 0, // instant — 300–499ms is fast enough, not fatiguing
    };
  }

  // intervalMs >= 500ms — standard high contrast
  return {
    text: '#0F172A', // slate-950 — 21:1 on #FFFFFF (AAA ✅)
    bg: '#FFFFFF',
    fade: 0,
  };
}

export function validateFlashInterval(
  intervalMs: number,
  studentFlags: string[]
): void {
  if (intervalMs < MINIMUM_INTERVAL_MS) {
    if (!studentFlags.includes(NEUROLOGIST_FLAG)) {
      throw new Error(
        'Flash interval below 200ms requires neurologist profile flag'
      );
    }
  }
}
