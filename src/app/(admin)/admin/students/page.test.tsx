// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import AdminStudentsPage from './page';

const mocks = vi.hoisted(() => ({
  client: {} as any
}));

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn().mockResolvedValue({
    userId: '99999999-9999-9999-9999-999999999999',
    institutionId: '11111111-1111-1111-1111-111111111111',
    role: 'admin',
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => mocks.client)
}));

import { adminSupabase } from '@/lib/supabase/admin';
mocks.client = adminSupabase;

// Mock the client component so we just test the server-side data fetching
vi.mock('@/components/students/students-table-client', () => ({
  StudentsTableClient: (props: any) => {
    return <div data-testid="table-mock">{JSON.stringify(props.students)}</div>;
  }
}));

describe('Admin Students Page Server-Side Search', () => {
  const instId = '11111111-1111-1111-1111-111111111111';
  let levelId = '';
  let cohortId = '';
  let authUsersToCleanup: string[] = [];

  beforeAll(async () => {
    await adminSupabase.from('institutions').upsert({ id: instId, name: 'Search Inst', slug: 'search-inst' });
    const { data: level } = await adminSupabase
      .from('levels')
      .upsert({ institution_id: instId, name: 'Search Level', sequence_order: 1 }, { onConflict: 'institution_id,sequence_order' })
      .select('id')
      .single();
    levelId = level!.id;

    let { data: cohort } = await adminSupabase
      .from('cohorts')
      .select('id')
      .eq('institution_id', instId)
      .eq('name', 'Search Cohort')
      .maybeSingle();
    if (!cohort) {
      const res = await adminSupabase
        .from('cohorts')
        .insert({ institution_id: instId, name: 'Search Cohort', status: 'active' })
        .select('id')
        .single();
      cohort = res.data;
    }
    cohortId = cohort!.id;

    const ts = Date.now();
    
    // Create Waldo FIRST so he is the oldest (pushed to page 2 by newer students)
    const { data: u25 } = await adminSupabase.auth.admin.createUser({
      email: `search-student-${ts}-waldo@test.com`,
      password: 'password',
      email_confirm: true
    });
    authUsersToCleanup.push(u25.user!.id);
    
    await adminSupabase.from('profiles').insert({
      id: u25.user!.id,
      institution_id: instId,
      role: 'student',
      full_name: 'Waldo Hidden',
      email: `search-student-${ts}-waldo@test.com`
    });

    await adminSupabase.from('students').insert({
      id: u25.user!.id,
      institution_id: instId,
      level_id: levelId,
      cohort_id: cohortId,
      full_name: 'Waldo Hidden',
      roll_number: `WALDO-${ts}`
    });

    // Create 24 newer students
    for (let i = 0; i < 24; i++) {
      const { data: u } = await adminSupabase.auth.admin.createUser({
        email: `search-student-${ts}-${i}@test.com`,
        password: 'password',
        email_confirm: true
      });
      authUsersToCleanup.push(u.user!.id);
      
      await adminSupabase.from('profiles').insert({
        id: u.user!.id,
        institution_id: instId,
        role: 'student',
        full_name: `Student ${i}`,
        email: `search-student-${ts}-${i}@test.com`
      });

      await adminSupabase.from('students').insert({
        id: u.user!.id,
        institution_id: instId,
        level_id: levelId,
        cohort_id: cohortId,
        full_name: `Student ${i}`,
        roll_number: `ROLL-${ts}-${i}`
      });
    }
  }, 30000); // 30s timeout

  afterAll(async () => {
    for (const id of authUsersToCleanup) {
      await adminSupabase.auth.admin.deleteUser(id);
    }
  });

  it('finds a student on page 2 using server-side search parameter', async () => {
    // If we render with no search, Waldo is on page 2 (assuming 20 per page, created_at desc)
    const renderNoSearch = await AdminStudentsPage({ searchParams: Promise.resolve({ page: '1' }) });
    const matchNoSearch = renderNoSearch?.props.children.props.students.find((s: any) => s.full_name === 'Waldo Hidden');
    expect(matchNoSearch).toBeUndefined(); // Waldo is not on page 1

    // If we render with search q=Waldo, Waldo is found
    const renderSearch = await AdminStudentsPage({ searchParams: Promise.resolve({ page: '1', q: 'Waldo' }) });
    const matchSearch = renderSearch?.props.children.props.students.find((s: any) => s.full_name === 'Waldo Hidden');
    expect(matchSearch).toBeDefined();
    expect(matchSearch.full_name).toBe('Waldo Hidden');
  });
});
