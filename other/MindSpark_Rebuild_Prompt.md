# MASTER PROMPT — MindSpark UI Mockup Rebuilder
# For: Antigravity IDE (Gemini Pro 3.1 High)
# Task: Analyze index(1).html → Identify missing screens → Rebuild complete, bug-free index.html

---

<objective>
You are a Principal Frontend Engineer and UI Architect. Your task is to perform a complete,
systematic rebuild of the MindSpark mockup gallery file.

You have one input file: `index(1).html`

You will produce one output file: `index_complete.html`

This file must contain every screen of the MindSpark Web Application rendered as iframes in
a structured gallery — complete, ordered correctly, visually consistent, and free of all known
bugs. Do not skip any step. Do not guess. Read first. Think second. Build third.
</objective>

---

<phase_1_analysis title="DEEP CODEBASE ANALYSIS — READ EVERYTHING FIRST">

Before writing a single line of output, you must fully read and parse `index(1).html`.

Extract and record the following precisely:

**1.1 — Shell Structure**
Read the full outer HTML shell. Document:
- The `<head>` block: charset declaration, viewport meta, title, all external font imports
- The `.topnav` bar: its HTML structure, all CSS properties applied to it, and every child element
  (logo, separator, select/dropdown, screen count label)
- The `.container` wrapper: max-width, padding, margin behaviour
- The `.group-block` pattern: how section groups are structured (header, label, count, grid of screens)
- The `.screen-block` pattern: the exact DOM structure of a single screen entry (wrapper div,
  h2 title, subtitle/path text if any, iframe element, back-to-top link)
- The full `<style>` block: capture every CSS rule, variable, and selector

**1.2 — Present Screen Inventory**
Identify every `<div class="screen-block">` element. For each one record:
- Its `id` attribute
- Its `<h2>` title text
- Which group section it belongs to (STUDENT or ADMIN)
- The `srcdoc` content summary (what the iframe renders — layout type, key elements visible)
- Any subtitle, path label, or annotation text beneath the title

**1.3 — iframe Technical Audit**
For every `<iframe>` in the file, record:
- How `scrolling` is set
- How `width` and `height` are set
- Whether any `onload` or `postMessage` height-sync mechanism is present
- Whether any responsive scaling or viewport override is applied inside the srcdoc

**1.4 — Navigation Dropdown Audit**
Read the `<select>` element in the topnav. Record every `<option>` and the exact section ID it
links to. This defines the complete intended screen list. Every option that does not have a
matching `<div id="...">` in the file is a MISSING SCREEN.

**1.5 — Design Token Extraction**
Read all CSS in the file. Extract and document the following as a structured design system:

Color Palette:
- Primary background (page): #F1F5F9
- Primary brand (topnav, headers, accents): #1A3829
- Text primary: #0F172A
- Text secondary: #64748B
- Text muted: #94A3B8
- White: #fff
- Confirm any additional colors used inside srcdoc iframes

Typography:
- Primary font: DM Sans (weights: 400, 500, 600, 700)
- Monospace font: DM Mono (weights: 400, 500)
- Google Fonts import URL currently in the file

Spacing & Layout:
- Container max-width
- Section group margin/padding
- Screen block gap in the grid
- Standard topnav height value

**1.6 — Bug Audit (Existing File)**
While reading, flag every instance of the following known bugs:

BUG-01 EMPTY CSS RULE: Find any CSS selector blocks with empty bodies (e.g. `#top {}`).
  Note every occurrence, the selector name, and its line number.

BUG-02 FIXED TOPNAV HEIGHT: Check `.topnav` for `height: 56px` without `flex-wrap: wrap` or
  `min-height`. Note whether wrapping is possible if nav items overflow.

BUG-03 IOS SELECT OPTION BACKGROUND: Check `.topnav select option` for `background: #1A3829`.
  iOS Safari ignores background on `<option>` elements. Note if this is present.

