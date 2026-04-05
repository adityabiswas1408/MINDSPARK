/**
 * sync-engine.ts — Offline Answer Queue Flush
 *
 * Reads unsynced answers from IndexedDB (Dexie) and POSTs them to
 * /api/submissions/offline-sync. HMAC is generated SERVER-SIDE in the
 * route handler using HMAC_SECRET — the secret never touches the browser.
 *
 * Guards:
 *  - isSyncing flag prevents concurrent flush attempts (race condition fix)
 *  - navigator.onLine check prevents wasted requests
 *  - getUser() server-validates JWT before using the token
 */

import { db, type PendingAnswer } from '@/lib/offline/indexed-db-store';
import { createClient } from '@/lib/supabase/client';

let isSyncing  = false;
let isStarted  = false;

async function flushOfflineQueue(): Promise<void> {
  if (isSyncing || typeof window === 'undefined') return;
  if (!navigator.onLine) return;

  isSyncing = true;

  try {
    const unsyncedAnswers = await db.pendingAnswers
      .filter((r) => r.synced === false)
      .toArray();

    if (unsyncedAnswers.length === 0) {
      isSyncing = false;
      return;
    }

    const supabase = createClient();

    // Server-validate the JWT before using it
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { isSyncing = false; return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { isSyncing = false; return; }

    // Group answers by session_id — one POST per session
    const sessionMap = new Map<string, PendingAnswer[]>();
    for (const ans of unsyncedAnswers) {
      const group = sessionMap.get(ans.session_id) ?? [];
      group.push(ans);
      sessionMap.set(ans.session_id, group);
    }

    for (const [sessionId, answers] of Array.from(sessionMap.entries())) {
      // HMAC is generated server-side in the route handler.
      // Client only sends session_id + batch_timestamp.
      // No secret ever appears in the browser bundle.
      const payload = {
        session_id:      sessionId,
        answers:         answers.map((a: PendingAnswer) => ({
          question_id:     a.question_id,
          selected_option: a.selected_option,
          answered_at:     a.answered_at,
          idempotency_key: a.idempotency_key,
        })),
        batch_timestamp: Date.now(),
      };

      const response = await fetch('/api/submissions/offline-sync', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        // Route returns synced_keys (array of idempotency_key strings)
        if (result.synced_keys && Array.isArray(result.synced_keys)) {
          await Promise.all(
            result.synced_keys.map((key: string) =>
              db.pendingAnswers.update(key, { synced: true })
            )
          );
        }
      }
    }
  } catch (error) {
    console.error('[SyncEngine] Flush failed — will retry on next connection:', error);
  } finally {
    isSyncing = false;
  }
}

const onlineListener = () => flushOfflineQueue();

export function startSyncEngine(): void {
  if (typeof window === 'undefined' || isStarted) return;
  isStarted = true;
  window.addEventListener('online', onlineListener);
  if (navigator.onLine) flushOfflineQueue();
}

export function stopSyncEngine(): void {
  if (typeof window === 'undefined' || !isStarted) return;
  isStarted = false;
  window.removeEventListener('online', onlineListener);
}
