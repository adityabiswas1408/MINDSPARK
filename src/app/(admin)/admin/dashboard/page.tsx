import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/kpi-card';
import { LivePulse } from '@/components/dashboard/live-pulse';
import { RecentActivityFeed, type ActivityItem } from '@/components/dashboard/recent-activity-feed';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import type { ScoreTrendPoint } from '@/components/dashboard/score-trend-chart';
import type { LevelDistributionPoint } from '@/components/dashboard/level-distribution-chart';
import { Users, BookOpen, TrendingUp, Radio } from 'lucide-react';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

import { unstable_cache } from 'next/cache';
import { adminSupabase } from '@/lib/supabase/admin';

const getCachedDashboardData = (institutionId: string) => unstable_cache(
  async () => {
    const [metricsRes, activityRes, livePulseRes] = await Promise.all([
      adminSupabase.rpc('get_dashboard_metrics', { p_institution_id: institutionId }),
      
      // Recent activity — last 10 rows
      adminSupabase
        .from('activity_logs')
        .select('id, action_type, entity_type, timestamp')
        .eq('institution_id', institutionId)
        .order('timestamp', { ascending: false })
        .limit(10),

      // Live Pulse widget: first LIVE exam paper with its active session count
      adminSupabase
        .from('exam_papers')
        .select('id, title, assessment_sessions(id)')
        .eq('institution_id', institutionId)
        .eq('status', 'LIVE')
        .order('opened_at', { ascending: false })
        .limit(1),
    ]);
    return { metricsRes, activityRes, livePulseRes };
  },
  ['dashboard-data-v1', institutionId],
  { revalidate: 300 }
)();

export default async function AdminDashboardPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const { metricsRes, activityRes, livePulseRes } = await getCachedDashboardData(institutionId);

  const metrics = (metricsRes.data as any) || {
    totalStudents: 0,
    activeExams: 0,
    liveSessions: 0,
    avgScore: 0,
    studentSparkline: [],
    examSparkline: [],
    scoreSparkline: [],
    sessionSparkline: [],
    scoreTrend: [],
    levelDist: []
  };

  const {
    totalStudents,
    activeExams,
    liveSessions,
    avgScore,
    studentSparkline,
    examSparkline,
    scoreSparkline,
    sessionSparkline,
    scoreTrend,
    levelDist,
  } = metrics;

  // ── Recent activity ───────────────────────────────────────────────────────────
  const activities: ActivityItem[] = (activityRes.data ?? []).map((row) => ({
    id: row.id as string,
    action_type: row.action_type as string,
    entity_type: row.entity_type as string,
    timestamp: row.timestamp as string,
  }));

  // ── Live Pulse widget data ─────────────────────────────────────────────────
  const livePulsePaper = (livePulseRes.data ?? [])[0];
  const livePulseCount = livePulsePaper?.assessment_sessions
    ? (Array.isArray(livePulsePaper.assessment_sessions)
        ? livePulsePaper.assessment_sessions.length
        : 0)
    : 0;
  const showLivePulse = livePulsePaper && livePulseCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
        {showLivePulse && livePulsePaper && (
          <div className="sm:w-[280px]">
            <LivePulse
              paperId={livePulsePaper.id as string}
              examTitle={livePulsePaper.title as string}
              studentCount={livePulseCount}
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Students"
          value={totalStudents}
          icon={<Users className="h-4 w-4" />}
          description="Enrolled in your institution"
          sparklineData={studentSparkline}
        />
        <KPICard
          title="Active Exams"
          value={activeExams}
          icon={<BookOpen className="h-4 w-4" />}
          description="Currently LIVE"
          sparklineData={examSparkline}
        />
        <KPICard
          title="Avg Score"
          value={`${avgScore}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Across all completed submissions"
          sparklineData={scoreSparkline}
        />
        <KPICard
          title="Live Now"
          value={liveSessions}
          icon={<Radio className="h-4 w-4" />}
          description="Active exam sessions"
          sparklineData={sessionSparkline}
        />
      </div>

      {/* Charts — client component wrapper required for ssr:false */}
      <DashboardCharts scoreTrend={scoreTrend} levelDist={levelDist} />

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-[18px] font-semibold text-primary">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityFeed activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
}