BUG-04 IFRAME HEIGHT CLIPPING: Check every iframe for a mechanism (postMessage, ResizeObserver,
  or onload calculation) that sends the child document's scrollHeight to the parent. Note if
  absent — this causes content to be clipped vertically.

BUG-05 HORIZONTAL OVERFLOW IN IFRAMES: Look inside srcdoc content for fixed-width elements such
  as `.sidebar { width: 240px; flex-shrink: 0; }` that will overflow when iframe is narrower.
  Note every fixed-width element that lacks a responsive fallback.

BUG-06 MOJIBAKE CHARACTERS: Search for any malformed characters in text — particularly the
  sequence `â†'` or similar multi-byte corruption in back-to-top links or anywhere else.
  Note exact location and the corrupted string.

BUG-07 VIEWPORT META MISSING IN SRCDOC: Check whether iframes rendered on mobile will scale
  correctly. Srcdoc HTML should include its own `<meta name="viewport" ...>` declaration.
  Note if absent.
</phase_1_analysis>

---

<phase_2_screen_mapping title="SCREEN MAPPING — IDENTIFY WHAT IS PRESENT AND WHAT IS MISSING">

**2.1 — Confirmed Present Screens**
Based on your Phase 1 analysis, the following 20 screens are confirmed to exist in
`index(1).html`. Verify each one is present with the correct ID:

STUDENT GROUP (5 screens):
  [top]                  Student Dashboard
  [student-exams-tests]  Student Exams & Tests
  [student-assessment-v5] Assessment-Taking (v5)
  [student-results-flow] Results Flow
  [student-profile]      Student Profile

ADMIN GROUP (15 screens):
  [admin-dashboard]      Admin Dashboard
  [students-list]        Students — List
  [student-detail]       Students — Detail
  [student-drawer]       Students — Drawer
  [student-dialogs]      Students — Dialogs
  [levels-list]          Levels — List
  [level-detail]         Levels — Detail
  [level-dialog]         Levels — Dialog
  [assessments-list]     Assessments — List
  [assessment-wizard]    Assessments — Wizard
  [live-monitor]         Live Monitor
  [hub-layout-v4]        Results — Hub
  [detail-layout-v3]     Results — Detail
  [answer-sheet]         Results — Answer Sheet
  [settings]             Settings

If any of the above are absent in your reading, reclassify them as missing.

**2.2 — Confirmed Missing Screens**
The following 11 screens are confirmed absent from the current file based on application flow
analysis. They MUST be designed and added in the rebuild:

AUTH GROUP (1 screen — NEW GROUP to be added before STUDENT):
  [auth-login]           Login
    Flow: Email + password fields. Single card, centered. Primary button "Sign In".
    Role selector or auto-route based on credentials. MindSpark branding. #1A3829 accent.

