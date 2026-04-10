// Skeleton loader components — animate-pulse + bg-slate-200 only.
// No external libraries. Each skeleton mirrors its real page's exact layout.

// ─── KpiCardSkeleton ────────────────────────────────────────────
// Matches: admin dashboard Card (CardHeader label + CardContent number)
export function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="pb-2">
        <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="h-8 w-1/3 rounded bg-slate-200 animate-pulse mt-1" />
    </div>
  );
}

// ─── TableRowSkeleton ───────────────────────────────────────────
// Matches: admin students table row (roll number | name | badge)
export function TableRowSkeleton() {
  return (
    <tr>
      <td className="p-4">
        <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
      </td>
      <td className="p-4">
        <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
      </td>
      <td className="p-4">
        <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse" />
      </td>
    </tr>
  );
}

// ─── AssessmentCardSkeleton ─────────────────────────────────────
// Matches: AssessmentCard row (title + type/status badges + action buttons)
// Reproduces exact inline styles from assessment-card.tsx shell
export function AssessmentCardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="h-5 w-48 rounded bg-slate-200 animate-pulse" />
        <div style={{ display: 'flex', gap: '6px' }}>
          <div className="h-4 w-14 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-14 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="h-8 w-20 rounded bg-slate-200 animate-pulse" />
        <div className="h-8 w-8 rounded bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

// ─── DashboardHeroSkeleton ──────────────────────────────────────
// Matches: LiveExamCard — dark #1A3829 background.
// Uses bg-slate-600 for skeleton elements (not bg-slate-200) to avoid
// a jarring white flash where a dark card will appear.
export function DashboardHeroSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        backgroundColor: '#1A3829',
        borderRadius: '16px',
        padding: '28px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row: LIVE badge shape + countdown shape */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        <div className="h-6 w-20 rounded-full bg-slate-600" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <div className="h-3 w-16 rounded bg-slate-600" />
          <div className="h-7 w-28 rounded bg-slate-600" />
        </div>
      </div>

      {/* Exam title + type line */}
      <div style={{ marginBottom: '8px' }}>
        <div className="h-7 w-2/3 rounded bg-slate-600 mb-2" />
        <div className="h-4 w-1/3 rounded bg-slate-600" />
      </div>

      {/* Enter button shape */}
      <div className="h-10 w-48 rounded-lg bg-slate-600 mt-5" />
    </div>
  );
}

// ─── ExamCardSkeleton ───────────────────────────────────────────
// Matches: upcoming exam row in student dashboard + exams list
// Reproduces exact inline styles from the exam row in student dashboard
export function ExamCardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 16px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
      }}
    >
      {/* Date badge shape */}
      <div
        style={{
          width: '44px',
          flexShrink: 0,
          backgroundColor: '#F1F5F9',
          borderRadius: '8px',
          padding: '6px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div className="h-2 w-6 rounded bg-slate-200 animate-pulse" />
        <div className="h-5 w-6 rounded bg-slate-200 animate-pulse" />
      </div>

      {/* Title + type line */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-slate-200 animate-pulse" />
      </div>

      {/* Chevron shape */}
      <div className="h-4 w-4 flex-shrink-0 rounded bg-slate-200 animate-pulse" />
    </div>
  );
}

// ─── ResultsRowSkeleton ─────────────────────────────────────────
// Matches: student results row (title + pending status + lock icon)
export function ResultsRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0">
      <div className="flex flex-col gap-1.5">
        <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
    </div>
  );
}
