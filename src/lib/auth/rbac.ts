import { createClient } from '@/lib/supabase/server';

export type AppRole = 'student' | 'teacher' | 'admin';

export type RequireRoleResult = 
  | { userId: string; role: AppRole; institutionId: string }
  | { ok: false; error: 'UNAUTHORIZED' | 'FORBIDDEN'; message: string };

/**
 * Validates caller's JWT and extracts role securely.
 * MUST be called at the START of every Server Action.
 */
export async function requireRole(allowed: AppRole | AppRole[]): Promise<RequireRoleResult> {
  const supabase = await createClient();

  // 1. MUST use getUser() to securely validate the session via the Supabase Auth server.
  // getSession() only reads the JWT payload from cookies, which can be stale or tampered.
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Not authenticated' };
  }

  // 2. The role MUST be derived securely from app_metadata. Never from client payload.
  const role = user.app_metadata?.role as AppRole | undefined;

  if (!role) {
    return { ok: false, error: 'FORBIDDEN', message: 'No role assigned in JWT' };
  }

  const allowedArray = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedArray.includes(role)) {
    return { ok: false, error: 'FORBIDDEN', message: `Role '${role}' is not permitted` };
  }

  const institutionId = user.app_metadata?.institution_id as string;

  return { userId: user.id, role, institutionId };
}
