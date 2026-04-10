'use client';

export type SyncStatus = 'synced' | 'offline' | 'syncing' | 'error';

interface SyncIndicatorProps {
  /** Current sync status */
  status: SyncStatus;
}

const STATUS_CONFIG: Record<SyncStatus, { color: string; label: string; pulse?: boolean }> = {
  synced:  { color: '#166534', label: 'Answers synced' },
  syncing: { color: '#1D4ED8', label: 'Syncing…', pulse: true },
  offline: { color: '#854D0E', label: 'Saving locally — will sync when online' },
  error:   { color: '#DC2626', label: 'Sync error — answers saved locally' },
};

/**
 * Sync status indicator dot.
 *
 * Shows green (synced), amber (offline), or red (error).
 * data-status attribute for E2E test assertions.
 */
export function SyncIndicator({ status }: SyncIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      data-testid="sync-indicator"
      data-status={status}
      aria-label={config.label}
      role="status"
      className="inline-flex items-center gap-1.5"
    >
      <span
        className={`block rounded-full${config.pulse ? ' animate-pulse' : ''}`}
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: config.color,
        }}
      />
      <span className="sr-only">{config.label}</span>
    </div>
  );
}
