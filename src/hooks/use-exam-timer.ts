'use client';

import { useState, useEffect } from 'react';

export function useExamTimer(
  expiresAtIso: string | null,
  /**
   * Optional total exam duration in milliseconds. When supplied, the
   * urgent threshold is computed as 20% of the duration per spec.
   * Falls back to a 5-minute constant when not provided (backward
   * compatible with the old callsite signature).
   */
  totalDurationMs?: number
) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAtIso) {
      setRemainingSeconds(null);
      setIsExpired(false);
      return;
    }

    const targetTime = new Date(expiresAtIso).getTime();

    const calculate = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));

      setRemainingSeconds(diff);

      if (diff === 0) {
        setIsExpired(true);
        return true;
      }
      return false;
    };

    if (calculate()) return;

    const interval = setInterval(() => {
      const done = calculate();
      if (done) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAtIso]);

  // Urgent threshold: 20% of total exam duration, or 5 minutes if
  // total duration is unknown. `totalDurationMs` is in ms; convert to
  // seconds before comparing with remainingSeconds.
  const urgentThresholdSeconds =
    typeof totalDurationMs === 'number' && totalDurationMs > 0
      ? Math.max(60, Math.floor((totalDurationMs * 0.2) / 1000))
      : 300;

  const isUrgent =
    remainingSeconds !== null &&
    remainingSeconds > 0 &&
    remainingSeconds <= urgentThresholdSeconds;

  const formattedTime = remainingSeconds !== null
    ? `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`
    : '--:--';

  return {
    remainingSeconds,
    formattedTime,
    isUrgent,
    isExpired,
    shouldAnnounce: remainingSeconds === 300 || remainingSeconds === 60,
    announceMessage: remainingSeconds === 300 
      ? 'Five minutes remaining' 
      : remainingSeconds === 60 
      ? 'One minute remaining' 
      : null,
  };
}
