import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

describe('Results RLS Gate Tests', () => {
  it('evaluates RLS gates sequentially', async () => {
    const postfix = Date.now().toString();
    const instRes = await adminSupabase.from('institutions').insert({ name: 'RLS Inst', slug: `rls-inst-${postfix}` }).select('id').single();
    if (instRes.error) throw instRes.error;
    const instId = instRes.data.id;

    const level = await adminSupabase.from('levels').insert({ institution_id: instId, name: 'L1', sequence_order: 1 }).select('id').single();
    
    // Create teacher
    const { data: teacherAuth, error: authError } = await adminSupabase.auth.admin.createUser({
      email: `teacher-${postfix}@test.com`, password: 'testpassword123', email_confirm: true,
      app_metadata: { role: 'teacher', institution_id: instId }
    });
    if (authError) throw authError;

    await adminSupabase.from('profiles').insert({ id: teacherAuth.user!.id, institution_id: instId, role: 'teacher', full_name: 'Teacher', email: `teacher-${postfix}@test.com` }).select('id').single();
    await adminSupabase.from('teachers').insert({ id: teacherAuth.user!.id, full_name: 'Teacher' }).select('id').single();

    const paperRes = await adminSupabase.from('exam_papers').insert({
      institution_id: instId, title: 'RLS Paper', type: 'EXAM', duration_minutes: 60, status: 'CLOSED',
      answer_key_released: false, level_id: level.data!.id, created_by: teacherAuth.user!.id
    }).select('id').single();
    if (paperRes.error) throw paperRes.error;
    const paperId = paperRes.data!.id;

    const { data: userAuth } = await adminSupabase.auth.admin.createUser({
      email: `student-${postfix}@test.com`, password: 'testpassword123', email_confirm: true,
      app_metadata: { role: 'student', institution_id: instId }
    });
    const studentId = userAuth.user!.id;
    await adminSupabase.from('profiles').insert({ id: studentId, institution_id: instId, role: 'student', full_name: 'Student', email: `student-${postfix}@test.com` });

    const cohort = await adminSupabase.from('cohorts').insert({ institution_id: instId, name: 'Cohort' }).select('id').single();
    await adminSupabase.from('students').insert({ id: studentId, level_id: level.data!.id, cohort_id: cohort.data!.id, full_name: 'Student', roll_number: `R${postfix}` });

    const sessionRes = await adminSupabase.from('assessment_sessions').insert({
      paper_id: paperId, cohort_id: cohort.data!.id, scheduled_at: new Date().toISOString(), expires_at: new Date(Date.now() + 3600000).toISOString(), status: 'completed'
    }).select('id').single();
    const sessionId = sessionRes.data!.id;

    const subRes = await adminSupabase.from('submissions').insert({
      session_id: sessionId, student_id: studentId, paper_id: paperId,
      score: 10, total_questions: 10, percentage: 100, completed_at: new Date().toISOString()
    }).select('id').single();
    const submissionId = subRes.data!.id;

    const qRes = await adminSupabase.from('questions').insert({
      paper_id: paperId, question_text: 'Q1', question_type: 'mcq', options: ['A','B'], correct_option: 'A', correct_answer: 'A', marks: 10, order_index: 1
    }).select('id').single();

    const ansRes = await adminSupabase.from('student_answers').insert({
      submission_id: submissionId, question_id: qRes.data!.id, is_correct: true, selected_option: 'A', time_spent_ms: 1000
    }).select('*');
    if (ansRes.error) throw ansRes.error;
    console.log("INSERTED ANSWER:", ansRes.data);

    const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const { data: signInRes, error: signInError } = await authClient.auth.signInWithPassword({ email: `student-${postfix}@test.com`, password: 'testpassword123' });
    if (signInError) throw signInError;
    const studentToken = signInRes.session!.access_token;

    const studentClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${studentToken}` } }
    });

    // 1. Blocks reading answers when answer_key_released is false
    const { data: answers1 } = await studentClient.from('student_answers').select('id, question_id, is_correct, selected_option, question:questions!inner(id, question_text, options, correct_option, marks)').eq('submission_id', submissionId);
    expect(answers1).toHaveLength(0);

    // 2. Redacts score in view when result_published_at is null
    const { data: subs1 } = await studentClient.from('student_submissions_view').select('score, result_published_at').eq('id', submissionId);
    expect(subs1).toHaveLength(1);
    expect(subs1![0].score).toBeNull();
    expect(subs1![0].result_published_at).toBeNull();

    // 3. Admin releases answer key
    const upRes = await adminSupabase.from('exam_papers').update({ answer_key_released: true }).eq('id', paperId).select('*');
    if (upRes.error) throw upRes.error;
    expect(upRes.data.length).toBe(1);

    const { data: qs } = await studentClient.from('questions').select('*').eq('paper_id', paperId);
    console.log("QUESTIONS READABLE?", qs?.length);

    // 4. Allows reading answers
    const jwtPayload = JSON.parse(Buffer.from(studentToken.split('.')[1], 'base64').toString());
    console.log("JWT PAYLOAD:", jwtPayload);
    const { data: answers2 } = await studentClient.from('student_answers').select('id, question_id, is_correct, selected_option, question:questions!inner(id, question_text, options, correct_option, marks)').eq('submission_id', submissionId);
    expect(answers2).toHaveLength(1);

    // 5. Admin publishes result
    const now = new Date().toISOString();
    const upRes2 = await adminSupabase.from('submissions').update({ result_published_at: now }).eq('id', submissionId).select('*');
    if (upRes2.error) throw upRes2.error;
    expect(upRes2.data.length).toBe(1);

    // 6. Exposes score in view
    const { data: subs2 } = await studentClient.from('student_submissions_view').select('score, result_published_at').eq('id', submissionId);
    expect(subs2).toHaveLength(1);
    expect(subs2![0].score).toBe(10);
    expect(subs2![0].result_published_at).not.toBeNull();
  }, 30000);
});
