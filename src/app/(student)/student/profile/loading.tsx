export default function Loading() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div className="h-8 w-32 rounded bg-slate-200 animate-pulse mb-2" />
        <div className="h-4 w-64 rounded bg-slate-200 animate-pulse" />
      </div>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div className="h-20 w-20 rounded-full bg-slate-200 animate-pulse" />
          <div style={{ flex: 1 }}>
            <div className="h-6 w-48 rounded bg-slate-200 animate-pulse mb-2" />
            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 rounded bg-slate-200 animate-pulse mb-2" />
              <div className="h-5 w-64 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
