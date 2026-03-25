import { EmptyState } from '@/components/shared/empty-state';
import { BarChart2 } from 'lucide-react';

export default function AdminResultsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Results</h1>
      <div className="max-w-xl mx-auto mt-12">
        <EmptyState 
          icon={<BarChart2 size={48} />}
          title="No Results Yet"
          description="Results will appear here after assessments are graded."
        />
      </div>
    </div>
  );
}
