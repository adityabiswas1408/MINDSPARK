import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/kpi-card';
import { RecentActivityFeed, type ActivityItem } from '@/components/dashboard/recent-activity-feed';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import type { ScoreTrendPoint } from '@/components/dashboard/score-trend-chart';
import type { LevelDistributionPoint } from '@/components/dashboard/level-distribution-chart';
import { Users, BookOpen, TrendingUp, Radio } from 'lucide-react';

// Bucket an array of ISO timestamp strings into daily counts for the last N days
function bucketByDay(timestamps: string[], days: number): number[] {
  const now = new Date();
  const buckets = Array(days).fill(0);
  for (const ts of timestamps) {
    const diffMs = now.getTime() - new Date(ts).getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays >= 0 && diffDays < days) {
      buckets[days - 1 - diffDays]++;
    }
  }
  return buckets;
}

// Bucket rows into daily averages for the last N days
function bucketAvgByDay(rows: { ts: string; value: number }[], days: number): number[] {
  const now = new Date();
  const sums   = Array(days).fill(0);
  const counts = Array(days).fill(0);
  for (const { ts, value } of rows) {
    const diffDays = Math.floor((now.getTime() - new Date(ts).getTime()) / 86_400_000);
    if (diffDays >= 0 && diffDays < days) {
      sums[days - 1 - diffDays]   += value;
      counts[days - 1 - diffDays] += 1;
    }
  }
  return sums.map((sum, i) => counts[i] > 0 ? Number((sum / counts[i]).toFixed(1)) : 0);
}

// Format a UTC date to short month label e.g. "Jan"
function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleString('default', { month: 'short' });
}

export default async function AdminDashboardPage() {
  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const sixMonthsAgo = new Date(Date.now() - 183 * 86_400_000).toISOString();

  const [
    studentsRes,
    activeExamsRes,
    liveSessionsRes,
    avgScoreRes,
    recentStudentsRes,
    recentExamPapersRes,
    recentScoresRes,
    recentSessionsRes,
    scoreTrendRes,
    levelDistRes,
    activityRes,
  ] = await Promise.all([
    // KPI: total students
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('institution_id', institutionId),

    // KPI: active (LIVE) exam papers
    supabase
      .from('exam_papers')
      .select('id', { count: 'exact', head: true })
      .eq('institution_id', institutionId)
      .eq('status', 'LIVE'),

    // KPI: live sessions right now
    supabase
      .from('assessment_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),

    // KPI: avg score across all completed submissions
    supabase
      .from('submissions')
      .select('percentage')
      .not('completed_at', 'is', null),

    // Sparkline: students created in last 7 days
    supabase
      .from('students')
      .select('created_at')
      .eq('institution_id', institutionId)
      .gte('created_at', sevenDaysAgo),

    // Sparkline: exam papers created in last 7 days
    supabase
      .from('exam_papers')
      .select('created_at')
      .eq('institution_id', institutionId)
      .gte('created_at', sevenDaysAgo),

    // Sparkline: daily avg score in last 7 days
    supabase
      .from('submissions')
      .select('percentage, created_at')
      .not('completed_at', 'is', null)
      .gte('created_at', sevenDaysAgo),

    // Sparkline: assessment sessions created in last 7 days
    supabase
      .from('assessment_sessions')
      .select('created_at')
      .gte('created_at', sevenDaysAgo),

    // Score trend: completed submissions last 6 months
    supabase
      .from('submissions')
      .select('percentage, created_at')
      .not('completed_at', 'is', null)
      .gte('created_at', sixMonthsAgo)
      .order('created_at', { ascending: true }),

    // Level distribution
    supabase
      .from('levels')
      .select('id, name, students(id)')
      .eq('institution_id', institutionId)
      .order('sort_order', { ascending: true }),

    // Recent activity — last 10 rows
    supabase
      .from('activity_logs')
      .select('id, action_type, entity_type, timestamp')
      .eq('institution_id', institutionId)
      .order('timestamp', { ascending: false })
      .limit(10),
  ]);

  // ── KPI values ──────────────────────────────────────────────────────────────
  const totalStudents = studentsRes.count ?? 0;
  const activeExams   = activeExamsRes.count ?? 0;
  const liveSessions  = liveSessionsRes.count ?? 0;

  const percentages = (avgScoreRes.data ?? []).map((r) => Number(r.percentage));
  const avgScore = percentages.length > 0
    ? Number((percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1))
    : 0;

  // ── Sparkline data (last 7 days each) ────────────────────────────────────────
  const studentSparkline = bucketByDay(
    (recentStudentsRes.data ?? []).map((r) => r.created_at as string),
    7
  );
  const examSparkline = bucketByDay(
    (recentExamPapersRes.data ?? []).map((r) => r.created_at as string),
    7
  );
  const scoreSparkline = bucketAvgByDay(
    (recentScoresRes.data ?? []).map((r) => ({
      ts: r.created_at as string,
      value: Number(r.percentage),
    })),
    7
  );
  const sessionSparkline = bucketByDay(
    (recentSessionsRes.data ?? []).map((r) => r.created_at as string),
    7
  );

  // ── Score trend (monthly avg, last 6 months) ─────────────────────────────────
  const monthlyMap = new Map<string, number[]>();
  for (const row of (scoreTrendRes.data ?? [])) {
    const label = monthLabel(row.created_at as string);
    if (!monthlyMap.has(label)) monthlyMap.set(label, []);
    monthlyMap.get(label)!.push(Number(row.percentage));
  }
  const scoreTrend: ScoreTrendPoint[] = Array.from(monthlyMap.entries()).map(([month, vals]) => ({
    month,
    avgScore: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)),
  }));

  // ── Level distribution ────────────────────────────────────────────────────────
  const levelDist: LevelDistributionPoint[] = (levelDistRes.data ?? []).map((row) => ({
    level: row.name as string,
    students: Array.isArray(row.students) ? row.students.length : 0,
  }));

  // ── Recent activity ───────────────────────────────────────────────────────────
  const activities: ActivityItem[] = (activityRes.data ?? []).map((row) => ({
    id: row.id as string,
    action_type: row.action_type as string,
    entity_type: row.entity_type as string,
    timestamp: row.timestamp as string,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>

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
          <CardTitle className="text-sm font-medium text-slate-600">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityFeed activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
}
