'use client';

interface PausedOverlayProps {
  /** Whether the flash sequence is currently paused (tab hidden) */
  isPaused: boolean;
}

/**
 * Pause overlay shown when student switches tabs during PHASE_2_FLASH.
 *
 * The engine auto-resumes when the student returns (no button press needed).
 * This overlay is purely informational — it disappears when isPaused
 * becomes false via the visibility guard.
 */
export function PausedOverlay({ isPaused }: PausedOverlayProps) {
  if (!isPaused) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
      role="alert"
      aria-label="Exam paused — return to this tab to continue"
    >
      <div className="flex flex-col items-center gap-4 text-center px-8">
        {/* Pause icon */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#FEF9C3',
            border: '2px solid #854D0E',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1" fill="#854D0E" />
            <rect x="14" y="4" width="4" height="16" rx="1" fill="#854D0E" />
          </svg>
        </div>

        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-sans)', color: '#0F172A' }}
        >
          Exam Paused
        </h2>
        <p
          className="text-sm max-w-xs"
          style={{ color: '#475569' }}
        >
          You switched away from this tab. The flash sequence will resume automatically when you return.
        </p>
      </div>
    </div>
  );
}
