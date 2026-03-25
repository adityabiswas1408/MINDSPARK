/**
 * Teardown — fires a keepalive POST to /api/submissions/teardown on pagehide.
 *
 * Ensures unsynced answers reach the server even when the student
 * closes the tab, navigates away, or the browser kills the page.
 *
 * Plain TypeScript module — no React imports.
 * Browser-only: guarded against SSR via typeof window check.
 *
 * CLAUDE.md Rule 10: Teardown MUST use a Route Handler (stable URL),
 * NOT a Server Action (URL changes on navigation).
 */

import { db } from '@/lib/offline/indexed-db-store';
import { createClient } from '@/lib/supabase/client';
import { useExamSessionStore } from '@/stores/exam-session-store';

let isRegistered = false;

async function handlePageHide(): Promise<void> {
  try {
    const state = useExamSessionStore.getState();
    const sessionId = state.sessionId;
    if (!sessionId) return;

    // 1. Snapshot all pending answers from Dexie for this session
    const pendingAnswers = await db.pendingAnswers
      .where('session_id')
      .equals(sessionId)
      .toArray();

    // 2. Get JWT access token — cookies unreliable on pagehide
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    // 3. POST with keepalive: true — browser allows completion after page unload
    //    Body limit for keepalive: 64KB — answers snapshot is well within this
    //    for up to 50 questions (~3KB total)
    fetch('/api/submissions/teardown', {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
        answers_snapshot: pendingAnswers.map((a) => ({
          question_id: a.question_id,
          selected_option: a.selected_option,
          answered_at: a.answered_at,
          idempotency_key: a.idempotency_key,
        })),
        client_timestamp: Date.now(),
      }),
    });
    // No await on response — keepalive fires and forgets
  } catch {
    // Swallow errors — pagehide must never throw
  }
}

/**
 * Registers the pagehide listener. Idempotent — safe to call multiple times.
 */
export function registerTeardownListener(): void {
  if (typeof window === 'undefined') return;
  if (isRegistered) return;

  window.addEventListener('pagehide', handlePageHide);
  isRegistered = true;
}

/**
 * Removes the pagehide listener. Safe to call even if never registered.
 */
export function removeTeardownListener(): void {
  if (typeof window === 'undefined') return;
  if (!isRegistered) return;

  window.removeEventListener('pagehide', handlePageHide);
  isRegistered = false;
}
