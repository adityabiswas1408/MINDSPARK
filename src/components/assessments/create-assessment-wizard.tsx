'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createAssessment, updateAssessment, publishAssessment } from '@/app/actions/assessments';
import { StepType } from './step-type';
import { StepQuestions } from './step-questions';
import { StepConfig } from './step-config';
import { WizardState, WizardQuestion, WizardConfig } from './wizard-types';

interface CreateAssessmentWizardProps {
  levels: { id: string; name: string }[];
}

const INITIAL_CONFIG: WizardConfig = {
  title: '',
  level_id: '',
  duration_minutes: 30,
  delay_ms: 500,
  digit_count: 2,
  row_count: 5,
};

const INITIAL_STATE: WizardState = {
  step: 1,
  type: null,
  paper_id: null,
  questions: [],
  config: INITIAL_CONFIG,
};

export function CreateAssessmentWizard({ levels }: CreateAssessmentWizardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setIsOpen(false);
    setState(INITIAL_STATE);
    setError(null);
    setLoading(false);
  }

  function handleConfigChange(partial: Partial<WizardConfig>) {
    setState((s) => ({ ...s, config: { ...s.config, ...partial } }));
  }

  function handleQuestionAdded(q: WizardQuestion) {
    setState((s) => ({ ...s, questions: [...s.questions, q] }));
  }

  function handleQuestionDeleted(id: string) {
    setState((s) => ({
      ...s,
      questions: s.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, order_index: i })),
    }));
  }

  async function handleNext() {
    setError(null);

    if (state.step === 1) {
      if (!state.type) {
        setError('Please select an assessment type.');
        return;
      }
      if (!state.config.level_id) {
        setError('Please select a level.');
        return;
      }

      setLoading(true);
      const result = await createAssessment({
        title: 'Untitled Assessment',
        type: state.type,
        duration_minutes: 30,
        level_id: state.config.level_id,
      });
      setLoading(false);

      if (!result.ok) {
        setError(result.error ?? 'Failed to create assessment.');
        return;
      }

      setState((s) => ({ ...s, step: 2, paper_id: result.data.assessment_id }));
      return;
    }

    if (state.step === 2) {
      if (state.questions.length === 0) {
        setError('Add at least 1 question before continuing.');
        return;
      }
      setState((s) => ({ ...s, step: 3 }));
      return;
    }
  }

  function handleBack() {
    if (state.step > 1) {
      setState((s) => ({ ...s, step: (s.step - 1) as WizardState['step'] }));
      setError(null);
    }
  }

  async function handleSaveDraft() {
    if (!state.paper_id) return;
    if (!state.config.title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await updateAssessment({
      assessment_id: state.paper_id,
      title: state.config.title,
      duration_minutes: state.config.duration_minutes,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? 'Failed to save draft.');
      return;
    }

    handleClose();
    router.refresh();
  }

  async function handlePublish() {
    if (!state.paper_id) return;
    if (!state.config.title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const updateResult = await updateAssessment({
      assessment_id: state.paper_id,
      title: state.config.title,
      duration_minutes: state.config.duration_minutes,
    });

    if (!updateResult.ok) {
      setLoading(false);
      setError(updateResult.error ?? 'Failed to update assessment.');
      return;
    }

    const publishResult = await publishAssessment({ assessment_id: state.paper_id });
    setLoading(false);

    if (!publishResult.ok) {
      setError(publishResult.error ?? 'Failed to publish assessment.');
      return;
    }

    handleClose();
    router.refresh();
  }

  const stepLabels = ['Type', 'Questions', 'Config'];

  return (
    <>
      <Button onClick={() => setIsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Plus size={16} /> Create Assessment
      </Button>

      <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) handleClose(); }}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-lg"
          style={{ maxWidth: '580px', width: '100%' }}
        >
          <DialogHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <DialogTitle style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                New Assessment
              </DialogTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {stepLabels.map((label, i) => {
                  const stepNum = (i + 1) as WizardState['step'];
                  const isActive = state.step === stepNum;
                  const isDone = state.step > stepNum;
                  return (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: isActive ? '600' : '400',
                        color: isActive ? '#1A3829' : isDone ? '#64748B' : '#CBD5E1',
                      }}
                    >
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#1A3829' : isDone ? '#64748B' : '#E2E8F0',
                          color: isActive || isDone ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        {stepNum}
                      </span>
                      {label}
                      {i < 2 && (
                        <span style={{ color: '#CBD5E1', margin: '0 2px' }}>›</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogHeader>

          <div style={{ minHeight: '200px' }}>
            {state.step === 1 && (
              <>
                <StepType
                  onSelect={(type) => setState((s) => ({ ...s, type }))}
                  selected={state.type}
                  loading={loading}
                />
                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Level *
                  </label>
                  <select
                    value={state.config.level_id}
                    onChange={(e) => handleConfigChange({ level_id: e.target.value })}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '14px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select a level…</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {state.step === 2 && state.paper_id && (
              <StepQuestions
                paper_id={state.paper_id}
                questions={state.questions}
                assessment_type={state.type!}
                onQuestionAdded={handleQuestionAdded}
                onQuestionDeleted={handleQuestionDeleted}
              />
            )}

            {state.step === 3 && (
              <StepConfig
                config={state.config}
                assessment_type={state.type!}
                levels={levels}
                onChange={handleConfigChange}
              />
            )}
          </div>

          {error && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              {state.step > 1 && (
                <Button variant="ghost" onClick={handleBack} disabled={loading}>
                  ← Back
                </Button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {state.step < 3 ? (
                <Button onClick={handleNext} disabled={loading}>
                  {loading ? 'Creating…' : 'Continue →'}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
                    {loading ? 'Saving…' : 'Save Draft'}
                  </Button>
                  <Button onClick={handlePublish} disabled={loading}>
                    {loading ? 'Publishing…' : 'Publish'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
