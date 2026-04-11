import type { Config } from "tailwindcss";

/**
 * Tailwind v4 minimal config.
 *
 * Single source of truth for colour tokens: `src/app/globals.css`
 * `@theme inline { ... }` block. DO NOT re-declare colours here —
 * Tailwind v4 reads them from CSS vars in globals.css.
 *
 * fontFamily is kept here because next/font supplies CSS vars
 * (--font-sans, --font-mono) that this config wires into Tailwind's
 * font utility classes.
 */
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
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
} satisfies Config;

export default config;
