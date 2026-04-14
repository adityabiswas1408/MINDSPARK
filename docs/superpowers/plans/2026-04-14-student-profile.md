# Student Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 224-line placeholder shell at `src/app/(student)/student/profile/page.tsx` with a single read-only Profile card — minimal hero (avatar + name + role line), default-visible **School Info** section, and a collapsible **More Info** section. Cohort field is never rendered. `roll_number` becomes `NOT NULL`. The dangling `Support` nav entry is removed from the student sidebar.

**Architecture:** One Server Component (`page.tsx`) does a single inner-join query against `profiles → students → levels`, computes initials server-side, and passes a flat props object to one Client Component (`ProfileCard`). Two pure helper functions (`valueOrFallback`, `computeInitials`) live in a co-located helpers file with their own Vitest specs. CSS is added to `globals.css`. The DB change is one `ALTER TABLE` statement applied via the Supabase SQL editor — pre-flight verified that 0 rows would block it.

**Tech Stack:** Next.js 15 (App Router, Server Components), TypeScript, React 19, Supabase (PostgreSQL), Tailwind v4, lucide-react, Vitest + jsdom, Playwright. No `setTimeout`/`setInterval` (no need — there's no timer logic). The only client interaction is a `useState<boolean>` toggle for the More Info disclosure.

**Source spec:** `docs/superpowers/specs/2026-04-14-student-profile-design.md`
**Approved visual:** `docs/design-mockups/student-profile.html`

---

## File Map

### New files

| Path | Responsibility |
|---|---|
| `src/components/profile/profile-card.tsx` | Client Component — hero strip + School Info + collapsible More Info |
| `src/components/profile/profile-card.test.tsx` | Vitest specs for the card behaviour |
| `src/components/profile/profile-helpers.ts` | Pure helpers: `valueOrFallback`, `computeInitials`, `formatBirthDate` |
| `src/components/profile/profile-helpers.test.ts` | Vitest specs for the helpers |
| `src/app/(student)/student/profile/loading.tsx` | Skeleton matching the card layout |
| `db/sql-editor/2026-04-14-student-profile-roll-required.sql` | One-statement SQL run book |
| `tests/e2e/student-profile.spec.ts` | Playwright e2e covering Frames 1–3 + sidebar |

### Modified files

| Path | Change |
|---|---|
| `src/app/(student)/student/profile/page.tsx` | **Full rewrite** — was a 224-line placeholder shell; becomes a Server Component that queries `profiles → students → levels`, computes initials, and renders `<ProfileCard>` |
| `src/components/layout/student-sidebar.tsx` | Remove the `Support` nav entry on line 21 + remove the now-unused `HelpCircle` import on line 7 |
| `src/app/globals.css` | Add the `.profile-card`, `.profile-hero`, `.profile-section`, `.field-grid`, `.more-info-toggle`, `.verified-pill` style block |
| `GOTCHAS.md` | One-paragraph note about the `dob` / `date_of_birth` column duplication |

---

## Sacred-rule guardrails (read before any task)

These apply to **every** task in this plan:

- **`requireRole('student')` on the Server Component** — never trust client-side role; always re-check on the server.
- **`src/lib/supabase/admin.ts` is BANNED** in this entire plan. The profile page is inside the `(student)/` route group and reads only its own student's data. Use `src/lib/supabase/server.ts` (the user-scoped server client) for the data fetch.
- **No `setTimeout` / `setInterval`** anywhere in any file touched by this plan. The only interaction is a click toggle — pure React state.
- **No editable surface.** No `<form>`, no `<input>`, no `<button type="submit">`. The only button is the More Info toggle, which calls `setExpanded(!expanded)` and nothing else.
- **No native `alert()` / `confirm()`.** Not relevant here (no error toasts needed) but reaffirmed in case temptation arises.
- **No hardcoded hex colours in components** — use `var(--token-name)` from `globals.css`. The single sanctioned exception across the whole project is `#991B1B` for negative arithmetic flash numbers, which is irrelevant here. Profile must use only tokens.
- **No new Supabase migration files** — the one DB change goes through the SQL editor and is recorded in `db/sql-editor/`.
- **`npm run tsc` must report 0 errors** before every commit.
- **Never read `students.cohort_id` or `cohorts.*`** anywhere in this plan. The column stays in the DB; the new code does not select it, query it, type it, or render it.
- **Pre-flight every `UPDATE` / `INSERT` / `ALTER` with a matching `SELECT`** (per CLAUDE.md DB Mutations rule). Already verified for the one `ALTER` in this plan, but the verification command is repeated as Step 1.1 so the implementing engineer re-runs it.
- **Visual fidelity protocol:** when a task implements a UI frame from the approved mockup, port the mockup's CSS verbatim into a colocated CSS file (e.g. `./profile-card.css` next to the component) and use the mockup's class names in JSX (`<div className="profile-card">`, not `<div className="rounded-xl border">`). Do **NOT** re-express the mockup as Tailwind utility classes — translation is where drift happens. Do **NOT** substitute shadcn components (`Card`, `Avatar`, `Separator`) for mockup-styled divs. `Button` from shadcn is the sanctioned exception, but this plan doesn't need it (profile is read-only — no buttons except the More Info toggle which is a styled `<button>`). The mockup lives at `docs/design-mockups/student-profile.html` and the 3 frames (default, expanded, null-heavy) in the tasks below refer to specific sections of that file. The test of correctness is: open the mockup and the dev server side-by-side and confirm they render identically at 100% zoom before marking any task complete.

---

## Task 1: DB column — `students.roll_number` → `NOT NULL`

**Files:**
- Create: `db/sql-editor/2026-04-14-student-profile-roll-required.sql`
- Modify (after manual SQL run): `GOTCHAS.md`

- [ ] **Step 1.1: Pre-flight verification (rerun before applying)**

Run in the Supabase SQL editor:

```sql
SELECT COUNT(*) AS missing_roll
FROM students
WHERE (roll_number IS NULL OR roll_number = '')
  AND deleted_at IS NULL;
```

Expected: `missing_roll = 0`. If it is non-zero, **stop** and reach out to admin to backfill the missing rows manually before continuing — do not invent values.

- [ ] **Step 1.2: Verify the current nullability state**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'roll_number';
```

Expected: one row, `text`, `is_nullable = YES`. If it already says `NO`, the change has been applied previously — skip Steps 1.3–1.4 and jump to Step 1.5.

- [ ] **Step 1.3: Write the SQL run book**

Create `db/sql-editor/2026-04-14-student-profile-roll-required.sql`:

```sql
-- Run via Supabase SQL editor on project ahrnkwuqlhmwenhvnupb.
-- Spec: docs/superpowers/specs/2026-04-14-student-profile-design.md
-- Date: 2026-04-14

-- ─── Pre-flight (already verified 2026-04-14, repeat before applying) ──
SELECT COUNT(*) AS missing_roll
FROM students
WHERE (roll_number IS NULL OR roll_number = '')
  AND deleted_at IS NULL;
-- Expected: 0

-- ─── Apply ────────────────────────────────────────────────────────────
ALTER TABLE students ALTER COLUMN roll_number SET NOT NULL;

-- ─── Verification ─────────────────────────────────────────────────────
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'roll_number';
-- Expected: roll_number | text | NO
```

- [ ] **Step 1.4: Run the SQL in the Supabase editor**

Open the Supabase dashboard for project `ahrnkwuqlhmwenhvnupb` → SQL editor → paste the file → Run.

Expected verification output:

```
roll_number | text | NO
```

If it does not flip to `NO`, stop and investigate before continuing.

- [ ] **Step 1.5: Document the change + the `dob`/`date_of_birth` quirk in GOTCHAS.md**

Append under the database section of `GOTCHAS.md`:

```
- 2026-04-14: students.roll_number flipped from nullable to NOT NULL via SQL editor
  (no migration file). Pre-flight confirmed 0 affected rows. The /student/profile
  page now treats roll_number as a non-nullable string. The admin Create Student
  flow must already require this — verify in any future students-flow plan.
  See db/sql-editor/2026-04-14-student-profile-roll-required.sql.
- 2026-04-14: students table has TWO date-of-birth columns — `dob` and `date_of_birth`.
  This duplication predates the profile spec. The profile page reads
  `dob ?? date_of_birth`. A future cleanup task should pick one. Until then, do not
  drop either column and do not assume either is canonical.
```

- [ ] **Step 1.6: Validator**

```bash
# 1. SQL file exists
test -f db/sql-editor/2026-04-14-student-profile-roll-required.sql && echo OK

# 2. GOTCHAS.md was updated
grep -q "students.roll_number flipped from nullable to NOT NULL" GOTCHAS.md && echo OK

# 3. (Manual) re-run Step 1.2 query in Supabase — confirm is_nullable = NO
```

- [ ] **Step 1.7: Commit**

```bash
git add db/sql-editor/2026-04-14-student-profile-roll-required.sql GOTCHAS.md
git commit -m "db(students): roll_number NOT NULL + dob/date_of_birth note"
```

---

## Task 2: Helper functions (TDD)

**Files:**
- Create: `src/components/profile/profile-helpers.ts`
- Create: `src/components/profile/profile-helpers.test.ts`

Three pure functions:
- `valueOrFallback(v: string | null | undefined): { node: string; isMuted: boolean }` — enforces the §3.3 fallback contract from the spec
- `computeInitials(fullName: string): string` — first character of the first two words, uppercased
- `formatBirthDate(dob: string | null, dateOfBirth: string | null): string | null` — reconciles the two columns and formats with `Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })`

- [ ] **Step 2.1: Write the failing test (RED)**

Create `src/components/profile/profile-helpers.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { valueOrFallback, computeInitials, formatBirthDate } from './profile-helpers';

