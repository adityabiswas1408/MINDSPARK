export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="h-8 w-32 rounded bg-slate-200 animate-pulse mb-2" />
        <div className="h-4 w-80 rounded bg-slate-200 animate-pulse" />
      </div>
      {Array.from({ length: 3 }).map((_, section) => (
        <div
          key={section}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-40 rounded bg-slate-200 animate-pulse mb-2" />
              <div className="h-3 w-64 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-24 rounded bg-slate-200 animate-pulse mb-2" />
                <div className="h-10 w-full rounded bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
