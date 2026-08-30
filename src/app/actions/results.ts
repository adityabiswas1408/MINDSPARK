'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';
import { z } from 'zod';

const PublishResultSchema = z.object({
  session_id: z.string().uuid(),
});
export type PublishResultInput = z.infer<typeof PublishResultSchema>;

interface PublishResultOutput {
  published:            true;
  result_published_at:  string;
}

export async function publishResult(input: PublishResultInput): Promise<ActionResult<PublishResultOutput>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId, role } = authResult;

  const parsed = PublishResultSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  // Validate session exists and belongs to caller's institution
  const { data: session } = await adminSupabase
    .from('submissions')
    .select('id, student_id, completed_at, paper_id, score, grade, exam_papers!inner(institution_id)')
    .eq('id', validData.session_id)
    .maybeSingle();

  if (!session || (session.exam_papers as any).institution_id !== institutionId) return { error: 'NOT_FOUND', message: 'Session not found' };
  if (!session.completed_at) return { error: 'SESSION_NOT_COMPLETE', message: 'Cannot publish incomplete session' };

  if (session.score === null || session.grade === null) {
    return { error: 'VALIDATION_ERROR', message: 'Must calculate results before publishing.' };
  }

  const now = new Date().toISOString();

  await adminSupabase.from('submissions').update({ result_published_at: now }).eq('id', validData.session_id);

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'submissions',
    entity_id: validData.session_id,
    action_type: 'PUBLISH_RESULT'
  });

  return { ok: true, data: { published: true, result_published_at: now } };
}

const UnpublishResultSchema = z.object({
  session_id: z.string().uuid(),
  reason: z.string().min(1),
});
export type UnpublishResultInput = z.infer<typeof UnpublishResultSchema>;

export async function unpublishResult(input: UnpublishResultInput): Promise<ActionResult<{ unpublished: true }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = UnpublishResultSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  const { data: session } = await adminSupabase
    .from('submissions')
    .select('id, exam_papers!inner(institution_id)')
    .eq('id', validData.session_id)
    .maybeSingle();

  if (!session || (session.exam_papers as any).institution_id !== institutionId) return { error: 'NOT_FOUND', message: 'Session not found' };

  await adminSupabase.from('submissions').update({ result_published_at: null }).eq('id', validData.session_id);

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'submissions',
    entity_id: validData.session_id,
    action_type: 'UNPUBLISH_RESULT',
    metadata: { reason: validData.reason }
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

  // Call calculate_results for the paper
  const { data: rpcResult, error: rpcErr } = await adminSupabase.rpc('calculate_results', { p_paper_id: input.assessment_id });
  if (rpcErr) {
    console.error('[reEvaluateResults] RPC failed:', rpcErr);
    return { error: 'INTERNAL_ERROR', message: 'Failed to calculate results' };
  }
  const count = (rpcResult as any)?.submissions_scored ?? 0;

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

  // Filter session_ids to only those belonging to caller's institution
  const { data: validSessions } = await adminSupabase
    .from('submissions')
    .select('id, exam_papers!inner(institution_id)')
    .in('id', session_ids)
    .eq('exam_papers.institution_id', institutionId);

  if (!validSessions || validSessions.length === 0) {
    return { ok: true, data: { published_count: 0 } };
  }

  const validIds = validSessions.map(s => s.id);
  const now = new Date().toISOString();

  const { error } = await adminSupabase
    .from('submissions')
    .update({ result_published_at: now })
    .in('id', validIds);

  if (error) return { error: 'INTERNAL_ERROR', message: 'Failed to bulk publish results' };

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'submissions',
    entity_id: validIds[0], // just referencing the first one
    action_type: 'BULK_PUBLISH_RESULTS',
    metadata: { count: validIds.length },
  });

  return { ok: true, data: { published_count: validIds.length } };
}

const PublishAllPaperResultsSchema = z.object({
  paper_id: z.string().uuid()
});
export type PublishAllPaperResultsInput = z.infer<typeof PublishAllPaperResultsSchema>;

export async function publishAllPaperResults(input: PublishAllPaperResultsInput): Promise<ActionResult<{ published: true, count: number }>> {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = PublishAllPaperResultsSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  
  const { data: paper } = await adminSupabase
    .from('exam_papers')
    .select('id, status, institution_id')
    .eq('id', parsed.data.paper_id)
    .maybeSingle();
    
  if (!paper || paper.institution_id !== institutionId) return { error: 'NOT_FOUND', message: 'Paper not found' };
  if (paper.status !== 'CLOSED') return { error: 'ASSESSMENT_NOT_CLOSED', message: 'Must be closed before publishing all results' };

  const now = new Date().toISOString();

  // Update submissions
  const { data: updatedSubs, error: subsErr } = await adminSupabase
    .from('submissions')
    .update({ result_published_at: now })
    .eq('paper_id', parsed.data.paper_id)
    .not('completed_at', 'is', null)
    .select('id');
    
  if (subsErr) return { error: 'INTERNAL_ERROR', message: 'Failed to publish submissions' };

  // Update exam_papers
  const { error: paperErr } = await adminSupabase
    .from('exam_papers')
    .update({ result_published_at: now })
    .eq('id', parsed.data.paper_id);

  if (paperErr) return { error: 'INTERNAL_ERROR', message: 'Failed to update paper status' };

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'exam_papers',
    entity_id: parsed.data.paper_id,
    action_type: 'PUBLISH_ALL_PAPER_RESULTS',
    metadata: { count: updatedSubs?.length ?? 0 }
  });

  revalidatePath(`/admin/assessments/${parsed.data.paper_id}`);
  return { ok: true, data: { published: true, count: updatedSubs?.length ?? 0 } };
}

