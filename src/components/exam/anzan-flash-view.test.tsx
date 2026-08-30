// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { AnzanFlashView } from './anzan-flash-view';
import { useExamSessionStore } from '@/stores/exam-session-store';
import { submitExam } from '@/app/actions/assessment-sessions';

// Mock dependencies
vi.mock('@/app/actions/assessment-sessions', () => ({
  submitExam: vi.fn(),
}));

// We must capture the arguments passed to useAnzanEngine to extract onSubmitComplete
let capturedOnSubmitComplete: (() => void) | undefined;
vi.mock('@/hooks/use-anzan-engine', () => ({
  useAnzanEngine: (options: any) => {
    capturedOnSubmitComplete = options.onSubmitComplete;
    return {
      currentSequence: [],
      currentQuestion: null,
      handleFlashComplete: vi.fn(),
      handleAnswerConfirm: vi.fn(),
      handleSkip: vi.fn(),
      handleSubmit: vi.fn(),
      isReady: true,
    };
  }
}));

vi.mock('@/components/exam/completion-card', () => ({
  CompletionCard: () => <div data-testid="completion-card">Completion Card</div>
}));
vi.mock('@/components/exam/sync-indicator', () => ({
  SyncIndicator: () => <div data-testid="sync-indicator">Sync</div>
}));
vi.mock('@/components/exam/network-banner', () => ({
  ExamNetworkBanner: () => <div data-testid="network-banner">Network Banner</div>
}));
vi.mock('@/components/exam/paused-overlay', () => ({
  PausedOverlay: () => <div />
}));
vi.mock('@/components/exam/transition-interstitial', () => ({
  TransitionInterstitial: () => <div />
}));
vi.mock('@/components/a11y/a11y-ticker-mode', () => ({
  TickerMode: () => <div />
}));
vi.mock('@/components/exam/flash-number', () => ({
  FlashNumber: () => <div />
}));
vi.mock('@/components/exam/mcq-grid', () => ({
  McqGrid: () => <div />
}));

describe('AnzanFlashView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnSubmitComplete = undefined;
    useExamSessionStore.setState({
      phase: 'SUBMITTED',
      answers: {},
      tabSwitchCount: 0,
      serverTimestamp: Date.now(),
      completionSeal: 'mock-seal',
      initWallTime: Date.now() - 5000,
    });
  });

  it('calls submitExam with non-empty final_answers_snapshot reflecting the current store state', async () => {
    // Populate store with an answer
    const mockAnswer = {
      question_id: 'q1',
      selected_option: 'A' as const,
      answered_at: Date.now(),
      idempotency_key: 'i1',
      time_spent_ms: 1000,
    };
    useExamSessionStore.setState({
      answers: { q1: mockAnswer }
    });

    render(
      <AnzanFlashView
        sessionId="session-123"
        questions={[]}
        anzanConfig={{ delayMs: 1000, digitCount: 1, rowCount: 1 }}
        syncStatus="synced"
        isOffline={false}
        onNavigateResults={vi.fn()}
        onNavigateDashboard={vi.fn()}
      />
    );

    // Ensure useAnzanEngine was called and we captured onSubmitComplete
    expect(capturedOnSubmitComplete).toBeDefined();

    // Fire the submission complete callback manually
    await capturedOnSubmitComplete!();

    // Verify submitExam was called with the actual answers from the store, not an empty array
    expect(submitExam).toHaveBeenCalledTimes(1);
    expect(submitExam).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: 'session-123',
        final_answers_snapshot: [mockAnswer],
      })
    );
  });
});
