# MINDSPARK Design System

Canonical design spec for the MINDSPARK mental arithmetic assessment
platform. Derived from `abacus-edge-design-spec (4).html` §28 + the
07_hifi-spec.md + the Tier 1–5 implementation in `src/`.

Use this file as the source of truth when writing Stitch prompts, new
components, or new pages. Every token here is already wired in
`src/app/globals.css`.

---

## Brand

- **Product name:** MINDSPARK
- **Category:** Mental arithmetic assessment platform for ages 6–18
- **Visual language:** Unified Forest Green light theme (admin + student
  share one system)
- **Tone:** Clean, trustworthy, minimal, sophisticated. Educational but
  never childish. WCAG 2.2 AAA.
- **Inspiration:** Donezo + Abacus Edge — generous whitespace, card
  surfaces, restrained shadows, forest-green anchoring

---

## Color Palette

### Brand
| Name | Hex | Role |
|---|---|---|
| Forest Green 800 | `#1A3829` | **Primary** — sidebar active, CTAs, LIVE border, Result score |
| Forest Green 700 | `#1E4A35` | Button hover |
| Forest Green 600 | `#2D6A4F` | Chart bars, grade colour |
| Forest Green 500 | `#40916C` | Correct answers, trend text |
| Forest Green 400 | `#52B788` | MCQ hover border |
| Forest Green 300 | `#74C69D` | Timer border, breathing circle |
| Forest Green 200 | `#B7E4C7` | Active sidebar icon background |
| Forest Green 50 | `#EFFAF4` | Active nav background, MCQ selected tint, timer bg |
| Brand Navy | `#204074` | Login page background only |
| Brand Orange | `#F57A39` | Loading bar on navy only — NEVER in UI components |

### Surface / text
| Name | Hex | Role |
|---|---|---|
| Page Background | `#F8FAFC` | Canvas behind cards |
| Card Surface | `#FFFFFF` | All card surfaces |
| Border | `#E2E8F0` | Card + divider borders |
| Border Medium | `#CBD5E1` | Heavier dividers |
| Text Primary | `#0F172A` | Headings + body-primary |
| Text Secondary | `#475569` | Secondary body, captions |
| Text Subtle | `#94A3B8` | Micro-labels, placeholder |

### Semantic state
| Name | BG | Text | Role |
|---|---|---|---|
| Success | `#DCFCE7` | `#166534` | Saved states, completed |
| Warning | `#FEF9C3` | `#854D0E` | Approaching-limit, offline-saving |
| Error | `#FEE2E2` | `#DC2626` | Failure states |
| Info | `#DBEAFE` | `#1E40AF` | Advisory, neutral callouts |
| LIVE Badge | `#EF4444` | `#FFFFFF` | Exam-is-live indicator only |

### Arithmetic (exam-only)
| Name | Hex | Role |
|---|---|---|
| Crimson Negative | `#991B1B` | **ONLY** for negative numbers inside Flash Anzan + EXAM rows. NEVER for wrong answers, errors, or danger states. |

---

## Typography

- **UI font:** `'DM Sans'`, sans-serif — every label, button, nav, body copy
- **Numeric font:** `'DM Mono'`, monospace — every score, timer, roll number,
  flash number. Always with `font-variant-numeric: tabular-nums`.

### Typography Roles

| Role | Font | Size | Weight | Where |
|---|---|---|---|---|
| `heading-xl` | DM Sans | 30px | 700 | Page H1 |
| `heading-lg` | DM Sans | 22px | 700 | Card H2 (hero live exam, profile name) |
| `heading-md` | DM Sans | 18px | 600 | Section H3, CardTitle |
| `body-lg` | DM Sans | 16px | 400 | Primary body |
| `body-sm` | DM Sans | 14px | 400 | Table cells, microcopy |
| `caption` | DM Sans | 12px | 400 | Metadata, helper text |
| `mono-flash` | DM Mono | `clamp(96px, 30vh, 180px)` | 700 | Flash Anzan number |
| `mono-timer` | DM Mono | 30px | 500 | Exam timer pill |
| `mono-kpi` | DM Mono | 36px | 700 | KPI card numbers |
| `mono-equation` | DM Mono | 26px | 400 | Vertical exam equations |
| `mono-score` | DM Mono | 48px | 700 | Completion + results score |
| `mono-data` | DM Mono | 16px | 400 | Table numeric cells |

---

## Spacing & Layout

- **Page background:** `#F8FAFC`
- **Admin content:** max-width 1280px, padding 32px
- **Student content:** max-width 960px, padding 24px
- **Admin sidebar:** 240px fixed, #FFFFFF bg, 1px slate-200 right border
- **Student sidebar:** 240px fixed, same
- **Admin top header:** 64px, white, slate-200 bottom border
- **Student top header:** 56px, same
- **Card padding:** 24px (spec §4.4)
- **Card gap:** 16px default, 24px between sections
- **Grid gap:** 16px for tight grids, 24px for card grids

---

## Radii

| Token | Value | Use |
|---|---|---|
| `--radius-chip` | 4px | Micro-pills |
| `--radius-badge` | 6px | Badges |
| `--radius-btn` | 10px | All buttons |
| `--radius-card` | 14px | All cards |
| `--radius-overlay` | 18px | Dialog / Modal |
| `--radius-pill` | 9999px | Full pill (timer, live badge) |

---

## Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)` | Cards, meta strips |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)` | Hero cards, profile card, KPI hover |
| `--shadow-lg` | `0 10px 32px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)` | Dialog, modals, login card |

---

## Components

