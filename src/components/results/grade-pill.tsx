import * as React from 'react';
import { Clock } from 'lucide-react';

export type GradeLetter = 'A+' | 'A' | 'B' | 'C' | 'F';

const GRADE_CLASS: Record<GradeLetter, string> = {
  'A+': 'a-plus',
  A: 'a',
  B: 'b',
  C: 'c',
  F: 'f',
};

/**
 * Grade pill. Renders one of:
 *   - A+ / A (green)
 *   - B (blue)
 *   - C (amber)
 *   - F (red)
 *   - PENDING (amber, with clock icon) when grade is null
 *
 * All colours come from `--clr-*` tokens in globals.css. No inline hex.
 */
export function GradePill({ grade }: { grade: GradeLetter | null }) {
  if (grade == null) {
    return (
      <span className="grade-pill pending" data-testid="grade-pill">
        <Clock aria-hidden="true" />
        PENDING
      </span>
    );
  }
  return (
    <span className={`grade-pill ${GRADE_CLASS[grade]}`} data-testid="grade-pill">
      {grade}
    </span>
  );
}
