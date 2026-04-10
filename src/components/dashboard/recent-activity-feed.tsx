import Link from 'next/link';
import { History } from 'lucide-react';

export interface ActivityItem {
  id: string;
  action_type: string;
  entity_type: string;
  timestamp: string;
}

export interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

const ACTION_COLOURS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN:  'bg-slate-100 text-slate-700',
};

function actionBadgeClass(actionType: string): string {
  const key = actionType.split('_')[0].toUpperCase();
  return ACTION_COLOURS[key] ?? 'bg-slate-100 text-slate-700';
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return <p className="text-sm text-slate-500">No recent activity.</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((act) => (
        <div key={act.id} className="flex items-start space-x-3 text-sm">
          <div className="mt-0.5 rounded-full bg-slate-100 p-1 shrink-0">
            <History className="h-3 w-3 text-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionBadgeClass(act.action_type)}`}
              >
                {act.action_type}
              </span>
              <span className="text-xs text-secondary truncate">{act.entity_type}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 font-mono tabular-nums">
              {new Date(act.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
      <div className="pt-1">
        <Link
          href="/admin/activity-log"
          className="text-xs font-medium text-green-800 hover:text-green-700 transition-colors"
        >
          View Full Log →
        </Link>
      </div>
    </div>
  );
}
