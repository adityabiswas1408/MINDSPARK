'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';

interface PublishResultInput {
  session_id: string;
}

interface PublishResultOutput {
  published:            true;
  result_published_at:  string;
}

export async function publishResult(input: PublishResultInput): Promise<ActionResult<PublishResultOutput>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId, role } = authResult;

  const supabase = await createClient();

  // Validate session exists
  const { data: session } = await supabase
    .from('submissions')
    .select('id, student_id, completed_at, paper_id, score, grade')
    .eq('id', input.session_id)
    .single();

  if (!session) return { error: 'NOT_FOUND', message: 'Session not found' };
  if (!session.completed_at) return { error: 'SESSION_NOT_COMPLETE', message: 'Cannot publish incomplete session' };

  if (role === 'teacher') {
    // Relying on RLS for now to ensure visibility. If teacher tries to publish an outside student,
    // they wouldn't have effectively bypassed RLS here thanks to the regular client fetch above.
  }

  if (session.score === null || session.grade === null) {
    return { error: 'VALIDATION_ERROR', message: 'Must calculate results before publishing.' };
  }

  const now = new Date().toISOString();

  await adminSupabase.from('submissions').update({ result_published_at: now }).eq('id', input.session_id);

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'submissions',
    entity_id: input.session_id,
    action_type: 'PUBLISH_RESULT'
  });

  return { ok: true, data: { published: true, result_published_at: now } };
}

interface UnpublishResultInput {
  session_id: string;
  reason:     string;
}

export async function unpublishResult(input: UnpublishResultInput): Promise<ActionResult<{ unpublished: true }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { data: session } = await supabase
    .from('submissions')
    .select('id')
    .eq('id', input.session_id)
    .single();

  if (!session) return { error: 'NOT_FOUND', message: 'Session not found' };

  await adminSupabase.from('submissions').update({ result_published_at: null }).eq('id', input.session_id);

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'submissions',
    entity_id: input.session_id,
    action_type: 'UNPUBLISH_RESULT',
    metadata: { reason: input.reason }
  });

  return { ok: true, data: { unpublished: true } };
}

interface ReEvaluateResultsInput {
  assessment_id: string;
  reason:        string;
}

interface ReEvaluateResultsOutput {
  recalculated_sessions: number;
}

export async function reEvaluateResults(input: ReEvaluateResultsInput): Promise<ActionResult<ReEvaluateResultsOutput>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { data: paper } = await supabase
    .from('exam_papers')
    .select('id, status, institution_id')
    .eq('id', input.assessment_id)
    .single();

  if (!paper || paper.institution_id !== institutionId) return { error: 'NOT_FOUND', message: 'Not found' };
  if (paper.status !== 'CLOSED') return { error: 'ASSESSMENT_NOT_CLOSED', message: 'Must be closed' };

  // Call calculate_results on all submissions
  const { data: subs } = await adminSupabase
    .from('submissions')
    .select('id')
    .eq('paper_id', input.assessment_id);

  let count = 0;
  if (subs && subs.length > 0) {
    for (const sub of subs) {
      await adminSupabase.rpc('calculate_results', { p_submission_id: sub.id });
      count++;
    }
  }

  await adminSupabase.from('submissions').update({ result_published_at: null }).eq('paper_id', input.assessment_id);

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'exam_papers',
    entity_id: input.assessment_id,
    action_type: 'RE_EVALUATE_RESULTS',
    metadata: { reason: input.reason, count }
  });

  return { ok: true, data: { recalculated_sessions: count } };
}

export async function publishResults(session_ids: string[]): Promise<ActionResult<{ published_count: number }>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  if (!session_ids.length) return { ok: true, data: { published_count: 0 } };

  const now = new Date().toISOString();

  const { error } = await adminSupabase
    .from('submissions')
    .update({ result_published_at: now })
    .in('id', session_ids);

  if (error) return { error: 'INTERNAL_ERROR', message: 'Failed to bulk publish results' };

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'submissions',
    entity_id: session_ids[0],
    action_type: 'BULK_PUBLISH_RESULTS',
    metadata: { count: session_ids.length },
  });

  return { ok: true, data: { published_count: session_ids.length } };
}
