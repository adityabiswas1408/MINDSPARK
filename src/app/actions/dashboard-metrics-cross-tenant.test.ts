// @vitest-environment node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Requires a test environment with a running Supabase instance and service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

describe('Dashboard Metrics RPC Live Cross-Tenant Tests', () => {
  let instA: string;
  let instB: string;
  let levelA1: string;
  let levelA2: string;
  let levelB1: string;
  let paperA: string;
  let sessionA: string;
  let studentA: string;
  
  beforeAll(async () => {
    const postfix = Date.now().toString();
    
    // Create Institutions
    const instResA = await adminSupabase.from('institutions').insert({ name: 'Test Inst A', slug: `test-inst-a-${postfix}` }).select('id').single();
    const instResB = await adminSupabase.from('institutions').insert({ name: 'Test Inst B', slug: `test-inst-b-${postfix}` }).select('id').single();
    instA = instResA.data!.id;
    instB = instResB.data!.id;

    // Create Levels (with specific sequence_order)
    const lvlsA = await adminSupabase.from('levels').insert([
      { institution_id: instA, name: 'Level A1', sequence_order: 2 },
      { institution_id: instA, name: 'Level A2', sequence_order: 1 }
    ]).select('id, name');
    
    levelA1 = lvlsA.data!.find(l => l.name === 'Level A1')!.id;
    levelA2 = lvlsA.data!.find(l => l.name === 'Level A2')!.id;

    const lvlsB = await adminSupabase.from('levels').insert([
      { institution_id: instB, name: 'Level B1', sequence_order: 1 }
    ]).select('id, name');
    levelB1 = lvlsB.data![0].id;

    // Create auth users, profiles, and students
    const users = await Promise.all([
      adminSupabase.auth.admin.createUser({ email: `a1-${postfix}@test.com`, password: 'test', email_confirm: true }),
      adminSupabase.auth.admin.createUser({ email: `a2-${postfix}@test.com`, password: 'test', email_confirm: true }),
      adminSupabase.auth.admin.createUser({ email: `a3-${postfix}@test.com`, password: 'test', email_confirm: true }),
      adminSupabase.auth.admin.createUser({ email: `b1-${postfix}@test.com`, password: 'test', email_confirm: true }),
      adminSupabase.auth.admin.createUser({ email: `t1-${postfix}@test.com`, password: 'test', email_confirm: true })
    ]);
    
    studentA = users[0].data.user!.id;
    const stdA2 = users[1].data.user!.id;
    const stdA3 = users[2].data.user!.id;
    const stdB1 = users[3].data.user!.id;
    const teacherA = users[4].data.user!.id;

    const profRes = await adminSupabase.from('profiles').insert([
      { id: studentA, email: `a1-${postfix}@test.com`, role: 'student', institution_id: instA, full_name: 'Student A1' },
      { id: stdA2, email: `a2-${postfix}@test.com`, role: 'student', institution_id: instA, full_name: 'Student A2' },
      { id: stdA3, email: `a3-${postfix}@test.com`, role: 'student', institution_id: instA, full_name: 'Student A3 Deleted' },
      { id: stdB1, email: `b1-${postfix}@test.com`, role: 'student', institution_id: instB, full_name: 'Student B1' },
      { id: teacherA, email: `t1-${postfix}@test.com`, role: 'teacher', institution_id: instA, full_name: 'Teacher A' }
    ]);
    if (profRes.error) console.error("PROFILE ERROR:", profRes.error);

    const cohortRes = await adminSupabase.from('cohorts').insert({ name: 'Cohort A', institution_id: instA }).select('id').single();
    const cohortA = cohortRes.data!.id;

    const cohortBRes = await adminSupabase.from('cohorts').insert({ name: 'Cohort B', institution_id: instB }).select('id').single();
    const cohortB = cohortBRes.data!.id;

    const studentsRes = await adminSupabase.from('students').insert([
      { id: studentA, institution_id: instA, roll_number: `A1-${postfix}`, full_name: 'Student A1', level_id: levelA1, cohort_id: cohortA },
      { id: stdA2, institution_id: instA, roll_number: `A2-${postfix}`, full_name: 'Student A2', level_id: levelA2, cohort_id: cohortA },
      { id: stdA3, institution_id: instA, roll_number: `A3-DEL-${postfix}`, full_name: 'Student A3 Deleted', level_id: levelA1, cohort_id: cohortA, deleted_at: new Date().toISOString() },
      { id: stdB1, institution_id: instB, roll_number: `B1-${postfix}`, full_name: 'Student B1', level_id: levelB1, cohort_id: cohortB }
    ]);
    if (studentsRes.error) console.error("STUDENTS ERROR:", studentsRes.error);
    const teacherRes = await adminSupabase.from('teachers').insert({ id: teacherA, full_name: 'Teacher A' });
    if (teacherRes.error) console.error("TEACHER ERROR:", teacherRes.error);

    const paperRes = await adminSupabase.from('exam_papers').insert({
      institution_id: instA,
      title: 'Exam A',
      status: 'LIVE',
      level_id: levelA1,
      duration_minutes: 60,
      answer_key_released: false, // Initially false
      created_by: teacherA
    }).select('id').single();
    if (paperRes.error) console.error("PAPER ERROR:", paperRes.error);
    paperA = paperRes.data!.id;

    const sessRes = await adminSupabase.from('assessment_sessions').insert({
      paper_id: paperA,
      cohort_id: cohortA,
      status: 'active',
      scheduled_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 1000000).toISOString()
    }).select('id').single();
    if (sessRes.error) console.error("SESSION ERROR:", sessRes.error);
    sessionA = sessRes.data!.id;

    // Insert submissions (completed, but unpublished result)
    await adminSupabase.from('submissions').insert([
      {
        session_id: sessionA,
        student_id: studentA,
        percentage: 85.0,
        completed_at: new Date().toISOString() // Completed but NO result_published_at
      }
    ]);
  }, 30000);

  afterAll(async () => {
    if (instA && instB) await adminSupabase.from('institutions').delete().in('id', [instA, instB]);
  }, 30000);

  it('correctly scopes to institution and excludes soft-deleted students', async () => {
    const { data: metricsA, error: errA } = await adminSupabase.rpc('get_dashboard_metrics', { p_institution_id: instA });
    expect(errA).toBeNull();
    
    // Inst A should have 2 active students (1 deleted)
    expect(metricsA.totalStudents).toBe(2);

    const { data: metricsB, error: errB } = await adminSupabase.rpc('get_dashboard_metrics', { p_institution_id: instB });
    expect(errB).toBeNull();
    
    // Inst B should have 1 active student
    expect(metricsB.totalStudents).toBe(1);
  });

  it('sorts levels by sequence_order, not sort_order', async () => {
    const { data: metricsA } = await adminSupabase.rpc('get_dashboard_metrics', { p_institution_id: instA });
    
    // Level A2 has sequence_order=1, Level A1 has sequence_order=2. 
    // They should be returned in sequence_order.
    const dist = metricsA.levelDist;
    expect(dist[0].level).toBe('Level A2');
    expect(dist[1].level).toBe('Level A1');
    expect(dist[0].students).toBe(1);
    expect(dist[1].students).toBe(1); // Excludes the deleted one!
  });

  it('includes scores from avgScore even if answer_key_released=false and result_published_at=null', async () => {
    // Both tests below should now reflect the 85 score from the unpublished submission.
    
    // Initially, paper has answer_key_released=false and result_published_at=null
    const { data: metrics1 } = await adminSupabase.rpc('get_dashboard_metrics', { p_institution_id: instA });
    expect(metrics1.avgScore).toBe(85);

    // Release answer key, but don't publish results
    await adminSupabase.from('exam_papers').update({ answer_key_released: true }).eq('id', paperA);
    const { data: metrics2 } = await adminSupabase.rpc('get_dashboard_metrics', { p_institution_id: instA });
    expect(metrics2.avgScore).toBe(85);

    // Publish results
    await adminSupabase.from('submissions').update({ result_published_at: new Date().toISOString() }).eq('student_id', studentA);
    const { data: metrics3 } = await adminSupabase.rpc('get_dashboard_metrics', { p_institution_id: instA });
    expect(metrics3.avgScore).toBe(85);
  });
});
