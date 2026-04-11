'use client';

import { Fragment, useState, useTransition, useCallback } from 'react';
import {
  fetchActivityLogs,
  exportActivityLogsCsv,
  type ActivityLogRow,
  type FetchLogsInput,
} from '@/app/actions/activity-log';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';
import { toast } from 'sonner';

const ACTION_TYPES = [
  'ALL',
  'CREATE_ANNOUNCEMENT',
  'CREATE_ASSESSMENT',
  'CREATE_LEVEL',
  'CREATE_QUESTION',
  'DEACTIVATE_STUDENT',
  'FORCE_CLOSE_EXAM',
  'FORCE_OPEN_EXAM',
  'INIT_SESSION',
  'PUBLISH_ASSESSMENT',
  'PUBLISH_RESULT',
  'RE_EVALUATE_RESULTS',
  'SUBMIT_EXAM',
  'UPDATE_ASSESSMENT',
];

const BADGE_STYLES: Record<string, string> = {
  PUBLISH_RESULT:      'bg-green-100 text-green-800',
  PUBLISH_ASSESSMENT:  'bg-green-100 text-green-800',
  FORCE_CLOSE_EXAM:    'bg-red-100 text-red-800',
  CREATE_ASSESSMENT:   'bg-blue-100 text-blue-800',
  CREATE_ANNOUNCEMENT: 'bg-blue-100 text-blue-800',
  CREATE_LEVEL:        'bg-blue-100 text-blue-800',
  CREATE_QUESTION:     'bg-blue-100 text-blue-800',
  UPDATE_ASSESSMENT:   'bg-blue-100 text-blue-800',
  FORCE_OPEN_EXAM:     'bg-orange-100 text-orange-800',
  DEACTIVATE_STUDENT:  'bg-orange-100 text-orange-800',
  RE_EVALUATE_RESULTS: 'bg-amber-100 text-amber-800',
  INIT_SESSION:        'bg-slate-100 text-slate-700',
  SUBMIT_EXAM:         'bg-slate-100 text-slate-700',
};

function formatUtc(iso: string): string {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

interface ActivityLogClientProps {
  initialLogs: ActivityLogRow[];
  initialTotal: number;
}

export default function ActivityLogClient({
  initialLogs,
  initialTotal,
}: ActivityLogClientProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExportTransition] = useTransition();

  const load = useCallback(
    (filters: FetchLogsInput & { page: number }) => {
      startTransition(async () => {
        const result = await fetchActivityLogs(filters);
        if (result.ok) {
          setLogs(result.data.logs);
          setTotal(result.data.total);
          setExpandedId(null);
        } else {
          toast.error('Failed to load activity logs');
        }
      });
    },
    []
  );

  const applyFilters = (overrides: Partial<FetchLogsInput & { page: number }> = {}) => {
    const newPage = overrides.page ?? 1;
    const filters: FetchLogsInput & { page: number } = {
      page: newPage,
      actionType: overrides.actionType !== undefined ? overrides.actionType : actionType,
      userSearch: overrides.userSearch !== undefined ? overrides.userSearch : userSearch,
      dateFrom: overrides.dateFrom !== undefined ? overrides.dateFrom : dateFrom,
      dateTo: overrides.dateTo !== undefined ? overrides.dateTo : dateTo,
    };
    setPage(newPage);
    load(filters);
  };

  const handleExport = () => {
    startExportTransition(async () => {
      const result = await exportActivityLogsCsv({
        actionType: actionType !== 'ALL' ? actionType : undefined,
        userSearch: userSearch || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (!result.ok) { toast.error('Export failed'); return; }
      const blob = new Blob([result.data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48 space-y-1">
            <label className="text-xs font-medium text-slate-500">Search Actor</label>
            <Input
              placeholder="Email address…"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  applyFilters({ userSearch: e.currentTarget.value });
                }
              }}
              className="h-9"
            />
          </div>
          <div className="w-52 space-y-1">
            <label className="text-xs font-medium text-slate-500">Action Type</label>
            <Select
              value={actionType}
              onValueChange={v => {
                const val = v ?? 'ALL';
                setActionType(val);
                applyFilters({ actionType: val });
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t === 'ALL' ? 'All Actions' : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">From</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={e => {
                setDateFrom(e.target.value);
                applyFilters({ dateFrom: e.target.value });
              }}
              className="h-9 w-40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">To</label>
            <Input
              type="date"
              value={dateTo}
              onChange={e => {
                setDateTo(e.target.value);
                applyFilters({ dateTo: e.target.value });
              }}
              className="h-9 w-40"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="h-9 gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <span className="text-sm text-slate-500">
            {total === 0
              ? 'No events'
              : `Showing ${(page - 1) * 50 + 1}–${Math.min(page * 50, total)} of ${total.toLocaleString()} events`}
          </span>
          {isPending && <span className="text-xs text-slate-400 animate-pulse">Loading…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-44">
                  Timestamp (UTC)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Actor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Target
                </th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    No activity logs found
                  </td>
                </tr>
              )}
              {logs.map(log => (
                <Fragment key={log.id}>
                  <tr
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {formatUtc(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-green-800/10 flex items-center justify-center text-xs font-semibold text-green-800 shrink-0">
                          {(log.actor_email?.[0] ?? '?').toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-700">{log.actor_email ?? 'System'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          BADGE_STYLES[log.action_type] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <span className="font-medium">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-slate-400 ml-1 font-mono">
                          {log.entity_id.slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {expandedId === log.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Metadata panel */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Metadata
                            </h4>
                            <dl className="space-y-1.5 text-xs">
                              <div className="flex gap-2">
                                <dt className="text-slate-400 w-24 shrink-0">IP Address</dt>
                                <dd className="font-mono text-slate-700">{log.ip_address ?? 'N/A'}</dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="text-slate-400 w-24 shrink-0">User Agent</dt>
                                <dd className="text-slate-700 break-all">{log.user_agent ?? 'N/A'}</dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="text-slate-400 w-24 shrink-0">Trace ID</dt>
                                <dd className="font-mono text-slate-700">
                                  {typeof log.metadata?.trace_id === 'string'
                                    ? log.metadata.trace_id
                                    : 'N/A'}
                                </dd>
                              </div>
                            </dl>
                          </div>
                          {/* JSON Payload */}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Payload
                              </h4>
                              <pre className="text-xs bg-white border border-slate-200 rounded p-2 overflow-auto max-h-32 text-slate-700">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isPending}
              onClick={() => applyFilters({ page: page - 1 })}
            >
              Previous
            </Button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages || isPending}
              onClick={() => applyFilters({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* System Status bar — removed per UI_DIAGNOSTIC_REPORT.md Fake
          Data Inventory. INDEX_HEALTH / RETENTION / ALERTS were
          hardcoded literals with no DB or metrics backing. */}
    </div>
  );
}
