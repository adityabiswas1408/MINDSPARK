
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
    upsert: vi.fn(() => chain),
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

    it('rejects malformed session_id', async () => { 
      const result = await submitExam({ 
        session_id: 'not-a-uuid', 
        final_answers_snapshot: [], 
      } as any); 
      expect(result).toEqual({ error: 'VALIDATION_ERROR', message: 'Invalid input' }); 
    });

    it('rejects invalid selected_option', async () => { 
      const result = await submitExam({ 
        session_id: '123e4567-e89b-12d3-a456-426614174000', 
        final_answers_snapshot: [{ question_id: '123e4567-e89b-12d3-a456-426614174000', selected_option: 'INVALID', answered_at: Date.now(), idempotency_key: '123e4567-e89b-12d3-a456-426614174000', time_spent_ms: 100 }], 
      } as any); 
      expect(result).toEqual({ error: 'VALIDATION_ERROR', message: 'Invalid input' }); 
    });

    it('rejects negative time_spent_ms', async () => { 
      const result = await submitExam({ 
        session_id: '123e4567-e89b-12d3-a456-426614174000', 
        final_answers_snapshot: [{ question_id: '123e4567-e89b-12d3-a456-426614174000', selected_option: 'A', answered_at: Date.now(), idempotency_key: '123e4567-e89b-12d3-a456-426614174000', time_spent_ms: -500 }], 
      } as any); 
      expect(result).toEqual({ error: 'VALIDATION_ERROR', message: 'Invalid input' }); 
    }); 

    it('rejects negative tab switches', async () => { 
      const result = await submitExam({ 
        session_id: '123e4567-e89b-12d3-a456-426614174000', 
        final_answers_snapshot: [],
        clock_guard_submission: { seal: 'abc', server_timestamp: Date.now(), wall_elapsed: 5000, performance_elapsed: 5000 },
        tab_switches: -1
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
      const supabase = await createClient();
      vi.mocked(supabase.from).mockReturnValue(mockChain({ paper_id: 'p1', closed_at: null, student_id: validUserId }));
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as any);
      
      const { adminSupabase } = await import('@/lib/supabase/admin');
      vi.mocked(adminSupabase.from).mockReturnValue(mockChain() as any);
      
      const result = await submitExam({ 
        session_id: '123e4567-e89b-12d3-a456-426614174000', 
        final_answers_snapshot: [{ question_id: '123e4567-e89b-12d3-a456-426614174000', selected_option: 'A', answered_at: Date.now(), idempotency_key: '123e4567-e89b-12d3-a456-426614174000', time_spent_ms: 100 }],
        clock_guard_submission: { seal: 'abc', server_timestamp: Date.now(), wall_elapsed: 5000, performance_elapsed: 5000 },
        tab_switches: 0
      }); 
      expect(result.ok).toBe(true);
      expect((result as any).data.submitted).toBe(true);

      // Verify that the finalization path sets closed_at exactly once
      expect(adminSupabase.from).toHaveBeenCalledWith('assessment_sessions');
      const mockUpdate = (adminSupabase.from('assessment_sessions') as any).update;
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        closed_at: expect.any(String)
      }));

      // Verify that anti_cheat_flags is set exactly once on submissions
      const mockUpsert = (adminSupabase.from('submissions') as any).upsert;
      const submissionsUpsertCall = mockUpsert.mock.calls.find((call: any[]) => call[0] && call[0].anti_cheat_flags);
      expect(submissionsUpsertCall).toBeDefined();
      expect(submissionsUpsertCall[0]).toEqual(expect.objectContaining({
        completed_at: expect.any(String),
        anti_cheat_flags: expect.any(Array)
      }));
    });
  }); 

  describe('initSession', () => {
    it('successfully inits session', async () => {
      const { requireRole } = await import('@/lib/auth/rbac');
      vi.mocked(requireRole).mockResolvedValue({ userId: validUserId, institutionId: validInstId, role: 'student' });
      
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      vi.mocked(supabase.from).mockReturnValue(mockChain({ id: 'p1', status: 'LIVE', institution_id: validInstId, cohort_id: 'c1' }));
      
      const { adminSupabase } = await import('@/lib/supabase/admin');
      vi.mocked(adminSupabase.from).mockReturnValue(mockChain());
      vi.mocked(adminSupabase.rpc).mockResolvedValue({ data: [], error: null, count: null, status: 200, statusText: 'OK' } as any);

      const result = await initSession({ paper_id: validUserId });
      expect(result.ok).toBe(true);
    });
  });
});
