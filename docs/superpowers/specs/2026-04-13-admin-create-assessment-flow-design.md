# Admin Create Assessment Flow Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Full-page 5-step wizard for creating an assessment — Type Selection → Settings → Build Questions → Review → Success. Covers both EXAM and TEST variants, Flash Preview modal, draft auto-save, and database schema additions.

---

## 1. Goal

Replace the existing 3-step modal wizard (`CreateAssessmentWizard` dialog in `src/components/assessments/`) with a **full-page focused-task wizard** that hides the admin sidebar and gives the canvas over to assessment creation. The new wizard:

- Uses 5 clear steps instead of the current 3 (Type → Settings → Questions → Review → Success)
- Supports rich Settings (scheduling, grading rules, student experience toggles, save-as-default memory)
- Uses a split-pane MCQ builder for both EXAM and TEST
- Adds an on-demand Flash Preview modal for TEST assessments
- Auto-saves on every step transition + exposes an explicit "Save Draft" button
- Provides a context-aware Success screen (Published vs Draft variants with different action buttons)

The admin should feel like they're in a focused creation mode — not interrupted by the sidebar, breadcrumb, or other admin chrome.

---

## 2. Route Map

```
/admin/assessments/new                     → Step 1: Type Selection (default)
/admin/assessments/new?step=2              → Step 2: Settings
/admin/assessments/new?step=3              → Step 3: Build Questions
/admin/assessments/new?step=4              → Step 4: Review
/admin/assessments/new?step=5              → Step 5: Success (after publish/save-draft)

/admin/assessments/[id]/edit               → Re-enters the wizard on a Draft
/admin/assessments/[id]/edit?step=3        → Deep link into a specific step
```

- The wizard is a dedicated route — **NOT** a modal dialog over the list page
- The admin sidebar is **hidden** for this route via a conditional in `src/app/(admin)/layout.tsx`
- URL query param `?step=N` preserves position so browser back/forward works naturally
- Draft resume: clicking "Edit Draft" on the Assessments list page navigates to `/admin/assessments/[id]/edit` which loads the existing DRAFT and resumes at Step 3 (questions) by default, but admin can jump to any step via the stepper
- Clicking "Exit Wizard" or browser-navigating away shows a confirmation dialog ("Unsaved changes will be kept as a draft. Continue?") — auto-save has already persisted most state, but the current in-edit field may not be saved

---

## 3. Design System Notes

Uses the MINDSPARK tokens from earlier specs in this session:
- DM Sans for UI, DM Mono for numbers/IDs/sequences
- Forest Green `#1A3829` primary, `#EFFAF4` light accent, `#B7E4C7` pill border
- Charcoal text scale: `#0A0F1A` / `#1E293B` / `#334155` / `#475569`
- Card radius 14px (standard), 16–18px (hero cards, dialogs)
- Base font size 16px
- Lucide-react line icons, stroke 1.75

Two wizard-specific additions:
- **Purple accent** `#6D28D9` with `#F5F3FF` tint for TEST-related UI (Flash Config card, test type icon)
- **Stepper circle active glow**: `box-shadow: 0 0 0 4px rgba(26, 56, 41, 0.12)` around the active step circle

---

## 4. Wizard Shell

Every wizard step shares the same chrome.

### Top bar (height 72px)

