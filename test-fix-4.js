const fs = require('fs');

let asTest = `
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'fake');
import { submitAnswer, submitExam, initSession } from './assessment-sessions';

vi.mock('@/lib/auth/rbac', () => ({ requireRole: vi.fn() }));

function mockChain(data: any = null) {
  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    is: vi.fn(() => chain),
    order: vi.fn(() => chain),
    in: vi.fn(() => chain),
    update: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    single: vi.fn().mockResolvedValue({ data, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
  };
  return chain;
}

vi.mock('@/lib/supabase/server', () => ({ 
  createClient: vi.fn().mockReturnValue({ 
    from: vi.fn(), 
    rpc: vi.fn() 
  }) 
}));

vi.mock('@/lib/supabase/admin', () => ({ 
  adminSupabase: {
    from: vi.fn(),
    rpc: vi.fn()
  } 
}));

vi.mock('@/lib/anticheat/clock-guard', () => ({
  issueExamSeal: vi.fn(() => ({ seal: 'fake-seal', timestamp: 123456789 })),
  validateClockGuard: vi.fn(() => ({ valid: true, flags: [] }))
}));

describe('assessment-sessions server actions', () => { 
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const validUserId = '123e4567-e89b-12d3-a456-426614174000';
  const validInstId = '123e4567-e89b-12d3-a456-426614174000';

  describe('submitExam validation', () => { 
    beforeEach(async () => {
      const { requireRole } = await import('@/lib/auth/rbac');
      vi.mocked(requireRole).mockResolvedValue({ userId: validUserId, institutionId: validInstId, role: 'student' });
    });

    it('rejects negative time_spent_ms', async () => { 
      const result = await submitExam({ 
        session_id: '123e4567-e89b-12d3-a456-426614174000', 
        final_answers_snapshot: [{ question_id: '123e4567-e89b-12d3-a456-426614174000', selected_option: 'A', answered_at: Date.now(), idempotency_key: '123e4567-e89b-12d3-a456-426614174000', time_spent_ms: -500 }], 
      } as any); 
      expect(result).toEqual({ error: 'VALIDATION_ERROR', message: 'Invalid input' }); 
    }); 

    it('rejects missing fields in clock guard payload', async () => { 
      const result = await submitExam({ 
        session_id: '123e4567-e89b-12d3-a456-426614174000', 
        final_answers_snapshot: [],
        clock_guard_submission: { seal: 'abc', server_timestamp: Date.now() }
      } as any); 
      expect(result).toEqual({ error: 'VALIDATION_ERROR', message: 'Invalid input' }); 
    });

    it('successfully processes submitExam', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      vi.mocked(supabase.from).mockReturnValue(mockChain({ paper_id: 'p1', closed_at: null }));
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null });
      
      const { adminSupabase } = await import('@/lib/supabase/admin');
      vi.mocked(adminSupabase.from).mockReturnValue(mockChain({ error: null }));
      
      const result = await submitExam({ 
        session_id: '123e4567-e89b-12d3-a456-426614174000', 
        final_answers_snapshot: [{ question_id: '123e4567-e89b-12d3-a456-426614174000', selected_option: 'A', answered_at: Date.now(), idempotency_key: '123e4567-e89b-12d3-a456-426614174000', time_spent_ms: 100 }],
        clock_guard_submission: { seal: 'abc', server_timestamp: Date.now(), wall_elapsed: 5000, performance_elapsed: 5000 },
        tab_switches: 0
      }); 
      expect(result).toEqual({ ok: true, data: { success: true } });
    });
  }); 

  describe('initSession', () => {
    it('successfully inits session', async () => {
      const { requireRole } = await import('@/lib/auth/rbac');
      vi.mocked(requireRole).mockResolvedValue({ userId: validUserId, institutionId: validInstId, role: 'student' });
      
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      vi.mocked(supabase.from).mockReturnValue(mockChain({ id: 'p1', status: 'LIVE', institution_id: validInstId, cohort_id: 'c1' }));
      
      const { adminSupabase } = await import('@/lib/supabase/admin');
      vi.mocked(adminSupabase.from).mockReturnValue(mockChain());
      vi.mocked(adminSupabase.rpc).mockResolvedValue({ data: [], error: null });

      const result = await initSession({ paper_id: validUserId });
      expect(result.ok).toBe(true);
    });
  });
});
`;
fs.writeFileSync('src/app/actions/assessment-sessions.test.ts', asTest);

let rTest = fs.readFileSync('src/app/actions/results.test.ts', 'utf8');
rTest = rTest.replace(/'s1'/g, "'123e4567-e89b-12d3-a456-426614174000'");
rTest = rTest.replace(/'s2'/g, "'123e4567-e89b-12d3-a456-426614174001'");
fs.writeFileSync('src/app/actions/results.test.ts', rTest);
