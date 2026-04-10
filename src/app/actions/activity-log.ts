'use server';

import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';

const PAGE_SIZE = 50;

export interface ActivityLogRow {
  id: string;
  timestamp: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  actor_email: string | null;
  actor_name: string | null;
}

export interface FetchLogsInput {
  page?: number;
  actionType?: string;
  userSearch?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchActivityLogs(
  input: FetchLogsInput = {}
): Promise<ActionResult<{ logs: ActivityLogRow[]; total: number }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { institutionId } = authResult;

  const { page = 1, actionType, userSearch, dateFrom, dateTo } = input;
  const offset = (page - 1) * PAGE_SIZE;

  // Resolve userSearch → user_ids first (can't filter on joined column in PostgREST)
  let userIdFilter: string[] | null = null;
  if (userSearch && userSearch.trim()) {
    const { data: matchedProfiles } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('institution_id', institutionId)
      .ilike('email', `%${userSearch.trim()}%`);
    userIdFilter = (matchedProfiles ?? []).map(p => p.id);
    if (userIdFilter.length === 0) {
      return { ok: true, data: { logs: [], total: 0 } };
    }
  }

  // Build paginated query
  let query = adminSupabase
    .from('activity_logs')
    .select('id, timestamp, action_type, entity_type, entity_id, metadata, ip_address, user_agent, user_id', { count: 'exact' })
    .eq('institution_id', institutionId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (actionType && actionType !== 'ALL') query = query.eq('action_type', actionType);
  if (dateFrom) query = query.gte('timestamp', `${dateFrom}T00:00:00.000Z`);
  if (dateTo) query = query.lte('timestamp', `${dateTo}T23:59:59.999Z`);
  if (userIdFilter) query = query.in('user_id', userIdFilter);

  const { data: rows, error, count } = await query;
  if (error) return { error: 'INTERNAL_ERROR', message: 'Failed to fetch activity logs' };

  // Fetch actor profiles for this page (two-step — no FK join assumption)
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

  const logs: ActivityLogRow[] = (rows ?? []).map(row => ({
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

  return { ok: true, data: { logs, total: count ?? 0 } };
}

export async function exportActivityLogsCsv(
  input: Omit<FetchLogsInput, 'page'> = {}
): Promise<ActionResult<{ csv: string }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { institutionId } = authResult;

  const { actionType, userSearch, dateFrom, dateTo } = input;

  let userIdFilter: string[] | null = null;
  if (userSearch && userSearch.trim()) {
    const { data: matchedProfiles } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('institution_id', institutionId)
      .ilike('email', `%${userSearch.trim()}%`);
    userIdFilter = (matchedProfiles ?? []).map(p => p.id);
    if (userIdFilter.length === 0) {
      return { ok: true, data: { csv: 'Timestamp (UTC),Actor Email,Action,Entity Type,Entity ID,IP Address\n' } };
    }
  }

  let query = adminSupabase
    .from('activity_logs')
    .select('id, timestamp, action_type, entity_type, entity_id, ip_address, user_id')
    .eq('institution_id', institutionId)
    .order('timestamp', { ascending: false })
    .limit(10000);

  if (actionType && actionType !== 'ALL') query = query.eq('action_type', actionType);
  if (dateFrom) query = query.gte('timestamp', `${dateFrom}T00:00:00.000Z`);
  if (dateTo) query = query.lte('timestamp', `${dateTo}T23:59:59.999Z`);
  if (userIdFilter) query = query.in('user_id', userIdFilter);

  const { data: rows, error } = await query;
  if (error) return { error: 'INTERNAL_ERROR', message: 'Failed to export logs' };

  // Bulk fetch all unique actor emails
  const userIds = [
    ...new Set(
      (rows ?? [])
        .map(r => r.user_id)
        .filter((id): id is string => id !== null && id !== undefined)
    ),
  ];
  const emailMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);
    for (const p of profiles ?? []) {
      emailMap[p.id] = p.email ?? '';
    }
  }

  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = 'Timestamp (UTC),Actor Email,Action,Entity Type,Entity ID,IP Address';
  const csvRows = (rows ?? []).map(row => [
    esc(new Date(row.timestamp).toISOString()),
    esc(row.user_id ? (emailMap[row.user_id] ?? '') : ''),
    esc(row.action_type),
    esc(row.entity_type),
    esc(row.entity_id ?? ''),
    esc(row.ip_address ?? ''),
  ].join(','));

  return { ok: true, data: { csv: [header, ...csvRows].join('\n') } };
}