- White background, `#E2E8F0` bottom border, padding 0×32
- **Left (width 240px):** MINDSPARK logo mark + wordmark (same as the global sidebar logo, repeated here so admin doesn't feel "lost")
- **Center (flex 1, max-width 720px, mx-auto):** horizontal 5-step indicator (see §5)
- **Right (width 240px, justify-end):** "Exit Wizard" outline button (h-38, X icon + text). On click, shows confirmation dialog before navigating back to `/admin/assessments`.

### Main canvas

- Flex: 1, padding 40×48×0 (no bottom padding — footer handles it), max-width 1180px, mx-auto
- Each step's content fills this canvas from top
- `overflow: hidden` on short steps; `overflow-y: auto` on long Settings/Review steps

### Footer

- `margin-top: auto`, padding 20×48, white bg, `#E2E8F0` top border
- Flex row, justify-between
- **Left cluster:** "Back" outline button (only on steps 2–4, never on step 1 or 5)
- **Right cluster:** "Save Draft" ghost button + "Next: {label}" primary button (or "Publish Assessment" large primary on Step 4)
- Save Draft button is always visible on steps 1–4; invisible on Step 5 (wizard is done)

### Sidebar visibility

Implementation note: `src/app/(admin)/layout.tsx` wraps admin routes with the sidebar. The wizard route needs a conditional that skips the sidebar wrapper when pathname starts with `/admin/assessments/new` or matches `/admin/assessments/[id]/edit`. Simplest implementation: move those routes into a `(wizard)` route group that has its own layout without the sidebar.

---

## 5. Horizontal Stepper

```
  ●───────────○───────────○───────────○───────────○
  1           2           3           4           5
  Type     Settings    Questions    Review       Done
```

### Node anatomy

Each node is a `flex-col` with a circle above a label:

- **Circle** (36×36, 9999 radius):
  - Inactive: white bg, `#E2E8F0` 2px border, `#94A3B8` DM Mono step number
  - **Completed:** `#EFFAF4` bg, `#1A3829` 2px border, `#1A3829` check icon (16×16, stroke 3)
  - **Active:** `#1A3829` bg, `#1A3829` 2px border, white DM Mono step number, plus `box-shadow: 0 0 0 4px rgba(26,56,41,0.12)` glow
- **Label** (below, 8px gap): 12/700 uppercase letter-spacing 0.06em
  - Inactive: `#94A3B8`
  - Completed: `#334155`
  - Active: `#1A3829`

### Connectors

- 2px horizontal line between nodes, min-width 36px, max-width 60px
- Positioned top: -12px (aligned with circle center, not label baseline)
- Inactive: `#E2E8F0`
- Completed: `#1A3829`

### Interaction (decision Q4: Linear with free back-jumping)

- Clicking an **incomplete** step does nothing (cursor not-allowed)
- Clicking a **completed** step navigates back to it, preserving all forward state
- Clicking the **active** step does nothing

---

## 6. Step 1 — Type Selection

**Route:** `/admin/assessments/new` (default) or `?step=1`

### Content

- **H1:** "Choose assessment type" (28/700 `#0A0F1A` -0.018em)
- **Subtitle:** "Pick which kind of assessment you're creating. This determines how questions are presented to students." (16/500 `#334155`)
- **Two big cards side by side** (grid-template-columns: 1fr 1fr, 20px gap)

### Type card anatomy

Each card is 420×260 minimum, white bg, 2px `#E2E8F0` border, 18px radius, padding 32:

- **Icon chip** (64×64, 16px radius, top of card): centered lucide icon 32×32 stroke 1.5
  - EXAM: `#EFF6FF` bg, `#1E3A8A` `clipboard-list` icon
  - TEST: `#F5F3FF` bg, `#6D28D9` `zap` icon
- **H3** (26/700 `#0A0F1A` -0.02em): "EXAM" or "TEST"
- **Paragraph** (15/500 `#334155` line-height 1.5): 2–3 sentence description of the type
- **Bullet list** (3 bullets, each with a check icon in `#1A3829`):
  - **EXAM bullets:** "Best for formal assessments" / "Students control their pacing" / "Ideal for 30–60 minute sessions"
  - **TEST bullets:** "Builds mental math speed" / "Configurable flash speed" / "Short 5–15 min sessions"

### Selected state

- Border changes to `#1A3829` 2px
- Background gets a subtle gradient `linear-gradient(180deg, #EFFAF4 0%, #FFFFFF 40%)`
- Box shadow: `0 12px 32px rgba(26,56,41,0.12)`
- A 26×26 forest-green circle with a white check icon appears in the top-right corner (positioned absolute top 16, right 16)
- Icon chip gets a subtle `transform: scale(1.05)`

### Interaction

- Clicking a card selects it (visual state only) but does NOT advance
- Admin must click "Next: Settings" in the footer to proceed
- If no card is selected, the Next button is disabled
- **On Next click:** writes `{ type: 'EXAM' | 'TEST' }` to local state AND calls `createAssessment` server action to create the DB row (status=DRAFT, title=null). The returned `paper_id` is stored in wizard state for subsequent steps.

### Data flow

```ts
// On clicking Next for the first time:
const result = await createAssessment({
  type: wizardState.type,
  // Placeholder values — will be overwritten in Step 2:
  title: 'Untitled Draft',
  duration_minutes: 30,
  level_id: defaultLevelId,  // First level in the institution
});

if ('ok' in result) {
  wizardState.paper_id = result.data.assessment_id;
  router.push('/admin/assessments/new?step=2');
}
```

---

## 7. Step 2 — Settings

**Route:** `/admin/assessments/new?step=2`

The richest step. 4 form sections stacked vertically inside a max-width 820px container, plus a blue-tinted "Save as default" footer row.

### H1 / subtitle

- H1: "Configure settings"
- Subtitle: "Set the basics, schedule, grading rules, and student experience."

### Section shell

Every section is a white card, `#E2E8F0` border, 14px radius, shadow-sm, overflow-hidden:

- **Section head** (padding 16×22, `#F1F5F9` bottom border):
  - 32×32 tinted icon chip (icon type per section)
  - Section title in 16/700 `#0A0F1A`
  - Optional right-aligned hint ("Optional") for scheduling section
- **Section body** (padding 20×22, flex column, 18px gap between fields)

### Section 1 — Core Info

- **Icon:** blue info-circle
- **Fields:**
  - **Title** (required, full-width text input, h-42) — placeholder "e.g. Q3 Mental Arithmetic — Level 3"
  - **Description** (optional textarea, min-height 72, resize vertical) — placeholder "Optional note for yourself or other admins. Students don't see this."
  - **Row grid** (2 columns, 14px gap):
    - **Level** (required, dropdown h-42) — populated from institution's levels, placeholder "Select level…"
    - **Duration** (required, number input + "minutes" suffix text) — DM Mono bold, default 30

### Section 2 — Scheduling (optional)

- **Icon:** amber calendar
- **Head hint:** "Optional" (12/600 `#475569`, right-aligned)
- **Fields (2-column grid):**
  - **Start Date & Time** — text-style date+time input with placeholder "e.g. Apr 15, 2026 at 9:00 AM" + help text "Leave empty to open the assessment manually later."
  - **End Date & Time** — same style with placeholder "e.g. Apr 15, 2026 at 9:30 AM" + help text "Leave empty to rely on Duration."
- Implementation uses a date-picker component (shadcn DatePicker or react-day-picker)

### Section 3 — Grading & Attempts

- **Icon:** green target
- **Row 1 (2 columns):**
  - **Pass Threshold** (required, number input + "%" suffix, DM Mono bold) — default 60
  - **Max Attempts** (required, number input DM Mono bold) — default 1
- **Row 2 (full-width radio group):**
  - Label: "Time Limit Enforcement *"
  - 2 cards side by side (1.5px border, 12px radius, 14×16 padding):
    - **Hard cutoff** (selected by default) — "Exam auto-submits at the exact second the timer ends."
    - **Grace period** — "Students get 30 seconds to finish their current question."
  - Selected card: `#1A3829` border, `#EFFAF4` bg

### Section 4 — Student Experience

- **Icon:** purple users
- **Two toggle rows** (divided by `#F1F5F9` border):
  - **Randomize question order** (toggle, default OFF) — "Each student sees the same questions in a different order, making it harder to share answers."
  - **Show correct answers after submission** (toggle, default ON) — "Students see which answers were right and wrong immediately after they submit."
- Toggle style: 40×22 pill, off=`#E2E8F0` bg, on=`#1A3829` bg, white 18×18 thumb slides 18px

### Save-as-Default footer row

Attached to the bottom of the Student Experience section (same card, just a different background):

- `#EFF6FF` bg, `#DBEAFE` top border, padding 18×22
- Flex row, justify-between, 16px gap
- **Left:**
  - Title "Save as default" (14/700 `#1E3A8A`) with bookmark icon
  - Description "Remember these settings for next time you create an assessment. You'll still see this step, just pre-filled." (12/500 `#334155`)
- **Right:** toggle (default OFF)

### Validation (before Next)

- Title: required, 1–120 chars
- Level: required
- Duration: required, 1–240 minutes
- Pass Threshold: 0–100
- Max Attempts: ≥ 1
- Time Limit Mode: required (one of hard/grace, default hard)
- Scheduling fields: optional, but if both provided, end must be after start

Invalid fields get `#DC2626` inline error text + red input border. Next button disabled until all valid.

### Data flow

```ts
// On clicking Next:
await updateAssessment({
  assessment_id: wizardState.paper_id,
  title, description, level_id, duration_minutes,
  scheduled_start_at, scheduled_end_at,
  pass_percentage, max_attempts, time_limit_mode,
  randomize_questions,
});

// If "Save as default" toggle is ON:
await upsertAssessmentDefaults({
  duration_minutes, pass_percentage, max_attempts, time_limit_mode,
  randomize_questions,
});

router.push('/admin/assessments/new?step=3');
```

> **Phase 2 audit correction (2026-04-14):** The original draft of this snippet referenced `pass_threshold_percent` and `show_correct_answers`. Both were removed:
> - `pass_threshold_percent` → use the existing `exam_papers.pass_percentage` column (numeric, nullable, already in live DB).
> - `show_correct_answers` → dropped entirely. The "answer key visibility" gate is owned by `exam_papers.answer_key_released` from the 2026-04-14 student-results-flow spec (per its §3.1 two-gate model). The wizard should not have a separate static flag.

---

## 8. Step 3 — Build Questions

**Route:** `/admin/assessments/new?step=3`

The largest and most complex step. Split pane layout shared by EXAM and TEST, with an additional Flash Config card above the pane for TEST.

### H1 / subtitle

- **EXAM:** "Build questions" / "Add question sequences and mark the correct answer. Use `245 | -242 | +466` format — one operand per pipe."
- **TEST:** "Build flash sequences" / "Configure the flash engine, then add your sequences using the same pipe format as EXAM."

### Flash Config card (TEST only)

Shown above the split pane when type === 'TEST':

- Gradient bg `linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 60%)`, `#EDE9FE` border, 14px radius, padding 18×20
- Flex row, items-center, 20px gap
- **Left:** 40×40 white icon chip with purple zap icon + small "FLASH ENGINE" label (11/600 uppercase `#6D28D9`) + "Configuration" title (14/700 `#0A0F1A`)
- **Middle (flex 1):** 3 slider params side by side:
  - **Flash Speed** — "300 ms" DM Mono 16/700, slider underneath (55% filled, `#6D28D9` color). Range: 100–1000 ms, default 300.
  - **Digit Count** — "3 digits" DM Mono 16/700. Range: 1–5, default 3.
  - **Operands / Sequence** — "10 operands" DM Mono 16/700. Range: 2–20, default 10.
- **Right:** "Preview Flash" purple button (`#6D28D9` bg, white text, play icon + text, h-40, 10px radius). On click opens Flash Preview modal (see §10).

### Split pane layout

`display: grid; grid-template-columns: 40% 60%; gap: 20px; min-height: 560px` (or 420px for TEST to accommodate the Flash Config card above).

Both columns are white cards with `#E2E8F0` border, 14px radius, shadow-sm, flex-col overflow-hidden.

### Left pane — Questions list

- **Head** (padding 14×18, bottom border `#F1F5F9`):
  - "Questions" (or "Flash Sequences" for TEST) label in 13/700 uppercase `#475569`
  - Right: count pill (`#EFFAF4` bg, `#1A3829` text, DM Mono 12/700) showing "{n} / {n}" where n is current question count
- **Question list** (padding 10, overflow-y auto):
  - Each question item: 12×14 padding, 10px radius, 1px border, flex row, items-center, 10px gap, 8px margin-bottom
  - **Drag handle** (14×14, `#CBD5E1`, `grip-vertical` lucide icon, cursor grab)
  - **Number badge** (DM Mono 12/700, `#F1F5F9` bg or `#1A3829` bg when active, 3×8 padding, 6px radius)
  - **Content column:**
    - Question expression in DM Mono 13/600 with `|` pipes in `#CBD5E1`, single-line with ellipsis
    - Below: "Correct: **B · 469**" (11/500 `#475569` with letter in `#1A3829` 700)
  - **Hover:** border `#CBD5E1`, bg `#F8FAFC`
  - **Active:** border `#1A3829`, bg `#EFFAF4`, number badge inverted to `#1A3829` bg with white text
- **"+ Add Question" button** at bottom of list:
  - Full width, 14px padding, 2px dashed `#CBD5E1` border, `#FFFFFF` bg, `#1A3829` text 14/700, plus icon
  - Hover: `#EFFAF4` bg, solid `#1A3829` border
  - On click: creates a new empty question, makes it active, focuses the sequence input

### Right pane — Question editor

- **Head** (padding 14×18, bottom border `#F1F5F9`):
  - "Editing Question {N}" label in 13/700 uppercase `#475569`
  - Right: small `ID: q-{short-id}` in DM Mono 12/600 `#94A3B8`
- **Body** (padding 22×24, flex column, 18px gap, overflow-y auto):

  **Field 1 — Sequence input:**
  - Label "Sequence *" (13/700 `#334155`)
  - Big input (h-50, 1.5px border `#E2E8F0`, 12px radius, `#F8FAFC` bg, DM Mono 18/600 `#0A0F1A` letter-spacing 0.02em, padding 0×16)
  - Focus state: border `#1A3829`, white bg, glow `0 0 0 3px rgba(26,56,41,0.08)`
  - Placeholder: "245 | -242 | +466" in `#94A3B8` 500
  - Help text (for TEST): "Numbers will flash one at a time at 300 ms intervals. Running total: **656**" (computed client-side from the sequence)

  **Field 2 — Options & Correct Answer:**
  - Label "Options & Correct Answer *"
  - **Options grid** (2×2, 10px gap). Each option row is:
    - 12×14 padding, 1.5px border `#E2E8F0`, 12px radius, white bg, flex row 10px gap
    - **Letter circle** (28×28, 9999 radius, 2px border `#E2E8F0`, `#F1F5F9` bg, DM Sans 13/700 `#475569`) — "A", "B", "C", "D"
    - **Value input** (borderless, DM Mono 15/600 `#0A0F1A`, flex 1, transparent bg, placeholder "Value" in `#94A3B8`)
    - **Check circle** (22×22, 9999 radius, 2px `#CBD5E1` border)
  - **Selected (correct) state:**
    - Row: border `#1A3829`, bg `#EFFAF4`
    - Letter circle: `#1A3829` bg, white text, `#1A3829` border
    - Check circle: `#1A3829` bg, white check icon (12×12, stroke 3.5)
  - Help text below grid: "Click a row's circle to mark it as the correct answer." (12/500 `#475569`)

  **Editor footer** (padding-top 16, top border `#F1F5F9`, flex justify-between):
  - **Left:** "Marks:" label + small number input (60×36, DM Mono bold, default 1)
  - **Right:** "Delete Question" button (`#FFFFFF` bg, `#FECACA` border, `#991B1B` text, trash icon, h-36, 13/600)

### Validation

- Each question must have: non-empty sequence, 4 non-empty options, exactly one marked correct, marks ≥ 1
- At least 1 question required before Next
- EXAM typically needs 10+ questions to be meaningful, but no hard minimum beyond 1

### Reordering

- Drag-and-drop via `@hello-pangea/dnd` (already in the project)
- Dropping a question reorders `order_index` locally, then auto-saves on next step transition

### Data flow

```ts
// Question create (auto-save on Add Question click):
await supabase
  .from('questions')
  .insert({
    paper_id: wizardState.paper_id,
    question_text: '',
    options: { A: '', B: '', C: '', D: '' },
    correct_answer: null,
    marks: 1,
    order_index: wizardState.questions.length + 1,
  });

// Question edit (debounced auto-save on input change, 500ms):
await supabase
  .from('questions')
  .update({ question_text, options, correct_answer, marks })
  .eq('id', questionId);

// Delete:
await supabase.from('questions').delete().eq('id', questionId);

// Reorder (after drag):
await supabase.from('questions').upsert(
  reorderedQuestions.map(q => ({ id: q.id, order_index: q.order_index }))
);
```

---

## 9. Step 4 — Review

**Route:** `/admin/assessments/new?step=4`

### H1 / subtitle

- H1: "Review and publish"
- Subtitle: "Everything looks good? Publish to make it available to students, or save as draft to continue editing later."

### Warning strip

Yellow warning banner at the top of the review content:

- `#FEF3C7` bg, `#FDE68A` border, 12px radius, padding 14×18, margin-bottom 20
- alert-triangle lucide icon (20×20 `#92400E`)
- Text (13/600 `#92400E` line-height 1.5): "Once published, you cannot edit questions or settings while the assessment is LIVE. Force Close it first if you need to change anything."

### Bento grid of review cards

- `grid-template-columns: repeat(2, 1fr); gap: 16px`, max-width 980px, mx-auto
- Three cards total:

**Card 1 — Type & Title (wide, spans 2 columns):**
- Head: blue clipboard-list icon chip + "Type & Title" section title + "Edit" outline button on right
- Body: flex row with big type icon (56×56) + H2 title (20/700 -0.015em) + subtitle ("EXAM · Vertical arithmetic assessment with MCQ answers")

**Card 2 — Settings:**
- Head: amber settings icon chip + "Settings" title + "Edit" button
- Body: 2×4 key-value grid (14px row gap, 22px col gap):
  - Level / Duration / Pass Threshold / Max Attempts / Time Limit / Randomize / Show Answers / Scheduled
  - Each KV: small uppercase label (11/700 `#475569`) + value (14/600 `#0A0F1A`, DM Mono for numeric)
  - Muted italic `#94A3B8` for empty values ("Not assigned", "Off", "Manual start")

**Card 3 — Questions (N):**
- Head: green file-text icon chip + "Questions (20)" title + "Edit" button
- Body: vertical strip of review-q-rows. Each row:
  - `#F8FAFC` bg, `#F1F5F9` border, 10px radius, 12×14 padding, flex row 12px gap
  - Number badge (DM Mono 12/700 `#475569` in white pill)
  - Expression in DM Mono 14/600 `#0A0F1A` with `|` pipes
  - Correct answer pill on right (`#DCFCE7` bg, `#14532D` text, DM Mono 12/700)
- Show first 3 questions, then "+ 17 more questions" centered link (13/600 `#475569`)

### Edit buttons

Each card head has a small "Edit" button (30×padding-x-10, 8px radius, `#E2E8F0` border, pencil icon + text 12/600 `#475569`). On click, jumps back to the relevant step:
- Type & Title card → Step 1
- Settings card → Step 2
- Questions card → Step 3

### Footer actions (this step has 3 buttons instead of 2)

- **Left:** Back (outline)
- **Right:** Save as Draft (outline) + **Publish Assessment** (primary large, `btn-lg`, check icon + text 16/700 h-50 padding 0×22)

### On "Publish Assessment" click

```ts
// 1. Final sync of all state
await updateAssessment({ ...all-fields });
// 2. Call publish
const result = await publishAssessment({ assessment_id: wizardState.paper_id });
// 3. On success, navigate to Step 5 success variant
if ('ok' in result) {
  router.push(`/admin/assessments/new?step=5&variant=published&id=${wizardState.paper_id}`);
}
```

### On "Save as Draft" click

```ts
// Just save current state — paper is already DRAFT in the DB
await updateAssessment({ ...all-fields });
router.push(`/admin/assessments/new?step=5&variant=draft&id=${wizardState.paper_id}`);
```

---

## 10. Flash Preview Modal (on-demand, triggered from Step 3b)

**Trigger:** Click "Preview Flash" button in the Flash Config card on Step 3 (TEST variant only).

### Shell

- Full viewport backdrop: `rgba(10, 15, 26, 0.85)` (darker than usual dialogs because the preview itself uses a black stage)
- Dialog card: max-width 620px, white bg, 18px radius, overflow-hidden, shadow `0 24px 64px rgba(10,15,26,0.5)`

### Header

- Padding 20×28, `#FAFBFC` bg, `#F1F5F9` bottom border, flex justify-between
- Left: purple play icon (18×18 `#6D28D9`) + "Flash Preview — Sample Sequence" (17/700 `#0A0F1A` -0.01em)
- Right: X close button (34×34, `#F1F5F9` bg, `#E2E8F0` border, 10px radius)

### Black flash stage

- Padding 60×32, `#0A0F1A` bg, white text, min-height 260, flex items-center justify-center, relative
- **Progress dots at top** (absolute 20px from top, left 32, right 32, flex 6px gap):
  - One dot per operand in the sequence, 3px tall, 9999 radius
  - Not-yet: `rgba(255,255,255,0.2)`
  - Done: `#6D28D9`
  - Active: white
- **Big number** (center): DM Mono 120px/700 white, letter-spacing -0.04em, line-height 1
  - Displays the current operand being flashed (e.g. "+201" or "-456")
  - Swaps instantly every `delay_ms` — **no CSS transition on this element** (same rule as the actual exam flash engine)
- **Counter bottom-left**: DM Mono 14/600 `rgba(255,255,255,0.6)`, "4 / 10 · 300 ms"

### Config summary (below the stage)

- Padding 20×28, 4-column grid
- Each config item: label (11/700 uppercase `#475569`) + value (DM Mono 16/700 `#0A0F1A`)
- Items: Speed / Digits / Operands / Total Duration

### Playback controls

- Padding-top 16, `#F1F5F9` top border, flex items-center justify-center, 12px gap
- 3 buttons:
  - **Restart** (44×44 round, `#F1F5F9` bg, `#1E293B` rotate-ccw icon)
  - **Play/Pause** (50×50 round, `#1A3829` bg, white icon — shows play when paused, pause when playing)
  - **Skip forward** (44×44 round, `#F1F5F9` bg, skip-forward icon)

### Behavior

- On open, the preview runs a random sample sequence (generated from the config params) from start to finish automatically
- Admin can restart, pause, or skip
- Closing the modal ends playback and returns to the Flash Config card
- **No state is saved from the preview** — it's read-only feedback on the config

---

## 11. Step 5 — Success

**Route:** `/admin/assessments/new?step=5&variant=published|draft&id=[id]`

Two variants triggered by what the admin chose on Step 4.

### Shared shell

- Top bar with stepper (all 5 completed — step 5 is "active" but all nodes have the completed check mark, step 5 keeps its active style)
- **"Exit Wizard" button in top-right is hidden** (visibility:hidden reserves the space) — the success actions are the only way out
- **No footer bar** — actions are inside the card, not at the bottom of the viewport

### Success card (max-width 720, mx-auto, padding 40×20×0 top padding)

- White bg, `#E2E8F0` border, 20px radius, shadow `0 12px 40px rgba(10,15,26,0.06)`, padding 48×40, text-center

### Big icon (96×96 round, inline-flex)

- **Published variant:** `#DCFCE7` bg, big check icon 44×44 `#14532D` stroke 2.5, plus outer glow `box-shadow: 0 0 0 12px rgba(26,56,41,0.06)`
- **Draft variant:** `#DBEAFE` bg, big file icon 44×44 `#1E3A8A` stroke 2, plus outer glow `box-shadow: 0 0 0 12px rgba(30,58,138,0.06)`

### Title & subtitle

- Title: 30/700 `#0A0F1A` letter-spacing -0.02em
  - Published: "Assessment Published"
  - Draft: "Draft Saved"
- Subtitle: 16/500 `#334155` max-width 460 mx-auto line-height 1.5
  - Published: "**{title}** is now available to students in **{level_name}**. Start a live session whenever you're ready."
  - Draft: "**{title}** has been saved as a draft. You can resume editing anytime from the Assessments list."
  - Bold parts in `#0A0F1A` 700

### Summary chips (32px margin-bottom)

- Flex gap 8 wrap justify-center
- Each chip: 6×12 padding, `#F1F5F9` bg, `#E2E8F0` border, 9999 radius, 12/700 letter-spacing 0.02em
- Chip icon: 12×12 `#475569` stroke 2
- Chips for Published variant: Type / Level / Duration / Questions / Published date
- Chips for Draft variant: Type / Level / Duration / Questions / Draft status (blue `#DBEAFE` bg + `#1E3A8A` text)

### Action buttons (flex gap 10 wrap justify-center)

**Published variant (4 buttons):**
1. "Back to Assessments" (outline)
2. "View Assessment" (outline with eye icon)
3. "Create Another" (primary forest green)
4. **"Start Session Now →"** (primary RED — `#DC2626` bg, white text, play icon) — contextual 4th button for the time-sensitive "publish and immediately go live" workflow

**Draft variant (3 buttons):**
1. "Back to Assessments" (outline)
2. "Create Another" (outline)
3. **"Continue Editing"** (primary forest green, pencil icon)

### Behavior of the 4th Published button ("Start Session Now")

Clicking it calls `forceOpenExam({ assessment_id })`, which moves the paper from PUBLISHED → LIVE and navigates to `/admin/monitor/[id]` (the Live Monitor detail page from the Results flow).

This is the "I'm publishing because the students are sitting in front of me right now" flow.

---

## 12. Database Changes

> **Phase 2 audit correction (2026-04-14):** The original draft of this section had three errors that the Phase 1 audit caught against the live DB:
> 1. **`description` already exists** in `exam_papers` (text, nullable) — the column add was a false claim and is now removed.
> 2. **`pass_threshold_percent` collides with the existing `pass_percentage`** column (numeric, nullable). Use the existing column instead of adding a new one — Phase 2 decision is to add the CHECK constraint to `pass_percentage` rather than rename or duplicate.
> 3. **`show_correct_answers` overlaps semantically with `answer_key_released`** from the 2026-04-14 student-results-flow spec. Drop the new column; the answer-key visibility gate is owned by the results-flow spec's §3.1 two-gate model.
>
> Net effect: this section now adds **5 new columns** (down from 8 in the original), and **1 new CHECK constraint** on an existing column.

### New columns on `exam_papers`

```sql
-- 1. Scheduled (planned) open/close times — see §12.1 for the "scheduled vs actual" model
ALTER TABLE exam_papers ADD COLUMN scheduled_start_at timestamptz;
ALTER TABLE exam_papers ADD COLUMN scheduled_end_at timestamptz;

-- 2. Attempts cap
ALTER TABLE exam_papers ADD COLUMN max_attempts integer NOT NULL DEFAULT 1
  CHECK (max_attempts >= 1);

-- 3. Hard vs grace timer mode
ALTER TABLE exam_papers ADD COLUMN time_limit_mode text NOT NULL DEFAULT 'hard'
  CHECK (time_limit_mode IN ('hard', 'grace'));

-- 4. Randomize question order at session-start time
ALTER TABLE exam_papers ADD COLUMN randomize_questions boolean NOT NULL DEFAULT false;
```

### Constraint on existing `pass_percentage` column

```sql
-- pass_percentage is numeric, nullable — already in live DB.
-- Add the 0..100 range check that the original draft proposed via pass_threshold_percent.
ALTER TABLE exam_papers
  ADD CONSTRAINT pass_percentage_range
  CHECK (pass_percentage IS NULL OR (pass_percentage >= 0 AND pass_percentage <= 100));
```

The wizard's "Pass percentage" input writes to `exam_papers.pass_percentage` as a `numeric` value. The application-level default is `60` (set client-side by the wizard before insert), but the DB default stays NULL so legacy rows are not touched.

### 12.1 Scheduled vs actual times — semantic model

The `exam_papers` table now has **four** time columns related to opening and closing. They serve two distinct purposes:

| Column | Type | When set | Set by | Meaning |
|---|---|---|---|---|
| `scheduled_start_at` | timestamptz | Create time | Admin in wizard Step 2 | Planned future open time. NULL means "manual open via Force Open button." |
| `scheduled_end_at` | timestamptz | Create time | Admin in wizard Step 2 | Planned future close time. NULL means "stays open until manually closed or duration expires from opened_at." |
| `opened_at` | timestamptz | Runtime | `forceOpenExam` action OR the cron in §13.5 | Actual time the paper transitioned to LIVE. |
| `closed_at` | timestamptz | Runtime | `forceCloseExam` action OR the cron in §13.5 | Actual time the paper transitioned to CLOSED. |

The cron job watches `scheduled_start_at` and `scheduled_end_at` and writes `opened_at` and `closed_at` (plus the status flip) at the right time. **They are two distinct concepts**, not duplicates — keep both.

### 12.2 Questions schema — read §9.3 of the assessment-taking spec

The original draft of this spec said:

> The existing wizard uses `question_text`, `options`, `correct_answer`, `marks`, `order_index`. Verify these columns exist. If `options` is stored as JSON, it should be `jsonb` with shape `{ A: string, B: string, C: string, D: string }`.

**This is wrong.** Phase 4 audit confirmed: the live engine code (`initSession` in `src/app/actions/assessment-sessions.ts`) reads from the **columnar form** (`option_a`, `option_b`, `option_c`, `option_d`, `correct_option`), NOT from the JSON form. The JSON columns (`options`, `correct_answer`) exist in the schema but are unused on the read path.

**Canonical for the wizard is the COLUMNAR form.** The Step 3 question editor must write to `option_a/b/c/d`, `correct_option`, `equation_display`, `flash_sequence`. The JSON columns can stay in the schema for now (separate cleanup spec) but the wizard must NOT write to them or the live engine will return stale data.

See `docs/superpowers/specs/2026-04-14-student-assessment-taking-flow-design.md` §9.3 for the full justification.

### New `assessment_defaults` table (one row per admin user)

```sql
CREATE TABLE assessment_defaults (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  duration_minutes integer DEFAULT 30,
  pass_percentage numeric DEFAULT 60 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
  max_attempts integer DEFAULT 1 CHECK (max_attempts >= 1),
  time_limit_mode text DEFAULT 'hard' CHECK (time_limit_mode IN ('hard', 'grace')),
  randomize_questions boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- RLS: admin can only read/write their own row
ALTER TABLE assessment_defaults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_defaults" ON assessment_defaults
  FOR ALL USING (user_id = auth.uid());
```

(Phase 2 correction: column was renamed from `pass_threshold_percent` to `pass_percentage` and `show_correct_answers` was removed.)

---

## 13. Server Actions

### Extended existing actions

- **`createAssessment`** — already exists. Used after Step 1 to create the initial DRAFT with placeholder values. No changes needed.

- **`updateAssessment`** — existing action. **Extend** to accept the new Settings fields: `scheduled_start_at`, `scheduled_end_at`, `pass_percentage`, `max_attempts`, `time_limit_mode`, `randomize_questions`. **NOT** `description` (already supported — column has existed since v0). **NOT** `show_correct_answers` (column dropped — see §12 Phase 2 correction). **NOT** `pass_threshold_percent` (use `pass_percentage`). Keep the existing `ASSESSMENT_LOCKED` guard that prevents updates when status is LIVE/CLOSED.

- **`publishAssessment`** — already exists. Called from Step 4 when admin clicks "Publish Assessment". Transitions status DRAFT → PUBLISHED. No changes needed.

- **`forceOpenExam`** — already exists. Called from the "Start Session Now" button on Step 5 published variant. Transitions status PUBLISHED → LIVE and writes `opened_at = now()`. No changes needed.

- **`forceCloseExam`** — already exists. Used by both the live-monitor flow and (per §13.5) the cron job. Transitions LIVE → CLOSED and writes `closed_at = now()`. No changes needed.

### New server actions (5 total)

```ts
// Used by Step 2 "Save as default" toggle
export async function upsertAssessmentDefaults(input: {
  duration_minutes: number;
  pass_percentage: number;
  max_attempts: number;
  time_limit_mode: 'hard' | 'grace';
  randomize_questions: boolean;
}): Promise<ActionResult<null>>

// Used by Step 2 on-load to pre-fill defaults (optional — can also be a Server Component query)
export async function getAssessmentDefaults(): Promise<ActionResult<AssessmentDefaults | null>>

// Used by Step 3 when admin adds a question.
// Q1: createQuestion ALREADY EXISTS in src/app/actions/questions.ts — verify in plan
// phase whether its current signature accepts an empty placeholder, or whether the
// wizard needs to call it with default question_text.
export async function createQuestion(input: {
  paper_id: string;
  order_index: number;
}): Promise<ActionResult<{ question_id: string }>>

// Used by Step 3 when admin edits a question.
// 🔴 GAP CONFIRMED IN PHASE 1: this action does NOT exist in the live code
// (questions.ts has createQuestion / deleteQuestion / reorderQuestions only).
// The wizard's Step 3 question editor is BLOCKED until this is added.
// Note the columnar field names — per §12.2, the wizard writes the columnar form
// (option_a/b/c/d, correct_option), NOT the JSON form.
export async function updateQuestion(input: {
  question_id: string;
  question_text?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: 'A' | 'B' | 'C' | 'D';
  equation_display?: string | null;
  flash_sequence?: number[] | null;
  marks?: number;
}): Promise<ActionResult<null>>

// Already exists — no change needed.
// export async function deleteQuestion(input: { question_id: string }): Promise<ActionResult<null>>
// export async function reorderQuestions(input: { paper_id: string; order: Array<{ question_id: string; order_index: number }> }): Promise<ActionResult<null>>
```

All new actions require `requireRole('admin')`, scope to the paper's institution, and log to `activity_logs`.

### 13.5 Scheduled-transition cron job

> **Phase 2 audit addition (2026-04-14):** The original spec proposed `scheduled_start_at` and `scheduled_end_at` columns but **never specified the mechanism** that would actually flip status when the times are reached. Without this section, the columns are dead weight. Phase 2 picks **Vercel Cron** as the implementation (we're already on Vercel and Vercel Cron is the cheapest path with no extra infrastructure).

**Mechanism:** A Vercel Cron job runs every 5 minutes and calls a protected Route Handler that flips status for any papers whose scheduled times have arrived.

#### `vercel.json` (or `vercel.ts`) cron declaration

```json
{
  "crons": [
    {
      "path": "/api/cron/assessment-scheduler",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Note:** Vercel Cron only runs on Production deployments (NOT preview deployments). This is acceptable — preview environments don't need automated transitions.

#### `src/app/api/cron/assessment-scheduler/route.ts`

A new Route Handler protected by the `CRON_SECRET` env var (Vercel auto-injects an `Authorization: Bearer ${CRON_SECRET}` header on cron invocations). The handler:

1. Reads `CRON_SECRET` from env, fail-closed if missing.
2. Verifies the request's `Authorization` header equals `Bearer ${CRON_SECRET}`. Returns 401 otherwise.
3. **Open transition:** `UPDATE exam_papers SET status = 'LIVE', opened_at = now() WHERE status = 'PUBLISHED' AND scheduled_start_at IS NOT NULL AND scheduled_start_at <= now() AND opened_at IS NULL`. Captures the affected `id`s.
4. **Close transition:** `UPDATE exam_papers SET status = 'CLOSED', closed_at = now() WHERE status = 'LIVE' AND scheduled_end_at IS NOT NULL AND scheduled_end_at <= now() AND closed_at IS NULL`. Captures the affected `id`s.
5. For each opened paper: write a `BULK_AUTO_OPEN` activity log row.
6. For each closed paper: write a `BULK_AUTO_CLOSE` activity log row.
7. Returns `{ opened: number, closed: number }` for observability.

The handler uses the admin Supabase client (`src/lib/supabase/admin.ts`) — it's a server-only path with no user context, so `requireRole` does not apply. The `CRON_SECRET` check is the auth boundary.

#### Env vars

Add to Vercel project env vars (Production scope):

```
CRON_SECRET=<random 32+ char string>
```

#### Failure mode

If the cron handler fails:
- Vercel logs the failure but does NOT retry within the 5-minute window.
- The next scheduled run (5 minutes later) will pick up the same papers (the WHERE clauses are idempotent — `opened_at IS NULL` and `closed_at IS NULL` ensure no double-transition).
- For deeper observability, consider adding a small admin "Scheduler Health" widget that shows the last successful run time. **Out of scope** for this spec.

---

## 14. Draft Auto-Save Behavior

### When saves happen

1. **After Step 1 "Next" click** — creates the initial DB row via `createAssessment`. Paper ID is stored in wizard state.
2. **After Step 2 "Next" click** — commits all Settings fields via `updateAssessment`. If "Save as default" toggle is ON, also calls `upsertAssessmentDefaults`.
3. **On every Step 3 interaction** — adding, editing, deleting, or reordering a question immediately writes to the DB via the new question actions. Edit fields use 500ms debounce to avoid write storms.
4. **On any "Save Draft" button click** — writes current state immediately, shows "Draft saved" toast, keeps admin in wizard at current step.
5. **On any step transition (Next or back-jump via stepper click)** — triggers a full `updateAssessment` sync as a safety net.
6. **On "Exit Wizard"** — confirmation dialog: "Unsaved changes will be kept as a draft. Continue?". If confirmed, exits to `/admin/assessments` with the draft persisted.

### Resume behavior

When admin clicks "Edit Draft" on the Assessments list (from the Assessments List spec):
- Navigate to `/admin/assessments/[id]/edit`
- Wizard route loads the existing paper + questions from the DB
- Populates all wizard state from the loaded data
- Resumes at **Step 3** by default (assuming Type and Settings are already set)
- Admin can jump back to Step 1 or 2 via the stepper to change type/settings

### Draft cleanup

- Abandoned drafts (admin created a paper and never came back) remain in the DB with status DRAFT
- They appear in the Assessments list under the "Draft" status pill
- Admin can clean them up via per-row delete on that list (from Assessments List spec)
- No automatic expiration — drafts persist indefinitely until explicitly deleted

---

## 15. Files to Change

### New files

```
src/app/(admin)/assessments/new/page.tsx                  (new wizard entry — or see note below)
src/app/(admin)/assessments/[id]/edit/page.tsx            (new — draft resume entry)
src/app/(wizard)/layout.tsx                                (new route group layout without sidebar)

# Wizard orchestration
src/components/assessments/wizard/wizard-shell.tsx          (new — top bar + stepper + footer + main)
src/components/assessments/wizard/wizard-stepper.tsx        (new — horizontal 5-step indicator)
src/components/assessments/wizard/wizard-state.tsx          (new — Zustand or React Context state)
src/components/assessments/wizard/wizard-exit-dialog.tsx    (new — confirm-before-exit dialog)

# Step components
src/components/assessments/wizard/step-1-type.tsx           (new — two big cards)
src/components/assessments/wizard/step-2-settings.tsx       (new — 4 sections + save-as-default)
src/components/assessments/wizard/step-3-questions.tsx      (new — split pane orchestrator)
src/components/assessments/wizard/step-3-question-list.tsx  (new — left pane)
src/components/assessments/wizard/step-3-question-editor.tsx(new — right pane)
src/components/assessments/wizard/step-3-flash-config.tsx   (new — TEST variant config card)
src/components/assessments/wizard/step-3-flash-preview.tsx  (new — preview modal)
src/components/assessments/wizard/step-4-review.tsx         (new — bento grid)
src/components/assessments/wizard/step-5-success.tsx        (new — both variants)
```

### Modified files

```
src/app/actions/assessments.ts         — extend updateAssessment with new fields
src/app/(admin)/layout.tsx              — conditional sidebar hide for wizard routes
src/components/assessments/wizard-types.ts — expand WizardState to include new fields
```

### Deleted files

```
src/components/assessments/create-assessment-wizard.tsx    (old modal)
src/components/assessments/step-type.tsx                    (replaced)
src/components/assessments/step-questions.tsx               (replaced)
src/components/assessments/step-config.tsx                  (replaced)
```

### Note on route structure

Two options for hiding the sidebar:
1. **Route group `(wizard)`** — put wizard routes in a new route group with its own layout. Cleaner.
2. **Conditional in `(admin)/layout.tsx`** — check `pathname` and skip the sidebar wrapper when it matches `/admin/assessments/new` or `/admin/assessments/[id]/edit`. Less structural change but brittle.

Recommendation: **route group `(wizard)`** for cleaner structure.

---

## 16. Out of Scope

- **Question templates / library** — no "Duplicate from another assessment" or "Import questions from CSV" in this spec. Future enhancement.
- **Question media** — no image upload or LaTeX rendering for questions. Only pipe-separated arithmetic sequences.
- **Collaborative editing** — only one admin edits a draft at a time; no real-time sync if two admins open the same draft.
- **Version history** — saving a draft overwrites the previous state; no undo stack beyond the admin's own wizard session.
- **A/B testing of questions** — no multi-variant question support.
- **Rubric-based scoring** — only simple correct/incorrect grading. No partial credit.
- **Question banks / tagging** — no metadata beyond order_index and marks.
- **Custom distractors / wrong-answer hints** — no per-question "explain why this is wrong" content.
- **Publishing multiple at once** — bulk publish from the Assessments List is out of scope (was already ruled out in the Assessments List spec).

---

## 17. Decisions Locked in Brainstorm

- **Q1 (modality):** Option C — Full page route `/admin/assessments/new` with sidebar hidden. Focused-task pattern.
- **Q2 (step order):** Option A — Settings early, Step 2. Final order: Type → Settings → Questions → Review → Success.
- **Q3 (stepper):** Option A — Horizontal stepper bar at top with numbered circles + labels + connectors.
- **Q4 (navigation):** Option B — Linear with free back-jumping. Admin can click completed steps; cannot jump forward.
- **Q5 (type selection UI):** Option A — Two big cards side by side. Click to select (visual state), click Next to advance.
- **Q6 (settings fields):** Option D — Full configurator with all 12 fields + "Save as default" toggle. 4 sections: Core Info / Scheduling / Grading & Attempts / Student Experience. 8 new DB columns + 1 new table.
- **Q7 (MCQ builder layout):** Option A — Split pane (40% left list / 60% right editor).
- **Q8 (question input format):** Option A — Pipe-separated sequence input `245 | -242 | +466`. Shared by EXAM and TEST.
- **Q9 (TEST question generation):** Option B — Manual entry, same builder as EXAM. Admin types every sequence. Flash engine behavior unchanged.
- **Q10 (flash preview):** Option C — On-demand preview modal triggered by "Preview Flash" button in Flash Config card.
- **Q11 (draft auto-save):** Option C — Hybrid: auto-save on every step transition + explicit "Save Draft" button that keeps admin in the wizard. DB record created after Step 1.
- **Q12 (success actions):** Option C — Rich 4-button row on Published variant (Back / View / Create Another / **Start Session Now** in red). Draft variant has 3 buttons (Back / Create Another / Continue Editing).

---

## Appendix A — Visual Reference

Browser mockup saved at:
- `.superpowers/brainstorm/223-1776020821/content/assessment-wizard.html` — All 8 screens (Step 1, Step 2, Step 3a EXAM, Step 3b TEST with Flash Config, Flash Preview Modal, Step 4 Review, Step 5 Success Published, Step 5 Success Draft)

### Earlier specs referenced

- `2026-04-13-admin-assessments-list-design.md` — where "Edit Draft" and "+ Create Assessment" buttons launch this wizard from
- `2026-04-12-admin-results-redesign-design.md` — source of the pipe-separated sequence format (`245 | -242 | +466`)
- `2026-04-13-admin-levels-flow-design.md` — "Create Assessment for Level" CTA pre-fills the Level field with `lockedLevelId`
- `2026-04-13-admin-students-flow-design.md` — inline editing pattern referenced for the "Save Draft keeps you in wizard" behavior

---

## Backend Dependencies

### Tables touched
**Existing columns read/written:**
- `exam_papers` — `id, title, description, type, status, level_id, duration_minutes, pass_percentage, institution_id, created_at, created_by, opened_at, closed_at, answer_key_released`
- `questions` — `id, paper_id, question_type, question_order, option_a, option_b, option_c, option_d, correct_option, content`
- `levels` — read-only lookup for level dropdown in Step 2 (`id, name, institution_id, sort_order`)
- `students` — read-only count preview ("X students will be targeted") scoped by selected `level_id`
- `activity_logs` — insert on create/save-draft/publish/delete-question/reorder

**New columns on `exam_papers` (Phase 2 migration — 5 adds):**
- `scheduled_start_at timestamptz` (nullable — NULL means manual open via Force Open button)
- `scheduled_end_at timestamptz` (nullable — NULL means stays open until manually closed)
- `max_attempts integer NOT NULL DEFAULT 1` (CHECK ≥ 1)
- `time_limit_mode text NOT NULL DEFAULT 'hard'` (CHECK IN `'hard','soft'`)
- `randomize_questions boolean NOT NULL DEFAULT false`
- `description` was previously proposed as an add but **already exists** in live DB — do NOT re-add.
- `pass_percentage` already exists — wizard writes to it, DB default stays NULL (app-level default of 60 set client-side).

**Time-column disambiguation (preserved, not merged):**
- `scheduled_start_at` / `scheduled_end_at` — admin-set plan times (wizard)
- `opened_at` / `closed_at` — runtime timestamps written by `forceOpenExam` or the cron

### Server actions called
**Existing (verified to be present):**
- `createAssessment` in `src/app/actions/assessments.ts` — called after Step 1 "Next" to create the DRAFT row with placeholder values. No changes.
- `publishAssessment` — called from Step 4 "Publish Assessment". DRAFT → PUBLISHED. No changes.
- `forceOpenExam` — called from Step 5 Published variant "Start Session Now" button. PUBLISHED → LIVE, writes `opened_at = now()`. No changes. **Producer of the LIVE state consumed by admin-live-monitor-flow.**
- `createQuestion` in `src/app/actions/questions.ts` — already exists (Q1 verification in §13).
- `deleteQuestion` — already exists.
- `reorderQuestions` — already exists.

**New (5 actions):**
- `updateAssessmentDraft({ assessment_id, title, description, level_id, duration_minutes, scheduled_start_at, scheduled_end_at, pass_percentage, max_attempts, time_limit_mode, randomize_questions }): Promise<ActionResult<null>>` — Step 2 save.
- `getAssessmentDefaults(): Promise<ActionResult<AssessmentDefaults | null>>` — loads institution default level + duration for Step 1 pre-fill.
- `updateQuestion({ question_id, ... }): Promise<ActionResult<null>>` — Step 3 edits to existing questions.
- `getAssessmentForEdit({ assessment_id }): Promise<ActionResult<Assessment>>` — resume-draft loader at `/admin/assessments/[id]/edit`.
- `getTargetStudentCount({ level_id }): Promise<ActionResult<{ count: number }>>` — Step 2 preview counter.

All new actions: `requireRole('admin')` + institution scope + `activity_logs` insert.

### RPCs / functions referenced
**Existing:** none directly (server actions do direct table ops).

**New cron-backed job (Phase 2 decision — Vercel Cron):**
- `GET /api/cron/assessment-schedule` — runs every minute, HMAC-verified via `x-vercel-cron` or shared secret header. Two idempotent UPDATEs:
  1. `UPDATE exam_papers SET status='LIVE', opened_at=now() WHERE status='PUBLISHED' AND scheduled_start_at IS NOT NULL AND scheduled_start_at <= now() AND opened_at IS NULL`
  2. `UPDATE exam_papers SET status='CLOSED', closed_at=now() WHERE status='LIVE' AND scheduled_end_at IS NOT NULL AND scheduled_end_at <= now() AND closed_at IS NULL`
- Both transitions log to `activity_logs` with `action_type = 'SCHEDULED_OPEN'` / `'SCHEDULED_CLOSE'`.

### Routes / HTTP endpoints
- `/admin/assessments/new?step={1..5}` — wizard entry
- `/admin/assessments/[id]/edit` — draft resume
- `/api/cron/assessment-schedule` — new Vercel Cron route (above)

### Cross-spec dependencies
- **admin-assessments-list-design** — entry points "+ Create Assessment" and "Edit Draft". Also consumes the new `scheduled_start_at`/`scheduled_end_at` columns for the "Scheduled" badge on cards.
- **admin-levels-flow-design** — "Create Assessment for Level" CTA passes `lockedLevelId` query param; wizard must pre-fill Level field and disable it.
- **admin-students-flow-design** — `level_id` + target student count preview reads the same `students` table (must respect `deleted_at IS NULL` + `institution_id` scope).
- **admin-live-monitor-flow-design** — consumer of the LIVE state this wizard produces via `forceOpenExam` or cron open-transition. Force Open → navigate to `/admin/monitor/[id]`.
- **admin-results-redesign-design** — consumer of the CLOSED state this wizard's cron produces. `calculate_results` triggers on CLOSED. `answer_key_released` gate is owned by student-results-flow spec, NOT the wizard (per Phase 2 correction — `show_correct_answers` removed).
- **2026-04-14-student-results-flow-design** — source of the two-gate release model. Wizard must NOT emit `show_correct_answers` — that responsibility moved entirely to the student-results-flow spec.
- **admin-dashboard-design** — "Upcoming scheduled assessments" widget reads `scheduled_start_at` for ordering.
- **admin-settings-design** — Pass percentage default (60) and duration default come from institution settings (future); for v1, hardcoded in the wizard.
- **admin-activity-log-design** (dropped v1) — `CREATE_ASSESSMENT`, `PUBLISH_ASSESSMENT`, `FORCE_OPEN_EXAM`, `SCHEDULED_OPEN`, `SCHEDULED_CLOSE`, `CREATE_QUESTION`, `UPDATE_QUESTION`, `DELETE_QUESTION`, `REORDER_QUESTIONS` audit rows still written; browse UI deferred.

---

## Query Budget

### Step 1 (type picker)
**Target: 0 queries on mount.** Pure client state. On Next click: 1 INSERT via `createAssessment` + 1 activity_logs INSERT.

### Step 2 (details)
**Target: ≤ 2 queries on mount.**

1. `getAssessmentDefaults()` — institution default level + duration (optionally batched with Step 1 load).
2. `SELECT levels WHERE institution_id = $1` for the level dropdown.
3. `getTargetStudentCount({ level_id })` — **debounced**, fires only on level change, not on every keystroke in other fields.

### Step 3 (questions)
**Target: ≤ 1 query per draft load, amortised writes thereafter.**

1. `SELECT questions WHERE paper_id = $1 ORDER BY question_order` — single round-trip. Questions are paginated client-side only, not server-side (expected ≤ 100 questions per paper).
2. Per-keystroke edits use local state + debounced `updateQuestion` (500ms). **Never** issue a DB write on every character.
3. Reorder uses `reorderQuestions` batched write — single RPC/UPDATE for the full new order, not N individual UPDATEs.

**N+1 risks to avoid:**
- ❌ Fetching each question's options individually — columnar schema means they all come in one row.
- ❌ `createQuestion` in a loop for CSV/bulk paste — must use a `bulkInsertQuestions` RPC if that feature is added (not in v1).

### Step 4 (review)
**Target: 0 queries on mount.** Reuses in-memory state from Steps 1–3. Review cards read from the wizard state, not the DB.

### Step 5 (success)
**Target: 0 queries.** Pure confirmation page.

### Draft resume (`/admin/assessments/[id]/edit`)
**Target: ≤ 2 queries per page load.**

1. `getAssessmentForEdit({ assessment_id })` — returns paper + all questions in a single RPC or embedded select.
2. `SELECT levels` for the level dropdown — may be cached from layout.

### Cron (`/api/cron/assessment-schedule`)
**Target: exactly 2 UPDATEs per run, regardless of affected row count.**

- Open transition: 1 batched UPDATE (all eligible PUBLISHED rows at once).
- Close transition: 1 batched UPDATE (all eligible LIVE rows at once).
- Activity log inserts: fire-and-forget, batched as a single INSERT ... SELECT from the RETURNING ids of each UPDATE.

**N+1 risks to avoid:**
- ❌ Looping affected paper IDs to log activity one at a time. Use INSERT ... SELECT.
- ❌ Polling `get_live_monitor_data` from the cron — cron has no reason to touch runtime state beyond the two status transitions.
