import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { LiveExamCard } from '@/components/student/live-exam-card';
import { ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function StudentExamsPage() {
  const authResult = await requireRole('student');
  if ('error' in authResult) return null;
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  // Fetch student's level
  const { data: student } = await supabase
    .from('students')
    .select('level_id')
    .eq('id', userId)
    .single();

  const levelId = student?.level_id ?? null;

  // Fetch vertical EXAM-type papers for this student's institution +
  // level. Flash Anzan TEST papers live on /student/tests (separate page).
  let query = supabase
    .from('exam_papers')
    .select('id, title, type, duration_minutes, status, opened_at, closed_at, created_at')
    .eq('institution_id', institutionId)
    .eq('type', 'EXAM')
    .in('status', ['LIVE', 'PUBLISHED', 'CLOSED']);

  if (levelId) query = query.eq('level_id', levelId);

  const { data: exams } = await query;

  const liveExams    = (exams ?? []).filter(e => e.status === 'LIVE');
  const upcoming     = (exams ?? [])
    .filter(e => e.status === 'PUBLISHED')
    .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime());
  const completed    = (exams ?? [])
    .filter(e => e.status === 'CLOSED')
    .sort((a, b) => new Date(b.closed_at ?? b.created_at as string).getTime() - new Date(a.closed_at ?? a.created_at as string).getTime());

  const hasAny = liveExams.length + upcoming.length + completed.length > 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-green-800">Exams</h1>

      {/* ── EMPTY STATE ── */}
      {!hasAny && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#F1F5F9',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <BookOpen size={24} style={{ color: '#94A3B8' }} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', margin: '0 0 6px 0' }}>
            No exams scheduled yet
          </p>
          <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
            Your exams will appear here when they&apos;re published.
          </p>
        </div>
      )}

      {/* ── LIVE NOW ── */}
      {liveExams.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#EF4444',
              letterSpacing: '0.06em',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}
          >
            Live Now
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {liveExams.map((exam) => (
              <LiveExamCard key={exam.id} exam={exam as Parameters<typeof LiveExamCard>[0]['exam']} />
            ))}
          </div>
        </section>
      )}

      {/* ── UPCOMING ── */}
      {upcoming.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#475569',
              letterSpacing: '0.06em',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}
          >
            Upcoming
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcoming.map((exam) => {
              const date  = new Date(exam.created_at as string);
              const month = date.toLocaleString('en', { month: 'short' }).toUpperCase();
              const day   = date.getDate();
              return (
                <div
                  key={exam.id}
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
                  {/* Date badge */}
                  <div
                    style={{
                      width: '44px',
                      flexShrink: 0,
                      textAlign: 'center',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '8px',
                      padding: '6px 4px',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#1A3829', letterSpacing: '0.05em' }}>
                      {month}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', lineHeight: 1.1 }}>
                      {day}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginBottom: '3px' }}>
                      {exam.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {exam.type}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {exam.duration_minutes} min
                      </span>
                    </div>
                  </div>

                  {/* Not live yet label */}
                  <span style={{ fontSize: '12px', color: '#94A3B8', flexShrink: 0 }}>
                    Not live yet
                  </span>

                  <ChevronRight size={16} style={{ color: '#CBD5E1', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── COMPLETED ── */}
      {completed.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#475569',
              letterSpacing: '0.06em',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}
          >
            Completed
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {completed.map((exam) => (
              <div
                key={exam.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  opacity: 0.7,
                }}
              >
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginBottom: '3px' }}>
                    {exam.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Completed
                    </span>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {exam.type} · {exam.duration_minutes} min
                    </span>
                  </div>
                </div>

                {/* View results link */}
                <Link
                  href="/student/results"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#1A3829',
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  View Results
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
