// @vitest-environment node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
import { requireRole } from '@/lib/auth/rbac';
import { publishAllPaperResults, unpublishAllPaperResults } from '@/app/actions/results';

describe('Live Happy-Path Publish/Unpublish All', () => {
  let targetPaperId: string;
  let targetInstId: string;
  
  beforeAll(async () => {
    console.log("Looking for a CLOSED paper with completed submissions...");
    const { data: subs, error: subErr } = await adminSupabase
      .from('submissions')
      .select('paper_id')
      .not('completed_at', 'is', null)
      .limit(10);
      
    if (subErr) throw subErr;
    
    for (const s of subs) {
      const { data: paper } = await adminSupabase
        .from('exam_papers')
        .select('id, institution_id, status')
        .eq('id', s.paper_id)
        .eq('status', 'CLOSED')
        .single();
      if (paper) {
        targetPaperId = paper.id;
        targetInstId = paper.institution_id;
        break;
      }
    }
    
    if (!targetPaperId) {
      const { data: anyPaper } = await adminSupabase.from('submissions').select('paper_id').not('completed_at', 'is', null).limit(1).single();
      targetPaperId = anyPaper!.paper_id;
      await adminSupabase.from('exam_papers').update({ status: 'CLOSED' }).eq('id', targetPaperId);
      const { data: p } = await adminSupabase.from('exam_papers').select('institution_id').eq('id', targetPaperId).single();
      targetInstId = p!.institution_id;
    }
    
    console.log(`Found Target Paper: ${targetPaperId} (Inst: ${targetInstId})`);
    
    // Setup mock
    (requireRole as any).mockResolvedValue({ userId: '11111111-1111-1111-1111-111111111111', institutionId: targetInstId, role: 'admin' });
  });
  
  it('Task 1: Confirms column result_published_at exists on exam_papers', async () => {
     const { error } = await adminSupabase.from('exam_papers').select('result_published_at').limit(1);
     expect(error).toBeNull();
  });
  
  it('Task 2: Happy path publishAllPaperResults and unpublishAllPaperResults', async () => {
    // 1. Publish All
    console.log("\n--- Publishing All Results ---");
    const pubRes = await publishAllPaperResults({ paper_id: targetPaperId });
    expect((pubRes as any).ok).toBe(true);
    
    // Verify Database
    const { data: verifyPaperPub } = await adminSupabase.from('exam_papers').select('result_published_at').eq('id', targetPaperId).single();
    const { data: verifySubsPub } = await adminSupabase.from('submissions').select('result_published_at').eq('paper_id', targetPaperId);
    
    console.log("DB exam_papers.result_published_at:", verifyPaperPub?.result_published_at);
    console.log(`DB submissions.result_published_at (sample):`, verifySubsPub?.[0]?.result_published_at);
    
    expect(verifyPaperPub?.result_published_at).not.toBeNull();
    expect(verifySubsPub?.[0]?.result_published_at).not.toBeNull();
    
    // 2. Unpublish All
    console.log("\n--- Unpublishing All Results ---");
    const unpubRes = await unpublishAllPaperResults({ paper_id: targetPaperId, reason: 'Testing unpublish' });
    expect((unpubRes as any).ok).toBe(true);
    
    // Verify Database
    const { data: verifyPaperUnpub } = await adminSupabase.from('exam_papers').select('result_published_at').eq('id', targetPaperId).single();
    const { data: verifySubsUnpub } = await adminSupabase.from('submissions').select('result_published_at').eq('paper_id', targetPaperId);
    
    console.log("DB exam_papers.result_published_at:", verifyPaperUnpub?.result_published_at);
    console.log(`DB submissions.result_published_at (sample):`, verifySubsUnpub?.[0]?.result_published_at);
    
    expect(verifyPaperUnpub?.result_published_at).toBeNull();
    expect(verifySubsUnpub?.[0]?.result_published_at).toBeNull();
  });
});
