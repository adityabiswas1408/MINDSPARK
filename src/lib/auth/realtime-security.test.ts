// @vitest-environment node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

describe('Realtime Security & Isolation Tests', () => {
  let instA: string;
  let instB: string;
  let paperInstA: string;
  
  let adminAId: string;
  let adminAEmail: string;
  
  let unauthorizedStudentId: string;
  let unauthorizedStudentEmail: string;

  let authorizedStudentId: string;
  let authorizedStudentEmail: string;

  beforeAll(async () => {
    const postfix = Date.now().toString() + Math.random().toString(36).substring(7);
    
    // 1. Create Institutions
    const { data: instResA } = await adminSupabase.from('institutions').insert({ name: 'Test Inst A', slug: `test-inst-a-${postfix}` }).select('id').single();
    const { data: instResB } = await adminSupabase.from('institutions').insert({ name: 'Test Inst B', slug: `test-inst-b-${postfix}` }).select('id').single();
    instA = instResA!.id;
    instB = instResB!.id;

    // 2. Setup Institution A (Paper, Admin, Authorized Student)
    const { data: levelA } = await adminSupabase.from('levels').insert({ institution_id: instA, name: 'Level A', sequence_order: 1 }).select('id').single();
    
    adminAEmail = `adminA-${postfix}@test.com`;
    const { data: authAdminA } = await adminSupabase.auth.admin.createUser({
      email: adminAEmail, password: 'password', email_confirm: true,
      app_metadata: { role: 'admin', institution_id: instA }
    });
    adminAId = authAdminA.user!.id;
    await adminSupabase.from('profiles').insert({ id: adminAId, institution_id: instA, role: 'admin', full_name: 'Admin A', email: adminAEmail });
    const { data: tA } = await adminSupabase.from('teachers').insert({ id: adminAId, full_name: 'Admin A' }).select('id').single();

    const { data: paperA } = await adminSupabase.from('exam_papers').insert({
      institution_id: instA, level_id: levelA!.id, created_by: tA!.id,
      title: 'Inst A Paper', description: 'Test', duration_minutes: 60, status: 'LIVE'
    }).select('id').single();
    paperInstA = paperA!.id;

    authorizedStudentEmail = `authStudentA-${postfix}@test.com`;
    const { data: authStudentA } = await adminSupabase.auth.admin.createUser({
      email: authorizedStudentEmail, password: 'password', email_confirm: true,
      app_metadata: { role: 'student', institution_id: instA }
    });
    authorizedStudentId = authStudentA.user!.id;
    await adminSupabase.from('profiles').insert({ id: authorizedStudentId, institution_id: instA, role: 'student', full_name: 'Student A', email: authorizedStudentEmail });

    // 3. Setup Institution B (Unauthorized Student)
    unauthorizedStudentEmail = `unauthStudentB-${postfix}@test.com`;
    const { data: authStudentB } = await adminSupabase.auth.admin.createUser({
      email: unauthorizedStudentEmail, password: 'password', email_confirm: true,
      app_metadata: { role: 'student', institution_id: instB }
    });
    unauthorizedStudentId = authStudentB.user!.id;
    await adminSupabase.from('profiles').insert({ id: unauthorizedStudentId, institution_id: instB, role: 'student', full_name: 'Student B', email: unauthorizedStudentEmail });

  }, 30000);

  afterAll(async () => {
    if (adminAId) await adminSupabase.auth.admin.deleteUser(adminAId);
    if (authorizedStudentId) await adminSupabase.auth.admin.deleteUser(authorizedStudentId);
    if (unauthorizedStudentId) await adminSupabase.auth.admin.deleteUser(unauthorizedStudentId);
    if (instA && instB) await adminSupabase.from('institutions').delete().in('id', [instA, instB]);
  }, 30000);

  it('rejects unauthorized/wrong-institution user from subscribing to exam channel', async () => {
    const unauthClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await unauthClient.auth.signInWithPassword({ email: unauthorizedStudentEmail, password: 'password' });

    const channel = unauthClient.channel(`exam:${paperInstA}`, { config: { private: true } });
    
    const status = await new Promise((resolve) => {
      channel.subscribe((s) => {
        if (s === 'SUBSCRIBED' || s === 'CHANNEL_ERROR' || s === 'CLOSED') {
          resolve(s);
        }
      });
    });

    expect(status).toBe('CHANNEL_ERROR');
    await unauthClient.removeAllChannels();
  }, 10000);

  it('denies INSERT/publish for unauthorized users on exam channel', async () => {
    // 1. Admin subscribes to listen
    const adminClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await adminClient.auth.signInWithPassword({ email: adminAEmail, password: 'password' });
    const adminChannel = adminClient.channel(`exam:${paperInstA}`, { config: { private: true } });
    
    let receivedPayload: any = null;
    adminChannel.on('broadcast', { event: 'submitted' }, (payload) => {
      receivedPayload = payload;
    });

    await new Promise((resolve) => {
      adminChannel.subscribe((s) => {
        if (s === 'SUBSCRIBED' || s === 'CHANNEL_ERROR') resolve(s);
      });
    });

    // 2. Unauthorized client attempts to send
    const unauthClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await unauthClient.auth.signInWithPassword({ email: unauthorizedStudentEmail, password: 'password' });

    const channel = unauthClient.channel(`exam:${paperInstA}`, { config: { private: true } });
    
    await channel.send({
      type: 'broadcast',
      event: 'submitted',
      payload: { malicious: true },
    });

    // Wait for event to propagate if it were successful
    await new Promise(r => setTimeout(r, 1500));
    
    // Admin should NOT have received it
    expect(receivedPayload).toBeNull();
    
    await unauthClient.removeAllChannels();
    await adminClient.removeAllChannels();
  }, 10000);

  it('allows authorized admin subscriber to receive legitimate server broadcast', async () => {
    const adminClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await adminClient.auth.signInWithPassword({ email: adminAEmail, password: 'password' });

    const channel = adminClient.channel(`exam:${paperInstA}`, { config: { private: true } });
    
    let receivedPayload: any = null;
    channel.on('broadcast', { event: 'submitted' }, (payload) => {
      receivedPayload = payload;
    });

    const status = await new Promise((resolve) => {
      channel.subscribe((s) => {
        if (s === 'SUBSCRIBED' || s === 'CHANNEL_ERROR') resolve(s);
      });
    });

    expect(status).toBe('SUBSCRIBED');

    // Simulate legitimate server-side broadcast (adminSupabase)
    const serverChannel = adminSupabase.channel(`exam:${paperInstA}`, { config: { private: true } });
    await new Promise((resolve) => {
      serverChannel.subscribe((s) => {
        if (s === 'SUBSCRIBED') resolve(s);
      });
    });

    const sendRes = await serverChannel.send({
      type: 'broadcast',
      event: 'submitted',
      payload: { valid: true },
    });
    expect(sendRes).toBe('ok');

    // Wait for event to propagate
    await new Promise(r => setTimeout(r, 1500));
    
    expect(receivedPayload).not.toBeNull();
    expect(receivedPayload.payload.valid).toBe(true);

    await adminClient.removeAllChannels();
    await adminSupabase.removeAllChannels();
  }, 15000);

  it('presence track/join/leave events fire and are received correctly', async () => {
    const adminClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await adminClient.auth.signInWithPassword({ email: adminAEmail, password: 'password' });

    const studentClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await studentClient.auth.signInWithPassword({ email: authorizedStudentEmail, password: 'password' });

    const adminLobbyChannel = adminClient.channel(`lobby:${paperInstA}`, { config: { private: true } });
    
    let joinPresences: any[] = [];
    let leftPresencesList: any[] = [];
    
    adminLobbyChannel
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        joinPresences.push(...newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresencesList.push(...leftPresences);
      });

    const adminStatus = await new Promise((resolve) => {
      adminLobbyChannel.subscribe((s) => {
        if (s === 'SUBSCRIBED' || s === 'CHANNEL_ERROR') resolve(s);
      });
    });
    expect(adminStatus).toBe('SUBSCRIBED');

    const studentLobbyChannel = studentClient.channel(`lobby:${paperInstA}`, { config: { private: true } });
    const studentStatus = await new Promise((resolve) => {
      studentLobbyChannel.subscribe((s) => {
        if (s === 'SUBSCRIBED' || s === 'CHANNEL_ERROR') resolve(s);
      });
    });
    expect(studentStatus).toBe('SUBSCRIBED');

    // Track presence
    await studentLobbyChannel.track({ student_id: authorizedStudentId, online_at: Date.now() });

    // Wait for event to propagate (presence sync can take up to 2 seconds)
    await new Promise(r => setTimeout(r, 3000));
    
    expect(joinPresences.length).toBeGreaterThan(0);
    expect(joinPresences[0].student_id).toBe(authorizedStudentId);

    // Test leave event
    await studentLobbyChannel.untrack();
    await new Promise(r => setTimeout(r, 3000));
    
    expect(leftPresencesList.length).toBeGreaterThan(0);
    expect(leftPresencesList[0].student_id).toBe(authorizedStudentId);

    await adminClient.removeAllChannels();
    await studentClient.removeAllChannels();
  }, 20000);
});
