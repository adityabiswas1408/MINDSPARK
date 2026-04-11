import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { LiveExamCard, NoLiveExamCard } from '@/components/student/live-exam-card';

export default async function StudentDashboardPage() {
  const authResult = await requireRole('student');
  if ('error' in authResult) return null;
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  // Fetch student with level name
  const { data: student } = await supabase
    .from('students')
    .select('full_name, roll_number, level_id')
    .eq('id', userId)
    .single();

  const levelId = student?.level_id ?? null;

  // Fetch level name
  const { data: level } = levelId
    ? await supabase.from('levels').select('name').eq('id', levelId).single()
    : { data: null };

  // Fetch LIVE exam for this student's level + institution
  const liveQuery = supabase
    .from('exam_papers')
    .select('id, title, type, duration_minutes, opened_at')
    .eq('status', 'LIVE')
    .eq('institution_id', institutionId);
  if (levelId) liveQuery.eq('level_id', levelId);
  const { data: liveExams } = await liveQuery.limit(1);
  const liveExam = liveExams?.[0] ?? null;

  // Fetch PUBLISHED (upcoming) exams
  const upcomingQuery = supabase
    .from('exam_papers')
    .select('id, title, type, duration_minutes, created_at')
    .eq('status', 'PUBLISHED')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });
  if (levelId) upcomingQuery.eq('level_id', levelId);
  const { data: upcomingExams } = await upcomingQuery.limit(5);

  const rollNumber = student?.roll_number ?? '—';
  const levelName = level?.name ?? 'Level 1';

  return (
    <div className="flex gap-6 items-start max-w-[960px] mx-auto">

      {/* ── LEFT COLUMN ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* LIVE NOW hero */}
        {liveExam ? (
          <LiveExamCard exam={liveExam} />
        ) : (
          <NoLiveExamCard />
        )}

        {/* Upcoming Assessments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-sans"
              style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}
            >
              Upcoming Assessments
            </h2>
            <Link
              href="/student/exams"
              className="no-underline nav-transition"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--clr-green-800)',
              }}
            >
              View All
            </Link>
          </div>

          {(upcomingExams ?? []).length === 0 ? (
            <div
              className="text-center font-sans bg-card"
              style={{
                padding: '24px',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-card)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
              }}
            >
              No upcoming assessments scheduled.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(upcomingExams ?? []).map((exam) => {
                const date = new Date(exam.created_at as string);
                const month = date.toLocaleString('en', { month: 'short' }).toUpperCase();
                const day = date.getDate();
                return (
                  <div
                    key={exam.id}
                    className="flex items-center bg-card nav-transition"
                    style={{
                      gap: '16px',
                      padding: '14px 16px',
                      border: '1px solid var(--color-slate-200)',
                      borderRadius: 'var(--radius-card)',
                    }}
                  >
                    {/* Date badge */}
                    <div
                      className="shrink-0 text-center"
                      style={{
                        width: '44px',
                        backgroundColor: 'var(--clr-green-50)',
                        borderRadius: 'var(--radius-btn)',
                        padding: '6px 4px',
                      }}
                    >
                      <div
                        className="uppercase font-sans"
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--clr-green-800)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {month}
                      </div>
                      <div
                        className="font-mono tabular-nums"
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          lineHeight: 1.1,
                        }}
                      >
                        {day}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-sans"
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '2px',
                        }}
                      >
                        {exam.title}
                      </div>
                      <div
                        className="font-sans"
                        style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                      >
                        {exam.type} · {exam.duration_minutes} min
                      </div>
                    </div>

                    <ChevronRight
                      size={16}
                      className="shrink-0"
                      style={{ color: 'var(--color-slate-300)' }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="shrink-0 flex flex-col" style={{ width: '280px', gap: '16px' }}>

        {/* Candidate summary card */}
        <div
          className="bg-card"
          style={{
            border: '1px solid var(--color-slate-200)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <span
              className="inline-block font-sans"
              style={{
                backgroundColor: 'var(--clr-green-50)',
                border: '1px solid var(--clr-green-200)',
                color: 'var(--clr-green-800)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              {levelName}
            </span>
            <div
              className="font-sans"
              style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
            >
              Candidate ID:{' '}
              <strong
                className="font-mono tabular-nums"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono), monospace',
                  letterSpacing: 0,
                }}
              >
                {rollNumber}
              </strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
