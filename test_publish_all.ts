import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { publishAllPaperResults, unpublishAllPaperResults } from '@/app/actions/results';
import * as rbac from '@/lib/auth/rbac';

dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

// We'll mock the role authorization temporarily inside the script
// to bypass Next.js request context issues during script run
const originalRequireRole = rbac.requireRole;
// @ts-ignore
rbac.requireRole = async () => {
  return { userId: '11111111-1111-1111-1111-111111111111', institutionId: instId, role: 'admin' };
};

let instId = '';

async function run() {
  console.log("Looking for a CLOSED paper with completed submissions...");
  
  // Find a paper with completed submissions
  const { data: subs, error: subErr } = await adminSupabase
    .from('submissions')
    .select('paper_id')
    .not('completed_at', 'is', null)
    .limit(10);
    
  if (subErr) throw subErr;
  
  let targetPaperId = null;
  let targetInstId = null;
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
    console.log("Could not find a CLOSED paper with completed submissions. Let's make one.");
    // Wait, if not, we can just use any paper and update it to CLOSED.
    const { data: anyPaper } = await adminSupabase.from('submissions').select('paper_id').not('completed_at', 'is', null).limit(1).single();
    if (anyPaper) {
      targetPaperId = anyPaper.paper_id;
      await adminSupabase.from('exam_papers').update({ status: 'CLOSED' }).eq('id', targetPaperId);
      const { data: p } = await adminSupabase.from('exam_papers').select('institution_id').eq('id', targetPaperId).single();
      targetInstId = p?.institution_id;
    } else {
      console.log("No completed submissions at all!");
      return;
    }
  }
  
  instId = targetInstId!;
  
  console.log(`Found Target Paper: ${targetPaperId}`);
  
  // 1. Publish All
  console.log("\n--- Publishing All Results ---");
  const pubRes = await publishAllPaperResults({ paper_id: targetPaperId });
  console.log("publishAllPaperResults output:", pubRes);
  
  // Verify Database
  const { data: verifyPaperPub } = await adminSupabase.from('exam_papers').select('result_published_at').eq('id', targetPaperId).single();
  const { data: verifySubsPub } = await adminSupabase.from('submissions').select('result_published_at').eq('paper_id', targetPaperId);
  console.log("DB exam_papers.result_published_at:", verifyPaperPub?.result_published_at);
  console.log(`DB submissions.result_published_at (sample):`, verifySubsPub?.[0]?.result_published_at);
  
  // 2. Unpublish All
  console.log("\n--- Unpublishing All Results ---");
  const unpubRes = await unpublishAllPaperResults({ paper_id: targetPaperId, reason: 'Testing unpublish' });
  console.log("unpublishAllPaperResults output:", unpubRes);
  
  // Verify Database
  const { data: verifyPaperUnpub } = await adminSupabase.from('exam_papers').select('result_published_at').eq('id', targetPaperId).single();
  const { data: verifySubsUnpub } = await adminSupabase.from('submissions').select('result_published_at').eq('paper_id', targetPaperId);
  console.log("DB exam_papers.result_published_at:", verifyPaperUnpub?.result_published_at);
  console.log(`DB submissions.result_published_at (sample):`, verifySubsUnpub?.[0]?.result_published_at);
  
  // Reset mock
  // @ts-ignore
  rbac.requireRole = originalRequireRole;
}

run().catch(console.error);
