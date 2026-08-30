# MINDSPARK Stitch Prompts

Ready-to-paste prompts for [Google Stitch](https://stitch.withgoogle.com).
One section per screen. Each prompt is self-contained — copy the whole
block (from the description down to the last line before the next `##`)
into Stitch and it will generate a MINDSPARK-consistent screen.

The shared **DESIGN SYSTEM** block is intentionally repeated in every
prompt so Stitch stays consistent without needing to re-read a separate
file. Full token reference lives in `docs/DESIGN.md`.

---

## Shared DESIGN SYSTEM (copy this into every prompt)

```
**DESIGN SYSTEM (REQUIRED — use on every screen):**

**⚠️ CRITICAL COLOR RULE — READ FIRST:**
The primary brand color is Forest Green 800 = #1A3829 (a very dark, nearly-black green).
It is NOT emerald, NOT #059669, NOT #10B981, NOT any bright/medium green.
Every button, active nav, avatar bg, chart stroke, and link that says "Forest Green 800" MUST use #1A3829.
Hover state is Forest Green 700 = #1E4A35. Also dark. Never bright green on hover.
If you are unsure, use #1A3829. Repeat: #1A3829 is the primary color.

**⚠️ ICON RULE — NO EXCEPTIONS:**
Use lucide-react line icons ONLY. Stroke weight 1.5, 18×18 in sidebar, 16×16 inline.
DO NOT use Material Symbols, Material Icons, Heroicons, Phosphor, or any other icon set.
DO NOT use filled icon variants. All icons are outline/line style.

**⚠️ DO NOT INVENT FEATURES:**
Only render UI elements explicitly described in the prompt below.
DO NOT add: pagination (unless specified), import/upload cards, sign-out buttons in sidebar,
progress bars under stats, "Target vs Actual" chart legends, 3-dot overflow menus (unless specified),
ghost/dashed placeholder cards, or any feature not listed in the Page Structure section.

- Platform: Web, desktop-first (1440px canvas)
- Theme: Light, minimal, sophisticated, trustworthy, generous whitespace
- Product: MINDSPARK — mental arithmetic assessment platform for ages 6–18
- Background: Page Slate (#F8FAFC)
- Surface: Pure White (#FFFFFF) with Slate 200 border (#E2E8F0, 1px)
- Primary Accent: Forest Green 800 (#1A3829) — CTAs, active nav, LIVE borders, KPI headline numbers, avatars, chart strokes, links
- Hover Accent: Forest Green 700 (#1E4A35)
- Light Accent: Forest Green 50 (#EFFAF4) with Forest Green 200 (#B7E4C7) border — active nav background, subtle pills
- Text Primary: Near Black Slate (#0F172A) — headings and body-primary
- Text Secondary: Slate 600 (#475569) — secondary body and captions
- Text Subtle: Slate 400 (#94A3B8) — micro-labels, uppercase metadata, placeholders
- Success: Green 100 bg (#DCFCE7) with Green 800 text (#166534)
- Warning: Yellow 100 bg (#FEF9C3) with Amber 800 text (#854D0E)
- Error: Red 100 bg (#FEE2E2) with Red 700 text (#DC2626)
- Info: Blue 100 bg (#DBEAFE) with Blue 800 text (#1E40AF)
- LIVE Badge: Red 500 (#EF4444) background with white text, pill shape, 6px white pulse dot on the left
- Fonts: 'DM Sans' for all UI text, 'DM Mono' tabular-nums for every number, timer, score, roll number, and ID
- Heading XL: DM Sans 30/700 for page H1
- Heading LG: DM Sans 22/700 for card H2
- Heading MD: DM Sans 18/600 for section H3 and card titles
- Body: DM Sans 16/400 primary, 14/400 secondary
- Mono KPI: DM Mono 36/700 tabular for KPI card numbers
- Mono Timer: DM Mono 30/500 tabular for exam timer pills
- Mono Score: DM Mono 48/700 tabular for results and completion scores
- Button radius: 10px
- Card radius: 14px (NOT 12px, NOT rounded-xl)
- Dialog radius: 18px
- Pill radius: 9999px
- Default button: h-40 px-16 DM Sans 14/500, primary = Forest Green 800 (#1A3829) bg + white text
- Card: white bg, Slate 200 border, radius 14, shadow 0 1px 3px rgba(0,0,0,.06) and 0 1px 2px rgba(0,0,0,.04), padding 24px
- Hero card: white bg, 2px Forest Green 800 (#1A3829) border, radius 14, shadow 0 4px 12px rgba(0,0,0,.08) and 0 2px 4px rgba(0,0,0,.04), padding 28px
- Dialog: white bg, radius 18, shadow 0 10px 32px rgba(0,0,0,.12)
- Sidebar: 240px fixed, white background, Slate 200 right border. Logo area: "MINDSPARK" text only (DM Sans 20/700 Near Black) in 64px bar — NO icon/logo mark next to wordmark. Active nav row: Forest Green 50 (#EFFAF4) bg, Forest Green 800 (#1A3829) text, 600 weight. NO sidebar footer, NO sign-out button, NO user card at bottom.
- Admin top header: 64px, white, Slate 200 bottom border. Page title (DM Sans 20/700 Near Black) on the left. Bell icon button + 36px avatar circle on the right. Nothing else.
- Student top header: 56px, white, Slate 200 bottom border
- Icons: lucide-react line icons ONLY — 18×18 in sidebar, 16×16 inline, 1.5 stroke. NO Material Symbols. NO filled icons.
- Avatars: 32×32 or 36×36 circle, Forest Green 800 (#1A3829) background, white DM Sans initials. NOT slate/gray background.
- Forbidden: emoji anywhere, dark sidebar, dark bulk action bars, heavy drop shadows, rainbow gradients, cartoon illustrations, bouncy animations, Material Symbols, filled icons, invented features, pagination unless specified, import/upload ghost cards
- Accessibility: all interactive targets ≥ 40×40, 3px Forest Green focus ring at 40% opacity with 2px offset, WCAG AAA contrast where possible
```

---

## 01 — Admin Dashboard

A sophisticated, data-dense admin dashboard for an educational assessment platform. Opens on the KPI overview with four live stat cards, a 60/40 charts row, a Live Pulse widget for the currently-running exam, and a recent activity feed. Trustworthy, professional, restrained.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin Sidebar (240px, fixed left):** White background, Slate 200 right border. Top: "MINDSPARK" wordmark (DM Sans 20/700 Near Black) in a 64px logo area with Slate 200 bottom border. Below: vertical nav with lucide icons + labels — Dashboard (grid), Students (users), Levels (layers), Assessments (clipboard-list), Live Monitor (monitor), Results (bar-chart-2), Announcements (megaphone), Activity Log (activity-square), Settings (settings). Active row (Dashboard) = Forest Green 50 background, Forest Green 800 text, 600 weight. Inactive rows = text Slate 600.
2. **Top Header (64px):** "Dashboard" page title H1 (DM Sans 20/700 Near Black) on the left. On the right: bell notification icon button (ghost) + 1px Slate 200 vertical divider + 36px round avatar in Forest Green 50 background with green-800 initials ("AD").
3. **Heading Row:** Page H1 "Dashboard" (DM Sans 30/700 Near Black) on the left. Live Pulse widget card on the right (280px wide) with: "E2E Full Test Exam" as H3 (DM Sans 15/600 Near Black), "4 Active Students" caption (DM Sans 12/500 Slate 600) with the number as a pill (Forest Green 100 bg, Forest Green 800 text, DM Mono, px-1 py-0.5 rounded-4), a 12×12 Forest Green 600 pulse ring on the top-right, and a footer link "Join Monitoring Lobby →" in Forest Green 800 12/600.
4. **KPI Row:** 4-column grid (16px gap) of KPI cards. Each card: white bg, Slate 200 border, radius 14, shadow-sm, padding 24. CardHeader has a tiny label (DM Sans 14/500 Slate 600) and a 16×16 lucide icon (top-right, Slate 400). CardContent shows the big value in **DM Mono 36/700 tabular Near Black**, a small trend badge next to it (Green 50 bg + Green 200 border + Green 800 text for "up", Red 50/200/700 for "down", pill shape, 12/500, with up/down arrow icon), a 12/400 Slate 500 description under the value, and a 120×36 green sparkline chart at the bottom.
   - KPI 1: "Total Students", icon users, value 247, trend ↑ 12%, description "Enrolled in your institution"
   - KPI 2: "Active Exams", icon book-open, value 3, trend neutral, description "Currently LIVE"
   - KPI 3: "Avg Score", icon trending-up, value "84.5%", trend ↑ 2.3%, description "Across all completed submissions"
   - KPI 4: "Live Now", icon radio, value 12, trend neutral, description "Active exam sessions"
5. **Charts Row:** Two columns in a 60/40 split (left 60%, right 40%, 16px gap). Both use the standard card style.
   - Left card: CardTitle "Score Trend (6 months)" DM Sans 18/600 Near Black. Below, a recharts area+line chart showing 6 monthly data points, line stroke Forest Green 800, area fill rgba(26,56,41,0.06), data labels in DM Mono 12 Slate 600, grid in Slate 200 dashed.
   - Right card: CardTitle "Students by Level" DM Sans 18/600. Horizontal bar chart, 5 bars, all Forest Green 600, rounded right ends, labels in DM Sans 12 Slate 600.
6. **Recent Activity Card:** Full-width card. Title "Recent Activity" DM Sans 18/600 Near Black. 10 activity rows, each with a small circle icon (Slate 100 bg, 14×14 icon), a 14/500 Near Black action label, a 13/400 Slate 500 entity type, and a 12/400 Slate 400 relative timestamp on the right. Divider between rows in Slate 100.

---

## 02 — Student Dashboard

A calm, focused student dashboard. The hero is the Live Exam card with a white surface and 2px forest-green border. Supporting content is sparse and deliberately so — no fake metrics, no gamification chrome, just a real live exam, upcoming assessments, and a candidate summary strip.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Student Sidebar (240px, fixed left):** Same white-sidebar style as admin. Logo area "MINDSPARK" 20/700. Nav items: Dashboard (grid), Exams (book-open), Tests (zap), Results (bar-chart-2), Profile (user). Bottom separator with Settings (settings) and Support (help-circle). Active row Forest Green 50 bg + green-800 text + 600 weight.
2. **Top Header (56px):** "Welcome back, **Test Student 001**" on the left (DM Sans 15/400 Slate 600 with the name in 600 Near Black). Right side: bell button + 36px round avatar Forest Green 800 bg + white initials "TS".
3. **Main column (max-width 960px, centered):** Content stacks in a single column with 24px gaps.
4. **Live Exam Hero Card:** **White background, 2px Forest Green 800 border, radius 14, shadow 0 4px 12px rgba(0,0,0,.08)**, padding 28. Top row: LIVE NOW badge on the left — pill shape, Red 500 bg, white text DM Sans 11/700 uppercase letter-spaced, with a 6×6 white pulse dot before the text. Right side of the top row: "TIME LEFT" tiny uppercase label (DM Sans 10/600 Slate 400) and below it the countdown in **DM Mono 22/700 Forest Green 800 tabular** ("00:28:14" format). Below the top row: exam title H2 "E2E Full Test Exam" DM Sans 22/700 Near Black. Meta line "EXAM · 30 min" DM Sans 13/400 Slate 600. CTA button "Enter Examination Hall →" Forest Green 800 bg, white text, radius 10, h-40 px-20, DM Sans 14/600.
5. **Upcoming Assessments Section:** Section header row — H2 "Upcoming Assessments" DM Sans 18/600 Near Black on the left, "View All" link DM Sans 13/500 Forest Green 800 on the right. Below: list of 3 exam rows. Each row is a white card (Slate 200 border, radius 14, padding 14×16). Inside each row: a 44×40 date badge on the left (Forest Green 50 bg, radius 10, padded) with "APR" uppercase 10/700 Forest Green 800 on top and "8" DM Mono 18/700 Near Black below. Then a flex-1 info column with the title (DM Sans 14/600 Near Black) and meta "EXAM · 30 min" (DM Sans 12/400 Slate 600). Right end: a chevron-right icon in Slate 300.
6. **Candidate Summary Strip** (optional, below the upcoming list): A single white card with Slate 200 border, radius 14, padding 20, showing a Forest Green 50 level pill ("Level 1" — Green 200 border, Green 800 text, 11/700 uppercase) and "Candidate ID: **STUDENT-001**" where the ID is DM Mono tabular Near Black 13/500 and the label is Slate 600 13/400.

---

## 03 — Student Exam Lobby (Pre-Assessment)

The calm before the storm. A centered, spacious lobby screen with a breathing circle, large countdown timer, exam title, and a single "I'm Ready" CTA. Three-state network indicator, no fake checklists.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Full-canvas layout:** Sidebar is hidden on this page. Full-viewport white canvas with centered content (max-width 480px).
2. **Breathing Circle:** A 120×120 circle, centered. Border 2px rgba(26, 56, 41, 0.30). Inner fill rgba(26, 56, 41, 0.04). Subtle 4-second breathing animation (scale 1.00 → 1.08 → 1.00, ease-in-out). No content inside the circle.
3. **Countdown Timer:** Directly below the circle, **72px DM Mono 700 Forest Green 800 tabular** ("00:28" format). Below it: "TIME REMAINING" uppercase caption DM Sans 11/700 Slate 400 letter-spaced 0.1em.
4. **Exam Title Block:** H2 "E2E Full Test Exam" DM Sans 24/700 Near Black, centered. Below: "Prepare your workspace. The assessment will begin when you click I'm Ready." DM Sans 15/400 Slate 600, centered, max-width 360px.
5. **Network Indicator Pill:** A single pill with 3 possible states — Optimal (Green 50 bg + Green 200 border + Green 800 text), Degraded (Yellow 50 bg + Yellow 200 border + Amber 800 text), Severed (Red 50 bg + Red 200 border + Red 700 text). Inside the pill: an 8×8 status dot (matching color), a wifi icon (16×16), and a two-line text block — big line uppercase 11/700 letter-spaced ("OPTIMAL"), small line 11/400 opacity 0.85 ("Latency < 500ms"). Pill uses h-40 px-18 radius-pill.
6. **Consent Row:** Small inline row — a 20×20 Green 100 circle with a green-800 checkmark icon inside, then "Academic Integrity Policy Signed" DM Sans 13/500 Slate 600.
7. **Primary CTA:** "I'm Ready →" button. XL size h-56 px-24, full-width max-width 320px, Forest Green 800 bg, white text DM Sans 16/600, radius 10. Disabled state at 50% opacity.
8. **Legal caption:** "By clicking I'm Ready, you agree to begin the assessment under monitored conditions." DM Sans 12/400 Slate 400, centered, max-width 320px.

---

## 04 — Flash Anzan Exam View

Phase-2 flash display. Full-viewport white canvas with a single giant number. No peripheral UI. No transitions. Numbers fade in and out instantaneously per frame (<16.6ms swap latency). This is a sacred screen for the exam engine.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Full-viewport white canvas (#FFFFFF).** No sidebar, no header, no footer, no borders, no shadows, no navigation.
2. **Single Centered Number:** A positive arithmetic number centered horizontally and vertically. Font: **DM Mono 700 tabular, size `clamp(96px, 30vh, 180px)`, color #0F172A**. No transitions. No animation. No container. Just the number floating in white space.
3. **Negative Number Variant:** If the current flash is a negative number, the hyphen + number renders in **#991B1B** (spec-required crimson). No other UI element may use this hex.
4. **Phase Transition (Phase 1 → Phase 2):** A brief 400ms fade from the intro interstitial into the flash view. After the flash sequence completes, an interstitial card slides up (400ms cubic-bezier(0.16, 1, 0.3, 1)).
5. **Absolute rules:** No timer overlay. No question number. No progress bar. No network banner unless truly offline (in which case it appears as a thin top-bar warning with border-top-4 amber). No animations on the flash-number itself — `.flash-number` must have `transition: none !important`.

---

## 05 — MCQ / Vertical Exam View

The vertical-format post-flash MCQ view. An equation panel at the top, 4 option tiles below (A/B/C/D), a confirm button, and a compact question navigator sidebar. Professional and calm.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Full-canvas layout:** Sidebar hidden. Content centered in a max-width 720px column.
2. **Top Bar (fixed, 56px):** White bg, Slate 200 bottom border. Left: exam title DM Sans 14/500 Slate 600 + "Question 3 of 20" DM Mono 14/500 tabular Near Black. Right: timer pill (Green 50 bg, Green 300 border, radius-pill, padding 8×16) with DM Mono 30/500 Forest Green 800 tabular "14:23" text.
3. **Equation Panel:** A white card (Slate 200 border, radius 14, shadow-sm, padding 32, margin-top 32). Centered inside: the equation in **DM Mono 26/400 Near Black tabular**, multi-line acceptable ("  142\n+ 87\n─────\n").
4. **MCQ Grid:** A 2×2 grid (max-width 560px) with 16px gaps. Each option is a large tile: white bg, 2px Slate 200 border by default, radius 14, padding 28, h-96. Inside the tile: a circular letter badge (32×32, Slate 100 bg, DM Sans 16/700 Near Black) labeled A/B/C/D on the left, and the answer value in **DM Mono 26/500 Near Black tabular** on the right. Hover state: border Forest Green 400, bg Forest Green 50 at 50% opacity. Selected state: border 3px Forest Green 800, bg Forest Green 50, letter badge becomes Forest Green 800 bg + white text.
5. **Confirm Button Row:** After selection, a "Confirm Answer" button slides in from 8px below with 200ms ease-out opacity + translateY. XL size, Forest Green 800 bg, white text, radius 10, full-width max 320px, centered.
6. **Question Navigator (compact sidebar, 280px fixed right):** White card, Slate 200 border, radius 14, padding 20. Title "Questions" DM Sans 14/700 uppercase letter-spaced Slate 400 at top. Below: 5-column grid of 32×32 circular chips. Each chip is DM Mono 12/700 tabular. States: Unanswered = Slate 100 bg + Slate 400 text, Answered = Forest Green 50 bg + Forest Green 800 text, Current = Forest Green 800 bg + white text, Marked = Yellow 100 bg + Yellow 800 text.

---

## 06 — Student Results Page

A reflection screen for the student. Starts with the latest published result as a hero card (2px green border, large score + grade), a score trend line chart (shown only when 2+ published results exist), a pending evaluation section for not-yet-graded submissions, and a full Academic Ledger table showing all published results with exam title, date, type, duration, score, DPM, and grade. An "Export Report" outline button in the header. Empty state shown when no published results exist. This page lives at `/student/results`.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Student layout chrome:** 240px white sidebar + 56px top header, same as student dashboard. Active nav item: **Results** (bar-chart-2 — Forest Green 50 bg, Forest Green 800 text, 600 weight).

2. **Page Header Row (flex, justify-between, items-center):**
   - **Left:** H1 "My Results" DM Sans 22/700 Near Black (#0F172A).
   - **Right:** "Export Report ↓" outline button — white bg, Slate 200 border (1px), radius 8, px-16 py-8, DM Sans 13/600 Slate 600, cursor pointer.

3. **Empty State (shown when 0 published results):**
   - Container: white bg (`var(--bg-card)`), Slate 200 border (1px), radius 14 (`var(--radius-card)`), padding 56×24, text-center.
   - Inbox lucide icon 36×36 Slate 400 (`var(--text-subtle)`), strokeWidth 1.5.
   - Title: "No results published yet" DM Sans 16/600 Near Black (`var(--text-primary)`), mt-12.
   - Subtitle: "Check back after your exam is graded" DM Sans 14/400 Slate 600 (`var(--text-secondary)`).

4. **Latest Result Hero Card (shown when ≥1 published result):**
   - Card: White bg, **2px Forest Green 800 border** (`var(--clr-green-800)`), radius 14 (`var(--radius-card)`), shadow-md (`var(--shadow-md)`), padding 28×32.
   - Layout: flex row, wrap allowed, gap 24.

   - **Left section (flex 1 1 200px):**
     - "LATEST RESULT" — uppercase, DM Sans 11/700, Forest Green 600 (`var(--clr-green-600)`), letter-spacing 0.08em, mb-6.
     - Exam title: DM Sans 20/700 Near Black (`var(--text-primary)`), mb-8.
     - "Published {date}" — DM Sans 12/400 Slate 600 (`var(--text-secondary)`). Date formatted as "12 April 2026" (day month year, long).

   - **Right section (flex row, shrink-0, items-center, gap-20):**
     - **Score block (text-center):**
       - Value: **DM Mono 52/700 tabular** Forest Green 800 (`var(--clr-green-800)`), line-height 1. The integer percentage (e.g. "87") with a smaller "%" suffix at DM Mono 22 Forest Green 600 (`var(--clr-green-600)`).
       - Label: "SCORE" uppercase DM Sans 10/700 Slate 400 (`var(--text-subtle)`), letter-spacing 0.08em, mt-6.

     - **Grade block (text-center, only shown when grade is not null):**
       - Container: Forest Green 50 bg (`var(--clr-green-50)`), Forest Green 200 border (1px) (`var(--clr-green-200)`), radius 10 (`var(--radius-btn)`), padding 14×22.
       - Value: **DM Mono 36/700 tabular** Forest Green 800 (`var(--clr-green-800)`), line-height 1.
       - Label: "GRADE" uppercase DM Sans 10/700 Forest Green 700 (`var(--clr-green-700)`), letter-spacing 0.08em, mt-4.

5. **Score Trend Chart (shown only when ≥2 published results, mt-24):**
   - **Section header:** H2 "Score Trend" DM Sans 15/700 Near Black, mb-12.
   - **Card:** White bg, Slate 200 border (1px), radius 12, padding 20×20×12×4.
   - **Chart (h-200):** recharts `LineChart` inside `ResponsiveContainer`. Data: chronological array (oldest → newest) with `{ date: "Apr 8", score: 82 }`. X-axis: `date` strings, DM Mono 11 Slate 400 (`var(--text-subtle)`), no axis line, no tick line. Y-axis: domain [0, 100], DM Mono 11 Slate 400, no axis line, no tick line, format `{v}%`. CartesianGrid: dashed 3-3 stroke Slate 100 (#F1F5F9). Line: `type="monotone"`, `dataKey="score"`, stroke Forest Green 800 (#1A3829), strokeWidth 2.5, dots r=4 fill #1A3829 strokeWidth 0, activeDot r=6 fill #1A3829. Tooltip: white bg, Slate 200 border, radius 8, DM Mono 12, format `["{value}%", "Score"]`.

6. **Pending Evaluation Section (shown when ≥1 unpublished submission, mt-24):**
   - **Section header:** H2 "Pending Evaluation" DM Sans 15/700 Near Black, mb-12.
   - **Card list (vertical stack, 8px gap):** Each card:
     - Container: white bg, Slate 200 border (1px), radius 12, padding 14×16, flex row, items-center, justify-between.
     - **Left side:**
       - Title: DM Sans 14/600 Near Black, mb-2.
       - Submitted date: "Submitted {date}" DM Sans 12/400 Slate 600. Date: "8 Apr 2026" (day short-month year).
     - **Right side:** "PENDING" badge — Amber 100 bg (#FEF3C7), Amber 800 text (#92400E), DM Sans 11/700 uppercase, letter-spacing 0.04em, px-10 py-3, radius-pill.

7. **Academic Ledger Table (mt-24):**
   - **Section header:** H2 "Academic Ledger" DM Sans 15/700 Near Black, mb-12.
   - **Card wrapper:** White bg, Slate 200 border (1px), radius 12, overflow hidden.
   - **Table (min-width 600px, full-width, border-collapse):**

     - **Header row:** Slate 50 bg (#F8FAFC), border-bottom Slate 200.
       - Cell style: padding 10×16, DM Sans 11/700 Slate 600 uppercase, letter-spacing 0.05em, text-left, nowrap.
       - Columns: **Exam** | **Date** | **Type** | **Duration** | **Score** | **DPM** | **Grade**.

     - **Body rows:** border-bottom Slate 100 (#F1F5F9) between rows, none on last.

       - **Exam:** DM Sans 14/600 Near Black.
       - **Date:** DM Mono 13/400 tabular Slate 600, nowrap. Published date format "8 Apr 2026".
       - **Type:** Pill badge — EXAM: Blue 100 bg (#DBEAFE) + Blue 800 text (#1D4ED8). TEST: Purple 100 bg (#EDE9FE) + Purple 700 text (#7C3AED). DM Sans 11/700, px-8 py-2, radius-pill, nowrap.
       - **Duration:** DM Mono 13/400 tabular Slate 600. Format: "{minutes} min". If null: "—".
       - **Score:** **DM Mono 14/700 tabular Near Black**. Format: "{rounded percentage}%".
       - **DPM:** DM Mono 13/400 tabular Slate 600. Shown only for TEST type with 1 decimal (e.g. "3.2"). For EXAM type or null: "—".
       - **Grade:** Colour-coded pill badge — radius-pill, px-10 py-3, DM Sans 12/700.
         - A+: Green 100 bg (#DCFCE7) + Green 800 text (#166534).
         - A: Green 100 bg (#DCFCE7) + Green 700 text (#15803D).
         - B: Blue 100 bg (#DBEAFE) + Blue 700 text (#1D4ED8).
         - C: Yellow 100 bg (#FEF9C3) + Amber 800 text (#854D0E).
         - F: Red 100 bg (#FEE2E2) + Red 700 text (#DC2626).
         - Null: em-dash "—" Slate 300, 13px.

8. **Data source notes (not rendered, for implementation context):**
   - Server component queries `submissions` WHERE `student_id` matches logged-in student AND `completed_at IS NOT NULL`, ordered by `completed_at desc`.
   - Bulk-fetches `exam_papers` for all unique `paper_id`s in one query to get title, type, duration_minutes.
   - Splits into `published` (where `result_published_at IS NOT NULL`) and `pending` (null).
   - `latestResult` = first item in `published` array (most recent).
   - Chart data: published results reversed (chronological), ≥2 points required.
   - Grade badge colours are function-mapped per grade value.

---

## 07 — Admin Students List

A filterable, paginated table of students. Search bar, level filter, bulk action bar, and paginated table with 25 rows per page.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin layout chrome:** 240px sidebar, 64px header, 32px page padding.
2. **Page Heading Row:** H1 "Students" DM Sans 30/700 Near Black on the left. On the right: primary "+ Add Student" button (Forest Green 800 bg, white text, h-40, radius 10). Next to it: outline "Import CSV" button (white bg, Slate 200 border, Near Black text).
3. **Filter Bar (white card, Slate 200 border, radius 14, padding 16, 16px gap between fields):**
   - Search input (flex-1, h-40, radius 10, Slate 200 border, DM Sans 14, magnifying-glass icon inside-left, placeholder "Search by name or roll number…")
   - Level select (w-180, h-40, radius 10, "All levels" default)
   - Status select (w-160, h-40, radius 10, "All statuses" default)
4. **Student Table (white card wrapper, Slate 200 border, radius 14, overflow-hidden):**
   - Table header row: Slate 50 bg, uppercase 12/600 Slate 500 letter-spaced, padding 12×16. Columns: checkbox | Roll No | Name | Level | Last Active | Status | Actions.
   - Table body rows: white, Slate 100 bottom border, padding 12×16. Cells: 14/400 Near Black body. Roll No is DM Mono 14/500 tabular Slate 600. Name includes a 36×36 avatar circle (Forest Green 50 bg + Forest Green 800 initials 13/700) + name DM Sans 14/500 Near Black. Status is a Badge — Active = Green 50 bg + Green 200 border + Green 800 text; Suspended = Red 50 bg + Red 200 border + Red 700 text.
   - Bulk action bar at the bottom (white, Slate 200 top border, padding 12×16): "X selected" Slate 600 14/500 on the left, then Suspend (outline red) + Export (outline) + Dismiss (X icon, Slate 400).
5. **Pagination Row:** Centered below the table — "Page 1 of 12" DM Mono 14 Slate 500 + ChevronLeft/ChevronRight icon buttons (h-36 Slate 200 border radius 10).

---

## 08 — Admin Student Detail

A single student's profile view. Hero profile card at the top, stat grid, session history table, and action buttons.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome.** H1 "Student Details" + breadcrumb "Students / **Priya Shah**" at the top.
2. **Profile Hero Card:** White, Slate 200 border, radius 14, shadow-sm, padding 32, flex row. Left: 96×96 Forest Green 800 circular avatar with white DM Sans 32/700 initials. Right flex: H2 student name DM Sans 24/700 Near Black; "Candidate ID: **STUDENT-042**" DM Mono tabular 14; Level pill (Green 50 bg, Green 200 border, Green 800 text); "Joined **15 March 2026**" DM Sans 13/400 Slate 600.
3. **Stats Row:** 4-column grid (16px gap) of mini stat cards — Exams Completed / Avg Score / Best Grade / Hours Spent. Each card: white, Slate 200 border, radius 14, padding 20, with a 12/500 Slate 600 label and a DM Mono 32/700 tabular Near Black value.
4. **Session History Table:** White card with H3 "Recent Sessions" DM Sans 18/600 Near Black. Table inside — Date (DM Mono), Exam Title, Score (DM Mono with color coding), Grade (pill), Status (badge), View button.
5. **Action Buttons Row:** Secondary actions aligned to the right — outline "Reset Password", outline "Suspend Account", destructive red-50 "Delete Student".

---

## 09 — Admin Assessments List

A comprehensive assessment management hub with type tabs, status filters, search bar, and rich clickable assessment cards. Primary CTA opens a creation dialog. DRAFT cards navigate to the edit page, all others to the read-only detail view. Full-width row layout for scannable card density.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome (sidebar + header).** Sidebar: 240px fixed left, white bg, Slate 200 right border. "MINDSPARK" wordmark 20/700 in 64px logo bar. Nav items with lucide icons — Dashboard, Students, Levels, **Assessments (active — Forest Green 50 bg, Forest Green 800 text, 600 weight)**, Live Monitor, Results, Announcements, Activity Log, Settings. Top header 64px: "Assessments" page title DM Sans 20/700 Near Black left, bell icon + avatar right.

2. **Page Header Row:** H1 "Assessments" DM Sans 30/700 Near Black on the left. Right side: search input (w-280, h-40, radius 10, Slate 200 border, search icon 16×16 Slate 400 inside left padding, placeholder "Search assessments…" DM Sans 14/400 Slate 400) + primary "+ Create Assessment" button (Forest Green 800 bg, white text, h-40, px-16, radius 10, DM Sans 14/600, Plus icon 16×16 before text, 6px gap).

3. **Tab Strip (mt-20):** Two pill-shaped tabs side by side, 4px gap — "EXAM" and "TEST". Active tab: Forest Green 800 bg, white text, DM Sans 13/700 uppercase, letter-spacing 0.05em. Inactive tab: Slate 100 bg, Slate 600 text, DM Sans 13/600 uppercase, hover Slate 200 bg. Each tab: h-36, px-20, radius-pill. Right of tabs: assessment count pill — "12 assessments" DM Mono 12/500 Slate 500.

4. **Status Filter Row (mt-12):** Horizontal row of 5 outline chips with 8px gap — "All" (default selected), "Draft", "Published", "Live", "Closed". Selected chip: Forest Green 50 bg, Forest Green 800 border (1.5px), Forest Green 800 text DM Sans 12/600. Unselected chip: white bg, Slate 200 border (1px), Slate 600 text DM Sans 12/500, hover border Slate 300. Each chip: h-32, px-14, radius-pill. The "Live" chip when selected shows a tiny 6×6 Red 500 pulsing dot before the text.

5. **Assessment Card List (mt-16):** 1-column vertical stack layout (12px gap). Each card: white bg, Slate 200 border (1px), radius 14, shadow 0 1px 3px rgba(0,0,0,.06), padding 20 24, cursor pointer, hover border Slate 300 transition 150ms. Card layout is a single flex row, items-center:

   - **Left section (flex-1, min-width 0):**
     - **Badge row:** Status badge + Type badge + Level pill, 8px gap.
       - Status badge styles — DRAFT: Slate 100 bg + Slate 600 text. PUBLISHED: Blue 100 bg (#DBEAFE) + Blue 800 text (#1E40AF). LIVE: Red 500 bg (#EF4444) + white text + 6×6 white pulsing dot before text. CLOSED: Slate 200 bg + Slate 500 text. All: DM Sans 11/700 uppercase, letter-spacing 0.04em, h-22, px-8, radius-pill.
       - Type badge: Slate 100 bg, Slate 500 text, DM Sans 11/600 uppercase, h-22, px-8, radius-pill.
       - Level pill: Forest Green 50 bg, Forest Green 200 border (1px), Forest Green 800 text, DM Sans 11/600, h-22, px-8, radius-pill.
     - **Title (mt-8):** DM Sans 16/600 Near Black, single line, text-overflow ellipsis. Example: "Q3 Mental Arithmetic — Level 3".
     - **Meta row (mt-4):** "20 Questions · 30 min · Created Apr 8, 2026" DM Sans 13/400 Slate 500. Question count and duration values in DM Mono 13/500 weight.

   - **Right section (flex-shrink-0, flex row, gap 16, items-center):**
     - **Stats column:** Two mini stats stacked vertically, text-right, gap 2.
       - "24 assigned" — DM Mono 14/600 Near Black value + DM Sans 11/400 Slate 500 label on the same line.
       - "18 submitted" — same style. Only shown for PUBLISHED/LIVE/CLOSED.
     - **Chevron:** chevron-right lucide 20×20 Slate 300.

6. **Empty State (shown when no assessments match current tab + filter + search):** Centered in a white card (Slate 200 border, radius 14, padding 48), max-width 400px, mx-auto, mt-32. clipboard-list icon 48×48 Slate 300. H3 "No Assessments Found" DM Sans 20/700 Near Black, mt-16. Description "Create your first assessment to get started." DM Sans 15/400 Slate 500, mt-8, max-width 300px. CTA: same "+ Create Assessment" primary button, mt-24.

---

## 10 — Create Assessment Dialog (Simplified)

A streamlined single-step modal for creating a new DRAFT assessment. Select assessment type (EXAM or TEST) and target level, then create the draft and redirect to the full-page edit experience. No multi-step wizard — the heavy editing (questions, config) happens on the dedicated edit page (screen 21).

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Backdrop:** Full viewport, rgba(15,23,42,0.4) overlay, click-outside closes.
2. **Dialog Card:** Centered vertically and horizontally, max-width 540px, white bg, radius 18, shadow 0 10px 32px rgba(0,0,0,.12), padding 32.

3. **Header Row:** "New Assessment" DM Sans 20/700 Near Black on the left. X close button top-right (x lucide 20×20, Slate 400, hover Slate 600, 40×40 hit area, radius 8, hover bg Slate 100).

4. **Type Section (mt-24):**
   - Section label: "Select Type" DM Sans 13/600 Slate 500 uppercase letter-spacing 0.08em.
   - **Type Tiles (mt-12):** 2-column grid, 12px gap. Each tile: white bg, Slate 200 border (1px), radius 14, padding 20, cursor pointer, hover border Slate 300, transition 150ms. **Selected tile:** 2px Forest Green 800 border, Forest Green 50 bg tint (#EFFAF4).
     - **EXAM tile:**
       - Icon row: clipboard-list lucide 28×28 — Forest Green 800 when selected, Slate 400 unselected.
       - Title: "EXAM" DM Sans 16/700 Near Black, mt-12.
       - Description: "Vertical equations + MCQ. Structured formal examination." DM Sans 13/400 Slate 600, mt-4, line-height 1.5.
       - Tag pill (mt-12): "HIGH PRECISION" DM Sans 11/600 uppercase letter-spacing 0.05em. Selected: Forest Green 800 bg + white text, h-22 px-8 radius-4. Unselected: Slate 100 bg + Slate 500 text.
     - **TEST tile:**
       - Icon: zap lucide 28×28, same color logic as EXAM.
       - Title: "TEST" DM Sans 16/700.
       - Description: "Flash Anzan sequence + MCQ. Speed and accuracy drill." DM Sans 13/400 Slate 600.
       - Tag: "SPEED & ACCURACY" same styling pattern.

5. **Level Section (mt-20):**
   - Label: "Level" DM Sans 13/600 Slate 500 uppercase letter-spacing 0.08em.
   - Select dropdown (mt-6): full width, h-44, radius 10, Slate 200 border (1px), bg white, DM Sans 14/400 Near Black, padding 0 12px. Placeholder "Select a level…" Slate 400. Chevron-down icon 16×16 Slate 400 right side. Options: "Level 1", "Level 2", "Level 3", etc.

6. **Footer Row (mt-24, pt-20, border-top 1px Slate 200):** Flex row, justify-between.
   - Left: "Cancel" outline button (Slate 200 border, Slate 600 text, h-40 px-16 radius 10, DM Sans 14/500, hover bg Slate 50).
   - Right: "Create & Edit →" primary button (Forest Green 800 bg, white text, h-40 px-20 radius 10, DM Sans 14/600). Disabled state: 50% opacity, cursor not-allowed. Loading state: 16×16 spinner replacing Plus icon, text becomes "Creating…".

7. **Error Pill (conditionally shown below tiles, mt-12):** Full width, Red 100 bg (#FEE2E2), Red 700 text (#DC2626), radius 8, padding 8 12, DM Sans 13/500. Example: "Please select an assessment type."

---

## 11A — Admin Live Monitor Hub (Exam Picker)

The gateway to real-time exam supervision. Shows all currently LIVE exams as clickable cards in a responsive grid. Each card surfaces the exam title, a LIVE badge, active student count, time remaining, and a primary "Monitor Session" CTA. When no exams are live, a centered empty state encourages the admin to start one. This page lives at `/admin/monitor` and is the landing for the "Live Monitor" sidebar nav item.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome (sidebar + header).** Sidebar: 240px fixed left, white bg, Slate 200 right border. "MINDSPARK" wordmark 20/700 in 64px logo bar. Nav items with lucide icons — Dashboard (grid), Students (users), Levels (layers), Assessments (clipboard-list), **Live Monitor (monitor — active: Forest Green 50 bg, Forest Green 800 text, 600 weight)**, Results (bar-chart-2), Announcements (megaphone), Activity Log (activity-square), Settings (settings). Top header 64px: "Live Monitor" page title DM Sans 20/700 Near Black left, bell icon + avatar right.

2. **Page Header Row:** H1 "Live Monitor" DM Sans 30/700 text-green-800 on the left. No right-side actions on this page.

3. **Live Exam Card Grid (mt-24):** Responsive grid — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, 16px gap. Each card represents one LIVE exam paper:

   - **Card container:** White bg, Slate 200 border (1px), radius 14 (`--radius-card`), shadow 0 1px 3px rgba(0,0,0,.06), padding 16, hover border Slate 300 + shadow-md transition 150ms.

   - **Top row (flex, items-start, justify-between, mb-12):**
     - **Left (flex-1, min-w-0):** Exam title H3 DM Sans 16/500 Near Black (`text-slate-900`), line-clamp-2, with right margin 8px to prevent badge overlap.
     - **Right (shrink-0):** LIVE badge — inline-flex, Red 100 bg (#FEE2E2), Red 800 text, DM Sans 12/600 uppercase, h-22, px-10, radius-pill. Text: "LIVE".

   - **Meta row (flex, items-center, gap-16, mb-16, text-sm text-slate-500):**
     - **Student count:** Users lucide icon 14×14 + "{count} student(s)" DM Sans 14/400.
     - **Time remaining:** Clock lucide icon 14×14 + human-readable remaining time DM Sans 14/400 (e.g. "14m remaining", "2h 30m remaining", "Expiring soon"). Only shown when `opened_at` is set.

   - **CTA button (full-width):** "Monitor Session" primary button — Forest Green 800 bg, white text, h-40, radius 10, DM Sans 14/500. Navigates to `/admin/monitor/{paper.id}`.

4. **Empty State (shown when 0 LIVE exams):** Centered container, max-width 560px, mx-auto, mt-48. Uses `EmptyState` shared component:
   - Activity lucide icon 48×48 Slate 300.
   - H3 "No Live Assessments" DM Sans 20/700 Near Black, mt-16.
   - Description "Start an assessment to monitor students in real-time." DM Sans 15/400 Slate 500, mt-8, max-width 400px.
   - No CTA button on this empty state — the admin navigates to Assessments to start one.

5. **Data source notes (not rendered, for implementation context):**
   - Queries `exam_papers` WHERE `status = 'LIVE'` AND `institution_id` matches admin's institution.
   - Bulk-counts active sessions per paper: `assessment_sessions` WHERE `paper_id IN (...)` AND `student_id IS NOT NULL` AND `closed_at IS NULL`.
   - Time remaining calculated from `opened_at + duration_minutes`.

---

## 11B — Admin Live Monitor Detail (Real-Time Student Table)

The core real-time supervision screen for a single running exam. Shows exam title with LIVE/CLOSED badge, countdown timer, Force Close button, four colour-coded summary count cards, a searchable student table with status badges and progress bars, and a floating live-update indicator. All data updates in real time via Supabase Broadcast channels (heartbeat, answer_saved, submitted, status_change, exam_closed events) and Presence (lobby join/leave for connected/disconnected state). This page lives at `/admin/monitor/[id]`.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome (sidebar + header).** Same sidebar as 11A with **Live Monitor** as the active nav item. Top header 64px: breadcrumb-style — "Live Monitor" link DM Sans 14/400 Slate 500 + chevron-right 14×14 Slate 400 + exam title DM Sans 14/500 Near Black (truncated). Bell + avatar on the right.

2. **Header Row (flex, flex-col sm:flex-row, justify-between, gap-16):**
   - **Left section (min-w-0):**
     - **Title + Badge row (flex, items-center, gap-8, flex-wrap, mb-4):**
       - H1 exam title DM Sans 24/700 Near Black (`text-slate-900`), truncate on overflow.
       - **LIVE state badge:** inline-flex, shrink-0, Red 500 bg (#EF4444), white text, DM Sans 12/600 uppercase, h-22, px-10, radius-pill. Text: "LIVE".
       - **CLOSED state badge (mutually exclusive):** inline-flex, shrink-0, Slate 400 bg, white text, DM Sans 12/600 uppercase, h-22, px-10, radius-pill. Text: "CLOSED".
     - **Timer line (only when `opened_at` exists):** "Time remaining: " DM Sans 14/500 Slate 500, followed by countdown value in **DM Mono 14/700 tabular** — default colour `text-slate-700`, but switches to `text-red-600` when < 60 seconds remain. Format: `HH:MM:SS` if ≥ 1 hour, `MM:SS` otherwise. Countdown ticks every second via `setInterval`.

   - **Right section (shrink-0):**
     - **Force Close button:** Destructive variant — Red 50 bg (#FEF2F2), Red 200 border (1px), Red 700 text (#B91C1C), h-36, px-16, radius 10, DM Sans 14/500. Text: "Force Close Exam". Hover: Red 100 bg.
     - **Disabled states:** When `closing` is true → text changes to "Closing…", opacity 50%, cursor not-allowed. When exam is already closed → text changes to "Exam Closed", same disabled styling.
     - **On click:** Calls `forceCloseExam` server action. On success: badge flips to CLOSED, toast "Exam closed successfully" (sonner). On error: toast.error "Failed to close exam. Try again.", button re-enables.

3. **Summary Count Row (mt-24):** 4-column responsive grid (`grid-cols-2 sm:grid-cols-4`), 12px gap. Each cell is a colour-coded mini card:

   - **In Progress:** Green 50 bg (#DCFCE7), Green 200 border (1px), radius 10, padding 12. Number: DM Mono 24/700 tabular text-green-700. Label: "In Progress" DM Sans 12/500 text-green-700.
   - **Submitted:** Blue 50 bg (#DBEAFE), Blue 200 border, same structure. Number + label: text-blue-700.
   - **Disconnected:** Red 50 bg (#FEE2E2), Red 200 border. Number + label: text-red-700.
   - **Waiting:** Slate 50 bg (#F8FAFC), Slate 200 border. Number + label: text-slate-600.

   Counts derived in real time from the `rows` state array, filtering by each student's `status` field. Summary updates immediately on any Broadcast or Presence event.

4. **Student Table (mt-24, white card, Slate 200 border, radius 14, overflow-hidden):**

   - **Filter row (padding 16, border-bottom Slate 200, flex, items-center, gap-12):**
     - **Search input (max-w-xs, flex-1):** h-32, DM Sans 14/400, Slate 200 border, radius 8, left-padded 32px for Search lucide icon 14×14 Slate 400 absolutely positioned. Placeholder: "Search by name or roll number…" Slate 400. Filters table globally on `full_name` OR `roll_number` (case-insensitive substring match via `@tanstack/react-table` `globalFilterFn`).
     - **Student counter (ml-auto):** "{count} student(s)" DM Mono 12/400 tabular Slate 500.

   - **Table header row (Slate 50 bg, border-bottom Slate 200):**
     - Cell style: px-16 py-10, DM Sans 12/500 uppercase tracking-wide Slate 500, text-left.
     - Columns: **Student** | **Status** | **Progress** | **Last Seen** | (empty actions column, no header text).

   - **Table body rows (white bg, divide-y Slate 50, hover bg slate-50/60 transition-colors):**
     - Cell style: px-16 py-12.

     - **Student column:** Two-line layout.
       - Line 1: Full name DM Sans 14/500 Near Black (`text-slate-900`).
       - Line 2: Roll number DM Mono 12/400 Slate 500 (`text-slate-500 font-mono`).
       - (No avatar circle in current implementation — name + roll only.)

     - **Status column:** Inline badge with colour dot.
       - Badge container: inline-flex, items-center, gap-6, radius-pill, px-10, py-2, DM Sans 12/500.
       - **In Progress:** Green 100 bg, Green 800 text, 6×6 Green 500 dot.
       - **Submitted:** Blue 100 bg, Blue 800 text, 6×6 Blue 500 dot.
       - **Disconnected:** Red 100 bg, Red 800 text, 6×6 Red 500 dot.
       - **Waiting:** Gray 100 bg, Gray 600 text, 6×6 Gray 400 dot.

     - **Progress column (min-w 140px, flex, items-center, gap-8):**
       - **Progress bar (flex-1):** 6px tall, Slate 100 bg, radius-pill, overflow-hidden. Fill bar: Forest Green 800 bg, radius-pill, width = `(answered_count / totalQuestions) * 100%`, transition width 500ms.
       - **Fraction label (shrink-0, w-48, text-right):** "{answered}/{total}" DM Mono 12/400 tabular Slate 500. Example: "3/20".

     - **Last Seen column:**
       - If `last_seen` exists: relative time string via `date-fns formatDistanceToNow` with `addSuffix: true` — DM Sans 12/400 Slate 500. Example: "2 minutes ago".
       - If null: em-dash "—" DM Sans 12/400 Slate 400.

     - **Actions column (text-right):**
       - "View Profile" link — DM Sans 12/500 Forest Green 800, hover underline. Navigates to `/admin/students/{student_id}`.

   - **Empty table state (when no students connected):** Single row spanning all columns, padding 48, text-center. "No students connected yet." DM Sans 14/400 Slate 400.

5. **Real-time Update Indicator (fixed, bottom-right, z-50):**
   - Floating pill: Slate 50 bg (#F8FAFC), Slate 200 border (1px), radius-pill, padding 8×14, shadow-sm.
   - Content: 8×8 Green 600 dot with `pulse-ring` 2s animation + "Live updating" DM Sans 11/500 Slate 600, gap 6.
   - Only visible when exam status is LIVE (hidden when CLOSED).

6. **Real-time data channels (not rendered, for implementation context):**
   - **Broadcast channel `exam:{paperId}`** listens for:
     - `heartbeat` → updates `last_seen` + optionally `answered_count` (from `question_index`).
     - `answer_saved` → increments `answered_count`, updates `last_seen`.
     - `submitted` → flips student status to `submitted`, updates `last_seen`.
     - `status_change` → updates student status to payload value.
     - `lifecycle` → handles `status: 'submitted'` events.
     - `exam_closed` → flips exam to CLOSED state, shows toast.
   - **Presence channel `lobby:{paperId}`** listens for:
     - `join` → sets student status to `in_progress` (unless already `submitted`).
     - `leave` → sets student status to `disconnected` (unless already `submitted`).

---

## 11C — Force Close Exam Confirmation Dialog

A destructive-action confirmation modal that appears when the admin clicks "Force Close Exam" on Screen 11B. Warns that all active student sessions will be terminated immediately. Uses the same dialog chrome as Screen 10 but with destructive styling.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Backdrop:** Full viewport, rgba(15,23,42,0.4) overlay, click-outside closes.

2. **Dialog Card:** Centered vertically and horizontally, max-width 440px, white bg, radius 18 (`--radius-overlay`), shadow 0 10px 32px rgba(0,0,0,.12), padding 32.

3. **Icon + Header:**
   - **Warning icon (centered, mb-16):** 48×48 circle, Red 100 bg (#FEE2E2), centered alert-triangle lucide 24×24 Red 600 inside.
   - **Title:** "Force Close Exam?" DM Sans 20/700 Near Black, centered.
   - **Description (mt-8):** "This will immediately terminate all active student sessions for **E2E Full Test Exam**. Students who haven't submitted will lose their progress. This action cannot be undone." DM Sans 14/400 Slate 600, centered, line-height 1.6. The exam title is bold (DM Sans 14/600 Near Black).

4. **Impact Summary Card (mt-20):**
   - Container: Slate 50 bg, Slate 200 border (1px), radius 10, padding 16.
   - Three stat rows, 8px gap:
     - "In Progress: **4**" — DM Sans 13/400 Slate 600 label, DM Mono 13/600 Green 700 value.
     - "Submitted: **8**" — same style, Blue 700 value.
     - "Will be forcefully closed: **4**" — same style, Red 700 value, DM Sans 13/600 bold.

5. **Footer Row (mt-24, pt-20, border-top 1px Slate 200):** Flex row, justify-end, gap-12.
   - **Cancel button:** Outline — white bg, Slate 200 border, Slate 600 text, h-40, px-16, radius 10, DM Sans 14/500. Hover bg Slate 50.
   - **Confirm button:** Destructive primary — Red 600 bg (#DC2626), white text, h-40, px-20, radius 10, DM Sans 14/600. Hover Red 700. Text: "Force Close". Loading state: 16×16 white spinner + "Closing…" text.

---

## 11D — Exam Closed State (Post-Monitoring Summary)

The state Screen 11B transitions to after the exam is force-closed or the timer expires. The LIVE badge becomes CLOSED, the Force Close button is disabled, the live-update indicator vanishes, and a summary card appears above the student table showing final statistics. The student table remains visible as a read-only record.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome.** Same as 11B.

2. **Header Row (same layout as 11B but with closed state):**
   - Badge: CLOSED — Slate 400 bg, white text, radius-pill, h-22, px-10.
   - Timer line: "Exam ended" DM Sans 14/500 Slate 500 replacing the countdown.
   - Force Close button: Disabled, text "Exam Closed", opacity 50%, cursor not-allowed.

3. **Exam Summary Card (mt-24, new element not in LIVE state):**
   - Card: White bg, Slate 200 border (1px), radius 14, shadow-sm, padding 24.
   - **Title row:** "Session Summary" DM Sans 18/600 Near Black left. "Closed at 2:45 PM" DM Sans 13/400 Slate 500 right.
   - **Stats row (mt-16):** 4-column grid, 16px gap. Each stat:
     - Label: DM Sans 12/500 Slate 500 uppercase tracking-wide.
     - Value: DM Mono 28/700 tabular Near Black.
     - Stats: "Total Students" / "Submitted" / "Incomplete" / "Avg Progress".
     - Avg Progress value format: "78%" DM Mono 28/700 Forest Green 800.

4. **Summary Count Row:** Same as 11B but static (no longer updating).

5. **Student Table:** Same as 11B but fully static:
   - Live-update indicator is hidden.
   - Status badges frozen to final state.
   - Last Seen shows the final timestamp.
   - "View Profile" links still functional.
   - An additional column appears: **"View Result"** link (Forest Green 800 12/500, hover underline), visible only for students with `status: submitted`. Links to `/admin/results?student={student_id}&paper={paper_id}`.

6. **Action Footer (mt-24, flex, justify-end, gap-12):**
   - "Export Results" outline button — Slate 200 border, Near Black text, h-40, px-16, radius 10, download lucide 16×16 icon before text.
   - "View All Results" primary button — Forest Green 800 bg, white text, h-40, px-16, radius 10. Navigates to `/admin/results?paper={paper_id}`.

---

## 12 — Admin Announcements

Two-column layout: editor on the left, published list on the right. TipTap rich-text editor with tokenized toolbar.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome.** H1 "Announcements" DM Sans 30/700 Near Black.
2. **Two-column grid:** Left 60%, right 40%, 24px gap.
3. **Left column — Editor Card:** White, Slate 200 border, radius 14, padding 24. Title "New Announcement" DM Sans 18/600. Below: Title input (h-40 radius 10). Below: Body TipTap editor — a toolbar row (Bold/Italic/Underline/Link/List — each a 36×36 icon button with Slate 200 border, rounded 8, hover Slate 100), then a 280px-tall textarea with Slate 200 border radius 10, DM Sans 14/400 Near Black. Footer: "Publish" primary (Forest Green 800 h-40) + "Save Draft" outline.
4. **Right column — Published List Card:** Title "Published" DM Sans 18/600. Below: list of 5 announcement rows. Each row: title 14/600 Near Black, 13/400 Slate 600 excerpt line, 12/400 Slate 400 relative timestamp, and a right-aligned read-count pill (Slate 50 bg, Slate 200 border, DM Mono 11/500 Slate 600).

---

## 13A — Admin Results (Assessment Picker + Stats + Table)

The admin results management hub. Begins with an assessment selector dropdown filtering to CLOSED exams only. Once an assessment is selected, shows three computed stat KPIs (Mean, Median, DPM Avg), a grade distribution area chart, a selectable results table with checkbox rows, and a contextual bulk-action bar. Actions include per-row Publish, bulk Publish Selected, and Re-evaluate All. This page lives at `/admin/results` with an optional `?paper_id=` query param.

**⚠️ ANTI-DRIFT RULES FOR THIS SCREEN:**
- The assessment selector is a PLAIN HTML `<select>` element, NOT a styled button or custom dropdown.
- The stats bar is a SINGLE HORIZONTAL ROW with vertical 1px dividers — NOT stacked cards, NOT separate metric blocks with progress bars.
- The chart has ONE data series only — NO "Target vs Actual", NO dual legends.
- The bulk action bar uses LIGHT green bg (#DCFCE7) — NOT dark/navy/emerald-950 bg.
- The bulk action bar has exactly 3 actions: "Publish Selected" + "Export" + dismiss X. NO "Bulk Edit", NO "Remove".
- The table actions column has a "Publish" OUTLINE BUTTON per row — NOT a 3-dot overflow menu.
- Avatars are Forest Green 800 (#1A3829) bg with WHITE initials — NOT gray/slate bg.
- There is NO pagination footer. NO "Import Scores" card. NO sign-out button.
- Re-evaluate button is INSIDE the stats bar (ml-auto), NOT a separate top-level button.
- There is NO "Export CSV" top-level button. Export is only in the bulk action bar (disabled).

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome (sidebar + header).** Sidebar: 240px fixed left, white bg, Slate 200 right border. Top: "MINDSPARK" text only (DM Sans 20/700 Near Black, NO icon beside it) in 64px logo bar with Slate 200 bottom border. Nav items with lucide-react line icons (NOT Material Symbols) — Dashboard (grid), Students (users), Levels (layers), Assessments (clipboard-list), Live Monitor (monitor), **Results (bar-chart-2 — active: Forest Green 50 #EFFAF4 bg, Forest Green 800 #1A3829 text, 600 weight)**, Announcements (megaphone), Activity Log (activity-square), Settings (settings). Inactive rows: Slate 600 text, hover Forest Green 50 bg. NO sidebar footer, NO user card, NO sign-out button at bottom. Top header 64px: "Results" page title DM Sans 20/700 Near Black on the left. Right side: bell icon button (ghost) + 36px avatar circle (Forest Green 800 #1A3829 bg, white initials). Nothing else in the header — no full name, no role label.

2. **Page Header Row:** H1 "Results" DM Sans 30/700 color #1A3829 (Forest Green 800) on the left. No right-side button at this level (publish is contextual in the bulk bar below, Re-evaluate is inside the stats bar).

3. **Assessment Selector Row (mt-24, flex, items-center, gap-12):**
   - **Label:** "Assessment" DM Sans 14/500 Slate 700, shrink-0.
   - **Select dropdown:** This is a native HTML `<select>` element (NOT a custom button, NOT a popover). min-w 280px, h-36, radius 8, Slate 200 border (1px), white bg, DM Sans 14/400 Near Black, px-12, focus ring 2px Forest Green 800 (#1A3829). Default option: "— Select a closed assessment —" Slate 400. Options: list of CLOSED exam titles. On change: resets row selection.
   - **Empty hint (shown when 0 CLOSED papers):** "No closed assessments yet" DM Sans 12/400 Slate 400, ml-8.

4. **No-Selection State (shown when no paper_id selected):** Centered in page content, py-80. "Select an assessment to view results" DM Sans 14/400 Slate 400. Nothing else.

5. **No-Submissions State (shown when paper selected but 0 completed submissions):** Centered, py-80. "No completed submissions for this assessment" DM Sans 14/400 Slate 400. Nothing else.

6. **Stats Bar (mt-24, shown when submissions exist):** SINGLE white card, Slate 200 border (1px), radius 14, padding 16, HORIZONTAL flex row, items-center, gap-24. NOT a grid, NOT stacked cards.
   - **Three stat groups** in a single row, separated by 20px-tall 1px Slate 200 vertical dividers (use a `<div>` with h-5 w-px bg-slate-200):
     - **Mean:** Label "MEAN" DM Sans 12/500 Slate 500 uppercase tracking-wide. Value: DM Mono 18/700 tabular Near Black (#0F172A), format "{value}%". Example: "72.4%". NO progress bar underneath.
     - **Median:** Same styling. Label "MEDIAN". Value: "74.0%". NO progress bar.
     - **DPM Avg:** Same styling. Label "DPM AVG". Value: "3.2" (no % suffix). NO progress bar.
   - **Re-evaluate button (ml-auto, INSIDE this same card):** Outline — white bg, Slate 200 border, Near Black text, h-32, px-12, radius 8, DM Sans 12/500. RefreshCw lucide icon (NOT Material Symbol) 14×14 before text, 8px gap. Text: "Re-evaluate".

7. **Grade Distribution Chart Card (mt-24):** White card, Slate 200 border (1px), radius 14, padding 16.
   - **Title:** "Grade Distribution" DM Sans 14/600 Slate 700, mb-16. NO subtitle. NO legend with "Target vs Actual" — there is only ONE data series.
   - **Chart (h-280):** Simulated area chart. SINGLE series only. X-axis labels: F, D, C, B, A, A+ (left to right). Y-axis: integer student counts. Grid: dashed lines, Slate 100 (#F1F5F9). Area fill: semi-transparent green (rgba(22,101,52,0.08)). Line stroke: Green 800 (#166534), 2px. NO second series, NO "Target" line, NO dual-color legend.

8. **Bulk Action Bar (mt-24, conditionally shown only when rows are selected):**
   - Container: Green 50 bg (#DCFCE7), Green 200 border (#BBF7D0, 1px), radius 14, px-16, py-10, flex row, items-center, gap-12. LIGHT green background — NOT dark, NOT emerald-950, NOT navy.
   - **Selection count:** "SELECTED {count}" DM Sans 14/600 Green 800 (#166534) uppercase.
   - **Divider:** 16px-tall 1px Green 200 vertical line.
   - **Publish Selected button:** Forest Green 800 (#1A3829) bg, white text, h-28, px-12, radius 6, DM Sans 12/500.
   - **Export button (disabled placeholder):** Outline, Slate 200 border, Near Black text, h-28, DM Sans 12/500. Text: "Export". Currently disabled (grayed out).
   - **Dismiss button (ml-auto):** X lucide icon (NOT Material Symbol) 16×16 Green 700, hover Green 900. Clears selection.
   - **NOTHING ELSE** in this bar — no "Bulk Edit", no "Remove", no "Delete".

9. **Results Table (mt-24, white card, Slate 200 border, radius 14, overflow-hidden):**

   - **Table header row (Slate 50 bg, border-bottom Slate 200):**
     - Cell style: px-16 py-12, DM Sans 12/600 uppercase tracking-wide Slate 500, text-left.
     - Columns: **(checkbox)** | **Student** | **Score** | **Grade** | **Status** | (empty actions column, no header text).
     - EXACTLY these 6 columns. No "Submitted At", no "Exam" column.

   - **Table body rows (divide-y Slate 100):**
     - **Default row:** white bg, hover Slate 50, transition-colors.
     - **Selected row:** Green 50 bg (#DCFCE7), no hover change.
     - Cell style: px-16 py-12.

     - **Checkbox column:** 16×16 checkbox, Slate 300 border, accent-green-800 (#1A3829), cursor pointer. Header checkbox: toggles all rows.

     - **Student column (flex, items-center, gap-12):**
       - 32×32 circular avatar: Forest Green 800 (#1A3829) bg, white text DM Sans 12/600 initials (first letter of each word, max 2 chars, uppercase). NOT gray/slate bg.
       - Full name: DM Sans 14/500 Near Black. NO student ID, NO roll number, NO secondary text under the name.

     - **Score column:** DM Mono 14/400 tabular Near Black. Format: "{percentage}%" with 1 decimal. Example: "82.5%". If null: em-dash "—".

     - **Grade column:** Colour-coded pill badge — inline-flex, radius-pill, px-8, py-2, DM Sans 12/600.
       - A+: Emerald 100 bg (#D1FAE5) + Emerald 800 text (#065F46).
       - A: Green 100 bg (#DCFCE7) + Green 800 text (#166534).
       - B: Blue 100 bg (#DBEAFE) + Blue 800 text (#1E40AF).
       - C: Amber 100 bg (#FEF3C7) + Amber 800 text (#92400E).
       - D: Orange 100 bg (#FFEDD5) + Orange 800 text (#9A3412).
       - F: Red 100 bg (#FEE2E2) + Red 800 text (#991B1B).
       - Null/unknown: Slate 100 bg + Slate 600 text.

     - **Status column:** Badge — inline-flex, radius-pill, px-8, py-2, DM Sans 12/500.
       - Published: Green 100 bg + Green 800 text. Text: "Published".
       - Unpublished: Slate 100 bg + Slate 500 text. Text: "Unpublished".

     - **Actions column:** "Publish" OUTLINE BUTTON (NOT a 3-dot menu, NOT an icon button) — Slate 200 border, Near Black text, h-28, DM Sans 12/500, radius 6. When already published: text changes to "Published", disabled state. Per-row action only.

   - **NO pagination footer.** NO "Showing X of Y" row. All submissions render in one table.

10. **NOTHING ELSE on this page.** No "Import Scores" ghost card, no dashed upload area, no footer, no floating action button.

11. **Data source notes (not rendered, for implementation context):**
    - Page server component queries `exam_papers` WHERE `status = 'CLOSED'` AND `institution_id` matches.
    - When `paper_id` selected: queries `submissions` with join to `students(full_name)`, WHERE `paper_id` AND `completed_at IS NOT NULL`, ordered by `created_at asc`.
    - Stats (mean, median, DPM avg) computed client-side from graded submissions.
    - Chart data: counts per grade in GRADE_ORDER `['F','D','C','B','A','A+']`.
    - Server actions: `publishResult` (single), `publishResults` (bulk array), `reEvaluateResults` (recalculate + un-publish all). All log to `activity_logs`.

---

## 13B — Re-evaluate Confirmation Dialog

A confirmation modal shown before re-evaluating all submissions for a closed assessment. Warns that all currently published results will be un-published and scores recalculated.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Backdrop:** Full viewport, rgba(15,23,42,0.4) overlay, click-outside closes.

2. **Dialog Card:** Centered vertically and horizontally, max-width 440px, white bg, radius 18 (`--radius-overlay`), shadow 0 10px 32px rgba(0,0,0,.12), padding 32.

3. **Icon + Header:**
   - **Warning icon (centered, mb-16):** 48×48 circle, Amber 100 bg (#FEF3C7), centered alert-triangle lucide 24×24 Amber 700 (#B45309) inside.
   - **Title:** "Re-evaluate All Results?" DM Sans 20/700 Near Black, centered.
   - **Description (mt-8):** "This will recalculate scores for all submissions in **Q3 Mental Arithmetic — Level 3** using the current answer key. All previously published results will be un-published and require re-review before students can see them." DM Sans 14/400 Slate 600, centered, line-height 1.6. Exam title is bold (DM Sans 14/600 Near Black).

4. **Impact Summary Card (mt-20):**
   - Container: Slate 50 bg, Slate 200 border (1px), radius 10, padding 16.
   - Two stat rows, 8px gap:
     - "Total submissions: **24**" — DM Sans 13/400 Slate 600 label, DM Mono 13/600 Near Black value.
     - "Currently published: **18** (will be un-published)" — same style, Amber 700 value for the count.

5. **Reason Input (mt-20):**
   - Label: "Reason for re-evaluation" DM Sans 13/600 Slate 500 uppercase letter-spacing 0.06em.
   - Textarea (mt-6): full width, h-80, radius 10, Slate 200 border (1px), DM Sans 14/400 Near Black, px-12 py-8. Placeholder: "e.g. Answer key corrected for Q12…" Slate 400.

6. **Footer Row (mt-24, pt-20, border-top 1px Slate 200):** Flex row, justify-end, gap-12.
   - **Cancel button:** Outline — white bg, Slate 200 border, Slate 600 text, h-40, px-16, radius 10, DM Sans 14/500.
   - **Confirm button:** Amber 600 bg (#D97706), white text, h-40, px-20, radius 10, DM Sans 14/600. Text: "Re-evaluate All". Loading state: 16×16 white spinner + "Re-evaluating…".

---

## 14 — Admin Levels

Drag-and-drop sortable list of curriculum levels with a student-count tile.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome.** H1 "Levels" DM Sans 30/700. Right: primary "+ Add Level" button.
2. **Level List:** Vertical stack of level cards (16px gap). Each card: white, Slate 200 border, radius 14, padding 16, flex row. Left: drag handle (grip-vertical icon, 24×24, Slate 300). Middle flex: level name H3 16/600 Near Black + "24 students" caption 13/400 Slate 500. Right: Active pill (Green 50 bg + Green 200 border + Green 800 text + uppercase 11/700), Edit + 3-dot menu.
3. **Stats Strip:** Single white card (max-width 240, centered below the list) showing "Total Student Load" 12/500 Slate 500 label + DM Mono 32/700 tabular Near Black value.

---

## 15 — Admin Settings

Form-heavy single-column page with grade boundary editor, institution settings, and a support card on the right.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome.** H1 "Settings" DM Sans 30/700.
2. **Two-column grid:** Left 70%, right 30%, 24px gap.
3. **Left column (cards stacked vertically, 24px gap):**
   - **Institution Card:** H2 18/600 "Institution". Form fields: Name (h-40 input), Address (textarea), Contact (phone + email inputs). Save primary button Forest Green 800 h-40.
   - **Grade Boundaries Card:** H2 "Grade Boundaries". Table of 5 rows (A+, A, B, C, F), each row with a colored chip (Slate 100 bg, Slate 600 text) showing the grade, a "Min %" input, "Max %" input. Save primary + Reset outline buttons.
   - **Session Timer Card:** "Current Session" uppercase 12/500 Slate 500 label + "Expires in: **14:32**" DM Mono 14/600 tabular (red if < 5 min, else Slate 700).
4. **Right column — Support Card:** Green-800/5 tint background, Green-800/10 border, radius 10, padding 20. Help-circle icon + "Need help with advanced config?" H3 14/600 Forest Green 800. Below: 13/400 Slate 600 body paragraph. Footer: "Open Developer Docs →" Forest Green 800 12/500 underlined link.

---

## 16 — Admin Activity Log

Filterable audit log table. Each row shows actor, action type, target entity, and timestamp.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Admin chrome.** H1 "Activity Log" DM Sans 30/700.
2. **Filter Row:** Inside a white card — Actor select, Action type multi-select, Date range picker, Entity type select, Clear button.
3. **Activity Table:** White card wrapper. Columns: Timestamp (DM Mono 13 Slate 600), Actor (28×28 avatar + DM Sans 14/500 Near Black name), Action (colored pill: RESET_PASSWORD in Red 50/200/700, FORCE_OPEN_EXAM in Yellow 50/200/800, SUBMIT_EXAM in Green 50/200/800, etc.), Entity (DM Sans 13 Slate 600 type + link), Metadata (mono ellipsis if present).
4. **Pagination Row.**

---

## 17 — Student Profile

A card-based profile page. Hero ID card with avatar + name + Candidate ID + level pill. Meta strip below with member-since + status.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Student chrome.**
2. **Centered column (max-width 560px, top margin 48px).**
3. **Page H1** "My Profile" DM Sans 30/700 Near Black, tight letter-spacing.
4. **Hero ID Card:** White, Slate 200 border, radius 14, shadow-md, padding 32, flex row, 24px gap.
   - **Left:** 96×96 Forest Green 800 circular avatar with white DM Sans 32/700 initials. Aria-hidden.
   - **Right flex column:**
     - Full name H2 DM Sans 24/700 Near Black line-height 1.2.
     - "CANDIDATE ID" uppercase label (DM Sans 10/600 Slate 400, letter-spaced 0.08em).
     - Roll number in DM Mono 16/500 Slate 600 tabular directly under the label.
     - Level pill: inline-flex, Forest Green 50 bg, Forest Green 200 border, radius-pill, padding 6×14, DM Sans 13/600 Forest Green 800, text "Level 1".
5. **Meta Strip Card (secondary, smaller):** White, Slate 200 border, radius 14, shadow-sm, padding 20, flex row justify-between. Two items separated by a 1×32 Slate 200 vertical divider.
   - Left item: "MEMBER SINCE" uppercase 10/600 Slate 400 label, then "15 March 2026" DM Mono 14/500 tabular Near Black.
   - Right item: "STATUS" uppercase 10/600 Slate 400 label, then "Active" DM Sans 14/500 Forest Green 800.

---

## 18 — Student Exams List (EXAM type only)

Three-section list grouped Live / Upcoming / Completed. Only vertical-format papers.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Student chrome.** H1 "Exams" DM Sans 30/700 Near Black.
2. **LIVE NOW Section** (only rendered if any LIVE paper): Section caption "LIVE NOW" uppercase 11/700 Red 500 letter-spaced. Below: LiveExamCard (same hero style as student dashboard — white bg, 2px green border, LIVE badge, countdown, enter button).
3. **Upcoming Section:** H2 "Upcoming" DM Sans 18/600 Near Black. Below: vertical list of exam rows (same date-badge style as student dashboard upcoming row — APR 8 date block + title + meta + chevron).
4. **Completed Section:** H2 "Completed" DM Sans 18/600 Near Black. Below: vertical list of rows showing title, score pill (DM Mono), and a "View Result →" link.
5. **Empty State (if all 3 sections are empty):** Centered card with book-open icon (32×32 Slate 400), H3 "No exams scheduled yet" 15/600 Near Black, and body "Your exams will appear here when they're published." 13/400 Slate 500.

---

## 19 — Student Tests List (TEST / Flash Anzan type)

Near-mirror of the Exams list but filtered to Flash Anzan tests. Uses a Zap icon for the empty state.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Student chrome.** H1 "Tests" DM Sans 30/700 Near Black.
2. **LIVE NOW / Upcoming / Completed** — same 3-section structure as the Exams list.
3. **Empty State:** Zap icon (32×32 Slate 400), H3 "No tests scheduled yet", body "Your Flash Anzan tests will appear here when they're published."

---

## 20 — Login

Centered card on a Brand Navy (#204074) full-page background. Professional, trustworthy, minimal branding.

DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts

**Page Structure:**
1. **Full-viewport background:** Solid Brand Navy `#204074`.
2. **Centered card (max-width 440px):** White bg, radius 20, shadow 0 20px 60px rgba(0,0,0,0.3), padding 48.
3. **Logo area (top of card):** MINDSPARK wordmark centered (DM Sans 28/700 Near Black). Below: "Mental Arithmetic Assessment Platform" caption DM Sans 13/400 Slate 600.
4. **Form:**
   - "Email" label DM Sans 12/600 Slate 600 uppercase letter-spaced
   - Email input h-48 radius 10 Slate 200 border DM Sans 15/400
   - "Password" label same style
   - Password input same
   - "Forgot password?" link right-aligned DM Sans 13/500 Forest Green 800 underlined
5. **Sign In Button:** Full-width Forest Green 800 bg, white text DM Sans 16/600, h-56, radius 10.
6. **Footer caption (below card):** "© 2026 MINDSPARK · Support" DM Sans 12/400 white/60 opacity, centered.

---

## How to use this file

1. Open [Google Stitch](https://stitch.withgoogle.com) and create a new project (or new canvas).
2. Pick the screen you want to generate. Copy its prompt text from `## XX — …` down to just above the next `##`.
3. Replace the placeholder `DESIGN SYSTEM prompt after the end of MINDSPARK Stitch Prompts` with the actual shared block from the top of this file (or keep it inline — Stitch handles either).
4. Paste into Stitch's prompt input and generate.
5. Iterate on the generated design inside Stitch — add variants, swap components, tweak spacing. The DESIGN SYSTEM block ensures multi-screen consistency.
6. When satisfied, use the `react-components` skill (if you want Stitch → code) or hand-port to the existing MINDSPARK `src/` tree.

**Reference:** Full token + component definitions in `docs/DESIGN.md`. Canonical source: `docs/abacus-edge-design-spec (4).html` §28.

----------------- end of MINDSPARK Stitch Prompts----------------------------------


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

----------------- end of MINDSPARK Design System----------------------------------

starts of abacus-edge-design-spec (4).html

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MINDSPARK — Design System v3.0 Final</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');
:root{
  /* ── UI SYSTEM (both panels) ── */
  --page:#F8FAFC;--card:#FFFFFF;--b:#E2E8F0;--bmd:#CBD5E1;
  --t1:#0F172A;--t2:#475569;--t3:#94A3B8;
  --g900:#0D2B1F;--g800:#1A3829;--g700:#1E4A35;--g600:#2D6A4F;
  --g500:#40916C;--g400:#52B788;--g300:#74C69D;--g200:#B7E4C7;--g50:#EFFAF4;
  --live:#EF4444;
  --ok-bg:#DCFCE7;--ok-tx:#166534;
  --wn-bg:#FEF9C3;--wn-tx:#854D0E;
  --er-bg:#FEE2E2;--er-tx:#991B1B;
  --in-bg:#DBEAFE;--in-tx:#1E40AF;
  --s-neg:#991B1B;
  --ff-std-tx:#0F172A;--ff-std-bg:#FFFFFF;
  --ff-mid-tx:#1E293B;--ff-mid-bg:#F8FAFC;
  --ff-fast-tx:#334155;--ff-fast-bg:#F1F5F9;

  /* ── MINDSPARK BRAND PALETTE ── */
  --ms-navy:#204074;
  --ms-blue:#3A9ED1;
  --ms-orange:#F57A39;
  --ms-yellow:#F5BE38;
  --ms-navy2:#234176;

  --f:'DM Sans',sans-serif;--fm:'DM Mono',monospace;
  --s1:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --s2:0 4px 12px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04);
  --s3:0 10px 32px rgba(0,0,0,.12),0 4px 8px rgba(0,0,0,.06);
  --r1:4px;--r2:6px;--r3:10px;--r4:14px;--r5:18px;--rf:9999px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--f);background:#F1F5F9;color:var(--t1);line-height:1.6;font-size:14px}
code,pre{font-family:var(--fm)}

/* CHROME */
.hdr{background:linear-gradient(135deg,#0D2B1F,#1A3829 55%,#1E4A35);color:#fff;padding:60px 72px 52px;position:relative;overflow:hidden}
.hdr::before{content:'';position:absolute;top:-100px;right:-60px;width:460px;height:460px;border-radius:50%;background:rgba(255,255,255,.03)}
.hdr-brand{display:flex;align-items:center;gap:18px;margin-bottom:24px}
.hdr-logo{width:56px;height:56px;border-radius:12px;background:rgba(255,255,255,.08);padding:8px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.15);flex-shrink:0}
.hdr-logo img{width:100%;height:100%;object-fit:contain}
.hdr-name{font-size:28px;font-weight:700;color:#fff;letter-spacing:.04em}
.hdr-name span{font-size:11px;font-weight:500;display:block;color:rgba(255,255,255,.45);letter-spacing:.1em;text-transform:uppercase;margin-top:2px}
.hdr-badge{display:inline-flex;align-items:center;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:5px 16px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;color:rgba(255,255,255,.8)}
.hdr h1{font-size:44px;font-weight:700;line-height:1.05;margin-bottom:14px;letter-spacing:-.02em}
.hdr h1 em{font-style:normal;color:#FFD700}
.hdr-sub{font-size:15px;color:rgba(255,255,255,.55);max-width:580px;line-height:1.65}
.hdr-meta{display:flex;gap:40px;margin-top:36px;flex-wrap:wrap}
.hdr-meta label{display:block;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:5px}
.hdr-meta span{font-size:13px;color:rgba(255,255,255,.8);font-weight:500}
.toc{background:#0D2B1F;padding:14px 72px;display:flex;flex-wrap:wrap;gap:2px}
.toc a{color:rgba(255,255,255,.4);font-size:12px;font-weight:500;padding:6px 12px;border-radius:5px;transition:all .15s;white-space:nowrap;text-decoration:none}
.toc a:hover{background:rgba(255,255,255,.07);color:#fff}
.wrap{max-width:1180px;margin:0 auto;padding:52px 40px 100px}
.hr{height:1px;background:var(--b);margin:60px 0}
.ey{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--g500);margin-bottom:8px}
.st{font-size:30px;font-weight:700;margin-bottom:8px;letter-spacing:-.01em}
.sd{font-size:14px;color:var(--t2);max-width:640px;line-height:1.7;margin-bottom:32px}
.pl{display:inline-flex;align-items:center;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:12px}
.pla{background:var(--g50);color:var(--g700);border:1px solid var(--g200)}
.pls{background:var(--g900);color:#fff;border:1px solid var(--g700)}
.plsh{background:#EEF2FF;color:#3730A3;border:1px solid #C7D2FE}

/* LAYOUT */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.demo{background:var(--page);border:1px solid var(--b);border-radius:var(--r4);padding:28px;display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;margin-bottom:14px}

/* CARDS */
.card{background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:24px;box-shadow:var(--s1)}
.card+.card{margin-top:14px}
.ctitle{font-size:13px;font-weight:600;margin-bottom:4px}

/* TABLES */
.tbl{width:100%;border-collapse:collapse;font-size:12.5px}
.tbl th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);padding:0 14px 10px;border-bottom:2px solid var(--b)}
.tbl td{padding:10px 14px;border-bottom:1px solid #F1F5F9;vertical-align:top;line-height:1.55}
.tbl tr:last-child td{border-bottom:none}
.tbl code{font-size:11px;background:#F1F5F9;padding:1px 6px;border-radius:4px;color:var(--g700)}

/* SWATCHES */
.srow{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.sw{flex:1;min-width:62px;border-radius:10px;overflow:hidden;border:1px solid rgba(0,0,0,.06)}
.swb{height:50px}
.swi{padding:7px 9px;background:#fff}
.swn{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;display:block;color:#64748B}
.swh{font-size:10px;font-family:var(--fm);color:#94A3B8}

/* CALLOUTS */
.warn{background:#FFFBEB;border:1.5px solid #FDE68A;border-left:4px solid #F59E0B;border-radius:0 var(--r3) var(--r3) 0;padding:14px 18px;font-size:13px;color:#78350F;line-height:1.6;margin:14px 0}
.info{background:var(--g50);border:1.5px solid var(--g200);border-left:4px solid var(--g500);border-radius:0 var(--r3) var(--r3) 0;padding:14px 18px;font-size:13px;color:var(--g800);line-height:1.6;margin:14px 0}
.danger{background:#FEF2F2;border:1.5px solid #FECACA;border-left:4px solid #DC2626;border-radius:0 var(--r3) var(--r3) 0;padding:14px 18px;font-size:13px;color:#7F1D1D;line-height:1.6;margin:14px 0}
.ms-box{background:#EFF6FF;border:1.5px solid #BFDBFE;border-left:4px solid #3A9ED1;border-radius:0 var(--r3) var(--r3) 0;padding:14px 18px;font-size:13px;color:#1E3A5F;line-height:1.6;margin:14px 0}
.warn strong,.info strong,.danger strong,.ms-box strong{font-weight:700;display:block;margin-bottom:4px}

/* BADGES */
.bdg{display:inline-block;font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px}
.bok{background:#DCFCE7;color:#166534}
.bwn{background:#FEF9C3;color:#854D0E}
.bfl{background:#FEE2E2;color:#991B1B}
.bin{background:#DBEAFE;color:#1E40AF}
.blv{background:#EF4444;color:#fff;animation:pulse 1.5s ease-in-out infinite}
.bct{display:inline-flex;align-items:center;justify-content:center;background:var(--g500);color:#fff;font-size:10px;font-weight:700;min-width:20px;height:20px;padding:0 5px;border-radius:999px}
.waaa{display:inline-block;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:#DCFCE7;color:#166534;text-transform:uppercase;letter-spacing:.05em}
.wfl{display:inline-block;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:#FEE2E2;color:#991B1B;text-transform:uppercase;letter-spacing:.05em}
.v3t{display:inline-block;background:#F3E8FF;color:#6B21A8;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;margin-left:6px;letter-spacing:.04em;text-transform:uppercase}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}

/* KPI CARDS */
.kh{background:var(--g800);border-radius:var(--r4);padding:22px;color:#fff;flex:1;min-width:155px;position:relative;overflow:hidden}
.kh-lbl{font-size:13px;font-weight:500;opacity:.75;margin-bottom:10px}
.kh-num{font-size:42px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;margin-bottom:12px}
.kh-tr{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;font-size:11px;font-weight:500}
.kh-arr{position:absolute;top:16px;right:16px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:12px}
.ks{background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:22px;flex:1;min-width:140px;box-shadow:var(--s1);position:relative}
.ks-lbl{font-size:13px;font-weight:500;color:var(--t2);margin-bottom:10px}
.ks-num{font-size:42px;font-weight:700;color:var(--t1);line-height:1;font-variant-numeric:tabular-nums;margin-bottom:12px}
.ks-tr{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--g500)}
.ks-arr{position:absolute;top:16px;right:16px;width:26px;height:26px;border-radius:50%;border:1.5px solid var(--b);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--t3)}

/* SKELETON */
.sk-block{border-radius:6px;background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%);background-size:400% 100%;animation:shimmer 1.5s ease-in-out infinite}
@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}

/* BUTTONS */
.abp{display:inline-flex;align-items:center;gap:7px;background:var(--g800);color:#fff;font-family:var(--f);font-size:14px;font-weight:500;padding:10px 20px;border:none;border-radius:var(--r3);cursor:pointer}
.abs{display:inline-flex;align-items:center;gap:7px;background:#fff;color:var(--t1);font-family:var(--f);font-size:14px;font-weight:500;padding:10px 20px;border:1.5px solid var(--bmd);border-radius:var(--r3);cursor:pointer}
.abd{background:#FEF2F2;color:#DC2626;font-family:var(--f);font-size:12px;font-weight:600;padding:6px 14px;border-radius:8px;border:1.5px solid #FECACA;cursor:pointer}
.fab{display:inline-flex;align-items:center;gap:8px;background:var(--g800);color:#fff;font-size:13px;font-weight:600;padding:12px 24px;border-radius:999px;box-shadow:0 4px 16px rgba(26,56,41,.35);cursor:pointer;font-family:var(--f);border:none}
.sbp{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--g800);color:#fff;font-family:var(--f);font-size:15px;font-weight:600;padding:14px 28px;border:none;border-radius:var(--r3);cursor:pointer;width:100%}
.sbsk{display:inline-block;background:transparent;color:var(--t3);font-family:var(--f);font-size:12px;padding:8px 16px;border:1px solid var(--b);border-radius:8px;cursor:pointer}

/* SIDEBARS */
.aside{background:#fff;border:1px solid var(--b);width:220px;padding:20px 14px;border-radius:var(--r4);box-shadow:var(--s1)}
.aside-logo{display:flex;align-items:center;gap:10px;padding:4px 8px;margin-bottom:24px}
.aside-mark{width:32px;height:32px;border-radius:8px;overflow:hidden;background:#fff;border:1px solid var(--b);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:3px}
.aside-mark img{width:100%;height:100%;object-fit:contain}
.aside-txt{font-size:14px;font-weight:700;color:var(--t1);letter-spacing:.04em}
.aside-sec{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);padding:4px 10px;margin:8px 0 4px}
.navi{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;font-size:13px;font-weight:500;color:var(--t2);cursor:pointer;margin-bottom:2px}
.navi.on{background:var(--g50);color:var(--g800);border-left:3px solid var(--g700);padding-left:9px}
.navi-icon{width:16px;height:16px;background:var(--b);border-radius:3px;flex-shrink:0;font-size:10px;display:flex;align-items:center;justify-content:center}
.navi.on .navi-icon{background:var(--g200);color:var(--g800)}

/* STUDENT CARDS */
.sc-live{background:#fff;border:2px solid var(--g800);border-radius:var(--r4);padding:20px;min-width:190px;box-shadow:var(--s2)}
.sc-pend{background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:20px;min-width:170px;box-shadow:var(--s1)}
.sc-lock{background:#F8FAFC;border:1px solid var(--b);border-radius:var(--r4);padding:20px;min-width:170px;opacity:.6}
.sc-type{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);margin-bottom:8px}
.sc-ttl{font-size:15px;font-weight:700;color:var(--t1);margin-bottom:6px}
.sc-meta{font-size:11px;color:var(--t2);margin-bottom:14px}
.ss-live{display:inline-flex;align-items:center;gap:6px;background:var(--g800);color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px}
.ss-pend{display:inline-flex;align-items:center;gap:6px;background:var(--g50);color:var(--g700);font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px}
.ss-lock{display:inline-flex;align-items:center;gap:6px;background:var(--b);color:var(--t3);font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px}

/* MCQ */
.mcq{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
.mq{min-height:64px;padding:16px;background:#fff;border:1.5px solid var(--b);border-radius:var(--r3);color:var(--t1);font-family:var(--fm);font-size:22px;font-weight:700;cursor:pointer;text-align:center;transition:none;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums;box-shadow:var(--s1)}
.mq.sel{border:3px solid var(--g800);background:var(--g50);color:var(--g800)}
.mq.ok{border:2px solid var(--g500);background:#DCFCE7;color:#166534}
.mq.ng{border:2px solid var(--er-tx);background:var(--er-bg);color:var(--er-tx);text-decoration:line-through}

/* TIMER */
.stmr{display:inline-flex;align-items:center;gap:10px;background:var(--g50);border:1.5px solid var(--g300);border-radius:999px;padding:8px 22px}
.stmr-d{font-family:var(--fm);font-size:28px;font-weight:600;color:var(--g800);font-variant-numeric:tabular-nums;letter-spacing:.05em}
.stmr.amb{background:#FFFBEB;border-color:#F59E0B}
.stmr.amb .stmr-d{color:#92400E}

/* FLASH */
.fscr{background:#FFFFFF;border:1px solid var(--b);border-radius:var(--r4);width:100%;min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;box-shadow:var(--s1)}
.fn{font-family:var(--fm);font-size:96px;font-weight:700;color:#0F172A;line-height:1;font-variant-numeric:tabular-nums;transition:none}
.fn-neg{color:#991B1B}
.fps{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);position:absolute;top:12px;left:50%;transform:translateX(-50%)}

/* EXAM VERTICAL */
.exbox{background:#fff;border:1px solid var(--b);border-radius:12px;overflow:hidden;max-width:200px;box-shadow:var(--s1)}
.exeq{font-family:var(--fm);font-size:26px;font-weight:600;color:var(--t1);text-align:right;line-height:1.9;font-variant-numeric:tabular-nums;padding:12px 18px;border-right:1px solid var(--b)}
.exalt{background:var(--page)}

/* LOBBY */
.lobby{background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:28px;max-width:320px;text-align:center;box-shadow:var(--s2)}
.lobby-br{width:56px;height:56px;border-radius:50%;border:2px solid var(--g300);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;animation:bth 4s ease-in-out infinite}
.lobby-bri{width:24px;height:24px;border-radius:50%;background:var(--g200);animation:bri 4s ease-in-out infinite}
@keyframes bth{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.08);opacity:1}}
@keyframes bri{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
.lobby-tmr{display:inline-block;font-family:var(--fm);font-size:36px;font-weight:600;color:var(--g800);background:var(--g50);border:1.5px solid var(--g300);border-radius:10px;padding:10px 28px;margin-bottom:16px;font-variant-numeric:tabular-nums}

/* INTERSTITIAL */
.intr{background:#fff;border:1px solid var(--b);border-radius:var(--r5);padding:36px;text-align:center;min-width:260px;box-shadow:var(--s3)}
.intr-circle{width:60px;height:60px;border-radius:50%;border:2px solid var(--g500);background:var(--g50);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:24px;animation:bth 2s ease-in-out infinite}
.intr-bar{width:100%;height:3px;background:var(--b);border-radius:2px;margin-top:24px;overflow:hidden}
.intr-fill{height:100%;background:var(--g500);width:60%;border-radius:2px}

/* RESULT */
.res-card{background:#fff;border:2px solid var(--g800);border-radius:var(--r4);padding:28px;text-align:center;max-width:280px;box-shadow:var(--s2)}
.res-score{font-family:var(--fm);font-size:64px;font-weight:700;color:var(--g800);line-height:1;font-variant-numeric:tabular-nums;margin:10px 0}
.res-grade{font-size:22px;font-weight:700;color:var(--g600);margin:8px 0}
.res-lbl{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3)}

/* REVIEW GRID */
.rv-h{display:grid;grid-template-columns:1fr 2fr 80px;gap:1px;background:var(--b);border-radius:8px 8px 0 0;overflow:hidden}
.rv-r{display:grid;grid-template-columns:1fr 2fr 80px;gap:1px;background:var(--b);margin-bottom:1px}
.rv-c{padding:10px 12px;font-size:12px;font-family:var(--fm);color:var(--t2);background:#fff}
.rv-c.ok{background:#DCFCE7;color:#166534}
.rv-c.ng{background:var(--er-bg);color:var(--er-tx)}
.rv-hc{padding:8px 12px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);background:var(--page)}

/* NETWORK BANNER */
.nbanner{width:100%;padding:12px 20px;background:#FEF9C3;border:2px solid #F59E0B;border-left:4px solid #D97706;border-radius:8px;font-size:14px;font-weight:600;color:#78350F;display:flex;align-items:center;gap:10px;font-family:var(--f)}
.offbdg{display:inline-flex;align-items:center;gap:6px;background:var(--wn-bg);border:1px solid #F59E0B;border-radius:999px;padding:5px 12px;font-size:11px;font-weight:600;color:var(--wn-tx)}

/* LOTTIE */
.lottie-page{background:rgba(248,250,252,.92);border-radius:var(--r5);padding:48px 40px;text-align:center;border:1px solid var(--b);box-shadow:var(--s3);min-width:280px}
.lottie-box{width:80px;height:74px;background:var(--g50);border-radius:10px;display:flex;align-items:center;justify-content:center;border:1px solid var(--g200)}
.lottie-abacus{font-size:40px;animation:bth 1.5s ease-in-out infinite}
.lottie-progress{width:160px;height:3px;background:var(--b);border-radius:2px;overflow:hidden;margin-top:4px}
.lottie-progress-fill{height:100%;background:var(--g500);border-radius:2px;width:65%;animation:lp 2s ease-in-out infinite alternate}
@keyframes lp{from{width:20%}to{width:90%}}

/* MONITOR */
.mon{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;margin-bottom:4px;font-size:13px}
.mon-ok{background:#F0FDF4;border:1px solid #BBF7D0}
.mon-am{background:#FFFBEB;border:1px solid #FDE68A}
.mon-bl{background:#EFF6FF;border:1px solid #BFDBFE}
.mon-gy{background:#F8FAFC;border:1px solid var(--b)}
.mon-name{font-weight:600;color:var(--t1);flex:1}
.mon-sub{font-size:11px;color:var(--t3);margin-top:1px}
.sdot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}

/* PIPELINE */
.pipe{display:flex;align-items:center}
.pipe-step{display:flex;flex-direction:column;align-items:center;gap:4px}
.pdot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.pd{background:var(--g800);color:#fff}.pa{background:var(--g400);color:#fff;box-shadow:0 0 0 3px rgba(82,183,136,.25)}.pp{background:var(--b);color:var(--t3)}
.plbl{font-size:10px;font-weight:500;color:var(--t2);white-space:nowrap}
.pline{flex:1;height:2px;margin:0 4px;margin-bottom:18px}
.pld{background:var(--g400)}.plp{background:var(--b)}

/* DO DONT */
.dd{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.do-c{background:#fff;border:1.5px solid #BBF7D0;border-radius:12px;padding:20px}
.dn-c{background:#fff;border:1.5px solid #FECACA;border-radius:12px;padding:20px}
.do-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#166534;margin-bottom:12px}
.dn-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#991B1B;margin-bottom:12px}
.rl{list-style:none}
.rl li{font-size:12.5px;color:var(--t2);padding:5px 0 5px 16px;position:relative;border-bottom:1px solid var(--b);line-height:1.5}
.rl li:last-child{border-bottom:none}
.do-c li::before{content:'\2713';position:absolute;left:0;color:#22C55E;font-weight:700}
.dn-c li::before{content:'\2717';position:absolute;left:0;color:#EF4444;font-weight:700}

/* SPACING */
.sp-row{display:flex;align-items:center;gap:16px;padding:8px 0;border-bottom:1px solid var(--b)}
.sp-b{background:var(--g200);border-radius:3px;height:16px;flex-shrink:0}
.sp-l{font-family:var(--fm);font-size:11px;color:var(--t2);min-width:90px}
.sp-u{font-size:12px;color:var(--t3)}

/* MOTION GRID */
.mg{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.mc{background:#fff;border:1px solid var(--b);border-radius:10px;padding:16px}
.mc-n{font-size:12px;font-weight:600;margin-bottom:4px}
.mc-v{font-family:var(--fm);font-size:11px;color:var(--g600);margin-bottom:4px}
.mc-w{font-size:11px;color:var(--t3);line-height:1.5}

/* ICON GRID */
.icon-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px}
.ic{background:var(--page);border:1px solid var(--b);border-radius:var(--r3);padding:12px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px;color:var(--t3);text-align:center}
.ic-box{width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--g700)}

/* CONTRAST TABLE */
.ct{width:100%;border-collapse:collapse;font-size:12px}
.ct th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);padding:0 14px 10px;border-bottom:2px solid var(--b)}
.ct td{padding:12px 14px;border-bottom:1px solid var(--b);vertical-align:middle}
.ct tr:last-child td{border-bottom:none}

/* CODE */
.cb{background:#0F172A;border-radius:12px;padding:24px 28px;overflow-x:auto}
.cb pre{font-family:var(--fm);font-size:11.5px;line-height:1.9;color:#CBD5E1;margin:0;white-space:pre}
.cc{color:#475569}.ck{color:#7DD3FC}.cv{color:#86EFAC}.cs{color:#FCA5A5}

/* BRAND SECTION */
.brand-bar{background:linear-gradient(90deg,#204074 0%,#3A9ED1 33%,#F57A39 66%,#F5BE38 100%);height:5px;border-radius:999px;margin:16px 0}
.brand-hero{background:var(--ms-navy);border-radius:var(--r4);padding:32px;display:flex;align-items:center;gap:32px;color:#fff;margin-bottom:14px}
.brand-hero-logo{width:80px;height:80px;background:rgba(255,255,255,.08);border-radius:16px;padding:10px;border:1px solid rgba(255,255,255,.15);flex-shrink:0}
.brand-hero-logo img{width:100%;height:100%;object-fit:contain}
.brand-hero-name{font-size:40px;font-weight:700;letter-spacing:.08em;color:#fff}
.brand-hero-sub{font-size:13px;color:rgba(255,255,255,.5);margin-top:4px;letter-spacing:.04em}
.brand-hero-tagline{font-size:15px;color:rgba(255,255,255,.7);margin-top:10px;font-style:italic}

footer{background:#204074;color:rgba(255,255,255,.4);text-align:center;padding:28px;font-size:12px}
footer strong{color:rgba(255,255,255,.75)}

@media(max-width:900px){
  .hdr{padding:40px 28px 36px}.hdr h1{font-size:32px}
  .toc{padding:14px 20px}.wrap{padding:36px 20px 60px}
  .g2,.g3,.g4,.dd{grid-template-columns:1fr}
}
</style>
</head>
<body>

<div class="hdr">
  <div class="hdr-brand">
    <div class="hdr-logo">
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwMCIgem9vbUFuZFBhbj0ibWFnbmlmeSIgdmlld0JveD0iMCAwIDE1MDAgMTQ5OS45OTk5MzMiIGhlaWdodD0iMjAwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48cmVjdCB4PSItMTUwIiB3aWR0aD0iMTgwMCIgZmlsbD0iI2ZlZmVmZSIgeT0iLTE0OS45OTk5OTMiIGhlaWdodD0iMTc5OS45OTk5MiIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSAxMTAxLjIzNDM3NSAzODguNzczNDM4IEwgMTEzMS43NjE3MTkgMzg4Ljc3MzQzOCBMIDExODkgMzkyLjU4OTg0NCBMIDEyMDYuMTcxODc1IDM5Ni40MDYyNSBMIDEyMTcuNjIxMDk0IDQwNC4wMzkwNjIgTCAxMjIzLjM0Mzc1IDQxNy4zOTQ1MzEgTCAxMjI5LjA2NjQwNiA0ODQuMTcxODc1IEwgMTI0Mi40MjU3ODEgNzQzLjY1NjI1IEwgMTI0OC4xNDg0MzggODM1LjIzODI4MSBMIDEyNjEuNTAzOTA2IDk3Mi42MDkzNzUgTCAxMjYzLjQxMDE1NiAxMDAxLjIzMDQ2OSBMIDEyNjMuNDEwMTU2IDEwMjkuODQ3NjU2IEwgMTI1MC4wNTQ2ODggMTA1MC44MzU5MzggTCAxMjMwLjk3NjU2MiAxMDY2LjEwMTU2MiBMIDEyMDkuOTg4MjgxIDEwNzMuNzMwNDY5IEwgMTE5Ni42MzI4MTIgMTA3NS42NDA2MjUgTCAxMTEwLjc3MzQzOCAxMDc1LjY0MDYyNSBMIDExMDMuMTQ0NTMxIDk1MS42MjEwOTQgTCAxMDk3LjQxNzk2OSA4NTguMTMyODEyIEwgMTA5My42MDE1NjIgNzU4LjkxNzk2OSBMIDEwOTEuNjk1MzEyIDY3Ni44NzUgTCAxMDg1Ljk3MjY1NiA2OTIuMTQwNjI1IEwgMTA1NS40NDUzMTIgNzk3LjA3ODEyNSBMIDEwMTMuNDY4NzUgOTI2LjgyMDMxMiBMIDk4Ni43NTc4MTIgMTAwOC44NjMyODEgTCA5NjkuNTg1OTM4IDEwNTguNDY4NzUgTCA5NTguMTM2NzE5IDEwNzEuODI0MjE5IEwgOTQwLjk2NDg0NCAxMDc5LjQ1NzAzMSBMIDkyMy43OTI5NjkgMTA4My4yNzM0MzggTCA4OTUuMTc1NzgxIDEwODMuMjczNDM4IEwgODY0LjY0ODQzOCAxMDc3LjU0Njg3NSBMIDg0NS41NzAzMTIgMTA2OC4wMDc4MTIgTCA4MzcuOTM3NSAxMDU4LjQ2ODc1IEwgODI2LjQ4ODI4MSAxMDI3Ljk0MTQwNiBMIDc5NS45NjA5MzggOTMyLjU0Mjk2OSBMIDc3My4wNjY0MDYgODU2LjIyNjU2MiBMIDc2NS40MzM1OTQgODI5LjUxMTcxOSBMIDc2Ny4zNDM3NSA4MTQuMjUgTCA3OTAuMjM4MjgxIDczNy45Mjk2ODggTCA4MjYuNDg4MjgxIDYwOC4xOTE0MDYgTCA4MzYuMDI3MzQ0IDU3My44NDc2NTYgTCA4MzkuODQzNzUgNTc5LjU3MDMxMiBMIDg2NC42NDg0MzggNjczLjA2MjUgTCA5MDAuODk4NDM4IDgwMi44MDA3ODEgTCA5MDQuNzE0ODQ0IDgxNi4xNTYyNSBMIDkwNC43MTQ4NDQgODIzLjc4OTA2MiBMIDkwOC41MzEyNSA4MjMuNzg5MDYyIEwgOTEyLjM0NzY1NiA4MDYuNjE3MTg4IEwgOTUwLjUwNzgxMiA2OTcuODYzMjgxIEwgOTg4LjY2NDA2MiA1OTIuOTI1NzgxIEwgMTAxMy40Njg3NSA1MjIuMzMyMDMxIEwgMTA0MC4xNzk2ODggNDQ3LjkyMTg3NSBMIDEwNTUuNDQ1MzEyIDQxNy4zOTQ1MzEgTCAxMDY4LjgwMDc4MSA0MDIuMTI4OTA2IEwgMTA4MC4yNDYwOTQgMzk0LjUgWiBNIDExMDEuMjM0Mzc1IDM4OC43NzM0MzggIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNTdhMzkiIGQ9Ik0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSBMIDEzODEuNzAzMTI1IDgzMy4zMjgxMjUgTCAxMzgzLjYxMzI4MSA4NTIuNDEwMTU2IEwgMTM4My42MTMyODEgOTAzLjkyNTc4MSBMIDEzNzkuNzk2ODc1IDk0My45OTIxODggTCAxMzY4LjM0NzY1NiA5OTkuMzIwMzEyIEwgMTM1Ni45MDIzNDQgMTAzNy40ODA0NjkgTCAxMzQzLjU0Njg3NSAxMDczLjczMDQ2OSBMIDEzMjguMjgxMjUgMTEwNi4xNjc5NjkgTCAxMzA3LjI5Mjk2OSAxMTQyLjQxNzk2OSBMIDEyODguMjE0ODQ0IDExNjkuMTI4OTA2IEwgMTI2Ny4yMjY1NjIgMTE5My45MzM1OTQgTCAxMjUwLjA1NDY4OCAxMjEzLjAxMTcxOSBMIDEyMzAuOTc2NTYyIDEyMzIuMDkzNzUgTCAxMjA5Ljk4ODI4MSAxMjQ5LjI2NTYyNSBMIDExODEuMzcxMDk0IDEyNzAuMjUzOTA2IEwgMTE1Ni41NjY0MDYgMTI4NS41MTU2MjUgTCAxMTEyLjY4MzU5NCAxMzA4LjQxMDE1NiBMIDEwODAuMjQ2MDk0IDEzMjEuNzY1NjI1IEwgMTAzOC4yNzM0MzggMTMzNS4xMjEwOTQgTCA5OTAuNTc0MjE5IDEzNDYuNTcwMzEyIEwgOTMxLjQyNTc4MSAxMzU0LjIwMzEyNSBMIDgzNC4xMjEwOTQgMTM1NC4yMDMxMjUgTCA3ODguMzI4MTI1IDEzNDguNDc2NTYyIEwgNzM0LjkwNjI1IDEzMzcuMDMxMjUgTCA2OTYuNzQ2MDk0IDEzMjUuNTgyMDMxIEwgNjYwLjQ5NjA5NCAxMzEyLjIyNjU2MiBMIDYyMC40Mjk2ODggMTI5NS4wNTQ2ODggTCA1NzguNDUzMTI1IDEyNzIuMTYwMTU2IEwgNTQ0LjEwOTM3NSAxMjQ5LjI2NTYyNSBMIDUyMy4xMjUgMTIzNCBMIDUwNC4wNDI5NjkgMTIxOC43MzgyODEgTCA0ODEuMTQ4NDM4IDExOTcuNzUgTCA0NjUuODgyODEyIDExODQuMzk0NTMxIEwgNDQ0Ljg5ODQzOCAxMTYzLjQwNjI1IEwgNDMxLjU0Mjk2OSAxMTQ4LjE0NDUzMSBMIDQwNi43MzgyODEgMTExOS41MjM0MzggTCAzNzguMTE3MTg4IDEwODEuMzYzMjgxIEwgMzUzLjMxNjQwNiAxMDQzLjIwMzEyNSBMIDMzNC4yMzQzNzUgMTAwOC44NjMyODEgTCAzMTguOTcyNjU2IDk4MC4yNDIxODggTCAzMTMuMjQ2MDk0IDk2My4wNzAzMTIgTCAzMjIuNzg5MDYyIDk3Mi42MDkzNzUgTCAzNDcuNTg5ODQ0IDk5OS4zMjAzMTIgTCAzNjAuOTQ1MzEyIDEwMTQuNTg1OTM4IEwgNDA0LjgyODEyNSAxMDU4LjQ2ODc1IEwgNDIwLjA5Mzc1IDEwNzEuODI0MjE5IEwgNDQ0Ljg5ODQzOCAxMDkyLjgxMjUgTCA0NjkuNjk5MjE5IDExMTEuODkwNjI1IEwgNTAwLjIyNjU2MiAxMTMyLjg3ODkwNiBMIDUyOC44NDc2NTYgMTE1MC4wNTA3ODEgTCA1NjguOTE0MDYyIDExNzEuMDM5MDYyIEwgNjI4LjA2MjUgMTE5NS44Mzk4NDQgTCA2NzUuNzYxNzE5IDEyMTEuMTA1NDY5IEwgNzIxLjU1MDc4MSAxMjIyLjU1NDY4OCBMIDc3OC43ODkwNjIgMTIzMi4wOTM3NSBMIDgwMS42ODM1OTQgMTIzNCBMIDg5MS4zNTkzNzUgMTIzNCBMIDkyNS43MDMxMjUgMTIzMC4xODM1OTQgTCA5NzkuMTI1IDEyMjAuNjQ0NTMxIEwgMTAyNi44MjQyMTkgMTIwNy4yODkwNjIgTCAxMDYzLjA3NDIxOSAxMTkzLjkzMzU5NCBMIDExMDMuMTQ0NTMxIDExNzYuNzYxNzE5IEwgMTE0NS4xMTcxODggMTE1My44NjcxODggTCAxMTc1LjY0NDUzMSAxMTM0Ljc4NTE1NiBMIDEyMDkuOTg4MjgxIDExMDguMDc0MjE5IEwgMTIzNC43OTI5NjkgMTA4NS4xNzk2ODggTCAxMjY1LjMyMDMxMiAxMDU0LjY1MjM0NCBMIDEyOTAuMTIxMDk0IDEwMjIuMjE4NzUgTCAxMzA5LjIwMzEyNSA5OTUuNTA3ODEyIEwgMTMzMC4xOTE0MDYgOTU5LjI1MzkwNiBMIDEzNTEuMTc1NzgxIDkxNS4zNzEwOTQgTCAxMzY4LjM0NzY1NiA4NjcuNjcxODc1IEwgMTM3NS45ODA0NjkgODM5LjA1NDY4OCBaIE0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMSIgZD0iTSA3NjUuNDMzNTk0IDM5MC42ODM1OTQgTCA4NTUuMTA5Mzc1IDM5MC42ODM1OTQgTCA4NTEuMjkyOTY5IDQxMy41NzgxMjUgTCA4MDUuNSA1ODMuMzg2NzE5IEwgNzY1LjQzMzU5NCA3MjguMzkwNjI1IEwgNzMzIDg0Mi44NzEwOTQgTCA3MDAuNTYyNSA5NTcuMzQ3NjU2IEwgNjczLjg1MTU2MiAxMDQ4LjkyOTY4OCBMIDY2Ni4yMTg3NSAxMDY0LjE5MTQwNiBMIDY1NC43NzM0MzggMTA3MS44MjQyMTkgTCA2MzkuNTA3ODEyIDEwNzUuNjQwNjI1IEwgNDk2LjQxMDE1NiAxMDc1LjY0MDYyNSBMIDUwMC4yMjY1NjIgMTA1OC40Njg3NSBMIDU0MC4yOTY4NzUgOTMyLjU0Mjk2OSBMIDU3OC40NTMxMjUgODA2LjYxNzE4OCBMIDYwNy4wNzQyMTkgNzExLjIxODc1IEwgNjM1LjY5MTQwNiA2MTIuMDA3ODEyIEwgNjY0LjMxMjUgNTA3LjA3MDMxMiBMIDY4My4zOTA2MjUgNDM4LjM4MjgxMiBMIDY5Mi45MzM1OTQgNDEzLjU3ODEyNSBMIDcwMi40NzI2NTYgNDAyLjEyODkwNiBMIDcxNy43MzQzNzUgMzk0LjUgTCA3MzEuMDg5ODQ0IDM5Mi41ODk4NDQgWiBNIDc2NS40MzM1OTQgMzkwLjY4MzU5NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSA1MDQuMDQyOTY5IDM4OC43NzM0MzggTCA1NTMuNjUyMzQ0IDM4OC43NzM0MzggTCA1NzIuNzMwNDY5IDM5Mi41ODk4NDQgTCA1OTUuNjI1IDQwNC4wMzkwNjIgTCA2MDcuMDc0MjE5IDQxMy41NzgxMjUgTCA2MjIuMzM1OTM4IDQzNC41NjY0MDYgTCA2MzMuNzg1MTU2IDQ1Ny40NjA5MzggTCA2MzcuNjAxNTYyIDQ2OC45MTAxNTYgTCA2MzUuNjkxNDA2IDQ4NC4xNzE4NzUgTCA2MDguOTgwNDY5IDU4Ny4yMDMxMjUgTCA1ODQuMTc5Njg4IDY4MC42OTE0MDYgTCA1NzguNDUzMTI1IDY5NS45NTcwMzEgTCA1NzQuNjM2NzE5IDY5MC4yMzQzNzUgTCA1NTcuNDY0ODQ0IDY0MC42MjUgTCA1NDkuODM1OTM4IDc0OS4zNzg5MDYgTCA1NDYuMDE5NTMxIDc3OS45MDYyNSBMIDUxOS4zMDg1OTQgODc3LjIxMDkzOCBMIDQ3Ny4zMzIwMzEgMTAxOC40MDIzNDQgTCA0NjIuMDcwMzEyIDEwNjkuOTE3OTY5IEwgNDQ2LjgwNDY4OCAxMDU4LjQ2ODc1IEwgNDI1LjgxNjQwNiAxMDQxLjI5Njg3NSBMIDQwMS4wMTU2MjUgMTAxOC40MDIzNDQgTCAzNzYuMjEwOTM4IDk5My41OTc2NTYgTCAzNzguMTE3MTg4IDk2Ni44ODY3MTkgTCAzOTcuMTk5MjE5IDgwOC41MjczNDQgTCA0MTYuMjc3MzQ0IDYzMi45OTIxODggTCA0MzcuMjY1NjI1IDQyNi45MzM1OTQgTCA0NDEuMDgyMDMxIDQwOS43NjE3MTkgTCA0NTAuNjIxMDk0IDM5OC4zMTY0MDYgTCA0NjIuMDcwMzEyIDM5Mi41ODk4NDQgWiBNIDUwNC4wNDI5NjkgMzg4Ljc3MzQzOCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMCIgZD0iTSAyOTAuMzUxNTYyIDI0OS40OTIxODggTCAyOTAuMzUxNTYyIDI1NS4yMTg3NSBMIDI3My4xNzk2ODggMjgzLjgzNTkzOCBMIDI1Ny45MTc5NjkgMzEwLjU0Njg3NSBMIDIzNi45Mjk2ODggMzU2LjMzOTg0NCBMIDIxNy44NTE1NjIgNDA5Ljc2MTcxOSBMIDIwNC40OTYwOTQgNDU3LjQ2MDkzOCBMIDE5NC45NTMxMjUgNTA3LjA3MDMxMiBMIDE5MS4xMzY3MTkgNTM3LjU5NzY1NiBMIDE4OS4yMzA0NjkgNTY4LjEyNSBMIDE4OS4yMzA0NjkgNjIzLjQ1MzEyNSBMIDE5NC45NTMxMjUgNjg0LjUwNzgxMiBMIDIwNC40OTYwOTQgNzM3LjkyOTY4OCBMIDIxNS45NDE0MDYgNzgzLjcyMjY1NiBMIDIzNS4wMjM0MzggODM5LjA1NDY4OCBMIDI1OS44MjQyMTkgODk2LjI5Mjk2OSBMIDI2OS4zNjMyODEgOTEzLjQ2NDg0NCBMIDI2OS4zNjMyODEgOTI4LjcyNjU2MiBMIDI1Ny45MTc5NjkgOTQ3LjgwODU5NCBMIDIzNi45Mjk2ODggOTcyLjYwOTM3NSBMIDIyMy41NzQyMTkgOTkzLjU5NzY1NiBMIDIxNS45NDE0MDYgMTAxNi40OTIxODggTCAyMTUuOTQxNDA2IDEwNDguOTI5Njg4IEwgMjIzLjU3NDIxOSAxMDg3LjA4OTg0NCBMIDIzNi45Mjk2ODggMTEyNS4yNDYwOTQgTCAyNTkuODI0MjE5IDExNzIuOTQ1MzEyIEwgMjgyLjcxODc1IDEyMDkuMTk5MjE5IEwgMjk0LjE2Nzk2OSAxMjI2LjM2NzE4OCBMIDI4Ni41MzUxNTYgMTIyMi41NTQ2ODggTCAyNjMuNjQwNjI1IDEyMDUuMzgyODEyIEwgMjQ0LjU2MjUgMTE4OC4yMTA5MzggTCAyMjkuMjk2ODc1IDExNzQuODU1NDY5IEwgMTk2Ljg2MzI4MSAxMTQyLjQxNzk2OSBMIDE3NS44NzUgMTExNS43MDcwMzEgTCAxNTQuODg2NzE5IDEwODcuMDg5ODQ0IEwgMTMwLjA4MjAzMSAxMDQ3LjAxOTUzMSBMIDExNC44MjAzMTIgMTAxNi40OTIxODggTCA5NS43NDIxODggOTcyLjYwOTM3NSBMIDg0LjI5Mjk2OSA5MzguMjY1NjI1IEwgNjkuMDI3MzQ0IDg4MS4wMjczNDQgTCA1OS40ODgyODEgODIxLjg4MjgxMiBMIDU1LjY3MTg3NSA3NzggTCA1NS42NzE4NzUgNzA1LjQ5NjA5NCBMIDU5LjQ4ODI4MSA2NjMuNTE5NTMxIEwgNjkuMDI3MzQ0IDYwNC4zNzUgTCA4NC4yOTI5NjkgNTQ1LjIyNjU2MiBMIDEwMS40NjQ4NDQgNDk3LjUyNzM0NCBMIDExOC42MzY3MTkgNDU5LjM3MTA5NCBMIDEzOS42MjUgNDE5LjMwMDc4MSBMIDE3MC4xNTIzNDQgMzczLjUxMTcxOSBMIDE4OS4yMzA0NjkgMzQ4LjcwNzAzMSBMIDIxMC4yMTg3NSAzMjMuOTA2MjUgTCAyMzguODM1OTM4IDI5My4zNzg5MDYgTCAyNjUuNTUwNzgxIDI2OC41NzQyMTkgWiBNIDI5MC4zNTE1NjIgMjQ5LjQ5MjE4OCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIzNDE3NiIgZD0iTSA1NS42NzE4NzUgMTA2MC4zNzUgTCA2MS4zOTg0MzggMTA2Ni4xMDE1NjIgTCA3OC41NzAzMTIgMTA5Mi44MTI1IEwgOTcuNjQ4NDM4IDExMTkuNTIzNDM4IEwgMTIyLjQ1MzEyNSAxMTUwLjA1MDc4MSBMIDE0NS4zNDc2NTYgMTE3NC44NTU0NjkgTCAxNzcuNzgxMjUgMTIwNy4yODkwNjIgTCAxOTguNzY5NTMxIDEyMjQuNDYwOTM4IEwgMjIzLjU3NDIxOSAxMjQzLjUzOTA2MiBMIDI1Ni4wMDc4MTIgMTI2NC41MjczNDQgTCAyOTAuMzUxNTYyIDEyODMuNjA5Mzc1IEwgMzIyLjc4OTA2MiAxMjk4Ljg3MTA5NCBMIDM3MC40ODgyODEgMTMxNi4wNDI5NjkgTCA0MTIuNDYwOTM4IDEzMjcuNDkyMTg4IEwgNDUwLjYyMTA5NCAxMzMzLjIxNDg0NCBMIDQ5Ni40MTAxNTYgMTMzMy4yMTQ4NDQgTCA1MjUuMDMxMjUgMTMyNS41ODIwMzEgTCA1NDIuMjAzMTI1IDEzMTQuMTM2NzE5IEwgNTQ5LjgzNTkzOCAxMjk4Ljg3MTA5NCBMIDU1OS4zNzUgMTMwMi42ODc1IEwgNTk5LjQ0MTQwNiAxMzIzLjY3NTc4MSBMIDY1Ni42Nzk2ODggMTM0OC40NzY1NjIgTCA2OTQuODM5ODQ0IDEzNjEuODM1OTM4IEwgNzM4LjcyMjY1NiAxMzc1LjE5MTQwNiBMIDc4Mi42MDU0NjkgMTM4NC43MzA0NjkgTCA4MjQuNTgyMDMxIDEzOTAuNDUzMTI1IEwgOTQyLjg3NSAxMzkwLjQ1MzEyNSBMIDkzNS4yNDIxODggMTM5Ni4xNzU3ODEgTCA4NzYuMDk3NjU2IDE0MjAuOTgwNDY5IEwgODE4Ljg1NTQ2OSAxNDQwLjA1ODU5NCBMIDc1NS44OTQ1MzEgMTQ1NS4zMjQyMTkgTCA2OTQuODM5ODQ0IDE0NjQuODYzMjgxIEwgNjUyLjg2MzI4MSAxNDY4LjY3OTY4OCBMIDU5My43MTg3NSAxNDY4LjY3OTY4OCBMIDU0Mi4yMDMxMjUgMTQ2Mi45NTcwMzEgTCA0OTAuNjg3NSAxNDUzLjQxNzk2OSBMIDQ0OC43MTQ4NDQgMTQ0MS45Njg3NSBMIDM5NS4yODkwNjIgMTQyMi44OTA2MjUgTCAzMzkuOTYwOTM4IDEzOTYuMTc1NzgxIEwgMzA3LjUyMzQzOCAxMzc3LjA5NzY1NiBMIDI3Ni45OTYwOTQgMTM1Ni4xMDkzNzUgTCAyNTQuMTAxNTYyIDEzMzguOTM3NSBMIDIzMy4xMTMyODEgMTMyMS43NjU2MjUgTCAyMTQuMDM1MTU2IDEzMDQuNTkzNzUgTCAxOTEuMTM2NzE5IDEyODMuNjA5Mzc1IEwgMTc3Ljc4MTI1IDEyNjguMzQzNzUgTCAxNTguNzAzMTI1IDEyNDcuMzU1NDY5IEwgMTMwLjA4MjAzMSAxMjA5LjE5OTIxOSBMIDEwOS4wOTc2NTYgMTE3Ni43NjE3MTkgTCA4Ni4xOTkyMTkgMTEzNi42OTUzMTIgTCA2Ny4xMjEwOTQgMTA5NC43MTg3NSBMIDU1LjY3MTg3NSAxMDY2LjEwMTU2MiBaIE0gNTUuNjcxODc1IDEwNjAuMzc1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjM2I5ZGNlIiBkPSJNIDc2My41MjczNDQgMTguNjMyODEyIEwgODUzLjE5OTIxOSAxOC42MzI4MTIgTCA5MDYuNjI1IDI0LjM1NTQ2OSBMIDk1OC4xMzY3MTkgMzMuODk0NTMxIEwgMTAxMS41NjI1IDQ5LjE2MDE1NiBMIDEwNTcuMzUxNTYyIDY2LjMyODEyNSBMIDEwNzQuNTIzNDM4IDczLjk2MDkzOCBMIDEwNjYuODkwNjI1IDc1Ljg3MTA5NCBMIDEwMTMuNDY4NzUgNjQuNDIxODc1IEwgOTgyLjk0MTQwNiA2MC42MDU0NjkgTCA5NTYuMjMwNDY5IDU4LjY5OTIxOSBMIDg3OS45MTAxNTYgNTguNjk5MjE5IEwgODM3LjkzNzUgNjIuNTE1NjI1IEwgNzkyLjE0NDUzMSA3MC4xNDQ1MzEgTCA3MzguNzIyNjU2IDgzLjUgTCA2ODEuNDg0Mzc1IDEwMi41ODIwMzEgTCA2MzcuNjAxNTYyIDEyMS42NjAxNTYgTCA1OTMuNzE4NzUgMTQ0LjU1NDY4OCBMIDU1MS43NDIxODggMTcxLjI2OTUzMSBMIDUxNS40OTIxODggMTk3Ljk4MDQ2OSBMIDQ4OC43ODEyNSAyMjAuODc1IEwgNDYzLjk3NjU2MiAyNDMuNzY5NTMxIEwgNDM1LjM1NTQ2OSAyNzQuMjk2ODc1IEwgNDIwLjA5Mzc1IDI5My4zNzg5MDYgTCAzOTcuMTk5MjE5IDMyMy45MDYyNSBMIDM3Ni4yMTA5MzggMzU2LjMzOTg0NCBMIDM0OS41IDQwNC4wMzkwNjIgTCAzMzQuMjM0Mzc1IDQzNi40NzI2NTYgTCAzMTMuMjQ2MDk0IDQ5MS44MDQ2ODggTCAyOTkuODkwNjI1IDU0My4zMjAzMTIgTCAyOTQuMTY3OTY5IDU3MS45Mzc1IEwgMjg4LjQ0NTMxMiA2MjMuNDUzMTI1IEwgMjg2LjUzNTE1NiA2NzQuOTY4NzUgTCAyODIuNzE4NzUgNjY3LjMzNTkzOCBMIDI3MS4yNzM0MzggNjIzLjQ1MzEyNSBMIDI2My42NDA2MjUgNTc3LjY2NDA2MiBMIDI1OS44MjQyMTkgNTMzLjc4MTI1IEwgMjU5LjgyNDIxOSA0ODkuODk4NDM4IEwgMjYzLjY0MDYyNSA0NDYuMDE1NjI1IEwgMjcxLjI3MzQzOCA0MDQuMDM5MDYyIEwgMjgyLjcxODc1IDM2Mi4wNjI1IEwgMjk3Ljk4NDM3NSAzMjEuOTk2MDk0IEwgMzE1LjE1NjI1IDI4NS43NDYwOTQgTCAzMzIuMzI4MTI1IDI1Ny4xMjUgTCAzNTUuMjIyNjU2IDIyNC42OTE0MDYgTCAzNzYuMjEwOTM4IDE5OS44ODY3MTkgTCAzOTMuMzgyODEyIDE4MC44MDg1OTQgTCA0MTQuMzcxMDk0IDE1OS44MjAzMTIgTCA0MzUuMzU1NDY5IDE0Mi42NDg0MzggTCA0NjIuMDcwMzEyIDEyMS42NjAxNTYgTCA0OTQuNTAzOTA2IDEwMC42NzE4NzUgTCA1MjUuMDMxMjUgODMuNSBMIDU2NS4wOTc2NTYgNjQuNDIxODc1IEwgNTk5LjQ0MTQwNiA1MS4wNjY0MDYgTCA2NDUuMjM0Mzc1IDM3LjcxMDkzOCBMIDY4Ny4yMDcwMzEgMjguMTcxODc1IEwgNzQyLjUzOTA2MiAyMC41MzkwNjIgWiBNIDc2My41MjczNDQgMTguNjMyODEyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZjI3NTNjIiBkPSJNIDEzMzAuMTkxNDA2IDI2NC43NTc4MTIgTCAxMzM3LjgyMDMxMiAyNjQuNzU3ODEyIEwgMTM0MS42MzY3MTkgMjc0LjI5Njg3NSBMIDEzNTguODA4NTk0IDI3Ni4yMDcwMzEgTCAxMzYyLjYyNSAyNzguMTEzMjgxIEwgMTM2NC41MzUxNTYgMzA2LjczNDM3NSBMIDEzNjQuNTM1MTU2IDM3My41MTE3MTkgTCAxMzU4LjgwODU5NCA0MTMuNTc4MTI1IEwgMTM1NC45OTIxODggNDIxLjIxMDkzOCBMIDEzMTEuMTA5Mzc1IDQwMi4xMjg5MDYgTCAxMjcxLjA0Mjk2OSAzNzkuMjM0Mzc1IEwgMTI0NC4zMzIwMzEgMzYwLjE1NjI1IEwgMTIzNC43OTI5NjkgMzUwLjYxNzE4OCBMIDEyMzYuNjk5MjE5IDMzOS4xNjc5NjkgTCAxMjQ2LjIzODI4MSAzMjMuOTA2MjUgTCAxMjY1LjMyMDMxMiAzMDYuNzM0Mzc1IEwgMTMxMy4wMTk1MzEgMjc2LjIwNzAzMSBaIE0gMTMzMC4xOTE0MDYgMjY0Ljc1NzgxMiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y1YmUzOCIgZD0iTSAxMjQwLjUxNTYyNSAxNDguMzcxMDk0IEwgMTI0NC4zMzIwMzEgMTQ4LjM3MTA5NCBMIDEyNTAuMDU0Njg4IDE4Mi43MTQ4NDQgTCAxMjUxLjk2NDg0NCAyMDEuNzk2ODc1IEwgMTI1MS45NjQ4NDQgMjM0LjIzMDQ2OSBMIDEyNDQuMzMyMDMxIDI4MC4wMTk1MzEgTCAxMjQwLjUxNTYyNSAyOTMuMzc4OTA2IEwgMTIyOS4wNjY0MDYgMjg5LjU2MjUgTCAxMTk0LjcyNjU2MiAyNzAuNDgwNDY5IEwgMTE1OC40NzI2NTYgMjUxLjQwMjM0NCBMIDExMjkuODU1NDY5IDIzMi4zMjQyMTkgTCAxMTIwLjMxNjQwNiAyMjQuNjkxNDA2IEwgMTEyMi4yMjI2NTYgMjE1LjE1MjM0NCBMIDExNDguOTMzNTk0IDE5Ni4wNzAzMTIgTCAxMTgxLjM3MTA5NCAxNzYuOTkyMTg4IEwgMTIyMS40Mzc1IDE1Ni4wMDM5MDYgWiBNIDEyNDAuNTE1NjI1IDE0OC4zNzEwOTQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNWEzM2MiIGQ9Ik0gMTM5NS4wNjI1IDIwOS40MjU3ODEgTCAxNDA0LjYwMTU2MiAyMTEuMzM1OTM4IEwgMTQ0Mi43NTc4MTIgMjI2LjU5NzY1NiBMIDE0NjkuNDcyNjU2IDI0My43Njk1MzEgTCAxNDc1LjE5NTMxMiAyNDcuNTg1OTM4IEwgMTQ3MS4zNzg5MDYgMjU1LjIxODc1IEwgMTQ1OC4wMjM0MzggMjY4LjU3NDIxOSBMIDE0MzMuMjE4NzUgMjg3LjY1MjM0NCBMIDE0MTQuMTQwNjI1IDI5Ny4xOTE0MDYgTCAxNDAwLjc4NTE1NiAyOTcuMTkxNDA2IEwgMTM5My4xNTIzNDQgMjg3LjY1MjM0NCBMIDEzODUuNTE5NTMxIDI3MC40ODA0NjkgTCAxMzcyLjE2NDA2MiAyNzAuNDgwNDY5IEwgMTM3NC4wNzQyMTkgMjU5LjAzNTE1NiBMIDEzODcuNDI5Njg4IDIzMC40MTQwNjIgTCAxMzkzLjE1MjM0NCAyMTEuMzM1OTM4IFogTSAxMzk1LjA2MjUgMjA5LjQyNTc4MSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y0OTc1NiIgZD0iTSAxMjkyLjAzMTI1IDExMi4xMjEwOTQgTCAxMzEzLjAxOTUzMSAxMTQuMDI3MzQ0IEwgMTM0OS4yNjk1MzEgMTI3LjM4MjgxMiBMIDEzNzAuMjU3ODEyIDEzOC44MzIwMzEgTCAxMzY4LjM0NzY1NiAxNDYuNDY0ODQ0IEwgMTM0Ny4zNjMyODEgMTcxLjI2OTUzMSBMIDEzMjYuMzc1IDE5MC4zNDc2NTYgTCAxMzExLjEwOTM3NSAxOTcuOTgwNDY5IEwgMTMwMS41NzAzMTIgMTk2LjA3MDMxMiBMIDEyOTAuMTIxMDk0IDE3OC44OTg0MzggTCAxMjg0LjM5ODQzOCAxNTYuMDAzOTA2IEwgMTI4NC4zOTg0MzggMTMzLjEwOTM3NSBaIE0gMTI5Mi4wMzEyNSAxMTIuMTIxMDk0ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=" alt="MINDSPARK logo mark">
    </div>
    <div class="hdr-name">MINDSPARK<span>Assessment Platform</span></div>
  </div>
  <div class="hdr-badge">Design System v3.0 &mdash; Final</div>
  <h1>MINDSPARK<br><em>Design System</em></h1>
  <p class="hdr-sub">Production-ready visual specification for the MINDSPARK platform &mdash; Admin and Student panels, unified Forest Green light system, with official MINDSPARK brand integration, Lucide React icons, Lottie loader, skeleton screens, and all critical assessment engine specs.</p>
  <div class="hdr-meta">
    <div><label>Brand</label><span>MINDSPARK</span></div>
    <div><label>Both Panels</label><span>Forest Green &middot; Light Mode</span></div>
    <div><label>Icon Library</label><span>Lucide React</span></div>
    <div><label>Lottie Loader</label><span>Abacus bead animation</span></div>
    <div><label>Standard</label><span>WCAG 2.2 AAA</span></div>
  </div>
</div>

<nav class="toc">
  <a href="#brand">00 Brand</a>
  <a href="#phil">01 Philosophy</a><a href="#col">02 Colours</a><a href="#crimson">03 Crimson Rule</a>
  <a href="#typ">04 Typography</a><a href="#icons">05 Icon System</a>
  <a href="#loader">06 Lottie Loader</a><a href="#skeleton">07 Skeleton Screens</a>
  <a href="#spc">08 Spacing</a><a href="#elv">09 Elevation</a><a href="#rad">10 Radius</a>
  <a href="#kpi">11 KPI Cards</a><a href="#btn">12 Buttons</a><a href="#side">13 Sidebars</a>
  <a href="#mon">14 Live Monitor</a><a href="#pipe">15 Pipeline</a>
  <a href="#scards">16 Student Cards</a><a href="#flash">17 Flash Anzan</a>
  <a href="#exam">18 EXAM Layout</a><a href="#mcq">19 MCQ Grid</a>
  <a href="#tmr">20 Timer</a><a href="#lob">21 Lobby</a><a href="#res">22 Result</a>
  <a href="#lay">23 Layout</a><a href="#mot">24 Motion</a>
  <a href="#acc">25 WCAG</a><a href="#sts">26 States</a>
  <a href="#dd">27 Do &amp; Don&rsquo;t</a><a href="#tok">28 CSS Tokens</a>
</nav>

<div class="wrap">

<!-- 00 BRAND -->
<div id="brand" style="margin-bottom:60px">
  <div class="ey">00 &mdash; Brand Identity</div>
  <h2 class="st">MINDSPARK Brand System</h2>
  <p class="sd">The official MINDSPARK brand uses a distinct palette and logo mark. The brand palette drives platform-specific accent points (loading screens, welcome states, onboarding) while the Forest Green UI system drives all interactive components, assessments, and data surfaces. Both systems coexist without conflict.</p>

  <div class="brand-hero">
    <div class="brand-hero-logo">
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwMCIgem9vbUFuZFBhbj0ibWFnbmlmeSIgdmlld0JveD0iMCAwIDE1MDAgMTQ5OS45OTk5MzMiIGhlaWdodD0iMjAwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48cmVjdCB4PSItMTUwIiB3aWR0aD0iMTgwMCIgZmlsbD0iI2ZlZmVmZSIgeT0iLTE0OS45OTk5OTMiIGhlaWdodD0iMTc5OS45OTk5MiIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSAxMTAxLjIzNDM3NSAzODguNzczNDM4IEwgMTEzMS43NjE3MTkgMzg4Ljc3MzQzOCBMIDExODkgMzkyLjU4OTg0NCBMIDEyMDYuMTcxODc1IDM5Ni40MDYyNSBMIDEyMTcuNjIxMDk0IDQwNC4wMzkwNjIgTCAxMjIzLjM0Mzc1IDQxNy4zOTQ1MzEgTCAxMjI5LjA2NjQwNiA0ODQuMTcxODc1IEwgMTI0Mi40MjU3ODEgNzQzLjY1NjI1IEwgMTI0OC4xNDg0MzggODM1LjIzODI4MSBMIDEyNjEuNTAzOTA2IDk3Mi42MDkzNzUgTCAxMjYzLjQxMDE1NiAxMDAxLjIzMDQ2OSBMIDEyNjMuNDEwMTU2IDEwMjkuODQ3NjU2IEwgMTI1MC4wNTQ2ODggMTA1MC44MzU5MzggTCAxMjMwLjk3NjU2MiAxMDY2LjEwMTU2MiBMIDEyMDkuOTg4MjgxIDEwNzMuNzMwNDY5IEwgMTE5Ni42MzI4MTIgMTA3NS42NDA2MjUgTCAxMTEwLjc3MzQzOCAxMDc1LjY0MDYyNSBMIDExMDMuMTQ0NTMxIDk1MS42MjEwOTQgTCAxMDk3LjQxNzk2OSA4NTguMTMyODEyIEwgMTA5My42MDE1NjIgNzU4LjkxNzk2OSBMIDEwOTEuNjk1MzEyIDY3Ni44NzUgTCAxMDg1Ljk3MjY1NiA2OTIuMTQwNjI1IEwgMTA1NS40NDUzMTIgNzk3LjA3ODEyNSBMIDEwMTMuNDY4NzUgOTI2LjgyMDMxMiBMIDk4Ni43NTc4MTIgMTAwOC44NjMyODEgTCA5NjkuNTg1OTM4IDEwNTguNDY4NzUgTCA5NTguMTM2NzE5IDEwNzEuODI0MjE5IEwgOTQwLjk2NDg0NCAxMDc5LjQ1NzAzMSBMIDkyMy43OTI5NjkgMTA4My4yNzM0MzggTCA4OTUuMTc1NzgxIDEwODMuMjczNDM4IEwgODY0LjY0ODQzOCAxMDc3LjU0Njg3NSBMIDg0NS41NzAzMTIgMTA2OC4wMDc4MTIgTCA4MzcuOTM3NSAxMDU4LjQ2ODc1IEwgODI2LjQ4ODI4MSAxMDI3Ljk0MTQwNiBMIDc5NS45NjA5MzggOTMyLjU0Mjk2OSBMIDc3My4wNjY0MDYgODU2LjIyNjU2MiBMIDc2NS40MzM1OTQgODI5LjUxMTcxOSBMIDc2Ny4zNDM3NSA4MTQuMjUgTCA3OTAuMjM4MjgxIDczNy45Mjk2ODggTCA4MjYuNDg4MjgxIDYwOC4xOTE0MDYgTCA4MzYuMDI3MzQ0IDU3My44NDc2NTYgTCA4MzkuODQzNzUgNTc5LjU3MDMxMiBMIDg2NC42NDg0MzggNjczLjA2MjUgTCA5MDAuODk4NDM4IDgwMi44MDA3ODEgTCA5MDQuNzE0ODQ0IDgxNi4xNTYyNSBMIDkwNC43MTQ4NDQgODIzLjc4OTA2MiBMIDkwOC41MzEyNSA4MjMuNzg5MDYyIEwgOTEyLjM0NzY1NiA4MDYuNjE3MTg4IEwgOTUwLjUwNzgxMiA2OTcuODYzMjgxIEwgOTg4LjY2NDA2MiA1OTIuOTI1NzgxIEwgMTAxMy40Njg3NSA1MjIuMzMyMDMxIEwgMTA0MC4xNzk2ODggNDQ3LjkyMTg3NSBMIDEwNTUuNDQ1MzEyIDQxNy4zOTQ1MzEgTCAxMDY4LjgwMDc4MSA0MDIuMTI4OTA2IEwgMTA4MC4yNDYwOTQgMzk0LjUgWiBNIDExMDEuMjM0Mzc1IDM4OC43NzM0MzggIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNTdhMzkiIGQ9Ik0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSBMIDEzODEuNzAzMTI1IDgzMy4zMjgxMjUgTCAxMzgzLjYxMzI4MSA4NTIuNDEwMTU2IEwgMTM4My42MTMyODEgOTAzLjkyNTc4MSBMIDEzNzkuNzk2ODc1IDk0My45OTIxODggTCAxMzY4LjM0NzY1NiA5OTkuMzIwMzEyIEwgMTM1Ni45MDIzNDQgMTAzNy40ODA0NjkgTCAxMzQzLjU0Njg3NSAxMDczLjczMDQ2OSBMIDEzMjguMjgxMjUgMTEwNi4xNjc5NjkgTCAxMzA3LjI5Mjk2OSAxMTQyLjQxNzk2OSBMIDEyODguMjE0ODQ0IDExNjkuMTI4OTA2IEwgMTI2Ny4yMjY1NjIgMTE5My45MzM1OTQgTCAxMjUwLjA1NDY4OCAxMjEzLjAxMTcxOSBMIDEyMzAuOTc2NTYyIDEyMzIuMDkzNzUgTCAxMjA5Ljk4ODI4MSAxMjQ5LjI2NTYyNSBMIDExODEuMzcxMDk0IDEyNzAuMjUzOTA2IEwgMTE1Ni41NjY0MDYgMTI4NS41MTU2MjUgTCAxMTEyLjY4MzU5NCAxMzA4LjQxMDE1NiBMIDEwODAuMjQ2MDk0IDEzMjEuNzY1NjI1IEwgMTAzOC4yNzM0MzggMTMzNS4xMjEwOTQgTCA5OTAuNTc0MjE5IDEzNDYuNTcwMzEyIEwgOTMxLjQyNTc4MSAxMzU0LjIwMzEyNSBMIDgzNC4xMjEwOTQgMTM1NC4yMDMxMjUgTCA3ODguMzI4MTI1IDEzNDguNDc2NTYyIEwgNzM0LjkwNjI1IDEzMzcuMDMxMjUgTCA2OTYuNzQ2MDk0IDEzMjUuNTgyMDMxIEwgNjYwLjQ5NjA5NCAxMzEyLjIyNjU2MiBMIDYyMC40Mjk2ODggMTI5NS4wNTQ2ODggTCA1NzguNDUzMTI1IDEyNzIuMTYwMTU2IEwgNTQ0LjEwOTM3NSAxMjQ5LjI2NTYyNSBMIDUyMy4xMjUgMTIzNCBMIDUwNC4wNDI5NjkgMTIxOC43MzgyODEgTCA0ODEuMTQ4NDM4IDExOTcuNzUgTCA0NjUuODgyODEyIDExODQuMzk0NTMxIEwgNDQ0Ljg5ODQzOCAxMTYzLjQwNjI1IEwgNDMxLjU0Mjk2OSAxMTQ4LjE0NDUzMSBMIDQwNi43MzgyODEgMTExOS41MjM0MzggTCAzNzguMTE3MTg4IDEwODEuMzYzMjgxIEwgMzUzLjMxNjQwNiAxMDQzLjIwMzEyNSBMIDMzNC4yMzQzNzUgMTAwOC44NjMyODEgTCAzMTguOTcyNjU2IDk4MC4yNDIxODggTCAzMTMuMjQ2MDk0IDk2My4wNzAzMTIgTCAzMjIuNzg5MDYyIDk3Mi42MDkzNzUgTCAzNDcuNTg5ODQ0IDk5OS4zMjAzMTIgTCAzNjAuOTQ1MzEyIDEwMTQuNTg1OTM4IEwgNDA0LjgyODEyNSAxMDU4LjQ2ODc1IEwgNDIwLjA5Mzc1IDEwNzEuODI0MjE5IEwgNDQ0Ljg5ODQzOCAxMDkyLjgxMjUgTCA0NjkuNjk5MjE5IDExMTEuODkwNjI1IEwgNTAwLjIyNjU2MiAxMTMyLjg3ODkwNiBMIDUyOC44NDc2NTYgMTE1MC4wNTA3ODEgTCA1NjguOTE0MDYyIDExNzEuMDM5MDYyIEwgNjI4LjA2MjUgMTE5NS44Mzk4NDQgTCA2NzUuNzYxNzE5IDEyMTEuMTA1NDY5IEwgNzIxLjU1MDc4MSAxMjIyLjU1NDY4OCBMIDc3OC43ODkwNjIgMTIzMi4wOTM3NSBMIDgwMS42ODM1OTQgMTIzNCBMIDg5MS4zNTkzNzUgMTIzNCBMIDkyNS43MDMxMjUgMTIzMC4xODM1OTQgTCA5NzkuMTI1IDEyMjAuNjQ0NTMxIEwgMTAyNi44MjQyMTkgMTIwNy4yODkwNjIgTCAxMDYzLjA3NDIxOSAxMTkzLjkzMzU5NCBMIDExMDMuMTQ0NTMxIDExNzYuNzYxNzE5IEwgMTE0NS4xMTcxODggMTE1My44NjcxODggTCAxMTc1LjY0NDUzMSAxMTM0Ljc4NTE1NiBMIDEyMDkuOTg4MjgxIDExMDguMDc0MjE5IEwgMTIzNC43OTI5NjkgMTA4NS4xNzk2ODggTCAxMjY1LjMyMDMxMiAxMDU0LjY1MjM0NCBMIDEyOTAuMTIxMDk0IDEwMjIuMjE4NzUgTCAxMzA5LjIwMzEyNSA5OTUuNTA3ODEyIEwgMTMzMC4xOTE0MDYgOTU5LjI1MzkwNiBMIDEzNTEuMTc1NzgxIDkxNS4zNzEwOTQgTCAxMzY4LjM0NzY1NiA4NjcuNjcxODc1IEwgMTM3NS45ODA0NjkgODM5LjA1NDY4OCBaIE0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMSIgZD0iTSA3NjUuNDMzNTk0IDM5MC42ODM1OTQgTCA4NTUuMTA5Mzc1IDM5MC42ODM1OTQgTCA4NTEuMjkyOTY5IDQxMy41NzgxMjUgTCA4MDUuNSA1ODMuMzg2NzE5IEwgNzY1LjQzMzU5NCA3MjguMzkwNjI1IEwgNzMzIDg0Mi44NzEwOTQgTCA3MDAuNTYyNSA5NTcuMzQ3NjU2IEwgNjczLjg1MTU2MiAxMDQ4LjkyOTY4OCBMIDY2Ni4yMTg3NSAxMDY0LjE5MTQwNiBMIDY1NC43NzM0MzggMTA3MS44MjQyMTkgTCA2MzkuNTA3ODEyIDEwNzUuNjQwNjI1IEwgNDk2LjQxMDE1NiAxMDc1LjY0MDYyNSBMIDUwMC4yMjY1NjIgMTA1OC40Njg3NSBMIDU0MC4yOTY4NzUgOTMyLjU0Mjk2OSBMIDU3OC40NTMxMjUgODA2LjYxNzE4OCBMIDYwNy4wNzQyMTkgNzExLjIxODc1IEwgNjM1LjY5MTQwNiA2MTIuMDA3ODEyIEwgNjY0LjMxMjUgNTA3LjA3MDMxMiBMIDY4My4zOTA2MjUgNDM4LjM4MjgxMiBMIDY5Mi45MzM1OTQgNDEzLjU3ODEyNSBMIDcwMi40NzI2NTYgNDAyLjEyODkwNiBMIDcxNy43MzQzNzUgMzk0LjUgTCA3MzEuMDg5ODQ0IDM5Mi41ODk4NDQgWiBNIDc2NS40MzM1OTQgMzkwLjY4MzU5NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSA1MDQuMDQyOTY5IDM4OC43NzM0MzggTCA1NTMuNjUyMzQ0IDM4OC43NzM0MzggTCA1NzIuNzMwNDY5IDM5Mi41ODk4NDQgTCA1OTUuNjI1IDQwNC4wMzkwNjIgTCA2MDcuMDc0MjE5IDQxMy41NzgxMjUgTCA2MjIuMzM1OTM4IDQzNC41NjY0MDYgTCA2MzMuNzg1MTU2IDQ1Ny40NjA5MzggTCA2MzcuNjAxNTYyIDQ2OC45MTAxNTYgTCA2MzUuNjkxNDA2IDQ4NC4xNzE4NzUgTCA2MDguOTgwNDY5IDU4Ny4yMDMxMjUgTCA1ODQuMTc5Njg4IDY4MC42OTE0MDYgTCA1NzguNDUzMTI1IDY5NS45NTcwMzEgTCA1NzQuNjM2NzE5IDY5MC4yMzQzNzUgTCA1NTcuNDY0ODQ0IDY0MC42MjUgTCA1NDkuODM1OTM4IDc0OS4zNzg5MDYgTCA1NDYuMDE5NTMxIDc3OS45MDYyNSBMIDUxOS4zMDg1OTQgODc3LjIxMDkzOCBMIDQ3Ny4zMzIwMzEgMTAxOC40MDIzNDQgTCA0NjIuMDcwMzEyIDEwNjkuOTE3OTY5IEwgNDQ2LjgwNDY4OCAxMDU4LjQ2ODc1IEwgNDI1LjgxNjQwNiAxMDQxLjI5Njg3NSBMIDQwMS4wMTU2MjUgMTAxOC40MDIzNDQgTCAzNzYuMjEwOTM4IDk5My41OTc2NTYgTCAzNzguMTE3MTg4IDk2Ni44ODY3MTkgTCAzOTcuMTk5MjE5IDgwOC41MjczNDQgTCA0MTYuMjc3MzQ0IDYzMi45OTIxODggTCA0MzcuMjY1NjI1IDQyNi45MzM1OTQgTCA0NDEuMDgyMDMxIDQwOS43NjE3MTkgTCA0NTAuNjIxMDk0IDM5OC4zMTY0MDYgTCA0NjIuMDcwMzEyIDM5Mi41ODk4NDQgWiBNIDUwNC4wNDI5NjkgMzg4Ljc3MzQzOCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMCIgZD0iTSAyOTAuMzUxNTYyIDI0OS40OTIxODggTCAyOTAuMzUxNTYyIDI1NS4yMTg3NSBMIDI3My4xNzk2ODggMjgzLjgzNTkzOCBMIDI1Ny45MTc5NjkgMzEwLjU0Njg3NSBMIDIzNi45Mjk2ODggMzU2LjMzOTg0NCBMIDIxNy44NTE1NjIgNDA5Ljc2MTcxOSBMIDIwNC40OTYwOTQgNDU3LjQ2MDkzOCBMIDE5NC45NTMxMjUgNTA3LjA3MDMxMiBMIDE5MS4xMzY3MTkgNTM3LjU5NzY1NiBMIDE4OS4yMzA0NjkgNTY4LjEyNSBMIDE4OS4yMzA0NjkgNjIzLjQ1MzEyNSBMIDE5NC45NTMxMjUgNjg0LjUwNzgxMiBMIDIwNC40OTYwOTQgNzM3LjkyOTY4OCBMIDIxNS45NDE0MDYgNzgzLjcyMjY1NiBMIDIzNS4wMjM0MzggODM5LjA1NDY4OCBMIDI1OS44MjQyMTkgODk2LjI5Mjk2OSBMIDI2OS4zNjMyODEgOTEzLjQ2NDg0NCBMIDI2OS4zNjMyODEgOTI4LjcyNjU2MiBMIDI1Ny45MTc5NjkgOTQ3LjgwODU5NCBMIDIzNi45Mjk2ODggOTcyLjYwOTM3NSBMIDIyMy41NzQyMTkgOTkzLjU5NzY1NiBMIDIxNS45NDE0MDYgMTAxNi40OTIxODggTCAyMTUuOTQxNDA2IDEwNDguOTI5Njg4IEwgMjIzLjU3NDIxOSAxMDg3LjA4OTg0NCBMIDIzNi45Mjk2ODggMTEyNS4yNDYwOTQgTCAyNTkuODI0MjE5IDExNzIuOTQ1MzEyIEwgMjgyLjcxODc1IDEyMDkuMTk5MjE5IEwgMjk0LjE2Nzk2OSAxMjI2LjM2NzE4OCBMIDI4Ni41MzUxNTYgMTIyMi41NTQ2ODggTCAyNjMuNjQwNjI1IDEyMDUuMzgyODEyIEwgMjQ0LjU2MjUgMTE4OC4yMTA5MzggTCAyMjkuMjk2ODc1IDExNzQuODU1NDY5IEwgMTk2Ljg2MzI4MSAxMTQyLjQxNzk2OSBMIDE3NS44NzUgMTExNS43MDcwMzEgTCAxNTQuODg2NzE5IDEwODcuMDg5ODQ0IEwgMTMwLjA4MjAzMSAxMDQ3LjAxOTUzMSBMIDExNC44MjAzMTIgMTAxNi40OTIxODggTCA5NS43NDIxODggOTcyLjYwOTM3NSBMIDg0LjI5Mjk2OSA5MzguMjY1NjI1IEwgNjkuMDI3MzQ0IDg4MS4wMjczNDQgTCA1OS40ODgyODEgODIxLjg4MjgxMiBMIDU1LjY3MTg3NSA3NzggTCA1NS42NzE4NzUgNzA1LjQ5NjA5NCBMIDU5LjQ4ODI4MSA2NjMuNTE5NTMxIEwgNjkuMDI3MzQ0IDYwNC4zNzUgTCA4NC4yOTI5NjkgNTQ1LjIyNjU2MiBMIDEwMS40NjQ4NDQgNDk3LjUyNzM0NCBMIDExOC42MzY3MTkgNDU5LjM3MTA5NCBMIDEzOS42MjUgNDE5LjMwMDc4MSBMIDE3MC4xNTIzNDQgMzczLjUxMTcxOSBMIDE4OS4yMzA0NjkgMzQ4LjcwNzAzMSBMIDIxMC4yMTg3NSAzMjMuOTA2MjUgTCAyMzguODM1OTM4IDI5My4zNzg5MDYgTCAyNjUuNTUwNzgxIDI2OC41NzQyMTkgWiBNIDI5MC4zNTE1NjIgMjQ5LjQ5MjE4OCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIzNDE3NiIgZD0iTSA1NS42NzE4NzUgMTA2MC4zNzUgTCA2MS4zOTg0MzggMTA2Ni4xMDE1NjIgTCA3OC41NzAzMTIgMTA5Mi44MTI1IEwgOTcuNjQ4NDM4IDExMTkuNTIzNDM4IEwgMTIyLjQ1MzEyNSAxMTUwLjA1MDc4MSBMIDE0NS4zNDc2NTYgMTE3NC44NTU0NjkgTCAxNzcuNzgxMjUgMTIwNy4yODkwNjIgTCAxOTguNzY5NTMxIDEyMjQuNDYwOTM4IEwgMjIzLjU3NDIxOSAxMjQzLjUzOTA2MiBMIDI1Ni4wMDc4MTIgMTI2NC41MjczNDQgTCAyOTAuMzUxNTYyIDEyODMuNjA5Mzc1IEwgMzIyLjc4OTA2MiAxMjk4Ljg3MTA5NCBMIDM3MC40ODgyODEgMTMxNi4wNDI5NjkgTCA0MTIuNDYwOTM4IDEzMjcuNDkyMTg4IEwgNDUwLjYyMTA5NCAxMzMzLjIxNDg0NCBMIDQ5Ni40MTAxNTYgMTMzMy4yMTQ4NDQgTCA1MjUuMDMxMjUgMTMyNS41ODIwMzEgTCA1NDIuMjAzMTI1IDEzMTQuMTM2NzE5IEwgNTQ5LjgzNTkzOCAxMjk4Ljg3MTA5NCBMIDU1OS4zNzUgMTMwMi42ODc1IEwgNTk5LjQ0MTQwNiAxMzIzLjY3NTc4MSBMIDY1Ni42Nzk2ODggMTM0OC40NzY1NjIgTCA2OTQuODM5ODQ0IDEzNjEuODM1OTM4IEwgNzM4LjcyMjY1NiAxMzc1LjE5MTQwNiBMIDc4Mi42MDU0NjkgMTM4NC43MzA0NjkgTCA4MjQuNTgyMDMxIDEzOTAuNDUzMTI1IEwgOTQyLjg3NSAxMzkwLjQ1MzEyNSBMIDkzNS4yNDIxODggMTM5Ni4xNzU3ODEgTCA4NzYuMDk3NjU2IDE0MjAuOTgwNDY5IEwgODE4Ljg1NTQ2OSAxNDQwLjA1ODU5NCBMIDc1NS44OTQ1MzEgMTQ1NS4zMjQyMTkgTCA2OTQuODM5ODQ0IDE0NjQuODYzMjgxIEwgNjUyLjg2MzI4MSAxNDY4LjY3OTY4OCBMIDU5My43MTg3NSAxNDY4LjY3OTY4OCBMIDU0Mi4yMDMxMjUgMTQ2Mi45NTcwMzEgTCA0OTAuNjg3NSAxNDUzLjQxNzk2OSBMIDQ0OC43MTQ4NDQgMTQ0MS45Njg3NSBMIDM5NS4yODkwNjIgMTQyMi44OTA2MjUgTCAzMzkuOTYwOTM4IDEzOTYuMTc1NzgxIEwgMzA3LjUyMzQzOCAxMzc3LjA5NzY1NiBMIDI3Ni45OTYwOTQgMTM1Ni4xMDkzNzUgTCAyNTQuMTAxNTYyIDEzMzguOTM3NSBMIDIzMy4xMTMyODEgMTMyMS43NjU2MjUgTCAyMTQuMDM1MTU2IDEzMDQuNTkzNzUgTCAxOTEuMTM2NzE5IDEyODMuNjA5Mzc1IEwgMTc3Ljc4MTI1IDEyNjguMzQzNzUgTCAxNTguNzAzMTI1IDEyNDcuMzU1NDY5IEwgMTMwLjA4MjAzMSAxMjA5LjE5OTIxOSBMIDEwOS4wOTc2NTYgMTE3Ni43NjE3MTkgTCA4Ni4xOTkyMTkgMTEzNi42OTUzMTIgTCA2Ny4xMjEwOTQgMTA5NC43MTg3NSBMIDU1LjY3MTg3NSAxMDY2LjEwMTU2MiBaIE0gNTUuNjcxODc1IDEwNjAuMzc1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjM2I5ZGNlIiBkPSJNIDc2My41MjczNDQgMTguNjMyODEyIEwgODUzLjE5OTIxOSAxOC42MzI4MTIgTCA5MDYuNjI1IDI0LjM1NTQ2OSBMIDk1OC4xMzY3MTkgMzMuODk0NTMxIEwgMTAxMS41NjI1IDQ5LjE2MDE1NiBMIDEwNTcuMzUxNTYyIDY2LjMyODEyNSBMIDEwNzQuNTIzNDM4IDczLjk2MDkzOCBMIDEwNjYuODkwNjI1IDc1Ljg3MTA5NCBMIDEwMTMuNDY4NzUgNjQuNDIxODc1IEwgOTgyLjk0MTQwNiA2MC42MDU0NjkgTCA5NTYuMjMwNDY5IDU4LjY5OTIxOSBMIDg3OS45MTAxNTYgNTguNjk5MjE5IEwgODM3LjkzNzUgNjIuNTE1NjI1IEwgNzkyLjE0NDUzMSA3MC4xNDQ1MzEgTCA3MzguNzIyNjU2IDgzLjUgTCA2ODEuNDg0Mzc1IDEwMi41ODIwMzEgTCA2MzcuNjAxNTYyIDEyMS42NjAxNTYgTCA1OTMuNzE4NzUgMTQ0LjU1NDY4OCBMIDU1MS43NDIxODggMTcxLjI2OTUzMSBMIDUxNS40OTIxODggMTk3Ljk4MDQ2OSBMIDQ4OC43ODEyNSAyMjAuODc1IEwgNDYzLjk3NjU2MiAyNDMuNzY5NTMxIEwgNDM1LjM1NTQ2OSAyNzQuMjk2ODc1IEwgNDIwLjA5Mzc1IDI5My4zNzg5MDYgTCAzOTcuMTk5MjE5IDMyMy45MDYyNSBMIDM3Ni4yMTA5MzggMzU2LjMzOTg0NCBMIDM0OS41IDQwNC4wMzkwNjIgTCAzMzQuMjM0Mzc1IDQzNi40NzI2NTYgTCAzMTMuMjQ2MDk0IDQ5MS44MDQ2ODggTCAyOTkuODkwNjI1IDU0My4zMjAzMTIgTCAyOTQuMTY3OTY5IDU3MS45Mzc1IEwgMjg4LjQ0NTMxMiA2MjMuNDUzMTI1IEwgMjg2LjUzNTE1NiA2NzQuOTY4NzUgTCAyODIuNzE4NzUgNjY3LjMzNTkzOCBMIDI3MS4yNzM0MzggNjIzLjQ1MzEyNSBMIDI2My42NDA2MjUgNTc3LjY2NDA2MiBMIDI1OS44MjQyMTkgNTMzLjc4MTI1IEwgMjU5LjgyNDIxOSA0ODkuODk4NDM4IEwgMjYzLjY0MDYyNSA0NDYuMDE1NjI1IEwgMjcxLjI3MzQzOCA0MDQuMDM5MDYyIEwgMjgyLjcxODc1IDM2Mi4wNjI1IEwgMjk3Ljk4NDM3NSAzMjEuOTk2MDk0IEwgMzE1LjE1NjI1IDI4NS43NDYwOTQgTCAzMzIuMzI4MTI1IDI1Ny4xMjUgTCAzNTUuMjIyNjU2IDIyNC42OTE0MDYgTCAzNzYuMjEwOTM4IDE5OS44ODY3MTkgTCAzOTMuMzgyODEyIDE4MC44MDg1OTQgTCA0MTQuMzcxMDk0IDE1OS44MjAzMTIgTCA0MzUuMzU1NDY5IDE0Mi42NDg0MzggTCA0NjIuMDcwMzEyIDEyMS42NjAxNTYgTCA0OTQuNTAzOTA2IDEwMC42NzE4NzUgTCA1MjUuMDMxMjUgODMuNSBMIDU2NS4wOTc2NTYgNjQuNDIxODc1IEwgNTk5LjQ0MTQwNiA1MS4wNjY0MDYgTCA2NDUuMjM0Mzc1IDM3LjcxMDkzOCBMIDY4Ny4yMDcwMzEgMjguMTcxODc1IEwgNzQyLjUzOTA2MiAyMC41MzkwNjIgWiBNIDc2My41MjczNDQgMTguNjMyODEyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZjI3NTNjIiBkPSJNIDEzMzAuMTkxNDA2IDI2NC43NTc4MTIgTCAxMzM3LjgyMDMxMiAyNjQuNzU3ODEyIEwgMTM0MS42MzY3MTkgMjc0LjI5Njg3NSBMIDEzNTguODA4NTk0IDI3Ni4yMDcwMzEgTCAxMzYyLjYyNSAyNzguMTEzMjgxIEwgMTM2NC41MzUxNTYgMzA2LjczNDM3NSBMIDEzNjQuNTM1MTU2IDM3My41MTE3MTkgTCAxMzU4LjgwODU5NCA0MTMuNTc4MTI1IEwgMTM1NC45OTIxODggNDIxLjIxMDkzOCBMIDEzMTEuMTA5Mzc1IDQwMi4xMjg5MDYgTCAxMjcxLjA0Mjk2OSAzNzkuMjM0Mzc1IEwgMTI0NC4zMzIwMzEgMzYwLjE1NjI1IEwgMTIzNC43OTI5NjkgMzUwLjYxNzE4OCBMIDEyMzYuNjk5MjE5IDMzOS4xNjc5NjkgTCAxMjQ2LjIzODI4MSAzMjMuOTA2MjUgTCAxMjY1LjMyMDMxMiAzMDYuNzM0Mzc1IEwgMTMxMy4wMTk1MzEgMjc2LjIwNzAzMSBaIE0gMTMzMC4xOTE0MDYgMjY0Ljc1NzgxMiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y1YmUzOCIgZD0iTSAxMjQwLjUxNTYyNSAxNDguMzcxMDk0IEwgMTI0NC4zMzIwMzEgMTQ4LjM3MTA5NCBMIDEyNTAuMDU0Njg4IDE4Mi43MTQ4NDQgTCAxMjUxLjk2NDg0NCAyMDEuNzk2ODc1IEwgMTI1MS45NjQ4NDQgMjM0LjIzMDQ2OSBMIDEyNDQuMzMyMDMxIDI4MC4wMTk1MzEgTCAxMjQwLjUxNTYyNSAyOTMuMzc4OTA2IEwgMTIyOS4wNjY0MDYgMjg5LjU2MjUgTCAxMTk0LjcyNjU2MiAyNzAuNDgwNDY5IEwgMTE1OC40NzI2NTYgMjUxLjQwMjM0NCBMIDExMjkuODU1NDY5IDIzMi4zMjQyMTkgTCAxMTIwLjMxNjQwNiAyMjQuNjkxNDA2IEwgMTEyMi4yMjI2NTYgMjE1LjE1MjM0NCBMIDExNDguOTMzNTk0IDE5Ni4wNzAzMTIgTCAxMTgxLjM3MTA5NCAxNzYuOTkyMTg4IEwgMTIyMS40Mzc1IDE1Ni4wMDM5MDYgWiBNIDEyNDAuNTE1NjI1IDE0OC4zNzEwOTQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNWEzM2MiIGQ9Ik0gMTM5NS4wNjI1IDIwOS40MjU3ODEgTCAxNDA0LjYwMTU2MiAyMTEuMzM1OTM4IEwgMTQ0Mi43NTc4MTIgMjI2LjU5NzY1NiBMIDE0NjkuNDcyNjU2IDI0My43Njk1MzEgTCAxNDc1LjE5NTMxMiAyNDcuNTg1OTM4IEwgMTQ3MS4zNzg5MDYgMjU1LjIxODc1IEwgMTQ1OC4wMjM0MzggMjY4LjU3NDIxOSBMIDE0MzMuMjE4NzUgMjg3LjY1MjM0NCBMIDE0MTQuMTQwNjI1IDI5Ny4xOTE0MDYgTCAxNDAwLjc4NTE1NiAyOTcuMTkxNDA2IEwgMTM5My4xNTIzNDQgMjg3LjY1MjM0NCBMIDEzODUuNTE5NTMxIDI3MC40ODA0NjkgTCAxMzcyLjE2NDA2MiAyNzAuNDgwNDY5IEwgMTM3NC4wNzQyMTkgMjU5LjAzNTE1NiBMIDEzODcuNDI5Njg4IDIzMC40MTQwNjIgTCAxMzkzLjE1MjM0NCAyMTEuMzM1OTM4IFogTSAxMzk1LjA2MjUgMjA5LjQyNTc4MSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y0OTc1NiIgZD0iTSAxMjkyLjAzMTI1IDExMi4xMjEwOTQgTCAxMzEzLjAxOTUzMSAxMTQuMDI3MzQ0IEwgMTM0OS4yNjk1MzEgMTI3LjM4MjgxMiBMIDEzNzAuMjU3ODEyIDEzOC44MzIwMzEgTCAxMzY4LjM0NzY1NiAxNDYuNDY0ODQ0IEwgMTM0Ny4zNjMyODEgMTcxLjI2OTUzMSBMIDEzMjYuMzc1IDE5MC4zNDc2NTYgTCAxMzExLjEwOTM3NSAxOTcuOTgwNDY5IEwgMTMwMS41NzAzMTIgMTk2LjA3MDMxMiBMIDEyOTAuMTIxMDk0IDE3OC44OTg0MzggTCAxMjg0LjM5ODQzOCAxNTYuMDAzOTA2IEwgMTI4NC4zOTg0MzggMTMzLjEwOTM3NSBaIE0gMTI5Mi4wMzEyNSAxMTIuMTIxMDk0ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=" alt="MINDSPARK logo mark">
    </div>
    <div>
      <div class="brand-hero-name">MINDSPARK</div>
      <div class="brand-hero-sub">Mental Arithmetic Assessment Platform</div>
      <div class="brand-hero-tagline">&ldquo;Where young minds spark.&rdquo;</div>
    </div>
  </div>

  <div class="brand-bar"></div>

  <div class="card" style="margin-bottom:14px">
    <p class="ctitle" style="margin-bottom:14px">MINDSPARK Brand Palette <span class="v3t">From Logo SVG</span></p>
    <div class="srow">
      <div class="sw"><div class="swb" style="background:#204074"></div><div class="swi"><span class="swn">Navy &#9733;</span><span class="swh">#204074</span></div></div>
      <div class="sw"><div class="swb" style="background:#234176"></div><div class="swi"><span class="swn">Navy-2</span><span class="swh">#234176</span></div></div>
      <div class="sw"><div class="swb" style="background:#3A9ED1"></div><div class="swi"><span class="swn">Sky Blue &#9733;</span><span class="swh">#3A9ED1</span></div></div>
      <div class="sw"><div class="swb" style="background:#F57A39"></div><div class="swi"><span class="swn">Orange &#9733;</span><span class="swh">#F57A39</span></div></div>
      <div class="sw"><div class="swb" style="background:#F5BE38"></div><div class="swi"><span class="swn">Yellow &#9733;</span><span class="swh">#F5BE38</span></div></div>
      <div class="sw"><div class="swb" style="background:#F2753C"></div><div class="swi"><span class="swn">Orange-2</span><span class="swh">#F2753C</span></div></div>
      <div class="sw"><div class="swb" style="background:#F5A33C"></div><div class="swi"><span class="swn">Amber</span><span class="swh">#F5A33C</span></div></div>
      <div class="sw"><div class="swb" style="background:#F49756"></div><div class="swi"><span class="swn">Orange-lt</span><span class="swh">#F49756</span></div></div>
    </div>
    <p class="ctitle" style="margin-bottom:12px;margin-top:4px">Logo Usage Rules</p>
    <table class="tbl">
      <thead><tr><th>Context</th><th>Logo Treatment</th><th>Minimum Size</th><th>Background</th></tr></thead>
      <tbody>
        <tr><td>App sidebar (admin)</td><td>Logo mark (1.svg) at 32&times;32px in white card container</td><td>32&times;32px</td><td>#FFFFFF card or transparent</td></tr>
        <tr><td>App sidebar (student)</td><td>Logo mark (1.svg) at 32&times;32px in white card container</td><td>32&times;32px</td><td>#FFFFFF card or transparent</td></tr>
        <tr><td>App loading screen</td><td>Logo mark centered at 80px, navy (#204074) background</td><td>80&times;80px</td><td>#204074 or #F8FAFC</td></tr>
        <tr><td>Login page header</td><td>Full logo (2.svg wordmark) centered</td><td>180px width</td><td>#F8FAFC or #204074</td></tr>
        <tr><td>Student ID card / profile</td><td>Logo mark + MINDSPARK wordmark</td><td>40&times;40px mark</td><td>Navy or white card</td></tr>
        <tr><td>Email notifications</td><td>Full logo mark above email content</td><td>48&times;48px</td><td>White</td></tr>
      </tbody>
    </table>
  </div>

  <div class="card" style="margin-bottom:14px">
    <p class="ctitle" style="margin-bottom:12px">Brand vs UI Colour Separation</p>
    <table class="tbl">
      <thead><tr><th>Colour</th><th>Is it a brand colour?</th><th>Is it a UI colour?</th><th>Used where</th></tr></thead>
      <tbody>
        <tr><td><span style="background:#204074;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">#204074 Navy</span></td><td>&#10003; Yes &mdash; primary brand</td><td>Footer background only</td><td>Logo, login page, loading screens, footer, Student ID card</td></tr>
        <tr><td><span style="background:#3A9ED1;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">#3A9ED1 Blue</span></td><td>&#10003; Yes &mdash; brand accent</td><td>No &mdash; not in UI system</td><td>Logo mark only. Not used in buttons, states, or components.</td></tr>
        <tr><td><span style="background:#F57A39;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">#F57A39 Orange</span></td><td>&#10003; Yes &mdash; brand energy</td><td>No &mdash; not in UI system</td><td>Logo mark only. Avoid in UI to prevent confusion with warning states.</td></tr>
        <tr><td><span style="background:#F5BE38;color:#000;padding:2px 8px;border-radius:4px;font-size:11px">#F5BE38 Yellow</span></td><td>&#10003; Yes &mdash; brand spark</td><td>Amber variant only (#F59E0B)</td><td>Logo mark. Timer urgent state uses a different amber to maintain WCAG AAA.</td></tr>
        <tr><td><span style="background:#1A3829;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">#1A3829 Green-800</span></td><td>No &mdash; UI system only</td><td>&#10003; Yes &mdash; primary UI</td><td>All buttons, nav active states, KPI hero card, LIVE card border, result score</td></tr>
      </tbody>
    </table>
    <div class="ms-box" style="margin-top:12px"><strong>Why the UI uses Green-800, not MINDSPARK Navy</strong> The Forest Green UI system (#1A3829) was chosen from the Donezo reference design for its readability, WCAG contrast performance, and calm educational feel. The MINDSPARK Navy (#204074) is used for brand anchor points (login, loading, footer). Using both in the interactive UI would create colour conflict and reduce contrast reliability. The distinction is intentional and consistent.</div>
  </div>

  <!-- Sidebar with real logo -->
  <div class="card">
    <p class="ctitle" style="margin-bottom:14px">MINDSPARK Sidebar (with real logo mark)</p>
    <div class="demo" style="align-items:flex-start;gap:20px">
      <div class="aside">
        <div class="aside-logo">
          <div class="aside-mark"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwMCIgem9vbUFuZFBhbj0ibWFnbmlmeSIgdmlld0JveD0iMCAwIDE1MDAgMTQ5OS45OTk5MzMiIGhlaWdodD0iMjAwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48cmVjdCB4PSItMTUwIiB3aWR0aD0iMTgwMCIgZmlsbD0iI2ZlZmVmZSIgeT0iLTE0OS45OTk5OTMiIGhlaWdodD0iMTc5OS45OTk5MiIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSAxMTAxLjIzNDM3NSAzODguNzczNDM4IEwgMTEzMS43NjE3MTkgMzg4Ljc3MzQzOCBMIDExODkgMzkyLjU4OTg0NCBMIDEyMDYuMTcxODc1IDM5Ni40MDYyNSBMIDEyMTcuNjIxMDk0IDQwNC4wMzkwNjIgTCAxMjIzLjM0Mzc1IDQxNy4zOTQ1MzEgTCAxMjI5LjA2NjQwNiA0ODQuMTcxODc1IEwgMTI0Mi40MjU3ODEgNzQzLjY1NjI1IEwgMTI0OC4xNDg0MzggODM1LjIzODI4MSBMIDEyNjEuNTAzOTA2IDk3Mi42MDkzNzUgTCAxMjYzLjQxMDE1NiAxMDAxLjIzMDQ2OSBMIDEyNjMuNDEwMTU2IDEwMjkuODQ3NjU2IEwgMTI1MC4wNTQ2ODggMTA1MC44MzU5MzggTCAxMjMwLjk3NjU2MiAxMDY2LjEwMTU2MiBMIDEyMDkuOTg4MjgxIDEwNzMuNzMwNDY5IEwgMTE5Ni42MzI4MTIgMTA3NS42NDA2MjUgTCAxMTEwLjc3MzQzOCAxMDc1LjY0MDYyNSBMIDExMDMuMTQ0NTMxIDk1MS42MjEwOTQgTCAxMDk3LjQxNzk2OSA4NTguMTMyODEyIEwgMTA5My42MDE1NjIgNzU4LjkxNzk2OSBMIDEwOTEuNjk1MzEyIDY3Ni44NzUgTCAxMDg1Ljk3MjY1NiA2OTIuMTQwNjI1IEwgMTA1NS40NDUzMTIgNzk3LjA3ODEyNSBMIDEwMTMuNDY4NzUgOTI2LjgyMDMxMiBMIDk4Ni43NTc4MTIgMTAwOC44NjMyODEgTCA5NjkuNTg1OTM4IDEwNTguNDY4NzUgTCA5NTguMTM2NzE5IDEwNzEuODI0MjE5IEwgOTQwLjk2NDg0NCAxMDc5LjQ1NzAzMSBMIDkyMy43OTI5NjkgMTA4My4yNzM0MzggTCA4OTUuMTc1NzgxIDEwODMuMjczNDM4IEwgODY0LjY0ODQzOCAxMDc3LjU0Njg3NSBMIDg0NS41NzAzMTIgMTA2OC4wMDc4MTIgTCA4MzcuOTM3NSAxMDU4LjQ2ODc1IEwgODI2LjQ4ODI4MSAxMDI3Ljk0MTQwNiBMIDc5NS45NjA5MzggOTMyLjU0Mjk2OSBMIDc3My4wNjY0MDYgODU2LjIyNjU2MiBMIDc2NS40MzM1OTQgODI5LjUxMTcxOSBMIDc2Ny4zNDM3NSA4MTQuMjUgTCA3OTAuMjM4MjgxIDczNy45Mjk2ODggTCA4MjYuNDg4MjgxIDYwOC4xOTE0MDYgTCA4MzYuMDI3MzQ0IDU3My44NDc2NTYgTCA4MzkuODQzNzUgNTc5LjU3MDMxMiBMIDg2NC42NDg0MzggNjczLjA2MjUgTCA5MDAuODk4NDM4IDgwMi44MDA3ODEgTCA5MDQuNzE0ODQ0IDgxNi4xNTYyNSBMIDkwNC43MTQ4NDQgODIzLjc4OTA2MiBMIDkwOC41MzEyNSA4MjMuNzg5MDYyIEwgOTEyLjM0NzY1NiA4MDYuNjE3MTg4IEwgOTUwLjUwNzgxMiA2OTcuODYzMjgxIEwgOTg4LjY2NDA2MiA1OTIuOTI1NzgxIEwgMTAxMy40Njg3NSA1MjIuMzMyMDMxIEwgMTA0MC4xNzk2ODggNDQ3LjkyMTg3NSBMIDEwNTUuNDQ1MzEyIDQxNy4zOTQ1MzEgTCAxMDY4LjgwMDc4MSA0MDIuMTI4OTA2IEwgMTA4MC4yNDYwOTQgMzk0LjUgWiBNIDExMDEuMjM0Mzc1IDM4OC43NzM0MzggIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNTdhMzkiIGQ9Ik0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSBMIDEzODEuNzAzMTI1IDgzMy4zMjgxMjUgTCAxMzgzLjYxMzI4MSA4NTIuNDEwMTU2IEwgMTM4My42MTMyODEgOTAzLjkyNTc4MSBMIDEzNzkuNzk2ODc1IDk0My45OTIxODggTCAxMzY4LjM0NzY1NiA5OTkuMzIwMzEyIEwgMTM1Ni45MDIzNDQgMTAzNy40ODA0NjkgTCAxMzQzLjU0Njg3NSAxMDczLjczMDQ2OSBMIDEzMjguMjgxMjUgMTEwNi4xNjc5NjkgTCAxMzA3LjI5Mjk2OSAxMTQyLjQxNzk2OSBMIDEyODguMjE0ODQ0IDExNjkuMTI4OTA2IEwgMTI2Ny4yMjY1NjIgMTE5My45MzM1OTQgTCAxMjUwLjA1NDY4OCAxMjEzLjAxMTcxOSBMIDEyMzAuOTc2NTYyIDEyMzIuMDkzNzUgTCAxMjA5Ljk4ODI4MSAxMjQ5LjI2NTYyNSBMIDExODEuMzcxMDk0IDEyNzAuMjUzOTA2IEwgMTE1Ni41NjY0MDYgMTI4NS41MTU2MjUgTCAxMTEyLjY4MzU5NCAxMzA4LjQxMDE1NiBMIDEwODAuMjQ2MDk0IDEzMjEuNzY1NjI1IEwgMTAzOC4yNzM0MzggMTMzNS4xMjEwOTQgTCA5OTAuNTc0MjE5IDEzNDYuNTcwMzEyIEwgOTMxLjQyNTc4MSAxMzU0LjIwMzEyNSBMIDgzNC4xMjEwOTQgMTM1NC4yMDMxMjUgTCA3ODguMzI4MTI1IDEzNDguNDc2NTYyIEwgNzM0LjkwNjI1IDEzMzcuMDMxMjUgTCA2OTYuNzQ2MDk0IDEzMjUuNTgyMDMxIEwgNjYwLjQ5NjA5NCAxMzEyLjIyNjU2MiBMIDYyMC40Mjk2ODggMTI5NS4wNTQ2ODggTCA1NzguNDUzMTI1IDEyNzIuMTYwMTU2IEwgNTQ0LjEwOTM3NSAxMjQ5LjI2NTYyNSBMIDUyMy4xMjUgMTIzNCBMIDUwNC4wNDI5NjkgMTIxOC43MzgyODEgTCA0ODEuMTQ4NDM4IDExOTcuNzUgTCA0NjUuODgyODEyIDExODQuMzk0NTMxIEwgNDQ0Ljg5ODQzOCAxMTYzLjQwNjI1IEwgNDMxLjU0Mjk2OSAxMTQ4LjE0NDUzMSBMIDQwNi43MzgyODEgMTExOS41MjM0MzggTCAzNzguMTE3MTg4IDEwODEuMzYzMjgxIEwgMzUzLjMxNjQwNiAxMDQzLjIwMzEyNSBMIDMzNC4yMzQzNzUgMTAwOC44NjMyODEgTCAzMTguOTcyNjU2IDk4MC4yNDIxODggTCAzMTMuMjQ2MDk0IDk2My4wNzAzMTIgTCAzMjIuNzg5MDYyIDk3Mi42MDkzNzUgTCAzNDcuNTg5ODQ0IDk5OS4zMjAzMTIgTCAzNjAuOTQ1MzEyIDEwMTQuNTg1OTM4IEwgNDA0LjgyODEyNSAxMDU4LjQ2ODc1IEwgNDIwLjA5Mzc1IDEwNzEuODI0MjE5IEwgNDQ0Ljg5ODQzOCAxMDkyLjgxMjUgTCA0NjkuNjk5MjE5IDExMTEuODkwNjI1IEwgNTAwLjIyNjU2MiAxMTMyLjg3ODkwNiBMIDUyOC44NDc2NTYgMTE1MC4wNTA3ODEgTCA1NjguOTE0MDYyIDExNzEuMDM5MDYyIEwgNjI4LjA2MjUgMTE5NS44Mzk4NDQgTCA2NzUuNzYxNzE5IDEyMTEuMTA1NDY5IEwgNzIxLjU1MDc4MSAxMjIyLjU1NDY4OCBMIDc3OC43ODkwNjIgMTIzMi4wOTM3NSBMIDgwMS42ODM1OTQgMTIzNCBMIDg5MS4zNTkzNzUgMTIzNCBMIDkyNS43MDMxMjUgMTIzMC4xODM1OTQgTCA5NzkuMTI1IDEyMjAuNjQ0NTMxIEwgMTAyNi44MjQyMTkgMTIwNy4yODkwNjIgTCAxMDYzLjA3NDIxOSAxMTkzLjkzMzU5NCBMIDExMDMuMTQ0NTMxIDExNzYuNzYxNzE5IEwgMTE0NS4xMTcxODggMTE1My44NjcxODggTCAxMTc1LjY0NDUzMSAxMTM0Ljc4NTE1NiBMIDEyMDkuOTg4MjgxIDExMDguMDc0MjE5IEwgMTIzNC43OTI5NjkgMTA4NS4xNzk2ODggTCAxMjY1LjMyMDMxMiAxMDU0LjY1MjM0NCBMIDEyOTAuMTIxMDk0IDEwMjIuMjE4NzUgTCAxMzA5LjIwMzEyNSA5OTUuNTA3ODEyIEwgMTMzMC4xOTE0MDYgOTU5LjI1MzkwNiBMIDEzNTEuMTc1NzgxIDkxNS4zNzEwOTQgTCAxMzY4LjM0NzY1NiA4NjcuNjcxODc1IEwgMTM3NS45ODA0NjkgODM5LjA1NDY4OCBaIE0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMSIgZD0iTSA3NjUuNDMzNTk0IDM5MC42ODM1OTQgTCA4NTUuMTA5Mzc1IDM5MC42ODM1OTQgTCA4NTEuMjkyOTY5IDQxMy41NzgxMjUgTCA4MDUuNSA1ODMuMzg2NzE5IEwgNzY1LjQzMzU5NCA3MjguMzkwNjI1IEwgNzMzIDg0Mi44NzEwOTQgTCA3MDAuNTYyNSA5NTcuMzQ3NjU2IEwgNjczLjg1MTU2MiAxMDQ4LjkyOTY4OCBMIDY2Ni4yMTg3NSAxMDY0LjE5MTQwNiBMIDY1NC43NzM0MzggMTA3MS44MjQyMTkgTCA2MzkuNTA3ODEyIDEwNzUuNjQwNjI1IEwgNDk2LjQxMDE1NiAxMDc1LjY0MDYyNSBMIDUwMC4yMjY1NjIgMTA1OC40Njg3NSBMIDU0MC4yOTY4NzUgOTMyLjU0Mjk2OSBMIDU3OC40NTMxMjUgODA2LjYxNzE4OCBMIDYwNy4wNzQyMTkgNzExLjIxODc1IEwgNjM1LjY5MTQwNiA2MTIuMDA3ODEyIEwgNjY0LjMxMjUgNTA3LjA3MDMxMiBMIDY4My4zOTA2MjUgNDM4LjM4MjgxMiBMIDY5Mi45MzM1OTQgNDEzLjU3ODEyNSBMIDcwMi40NzI2NTYgNDAyLjEyODkwNiBMIDcxNy43MzQzNzUgMzk0LjUgTCA3MzEuMDg5ODQ0IDM5Mi41ODk4NDQgWiBNIDc2NS40MzM1OTQgMzkwLjY4MzU5NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSA1MDQuMDQyOTY5IDM4OC43NzM0MzggTCA1NTMuNjUyMzQ0IDM4OC43NzM0MzggTCA1NzIuNzMwNDY5IDM5Mi41ODk4NDQgTCA1OTUuNjI1IDQwNC4wMzkwNjIgTCA2MDcuMDc0MjE5IDQxMy41NzgxMjUgTCA2MjIuMzM1OTM4IDQzNC41NjY0MDYgTCA2MzMuNzg1MTU2IDQ1Ny40NjA5MzggTCA2MzcuNjAxNTYyIDQ2OC45MTAxNTYgTCA2MzUuNjkxNDA2IDQ4NC4xNzE4NzUgTCA2MDguOTgwNDY5IDU4Ny4yMDMxMjUgTCA1ODQuMTc5Njg4IDY4MC42OTE0MDYgTCA1NzguNDUzMTI1IDY5NS45NTcwMzEgTCA1NzQuNjM2NzE5IDY5MC4yMzQzNzUgTCA1NTcuNDY0ODQ0IDY0MC42MjUgTCA1NDkuODM1OTM4IDc0OS4zNzg5MDYgTCA1NDYuMDE5NTMxIDc3OS45MDYyNSBMIDUxOS4zMDg1OTQgODc3LjIxMDkzOCBMIDQ3Ny4zMzIwMzEgMTAxOC40MDIzNDQgTCA0NjIuMDcwMzEyIDEwNjkuOTE3OTY5IEwgNDQ2LjgwNDY4OCAxMDU4LjQ2ODc1IEwgNDI1LjgxNjQwNiAxMDQxLjI5Njg3NSBMIDQwMS4wMTU2MjUgMTAxOC40MDIzNDQgTCAzNzYuMjEwOTM4IDk5My41OTc2NTYgTCAzNzguMTE3MTg4IDk2Ni44ODY3MTkgTCAzOTcuMTk5MjE5IDgwOC41MjczNDQgTCA0MTYuMjc3MzQ0IDYzMi45OTIxODggTCA0MzcuMjY1NjI1IDQyNi45MzM1OTQgTCA0NDEuMDgyMDMxIDQwOS43NjE3MTkgTCA0NTAuNjIxMDk0IDM5OC4zMTY0MDYgTCA0NjIuMDcwMzEyIDM5Mi41ODk4NDQgWiBNIDUwNC4wNDI5NjkgMzg4Ljc3MzQzOCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMCIgZD0iTSAyOTAuMzUxNTYyIDI0OS40OTIxODggTCAyOTAuMzUxNTYyIDI1NS4yMTg3NSBMIDI3My4xNzk2ODggMjgzLjgzNTkzOCBMIDI1Ny45MTc5NjkgMzEwLjU0Njg3NSBMIDIzNi45Mjk2ODggMzU2LjMzOTg0NCBMIDIxNy44NTE1NjIgNDA5Ljc2MTcxOSBMIDIwNC40OTYwOTQgNDU3LjQ2MDkzOCBMIDE5NC45NTMxMjUgNTA3LjA3MDMxMiBMIDE5MS4xMzY3MTkgNTM3LjU5NzY1NiBMIDE4OS4yMzA0NjkgNTY4LjEyNSBMIDE4OS4yMzA0NjkgNjIzLjQ1MzEyNSBMIDE5NC45NTMxMjUgNjg0LjUwNzgxMiBMIDIwNC40OTYwOTQgNzM3LjkyOTY4OCBMIDIxNS45NDE0MDYgNzgzLjcyMjY1NiBMIDIzNS4wMjM0MzggODM5LjA1NDY4OCBMIDI1OS44MjQyMTkgODk2LjI5Mjk2OSBMIDI2OS4zNjMyODEgOTEzLjQ2NDg0NCBMIDI2OS4zNjMyODEgOTI4LjcyNjU2MiBMIDI1Ny45MTc5NjkgOTQ3LjgwODU5NCBMIDIzNi45Mjk2ODggOTcyLjYwOTM3NSBMIDIyMy41NzQyMTkgOTkzLjU5NzY1NiBMIDIxNS45NDE0MDYgMTAxNi40OTIxODggTCAyMTUuOTQxNDA2IDEwNDguOTI5Njg4IEwgMjIzLjU3NDIxOSAxMDg3LjA4OTg0NCBMIDIzNi45Mjk2ODggMTEyNS4yNDYwOTQgTCAyNTkuODI0MjE5IDExNzIuOTQ1MzEyIEwgMjgyLjcxODc1IDEyMDkuMTk5MjE5IEwgMjk0LjE2Nzk2OSAxMjI2LjM2NzE4OCBMIDI4Ni41MzUxNTYgMTIyMi41NTQ2ODggTCAyNjMuNjQwNjI1IDEyMDUuMzgyODEyIEwgMjQ0LjU2MjUgMTE4OC4yMTA5MzggTCAyMjkuMjk2ODc1IDExNzQuODU1NDY5IEwgMTk2Ljg2MzI4MSAxMTQyLjQxNzk2OSBMIDE3NS44NzUgMTExNS43MDcwMzEgTCAxNTQuODg2NzE5IDEwODcuMDg5ODQ0IEwgMTMwLjA4MjAzMSAxMDQ3LjAxOTUzMSBMIDExNC44MjAzMTIgMTAxNi40OTIxODggTCA5NS43NDIxODggOTcyLjYwOTM3NSBMIDg0LjI5Mjk2OSA5MzguMjY1NjI1IEwgNjkuMDI3MzQ0IDg4MS4wMjczNDQgTCA1OS40ODgyODEgODIxLjg4MjgxMiBMIDU1LjY3MTg3NSA3NzggTCA1NS42NzE4NzUgNzA1LjQ5NjA5NCBMIDU5LjQ4ODI4MSA2NjMuNTE5NTMxIEwgNjkuMDI3MzQ0IDYwNC4zNzUgTCA4NC4yOTI5NjkgNTQ1LjIyNjU2MiBMIDEwMS40NjQ4NDQgNDk3LjUyNzM0NCBMIDExOC42MzY3MTkgNDU5LjM3MTA5NCBMIDEzOS42MjUgNDE5LjMwMDc4MSBMIDE3MC4xNTIzNDQgMzczLjUxMTcxOSBMIDE4OS4yMzA0NjkgMzQ4LjcwNzAzMSBMIDIxMC4yMTg3NSAzMjMuOTA2MjUgTCAyMzguODM1OTM4IDI5My4zNzg5MDYgTCAyNjUuNTUwNzgxIDI2OC41NzQyMTkgWiBNIDI5MC4zNTE1NjIgMjQ5LjQ5MjE4OCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIzNDE3NiIgZD0iTSA1NS42NzE4NzUgMTA2MC4zNzUgTCA2MS4zOTg0MzggMTA2Ni4xMDE1NjIgTCA3OC41NzAzMTIgMTA5Mi44MTI1IEwgOTcuNjQ4NDM4IDExMTkuNTIzNDM4IEwgMTIyLjQ1MzEyNSAxMTUwLjA1MDc4MSBMIDE0NS4zNDc2NTYgMTE3NC44NTU0NjkgTCAxNzcuNzgxMjUgMTIwNy4yODkwNjIgTCAxOTguNzY5NTMxIDEyMjQuNDYwOTM4IEwgMjIzLjU3NDIxOSAxMjQzLjUzOTA2MiBMIDI1Ni4wMDc4MTIgMTI2NC41MjczNDQgTCAyOTAuMzUxNTYyIDEyODMuNjA5Mzc1IEwgMzIyLjc4OTA2MiAxMjk4Ljg3MTA5NCBMIDM3MC40ODgyODEgMTMxNi4wNDI5NjkgTCA0MTIuNDYwOTM4IDEzMjcuNDkyMTg4IEwgNDUwLjYyMTA5NCAxMzMzLjIxNDg0NCBMIDQ5Ni40MTAxNTYgMTMzMy4yMTQ4NDQgTCA1MjUuMDMxMjUgMTMyNS41ODIwMzEgTCA1NDIuMjAzMTI1IDEzMTQuMTM2NzE5IEwgNTQ5LjgzNTkzOCAxMjk4Ljg3MTA5NCBMIDU1OS4zNzUgMTMwMi42ODc1IEwgNTk5LjQ0MTQwNiAxMzIzLjY3NTc4MSBMIDY1Ni42Nzk2ODggMTM0OC40NzY1NjIgTCA2OTQuODM5ODQ0IDEzNjEuODM1OTM4IEwgNzM4LjcyMjY1NiAxMzc1LjE5MTQwNiBMIDc4Mi42MDU0NjkgMTM4NC43MzA0NjkgTCA4MjQuNTgyMDMxIDEzOTAuNDUzMTI1IEwgOTQyLjg3NSAxMzkwLjQ1MzEyNSBMIDkzNS4yNDIxODggMTM5Ni4xNzU3ODEgTCA4NzYuMDk3NjU2IDE0MjAuOTgwNDY5IEwgODE4Ljg1NTQ2OSAxNDQwLjA1ODU5NCBMIDc1NS44OTQ1MzEgMTQ1NS4zMjQyMTkgTCA2OTQuODM5ODQ0IDE0NjQuODYzMjgxIEwgNjUyLjg2MzI4MSAxNDY4LjY3OTY4OCBMIDU5My43MTg3NSAxNDY4LjY3OTY4OCBMIDU0Mi4yMDMxMjUgMTQ2Mi45NTcwMzEgTCA0OTAuNjg3NSAxNDUzLjQxNzk2OSBMIDQ0OC43MTQ4NDQgMTQ0MS45Njg3NSBMIDM5NS4yODkwNjIgMTQyMi44OTA2MjUgTCAzMzkuOTYwOTM4IDEzOTYuMTc1NzgxIEwgMzA3LjUyMzQzOCAxMzc3LjA5NzY1NiBMIDI3Ni45OTYwOTQgMTM1Ni4xMDkzNzUgTCAyNTQuMTAxNTYyIDEzMzguOTM3NSBMIDIzMy4xMTMyODEgMTMyMS43NjU2MjUgTCAyMTQuMDM1MTU2IDEzMDQuNTkzNzUgTCAxOTEuMTM2NzE5IDEyODMuNjA5Mzc1IEwgMTc3Ljc4MTI1IDEyNjguMzQzNzUgTCAxNTguNzAzMTI1IDEyNDcuMzU1NDY5IEwgMTMwLjA4MjAzMSAxMjA5LjE5OTIxOSBMIDEwOS4wOTc2NTYgMTE3Ni43NjE3MTkgTCA4Ni4xOTkyMTkgMTEzNi42OTUzMTIgTCA2Ny4xMjEwOTQgMTA5NC43MTg3NSBMIDU1LjY3MTg3NSAxMDY2LjEwMTU2MiBaIE0gNTUuNjcxODc1IDEwNjAuMzc1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjM2I5ZGNlIiBkPSJNIDc2My41MjczNDQgMTguNjMyODEyIEwgODUzLjE5OTIxOSAxOC42MzI4MTIgTCA5MDYuNjI1IDI0LjM1NTQ2OSBMIDk1OC4xMzY3MTkgMzMuODk0NTMxIEwgMTAxMS41NjI1IDQ5LjE2MDE1NiBMIDEwNTcuMzUxNTYyIDY2LjMyODEyNSBMIDEwNzQuNTIzNDM4IDczLjk2MDkzOCBMIDEwNjYuODkwNjI1IDc1Ljg3MTA5NCBMIDEwMTMuNDY4NzUgNjQuNDIxODc1IEwgOTgyLjk0MTQwNiA2MC42MDU0NjkgTCA5NTYuMjMwNDY5IDU4LjY5OTIxOSBMIDg3OS45MTAxNTYgNTguNjk5MjE5IEwgODM3LjkzNzUgNjIuNTE1NjI1IEwgNzkyLjE0NDUzMSA3MC4xNDQ1MzEgTCA3MzguNzIyNjU2IDgzLjUgTCA2ODEuNDg0Mzc1IDEwMi41ODIwMzEgTCA2MzcuNjAxNTYyIDEyMS42NjAxNTYgTCA1OTMuNzE4NzUgMTQ0LjU1NDY4OCBMIDU1MS43NDIxODggMTcxLjI2OTUzMSBMIDUxNS40OTIxODggMTk3Ljk4MDQ2OSBMIDQ4OC43ODEyNSAyMjAuODc1IEwgNDYzLjk3NjU2MiAyNDMuNzY5NTMxIEwgNDM1LjM1NTQ2OSAyNzQuMjk2ODc1IEwgNDIwLjA5Mzc1IDI5My4zNzg5MDYgTCAzOTcuMTk5MjE5IDMyMy45MDYyNSBMIDM3Ni4yMTA5MzggMzU2LjMzOTg0NCBMIDM0OS41IDQwNC4wMzkwNjIgTCAzMzQuMjM0Mzc1IDQzNi40NzI2NTYgTCAzMTMuMjQ2MDk0IDQ5MS44MDQ2ODggTCAyOTkuODkwNjI1IDU0My4zMjAzMTIgTCAyOTQuMTY3OTY5IDU3MS45Mzc1IEwgMjg4LjQ0NTMxMiA2MjMuNDUzMTI1IEwgMjg2LjUzNTE1NiA2NzQuOTY4NzUgTCAyODIuNzE4NzUgNjY3LjMzNTkzOCBMIDI3MS4yNzM0MzggNjIzLjQ1MzEyNSBMIDI2My42NDA2MjUgNTc3LjY2NDA2MiBMIDI1OS44MjQyMTkgNTMzLjc4MTI1IEwgMjU5LjgyNDIxOSA0ODkuODk4NDM4IEwgMjYzLjY0MDYyNSA0NDYuMDE1NjI1IEwgMjcxLjI3MzQzOCA0MDQuMDM5MDYyIEwgMjgyLjcxODc1IDM2Mi4wNjI1IEwgMjk3Ljk4NDM3NSAzMjEuOTk2MDk0IEwgMzE1LjE1NjI1IDI4NS43NDYwOTQgTCAzMzIuMzI4MTI1IDI1Ny4xMjUgTCAzNTUuMjIyNjU2IDIyNC42OTE0MDYgTCAzNzYuMjEwOTM4IDE5OS44ODY3MTkgTCAzOTMuMzgyODEyIDE4MC44MDg1OTQgTCA0MTQuMzcxMDk0IDE1OS44MjAzMTIgTCA0MzUuMzU1NDY5IDE0Mi42NDg0MzggTCA0NjIuMDcwMzEyIDEyMS42NjAxNTYgTCA0OTQuNTAzOTA2IDEwMC42NzE4NzUgTCA1MjUuMDMxMjUgODMuNSBMIDU2NS4wOTc2NTYgNjQuNDIxODc1IEwgNTk5LjQ0MTQwNiA1MS4wNjY0MDYgTCA2NDUuMjM0Mzc1IDM3LjcxMDkzOCBMIDY4Ny4yMDcwMzEgMjguMTcxODc1IEwgNzQyLjUzOTA2MiAyMC41MzkwNjIgWiBNIDc2My41MjczNDQgMTguNjMyODEyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZjI3NTNjIiBkPSJNIDEzMzAuMTkxNDA2IDI2NC43NTc4MTIgTCAxMzM3LjgyMDMxMiAyNjQuNzU3ODEyIEwgMTM0MS42MzY3MTkgMjc0LjI5Njg3NSBMIDEzNTguODA4NTk0IDI3Ni4yMDcwMzEgTCAxMzYyLjYyNSAyNzguMTEzMjgxIEwgMTM2NC41MzUxNTYgMzA2LjczNDM3NSBMIDEzNjQuNTM1MTU2IDM3My41MTE3MTkgTCAxMzU4LjgwODU5NCA0MTMuNTc4MTI1IEwgMTM1NC45OTIxODggNDIxLjIxMDkzOCBMIDEzMTEuMTA5Mzc1IDQwMi4xMjg5MDYgTCAxMjcxLjA0Mjk2OSAzNzkuMjM0Mzc1IEwgMTI0NC4zMzIwMzEgMzYwLjE1NjI1IEwgMTIzNC43OTI5NjkgMzUwLjYxNzE4OCBMIDEyMzYuNjk5MjE5IDMzOS4xNjc5NjkgTCAxMjQ2LjIzODI4MSAzMjMuOTA2MjUgTCAxMjY1LjMyMDMxMiAzMDYuNzM0Mzc1IEwgMTMxMy4wMTk1MzEgMjc2LjIwNzAzMSBaIE0gMTMzMC4xOTE0MDYgMjY0Ljc1NzgxMiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y1YmUzOCIgZD0iTSAxMjQwLjUxNTYyNSAxNDguMzcxMDk0IEwgMTI0NC4zMzIwMzEgMTQ4LjM3MTA5NCBMIDEyNTAuMDU0Njg4IDE4Mi43MTQ4NDQgTCAxMjUxLjk2NDg0NCAyMDEuNzk2ODc1IEwgMTI1MS45NjQ4NDQgMjM0LjIzMDQ2OSBMIDEyNDQuMzMyMDMxIDI4MC4wMTk1MzEgTCAxMjQwLjUxNTYyNSAyOTMuMzc4OTA2IEwgMTIyOS4wNjY0MDYgMjg5LjU2MjUgTCAxMTk0LjcyNjU2MiAyNzAuNDgwNDY5IEwgMTE1OC40NzI2NTYgMjUxLjQwMjM0NCBMIDExMjkuODU1NDY5IDIzMi4zMjQyMTkgTCAxMTIwLjMxNjQwNiAyMjQuNjkxNDA2IEwgMTEyMi4yMjI2NTYgMjE1LjE1MjM0NCBMIDExNDguOTMzNTk0IDE5Ni4wNzAzMTIgTCAxMTgxLjM3MTA5NCAxNzYuOTkyMTg4IEwgMTIyMS40Mzc1IDE1Ni4wMDM5MDYgWiBNIDEyNDAuNTE1NjI1IDE0OC4zNzEwOTQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNWEzM2MiIGQ9Ik0gMTM5NS4wNjI1IDIwOS40MjU3ODEgTCAxNDA0LjYwMTU2MiAyMTEuMzM1OTM4IEwgMTQ0Mi43NTc4MTIgMjI2LjU5NzY1NiBMIDE0NjkuNDcyNjU2IDI0My43Njk1MzEgTCAxNDc1LjE5NTMxMiAyNDcuNTg1OTM4IEwgMTQ3MS4zNzg5MDYgMjU1LjIxODc1IEwgMTQ1OC4wMjM0MzggMjY4LjU3NDIxOSBMIDE0MzMuMjE4NzUgMjg3LjY1MjM0NCBMIDE0MTQuMTQwNjI1IDI5Ny4xOTE0MDYgTCAxNDAwLjc4NTE1NiAyOTcuMTkxNDA2IEwgMTM5My4xNTIzNDQgMjg3LjY1MjM0NCBMIDEzODUuNTE5NTMxIDI3MC40ODA0NjkgTCAxMzcyLjE2NDA2MiAyNzAuNDgwNDY5IEwgMTM3NC4wNzQyMTkgMjU5LjAzNTE1NiBMIDEzODcuNDI5Njg4IDIzMC40MTQwNjIgTCAxMzkzLjE1MjM0NCAyMTEuMzM1OTM4IFogTSAxMzk1LjA2MjUgMjA5LjQyNTc4MSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y0OTc1NiIgZD0iTSAxMjkyLjAzMTI1IDExMi4xMjEwOTQgTCAxMzEzLjAxOTUzMSAxMTQuMDI3MzQ0IEwgMTM0OS4yNjk1MzEgMTI3LjM4MjgxMiBMIDEzNzAuMjU3ODEyIDEzOC44MzIwMzEgTCAxMzY4LjM0NzY1NiAxNDYuNDY0ODQ0IEwgMTM0Ny4zNjMyODEgMTcxLjI2OTUzMSBMIDEzMjYuMzc1IDE5MC4zNDc2NTYgTCAxMzExLjEwOTM3NSAxOTcuOTgwNDY5IEwgMTMwMS41NzAzMTIgMTk2LjA3MDMxMiBMIDEyOTAuMTIxMDk0IDE3OC44OTg0MzggTCAxMjg0LjM5ODQzOCAxNTYuMDAzOTA2IEwgMTI4NC4zOTg0MzggMTMzLjEwOTM3NSBaIE0gMTI5Mi4wMzEyNSAxMTIuMTIxMDk0ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=" alt="MINDSPARK"></div>
          <div class="aside-txt">MINDSPARK</div>
        </div>
        <div class="aside-sec">MENU</div>
        <div class="navi on"><div class="navi-icon">&#9866;</div> Dashboard</div>
        <div class="navi"><div class="navi-icon">&#9776;</div> Levels</div>
        <div class="navi"><div class="navi-icon">&#128101;</div> Students<span class="bct" style="margin-left:auto">248</span></div>
        <div class="navi"><div class="navi-icon">&#128221;</div> Assessments</div>
        <div class="navi"><div class="navi-icon">&#128225;</div> Monitor<span class="bdg blv" style="margin-left:auto;padding:1px 6px;font-size:9px">LIVE</span></div>
        <div class="navi"><div class="navi-icon">&#128202;</div> Results</div>
        <div class="aside-sec" style="margin-top:8px">GENERAL</div>
        <div class="navi"><div class="navi-icon">&#9881;</div> Settings</div>
        <div class="navi"><div class="navi-icon">&#8618;</div> Logout</div>
      </div>
      <div class="aside">
        <div class="aside-logo">
          <div class="aside-mark"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwMCIgem9vbUFuZFBhbj0ibWFnbmlmeSIgdmlld0JveD0iMCAwIDE1MDAgMTQ5OS45OTk5MzMiIGhlaWdodD0iMjAwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48cmVjdCB4PSItMTUwIiB3aWR0aD0iMTgwMCIgZmlsbD0iI2ZlZmVmZSIgeT0iLTE0OS45OTk5OTMiIGhlaWdodD0iMTc5OS45OTk5MiIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSAxMTAxLjIzNDM3NSAzODguNzczNDM4IEwgMTEzMS43NjE3MTkgMzg4Ljc3MzQzOCBMIDExODkgMzkyLjU4OTg0NCBMIDEyMDYuMTcxODc1IDM5Ni40MDYyNSBMIDEyMTcuNjIxMDk0IDQwNC4wMzkwNjIgTCAxMjIzLjM0Mzc1IDQxNy4zOTQ1MzEgTCAxMjI5LjA2NjQwNiA0ODQuMTcxODc1IEwgMTI0Mi40MjU3ODEgNzQzLjY1NjI1IEwgMTI0OC4xNDg0MzggODM1LjIzODI4MSBMIDEyNjEuNTAzOTA2IDk3Mi42MDkzNzUgTCAxMjYzLjQxMDE1NiAxMDAxLjIzMDQ2OSBMIDEyNjMuNDEwMTU2IDEwMjkuODQ3NjU2IEwgMTI1MC4wNTQ2ODggMTA1MC44MzU5MzggTCAxMjMwLjk3NjU2MiAxMDY2LjEwMTU2MiBMIDEyMDkuOTg4MjgxIDEwNzMuNzMwNDY5IEwgMTE5Ni42MzI4MTIgMTA3NS42NDA2MjUgTCAxMTEwLjc3MzQzOCAxMDc1LjY0MDYyNSBMIDExMDMuMTQ0NTMxIDk1MS42MjEwOTQgTCAxMDk3LjQxNzk2OSA4NTguMTMyODEyIEwgMTA5My42MDE1NjIgNzU4LjkxNzk2OSBMIDEwOTEuNjk1MzEyIDY3Ni44NzUgTCAxMDg1Ljk3MjY1NiA2OTIuMTQwNjI1IEwgMTA1NS40NDUzMTIgNzk3LjA3ODEyNSBMIDEwMTMuNDY4NzUgOTI2LjgyMDMxMiBMIDk4Ni43NTc4MTIgMTAwOC44NjMyODEgTCA5NjkuNTg1OTM4IDEwNTguNDY4NzUgTCA5NTguMTM2NzE5IDEwNzEuODI0MjE5IEwgOTQwLjk2NDg0NCAxMDc5LjQ1NzAzMSBMIDkyMy43OTI5NjkgMTA4My4yNzM0MzggTCA4OTUuMTc1NzgxIDEwODMuMjczNDM4IEwgODY0LjY0ODQzOCAxMDc3LjU0Njg3NSBMIDg0NS41NzAzMTIgMTA2OC4wMDc4MTIgTCA4MzcuOTM3NSAxMDU4LjQ2ODc1IEwgODI2LjQ4ODI4MSAxMDI3Ljk0MTQwNiBMIDc5NS45NjA5MzggOTMyLjU0Mjk2OSBMIDc3My4wNjY0MDYgODU2LjIyNjU2MiBMIDc2NS40MzM1OTQgODI5LjUxMTcxOSBMIDc2Ny4zNDM3NSA4MTQuMjUgTCA3OTAuMjM4MjgxIDczNy45Mjk2ODggTCA4MjYuNDg4MjgxIDYwOC4xOTE0MDYgTCA4MzYuMDI3MzQ0IDU3My44NDc2NTYgTCA4MzkuODQzNzUgNTc5LjU3MDMxMiBMIDg2NC42NDg0MzggNjczLjA2MjUgTCA5MDAuODk4NDM4IDgwMi44MDA3ODEgTCA5MDQuNzE0ODQ0IDgxNi4xNTYyNSBMIDkwNC43MTQ4NDQgODIzLjc4OTA2MiBMIDkwOC41MzEyNSA4MjMuNzg5MDYyIEwgOTEyLjM0NzY1NiA4MDYuNjE3MTg4IEwgOTUwLjUwNzgxMiA2OTcuODYzMjgxIEwgOTg4LjY2NDA2MiA1OTIuOTI1NzgxIEwgMTAxMy40Njg3NSA1MjIuMzMyMDMxIEwgMTA0MC4xNzk2ODggNDQ3LjkyMTg3NSBMIDEwNTUuNDQ1MzEyIDQxNy4zOTQ1MzEgTCAxMDY4LjgwMDc4MSA0MDIuMTI4OTA2IEwgMTA4MC4yNDYwOTQgMzk0LjUgWiBNIDExMDEuMjM0Mzc1IDM4OC43NzM0MzggIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNTdhMzkiIGQ9Ik0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSBMIDEzODEuNzAzMTI1IDgzMy4zMjgxMjUgTCAxMzgzLjYxMzI4MSA4NTIuNDEwMTU2IEwgMTM4My42MTMyODEgOTAzLjkyNTc4MSBMIDEzNzkuNzk2ODc1IDk0My45OTIxODggTCAxMzY4LjM0NzY1NiA5OTkuMzIwMzEyIEwgMTM1Ni45MDIzNDQgMTAzNy40ODA0NjkgTCAxMzQzLjU0Njg3NSAxMDczLjczMDQ2OSBMIDEzMjguMjgxMjUgMTEwNi4xNjc5NjkgTCAxMzA3LjI5Mjk2OSAxMTQyLjQxNzk2OSBMIDEyODguMjE0ODQ0IDExNjkuMTI4OTA2IEwgMTI2Ny4yMjY1NjIgMTE5My45MzM1OTQgTCAxMjUwLjA1NDY4OCAxMjEzLjAxMTcxOSBMIDEyMzAuOTc2NTYyIDEyMzIuMDkzNzUgTCAxMjA5Ljk4ODI4MSAxMjQ5LjI2NTYyNSBMIDExODEuMzcxMDk0IDEyNzAuMjUzOTA2IEwgMTE1Ni41NjY0MDYgMTI4NS41MTU2MjUgTCAxMTEyLjY4MzU5NCAxMzA4LjQxMDE1NiBMIDEwODAuMjQ2MDk0IDEzMjEuNzY1NjI1IEwgMTAzOC4yNzM0MzggMTMzNS4xMjEwOTQgTCA5OTAuNTc0MjE5IDEzNDYuNTcwMzEyIEwgOTMxLjQyNTc4MSAxMzU0LjIwMzEyNSBMIDgzNC4xMjEwOTQgMTM1NC4yMDMxMjUgTCA3ODguMzI4MTI1IDEzNDguNDc2NTYyIEwgNzM0LjkwNjI1IDEzMzcuMDMxMjUgTCA2OTYuNzQ2MDk0IDEzMjUuNTgyMDMxIEwgNjYwLjQ5NjA5NCAxMzEyLjIyNjU2MiBMIDYyMC40Mjk2ODggMTI5NS4wNTQ2ODggTCA1NzguNDUzMTI1IDEyNzIuMTYwMTU2IEwgNTQ0LjEwOTM3NSAxMjQ5LjI2NTYyNSBMIDUyMy4xMjUgMTIzNCBMIDUwNC4wNDI5NjkgMTIxOC43MzgyODEgTCA0ODEuMTQ4NDM4IDExOTcuNzUgTCA0NjUuODgyODEyIDExODQuMzk0NTMxIEwgNDQ0Ljg5ODQzOCAxMTYzLjQwNjI1IEwgNDMxLjU0Mjk2OSAxMTQ4LjE0NDUzMSBMIDQwNi43MzgyODEgMTExOS41MjM0MzggTCAzNzguMTE3MTg4IDEwODEuMzYzMjgxIEwgMzUzLjMxNjQwNiAxMDQzLjIwMzEyNSBMIDMzNC4yMzQzNzUgMTAwOC44NjMyODEgTCAzMTguOTcyNjU2IDk4MC4yNDIxODggTCAzMTMuMjQ2MDk0IDk2My4wNzAzMTIgTCAzMjIuNzg5MDYyIDk3Mi42MDkzNzUgTCAzNDcuNTg5ODQ0IDk5OS4zMjAzMTIgTCAzNjAuOTQ1MzEyIDEwMTQuNTg1OTM4IEwgNDA0LjgyODEyNSAxMDU4LjQ2ODc1IEwgNDIwLjA5Mzc1IDEwNzEuODI0MjE5IEwgNDQ0Ljg5ODQzOCAxMDkyLjgxMjUgTCA0NjkuNjk5MjE5IDExMTEuODkwNjI1IEwgNTAwLjIyNjU2MiAxMTMyLjg3ODkwNiBMIDUyOC44NDc2NTYgMTE1MC4wNTA3ODEgTCA1NjguOTE0MDYyIDExNzEuMDM5MDYyIEwgNjI4LjA2MjUgMTE5NS44Mzk4NDQgTCA2NzUuNzYxNzE5IDEyMTEuMTA1NDY5IEwgNzIxLjU1MDc4MSAxMjIyLjU1NDY4OCBMIDc3OC43ODkwNjIgMTIzMi4wOTM3NSBMIDgwMS42ODM1OTQgMTIzNCBMIDg5MS4zNTkzNzUgMTIzNCBMIDkyNS43MDMxMjUgMTIzMC4xODM1OTQgTCA5NzkuMTI1IDEyMjAuNjQ0NTMxIEwgMTAyNi44MjQyMTkgMTIwNy4yODkwNjIgTCAxMDYzLjA3NDIxOSAxMTkzLjkzMzU5NCBMIDExMDMuMTQ0NTMxIDExNzYuNzYxNzE5IEwgMTE0NS4xMTcxODggMTE1My44NjcxODggTCAxMTc1LjY0NDUzMSAxMTM0Ljc4NTE1NiBMIDEyMDkuOTg4MjgxIDExMDguMDc0MjE5IEwgMTIzNC43OTI5NjkgMTA4NS4xNzk2ODggTCAxMjY1LjMyMDMxMiAxMDU0LjY1MjM0NCBMIDEyOTAuMTIxMDk0IDEwMjIuMjE4NzUgTCAxMzA5LjIwMzEyNSA5OTUuNTA3ODEyIEwgMTMzMC4xOTE0MDYgOTU5LjI1MzkwNiBMIDEzNTEuMTc1NzgxIDkxNS4zNzEwOTQgTCAxMzY4LjM0NzY1NiA4NjcuNjcxODc1IEwgMTM3NS45ODA0NjkgODM5LjA1NDY4OCBaIE0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMSIgZD0iTSA3NjUuNDMzNTk0IDM5MC42ODM1OTQgTCA4NTUuMTA5Mzc1IDM5MC42ODM1OTQgTCA4NTEuMjkyOTY5IDQxMy41NzgxMjUgTCA4MDUuNSA1ODMuMzg2NzE5IEwgNzY1LjQzMzU5NCA3MjguMzkwNjI1IEwgNzMzIDg0Mi44NzEwOTQgTCA3MDAuNTYyNSA5NTcuMzQ3NjU2IEwgNjczLjg1MTU2MiAxMDQ4LjkyOTY4OCBMIDY2Ni4yMTg3NSAxMDY0LjE5MTQwNiBMIDY1NC43NzM0MzggMTA3MS44MjQyMTkgTCA2MzkuNTA3ODEyIDEwNzUuNjQwNjI1IEwgNDk2LjQxMDE1NiAxMDc1LjY0MDYyNSBMIDUwMC4yMjY1NjIgMTA1OC40Njg3NSBMIDU0MC4yOTY4NzUgOTMyLjU0Mjk2OSBMIDU3OC40NTMxMjUgODA2LjYxNzE4OCBMIDYwNy4wNzQyMTkgNzExLjIxODc1IEwgNjM1LjY5MTQwNiA2MTIuMDA3ODEyIEwgNjY0LjMxMjUgNTA3LjA3MDMxMiBMIDY4My4zOTA2MjUgNDM4LjM4MjgxMiBMIDY5Mi45MzM1OTQgNDEzLjU3ODEyNSBMIDcwMi40NzI2NTYgNDAyLjEyODkwNiBMIDcxNy43MzQzNzUgMzk0LjUgTCA3MzEuMDg5ODQ0IDM5Mi41ODk4NDQgWiBNIDc2NS40MzM1OTQgMzkwLjY4MzU5NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSA1MDQuMDQyOTY5IDM4OC43NzM0MzggTCA1NTMuNjUyMzQ0IDM4OC43NzM0MzggTCA1NzIuNzMwNDY5IDM5Mi41ODk4NDQgTCA1OTUuNjI1IDQwNC4wMzkwNjIgTCA2MDcuMDc0MjE5IDQxMy41NzgxMjUgTCA2MjIuMzM1OTM4IDQzNC41NjY0MDYgTCA2MzMuNzg1MTU2IDQ1Ny40NjA5MzggTCA2MzcuNjAxNTYyIDQ2OC45MTAxNTYgTCA2MzUuNjkxNDA2IDQ4NC4xNzE4NzUgTCA2MDguOTgwNDY5IDU4Ny4yMDMxMjUgTCA1ODQuMTc5Njg4IDY4MC42OTE0MDYgTCA1NzguNDUzMTI1IDY5NS45NTcwMzEgTCA1NzQuNjM2NzE5IDY5MC4yMzQzNzUgTCA1NTcuNDY0ODQ0IDY0MC42MjUgTCA1NDkuODM1OTM4IDc0OS4zNzg5MDYgTCA1NDYuMDE5NTMxIDc3OS45MDYyNSBMIDUxOS4zMDg1OTQgODc3LjIxMDkzOCBMIDQ3Ny4zMzIwMzEgMTAxOC40MDIzNDQgTCA0NjIuMDcwMzEyIDEwNjkuOTE3OTY5IEwgNDQ2LjgwNDY4OCAxMDU4LjQ2ODc1IEwgNDI1LjgxNjQwNiAxMDQxLjI5Njg3NSBMIDQwMS4wMTU2MjUgMTAxOC40MDIzNDQgTCAzNzYuMjEwOTM4IDk5My41OTc2NTYgTCAzNzguMTE3MTg4IDk2Ni44ODY3MTkgTCAzOTcuMTk5MjE5IDgwOC41MjczNDQgTCA0MTYuMjc3MzQ0IDYzMi45OTIxODggTCA0MzcuMjY1NjI1IDQyNi45MzM1OTQgTCA0NDEuMDgyMDMxIDQwOS43NjE3MTkgTCA0NTAuNjIxMDk0IDM5OC4zMTY0MDYgTCA0NjIuMDcwMzEyIDM5Mi41ODk4NDQgWiBNIDUwNC4wNDI5NjkgMzg4Ljc3MzQzOCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMCIgZD0iTSAyOTAuMzUxNTYyIDI0OS40OTIxODggTCAyOTAuMzUxNTYyIDI1NS4yMTg3NSBMIDI3My4xNzk2ODggMjgzLjgzNTkzOCBMIDI1Ny45MTc5NjkgMzEwLjU0Njg3NSBMIDIzNi45Mjk2ODggMzU2LjMzOTg0NCBMIDIxNy44NTE1NjIgNDA5Ljc2MTcxOSBMIDIwNC40OTYwOTQgNDU3LjQ2MDkzOCBMIDE5NC45NTMxMjUgNTA3LjA3MDMxMiBMIDE5MS4xMzY3MTkgNTM3LjU5NzY1NiBMIDE4OS4yMzA0NjkgNTY4LjEyNSBMIDE4OS4yMzA0NjkgNjIzLjQ1MzEyNSBMIDE5NC45NTMxMjUgNjg0LjUwNzgxMiBMIDIwNC40OTYwOTQgNzM3LjkyOTY4OCBMIDIxNS45NDE0MDYgNzgzLjcyMjY1NiBMIDIzNS4wMjM0MzggODM5LjA1NDY4OCBMIDI1OS44MjQyMTkgODk2LjI5Mjk2OSBMIDI2OS4zNjMyODEgOTEzLjQ2NDg0NCBMIDI2OS4zNjMyODEgOTI4LjcyNjU2MiBMIDI1Ny45MTc5NjkgOTQ3LjgwODU5NCBMIDIzNi45Mjk2ODggOTcyLjYwOTM3NSBMIDIyMy41NzQyMTkgOTkzLjU5NzY1NiBMIDIxNS45NDE0MDYgMTAxNi40OTIxODggTCAyMTUuOTQxNDA2IDEwNDguOTI5Njg4IEwgMjIzLjU3NDIxOSAxMDg3LjA4OTg0NCBMIDIzNi45Mjk2ODggMTEyNS4yNDYwOTQgTCAyNTkuODI0MjE5IDExNzIuOTQ1MzEyIEwgMjgyLjcxODc1IDEyMDkuMTk5MjE5IEwgMjk0LjE2Nzk2OSAxMjI2LjM2NzE4OCBMIDI4Ni41MzUxNTYgMTIyMi41NTQ2ODggTCAyNjMuNjQwNjI1IDEyMDUuMzgyODEyIEwgMjQ0LjU2MjUgMTE4OC4yMTA5MzggTCAyMjkuMjk2ODc1IDExNzQuODU1NDY5IEwgMTk2Ljg2MzI4MSAxMTQyLjQxNzk2OSBMIDE3NS44NzUgMTExNS43MDcwMzEgTCAxNTQuODg2NzE5IDEwODcuMDg5ODQ0IEwgMTMwLjA4MjAzMSAxMDQ3LjAxOTUzMSBMIDExNC44MjAzMTIgMTAxNi40OTIxODggTCA5NS43NDIxODggOTcyLjYwOTM3NSBMIDg0LjI5Mjk2OSA5MzguMjY1NjI1IEwgNjkuMDI3MzQ0IDg4MS4wMjczNDQgTCA1OS40ODgyODEgODIxLjg4MjgxMiBMIDU1LjY3MTg3NSA3NzggTCA1NS42NzE4NzUgNzA1LjQ5NjA5NCBMIDU5LjQ4ODI4MSA2NjMuNTE5NTMxIEwgNjkuMDI3MzQ0IDYwNC4zNzUgTCA4NC4yOTI5NjkgNTQ1LjIyNjU2MiBMIDEwMS40NjQ4NDQgNDk3LjUyNzM0NCBMIDExOC42MzY3MTkgNDU5LjM3MTA5NCBMIDEzOS42MjUgNDE5LjMwMDc4MSBMIDE3MC4xNTIzNDQgMzczLjUxMTcxOSBMIDE4OS4yMzA0NjkgMzQ4LjcwNzAzMSBMIDIxMC4yMTg3NSAzMjMuOTA2MjUgTCAyMzguODM1OTM4IDI5My4zNzg5MDYgTCAyNjUuNTUwNzgxIDI2OC41NzQyMTkgWiBNIDI5MC4zNTE1NjIgMjQ5LjQ5MjE4OCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIzNDE3NiIgZD0iTSA1NS42NzE4NzUgMTA2MC4zNzUgTCA2MS4zOTg0MzggMTA2Ni4xMDE1NjIgTCA3OC41NzAzMTIgMTA5Mi44MTI1IEwgOTcuNjQ4NDM4IDExMTkuNTIzNDM4IEwgMTIyLjQ1MzEyNSAxMTUwLjA1MDc4MSBMIDE0NS4zNDc2NTYgMTE3NC44NTU0NjkgTCAxNzcuNzgxMjUgMTIwNy4yODkwNjIgTCAxOTguNzY5NTMxIDEyMjQuNDYwOTM4IEwgMjIzLjU3NDIxOSAxMjQzLjUzOTA2MiBMIDI1Ni4wMDc4MTIgMTI2NC41MjczNDQgTCAyOTAuMzUxNTYyIDEyODMuNjA5Mzc1IEwgMzIyLjc4OTA2MiAxMjk4Ljg3MTA5NCBMIDM3MC40ODgyODEgMTMxNi4wNDI5NjkgTCA0MTIuNDYwOTM4IDEzMjcuNDkyMTg4IEwgNDUwLjYyMTA5NCAxMzMzLjIxNDg0NCBMIDQ5Ni40MTAxNTYgMTMzMy4yMTQ4NDQgTCA1MjUuMDMxMjUgMTMyNS41ODIwMzEgTCA1NDIuMjAzMTI1IDEzMTQuMTM2NzE5IEwgNTQ5LjgzNTkzOCAxMjk4Ljg3MTA5NCBMIDU1OS4zNzUgMTMwMi42ODc1IEwgNTk5LjQ0MTQwNiAxMzIzLjY3NTc4MSBMIDY1Ni42Nzk2ODggMTM0OC40NzY1NjIgTCA2OTQuODM5ODQ0IDEzNjEuODM1OTM4IEwgNzM4LjcyMjY1NiAxMzc1LjE5MTQwNiBMIDc4Mi42MDU0NjkgMTM4NC43MzA0NjkgTCA4MjQuNTgyMDMxIDEzOTAuNDUzMTI1IEwgOTQyLjg3NSAxMzkwLjQ1MzEyNSBMIDkzNS4yNDIxODggMTM5Ni4xNzU3ODEgTCA4NzYuMDk3NjU2IDE0MjAuOTgwNDY5IEwgODE4Ljg1NTQ2OSAxNDQwLjA1ODU5NCBMIDc1NS44OTQ1MzEgMTQ1NS4zMjQyMTkgTCA2OTQuODM5ODQ0IDE0NjQuODYzMjgxIEwgNjUyLjg2MzI4MSAxNDY4LjY3OTY4OCBMIDU5My43MTg3NSAxNDY4LjY3OTY4OCBMIDU0Mi4yMDMxMjUgMTQ2Mi45NTcwMzEgTCA0OTAuNjg3NSAxNDUzLjQxNzk2OSBMIDQ0OC43MTQ4NDQgMTQ0MS45Njg3NSBMIDM5NS4yODkwNjIgMTQyMi44OTA2MjUgTCAzMzkuOTYwOTM4IDEzOTYuMTc1NzgxIEwgMzA3LjUyMzQzOCAxMzc3LjA5NzY1NiBMIDI3Ni45OTYwOTQgMTM1Ni4xMDkzNzUgTCAyNTQuMTAxNTYyIDEzMzguOTM3NSBMIDIzMy4xMTMyODEgMTMyMS43NjU2MjUgTCAyMTQuMDM1MTU2IDEzMDQuNTkzNzUgTCAxOTEuMTM2NzE5IDEyODMuNjA5Mzc1IEwgMTc3Ljc4MTI1IDEyNjguMzQzNzUgTCAxNTguNzAzMTI1IDEyNDcuMzU1NDY5IEwgMTMwLjA4MjAzMSAxMjA5LjE5OTIxOSBMIDEwOS4wOTc2NTYgMTE3Ni43NjE3MTkgTCA4Ni4xOTkyMTkgMTEzNi42OTUzMTIgTCA2Ny4xMjEwOTQgMTA5NC43MTg3NSBMIDU1LjY3MTg3NSAxMDY2LjEwMTU2MiBaIE0gNTUuNjcxODc1IDEwNjAuMzc1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjM2I5ZGNlIiBkPSJNIDc2My41MjczNDQgMTguNjMyODEyIEwgODUzLjE5OTIxOSAxOC42MzI4MTIgTCA5MDYuNjI1IDI0LjM1NTQ2OSBMIDk1OC4xMzY3MTkgMzMuODk0NTMxIEwgMTAxMS41NjI1IDQ5LjE2MDE1NiBMIDEwNTcuMzUxNTYyIDY2LjMyODEyNSBMIDEwNzQuNTIzNDM4IDczLjk2MDkzOCBMIDEwNjYuODkwNjI1IDc1Ljg3MTA5NCBMIDEwMTMuNDY4NzUgNjQuNDIxODc1IEwgOTgyLjk0MTQwNiA2MC42MDU0NjkgTCA5NTYuMjMwNDY5IDU4LjY5OTIxOSBMIDg3OS45MTAxNTYgNTguNjk5MjE5IEwgODM3LjkzNzUgNjIuNTE1NjI1IEwgNzkyLjE0NDUzMSA3MC4xNDQ1MzEgTCA3MzguNzIyNjU2IDgzLjUgTCA2ODEuNDg0Mzc1IDEwMi41ODIwMzEgTCA2MzcuNjAxNTYyIDEyMS42NjAxNTYgTCA1OTMuNzE4NzUgMTQ0LjU1NDY4OCBMIDU1MS43NDIxODggMTcxLjI2OTUzMSBMIDUxNS40OTIxODggMTk3Ljk4MDQ2OSBMIDQ4OC43ODEyNSAyMjAuODc1IEwgNDYzLjk3NjU2MiAyNDMuNzY5NTMxIEwgNDM1LjM1NTQ2OSAyNzQuMjk2ODc1IEwgNDIwLjA5Mzc1IDI5My4zNzg5MDYgTCAzOTcuMTk5MjE5IDMyMy45MDYyNSBMIDM3Ni4yMTA5MzggMzU2LjMzOTg0NCBMIDM0OS41IDQwNC4wMzkwNjIgTCAzMzQuMjM0Mzc1IDQzNi40NzI2NTYgTCAzMTMuMjQ2MDk0IDQ5MS44MDQ2ODggTCAyOTkuODkwNjI1IDU0My4zMjAzMTIgTCAyOTQuMTY3OTY5IDU3MS45Mzc1IEwgMjg4LjQ0NTMxMiA2MjMuNDUzMTI1IEwgMjg2LjUzNTE1NiA2NzQuOTY4NzUgTCAyODIuNzE4NzUgNjY3LjMzNTkzOCBMIDI3MS4yNzM0MzggNjIzLjQ1MzEyNSBMIDI2My42NDA2MjUgNTc3LjY2NDA2MiBMIDI1OS44MjQyMTkgNTMzLjc4MTI1IEwgMjU5LjgyNDIxOSA0ODkuODk4NDM4IEwgMjYzLjY0MDYyNSA0NDYuMDE1NjI1IEwgMjcxLjI3MzQzOCA0MDQuMDM5MDYyIEwgMjgyLjcxODc1IDM2Mi4wNjI1IEwgMjk3Ljk4NDM3NSAzMjEuOTk2MDk0IEwgMzE1LjE1NjI1IDI4NS43NDYwOTQgTCAzMzIuMzI4MTI1IDI1Ny4xMjUgTCAzNTUuMjIyNjU2IDIyNC42OTE0MDYgTCAzNzYuMjEwOTM4IDE5OS44ODY3MTkgTCAzOTMuMzgyODEyIDE4MC44MDg1OTQgTCA0MTQuMzcxMDk0IDE1OS44MjAzMTIgTCA0MzUuMzU1NDY5IDE0Mi42NDg0MzggTCA0NjIuMDcwMzEyIDEyMS42NjAxNTYgTCA0OTQuNTAzOTA2IDEwMC42NzE4NzUgTCA1MjUuMDMxMjUgODMuNSBMIDU2NS4wOTc2NTYgNjQuNDIxODc1IEwgNTk5LjQ0MTQwNiA1MS4wNjY0MDYgTCA2NDUuMjM0Mzc1IDM3LjcxMDkzOCBMIDY4Ny4yMDcwMzEgMjguMTcxODc1IEwgNzQyLjUzOTA2MiAyMC41MzkwNjIgWiBNIDc2My41MjczNDQgMTguNjMyODEyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZjI3NTNjIiBkPSJNIDEzMzAuMTkxNDA2IDI2NC43NTc4MTIgTCAxMzM3LjgyMDMxMiAyNjQuNzU3ODEyIEwgMTM0MS42MzY3MTkgMjc0LjI5Njg3NSBMIDEzNTguODA4NTk0IDI3Ni4yMDcwMzEgTCAxMzYyLjYyNSAyNzguMTEzMjgxIEwgMTM2NC41MzUxNTYgMzA2LjczNDM3NSBMIDEzNjQuNTM1MTU2IDM3My41MTE3MTkgTCAxMzU4LjgwODU5NCA0MTMuNTc4MTI1IEwgMTM1NC45OTIxODggNDIxLjIxMDkzOCBMIDEzMTEuMTA5Mzc1IDQwMi4xMjg5MDYgTCAxMjcxLjA0Mjk2OSAzNzkuMjM0Mzc1IEwgMTI0NC4zMzIwMzEgMzYwLjE1NjI1IEwgMTIzNC43OTI5NjkgMzUwLjYxNzE4OCBMIDEyMzYuNjk5MjE5IDMzOS4xNjc5NjkgTCAxMjQ2LjIzODI4MSAzMjMuOTA2MjUgTCAxMjY1LjMyMDMxMiAzMDYuNzM0Mzc1IEwgMTMxMy4wMTk1MzEgMjc2LjIwNzAzMSBaIE0gMTMzMC4xOTE0MDYgMjY0Ljc1NzgxMiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y1YmUzOCIgZD0iTSAxMjQwLjUxNTYyNSAxNDguMzcxMDk0IEwgMTI0NC4zMzIwMzEgMTQ4LjM3MTA5NCBMIDEyNTAuMDU0Njg4IDE4Mi43MTQ4NDQgTCAxMjUxLjk2NDg0NCAyMDEuNzk2ODc1IEwgMTI1MS45NjQ4NDQgMjM0LjIzMDQ2OSBMIDEyNDQuMzMyMDMxIDI4MC4wMTk1MzEgTCAxMjQwLjUxNTYyNSAyOTMuMzc4OTA2IEwgMTIyOS4wNjY0MDYgMjg5LjU2MjUgTCAxMTk0LjcyNjU2MiAyNzAuNDgwNDY5IEwgMTE1OC40NzI2NTYgMjUxLjQwMjM0NCBMIDExMjkuODU1NDY5IDIzMi4zMjQyMTkgTCAxMTIwLjMxNjQwNiAyMjQuNjkxNDA2IEwgMTEyMi4yMjI2NTYgMjE1LjE1MjM0NCBMIDExNDguOTMzNTk0IDE5Ni4wNzAzMTIgTCAxMTgxLjM3MTA5NCAxNzYuOTkyMTg4IEwgMTIyMS40Mzc1IDE1Ni4wMDM5MDYgWiBNIDEyNDAuNTE1NjI1IDE0OC4zNzEwOTQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNWEzM2MiIGQ9Ik0gMTM5NS4wNjI1IDIwOS40MjU3ODEgTCAxNDA0LjYwMTU2MiAyMTEuMzM1OTM4IEwgMTQ0Mi43NTc4MTIgMjI2LjU5NzY1NiBMIDE0NjkuNDcyNjU2IDI0My43Njk1MzEgTCAxNDc1LjE5NTMxMiAyNDcuNTg1OTM4IEwgMTQ3MS4zNzg5MDYgMjU1LjIxODc1IEwgMTQ1OC4wMjM0MzggMjY4LjU3NDIxOSBMIDE0MzMuMjE4NzUgMjg3LjY1MjM0NCBMIDE0MTQuMTQwNjI1IDI5Ny4xOTE0MDYgTCAxNDAwLjc4NTE1NiAyOTcuMTkxNDA2IEwgMTM5My4xNTIzNDQgMjg3LjY1MjM0NCBMIDEzODUuNTE5NTMxIDI3MC40ODA0NjkgTCAxMzcyLjE2NDA2MiAyNzAuNDgwNDY5IEwgMTM3NC4wNzQyMTkgMjU5LjAzNTE1NiBMIDEzODcuNDI5Njg4IDIzMC40MTQwNjIgTCAxMzkzLjE1MjM0NCAyMTEuMzM1OTM4IFogTSAxMzk1LjA2MjUgMjA5LjQyNTc4MSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y0OTc1NiIgZD0iTSAxMjkyLjAzMTI1IDExMi4xMjEwOTQgTCAxMzEzLjAxOTUzMSAxMTQuMDI3MzQ0IEwgMTM0OS4yNjk1MzEgMTI3LjM4MjgxMiBMIDEzNzAuMjU3ODEyIDEzOC44MzIwMzEgTCAxMzY4LjM0NzY1NiAxNDYuNDY0ODQ0IEwgMTM0Ny4zNjMyODEgMTcxLjI2OTUzMSBMIDEzMjYuMzc1IDE5MC4zNDc2NTYgTCAxMzExLjEwOTM3NSAxOTcuOTgwNDY5IEwgMTMwMS41NzAzMTIgMTk2LjA3MDMxMiBMIDEyOTAuMTIxMDk0IDE3OC44OTg0MzggTCAxMjg0LjM5ODQzOCAxNTYuMDAzOTA2IEwgMTI4NC4zOTg0MzggMTMzLjEwOTM3NSBaIE0gMTI5Mi4wMzEyNSAxMTIuMTIxMDk0ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=" alt="MINDSPARK"></div>
          <div class="aside-txt">MINDSPARK</div>
        </div>
        <div class="aside-sec">MENU</div>
        <div class="navi on"><div class="navi-icon">&#9866;</div> Dashboard</div>
        <div class="navi"><div class="navi-icon">&#9889;</div> Exam<span class="bdg blv" style="margin-left:auto;padding:1px 6px;font-size:9px">LIVE</span></div>
        <div class="navi"><div class="navi-icon">&#9638;</div> Test</div>
        <div class="navi"><div class="navi-icon">&#128202;</div> Results<span class="bct" style="margin-left:auto">3</span></div>
        <div class="navi"><div class="navi-icon">&#128100;</div> Profile</div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:10px">
        <p style="font-size:11px;color:var(--t3);margin-bottom:4px">Loading screen with MINDSPARK brand</p>
        <div class="lottie-page" style="padding:28px 20px;background:#204074;border:none">
          <div class="brand-hero-logo" style="margin:0 auto 16px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwMCIgem9vbUFuZFBhbj0ibWFnbmlmeSIgdmlld0JveD0iMCAwIDE1MDAgMTQ5OS45OTk5MzMiIGhlaWdodD0iMjAwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48cmVjdCB4PSItMTUwIiB3aWR0aD0iMTgwMCIgZmlsbD0iI2ZlZmVmZSIgeT0iLTE0OS45OTk5OTMiIGhlaWdodD0iMTc5OS45OTk5MiIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSAxMTAxLjIzNDM3NSAzODguNzczNDM4IEwgMTEzMS43NjE3MTkgMzg4Ljc3MzQzOCBMIDExODkgMzkyLjU4OTg0NCBMIDEyMDYuMTcxODc1IDM5Ni40MDYyNSBMIDEyMTcuNjIxMDk0IDQwNC4wMzkwNjIgTCAxMjIzLjM0Mzc1IDQxNy4zOTQ1MzEgTCAxMjI5LjA2NjQwNiA0ODQuMTcxODc1IEwgMTI0Mi40MjU3ODEgNzQzLjY1NjI1IEwgMTI0OC4xNDg0MzggODM1LjIzODI4MSBMIDEyNjEuNTAzOTA2IDk3Mi42MDkzNzUgTCAxMjYzLjQxMDE1NiAxMDAxLjIzMDQ2OSBMIDEyNjMuNDEwMTU2IDEwMjkuODQ3NjU2IEwgMTI1MC4wNTQ2ODggMTA1MC44MzU5MzggTCAxMjMwLjk3NjU2MiAxMDY2LjEwMTU2MiBMIDEyMDkuOTg4MjgxIDEwNzMuNzMwNDY5IEwgMTE5Ni42MzI4MTIgMTA3NS42NDA2MjUgTCAxMTEwLjc3MzQzOCAxMDc1LjY0MDYyNSBMIDExMDMuMTQ0NTMxIDk1MS42MjEwOTQgTCAxMDk3LjQxNzk2OSA4NTguMTMyODEyIEwgMTA5My42MDE1NjIgNzU4LjkxNzk2OSBMIDEwOTEuNjk1MzEyIDY3Ni44NzUgTCAxMDg1Ljk3MjY1NiA2OTIuMTQwNjI1IEwgMTA1NS40NDUzMTIgNzk3LjA3ODEyNSBMIDEwMTMuNDY4NzUgOTI2LjgyMDMxMiBMIDk4Ni43NTc4MTIgMTAwOC44NjMyODEgTCA5NjkuNTg1OTM4IDEwNTguNDY4NzUgTCA5NTguMTM2NzE5IDEwNzEuODI0MjE5IEwgOTQwLjk2NDg0NCAxMDc5LjQ1NzAzMSBMIDkyMy43OTI5NjkgMTA4My4yNzM0MzggTCA4OTUuMTc1NzgxIDEwODMuMjczNDM4IEwgODY0LjY0ODQzOCAxMDc3LjU0Njg3NSBMIDg0NS41NzAzMTIgMTA2OC4wMDc4MTIgTCA4MzcuOTM3NSAxMDU4LjQ2ODc1IEwgODI2LjQ4ODI4MSAxMDI3Ljk0MTQwNiBMIDc5NS45NjA5MzggOTMyLjU0Mjk2OSBMIDc3My4wNjY0MDYgODU2LjIyNjU2MiBMIDc2NS40MzM1OTQgODI5LjUxMTcxOSBMIDc2Ny4zNDM3NSA4MTQuMjUgTCA3OTAuMjM4MjgxIDczNy45Mjk2ODggTCA4MjYuNDg4MjgxIDYwOC4xOTE0MDYgTCA4MzYuMDI3MzQ0IDU3My44NDc2NTYgTCA4MzkuODQzNzUgNTc5LjU3MDMxMiBMIDg2NC42NDg0MzggNjczLjA2MjUgTCA5MDAuODk4NDM4IDgwMi44MDA3ODEgTCA5MDQuNzE0ODQ0IDgxNi4xNTYyNSBMIDkwNC43MTQ4NDQgODIzLjc4OTA2MiBMIDkwOC41MzEyNSA4MjMuNzg5MDYyIEwgOTEyLjM0NzY1NiA4MDYuNjE3MTg4IEwgOTUwLjUwNzgxMiA2OTcuODYzMjgxIEwgOTg4LjY2NDA2MiA1OTIuOTI1NzgxIEwgMTAxMy40Njg3NSA1MjIuMzMyMDMxIEwgMTA0MC4xNzk2ODggNDQ3LjkyMTg3NSBMIDEwNTUuNDQ1MzEyIDQxNy4zOTQ1MzEgTCAxMDY4LjgwMDc4MSA0MDIuMTI4OTA2IEwgMTA4MC4yNDYwOTQgMzk0LjUgWiBNIDExMDEuMjM0Mzc1IDM4OC43NzM0MzggIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNTdhMzkiIGQ9Ik0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSBMIDEzODEuNzAzMTI1IDgzMy4zMjgxMjUgTCAxMzgzLjYxMzI4MSA4NTIuNDEwMTU2IEwgMTM4My42MTMyODEgOTAzLjkyNTc4MSBMIDEzNzkuNzk2ODc1IDk0My45OTIxODggTCAxMzY4LjM0NzY1NiA5OTkuMzIwMzEyIEwgMTM1Ni45MDIzNDQgMTAzNy40ODA0NjkgTCAxMzQzLjU0Njg3NSAxMDczLjczMDQ2OSBMIDEzMjguMjgxMjUgMTEwNi4xNjc5NjkgTCAxMzA3LjI5Mjk2OSAxMTQyLjQxNzk2OSBMIDEyODguMjE0ODQ0IDExNjkuMTI4OTA2IEwgMTI2Ny4yMjY1NjIgMTE5My45MzM1OTQgTCAxMjUwLjA1NDY4OCAxMjEzLjAxMTcxOSBMIDEyMzAuOTc2NTYyIDEyMzIuMDkzNzUgTCAxMjA5Ljk4ODI4MSAxMjQ5LjI2NTYyNSBMIDExODEuMzcxMDk0IDEyNzAuMjUzOTA2IEwgMTE1Ni41NjY0MDYgMTI4NS41MTU2MjUgTCAxMTEyLjY4MzU5NCAxMzA4LjQxMDE1NiBMIDEwODAuMjQ2MDk0IDEzMjEuNzY1NjI1IEwgMTAzOC4yNzM0MzggMTMzNS4xMjEwOTQgTCA5OTAuNTc0MjE5IDEzNDYuNTcwMzEyIEwgOTMxLjQyNTc4MSAxMzU0LjIwMzEyNSBMIDgzNC4xMjEwOTQgMTM1NC4yMDMxMjUgTCA3ODguMzI4MTI1IDEzNDguNDc2NTYyIEwgNzM0LjkwNjI1IDEzMzcuMDMxMjUgTCA2OTYuNzQ2MDk0IDEzMjUuNTgyMDMxIEwgNjYwLjQ5NjA5NCAxMzEyLjIyNjU2MiBMIDYyMC40Mjk2ODggMTI5NS4wNTQ2ODggTCA1NzguNDUzMTI1IDEyNzIuMTYwMTU2IEwgNTQ0LjEwOTM3NSAxMjQ5LjI2NTYyNSBMIDUyMy4xMjUgMTIzNCBMIDUwNC4wNDI5NjkgMTIxOC43MzgyODEgTCA0ODEuMTQ4NDM4IDExOTcuNzUgTCA0NjUuODgyODEyIDExODQuMzk0NTMxIEwgNDQ0Ljg5ODQzOCAxMTYzLjQwNjI1IEwgNDMxLjU0Mjk2OSAxMTQ4LjE0NDUzMSBMIDQwNi43MzgyODEgMTExOS41MjM0MzggTCAzNzguMTE3MTg4IDEwODEuMzYzMjgxIEwgMzUzLjMxNjQwNiAxMDQzLjIwMzEyNSBMIDMzNC4yMzQzNzUgMTAwOC44NjMyODEgTCAzMTguOTcyNjU2IDk4MC4yNDIxODggTCAzMTMuMjQ2MDk0IDk2My4wNzAzMTIgTCAzMjIuNzg5MDYyIDk3Mi42MDkzNzUgTCAzNDcuNTg5ODQ0IDk5OS4zMjAzMTIgTCAzNjAuOTQ1MzEyIDEwMTQuNTg1OTM4IEwgNDA0LjgyODEyNSAxMDU4LjQ2ODc1IEwgNDIwLjA5Mzc1IDEwNzEuODI0MjE5IEwgNDQ0Ljg5ODQzOCAxMDkyLjgxMjUgTCA0NjkuNjk5MjE5IDExMTEuODkwNjI1IEwgNTAwLjIyNjU2MiAxMTMyLjg3ODkwNiBMIDUyOC44NDc2NTYgMTE1MC4wNTA3ODEgTCA1NjguOTE0MDYyIDExNzEuMDM5MDYyIEwgNjI4LjA2MjUgMTE5NS44Mzk4NDQgTCA2NzUuNzYxNzE5IDEyMTEuMTA1NDY5IEwgNzIxLjU1MDc4MSAxMjIyLjU1NDY4OCBMIDc3OC43ODkwNjIgMTIzMi4wOTM3NSBMIDgwMS42ODM1OTQgMTIzNCBMIDg5MS4zNTkzNzUgMTIzNCBMIDkyNS43MDMxMjUgMTIzMC4xODM1OTQgTCA5NzkuMTI1IDEyMjAuNjQ0NTMxIEwgMTAyNi44MjQyMTkgMTIwNy4yODkwNjIgTCAxMDYzLjA3NDIxOSAxMTkzLjkzMzU5NCBMIDExMDMuMTQ0NTMxIDExNzYuNzYxNzE5IEwgMTE0NS4xMTcxODggMTE1My44NjcxODggTCAxMTc1LjY0NDUzMSAxMTM0Ljc4NTE1NiBMIDEyMDkuOTg4MjgxIDExMDguMDc0MjE5IEwgMTIzNC43OTI5NjkgMTA4NS4xNzk2ODggTCAxMjY1LjMyMDMxMiAxMDU0LjY1MjM0NCBMIDEyOTAuMTIxMDk0IDEwMjIuMjE4NzUgTCAxMzA5LjIwMzEyNSA5OTUuNTA3ODEyIEwgMTMzMC4xOTE0MDYgOTU5LjI1MzkwNiBMIDEzNTEuMTc1NzgxIDkxNS4zNzEwOTQgTCAxMzY4LjM0NzY1NiA4NjcuNjcxODc1IEwgMTM3NS45ODA0NjkgODM5LjA1NDY4OCBaIE0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMSIgZD0iTSA3NjUuNDMzNTk0IDM5MC42ODM1OTQgTCA4NTUuMTA5Mzc1IDM5MC42ODM1OTQgTCA4NTEuMjkyOTY5IDQxMy41NzgxMjUgTCA4MDUuNSA1ODMuMzg2NzE5IEwgNzY1LjQzMzU5NCA3MjguMzkwNjI1IEwgNzMzIDg0Mi44NzEwOTQgTCA3MDAuNTYyNSA5NTcuMzQ3NjU2IEwgNjczLjg1MTU2MiAxMDQ4LjkyOTY4OCBMIDY2Ni4yMTg3NSAxMDY0LjE5MTQwNiBMIDY1NC43NzM0MzggMTA3MS44MjQyMTkgTCA2MzkuNTA3ODEyIDEwNzUuNjQwNjI1IEwgNDk2LjQxMDE1NiAxMDc1LjY0MDYyNSBMIDUwMC4yMjY1NjIgMTA1OC40Njg3NSBMIDU0MC4yOTY4NzUgOTMyLjU0Mjk2OSBMIDU3OC40NTMxMjUgODA2LjYxNzE4OCBMIDYwNy4wNzQyMTkgNzExLjIxODc1IEwgNjM1LjY5MTQwNiA2MTIuMDA3ODEyIEwgNjY0LjMxMjUgNTA3LjA3MDMxMiBMIDY4My4zOTA2MjUgNDM4LjM4MjgxMiBMIDY5Mi45MzM1OTQgNDEzLjU3ODEyNSBMIDcwMi40NzI2NTYgNDAyLjEyODkwNiBMIDcxNy43MzQzNzUgMzk0LjUgTCA3MzEuMDg5ODQ0IDM5Mi41ODk4NDQgWiBNIDc2NS40MzM1OTQgMzkwLjY4MzU5NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSA1MDQuMDQyOTY5IDM4OC43NzM0MzggTCA1NTMuNjUyMzQ0IDM4OC43NzM0MzggTCA1NzIuNzMwNDY5IDM5Mi41ODk4NDQgTCA1OTUuNjI1IDQwNC4wMzkwNjIgTCA2MDcuMDc0MjE5IDQxMy41NzgxMjUgTCA2MjIuMzM1OTM4IDQzNC41NjY0MDYgTCA2MzMuNzg1MTU2IDQ1Ny40NjA5MzggTCA2MzcuNjAxNTYyIDQ2OC45MTAxNTYgTCA2MzUuNjkxNDA2IDQ4NC4xNzE4NzUgTCA2MDguOTgwNDY5IDU4Ny4yMDMxMjUgTCA1ODQuMTc5Njg4IDY4MC42OTE0MDYgTCA1NzguNDUzMTI1IDY5NS45NTcwMzEgTCA1NzQuNjM2NzE5IDY5MC4yMzQzNzUgTCA1NTcuNDY0ODQ0IDY0MC42MjUgTCA1NDkuODM1OTM4IDc0OS4zNzg5MDYgTCA1NDYuMDE5NTMxIDc3OS45MDYyNSBMIDUxOS4zMDg1OTQgODc3LjIxMDkzOCBMIDQ3Ny4zMzIwMzEgMTAxOC40MDIzNDQgTCA0NjIuMDcwMzEyIDEwNjkuOTE3OTY5IEwgNDQ2LjgwNDY4OCAxMDU4LjQ2ODc1IEwgNDI1LjgxNjQwNiAxMDQxLjI5Njg3NSBMIDQwMS4wMTU2MjUgMTAxOC40MDIzNDQgTCAzNzYuMjEwOTM4IDk5My41OTc2NTYgTCAzNzguMTE3MTg4IDk2Ni44ODY3MTkgTCAzOTcuMTk5MjE5IDgwOC41MjczNDQgTCA0MTYuMjc3MzQ0IDYzMi45OTIxODggTCA0MzcuMjY1NjI1IDQyNi45MzM1OTQgTCA0NDEuMDgyMDMxIDQwOS43NjE3MTkgTCA0NTAuNjIxMDk0IDM5OC4zMTY0MDYgTCA0NjIuMDcwMzEyIDM5Mi41ODk4NDQgWiBNIDUwNC4wNDI5NjkgMzg4Ljc3MzQzOCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMCIgZD0iTSAyOTAuMzUxNTYyIDI0OS40OTIxODggTCAyOTAuMzUxNTYyIDI1NS4yMTg3NSBMIDI3My4xNzk2ODggMjgzLjgzNTkzOCBMIDI1Ny45MTc5NjkgMzEwLjU0Njg3NSBMIDIzNi45Mjk2ODggMzU2LjMzOTg0NCBMIDIxNy44NTE1NjIgNDA5Ljc2MTcxOSBMIDIwNC40OTYwOTQgNDU3LjQ2MDkzOCBMIDE5NC45NTMxMjUgNTA3LjA3MDMxMiBMIDE5MS4xMzY3MTkgNTM3LjU5NzY1NiBMIDE4OS4yMzA0NjkgNTY4LjEyNSBMIDE4OS4yMzA0NjkgNjIzLjQ1MzEyNSBMIDE5NC45NTMxMjUgNjg0LjUwNzgxMiBMIDIwNC40OTYwOTQgNzM3LjkyOTY4OCBMIDIxNS45NDE0MDYgNzgzLjcyMjY1NiBMIDIzNS4wMjM0MzggODM5LjA1NDY4OCBMIDI1OS44MjQyMTkgODk2LjI5Mjk2OSBMIDI2OS4zNjMyODEgOTEzLjQ2NDg0NCBMIDI2OS4zNjMyODEgOTI4LjcyNjU2MiBMIDI1Ny45MTc5NjkgOTQ3LjgwODU5NCBMIDIzNi45Mjk2ODggOTcyLjYwOTM3NSBMIDIyMy41NzQyMTkgOTkzLjU5NzY1NiBMIDIxNS45NDE0MDYgMTAxNi40OTIxODggTCAyMTUuOTQxNDA2IDEwNDguOTI5Njg4IEwgMjIzLjU3NDIxOSAxMDg3LjA4OTg0NCBMIDIzNi45Mjk2ODggMTEyNS4yNDYwOTQgTCAyNTkuODI0MjE5IDExNzIuOTQ1MzEyIEwgMjgyLjcxODc1IDEyMDkuMTk5MjE5IEwgMjk0LjE2Nzk2OSAxMjI2LjM2NzE4OCBMIDI4Ni41MzUxNTYgMTIyMi41NTQ2ODggTCAyNjMuNjQwNjI1IDEyMDUuMzgyODEyIEwgMjQ0LjU2MjUgMTE4OC4yMTA5MzggTCAyMjkuMjk2ODc1IDExNzQuODU1NDY5IEwgMTk2Ljg2MzI4MSAxMTQyLjQxNzk2OSBMIDE3NS44NzUgMTExNS43MDcwMzEgTCAxNTQuODg2NzE5IDEwODcuMDg5ODQ0IEwgMTMwLjA4MjAzMSAxMDQ3LjAxOTUzMSBMIDExNC44MjAzMTIgMTAxNi40OTIxODggTCA5NS43NDIxODggOTcyLjYwOTM3NSBMIDg0LjI5Mjk2OSA5MzguMjY1NjI1IEwgNjkuMDI3MzQ0IDg4MS4wMjczNDQgTCA1OS40ODgyODEgODIxLjg4MjgxMiBMIDU1LjY3MTg3NSA3NzggTCA1NS42NzE4NzUgNzA1LjQ5NjA5NCBMIDU5LjQ4ODI4MSA2NjMuNTE5NTMxIEwgNjkuMDI3MzQ0IDYwNC4zNzUgTCA4NC4yOTI5NjkgNTQ1LjIyNjU2MiBMIDEwMS40NjQ4NDQgNDk3LjUyNzM0NCBMIDExOC42MzY3MTkgNDU5LjM3MTA5NCBMIDEzOS42MjUgNDE5LjMwMDc4MSBMIDE3MC4xNTIzNDQgMzczLjUxMTcxOSBMIDE4OS4yMzA0NjkgMzQ4LjcwNzAzMSBMIDIxMC4yMTg3NSAzMjMuOTA2MjUgTCAyMzguODM1OTM4IDI5My4zNzg5MDYgTCAyNjUuNTUwNzgxIDI2OC41NzQyMTkgWiBNIDI5MC4zNTE1NjIgMjQ5LjQ5MjE4OCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIzNDE3NiIgZD0iTSA1NS42NzE4NzUgMTA2MC4zNzUgTCA2MS4zOTg0MzggMTA2Ni4xMDE1NjIgTCA3OC41NzAzMTIgMTA5Mi44MTI1IEwgOTcuNjQ4NDM4IDExMTkuNTIzNDM4IEwgMTIyLjQ1MzEyNSAxMTUwLjA1MDc4MSBMIDE0NS4zNDc2NTYgMTE3NC44NTU0NjkgTCAxNzcuNzgxMjUgMTIwNy4yODkwNjIgTCAxOTguNzY5NTMxIDEyMjQuNDYwOTM4IEwgMjIzLjU3NDIxOSAxMjQzLjUzOTA2MiBMIDI1Ni4wMDc4MTIgMTI2NC41MjczNDQgTCAyOTAuMzUxNTYyIDEyODMuNjA5Mzc1IEwgMzIyLjc4OTA2MiAxMjk4Ljg3MTA5NCBMIDM3MC40ODgyODEgMTMxNi4wNDI5NjkgTCA0MTIuNDYwOTM4IDEzMjcuNDkyMTg4IEwgNDUwLjYyMTA5NCAxMzMzLjIxNDg0NCBMIDQ5Ni40MTAxNTYgMTMzMy4yMTQ4NDQgTCA1MjUuMDMxMjUgMTMyNS41ODIwMzEgTCA1NDIuMjAzMTI1IDEzMTQuMTM2NzE5IEwgNTQ5LjgzNTkzOCAxMjk4Ljg3MTA5NCBMIDU1OS4zNzUgMTMwMi42ODc1IEwgNTk5LjQ0MTQwNiAxMzIzLjY3NTc4MSBMIDY1Ni42Nzk2ODggMTM0OC40NzY1NjIgTCA2OTQuODM5ODQ0IDEzNjEuODM1OTM4IEwgNzM4LjcyMjY1NiAxMzc1LjE5MTQwNiBMIDc4Mi42MDU0NjkgMTM4NC43MzA0NjkgTCA4MjQuNTgyMDMxIDEzOTAuNDUzMTI1IEwgOTQyLjg3NSAxMzkwLjQ1MzEyNSBMIDkzNS4yNDIxODggMTM5Ni4xNzU3ODEgTCA4NzYuMDk3NjU2IDE0MjAuOTgwNDY5IEwgODE4Ljg1NTQ2OSAxNDQwLjA1ODU5NCBMIDc1NS44OTQ1MzEgMTQ1NS4zMjQyMTkgTCA2OTQuODM5ODQ0IDE0NjQuODYzMjgxIEwgNjUyLjg2MzI4MSAxNDY4LjY3OTY4OCBMIDU5My43MTg3NSAxNDY4LjY3OTY4OCBMIDU0Mi4yMDMxMjUgMTQ2Mi45NTcwMzEgTCA0OTAuNjg3NSAxNDUzLjQxNzk2OSBMIDQ0OC43MTQ4NDQgMTQ0MS45Njg3NSBMIDM5NS4yODkwNjIgMTQyMi44OTA2MjUgTCAzMzkuOTYwOTM4IDEzOTYuMTc1NzgxIEwgMzA3LjUyMzQzOCAxMzc3LjA5NzY1NiBMIDI3Ni45OTYwOTQgMTM1Ni4xMDkzNzUgTCAyNTQuMTAxNTYyIDEzMzguOTM3NSBMIDIzMy4xMTMyODEgMTMyMS43NjU2MjUgTCAyMTQuMDM1MTU2IDEzMDQuNTkzNzUgTCAxOTEuMTM2NzE5IDEyODMuNjA5Mzc1IEwgMTc3Ljc4MTI1IDEyNjguMzQzNzUgTCAxNTguNzAzMTI1IDEyNDcuMzU1NDY5IEwgMTMwLjA4MjAzMSAxMjA5LjE5OTIxOSBMIDEwOS4wOTc2NTYgMTE3Ni43NjE3MTkgTCA4Ni4xOTkyMTkgMTEzNi42OTUzMTIgTCA2Ny4xMjEwOTQgMTA5NC43MTg3NSBMIDU1LjY3MTg3NSAxMDY2LjEwMTU2MiBaIE0gNTUuNjcxODc1IDEwNjAuMzc1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjM2I5ZGNlIiBkPSJNIDc2My41MjczNDQgMTguNjMyODEyIEwgODUzLjE5OTIxOSAxOC42MzI4MTIgTCA5MDYuNjI1IDI0LjM1NTQ2OSBMIDk1OC4xMzY3MTkgMzMuODk0NTMxIEwgMTAxMS41NjI1IDQ5LjE2MDE1NiBMIDEwNTcuMzUxNTYyIDY2LjMyODEyNSBMIDEwNzQuNTIzNDM4IDczLjk2MDkzOCBMIDEwNjYuODkwNjI1IDc1Ljg3MTA5NCBMIDEwMTMuNDY4NzUgNjQuNDIxODc1IEwgOTgyLjk0MTQwNiA2MC42MDU0NjkgTCA5NTYuMjMwNDY5IDU4LjY5OTIxOSBMIDg3OS45MTAxNTYgNTguNjk5MjE5IEwgODM3LjkzNzUgNjIuNTE1NjI1IEwgNzkyLjE0NDUzMSA3MC4xNDQ1MzEgTCA3MzguNzIyNjU2IDgzLjUgTCA2ODEuNDg0Mzc1IDEwMi41ODIwMzEgTCA2MzcuNjAxNTYyIDEyMS42NjAxNTYgTCA1OTMuNzE4NzUgMTQ0LjU1NDY4OCBMIDU1MS43NDIxODggMTcxLjI2OTUzMSBMIDUxNS40OTIxODggMTk3Ljk4MDQ2OSBMIDQ4OC43ODEyNSAyMjAuODc1IEwgNDYzLjk3NjU2MiAyNDMuNzY5NTMxIEwgNDM1LjM1NTQ2OSAyNzQuMjk2ODc1IEwgNDIwLjA5Mzc1IDI5My4zNzg5MDYgTCAzOTcuMTk5MjE5IDMyMy45MDYyNSBMIDM3Ni4yMTA5MzggMzU2LjMzOTg0NCBMIDM0OS41IDQwNC4wMzkwNjIgTCAzMzQuMjM0Mzc1IDQzNi40NzI2NTYgTCAzMTMuMjQ2MDk0IDQ5MS44MDQ2ODggTCAyOTkuODkwNjI1IDU0My4zMjAzMTIgTCAyOTQuMTY3OTY5IDU3MS45Mzc1IEwgMjg4LjQ0NTMxMiA2MjMuNDUzMTI1IEwgMjg2LjUzNTE1NiA2NzQuOTY4NzUgTCAyODIuNzE4NzUgNjY3LjMzNTkzOCBMIDI3MS4yNzM0MzggNjIzLjQ1MzEyNSBMIDI2My42NDA2MjUgNTc3LjY2NDA2MiBMIDI1OS44MjQyMTkgNTMzLjc4MTI1IEwgMjU5LjgyNDIxOSA0ODkuODk4NDM4IEwgMjYzLjY0MDYyNSA0NDYuMDE1NjI1IEwgMjcxLjI3MzQzOCA0MDQuMDM5MDYyIEwgMjgyLjcxODc1IDM2Mi4wNjI1IEwgMjk3Ljk4NDM3NSAzMjEuOTk2MDk0IEwgMzE1LjE1NjI1IDI4NS43NDYwOTQgTCAzMzIuMzI4MTI1IDI1Ny4xMjUgTCAzNTUuMjIyNjU2IDIyNC42OTE0MDYgTCAzNzYuMjEwOTM4IDE5OS44ODY3MTkgTCAzOTMuMzgyODEyIDE4MC44MDg1OTQgTCA0MTQuMzcxMDk0IDE1OS44MjAzMTIgTCA0MzUuMzU1NDY5IDE0Mi42NDg0MzggTCA0NjIuMDcwMzEyIDEyMS42NjAxNTYgTCA0OTQuNTAzOTA2IDEwMC42NzE4NzUgTCA1MjUuMDMxMjUgODMuNSBMIDU2NS4wOTc2NTYgNjQuNDIxODc1IEwgNTk5LjQ0MTQwNiA1MS4wNjY0MDYgTCA2NDUuMjM0Mzc1IDM3LjcxMDkzOCBMIDY4Ny4yMDcwMzEgMjguMTcxODc1IEwgNzQyLjUzOTA2MiAyMC41MzkwNjIgWiBNIDc2My41MjczNDQgMTguNjMyODEyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZjI3NTNjIiBkPSJNIDEzMzAuMTkxNDA2IDI2NC43NTc4MTIgTCAxMzM3LjgyMDMxMiAyNjQuNzU3ODEyIEwgMTM0MS42MzY3MTkgMjc0LjI5Njg3NSBMIDEzNTguODA4NTk0IDI3Ni4yMDcwMzEgTCAxMzYyLjYyNSAyNzguMTEzMjgxIEwgMTM2NC41MzUxNTYgMzA2LjczNDM3NSBMIDEzNjQuNTM1MTU2IDM3My41MTE3MTkgTCAxMzU4LjgwODU5NCA0MTMuNTc4MTI1IEwgMTM1NC45OTIxODggNDIxLjIxMDkzOCBMIDEzMTEuMTA5Mzc1IDQwMi4xMjg5MDYgTCAxMjcxLjA0Mjk2OSAzNzkuMjM0Mzc1IEwgMTI0NC4zMzIwMzEgMzYwLjE1NjI1IEwgMTIzNC43OTI5NjkgMzUwLjYxNzE4OCBMIDEyMzYuNjk5MjE5IDMzOS4xNjc5NjkgTCAxMjQ2LjIzODI4MSAzMjMuOTA2MjUgTCAxMjY1LjMyMDMxMiAzMDYuNzM0Mzc1IEwgMTMxMy4wMTk1MzEgMjc2LjIwNzAzMSBaIE0gMTMzMC4xOTE0MDYgMjY0Ljc1NzgxMiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y1YmUzOCIgZD0iTSAxMjQwLjUxNTYyNSAxNDguMzcxMDk0IEwgMTI0NC4zMzIwMzEgMTQ4LjM3MTA5NCBMIDEyNTAuMDU0Njg4IDE4Mi43MTQ4NDQgTCAxMjUxLjk2NDg0NCAyMDEuNzk2ODc1IEwgMTI1MS45NjQ4NDQgMjM0LjIzMDQ2OSBMIDEyNDQuMzMyMDMxIDI4MC4wMTk1MzEgTCAxMjQwLjUxNTYyNSAyOTMuMzc4OTA2IEwgMTIyOS4wNjY0MDYgMjg5LjU2MjUgTCAxMTk0LjcyNjU2MiAyNzAuNDgwNDY5IEwgMTE1OC40NzI2NTYgMjUxLjQwMjM0NCBMIDExMjkuODU1NDY5IDIzMi4zMjQyMTkgTCAxMTIwLjMxNjQwNiAyMjQuNjkxNDA2IEwgMTEyMi4yMjI2NTYgMjE1LjE1MjM0NCBMIDExNDguOTMzNTk0IDE5Ni4wNzAzMTIgTCAxMTgxLjM3MTA5NCAxNzYuOTkyMTg4IEwgMTIyMS40Mzc1IDE1Ni4wMDM5MDYgWiBNIDEyNDAuNTE1NjI1IDE0OC4zNzEwOTQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNWEzM2MiIGQ9Ik0gMTM5NS4wNjI1IDIwOS40MjU3ODEgTCAxNDA0LjYwMTU2MiAyMTEuMzM1OTM4IEwgMTQ0Mi43NTc4MTIgMjI2LjU5NzY1NiBMIDE0NjkuNDcyNjU2IDI0My43Njk1MzEgTCAxNDc1LjE5NTMxMiAyNDcuNTg1OTM4IEwgMTQ3MS4zNzg5MDYgMjU1LjIxODc1IEwgMTQ1OC4wMjM0MzggMjY4LjU3NDIxOSBMIDE0MzMuMjE4NzUgMjg3LjY1MjM0NCBMIDE0MTQuMTQwNjI1IDI5Ny4xOTE0MDYgTCAxNDAwLjc4NTE1NiAyOTcuMTkxNDA2IEwgMTM5My4xNTIzNDQgMjg3LjY1MjM0NCBMIDEzODUuNTE5NTMxIDI3MC40ODA0NjkgTCAxMzcyLjE2NDA2MiAyNzAuNDgwNDY5IEwgMTM3NC4wNzQyMTkgMjU5LjAzNTE1NiBMIDEzODcuNDI5Njg4IDIzMC40MTQwNjIgTCAxMzkzLjE1MjM0NCAyMTEuMzM1OTM4IFogTSAxMzk1LjA2MjUgMjA5LjQyNTc4MSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y0OTc1NiIgZD0iTSAxMjkyLjAzMTI1IDExMi4xMjEwOTQgTCAxMzEzLjAxOTUzMSAxMTQuMDI3MzQ0IEwgMTM0OS4yNjk1MzEgMTI3LjM4MjgxMiBMIDEzNzAuMjU3ODEyIDEzOC44MzIwMzEgTCAxMzY4LjM0NzY1NiAxNDYuNDY0ODQ0IEwgMTM0Ny4zNjMyODEgMTcxLjI2OTUzMSBMIDEzMjYuMzc1IDE5MC4zNDc2NTYgTCAxMzExLjEwOTM3NSAxOTcuOTgwNDY5IEwgMTMwMS41NzAzMTIgMTk2LjA3MDMxMiBMIDEyOTAuMTIxMDk0IDE3OC44OTg0MzggTCAxMjg0LjM5ODQzOCAxNTYuMDAzOTA2IEwgMTI4NC4zOTg0MzggMTMzLjEwOTM3NSBaIE0gMTI5Mi4wMzEyNSAxMTIuMTIxMDk0ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=" alt="MINDSPARK"></div>
          <div style="font-size:22px;font-weight:700;letter-spacing:.06em;color:#fff;margin-bottom:4px">MINDSPARK</div>
          <div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:20px;letter-spacing:.08em;text-transform:uppercase">Assessment Platform</div>
          <div class="lottie-progress" style="margin:0 auto"><div class="lottie-progress-fill" style="background:#F57A39"></div></div>
        </div>
      </div>
    </div>
    <div class="info" style="margin-top:12px"><strong>Logo asset files</strong> Use <code>1.svg</code> as the icon mark wherever a small square logo is needed (sidebar, favicon, loading indicator overlay). Use <code>2.svg</code> (the full wordmark PNG) on the login page, onboarding screens, and email headers where the full &ldquo;MINDSPARK&rdquo; name needs to appear as a branded lockup. Both files should live at <code>public/brand/logo-mark.svg</code> and <code>public/brand/logo-wordmark.svg</code>.</div>
  </div>
</div>
<div class="hr"></div>

<!-- 01 PHILOSOPHY -->
<div id="phil" style="margin-bottom:60px">
  <div class="ey">01 &mdash; Design Philosophy</div>
  <h2 class="st">One Unified Light System</h2>
  <p class="sd">Both the MINDSPARK Admin Panel and Student Panel share the Donezo-inspired Forest Green light design language. The MINDSPARK brand palette (navy, orange, sky blue, yellow) lives in identity surfaces. The Forest Green system drives all interactive UI.</p>
  <div class="g2">
    <div class="card" style="border-left:4px solid var(--g600)">
      <div class="pl pla">Admin Panel</div>
      <p style="font-size:15px;font-weight:600;margin:8px 0 6px">Light &middot; Professional SaaS</p>
      <p style="font-size:13px;color:var(--t2);line-height:1.7">Dense data tables, sparklines, pipeline steppers, bulk operations, live monitoring. Admins managing students across multiple levels and cohorts. MINDSPARK logo mark in sidebar at 32px.</p>
    </div>
    <div class="card" style="border-left:4px solid var(--g600)">
      <div class="pl pls">Student Panel</div>
      <p style="font-size:15px;font-weight:600;margin:8px 0 6px">Light &middot; Focused &middot; Assessment-Optimised</p>
      <p style="font-size:13px;color:var(--t2);line-height:1.7">Same light system, stripped of all peripheral UI during exams. Students ages 6&ndash;18. MINDSPARK logo mark in sidebar. Navy brand background on the loading screen. Crimson (#991B1B) for negative numbers only.</p>
    </div>
  </div>
</div>
<div class="hr"></div>

<!-- 02 COLOURS -->
<div id="col" style="margin-bottom:60px">
  <div class="ey">02 &mdash; Foundation</div>
  <h2 class="st">Colour System &mdash; Unified Light</h2>
  <div class="card" style="margin-bottom:14px">
    <p class="ctitle" style="margin-bottom:14px">UI Primary &mdash; Forest Green</p>
    <div class="srow">
      <div class="sw"><div class="swb" style="background:#0D2B1F"></div><div class="swi"><span class="swn">900</span><span class="swh">#0D2B1F</span></div></div>
      <div class="sw"><div class="swb" style="background:#1A3829"></div><div class="swi"><span class="swn">800 &#9733;</span><span class="swh">#1A3829</span></div></div>
      <div class="sw"><div class="swb" style="background:#1E4A35"></div><div class="swi"><span class="swn">700</span><span class="swh">#1E4A35</span></div></div>
      <div class="sw"><div class="swb" style="background:#2D6A4F"></div><div class="swi"><span class="swn">600</span><span class="swh">#2D6A4F</span></div></div>
      <div class="sw"><div class="swb" style="background:#40916C"></div><div class="swi"><span class="swn">500 &#9733;</span><span class="swh">#40916C</span></div></div>
      <div class="sw"><div class="swb" style="background:#52B788"></div><div class="swi"><span class="swn">400</span><span class="swh">#52B788</span></div></div>
      <div class="sw"><div class="swb" style="background:#74C69D"></div><div class="swi"><span class="swn">300</span><span class="swh">#74C69D</span></div></div>
      <div class="sw"><div class="swb" style="background:#B7E4C7"></div><div class="swi"><span class="swn">200</span><span class="swh">#B7E4C7</span></div></div>
      <div class="sw"><div class="swb" style="background:#EFFAF4;border:1px solid #D8F3DC"></div><div class="swi"><span class="swn">50 &#9733;</span><span class="swh">#EFFAF4</span></div></div>
    </div>
    <div class="srow">
      <div class="sw"><div class="swb" style="background:#0F172A"></div><div class="swi"><span class="swn">text-1</span><span class="swh">#0F172A</span></div></div>
      <div class="sw"><div class="swb" style="background:#475569"></div><div class="swi"><span class="swn">text-2</span><span class="swh">#475569</span></div></div>
      <div class="sw"><div class="swb" style="background:#94A3B8"></div><div class="swi"><span class="swn">text-3</span><span class="swh">#94A3B8</span></div></div>
      <div class="sw"><div class="swb" style="background:#F8FAFC;border:1px solid #E2E8F0"></div><div class="swi"><span class="swn">page &#9733;</span><span class="swh">#F8FAFC</span></div></div>
      <div class="sw"><div class="swb" style="background:#FFFFFF;border:1px solid #E2E8F0"></div><div class="swi"><span class="swn">card</span><span class="swh">#FFFFFF</span></div></div>
      <div class="sw"><div class="swb" style="background:#E2E8F0"></div><div class="swi"><span class="swn">border</span><span class="swh">#E2E8F0</span></div></div>
      <div class="sw"><div class="swb" style="background:#DCFCE7"></div><div class="swi"><span class="swn">ok-bg</span><span class="swh">#DCFCE7</span></div></div>
      <div class="sw"><div class="swb" style="background:#FEF9C3"></div><div class="swi"><span class="swn">warn-bg</span><span class="swh">#FEF9C3</span></div></div>
      <div class="sw"><div class="swb" style="background:#FEE2E2"></div><div class="swi"><span class="swn">err-bg</span><span class="swh">#FEE2E2</span></div></div>
      <div class="sw"><div class="swb" style="background:#EF4444"></div><div class="swi"><span class="swn">LIVE</span><span class="swh">#EF4444</span></div></div>
    </div>
    <p class="ctitle" style="margin-bottom:10px;margin-top:4px">Student Arithmetic Crimson</p>
    <div class="srow">
      <div class="sw"><div class="swb" style="background:#991B1B"></div><div class="swi"><span class="swn">s-neg &#9733;</span><span class="swh">#991B1B</span></div></div>
      <div class="sw"><div class="swb" style="background:#FEF2F2;border:1px solid #FECACA"></div><div class="swi"><span class="swn">err-bg</span><span class="swh">#FEF2F2</span></div></div>
      <div class="sw"><div class="swb" style="background:#FFFBEB;border:1px solid #FDE68A"></div><div class="swi"><span class="swn">tmr-urg</span><span class="swh">#FFFBEB</span></div></div>
      <div class="sw"><div class="swb" style="background:#F59E0B"></div><div class="swi"><span class="swn">amber</span><span class="swh">#F59E0B</span></div></div>
    </div>
  </div>
</div>
<div class="hr"></div>

<!-- 03 CRIMSON RULE -->
<div id="crimson" style="margin-bottom:60px">
  <div class="ey">03 &mdash; Critical Rule</div>
  <h2 class="st">The Crimson Rule</h2>
  <div class="danger"><strong>Crimson #991B1B is used exclusively for negative numbers in arithmetic displays.</strong> Negative operands in Flash Anzan Phase 2 flash sequences and EXAM vertical equations. Never used for wrong answers, errors, failed states, or destructive UI. Using it for wrong answers would conflate &ldquo;this number is negative&rdquo; with &ldquo;you got this wrong&rdquo; &mdash; cognitively harmful for young students reviewing results.</div>
  <div class="g2" style="margin-top:14px">
    <div class="card" style="border-top:3px solid #991B1B">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#991B1B;margin-bottom:14px">&#10003; Crimson IS used for</p>
      <div style="background:var(--page);border-radius:10px;padding:14px;text-align:center;margin-bottom:10px">
        <div style="font-family:var(--fm);font-size:48px;font-weight:700;color:#991B1B;font-variant-numeric:tabular-nums">-23</div>
        <div style="font-size:11px;color:var(--t3);margin-top:4px">Flash Anzan &mdash; negative operand Phase 2</div>
      </div>
      <div class="exbox" style="max-width:100%">
        <div style="padding:8px 18px 4px;font-size:9px;color:var(--t3);text-align:right;text-transform:uppercase;letter-spacing:.08em;font-weight:700">EXAM equation</div>
        <div class="exeq">+&nbsp;&nbsp;&nbsp;345</div>
        <div class="exeq exalt" style="color:#991B1B">&minus;&nbsp;&nbsp;&nbsp;194</div>
        <div class="exeq">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;82</div>
      </div>
    </div>
    <div class="card" style="border-top:3px solid var(--b)">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--er-tx);margin-bottom:14px">&#10007; Crimson NOT used for (use danger palette instead)</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--page);border-radius:8px"><div class="mq ng" style="min-height:44px;font-size:16px;padding:8px 12px;flex:1">168</div><div style="font-size:12px;color:var(--t2)">Wrong MCQ answer uses danger palette</div></div>
        <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--page);border-radius:8px"><button class="abd" style="flex-shrink:0">Force Close</button><div style="font-size:12px;color:var(--t2)">Destructive button uses #DC2626</div></div>
        <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--page);border-radius:8px"><div class="bdg bfl">Failed</div><div style="font-size:12px;color:var(--t2)">Grade badge uses danger semantic</div></div>
      </div>
    </div>
  </div>
</div>
<div class="hr"></div>

<!-- 04 TYPOGRAPHY -->
<div id="typ" style="margin-bottom:60px">
  <div class="ey">04 &mdash; Foundation</div>
  <h2 class="st">Typography System</h2>
  <p class="sd">DM Sans for all UI text. DM Mono for every number, timer, equation, and shortcut without exception. The MINDSPARK brand name itself always uses DM Sans Bold in UI contexts &mdash; the wordmark SVG (2.svg) is used on brand surfaces only.</p>
  <div class="card" style="margin-bottom:14px">
    <div style="border-bottom:1px solid var(--b);padding:14px 0;display:flex;align-items:baseline;gap:20px;flex-wrap:wrap">
      <div style="font-size:36px;font-weight:700;color:#0F172A">MINDSPARK Dashboard</div>
      <div style="font-size:11px;font-family:var(--fm);color:var(--t3)">DM Sans &middot; 36px &middot; 700 &middot; Page title</div>
    </div>
    <div style="border-bottom:1px solid var(--b);padding:14px 0;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="font-family:var(--fm);font-size:72px;font-weight:700;color:#0F172A;line-height:1;font-variant-numeric:tabular-nums">47</div>
      <div style="font-size:11px;font-family:var(--fm);color:var(--t3)">DM Mono &middot; clamp(96px,30vh,180px) &middot; 700 &middot; Flash number &mdash; transition:none</div>
    </div>
    <div style="border-bottom:1px solid var(--b);padding:14px 0;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="font-family:var(--fm);font-size:72px;font-weight:700;color:#991B1B;line-height:1;font-variant-numeric:tabular-nums">-23</div>
      <div style="font-size:11px;font-family:var(--fm);color:var(--t3)">DM Mono &middot; same &middot; #991B1B &middot; NEGATIVE numbers only &mdash; equiluminant</div>
    </div>
    <div style="border-bottom:1px solid var(--b);padding:14px 0;display:flex;align-items:baseline;gap:20px;flex-wrap:wrap">
      <div style="font-family:var(--fm);font-size:30px;font-weight:600;color:var(--g800);font-variant-numeric:tabular-nums">02:47</div>
      <div style="font-size:11px;font-family:var(--fm);color:var(--t3)">DM Mono &middot; 30px &middot; green-800 &middot; Exam timer</div>
    </div>
    <div style="padding:14px 0;display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap">
      <div style="font-family:var(--fm);font-size:22px;font-weight:600;color:var(--t1);text-align:right;line-height:1.9;font-variant-numeric:tabular-nums">+345<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;82<br><span style="color:#991B1B">&minus;194</span></div>
      <div style="font-size:11px;font-family:var(--fm);color:var(--t3);margin-top:4px">DM Mono &middot; right-aligned &middot; tabular-nums &middot; EXAM equations</div>
    </div>
  </div>
</div>
<div class="hr"></div>

<!-- 05 ICONS -->
<div id="icons" style="margin-bottom:60px">
  <div class="ey">05 &mdash; Foundation</div>
  <h2 class="st">Icon System &mdash; Lucide React</h2>
  <div class="ms-box"><strong>Install</strong> <code>npm install lucide-react</code> &mdash; primary icon library. Use <code>@phosphor-icons/react</code> as secondary fallback for icons Lucide doesn&rsquo;t have.</div>
  <div class="card" style="margin-bottom:14px">
    <p class="ctitle" style="margin-bottom:14px">Admin Panel Icons</p>
    <div class="icon-grid">
      <div class="ic"><div class="ic-box">&#9866;</div>Dashboard<br><code style="font-size:9px">LayoutDashboard</code></div>
      <div class="ic"><div class="ic-box">&#9776;</div>Levels<br><code style="font-size:9px">Layers</code></div>
      <div class="ic"><div class="ic-box">&#128101;</div>Students<br><code style="font-size:9px">Users</code></div>
      <div class="ic"><div class="ic-box">&#128221;</div>Assess.<br><code style="font-size:9px">ClipboardList</code></div>
      <div class="ic"><div class="ic-box">&#128225;</div>Monitor<br><code style="font-size:9px">Radio</code></div>
      <div class="ic"><div class="ic-box">&#128202;</div>Results<br><code style="font-size:9px">BarChart2</code></div>
      <div class="ic"><div class="ic-box">&#128226;</div>Announce<br><code style="font-size:9px">Megaphone</code></div>
      <div class="ic"><div class="ic-box">&#9881;</div>Settings<br><code style="font-size:9px">Settings</code></div>
      <div class="ic"><div class="ic-box">&#8618;</div>Logout<br><code style="font-size:9px">LogOut</code></div>
    </div>
  </div>
  <div class="card">
    <p class="ctitle" style="margin-bottom:14px">Student Panel Icons</p>
    <div class="icon-grid">
      <div class="ic"><div class="ic-box">&#9658;</div>LIVE<br><code style="font-size:9px">Play</code></div>
      <div class="ic"><div class="ic-box">&#128274;</div>Locked<br><code style="font-size:9px">Lock</code></div>
      <div class="ic"><div class="ic-box">&#9201;</div>Scheduled<br><code style="font-size:9px">Clock</code></div>
      <div class="ic"><div class="ic-box">&#9889;</div>Flash TEST<br><code style="font-size:9px">Zap</code></div>
      <div class="ic"><div class="ic-box">&#9638;</div>Vertical EXAM<br><code style="font-size:9px">AlignRight</code></div>
      <div class="ic"><div class="ic-box">&#10003;</div>Correct<br><code style="font-size:9px">CheckCircle2</code></div>
      <div class="ic"><div class="ic-box">&#10007;</div>Incorrect<br><code style="font-size:9px">XCircle</code></div>
      <div class="ic"><div class="ic-box">&#9679;</div>Offline<br><code style="font-size:9px">WifiOff</code></div>
    </div>
  </div>
</div>
<div class="hr"></div>

<!-- 06 LOADER -->
<div id="loader" style="margin-bottom:60px">
  <div class="ey">06 &mdash; Loading States</div>
  <h2 class="st">Lottie Loading Indicator</h2>
  <p class="sd">The <code>abacus-loader.json</code> Lottie animation is the primary loading indicator for async operations. For in-page data loading, use skeleton screens instead (see Section 07).</p>
  <div class="g3" style="margin-bottom:14px">
    <div class="lottie-page" style="background:#204074;border:none">
      <div class="brand-hero-logo" style="margin:0 auto 16px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwMCIgem9vbUFuZFBhbj0ibWFnbmlmeSIgdmlld0JveD0iMCAwIDE1MDAgMTQ5OS45OTk5MzMiIGhlaWdodD0iMjAwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48cmVjdCB4PSItMTUwIiB3aWR0aD0iMTgwMCIgZmlsbD0iI2ZlZmVmZSIgeT0iLTE0OS45OTk5OTMiIGhlaWdodD0iMTc5OS45OTk5MiIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSAxMTAxLjIzNDM3NSAzODguNzczNDM4IEwgMTEzMS43NjE3MTkgMzg4Ljc3MzQzOCBMIDExODkgMzkyLjU4OTg0NCBMIDEyMDYuMTcxODc1IDM5Ni40MDYyNSBMIDEyMTcuNjIxMDk0IDQwNC4wMzkwNjIgTCAxMjIzLjM0Mzc1IDQxNy4zOTQ1MzEgTCAxMjI5LjA2NjQwNiA0ODQuMTcxODc1IEwgMTI0Mi40MjU3ODEgNzQzLjY1NjI1IEwgMTI0OC4xNDg0MzggODM1LjIzODI4MSBMIDEyNjEuNTAzOTA2IDk3Mi42MDkzNzUgTCAxMjYzLjQxMDE1NiAxMDAxLjIzMDQ2OSBMIDEyNjMuNDEwMTU2IDEwMjkuODQ3NjU2IEwgMTI1MC4wNTQ2ODggMTA1MC44MzU5MzggTCAxMjMwLjk3NjU2MiAxMDY2LjEwMTU2MiBMIDEyMDkuOTg4MjgxIDEwNzMuNzMwNDY5IEwgMTE5Ni42MzI4MTIgMTA3NS42NDA2MjUgTCAxMTEwLjc3MzQzOCAxMDc1LjY0MDYyNSBMIDExMDMuMTQ0NTMxIDk1MS42MjEwOTQgTCAxMDk3LjQxNzk2OSA4NTguMTMyODEyIEwgMTA5My42MDE1NjIgNzU4LjkxNzk2OSBMIDEwOTEuNjk1MzEyIDY3Ni44NzUgTCAxMDg1Ljk3MjY1NiA2OTIuMTQwNjI1IEwgMTA1NS40NDUzMTIgNzk3LjA3ODEyNSBMIDEwMTMuNDY4NzUgOTI2LjgyMDMxMiBMIDk4Ni43NTc4MTIgMTAwOC44NjMyODEgTCA5NjkuNTg1OTM4IDEwNTguNDY4NzUgTCA5NTguMTM2NzE5IDEwNzEuODI0MjE5IEwgOTQwLjk2NDg0NCAxMDc5LjQ1NzAzMSBMIDkyMy43OTI5NjkgMTA4My4yNzM0MzggTCA4OTUuMTc1NzgxIDEwODMuMjczNDM4IEwgODY0LjY0ODQzOCAxMDc3LjU0Njg3NSBMIDg0NS41NzAzMTIgMTA2OC4wMDc4MTIgTCA4MzcuOTM3NSAxMDU4LjQ2ODc1IEwgODI2LjQ4ODI4MSAxMDI3Ljk0MTQwNiBMIDc5NS45NjA5MzggOTMyLjU0Mjk2OSBMIDc3My4wNjY0MDYgODU2LjIyNjU2MiBMIDc2NS40MzM1OTQgODI5LjUxMTcxOSBMIDc2Ny4zNDM3NSA4MTQuMjUgTCA3OTAuMjM4MjgxIDczNy45Mjk2ODggTCA4MjYuNDg4MjgxIDYwOC4xOTE0MDYgTCA4MzYuMDI3MzQ0IDU3My44NDc2NTYgTCA4MzkuODQzNzUgNTc5LjU3MDMxMiBMIDg2NC42NDg0MzggNjczLjA2MjUgTCA5MDAuODk4NDM4IDgwMi44MDA3ODEgTCA5MDQuNzE0ODQ0IDgxNi4xNTYyNSBMIDkwNC43MTQ4NDQgODIzLjc4OTA2MiBMIDkwOC41MzEyNSA4MjMuNzg5MDYyIEwgOTEyLjM0NzY1NiA4MDYuNjE3MTg4IEwgOTUwLjUwNzgxMiA2OTcuODYzMjgxIEwgOTg4LjY2NDA2MiA1OTIuOTI1NzgxIEwgMTAxMy40Njg3NSA1MjIuMzMyMDMxIEwgMTA0MC4xNzk2ODggNDQ3LjkyMTg3NSBMIDEwNTUuNDQ1MzEyIDQxNy4zOTQ1MzEgTCAxMDY4LjgwMDc4MSA0MDIuMTI4OTA2IEwgMTA4MC4yNDYwOTQgMzk0LjUgWiBNIDExMDEuMjM0Mzc1IDM4OC43NzM0MzggIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNTdhMzkiIGQ9Ik0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSBMIDEzODEuNzAzMTI1IDgzMy4zMjgxMjUgTCAxMzgzLjYxMzI4MSA4NTIuNDEwMTU2IEwgMTM4My42MTMyODEgOTAzLjkyNTc4MSBMIDEzNzkuNzk2ODc1IDk0My45OTIxODggTCAxMzY4LjM0NzY1NiA5OTkuMzIwMzEyIEwgMTM1Ni45MDIzNDQgMTAzNy40ODA0NjkgTCAxMzQzLjU0Njg3NSAxMDczLjczMDQ2OSBMIDEzMjguMjgxMjUgMTEwNi4xNjc5NjkgTCAxMzA3LjI5Mjk2OSAxMTQyLjQxNzk2OSBMIDEyODguMjE0ODQ0IDExNjkuMTI4OTA2IEwgMTI2Ny4yMjY1NjIgMTE5My45MzM1OTQgTCAxMjUwLjA1NDY4OCAxMjEzLjAxMTcxOSBMIDEyMzAuOTc2NTYyIDEyMzIuMDkzNzUgTCAxMjA5Ljk4ODI4MSAxMjQ5LjI2NTYyNSBMIDExODEuMzcxMDk0IDEyNzAuMjUzOTA2IEwgMTE1Ni41NjY0MDYgMTI4NS41MTU2MjUgTCAxMTEyLjY4MzU5NCAxMzA4LjQxMDE1NiBMIDEwODAuMjQ2MDk0IDEzMjEuNzY1NjI1IEwgMTAzOC4yNzM0MzggMTMzNS4xMjEwOTQgTCA5OTAuNTc0MjE5IDEzNDYuNTcwMzEyIEwgOTMxLjQyNTc4MSAxMzU0LjIwMzEyNSBMIDgzNC4xMjEwOTQgMTM1NC4yMDMxMjUgTCA3ODguMzI4MTI1IDEzNDguNDc2NTYyIEwgNzM0LjkwNjI1IDEzMzcuMDMxMjUgTCA2OTYuNzQ2MDk0IDEzMjUuNTgyMDMxIEwgNjYwLjQ5NjA5NCAxMzEyLjIyNjU2MiBMIDYyMC40Mjk2ODggMTI5NS4wNTQ2ODggTCA1NzguNDUzMTI1IDEyNzIuMTYwMTU2IEwgNTQ0LjEwOTM3NSAxMjQ5LjI2NTYyNSBMIDUyMy4xMjUgMTIzNCBMIDUwNC4wNDI5NjkgMTIxOC43MzgyODEgTCA0ODEuMTQ4NDM4IDExOTcuNzUgTCA0NjUuODgyODEyIDExODQuMzk0NTMxIEwgNDQ0Ljg5ODQzOCAxMTYzLjQwNjI1IEwgNDMxLjU0Mjk2OSAxMTQ4LjE0NDUzMSBMIDQwNi43MzgyODEgMTExOS41MjM0MzggTCAzNzguMTE3MTg4IDEwODEuMzYzMjgxIEwgMzUzLjMxNjQwNiAxMDQzLjIwMzEyNSBMIDMzNC4yMzQzNzUgMTAwOC44NjMyODEgTCAzMTguOTcyNjU2IDk4MC4yNDIxODggTCAzMTMuMjQ2MDk0IDk2My4wNzAzMTIgTCAzMjIuNzg5MDYyIDk3Mi42MDkzNzUgTCAzNDcuNTg5ODQ0IDk5OS4zMjAzMTIgTCAzNjAuOTQ1MzEyIDEwMTQuNTg1OTM4IEwgNDA0LjgyODEyNSAxMDU4LjQ2ODc1IEwgNDIwLjA5Mzc1IDEwNzEuODI0MjE5IEwgNDQ0Ljg5ODQzOCAxMDkyLjgxMjUgTCA0NjkuNjk5MjE5IDExMTEuODkwNjI1IEwgNTAwLjIyNjU2MiAxMTMyLjg3ODkwNiBMIDUyOC44NDc2NTYgMTE1MC4wNTA3ODEgTCA1NjguOTE0MDYyIDExNzEuMDM5MDYyIEwgNjI4LjA2MjUgMTE5NS44Mzk4NDQgTCA2NzUuNzYxNzE5IDEyMTEuMTA1NDY5IEwgNzIxLjU1MDc4MSAxMjIyLjU1NDY4OCBMIDc3OC43ODkwNjIgMTIzMi4wOTM3NSBMIDgwMS42ODM1OTQgMTIzNCBMIDg5MS4zNTkzNzUgMTIzNCBMIDkyNS43MDMxMjUgMTIzMC4xODM1OTQgTCA5NzkuMTI1IDEyMjAuNjQ0NTMxIEwgMTAyNi44MjQyMTkgMTIwNy4yODkwNjIgTCAxMDYzLjA3NDIxOSAxMTkzLjkzMzU5NCBMIDExMDMuMTQ0NTMxIDExNzYuNzYxNzE5IEwgMTE0NS4xMTcxODggMTE1My44NjcxODggTCAxMTc1LjY0NDUzMSAxMTM0Ljc4NTE1NiBMIDEyMDkuOTg4MjgxIDExMDguMDc0MjE5IEwgMTIzNC43OTI5NjkgMTA4NS4xNzk2ODggTCAxMjY1LjMyMDMxMiAxMDU0LjY1MjM0NCBMIDEyOTAuMTIxMDk0IDEwMjIuMjE4NzUgTCAxMzA5LjIwMzEyNSA5OTUuNTA3ODEyIEwgMTMzMC4xOTE0MDYgOTU5LjI1MzkwNiBMIDEzNTEuMTc1NzgxIDkxNS4zNzEwOTQgTCAxMzY4LjM0NzY1NiA4NjcuNjcxODc1IEwgMTM3NS45ODA0NjkgODM5LjA1NDY4OCBaIE0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMSIgZD0iTSA3NjUuNDMzNTk0IDM5MC42ODM1OTQgTCA4NTUuMTA5Mzc1IDM5MC42ODM1OTQgTCA4NTEuMjkyOTY5IDQxMy41NzgxMjUgTCA4MDUuNSA1ODMuMzg2NzE5IEwgNzY1LjQzMzU5NCA3MjguMzkwNjI1IEwgNzMzIDg0Mi44NzEwOTQgTCA3MDAuNTYyNSA5NTcuMzQ3NjU2IEwgNjczLjg1MTU2MiAxMDQ4LjkyOTY4OCBMIDY2Ni4yMTg3NSAxMDY0LjE5MTQwNiBMIDY1NC43NzM0MzggMTA3MS44MjQyMTkgTCA2MzkuNTA3ODEyIDEwNzUuNjQwNjI1IEwgNDk2LjQxMDE1NiAxMDc1LjY0MDYyNSBMIDUwMC4yMjY1NjIgMTA1OC40Njg3NSBMIDU0MC4yOTY4NzUgOTMyLjU0Mjk2OSBMIDU3OC40NTMxMjUgODA2LjYxNzE4OCBMIDYwNy4wNzQyMTkgNzExLjIxODc1IEwgNjM1LjY5MTQwNiA2MTIuMDA3ODEyIEwgNjY0LjMxMjUgNTA3LjA3MDMxMiBMIDY4My4zOTA2MjUgNDM4LjM4MjgxMiBMIDY5Mi45MzM1OTQgNDEzLjU3ODEyNSBMIDcwMi40NzI2NTYgNDAyLjEyODkwNiBMIDcxNy43MzQzNzUgMzk0LjUgTCA3MzEuMDg5ODQ0IDM5Mi41ODk4NDQgWiBNIDc2NS40MzM1OTQgMzkwLjY4MzU5NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSA1MDQuMDQyOTY5IDM4OC43NzM0MzggTCA1NTMuNjUyMzQ0IDM4OC43NzM0MzggTCA1NzIuNzMwNDY5IDM5Mi41ODk4NDQgTCA1OTUuNjI1IDQwNC4wMzkwNjIgTCA2MDcuMDc0MjE5IDQxMy41NzgxMjUgTCA2MjIuMzM1OTM4IDQzNC41NjY0MDYgTCA2MzMuNzg1MTU2IDQ1Ny40NjA5MzggTCA2MzcuNjAxNTYyIDQ2OC45MTAxNTYgTCA2MzUuNjkxNDA2IDQ4NC4xNzE4NzUgTCA2MDguOTgwNDY5IDU4Ny4yMDMxMjUgTCA1ODQuMTc5Njg4IDY4MC42OTE0MDYgTCA1NzguNDUzMTI1IDY5NS45NTcwMzEgTCA1NzQuNjM2NzE5IDY5MC4yMzQzNzUgTCA1NTcuNDY0ODQ0IDY0MC42MjUgTCA1NDkuODM1OTM4IDc0OS4zNzg5MDYgTCA1NDYuMDE5NTMxIDc3OS45MDYyNSBMIDUxOS4zMDg1OTQgODc3LjIxMDkzOCBMIDQ3Ny4zMzIwMzEgMTAxOC40MDIzNDQgTCA0NjIuMDcwMzEyIDEwNjkuOTE3OTY5IEwgNDQ2LjgwNDY4OCAxMDU4LjQ2ODc1IEwgNDI1LjgxNjQwNiAxMDQxLjI5Njg3NSBMIDQwMS4wMTU2MjUgMTAxOC40MDIzNDQgTCAzNzYuMjEwOTM4IDk5My41OTc2NTYgTCAzNzguMTE3MTg4IDk2Ni44ODY3MTkgTCAzOTcuMTk5MjE5IDgwOC41MjczNDQgTCA0MTYuMjc3MzQ0IDYzMi45OTIxODggTCA0MzcuMjY1NjI1IDQyNi45MzM1OTQgTCA0NDEuMDgyMDMxIDQwOS43NjE3MTkgTCA0NTAuNjIxMDk0IDM5OC4zMTY0MDYgTCA0NjIuMDcwMzEyIDM5Mi41ODk4NDQgWiBNIDUwNC4wNDI5NjkgMzg4Ljc3MzQzOCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMCIgZD0iTSAyOTAuMzUxNTYyIDI0OS40OTIxODggTCAyOTAuMzUxNTYyIDI1NS4yMTg3NSBMIDI3My4xNzk2ODggMjgzLjgzNTkzOCBMIDI1Ny45MTc5NjkgMzEwLjU0Njg3NSBMIDIzNi45Mjk2ODggMzU2LjMzOTg0NCBMIDIxNy44NTE1NjIgNDA5Ljc2MTcxOSBMIDIwNC40OTYwOTQgNDU3LjQ2MDkzOCBMIDE5NC45NTMxMjUgNTA3LjA3MDMxMiBMIDE5MS4xMzY3MTkgNTM3LjU5NzY1NiBMIDE4OS4yMzA0NjkgNTY4LjEyNSBMIDE4OS4yMzA0NjkgNjIzLjQ1MzEyNSBMIDE5NC45NTMxMjUgNjg0LjUwNzgxMiBMIDIwNC40OTYwOTQgNzM3LjkyOTY4OCBMIDIxNS45NDE0MDYgNzgzLjcyMjY1NiBMIDIzNS4wMjM0MzggODM5LjA1NDY4OCBMIDI1OS44MjQyMTkgODk2LjI5Mjk2OSBMIDI2OS4zNjMyODEgOTEzLjQ2NDg0NCBMIDI2OS4zNjMyODEgOTI4LjcyNjU2MiBMIDI1Ny45MTc5NjkgOTQ3LjgwODU5NCBMIDIzNi45Mjk2ODggOTcyLjYwOTM3NSBMIDIyMy41NzQyMTkgOTkzLjU5NzY1NiBMIDIxNS45NDE0MDYgMTAxNi40OTIxODggTCAyMTUuOTQxNDA2IDEwNDguOTI5Njg4IEwgMjIzLjU3NDIxOSAxMDg3LjA4OTg0NCBMIDIzNi45Mjk2ODggMTEyNS4yNDYwOTQgTCAyNTkuODI0MjE5IDExNzIuOTQ1MzEyIEwgMjgyLjcxODc1IDEyMDkuMTk5MjE5IEwgMjk0LjE2Nzk2OSAxMjI2LjM2NzE4OCBMIDI4Ni41MzUxNTYgMTIyMi41NTQ2ODggTCAyNjMuNjQwNjI1IDEyMDUuMzgyODEyIEwgMjQ0LjU2MjUgMTE4OC4yMTA5MzggTCAyMjkuMjk2ODc1IDExNzQuODU1NDY5IEwgMTk2Ljg2MzI4MSAxMTQyLjQxNzk2OSBMIDE3NS44NzUgMTExNS43MDcwMzEgTCAxNTQuODg2NzE5IDEwODcuMDg5ODQ0IEwgMTMwLjA4MjAzMSAxMDQ3LjAxOTUzMSBMIDExNC44MjAzMTIgMTAxNi40OTIxODggTCA5NS43NDIxODggOTcyLjYwOTM3NSBMIDg0LjI5Mjk2OSA5MzguMjY1NjI1IEwgNjkuMDI3MzQ0IDg4MS4wMjczNDQgTCA1OS40ODgyODEgODIxLjg4MjgxMiBMIDU1LjY3MTg3NSA3NzggTCA1NS42NzE4NzUgNzA1LjQ5NjA5NCBMIDU5LjQ4ODI4MSA2NjMuNTE5NTMxIEwgNjkuMDI3MzQ0IDYwNC4zNzUgTCA4NC4yOTI5NjkgNTQ1LjIyNjU2MiBMIDEwMS40NjQ4NDQgNDk3LjUyNzM0NCBMIDExOC42MzY3MTkgNDU5LjM3MTA5NCBMIDEzOS42MjUgNDE5LjMwMDc4MSBMIDE3MC4xNTIzNDQgMzczLjUxMTcxOSBMIDE4OS4yMzA0NjkgMzQ4LjcwNzAzMSBMIDIxMC4yMTg3NSAzMjMuOTA2MjUgTCAyMzguODM1OTM4IDI5My4zNzg5MDYgTCAyNjUuNTUwNzgxIDI2OC41NzQyMTkgWiBNIDI5MC4zNTE1NjIgMjQ5LjQ5MjE4OCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIzNDE3NiIgZD0iTSA1NS42NzE4NzUgMTA2MC4zNzUgTCA2MS4zOTg0MzggMTA2Ni4xMDE1NjIgTCA3OC41NzAzMTIgMTA5Mi44MTI1IEwgOTcuNjQ4NDM4IDExMTkuNTIzNDM4IEwgMTIyLjQ1MzEyNSAxMTUwLjA1MDc4MSBMIDE0NS4zNDc2NTYgMTE3NC44NTU0NjkgTCAxNzcuNzgxMjUgMTIwNy4yODkwNjIgTCAxOTguNzY5NTMxIDEyMjQuNDYwOTM4IEwgMjIzLjU3NDIxOSAxMjQzLjUzOTA2MiBMIDI1Ni4wMDc4MTIgMTI2NC41MjczNDQgTCAyOTAuMzUxNTYyIDEyODMuNjA5Mzc1IEwgMzIyLjc4OTA2MiAxMjk4Ljg3MTA5NCBMIDM3MC40ODgyODEgMTMxNi4wNDI5NjkgTCA0MTIuNDYwOTM4IDEzMjcuNDkyMTg4IEwgNDUwLjYyMTA5NCAxMzMzLjIxNDg0NCBMIDQ5Ni40MTAxNTYgMTMzMy4yMTQ4NDQgTCA1MjUuMDMxMjUgMTMyNS41ODIwMzEgTCA1NDIuMjAzMTI1IDEzMTQuMTM2NzE5IEwgNTQ5LjgzNTkzOCAxMjk4Ljg3MTA5NCBMIDU1OS4zNzUgMTMwMi42ODc1IEwgNTk5LjQ0MTQwNiAxMzIzLjY3NTc4MSBMIDY1Ni42Nzk2ODggMTM0OC40NzY1NjIgTCA2OTQuODM5ODQ0IDEzNjEuODM1OTM4IEwgNzM4LjcyMjY1NiAxMzc1LjE5MTQwNiBMIDc4Mi42MDU0NjkgMTM4NC43MzA0NjkgTCA4MjQuNTgyMDMxIDEzOTAuNDUzMTI1IEwgOTQyLjg3NSAxMzkwLjQ1MzEyNSBMIDkzNS4yNDIxODggMTM5Ni4xNzU3ODEgTCA4NzYuMDk3NjU2IDE0MjAuOTgwNDY5IEwgODE4Ljg1NTQ2OSAxNDQwLjA1ODU5NCBMIDc1NS44OTQ1MzEgMTQ1NS4zMjQyMTkgTCA2OTQuODM5ODQ0IDE0NjQuODYzMjgxIEwgNjUyLjg2MzI4MSAxNDY4LjY3OTY4OCBMIDU5My43MTg3NSAxNDY4LjY3OTY4OCBMIDU0Mi4yMDMxMjUgMTQ2Mi45NTcwMzEgTCA0OTAuNjg3NSAxNDUzLjQxNzk2OSBMIDQ0OC43MTQ4NDQgMTQ0MS45Njg3NSBMIDM5NS4yODkwNjIgMTQyMi44OTA2MjUgTCAzMzkuOTYwOTM4IDEzOTYuMTc1NzgxIEwgMzA3LjUyMzQzOCAxMzc3LjA5NzY1NiBMIDI3Ni45OTYwOTQgMTM1Ni4xMDkzNzUgTCAyNTQuMTAxNTYyIDEzMzguOTM3NSBMIDIzMy4xMTMyODEgMTMyMS43NjU2MjUgTCAyMTQuMDM1MTU2IDEzMDQuNTkzNzUgTCAxOTEuMTM2NzE5IDEyODMuNjA5Mzc1IEwgMTc3Ljc4MTI1IDEyNjguMzQzNzUgTCAxNTguNzAzMTI1IDEyNDcuMzU1NDY5IEwgMTMwLjA4MjAzMSAxMjA5LjE5OTIxOSBMIDEwOS4wOTc2NTYgMTE3Ni43NjE3MTkgTCA4Ni4xOTkyMTkgMTEzNi42OTUzMTIgTCA2Ny4xMjEwOTQgMTA5NC43MTg3NSBMIDU1LjY3MTg3NSAxMDY2LjEwMTU2MiBaIE0gNTUuNjcxODc1IDEwNjAuMzc1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjM2I5ZGNlIiBkPSJNIDc2My41MjczNDQgMTguNjMyODEyIEwgODUzLjE5OTIxOSAxOC42MzI4MTIgTCA5MDYuNjI1IDI0LjM1NTQ2OSBMIDk1OC4xMzY3MTkgMzMuODk0NTMxIEwgMTAxMS41NjI1IDQ5LjE2MDE1NiBMIDEwNTcuMzUxNTYyIDY2LjMyODEyNSBMIDEwNzQuNTIzNDM4IDczLjk2MDkzOCBMIDEwNjYuODkwNjI1IDc1Ljg3MTA5NCBMIDEwMTMuNDY4NzUgNjQuNDIxODc1IEwgOTgyLjk0MTQwNiA2MC42MDU0NjkgTCA5NTYuMjMwNDY5IDU4LjY5OTIxOSBMIDg3OS45MTAxNTYgNTguNjk5MjE5IEwgODM3LjkzNzUgNjIuNTE1NjI1IEwgNzkyLjE0NDUzMSA3MC4xNDQ1MzEgTCA3MzguNzIyNjU2IDgzLjUgTCA2ODEuNDg0Mzc1IDEwMi41ODIwMzEgTCA2MzcuNjAxNTYyIDEyMS42NjAxNTYgTCA1OTMuNzE4NzUgMTQ0LjU1NDY4OCBMIDU1MS43NDIxODggMTcxLjI2OTUzMSBMIDUxNS40OTIxODggMTk3Ljk4MDQ2OSBMIDQ4OC43ODEyNSAyMjAuODc1IEwgNDYzLjk3NjU2MiAyNDMuNzY5NTMxIEwgNDM1LjM1NTQ2OSAyNzQuMjk2ODc1IEwgNDIwLjA5Mzc1IDI5My4zNzg5MDYgTCAzOTcuMTk5MjE5IDMyMy45MDYyNSBMIDM3Ni4yMTA5MzggMzU2LjMzOTg0NCBMIDM0OS41IDQwNC4wMzkwNjIgTCAzMzQuMjM0Mzc1IDQzNi40NzI2NTYgTCAzMTMuMjQ2MDk0IDQ5MS44MDQ2ODggTCAyOTkuODkwNjI1IDU0My4zMjAzMTIgTCAyOTQuMTY3OTY5IDU3MS45Mzc1IEwgMjg4LjQ0NTMxMiA2MjMuNDUzMTI1IEwgMjg2LjUzNTE1NiA2NzQuOTY4NzUgTCAyODIuNzE4NzUgNjY3LjMzNTkzOCBMIDI3MS4yNzM0MzggNjIzLjQ1MzEyNSBMIDI2My42NDA2MjUgNTc3LjY2NDA2MiBMIDI1OS44MjQyMTkgNTMzLjc4MTI1IEwgMjU5LjgyNDIxOSA0ODkuODk4NDM4IEwgMjYzLjY0MDYyNSA0NDYuMDE1NjI1IEwgMjcxLjI3MzQzOCA0MDQuMDM5MDYyIEwgMjgyLjcxODc1IDM2Mi4wNjI1IEwgMjk3Ljk4NDM3NSAzMjEuOTk2MDk0IEwgMzE1LjE1NjI1IDI4NS43NDYwOTQgTCAzMzIuMzI4MTI1IDI1Ny4xMjUgTCAzNTUuMjIyNjU2IDIyNC42OTE0MDYgTCAzNzYuMjEwOTM4IDE5OS44ODY3MTkgTCAzOTMuMzgyODEyIDE4MC44MDg1OTQgTCA0MTQuMzcxMDk0IDE1OS44MjAzMTIgTCA0MzUuMzU1NDY5IDE0Mi42NDg0MzggTCA0NjIuMDcwMzEyIDEyMS42NjAxNTYgTCA0OTQuNTAzOTA2IDEwMC42NzE4NzUgTCA1MjUuMDMxMjUgODMuNSBMIDU2NS4wOTc2NTYgNjQuNDIxODc1IEwgNTk5LjQ0MTQwNiA1MS4wNjY0MDYgTCA2NDUuMjM0Mzc1IDM3LjcxMDkzOCBMIDY4Ny4yMDcwMzEgMjguMTcxODc1IEwgNzQyLjUzOTA2MiAyMC41MzkwNjIgWiBNIDc2My41MjczNDQgMTguNjMyODEyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZjI3NTNjIiBkPSJNIDEzMzAuMTkxNDA2IDI2NC43NTc4MTIgTCAxMzM3LjgyMDMxMiAyNjQuNzU3ODEyIEwgMTM0MS42MzY3MTkgMjc0LjI5Njg3NSBMIDEzNTguODA4NTk0IDI3Ni4yMDcwMzEgTCAxMzYyLjYyNSAyNzguMTEzMjgxIEwgMTM2NC41MzUxNTYgMzA2LjczNDM3NSBMIDEzNjQuNTM1MTU2IDM3My41MTE3MTkgTCAxMzU4LjgwODU5NCA0MTMuNTc4MTI1IEwgMTM1NC45OTIxODggNDIxLjIxMDkzOCBMIDEzMTEuMTA5Mzc1IDQwMi4xMjg5MDYgTCAxMjcxLjA0Mjk2OSAzNzkuMjM0Mzc1IEwgMTI0NC4zMzIwMzEgMzYwLjE1NjI1IEwgMTIzNC43OTI5NjkgMzUwLjYxNzE4OCBMIDEyMzYuNjk5MjE5IDMzOS4xNjc5NjkgTCAxMjQ2LjIzODI4MSAzMjMuOTA2MjUgTCAxMjY1LjMyMDMxMiAzMDYuNzM0Mzc1IEwgMTMxMy4wMTk1MzEgMjc2LjIwNzAzMSBaIE0gMTMzMC4xOTE0MDYgMjY0Ljc1NzgxMiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y1YmUzOCIgZD0iTSAxMjQwLjUxNTYyNSAxNDguMzcxMDk0IEwgMTI0NC4zMzIwMzEgMTQ4LjM3MTA5NCBMIDEyNTAuMDU0Njg4IDE4Mi43MTQ4NDQgTCAxMjUxLjk2NDg0NCAyMDEuNzk2ODc1IEwgMTI1MS45NjQ4NDQgMjM0LjIzMDQ2OSBMIDEyNDQuMzMyMDMxIDI4MC4wMTk1MzEgTCAxMjQwLjUxNTYyNSAyOTMuMzc4OTA2IEwgMTIyOS4wNjY0MDYgMjg5LjU2MjUgTCAxMTk0LjcyNjU2MiAyNzAuNDgwNDY5IEwgMTE1OC40NzI2NTYgMjUxLjQwMjM0NCBMIDExMjkuODU1NDY5IDIzMi4zMjQyMTkgTCAxMTIwLjMxNjQwNiAyMjQuNjkxNDA2IEwgMTEyMi4yMjI2NTYgMjE1LjE1MjM0NCBMIDExNDguOTMzNTk0IDE5Ni4wNzAzMTIgTCAxMTgxLjM3MTA5NCAxNzYuOTkyMTg4IEwgMTIyMS40Mzc1IDE1Ni4wMDM5MDYgWiBNIDEyNDAuNTE1NjI1IDE0OC4zNzEwOTQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNWEzM2MiIGQ9Ik0gMTM5NS4wNjI1IDIwOS40MjU3ODEgTCAxNDA0LjYwMTU2MiAyMTEuMzM1OTM4IEwgMTQ0Mi43NTc4MTIgMjI2LjU5NzY1NiBMIDE0NjkuNDcyNjU2IDI0My43Njk1MzEgTCAxNDc1LjE5NTMxMiAyNDcuNTg1OTM4IEwgMTQ3MS4zNzg5MDYgMjU1LjIxODc1IEwgMTQ1OC4wMjM0MzggMjY4LjU3NDIxOSBMIDE0MzMuMjE4NzUgMjg3LjY1MjM0NCBMIDE0MTQuMTQwNjI1IDI5Ny4xOTE0MDYgTCAxNDAwLjc4NTE1NiAyOTcuMTkxNDA2IEwgMTM5My4xNTIzNDQgMjg3LjY1MjM0NCBMIDEzODUuNTE5NTMxIDI3MC40ODA0NjkgTCAxMzcyLjE2NDA2MiAyNzAuNDgwNDY5IEwgMTM3NC4wNzQyMTkgMjU5LjAzNTE1NiBMIDEzODcuNDI5Njg4IDIzMC40MTQwNjIgTCAxMzkzLjE1MjM0NCAyMTEuMzM1OTM4IFogTSAxMzk1LjA2MjUgMjA5LjQyNTc4MSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y0OTc1NiIgZD0iTSAxMjkyLjAzMTI1IDExMi4xMjEwOTQgTCAxMzEzLjAxOTUzMSAxMTQuMDI3MzQ0IEwgMTM0OS4yNjk1MzEgMTI3LjM4MjgxMiBMIDEzNzAuMjU3ODEyIDEzOC44MzIwMzEgTCAxMzY4LjM0NzY1NiAxNDYuNDY0ODQ0IEwgMTM0Ny4zNjMyODEgMTcxLjI2OTUzMSBMIDEzMjYuMzc1IDE5MC4zNDc2NTYgTCAxMzExLjEwOTM3NSAxOTcuOTgwNDY5IEwgMTMwMS41NzAzMTIgMTk2LjA3MDMxMiBMIDEyOTAuMTIxMDk0IDE3OC44OTg0MzggTCAxMjg0LjM5ODQzOCAxNTYuMDAzOTA2IEwgMTI4NC4zOTg0MzggMTMzLjEwOTM3NSBaIE0gMTI5Mi4wMzEyNSAxMTIuMTIxMDk0ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=" alt="MINDSPARK"></div>
      <div style="font-size:18px;font-weight:700;letter-spacing:.06em;color:#fff;margin-bottom:4px">MINDSPARK</div>
      <div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:20px;text-transform:uppercase;letter-spacing:.08em">Loading</div>
      <div class="lottie-progress" style="margin:0 auto"><div class="lottie-progress-fill" style="background:#F57A39"></div></div>
    </div>
    <div style="background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:28px;text-align:center;box-shadow:var(--s3);display:flex;flex-direction:column;align-items:center;gap:12px">
      <div class="lottie-box"><div class="lottie-abacus">&#127065;</div></div>
      <div style="font-size:13px;font-weight:500;color:var(--t1)">Starting exam&hellip;</div>
      <div style="font-size:11px;color:var(--t3)">Get ready, MINDSPARK!</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:16px;display:flex;align-items:center;gap:12px;box-shadow:var(--s1)">
        <div class="lottie-box" style="width:40px;height:37px"><div style="font-size:20px;animation:bth 1.5s ease-in-out infinite">&#127065;</div></div>
        <div><div style="font-size:13px;font-weight:500;color:var(--t1)">Saving results&hellip;</div><div style="font-size:11px;color:var(--t3)">MINDSPARK</div></div>
      </div>
    </div>
  </div>
  <div class="card">
    <table class="tbl">
      <thead><tr><th>Scenario</th><th>Loader type</th><th>Background</th></tr></thead>
      <tbody>
        <tr><td>App first load</td><td>MINDSPARK logo + Lottie abacus + progress bar</td><td>#204074 (MINDSPARK Navy)</td></tr>
        <tr><td>Exam interstitial (3000ms)</td><td>Lottie inside Get Ready card</td><td>#FFFFFF card on #F8FAFC</td></tr>
        <tr><td>CSV import / background ops</td><td>Small inline Lottie toast</td><td>White card</td></tr>
        <tr><td>KPI cards / tables loading</td><td>Skeleton screens (not Lottie)</td><td>Component-matched</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="hr"></div>

<!-- 07 SKELETONS -->
<div id="skeleton" style="margin-bottom:60px">
  <div class="ey">07 &mdash; Loading States</div>
  <h2 class="st">Skeleton Screens</h2>
  <p class="sd">Used for all in-page data loading. Dimensions match final components exactly to prevent CLS. All animate at 1.5s to pulse in sync.</p>
  <div class="pl pla" style="margin-bottom:12px">KPI Row Skeleton</div>
  <div class="demo" style="margin-bottom:24px">
    <div style="background:var(--g50);border-radius:var(--r4);padding:22px;flex:1;min-width:155px">
      <div class="sk-block" style="height:13px;width:100px;margin-bottom:14px;background:linear-gradient(90deg,rgba(255,255,255,.2) 25%,rgba(255,255,255,.35) 50%,rgba(255,255,255,.2) 75%);background-size:400% 100%"></div>
      <div class="sk-block" style="height:42px;width:70px;margin-bottom:16px;background:linear-gradient(90deg,rgba(255,255,255,.2) 25%,rgba(255,255,255,.35) 50%,rgba(255,255,255,.2) 75%);background-size:400% 100%"></div>
      <div class="sk-block" style="height:22px;width:130px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.2) 25%,rgba(255,255,255,.35) 50%,rgba(255,255,255,.2) 75%);background-size:400% 100%"></div>
    </div>
    <div style="background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:22px;flex:1;min-width:140px;box-shadow:var(--s1)">
      <div class="sk-block" style="height:13px;width:90px;margin-bottom:14px"></div>
      <div class="sk-block" style="height:42px;width:60px;margin-bottom:16px"></div>
      <div class="sk-block" style="height:13px;width:120px"></div>
    </div>
    <div style="background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:22px;flex:1;min-width:140px;box-shadow:var(--s1)">
      <div class="sk-block" style="height:13px;width:90px;margin-bottom:14px"></div>
      <div class="sk-block" style="height:42px;width:60px;margin-bottom:16px"></div>
      <div class="sk-block" style="height:13px;width:100px"></div>
    </div>
    <div style="background:#fff;border:1px solid var(--b);border-radius:var(--r4);padding:22px;flex:1;min-width:140px;box-shadow:var(--s1)">
      <div class="sk-block" style="height:13px;width:80px;margin-bottom:14px"></div>
      <div class="sk-block" style="height:42px;width:60px;margin-bottom:16px"></div>
      <div class="sk-block" style="height:13px;width:110px"></div>
    </div>
  </div>
  <div class="info"><strong>Shimmer CSS</strong> <code>background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%); background-size: 400% 100%; animation: shimmer 1.5s ease-in-out infinite;</code> &mdash; Assign <code>aria-busy="true"</code> to containers while skeleton is showing, flip to <code>false</code> when data loads.</div>
</div>
<div class="hr"></div>

<!-- 08 SPACING -->
<div id="spc" style="margin-bottom:60px">
  <div class="ey">08 &mdash; Foundation</div>
  <h2 class="st">Spacing Scale</h2>
  <div class="card">
    <div class="sp-row"><div class="sp-b" style="width:4px"></div><div class="sp-l">4px &mdash; xs</div><div class="sp-u">Badge padding &middot; icon gap</div></div>
    <div class="sp-row"><div class="sp-b" style="width:8px"></div><div class="sp-l">8px &mdash; sm</div><div class="sp-u">Avatar-to-text &middot; MCQ inner</div></div>
    <div class="sp-row"><div class="sp-b" style="width:16px"></div><div class="sp-l">16px &mdash; md</div><div class="sp-u">Card grid gap &middot; MCQ gap</div></div>
    <div class="sp-row"><div class="sp-b" style="width:24px"></div><div class="sp-l">24px &mdash; xl</div><div class="sp-u">Card padding &middot; section gap</div></div>
    <div class="sp-row" style="border:none"><div class="sp-b" style="width:64px"></div><div class="sp-l">64px &mdash; touch min</div><div class="sp-u">MCQ button minimum h + w &mdash; Fitts&rsquo;s Law hard floor (paediatric motor variance)</div></div>
  </div>
</div>
<div class="hr"></div>

<!-- 09 ELEVATION -->
<div id="elv" style="margin-bottom:60px">
  <div class="ey">09 &mdash; Foundation</div>
  <h2 class="st">Elevation &mdash; Shadow System</h2>
  <div class="g3">
    <div class="card"><p class="ctitle">Shadow SM &mdash; default</p><p style="font-family:var(--fm);font-size:10px;color:var(--t3);margin-top:4px">0 1px 3px rgba(0,0,0,.06)</p><p style="font-size:12px;color:var(--t2);margin-top:6px">Standard cards &middot; MCQ buttons &middot; KPI cards</p></div>
    <div class="card" style="box-shadow:var(--s2)"><p class="ctitle">Shadow MD &mdash; featured</p><p style="font-family:var(--fm);font-size:10px;color:var(--t3);margin-top:4px">0 4px 12px rgba(0,0,0,.08)</p><p style="font-size:12px;color:var(--t2);margin-top:6px">LIVE card &middot; Lobby &middot; Result card &middot; Hover</p></div>
    <div class="card" style="box-shadow:var(--s3)"><p class="ctitle">Shadow LG &mdash; overlay</p><p style="font-family:var(--fm);font-size:10px;color:var(--t3);margin-top:4px">0 10px 32px rgba(0,0,0,.12)</p><p style="font-size:12px;color:var(--t2);margin-top:6px">Modals &middot; Lottie overlay &middot; Interstitial</p></div>
  </div>
</div>
<div class="hr"></div>

<!-- 10 RADIUS -->
<div id="rad" style="margin-bottom:60px">
  <div class="ey">10 &mdash; Foundation</div>
  <h2 class="st">Border Radius Scale</h2>
  <div class="card">
    <table class="tbl">
      <thead><tr><th>Token</th><th>Value</th><th>Used for</th></tr></thead>
      <tbody>
        <tr><td><code>--r1</code></td><td>4px</td><td>Tiny badges &middot; skeleton inner blocks</td></tr>
        <tr><td><code>--r2</code></td><td>6px</td><td>Status badges &middot; count pills</td></tr>
        <tr><td><code>--r3</code></td><td>10px</td><td>Buttons &middot; inputs &middot; nav items &middot; MCQ buttons</td></tr>
        <tr><td><code>--r4</code></td><td>14px</td><td>ALL cards &mdash; both panels</td></tr>
        <tr><td><code>--r5</code></td><td>18px</td><td>Large panels &middot; interstitial overlay</td></tr>
        <tr><td><code>--rf</code></td><td>999px</td><td>Timer pill &middot; FAB &middot; LIVE badge &middot; count circles</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="hr"></div>

<!-- 11-15 ADMIN COMPONENTS -->
<div id="kpi" style="margin-bottom:48px">
  <div class="ey">11 &mdash; Admin Components</div>
  <h2 class="st">KPI Cards</h2>
  <div class="demo">
    <div class="kh"><div class="kh-arr">&#8599;</div><div class="kh-lbl">Active Students</div><div class="kh-num">248</div><div class="kh-tr">&#8593; +12 this week</div></div>
    <div class="ks"><div class="ks-arr">&#8599;</div><div class="ks-lbl">Pending Results</div><div class="ks-num">14</div><div class="ks-tr">&#8593; Awaiting publish</div></div>
    <div class="ks"><div class="ks-arr">&#8599;</div><div class="ks-lbl">Live Sessions</div><div class="ks-num">3</div><div class="ks-tr" style="color:#EF4444">&#9679; Active now</div></div>
    <div class="ks"><div class="ks-arr">&#8599;</div><div class="ks-lbl">Assessments</div><div class="ks-num">31</div><div class="ks-tr" style="color:var(--t3)">This month</div></div>
  </div>
</div>

<div id="btn" style="margin-bottom:48px">
  <div class="pl pla">Buttons &amp; Badges</div>
  <div class="demo" style="align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px">
    <button class="abp">&#65291; Add Assessment</button>
    <button class="abs">Import CSV</button>
    <button class="abd">Force Close</button>
    <span class="bdg bok">Completed</span><span class="bdg bwn">In Progress</span>
    <span class="bdg bfl">Failed</span><span class="bdg bin">Draft</span>
    <span class="bdg blv">LIVE</span><span class="bct">12+</span>
    <button class="fab" style="padding:10px 18px;font-size:12px">Publish Selected (3)</button>
  </div>
</div>

<div id="side" style="margin-bottom:48px">
  <div class="pl pla">MINDSPARK Sidebars &mdash; Both Panels</div>
  <div class="demo" style="align-items:flex-start;gap:20px;margin-top:12px">
    <div class="aside">
      <div class="aside-logo"><div class="aside-mark"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwMCIgem9vbUFuZFBhbj0ibWFnbmlmeSIgdmlld0JveD0iMCAwIDE1MDAgMTQ5OS45OTk5MzMiIGhlaWdodD0iMjAwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48cmVjdCB4PSItMTUwIiB3aWR0aD0iMTgwMCIgZmlsbD0iI2ZlZmVmZSIgeT0iLTE0OS45OTk5OTMiIGhlaWdodD0iMTc5OS45OTk5MiIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSAxMTAxLjIzNDM3NSAzODguNzczNDM4IEwgMTEzMS43NjE3MTkgMzg4Ljc3MzQzOCBMIDExODkgMzkyLjU4OTg0NCBMIDEyMDYuMTcxODc1IDM5Ni40MDYyNSBMIDEyMTcuNjIxMDk0IDQwNC4wMzkwNjIgTCAxMjIzLjM0Mzc1IDQxNy4zOTQ1MzEgTCAxMjI5LjA2NjQwNiA0ODQuMTcxODc1IEwgMTI0Mi40MjU3ODEgNzQzLjY1NjI1IEwgMTI0OC4xNDg0MzggODM1LjIzODI4MSBMIDEyNjEuNTAzOTA2IDk3Mi42MDkzNzUgTCAxMjYzLjQxMDE1NiAxMDAxLjIzMDQ2OSBMIDEyNjMuNDEwMTU2IDEwMjkuODQ3NjU2IEwgMTI1MC4wNTQ2ODggMTA1MC44MzU5MzggTCAxMjMwLjk3NjU2MiAxMDY2LjEwMTU2MiBMIDEyMDkuOTg4MjgxIDEwNzMuNzMwNDY5IEwgMTE5Ni42MzI4MTIgMTA3NS42NDA2MjUgTCAxMTEwLjc3MzQzOCAxMDc1LjY0MDYyNSBMIDExMDMuMTQ0NTMxIDk1MS42MjEwOTQgTCAxMDk3LjQxNzk2OSA4NTguMTMyODEyIEwgMTA5My42MDE1NjIgNzU4LjkxNzk2OSBMIDEwOTEuNjk1MzEyIDY3Ni44NzUgTCAxMDg1Ljk3MjY1NiA2OTIuMTQwNjI1IEwgMTA1NS40NDUzMTIgNzk3LjA3ODEyNSBMIDEwMTMuNDY4NzUgOTI2LjgyMDMxMiBMIDk4Ni43NTc4MTIgMTAwOC44NjMyODEgTCA5NjkuNTg1OTM4IDEwNTguNDY4NzUgTCA5NTguMTM2NzE5IDEwNzEuODI0MjE5IEwgOTQwLjk2NDg0NCAxMDc5LjQ1NzAzMSBMIDkyMy43OTI5NjkgMTA4My4yNzM0MzggTCA4OTUuMTc1NzgxIDEwODMuMjczNDM4IEwgODY0LjY0ODQzOCAxMDc3LjU0Njg3NSBMIDg0NS41NzAzMTIgMTA2OC4wMDc4MTIgTCA4MzcuOTM3NSAxMDU4LjQ2ODc1IEwgODI2LjQ4ODI4MSAxMDI3Ljk0MTQwNiBMIDc5NS45NjA5MzggOTMyLjU0Mjk2OSBMIDc3My4wNjY0MDYgODU2LjIyNjU2MiBMIDc2NS40MzM1OTQgODI5LjUxMTcxOSBMIDc2Ny4zNDM3NSA4MTQuMjUgTCA3OTAuMjM4MjgxIDczNy45Mjk2ODggTCA4MjYuNDg4MjgxIDYwOC4xOTE0MDYgTCA4MzYuMDI3MzQ0IDU3My44NDc2NTYgTCA4MzkuODQzNzUgNTc5LjU3MDMxMiBMIDg2NC42NDg0MzggNjczLjA2MjUgTCA5MDAuODk4NDM4IDgwMi44MDA3ODEgTCA5MDQuNzE0ODQ0IDgxNi4xNTYyNSBMIDkwNC43MTQ4NDQgODIzLjc4OTA2MiBMIDkwOC41MzEyNSA4MjMuNzg5MDYyIEwgOTEyLjM0NzY1NiA4MDYuNjE3MTg4IEwgOTUwLjUwNzgxMiA2OTcuODYzMjgxIEwgOTg4LjY2NDA2MiA1OTIuOTI1NzgxIEwgMTAxMy40Njg3NSA1MjIuMzMyMDMxIEwgMTA0MC4xNzk2ODggNDQ3LjkyMTg3NSBMIDEwNTUuNDQ1MzEyIDQxNy4zOTQ1MzEgTCAxMDY4LjgwMDc4MSA0MDIuMTI4OTA2IEwgMTA4MC4yNDYwOTQgMzk0LjUgWiBNIDExMDEuMjM0Mzc1IDM4OC43NzM0MzggIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNTdhMzkiIGQ9Ik0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSBMIDEzODEuNzAzMTI1IDgzMy4zMjgxMjUgTCAxMzgzLjYxMzI4MSA4NTIuNDEwMTU2IEwgMTM4My42MTMyODEgOTAzLjkyNTc4MSBMIDEzNzkuNzk2ODc1IDk0My45OTIxODggTCAxMzY4LjM0NzY1NiA5OTkuMzIwMzEyIEwgMTM1Ni45MDIzNDQgMTAzNy40ODA0NjkgTCAxMzQzLjU0Njg3NSAxMDczLjczMDQ2OSBMIDEzMjguMjgxMjUgMTEwNi4xNjc5NjkgTCAxMzA3LjI5Mjk2OSAxMTQyLjQxNzk2OSBMIDEyODguMjE0ODQ0IDExNjkuMTI4OTA2IEwgMTI2Ny4yMjY1NjIgMTE5My45MzM1OTQgTCAxMjUwLjA1NDY4OCAxMjEzLjAxMTcxOSBMIDEyMzAuOTc2NTYyIDEyMzIuMDkzNzUgTCAxMjA5Ljk4ODI4MSAxMjQ5LjI2NTYyNSBMIDExODEuMzcxMDk0IDEyNzAuMjUzOTA2IEwgMTE1Ni41NjY0MDYgMTI4NS41MTU2MjUgTCAxMTEyLjY4MzU5NCAxMzA4LjQxMDE1NiBMIDEwODAuMjQ2MDk0IDEzMjEuNzY1NjI1IEwgMTAzOC4yNzM0MzggMTMzNS4xMjEwOTQgTCA5OTAuNTc0MjE5IDEzNDYuNTcwMzEyIEwgOTMxLjQyNTc4MSAxMzU0LjIwMzEyNSBMIDgzNC4xMjEwOTQgMTM1NC4yMDMxMjUgTCA3ODguMzI4MTI1IDEzNDguNDc2NTYyIEwgNzM0LjkwNjI1IDEzMzcuMDMxMjUgTCA2OTYuNzQ2MDk0IDEzMjUuNTgyMDMxIEwgNjYwLjQ5NjA5NCAxMzEyLjIyNjU2MiBMIDYyMC40Mjk2ODggMTI5NS4wNTQ2ODggTCA1NzguNDUzMTI1IDEyNzIuMTYwMTU2IEwgNTQ0LjEwOTM3NSAxMjQ5LjI2NTYyNSBMIDUyMy4xMjUgMTIzNCBMIDUwNC4wNDI5NjkgMTIxOC43MzgyODEgTCA0ODEuMTQ4NDM4IDExOTcuNzUgTCA0NjUuODgyODEyIDExODQuMzk0NTMxIEwgNDQ0Ljg5ODQzOCAxMTYzLjQwNjI1IEwgNDMxLjU0Mjk2OSAxMTQ4LjE0NDUzMSBMIDQwNi43MzgyODEgMTExOS41MjM0MzggTCAzNzguMTE3MTg4IDEwODEuMzYzMjgxIEwgMzUzLjMxNjQwNiAxMDQzLjIwMzEyNSBMIDMzNC4yMzQzNzUgMTAwOC44NjMyODEgTCAzMTguOTcyNjU2IDk4MC4yNDIxODggTCAzMTMuMjQ2MDk0IDk2My4wNzAzMTIgTCAzMjIuNzg5MDYyIDk3Mi42MDkzNzUgTCAzNDcuNTg5ODQ0IDk5OS4zMjAzMTIgTCAzNjAuOTQ1MzEyIDEwMTQuNTg1OTM4IEwgNDA0LjgyODEyNSAxMDU4LjQ2ODc1IEwgNDIwLjA5Mzc1IDEwNzEuODI0MjE5IEwgNDQ0Ljg5ODQzOCAxMDkyLjgxMjUgTCA0NjkuNjk5MjE5IDExMTEuODkwNjI1IEwgNTAwLjIyNjU2MiAxMTMyLjg3ODkwNiBMIDUyOC44NDc2NTYgMTE1MC4wNTA3ODEgTCA1NjguOTE0MDYyIDExNzEuMDM5MDYyIEwgNjI4LjA2MjUgMTE5NS44Mzk4NDQgTCA2NzUuNzYxNzE5IDEyMTEuMTA1NDY5IEwgNzIxLjU1MDc4MSAxMjIyLjU1NDY4OCBMIDc3OC43ODkwNjIgMTIzMi4wOTM3NSBMIDgwMS42ODM1OTQgMTIzNCBMIDg5MS4zNTkzNzUgMTIzNCBMIDkyNS43MDMxMjUgMTIzMC4xODM1OTQgTCA5NzkuMTI1IDEyMjAuNjQ0NTMxIEwgMTAyNi44MjQyMTkgMTIwNy4yODkwNjIgTCAxMDYzLjA3NDIxOSAxMTkzLjkzMzU5NCBMIDExMDMuMTQ0NTMxIDExNzYuNzYxNzE5IEwgMTE0NS4xMTcxODggMTE1My44NjcxODggTCAxMTc1LjY0NDUzMSAxMTM0Ljc4NTE1NiBMIDEyMDkuOTg4MjgxIDExMDguMDc0MjE5IEwgMTIzNC43OTI5NjkgMTA4NS4xNzk2ODggTCAxMjY1LjMyMDMxMiAxMDU0LjY1MjM0NCBMIDEyOTAuMTIxMDk0IDEwMjIuMjE4NzUgTCAxMzA5LjIwMzEyNSA5OTUuNTA3ODEyIEwgMTMzMC4xOTE0MDYgOTU5LjI1MzkwNiBMIDEzNTEuMTc1NzgxIDkxNS4zNzEwOTQgTCAxMzY4LjM0NzY1NiA4NjcuNjcxODc1IEwgMTM3NS45ODA0NjkgODM5LjA1NDY4OCBaIE0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMSIgZD0iTSA3NjUuNDMzNTk0IDM5MC42ODM1OTQgTCA4NTUuMTA5Mzc1IDM5MC42ODM1OTQgTCA4NTEuMjkyOTY5IDQxMy41NzgxMjUgTCA4MDUuNSA1ODMuMzg2NzE5IEwgNzY1LjQzMzU5NCA3MjguMzkwNjI1IEwgNzMzIDg0Mi44NzEwOTQgTCA3MDAuNTYyNSA5NTcuMzQ3NjU2IEwgNjczLjg1MTU2MiAxMDQ4LjkyOTY4OCBMIDY2Ni4yMTg3NSAxMDY0LjE5MTQwNiBMIDY1NC43NzM0MzggMTA3MS44MjQyMTkgTCA2MzkuNTA3ODEyIDEwNzUuNjQwNjI1IEwgNDk2LjQxMDE1NiAxMDc1LjY0MDYyNSBMIDUwMC4yMjY1NjIgMTA1OC40Njg3NSBMIDU0MC4yOTY4NzUgOTMyLjU0Mjk2OSBMIDU3OC40NTMxMjUgODA2LjYxNzE4OCBMIDYwNy4wNzQyMTkgNzExLjIxODc1IEwgNjM1LjY5MTQwNiA2MTIuMDA3ODEyIEwgNjY0LjMxMjUgNTA3LjA3MDMxMiBMIDY4My4zOTA2MjUgNDM4LjM4MjgxMiBMIDY5Mi45MzM1OTQgNDEzLjU3ODEyNSBMIDcwMi40NzI2NTYgNDAyLjEyODkwNiBMIDcxNy43MzQzNzUgMzk0LjUgTCA3MzEuMDg5ODQ0IDM5Mi41ODk4NDQgWiBNIDc2NS40MzM1OTQgMzkwLjY4MzU5NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSA1MDQuMDQyOTY5IDM4OC43NzM0MzggTCA1NTMuNjUyMzQ0IDM4OC43NzM0MzggTCA1NzIuNzMwNDY5IDM5Mi41ODk4NDQgTCA1OTUuNjI1IDQwNC4wMzkwNjIgTCA2MDcuMDc0MjE5IDQxMy41NzgxMjUgTCA2MjIuMzM1OTM4IDQzNC41NjY0MDYgTCA2MzMuNzg1MTU2IDQ1Ny40NjA5MzggTCA2MzcuNjAxNTYyIDQ2OC45MTAxNTYgTCA2MzUuNjkxNDA2IDQ4NC4xNzE4NzUgTCA2MDguOTgwNDY5IDU4Ny4yMDMxMjUgTCA1ODQuMTc5Njg4IDY4MC42OTE0MDYgTCA1NzguNDUzMTI1IDY5NS45NTcwMzEgTCA1NzQuNjM2NzE5IDY5MC4yMzQzNzUgTCA1NTcuNDY0ODQ0IDY0MC42MjUgTCA1NDkuODM1OTM4IDc0OS4zNzg5MDYgTCA1NDYuMDE5NTMxIDc3OS45MDYyNSBMIDUxOS4zMDg1OTQgODc3LjIxMDkzOCBMIDQ3Ny4zMzIwMzEgMTAxOC40MDIzNDQgTCA0NjIuMDcwMzEyIDEwNjkuOTE3OTY5IEwgNDQ2LjgwNDY4OCAxMDU4LjQ2ODc1IEwgNDI1LjgxNjQwNiAxMDQxLjI5Njg3NSBMIDQwMS4wMTU2MjUgMTAxOC40MDIzNDQgTCAzNzYuMjEwOTM4IDk5My41OTc2NTYgTCAzNzguMTE3MTg4IDk2Ni44ODY3MTkgTCAzOTcuMTk5MjE5IDgwOC41MjczNDQgTCA0MTYuMjc3MzQ0IDYzMi45OTIxODggTCA0MzcuMjY1NjI1IDQyNi45MzM1OTQgTCA0NDEuMDgyMDMxIDQwOS43NjE3MTkgTCA0NTAuNjIxMDk0IDM5OC4zMTY0MDYgTCA0NjIuMDcwMzEyIDM5Mi41ODk4NDQgWiBNIDUwNC4wNDI5NjkgMzg4Ljc3MzQzOCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMCIgZD0iTSAyOTAuMzUxNTYyIDI0OS40OTIxODggTCAyOTAuMzUxNTYyIDI1NS4yMTg3NSBMIDI3My4xNzk2ODggMjgzLjgzNTkzOCBMIDI1Ny45MTc5NjkgMzEwLjU0Njg3NSBMIDIzNi45Mjk2ODggMzU2LjMzOTg0NCBMIDIxNy44NTE1NjIgNDA5Ljc2MTcxOSBMIDIwNC40OTYwOTQgNDU3LjQ2MDkzOCBMIDE5NC45NTMxMjUgNTA3LjA3MDMxMiBMIDE5MS4xMzY3MTkgNTM3LjU5NzY1NiBMIDE4OS4yMzA0NjkgNTY4LjEyNSBMIDE4OS4yMzA0NjkgNjIzLjQ1MzEyNSBMIDE5NC45NTMxMjUgNjg0LjUwNzgxMiBMIDIwNC40OTYwOTQgNzM3LjkyOTY4OCBMIDIxNS45NDE0MDYgNzgzLjcyMjY1NiBMIDIzNS4wMjM0MzggODM5LjA1NDY4OCBMIDI1OS44MjQyMTkgODk2LjI5Mjk2OSBMIDI2OS4zNjMyODEgOTEzLjQ2NDg0NCBMIDI2OS4zNjMyODEgOTI4LjcyNjU2MiBMIDI1Ny45MTc5NjkgOTQ3LjgwODU5NCBMIDIzNi45Mjk2ODggOTcyLjYwOTM3NSBMIDIyMy41NzQyMTkgOTkzLjU5NzY1NiBMIDIxNS45NDE0MDYgMTAxNi40OTIxODggTCAyMTUuOTQxNDA2IDEwNDguOTI5Njg4IEwgMjIzLjU3NDIxOSAxMDg3LjA4OTg0NCBMIDIzNi45Mjk2ODggMTEyNS4yNDYwOTQgTCAyNTkuODI0MjE5IDExNzIuOTQ1MzEyIEwgMjgyLjcxODc1IDEyMDkuMTk5MjE5IEwgMjk0LjE2Nzk2OSAxMjI2LjM2NzE4OCBMIDI4Ni41MzUxNTYgMTIyMi41NTQ2ODggTCAyNjMuNjQwNjI1IDEyMDUuMzgyODEyIEwgMjQ0LjU2MjUgMTE4OC4yMTA5MzggTCAyMjkuMjk2ODc1IDExNzQuODU1NDY5IEwgMTk2Ljg2MzI4MSAxMTQyLjQxNzk2OSBMIDE3NS44NzUgMTExNS43MDcwMzEgTCAxNTQuODg2NzE5IDEwODcuMDg5ODQ0IEwgMTMwLjA4MjAzMSAxMDQ3LjAxOTUzMSBMIDExNC44MjAzMTIgMTAxNi40OTIxODggTCA5NS43NDIxODggOTcyLjYwOTM3NSBMIDg0LjI5Mjk2OSA5MzguMjY1NjI1IEwgNjkuMDI3MzQ0IDg4MS4wMjczNDQgTCA1OS40ODgyODEgODIxLjg4MjgxMiBMIDU1LjY3MTg3NSA3NzggTCA1NS42NzE4NzUgNzA1LjQ5NjA5NCBMIDU5LjQ4ODI4MSA2NjMuNTE5NTMxIEwgNjkuMDI3MzQ0IDYwNC4zNzUgTCA4NC4yOTI5NjkgNTQ1LjIyNjU2MiBMIDEwMS40NjQ4NDQgNDk3LjUyNzM0NCBMIDExOC42MzY3MTkgNDU5LjM3MTA5NCBMIDEzOS42MjUgNDE5LjMwMDc4MSBMIDE3MC4xNTIzNDQgMzczLjUxMTcxOSBMIDE4OS4yMzA0NjkgMzQ4LjcwNzAzMSBMIDIxMC4yMTg3NSAzMjMuOTA2MjUgTCAyMzguODM1OTM4IDI5My4zNzg5MDYgTCAyNjUuNTUwNzgxIDI2OC41NzQyMTkgWiBNIDI5MC4zNTE1NjIgMjQ5LjQ5MjE4OCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIzNDE3NiIgZD0iTSA1NS42NzE4NzUgMTA2MC4zNzUgTCA2MS4zOTg0MzggMTA2Ni4xMDE1NjIgTCA3OC41NzAzMTIgMTA5Mi44MTI1IEwgOTcuNjQ4NDM4IDExMTkuNTIzNDM4IEwgMTIyLjQ1MzEyNSAxMTUwLjA1MDc4MSBMIDE0NS4zNDc2NTYgMTE3NC44NTU0NjkgTCAxNzcuNzgxMjUgMTIwNy4yODkwNjIgTCAxOTguNzY5NTMxIDEyMjQuNDYwOTM4IEwgMjIzLjU3NDIxOSAxMjQzLjUzOTA2MiBMIDI1Ni4wMDc4MTIgMTI2NC41MjczNDQgTCAyOTAuMzUxNTYyIDEyODMuNjA5Mzc1IEwgMzIyLjc4OTA2MiAxMjk4Ljg3MTA5NCBMIDM3MC40ODgyODEgMTMxNi4wNDI5NjkgTCA0MTIuNDYwOTM4IDEzMjcuNDkyMTg4IEwgNDUwLjYyMTA5NCAxMzMzLjIxNDg0NCBMIDQ5Ni40MTAxNTYgMTMzMy4yMTQ4NDQgTCA1MjUuMDMxMjUgMTMyNS41ODIwMzEgTCA1NDIuMjAzMTI1IDEzMTQuMTM2NzE5IEwgNTQ5LjgzNTkzOCAxMjk4Ljg3MTA5NCBMIDU1OS4zNzUgMTMwMi42ODc1IEwgNTk5LjQ0MTQwNiAxMzIzLjY3NTc4MSBMIDY1Ni42Nzk2ODggMTM0OC40NzY1NjIgTCA2OTQuODM5ODQ0IDEzNjEuODM1OTM4IEwgNzM4LjcyMjY1NiAxMzc1LjE5MTQwNiBMIDc4Mi42MDU0NjkgMTM4NC43MzA0NjkgTCA4MjQuNTgyMDMxIDEzOTAuNDUzMTI1IEwgOTQyLjg3NSAxMzkwLjQ1MzEyNSBMIDkzNS4yNDIxODggMTM5Ni4xNzU3ODEgTCA4NzYuMDk3NjU2IDE0MjAuOTgwNDY5IEwgODE4Ljg1NTQ2OSAxNDQwLjA1ODU5NCBMIDc1NS44OTQ1MzEgMTQ1NS4zMjQyMTkgTCA2OTQuODM5ODQ0IDE0NjQuODYzMjgxIEwgNjUyLjg2MzI4MSAxNDY4LjY3OTY4OCBMIDU5My43MTg3NSAxNDY4LjY3OTY4OCBMIDU0Mi4yMDMxMjUgMTQ2Mi45NTcwMzEgTCA0OTAuNjg3NSAxNDUzLjQxNzk2OSBMIDQ0OC43MTQ4NDQgMTQ0MS45Njg3NSBMIDM5NS4yODkwNjIgMTQyMi44OTA2MjUgTCAzMzkuOTYwOTM4IDEzOTYuMTc1NzgxIEwgMzA3LjUyMzQzOCAxMzc3LjA5NzY1NiBMIDI3Ni45OTYwOTQgMTM1Ni4xMDkzNzUgTCAyNTQuMTAxNTYyIDEzMzguOTM3NSBMIDIzMy4xMTMyODEgMTMyMS43NjU2MjUgTCAyMTQuMDM1MTU2IDEzMDQuNTkzNzUgTCAxOTEuMTM2NzE5IDEyODMuNjA5Mzc1IEwgMTc3Ljc4MTI1IDEyNjguMzQzNzUgTCAxNTguNzAzMTI1IDEyNDcuMzU1NDY5IEwgMTMwLjA4MjAzMSAxMjA5LjE5OTIxOSBMIDEwOS4wOTc2NTYgMTE3Ni43NjE3MTkgTCA4Ni4xOTkyMTkgMTEzNi42OTUzMTIgTCA2Ny4xMjEwOTQgMTA5NC43MTg3NSBMIDU1LjY3MTg3NSAxMDY2LjEwMTU2MiBaIE0gNTUuNjcxODc1IDEwNjAuMzc1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjM2I5ZGNlIiBkPSJNIDc2My41MjczNDQgMTguNjMyODEyIEwgODUzLjE5OTIxOSAxOC42MzI4MTIgTCA5MDYuNjI1IDI0LjM1NTQ2OSBMIDk1OC4xMzY3MTkgMzMuODk0NTMxIEwgMTAxMS41NjI1IDQ5LjE2MDE1NiBMIDEwNTcuMzUxNTYyIDY2LjMyODEyNSBMIDEwNzQuNTIzNDM4IDczLjk2MDkzOCBMIDEwNjYuODkwNjI1IDc1Ljg3MTA5NCBMIDEwMTMuNDY4NzUgNjQuNDIxODc1IEwgOTgyLjk0MTQwNiA2MC42MDU0NjkgTCA5NTYuMjMwNDY5IDU4LjY5OTIxOSBMIDg3OS45MTAxNTYgNTguNjk5MjE5IEwgODM3LjkzNzUgNjIuNTE1NjI1IEwgNzkyLjE0NDUzMSA3MC4xNDQ1MzEgTCA3MzguNzIyNjU2IDgzLjUgTCA2ODEuNDg0Mzc1IDEwMi41ODIwMzEgTCA2MzcuNjAxNTYyIDEyMS42NjAxNTYgTCA1OTMuNzE4NzUgMTQ0LjU1NDY4OCBMIDU1MS43NDIxODggMTcxLjI2OTUzMSBMIDUxNS40OTIxODggMTk3Ljk4MDQ2OSBMIDQ4OC43ODEyNSAyMjAuODc1IEwgNDYzLjk3NjU2MiAyNDMuNzY5NTMxIEwgNDM1LjM1NTQ2OSAyNzQuMjk2ODc1IEwgNDIwLjA5Mzc1IDI5My4zNzg5MDYgTCAzOTcuMTk5MjE5IDMyMy45MDYyNSBMIDM3Ni4yMTA5MzggMzU2LjMzOTg0NCBMIDM0OS41IDQwNC4wMzkwNjIgTCAzMzQuMjM0Mzc1IDQzNi40NzI2NTYgTCAzMTMuMjQ2MDk0IDQ5MS44MDQ2ODggTCAyOTkuODkwNjI1IDU0My4zMjAzMTIgTCAyOTQuMTY3OTY5IDU3MS45Mzc1IEwgMjg4LjQ0NTMxMiA2MjMuNDUzMTI1IEwgMjg2LjUzNTE1NiA2NzQuOTY4NzUgTCAyODIuNzE4NzUgNjY3LjMzNTkzOCBMIDI3MS4yNzM0MzggNjIzLjQ1MzEyNSBMIDI2My42NDA2MjUgNTc3LjY2NDA2MiBMIDI1OS44MjQyMTkgNTMzLjc4MTI1IEwgMjU5LjgyNDIxOSA0ODkuODk4NDM4IEwgMjYzLjY0MDYyNSA0NDYuMDE1NjI1IEwgMjcxLjI3MzQzOCA0MDQuMDM5MDYyIEwgMjgyLjcxODc1IDM2Mi4wNjI1IEwgMjk3Ljk4NDM3NSAzMjEuOTk2MDk0IEwgMzE1LjE1NjI1IDI4NS43NDYwOTQgTCAzMzIuMzI4MTI1IDI1Ny4xMjUgTCAzNTUuMjIyNjU2IDIyNC42OTE0MDYgTCAzNzYuMjEwOTM4IDE5OS44ODY3MTkgTCAzOTMuMzgyODEyIDE4MC44MDg1OTQgTCA0MTQuMzcxMDk0IDE1OS44MjAzMTIgTCA0MzUuMzU1NDY5IDE0Mi42NDg0MzggTCA0NjIuMDcwMzEyIDEyMS42NjAxNTYgTCA0OTQuNTAzOTA2IDEwMC42NzE4NzUgTCA1MjUuMDMxMjUgODMuNSBMIDU2NS4wOTc2NTYgNjQuNDIxODc1IEwgNTk5LjQ0MTQwNiA1MS4wNjY0MDYgTCA2NDUuMjM0Mzc1IDM3LjcxMDkzOCBMIDY4Ny4yMDcwMzEgMjguMTcxODc1IEwgNzQyLjUzOTA2MiAyMC41MzkwNjIgWiBNIDc2My41MjczNDQgMTguNjMyODEyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZjI3NTNjIiBkPSJNIDEzMzAuMTkxNDA2IDI2NC43NTc4MTIgTCAxMzM3LjgyMDMxMiAyNjQuNzU3ODEyIEwgMTM0MS42MzY3MTkgMjc0LjI5Njg3NSBMIDEzNTguODA4NTk0IDI3Ni4yMDcwMzEgTCAxMzYyLjYyNSAyNzguMTEzMjgxIEwgMTM2NC41MzUxNTYgMzA2LjczNDM3NSBMIDEzNjQuNTM1MTU2IDM3My41MTE3MTkgTCAxMzU4LjgwODU5NCA0MTMuNTc4MTI1IEwgMTM1NC45OTIxODggNDIxLjIxMDkzOCBMIDEzMTEuMTA5Mzc1IDQwMi4xMjg5MDYgTCAxMjcxLjA0Mjk2OSAzNzkuMjM0Mzc1IEwgMTI0NC4zMzIwMzEgMzYwLjE1NjI1IEwgMTIzNC43OTI5NjkgMzUwLjYxNzE4OCBMIDEyMzYuNjk5MjE5IDMzOS4xNjc5NjkgTCAxMjQ2LjIzODI4MSAzMjMuOTA2MjUgTCAxMjY1LjMyMDMxMiAzMDYuNzM0Mzc1IEwgMTMxMy4wMTk1MzEgMjc2LjIwNzAzMSBaIE0gMTMzMC4xOTE0MDYgMjY0Ljc1NzgxMiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y1YmUzOCIgZD0iTSAxMjQwLjUxNTYyNSAxNDguMzcxMDk0IEwgMTI0NC4zMzIwMzEgMTQ4LjM3MTA5NCBMIDEyNTAuMDU0Njg4IDE4Mi43MTQ4NDQgTCAxMjUxLjk2NDg0NCAyMDEuNzk2ODc1IEwgMTI1MS45NjQ4NDQgMjM0LjIzMDQ2OSBMIDEyNDQuMzMyMDMxIDI4MC4wMTk1MzEgTCAxMjQwLjUxNTYyNSAyOTMuMzc4OTA2IEwgMTIyOS4wNjY0MDYgMjg5LjU2MjUgTCAxMTk0LjcyNjU2MiAyNzAuNDgwNDY5IEwgMTE1OC40NzI2NTYgMjUxLjQwMjM0NCBMIDExMjkuODU1NDY5IDIzMi4zMjQyMTkgTCAxMTIwLjMxNjQwNiAyMjQuNjkxNDA2IEwgMTEyMi4yMjI2NTYgMjE1LjE1MjM0NCBMIDExNDguOTMzNTk0IDE5Ni4wNzAzMTIgTCAxMTgxLjM3MTA5NCAxNzYuOTkyMTg4IEwgMTIyMS40Mzc1IDE1Ni4wMDM5MDYgWiBNIDEyNDAuNTE1NjI1IDE0OC4zNzEwOTQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNWEzM2MiIGQ9Ik0gMTM5NS4wNjI1IDIwOS40MjU3ODEgTCAxNDA0LjYwMTU2MiAyMTEuMzM1OTM4IEwgMTQ0Mi43NTc4MTIgMjI2LjU5NzY1NiBMIDE0NjkuNDcyNjU2IDI0My43Njk1MzEgTCAxNDc1LjE5NTMxMiAyNDcuNTg1OTM4IEwgMTQ3MS4zNzg5MDYgMjU1LjIxODc1IEwgMTQ1OC4wMjM0MzggMjY4LjU3NDIxOSBMIDE0MzMuMjE4NzUgMjg3LjY1MjM0NCBMIDE0MTQuMTQwNjI1IDI5Ny4xOTE0MDYgTCAxNDAwLjc4NTE1NiAyOTcuMTkxNDA2IEwgMTM5My4xNTIzNDQgMjg3LjY1MjM0NCBMIDEzODUuNTE5NTMxIDI3MC40ODA0NjkgTCAxMzcyLjE2NDA2MiAyNzAuNDgwNDY5IEwgMTM3NC4wNzQyMTkgMjU5LjAzNTE1NiBMIDEzODcuNDI5Njg4IDIzMC40MTQwNjIgTCAxMzkzLjE1MjM0NCAyMTEuMzM1OTM4IFogTSAxMzk1LjA2MjUgMjA5LjQyNTc4MSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y0OTc1NiIgZD0iTSAxMjkyLjAzMTI1IDExMi4xMjEwOTQgTCAxMzEzLjAxOTUzMSAxMTQuMDI3MzQ0IEwgMTM0OS4yNjk1MzEgMTI3LjM4MjgxMiBMIDEzNzAuMjU3ODEyIDEzOC44MzIwMzEgTCAxMzY4LjM0NzY1NiAxNDYuNDY0ODQ0IEwgMTM0Ny4zNjMyODEgMTcxLjI2OTUzMSBMIDEzMjYuMzc1IDE5MC4zNDc2NTYgTCAxMzExLjEwOTM3NSAxOTcuOTgwNDY5IEwgMTMwMS41NzAzMTIgMTk2LjA3MDMxMiBMIDEyOTAuMTIxMDk0IDE3OC44OTg0MzggTCAxMjg0LjM5ODQzOCAxNTYuMDAzOTA2IEwgMTI4NC4zOTg0MzggMTMzLjEwOTM3NSBaIE0gMTI5Mi4wMzEyNSAxMTIuMTIxMDk0ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=" alt="MINDSPARK"></div><div class="aside-txt">MINDSPARK</div></div>
      <div class="aside-sec">MENU</div>
      <div class="navi on"><div class="navi-icon">&#9866;</div> Dashboard</div>
      <div class="navi"><div class="navi-icon">&#9776;</div> Levels</div>
      <div class="navi"><div class="navi-icon">&#128101;</div> Students<span class="bct" style="margin-left:auto">248</span></div>
      <div class="navi"><div class="navi-icon">&#128221;</div> Assessments</div>
      <div class="navi"><div class="navi-icon">&#128225;</div> Monitor<span class="bdg blv" style="margin-left:auto;padding:1px 6px;font-size:9px">LIVE</span></div>
      <div class="navi"><div class="navi-icon">&#128202;</div> Results</div>
      <div class="aside-sec" style="margin-top:8px">GENERAL</div>
      <div class="navi"><div class="navi-icon">&#9881;</div> Settings</div>
    </div>
    <div class="aside">
      <div class="aside-logo"><div class="aside-mark"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwMCIgem9vbUFuZFBhbj0ibWFnbmlmeSIgdmlld0JveD0iMCAwIDE1MDAgMTQ5OS45OTk5MzMiIGhlaWdodD0iMjAwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48cmVjdCB4PSItMTUwIiB3aWR0aD0iMTgwMCIgZmlsbD0iI2ZlZmVmZSIgeT0iLTE0OS45OTk5OTMiIGhlaWdodD0iMTc5OS45OTk5MiIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSAxMTAxLjIzNDM3NSAzODguNzczNDM4IEwgMTEzMS43NjE3MTkgMzg4Ljc3MzQzOCBMIDExODkgMzkyLjU4OTg0NCBMIDEyMDYuMTcxODc1IDM5Ni40MDYyNSBMIDEyMTcuNjIxMDk0IDQwNC4wMzkwNjIgTCAxMjIzLjM0Mzc1IDQxNy4zOTQ1MzEgTCAxMjI5LjA2NjQwNiA0ODQuMTcxODc1IEwgMTI0Mi40MjU3ODEgNzQzLjY1NjI1IEwgMTI0OC4xNDg0MzggODM1LjIzODI4MSBMIDEyNjEuNTAzOTA2IDk3Mi42MDkzNzUgTCAxMjYzLjQxMDE1NiAxMDAxLjIzMDQ2OSBMIDEyNjMuNDEwMTU2IDEwMjkuODQ3NjU2IEwgMTI1MC4wNTQ2ODggMTA1MC44MzU5MzggTCAxMjMwLjk3NjU2MiAxMDY2LjEwMTU2MiBMIDEyMDkuOTg4MjgxIDEwNzMuNzMwNDY5IEwgMTE5Ni42MzI4MTIgMTA3NS42NDA2MjUgTCAxMTEwLjc3MzQzOCAxMDc1LjY0MDYyNSBMIDExMDMuMTQ0NTMxIDk1MS42MjEwOTQgTCAxMDk3LjQxNzk2OSA4NTguMTMyODEyIEwgMTA5My42MDE1NjIgNzU4LjkxNzk2OSBMIDEwOTEuNjk1MzEyIDY3Ni44NzUgTCAxMDg1Ljk3MjY1NiA2OTIuMTQwNjI1IEwgMTA1NS40NDUzMTIgNzk3LjA3ODEyNSBMIDEwMTMuNDY4NzUgOTI2LjgyMDMxMiBMIDk4Ni43NTc4MTIgMTAwOC44NjMyODEgTCA5NjkuNTg1OTM4IDEwNTguNDY4NzUgTCA5NTguMTM2NzE5IDEwNzEuODI0MjE5IEwgOTQwLjk2NDg0NCAxMDc5LjQ1NzAzMSBMIDkyMy43OTI5NjkgMTA4My4yNzM0MzggTCA4OTUuMTc1NzgxIDEwODMuMjczNDM4IEwgODY0LjY0ODQzOCAxMDc3LjU0Njg3NSBMIDg0NS41NzAzMTIgMTA2OC4wMDc4MTIgTCA4MzcuOTM3NSAxMDU4LjQ2ODc1IEwgODI2LjQ4ODI4MSAxMDI3Ljk0MTQwNiBMIDc5NS45NjA5MzggOTMyLjU0Mjk2OSBMIDc3My4wNjY0MDYgODU2LjIyNjU2MiBMIDc2NS40MzM1OTQgODI5LjUxMTcxOSBMIDc2Ny4zNDM3NSA4MTQuMjUgTCA3OTAuMjM4MjgxIDczNy45Mjk2ODggTCA4MjYuNDg4MjgxIDYwOC4xOTE0MDYgTCA4MzYuMDI3MzQ0IDU3My44NDc2NTYgTCA4MzkuODQzNzUgNTc5LjU3MDMxMiBMIDg2NC42NDg0MzggNjczLjA2MjUgTCA5MDAuODk4NDM4IDgwMi44MDA3ODEgTCA5MDQuNzE0ODQ0IDgxNi4xNTYyNSBMIDkwNC43MTQ4NDQgODIzLjc4OTA2MiBMIDkwOC41MzEyNSA4MjMuNzg5MDYyIEwgOTEyLjM0NzY1NiA4MDYuNjE3MTg4IEwgOTUwLjUwNzgxMiA2OTcuODYzMjgxIEwgOTg4LjY2NDA2MiA1OTIuOTI1NzgxIEwgMTAxMy40Njg3NSA1MjIuMzMyMDMxIEwgMTA0MC4xNzk2ODggNDQ3LjkyMTg3NSBMIDEwNTUuNDQ1MzEyIDQxNy4zOTQ1MzEgTCAxMDY4LjgwMDc4MSA0MDIuMTI4OTA2IEwgMTA4MC4yNDYwOTQgMzk0LjUgWiBNIDExMDEuMjM0Mzc1IDM4OC43NzM0MzggIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNTdhMzkiIGQ9Ik0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSBMIDEzODEuNzAzMTI1IDgzMy4zMjgxMjUgTCAxMzgzLjYxMzI4MSA4NTIuNDEwMTU2IEwgMTM4My42MTMyODEgOTAzLjkyNTc4MSBMIDEzNzkuNzk2ODc1IDk0My45OTIxODggTCAxMzY4LjM0NzY1NiA5OTkuMzIwMzEyIEwgMTM1Ni45MDIzNDQgMTAzNy40ODA0NjkgTCAxMzQzLjU0Njg3NSAxMDczLjczMDQ2OSBMIDEzMjguMjgxMjUgMTEwNi4xNjc5NjkgTCAxMzA3LjI5Mjk2OSAxMTQyLjQxNzk2OSBMIDEyODguMjE0ODQ0IDExNjkuMTI4OTA2IEwgMTI2Ny4yMjY1NjIgMTE5My45MzM1OTQgTCAxMjUwLjA1NDY4OCAxMjEzLjAxMTcxOSBMIDEyMzAuOTc2NTYyIDEyMzIuMDkzNzUgTCAxMjA5Ljk4ODI4MSAxMjQ5LjI2NTYyNSBMIDExODEuMzcxMDk0IDEyNzAuMjUzOTA2IEwgMTE1Ni41NjY0MDYgMTI4NS41MTU2MjUgTCAxMTEyLjY4MzU5NCAxMzA4LjQxMDE1NiBMIDEwODAuMjQ2MDk0IDEzMjEuNzY1NjI1IEwgMTAzOC4yNzM0MzggMTMzNS4xMjEwOTQgTCA5OTAuNTc0MjE5IDEzNDYuNTcwMzEyIEwgOTMxLjQyNTc4MSAxMzU0LjIwMzEyNSBMIDgzNC4xMjEwOTQgMTM1NC4yMDMxMjUgTCA3ODguMzI4MTI1IDEzNDguNDc2NTYyIEwgNzM0LjkwNjI1IDEzMzcuMDMxMjUgTCA2OTYuNzQ2MDk0IDEzMjUuNTgyMDMxIEwgNjYwLjQ5NjA5NCAxMzEyLjIyNjU2MiBMIDYyMC40Mjk2ODggMTI5NS4wNTQ2ODggTCA1NzguNDUzMTI1IDEyNzIuMTYwMTU2IEwgNTQ0LjEwOTM3NSAxMjQ5LjI2NTYyNSBMIDUyMy4xMjUgMTIzNCBMIDUwNC4wNDI5NjkgMTIxOC43MzgyODEgTCA0ODEuMTQ4NDM4IDExOTcuNzUgTCA0NjUuODgyODEyIDExODQuMzk0NTMxIEwgNDQ0Ljg5ODQzOCAxMTYzLjQwNjI1IEwgNDMxLjU0Mjk2OSAxMTQ4LjE0NDUzMSBMIDQwNi43MzgyODEgMTExOS41MjM0MzggTCAzNzguMTE3MTg4IDEwODEuMzYzMjgxIEwgMzUzLjMxNjQwNiAxMDQzLjIwMzEyNSBMIDMzNC4yMzQzNzUgMTAwOC44NjMyODEgTCAzMTguOTcyNjU2IDk4MC4yNDIxODggTCAzMTMuMjQ2MDk0IDk2My4wNzAzMTIgTCAzMjIuNzg5MDYyIDk3Mi42MDkzNzUgTCAzNDcuNTg5ODQ0IDk5OS4zMjAzMTIgTCAzNjAuOTQ1MzEyIDEwMTQuNTg1OTM4IEwgNDA0LjgyODEyNSAxMDU4LjQ2ODc1IEwgNDIwLjA5Mzc1IDEwNzEuODI0MjE5IEwgNDQ0Ljg5ODQzOCAxMDkyLjgxMjUgTCA0NjkuNjk5MjE5IDExMTEuODkwNjI1IEwgNTAwLjIyNjU2MiAxMTMyLjg3ODkwNiBMIDUyOC44NDc2NTYgMTE1MC4wNTA3ODEgTCA1NjguOTE0MDYyIDExNzEuMDM5MDYyIEwgNjI4LjA2MjUgMTE5NS44Mzk4NDQgTCA2NzUuNzYxNzE5IDEyMTEuMTA1NDY5IEwgNzIxLjU1MDc4MSAxMjIyLjU1NDY4OCBMIDc3OC43ODkwNjIgMTIzMi4wOTM3NSBMIDgwMS42ODM1OTQgMTIzNCBMIDg5MS4zNTkzNzUgMTIzNCBMIDkyNS43MDMxMjUgMTIzMC4xODM1OTQgTCA5NzkuMTI1IDEyMjAuNjQ0NTMxIEwgMTAyNi44MjQyMTkgMTIwNy4yODkwNjIgTCAxMDYzLjA3NDIxOSAxMTkzLjkzMzU5NCBMIDExMDMuMTQ0NTMxIDExNzYuNzYxNzE5IEwgMTE0NS4xMTcxODggMTE1My44NjcxODggTCAxMTc1LjY0NDUzMSAxMTM0Ljc4NTE1NiBMIDEyMDkuOTg4MjgxIDExMDguMDc0MjE5IEwgMTIzNC43OTI5NjkgMTA4NS4xNzk2ODggTCAxMjY1LjMyMDMxMiAxMDU0LjY1MjM0NCBMIDEyOTAuMTIxMDk0IDEwMjIuMjE4NzUgTCAxMzA5LjIwMzEyNSA5OTUuNTA3ODEyIEwgMTMzMC4xOTE0MDYgOTU5LjI1MzkwNiBMIDEzNTEuMTc1NzgxIDkxNS4zNzEwOTQgTCAxMzY4LjM0NzY1NiA4NjcuNjcxODc1IEwgMTM3NS45ODA0NjkgODM5LjA1NDY4OCBaIE0gMTM3Ny44OTA2MjUgODI1LjY5OTIxOSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMSIgZD0iTSA3NjUuNDMzNTk0IDM5MC42ODM1OTQgTCA4NTUuMTA5Mzc1IDM5MC42ODM1OTQgTCA4NTEuMjkyOTY5IDQxMy41NzgxMjUgTCA4MDUuNSA1ODMuMzg2NzE5IEwgNzY1LjQzMzU5NCA3MjguMzkwNjI1IEwgNzMzIDg0Mi44NzEwOTQgTCA3MDAuNTYyNSA5NTcuMzQ3NjU2IEwgNjczLjg1MTU2MiAxMDQ4LjkyOTY4OCBMIDY2Ni4yMTg3NSAxMDY0LjE5MTQwNiBMIDY1NC43NzM0MzggMTA3MS44MjQyMTkgTCA2MzkuNTA3ODEyIDEwNzUuNjQwNjI1IEwgNDk2LjQxMDE1NiAxMDc1LjY0MDYyNSBMIDUwMC4yMjY1NjIgMTA1OC40Njg3NSBMIDU0MC4yOTY4NzUgOTMyLjU0Mjk2OSBMIDU3OC40NTMxMjUgODA2LjYxNzE4OCBMIDYwNy4wNzQyMTkgNzExLjIxODc1IEwgNjM1LjY5MTQwNiA2MTIuMDA3ODEyIEwgNjY0LjMxMjUgNTA3LjA3MDMxMiBMIDY4My4zOTA2MjUgNDM4LjM4MjgxMiBMIDY5Mi45MzM1OTQgNDEzLjU3ODEyNSBMIDcwMi40NzI2NTYgNDAyLjEyODkwNiBMIDcxNy43MzQzNzUgMzk0LjUgTCA3MzEuMDg5ODQ0IDM5Mi41ODk4NDQgWiBNIDc2NS40MzM1OTQgMzkwLjY4MzU5NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIwNDA3NCIgZD0iTSA1MDQuMDQyOTY5IDM4OC43NzM0MzggTCA1NTMuNjUyMzQ0IDM4OC43NzM0MzggTCA1NzIuNzMwNDY5IDM5Mi41ODk4NDQgTCA1OTUuNjI1IDQwNC4wMzkwNjIgTCA2MDcuMDc0MjE5IDQxMy41NzgxMjUgTCA2MjIuMzM1OTM4IDQzNC41NjY0MDYgTCA2MzMuNzg1MTU2IDQ1Ny40NjA5MzggTCA2MzcuNjAxNTYyIDQ2OC45MTAxNTYgTCA2MzUuNjkxNDA2IDQ4NC4xNzE4NzUgTCA2MDguOTgwNDY5IDU4Ny4yMDMxMjUgTCA1ODQuMTc5Njg4IDY4MC42OTE0MDYgTCA1NzguNDUzMTI1IDY5NS45NTcwMzEgTCA1NzQuNjM2NzE5IDY5MC4yMzQzNzUgTCA1NTcuNDY0ODQ0IDY0MC42MjUgTCA1NDkuODM1OTM4IDc0OS4zNzg5MDYgTCA1NDYuMDE5NTMxIDc3OS45MDYyNSBMIDUxOS4zMDg1OTQgODc3LjIxMDkzOCBMIDQ3Ny4zMzIwMzEgMTAxOC40MDIzNDQgTCA0NjIuMDcwMzEyIDEwNjkuOTE3OTY5IEwgNDQ2LjgwNDY4OCAxMDU4LjQ2ODc1IEwgNDI1LjgxNjQwNiAxMDQxLjI5Njg3NSBMIDQwMS4wMTU2MjUgMTAxOC40MDIzNDQgTCAzNzYuMjEwOTM4IDk5My41OTc2NTYgTCAzNzguMTE3MTg4IDk2Ni44ODY3MTkgTCAzOTcuMTk5MjE5IDgwOC41MjczNDQgTCA0MTYuMjc3MzQ0IDYzMi45OTIxODggTCA0MzcuMjY1NjI1IDQyNi45MzM1OTQgTCA0NDEuMDgyMDMxIDQwOS43NjE3MTkgTCA0NTAuNjIxMDk0IDM5OC4zMTY0MDYgTCA0NjIuMDcwMzEyIDM5Mi41ODk4NDQgWiBNIDUwNC4wNDI5NjkgMzg4Ljc3MzQzOCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzNhOWVkMCIgZD0iTSAyOTAuMzUxNTYyIDI0OS40OTIxODggTCAyOTAuMzUxNTYyIDI1NS4yMTg3NSBMIDI3My4xNzk2ODggMjgzLjgzNTkzOCBMIDI1Ny45MTc5NjkgMzEwLjU0Njg3NSBMIDIzNi45Mjk2ODggMzU2LjMzOTg0NCBMIDIxNy44NTE1NjIgNDA5Ljc2MTcxOSBMIDIwNC40OTYwOTQgNDU3LjQ2MDkzOCBMIDE5NC45NTMxMjUgNTA3LjA3MDMxMiBMIDE5MS4xMzY3MTkgNTM3LjU5NzY1NiBMIDE4OS4yMzA0NjkgNTY4LjEyNSBMIDE4OS4yMzA0NjkgNjIzLjQ1MzEyNSBMIDE5NC45NTMxMjUgNjg0LjUwNzgxMiBMIDIwNC40OTYwOTQgNzM3LjkyOTY4OCBMIDIxNS45NDE0MDYgNzgzLjcyMjY1NiBMIDIzNS4wMjM0MzggODM5LjA1NDY4OCBMIDI1OS44MjQyMTkgODk2LjI5Mjk2OSBMIDI2OS4zNjMyODEgOTEzLjQ2NDg0NCBMIDI2OS4zNjMyODEgOTI4LjcyNjU2MiBMIDI1Ny45MTc5NjkgOTQ3LjgwODU5NCBMIDIzNi45Mjk2ODggOTcyLjYwOTM3NSBMIDIyMy41NzQyMTkgOTkzLjU5NzY1NiBMIDIxNS45NDE0MDYgMTAxNi40OTIxODggTCAyMTUuOTQxNDA2IDEwNDguOTI5Njg4IEwgMjIzLjU3NDIxOSAxMDg3LjA4OTg0NCBMIDIzNi45Mjk2ODggMTEyNS4yNDYwOTQgTCAyNTkuODI0MjE5IDExNzIuOTQ1MzEyIEwgMjgyLjcxODc1IDEyMDkuMTk5MjE5IEwgMjk0LjE2Nzk2OSAxMjI2LjM2NzE4OCBMIDI4Ni41MzUxNTYgMTIyMi41NTQ2ODggTCAyNjMuNjQwNjI1IDEyMDUuMzgyODEyIEwgMjQ0LjU2MjUgMTE4OC4yMTA5MzggTCAyMjkuMjk2ODc1IDExNzQuODU1NDY5IEwgMTk2Ljg2MzI4MSAxMTQyLjQxNzk2OSBMIDE3NS44NzUgMTExNS43MDcwMzEgTCAxNTQuODg2NzE5IDEwODcuMDg5ODQ0IEwgMTMwLjA4MjAzMSAxMDQ3LjAxOTUzMSBMIDExNC44MjAzMTIgMTAxNi40OTIxODggTCA5NS43NDIxODggOTcyLjYwOTM3NSBMIDg0LjI5Mjk2OSA5MzguMjY1NjI1IEwgNjkuMDI3MzQ0IDg4MS4wMjczNDQgTCA1OS40ODgyODEgODIxLjg4MjgxMiBMIDU1LjY3MTg3NSA3NzggTCA1NS42NzE4NzUgNzA1LjQ5NjA5NCBMIDU5LjQ4ODI4MSA2NjMuNTE5NTMxIEwgNjkuMDI3MzQ0IDYwNC4zNzUgTCA4NC4yOTI5NjkgNTQ1LjIyNjU2MiBMIDEwMS40NjQ4NDQgNDk3LjUyNzM0NCBMIDExOC42MzY3MTkgNDU5LjM3MTA5NCBMIDEzOS42MjUgNDE5LjMwMDc4MSBMIDE3MC4xNTIzNDQgMzczLjUxMTcxOSBMIDE4OS4yMzA0NjkgMzQ4LjcwNzAzMSBMIDIxMC4yMTg3NSAzMjMuOTA2MjUgTCAyMzguODM1OTM4IDI5My4zNzg5MDYgTCAyNjUuNTUwNzgxIDI2OC41NzQyMTkgWiBNIDI5MC4zNTE1NjIgMjQ5LjQ5MjE4OCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iIzIzNDE3NiIgZD0iTSA1NS42NzE4NzUgMTA2MC4zNzUgTCA2MS4zOTg0MzggMTA2Ni4xMDE1NjIgTCA3OC41NzAzMTIgMTA5Mi44MTI1IEwgOTcuNjQ4NDM4IDExMTkuNTIzNDM4IEwgMTIyLjQ1MzEyNSAxMTUwLjA1MDc4MSBMIDE0NS4zNDc2NTYgMTE3NC44NTU0NjkgTCAxNzcuNzgxMjUgMTIwNy4yODkwNjIgTCAxOTguNzY5NTMxIDEyMjQuNDYwOTM4IEwgMjIzLjU3NDIxOSAxMjQzLjUzOTA2MiBMIDI1Ni4wMDc4MTIgMTI2NC41MjczNDQgTCAyOTAuMzUxNTYyIDEyODMuNjA5Mzc1IEwgMzIyLjc4OTA2MiAxMjk4Ljg3MTA5NCBMIDM3MC40ODgyODEgMTMxNi4wNDI5NjkgTCA0MTIuNDYwOTM4IDEzMjcuNDkyMTg4IEwgNDUwLjYyMTA5NCAxMzMzLjIxNDg0NCBMIDQ5Ni40MTAxNTYgMTMzMy4yMTQ4NDQgTCA1MjUuMDMxMjUgMTMyNS41ODIwMzEgTCA1NDIuMjAzMTI1IDEzMTQuMTM2NzE5IEwgNTQ5LjgzNTkzOCAxMjk4Ljg3MTA5NCBMIDU1OS4zNzUgMTMwMi42ODc1IEwgNTk5LjQ0MTQwNiAxMzIzLjY3NTc4MSBMIDY1Ni42Nzk2ODggMTM0OC40NzY1NjIgTCA2OTQuODM5ODQ0IDEzNjEuODM1OTM4IEwgNzM4LjcyMjY1NiAxMzc1LjE5MTQwNiBMIDc4Mi42MDU0NjkgMTM4NC43MzA0NjkgTCA4MjQuNTgyMDMxIDEzOTAuNDUzMTI1IEwgOTQyLjg3NSAxMzkwLjQ1MzEyNSBMIDkzNS4yNDIxODggMTM5Ni4xNzU3ODEgTCA4NzYuMDk3NjU2IDE0MjAuOTgwNDY5IEwgODE4Ljg1NTQ2OSAxNDQwLjA1ODU5NCBMIDc1NS44OTQ1MzEgMTQ1NS4zMjQyMTkgTCA2OTQuODM5ODQ0IDE0NjQuODYzMjgxIEwgNjUyLjg2MzI4MSAxNDY4LjY3OTY4OCBMIDU5My43MTg3NSAxNDY4LjY3OTY4OCBMIDU0Mi4yMDMxMjUgMTQ2Mi45NTcwMzEgTCA0OTAuNjg3NSAxNDUzLjQxNzk2OSBMIDQ0OC43MTQ4NDQgMTQ0MS45Njg3NSBMIDM5NS4yODkwNjIgMTQyMi44OTA2MjUgTCAzMzkuOTYwOTM4IDEzOTYuMTc1NzgxIEwgMzA3LjUyMzQzOCAxMzc3LjA5NzY1NiBMIDI3Ni45OTYwOTQgMTM1Ni4xMDkzNzUgTCAyNTQuMTAxNTYyIDEzMzguOTM3NSBMIDIzMy4xMTMyODEgMTMyMS43NjU2MjUgTCAyMTQuMDM1MTU2IDEzMDQuNTkzNzUgTCAxOTEuMTM2NzE5IDEyODMuNjA5Mzc1IEwgMTc3Ljc4MTI1IDEyNjguMzQzNzUgTCAxNTguNzAzMTI1IDEyNDcuMzU1NDY5IEwgMTMwLjA4MjAzMSAxMjA5LjE5OTIxOSBMIDEwOS4wOTc2NTYgMTE3Ni43NjE3MTkgTCA4Ni4xOTkyMTkgMTEzNi42OTUzMTIgTCA2Ny4xMjEwOTQgMTA5NC43MTg3NSBMIDU1LjY3MTg3NSAxMDY2LjEwMTU2MiBaIE0gNTUuNjcxODc1IDEwNjAuMzc1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjM2I5ZGNlIiBkPSJNIDc2My41MjczNDQgMTguNjMyODEyIEwgODUzLjE5OTIxOSAxOC42MzI4MTIgTCA5MDYuNjI1IDI0LjM1NTQ2OSBMIDk1OC4xMzY3MTkgMzMuODk0NTMxIEwgMTAxMS41NjI1IDQ5LjE2MDE1NiBMIDEwNTcuMzUxNTYyIDY2LjMyODEyNSBMIDEwNzQuNTIzNDM4IDczLjk2MDkzOCBMIDEwNjYuODkwNjI1IDc1Ljg3MTA5NCBMIDEwMTMuNDY4NzUgNjQuNDIxODc1IEwgOTgyLjk0MTQwNiA2MC42MDU0NjkgTCA5NTYuMjMwNDY5IDU4LjY5OTIxOSBMIDg3OS45MTAxNTYgNTguNjk5MjE5IEwgODM3LjkzNzUgNjIuNTE1NjI1IEwgNzkyLjE0NDUzMSA3MC4xNDQ1MzEgTCA3MzguNzIyNjU2IDgzLjUgTCA2ODEuNDg0Mzc1IDEwMi41ODIwMzEgTCA2MzcuNjAxNTYyIDEyMS42NjAxNTYgTCA1OTMuNzE4NzUgMTQ0LjU1NDY4OCBMIDU1MS43NDIxODggMTcxLjI2OTUzMSBMIDUxNS40OTIxODggMTk3Ljk4MDQ2OSBMIDQ4OC43ODEyNSAyMjAuODc1IEwgNDYzLjk3NjU2MiAyNDMuNzY5NTMxIEwgNDM1LjM1NTQ2OSAyNzQuMjk2ODc1IEwgNDIwLjA5Mzc1IDI5My4zNzg5MDYgTCAzOTcuMTk5MjE5IDMyMy45MDYyNSBMIDM3Ni4yMTA5MzggMzU2LjMzOTg0NCBMIDM0OS41IDQwNC4wMzkwNjIgTCAzMzQuMjM0Mzc1IDQzNi40NzI2NTYgTCAzMTMuMjQ2MDk0IDQ5MS44MDQ2ODggTCAyOTkuODkwNjI1IDU0My4zMjAzMTIgTCAyOTQuMTY3OTY5IDU3MS45Mzc1IEwgMjg4LjQ0NTMxMiA2MjMuNDUzMTI1IEwgMjg2LjUzNTE1NiA2NzQuOTY4NzUgTCAyODIuNzE4NzUgNjY3LjMzNTkzOCBMIDI3MS4yNzM0MzggNjIzLjQ1MzEyNSBMIDI2My42NDA2MjUgNTc3LjY2NDA2MiBMIDI1OS44MjQyMTkgNTMzLjc4MTI1IEwgMjU5LjgyNDIxOSA0ODkuODk4NDM4IEwgMjYzLjY0MDYyNSA0NDYuMDE1NjI1IEwgMjcxLjI3MzQzOCA0MDQuMDM5MDYyIEwgMjgyLjcxODc1IDM2Mi4wNjI1IEwgMjk3Ljk4NDM3NSAzMjEuOTk2MDk0IEwgMzE1LjE1NjI1IDI4NS43NDYwOTQgTCAzMzIuMzI4MTI1IDI1Ny4xMjUgTCAzNTUuMjIyNjU2IDIyNC42OTE0MDYgTCAzNzYuMjEwOTM4IDE5OS44ODY3MTkgTCAzOTMuMzgyODEyIDE4MC44MDg1OTQgTCA0MTQuMzcxMDk0IDE1OS44MjAzMTIgTCA0MzUuMzU1NDY5IDE0Mi42NDg0MzggTCA0NjIuMDcwMzEyIDEyMS42NjAxNTYgTCA0OTQuNTAzOTA2IDEwMC42NzE4NzUgTCA1MjUuMDMxMjUgODMuNSBMIDU2NS4wOTc2NTYgNjQuNDIxODc1IEwgNTk5LjQ0MTQwNiA1MS4wNjY0MDYgTCA2NDUuMjM0Mzc1IDM3LjcxMDkzOCBMIDY4Ny4yMDcwMzEgMjguMTcxODc1IEwgNzQyLjUzOTA2MiAyMC41MzkwNjIgWiBNIDc2My41MjczNDQgMTguNjMyODEyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZjI3NTNjIiBkPSJNIDEzMzAuMTkxNDA2IDI2NC43NTc4MTIgTCAxMzM3LjgyMDMxMiAyNjQuNzU3ODEyIEwgMTM0MS42MzY3MTkgMjc0LjI5Njg3NSBMIDEzNTguODA4NTk0IDI3Ni4yMDcwMzEgTCAxMzYyLjYyNSAyNzguMTEzMjgxIEwgMTM2NC41MzUxNTYgMzA2LjczNDM3NSBMIDEzNjQuNTM1MTU2IDM3My41MTE3MTkgTCAxMzU4LjgwODU5NCA0MTMuNTc4MTI1IEwgMTM1NC45OTIxODggNDIxLjIxMDkzOCBMIDEzMTEuMTA5Mzc1IDQwMi4xMjg5MDYgTCAxMjcxLjA0Mjk2OSAzNzkuMjM0Mzc1IEwgMTI0NC4zMzIwMzEgMzYwLjE1NjI1IEwgMTIzNC43OTI5NjkgMzUwLjYxNzE4OCBMIDEyMzYuNjk5MjE5IDMzOS4xNjc5NjkgTCAxMjQ2LjIzODI4MSAzMjMuOTA2MjUgTCAxMjY1LjMyMDMxMiAzMDYuNzM0Mzc1IEwgMTMxMy4wMTk1MzEgMjc2LjIwNzAzMSBaIE0gMTMzMC4xOTE0MDYgMjY0Ljc1NzgxMiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y1YmUzOCIgZD0iTSAxMjQwLjUxNTYyNSAxNDguMzcxMDk0IEwgMTI0NC4zMzIwMzEgMTQ4LjM3MTA5NCBMIDEyNTAuMDU0Njg4IDE4Mi43MTQ4NDQgTCAxMjUxLjk2NDg0NCAyMDEuNzk2ODc1IEwgMTI1MS45NjQ4NDQgMjM0LjIzMDQ2OSBMIDEyNDQuMzMyMDMxIDI4MC4wMTk1MzEgTCAxMjQwLjUxNTYyNSAyOTMuMzc4OTA2IEwgMTIyOS4wNjY0MDYgMjg5LjU2MjUgTCAxMTk0LjcyNjU2MiAyNzAuNDgwNDY5IEwgMTE1OC40NzI2NTYgMjUxLjQwMjM0NCBMIDExMjkuODU1NDY5IDIzMi4zMjQyMTkgTCAxMTIwLjMxNjQwNiAyMjQuNjkxNDA2IEwgMTEyMi4yMjI2NTYgMjE1LjE1MjM0NCBMIDExNDguOTMzNTk0IDE5Ni4wNzAzMTIgTCAxMTgxLjM3MTA5NCAxNzYuOTkyMTg4IEwgMTIyMS40Mzc1IDE1Ni4wMDM5MDYgWiBNIDEyNDAuNTE1NjI1IDE0OC4zNzEwOTQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNmNWEzM2MiIGQ9Ik0gMTM5NS4wNjI1IDIwOS40MjU3ODEgTCAxNDA0LjYwMTU2MiAyMTEuMzM1OTM4IEwgMTQ0Mi43NTc4MTIgMjI2LjU5NzY1NiBMIDE0NjkuNDcyNjU2IDI0My43Njk1MzEgTCAxNDc1LjE5NTMxMiAyNDcuNTg1OTM4IEwgMTQ3MS4zNzg5MDYgMjU1LjIxODc1IEwgMTQ1OC4wMjM0MzggMjY4LjU3NDIxOSBMIDE0MzMuMjE4NzUgMjg3LjY1MjM0NCBMIDE0MTQuMTQwNjI1IDI5Ny4xOTE0MDYgTCAxNDAwLjc4NTE1NiAyOTcuMTkxNDA2IEwgMTM5My4xNTIzNDQgMjg3LjY1MjM0NCBMIDEzODUuNTE5NTMxIDI3MC40ODA0NjkgTCAxMzcyLjE2NDA2MiAyNzAuNDgwNDY5IEwgMTM3NC4wNzQyMTkgMjU5LjAzNTE1NiBMIDEzODcuNDI5Njg4IDIzMC40MTQwNjIgTCAxMzkzLjE1MjM0NCAyMTEuMzM1OTM4IFogTSAxMzk1LjA2MjUgMjA5LjQyNTc4MSAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2Y0OTc1NiIgZD0iTSAxMjkyLjAzMTI1IDExMi4xMjEwOTQgTCAxMzEzLjAxOTUzMSAxMTQuMDI3MzQ0IEwgMTM0OS4yNjk1MzEgMTI3LjM4MjgxMiBMIDEzNzAuMjU3ODEyIDEzOC44MzIwMzEgTCAxMzY4LjM0NzY1NiAxNDYuNDY0ODQ0IEwgMTM0Ny4zNjMyODEgMTcxLjI2OTUzMSBMIDEzMjYuMzc1IDE5MC4zNDc2NTYgTCAxMzExLjEwOTM3NSAxOTcuOTgwNDY5IEwgMTMwMS41NzAzMTIgMTk2LjA3MDMxMiBMIDEyOTAuMTIxMDk0IDE3OC44OTg0MzggTCAxMjg0LjM5ODQzOCAxNTYuMDAzOTA2IEwgMTI4NC4zOTg0MzggMTMzLjEwOTM3NSBaIE0gMTI5Mi4wMzEyNSAxMTIuMTIxMDk0ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=" alt="MINDSPARK"></div><div class="aside-txt">MINDSPARK</div></div>
      <div class="aside-sec">MENU</div>
      <div class="navi on"><div class="navi-icon">&#9866;</div> Dashboard</div>
      <div class="navi"><div class="navi-icon">&#9889;</div> Exam<span class="bdg blv" style="margin-left:auto;padding:1px 6px;font-size:9px">LIVE</span></div>
      <div class="navi"><div class="navi-icon">&#9638;</div> Test</div>
      <div class="navi"><div class="navi-icon">&#128202;</div> Results<span class="bct" style="margin-left:auto">3</span></div>
      <div class="navi"><div class="navi-icon">&#128100;</div> Profile</div>
    </div>
  </div>
</div>

<div id="mon" style="margin-bottom:48px">
  <div class="pl pla">Live Monitor &mdash; Student Status Rows</div>
  <div class="demo" style="flex-direction:column;gap:6px;margin-top:12px">
    <div class="mon mon-ok"><div class="sdot" style="background:#22C55E"></div><div><div class="mon-name">Arjun Sharma</div><div class="mon-sub">Roll 042 &middot; Level 4 &middot; Submitted &mdash; LOCKED</div></div><span class="bdg bok">Submitted</span></div>
    <div class="mon mon-am"><div class="sdot" style="background:#F59E0B"></div><div><div class="mon-name">Priya Mehta</div><div class="mon-sub">Roll 018 &middot; Level 3 &middot; Heartbeat timeout 28s</div></div><span class="bdg bwn">Disconnected</span></div>
    <div class="mon mon-bl"><div class="sdot" style="background:#3B82F6;animation:pulse 1.5s ease-in-out infinite"></div><div><div class="mon-name">Rahul Gupta</div><div class="mon-sub">Roll 031 &middot; Level 5 &middot; Q4 of 10</div></div><span class="bdg bin">In Progress</span></div>
    <div class="mon mon-gy"><div class="sdot" style="background:#CBD5E1"></div><div><div class="mon-name">Sneha Joshi</div><div class="mon-sub">Roll 007 &middot; Level 2 &middot; Not yet connected</div></div><span class="bdg" style="background:#F1F5F9;color:#94A3B8">Waiting</span></div>
  </div>
  <div class="info" style="margin-top:12px">State authority: DB Final Submission &gt; REST Sync &gt; WebSocket. Green = permanent once set.</div>
</div>

<div id="pipe" style="margin-bottom:60px">
  <div class="pl pla">Assessment Lifecycle Pipeline</div>
  <div class="demo" style="margin-top:12px">
    <div class="pipe">
      <div class="pipe-step"><div class="pdot pd">&#10003;</div><div class="plbl">Draft</div></div>
      <div class="pline pld"></div>
      <div class="pipe-step"><div class="pdot pd">&#10003;</div><div class="plbl">Published</div></div>
      <div class="pline pld"></div>
      <div class="pipe-step"><div class="pdot pa">&#9679;</div><div class="plbl">Live</div></div>
      <div class="pline plp"></div>
      <div class="pipe-step"><div class="pdot pp">4</div><div class="plbl">Closed</div></div>
    </div>
  </div>
</div>
<div class="hr"></div>

<!-- 16-22 STUDENT COMPONENTS -->
<div id="scards" style="margin-bottom:60px">
  <div class="ey">16 &mdash; Student Components</div>
  <h2 class="st">Student Assessment Cards</h2>
  <div class="demo">
    <div class="sc-live"><div class="sc-type">&#9889; Flash Anzan TEST</div><div class="sc-ttl">Level 4 &mdash; Speed Round</div><div class="sc-meta">Started 2 min ago &middot; 10 questions</div><div class="ss-live">&#9654; LIVE &mdash; Tap to Enter</div></div>
    <div class="sc-pend"><div class="sc-type">&#9638; Vertical EXAM</div><div class="sc-ttl">Level 3 &mdash; Practice Set</div><div class="sc-meta">Starts in 1h 24m</div><div class="ss-pend">&#9200; Scheduled</div></div>
    <div class="sc-lock"><div class="sc-type">&#9889; Flash Anzan TEST</div><div class="sc-ttl">Level 5 &mdash; Advanced</div><div class="sc-meta">Not available</div><div class="ss-lock">&#128274; Locked</div></div>
  </div>
</div>

<div id="flash" style="margin-bottom:60px">
  <div class="pl pls">Flash Anzan Engine &mdash; 3-Phase</div>
  <div class="warn"><strong>CRITICAL: transition:none on number swap.</strong> Any CSS transition causes retinal ghosting. Mandatory during Phase 2. Light background does not change this rule.</div>
  <div class="demo" style="gap:14px;flex-wrap:wrap">
    <div style="flex:1;min-width:180px">
      <p style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Phase 1</p>
      <div class="fscr" style="min-height:150px;padding:20px"><div class="fps">START</div><div style="font-size:20px;font-weight:700;color:var(--t1);margin-bottom:10px">Ready?</div><button class="sbp" style="width:auto;padding:10px 24px;font-size:14px">&#9654; Begin</button></div>
    </div>
    <div style="flex:1;min-width:180px">
      <p style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Phase 2 &mdash; positive</p>
      <div class="fscr" style="min-height:150px"><div class="fps">PHASE 2</div><div class="fn">47</div></div>
    </div>
    <div style="flex:1;min-width:180px">
      <p style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Phase 2 &mdash; negative</p>
      <div class="fscr" style="min-height:150px"><div class="fps">PHASE 2</div><div class="fn fn-neg">-23</div></div>
    </div>
    <div style="flex:1;min-width:180px">
      <p style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Phase 3 &mdash; MCQ</p>
      <div class="fscr" style="min-height:150px;padding:14px;flex-direction:column;gap:8px"><div style="font-size:13px;color:var(--t2)">Answer?</div><div class="mcq"><div class="mq">142</div><div class="mq sel">168&#10003;</div><div class="mq">195</div><div class="mq">221</div></div></div>
    </div>
  </div>
</div>

<div id="exam" style="margin-bottom:60px">
  <div class="pl pls">EXAM &mdash; Vertical Abacus Layout</div>
  <div class="demo" style="gap:24px;align-items:flex-start">
    <div class="exbox">
      <div style="padding:8px 18px 4px;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);text-align:right">Q3 OF 10</div>
      <div class="exeq exalt">+&nbsp;&nbsp;&nbsp;345</div>
      <div class="exeq">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;82</div>
      <div class="exeq exalt" style="color:#991B1B">&minus;&nbsp;&nbsp;&nbsp;194</div>
      <div class="exeq">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;167</div>
      <div style="height:1px;background:var(--b);margin:4px 0"></div>
      <div style="font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);text-align:right;padding:4px 18px">Answer:</div>
    </div>
    <div style="flex:1"><div class="mcq" style="max-width:320px"><div class="mq">347</div><div class="mq sel">412&#10003;</div><div class="mq">389</div><div class="mq">356</div></div><button class="sbp" style="max-width:320px;margin-top:10px">&#8594; Next</button></div>
  </div>
</div>

<div id="mcq" style="margin-bottom:60px">
  <div class="pl pls">MCQ Grid &mdash; All States</div>
  <div class="demo" style="gap:20px;flex-wrap:wrap">
    <div><p style="font-size:11px;color:var(--t3);margin-bottom:8px">Default</p><div class="mcq" style="max-width:200px"><div class="mq">142</div><div class="mq">168</div><div class="mq">195</div><div class="mq">221</div></div></div>
    <div><p style="font-size:11px;color:var(--t3);margin-bottom:8px">Selected (1200ms cooldown)</p><div class="mcq" style="max-width:200px"><div class="mq">142</div><div class="mq sel">168&#10003;</div><div class="mq">195</div><div class="mq">221</div></div></div>
    <div><p style="font-size:11px;color:var(--t3);margin-bottom:8px">Result review</p><div class="mcq" style="max-width:200px"><div class="mq">142</div><div class="mq ok">168&#10003;</div><div class="mq ng">195</div><div class="mq">221</div></div></div>
  </div>
  <div class="info" style="margin-top:12px">Minimum 64&times;64px (Fitts&rsquo;s Law). 1200ms cooldown after tap prevents nervous double-tap. Selected: 3px solid green-800. Wrong answers in review: danger palette (#FEE2E2 / #991B1B) &mdash; NOT negative-number crimson.</div>
</div>

<div id="tmr" style="margin-bottom:60px">
  <div class="pl pls">Timer &amp; Lobby</div>
  <div class="demo" style="gap:24px;align-items:flex-start;flex-wrap:wrap">
    <div>
      <p style="font-size:11px;color:var(--t3);margin-bottom:8px">Normal timer</p>
      <div class="stmr"><span style="font-size:12px;color:var(--g400)">&#9201;</span><span class="stmr-d">04:32</span></div>
    </div>
    <div>
      <p style="font-size:11px;color:var(--t3);margin-bottom:8px">Urgent (&le;20%)</p>
      <div class="stmr amb"><span style="font-size:12px;color:#D97706;opacity:.7">&#9201;</span><span class="stmr-d" style="color:#92400E">00:54</span></div>
    </div>
    <div id="lob" class="lobby">
      <div style="font-size:18px;font-weight:700;color:var(--t1);margin-bottom:4px">Level 4 &mdash; Flash Anzan</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:20px">10 questions &middot; 400ms &middot; 5 min</div>
      <div class="lobby-br"><div class="lobby-bri"></div></div>
      <div style="font-size:11px;color:var(--t3);margin-bottom:10px">breathe &middot; stay calm</div>
      <div class="lobby-tmr">02:47</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;color:var(--t2);margin-bottom:16px"><div style="width:8px;height:8px;border-radius:50%;background:#22C55E"></div> Network: Strong</div>
      <button class="sbp">&#9654; I&rsquo;m Ready</button>
    </div>
    <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:10px">
      <div class="nbanner">&#9888; Network taking a break. Test paused. Teacher knows.</div>
      <div class="offbdg">&#9679; Offline &mdash; Saving Locally</div>
      <div class="intr" style="padding:24px">
        <div class="intr-circle">&#127065;</div>
        <div style="font-size:16px;font-weight:700;color:var(--t1);margin-bottom:6px">Get Ready</div>
        <div style="font-size:12px;color:var(--t2)">Exam starting&hellip;</div>
        <div class="intr-bar"><div class="intr-fill"></div></div>
      </div>
    </div>
  </div>
</div>

<div id="res" style="margin-bottom:60px">
  <div class="pl pls">Result Card</div>
  <div class="demo" style="gap:20px;align-items:flex-start;flex-wrap:wrap">
    <div class="res-card">
      <div class="res-lbl">Final Score</div>
      <div class="res-score">87%</div>
      <div class="res-grade">A &middot; Excellent</div>
      <div style="font-size:13px;color:var(--t2);margin-bottom:14px">Level 4 &middot; Flash Anzan &middot; 8 / 10</div>
      <div style="background:var(--g50);border:1px solid var(--g200);border-radius:8px;padding:10px;font-size:12px;color:var(--g600);text-align:center;margin-bottom:14px">Your brain worked hard! &#129504;</div>
      <button class="sbp" style="font-size:14px;padding:12px">View Details</button>
    </div>
    <div style="flex:1;min-width:280px">
      <div class="rv-h"><div class="rv-hc">Equation</div><div class="rv-hc">Answer</div><div class="rv-hc">Verdict</div></div>
      <div class="rv-r"><div class="rv-c">345+82&minus;194</div><div class="rv-c ok">233</div><div class="rv-c ok">&#10003; Correct</div></div>
      <div class="rv-r"><div class="rv-c">167&minus;53+89</div><div class="rv-c ng">198</div><div class="rv-c ng">&#10007; Wrong</div></div>
    </div>
  </div>
</div>
<div class="hr"></div>

<!-- 23-26 SPECS -->
<div id="lay" style="margin-bottom:60px">
  <div class="ey">23 &mdash; Structure</div>
  <h2 class="st">Layout &amp; Motion Summary</h2>
  <div class="g2">
    <div class="card" style="border-left:4px solid var(--g500)"><div class="pl pla" style="margin-bottom:12px">Admin</div><table class="tbl"><tbody><tr><td>Sidebar</td><td>260px fixed</td></tr><tr><td>Top header</td><td>64px fixed</td></tr><tr><td>Content bg</td><td>#F8FAFC</td></tr><tr><td>Min width</td><td>1280px</td></tr></tbody></table></div>
    <div class="card" style="border-left:4px solid var(--g500)"><div class="pl pls" style="margin-bottom:12px">Student</div><table class="tbl"><tbody><tr><td>Sidebar</td><td>220px &rarr; 48px collapse at &lt;768px</td></tr><tr><td>Flash Phase 2</td><td>Full viewport, zero peripheral UI</td></tr><tr><td>Lobby</td><td>Max-width 480px, centred</td></tr><tr><td>MCQ to equation</td><td>Max 200px distance</td></tr></tbody></table></div>
  </div>
</div>

<div id="mot" style="margin-bottom:60px">
  <div class="ey">24 &mdash; Motion</div>
  <h2 class="st">Motion Tokens</h2>
  <div class="mg">
    <div class="mc"><div class="mc-n">Hover</div><div class="mc-v">150ms ease</div><div class="mc-w">Buttons, nav, badges</div></div>
    <div class="mc"><div class="mc-n">Card lift</div><div class="mc-v">200ms &middot; shadow-sm&rarr;md</div><div class="mc-w">KPI + student cards on hover</div></div>
    <div class="mc"><div class="mc-n">KPI count-up</div><div class="mc-v">800ms ease-out</div><div class="mc-w">Numbers animate from 0 on mount</div></div>
    <div class="mc"><div class="mc-n">Skeleton shimmer</div><div class="mc-v">1.5s ease-in-out &#8734;</div><div class="mc-w">All skeleton blocks in sync</div></div>
    <div class="mc" style="border-left:3px solid #EF4444"><div class="mc-n">Flash number</div><div class="mc-v">0ms &mdash; NONE</div><div class="mc-w">MANDATORY Phase 2. Non-negotiable.</div></div>
    <div class="mc"><div class="mc-n">Lobby exit</div><div class="mc-v">400ms cubic-bezier(.25,1,.5,1)</div><div class="mc-w">scale(.95) opacity:0 before exam</div></div>
    <div class="mc"><div class="mc-n">Result entrance</div><div class="mc-v">400ms cubic-bezier(.16,1,.3,1)</div><div class="mc-w">translateY(24px)&rarr;0 + opacity</div></div>
    <div class="mc"><div class="mc-n">LIVE badge</div><div class="mc-v">1.5s ease-in-out &#8734;</div><div class="mc-w">Sidebar + monitor pulse</div></div>
  </div>
</div>

<div id="acc" style="margin-bottom:60px">
  <div class="ey">25 &mdash; Accessibility</div>
  <h2 class="st">WCAG 2.2 AAA</h2>
  <div class="card">
    <table class="tbl">
      <thead><tr><th>Context</th><th>Foreground</th><th>Background</th><th>Ratio</th><th>Level</th></tr></thead>
      <tbody>
        <tr><td>Body text</td><td>#0F172A</td><td>#FFFFFF</td><td>~19:1</td><td><span class="waaa">AAA</span></td></tr>
        <tr><td>Flash positive</td><td>#0F172A</td><td>#FFFFFF</td><td>21:1</td><td><span class="waaa">AAA</span></td></tr>
        <tr><td>Flash negative (crimson)</td><td>#991B1B</td><td>#FFFFFF</td><td>9.7:1</td><td><span class="waaa">AAA</span></td></tr>
        <tr><td>Flash fast mode</td><td>#334155</td><td>#F1F5F9</td><td>~11:1</td><td><span class="waaa">AAA</span></td></tr>
        <tr><td>Green-800 on green-50</td><td>#1A3829</td><td>#EFFAF4</td><td>~10.5:1</td><td><span class="waaa">AAA</span></td></tr>
        <tr><td>MINDSPARK navy on white</td><td>#204074</td><td>#FFFFFF</td><td>~9.8:1</td><td><span class="waaa">AAA</span></td></tr>
        <tr><td style="color:#991B1B">FF6B6B (v1) on white &mdash; BANNED</td><td>#FF6B6B</td><td>#FFFFFF</td><td>3.6:1</td><td><span class="wfl">FAIL</span></td></tr>
      </tbody>
    </table>
  </div>
</div>

<div id="sts" style="margin-bottom:60px">
  <div class="ey">26 &mdash; States</div>
  <h2 class="st">Interactive States</h2>
  <div class="card">
    <table class="tbl">
      <thead><tr><th>State</th><th>Primary Button</th><th>Nav Item</th><th>Student MCQ</th></tr></thead>
      <tbody>
        <tr><td><strong>Default</strong></td><td>bg green-800 &middot; white</td><td>bg transparent &middot; gray-600</td><td>bg white &middot; 1.5px #E2E8F0 &middot; shadow-sm</td></tr>
        <tr><td><strong>Hover</strong></td><td>bg green-700 &middot; 150ms</td><td>bg #F8FAFC</td><td>border green-400 &middot; bg green-50</td></tr>
        <tr><td><strong>Selected</strong></td><td>bg green-900</td><td>bg green-50 &middot; 3px left green-700</td><td>3px solid green-800 &middot; 1200ms cooldown</td></tr>
        <tr><td><strong>Focus</strong></td><td>outline 2px green-400 offset 2px</td><td>outline 2px green-300</td><td>outline 2px green-400 offset 2px</td></tr>
        <tr><td><strong>Disabled</strong></td><td>opacity .4 &middot; not-allowed</td><td>opacity .4</td><td>opacity .4 &middot; pointer-events none</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="hr"></div>

<!-- 27 DO DONT -->
<div id="dd" style="margin-bottom:60px">
  <div class="ey">27 &mdash; Guidelines</div>
  <h2 class="st">Do&rsquo;s &amp; Don&rsquo;ts</h2>
  <div class="dd" style="margin-bottom:14px">
    <div class="do-c"><div class="do-lbl">&#10003; Do</div><ul class="rl">
      <li>Use the MINDSPARK logo mark (1.svg) in all sidebar + loading contexts</li>
      <li>Use MINDSPARK Navy (#204074) only for brand anchor surfaces (login, loading, footer)</li>
      <li>Use green-800 for all interactive UI (buttons, nav, LIVE card border)</li>
      <li>Use #991B1B for negative arithmetic numbers only &mdash; never for errors</li>
      <li>Set transition:none on flash number elements during Phase 2 &mdash; always</li>
      <li>Enforce 64px MCQ minimum touch target and 1200ms cooldown</li>
      <li>Show MINDSPARK Navy loading screen on app boot with orange progress bar</li>
    </ul></div>
    <div class="dn-c"><div class="dn-lbl">&#10007; Don&rsquo;t</div><ul class="rl">
      <li>Never use MINDSPARK Orange (#F57A39) in interactive UI (button states, badges)</li>
      <li>Never use MINDSPARK Blue (#3A9ED1) in UI system (causes confusion with info states)</li>
      <li>Never use #FF6B6B on any surface (3.6:1, fails WCAG AA on white)</li>
      <li>Never animate the flash number swap &mdash; transition:none is mandatory</li>
      <li>Never use red for the exam timer countdown</li>
      <li>Never render peripheral UI during Flash Phase 2</li>
      <li>Never set flash intervals below 200ms without neurologist override</li>
    </ul></div>
  </div>
</div>
<div class="hr"></div>

<!-- 28 TOKENS -->
<div id="tok" style="margin-bottom:60px">
  <div class="ey">28 &mdash; Reference</div>
  <h2 class="st">CSS Variables &mdash; Final Token Sheet v3</h2>
  <div class="cb"><pre>
<span class="cc">/* ================================================================
   MINDSPARK Design Tokens v3.0 — FINAL
   Unified Light System (Admin + Student)
   Brand: MINDSPARK  |  Platform: Mental Arithmetic Assessment
================================================================ */</span>

<span class="ck">:root</span> {

  <span class="cc">/* MINDSPARK BRAND PALETTE (logo colours — identity surfaces only) */</span>
  <span class="ck">--ms-navy</span>:    <span class="cv">#204074</span>;  <span class="cc">/* Footer bg · Login page · Loading screen bg */</span>
  <span class="ck">--ms-navy2</span>:   <span class="cv">#234176</span>;  <span class="cc">/* Logo mark secondary navy */</span>
  <span class="ck">--ms-blue</span>:    <span class="cv">#3A9ED1</span>;  <span class="cc">/* Logo mark sky blue — do NOT use in UI components */</span>
  <span class="ck">--ms-orange</span>:  <span class="cv">#F57A39</span>;  <span class="cc">/* Logo mark orange — loading bar on navy bg only */</span>
  <span class="ck">--ms-yellow</span>:  <span class="cv">#F5BE38</span>;  <span class="cc">/* Logo mark yellow — do NOT use in UI components */</span>

  <span class="cc">/* UI SYSTEM — both panels (Forest Green light, Donezo-inspired) */</span>
  <span class="ck">--page</span>:    <span class="cv">#F8FAFC</span>;  <span class="cc">/* Canvas behind cards */</span>
  <span class="ck">--card</span>:    <span class="cv">#FFFFFF</span>;  <span class="cc">/* All card surfaces */</span>
  <span class="ck">--border</span>:  <span class="cv">#E2E8F0</span>;
  <span class="ck">--bmd</span>:     <span class="cv">#CBD5E1</span>;
  <span class="ck">--t1</span>:      <span class="cv">#0F172A</span>;  <span class="cc">/* Primary text + Flash number (positive) */</span>
  <span class="ck">--t2</span>:      <span class="cv">#475569</span>;
  <span class="ck">--t3</span>:      <span class="cv">#94A3B8</span>;

  <span class="cc">/* GREEN RAMP (UI primary) */</span>
  <span class="ck">--g900</span>: <span class="cv">#0D2B1F</span>;
  <span class="ck">--g800</span>: <span class="cv">#1A3829</span>;  <span class="cc">/* KPI hero · CTAs · LIVE border · Result score */</span>
  <span class="ck">--g700</span>: <span class="cv">#1E4A35</span>;  <span class="cc">/* Button hover */</span>
  <span class="ck">--g600</span>: <span class="cv">#2D6A4F</span>;  <span class="cc">/* Chart bars · grade colour */</span>
  <span class="ck">--g500</span>: <span class="cv">#40916C</span>;  <span class="cc">/* Correct answers · trend text */</span>
  <span class="ck">--g400</span>: <span class="cv">#52B788</span>;  <span class="cc">/* MCQ hover border */</span>
  <span class="ck">--g300</span>: <span class="cv">#74C69D</span>;  <span class="cc">/* Timer border · breathing circle */</span>
  <span class="ck">--g200</span>: <span class="cv">#B7E4C7</span>;  <span class="cc">/* Active sidebar icon bg */</span>
  <span class="ck">--g50</span>:  <span class="cv">#EFFAF4</span>;  <span class="cc">/* Active nav bg · MCQ selected tint · timer bg */</span>

  <span class="cc">/* SEMANTIC */</span>
  <span class="ck">--live</span>:    <span class="cv">#EF4444</span>;
  <span class="ck">--ok-bg</span>:   <span class="cv">#DCFCE7</span>; <span class="ck">--ok-tx</span>:  <span class="cv">#166534</span>;
  <span class="ck">--wn-bg</span>:   <span class="cv">#FEF9C3</span>; <span class="ck">--wn-tx</span>:  <span class="cv">#854D0E</span>;
  <span class="ck">--er-bg</span>:   <span class="cv">#FEE2E2</span>; <span class="ck">--er-tx</span>:  <span class="cv">#991B1B</span>;
  <span class="ck">--in-bg</span>:   <span class="cv">#DBEAFE</span>; <span class="ck">--in-tx</span>:  <span class="cv">#1E40AF</span>;

  <span class="cc">/* STUDENT ARITHMETIC CRIMSON
     ─── NEGATIVE NUMBERS ONLY ───
     Flash Anzan Phase 2 negative operands + EXAM negative rows
     NOT for: wrong answers, errors, danger states
     9.7:1 AAA on #FFFFFF. Equiluminant to #0F172A in CIELAB. */</span>
  <span class="ck">--s-neg</span>: <span class="cv">#991B1B</span>;

  <span class="cc">/* FLASH CONTRAST (light surface, recalibrated) */</span>
  <span class="ck">--ff-std-tx</span>:  <span class="cv">#0F172A</span>; <span class="ck">--ff-std-bg</span>:  <span class="cv">#FFFFFF</span>;  <span class="cc">/* ≥500ms */</span>
  <span class="ck">--ff-mid-tx</span>:  <span class="cv">#1E293B</span>; <span class="ck">--ff-mid-bg</span>:  <span class="cv">#F8FAFC</span>;  <span class="cc">/* 300ms  */</span>
  <span class="ck">--ff-fast-tx</span>: <span class="cv">#334155</span>; <span class="ck">--ff-fast-bg</span>: <span class="cv">#F1F5F9</span>;  <span class="cc">/* &lt;300ms + 30ms fade */</span>

  <span class="cc">/* TYPOGRAPHY */</span>
  <span class="ck">--font-sans</span>: <span class="cs">'DM Sans'</span>,  sans-serif;
  <span class="ck">--font-mono</span>: <span class="cs">'DM Mono'</span>, monospace;  <span class="cc">/* All numbers, timers, equations */</span>

  <span class="cc">/* SHADOWS */</span>
  <span class="ck">--shadow-sm</span>: <span class="cv">0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)</span>;
  <span class="ck">--shadow-md</span>: <span class="cv">0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)</span>;
  <span class="ck">--shadow-lg</span>: <span class="cv">0 10px 32px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)</span>;

  <span class="cc">/* RADIUS */</span>
  <span class="ck">--r1</span>:<span class="cv">4px</span>; <span class="ck">--r2</span>:<span class="cv">6px</span>; <span class="ck">--r3</span>:<span class="cv">10px</span>; <span class="ck">--r4</span>:<span class="cv">14px</span>; <span class="ck">--r5</span>:<span class="cv">18px</span>; <span class="ck">--rf</span>:<span class="cv">9999px</span>;
}

<span class="cc">/* BRAND LOGO PATHS */</span>
<span class="cc">/* public/brand/logo-mark.svg     — 1.svg (icon mark, inline anywhere) */</span>
<span class="cc">/* public/brand/logo-wordmark.svg — 2.svg (full MINDSPARK lockup, login/email) */</span>

<span class="cc">/* CRITICAL FLASH RULE */</span>
<span class="cc">/* .flash-number { transition: none !important; } */</span>

<span class="cc">/* SKELETON SHIMMER */</span>
<span class="cc">/* .sk-block { background: linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); */</span>
<span class="cc">/*   background-size:400% 100%; animation:shimmer 1.5s ease-in-out infinite; } */</span>
</pre></div>
</div>

</div>

<footer>
  <strong>MINDSPARK Design System v3.0 &mdash; Final</strong> &middot; Brand palette extracted from official logo SVGs &middot; Unified Forest Green light system (Admin + Student) &middot; Lucide React icons &middot; Lottie abacus loader &middot; Skeleton screens &middot; WCAG 2.2 AAA &middot; Crimson #991B1B for negative arithmetic only
</footer>
</body>
</html>

----------------- end of abacus-edge-design-spec (4).html----------------------------------