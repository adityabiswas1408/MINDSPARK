# Student Profile — Design Spec

**Date:** 2026-04-14
**Scope:** A new read-only `/student/profile` page that replaces the existing placeholder shell. Renders the student's school record in a single card with a minimal hero, a default-visible **School Info** section, and a collapsible **More Info** section. No edits, no forms, no save flows. Also: removes the **Help & Support** entry from the student sidebar entirely (decision recorded in the v1 scope memo).
**Status:** Approved (visual mockup `student-profile.html` locked — 3 frames, with the Cohort field dropped post-render).
**Supersedes:** `src/app/(student)/student/profile/page.tsx` (current placeholder shell).

---

## 1. Goals

- Replace the placeholder profile shell with a clean, read-only student record card that explains itself in one glance.
- Lock the **view-only** stance: students cannot change anything from this page. All edits happen admin-side.
- Default to a **lean** identity surface (avatar + name + role + school basics) and tuck personal/guardian details behind a single **More Info** toggle that the student opens only when they need it.
- Render any nullable field that is empty as `Not mentioned` in italic muted style — never blank, never `—`, never a dash.
- Render the avatar from `profiles.avatar_url` when present and fall back to the student's **initials** on a forest-green disc when not.
- Use the standard `(student)/student` route group's sidebar + topbar shell, with **Profile** as the active sidebar item.
- Remove the **Help & Support** sidebar nav entry from the student shell — it was dropped from v1.

## 2. Non-goals

- **No editing of any field.** No avatar upload, no password change, no display-name edit, no field-level "edit" pencils. The page is intentionally read-only end-to-end.
- **No support contact form** on the profile page (or anywhere in the student shell — Help & Support is dropped from v1; see `project-v1-scope.md`).
- **No activity stats** on the profile page (exam count, average score, last login). The user explicitly chose the minimal hero in Q4 — stats live on the dashboard and the results pages, not here.
- **No mention of `cohort` or `cohort_id` anywhere** in the UI. The column stays in the database but is not rendered. (This is a deliberate de-scope from the original mockup.)
- **No password-reset UI** on the profile page. The `profiles.forced_password_reset` flag is handled by the **login flow** as a blocking modal at sign-in — that flow is a separate spec.
- **No "request a change" link, mailto, or contact form.** The page caption ("Contact your teacher to update any of these details.") is the only direction given — no clickable contact path inside the app.
- **No print / export** of the profile.
- **No mobile-specific layout pass.** The 720 px card centred in the main column scales down naturally on narrow screens; a dedicated mobile spec is out of scope.

---

## 3. New logic (locked decisions)

Five decisions are new and must be wired end-to-end.

### 3.1 View-only, period

- The page contains **zero `<form>`, `<input>`, or `<button type="submit">` elements**.
- The only interactive element on the page is the **More Info** disclosure toggle, which is a button that flips a local React state — it does not call any server action.
- Every value rendered comes directly from the server fetch. There is no client mutation path.

### 3.2 Default lean / collapsible More Info

- **Default-visible "School Info" block** contains exactly four fields, in this order:
  1. **Email** (from `profiles.email`)
  2. **Roll Number** (from `students.roll_number`) — required, see §3.5
  3. **Level** (from `levels.name` joined via `students.level_id`)
  4. **Grade Section** (from `students.grade_section`)
- **Collapsible "More Info" block** is hidden by default and contains six fields, in this order:
  1. **Date of Birth** (from `students.dob` — see §3.4 for `date_of_birth` reconciliation)
  2. **Gender** (from `students.gender`)
  3. **Guardian Name** (from `students.guardian_name`)
  4. **Guardian Email** (from `students.guardian_email`)
  5. **Guardian Phone** (from `students.guardian_phone`)
  6. **Consent** (from `students.consent_verified` — renders as the `Verified` pill or `Not verified` muted text)
- The toggle row uses a single chevron that rotates 180° when expanded. Both states render with the same row height; only the chevron orientation changes.
- The toggle's expanded/collapsed state is **client-side only** — it does NOT live in the URL, in `localStorage`, or in any server preference. Every visit lands in the collapsed state.

### 3.3 `Not mentioned` fallback contract

For every field that is nullable in the source schema, the renderer applies the same fallback:

| Source value | Rendered | CSS |
|---|---|---|
| Non-empty string / non-null primitive | The actual value | `.field-value` (default colour, normal weight) |
| `null`, `undefined`, or empty string `""` | The literal string `Not mentioned` | `.field-value.muted` (italic, `var(--text-subtle)`, weight 400) |

**Two sanctioned exceptions** to "always say Not mentioned":

