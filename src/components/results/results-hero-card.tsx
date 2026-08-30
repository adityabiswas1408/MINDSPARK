import * as React from 'react';
import Link from 'next/link';
import { ScoreFraction } from './score-fraction';
import type { GradeLetter } from './grade-pill';

/**
 * Latest Result hero card. Wraps a single published submission row in
 * an <a> that links to the per-submission detail page.
 *
 * Markup matches docs/design-mockups/student-results-flow.html Frame 1
 * verbatim — `.hero-card / .hero-eyebrow / .hero-title / .hero-sub /
 * .hero-stats / .hero-grade-pill` are all defined in globals.css.
 */
export function ResultsHeroCard({
  submissionId,
  paperTitle,
  publishedAt,
  score,
  totalQuestions,
  grade,
}: {
  submissionId: string;
  paperTitle: string;
  publishedAt: string;
  score: number | null;
  totalQuestions: number | null;
  grade: GradeLetter | null;
}) {
  const dateLabel = new Date(publishedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link
      href={`/student/results/${submissionId}`}
      className="hero-card"
      data-testid="results-hero-card"
    >
      <div>
        <div className="hero-eyebrow">Latest Result</div>
        <div className="hero-title">{paperTitle}</div>
        <div className="hero-sub">Published {dateLabel}</div>
      </div>
      <div className="hero-stats">
        <div>
          <ScoreFraction got={score} total={totalQuestions} size="md" />
          <div className="hero-score-label">Score</div>
        </div>
        {grade != null && (
          <div className="hero-grade-pill">
            <div className="letter">{grade}</div>
            <div className="caption">Grade</div>
          </div>
        )}
      </div>
    </Link>
  );
}
