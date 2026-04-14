# Student Results Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `src/app/(student)/student/results/page.tsx` (452 lines, hero + recharts + DPM) with a 14-frame flow comprising: a unified ledger list page, a per-submission detail page, an answer-sheet review page, and an admin Release Answer Key card with two confirmation modals. Universal `got/total` score format. DPM dropped from every UI surface. Two independent visibility gates: `submissions.result_published_at` (per submission) and `exam_papers.answer_key_released` (per paper).

**Architecture:** Three new student route files (`/results/[submissionId]/page.tsx`, `/results/[submissionId]/loading.tsx`, `/results/[submissionId]/answers/page.tsx`) live inside the existing `(student)/student` route group with the standard sidebar + topbar shell. A minimal new admin route at `/admin/assessments/[id]/page.tsx` hosts the Release Answer Key card; the full answer-key view stays in the older admin-results-redesign spec's plan. Two new server actions (`releaseAnswerKey`, `unreleaseAnswerKey`) sit alongside the existing `publishResults` in `src/app/actions/results.ts`. Three new DB columns (`exam_papers.answer_key_released*`, `submissions.total_questions`) are applied via the Supabase SQL editor — no migration files. A shared `<ScoreFraction>` component renders the `got/total` pattern in three sizes everywhere it's needed.

**Tech Stack:** Next.js 15 (App Router, Server Components), TypeScript, React 19, Supabase (PostgreSQL), Tailwind v4, lucide-react, Vitest + jsdom, Playwright. `createPortal` for modals (per CLAUDE.md). No `setTimeout`/`setInterval` in any new code.

**Source spec:** `docs/superpowers/specs/2026-04-14-student-results-flow-design.md`
**Approved visual:** `docs/design-mockups/student-results-flow.html`

---

## File Map

### New files

| Path | Responsibility |
|---|---|
| `src/app/(student)/student/results/[submissionId]/page.tsx` | Detail page Server Component — gate-A check + score panel or pending panel |
| `src/app/(student)/student/results/[submissionId]/loading.tsx` | Skeleton |
| `src/app/(student)/student/results/[submissionId]/answers/page.tsx` | Answer sheet Server Component — gate-A + gate-B check, dispatches EXAM vs TEST review |
| `src/app/(student)/student/results/[submissionId]/answers/loading.tsx` | Skeleton |
| `src/app/(student)/student/results/results-list-client.tsx` | Client wrapper for filter chip URL state |
| `src/app/(student)/student/results/[submissionId]/answers/answer-sheet-client.tsx` | Client wrapper for the question card list |
| `src/app/(admin)/admin/assessments/[id]/page.tsx` | Minimal admin detail page that mounts the Release Answer Key card |
| `src/app/(admin)/admin/assessments/[id]/release-key-card.tsx` | Two-state card client component (unreleased / released) |
| `src/app/(admin)/admin/assessments/[id]/release-key-modals.tsx` | Release + un-release confirmation modals (createPortal) |
| `src/components/results/score-fraction.tsx` | `got/total` renderer in three sizes |
| `src/components/results/score-fraction.test.tsx` | Vitest specs |
| `src/components/results/grade-pill.tsx` | Pill renderer for letter grades + Pending state |
| `src/components/results/results-hero-card.tsx` | Hero card on the list page |
| `src/components/results/results-ledger-table.tsx` | Unified ledger table |
| `src/components/results/empty-states.tsx` | Inbox / filter-empty / locked-key / pending centred cards |
| `src/components/results/answer-sheet-question-card.tsx` | One question card (EXAM and TEST variants) |
| `src/app/actions/results.ts` (modified) | Add `releaseAnswerKey` and `unreleaseAnswerKey` |
| `src/app/actions/results.test.ts` | Vitest specs for the two new actions |
| `db/sql-editor/2026-04-14-results-flow-columns.sql` | SQL run book |
| `tests/e2e/student-results-list.spec.ts` | Playwright — populated, empty, filter-empty |
| `tests/e2e/student-results-detail.spec.ts` | Playwright — happy EXAM, locked-key, pending, happy TEST |
| `tests/e2e/student-results-answers.spec.ts` | Playwright — happy + direct-URL locked |
| `tests/e2e/admin-release-answer-key.spec.ts` | Playwright — release flow + un-release + zero-published warning |

### Modified files

| Path | Change |
|---|---|
| `src/app/(student)/student/results/page.tsx` | Full rewrite — hero + filter chips + unified ledger; drops `ResultsGpaChart`, drops Pending sub-list, drops DPM column |
| `src/app/(student)/student/results/loading.tsx` | Update markup to match the new shell (hero card skeleton + chip row skeleton + table skeleton) |
| `src/app/actions/results.ts` | Add `releaseAnswerKey`, `unreleaseAnswerKey`; existing `publishResults` unchanged |
| `docs/superpowers/specs/2026-04-13-admin-results-redesign-design.md` | Append a "2026-04-14 retroactive update" note pointing at the new spec and noting the Release Answer Key card |
| `GOTCHAS.md` | Note the three new columns and that `submissions.dpm` / `submissions.percentage` are now orphan on the read path (kept for analytics) |

### Files to investigate / possibly delete

| Path | Reason |
|---|---|
| `src/components/results/results-gpa-chart.tsx` (if it exists at this exact path) | Spec drops the chart. Delete only after grep confirms zero importers outside the old `page.tsx`. Logged as Task 16. |

---

## Sacred-rule guardrails (read before any task)

These apply to **every** task:

- **Modals use `createPortal(content, document.body)`** — Base UI dialogs render an inert overlay and z-index alone is not enough.
- **No `setTimeout` / `setInterval`** anywhere in new client code. Use RAF helpers if you need a delay (none should be needed in this plan — all interactions are click-driven, not time-driven).
- **`#991B1B` is the negative-number red** and is allowed inline in the answer-sheet TEST one-line equation rendering. Nowhere else.
- **Server Actions return `ActionResult<T>`** from `src/lib/types/action-result.ts`.
- **`requireRole()` on every Server Action and Server Component** — no bypassing.
- **`src/lib/supabase/admin.ts` is BANNED inside `(student)/` routes, client components, and hooks.** Use the server client in detail/answers Server Components; only use admin client inside the new server actions.
- **No new Supabase migration files** — DB changes go through the SQL editor and are recorded in `db/sql-editor/`.
- **`npm run tsc` must be 0 errors** before every commit.
- **No hardcoded hex colours in components** — use `var(--token-name)` from `globals.css`. The single sanctioned exception is `#991B1B` per the rule above.
- **Score format is `got/total`** — never percentage. `submissions.percentage` and `submissions.dpm` are read by NOTHING in this plan.
- **Pre-flight every `UPDATE` / `INSERT` with a matching `SELECT`** (per CLAUDE.md DB Mutations rule).
- **Visual fidelity protocol:** when a task implements a UI frame from the approved mockup, port the mockup's CSS verbatim into a colocated CSS file (e.g. `./results-list.css` next to the component) and use the mockup's class names in JSX (`<div className="ledger-wrap">`, not `<div className="flex flex-col gap-2">`). Do **NOT** re-express the mockup as Tailwind utility classes — translation is where drift happens. Do **NOT** substitute shadcn components (`Card`, `Avatar`, `Separator`, `Table`) for mockup-styled divs. `Button`, `Input`, `Dialog` from shadcn are the sanctioned exceptions. The mockup lives at `docs/design-mockups/student-results-flow.html` and the Frame numbers in the tasks below (Frame 1 — populated list, Frame 7 — pending, etc.) refer to specific sections of that file. The test of correctness is: open the mockup and the dev server side-by-side and confirm they render identically at 100% zoom before marking any task complete.

---

## Task 1: DB columns

**Files:**
- Create: `db/sql-editor/2026-04-14-results-flow-columns.sql`
- Modify (after manual SQL run): `GOTCHAS.md`

- [ ] **Step 1.1: Verify current schema (pre-flight)**

Before any DDL, confirm what's already there. Run in the Supabase SQL editor and paste the result into the task notes:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exam_papers'
  AND column_name IN ('answer_key_released','answer_key_released_at','answer_key_released_by');

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
  AND column_name = 'total_questions';
```

Expected: zero rows for both. If any column already exists, stop and update the spec instead of re-adding.

- [ ] **Step 1.2: Verify the backfill source (pre-flight)**

```sql
SELECT COUNT(*) AS submissions_total
FROM submissions
WHERE total_questions = 0
  OR total_questions IS NULL;

