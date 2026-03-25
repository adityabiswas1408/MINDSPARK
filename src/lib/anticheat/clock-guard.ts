import { createHmac, timingSafeEqual } from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET!;

export interface HMACPayload {
  student_id: string;
  paper_id: string;
  server_timestamp: number;
  duration_ms: number;
}

export function issueExamSeal(payload: HMACPayload): string {
  const data = [
    payload.student_id,
    payload.paper_id,
    payload.server_timestamp,
    payload.duration_ms,
  ].join(':');

  return createHmac('sha256', HMAC_SECRET).update(data).digest('hex');
}

export interface ClockGuardSubmission {
  seal: string;
  server_timestamp: number;
  performance_elapsed: number;
  wall_elapsed: number;
}

export const CLOCK_GUARD_CONSTANTS = {
  /** Grace period beyond paper duration before flagging (covers submit latency) */
  GRACE_PERIOD_MS: 30_000,
  /** Max divergence between monotonic elapsed and wall elapsed before flag */
  DRIFT_TOLERANCE: 0.1, // 10% — covers NTP corrections and device sleep
  /** Minimum elapsed time we expect (prevents instant submission) */
  MIN_ELAPSED_MS: 10_000,
} as const;

export interface ClockValidationResult {
  valid: boolean;
  flags: ClockFlag[];
  server_elapsed: number; // authoritative elapsed (server-side)
}

export type ClockFlag =
  | 'HMAC_MISMATCH'
  | 'DURATION_EXCEEDED'
  | 'CLOCK_DRIFT_DETECTED'
  | 'INSTANT_SUBMISSION';

export function validateClockGuard(
  submission: ClockGuardSubmission,
  paperId: string,
  studentId: string,
  durationMs: number,
  receivedAt: number // Date.now() on server at request receipt
): ClockValidationResult {
  const flags: ClockFlag[] = [];

  // 1. Recompute and verify HMAC (constant-time comparison)
  const expectedSeal = issueExamSeal({
    student_id: studentId,
    paper_id: paperId,
    server_timestamp: submission.server_timestamp,
    duration_ms: durationMs,
  });

  const sealMatch = timingSafeCompare(expectedSeal, submission.seal);
  if (!sealMatch) flags.push('HMAC_MISMATCH');

  // 2. Server-authoritative elapsed (cannot be manipulated)
  const serverElapsed = receivedAt - submission.server_timestamp;

  // 3. Duration exceeded check (with grace period)
  if (serverElapsed > durationMs + CLOCK_GUARD_CONSTANTS.GRACE_PERIOD_MS) {
    flags.push('DURATION_EXCEEDED');
  }

  // 4. Monotonic drift check
  // If wall_elapsed and performance_elapsed diverge by > 10%: clock manipulation
  const divergence = Math.abs(
    submission.wall_elapsed - submission.performance_elapsed
  );
  const maxAllowedDivergence =
    submission.performance_elapsed * CLOCK_GUARD_CONSTANTS.DRIFT_TOLERANCE;
  if (
    divergence > maxAllowedDivergence &&
    submission.performance_elapsed > 30_000
  ) {
    // Only check after 30s of elapsed — short sessions have noisy ratios
    flags.push('CLOCK_DRIFT_DETECTED');
  }

  // 5. Instant submission guard
  if (submission.performance_elapsed < CLOCK_GUARD_CONSTANTS.MIN_ELAPSED_MS) {
    flags.push('INSTANT_SUBMISSION');
  }

  return {
    valid: flags.length === 0,
    flags,
    server_elapsed: serverElapsed,
  };
}

/** Constant-time string comparison — prevents timing attacks on HMAC */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
