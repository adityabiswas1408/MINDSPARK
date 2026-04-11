'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

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

/**
 * Live exam hero card — white surface, 2px forest-green border, per
 * 07_hifi-spec §6. Previously rendered as a filled dark-green card
 * which contradicted the spec (inverted theme).
 */
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
      className="bg-white relative overflow-hidden"
      style={{
        border: '2px solid var(--clr-green-800)',
        borderRadius: 'var(--radius-card)',
        padding: '28px 24px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Top row: LIVE badge + countdown */}
      <div className="flex items-start justify-between mb-5">
        <div
          className="inline-flex items-center gap-1.5 font-sans font-bold uppercase"
          style={{
            backgroundColor: 'var(--bg-live-badge)',
            color: 'var(--text-live-badge)',
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            letterSpacing: '0.05em',
          }}
        >
          <span
            className="inline-block rounded-full"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#FFFFFF',
            }}
          />
          LIVE NOW
        </div>

        <div className="text-right">
          <div
            className="font-sans uppercase tracking-wider"
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-subtle)',
              letterSpacing: '0.08em',
              marginBottom: '2px',
            }}
          >
            TIME LEFT
          </div>
          <div
            className="font-mono tabular-nums"
            style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono), monospace',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--clr-green-800)',
            }}
          >
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Exam title */}
      <div className="mb-2">
        <h2
          className="font-sans"
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {exam.title}
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: '4px 0 0 0',
          }}
        >
          {exam.type} · {exam.duration_minutes} min
        </p>
      </div>

      {/* Enter button */}
      <Link
        href={`/student/exams/${exam.id}/lobby`}
        className="inline-flex items-center gap-1.5 no-underline font-sans font-semibold nav-transition"
        style={{
          marginTop: '20px',
          backgroundColor: 'var(--clr-green-800)',
          color: '#FFFFFF',
          fontSize: '14px',
          padding: '10px 20px',
          borderRadius: 'var(--radius-btn)',
        }}
      >
        Enter Examination Hall →
      </Link>
    </div>
  );
}

/**
 * Empty state — replaces the previous 📋 emoji with a lucide
 * ClipboardList icon per CLAUDE.md hard constraint.
 */
export function NoLiveExamCard() {
  return (
    <div
      className="text-center font-sans"
      style={{
        backgroundColor: 'var(--bg-page)',
        border: '2px dashed var(--color-slate-200)',
        borderRadius: 'var(--radius-card)',
        padding: '40px 24px',
      }}
    >
      <div className="flex items-center justify-center mb-3">
        <ClipboardList
          size={32}
          strokeWidth={1.5}
          aria-hidden="true"
          style={{ color: 'var(--text-subtle)' }}
        />
      </div>
      <p
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 4px 0',
        }}
      >
        No live exams right now
      </p>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          margin: 0,
        }}
      >
        Your exam will appear here when it goes live.
      </p>
    </div>
  );
}