describe('valueOrFallback', () => {
  it('returns the value as-is when truthy', () => {
    expect(valueOrFallback('Aditi Sharma')).toEqual({
      node: 'Aditi Sharma',
      isMuted: false,
    });
  });

  it('returns "Not mentioned" when null', () => {
    expect(valueOrFallback(null)).toEqual({
      node: 'Not mentioned',
      isMuted: true,
    });
  });

  it('returns "Not mentioned" when undefined', () => {
    expect(valueOrFallback(undefined)).toEqual({
      node: 'Not mentioned',
      isMuted: true,
    });
  });

  it('returns "Not mentioned" when an empty string', () => {
    expect(valueOrFallback('')).toEqual({
      node: 'Not mentioned',
      isMuted: true,
    });
  });
});

describe('computeInitials', () => {
  it('returns first chars of the first two words', () => {
    expect(computeInitials('Aditi Sharma')).toBe('AS');
  });

  it('returns single char for a single-word name', () => {
    expect(computeInitials('Rohan')).toBe('R');
  });

  it('caps at two chars even when the name has more words', () => {
    expect(computeInitials('Mary Anne O Brien')).toBe('MA');
  });

  it('uppercases the result', () => {
    expect(computeInitials('aditi sharma')).toBe('AS');
  });

  it('handles extra whitespace', () => {
    expect(computeInitials('  Aditi   Sharma  ')).toBe('AS');
  });

  it('returns empty string for empty input', () => {
    expect(computeInitials('')).toBe('');
  });
});

