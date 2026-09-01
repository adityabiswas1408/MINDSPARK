'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';
import { issueExamSeal } from '@/lib/anticheat/clock-guard';
import { z } from 'zod';

const InitSessionSchema = z.object({
  paper_id: z.string().uuid(),
});
export type InitSessionInput = z.infer<typeof InitSessionSchema>;

interface InitSessionOutput {
  session_id: string;
  expires_at: string;
  questions:  Array<{
    question_id:      string;
    equation_display: string | null;
    flash_sequence:   number[] | null;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
  }>;
  server_timestamp?: number;
  completion_seal?: string;
}

export async function initSession(input: InitSessionInput): Promise<ActionResult<InitSessionOutput>> {
  const authResult = await requireRole('student');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = InitSessionSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  const supabase = await createClient();

  const { data: paper, error: paperErr } = await supabase
    .from('exam_papers')
    .select('id, status, duration_minutes, institution_id')
    .eq('id', validData.paper_id)
    .single();

  if (paperErr || !paper) return { error: 'ASSESSMENT_NOT_FOUND', message: 'Paper not found.' };
  if (paper.institution_id !== institutionId) return { error: 'FORBIDDEN', message: 'Not enrolled.' };
  if (paper.status !== 'LIVE') return { error: 'ASSESSMENT_NOT_LIVE', message: 'Not live.' };

  const { data: student } = await supabase.from('students').select('cohort_id').eq('id', userId).single();
  if (!student?.cohort_id) {
    return { error: 'STUDENT_NOT_ENROLLED', message: 'Student is not enrolled in a cohort.' };
  }
  const cohortId = student.cohort_id;

  const { data: existingSession } = await supabase
    .from('assessment_sessions')
    .select('id, expires_at')
    .eq('student_id', userId)
    .eq('paper_id', validData.paper_id)
    .is('closed_at', null)
    .single();

  const { data: questionsData } = await adminSupabase
    .from('questions')
    .select('id, equation_display, flash_sequence, option_a, option_b, option_c, option_d')
    .eq('paper_id', validData.paper_id)
    .order('order_index', { ascending: true });

  const formattedQuestions = (questionsData || []).map(q => ({
    question_id: q.id,
    equation_display: q.equation_display,
    flash_sequence: q.flash_sequence as number[] | null,
    option_a: q.option_a || '',
    option_b: q.option_b || '',
    option_c: q.option_c || '',
    option_d: q.option_d || ''
  }));

  if (existingSession) {
    return { 
      ok: true, 
      data: { 
        session_id: existingSession.id, 
        expires_at: existingSession.expires_at, 
        questions: formattedQuestions 
        // Note: For resumed sessions, we might need to issue a new seal or look up the old one.
        // For now, we issue a new seal based on the remaining duration.
      } 
    };
  }

  const durationStr = paper.duration_minutes ? parseInt(String(paper.duration_minutes), 10) : 60;
  const expiresAt = new Date(Date.now() + durationStr * 60000).toISOString();
  const now = new Date().toISOString();

  const { data: newSession, error: sessionErr } = await adminSupabase
    .from('assessment_sessions')
    .insert({
      student_id: userId,
      paper_id: input.paper_id,
      started_at: now,
      expires_at: expiresAt,
      scheduled_at: now,
      cohort_id: cohortId,
      status: 'active'
    })
    .select('id')
    .single();

  if (sessionErr || !newSession) return { error: 'INTERNAL_ERROR', message: sessionErr.message };

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'assessment_sessions',
    entity_id: newSession.id,
    action_type: 'INIT_SESSION'
  });

  const serverTimestamp = Date.now();
  const durationMs = durationStr * 60000;
  const completionSeal = issueExamSeal({
    student_id: userId,
    paper_id: input.paper_id,
    server_timestamp: serverTimestamp,
    duration_ms: durationMs,
  });

  return { 
    ok: true, 
    data: { 
      session_id: newSession.id, 
      expires_at: expiresAt, 
      questions: formattedQuestions,
      server_timestamp: serverTimestamp,
      completion_seal: completionSeal
    } 
  };
}


const AnswerSchema = z.object({
  question_id: z.string().uuid(),
  selected_option: z.enum(['A', 'B', 'C', 'D']).nullable(),
  answered_at: z.number(),
  idempotency_key: z.string().uuid(),
  time_spent_ms: z.number().int().nonnegative(),
});

