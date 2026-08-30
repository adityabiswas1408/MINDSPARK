import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await admin.from('exam_papers').select('result_published_at').limit(1);
  console.log('Result:', data, 'Error:', error);
  process.exit(0);
}
run();
