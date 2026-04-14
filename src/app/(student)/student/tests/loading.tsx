import { ExamCardSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div className="h-8 w-32 rounded bg-slate-200 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-slate-200 animate-pulse" />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-slate-200 animate-pulse" />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <ExamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
