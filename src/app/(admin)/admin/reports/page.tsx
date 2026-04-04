import { EmptyState } from '@/components/shared/empty-state';
import { PieChart } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Reports</h1>
      <div className="max-w-xl mx-auto mt-12">
        <EmptyState 
          icon={<PieChart size={48} />}
          title="Reports"
          description="Generate performance reports and analytics."
        />
      </div>
    </div>
  );
}
