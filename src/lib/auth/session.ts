'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-side layout guard ensuring the user is not actively forced to reset 
 * passwords, and logging them out if they cross the institution's idle timeout.
 */
export function useSessionGuard() {
  const router = useRouter();
  const lastActivity = useRef<number>(Date.now());

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    let timeoutInterval: NodeJS.Timeout;

    async function checkUserGating() {
      // Must use getUser to ensure we get a trusted server-validated session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Middleware handles raw unauthenticated redirects

      // 1. Forced Password Reset Gate & Timeout Config (Single joined query)
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          forced_password_reset,
          institutions (
            session_timeout_seconds
          )
        `)
        .eq('id', user.id)
        .single();

      if (profile?.forced_password_reset) {
        if (isMounted) router.replace('/reset-password');
        return; // Halt execution if forced to reset
      }

      // Default to 1 hour (3600s) if DB value is missing
      const timeoutSeconds = 
        (profile?.institutions as { session_timeout_seconds: number } | null)?.session_timeout_seconds ?? 3600;
      
      const timeoutMs = timeoutSeconds * 1000;

      // 2. Poll every 10 seconds to detect idle expiration
      timeoutInterval = setInterval(async () => {
        if (Date.now() - lastActivity.current > timeoutMs) {
          clearInterval(timeoutInterval);
          await supabase.auth.signOut();
          if (isMounted) {
            router.replace('/login?reason=timeout');
          }
        }
      }, 10000);
    }

    checkUserGating();

    // 3. Activity Tracking (Ref-based, zero Zustand overhead)
    const handleActivity = () => {
      lastActivity.current = Date.now();
    };

    // Passive listeners for performance
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));

    // Cleanup
    return () => {
      isMounted = false;
      if (timeoutInterval) clearInterval(timeoutInterval);
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
    };
  }, [router]);
}
