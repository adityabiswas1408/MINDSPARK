# MINDSPARK V1 — Performance Budget Document

> **Document type:** Performance Engineering — Build Support  
> **Version:** 1.0  
> **Output path:** `docs/performance-budget.md`  
> **Read first:** `docs/fsd.md` §2 · `docs/architecture.md`  
> **Author role:** Principal Performance Engineer — browser rendering · Next.js · real-time web applications

---

## Table of Contents

1. [Budget Summary Table](#1-budget-summary-table)
2. [Flash Anzan Number Display Latency](#2-flash-anzan-number-display-latency)
3. [WebSocket Connection Budget](#3-websocket-connection-budget)
4. [Offline Sync Flush Budget](#4-offline-sync-flush-budget)
5. [Core Web Vitals Targets](#5-core-web-vitals-targets)
6. [JavaScript Bundle Budget](#6-javascript-bundle-budget)
7. [Route-Specific Code Splitting](#7-route-specific-code-splitting)
8. [Measurement Tools & CI Integration](#8-measurement-tools--ci-integration)
9. [k6 Load Test Specification](#9-k6-load-test-specification)

---

## 1. Budget Summary Table

| Budget | Target | Failure Threshold | Measured By |
|--------|--------|------------------|-------------|
| Flash number display | ≤ 16.6ms (1 frame @ 60fps) | > 33ms on any device | `performance.mark()` |
| Flash number @ 120fps display | ≤ 8.3ms | > 16.6ms | `performance.mark()` |
| WebSocket connect (incl. jitter) | ≤ 5,000ms | > 8,000ms | Channel subscribe → heartbeat |
| Offline sync flush (50 answers) | ≤ 3,000ms | > 5,000ms | Reconnect → `sync_status = 'verified'` |
| Admin dashboard LCP (desktop) | < 2.5s | > 4.0s | Lighthouse CI |
| Student dashboard LCP (tablet/4G) | < 3.5s | > 5.0s | Lighthouse CI |
| First Input Delay (admin) | < 100ms | > 200ms | Lighthouse CI |
| First Input Delay (student) | < 150ms | > 300ms | Lighthouse CI |
| Cumulative Layout Shift (both) | < 0.1 | > 0.25 | Lighthouse CI |
| JS bundle — first load (gzipped) | < 150KB | > 200KB | `next-bundle-analyzer` |
| JS bundle — assessment engine chunk | < 80KB | > 120KB | `next-bundle-analyzer` |

---

## 2. Flash Anzan Number Display Latency

### Budget: ≤ 16.6ms (1 frame at 60fps)

**Flash interval range:** 200ms (minimum — `timing-engine.ts` throws `INTERVAL_BELOW_MINIMUM` if called with < 200ms) to 2000ms (maximum configurable via admin panel). The 16.6ms display latency budget applies at ALL intervals but is most binding at 200ms minimum where each frame represents 8.3% of the total flash window.

At 200ms flash intervals, a 16.6ms display latency is only 8.3% of the interval. Exceeding one frame (> 16.6ms) at 60Hz means the number displays on the wrong frame — causing imperceptible-but-cumulative timing drift that disadvantages students on lower-end devices.

### Measurement Implementation

```typescript
// src/lib/anzan/timing-engine.ts

function swapNumber(el: HTMLSpanElement, n: number): void {
  performance.mark('swap-start');

  // The only operation — direct textContent write
  el.textContent = String(n);
  if (n < 0) el.style.color = '#991B1B';
  else el.style.removeProperty('color');

  performance.mark('swap-end');
  performance.measure('flash-swap', 'swap-start', 'swap-end');

  // Warning log — never blocks the loop
  const measure = performance.getEntriesByName('flash-swap').at(-1);
  if (measure && measure.duration > FLASH_LATENCY_WARNING_MS) {
    console.warn(
      `[RAF] Flash swap took ${measure.duration.toFixed(2)}ms — ` +
      `exceeds ${FLASH_LATENCY_WARNING_MS}ms threshold`
    );
    // In production: send to Supabase activity_logs via non-blocking fetch
  }
  performance.clearMeasures('flash-swap');
}

const FLASH_LATENCY_WARNING_MS = 33; // 2 frames — hard warning threshold
```

### Constraints That Protect This Budget

| Constraint | Why It Matters For Latency |
|-----------|---------------------------|
| `textContent` only in `onFlash` | `innerHTML` is 3–5× slower |
| No `setState` in `onFlash` | React reconciler adds 2–8ms |
| No `classList` changes per flash | Class recalculation triggers style reflow |
| No CSS `transition` on `.flash-number` | Any transition dequeues paint until complete |
| Contrast tokens set once per interval tier (not per flash) | CSS custom property sets are single-threaded |

### Device Tier Expectations

| Device | Expected swap latency | Within budget? |
|--------|--------------------|----------------|
| Modern laptop (M1/i7) | ~0.3ms | ✅ Well within |
| Mid-range tablet (2022 iPad) | ~1–3ms | ✅ Within |
| Low-end Android tablet | ~5–12ms | ✅ Within (warning if > 10ms) |
| Very old device (2015 spec) | ~15–30ms | ⚠️ Monitor — may exceed at 200ms intervals |

---

## 3. WebSocket Connection Budget

### Budget: ≤ 5,000ms total (including jitter delay)

Jitter window: `setTimeout(connect, Math.random() * 5000)`. Worst case: 5,000ms delay + connection overhead.

### Measurement

```typescript
// src/lib/realtime/channel-manager.ts

export function measureChannelConnect(
  channel: RealtimeChannel,
  onReady: () => void
): void {
  performance.mark('ws-connect-start');

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      performance.mark('ws-connect-end');
      performance.measure('ws-connection', 'ws-connect-start', 'ws-connect-end');

      const measure = performance.getEntriesByName('ws-connection').at(-1);
      if (measure) {
        if (measure.duration > WS_CONNECT_WARNING_MS) {
          console.warn(`[WS] Connection took ${measure.duration.toFixed(0)}ms`);
        }
        performance.clearMeasures('ws-connection');
      }

      onReady();
    }
  });
}

const WS_CONNECT_WARNING_MS = 5_000;
```

### Phases of Connection Time

```
Student clicks "Ready" in lobby
       ↓
jitter delay: 0–5000ms (Math.random() * 5000)
       ↓
supabase.channel().subscribe() called
       ↓
TLS handshake + WebSocket upgrade: ~100–500ms
       ↓
First heartbeat received: ~200ms after subscribe
       ↓
TOTAL target: ≤ 5000ms (jitter + handshake + first heartbeat)
```

### Thundering Herd Prevention

Without jitter: 2,500 students connect simultaneously → Supabase Realtime receives 2,500 WebSocket requests in < 500ms → connection queue overflow.

With jitter: connections spread over 5,000ms window → 500 connections/second average → well within Supabase Pro connection limits.

---

## 4. Offline Sync Flush Budget

### Budget: ≤ 3,000ms for 50-question answer queue

### Measurement Points

```typescript
// src/lib/offline/sync-engine.ts

async function flushQueue(): Promise<void> {
  performance.mark('sync-start');

  const pending = await db.pendingAnswers
    .where('synced').equals(0)
    .toArray();

  if (pending.length === 0) return;

  const response = await fetch('/api/submissions/offline-sync', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id:      pending[0].session_id,
      answers:         pending,
      hmac_timestamp:  generateHmac(pending),
      batch_timestamp: Date.now(),
    }),
  });

  const result = await response.json();

  performance.mark('sync-end');
  performance.measure('offline-sync-flush', 'sync-start', 'sync-end');

  const measure = performance.getEntriesByName('offline-sync-flush').at(-1);
  if (measure && measure.duration > SYNC_FLUSH_WARNING_MS) {
    console.warn(`[Sync] Flush took ${measure.duration.toFixed(0)}ms for ${pending.length} answers`);
  }
}

const SYNC_FLUSH_WARNING_MS = 3_000;
```

### Breakdown of 3,000ms Budget

| Step | Target time |
|------|-------------|
| Dexie read (50 rows) | < 50ms |
| JSON serialization (50 answers) | < 10ms |
| Network round-trip (4G LTE) | < 800ms |
| Route handler processing | < 200ms |
| Security Definer RPC (50 rows) | < 500ms |
| DB write + idempotency check | < 300ms |
| Response + client update | < 100ms |
| **Total** | **~1,960ms — within 3,000ms budget** |

---

## 5. Core Web Vitals Targets

### Admin Panel (Desktop, Fast Connection)

| Metric | Target | Failure |
|--------|--------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | > 4.0s |
| **FID** (First Input Delay) | < 100ms | > 200ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | > 0.25 |
| **TTFB** (Time to First Byte) | < 600ms | > 1,200ms |
| **INP** (Interaction to Next Paint) | < 200ms | > 500ms |

### Student Panel (Tablet, 4G Simulated)

| Metric | Target | Failure |
|--------|--------|---------|
| **LCP** | < 3.5s | > 5.0s |
| **FID** | < 150ms | > 300ms |
| **CLS** | < 0.1 | > 0.25 |
| **TTFB** | < 800ms | > 1,500ms |
| **INP** | < 200ms | > 500ms |

### Lighthouse CI Configuration

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      http://localhost:3000/admin/dashboard
      http://localhost:3000/student/dashboard
    budgetPath: ./lighthouse-budget.json
    uploadArtifacts: true

# lighthouse-budget.json
[
  {
    "path": "/admin/dashboard",
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "first-input-delay",        "budget": 100 },
      { "metric": "cumulative-layout-shift",  "budget": 0.1 }
    ]
  },
  {
    "path": "/student/dashboard",
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 3500 },
      { "metric": "first-input-delay",        "budget": 150 },
      { "metric": "cumulative-layout-shift",  "budget": 0.1 }
    ]
  }
]
```

### CLS-Specific Rules

CLS occurs when elements shift after initial render. Rules to prevent it:

1. All images have explicit `width` and `height` attributes
2. Font fallback defined with matching `size-adjust` — DM Sans loaded via `next/font` (zero CLS)
3. Skeleton screens match exact dimensions of loaded content (KPI cards: `h-32 w-full`)
4. No `position: absolute` elements inserted above fold after hydration

---

## 6. JavaScript Bundle Budget

### First Load: < 150KB gzipped

```
First-load JS breakdown target:
├── Next.js framework runtime:     ~45KB
├── React + React-DOM:             ~40KB  
├── Supabase JS client:            ~25KB
├── Application code (shared):     ~25KB
├── Zustand:                        ~3KB
├── date-fns-tz:                    ~8KB
└── Other shared utilities:         ~4KB
─────────────────────────────────────────
Total first-load target:          ~150KB
```

### Assessment Engine Chunk: < 80KB gzipped (lazy-loaded)

```
Assessment engine chunk target:
├── Dexie.js:                      ~30KB
├── Engine components:             ~25KB
├── RAF timing + HMAC guard:        ~8KB
├── Number generator:               ~3KB
└── Anti-cheat utilities:           ~5KB
─────────────────────────────────────────
Total engine chunk target:         ~71KB
```

### Bundle Analysis Configuration

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

```bash
# Run on every PR that changes package.json or imports:
ANALYZE=true npm run build
# Opens bundle visualization; check assessment-engine chunk separately
```

### Bundle Budget CI Check

```yaml
# .github/workflows/bundle-budget.yml
- name: Check bundle size
  run: |
    ANALYZE=false npm run build
    # Parse .next/build-manifest.json for chunk sizes
    node scripts/check-bundle-budget.js --first-load-max=150000 --engine-chunk-max=80000
```

```javascript
// scripts/check-bundle-budget.js
const manifest = require('.next/build-manifest.json');
// Sum gzipped sizes of all first-load chunks
// Fail CI if over budget — prevents accidental large package additions
```

---

## 7. Route-Specific Code Splitting

All heavy packages are dynamically imported — never in the first-load bundle.

### Assessment Engine (Largest Split)

```typescript
// src/app/(student)/assessment/[id]/page.tsx

import dynamic from 'next/dynamic';

const AnzanFlashView = dynamic(
  () => import('@/components/assessment-engine/anzan-flash-view'),
  {
    loading: () => <AssessmentLoadingSkeleton />,
    ssr:     false,  // browser-only (RAF, performance.now, IndexedDB)
  }
);

const ExamVerticalView = dynamic(
  () => import('@/components/assessment-engine/exam-vertical-view'),
  {
    loading: () => <AssessmentLoadingSkeleton />,
    ssr:     false,
  }
);
// These chunks load ONLY when student navigates to /assessment/[id]
// Neither is in the first-load bundle
```

### Lottie (Loading Screens Only)

```typescript
// src/components/loading/abacus-loader.tsx
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), {
  ssr:     false,
  loading: () => <div className="h-32 w-32 animate-pulse rounded-full bg-slate-100" />,
});
// Lottie JSON is heavy (~200KB pre-gzip) — never in first-load bundle
```

### TipTap (Announcement Editor Only)

```typescript
// src/components/announcements/announcement-editor.tsx
import dynamic from 'next/dynamic';

const TipTapEditor = dynamic(
  () => import('@/components/announcements/tiptap-core'),
  {
    ssr:     false,
    loading: () => <TipTapSkeleton />,
  }
);
// TipTap loads only when admin opens announcement creation
```

### @tanstack/react-table (Admin Data Tables Only)

```typescript
// src/components/students/student-data-table.tsx
// @tanstack/react-table is imported statically here — acceptable because
// this component is itself only rendered inside (admin)/ routes (code-split by route group)
// NOT dynamically imported: route-group splitting is sufficient
import { useReactTable } from '@tanstack/react-table';
```

### Code Splitting Verification

```bash
# After build, verify chunks don't appear in first-load pages:
node -e "
const manifest = require('.next/build-manifest.json');
const firstLoad = manifest.pages['/'];
const hasBadImport = firstLoad.some(f => 
  f.includes('lottie') || f.includes('tiptap') || f.includes('assessment-engine')
);
if (hasBadImport) process.exit(1);
"
```

---

## 8. Measurement Tools & CI Integration

### Tool Stack

| Tool | Purpose | Trigger |
|------|---------|---------|
| Lighthouse CI (`@lhci/cli`) | Core Web Vitals on every PR | GitHub Actions on every push |
| `@next/bundle-analyzer` | Bundle size visualization | Manual + auto on `package.json` changes |
| `custom performance.mark()` | Flash timing precision | Runtime — dev tools + Supabase log |
| k6 | WebSocket load test (2500 concurrent) | Weekly scheduled run + before major release |
| `next-build-stats` | Track bundle size trend over time | On every merge to main |

### GitHub Actions Pipeline

```yaml
# .github/workflows/performance.yml
name: Performance Budget

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v11
        with:
          budgetPath: ./lighthouse-budget.json

  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - name: Check bundle budget
        run: node scripts/check-bundle-budget.js
```

---

## 9. k6 Load Test Specification

### Scenario: 2,500 Concurrent WebSocket Connections

```javascript
// k6/load-test-exam-start.js
import { check, sleep } from 'k6';
import ws from 'k6/ws';

export const options = {
  vus:      2500,          // Virtual users (students)
  duration: '2m',          // Run for 2 minutes
  thresholds: {
    ws_connecting:        ['p(95)<5000'],  // 95% connect within 5s (incl. jitter)
    ws_msgs_received:     ['rate>0.9'],    // 90% receive first heartbeat
    'checks{type:status}': ['rate>0.99'], // 99% pass status check
  },
};

export default function () {
  // Simulate jitter — students don't all connect simultaneously
  const jitter = Math.random() * 5000;
  sleep(jitter / 1000);  // k6 sleep is in seconds

  const supabaseUrl = __ENV.SUPABASE_URL.replace('https://', 'wss://') +
    '/realtime/v1/websocket?apikey=' + __ENV.SUPABASE_ANON_KEY;

  const res = ws.connect(supabaseUrl, {}, function (socket) {
    socket.on('open', () => {
      // Subscribe to exam channel (simulating real student connection)
      socket.send(JSON.stringify({
        topic:  `realtime:exam:${__ENV.TEST_PAPER_ID}`,
        event:  'phx_join',
        payload: {},
        ref:    '1',
      }));
    });

    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      check(msg, {
        'received heartbeat or join ack': (m) =>
          m.event === 'phx_reply' || m.event === 'heartbeat',
      });
    });

    socket.on('error', (e) => {
      console.error('WS Error:', e.error());
    });

    // Simulate exam duration (30 minutes compressed to 30 seconds)
    sleep(30);

    socket.close();
  });

  check(res, {
    'status is 101 (WebSocket upgrade)': (r) => r && r.status === 101,
  });
}
```

### Running the Load Test

```bash
# Prerequisites: k6 installed (https://k6.io/docs/get-started/installation/)
# Set environment variables:
export SUPABASE_URL=https://[your-project].supabase.co
export SUPABASE_ANON_KEY=[anon-key]
export TEST_PAPER_ID=[uuid-of-test-paper]
# Note: TEST_PAPER_ID is NOT a production env var.
# Create a TEST-type exam paper in your staging Supabase admin panel and use its UUID here.
# This paper should be set to LIVE status before running the load test.

# Run the test:
k6 run k6/load-test-exam-start.js

# Expected output:
# ✓ status is 101 (WebSocket upgrade)............: 99.8% ✓ 2495  ✗ 5
# ✓ received heartbeat or join ack...............: 99.5% ✓ 2487  ✗ 13
# ws_connecting.................................................: avg=2341ms p(95)=4892ms
```

### Interpreting Results

| Result | Meaning |
|--------|---------|
| `ws_connecting p(95) < 5000` ✅ | 95% of students connect within budget |
| `ws_connecting p(95) > 5000` ❌ | Supabase Realtime overloaded — investigate channel count |
| `ws_msgs_received rate < 0.9` ❌ | Students not receiving events — check Broadcast config |
| Any 5xx in HTTP checks | Server error — escalate to Technical Contact |

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Flash display latency budget with `performance.mark()` measurement | ✅ §2 |
| WebSocket connection budget with jitter breakdown | ✅ §3 |
| Offline sync flush budget with step-by-step timing | ✅ §4 |
| Core Web Vitals for admin (desktop) and student (tablet/4G) | ✅ §5 |
| Lighthouse CI config with `lighthouse-budget.json` | ✅ §5 |
| Bundle size budget with breakdown | ✅ §6 |
| Route-specific code splitting for 4 packages | ✅ §7 |
| k6 load test script for 2,500 concurrent WS connections | ✅ §9 |
| GitHub Actions CI pipeline config | ✅ §8 |
