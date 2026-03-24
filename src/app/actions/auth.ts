'use server';

import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';

interface ResetPasswordInput {
  user_id: string;  
}

export async function resetPassword(input: ResetPasswordInput): Promise<ActionResult<{ reset: true }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const tempPassword = 'tempPassword123!'; 
  const { error } = await adminSupabase.auth.admin.updateUserById(input.user_id, {
    password: tempPassword
  });

  if (error) return { error: 'INTERNAL_ERROR', message: error.message };

  await adminSupabase.from('profiles').update({ forced_password_reset: false }).eq('id', input.user_id);

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'profiles',
    entity_id: input.user_id,
    action_type: 'RESET_PASSWORD'
  });

  return { ok: true, data: { reset: true } };
}
