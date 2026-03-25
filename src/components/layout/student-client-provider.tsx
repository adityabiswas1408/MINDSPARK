'use client';
import { useEffect } from 'react';
import { startSyncEngine, stopSyncEngine } from '@/lib/offline/sync-engine';
import { useSessionGuard } from '@/lib/auth/session';

export function StudentClientProvider({ children }: { children: React.ReactNode }) {
  useSessionGuard();

  useEffect(() => {
    startSyncEngine();
    return () => {
      stopSyncEngine();
    };
  }, []);

  return <>{children}</>;
}
