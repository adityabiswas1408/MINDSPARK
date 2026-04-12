# Admin Levels Flow Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Redesign the Levels management area — main list with sortable cards + a new Level Detail page with tabbed Students/Assessments content + Create Level dialog.

---

## 1. Goal

Transform Levels from a single flat list into a proper drill-down flow. The main list stays focused on organization (drag-to-reorder, quick add), while a new detail page gives the admin full context on a single level: who's enrolled and which assessments target it. The admin can create a student or an assessment scoped to the current level without leaving the detail view.

This redesign intentionally **does not add** Rename or Delete operations. Create + Reorder cover the common cases; deleting a level is risky (orphans enrolled students), and renaming is rarely needed.

---

## 2. Route Map

```
/admin/levels                           → List page (sortable cards)
/admin/levels/[id]                      → Level Detail (tabbed Students + Assessments)
/admin/levels/[id]?tab=assessments      → Same detail page, Assessments tab active
```

The tab state lives in a URL query param so the admin can share links or bookmark directly to a specific tab.

---

## 3. Design System Notes

Uses the established MINDSPARK tokens from the Dashboard, Results, and Students specs in this session:
- DM Sans for UI, DM Mono for numbers
- Forest Green `#1A3829` primary, `#EFFAF4` light accent, `#B7E4C7` pill border
- Charcoal text scale: `#0A0F1A` / `#1E293B` / `#334155` / `#475569`
- Card radius 14px (16px for hero cards)
- Base font size 16px
- Lucide-react line icons, stroke 1.75
- Global admin sidebar with Sign Out footer

---

## 4. Screen 1 — Levels List Page

**Route:** `/admin/levels`

### Layout

1. **Admin chrome.** Breadcrumb: `Admin › Levels`.

2. **Page header row:**
   - Left: H1 "Levels" (30/700 `#0A0F1A`) + subtitle "Organize curriculum tiers. Drag cards to reorder." (14/500 `#334155`)
   - Right: single action — "+ Add Level" primary button (forest green, 42px, plus icon)

3. **Summary strip** — single white card, Slate 200 border, 14px radius, padding 16×20, flex row with three stat groups separated by 1px vertical dividers:
   - **Total Levels** — green layers icon (`#EFFAF4` bg, `#1A3829` icon) + label + DM Mono 22/700 value
   - **Total Students** — blue people icon (`#EFF6FF` bg, `#1E3A8A` icon) + label + value
   - **Total Assessments** — amber clipboard icon (`#FEF3C7` bg, `#92400E` icon) + label + value

   Each stat icon chip is 40×40 rounded 10px. Each label is DM Sans 12/700 uppercase tracking-wide `#475569`. Values are DM Mono 22/700 tabular `#0A0F1A`.

4. **Drag hint pill** — small blue pill below the summary strip:
   - `#EFF6FF` bg, `#DBEAFE` border, radius 9999
   - Info icon + "Drag cards by the handle to reorder levels" in 13/600 `#1E3A8A`
   - Purely informational — admin can dismiss it or it can auto-hide after first successful drag (implementation decision)

5. **Levels stack** — vertical flex column of level cards, 14px gap. One card per level, in `sequence_order` order.

### Level card anatomy

Each card is a white card (Slate 200 border, 16px radius, shadow-sm), padding 20×24, flex row with 20px gap:

```
┌────────────────────────────────────────────────────────────────┐
│ ⋮⋮  [03]  Level 3 — Intermediate                [View →] [⋮]  │
│           👥 72 students · 📋 10 assessments                  │
└────────────────────────────────────────────────────────────────┘
```

- **Drag handle** (24×24) — `grip-vertical` lucide icon, `#CBD5E1` default, `#475569` on card hover. Cursor grab → grabbing when dragging.
- **Sequence badge** (48×48, 12px radius) — `#EFFAF4` bg, `#B7E4C7` border, `#1A3829` text, DM Mono 18/700 zero-padded ("01", "02", …)
- **Body (flex 1):**
  - Level name: DM Sans 18/700 `#0A0F1A`, 6px margin-bottom
  - Stats row: flex 12px gap, DM Sans 14/500 `#334155`
    - `users` icon + **72** (DM Mono 700 `#0A0F1A`) + " students"
    - `·` separator in `#CBD5E1`
    - `clipboard-list` icon + **10** + " assessments"
