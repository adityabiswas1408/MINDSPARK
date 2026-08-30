import { create } from 'zustand';

export type ExamPhase =
  | 'IDLE'
  | 'LOBBY'
  | 'INTERSTITIAL'
  | 'PHASE_1_START'
  | 'PHASE_2_FLASH'
  | 'PHASE_3_MCQ'
  | 'QUESTION_COOLDOWN'
  | 'SUBMITTED'
  | 'TEARDOWN';

export interface AnswerPayload {
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  answered_at: number;
  idempotency_key: string;
  time_spent_ms: number;
}

interface ExamSessionState {
  phase: ExamPhase;
  isPaused: boolean;
  assessmentType: 'EXAM' | 'TEST';
  currentQuestionIndex: number;
  totalQuestions: number;
  
  // Stored as a Record instead of Map for native Zustand reactivity 
  answers: Record<string, AnswerPayload>;
  sessionId: string | null;
  serverTimestamp: number | null;
  completionSeal: string | null;
  rafHandle: number | null;
  cooldownStart: number | null;
  tabSwitchCount: number;

  // Actions
  setPhase: (newPhase: ExamPhase) => void;
  setPaused: (isPaused: boolean) => void;
  initSession: (
    sessionId: string,
    assessmentType: 'EXAM' | 'TEST',
    totalQuestions: number,
    serverTimestamp: number | null,
    completionSeal: string | null
  ) => void;
  recordAnswer: (questionId: string, answer: AnswerPayload) => void;
  incrementQuestion: () => void;
  setRafHandle: (handle: number | null) => void;
  setCooldownStart: (start: number | null) => void;
  setTabSwitchCount: (count: number) => void;
}

// Deterministic Transition Guard
function canTransition(from: ExamPhase, to: ExamPhase): boolean {
  const allowed: Record<ExamPhase, ExamPhase[]> = {
    IDLE: ['LOBBY'],
    LOBBY: ['INTERSTITIAL'],
    INTERSTITIAL: ['PHASE_1_START'],
    PHASE_1_START: ['PHASE_2_FLASH', 'PHASE_3_MCQ'],
    PHASE_2_FLASH: ['PHASE_3_MCQ'],
    PHASE_3_MCQ: ['QUESTION_COOLDOWN'],
    QUESTION_COOLDOWN: ['PHASE_1_START', 'SUBMITTED'],
    SUBMITTED: ['TEARDOWN'],
    TEARDOWN: [],
  };
  return allowed[from]?.includes(to) ?? false;
}

export const useExamSessionStore = create<ExamSessionState>((set, get) => ({
  phase: 'IDLE',
  isPaused: false,
  assessmentType: 'EXAM',
  currentQuestionIndex: 0,
  totalQuestions: 0,
  answers: {},
  sessionId: null,
  serverTimestamp: null,
  completionSeal: null,
  rafHandle: null,
  cooldownStart: null,
  tabSwitchCount: 0,

  setPhase: (newPhase: ExamPhase) => {
    const currentPhase = get().phase;
    if (!canTransition(currentPhase, newPhase)) {
      console.error(`Illegal state transition blocked: ${currentPhase} -> ${newPhase}`);
      return; 
    }
    set({ phase: newPhase });
  },

  setPaused: (isPaused) => set({ isPaused }),

  initSession: (sessionId, assessmentType, totalQuestions, serverTimestamp, completionSeal) =>
    set({
      sessionId,
      serverTimestamp,
      completionSeal,
      assessmentType,
      totalQuestions,
      currentQuestionIndex: 0,
      answers: {},
      isPaused: false,
      phase: 'IDLE',
    }),

  recordAnswer: (questionId, answer) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    })),

  incrementQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.totalQuestions),
    })),

  setRafHandle: (rafHandle) => set({ rafHandle }),
  setCooldownStart: (cooldownStart) => set({ cooldownStart }),
  setTabSwitchCount: (tabSwitchCount) => set({ tabSwitchCount }),
}));
