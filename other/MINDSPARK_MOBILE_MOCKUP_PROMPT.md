# MINDSPARK MOBILE MOCKUP — SINGLE-FILE HTML BUILD SPECIFICATION v1.0

---

## ⚠️ ANTI-HALLUCINATION RULES — READ THESE BEFORE WRITING A SINGLE LINE OF CODE

1. **NEVER claim a screen is implemented unless the HTML for it physically exists in the output.**
2. **NEVER use placeholder comments** like `<!-- TODO -->`, `<!-- rest stays same -->`, or `[INSERT CONTENT HERE]`. Every screen must have full content.
3. **NEVER output a partial file.** Every output must be a complete, runnable, self-contained HTML file from `<!DOCTYPE html>` to `</html>`.
4. **NEVER copy the desktop sidebar layout onto mobile.** Sidebars become bottom navigation bars. Side drawers become bottom sheets.
5. **NEVER approximate color values.** Every color in this document is exact. Use the hex codes verbatim.
6. **NEVER use CSS named colors** (no "green", "red", "navy"). Use hex only.
7. **BEFORE calling this task done**, count every `<div class="screen-block">` in the output. There must be exactly **34**. If you count fewer, you are not done.
8. **If you need multiple passes**, each pass produces a COMPLETE file. Never produce a diff, patch, or "changes only" output.
9. **If a rule here conflicts with a general coding preference you have, this document wins.**

---

## 1. OUTPUT FORMAT & FILE REQUIREMENTS

**Target:** One self-contained `mindspark-mobile-mockup.html` file.

**What it renders in a browser:**
- A scrollable design document on desktop (like a Figma spec page)
- Each screen appears inside a simulated iPhone 14 frame (390×844px)
- A sticky top navigation bar allows jumping to any screen via a `<select>` dropdown
- All 34 screens are visible by scrolling, grouped as: AUTH → STUDENT → ADMIN

**Technical constraints:**
- No build tools, no bundler, no npm
- No external CSS frameworks (Tailwind, Bootstrap etc.)
- All CSS in one `<style>` block in `<head>`
- All JS in one `<script>` block before `</body>`
- External resources allowed (load via CDN/link):
  - Google Fonts: DM Sans + DM Mono
  - Lucide icons: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- After DOM loads, call `lucide.createIcons()` to render `<i data-lucide="...">` icons

---

## 2. DESIGN SYSTEM — EXACT CSS TOKENS (DO NOT DEVIATE)

Paste this entire block verbatim into `:root {}`. Do not rename, omit, or approximate any value.

```css
:root {
  /* SURFACES */
  --page:      #F8FAFC;
  --card:      #FFFFFF;
  --border:    #E2E8F0;
  --bmd:       #CBD5E1;
  --subtle:    #F8FAFC;
  --hover:     #F1F5F9;
  --overlay:   rgba(15, 23, 42, 0.4);
  --sl100:     #F1F5F9;
  --sl200:     #E2E8F0;
  --sl300:     #CBD5E1;

  /* TEXT */
  --t1:        #0F172A;   /* primary text */
  --t2:        #475569;   /* secondary text */
  --t3:        #94A3B8;   /* subtle / placeholder */
  --t-neg:     #991B1B;   /* NEGATIVE ARITHMETIC NUMBERS ONLY — never for errors */

  /* GREEN RAMP — PRIMARY UI SYSTEM */
  --g900:      #0D2B1F;
  --g800:      #1A3829;   /* PRIMARY: buttons, active nav, LIVE card border */
  --g700:      #1E4A35;   /* button :active / :hover */
  --g600:      #2D6A4F;   /* chart bars, grade colour */
  --g500:      #40916C;   /* correct answers, trend text */
  --g400:      #52B788;   /* MCQ hover border */
  --g300:      #74C69D;   /* timer border */
  --g200:      #B7E4C7;   /* active icon background */
  --g100:      #D8F1E3;   /* avatar ring */
  --g50:       #EFFAF4;   /* active nav bg, MCQ selected tint */

  /* LIVE */
  --live:      #EF4444;

  /* SEMANTIC STATUS */
  --ok-bg:     #DCFCE7;   --ok-tx:  #166534;
  --wn-bg:     #FEF9C3;   --wn-tx:  #854D0E;
  --er-bg:     #FEE2E2;   --er-tx:  #DC2626;
  --in-bg:     #DBEAFE;   --in-tx:  #1E40AF;

  /* AMBER (pending / warning accent) */
  --amb50:     #FEF3C7;
  --amb500:    #F59E0B;
  --amb600:    #D97706;
  --amb700:    #92400E;

  /* PURPLE (TEST type pill) */
  --pur50:     #EDE9FE;
  --pur700:    #7C3AED;

  /* BRAND IDENTITY — use on login/loading bg ONLY, never on interactive UI */
  --ms-navy:   #204074;
  --ms-blue:   #3A9ED1;
  --ms-orange: #F57A39;
  --ms-yellow: #F5BE38;

  /* FLASH ANZAN — contrast levels by speed */
  --ff-std-tx: #0F172A;   --ff-std-bg: #FFFFFF;   /* speed >= 500ms */
  --ff-mid-tx: #1E293B;   --ff-mid-bg: #F8FAFC;   /* speed = 300ms  */
  --ff-fst-tx: #334155;   --ff-fst-bg: #F1F5F9;   /* speed < 300ms  */

  /* SHADOWS */
  --s1: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --s2: 0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04);
  --s3: 0 10px 32px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06);

  /* RADIUS */
  --r1: 4px;    /* chip */
  --r2: 6px;    /* badge */
  --r3: 10px;   /* button */
  --r4: 14px;   /* card */
  --r5: 18px;   /* overlay / bottom sheet top corners */
  --rf: 9999px; /* pill */
}
```

### 2.1 Typography Rules

| Use case | Font | Notes |
|---|---|---|
| All body/UI text | `'DM Sans', sans-serif` | |
| All numbers, timers, roll numbers, arithmetic | `'DM Mono', monospace` | `font-variant-numeric: tabular-nums` |
| Flash Anzan Phase numbers | DM Mono, min 96px | `transition: none !important` — mandatory |
| Negative arithmetic numbers | color `#991B1B` | Arithmetic context ONLY. Never for error states |
| Error text/chips | color `#DC2626` | Completely separate from `#991B1B` |

### 2.2 Touch Target Rules

- All tappable elements: `min-height: 44px`
- MCQ option buttons: `min-height: 64px`, full width
- Bottom nav items: `height: 60px` total (icon 24px + label 12px + padding)
- Page horizontal padding: `16px`
- Card internal padding: `16px`
- Gap between cards: `12px`

---

## 3. OUTER DOCUMENT SHELL (the mockup viewer, not the app)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MINDSPARK — Mobile Mockups</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    /* ... all CSS here ... */
  </style>
</head>
<body>

<!-- OUTER NAV (mockup document nav, not the app) -->
<nav class="doc-nav">
  <span class="doc-logo">MINDSPARK <span>Mobile Mockups</span></span>
  <div style="flex:1"></div>
  <select class="doc-jump" onchange="location.hash=this.value; this.value=''">
    <option value="">Jump to screen…</option>
    <optgroup label="AUTH — 1 screen">
      <option value="#screen-auth-login">Login</option>
    </optgroup>
    <optgroup label="STUDENT — 13 screens">
      <option value="#screen-student-dashboard">Student Dashboard</option>
      <option value="#screen-student-dashboard-live">Student Dashboard (Live Exam)</option>
      <option value="#screen-student-exams">Student Exams &amp; Tests</option>
      <option value="#screen-student-consent">Academic Integrity &amp; Consent</option>
      <option value="#screen-exam-lobby">Exam Lobby</option>
      <option value="#screen-flash-display">Flash Anzan — Number Display</option>
      <option value="#screen-flash-mcq">Flash Anzan — MCQ Answering</option>
      <option value="#screen-flash-review">Flash Anzan — Review &amp; Submit</option>
      <option value="#screen-exam-complete">Exam Completion</option>
      <option value="#screen-assessment-v5">Assessment Taking (Vertical Table)</option>
      <option value="#screen-student-results">My Results — List</option>
      <option value="#screen-student-result-detail">Result Detail</option>
      <option value="#screen-student-profile">Student Profile</option>
    </optgroup>
    <optgroup label="ADMIN — 20 screens">
      <option value="#screen-admin-dashboard">Admin Dashboard</option>
      <option value="#screen-admin-students">Students — List</option>
      <option value="#screen-admin-student-detail">Students — Detail</option>
      <option value="#screen-admin-create-student">Students — Add New (Bottom Sheet)</option>
      <option value="#screen-admin-levels">Levels — List</option>
      <option value="#screen-admin-level-detail">Levels — Detail</option>
      <option value="#screen-admin-create-level">Levels — Add New (Bottom Sheet)</option>
      <option value="#screen-admin-assessments">Assessments — List</option>
      <option value="#screen-admin-wizard-step1">Wizard — Step 1 Type</option>
      <option value="#screen-admin-wizard-step2">Wizard — Step 2 Settings</option>
      <option value="#screen-admin-flash-config">Flash Anzan Configuration</option>
      <option value="#screen-admin-monitor-hub">Live Monitor Hub</option>
      <option value="#screen-admin-monitor-detail">Monitor Detail</option>
      <option value="#screen-admin-activity">Activity Log</option>
      <option value="#screen-admin-announcements">Announcements</option>
      <option value="#screen-admin-results">Results Hub</option>
      <option value="#screen-admin-result-detail">Results Detail</option>
      <option value="#screen-admin-student-drawer">Results — Student List (Bottom Sheet)</option>
      <option value="#screen-admin-answer-sheet">Answer Sheet</option>
      <option value="#screen-admin-settings">Settings</option>
    </optgroup>
  </select>
  <span class="doc-count">34 screens</span>
</nav>

<!-- DOCUMENT BODY -->
<div class="doc-body">
  <!-- GROUP: AUTH -->
  <div class="group-header"><span class="group-label">AUTH</span><span class="group-count">1 screen</span></div>
  <!-- [screen-blocks here] -->

  <!-- GROUP: STUDENT -->
  <div class="group-header"><span class="group-label">STUDENT</span><span class="group-count">13 screens</span></div>
  <!-- [screen-blocks here] -->

  <!-- GROUP: ADMIN -->
  <div class="group-header"><span class="group-label">ADMIN</span><span class="group-count">20 screens</span></div>
  <!-- [screen-blocks here] -->
</div>

<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>
  /* ... all JS here ... */
  document.addEventListener('DOMContentLoaded', () => { lucide.createIcons(); });
</script>
</body>
</html>
```

### 3.1 Outer Document CSS

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: #E2E8F0; color: #0F172A; }

/* OUTER NAV */
.doc-nav {
  position: sticky; top: 0; z-index: 100;
  background: #1A3829; color: #fff;
  display: flex; align-items: center; gap: 12px;
  padding: 0 24px; height: 56px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.doc-logo { font-size: 13px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap; }
.doc-logo span { opacity: .5; font-weight: 400; }
.doc-jump { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.25); border-radius: 8px; padding: 6px 12px; font-family: inherit; font-size: 13px; cursor: pointer; outline: none; max-width: 300px; }
.doc-count { font-size: 12px; opacity: .55; white-space: nowrap; }

/* DOC BODY */
.doc-body { max-width: 1100px; margin: 0 auto; padding: 40px 24px 100px; }

/* GROUP HEADERS */
.group-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px; margin-top: 48px; padding-bottom: 10px; border-bottom: 2px solid #1A3829; }
.group-label { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1A3829; }
.group-count { font-size: 12px; color: #64748B; }

/* SCREEN BLOCK */
.screen-block { margin-bottom: 60px; scroll-margin-top: 72px; }
.screen-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.screen-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
.screen-path { font-family: 'DM Mono', monospace; font-size: 11px; color: #94A3B8; }
.top-link { font-size: 12px; color: #1A3829; border: 1px solid #1A3829; border-radius: 6px; padding: 4px 10px; text-decoration: none; white-space: nowrap; }
.top-link:hover { background: #1A3829; color: #fff; }
```

