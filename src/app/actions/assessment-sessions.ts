'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';

interface InitSessionInput {
  paper_id: string;
}

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
}

export async function initSession(input: InitSessionInput): Promise<ActionResult<InitSessionOutput>> {
  const authResult = await requireRole('student');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { data: paper, error: paperErr } = await supabase
    .from('exam_papers')
    .select('id, status, duration_minutes, institution_id')
    .eq('id', input.paper_id)
    .single();

  if (paperErr || !paper) return { error: 'ASSESSMENT_NOT_FOUND', message: 'Paper not found.' };
  if (paper.institution_id !== institutionId) return { error: 'FORBIDDEN', message: 'Not enrolled.' };
  if (paper.status !== 'LIVE') return { error: 'ASSESSMENT_NOT_LIVE', message: 'Not live.' };

  const { data: student } = await supabase.from('students').select('cohort_id').eq('id', userId).single();
  const cohortId = student?.cohort_id || '';

  const { data: existingSession } = await supabase
    .from('assessment_sessions')
    .select('id, expires_at')
    .eq('student_id', userId)
    .eq('paper_id', input.paper_id)
    .is('closed_at', null)
    .single();

  const { data: questionsData } = await adminSupabase
    .from('questions')
    .select('id, equation_display, flash_sequence, option_a, option_b, option_c, option_d')
    .eq('paper_id', input.paper_id)
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
      cohort_id: cohortId as unknown as string,
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

  return { ok: true, data: { session_id: newSession.id, expires_at: expiresAt, questions: formattedQuestions } };
}

interface SubmitAnswerInput {
  session_id:      string;
  question_id:     string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  answered_at:     number;
  idempotency_key: string;
}

export async function submitAnswer(input: SubmitAnswerInput): Promise<ActionResult<{ saved: true }>> {
  const authResult = await requireRole('student');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId } = authResult;

  const supabase = await createClient();

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, student_id, closed_at')
    .eq('id', input.session_id)
    .single();

  if (!session) return { error: 'SESSION_NOT_FOUND', message: 'Invalid session' };
  if (session.student_id !== userId) return { error: 'FORBIDDEN', message: 'Not your session' };
  if (session.closed_at) return { error: 'SESSION_CLOSED', message: 'Session closed' };

  // C-4 fix: look up the actual submission.id for this session
  // student_answers.submission_id FK → submissions(id), not assessment_sessions(id)
  const { data: sub } = await adminSupabase
    .from('submissions')
    .select('id')
    .eq('session_id', input.session_id)
    .eq('student_id', userId)
    .maybeSingle();

  const submissionId = sub?.id ?? input.session_id;

  await adminSupabase.from('student_answers').upsert({
    idempotency_key: input.idempotency_key,
    submission_id:   submissionId,
    question_id:     input.question_id,
    selected_option: input.selected_option,
    answered_at:     new Date(input.answered_at).toISOString()
  }, { onConflict: 'idempotency_key' });

  return { ok: true, data: { saved: true } };
}

interface Answer {
  question_id:      string;
  selected_option:  'A' | 'B' | 'C' | 'D' | null;
  answered_at:      number;
  idempotency_key:  string;
}

interface SubmitExamInput {
  session_id:             string;
  final_answers_snapshot: Answer[];
}

export async function submitExam(input: SubmitExamInput): Promise<ActionResult<{ submitted: true; completed_at: string }>> {
  const authResult = await requireRole('student');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, student_id, paper_id, closed_at')
    .eq('id', input.session_id)
    .single();

  if (!session) return { error: 'SESSION_NOT_FOUND', message: 'Session not found' };
  if (session.student_id !== userId) return { error: 'FORBIDDEN', message: 'Not owner' };

  const now = new Date().toISOString();

  if (session.closed_at) {
    return { ok: true, data: { submitted: true, completed_at: session.closed_at } };
  }

  const seal = 'sealed-' + input.session_id + '-' + Date.now();
  const { data: sub } = await adminSupabase.from('submissions').upsert({
    session_id: input.session_id,
    student_id: userId,
    paper_id: session.paper_id,
    completed_at: now,
    completion_seal: seal
  }, { onConflict: 'session_id' }).select('id, completed_at').single();

  await adminSupabase.from('assessment_sessions').update({ closed_at: now }).eq('id', input.session_id);

  if (input.final_answers_snapshot && input.final_answers_snapshot.length > 0) {
    // sub was upserted above and its id is the correct submissions FK value
    const submissionRowId = sub?.id ?? input.session_id;
    const payloads = input.final_answers_snapshot.map(a => ({
      idempotency_key: a.idempotency_key,
      submission_id:   submissionRowId,
      question_id:     a.question_id,
      selected_option: a.selected_option,
      answered_at:     new Date(a.answered_at).toISOString()
    }));
    await adminSupabase.from('student_answers').upsert(payloads, { onConflict: 'idempotency_key' });
  }

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'assessment_sessions',
    entity_id: input.session_id,
    action_type: 'SUBMIT_EXAM'
  });

  return { ok: true, data: { submitted: true, completed_at: sub?.completed_at || now } };
}
