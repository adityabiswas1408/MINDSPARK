'use client';

import { ReactNode } from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface TopHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function TopHeader({ title, actions }: TopHeaderProps) {
  return (
    <header className="h-16 w-full border-b border-slate-200 bg-card flex items-center justify-between px-8 z-10 shrink-0">
      <h2 className="font-sans text-[20px] font-bold text-primary truncate">
        {title}
      </h2>

      <div className="flex items-center space-x-4">
        {actions && <div className="flex items-center space-x-3">{actions}</div>}

        <Button variant="ghost" size="icon" aria-label="Search Command Palette" className="text-secondary hover:text-primary">
          <Search className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="text-secondary hover:text-primary">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div className="h-8 w-px bg-slate-200 mx-1" aria-hidden="true" />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-green-800 outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-1">
              AD
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-sans">
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-danger">Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
