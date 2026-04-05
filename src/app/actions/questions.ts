'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';

interface CreateQuestionInput {
  paper_id: string;
  question_type: 'mcq' | 'fill_blank' | 'flash_anzan';
  question_text: string;
  options: { A: string; B: string; C: string; D: string } | null;
  correct_answer: string;
  marks: number;
  order_index: number;
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<ActionResult<{ question_id: string }>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { data: paper, error: paperErr } = await supabase
    .from('exam_papers')
    .select('id, status')
    .eq('id', input.paper_id)
    .eq('institution_id', institutionId)
    .single();

  if (paperErr || !paper) return { error: 'NOT_FOUND' };
  if (paper.status === 'LIVE' || paper.status === 'CLOSED') {
    return { error: 'ASSESSMENT_LOCKED' };
  }

  const { data: question, error: insertErr } = await supabase
    .from('questions')
    .insert({
      paper_id: input.paper_id,
      question_type: input.question_type,
      question_text: input.question_text,
      options: input.options,
      correct_answer: { value: input.correct_answer },
      marks: input.marks,
      order_index: input.order_index,
    })
    .select('id')
    .single();

  if (insertErr || !question) return { error: 'VALIDATION_ERROR' };

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'question',
    entity_id: question.id,
    action_type: 'CREATE_QUESTION',
  });

  return { ok: true, data: { question_id: question.id } };
}

export async function deleteQuestion(
  question_id: string
): Promise<ActionResult<{ deleted: true }>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error };
  const { institutionId } = authResult;

  const supabase = await createClient();

  const { data: question, error: fetchErr } = await supabase
    .from('questions')
    .select('id, exam_papers!inner(institution_id, status)')
    .eq('id', question_id)
    .single();

  if (fetchErr || !question) return { error: 'NOT_FOUND' };

  const paper = (question as unknown as { exam_papers: { institution_id: string; status: string } }).exam_papers;
  if (paper.institution_id !== institutionId) return { error: 'NOT_FOUND' };
  if (paper.status === 'LIVE' || paper.status === 'CLOSED') {
    return { error: 'ASSESSMENT_LOCKED' };
  }

  const { error: deleteErr } = await supabase
    .from('questions')
    .delete()
    .eq('id', question_id);

  if (deleteErr) return { error: 'VALIDATION_ERROR' };

  return { ok: true, data: { deleted: true } };
}

export async function reorderQuestions(
  paper_id: string,
  ordered_ids: string[]
): Promise<ActionResult<{ reordered: true }>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error };

  const supabase = await createClient();

  await Promise.all(
    ordered_ids.map((id, index) =>
      supabase
        .from('questions')
        .update({ order_index: index })
        .eq('id', id)
        .eq('paper_id', paper_id)
    )
  );

  return { ok: true, data: { reordered: true } };
}