SELECT COUNT(*) AS submissions_with_paper
FROM submissions s
WHERE EXISTS (SELECT 1 FROM exam_papers p WHERE p.id = s.paper_id);
```

Note both counts. The first is the row count that the backfill will touch (will be all rows since the column doesn't exist yet — read this as "rows that will be backfilled"). The second tells you how many submissions have a paper that exists; any difference is orphan rows that the backfill will leave at `total_questions = 0`.

- [ ] **Step 1.3: Write the SQL run book**

Create `db/sql-editor/2026-04-14-results-flow-columns.sql`:

```sql
-- Run via Supabase SQL editor on project ahrnkwuqlhmwenhvnupb.
-- Spec: docs/superpowers/specs/2026-04-14-student-results-flow-design.md
-- Date: 2026-04-14

-- ─── Gate B: per-paper answer-key release ──────────────────────────────────
ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS answer_key_released BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS answer_key_released_at TIMESTAMPTZ NULL;

ALTER TABLE exam_papers
  ADD COLUMN IF NOT EXISTS answer_key_released_by UUID NULL REFERENCES profiles(id);

-- ─── Got/total denominator on submissions ──────────────────────────────────
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS total_questions INT NOT NULL DEFAULT 0;

-- ─── Backfill: count questions per paper for existing rows ────────────────
UPDATE submissions s
SET total_questions = (
  SELECT COUNT(*) FROM questions q WHERE q.paper_id = s.paper_id
)
WHERE total_questions = 0;

-- ─── Verification ─────────────────────────────────────────────────────────
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exam_papers'
  AND column_name IN ('answer_key_released','answer_key_released_at','answer_key_released_by')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'submissions' AND column_name = 'total_questions';

-- Backfill check — should report 0 rows where the join produced a positive count
-- but the column is still 0
SELECT COUNT(*) AS unbackfilled
FROM submissions s
WHERE total_questions = 0
  AND EXISTS (SELECT 1 FROM questions q WHERE q.paper_id = s.paper_id);
```

- [ ] **Step 1.4: Run the SQL in the Supabase editor**

Open the Supabase dashboard for project `ahrnkwuqlhmwenhvnupb` → SQL editor → paste the file → Run.

Expected verification output:

```
answer_key_released     | boolean   | NO  | false
answer_key_released_at  | timestamp | YES | NULL
answer_key_released_by  | uuid      | YES | NULL
total_questions         | integer   | NO  | 0
unbackfilled            | 0
```

If `unbackfilled > 0`, stop and investigate the orphaned submissions before proceeding.

- [ ] **Step 1.5: Document the new columns in GOTCHAS.md**

Append under the database section:

```
- 2026-04-14: exam_papers.answer_key_released (bool, default false),
  answer_key_released_at (timestamptz, nullable), answer_key_released_by (uuid,
  nullable, FK profiles) added via SQL editor (no migration file). Together with
  submissions.result_published_at, these form the two-gate visibility model for
  the student results flow.
- 2026-04-14: submissions.total_questions (int, NOT NULL DEFAULT 0) added and
  backfilled from COUNT(questions.*) per paper. New code reads this as the
  denominator for the got/total score format. The columns submissions.percentage
  and submissions.dpm are now orphan on the read path — kept in the schema for
  analytics use only.
- See db/sql-editor/2026-04-14-results-flow-columns.sql.
```

- [ ] **Step 1.6: Validator**

```bash
# 1. Confirm the SQL file exists
test -f db/sql-editor/2026-04-14-results-flow-columns.sql && echo OK

# 2. Confirm GOTCHAS.md was updated
grep -q "2026-04-14: exam_papers.answer_key_released" GOTCHAS.md && echo OK

# 3. Verify columns live in the database
# (paste output from Step 1.4 into the task notes)
```

- [ ] **Step 1.7: Commit**

```bash
git add db/sql-editor/2026-04-14-results-flow-columns.sql GOTCHAS.md
git commit -m "db(results): add answer_key_released gate + total_questions denominator"
```

---

## Task 2: `<ScoreFraction>` component (TDD)

**Files:**
- Create: `src/components/results/score-fraction.tsx`
- Create: `src/components/results/score-fraction.test.tsx`

This is the universal `got/total` renderer used by the hero card, detail score panel, and table cells. Three sizes — `lg` (detail), `md` (hero), `sm` (table).

- [ ] **Step 2.1: Write the spec test (RED)**

Create `src/components/results/score-fraction.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreFraction } from './score-fraction';

describe('<ScoreFraction>', () => {
  it('renders got/total in lg size', () => {
    render(<ScoreFraction got={26} total={30} size="lg" />);
    expect(screen.getByText('26')).toBeDefined();
    expect(screen.getByText('/30')).toBeDefined();
    const root = screen.getByTestId('score-fraction');
    expect(root.className).toMatch(/size-lg/);
  });

  it('renders an em-dash when got is null', () => {
    render(<ScoreFraction got={null} total={null} size="md" />);
    expect(screen.getByText('—')).toBeDefined();
  });

  it('uses tabular-nums via DM Mono', () => {
    const { container } = render(<ScoreFraction got={18} total={25} size="sm" />);
    const el = container.querySelector('[data-testid="score-fraction"]') as HTMLElement;
    expect(getComputedStyle(el).fontFamily).toContain('DM Mono');
  });
});
```

Run `npx vitest run src/components/results/score-fraction.test.tsx` — expect failure (component does not exist).

- [ ] **Step 2.2: Implement to GREEN**

Create `src/components/results/score-fraction.tsx`:

```tsx
import * as React from 'react';

type Size = 'lg' | 'md' | 'sm';

export function ScoreFraction({
  got,
  total,
  size,
}: {
  got: number | null;
  total: number | null;
  size: Size;
}) {
  if (got == null || total == null) {
    return (
      <span
        data-testid="score-fraction"
        className={`score-fraction size-${size} dash`}
      >
        —
      </span>
    );
  }
  return (
    <span data-testid="score-fraction" className={`score-fraction size-${size}`}>
      {got}
      <span className="pct">/{total}</span>
    </span>
  );
}
```

- [ ] **Step 2.3: Add the CSS**

Add to `src/app/globals.css` (find the section that already defines `.score-fraction` if any; if not, add a new block):

```css
.score-fraction {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  display: inline-block;
  line-height: 1;
}
.score-fraction .pct {
  color: var(--clr-green-600);
  font-weight: 700;
}
.score-fraction.size-lg { font-size: 64px; }
.score-fraction.size-lg .pct { font-size: 32px; }
.score-fraction.size-md { font-size: 52px; }
.score-fraction.size-md .pct { font-size: 22px; }
.score-fraction.size-sm { font-size: 14px; }
.score-fraction.size-sm .pct { font-size: 14px; }
.score-fraction.dash { color: var(--text-subtle); }
```

- [ ] **Step 2.4: Validator**

```bash
npx vitest run src/components/results/score-fraction.test.tsx
npm run tsc
```

Expected: 3 passed, 0 type errors.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/results/score-fraction.tsx \
        src/components/results/score-fraction.test.tsx \
        src/app/globals.css
git commit -m "feat(results): ScoreFraction component for got/total format"
```

---

## Task 3: `releaseAnswerKey` + `unreleaseAnswerKey` server actions (TDD)

**Files:**
- Modify: `src/app/actions/results.ts`
- Create: `src/app/actions/results.test.ts`

- [ ] **Step 3.1: Read the existing file first**

```bash
# Read the existing results.ts to understand its imports and how publishResults is structured
```

Note the existing `requireRole`, `adminSupabase`, and `activity_logs` insert pattern from lines 145–172. The two new actions must mirror it.

- [ ] **Step 3.2: Write the spec test (RED)**

