export default function Loading() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '32px',
        }}
      >
        <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse mb-4" />
        <div className="h-8 w-96 rounded bg-slate-200 animate-pulse mb-3" />
        <div className="h-4 w-full rounded bg-slate-200 animate-pulse mb-2" />
        <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse mb-6" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse mb-2" />
              <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-12 w-full rounded-lg bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
