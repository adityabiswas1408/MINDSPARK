// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest';

describe('Anti-Cheat: Clock Guard', () => {
  const paperId = 'paper-123';
  const studentId = 'student-456';
  const durationMs = 60 * 60_000; // 60 mins

  let issueExamSeal: any;
  let validateClockGuard: any;
  let CLOCK_GUARD_CONSTANTS: any;

  beforeAll(async () => {
    vi.stubEnv('HMAC_SECRET', 'test-secret-key-12345');
    const mod = await import('./clock-guard');
    issueExamSeal = mod.issueExamSeal;
    validateClockGuard = mod.validateClockGuard;
    CLOCK_GUARD_CONSTANTS = mod.CLOCK_GUARD_CONSTANTS;
  });

  it('1. A valid seal + timings within tolerance → valid: true, no flags', () => {
    const serverTimestamp = Date.now();
    const seal = issueExamSeal({
      student_id: studentId,
      paper_id: paperId,
      server_timestamp: serverTimestamp,
      duration_ms: durationMs,
    });

    const simulatedElapsed = 35_000;
    const receivedAt = serverTimestamp + simulatedElapsed;

    const result = validateClockGuard(
      {
        seal,
        server_timestamp: serverTimestamp,
        performance_elapsed: simulatedElapsed,
        wall_elapsed: simulatedElapsed,
      },
      paperId,
      studentId,
      durationMs,
      receivedAt
    );

    expect(result.valid).toBe(true);
    expect(result.flags).toHaveLength(0);
  });

  it('2. A tampered seal value → HMAC_MISMATCH flag', () => {
    const serverTimestamp = Date.now();
    const tamperedSeal = 'bad-seal-hash';
    
    const simulatedElapsed = 35_000;
    const receivedAt = serverTimestamp + simulatedElapsed;

    const result = validateClockGuard(
      {
        seal: tamperedSeal,
        server_timestamp: serverTimestamp,
        performance_elapsed: simulatedElapsed,
        wall_elapsed: simulatedElapsed,
      },
      paperId,
      studentId,
      durationMs,
      receivedAt
    );

    expect(result.valid).toBe(false);
    expect(result.flags).toContain('HMAC_MISMATCH');
  });

  it('3. server_timestamp inconsistent with receivedAt beyond grace period → DURATION_EXCEEDED flag', () => {
    const serverTimestamp = Date.now();
    const seal = issueExamSeal({
      student_id: studentId,
      paper_id: paperId,
      server_timestamp: serverTimestamp,
      duration_ms: durationMs,
    });

    const simulatedElapsed = durationMs + CLOCK_GUARD_CONSTANTS.GRACE_PERIOD_MS + 1000;
    const receivedAt = serverTimestamp + simulatedElapsed;

    const result = validateClockGuard(
      {
        seal,
        server_timestamp: serverTimestamp,
        performance_elapsed: simulatedElapsed, 
        wall_elapsed: simulatedElapsed,
      },
      paperId,
      studentId,
      durationMs,
      receivedAt
    );

    expect(result.valid).toBe(false);
    expect(result.flags).toContain('DURATION_EXCEEDED');
  });

  it('4a. Instant submission check (ADVISORY)', () => {
    const serverTimestamp = Date.now();
    const seal = issueExamSeal({
      student_id: studentId,
      paper_id: paperId,
      server_timestamp: serverTimestamp,
      duration_ms: durationMs,
    });

    const simulatedElapsed = 2_000;
    const receivedAt = serverTimestamp + simulatedElapsed;

    const result = validateClockGuard(
      {
        seal,
        server_timestamp: serverTimestamp,
        performance_elapsed: simulatedElapsed, 
        wall_elapsed: simulatedElapsed,
      },
      paperId,
      studentId,
      durationMs,
      receivedAt
    );

    expect(result.valid).toBe(false);
    expect(result.flags).toContain('INSTANT_SUBMISSION');
  });

  it('4b. Clock drift detection (ADVISORY)', () => {
    const serverTimestamp = Date.now();
    const seal = issueExamSeal({
      student_id: studentId,
      paper_id: paperId,
      server_timestamp: serverTimestamp,
      duration_ms: durationMs,
    });

    const receivedAt = serverTimestamp + 40_000;

    const result = validateClockGuard(
      {
        seal,
        server_timestamp: serverTimestamp,
        performance_elapsed: 40_000,
        wall_elapsed: 60_000,
      },
      paperId,
      studentId,
      durationMs,
      receivedAt
    );

    expect(result.valid).toBe(false);
    expect(result.flags).toContain('CLOCK_DRIFT_DETECTED');
  });

  it('5. Handles malformed/empty/short seals safely without throwing', () => {
    const serverTimestamp = Date.now();
    const receivedAt = serverTimestamp + 10_000;
    
    // Empty seal
    const resultEmpty = validateClockGuard(
      { seal: '', server_timestamp: serverTimestamp, performance_elapsed: 10_000, wall_elapsed: 10_000 },
      paperId, studentId, durationMs, receivedAt
    );
    expect(resultEmpty.valid).toBe(false);
    expect(resultEmpty.flags).toContain('HMAC_MISMATCH');

    // Short seal
    const resultShort = validateClockGuard(
      { seal: 'abc', server_timestamp: serverTimestamp, performance_elapsed: 10_000, wall_elapsed: 10_000 },
      paperId, studentId, durationMs, receivedAt
    );
    expect(resultShort.valid).toBe(false);
    expect(resultShort.flags).toContain('HMAC_MISMATCH');

    // Same length, but invalid hex characters (would crash Buffer.from if unchecked)
    const validSeal = issueExamSeal({ student_id: studentId, paper_id: paperId, server_timestamp: serverTimestamp, duration_ms: durationMs });
    const invalidHexSeal = validSeal.replace(/[0-9a-f]/g, 'z');
    
    const resultInvalidHex = validateClockGuard(
      { seal: invalidHexSeal, server_timestamp: serverTimestamp, performance_elapsed: 10_000, wall_elapsed: 10_000 },
      paperId, studentId, durationMs, receivedAt
    );
    expect(resultInvalidHex.valid).toBe(false);
    expect(resultInvalidHex.flags).toContain('HMAC_MISMATCH');
  });
});
