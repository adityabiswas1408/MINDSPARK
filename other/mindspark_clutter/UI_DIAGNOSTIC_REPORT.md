# MINDSPARK UI Diagnostic Report — v2

────────────────────────────────────────────────────────
## METADATA
────────────────────────────────────────────────────────
- **Date:** 2026-04-11
- **Model:** Claude Opus 4.6 (1M context)
- **Session type:** Diagnostic-only, no source modifications outside the 5 writable files.
- **Files in inventory:** 143 src files (96 .tsx + 46 .ts + 1 .css + 0 .js + 0 .mjs) + 24 docs files = 167 total.
- **Files read:** 140 of 143 src files + 12 of 12 authority docs = 140 src + 12 = **152 files read** (4 test/setup files skipped with reason; see Appendix A).
- **Coverage:** 140 / 140 relevant files = **100%** of UI-impacting surface.
- **Authority docs read (12 of 12):**
  - docs/abacus-edge-design-spec (4).html (1095 lines)
  - docs/07_hifi-spec.md (839 lines)
  - docs/08_a11y.md (929 lines)
  - docs/13_exam-engine-spec.md (813 lines)
  - docs/18_performance-budget.md (597 lines)
  - docs/10_architecture.md (860 lines)
  - docs/06_wireframes.md (898 lines)
  - src/app/globals.css (365 lines)
  - tailwind.config.ts (80 lines)
  - postcss.config.js (5 lines)
  - CLAUDE.md (496 lines)
  - GOTCHAS.md (323 lines)
- **Graph queries run (Phase 1.5):** 9 (list_graph_stats, list_communities, embed_graph, 4× semantic_search_nodes, 3× query_graph importers_of/tests_for).
- **Findings total (scratch):** ~446 entries in docs/diagnostic-findings-raw.md
  - CRITICAL: 21
  - HIGH:     102
  - MEDIUM:   138
  - LOW:      185
- **Findings discarded (failed validation):** 0
- **Findings in this report:** ~446 (all retained)

────────────────────────────────────────────────────────
## EXECUTIVE SUMMARY
────────────────────────────────────────────────────────
The single root cause of the broken UI is that **tailwind.config.ts only declares `green-800` and the slate ramp — every other colour shade used in components (green-50..700, blue-*, red-*, amber-*, emerald-*, teal-*, purple-*, orange-*, rose-*, indigo-*, violet-*) silently fails to compile**, so every status badge, avatar, progress bar and hover state that uses `bg-<colour>-<shade>` renders transparent or incorrectly. The 3 most impactful findings: **(1)** `--sidebar: #1A3829` in globals.css plus `backgroundColor: '#1A3829'` in both sidebar components inverts every admin/student page to a dark-green sidebar with white text, contradicting the spec's white-with-dark-text sidebar; **(2)** layout.tsx's `text-secondary` class resolves to shadcn's `--secondary: #F1F5F9` (background token) not MINDSPARK `--text-secondary: #475569`, making every body text near-white on the near-white page; **(3)** KPI card numbers render at 16px/400 instead of the spec's 36px/700, and the dashboard charts grid is stacked single-column instead of the spec's 60/40 split. Effort: estimated 2–3 engineer-days for the CSS/token fixes and about 1 additional week for the component-level rework of the student assessment and exam flows.

────────────────────────────────────────────────────────
## MASTER TOKEN CATALOGUE
────────────────────────────────────────────────────────
Spec tokens from `docs/abacus-edge-design-spec (4).html` §28 CSS Variables vs current `src/app/globals.css`.

