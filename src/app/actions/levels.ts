'use server';

import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';
import { z } from 'zod';

const CreateLevelSchema = z.object({
  name: z.string().min(1),
  sequence_order: z.number().int(),
});
export type CreateLevelInput = z.infer<typeof CreateLevelSchema>;

export async function createLevel(input: CreateLevelInput): Promise<ActionResult<{ level_id: string }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = CreateLevelSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  const { data: level, error } = await adminSupabase.from('levels').insert({
    institution_id: institutionId,
    name: validData.name,
    sequence_order: validData.sequence_order
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

const LevelOrderItemSchema = z.object({
  id: z.string().uuid(),
  sequence_order: z.number().int(),
});
export type LevelOrderItem = z.infer<typeof LevelOrderItemSchema>;

const UpdateLevelOrderSchema = z.array(LevelOrderItemSchema);

export async function updateLevelOrder(items: LevelOrderItem[]): Promise<ActionResult<null>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { institutionId } = authResult;

  const parsed = UpdateLevelOrderSchema.safeParse(items);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validItems = parsed.data;

  // Two-phase update to avoid unique constraint conflicts when swapping sequence_orders.
  // Phase 1: move all to high offsets (10000+) so no two rows collide.
  const OFFSET = 10000;
  const phase1 = await Promise.all(
    validItems.map((item) =>
      adminSupabase
        .from('levels')
        .update({ sequence_order: item.sequence_order + OFFSET })
        .eq('id', item.id)
        .eq('institution_id', institutionId),
    ),
  );
  if (phase1.find((r) => r.error)) return { error: 'INTERNAL_ERROR', message: 'Failed to update level order' };

  // Phase 2: move all to final values (no conflicts since all are now at 10000+).
  const phase2 = await Promise.all(
    validItems.map((item) =>
      adminSupabase
        .from('levels')
        .update({ sequence_order: item.sequence_order })
        .eq('id', item.id)
        .eq('institution_id', institutionId),
    ),
  );
  const failed = phase2.find((r) => r.error);
  if (failed) return { error: 'INTERNAL_ERROR', message: 'Failed to update level order' };

  return { ok: true, data: null };
}
