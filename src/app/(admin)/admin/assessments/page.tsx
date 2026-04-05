import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { EmptyState } from '@/components/shared/empty-state';
import { FileText } from 'lucide-react';
import { CreateAssessmentWizard } from '@/components/assessments/create-assessment-wizard';
import { AssessmentCard } from '@/components/assessments/assessment-card';

export default async function AdminAssessmentsPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();
  const [{ data: papers }, { data: levels }] = await Promise.all([
    supabase.from('exam_papers').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
    supabase.from('levels').select('id, name').eq('institution_id', institutionId).order('sort_order'),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Assessments</h1>
        <CreateAssessmentWizard levels={levels ?? []} />
      </div>
      {!papers || papers.length === 0 ? (
        <div className="max-w-xl mx-auto mt-12">
          <EmptyState
            icon={<FileText size={48} />}
            title="No Assessments Found"
            description="Create a new assessment to get started."
            action={<CreateAssessmentWizard levels={levels ?? []} />}
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
