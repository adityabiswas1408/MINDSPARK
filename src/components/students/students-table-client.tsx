'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { updateStudent, deactivateStudent, createStudent } from '@/app/actions/students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';

export interface StudentRow {
  id: string;
  full_name: string;
  roll_number: string;
  level_id: string | null;
  created_at: string;
  deleted_at: string | null;
  levels: { id: string; name: string } | null;
}

export interface LevelOption {
  id: string;
  name: string;
  sequence_order: number;
}

interface StudentsTableClientProps {
  students: StudentRow[];
  levels: LevelOption[];
  totalCount: number;
  page: number;
  pageSize: number;
  currentLevelFilter: string;
  currentStatusFilter: string;
}

const COLOURS = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-teal-100 text-teal-800',
  'bg-indigo-100 text-indigo-800',
];

function avatarColour(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLOURS[Math.abs(hash) % COLOURS.length];
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function StudentsTableClient({
  students,
  levels,
  totalCount,
  page,
  pageSize,
  currentLevelFilter,
  currentStatusFilter,
}: StudentsTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [promoteLevelId, setPromoteLevelId] = useState('');
  const [isBulkPending, startBulkTransition] = useTransition();

  // Add Student modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRoll, setAddRoll] = useState('');
  const [addDob, setAddDob] = useState('');
  const [addLevelId, setAddLevelId] = useState('');
  const [addError, setAddError] = useState('');
  const [isAddPending, startAddTransition] = useTransition();

  // Client-side search
  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.roll_number.toLowerCase().includes(q),
    );
  }, [students, search]);

  const allSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((s) => s.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams();
    const current: Record<string, string> = {
      level_id: currentLevelFilter,
      status: currentStatusFilter,
      page: String(page),
    };
    const merged = { ...current, ...updates };
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== 'all' && v !== '0') params.set(k, v);
    }
    return `${pathname}?${params.toString()}`;
  }

  function setFilter(key: string, value: string) {
    router.push(buildUrl({ [key]: value, page: '1' }));
  }

  function goToPage(p: number) {
    router.push(buildUrl({ page: String(p) }));
  }

  function clearFilters() {
    router.push(pathname);
  }

  async function handleBulkPromote() {
    if (!promoteLevelId || selected.size === 0) return;
    startBulkTransition(async () => {
      await Promise.all(
        [...selected].map((id) =>
          updateStudent({ student_id: id, level_id: promoteLevelId }),
        ),
      );
      setSelected(new Set());
      setPromoteLevelId('');
      router.refresh();
    });
  }

  async function handleBulkSuspend() {
    if (selected.size === 0) return;
    startBulkTransition(async () => {
      await Promise.all(
        [...selected].map((id) => deactivateStudent({ student_id: id })),
      );
      setSelected(new Set());
      router.refresh();
    });
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !addRoll.trim() || !addLevelId) {
      setAddError('Name, roll number, and level are required.');
      return;
    }
    setAddError('');
    startAddTransition(async () => {
      const result = await createStudent({
        full_name: addName.trim(),
        roll_number: addRoll.trim(),
        date_of_birth: addDob || undefined,
        level_id: addLevelId,
        send_invite: false,
      });
      if (!result.ok) {
        setAddError(result.message ?? result.error ?? 'Failed to create student.');
        return;
      }
      setAddOpen(false);
      setAddName('');
      setAddRoll('');
      setAddDob('');
      setAddLevelId('');
      router.refresh();
    });
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasFilters = !!currentLevelFilter || !!currentStatusFilter;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Students</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button className="bg-green-800 hover:bg-green-700 text-white gap-2" />
            }
          >
            <UserPlus className="h-4 w-4" />
            Add Student
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-name">Full Name *</Label>
                <Input
                  id="add-name"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Arun Kumar"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-roll">Roll Number *</Label>
                <Input
                  id="add-roll"
                  value={addRoll}
                  onChange={(e) => setAddRoll(e.target.value)}
                  placeholder="e.g. STUDENT-001"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-dob">Date of Birth</Label>
                <Input
                  id="add-dob"
                  type="date"
                  value={addDob}
                  onChange={(e) => setAddDob(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Level *</Label>
                <Select value={addLevelId} onValueChange={(v) => v && setAddLevelId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {addError && (
                <p className="text-xs text-red-600">{addError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddPending}
                  className="bg-green-800 hover:bg-green-700 text-white"
                >
                  {isAddPending ? 'Creating…' : 'Create Student'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name or roll number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-64 text-sm"
        />
        <Select
          value={currentLevelFilter || 'all'}
          onValueChange={(v) => setFilter('level_id', v === 'all' || !v ? '' : v)}
        >
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentStatusFilter || 'all'}
          onValueChange={(v) => setFilter('status', v === 'all' || !v ? '' : v)}
        >
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Clear filters
          </button>
        )}
        <div className="ml-auto text-xs text-slate-500 tabular-nums">
          {totalCount} student{totalCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
          <span className="text-sm font-medium text-slate-700 shrink-0">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Select value={promoteLevelId} onValueChange={(v) => v && setPromoteLevelId(v)}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Select level…" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-8 bg-green-800 hover:bg-green-700 text-white text-xs"
              onClick={handleBulkPromote}
              disabled={!promoteLevelId || isBulkPending}
            >
              Promote
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-50"
            onClick={handleBulkSuspend}
            disabled={isBulkPending}
          >
            Suspend
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => alert('CSV export coming soon')}
          >
            Export
          </Button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-slate-400 hover:text-slate-600"
            aria-label="Dismiss selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-slate-200 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-10 px-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 accent-green-800"
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-sm text-slate-400"
                >
                  {search ? 'No students match your search.' : 'No students found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student) => {
                const isActive = student.deleted_at === null;
                const colour = avatarColour(student.full_name);
                return (
                  <TableRow
                    key={student.id}
                    className={selected.has(student.id) ? 'bg-green-50' : undefined}
                  >
                    <TableCell className="px-4">
                      <input
                        type="checkbox"
                        checked={selected.has(student.id)}
                        onChange={() => toggleOne(student.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-green-800"
                        aria-label={`Select ${student.full_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${colour}`}
                      >
                        {initials(student.full_name)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {student.full_name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-secondary">
                      {student.roll_number}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {student.levels?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 tabular-nums">
                      {new Date(student.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-xs font-medium text-green-800 hover:text-green-700 transition-colors"
                      >
                        View →
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
