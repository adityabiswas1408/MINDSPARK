'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ScoreTrendPoint {
  month: string;
  avgScore: number;
}

export interface ScoreTrendChartProps {
  data: ScoreTrendPoint[];
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
        No score data yet
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--slate-200)',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'DM Sans',
            }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Avg Score']}
          />
          <Line
            type="monotone"
            dataKey="avgScore"
            stroke="var(--clr-green-800)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--clr-green-800)', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--clr-green-800)', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
