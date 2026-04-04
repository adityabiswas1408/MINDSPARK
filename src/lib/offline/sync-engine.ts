import { db, type PendingAnswer } from '@/lib/offline/indexed-db-store';
import { createClient } from '@/lib/supabase/client';

let isSyncing = false;
let isStarted = false;

async function flushOfflineQueue() {
  if (isSyncing || typeof window === 'undefined') return;
  if (!navigator.onLine) return; // Strict offline guard

  isSyncing = true;

  try {
    const unsyncedAnswers = await db.pendingAnswers
      .filter((record) => record.synced === false)
      .toArray();

    if (unsyncedAnswers.length === 0) {
      isSyncing = false;
      return;
    }

    const supabase = createClient();
    
    // 1. MUST validate the session with the server via getUser() 
    // to prevent offline-sync silently failing with a stale token.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      isSyncing = false;
      return;
    }

    // 2. Safely extract the token ONLY after server verification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      isSyncing = false;
      return;
    }

    const sessionMap = new Map<string, PendingAnswer[]>();
    for (const ans of unsyncedAnswers) {
      const group = sessionMap.get(ans.session_id) || [];
      group.push(ans);
      sessionMap.set(ans.session_id, group);
    }

    for (const [sessionId, answers] of Array.from(sessionMap.entries())) {
      const batchTimestamp = Date.now();
      const hmacInput = `${sessionId}:${batchTimestamp}`;
      const secret = process.env.NEXT_PUBLIC_OFFLINE_SYNC_SECRET ?? '';
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign(
        'HMAC',
        keyMaterial,
        new TextEncoder().encode(hmacInput)
      );
      const hmacTimestamp = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const payload = {
        session_id: sessionId,
        answers: answers.map((a: PendingAnswer) => ({
          question_id: a.question_id,
          selected_option: a.selected_option,
          answered_at: a.answered_at,
          idempotency_key: a.idempotency_key,
        })),
        hmac_timestamp: hmacTimestamp,
        batch_timestamp: batchTimestamp,
      };

      const response = await fetch('/api/submissions/offline-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.synced && Array.isArray(result.synced)) {
          await Promise.all(
            result.synced.map((key: string) => 
              db.pendingAnswers.update(key, { synced: true })
            )
          );
        }
      }
    }
  } catch (error) {
    console.error('Offline sync failed on client. Retrying on next connection:', error);
  } finally {
    isSyncing = false;
  }
}

const onlineListener = () => flushOfflineQueue();

export function startSyncEngine() {
  if (typeof window === 'undefined' || isStarted) return;
  isStarted = true;
  
  window.addEventListener('online', onlineListener);
  
  if (navigator.onLine) {
    flushOfflineQueue();
  }
}

export function stopSyncEngine() {
  if (typeof window === 'undefined' || !isStarted) return;
  isStarted = false;
  
  window.removeEventListener('online', onlineListener);
}
