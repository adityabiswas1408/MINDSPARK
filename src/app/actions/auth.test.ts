import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetPassword } from './auth';

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));

const mockUpdateUserById = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: {
    auth: {
      admin: {
        updateUserById: (...args: any[]) => mockUpdateUserById(...args)
      }
    },
    from: vi.fn()
  }
}));

import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resetPassword', () => {
    const validUserId = '123e4567-e89b-12d3-a456-426614174000';

    it('should reject if user is not admin', async () => {
      vi.mocked(requireRole).mockResolvedValueOnce({
        ok: false,
        error: 'UNAUTHORIZED',
        message: 'Must be admin',
      });

      const result = await resetPassword({ user_id: validUserId });
      expect((result as any).error).toBe('UNAUTHORIZED');
    });

    it('should reset password successfully and return temp password', async () => {
      vi.mocked(requireRole).mockResolvedValueOnce({
        userId: 'admin-id',
        institutionId: 'inst-id',
        role: 'admin',
      });

      mockUpdateUserById.mockResolvedValueOnce({ data: {} as any, error: null });

      const fromMock = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      });
      (adminSupabase.from as any) = fromMock;

      const result = await resetPassword({ user_id: validUserId });

      if (!result.ok) console.log('AUTH FAIL:', result);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.reset).toBe(true);
        expect(typeof result.data.temp_password).toBe('string');
        expect(result.data.temp_password.length).toBeGreaterThan(0);
      }

      expect(mockUpdateUserById).toHaveBeenCalledWith(
        validUserId,
        expect.objectContaining({ password: expect.any(String) })
      );
      
      expect(fromMock).toHaveBeenCalledWith('profiles');
      expect(fromMock).toHaveBeenCalledWith('activity_logs');
    });
  });
});
