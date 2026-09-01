'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface LevelDistributionPoint {
  level: string;
  students: number;
}

export interface LevelDistributionChartProps {
  data: LevelDistributionPoint[];
}

export function LevelDistributionChart({ data }: LevelDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
        No level data yet
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" vertical={false} />
          <XAxis
            dataKey="level"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--slate-200)',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'DM Sans',
            }}
            formatter={(value) => [Number(value), 'Students']}
            cursor={{ fill: 'var(--slate-50)' }}
          />
          <Bar
            dataKey="students"
            fill="var(--clr-green-800)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
