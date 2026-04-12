# Admin Students Flow Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Full redesign of the admin student management flow — list page, detail page (with inline editing), two empty states, and two dialogs (Create Student, Import CSV).

---

## 1. Goal

Replace the current students admin screens with a clean, operational flow that:

- Shows a minimal list with 4 columns (Roll No · Name · Level · Actions)
- Uses inline editing on the detail page (no separate `/new` or `/edit` routes)
- Creates students via a modal dialog over the list page
- Imports CSV via a separate modal dialog with a template download
- Handles two distinct empty states: first-time and filtered-no-results
- Provides a Danger Zone on the detail page for Reset Password + Deactivate actions

The redesign prioritizes the common admin workflow: glance at the roster → click into a profile → optionally edit fields inline → get back to the list.

---

## 2. Route Map

```
/admin/students                  → List page
/admin/students/[id]             → Detail page (read-only by default, inline edit mode)
```

**No separate routes for create or edit.** Create is a dialog launched from the list page header button. Edit is a state toggle on the detail page.

Delete is a destructive action available in two places: as an icon button per row on the list page (immediate confirmation dialog) and as "Deactivate Student" in the Danger Zone on the detail page.

---

## 3. Design System Notes

Uses the established MINDSPARK tokens (from the Dashboard and Results specs in this series):
- DM Sans for all UI text, DM Mono for numbers/IDs
- Forest Green `#1A3829` primary, `#EFFAF4` light accent, `#B7E4C7` pill border
- Charcoal text scale: `#0A0F1A` primary / `#1E293B` body / `#334155` secondary / `#475569` labels
- Card radius 14px (16px for hero cards)
- Button radius 10px
- Pill radius 9999
- Base font size 16px
- Lucide-react line icons, stroke 1.75

The global admin sidebar with Sign Out footer from the earlier spec applies here unchanged.

---

## 4. Screen 1 — Students List Page

**Route:** `/admin/students`

### Layout

1. **Admin chrome** (sidebar + top bar). Top bar breadcrumb: `Admin › Students`.

2. **Page header row:**
   - Left: H1 "Students" (30/700 `#0A0F1A`, -0.018em) + subtitle "Manage enrolled students, add new entries, and import rosters." (14/500 `#334155`)
   - Right: two buttons — "Import CSV" (outline, upload icon) + "+ Add Student" (primary, forest green, plus icon)

3. **Filter bar** — single white card (Slate 200 border, 14px radius, padding 14×18, shadow-sm), flex row, 12px gap:
   - Search input (flex 1, max-width 460, height 40, 10px radius, search icon left-padded). Placeholder: "Search by name or roll number…"
   - "All Levels" dropdown (min-width 160, height 40, 10px radius)
   - "All Statuses" dropdown (min-width 160, height 40, 10px radius)
   - Right-aligned count: "**247** students" in DM Mono 13/500 `#334155`, number bolded in `#0A0F1A`

4. **Students table** — white card (`#E2E8F0` border 1px, 14px radius, overflow-hidden, shadow-sm). Four columns:

   | Column | Width | Content |
   |---|---|---|
   | **Roll No.** | 160px | DM Mono 14/700 `#475569` |
   | **Name** | flex | 36×36 forest-green avatar + full name (DM Sans 15/600 `#0A0F1A`) |
   | **Level** | 140px | Pill: `#EFFAF4` bg, `#B7E4C7` border, `#1A3829` text, `layers` icon + level name |
   | **Actions** | 180px (right-aligned) | "View" outline button (eye icon + text, h-34) + delete icon button (h-34, w-34, hover: red tint) |

   - Header row: `#F8FAFC` bg, 13/700 uppercase `#334155` labels, letter-spacing 0.06em
   - Body row: 15/500 `#1E293B` cells, hover `#FAFBFC` bg
   - Divided by 1px `#F1F5F9` borders

5. **Pagination footer** — inside the table card, padding 16×22, `#FAFBFC` bg, top border:
   - Left: "Showing **1–7** of **247**" in DM Sans 13/500 `#334155`, numbers in DM Mono bold `#0A0F1A`
   - Right: page button row — ChevronLeft, numbered buttons (active button: forest green bg, white text), ellipsis, last page, ChevronRight. Each button 34×34, 10px radius.

### Page size

20 rows per page (matches current implementation). Server-side pagination via `?page=2` query param.