STUDENT GROUP — Missing (6 screens to insert after [student-exams-tests]):
  [student-consent]      Student Consent & Academic Integrity
    Flow: One-time form before first exam. Three accordion sections:
      1. Assessment Rules (checkbox acknowledgement)
      2. Data Privacy (read + confirm)
      3. Guardian Consent (guardian name + relationship input, required if under 18)
    Single CTA: "I Agree & Continue". Cannot be skipped.

  [exam-lobby]           Exam Lobby
    Flow: Pre-exam waiting room. Shows exam name, question count, time limit, Flash Anzan
    config (digit count, speed, negative numbers toggle). Live connectivity status indicator
    (green dot = stable). Large CTA: "I'm Ready — Begin Exam". Clock does NOT start yet.

  [flash-display]        Flash Anzan — Number Display
    Flow: Full-screen immersive. Dark background (#0F172A or #1A3829). Single large number
    in the centre of the screen (positive or negative). Progress bar or counter showing
    "Flash 3 of 8". No input. Auto-advances. Tab-switch overlay: if focus leaves, full
    overlay appears with pause icon + "Return to your exam" message.

  [flash-mcq]            Flash Anzan — MCQ Answering
    Flow: 2×2 grid of answer options (A, B, C, D). Question number shown top-left.
    Countdown timer top-right. Right-side panel: question navigator showing all question
    numbers, colour-coded (answered = filled, current = outlined, skipped = dashed).
    "Flag" button to mark for review. "Next" button.

  [flash-review]         Flash Anzan — Review & Submit
    Flow: Full grid summary of all questions. Each cell shows Q number + status icon:
      ✓ Answered (green), — Skipped (amber), ○ Unanswered (grey).
    Warning alert banner if any questions are unanswered or skipped.
    Low-time warning when < 60 seconds remain (amber banner).
    Large "Submit Exam" button. Confirmation dialog on click.

  [exam-complete]        Exam Completion
    Flow: Result card centered on screen. Large score (e.g. 18/20). Percentage (90%).
    Grade badge (e.g. A). Breakdown row: X Correct · X Incorrect · X Skipped.
    Optional "View Answer Sheet" button if admin has released key.
    "Back to Dashboard" CTA.

ADMIN GROUP — Missing (4 screens to insert at correct positions):
  [monitor-detail]       Monitor — Detail
    Position: Immediately after [live-monitor]
    Flow: Drill-down for one live exam. Table of all students in that exam:
    columns — Student Name, Roll No., Status (Not Started / In Progress / Submitted /
    Timed Out), Questions Answered, Time Elapsed. Auto-refreshes. "← Back to Monitor" link.

  [activity-log]         Activity Log
    Position: After [monitor-detail]
    Flow: Chronological table. Columns: Timestamp, User, Role, Action Description,
    Target (student name or exam name). Filterable by date range and user. Read-only.
    No edit or delete controls.

  [announcements]        Announcements
    Position: After [activity-log]
    Flow: Two-panel layout. Left: compose panel (title input, body textarea, audience
    selector — specific cohort or All Students, Send button). Right: sent history list
    showing title, audience, date sent, read/unread count per announcement.

  [flash-config]         Flash Anzan — Configuration
    Position: After [assessment-wizard] (as a sub-screen of the wizard)
    Flow: Standalone config panel embedded in the wizard flow. Fields:
    Number of Digits (stepper, 1–4), Flash Speed (slider, 0.5s–3s), Number of Flashes
    per Question (stepper, 2–10), Include Negative Numbers (toggle), Total Questions
    (stepper, 5–30). Live preview: shows a sample number rendered at the chosen digit
    count. "Save Configuration" button.

**2.3 — Final Complete Screen Order**
The rebuilt file must present screens in this exact order:

  GROUP: AUTH (1 screen)
    auth-login

  GROUP: STUDENT (11 screens)
    top (Student Dashboard)
    student-exams-tests
    student-consent        ← NEW
    exam-lobby             ← NEW
    flash-display          ← NEW
    flash-mcq              ← NEW
    flash-review           ← NEW
    exam-complete          ← NEW
    student-assessment-v5
    student-results-flow
    student-profile

  GROUP: ADMIN (19 screens)
    admin-dashboard
    students-list
    student-detail
    student-drawer
    student-dialogs
    levels-list
    level-detail
    level-dialog
    assessments-list
    assessment-wizard
    flash-config           ← NEW
    live-monitor
    monitor-detail         ← NEW
    activity-log           ← NEW
    announcements          ← NEW
    hub-layout-v4
    detail-layout-v3
    answer-sheet
    settings

Total: 31 screens.
</phase_2_screen_mapping>

---

<phase_3_design_system title="DESIGN SYSTEM — RULES ALL NEW SCREENS MUST FOLLOW">

Every new screen's srcdoc must be designed using these exact specifications.
Do not invent new colors, fonts, or patterns. Extend what exists. Match precisely.

**3.1 — Color Tokens**
  --color-brand:        #1A3829   (primary green — nav, headers, CTAs, borders)
  --color-brand-light:  #2D5540   (hover states on brand elements)
  --color-bg-page:      #F1F5F9   (outer page background)
  --color-bg-card:      #FFFFFF   (card/panel backgrounds)
  --color-bg-subtle:    #F8FAFC   (table row stripes, input fills)
  --color-text-primary: #0F172A   (headings, primary labels)
  --color-text-secondary:#64748B  (supporting text, captions)
  --color-text-muted:   #94A3B8   (placeholders, disabled states)
  --color-border:       #E2E8F0   (dividers, card borders, input outlines)
  --color-success:      #16A34A   (answered/correct states)
  --color-warning:      #D97706   (skipped/low-time warnings)
  --color-danger:       #DC2626   (errors, timed-out states)
  --color-white:        #FFFFFF

**3.2 — Typography**
  Font stack: 'DM Sans', system-ui, sans-serif
  Mono stack: 'DM Mono', monospace

  Sizes:
    Page title / hero:  24px, weight 700
    Section heading:    18px, weight 600
    Card heading:       15px, weight 600
    Body text:          14px, weight 400
    Label / caption:    13px, weight 500
    Micro / badge:      11px, weight 700, letter-spacing 0.1em, uppercase

  Note: DM Sans is imported from Google Fonts in the outer shell. Every srcdoc iframe MUST
  import it independently with its own <link> tag, as iframes do not inherit parent fonts.

**3.3 — Component Patterns (copy these exactly from existing screens)**

  Sidebar (Admin screens):
    width: 220px, background: #1A3829, color: #fff
    Nav items: padding 10px 16px, border-radius 6px
    Active item: background rgba(255,255,255,0.15)
    Icons: 16px, inline with 10px gap to label text

  Top app bar (inside srcdoc, where used):
    height: 56px, background: #fff, border-bottom: 1px solid #E2E8F0
    Title: 15px, weight 600, color #0F172A

  Card:
    background: #fff, border-radius: 12px, border: 1px solid #E2E8F0
    padding: 20px, box-shadow: 0 1px 3px rgba(0,0,0,0.06)

  Primary button:
    background: #1A3829, color: #fff, border-radius: 8px
    padding: 10px 20px, font-size: 14px, font-weight: 600
    hover: background #2D5540

  Secondary button:
    background: #fff, color: #1A3829, border: 1.5px solid #1A3829
    border-radius: 8px, padding: 9px 20px, font-size: 14px

  Input field:
    border: 1.5px solid #E2E8F0, border-radius: 8px, padding: 9px 12px
    font-size: 14px, background: #F8FAFC
    focus: border-color #1A3829, outline: none

  Table:
    border-collapse: collapse, width: 100%
    thead: background #F8FAFC, border-bottom: 2px solid #E2E8F0
    th: font-size 12px, font-weight 700, text-transform uppercase,
        letter-spacing 0.08em, color #64748B, padding 10px 16px
    td: padding 12px 16px, border-bottom: 1px solid #F1F5F9
    row hover: background #F8FAFC

  Badge / Status pill:
    border-radius: 999px, padding: 3px 10px, font-size 12px, font-weight 600
    Success: background #DCFCE7, color #16A34A
    Warning: background #FEF9C3, color #D97706
    Danger: background #FEE2E2, color #DC2626
    Neutral: background #F1F5F9, color #64748B

**3.4 — Screen Layout Templates**

  Admin screen with sidebar:
    Outer: display flex, height 100vh (or min-height 100%)
    Sidebar: 220px fixed, full height, #1A3829
    Main: flex 1, overflow-y auto
    Header bar: 56px, white, sticky top
    Content area: padding 24px, background #F1F5F9

  Student screen (no sidebar):
    Full width, background #F1F5F9
    Centered card or full-width with max-width 800px
    Top bar: 56px, #1A3829, white text

  Full-screen immersive (Flash Display):
    background: #0F172A, color: #fff
    Centered content, min-height 100vh
    No sidebar, no standard nav
</phase_3_design_system>

---

<phase_4_technical_constraints title="TECHNICAL GUARDRAILS — ALL BUGS MUST BE FIXED IN THE REBUILD">

These are non-negotiable engineering rules. Every single one must be applied to the rebuilt
file. Do not replicate any of these patterns from the original file.

**CONSTRAINT-01 — UTF-8 Encoding (Fix BUG-06)**
  RULE: The outer HTML shell MUST open with `<!DOCTYPE html>` followed immediately by
  `<html lang="en">` and `<head>` whose FIRST child is `<meta charset="UTF-8">`.
  No exceptions. Character set declaration before any content.

  For the back-to-top links, use the explicit HTML entity:
    WRONG:  <a href="#top" class="back-btn">↑ Top</a>   (raw character, causes mojibake)
    CORRECT: <a href="#top" class="back-btn">&#8593; Top</a>

  Every srcdoc iframe must also begin with `<meta charset="UTF-8">` as its first head tag.

**CONSTRAINT-02 — Responsive Top Navigation (Fix BUG-02)**
  RULE: The `.topnav` must NEVER use a fixed `height` property. Use `min-height` instead.
  It must support wrapping when items overflow on narrow viewports.

  Required CSS:
    .topnav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      min-height: 56px;
      padding: 8px 24px;
      /* NOT: height: 56px */
    }

  Items that currently have `white-space: nowrap` (.topnav-logo, .topnav-count) may keep
  that property, but the nav itself must flex-wrap so they move to a new row rather than
  overflow or clip.

  The screen count label `(.topnav-count)` must update dynamically to reflect the total
  number of screens rendered in the rebuilt file (31 screens).

