const { createClient } = require('@supabase/supabase-js');
const db = createClient(
  'https://ahrnkwuqlhmwenhvnupb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocm5rd3VxbGhtd2VuaHZudXBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMyMDM4NSwiZXhwIjoyMDg5ODk2Mzg1fQ.AjkQJbeB2rNIQ52hG2C49__WIJOz9mw4T28lSmCrn2A',
  { auth: { persistSession: false } }
);

async function main() {
  // 1. List all tables via OpenAPI spec
  const url = 'https://ahrnkwuqlhmwenhvnupb.supabase.co/rest/v1/';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocm5rd3VxbGhtd2VuaHZudXBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMyMDM4NSwiZXhwIjoyMDg5ODk2Mzg1fQ.AjkQJbeB2rNIQ52hG2C49__WIJOz9mw4T28lSmCrn2A';
  const res = await fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const spec = await res.json();
  
  // Extract table names from paths
  const tables = Object.keys(spec.definitions || {}).sort();
  console.log('=== ALL TABLES ===');
  console.log(tables.join('\n'));

  // 2. Check submissions columns
  console.log('\n=== SUBMISSIONS COLUMNS ===');
  if (spec.definitions && spec.definitions.submissions) {
    const cols = Object.keys(spec.definitions.submissions.properties || {});
    console.log(cols.join(', '));
  } else {
    console.log('submissions table not found');
  }

  // 3. Check questions columns
  console.log('\n=== QUESTIONS COLUMNS ===');
  if (spec.definitions && spec.definitions.questions) {
    const cols = Object.keys(spec.definitions.questions.properties || {});
    console.log(cols.join(', '));
  } else {
    console.log('questions table not found');
  }

  // 4. Check student_answers columns
  console.log('\n=== STUDENT_ANSWERS COLUMNS ===');
  if (spec.definitions && spec.definitions.student_answers) {
    const cols = Object.keys(spec.definitions.student_answers.properties || {});
    console.log(cols.join(', '));
  } else {
    console.log('student_answers table not found');
  }

  // 5. Check activity_logs columns
  console.log('\n=== ACTIVITY_LOGS COLUMNS ===');
  if (spec.definitions && spec.definitions.activity_logs) {
    const cols = Object.keys(spec.definitions.activity_logs.properties || {});
    console.log(cols.join(', '));
  } else {
    console.log('activity_logs table not found');
  }

  // 6. Check offline_submissions_staging columns
  console.log('\n=== OFFLINE_SUBMISSIONS_STAGING COLUMNS ===');
  if (spec.definitions && spec.definitions.offline_submissions_staging) {
    const cols = Object.keys(spec.definitions.offline_submissions_staging.properties || {});
    console.log(cols.join(', '));
  } else {
    console.log('offline_submissions_staging table not found');
  }

  // 7. Try to get existing data from submissions and questions
  console.log('\n=== EXISTING SUBMISSIONS ===');
  const { data: subs, error: se } = await db.from('submissions').select('*').limit(3);
  console.log('Error:', se?.message);
  console.log(JSON.stringify(subs, null, 2));

  console.log('\n=== EXISTING QUESTIONS ===');
  const { data: qs, error: qe } = await db.from('questions').select('*').limit(3);
  console.log('Error:', qe?.message);
  console.log(JSON.stringify(qs, null, 2));
}

main().catch(console.error);