Create `src/app/actions/results.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/rbac', () => ({
  requireRole: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: {
    from: vi.fn(),
  },
}));

import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';
import { releaseAnswerKey, unreleaseAnswerKey } from './results';

describe('releaseAnswerKey', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns error when caller is not admin', async () => {
    (requireRole as any).mockResolvedValue({ error: 'forbidden' });
    const result = await releaseAnswerKey('pap_01J8A');
    expect(result).toEqual({ error: 'forbidden' });
  });

  it('updates exam_papers and writes activity log on success', async () => {
    (requireRole as any).mockResolvedValue({
      userId: 'user_1',
      institutionId: 'inst_1',
      email: 'admin@example.com',
    });
    const updateChain: any = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    updateChain.eq.mockResolvedValueOnce({ error: null });
    const insertChain: any = { insert: vi.fn().mockResolvedValue({ error: null }) };
    (adminSupabase.from as any)
      .mockReturnValueOnce(updateChain)
      .mockReturnValueOnce(insertChain);

    const result = await releaseAnswerKey('pap_01J8A');
    expect(result.ok).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ answer_key_released: true })
    );
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        action_type: 'BULK_RELEASE_ANSWER_KEY',
        entity_id: 'pap_01J8A',
      })
    );
  });
});

describe('unreleaseAnswerKey', () => {
  beforeEach(() => vi.resetAllMocks());

  it('does NOT clear answer_key_released_at on un-release (audit preservation)', async () => {
    (requireRole as any).mockResolvedValue({
      userId: 'user_1', institutionId: 'inst_1', email: 'admin@example.com',
    });
    const updateChain: any = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    updateChain.eq.mockResolvedValueOnce({ error: null });
    const insertChain: any = { insert: vi.fn().mockResolvedValue({ error: null }) };
    (adminSupabase.from as any)
      .mockReturnValueOnce(updateChain)
      .mockReturnValueOnce(insertChain);

    await unreleaseAnswerKey('pap_01J8A');
    const call = (updateChain.update as any).mock.calls[0][0];
    expect(call.answer_key_released).toBe(false);
    expect(call.answer_key_released_at).toBeUndefined();
    expect(call.answer_key_released_by).toBeUndefined();
  });
});
```

