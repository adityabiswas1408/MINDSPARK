import { requireRole } from '@/lib/auth/rbac';

export default async function StudentTestsPage() {
  const authResult = await requireRole('student');
  if ('error' in authResult) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Practice Tests</h1>
      <div className="p-4 bg-card rounded-md border border-slate-200 shadow-sm">
        <p className="text-secondary">No practice tests available.</p>
      </div>
    </div>
  );
}
