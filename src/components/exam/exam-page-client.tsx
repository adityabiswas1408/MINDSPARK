'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamSessionStore } from '@/stores/exam-session-store';
import { ExamVerticalView } from '@/components/exam/exam-vertical-view';
import { AnzanFlashView } from '@/components/exam/anzan-flash-view';
import { submitExam } from '@/app/actions/assessment-sessions';

interface ExamQuestion {
  id: string;
  equationDisplay: string;
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
}

export function ExamPageClient({
  sessionId,
  expiresAt,
  paperType,
  examQuestions = [],
  anzanQuestions = [],
  anzanConfig,
}: ExamPageClientProps) {
  const router = useRouter();
  const initSession = useExamSessionStore((s) => s.initSession);
  const setPhase = useExamSessionStore((s) => s.setPhase);
  const answers = useExamSessionStore((s) => s.answers);
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const finalAnswers = Object.values(answers);
    await submitExam({ session_id: sessionId, final_answers_snapshot: finalAnswers });
    // TODO: navigate to /student/results once that page is built
    router.push('/student/dashboard');
  };

  const handleTimeExpired = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const finalAnswers = Object.values(answers);
    await submitExam({ session_id: sessionId, final_answers_snapshot: finalAnswers });
    // TODO: navigate to /student/results once that page is built
    router.push('/student/dashboard');
  };

  const syncStatus: 'synced' | 'offline' | 'error' = isOnline ? 'synced' : 'offline';

  if (paperType === 'TEST') {
    return (
      <AnzanFlashView
        sessionId={sessionId}
        questions={anzanQuestions}
        anzanConfig={anzanConfig ?? { delayMs: 1000, digitCount: 1, rowCount: 5 }}
        syncStatus={syncStatus}
        isOffline={!isOnline}
        onNavigateResults={() => {
          // TODO: navigate to /student/results once that page is built
          router.push('/student/dashboard');
        }}
        onNavigateDashboard={() => router.push('/student/dashboard')}
      />
    );
  }

  return (
    <ExamVerticalView
      questions={examQuestions}
      expiresAt={expiresAt}
      onSubmit={handleSubmit}
      onTimeExpired={handleTimeExpired}
      syncStatus={syncStatus}
    />
  );
}
