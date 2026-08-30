import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { ResultsHeroCard } from '@/components/results/results-hero-card';
import { type LedgerTableRow } from '@/components/results/results-ledger-table';
import {
  NoResultsEmptyState,
  NoLatestPublishedHero,
} from '@/components/results/empty-states';
import type { GradeLetter } from '@/components/results/grade-pill';
import { ResultsListClient } from './results-list-client';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/**
 * Local row shape for the student results list page. Mirrors the
 * Supabase inner-join query below — kept colocated (not in a shared
 * types file) because it is the only consumer.
 */
export type LedgerRow = {
  id: string;
  paper_id: string;
  score: number;
  total_questions: number;
  grade: GradeLetter | null;
  completed_at: string | null;
  result_published_at: string | null;
  paper: {
    id: string;
    title: string;
    type: 'EXAM' | 'TEST';
    duration_minutes: number;
    result_published_at: string | null;
    answer_key_released: boolean;
  };
};

function toLedgerTableRow(r: LedgerRow): LedgerTableRow {
  return {
    id: r.id,
    paperTitle: r.paper.title,
    paperType: r.paper.type,
    paperDurationMinutes: r.paper.duration_minutes,
    score: r.score,
    totalQuestions: r.total_questions,
    grade: r.grade,
    completedAt: r.completed_at,
    resultPublishedAt: r.result_published_at,
  };
}

export default async function StudentResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = 'all' } = await searchParams;
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');
  const { userId } = auth;

  const supabase = await createClient();

  const { data: rawRows, error } = await supabase
    .from('submissions')
    .select(
      `
      id,
      paper_id,
      score,
      total_questions,
      grade,
      completed_at,
      result_published_at,
      paper:exam_papers!inner (
        id,
        title,
        type,
        duration_minutes,
        result_published_at,
        answer_key_released
      )
    `,
    )
    .eq('student_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  if (error) {
    // Fail soft — never crash the route. Render the empty state.
    console.error('[student/results] query failed', error);
  }

  // Supabase typegen widens nested joins to arrays; coerce + cast once here.
  const rows: LedgerRow[] = (rawRows ?? []).map((r) => {
    const paperRel = (Array.isArray(r.paper) ? r.paper[0] : r.paper) as
      | LedgerRow['paper']
      | null;
    return {
      id: r.id,
      paper_id: r.paper_id ?? '',
      score: r.score,
      total_questions: r.total_questions,
      grade: r.grade as GradeLetter | null,
      completed_at: r.completed_at,
      result_published_at: r.result_published_at,
      paper: paperRel ?? {
        id: '',
        title: '—',
        type: 'EXAM',
        duration_minutes: 0,
        result_published_at: null,
        answer_key_released: false,
      },
    };
  });

  if (rows.length === 0) {
    return (
      <main className="results-page-shell">
        <header className="page-header">
          <h1 className="page-title">My Results</h1>
          <p className="page-caption">0 results</p>
        </header>
        <NoResultsEmptyState />
      </main>
    );
  }

  const latestPublished = rows.find((r) => r.result_published_at != null) ?? null;
  const tableRows = rows.map(toLedgerTableRow);

  return (
    <main className="results-page-shell">
      <header className="page-header">
        <h1 className="page-title">My Results</h1>
        <p className="page-caption">
          {rows.length} {rows.length === 1 ? 'result' : 'results'}
        </p>
      </header>

      {latestPublished ? (
        <ResultsHeroCard
          submissionId={latestPublished.id}
          paperTitle={latestPublished.paper.title}
          publishedAt={latestPublished.result_published_at!}
          score={latestPublished.score}
          totalQuestions={latestPublished.total_questions}
          grade={latestPublished.grade}
        />
      ) : (
        <NoLatestPublishedHero />
      )}

      <ResultsListClient initialRows={tableRows} initialFilter={filter} />
    </main>
  );
}
