import { requireRole } from '@/lib/auth/rbac';

export default async function StudentResultDetailPage() {
  const authResult = await requireRole('student');
  if ('error' in authResult) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Result Details</h1>
      <div className="p-4 bg-card rounded-md border border-slate-200 shadow-sm">
        <p className="text-secondary">Detailed breakdown will appear here.</p>
      </div>
    </div>
  );
}
