import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LobbyClient } from './lobby-client';

export default async function StudentExamLobbyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const paperId = params.id;

  const authResult = await requireRole('student');
  if ('error' in authResult) redirect('/login');
  
  const { userId } = authResult;
  const supabase = await createClient();

  // Fetch student info
  const { data: student } = await supabase
    .from('students')
    .select('consent_verified, full_name')
    .eq('id', userId)
    .single();

  if (!student) redirect('/student/exams');

  // Fetch exam paper
  const { data: paper } = await supabase
    .from('exam_papers')
    .select('id, title, type, duration_minutes, opened_at, status')
    .eq('id', paperId)
    .single();

  if (!paper) redirect('/student/exams');

  // If exam status is not LIVE, redirect
  if (paper.status !== 'LIVE') {
    redirect('/student/exams');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Centered Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <LobbyClient
            paperId={paper.id}
            examTitle={paper.title}
            openedAt={paper.opened_at || new Date().toISOString()}
            durationMinutes={paper.duration_minutes}
            consentVerified={!!student.consent_verified}
          />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div
        style={{
          borderTop: '1px solid #E2E8F0',
          paddingTop: '16px',
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          fontWeight: '600',
          color: '#94A3B8',
          letterSpacing: '0.05em',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
        </div>
        <div>
          SESSION ID: {paper.id} · LOBBY: PRE-ASSESSMENT · USER: ACTIVE, STUDENT ROLE
        </div>
      </div>
    </div>
  );
}
