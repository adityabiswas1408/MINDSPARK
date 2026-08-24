import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'level_1' } })
    })
  })
}));

vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: {
    from: vi.fn(),
  },
}));

import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';
import { createAnnouncement } from './announcements';

const requireRoleMock = requireRole as unknown as Mock;
const fromMock = adminSupabase.from as unknown as Mock;

describe('createAnnouncement', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rejects a caller without the admin role', async () => {
    requireRoleMock.mockResolvedValue({ error: 'FORBIDDEN', message: 'no admin' });
    
    const result = await createAnnouncement({
      title: 'Hello',
      body_html: '<p>Hi</p>',
      body_json: {},
      publish_now: false
    });
    
    expect(requireRoleMock).toHaveBeenCalledWith('admin');
    expect((result as { error: string }).error).toBe('FORBIDDEN');
  });

  it('strips a real XSS payload from body_html', async () => {
    requireRoleMock.mockResolvedValue({
      userId: 'user_1',
      role: 'admin',
      institutionId: 'inst_1',
    });

    const insertChain = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'ann_1' }, error: null })
    };
    const fromChain = { insert: vi.fn().mockReturnValue(insertChain) };
    
    const fromChainActivity = { insert: vi.fn().mockResolvedValue({ error: null }) };
    
    fromMock.mockReturnValueOnce(fromChain).mockReturnValueOnce(fromChainActivity);

    const xssPayload = '<p>Normal text</p><script>alert("XSS")</script><img src="x" onerror="alert(1)" />';

    const result = await createAnnouncement({
      title: 'Safety Test',
      body_html: xssPayload,
      body_json: {},
      publish_now: true
    });

    expect((result as { ok: boolean }).ok).toBe(true);

    const insertCall = fromChain.insert.mock.calls[0][0];
    
    expect(insertCall.body_html).not.toContain('<script>');
    expect(insertCall.body_html).not.toContain('onerror');
    expect(insertCall.body_html).toContain('<p>Normal text</p>');
    expect(insertCall.body_html).toContain('<img src="x" />');
  });
});
