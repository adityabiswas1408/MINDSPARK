'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';

export async function fetchActivityLogs(): Promise<ActionResult<{ logs: Record<string, unknown>[] }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { institutionId } = authResult;

  const supabase = await createClient();
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { error: 'INTERNAL_ERROR', message: 'Failed to fetch logs' };

  return { ok: true, data: { logs: logs || [] } };
}
