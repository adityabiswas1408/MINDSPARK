import type { Metadata } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

/**
 * DM Sans — all UI text (labels, buttons, nav, body copy).
 * variable: '--font-sans' — consumed by tailwind.config.ts fontFamily.sans
 */
const dmSans = DM_Sans({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700'],
  variable: '--font-sans',
  display:  'swap',
});

/**
 * DM Mono — all numeric values (scores, timers, roll numbers, flash numbers).
 * variable: '--font-mono' — consumed by tailwind.config.ts fontFamily.mono
 * Applied to <html> so --font-mono is available to every element in the tree
 * including server components that render above <body>.
 */
const dmMono = DM_Mono({
  subsets:  ['latin'],
  weight:   ['400', '500'],
  variable: '--font-mono',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'MINDSPARK',
  description: 'WCAG 2.2 AAA Accessible Mental Arithmetic Assessment Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * Both font variables must be on <html> so CSS custom properties
     * --font-sans and --font-mono resolve correctly for every descendant.
     * font-sans class ensures DM Sans is the default body font via Tailwind.
     */
    <html
      lang="en"
      className={cn('font-sans', dmSans.variable, dmMono.variable)}
    >
      <body
        className={cn(
          dmSans.variable,
          dmMono.variable,
          'font-sans antialiased bg-page min-h-screen'
        )}
        style={{ color: 'var(--text-secondary)' }}
      >
        {/*
         * Skip link — WCAG 2.2 SC 2.4.1 (Bypass Blocks).
         * Visually hidden until keyboard focused.
         * Must be the first focusable element in the DOM.
         */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[9999] bg-white text-green-800 px-4 py-3 shadow-lg rounded-md border-2 border-green-800 outline-none font-semibold text-sm"
        >
          Skip to main content
        </a>

        {/*
         * Main landmark — tabIndex={-1} allows programmatic focus on
         * route changes (use-route-focus.ts) without adding to tab order.
         */}
        <main
          id="main-content"
          tabIndex={-1}
          className="outline-none h-full min-h-screen"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
