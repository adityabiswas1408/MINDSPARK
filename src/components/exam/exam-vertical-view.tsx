'use client';

import { useState, useCallback } from 'react';
import { McqGrid } from '@/components/exam/mcq-grid';
import { QuestionNavigator } from '@/components/exam/question-navigator';
import { ExamTimer } from '@/components/exam/exam-timer';
import { SyncIndicator } from '@/components/exam/sync-indicator';
import { ConfirmSubmit } from '@/components/exam/confirm-submit';
import { useExamSessionStore } from '@/stores/exam-session-store';

interface ExamQuestion {
  id: string;
  equationDisplay: string;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
  orderIndex: number;
}

interface ExamVerticalViewProps {
  /** All exam questions in order */
  questions: ExamQuestion[];
  /** Exam expiry timestamp (ISO 8601) */
  expiresAt: string | null;
  /** Called when student confirms final submission */
  onSubmit: () => void;
  /** Called when exam timer expires */
  onTimeExpired: () => void;
  /** Sync status for the indicator */
  syncStatus: 'synced' | 'offline' | 'error';
}

/**
 * EXAM type vertical wrapper.
 *
 * Renders equation panel + MCQ grid for the current question,
 * with QuestionNavigator sidebar and ExamTimer pill.
 *
 * Phase-aware: QuestionNavigator is mounted/unmounted by this
 * component based on the current exam phase.
 */
export function ExamVerticalView({
  questions,
  expiresAt,
  onSubmit,
  onTimeExpired,
  syncStatus,
}: ExamVerticalViewProps) {
  const phase = useExamSessionStore((s) => s.phase);
  const currentQuestionIndex = useExamSessionStore((s) => s.currentQuestionIndex);
  const answers = useExamSessionStore((s) => s.answers);
  const recordAnswer = useExamSessionStore((s) => s.recordAnswer);
  const incrementQuestion = useExamSessionStore((s) => s.incrementQuestion);
  const totalQuestions = useExamSessionStore((s) => s.totalQuestions);
  const setPhase = useExamSessionStore((s) => s.setPhase);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  // Count a pending-but-unconfirmed selection on the current question toward the total
  const pendingIsNew = pendingSelection !== null && currentQuestion !== undefined && !answers[currentQuestion.id];
  const displayedAnsweredCount = answeredCount + (pendingIsNew ? 1 : 0);

  const handleConfirmAnswer = useCallback(
    (selected: 'A' | 'B' | 'C' | 'D') => {
      if (!currentQuestion) return;

      recordAnswer(currentQuestion.id, {
        question_id: currentQuestion.id,
        selected_option: selected,
        answered_at: Date.now(),
        idempotency_key: crypto.randomUUID(),
      });

      // Move to QUESTION_COOLDOWN, then auto-advance
      setPhase('QUESTION_COOLDOWN');

      if (currentQuestionIndex < totalQuestions - 1) {
        incrementQuestion();
        setPhase('PHASE_1_START');
      }
    },
    [currentQuestion, currentQuestionIndex, totalQuestions, recordAnswer, incrementQuestion, setPhase]
  );

  const handleNavigate = useCallback(
    (questionId: string) => {
      const idx = questions.findIndex((q) => q.id === questionId);
      if (idx >= 0) {
        // Direct navigation — set the question index via store
        // For EXAM type, navigating is allowed in PHASE_1_START and PHASE_3_MCQ
        useExamSessionStore.setState({ currentQuestionIndex: idx });
      }
    },
    [questions]
  );

  const navItems = questions.map((q, i) => ({
    questionId: q.id,
    index: i + 1,
    isAnswered: !!answers[q.id],
    isCurrent: i === currentQuestionIndex,
    isSkipped: false,
  }));

  // Show navigator in all phases EXCEPT PHASE_2_FLASH (unmounted, not hidden)
  const showNavigator = phase !== 'PHASE_2_FLASH';

  return (
    <div className="flex min-h-screen">
      {/* Left sidebar — question navigator */}
      {showNavigator && (
        <aside
          className="sticky top-0 flex h-screen flex-col border-r bg-white"
          style={{ width: '60px', borderColor: '#E2E8F0' }}
        >
          <QuestionNavigator
            items={navItems}
            onNavigate={handleNavigate}
            disabled={phase === 'QUESTION_COOLDOWN'}
          />
        </aside>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar: timer + sync indicator */}
        <header
          className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-2"
          style={{ borderColor: '#E2E8F0' }}
        >
          <ExamTimer expiresAt={expiresAt} onExpired={onTimeExpired} />
          <div className="flex items-center gap-3">
            <SyncIndicator status={syncStatus} />
            <button
              onClick={() => setShowSubmitDialog(true)}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3829]"
              style={{
                backgroundColor: '#1A3829',
                color: '#FFFFFF',
              }}
            >
              Submit Exam
            </button>
          </div>
        </header>

        {/* Question content */}
        {currentQuestion && (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-8">
            {/* Equation display */}
            <div
              className="text-center"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontVariantNumeric: 'tabular-nums',
                fontSize: 'clamp(24px, 4vw, 40px)',
                color: '#0F172A',
                lineHeight: '1.4',
                whiteSpace: 'pre',
              }}
            >
              {currentQuestion.equationDisplay}
            </div>

            {/* MCQ grid */}
            <McqGrid
              key={currentQuestion.id}
              options={currentQuestion.options}
              onConfirm={handleConfirmAnswer}
              disabled={phase === 'QUESTION_COOLDOWN'}
              onSelectionChange={setPendingSelection}
            />

            {/* Question counter */}
            <p
              className="text-sm"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontVariantNumeric: 'tabular-nums',
                color: '#94A3B8',
              }}
            >
              {currentQuestionIndex + 1} / {totalQuestions}
            </p>
          </div>
        )}
      </div>

      {/* Submit confirmation dialog */}
      <ConfirmSubmit
        open={showSubmitDialog}
        onCancel={() => setShowSubmitDialog(false)}
        onConfirm={() => {
          setShowSubmitDialog(false);
          onSubmit();
        }}
        answeredCount={displayedAnsweredCount}
        totalCount={totalQuestions}
      />
    </div>
  );
}
