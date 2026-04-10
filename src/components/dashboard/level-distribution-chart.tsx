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
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="level"
            tick={{ fontSize: 12, fill: '#475569', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#475569', fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'DM Sans',
            }}
            formatter={(value) => [Number(value), 'Students']}
            cursor={{ fill: '#F8FAFC' }}
          />
          <Bar
            dataKey="students"
            fill="#1A3829"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
