'use client';

import { useEffect, useState } from 'react';
import { FlashNumber } from '@/components/exam/flash-number';
import { McqGrid } from '@/components/exam/mcq-grid';
import { PausedOverlay } from '@/components/exam/paused-overlay';
import { TransitionInterstitial } from '@/components/exam/transition-interstitial';
import { SyncIndicator } from '@/components/exam/sync-indicator';
import { ExamNetworkBanner } from '@/components/exam/network-banner';
import { CompletionCard } from '@/components/exam/completion-card';
import { useExamSessionStore } from '@/stores/exam-session-store';
import { useAnzanEngine } from '@/hooks/use-anzan-engine';
import { TickerMode } from '@/components/a11y/a11y-ticker-mode';

interface AnzanQuestion {
  id: string;
  flashSequence: number[] | null;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
  orderIndex: number;
  seed: string;
}

interface AnzanFlashViewProps {
  sessionId: string;
  questions: AnzanQuestion[];
  anzanConfig: {
    delayMs: number;
    digitCount: number;
    rowCount: number;
  };
  syncStatus: 'synced' | 'offline' | 'error';
  isOffline: boolean;
  onNavigateResults: () => void;
  onNavigateDashboard: () => void;
}

/**
 * TEST type assessment wrapper — anzan-flash-view.
 *
 * Phase-aware rendering:
 *   - INTERSTITIAL: TransitionInterstitial (full screen)
 *   - PHASE_1_START: "Begin Flash ▶" button
 *   - PHASE_2_FLASH: FlashNumber only (ALL UI unmounted, not hidden)
 *   - PHASE_3_MCQ: McqGrid with skip option
 *   - SUBMITTED: CompletionCard
 *
 * Per FSD §1 PHASE_2_FLASH: sidebar, header, timer, navigator,
 * progress indicator, sync dot, network banner are ALL
 * conditionally UNMOUNTED — not display:none.
 */
export function AnzanFlashView({
  sessionId,
  questions,
  anzanConfig,
  syncStatus,
  isOffline,
  onNavigateResults,
  onNavigateDashboard,
}: AnzanFlashViewProps) {
  const phase = useExamSessionStore((s) => s.phase);
  const isPaused = useExamSessionStore((s) => s.isPaused);
  const setPhase = useExamSessionStore((s) => s.setPhase);
  const currentQuestionIndex = useExamSessionStore((s) => s.currentQuestionIndex);
  const totalQuestions = useExamSessionStore((s) => s.totalQuestions);
  const [error, setError] = useState<string | null>(null);
  const tickerMode = false; // TODO: Wire from session/profile in the future

  const {
    currentSequence,
    currentQuestion,
    handleFlashComplete,
    handleAnswerConfirm,
    handleSkip,
    handleSubmit: _handleSubmit, // eslint-disable-line @typescript-eslint/no-unused-vars
    isReady,
  } = useAnzanEngine({
    sessionId,
    questions,
    anzanConfig,
    onSubmitComplete: () => {
      // Submission complete — teardown handled by hook
    },
    onError: (err) => setError(err),
  });

  // Auto-transition: IDLE → INTERSTITIAL on mount
  // LOBBY is a waiting state for the lobby page — by the time student
  // reaches assessment/[id] they are past LOBBY. Go directly to INTERSTITIAL.
  useEffect(() => {
    if ((phase === 'IDLE' || phase === 'LOBBY') && isReady) {
      setPhase('INTERSTITIAL');
    }
  }, [phase, isReady, setPhase]);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold" style={{ color: '#DC2626' }}>
            Something went wrong
          </p>
          <p className="text-sm" style={{ color: '#475569' }}>{error}</p>
        </div>
      </div>
    );
  }

  // ---- INTERSTITIAL: full-screen 3s overlay ----
  if (phase === 'INTERSTITIAL') {
    return (
      <TransitionInterstitial
        onComplete={() => setPhase('PHASE_1_START')}
      />
    );
  }

  // ---- PHASE_2_FLASH: ONLY FlashNumber — everything else UNMOUNTED ----
  //
  // a11y requirements (08_a11y.md §6.1):
  //   role="region"    — landmark so AT users can navigate to it
  //   aria-live="off"  — content updates NOT announced (Ticker Mode is the accessible path)
  //   aria-busy="true" — conveys "something is happening" without reading out flash numbers
  //   data-testid      — required by Playwright A11Y-03 and E2E-02 tests
  if (phase === 'PHASE_2_FLASH') {
    return (
      <div
        role="region"
        aria-label="Flash number sequence"
        aria-live="off"
        aria-busy="true"
        data-testid="anzan-flash-view"
      >
        {tickerMode ? (
          <TickerMode
            sequence={currentSequence}
            intervalMs={anzanConfig.delayMs}
            onComplete={handleFlashComplete}
          />
        ) : (
          <FlashNumber
            numbers={currentSequence}
            intervalMs={anzanConfig.delayMs}
            onComplete={handleFlashComplete}
          />
        )}
        <PausedOverlay isPaused={isPaused} />
      </div>
    );
  }

  // ---- SUBMITTED: CompletionCard ----
  if (phase === 'SUBMITTED' || phase === 'TEARDOWN') {
    return (
      <CompletionCard
        visible
        assessmentType="TEST"
        onViewResults={onNavigateResults}
        onBackToDashboard={onNavigateDashboard}
      />
    );
  }

  // ---- PHASE_1_START: "Begin Flash" button ----
  // ---- PHASE_3_MCQ: MCQ grid with current question ----
  // ---- QUESTION_COOLDOWN: same as MCQ but disabled ----
  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Top bar — only visible outside PHASE_2_FLASH */}
      <header
        className="flex items-center justify-between border-b px-4 py-2"
        style={{ borderColor: '#E2E8F0' }}
      >
        <span
          className="text-sm font-medium"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontVariantNumeric: 'tabular-nums',
            color: '#475569',
          }}
        >
          {currentQuestionIndex + 1} / {totalQuestions}
        </span>
        <SyncIndicator status={syncStatus} />
      </header>

      {/* Network banner */}
      <ExamNetworkBanner isOffline={isOffline} />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        {phase === 'PHASE_1_START' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-1">
              <p className="text-sm font-medium" style={{ color: '#475569' }}>
                {anzanConfig.digitCount}-digit · {anzanConfig.rowCount} rows · {anzanConfig.delayMs}ms
              </p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                Watch the numbers carefully and calculate the sum
              </p>
            </div>
            <button
              data-testid="begin-flash-button"
              onClick={() => setPhase('PHASE_2_FLASH')}
              className="rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3829]"
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                backgroundColor: '#1A3829',
                color: '#FFFFFF',
              }}
            >
              Begin Flash ▶
            </button>
          </div>
        )}

        {(phase === 'PHASE_3_MCQ' || phase === 'QUESTION_COOLDOWN') && currentQuestion && (
          <McqGrid
            options={currentQuestion.options}
            onConfirm={handleAnswerConfirm}
            onSkip={handleSkip}
            showSkip
            disabled={phase === 'QUESTION_COOLDOWN'}
          />
        )}
      </div>
    </div>
  );
}
