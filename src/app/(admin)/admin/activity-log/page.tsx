import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';
import ActivityLogClient from './activity-log-client';
import type { ActivityLogRow } from '@/app/actions/activity-log';

const PAGE_SIZE = 50;

export default async function AdminActivityLogPage() {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  // Initial fetch — first page, no filters
  const { data: rows, count } = await adminSupabase
    .from('activity_logs')
    .select(
      'id, timestamp, action_type, entity_type, entity_id, metadata, ip_address, user_agent, user_id',
      { count: 'exact' }
    )
    .eq('institution_id', institutionId)
    .order('timestamp', { ascending: false })
    .range(0, PAGE_SIZE - 1);

  // Two-step actor profile lookup
  const userIds = [
    ...new Set(
      (rows ?? [])
        .map(r => r.user_id)
        .filter((id): id is string => id !== null && id !== undefined)
    ),
  ];
  const profileMap: Record<string, { email: string | null; full_name: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);
    for (const p of profiles ?? []) {
      profileMap[p.id] = { email: p.email, full_name: p.full_name };
    }
  }

  const initialLogs: ActivityLogRow[] = (rows ?? []).map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    action_type: row.action_type,
    entity_type: row.entity_type,
    entity_id: row.entity_id ?? null,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    ip_address: row.ip_address ?? null,
    user_agent: row.user_agent ?? null,
    actor_email: row.user_id ? (profileMap[row.user_id]?.email ?? null) : null,
    actor_name: row.user_id ? (profileMap[row.user_id]?.full_name ?? null) : null,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Activity Log</h1>
      <ActivityLogClient
        initialLogs={initialLogs}
        initialTotal={count ?? 0}
      />
    </div>
  );
}
