'use client';

import * as React from 'react';
import Link from 'next/link';
import { Inbox, Filter, ArrowRight, Clock, Lock } from 'lucide-react';

/**
 * Empty-state cards for the student results flow. All five components
 * are centred cards inside the existing page shell — no portals, no
 * Dialog overlays. Markup matches docs/design-mockups/student-results-flow.html
 * Frames 2, 3, 5, 7, 10.
 */

/** Frame 2 — student has zero submissions ever. */
export function NoResultsEmptyState() {
  return (
    <div className="empty-card" data-testid="no-results-empty">
      <Inbox className="icon" aria-hidden="true" />
      <h3>No results yet</h3>
      <p>Take an exam from the Exams page to see your results here.</p>
      <Link href="/student/exams" className="primary-btn">
        Go to Exams
        <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
}

/** Frame 3 — student has results but the active filter returns nothing. */
export function FilterEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="empty-inline" data-testid="filter-empty">
      <Filter className="icon" aria-hidden="true" />
      <p>No results match this filter.</p>
      <button type="button" className="text-btn" onClick={onClear}>
        Clear filter
      </button>
    </div>
  );
}

/** Frame 7 — submission exists but the teacher has not graded it yet. */
export function PendingPanel() {
  return (
    <div className="empty-card" data-testid="pending-panel">
      <Clock className="icon" aria-hidden="true" />
      <h3>Awaiting grading</h3>
      <p>Your teacher will publish this result once it has been graded.</p>
    </div>
  );
}

/** Frames 5 + 10 — answer key is locked (gate B closed). */
export function LockedAnswerSheetCard() {
  return (
    <div className="empty-card" data-testid="locked-answer-sheet">
      <Lock className="icon" aria-hidden="true" />
      <h3>Answer sheet is locked</h3>
      <p>Your teacher hasn&rsquo;t released the answer key for this exam yet.</p>
    </div>
  );
}

/**
 * Fallback header when the student has only pending submissions (no
 * published row to put in the hero card).
 */
export function NoLatestPublishedHero() {
  return (
    <div className="empty-inline" data-testid="no-latest-published">
      <Clock className="icon" aria-hidden="true" />
      <p>No published results yet — your pending submissions are below.</p>
    </div>
  );
}
