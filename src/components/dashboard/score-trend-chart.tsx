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
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#475569', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#475569', fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'DM Sans',
            }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Avg Score']}
          />
          <Line
            type="monotone"
            dataKey="avgScore"
            stroke="#1A3829"
            strokeWidth={2}
            dot={{ r: 3, fill: '#1A3829', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#1A3829', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
