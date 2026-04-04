import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboardPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();

  // Direct count queries — dashboard_aggregates view is not available
  const [studentsRes, assessmentsRes, liveRes, submissionsRes] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
    supabase.from('exam_papers').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId),
    supabase.from('exam_papers').select('id', { count: 'exact', head: true }).eq('institution_id', institutionId).eq('status', 'LIVE'),
    supabase.from('submissions').select('id', { count: 'exact', head: true }),
  ]);

  const totalStudents = studentsRes.count ?? 0;
  const totalAssessments = assessmentsRes.count ?? 0;
  const liveExams = liveRes.count ?? 0;
  const totalSubmissions = submissionsRes.count ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalAssessments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Live Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{liveExams}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalSubmissions}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
