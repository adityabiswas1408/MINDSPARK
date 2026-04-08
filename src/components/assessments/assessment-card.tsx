'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forceOpenExam, forceCloseExam } from '@/app/actions/assessments';

interface ExamPaper {
  id: string;
  title: string;
  type: string;
  status: string;
  duration_minutes: number;
}

interface AssessmentCardProps {
  paper: ExamPaper;
}

const STATUS_BADGE: Record<string, React.CSSProperties> = {
  DRAFT: { backgroundColor: '#F1F5F9', color: '#475569' },
  PUBLISHED: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  LIVE: { backgroundColor: '#EF4444', color: '#FFFFFF' },
  CLOSED: { backgroundColor: '#E2E8F0', color: '#64748B' },
};

export function AssessmentCard({ paper }: AssessmentCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const badgeStyle: React.CSSProperties = {
    ...(STATUS_BADGE[paper.status] ?? STATUS_BADGE.DRAFT),
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    letterSpacing: '0.04em',
  };

  const typeBadgeStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    letterSpacing: '0.04em',
  };

  function handleOpen() {
    startTransition(async () => {
      await forceOpenExam({ assessment_id: paper.id });
      router.refresh();
    });
  }

  function handleClose() {
    startTransition(async () => {
      await forceCloseExam({ assessment_id: paper.id });
      router.refresh();
    });
  }

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
        gap: '12px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', fontSize: '15px', color: '#0F172A', marginBottom: '6px' }}>
          {paper.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={badgeStyle}>
            {paper.status === 'LIVE' && (
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
            {paper.status}
          </span>
          <span style={typeBadgeStyle}>{paper.type}</span>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>{paper.duration_minutes} min</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {paper.status === 'DRAFT' && (
          <Link
            href={`/admin/assessments/${paper.id}/edit`}
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#1A3829',
              textDecoration: 'none',
              padding: '6px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
            }}
          >
            Edit
          </Link>
        )}

        {paper.status === 'PUBLISHED' && (
          <button
            type="button"
            onClick={handleOpen}
            disabled={isPending}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#FFFFFF',
              backgroundColor: isPending ? '#94A3B8' : '#1A3829',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? 'Opening…' : 'Go Live'}
          </button>
        )}

        {paper.status === 'LIVE' && (
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#FFFFFF',
              backgroundColor: isPending ? '#94A3B8' : '#DC2626',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? 'Closing…' : 'Force Close'}
          </button>
        )}

        {paper.status === 'CLOSED' && (
          <Link
            href="/admin/results"
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#475569',
              textDecoration: 'none',
              padding: '6px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
            }}
          >
            View Results
          </Link>
        )}
      </div>
    </div>
  );
}
