export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        <div className="h-8 w-64 rounded bg-slate-200 animate-pulse" />
        <div
          style={{
            width: '132px',
            height: '132px',
            borderRadius: '9999px',
            backgroundColor: '#E2E8F0',
          }}
          className="animate-pulse"
        />
        <div className="h-10 w-40 rounded bg-slate-200 animate-pulse" />
        <div className="h-5 w-72 rounded bg-slate-200 animate-pulse" />
        <div className="h-5 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="h-14 w-full rounded-lg bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
