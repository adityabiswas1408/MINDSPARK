import { KpiCardSkeleton, TableRowSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-slate-200 animate-pulse" />
        <div className="h-8 w-64 rounded bg-slate-200 animate-pulse" />
        <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="border rounded-md bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {['w-24', 'w-32', 'w-20', 'w-24', 'w-16'].map((w, i) => (
                <th key={i} className="p-4 text-left">
                  <div className={`h-4 ${w} rounded bg-slate-200 animate-pulse`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