**CONSTRAINT-03 — Custom Dropdown (Fix BUG-03)**
  RULE: Do NOT use `background` or `color` on `<option>` elements.
  iOS Safari ignores these properties and renders native OS styling, making coloured
  option backgrounds invisible or broken on iPhones and iPads.

  Two acceptable solutions — choose one:
  
  Option A (Simpler): Keep the native `<select>` element but remove ALL styling from
  `<option>` tags. Only style the `<select>` element itself. Accept native option appearance.

    .topnav select option {
      /* Remove background and color — leave empty or delete entirely */
    }

  Option B (Full Custom): Replace the `<select>` with a custom accessible dropdown:
    - A `<button>` that displays the currently selected screen name
    - A `<ul role="listbox">` that appears on click, styled with #1A3829 background
    - Each `<li role="option">` links to a screen section by ID
    - Keyboard navigable (arrow keys, Enter, Escape)
    - Closes when clicking outside (document click listener)
    - ARIA attributes: aria-expanded, aria-haspopup="listbox", aria-selected

  Whichever option you choose, document it clearly in a comment at the top of the JS block.

**CONSTRAINT-04 — Iframe Auto-Resize: No Vertical Clipping (Fix BUG-04)**
  RULE: No iframe may use a hard-coded height that clips its content. Every iframe must
  auto-size to fit the full height of its srcdoc content.

  Required implementation — postMessage height bridge:

  Inside every srcdoc `<body>`, add this script as the LAST element before `</body>`:
    <script>
      function reportHeight() {
        const h = document.documentElement.scrollHeight;
        window.parent.postMessage({ iframeId: '__SCREEN_ID__', height: h }, '*');
      }
      window.addEventListener('load', reportHeight);
      window.addEventListener('resize', reportHeight);
      if (document.readyState === 'complete') reportHeight();
    </script>
  Replace __SCREEN_ID__ with the parent screen-block's id attribute value.

  In the outer shell, add this listener once:
    <script>
      window.addEventListener('message', function(e) {
        if (e.data && e.data.iframeId && e.data.height) {
          const iframe = document.querySelector(
            '#' + e.data.iframeId + ' iframe'
          );
          if (iframe) {
            iframe.style.height = e.data.height + 'px';
          }
        }
      });
    </script>

  All iframes must start with a reasonable minimum height (e.g. height="600") and the
  postMessage mechanism will grow them as needed.

