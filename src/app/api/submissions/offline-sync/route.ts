import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';

// In-memory rate limiting map
// Target: 10 requests per student per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const AnswerSchema = z.object({
  question_id: z.string().uuid(),
  selected_option: z.enum(['A', 'B', 'C', 'D']).nullable(),
  answered_at: z.number(),
  idempotency_key: z.string().uuid(),
});

const BodySchema = z.object({
  session_id: z.string().uuid(),
  answers: z.array(AnswerSchema),
  batch_timestamp: z.number(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. JWT Auth from headers natively
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 2. Sliding Window Rate Limiting Logic (Module-level Map)
    const now = Date.now();
    let rateRecord = rateLimitMap.get(user.id);

    if (!rateRecord || now > rateRecord.resetAt) {
      rateRecord = { count: 1, resetAt: now + 60000 };
      rateLimitMap.set(user.id, rateRecord);
    } else {
      if (rateRecord.count >= 10) {
        return NextResponse.json(
          { error: 'RATE_LIMITED', retry_after: Math.ceil((rateRecord.resetAt - now) / 1000) },
          { status: 429 }
        );
      }
      rateRecord.count++;
    }

    // 3. Payload Parsing
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 422 });
    }

    const { session_id, answers, batch_timestamp } = parsed.data;

    // Compute HMAC server-side — secret never touches the client
    const hmac_timestamp = createHmac('sha256', process.env.HMAC_SECRET ?? '')
      .update(`${session_id}:${batch_timestamp}`)
      .digest('hex');

    // Early exit mapping to contract bounds
    if (answers.length === 0) {
      return NextResponse.json({ ok: true, synced_count: 0, synced_keys: [], rejected_keys: [] }, { status: 200 });
    }

    // 4. Retrieve context bounds (institution_id, submission_id, status)
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('institution_id')
      .eq('id', user.id)
      .single();

    if (!profile?.institution_id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: submission } = await adminSupabase
      .from('submissions')
      .select('id, completed_at')
      .eq('student_id', user.id)
      .eq('session_id', session_id)
      .single();

    if (!submission) {
      return NextResponse.json({ error: 'SESSION_NOT_FOUND' }, { status: 404 }); 
    }

    // Handle session closed logic described in the API matrix
    if (submission.completed_at && answers.length > 0) {
      return NextResponse.json({ error: 'ALREADY_SUBMITTED' }, { status: 409 });
    }

    // 5. Insert ONE payload staging row
    const { data: stagingRow, error: insertError } = await adminSupabase
      .from('offline_submissions_staging')
      .insert({
        institution_id: profile.institution_id,
        session_id,
        student_id: user.id,
        client_ts: batch_timestamp,
        hmac_timestamp,         
        status: 'pending',
        payload: {
          submission_id: submission.id,
          answers,
        },
      })
      .select('id')
      .single();

    if (insertError || !stagingRow) {
      throw new Error(`Staging insert failed: ${insertError?.message}`);
    }

    // 6. Execute RPC 
    const { data: rpcResult, error: rpcError } = await adminSupabase.rpc('validate_and_migrate_offline_submission', {
      p_staging_id: stagingRow.id,
      p_hmac_timestamp: hmac_timestamp,
      p_client_ts: batch_timestamp,
      p_secret: process.env.HMAC_SECRET ?? '',
    });

    if (rpcError) {
      console.error('[OfflineSync] RPC Execution Error:', rpcError);
      return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
    }

    const answerKeys = answers.map(a => a.idempotency_key);
    
    // Explicitly cast RPC result from generic JSON mapping to verify validation shape
    const resultObj = rpcResult as unknown as { status: string; reason?: string };

    if (resultObj?.status === 'rejected') {
      return NextResponse.json({
        ok: true,
        synced_count: 0,
        synced_keys: [],
        rejected_keys: answerKeys,
      }, { status: 200 });
    }

    return NextResponse.json({
      ok: true,
      synced_count: answers.length,
      synced_keys: answerKeys,
      rejected_keys: [],
    }, { status: 200 });

  } catch (error) {
    console.error('[OfflineSync] Handler Error:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
