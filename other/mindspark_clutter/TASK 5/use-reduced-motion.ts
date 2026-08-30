'use client';

import { useState, useEffect } from 'react';

/**
 * Returns `true` when the user has requested reduced motion via OS/browser settings.
 *
 * Use to suppress decorative animations (confetti, breathing circle, skeleton shimmer,
 * card mount slide-up). Never gate functional feedback behind this — MCQ selection
 * state, timer updates, and network banner appearance are always instant.
 *
 * From 08_a11y.md §3:
 *   "All non-essential animations must be gated behind prefers-reduced-motion."
 *
 * @example
 * function SubmissionCard() {
 *   const reducedMotion = useReducedMotion();
 *   return (
 *     <>
 *       {!reducedMotion && <ConfettiCanvas />}
 *       <Card>...</Card>
 *     </>
 *   );
 * }
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    // Safe SSR default — assume no reduction on server.
    // Will be corrected on client hydration via the effect below.
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Sync immediately in case the value changed between SSR and hydration
    setPrefersReduced(mql.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