- **Right cluster (flex-shrink 0, 10px gap):**
  - **"View →" button** — outline style, h-38, 10px radius, DM Sans 14/600. Hover: `#EFFAF4` bg + `#1A3829` border + `#1A3829` text. Navigates to `/admin/levels/[id]`.
  - **Overflow button** — 38×38 outline, 3-dot icon. Opens a dropdown with one item: "Move to position…" (future functionality). Placeholder for now.

### Card states

- **Default:** white bg, slate border
- **Hover:** border `#1A3829`, shadow deepens to `0 8px 20px rgba(15, 23, 42, 0.06)`, `transform: translateY(-1px)`. Entire card is clickable (same as View button).
- **Dragging:** opacity 0.7, shadow `0 20px 48px rgba(10, 15, 26, 0.15)`, cursor grabbing. Other cards shift to show the drop zone.
- **Drop target indicator:** while dragging, cards below the drop point show a 2px forest-green top border line as a visual cue.

### Reorder behavior

- Uses `@hello-pangea/dnd` (already in the project per CLAUDE.md)
- On drop, call `updateLevelOrder` server action with the new array of `{ id, sequence_order }` pairs
- Optimistic UI: the card visually snaps to its new position immediately; if the server call fails, revert and show an error toast

### Empty state

If the institution has no levels yet:

- Single centered empty card (max-width 520, padding 64×24, text-center)
- 64×64 icon chip (`#F1F5F9` bg, layers icon 28×28 `#475569`)
- Title "No levels created yet" (20/700 `#0A0F1A`)
- Subtitle "Levels let you group students by curriculum tier and assign assessments to specific groups." (15/500 `#475569`, max-width 440)
- Primary "+ Add Level" button below

### Data flow

Same as current implementation:

```ts
// Fetch levels + student counts in parallel
const [levelsRes, studentsRes] = await Promise.all([
  supabase
    .from('levels')
    .select('id, name, sequence_order, deleted_at')
    .eq('institution_id', institutionId)
    .is('deleted_at', null)
    .order('sequence_order', { ascending: true }),
  supabase
    .from('students')
    .select('level_id')
    .eq('institution_id', institutionId)
    .is('deleted_at', null),
]);

// Plus assessment counts per level (NEW):
const { data: papers } = await supabase
  .from('exam_papers')
  .select('level_id')
  .eq('institution_id', institutionId)
  .not('status', 'eq', 'DRAFT')  // Or however we scope "countable" assessments
  .is('archived_at', null);

// Build counts maps client-side.
```

---

## 5. Screen 2 — Create Level Dialog

**Trigger:** Click "+ Add Level" on list page header or empty state.

### Dialog shell

- Full viewport backdrop: `rgba(10, 15, 26, 0.45)`
- Max-width 460px, white bg, 18px radius, shadow `0 24px 64px rgba(10,15,26,0.3)`, centered
- Smaller than student dialogs because the form is minimal

### Header (padding 24×28×20, bottom border `#F1F5F9`)

- 44×44 green icon chip (`#EFFAF4` bg, `#1A3829` layers icon)
- Title "Add New Level" (20/700 `#0A0F1A`)
- Subtitle "Create a curriculum level. It will be added at the end and can be reordered by drag." (14/500 `#475569`)
- Top-right X close button

### Body (padding 24×28)

Single field:

- **Level Name** (required)
  - Label: "Level Name *" (13/700 `#334155`, red asterisk)
  - Input: h-44, 10px radius, 14px padding, placeholder "e.g. Level 6 — Master"
- **Help text** below the input (12/500 `#475569`):
  - Info icon + "Use a descriptive name that makes sense to students. Once created, the level appears as the next item in the list (position 06)."
  - The position number updates dynamically based on `nextSequenceOrder` prop.

### Footer (padding 18×28, `#FAFBFC` bg, top border `#F1F5F9`)

- Flex row, justify-end, 10px gap
- Cancel (outline, h-42)
- "Create Level" (primary forest green, h-42, check icon + text)

### Validation

