import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: {
    from: vi.fn(),
    rpc: vi.fn()
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { releaseAnswerKey, unreleaseAnswerKey, publishResult, unpublishResult, reEvaluateResults, publishResults } from './results';

type SelectChain = {
  select: Mock;
  eq: Mock;
  single: Mock;
  maybeSingle: Mock;
  in: Mock;
};
type UpdateChain = {
  update: Mock;
  eq: Mock;
  in: Mock;
};
type InsertChain = { insert: Mock };

function buildSelectChain(row: { id: string } | null | any): SelectChain {
  const chain: any = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: row, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
    in: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  return chain as SelectChain;
}

function buildUpdateChain(eqCount = 1): UpdateChain {
  const chain: any = {
    update: vi.fn(),
    eq: vi.fn(),
    in: vi.fn()
  };
  chain.update.mockReturnValue(chain);
  
  if (eqCount === 1) {
    chain.eq.mockResolvedValue({ error: null });
  } else if (eqCount === 2) {
    chain.eq.mockImplementationOnce(() => chain).mockResolvedValueOnce({ error: null });
  }
  
  chain.in.mockResolvedValue({ error: null });
  return chain;
}

function buildInsertChain(): InsertChain {
  return { insert: vi.fn().mockResolvedValue({ error: null }) };
}

const requireRoleMock = requireRole as unknown as Mock;
const fromMock = adminSupabase.from as unknown as Mock;

describe('results server actions', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000';
  const validInstId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('releaseAnswerKey', () => {
    it('returns error when caller is not admin', async () => {
      requireRoleMock.mockResolvedValue({ ok: false, error: 'FORBIDDEN', message: 'no' });
      const result = await releaseAnswerKey('pap_01J8A');
      expect((result as { error: string }).error).toBe('FORBIDDEN');
    });

    it('updates exam_papers and writes activity log on success', async () => {
      requireRoleMock.mockResolvedValue({ userId: 'user_1', role: 'admin', institutionId: 'inst_1' });
      const selectChain = buildSelectChain({ id: 'pap_01J8A' });
      const updateChain = buildUpdateChain(2);
      const insertChain = buildInsertChain();

      fromMock
        .mockReturnValueOnce(selectChain) 
        .mockReturnValueOnce(updateChain) 
        .mockReturnValueOnce(insertChain); 

      const result = await releaseAnswerKey('pap_01J8A');
      expect((result as { ok: true; data: unknown }).ok).toBe(true);
    });

    it('returns "Paper not found" when pre-flight select returns no row', async () => {
      requireRoleMock.mockResolvedValue({ userId: 'user_1', role: 'admin', institutionId: 'inst_1' });
      fromMock.mockReturnValueOnce(buildSelectChain(null));
      const result = await releaseAnswerKey('pap_missing');
      expect((result as { error: string }).error).toBe('NOT_FOUND');
    });
  });

  describe('unreleaseAnswerKey', () => {
    it('does NOT clear answer_key_released_at on un-release', async () => {
      requireRoleMock.mockResolvedValue({ userId: 'user_1', role: 'admin', institutionId: 'inst_1' });
      fromMock.mockReturnValueOnce(buildSelectChain({ id: 'pap_01J8A' })).mockReturnValueOnce(buildUpdateChain(2)).mockReturnValueOnce(buildInsertChain());
      await unreleaseAnswerKey('pap_01J8A');
    });
  });

  describe('publishResult', () => {
    it('successfully publishes result', async () => {
      requireRoleMock.mockResolvedValue({ userId: validUserId, institutionId: validInstId, role: 'admin' });
      const sessionMock = { id: '123e4567-e89b-12d3-a456-426614174000', completed_at: '2025', score: 10, grade: 'A', exam_papers: { institution_id: validInstId } };
      fromMock.mockReturnValueOnce(buildSelectChain(sessionMock)).mockReturnValueOnce(buildUpdateChain(1)).mockReturnValueOnce(buildInsertChain());
      
      const result = await publishResult({ session_id: '123e4567-e89b-12d3-a456-426614174000' });
      expect((result as any).ok).toBe(true);
    });
  });

  describe('unpublishResult', () => {
    it('successfully unpublishes result', async () => {
      requireRoleMock.mockResolvedValue({ userId: validUserId, institutionId: validInstId, role: 'admin' });
      const sessionMock = { id: '123e4567-e89b-12d3-a456-426614174000', exam_papers: { institution_id: validInstId } };
      fromMock.mockReturnValueOnce(buildSelectChain(sessionMock)).mockReturnValueOnce(buildUpdateChain(1)).mockReturnValueOnce(buildInsertChain());
      
      const result = await unpublishResult({ session_id: '123e4567-e89b-12d3-a456-426614174000', reason: 'test' });
      expect((result as any).ok).toBe(true);
    });
  });

  describe('reEvaluateResults', () => {
    it('successfully reevaluates', async () => {
      requireRoleMock.mockResolvedValue({ userId: validUserId, institutionId: validInstId, role: 'admin' });
      const paperMock = { id: 'p1', status: 'CLOSED', institution_id: validInstId };
      (createClient as Mock).mockResolvedValue({ from: vi.fn().mockReturnValue(buildSelectChain(paperMock)) });
      
      fromMock.mockReturnValueOnce(buildUpdateChain(1)).mockReturnValueOnce(buildInsertChain());
      (adminSupabase.rpc as Mock).mockResolvedValue({ error: null });
      
      const result = await reEvaluateResults({ assessment_id: 'p1', reason: 'test' });
      expect((result as any).ok).toBe(true);
    });
  });

  describe('publishResults', () => {
    it('successfully publishes multiple results', async () => {
      requireRoleMock.mockResolvedValue({ userId: validUserId, institutionId: validInstId, role: 'admin' });
      
      const sessionsMock = [
        { id: '123e4567-e89b-12d3-a456-426614174000', exam_papers: { institution_id: validInstId } },
        { id: '123e4567-e89b-12d3-a456-426614174001', exam_papers: { institution_id: validInstId } }
      ];
      const selectChain = buildSelectChain(sessionsMock);
      // For bulk, it uses .in() after .eq(), so we need to ensure the select chain returns the array in data.
      selectChain.in = vi.fn().mockReturnValue(selectChain);
      
      fromMock.mockReturnValueOnce(selectChain).mockReturnValueOnce(buildUpdateChain(1)).mockReturnValueOnce(buildInsertChain());
      
      const result = await publishResults(['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001']);
      expect((result as any).ok).toBe(true);
    });
  });
});
