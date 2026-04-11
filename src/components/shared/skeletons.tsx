// Skeleton loader components — use the spec-compliant `.skeleton`
// linear-gradient shimmer class from globals.css §5. All containers
// have aria-busy="true" per 08_a11y §2.3.

// ─── KpiCardSkeleton ────────────────────────────────────────────
export function KpiCardSkeleton() {
  return (
    <div
      className="rounded-lg border bg-white p-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="pb-2">
        <div className="skeleton h-4 w-1/2" />
      </div>
      <div className="skeleton h-8 w-1/3 mt-1" />
    </div>
  );
}

// ─── TableRowSkeleton ───────────────────────────────────────────
export function TableRowSkeleton() {
  return (
    <tr aria-busy="true">
      <td className="p-4">
        <div className="skeleton h-4 w-24" />
      </td>
      <td className="p-4">
        <div className="skeleton h-4 w-36" />
      </td>
      <td className="p-4">
        <div className="skeleton h-5 w-16 rounded-full" />
      </td>
    </tr>
  );
}

// ─── AssessmentCardSkeleton ─────────────────────────────────────
export function AssessmentCardSkeleton() {
  return (
    <div
      className="flex items-center justify-between bg-card"
      aria-busy="true"
      style={{
        padding: '14px 16px',
        border: '1px solid var(--color-slate-200)',
        borderRadius: 'var(--radius-btn)',
      }}
    >
      <div className="flex flex-col" style={{ gap: '6px' }}>
        <div className="skeleton h-5 w-48" />
        <div className="flex" style={{ gap: '6px' }}>
          <div className="skeleton h-4 w-14" />
          <div className="skeleton h-4 w-14" />
        </div>
      </div>
      <div className="flex" style={{ gap: '8px' }}>
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-8 w-8" />
      </div>
    </div>
  );
}

// ─── DashboardHeroSkeleton ──────────────────────────────────────
// Mirrors the NEW LiveExamCard — white card with 2px green border
// per 07_hifi-spec §6. Previously rendered dark #1A3829 (spec inverted).
export function DashboardHeroSkeleton() {
  return (
    <div
      className="relative overflow-hidden bg-white"
      aria-busy="true"
      aria-live="polite"
      style={{
        border: '2px solid var(--clr-green-800)',
        borderRadius: 'var(--radius-card)',
        padding: '28px 24px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Top row: LIVE badge shape + countdown shape */}
      <div className="flex items-start justify-between mb-5">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="flex flex-col items-end" style={{ gap: '4px' }}>
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-7 w-28" />
        </div>
      </div>

      {/* Exam title + type line */}
      <div className="mb-2">
        <div className="skeleton h-7 w-2/3 mb-2" />
        <div className="skeleton h-4 w-1/3" />
      </div>

      {/* Enter button shape */}
      <div className="skeleton h-10 w-48 rounded-lg mt-5" />
    </div>
  );
}

// ─── ExamCardSkeleton ───────────────────────────────────────────
export function ExamCardSkeleton() {
  return (
    <div
      className="flex items-center bg-card"
      aria-busy="true"
      style={{
        gap: '16px',
        padding: '14px 16px',
        border: '1px solid var(--color-slate-200)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <div
        className="flex flex-col items-center shrink-0"
        style={{
          width: '44px',
          backgroundColor: 'var(--color-slate-100)',
          borderRadius: 'var(--radius-btn)',
          padding: '6px 4px',
          gap: '4px',
        }}
      >
        <div className="skeleton h-2 w-6" />
        <div className="skeleton h-5 w-6" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '6px' }}>
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/3" />
      </div>

      <div className="skeleton h-4 w-4 shrink-0" />
    </div>
  );
}

// ─── ResultsRowSkeleton ─────────────────────────────────────────
export function ResultsRowSkeleton() {
  return (
    <div
      className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0"
      aria-busy="true"
    >
      <div className="flex flex-col gap-1.5">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-3 w-28" />
      </div>
      <div className="skeleton h-4 w-4" />
    </div>
  );
}
