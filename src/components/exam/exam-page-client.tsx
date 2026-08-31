'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useExamSessionStore } from '@/stores/exam-session-store';
import { ExamVerticalView } from '@/components/exam/exam-vertical-view';
import { AnzanFlashView } from '@/components/exam/anzan-flash-view';
import { submitExam } from '@/app/actions/assessment-sessions';
import type { SyncStatus } from '@/components/exam/sync-indicator';
import { startTabMonitor, stopTabMonitor } from '@/lib/anticheat/tab-monitor';
import { registerTeardownListener, removeTeardownListener } from '@/lib/anticheat/teardown';
import { startSyncEngine, stopSyncEngine } from '@/lib/offline/sync-engine';
import { initStorageProbe } from '@/lib/offline/storage-probe';
import { createClient } from '@/lib/supabase/client';

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
  paperId: string;
  expiresAt: string;
  paperType: 'EXAM' | 'TEST';
  examQuestions?: ExamQuestion[];
  anzanQuestions?: AnzanQuestion[];
  anzanConfig?: { delayMs: number; digitCount: number; rowCount: number };
  tickerMode?: boolean;
  serverTimestamp?: number | null;
  completionSeal?: string | null;
}

export function ExamPageClient({
  sessionId,
  paperId,
  expiresAt,
  paperType,
  examQuestions = [],
  anzanQuestions = [],
  anzanConfig,
  tickerMode = false,
  serverTimestamp = null,
  completionSeal = null,
}: ExamPageClientProps) {
  const router = useRouter();
  const initSession = useExamSessionStore((s) => s.initSession);
  const setPhase = useExamSessionStore((s) => s.setPhase);
  const answers = useExamSessionStore((s) => s.answers);
  const tabSwitchCount = useExamSessionStore((s) => s.tabSwitchCount);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const examStartRef = useRef(Date.now());

  const totalQuestions =
    paperType === 'EXAM' ? examQuestions.length : anzanQuestions.length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    initSession(sessionId, paperType, totalQuestions, serverTimestamp, completionSeal);
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

    // Init anti-cheat and offline infrastructure
    initStorageProbe();
    startSyncEngine();
    startTabMonitor();
    registerTeardownListener();

    return () => {
      stopTabMonitor();
      removeTeardownListener();
      stopSyncEngine();
    };
  }, [sessionId, paperType, totalQuestions, serverTimestamp, completionSeal, initSession, setPhase]);

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
    
    // Presence tracking
    const supabase = createClient();
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
    const initPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      presenceChannel = supabase.channel(`lobby:${paperId}`, { config: { private: true } });
      presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel!.track({
            student_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });
    };
    initPresence();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncingTimerRef.current) clearTimeout(syncingTimerRef.current);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, [handleOnline, handleOffline, paperId]);



  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const finalAnswers = Object.values(answers);
    const wallElapsed = Math.round((Date.now() - examStartRef.current));
    const performanceElapsed = Math.round(performance.now());
    
    const clock_guard_submission = (serverTimestamp && completionSeal) ? {
      seal: completionSeal,
      server_timestamp: serverTimestamp,
      performance_elapsed: performanceElapsed,
      wall_elapsed: wallElapsed
    } : undefined;

    try {
      const result = await submitExam({ 
        session_id: sessionId, 
        final_answers_snapshot: finalAnswers,
        tab_switches: tabSwitchCount,
        clock_guard_submission
      });
      
      if (result.ok) {
        router.replace(`/student/assessment/${sessionId}/completion`);
      } else {
        console.error('Submission failed:', result.error);
        setSubmitError(result.message || 'Submission failed. Please check your connection and try again.');
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error('Submission error:', e);
      setSubmitError('A network error occurred while submitting. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  const handleTimeExpired = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const finalAnswers = Object.values(answers);
    const wallElapsed = Math.round((Date.now() - examStartRef.current));
    const performanceElapsed = Math.round(performance.now());
    
    const clock_guard_submission = (serverTimestamp && completionSeal) ? {
      seal: completionSeal,
      server_timestamp: serverTimestamp,
      performance_elapsed: performanceElapsed,
      wall_elapsed: wallElapsed
    } : undefined;

    try {
      const result = await submitExam({ 
        session_id: sessionId, 
        final_answers_snapshot: finalAnswers,
        tab_switches: tabSwitchCount,
        clock_guard_submission
      });
  
      if (result.ok) {
        router.replace(`/student/assessment/${sessionId}/completion`);
      } else {
        console.error('Time expired submission failed:', result.error);
        setSubmitError(result.message || 'Failed to submit exam. Please try again.');
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error('Time expired submission error:', e);
      setSubmitError('A network error occurred while submitting. Please try again.');
      setIsSubmitting(false);
    }
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
        serverTimestamp={serverTimestamp}
        completionSeal={completionSeal}
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
      {isMounted && submitError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg text-center font-medium">
          {submitError}
        </div>
      )}
      {isMounted && createPortal(
        <ExamVerticalView
          questions={examQuestions}
          expiresAt={expiresAt}
          onSubmit={handleSubmit}
          onTimeExpired={handleTimeExpired}
          syncStatus={syncStatus}
        />,
        document.body
      )}
    </>
  );
}
