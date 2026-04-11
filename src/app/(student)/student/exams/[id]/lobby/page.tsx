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
      {/* Debug footer removed — 'SESSION ID: …' / 'LOBBY: PRE-ASSESSMENT' /
          'USER: ACTIVE, STUDENT ROLE' exposed UUIDs to screen readers and
          leaked internal state. Violated CLAUDE.md microcopy rules and
          08_a11y §5. */}
    </div>
  );
}
