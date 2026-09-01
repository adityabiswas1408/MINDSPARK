import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchActivityLogs, exportActivityLogsCsv } from '../activity-log';
import { adminSupabase } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth/rbac';

// Mock dependencies
vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));

describe('activity-log actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchActivityLogs', () => {
    it('should fetch logs with correct institution isolation', async () => {
      // Mock auth
      vi.mocked(requireRole).mockResolvedValue({ userId: 'u1', institutionId: 'inst_1', role: 'admin' });

      // Mock DB chain
      const mockRange = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(adminSupabase.from).mockReturnValue({ select: mockSelect } as any);

      await fetchActivityLogs();

      // Verify basic query construction
      expect(adminSupabase.from).toHaveBeenCalledWith('activity_logs');
      expect(mockEq).toHaveBeenCalledWith('institution_id', 'inst_1');
      expect(mockOrder).toHaveBeenCalledWith('timestamp', { ascending: false });
      expect(mockRange).toHaveBeenCalledWith(0, 49);
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

      expect(mockOr).toHaveBeenCalledWith('email.ilike.%john%,full_name.ilike.%john%');
      expect(mockIn).toHaveBeenCalledWith('user_id', ['user_1', 'user_2']);
    });
  });

  describe('exportActivityLogsCsv', () => {
    it('should include full_name in CSV output', async () => {
      vi.mocked(requireRole).mockResolvedValue({ userId: 'u1', institutionId: 'inst_1', role: 'admin' });

      // Mock log rows
      const mockLimit = vi.fn().mockResolvedValue({
        data: [{
          id: 'log1',
          timestamp: '2026-09-01T12:00:00.000Z',
          action_type: 'PUBLISH_RESULT',
          entity_type: 'submissions',
          entity_id: 'sub1',
          user_id: 'u1',
          ip_address: '1.2.3.4'
        }]
      });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelectLogs = vi.fn().mockReturnValue({ eq: mockEq });

      // Mock profiles fetching
      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'u1', email: 'john@example.com', full_name: 'John Doe' }]
      });
      const mockSelectProfiles = vi.fn().mockReturnValue({ in: mockIn });

      vi.mocked(adminSupabase.from).mockImplementation((table: string) => {
        if (table === 'activity_logs') return { select: mockSelectLogs } as any;
        if (table === 'profiles') return { select: mockSelectProfiles } as any;
        return {} as any;
      });

      const res = await exportActivityLogsCsv();

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.csv).toContain('Actor Name');
        expect(res.data.csv).toContain('John Doe');
        expect(res.data.csv).toContain('john@example.com');
      }
    });
  });
});
