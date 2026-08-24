---
name: design-taste-frontend
description: >-
  Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.
---

# tasteskill: Anti-Slop Frontend Skill

> Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI.
> Every rule below is **contextual**. None of it fires automatically. First read the brief, then pull only what fits.

> **Progressive-disclosure architecture:** This file contains core rules and decisions.
> Detailed reference material lives in `references/`:
> - `references/typography-and-color.md` — font choices, color palettes, content density
> - `references/motion-and-layout.md` — GSAP skeletons, layout discipline, performance
> - `references/dark-mode-and-redesign.md` — dark mode protocol, redesign workflow
> - `references/patterns-and-appendices.md` — pattern vocabulary, block library, install commands

---

## 0. BRIEF INFERENCE (Read the Room Before Anything Else)

Before touching code, **infer what the user actually wants**.

### 0.A Read these signals first
1. **Page kind** - landing (SaaS / consumer / agency / event), portfolio, redesign, editorial.
2. **Vibe words** - "minimalist", "calm", "Linear-style", "Awwwards", "brutalist", "premium consumer", etc.
3. **Reference signals** - URLs, screenshots, products they named.
4. **Audience** - B2B panel vs. design-conscious consumer vs. recruiter.
5. **Brand assets** - logo, color, type, photography.
6. **Quiet constraints** - accessibility-first, public-sector, regulated industries.

### 0.B Output a one-line "Design Read" before generating
**"Reading this as: \<page kind\> for \<audience\>, with a \<vibe\> language, leaning toward \<design system or aesthetic family\>."**

### 0.C If ambiguous, ask one question, do not guess

### 0.D Anti-Default Discipline
Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism, infinite micro-animations, Inter + slate-900.

---

## 1. THE THREE DIALS (Core Configuration)

* **`DESIGN_VARIANCE: 8`** - 1 = Perfect Symmetry, 10 = Artsy Chaos
* **`MOTION_INTENSITY: 6`** - 1 = Static, 10 = Cinematic / Physics
* **`VISUAL_DENSITY: 4`** - 1 = Art Gallery / Airy, 10 = Cockpit / Packed Data

**Baseline:** `8 / 6 / 4`. Override conversationally.

### 1.A Dial Inference
| Signal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| "minimalist / clean / calm / editorial" | 5-6 | 3-4 | 2-3 |
| "premium consumer / Apple-y / luxury" | 7-8 | 5-7 | 3-4 |
| "playful / Awwwards / experimental / agency" | 9-10 | 8-10 | 3-4 |
| "landing page / portfolio (default)" | 7-9 | 6-8 | 3-5 |
| "trust-first / public-sector / accessibility" | 3-4 | 2-3 | 4-5 |
| "redesign - preserve" | match existing | +1 | match existing |
| "redesign - overhaul" | +2 | +2 | match existing |

---

## 2. BRIEF → DESIGN SYSTEM MAP

### 2.A When to reach for a real design system
| Brief reads as… | Reach for |
|---|---|
| Microsoft / enterprise SaaS | `@fluentui/react-components` |
| Google-ish / Material-flavored | `@material/web` + Material 3 tokens |
| IBM-style B2B analytics | `@carbon/react` + `@carbon/styles` |
| Shopify app surfaces | `polaris.js` web components |
| Atlassian / Jira-style | `@atlaskit/*` |
| GitHub-style devtool | `@primer/css` or `@primer/react-brand` |
| Public-sector UK | `govuk-frontend` |
| US public-sector | `uswds` |
| Fast local-business MVP | Bootstrap 5.3 |
| Modern accessible React | `@radix-ui/themes` |
| Modern SaaS, own components | shadcn/ui (never ship default state) |
| Tailwind-based modern SaaS | Tailwind v4 utilities + `dark:` variant |

**One system per project.** Install commands in `references/patterns-and-appendices.md`.

### 2.B When the brief is an aesthetic, not a system
| Aesthetic | Implementation |
|---|---|
| Glassmorphism | `backdrop-filter`, layered borders, highlight overlays. Solid fallback. |
| Bento | CSS Grid with mixed cell sizes. |
| Brutalism | Native CSS, monospace, raw borders. |
| Editorial | Serif type, asymmetric grid, generous whitespace. |
| Dark tech | Mono + accent neon, terminal motifs. |
| Kinetic typography | CSS animations, scroll-driven animations, GSAP. |

---

## 3. DEFAULT ARCHITECTURE & CONVENTIONS

### 3.A Stack
* **Framework:** React or Next.js. Default Server Components (RSC).
* **Styling:** Tailwind v4 (default). For v4: use `@tailwindcss/postcss` or the Vite plugin.
* **Animation:** Motion (`import { motion } from "motion/react"`).
* **Fonts:** Always `next/font` or self-hosted `@font-face`. Never Google Fonts `<link>`.

### 3.B State
* Local `useState` for isolated UI. Global state only for deep prop-drilling.
* **NEVER** `useState` for continuous values (mouse, scroll, pointer physics). Use Motion's `useMotionValue`.

### 3.C Icons
* **Allowed:** `@phosphor-icons/react`, `hugeicons-react`, `@radix-ui/react-icons`, `@tabler/icons-react`.
* **Discouraged:** `lucide-react`. Acceptable only on explicit request.
* **NEVER hand-roll SVG icons.** One family per project.

### 3.D Responsiveness
* Contain layouts: `max-w-[1400px] mx-auto`.
* **NEVER `h-screen`.** Use `min-h-[100dvh]`.
* **Grid over Flex-Math.** Use CSS Grid, not `w-[calc(33%-1rem)]`.

