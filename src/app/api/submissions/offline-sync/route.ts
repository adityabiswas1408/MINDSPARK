import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';
import { timingSafeCompare } from '@/lib/anticheat/clock-guard';

// Fail-closed: refuse to load the module at all when the HMAC secret is
// missing. Computing HMACs with an empty key is trivially forgeable, so the
// previous `process.env.HMAC_SECRET ?? ''` fallback was a silent security hole.
const HMAC_SECRET: string = (() => {
  const s = process.env.HMAC_SECRET;
  if (!s) throw new Error('[security] HMAC_SECRET env var is not set');
  return s;
})();

// In-memory rate limiting map
// Target: 10 requests per student per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const AnswerSchema = z.object({
  question_id: z.string().uuid(),
  selected_option: z.enum(['A', 'B', 'C', 'D']).nullable(),
  answered_at: z.number(),
  idempotency_key: z.string().uuid(),
  time_spent_ms: z.number().int().nonnegative(),
});

const BodySchema = z.object({
  session_id: z.string().uuid(),
  answers: z.array(AnswerSchema),
  batch_timestamp: z.number(),
  tab_switches: z.number().int().nonnegative().optional(),
  clock_guard_submission: z.object({
    seal: z.string(),
    server_timestamp: z.number(),
    performance_elapsed: z.number(),
    wall_elapsed: z.number(),
  }).optional(),
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
    
    if (user.app_metadata?.role !== 'student') {
      return NextResponse.json({ error: 'FORBIDDEN', message: 'Only students can sync submissions' }, { status: 403 });
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

    const { session_id, answers, batch_timestamp, tab_switches, clock_guard_submission } = parsed.data;

    // Compute HMAC server-side — secret never touches the client
    const hmac_timestamp = createHmac('sha256', HMAC_SECRET)
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

    // 6. Execute RPC (HMAC verification moved to Node/removed from DB to prevent secret logging)
    // Note: Since the client does not send an HMAC for batch syncs, we only generate it here
    // for staging integrity. There is no client seal to timingSafeCompare against.
    const { data: rpcResult, error: rpcError } = await adminSupabase.rpc('validate_and_migrate_offline_submission', {
      p_staging_id: stagingRow.id,
    } as any);

    if (rpcError) {
      console.error('[OfflineSync] RPC Execution Error:', rpcError);
      return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
    }

    const answerKeys = answers.map(a => a.idempotency_key);
    
    // Explicitly cast RPC result from generic JSON mapping to verify validation shape
    const resultObj = rpcResult as unknown as { status: string; reason?: string };

    if (resultObj?.status === 'rejected') {
      if (resultObj.reason === 'HMAC_MISMATCH') {
        return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
      }
      return NextResponse.json({
        ok: true,
        synced_count: 0,
        synced_keys: [],
        rejected_keys: answerKeys,
      }, { status: 200 });
    }

    // 7. Update anti_cheat_flags and close session if successful
    if (resultObj?.status === 'success' || resultObj?.status === 'migrated') {
      let antiCheatFlags: string[] = [];
      let finalSeal = clock_guard_submission?.seal ?? null;
      
      if (clock_guard_submission) {
        const { validateClockGuard } = await import('@/lib/anticheat/clock-guard');
        
        // Fetch paper duration to compute real clock-guard HMAC seal
        const { data: session } = await adminSupabase
          .from('assessment_sessions')
          .select('paper_id')
          .eq('id', session_id)
          .single();
          
        if (session) {
          const { data: paperRow } = await adminSupabase
            .from('exam_papers')
            .select('duration_minutes')
            .eq('id', session.paper_id)
            .maybeSingle();
            
          const durationMs = ((paperRow?.duration_minutes as number | null) ?? 60) * 60_000;
          
          const clockResult = validateClockGuard(
            clock_guard_submission,
            session.paper_id,
            user.id,
            durationMs,
            Date.now()
          );
          antiCheatFlags = clockResult.flags;
        }
      } else {
        antiCheatFlags.push('MISSING_CLOCK_GUARD_PAYLOAD');
      }
      
      const now = new Date().toISOString();
      
      await adminSupabase.from('submissions').update({
        completed_at: now,
        completion_seal: finalSeal,
        anti_cheat_flags: antiCheatFlags,
        tab_switches: tab_switches ?? 0
      }).eq('id', submission.id);
      
      await adminSupabase.from('assessment_sessions')
        .update({ closed_at: now })
        .eq('id', session_id);
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
