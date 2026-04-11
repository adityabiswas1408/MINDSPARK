'use client';

import { Bell } from 'lucide-react';

interface StudentHeaderProps {
  fullName: string;
}

export function StudentHeader({ fullName }: StudentHeaderProps) {
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="flex items-center justify-between shrink-0 bg-card border-b border-slate-200"
      style={{
        height: '56px',
        padding: '0 24px',
      }}
    >
      <span
        className="font-sans"
        style={{ fontSize: '15px', color: 'var(--text-secondary)' }}
      >
        Welcome back,{' '}
        <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {fullName}
        </strong>
      </span>

      <div className="flex items-center" style={{ gap: '12px' }}>
        <button
          aria-label="Notifications"
          className="flex items-center justify-center bg-card border border-slate-200 hover:bg-slate-50 nav-transition"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          <Bell size={16} />
        </button>

        <div
          className="flex items-center justify-center shrink-0 font-sans"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--clr-green-800)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
