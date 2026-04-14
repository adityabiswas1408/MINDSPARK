export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        gap: '24px',
      }}
    >
      <div className="h-6 w-40 rounded-full bg-slate-200 animate-pulse" />
      <div className="h-24 w-80 rounded bg-slate-200 animate-pulse" />
      <div className="h-5 w-56 rounded bg-slate-200 animate-pulse" />
    </div>
  );
}
