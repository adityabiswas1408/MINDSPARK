'use client';

import { useExamTimer } from '@/hooks/use-exam-timer';

interface ExamTimerProps {
  /** ISO 8601 timestamp when the exam expires */
  expiresAt: string | null;
  /** Total exam duration in milliseconds — used for 20% urgent threshold. */
  totalDurationMs?: number;
  /** Called when timer reaches zero */
  onExpired: () => void;
}

/**
 * Exam timer display — MM:SS in DM Mono 30px 500 per 07_hifi-spec §2
 * mono-timer role. Uses the token-driven timer pill palette from
 * globals.css §4 (--bg-timer-normal / --bg-timer-urgent).
 *
 * Accessibility:
 *   - aria-live="polite" + aria-atomic="true"
 *   - Announces at 5-minute and 1-minute milestones only
 *   - No continuous announcement
 */
export function ExamTimer({ expiresAt, totalDurationMs, onExpired }: ExamTimerProps) {
  const {
    formattedTime,
    isUrgent,
    isExpired,
    shouldAnnounce,
    announceMessage,
  } = useExamTimer(expiresAt, totalDurationMs);

  if (isExpired) {
    queueMicrotask(onExpired);
  }

  return (
    <div
      data-testid="exam-timer"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex items-center shadow-sm"
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: isUrgent
          ? 'var(--bg-timer-urgent)'
          : 'var(--bg-timer-normal)',
        border: `1px solid ${
          isUrgent
            ? 'var(--border-timer-urgent)'
            : 'var(--border-timer-normal)'
        }`,
        gap: '10px',
      }}
    >
      <span
        className="font-mono tabular-nums"
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '30px',
          fontWeight: 500,
          lineHeight: 1,
          color: isUrgent
            ? 'var(--text-timer-urgent)'
            : 'var(--text-timer-normal)',
          letterSpacing: 0,
        }}
      >
        {formattedTime}
      </span>

      {shouldAnnounce && announceMessage && (
        <span className="sr-only">{announceMessage}</span>
      )}
    </div>
  );
}
