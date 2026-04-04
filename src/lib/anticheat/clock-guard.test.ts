/**
 * UT-03 — HMAC Clock Guard
 * Test plan §2: valid seal passes, tampered seal flags HMAC_MISMATCH,
 * drift > 10% flags CLOCK_DRIFT_DETECTED, duration exceeded flags DURATION_EXCEEDED,
 * and flags are informational (non-throwing).
 *
 * IMPORTANT: clock-guard.ts reads process.env.HMAC_SECRET at module-evaluation time.
 * We stub the env before the first import so both issueExamSeal and validateClockGuard
 * use the same deterministic secret throughout the test suite.
 */
import { beforeAll, describe, it, expect, vi } from 'vitest';

// Stub HMAC_SECRET before clock-guard module is evaluated
vi.stubEnv('HMAC_SECRET', 'mindspark-test-secret-do-not-use-in-production');

// Dynamic import after env stub — ensures module reads the stubbed value
const { validateClockGuard, issueExamSeal, CLOCK_GUARD_CONSTANTS } = await import(
  '@/lib/anticheat/clock-guard'
);

const STUDENT_ID = 'student-uuid-123';
const PAPER_ID = 'paper-uuid-456';
const DURATION_MS = 1_800_000; // 30 minutes

// ---------------------------------------------------------------------------

describe('HMAC Clock Guard', () => {
  // UT-03a: valid seal, normal elapsed — should pass with no flags
  it('UT-03a: valid seal with normal elapsed passes all checks', () => {
    const serverTimestamp = Date.now() - 600_000; // exam started 10 min ago

    const seal = issueExamSeal({
      student_id: STUDENT_ID,
      paper_id: PAPER_ID,
      server_timestamp: serverTimestamp,
      duration_ms: DURATION_MS,
    });

    const result = validateClockGuard(
      {
        seal,
        server_timestamp: serverTimestamp,
        performance_elapsed: 600_000,
        wall_elapsed: 601_000, // 1s drift — within 10% tolerance
      },
      PAPER_ID,
      STUDENT_ID,
      DURATION_MS,
      serverTimestamp + 601_000 // receivedAt
    );

    expect(result.valid).toBe(true);
    expect(result.flags).toHaveLength(0);
    expect(result.server_elapsed).toBe(601_000);
  });

  // UT-03b: tampered seal — must flag HMAC_MISMATCH
  it('UT-03b: tampered seal triggers HMAC_MISMATCH flag', () => {
    const serverTimestamp = Date.now() - 600_000;

    const result = validateClockGuard(
      {
        seal: 'tampered-seal-value',
        server_timestamp: serverTimestamp,
        performance_elapsed: 600_000,
        wall_elapsed: 600_000,
      },
      PAPER_ID,
      STUDENT_ID,
      DURATION_MS,
      serverTimestamp + 600_000
    );

    expect(result.valid).toBe(false);
    expect(result.flags).toContain('HMAC_MISMATCH');
  });

  // UT-03c: clock drift > 10% — must flag CLOCK_DRIFT_DETECTED
  it('UT-03c: clock drift > 10% triggers CLOCK_DRIFT_DETECTED', () => {
    const serverTimestamp = Date.now() - 1_200_000; // 20 min ago

    const seal = issueExamSeal({
      student_id: STUDENT_ID,
      paper_id: PAPER_ID,
      server_timestamp: serverTimestamp,
      duration_ms: DURATION_MS,
    });

    const result = validateClockGuard(
      {
        seal,
        server_timestamp: serverTimestamp,
        performance_elapsed: 1_200_000,
        wall_elapsed: 900_000, // 25% divergence — exceeds 10% tolerance
      },
      PAPER_ID,
      STUDENT_ID,
      DURATION_MS,
      serverTimestamp + 1_200_000
    );

    expect(result.flags).toContain('CLOCK_DRIFT_DETECTED');
  });

  // UT-03d: duration exceeded — must flag DURATION_EXCEEDED
  it('UT-03d: duration exceeded triggers DURATION_EXCEEDED flag', () => {
    // 33 min elapsed > 30 min duration + 30s grace (GRACE_PERIOD_MS = 30_000)
    const serverTimestamp = Date.now() - 2_000_000;

    const seal = issueExamSeal({
      student_id: STUDENT_ID,
      paper_id: PAPER_ID,
      server_timestamp: serverTimestamp,
      duration_ms: DURATION_MS,
    });

    const result = validateClockGuard(
      {
        seal,
        server_timestamp: serverTimestamp,
        performance_elapsed: 2_000_000,
        wall_elapsed: 2_000_000,
      },
      PAPER_ID,
      STUDENT_ID,
      DURATION_MS,
      serverTimestamp + 2_000_000 // receivedAt — 33+ min after start
    );

    expect(result.flags).toContain('DURATION_EXCEEDED');
  });

  // UT-03e: HMAC mismatch is non-blocking — result object still returned, not thrown
  it('UT-03e: HMAC mismatch does not throw — flags are informational', () => {
    // Business rule: flags are for audit/telemetry; caller decides action.
    // Answers MUST still be saved regardless of flag state.
    const result = validateClockGuard(
      {
        seal: 'bad-seal',
        server_timestamp: Date.now(),
        performance_elapsed: 60_000,
        wall_elapsed: 60_000,
      },
      PAPER_ID,
      STUDENT_ID,
      DURATION_MS,
      Date.now()
    );

    // Returns a result object — never throws
    expect(result).toHaveProperty('flags');
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('server_elapsed');
    expect(result.flags).toContain('HMAC_MISMATCH');
  });

  // UT-03f: CLOCK_GUARD_CONSTANTS are exported and have expected shape
  it('UT-03f: CLOCK_GUARD_CONSTANTS exports are correctly shaped', () => {
    expect(CLOCK_GUARD_CONSTANTS.GRACE_PERIOD_MS).toBe(30_000);
    expect(CLOCK_GUARD_CONSTANTS.DRIFT_TOLERANCE).toBe(0.1);
    expect(CLOCK_GUARD_CONSTANTS.MIN_ELAPSED_MS).toBe(10_000);
  });
});
