import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runCleanup() {
  console.log("Starting DB Cleanup...");

  // 1. Delete test institutions
  console.log("Deleting test institutions...");
  const { data: insts, error: instErr } = await adminSupabase
    .from('institutions')
    .select('id, name')
    .like('name', 'Test Inst%');

  if (instErr) {
    console.error("Error fetching institutions:", instErr);
  } else if (insts && insts.length > 0) {
    console.log(`Found ${insts.length} test institutions. Deleting...`);
    const instIds = insts.map(i => i.id);
    
    // Batch delete in chunks of 50 to avoid URL length issues
    for (let i = 0; i < instIds.length; i += 50) {
      const chunk = instIds.slice(i, i + 50);
      const { error: delErr } = await adminSupabase
        .from('institutions')
        .delete()
        .in('id', chunk);
      if (delErr) {
        console.error("Error deleting institutions chunk:", delErr);
      }
    }
    console.log("Institutions deleted.");
  } else {
    console.log("No test institutions found.");
  }

  // 2. Fetch and delete auth users ending in @mindspark.local
  console.log("Fetching auth users to delete...");
  let page = 1;
  let hasMore = true;
  let usersToDelete = [];

  while (hasMore) {
    const { data: authData, error: authErr } = await adminSupabase.auth.admin.listUsers({
      page: page,
      perPage: 1000
    });

    if (authErr) {
      console.error("Error fetching auth users:", authErr);
      break;
    }

    if (authData && authData.users) {
      const targetUsers = authData.users.filter(u => 
        u.email && u.email.endsWith('@mindspark.local')
      );
      usersToDelete.push(...targetUsers);

      if (authData.users.length < 1000) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  if (usersToDelete.length > 0) {
    console.log(`Found ${usersToDelete.length} test auth users. Deleting...`);
    for (const u of usersToDelete) {
      const { error } = await adminSupabase.auth.admin.deleteUser(u.id);
      if (error) {
        console.error(`Failed to delete user ${u.email}:`, error.message);
      }
    }
    console.log("Auth users deleted.");
  } else {
    console.log("No test auth users found.");
  }

  // 3. Delete remaining test profiles (if they don't have matching auth users, or are just stale)
  console.log("Deleting any remaining test profiles directly...");
  const { error: profErr } = await adminSupabase
    .from('profiles')
    .delete()
    .or("email.like.%@mindspark.local,full_name.like.Test %");
    
  if (profErr) {
    console.error("Error deleting remaining profiles:", profErr);
  } else {
    console.log("Remaining test profiles deleted.");
  }

  console.log("Cleanup Complete.");
}

runCleanup();
