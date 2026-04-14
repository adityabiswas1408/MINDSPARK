import { KpiCardSkeleton, AssessmentCardSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 rounded bg-slate-200 animate-pulse mb-2" />
        <div className="h-4 w-80 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-9 w-24 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-9 w-24 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-9 w-24 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <AssessmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
