import { ResultsRowSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-slate-200 animate-pulse" />
        <div className="h-6 w-56 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-slate-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-6 w-48 rounded bg-slate-200 animate-pulse mb-2" />
            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="h-9 w-24 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse mb-2" />
              <div className="h-5 w-28 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-5 w-44 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ResultsRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
