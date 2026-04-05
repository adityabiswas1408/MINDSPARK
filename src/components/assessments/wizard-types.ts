export type AssessmentType = 'EXAM' | 'TEST';

export type WizardStep = 1 | 2 | 3;

export interface WizardQuestion {
  id: string;
  question_text: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  marks: number;
  order_index: number;
}

export interface WizardConfig {
  title: string;
  level_id: string;
  duration_minutes: number;
  delay_ms: number;
  digit_count: number;
  row_count: number;
}

export interface WizardState {
  step: WizardStep;
  type: AssessmentType | null;
  paper_id: string | null;
  questions: WizardQuestion[];
  config: WizardConfig;
}
