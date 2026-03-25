'use client';

import { useEffect, useRef, useCallback } from 'react';
import { generateFlashSequence, type NumberGeneratorConfig } from '@/lib/anzan/number-generator';
import { useExamSessionStore } from '@/stores/exam-session-store';
import { db } from '@/lib/offline/indexed-db-store';
import { startTabMonitor, stopTabMonitor } from '@/lib/anticheat/tab-monitor';
import { registerTeardownListener, removeTeardownListener } from '@/lib/anticheat/teardown';
import { startSyncEngine, stopSyncEngine } from '@/lib/offline/sync-engine';
import { initStorageProbe } from '@/lib/offline/storage-probe';

interface AnzanQuestion {
  id: string;
  flashSequence: number[] | null;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }>;
  orderIndex: number;
  /** Seed for reproducible PRNG — equals question UUID */
  seed: string;
}

interface AnzanConfig {
  delayMs: number;     // 200–2000
  digitCount: number;  // 1–5
  rowCount: number;    // 2–10
}

interface UseAnzanEngineOptions {
  /** Assessment session ID from server */
  sessionId: string;
  /** All questions for this assessment */
  questions: AnzanQuestion[];
  /** Flash anzan configuration from exam_papers */
  anzanConfig: AnzanConfig;
  /** Called when exam submission completes */
  onSubmitComplete: () => void;
  /** Called on unrecoverable error */
  onError: (error: string) => void;
}

interface AnzanEngineReturn {
  /** Computed flash sequence for the current question */
  currentSequence: number[];
  /** Current question data */
  currentQuestion: AnzanQuestion | null;
  /** Trigger the flash → MCQ transition for current question */
  handleFlashComplete: () => void;
  /** Record MCQ answer and advance */
  handleAnswerConfirm: (selected: 'A' | 'B' | 'C' | 'D') => void;
  /** Record skip and advance */
  handleSkip: () => void;
  /** Trigger final submission */
  handleSubmit: () => void;
  /** Whether the engine is fully initialised */
  isReady: boolean;
}

/**
 * Core hook that wires the entire Flash Anzan assessment engine.
 *
 * Owns:
 *   - Session lifecycle (init → teardown)
 *   - Phase transitions per FSD §1 state machine
 *   - Flash sequence generation via Mulberry32 PRNG
 *   - IndexedDB answer persistence (offline-first)
 *   - Sync engine start/stop
 *   - Tab monitor start/stop
 *   - Teardown listener registration
 *
 * Does NOT own:
 *   - RAF loop (FlashNumber component does that)
 *   - Visibility guard (FlashNumber component does that)
 *   - MCQ cooldown (useInputCooldown in McqGrid — cooldown elapses
 *     before onConfirm fires, so this hook never sets QUESTION_COOLDOWN)
 */
