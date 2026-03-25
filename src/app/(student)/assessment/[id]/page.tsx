import { requireRole } from '@/lib/auth/rbac';
import { redirect } from 'next/navigation';
import { initSession } from '@/app/actions/assessment-sessions';
import { AssessmentClient } from './assessment-client';

interface AssessmentPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server Component — assessment entry point.
 *
 * Responsibilities:
 *   1. Auth gate (student role required)
 *   2. Delegate session creation + question fetch to initSession Server Action
 *   3. Pass data to client component for engine mounting
 *
 * Session creation, cohort lookup, and question fetching are all
 * handled by the existing initSession Server Action — no duplication.
 */
export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { id: assessmentId } = await params;
  const authResult = await requireRole('student');
  if ('error' in authResult) redirect('/login');

  // Delegate to existing Server Action — handles session creation,
  // cohort lookup, question fetch, status validation, and idempotency.
  const result = await initSession({ paper_id: assessmentId });

  if ('error' in result) {
    redirect('/student/dashboard');
  }

  const { session_id, questions } = result.data;

  // Transform questions for client component
  const sortedQuestions = questions.map((q, i) => ({
    id: q.question_id,
    equationDisplay: q.equation_display,
    flashSequence: q.flash_sequence as number[] | null,
    seed: q.question_id, // Question UUID is the PRNG seed
    orderIndex: i,
    options: [
      { key: 'A' as const, label: q.option_a },
      { key: 'B' as const, label: q.option_b },
      { key: 'C' as const, label: q.option_c },
      { key: 'D' as const, label: q.option_d },
    ],
  }));

  return (
    <AssessmentClient
      assessmentId={assessmentId}
      assessmentType="TEST" // TODO: Read from exam_papers.type via initSession
      sessionId={session_id}
      questions={sortedQuestions}
      anzanConfig={{
        delayMs: 500,        // TODO: Read from exam_papers.anzan_delay_ms via initSession
        digitCount: 2,       // default until column added
        rowCount: 5,         // default until column added
      }}
    />
  );
}