const UnpublishAllPaperResultsSchema = z.object({
  paper_id: z.string().uuid(),
  reason: z.string().min(1),
});
export type UnpublishAllPaperResultsInput = z.infer<typeof UnpublishAllPaperResultsSchema>;

export async function unpublishAllPaperResults(input: UnpublishAllPaperResultsInput): Promise<ActionResult<{ unpublished: true, count: number }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = UnpublishAllPaperResultsSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  
  const { data: paper } = await adminSupabase
    .from('exam_papers')
    .select('id, institution_id')
    .eq('id', parsed.data.paper_id)
    .maybeSingle();
    
  if (!paper || paper.institution_id !== institutionId) return { error: 'NOT_FOUND', message: 'Paper not found' };

  // Update submissions
  const { data: updatedSubs, error: subsErr } = await adminSupabase
    .from('submissions')
    .update({ result_published_at: null })
    .eq('paper_id', parsed.data.paper_id)
    .select('id');
    
  if (subsErr) return { error: 'INTERNAL_ERROR', message: 'Failed to unpublish submissions' };

  // Update exam_papers
  const { error: paperErr } = await adminSupabase
    .from('exam_papers')
    .update({ result_published_at: null })
    .eq('id', parsed.data.paper_id);

  if (paperErr) return { error: 'INTERNAL_ERROR', message: 'Failed to update paper status' };

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'exam_papers',
    entity_id: parsed.data.paper_id,
    action_type: 'UNPUBLISH_ALL_PAPER_RESULTS',
    metadata: { reason: parsed.data.reason, count: updatedSubs?.length ?? 0 }
  });

  revalidatePath(`/admin/assessments/${parsed.data.paper_id}`);
  return { ok: true, data: { unpublished: true, count: updatedSubs?.length ?? 0 } };
}

export async function releaseAnswerKey(
  paperId: string,
): Promise<ActionResult<{ paperId: string; releasedAt: string }>> {
  const auth = await requireRole('admin');
  if ('error' in auth) return { error: auth.error, message: auth.message };

  const releasedAt = new Date().toISOString();

  // Pre-flight: confirm the paper exists in this institution
  const { data: existing, error: selErr } = await adminSupabase
    .from('exam_papers')
    .select('id')
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId)
    .maybeSingle();
  if (selErr) return { error: 'INTERNAL_ERROR', message: selErr.message };
  if (!existing) return { error: 'NOT_FOUND', message: 'Paper not found' };

  const { error: updErr } = await adminSupabase
    .from('exam_papers')
    .update({
      answer_key_released: true,
      answer_key_released_at: releasedAt,
      answer_key_released_by: auth.userId,
    })
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId);
  if (updErr) return { error: 'INTERNAL_ERROR', message: 'Failed to release answer key' };

  await adminSupabase.from('activity_logs').insert({
    user_id: auth.userId,
    institution_id: auth.institutionId,
    action_type: 'BULK_RELEASE_ANSWER_KEY',
    entity_type: 'exam_paper',
    entity_id: paperId,
  });

  revalidatePath(`/admin/assessments/${paperId}`);
  return { ok: true, data: { paperId, releasedAt } };
}

export async function unreleaseAnswerKey(
  paperId: string,
): Promise<ActionResult<{ paperId: string }>> {
  const auth = await requireRole('admin');
  if ('error' in auth) return { error: auth.error, message: auth.message };

  // Pre-flight as above
  const { data: existing, error: selErr } = await adminSupabase
    .from('exam_papers')
    .select('id')
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId)
    .maybeSingle();
  if (selErr) return { error: 'INTERNAL_ERROR', message: selErr.message };
  if (!existing) return { error: 'NOT_FOUND', message: 'Paper not found' };

  // NB: only flip the boolean. Do NOT clear `_at` / `_by` — keeps the audit trail.
  const { error: updErr } = await adminSupabase
    .from('exam_papers')
    .update({ answer_key_released: false })
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId);
  if (updErr) return { error: 'INTERNAL_ERROR', message: 'Failed to unrelease answer key' };

  await adminSupabase.from('activity_logs').insert({
    user_id: auth.userId,
    institution_id: auth.institutionId,
    action_type: 'BULK_UNRELEASE_ANSWER_KEY',
    entity_type: 'exam_paper',
    entity_id: paperId,
  });

  revalidatePath(`/admin/assessments/${paperId}`);
  return { ok: true, data: { paperId } };
}
