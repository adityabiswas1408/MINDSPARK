'use client';

import { ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';

interface TopHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function TopHeader({ title, actions }: TopHeaderProps) {
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <header
      className="h-16 w-full flex items-center justify-between px-8 z-10 shrink-0"
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <h2
        className="font-sans text-[20px] font-bold truncate"
        style={{ color: '#0F172A' }}
      >
        {title}
      </h2>

      <div className="flex items-center gap-3">
        {actions && <div className="flex items-center gap-3">{actions}</div>}

        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          style={{ color: '#475569' }}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div
          className="h-8 w-px mx-1"
          style={{ backgroundColor: '#E2E8F0' }}
          aria-hidden="true"
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: '700',
              fontSize: '13px',
              color: '#1A3829',
              outline: 'none',
              flexShrink: 0,
            }}
            aria-label="User menu"
          >
            PS
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" style={{ minWidth: '160px' }}>
            <DropdownMenuItem
              onClick={() => router.push('/admin/settings')}
              style={{ cursor: 'pointer' }}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              style={{ color: '#DC2626', cursor: 'pointer', fontWeight: '500' }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
