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
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* ── LEFT COLUMN ── */}
      <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* LIVE NOW hero */}
        {liveExam ? (
          <LiveExamCard exam={liveExam} />
        ) : (
          <NoLiveExamCard />
        )}

        {/* Upcoming Assessments */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Upcoming Assessments
            </h2>
            <Link
              href="/student/exams"
              style={{ fontSize: '13px', fontWeight: '500', color: '#1A3829', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          {(upcomingExams ?? []).length === 0 ? (
            <div
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#475569',
                fontSize: '14px',
              }}
            >
              No upcoming assessments scheduled.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(upcomingExams ?? []).map((exam) => {
                const date = new Date(exam.created_at as string);
                const month = date.toLocaleString('en', { month: 'short' }).toUpperCase();
                const day = date.getDate();
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
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#1A3829', letterSpacing: '0.05em' }}>{month}</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', lineHeight: 1.1 }}>{day}</div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginBottom: '2px' }}>
                        {exam.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        {exam.type} · {exam.duration_minutes} min
                      </div>
                    </div>

                    <ChevronRight size={16} style={{ color: '#CBD5E1', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Candidate Profile card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#DBEAFE',
                color: '#1D4ED8',
                fontSize: '11px',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '20px',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              {levelName}
            </span>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              Candidate ID:{' '}
              <strong style={{ color: '#0F172A', fontFamily: 'var(--font-mono, monospace)' }}>
                {rollNumber}
              </strong>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#475569' }}>Progress to next level</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A' }}>42%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '42%', backgroundColor: '#1A3829', borderRadius: '99px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              style={{
                flex: 1,
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>—</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569', letterSpacing: '0.05em', marginTop: '2px' }}>RANK</div>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>0</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569', letterSpacing: '0.05em', marginTop: '2px' }}>BADGES</div>
            </div>
          </div>
        </div>

        {/* Skill Metrics card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0' }}>
            Skill Metrics
          </h3>

          {[
            { label: 'Logical Reasoning', pct: 88, color: '#1A3829' },
            { label: 'Speed Analysis',    pct: 64, color: '#2563EB' },
            { label: 'Accuracy',          pct: 92, color: '#16A34A' },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#475569' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A' }}>{pct}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '99px' }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
