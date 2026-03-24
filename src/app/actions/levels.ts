'use server';

import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';

interface CreateLevelInput {
  name: string;
  sequence_order: number;
}

export async function createLevel(input: CreateLevelInput): Promise<ActionResult<{ level_id: string }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as any, message: authResult.message };
  const { userId, institutionId } = authResult;

  const { data: level, error } = await adminSupabase.from('levels').insert({
    institution_id: institutionId,
    name: input.name,
    sequence_order: input.sequence_order
  }).select('id').single();

  if (error || !level) return { error: 'INTERNAL_ERROR', message: 'Failed' };

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'levels',
    entity_id: level.id,
    action_type: 'CREATE_LEVEL'
  });

  return { ok: true, data: { level_id: level.id } };
}
