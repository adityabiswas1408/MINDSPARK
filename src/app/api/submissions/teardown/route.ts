import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';

// Re-using literal strings to match the docs/12_api-contracts.md ErrorCode taxonomy
const BodySchema = z.object({
  submission_id: z.string().uuid().optional(),
  session_id: z.string().uuid(),
  client_timestamp: z.number(),
  answers_snapshot: z.array(
    z.object({
      question_id: z.string().uuid(),
      selected_option: z.enum(['A', 'B', 'C', 'D']).nullable(),
      answered_at: z.number(),
      idempotency_key: z.string().uuid(),
      time_spent_ms: z.number().int().nonnegative(),
    })
  ),
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
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Must use service role to validate JWT as we are outside of React request context cookies
    const {
      data: { user },
      error: authError,
    } = await adminSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (user.app_metadata?.role !== 'student') {
      return NextResponse.json({ error: 'FORBIDDEN', message: 'Only students can teardown submissions' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { session_id, answers_snapshot, client_timestamp, tab_switches, clock_guard_submission } = parsed.data;

    // 1. Validate submission belongs to this user & get their institution
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('institution_id')
      .eq('id', user.id)
      .single();

    if (!profile?.institution_id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: submission, error: submissionQueryError } = await adminSupabase
      .from('submissions')
      .select('id, student_id, completed_at, session_id')
      .eq('session_id', session_id)
      .eq('student_id', user.id)
      .single();

    if (submissionQueryError || !submission || submission.student_id !== user.id) {
      // Return 200 to keepalive ignoring bad payloads to avoid leaking state
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 2. Insert into staging
    if (answers_snapshot.length > 0) {
      // Create a single staging record containing the entire snapshot as a JSON payload
      const { error: insertError } = await adminSupabase
        .from('offline_submissions_staging')
        .insert({
          institution_id: profile.institution_id,
          session_id,
          student_id: user.id,
          client_ts: client_timestamp,
          status: 'pending',
          payload: {
            submission_id: submission.id,
            answers: answers_snapshot,
            tab_switches: tab_switches ?? 0,
          },
        });
      
      if (insertError) {
        console.error('[Teardown] Staging insert error:', insertError);
      }
    }

    // 3. Mark completed_at and clock guard if missing
    if (!submission.completed_at) {
      let antiCheatFlags: string[] = [];
      let finalSeal = clock_guard_submission?.seal ?? null;

      if (clock_guard_submission) {
        const { validateClockGuard } = await import('@/lib/anticheat/clock-guard');
        const { data: sessionData } = await adminSupabase
          .from('assessment_sessions')
          .select('paper_id')
          .eq('id', session_id)
          .single();
          
        if (sessionData) {
          const { data: paperRow } = await adminSupabase
            .from('exam_papers')
            .select('duration_minutes')
            .eq('id', sessionData.paper_id)
            .maybeSingle();
            
          const durationMs = ((paperRow?.duration_minutes as number | null) ?? 60) * 60_000;
          
          const clockResult = validateClockGuard(
            clock_guard_submission,
            sessionData.paper_id,
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

      const { error: updateError } = await adminSupabase
        .from('submissions')
        .update({ 
          completed_at: now,
          completion_seal: finalSeal,
          anti_cheat_flags: antiCheatFlags,
          tab_switches: tab_switches ?? 0
        })
        .eq('id', submission.id);
      
      if (updateError) {
        console.error('[Teardown] Complete update error:', updateError);
      }

      await adminSupabase.from('assessment_sessions')
        .update({ closed_at: now })
        .eq('id', session_id);
    }

    // 4. Log activity
    await adminSupabase.from('activity_logs').insert({
      user_id: user.id,
      institution_id: profile.institution_id,
      action_type: 'TEARDOWN',
      entity_id: submission.id,
      entity_type: 'submission',
      metadata: { session_id, answers_synced: answers_snapshot.length }
    });

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    console.error('[Teardown] Internal Error:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