- **Level Name:** required, 1–80 chars, trimmed whitespace
- Create button stays disabled until the field has valid content

### On success

- Call existing `createLevel` server action with `{ name }`
- Close dialog
- Show success toast: "Level '{name}' created"
- Refresh the list page — new level appears at the bottom

### On error

- Inline error pill inside the dialog body: `#FEE2E2` bg, `#991B1B` text, 13/500
- Common errors:
  - "A level with this name already exists in your institution."
  - "Failed to create level. Please try again."

---

## 6. Screen 3 — Level Detail Page

**Route:** `/admin/levels/[id]` (default tab is `students`)
**Route variant:** `/admin/levels/[id]?tab=assessments`

### Layout

1. **Admin chrome.** Breadcrumb: `Admin › Levels › Level 3 — Intermediate` (the final segment is the level name).

2. **Back link:** "← Back to Levels" in DM Sans 15/500 `#334155`, 16px margin-bottom.

3. **Hero card** — white card, 4px forest-green left accent bar via `::before`, Slate 200 border, 16px radius, padding 28×32, shadow-sm, flex row with 24px gap:
   - **Large sequence badge (80×80):** `#EFFAF4` bg, `#B7E4C7` border, 16px radius, DM Mono 30/700 `#1A3829` sequence number ("03")
   - **Body (flex 1):**
     - Label "LEVEL DETAILS" — 13/700 `#475569` uppercase letter-spacing 0.08em
     - Name H1 — 28/700 `#0A0F1A` letter-spacing -0.018em, 14px margin-bottom
     - **Hero stats row** — flex 28px gap:
       - **Students** stat: 40×40 blue icon chip + "STUDENTS" label (11/700 uppercase `#475569`) + "72" value (DM Mono 22/700 `#0A0F1A`)
       - 1px `#E2E8F0` vertical divider
       - **Assessments** stat: same structure with amber icon chip + "ASSESSMENTS" label + "10" value

4. **Tab strip** — below the hero card, padded 4px, `#F1F5F9` bg, `#E2E8F0` border, 12px radius, `width: fit-content`:

   - Two tab pills, 4px gap:
     - **Students** tab — `users` icon + "Students" label + count pill ("72")
     - **Assessments** tab — `clipboard-list` icon + "Assessments" label + count pill ("10")
   - Each tab: 10×24 padding, 14/600, 8px radius
   - Inactive: `#64748B` text, transparent bg
   - Active: white bg, `#0A0F1A` text, shadow `0 1px 3px rgba(10,15,26,0.08)`
   - Count pill inside a tab:
     - Inactive: `#E2E8F0` bg, `#334155` text
     - Active: `#EFFAF4` bg, `#1A3829` text

   Clicking a tab updates the URL query param (`?tab=students` or `?tab=assessments`). No navigation — content swaps in-place.

5. **Tab content** — varies by active tab. See §7 (Students tab) and §8 (Assessments tab).

---

## 7. Screen 3a — Students Tab Content

### Tab content header (above the table)

- Flex row, items-center, justify-between, 16px gap
- **Left:** search input (max-width 400, h-42, 12px radius, search icon left-padded). Placeholder: "Search students in this level…"
- **Right:** "+ Add Student to Level" primary button (forest green, h-42, plus icon + text)

### Students table

- White card, Slate 200 border, 14px radius, overflow-hidden, shadow-sm
- **3 columns only** (dropped the Level column since all students in this view belong to the current level):
  - **Roll No.** (160px) — DM Mono 14/700 `#475569`
  - **Name** (flex) — 36×36 forest-green avatar + full name (15/600 `#0A0F1A`)
  - **Actions** (180px, right-aligned) — "View" outline button (eye icon + text, h-34) + delete icon button (34×34, hover: red tint)

- Header row: `#F8FAFC` bg, 13/700 uppercase `#334155` labels
- Body: divided by 1px `#F1F5F9`, hover `#FAFBFC` bg
- Click "View" → navigates to `/admin/students/[id]` (the student detail page from the Students flow)
- Click delete icon → confirmation dialog → `deactivateStudent` action

### Pagination

- Footer inside the table card, `#FAFBFC` bg, top border:
  - "Showing **1–5** of **72**" on the left
  - Page button row on the right (same pattern as Students list)

