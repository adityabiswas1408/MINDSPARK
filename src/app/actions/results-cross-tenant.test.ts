// @vitest-environment node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Requires a test environment with a running Supabase instance and service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

// Mock the server environment
vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { requireRole } from '@/lib/auth/rbac';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { publishResult, unpublishResult, publishResults, publishAllPaperResults, unpublishAllPaperResults } from './results';

describe('Results Server Actions Live Cross-Tenant Tests', () => {
  let instA: string;
  let instB: string;
  let adminAId: string;
  let adminBId: string;
  let paperInstB: string;
  let sessionInstB: string;
  
  beforeAll(async () => {
    const postfix = Date.now().toString();
    const instResA = await adminSupabase.from('institutions').insert({ name: 'Test Inst A', slug: `test-inst-a-${postfix}` }).select('id').single();
    const instResB = await adminSupabase.from('institutions').insert({ name: 'Test Inst B', slug: `test-inst-b-${postfix}` }).select('id').single();
    instA = instResA.data!.id;
    instB = instResB.data!.id;

    adminAId = `11111111-1111-1111-1111-${postfix.substring(0, 12).padStart(12, '0')}`;
    adminBId = `22222222-2222-2222-2222-${postfix.substring(0, 12).padStart(12, '0')}`;

    // Note: Profiles require actual auth.users via triggers or RLS bypassing. For this test, we might bypass creating auth users if RLS on exam_papers/submissions allows service role to insert them directly.
    // Let's insert paper & session into Inst B
    const { data: levelB } = await adminSupabase.from('levels').insert({ institution_id: instB, name: 'Level B', sequence_order: 1 }).select('id').single();
    const { data: cohortB } = await adminSupabase.from('cohorts').insert({ institution_id: instB, name: 'Cohort B' }).select('id').single();
    
    // Create Student B
    const { data: authStudentB } = await adminSupabase.auth.admin.createUser({
      email: `studentB-${postfix}@test.com`, password: 'password', email_confirm: true,
      app_metadata: { role: 'student', institution_id: instB }
    });
    const studentB = authStudentB.user!.id;
    await adminSupabase.from('profiles').insert({ id: studentB, institution_id: instB, role: 'student', full_name: 'Student B', email: `studentB-${postfix}@test.com` });
    const sRes = await adminSupabase.from('students').insert({ id: studentB, institution_id: instB, cohort_id: cohortB!.id, level_id: levelB!.id, full_name: 'Student B', roll_number: 'B001' });
    if (sRes.error) throw new Error(`STUDENT ERR: ${JSON.stringify(sRes.error)}`);

    // Create Teacher B
    const { data: authTeacherB, error: authErr } = await adminSupabase.auth.admin.createUser({
      email: `teacherB-${postfix}@test.com`, password: 'password', email_confirm: true,
      app_metadata: { role: 'teacher', institution_id: instB }
    });
    if (authErr) throw authErr;
    const teacherB = authTeacherB.user!.id;
    const pRes = await adminSupabase.from('profiles').insert({ id: teacherB, institution_id: instB, role: 'teacher', full_name: 'Teacher B', email: `teacherB-${postfix}@test.com` });
    if (pRes.error) throw pRes.error;
    const tRes = await adminSupabase.from('teachers').insert({ id: teacherB, full_name: 'Teacher B' });
    if (tRes.error) throw tRes.error;

    // Create Paper B
    const paperRes = await adminSupabase.from('exam_papers').insert({
      institution_id: instB, level_id: levelB!.id, created_by: teacherB,
      title: 'Inst B Paper', description: 'Test', duration_minutes: 60, status: 'CLOSED'
    }).select('id').single();
    if (paperRes.error) throw new Error(`PAPER ERR: ${JSON.stringify(paperRes.error)}`);
    paperInstB = paperRes.data!.id;

    // Create Assessment Session
    const asSessionRes = await adminSupabase.from('assessment_sessions').insert({
      paper_id: paperInstB, cohort_id: cohortB!.id, scheduled_at: new Date(Date.now() - 3600000).toISOString(), expires_at: new Date(Date.now() + 3600000).toISOString(), status: 'completed'
    }).select('id').single();
    if (asSessionRes.error) throw new Error(`AS_SESSION ERR: ${JSON.stringify(asSessionRes.error)}`);
    const asSession = asSessionRes.data;

    // Create Submission B
    const sessionRes = await adminSupabase.from('submissions').insert({
      session_id: asSession!.id,
      paper_id: paperInstB,
      student_id: studentB,
      completed_at: new Date().toISOString(),
      score: 10,
      grade: 'A'
    }).select('id').single();
    if (sessionRes.error) throw new Error(`SESSION ERR: ${JSON.stringify(sessionRes.error)}`);
    sessionInstB = sessionRes.data!.id;

  }, 30000);

  afterAll(async () => {
    // Cleanup
    if (instA && instB) await adminSupabase.from('institutions').delete().in('id', [instA, instB]);
    // The cascade delete on institutions handles the rest in the database
  }, 30000);

  it('rejects cross-tenant publishResult', async () => {
    // Mock requireRole as Admin A (Inst A)
    (requireRole as any).mockResolvedValue({ userId: adminAId, institutionId: instA, role: 'admin' });
    // Mock server client as a service role to simulate successful RLS fetch but relying on explicit app-logic check
    (createServerClient as any).mockResolvedValue(adminSupabase);

    const result = await publishResult({ session_id: sessionInstB });
    expect(result).toEqual({ error: 'NOT_FOUND', message: 'Session not found' });
    
    // Verify NOT published in DB
    const { data } = await adminSupabase.from('submissions').select('result_published_at').eq('id', sessionInstB).single();
    expect(data?.result_published_at).toBeNull();
  });

  it('rejects cross-tenant unpublishResult', async () => {
    (requireRole as any).mockResolvedValue({ userId: adminAId, institutionId: instA, role: 'admin' });
    (createServerClient as any).mockResolvedValue(adminSupabase);

    const result = await unpublishResult({ session_id: sessionInstB, reason: 'test' });
    expect(result).toEqual({ error: 'NOT_FOUND', message: 'Session not found' });
  });

  it('rejects cross-tenant batch publishResults (does not publish other tenant)', async () => {
    (requireRole as any).mockResolvedValue({ userId: adminAId, institutionId: instA, role: 'admin' });
    (createServerClient as any).mockResolvedValue(adminSupabase);

    const result = await publishResults([sessionInstB]);
    // Since batch processing filters out mismatched IDs, it should return 0 matched
    expect((result as any).data.published_count).toBe(0);

    // Verify NOT published
    const { data } = await adminSupabase.from('submissions').select('result_published_at').eq('id', sessionInstB).single();
    expect(data?.result_published_at).toBeNull();
  });

  it('rejects cross-tenant publishAllPaperResults', async () => {
    (requireRole as any).mockResolvedValue({ userId: adminAId, institutionId: instA, role: 'admin' });
    (createServerClient as any).mockResolvedValue(adminSupabase);

    const result = await publishAllPaperResults({ paper_id: paperInstB });
    expect(result).toEqual({ error: 'NOT_FOUND', message: 'Paper not found' });
  });
  
  it('rejects cross-tenant unpublishAllPaperResults', async () => {
    (requireRole as any).mockResolvedValue({ userId: adminAId, institutionId: instA, role: 'admin' });
    (createServerClient as any).mockResolvedValue(adminSupabase);

    const result = await unpublishAllPaperResults({ paper_id: paperInstB, reason: 'test' });
    expect(result).toEqual({ error: 'NOT_FOUND', message: 'Paper not found' });
  });

});
