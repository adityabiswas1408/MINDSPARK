'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useExamSessionStore } from '@/stores/exam-session-store';
import { ExamVerticalView } from '@/components/exam/exam-vertical-view';
import { AnzanFlashView } from '@/components/exam/anzan-flash-view';
import { CompletionCard } from '@/components/exam/completion-card';
import { submitExam } from '@/app/actions/assessment-sessions';
import type { SyncStatus } from '@/components/exam/sync-indicator';

interface ExamQuestion {
  id: string;
  equationDisplay: string;
  correctOption: 'A' | 'B' | 'C' | 'D' | null;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
  orderIndex: number;
}

interface AnzanQuestion {
  id: string;
  flashSequence: number[] | null;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
  orderIndex: number;
  seed: string;
}

interface ExamPageClientProps {
  sessionId: string;
  expiresAt: string;
  paperType: 'EXAM' | 'TEST';
  examQuestions?: ExamQuestion[];
  anzanQuestions?: AnzanQuestion[];
  anzanConfig?: { delayMs: number; digitCount: number; rowCount: number };
  tickerMode?: boolean;
}

export function ExamPageClient({
  sessionId,
  expiresAt,
  paperType,
  examQuestions = [],
  anzanQuestions = [],
  anzanConfig,
  tickerMode = false,
}: ExamPageClientProps) {
  const router = useRouter();
  const initSession = useExamSessionStore((s) => s.initSession);
  const setPhase = useExamSessionStore((s) => s.setPhase);
  const answers = useExamSessionStore((s) => s.answers);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const examStartRef = useRef(Date.now());

  const totalQuestions =
    paperType === 'EXAM' ? examQuestions.length : anzanQuestions.length;

  useEffect(() => {
    initSession(sessionId, paperType, totalQuestions);
    // initSession resets phase to IDLE. Chain through required transitions:
    // IDLE → LOBBY (guard only allows IDLE→LOBBY)
    setPhase('LOBBY');
    if (paperType === 'EXAM') {
      // EXAM skips flash entirely: LOBBY → INTERSTITIAL → PHASE_1_START → PHASE_3_MCQ
      setPhase('INTERSTITIAL');
      setPhase('PHASE_1_START');
      setPhase('PHASE_3_MCQ');
    }
    // TEST: stop at LOBBY — AnzanFlashView picks up from there
  }, [sessionId, paperType, totalQuestions, initSession, setPhase]);

  const syncingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOnline = useCallback(() => {
    setSyncStatus('syncing');
    syncingTimerRef.current = setTimeout(() => setSyncStatus('synced'), 3000);
  }, []);

  const handleOffline = useCallback(() => {
    if (syncingTimerRef.current) clearTimeout(syncingTimerRef.current);
    setSyncStatus('offline');
  }, []);

  useEffect(() => {
    if (!navigator.onLine) setSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncingTimerRef.current) clearTimeout(syncingTimerRef.current);
    };
  }, [handleOnline, handleOffline]);

  function computeScore(questions: ExamQuestion[], answerMap: typeof answers) {
    const correct = questions.filter(
      (q) => q.correctOption !== null && answerMap[q.id]?.selected_option === q.correctOption
    ).length;
    return {
      correctCount: correct,
      scorePercent: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const finalAnswers = Object.values(answers);
    const result = await submitExam({ session_id: sessionId, final_answers_snapshot: finalAnswers });
    const elapsed = Math.round((Date.now() - examStartRef.current) / 1000);
    const { correctCount: c, scorePercent: s } = computeScore(examQuestions, answers);
    setCorrectCount(c);
    setScorePercent(s);
    setTimeTakenSeconds(elapsed);
    void result; // session is closed server-side regardless of result shape
    setSubmitted(true);
  };

  const handleTimeExpired = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const finalAnswers = Object.values(answers);
    const result = await submitExam({ session_id: sessionId, final_answers_snapshot: finalAnswers });
    const elapsed = Math.round((Date.now() - examStartRef.current) / 1000);
    const { correctCount: c, scorePercent: s } = computeScore(examQuestions, answers);
    setCorrectCount(c);
    setScorePercent(s);
    setTimeTakenSeconds(elapsed);
    if (result.ok || !result.ok) setSubmitted(true);
  };

  if (paperType === 'TEST') {
    return (
      <AnzanFlashView
        sessionId={sessionId}
        questions={anzanQuestions}
        anzanConfig={anzanConfig ?? { delayMs: 1000, digitCount: 1, rowCount: 5 }}
        tickerMode={tickerMode}
        syncStatus={syncStatus}
        isOffline={syncStatus === 'offline'}
        onNavigateResults={() => {
          // TODO: navigate to /student/results once that page is built
          router.push('/student/dashboard');
        }}
        onNavigateDashboard={() => router.push('/student/dashboard')}
      />
    );
  }

  return (
    <>
      {createPortal(
        <ExamVerticalView
          questions={examQuestions}
          expiresAt={expiresAt}
          onSubmit={handleSubmit}
          onTimeExpired={handleTimeExpired}
          syncStatus={syncStatus}
        />,
        document.body
      )}
      {submitted && createPortal(
      <CompletionCard
        visible={submitted}
        assessmentType="EXAM"
        scorePercent={scorePercent}
        correctCount={correctCount}
        totalCount={examQuestions.length}
        timeTakenSeconds={timeTakenSeconds}
        onViewResults={() => router.push('/student/results')}
        onBackToDashboard={() => router.push('/student/dashboard')}
      />, document.body)}
    </>
  );
}