1. **Avatar** — when `profiles.avatar_url` is null, render the student's **initials** on the green disc instead. Never say "Not mentioned" for the avatar.
2. **Consent** — when `students.consent_verified` is `false`, render the literal string `Not verified` (not `Not mentioned`) in the muted style. When it is `true`, render the green `Verified ✓` pill.

The `roll_number` field is NOT in this fallback set — see §3.5.

### 3.4 `dob` vs `date_of_birth` schema duplication

The `students` table currently has **two columns** that look like the same thing:

- `students.dob` (`date`, nullable)
- `students.date_of_birth` (`date`, nullable)

This duplication predates this spec. Until it is resolved by a separate cleanup (out of scope here), the profile page reads `dob` first and falls back to `date_of_birth` if `dob` is null:

```ts
const birthDate = student.dob ?? student.date_of_birth ?? null;
```

The renderer formats it as `DD MMM YYYY` (e.g. `14 Aug 2012`) using `Intl.DateTimeFormat`, no library. If both columns are null, the field falls through to `Not mentioned`.

A `TODO` comment in the page file flags the duplication for a future cleanup task. **GOTCHAS.md** also gets a note.

### 3.5 `roll_number` is required (NOT NULL)

The user has decided that **roll number is a required student field**. This means:

- The DB column must be `NOT NULL`. Currently it is `is_nullable: YES` — a one-line `ALTER TABLE` statement applied via the Supabase SQL editor flips it.
- The `Not mentioned` fallback contract from §3.3 does **not** apply to `roll_number`. The renderer treats it as a non-nullable string and TypeScript types it as `string` (not `string | null`).
- The admin **Create Student** flow already requires roll_number (verify in plan phase). If it does not, that admin form needs a follow-up to add server-side validation.
- **Backfill check (already verified, 2026-04-14):** `SELECT COUNT(*) FROM students WHERE roll_number IS NULL OR roll_number = '' AND deleted_at IS NULL` returns **0** in the live DB. The `NOT NULL` migration is safe with no backfill required.

---

## 4. Screens

Three frames in the approved mockup. All three render inside the standard `(student)/student` route group with the existing sidebar + topbar shell. The sidebar shows **Profile** as the active item; the **Help & Support** nav entry is removed.

### 4.1 Frame 1 — `/student/profile` (default state)

**Purpose:** Landing state. Hero strip + School Info section visible; More Info section collapsed.

- **Hero strip** — 32 px padding all around. 96 px circular avatar on the left with a 3 px `var(--clr-green-100)` ring. To the right: the student's **full name** at 26 px / 700, then a **role line** at 14 px / 500 reading `Student · Level <n>` (the dot is `var(--text-subtle)`).
- **School Info section** — separated from the hero by a 1 px `var(--slate-200)` divider. Padding `24px 32px`. Eyebrow `SCHOOL INFO` (11 px / 700 / uppercase / `0.1em` letter-spacing / `var(--text-subtle)`). Below it, a **2-column field grid** (`grid-template-columns: 1fr 1fr; column-gap: 32px; row-gap: 18px`) containing the four School Info fields in the order locked in §3.2.
- **More Info toggle row** — a full-width strip with `var(--bg-subtle)` background, top + bottom 1 px borders, padding `18px 32px`. Left: the label `MORE INFO` (same eyebrow style as the section title). Right: a 16 px chevron pointing down. The whole row is clickable; hover bumps the background to `var(--bg-hover)`.

### 4.2 Frame 2 — `/student/profile` · More Info expanded (full data)

**Purpose:** Same card, More Info section expanded. Demonstrates the layout when every field is populated.

