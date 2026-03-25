'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Users, Layers, FileText, Activity, 
  BarChart2, Megaphone, PieChart, History, Settings 
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/students', icon: Users, label: 'Students' },
  { href: '/admin/levels', icon: Layers, label: 'Levels' },
  { href: '/admin/assessments', icon: FileText, label: 'Assessments' },
  { href: '/admin/monitor', icon: Activity, label: 'Live Monitor' },
  { href: '/admin/results', icon: BarChart2, label: 'Results' },
  { href: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/admin/reports', icon: PieChart, label: 'Reports' },
  { href: '/admin/activity-log', icon: History, label: 'Activity Log' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] h-screen border-r border-slate-200 bg-card hidden md:flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
        <h1 className="font-sans font-bold text-[20px] text-green-800 tracking-tight">MINDSPARK</h1>
      </div>
      
      <nav role="navigation" aria-label="Admin Sidebar" className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "flex items-center px-4 py-3 rounded-[10px] font-sans text-[15px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-1",
                isActive 
                  ? "bg-green-800/10 text-green-800" 
                  : "text-secondary hover:bg-slate-100 hover:text-primary"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-green-800" : "text-slate-400")} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
