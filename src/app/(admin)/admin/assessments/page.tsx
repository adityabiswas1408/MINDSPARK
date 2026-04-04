import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { EmptyState } from '@/components/shared/empty-state';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminAssessmentsPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();
  const { data: papers } = await supabase.from('exam_papers').select('*').eq('institution_id', institutionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Assessments</h1>
        <Button>Create Assessment</Button>
      </div>
      {!papers || papers.length === 0 ? (
        <div className="max-w-xl mx-auto mt-12">
          <EmptyState 
            icon={<FileText size={48} />}
            title="No Assessments Found"
            description="Create a new assessment to get started."
            action={<Button>Create Assessment</Button>}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {papers.map((paper) => (
            <div key={paper.id} className="p-4 bg-card rounded-md shadow-sm border border-slate-200">
              <span className="font-medium text-primary">{paper.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
