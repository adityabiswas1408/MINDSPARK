import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { EmptyState } from '@/components/shared/empty-state';
import { FileText } from 'lucide-react';
import { CreateAssessmentWizard } from '@/components/assessments/create-assessment-wizard';
import { AssessmentCard } from '@/components/assessments/assessment-card';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminAssessmentsPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();
  const [{ data: papers }, { data: levels }, { data: inst }] = await Promise.all([
    supabase.from('exam_papers').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
    supabase.from('levels').select('id, name').eq('institution_id', institutionId).order('sequence_order'),
    supabase.from('institutions').select('default_duration_minutes, default_per_question_time_seconds').eq('id', institutionId).single(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Assessments</h1>
        <CreateAssessmentWizard 
          levels={levels ?? []} 
          defaultDurationMinutes={inst?.default_duration_minutes ?? null}
          defaultPerQuestionTimeSeconds={inst?.default_per_question_time_seconds ?? null}
        />
      </div>
      {!papers || papers.length === 0 ? (
        <div className="max-w-xl mx-auto mt-12">
          <EmptyState
            icon={<FileText size={48} />}
            title="No Assessments Found"
            description="Create a new assessment to get started."
            action={<CreateAssessmentWizard 
              levels={levels ?? []} 
              defaultDurationMinutes={inst?.default_duration_minutes ?? null}
              defaultPerQuestionTimeSeconds={inst?.default_per_question_time_seconds ?? null}
            />}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {papers.map((paper) => (
            <AssessmentCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}
