import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { ResultsGpaChart } from '@/components/student/results-client';
import { Inbox } from 'lucide-react';

function gradeBadge(grade: string | null): { bg: string; text: string } {
  switch (grade) {
    case 'A+': return { bg: '#DCFCE7', text: '#166534' };
    case 'A':  return { bg: '#DCFCE7', text: '#15803D' };
    case 'B':  return { bg: '#DBEAFE', text: '#1D4ED8' };
    case 'C':  return { bg: '#FEF9C3', text: '#854D0E' };
    case 'F':  return { bg: '#FEE2E2', text: '#DC2626' };
    default:   return { bg: '#F1F5F9', text: '#475569' };
  }
}

export default async function StudentResultsPage() {
  const authResult = await requireRole('student');
  if ('error' in authResult) return null;
  const { userId } = authResult;

  const supabase = await createClient();

  // All completed submissions for this student
  const { data: rawSubmissions } = await supabase
    .from('submissions')
    .select('id, score, percentage, grade, dpm, result_published_at, completed_at, paper_id')
    .eq('student_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  const submissions = rawSubmissions ?? [];

  // Fetch exam papers for all paper_ids in one query
  const paperIds = [...new Set(
    submissions.map((s: { paper_id: string | null }) => s.paper_id).filter(Boolean)
  )] as string[];

  const { data: papers } = paperIds.length > 0
    ? await supabase
        .from('exam_papers')
        .select('id, title, type, duration_minutes')
        .in('id', paperIds)
    : { data: [] };

  const paperMap = new Map((papers ?? []).map((p: { id: string; title: string; type: string; duration_minutes: number | null }) => [p.id, p]));

  type Submission = {
    id: string;
    score: number;
    percentage: number | null;
    grade: string | null;
    dpm: number | null;
    result_published_at: string | null;
    completed_at: string | null;
    paper_id: string | null;
    paper?: { id: string; title: string; type: string; duration_minutes: number | null };
  };

  const enriched: Submission[] = submissions.map((s: Omit<Submission, 'paper'>) => ({
    ...s,
    paper: s.paper_id ? paperMap.get(s.paper_id) : undefined,
  }));

  const published = enriched.filter(s => s.result_published_at !== null);
  const pending   = enriched.filter(s => s.result_published_at === null);

  const latestResult = published[0] ?? null;

  // Chart: chronological order, need ≥2 points
  const chartData = published.length >= 2
    ? [...published].reverse().map(s => ({
        date: new Date(s.result_published_at!).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        score: Math.round(Number(s.percentage ?? 0)),
      }))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>My Results</h1>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          Export Report ↓
        </button>
      </div>

      {published.length === 0 ? (
        /* ── Empty state ── */
        <div
          className="text-center"
          style={{
            padding: '56px 24px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--color-slate-200)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <Inbox
              size={36}
              strokeWidth={1.5}
              aria-hidden="true"
              style={{ color: 'var(--text-subtle)' }}
            />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            No results published yet
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Check back after your exam is graded
          </p>
        </div>
      ) : (
        <>
          {/* ── Hero card: latest published result ── */}
          {latestResult && (() => {
            const pct = Math.round(Number(latestResult.percentage ?? 0));
            return (
              <div
                className="flex items-center justify-between flex-wrap bg-white"
                style={{
                  border: '2px solid var(--clr-green-800)',
                  borderRadius: 'var(--radius-card)',
                  padding: '28px 32px',
                  gap: '24px',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{ flex: '1 1 200px' }}>
                  <p
                    className="uppercase"
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--clr-green-600)',
                      letterSpacing: '0.08em',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Latest Result
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                    {latestResult.paper?.title ?? 'Exam'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Published{' '}
                    {new Date(latestResult.result_published_at!).toLocaleDateString('en', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center shrink-0" style={{ gap: '20px' }}>
                  {/* Score */}
                  <div className="text-center">
                    <div
                      className="font-mono tabular-nums"
                      style={{
                        fontFamily: 'var(--font-mono), monospace',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: '52px',
                        fontWeight: 700,
                        color: 'var(--clr-green-800)',
                        lineHeight: 1,
                      }}
                    >
                      {pct}
                      <span style={{ fontSize: '22px', color: 'var(--clr-green-600)' }}>%</span>
                    </div>
                    <p
                      className="uppercase"
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--text-subtle)',
                        letterSpacing: '0.08em',
                        margin: '6px 0 0 0',
                      }}
                    >
                      Score
                    </p>
                  </div>

                  {/* Grade */}
                  {latestResult.grade && (
                    <div
                      className="text-center"
                      style={{
                        backgroundColor: 'var(--clr-green-50)',
                        border: '1px solid var(--clr-green-200)',
                        borderRadius: 'var(--radius-btn)',
                        padding: '14px 22px',
                      }}
                    >
                      <div
                        className="font-mono tabular-nums"
                        style={{
                          fontFamily: 'var(--font-mono), monospace',
                          fontSize: '36px',
                          fontWeight: 700,
                          color: 'var(--clr-green-800)',
                          lineHeight: 1,
                        }}
                      >
                        {latestResult.grade}
                      </div>
                      <p
                        className="uppercase"
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--clr-green-700)',
                          letterSpacing: '0.08em',
                          margin: '4px 0 0 0',
                        }}
                      >
                        Grade
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Score Trend chart (only if 2+ results) ── */}
          {chartData.length >= 2 && <ResultsGpaChart data={chartData} />}

          {/* ── Pending Evaluation ── */}
          {pending.length > 0 && (
            <section>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>
                Pending Evaluation
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pending.map(s => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', margin: '0 0 2px 0' }}>
                        {s.paper?.title ?? 'Exam'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                        Submitted{' '}
                        {s.completed_at
                          ? new Date(s.completed_at).toLocaleDateString('en', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '3px 10px',
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        fontSize: '11px',
                        fontWeight: '700',
                        borderRadius: '20px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      PENDING
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Academic Ledger ── */}
          <section>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>
              Academic Ledger
            </h2>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                      {['Exam', 'Date', 'Type', 'Duration', 'Score', 'DPM', 'Grade'].map(h => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 16px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#475569',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {published.map((s, i) => {
                      const { bg, text } = gradeBadge(s.grade);
                      const isTest = s.paper?.type === 'TEST';
                      return (
                        <tr
                          key={s.id}
                          style={{
                            borderBottom: i < published.length - 1 ? '1px solid #F1F5F9' : 'none',
                          }}
                        >
                          <td
                            style={{
                              padding: '12px 16px',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#0F172A',
                            }}
                          >
                            {s.paper?.title ?? '—'}
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              fontSize: '13px',
                              color: '#475569',
                              fontFamily: 'var(--font-mono, monospace)',
                              fontVariantNumeric: 'tabular-nums',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {s.result_published_at
                              ? new Date(s.result_published_at).toLocaleDateString('en', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                backgroundColor: isTest ? '#EDE9FE' : '#DBEAFE',
                                color: isTest ? '#7C3AED' : '#1D4ED8',
                                fontSize: '11px',
                                fontWeight: '700',
                                borderRadius: '20px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {s.paper?.type ?? '—'}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              fontSize: '13px',
                              color: '#475569',
                              fontFamily: 'var(--font-mono, monospace)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {s.paper?.duration_minutes ? `${s.paper.duration_minutes} min` : '—'}
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#0F172A',
                              fontFamily: 'var(--font-mono, monospace)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {Math.round(Number(s.percentage ?? 0))}%
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              fontSize: '13px',
                              color: '#475569',
                              fontFamily: 'var(--font-mono, monospace)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {isTest && s.dpm !== null ? Number(s.dpm).toFixed(1) : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {s.grade ? (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  backgroundColor: bg,
                                  color: text,
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  borderRadius: '20px',
                                }}
                              >
                                {s.grade}
                              </span>
                            ) : (
                              <span style={{ color: '#CBD5E1', fontSize: '13px' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