**CONSTRAINT-05 — No Horizontal Overflow in Iframes (Fix BUG-05)**
  RULE: No element inside any srcdoc may use a fixed pixel width that is wider than the
  iframe's responsive container.

  Specifically:
  - Sidebars: Use `width: 220px; min-width: 180px; flex-shrink: 0` but also add:
      @media (max-width: 768px) { .sidebar { display: none; } }
    (On mobile viewports the sidebar collapses — a hamburger menu icon replaces it)
  - Tables: Must have `width: 100%; table-layout: fixed; overflow-x: auto` on their
    containing div. Long text cells truncate with `text-overflow: ellipsis`
  - Modal / dialog overlays: Must be `width: min(480px, 90vw)` — never fixed px only
  - Any element wider than ~300px: Must have a max-width or percentage width fallback

  Every srcdoc must include at its `<html>` level:
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  This prevents mobile Safari from zooming out to fit a desktop-width layout.

**CONSTRAINT-06 — No Empty CSS Rules (Fix BUG-01)**
  RULE: Before writing the final output, perform a CSS audit pass.
  Delete every CSS rule block that has an empty body. Examples of what must be removed:
    #top {}          ← DELETE
    .unused {}       ← DELETE
    @media ... {}    ← DELETE if inner block is also empty

  Also remove any duplicate selector declarations. One rule per selector.

