# Diagnostic Findings — Raw Log
Session: 2026-04-11 evening
Model: Claude Opus 4.6 (1M context)
Spec authorities: 12 files read (Phase 1 complete)
Graph queries: 8 run (Phase 1.5 complete)

Each entry format:
## FILE: [verified path]
- line [N] | SEV: [CRITICAL|HIGH|MEDIUM|LOW] | SPEC: [doc § ref] | [finding]

Legend:
- CRITICAL = blocks core flow (students can't take exams, admins can't see data)
- HIGH     = visual contradiction of spec, widely visible (affects every page)
- MEDIUM   = spec drift on single component, fixable in isolation
- LOW      = cosmetic, microcopy, or minor token drift

---

## FILE: src/app/layout.tsx
- line 54 | SEV: HIGH | SPEC: CLAUDE.md Tailwind v4 Notes, 07_hifi-spec.md §1 | `text-secondary` class resolves to shadcn `--secondary` (#F1F5F9 background color token) NOT MINDSPARK `--text-secondary` (#475569). Body text color on every page is therefore wrong. Must use `style={{ color: 'var(--text-secondary)' }}`.
- line 65 | SEV: MEDIUM | SPEC: CLAUDE.md Hard Constraints | Skip link uses `text-[#1A3829]` and `border-[#1A3829]` — hardcoded hex in className bypasses token system. Should reference `var(--clr-green-800)`.

## FILE: src/middleware.ts
- line 42–52 | SEV: MEDIUM | SPEC: 10_architecture.md §8 | Middleware only gates on `!user`, no role-based redirect. A logged-in student accessing `/admin/*` is not redirected here (Layer 1 per 3-layer security model). Layer 2 (`requireRole`) catches it later but Layer 1 per spec should redirect "wrong-role users to their correct panel".

## FILE: src/app/login/page.tsx
- line 52 | SEV: MEDIUM | SPEC: CLAUDE.md "No new inline style hex values" | `backgroundColor: '#204074'` — hardcoded. Should use `var(--clr-brand-navy)`.
- line 64 | SEV: MEDIUM | SPEC: CLAUDE.md | `backgroundColor: '#FFFFFF'` — should be `var(--bg-card)`.
- line 65 | SEV: MEDIUM | SPEC: abacus-edge-design-spec §10 Border Radius Scale | `borderRadius: '20px'` — no such token; spec max is `--r5 18px`. Login card radius non-spec.
- line 68 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §3 Shadow Scale | `boxShadow: '0 20px 60px rgba(0,0,0,0.3)'` — does not match any of shadow-sm/md/lg. Spec shadow-lg is `0 8px 32px rgba(15,23,42,0.16)`.
- line 77 | SEV: MEDIUM | SPEC: CLAUDE.md | `color: '#1A3829'` — should be `var(--clr-green-800)`.
- line 85 | SEV: MEDIUM | SPEC: CLAUDE.md | `color: '#475569'` — should be `var(--text-secondary)`.
- line 99 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §2 type scale | Label `fontSize: '14px'` matches body-sm; acceptable.
- line 111 | SEV: MEDIUM | SPEC: CLAUDE.md | `border: '1px solid #E2E8F0'` — should be `var(--clr-slate-200)` or `#E2E8F0` token.
- line 120 | SEV: HIGH | SPEC: 08_a11y.md §7.1 | Input `outline: 'none'` with NO replacement `:focus-visible` style. Violates WCAG 2.2 SC 2.4.11 Focus Appearance. Same for password input line 141.
- line 166 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.1 | Primary button `backgroundColor: '#1A3829'` hardcoded; should use token. Also `fontSize: '14px'` but spec specifies DM Sans 15px 600.
- lines 45–184 | SEV: HIGH | SPEC: CLAUDE.md Hard Constraints "No new inline style hex values" | **Entire login page uses inline `style={{}}` with hardcoded hex values throughout.** Zero token references. This page is THE brand anchor per design spec §Philosophy — and it bypasses the entire token system.

## FILE: src/app/(admin)/layout.tsx
- line 25 | SEV: LOW | SPEC: CLAUDE.md Tailwind v4 Notes | Uses `bg-bg-page` class — per tailwind.config.ts this resolves to `#F8FAFC`, correct token use.
- line 29 | SEV: LOW | SPEC: 07_hifi-spec.md §3 | Main uses `p-8` = 32px which is spec's page-level section spacing, acceptable.

## FILE: src/app/(student)/layout.tsx
- line 27 | SEV: MEDIUM | SPEC: CLAUDE.md Hard Constraints | `style={{...backgroundColor: '#F8FAFC'}}` hardcoded. Should use `var(--bg-page)`.
- line 31 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §3 | `padding: '24px'` — matches spacing scale 24px but should reference token.
- whole file | SEV: LOW | Uses inline styles rather than className tokens — acceptable for layout-level primitive.

## FILE: src/components/layout/admin-sidebar.tsx
- line 34 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.6, 06_wireframes.md §Layout Grid | `w-[260px]` — **spec says 240px (hi-fi §4.6) and 240px (wireframes)**. Design spec §23 Layout Summary says 260px but the dominant spec authority is 07_hifi-spec.md which says 240px. Implementation is 260px. 20px wider than spec.
- line 35 | SEV: **CRITICAL** | SPEC: 07_hifi-spec.md §4.6 (`Background: #FFFFFF`), abacus-edge-design-spec HTML `.aside {background:#fff}` | `backgroundColor: '#1A3829'` — **COMPLETE VISUAL INVERSION**. Spec sidebar is WHITE with #E2E8F0 border. Implementation is dark green with white 10% border. This single decision drives the majority of "UI looks wrong" reports.
- line 35 | SEV: CRITICAL | SPEC: 07_hifi-spec.md §4.6 (`Border-right: 1px solid #E2E8F0`) | `borderRight: '1px solid rgba(255,255,255,0.1)'` — matches the inverted green theme; should be light slate-200.
- line 41 | SEV: HIGH | SPEC: design-spec sidebar `.aside-txt {color:var(--t1) #0F172A}` | `text-white` on logo — should be `#0F172A` on white sidebar bg.
- line 62 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.6 | Active state `backgroundColor: 'rgba(255,255,255,0.92)'` — spec says active `bg #F0FDF4` (green-50), text `#1A3829`, left `3px solid #1A3829` border. Implementation has no left border accent.
- line 56 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.6 (`height 40px, radius 8px, padding 0 12px`) | Nav items use `py-3 px-4` (12px/16px padding) and `rounded-[10px]`. Height is not fixed — computes from padding + line-height. Radius should be 8px not 10px per hi-fi spec.
- lines 65–78 | SEV: HIGH | SPEC: 08_a11y.md §4 "No Hover-Only Interactions" | Hover state implemented via `onMouseEnter`/`onMouseLeave` JS handlers. Keyboard focus state not equivalent — focus-visible ring exists but no bg change. Touch users (tablets) get no feedback on tap-down.
- whole file | SEV: HIGH | Missing: LIVE badge integration for Monitor item (spec §4.6 `LIVE badge: positioned right of label, bg #EF4444`). Missing: student count badge `248` next to Students (design spec sidebar demo shows `<span class="bct">248</span>`). NAV_ITEMS array doesn't support badge flag.

## FILE: src/components/layout/student-sidebar.tsx
- line 64 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.6 | `w-[240px]` matches spec. OK.
- line 65 | SEV: **CRITICAL** | SPEC: same as admin-sidebar | `backgroundColor: '#1A3829'` — same inversion error as admin sidebar. Student sidebar per design spec `.aside` class is WHITE.
- lines 1–90 | SEV: HIGH | Identical dark-green-theme pattern as admin-sidebar, including onMouseEnter hover handlers, no left-border accent on active, active state uses `rgba(255,255,255,0.92)` instead of spec `#F0FDF4`.
- whole file | SEV: LOW | Missing LIVE badge on Exams item when an exam is live (per design spec sidebar demo row with `<span class="bdg blv">LIVE</span>`).

## FILE: src/components/layout/top-header.tsx
- line 85 | SEV: HIGH | SPEC: 07_hifi-spec.md | **Avatar initials hardcoded as "PS"** — never reflects actual signed-in user. Should accept `fullName` prop and compute initials like student-header does.
- line 101 | SEV: MEDIUM | SPEC: — | Settings menu item always routes to `/admin/settings`. If reused for teacher/student it would route incorrectly.
- line 33 | SEV: LOW | Height 64px matches admin wireframe. OK.
- lines 35–40 | SEV: MEDIUM | Uses inline hardcoded hex `#FFFFFF`, `#E2E8F0`, `#0F172A` — should reference tokens per CLAUDE.md.

## FILE: src/components/layout/student-header.tsx
- line 22 | SEV: HIGH | SPEC: 06_wireframes.md §Global Layout Grid ("Student panel: Top header: 56px fixed height") | `height: '64px'` — should be **56px** per wireframes. Mismatch with spec by 8px.
- lines 20–35 | SEV: MEDIUM | Inline styles with hardcoded hex values instead of tokens. `#FFFFFF`, `#E2E8F0`, `#475569`, `#0F172A`, `#F8FAFC`, `#1A3829` — all should be token references.
- line 14 | SEV: LOW | Initials computed from fullName (correct pattern vs. top-header).
- line 40 | SEV: MEDIUM | `borderRadius: '8px'` on bell button — not a design spec token value. Spec radius-btn is 10px.
- whole file | SEV: MEDIUM | Uses `onMouseEnter`/`onMouseLeave` via useState for hover instead of CSS — same pattern violation as sidebars.

## FILE: src/components/layout/admin-client-provider.tsx
- whole file | SEV: CLEAN | Session guard + sync engine initialisation. No UI. Acceptable.

## FILE: src/components/layout/student-client-provider.tsx
- whole file | SEV: CLEAN | Session guard + sync engine initialisation. Renders children (unlike admin). Acceptable.

## FILE: src/components/ui/button.tsx
- line 32 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.1 ("All buttons: height 40px (default), 48px (large CTAs)") | `size default: "h-8"` = **32px**. Should be 40px. Affects every shadcn Button in admin pages.
- line 34 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.1 + 08_a11y.md §4 | `size sm: "h-7"` = 28px, `size xs: "h-6"` = 24px. Both below paediatric touch minimum 44px. OK only if never rendered for students.
- line 35 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.1 | `size lg: "h-9"` = 36px. Should be 48px per large CTA spec.
- whole file | SEV: MEDIUM | Missing `size: "xl"` variant for 56px Begin Flash button (B5 wireframe).
- line 16 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.1 | `variant outline: border-border bg-background` — generic border token and page bg. Spec secondary button: `bg #FFFFFF, 1.5px #1A3829 border, text #1A3829`. Current outline uses `#E2E8F0` border (wrong colour).
- line 23 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.1 | `variant destructive: bg-destructive/10 text-destructive` — close to spec but no explicit `1.5px #DC2626 border`.

## FILE: src/components/ui/badge.tsx
- line 6 | SEV: HIGH | SPEC: 07_hifi-spec.md §3 (radius-badge 6px), abacus-edge-design-spec (`--r2: 6px` for status badges) | `rounded-4xl` resolves via @theme inline `--radius-4xl: calc(var(--radius) * 2.6)` ≈ 26px. Spec says 6px. Badges render MASSIVELY over-rounded.
- whole file | SEV: HIGH | SPEC: 07_hifi-spec.md §4.3 | Missing variants: `success` (DCFCE7/#166534), `warning` (FEF9C3/#854D0E), `info` (EFF6FF/#1D4ED8), `live` (#EF4444/#FFFFFF + pulse animation), `draft` (F1F5F9/#475569), `closed` (#0F172A/#FFFFFF). Only `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` exist — none match spec status badges.
- line 6 | SEV: LOW | `h-5` = 20px badge height matches spec (10px DM Sans 700 inside with padding).

## FILE: src/components/ui/card.tsx
- line 15 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §3 | `rounded-xl` resolves to `--radius-xl` = `calc(var(--radius) * 1.4)` = ~14px if `--radius: 0.625rem`. Matches spec radius-card 14px. OK.
- line 15 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.4 ("padding 24px") | `py-4` = 16px vertical padding. Should be 24px.
- line 29 | SEV: HIGH | SPEC: same | CardHeader `px-4` = 16px horizontal padding. Should be 24px.
- line 77 | SEV: HIGH | SPEC: same | CardContent `px-4` = 16px. Should be 24px.
- line 15 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §3 shadow-sm / abacus-edge-design-spec `--s1` | `ring-1 ring-foreground/10` used instead of `box-shadow: var(--shadow-sm)`. `ring` is a 1px fake border, not a drop shadow. Cards render flat without the spec's `0 1px 3px rgba(0,0,0,.06)` subtle shadow.

## FILE: src/components/ui/input.tsx
- line 11 | SEV: HIGH | SPEC: 08_a11y.md §4 (44px touch min) and 07_hifi-spec.md §4.1 (40px default buttons/inputs) | `h-8` = 32px. Below paediatric touch minimum (44px) AND below UI standard (40px).
- line 11 | SEV: LOW | `rounded-lg` resolves to 10px — matches radius-btn. OK.
- line 11 | SEV: LOW | `md:text-sm` = 14px desktop, `text-base` = 16px mobile (prevents iOS zoom). Good pattern.

## FILE: src/components/ui/label.tsx
- line 12 | SEV: LOW | `text-sm leading-none font-medium` — 14px 500 matches spec body-sm for labels. OK.
- whole file | SEV: MEDIUM | Missing `htmlFor` prop enforcement and required `*` indicator pattern per 08_a11y.md §2.9.

## FILE: src/components/ui/select.tsx
- line 44 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.1 | `data-[size=default]:h-8` = 32px. Below 40px standard. Same issue as Input/Button.
- line 44 | SEV: MEDIUM | `rounded-lg` = 10px matches radius-btn.
- line 102 | SEV: LOW | SelectItem uses `rounded-md` — ~8px. Acceptable for menu items.

## FILE: src/components/ui/textarea.tsx
- line 10 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §3 | `min-h-16` = 64px min matches touch target. `rounded-lg` 10px OK.

## FILE: src/components/ui/tabs.tsx
- line 27 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §5 assessments tabs (EXAM/TEST) | `rounded-lg p-[3px]` — tabs container 10px radius, 3px padding. Spec doesn't specify tab styling directly but §A5 Assessments list says "[EXAM] [TEST] ← tabs". Default variant uses `bg-muted` which is #F8FAFC after override — nearly invisible on page bg.
- line 27 | SEV: LOW | `group-data-horizontal/tabs:h-8` = 32px container height. Touch targets OK since padding pushes triggers smaller.

## FILE: src/components/ui/sonner.tsx
- whole file | SEV: LOW | Configures Sonner toast library with theme-aware tokens. Icons from lucide. OK.
- line 34 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §8 "Inline Loading" | `--border-radius: var(--radius)` = 10px. Spec toast uses `radius-pill 999px`. Toast isn't pill-shaped.

## FILE: src/components/ui/dialog.tsx
- line 32 | SEV: LOW | SPEC: 08_a11y.md §2.7 | Radix UI dialog from @base-ui — focus trap handled automatically. aria-modal via slot. Acceptable.
- line 51 | SEV: HIGH | SPEC: 07_hifi-spec.md §3 radius-overlay 18px | `rounded-xl` = 14px. Spec says modals use `--r5 18px` (radius-overlay). Dialog radius too small.
- line 51 | SEV: HIGH | SPEC: 07_hifi-spec.md §3 shadow-lg | `ring-1 ring-foreground/10` — no drop shadow. Modals render flat, no elevation. Spec shadow-lg `0 8px 32px rgba(15,23,42,0.16)` missing.
- line 51 | SEV: MEDIUM | `sm:max-w-sm` = 384px max — spec various modal widths. Acceptable default.
- line 34 | SEV: LOW | `bg-black/10` overlay — too light vs spec `rgba(15,23,42,0.4)` for `bg-overlay`. Dialog backdrop barely dims.

## FILE: src/components/ui/sheet.tsx
- line 55 | SEV: LOW | `data-[side=right]:sm:max-w-sm` = 384px. Spec A2 says sheets 480px. Sheets narrower than spec.
- line 55 | SEV: MEDIUM | `shadow-lg` class — Tailwind default shadow-lg, not spec's `shadow-lg` CSS var. Close enough visually.

## FILE: src/components/ui/table.tsx
- line 63 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.5 | `hover:bg-muted/50` — uses generic muted (#F8FAFC @ 50%). Spec row hover: `bg #F0FDF4` (green-50). Wrong colour.
- line 75 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.5 (`padding 12px 16px`, `text-[11px]` uppercase 600 #475569) | `h-10 px-2 font-medium` = 40px row, 8px padding. Padding too small; no uppercase; no bg-page header background.
- line 89 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.5 (`padding 14px 16px`) | `p-2` = 8px all. Too tight vs spec's 14/16px.
- whole file | SEV: HIGH | Missing right-align utility for numeric cells; missing `font-mono` slot for tabular-nums numeric columns.

## FILE: src/components/ui/dropdown-menu.tsx
- line 45 | SEV: LOW | `rounded-lg bg-popover` OK — matches spec radius-btn.
- line 84 | SEV: MEDIUM | `py-1` = 4px item height — below WCAG 44px touch target. Acceptable for desktop dropdown menus though.
- line 179 | SEV: LOW | Keyboard navigation via Radix — adequate per 08_a11y.md §8.

## FILE: src/components/shared/skeletons.tsx
- line 9 | SEV: HIGH | SPEC: 07_hifi-spec.md §8 (Skeleton Screens — `animation: shimmer 1.5s ease-in-out infinite`, linear-gradient shimmer) | Uses `animate-pulse` (opacity pulse) NOT the spec's `shimmer` background-position animation. Visually different: flash pulse vs. scrolling shimmer.
- line 9 | SEV: HIGH | SPEC: 07_hifi-spec.md §8 + design-spec `.sk-block` gradient | Skeletons use `bg-slate-200` solid fill — missing the `linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)` gradient required by spec. globals.css has `.skeleton` class (line 143) with the correct shimmer; skeletons.tsx does NOT use it.
- line 9 | SEV: MEDIUM | SPEC: 08_a11y.md §2.3 ("Container element: `aria-busy='true'`") | No `aria-busy` attribute on skeleton containers. No `aria-label="Loading content"`. Missing accessibility pattern.
- line 40 | SEV: HIGH | SPEC: CLAUDE.md "No new inline style hex values" | AssessmentCardSkeleton uses inline hex `#FFFFFF`, `#E2E8F0` directly. Should use tokens.
- line 75 | SEV: HIGH | SPEC: 07_hifi-spec.md §6 Student Dashboard LIVE hero card ("Background #FFFFFF card, 2px solid #1A3829") | DashboardHeroSkeleton uses `backgroundColor: '#1A3829'` (FILLED dark green) rather than white card with green border. **Live hero skeleton will render as a solid dark green block — visually misleading placeholder.**
- line 125 | SEV: MEDIUM | ExamCardSkeleton uses `borderRadius: '12px'` — not a spec token value (spec has 10, 14, 18).

## FILE: src/components/shared/empty-state.tsx
- line 12 | SEV: LOW | SPEC: 07_hifi-spec.md §9 | `rounded-[14px]` matches radius-card. OK.
- line 12 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §9 ("Illustration: 160px × 160px") | Icon container is `w-16 h-16` = 64px. Spec says 160px for empty state illustration.
- line 13 | SEV: LOW | `text-slate-300` for icon — matches spec #E2E8F0-ish subtle colour. OK.
- line 18 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §9 (`DM Sans 20px 700`) | `text-[20px] font-bold` OK, uses `text-primary`.
- line 21 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §9 (`DM Sans 15px 400 #475569 max-w-320px`) | `text-secondary` resolves to shadcn `--secondary` (#F1F5F9) background token — NOT MINDSPARK text-secondary #475569. **Body text will render with a pale grey background color utility. Same bug as layout.tsx.**
- line 21 | SEV: LOW | `max-w-sm` = 384px — spec says 320px. Close enough.
- whole file | SEV: MEDIUM | No `action` variants for each spec empty state (§9 table specifies 8 distinct empty states with different CTAs).

## FILE: src/components/shared/loading-spinner.tsx
- line 15 | SEV: HIGH | SPEC: CLAUDE.md "No hardcoded hex" | `bg-[#1A3829]/10 border-2 border-[#1A3829]` — hardcoded hex values in arbitrary classes. Should use `var(--clr-green-800)` via inline style.
- line 15 | SEV: LOW | SPEC: 08_a11y.md §3 | Uses `breathing-circle` class from globals.css (defined line 147) — correctly applies `animation: breathe 4s ease-in-out infinite` from globals.css. OK.
- line 20 | SEV: MEDIUM | SPEC: — | `text-secondary` — same token bug as elsewhere; resolves to shadcn secondary background not MINDSPARK text.
- line 10 | SEV: LOW | Missing spec's Lottie abacus loader per 07_hifi-spec.md §8 ("abacus-loader.json is primary loading indicator"). This is a spinner replacement, not the spec's Lottie.

## FILE: src/components/shared/network-banner.tsx
- line 10 | SEV: HIGH | SPEC: CLAUDE.md "No hardcoded hex" | `bg-[#FEF9C3] border-[#F59E0B] text-[#854D0E]` — hardcoded hex in arbitrary Tailwind classes. Should use token vars.
- line 10 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.7 ("Height 44px", `border-top 4px solid #F59E0B`) | Uses `border-b-4` (bottom border). Spec says `border-top`. Also `py-3` = 24px height with content — doesn't hit spec's 44px exactly.
- line 10 | SEV: LOW | SPEC: 08_a11y.md §2.2 | role="alert" + aria-live="assertive" + aria-atomic — correct per spec.
- line 10 | SEV: LOW | `z-[9999]` — matches spec z-index 9999.
- line 13 | SEV: LOW | Hardcoded microcopy matches spec approved text "The network is taking a quick break. Test paused. Teacher knows." — OK per 07_hifi-spec.md §10.

## FILE: src/components/shared/sr-announcer.tsx
- whole file | SEV: LOW | SPEC: 08_a11y.md §5 | Implements sanitizeForSR, forwardRef, useImperativeHandle, aria-live polite/atomic. Matches spec exactly. CLEAN.
- line 30 | SEV: LOW | `sr-only` class imported from globals.css — defined correctly at line 92.

## FILE: src/components/dashboard/kpi-card.tsx
- line 19 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.4 ("Container: bg #FFFFFF, shadow-md, radius-card 14px, padding 24px") | `shadow-sm` — spec says shadow-md for KPI cards. Card shadow too light.
- line 19 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.4 ("LIVE card: border 2px solid #1A3829 (green-800), pulse ring animation") | No variant for the LIVE KPI card with 2px green border and pulse ring. KPICard is generic — can't be the "Live Now" hero card from A1 wireframe.
- line 21 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.4 ("Label: DM Sans 13px 500, color #475569, uppercase tracking-wide") | CardTitle `text-sm text-secondary` — spec says 13px (text-[13px]) and UPPERCASE tracking-wide. Missing uppercase. Also `text-secondary` bug (resolves to shadcn bg token).
- line 27 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.4 ("Metric: DM Mono 36px 700") | `text-3xl` = 30px. Should be 36px (text-4xl or custom).
- line 35 | SEV: HIGH | SPEC: CLAUDE.md Tailwind v4 Notes | `bg-green-100` and `text-green-800` — BUT tailwind.config.ts only declares `green-800`, no `green-100`. `bg-green-100` silently fails (transparent/default).
- line 36 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.4 | Down trend uses `bg-slate-100 text-danger` — spec says error-bg #FEE2E2 / #DC2626 for negative trend badge.
- line 52 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §4.4 | SparklineChart passed `color="text-green-700"` but tailwind.config.ts doesn't declare green-700. Silent fail.

## FILE: src/components/dashboard/sparkline-chart.tsx
- line 8 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.4 ("Sparkline: Recharts 60×28px, stroke #1A3829") | Default width=120 height=40 — **not** 60×28 per spec. Also stroke comes from `color` prop using Tailwind class (`currentColor`) — but no tailwind-compiled green-500 class exists. Line will render transparent.
- line 7 | SEV: HIGH | Default color `"text-green-500"` — class does not compile (no green-500 in tailwind.config.ts). Sparkline appears invisible.
- whole file | SEV: LOW | Uses SVG polyline (not Recharts) — simpler than spec but the visual is an SVG line. Spec mentions "Recharts 60×28px" but a direct SVG line is acceptable functionally.

## FILE: src/components/dashboard/score-trend-chart.tsx
- line 32 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §5 Admin Dashboard ("Left: <LineChart> — 6-month score trend, stroke #1A3829, **fill rgba(26,56,41,0.06)**") | **Missing fill area under line.** Spec requires area fill rgba(26,56,41,0.06). This chart is a plain line, no area.
- line 39 | SEV: MEDIUM | SPEC: CLAUDE.md | Hardcoded `#E2E8F0`, `#475569`, `#1A3829` — should use tokens.
- line 42 | SEV: LOW | SPEC: 07_hifi-spec.md §2 (mono-data DM Mono 16px) | Axis tick `fontFamily: 'DM Mono'` on YAxis — OK for numeric axis. But wait: XAxis uses 'DM Sans' for month labels, OK.
- line 65 | SEV: LOW | Line stroke `#1A3829` correct.
- line 66 | SEV: LOW | `dot={{ r: 3 }}` — small dots OK.

## FILE: src/components/dashboard/level-distribution-chart.tsx
- line 34 | SEV: LOW | Bar chart, 280px height, proper empty state. OK.
- line 37 | SEV: MEDIUM | Hardcoded hex `#E2E8F0`, `#475569`, `#1A3829` throughout — should use tokens.
- line 64 | SEV: LOW | `fill="#1A3829"` matches spec.
- line 65 | SEV: LOW | `radius={[4, 4, 0, 0]}` — 4px top corners on bars. Minor cosmetic, spec doesn't specify.

## FILE: src/components/dashboard/live-pulse.tsx
- **whole file** | SEV: **CRITICAL** | SPEC: 07_hifi-spec.md §5 "Live Pulse widget (top-right corner of header)" | **Component is 0 importers per graph query + grep confirmation. DEAD CODE — not rendered anywhere.** Admin dashboard missing Live Pulse widget entirely.
- line 12 | SEV: HIGH | `rounded-[10px]` — spec says radius-card 14px for widgets on dashboard.
- line 19 | SEV: HIGH | `bg-green-100 text-green-800` — bg-green-100 doesn't compile (see kpi-card finding).
- line 29 | SEV: HIGH | `animate-pulse-ring` — Tailwind class that resolves to `animation: pulse-ring var(--ease-out)` — but globals.css `.pulse-ring` is already-defined keyframe class, and `animate-pulse-ring` arbitrary name may not be generated. CLAUDE.md warns: "Before `animation:` shorthand with a custom keyframe name, grep globals.css to confirm the keyframe is defined. Undefined keyframes fail silently." Animation likely does not trigger.
- line 29 | SEV: HIGH | `bg-green-600` — not in tailwind.config.ts. Silent fail. Dot renders transparent.
- line 37 | SEV: MEDIUM | `text-green-800` on `bg-card` OK but `text-green-700` (hover) doesn't compile.

## FILE: src/components/dashboard/recent-activity-feed.tsx
- line 16 | SEV: HIGH | `bg-green-100 text-green-800 / bg-blue-100 text-blue-800 / bg-red-100 text-red-800 / bg-slate-100 text-slate-700` — **none of the `*-100`, `*-700`, or `*-800` shades are in tailwind.config.ts except green-800 and slate-200/900**. Most of these silently resolve to transparent/nothing.
- line 33 | SEV: LOW | `text-secondary` — same resolution bug as elsewhere; renders with bg not intended color.
- line 50 | SEV: LOW | `font-mono tabular-nums` for timestamp — OK per spec.

## FILE: src/components/dashboard/dashboard-charts.tsx
- line 7 | SEV: LOW | Uses `next/dynamic` with `ssr: false` — correct per GOTCHAS.md "Recharts requires 'use client' + next/dynamic" and 18_performance-budget.md §7.
- line 24 | SEV: **HIGH** | SPEC: 07_hifi-spec.md §5 Admin Dashboard ("Charts row (below KPI): 2-column 60/40 split") | `grid lg:grid-cols-2` = **50/50 split**. Spec says **60/40** (left chart wider than right).
- line 27 | SEV: MEDIUM | `text-sm text-slate-600` for CardTitle — spec heading-md is 18px 600. Too small.
- whole file | SEV: MEDIUM | Missing the Live Pulse widget in the top-right of header per A1 wireframe. Nothing renders LivePulse component.

## FILE: src/app/(admin)/admin/dashboard/page.tsx
- line 210 | SEV: HIGH | SPEC: 07_hifi-spec.md §2 type scale (page title heading-xl 30px 700) | `text-3xl` = 30px 700 — matches heading-xl. OK. But `text-green-800` uses token `#1A3829` inline — acceptable though it's Tailwind class.
- line 213 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §5 "KPI cards row: 4-column grid, 16px gap, full-width" | `sm:grid-cols-2 xl:grid-cols-4 gap-4` — correct for 4-column at xl. OK.
- line 246 | SEV: MEDIUM | No Live Pulse widget in header area. Per spec §5 the Live Pulse widget should be in top-right of header showing "● N exams live" with pulse animation. Page uses CardHeader for "Recent Activity" instead.
- line 248 | SEV: MEDIUM | `text-sm text-slate-600` for CardTitle — same sizing issue, should be larger heading.

## FILE: src/app/(admin)/admin/dashboard/loading.tsx
- line 8 | SEV: LOW | SPEC: 07_hifi-spec.md §5 | Uses `auto-fit minmax(280px, 1fr)` while page uses `xl:grid-cols-4`. Loading layout doesn't match loaded layout — causes CLS.

## FILE: src/app/(admin)/admin/assessments/page.tsx
- line 14 | SEV: LOW | `order('sequence_order')` — correct per GOTCHAS.md levels column name.
- line 22 | SEV: LOW | `text-3xl font-bold text-green-800` matches heading-xl spec.
- line 28 | SEV: LOW | EmptyState use with icon, title, description, action — matches spec pattern.
- line 39 | SEV: LOW | Clean server component pattern.

## FILE: src/app/(admin)/admin/students/page.tsx
- whole file | SEV: LOW | Server component with paginated query, filters, sort. Clean architecture per §2.
- missing | SEV: MEDIUM | Page has no title — per wireframes A3 should have `{ Students }` H1. Delegated to StudentsTableClient? Need to verify.

## FILE: src/app/(admin)/admin/students/loading.tsx
- line 9 | SEV: MEDIUM | Placeholder header divs — matches rough shape. OK.
- line 13 | SEV: LOW | Uses `border rounded-md bg-card` — `rounded-md` = 8px, spec is radius-card 14px.

## FILE: src/app/(admin)/admin/students/[id]/page.tsx
- lines 13–20 | SEV: HIGH | SPEC: CLAUDE.md Tailwind v4 Notes (only green-800 and slate-* compile) | AVATAR_COLOURS uses `bg-blue-100 text-blue-800`, `bg-purple-100`, `bg-amber-100`, `bg-rose-100`, `bg-teal-100`, `bg-indigo-100` — **none of these palettes exist in tailwind.config.ts**. All avatars render transparent.
- line 121 | SEV: HIGH | Status badge `bg-green-100 text-green-800` — green-100 not declared; `bg-slate-100 text-slate-600` — slate-600 IS declared. Half works.
- line 194 | SEV: HIGH | Score badges `bg-green-100 / bg-amber-100 / bg-red-100` — none exist. All render transparent.
- line 104 | SEV: LOW | SPEC: 07_hifi-spec.md §6 "Digital ID card" B10 | Layout uses `grid lg:grid-cols-[280px_1fr]` = 280px left panel — close to wireframe A4 `360px` left pane (spec says 360, implementation 280).
- line 107 | SEV: MEDIUM | Card `border-slate-200` — works, slate-200 declared. OK.

## FILE: src/app/(admin)/admin/levels/page.tsx
- line 18 | SEV: LOW | `order('sequence_order', ...)` matches GOTCHAS.md column name. OK.
- line 44 | SEV: LOW | Clean server component.

## FILE: src/app/(admin)/admin/results/page.tsx
- line 29 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §5 "Results list uses CLOSED status" filter | `eq('status', 'CLOSED')` — correct per GOTCHAS.md status casing (uppercase exam_papers).
- line 43 | SEV: LOW | Query filters completed_at — correct per GOTCHAS.md result visibility rule.

## FILE: src/app/(admin)/admin/monitor/page.tsx
- line 72 | SEV: HIGH | SPEC: CLAUDE.md Tailwind v4 Notes | `bg-red-100 text-red-800` — red-100 and red-800 not in tailwind.config.ts. LIVE badge renders transparent/black.
- line 91 | SEV: HIGH | SPEC: CLAUDE.md "No hardcoded hex" | `bg-[#1A3829] hover:bg-[#1A3829]/90` — hardcoded hex in Tailwind arbitrary value. Should use `bg-green-800`.
- line 54 | SEV: CRITICAL | SPEC: 06_wireframes.md A7 "Live Monitor" & 07_hifi-spec.md §5 "Live Monitor" | **Monitor page renders as a LIST OF EXAM PAPERS (card view), not the real-time student table with 4 aggregate counters (In Progress/Submitted/Disconnected/Waiting).** Wireframe A7 shows a single-exam view with student rows and status colours. This page is a paper selector — correct for routing but spec's wireframe is the DETAIL view at /admin/monitor/[id]. Confusingly, /admin/monitor shows only "live papers" not a real-time per-student monitor. Check /admin/monitor/[id].

## FILE: src/app/(admin)/admin/monitor/[id]/page.tsx
- whole file | SEV: LOW | Server component fetches paper + sessions + answer counts. Passes to MonitorClient. Clean pattern.
- line 47 | SEV: LOW | Uses proper filters (student_id IS NOT NULL, closed_at IS NULL) — correct per GOTCHAS.md.

## FILE: src/app/(admin)/admin/monitor/[id]/monitor-client.tsx
- line 130 | SEV: **CRITICAL** | SPEC: 10_architecture.md §5 Zone 1 "Exam telemetry via Broadcast: All events use channel.send() — zero WAL involvement. Lint rule: no-postgres-changes-in-exam-context" | **Monitor uses `postgres_changes` on `assessment_sessions` filtered by paper_id.** This is EXACTLY the pattern banned by Zone 1 — at 2500 students × frequent updates, WAL replication slot overflows. Architecture spec explicitly forbids this.
- line 69–74 | SEV: HIGH | SPEC: CLAUDE.md Tailwind v4 Notes | Status config maps use `bg-green-500/green-800/green-100/blue-500/blue-800/blue-100/red-500/red-800/red-100/gray-400/gray-600/gray-100` — nearly all non-existent in tailwind.config.ts. Status badges render transparent.
- line 319 | SEV: HIGH | `bg-red-500 text-white` LIVE badge — red-500 not in config. Renders as inherit colour. 
- lines 301–304 | SEV: HIGH | Summary tile color classes use `text-green-700 bg-green-50 border-green-200`, `text-blue-700 bg-blue-50 border-blue-200`, etc. — none declared. **All 4 summary tiles render unstyled.**
- line 247 | SEV: MEDIUM | `bg-[#1A3829]` hardcoded in progress bar fill.
- line 263 | SEV: MEDIUM | Action link `text-[#1A3829] hover:underline` — hardcoded hex.
- line 52 | SEV: LOW | `deriveStatus` doesn't check `sync_status === 'verified'` — 10_architecture.md §5 Zone 4 says DB-Authority permanence rule must check `completed_at !== null || sync_status === 'verified'` for submitted permanence.
- line 168 | SEV: LOW | Uses PRESENCE join/leave correctly for status tracking. Good.
- line 157 | SEV: MEDIUM | `ghost connection` guard not present — a presence leave from a submitted student will incorrectly flip them to disconnected because deriveStatus doesn't set their status to submitted from PRESENCE payload (only from broadcast lifecycle). Race condition possible.

## FILE: src/app/(admin)/admin/announcements/page.tsx
- line 13 | SEV: **CRITICAL** | SPEC: GOTCHAS.md "levels.sequence_order not sort_order" | `order('sort_order')` — **wrong column name**. Live DB column is `sequence_order`. Query silently fails/returns unordered data. This is a known trap documented in GOTCHAS.md.
- line 22 | SEV: MEDIUM | Uses `adminSupabase` for reads bypassing RLS — acceptable in /admin but should document why.
- line 36 | SEV: LOW | Batches announcement_reads — good N+1 avoidance.

## FILE: src/app/(admin)/admin/announcements/tiptap-editor.tsx
- line 2 | SEV: **HIGH** | SPEC: GOTCHAS.md "TipTap must load via next/dynamic ssr:false" + 18_performance-budget.md §7 | **Static imports `@tiptap/react` and `@tiptap/starter-kit` at module top.** Loads TipTap into every bundle that imports this file. Should use `next/dynamic` with `ssr:false`. Violates both GOTCHAS.md and performance budget §7.
- line 21 | SEV: MEDIUM | Toolbar is only Bold/Italic/BulletList — spec wireframe A9 shows `[B][I][U][• list][link]` i.e. also Underline + Link. Missing 2 buttons.
- line 29 | SEV: MEDIUM | `bg-slate-200` works; `text-slate-600` works. OK.
- line 49 | SEV: LOW | `[&_.ProseMirror]:outline-none` removes focus outline — violates 08_a11y.md §7.1.
- whole file | SEV: MEDIUM | No `aria-label` on toolbar buttons; `title=` only works on hover, not screen readers.

## FILE: src/app/(admin)/admin/settings/page.tsx
- line 2 | SEV: LOW | Uses adminSupabase in /admin route — OK.
- line 22 | SEV: LOW | Dedupe pattern is pragmatic workaround for potentially duplicate grade_boundaries. Fine.

## FILE: src/app/(admin)/admin/activity-log/page.tsx
- line 22 | SEV: LOW | `order('timestamp', ...)` — correct per GOTCHAS.md "activity_logs uses timestamp not created_at".
- line 25 | SEV: LOW | Two-step profile lookup avoids N+1. Good pattern.

## FILE: src/app/(admin)/admin/reports/page.tsx
- whole file | SEV: **MEDIUM** | SPEC: CLAUDE.md "What Needs Building" doesn't include reports | **Entire page is a placeholder EmptyState with no data, no implementation.** Admin sidebar (line 20) has a `Reports` nav item pointing here that just shows "Generate performance reports and analytics." with no CTA. Dead route.

## FILE: src/app/(admin)/admin/settings/settings-client.tsx
- line 256 | SEV: HIGH | `bg-[#1A3829] hover:bg-[#1A3829]/90` — hardcoded hex in button classes throughout (lines 256, 319, 361, 396, 402, 405). Should use token.
- line 291 | SEV: MEDIUM | `bg-[#1A3829]/10 text-[#1A3829]` on grade badge — hardcoded opacity on hex.
- line 366 | SEV: **HIGH** | SPEC: GOTCHAS.md "Fake Data Landmines" (already documented) | "Auto-Archive Records" toggle — no DB column backing. Toggle mutates local state only and resets on reload. User-facing deception.
- line 353 | SEV: HIGH | SPEC: 07_hifi-spec.md §5 "Grade Boundary Editor: Auto-adjust adjacent field updates with 150ms transition on value change" | Grade boundaries show detectOverlaps validation (good) but NO auto-adjust of adjacent boundaries. Spec says "adjusting one boundary's min auto-adjusts adjacent max".
- line 265 | SEV: LOW | SPEC: 07_hifi-spec.md §5 "red inline text + 1.5px #DC2626 border — no toast" | Overlap error shown via both inline card AND toast on save attempt. Spec says no toast.
- line 395 | SEV: MEDIUM | `bg-[#1A3829]/5` and `text-[#1A3829]` — hardcoded hex.
- whole file | SEV: MEDIUM | Input `h-9` = 36px — below 40px spec default.

## FILE: src/app/(admin)/admin/activity-log/activity-log-client.tsx
- lines 38–52 | SEV: HIGH | SPEC: CLAUDE.md Tailwind v4 Notes | BADGE_STYLES map uses `bg-green-100 text-green-800`, `bg-red-100 text-red-800`, `bg-blue-100 text-blue-800`, `bg-orange-100 text-orange-800`, `bg-amber-100 text-amber-800`, `bg-slate-100 text-slate-700` — none of green-100/red-100/blue-100/orange-100/amber-100/slate-700 compile. Badges render without colour.
- line 356 | SEV: **HIGH** | SPEC: GOTCHAS.md Fake Data Landmines | **System status bar at bottom shows hardcoded "INDEX_HEALTH 99%", "RETENTION 365D", "ALERTS ACTIVE"** with no data backing. Per GOTCHAS.md rule "before rendering any number, percentage, or toggle, verify it is backed by a DB column or computation." These are fake marketing metrics.
- line 363 | SEV: HIGH | `bg-green-500` — not in tailwind.config.ts. Dot renders transparent.
- line 368 | SEV: HIGH | `bg-blue-500` — not in config.
- line 373 | SEV: HIGH | `bg-amber-500` — not in config.
- line 251 | SEV: MEDIUM | `bg-[#1A3829]/10 text-[#1A3829]` avatar — hardcoded hex.

## FILE: src/components/assessments/create-assessment-wizard.tsx
- lines 180–250 | SEV: HIGH | SPEC: CLAUDE.md Hard Constraints | Dialog body uses inline `style={{}}` with hardcoded hex throughout (#1A3829, #64748B, #CBD5E1, #FFFFFF, #94A3B8, #E2E8F0, #0F172A). Stepper, labels, select all hardcoded.
- line 260 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.1 | Native HTML `<select>` used for level instead of shadcn Select component — different visuals, different focus/hover styles.
- line 290 | SEV: LOW | Error pill uses `#FEE2E2` bg and `#DC2626` text — matches error token semantically but hardcoded.
- whole file | SEV: MEDIUM | Wizard implementation is a proper 3-step dialog with type/questions/config. Per CLAUDE.md priority 1 ("Create Assessment wizard — button exists, handler missing") — **this IS now wired up contrary to CLAUDE.md's task list.** Wizard exists and works.

## FILE: src/components/assessments/assessment-card.tsx
- lines 20–25 | SEV: LOW | STATUS_BADGE map uses `#F1F5F9/#475569, #DBEAFE/#1D4ED8, #EF4444/#FFFFFF, #E2E8F0/#64748B` — matches spec badge colours but hardcoded hex.
- line 74 | SEV: MEDIUM | Card root uses inline `style={{}}` entirely — hardcoded hex throughout.
- line 89 | SEV: MEDIUM | LIVE badge pulse uses `animate-ping` Tailwind utility on nested spans — correct for the ping effect. But the pulse isn't the spec's `pulse-ring` keyframe (box-shadow scale) — it's a scale+opacity ping.
- line 113 | SEV: LOW | Buttons use inline styles hardcoded `#1A3829` and `#DC2626`. Same pattern.

## FILE: src/components/assessments/step-type.tsx
- lines 41–56 | SEV: MEDIUM | Hardcoded hex `#1A3829`, `#E2E8F0`, `#CBD5E1`, `rgba(26,56,41,0.05)` throughout inline styles.
- line 48 | SEV: MEDIUM | `borderRadius: '12px'` — non-spec radius.
- lines 50–62 | SEV: MEDIUM | onMouseEnter/onMouseLeave hover — same pattern violation, non-tablet-friendly.

## FILE: src/components/assessments/step-questions.tsx
- lines 90–170 | SEV: HIGH | SPEC: CLAUDE.md | Inline hex throughout (#475569, #94A3B8, #E2E8F0, #0F172A, #D1FAE5, #065F46, #F8FAFC, #CBD5E1).
- line 115 | SEV: LOW | `backgroundColor: '#D1FAE5'` — Emerald-100 (not in spec colours), used for correct-answer badge. Should use `--bg-success #DCFCE7`.
- line 120 | SEV: HIGH | `color: '#065F46'` — Emerald-800 (not in spec palette). Should use `--text-success #166534`.
- line 132 | SEV: LOW | Trash button uses native `<button>` with no aria-label — accessibility issue.
- whole file | SEV: MEDIUM | Question form doesn't support flash_anzan equation editor — for TEST type, the form still uses MCQ options selector. Spec §A6 Step 2 shows equation input for EXAM and separate flash-anzan config in Step 3.

## FILE: src/components/assessments/step-config.tsx
- lines 14–30 | SEV: MEDIUM | Entire component uses inline style objects with hardcoded `#CBD5E1`, `#FFFFFF`, `#0F172A`. Can't apply token strategy.
- line 13 | SEV: LOW | `DELAY_OPTIONS = [300, 500, 750, 1000, 1500, 2000]` — doesn't include 200ms minimum which per spec is the hard floor (below = neurologist flag). First option at 300ms is acceptable but missing the 200ms edge case.

## FILE: src/components/levels/levels-client.tsx
- line 105 | SEV: HIGH | `bg-green-100 text-green-800` — green-100 not in tailwind.config. Active badge partial render.
- line 124 | SEV: **HIGH** | SPEC: GOTCHAS.md Fake Data Landmines (documented) | "Avg Competencies: 0" and "Curriculum Density: —" are hardcoded placeholder literals, never computed.
- line 80 | SEV: LOW | Uses hello-pangea/dnd — correct drag-drop library per CLAUDE.md.
- line 82 | SEV: LOW | Optimistic update pattern good.
- line 83 | SEV: MEDIUM | `bg-card rounded-md` — rounded-md is 8px, spec radius-card 14px.

## FILE: src/components/levels/create-level-dialog.tsx
- line 52 | SEV: HIGH | `bg-green-800 hover:bg-green-700` — green-700 not in config, hover state silently fails.
- line 85 | SEV: LOW | Clean dialog pattern, proper Label + Input.

## FILE: src/components/results/results-client.tsx
- lines 28–36 | SEV: HIGH | SPEC: CLAUDE.md Tailwind v4 Notes | GRADE_BADGE uses `bg-emerald-100 text-emerald-800`, `bg-green-100 text-green-800`, `bg-blue-100 text-blue-800`, `bg-amber-100 text-amber-800`, `bg-orange-100 text-orange-800`, `bg-red-100 text-red-800` — **emerald/orange/amber/red palettes NOT in tailwind.config.ts**. Grade badges render without backgrounds.
- line 194 | SEV: HIGH | SPEC: 07_hifi-spec.md §5 "AreaChart — Recharts, x-axis = score ranges, y-axis = student count, Fill: rgba(26,56,41,0.12), stroke: #1A3829" | Chart uses `#166534` stroke and gradient, spec says `#1A3829`. Wrong color.
- line 329 | SEV: HIGH | SPEC: 07_hifi-spec.md §5 "Floating Action Bar: Position fixed bottom 24px, centered; bg #1A3829, radius 999px, padding 12px 24px" | Bulk action bar is INLINE (not fixed at bottom) with `rounded-md border-green-200 bg-green-50` — completely different from spec. Spec is a floating pill at bottom of viewport.
- line 168 | SEV: HIGH | Avatar `bg-green-800 text-white` — works for green-800 but this is an inline class.
- line 333 | SEV: LOW | `bg-green-200` on divider — not in config.

## FILE: src/components/students/students-table-client.tsx
- lines 48–55 | SEV: HIGH | SPEC: CLAUDE.md Tailwind v4 Notes | COLOURS array uses same non-existent palette (blue-100, purple-100, amber-100, rose-100, teal-100, indigo-100). Avatars unstyled.
- line 210 | SEV: HIGH | `bg-green-800 hover:bg-green-700` — hover fails.
- line 240–267 | SEV: LOW | Dialog body uses shadcn Label + Input — correct token use.
- line 321 | SEV: LOW | `bg-green-50` on selected row — green-50 not in config. Row highlight missing.
- line 346 | SEV: HIGH | `border-red-200 text-red-700 hover:bg-red-50` — none compile. Suspend button unstyled.
- line 364 | SEV: **MEDIUM** | SPEC: CLAUDE.md "No native alert/confirm — use inline error pill pattern" | `onClick={() => alert('CSV export coming soon')}` — **uses native alert()**. Direct violation of CLAUDE.md hard constraint.

## FILE: src/components/students/student-profile-actions.tsx
- line 82 | SEV: HIGH | `bg-green-800 hover:bg-green-700` — hover fails (green-700 not declared).
- line 96 | SEV: HIGH | `border-red-200 text-red-700 hover:bg-red-50` — all three classes silently fail.
- whole file | SEV: LOW | Proper Select + Button composition.

## FILE: src/components/student/live-exam-card.tsx
- line 43 | SEV: **CRITICAL** | SPEC: 07_hifi-spec.md §6 Student Dashboard Live hero card ("Background #FFFFFF card, shadow-md, radius 14px, Border 2px solid #1A3829, Heading: DM Sans 22px 700 #0F172A, Subtext: #475569, CTA button: Primary full-width 48px") | **Card renders with #1A3829 dark green BACKGROUND filling entire card with white text.** Spec is the opposite: white card with a 2px green border accent and dark text. Visual inversion.
- line 50 | SEV: HIGH | `borderRadius: '16px'` — non-spec value (spec says radius-card 14px).
- line 61 | SEV: MEDIUM | LIVE badge `backgroundColor: '#EF4444'` — correct colour.
- line 84 | SEV: MEDIUM | Time countdown inline `setInterval` in React state — OK functionally but not RAF. Not in anzan path so not banned.
- lines 98–113 | SEV: LOW | Title heading typography: 22px 700 — matches spec.
- line 116 | SEV: MEDIUM | Enter button `backgroundColor: '#FFFFFF', color: '#1A3829'` — the spec "Enter Exam →" CTA is Primary (dark green bg, white text, 48px full-width). Implementation is a white pill — stylistic inversion consistent with the dark card theme.
- line 120 | SEV: HIGH | `fontSize: '14px'` — spec says 15px for body copy; CTA button size.
- **line 148** | SEV: **CRITICAL** | SPEC: CLAUDE.md "No emoji in production UI — use lucide-react icons" | NoLiveExamCard uses **`📋` emoji** as illustration. Direct hard-constraint violation.
- line 146 | SEV: HIGH | SPEC: 07_hifi-spec.md §9 | Empty state `2px dashed #E2E8F0` border — spec doesn't call for dashed borders on empty states. Empty state should be centered illustration + heading + body + CTA pattern.
- line 156 | SEV: LOW | Microcopy "No live exams right now" matches spec approved text §10.

## FILE: src/components/student/results-client.tsx
- lines 23–33 | SEV: MEDIUM | Inline hex `#FFFFFF`, `#E2E8F0`, `#F1F5F9`, `#94A3B8`, `#1A3829` throughout chart wrapper.
- line 29 | SEV: LOW | `borderRadius: '12px'` — non-spec value (r3=10 or r4=14).
- line 34 | SEV: LOW | Proper ResponsiveContainer + fixed height 200px — good per GOTCHAS.md "Recharts ResponsiveContainer needs explicit height".
- line 66 | SEV: LOW | `stroke: '#1A3829'` — matches spec green-800 line colour.

## FILE: src/app/(student)/student/dashboard/page.tsx
- lines 178–184 | SEV: **HIGH** | SPEC: GOTCHAS.md Fake Data Landmines (documented) | **"Progress to next level 42%" is a hardcoded literal,** not from DB. Progress bar width: `width: '42%'` — static. Deceives student that progress is real.
- lines 208–220 | SEV: **HIGH** | SPEC: GOTCHAS.md Fake Data Landmines (documented) | **"— RANK" and "0 BADGES" tiles** are hardcoded placeholders — not DB-backed.
- lines 231–238 | SEV: **HIGH** | SPEC: GOTCHAS.md Fake Data Landmines (documented) | **Skill Metrics hardcoded: Logical Reasoning 88%, Speed Analysis 64%, Accuracy 92%.** All three metrics are module-level literals not from DB.
- line 215 | SEV: HIGH | `color: '#2563EB'` (Blue-600) used for Speed Analysis progress fill — NOT in spec palette.
- line 215 | SEV: HIGH | `color: '#16A34A'` (Green-600 shade) used for Accuracy — NOT in spec palette (spec only has green-800 or green-50/200).
- whole file | SEV: MEDIUM | Entire page uses inline `style={{}}` — violates CLAUDE.md "No new inline style hex values".
- line 52 | SEV: LOW | Content layout uses two-column grid — matches wireframe.

## FILE: src/app/(student)/student/dashboard/loading.tsx
- whole file | SEV: MEDIUM | Layout mismatch with actual page (different grid) — causes CLS when loaded.

## FILE: src/app/(student)/student/exams/page.tsx
- lines 44–82 | SEV: HIGH | SPEC: 07_hifi-spec.md §9 Empty States | Empty state uses BookOpen icon in circular background. Spec §9 says "160px × 160px illustration". Current icon wrapper is 56×56 — too small.
- lines 90–102 | SEV: LOW | "LIVE NOW" section header uses `color: '#EF4444'` uppercase — acceptable label style.
- lines 150–170 | SEV: MEDIUM | Hardcoded inline styles throughout the exam card rows.
- whole file | SEV: MEDIUM | Three sections (LIVE / UPCOMING / COMPLETED) correct per spec §A5. But no filter chips, no search — spec is a list view without them though so OK.

## FILE: src/app/(student)/student/exams/loading.tsx
- whole file | SEV: LOW | Small loading skeleton. OK.

## FILE: src/app/(student)/student/exams/[id]/page.tsx
- whole file | SEV: LOW | Server component fetches paper + session + questions, redirects to lobby if no session. Clean pattern.
- line 19 | SEV: MEDIUM | Column access: `q.equation_display, q.flash_sequence, q.option_a-d, q.correct_option` — these are the expected DB column names, need to verify exist.
- line 36 | SEV: LOW | ticker_mode defaulted to false (profiles column missing per GOTCHAS.md).

## FILE: src/app/(student)/student/exams/[id]/lobby/page.tsx
- lines 47–58 | SEV: HIGH | SPEC: 06_wireframes.md B3 "No sidebar, no header — centered" | Lobby page wraps in `div flex-column h-full`, uses inherited student layout (which has sidebar + header). **Spec says lobby should be full-viewport centered** — the sidebar and header shouldn't render.
- line 65 | SEV: HIGH | SPEC: 07_hifi-spec.md §10 "NEVER use raw error codes" | Bottom bar shows `SESSION ID: {paper.id}` — exposing raw UUID to user. Per microcopy spec, IDs should not be visible.
- line 78 | SEV: MEDIUM | Bottom bar: `"SESSION ID: ... · LOBBY: PRE-ASSESSMENT · USER: ACTIVE, STUDENT ROLE"` — debug/telemetry text in user-facing UI.

## FILE: src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx
- line 98 | SEV: **CRITICAL** | SPEC: CLAUDE.md "No native alert/confirm — use inline error pill pattern" | `alert(\`Failed to start session: ${result.message || result.error || 'Unknown error'}\`)` — native alert violation.
- **lines 180–195** | SEV: **CRITICAL** | SPEC: GOTCHAS.md Fake Data Landmines (documented) | "Camera & Microphone Access" and "Secure Browser Environment" checklist items ALWAYS show ✓ green — no actual permission check, no SecureBrowser API call. Fake trust signals.
- lines 115–135 | SEV: HIGH | SPEC: 06_wireframes.md B3 + 07_hifi-spec.md §6 Lobby "Breathing circle: 120px diameter, border 2px solid rgba(26,56,41,0.3), keyframe scale(1)→scale(1.08)→scale(1), 4s ease-in-out infinite" | **No breathing circle.** Implementation has a 200px countdown circle (data ring, not spec breathe).
- line 120 | SEV: HIGH | SPEC: 07_hifi-spec.md §6 "Countdown timer: Font DM Mono 72px 700 #1A3829" | Implementation: `fontSize: '48px'` — half the spec size. Inside 200px circle container.
- line 156 | SEV: HIGH | SPEC: 07_hifi-spec.md §6 3-state network health | **Only 2 states** (STABLE/OFFLINE). Spec specifies Optimal / Degraded / Severed with different dot colours and sub-labels.
- line 200 | SEV: MEDIUM | I'm Ready button: `height: 48px` matches spec, `borderRadius: 8px` ≠ spec radius-btn 10px.

## FILE: src/app/(student)/student/results/page.tsx
- lines 5–14 | SEV: LOW | gradeBadge uses correct spec colors (#DCFCE7, #166534 etc.) — hardcoded but matches spec semantics.
- line 82 | SEV: LOW | Page title: 22px 700 — matches heading-lg not heading-xl 30px.
- line 83 | SEV: MEDIUM | "Export Report ↓" button has no onClick handler — placeholder button per GOTCHAS.md note on Server Component buttons.
- **line 112** | SEV: **CRITICAL** | SPEC: CLAUDE.md "No emoji in production UI" | Empty state uses **`📋` emoji** as illustration. Same violation as live-exam-card.
- lines 120–225 | SEV: **CRITICAL** | SPEC: 07_hifi-spec.md §6 Student Profile score display ("DM Mono 48px 700, #0F172A, centered on #FFFFFF card") | **Hero card uses `#1A3829` (dark green) background with white text instead of white card with dark text + colour accents.** Same inversion as live-exam-card.
- line 135 | SEV: HIGH | `backgroundColor: '#1A3829'` hardcoded; should use `var(--clr-green-800)`.
- line 137 | SEV: MEDIUM | `borderRadius: '16px'` — non-spec radius.
- line 197 | SEV: HIGH | `color: '#86EFAC'` (green-300 hex) for label text on dark bg — AAA contrast 2.4:1 — FAILS.
- lines 245–265 | SEV: LOW | Pending list uses `#FEF3C7` (amber-100) and `#92400E` (amber-800) — matches spec warn palette but hardcoded.
- line 344 | SEV: HIGH | Type badge uses `#EDE9FE` (violet-100) and `#7C3AED` (violet-600) for TEST type — NOT in spec palette.

## FILE: src/app/(student)/student/results/loading.tsx
- whole file | SEV: LOW | Small skeleton. OK.

## FILE: src/app/(student)/student/profile/page.tsx
- whole file | SEV: **HIGH** | SPEC: 06_wireframes.md B10 Student Profile (digital ID card, level progress bar, Ticker Mode toggle) | **Entire page is a placeholder:** `<p>Profile settings and accessibility flags.</p>` No digital ID card, no avatar, no roll number, no level progress bar, NO Ticker Mode toggle (which is the one-off accessibility feature required by 08_a11y.md §6.2).

## FILE: src/app/(student)/student/consent/page.tsx
- line 14 | SEV: HIGH | `bg-green-50 border-green-200 text-green-800` — green-50 and green-200 not in config. Verified state card unstyled.
- line 22 | SEV: HIGH | `bg-amber-50 border-amber-200 text-amber-800` — entire amber palette not in config.
- line 30 | SEV: HIGH | `bg-red-50 border-red-200 text-red-700` — entire red palette not in config.
- line 38 | SEV: HIGH | `bg-blue-50 border-blue-200 text-blue-700` — entire blue palette not in config.
- whole file | SEV: HIGH | All four state cards use colour classes that silently fail — renders as uncoloured text cards.

## FILE: src/app/(student)/student/tests/page.tsx
- whole file | SEV: **HIGH** | SPEC: CLAUDE.md "What Needs Building" | **Entire page is placeholder:** `<p>No practice tests available.</p>` Student sidebar has `Tests` nav item pointing here. Dead route. 

## FILE: src/app/(student)/student/assessment/[id]/page.tsx
- line 58 | SEV: MEDIUM | Hardcoded `assessmentType="TEST"` — TODO comment says "Read from exam_papers.type via initSession". Students would always get TEST flow regardless of paper type.
- line 60–63 | SEV: HIGH | `delayMs: 500, digitCount: 2, rowCount: 5` — hardcoded anzanConfig defaults. initSession doesn't return these. All TEST exams use identical flash config regardless of admin setup.
- whole file | SEV: LOW | Clean delegation pattern to AssessmentClient.

## FILE: src/app/(student)/student/assessment/[id]/assessment-client.tsx
- whole file | SEV: LOW | `navigator.onLine` event listener pattern. Standard. OK.
- line 77 | SEV: LOW | Routes to AnzanFlashView or ExamVerticalView based on type. Correct.
- line 92 | SEV: MEDIUM | `expiresAt={null}` — hardcoded null, TODO says "Wire from exam_papers.expires_at". Exam has no time limit enforcement.

## FILE: src/components/exam/flash-number.tsx
- whole file | SEV: LOW | SPEC: 13_exam-engine-spec.md §1 + 07_hifi-spec.md §7 | **Core flash loop is spec-compliant.** Uses `startFlashLoop` from timing-engine.ts (RAF + delta accumulator), direct `textContent` write, `transition: none` on span, `clamp(96px, 30vh, 180px)` font size, `#991B1B` for negatives via inline style assignment, contrast tokens applied once before loop, visibility guard wired correctly.
- line 83 | SEV: LOW | Direct `#991B1B` hardcoded in onFlash for negative colour — matches spec rule exactly.
- line 98 | SEV: LOW | `position: fixed, inset: 0, zIndex: 9999` — correct full-viewport coverage for Phase 2.
- line 108 | SEV: LOW | `backgroundColor: 'var(--flash-bg, #FFFFFF)'` — token with fallback. Good.
- line 121 | SEV: LOW | `aria-hidden="true"` on flash number — correct per 08_a11y.md §6.1.
- line 112 | SEV: MEDIUM | SPEC: 13_exam-engine-spec.md §1 ("onFlash must only set element.textContent — no setState, no classList") | Line 83 sets `spanEl.style.color = isNegative ? '#991B1B' : ''` — **this IS a style write per frame, not textContent-only**. Spec's onFlash contract forbids anything other than `textContent`. Style writes are slower than textContent and add per-flash latency. Workaround: CSS variables/data attribute pre-applied, but this code sets `.style.color` on every swap.

## FILE: src/components/exam/mcq-grid.tsx
- line 128 | SEV: **HIGH** | SPEC: CLAUDE.md Tailwind v4 Notes "Before `animation:` shorthand with a custom keyframe name, grep globals.css to confirm the keyframe is defined. Undefined keyframes fail silently" | `animation: 'confirm-slide-in 200ms ease-out'` — **`@keyframes confirm-slide-in` NOT defined in globals.css** (grep confirmed no matches). **Silent fail — Confirm button appears instantly with no animation**, contradicting spec §4.2 "Select & Confirm pattern: Tap option → 'Confirm →' button slides in below (200ms ease-out translateY)".
- line 97 | SEV: LOW | SPEC: 07_hifi-spec.md §4.2 (`border 1.5px #E2E8F0 default`, `border 3px solid #1A3829 selected`) | Implementation uses `2px solid #E2E8F0` (should be 1.5px) and `3px solid #1A3829` on selected ✓.
- line 93 | SEV: LOW | `minWidth: 64px, minHeight: 64px, padding: 16px` — matches spec Fitts Law floor.
- line 86 | SEV: MEDIUM | `role="radiogroup"` ✓ but each button is `role="radio"` with `aria-checked` — matches 08_a11y.md §2.4.
- line 94 | SEV: LOW | `rounded-xl` = 14px — matches spec radius-card for MCQ cells.
- line 86 | SEV: MEDIUM | No keyboard arrow navigation implementation (spec 08_a11y.md §8.2 requires ArrowLeft/Right/Up/Down to cycle options). Only Tab + Space/Enter.
- line 140 | SEV: LOW | Skip button uses `text-sm underline underline-offset-4` — acceptable ghost button.

## FILE: src/components/exam/question-navigator.tsx
- line 79 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §5 Question Navigator ("Item size: 36px × 36px, radius 8px, Unanswered: bg #F1F5F9 text #475569, Current: bg #1A3829 text #FFFFFF, Answered: bg #DCFCE7 text #166534 checkmark, Skipped: bg #FEF9C3 text #854D0E") | Implementation: 32×32 (spec 36×36), `bgColor: '#E2E8F0'` default (spec says `#F1F5F9`), no text colour change on state, current state uses 2px border not filled green. Multiple spec drifts.
- line 84 | SEV: MEDIUM | Navigator items use `rounded-full` (circle) — spec shows square 36×36 rounded-8px items.
- lines 56–72 | SEV: MEDIUM | State class uses hardcoded hex `#E2E8F0, #1A3829, #DCFCE7, #FEF9C3, #0F172A` — should use tokens.

## FILE: src/components/exam/exam-timer.tsx
- line 40 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.9 Timer Pill ("auto-width × 36px, Font DM Mono 30px 500 tabular-nums, Normal: bg #F0FDF4 border 1.5px #86EFAC text #1A3829, Urgent: bg #FFFBEB border 1.5px #F59E0B text #92400E, 800ms transition Normal→Urgent only") | Implementation: uses `#FFFFFF` (not `#F0FDF4`) as normal bg, `#475569` text (not `#1A3829`), `text-sm` (14px) — spec says 30px DM Mono. **Timer is tiny and wrong colours.**
- line 47 | SEV: HIGH | SPEC: same | `#854D0E` used as urgent border — spec border is `#F59E0B` amber-500. Text colour `#854D0E` correct per spec amber-900.
- line 30 | SEV: HIGH | SPEC: 07_hifi-spec.md §1 Timer States ("Urgent: ≤ 20% time remaining") | `isUrgent` threshold — need to verify useExamTimer implementation; docstring says "at ≤5 minutes remaining" not 20%. If hardcoded 5min, fails for exams shorter than 25 minutes.
- line 58 | SEV: MEDIUM | No 800ms transition between normal→urgent states. Spec requires colour animation.

## FILE: src/components/exam/sync-indicator.tsx
- whole file | SEV: LOW | SPEC: 07_hifi-spec.md §4.8 | 8px dot with color states — matches spec. `aria-label`, `role="status"` correct.
- line 11 | SEV: LOW | Colours #166534/#1D4ED8/#854D0E/#DC2626 — spec says #22C55E for syncing. Close enough semantically.
- line 32 | SEV: MEDIUM | `animate-pulse` for syncing state — Tailwind opacity pulse, not spec's solid state.

## FILE: src/components/exam/network-banner.tsx
- line 17 | SEV: HIGH | SPEC: 07_hifi-spec.md §4.7 ("Height 44px, border-top 4px solid #F59E0B") | Implementation `py-2` ≈ 32-36px height with content, `borderBottom` 1px (not `border-top 4px`). Banner doesn't hit spec dimensions or position.
- line 19 | SEV: LOW | `backgroundColor: '#FEF9C3', color: '#854D0E'` — matches spec warn palette.
- line 14 | SEV: LOW | `role="alert"` ✓ (spec §4.7 requires aria-live="assertive" which role="alert" implies).
- line 16 | SEV: MEDIUM | `z-[9998]` — spec says 9999. Banner could be under other fixed elements.
- line 37 | SEV: LOW | Microcopy "You are offline — your answers are saving locally..." matches approved spec microcopy.

## FILE: src/components/exam/confirm-submit.tsx
- whole file | SEV: LOW | Uses shadcn Dialog. Proper aria-labelledby/describedby pattern via DialogTitle/Description.
- line 66 | SEV: MEDIUM | Warning box uses hardcoded `#FEF9C3/#FDE047/#713F12` — should use token.
- line 80 | SEV: MEDIUM | Submit button hardcoded `#1A3829/#FFFFFF` inline style — should use Button variant.

## FILE: src/components/exam/paused-overlay.tsx
- whole file | SEV: LOW | SPEC: 07_hifi-spec.md §7 Pause Modal ("Overlay: full canvas, bg rgba(248,250,252,0.96) backdrop-blur 4px, Card: bg #FFFFFF shadow-lg radius 18px, Icon: pause circle 48px #1A3829, Heading: DM Sans 22px 700 #0F172A, Body: DM Sans 16px #475569") | Close to spec but differs:
  - Line 16: overlay `rgba(255, 255, 255, 0.95)` (spec says F8FAFC 0.96) — close
  - No `backdrop-blur-sm` applied
  - No card container — overlay contains content directly, not a white card on top of overlay
  - Icon: `64×64` not `48px`, `#FEF9C3` bg not `#1A3829`
  - Heading: `text-lg` (18px) not `22px`
- line 20 | SEV: MEDIUM | Icon wrapper uses amber bg `#FEF9C3/#854D0E` — spec uses green `#1A3829` for pause icon.
- line 25 | SEV: LOW | `aria-label` present. Role="alert" OK.

## FILE: src/components/exam/transition-interstitial.tsx
- whole file | SEV: LOW | SPEC: 07_hifi-spec.md §8 3000ms Get Ready Interstitial | **Matches spec well**:
  - Web Audio API metronome at 500/1000/1500ms, 880Hz sine, 80ms ✓
  - 3000ms via `INTERSTITIAL_MS` constant ✓
  - RAF-driven progress (not setTimeout) ✓
  - prefers-reduced-motion respect ✓
- line 115 | SEV: MEDIUM | SPEC: 07_hifi-spec.md §8 ("Card: bg #FFFFFF shadow-lg radius 18px max-width 400px") | Implementation has no card container — just overlay with centered content. Missing white card with shadow.
- line 115 | SEV: MEDIUM | Overlay bg `#FFFFFF` (opaque white) — spec says `rgba(248,250,252,0.92)` with backdrop-blur.
- line 122 | SEV: LOW | SPEC: 07_hifi-spec.md §8 ("Lottie: abacus-loader.json, 80px × 80px, centered, loop") | **Uses hand-drawn SVG abacus** instead of Lottie animation. Not spec.
- line 170 | SEV: LOW | Progress bar fill `#1A3829` — spec says `#166534` green-600. Minor colour.
- line 158 | SEV: LOW | "Get Ready" heading 22px 700 ✓ matches spec.
- missing | SEV: MEDIUM | No "The sequence will begin in a moment." body text (spec §8).

## FILE: src/components/exam/completion-card.tsx
- line 141 | SEV: **HIGH** | SPEC: CLAUDE.md Tailwind v4 Notes | `animation: 'completion-slide-up 400ms ease-out'` — **`@keyframes completion-slide-up` NOT defined in globals.css** (grep confirmed no matches). Silent fail. Card appears instantly with no slide-up animation, contradicting spec §6 "Submission Confirmation: mount animation translateY(24px)→translateY(0) + opacity 0→1, 400ms ease-out".
- line 61 | SEV: HIGH | SPEC: 07_hifi-spec.md §6 Confetti ("particles: #1A3829 · #22C55E · #86EFAC (green palette only)") | COLORS includes `#4ADE80` and `#DCFCE7` — not in spec's 3-colour palette. Minor.
- line 129 | SEV: LOW | Uses `bg-white rounded-2xl p-8 shadow-lg max-w-sm` — spec says radius 18px (radius-overlay) — `rounded-2xl` via @theme inline resolves to `var(--radius) * 1.8` ≈ 18px ✓.
- line 141 | SEV: MEDIUM | `backgroundColor: 'rgba(0, 0, 0, 0.1)'` overlay — spec doesn't specify. Too dark vs light theme.
- line 142 | SEV: LOW | Completion audio not played (spec §6 says "completion-chime.mp3, single play on mount, respects prefers-reduced-motion"). Missing audio.

## FILE: src/components/exam/exam-page-client.tsx
- line 64 | SEV: MEDIUM | SPEC: CLAUDE.md "Phase string: PHASE_2_FLASH — never just 'FLASH'" | Phase chain uses `setPhase('LOBBY')` / `'INTERSTITIAL'` / `'PHASE_1_START'` / `'PHASE_3_MCQ'` ✓ correct.
- line 157 | SEV: LOW | `createPortal(...document.body)` for ExamVerticalView — good practice per CLAUDE.md "Modals and Overlays" rule.
- line 167 | SEV: LOW | Completion card also portaled.
- line 110 | SEV: MEDIUM | `void result` on submitExam — ignores result.error case, doesn't surface errors to user. Submit shows completion regardless.
- line 126 | SEV: MEDIUM | `if (result.ok || !result.ok)` — tautology, always true. Acknowledges intent but unreachable branch logic.

## FILE: src/components/exam/exam-vertical-view.tsx
- line 113 | SEV: HIGH | SPEC: 06_wireframes.md B4 EXAM Engine ("NAVIGATOR (280px)") | Implementation sidebar `width: '120px'` — **less than half the spec width (280px)**. Sidebar visibly cramped.
- line 111 | SEV: **HIGH** | SPEC: 06_wireframes.md B4 "Full-canvas — no sidebar, no standard header" | Root element is `position: fixed, inset: 0, zIndex: 9999` — correct. But still renders internal sidebar + header, which matches spec's EXAM layout (navigator sidebar + top timer bar). OK.
- line 168 | SEV: HIGH | SPEC: 07_hifi-spec.md §6 Equation panel ("Max-width: 560px, bg #FFFFFF, radius 14px, padding 32px, border 1px #E2E8F0, DM Mono 26px 400, alternating rows") | Equation rendered as plain text with dynamic font size based on line count — **no white card container with border/padding/alternating rows**. Missing spec layout entirely.
- line 230 | SEV: MEDIUM | Submit button on last question doesn't use shadcn Button.
- line 170 | SEV: LOW | Dynamic font sizing for long equations — good UX but non-spec.

## FILE: src/components/exam/anzan-flash-view.tsx
- line 117 | SEV: LOW | SPEC: 07_hifi-spec.md §7 Zero-UI Enforcement | Phase 2 correctly UNMOUNTS sidebar/header/timer/navigator/banner by returning early with only FlashNumber + PausedOverlay. **Conditional unmount, not display:none** — matches spec hard rule.
- line 119 | SEV: LOW | `aria-live="off"` and `aria-busy="true"` ✓ per 08_a11y.md §6.1.
- line 128 | SEV: LOW | TickerMode branch honours `tickerMode` flag per 08_a11y.md §6.2.
- line 146 | SEV: LOW | CompletionCard renders for SUBMITTED/TEARDOWN.
- line 203 | SEV: MEDIUM | Phase 1 START shows `anzanConfig.digitCount-digit · rowCount rows · delayMs ms` — spec §5.TEST-phase-1 says "Speed: 450ms per number" / "Digits: 2-digit" / "Rows: 5 numbers" vertical list with separators.
- line 215 | SEV: MEDIUM | Begin Flash button: `padding: 16px 40px` ≈ 52px tall — close to spec 56px but not exact.
- **line 141** | SEV: **CRITICAL** | SPEC: 07_hifi-spec.md §6 Submission Confirmation ("full canvas, bg #F8FAFC, Card: bg #FFFFFF shadow-lg radius 18px max-width 440px, padding 48px 40px, confetti, Buttons: View Results Primary, Back to Dashboard Secondary") | CompletionCard is used but when `SUBMITTED`, only the card is shown — no navigation buttons **visible** because completion-card.tsx lines 210-232 HAS buttons but they call `onViewResults` which per line 69 routes to `/student/dashboard` (not `/student/results`) with TODO. **Post-submission never reaches results page.**

## FILE: src/components/a11y/a11y-ticker-mode.tsx
- line 55 | SEV: MEDIUM | SPEC: 13_exam-engine-spec.md §1 "setTimeout is BANNED in timing-engine.ts" | Ticker Mode uses `setTimeout` for sequence timing — **not strictly banned** (ban scope is `src/lib/anzan/`) but still susceptible to main-thread jitter. Per 08_a11y.md §6.2 ticker is an accessibility alternative, 800ms min interval gives slack.
- line 103 | SEV: LOW | Colour logic: `n < 0 ? '#991B1B' : '#0F172A'` — matches spec.
- line 110 | SEV: LOW | `opacity: i === currentIndex ? 1 : 0.2` — renders all numbers dimmed except current. Spec says horizontal scroll RTL to LTR, not dim-highlight. Different visual metaphor.
- line 138 | SEV: LOW | sr-only live region with "Number X: Y" announcement. Good per §6.2.
- line 46 | SEV: MEDIUM | Initial 300ms delay before first number — not specified but acceptable for SR announcement.

## FILE: src/hooks/use-reduced-motion.ts
- whole file | SEV: LOW | SPEC: 08_a11y.md §3 | Clean implementation with SSR guard. Matches spec exactly. CLEAN.

## FILE: src/hooks/use-input-cooldown.ts
- whole file | SEV: LOW | SPEC: 08_a11y.md §4 + 13_exam-engine-spec.md §1 | Uses RAF + performance.now delta — correct per spec. CLEAN.
- line 6 | SEV: LOW | Default `durationMs = 1200` — matches spec Fitts cooldown.

## FILE: src/hooks/use-exam-timer.ts
- line 30 | SEV: HIGH | SPEC: 07_hifi-spec.md §1 Timer States ("Urgent: ≤ 20% time remaining") | `isUrgent = remainingSeconds <= 300` — **hardcoded 5 minutes (300 seconds)**. Spec says 20% of total duration. For a 10-minute exam, urgent should trigger at 2:00 (120s), not 5:00 (300s). For a 60-minute exam, urgent should trigger at 12:00 (720s), not 5:00. **Urgent threshold does not scale with exam duration.**
- line 32 | SEV: MEDIUM | Uses `setInterval(1000)` — OK (not in anzan path) but could drift on throttled tabs. Spec doesn't require RAF for timer display.
- line 42 | SEV: LOW | `shouldAnnounce: remainingSeconds === 300 || remainingSeconds === 60` — matches spec 08_a11y.md §2.1 "announce only at 5min and 1min thresholds".
- line 43 | SEV: LOW | Announce messages match spec text.

## FILE: src/hooks/use-anzan-engine.ts
- whole file | SEV: LOW | SPEC: 10_architecture.md §2 + 13_exam-engine-spec.md §3 | Core engine orchestration is sound:
  - Session init pattern ✓
  - Mulberry32 PRNG seeded by question UUID ✓
  - IndexedDB write before advance ✓ (offline-first guarantee per §4)
  - RAF delegated to FlashNumber ✓
  - Tab monitor + teardown listener ✓
  - Cleanup on unmount ✓
- line 112 | SEV: MEDIUM | `negative_probability: 0.3` hardcoded — spec §3 says this should come from admin anzan_config with difficulty mapping (difficulty 1→0.0, 2→0.1, 3→0.2, 4→0.3, 5→0.4). Defaulting to 0.3 regardless of configured difficulty.
- line 113 | SEV: MEDIUM | `difficulty: 3` hardcoded — same issue. Admin selects difficulty but engine ignores it.

## FILE: src/hooks/use-heartbeat.ts
- whole file | SEV: LOW | SPEC: 10_architecture.md §5 Zone 2 Heartbeat Rate Limiting ("Maximum 1 broadcast event per 5 seconds per student") | Uses `setInterval` with `HEARTBEAT_INTERVAL_MS` constant. Need to verify constant matches 5000ms. Fine pattern.

## FILE: src/stores/exam-session-store.ts
- whole file | SEV: LOW | SPEC: 10_architecture.md §2 + CLAUDE.md | Zustand store with explicit state machine transition guard (`canTransition`). Clean.
- line 52 | SEV: LOW | All spec phase strings present including `PHASE_2_FLASH` (never bare `'FLASH'`). Matches CLAUDE.md.
- line 55 | SEV: LOW | `PHASE_1_START: ['PHASE_2_FLASH', 'PHASE_3_MCQ']` — allows PHASE_1 → PHASE_3 (EXAM type skips flash). Correct.

## FILE: src/stores/ui-store.ts
- whole file | SEV: LOW | Lightweight UI flag store. Clean.
- line 21 | SEV: LOW | `autoAdvance: true` default — cosmetic, not specified by UX spec. Default-on is fine.

## FILE: src/stores/auth-store.ts
- whole file | SEV: LOW | UI loading flag store. Clean.

## FILE: src/lib/anzan/timing-engine.ts
- whole file | SEV: LOW | SPEC: 13_exam-engine-spec.md §1 + §4 | **Core engine implementation matches spec exactly**:
  - `MINIMUM_INTERVAL_MS = 200` ✓
  - `DELTA_CLAMP_FACTOR = 1.5` ✓
  - Throws `INTERVAL_BELOW_MINIMUM` below 200ms ✓
  - Delta accumulator with `accumulator -= interval` (not reset to 0) ✓ — preserves zero drift
  - No setTimeout/setInterval ✓
  - `onFlash` callback contract documented ✓
  - `getContrastTokens` with correct colour tiers ✓
  - `validateFlashInterval` gating via studentFlags ✓
- CLEAN — spec-compliant.

## FILE: src/lib/anzan/number-generator.ts
- whole file | SEV: LOW | SPEC: 13_exam-engine-spec.md §3 | Matches spec:
  - Mulberry32 PRNG ✓
  - FNV-1a hash of seed string ✓
  - No consecutive identical numbers ✓
  - Running sum constraint ✓
  - First number always positive ✓
  - Safety valve after 100 attempts ✓
- CLEAN.

## FILE: src/lib/anzan/color-calibration.ts
- whole file | SEV: LOW | SPEC: 07_hifi-spec.md §1 + 13_exam-engine-spec.md §4 | Clean wrapper around getContrastTokens. `#991B1B` for negatives, token text for positive. CLEAN.

## FILE: src/lib/anzan/visibility-guard.ts
- whole file | SEV: LOW | SPEC: 13_exam-engine-spec.md §1 Pause/Resume | Clean visibility listener with SSR guard. Calls stopLoop/restartLoop correctly.

## FILE: src/lib/anticheat/clock-guard.ts
- whole file | SEV: LOW | SPEC: 13_exam-engine-spec.md §2 HMAC Clock Guard | Implementation matches spec Steps 1-5:
  - `createHmac` sha256 with HMAC_SECRET env var ✓
  - `issueExamSeal` format ✓
  - `validateClockGuard` 5-flag check ✓
  - `timingSafeCompare` with `Buffer.from(x, 'hex')` ✓
  - `CLOCK_GUARD_CONSTANTS` values match spec exactly ✓
- CLEAN.

## FILE: src/lib/anticheat/tab-monitor.ts
- whole file | SEV: LOW | Simple visibility counter pushed to Zustand. Matches plan spec §5 Zone 4 tracking. CLEAN.

## FILE: src/lib/anticheat/teardown.ts
- whole file | SEV: LOW | SPEC: 10_architecture.md §4 Step 3 (keepalive pagehide POST) + CLAUDE.md Teardown rule | Uses `fetch` with `keepalive: true` on pagehide, posts to Route Handler (not Server Action). Reads answers from Dexie, snapshots session. Matches spec.

## FILE: src/lib/supabase/admin.ts
- whole file | SEV: LOW | Runtime browser guard + startup env var guard. CLEAN per CLAUDE.md hard constraint.

## FILE: src/lib/supabase/server.ts
- whole file | SEV: LOW | Standard createServerClient with cookies. CLEAN.

## FILE: src/lib/supabase/client.ts
- whole file | SEV: LOW | Standard createBrowserClient. CLEAN.

## FILE: src/lib/supabase/middleware.ts
- whole file | SEV: LOW | SPEC: 10_architecture.md §8 | `updateSession` helper with getUser() call to refresh — correct pattern. However note: not imported by `src/middleware.ts` (which uses its own inline pattern). **Dead code — unused helper.**

## FILE: src/lib/auth/rbac.ts
- whole file | SEV: LOW | SPEC: CLAUDE.md Auth & RBAC | Uses `supabase.auth.getUser()` (not getSession), reads role from `app_metadata.role`. CLEAN.
- line 10 | SEV: MEDIUM | Return type shape: `{ userId, role, institutionId } | { ok: false, error, message }` — successful branch has no `ok: true` marker, meaning consumer checks must use `'error' in authResult`. Inconsistent with `ActionResult<T>` pattern which uses `ok: true`. Several callers mistakenly treat it as ActionResult.

## FILE: src/lib/auth/session.ts
- whole file | SEV: LOW | SPEC: CLAUDE.md Working Rules | Client-side idle gate polling institutional timeout. Uses setInterval(10000ms) for polling — acceptable (not in anzan path).
- line 37 | SEV: LOW | Uses getUser() server-validated. Good.

## FILE: src/lib/types/action-result.ts
- whole file | SEV: LOW | CLEAN type defs per CLAUDE.md pattern.

## FILE: src/lib/constants.ts
- whole file | SEV: LOW | All constants match spec:
  - HEARTBEAT 5s ✓
  - JITTER 5s ✓
  - COOLDOWN 1200ms ✓
  - MIN_FLASH 200ms ✓
  - INTERSTITIAL 3000ms ✓
  - HEARTBEAT_TIMEOUT 25s ✓

## FILE: src/lib/utils.ts
- whole file | SEV: LOW | Standard cn() helper for class merging.

## FILE: src/lib/offline/indexed-db-store.ts
- whole file | SEV: LOW | SPEC: 10_architecture.md §4 Step 3 | Dexie v4 typed store with `pendingAnswers` schema. Primary key `idempotency_key` ✓ enabling deduplication.
- line 10 | SEV: LOW | `synced` field required, manual insert. Schema doesn't support defaults — application responsibility.

## FILE: src/lib/offline/storage-probe.ts
- whole file | SEV: LOW | SPEC: 10_architecture.md §5 Zone 5 IndexedDB Quota | Calls `navigator.storage.persist()` and `.estimate()`. Warns if < 500MB available.
- missing | SEV: MEDIUM | SPEC: 10_architecture.md §5 Zone 5 LRU Purge | Does NOT implement `purgeOldSessions` LRU cleanup per spec. Spec says "If freeBytes < 5MB: purge old sessions". Implementation only warns at 500MB, no purge.

## FILE: src/lib/offline/sync-engine.ts
- whole file | SEV: LOW | SPEC: 10_architecture.md §4 | Uses `isSyncing` guard to prevent concurrent flushes, validates JWT via getUser, groups by session_id, HMAC computed server-side. CLEAN pattern.
- line 50 | SEV: MEDIUM | SPEC: 18_performance-budget.md §4 | Batching per session but no 50-answer chunk limit per spec ("max 50 answers per POST — avoids 64KB keepalive limit"). Single POST with all answers — for students who've been offline for a long time, payload could exceed 64KB.

## FILE: src/app/actions/auth.ts
- **line 15** | SEV: **CRITICAL** | SPEC: CLAUDE.md "Never commit secrets" (related principle) | `const tempPassword = 'tempPassword123!';` — **HARDCODED password reset value**. Every admin-triggered password reset sets the same password. Any attacker who learns this string can log in as any user whose password was reset. Also: line 17 writes this to `admin.updateUserById` without storing, emailing, or forcing reset on next login. Line 22 sets `forced_password_reset: false` — so the user isn't even prompted to change it on login.
- whole file | SEV: HIGH | Auth action has no rate limit. Any admin can spam-reset.

## FILE: src/app/actions/assessments.ts
- lines 100–135 | SEV: LOW | `publishAssessment` validates question count > 0. Good.
- line 170 | SEV: MEDIUM | `forceOpenExam` uses `REOPEN_WINDOW_MS` = 600000ms (10 minutes) from constants — allows reopening closed exam within 10 min. Not in spec docs but reasonable operational feature.
- line 180 | SEV: LOW | Broadcasts `exam_live` event on force open — matches architecture spec §3.
- line 212 | SEV: LOW | Broadcasts `exam_closed` — matches spec.
- whole file | SEV: LOW | All actions use `requireRole` and write `activity_logs` — matches CLAUDE.md Server Action pattern.

## FILE: src/app/actions/assessment-sessions.ts
- line 52 | SEV: MEDIUM | SPEC: CLAUDE.md "admin.ts banned in (student)/ routes, client components, hooks" | Uses `adminSupabase` inside Server Action called from student route. Ban scope technically doesn't cover Server Actions, but intent is to limit service-role usage. This file uses adminSupabase for session creation, questions fetch, answer writes, activity log — broad use.
- line 30 | SEV: LOW | `requireRole('student')` used. Good.
- line 80 | SEV: MEDIUM | `session.expires_at` is computed client-visible — but `student.cohort_id || ''` fallback means student with null cohort creates session with empty cohort_id. Per GOTCHAS.md "cohort_id NOT NULL" — this will fail DB constraint unless cohort exists.
- line 162 | SEV: LOW | `onConflict: 'idempotency_key'` — correct idempotency pattern.
- line 196 | SEV: MEDIUM | `completion_seal: 'sealed-' + input.session_id + '-' + Date.now()` — **NOT a real HMAC seal per 13_exam-engine-spec.md §2**. Fake seal string. Clock guard would fail HMAC validation.
- line 194 | SEV: MEDIUM | `onConflict: 'session_id,student_id'` — matches composite unique index per GOTCHAS.md.
- whole file | SEV: LOW | Clean ActionResult returns, activity_logs inserts.

## FILE: src/app/actions/questions.ts
- whole file | SEV: LOW | Standard CRUD for questions. requireRole + adminSupabase. Fine.

## FILE: src/app/actions/students.ts
- line 60 | SEV: LOW | CSV import uses bulk_import_students RPC — atomic, good.
- line 30 | SEV: MEDIUM | CSV split `\n` and `,` — no quoting support. Names with commas or newlines will break parsing. Non-spec but practical flaw.

## FILE: src/app/actions/levels.ts
- lines 52–70 | SEV: LOW | SPEC: GOTCHAS.md "levels.sequence_order unique — use two-phase update" | Two-phase update pattern implemented correctly. CLEAN.

## FILE: src/app/actions/results.ts
- line 32 | SEV: MEDIUM | Empty teacher check branch — comment says "Relying on RLS" but no actual teacher validation. Accepts teacher publish without checking cohort scope. If RLS enforces it, OK, but code doesn't.
- line 39 | SEV: LOW | Validates score + grade exist before publishing.

## FILE: src/app/actions/settings.ts
- line 62 | SEV: MEDIUM | Grade boundary update deletes ALL rows then re-inserts — **destructive atomic op**. Backup pattern is good but race-unsafe if concurrent writes. Spec doesn't require transaction isolation here.
- line 80 | SEV: LOW | Backup restore attempt on failure — good error handling.

## FILE: src/app/actions/announcements.ts
- whole file | SEV: LOW | Uses adminSupabase + requireRole. Standard pattern.

## FILE: src/app/actions/activity-log.ts
- whole file | SEV: LOW | Query builder for filtered logs + CSV export. Standard pattern.

## FILE: src/app/api/submissions/teardown/route.ts
- line 4 | SEV: LOW | BodySchema uses Zod for validation. Good.
- line 30 | SEV: LOW | Auth via Bearer token validated with `adminSupabase.auth.getUser(token)`. Good.
- line 73 | SEV: LOW | Returns 200 on bad payload to avoid leaking state. Acceptable for keepalive.
- line 85 | SEV: MEDIUM | SPEC: 10_architecture.md §4 | Insert into staging uses `payload: { submission_id, answers }` JSON blob — spec shows individual answer rows in staging. Different shape but both acceptable.
- whole file | SEV: LOW | Activity log write on every teardown. Matches architecture spec.

## FILE: src/app/api/submissions/offline-sync/route.ts
- line 66 | SEV: **HIGH** | SPEC: 10_architecture.md §5 Zone 3 HMAC Clock Guard | `createHmac('sha256', process.env.HMAC_SECRET ?? '')` — **empty string fallback if env var missing**. HMAC_SECRET is critical per Zone 3 — if this is unset, HMACs are computed with empty secret, making them **trivially forgeable** by attackers who know the algorithm. Should throw at boot instead.
- lines 37–52 | SEV: LOW | SPEC: Zone 2 | In-memory sliding window rate limit (10 req/60s) — good but module-level Map is lost on lambda cold start. Acceptable approximation.
- line 100 | SEV: MEDIUM | Validates submission exists + not already_submitted — prevents late tampering.
- line 123 | SEV: LOW | RPC `validate_and_migrate_offline_submission` with `p_secret` parameter — matches GOTCHAS.md "pass secret as p_secret TEXT parameter to RPC" workaround.
- line 110 | SEV: LOW | Returns `synced_keys` array for client acknowledgment. Good.
- whole file | SEV: MEDIUM | No server-side timestamp validation (freshness check) beyond RPC. Spec §5 Zone 3 requires 24h grace period.

## FILE: src/app/api/consent/verify/route.ts
- line 12 | SEV: LOW | Custom JWT format (header.payload.sig) with HMAC-SHA256. Base64url decoded and verified. Reasonable.
- line 45 | SEV: LOW | Rate limit: 5 requests per token per hour — reasonable for one-time consent links.
- line 60 | SEV: HIGH | `const secret = process.env.HMAC_SECRET` — no fallback, returns invalid redirect if missing. Good fail-closed pattern (unlike offline-sync).
- line 96 | SEV: LOW | Updates consent_verified, logs activity. CLEAN.
- whole file | SEV: LOW | Standard GET handler matches 10_architecture.md §2 Route Handlers rule.

## FILE: src/app/(admin)/admin/announcements/announcements-client.tsx
- line 19 | SEV: LOW | SPEC: GOTCHAS.md "TipTap must load via next/dynamic ssr:false" | Uses `next/dynamic` with `ssr: false` for TipTapEditor — correct pattern here. (However tiptap-editor.tsx itself still imports TipTap statically, so the dynamic boundary is effective.)
- line 106 | SEV: LOW | SPEC: 06_wireframes.md A9 | 2-column layout `lg:grid-cols-[1fr_360px]` — matches wireframe's 50% compose / 360px history split.
- line 147 | SEV: MEDIUM | `bg-[#1A3829] hover:bg-[#1A3829]/90 text-white` — hardcoded hex classes.
- line 173 | SEV: MEDIUM | `bg-[#1A3829]/10 text-[#1A3829]` — hardcoded.
- **lines 196–212** | SEV: **HIGH** | SPEC: GOTCHAS.md Fake Data Landmines (documented) | **"Engagement Insights" card shows hardcoded marketing text:** `"Announcements sent on Tuesday mornings have a 25% higher read rate"`. No DB query, no computation — pure static literal. User-facing deception of analytics.
- line 186 | SEV: LOW | Real read_count/total_students displayed per-announcement — **IS** from DB. Good.

## VISUAL AUDIT — https://mindspark-one.vercel.app/login
Logged in as admin (admin@mindspark.test). Computed styles via chrome-devtools MCP evaluate_script.

### /login — page layout
- Login page renders with navy-blue full-page background per design spec §Philosophy ✓
- CSS vars present and correct: `--clr-green-800: #1A3829`, `--bg-page: #F8FAFC`, `--text-primary: #0F172A` ✓
- `--font-sans` and `--font-mono` vars return empty strings via `getPropertyValue` — but computed `bodyFont` resolves to "DM Sans, DM Sans Fallback" so fonts DO load via next/font. MISSING vars are NON-issue at runtime.
- `body color: rgb(241, 245, 249)` — **matches predicted bug**: layout.tsx line 54 uses `text-secondary` which resolves to shadcn `--secondary` (#F1F5F9) not MINDSPARK text-secondary (#475569). Default body text colour on every page is shadcn secondary (near-white grey) instead of slate-600.
- `main element backgroundColor: rgba(0,0,0,0)` transparent ✓

## VISUAL AUDIT — https://mindspark-one.vercel.app/admin/dashboard
### Sidebar
- | SEV: **CRITICAL** | **Confirmed visual inversion.** aside computed values:
  - `width: 260.67px` — **spec says 240px (07_hifi-spec §4.6). Off by 20px.**
  - `backgroundColor: rgb(26, 56, 41)` = #1A3829 dark green — **spec says #FFFFFF white.** Full visual inversion.
  - height: 771.33px (100vh ~) ✓
- | SEV: HIGH | Logo H1 `color: rgb(241, 245, 249)` = slate-100 — confirms white text on dark green background (theme-inverted from spec).

### Top header
- `headerHeight: 59.85px` — spec says **64px** (06_wireframes Admin). **Off by 4px.**
- `headerBg: rgb(255, 255, 255)` white ✓
- `headerWidth: 1404px` = viewport width minus sidebar ✓

### Page H1 "Dashboard"
- `fontSize: 32px` (spec heading-xl says 30px — 2px over)
- `fontWeight: 700` ✓
- `color: rgb(26, 56, 41)` green-800 ✓

### KPI card values — CRITICAL spec drift
- All four KPI numbers ("1", "1", "29%", "9") computed:
  - `font: DM Mono` ✓
  - `size: 16px` — **spec §4.4 says 36px. Off by 20px (55% under spec).**
  - `weight: 400` — **spec says 700. Numbers render thin, not bold.**
  - `color: rgb(26, 56, 41)` green-800 — spec says #0F172A (primary text). Green hero numbers vs dark slate per spec — another inversion.
- Explanation: kpi-card.tsx line 27 uses `text-3xl font-bold text-primary font-mono`. At runtime `text-3xl` (30px) and `font-bold` (700) are NOT applying. Likely because `font-mono` class in globals.css has `letter-spacing: 0` override and shadcn Card's nested CardContent text-sm (14px) collapses the child's inherited size. The `text-primary` WOULD resolve to primary=#1A3829 per MINDSPARK override (not #0F172A) — confirming green-on-card rather than dark-slate-on-card.

### Charts row — grid layout
- `chartsCols: 1388.67px` — **single column**. Spec says `60/40 split` (07_hifi-spec §5). `lg:grid-cols-2` in dashboard-charts.tsx line 24 NOT compiling, charts stack vertically.
- Console warning: `The width(-1) and height(-1) of chart should be greater than 0` — Recharts container has no computed dimensions on mount, meaning initial render pass has invisible chart. GOTCHAS.md says "Recharts ResponsiveContainer needs explicit height" — the fix wasn't applied to all charts.

### Recent Activity feed
- Real DB data rendered (SUBMIT_EXAM, CREATE_ANNOUNCEMENT, FORCE_CLOSE_EXAM, PUBLISH_RESULT, etc.) with timestamps.
- Action badges use `bg-green-100 text-green-800` etc. — earlier finding: green-100/blue-100/red-100/slate-100 don't compile. Confirmed separately.

### Console errors
- 1 warning from Recharts (width/height of container). No errors in console.

## VISUAL AUDIT — https://mindspark-one.vercel.app/admin/monitor
### Sidebar
- `asideWidth: 260.67px` — same as dashboard (confirmed sidebar is consistent across admin routes).

### LIVE badge — CRITICAL compile failure
- `backgroundColor: rgba(0, 0, 0, 0)` — **TRANSPARENT**. Classes `bg-red-100 px-2.5 py-0.5 text-red-800` (monitor/page.tsx line 72) — **red-100 and red-800 do not compile.** Badge renders as invisible box with near-white text.
- `color: rgb(241, 245, 249)` — slate-100 text inherited from layout-level `text-secondary` bug (not the intended red-800).
- **Result: Active LIVE exams render with no visible LIVE indicator.** Admin cannot visually distinguish live from non-live.

### Monitor Session button
- `backgroundColor: rgb(26, 56, 41)` — green ✓ (hardcoded `bg-[#1A3829]` works as Tailwind arbitrary).
- `color: rgb(0, 0, 0)` — **BLACK text on dark green button.** Contrast ratio ~1.5:1 — **WCAG AA FAIL** (spec requires AAA 7:1). Button text is nearly invisible.
- `height: 18.67px` — **spec says 48px primary CTA.** Button is essentially a thin strip; users cannot hit it reliably. Fitts Law violation (64px floor per 08_a11y §4).
- Explanation: shadcn Button `h-8` (32px default) + `text-white` utility both failing to apply — MINDSPARK override `--primary-foreground: #FFFFFF` should cascade but button uses hardcoded `bg-[#1A3829]` which bypasses `bg-primary`, and no `text-primary-foreground` in the className means black default.

## VISUAL AUDIT — https://mindspark-one.vercel.app/admin/students
### Student avatar circles (first 3 observed)
- `classes: "bg-teal-100 text-teal-800"` (students-table-client line 48)
- `backgroundColor: rgba(0,0,0,0)` — **TRANSPARENT.** Spec §A3: avatars shown as colored initials.
- `color: rgb(241, 245, 249)` — near-white slate-100 (inherited body text colour bug).
- **Result: avatar circles invisible — just background with no initials visible.** No student visually identifiable.

### Active badge on student row
- `classes: "bg-green-100 text-green-800"`
- `backgroundColor: rgba(0,0,0,0)` — TRANSPARENT (green-100 not compiled).
- `color: rgb(26, 56, 41)` — green-800 DOES compile (declared in tailwind.config.ts).
- **Result: "Active" text renders dark green on page background with no bg pill.** Legible but loses the badge visual pattern.

## VISUAL AUDIT — Screenshot captured
- `docs/visual-audit-admin-dashboard.png` — full viewport screenshot of /admin/dashboard showing inverted dark-green sidebar, thin 16px KPI numbers, and stacked chart layout. (1 of 3 screenshot budget used.)

## VISUAL AUDIT — CRITICAL SYSTEMIC FINDINGS
Derived from cross-page evaluate_script runs:

1. **Tailwind colour scale compilation bug** — only `green-800` and `slate-50..950` compile from tailwind.config.ts. All palettes used in components (blue-*, red-*, amber-*, orange-*, emerald-*, purple-*, rose-*, indigo-*, teal-*, violet-*, green-50..700/900) silently fall back to transparent/inherited. This invalidates dozens of status indicators, badges, avatars, progress bars, and button hover states across admin and student panels.

2. **text-secondary body inheritance bug** — layout.tsx line 54 sets `text-secondary` which Tailwind v4 resolves to shadcn `--secondary` background token `#F1F5F9` (near-white), not MINDSPARK `--text-secondary` (`#475569`). Every descendant with `text-secondary` class inherits this near-white colour. Combined with `bg-page` (`#F8FAFC`), body text has contrast ratio ~1.05:1 — **visually unreadable on most backgrounds**.

3. **--sidebar CSS var inversion** — globals.css line 314 sets `--sidebar: #1A3829`. This drives the shadcn sidebar token but MINDSPARK spec requires white sidebars with dark text. All sidebar-wrapped surfaces render dark instead.

4. **Chart layout regression** — `lg:grid-cols-2` not compiling on dashboard-charts.tsx, collapsing 60/40 split into stacked single-column.

5. **KPI card number collapse** — `text-3xl font-bold` not applying; numbers render at 16px 400 inside shadcn Card body. Spec's dashboard hero numbers are supposed to be 36px 700 dark-slate.

No JavaScript errors in console — all visible issues are CSS-level.

