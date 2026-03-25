/**
 * Tab Monitor — tracks how many times the student switches away
 * from the assessment tab during an active exam session.
 *
 * Stores an aggregate count only — never individual timestamps,
 * never analytics, never localStorage.
 *
 * Plain TypeScript module — no React imports.
 * Browser-only: guarded against SSR via typeof window check.
 */

import { useExamSessionStore } from '@/stores/exam-session-store';

let tabSwitchCount = 0;
let removeListener: (() => void) | null = null;

function handleVisibilityChange(): void {
  if (document.hidden) {
    tabSwitchCount++;
    // Write aggregate count to Zustand store — no timestamps, no event log
    useExamSessionStore.getState().setTabSwitchCount(tabSwitchCount);
  }
}

/**
 * Starts monitoring tab switches. Increments a module-level counter
 * on each visibilitychange → hidden event and pushes the aggregate
 * count to the exam session store.
 *
 * @returns A cleanup function that removes the event listener and resets the counter.
 */
export function startTabMonitor(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Reset counter on fresh start
  tabSwitchCount = 0;
  useExamSessionStore.getState().setTabSwitchCount(0);

  document.addEventListener('visibilitychange', handleVisibilityChange);

  removeListener = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    removeListener = null;
  };

  return removeListener;
}

/**
 * Imperatively stops the tab monitor. Safe to call multiple times.
 */
export function stopTabMonitor(): void {
  removeListener?.();
  tabSwitchCount = 0;
}
