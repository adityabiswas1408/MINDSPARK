import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { SparklineChart } from './sparkline-chart';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  sparklineData?: number[];
}

export function KPICard({ title, value, icon, trend, trendValue, description, sparklineData }: KPICardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-card shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-secondary">{title}</CardTitle>
        {icon && <div className="text-slate-400 h-4 w-4" aria-hidden="true">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          {/* Forced inline typography — shadcn Card cascade otherwise
              collapses child text-3xl to text-sm. Spec mono-kpi: 36px 700
              DM Mono tabular, --text-primary. */}
          <div
            className="font-mono tabular-nums"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              letterSpacing: 0,
            }}
          >
            {value}
          </div>

          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full font-mono tabular-nums border",
                trend === 'up' && "bg-green-50 text-green-800 border-green-200",
                trend === 'down' && "bg-red-50 text-red-700 border-red-200",
                trend === 'neutral' && "bg-slate-50 text-secondary border-slate-200"
              )}
            >
              {trend === 'up' && <ArrowUpRight className="mr-1 h-3 w-3" strokeWidth={2.5} />}
              {trend === 'down' && <ArrowDownRight className="mr-1 h-3 w-3" strokeWidth={2.5} />}
              {trend === 'neutral' && <Minus className="mr-1 h-3 w-3" strokeWidth={2.5} />}
              {trendValue}
            </div>
          )}
        </div>
        {description && (
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        )}
        {sparklineData && sparklineData.length > 1 && (
          <div className="mt-3">
            <SparklineChart data={sparklineData} color="text-green-700" height={36} width={120} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
