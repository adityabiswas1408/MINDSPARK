import { EmptyState } from '@/components/shared/empty-state';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Settings</h1>
      <div className="max-w-xl mx-auto mt-12">
        <EmptyState 
          icon={<Settings size={48} />}
          title="Institution Settings"
          description="Manage configuration, roles, and security policies."
        />
      </div>
    </div>
  );
}
