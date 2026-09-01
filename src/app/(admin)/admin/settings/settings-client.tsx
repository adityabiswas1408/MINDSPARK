'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateSettings } from '@/app/actions/settings';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, HelpCircle } from 'lucide-react';

const TIMEZONES = [
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Atlantic/Azores',
  'Europe/London',
  'Europe/Dublin',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Nairobi',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Perth',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function formatTimer(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

interface BoundaryRow {
  grade_name: string;
  min_score: number;
  max_score: number;
  assessment_type: string;
  label: string;
}

export interface GradeBoundaryInput {
  grade_name: string;
  min_percentage: number;
  min_score: number | null;
  max_score: number | null;
  assessment_type: string | null;
  label: string | null;
}

export interface InstitutionInput {
  name: string;
  timezone: string;
  session_timeout_seconds: number;
}

interface SettingsClientProps {
  institution: InstitutionInput;
  gradeBoundaries: GradeBoundaryInput[];
}

function detectOverlaps(rows: BoundaryRow[]): Set<number> {
  const overlapping = new Set<number>();
  for (let i = 0; i < rows.length; i++) {
    // Min > max within same row
    if (rows[i].min_score > rows[i].max_score) {
      overlapping.add(i);
    }
  }
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i];
      const b = rows[j];
      // Ranges overlap if NOT (a.max < b.min OR b.max < a.min)
      if (!(a.max_score < b.min_score || b.max_score < a.min_score)) {
        overlapping.add(i);
        overlapping.add(j);
      }
    }
  }
  return overlapping;
}

function initBoundaries(gradeBoundaries: GradeBoundaryInput[]): BoundaryRow[] {
  const sorted = [...gradeBoundaries].sort((a, b) => b.min_percentage - a.min_percentage);
  return sorted.map((g, i) => ({
    grade_name: g.grade_name,
    min_score: g.min_score ?? g.min_percentage,
    max_score: g.max_score ?? (i === 0 ? 100 : sorted[i - 1].min_percentage - 1),
    assessment_type: g.assessment_type ?? 'ALL',
    label: g.label ?? '',
  }));
}

