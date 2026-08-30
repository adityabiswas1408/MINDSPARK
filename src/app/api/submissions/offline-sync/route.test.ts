// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Import the route handler
import { POST } from './route';
import { adminSupabase } from '@/lib/supabase/admin';

describe('POST /api/submissions/offline-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default valid mock for getUser
    (adminSupabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', app_metadata: { role: 'student' } } },
      error: null,
    });

    // Mock from('profiles') and from('submissions') and from('offline_submissions_staging')
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn();
    const mockInsert = vi.fn().mockReturnThis();

    (adminSupabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return { select: mockSelect, eq: mockEq, single: mockSingle.mockResolvedValue({ data: { institution_id: 'inst-123' } }) };
      }
      if (table === 'submissions') {
        return { select: mockSelect, eq: mockEq, single: mockSingle.mockResolvedValue({ data: { id: 'sub-123', completed_at: null } }) };
      }
      if (table === 'offline_submissions_staging') {
        return { insert: mockInsert.mockReturnThis(), select: mockSelect, single: mockSingle.mockResolvedValue({ data: { id: 'staging-123' }, error: null }) };
      }
    });

    // Mock RPC
    (adminSupabase.rpc as any).mockResolvedValue({
      data: { status: 'success', synced_count: 1 },
      error: null,
    });
  });

  it('rejects payload with missing time_spent_ms due to missing Dexie schema upgrade', async () => {
    const req = new NextRequest('http://localhost/api/submissions/offline-sync', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer fake-token' },
      body: JSON.stringify({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        batch_timestamp: Date.now(),
        answers: [
          {
            question_id: '123e4567-e89b-12d3-a456-426614174000',
            selected_option: 'A',
            answered_at: Date.now(),
            idempotency_key: '123e4567-e89b-12d3-a456-426614174000',
            // time_spent_ms is intentionally missing to simulate unmigrated v1 Dexie records
          }
        ]
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toBe('VALIDATION_ERROR');
  });

  it('accepts correctly shaped payload with time_spent_ms and processes staging queue', async () => {
    const req = new NextRequest('http://localhost/api/submissions/offline-sync', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer fake-token' },
      body: JSON.stringify({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        batch_timestamp: Date.now(),
        answers: [
          {
            question_id: '123e4567-e89b-12d3-a456-426614174000',
            selected_option: 'A',
            answered_at: Date.now(),
            idempotency_key: '123e4567-e89b-12d3-a456-426614174000',
            time_spent_ms: 1500, // Migrated successfully
          }
        ]
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.synced_count).toBe(1);

    // Verify RPC was called with 1 argument as per our new DB schema fix (prevent secret logging)
    expect(adminSupabase.rpc).toHaveBeenCalledWith(
      'validate_and_migrate_offline_submission',
      expect.objectContaining({
        p_staging_id: 'staging-123'
      })
    );
  });
});
