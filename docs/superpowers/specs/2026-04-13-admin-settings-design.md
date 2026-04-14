# Admin Settings Redesign — Design Spec

**Status:** Draft · awaiting user review
**Author:** Brainstorm session 2026-04-13
**Scope:** Redesign the `/admin/settings` page — single-column centered layout with three sections (Institution Info with logo + 6 fields, Grade Boundaries with EXAM/TEST toggle, Session Settings with a single timeout field) and a sticky footer save bar.

---

## 1. Goal

Replace the current ad-hoc Settings page with a focused, modern configuration surface that:

- Puts institution branding (including a logo upload) front and center
- Lets admins configure grade thresholds separately for EXAM and TEST assessments via a segmented toggle
- Keeps session timeout controls simple — one field, no clutter
- Uses a sticky footer save bar that reveals on first edit and stays visible while scrolling, matching the pattern used by Linear / Vercel / Stripe for settings pages

No danger zone, no Support card, no profile/password section. Those belong elsewhere (or later).

---

## 2. Route Map

```
/admin/settings            → single-page settings (no sub-routes)
```

No tabs, no sub-pages, no query-string state. Every section is visible and scrollable.

---

## 3. Design System Notes

Uses the MINDSPARK tokens from earlier specs in this session:
- DM Sans for UI, DM Mono for numbers and DM Mono for percentage fields in the grade table
- Forest Green `#1A3829` primary, `#EFFAF4` light accent
- Charcoal text scale: `#0A0F1A` / `#1E293B` / `#334155` / `#475569`
- Card radius 14px
- Base font size 16px
- Lucide-react line icons, stroke 1.75
- Global admin sidebar with Sign Out footer

The Settings nav item in the sidebar is active on this route.

---

## 4. Layout

Single-column centered main content:

- `main` element has `padding: 32px 40px 96px` (large bottom padding leaves room for the sticky save bar)
- `main-inner` wrapper: `max-width: 860px; margin: 0 auto`
- No right sidebar column (Support card was dropped during brainstorming Q6)
- No left section nav (3 sections is few enough to scroll naturally)

### Page header

- H1 "Settings" (30/700 `#0A0F1A` letter-spacing -0.018em, 6px margin-bottom)
- Subtitle: "Manage your institution's details, grading rules, and session behavior." (15/500 `#334155`)

### Section cards

Three stacked white cards, each with:
- `#E2E8F0` border 1px
- 14px radius
- `box-shadow: 0 1px 3px rgba(10,15,26,0.04)`
- overflow-hidden
- 20px bottom margin between cards

Each section card has:
- **Head** (padding 18×24, `#F1F5F9` bottom border, flex row with 12px gap):
  - 36×36 tinted icon chip with 10px radius
  - Title + subtitle stacked
- **Body** (padding 22×24)

---

## 5. Section 1 — Institution Info

**Icon chip:** blue (`#EFF6FF` bg, `#1E3A8A` building-2 icon)
**Title:** "Institution Info"
**Subtitle:** "Basic details and branding for your institution."

### Fields (in order)

#### 1. Logo (optional)

Dashed-border uploader block, 18px padding, `#F8FAFC` bg, 1px dashed `#CBD5E1` border, 12px radius:

- **Preview square** (72×72, 14px radius, `#1A3829` bg) — shows the current logo as a white image, or the MINDSPARK prism mark as fallback when no logo is set
- **Info text** (flex 1):
  - Title "Upload institution logo" (14/700 `#0A0F1A`)
  - Sub "PNG, JPG or SVG · Max 2 MB · Square aspect recommended" (12/500 `#475569`)
- **Actions** (flex, 8px gap):
  - "Upload" outline small button (upload icon + text) — opens file picker
  - "Remove" ghost small button — only visible if a logo is currently set

**On upload:**
1. File validated client-side (size ≤ 2MB, type in `['image/png', 'image/jpeg', 'image/svg+xml']`)
2. Uploaded to Supabase Storage bucket `institution-logos` with key `{institution_id}/{timestamp}-{filename}`
3. Public URL returned and stored in `institutions.logo_url` on next Save
4. Preview updates immediately (optimistic)
5. Old logo file is NOT automatically deleted — orphaned files are cleaned up by a separate background job (out of scope for this spec)

#### 2. Institution Name (required)

- Full-width text input, h-42
- Label: "Institution Name *" (13/700 `#334155`, red asterisk)
- Placeholder: "e.g. Aarav Abacus Academy"
- Validation: non-empty, 1–120 chars

#### 3. Timezone (required)

- Full-width dropdown, h-42
- Label: "Timezone *"
- Shows the selected IANA timezone with UTC offset: "Asia / Kolkata (GMT+5:30)"
- On click, opens a searchable dropdown grouped by continent
- Default: `'Asia/Kolkata'` (matches existing schema default)
- Help text: "Used for scheduling assessments and timestamping activity logs."

