'use client';

import { useEffect, useRef } from 'react';

interface CompletionCardProps {
  /** Whether to show the completion card (must be SUBMITTED phase) */
  visible: boolean;
  /** Navigate to results page */
  onViewResults: () => void;
  /** Navigate back to student dashboard */
  onBackToDashboard: () => void;
  /** Assessment type for tailored messaging */
  assessmentType: 'EXAM' | 'TEST';
}

/**
 * Post-submission completion card.
 *
 * Rules from FSD:
 *   - White card, shadow-lg, checkmark icon
 *   - 400ms slide-up animation
 *   - Confetti: green palette, contained, 2000ms duration
 *   - Suppressed if prefers-reduced-motion
 */
export function CompletionCard({
  visible,
  onViewResults,
  onBackToDashboard,
  assessmentType,
}: CompletionCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti effect — suppressed with prefers-reduced-motion
  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Green palette confetti particles
    const COLORS = ['#166534', '#22C55E', '#DCFCE7', '#1A3829', '#4ADE80'];
    const particles: Array<{
      x: number; y: number; w: number; h: number;
      vx: number; vy: number; color: string; rotation: number; vr: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 40,
        w: 4 + Math.random() * 4,
        h: 6 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
      });
    }

    const startTime = performance.now();
    const DURATION = 2000;
    let animFrame: number;

    function draw(now: number) {
      const elapsed = now - startTime;
      if (elapsed > DURATION || !ctx || !canvas) {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const opacity = Math.max(0, 1 - elapsed / DURATION);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.vy += 0.1; // gravity

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      animFrame = requestAnimationFrame(draw);
    }

    animFrame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animFrame);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      data-testid="completion-card"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
    >
      {/* Confetti canvas — contained behind card */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      />

      <div
        className="relative flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-lg max-w-sm w-full text-center"
        style={{
          animation: 'completion-slide-up 400ms ease-out',
        }}
      >
        {/* Checkmark icon */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#DCFCE7',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M8 16L14 22L24 10"
              stroke="#166534"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-1">
          <h2
            className="text-xl font-semibold"
            style={{ color: '#0F172A' }}
          >
            {assessmentType === 'EXAM' ? 'Exam Submitted' : 'Test Complete'}
          </h2>
          <p className="text-sm" style={{ color: '#475569' }}>
            Your answers have been saved successfully.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onViewResults}
            className="flex items-center justify-center gap-2 rounded-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3829]"
            style={{
              height: '48px',
              backgroundColor: '#1A3829',
              color: '#FFFFFF',
            }}
          >
            View Results →
          </button>
          <button
            onClick={onBackToDashboard}
            className="flex items-center justify-center rounded-lg font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3829]"
            style={{
              height: '40px',
              color: '#475569',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
