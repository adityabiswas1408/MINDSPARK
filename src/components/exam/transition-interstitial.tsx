'use client';

import { useEffect, useRef, useState } from 'react';
import { INTERSTITIAL_MS } from '@/lib/constants';

interface TransitionInterstitialProps {
  /** Called when the 3000ms interstitial completes */
  onComplete: () => void;
}

/**
 * 3-second transition interstitial between INTERSTITIAL → PHASE_1_START.
 *
 * Features:
 *   - "Get Ready" heading: DM Sans 22px 700
 *   - Progress bar: 3px fill, 3s linear
 *   - Web Audio API metronome: 880Hz sine, 80ms, 3 beats at t=500/1000/1500ms
 *   - NO mp3 file, NO setTimeout for duration, RAF-based timing
 *   - Suppressed audio if prefers-reduced-motion
 */
export function TransitionInterstitial({ onComplete }: TransitionInterstitialProps) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const startTime = performance.now();
    const duration = INTERSTITIAL_MS;
    let animFrame: number;

    // ---- Web Audio metronome ----
    // Beats at 500ms, 1000ms, 1500ms from start
    const BEAT_TIMES = [500, 1000, 1500];
    const beatsPlayed = new Set<number>();

    let audioCtx: AudioContext | null = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      try {
        audioCtx = new AudioContext();
      } catch {
        // Audio not available — continue without sound
      }
    }

    function playBeat() {
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880; // A5
        gain.gain.value = 0.3;
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        osc.start(now);
        // 80ms duration — rapid tick
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.stop(now + 0.08);
      } catch {
        // Swallow — audio is non-critical
      }
    }

    function tick(now: number) {
      const elapsed = now - startTime;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct);

      // Fire beats at scheduled times
      for (const beatTime of BEAT_TIMES) {
        if (elapsed >= beatTime && !beatsPlayed.has(beatTime)) {
          beatsPlayed.add(beatTime);
          playBeat();
        }
      }

      if (elapsed >= duration) {
        onCompleteRef.current();
        return;
      }

      animFrame = requestAnimationFrame(tick);
    }

    animFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrame);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      data-testid="interstitial"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: '#FFFFFF' }}
      role="alert"
      aria-label="Get ready — exam starting soon"
    >
      {/* Abacus icon placeholder — 80px centered */}
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#F0FDF4',
        }}
        aria-hidden="true"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {/* Simple abacus representation */}
          <rect x="6" y="4" width="28" height="32" rx="3" stroke="#1A3829" strokeWidth="2" fill="none" />
          {/* Rods */}
          <line x1="6" y1="14" x2="34" y2="14" stroke="#1A3829" strokeWidth="1.5" />
          <line x1="6" y1="22" x2="34" y2="22" stroke="#1A3829" strokeWidth="1.5" />
          <line x1="6" y1="30" x2="34" y2="30" stroke="#1A3829" strokeWidth="1.5" />
          {/* Beads */}
          <circle cx="14" cy="14" r="3" fill="#1A3829" />
          <circle cx="22" cy="14" r="3" fill="#1A3829" />
          <circle cx="18" cy="22" r="3" fill="#1A3829" />
          <circle cx="26" cy="22" r="3" fill="#1A3829" />
          <circle cx="12" cy="30" r="3" fill="#1A3829" />
          <circle cx="20" cy="30" r="3" fill="#1A3829" />
          <circle cx="28" cy="30" r="3" fill="#1A3829" />
        </svg>
      </div>

      <h2
        className="font-semibold"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '22px',
          fontWeight: 700,
          color: '#0F172A',
        }}
      >
        Get Ready
      </h2>

      {/* Progress bar — 3px fill, 3s linear */}
      <div
        className="overflow-hidden rounded-full"
        style={{
          width: '200px',
          height: '3px',
          backgroundColor: '#E2E8F0',
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: '#1A3829',
            transition: 'none', // RAF-driven, not CSS transition
          }}
        />
      </div>
    </div>
  );
}
