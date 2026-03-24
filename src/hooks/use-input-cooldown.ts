'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useInputCooldown(durationMs = 1200) {
  const [isCooling, setIsCooling] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startCooldown = useCallback(() => {
    setIsCooling(true);
    startTimeRef.current = performance.now();

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    function tick(now: number) {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;

      if (elapsed >= durationMs) {
        setIsCooling(false);
        rafRef.current = null;
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { isCooling, startCooldown };
}
