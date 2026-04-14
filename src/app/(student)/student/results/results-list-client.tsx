'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  ResultsLedgerTable,
  type LedgerTableRow,
} from '@/components/results/results-ledger-table';
import { FilterEmptyState } from '@/components/results/empty-states';

const CHIPS = ['all', 'EXAM', 'TEST', 'pending', 'last30'] as const;
type ChipKey = (typeof CHIPS)[number];

const CHIP_LABELS: Record<ChipKey, string> = {
  all: 'All',
  EXAM: 'EXAM',
  TEST: 'TEST',
  pending: 'Pending',
  last30: 'Last 30 days',
};

function isChipKey(value: string): value is ChipKey {
  return (CHIPS as readonly string[]).includes(value);
}

/**
 * Client wrapper for the results ledger. Owns:
 *   - the filter chip row + URL state (?filter=…)
 *   - the client-side row filtering
 *   - the FilterEmptyState fallback when a filter matches zero rows
 *
 * Receives all rows from the Server Component as a prop — chip clicks
 * never trigger a re-fetch.
 */
export function ResultsListClient({
  initialRows,
  initialFilter,
}: {
  initialRows: LedgerTableRow[];
  initialFilter: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active: ChipKey = isChipKey(initialFilter) ? initialFilter : 'all';

  const filtered = React.useMemo(() => {
    return initialRows.filter((r) => {
      if (active === 'all') return true;
      if (active === 'EXAM' || active === 'TEST') return r.paperType === active;
      if (active === 'pending') return r.resultPublishedAt == null;
      if (active === 'last30') {
        if (!r.completedAt) return false;
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return new Date(r.completedAt).getTime() >= cutoff;
      }
      return true;
    });
  }, [initialRows, active]);

  const setFilter = React.useCallback(
    (next: ChipKey) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (next === 'all') params.delete('filter');
      else params.set('filter', next);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  return (
    <>
      <div className="chip-row" data-testid="results-chip-row">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${active === c ? 'active' : ''}`}
            onClick={() => setFilter(c)}
            data-testid={`chip-${c}`}
            aria-pressed={active === c}
          >
            {CHIP_LABELS[c]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <FilterEmptyState onClear={() => setFilter('all')} />
      ) : (
        <ResultsLedgerTable rows={filtered} />
      )}
    </>
  );
}
