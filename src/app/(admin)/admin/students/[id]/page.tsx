import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft } from 'lucide-react';
import {
  StudentProfileActions,
  type ProfileLevel,
} from '@/components/students/student-profile-actions';

const AVATAR_COLOURS = [
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
  return AVATAR_COLOURS[Math.abs(hash) % AVATAR_COLOURS.length];
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const authResult = await requireRole(['admin', 'teacher']);
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const supabase = await createClient();

  const [studentRes, levelsRes, submissionsRes] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name, roll_number, level_id, created_at, deleted_at, date_of_birth, levels(id, name, sequence_order)')
      .eq('id', id)
      .eq('institution_id', institutionId)
      .single(),

    supabase
      .from('levels')
      .select('id, name, sequence_order')
      .eq('institution_id', institutionId)
      .is('deleted_at', null)
      .order('sequence_order', { ascending: true }),

    supabase
      .from('submissions')
      .select('id, percentage, completed_at, exam_papers(title)')
      .eq('student_id', id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10),
  ]);

  if (studentRes.error || !studentRes.data) notFound();

  const student = studentRes.data;
  const levels: ProfileLevel[] = (levelsRes.data ?? []).map((l) => ({
    id: l.id as string,
    name: l.name as string,
    sequence_order: l.sequence_order as number,
  }));

  const submissions = submissionsRes.data ?? [];
  const isInactive = student.deleted_at !== null;

  // Compute avg score from history
  const scores = submissions.map((s) => Number(s.percentage)).filter((n) => !isNaN(n));
  const avgScore = scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : null;

  const levelData = Array.isArray(student.levels)
    ? (student.levels[0] as { id: string; name: string } | null) ?? null
    : (student.levels as { id: string; name: string } | null);

  const colour = avatarColour(student.full_name as string);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Students
      </Link>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5">
              {/* Avatar */}
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${colour}`}
              >
                {initials(student.full_name as string)}
              </div>

              {/* Name + status */}
              <div className="text-center">
                <h2 className="text-lg font-semibold text-primary leading-tight">
                  {student.full_name as string}
                </h2>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    isInactive ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {isInactive ? 'Inactive' : 'Active'}
                </span>
              </div>

              {/* Meta */}
              <div className="w-full space-y-1.5 pt-1 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Level</span>
                  <span className="font-medium text-primary">
                    {levelData?.name ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Roll No.</span>
                  <span className="font-mono text-secondary">
                    {student.roll_number as string}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Joined</span>
                  <span className="text-secondary tabular-nums">
                    {new Date(student.created_at as string).toLocaleDateString()}
                  </span>
                </div>
                {student.date_of_birth && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">DOB</span>
                    <span className="text-secondary tabular-nums">
                      {new Date(student.date_of_birth as string).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentProfileActions
                studentId={student.id as string}
                currentLevelId={student.level_id as string | null}
                isInactive={isInactive}
                levels={levels}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <Card className="border-slate-200">
          <CardContent className="pt-4">
            <Tabs defaultValue="academic">
              <TabsList>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Academic tab */}
              <TabsContent value="academic" className="mt-4 space-y-6">
                {/* Avg score stat */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono tabular-nums text-primary">
                    {avgScore !== null ? `${avgScore}%` : '—'}
                  </span>
                  <span className="text-sm text-slate-500">avg score across {scores.length} exam{scores.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Exam history table */}
                {submissions.length === 0 ? (
                  <p className="text-sm text-slate-400">No completed exams yet.</p>
                ) : (
                  <div className="rounded-md border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-medium text-slate-600">Exam</th>
                          <th className="px-4 py-2.5 text-right font-medium text-slate-600">Score</th>
                          <th className="px-4 py-2.5 text-right font-medium text-slate-600">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {submissions.map((sub) => {
                          const paper = Array.isArray(sub.exam_papers)
                            ? sub.exam_papers[0] as { title: string } | null
                            : sub.exam_papers as { title: string } | null;
                          const pct = Number(sub.percentage);
                          return (
                            <tr key={sub.id as string} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 text-primary">
                                {paper?.title ?? 'Untitled'}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    pct >= 80
                                      ? 'bg-green-100 text-green-800'
                                      : pct >= 50
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {isNaN(pct) ? '—' : `${pct.toFixed(1)}%`}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums text-xs">
                                {sub.completed_at
                                  ? new Date(sub.completed_at as string).toLocaleDateString()
                                  : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <p className="text-sm text-slate-400">Activity history coming soon.</p>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <p className="text-sm text-slate-400">Student settings coming soon.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
