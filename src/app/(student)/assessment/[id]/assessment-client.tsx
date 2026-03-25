'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnzanFlashView } from '@/components/exam/anzan-flash-view';
import { ExamVerticalView } from '@/components/exam/exam-vertical-view';

interface AssessmentClientProps {
  assessmentId: string;
  assessmentType: 'EXAM' | 'TEST';
  sessionId: string;
  questions: Array<{
    id: string;
    equationDisplay: string | null;
    flashSequence: number[] | null;
    seed: string;
    orderIndex: number;
    options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
  }>;
  anzanConfig: {
    delayMs: number;
    digitCount: number;
    rowCount: number;
  };
}

/**
 * Client boundary for the assessment page.
 *
 * Routes to either AnzanFlashView (TEST) or ExamVerticalView (EXAM)
 * based on assessmentType.
 */
export function AssessmentClient({
  assessmentType,
  sessionId,
  questions,
  anzanConfig,
}: AssessmentClientProps) {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'offline' | 'error'>('synced');

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setSyncStatus('synced');
    };
    const handleOffline = () => {
      setIsOffline(true);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setIsOffline(true);
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (assessmentType === 'TEST') {
    return (
      <AnzanFlashView
        sessionId={sessionId}
        questions={questions}
        anzanConfig={anzanConfig}
        syncStatus={syncStatus}
        isOffline={isOffline}
        onNavigateResults={() => router.push('/student/results')}
        onNavigateDashboard={() => router.push('/student/dashboard')}
      />
    );
  }

  // EXAM type
  return (
    <ExamVerticalView
      questions={questions.map((q) => ({
        id: q.id,
        equationDisplay: q.equationDisplay ?? '',
        options: q.options,
        orderIndex: q.orderIndex,
      }))}
      expiresAt={null} // TODO: Wire from exam_papers.expires_at
      onSubmit={() => router.push('/student/results')}
      onTimeExpired={() => router.push('/student/results')}
      syncStatus={syncStatus}
    />
  );
}