### 3.2 iPhone Frame CSS

```css
/* IPHONE FRAME */
.iphone-frame {
  width: 390px;
  height: 844px;
  background: #F8FAFC;
  border-radius: 44px;
  border: 10px solid #1C1C1E;
  box-shadow:
    0 0 0 1px #3A3A3C inset,
    0 24px 64px rgba(0,0,0,0.35),
    0 4px 12px rgba(0,0,0,0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* STATUS BAR */
.iphone-status-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  color: var(--t1);
  background: inherit;
}
.iphone-status-bar.dark { color: #fff; }

/* SCROLLABLE CONTENT AREA */
.iphone-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--page);
  scrollbar-width: none;
}
.iphone-content::-webkit-scrollbar { display: none; }

/* HOME INDICATOR */
.iphone-home-indicator {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: inherit;
  flex-shrink: 0;
}
.home-bar {
  width: 134px; height: 5px;
  background: #1C1C1E; border-radius: 3px; opacity: 0.2;
}
```

---

## 4. SHARED APP COMPONENTS (USE THESE EXACTLY)

### 4.1 Top App Bar (sticky, 56px)

Present on all screens except: Login (A1), Flash Display (B6).

```css
.top-bar {
  height: 56px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}
.top-bar-title { font-size: 17px; font-weight: 700; color: #0F172A; flex: 1; text-align: center; }
.top-bar-back { display: flex; align-items: center; gap: 4px; font-size: 14px; color: #1A3829; font-weight: 600; cursor: pointer; flex-shrink: 0; white-space: nowrap; }
.top-bar-action { font-size: 13px; color: #1A3829; font-weight: 700; cursor: pointer; flex-shrink: 0; }
```

### 4.2 Student Bottom Navigation (4 tabs)

Tabs (in order): Dashboard, Exams, Results, Profile  
Icons (Lucide): `layout-dashboard`, `clipboard-list`, `bar-chart-2`, `user`

```css
.student-bottom-nav {
  height: 60px;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  color: #94A3B8;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 4px;
}
.bottom-nav-item.active { color: #1A3829; }
.bottom-nav-item.active .nav-icon-wrap {
  background: #EFFAF4;
  border-radius: 8px;
  padding: 4px 12px;
}
.bottom-nav-item i { width: 22px; height: 22px; }
```

### 4.3 Admin Bottom Navigation (5 tabs)

Tabs: Dashboard, Students, Assessments, Monitor, More  
Icons: `layout-dashboard`, `users`, `clipboard-list`, `monitor`, `more-horizontal`

"More" tab opens an admin bottom sheet listing: Levels, Results, Activity Log, Announcements, Settings.

Same CSS as student bottom nav but 5 items.

### 4.4 Primary Button

```css
.btn-primary {
  background: #1A3829;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  height: 48px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
.btn-primary:active { background: #1E4A35; }
```

### 4.5 Secondary Button

```css
.btn-secondary {
  background: #FFFFFF;
  color: #1A3829;
  border: 1.5px solid #1A3829;
  border-radius: 10px;
  height: 44px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
```

### 4.6 Input Field

```css
.ms-input {
  width: 100%;
  height: 48px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 15px;
  font-family: 'DM Sans', sans-serif;
  background: #F8FAFC;
  color: #0F172A;
  outline: none;
}
.ms-input:focus { border-color: #1A3829; background: #FFFFFF; }
.ms-label { font-size: 13px; font-weight: 600; color: #0F172A; margin-bottom: 6px; display: block; }
.ms-label .required { color: #DC2626; }
```

### 4.7 Card

```css
.ms-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
```

### 4.8 Avatar

```css
.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #1A3829;
  color: #FFFFFF;
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-family: 'DM Sans', sans-serif;
}
.avatar-lg { width: 72px; height: 72px; font-size: 24px; }
.avatar-md { width: 48px; height: 48px; font-size: 18px; }
```

### 4.9 Badges & Pills

```css
/* STATUS CHIPS */
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }
.chip-exam     { background: #DBEAFE; color: #1D4ED8; }
.chip-test     { background: #EDE9FE; color: #7C3AED; }
.chip-live     { background: #FEE2E2; color: #DC2626; }
.chip-published{ background: #DCFCE7; color: #166534; }
.chip-draft    { background: #F1F5F9; color: #475569; }
.chip-pending  { background: #FEF3C7; color: #92400E; }
.chip-completed{ background: #DCFCE7; color: #166534; }
.chip-closed   { background: #F1F5F9; color: #475569; }
.chip-archived { background: #F1F5F9; color: #64748B; }
.chip-student  { background: #F1F5F9; color: #475569; }
.chip-admin    { background: #DBEAFE; color: #1D4ED8; }
.chip-active   { background: #DCFCE7; color: #166534; }

/* GRADE PILLS */
.grade-pill    { display: inline-flex; padding: 3px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
.grade-aplus, .grade-a { background: #EFFAF4; color: #1E4A35; }
.grade-b       { background: #DBEAFE; color: #1D4ED8; }
.grade-c       { background: #FEF3C7; color: #92400E; }
.grade-f       { background: #FEE2E2; color: #DC2626; }

/* LEVEL BADGE */
.level-badge { background: #F1F5F9; color: #475569; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; }

/* LIVE NOW BADGE — animated */
.live-badge { background: #EF4444; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 5px; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF; animation: pulse-dot 1.4s ease-in-out infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.35} }

/* SEQ BADGE (level sequence number) */
.seq-badge { background: #1A3829; color: #FFFFFF; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600; padding: 4px 10px; border-radius: 8px; }
```

### 4.10 MCQ Option Button (Flash Anzan)

```css
.mcq-btn {
  width: 100%;
  min-height: 64px;
  padding: 0 16px;
  border: 2px solid #E2E8F0;
  border-radius: 14px;
  background: #FFFFFF;
  font-size: 20px;
  font-weight: 700;
  font-family: 'DM Mono', monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F172A;
  transition: border-color 0.12s, background 0.12s;
}
.mcq-btn.selected { background: #1A3829; color: #FFFFFF; border-color: #1A3829; }
.mcq-btn:active:not(.selected) { border-color: #52B788; }
.mcq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
```

### 4.11 Section Label

```css
.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94A3B8;
  padding: 0 4px;
  margin-top: 4px;
  margin-bottom: 8px;
}
```

### 4.12 Bottom Sheet

```css
.bs-overlay { position: absolute; inset: 0; background: rgba(15,23,42,0.4); z-index: 19; }
.bottom-sheet {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: #FFFFFF;
  border-radius: 20px 20px 0 0;
  padding: 0 16px 20px;
  box-shadow: 0 -6px 32px rgba(0,0,0,0.14);
  z-index: 20;
}
.bs-handle-area { height: 28px; display: flex; align-items: center; justify-content: center; }
.bs-handle { width: 40px; height: 4px; background: #CBD5E1; border-radius: 2px; }
.bs-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.bs-title { font-size: 17px; font-weight: 700; color: #0F172A; flex: 1; }
.bs-close { width: 32px; height: 32px; border-radius: 50%; background: #F1F5F9; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; }
```

### 4.13 Stepper Control (Flash Config wizard)

```css
.stepper-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
.stepper-label { font-size: 14px; color: #0F172A; font-weight: 500; }
.stepper-control { display: flex; align-items: center; gap: 12px; }
.stepper-btn { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #E2E8F0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #1A3829; font-weight: 700; }
.stepper-btn:active { background: #EFFAF4; }
.stepper-value { font-family: 'DM Mono', monospace; font-size: 18px; font-weight: 600; color: #0F172A; min-width: 32px; text-align: center; }
```

### 4.14 Toggle Switch

```css
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
.toggle-label { font-size: 14px; color: #0F172A; font-weight: 500; }
.toggle { width: 48px; height: 28px; border-radius: 14px; border: none; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
.toggle.on  { background: #1A3829; }
.toggle.off { background: #CBD5E1; }
.toggle-thumb { position: absolute; top: 3px; width: 22px; height: 22px; background: #fff; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.2); transition: left 0.2s; }
.toggle.on  .toggle-thumb { left: 23px; }
.toggle.off .toggle-thumb { left: 3px; }
```

### 4.15 Info Row (profile, settings fields)

```css
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F8FAFC; }
.info-row:last-child { border-bottom: none; }
.info-row-label { font-size: 13px; color: #94A3B8; font-weight: 500; }
.info-row-value { font-size: 14px; color: #0F172A; font-weight: 600; text-align: right; }
.info-row-value.null { color: #94A3B8; font-weight: 400; }
```

---

## 5. SCREEN CATALOGUE — ALL 34 SCREENS

Every screen follows this wrapper pattern:

```html
<div class="screen-block" id="screen-{ID}">
  <div class="screen-header">
    <div>
      <h2 class="screen-title">{SCREEN NAME}</h2>
      <code class="screen-path">/route/path</code>
    </div>
    <a href="#top" class="top-link">↑ Top</a>
  </div>
  <div class="iphone-frame">
    <div class="iphone-status-bar [dark?]">
      <span>9:41</span>
      <span style="display:flex;gap:4px;align-items:center">
        <i data-lucide="signal" style="width:14px;height:14px"></i>
        <i data-lucide="battery" style="width:14px;height:14px"></i>
      </span>
    </div>
    <div class="iphone-content" style="background: [BG_COLOR];">
      <!-- FULL SCREEN HTML -->
    </div>
    <div class="iphone-home-indicator"><div class="home-bar"></div></div>
  </div>
</div>
```

---

### GROUP A — AUTH (1 screen)

---

#### A1 — Login
**ID:** `screen-auth-login`  
**Route:** `/login`  
**Status bar:** dark (white text) — add class `dark` to `.iphone-status-bar`  
**No top bar. No bottom nav.**  
**`iphone-content` background:** `linear-gradient(180deg, #204074 0%, #1A3829 55%, #0D2B1F 100%)`

**Content** (padding: 0 24px, display:flex, flex-direction:column, align-items:center, padding-top: 60px, padding-bottom: 40px):

```
LOGO BLOCK (margin-bottom: 24px):
  - 64×64px rounded square (border-radius:16px, bg: rgba(255,255,255,.1), border: 1px solid rgba(255,255,255,.18))
  - Inside: hexagon SVG icon (use a Lucide "hexagon" icon or draw inline SVG), 36px, stroke:#FFFFFF
  - Below: "MindSpark" — font-size:28px, font-weight:700, color:#FFFFFF, margin-top:16px
  - Below: "Sign in to your account" — font-size:15px, color:rgba(255,255,255,0.6), margin-top:6px, margin-bottom:32px

CARD (bg:#FFFFFF, border-radius:20px, padding:24px, width:100%, box-shadow: 0 16px 48px rgba(0,0,0,0.3)):
  - Label "Email Address" (ms-label)
  - Input type=email, placeholder="student@mindspark.edu" (ms-input)
  - Spacer 14px
  - Label "Password" (ms-label)
  - Input type=password, placeholder="••••••••" (ms-input)
  - Spacer 24px
  - btn-primary "Sign In" — height:52px
```

---

### GROUP B — STUDENT (13 screens)

---

#### B1 — Student Dashboard (Normal State)
**ID:** `screen-student-dashboard`  
**Route:** `/student/dashboard`  
**Has:** top-bar, student bottom nav (Dashboard active)

