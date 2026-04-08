'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

interface StudentHeaderProps {
  fullName: string;
}

export function StudentHeader({ fullName }: StudentHeaderProps) {
  const [bellHover, setBellHover] = useState(false);
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '15px', color: '#475569' }}>
        Welcome back,{' '}
        <strong style={{ color: '#0F172A', fontWeight: '600' }}>{fullName}</strong>
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          aria-label="Notifications"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            backgroundColor: bellHover ? '#F8FAFC' : '#FFFFFF',
            cursor: 'pointer',
            color: '#475569',
          }}
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
        >
          <Bell size={16} />
        </button>

        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#1A3829',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '600',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
