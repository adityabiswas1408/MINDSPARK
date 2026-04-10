import { TableRowSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-36 rounded bg-slate-200 animate-pulse" />
        <div className="h-9 w-36 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="border rounded-md bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {['w-24', 'w-32', 'w-16'].map((w, i) => (
                <th key={i} className="p-4 text-left">
                  <div className={`h-4 ${w} rounded bg-slate-200 animate-pulse`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