**Top bar content:**
- Left: MindSpark hexagon icon 20px + "MindSpark" text 15px bold #1A3829
- Right: bell icon (with red dot 6px notification indicator) + avatar 36px "AS"

**Scroll content** (padding: 16px, display:flex, flex-direction:column, gap:12px):

```
GREETING BLOCK:
  "Hello, Aditi 👋" — font-size:26px, font-weight:700, color:#0F172A
  "Welcome back. Here's your overview." — font-size:14px, color:#475569, margin-top:4px

QUICK STATS card (ms-card):
  3-column grid, gap:0, border between columns (border-right: 1px solid #E2E8F0 on first 2):
  | [📋 icon] Exams / 3 bold | [⚡ icon] Tests / 5 bold | [📊 icon] Avg Score / 86% bold #1A3829 |
  Each column: padding:12px, text-center, label 11px #94A3B8 uppercase, value 22px DM Mono bold

SECTION LABEL "UPCOMING"

UPCOMING EXAM card (ms-card):
  Row: chip-exam "EXAM" + level-badge "Level 3" + seq "MS-L3-001" DM Mono 11px #94A3B8 (margin-left auto)
  "Q3 Mental Arithmetic" — 15px bold #0F172A, margin-top:8px
  "Starts in 2 days · Jun 20, 2026" — 13px #475569, margin-top:4px

SECTION LABEL "RECENT RESULTS"

RESULT row card (ms-card, cursor:pointer):
  display:flex, justify-content:space-between, align-items:center
  Left:
    "Q2 Flash Anzan" — 14px bold #0F172A
    "Score: 18/20 · 90%" — 13px #475569, margin-top:2px
  Right:
    grade-pill grade-a "A" + chevron-right icon 16px #94A3B8

RESULT row card 2:
  Left: "Q1 Mental Arithmetic" | "15/20 · 75%"
  Right: grade-pill grade-b "B" + chevron-right
```

---

#### B2 — Student Dashboard (LIVE Exam State)
**ID:** `screen-student-dashboard-live`  
**Route:** `/student/dashboard`  
**Same top bar as B1. Student bottom nav, Dashboard active.**

**Scroll content** (padding: 16px, gap: 12px):

```
"Hello, Aditi 👋" — 26px bold #0F172A
"An exam is live right now — enter when you're ready." — 14px color:#DC2626, margin-top:4px

LIVE HERO CARD:
  border: 2px solid #1A3829
  border-radius: 16px
  background: #F8FFF9
  padding: 16px

  Inside:
  Row 1: chip-exam "EXAM" + level-badge "Level 3" + [right] "MS-L3-001" DM Mono 11px #94A3B8
  
  Row 2 (display:flex, justify-content:space-between, align-items:center, margin-top:10px):
    Left: live-badge (animated) "LIVE NOW"
    Right:
      "TIME LEFT" — 10px uppercase #94A3B8
      "28:14" — font-family:DM Mono, font-size:36px, font-weight:700, color:#1A3829

  "Q3 Mental Arithmetic" — 20px bold #0F172A, margin-top:10px, margin-bottom:14px

  btn-primary "Enter Examination Hall →" — height:52px

INFO STRIP (below card, ms-card, display:flex, gap:16px, font-size:12px color:#475569, flex-wrap:wrap):
  "20 Questions" · "30 Min" · "3 Digits" · "80% Pass"
  (each item: before each separator dot · in #CBD5E1)
```

---

#### B3 — Student Exams & Tests
**ID:** `screen-student-exams`  
**Route:** `/student/exams`  
**Top bar:** "Exams" centered + filter icon right. Student bottom nav, Exams active.

**Scroll content** (padding: 16px, gap: 12px):

```
SECTION ROW (display:flex, align-items:center, margin-bottom:8px):
  live-dot red 8px + "LIVE NOW" 12px bold #DC2626 + [right] "1" badge (bg:#EF4444, color:#fff, 18px, border-radius:9999px)

LIVE EXAM CARD:
  border: 1.5px solid #EF4444
  background: #FFF5F5
  border-radius: 14px
  padding: 14px

  Row: live-badge + [right] DM Mono timer "28:14" — font-size:22px, font-weight:700, color:#1A3829
  "Q3 Mental Arithmetic" — 16px bold #0F172A, margin-top:8px
  Row: chip-exam + level-badge "Level 3" + "MS-L3-001" DM Mono 11px
  btn-primary "Enter Exam →" — height:44px, margin-top:12px

DIVIDER (height:1px, background:#E2E8F0, margin:4px 0)

SECTION ROW: slate-dot (8px, bg:#94A3B8) + "UPCOMING" + count badge grey right

UPCOMING CARD 1 (ms-card):
  Row: chip-exam + level-badge "Level 3" + [right] date badge "Jun 20" (bg:#DBEAFE, color:#1D4ED8, border-radius:6px, padding:3px 8px, font-size:11px DM Mono)
  "Q4 Flash Anzan" — 15px bold
  "Not live yet" — 12px #94A3B8, margin-top:4px

UPCOMING CARD 2 (ms-card):
  Row: chip-test + level-badge "Level 2" + date badge "Jun 25"
  "Q2 Mid-Term Test"
  "Not live yet" — 12px #94A3B8

SECTION ROW: slate-dot + "COMPLETED" + count badge grey

COMPLETED ROW 1 (ms-card, opacity slightly muted — color:#475569 for text):
  display:flex, justify-content:space-between, align-items:flex-start
  Left:
    "Q2 Flash Anzan" — 14px semi-bold
    Row: chip-exam + "Apr 5, 2026" 11px
  Right:
    chip-completed "Completed" ↵
    "View Results →" — 12px #1A3829, font-weight:700, margin-top:4px

COMPLETED ROW 2:
  "Q1 Mental Arithmetic" | chip-completed | "View Results →"
  "75% · 15/20"
```

---

#### B4 — Academic Integrity & Consent
**ID:** `screen-student-consent`  
**Route:** `/student/consent`  
**Top bar:** back chevron + "Academic Integrity" centered. NO bottom nav (pre-exam flow).

**Scroll content** (padding: 16px, gap: 16px):

```
ms-card (intro):
  "Please review and agree to the following terms before proceeding to your first exam."
  — 14px, #475569, line-height:1.6

ms-card (section 1):
  "1. Assessment Rules" — 15px bold #0F172A, margin-bottom:10px
  "By proceeding, you agree to complete this assessment entirely on your own without external assistance. Any violation will result in an immediate fail."
  — 13px, #475569, line-height:1.6, margin-bottom:14px
  CHECKBOX ROW:
    <input type="checkbox"> + label "I acknowledge and will abide by the assessment rules."
    label: 13px #0F172A, display:flex, align-items:flex-start, gap:10px
    checkbox: width:18px, height:18px, accent-color:#1A3829

ms-card (section 2):
  "2. Data Privacy" — 15px bold
  "Your performance data and timings will be recorded to evaluate your skill progression. We process this data securely."
  — 13px, #475569, margin-bottom:14px
  CHECKBOX ROW: "I understand and consent to data processing."

btn-primary "Continue to Exam →" — height:52px
```

---

#### B5 — Exam Lobby
**ID:** `screen-exam-lobby`  
**Route:** `/student/exam/lobby`  
**Top bar:** back + "Exam Lobby" centered. NO bottom nav.

**Scroll content** (padding: 16px, gap: 16px):

```
CONNECTION STATUS BAR:
  display:flex, align-items:center, gap:8px
  background:#EFFAF4, border:1px solid #B7E4C7, border-radius:10px, padding:10px 14px
  Green dot 8px + "Connection Stable" 13px #166534 font-weight:600

ms-card (exam info):
  "Q3 Mental Arithmetic" — 20px bold #0F172A, margin-bottom:6px
  "Please review your exam settings before starting. The timer will not begin until you click ready."
  — 13px, #475569, margin-bottom:16px

  SETTINGS GRID (display:grid, grid-template-columns:1fr 1fr, gap:12px):
    Each setting cell (bg:#F8FAFC, border-radius:10px, padding:12px):
      Label (10px uppercase #94A3B8 font-weight:700, margin-bottom:4px)
      Value (font-family:DM Mono, font-size:18px, font-weight:600, color:#0F172A)

    QUESTIONS / 20
    TIME LIMIT  / 30 Min
    FLASH DIGITS/ 3 Digits
    FLASH SPEED / 1.5 Sec
    NEGATIVES   / Included
    PASSING     / 80%

btn-primary "I'm Ready — Start Exam →" — height:52px
btn-secondary "Exit" (border-color:#E2E8F0, color:#475569) — height:44px, margin-top:4px
```

---

#### B6 — Flash Anzan: Number Display
**ID:** `screen-flash-display`  
**Route:** `/student/exam/flash`  
**Status bar:** normal (default)  
**NO top-bar. NO bottom nav. NO peripheral UI.**  
**`iphone-content` background:** `#FFFFFF`

**Full layout** (display:flex, flex-direction:column, height:100%):

```
TOP STRIP (height:44px, padding:0 20px, display:flex, align-items:center, justify-content:space-between):
  "Q3/20" — DM Mono 12px #94A3B8
  "00:42" — DM Mono 12px #94A3B8 (this question timer)
  "14:23" — DM Mono 12px #94A3B8 (exam timer)

FLASH NUMBER AREA (flex:1, display:flex, align-items:center, justify-content:center):
  "-412"
  font-family: 'DM Mono', monospace
  font-size: 96px
  font-weight: 600
  color: #991B1B   ← NEGATIVE number. If positive, use #0F172A
  transition: none !important   ← MANDATORY

BOTTOM STRIP (height:28px, display:flex, align-items:center, justify-content:center):
  "FLASH 3 OF 8" — DM Mono 11px #94A3B8 letter-spacing:0.08em
```

---

