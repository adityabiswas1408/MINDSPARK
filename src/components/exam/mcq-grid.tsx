'use client';

import { useState, useCallback } from 'react';
import { useInputCooldown } from '@/hooks/use-input-cooldown';

type OptionKey = 'A' | 'B' | 'C' | 'D';

interface McqOption {
  key: OptionKey;
  label: string;
}

interface McqGridProps {
  /** The four answer options */
  options: McqOption[];
  /** Called when student confirms an answer selection */
  onConfirm: (selected: OptionKey) => void;
  /** Called when student skips (TEST type Phase 3 only) */
  onSkip?: () => void;
  /** Whether the skip button is visible (TEST type only) */
  showSkip?: boolean;
  /** Disable all interaction (e.g. during cooldown overlay) */
  disabled?: boolean;
}

/**
 * 2×2 MCQ answer grid.
 *
 * Rules:
 *   - Min 64×64px per cell (Fitts Law — ages 6–18)
 *   - Select & Confirm pattern (never instant-submit)
 *   - "Confirm →" button appears after option tap
 *   - role="radio" + aria-checked per A11Y-04
 *   - 1200ms inter-tap cooldown via useInputCooldown
 */
export function McqGrid({
  options,
  onConfirm,
  onSkip,
  showSkip = false,
  disabled = false,
}: McqGridProps) {
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { isCooling, startCooldown } = useInputCooldown();

  const handleSelect = useCallback(
    (key: OptionKey) => {
      if (disabled || isCooling) return;
      setSelectedOption(key);
      setShowConfirm(true);
    },
    [disabled, isCooling]
  );

  const handleConfirm = useCallback(() => {
    if (!selectedOption || disabled || isCooling) return;
    startCooldown();
    onConfirm(selectedOption);
    setSelectedOption(null);
    setShowConfirm(false);
  }, [selectedOption, disabled, isCooling, startCooldown, onConfirm]);

  const handleSkip = useCallback(() => {
    if (disabled || isCooling) return;
    startCooldown();
    onSkip?.();
    setSelectedOption(null);
    setShowConfirm(false);
  }, [disabled, isCooling, startCooldown, onSkip]);

  return (
    <div data-testid="mcq-grid" className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* 2×2 option grid */}
      <div
        role="radiogroup"
        aria-label="Answer options"
        className="grid grid-cols-2 gap-3 w-full"
      >
        {options.map((option) => {
          const isSelected = selectedOption === option.key;
          return (
            <button
              key={option.key}
              data-testid={`mcq-option-${option.key}`}
              role="radio"
              aria-checked={isSelected}
              disabled={disabled || isCooling}
              onClick={() => handleSelect(option.key)}
              className="flex items-center justify-center rounded-xl text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3829] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                minWidth: '64px',
                minHeight: '64px',
                padding: '16px',
                fontFamily: 'var(--font-mono), monospace',
                fontVariantNumeric: 'tabular-nums',
                backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                border: isSelected ? '3px solid #1A3829' : '2px solid #E2E8F0',
                color: '#0F172A',
              }}
            >
              <span className="mr-2 text-sm font-semibold opacity-60">{option.key}.</span>
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Confirm button — appears after option selection */}
      {showConfirm && selectedOption && (
        <button
          data-testid="confirm-answer"
          onClick={handleConfirm}
          disabled={disabled || isCooling}
          className="flex items-center justify-center gap-2 rounded-lg font-semibold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3829] disabled:opacity-50"
          style={{
            minHeight: '48px',
            padding: '12px 32px',
            backgroundColor: '#1A3829',
            color: '#FFFFFF',
            // 200ms translateY slide-in from FSD
            animation: 'confirm-slide-in 200ms ease-out',
          }}
        >
          Confirm →
        </button>
      )}

      {/* Skip button — TEST type Phase 3 only */}
      {showSkip && (
        <button
          data-testid="skip-question"
          onClick={handleSkip}
          disabled={disabled || isCooling}
          className="text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3829] disabled:opacity-50"
          style={{ color: '#475569' }}
        >
          Skip this question
        </button>
      )}
    </div>
  );
}
