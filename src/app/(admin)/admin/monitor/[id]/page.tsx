import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import MonitorClient, { type InitialSession } from './monitor-client';

interface Props {
  params: Promise<{ id: string }>;
}

type RawSubmission = { id: string; completed_at: string | null };
type RawSession = {
  id: string;
  student_id: string | null;
  status: string | null;
  students: { full_name: string; roll_number: string } | null;
  submissions: RawSubmission[] | null;
};

export default async function AdminMonitorDetailPage({ params }: Props) {
  const { id: paperId } = await params;

  const authResult = await requireRole('admin');
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();

  // Fetch paper metadata
  const { data: paper } = await supabase
    .from('exam_papers')
    .select('id, title, status, duration_minutes, opened_at')
    .eq('id', paperId)
    .eq('institution_id', institutionId)
    .single();

  if (!paper) notFound();

  // Question count for progress bar denominator
  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('paper_id', paperId);

  // Sessions with student info and submission state
  // Filter: student_id IS NOT NULL (excludes cohort-level session)
  //         closed_at IS NULL (active sessions only)
  const { data: rawSessions } = await supabase
    .from('assessment_sessions')
    .select('id, student_id, status, students(full_name, roll_number), submissions(id, completed_at)')
    .eq('paper_id', paperId)
    .not('student_id', 'is', null)
    .is('closed_at', null);

  const sessions = (rawSessions as RawSession[] | null) ?? [];

  // Collect all submission IDs to bulk-count answers
  const submissionIds = sessions
    .flatMap(s => (s.submissions ?? []).map(sub => sub.id))
    .filter(Boolean);

  // Count student_answers per submission_id
  const answerCountMap: Record<string, number> = {};
  if (submissionIds.length > 0) {
    const { data: answers } = await supabase
      .from('student_answers')
      .select('submission_id')
      .in('submission_id', submissionIds);
    for (const a of answers ?? []) {
      answerCountMap[a.submission_id] = (answerCountMap[a.submission_id] ?? 0) + 1;
    }
  }

  // Build typed InitialSession array — filter out any rows where join failed
  const initialSessions: InitialSession[] = sessions
    .filter(s => s.student_id !== null && s.students !== null)
    .map(s => {
      const sub = s.submissions?.[0] ?? null;
      return {
        session_id: s.id,
        student_id: s.student_id!,
        full_name: s.students!.full_name,
        roll_number: s.students!.roll_number,
        session_status: s.status ?? 'active',
        completed_at: sub?.completed_at ?? null,
        answered_count: sub ? (answerCountMap[sub.id] ?? 0) : 0,
      };
    });

  return (
    <MonitorClient
      paperId={paperId}
      paperTitle={paper.title}
      paperStatus={paper.status ?? 'LIVE'}
      durationMinutes={paper.duration_minutes ?? 60}
      openedAt={paper.opened_at ?? null}
      totalQuestions={totalQuestions ?? 0}
      initialSessions={initialSessions}
    />
  );
}
