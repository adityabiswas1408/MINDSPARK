'use client';

import { useEffect } from 'react';
import { useSessionGuard } from '@/lib/auth/session';
import { startSyncEngine, stopSyncEngine } from '@/lib/offline/sync-engine';

export function AdminClientProvider() {
  useSessionGuard();

  useEffect(() => {
    startSyncEngine();
    return () => {
      if (typeof stopSyncEngine === 'function') {
        stopSyncEngine();
      }
    };
  }, []);

  return null;
}