Run the file — expect failure (functions don't exist).

- [ ] **Step 3.3: Add the implementations**

Append to `src/app/actions/results.ts`:

```ts
export async function releaseAnswerKey(
  paperId: string
): Promise<ActionResult<{ paperId: string; releasedAt: string }>> {
  const auth = await requireRole('admin');
  if ('error' in auth) return { error: auth.error };

  const releasedAt = new Date().toISOString();

  // Pre-flight: confirm the paper exists in this institution
  const { data: existing, error: selErr } = await adminSupabase
    .from('exam_papers')
    .select('id')
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId)
    .maybeSingle();
  if (selErr) return { error: selErr.message };
  if (!existing) return { error: 'Paper not found' };

  const { error: updErr } = await adminSupabase
    .from('exam_papers')
    .update({
      answer_key_released: true,
      answer_key_released_at: releasedAt,
      answer_key_released_by: auth.userId,
    })
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId);
  if (updErr) return { error: updErr.message };

  await adminSupabase.from('activity_logs').insert({
    user_id: auth.userId,
    institution_id: auth.institutionId,
    action_type: 'BULK_RELEASE_ANSWER_KEY',
    entity_type: 'exam_paper',
    entity_id: paperId,
    metadata: { released_by_email: auth.email },
  });

  revalidatePath(`/admin/assessments/${paperId}`);
  return { ok: true, data: { paperId, releasedAt } };
}

export async function unreleaseAnswerKey(
  paperId: string
): Promise<ActionResult<{ paperId: string }>> {
  const auth = await requireRole('admin');
  if ('error' in auth) return { error: auth.error };

  // Pre-flight as above
  const { data: existing, error: selErr } = await adminSupabase
    .from('exam_papers')
    .select('id')
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId)
    .maybeSingle();
  if (selErr) return { error: selErr.message };
  if (!existing) return { error: 'Paper not found' };

  // NB: only flip the boolean. Do NOT clear `_at` / `_by` — keeps the audit trail.
  const { error: updErr } = await adminSupabase
    .from('exam_papers')
    .update({ answer_key_released: false })
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId);
  if (updErr) return { error: updErr.message };

  await adminSupabase.from('activity_logs').insert({
    user_id: auth.userId,
    institution_id: auth.institutionId,
    action_type: 'BULK_UNRELEASE_ANSWER_KEY',
    entity_type: 'exam_paper',
    entity_id: paperId,
    metadata: { unreleased_by_email: auth.email },
  });

  revalidatePath(`/admin/assessments/${paperId}`);
  return { ok: true, data: { paperId } };
}
```

Add the imports at the top if not already present:

```ts
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';
import type { ActionResult } from '@/lib/types/action-result';
```

- [ ] **Step 3.4: Validator**

```bash
npx vitest run src/app/actions/results.test.ts
npm run tsc
```

Expected: 3 passed, 0 type errors. **Also** check the existing `publishResults` test (if any) still passes.

- [ ] **Step 3.5: Commit**

```bash
git add src/app/actions/results.ts src/app/actions/results.test.ts
git commit -m "feat(results): releaseAnswerKey + unreleaseAnswerKey actions"
```

---

## Task 4: List page rewrite — query + data shape

**Files:**
- Modify: `src/app/(student)/student/results/page.tsx`

This task only updates the **server-side query** to include the new columns and select the joined paper fields. UI rewrites come in Tasks 5–6.

- [ ] **Step 4.1: Read the existing page.tsx**

Note the existing fetcher pattern (the two-query split into `submissions` + `.in('id', paperIds)`) — it will be replaced with a single inner-join.

- [ ] **Step 4.2: Replace the data fetcher**

The new query lives at the top of the Server Component:

```ts
const supabase = await createServerSupabaseClient();
const { data: rows, error } = await supabase
  .from('submissions')
  .select(`
    id,
    paper_id,
    score,
    total_questions,
    grade,
    completed_at,
    result_published_at,
    paper:exam_papers!inner (
      id,
      title,
      type,
      duration_minutes,
      result_published_at,
      answer_key_released
    )
  `)
  .eq('student_id', userId)
  .order('completed_at', { ascending: false });

if (error) {
  // log + render the empty state — never crash the route
}

const submissions = rows ?? [];
const latestPublished = submissions.find((s) => s.result_published_at != null);
```

- [ ] **Step 4.3: Type the row shape locally**

```ts
type LedgerRow = {
  id: string;
  paper_id: string;
  score: number;
  total_questions: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F' | null;
  completed_at: string | null;
  result_published_at: string | null;
  paper: {
    id: string;
    title: string;
    type: 'EXAM' | 'TEST';
    duration_minutes: number;
    result_published_at: string | null;
    answer_key_released: boolean;
  };
};
```

Place this type next to the page component (not in a shared types file — it's local to the route).

- [ ] **Step 4.4: Validator**

```bash
npm run tsc
```

Expected: 0 errors. Existing UI from page.tsx may now reference fields the new query no longer returns (e.g. `dpm`, `percentage`) — those will be cleaned in Task 5.

If tsc fails on an old field reference, **leave the failure** — Task 5 fixes it.

- [ ] **Step 4.5: Do not commit yet**

This task ends mid-flight intentionally. Task 5 finishes the UI rewrite and the commit covers both.

---

## Task 5: List page rewrite — UI

**Files:**
- Modify: `src/app/(student)/student/results/page.tsx`
- Modify: `src/app/(student)/student/results/loading.tsx`
- Create: `src/components/results/results-hero-card.tsx`
- Create: `src/components/results/results-ledger-table.tsx`
- Create: `src/components/results/grade-pill.tsx`
- Create: `src/components/results/empty-states.tsx`

- [ ] **Step 5.1: Build `<GradePill>`**

`src/components/results/grade-pill.tsx` — small wrapper around the grade letter that maps `A+ A B C F` to the right token + a `pending` variant for null. Use only `var(--clr-*)` tokens — no hardcoded hex.

- [ ] **Step 5.2: Build `<ResultsHeroCard>`**

`src/components/results/results-hero-card.tsx` — receives `latestPublished: LedgerRow`. Renders the eyebrow, title, published date, `<ScoreFraction size="md">`, and `<GradePill grade={...} size="lg">`. The whole card is an `<a href={\`/student/results/${latestPublished.id}\`}>`.

- [ ] **Step 5.3: Build `<ResultsLedgerTable>`**

`src/components/results/results-ledger-table.tsx` — receives `rows: LedgerRow[]` and a `filter` string. Filters the rows then renders the unified table with columns `Exam · Date · Type · Duration · Score · Grade`. Score cell uses `<ScoreFraction size="sm">`. Grade cell uses `<GradePill>` — the pending state takes care of the amber pill from Frame 1.

- [ ] **Step 5.4: Build `<EmptyStates>`**

Five exports, all centred cards inside the existing page shell (no portals):

- `<NoResultsEmptyState />` — Frame 2
- `<FilterEmptyState onClear={() => void} />` — Frame 3
- `<PendingPanel />` — Frame 7
- `<LockedAnswerSheetCard />` — Frame 5 + 10
- `<NoLatestPublishedHero />` — fallback when the student has only pending submissions (no hero card in the DOM, just the page header + chips + empty inline state)

- [ ] **Step 5.5: Wire everything in `page.tsx`**

```tsx
export default async function StudentResultsPage({ searchParams }: PageProps) {
  const { filter = 'all' } = searchParams;
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');

  const supabase = await createServerSupabaseClient();
  const { data: rows = [] } = await supabase /* the Task-4 query */;

  if (rows.length === 0) {
    return (
      <main className="results-page-shell">
        <header className="page-header">
          <h1 className="page-title">My Results</h1>
          <p className="page-caption">0 results</p>
        </header>
        <NoResultsEmptyState />
      </main>
    );
  }

  const latestPublished = rows.find((r) => r.result_published_at != null);

  return (
    <main className="results-page-shell">
      <header className="page-header">
        <h1 className="page-title">My Results</h1>
        <p className="page-caption">{rows.length} results</p>
      </header>

      {latestPublished && <ResultsHeroCard row={latestPublished} />}

      <ResultsListClient initialRows={rows} initialFilter={filter} />
    </main>
  );
}
```

The filter chip row + filtered table goes in `results-list-client.tsx` (Task 6).

- [ ] **Step 5.6: Update the loading skeleton**

Update `src/app/(student)/student/results/loading.tsx` to render: a hero card skeleton (rounded box), a chip-row skeleton (5 pill skeletons), and 5 table-row skeletons. No DPM column.

- [ ] **Step 5.7: Validator**

```bash
npm run tsc       # 0 errors
npm run lint      # 0 errors
npx vitest run    # All existing + new tests pass
```

Manual smoke (preview only): `npm run dev`, navigate to `/student/results` while logged in as a student with at least one published submission. Confirm:
- Hero card shows the latest published row in `26/30` format
- Filter chips render
- Table row count matches `submissions` count for that student
- No DPM column anywhere
- Pending rows show the amber `PENDING` pill in the Grade column

- [ ] **Step 5.8: Commit (covers Task 4 + 5)**

```bash
git add src/app/(student)/student/results/page.tsx \
        src/app/(student)/student/results/loading.tsx \
        src/components/results/
git commit -m "feat(student-results): list page rewrite — hero + chips + unified ledger"
```

---

## Task 6: Filter chip URL state

**Files:**
- Create: `src/app/(student)/student/results/results-list-client.tsx`

The chip row is a Client Component because it reads/writes `useSearchParams` and `usePathname`. It receives the rows from the Server Component as a prop (no re-fetching on chip click — pure client filter).

- [ ] **Step 6.1: Implement the client wrapper**

```tsx
'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ResultsLedgerTable } from '@/components/results/results-ledger-table';
import { FilterEmptyState } from '@/components/results/empty-states';
import type { LedgerRow } from './page';

const CHIPS = ['all', 'EXAM', 'TEST', 'pending', 'last30'] as const;
type ChipKey = (typeof CHIPS)[number];

const CHIP_LABELS: Record<ChipKey, string> = {
  all: 'All',
  EXAM: 'EXAM',
  TEST: 'TEST',
  pending: 'Pending',
  last30: 'Last 30 days',
};

export function ResultsListClient({
  initialRows,
  initialFilter,
}: {
  initialRows: LedgerRow[];
  initialFilter: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = (CHIPS.includes(initialFilter as ChipKey) ? initialFilter : 'all') as ChipKey;

  const filtered = initialRows.filter((r) => {
    if (active === 'all') return true;
    if (active === 'EXAM' || active === 'TEST') return r.paper.type === active;
    if (active === 'pending') return r.result_published_at == null;
    if (active === 'last30') {
      if (!r.completed_at) return false;
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return new Date(r.completed_at).getTime() >= cutoff;
    }
    return true;
  });

  function setFilter(next: ChipKey) {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('filter');
    else params.set('filter', next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <div className="chip-row">
        {CHIPS.map((c) => (
          <button
            key={c}
            className={`chip ${active === c ? 'active' : ''}`}
            onClick={() => setFilter(c)}
          >
            {CHIP_LABELS[c]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <FilterEmptyState onClear={() => setFilter('all')} />
      ) : (
        <ResultsLedgerTable rows={filtered} />
      )}
    </>
  );
}
```

- [ ] **Step 6.2: Export `LedgerRow` from `page.tsx`** (or move it to a co-located `types.ts` if cleaner).

- [ ] **Step 6.3: Validator**

```bash
npm run tsc
npm run lint
```

Manual smoke: click each chip in the dev server. Confirm the URL changes (`?filter=EXAM`), the table updates, and clicking the active chip again does **not** double-toggle. Hard-refresh with `?filter=pending` and confirm the chip is highlighted.

- [ ] **Step 6.4: Commit**

```bash
git add src/app/(student)/student/results/results-list-client.tsx
git commit -m "feat(student-results): chip-row filter wired to URL state"
```

---

## Task 7: Detail page route — gate-A logic

**Files:**
- Create: `src/app/(student)/student/results/[submissionId]/page.tsx`
- Create: `src/app/(student)/student/results/[submissionId]/loading.tsx`

- [ ] **Step 7.1: Page Server Component**

```tsx
import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ResultsDetailHeader } from '@/components/results/results-detail-header';
import { ScoreFraction } from '@/components/results/score-fraction';
import { GradePill } from '@/components/results/grade-pill';
import { PendingPanel, LockedAnswerSheetCard } from '@/components/results/empty-states';
import { AnswerSheetCta } from '@/components/results/answer-sheet-cta';

export default async function ResultsDetailPage({
  params,
}: {
  params: { submissionId: string };
}) {
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');

  const supabase = await createServerSupabaseClient();
  const { data: row } = await supabase
    .from('submissions')
    .select(`
      id, score, total_questions, grade,
      completed_at, result_published_at,
      paper:exam_papers!inner (
        id, title, type, duration_minutes,
        answer_key_released
      )
    `)
    .eq('id', params.submissionId)
    .eq('student_id', auth.userId)
    .maybeSingle();

  if (!row) notFound();

  const isPending = row.result_published_at == null;
  const isAnswerSheetUnlocked =
    !isPending && row.paper.answer_key_released === true;

  return (
    <main className="results-detail-shell">
      <BackLink href="/student/results" label="Back to Results" />
      <ResultsDetailHeader paper={row.paper} dateLabel={
        isPending
          ? `Submitted ${formatDate(row.completed_at)}`
          : `Published ${formatDate(row.result_published_at)}`
      } />

      {isPending ? (
        <PendingPanel />
      ) : (
        <section className="score-panel">
          <div className="score-block">
            <ScoreFraction got={row.score} total={row.total_questions} size="lg" />
            <div className="score-caption">Score</div>
          </div>
          <GradePill grade={row.grade} size="card" />
        </section>
      )}

      {isPending ? (
        <LockedAnswerSheetCard
          headline="Answer Sheet Locked"
          sub="You'll be able to review answers after your teacher grades and releases this exam."
        />
      ) : isAnswerSheetUnlocked ? (
        <AnswerSheetCta href={`/student/results/${row.id}/answers`} />
      ) : (
        <LockedAnswerSheetCard
          headline="Answer Sheet Locked"
          sub="Your teacher hasn't released the answer key yet. Check back later."
        />
      )}
    </main>
  );
}
```

- [ ] **Step 7.2: Skeleton**

Create `loading.tsx` with a header skeleton + score-panel skeleton + CTA tile skeleton.

- [ ] **Step 7.3: Validator**

```bash
npm run tsc
npm run lint
```

Manual smoke against three submissions:

1. **Published EXAM, key released** → Frame 4 (score panel + interactive CTA)
2. **Published EXAM, key NOT released** → Frame 5 (score panel + locked CTA copy "Your teacher hasn't released")
3. **Pending submission** → Frame 7 (Awaiting grading panel + locked CTA copy "after your teacher grades")

DB seed (run in Supabase SQL editor for one student):

```sql
-- Pre-flight: pick a student to seed for
SELECT id, full_name FROM students LIMIT 1;

-- Find an existing submission and force it into each state for testing,
-- then revert. Use SELECT first per CLAUDE.md DB Mutations rule.
SELECT id, paper_id, result_published_at FROM submissions
  WHERE student_id = '<student_id>' LIMIT 3;
```

- [ ] **Step 7.4: Commit**

```bash
git add "src/app/(student)/student/results/[submissionId]/"
git commit -m "feat(student-results): detail page with two-gate logic"
```

---

## Task 8: Answer sheet route — gate-A + gate-B logic

**Files:**
- Create: `src/app/(student)/student/results/[submissionId]/answers/page.tsx`
- Create: `src/app/(student)/student/results/[submissionId]/answers/loading.tsx`
- Create: `src/components/results/answer-sheet-question-card.tsx`

- [ ] **Step 8.1: Page Server Component**

```tsx
export default async function AnswerSheetPage({
  params,
}: {
  params: { submissionId: string };
}) {
  const auth = await requireRole('student');
  if ('error' in auth) redirect('/login');

  const supabase = await createServerSupabaseClient();
  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      id, result_published_at,
      paper:exam_papers!inner (
        id, title, type, answer_key_released
      )
    `)
    .eq('id', params.submissionId)
    .eq('student_id', auth.userId)
    .maybeSingle();

  if (!submission) notFound();

  const gateA = submission.result_published_at != null;
  const gateB = submission.paper.answer_key_released === true;

  if (!gateA || !gateB) {
    return (
      <main className="results-answer-sheet-shell">
        <BackLink href={`/student/results/${submission.id}`} label="Back to Result" />
        <LockedAnswerSheetCard
          headline="Answer sheet locked"
          sub="Your teacher hasn't released the answer key yet. Check back later."
          primaryHref={`/student/results/${submission.id}`}
          primaryLabel="Back to Result"
        />
      </main>
    );
  }

  // Fetch questions + the student's answers
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text, options, correct_option, equation_display, flash_sequence')
    .eq('paper_id', submission.paper.id)
    .order('order_index', { ascending: true });

  const { data: answers } = await supabase
    .from('student_answers')
    .select('question_id, selected_option, time_spent_ms')
    .eq('submission_id', submission.id);

  const answerByQuestionId = Object.fromEntries(
    (answers ?? []).map((a) => [a.question_id, a])
  );

  return (
    <main className="results-answer-sheet-shell">
      <BackLink href={`/student/results/${submission.id}`} label="Back to Result" />
      <header className="sheet-header">
        <div className="title">Answer Sheet</div>
        <div className="sub">{submission.paper.title}</div>
      </header>
      {(questions ?? []).map((q, idx) => (
        <AnswerSheetQuestionCard
          key={q.id}
          question={q}
          answer={answerByQuestionId[q.id]}
          paperType={submission.paper.type}
          number={idx + 1}
        />
      ))}
    </main>
  );
}
```

- [ ] **Step 8.2: Question card component**

`src/components/results/answer-sheet-question-card.tsx` is a Server Component (no `'use client'` — there's no interaction). It branches on `paperType`:

- **EXAM:** renders `<EquationTable operands={parseEquation(q.equation_display)} />` (re-uses the v5 component locked by the assessment-taking spec, located at `src/components/exam/equation-table.tsx`).
- **TEST:** renders the one-line equation by walking `q.flash_sequence` and inserting `+`/`−` glyphs with negatives in `#991B1B` (sanctioned exception).

