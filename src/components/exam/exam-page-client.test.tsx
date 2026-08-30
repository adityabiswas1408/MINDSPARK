import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExamPageClient } from './exam-page-client';
import { submitExam } from '@/app/actions/assessment-sessions';
import { useRouter } from 'next/navigation';

vi.mock('@/app/actions/assessment-sessions', () => ({
  submitExam: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/stores/exam-session-store', () => ({
  useExamSessionStore: (selector: any) => {
    const state = {
      initSession: vi.fn(),
      setPhase: vi.fn(),
      answers: {},
      tabSwitchCount: 0,
    };
    return selector(state);
  },
}));

vi.mock('@/components/exam/exam-vertical-view', () => ({
  ExamVerticalView: ({ onSubmit }: any) => (
    <div data-testid="exam-view">
      <button onClick={onSubmit} data-testid="submit-btn">Submit</button>
    </div>
  ),
}));

vi.mock('@/components/exam/anzan-flash-view', () => ({
  AnzanFlashView: () => <div data-testid="anzan-view" />,
}));

vi.mock('@/lib/anticheat/tab-monitor', () => ({
  startTabMonitor: vi.fn(),
  stopTabMonitor: vi.fn(),
}));

vi.mock('@/lib/anticheat/teardown', () => ({
  registerTeardownListener: vi.fn(),
  removeTeardownListener: vi.fn(),
}));

vi.mock('@/lib/offline/sync-engine', () => ({
  startSyncEngine: vi.fn(),
  stopSyncEngine: vi.fn(),
}));

vi.mock('@/lib/offline/storage-probe', () => ({
  initStorageProbe: vi.fn(),
}));

describe('ExamPageClient', () => {
  const mockRouter = { replace: vi.fn(), push: vi.fn() };
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('redirects to completion page on successful submission', async () => {
    (submitExam as any).mockResolvedValue({ ok: true, data: { submitted: true } });

    render(
      <ExamPageClient
        sessionId="sess-123"
        expiresAt={new Date(Date.now() + 10000).toISOString()}
        paperType="EXAM"
        examQuestions={[]}
      />
    );

    const submitBtn = screen.getByTestId('submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitExam).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/student/assessment/sess-123/completion');
    });
  });

  it('does not redirect on submission validation error', async () => {
    (submitExam as any).mockResolvedValue({ ok: false, error: 'VALIDATION_ERROR' });

    render(
      <ExamPageClient
        sessionId="sess-123"
        expiresAt={new Date(Date.now() + 10000).toISOString()}
        paperType="EXAM"
        examQuestions={[]}
      />
    );

    const submitBtn = screen.getByTestId('submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitExam).toHaveBeenCalled();
    });

    // Ensure it did not redirect
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
