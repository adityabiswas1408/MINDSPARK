const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://ahrnkwuqlhmwenhvnupb.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocm5rd3VxbGhtd2VuaHZudXBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMyMDM4NSwiZXhwIjoyMDg5ODk2Mzg1fQ.AjkQJbeB2rNIQ52hG2C49__WIJOz9mw4T28lSmCrn2A';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocm5rd3VxbGhtd2VuaHZudXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMjAzODUsImV4cCI6MjA4OTg5NjM4NX0.tXKaP-PUmRGbLxpXN7r-xZDPRUWPQc0Y_crjFhwyQDo';
const OFFLINE_SYNC_SECRET = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';
const API_URL = 'https://mindspark-one.vercel.app/api/submissions/offline-sync';

const ADMIN_ID = '75702be6-8159-4c80-a0bd-d316f5098d9c';
const INSTITUTION_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
const LEVEL_ID = 'bbbbbbbb-0000-0000-0000-000000000001';
const COHORT_ID = 'cccccccc-0000-0000-0000-000000000001';

const adminDb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

function computeHmac(sessionId, batchTimestamp, secret) {
  return crypto.createHmac('sha256', secret)
    .update(`${sessionId}:${batchTimestamp}`)
    .digest('hex');
}

async function setup(studentId) {
  console.log('\n--- Setting up test data ---');

  // 1. Ensure teacher exists
  const { data: existingTeacher } = await adminDb.from('teachers').select('id').eq('id', ADMIN_ID).single();
  if (!existingTeacher) {
    const { error: tErr } = await adminDb.from('teachers').insert({ id: ADMIN_ID, full_name: 'Admin Teacher' });
    if (tErr) throw new Error('Teacher insert: ' + tErr.message);
    console.log('Created teacher');
  } else {
    console.log('Teacher exists');
  }

  // 2. Create exam paper
  const { data: paper, error: paperErr } = await adminDb.from('exam_papers').insert({
    title: 'Gate2 Test Paper ' + Date.now(),
    duration_minutes: 60,
    institution_id: INSTITUTION_ID,
    level_id: LEVEL_ID,
    created_by: ADMIN_ID,
    total_marks: 1,
    status: 'draft',
    type: 'EXAM',
  }).select('id').single();
  if (paperErr) throw new Error('exam_papers insert: ' + paperErr.message);
  console.log('Created exam_paper:', paper.id);

  // 3. Create question
  const { data: question, error: qErr } = await adminDb.from('questions').insert({
    paper_id: paper.id,
    question_type: 'mcq',
    question_text: 'What is 2+2?',
    correct_answer: 'A',
    correct_option: 'A',
    option_a: '4',
    option_b: '5',
    option_c: '6',
    option_d: '7',
    marks: 1,
    order_index: 1,
  }).select('id').single();
  if (qErr) throw new Error('questions insert: ' + qErr.message);
  console.log('Created question:', question.id);

  // 4. Create assessment_session (this is what submissions.session_id references)
  const now = new Date();
  const later = new Date(now.getTime() + 3600000); // 1 hour from now
  const { data: session, error: sessErr } = await adminDb.from('assessment_sessions').insert({
    paper_id: paper.id,
    cohort_id: COHORT_ID,
    scheduled_at: now.toISOString(),
    expires_at: later.toISOString(),
    status: 'active',
  }).select('id').single();
  if (sessErr) throw new Error('assessment_sessions insert: ' + sessErr.message);
  console.log('Created assessment_session:', session.id);

  // 5. Create submission referencing the assessment_session
  const { data: submission, error: subErr } = await adminDb.from('submissions').insert({
    student_id: studentId,
    paper_id: paper.id,
    session_id: session.id,
    score: 0,
    sync_status: 'synced',
  }).select('id, session_id').single();
  if (subErr) throw new Error('submissions insert: ' + subErr.message);
  console.log('Created submission:', submission.id, 'session_id:', submission.session_id);

  return { paperId: paper.id, questionId: question.id, sessionId: session.id, submissionId: submission.id };
}