- The **chevron is rotated 180°** (`transform: rotate(180deg)`) — same row, just the icon flipped.
- Below the toggle row: the **More Info section** — padding `24px 32px 32px`, white background, no top divider (the toggle row's bottom border serves as the divider). Same 2-column field grid as School Info.
- The Consent field renders as the green `Verified` pill (an inline-flex chip with the `Check` icon, padding `3px 10px`, `var(--clr-green-50)` background, `var(--clr-green-200)` border, `var(--clr-green-700)` text).
- All other More Info fields render in the default `.field-value` style — the actual values, not the fallback.

### 4.3 Frame 3 — `/student/profile` · null-heavy state

**Purpose:** Demonstrate the `Not mentioned` fallback styling when most More Info fields and one School Info field are null.

- **School Info section:** the only null-able fields here are `grade_section` (renders as `Not mentioned`). Every other School Info field is populated. **`Roll Number` is never `Not mentioned`** because it is `NOT NULL` per §3.5 — it always renders an actual value.
- **More Info section:** five out of six fields render `Not mentioned` in italic muted style. The Consent field renders `Not verified` in the same muted style (no green pill).
- The avatar still falls back to **initials** (e.g. `RK` for `Rohan Kumar`) — never `Not mentioned`.
- Page caption is unchanged from the populated state: *"Your school record. Contact your teacher to update any of these details."*

---

## 5. The `<ProfileCard>` component contract

A single client component that takes the assembled student record and renders the full card from §4.1–§4.3. Co-located with the page.

```tsx
type ProfileCardProps = {
  fullName: string;          // students.full_name (NOT NULL)
  rollNumber: string;        // students.roll_number (NOT NULL after §3.5)
  email: string;             // profiles.email (NOT NULL)
  levelName: string;         // levels.name joined via students.level_id
  gradeSection: string | null;
  avatarUrl: string | null;  // profiles.avatar_url
  initials: string;          // computed server-side from fullName (first chars of first 2 words)
  // More Info fields
  dob: string | null;        // already reconciled from `dob ?? date_of_birth` per §3.4
  gender: string | null;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianPhone: string | null;
  consentVerified: boolean;
};
```

- Local React `useState<boolean>(false)` for the More Info toggle. No URL state, no localStorage.
- A small helper `valueOrFallback(v: string | null): { node: ReactNode; isMuted: boolean }` enforces the §3.3 contract uniformly.
- The Consent field has its own renderer because of the pill / `Not verified` split.
- The DOB field formats with `Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })` to match the locale used elsewhere in the app.

The component file is `src/components/profile/profile-card.tsx`. Its sibling test file is `src/components/profile/profile-card.test.tsx` and covers the §3.3 fallback contract, the §3.5 non-null roll number expectation, and the §3.2 toggle behaviour.

---

## 6. Routes

```
src/app/(student)/student/profile/
  page.tsx                    ← server component, full rewrite
  loading.tsx                 ← skeleton (NEW)
```

- `page.tsx` is a Server Component that calls `requireRole('student')` and fetches the joined student record (see §7).
- `loading.tsx` renders a single skeleton card matching the layout: a 96 px circle on the left, two text bars on the right, then four greyed field rows and a toggle bar below.
- Both files live in the existing `(student)/student` route group — no new layout, no new shell.

The current placeholder file at `src/app/(student)/student/profile/page.tsx` is **fully replaced**.

---

## 7. Server-side data fetch

A single Server Component query joins `profiles`, `students`, and `levels`:

```ts
const { data: profile } = await supabase
  .from('profiles')
  .select(`
    id, email, full_name, avatar_url,
    student:students!inner (
      roll_number, grade_section,
      dob, date_of_birth, gender,
      guardian_name, guardian_email, guardian_phone,
      consent_verified,
      level:levels!inner ( name )
    )
  `)
  .eq('id', auth.userId)
  .maybeSingle();
```

- The query uses `!inner` joins on both `students` and `levels` because every authenticated student must have a corresponding student row and level. If either is missing, the query returns null and the page renders a 404.
- `cohort_id` and `cohort:cohorts(...)` are deliberately **not selected**.
- No N+1 — single round trip.

Initials are computed on the server before passing to the client component:

```ts
function computeInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
```

This keeps the client component free of derivation logic.

---

## 8. Database changes

Two changes. One is a `NOT NULL` constraint flip; the other is a documentation note.

### 8.1 `students.roll_number` → `NOT NULL`

```sql
-- Pre-flight: verified 2026-04-14, returns 0 in live DB
SELECT COUNT(*) FROM students
WHERE (roll_number IS NULL OR roll_number = '')
  AND deleted_at IS NULL;

-- Apply
ALTER TABLE students ALTER COLUMN roll_number SET NOT NULL;
```

- **No backfill required** — the live DB has 0 rows missing `roll_number` (verified 2026-04-14).
- The `ALTER` is safe to run on a live table because the constraint check is fast on a column that is already populated.
- Per CLAUDE.md, no migration file — apply via the Supabase SQL editor and record in `db/sql-editor/2026-04-14-student-profile-roll-required.sql`.
- The admin **Create Student** form must be verified to already require `roll_number` (with client + server validation). If it does not, that is a follow-up plan task in the admin students flow plan, NOT here.

### 8.2 GOTCHAS.md note about `dob` / `date_of_birth` duplication

The `students` table has two columns for the same concept — `dob` and `date_of_birth`. This spec reads `dob ?? date_of_birth` and does not pick a side. A future cleanup task should deprecate one of them, but doing so is out of scope here. GOTCHAS.md gets a one-paragraph note pointing at this spec.

### 8.3 No new columns

This spec adds zero new columns. `cohort_id` is not removed (it stays in the schema for any non-UI consumer); the spec just stops surfacing it in the UI.

---

## 9. Sidebar nav update

The student sidebar currently lists, in order: Dashboard / Exams / Tests / My Results / Profile / Help & Support. As part of this spec:

- **Remove** the `Help & Support` nav item from the student sidebar component entirely. The component file (likely `src/components/student/sidebar.tsx` — verify in plan phase) loses the Help & Support `<NavItem>`.
- **Verify** the `Profile` nav item links to `/student/profile`.
- **Confirm** that the active-item highlight (the green left rail + tinted background) renders correctly when the route is `/student/profile`.

The same change applies to any HTML mockup files that are still living in `.superpowers/brainstorm/` if they are referenced by future renders. The mockup files themselves are not authoritative; the React sidebar component is.

---

## 10. Empty / not-found states

| State | When | UI |
|---|---|---|
| **Profile loaded normally** | The Server Component query returns a row | Frames 1–3 |
| **Student row missing** (`students!inner` join fails) | Auth user has a `profiles` row but no `students` row | `notFound()` → Next.js 404 |
| **Profile column NULL** | Any nullable field is empty | `Not mentioned` fallback per §3.3 |
| **Avatar URL NULL** | `profiles.avatar_url IS NULL` | Initials on the green disc |
| **Loading** | Server Component is fetching | `loading.tsx` skeleton (single card with avatar circle + text bars) |

There is **no error toast or pill** for fetch errors. If the query returns an error, the page falls through to `notFound()`. This matches the existing pattern on the results detail page.

---

## 11. Testing

### Unit (Vitest + jsdom)
- `<ProfileCard>` renders the full hero strip (avatar with `AS` initials, name `Aditi Sharma`, role line `Student · Level 3`) when given a populated student.
- `<ProfileCard>` renders `Not mentioned` in the muted style for any null More Info field.
- `<ProfileCard>` renders the green `Verified` pill when `consentVerified === true`.
- `<ProfileCard>` renders `Not verified` in the muted style when `consentVerified === false`.
- The More Info toggle starts collapsed and toggles open / closed when the row is clicked.
- The `valueOrFallback()` helper returns `{ node: 'Not mentioned', isMuted: true }` for `null`, `undefined`, and `''`, and returns `{ node: 'foo', isMuted: false }` for `'foo'`.
- `computeInitials('Aditi Sharma') === 'AS'`, `computeInitials('Rohan') === 'R'`, `computeInitials('Mary Anne O\'Brien') === 'MA'`.

### Integration (vitest with `vitest.config.integration.ts`)
- The `page.tsx` Server Component fetches a profile only for the authenticated user — cross-tenant requests return 404.
- The query returns null when the inner join fails (no student row for an auth user) and the page returns 404.

### E2E (Playwright)
- `student-profile.spec.ts` — covers:
  1. Logged-in student sees their profile with the populated card (Frame 1)
  2. Clicking **More Info** expands the section and shows the additional fields (Frame 2)
  3. Clicking **More Info** again collapses it
  4. The sidebar shows **Profile** as active and does **not** show a Help & Support entry
  5. A null-heavy student record renders `Not mentioned` for the affected fields (Frame 3)

---

## 12. Open questions for the plan phase

None block the spec.

1. **Help & Support removal from React sidebar.** The spec says "remove from the sidebar component". Confirm the exact file path (`src/components/student/sidebar.tsx` or wherever the student nav lives) before editing. The plan phase will grep for it.
2. **`dob` vs `date_of_birth`.** Both columns exist. This spec reads with a fallback. A future cleanup task should pick one. Out of scope here but flagged in §3.4 and §8.2.
3. **Admin Create Student validation.** The DB now enforces `roll_number NOT NULL`. The admin create-student form must already validate this client-side AND server-side. Plan phase will grep `src/app/actions/students.ts` (or wherever) to confirm.
4. **`forced_password_reset` flow.** Out of scope here, but worth noting: the `profiles.forced_password_reset` flag has no UI handler anywhere in this spec. If the flag is true today, the student lands on `/student/profile` with no indication anything is off. A separate spec for the login-flow blocking modal should pick this up.

---

## 13. Approved visual reference

- **Mockup:** `.superpowers/brainstorm/362-1776136481/content/student-profile.html`
- **Frames:** 3 total (default state, More Info expanded with full data, null-heavy fallback state).
- **Approved by:** user, 2026-04-14 session.
- **Post-render adjustments:**
  - **Cohort field dropped** from the spec — never rendered, never queried. The mockup's School Info section had Cohort as one of its fields; the spec drops it entirely so the section now has 4 fields (Email, Roll Number, Level, Grade Section). The mockup file itself was not re-rendered per user direction.
  - **Roll Number is required** (NOT NULL via the §8.1 ALTER) — never falls back to `Not mentioned`.
- **Help & Support sidebar nav entry:** removed in the spec, present in the mockup. The spec is authoritative.
