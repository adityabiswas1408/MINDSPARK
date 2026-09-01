// @vitest-environment node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Requires a test environment with a running Supabase instance and service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

describe('Cross-Tenant Isolation RLS Tests', () => {
  let instA: string;
  let instB: string;
  let userBId: string;
  let userBToken: string;

  let userAId: string;

  beforeAll(async () => {
    try {
      console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing');
      console.log('SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing');
      const postfix = Date.now().toString() + Math.random().toString(36).substring(7);
      // 1. Create Institution A and B
      console.log('Inserting Inst A...');
      const instResA = await adminSupabase.from('institutions').insert({ name: 'Test Inst A', slug: `test-inst-a-${postfix}` }).select('id').single();
      if (instResA.error) throw instResA.error;
      console.log('Inserted Inst A:', instResA.data);
      const instResB = await adminSupabase.from('institutions').insert({ name: 'Test Inst B', slug: `test-inst-b-${postfix}` }).select('id').single();
      if (instResB.error) throw instResB.error;
      console.log('Inserted Inst B:', instResB.data);
      instA = instResA.data!.id;
      instB = instResB.data!.id;

      // 2. Insert test data for Institution A
      console.log('Inserting level A...');
      const levelA = await adminSupabase.from('levels').insert({ institution_id: instA, name: 'Level A', sequence_order: 1 }).select('id').single();
      if (levelA.error) throw levelA.error;
      console.log('Inserted level A');
      console.log('Inserting cohort A...');
      const cohortA = await adminSupabase.from('cohorts').insert({ institution_id: instA, name: 'Cohort A' }).select('id').single();
      if (cohortA.error) throw cohortA.error;
      console.log('Inserted cohort A');
      
      // Create an auth user for profileA since profile.id is FK to auth.users
      console.log('Creating auth user A...');
      const { data: userAAuth } = await adminSupabase.auth.admin.createUser({
        email: `adminA-${postfix}@test.com`, password: 'testpassword123', email_confirm: true,
        app_metadata: { role: 'admin', institution_id: instA }
      });
      console.log('Created auth user A');
      userAId = userAAuth.user!.id;
      console.log('Inserting profile A...');
      const profileA = await adminSupabase.from('profiles').insert({ id: userAId, institution_id: instA, role: 'admin', full_name: 'Admin A', email: `adminA-${postfix}@test.com` }).select('id').single();
      if (profileA.error) throw profileA.error;
      console.log('Inserted profile A');

      // 3. Create a User in Institution B
      const { data: userBAuth } = await adminSupabase.auth.admin.createUser({
        email: `adminB-${postfix}@test.com`,
        password: 'testpassword123',
        email_confirm: true,
        app_metadata: { role: 'admin', institution_id: instB }
      });
      userBId = userBAuth.user!.id;
      await adminSupabase.from('profiles').insert({ id: userBId, institution_id: instB, role: 'admin', full_name: 'Admin B', email: `adminB-${postfix}@test.com` });

      const { data: session } = await adminSupabase.auth.signInWithPassword({ email: `adminB-${postfix}@test.com`, password: 'testpassword123' });
      userBToken = session.session!.access_token;
    } catch (e) {
      console.error('ERROR IN SETUP:', e);
      throw e;
    }
  }, 30000);

  afterAll(async () => {
    // Cleanup
    if (userAId) await adminSupabase.auth.admin.deleteUser(userAId);
    if (userBId) await adminSupabase.auth.admin.deleteUser(userBId);
    if (instA && instB) await adminSupabase.from('institutions').delete().in('id', [instA, instB]);
  }, 30000);

  it('rejects cross-tenant read access for all tables', async () => {
    // Authenticate as User B
    const clientB = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${userBToken}` } }
    });

    // Attempt to read data belonging to Institution A
    const levelsQuery = await clientB.from('levels').select('*').eq('institution_id', instA);
    expect(levelsQuery.data).toEqual([]); // Should be empty due to RLS

    const cohortsQuery = await clientB.from('cohorts').select('*').eq('institution_id', instA);
    expect(cohortsQuery.data).toEqual([]); // Should be empty

    // Testing the global read leaks specifically
    const instQuery = await clientB.from('institutions').select('*').eq('id', instA);
    expect(instQuery.data).toEqual([]); // Institution A should be invisible to B

    const profilesQuery = await clientB.from('profiles').select('*').eq('institution_id', instA);
    expect(profilesQuery.data).toEqual([]); 
  }, 30000);
});
