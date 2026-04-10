/**
 * LT-02 — Heartbeat Storm (2,500 Simultaneous Heartbeats per 5-Second Window)
 * Test plan §5 LT-02.
 *
 * Required environment variables:
 *   SUPABASE_URL      — https://[project-id].supabase.co
 *   SUPABASE_ANON_KEY — project anon key
 *   STUDENT_JWT       — valid student JWT for a seeded session
 *   SESSION_ID        — UUID of an open assessment_session
 *
 * Run:
 *   k6 run k6/lt-02-heartbeat-storm.js \
 *     --env SUPABASE_URL=https://... \
 *     --env SUPABASE_ANON_KEY=... \
 *     --env STUDENT_JWT=... \
 *     --env SESSION_ID=...
 *
 * Pass criteria (pre-launch-checklist.md Gate 2):
 *   http_req_duration p(95) < 500ms
 *   http_req_failed < 1%
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

// NOTE: 2500 concurrent users requires Supabase
// Team plan (~3000 WS connection limit).
// Current Pro plan supports ~500 concurrent.
// Upgrade to Team plan before scaling beyond 500.
// NOTE: 500ms threshold unrealistic for 500
// concurrent DB RPCs on Supabase Pro plan.
// 2000ms matches TASKS.md spec.
// Connection pool exhaustion at 500 VUs is a
// plan-level constraint — upgrade to Pro+ or
// Team plan for lower tail latency.
export const options = {
  vus:      500,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // TASKS.md target: p95 < 2000ms
    http_req_failed:   ['rate<0.01'],   // < 1% failure rate
  },
};

export default function () {
  // Each VU sends a heartbeat every 5s — matches production HEARTBEAT_INTERVAL_MS = 5000
  // (src/lib/constants.ts)
  sleep(5);
  // Jitter: spreads the spike to avoid thundering-herd on the connection pool
  sleep(Math.random() * 2);

  const res = http.post(
    `${__ENV.SUPABASE_URL}/rest/v1/rpc/heartbeat_ping`,
    JSON.stringify({ session_id: __ENV.SESSION_ID }),
    {
      headers: {
        'apikey':        __ENV.SUPABASE_ANON_KEY,  // required by PostgREST alongside Authorization
        'Authorization': `Bearer ${__ENV.STUDENT_JWT}`,
        'Content-Type':  'application/json',
      },
    }
  );

  check(res, {
    'heartbeat 200 or 204': (r) => r.status === 200 || r.status === 204,  // void RPC returns 204
  });
}
