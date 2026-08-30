/**
 * LT-02 — Heartbeat Storm (2,500 Simultaneous Heartbeats per 5-Second Window)
 * Test plan §5 LT-02.
 *
 * Required environment variables:
 *   SUPABASE_URL  — https://[project-id].supabase.co
 *   STUDENT_JWT   — valid student JWT for a seeded session
 *   SESSION_ID    — UUID of an open assessment_session
 *
 * Run:
 *   k6 run k6/lt-02-heartbeat-storm.js \
 *     --env SUPABASE_URL=https://... \
 *     --env STUDENT_JWT=... \
 *     --env SESSION_ID=...
 *
 * Pass criteria (pre-launch-checklist.md Gate 2):
 *   http_req_duration p(95) < 500ms
 *   http_req_failed < 1%
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus:      2500,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<500'],   // Supabase must stay responsive under load
    http_req_failed:   ['rate<0.01'],   // < 1% failure rate
  },
};

export default function () {
  // Each VU sends a heartbeat every 5s — matches production HEARTBEAT_INTERVAL_MS = 5000
  // (src/lib/constants.ts)
  sleep(5);

  const res = http.post(
    `${__ENV.SUPABASE_URL}/rest/v1/rpc/heartbeat_ping`,
    JSON.stringify({ session_id: __ENV.SESSION_ID }),
    {
      headers: {
        'Authorization': `Bearer ${__ENV.STUDENT_JWT}`,
        'Content-Type': 'application/json',
      },
    }
  );

  check(res, {
    'heartbeat 200': (r) => r.status === 200,
  });
}
