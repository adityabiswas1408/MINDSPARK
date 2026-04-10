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

interface ChartPoint {
  date: string;
  score: number;
}

export function ResultsGpaChart({ data }: { data: ChartPoint[] }) {
  return (
    <section>
      <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>
        Score Trend
      </h2>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px 20px 12px 4px',
        }}
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'var(--font-mono, monospace)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'var(--font-mono, monospace)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
              formatter={(value) => [`${value}%`, 'Score']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#1A3829"
              strokeWidth={2.5}
              dot={{ fill: '#1A3829', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#1A3829' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
