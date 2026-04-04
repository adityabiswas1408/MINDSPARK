import { EmptyState } from '@/components/shared/empty-state';
import { Megaphone } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Announcements</h1>
      <div className="max-w-xl mx-auto mt-12">
        <EmptyState 
          icon={<Megaphone size={48} />}
          title="No Announcements"
          description="Publish announcements to notify students and teachers."
        />
      </div>
    </div>
  );
}
