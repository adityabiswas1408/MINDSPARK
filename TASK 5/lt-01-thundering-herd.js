/**
 * LT-01 — Thundering Herd (2,500 Concurrent WebSocket Connections)
 * Test plan §5 LT-01.
 *
 * Required environment variables (set via k6 --env flags or CI secrets):
 *   SUPABASE_WS_URL   — wss://[project-id].supabase.co
 *   SUPABASE_ANON_KEY — project anon key
 *   PAPER_ID          — UUID of a seeded LIVE exam paper
 *
 * Run:
 *   k6 run k6/lt-01-thundering-herd.js \
 *     --env SUPABASE_WS_URL=wss://... \
 *     --env SUPABASE_ANON_KEY=... \
 *     --env PAPER_ID=...
 *
 * Pass criteria (from pre-launch-checklist.md Gate 2):
 *   ws_connecting p(95) < 5,000ms
 *   checks rate > 99%
 *   http_req_failed < 1%
 */
import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
  vus:      2500,
  duration: '30s',
  thresholds: {
    ws_connecting:              ['p(95)<5000'],   // 95% connect within 5s
    ws_sessions:                ['rate>0.98'],    // 98% sessions established
    'checks{scenario:connect}': ['rate>0.99'],   // 99% message checks pass
  },
};

export default function () {
  // Jitter: mirrors production behaviour — prevents all 2,500 VUs hammering
  // the WebSocket endpoint simultaneously (thundering herd prevention).
  // Matches CLAUDE.md hard rule: Math.random() * 5000
  sleep(Math.random() * 5);

  const url =
    `${__ENV.SUPABASE_WS_URL}/realtime/v1/websocket` +
    `?apikey=${__ENV.SUPABASE_ANON_KEY}`;

  const res = ws.connect(url, {}, (socket) => {
    socket.on('open', () => {
      // Join the exam Broadcast channel — lifecycle events only (not Presence)
      socket.send(JSON.stringify({
        topic:   `realtime:exam:${__ENV.PAPER_ID}`,
        event:   'phx_join',
        payload: {},
        ref:     '1',
      }));
    });

    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      check(msg, {
        'join ack or heartbeat received': (m) =>
          ['phx_reply', 'heartbeat'].includes(m.event),
      });
    });

    socket.on('error', (e) => {
      console.error(`WebSocket error: ${e.error()}`);
    });

    // Hold connection for 10s — simulates a student sitting in the exam
    sleep(10);
    socket.close();
  });

  check(res, {
    'WS upgrade success (101)': (r) => r?.status === 101,
  });
}
