// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAssessment } from './assessments';
import { updateSettings } from './settings';
import { adminSupabase } from '@/lib/supabase/admin';

import { vi } from 'vitest';

// Mock rbac to always return a valid user with institution 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'
vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn().mockResolvedValue({
    userId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    institutionId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'
  })
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => {
    return adminSupabase;
  })
}));

describe('Settings and Timing Defaults', () => {
  let currentUserId: string;

  beforeEach(async () => {
    // Setup clean state first
    const iRes = await adminSupabase.from('institutions').upsert({
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      name: 'Test Institution',
      slug: 'test-inst-c0eebc99',
      timezone: 'UTC',
      session_timeout_seconds: 3600,
      auto_archive_enabled: false,
      default_duration_minutes: null,
      default_per_question_time_seconds: null
    });
    if (iRes.error) console.log("Inst error:", iRes.error);
    const lRes = await adminSupabase.from('levels').upsert({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Test Level',
      institution_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      sequence_order: 1
    });
    if (lRes.error) console.log("Level error:", lRes.error);
    await adminSupabase.from('exam_papers').delete().eq('institution_id', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');

    const { data: userAuth } = await adminSupabase.auth.admin.createUser({
      email: `admin-${Date.now()}@test.com`,
      password: 'testpassword123',
      email_confirm: true,
    });
    const userId = userAuth.user!.id;
    currentUserId = userId;
    
    // Create profile and teacher
    const pRes = await adminSupabase.from('profiles').upsert({
      id: userId,
      full_name: 'Test Admin',
      role: 'admin',
      institution_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      email: userAuth.user!.email || 'admin@test.com'
    });
    if (pRes.error) console.log("Profile insert error:", pRes.error);
    const tRes = await adminSupabase.from('teachers').upsert({
      id: userId,
      full_name: 'Test Admin'
    });
    if (tRes.error) console.log("Teacher insert error:", tRes.error);
    
    // We will just update the mock implementation inside beforeEach!
    const { requireRole } = await import('@/lib/auth/rbac');
    (requireRole as any).mockResolvedValue({
      userId: currentUserId,
      institutionId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'
    });
  });

  afterEach(async () => {
    await adminSupabase.from('teachers').delete().eq('id', currentUserId);
    await adminSupabase.from('profiles').delete().eq('id', currentUserId);
    await adminSupabase.from('exam_papers').delete().eq('institution_id', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
    await adminSupabase.from('levels').delete().eq('id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    await adminSupabase.from('institutions').delete().eq('id', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
    if (currentUserId) {
      await adminSupabase.auth.admin.deleteUser(currentUserId);
    }
  });

  it('updates settings and creates assessment reflecting those settings without retroactively affecting old ones', async () => {
    // 1. Create a paper before defaults are set
    const p1 = await createAssessment({
      title: 'Paper 1',
      type: 'EXAM',
      duration_minutes: 30, // hardcoded fallback used in wizard
      level_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    });
    console.log("P1 result:", p1);
    expect(p1.ok).toBe(true);

    // 2. Set defaults via updateSettings
    const updateResult = await updateSettings({
      name: 'Updated Inst',
      auto_archive_enabled: true,
      default_duration_minutes: 45,
      default_per_question_time_seconds: 90
    });
    console.log("Update result:", updateResult);
    expect(updateResult.ok).toBe(true);

    const { data: inst } = await adminSupabase.from('institutions').select('*').eq('id', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13').single();
    expect(inst!.auto_archive_enabled).toBe(true);
    expect(inst!.default_duration_minutes).toBe(45);
    expect(inst!.default_per_question_time_seconds).toBe(90);

    // 3. Create a new paper simulating the wizard passing the new defaults
    const p2 = await createAssessment({
      title: 'Paper 2',
      type: 'EXAM',
      duration_minutes: 45,
      per_question_time_seconds: 90,
      level_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    });
    console.log("P2 result:", p2);
    expect(p2.ok).toBe(true);

    // 4. Verify in DB
    const { data: oldPaper } = await adminSupabase.from('exam_papers').select('*').eq('id', (p1 as any).data!.assessment_id).single();
    const { data: newPaper } = await adminSupabase.from('exam_papers').select('*').eq('id', (p2 as any).data!.assessment_id).single();

    expect(oldPaper!.duration_minutes).toBe(30);
    expect(oldPaper!.per_question_time_seconds).toBeNull(); // Non-retroactive

    expect(newPaper!.duration_minutes).toBe(45);
    expect(newPaper!.per_question_time_seconds).toBe(90);
  });
});
