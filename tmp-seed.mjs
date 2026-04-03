// Seed script — creates test institution, admin user, and profile
// Usage: node tmp-seed.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read env vars from .env.local
const envContent = readFileSync('.env.local', 'utf8');
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}="?([^"\\n]+)"?`, 'm'));
  return match ? match[1] : null;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // 1. Check for existing institution
  const { data: existingInst } = await supabase
    .from('institutions')
    .select('id, name, slug')
    .limit(1)
    .single();

  let institutionId;
  if (existingInst) {
    institutionId = existingInst.id;
    console.log(`✅ Institution exists: ${existingInst.name} (${institutionId})`);
  } else {
    const { data: newInst, error: instErr } = await supabase
      .from('institutions')
      .insert({
        name: 'Demo School',
        slug: 'demo-school',
        timezone: 'Asia/Kolkata',
        session_timeout_seconds: 3600
      })
      .select('id')
      .single();

    if (instErr) { console.error('❌ Institution insert failed:', instErr.message); process.exit(1); }
    institutionId = newInst.id;
    console.log(`✅ Institution created: Demo School (${institutionId})`);
  }

  // 2. Check for existing admin user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existingAdmin = users?.find(u => u.email === 'admin@mindspark.test');

  let adminId;
  if (existingAdmin) {
    adminId = existingAdmin.id;
    console.log(`✅ Admin user exists: admin@mindspark.test (${adminId})`);
  } else {
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: 'admin@mindspark.test',
      password: 'Admin@123456',
      email_confirm: true,
      app_metadata: { role: 'admin', institution_id: institutionId }
    });

    if (authErr) { console.error('❌ Admin user create failed:', authErr.message); process.exit(1); }
    adminId = authUser.user.id;
    console.log(`✅ Admin user created: admin@mindspark.test (${adminId})`);
  }

  // 3. Ensure role is set in app_metadata
  const { error: metaErr } = await supabase.auth.admin.updateUserById(adminId, {
    app_metadata: { role: 'admin', institution_id: institutionId }
  });
  if (metaErr) console.warn('⚠️ Metadata update warning:', metaErr.message);
  else console.log(`✅ app_metadata set: role=admin, institution_id=${institutionId}`);

  // 4. Ensure profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', adminId)
    .single();

  if (!existingProfile) {
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert({
        id: adminId,
        email: 'admin@mindspark.test',
        full_name: 'Admin User',
        role: 'admin',
        institution_id: institutionId
      });

    if (profileErr) console.warn('⚠️ Profile insert warning:', profileErr.message);
    else console.log(`✅ Profile created for admin`);
  } else {
    console.log(`✅ Profile exists for admin`);
  }

  console.log('\n🎯 Login credentials:');
  console.log('   Email:    admin@mindspark.test');
  console.log('   Password: Admin@123456');
  console.log(`   Institution: ${institutionId}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
