import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { EmptyState } from '@/components/shared/empty-state';
import { Activity, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function formatTimeRemaining(openedAt: string | null, durationMinutes: number | null): string {
  if (!openedAt || !durationMinutes) return '';
  const expiresAt = new Date(openedAt).getTime() + durationMinutes * 60 * 1000;
  const remaining = Math.max(0, expiresAt - Date.now());
  const minutes = Math.floor(remaining / 60_000);
  if (minutes <= 0) return 'Expiring soon';
  if (minutes < 60) return `${minutes}m remaining`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m remaining` : `${hours}h remaining`;
}

export default async function AdminMonitorPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();

  const { data: papers } = await supabase
    .from('exam_papers')
    .select('id, title, duration_minutes, opened_at')
    .eq('institution_id', institutionId)
    .eq('status', 'LIVE');

  // Bulk-count active sessions per paper (student_id IS NOT NULL, closed_at IS NULL)
  const paperIds = (papers ?? []).map(p => p.id);
  const countMap: Record<string, number> = {};
  if (paperIds.length > 0) {
    const { data: sessionRows } = await supabase
      .from('assessment_sessions')
      .select('paper_id')
      .in('paper_id', paperIds)
      .not('student_id', 'is', null)
      .is('closed_at', null);
    for (const s of sessionRows ?? []) {
      countMap[s.paper_id] = (countMap[s.paper_id] ?? 0) + 1;
    }
  }

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
          {papers.map(paper => {
            const studentCount = countMap[paper.id] ?? 0;
            const timeLeft = formatTimeRemaining(paper.opened_at, paper.duration_minutes);
            return (
              <div key={paper.id} className="p-4 bg-white rounded-md shadow-sm border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-slate-900 line-clamp-2 flex-1 mr-2">{paper.title}</h3>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {studentCount} student{studentCount !== 1 ? 's' : ''}
                  </span>
                  {timeLeft && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {timeLeft}
                    </span>
                  )}
                </div>
                <Link href={`/admin/monitor/${paper.id}`}>
                  <Button className="w-full bg-green-800 hover:bg-green-700 text-white">
                    Monitor Session
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
