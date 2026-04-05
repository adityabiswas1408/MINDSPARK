import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { EmptyState } from '@/components/shared/empty-state';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminMonitorPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();
  const { data: papers } = await supabase
    .from('exam_papers')
    .select('*')
    .eq('institution_id', institutionId)
    .eq('status', 'LIVE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Live Monitor</h1>
      </div>
      {!papers || papers.length === 0 ? (
        <div className="max-w-xl mx-auto mt-12">
          <EmptyState 
            icon={<Activity size={48} />}
            title="No Live Assessments"
            description="Start an assessment to monitor students in real-time."
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <div key={paper.id} className="p-4 bg-white rounded-md shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-medium text-primary line-clamp-2">{paper.title}</h3>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                  LIVE
                </span>
              </div>
              <Link href={`/admin/monitor/${paper.id}`}>
                <Button className="w-full bg-[#1A3829] hover:bg-[#1A3829]/90 text-white">
                  Monitor Session
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
