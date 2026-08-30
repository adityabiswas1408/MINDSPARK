'use client';

/**
 * Ticker Mode — Accessible Alternative for Flash Anzan Phase 2
 *
 * From 08_a11y.md §6.2:
 *   Flash Anzan Phase 2 presents a fundamental accessibility challenge:
 *   centred rapid-flash numbers cannot be meaningfully accessed via a screen reader.
 *   Ticker Mode is the mandated accessible alternative.
 *
 * ACTIVATION:
 *   Triggered when `profiles.ticker_mode = true` for the student.
 *   Checked on exam init — passed as prop from the assessment engine page.
 *
 * BEHAVIOUR:
 *   Numbers scroll horizontally (RTL → LTR). Speed = max(intervalMs, 800ms).
 *   Screen reader announces each number as it becomes "current" via aria-live="polite".
 *   Flash number span: aria-hidden="true" (never announced — Ticker announces instead).
 *
 * DESIGN:
 *   Font: DM Mono 48px, #0F172A on #FFFFFF.
 *   Negative numbers: #991B1B (same rule as flash-number.tsx).
 *   No transitions on number swap — instant (same as Phase 2).
 */

import { useState, useEffect, useRef } from 'react';

interface TickerModeProps {
  /** Ordered array of numbers to display */
  sequence: number[];
  /** Flash interval in ms from admin anzan_config — clamped to min 800ms */
  intervalMs: number;
  /** Called when the full sequence has been shown */
  onComplete: () => void;
}

export function TickerMode({ sequence, intervalMs, onComplete }: TickerModeProps) {
  // Minimum 800ms regardless of assessment delay_ms — ensures readability
  const displayInterval = Math.max(intervalMs, 800);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sequence.length === 0) return;

    let index = 0;

    function showNext(): void {
      if (index >= sequence.length) {
        setCurrentNumber(null);
        onCompleteRef.current();
        return;
      }

      const n = sequence[index];
      setCurrentIndex(index);
      setCurrentNumber(n);
      index++;

      timerRef.current = setTimeout(showNext, displayInterval);
    }

    // Small delay before starting — gives screen reader time to announce
    // the region label before the first number appears
    timerRef.current = setTimeout(showNext, 300);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [sequence, displayInterval]);

  const isNegative = currentNumber !== null && currentNumber < 0;

  return (
    <div
      role="region"
      aria-label="Flash number sequence — accessible ticker"
      aria-live="polite"
      data-testid="anzan-ticker-mode"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        zIndex: 9999,
      }}
    >
      {/* Visual ticker track — aria-hidden, screen reader uses the live region below */}
      <div
        className="ticker-track"
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {sequence.map((n, i) => (
          <span
            key={i}
            className="ticker-item"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '48px',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: '1',
              padding: '0 24px',
              color: n < 0 ? '#991B1B' : '#0F172A',
              // Highlight the current number; dim others
              opacity: i === currentIndex ? 1 : 0.2,
              transition: 'none', // instant — same rule as flash-number
              userSelect: 'none',
            }}
          >
            {n}
          </span>
        ))}
      </div>

      {/* Progress indicator */}
      <p
        aria-hidden="true"
        style={{
          marginTop: '24px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: '#475569',
        }}
      >
        {currentNumber !== null
          ? `${currentIndex + 1} of ${sequence.length}`
          : 'Complete'}
      </p>

      {/* Screen reader live region — announces each number as it becomes current.
          This is the primary channel for screen reader users. */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {currentNumber !== null
          ? `Number ${currentIndex + 1}: ${currentNumber}`
          : 'Sequence complete'}
      </span>
    </div>
  );
}
