'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScoreTrendPoint } from './score-trend-chart';
import type { LevelDistributionPoint } from './level-distribution-chart';

const ScoreTrendChart = dynamic(
  () => import('./score-trend-chart').then((m) => m.ScoreTrendChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-slate-100" /> }
);

const LevelDistributionChart = dynamic(
  () => import('./level-distribution-chart').then((m) => m.LevelDistributionChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-slate-100" /> }
);

export interface DashboardChartsProps {
  scoreTrend: ScoreTrendPoint[];
  levelDist: LevelDistributionPoint[];
}

export function DashboardCharts({ scoreTrend, levelDist }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Score Trend (6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreTrendChart data={scoreTrend} />
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Students by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <LevelDistributionChart data={levelDist} />
        </CardContent>
      </Card>
    </div>
  );
}
