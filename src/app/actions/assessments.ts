'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { REOPEN_WINDOW_MS } from '@/lib/constants';
import { z } from 'zod';

const CreateAssessmentSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['EXAM', 'TEST']),
  duration_minutes: z.number().int().positive(),
  per_question_time_seconds: z.number().int().min(5).max(600).optional().nullable(),
  level_id: z.string().uuid(),
});
export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;

export async function createAssessment(input: CreateAssessmentInput): Promise<ActionResult<{ assessment_id: string }>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = CreateAssessmentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  }
  const validData = parsed.data;

  const supabase = await createClient();

  const { data: assessment, error } = await supabase
    .from('exam_papers')
    .insert({
      title: validData.title,
      type: validData.type,
      duration_minutes: validData.duration_minutes,
      per_question_time_seconds: validData.per_question_time_seconds,
      level_id: validData.level_id,
      institution_id: institutionId,
      status: 'DRAFT',
      created_by: userId
    })
    .select('id')
    .single();

  if (error || !assessment) {
    return { error: 'VALIDATION_ERROR' };
  }

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'assessment',
    entity_id: assessment.id,
    action_type: 'CREATE_ASSESSMENT'
  });

  return { ok: true, data: { assessment_id: assessment.id } };
}

const UpdateAssessmentSchema = z.object({
  assessment_id: z.string().uuid(),
  title: z.string().min(1).optional(),
  duration_minutes: z.number().int().positive().optional(),
  per_question_time_seconds: z.number().int().min(5).max(600).optional().nullable(),
});
export type UpdateAssessmentInput = z.infer<typeof UpdateAssessmentSchema>;

export async function updateAssessment(input: UpdateAssessmentInput): Promise<ActionResult<{ updated: true }>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = UpdateAssessmentSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  const supabase = await createClient();

  // Check locking state
  const { data: current, error: checkErr } = await supabase
    .from('exam_papers')
    .select('status')
    .eq('id', input.assessment_id)
    .single();

  if (checkErr || !current) return { error: 'NOT_FOUND' };
  if (current.status === 'LIVE' || current.status === 'CLOSED') {
    return { error: 'ASSESSMENT_LOCKED' };
  }

  const updates: Record<string, unknown> = {};
  if (validData.title !== undefined) updates.title = validData.title;
  if (validData.duration_minutes !== undefined) updates.duration_minutes = validData.duration_minutes;
  if (validData.per_question_time_seconds !== undefined) updates.per_question_time_seconds = validData.per_question_time_seconds;

  const { error: updateErr } = await supabase
    .from('exam_papers')
    .update(updates)
    .eq('id', input.assessment_id);

  if (updateErr) return { error: 'VALIDATION_ERROR' };

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'assessment',
    entity_id: input.assessment_id,
    action_type: 'UPDATE_ASSESSMENT',
    metadata: { changes: input } as unknown as Record<string, string>
  });

  return { ok: true, data: { updated: true } };
}

interface PublishAssessmentInput {
  assessment_id: string;
}

export async function publishAssessment(input: PublishAssessmentInput): Promise<ActionResult<{ published_at: string }>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('paper_id', input.assessment_id);

  if (count === 0) return { error: 'VALIDATION_ERROR', message: 'Must have at least one question' };

  const { data: assessment, error } = await supabase
    .from('exam_papers')
    .update({ status: 'PUBLISHED' })
    .eq('id', input.assessment_id)
    .eq('status', 'DRAFT')
    .select('id')
    .single();

  if (error || !assessment) return { error: 'ASSESSMENT_LOCKED' };

  const publishedAt = new Date().toISOString();

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'assessment',
    entity_id: input.assessment_id,
    action_type: 'PUBLISH_ASSESSMENT'
  });

  return { ok: true, data: { published_at: publishedAt } };
}

interface ForceOpenExamInput {
  assessment_id: string;
}

export async function forceOpenExam(input: ForceOpenExamInput): Promise<ActionResult<{ status: 'LIVE' }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { data: current, error: fetchErr } = await supabase
    .from('exam_papers')
    .select('status, closed_at')
    .eq('id', input.assessment_id)
    .single();

  if (fetchErr || !current) return { error: 'NOT_FOUND' };
  
  if (current.status === 'CLOSED') {
    if (!current.closed_at) return { error: 'VALIDATION_ERROR', message: 'Missing closed_at timestamp' };
    const closedAt = new Date(current.closed_at).getTime();
    if (Date.now() - closedAt > REOPEN_WINDOW_MS) {
      return { error: 'ASSESSMENT_LOCKED', message: 'Reopen window expired' };
    }
  } else if (current.status !== 'PUBLISHED') {
    return { error: 'VALIDATION_ERROR', message: `Cannot open from status ${current.status}` };
  }

  const { data: assessment, error } = await supabase
    .from('exam_papers')
    .update({ status: 'LIVE', opened_at: new Date().toISOString() })
    .eq('id', input.assessment_id)
    .select('id, status')
    .single();

  if (error || !assessment) return { error: 'VALIDATION_ERROR' };

  await supabase.channel(`exam:${assessment.id}`).send({
    type: 'broadcast',
    event: 'exam_live',
    payload: { action: 'open', timestamp: Date.now() }
  });

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'assessment',
    entity_id: assessment.id,
    action_type: 'FORCE_OPEN_EXAM'
  });

  return { ok: true, data: { status: 'LIVE' } };
}

interface ForceCloseExamInput {
  assessment_id: string;
}

export async function forceCloseExam(input: ForceCloseExamInput): Promise<ActionResult<{ status: 'CLOSED' }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { data: assessment, error } = await supabase
    .from('exam_papers')
    .update({ 
      status: 'CLOSED',
      closed_at: new Date().toISOString()
    })
    .eq('id', input.assessment_id)
    .eq('status', 'LIVE')
    .select('id, status')
    .single();

  if (error || !assessment) return { error: 'VALIDATION_ERROR' };

  await supabase.channel(`exam:${assessment.id}`).send({
    type: 'broadcast',
    event: 'exam_closed',
    payload: { action: 'close', timestamp: Date.now() }
  });

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'assessment',
    entity_id: assessment.id,
    action_type: 'FORCE_CLOSE_EXAM'
  });

  return { ok: true, data: { status: 'CLOSED' } };
}