describe('formatBirthDate', () => {
  it('formats dob when present', () => {
    expect(formatBirthDate('2012-08-14', null)).toBe('14 Aug 2012');
  });

  it('falls back to date_of_birth when dob is null', () => {
    expect(formatBirthDate(null, '2010-03-05')).toBe('05 Mar 2010');
  });

  it('prefers dob over date_of_birth when both are present', () => {
    expect(formatBirthDate('2012-08-14', '2010-03-05')).toBe('14 Aug 2012');
  });

  it('returns null when both are null', () => {
    expect(formatBirthDate(null, null)).toBeNull();
  });
});
```

- [ ] **Step 2.2: Run the test to confirm it fails**

```bash
npx vitest run src/components/profile/profile-helpers.test.ts
```

Expected: every test fails with `Cannot find module './profile-helpers'`.

- [ ] **Step 2.3: Write the minimal implementation (GREEN)**

Create `src/components/profile/profile-helpers.ts`:

```ts
export type FieldValue = { node: string; isMuted: boolean };

export function valueOrFallback(v: string | null | undefined): FieldValue {
  if (v == null || v === '') {
    return { node: 'Not mentioned', isMuted: true };
  }
  return { node: v, isMuted: false };
}

export function computeInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ?? '').toUpperCase())
    .join('');
}

