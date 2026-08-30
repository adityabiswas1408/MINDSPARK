import { createClient } from '@supabase/supabase-js';

// Use standard env vars or provide fallback for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahrnkwuqlhmwenhvnupb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake-key-if-missing';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const dummyStagingId = '00000000-0000-0000-0000-000000000000';
  
  console.log('Calling RPC with 1 argument...');
  const { data, error } = await supabase.rpc('validate_and_migrate_offline_submission', {
    p_staging_id: dummyStagingId,
  } as any);
  
  if (error) {
    console.error('RPC Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('RPC Success:', JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);
