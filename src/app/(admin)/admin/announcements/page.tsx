import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { adminSupabase } from '@/lib/supabase/admin';
import AnnouncementsClient, { type AnnouncementCard, type Level } from './announcements-client';

export default async function AdminAnnouncementsPage() {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();

  // Levels for target audience dropdown
  const { data: levels } = await supabase
    .from('levels')
    .select('id, name')
    .eq('institution_id', institutionId)
    .order('sort_order');

  // Last 5 published announcements (RLS-bypassed for reads)
  const { data: announcements } = await adminSupabase
    .from('announcements')
    .select('id, title, published_at, target_level_id')
    .eq('institution_id', institutionId)
    .not('published_at', 'is', null)
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(5);

  const announcementIds = (announcements ?? []).map(a => a.id);

  // Bulk read counts — announcement_reads has RLS enabled, use adminSupabase
  const readCountMap: Record<string, number> = {};
  if (announcementIds.length > 0) {
    const { data: reads } = await adminSupabase
      .from('announcement_reads')
      .select('announcement_id')
      .in('announcement_id', announcementIds);
    for (const r of reads ?? []) {
      readCountMap[r.announcement_id] = (readCountMap[r.announcement_id] ?? 0) + 1;
    }
  }

  // Total students for this institution (denominator for read % bars)
  const { count: totalStudents } = await adminSupabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('institution_id', institutionId);

  const levelMap = Object.fromEntries((levels ?? []).map(l => [l.id, l.name]));

  const recentAnnouncements: AnnouncementCard[] = (announcements ?? []).map(a => ({
    id: a.id,
    title: a.title,
    published_at: a.published_at!,
    target_level_id: a.target_level_id,
    read_count: readCountMap[a.id] ?? 0,
    total_students: totalStudents ?? 0,
    level_name: a.target_level_id ? (levelMap[a.target_level_id] ?? null) : null,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Announcements</h1>
      <AnnouncementsClient
        levels={(levels ?? []) as Level[]}
        recentAnnouncements={recentAnnouncements}
        totalStudents={totalStudents ?? 0}
      />
    </div>
  );
}
