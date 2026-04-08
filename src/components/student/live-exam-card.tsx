'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LiveExam {
  id: string;
  title: string;
  type: string;
  duration_minutes: number;
  opened_at: string | null;
}

interface LiveExamCardProps {
  exam: LiveExam;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function LiveExamCard({ exam }: LiveExamCardProps) {
  const endTime = exam.opened_at
    ? new Date(exam.opened_at).getTime() + exam.duration_minutes * 60 * 1000
    : null;

  const [timeLeft, setTimeLeft] = useState(
    endTime ? formatTime(endTime - Date.now()) : '--:--:--'
  );

  useEffect(() => {
    if (!endTime) return;
    const tick = () => setTimeLeft(formatTime(endTime - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return (
    <div
      style={{
        backgroundColor: '#1A3829',
        borderRadius: '16px',
        padding: '28px 24px',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row: LIVE badge + countdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '20px',
            letterSpacing: '0.05em',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'inline-block',
            }}
          />
          LIVE NOW
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.60)', letterSpacing: '0.08em', marginBottom: '2px' }}>
            TIME LEFT
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              color: '#FFFFFF',
            }}
          >
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Exam title */}
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
          {exam.title}
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.60)', margin: '4px 0 0 0' }}>
          {exam.type} · {exam.duration_minutes} min
        </p>
      </div>

      {/* Enter button */}
      <Link
        href={`/student/exams/${exam.id}/lobby`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '20px',
          backgroundColor: '#FFFFFF',
          color: '#1A3829',
          fontWeight: '600',
          fontSize: '14px',
          padding: '10px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
        }}
      >
        Enter Examination Hall →
      </Link>
    </div>
  );
}

export function NoLiveExamCard() {
  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        border: '2px dashed #E2E8F0',
        borderRadius: '16px',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
      <p style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: '0 0 4px 0' }}>
        No live exams right now
      </p>
      <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
        Your exam will appear here when it goes live.
      </p>
    </div>
  );
}
