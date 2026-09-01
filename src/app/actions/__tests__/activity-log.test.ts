/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import { fetchActivityLogs, exportActivityLogsCsv } from '../activity-log';
import { adminSupabase } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth/rbac';

// Mock requireRole globally
vi.mock('@/lib/auth/rbac', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    requireRole: vi.fn(actual.requireRole),
  };
});

describe('activity-log actions', () => {
  describe('Mocked Unit Tests', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(adminSupabase, 'from');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should filter by userSearch using full_name OR email', async () => {
      vi.mocked(requireRole).mockResolvedValue({ userId: 'u1', institutionId: 'inst_1', role: 'admin' });

      // First query: matching profiles
      const mockOr = vi.fn().mockResolvedValue({ data: [{ id: 'user_1' }, { id: 'user_2' }] });
      const mockEqProfile = vi.fn().mockReturnValue({ or: mockOr });
      const mockSelectProfile = vi.fn().mockReturnValue({ eq: mockEqProfile });

      // Second query: fetching logs
      const mockIn = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const mockRangeLogs = vi.fn().mockReturnValue({ in: mockIn });
      const mockOrderLogs = vi.fn().mockReturnValue({ range: mockRangeLogs });
      const mockEqLogs = vi.fn().mockReturnValue({ order: mockOrderLogs });
      const mockSelectLogs = vi.fn().mockReturnValue({ eq: mockEqLogs });

      vi.mocked(adminSupabase.from).mockImplementation((table: string) => {
        if (table === 'profiles') return { select: mockSelectProfile } as any;
        if (table === 'activity_logs') return { select: mockSelectLogs } as any;
        return {} as any;
      });

      await fetchActivityLogs({ userSearch: 'john' });

      expect(mockOr).toHaveBeenCalledWith('email.ilike."%john%",full_name.ilike."%john%"');
      expect(mockIn).toHaveBeenCalledWith('user_id', ['user_1', 'user_2']);
    });
  });

  describe('Live Cross-Tenant Tests', () => {
    let instId: string;
    let adminId: string;
    
    beforeAll(async () => {
      const postfix = Date.now().toString();
      
      const resInst = await adminSupabase.from('institutions').insert({ 
        name: `LogTest Inst ${postfix}`, 
        slug: `logtest-inst-${postfix}` 
      }).select('id').single();
      if (!resInst.data) throw new Error('Failed to setup inst: ' + JSON.stringify(resInst.error));
      instId = resInst.data.id;
      
      const { data: user } = await adminSupabase.auth.admin.createUser({
        email: `logtest_admin_${postfix}@test.com`,
        password: 'Password123!',
        email_confirm: true,
      });
      if (!user.user) throw new Error('Failed to setup user');
      adminId = user.user.id;
      
      await adminSupabase.from('profiles').insert({
        id: adminId,
        institution_id: instId,
        email: user.user.email!,
        full_name: 'Log Admin',
        role: 'admin'
      });
      
      // Insert a real log
      await adminSupabase.from('activity_logs').insert({
        institution_id: instId,
        user_id: adminId,
        action_type: 'PUBLISH_RESULT',
        entity_type: 'exam_paper',
        ip_address: '127.0.0.1'
      });
    });

    afterAll(async () => {
      if (adminId) await adminSupabase.auth.admin.deleteUser(adminId);
      if (instId) await adminSupabase.from('institutions').delete().eq('id', instId);
    });

    it('should strictly isolate activity logs by institution_id', async () => {
      vi.mocked(requireRole).mockResolvedValue({ userId: adminId, institutionId: instId, role: 'admin' });
      
      // Should find the log
      const res1 = await fetchActivityLogs();
      expect(res1.ok).toBe(true);
      if (res1.ok) {
        expect(res1.data.logs.length).toBeGreaterThan(0);
        expect(res1.data.logs[0].action_type).toBe('PUBLISH_RESULT');
      }
      
      // Should NOT find the log if we fake being in another institution
      const fakeInst = '00000000-0000-0000-0000-000000000000';
      vi.mocked(requireRole).mockResolvedValue({ userId: adminId, institutionId: fakeInst, role: 'admin' });
      
      const res2 = await fetchActivityLogs();
      expect(res2.ok).toBe(true);
      if (res2.ok) {
        expect(res2.data.logs).toHaveLength(0);
      }
    });
  });
});
