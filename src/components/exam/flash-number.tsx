'use client';

import { useEffect, useRef, useCallback } from 'react';
import { startFlashLoop, getContrastTokens, type TimingState } from '@/lib/anzan/timing-engine';
import { startVisibilityGuard } from '@/lib/anzan/visibility-guard';
import { useExamSessionStore } from '@/stores/exam-session-store';

interface FlashNumberProps {
  /** Ordered array of numbers to flash */
  numbers: number[];
  /** Flash interval in ms (200–2000) from admin anzan_config.delay_ms */
  intervalMs: number;
  /** Called when all numbers in the sequence have been displayed */
  onComplete: () => void;
}

/**
 * Flash Anzan number display — PHASE_2_FLASH only.
 *
 * Critical rules (CLAUDE.md):
 *   - RAF + delta accumulator — NO setTimeout/setInterval
 *   - Direct DOM write via ref.textContent — NO setState in onFlash
 *   - transition: none !important on .flash-number — NO CSS transitions
 *   - Negative numbers (#991B1B) — positive inherits from contrast tier
 *   - Contrast tokens applied ONCE per mount, not per flash swap
 */
export function FlashNumber({ numbers, intervalMs, onComplete }: FlashNumberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  // Stable ref for onComplete to avoid re-running the effect
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // State ref for re-creating the loop on visibility resume
  const stateRef = useRef<TimingState | null>(null);

  const startLoop = useCallback(() => {
    if (!spanRef.current || !stateRef.current) return;

    // Reset timing state for fresh start / resume from current index
    stateRef.current.lastTimestamp = 0;
    stateRef.current.accumulator = 0;

    stopRef.current = startFlashLoop(stateRef.current);
  }, []);

  const stopLoop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    // Set isPaused in store — phase stays PHASE_2_FLASH
    useExamSessionStore.getState().setPaused(true);
  }, []);

  const restartLoop = useCallback(() => {
    useExamSessionStore.getState().setPaused(false);
    startLoop();
  }, [startLoop]);

  useEffect(() => {
    if (!spanRef.current || !containerRef.current) return;

    // Apply contrast tokens ONCE before loop starts — never inside onFlash
    const tokens = getContrastTokens(intervalMs);
    containerRef.current.style.setProperty('--flash-bg', tokens.bg);
    containerRef.current.style.setProperty('--flash-tx', tokens.text);
    if (tokens.fade > 0) {
      containerRef.current.setAttribute('data-fade', 'true');
    } else {
      containerRef.current.removeAttribute('data-fade');
    }
    containerRef.current.style.setProperty('--flash-fade', `${tokens.fade}ms`);

    // Build timing state object — mutated by the RAF loop, never triggers re-render
    const spanEl = spanRef.current;
    stateRef.current = {
      lastTimestamp: 0,
      accumulator: 0,
      questionIndex: 0,
      numbers,
      interval: intervalMs,
      onFlash: (n: number, isNegative: boolean) => {
        // ONLY textContent — no setState, no classList, no nested RAF
        spanEl.textContent = String(n);
        spanEl.style.color = isNegative ? '#991B1B' : '';
      },
      onComplete: () => onCompleteRef.current(),
    };

    // Start the RAF loop
    stopRef.current = startFlashLoop(stateRef.current);

    // Visibility guard — pauses RAF on tab hidden, resumes on return
    const removeGuard = startVisibilityGuard(stopLoop, restartLoop);

    return () => {
      stopRef.current?.();
      stopRef.current = null;
      removeGuard();
    };
  }, [numbers, intervalMs, stopLoop, restartLoop]);

  return (
    <div
      ref={containerRef}
      className="flash-container"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--flash-bg, #FFFFFF)',
        // NO transition here — flash container must be instant
        zIndex: 9999,
      }}
    >
      <span
        ref={spanRef}
        className="flash-number"
        aria-hidden="true"
        style={{
          transition: 'none',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 'clamp(96px, 30vh, 180px)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: '1',
          userSelect: 'none',
          color: 'var(--flash-tx, #0F172A)',
        }}
      />
    </div>
  );
}
