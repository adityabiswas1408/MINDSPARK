// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { importStudentsCSV } from './students';
import { adminSupabase } from '@/lib/supabase/admin';

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn().mockResolvedValue({
    userId: '99999999-9999-9999-9999-999999999999',
    institutionId: '00000000-0000-0000-0000-000000000000',
    role: 'admin',
  }),
}));

const mocks = vi.hoisted(() => ({ client: {} as any }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => mocks.client)
}));
mocks.client = adminSupabase;

describe('Bulk Import CSV Integration', () => {
  const instId = '00000000-0000-0000-0000-000000000000';
  let levelId = '';
  let cohortId = '';
  let authUsersToCleanup: string[] = [];

  beforeAll(async () => {
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

  afterAll(async () => {
    for (const id of authUsersToCleanup) {
      await adminSupabase.auth.admin.deleteUser(id);
    }
  });

  it('imports valid CSV rows end-to-end, creating real auth users and student records', async () => {
    const ts = Date.now();
    const csvContent = `roll_number,full_name,date_of_birth
BULK-LIVE-A-${ts},Bulk Live Student A ${ts},
BULK-LIVE-B-${ts},Bulk Live Student B ${ts},2010-05-15`;

    const result = await importStudentsCSV({
      csv_raw: csvContent,
      level_id: levelId,
      cohort_id: cohortId,
      dry_run: false
    });

    expect('data' in result).toBe(true);
    const data = 'data' in result ? result.data : undefined;
    console.log('Result data:', JSON.stringify(data, null, 2));
    expect(data?.inserted).toBe(2);
    expect(data?.errors.length).toBe(0);

    // Verify profiles and auth users exist
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name')
      .eq('institution_id', instId)
      .ilike('full_name', `%Bulk Live Student%${ts}%`);

    expect(profiles).toHaveLength(2);
    profiles?.forEach(p => authUsersToCleanup.push(p.id));

    const { data: students } = await adminSupabase
      .from('students')
      .select('id, roll_number, cohort_id')
      .ilike('roll_number', `BULK-LIVE-%${ts}`);

    expect(students).toHaveLength(2);
    students?.forEach(s => {
      expect(s.cohort_id).toBe(cohortId);
    });

    const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
    const matchingAuth = authUsers.users.filter(u => u.email?.includes(`bulk-live-a-${ts}`));
    expect(matchingAuth).toHaveLength(1);
  });

  it('handles mixed batches: creates valid rows and cleans up auth users for failed rows', async () => {
    const ts = Date.now();
    // Student C, D, E are valid. Student F is invalid (e.g. malformed date, leading to RPC error).
    const csvContent = `roll_number,full_name,date_of_birth
BULK-MIX-C-${ts},Bulk Mix Student C,
BULK-MIX-D-${ts},Bulk Mix Student D,
BULK-MIX-E-${ts},Bulk Mix Student E,
BULK-MIX-F-${ts},Bulk Mix Student F,INVALID_DATE`;

    const result = await importStudentsCSV({
      csv_raw: csvContent,
      level_id: levelId,
      cohort_id: cohortId,
      dry_run: false
    });

    expect('data' in result).toBe(true);
    const data = 'data' in result ? result.data : undefined;
    
    // We expect 3 inserted, 1 skipped (failed at RPC stage due to INVALID_DATE)
    expect(data?.inserted).toBe(3);
    expect(data?.skipped).toBe(1);
    expect(data?.errors).toHaveLength(1);
    expect(data?.errors[0].row).toBe(5);
    expect(data?.errors[0].reason).toContain('invalid input syntax for type date');

    // Verify 3 valid students are in the database
    const { data: students } = await adminSupabase
      .from('students')
      .select('id, roll_number, cohort_id')
      .ilike('roll_number', `BULK-MIX-%${ts}`);

    expect(students).toHaveLength(3);
    const validIds = students?.map(s => s.id) || [];
    validIds.forEach(id => authUsersToCleanup.push(id));

    // Verify auth users
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
    
    // The valid users should exist
    const validEmails = [
      `bulk-mix-c-${ts}@student.${instId}.invalid`,
      `bulk-mix-d-${ts}@student.${instId}.invalid`,
      `bulk-mix-e-${ts}@student.${instId}.invalid`
    ];
    for (const email of validEmails) {
      const found = authUsers.users.find(u => u.email === email);
      expect(found).toBeDefined();
    }

    // The invalid user MUST NOT exist (orphaned row must be cleaned up)
    const invalidEmail = `bulk-mix-f-${ts}@student.${instId}.invalid`;
    const foundInvalid = authUsers.users.find(u => u.email === invalidEmail);
    expect(foundInvalid).toBeUndefined();
  });
});