### Data flow

```ts
// Server component. Fetches students list scoped to institution.
const { data: students, count } = await supabase
  .from('students')
  .select('id, full_name, roll_number, level_id, created_at, deleted_at, levels(id, name)',
          { count: 'exact' })
  .eq('institution_id', institutionId)
  .ilike('full_name', `%${search}%`)  // Or OR with roll_number
  .eq('level_id', levelFilter)         // If set
  .range(from, to);
```

### Row actions behavior

- **View button:** Navigates to `/admin/students/[id]`
- **Delete icon button:** Opens a small confirmation dialog "Delete Aditi Sharma? This will deactivate the student and preserve their data. They can be reactivated later." with Cancel + "Deactivate" destructive button. On confirm, calls the existing `deactivateStudent` server action.

---

## 5. Screen 2 — Empty State: First-Time

**Route:** `/admin/students` (when there are zero students in the institution)

- Full app shell (sidebar + top bar) and page header unchanged from the populated list
- **No filter bar** (there's nothing to filter)
- In the main content area below the header, a single empty card:
  - White bg, `#E2E8F0` border, 14px radius, padding 64×24, text-center, shadow-sm
  - 64×64 round icon chip in `#F1F5F9` bg, `#475569` icon color, `users` lucide icon (28×28, stroke 1.75)
  - Title: "No students yet" (20/700 `#0A0F1A`)
  - Subtitle: "Add your first student one at a time, or import a full roster from a CSV file to get started." (15/500 `#475569`, max-width 420)
  - Action row: "Import CSV" (outline) + "+ Add Student" (primary) — same buttons as the page header, duplicated here for clarity

The duplication of buttons (header + card) is intentional. First-time admins need obvious affordances.

---

## 6. Screen 3 — Empty State: Filtered No-Results

**Route:** `/admin/students?search=xyz&level=L5` (when the current filter combination returns zero rows)

- Full app shell + page header + filter bar **all remain visible** with their current values
- Active filters are highlighted with `#EFFAF4` bg + `#B7E4C7` border to indicate they're the cause of the empty state
- Filter counter shows "**0** students"
- In the main area below the filter bar, a single empty card:
  - Same card shell as the first-time state
  - **Different icon tint:** `#FEF9C3` bg (amber) + `#92400E` icon color, `search` icon with an inset indicator
  - Title: "No students match your filters" (20/700 `#0A0F1A`)
  - Subtitle: "Try a different search term or level, or clear the filters to see all students." (15/500 `#475569`, max-width 360)
  - Action: "Clear all filters" — NOT a button, a subtle text link with X icon in forest green (14/700 `#1A3829`). Clicking it resets all URL query params.

The visual difference between first-time (neutral slate) and filtered (warning amber) immediately tells the admin what kind of empty state they're in.

---

## 7. Screen 4 — Student Detail Page (Read-Only Mode)

**Route:** `/admin/students/[id]`
**Default state:** Read-only. "Edit Profile" button flips into edit mode.

### Layout (top to bottom)

1. **Admin chrome.** Breadcrumb: `Admin › Students › Aditi Sharma`.

2. **Back link:** "← Back to Students" in DM Sans 15/500 `#334155`, 16px margin below.

3. **Profile Hero Card** — white card, `#E2E8F0` border, 16px radius, padding 28×32, shadow-sm, relative positioned with a **4px forest-green left accent bar** (`::before` element). Flex row, items-center, 24px gap:
   - **Left (flex-shrink 0):** 80×80 circular avatar, `#1A3829` bg, white DM Sans 28/700 initials (first letter of each word, max 2 chars, uppercase, letter-spacing -0.01em)
   - **Middle (flex 1):**
     - Label "STUDENT PROFILE" — 13/700 `#475569` uppercase letter-spacing 0.08em, 4px margin-bottom
     - Name H1 — 28/700 `#0A0F1A` letter-spacing -0.018em, 10px margin-bottom
     - Badge row (flex, 8px gap, wrap):
       - **Roll number badge** — `#F1F5F9` bg, DM Mono 12/700 `#1E293B`
       - **Level badge** — `#EFFAF4` bg, `#B7E4C7` border, `#1A3829` text, 12/700, layers icon
       - **Status badge** — `#DCFCE7` bg, `#14532D` text, 12/700 with a 6×6 status dot
       - **Member-since badge** — `#EFF6FF` bg, `#1E3A8A` text, 12/700, calendar icon
   - **Right:** "Edit Profile" primary button (forest green, 42px tall, pencil icon + text). Hidden in edit mode (replaced by the edit banner elsewhere).

4. **Personal Information card** — section header + 2×2 grid:
   - Section header (padding 20×24×14, bottom border `#F1F5F9`): 34×34 blue icon chip (`#EFF6FF` bg, `#1E3A8A` person icon) + "Personal Information" title (17/700 `#0A0F1A` -0.008em)
   - 2×2 grid of info rows (padding 4×24×20):
     - **Full Name** → display value (15/600 `#0A0F1A`)
     - **Date of Birth** → DM Mono display value
     - **Age** → display value (auto-calculated from DOB)
     - **Accessibility Flags** → display value OR "No flags set" italic muted if empty
   - Each row: 16px padding vertical, 1px `#F1F5F9` bottom border (except last row in each column pair)

5. **Academic Information card** — same shell as Personal Information:
   - Section header: 34×34 green icon chip (`#EFFAF4` bg, `#1A3829` layers icon) + "Academic Information" title
   - 2×2 grid:
     - **Roll Number** → DM Mono display value (read-only even in edit mode)
     - **Level** → display value
     - **Cohort** → display value OR "Not assigned" italic muted if empty
     - **Date Joined** → DM Mono display value (read-only even in edit mode)

6. **Recent Sessions card** — section header + table:
   - Section header: 34×34 neutral icon chip (`#F1F5F9` bg, `#334155` calendar icon) + "Recent Sessions" title + right-aligned "Last 5 attempts" meta (13/500 `#475569`)
   - Table spans full width of the card:
     - Columns: Exam (DM Sans 15/600 `#0A0F1A`) | Type (pill: EXAM blue, TEST purple) | Date (DM Mono 13/500 `#475569`) | Score (right-aligned, DM Mono 15/700 with color: green for ≥80%, amber for 60–79%, red for <60%) | Grade (right-aligned, color-coded pill)
     - Row hover: `#FAFBFC` bg, cursor pointer
     - **Click behavior:** Navigates to `/admin/results/[paperId]/students/[studentId]` — the student answer sheet from the Results flow
   - Max 5 rows. No pagination in this section.

7. **Danger Zone card** — red-bordered card (`#FECACA` border instead of slate, red-tinted shadow):
   - Section header: 34×34 red icon chip (`#FEF2F2` bg, `#991B1B` alert-triangle icon) + "Danger Zone" title
   - Two action rows (padding 20×24×24), divided by `#FEE2E2` borders:
     - **Row 1 — Reset Password:**
       - Left: title "Reset Password" (15/700 `#0A0F1A`) + description "Generate a new temporary password and deliver it to the student. Previous credentials will be invalidated immediately." (13/500 `#475569`, max-width 480)
       - Right: amber warning button — white bg, `#FDE68A` border, `#92400E` text, 42px tall, lock icon + text. Hover: `#FEF3C7` bg.
       - On click: opens a confirmation dialog, then calls existing `resetPassword` server action.
     - **Row 2 — Deactivate Student:**
       - Left: title "Deactivate Student" + description "Mark this student as inactive. Their data is preserved and they can be reactivated later, but they cannot log in or take exams while deactivated."
       - Right: destructive button — white bg, `#FECACA` border, `#991B1B` text, 42px tall, ban icon + text. Hover: `#FEE2E2` bg.
       - On click: opens a confirmation dialog, then calls `deactivateStudent` server action.

### Data flow

```ts
const { data: student } = await supabase
  .from('students')
  .select(`
    id, full_name, roll_number, date_of_birth, level_id, cohort_id,
    created_at, deleted_at, accessibility_flags,
    levels(id, name),
    cohorts(id, name)
  `)
  .eq('id', params.id)
  .eq('institution_id', institutionId)
  .single();

const { data: recentSessions } = await supabase
  .from('submissions')
  .select('id, paper_id, score, total_questions, grade, completed_at, exam_papers(title, type)')
  .eq('student_id', params.id)
  .not('completed_at', 'is', null)
  .order('completed_at', { ascending: false })
  .limit(5);
```

Age is calculated client-side from `date_of_birth`.

---

## 8. Screen 5 — Student Detail Page (Edit Mode)

Same route. State flip after clicking "Edit Profile". Changes:

1. **Breadcrumb updates** — last segment becomes "Aditi Sharma · Editing"

2. **Edit Banner** appears immediately after the back link (before the Profile Hero Card):
   - `#EFFAF4` bg, `#B7E4C7` border 1px, 14px radius, padding 12×20
   - Left: pencil icon + "Editing profile — changes are not saved yet" (14/600 `#1A3829`)
   - Right: two buttons — "Cancel" (outline, h-36) + "Save Changes" (primary forest green, h-36, check icon + text)
   - Cancel discards unsaved edits and flips back to read-only
   - Save Changes calls `updateStudent` with the changed fields, shows a success toast, and flips back to read-only

3. **Profile Hero Card** stays visually unchanged. The avatar, name, and badges show the current (unsaved) values. The "Edit Profile" button on the right is **hidden** in edit mode.

4. **Personal Information card** — fields become editable:
   - **Full Name** → `<input type="text">` (h-40, 10px radius, `#E2E8F0` border, focus ring forest-green 8%)
   - **Date of Birth** → `<input type="date">`
   - **Age** → stays a read-only display value, labeled "(auto-calculated)" in subtle micro-text
   - **Accessibility Flags** → dropdown `<select>` with "Configure flags…" placeholder

5. **Academic Information card** — partial editability:
   - **Roll Number** → **stays read-only** with a "(read-only)" micro-label. Roll numbers are immutable identifiers tied to auth users.
   - **Level** → dropdown `<select>` listing all levels in the institution
   - **Cohort** → dropdown `<select>` with "Not assigned" as the default option
   - **Date Joined** → **stays read-only** with a "(read-only)" micro-label. Date joined is immutable.

6. **Recent Sessions card** stays completely unchanged — sessions are historical data, not editable.

7. **Danger Zone card** stays completely unchanged — its actions are always available.

### Field validation

- **Full Name:** required, non-empty, 1–120 chars
- **Date of Birth:** optional, must be a valid date, must be in the past, student must be ≥ 6 years old (platform is for ages 6–18)
- **Level:** required, must be one of the institution's levels
- **Cohort:** optional

On Save, invalid fields show inline error text below the input in `#DC2626`. Save button is disabled until all errors resolve.

---

## 9. Screen 6 — Create Student Dialog

**Trigger:** Click "+ Add Student" on list page header or empty state card.

### Dialog shell

- Full viewport backdrop: `rgba(10, 15, 26, 0.45)`
- Dialog card: max-width 520px, white bg, 18px radius, shadow `0 24px 64px rgba(10,15,26,0.3)`, centered

### Header (padding 24×28×20, bottom border `#F1F5F9`)

- 44×44 green icon chip (`#EFFAF4` bg, `#1A3829` user-plus icon)
- Title "Add New Student" (20/700 `#0A0F1A` -0.01em)
- Subtitle "Create a single student entry. You can edit more details later on the profile page." (14/500 `#475569`)
- Top-right X close button (34×34, `#F1F5F9` bg)

### Body (padding 24×28)

4 fields total, 2 full-width stacked + 2 in a row:

1. **Full Name** (full width, required)
   - Label: "Full Name *" (13/700 `#334155`, red * for required)
   - Input: h-44, 10px radius, 14px padding, 15px font, placeholder "e.g. Aditi Sharma"

2. **Roll Number** (full width, required)
   - Label: "Roll Number *"
   - Input: same style, placeholder "e.g. MS-L3-025"
   - Help text below: "Must be unique within your institution. Uppercase letters and numbers only." (12/500 `#475569`)

3. **Level** (half width, required)
   - Label: "Level *"
   - Dropdown: h-44, placeholder "Select level…" in `#94A3B8`
   - Options populated from the institution's levels ordered by sequence_order

4. **Date of Birth** (half width, optional)
   - Label: "Date of Birth" (no asterisk)
   - Input type date, placeholder "DD / MM / YYYY"

### Footer (padding 18×28, `#FAFBFC` bg, top border `#F1F5F9`)

- Flex row, justify-end, 10px gap
- Cancel (outline, h-42)
- "Create Student" (primary forest green, h-42, check icon + text)

### Validation

Same rules as the edit mode (see §8). The Create Student button stays disabled until all required fields are valid.

### On success

- Call `createStudent` server action
- Show success toast: "Student Aditi Sharma created successfully"
- Close dialog
- Close dialog and refresh the list page — the new student appears at the top. Admin can click "View" on the new row to open the detail page.

### On error

- Inline error pill inside the dialog body: `#FEE2E2` bg, `#991B1B` text, 13/500
- Common errors:
  - "Roll number already exists in your institution."
  - "Date of birth must indicate an age between 6 and 18."
  - "Failed to create student. Please try again."

---

## 10. Screen 7 — Import CSV Dialog

**Trigger:** Click "Import CSV" on list page header or empty state card.

### Dialog shell

- Same backdrop as Create Student
- Dialog card: max-width 580px (slightly wider to accommodate template row and upload zone)

### Header

- 44×44 blue icon chip (`#EFF6FF` bg, `#1E3A8A` upload icon)
- Title "Import Students from CSV" (20/700 `#0A0F1A`)
- Subtitle "Upload a CSV file to create multiple students at once. Download the template first to ensure the correct format." (14/500 `#475569`)
- Top-right X close button

### Body

**1. Template row** (padding 14×16, `#EFF6FF` bg, `#DBEAFE` border 1px, 12px radius):

- Flex row, items-center, justify-between
- Left: 36×36 white icon chip (`#DBEAFE` border, `#1E3A8A` file-text icon) + two-line text:
  - "Download CSV Template" (14/700 `#1E3A8A`)
  - "4 columns: full_name, roll_number, level_name, date_of_birth" (12/500 `#334155`)
- Right: small outline button "template.csv" (h-36, 13/600, download icon). On click, triggers a direct download of `/api/admin/students/import-template.csv`.

**2. Upload zone** (margin-top 18):

- Dashed border 2px `#CBD5E1`, `#F8FAFC` bg, 14px radius, padding 36×24, text-center, cursor pointer
- Hover: border `#1A3829`, bg `#EFFAF4`
- 52×52 white icon chip (`#E2E8F0` border, `#1A3829` upload icon, 24×24)
- Title "Drop your CSV here, or click to browse" (16/700 `#0A0F1A`)
- Subtitle "Maximum file size: 5 MB" (13/500 `#475569`)
- Small chip hint: ".csv only" in DM Mono 12/600 `#334155`, white bg, slate border, 4×10 padding, rounded-pill

**3. After upload — error report state** (replaces the upload zone when upload completes):

- Background color depends on outcome:
  - **All success:** `#DCFCE7` bg, `#BBF7D0` border, check icon in `#14532D`
    - "Successfully imported **47 students**" (16/700 `#14532D`)
    - "You can close this dialog. New students will appear in your list immediately."
  - **Partial failure:** `#FEF3C7` bg, `#FDE68A` border, warning icon in `#92400E`
    - "Imported **47 of 50 students**" (16/700 `#92400E`)
    - "3 rows had errors and were skipped. Download the error report to see what went wrong."
    - Below: small outline button "Download error report" with download icon
  - **Total failure:** `#FEE2E2` bg, `#FECACA` border, x-circle icon in `#991B1B`
    - "Import failed" (16/700 `#991B1B`)
    - Error message below (13/500 `#991B1B`)

### Footer

- Flex row, justify-end, 10px gap
- Cancel (outline)
- **Before upload:** "Upload & Import" primary button (disabled until a file is selected), upload icon + text
- **After upload:** "Upload & Import" is replaced by "Close" primary button

### Server behavior

- File is POSTed to `/api/admin/students/import-csv` as `multipart/form-data`
- Server parses CSV, validates each row, runs `createStudent` for valid rows
- Returns JSON: `{ imported: number, skipped: number, errors: Array<{row: number, reason: string}> }`
- Error report CSV is generated on demand and served at `/api/admin/students/import-errors/[uploadId].csv`

### CSV template structure

```csv
full_name,roll_number,level_name,date_of_birth
Aditi Sharma,MS-L3-001,Level 3,2012-08-12
Rahul Verma,MS-L3-002,Level 3,2012-09-04
...
```

- `level_name` is matched case-insensitively against existing levels in the institution. If no match, the row is skipped.
- `date_of_birth` is optional. Empty cell is allowed.
- All 4 column headers are required even if values are empty.

---

## 11. Database Changes

**None.** The existing `students` table and its related `levels`, `cohorts`, `submissions`, `exam_papers` tables cover everything in this spec.

### Server actions used

All actions already exist in `src/app/actions/students.ts`:

- `createStudent` — used by Create Student dialog
- `updateStudent` — used by detail page edit mode
- `deactivateStudent` — used by list row delete button AND detail page Danger Zone
- `importStudentsCSV` — used by Import CSV dialog
- `resetPassword` (if not already present, added) — used by detail page Danger Zone

One small addition: `updateStudent` currently only handles `full_name`, `level_id`, `accessibility_flags`. It needs to also accept `date_of_birth` and `cohort_id` for the edit mode to work fully.

---

## 12. Files to Change

### New files

```
src/app/(admin)/admin/students/page.tsx                   (rewrite — same route, new UI)
src/app/(admin)/admin/students/[id]/page.tsx              (rewrite — detail page with edit mode)
src/components/students/students-list-client.tsx          (new — list + filter bar + pagination)
src/components/students/students-table.tsx                (new — the 4-column table)
src/components/students/students-empty-first-time.tsx     (new)
src/components/students/students-empty-filtered.tsx       (new)
src/components/students/student-detail-client.tsx         (new — detail page with read/edit state)
src/components/students/student-hero-card.tsx             (new)
src/components/students/student-info-section.tsx          (new — shared between Personal and Academic)
src/components/students/student-recent-sessions.tsx       (new)
src/components/students/student-danger-zone.tsx           (new)
src/components/students/create-student-dialog.tsx         (new)
src/components/students/import-csv-dialog.tsx             (new)
src/components/students/delete-student-dialog.tsx         (new — confirmation for list row delete)
src/app/api/admin/students/import-template.csv/route.ts   (new)
src/app/api/admin/students/import-csv/route.ts            (new)
src/app/api/admin/students/import-errors/[id].csv/route.ts (new)
```

### Modified files

```
src/app/actions/students.ts                 — extend updateStudent to handle date_of_birth + cohort_id
```

### Deleted files (if any exist from current implementation)

```
src/components/students/students-table-client.tsx     (replaced by new components above)
```

---

## 13. Out of Scope

- **Hard delete.** Only soft-delete via `deactivateStudent` exists. No "permanently delete" button anywhere.
- **Bulk actions on the list page.** No multi-select checkboxes. Deleting students is one at a time via the row icon button.
- **Student portrait photos.** Avatars are initials-only, forest-green background.
- **Student search by DOB or age.** Only name and roll number are searchable.
- **Cohort management UI.** The Cohort dropdown exists but cohort CRUD lives elsewhere (future Levels flow spec).
- **Student import preview / dry-run.** The CSV upload is direct-apply, not a wizard. Chosen for simplicity per user decision in Q11.
- **Student detail pagination of Recent Sessions.** The section shows only the last 5 sessions. Full session history is on the student's results pages.

---

## 14. Decisions Locked in Brainstorm

- **Q1 (scope):** Option C — inline editing on detail page, no separate create/edit routes
- **Q2 (list columns):** Roll No. | Name | Level | Actions (4 columns only)
- **Q3 (row actions):** View button + Delete icon button
- **Q4 (top of list):** Title + action buttons + filter bar (B + D combined)
- **Q5 (filter bar):** Search + Level + Status (no Cohort filter)
- **Q6 (detail layout):** Single scrolling page
- **Q7 (detail sections):** 5 sections — Profile hero + Personal + Academic + Recent Sessions + Danger Zone
- **Q8 (edit mode):** Hybrid — one "Edit Profile" button flips Personal + Academic into edit mode; Recent Sessions + Danger Zone stay read-only
- **Q9 (danger zone):** Reset Password + Deactivate Student (no hard delete)
- **Q10 (create dialog fields):** 4 fields — Full Name, Roll Number, Level, Date of Birth
- **Q11 (import dialog):** Simple upload + template download + post-upload error report (no 3-step wizard)
- **Q12 (empty states):** Two distinct empty states — first-time (welcoming) and filtered (clear filters)

---

## Appendix A — Visual Reference

Browser mockups saved in `.superpowers/brainstorm/223-1776020821/content/`:

- `students-list-v2.html` — List page + both empty states
- `student-detail.html` — Detail page (read-only + edit mode)
- `student-dialogs.html` — Create Student dialog + Import CSV dialog
