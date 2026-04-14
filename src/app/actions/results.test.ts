import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: {
    from: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';
import { releaseAnswerKey, unreleaseAnswerKey } from './results';

// Loose builder shapes for the chained Supabase mocks. The runtime
// shape is whatever the chain needs; the public assertions only touch
// `update`/`insert`/`maybeSingle` so we expose those explicitly.
type SelectChain = {
  select: Mock;
  eq: Mock;
  maybeSingle: Mock;
};
type UpdateChain = {
  update: Mock;
  eq: Mock;
};
type InsertChain = { insert: Mock };

function buildSelectChain(row: { id: string } | null): SelectChain {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  return chain;
}

function buildUpdateChain(): UpdateChain {
  const chain = {
    update: vi.fn(),
    eq: vi.fn(),
  };
  chain.update.mockReturnValue(chain);
  // Last .eq() in the update chain resolves the await
  chain.eq
    .mockImplementationOnce(() => chain)
    .mockResolvedValueOnce({ error: null });
  return chain;
}

function buildInsertChain(): InsertChain {
  return { insert: vi.fn().mockResolvedValue({ error: null }) };
}

const requireRoleMock = requireRole as unknown as Mock;
const fromMock = adminSupabase.from as unknown as Mock;

describe('releaseAnswerKey', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns error when caller is not admin', async () => {
    requireRoleMock.mockResolvedValue({ ok: false, error: 'FORBIDDEN', message: 'no' });
    const result = await releaseAnswerKey('pap_01J8A');
    expect((result as { error: string }).error).toBe('FORBIDDEN');
  });

  it('updates exam_papers and writes activity log on success', async () => {
    requireRoleMock.mockResolvedValue({
      userId: 'user_1',
      role: 'admin',
      institutionId: 'inst_1',
    });

    const selectChain = buildSelectChain({ id: 'pap_01J8A' });
    const updateChain = buildUpdateChain();
    const insertChain = buildInsertChain();

    fromMock
      .mockReturnValueOnce(selectChain) // pre-flight SELECT
      .mockReturnValueOnce(updateChain) // UPDATE exam_papers
      .mockReturnValueOnce(insertChain); // activity_logs INSERT

    const result = await releaseAnswerKey('pap_01J8A');
    expect((result as { ok: true; data: unknown }).ok).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        answer_key_released: true,
        answer_key_released_by: 'user_1',
      }),
    );
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        action_type: 'BULK_RELEASE_ANSWER_KEY',
        entity_id: 'pap_01J8A',
        user_id: 'user_1',
        institution_id: 'inst_1',
      }),
    );
  });

  it('returns "Paper not found" when pre-flight select returns no row', async () => {
    requireRoleMock.mockResolvedValue({
      userId: 'user_1',
      role: 'admin',
      institutionId: 'inst_1',
    });
    const selectChain = buildSelectChain(null);
    fromMock.mockReturnValueOnce(selectChain);

    const result = await releaseAnswerKey('pap_missing');
    expect((result as { error: string }).error).toBe('NOT_FOUND');
  });
});

describe('unreleaseAnswerKey', () => {
  beforeEach(() => vi.resetAllMocks());

  it('does NOT clear answer_key_released_at on un-release (audit preservation)', async () => {
    requireRoleMock.mockResolvedValue({
      userId: 'user_1',
      role: 'admin',
      institutionId: 'inst_1',
    });

    const selectChain = buildSelectChain({ id: 'pap_01J8A' });
    const updateChain = buildUpdateChain();
    const insertChain = buildInsertChain();

    fromMock
      .mockReturnValueOnce(selectChain)
      .mockReturnValueOnce(updateChain)
      .mockReturnValueOnce(insertChain);

    await unreleaseAnswerKey('pap_01J8A');
    const call = updateChain.update.mock.calls[0]![0] as Record<string, unknown>;
    expect(call.answer_key_released).toBe(false);
    expect(call.answer_key_released_at).toBeUndefined();
    expect(call.answer_key_released_by).toBeUndefined();
  });
});
