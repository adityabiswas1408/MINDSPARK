// Live test: call bulk_import_students RPC directly with 2 valid rows
// This proves the FK bug: profiles.id FK -> auth.users(id) will fail
// because the RPC uses gen_random_uuid() without creating auth.users rows first.

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(supabaseUrl, serviceKey);

async function main() {
  const instId = '00000000-0000-0000-0000-000000000000';
  const ts = Date.now();

  const { data: cohort } = await admin
    .from('cohorts')
    .select('id')
    .eq('institution_id', instId)
    .limit(1)
    .single();

  console.log('Cohort found:', cohort);

  const rows = [
    { roll_number: `BULK-A-${ts}`, full_name: `Bulk Student A ${ts}`, dob: null },
    { roll_number: `BULK-B-${ts}`, full_name: `Bulk Student B ${ts}`, dob: null },
  ];

  console.log('\n--- Calling bulk_import_students RPC ---');
  const { data, error } = await admin.rpc('bulk_import_students', {
    p_institution_id: instId,
    p_cohort_id: cohort?.id ?? '',
    p_rows: rows,
  });

  console.log('RPC error:', error);
  console.log('RPC result:', JSON.stringify(data, null, 2));

  // Now check if rows actually ended up in profiles and students
  console.log('\n--- Checking profiles ---');
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .eq('institution_id', instId)
    .ilike('full_name', `%Bulk Student%`);
  console.log('Profiles found:', profiles);

  console.log('\n--- Checking students ---');
  const { data: students } = await admin
    .from('students')
    .select('id, full_name, roll_number')
    .eq('institution_id', instId)
    .ilike('roll_number', `%BULK%`);
  console.log('Students found:', students);
}

main().catch(console.error);