### Buttons
- **Default (md):** h-40, px-16, rounded-10, DM Sans 14/500
- **Small:** h-36, px-12, 14/500
- **Extra-small:** h-32, px-10, 12/500
- **Large:** h-48, px-20, 16/600
- **Extra-large:** h-56, px-24, 16/600 (Begin Flash, I'm Ready)
- **Primary:** bg green-800, white text, hover green-700
- **Outline:** white bg, slate-200 border, text-primary
- **Destructive:** red-50 bg, red-700 text, red-200 border
- **Ghost:** transparent, hover slate-100

### Inputs / Selects
- h-40, px-12, rounded-10, 14/400 DM Sans, slate-200 border, focus ring green-800/40

### Badges
- h-24, px-8, rounded-6, 12/500 DM Sans
- Status colours: success / warning / error / info semantic pairs

### Cards
- White bg, slate-200 border 1px, rounded-14, shadow-sm, padding 24px
- Heading uses heading-md style

### Dialogs / Modals
- White bg, rounded-18, shadow-lg, p-24, max-w-[480px] standard
- Backdrop: `rgba(15, 23, 42, 0.4)`

### Sidebar nav
- 240px, white bg, slate-200 right border
- Logo area: 64px, slate-200 bottom border, "MINDSPARK" 20/700 text-primary
- Nav item: h-40, px-12, rounded-10, 14/500, icon 18×18 + label
- Active: bg green-50, text green-800, 600 weight
- Hover (inactive): bg green-50, text green-800
- Focus ring: 3px green-800/40

### Top header
- 64px (admin) / 56px (student)
- White bg, slate-200 bottom border
- Page title left (20/700 text-primary)
- Actions right: notification bell + 36px avatar circle
- Avatar bg green-50, text green-800, 13/700 initials

### Live exam hero card
- **White bg + 2px green-800 border** + rounded-14 + shadow-md
- LIVE NOW badge: red-500 bg, white text, white pulse dot, pill shape
- Timer top-right: 22px DM Mono 700 text-green-800, "TIME LEFT" caption 10/700 text-subtle
- Title: 22/700 text-primary
- Subtitle: 13/400 text-secondary
- CTA: green-800 bg, white text, rounded-10, 40px

### KPI card
- shadcn Card wrapper, 24px padding
- Title: 14/500 text-secondary
- Value: **36px 700 DM Mono tabular text-primary** (critical — shadcn cascade will collapse this without an explicit inline style override)
- Trend badge: 12/500 rounded-pill border + bg tint (green-50/red-50/slate-50)
- Sparkline: 120×36 recharts line, stroke green-700

### Live Pulse widget
- White card, slate-200 border, rounded-10, p-16
- Title: 15/600 text-primary
- "{count} Active Students" — count pill bg green-100, text green-800, rounded-4, font-mono
- Pulse ring: 12×12 green-600 with `pulse-ring` 2s animation
- Footer link: 12/600 text-green-800 "Join Monitoring Lobby →"

### Breathing circle (lobby)
- 120×120 rounded-full
- Border 2px rgba(26,56,41,0.30)
- Background rgba(26,56,41,0.04)
- `breathing-circle` class animation (4s ease-in-out scale 1 → 1.08)

### Skeletons
- `.skeleton` class: linear-gradient shimmer 1.5s ease-in-out
- `aria-busy="true"` on container

---

## Animations

| Name | Duration | Easing | Use |
|---|---|---|---|
| skeleton shimmer | 1.5s | ease-in-out | All loading blocks |
| breathing circle | 4s | ease-in-out | Lobby countdown |
| pulse ring | 2s | linear | Live indicators |
| confirm slide-in | 200ms | ease-out | MCQ confirm button |
| completion slide-up | 400ms | ease-out | Exam completion card |
| nav transition | 150ms | ease | Sidebar hover |
| card lift | 200ms | ease | Card hover shadow |

**Forbidden:** Any transition on `.flash-number` — flash engine must swap instantly (<16.6ms).

---

## Accessibility Rules

- Every interactive element ≥ 40×40 touch target (buttons, inputs, selects, nav)
- Focus ring: 3px green-800/40 offset 2px, rounded-4
- Contrast: all text AAA (7:1) where possible, AA (4.5:1) minimum
- Skeleton containers `aria-busy="true"`
- Timer `role="timer" aria-live="polite"` announces only at 5-min + 1-min milestones
- Network banner `role="alert"` assertive
- Sidebar `aria-current="page"` on active nav
- No emoji in production UI — lucide-react icons only
- No native `alert()` / `confirm()` — use inline pills or sonner toasts
- Negative arithmetic numbers colored `#991B1B` — nothing else uses this hex

---

## Design Principles

1. **White surfaces, green anchors.** Cards are white; green-800 is saved for CTAs, active states, and the LIVE border only. Never invert (no dark cards).
2. **Token-first.** Every colour, radius, shadow is a CSS variable. Components never hardcode hex — only login/page.tsx (brand anchor) and the exam-engine flash internals are exceptions.
3. **Generous whitespace.** Card padding is 24px. Grid gaps are 16–24px. Content columns cap at 960px (student) or 1280px (admin).
4. **DM Mono for every number.** Timers, scores, roll numbers, IDs, progress counts all use DM Mono with tabular-nums so columns align.
5. **Restrained shadows.** shadow-sm is the default; shadow-md for heroes; shadow-lg for dialogs. No heavy drop shadows.
6. **Motion is minimal and earned.** Only the breathing circle, pulse ring, skeleton shimmer, and card lift have animations. Everything else is static.
7. **No childish styling.** This is an assessment platform. Emoji, bouncy animations, rainbow gradients, and cartoon illustrations are out. Professional restraint throughout.
8. **Spec-compliant flash engine.** The Flash Anzan viewport is sacred — no peripheral UI, no transitions on numbers, no ambient motion. Negative numbers colored `#991B1B` only.
