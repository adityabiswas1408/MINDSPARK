'use client';

interface ExamNetworkBannerProps {
  /** Whether the browser is currently offline */
  isOffline: boolean;
}

/**
 * Offline warning banner for the assessment engine.
 *
 * Rules from E2E-03:
 *   - Must contain "saving" text when offline
 *   - Must NOT contain error codes (no "Error", no "503")
 *   - Uses warning palette: #FEF9C3 bg / #854D0E text
 */
export function ExamNetworkBanner({ isOffline }: ExamNetworkBannerProps) {
  if (!isOffline) return null;

  return (
    <div
      data-testid="network-banner"
      role="alert"
      className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center px-4 py-2 text-sm font-medium"
      style={{
        backgroundColor: '#FEF9C3',
        color: '#854D0E',
        borderBottom: '1px solid #854D0E',
      }}
    >
      <svg
        className="mr-2 shrink-0"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" stroke="#854D0E" strokeWidth="1.5" />
        <path d="M8 4.5V9" stroke="#854D0E" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="#854D0E" />
      </svg>
      You are offline — your answers are saving locally and will sync when reconnected.
    </div>
  );
}
