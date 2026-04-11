'use server';

import { randomUUID } from 'crypto';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';

interface ResetPasswordInput {
  user_id: string;
}

interface ResetPasswordOutput {
  reset: true;
  /** One-time temporary password — surfaced ONCE to the admin for hand-off.
   *  Never logged, never stored in activity_logs metadata. */
  temp_password: string;
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<ActionResult<ResetPasswordOutput>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) {
    return {
      error: authResult.error as unknown as 'UNAUTHORIZED',
      message: authResult.message,
    };
  }
  const { userId, institutionId } = authResult;

  // Generate a cryptographically-random 32-char temp password with guaranteed
  // inclusion of upper/lower/digit/symbol so it passes common password policies.
  // Never log this value; never persist it anywhere other than the auth row.
  const tempPassword = randomUUID().replace(/-/g, '') + '!Ab1';

  const { error } = await adminSupabase.auth.admin.updateUserById(input.user_id, {
    password: tempPassword,
  });

  if (error) return { error: 'INTERNAL_ERROR', message: error.message };

  // Force user to change password on their next login.
  await adminSupabase
    .from('profiles')
    .update({ forced_password_reset: true })
    .eq('id', input.user_id);

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'profiles',
    entity_id: input.user_id,
    action_type: 'RESET_PASSWORD',
    // Deliberately no password in metadata.
  });

  return { ok: true, data: { reset: true, temp_password: tempPassword } };
}
