import { AssessmentCardSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-44 rounded bg-slate-200 animate-pulse" />
        <div className="h-9 w-40 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <AssessmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
