'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ScoreFraction } from './score-fraction';
import { GradePill, type GradeLetter } from './grade-pill';

export type LedgerTableRow = {
  id: string;
  paperTitle: string;
  paperType: 'EXAM' | 'TEST';
  paperDurationMinutes: number;
  score: number;
  totalQuestions: number;
  grade: GradeLetter | null;
  completedAt: string | null;
  resultPublishedAt: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Academic Ledger table. Receives pre-filtered rows from the parent
 * (filtering happens in `results-list-client.tsx` in Task 6, or in the
 * server component for now). Each row is clickable and routes to the
 * per-submission detail page.
 *
 * Markup ported verbatim from student-results-flow.html Frame 1.
 */
export function ResultsLedgerTable({ rows }: { rows: LedgerTableRow[] }) {
  const router = useRouter();
  return (
    <div className="ledger" data-testid="results-ledger">
      <div className="ledger-wrap">
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Date</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isPending = r.resultPublishedAt == null;
              const dateIso = r.resultPublishedAt ?? r.completedAt;
              return (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/student/results/${r.id}`)}
                  data-testid="ledger-row"
                >
                  <td className="title">{r.paperTitle}</td>
                  <td className="mono">
                    {formatDate(dateIso)}
                    {isPending && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginTop: '2px',
                        }}
                      >
                        submitted
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`type-pill ${r.paperType.toLowerCase()}`}>
                      {r.paperType}
                    </span>
                  </td>
                  <td className="mono">{r.paperDurationMinutes} min</td>
                  <td className="mono score">
                    {isPending ? (
                      <span className="dash">—</span>
                    ) : (
                      <ScoreFraction got={r.score} total={r.totalQuestions} size="sm" />
                    )}
                  </td>
                  <td>
                    <GradePill grade={isPending ? null : r.grade} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
