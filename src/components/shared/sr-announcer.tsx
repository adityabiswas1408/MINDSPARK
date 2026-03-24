'use client'; 

import React, { useState, useImperativeHandle, forwardRef } from 'react';

export interface SRAnnouncerHandle {
  announce: (msg: string) => void;
}

function sanitizeForSR(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export const SRAnnouncer = forwardRef<SRAnnouncerHandle, Record<string, never>>((_, ref) => {
  const [message, setMessage] = useState<string>('');

  useImperativeHandle(ref, () => ({
    announce(msg: string) {
        setMessage(''); 
        requestAnimationFrame(() => setMessage(sanitizeForSR(msg)));
    }
  }));

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      aria-relevant="additions"
      className="sr-only"
    >
      {message}
    </div>
  );
});

SRAnnouncer.displayName = 'SRAnnouncer';
