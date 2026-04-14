import { AssessmentCardSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 rounded bg-slate-200 animate-pulse mb-2" />
          <div className="h-4 w-72 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <AssessmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
