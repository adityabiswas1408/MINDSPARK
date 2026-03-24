'use client';

import { useState, useEffect } from 'react';

export function useExamTimer(expiresAtIso: string | null) {
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

  // isUrgent threshold: 5 minutes
  const isUrgent = remainingSeconds !== null && remainingSeconds > 0 && remainingSeconds <= 300;

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
