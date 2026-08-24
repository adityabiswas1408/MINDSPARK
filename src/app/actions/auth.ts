'use server';

import { randomUUID } from 'crypto';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  user_id: z.string().uuid(),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

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

  const parsed = ResetPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  // Generate a cryptographically-random 32-char temp password with guaranteed
  // inclusion of upper/lower/digit/symbol so it passes common password policies.
  // Never log this value; never persist it anywhere other than the auth row.
  const tempPassword = randomUUID().replace(/-/g, '') + '!Ab1';

  const { error } = await adminSupabase.auth.admin.updateUserById(validData.user_id, {
    password: tempPassword,
  });

  if (error) return { error: 'INTERNAL_ERROR', message: error.message };

  // Force user to change password on their next login.
  await adminSupabase
    .from('profiles')
    .update({ forced_password_reset: true })
    .eq('id', validData.user_id);

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'profiles',
    entity_id: validData.user_id,
    action_type: 'RESET_PASSWORD',
    // Deliberately no password in metadata.
  });

  return { ok: true, data: { reset: true, temp_password: tempPassword } };
}
