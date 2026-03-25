import Link from 'next/link';
import { Activity } from 'lucide-react';

export interface LivePulseProps {
  paperId: string;
  examTitle: string;
  studentCount: number;
}

export function LivePulse({ paperId, examTitle, studentCount }: LivePulseProps) {
  return (
    <Link 
      href={`/admin/monitor/${paperId}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[10px] bg-card border border-slate-200 p-4 transition-all hover:shadow-md hover:border-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2"
      aria-label={`Live Monitor for ${examTitle} with ${studentCount} active students`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-sans text-[15px] font-semibold text-primary leading-tight">
            {examTitle}
          </h3>
          <p className="font-sans text-xs text-secondary font-medium flex items-center">
            <span className="font-mono tabular-nums text-green-800 bg-green-100 px-1 py-0.5 rounded-[4px] mr-1.5 inline-block">
              {studentCount}
            </span>
            Active Students
          </p>
        </div>

        {/* Pulse Ring Indicator leveraging globals.css safe animation defaults */}
        <div className="relative flex h-3 w-3 mt-1 mr-1" aria-hidden="true">
          <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
        </div>
      </div>

      <div className="mt-4 flex items-center text-xs font-semibold text-green-800 group-hover:text-green-700 transition-colors">
        <Activity className="h-3.5 w-3.5 mr-1.5" />
        Join Monitoring Lobby &rarr;
      </div>
    </Link>
  );
}
