import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';

// Re-using literal strings to match the docs/12_api-contracts.md ErrorCode taxonomy
const BodySchema = z.object({
  submission_id: z.string().uuid(),
  session_id: z.string().uuid(),
  client_timestamp: z.number(),
  answers_snapshot: z.array(
    z.object({
      question_id: z.string().uuid(),
      selected_option: z.enum(['A', 'B', 'C', 'D']).nullable(),
      answered_at: z.number(),
      idempotency_key: z.string().uuid(),
    })
  ),
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

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { submission_id, session_id, answers_snapshot, client_timestamp } = parsed.data;

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
      .select('id, student_id, completed_at')
      .eq('id', submission_id)
      .eq('session_id', session_id)
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
            submission_id,
            answers: answers_snapshot,
          },
        });
      
      if (insertError) {
        console.error('[Teardown] Staging insert error:', insertError);
      }
    }

    // 3. Mark completed_at if missing
    if (!submission.completed_at) {
      const { error: updateError } = await adminSupabase
        .from('submissions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', submission_id);
      
      if (updateError) {
        console.error('[Teardown] Complete update error:', updateError);
      }
    }

    // 4. Log activity
    await adminSupabase.from('activity_logs').insert({
      user_id: user.id,
      institution_id: profile.institution_id,
      action_type: 'TEARDOWN',
      entity_id: submission_id,
      entity_type: 'submission',
      metadata: { session_id, answers_synced: answers_snapshot.length }
    });

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    console.error('[Teardown] Internal Error:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
