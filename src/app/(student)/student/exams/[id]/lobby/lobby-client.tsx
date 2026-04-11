'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initSession } from '@/app/actions/assessment-sessions';
import { createClient } from '@/lib/supabase/client';

interface LobbyClientProps {
  paperId: string;
  examTitle: string;
  openedAt: string; // ISO string
  durationMinutes: number;
  consentVerified: boolean;
}

/**
 * Network health — three-state per 07_hifi-spec §6.
 * `optimal`  — full connectivity, < 500ms latency probe
 * `degraded` — online but slow, 500..2000ms latency probe
 * `severed`  — offline or probe failed
 */
type NetworkState = 'optimal' | 'degraded' | 'severed';

export function LobbyClient({
  paperId,
  examTitle,
  openedAt,
  durationMinutes,
  consentVerified,
}: LobbyClientProps) {
  const router = useRouter();
  const navigated = useRef(false);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null);
  const [networkState, setNetworkState] = useState<NetworkState>('optimal');
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Probe network latency to classify the three states.
  const probeNetwork = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!navigator.onLine) {
      setNetworkState('severed');
      return;
    }
    const started = performance.now();
    try {
      const res = await fetch('/favicon.ico', { cache: 'no-store', method: 'HEAD' });
      const elapsed = performance.now() - started;
      if (!res.ok) {
        setNetworkState('severed');
      } else if (elapsed < 500) {
        setNetworkState('optimal');
      } else if (elapsed < 2000) {
        setNetworkState('degraded');
      } else {
        setNetworkState('degraded');
      }
    } catch {
      setNetworkState('severed');
    }
  }, []);

  useEffect(() => {
    probeNetwork();
    const handleOnline = () => probeNetwork();
    const handleOffline = () => setNetworkState('severed');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const probeInterval = setInterval(probeNetwork, 15_000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(probeInterval);
    };
  }, [probeNetwork]);

  useEffect(() => {
    const openedAtMs = new Date(openedAt).getTime();
    const durationMs = durationMinutes * 60000;
    const endMs = openedAtMs + durationMs;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, endMs - now);
      setTimeRemainingMs(remaining);

      if (remaining === 0) {
        if (!navigated.current) {
          navigated.current = true;
          router.push('/student/exams');
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [openedAt, durationMinutes, router]);

  // 30-second polling fallback — catches CLOSED state if realtime broadcast is missed
  useEffect(() => {
    const supabase = createClient();
    const pollIntervalId = setInterval(async () => {
      const { data } = await supabase
        .from('exam_papers')
        .select('status')
        .eq('id', paperId)
        .single();

      if (data?.status === 'CLOSED' && !navigated.current) {
        navigated.current = true;
        router.push('/student/exams');
      }
    }, 30000);

    return () => clearInterval(pollIntervalId);
  }, [paperId, router]);

  const handleStart = async () => {
    setIsStarting(true);
    setStartError(null);
    const result = await initSession({ paper_id: paperId });

    if (result.ok) {
      router.push(`/student/exams/${paperId}`);
    } else {
      setIsStarting(false);
      setStartError(result.message || result.error || 'Unknown error starting session.');
    }
  };

  const formatTime = (ms: number | null) => {
    if (ms === null) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const networkConfig: Record<NetworkState, { bg: string; fg: string; border: string; label: string; sub: string; dot: string }> = {
    optimal: {
      bg: 'var(--bg-success)',
      fg: 'var(--text-success)',
      border: 'var(--clr-green-200)',
      label: 'OPTIMAL',
      sub: 'Latency < 500ms',
      dot: 'var(--clr-green-500)',
    },
    degraded: {
      bg: 'var(--bg-warning)',
      fg: 'var(--text-warning)',
      border: '#FDE68A',
      label: 'DEGRADED',
      sub: 'Slow connection',
      dot: 'var(--border-timer-urgent)',
    },
    severed: {
      bg: 'var(--bg-error)',
      fg: 'var(--text-error)',
      border: '#FECACA',
      label: 'OFFLINE',
      sub: 'Reconnect to continue',
      dot: 'var(--text-error)',
    },
  };
  const net = networkConfig[networkState];

  const readyDisabled =
    networkState === 'severed' ||
    !consentVerified ||
    isStarting ||
    (timeRemainingMs !== null && timeRemainingMs <= 0);

  return (
    <div className="flex flex-col items-center text-center" style={{ gap: '32px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Breathing circle — 120px per spec §6. The `breathing-circle`
          class in globals.css applies a 4s ease-in-out scale animation
          when prefers-reduced-motion: no-preference. */}
      <div
        className="breathing-circle"
        aria-hidden="true"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '2px solid rgba(26, 56, 41, 0.30)',
          backgroundColor: 'rgba(26, 56, 41, 0.04)',
        }}
      />

      {/* Countdown — below the breathing circle, DM Mono 72px 700 per spec */}
      <div
        className="font-mono tabular-nums"
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '72px',
          fontWeight: 700,
          color: 'var(--clr-green-800)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: 0,
        }}
      >
        {formatTime(timeRemainingMs)}
      </div>
      <div
        className="uppercase font-sans"
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-subtle)',
          letterSpacing: '0.1em',
          marginTop: '-16px',
        }}
      >
        Time Remaining
      </div>

      {/* Title */}
      <div>
        <h2
          className="font-sans"
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          {examTitle}
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Prepare your workspace. The assessment will begin when you click I&apos;m Ready.
        </p>
      </div>

      {/* Three-state network indicator */}
      <div
        className="inline-flex items-center font-sans"
        style={{
          backgroundColor: net.bg,
          color: net.fg,
          border: `1px solid ${net.border}`,
          padding: '10px 18px',
          borderRadius: 'var(--radius-pill)',
          gap: '12px',
        }}
      >
        <span
          className="inline-block rounded-full"
          style={{ width: '8px', height: '8px', backgroundColor: net.dot }}
        />
        <Wifi size={16} aria-hidden="true" />
        <div className="text-left">
          <div
            className="uppercase"
            style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}
          >
            {net.label}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>{net.sub}</div>
        </div>
      </div>

      {/* Consent status */}
      <div
        className="inline-flex items-center font-sans"
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          gap: '8px',
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: consentVerified ? 'var(--bg-success)' : 'var(--color-slate-100)',
          }}
        >
          {consentVerified ? (
            <Check size={12} color="var(--text-success)" strokeWidth={3} />
          ) : (
            <span
              className="rounded-full"
              style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-slate-400)' }}
            />
          )}
        </div>
        Academic Integrity Policy Signed
      </div>

      {/* Inline error pill (replaces previous native alert()) */}
      {startError && (
        <div
          className="font-sans text-center"
          role="alert"
          style={{
            backgroundColor: 'var(--bg-error)',
            color: 'var(--text-error)',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-btn)',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {startError}
        </div>
      )}

      {/* Single I'm Ready CTA */}
      <Button
        onClick={handleStart}
        disabled={readyDisabled}
        size="xl"
        style={{
          width: '100%',
          maxWidth: '320px',
          backgroundColor: 'var(--clr-green-800)',
          color: '#FFFFFF',
          fontWeight: 600,
          borderRadius: 'var(--radius-btn)',
        }}
      >
        {isStarting ? 'Preparing Session…' : "I'm Ready →"}
      </Button>

      <div
        className="font-sans text-center"
        style={{ fontSize: '12px', color: 'var(--text-subtle)', maxWidth: '320px' }}
      >
        By clicking &quot;I&apos;m Ready&quot;, you agree to begin the assessment under monitored
        conditions.
      </div>
    </div>
  );
}
