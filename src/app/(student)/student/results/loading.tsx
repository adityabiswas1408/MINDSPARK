import { ResultsRowSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-36 rounded bg-slate-200 animate-pulse" />
      <div className="bg-card rounded-md border border-slate-200 shadow-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <ResultsRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
