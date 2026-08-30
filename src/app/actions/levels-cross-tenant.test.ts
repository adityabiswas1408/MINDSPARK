// @vitest-environment node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Requires a test environment with a running Supabase instance and service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

// Mock the server environment
vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { requireRole } from '@/lib/auth/rbac';
import { createLevel } from './levels';

describe('Levels Server Actions Live Cross-Tenant Tests', () => {
  let instA: string;
  let instB: string;
  let adminAId: string;
  let adminBId: string;
  
  beforeAll(async () => {
    const postfix = Date.now().toString();
    const instResA = await adminSupabase.from('institutions').insert({ name: 'Test Inst A', slug: `test-inst-a-${postfix}` }).select('id').single();
    const instResB = await adminSupabase.from('institutions').insert({ name: 'Test Inst B', slug: `test-inst-b-${postfix}` }).select('id').single();
    instA = instResA.data!.id;
    instB = instResB.data!.id;

    adminAId = `11111111-1111-1111-1111-${postfix.substring(0, 12).padStart(12, '0')}`;
    adminBId = `22222222-2222-2222-2222-${postfix.substring(0, 12).padStart(12, '0')}`;
  }, 30000);

  afterAll(async () => {
    // Cleanup
    if (instA && instB) await adminSupabase.from('institutions').delete().in('id', [instA, instB]);
  }, 30000);

  it('scoping: Admin A always creates level in Inst A, ignoring client input', async () => {
    // Mock requireRole as Admin A (Inst A)
    (requireRole as any).mockResolvedValue({ userId: adminAId, institutionId: instA, role: 'admin' });

    const result = await createLevel({ name: 'Level 1 for A' });
    expect(result.ok).toBe(true);
    
    // Verify it landed in Inst A
    const { data } = await adminSupabase.from('levels').select('*').eq('id', (result as any).data.level_id).single();
    expect(data?.institution_id).toBe(instA);
    expect(data?.sequence_order).toBe(1); // since it's the first level
  });

  it('race condition: concurrent creations properly assign distinct sequence_order', async () => {
    (requireRole as any).mockResolvedValue({ userId: adminBId, institutionId: instB, role: 'admin' });

    // We dispatch 2 requests concurrently for Inst B
    const promise1 = createLevel({ name: 'Concurrent Level B1' });
    const promise2 = createLevel({ name: 'Concurrent Level B2' });

    const [res1, res2] = await Promise.all([promise1, promise2]);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);

    const { data: data1 } = await adminSupabase.from('levels').select('*').eq('id', (res1 as any).data.level_id).single();
    const { data: data2 } = await adminSupabase.from('levels').select('*').eq('id', (res2 as any).data.level_id).single();

    // Verify both landed in B
    expect(data1?.institution_id).toBe(instB);
    expect(data2?.institution_id).toBe(instB);

    // Verify distinct sequence orders (they should be 1 and 2, order not guaranteed but one is 1 and other is 2)
    const seqOrders = [data1?.sequence_order, data2?.sequence_order].sort();
    expect(seqOrders).toEqual([1, 2]);
  });
});
