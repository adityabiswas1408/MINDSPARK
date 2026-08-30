import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, ArrowRight, Lock, Clock } from 'lucide-react';
import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { ScoreFraction } from '@/components/results/score-fraction';
import type { GradeLetter } from '@/components/results/grade-pill';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type DetailRow = {
  id: string;
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
    answer_key_released: boolean;
  };
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function ResultsDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');

  const supabase = await createClient();
  const { data: rawRow } = await supabase
    .from('submissions')
    .select(
      `
      id,
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
        answer_key_released
      )
    `,
    )
    .eq('id', submissionId)
    .eq('student_id', auth.userId)
    .maybeSingle();

  if (!rawRow) notFound();

  const paperRel = (Array.isArray(rawRow.paper) ? rawRow.paper[0] : rawRow.paper) as
    | DetailRow['paper']
    | null;
  if (!paperRel) notFound();

  const row: DetailRow = {
    id: rawRow.id,
    score: rawRow.score,
    total_questions: rawRow.total_questions,
    grade: rawRow.grade as GradeLetter | null,
    completed_at: rawRow.completed_at,
    result_published_at: rawRow.result_published_at,
    paper: paperRel,
  };

  const isPending = row.result_published_at == null;
  const isAnswerSheetUnlocked = !isPending && row.paper.answer_key_released === true;

  const dateLabel = isPending
    ? `Submitted ${formatDate(row.completed_at)}`
    : `Published ${formatDate(row.result_published_at)}`;

  return (
    <main className="results-detail-shell">
      <Link href="/student/results" className="back-link">
        <ArrowLeft aria-hidden="true" />
        Back to Results
      </Link>

      <header className="detail-header">
        <h1 className="paper-title">{row.paper.title}</h1>
        <div className="meta-row">
          <span className={`type-pill ${row.paper.type.toLowerCase()}`}>{row.paper.type}</span>
          <span className="dot">·</span>
          <span>{row.paper.duration_minutes} min</span>
          <span className="dot">·</span>
          <span>{dateLabel}</span>
        </div>
      </header>

      {isPending ? (
        <section className="score-panel pending" data-testid="score-panel-pending">
          <Clock aria-hidden="true" />
          <h3>Awaiting grading</h3>
          <p>Your teacher is reviewing this exam — you&rsquo;ll see your score once it&rsquo;s published.</p>
        </section>
      ) : (
        <section className="score-panel" data-testid="score-panel-graded">
          <div className="score-block">
            <ScoreFraction got={row.score} total={row.total_questions} size="lg" />
            <div className="score-caption">Score</div>
          </div>
          {row.grade && (
            <div className="grade-card">
              <div className="letter">{row.grade}</div>
              <div className="caption">Grade</div>
            </div>
          )}
        </section>
      )}

      {isAnswerSheetUnlocked ? (
        <Link
          href={`/student/results/${row.id}/answers`}
          className="cta-card"
          data-testid="answer-sheet-cta-unlocked"
        >
          <FileText className="cta-icon" aria-hidden="true" />
          <div className="cta-body">
            <h4>View Answer Sheet</h4>
            <p>See every question, your answer, and the correct answer.</p>
          </div>
          <ArrowRight className="cta-arrow" aria-hidden="true" />
        </Link>
      ) : (
        <div className="cta-card locked" data-testid="answer-sheet-cta-locked">
          <Lock className="cta-icon" aria-hidden="true" />
          <div className="cta-body">
            <h4>Answer Sheet Locked</h4>
            <p>
              {isPending
                ? "You'll be able to review answers after your teacher grades and releases this exam."
                : "Your teacher hasn't released the answer key yet. Check back later."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
