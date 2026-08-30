import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';

export const instant = false;

type AnswerRow = {
  id: string;
  selected_option: string | null;
  is_correct: boolean;
  question: {
    id: string;
    question_text: string;
    options: string[];
    correct_option: string;
    marks: number;
  };
};

export default async function AnswerSheetPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');

  const supabase = await createClient();

  // 1. Fetch submission/paper details for header
  const { data: submission } = await supabase
    .from('student_submissions_view')
    .select(
      `
      id,
      score,
      total_questions,
      paper:exam_papers!inner(title)
    `
    )
    .eq('id', submissionId)
    .eq('student_id', auth.userId)
    .maybeSingle();

  if (!submission) notFound();

  // 2. Fetch answers (Automatically gated by RLS: 0 rows if answer_key_released is false)
  const { data: rawAnswers, error } = await supabase
    .from('student_answers')
    .select(
      `
      id,
      selected_option,
      is_correct,
      question:questions!inner (
        id,
        question_text,
        options,
        correct_option,
        marks
      )
    `
    )
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true }); // Assuming we want them in order of answering or by question index?
    // Let's just order by question id for stability if sequence is unknown

  if (error) {
    console.error('Failed to fetch answers', error);
  }

  if (!rawAnswers || rawAnswers.length === 0) {
    return (
      <main className="results-detail-shell">
        <Link href={`/student/results/${submissionId}`} className="back-link">
          <ArrowLeft aria-hidden="true" />
          Back to Results
        </Link>
        <div className="empty-state">
          <h3>Answer Sheet Unavailable</h3>
          <p>The answer key has not been released yet, or there are no answers for this submission.</p>
        </div>
      </main>
    );
  }

  const paperTitle = Array.isArray(submission.paper) ? submission.paper[0]?.title : submission.paper?.title;

  return (
    <main className="results-detail-shell max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <nav>
        <Link href={`/student/results/${submissionId}`} className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to Results
        </Link>
      </nav>

      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{paperTitle} - Answer Sheet</h1>
        <p className="text-slate-500">
          Review your answers below. You scored {submission.score} out of {submission.total_questions}.
        </p>
      </header>

      <div className="space-y-6">
        {rawAnswers.map((answer, index) => {
          const q = Array.isArray(answer.question) ? answer.question[0] : answer.question;
          if (!q) return null;

          return (
            <div 
              key={answer.id} 
              className={`p-6 rounded-xl border ${answer.is_correct ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-900 text-white font-medium text-sm">
                    {index + 1}
                  </span>
                  {answer.is_correct ? (
                    <span className="inline-flex items-center text-sm font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm font-medium text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Incorrect
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-slate-500">
                  {answer.is_correct ? q.marks : 0} / {q.marks} marks
                </div>
              </div>

              <div className="prose prose-slate max-w-none mb-6">
                <p className="text-slate-900 font-medium whitespace-pre-wrap">{q.question_text}</p>
              </div>

              <div className="space-y-3">
                {q.options && q.options.map((opt: string, i: number) => {
                  const isSelected = answer.selected_option === opt;
                  const isCorrectAnswer = q.correct_option === opt;
                  
                  let optionClass = "p-4 border rounded-lg text-sm ";
                  
                  if (isSelected && isCorrectAnswer) {
                    optionClass += "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500";
                  } else if (isSelected && !isCorrectAnswer) {
                    optionClass += "border-red-300 bg-red-50 text-red-900";
                  } else if (!isSelected && isCorrectAnswer) {
                    optionClass += "border-green-500 bg-green-50 text-green-900 border-dashed";
                  } else {
                    optionClass += "border-slate-200 bg-white text-slate-600";
                  }

                  return (
                    <div key={i} className={optionClass}>
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {isSelected && <span className="text-xs font-semibold uppercase tracking-wider">Your Answer</span>}
                        {(!isSelected && isCorrectAnswer) && <span className="text-xs font-semibold uppercase tracking-wider text-green-700">Correct Answer</span>}
                      </div>
                    </div>
                  );
                })}
                
                {/* Handle null selected_option (unanswered) */}
                {answer.selected_option === null && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800 font-medium">You did not answer this question.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
