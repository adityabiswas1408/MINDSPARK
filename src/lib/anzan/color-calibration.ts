/**
 * Color Calibration — resolves the correct text colour for a flash number
 * based on its sign and the current flash interval.
 *
 * Plain TypeScript module — no React imports.
 */

import { getContrastTokens } from './timing-engine';

/**
 * Returns the CSS colour string for a flash number.
 *
 * @param n          - The number being displayed (sign determines colour).
 * @param intervalMs - Flash interval in ms (determines contrast tier).
 * @returns CSS hex colour string.
 *
 * Rules:
 *   - n < 0  → '#991B1B' (negative arithmetic operands — canonical colour, 9.7:1 AAA)
 *   - n >= 0 → contrast-tier text colour from getContrastTokens()
 */
export function getFlashNumberColor(n: number, intervalMs: number): string {
  if (n < 0) {
    // Negative arithmetic operands ONLY — CLAUDE.md Rule 8
    return '#991B1B';
  }

  return getContrastTokens(intervalMs).text;
}
