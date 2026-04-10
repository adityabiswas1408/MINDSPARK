import { DashboardHeroSkeleton, ExamCardSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* ── LEFT COLUMN ── */}
      <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <DashboardHeroSkeleton />

        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <ExamCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Profile card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse mb-3" />
          <div className="h-4 w-36 rounded bg-slate-200 animate-pulse mb-4" />
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-8 rounded bg-slate-200 animate-pulse" />
            </div>
            <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
              <div className="h-full w-2/5 rounded-full bg-slate-300 animate-pulse" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <div className="h-5 w-8 rounded bg-slate-200 animate-pulse mx-auto mb-1" />
                <div className="h-2.5 w-10 rounded bg-slate-200 animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Skill metrics card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div className="h-4 w-28 rounded bg-slate-200 animate-pulse mb-4" />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-8 rounded bg-slate-200 animate-pulse" />
              </div>
              <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div className="h-full w-3/4 rounded-full bg-slate-300 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