### 3.E Dependency Verification
Before importing ANY 3rd-party library, check `package.json`. Output install command first.

---

## 4. DESIGN ENGINEERING DIRECTIVES (Summary)

> **Full reference:** `references/typography-and-color.md` and `references/motion-and-layout.md`.

### Key typography rules
* Discourage Inter as default. Prefer Geist, Outfit, Cabinet Grotesk, Satoshi.
* Serif is very discouraged as default. Banned defaults: `Fraunces`, `Instrument_Serif`.
* Max 1 accent color. No AI-purple by default.
* One palette per project. COLOR CONSISTENCY LOCK.

### Key layout rules
* Hero MUST fit initial viewport. Headline max 2 lines, subtext max 20 words.
* Hero max 4 text elements. Logo wall UNDER hero, never inside.
* Nav on single line, height max 80px.
* EYEBROW RESTRAINT: max 1 per 3 sections.
* ZIGZAG CAP: max 2 consecutive image+text splits.
* Section-Layout-Repetition Ban: at least 4 different layout families across 8 sections.

### Key image rules
* Use image-gen tool first → real web images second → explicit placeholder slots last.
* NO div-based fake screenshots. NO hand-rolled decorative SVGs.
* Real SVG logos for social proof (Simple Icons / devicon).

### Key interactive states
* Always implement: Loading (skeletal), Empty, Error, Tactile feedback.
* Button Contrast Check (WCAG AA). CTA labels: max 3 words, no wrapping.
* No Duplicate CTA Intent on one page.

---

## 9. AI TELLS (Forbidden Patterns)

### Visual & CSS
* NO neon / outer glows. NO pure black `#000000`. NO oversaturated accents.
* NO excessive gradient text. NO custom mouse cursors.

### Typography
* AVOID Inter as default. NO oversized H1s. Serif for editorial/luxury only.

### Layout
* NO 3-column equal feature cards. Mathematically perfect spacing.

### Content
* NO generic names ("John Doe"). NO generic avatars. NO fake-perfect numbers.
* NO filler verbs ("Elevate", "Seamless", "Unleash").

### 9.G EM-DASH BAN (COMPLETELY banned)
**Em-dash (`—`) is COMPLETELY banned.** Zero em-dashes anywhere visible. Use hyphens, periods, commas, or colons instead.

### Production-Test Tells
* NO version labels in hero. NO section-number eyebrows.
* NO decoration text strips. NO locale/weather strips.
* NO scroll cues. NO decorative dots. NO pills/labels overlaid on images.
* NO photo-credit captions as decoration. NO version footers.

---

## 13. OUT OF SCOPE

This skill is NOT for: Dashboards, data tables, multi-step forms, code editors, native mobile, realtime collab UIs. Point to the right tool instead.

---

## 14. FINAL PRE-FLIGHT CHECK

**Run every box. If any box fails, the output is not done.**

- [ ] Brief inference declared (Section 0.B one-liner)?
- [ ] Dial values explicit and reasoned from the brief?
- [ ] Design system chosen from Section 2 if applicable?
- [ ] Redesign mode detected and audit performed if applicable?
- [ ] **ZERO em-dashes (`—`) anywhere on the page.** (Non-negotiable.)
- [ ] Page Theme Lock: ONE theme for the whole page?
- [ ] Color Consistency Lock: one accent across all sections?
- [ ] Shape Consistency Lock: one corner-radius system?
- [ ] Button Contrast Check: every CTA readable (WCAG AA 4.5:1)?
- [ ] CTA Button Wrap: no label wraps to 2+ lines at desktop?
- [ ] Serif discipline: no Fraunces or Instrument_Serif as default?
- [ ] Premium-consumer palette check: not AI-default beige+brass?
- [ ] Hero fits viewport: headline ≤ 2 lines, subtext ≤ 20 words, CTA visible?
- [ ] Hero top padding: max `pt-24` at desktop?
- [ ] Hero stack discipline: max 4 text elements?
- [ ] EYEBROW COUNT: ≤ ceil(sectionCount / 3)?
- [ ] No Duplicate CTA Intent?
- [ ] Logo wall = logos only, UNDER hero, real SVGs?
- [ ] Bento Background Diversity: 2-3 cells have real visual variation?
- [ ] Copy Self-Audit: every string re-read, no AI-hallucinated phrases?
- [ ] Motion motivated: every animation justified in one sentence?
- [ ] Marquee max-one-per-page?
- [ ] Navigation on ONE line, height ≤ 80px?
- [ ] Section-Layout-Repetition: at least 4 different layout families?
- [ ] Zigzag Cap: no 3+ consecutive image+text splits?
- [ ] Real images used (gen-tool → Picsum → placeholder slots)?
- [ ] No AI Tells from Section 9?
- [ ] Reduced motion wrapped for `MOTION_INTENSITY > 3`?
- [ ] Dark mode tokens defined and tested in both modes?
- [ ] Mobile collapse explicit for high-variance layouts?
- [ ] `min-h-[100dvh]`, never `h-screen`?
- [ ] `useEffect` animations have cleanup functions?
- [ ] Empty / loading / error states provided?
- [ ] Icons from allowed library only?
- [ ] Core Web Vitals plausibly hit (LCP < 2.5s, INP < 200ms, CLS < 0.1)?
- [ ] One design system per project?

If a single checkbox cannot be honestly ticked, the page is not done.
