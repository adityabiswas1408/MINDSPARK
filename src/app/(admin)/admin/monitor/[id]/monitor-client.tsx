'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { forceCloseExam } from '@/app/actions/assessments';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type FilterFn,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';

export type StudentStatus = 'in_progress' | 'submitted' | 'disconnected' | 'waiting';

export interface InitialSession {
  session_id: string;
  student_id: string;
  full_name: string;
  roll_number: string;
  session_status: string;
  completed_at: string | null;
  answered_count: number;
}

interface StudentRow {
  session_id: string;
  student_id: string;
  full_name: string;
  roll_number: string;
  status: StudentStatus;
  answered_count: number;
  last_seen: Date | null;
}

interface MonitorClientProps {
  paperId: string;
  paperTitle: string;
  paperStatus: string;
  durationMinutes: number;
  openedAt: string | null;
  totalQuestions: number;
  initialSessions: InitialSession[];
}

function deriveStatus(s: InitialSession): StudentStatus {
  if (s.completed_at) return 'submitted';
  if (s.session_status === 'scheduled') return 'waiting';
  return 'in_progress';
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function StatusBadge({ status }: { status: StudentStatus }) {
  const config: Record<StudentStatus, { dot: string; text: string; bg: string; label: string }> = {
    in_progress:  { dot: 'bg-green-500', text: 'text-green-800', bg: 'bg-green-100',  label: 'In Progress'  },
    submitted:    { dot: 'bg-blue-500',  text: 'text-blue-800',  bg: 'bg-blue-100',   label: 'Submitted'    },
    disconnected: { dot: 'bg-red-500',   text: 'text-red-800',   bg: 'bg-red-100',    label: 'Disconnected' },
    waiting:      { dot: 'bg-gray-400',  text: 'text-gray-600',  bg: 'bg-gray-100',   label: 'Waiting'      },
  };
  const { dot, text, bg, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

const studentSearchFilter: FilterFn<StudentRow> = (row, _col, value) => {
  const v = String(value).toLowerCase();
  return (
    row.original.full_name.toLowerCase().includes(v) ||
    row.original.roll_number.toLowerCase().includes(v)
  );
};

export default function MonitorClient({
  paperId,
  paperTitle,
  paperStatus,
  durationMinutes,
  openedAt,
  totalQuestions,
  initialSessions,
}: MonitorClientProps) {
  const [rows, setRows] = useState<StudentRow[]>(() =>
    initialSessions.map(s => ({
      session_id: s.session_id,
      student_id: s.student_id,
      full_name: s.full_name,
      roll_number: s.roll_number,
      status: deriveStatus(s),
      answered_count: s.answered_count,
      last_seen: null,
    }))
  );
  const [filter, setFilter] = useState('');
  const [closing, setClosing] = useState(false);
  const [examClosed, setExamClosed] = useState(paperStatus === 'CLOSED');
  const [timeMs, setTimeMs] = useState(() =>
    openedAt
      ? Math.max(0, new Date(openedAt).getTime() + durationMinutes * 60 * 1000 - Date.now())
      : 0
  );

  // Countdown timer — runs independently of realtime
  useEffect(() => {
    const id = setInterval(() => setTimeMs(t => Math.max(0, t - 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Three realtime channels — all cleaned up on unmount
  useEffect(() => {
    const supabase = createClient();

    // 1. Postgres changes on assessment_sessions (filtered to this paper)
    const dbCh = supabase
      .channel(`monitor-db-${paperId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assessment_sessions', filter: `paper_id=eq.${paperId}` },
        payload => {
          if (payload.eventType !== 'UPDATE') return;
          const rec = payload.new as Record<string, unknown>;
          const sid = rec.student_id as string | undefined;
          if (!sid) return;
          setRows(prev =>
            prev.map(r => r.student_id === sid ? { ...r, last_seen: new Date() } : r)
          );
        }
      )
      .subscribe();

    // 2. Broadcast on exam:{paperId} — lifecycle events (submitted, exam_closed)
    const examCh = supabase
      .channel(`exam:${paperId}`)
      .on('broadcast', { event: 'lifecycle' }, payload => {
        const p = (payload.payload ?? {}) as Record<string, string>;
        if (p.status === 'submitted' && p.student_id) {
          setRows(prev =>
            prev.map(r =>
              r.student_id === p.student_id
                ? { ...r, status: 'submitted', last_seen: new Date() }
                : r
            )
          );
        }
      })
      .on('broadcast', { event: 'exam_closed' }, () => {
        setExamClosed(true);
        toast.info('Exam has been closed');
      })
      .subscribe();

    // 3. Presence on lobby:{paperId} — active / disconnected state
    const lobbyCh = supabase
      .channel(`lobby:${paperId}`)
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const sid = (newPresences[0] as { student_id?: string })?.student_id;
        if (!sid) return;
        setRows(prev =>
          prev.map(r =>
            r.student_id === sid && r.status !== 'submitted'
              ? { ...r, status: 'in_progress', last_seen: new Date() }
              : r
          )
        );
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const sid = (leftPresences[0] as { student_id?: string })?.student_id;
        if (!sid) return;
        setRows(prev =>
          prev.map(r =>
            r.student_id === sid && r.status !== 'submitted'
              ? { ...r, status: 'disconnected', last_seen: new Date() }
              : r
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dbCh);
      supabase.removeChannel(examCh);
      supabase.removeChannel(lobbyCh);
    };
  }, [paperId]);

  const handleForceClose = useCallback(async () => {
    if (closing || examClosed) return;
    setClosing(true);
    const result = await forceCloseExam({ assessment_id: paperId });
    if ('error' in result) {
      toast.error('Failed to close exam. Try again.');
      setClosing(false);
    } else {
      setExamClosed(true);
      toast.success('Exam closed successfully');
    }
  }, [paperId, closing, examClosed]);

  const counts = useMemo(() => ({
    in_progress:  rows.filter(r => r.status === 'in_progress').length,
    submitted:    rows.filter(r => r.status === 'submitted').length,
    disconnected: rows.filter(r => r.status === 'disconnected').length,
    waiting:      rows.filter(r => r.status === 'waiting').length,
  }), [rows]);

  const columns = useMemo<ColumnDef<StudentRow>[]>(() => [
    {
      accessorKey: 'full_name',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{row.original.full_name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.original.roll_number}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const pct = totalQuestions > 0
          ? Math.round((row.original.answered_count / totalQuestions) * 100)
          : 0;
        return (
          <div className="flex items-center gap-2 min-w-[140px]">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1A3829] rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums w-12 shrink-0 text-right">
              {row.original.answered_count}/{totalQuestions}
            </span>
          </div>
        );
      },
    },
    {
      id: 'last_seen',
      header: 'Last Seen',
      cell: ({ row }) =>
        row.original.last_seen ? (
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(row.original.last_seen, { addSuffix: true })}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="text-right">
          <a
            href={`/admin/students/${row.original.student_id}`}
            className="text-xs text-[#1A3829] hover:underline"
          >
            View Profile
          </a>
        </div>
      ),
    },
  ], [totalQuestions]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter: filter },
    onGlobalFilterChange: setFilter,
    globalFilterFn: studentSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const summaryItems = [
    { label: 'In Progress',  count: counts.in_progress,  color: 'text-green-700 bg-green-50 border-green-200' },
    { label: 'Submitted',    count: counts.submitted,    color: 'text-blue-700 bg-blue-50 border-blue-200'    },
    { label: 'Disconnected', count: counts.disconnected, color: 'text-red-700 bg-red-50 border-red-200'       },
    { label: 'Waiting',      count: counts.waiting,      color: 'text-slate-600 bg-slate-50 border-slate-200' },
  ];

  const filteredRows = table.getFilteredRowModel().rows;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{paperTitle}</h1>
            {!examClosed ? (
              <span className="inline-flex shrink-0 items-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                LIVE
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center rounded-full bg-slate-400 px-2.5 py-0.5 text-xs font-semibold text-white">
                CLOSED
              </span>
            )}
          </div>
          {openedAt && (
            <p className="text-sm text-slate-500">
              Time remaining:{' '}
              <span className={`font-mono tabular-nums font-semibold ${timeMs < 60_000 ? 'text-red-600' : 'text-slate-700'}`}>
                {formatTime(timeMs)}
              </span>
            </p>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleForceClose}
          disabled={closing || examClosed}
          className="shrink-0"
        >
          {examClosed ? 'Exam Closed' : closing ? 'Closing…' : 'Force Close Exam'}
        </Button>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryItems.map(({ label, count, color }) => (
          <div key={label} className={`rounded-lg border p-3 ${color}`}>
            <p className="text-2xl font-bold font-mono tabular-nums">{count}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Student table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search by name or roll number…"
              className="pl-8 h-8 text-sm"
            />
          </div>
          <span className="text-xs text-slate-500 ml-auto tabular-nums">
            {filteredRows.length} student{filteredRows.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-200"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                    No students connected yet.
                  </td>
                </tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
