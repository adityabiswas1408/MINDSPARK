'use client';

import { useEffect, useRef, useCallback } from 'react';
import { HEARTBEAT_INTERVAL_MS } from '@/lib/constants';

export function useHeartbeat(
  sessionId: string | null,
  onHeartbeat: () => Promise<void>,
  intervalMs = HEARTBEAT_INTERVAL_MS
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const trigger = useCallback(() => {
    if (!sessionId) return;
    onHeartbeat().catch(err => console.error('Heartbeat failed:', err));
  }, [sessionId, onHeartbeat]);

  useEffect(() => {
    if (!sessionId) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    trigger(); // Immediate execution on session mount

    timerRef.current = setInterval(trigger, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, intervalMs, trigger]);
}