**CONSTRAINT-07 — Srcdoc Encoding: Attribute-Safe HTML**
  RULE: All srcdoc content lives inside an HTML attribute value delimited by double quotes.
  This means any double quote `"` inside the srcdoc MUST be escaped as `&quot;`.
  Any ampersand `&` must be escaped as `&amp;` unless it is already the start of an entity.
  Unescaped characters will silently break the srcdoc rendering without error.

**CONSTRAINT-08 — Google Fonts in Srcdoc**
  RULE: iframes do not inherit styles from the parent page. Every srcdoc that uses DM Sans
  or DM Mono MUST include its own Google Fonts import:
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  Place this as the second `<head>` element, after `<meta charset="UTF-8">`.

**CONSTRAINT-09 — Section Group Counts Must Be Accurate**
  RULE: Each `.group-header` contains a `.group-count` badge that shows how many screens
  are in that group (e.g. "11 screens"). These must be updated to reflect the final counts:
    AUTH:    1 screen
    STUDENT: 11 screens
    ADMIN:   19 screens
  Hardcode the correct integer. Do not leave stale counts from the original file.

**CONSTRAINT-10 — Navigation Dropdown Must List All 31 Screens**
  RULE: The `<select>` (or custom dropdown) in `.topnav` must contain one entry per screen,
  grouped by section using `<optgroup label="...">` tags, in the same order defined in
  Phase 2, Section 2.3. Each option's value must be the anchor ID of its screen block
  (e.g. value="#auth-login"). Selecting an option must scroll to that screen block.
</phase_4_technical_constraints>

---

<phase_5_rebuild title="REBUILD EXECUTION — HOW TO BUILD THE OUTPUT FILE">

Now that analysis is complete, execute the rebuild in this exact order:

**5.1 — Build the Outer Shell First**
Write the complete outer HTML shell including:
- Corrected `<head>` with UTF-8 meta as first element
- Google Fonts import
- Full corrected CSS (all bugs fixed per constraints above)
- Corrected `.topnav` with responsive flex-wrap, updated screen count (31)
- Custom dropdown or cleaned native select with all 31 screens in correct order
- `.container` wrapper
- postMessage height-listener script block

