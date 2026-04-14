import * as React from 'react';

type Size = 'lg' | 'md' | 'sm';

export function ScoreFraction({
  got,
  total,
  size,
}: {
  got: number | null;
  total: number | null;
  size: Size;
}) {
  if (got == null || total == null) {
    return (
      <span
        data-testid="score-fraction"
        className={`score-fraction size-${size} dash`}
      >
        —
      </span>
    );
  }
  return (
    <span data-testid="score-fraction" className={`score-fraction size-${size}`}>
      {got}
      <span className="pct">/{total}</span>
    </span>
  );
}