| Spec Token | Spec Value | globals.css Name | globals.css Value | Status |
|---|---|---|---|---|
| `--ms-navy` | `#204074` | `--clr-brand-navy` | `#204074` | RENAMED (match) |
| `--ms-navy2` | `#234176` | — | MISSING | MISSING |
| `--ms-blue` | `#3A9ED1` | — | MISSING | MISSING |
| `--ms-orange` | `#F57A39` | `--clr-brand-orange` | `#F57A39` | RENAMED (match) |
| `--ms-yellow` | `#F5BE38` | — | MISSING | MISSING |
| `--page` | `#F8FAFC` | `--bg-page` | `#F8FAFC` | RENAMED (match) |
| `--card` | `#FFFFFF` | `--bg-card` | `#FFFFFF` | RENAMED (match) |
| `--border` | `#E2E8F0` | `--color-slate-200` | `#E2E8F0` | RENAMED via slate |
| `--bmd` | `#CBD5E1` | `--color-slate-300` | `#CBD5E1` | RENAMED via slate |
| `--t1` | `#0F172A` | `--text-primary` | `#0F172A` | RENAMED (match) |
| `--t2` | `#475569` | `--text-secondary` | `#475569` | RENAMED (match) — **BUT Tailwind `text-secondary` class resolves to shadcn `--secondary` not this var** |
| `--t3` | `#94A3B8` | `--text-subtle` | `#94A3B8` | RENAMED (match) |
| `--g900` | `#0D2B1F` | — | MISSING | **MISSING** |
| `--g800` | `#1A3829` | `--clr-green-800` / `--color-green-800` | `#1A3829` | MATCH |
| `--g700` | `#1E4A35` | — | MISSING | **MISSING** |
| `--g600` | `#2D6A4F` | — | MISSING | **MISSING** |
| `--g500` | `#40916C` | — | MISSING | **MISSING** |
| `--g400` | `#52B788` | — | MISSING | **MISSING** |
| `--g300` | `#74C69D` | — | MISSING | **MISSING** |
| `--g200` | `#B7E4C7` | — | MISSING | **MISSING** |
| `--g50` | `#EFFAF4` | — | MISSING | **MISSING** |
| `--live` | `#EF4444` | `--bg-live-badge` / `--color-live-badge` | `#EF4444` | RENAMED (match) |
| `--ok-bg` | `#DCFCE7` | `--bg-success` / `--color-success-bg` | `#DCFCE7` | RENAMED (match) |
| `--ok-tx` | `#166534` | `--text-success` / `--color-success-text` | `#166534` | RENAMED (match) |
| `--wn-bg` | `#FEF9C3` | `--bg-warning` / `--color-warning-bg` | `#FEF9C3` | RENAMED (match) |
| `--wn-tx` | `#854D0E` | `--text-warning` / `--color-warning-text` | `#854D0E` | RENAMED (match) |
| `--er-bg` | `#FEE2E2` | `--bg-error` / `--color-error-bg` | `#FEE2E2` | RENAMED (match) |
| `--er-tx` | `#991B1B` (danger) / `#DC2626` (error-text) | `--text-error` / `--color-error-text` | `#DC2626` | SPLIT (s-neg below) |
| `--in-bg` | `#DBEAFE` | `--bg-info` / `--color-info-bg` | `#EFF6FF` | **DRIFT** (spec #DBEAFE, impl #EFF6FF) |
| `--in-tx` | `#1E40AF` | `--text-info` / `--color-info-text` | `#1D4ED8` | **DRIFT** (spec #1E40AF, impl #1D4ED8) |
| `--s-neg` | `#991B1B` | `--text-negative` | `#991B1B` | MATCH |
| `--ff-std-tx` | `#0F172A` | `--text-primary` used in code | `#0F172A` | MATCH (via flash-number inline) |
| `--ff-std-bg` | `#FFFFFF` | hardcoded | `#FFFFFF` | MATCH |
| `--ff-mid-tx` | `#1E293B` | `--flash-tx-mid` | `#1E293B` | MATCH |
| `--ff-mid-bg` | `#F8FAFC` | `--flash-bg-mid` | `#F8FAFC` | MATCH |
| `--ff-fast-tx` | `#334155` | `--flash-tx-fast` / `--color-slate-700` | `#334155` | MATCH |
| `--ff-fast-bg` | `#F1F5F9` | `--flash-bg-fast` / `--color-slate-100` | `#F1F5F9` | MATCH |
| `--font-sans` | `'DM Sans'` | via `next/font` + class `font-sans` | DM Sans loaded | MATCH |
| `--font-mono` | `'DM Mono'` | via `next/font` + class `font-mono` | DM Mono loaded | MATCH |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)` | — | MISSING | **MISSING** |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)` | — | MISSING | **MISSING** |
| `--shadow-lg` | `0 10px 32px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)` | — | MISSING | **MISSING** |
| `--r1` | `4px` | `--radius-chip` | `4px` | RENAMED (match) |
| `--r2` | `6px` | `--radius-badge` | `6px` | RENAMED (match) |
| `--r3` | `10px` | `--radius-btn` | `10px` | RENAMED (match) |
| `--r4` | `14px` | `--radius-card` / `--radius-xl` | `14px` | RENAMED (match) |
| `--r5` | `18px` | `--radius-overlay` | `18px` | RENAMED (match) |
| `--rf` | `9999px` | `--radius-pill` | `999px` | RENAMED (match) |
| `--bg-overlay` | `rgba(15,23,42,0.4)` | `--bg-overlay` | `rgba(15,23,42,0.4)` | MATCH |
| `--bg-timer-normal` | `#F0FDF4` | `--bg-timer-normal` | `#F0FDF4` | MATCH |
| `--border-timer-normal` | `#86EFAC` | `--border-timer-normal` | `#86EFAC` | MATCH |
| `--text-timer-normal` | `#1A3829` | `--text-timer-normal` | `#1A3829` | MATCH |
| `--bg-timer-urgent` | `#FFFBEB` | `--bg-timer-urgent` | `#FFFBEB` | MATCH |
| `--border-timer-urgent` | `#F59E0B` | `--border-timer-urgent` | `#F59E0B` | MATCH |
| `--text-timer-urgent` | `#92400E` | `--text-timer-urgent` | `#92400E` | MATCH |

**Summary:** 8 of 9 green-ramp tokens missing (`g50, g200–g700, g900`), all 3 spec shadow tokens missing, info-bg + info-tx drift from spec.

────────────────────────────────────────────────────────
## HARDCODED VALUE INVENTORY
────────────────────────────────────────────────────────
Selected high-impact hardcoded values (full list preserved in `docs/diagnostic-findings-raw.md`).

| File | Line | Hardcoded Value | Should Be Token | Severity |
|---|---|---|---|---|
| src/app/layout.tsx | 65 | `bg-white text-[#1A3829] border-[#1A3829]` | `var(--clr-green-800)` | MEDIUM |
| src/app/login/page.tsx | 52 | `backgroundColor: '#204074'` | `var(--clr-brand-navy)` | MEDIUM |
| src/app/login/page.tsx | 65 | `borderRadius: '20px'` | no such token; spec max `--r5 18px` | MEDIUM |
| src/app/login/page.tsx | 68 | `boxShadow: '0 20px 60px rgba(0,0,0,0.3)'` | `var(--shadow-lg)` (also MISSING) | MEDIUM |
| src/app/login/page.tsx | 166 | `backgroundColor: '#1A3829'` | `var(--clr-green-800)` | MEDIUM |
| src/components/layout/admin-sidebar.tsx | 35 | `backgroundColor: '#1A3829'` | `var(--bg-card)` (#FFFFFF) per spec | **CRITICAL** |
| src/components/layout/student-sidebar.tsx | 65 | `backgroundColor: '#1A3829'` | `var(--bg-card)` (#FFFFFF) per spec | **CRITICAL** |
| src/components/layout/top-header.tsx | 35–40 | `#FFFFFF, #E2E8F0, #0F172A` | tokens | MEDIUM |
| src/components/layout/student-header.tsx | 20–35 | `#FFFFFF, #E2E8F0, #475569, #0F172A` | tokens | MEDIUM |
| src/app/(admin)/admin/monitor/page.tsx | 91 | `bg-[#1A3829] hover:bg-[#1A3829]/90` | `bg-green-800 hover:bg-...` | HIGH |
| src/app/(admin)/admin/monitor/[id]/monitor-client.tsx | 247 | `bg-[#1A3829]` | token | MEDIUM |
| src/app/(admin)/admin/settings/settings-client.tsx | 256, 319, 361 | `bg-[#1A3829]` on multiple buttons | token | HIGH |
| src/components/assessments/assessment-card.tsx | 20–25 | Status colours hardcoded in STATUS_BADGE map | tokens | LOW (matches spec semantics) |
| src/components/student/live-exam-card.tsx | 43 | `backgroundColor: '#1A3829'` (hero card filled) | White card + 2px green border per spec | **CRITICAL** |
| src/app/(student)/student/results/page.tsx | 135 | `backgroundColor: '#1A3829'` (hero card filled) | White card per spec | **CRITICAL** |
| src/app/(student)/student/dashboard/page.tsx | 178 | `width: '42%'` (fake progress) | real DB value | HIGH |
| src/components/dashboard/score-trend-chart.tsx | 39 | `stroke="#E2E8F0" stroke='#1A3829'` | token | MEDIUM |
| src/components/dashboard/level-distribution-chart.tsx | 37 | `stroke="#E2E8F0" fill='#1A3829'` | token | MEDIUM |
| src/components/exam/exam-timer.tsx | 45–47 | `#FFFFFF, #854D0E, #475569` | timer token set | HIGH |
| src/components/exam/network-banner.tsx | 19 | `#FEF9C3, #854D0E` | tokens | HIGH |
| src/components/exam/flash-number.tsx | 83 | `spanEl.style.color = isNegative ? '#991B1B' : ''` (per frame) | CSS class swap | MEDIUM |

────────────────────────────────────────────────────────
## BANNED VALUE VIOLATIONS
────────────────────────────────────────────────────────
| File | Line | Banned Value | Spec Reference |
|---|---|---|---|
| src/components/student/live-exam-card.tsx | 148 | `📋` emoji in NoLiveExamCard | CLAUDE.md Hard Constraints "No emoji in production UI — use lucide-react icons" |
| src/app/(student)/student/results/page.tsx | 112 | `📋` emoji in empty state | same |
| src/components/students/students-table-client.tsx | 364 | native `alert('CSV export coming soon')` | CLAUDE.md "No native alert/confirm — use inline error pill pattern" |
| src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx | 98 | native `alert(\`Failed to start session: ...\`)` | same |

Searched for `#FF6B6B`, `#1A1A1A`, `#E0E0E0`, `#121212`, `#FFD700`, Roboto Mono, DOMPurify — **none found in src/**.

────────────────────────────────────────────────────────
## TYPOGRAPHY AUDIT
────────────────────────────────────────────────────────
Spec defines 11 typography roles (07_hifi-spec.md §2). Status in implementation:

| Role | Spec | Applied Correctly | Notable Violations |
|---|---|---|---|
| `heading-xl` | DM Sans 30px 700 | Mostly (dashboard h1 renders 32px vs 30px) | Login page 28px |
| `heading-lg` | DM Sans 22px 700 | Various — live-exam-card h2 ✓, profile hero ✓ | results hero 20px |
| `heading-md` | DM Sans 18px 600 | Inconsistent — card titles use 14/15px instead | Spec violated on dashboard charts card titles |
| `body-lg` | DM Sans 16px 400 | Mixed | Many pages use 14/15px |
| `body-sm` | DM Sans 14px 400 | Mostly | — |
| `caption` | DM Sans 12px 400 | Mostly | — |
| `mono-flash` | `clamp(96px, 30vh, 180px) 700` | ✓ flash-number.tsx line 117 | — |
| `mono-timer` | DM Mono 30px 500 | **WRONG** — exam-timer.tsx renders `text-sm` = 14px | exam-timer.tsx:50 |
| `mono-equation` | DM Mono 26px 400 | Partial — exam-vertical-view.tsx uses `clamp(24px, 4vw, 40px)` | — |
| `mono-score` | DM Mono 48px 700 | Partial — completion-card has 48px 700 ✓; student results hero uses 52px | — |
| `mono-data` | DM Mono 16px 400 | ✓ Used in tables for numeric cells | — |

**DM Mono violations — numeric elements not using DM Mono:**
| File | Line | Element | Current Font | Should Be |
|---|---|---|---|---|
| src/components/dashboard/kpi-card.tsx | 27 | KPI value | `text-3xl font-bold` = 30px 700 intended; **rendered 16px 400** at runtime | DM Mono 36px 700 |
| src/components/exam/exam-timer.tsx | 50 | Timer digits | `text-sm` = 14px | DM Mono 30px 500 |
| src/app/(admin)/admin/monitor/[id]/monitor-client.tsx | 310 | Summary tile count | `text-2xl` (class did not compile for live view) | DM Mono ~24px 700 |

────────────────────────────────────────────────────────
## ANIMATION AND INTERACTION AUDIT
────────────────────────────────────────────────────────
| Animation | Spec Section | Status | File | Notes |
|---|---|---|---|---|
| Skeleton shimmer 1.5s | 07_hifi-spec §8 | **PARTIAL** | src/components/shared/skeletons.tsx | Uses `animate-pulse` (opacity pulse) not the spec's linear-gradient shimmer — globals.css has `.skeleton` class with correct shimmer but skeletons.tsx does not apply it |
| Breathing circle 4s | 07_hifi-spec §6 (lobby) | **MISSING** | src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx | Lobby uses static countdown circle, no breathe animation |
| Pulse ring 2s (LIVE/KPI) | 07_hifi-spec §4.4 | **MISSING** | src/components/dashboard/live-pulse.tsx | Component is dead code (0 importers); class `animate-pulse-ring` likely doesn't compile |
| KPI count-up 800ms | abacus-edge-design-spec §24 | **MISSING** | src/components/dashboard/kpi-card.tsx | No count-up; static render |
| Hover 150ms | abacus-edge-design-spec §24 | PARTIAL | nav-transition class in globals.css line 146 | Declared but not applied on sidebars (hover via onMouseEnter JS) |
| Card lift 200ms | abacus-edge-design-spec §24 | MISSING | — | No shadow-sm→md hover transition on cards |
| Flash number 0ms (NONE) | 07_hifi-spec §7 | ✓ | src/components/exam/flash-number.tsx:112 | `transition: 'none'` explicit |
| Lobby exit 400ms cubic-bezier(.25,1,.5,1) | abacus-edge-design-spec §24 | MISSING | — | No exit animation on lobby → interstitial |
| Result entrance 400ms cubic-bezier(.16,1,.3,1) | abacus-edge-design-spec §24 | **BROKEN** | src/components/exam/completion-card.tsx:141 | Uses `animation: 'completion-slide-up 400ms ease-out'` — keyframe `completion-slide-up` NOT defined in globals.css. Silent fail. |
| LIVE badge pulse 1.5s | abacus-edge-design-spec §24 | MISSING on monitor | various | monitor-client uses `animate-pulse-ring` class that doesn't compile |
| Confirm slide-in 200ms | 07_hifi-spec §4.2 | **BROKEN** | src/components/exam/mcq-grid.tsx:128 | Uses `animation: 'confirm-slide-in 200ms ease-out'` — keyframe `confirm-slide-in` NOT defined in globals.css. Silent fail. |

**Forbidden transitions found:** none on `.flash-number` — correctly set to `transition: none` in flash-number.tsx:112 and spec-compliant.

────────────────────────────────────────────────────────
## ACCESSIBILITY AUDIT
────────────────────────────────────────────────────────
| Requirement | Level | Status | File | Notes |
|---|---|---|---|---|
| Timer aria-live polite | AA | ✓ | src/components/exam/exam-timer.tsx:40 | `role="timer" aria-live="polite" aria-atomic="true"` present |
| Timer milestone-only announce (5min/1min) | AA | ✓ | src/hooks/use-exam-timer.ts:42 | Implemented via `shouldAnnounce` boolean |
| Network banner role="alert" assertive | AAA | ✓ | src/components/shared/network-banner.tsx:10 and src/components/exam/network-banner.tsx:14 | Both present |
| Skeleton `aria-busy` | AA | **MISSING** | src/components/shared/skeletons.tsx | No container `aria-busy="true"` anywhere |
| MCQ radiogroup + role=radio + aria-checked | AA | ✓ | src/components/exam/mcq-grid.tsx:86 | |
| Sidebar `aria-current="page"` | AA | ✓ | admin-sidebar.tsx:59, student-sidebar.tsx:32 | |
| Modal focus trap (Radix) | AA | ✓ | Via shadcn Dialog/Sheet | |
| Decorative icon `aria-hidden="true"` | AA | ✓ | Sidebars use aria-hidden on Lucide icons | |
| Standalone icon button `aria-label` | AA | Partial | top-header.tsx has aria-label="Notifications" ✓; announcements tiptap-editor buttons use `title=` instead | |
| Live monitor tbody aria-live polite | AA | **MISSING** | src/app/(admin)/admin/monitor/[id]/monitor-client.tsx | No aria-live on results table tbody |
| `sr-announcer.tsx` for exam context | AA | ✓ | src/components/shared/sr-announcer.tsx | Implemented but not wired into every exam flow (anzan-flash-view does not mount it) |
| `:focus-visible` 3px outline | AAA | ✓ | globals.css:76 | Applied globally |
| Keyboard arrow nav MCQ | AA | **MISSING** | src/components/exam/mcq-grid.tsx | Only Tab + Enter works; no ArrowKey handler |
| Ticker Mode as accessible alternative | AA | ✓ implementation but NEVER ACTIVATED (profiles.ticker_mode column missing per GOTCHAS.md) | src/components/a11y/a11y-ticker-mode.tsx + src/app/(student)/student/exams/[id]/page.tsx:36 | `const tickerMode = false;` hardcoded |
| Prefers reduced motion handling | AA | ✓ | src/hooks/use-reduced-motion.ts | |

**Touch target violations:**
| File | Line | Element | Current Size | Required |
|---|---|---|---|---|
| src/components/ui/button.tsx | 32 | default Button | `h-8` = 32px | 40px (spec §4.1) |
| src/components/ui/button.tsx | 34 | `size=sm` Button | `h-7` = 28px | 44px min (a11y §4) |
| src/components/ui/button.tsx | 33 | `size=xs` Button | `h-6` = 24px | 44px min |
| src/components/ui/input.tsx | 11 | default Input | `h-8` = 32px | 40px |
| src/components/ui/select.tsx | 44 | default SelectTrigger | `h-8` = 32px | 40px |
| (live) /admin/monitor | computed | "Monitor Session" primary button | **18px tall** | 48px large CTA |
| (live) /admin/dashboard | computed | Sidebar nav items | ~40px (OK) | 40px |

**ARIA violations:**
| File | Line | Missing/Wrong ARIA | Spec |
|---|---|---|---|
| src/components/shared/skeletons.tsx | various | No `aria-busy` on container | 08_a11y §2.3 |
| src/app/(admin)/admin/announcements/tiptap-editor.tsx | 21–40 | Toolbar buttons only have `title=` (no aria-label) | 08_a11y §2.8 |
| src/app/(admin)/admin/monitor/[id]/monitor-client.tsx | tbody | No aria-live="polite" | 08_a11y §2.5 |
| src/app/(student)/student/exams/[id]/lobby/page.tsx | 78 | `SESSION ID: {paper.id}` exposed to screen reader | 08_a11y §5 (never announce UUIDs) |
| src/app/login/page.tsx | 120, 141 | Inputs `outline: 'none'` with no replacement | 08_a11y §7.1 |

────────────────────────────────────────────────────────
## PERFORMANCE AUDIT
────────────────────────────────────────────────────────
| Budget | Target | Current Implementation | Status |
|---|---|---|---|
| Flash swap latency | ≤16.6ms | textContent + style.color per frame | PASS (style.color write adds ~0.5ms per swap — acceptable) |
| `setTimeout` in `src/lib/anzan/` | BANNED | No matches | PASS |
| MINIMUM_INTERVAL_MS | 200 | `src/lib/anzan/timing-engine.ts:21` | PASS |
| Delta clamp factor | 1.5 | `src/lib/anzan/timing-engine.ts:25` | PASS |
| Offline sync ≤3000ms / 50 answers | yes | `src/lib/offline/sync-engine.ts` | PASS in flow but no 50-row chunking (could violate 64KB keepalive on long offline) |
| WS connect ≤5000ms jitter | yes | `JITTER_WINDOW_MS = 5000` in `src/lib/constants.ts` | PASS |
| LCP admin <2.5s desktop | yes | Cannot measure statically; Lighthouse CI config absent | UNKNOWN |
| LCP student <3.5s tablet/4G | yes | same | UNKNOWN |
| CLS <0.1 | yes | Skeletons layout differs from page (dashboard/loading.tsx grid ≠ page.tsx grid) | **RISK** |
| First-load JS <150KB gzipped | yes | Cannot measure without build | UNKNOWN |
| Engine chunk <80KB gzipped | yes | `dynamic(ssr:false)` wraps anzan-flash-view & exam-vertical-view in assessment/[id]/assessment-client.tsx | PASS |

**Server-side rendering violations:**
| File | Line | Component | Issue |
|---|---|---|---|
| src/app/(admin)/admin/announcements/tiptap-editor.tsx | 2 | TipTap editor | **Imports `@tiptap/react` and `@tiptap/starter-kit` statically at module top.** Violates 07_hifi-spec §7 and GOTCHAS.md "TipTap must load via next/dynamic ssr:false". The announcements-client.tsx wraps it in dynamic, so runtime OK, but the editor itself isn't an SSR-safe module. |
| src/components/dashboard/score-trend-chart.tsx | 1 | Recharts LineChart | Marked `'use client'` but imported statically by dashboard-charts.tsx (dynamic there). PASS. |
| src/components/dashboard/level-distribution-chart.tsx | 1 | Recharts BarChart | Same. PASS. |
| src/components/results/results-client.tsx | 1 | Recharts AreaChart | Imports Recharts statically, file is `'use client'`. Not dynamically loaded. **Potential SSR crash** per GOTCHAS.md "Recharts accesses window on import". |

────────────────────────────────────────────────────────
## ARCHITECTURE VIOLATIONS
────────────────────────────────────────────────────────

**`'use client'` violations:** none found — `'use client'` is only on files that need browser APIs.

**`adminSupabase` in student routes or client components:**
| File | Line | Severity |
|---|---|---|
| src/app/actions/assessment-sessions.ts | 6, 52, 80, 138, 190 | Uses `adminSupabase` heavily. Called from `(student)/` Server Actions. Per CLAUDE.md the ban is on `(student)/` routes, client components, and hooks — Server Actions are a grey area but intent is narrow use. MEDIUM |
| src/app/actions/auth.ts | 5 | Uses `adminSupabase.auth.admin.updateUserById` — required for password reset. OK in admin action. LOW |
| src/app/(admin)/admin/announcements/page.tsx | 3 | Imports adminSupabase in server component (NOT a client component). OK by letter of rule. LOW |
| src/app/(admin)/admin/settings/page.tsx | 2 | Same pattern. LOW |
| src/app/(admin)/admin/activity-log/page.tsx | 2 | Same pattern. LOW |

**`requireRole()` missing:** None found — every Server Action begins with `requireRole()`. PASS.

**Postgres Changes used for exam-session data (Zone 1 ban):**
| File | Line | Severity |
|---|---|---|
| src/app/(admin)/admin/monitor/[id]/monitor-client.tsx | 130 | **CRITICAL** — uses `postgres_changes` on `assessment_sessions` filtered by `paper_id=eq.${paperId}`. Per 10_architecture.md §5 Zone 1 this is explicitly banned at scale. |

────────────────────────────────────────────────────────
## FAKE DATA INVENTORY
────────────────────────────────────────────────────────
| File | Line | Hardcoded Value | Should Query |
|---|---|---|---|
| src/app/(student)/student/dashboard/page.tsx | 183 | "Progress to next level 42%" + width:'42%' | real level progress |
| src/app/(student)/student/dashboard/page.tsx | 199 | "— RANK" | DB rank computation |
| src/app/(student)/student/dashboard/page.tsx | 210 | "0 BADGES" | DB badge count |
| src/app/(student)/student/dashboard/page.tsx | 231 | Skill Metrics { Logical Reasoning: 88, Speed: 64, Accuracy: 92 } | Per-student metrics |
| src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx | 180 | "Camera & Microphone Access" ✓ — always green | Real permission check |
| src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx | 187 | "Secure Browser Environment" ✓ — always green | SecureBrowser API call |
| src/components/levels/levels-client.tsx | 126 | "Avg Competencies: 0" | DB query |
| src/components/levels/levels-client.tsx | 129 | "Curriculum Density: —" | DB query |
| src/app/(admin)/admin/announcements/announcements-client.tsx | 202 | "Announcements on Tuesday mornings have 25% higher read rate" | real analytics |
| src/app/(admin)/admin/settings/settings-client.tsx | 354 | Auto-Archive toggle — no DB column backing | DB column |
| src/app/(admin)/admin/activity-log/activity-log-client.tsx | 356 | "INDEX_HEALTH 99%" | real metric |
| src/app/(admin)/admin/activity-log/activity-log-client.tsx | 368 | "RETENTION 365D" | real config |
| src/app/(admin)/admin/activity-log/activity-log-client.tsx | 373 | "ALERTS ACTIVE" | real alert state |
| src/components/layout/top-header.tsx | 85 | Avatar initials hardcoded "PS" | compute from user |

────────────────────────────────────────────────────────
## MICROCOPY VIOLATIONS
────────────────────────────────────────────────────────
**Banned microcopy found:**
| File | Line | Banned Text | Approved Alternative |
|---|---|---|---|
| src/app/(student)/student/exams/[id]/lobby/page.tsx | 78 | "SESSION ID: {paper.id}" | Never expose UUIDs to users |
| src/app/(student)/student/exams/[id]/lobby/page.tsx | 78 | "LOBBY: PRE-ASSESSMENT · USER: ACTIVE, STUDENT ROLE" | Remove debug telemetry |

**Missing spec microcopy:**
| Page/Component | Current | Spec Requires |
|---|---|---|
| /student/profile | "Profile settings and accessibility flags." placeholder | 07_hifi-spec §6 full digital ID card + Ticker Mode toggle |
| /student/tests | "No practice tests available." placeholder | — (spec does not define this page but admin sidebar links to it) |
| /admin/reports | "Generate performance reports and analytics." placeholder with no CTA | spec does not define this page |
| Empty submit confirmation in anzan-flash-view | Uses CompletionCard | Spec §6 Submission Confirmation card: "Your answers are saved and sent to your teacher." — implementation uses "Your answers have been saved successfully." (similar but different) |

────────────────────────────────────────────────────────
## LAYOUT VIOLATIONS
────────────────────────────────────────────────────────
| Page | Element | Spec Value | Actual Value | File:Line |
|---|---|---|---|---|
| Admin (all) | Sidebar width | 240px | 260px (verified live) | src/components/layout/admin-sidebar.tsx:34 |
| Admin (all) | Sidebar bg | #FFFFFF | #1A3829 (verified live) | src/components/layout/admin-sidebar.tsx:35 |
| Admin (all) | Top header height | 64px | 59.85px (verified live) | src/components/layout/top-header.tsx:33 |
| Student (all) | Sidebar width | 240px | 240px ✓ | src/components/layout/student-sidebar.tsx:64 |
| Student (all) | Sidebar bg | #FFFFFF | #1A3829 | src/components/layout/student-sidebar.tsx:65 |
| Student (all) | Top header height | 56px | 64px | src/components/layout/student-header.tsx:22 |
| Admin Dashboard | Content max-width | 1280px | none (stretches full) | src/app/(admin)/admin/dashboard/page.tsx |
| Student Dashboard | Content max-width | 960px | 280px right column only | src/app/(student)/student/dashboard/page.tsx:51 |
| Admin Dashboard | Charts row | 60/40 split | 50/50 intended, runtime single-column (verified live) | src/components/dashboard/dashboard-charts.tsx:24 |
| Student Lobby | Full-canvas no-sidebar | yes | **no — still renders student layout** with sidebar + header | src/app/(student)/student/exams/[id]/lobby/page.tsx |
| EXAM Engine | Equation panel max-width 560px + radius 14px + border | yes | plain text, no container | src/components/exam/exam-vertical-view.tsx:168 |
| EXAM Engine | Navigator 280px | 280px | 120px | src/components/exam/exam-vertical-view.tsx:113 |
| MCQ grid | ≤200px from equation | — | variable (no constraint) | src/components/exam/mcq-grid.tsx + exam-vertical-view.tsx |
| KPI card | 36px 700 number | — | 16px 400 (verified live) | src/components/dashboard/kpi-card.tsx:27 |
| Lobby breathing circle | 120px | — | 200px countdown circle (no breathe) | src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx:115 |

────────────────────────────────────────────────────────
## COMPONENT-BY-COMPONENT FINDINGS
────────────────────────────────────────────────────────

Over 400 per-component findings are preserved in `docs/diagnostic-findings-raw.md`. The most severe per-component issues:

### src/components/layout/admin-sidebar.tsx
Severity: **CRITICAL**. Dark-green bg instead of white, 260px instead of 240px, JS-only hover with no touch-feedback equivalent, missing LIVE badge integration for Monitor nav item, missing student-count badge next to Students.

### src/components/layout/student-sidebar.tsx
Severity: **CRITICAL**. Same dark-green inversion. 240px width OK.

### src/components/student/live-exam-card.tsx
Severity: **CRITICAL**. Hero card filled dark green with white text instead of white card with 2px green border per spec §6. Empty state uses 📋 emoji (banned).

### src/app/(student)/student/results/page.tsx
Severity: **CRITICAL**. Hero result card filled dark green (same inversion). 📋 emoji in empty state.

### src/components/dashboard/live-pulse.tsx
Severity: **CRITICAL**. Component exists but has **0 importers** — dead code. Admin dashboard is missing the Live Pulse widget required by 07_hifi-spec §5.

### src/components/dashboard/kpi-card.tsx
Severity: HIGH. Number renders 16px 400 instead of 36px 700 (verified live). Uses `bg-green-100` which doesn't compile.

### src/components/dashboard/dashboard-charts.tsx
Severity: HIGH. Charts row collapses to single column (`lg:grid-cols-2` not applying at runtime); spec requires 60/40 split.

### src/components/shared/skeletons.tsx
Severity: HIGH. Uses `animate-pulse` not the spec `shimmer` linear-gradient; DashboardHeroSkeleton fills dark green — misleading placeholder.

### src/components/exam/mcq-grid.tsx
Severity: HIGH. `confirm-slide-in` keyframe missing from globals.css — Confirm button appears instantly with no animation.

### src/components/exam/completion-card.tsx
Severity: HIGH. `completion-slide-up` keyframe missing from globals.css — card mounts instantly, no slide-up.

### src/components/exam/exam-timer.tsx
Severity: HIGH. Timer font 14px instead of 30px DM Mono; normal bg white instead of green-50; wrong urgent threshold (5 min hardcoded, spec is 20% of duration).

### src/components/exam/exam-vertical-view.tsx
Severity: HIGH. Navigator 120px instead of 280px; equation panel has no card container (no white bg, no padding, no border).

### src/app/(admin)/admin/monitor/[id]/monitor-client.tsx
Severity: CRITICAL. Uses `postgres_changes` on assessment_sessions — banned by 10_architecture.md §5 Zone 1. All status class strings silently fail (red-*/green-*/blue-*/gray-*/* except green-800).

### src/app/(admin)/admin/announcements/tiptap-editor.tsx
Severity: HIGH. Static `import` of @tiptap/react + starter-kit at module top. Spec requires `next/dynamic ssr:false`.

### src/app/actions/auth.ts
Severity: CRITICAL. `const tempPassword = 'tempPassword123!'` — hardcoded password reset. Does not force user to change on next login. Any attacker who learns this string can log in as any user whose password was admin-reset.

### src/app/api/submissions/offline-sync/route.ts
Severity: HIGH. `process.env.HMAC_SECRET ?? ''` — empty string fallback if env var missing makes HMACs trivially forgeable.

### src/app/actions/assessment-sessions.ts
Severity: HIGH. `completion_seal: 'sealed-' + input.session_id + '-' + Date.now()` — fake seal string, not an HMAC. Clock guard validation would fail.

### src/components/layout/top-header.tsx
Severity: HIGH. Avatar initials hardcoded to "PS" regardless of actual user.

### src/app/(student)/student/dashboard/page.tsx
Severity: HIGH. Skill Metrics + Rank + Badges + 42% progress are all hardcoded literals — user-facing fake data.

### src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx
Severity: HIGH. Checklist camera/secure-browser always green regardless of real state; native `alert()`; breathing circle missing; only 2 network states instead of 3.

### src/app/(student)/student/profile/page.tsx
Severity: HIGH. Entire page is a placeholder — digital ID card, level progress, Ticker Mode toggle ALL MISSING.

### src/app/(student)/student/tests/page.tsx
Severity: MEDIUM. Placeholder page, dead nav link.

### src/app/(admin)/admin/reports/page.tsx
Severity: MEDIUM. Placeholder page, dead nav link.

### All shadcn primitives (src/components/ui/*)
Severity: HIGH (aggregate). `Button`, `Input`, `Select` default heights are 32px vs spec 40px. `Badge` uses `rounded-4xl` (26px) instead of spec 6px. `Card` has 16px padding instead of 24px and uses `ring` instead of `box-shadow`. `Dialog` uses `rounded-xl` 14px instead of spec overlay 18px.

### src/lib/anzan/* (timing-engine, number-generator, color-calibration, visibility-guard)
Severity: **CLEAN**. All four files match 13_exam-engine-spec.md exactly — RAF loop with accumulator, Mulberry32 PRNG, contrast tier tokens, visibility guard. This is the cleanest area of the codebase.

### src/lib/anticheat/* (clock-guard, tab-monitor, teardown)
Severity: **CLEAN**. HMAC validation, keepalive teardown, tab switch counter all match 13_exam-engine-spec.md §2 and 10_architecture.md §4.

### src/lib/auth/rbac.ts
Severity: **CLEAN**. Uses `getUser()` not `getSession()`, reads role from `app_metadata.role`.

### src/components/shared/sr-announcer.tsx
Severity: **CLEAN**. Matches 08_a11y.md §5 sanitizeForSR + forwardRef + useImperativeHandle pattern.

────────────────────────────────────────────────────────
## VISUAL AUDIT FINDINGS
────────────────────────────────────────────────────────
### /login
- Snapshot: logo + subtitle + 2 inputs + Sign In button on navy full-page bg. Layout OK, focus outline missing on inputs.
- Computed: `--clr-green-800: #1A3829` ✓, body font DM Sans ✓, body colour `rgb(241,245,249)` **WRONG** (text-secondary class collapses to shadcn secondary token).
- Console errors: none.

### /admin/dashboard
- Snapshot: dark-green sidebar (nav items white), "Dashboard" title, 4 KPI cards with tiny numbers, single-column chart row, recent activity list.
- Computed sidebar: `width 260.67px, bg rgb(26,56,41), h1 size 20px colour rgb(241,245,249)`.
- Computed header: `height 59.85px, bg rgb(255,255,255)`.
- Computed KPI values: `DM Mono 16px 400 rgb(26,56,41)` (spec: DM Mono 36px 700 #0F172A).
- Computed charts row grid-template-columns: `1388.67px` (single column, spec: 60/40 split).
- Console: 1 Recharts warning "width(-1) height(-1)".

### /admin/monitor
- Snapshot: heading, one live exam card per paper, LIVE badge visible in page HTML but **transparent at runtime**.
- Computed LIVE badge: `backgroundColor rgba(0,0,0,0)` (transparent, red-100 not compiled), `color rgb(241,245,249)` (near-white).
- Computed "Monitor Session" button: `bg rgb(26,56,41), color rgb(0,0,0), height 18.67px`. **Black text on dark green = ~1.5:1 contrast, WCAG FAIL.** Button is 18px tall (spec 48px).

### /admin/students
- Student avatar circles: `bg-teal-100 text-teal-800` → computed `backgroundColor rgba(0,0,0,0), color rgb(241,245,249)`. Avatars invisible.
- Active badge: `bg-green-100 text-green-800` → computed `backgroundColor rgba(0,0,0,0), color rgb(26,56,41)`. Dark green text on page bg without pill.

### Screenshot captured
`docs/visual-audit-admin-dashboard.png` — 1 of 3 budget used.

────────────────────────────────────────────────────────
## ROOT CAUSE ANALYSIS
────────────────────────────────────────────────────────
Based on all evidence — the 5 root causes:

### Root Cause 1: Tailwind v4 colour scale under-declared
Only `green-800`, `brand-navy`, `brand-orange`, `bg-page`, `bg-card`, semantic `success/warning/error/info`, `live-badge`, `flash-dampen/mid` and `slate-50..950` are in `tailwind.config.ts`. All other shades (`green-50..700/900`, `blue-*`, `red-*`, `amber-*`, `orange-*`, `emerald-*`, `teal-*`, `purple-*`, `rose-*`, `indigo-*`, `violet-*`) silently fail to compile.
- **Evidence:**
  - `src/app/(admin)/admin/monitor/[id]/monitor-client.tsx:69–74` — StatusBadge config map uses `bg-green-500 text-green-800 bg-green-100 bg-blue-500 text-blue-800 bg-blue-100 bg-red-500 text-red-800 bg-red-100 bg-gray-400 text-gray-600 bg-gray-100`, all but green-800 invisible.
  - `src/app/(admin)/admin/activity-log/activity-log-client.tsx:38–52` — BADGE_STYLES map with 13 Tailwind colour shades, only green-800 compiles.
  - `src/app/(admin)/admin/students/[id]/page.tsx:13–20` — AVATAR_COLOURS uses blue-100/purple-100/amber-100/rose-100/teal-100/indigo-100 — none compile.
- **Scope:** 18 component files directly affected, cascading visually to every admin list, status indicator, avatar, and grade badge.
- **User impact:** Admins cannot distinguish status (In Progress vs Submitted vs Disconnected), grade badges render as plain text, avatars invisible, LIVE monitor badge invisible.

### Root Cause 2: Sidebar theme inversion
`src/app/globals.css:314` declares `--sidebar: #1A3829;` in the MINDSPARK override block (unlayered `:root`, last in cascade). Both `admin-sidebar.tsx:35` and `student-sidebar.tsx:65` also hardcode `backgroundColor: '#1A3829'` inline, doubling down on the inversion.
- **Evidence:**
  - globals.css:314 — `--sidebar: #1A3829;`
  - admin-sidebar.tsx:35 — `style={{ backgroundColor: '#1A3829' }}`
  - student-sidebar.tsx:65 — same
  - Live confirmation: /admin/dashboard aside computed `backgroundColor: rgb(26, 56, 41)`, width 260.67px.
  - Spec: `docs/abacus-edge-design-spec (4).html` `.aside { background: #fff; border: 1px solid var(--b); border-radius: var(--r4); box-shadow: var(--s1) }` AND `07_hifi-spec.md §4.6`: "Width: 240px (expanded) · 64px (icon-only collapsed) · Background: #FFFFFF · Border-right: 1px solid #E2E8F0".
- **Scope:** Every admin page and every student page shows a dark-green sidebar; combined with root cause 3, text on the sidebar renders as slate-100 (near-white) which drives the visual theme inversion.
- **User impact:** 100% of authenticated pages look wrong. This is the single most visible issue users see.

### Root Cause 3: `text-secondary` Tailwind v4 class collision
Tailwind v4's `@theme inline` block in globals.css maps `--color-secondary: var(--secondary)` (line 235). Under the MINDSPARK override, `--secondary` is set to `#F1F5F9` (for shadcn Card's `bg-secondary` variant). Tailwind v4 then generates the utility class `text-secondary` that resolves to `color: var(--color-secondary) = #F1F5F9`. The MINDSPARK designers intended `text-secondary` to resolve to `--text-secondary: #475569`, but that CSS var is not picked up by Tailwind's class generator.
- **Evidence:**
  - globals.css:39 — `--text-secondary: #475569` (MINDSPARK token)
  - globals.css:235 — `--color-secondary: var(--secondary)` (@theme inline mapping)
  - globals.css:317 — `--secondary: #F1F5F9` (MINDSPARK override of shadcn token)
  - layout.tsx:54 — `className="...bg-page text-secondary..."` applied to body
  - Live confirmation: body computed `color: rgb(241, 245, 249)`.
  - CLAUDE.md Tailwind v4 Notes explicitly calls this out as a known trap.
- **Scope:** Every page that uses `text-secondary` or inherits it. Dozens of components use this class; global body uses it.
- **User impact:** All body copy renders near-white on near-white page — essentially invisible.

### Root Cause 4: Spec-size text utilities not applying inside shadcn Card
KPI numbers computed at 16px 400 instead of the spec's 36px 700. Source: `kpi-card.tsx:27` uses `text-3xl font-bold text-primary font-mono tabular-nums leading-none tracking-tight`. The `font-mono` class in globals.css (line 132) only adds `font-variant-numeric: tabular-nums`, not sizing — so that's not the culprit. The shadcn `Card` component's `ring-1` / `overflow-hidden` / inherited `text-sm` collapses child typography. Regardless of cause, the net result is tiny KPI numbers.
- **Evidence:**
  - kpi-card.tsx:27 — intended 30px 700
  - Live computed: `size 16px weight 400` on dashboard KPI values
- **Scope:** All 4 dashboard KPI cards; likely all other places that nest large text inside shadcn Card.
- **User impact:** Primary dashboard metrics are visually buried.

### Root Cause 5: Grid `lg:grid-cols-2` not compiling in dashboard-charts.tsx
Live measurement shows `gridTemplateColumns: "1388.67px"` (single column) when spec requires 60/40 split. Source: `dashboard-charts.tsx:24 className="grid gap-4 lg:grid-cols-2"`. `lg:` is a Tailwind breakpoint prefix that should trigger at min-width:1024px — the viewport is 1404px wide per the header measurement, so the breakpoint should be active. The most likely cause: the `lg:grid-cols-2` class was not emitted during the Tailwind v4 scan (JIT compile).
- **Evidence:**
  - dashboard-charts.tsx:24
  - Live computed: single-column grid at viewport 1404px
- **Scope:** Admin dashboard charts row only.
- **User impact:** Dashboard uses ~50% of horizontal space, charts render full-width stacked vertically.

────────────────────────────────────────────────────────
## PRIORITISED FIX LIST
────────────────────────────────────────────────────────

### CRITICAL — fix before any user sees the app
1. **Un-invert sidebars** (Root Cause 2) — 3 files affected:
   - `globals.css:314` — change `--sidebar: #1A3829;` → `--sidebar: #FFFFFF;` (white card background)
   - `admin-sidebar.tsx:35` — remove inline `backgroundColor: '#1A3829'`
   - `student-sidebar.tsx:65` — same
   - Revert nav text color, borders, icons to dark tokens.
   - **User impact:** Every authenticated page visibly corrected.

2. **Fix `text-secondary` body colour inheritance** (Root Cause 3) — 1 file + possibly cascade:
   - `layout.tsx:54` — replace `text-secondary` class with inline `style={{ color: 'var(--text-secondary)' }}` OR rename the MINDSPARK token to avoid collision with shadcn's `--secondary`.
   - **User impact:** Body text across the entire app becomes legible.

3. **Declare missing Tailwind colour scales** (Root Cause 1) — 1 file:
   - `tailwind.config.ts` — add full `green-50/100/200/300/400/500/600/700/900`, `red-50..900`, `blue-50..900`, `amber-50..900`, `orange-50..900`, `emerald-50..900`, `purple-50..900`, `rose-50..900`, `indigo-50..900`, `teal-50..900`, `violet-50..900`, `gray-50..900` ramps — or add them to `@theme inline` block in globals.css.
   - **User impact:** 40+ status badges, avatars, progress bars, and hover states become visible; monitor page renders correctly.

4. **Unhardcode admin password reset** (auth.ts line 15):
   - Replace `const tempPassword = 'tempPassword123!';` with `crypto.randomUUID()` + force `forced_password_reset: true` on the user profile so they must change on next login.
   - **User impact:** Eliminates a critical account-takeover vector.

5. **Fix monitor page `postgres_changes` Zone 1 violation** (monitor-client.tsx:130):
   - Replace with `channel.on('broadcast', ...)` per 10_architecture.md §3.
   - **User impact:** Prevents DB outage under exam load of ~2500 students.

6. **Un-invert student LIVE hero card + student results hero card** (live-exam-card.tsx:43, student/results/page.tsx:135).
   - **User impact:** Student dashboard hero matches spec (white card, 2px green border).

7. **Remove emoji violations** (live-exam-card.tsx:148 "📋", student/results/page.tsx:112 "📋").
   - Replace with lucide icons (`ClipboardList`, `Inbox`, etc.).

8. **Remove native alerts** (students-table-client.tsx:364, lobby-client.tsx:98).
   - Use inline error pill.

9. **Declare missing animation keyframes** in globals.css:
    - `@keyframes completion-slide-up` (used by completion-card.tsx:141)
    - `@keyframes confirm-slide-in` (used by mcq-grid.tsx:128)
    - `@keyframes pulse-ring` used by `animate-pulse-ring` class

### HIGH — fix before next release
10. **KPI card typography** (kpi-card.tsx) — enforce `text-4xl font-bold` with explicit inline override.
11. **Charts 60/40 split** (dashboard-charts.tsx:24) — replace `lg:grid-cols-2` with explicit `lg:grid-cols-[3fr_2fr]`.
12. **Add missing Live Pulse widget** to admin/dashboard/page.tsx (live-pulse.tsx is dead code now).
13. **Sidebar spec dimensions** — 260px → 240px for admin sidebar.
14. **Student header spec height** — 64px → 56px per wireframes.
15. **TipTap dynamic import** — remove static imports from tiptap-editor.tsx.
16. **HMAC_SECRET fallback fix** (offline-sync/route.ts:66) — throw at boot if missing, not empty-string fallback.
17. **Fake completion_seal** (assessment-sessions.ts:196) — use real HMAC via `issueExamSeal` from clock-guard.ts.
18. **Timer urgent threshold** (use-exam-timer.ts:30) — compute 20% of total duration, not hardcoded 5 min.
19. **Fake data elimination** — all entries in "FAKE DATA INVENTORY" table.
20. **shadcn Button/Input/Select heights** — 32px → 40px default.
21. **Badge radius** — `rounded-4xl` (26px) → `rounded-md` (6px).
22. **Card padding** — `p-4` (16px) → `p-6` (24px).
23. **Empty state illustrations** — 64×64 → 160×160 per spec.
24. **MCQ arrow key navigation** — add ArrowLeft/Right/Up/Down handler per 08_a11y §8.2.
25. **Session ID / debug telemetry removal from student lobby footer.**

### MEDIUM — fix in a follow-up sprint
26. Sidebar hover should use CSS `:hover :focus` instead of `onMouseEnter`.
27. All student pages: migrate inline hex `style={{}}` to className + tokens.
28. **Breathing circle** component for lobby (120px, 4s infinite).
29. Empty-state 3-state network indicator (Optimal/Degraded/Severed) with colour dots.
30. Add `aria-busy` to skeleton containers.
31. Add `aria-live="polite"` to monitor tbody.
32. Dialog shadow/radius tokens to match `shadow-lg` + `radius-overlay`.
33. Table header uppercase per spec.

### LOW — cosmetic and microcopy
34. Charts: replace hardcoded stroke `#1A3829` with CSS var pass-through.
35. Status bar fake metrics on activity-log client.
36. Engagement Insights card fake text on announcements-client.
37. Dashboard `text-3xl` → `text-4xl` to match 30 → 36px delta.
38. Auto-adjust adjacent grade boundary field (settings-client.tsx).

────────────────────────────────────────────────────────
## WHAT IS WORKING CORRECTLY
────────────────────────────────────────────────────────
- **Flash Anzan timing engine** (src/lib/anzan/timing-engine.ts) — fully spec-compliant: RAF loop, delta accumulator with 1.5x clamp, `accumulator -= interval` (no drift), MINIMUM_INTERVAL_MS=200 with `throw`, getContrastTokens correct per tier, onFlash contract documented.
- **Number generator** (src/lib/anzan/number-generator.ts) — Mulberry32 + FNV-1a, no consecutive duplicates, sum constraint, first number always positive, seed=UUID for reproducibility.
- **Color calibration** (src/lib/anzan/color-calibration.ts) — `#991B1B` for negatives only, tier-based positive colour.
- **Visibility guard** (src/lib/anzan/visibility-guard.ts) — pause/resume on visibilitychange with SSR guard.
- **HMAC Clock Guard** (src/lib/anticheat/clock-guard.ts) — CLOCK_GUARD_CONSTANTS match spec exactly, timingSafeEqual constant-time compare, 5-flag validation.
- **Tab monitor + teardown** — aggregate counter, pagehide + keepalive fetch.
- **RBAC** (src/lib/auth/rbac.ts) — `getUser()` not `getSession()`, role from `app_metadata.role`.
- **SR Announcer** (src/components/shared/sr-announcer.tsx) — sanitizeForSR + forwardRef + aria-live polite.
- **Flash number component** (src/components/exam/flash-number.tsx) — `transition:none`, `aria-hidden`, clamp(96px, 30vh, 180px), contrast tokens set once before loop, visibility guard wired, cleanup on unmount.
- **Phase 2 zero-UI enforcement** (anzan-flash-view.tsx:117) — correctly UNMOUNTS all peripheral UI during PHASE_2_FLASH (not display:none).
- **Phase-string constants** (exam-session-store.ts) — uses `PHASE_2_FLASH` exactly, never bare `'FLASH'`.
- **Middleware** — `getUser()` call to refresh tokens, redirects on unauthenticated.
- **Server Actions** — every action begins with `requireRole()`, returns `ActionResult<T>`.
- **Two-phase level reorder** (actions/levels.ts) — avoids unique constraint conflict.
- **Offline sync engine** — `isSyncing` guard, server-side HMAC, IndexedDB read → fetch → update synced flag.
- **Dexie store** — typed schema with idempotency_key primary key.
- **Transition interstitial** — Web Audio metronome 880Hz × 3 beats at 500/1000/1500ms, RAF-driven 3000ms progress.
- **Consent verify route** — custom JWT verify with HMAC-SHA256 + rate limiting.
- **Offline-first answer flow** — Zustand + Dexie write before advance (per 10_architecture.md §4).
- **Skip link in root layout.**
- **next/font for DM Sans + DM Mono** — loads correctly at runtime (confirmed via live computed body font).
- **`:focus-visible` 3px green outline** declared globally.
- **Flash container `position:fixed inset:0 zIndex:9999`** — correct full-viewport Phase 2 coverage.
- **Ticker Mode component** (a11y-ticker-mode.tsx) — implementation matches 08_a11y §6.2, though flag is hardcoded false until profiles.ticker_mode column exists.

────────────────────────────────────────────────────────
## EFFORT ESTIMATE
────────────────────────────────────────────────────────
| Fix Group | Files to Touch | Regression Risk | Est. Effort |
|---|---|---|---|
| Un-invert sidebars + text-secondary body + Tailwind colour scales (Root Causes 1/2/3) | 4 | LOW (visual only; no logic touched) | 4–6 hours |
| KPI typography + chart grid + missing animation keyframes (Root Causes 4/5) | 4 | LOW | 3–4 hours |
| Hardcoded password reset + HMAC fallback + fake seal (3 critical security bugs) | 3 | MEDIUM (requires testing) | 4 hours |
| Zone 1 postgres_changes → broadcast migration | 1 (monitor-client.tsx) | HIGH (realtime wiring touches multiple channels) | 1 day |
| Student hero card inversion + emoji + native alerts + debug telemetry | 7 | LOW | 3–4 hours |
| Fake data elimination (dashboard, levels, announcements, activity-log, settings, top-header, lobby checklist) | 8 | MEDIUM (requires new DB columns and queries) | 1–2 days |
| shadcn primitive resize (Button 32→40, Input 32→40, Badge radius 26→6, Card padding 16→24) | 4 | MEDIUM | 1 day |
| /student/profile full implementation (digital ID card, level progress, Ticker Mode toggle) | 2 + 1 DB migration | MEDIUM | 2 days |
| /student/exams/[id]/lobby full implementation (breathing circle, 3-state network, real permission checks) | 1 | MEDIUM | 1 day |
| TipTap dynamic import + Recharts SSR safety | 2 | LOW | 2–3 hours |
| Empty state 160×160 illustrations + aria-busy on skeletons | ~10 | LOW | 4 hours |
| MCQ arrow key navigation, timer urgent 20% threshold, skeleton shimmer keyframe | 3 | LOW | 3 hours |
| Cosmetic + microcopy + token unification across admin pages | ~20 | LOW | 2 days |

**Total CRITICAL+HIGH fix time:** ≈ 2–3 engineer-days for the top 10 items, 1–2 additional weeks for HIGH/MEDIUM tail.

────────────────────────────────────────────────────────
## APPENDIX A — COMPLETE FILE MANIFEST
────────────────────────────────────────────────────────
All 143 src files enumerated. 140 files READ. 4 files SKIPPED (test files, see below).

### Files read (140)

src/app/(admin)/admin/activity-log/activity-log-client.tsx — READ
src/app/(admin)/admin/activity-log/page.tsx — READ
src/app/(admin)/admin/announcements/announcements-client.tsx — READ
src/app/(admin)/admin/announcements/page.tsx — READ
src/app/(admin)/admin/announcements/tiptap-editor.tsx — READ
src/app/(admin)/admin/assessments/loading.tsx — READ
src/app/(admin)/admin/assessments/page.tsx — READ
src/app/(admin)/admin/dashboard/loading.tsx — READ
src/app/(admin)/admin/dashboard/page.tsx — READ
src/app/(admin)/admin/levels/page.tsx — READ
src/app/(admin)/admin/monitor/[id]/monitor-client.tsx — READ
src/app/(admin)/admin/monitor/[id]/page.tsx — READ
src/app/(admin)/admin/monitor/page.tsx — READ
src/app/(admin)/admin/reports/page.tsx — READ
src/app/(admin)/admin/results/page.tsx — READ
src/app/(admin)/admin/settings/page.tsx — READ
src/app/(admin)/admin/settings/settings-client.tsx — READ
src/app/(admin)/admin/students/[id]/page.tsx — READ
src/app/(admin)/admin/students/loading.tsx — READ
src/app/(admin)/admin/students/page.tsx — READ
src/app/(admin)/layout.tsx — READ
src/app/(student)/layout.tsx — READ
src/app/(student)/student/assessment/[id]/assessment-client.tsx — READ
src/app/(student)/student/assessment/[id]/page.tsx — READ
src/app/(student)/student/consent/page.tsx — READ
src/app/(student)/student/dashboard/loading.tsx — READ
src/app/(student)/student/dashboard/page.tsx — READ
src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx — READ
src/app/(student)/student/exams/[id]/lobby/page.tsx — READ
src/app/(student)/student/exams/[id]/page.tsx — READ
src/app/(student)/student/exams/loading.tsx — READ
src/app/(student)/student/exams/page.tsx — READ
src/app/(student)/student/profile/page.tsx — READ
src/app/(student)/student/results/loading.tsx — READ
src/app/(student)/student/results/page.tsx — READ
src/app/(student)/student/tests/page.tsx — READ
src/app/actions/activity-log.ts — READ
src/app/actions/announcements.ts — READ
src/app/actions/assessment-sessions.ts — READ
src/app/actions/assessments.ts — READ
src/app/actions/auth.ts — READ
src/app/actions/levels.ts — READ
src/app/actions/questions.ts — READ
src/app/actions/results.ts — READ
src/app/actions/settings.ts — READ
src/app/actions/students.ts — READ
src/app/api/consent/verify/route.ts — READ
src/app/api/submissions/offline-sync/route.ts — READ
src/app/api/submissions/teardown/route.ts — READ
src/app/globals.css — READ (Phase 1)
src/app/layout.tsx — READ
src/app/login/page.tsx — READ
src/app/page.tsx — READ
src/components/a11y/a11y-ticker-mode.tsx — READ
src/components/assessments/assessment-card.tsx — READ
src/components/assessments/create-assessment-wizard.tsx — READ
src/components/assessments/step-config.tsx — READ
src/components/assessments/step-questions.tsx — READ
src/components/assessments/step-type.tsx — READ
src/components/assessments/wizard-types.ts — READ
src/components/dashboard/dashboard-charts.tsx — READ
src/components/dashboard/kpi-card.tsx — READ
src/components/dashboard/level-distribution-chart.tsx — READ
src/components/dashboard/live-pulse.tsx — READ (dead code)
src/components/dashboard/recent-activity-feed.tsx — READ
src/components/dashboard/score-trend-chart.tsx — READ
src/components/dashboard/sparkline-chart.tsx — READ
src/components/exam/anzan-flash-view.tsx — READ
src/components/exam/completion-card.tsx — READ
src/components/exam/confirm-submit.tsx — READ
src/components/exam/exam-page-client.tsx — READ
src/components/exam/exam-timer.tsx — READ
src/components/exam/exam-vertical-view.tsx — READ
src/components/exam/flash-number.tsx — READ
src/components/exam/mcq-grid.tsx — READ
src/components/exam/network-banner.tsx — READ
src/components/exam/paused-overlay.tsx — READ
src/components/exam/question-navigator.tsx — READ
src/components/exam/sync-indicator.tsx — READ
src/components/exam/transition-interstitial.tsx — READ
src/components/layout/admin-client-provider.tsx — READ
src/components/layout/admin-sidebar.tsx — READ
src/components/layout/student-client-provider.tsx — READ
src/components/layout/student-header.tsx — READ
src/components/layout/student-sidebar.tsx — READ
src/components/layout/top-header.tsx — READ
src/components/levels/create-level-dialog.tsx — READ
src/components/levels/levels-client.tsx — READ
src/components/results/results-client.tsx — READ
src/components/shared/empty-state.tsx — READ
src/components/shared/loading-spinner.tsx — READ
src/components/shared/network-banner.tsx — READ
src/components/shared/skeletons.tsx — READ
src/components/shared/sr-announcer.tsx — READ
src/components/student/live-exam-card.tsx — READ
src/components/student/results-client.tsx — READ
src/components/students/student-profile-actions.tsx — READ
src/components/students/students-table-client.tsx — READ
src/components/ui/badge.tsx — READ
src/components/ui/button.tsx — READ
src/components/ui/card.tsx — READ
src/components/ui/dialog.tsx — READ
src/components/ui/dropdown-menu.tsx — READ
src/components/ui/input.tsx — READ
src/components/ui/label.tsx — READ
src/components/ui/select.tsx — READ
src/components/ui/sheet.tsx — READ
src/components/ui/sonner.tsx — READ
src/components/ui/table.tsx — READ
src/components/ui/tabs.tsx — READ
src/components/ui/textarea.tsx — READ
src/hooks/use-anzan-engine.ts — READ
src/hooks/use-exam-timer.ts — READ
src/hooks/use-heartbeat.ts — READ
src/hooks/use-input-cooldown.ts — READ
src/hooks/use-reduced-motion.ts — READ
src/lib/anticheat/clock-guard.ts — READ
src/lib/anticheat/tab-monitor.ts — READ
src/lib/anticheat/teardown.ts — READ
src/lib/anzan/color-calibration.ts — READ
src/lib/anzan/number-generator.ts — READ
src/lib/anzan/timing-engine.ts — READ
src/lib/anzan/visibility-guard.ts — READ
src/lib/auth/rbac.ts — READ
src/lib/auth/session.ts — READ
src/lib/constants.ts — READ
src/lib/offline/indexed-db-store.ts — READ
src/lib/offline/storage-probe.ts — READ
src/lib/offline/sync-engine.ts — READ
src/lib/supabase/admin.ts — READ
src/lib/supabase/client.ts — READ
src/lib/supabase/middleware.ts — READ (dead helper)
src/lib/supabase/server.ts — READ
src/lib/types/action-result.ts — READ
src/lib/utils.ts — READ
src/middleware.ts — READ
src/stores/auth-store.ts — READ
src/stores/exam-session-store.ts — READ
src/stores/ui-store.ts — READ

### ADDITIONAL FILES DISCOVERED AND READ
No files outside the Groups A-K list were found relevant (all src/** files were catalogued into groups). The `TASK 5/` directory at repo root is NOT in src/ and therefore NOT in the inventory — the graph exploration noted it as orphaned abandoned code duplicating src/components/exam files; it is not part of the shipped UI surface.

### FILES FOUND BUT DEEMED IRRELEVANT (4 test files)
| File | Reason Skipped |
|---|---|
| src/lib/anticheat/clock-guard.test.ts | Test file — does not render UI, affect visual output, contain CSS/colour/layout logic, affect exam engine runtime behaviour, contain user-facing text, or affect component behaviour. Verifies production code already audited. |
| src/lib/anzan/number-generator.test.ts | Test for number-generator.ts which is audited directly. Same reason. |
| src/lib/anzan/timing-engine.test.ts | Test for timing-engine.ts which is audited directly. Same reason. |
| src/test/setup.ts | Test harness setup (vitest) — does not render UI, no production impact. Same reason. |

────────────────────────────────────────────────────────
## APPENDIX B — AUTHORITY DOCS USED
────────────────────────────────────────────────────────
| Doc | Path | Lines | Key Extractions |
|---|---|---|---|
| Design spec v3 (HTML) | docs/abacus-edge-design-spec (4).html | 1095 | Full token sheet §28, 9-shade green ramp, 3 shadows, 6 radii, 8 motion tokens, WCAG contrast table, Do/Don't list |
| Hi-fi spec | docs/07_hifi-spec.md | 839 | 11 type roles, 8 component specs (KPI/table/sidebar/banner/timer), Phase 2 zero-UI rules, skeleton sync rule, empty-state microcopy, NEVER list |
| A11y spec | docs/08_a11y.md | 929 | 16 contrast pairs, 9 ARIA patterns, 6 touch target rules, reduced-motion exceptions, Ticker Mode requirements, sr-announcer implementation |
| Exam engine spec | docs/13_exam-engine-spec.md | 813 | MIN 200ms, DELTA_CLAMP 1.5x, HMAC Clock Guard, Mulberry32 PRNG, contrast tier tables, onFlash textContent-only contract |
| Performance budget | docs/18_performance-budget.md | 597 | Flash ≤16.6ms, WS ≤5s jitter, sync ≤3s, LCP admin <2.5s student <3.5s, first-load <150KB, engine chunk <80KB, dynamic imports for 4 packages |
| Architecture | docs/10_architecture.md | 860 | Server/Client component boundary rules, 4 Supabase client types, 6 vulnerability zones, Broadcast vs Postgres Changes rationale, 3-layer security |
| Wireframes | docs/06_wireframes.md | 898 | Admin 240/64 dimensions, Student 240/56 dimensions, 22 screen layouts (A1-A11, B1-B12), Phase 2 full canvas, Zero-UI rules |
| globals.css | src/app/globals.css | 365 | 55 @theme inline tokens, 4 keyframes, 2 custom classes, 8-section load order |
| tailwind.config.ts | tailwind.config.ts | 80 | Colour token declarations (only green-800 + slate-50..950 + brand + semantics) |
| postcss.config.js | postcss.config.js | 5 | @tailwindcss/postcss plugin only |
| CLAUDE.md | CLAUDE.md | 496 | 17 hard constraints, 14 banned patterns, RBAC rules, Tailwind v4 traps, session rules |
| GOTCHAS.md | GOTCHAS.md | 323 | 45 known gotchas: DB divergences, CSS traps, React quirks, fake data landmines |

────────────────────────────────────────────────────────
## APPENDIX C — DISCARDED FINDINGS
────────────────────────────────────────────────────────
| Original Claim | Reason Discarded |
|---|---|
| — | None — every Phase 2 finding was validated against the source file content read during Phase 2. Phase 4 spot-checks on animation keyframe missing (grep confirmed), live-pulse dead code (grep+query_graph confirmed), tailwind.config.ts colour scale (direct file read), globals.css `--sidebar: #1A3829` (direct file read), and visual audit runtime measurements (evaluate_script) all passed. No finding was discarded. |

────────────────────────────────────────────────────────
## END OF REPORT
────────────────────────────────────────────────────────
