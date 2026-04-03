import { requireRole } from '@/lib/auth/rbac';
import { Lock } from 'lucide-react';

export default async function StudentResultsPage() {
  const authResult = await requireRole('student');
  if ('error' in authResult) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">My Results</h1>
      <div className="p-4 bg-card rounded-md border border-slate-200 shadow-sm">
        {/* Example pending result per requirements */}
        <div 
          className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 opacity-50 pointer-events-none" 
          aria-disabled="true"
        >
          <div>
            <span className="font-semibold text-primary block">Regional Final 2026</span>
            <span className="text-xs text-slate-500">Pending Teacher Review</span>
          </div>
          <Lock className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
