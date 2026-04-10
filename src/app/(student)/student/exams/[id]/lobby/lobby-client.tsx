'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isOnline, setIsOnline] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(typeof window !== 'undefined' && navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const openedAtMs = new Date(openedAt).getTime();
    const durationMs = durationMinutes * 60000;
    const endMs = openedAtMs + durationMs;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, endMs - now);
      setTimeRemainingMs(remaining);

      if (remaining === 0) {
        // Auto navigate when exam is over
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
      // LIVE, PUBLISHED, DRAFT → no-op
    }, 30000);

    return () => clearInterval(pollIntervalId);
  }, [paperId, router]);

  const handleStart = async () => {
    setIsStarting(true);
    const result = await initSession({ paper_id: paperId });
    
    if (result.ok) {
      router.push(`/student/exams/${paperId}`);
    } else {
      setIsStarting(false);
      console.error(result.error || 'Failed to initialize session');
      alert(`Failed to start session: ${result.message || result.error || 'Unknown error'}`);
    }
  };

  // Format time remaining MM:SS
  const formatTime = (ms: number | null) => {
    if (ms === null) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
      {/* LEFT SIDE - Countdown */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '4px solid #1A3829',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1A3829', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeRemainingMs)}
          </span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em', marginBottom: '16px' }}>
          TIME REMAINING
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '8px' }}>
          {examTitle}
        </h2>
        <p style={{ fontSize: '15px', color: '#475569', maxWidth: '320px', lineHeight: 1.5 }}>
          Prepare your workspace. The assessment will begin when you click I&apos;m Ready.
        </p>
      </div>

      {/* RIGHT SIDE - Checklist */}
      <div style={{ width: '400px', flexShrink: 0 }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: '600' }}>
              <Wifi size={20} style={{ color: isOnline ? '#16A34A' : '#DC2626' }} />
              Network Connection
            </div>
            {isOnline ? (
              <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.04em' }}>
                STABLE
              </span>
            ) : (
              <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.04em' }}>
                OFFLINE
              </span>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em', marginBottom: '16px' }}>
              PRE-FLIGHT CHECKLIST
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#0F172A' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#16A34A" strokeWidth={3} />
                </div>
                Camera & Microphone Access
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#0F172A' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="#16A34A" strokeWidth={3} />
                </div>
                Secure Browser Environment
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#0F172A' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: consentVerified ? '#DCFCE7' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {consentVerified ? <Check size={12} color="#16A34A" strokeWidth={3} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />}
                </div>
                Academic Integrity Policy Signed
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStart}
            disabled={!isOnline || !consentVerified || isStarting || (timeRemainingMs !== null && timeRemainingMs <= 0)}
            style={{
              width: '100%',
              backgroundColor: '#1A3829',
              color: '#FFFFFF',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '8px',
            }}
          >
            {isStarting ? 'Preparing Session...' : "I'm Ready →"}
          </Button>
          
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#64748B' }}>
            By clicking &quot;I&apos;m Ready&quot;, you agree to begin the assessment under monitored conditions.
          </div>
        </div>
      </div>
    </div>
  );
}
