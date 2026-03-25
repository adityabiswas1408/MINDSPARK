import { History } from 'lucide-react';

export interface ActivityItem {
  id: string;
  action_type: string;
  entity_type: string;
  created_at: string;
}

export interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return <p className="text-sm text-slate-500">No recent activity.</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex items-start space-x-3 text-sm">
          <div className="mt-0.5 rounded-full bg-slate-100 p-1">
            <History className="h-3 w-3 text-secondary" />
          </div>
          <div>
            <p className="font-medium text-primary">{act.action_type}</p>
            <p className="text-xs text-secondary font-mono">{new Date(act.created_at).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
