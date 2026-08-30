// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll, beforeAll, vi } from 'vitest';
import { createStudent } from './students';
import { adminSupabase } from '@/lib/supabase/admin';

// Mock rbac
vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn().mockResolvedValue({
    userId: '99999999-9999-9999-9999-999999999999',
    institutionId: '00000000-0000-0000-0000-000000000000',
    role: 'admin',
  }),
}));

// Mock server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

describe('Student Creation Integrity', () => {
  const instId = '00000000-0000-0000-0000-000000000000';
  let levelId = '';
  let cohortId = '';

  beforeAll(async () => {
    // Ensure test institution exists
    await adminSupabase.from('institutions').upsert({ id: instId, name: 'Test Inst', slug: 'test-inst-2' });
    const { data: level } = await adminSupabase
      .from('levels')
      .upsert({ institution_id: instId, name: 'Test Level', sequence_order: 999 }, { onConflict: 'institution_id,sequence_order' })
      .select('id')
      .single();
    levelId = level!.id;

    let { data: cohort } = await adminSupabase
      .from('cohorts')
      .select('id')
      .eq('institution_id', instId)
      .eq('name', 'Test Cohort')
      .maybeSingle();
    if (!cohort) {
      const res = await adminSupabase
        .from('cohorts')
        .insert({ institution_id: instId, name: 'Test Cohort', status: 'active' })
        .select('id')
        .single();
      cohort = res.data;
    }
    cohortId = cohort!.id;
  });

  it('rejects duplicate roll number and leaves no orphaned rows', async () => {
    const rollNumber = `TEST-DUP-${Date.now()}`;

    // 1. Create the first student
    const res1 = await createStudent({
      full_name: 'Original Student',
      roll_number: rollNumber,
      level_id: levelId,
      cohort_id: cohortId,
    });
    if (!res1.ok) console.error("res1 failed:", res1);
    expect(res1.ok).toBe(true);
    const firstStudentId = (res1 as any).data.student_id;

    // 2. Attempt duplicate
    const res2 = await createStudent({
      full_name: 'Duplicate Student',
      roll_number: rollNumber,
      level_id: levelId,
      cohort_id: cohortId,
    });
    
    // Must return DUPLICATE
    expect('error' in res2 ? res2.error : undefined).toBe('DUPLICATE');

    // 3. Verify no orphaned rows were created for the failed attempt
    // (There should only be exactly 1 auth user, 1 profile, 1 student for this roll number)
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
    const matchingAuth = authUsers.users.filter(u => u.email?.includes(rollNumber.toLowerCase()));
    expect(matchingAuth).toHaveLength(1);

    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('institution_id', instId)
      .ilike('email', `%${rollNumber}%`);
    expect(profiles).toHaveLength(1);

    const { data: students } = await adminSupabase
      .from('students')
      .select('id')
      .eq('institution_id', instId)
      .eq('roll_number', rollNumber);
    expect(students).toHaveLength(1);
    
    // Cleanup
    await adminSupabase.auth.admin.deleteUser(firstStudentId);
  });

  it('rolls back completely if student insert fails due to invalid FK', async () => {
    const rollNumber = `TEST-RB-${Date.now()}`;
    const fakeLevelId = '12345678-1234-4234-8234-123456789012'; // Strictly valid UUIDv4, doesn't exist in levels

    const res = await createStudent({
      full_name: 'Rollback Student',
      roll_number: rollNumber,
      level_id: fakeLevelId,
      cohort_id: cohortId,
    });
    console.log("Rollback test result:", res);

    expect('error' in res).toBe(true);
    expect('error' in res ? res.error : undefined).toBe('INTERNAL_ERROR');

    // Confirm zero rows remain in auth.users, profiles, and students
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
    const matchingAuth = authUsers.users.filter(u => u.email?.includes(rollNumber.toLowerCase()));
    expect(matchingAuth).toHaveLength(0);

    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('institution_id', instId)
      .ilike('email', `%${rollNumber}%`);
    expect(profiles).toHaveLength(0);

    const { data: students } = await adminSupabase
      .from('students')
      .select('id')
      .eq('institution_id', instId)
      .eq('roll_number', rollNumber);
    expect(students).toHaveLength(0);
  });
});
