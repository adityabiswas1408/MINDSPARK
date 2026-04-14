export default function Loading() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div className="h-8 w-48 rounded bg-slate-200 animate-pulse mb-2" />
        <div className="h-4 w-80 rounded bg-slate-200 animate-pulse" />
      </div>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div className="h-5 w-40 rounded bg-slate-200 animate-pulse mb-4" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-slate-200 animate-pulse" />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <div className="h-11 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="h-11 w-32 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
