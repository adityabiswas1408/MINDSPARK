export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 rounded bg-slate-200 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-10 w-40 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4"
          >
            <div className="h-6 w-6 rounded bg-slate-200 animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-40 rounded bg-slate-200 animate-pulse mb-2" />
              <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded bg-slate-200 animate-pulse" />
            <div className="h-8 w-8 rounded bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
