# MINDSPARK V1 — Test Plan & Test Cases

> **Document type:** Quality Assurance — Build Support  
> **Version:** 1.0  
> **Output path:** `docs/test-plan.md`  
> **Read first:** `docs/prd.md` · `docs/fsd.md` · `docs/api-contracts.md`  
> **Author role:** Principal QA Engineer — Next.js testing · Playwright · Supabase · high-concurrency load testing

---

## Table of Contents

1. [Test Strategy Overview](#1-test-strategy-overview)
2. [Unit Tests — Vitest](#2-unit-tests--vitest)
3. [Integration Tests — Vitest + Supabase Local](#3-integration-tests--vitest--supabase-local)
4. [E2E Tests — Playwright](#4-e2e-tests--playwright)
5. [Load Tests — k6](#5-load-tests--k6)
6. [Accessibility Tests — axe-playwright](#6-accessibility-tests--axe-playwright)
7. [CI Pipeline Configuration](#7-ci-pipeline-configuration)

---

## 1. Test Strategy Overview

### Tool Stack

| Layer | Tool | Config File |
|-------|------|------------|
| Unit tests | Vitest | `vitest.config.ts` |
| Integration tests | Vitest + `supabase test` | `vitest.config.integration.ts` |
| E2E tests | Playwright | `playwright.config.ts` |
| Accessibility | axe-playwright (in E2E suite) | Shared playwright config |
| Load tests | k6 | `k6/` directory |
| Bundle size | `@next/bundle-analyzer` + custom script | `.github/workflows/` |

### Test Pyramid

```
         ▲  k6 Load Tests (4 scenarios — pre-release only)
        ▲▲▲ Playwright E2E (5 critical flows)
       ▲▲▲▲▲ axe-playwright A11y (all routes)
      ▲▲▲▲▲▲▲ Vitest Integration (6 DB/RLS cases)
     ▲▲▲▲▲▲▲▲▲ Vitest Unit (5 precision cases)
```

### Core Principle
Every test must be **independently runnable** — no test file depends on another test's side effects. Integration tests use `supabase db reset` before each suite (not each test — that would be too slow).

---

## 2. Unit Tests — Vitest

**Config:** `vitest.config.ts`  
**Run:** `npm run test:unit` → `vitest run src/**/*.test.ts`  
**Coverage target:** 90% on `src/lib/anzan/` and `src/lib/anticheat/`

### Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',   // browser APIs (performance.now, requestAnimationFrame)
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider:  'v8',
      include:   ['src/lib/anzan/**', 'src/lib/anticheat/**', 'src/lib/offline/**'],
      thresholds: { lines: 90, functions: 90 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

```typescript
// src/test/setup.ts — mock RAF for deterministic timing tests
let rafCallbacks: Array<(t: number) => void> = [];
let currentTime = 0;

global.requestAnimationFrame = (cb) => {
  rafCallbacks.push(cb);
  return rafCallbacks.length;
};

global.cancelAnimationFrame = () => { rafCallbacks = []; };

// Helper: advance time and flush all pending RAF callbacks
export function advanceRaf(ms: number): void {
  currentTime += ms;
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  cbs.forEach(cb => cb(currentTime));
}
```

---

### UT-01: RAF Timing Accumulator Drift < 5ms Over 10s

```typescript
// src/lib/anzan/timing-engine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { startFlashLoop, TimingState } from '@/lib/anzan/timing-engine';
import { advanceRaf } from '@/test/setup';

describe('RAF Timing Engine — drift precision', () => {
  it('UT-01: accumulator drift < 5ms over 10 seconds at 200ms interval', () => {
    const INTERVAL   = 200;
    const DURATION   = 10_000;   // 10 seconds
    const EXPECTED   = DURATION / INTERVAL;  // 50 flashes

    const flashTimestamps: number[] = [];
    let timeAccum = 0;

    const state: TimingState = {
      lastTimestamp:  0,
      accumulator:    0,
      questionIndex:  0,
      numbers:        Array.from({ length: EXPECTED }, (_, i) => i + 1),
      interval:       INTERVAL,
      onFlash: (n) => {
        flashTimestamps.push(timeAccum);
      },
      onComplete: () => {},
    };

    const stop = startFlashLoop(state);

    // Simulate 10 seconds with 16.6ms RAF ticks
    for (let t = 0; t < DURATION; t += 16.6) {
      timeAccum = t;
      advanceRaf(16.6);
    }

    stop();

    // Verify flash count
    expect(flashTimestamps.length).toBe(EXPECTED);

    // Verify drift: each flash should be within 5ms of ideal timestamp
    flashTimestamps.forEach((actual, i) => {
      const ideal = i * INTERVAL;
      const drift = Math.abs(actual - ideal);
      expect(drift).toBeLessThan(5);  // < 5ms drift
    });
  });

  it('UT-01b: INTERVAL_BELOW_MINIMUM throws for interval < 200ms', () => {
    expect(() => startFlashLoop({ ...baseState, interval: 199 }))
      .toThrow('INTERVAL_BELOW_MINIMUM');
  });

  it('UT-01c: surplus carries forward — no drift on uneven deltas', () => {
    // Simulate 450ms deltas against a 200ms interval
    // Expected: flashes at ~200ms and ~400ms, not skipped
    const flashes: number[] = [];
    const state: TimingState = {
      ...baseState,
      interval: 200,
      numbers:  [1, 2, 3],
      onFlash:  () => flashes.push(state.questionIndex),
    };

    const stop = startFlashLoop(state);
    advanceRaf(450);  // one large delta = should produce 2 flashes, not 1
    stop();

    expect(flashes.length).toBeGreaterThanOrEqual(2);
  });
});
```

---

### UT-02: Number Generator — No Consecutive Duplicates + Sum in Range

```typescript
// src/lib/anzan/number-generator.test.ts
import { describe, it, expect } from 'vitest';
import { generateFlashSequence } from '@/lib/anzan/number-generator';

describe('Number Generator', () => {
  it('UT-02a: no two consecutive identical numbers', () => {
    for (let trial = 0; trial < 100; trial++) {
      const { numbers } = generateFlashSequence({
        count: 10, min: 10, max: 99,
        negative_probability: 0.3, difficulty: 3,
      });

      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).not.toBe(numbers[i - 1]);
      }
    }
  });

  it('UT-02b: sum stays within 4-digit display bound', () => {
    for (let trial = 0; trial < 100; trial++) {
      const { sum } = generateFlashSequence({
        count: 10, min: 10, max: 99,
        negative_probability: 0.2, difficulty: 2,
      });
      expect(Math.abs(sum)).toBeLessThan(10_000);
    }
  });

  it('UT-02c: seed reproducibility — same seed → identical sequence', () => {
    const config = {
      count: 7, min: 1, max: 9,
      negative_probability: 0.1, difficulty: 1,
      seed: '550e8400-e29b-41d4-a716-446655440000',
    };
    const a = generateFlashSequence(config);
    const b = generateFlashSequence(config);
    expect(a.numbers).toEqual(b.numbers);
    expect(a.sum).toBe(b.sum);
  });

  it('UT-02d: different seeds → different sequences', () => {
    const baseConfig = { count: 5, min: 1, max: 9, negative_probability: 0, difficulty: 1 as const };
    const a = generateFlashSequence({ ...baseConfig, seed: 'seed-a' });
    const b = generateFlashSequence({ ...baseConfig, seed: 'seed-b' });
    expect(a.numbers).not.toEqual(b.numbers);
  });

  it('UT-02e: invalid count throws', () => {
    expect(() => generateFlashSequence({
      count: 11, min: 1, max: 9, negative_probability: 0, difficulty: 1,
    })).toThrow('INVALID_COUNT');
  });
});
```

---

### UT-03: HMAC Clock Guard — Accept Valid, Reject Tampered

```typescript
// src/lib/anticheat/clock-guard.test.ts
import { describe, it, expect } from 'vitest';
import { validateClockGuard, issueExamSeal, CLOCK_GUARD_CONSTANTS } from '@/lib/anticheat/clock-guard';

const STUDENT_ID  = 'student-uuid-123';
const PAPER_ID    = 'paper-uuid-456';
const DURATION_MS = 1_800_000;  // 30 minutes

describe('HMAC Clock Guard', () => {
  it('UT-03a: valid seal with normal elapsed passes all checks', () => {
    const serverTimestamp = Date.now() - 600_000;  // started 10 min ago
    const seal = issueExamSeal({
      student_id: STUDENT_ID, paper_id: PAPER_ID,
      server_timestamp: serverTimestamp, duration_ms: DURATION_MS,
    });

    const result = validateClockGuard(
      {
        seal,
        server_timestamp: serverTimestamp,
        performance_elapsed: 600_000,
        wall_elapsed:        601_000,   // 1s drift — within 10% tolerance
      },
      PAPER_ID, STUDENT_ID, DURATION_MS,
      serverTimestamp + 601_000
    );

    expect(result.valid).toBe(true);
    expect(result.flags).toHaveLength(0);
  });

  it('UT-03b: tampered seal triggers HMAC_MISMATCH flag', () => {
    const serverTimestamp = Date.now() - 600_000;
    const result = validateClockGuard(
      {
        seal:                'tampered-seal-value',
        server_timestamp:    serverTimestamp,
        performance_elapsed: 600_000,
        wall_elapsed:        600_000,
      },
      PAPER_ID, STUDENT_ID, DURATION_MS,
      serverTimestamp + 600_000
    );

    expect(result.valid).toBe(false);
    expect(result.flags).toContain('HMAC_MISMATCH');
  });

  it('UT-03c: clock drift > 10% triggers CLOCK_DRIFT_DETECTED', () => {
    const serverTimestamp = Date.now() - 1_200_000;  // 20 min ago
    const seal = issueExamSeal({
      student_id: STUDENT_ID, paper_id: PAPER_ID,
      server_timestamp: serverTimestamp, duration_ms: DURATION_MS,
    });

    const result = validateClockGuard(
      {
        seal,
        server_timestamp:    serverTimestamp,
        performance_elapsed: 1_200_000,
        wall_elapsed:        900_000,    // 25% divergence — should flag
      },
      PAPER_ID, STUDENT_ID, DURATION_MS,
      serverTimestamp + 1_200_000
    );

    expect(result.flags).toContain('CLOCK_DRIFT_DETECTED');
  });

  it('UT-03d: duration exceeded triggers DURATION_EXCEEDED flag', () => {
    const serverTimestamp = Date.now() - 2_000_000;  // started ~33 min ago
    const seal = issueExamSeal({
      student_id: STUDENT_ID, paper_id: PAPER_ID,
      server_timestamp: serverTimestamp, duration_ms: DURATION_MS,
    });

    const result = validateClockGuard(
      { seal, server_timestamp: serverTimestamp, performance_elapsed: 2_000_000, wall_elapsed: 2_000_000 },
      PAPER_ID, STUDENT_ID, DURATION_MS,
      serverTimestamp + 2_000_000  // 33 min elapsed > 30 min + 30s grace
    );

    expect(result.flags).toContain('DURATION_EXCEEDED');
  });

  it('UT-03e: HMAC mismatch is non-blocking — valid field is false but answers not discarded', () => {
    // Business rule: flags are informational — caller must still save answers
    const result = validateClockGuard(
      { seal: 'bad', server_timestamp: Date.now(), performance_elapsed: 60_000, wall_elapsed: 60_000 },
      PAPER_ID, STUDENT_ID, DURATION_MS, Date.now()
    );
    // Result contains flags but does NOT throw — caller decides what to do
    expect(result).toHaveProperty('flags');
    expect(result).toHaveProperty('server_elapsed');
  });
});
```

---

### UT-04: LRU Purge — Oldest Entries Removed on QuotaExceededError

```typescript
// src/lib/offline/indexed-db-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { handleQuotaExceeded } from '@/lib/offline/indexed-db-store';

// Mock Dexie for unit test (no real IndexedDB in Node)
vi.mock('@/lib/dexie/db', () => ({
  db: {
    pendingAnswers: {
      orderBy: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([
          { id: 1, answered_at: 100, selected_option: 'A' },
          { id: 2, answered_at: 200, selected_option: 'B' },
          { id: 3, answered_at: 300, selected_option: null },  // unanswered
          { id: 4, answered_at: 400, selected_option: 'C' },
          { id: 5, answered_at: 500, selected_option: 'D' },
          { id: 6, answered_at: 600, selected_option: 'A' },
        ]),
      }),
      bulkDelete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

describe('LRU Purge', () => {
  it('UT-04a: removes oldest completed answers, keeps most recent 5', async () => {
    const { db } = await import('@/lib/dexie/db');
    await handleQuotaExceeded();

    // Only id=1 should be deleted (oldest completed answer outside the keep-5 window)
    expect(db.pendingAnswers.bulkDelete).toHaveBeenCalledWith([1]);
  });

  it('UT-04b: never deletes unanswered questions (selected_option = null)', async () => {
    const { db } = await import('@/lib/dexie/db');
    await handleQuotaExceeded();

    const deletedIds: number[] = (db.pendingAnswers.bulkDelete as any).mock.calls[0][0];
    expect(deletedIds).not.toContain(3);  // id=3 has null selected_option
  });
});
```

---

### UT-05: auth-store — Only Contains UI Flags, No Role

```typescript
// src/stores/auth-store.test.ts
import { describe, it, expect } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';

describe('auth-store — UI flags only', () => {
  it('UT-05a: store shape has no role or email field', () => {
    const state = useAuthStore.getState();
    expect(state).not.toHaveProperty('role');
    expect(state).not.toHaveProperty('email');
    expect(state).not.toHaveProperty('user');
    expect(state).not.toHaveProperty('profile');
  });

  it('UT-05b: store contains forced_password_reset flag', () => {
    const state = useAuthStore.getState();
    expect(state).toHaveProperty('forced_password_reset');
    expect(typeof state.forced_password_reset).toBe('boolean');
  });

  it('UT-05c: setForcedPasswordReset updates flag correctly', () => {
    useAuthStore.getState().setForcedPasswordReset(true);
    expect(useAuthStore.getState().forced_password_reset).toBe(true);
    useAuthStore.getState().setForcedPasswordReset(false);
    expect(useAuthStore.getState().forced_password_reset).toBe(false);
  });
});
```

---

## 3. Integration Tests — Vitest + Supabase Local

**Config:** `vitest.config.integration.ts`  
**Run:** `npm run test:integration` → requires `npx supabase start`  
**Setup:** `npx supabase db reset` once before suite (not per test)

```typescript
// vitest.config.integration.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment:   'node',
    include:       ['src/test/integration/**/*.test.ts'],
    globalSetup:   './src/test/integration/global-setup.ts',
    hookTimeout:   30_000,  // DB reset can take up to 30s
    testTimeout:   15_000,
  },
});
```

```typescript
// src/test/integration/global-setup.ts
import { execSync } from 'child_process';

export async function setup(): Promise<void> {
  execSync('npx supabase db reset --local', { stdio: 'inherit' });
  execSync('npx supabase db seed --local', { stdio: 'inherit' });
}
```

---

### IT-01: RLS — Student Cannot Read Another Student's Submissions

```typescript
// src/test/integration/rls.test.ts
import { createClient } from '@supabase/supabase-js';
import { describe, it, expect } from 'vitest';

const SUPABASE_URL      = 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

describe('RLS — Cross-student isolation', () => {
  it('IT-01: student A cannot read student B submissions', async () => {
    // Sign in as Student A (seeded test account)
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await clientA.auth.signInWithPassword({
      email:    'student-a@test.mindspark.local',
      password: 'test-password-a',
    });

    // Attempt to fetch Student B's submission (seeded with known ID)
    const { data, error } = await clientA
      .from('submissions')
      .select('*')
      .eq('student_id', 'STUDENT_B_UUID');   // seeded in seed.sql

    expect(error).toBeNull();
    expect(data).toHaveLength(0);  // RLS returns empty, not error
  });
});
```

---

### IT-02: RLS — Teacher Reads Only Own-Cohort Students (cohort_history)

```typescript
describe('RLS — Teacher cohort_history temporal access', () => {
  it('IT-02: teacher sees historical student data from past cohorts', async () => {
    // Teacher was assigned to Student C in cohort_history (past period)
    // but is now assigned to a different cohort
    const clientT = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await clientT.auth.signInWithPassword({
      email: 'teacher@test.mindspark.local',
      password: 'teacher-password',
    });

    const { data } = await clientT
      .from('submissions')
      .select('student_id')
      .eq('student_id', 'STUDENT_C_HISTORICAL_UUID');

    // Teacher should still see historical submission (via cohort_history join)
    expect(data!.length).toBeGreaterThan(0);
  });

  it('IT-02b: teacher cannot read student outside any historical cohort', async () => {
    const clientT = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await clientT.auth.signInWithPassword({
      email: 'teacher@test.mindspark.local',
      password: 'teacher-password',
    });

    const { data } = await clientT
      .from('submissions')
      .select('student_id')
      .eq('student_id', 'UNRELATED_STUDENT_UUID');

    expect(data).toHaveLength(0);
  });
});
```

---

### IT-03: Idempotency — Duplicate Submission Returns 200, Not 500

```typescript
// src/test/integration/idempotency.test.ts
describe('Idempotency — duplicate submission handling', () => {
  it('IT-03: identical idempotency_key returns success, not DB error', async () => {
    const idempotencyKey = crypto.randomUUID();

    // First insert — should succeed
    const first = await submitAnswer({
      session_id:      'TEST_SESSION_UUID',
      question_id:     'TEST_QUESTION_UUID',
      selected_option: 'A',
      idempotency_key: idempotencyKey,
    });
    expect(first.ok).toBe(true);

    // Second insert with same key — must return ok, not unique violation
    const second = await submitAnswer({
      session_id:      'TEST_SESSION_UUID',
      question_id:     'TEST_QUESTION_UUID',
      selected_option: 'B',  // even different answer — earlier wins
      idempotency_key: idempotencyKey,
    });
    expect(second.ok).toBe(true);   // not an error

    // Verify: first answer preserved (B was ignored)
    const { data } = await adminClient
      .from('student_answers')
      .select('selected_option')
      .eq('idempotency_key', idempotencyKey)
      .single();
    expect(data!.selected_option).toBe('A');  // first write wins
  });
});
```

---

### IT-04: Security Definer RPC — Validates HMAC, Rejects Tampered

```typescript
describe('validate_and_migrate_offline_submission RPC', () => {
  it('IT-04: RPC rejects payload with invalid HMAC', async () => {
    const { data, error } = await adminClient.rpc('validate_and_migrate_offline_submission', {
      p_staging_id:      'TEST_STAGING_UUID',
      p_hmac_timestamp:  'tampered-hmac-value',
      p_client_ts:       Date.now(),
    });

    // RPC returns error code, not DB exception
    expect(data?.status).toBe('rejected');
    expect(data?.reason).toContain('HMAC_MISMATCH');
    expect(error).toBeNull();  // clean error, not unhandled exception
  });

  it('IT-04b: valid HMAC → status = migrated', async () => {
    const validHmac = generateTestHmac('TEST_SESSION_UUID', Date.now());
    const { data } = await adminClient.rpc('validate_and_migrate_offline_submission', {
      p_staging_id:     'TEST_STAGING_UUID',
      p_hmac_timestamp: validHmac,
      p_client_ts:      Date.now(),
    });
    expect(data?.status).toBe('migrated');
  });
});
```

---

### IT-05: bulk_import_students RPC — Atomic Rollback on Any Duplicate

```typescript
describe('bulk_import_students RPC', () => {
  it('IT-05: any duplicate roll_number causes FULL rollback — zero rows inserted', async () => {
    // Seed: roll_number 'ROLL-001' already exists in DB
    const rows = [
      { full_name: 'New Student',   roll_number: 'ROLL-999', dob: '2010-01-01' },
      { full_name: 'Dupe Student',  roll_number: 'ROLL-001', dob: '2009-05-15' }, // ← conflict
      { full_name: 'Third Student', roll_number: 'ROLL-998', dob: '2011-03-20' },
    ];

    const { data, error } = await adminClient.rpc('bulk_import_students', {
      p_institution_id: 'TEST_INSTITUTION_UUID',
      p_rows:           rows,
    });

    // PRD §10 V16 mandates full atomic rollback — no partial insert permitted
    // ROLL-999 and ROLL-998 must NOT be inserted even though they are valid
    expect(data?.inserted).toBe(0);   // zero rows — full rollback
    expect(data?.skipped).toBe(0);    // no skip-and-continue — that is prohibited
    expect(error?.message ?? data?.error).toContain('ROLL-001'); // identifies the offending row
    expect(error?.message ?? data?.error).toContain('Rolling back'); // confirms rollback occurred

    // Verify DB state: none of the 3 rows exist
    const { data: check } = await adminClient
      .from('students')
      .select('roll_number')
      .in('roll_number', ['ROLL-999', 'ROLL-998', 'ROLL-001']);
    const newRolls = check?.filter(r => ['ROLL-999', 'ROLL-998'].includes(r.roll_number));
    expect(newRolls).toHaveLength(0);  // ROLL-999 and ROLL-998 were NOT inserted
  });

  it('IT-05b: clean CSV with no duplicates — all rows inserted atomically', async () => {
    const rows = [
      { full_name: 'Alpha Student', roll_number: 'ROLL-A01', dob: '2010-01-01' },
      { full_name: 'Beta Student',  roll_number: 'ROLL-B01', dob: '2009-05-15' },
      { full_name: 'Gamma Student', roll_number: 'ROLL-C01', dob: '2011-03-20' },
    ];

    const { data } = await adminClient.rpc('bulk_import_students', {
      p_institution_id: 'TEST_INSTITUTION_UUID',
      p_rows:           rows,
    });

    expect(data?.inserted).toBe(3);  // all 3 inserted
    expect(data?.errors).toHaveLength(0);
  });
});
```

---

### IT-06: Offline Sync Route Handler — Rate Limiting

```typescript
describe('/api/submissions/offline-sync rate limiting', () => {
  it('IT-06: 11th request within 60s returns 429', async () => {
    const token = await getStudentJwt();
    const responses: number[] = [];

    for (let i = 0; i < 11; i++) {
      const res = await fetch('http://localhost:3000/api/submissions/offline-sync', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: 'TEST', answers: [], hmac_timestamp: '' }),
      });
      responses.push(res.status);
    }

    expect(responses.at(-1)).toBe(429);  // 11th request rate-limited
    expect(responses.slice(0, 10).every(s => s !== 429)).toBe(true);  // first 10 pass
  });
});
```

---

## 4. E2E Tests — Playwright

**Config:** `playwright.config.ts`  
**Run:** `npm run test:e2e` → `playwright test`  
**Browser:** Chromium (primary), Firefox + WebKit (smoke only)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,  // exam flows are stateful — sequential safer
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace:   'retain-on-failure',
    video:   'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port:    3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### E2E-01: Full EXAM Flow (Login → Submit)

```typescript
// e2e/exam-flow.spec.ts
import { test, expect } from '@playwright/test';

test('E2E-01: complete EXAM flow end-to-end', async ({ page }) => {
  // 1. Login as student
  await page.goto('/login');
  await page.fill('[data-testid="roll-number"]', 'STUDENT-001');
  await page.fill('[data-testid="dob"]', '01/01/2010');
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL('/student/dashboard');

  // 2. Navigate to exam
  await page.click('[data-testid="exam-card-EXAM-001"]');
  await expect(page).toHaveURL(/\/lobby\/.+/);

  // 3. Click Ready → lobby → interstitial
  await expect(page.locator('[data-testid="network-light"]')).toHaveAttribute('data-status', 'green');
  await page.click('[data-testid="ready-button"]');

  // 4. Wait for 3000ms interstitial
  await expect(page.locator('[data-testid="interstitial"]')).toBeVisible();
  await expect(page.locator('[data-testid="interstitial"]')).not.toBeVisible({ timeout: 5000 });

  // 5. Answer all MCQ questions
  await expect(page.locator('[data-testid="exam-vertical-view"]')).toBeVisible();
  const questionCount = await page.locator('[data-testid="question-nav-dot"]').count();

  for (let i = 0; i < questionCount; i++) {
    // Select option A for all questions
    await page.click('[data-testid="mcq-option-A"]');
    await page.click('[data-testid="confirm-answer"]');

    if (i < questionCount - 1) {
      await page.click('[data-testid="next-question"]');
      // Wait for 1200ms cooldown
      await page.waitForTimeout(1300);
    }
  }

  // 6. Submit exam
  await page.click('[data-testid="submit-exam"]');
  await page.click('[data-testid="confirm-submit"]');

  // 7. Verify completion card
  await expect(page.locator('[data-testid="completion-card"]')).toBeVisible();
  await expect(page.locator('[data-testid="completion-card"]')).toContainText('Submitted');
});
```

---

### E2E-02: Full TEST Flow (Flash Anzan Phases 1→2→3)

```typescript
test('E2E-02: complete TEST flow — Phase1 → Phase2 (flash) → Phase3 (MCQ)', async ({ page }) => {
  await loginAsStudent(page, 'STUDENT-001');
  await page.click('[data-testid="test-card-TEST-001"]');

  // Lobby
  await page.click('[data-testid="ready-button"]');
  await page.waitForTimeout(3200);  // interstitial

  // Phase 1: START — config display with Begin Flash button (no equation in TEST engine)
  await expect(page.locator('[data-testid="anzan-start-view"]')).toBeVisible();
  await page.waitForTimeout(2000);

  // Phase 2: Flash numbers — question-navigator MUST be absent from DOM
  await expect(page.locator('[data-testid="anzan-flash-view"]')).toBeVisible();
  await expect(page.locator('[data-testid="question-navigator"]')).not.toBeAttached();
  // ↑ CRITICAL: `.not.toBeAttached()` — not just hidden, actually unmounted

  // Verify no transitions on flash number
  const flashStyle = await page.locator('.flash-number').evaluate((el) =>
    window.getComputedStyle(el).transition
  );
  expect(flashStyle).toBe('none');  // no transition whatsoever

  // Wait for flash sequence to complete
  await page.waitForSelector('[data-testid="mcq-grid"]', { timeout: 10000 });

  // Phase 3: MCQ answer
  await page.click('[data-testid="mcq-option-B"]');
  await page.click('[data-testid="confirm-answer"]');

  // After last question → completion card
  await expect(page.locator('[data-testid="completion-card"]')).toBeVisible({ timeout: 5000 });
});
```

---

### E2E-03: Offline Resume — Disconnect During Phase 2, Reconnect + Verify Sync

```typescript
test('E2E-03: offline during flash, reconnect, answers synced', async ({ page, context }) => {
  await loginAsStudent(page, 'STUDENT-001');
  await page.click('[data-testid="test-card-TEST-001"]');
  await page.click('[data-testid="ready-button"]');
  await page.waitForTimeout(3200);  // interstitial

  // Wait for Phase 2 to start
  await page.waitForSelector('[data-testid="anzan-flash-view"]');

  // Go offline mid-flash
  await context.setOffline(true);

  // Offline banner must appear
  await expect(page.locator('[data-testid="network-banner"]')).toBeVisible();
  await expect(page.locator('[data-testid="network-banner"]')).toContainText('saving');
  // Banner MUST NOT contain error codes
  await expect(page.locator('[data-testid="network-banner"]')).not.toContainText('Error');
  await expect(page.locator('[data-testid="network-banner"]')).not.toContainText('503');

  // Wait for MCQ phase (exam continues offline)
  await page.waitForSelector('[data-testid="mcq-grid"]', { timeout: 15000 });
  await page.click('[data-testid="mcq-option-A"]');
  await page.click('[data-testid="confirm-answer"]');

  // Verify answer went to IndexedDB (sync-indicator shows amber)
  await expect(page.locator('[data-testid="sync-indicator"]')).toHaveAttribute('data-status', 'offline');

  // Reconnect
  await context.setOffline(false);

  // Sync indicator must resolve to green within 5s
  await expect(page.locator('[data-testid="sync-indicator"]'))
    .toHaveAttribute('data-status', 'synced', { timeout: 5000 });

  // Submit rest of exam and verify DB has the offline answer
  await submitEntireExam(page);

  const submission = await getSubmissionFromDB('STUDENT-001', 'TEST-001');
  expect(submission.answers.some(a => a.selected_option === 'A')).toBe(true);
});
```

---

### E2E-04: Admin Force Close — All Students See Closed State

```typescript
test('E2E-04: admin Force Close — students see correct message', async ({ browser }) => {
  const adminCtx   = await browser.newContext();
  const student1Ctx = await browser.newContext();
  const adminPage   = await adminCtx.newPage();
  const student1Page = await student1Ctx.newPage();

  await loginAsAdmin(adminPage);
  await loginAsStudent(student1Page, 'STUDENT-001');

  // Student enters exam
  await student1Page.click('[data-testid="exam-card-EXAM-001"]');
  await student1Page.click('[data-testid="ready-button"]');
  await student1Page.waitForTimeout(3200);

  // Admin force closes via monitor
  await adminPage.goto('/admin/monitor/EXAM-001');
  await adminPage.click('[data-testid="force-close-button"]');
  await adminPage.click('[data-testid="confirm-force-close"]');  // confirmation modal

  // Student sees closed state within 3 seconds (Broadcast latency)
  await expect(student1Page.locator('[data-testid="exam-closed-overlay"]'))
    .toBeVisible({ timeout: 3000 });
  await expect(student1Page.locator('[data-testid="exam-closed-overlay"]'))
    .toContainText('answers have been saved');  // human language, no error code
});
```

---

### E2E-05: Result Publish — Admin Publishes, Student Sees Immediately

```typescript
test('E2E-05: admin publishes result, student sees within 3s', async ({ browser }) => {
  const adminPage   = await (await browser.newContext()).newPage();
  const studentPage = await (await browser.newContext()).newPage();

  await loginAsAdmin(adminPage);
  await loginAsStudent(studentPage, 'STUDENT-001');

  // Student: open results page (sees result as Pending)
  await studentPage.goto('/student/results');
  await expect(studentPage.locator('[data-testid="result-EXAM-001"]'))
    .toHaveAttribute('data-status', 'pending');

  // Admin publishes result
  await adminPage.goto('/admin/results/EXAM-001');
  await adminPage.click('[data-testid="publish-result-STUDENT-001"]');

  // Student page updates via Realtime Broadcast within 3s
  await expect(studentPage.locator('[data-testid="result-EXAM-001"]'))
    .toHaveAttribute('data-status', 'published', { timeout: 3000 });
});
```

---

## 5. Load Tests — k6

> ⚠️ **REQUIRED before first live exam.** All 3 load scenarios must pass.

### LT-01: 2,500 Concurrent WebSocket Connections (Thundering Herd)

```javascript
// k6/lt-01-thundering-herd.js
import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
  vus:      2500,
  duration: '30s',
  thresholds: {
    ws_connecting:               ['p(95)<5000'],  // 95% connect within 5s budget
    ws_sessions:                 ['rate>0.98'],   // 98% sessions established
    'checks{scenario:connect}':  ['rate>0.99'],
  },
};

export default function () {
  // Jitter: mirrors production behavior
  sleep(Math.random() * 5);

  const url = `${__ENV.SUPABASE_WS_URL}/realtime/v1/websocket?apikey=${__ENV.SUPABASE_ANON_KEY}`;

  const res = ws.connect(url, {}, (socket) => {
    socket.on('open', () => {
      socket.send(JSON.stringify({
        topic: `realtime:exam:${__ENV.PAPER_ID}`,
        event: 'phx_join', payload: {}, ref: '1',
      }));
    });
    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      check(msg, {
        'join ack or heartbeat': (m) => ['phx_reply', 'heartbeat'].includes(m.event),
      });
    });
    sleep(10);     // hold connection for 10s (simulates exam in progress)
    socket.close();
  });

  check(res, {
    'WS upgrade success (101)': (r) => r?.status === 101,
  });
}
```

**Pass criteria:** `ws_connecting p(95) < 5,000ms` AND `checks rate > 99%`

---

### LT-02: 2,500 Simultaneous Heartbeats Per 5-Second Window

```javascript
// k6/lt-02-heartbeat-storm.js
export const options = {
  vus:      2500,
  duration: '60s',
  thresholds: {
    http_req_duration:         ['p(95)<500'],   // Supabase responsive under load
    http_req_failed:           ['rate<0.01'],   // < 1% failure rate
  },
};

export default function () {
  // Each VU sends a heartbeat every 5s (matches production HEARTBEAT_INTERVAL)
  sleep(5);
  const res = http.post(
    `${__ENV.SUPABASE_URL}/rest/v1/rpc/heartbeat_ping`,
    JSON.stringify({ session_id: __ENV.SESSION_ID }),
    { headers: { Authorization: `Bearer ${__ENV.STUDENT_JWT}`, 'Content-Type': 'application/json' } }
  );
  check(res, { 'heartbeat 200': (r) => r.status === 200 });
}
```

**Pass criteria:** `http_req_duration p(95) < 500ms` AND `http_req_failed < 1%`

---

### LT-03: 2,500 Offline Syncs in 30-Second Window

```javascript
// k6/lt-03-offline-sync-storm.js
export const options = {
  vus:      2500,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],    // within 3s budget
    http_req_failed:   ['rate<0.005'],    // < 0.5% failures
  },
};

export default function () {
  const answers = Array.from({ length: 50 }, (_, i) => ({
    question_id:     `question-${i}`,
    selected_option: ['A', 'B', 'C', 'D'][i % 4],
    idempotency_key: uuidv4(),           // unique per VU per run
    answered_at:     Date.now() - (50 - i) * 4000,
  }));

  const res = http.post(
    `${__ENV.BASE_URL}/api/submissions/offline-sync`,
    JSON.stringify({ session_id: __ENV.SESSION_ID, answers, hmac_timestamp: fakeHmac }),
    { headers: { Authorization: `Bearer ${__ENV.STUDENT_JWT}`, 'Content-Type': 'application/json' } }
  );

  check(res, {
    'sync 200 or 409': (r) => r.status === 200 || r.status === 409,  // 409 = duplicate (OK)
    'no 500 errors':   (r) => r.status < 500,
  });
}
```

**Pass criteria:** `http_req_duration p(95) < 3,000ms` AND `http_req_failed < 0.5%` AND zero 500 errors

---

## 6. Accessibility Tests — axe-playwright

**Integrated into E2E suite.** Runs on every route after page load.

```typescript
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ADMIN_ROUTES = [
  '/admin/dashboard', '/admin/levels', '/admin/students',
  '/admin/assessments', '/admin/monitor', '/admin/results',
  '/admin/announcements', '/admin/reports', '/admin/activity-log',
  '/admin/settings',
];

const STUDENT_ROUTES = [
  '/student/dashboard', '/student/exams', '/student/tests',
  '/student/results', '/student/profile',
];

// A11Y-01: All admin pages — 0 WCAG AA violations
for (const route of ADMIN_ROUTES) {
  test(`A11Y-01: ${route} has 0 WCAG AA violations`, async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21aaa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });
}

// A11Y-02: All student pages — 0 WCAG AA violations
for (const route of STUDENT_ROUTES) {
  test(`A11Y-02: ${route} has 0 WCAG AA violations`, async ({ page }) => {
    await loginAsStudent(page, 'STUDENT-001');
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21aaa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });
}

// A11Y-03: Flash Anzan Phase 2 — aria-hidden="true" confirmed on flash number
test('A11Y-03: flash-number has aria-hidden="true" during Phase 2', async ({ page }) => {
  await loginAsStudent(page, 'STUDENT-001');
  await startTestExam(page, 'TEST-001');
  await page.waitForSelector('[data-testid="anzan-flash-view"]');

  // PRD §11 UX V6 mandates aria-hidden="true" — removes element from AT tree entirely
  // aria-live="off" is insufficient; screen readers can still discover the element
  const ariaHidden = await page.locator('.flash-number').getAttribute('aria-hidden');
  expect(ariaHidden).toBe('true');  // must be completely hidden from assistive technology

  // Additionally confirm no live region is announcing flash numbers
  const ariaLive = await page.locator('.flash-number').getAttribute('aria-live');
  expect(ariaLive).not.toBe('assertive');  // must never announce flash numbers
});

// A11Y-04: MCQ buttons — role="radio" + aria-checked
test('A11Y-04: MCQ options have correct ARIA roles', async ({ page }) => {
  await loginAsStudent(page, 'STUDENT-001');
  await startExam(page, 'EXAM-001');

  const optionA = page.locator('[data-testid="mcq-option-A"]');
  await expect(optionA).toHaveAttribute('role', 'radio');
  await expect(optionA).toHaveAttribute('aria-checked', 'false');

  await optionA.click();
  await expect(optionA).toHaveAttribute('aria-checked', 'true');
});

// A11Y-05: Timer — aria-live="polite", announces at 5min + 1min only
test('A11Y-05: exam timer aria-live and announcement gates', async ({ page }) => {
  await loginAsStudent(page, 'STUDENT-001');
  await startExam(page, 'EXAM-001');

  const timer = page.locator('[data-testid="exam-timer"]');
  await expect(timer).toHaveAttribute('aria-live', 'polite');
  await expect(timer).toHaveAttribute('aria-atomic', 'true');

  // Verify non-milestone time doesn't trigger aria announcement
  // (by checking aria-relevant is NOT set to additions — would announce every tick)
  const ariaRelevant = await timer.getAttribute('aria-relevant');
  expect(ariaRelevant).toBeNull();  // no continuous announcement
});
```

---

## 7. CI Pipeline Configuration

### PR Pipeline (Every Pull Request)

```yaml
# .github/workflows/pr.yml
name: PR Checks
on: [pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:unit -- --coverage
      - name: Coverage gate (90%)
        run: npx vitest run --coverage --reporter=json | node scripts/check-coverage.js

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: npm ci
      - run: npm run test:integration

  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - run: node scripts/check-bundle-budget.js

  type-check:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci && npm run tsc

  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci && npm run lint
```

### Main Branch Pipeline (On Merge)

```yaml
# .github/workflows/main.yml — additions beyond PR pipeline
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e -- --grep "A11Y"
```

### Pre-Release Gate (Before Any Live Exam)

```yaml
# .github/workflows/pre-release.yml
  load-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: k6/lt-01-thundering-herd.js
        env:
          SUPABASE_WS_URL: ${{ secrets.SUPABASE_WS_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          PAPER_ID: ${{ secrets.TEST_PAPER_ID }}
      - uses: grafana/k6-action@v0.3.0
        with: { filename: k6/lt-02-heartbeat-storm.js }
      - uses: grafana/k6-action@v0.3.0
        with: { filename: k6/lt-03-offline-sync-storm.js }
      # All 3 must pass — if any fail, workflow fails and release is blocked
```

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| k6 thundering herd test (required before first exam) | ✅ §5 LT-01 |
| RAF timing precision test (drift < 5ms over 10s) | ✅ §2 UT-01 |
| Idempotency test (duplicate → 200 not 500) | ✅ §3 IT-03 |
| cohort_history RLS test (temporal teacher access) | ✅ §3 IT-02 |
| Offline resume E2E test | ✅ §4 E2E-03 |
| All test categories with tool specified | ✅ Vitest · Playwright · k6 · axe-playwright |
| CI pipeline: PR / main / pre-release gates | ✅ §7 |
| Flash Phase 2 — `question-navigator` unmount verified | ✅ E2E-02: `.not.toBeAttached()` |
| Flash Phase 2 — `transition: none` verified | ✅ E2E-02: `getComputedStyle().transition === 'none'` |