#### 4. Contact row (two fields side-by-side, 14px gap)

**Primary Contact Email** (optional):
- Input type email, h-42
- Label: "Primary Contact Email (optional)" — the "(optional)" part in `#94A3B8` 500
- Validation: if provided, must match a basic email regex

**Primary Contact Phone** (optional):
- Input type tel, h-42
- Label: "Primary Contact Phone (optional)"
- No strict format validation — accepts international format strings

#### 5. Address (optional)

- Full-width textarea, min-height 80, resizable vertical
- Label: "Address (optional)"
- Placeholder: "Street, city, state, postal code"

---

## 6. Section 2 — Grade Boundaries

**Icon chip:** green (`#EFFAF4` bg, `#1A3829` target/check-circle icon)
**Title:** "Grade Boundaries"
**Subtitle:** "Set the percentage thresholds for each grade. EXAM and TEST grades can be configured independently."

### Segmented toggle

Inline-flex, padding 4, `#F1F5F9` bg, 10px radius, `#E2E8F0` border. Two segments:
- **EXAM** (default active) — 8×20 padding, 13/600, 6px radius
- **TEST**

Active: white bg, `#0A0F1A` text, `0 1px 3px rgba(10,15,26,0.08)` shadow. Inactive: `#64748B` text.

The toggle switches which set of grade boundaries is displayed and edited. State is purely client-side (URL doesn't change) — both sets are loaded on initial fetch and kept in local state.

### Grades table

Bordered container (`#E2E8F0` border 1px, 12px radius, overflow-hidden). 5-column grid layout:

```
grid-template-columns: 80px 1fr 140px 140px 40px
```

Columns: Grade letter / Label input / Min % / Max % / Info button

**Header row:** `#F8FAFC` bg, bottom border `#E2E8F0`, 11/700 uppercase `#475569` letter-spacing 0.06em. Column labels: "Grade", "Label", "Min %", "Max %", "".

**Body rows** (5 rows, one per grade — A+, A, B, C, F):
- Padding 14×18
- Bottom border `#F1F5F9` between rows (none on last)

**Per-row cells:**

1. **Grade letter chip** (48×36, 9px radius, DM Mono 18/700 letter-spacing -0.02em):
   - **A+** — `#DCFCE7` bg, `#14532D` text
   - **A** — `#DCFCE7` bg, `#166534` text
   - **B** — `#DBEAFE` bg, `#1E40AF` text
   - **C** — `#FEF3C7` bg, `#92400E` text
   - **F** — `#FEE2E2` bg, `#991B1B` text

2. **Label input** (full-width text, h-36, `#E2E8F0` border 1px, 8px radius):
   - Default labels: "Distinction" (A+) / "Very Good" (A) / "Good" (B) / "Needs Practice" (C) / "Not Passed" (F)
   - Admin can edit each label to match their institution's terminology

3. **Min % input** (percentage input with DM Mono bold + `%` suffix):
   - Container: `#E2E8F0` border 1px, 8px radius, h-36, padding 0×12, flex row 6px gap
   - Input: borderless, DM Mono 14/700 `#0A0F1A`, type number
   - Suffix: "%" (12/600 `#475569`)

4. **Max % input** — same style as Min %

5. **Info button** (28×28 ghost icon button, info-circle lucide 14×14 `#94A3B8`):
   - Hover: `#F1F5F9` bg, `#475569` icon
   - Clicking opens a tiny tooltip explaining what this grade's range means

### Note at bottom

Small informational row below the grades table (12/500 `#475569`, margin-top 12):

- Info icon 14×14 + text: "Grade thresholds must cover 0–100% without gaps or overlaps. Changes apply to new assessments only; existing results are not recalculated automatically."

### Validation

- Each Min % must be less than its Max %
- Consecutive grades must be contiguous (e.g. A's min 80, B's max 79)
- Full range must cover 0–100
- If validation fails, the offending row(s) get a red border and a small error message

### Data model

Uses the existing `grade_boundaries` table which already has:
- `grade_name` (text — "A+", "A", etc.)
- `min_percentage`, `max_score`, `min_score`
- `assessment_type` ("EXAM" or "TEST")
- `label` (text)
- `institution_id`

The redesign keeps the table shape unchanged. On Save, it deletes all existing grade_boundaries rows for this institution_id and re-inserts them from the current editor state (both EXAM and TEST sets together).

---

## 7. Section 3 — Session Settings

**Icon chip:** amber (`#FEF3C7` bg, `#92400E` clock icon)
**Title:** "Session Settings"
**Subtitle:** "How long admin and student sessions stay alive before auto-logout."

### Single field

**Session Timeout** (required):
- Label: "Session Timeout *"
- Container: `max-width: 280px` (the field doesn't need full width)
- Field suffix group: number input + "minutes" suffix text
- Input: h-42, DM Mono bold, default value 60
- Help text: "After this many minutes of inactivity, sessions are automatically logged out."

On Save, converts minutes × 60 to seconds and writes to `institutions.session_timeout_seconds` (existing column, existing behavior).

---

## 8. Sticky Footer Save Bar

A sticky bar at the bottom of the viewport that:
- **Hidden by default** (when there are no unsaved changes)
- **Appears** the instant any field is modified (dirty state)
- **Stays visible** while admin scrolls through the settings content
- **Disappears** after a successful save, or when admin clicks Discard

### Visual design

- Position: `sticky; bottom: 0; left: 0; right: 0`
- Background: white, `#E2E8F0` top border
- Padding: 16×40 (matches main content horizontal padding so the bar visually aligns with the content)
- Upward shadow: `0 -8px 24px rgba(10,15,26,0.06)` to visually separate from content above
- Z-index 10 to sit above all content
- Flex row, items-center, justify-between, 16px gap

### Left side (status)

- Flex row, items-center, 12px gap
- Pulsing 8×8 amber dot (`#F59E0B`) with `pulse 2s ease-in-out infinite` animation
- Status text (14/600 `#475569`): "You have **{N} unsaved changes** across {sections}."
  - The **N** and **section names** are bold `#0A0F1A`
  - Section names computed dynamically: e.g. "Institution & Grade Boundaries" when Institution and Grades have dirty fields but Session doesn't

### Right side (actions)

- Flex row, 10px gap
- **Discard** outline button (42px, no icon) — on click, reverts all dirty state to the last-saved values. Shows a small confirmation tooltip "Discard X unsaved changes?" before proceeding.
- **Save Changes** primary forest-green button (42px, check icon + text) — on click, calls the `updateSettings` server action with the full current state. Shows loading spinner during save. On success: sticky bar hides with a brief "Saved" toast. On error: inline error pill in the bar with a retry option.

### Dirty state tracking

Client-side:
- On page load, store `initialState` = current values from the database
- On any field change, compute `currentState` vs `initialState`
- `isDirty` = deep equality check between them
- Sticky bar visibility driven by `isDirty`
- Count of dirty fields / sections driven by diffing the two state snapshots

---

## 9. Database Changes

> **Phase 2 audit correction (2026-04-14):** The original draft listed 4 column adds. The Phase 1 audit confirmed `institutions.logo_url` already exists in the live DB (text, nullable). Removed it. **Net effect: 3 new columns**, not 4.

### New columns on `institutions`

```sql
-- logo_url ALREADY EXISTS in live DB — do NOT re-add.
ALTER TABLE institutions ADD COLUMN primary_contact_email text;
ALTER TABLE institutions ADD COLUMN primary_contact_phone text;
ALTER TABLE institutions ADD COLUMN address text;
```

All three are nullable since they're optional. No constraints — admins may leave them blank.

### New Supabase Storage bucket

```
Bucket: institution-logos
Public: true (logo URLs are shared broadly)
File size limit: 2 MB
Allowed MIME types: image/png, image/jpeg, image/svg+xml
Path structure: {institution_id}/{timestamp}-{filename}
```

RLS policy: only admins of the institution can upload/delete files in their own `{institution_id}/` prefix. Public read access is open so the logo can be embedded anywhere.

### No changes to `grade_boundaries` or `session_timeout_seconds`

These already exist and the redesign uses them as-is.

---

## 10. Server Actions

### Extended `updateSettings`

The existing `updateSettings` action (from `src/app/actions/settings.ts`) needs to accept the new institution fields:

```ts
interface UpdateSettingsInput {
  institution: {
    name: string;
    timezone: string;
    session_timeout_seconds: number;
    // New fields:
    logo_url: string | null;
    primary_contact_email: string | null;
    primary_contact_phone: string | null;
    address: string | null;
  };
  gradeBoundaries: {
    exam: GradeBoundaryInput[];
    test: GradeBoundaryInput[];
  };
}
```

The action:
1. Calls `requireRole('admin')` (unchanged)
2. Updates the `institutions` row with all fields (institution scope enforced by `institution_id`)
3. Deletes all `grade_boundaries` rows for this institution, then inserts the new set from both EXAM and TEST arrays
4. Logs the change to `activity_logs` with `action_type = 'UPDATE_SETTINGS'`
5. Returns `{ ok: true, data: { updated: true } }`

### New server action for logo upload

```ts
export async function uploadInstitutionLogo(
  formData: FormData
): Promise<ActionResult<{ url: string }>>
```

Takes a `File` from a FormData submission, validates (size ≤ 2MB, type allowed), uploads to the `institution-logos` bucket, and returns the public URL. The admin client then stores this URL in the form state; it gets persisted to `institutions.logo_url` on the next `updateSettings` call.

Alternative: direct client-side upload via the Supabase client-side SDK (since the bucket is public-read). That's simpler and avoids a round-trip through the server action. Precise implementation is an implementation-plan decision.

---

## 11. Files to Change

### New files

```
src/app/(admin)/admin/settings/page.tsx                    (rewrite — server component loads data)
src/components/settings/settings-client.tsx                 (rewrite — main orchestration + dirty tracking)
src/components/settings/institution-section.tsx             (new — logo uploader + 6 fields)
src/components/settings/logo-uploader.tsx                   (new — dashed-border uploader block)
src/components/settings/grade-boundaries-section.tsx        (new — EXAM/TEST toggle + editable table)
src/components/settings/grade-row-editor.tsx                (new — single row in the grade table)
src/components/settings/session-settings-section.tsx       (new — single field section)
src/components/settings/settings-save-bar.tsx               (new — sticky footer)
```

### Modified files

```
src/app/actions/settings.ts           — extend UpdateSettingsInput with new institution fields
                                         and add uploadInstitutionLogo action
```

### Database migration (via Supabase SQL editor per CLAUDE.md)

```sql
-- logo_url ALREADY EXISTS in live DB — do NOT re-add.
-- The IF NOT EXISTS guard would make the original ALTER a no-op, but to keep
-- the run book honest we leave the column out entirely.
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS primary_contact_email text;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS primary_contact_phone text;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS address text;

-- Storage bucket creation happens via Supabase dashboard, not SQL.
-- 🟡 Phase 2 audit TBD: confirm the `institution-logos` bucket exists.
-- The Phase 1 audit could not verify this from SQL alone — needs a manual
-- Supabase dashboard check before this spec's plan executes.
```

### Storage bucket setup

Create `institution-logos` bucket in Supabase Storage with:
- Public: yes
- File size limit: 2 MB
- Allowed MIME types: `image/png`, `image/jpeg`, `image/svg+xml`
- RLS policies per spec §9

---

## 12. Out of Scope

- **Admin's own profile / password change** — belongs on a dedicated `/admin/profile` route (future)
- **Notifications preferences** — no notification settings yet
- **Email templates** — no per-institution branding of student invitation emails
- **Multi-currency / multi-locale** — only one locale per institution, no currency support
- **Billing / plan settings** — SaaS billing is not part of this product
- **Data export** — no "download all my data" button
- **API keys / webhooks** — no developer integrations UI
- **Danger zone** — no destructive institution-level actions per Q8 decision
- **Support/Help card** — removed during brainstorming Q6 in favor of cleaner single-column layout
- **Real-time tracking of other admins editing the same settings** — single-admin edit model
- **Audit history view** — changes are logged to `activity_logs` but there's no UI on this page to browse past settings changes

---

## 13. Decisions Locked in Brainstorm

- **Q1 (scope):** 4 sections originally (Institution + Grades + Session + Support). Support was later removed in Q6 → final 3 sections.
- **Q2 (layout):** Two-column asymmetric originally. Changed to single-column centered after Q6 removed the Support card.
- **Q3 (institution fields):** Option C — Branding with 6 fields: Name + Logo + Timezone + Contact Email + Contact Phone + Address. 4 new DB columns + new storage bucket.
- **Q4 (grade boundaries):** Option D — Segmented EXAM/TEST toggle above a single grades table. Both sets loaded together, toggled in client state.
- **Q5 (session settings):** Option A — Single "Session Timeout" field only. Uses existing `session_timeout_seconds` column unchanged.
- **Q6 (support card):** REMOVED entirely. No Support/Help card on the page.
- **Q7 (save behavior):** Option D — Sticky footer save bar that appears on first edit and stays visible while scrolling. Single global Save Changes / Discard pair.
- **Q8 (danger zone):** Option A — No danger zone. Settings is configuration-only.

---

## Appendix A — Visual Reference

Browser mockup saved at:
- `.superpowers/brainstorm/223-1776020821/content/settings.html` — full page with all 3 sections + sticky save bar in the "dirty state" (3 unsaved changes across Institution & Grade Boundaries)

### Earlier specs referenced

- `2026-04-13-admin-dashboard-design.md` — source of the admin sidebar with Sign Out footer (shared across all admin pages)
- `2026-04-13-admin-create-assessment-flow-design.md` — pattern for section-card shells and tinted icon chips in form sections
- `2026-04-13-admin-assessments-list-design.md` — pattern for the EXAM/TEST segmented toggle (same visual treatment on both pages)
