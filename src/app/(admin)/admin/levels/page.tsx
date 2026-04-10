import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { LevelsClient, type LevelItem } from '@/components/levels/levels-client';

export default async function AdminLevelsPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();

  const [levelsRes, studentsRes] = await Promise.all([
    supabase
      .from('levels')
      .select('id, name, sequence_order, deleted_at')
      .eq('institution_id', institutionId)
      .order('sequence_order', { ascending: true }),

    supabase
      .from('students')
      .select('level_id')
      .eq('institution_id', institutionId)
      .is('deleted_at', null),
  ]);

  const levels = levelsRes.data ?? [];

  // Build enrolled count map
  const enrolledMap: Record<string, number> = {};
  for (const s of (studentsRes.data ?? [])) {
    if (s.level_id) {
      enrolledMap[s.level_id as string] = (enrolledMap[s.level_id as string] ?? 0) + 1;
    }
  }

  const levelItems: LevelItem[] = levels.map((l) => ({
    id: l.id as string,
    name: l.name as string,
    sequence_order: l.sequence_order as number,
    deleted_at: l.deleted_at as string | null,
    enrolled_count: enrolledMap[l.id as string] ?? 0,
  }));

  const maxSeq = levelItems.reduce((max, l) => Math.max(max, l.sequence_order), 0);
  const nextSequenceOrder = maxSeq + 1;

  return (
    <LevelsClient levels={levelItems} nextSequenceOrder={nextSequenceOrder} />
  );
}
