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
- Platform: Web, desktop-first (1440px canvas)
- Theme: Light, minimal, sophisticated, trustworthy, generous whitespace
- Product: MINDSPARK — mental arithmetic assessment platform for ages 6–18
- Background: Page Slate (#F8FAFC)
- Surface: Pure White (#FFFFFF) with Slate 200 border (#E2E8F0, 1px)
- Primary Accent: Forest Green 800 (#1A3829) for CTAs, active nav, LIVE borders, KPI headline numbers
- Hover Accent: Forest Green 700 (#1E4A35)
- Light Accent: Forest Green 50 (#EFFAF4) with Forest Green 200 (#B7E4C7) border for active nav background and subtle pills
- Text Primary: Near Black Slate (#0F172A) for headings and body-primary
- Text Secondary: Slate 600 (#475569) for secondary body and captions
- Text Subtle: Slate 400 (#94A3B8) for micro-labels, uppercase metadata, placeholders
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
- Card radius: 14px
- Dialog radius: 18px
- Pill radius: 9999px
- Default button: h-40 px-16 DM Sans 14/500, primary = Forest Green 800 bg + white text
- Card: white bg, Slate 200 border, radius 14, shadow 0 1px 3px rgba(0,0,0,.06) and 0 1px 2px rgba(0,0,0,.04), padding 24px
- Hero card: white bg, 2px Forest Green 800 border, radius 14, shadow 0 4px 12px rgba(0,0,0,.08) and 0 2px 4px rgba(0,0,0,.04), padding 28px
- Dialog: white bg, radius 18, shadow 0 10px 32px rgba(0,0,0,.12)
- Sidebar: 240px fixed, white background, Slate 200 right border, Forest Green 50 active row with Forest Green 800 text and 600 weight
- Admin top header: 64px, white, Slate 200 bottom border
- Student top header: 56px, white, Slate 200 bottom border
- Icons: lucide-react line icons, 18×18 in sidebar, 16×16 inline, 1.5 stroke
- Forbidden: emoji anywhere, dark sidebar, heavy drop shadows, rainbow gradients, cartoon illustrations, bouncy animations
- Accessibility: all interactive targets ≥ 40×40, 3px Forest Green focus ring at 40% opacity with 2px offset, WCAG AAA contrast where possible
```

---

## 01 — Admin Dashboard

A sophisticated, data-dense admin dashboard for an educational assessment platform. Opens on the KPI overview with four live stat cards, a 60/40 charts row, a Live Pulse widget for the currently-running exam, and a recent activity feed. Trustworthy, professional, restrained.

[paste shared DESIGN SYSTEM block here]

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

[paste shared DESIGN SYSTEM block here]

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

[paste shared DESIGN SYSTEM block here]

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

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Full-viewport white canvas (#FFFFFF).** No sidebar, no header, no footer, no borders, no shadows, no navigation.
2. **Single Centered Number:** A positive arithmetic number centered horizontally and vertically. Font: **DM Mono 700 tabular, size `clamp(96px, 30vh, 180px)`, color #0F172A**. No transitions. No animation. No container. Just the number floating in white space.
3. **Negative Number Variant:** If the current flash is a negative number, the hyphen + number renders in **#991B1B** (spec-required crimson). No other UI element may use this hex.
4. **Phase Transition (Phase 1 → Phase 2):** A brief 400ms fade from the intro interstitial into the flash view. After the flash sequence completes, an interstitial card slides up (400ms cubic-bezier(0.16, 1, 0.3, 1)).
5. **Absolute rules:** No timer overlay. No question number. No progress bar. No network banner unless truly offline (in which case it appears as a thin top-bar warning with border-top-4 amber). No animations on the flash-number itself — `.flash-number` must have `transition: none !important`.

---

## 05 — MCQ / Vertical Exam View

The vertical-format post-flash MCQ view. An equation panel at the top, 4 option tiles below (A/B/C/D), a confirm button, and a compact question navigator sidebar. Professional and calm.

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Full-canvas layout:** Sidebar hidden. Content centered in a max-width 720px column.
2. **Top Bar (fixed, 56px):** White bg, Slate 200 bottom border. Left: exam title DM Sans 14/500 Slate 600 + "Question 3 of 20" DM Mono 14/500 tabular Near Black. Right: timer pill (Green 50 bg, Green 300 border, radius-pill, padding 8×16) with DM Mono 30/500 Forest Green 800 tabular "14:23" text.
3. **Equation Panel:** A white card (Slate 200 border, radius 14, shadow-sm, padding 32, margin-top 32). Centered inside: the equation in **DM Mono 26/400 Near Black tabular**, multi-line acceptable ("  142\n+ 87\n─────\n").
4. **MCQ Grid:** A 2×2 grid (max-width 560px) with 16px gaps. Each option is a large tile: white bg, 2px Slate 200 border by default, radius 14, padding 28, h-96. Inside the tile: a circular letter badge (32×32, Slate 100 bg, DM Sans 16/700 Near Black) labeled A/B/C/D on the left, and the answer value in **DM Mono 26/500 Near Black tabular** on the right. Hover state: border Forest Green 400, bg Forest Green 50 at 50% opacity. Selected state: border 3px Forest Green 800, bg Forest Green 50, letter badge becomes Forest Green 800 bg + white text.
5. **Confirm Button Row:** After selection, a "Confirm Answer" button slides in from 8px below with 200ms ease-out opacity + translateY. XL size, Forest Green 800 bg, white text, radius 10, full-width max 320px, centered.
6. **Question Navigator (compact sidebar, 280px fixed right):** White card, Slate 200 border, radius 14, padding 20. Title "Questions" DM Sans 14/700 uppercase letter-spaced Slate 400 at top. Below: 5-column grid of 32×32 circular chips. Each chip is DM Mono 12/700 tabular. States: Unanswered = Slate 100 bg + Slate 400 text, Answered = Forest Green 50 bg + Forest Green 800 text, Current = Forest Green 800 bg + white text, Marked = Yellow 100 bg + Yellow 800 text.

---

## 06 — Student Results Page

A reflection screen. Hero card with the latest published result (white bg with 2px green border), a 6-month score trend chart, and lists of pending + completed results.

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Student layout chrome:** 240px white sidebar + 56px top header, same as student dashboard.
2. **Page Heading:** H1 "My Results" DM Sans 30/700 Near Black.
3. **Latest Result Hero Card:** White bg, 2px Forest Green 800 border, radius 14, shadow-md, padding 28×32. Flex row, wrap allowed.
   - **Left flex:** "LATEST RESULT" uppercase caption DM Sans 11/700 Forest Green 600 letter-spaced 0.08em. Below: exam title DM Sans 20/700 Near Black. Below: "Published **12 April 2026**" DM Sans 12/400 Slate 600.
   - **Right flex (score + grade):** Score block — **DM Mono 52/700 Forest Green 800 tabular** "87" with a smaller "%" suffix (DM Mono 22 Forest Green 600). Below: "SCORE" uppercase 10/700 Slate 400. Then a grade pill — Forest Green 50 bg, Green 200 border, radius 10, padding 14×22 — with **DM Mono 36/700 Forest Green 800** "A" inside and "GRADE" uppercase 10/700 Green 700 below.
4. **Score Trend Chart Card:** White card with title "Score Trend" DM Sans 18/600 Near Black. Inside: a recharts area chart, 2+ data points, stroke Forest Green 800, area fill rgba(26,56,41,0.06), x-axis DM Sans 12 Slate 600, y-axis DM Sans 12 Slate 600.
5. **Pending Evaluation Section:** H2 "Pending Evaluation" DM Sans 15/700 Near Black. Below: list of 2 pending cards — each white, Slate 200 border, radius 14, padding 16. Shows title + pending badge (Slate 100 bg, Slate 600 text, pill, "Pending").
6. **Completed Section:** H2 "Previous Results" DM Sans 15/700 Near Black. Below: list of 5 completed cards — each white, Slate 200 border, radius 14, padding 16, with exam title, grade pill, score in DM Mono 16/600 tabular, and a chevron-right on the far right.

---

## 07 — Admin Students List

A filterable, paginated table of students. Search bar, level filter, bulk action bar, and paginated table with 25 rows per page.

[paste shared DESIGN SYSTEM block here]

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

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Admin chrome.** H1 "Student Details" + breadcrumb "Students / **Priya Shah**" at the top.
2. **Profile Hero Card:** White, Slate 200 border, radius 14, shadow-sm, padding 32, flex row. Left: 96×96 Forest Green 800 circular avatar with white DM Sans 32/700 initials. Right flex: H2 student name DM Sans 24/700 Near Black; "Candidate ID: **STUDENT-042**" DM Mono tabular 14; Level pill (Green 50 bg, Green 200 border, Green 800 text); "Joined **15 March 2026**" DM Sans 13/400 Slate 600.
3. **Stats Row:** 4-column grid (16px gap) of mini stat cards — Exams Completed / Avg Score / Best Grade / Hours Spent. Each card: white, Slate 200 border, radius 14, padding 20, with a 12/500 Slate 600 label and a DM Mono 32/700 tabular Near Black value.
4. **Session History Table:** White card with H3 "Recent Sessions" DM Sans 18/600 Near Black. Table inside — Date (DM Mono), Exam Title, Score (DM Mono with color coding), Grade (pill), Status (badge), View button.
5. **Action Buttons Row:** Secondary actions aligned to the right — outline "Reset Password", outline "Suspend Account", destructive red-50 "Delete Student".

---

## 09 — Admin Assessments List

Two-tab list (EXAM | TEST) with status filters and a grid of assessment cards. Primary CTA: "Create Assessment".

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Admin chrome.** H1 "Assessments" + primary "+ Create Assessment" button on the right (Forest Green 800, h-40).
2. **Tab Strip:** Two pill tabs — "EXAM" and "TEST". Selected tab has Forest Green 800 bg + white text. Unselected has Slate 100 bg + Slate 600 text. Pill h-40 px-24 radius-pill.
3. **Status Filter Row:** Four outline chips — "All", "Draft", "Published", "Live", "Closed". Selected chip Forest Green 800 border + Forest Green 800 text bg Forest Green 50. Unselected chip Slate 200 border + Slate 600 text bg white. h-36 radius-pill.
4. **Card Grid:** 3-column grid (16px gap) of assessment cards. Each card: white, Slate 200 border, radius 14, shadow-sm, padding 20. Top row: status badge (colored by state — Draft = Slate, Published = Blue, Live = Red pulsing, Closed = Green). Middle: title H3 18/600 Near Black, subtitle "Level 3 · 30 min · 20 Q" DM Sans 13/400 Slate 600. Bottom row: 3 meta stats in DM Mono (students assigned, submissions, avg score). Footer: "View →" link Forest Green 800 13/600 + 3-dot menu icon.

---

## 10 — Admin Create Assessment Wizard

A 3-step modal dialog for creating an assessment: Type → Questions → Config. Progressive disclosure.

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Modal Dialog (shadcn style):** Centered, max-width 720px, white bg, radius 18, shadow-lg, padding 32, backdrop rgba(15,23,42,0.4).
2. **Header Row:** "Create New Assessment" DM Sans 22/700 Near Black on the left; X close icon on the top-right.
3. **Step Indicator:** Horizontal row of 3 steps — "1 Type", "2 Questions", "3 Config" — with active step Forest Green 800 filled circle + Forest Green 800 text, completed step Slate 600 circle with checkmark + Slate 600 text, upcoming step Slate 200 circle + Slate 300 text. Lines between circles.
4. **Step 1 (Type) content:** Two large selector tiles side-by-side — "EXAM (Vertical MCQ)" and "TEST (Flash Anzan)" — each a white tile with Slate 200 border (radius 14, padding 24, h-160). Selected tile has 2px Forest Green 800 border + Forest Green 50 tint + a Forest Green 800 icon block at the top + a green check in the corner. Each tile shows an icon (clipboard-list / zap), a title 18/600 Near Black, and a 2-line description 13/400 Slate 600.
5. **Step 2 (Questions):** Placeholder for question bank chooser + drag-ordering list.
6. **Step 3 (Config):** Form with labeled fields — Duration (number input + "minutes"), Level (select), Scheduled Open (datetime), Scheduled Close (datetime), Instructions (textarea).
7. **Footer Row:** "Cancel" outline button on the left; "Back" outline + "Next" primary (Forest Green 800) stacked right — the primary becomes "Create Assessment" on the final step.

---

## 11 — Admin Live Monitor

Real-time supervision of a running exam. Header with exam title + LIVE badge + Force Close button + countdown. Summary counts, search, and a paginated student table that updates in real time.

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Admin chrome.**
2. **Header Row:** H1 "E2E Full Test Exam" DM Sans 24/700 Near Black on the left with an inline LIVE badge (Red 500 bg, white text pill, pulsing). Below the title: "Time remaining: **00:14:23**" DM Sans 14/500 Slate 500 with the timer in DM Mono 14/700 Near Black tabular. On the right: destructive "Force Close Exam" button (Red 50 bg, Red 200 border, Red 700 text, h-36 px-16 radius 10).
3. **Summary Count Row:** 4-column grid, 12px gap. Each cell is a colored mini card — In Progress (Green 50 bg, Green 200 border, padding 12), Submitted (Blue 50 / Blue 200), Disconnected (Red 50 / Red 200), Waiting (Slate 50 / Slate 200). Inside each: a DM Mono 24/700 tabular number + a 12/500 label below.
4. **Student Table (white card):**
   - Filter row: search input ("Search by name or roll number…") + "12 students" counter on the right in DM Mono 12 Slate 500.
   - Table: uppercase Slate 500 header row. Columns — Student (avatar + name + roll), Status (colored badge), Progress (a horizontal thin progress bar in Slate 100 with Forest Green 800 fill + "3/20" DM Mono 12 tabular on the right), Last Seen (DM Sans 12 Slate 500 relative time), Actions ("View Profile" link Forest Green 800 12/500 underlined).
5. **Real-time update hint:** Bottom-right floating pill (Slate 50 bg, Slate 200 border, DM Sans 11/500 Slate 600 "● Live updating") with a small green pulsing dot on the left.

---

## 12 — Admin Announcements

Two-column layout: editor on the left, published list on the right. TipTap rich-text editor with tokenized toolbar.

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Admin chrome.** H1 "Announcements" DM Sans 30/700 Near Black.
2. **Two-column grid:** Left 60%, right 40%, 24px gap.
3. **Left column — Editor Card:** White, Slate 200 border, radius 14, padding 24. Title "New Announcement" DM Sans 18/600. Below: Title input (h-40 radius 10). Below: Body TipTap editor — a toolbar row (Bold/Italic/Underline/Link/List — each a 36×36 icon button with Slate 200 border, rounded 8, hover Slate 100), then a 280px-tall textarea with Slate 200 border radius 10, DM Sans 14/400 Near Black. Footer: "Publish" primary (Forest Green 800 h-40) + "Save Draft" outline.
4. **Right column — Published List Card:** Title "Published" DM Sans 18/600. Below: list of 5 announcement rows. Each row: title 14/600 Near Black, 13/400 Slate 600 excerpt line, 12/400 Slate 400 relative timestamp, and a right-aligned read-count pill (Slate 50 bg, Slate 200 border, DM Mono 11/500 Slate 600).

---

## 13 — Admin Results

Grade distribution chart, filter bar, and a paginated table of submissions with grade badges. Publish-results button.

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Admin chrome.** H1 "Results" DM Sans 30/700. Right: primary "Publish Selected" button Forest Green 800 h-40.
2. **Filter Row:** Assessment select (flex-1 h-40), Level select (w-180), Date range picker (w-240), all inside a white card.
3. **Grade Distribution Chart Card:** White card with H3 "Grade Distribution" DM Sans 18/600. Inside: horizontal stacked bar chart with 5 segments — A+ (Emerald 500), A (Green 600), B (Amber 500), C (Orange 500), F (Red 600). Legend below with count + percentage in DM Mono 12 tabular.
4. **Results Table:** Student name + avatar, Exam, Submitted At (DM Mono), Score (DM Mono bold), Grade (pill), Status (badge: Pending / Published / Archived), Actions (View Result + 3-dot menu).
5. **Bulk Action Bar (floating fixed bottom center):** "X results selected" + "Publish All" primary + "Cancel" outline. Pill shape, Forest Green 800 bg, white text, shadow-lg, only visible when > 0 selected.

---

## 14 — Admin Levels

Drag-and-drop sortable list of curriculum levels with a student-count tile.

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Admin chrome.** H1 "Levels" DM Sans 30/700. Right: primary "+ Add Level" button.
2. **Level List:** Vertical stack of level cards (16px gap). Each card: white, Slate 200 border, radius 14, padding 16, flex row. Left: drag handle (grip-vertical icon, 24×24, Slate 300). Middle flex: level name H3 16/600 Near Black + "24 students" caption 13/400 Slate 500. Right: Active pill (Green 50 bg + Green 200 border + Green 800 text + uppercase 11/700), Edit + 3-dot menu.
3. **Stats Strip:** Single white card (max-width 240, centered below the list) showing "Total Student Load" 12/500 Slate 500 label + DM Mono 32/700 tabular Near Black value.

---

## 15 — Admin Settings

Form-heavy single-column page with grade boundary editor, institution settings, and a support card on the right.

[paste shared DESIGN SYSTEM block here]

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

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Admin chrome.** H1 "Activity Log" DM Sans 30/700.
2. **Filter Row:** Inside a white card — Actor select, Action type multi-select, Date range picker, Entity type select, Clear button.
3. **Activity Table:** White card wrapper. Columns: Timestamp (DM Mono 13 Slate 600), Actor (28×28 avatar + DM Sans 14/500 Near Black name), Action (colored pill: RESET_PASSWORD in Red 50/200/700, FORCE_OPEN_EXAM in Yellow 50/200/800, SUBMIT_EXAM in Green 50/200/800, etc.), Entity (DM Sans 13 Slate 600 type + link), Metadata (mono ellipsis if present).
4. **Pagination Row.**

---

## 17 — Student Profile

A card-based profile page. Hero ID card with avatar + name + Candidate ID + level pill. Meta strip below with member-since + status.

[paste shared DESIGN SYSTEM block here]

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

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Student chrome.** H1 "Exams" DM Sans 30/700 Near Black.
2. **LIVE NOW Section** (only rendered if any LIVE paper): Section caption "LIVE NOW" uppercase 11/700 Red 500 letter-spaced. Below: LiveExamCard (same hero style as student dashboard — white bg, 2px green border, LIVE badge, countdown, enter button).
3. **Upcoming Section:** H2 "Upcoming" DM Sans 18/600 Near Black. Below: vertical list of exam rows (same date-badge style as student dashboard upcoming row — APR 8 date block + title + meta + chevron).
4. **Completed Section:** H2 "Completed" DM Sans 18/600 Near Black. Below: vertical list of rows showing title, score pill (DM Mono), and a "View Result →" link.
5. **Empty State (if all 3 sections are empty):** Centered card with book-open icon (32×32 Slate 400), H3 "No exams scheduled yet" 15/600 Near Black, and body "Your exams will appear here when they're published." 13/400 Slate 500.

---

## 19 — Student Tests List (TEST / Flash Anzan type)

Near-mirror of the Exams list but filtered to Flash Anzan tests. Uses a Zap icon for the empty state.

[paste shared DESIGN SYSTEM block here]

**Page Structure:**
1. **Student chrome.** H1 "Tests" DM Sans 30/700 Near Black.
2. **LIVE NOW / Upcoming / Completed** — same 3-section structure as the Exams list.
3. **Empty State:** Zap icon (32×32 Slate 400), H3 "No tests scheduled yet", body "Your Flash Anzan tests will appear here when they're published."

---

## 20 — Login

Centered card on a Brand Navy (#204074) full-page background. Professional, trustworthy, minimal branding.

[paste shared DESIGN SYSTEM block here]

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
3. Replace the placeholder `[paste shared DESIGN SYSTEM block here]` with the actual shared block from the top of this file (or keep it inline — Stitch handles either).
4. Paste into Stitch's prompt input and generate.
5. Iterate on the generated design inside Stitch — add variants, swap components, tweak spacing. The DESIGN SYSTEM block ensures multi-screen consistency.
6. When satisfied, use the `react-components` skill (if you want Stitch → code) or hand-port to the existing MINDSPARK `src/` tree.

**Reference:** Full token + component definitions in `docs/DESIGN.md`. Canonical source: `docs/abacus-edge-design-spec (4).html` §28.