### Add Student to Level behavior

Opens the **existing Create Student dialog** (from the Students flow spec) with the `Level` field **pre-filled and locked** to the current level. All other fields (Full Name, Roll Number, Date of Birth) are editable. On save, the student is created in this level and the tab refreshes to show them.

### Empty state

If this level has 0 enrolled students:

- Empty card below the tab content header (not above — header stays for the CTA)
- Centered, padding 48×24
- Icon chip: `#F1F5F9` bg, `users` icon `#475569`
- Title "No students in this level yet"
- Subtitle "Add the first student or enroll existing ones from the Students page."
- Below: inline small primary "+ Add Student to Level" button (which opens the same dialog as the header CTA)

### Data flow

```ts
const { data: students, count } = await supabase
  .from('students')
  .select('id, full_name, roll_number, created_at', { count: 'exact' })
  .eq('institution_id', institutionId)
  .eq('level_id', levelId)
  .is('deleted_at', null)
  .ilike('full_name', `%${search}%`)
  .range(from, to);
```

---

## 8. Screen 3b — Assessments Tab Content

### Tab content header

Same pattern as Students tab:
- **Left:** search input. Placeholder: "Search assessments in this level…"
- **Right:** "+ Create Assessment for Level" primary button

### Assessment card grid

- `grid-template-columns: repeat(3, 1fr)`, 16px gap
- On smaller screens, collapses to 2 columns then 1
- Each card: white bg, Slate 200 border, 14px radius, padding 20, shadow-sm

### Assessment card anatomy

```
┌────────────────────────────────┐
│ [Live] [Exam]                  │ ← badge row
│                                │
│ Q3 Mental Arithmetic           │ ← title
│ 30 min · 20 questions          │ ← meta
│                                │
│ ────────────────────────────   │
│ ASSIGNED    │  SUBMITTED       │
│    24       │     22           │
└────────────────────────────────┘
```

- **Badge row** (flex, 6px gap, mb-12):
  - Status badge:
    - **Live** — `#FEE2E2` bg, `#991B1B` text, with a 5×5 red pulse dot before text
    - **Published** — `#DCFCE7` bg, `#14532D` text
    - **Draft** — `#F1F5F9` bg, `#334155` text
    - **Closed** — `#E2E8F0` bg, `#475569` text
  - Type badge:
    - **Exam** — `#EFF6FF` bg, `#DBEAFE` border, `#1E3A8A` text
    - **Test** — `#F5F3FF` bg, `#EDE9FE` border, `#6D28D9` text
  - Both badges: 10/700 uppercase, letter-spacing 0.04em, 3×10 padding, 9999 radius
- **Title:** DM Sans 16/700 `#0A0F1A` letter-spacing -0.008em
- **Meta row:** DM Sans 12/500 `#475569` — "30 min · 20 questions" or "15 min · 10 sequences" for Test type
- **Mini stats** (padding-top 14, 1px `#F1F5F9` top border, flex row with 1px internal dividers):
  - **ASSIGNED** — 10/700 uppercase `#475569` label + DM Mono 18/700 `#0A0F1A` value
  - **SUBMITTED** — same structure, value in `#1A3829` (green) when > 0
  - For **Draft** status, both values show "—" since nothing has been submitted yet

### Card interaction

- Entire card is clickable
- On click, navigates to:
  - `/admin/assessments/[id]` if Draft (to edit)
  - `/admin/monitor/[id]` if Live (to monitor)
  - `/admin/results/[id]` if Published or Closed (to view results)

### Create Assessment for Level behavior

Opens the Assessment Creation flow (designed later) with the Level field pre-filled and locked to the current level.

### Empty state

If this level has 0 assessments:

- Empty card below the tab content header
- Centered, padding 48×24
- Icon chip: `#F1F5F9` bg, `clipboard-list` icon `#475569`
- Title "No assessments for this level yet"
- Subtitle "Create your first assessment targeted at students in this level."
- Inline small primary "+ Create Assessment for Level" button

### Data flow