export function useAnzanEngine({
  sessionId,
  questions,
  anzanConfig,
  onSubmitComplete,
  onError,
}: UseAnzanEngineOptions): AnzanEngineReturn {
  const phase = useExamSessionStore((s) => s.phase);
  const currentQuestionIndex = useExamSessionStore((s) => s.currentQuestionIndex);
  const totalQuestions = useExamSessionStore((s) => s.totalQuestions);
  const setPhase = useExamSessionStore((s) => s.setPhase);
  const recordAnswer = useExamSessionStore((s) => s.recordAnswer);
  const incrementQuestion = useExamSessionStore((s) => s.incrementQuestion);
  const initSession = useExamSessionStore((s) => s.initSession);

  const onSubmitRef = useRef(onSubmitComplete);
  onSubmitRef.current = onSubmitComplete;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const isInitialised = useRef(false);

  // ---- 1. Session initialisation (runs once) ----
  useEffect(() => {
    if (isInitialised.current) return;
    isInitialised.current = true;

    // Init Zustand store
    initSession(sessionId, 'TEST', questions.length);

    // Init offline infrastructure
    initStorageProbe();
    startSyncEngine();
    startTabMonitor();
    registerTeardownListener();

    return () => {
      // TEARDOWN — mandatory cleanup
      stopTabMonitor();
      removeTeardownListener();
      stopSyncEngine();
    };
  }, [sessionId, questions.length, initSession]);

  // ---- 2. Generate flash sequence for current question ----
  const currentQuestion = questions[currentQuestionIndex] ?? null;

  const currentSequence = (() => {
    if (!currentQuestion) return [];
    // If the question has a pre-defined sequence, use it
    if (currentQuestion.flashSequence) return currentQuestion.flashSequence;

    // Otherwise generate via Mulberry32 PRNG (seeded with question UUID)
    const config: NumberGeneratorConfig = {
      count: anzanConfig.rowCount,
      min: Math.pow(10, anzanConfig.digitCount - 1),
      max: Math.pow(10, anzanConfig.digitCount) - 1,
      negative_probability: 0.3,
      difficulty: 3,
      seed: currentQuestion.seed,
    };

    try {
      return generateFlashSequence(config).numbers;
    } catch {
      onErrorRef.current('Failed to generate flash sequence');
      return [];
    }
  })();

  // ---- 3. Phase transition handlers ----

  /** PHASE_2_FLASH → PHASE_3_MCQ (flash sequence completed) */
  const handleFlashComplete = useCallback(() => {
    if (phase !== 'PHASE_2_FLASH') return;
    setPhase('PHASE_3_MCQ');
  }, [phase, setPhase]);

  /**
   * Advance after answer/skip.
   *
   * QUESTION_COOLDOWN is NOT set here — McqGrid owns cooldown timing
   * via useInputCooldown. By the time onConfirm fires, the 1200ms
   * cooldown has already elapsed. Setting QUESTION_COOLDOWN + PHASE_1_START
   * in the same synchronous call would cause React to batch them,
   * skipping the cooldown render entirely.
   */
  const advanceAfterAnswer = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      incrementQuestion();
      setPhase('PHASE_1_START');
    } else {
      // All questions done — enter SUBMITTED
      setPhase('SUBMITTED');
    }
  }, [currentQuestionIndex, totalQuestions, incrementQuestion, setPhase]);

  /** Record MCQ answer to IndexedDB + Zustand, then advance */
  const handleAnswerConfirm = useCallback(
    async (selected: 'A' | 'B' | 'C' | 'D') => {
      if (!currentQuestion || phase !== 'PHASE_3_MCQ') return;

      const idempotencyKey = crypto.randomUUID();
      const answeredAt = Date.now();

      const answer = {
        question_id: currentQuestion.id,
        selected_option: selected,
        answered_at: answeredAt,
        idempotency_key: idempotencyKey,
      };

      // 1. Write to Zustand (UI reactivity)
      recordAnswer(currentQuestion.id, answer);

      // 2. Write to IndexedDB FIRST (offline-first guarantee)
      try {
        await db.pendingAnswers.put({
          idempotency_key: idempotencyKey,
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_option: selected,
          answered_at: answeredAt,
          synced: false,
          created_at: Date.now(),
        });
      } catch {
        // IndexedDB write failed — answer is still in Zustand
        console.error('IndexedDB write failed for answer');
      }

      advanceAfterAnswer();
    },
    [currentQuestion, phase, sessionId, recordAnswer, advanceAfterAnswer]
  );

  /** Skip question (null answer) — TEST type Phase 3 only */
  const handleSkip = useCallback(async () => {
    if (!currentQuestion || phase !== 'PHASE_3_MCQ') return;

    const idempotencyKey = crypto.randomUUID();
    const answeredAt = Date.now();

    recordAnswer(currentQuestion.id, {
      question_id: currentQuestion.id,
      selected_option: null,
      answered_at: answeredAt,
      idempotency_key: idempotencyKey,
    });

    try {
      await db.pendingAnswers.put({
        idempotency_key: idempotencyKey,
        session_id: sessionId,
        question_id: currentQuestion.id,
        selected_option: null,
        answered_at: answeredAt,
        synced: false,
        created_at: Date.now(),
      });
    } catch {
      console.error('IndexedDB write failed for skip');
    }

    advanceAfterAnswer();
  }, [currentQuestion, phase, sessionId, recordAnswer, advanceAfterAnswer]);

  /** Final submission */
  const handleSubmit = useCallback(() => {
    if (phase !== 'SUBMITTED') {
      setPhase('SUBMITTED');
    }
    setPhase('TEARDOWN');
    onSubmitRef.current();
  }, [phase, setPhase]);

  return {
    currentSequence,
    currentQuestion,
    handleFlashComplete,
    handleAnswerConfirm,
    handleSkip,
    handleSubmit,
    isReady: isInitialised.current && currentQuestion !== null,
  };
}
