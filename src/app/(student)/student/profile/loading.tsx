export default function StudentProfileLoading() {
  return (
    <main>
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 96,
            height: 22,
            background: 'var(--slate-200)',
            borderRadius: 6,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            width: 320,
            height: 13,
            background: 'var(--slate-100)',
            borderRadius: 4,
          }}
        />
      </header>

      <div className="profile-card">
        <div className="profile-hero">
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 9999,
              background: 'var(--slate-200)',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: 240,
                height: 26,
                background: 'var(--slate-200)',
                borderRadius: 6,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                width: 140,
                height: 14,
                background: 'var(--slate-100)',
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        <div className="profile-section">
          <div
            style={{
              width: 80,
              height: 11,
              background: 'var(--slate-200)',
              borderRadius: 3,
              marginBottom: 16,
            }}
          />
          <div className="field-grid">
            {[0, 1, 2, 3].map((i) => (
              <div className="field-row" key={i}>
                <div
                  style={{
                    width: 80,
                    height: 11,
                    background: 'var(--slate-100)',
                    borderRadius: 3,
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    width: '70%',
                    height: 15,
                    background: 'var(--slate-200)',
                    borderRadius: 4,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="more-info-toggle">
          <span className="label">More Info</span>
          <span
            style={{
              width: 16,
              height: 16,
              background: 'var(--slate-200)',
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </main>
  );
}