export default function SettingsClient({ institution, gradeBoundaries }: SettingsClientProps) {
  const [name, setName] = useState(institution.name);
  const [timezone, setTimezone] = useState(institution.timezone);
  const [sessionTimeout, setSessionTimeout] = useState(String(institution.session_timeout_seconds));
  const [autoArchive, setAutoArchive] = useState(false);
  const [boundaries, setBoundaries] = useState<BoundaryRow[]>(() => initBoundaries(gradeBoundaries));
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPendingInst, startInstTransition] = useTransition();
  const [isPendingBounds, startBoundsTransition] = useTransition();

  // Session expiry from Supabase auth
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.expires_at) {
        setSessionExpiry(data.session.expires_at * 1000);
      }
    });
  }, []);

  useEffect(() => {
    if (!sessionExpiry) return;
    setTimeRemaining(Math.max(0, sessionExpiry - Date.now()));
    const id = setInterval(() => {
      setTimeRemaining(Math.max(0, sessionExpiry - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionExpiry]);

  const overlapping = detectOverlaps(boundaries);
  const hasOverlap = overlapping.size > 0;

  const handleSaveInstitution = () => {
    if (!name.trim()) { toast.error('Institution name is required'); return; }
    const timeout = parseInt(sessionTimeout, 10);
    if (isNaN(timeout) || timeout < 900 || timeout > 86400) {
      toast.error('Session timeout must be 900–86400 seconds');
      return;
    }
    startInstTransition(async () => {
      const result = await updateSettings({ name: name.trim(), timezone, session_timeout_seconds: timeout });
      if (result.ok) {
        toast.success('Settings saved');
      } else {
        toast.error((result as { message?: string }).message ?? 'Failed to save settings');
      }
    });
  };

  const handleSaveBoundaries = () => {
    if (hasOverlap) { toast.error('Fix overlapping grade boundaries before saving'); return; }
    startBoundsTransition(async () => {
      const result = await updateSettings({
        grade_boundaries: boundaries.map(b => ({
          assessment_type: b.assessment_type as 'EXAM' | 'TEST' | 'ALL',
          min_score: b.min_score,
          max_score: b.max_score,
          grade: b.grade_name,
          label: b.label,
        })),
      });
      if (result.ok) {
        toast.success('Grade boundaries saved');
      } else {
        toast.error((result as { message?: string }).message ?? 'Failed to save boundaries');
      }
    });
  };

  const resetToDefaults = () => {
    setBoundaries([
      { grade_name: 'O',  min_score: 90, max_score: 100, assessment_type: 'ALL', label: '' },
      { grade_name: 'A+', min_score: 80, max_score: 89,  assessment_type: 'ALL', label: '' },
      { grade_name: 'A',  min_score: 70, max_score: 79,  assessment_type: 'ALL', label: '' },
      { grade_name: 'B',  min_score: 60, max_score: 69,  assessment_type: 'ALL', label: '' },
      { grade_name: 'C',  min_score: 50, max_score: 59,  assessment_type: 'ALL', label: '' },
    ]);
  };

  const updateBoundaryField = (index: number, field: 'min_score' | 'max_score', value: string) => {
    setBoundaries(prev =>
      prev.map((b, i) =>
        i === index ? { ...b, [field]: parseFloat(value) } : b
      )
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      {/* Left column */}
      <div className="space-y-6">

        {/* Institution Profile */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Institution Profile</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Institution Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Demo School"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Primary Timezone</label>
            <Select value={timezone} onValueChange={v => setTimezone(v ?? institution.timezone)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Session Timeout <span className="text-xs font-normal text-slate-400">(seconds, 900–86400)</span>
            </label>
            <Input
              value={sessionTimeout}
              onChange={e => setSessionTimeout(e.target.value)}
              type="number"
              min={900}
              max={86400}
              className="h-9 font-mono"
            />
          </div>

          <Button
            onClick={handleSaveInstitution}
            disabled={isPendingInst}
            className="bg-green-800 hover:bg-green-700 text-white"
          >
            {isPendingInst ? 'Saving…' : 'Save Institution'}
          </Button>
        </div>

        {/* Grade Boundaries */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Grade Boundaries</h2>

          {hasOverlap && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Overlap Detected — Fix conflicting ranges before saving</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-16">Grade</th>
                  <th className="pb-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Min Score</th>
                  <th className="pb-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Max Score</th>
                  <th className="pb-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {boundaries.map((b, i) => {
                  const isOverlap = overlapping.has(i);
                  return (
                    <tr key={b.grade_name} className={isOverlap ? 'bg-red-50/50' : ''}>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center justify-center w-8 h-7 rounded bg-green-800/10 text-xs font-semibold text-green-800 font-mono">
                          {b.grade_name}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Input
                          type="number"
                          value={isNaN(b.min_score) ? '' : b.min_score}
                          onChange={e => updateBoundaryField(i, 'min_score', e.target.value)}
                          className={`h-8 w-24 font-mono text-sm ${isOverlap ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                          min={0}
                          max={100}
                        />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Input
                          type="number"
                          value={isNaN(b.max_score) ? '' : b.max_score}
                          onChange={e => updateBoundaryField(i, 'max_score', e.target.value)}
                          className={`h-8 w-24 font-mono text-sm ${isOverlap ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                          min={0}
                          max={100}
                        />
                      </td>
                      <td className="py-2.5">
                        {isOverlap ? (
                          <span className="text-xs font-medium text-red-600">⚠ Overlap</span>
                        ) : (
                          <span className="text-xs font-medium text-green-700">✓ OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleSaveBoundaries}
              disabled={isPendingBounds || hasOverlap}
              className="bg-green-800 hover:bg-green-700 text-white"
            >
              {isPendingBounds ? 'Saving…' : 'Save Boundaries'}
            </Button>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={isPendingBounds}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Data Retention Policy</h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Auto-Archive Records</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Move inactive student data to cold storage after 12 months
              </p>
            </div>
            {/* Manual toggle — no DB column backing */}
            <button
              type="button"
              role="switch"
              aria-checked={autoArchive}
              onClick={() => setAutoArchive(v => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2 ${autoArchive ? 'bg-green-800' : 'bg-slate-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition-transform ${autoArchive ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Changes to data retention policy require manual configuration. Contact support.
            </span>
          </div>
        </div>

        {/* Session Timer */}
        {sessionExpiry !== null && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Session</span>
            <span className={`text-sm font-mono font-semibold tabular-nums ${timeRemaining < 300_000 ? 'text-red-600' : 'text-slate-700'}`}>
              Expires in: {formatTimer(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Right column — Support card */}
      <div className="bg-green-800/5 rounded-lg border border-green-800/10 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-green-800" />
          <h3 className="text-sm font-semibold text-green-800">Need help with advanced config?</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Configure SSO, API access, advanced grade rules, and compliance settings via the developer docs.
        </p>
        <a
          href="https://docs.mindspark.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-medium text-green-800 underline underline-offset-2 hover:opacity-80"
        >
          Open Developer Docs
        </a>
      </div>
    </div>
  );
}
