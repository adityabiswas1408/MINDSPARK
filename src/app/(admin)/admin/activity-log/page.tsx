import { EmptyState } from '@/components/shared/empty-state';
import { History } from 'lucide-react';

export default function AdminActivityLogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Activity Log</h1>
      <div className="max-w-xl mx-auto mt-12">
        <EmptyState 
          icon={<History size={48} />}
          title="System Activity"
          description="View comprehensive audit logs for all security actions."
        />
      </div>
    </div>
  );
}