export function formatBirthDate(
  dob: string | null,
  dateOfBirth: string | null,
): string | null {
  const raw = dob ?? dateOfBirth;
  if (raw == null) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
```

- [ ] **Step 2.4: Run the test to confirm it passes**

```bash
npx vitest run src/components/profile/profile-helpers.test.ts
npm run tsc
```

Expected: 14 tests pass, 0 type errors.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/profile/profile-helpers.ts \
        src/components/profile/profile-helpers.test.ts
git commit -m "feat(profile): valueOrFallback, computeInitials, formatBirthDate helpers"
```

---

## Task 3: `<ProfileCard>` Client Component (TDD) + CSS

**Files:**
- Create: `src/components/profile/profile-card.tsx`
- Create: `src/components/profile/profile-card.test.tsx`
- Modify: `src/app/globals.css`

This is the single-card UI from Frames 1–3. Pure props in, pure JSX out, plus one local `useState<boolean>` for the More Info toggle.

- [ ] **Step 3.1: Add the CSS to `globals.css`**

Append (or insert in the appropriate component-styles section) the following block to `src/app/globals.css`:

```css
/* ══════════════ Student profile card ══════════════ */
.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  max-width: 720px;
  overflow: hidden;
}
.profile-hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px 32px 28px;
}
.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background: var(--clr-green-800);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  flex-shrink: 0;
  border: 3px solid var(--clr-green-100);
  overflow: hidden;
}
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-identity { min-width: 0; }
.profile-name {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.012em;
  margin-bottom: 4px;
  line-height: 1.2;
}
.profile-role {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.profile-role .dot { color: var(--text-subtle); }

.profile-section {
  border-top: 1px solid var(--slate-200);
  padding: 24px 32px;
}
.profile-section .section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-subtle);
  margin-bottom: 16px;
}
.profile-card .field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 32px;
  row-gap: 18px;
}
.profile-card .field-row { min-width: 0; }
.profile-card .field-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.profile-card .field-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-word;
}
.profile-card .field-value.mono {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-variant-numeric: tabular-nums;
}
.profile-card .field-value.muted {
  color: var(--text-subtle);
  font-style: italic;
  font-weight: 400;
}
.profile-card .verified-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: var(--clr-green-50);
  color: var(--clr-green-700);
  border: 1px solid var(--clr-green-200);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
}
.profile-card .verified-pill svg { width: 12px; height: 12px; stroke-width: 2.5; }

.more-info-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px;
  background: var(--bg-subtle);
  border-top: 1px solid var(--slate-200);
  border-bottom: 1px solid var(--slate-200);
  cursor: pointer;
  user-select: none;
  width: 100%;
  font-family: inherit;
  border-left: 0;
  border-right: 0;
}
.more-info-toggle:hover { background: var(--bg-hover); }
.more-info-toggle .label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}
.more-info-toggle .chevron {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  stroke-width: 2;
  transition: transform 0.2s ease;
}
.more-info-toggle.expanded .chevron { transform: rotate(180deg); }
.more-info-section {
  padding: 24px 32px 32px;
  background: var(--bg-card);
}
```

Run `npm run dev` briefly and load any page to confirm the CSS parses without warnings, then kill the dev server.

- [ ] **Step 3.2: Write the failing test (RED)**

Create `src/components/profile/profile-card.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProfileCard } from './profile-card';

const fullProps = {
  fullName: 'Aditi Sharma',
  rollNumber: '2024-A-15',
  email: 'aditi.sharma@stxavier.edu.in',
  levelName: 'Level 3',
  gradeSection: 'Grade 8 — Section A',
  avatarUrl: null,
  initials: 'AS',
  dob: '14 Aug 2012',
  gender: 'Female',
  guardianName: 'Rajesh Sharma',
  guardianEmail: 'rajesh.sharma@gmail.com',
  guardianPhone: '+91 98765 43210',
  consentVerified: true,
};

const sparseProps = {
  ...fullProps,
  fullName: 'Rohan Kumar',
  initials: 'RK',
  email: 'rohan.kumar@stxavier.edu.in',
  rollNumber: '2026-B-04',
  gradeSection: null,
  dob: null,
  gender: null,
  guardianName: null,
  guardianEmail: null,
  guardianPhone: null,
  consentVerified: false,
};

describe('<ProfileCard>', () => {
  it('renders the hero strip with initials when avatarUrl is null', () => {
    render(<ProfileCard {...fullProps} />);
    expect(screen.getByText('AS')).toBeDefined();
    expect(screen.getByText('Aditi Sharma')).toBeDefined();
    expect(screen.getByText(/Level 3/)).toBeDefined();
  });

  it('renders an <img> for the avatar when avatarUrl is set', () => {
    const { container } = render(
      <ProfileCard {...fullProps} avatarUrl="https://example.com/me.jpg" />
    );
    const img = container.querySelector('.profile-avatar img') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.src).toContain('me.jpg');
  });

  it('renders all four School Info fields by default', () => {
    render(<ProfileCard {...fullProps} />);
    expect(screen.getByText('aditi.sharma@stxavier.edu.in')).toBeDefined();
    expect(screen.getByText('2024-A-15')).toBeDefined();
    expect(screen.getByText('Grade 8 — Section A')).toBeDefined();
    // The role line already contains "Level 3", so we look inside the field grid:
    const fieldValues = screen.getAllByText(/Level 3/);
    expect(fieldValues.length).toBeGreaterThanOrEqual(2);
  });

  it('starts with More Info collapsed (DOB not visible)', () => {
    render(<ProfileCard {...fullProps} />);
    expect(screen.queryByText('14 Aug 2012')).toBeNull();
  });

  it('expands More Info when the toggle is clicked', () => {
    render(<ProfileCard {...fullProps} />);
    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    expect(screen.getByText('14 Aug 2012')).toBeDefined();
    expect(screen.getByText('Female')).toBeDefined();
    expect(screen.getByText('Rajesh Sharma')).toBeDefined();
  });

  it('collapses More Info on a second click', () => {
    render(<ProfileCard {...fullProps} />);
    const toggle = screen.getByRole('button', { name: /more info/i });
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(screen.queryByText('14 Aug 2012')).toBeNull();
  });

  it('renders the green Verified pill when consentVerified is true', () => {
    render(<ProfileCard {...fullProps} />);
    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    expect(screen.getByText('Verified')).toBeDefined();
  });

  it('renders "Not verified" muted when consentVerified is false', () => {
    render(<ProfileCard {...sparseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    expect(screen.getByText('Not verified')).toBeDefined();
    expect(screen.queryByText('Verified')).toBeNull();
  });

  it('renders "Not mentioned" for null More Info fields', () => {
    render(<ProfileCard {...sparseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    // sparseProps has 6 nulls total that render as "Not mentioned":
    // - 1 in School Info (gradeSection)
    // - 5 in More Info (dob, gender, guardianName, guardianEmail, guardianPhone)
    // Consent renders as "Not verified", which is NOT counted here.
    const muted = screen.getAllByText('Not mentioned');
    expect(muted.length).toBe(6);
  });

  it('renders "Not mentioned" for a null gradeSection in School Info', () => {
    render(<ProfileCard {...sparseProps} />);
    expect(screen.getByText('Not mentioned')).toBeDefined();
  });
});
```

- [ ] **Step 3.3: Run the test to confirm it fails**

```bash
npx vitest run src/components/profile/profile-card.test.tsx
```

Expected: every test fails with `Cannot find module './profile-card'`.

- [ ] **Step 3.4: Write the implementation (GREEN)**

Create `src/components/profile/profile-card.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { valueOrFallback } from './profile-helpers';

export type ProfileCardProps = {
  fullName: string;
  rollNumber: string;
  email: string;
  levelName: string;
  gradeSection: string | null;
  avatarUrl: string | null;
  initials: string;
  dob: string | null;
  gender: string | null;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianPhone: string | null;
  consentVerified: boolean;
};

function FieldRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  const { node, isMuted } = valueOrFallback(value);
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      <div className={`field-value${mono ? ' mono' : ''}${isMuted ? ' muted' : ''}`}>
        {node}
      </div>
    </div>
  );
}

function ConsentField({ verified }: { verified: boolean }) {
  return (
    <div className="field-row">
      <div className="field-label">Consent</div>
      <div className={`field-value${verified ? '' : ' muted'}`}>
        {verified ? (
          <span className="verified-pill">
            <Check />
            Verified
          </span>
        ) : (
          'Not verified'
        )}
      </div>
    </div>
  );
}

export function ProfileCard(props: ProfileCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="profile-card">
      <div className="profile-hero">
        <div className="profile-avatar">
          {props.avatarUrl ? (
            <img src={props.avatarUrl} alt={props.fullName} />
          ) : (
            props.initials
          )}
        </div>
        <div className="profile-identity">
          <div className="profile-name">{props.fullName}</div>
          <div className="profile-role">
            <span>Student</span>
            <span className="dot">·</span>
            <span>{props.levelName}</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <div className="section-title">School Info</div>
        <div className="field-grid">
          <FieldRow label="Email" value={props.email} />
          <FieldRow label="Roll Number" value={props.rollNumber} mono />
          <FieldRow label="Level" value={props.levelName} />
          <FieldRow label="Grade Section" value={props.gradeSection} />
        </div>
      </div>

      <button
        type="button"
        className={`more-info-toggle${expanded ? ' expanded' : ''}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="label">More Info</span>
        <ChevronDown className="chevron" />
      </button>

      {expanded && (
        <div className="more-info-section">
          <div className="field-grid">
            <FieldRow label="Date of Birth" value={props.dob} mono />
            <FieldRow label="Gender" value={props.gender} />
            <FieldRow label="Guardian Name" value={props.guardianName} />
            <FieldRow label="Guardian Email" value={props.guardianEmail} />
            <FieldRow label="Guardian Phone" value={props.guardianPhone} mono />
            <ConsentField verified={props.consentVerified} />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3.5: Run the tests + tsc**

```bash
npx vitest run src/components/profile/profile-card.test.tsx
npm run tsc
```

Expected: 10 tests pass, 0 type errors.

- [ ] **Step 3.6: Commit**

```bash
git add src/components/profile/profile-card.tsx \
        src/components/profile/profile-card.test.tsx \
        src/app/globals.css
git commit -m "feat(profile): ProfileCard component with collapsible More Info"
```

---

## Task 4: Server Component page rewrite

**Files:**
- Modify: `src/app/(student)/student/profile/page.tsx`

The current file is a 224-line placeholder shell. **Full rewrite.** The new page is a Server Component that joins `profiles → students → levels`, computes initials, and renders `<ProfileCard>` inside a page header.

- [ ] **Step 4.1: Read the existing file first**

Open `src/app/(student)/student/profile/page.tsx` and skim it. Note any imports or patterns that are reused elsewhere (specifically: confirm whether `requireRole` and `createClient` come from `@/lib/auth/rbac` and `@/lib/supabase/server` respectively — same pattern as `src/app/(student)/layout.tsx`).

- [ ] **Step 4.2: Write the new page (full rewrite)**

Replace the entire contents of `src/app/(student)/student/profile/page.tsx` with:

```tsx
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';
import { ProfileCard } from '@/components/profile/profile-card';
import { computeInitials, formatBirthDate } from '@/components/profile/profile-helpers';

type ProfileRow = {
  email: string;
  full_name: string;
  avatar_url: string | null;
  student: {
    roll_number: string;
    grade_section: string | null;
    dob: string | null;
    date_of_birth: string | null;
    gender: string | null;
    guardian_name: string | null;
    guardian_email: string | null;
    guardian_phone: string | null;
    consent_verified: boolean;
    level: { name: string };
  };
};

export default async function StudentProfilePage() {
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      email,
      full_name,
      avatar_url,
      student:students!inner (
        roll_number,
        grade_section,
        dob,
        date_of_birth,
        gender,
        guardian_name,
        guardian_email,
        guardian_phone,
        consent_verified,
        level:levels!inner ( name )
      )
    `)
    .eq('id', auth.userId)
    .maybeSingle<ProfileRow>();

  if (error || !profile) notFound();

  return (
    <main>
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}
        >
          Profile
        </h1>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          Your school record. Contact your teacher to update any of these details.
        </p>
      </header>

      <ProfileCard
        fullName={profile.full_name}
        rollNumber={profile.student.roll_number}
        email={profile.email}
        levelName={profile.student.level.name}
        gradeSection={profile.student.grade_section}
        avatarUrl={profile.avatar_url}
        initials={computeInitials(profile.full_name)}
        dob={formatBirthDate(profile.student.dob, profile.student.date_of_birth)}
        gender={profile.student.gender}
        guardianName={profile.student.guardian_name}
        guardianEmail={profile.student.guardian_email}
        guardianPhone={profile.student.guardian_phone}
        consentVerified={profile.student.consent_verified}
      />
    </main>
  );
}
```

**Important about the query shape:** Supabase's PostgREST returns nested relations as either an object or an array depending on join cardinality. The `students!inner` and `levels!inner` joins return single objects (1-to-1 relationships), so the local `ProfileRow` type matches. If `tsc` complains that `student` is an array, **do not** flatten with `[0]` — instead change the relation hint to `students!students_id_fkey` or similar, and verify the join cardinality with the user before patching.

- [ ] **Step 4.3: Validator**

```bash
npm run tsc
npm run lint
```

Expected: 0 type errors, 0 lint warnings.

Manual smoke test:

```bash
npm run dev
```

Then in a browser, log in as a student (test credentials live in `feedback-patterns.md` memory or in CLAUDE.md tooling refs) and navigate to `/student/profile`. Confirm:
- The page renders the hero card with initials
- The four School Info fields are visible
- Clicking **More Info** expands it and shows the six More Info fields
- Clicking again collapses it
- No console errors
- No `Cohort` field anywhere

Stop the dev server.

- [ ] **Step 4.4: Commit**

```bash
git add "src/app/(student)/student/profile/page.tsx"
git commit -m "feat(profile): Server Component page with profiles+students+levels join"
```

---

## Task 5: Loading skeleton

**Files:**
- Create: `src/app/(student)/student/profile/loading.tsx`

- [ ] **Step 5.1: Write the skeleton**

Create `src/app/(student)/student/profile/loading.tsx`:

```tsx
export default function StudentProfileLoading() {
  return (
    <main>
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 96,
            height: 22,
            background: 'var(--slate-200)',
            borderRadius: 6,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            width: 320,
            height: 13,
            background: 'var(--slate-100)',
            borderRadius: 4,
          }}
        />
      </header>

      <div className="profile-card">
        <div className="profile-hero">
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 9999,
              background: 'var(--slate-200)',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: 240,
                height: 26,
                background: 'var(--slate-200)',
                borderRadius: 6,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                width: 140,
                height: 14,
                background: 'var(--slate-100)',
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        <div className="profile-section">
          <div
            style={{
              width: 80,
              height: 11,
              background: 'var(--slate-200)',
              borderRadius: 3,
              marginBottom: 16,
            }}
          />
          <div className="field-grid">
            {[0, 1, 2, 3].map((i) => (
              <div className="field-row" key={i}>
                <div
                  style={{
                    width: 80,
                    height: 11,
                    background: 'var(--slate-100)',
                    borderRadius: 3,
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    width: '70%',
                    height: 15,
                    background: 'var(--slate-200)',
                    borderRadius: 4,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="more-info-toggle">
          <span className="label">More Info</span>
          <span
            style={{
              width: 16,
              height: 16,
              background: 'var(--slate-200)',
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 5.2: Validator**

```bash
npm run tsc
```

Expected: 0 errors. Skeleton uses only inline styles and the existing card classes, so there's nothing else to verify.

- [ ] **Step 5.3: Commit**

```bash
git add "src/app/(student)/student/profile/loading.tsx"
git commit -m "feat(profile): loading skeleton matching the card layout"
```

---

## Task 6: Remove the dangling `Support` nav entry from the student sidebar

**Files:**
- Modify: `src/components/layout/student-sidebar.tsx`

The current sidebar has a `Support` nav entry on line 21 pointing to `/student/support` — but `src/app/(student)/student/support/` does not exist as a route, so the link is dangling. Per the spec (and the project-v1-scope memory), remove the entry entirely. Also remove the now-unused `HelpCircle` import.

- [ ] **Step 6.1: Read the file first**

Open `src/components/layout/student-sidebar.tsx`. Confirm:
- Line 7 imports `HelpCircle` from `lucide-react` (alongside other icons)
- Line 21 is the `{ href: '/student/support', label: 'Support', icon: HelpCircle }` nav entry
- `HelpCircle` is referenced exactly **2 times** in the file (the import and the nav entry). If grep shows more, **stop and investigate** — there may be another usage that should not be removed.

```bash
grep -c "HelpCircle" "src/components/layout/student-sidebar.tsx"
# Expected: 2
```

- [ ] **Step 6.2: Remove the nav entry**

In `src/components/layout/student-sidebar.tsx`, delete line 21 entirely:

```diff
-  { href: '/student/support',  label: 'Support',  icon: HelpCircle },
```

If line 21 is part of a const array and removing it leaves a dangling comma at the end of the previous line, that's fine — TypeScript / ESLint will tolerate trailing commas in arrays. If your formatter rewraps, let it.

- [ ] **Step 6.3: Remove the unused `HelpCircle` import**

Update the import on line 7. Before:

```ts
import {
  LayoutDashboard, BookOpen, Zap, BarChart2,
  User, Settings, HelpCircle,
} from 'lucide-react';
```

After:

```ts
import {
  LayoutDashboard, BookOpen, Zap, BarChart2,
  User, Settings,
} from 'lucide-react';
```

(Note: if `Settings` is also unused after this edit, leave it — it's used by some other nav entry in the file. Only remove `HelpCircle`.)

- [ ] **Step 6.4: Validator**

```bash
# 1. HelpCircle is gone from the file
grep -c "HelpCircle" "src/components/layout/student-sidebar.tsx"
# Expected: 0

# 2. The /student/support href is gone
grep -c "/student/support" "src/components/layout/student-sidebar.tsx"
# Expected: 0

# 3. The 'Support' label is gone
grep -c "label: 'Support'" "src/components/layout/student-sidebar.tsx"
# Expected: 0

# 4. Type-check + lint
npm run tsc
npm run lint
```

Expected: counts 0, 0, 0; tsc 0 errors; lint 0 warnings.

Manual smoke: `npm run dev`, log in as a student, confirm the sidebar shows Dashboard / Exams / Tests / Results / Profile (and any others that were already there) but **does NOT** show Support / Help. Stop the dev server.

- [ ] **Step 6.5: Commit**

```bash
git add "src/components/layout/student-sidebar.tsx"
git commit -m "chore(student-sidebar): remove dangling Support nav entry"
```

---

## Task 7: Playwright e2e — `/student/profile`

**Files:**
- Create: `tests/e2e/student-profile.spec.ts`

Cover the three frames + the sidebar removal in one spec file.

- [ ] **Step 7.1: Write the spec**

Create `tests/e2e/student-profile.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { signInAsStudent } from './helpers/auth';

test.describe('/student/profile', () => {
  test('Frame 1 — populated state with collapsed More Info', async ({ page }) => {
    await signInAsStudent(page);
    await page.goto('/student/profile');

    // Page header
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(
      page.getByText('Your school record. Contact your teacher to update any of these details.')
    ).toBeVisible();

    // Hero strip — name + role line
    await expect(page.locator('.profile-name')).toBeVisible();
    await expect(page.locator('.profile-role')).toContainText('Student');
    await expect(page.locator('.profile-role')).toContainText('Level');

    // School Info section visible
    await expect(page.locator('.profile-card .section-title')).toContainText('School Info');

    // More Info collapsed by default — DOB row should not be in the DOM
    await expect(page.getByText('Date of Birth')).not.toBeVisible();

    // Cohort must be absent everywhere
    await expect(page.locator('.profile-card')).not.toContainText('Cohort');
  });

  test('Frame 2 — More Info toggles open and closed', async ({ page }) => {
    await signInAsStudent(page);
    await page.goto('/student/profile');

    const toggle = page.getByRole('button', { name: /more info/i });
    await toggle.click();
    await expect(page.getByText('Date of Birth')).toBeVisible();
    await expect(page.getByText('Guardian Name')).toBeVisible();

    await toggle.click();
    await expect(page.getByText('Date of Birth')).not.toBeVisible();
  });

  test('Sidebar — Profile is active and Support is gone', async ({ page }) => {
    await signInAsStudent(page);
    await page.goto('/student/profile');

    // Profile nav item should be marked active
    const profileNav = page.locator('a[href="/student/profile"]');
    await expect(profileNav).toBeVisible();

    // Support nav must NOT exist
    await expect(page.locator('a[href="/student/support"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Support$/ })).toHaveCount(0);
  });
});
```

If `signInAsStudent` does not yet exist as a helper, use the existing test sign-in pattern from one of the other e2e specs (`student-results-list.spec.ts` if/when it lands, otherwise the existing exam-flow spec). Do **not** invent new auth state machinery for this single test.

- [ ] **Step 7.2: Run the spec**

```bash
npm run test:e2e -- student-profile.spec.ts
```

Expected: 3 tests pass.

If any test fails because of a fixture issue (e.g. the seeded student has a NULL `roll_number` and the page returns 404), **stop** — that means the Task 1 DB change wasn't actually applied. Re-run Task 1 verification before continuing.

- [ ] **Step 7.3: Commit**

```bash
git add tests/e2e/student-profile.spec.ts
git commit -m "test(e2e): student profile — populated, toggle, sidebar"
```

---

## Task 8: Final integration verification

**Goal:** Run the full validation gauntlet before declaring done.

- [ ] **Step 8.1: Type-check + lint**

```bash
npm run tsc
npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 8.2: Full unit test suite**

```bash
npx vitest run
```

Expected: every test in `src/components/profile/` passes, plus all pre-existing tests continue to pass. Specifically confirm no regression in `src/components/results/` from the just-shipped student-results plan.

- [ ] **Step 8.3: Build**

```bash
npm run build
```

Expected: clean build, no warnings about unused exports or missing modules.

- [ ] **Step 8.4: `/verify-exam-flow` regression check**

Run the skill — drives the existing student exam flow end-to-end and confirms nothing in the sidebar removal or profile page broke the exam path.

```
/verify-exam-flow
```

Expected: PASS.

- [ ] **Step 8.5: Manual profile smoke + DB confirmation**

Then run the task-specific checks for this plan:

```
Also verify these task-specific items:
1. /student/profile renders the hero card with initials (not "Not mentioned" for the avatar)
2. The four School Info fields render: Email, Roll Number, Level, Grade Section (no Cohort anywhere)
3. Clicking "More Info" reveals six fields including Consent (Verified pill or "Not verified" text)
4. The student sidebar shows Profile as active and does NOT show a Support / Help entry
5. DB: SELECT is_nullable FROM information_schema.columns WHERE table_name='students' AND column_name='roll_number' → "NO"
6. Zero console errors on the page
```

- [ ] **Step 8.6: Summarise outcome**

Paste a one-paragraph summary into the task notes:

- ✅ `students.roll_number` flipped to NOT NULL (verified safe pre-flight, applied via SQL editor)
- ✅ `valueOrFallback`, `computeInitials`, `formatBirthDate` helpers shipped (TDD)
- ✅ `<ProfileCard>` Client Component with collapsible More Info (TDD)
- ✅ Server Component page rewrite — single inner-join query, no cohort
- ✅ Loading skeleton matching the card layout
- ✅ Dangling Support nav entry removed from student sidebar
- ✅ Playwright coverage for the 3 frames + the sidebar removal
- ✅ `/verify-exam-flow` PASS
- ✅ `tsc`, `lint`, `vitest`, `build` all clean

---

## Open questions surfaced during planning

These do not block execution — note any answers as you go.

1. **Supabase relation cardinality.** Step 4.2 assumes `students!inner` and `levels!inner` return single objects (1-to-1). If the generated TypeScript types come back as arrays, the engineer must investigate the FK names and adjust the relation hint — NOT flatten with `[0]` blindly. The query uses the standard inner-join pattern; this should work but is worth flagging.
2. **Test sign-in helper.** The Playwright spec uses a `signInAsStudent` import that may not exist yet. The engineer should reuse the same pattern from any pre-existing e2e auth helper rather than hand-rolling new test infrastructure.
3. **`forced_password_reset`.** Out of scope here, but worth noting: the `profiles.forced_password_reset` flag has no UI handler in this plan. If the flag is true today, the student lands on `/student/profile` with no indication anything is off. A separate spec for the login-flow blocking modal should pick this up.
4. **`dob` / `date_of_birth` cleanup.** GOTCHAS.md is updated to flag the duplication. A future cleanup spec should pick one column and deprecate the other. Out of scope here.
