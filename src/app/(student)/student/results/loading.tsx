export default function Loading() {
  return (
    <main className="results-page-shell">
      <header className="page-header">
        <div
          style={{
            width: '180px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--slate-100)',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            width: '90px',
            height: '14px',
            borderRadius: '4px',
            background: 'var(--slate-100)',
          }}
        />
      </header>

      {/* Hero card skeleton */}
      <div
        style={{
          height: '128px',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--slate-200)',
          background: 'var(--bg-card)',
          marginBottom: '24px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              width: '90px',
              height: '12px',
              background: 'var(--slate-100)',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          />
          <div
            style={{
              width: '70%',
              maxWidth: '320px',
              height: '20px',
              background: 'var(--slate-100)',
              borderRadius: '4px',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              width: '140px',
              height: '12px',
              background: 'var(--slate-100)',
              borderRadius: '4px',
            }}
          />
        </div>
        <div
          style={{
            width: '120px',
            height: '60px',
            background: 'var(--slate-100)',
            borderRadius: '6px',
          }}
        />
      </div>

      {/* Chip-row skeleton (5 pills) */}
      <div className="chip-row" style={{ marginBottom: '20px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === 4 ? '110px' : '70px',
              height: '32px',
              background: 'var(--slate-100)',
              borderRadius: 'var(--radius-btn)',
            }}
          />
        ))}
      </div>

      {/* Ledger skeleton — 5 rows */}
      <div className="ledger">
        <div className="ledger-wrap">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Date</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Score</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} style={{ padding: '14px 16px' }}>
                    <div
                      style={{
                        height: '14px',
                        background: 'var(--slate-100)',
                        borderRadius: '4px',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
