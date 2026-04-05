import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Backgrounds
        'bg-page':  '#F8FAFC',
        'bg-card':  '#FFFFFF',

        // Brand
        'green-800':      '#1A3829',
        'brand-navy':     '#204074',
        'brand-orange':   '#F57A39',

        // Text
        'text-primary':   '#0F172A',
        'text-secondary': '#475569',
        'text-subtle':    '#94A3B8',
        'text-negative':  '#991B1B',  // negative arithmetic numbers ONLY
        'text-danger':    '#DC2626',

        // Semantic states
        'success-bg':     '#DCFCE7',
        'success-text':   '#166534',
        'warning-bg':     '#FEF9C3',
        'warning-text':   '#854D0E',
        'error-bg':       '#FEE2E2',
        'error-text':     '#DC2626',
        'info-bg':        '#EFF6FF',
        'info-text':      '#1D4ED8',
        'live-badge':     '#EF4444',

        // Flash Anzan
        'flash-dampen-bg': '#F1F5F9',
        'flash-dampen-tx': '#334155',
        'flash-mid-bg':    '#F8FAFC',
        'flash-mid-tx':    '#1E293B',

        'slate-50':  '#F8FAFC',
        'slate-100': '#F1F5F9',
        'slate-200': '#E2E8F0',
        'slate-300': '#CBD5E1',
        'slate-400': '#94A3B8',
        'slate-500': '#64748B',
        'slate-600': '#475569',
        'slate-700': '#334155',
        'slate-800': '#1E293B',
        'slate-900': '#0F172A',
        'slate-950': '#020617',

        // BANNED COLORS - DO NOT USE:
        // #FF6B6B (Fails WCAG AA)
        // #1A1A1A (Banned everywhere)
        // #E0E0E0 (Banned everywhere)
        // #121212 (Banned background)
      },
      fontFamily: {
        sans:  ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-dm-mono)', 'monospace'],
      },
    },
  },
} satisfies Config;

export default config;
