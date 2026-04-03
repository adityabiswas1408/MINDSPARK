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
          <DropdownMenuTrigger
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: '700',
              fontSize: '14px',
              color: '#1A3829',
              outline: 'none',
            }}
          >
            PS
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Change Password</DropdownMenuItem>
            <DropdownMenuItem style={{ color: '#DC2626' }}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
