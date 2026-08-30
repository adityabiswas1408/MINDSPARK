import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const instId = 'a17ffbba-c939-4dcc-a80c-bb9a27dd08b4';
  const level = await adminSupabase.from('levels').insert({ institution_id: instId, name: 'L1', sequence_order: 1 }).select('id').single();
  const postfix = Date.now().toString().slice(-6);

  const id = 'b7d13feb-1669-4bba-8bfc-8a7f27fbce1b';
  
  const upRes = await adminSupabase.from('exam_papers').update({ answer_key_released: true }).eq('id', id).select('*');
  console.log('Updated paper:', upRes.data, upRes.error);
}

run().catch(console.error);
