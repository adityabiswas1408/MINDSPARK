'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createQuestion } from '@/app/actions/questions';
import { AssessmentType, WizardQuestion } from './wizard-types';

interface StepQuestionsProps {
  paper_id: string;
  questions: WizardQuestion[];
  assessment_type: AssessmentType;
  onQuestionAdded: (q: WizardQuestion) => void;
  onQuestionDeleted: (id: string) => void;
}

const EMPTY_FORM = {
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A' as string,
  marks: 1,
};

export function StepQuestions({
  paper_id,
  questions,
  assessment_type,
  onQuestionAdded,
  onQuestionDeleted,
}: StepQuestionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isMcq = assessment_type === 'EXAM';

  async function handleSave() {
    if (!form.question_text.trim()) {
      setFormError('Question text is required.');
      return;
    }
    setSaving(true);
    setFormError(null);

    const options = isMcq
      ? { A: form.option_a, B: form.option_b, C: form.option_c, D: form.option_d }
      : null;

    const result = await createQuestion({
      paper_id,
      question_type: isMcq ? 'mcq' : 'flash_anzan',
      question_text: form.question_text,
      options,
      correct_answer: form.correct_answer,
      marks: form.marks,
      order_index: questions.length,
    });

    setSaving(false);

    if (!result.ok) {
      setFormError(result.error ?? 'Failed to save question.');
      return;
    }

    onQuestionAdded({
      id: result.data.question_id,
      question_text: form.question_text,
      options: options ?? { A: '', B: '', C: '', D: '' },
      correct_answer: form.correct_answer,
      marks: form.marks,
      order_index: questions.length,
    });

    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div className="space-y-4 py-2">
      <div style={{ fontSize: '13px', color: '#475569' }}>
        {questions.length === 0
          ? 'No questions yet. Add at least 1 question to continue.'
          : `${questions.length} question${questions.length > 1 ? 's' : ''} added`}
      </div>

      {questions.length > 0 && (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div
              key={q.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '12px 14px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '12px', color: '#94A3B8', marginRight: '8px' }}>
                  Q{i + 1}
                </span>
                <span style={{ fontSize: '14px', color: '#0F172A' }}>{q.question_text}</span>
                <div style={{ marginTop: '4px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#D1FAE5',
                      color: '#065F46',
                    }}
                  >
                    ✓ {q.correct_answer}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '8px' }}>
                    {q.marks} mark{q.marks > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onQuestionDeleted(q.id)}
                style={{
                  marginLeft: '12px',
                  padding: '4px',
                  color: '#94A3B8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!showForm && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} /> Add Question
        </Button>
      )}

      {showForm && (
        <div
          style={{
            padding: '16px',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div className="space-y-3">
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Question text *
              </label>
              <textarea
                value={form.question_text}
                onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '14px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g. What is 12 × 8?"
              />
            </div>

            {isMcq && (
              <div className="grid grid-cols-2 gap-2">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                  <div key={letter}>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Option {letter}
                    </label>
                    <input
                      type="text"
                      value={form[`option_${letter.toLowerCase()}` as keyof typeof form] as string}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [`option_${letter.toLowerCase()}`]: e.target.value }))
                      }
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '13px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Correct answer
                </label>
                <select
                  value={form.correct_answer}
                  onChange={(e) => setForm((f) => ({ ...f, correct_answer: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: '14px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                >
                  {isMcq ? (
                    ['A', 'B', 'C', 'D'].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))
                  ) : (
                    <option value={form.correct_answer}>{form.correct_answer || 'Enter below'}</option>
                  )}
                </select>
                {!isMcq && (
                  <input
                    type="text"
                    value={form.correct_answer}
                    onChange={(e) => setForm((f) => ({ ...f, correct_answer: e.target.value }))}
                    placeholder="Correct answer value"
                    style={{
                      marginTop: '6px',
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: '13px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Marks
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.marks}
                  onChange={(e) => setForm((f) => ({ ...f, marks: Number(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: '14px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {formError && (
              <div style={{ fontSize: '13px', color: '#DC2626' }}>{formError}</div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Question'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setFormError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