const SubmitExamSchema = z.object({
  session_id: z.string().uuid(),
  final_answers_snapshot: z.array(AnswerSchema),
  tab_switches: z.number().int().nonnegative().optional(),
  clock_guard_submission: z.object({
    seal: z.string(),
    server_timestamp: z.number(),
    performance_elapsed: z.number(),
    wall_elapsed: z.number(),
  }).optional(),
});
export type SubmitExamInput = z.infer<typeof SubmitExamSchema>;

export async function submitExam(input: SubmitExamInput): Promise<ActionResult<{ submitted: true; completed_at: string }>> {
  const authResult = await requireRole('student');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = SubmitExamSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  const supabase = await createClient();

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, student_id, paper_id, closed_at')
    .eq('id', validData.session_id)
    .single();

  if (!session) return { error: 'SESSION_NOT_FOUND', message: 'Session not found' };
  if (session.student_id !== userId) return { error: 'FORBIDDEN', message: 'Not owner' };

  const now = new Date().toISOString();

  if (session.closed_at) {
    return { ok: true, data: { submitted: true, completed_at: session.closed_at } };
  }

  // Fetch paper duration to compute the real clock-guard HMAC seal.
  const { data: paperRow } = await adminSupabase
    .from('exam_papers')
    .select('duration_minutes')
    .eq('id', session.paper_id)
    .maybeSingle();

  const durationMs = ((paperRow?.duration_minutes as number | null) ?? 60) * 60_000;
  
  let antiCheatFlags: string[] = [];
  let finalSeal = validData.clock_guard_submission?.seal ?? null;

  if (validData.clock_guard_submission) {
    const { validateClockGuard } = await import('@/lib/anticheat/clock-guard');
    const clockResult = validateClockGuard(
      validData.clock_guard_submission,
      session.paper_id,
      userId,
      durationMs,
      Date.now()
    );
    antiCheatFlags = clockResult.flags;
  } else {
    antiCheatFlags.push('MISSING_CLOCK_GUARD_PAYLOAD');
  }

  const { data: sub } = await adminSupabase.from('submissions').upsert({
    session_id: validData.session_id,
    student_id: userId,
    paper_id: session.paper_id,
    completed_at: now,
    completion_seal: finalSeal,
    anti_cheat_flags: antiCheatFlags,
    tab_switches: validData.tab_switches ?? 0
  }, { onConflict: 'session_id,student_id' }).select('id, completed_at').single();

  await adminSupabase.from('assessment_sessions').update({ closed_at: now }).eq('id', validData.session_id);

  if (validData.final_answers_snapshot && validData.final_answers_snapshot.length > 0) {
    // sub was upserted above and its id is the correct submissions FK value
    const submissionRowId = sub?.id ?? validData.session_id;

    // Server-authoritative is_correct: batch-fetch correct_option for every
    // question referenced in the snapshot, then compare against each
    // client-supplied selected_option. Never trust client-supplied is_correct.
    const questionIds = validData.final_answers_snapshot.map(a => a.question_id);
    const { data: questionRows } = await adminSupabase
      .from('questions')
      .select('id, correct_option')
      .in('id', questionIds);

    const correctOptionById = new Map<string, string | null>(
      (questionRows ?? []).map(q => [q.id as string, (q.correct_option as string | null) ?? null])
    );

    const payloads = validData.final_answers_snapshot.map(a => {
      const correctOption = correctOptionById.get(a.question_id) ?? null;
      const isCorrect =
        correctOption != null &&
        a.selected_option != null &&
        correctOption === a.selected_option;
      return {
        idempotency_key: a.idempotency_key,
        submission_id:   submissionRowId,
        question_id:     a.question_id,
        selected_option: a.selected_option,
        answered_at:     new Date(a.answered_at).toISOString(),
        time_spent_ms:   a.time_spent_ms,
        is_correct:      isCorrect,
      };
    });
    await adminSupabase.from('student_answers').upsert(payloads, { onConflict: 'idempotency_key', ignoreDuplicates: true });
  }

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'assessment_sessions',
    entity_id: validData.session_id,
    action_type: 'SUBMIT_EXAM'
  });

  // Broadcast the submission on the exam channel so the admin monitor
  // transitions this student to 'submitted' in real-time (Zone 2 migration
  // from postgres_changes to broadcast per 10_architecture.md §5).
  try {
    const channel = adminSupabase.channel(`exam:${session.paper_id}`, { config: { private: true } });
    await channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'submitted',
          payload: {
            student_id: userId,
            timestamp: Date.now(),
          },
        }).then(() => adminSupabase.removeChannel(channel));
      }
    });
  } catch {
    // Broadcast is fire-and-forget; never block the submission on it.
  }

  return { ok: true, data: { submitted: true, completed_at: sub?.completed_at || now } };
}