```ts
const { data: papers } = await supabase
  .from('exam_papers')
  .select('id, title, type, status, duration_minutes, question_count, archived_at, opened_at, closed_at')
  .eq('institution_id', institutionId)
  .eq('level_id', levelId)
  .is('archived_at', null)
  .ilike('title', `%${search}%`)
  .order('created_at', { ascending: false });

// For each paper, fetch assigned + submitted counts:
//   assigned = count of enrolled students in this level
//   submitted = count of submissions where completed_at IS NOT NULL
// Via a single RPC or bulk query.
```

---

## 9. Database Changes

**None.** Uses existing `levels`, `students`, `exam_papers` tables unchanged.

### Server actions used

- `createLevel` (existing) — unchanged
- `updateLevelOrder` (existing) — unchanged
- `deactivateStudent` (existing, from Students flow) — used by student row delete on Students tab
- `createStudent` (existing, from Students flow) — used by "Add Student to Level" dialog with locked level_id
- **Create Assessment** action (from future Create Assessment flow) — used by "Create Assessment for Level" CTA with locked level_id

### New data requirements (client-side only)

- Main list page: fetch assessment counts per level alongside student counts
- Level detail page: fetch per-level student list, per-level assessment list with assigned/submitted counts

No schema changes needed.

---

## 10. Files to Change

### New files

```
src/app/(admin)/admin/levels/page.tsx                      (rewrite)
src/app/(admin)/admin/levels/[id]/page.tsx                  (new — detail page server component)

src/components/levels/levels-list-client.tsx               (new — sortable list + create dialog trigger)
src/components/levels/level-card.tsx                        (new — single sortable card)
src/components/levels/levels-summary-strip.tsx              (new — top stats strip)
src/components/levels/create-level-dialog.tsx               (new — rewrite from existing)

src/components/levels/level-detail-client.tsx               (new — hero + tab state)
src/components/levels/level-detail-hero.tsx                 (new — hero card with seq + stats)
src/components/levels/level-detail-tabs.tsx                 (new — tab strip)
src/components/levels/level-students-tab.tsx                (new — scoped students table + CTA)
src/components/levels/level-assessments-tab.tsx             (new — assessment card grid + CTA)
src/components/levels/level-assessment-card.tsx             (new — single assessment card)
```

### Modified files

```
src/app/actions/levels.ts                   — no changes, existing actions suffice
src/components/levels/levels-client.tsx     — DELETE (replaced by levels-list-client.tsx)
```

### Minor extensions

- `createStudent` server action should accept a pre-locked level via a param flag (or just honor whatever `level_id` is passed — already works)
- Add Student to Level dialog reuses `CreateStudentDialog` with a `lockedLevelId` prop that disables the level dropdown and pre-selects it

---

## 11. Out of Scope

- **Rename level** — not in this redesign. Per user decision in Q4.
- **Delete level** — not in this redesign. Risky for enrolled students; future spec if needed.
- **Level description field** — no new DB column. Per user decision in Q5.
- **Position selector on create** — new levels always append to the end; admin drags to reorder afterward.
- **Student bulk-reassign between levels** — future enhancement. Not part of this flow.
- **Per-level analytics / average score** — future analytics page. Not shown on the detail hero card.

---

## 12. Decisions Locked in Brainstorm

- **Q1 (scope):** Option B — Main list + Level Detail page (one spec, not separate Students/Assessments drill-downs)
- **Q2 (detail layout):** Option B — Tabbed layout (Students + Assessments tabs)
- **Q3 (card anatomy):** Option B — Standard card (drag handle + name + 2 stats + View button + overflow)
- **Q4 (CRUD operations):** Option A — Create + Reorder only. No rename, no delete.
- **Q5 (create dialog fields):** Option A — Just name. Single-field dialog.
- **Q6 (detail top section):** Option B — Hero card with sequence badge + stats (no CTA buttons in hero)
- **Q7 (students tab):** Option C — Simplified 3-column table + "+ Add Student to Level" CTA
- **Q8 (assessments tab):** Option C — Card grid + "+ Create Assessment for Level" CTA

---

## Appendix A — Visual Reference

Browser mockups saved in `.superpowers/brainstorm/223-1776020821/content/`:

- `levels-list.html` — Main levels list page
- `level-detail.html` — Level Detail page (both Students and Assessments tab states)
- `level-dialog.html` — Create Level dialog