#### B7 — Flash Anzan: MCQ Answering
**ID:** `screen-flash-mcq`  
**Route:** `/student/exam/answer`  
**Top bar:** "Question 4 of 20" left-aligned 14px bold + [right] timer chip "24:12" (bg:#EFFAF4, border:1px solid #B7E4C7, DM Mono 16px bold #1A3829, border-radius:8px, padding:4px 12px). NO bottom nav.

**Scroll content** (padding: 16px, gap: 16px):

```
Divider: 1px solid #E2E8F0

MCQ GRID (.mcq-grid — 2×2):
  mcq-btn "A) 1,420"
  mcq-btn "B) 1,240"
  mcq-btn.selected "C) 1,440"   ← bg:#1A3829, color:#fff
  mcq-btn "D) 1,400"

ACTION ROW (display:flex, gap:10px):
  Left button (flex:1):
    bg:#FEF9C3, color:#854D0E, border:1.5px solid #FDE68A, border-radius:10px, height:48px
    "🚩 Flag for Review" — 14px font-weight:700
  Right button (flex:1.5):
    bg:#1A3829, color:#fff, border-radius:10px, height:48px
    "Next Question →" — 14px font-weight:700

SECTION LABEL "QUESTION NAVIGATOR"

NAVIGATOR (overflow-x:auto, display:flex, gap:8px, padding-bottom:4px):
  Q1 (48×48 bg:#1A3829 color:#fff border-radius:8px font-size:13px font-weight:700 DM Mono)
  Q2 (same — answered)
  Q3 (bg:#FEF9C3, border:1.5px dashed #FDE68A, color:#854D0E — flagged)
  Q4 (bg:#fff, border:2px solid #1A3829, color:#0F172A — current)
  Q5–Q8 (bg:#fff, border:1.5px solid #E2E8F0, color:#94A3B8 — unanswered)
```

---

#### B8 — Flash Anzan: Review & Submit
**ID:** `screen-flash-review`  
**Route:** `/student/exam/review`  
**Top bar:** back + "Review Answers" centered. NO bottom nav.

**Scroll content** (padding: 16px, gap: 14px):

```
TIMER WARNING BANNER (if applicable):
  bg:#FEF9C3, border:1px solid #FDE68A, border-left:3px solid #F59E0B
  border-radius:10px, padding:10px 14px
  "⏱ Low Time Warning: Less than 60 seconds remaining!"
  — 13px, color:#854D0E

QUESTION STATUS GRID (display:grid, grid-template-columns:repeat(4,1fr), gap:8px):
  20 cells total:
  Answered: bg:#1A3829, color:#fff, text:"Q1 ✓"
  Flagged: bg:#FEF9C3, border:1px solid #FDE68A, text:"Q3 🚩", color:#854D0E
  Unanswered: bg:#fff, border:1.5px solid #E2E8F0, color:#94A3B8, text:"Q5"
  
  Each cell: border-radius:8px, height:44px, display:flex, align-items:center, justify-content:center
  font-size:12px, font-weight:700, DM Mono

  Demo state: Q1✓ Q2✓ Q3🚩 Q4✓ Q5○ Q6✓ Q7✓ Q8✓ Q9✓ Q10✓
              Q11✓ Q12✓ Q13✓ Q14✓ Q15✓ Q16○ Q17✓ Q18✓ Q19✓ Q20✓

SUMMARY ROW (13px, #475569, text-center):
  "18 Answered · 1 Flagged · 1 Unanswered"

btn-primary "Submit Exam Now" — height:52px

BACK LINK (text-center, margin-top:8px):
  "← Go back and review" — 14px #1A3829 font-weight:600, text-decoration:underline
```

---

#### B9 — Exam Completion
**ID:** `screen-exam-complete`  
**Route:** `/student/exam/complete`  
**NO top bar. NO bottom nav.**  
**`iphone-content` background:** `#F8FAFC`  
**Layout:** padding:32px 24px, display:flex, flex-direction:column, align-items:center, gap:20px

```
ICON AREA (text-center):
  Circle 80×80, bg:#EFFAF4, border:2px solid #B7E4C7, border-radius:50%
  Inside: check-circle Lucide icon 40px color:#1A3829

"Exam Completed!" — 28px bold #0F172A, text-center

SCORE CARD (ms-card, width:100%, text-center, padding:24px):
  "18 / 20"
  font-family:DM Mono, font-size:52px, font-weight:700, color:#1A3829
  "/ 20" in a smaller span (font-size:32px, color:#94A3B8)

  "90% Accuracy" — 16px #475569, margin-top:4px

  DIVIDER (1px solid #E2E8F0, margin:16px 0)

  STAT ROW (display:flex, justify-content:space-around):
    [check-circle icon 16px + "18 Correct" — color:#166534]
    [x-circle icon 16px + "2 Incorrect" — color:#DC2626]
    [minus icon 16px + "0 Skipped" — color:#94A3B8]
  Each: font-size:13px, font-weight:600, display:flex, align-items:center, gap:5px

btn-primary "View Answer Sheet" — height:52px, width:100%

btn-secondary "Back to Dashboard" — height:44px, margin-top:8px, width:100%
```

---

#### B10 — Assessment Taking v5 (Vertical Arithmetic)
**ID:** `screen-assessment-v5`  
**Route:** `/student/exam/question (v5 arithmetic)`  
**Top bar: custom (see below). NO bottom nav.**

**Custom top bar** (height:56px, bg:#FFFFFF, border-bottom:1px solid #E2E8F0, padding:0 16px, display:flex, align-items:center, gap:10px):
```
"Q 3 / 20" DM Mono 13px #475569
Progress bar: flex:1, height:6px, bg:#E2E8F0, border-radius:3px
  Inner fill: width:15%, bg:#1A3829, border-radius:3px
"14:23" DM Mono 12px font-weight:600 color:#1A3829 (exam timer)
"Saved" 11px color:#166534 (with green dot 5px)
"Exit" 13px color:#DC2626 font-weight:600
```

**Scroll content** (padding: 16px, gap: 16px):

```
SECTION LABEL "QUESTION 3"

ARITHMETIC TABLE CARD (ms-card, padding:20px, display:flex, justify-content:center, align-items:center):
  Table structure (table-like div layout):
  
  ROW 1 (positive number):
    op-col (width:40px, text-align:right, padding-right:8px): [empty]
    num-col: "892" — font-family:DM Mono, font-size:48px, font-weight:600, color:#0F172A

  ROW 2 (negative operator+number):
    op-col: "−" — DM Mono 28px color:#991B1B
    num-col: "456" — DM Mono 48px color:#991B1B

  DIVIDER LINE (height:2px, bg:#0F172A, margin:8px 0, width:100%)

  ROW 3 (answer placeholder):
    op-col: empty
    num-col: 48px height, border-bottom:2px dashed #CBD5E1

SECTION LABEL "YOUR ANSWER"

MCQ GRID (mcq-grid 2×2):
  mcq-btn "A) 436"
  mcq-btn "B) 348"
  mcq-btn "C) 436"   ← show one as selected in demo
  mcq-btn "D) 448"

ACTION ROW:
  Flag button (same as B7)
  "Next →" btn-primary small (height:48px, flex:1.5)
```

---

#### B11 — Student Results List
**ID:** `screen-student-results`  
**Route:** `/student/results`  
**Top bar:** "My Results" 17px bold centered + filter icon right. Student bottom nav, Results active.

**Scroll content** (padding: 16px, gap: 12px):

```
HERO CARD (ms-card, border-left:4px solid #1A3829, padding:16px):
  Row: chip-exam "EXAM" + grade-pill grade-a "A"
  "Q3 Mental Arithmetic" — 16px bold #0F172A, margin-top:6px
  "Score: 18/20 · 90% Accuracy" — 13px #475569
  "Attempted: Apr 10, 2026" — 12px #94A3B8, margin-top:2px
  "View Answer Sheet →" — 13px #1A3829 font-weight:700, margin-top:8px

FILTER CHIPS (display:flex, gap:8px, overflow-x:auto, padding-bottom:4px):
  "All" (active: bg:#1A3829, color:#fff)
  "Exams"
  "Tests"
  Each chip: font-size:12px, font-weight:600, padding:6px 14px, border-radius:9999px
  Inactive: bg:#F1F5F9, color:#475569

SECTION LABEL "ALL RESULTS (12)"

RESULT CARDS (stacked, ms-card, cursor:pointer):
  Card 1:
    Row: "Q3 Mental Arithmetic" 14px bold + grade-pill grade-a "A" right
    Row: chip-exam + "Apr 10, 2026" 11px #94A3B8
    chevron-right 14px #94A3B8, position:absolute right? No: display:flex, justify-content:space-between then chevron

  Card 2:
    "Q2 Flash Anzan" + grade-pill grade-b "B"
    chip-exam + "Mar 5, 2026"

  Card 3 (PENDING):
    "Q1 Mental Arithmetic" + chip-pending "Pending"
    chip-exam + "Feb 20, 2026"

  Card 4:
    "Mid-Term Test 1" + grade-pill grade-aplus "A+"
    chip-test + "Jan 30, 2026"
```

---

#### B12 — Student Result Detail
**ID:** `screen-student-result-detail`  
**Route:** `/student/results/q3-mental-arithmetic`  
**Top bar:** back + "Q3 Mental Arithmetic" 14px bold (truncate if needed). Student bottom nav, Results active.

**Scroll content** (padding: 16px, gap: 16px):

```
HEADER (ms-card, no-left-border):
  Row: chip-published "Published" + chip-exam "Exam"
  "Q3 Mental Arithmetic" — 20px bold #0F172A, margin-top:8px
  "Level 3 · 30 min · 20 questions" — 13px #475569, margin-top:4px

SCORE PANEL (ms-card, border-left:4px solid #1A3829, display:flex, align-items:center, justify-content:center, gap:20px, padding:24px):
  SCORE BLOCK (text-center):
    "18/20" — DM Mono 40px bold #1A3829
    "SCORE" — 10px uppercase #94A3B8, margin-top:6px

  Vertical divider: width:1px, height:60px, bg:#E2E8F0

  GRADE CARD (bg:#EFFAF4, border:1px solid #B7E4C7, border-radius:10px, padding:16px 24px, text-center):
    "A" — DM Mono 64px font-weight:700 color:#1A3829, line-height:1
    "GRADE" — 10px uppercase #40916C, margin-top:4px

3-KPI ROW (ms-card, display:grid, grid-template-columns:1fr 1fr 1fr):
  KPI 1 (text-center, padding:12px): "18" DM Mono 22px bold #166534 + "Correct" 11px #94A3B8 uppercase
  DIVIDER: border-right:1px solid #E2E8F0
  KPI 2 (text-center): "2" DM Mono 22px bold #DC2626 + "Wrong"
  DIVIDER: border-right:1px solid #E2E8F0
  KPI 3 (text-center): "90%" DM Mono 22px bold #1A3829 + "Accuracy"

CTA CARD — "View Answer Sheet" (bg:#fff, border:1px solid #E2E8F0, border-radius:14px, padding:16px, display:flex, align-items:center, gap:12px, cursor:pointer):
  file-text icon 24px color:#1A3829
  BODY (flex:1):
    "View Answer Sheet" — 15px bold #0F172A
    "See all questions with your answers" — 13px #475569
  chevron-right 18px #1A3829

CTA CARD LOCKED — "Answer Key Locked" (bg:#F8FAFC, cursor:not-allowed):
  lock icon 24px #94A3B8
  "Answer Key Locked" — 15px #475569
  "Your teacher hasn't released the key yet" — 13px #94A3B8
  (NO chevron)
```

---

#### B13 — Student Profile
**ID:** `screen-student-profile`  
**Route:** `/student/profile`  
**Top bar:** "Profile" centered bold. Student bottom nav, Profile active.

**Scroll content** (padding: 16px, gap: 12px):

```
PROFILE HERO (ms-card, text-center, padding:24px):
  .avatar-lg "AS" (72×72, bg:#1A3829)
  "Aditi Sharma" — 20px bold #0F172A, margin-top:14px
  Row (centered, gap:8px): chip-student "Student" + level-badge "Level 3"
  "MS-L3-001" — DM Mono 13px #475569, margin-top:6px

SECTION LABEL "SCHOOL INFO"

ms-card:
  info-row: "Roll Number" / "MS-L3-001" (DM Mono value)
  info-row: "Level" / "Level 3"
  info-row: "Status" / chip-active "Active" (inline in value)
  info-row: "Date of Birth" / "Jan 15, 2012"
  info-row: "Joined" / "Sep 2, 2024"

MORE INFO toggle row (display:flex, justify-content:space-between, align-items:center, padding:12px 4px, cursor:pointer):
  "More Info" — 14px font-weight:600 #475569
  chevron-down icon 18px #94A3B8 (rotates when open via JS)

MORE INFO panel (hidden by default, ms-card, shown when toggled):
  info-row: "Email" / "Not mentioned" (value color:#94A3B8)
  info-row: "Phone" / "Not mentioned"
  info-row: "Address" / "Not mentioned"

FOOTER NOTE (text-center, 13px #94A3B8, padding:8px 0):
  "Contact your teacher to update any of these details."
```

---

### GROUP C — ADMIN (20 screens)

---

#### C1 — Admin Dashboard
**ID:** `screen-admin-dashboard`  
**Route:** `/admin/dashboard`  
**Top bar:** "MINDSPARK" logo-text 15px bold + hexagon icon | [right] "Admin" chip-admin + bell icon + avatar 36px "A"  
**Admin bottom nav, Dashboard active.**

**Scroll content** (padding: 16px, gap: 14px):

```
KPI ROW (display:grid, grid-template-columns:1fr 1fr 1fr, gap:10px):
  KPI card (ms-card, padding:12px, text-center):
    "TOTAL STUDENTS" — 9px uppercase #94A3B8, margin-bottom:4px
    "247" — DM Mono 28px bold #0F172A
  KPI card:
    "ACTIVE EXAMS" — same label style
    "3" — DM Mono 28px bold #EF4444 (red — live indicator)
  KPI card:
    "LIVE NOW" — label
    "48" students — DM Mono 28px bold #1A3829

SECTION LABEL "LIVE EXAMS"

LIVE EXAM CARD 1 (ms-card, border-left:4px solid #EF4444):
  Row: live-badge + chip-exam + level-badge "Level 3"
  "Q3 Mental Arithmetic" — 15px bold #0F172A, margin-top:8px
  "48 active · 12 submitted" — 13px #475569, margin-top:4px
  Row (display:flex, justify-content:space-between, align-items:center, margin-top:10px):
    Timer strip (bg:#FEF9C3, border-radius:6px, padding:3px 8px, display:inline-flex):
      "⚠ 28:14 remaining" — DM Mono 12px color:#854D0E
    "Monitor →" (small: bg:#1A3829, color:#fff, border-radius:8px, padding:6px 12px, font-size:13px font-weight:700, cursor:pointer)

LIVE EXAM CARD 2:
  "Flash Anzan Test" + Level 2 + "24 active · 5 submitted" + "15:02 remaining"

SECTION LABEL "ACTIVITY FEED"

ACTIVITY ITEMS (ms-card, display:flex, flex-direction:column, gap:0):
  Each item (padding:10px 0, border-bottom:1px solid #F8FAFC, display:flex, gap:10px):
    Left: colored dot 8px (green for admin actions, blue for student) with vertical line below (1px dashed)
    Right:
      "[Name]" text bold + chip-admin/chip-student inline
      "[Action description]" — 13px #475569
      "[X min ago]" — 11px #94A3B8

  Item 1: green dot | "Admin User" chip-admin | "Released results for Q3 Mental Arithmetic" | "2 hrs ago"
  Item 2: blue dot  | "Aditi Sharma" chip-student | "Submitted Q3 Mental Arithmetic" | "28 min ago"
  Item 3: blue dot  | "Ravi Kumar" chip-student | "Joined Q3 Mental Arithmetic" | "30 min ago"
  Item 4: green dot | "Admin User" chip-admin | "Started exam session" | "35 min ago"
```

---

#### C2 — Admin Students List
**ID:** `screen-admin-students`  
**Route:** `/admin/students`  
**Top bar:** back + "Students" 16px bold + "+ Add" button (bg:#1A3829, color:#fff, border-radius:8px, padding:6px 12px, 13px, no width:100%). Admin bottom nav, Students active.

**Scroll content** (padding: 16px, gap: 12px):

```
SEARCH BAR (position:relative, 44px height):
  .ms-input with placeholder "Search students..."
  search icon 16px #94A3B8 positioned absolute left:14px, top:50% transform:-50%
  input padding-left:40px

FILTER ROW (display:flex, gap:8px, align-items:center):
  Button "All Levels ▾" (bg:#F1F5F9, color:#475569, border:none, border-radius:8px, padding:8px 12px, 13px)
  Button "All Statuses ▾" (same)
  [right, margin-left:auto] "247 students" — 12px #94A3B8

STUDENT LIST (display:flex, flex-direction:column, gap:10px):
  Each student card (ms-card, display:flex, align-items:center, gap:12px, cursor:pointer):
    .avatar [initials]
    INFO (flex:1):
      "[Full Name]" — 14px bold #0F172A
      "[Roll No] · Level [N]" — 12px #475569, DM Mono for roll no
    RIGHT:
      chip-active "Active"
      chevron-right 16px #94A3B8

  STUDENT 1: "AS" | "Aditi Sharma" | "MS-L3-001 · Level 3"
  STUDENT 2: "RK" | "Ravi Kumar"   | "MS-L3-002 · Level 3"
  STUDENT 3: "PS" | "Priya Singh"  | "MS-L2-015 · Level 2"
  STUDENT 4: "AP" | "Arjun Patel"  | "MS-L3-004 · Level 3"
  STUDENT 5: "SK" | "Sneha Kapoor" | "MS-L1-008 · Level 1"

btn-secondary (icon upload-cloud left + "Import CSV") — margin-top:4px
```

---

#### C3 — Admin Student Detail
**ID:** `screen-admin-student-detail`  
**Route:** `/admin/students/MS-L3-001`  
**Top bar:** back "Students" + "Aditi Sharma" 14px bold + "Edit" btn-text #1A3829. Admin bottom nav, Students active.

**Scroll content** (padding: 16px, gap: 16px):

```
PROFILE HERO (ms-card, text-center, padding:24px):
  .avatar-lg "AS" bg:#1A3829
  "Aditi Sharma" — 20px bold, margin-top:14px
  Row: chip-student "Student" + chip-active "Active"
  "MS-L3-001" DM Mono 13px #475569 + level-badge "Level 3", margin-top:6px

SECTION LABEL "PERSONAL INFO"
ms-card:
  info-row: "Full Name" / "Aditi Sharma"
  info-row: "Date of Birth" / "Jan 15, 2012"
  info-row: "Roll Number" / "MS-L3-001" (DM Mono value)

SECTION LABEL "ACADEMIC INFO"
ms-card:
  info-row: "Level" / "Level 3"
  info-row: "Enrolled Since" / "Sep 2, 2024"
  info-row: "Status" / chip-active inline

SECTION LABEL "PERFORMANCE"
ms-card (display:grid, grid-template-columns:1fr 1fr 1fr, gap:0):
  Stat 1 (text-center, padding:12px, border-right:1px solid #E2E8F0):
    "12" DM Mono 22px bold #0F172A
    "Exams Taken" 11px #94A3B8 uppercase
  Stat 2 (text-center, border-right:1px solid #E2E8F0):
    "86%" DM Mono 22px bold #1A3829
    "Avg Score"
  Stat 3 (text-center):
    "92%" DM Mono 22px bold #1A3829
    "Pass Rate"

btn-secondary (border-color:#DC2626, color:#DC2626, icon:trash-2 left) "Delete Student" — margin-top:8px
```

---

#### C4 — Create Student (Bottom Sheet)
**ID:** `screen-admin-create-student`  
**Route:** `/admin/students/new (dialog)`  
**Top bar:** same as C2 (Students List context). Admin bottom nav (Students active).  
**`iphone-content` is in overlay mode: top 35% is overlay, bottom 65% is bottom sheet.**

**Layout:**
```
OVERLAY AREA (height:35%, bg:rgba(15,23,42,0.4))

BOTTOM SHEET (.bottom-sheet with top:auto, height:65%, overflow-y:auto):
  BS HANDLE AREA + handle
  BS HEADER:
    [user-plus icon 22px bg:#EFFAF4 border-radius:8px padding:8px]
    "Add New Student" — 17px bold, flex:1
    [x close button .bs-close]

  "Create a single student entry. You can edit more details later on the profile page."
  — 13px #475569, margin-bottom:16px

  FORM (display:flex, flex-direction:column, gap:14px):
    ms-label "Full Name *" (required span) + ms-input placeholder "e.g. Aditi Sharma"
    ms-label "Roll Number *" + ms-input placeholder "e.g. MS-L3-025" (DM Mono placeholder)
    ms-label "Level" + select (styled: ms-input appearance:none, background-image:chevron, bg:#F8FAFC):
      options: Level 1 / Level 2 / Level 3 / Level 4 / Level 5
    ms-label "Date of Birth" + input type=date (ms-input)

  btn-primary "Add Student" — height:52px, margin-top:4px
```

---

#### C5 — Levels List
**ID:** `screen-admin-levels`  
**Route:** `/admin/levels`  
**Top bar:** "Levels" 17px bold + "+ Add Level" small button right. Admin bottom nav (More active).

**Scroll content** (padding: 16px, gap: 12px):

```
SUMMARY STRIP (display:flex, gap:16px, 13px #475569, padding:4px):
  "5 Total Levels"
  Tip: "💡 Drag to reorder" — 11px #94A3B8

LEVEL CARDS (ms-card each, cursor:grab):
  Each card (display:flex, align-items:center, gap:12px):
    ⠿ drag handle (font-size:18px, color:#CBD5E1, cursor:grab)
    seq-badge "01"
    NAME (flex:1):
      "Level 1" — 15px bold #0F172A
      "24 students · 8 assessments" — 12px #475569, margin-top:2px
    RIGHT (display:flex, gap:8px, align-items:center):
      "View →" link text (13px #1A3829 font-weight:700, text-decoration:none)
      more-horizontal icon 18px #94A3B8 (overflow menu)

  5 cards:
  "01" Level 1 | 24 students · 8 assessments
  "02" Level 2 | 36 students · 10 assessments
  "03" Level 3 | 72 students · 12 assessments
  "04" Level 4 | 48 students · 9 assessments
  "05" Level 5 | 20 students · 6 assessments
```

---

#### C6 — Level Detail
**ID:** `screen-admin-level-detail`  
**Route:** `/admin/levels/lvl-3`  
**Top bar:** back "Levels" + "Level 3" 15px bold. Admin bottom nav (More active).

**Scroll content** (padding: 16px, gap: 14px):

```
HERO CARD (ms-card):
  Row (display:flex, align-items:center, gap:12px):
    seq-badge "03" large (font-size:18px)
    NAME (flex:1): "Level 3" 20px bold | "72 students · 12 assessments" 13px #475569
    [right]: "Edit" small text-btn

TAB STRIP (display:flex, border-bottom:2px solid #E2E8F0, margin-bottom:16px):
  TAB "Students" (active: color:#1A3829, border-bottom:2px solid #1A3829, margin-bottom:-2px, padding:10px 16px, font-weight:700, cursor:pointer)
  TAB "Assessments" (inactive: color:#94A3B8, padding:10px 16px, cursor:pointer)

STUDENTS TAB CONTENT:
  SEARCH + ADD ROW:
    ms-input placeholder "Search students..." (height:40px)
    btn-secondary "+ Add Student to Level" — margin-top:10px, height:40px

  STUDENT LIST (ms-card, display:flex, flex-direction:column, divide with 1px border):
    Row 1 (display:flex, align-items:center, gap:10px, padding:10px 0):
      "MS-L3-001" DM Mono 12px #475569 (min-width:80px)
      "Aditi Sharma" 14px flex:1
      chip-active "Active"
      trash-2 icon 16px #94A3B8
    Row 2: "MS-L3-002" | "Ravi Kumar"  | chip-active | trash icon
    Row 3: "MS-L3-003" | "Priya Singh" | chip-active | trash icon
    Row 4: "MS-L3-004" | "Arjun Patel" | chip-active | trash icon
```

---

#### C7 — Create Level (Bottom Sheet)
**ID:** `screen-admin-create-level`  
**Same overlay/bottom-sheet layout as C4.**

```
BOTTOM SHEET (65% height):
  handle + BS HEADER: "Add New Level" + × close

  "Create a curriculum level. It will be added at the end and can be reordered by dragging."
  — 13px #475569, margin-bottom:16px

  FORM:
    ms-label "Level Name *"
    ms-input placeholder "e.g. Level 6 — Master"
    HINT: "Use a descriptive name that makes sense to students. Once created, the level appears at position 06." — 12px #94A3B8, margin-top:6px

  btn-primary "Create Level" — height:52px, margin-top:16px
```

---

#### C8 — Assessments List
**ID:** `screen-admin-assessments`  
**Route:** `/admin/assessments`  
**Top bar:** "Assessments" 16px bold + "+ Create" small btn-primary right. Admin bottom nav, Assessments active.

**Scroll content** (padding: 16px, gap: 12px):

```
SEGMENTED TOGGLE (display:flex, bg:#F1F5F9, border-radius:10px, height:42px, padding:4px, gap:4px):
  "EXAM (22)" (active: bg:#1A3829, color:#fff, border-radius:8px, flex:1, center, font-weight:700, 13px, height:34px)
  "TEST (10)" (inactive: color:#475569, flex:1, center, 13px, cursor:pointer)

STATUS PILLS (overflow-x:auto, display:flex, gap:8px, padding:2px 0):
  "All 22" (active: bg:#1A3829, color:#fff, border-radius:9999px, padding:5px 14px, 12px bold)
  "Draft 4" "Published 8" "Live 2" "Closed" "Archived 2"
  (inactive: bg:#F1F5F9, color:#475569)

SEARCH: ms-input height:40px placeholder "Search assessments..."

ASSESSMENT CARDS:
  Card 1 — LIVE (border-left:4px solid #EF4444, ms-card):
    Row: live-badge + chip-exam + level-badge "Level 3"
    "Q3 Mental Arithmetic" — 15px bold, margin-top:8px
    "30 min · 20 questions · 80% pass" — 12px #475569
    Row (margin-top:10px, display:flex, justify-content:space-between, align-items:center):
      "Jun 9, 2026" — 11px #94A3B8
      Row gap:8px: "Monitor" btn (small green) + more-horizontal icon

  Card 2 — DRAFT (border-left:4px solid #94A3B8):
    Row: chip-exam + chip-draft "Draft" + level-badge "Level 3"
    "Q4 Flash Anzan" — 15px bold
    "30 min · 20 questions"
    Row: date + ["Edit" btn-secondary small] + ["Publish" btn-primary small] + more icon

  Card 3 — PUBLISHED:
    Row: chip-exam + chip-published "Published" + level-badge "Level 3"
    "Q2 Flash Anzan"
    Row: date + "View Results →" link text green + more icon
```

---

#### C9 — Assessment Wizard Step 1 (Type)
**ID:** `screen-admin-wizard-step1`  
**Route:** `/admin/assessments/new?step=1`  
**NO sidebar. Special top bar (wizard header). NO bottom nav.**

**Wizard top bar** (height:56px, bg:#FFFFFF, border-bottom:1px solid #E2E8F0, padding:0 16px, display:flex, align-items:center, justify-content:space-between):
```
[hexagon icon 24px + "MINDSPARK" 14px bold #1A3829]
["Step 1 of 3" — 13px #475569]
```

**Stepper** (height:48px, bg:#F8FAFC, border-bottom:1px solid #E2E8F0, display:flex, align-items:center, justify-content:center, gap:8px):
```
[● 1 circle filled #1A3829, color:#fff 20px] "TYPE" 11px bold #1A3829
[─ line 40px #E2E8F0]
[○ 2 circle border #CBD5E1] "SETTINGS" 11px #94A3B8
[─ line]
[○ 3 circle] "QUESTIONS" 11px #94A3B8
```

**Scroll content** (padding: 16px, gap: 16px):

```
"Choose assessment type" — 22px bold #0F172A
"Pick which kind of assessment you're creating. This determines how questions are presented to students."
— 14px #475569, margin-bottom:8px

EXAM CARD (selected state — full width, not side-by-side on mobile):
  border:2px solid #1A3829
  background:#EFFAF4
  border-radius:14px, padding:20px
  position:relative

  Check badge (position:absolute, top:12px, right:12px):
    circle 24px bg:#1A3829, ✓ white 14px

  clipboard-list icon (32px, color:#1A3829, bg:#fff, border-radius:8px, padding:6px, margin-bottom:12px)
  "EXAM" — 17px bold #1A3829
  "Multi-flash number sequence with MCQ answers. Teacher-scheduled and timed." — 13px #475569, margin-top:6px

TEST CARD (unselected state):
  border:1px solid #E2E8F0
  background:#FFFFFF
  border-radius:14px, padding:20px, margin-top:12px

  zap icon (32px, color:#7C3AED, bg:#EDE9FE, border-radius:8px, padding:6px, margin-bottom:12px)
  "TEST" — 17px bold #0F172A
  "Quick practice session. Flexible scheduling, no strict timer." — 13px #475569

btn-primary "Continue to Settings →" — height:52px, margin-top:8px
```

---

#### C10 — Assessment Wizard Step 2 (Settings)
**ID:** `screen-admin-wizard-step2`  
**Same wizard top bar. Stepper shows Step 2 active. NO bottom nav.**

**Scroll content** (padding: 16px, gap: 14px):

```
"Configure settings" — 20px bold #0F172A

SECTION LABEL "BASIC SETTINGS"
ms-card:
  ms-label "Assessment Title" + ms-input placeholder "e.g. Q3 Mental Arithmetic"
  ms-label "Level" (margin-top:14px) + select Level 1-5 (styled)
  ms-label "Passing Score %" (margin-top:14px) + ms-input type=number value="80"

SECTION LABEL "FLASH SETTINGS"
ms-card:
  stepper-row: "Number of Digits" / − 3 +
  stepper-row: "Flashes per Question" / − 8 +
  stepper-row: "Total Questions" / − 20 +
  toggle-row: "Include Negative Numbers" / toggle (on, green)
  stepper-row: "Flash Speed (sec)" / − 1.5 +

SECTION LABEL "TIME SETTINGS"
ms-card:
  stepper-row: "Time Limit (minutes)" / − 30 +

BUTTON ROW (display:flex, gap:10px):
  btn-secondary "← Back" — flex:1
  btn-primary "Continue →" — flex:2
```

---

#### C11 — Flash Anzan Configuration
**ID:** `screen-admin-flash-config`  
**Route:** `/admin/assessments/[id]/configure`  
**Top bar:** back + "Flash Configuration" 15px bold + "Save" btn-text #1A3829 right. NO bottom nav.

**Scroll content** (padding: 16px, gap: 16px):

```
LIVE PREVIEW CARD (ms-card, text-center, padding:24px):
  SECTION LABEL "LIVE PREVIEW" (centered)
  "-412"
  font-family:'DM Mono',monospace, font-size:80px, font-weight:600, color:#991B1B
  (negative example — #991B1B ONLY because it's an arithmetic number)
  "Flash Speed: 1.5s" — DM Mono 12px #94A3B8, margin-top:8px

SECTION LABEL "SETTINGS"
ms-card:
  stepper-row: "Number of Digits" / − 3 +
  stepper-row: "Flashes per Question" / − 8 +
  stepper-row: "Total Questions" / − 20 +
  toggle-row: "Include Negative Numbers" / toggle ON #1A3829
  stepper-row: "Flash Speed (seconds)" / − 1.5 +

btn-primary "Save Configuration" — height:52px
```

---

#### C12 — Live Monitor Hub
**ID:** `screen-admin-monitor-hub`  
**Route:** `/admin/monitor`  
**Top bar:** menu icon + "Live Monitor" 16px bold + bell icon with red dot right. Admin bottom nav, Monitor active.

**Scroll content** (padding: 16px, gap: 14px):

```
STATS STRIP (display:flex, align-items:center, gap:8px, 14px #475569):
  live-dot (red, animated) 8px
  "3 exams running"
  "·"
  "48 students active"

LIVE EXAM CARDS (3 cards):
  Card 1 (ms-card, border-left:4px solid #EF4444):
    Row: live-badge + chip-exam "EXAM" + level-badge "Level 3"
    "Q3 Mental Arithmetic" — 15px bold, margin-top:8px
    4-stat mini row (12px, display:flex, gap:12px, flex-wrap:wrap, margin-top:6px):
      "48 Active" · "12 Submitted" · "4 Not Started" · "60% Progress"
    TIME STRIP (bg:#FEF9C3, border:1px solid #FDE68A, border-radius:8px, padding:6px 10px, display:flex, justify-content:space-between, align-items:center, margin-top:10px):
      "⚠ 28:14 remaining" — DM Mono 13px color:#854D0E
    "Monitor →" btn-primary small (height:36px, padding:0 14px, font-size:13px, width:auto) — margin-top:10px

  Card 2 (border-left:4px solid #EF4444):
    live-badge + chip-test "TEST" + level-badge "Level 2"
    "Flash Anzan Test" — 15px bold
    "24 Active · 5 Submitted · 2 Not Started"
    "⚠ 15:02 remaining"

  Card 3:
    live-badge + chip-exam + level-badge "Level 1"
    "Mid-Term Arithmetic"
    "18 Active · 8 Submitted"
    "⚠ 44:30 remaining"
```

---

#### C13 — Monitor Detail
**ID:** `screen-admin-monitor-detail`  
**Route:** `/admin/monitor/q3-mental-arithmetic`  
**Top bar:** back "Monitor" + "Q3 Mental Arithmetic" 14px bold. Admin bottom nav, Monitor active.

**Scroll content** (padding: 16px, gap: 12px):

```
STATUS STRIP (display:flex, align-items:center, gap:10px, bg:#FFF5F5, border-radius:10px, padding:10px 14px):
  live-badge
  "28:14 remaining" DM Mono 14px bold #1A3829
  [margin-left:auto] "3 running" chip red

STATS ROW (display:grid, grid-template-columns:1fr 1fr 1fr, gap:10px):
  ms-card text-center:
    "48" DM Mono 24px bold
    "Active" 11px #94A3B8 uppercase
  ms-card:
    "12" DM Mono 24px bold #166534
    "Submitted"
  ms-card:
    "4" DM Mono 24px bold #94A3B8
    "Not Started"

STUDENT TABLE (ms-card, padding:0):
  Each student row (padding:12px 16px, border-bottom:1px solid #F8FAFC, display:flex, align-items:center, gap:10px):
    .avatar [initials]
    INFO (flex:1):
      "[Name]" — 14px bold #0F172A
      "[Roll]" DM Mono 11px #94A3B8
    PROGRESS (text-right):
      "[X/20]" DM Mono 13px font-weight:700
      STATUS CHIP below
    "[time]" DM Mono 12px #94A3B8

  Row 1: AS | Aditi Sharma | MS001 | "4/20" + chip-status In Progress (bg:#DBEAFE color:#1D4ED8) | 05:48
  Row 2: RK | Ravi Kumar   | MS002 | "20/20" + chip Submitted (bg:#DCFCE7 color:#166534) | 14:12
  Row 3: PS | Priya Singh  | MS003 | "16/20" + chip Timed Out (bg:#FEE2E2 color:#DC2626) | 30:00
  Row 4: AP | Arjun Patel  | MS004 | "0/20" + chip Not Started (bg:#F1F5F9 color:#475569) | 00:00
```

---

#### C14 — Activity Log
**ID:** `screen-admin-activity`  
**Route:** `/admin/activity`  
**Top bar:** back + "Activity Log" bold + filter icon right. Admin bottom nav (More active).

**Scroll content** (padding: 16px, gap: 12px):

```
FILTER CHIPS (display:flex, gap:8px):
  "📅 Last 7 Days" (active chip-style, bg:#1A3829 color:#fff)
  "👤 All Users" (inactive, bg:#F1F5F9 color:#475569)

TIMELINE LIST (display:flex, flex-direction:column, gap:0):
  Each item (display:flex, gap:12px, padding:14px 0, border-bottom:1px solid #F8FAFC):
    LEFT COLUMN (width:12px, display:flex, flex-direction:column, align-items:center, padding-top:4px):
      Dot 10px border-radius:50% (green bg:#1A3829 for admin, blue bg:#1D4ED8 for student)
      Line: flex:1, width:2px, bg:#E2E8F0, margin-top:4px (dashed, connect dots)
    RIGHT COLUMN (flex:1):
      TIMESTAMP: "2026-06-09  10:15" DM Mono 11px #94A3B8, margin-bottom:4px
      Row: "[Name]" 13px bold + chip-admin/chip-student inline, gap:6px
      ACTION: "[Action description]" 14px #0F172A, margin-top:2px
      TARGET: "[Target entity]" 13px #1A3829 (green link style)

  Item 1: green dot | 2026-06-09 10:15 | "Admin User" chip-admin | "Started Exam Session" | "Q3 Mental Arithmetic"
  Item 2: blue dot  | 2026-06-09 10:16 | "Aditi Sharma" chip-student | "Joined Exam" | "Q3 Mental Arithmetic"
  Item 3: blue dot  | 2026-06-09 10:45 | "Aditi Sharma" | "Submitted Exam" | "Q3 Mental Arithmetic"
  Item 4: green dot | 2026-06-09 10:50 | "Admin User" | "Released Results" | "Q3 Mental Arithmetic"
  Item 5: green dot | 2026-06-08 14:22 | "Admin User" | "Published Assessment" | "Q2 Flash Anzan"
  Item 6: blue dot  | 2026-06-07 09:30 | "Ravi Kumar" chip-student | "Submitted Exam" | "Q2 Flash Anzan"
```

---

#### C15 — Announcements
**ID:** `screen-admin-announcements`  
**Route:** `/admin/announcements`  
**Top bar:** back + "Announcements" bold. Admin bottom nav (More active).

**Scroll content** (padding: 16px, gap: 16px):

```
COMPOSE CARD (ms-card):
  SECTION LABEL "NEW ANNOUNCEMENT"
  
  ms-label "Title" + ms-input placeholder "e.g. Upcoming Exam Schedule"
  
  ms-label "Message Body" (margin-top:14px)
  TEXTAREA (width:100%, min-height:100px, border:1.5px solid #E2E8F0, border-radius:10px, padding:12px 14px, font-family:'DM Sans',sans-serif, font-size:14px, bg:#F8FAFC, resize:vertical, outline:none, color:#0F172A)
  textarea:focus { border-color:#1A3829 }
  
  ms-label "Audience" (margin-top:14px) + select:
    options: "All Students" / "Level 3 Only" / "Level 2 Only" / "Level 1 Only"
  
  btn-primary "Send Announcement" — height:48px, margin-top:16px, width:100%

SECTION LABEL "RECENT ANNOUNCEMENTS"

ms-card (past announcement 1):
  "Upcoming Exam Schedule" — 15px bold #0F172A
  "Sent to: All Students · Jun 8, 2026" — 11px #94A3B8, margin-top:2px
  "Please note that Q3 Mental Arithmetic exam will be held on June 9th at 10:00 AM."
  — 13px #475569, margin-top:6px, overflow:hidden, display:-webkit-box, -webkit-line-clamp:2, -webkit-box-orient:vertical

ms-card (past announcement 2):
  "System Maintenance Notice" — 15px bold
  "Sent to: All Students · Jun 5, 2026"
  "The platform will be unavailable on June 6th from 2–4 AM for maintenance."
  — same clamp style
```

---

#### C16 — Results Hub
**ID:** `screen-admin-results`  
**Route:** `/admin/results`  
**Top bar:** "Results" 17px bold + filter icon right. Admin bottom nav, Results active.

**Scroll content** (padding: 16px, gap: 12px):

```
SEGMENTED TOGGLE: "EXAM" active | "TEST" (same style as C8)

FILTER CHIPS (overflow-x:auto, display:flex, gap:8px):
  "Published 8" (active)
  "Yet to Evaluate 3"
  "Archived 12"

RESULT CARDS (stacked):
  Card 1 — PUBLISHED (ms-card, border-left:3px solid #1A3829):
    Row: chip-published "Published" + chip-exam "Exam"
    "Q3 Mental Arithmetic" — 15px bold, margin-top:8px
    "Level 3 · Apr 10, 2026 · 24 students" — 12px #475569
    STATS ROW (display:flex, gap:12px, 12px #475569, margin-top:6px):
      "84% Avg" · "92% Pass Rate" · "2 Pending"
    "View Results →" — 13px #1A3829 font-weight:700, display:block, margin-top:8px

  Card 2 — YET TO EVALUATE (border-left:3px solid #F59E0B):
    Row: chip-pending "Yet to Evaluate" + chip-exam
    "Q2 Flash Anzan" — 15px bold
    "Level 3 · Mar 5, 2026 · 24 students"
    "Evaluate Results →" — 13px #1A3829

  Card 3 — PUBLISHED:
    "Q1 Mental Arithmetic" border-left green | "View Results →"
    "Level 2 · Feb 20, 2026"

  Card 4 — ARCHIVED (border-left:3px solid #CBD5E1, opacity:0.7):
    chip-archived "Archived" + chip-test
    "Q1 Practice Test"
    "Level 1 · Jan 15, 2026"
```

---

#### C17 — Results Detail
**ID:** `screen-admin-result-detail`  
**Route:** `/admin/results/q3-mental-arithmetic`  
**Top bar:** back "Results" + "Q3 Mental Arithmetic" 14px bold. Admin bottom nav, Results active.

**Scroll content** (padding: 16px, gap: 16px):

```
HEADER CARD (ms-card):
  Row: chip-published + chip-exam
  "Q3 Mental Arithmetic" — 22px bold #0F172A, margin-top:8px
  "Level 3 · 30 min duration · 20 questions · Published Apr 10, 2026"
  — 12px #475569, margin-top:4px

KPI ROW (display:grid, grid-template-columns:1fr 1fr 1fr, gap:0, ms-card):
  KPI (padding:16px, text-center, border-right:1px solid #E2E8F0):
    "24" DM Mono 28px bold #0F172A
    "STUDENTS" 10px #94A3B8 uppercase
  KPI (border-right:1px solid #E2E8F0):
    "84%" DM Mono 28px bold #1A3829
    "AVG SCORE"
  KPI:
    "92%" DM Mono 28px bold #1A3829
    "PASS RATE"

GRADE DISTRIBUTION (ms-card):
  SECTION LABEL "GRADE DISTRIBUTION"
  Each bar row (display:flex, align-items:center, gap:10px, padding:6px 0):
    Label (width:80px, 12px #475569): "A (90%+)"
    BAR TRACK (flex:1, height:8px, bg:#E2E8F0, border-radius:4px):
      BAR FILL (bg:#1A3829, border-radius:4px):
        A+ = 40% width, A = 33%, B = 17%, C = 8%, F = 4%
    Value (width:40px, text-right, DM Mono 12px #0F172A font-weight:600): "10"

  Rows: A+ · 40% · 10 | A · 33% · 8 | B · 17% · 4 | C · 8% · 2 | F · 4% · 1

btn-primary "View Student List →" — height:48px (opens drawer C18)
btn-secondary "Results Released ✓" (or "Release Results" if not released) — height:44px, margin-top:8px
```

---

#### C18 — Student List Drawer (Bottom Sheet)
**ID:** `screen-admin-student-drawer`  
**Route:** `/admin/results/q3-mental-arithmetic → Student List Open`  
**Top bar matches C17. Admin bottom nav (Results active). Bottom sheet overlays.**

**Layout: Same overlay+bottom-sheet as C4. Bottom sheet takes 75% height.**

```
OVERLAY AREA (25% height, rgba(15,23,42,0.4))

BOTTOM SHEET (75% height, overflow-y:auto):
  handle + header:
    × close btn
    "Student List" 17px bold

  STATS ROW (display:flex, gap:0):
    Stat 1 (flex:1, border-right:1px solid #E2E8F0, padding:12px, display:flex, align-items:center, gap:10px):
      circle-x icon 24px color:#DC2626 bg:#FEE2E2 border-radius:50% padding:5px
      BLOCK: "MISSED" 10px uppercase #94A3B8 | "2" 22px DM Mono bold #DC2626
    Stat 2 (flex:1, padding:12px, display:flex, align-items:center, gap:10px):
      users icon 24px color:#1A3829 bg:#EFFAF4 border-radius:50% padding:5px
      BLOCK: "ENROLLED" 10px uppercase | "24" 22px DM Mono bold #0F172A

  SEARCH + SORT ROW (display:flex, gap:8px, margin-bottom:12px):
    ms-input placeholder "Search..." (flex:1, height:40px)
    Sort button (bg:#F1F5F9, border:none, border-radius:8px, padding:8px 12px, 13px, display:flex, align-items:center, gap:4px):
      sliders icon 14px + "Sort: Roll No"

  SECTION LABEL "GAVE THE EXAM"
  Table-list (ms-card, padding:0):
    Row (padding:12px 16px, border-bottom:1px solid #F8FAFC, display:flex, align-items:center, gap:8px):
      "1." 12px #94A3B8
      INFO (flex:1): "Aditi Sharma" 13px bold | "MS-L3-001" DM Mono 11px #475569
      SCORE: "90%" DM Mono 13px font-weight:700 #166534
      "Sheet →" (13px #1A3829 font-weight:700, white-space:nowrap)

    Rows: 1. Aditi Sharma MS-L3-001 90% | 2. Ravi Kumar MS-L3-002 85% | 3. Priya Singh MS-L3-003 72%

  SECTION LABEL "MISSED THE EXAM" (color:#DC2626)
  ms-card padding:0:
    Row: "1." | "Kavita Rao" | "MS-L3-005" (DM Mono) | — (no score, no button)
    Row: "2." | "Amit Patel" | "MS-L3-008" | —
```

---

#### C19 — Answer Sheet (Admin View)
**ID:** `screen-admin-answer-sheet`  
**Route:** `/admin/results/q3-mental-arithmetic/students/ms-l3-001`  
**Top bar:** back "Student List" + "Answer Sheet" 14px bold. Admin bottom nav, Results active.

**Scroll content** (padding: 16px, gap: 16px):

```
STUDENT CARD (ms-card, display:flex, align-items:center, gap:14px):
  .avatar-md "AS"
  INFO (flex:1):
    "Aditi Sharma" — 16px bold #0F172A
    "MS-L3-001 · Level 3 · Q3 Mental Arithmetic" — 12px #475569
    "Attempted: Apr 10, 2026" — 11px #94A3B8
  SCORE (text-right):
    "18/20" DM Mono 22px bold #1A3829
    "90%" DM Mono 13px #40916C

3-KPI ROW (ms-card, display:grid, 1fr 1fr 1fr):
  "18" bold #166534 | "Correct" 11px
  "2" bold #DC2626 | "Wrong"
  "90%" bold #1A3829 | "Accuracy"

ANSWER QUESTION CARDS (stacked):
  Q1 CARD — CORRECT (ms-card, border-left:4px solid #166534):
    Row: "QUESTION 1" 10px uppercase #94A3B8 + chip "✓ Correct" (bg:#DCFCE7, color:#166534) right
    OPTIONS (display:flex, flex-direction:column, gap:6px, margin-top:10px):
      Each option (padding:8px 12px, border-radius:8px, 13px):
      A) 412 | bg:#fff border:1px solid #E2E8F0
      B) 436 | same
      C) 892  | SELECTED CORRECT: bg:#DCFCE7, border:1px solid #166534, color:#166534 + "✓" right
      D) 524 | bg:#fff border:1px solid #E2E8F0

  Q2 CARD — WRONG (ms-card, border-left:4px solid #DC2626, bg:#FFF5F5):
    Row: "QUESTION 2" + chip "✗ Wrong" (bg:#FEE2E2, color:#DC2626)
    OPTIONS:
      A) 1,420 | neutral
      B) 1,240 | STUDENT WRONG PICK: bg:#FEE2E2, border:#DC2626, color:#DC2626 + "✗" right
      C) 1,440 | CORRECT: bg:#DCFCE7, border:#166534, color:#166534 + "✓ Correct" text right
      D) 1,400 | neutral
    NOTE: "Correct answer: C) 1,440" — 12px #166534, margin-top:8px
```

---

#### C20 — Admin Settings
**ID:** `screen-admin-settings`  
**Route:** `/admin/settings`  
**Top bar:** back + "Settings" 16px bold + "Save" text button right (color:#1A3829, only visible when unsaved). Admin bottom nav (More active).

**Scroll content** (padding: 16px, gap: 14px, padding-bottom: 80px for sticky bar):

```
SECTION LABEL "INSTITUTION INFO"
ms-card (display:flex, flex-direction:column, gap:14px):
  LOGO UPLOADER ROW (display:flex, align-items:center, gap:12px):
    Logo box (60×60, border:2px dashed #CBD5E1, border-radius:10px, bg:#F8FAFC, display:flex, align-items:center, justify-content:center):
      image icon 24px #94A3B8
    RIGHT:
      "Institution Logo" 14px bold #0F172A
      "Upload PNG or SVG" 12px #94A3B8
      "Upload" btn-secondary small (height:32px, padding:0 14px, font-size:13px, width:auto) margin-top:6px

  ms-label "Institution Name" + ms-input value="MindSpark Academy"
  ms-label "City" + ms-input value="Mumbai"
  ms-label "Contact Email" + ms-input type=email value="admin@mindspark.edu"
  ms-label "Academic Year" + ms-input value="2025–2026"

SECTION LABEL "GRADE BOUNDARIES"
ms-card:
  SEGMENTED TOGGLE (EXAM | TEST, same style as elsewhere)
  GRADE ROWS (display:flex, flex-direction:column, gap:0):
    Each row (display:flex, justify-content:space-between, align-items:center, padding:12px 0, border-bottom:1px solid #F8FAFC):
      Grade label (14px, #0F172A): "A+ (90–100%)"
      Edit icon: edit-2 16px #94A3B8 cursor:pointer

    Rows: A+ 90-100% | A 80-89% | B 70-79% | C 60-69% | F <60%

SECTION LABEL "SESSION SETTINGS"
ms-card:
  ms-label "Session Timeout (minutes)"
  ms-input type=number value="30"

UNSAVED CHANGES STICKY BAR (position:sticky, bottom:60px, bg:#1A3829, border-radius:12px, padding:12px 16px, display:flex, justify-content:space-between, align-items:center, margin:0 -16px, box-shadow:0 -4px 16px rgba(0,0,0,0.15)):
  "Unsaved changes" — 13px color:rgba(255,255,255,0.75)
  "Save Settings" btn (bg:#FFFFFF, color:#1A3829, border:none, border-radius:8px, padding:8px 16px, 14px font-weight:700, cursor:pointer)
```

---

## 6. JAVASCRIPT REQUIREMENTS

Implement all of these functions:

```javascript
// 1. Toggle Profile "More Info" accordion (B13)
function toggleMoreInfo(id) {
  var el = document.getElementById(id);
  var arrow = document.getElementById(id + '-arrow');
  var open = el.style.display === 'block';
  el.style.display = open ? 'none' : 'block';
  if (arrow) arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
  arrow.style.transition = 'transform 0.2s';
}

// 2. Tab switching (Level Detail, Assessment tabs)
function switchTab(containerId, activeTab) {
  var c = document.getElementById(containerId);
  c.querySelectorAll('[data-tab]').forEach(function(btn) {
    var isActive = btn.getAttribute('data-tab') === activeTab;
    btn.classList.toggle('tab-active', isActive);
    btn.style.color = isActive ? '#1A3829' : '#94A3B8';
    btn.style.borderBottom = isActive ? '2px solid #1A3829' : '2px solid transparent';
  });
  c.querySelectorAll('[data-panel]').forEach(function(panel) {
    panel.style.display = panel.getAttribute('data-panel') === activeTab ? 'block' : 'none';
  });
}

// 3. MCQ selection
function selectMCQ(groupId, selectedId) {
  document.querySelectorAll('[data-mcq-group="' + groupId + '"]').forEach(function(btn) {
    btn.classList.toggle('selected', btn.id === selectedId);
  });
}

// 4. Assessment type selection (Wizard Step 1)
function selectType(type) {
  var examCard = document.getElementById('type-exam');
  var testCard = document.getElementById('type-test');
  examCard.style.border   = type === 'exam' ? '2px solid #1A3829' : '1px solid #E2E8F0';
  examCard.style.background = type === 'exam' ? '#EFFAF4' : '#FFFFFF';
  testCard.style.border   = type === 'test' ? '2px solid #1A3829' : '1px solid #E2E8F0';
  testCard.style.background = type === 'test' ? '#EFFAF4' : '#FFFFFF';
  document.getElementById('type-exam-check').style.display = type === 'exam' ? 'flex' : 'none';
  document.getElementById('type-test-check').style.display = type === 'test' ? 'flex' : 'none';
}

// 5. Stepper control
function stepperChange(displayId, delta, min, max, isDecimal) {
  var el = document.getElementById(displayId);
  var val = parseFloat(el.textContent);
  val = Math.min(max, Math.max(min, val + delta));
  el.textContent = isDecimal ? val.toFixed(1) : val.toString();
}

// 6. Toggle switch
function toggleSwitch(id) {
  var el = document.getElementById(id);
  var on = el.classList.toggle('on');
  el.classList.toggle('off', !on);
}

// 7. Segmented toggle (Exam/Test)
function segToggle(groupId, activeValue) {
  document.querySelectorAll('[data-seg-group="' + groupId + '"]').forEach(function(btn) {
    var isActive = btn.getAttribute('data-seg-val') === activeValue;
    btn.style.background = isActive ? '#1A3829' : 'transparent';
    btn.style.color       = isActive ? '#FFFFFF'  : '#475569';
    btn.style.borderRadius = isActive ? '8px'  : '';
  });
}

// 8. Lucide icons init
document.addEventListener('DOMContentLoaded', function() {
  if (window.lucide) { lucide.createIcons(); }
});
```

---

## 7. FINAL COMPLIANCE CHECKLIST

Run through this checklist before calling the output complete. All items must be TRUE.

```
STRUCTURE
[ ] HTML file begins with <!DOCTYPE html> and ends with </html>
[ ] Google Fonts import is present for DM Sans + DM Mono
[ ] Lucide JS CDN script tag is present
[ ] lucide.createIcons() is called on DOMContentLoaded
[ ] CSS :root block contains all variables from Section 2
[ ] .iphone-frame CSS renders correctly (390px wide, 844px tall, border-radius:44px)

SCREEN COUNT — MUST = 34
[ ] Count <div class="screen-block"> elements: expect exactly 34
[ ] Outer <select> in doc-nav contains all 34 options
[ ] Each screen-block has a unique id="screen-{id}" matching the select option

GROUP A (1 screen)
[ ] screen-auth-login — Navy gradient bg, white logo, white card, Sign In button

GROUP B — STUDENT (13 screens — count them)
[ ] screen-student-dashboard — Normal state, 4-tab bottom nav, greeting, stats, upcoming
[ ] screen-student-dashboard-live — LIVE hero card with animated badge + timer + CTA
[ ] screen-student-exams — 3 sections: Live (red border) / Upcoming / Completed
[ ] screen-student-consent — 2 checkbox sections, no bottom nav
[ ] screen-exam-lobby — Connection status, settings 2×3 grid, no bottom nav
[ ] screen-flash-display — NO top bar, NO nav, 96px DM Mono number, transition:none
[ ] screen-flash-mcq — 2×2 mcq-grid min-height:64px, navigator row, flag+next buttons
[ ] screen-flash-review — 4-column question grid, submit button, no bottom nav
[ ] screen-exam-complete — Full-page, trophy icon, DM Mono large score, no nav
[ ] screen-assessment-v5 — Vertical arithmetic table, DM Mono 48px numbers, no nav
[ ] screen-student-results — Hero card + filter chips + ledger cards, Results nav active
[ ] screen-student-result-detail — Score panel, grade card, 3 KPI, CTA cards
[ ] screen-student-profile — Avatar hero, info rows, collapsible More Info, Profile nav active

GROUP C — ADMIN (20 screens — count them)
[ ] screen-admin-dashboard — 3 KPIs, live exam cards, activity feed, 5-tab admin nav
[ ] screen-admin-students — Search + filter chips + student cards with avatars
[ ] screen-admin-student-detail — Hero, 3 sections, performance stats, delete btn
[ ] screen-admin-create-student — Bottom sheet overlay, 4 form fields
[ ] screen-admin-levels — Drag-handle cards, seq-badges, 5 level entries
[ ] screen-admin-level-detail — Tab strip (Students/Assessments), student table
[ ] screen-admin-create-level — Bottom sheet, single text field
[ ] screen-admin-assessments — Segmented toggle, status filter pills, 3+ assessment cards
[ ] screen-admin-wizard-step1 — Wizard header, 3-step stepper, 2 type cards stacked
[ ] screen-admin-wizard-step2 — Step 2 active, 3 setting sections with steppers + toggles
[ ] screen-admin-flash-config — Live preview "-412" #991B1B, stepper controls
[ ] screen-admin-monitor-hub — 3 live exam cards with red border-left and stats
[ ] screen-admin-monitor-detail — Status strip, 3 KPI cards, 4-student table with chips
[ ] screen-admin-activity — Timeline with colored dots, 6+ entries
[ ] screen-admin-announcements — Compose card (textarea + select) + past announcements
[ ] screen-admin-results — Segmented toggle + filter chips + result cards with left accents
[ ] screen-admin-result-detail — KPIs, grade distribution bars, View Student List btn
[ ] screen-admin-student-drawer — Bottom sheet, MISSED/ENROLLED stats, table + section
[ ] screen-admin-answer-sheet — Student card, 3 KPIs, Q1 correct card, Q2 wrong card
[ ] screen-admin-settings — Logo uploader, grade boundaries table, sticky unsaved bar

COLOR RULES
[ ] Primary buttons use #1A3829 — NOT #204074 (that's brand navy, wrong here)
[ ] Flash Anzan negative number (-412 in B6, operands in B10, preview in C11) use #991B1B
[ ] Error states (wrong answers, danger buttons, Live badge color) use #DC2626 — NOT #991B1B
[ ] LIVE badge background is #EF4444
[ ] Active nav items use background #EFFAF4 with text color #1A3829
[ ] Grade A/A+ pills: bg #EFFAF4, text #1E4A35
[ ] Grade B pills: bg #DBEAFE, text #1D4ED8
[ ] Grade C pills: bg #FEF3C7, text #92400E
[ ] Grade F pills: bg #FEE2E2, text #DC2626

TYPOGRAPHY
[ ] DM Mono used for: all timers, scores, roll numbers, arithmetic numbers, sequence badges
[ ] Flash number (B6) has transition:none !important
[ ] Body text uses DM Sans

TOUCH TARGETS
[ ] All interactive elements have min-height: 44px
[ ] MCQ buttons (.mcq-btn) have min-height: 64px
[ ] Bottom nav items are 60px tall
```

---

## 8. ADDITIONAL NOTES

- The Admin "More" tab bottom sheet must list: Levels, Results, Activity Log, Announcements, Settings — each as a tappable row with icon + label
- Implement the Admin "More" sheet as a positioned `.bottom-sheet` inside each Admin screen's `.iphone-content`, hidden by default, toggled by the More tab
- Screens B4, B5, B6, B7, B8, B9, B10 must have NO bottom navigation (pre-exam and in-exam flows)
- Screens C4, C7, C18 must show as bottom-sheet overlays (not full standalone screens without context)
- The document-level scrolling allows viewing all 34 screens by scrolling down
- Every iPhone frame is independently scrollable via its `.iphone-content` div (overflow-y:auto)
- Produce the complete, working HTML file. No partial outputs. No TODOs. No "rest remains unchanged."
