'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { publishResult, publishResults, reEvaluateResults } from '@/app/actions/results';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

const GRADE_ORDER = ['F', 'D', 'C', 'B', 'A', 'A+'] as const;

const GRADE_BADGE: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-800',
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-amber-100 text-amber-800',
  D: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800',
};

export interface SubmissionRow {
  id: string;
  student_id: string;
  percentage: number | null;
  grade: string | null;
  dpm: number | null;
  result_published_at: string | null;
  students: { full_name: string } | null;
}

export interface Paper {
  id: string;
  title: string;
}

interface ResultsClientProps {
  papers: Paper[];
  selectedPaperId: string | null;
  submissions: SubmissionRow[];
}

function getInitials(name: string | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ResultsClient({ papers, selectedPaperId, submissions }: ResultsClientProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isPending, startTransition] = useTransition();

  const graded = useMemo(
    () => submissions.filter((s) => s.grade !== null && s.percentage !== null),
    [submissions],
  );

  const stats = useMemo(() => {
    if (!graded.length) return { mean: 0, median: 0, dpmAvg: 0 };
    const pcts = graded.map((s) => Number(s.percentage));
    const mean = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    const sorted = [...pcts].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    const dpmAvg = graded.reduce((sum, s) => sum + (s.dpm ?? 0), 0) / graded.length;
    return { mean, median, dpmAvg };
  }, [graded]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of graded) {
      const key = (GRADE_ORDER as readonly string[]).includes(s.grade!) ? s.grade! : 'Other';
      map[key] = (map[key] ?? 0) + 1;
    }
    return GRADE_ORDER.map((g) => ({ grade: g, students: map[g] ?? 0 }));
  }, [graded]);

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((k) => rowSelection[k])
        .map((idx) => submissions[Number(idx)]?.id)
        .filter((id): id is string => Boolean(id)),
    [rowSelection, submissions],
  );

  function handlePaperChange(paperId: string) {
    setRowSelection({});
    router.push(paperId ? `/admin/results?paper_id=${paperId}` : '/admin/results');
  }

  function handlePublishOne(submissionId: string) {
    startTransition(async () => {
      await publishResult({ session_id: submissionId });
      router.refresh();
    });
  }

  function handleBulkPublish() {
    startTransition(async () => {
      await publishResults(selectedIds);
      setRowSelection({});
      router.refresh();
    });
  }

  function handleReEvaluate() {
    if (!selectedPaperId) return;
    startTransition(async () => {
      await reEvaluateResults({
        assessment_id: selectedPaperId,
        reason: 'Manual re-evaluation from admin panel',
      });
      router.refresh();
    });
  }

  const columns: ColumnDef<SubmissionRow>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-green-800 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-green-800 cursor-pointer"
        />
      ),
    },
    {
      id: 'student',
      header: 'Student',
      cell: ({ row }) => {
        const name = row.original.students?.full_name;
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-800 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {getInitials(name)}
            </div>
            <span className="font-medium text-sm">{name ?? '—'}</span>
          </div>
        );
      },
    },
    {
      id: 'score',
      header: 'Score',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums text-sm">
          {row.original.percentage !== null
            ? `${Number(row.original.percentage).toFixed(1)}%`
            : '—'}
        </span>
      ),
    },
    {
      id: 'grade',
      header: 'Grade',
      cell: ({ row }) => {
        const g = row.original.grade;
        if (!g) return <span className="text-slate-400 text-xs">—</span>;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              GRADE_BADGE[g] ?? 'bg-slate-100 text-slate-600'
            }`}
          >
            {g}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const published = row.original.result_published_at !== null;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {published ? 'Published' : 'Unpublished'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const published = row.original.result_published_at !== null;
        return (
          <Button
            size="sm"
            variant="outline"
            disabled={published || isPending}
            onClick={() => handlePublishOne(row.original.id)}
            className="h-7 text-xs"
          >
            {published ? 'Published' : 'Publish'}
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: submissions,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Results</h1>
      </div>

      {/* Assessment selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="paper-select" className="text-sm font-medium text-slate-700 shrink-0">
          Assessment
        </label>
        <select
          id="paper-select"
          value={selectedPaperId ?? ''}
          onChange={(e) => handlePaperChange(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800 min-w-[280px]"
        >
          <option value="">— Select a closed assessment —</option>
          {papers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        {papers.length === 0 && (
          <span className="text-xs text-slate-400">No closed assessments yet</span>
        )}
      </div>

      {!selectedPaperId && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-sm">Select an assessment to view results</p>
        </div>
      )}

      {selectedPaperId && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-sm">No completed submissions for this assessment</p>
        </div>
      )}

      {selectedPaperId && submissions.length > 0 && (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-6 rounded-md border border-slate-200 bg-card p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                Mean
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-primary">
                {stats.mean.toFixed(1)}%
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                Median
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-primary">
                {stats.median.toFixed(1)}%
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                DPM Avg
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-primary">
                {stats.dpmAvg.toFixed(1)}
              </span>
            </div>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={handleReEvaluate}
                className="gap-2 h-8 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Re-evaluate
              </Button>
            </div>
          </div>

          {/* Grade distribution chart */}
          <div className="rounded-md border border-slate-200 bg-card p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Grade Distribution</h2>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#166534" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#166534" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="grade"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value) => [value, 'Students']}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#166534"
                    strokeWidth={2}
                    fill="url(#gradeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-2.5">
              <span className="text-sm font-semibold text-green-800">
                SELECTED {selectedIds.length}
              </span>
              <div className="h-4 w-px bg-green-200" />
              <Button
                size="sm"
                disabled={isPending}
                onClick={handleBulkPublish}
                className="h-7 text-xs bg-green-800 hover:bg-green-700 text-white"
              >
                Publish Selected
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled>
                Export
              </Button>
              <button
                onClick={() => setRowSelection({})}
                className="ml-auto text-green-700 hover:text-green-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Results table */}
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`${
                      row.getIsSelected() ? 'bg-green-50' : 'bg-white hover:bg-slate-50'
                    } transition-colors`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
