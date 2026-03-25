'use client';

import { useExamTimer } from '@/hooks/use-exam-timer';

interface ExamTimerProps {
  /** ISO 8601 timestamp when the exam expires */
  expiresAt: string | null;
  /** Called when timer reaches zero */
  onExpired: () => void;
}

/**
 * Exam timer display — MM:SS in DM Mono with tabular-nums.
 *
 * Accessibility:
 *   - aria-live="polite" + aria-atomic="true"
 *   - Announces at 5-minute and 1-minute milestones only
 *   - No continuous announcement (aria-relevant not set)
 *
 * Visual:
 *   - Warning state (amber) at ≤5 minutes remaining
 *   - Uses useExamTimer hook for countdown logic
 */
export function ExamTimer({ expiresAt, onExpired }: ExamTimerProps) {
  const {
    formattedTime,
    isUrgent,
    isExpired,
    shouldAnnounce,
    announceMessage,
  } = useExamTimer(expiresAt);

  // Fire onExpired callback when timer reaches zero
  if (isExpired) {
    // Use microtask to avoid calling during render
    queueMicrotask(onExpired);
  }

  return (
    <div
      data-testid="exam-timer"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm"
      style={{
        backgroundColor: isUrgent ? '#FEF9C3' : '#FFFFFF',
        border: `1px solid ${isUrgent ? '#854D0E' : '#E2E8F0'}`,
      }}
    >
      <span
        className="text-sm font-medium"
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontVariantNumeric: 'tabular-nums',
          color: isUrgent ? '#854D0E' : '#475569',
        }}
      >
        {formattedTime}
      </span>

      {/* SR-only milestone announcement — only at 5min and 1min */}
      {shouldAnnounce && announceMessage && (
        <span className="sr-only">{announceMessage}</span>
      )}
    </div>
  );
}
