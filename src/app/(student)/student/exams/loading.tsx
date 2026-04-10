import { ExamCardSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-28 rounded bg-slate-200 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ExamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
