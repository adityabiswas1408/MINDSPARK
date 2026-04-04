/**
 * Vitest global setup — mocks browser APIs that don't exist in jsdom
 * and provides test helpers for timing-critical code.
 *
 * Loaded via vitest.config.ts → test.setupFiles.
 * Also importable in test files to access advanceRaf().
 */

let rafCallbacks: Array<(t: number) => void> = [];
let currentTime = 0;

global.requestAnimationFrame = (cb: FrameRequestCallback): number => {
  rafCallbacks.push(cb as (t: number) => void);
  return rafCallbacks.length; // handle = index (good enough for tests)
};

global.cancelAnimationFrame = (): void => {
  rafCallbacks = [];
};

/**
 * Advance the mock clock by `ms` milliseconds and flush all pending RAF callbacks.
 *
 * Callbacks scheduled DURING flush (i.e. the next loop frame) are NOT fired
 * in the same advanceRaf call — they wait for the next advanceRaf call.
 * This mirrors real browser RAF behaviour.
 */
export function advanceRaf(ms: number): void {
  currentTime += ms;
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  cbs.forEach((cb) => cb(currentTime));
}

/**
 * Reset mock state between test suites.
 * Call in afterEach / afterAll if tests share the module instance.
 */
export function resetRafMock(): void {
  rafCallbacks = [];
  currentTime = 0;
}
