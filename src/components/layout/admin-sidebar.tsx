'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Layers, ClipboardList,
  Monitor, BarChart2, Megaphone, FileText,
  ActivitySquare, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/students',      label: 'Students',       icon: Users           },
  { href: '/admin/levels',        label: 'Levels',         icon: Layers          },
  { href: '/admin/assessments',   label: 'Assessments',    icon: ClipboardList   },
  { href: '/admin/monitor',       label: 'Live Monitor',   icon: Monitor         },
  { href: '/admin/results',       label: 'Results',        icon: BarChart2       },
  { href: '/admin/announcements', label: 'Announcements',  icon: Megaphone       },
  { href: '/admin/reports',       label: 'Reports',        icon: FileText        },
  { href: '/admin/activity-log',  label: 'Activity Log',   icon: ActivitySquare  },
  { href: '/admin/settings',      label: 'Settings',       icon: Settings        },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    /* admin-sidebar class in globals.css sets display:flex and hides on mobile.
       We avoid hidden md:flex because of Tailwind v4 cascade ordering bug where
       display:none from hidden overrides the responsive md:flex rule.
       Width 240px per 07_hifi-spec §4.6. */
    <aside
      className="admin-sidebar w-[240px] h-screen shrink-0 flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Logo bar */}
      <div className="h-16 flex items-center px-6 shrink-0 border-b border-sidebar-border">
        <h1 className="font-sans font-bold text-[20px] text-sidebar-foreground tracking-tight">
          MINDSPARK
        </h1>
      </div>

      {/* Navigation */}
      <nav
        role="navigation"
        aria-label="Admin navigation"
        className="flex-1 overflow-y-auto px-3 py-5 space-y-1"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'nav-transition flex items-center gap-3 px-3 py-2 rounded-[10px] text-[14px] font-medium',
                'outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1',
                'no-underline',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="shrink-0 h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