**5.2 — Build Each Screen Block**
For each of the 31 screens in the order defined in Phase 2, Section 2.3:

  a) Write the `.group-block` header for new groups (AUTH is a new group)
  b) Write the `<div class="screen-block" id="[screen-id]">` wrapper
  c) Write the `<h2>` title
  d) Write any subtitle or path annotation
  e) Write the `<iframe>` with:
     - `scrolling="no"`
     - `width="100%"`
     - `height="600"` (initial minimum)
     - `frameborder="0"`
     - `srcdoc="..."` containing the full screen HTML

  For EXISTING screens: copy the srcdoc from the original file verbatim, then apply only
  the fixes required by the constraints (add postMessage script, add viewport meta, fix
  any font imports, remove fixed-width overflow violations). Do not redesign existing screens.

  For NEW screens (the 11 missing ones): design them according to the spec in Phase 2
  Section 2.2 and the design system in Phase 3. Each new screen's srcdoc must look like
  a natural continuation of the existing screens — same sidebar pattern, same card style,
  same color tokens, same typography. A viewer should not be able to distinguish new from old.

  f) Write the back-to-top link using the correct entity: `&#8593; Top`

**5.3 — Quality Check Before Finalising**
Before writing the final `</html>`, mentally verify:
  [ ] Total screen-block divs = 31
  [ ] All 11 new screens are present with correct IDs
  [ ] Screen order matches Phase 2 Section 2.3 exactly
  [ ] Every iframe has the postMessage height script in its srcdoc
  [ ] Every srcdoc has `<meta charset="UTF-8">` as first head element
  [ ] Every srcdoc has the Google Fonts import
  [ ] Every srcdoc has `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  [ ] No `background` or `color` on `<option>` tags
  [ ] No `height: 56px` on `.topnav` (replaced by min-height)
  [ ] No fixed widths wider than viewport without responsive fallbacks
  [ ] No empty CSS rule blocks
  [ ] No `â†'` or other mojibake — only `&#8593;` or plain ASCII arrows
  [ ] `.group-count` badges show correct numbers (1, 11, 19)
  [ ] Dropdown lists all 31 screens in correct grouped order
  [ ] postMessage listener exists once in the outer shell
  [ ] All double quotes in srcdoc attributes are escaped as `&quot;`

**5.4 — Output**
Write the complete rebuilt file as `index_complete.html`.
It must be a single self-contained HTML file with no external file dependencies other than
the Google Fonts CDN import.

Do not produce a summary report, explanation, or markdown analysis file.
The only output is `index_complete.html` — complete, clean, and ready to open in a browser.
</phase_5_rebuild>

---

<thinking_protocol>
Before you write the first character of `index_complete.html`, you must complete these
thinking steps in order. Show your work for each step in your internal reasoning:

STEP 1: Read `index(1).html` from top to bottom. List every screen ID you find.
STEP 2: Cross-reference your list against the 20 confirmed screens in Phase 2.1.
         Flag any discrepancies.
STEP 3: Confirm all 11 missing screens from Phase 2.2. Plan where each goes.
STEP 4: Extract the exact CSS from the original file's `<style>` block.
STEP 5: Plan the corrected CSS: list every rule that changes and why.
STEP 6: For each of the 11 new screens, sketch its layout in plain text before writing HTML.
STEP 7: Write the outer shell. Verify it compiles mentally.
STEP 8: Write each of the 31 screen blocks in order.
STEP 9: Run the 16-point quality checklist from Phase 5.3.
STEP 10: Output `index_complete.html`.

Do not skip steps. Do not proceed to the next step until the current one is complete.
</thinking_protocol>

---

<final_instruction>
You have full context. You have the original file. You have the design system.
You have the missing screen specifications. You have the bug fixes.
You have the quality checklist.

Read. Think. Build. Output `index_complete.html`.
</final_instruction>
