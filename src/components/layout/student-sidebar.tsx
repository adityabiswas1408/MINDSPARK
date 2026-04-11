'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Zap, BarChart2,
  User, Settings, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/exams',     label: 'Exams',     icon: BookOpen },
  { href: '/student/tests',     label: 'Tests',     icon: Zap },
  { href: '/student/results',   label: 'Results',   icon: BarChart2 },
  { href: '/student/profile',   label: 'Profile',   icon: User },
];

const BOTTOM_ITEMS = [
  { href: '/student/settings', label: 'Settings', icon: Settings },
  { href: '/student/support',  label: 'Support',  icon: HelpCircle },
];

export function StudentSidebar() {
  const pathname = usePathname();

  const renderLink = (item: { href: string; label: string; icon: React.ElementType }) => {
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
  };

  return (
    <aside
      className="student-sidebar w-[240px] h-screen shrink-0 flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 shrink-0 border-b border-sidebar-border">
        <h1 className="font-sans font-bold text-[20px] text-sidebar-foreground tracking-tight">
          MINDSPARK
        </h1>
      </div>

      {/* Main nav */}
      <nav
        role="navigation"
        aria-label="Student navigation"
        className="flex-1 overflow-y-auto px-3 py-5 space-y-1"
      >
        {NAV_ITEMS.map(renderLink)}
      </nav>

      {/* Bottom nav */}
      <div
        className="px-3 pb-5 space-y-1 border-t border-sidebar-border"
        style={{ paddingTop: '12px' }}
      >
        {BOTTOM_ITEMS.map(renderLink)}
      </div>
    </aside>
  );
}