The four option-tile states (correct, wrong-pick, neutral, correct-and-picked) are computed locally:

```tsx
function tileState(letter: string, correct: string, picked: string | null) {
  if (letter === correct && letter === picked) return 'correct';
  if (letter === correct) return 'correct';
  if (letter === picked) return 'wrong';
  return 'neutral';
}
```

(The spec's `correct + chosen` state is rendered with the same `correct` class — distinguished by the **answer caption** text below the grid, not the tile itself.)

The answer caption logic:

- `picked == null` → "You did not answer this question."
- `picked === correct` → "Your answer ✓" (green)
- `picked !== correct` → "Your answer" (crimson) followed by `Correct answer: <correct letter>`

The time footer:

- `time_spent_ms` truthy → `You took ${(time_spent_ms / 1000).toFixed(1)}s`
- `time_spent_ms` falsy → `You took — (not recorded)`

- [ ] **Step 8.3: Validator**

```bash
npm run tsc
npm run lint
```

Manual smoke:

1. Direct URL to `/student/results/<id>/answers` for a submission where both gates are open → renders Frame 8 or Frame 9 depending on paper type
2. Direct URL where gate A is closed → Frame 10
3. Direct URL where gate B is closed → Frame 10
4. Cross-tenant URL (a submission belonging to a different student) → 404

- [ ] **Step 8.4: Commit**

```bash
git add "src/app/(student)/student/results/[submissionId]/answers/" \
        src/components/results/answer-sheet-question-card.tsx
git commit -m "feat(student-results): answer-sheet route with gate-A + gate-B"
```

---

## Task 9: Admin Release Answer Key card component

**Files:**
- Create: `src/app/(admin)/admin/assessments/[id]/release-key-card.tsx`

The card is a Client Component because it triggers a modal. It receives `paperId`, the current `answer_key_released` flag, the optional `released_at` / `released_by_email`, and the `published_count` / `total_count` for the released-state copy.

- [ ] **Step 9.1: Implement the card with both states**

```tsx
'use client';
import { useState } from 'react';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { ReleaseModal, UnreleaseModal } from './release-key-modals';

export function ReleaseKeyCard(props: {
  paperId: string;
  paperTitle: string;
  released: boolean;
  releasedAt: string | null;
  releasedByEmail: string | null;
  publishedCount: number;
  totalStudentCount: number;
  hasZeroPublished: boolean;
}) {
  const [modal, setModal] = useState<'release' | 'unrelease' | null>(null);

  return (
    <>
      <div className={`admin-release-card ${props.released ? 'released' : ''}`}>
        {props.released ? (
          <CheckCircle2 className="head-icon" />
        ) : (
          <Lock className="head-icon" />
        )}
        <div className="body">
          {props.released ? (
            <>
              <h4>Answer key is visible to students</h4>
              {props.releasedAt && props.releasedByEmail && (
                <p>
                  Released on {formatDate(props.releasedAt)} by{' '}
                  {props.releasedByEmail}
                </p>
              )}
              <p>
                {props.publishedCount} of {props.totalStudentCount} students have an
                answer sheet unlocked.
              </p>
              <div className="action-row">
                <button
                  className="secondary-btn"
                  onClick={() => setModal('unrelease')}
                >
                  Undo release
                </button>
              </div>
            </>
          ) : (
            <>
              <h4>Answer key is hidden from students</h4>
              <p>
                Students can see their score and grade, but cannot open the
                answer sheet for this paper yet.
              </p>
              <div className="action-row">
                <button className="primary-btn" onClick={() => setModal('release')}>
                  Release answer key
                  <ArrowRight className="btn-arrow" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {modal === 'release' && (
        <ReleaseModal
          paperId={props.paperId}
          paperTitle={props.paperTitle}
          hasZeroPublished={props.hasZeroPublished}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'unrelease' && (
        <UnreleaseModal
          paperId={props.paperId}
          paperTitle={props.paperTitle}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 9.2: Add the CSS classes** (`.admin-release-card`, `.admin-release-card.released`, `.head-icon`, `.body`, `.action-row`, `.primary-btn`, `.secondary-btn`, `.btn-arrow`) — port from the locked mockup CSS in `student-results-flow.html`.

- [ ] **Step 9.3: Validator**

```bash
npm run tsc
```

(The card is not yet wired into a page — Task 11 mounts it.)

- [ ] **Step 9.4: Commit**

```bash
git add "src/app/(admin)/admin/assessments/[id]/release-key-card.tsx" src/app/globals.css
git commit -m "feat(admin-results): ReleaseKeyCard with both states"
```

---

## Task 10: Admin Release Answer Key confirmation modals (createPortal)

**Files:**
- Create: `src/app/(admin)/admin/assessments/[id]/release-key-modals.tsx`

Both modals must render via `createPortal(content, document.body)` per CLAUDE.md.

- [ ] **Step 10.1: Implement both modals**

```tsx
'use client';
import { useTransition } from 'react';
import { createPortal } from 'react-dom';
import { releaseAnswerKey, unreleaseAnswerKey } from '@/app/actions/results';

export function ReleaseModal(props: {
  paperId: string;
  paperTitle: string;
  hasZeroPublished: boolean;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await releaseAnswerKey(props.paperId);
      if ('error' in result) {
        // Inline error pill — no native alert (CLAUDE.md)
        console.error(result.error);
        return;
      }
      props.onClose();
    });
  }

  return createPortal(
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Release answer key for {props.paperTitle}?</h3>
        <p>
          Students with published results will be able to see all correct
          answers and their own choices after you release this. Students whose
          results haven't been graded yet will still see a locked answer sheet
          until their individual results are published.
        </p>
        {props.hasZeroPublished && (
          <div className="warning">
            ⚠ None of this paper's results have been published yet. Releasing
            the answer key now will not affect any students until their results
            are graded.
          </div>
        )}
        <div className="actions">
          <button className="btn-cancel" onClick={props.onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={onConfirm} disabled={pending}>
            {pending ? 'Releasing…' : 'Release answer key'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function UnreleaseModal(props: {
  paperId: string;
  paperTitle: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await unreleaseAnswerKey(props.paperId);
      if ('error' in result) {
        console.error(result.error);
        return;
      }
      props.onClose();
    });
  }

  return createPortal(
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Undo answer key release for {props.paperTitle}?</h3>
        <p>Students will no longer be able to see the answer sheet.</p>
        <p>
          <strong>Note:</strong> students who already opened the answer sheet
          may have screenshots, notes, or downloads — undoing the release does
          not retrieve what they already saw.
        </p>
        <div className="actions">
          <button className="btn-cancel" onClick={props.onClose}>
            Cancel
          </button>
          <button className="btn-confirm amber" onClick={onConfirm} disabled={pending}>
            {pending ? 'Reverting…' : 'Undo release'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 10.2: Validator**

```bash
npm run tsc
```

- [ ] **Step 10.3: Commit**

```bash
git add "src/app/(admin)/admin/assessments/[id]/release-key-modals.tsx"
git commit -m "feat(admin-results): release/un-release confirmation modals"
```

---

## Task 11: Mount the Release Key card on the admin per-assessment page

**Files:**
- Create: `src/app/(admin)/admin/assessments/[id]/page.tsx`

This task creates the **minimal** admin per-assessment detail page. The full answer-key view, KPI cards, and CSV export lives in the older admin-results-redesign spec's plan and is **out of scope here** — this page is intentionally sparse for now.

- [ ] **Step 11.1: Page Server Component**

```tsx
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';
import { ReleaseKeyCard } from './release-key-card';

export default async function AdminAssessmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const auth = await requireRole('admin');
  if ('error' in auth) notFound();

  // Paper + release state
  const { data: paper } = await adminSupabase
    .from('exam_papers')
    .select(`
      id, title,
      answer_key_released, answer_key_released_at, answer_key_released_by
    `)
    .eq('id', params.id)
    .eq('institution_id', auth.institutionId)
    .maybeSingle();

  if (!paper) notFound();

  // Released-by email lookup (optional — falls back to null if missing)
  let releasedByEmail: string | null = null;
  if (paper.answer_key_released_by) {
    const { data: releaser } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('id', paper.answer_key_released_by)
      .maybeSingle();
    releasedByEmail = releaser?.email ?? null;
  }

  // Aggregate counts for the released-state copy
  const { count: publishedCount } = await adminSupabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('paper_id', paper.id)
    .not('result_published_at', 'is', null);

  const { count: totalStudentCount } = await adminSupabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('paper_id', paper.id);

  return (
    <main className="admin-assessment-detail-shell">
      <header className="page-header">
        <h1>{paper.title}</h1>
      </header>

      <ReleaseKeyCard
        paperId={paper.id}
        paperTitle={paper.title}
        released={paper.answer_key_released ?? false}
        releasedAt={paper.answer_key_released_at}
        releasedByEmail={releasedByEmail}
        publishedCount={publishedCount ?? 0}
        totalStudentCount={totalStudentCount ?? 0}
        hasZeroPublished={(publishedCount ?? 0) === 0}
      />

      {/* TODO(admin-results-redesign-plan): mount the read-only answer-key view here */}
    </main>
  );
}
```

- [ ] **Step 11.2: Validator**

```bash
npm run tsc
npm run lint
```

Manual smoke:

1. Visit `/admin/assessments/<id>` for an existing paper → renders the unreleased state
2. Click **Release answer key** → modal opens → confirm → state flips to released, copy updates, `Undo release` button appears
3. Click **Undo release** → modal opens → confirm → state flips back
4. Visit a paper with zero published submissions → release modal shows the conditional warning
5. Verify in DB:
   ```sql
   SELECT id, answer_key_released, answer_key_released_at, answer_key_released_by
   FROM exam_papers WHERE id = '<paper_id>';
   SELECT * FROM activity_logs
   WHERE action_type IN ('BULK_RELEASE_ANSWER_KEY','BULK_UNRELEASE_ANSWER_KEY')
     AND entity_id = '<paper_id>'
   ORDER BY created_at DESC LIMIT 5;
   ```

- [ ] **Step 11.3: Commit**

```bash
git add "src/app/(admin)/admin/assessments/[id]/page.tsx"
git commit -m "feat(admin-results): minimal per-assessment page with release card"
```

---

## Task 12: Retroactive — append note to admin results redesign spec

**Files:**
- Modify: `docs/superpowers/specs/2026-04-13-admin-results-redesign-design.md`

- [ ] **Step 12.1: Append a "2026-04-14 retroactive update" section**

At the bottom of the existing file, add:

```markdown
---

## Retroactive update — 2026-04-14

The Student Results Flow spec (`2026-04-14-student-results-flow-design.md`)
introduces a **two-gate visibility model** for student results. As part of
that spec, a new **Release Answer Key card** is mounted directly above the
read-only answer-key view defined in §<existing section number> of this
document.

The card is rendered by `src/app/(admin)/admin/assessments/[id]/release-key-card.tsx`
and is wired through `releaseAnswerKey` / `unreleaseAnswerKey` server actions
in `src/app/actions/results.ts`. Two confirmation modals
(`release-key-modals.tsx`) handle the destructive-but-reversible action.

No other section of this document changes.
```

- [ ] **Step 12.2: Commit**

```bash
git add docs/superpowers/specs/2026-04-13-admin-results-redesign-design.md
git commit -m "docs(spec): retroactive note linking admin results to release card"
```

---

## Task 13: Cleanup — drop the GPA chart, **drop `submissions.dpm`**, prune orphans

**Files:**
- Investigate: `src/components/student/results-client.tsx` (the `ResultsGpaChart` student-side component) and `src/components/results/results-client.tsx` (the admin-side results client)
- Delete: `src/components/student/results-client.tsx` if it's no longer imported after Task 5's page rewrite
- Modify: `src/components/results/results-client.tsx` — drop all `dpm` references
- Modify: `src/app/(admin)/admin/results/page.tsx` — drop `dpm` from the `.select` query
- Modify: `GOTCHAS.md` — note the column drop
- Create: `db/sql-editor/2026-04-14-drop-submissions-dpm.sql` — the one-line DROP
- Execute (via Supabase SQL editor): `ALTER TABLE submissions DROP COLUMN dpm`

> **Phase 5.9 audit update (2026-04-14):** The original draft of this task only dropped the dead GPA chart component. Phase 5 confirmed that Q13 is answered by the user as **"drop dpm entirely"** — not just ignore the column. This task now also removes every reader of `submissions.dpm` and drops the column via SQL. The read-remove-then-drop order is critical: dropping the column first would break the 3 existing readers; removing the readers first makes the drop safe.

### 13.1 Drop the GPA chart (original scope)

- [ ] **Step 13.1.1: Find the chart component**

```bash
# Use Grep, not find
```

Search for `ResultsGpaChart` imports:

```bash
grep -rn "ResultsGpaChart\|results-client" src/app/
```

Phase 5 verified: only `src/app/(student)/student/results/page.tsx` imports `ResultsGpaChart` from `@/components/student/results-client`. After Task 5 rewrites that page, the import is gone and `src/components/student/results-client.tsx` is dead code.

- [ ] **Step 13.1.2: Delete the dead student chart file**

```bash
git rm src/components/student/results-client.tsx
```

Confirm the deletion compiles:

```bash
npm run tsc
```

Expected: 0 errors. If tsc errors, something outside the student results flow is still importing the file — investigate before continuing.

### 13.2 Drop the `submissions.dpm` column (Phase 5.9 addition)

- [ ] **Step 13.2.1: Verify the three code readers**

Phase 5 found exactly three files that read `submissions.dpm`:

| File | What reads it |
|---|---|
| `src/components/results/results-client.tsx` lines 41, 78, 85, 86, 314, 317 | Admin stats computation and "DPM Avg" KPI card |
| `src/app/(admin)/admin/results/page.tsx` line 35 | Admin query `.select('id, student_id, percentage, grade, dpm, result_published_at, ...')` |
| `src/app/(student)/student/results/page.tsx` lines 27, 53, 315, 420 | Old student results page (already replaced by Task 5 in this plan — confirm the file has been rewritten) |

Re-run grep to confirm the current state:

```bash
grep -rn "\.dpm\|'dpm'\|: dpm\|DPM" src/app/ src/components/ \
  | grep -v "// " | grep -v "\.test\."
```

Expected after Task 5 ran: only the two admin-side references remain (`results-client.tsx` and `admin/results/page.tsx`). If the student-side reference is still there, Task 5 didn't fully rewrite the page — stop and reconcile.

- [ ] **Step 13.2.2: Edit `src/components/results/results-client.tsx` — drop every `dpm` reference**

The file currently:
- Declares `dpm: number | null;` in a row type (line 41)
- Computes `dpmAvg` in a reducer (lines 78, 85, 86)
- Renders a "DPM Avg" KPI card (lines 314, 317)

Apply these three edits:

**Edit 1 — row type:**

```diff
 type SubmissionRow = {
   id: string;
   student_id: string;
   percentage: number | null;
   grade: string | null;
-  dpm: number | null;
   result_published_at: string | null;
   students: { full_name: string }[] | { full_name: string } | null;
 };
```

**Edit 2 — stats reducer:**

```diff
 const stats = useMemo(() => {
   const graded = rows.filter(r => r.percentage != null);
-  if (!graded.length) return { mean: 0, median: 0, dpmAvg: 0 };
+  if (!graded.length) return { mean: 0, median: 0 };
   const percentages = graded.map(r => Number(r.percentage));
   const mean = percentages.reduce((a, b) => a + b, 0) / percentages.length;
   const sorted = [...percentages].sort((a, b) => a - b);
   const median = sorted[Math.floor(sorted.length / 2)];
-  const dpmAvg = graded.reduce((sum, s) => sum + (s.dpm ?? 0), 0) / graded.length;
-  return { mean, median, dpmAvg };
+  return { mean, median };
 }, [rows]);
```

**Edit 3 — remove the "DPM Avg" KPI card block entirely:**

Find the JSX block rendering the DPM Avg card (around line 314) and delete the whole card. The surrounding stats row should render one fewer KPI card.

- [ ] **Step 13.2.3: Edit `src/app/(admin)/admin/results/page.tsx` — drop `dpm` from the query**

```diff
 const { data: rows } = await supabase
   .from('submissions')
-  .select('id, student_id, percentage, grade, dpm, result_published_at, students(full_name)')
+  .select('id, student_id, percentage, grade, result_published_at, students(full_name)')
   .eq(/* … */);
```

- [ ] **Step 13.2.4: Confirm zero remaining readers**

```bash
grep -rn "\.dpm\|'dpm'\|: dpm" src/app/ src/components/ \
  | grep -v "// " | grep -v "\.test\."
```

Expected: zero matches. If any reference remains, stop and investigate — the column drop in Step 13.2.6 will break that file.

- [ ] **Step 13.2.5: Write the SQL run book**

Create `db/sql-editor/2026-04-14-drop-submissions-dpm.sql`:

```sql
-- Run via Supabase SQL editor on project ahrnkwuqlhmwenhvnupb.
-- Spec: docs/superpowers/specs/2026-04-14-student-results-flow-design.md §9.1
-- Audit: docs/superpowers/audit/2026-04-14-phase1-findings.md Phase 5.9
-- Date: 2026-04-14

-- ─── Pre-flight ───────────────────────────────────────────────────────────
-- Confirm no row depends on dpm having a value (it's never written anywhere).
SELECT COUNT(*) AS with_non_null_dpm
FROM submissions
WHERE dpm IS NOT NULL;
-- Expected: 0 (if > 0, we'd be destroying user data — stop and investigate)

-- ─── Drop ─────────────────────────────────────────────────────────────────
ALTER TABLE submissions DROP COLUMN dpm;

-- ─── Verification ─────────────────────────────────────────────────────────
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'submissions' AND column_name = 'dpm';
-- Expected: zero rows
```

- [ ] **Step 13.2.6: Run the SQL in the Supabase editor**

Open the Supabase dashboard for project `ahrnkwuqlhmwenhvnupb` → SQL editor → paste the file → Run.

Expected:
- Pre-flight `with_non_null_dpm` returns `0`
- `ALTER TABLE` succeeds
- Verification query returns zero rows

**If the pre-flight returns > 0, STOP.** That would mean something somewhere wrote to `dpm` after the Phase 5 audit. Investigate before dropping the column.

- [ ] **Step 13.2.7: Document the drop in GOTCHAS.md**

Append under the database section:

```
- 2026-04-14: submissions.dpm column DROPPED via SQL editor. Phase 5.9 of the
  audit confirmed: no code writes to it, calculate_results does not compute it,
  no new UI surfaces it. The three readers (admin results-client.tsx, admin
  results/page.tsx query, and the old student results page) were edited to
  remove all .dpm references before the DROP ran. Any future DPM analytics
  requirement can re-add the column with a fresh schema decision — do NOT
  assume the old numeric-nullable shape.
```

### 13.3 Final orphan scan

- [ ] **Step 13.3.1: Confirm zero orphan references**

```bash
# Zero dpm anywhere (including comments — we want no mention in the codebase at all)
grep -rn "dpm\|DPM" src/ | grep -v "\.test\." | grep -v node_modules
```

Expected: zero matches.

Note: `percentage` stays in the codebase — it's still a read path in the admin side. Only `dpm` is dropped.

- [ ] **Step 13.3.2: tsc + lint + unit tests**

```bash
npm run tsc
npm run lint
npx vitest run
```

Expected: 0 errors, 0 warnings, all tests pass.

### 13.4 Commit

- [ ] **Step 13.4.1: Commit**

```bash
git add src/components/student/results-client.tsx \
        src/components/results/results-client.tsx \
        "src/app/(admin)/admin/results/page.tsx" \
        db/sql-editor/2026-04-14-drop-submissions-dpm.sql \
        GOTCHAS.md
git commit -m "chore(results): drop submissions.dpm column and all readers"
```

Note: the `git rm` from Step 13.1.2 is already staged; the `git add` above picks up the modifications to the remaining files.

---

## Task 14: Playwright — student results list

**Files:**
- Create: `tests/e2e/student-results-list.spec.ts`

- [ ] **Step 14.1: Write the spec**

```ts
import { test, expect } from '@playwright/test';
import { signInAsStudent } from './helpers/auth';

test.describe('/student/results — list', () => {
  test('populated state shows hero, chips, and ledger', async ({ page }) => {
    await signInAsStudent(page, { hasPublishedResults: true });
    await page.goto('/student/results');

    await expect(page.getByText('My Results')).toBeVisible();
    // Hero card with the latest result
    await expect(page.getByText('LATEST RESULT')).toBeVisible();
    // Score in got/total format — never %
    const heroScore = page.locator('.hero-card .score-fraction').first();
    await expect(heroScore).toContainText('/');
    await expect(page.locator('.hero-card')).not.toContainText('%');
    // Chip row
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    // Ledger
    await expect(page.locator('table.ledger thead')).toContainText('Exam');
    await expect(page.locator('table.ledger thead')).not.toContainText('DPM');
  });

  test('empty state when no submissions', async ({ page }) => {
    await signInAsStudent(page, { hasNoSubmissions: true });
    await page.goto('/student/results');
    await expect(page.getByText('No results yet')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to Exams' })).toBeVisible();
  });

  test('filter chip empty state', async ({ page }) => {
    await signInAsStudent(page, { hasPublishedResults: true, hasPending: false });
    await page.goto('/student/results?filter=pending');
    await expect(page.getByText('No results match this filter.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filter' }).click();
    await expect(page).toHaveURL('/student/results');
  });
});
```

- [ ] **Step 14.2: Validator**

```bash
npm run test:e2e -- student-results-list.spec.ts
```

- [ ] **Step 14.3: Commit**

```bash
git add tests/e2e/student-results-list.spec.ts
git commit -m "test(e2e): student results list — populated, empty, filter-empty"
```

---

## Task 15: Playwright — student results detail

**Files:**
- Create: `tests/e2e/student-results-detail.spec.ts`

Cover all four detail variants from the spec (Frames 4, 5, 6, 7).

- [ ] **Step 15.1: Write the spec**

```ts
test.describe('/student/results/[submissionId]', () => {
  test('EXAM published with key released → score panel + interactive CTA', async ({ page }) => {
    /* signIn + nav to a submission with both gates open */
    await expect(page.locator('.score-panel .score-fraction')).toContainText('/');
    await expect(page.getByRole('link', { name: 'View Answer Sheet' })).toBeVisible();
  });

  test('EXAM published with key NOT released → score panel + locked CTA', async ({ page }) => {
    /* … */
    await expect(page.getByText('Answer Sheet Locked')).toBeVisible();
    await expect(page.getByText("Your teacher hasn't released")).toBeVisible();
  });

  test('TEST published → score panel only (no DPM tile)', async ({ page }) => {
    /* … */
    await expect(page.locator('.score-panel')).not.toContainText('DPM');
    const scoreBlocks = await page.locator('.score-block').count();
    expect(scoreBlocks).toBe(1);  // only the score-fraction block
  });

  test('Pending submission → Awaiting grading panel', async ({ page }) => {
    /* … */
    await expect(page.getByText('Awaiting grading')).toBeVisible();
    await expect(page.getByText('after your teacher grades')).toBeVisible();
  });
});
```

- [ ] **Step 15.2: Validator**

```bash
npm run test:e2e -- student-results-detail.spec.ts
```

- [ ] **Step 15.3: Commit**

```bash
git add tests/e2e/student-results-detail.spec.ts
git commit -m "test(e2e): student results detail — all four states"
```

---

## Task 16: Playwright — student answer sheet

**Files:**
- Create: `tests/e2e/student-results-answers.spec.ts`

Cover the EXAM happy path, the TEST happy path, and the locked direct-URL state.

- [ ] **Step 16.1: Write the spec**

```ts
test.describe('/student/results/[submissionId]/answers', () => {
  test('EXAM happy path — vertical table + state pills', async ({ page }) => {
    /* … */
    await expect(page.locator('article.question-card')).toHaveCount(/* expected */);
    // First question card has the EquationTable
    await expect(page.locator('.table-equation').first()).toBeVisible();
    // The student's right answer caption
    await expect(page.getByText(/Your answer ✓/)).toBeVisible();
  });

  test('TEST happy path — one-line equation', async ({ page }) => {
    /* … */
    await expect(page.locator('.one-line-eq').first()).toBeVisible();
    // No vertical table on TEST cards
    await expect(page.locator('.table-equation')).toHaveCount(0);
  });

  test('Direct URL with locked key → Frame 10', async ({ page }) => {
    /* … */
    await page.goto('/student/results/<id>/answers');
    await expect(page.getByText('Answer sheet locked')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Result' })).toBeVisible();
  });
});
```

- [ ] **Step 16.2: Validator**

```bash
npm run test:e2e -- student-results-answers.spec.ts
```

- [ ] **Step 16.3: Commit**

```bash
git add tests/e2e/student-results-answers.spec.ts
git commit -m "test(e2e): answer sheet — EXAM, TEST, locked"
```

---

## Task 17: Playwright — admin release answer key

**Files:**
- Create: `tests/e2e/admin-release-answer-key.spec.ts`

- [ ] **Step 17.1: Write the spec**

```ts
test.describe('/admin/assessments/[id] — Release Answer Key card', () => {
  test('release flow — modal opens, confirm flips state', async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin/assessments/<paper_with_key_unreleased>');
    await expect(page.getByText('Answer key is hidden from students')).toBeVisible();

    await page.getByRole('button', { name: 'Release answer key' }).click();
    // Modal opens via portal — assert against body
    await expect(page.getByRole('heading', { name: /Release answer key for/ })).toBeVisible();
    await page.getByRole('button', { name: 'Release answer key' }).click();

    await expect(page.getByText('Answer key is visible to students')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Undo release' })).toBeVisible();
  });

  test('un-release flow — restores hidden state', async ({ page }) => { /* … */ });

  test('zero-published warning appears in release modal', async ({ page }) => {
    await page.goto('/admin/assessments/<paper_with_zero_published_submissions>');
    await page.getByRole('button', { name: 'Release answer key' }).click();
    await expect(page.getByText(/None of this paper's results have been published yet/)).toBeVisible();
  });
});
```

- [ ] **Step 17.2: Validator**

```bash
npm run test:e2e -- admin-release-answer-key.spec.ts
```

DB verification after the test runs:

```sql
SELECT action_type, COUNT(*) FROM activity_logs
WHERE action_type IN ('BULK_RELEASE_ANSWER_KEY','BULK_UNRELEASE_ANSWER_KEY')
  AND created_at > now() - interval '1 hour'
GROUP BY action_type;
```

- [ ] **Step 17.3: Commit**

```bash
git add tests/e2e/admin-release-answer-key.spec.ts
git commit -m "test(e2e): admin release answer key flow"
```

---

## Task 18: Final integration verification

**Goal:** Run the full validation gauntlet and the two `/verify-*` skills before declaring done.

- [ ] **Step 18.1: Type-check + lint**

```bash
npm run tsc
npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 18.2: Full unit test suite**

```bash
npx vitest run
```

Expected: every test in `src/components/results/`, `src/app/actions/results.test.ts`, and any pre-existing tests still pass.

- [ ] **Step 18.3: Build**

```bash
npm run build
```

Expected: clean build, no warnings about unused exports or missing modules.

- [ ] **Step 18.4: `/verify-exam-flow` regression check**

Run the skill — it drives the existing student exam flow end-to-end and confirms the existing path is **not** broken by this plan.

```
/verify-exam-flow
```

Expected: PASS (the new results pages should not interfere with the exam flow).

- [ ] **Step 18.5: `/verify-admin-pages` regression check**

```
/verify-admin-pages
```

Then run the task-specific checks for this plan:

```
Also verify these task-specific items:
1. /student/results renders the hero card in `26/30` format
2. /student/results table has no DPM column
3. /student/results/[id] for a published submission shows the score panel + interactive CTA
4. /student/results/[id]/answers for a released submission shows question cards with the v5 EquationTable
5. /admin/assessments/[id] shows the Release Key card with the unreleased state
6. Click "Release answer key" → modal opens → confirm → state flips
7. DB: SELECT answer_key_released FROM exam_papers WHERE id = '<test-paper>' → true
8. DB: SELECT * FROM activity_logs WHERE action_type = 'BULK_RELEASE_ANSWER_KEY' ORDER BY created_at DESC LIMIT 1 → row exists
```

- [ ] **Step 18.6: Final commit (only if any docs / GOTCHAS / CHANGELOG were touched)**

```bash
git add -u
git commit -m "docs(results): final cleanup notes"
```

- [ ] **Step 18.7: Summarise outcome**

Paste a one-paragraph summary of what was built into the task notes:

- ✅ DB columns added and backfilled
- ✅ `<ScoreFraction>` shipped
- ✅ List page rewritten — hero + chips + unified ledger
- ✅ Detail page with two-gate logic
- ✅ Answer sheet with EXAM/TEST variants and locked state
- ✅ Admin Release Key card + modals
- ✅ Retroactive note on admin results redesign spec
- ✅ Playwright coverage for list / detail / answer sheet / release flow
- ✅ `/verify-exam-flow` and `/verify-admin-pages` PASS

---

## Open questions surfaced during planning

These do not block the plan — note any answers as you go.

1. **Admin per-assessment detail page already partially specced elsewhere.** The older 2026-04-13 admin results redesign spec describes a richer detail page (KPIs, answer-key view, CSV export). This plan deliberately scopes the new `/admin/assessments/[id]/page.tsx` to **only** the Release Key card, leaving the rest for the admin-results-redesign plan to add later. The mounted page has a `TODO` marker.
2. **Question schema for the answer sheet.** The answer sheet renderer assumes `questions.equation_display` (EXAM) and `questions.flash_sequence` (TEST) exist. Memory 1573 confirms both columns. Re-verify with `information_schema.columns` before running Task 8.
3. **`order_index` on questions.** Task 8 orders questions by `order_index`. Confirm the column exists; if not, fall back to `created_at`.
4. **`releaseAnswerKey` returns `releasedAt` but the page revalidates the path.** The card re-fetches on next navigation. If we want optimistic UI, we'd need a `useOptimistic` block — out of scope for this plan; current behaviour is server-driven flip.
5. **Cross-tenant safety on detail/answers.** Both queries chain `.eq('student_id', auth.userId)`. The Server Component returns 404 (not 403) on miss to avoid leaking submission existence — confirm this behaviour matches existing pages.
