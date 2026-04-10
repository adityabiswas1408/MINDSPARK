import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import {
  StudentsTableClient,
  type StudentRow,
  type LevelOption,
} from '@/components/students/students-table-client';

const PAGE_SIZE = 20;

export default async function AdminStudentsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const searchParams = await props.searchParams;

  const levelFilter = typeof searchParams.level_id === 'string' ? searchParams.level_id : '';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : '';
  const page = Math.max(1, parseInt(typeof searchParams.page === 'string' ? searchParams.page : '1', 10));

  const supabase = await createClient();

  // ── Levels for filter dropdown ───────────────────────────────────────────────
  const { data: levels } = await supabase
    .from('levels')
    .select('id, name, sequence_order')
    .eq('institution_id', institutionId)
    .is('deleted_at', null)
    .order('sequence_order', { ascending: true });

  // ── Build students query ─────────────────────────────────────────────────────
  let query = supabase
    .from('students')
    .select('id, full_name, roll_number, level_id, created_at, deleted_at, levels(id, name)', {
      count: 'exact',
    })
    .eq('institution_id', institutionId);

  if (levelFilter) {
    query = query.eq('level_id', levelFilter);
  }

  if (statusFilter === 'active') {
    query = query.is('deleted_at', null);
  } else if (statusFilter === 'inactive') {
    query = query.not('deleted_at', 'is', null);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: students, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  const safeStudents: StudentRow[] = (students ?? []).map((s) => ({
    id: s.id as string,
    full_name: s.full_name as string,
    roll_number: s.roll_number as string,
    level_id: s.level_id as string | null,
    created_at: s.created_at as string,
    deleted_at: s.deleted_at as string | null,
    levels: Array.isArray(s.levels)
      ? (s.levels[0] as { id: string; name: string } | null) ?? null
      : (s.levels as { id: string; name: string } | null),
  }));

  const safeLevels: LevelOption[] = (levels ?? []).map((l) => ({
    id: l.id as string,
    name: l.name as string,
    sequence_order: l.sequence_order as number,
  }));

  return (
    <div className="space-y-6">
      <StudentsTableClient
        students={safeStudents}
        levels={safeLevels}
        totalCount={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        currentLevelFilter={levelFilter}
        currentStatusFilter={statusFilter}
      />
    </div>
  );
}