async function task4(token, sessionId, questionId) {
  console.log('\n========================================');
  console.log('=== TASK 4: Idempotency Duplicate Sync ===');
  console.log('========================================');

  const batchTs = Date.now();
  const hmac = computeHmac(sessionId, batchTs, OFFLINE_SYNC_SECRET);
  const idempotencyKey = crypto.randomUUID();

  const body = JSON.stringify({
    session_id: sessionId,
    answers: [{
      question_id: questionId,
      selected_option: 'A',
      answered_at: batchTs,
      idempotency_key: idempotencyKey,
    }],
    hmac_timestamp: hmac,
    batch_timestamp: batchTs,
  });

  console.log('Idempotency key:', idempotencyKey);
  console.log('Sending two identical requests simultaneously...');

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  const [res1, res2] = await Promise.all([
    fetch(API_URL, { method: 'POST', headers, body }),
    fetch(API_URL, { method: 'POST', headers, body }),
  ]);

  const r1 = await res1.json();
  const r2 = await res2.json();
  console.log('Response 1 (HTTP', res1.status + '):', JSON.stringify(r1));
  console.log('Response 2 (HTTP', res2.status + '):', JSON.stringify(r2));

  await new Promise(r => setTimeout(r, 2000));

  const { data: rows } = await adminDb
    .from('student_answers')
    .select('id')
    .eq('idempotency_key', idempotencyKey);

  const count = rows ? rows.length : 0;
  console.log('\nRows with this idempotency key:', count);
  console.log('TASK 4:', count <= 1 ? '✅ PASS — at most 1 row persisted' : '❌ FAIL — duplicate rows');
  return count;
}

async function task5(token, sessionId, questionId, studentId) {
  console.log('\n========================================');
  console.log('=== TASK 5: HMAC Tamper Rejection ===');
  console.log('========================================');

  const batchTs = Date.now();
  const tamperedHmac = 'deadbeef00001111222233334444555566667777888899990000aaaabbbbccccdddd';

  const body = JSON.stringify({
    session_id: sessionId,
    answers: [{
      question_id: questionId,
      selected_option: 'B',
      answered_at: batchTs,
      idempotency_key: crypto.randomUUID(),
    }],
    hmac_timestamp: tamperedHmac,
    batch_timestamp: batchTs,
  });

  console.log('Sending request with tampered HMAC...');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body,
  });

  const result = await res.json();
  console.log('Response (HTTP', res.status + '):', JSON.stringify(result));

  await new Promise(r => setTimeout(r, 2000));

  const { data: logs } = await adminDb
    .from('activity_logs')
    .select('*')
    .eq('user_id', studentId)
    .eq('action_type', 'HMAC_REJECTION')
    .order('timestamp', { ascending: false })
    .limit(1);

  if (logs && logs.length > 0) {
    console.log('\nHMAC_REJECTION log found:');
    console.log('  action_type:', logs[0].action_type);
    console.log('  metadata:', JSON.stringify(logs[0].metadata));
    console.log('TASK 5: ✅ PASS — HMAC rejection logged');
  } else {
    console.log('\nNo HMAC_REJECTION log found.');
    // Check if there's a SYNC_ERROR instead
    const { data: errLogs } = await adminDb
      .from('activity_logs')
      .select('*')
      .eq('action_type', 'SYNC_ERROR')
      .order('timestamp', { ascending: false })
      .limit(3);
    if (errLogs && errLogs.length > 0) {
      console.log('Found SYNC_ERROR logs instead:');
      errLogs.forEach(l => console.log('  ', JSON.stringify(l.metadata)));
    }
    console.log('TASK 5: ❌ FAIL');
  }
}

async function main() {
  console.log('Authenticating as STUDENT-001...');
  const { data: authData, error: authErr } = await anonClient.auth.signInWithPassword({
    email: 'student-001@mindspark.local',
    password: 'password123',
  });
  if (authErr) throw new Error('Auth failed: ' + authErr.message);

  const token = authData.session.access_token;
  const studentId = authData.user.id;
  console.log('Authenticated. Student ID:', studentId);

  const { sessionId, questionId } = await setup(studentId);
  await task4(token, sessionId, questionId);
  await task5(token, sessionId, questionId, studentId);

  console.log('\n========================================');
  console.log('=== Gate 2 Tasks 4 & 5 Complete ===');
  console.log('========================================');
}

main().catch(err => {
  console.error('FATAL:', err.message || err);
  process.exit(1);
});
