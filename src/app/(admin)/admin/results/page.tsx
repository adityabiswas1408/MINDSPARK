import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ResultsClient, type SubmissionRow, type Paper } from '@/components/results/results-client';

interface PageProps {
  searchParams: Promise<{ paper_id?: string }>;
}

export default async function AdminResultsPage({ searchParams }: PageProps) {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const { paper_id } = await searchParams;

  const supabase = await createClient();

  const { data: papersData } = await supabase
    .from('exam_papers')
    .select('id, title')
    .eq('institution_id', institutionId)
    .eq('status', 'CLOSED')
    .order('created_at', { ascending: false });

  const papers: Paper[] = (papersData ?? []).map((p) => ({
    id: p.id as string,
    title: p.title as string,
  }));

  let submissions: SubmissionRow[] = [];

  if (paper_id) {
    const { data } = await supabase
      .from('submissions')
      .select('id, student_id, percentage, grade, dpm, result_published_at, students(full_name)')
      .eq('paper_id', paper_id)
      .not('completed_at', 'is', null)
      .order('created_at', { ascending: true });

    submissions = (data ?? []) as unknown as SubmissionRow[];
  }

  return (
    <ResultsClient
      papers={papers}
      selectedPaperId={paper_id ?? null}
      submissions={submissions}
    />
  );
}
