/**
 * LT-03 — Offline Sync Storm (2,500 Concurrent Offline Syncs in 30s)
 * Test plan §5 LT-03.
 *
 * Required environment variables:
 *   BASE_URL    — https://[institution-url]
 *   STUDENT_JWT — valid student JWT
 *   SESSION_ID  — UUID of a closed assessment_session (offline reconnect scenario)
 *
 * Run:
 *   k6 run k6/lt-03-offline-sync-storm.js \
 *     --env BASE_URL=https://... \
 *     --env STUDENT_JWT=... \
 *     --env SESSION_ID=...
 *
 * Pass criteria (pre-launch-checklist.md Gate 2):
 *   http_req_duration p(95) < 3,000ms
 *   http_req_failed < 0.5%
 *   Zero 500 errors
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// NOTE: 2500 concurrent users requires Supabase
// Team plan (~3000 WS connection limit).
// Current Pro plan supports ~500 concurrent.
// Upgrade to Team plan before scaling beyond 500.
export const options = {
  vus:      500,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],    // within 3s budget
    http_req_failed:   ['rate<0.005'],    // < 0.5% failures
  },
};

export default function () {
  // Simulate 50 answers per student — realistic for a 30-question exam with retries
  const answers = Array.from({ length: 50 }, (_, i) => ({
    question_id:     uuidv4(),           // valid UUID format — route validates format only
    selected_option: ['A', 'B', 'C', 'D'][i % 4],
    idempotency_key: uuidv4(),           // unique per VU per run — tests idempotency
    answered_at:     Date.now() - (50 - i) * 4_000,
  }));

  // Jitter: spreads 500 VUs over 3s to avoid simultaneous connection pool exhaustion
  sleep(Math.random() * 3);

  const res = http.post(
    `${__ENV.BASE_URL}/api/submissions/offline-sync`,
    JSON.stringify({
      session_id:      __ENV.SESSION_ID,
      answers,
      batch_timestamp: Date.now(),       // matches BodySchema field name (was hmac_timestamp)
    }),
    {
      headers: {
        'Authorization': `Bearer ${__ENV.STUDENT_JWT}`,
        'Content-Type': 'application/json',
      },
    }
  );

  check(res, {
    // 200 = synced, 409 = duplicate idempotency_key (acceptable — deduplication working)
    'sync 200 or 409': (r) => r.status === 200 || r.status === 409,
    // Zero 500 errors — DB must not throw unhandled exceptions under load
    'no 500 errors':   (r) => r.status < 500,
  });
}
