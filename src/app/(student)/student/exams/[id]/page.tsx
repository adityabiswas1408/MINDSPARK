import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ExamPageClient } from '@/components/exam/exam-page-client';

export default async function StudentExamPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const paperId = params.id;

  const authResult = await requireRole('student');
  if ('error' in authResult) redirect('/login');
  const { userId } = authResult;

  const supabase = await createClient();

  // Fetch exam paper
  const { data: paper } = await supabase
    .from('exam_papers')
    .select('id, title, type, status, duration_minutes, anzan_delay_ms, anzan_digit_count, anzan_row_count')
    .eq('id', paperId)
    .single();

  if (!paper || paper.status !== 'LIVE') redirect('/student/exams');

  // Find the student's open session for this paper
  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('id, expires_at')
    .eq('student_id', userId)
    .eq('paper_id', paperId)
    .is('closed_at', null)
    .single();

  if (!session) redirect(`/student/exams/${paperId}/lobby`);

  // Fetch questions — scoped to this paper, student can only access LIVE papers
  const { data: questionsData } = await supabase
    .from('questions')
    .select('id, equation_display, flash_sequence, option_a, option_b, option_c, option_d, correct_option, order_index')
    .eq('paper_id', paperId)
    .order('order_index', { ascending: true });

  const questions = questionsData ?? [];

  const optionKeys = ['A', 'B', 'C', 'D'] as const;

  if (paper.type === 'TEST') {
    const anzanQuestions = questions.map((q) => ({
      id: q.id,
      flashSequence: q.flash_sequence as number[] | null,
      options: optionKeys
        .map((key, i) => {
          const label = [q.option_a, q.option_b, q.option_c, q.option_d][i];
          return label ? { key, label } : null;
        })
        .filter((o): o is { key: typeof optionKeys[number]; label: string } => o !== null),
      orderIndex: q.order_index,
      seed: q.id,
    }));

    return (
      <ExamPageClient
        sessionId={session.id}
        expiresAt={session.expires_at}
        paperType="TEST"
        anzanQuestions={anzanQuestions}
        anzanConfig={{
          delayMs: paper.anzan_delay_ms ?? 1000,
          digitCount: paper.anzan_digit_count ?? 1,
          rowCount: paper.anzan_row_count ?? 5,
        }}
      />
    );
  }

  // EXAM type
  const examQuestions = questions.map((q) => ({
    id: q.id,
    equationDisplay: q.equation_display ?? '',
    correctOption: (q.correct_option ?? null) as 'A' | 'B' | 'C' | 'D' | null,
    options: optionKeys
      .map((key, i) => {
        const label = [q.option_a, q.option_b, q.option_c, q.option_d][i];
        return label ? { key, label } : null;
      })
      .filter((o): o is { key: typeof optionKeys[number]; label: string } => o !== null),
    orderIndex: q.order_index,
  }));

  return (
    <ExamPageClient
      sessionId={session.id}
      expiresAt={session.expires_at}
      paperType="EXAM"
      examQuestions={examQuestions}
    />
  );
}
