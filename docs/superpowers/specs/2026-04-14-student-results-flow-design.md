# Student Results Flow — Design Spec

**Date:** 2026-04-14
**Scope:** Full redesign of the student-facing results surfaces (`/student/results`, `/student/results/[submissionId]`, `/student/results/[submissionId]/answers`) and the admin **Release Answer Key** action that gates the answer-sheet view.
**Status:** Approved (visual mockup `student-results-flow.html` locked — 14 screens).
**Supersedes:** `src/app/(student)/student/results/page.tsx` (current 452-line server component with hero card + recharts trend + ledger including DPM column).

---

## 1. Goals

- A single unified ledger that lists **every** submission a student has made, with no separate "pending" sub-list — pending rows live in the same table with a distinctive amber pill in the Grade column.
- All scores rendered in `got/total` format (e.g. `26/30`). Percentages and DPM are removed from every student-facing surface.
- A **two-gate** answer-sheet visibility model that splits "result published" from "answer key released", giving teachers the option to publish scores immediately but defer the answer key until after a make-up window.
- Empty/locked states for: no submissions yet, filtered empty result, pending grading, locked answer key. Each state lives inside the same shell — no full-page redirects.
- Both EXAM and TEST submissions render through the same detail and answer-sheet templates. The TEST detail page reuses the EXAM layout; the answer sheet renders TEST questions as one-line equations and EXAM questions as the v5 vertical table.
- An admin **Release Answer Key** card on the per-assessment detail page that wires through the gate without requiring a separate route.

## 2. Non-goals

- Trend charts (recharts `ResultsGpaChart`) are **dropped** from the student results page. The unified ledger replaces it. If the user later wants a chart, that is a separate spec.
- DPM as a metric is **dropped** from every student-facing surface. The `submissions.dpm` column stays in the database for back-fill / future analytics, but no student page reads it.
- The Create-Assessment Wizard is unchanged — there is no new field added by this spec.
- The admin results redesign (`2026-04-13-admin-results-redesign-design.md`) is unchanged except for the addition of the Release Answer Key card called out in §10.
- No changes to anti-cheat, offline-sync, or the Flash Anzan timing engine.

---

## 3. New logic (locked decisions)

Four behaviours are new to the platform and must be wired end-to-end.

### 3.1 Two-gate visibility model

There are two independent gates that together decide what a student can see.

| Gate | Owner | DB column | Default | Effect when CLOSED | Effect when OPEN |
|---|---|---|---|---|---|
| **A — Result published** | per submission | `submissions.result_published_at` | NULL | Submission appears as a *Pending* row (amber pill). No score, no grade, no detail page beyond the "Awaiting grading" card. | Score and grade visible on list and detail pages. Answer-sheet card visibility now depends on Gate B. |
| **B — Answer key released** | per paper | `exam_papers.answer_key_released` (new) | `false` | Detail page renders an **Answer Sheet Locked** CTA tile. The `/answers` route renders a centred lock card. | Answer-sheet CTA becomes interactive and the `/answers` route renders the question-by-question review. |

**Combined truth table:**

| A — `result_published_at` | B — `answer_key_released` | What the student sees |
|---|---|---|
| NULL | (any) | List shows Pending row · detail shows Awaiting grading · `/answers` shows Locked card |
| set | `false` | List shows Score + Grade · detail shows Score panel + Locked CTA tile · `/answers` shows Locked card |
| set | `true` | List shows Score + Grade · detail shows Score panel + interactive CTA · `/answers` shows full question review |

The gates are independent on purpose: an admin can publish results immediately and release the answer key later (the common case), or release the answer key first and publish results gradually (rare but supported).

### 3.2 `got/total` score format (universal)

- Numerator = `submissions.score` (existing int column, count of correct answers).
- Denominator = `submissions.total_questions` (**new** int column, snapshotted at submission time).
- Rendered everywhere as `<bignum>/<small>total</small>` in DM Mono with `tabular-nums`. The shared CSS class is `.score-fraction`.
- Hero card on the list page uses 52px font for the numerator and 22px green for the `/total` suffix.
- Detail page Score panel uses 64px / 32px.
- Table cells use 14px / inherit, both mono.
- The `.pct` CSS class is **repurposed** as the styling hook for the `/total` suffix span (it already has the right colour and size). No CSS rename, only a semantic change.
- `submissions.percentage` and `submissions.dpm` are **never read** by the new student pages. They remain in the database.

### 3.3 Unified ledger (no pending sub-list)

- Single `<table class="ledger">` lists every submission for the student in `completed_at DESC` order.
- A row is rendered as **Pending** when `result_published_at IS NULL`. The Score and Grade cells render an em-dash (`—`); the Grade cell additionally shows an amber `<span class="grade-pill pending">` containing a clock icon and the label `PENDING`.
- The hero card above the ledger always shows the student's **latest published** result. If there is no published result yet (all submissions pending), the hero card is hidden and the page falls back to the empty-card filter state described in §5.3.
- Filter chips: **All · EXAM · TEST · Pending · Last 30 days**. Single-select, rendered as a `<button class="chip">` row directly under the hero card. Filter state lives in the URL as `?filter=`.
- Columns (final): **Exam · Date · Type · Duration · Score · Grade**. The DPM column is removed.

### 3.4 Release Answer Key admin action

- Lives on the existing per-assessment detail page (`/admin/assessments/[paperId]`), directly above the read-only answer-key view defined in `2026-04-13-admin-results-redesign-design.md`.
- Two visual states (see §5.11): **Unreleased** (neutral grey rail, primary CTA `Release answer key`) and **Released** (green rail, secondary CTA `Undo release`, plus released-at timestamp and student-unlock count).
- Triggers a confirmation modal. Two flavours:
  - **Release modal:** primary copy explains the gate semantics. A secondary warning appears only when zero submissions for the paper have `result_published_at` set, telling the admin that releasing now will not affect any students until results are published.
  - **Un-release modal:** amber confirm button. Copy notes that un-releasing does not retrieve answer-sheet content that students have already seen, taken screenshots of, or downloaded.
- Both modals render via `createPortal` to `document.body` (per CLAUDE.md modal rules).

---

## 4. Pro suggestions accepted

| # | Suggestion | Applied where |
|---|---|---|
| S1 | Snapshot `total_questions` on the submission row at submit time | §9 — DB change |
| S2 | Single ledger with pending rows inline (no separate Pending list) | §3.3, §5.1 |
| S3 | Filter state lives in the URL so the empty-filter state is shareable / refreshable | §5.3 |
| S4 | Empty states stay inside the page shell — never a full-page redirect | §5.2, §5.10 |
| S5 | Admin release modal warns when there are zero published submissions for the paper | §3.4, §5.13 |
| S6 | Un-release modal explicitly states that already-seen content cannot be retrieved | §3.4, §5.14 |
| S7 | Hero card above the ledger always reflects the latest *published* result, never a pending one | §3.3, §5.1 |

---

## 5. Screens

Fourteen total. Frame numbers match the approved `student-results-flow.html` mockup. All student frames render inside the existing `(student)/student` route group with the standard sidebar + topbar shell. Admin frames render inside `(admin)/admin` with the admin shell.

### 5.1 Frame 1 — `/student/results` (populated)

**Purpose:** The student's primary results landing.

- **Hero card** at the top, max-width unconstrained inside the `~1100 px` main column. Two-column flex: left = title block (eyebrow `LATEST RESULT`, paper title, published date), right = `hero-stats` flex with the `26/30` score block and the green grade pill.
- **Filter chip row** under the hero — single-select, `All` active by default.
- **Unified ledger** — `<table>` with the columns from §3.3. Every submission appears here. The latest published result is shown in both the hero AND the first row of the ledger (this is intentional; the hero is a CTA, the row is the record).
- The hero card's entire surface is a `<a>` linking to `/student/results/[latestPublishedSubmissionId]`.
- Each ledger row's **Exam** cell is also an anchor to its detail page (or is plain text for Pending rows).
- Page header: `My Results` + caption `<n> results`.

### 5.2 Frame 2 — `/student/results` (empty)

**Purpose:** Student has never completed a submission.

- Hero card and ledger are both replaced with a single centred **Empty card** that contains:
  - Inbox icon (lucide-react `Inbox`)
  - Headline: *"No results yet"*
  - Sub-line: *"Take an exam from the Exams page to see your results here."*
  - Primary button: **Go to Exams** → `/student/exams`
- Page header still shows `My Results` + `0 results`.
- The empty card is *inside* the page shell — sidebar and topbar remain visible.

### 5.3 Frame 3 — `/student/results` (filter empty)

**Purpose:** Student has results but the active filter returns zero matches (mockup shows `Pending` chip active with no pending rows).

- Hero card stays visible (latest published result is still relevant).
- Filter chips stay visible with the active chip highlighted.
- Where the ledger would render, an **inline empty state** appears: small icon, line of copy *"No results match this filter."*, and a **Clear filter** text button.
- This state is reachable for any of the four chips (`EXAM`, `TEST`, `Pending`, `Last 30 days`).

### 5.4 Frame 4 — `/student/results/[submissionId]` · EXAM · published · key released

**Purpose:** The full happy-path detail page for an EXAM submission whose result is published *and* whose answer key has been released.

- **Back link** — `← Back to Results` at the top.
- **Detail header** — paper title (28px) + meta row containing the type pill (`EXAM`), duration text, and `Published <date>`.
- **Score panel** — white card with green left rail. Two `score-block` children:
  1. Numerator/denominator block — big `26` + small `/30` (DM Mono).
  2. Grade card — letter (e.g. `A`) + caption `GRADE`.
- **CTA tile** — `View Answer Sheet` → `/student/results/[submissionId]/answers`. Interactive (hover + arrow icon).
- No charts. No section labels other than the score panel header.

### 5.5 Frame 5 — Detail · EXAM · published · key NOT released

**Purpose:** Score visible, answer sheet still locked.

- Identical to Frame 4 except the CTA tile renders in its **locked** state:
  - Lock icon instead of clipboard
  - Headline: *"Answer Sheet Locked"*
  - Sub: *"Your teacher hasn't released the answer key yet. Check back later."*
  - Non-interactive (no hover, no arrow, no link).
- The score panel stays — the gate logic is per-paper for the answer key, not per-submission.

### 5.6 Frame 6 — Detail · TEST · published

**Purpose:** TEST variant of the detail page. Identical layout to the EXAM detail (Frame 4) — no extra DPM tile.

- Score panel has the same two `score-block` children as the EXAM detail (numerator/denominator + grade card). DPM is dropped.
- Type pill in the meta row reads `TEST` (different colour from `EXAM`).
- Otherwise identical.

### 5.7 Frame 7 — Detail · pending (`result_published_at IS NULL`)

**Purpose:** Submission exists, awaiting grading.

- Detail header still renders the paper title and meta row, but the meta date reads `Submitted <date>` (not `Published`).
- Score panel is replaced with a **Pending panel**:
  - Amber left rail
  - Clock icon (lucide-react `Clock`)
  - Headline: *"Awaiting grading"*
  - Sub: *"Your teacher is reviewing this exam — you'll see your score once it's published."*
- CTA tile is in its locked state with the copy: *"You'll be able to review answers after your teacher grades and releases this exam."*
- This state is reachable for both EXAM and TEST submissions — a TEST whose `result_published_at` is NULL renders the same panel.

### 5.8 Frame 8 — `/student/results/[submissionId]/answers` · EXAM · unlocked

**Purpose:** Question-by-question review.

- Back link → `Back to Result`.
- Sheet header: `Answer Sheet` + paper title.
- Vertical scroll of `<article class="question-card">` blocks, one per question.
- Each EXAM card contains:
  1. Question number + EXAM type label
  2. **Equation panel** — the v5 `<EquationTable>` component (vertical table format, defined in `2026-04-14-student-assessment-taking-flow-design.md` §6) with a small caption *"Question as shown during the exam."*
  3. **Options grid** (2×2) — every option is rendered, each tile in one of four states:
     - `correct` — green border, check icon (rendered when this is the right answer regardless of student's pick)
     - `wrong` — crimson border, X icon (rendered when this is the student's pick AND it is wrong)
     - `correct + chosen` — green border, check icon (rendered when student picked the right answer; the answer-caption below changes)
     - neutral — slate border (any other tile)
  4. **Answer caption** — one of:
     - *"Your answer ✓"* (green) when student picked correctly
     - *"Your answer"* (crimson) when student picked wrongly — followed by a `Correct answer: <letter>` hint line
     - *"You did not answer this question."* (slate) when `selected_option` is NULL
  5. **Time footer** — *"You took 12.4s"* (or *"You took — (not recorded)"* if `time_spent_ms` is NULL or 0)

### 5.9 Frame 9 — `/student/results/[submissionId]/answers` · TEST · unlocked

**Purpose:** TEST variant of the answer sheet.

- Same shell as Frame 8.
- Each TEST card replaces the equation panel with a **one-line reconstruction**:
  - Single centred `.one-line-eq` div containing the operands separated by `+` / `−` glyphs, with negatives in `#991B1B` (the sacred negative-number red).
  - Caption: *"You saw these numbers one at a time during the flash."*
- Options grid, answer caption, and time footer are identical to Frame 8.

### 5.10 Frame 10 — `/student/results/[submissionId]/answers` · locked

**Purpose:** Student opens the `/answers` URL directly but the answer key is not released (or the submission is still pending).

- Back link still renders (so the student can return without fighting the URL).
- The whole body is replaced with a centred `empty-card`:
  - Lock icon
  - Headline: *"Answer sheet locked"*
  - Sub: *"Your teacher hasn't released the answer key yet. Check back later."*
  - Primary button: **Back to Result** → `/student/results/[submissionId]`
- The card is `max-width: 520px` and centred inside the `~1100px` main column.
- This frame is the catch-all for: result not published yet, answer key not released yet, or both.

### 5.11 Frame 11 — Admin Release card · unreleased

**Purpose:** Card lives on the admin per-assessment detail page directly above the read-only answer-key view defined in the 2026-04-13 admin results redesign spec.

- Neutral slate left rail.
- Lock icon at the top-left of the body.
- Body:
  - Headline: *"Answer key is hidden from students"*
  - Sub: *"Students can see their score and grade, but cannot open the answer sheet for this paper yet."*
  - Action row containing the primary CTA **Release answer key** (forest-green pill with arrow icon).
- Click → opens the Release confirmation modal (Frame 13).

### 5.12 Frame 12 — Admin Release card · released

**Purpose:** Same card after release.

- Green left rail.
- Check-circle icon.
- Body:
  - Headline: *"Answer key is visible to students"*
  - Sub line 1: *"Released on <date> by <admin email>"* — populated from the most recent `BULK_RELEASE_ANSWER_KEY` activity log entry for this paper, falling back to `exam_papers.answer_key_released_at` + `answer_key_released_by` if no log entry exists.
  - Sub line 2: *"32 of 45 students have an answer sheet unlocked."* — count of submissions for this paper where `result_published_at IS NOT NULL`. Phrased to make the gate semantics obvious.
  - Action row containing a **secondary** button **Undo release** (slate pill, no arrow).
- Click → opens the Un-release confirmation modal (Frame 14).

### 5.13 Frame 13 — Release confirmation modal

**Purpose:** Confirm the destructive-but-recoverable action of releasing the answer key.

- `createPortal` to body, positioned over a faded admin page background.
- Centred white card, max-width 520 px, drop shadow.
- Headline: *"Release answer key for `<paper title>`?"*
- Primary copy: *"Students with published results will be able to see all correct answers and their own choices after you release this. Students whose results haven't been graded yet will still see a locked answer sheet until their individual results are published."*
- **Conditional warning** (only when `COUNT(*) FROM submissions WHERE paper_id = ? AND result_published_at IS NOT NULL = 0`):
  - Amber pill: *"⚠ None of this paper's results have been published yet. Releasing the answer key now will not affect any students until their results are graded."*
- Action row at the bottom: `Cancel` (slate) + `Release answer key` (forest green).
- The confirm button is the dialog's autofocused primary action.

### 5.14 Frame 14 — Un-release confirmation modal

**Purpose:** Confirm the un-release of an already-released answer key.

- Same shell as Frame 13.
- Headline: *"Undo answer key release for `<paper title>`?"*
- Primary copy: *"Students will no longer be able to see the answer sheet."*
- Secondary copy: *"**Note:** students who already opened the answer sheet may have screenshots, notes, or downloads — undoing the release does not retrieve what they already saw."*
- Action row: `Cancel` (slate) + **`Undo release`** (amber confirm button — distinct from Frame 13's green confirm).

---

## 6. The `score-fraction` component

A single client component that renders the `got/total` pattern consistently across hero, detail, and table cells.

```tsx
type ScoreFractionProps = {
  got: number;
  total: number;
  size: 'lg' | 'md' | 'sm';  // hero / detail / table
};
```

```css
.score-fraction {
  font-family: 'DM Mono', monospace;
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
```

- The `.pct` class name is intentionally reused (already present in `student-results-flow.html`) — semantic meaning is now "the secondary half of a score fraction", whether that's `%` or `/total`. No rename.
- Pending rows render `<ScoreFraction got={null} total={null} />` which short-circuits to an em-dash `—` in the appropriate size.

---

## 7. Routes

```
src/app/(student)/student/results/
  page.tsx                           ← list page (existing — full rewrite)
  loading.tsx                        ← skeleton (existing — keep, update markup)
  [submissionId]/
    page.tsx                         ← detail page (NEW)
    loading.tsx                      ← skeleton (NEW)
    answers/
      page.tsx                       ← answer sheet (NEW)
      loading.tsx                    ← skeleton (NEW)
```

- All three pages are **server components** that fetch via Supabase server client + `requireRole('student')`.
- `[submissionId]/page.tsx` does the gate-A check (`result_published_at`) and either renders the score panel (Frame 4/5/6) or the pending panel (Frame 7).
- `[submissionId]/answers/page.tsx` does both gate-A (per submission) and gate-B (per paper) checks. If either is closed, it renders Frame 10 (locked card). The pending and locked-key cases collapse to the same UI per §3.1.
- The existing `(admin)/admin/assessments/[paperId]/page.tsx` (whichever file it lives in) gains the Release Answer Key card from Frames 11/12, mounted above its existing answer-key view section.

## 8. Server actions

### 8.1 Existing — `publishResults(session_ids: string[])`

Already implemented in `src/app/actions/results.ts` (lines 145–172, per memory 1578). Sets `submissions.result_published_at` on the supplied IDs and writes a `BULK_PUBLISH_RESULTS` activity log row.

**No changes required** for this spec — it already drives gate A.

### 8.2 New — `releaseAnswerKey(paperId: string)`

Lives in `src/app/actions/results.ts` next to `publishResults`.

```ts
'use server';
export async function releaseAnswerKey(
  paperId: string
): Promise<ActionResult<{ paperId: string; releasedAt: string }>> {
  const auth = await requireRole('admin');
  if ('error' in auth) return { error: auth.error };

  // Update gate B
  const { error } = await adminSupabase
    .from('exam_papers')
    .update({
      answer_key_released: true,
      answer_key_released_at: new Date().toISOString(),
      answer_key_released_by: auth.userId,
    })
    .eq('id', paperId)
    .eq('institution_id', auth.institutionId);

  if (error) return { error: error.message };

  // Activity log
  await adminSupabase.from('activity_logs').insert({
    user_id: auth.userId,
    institution_id: auth.institutionId,
    action_type: 'BULK_RELEASE_ANSWER_KEY',
    entity_type: 'exam_paper',
    entity_id: paperId,
    metadata: { released_by_email: auth.email },
  });

  revalidatePath(`/admin/assessments/${paperId}`);
  return { ok: true, data: { paperId, releasedAt: new Date().toISOString() } };
}
```

### 8.3 New — `unreleaseAnswerKey(paperId: string)`

Same shape as §8.2 but sets `answer_key_released = false` and writes a `BULK_UNRELEASE_ANSWER_KEY` activity log row. Does **not** clear `answer_key_released_at` / `answer_key_released_by` — those stay so the audit trail is preserved.

### 8.4 Read-side data fetch (list page)

```ts
const { data: submissions } = await supabase
  .from('submissions')
  .select(`
    id, paper_id, score, total_questions, grade,
    completed_at, result_published_at,
    paper:exam_papers!inner(
      id, title, type, duration_minutes,
      result_published_at, answer_key_released
    )
  `)
  .eq('student_id', userId)
  .order('completed_at', { ascending: false });
```

- Single batched query — the existing N+1 avoidance via `.in('id', paperIds)` is replaced by a Postgres join via `!inner`.
- Latest published result for the hero card = `submissions.find(s => s.result_published_at != null)` — the array is already sorted DESC.

## 9. Database changes

Three new columns. One existing column to backfill.

```sql
-- Gate B per paper
ALTER TABLE exam_papers
  ADD COLUMN answer_key_released BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN answer_key_released_at TIMESTAMPTZ NULL,
  ADD COLUMN answer_key_released_by UUID NULL REFERENCES profiles(id);

-- Snapshotted denominator for got/total display
ALTER TABLE submissions
  ADD COLUMN total_questions INT NOT NULL DEFAULT 0;

-- Backfill: count questions per paper for existing submissions
UPDATE submissions s
SET total_questions = (
  SELECT COUNT(*) FROM questions q WHERE q.paper_id = s.paper_id
)
WHERE total_questions = 0;
```

- **`submissions.dpm`** stays in the schema. It is **never read** by the new student pages, but the column is not dropped — admins may surface it via a separate analytics export later.
- **`submissions.percentage`** stays in the schema for the same reason. The new code paths read `score / total_questions` instead.
- **`exam_papers.result_published_at`** is unaffected. Gate A is per-submission (`submissions.result_published_at`), which is already the only one the publish action writes to.
- **Migration policy:** per CLAUDE.md, no new migration files. All three statements get applied via the Supabase SQL editor. GOTCHAS.md must be updated with the new columns and the dropped-but-not-deleted DPM/percentage caveat.
- **Pre-flight verification (per CLAUDE.md DB rules):** before running the backfill, run `SELECT COUNT(*) FROM submissions WHERE total_questions = 0;` to record the row count. After the backfill, re-run and confirm 0.

## 10. Retroactive change to the admin results redesign spec

The existing spec at `docs/superpowers/specs/2026-04-13-admin-results-redesign-design.md` describes a per-assessment detail page with aggregate stats, an answer-key view, and CSV export links (per memory 1577). It does **not** mention a release action because gate B did not exist at the time.

This spec amends it as follows:

- A new **Release Answer Key card** (Frames 11/12) is mounted **directly above** the existing answer-key view section on the per-assessment detail page.
- The card has two states wired to `releaseAnswerKey()` and `unreleaseAnswerKey()` from §8.
- The two confirmation modals (Frames 13/14) are added to the same page.
- No other section of the existing admin spec changes.
- A short note linking back to this document is appended to the existing spec as the first task of the implementation plan.

## 11. Empty / locked state matrix

| State | Where it shows | Frame |
|---|---|---|
| Student has zero submissions | `/student/results` | 2 |
| Student has results but the active filter matches none | `/student/results` (any filter chip) | 3 |
| Submission exists but `result_published_at IS NULL` | `/student/results/[id]` | 7 |
| Submission published but `answer_key_released = false` | `/student/results/[id]` (CTA tile only) | 5 |
| Submission published, key released, but student lands on `/answers` | `/student/results/[id]/answers` | 8 / 9 (happy path) |
| Either gate closed and student lands on `/answers` directly | `/student/results/[id]/answers` | 10 |
| Admin views per-assessment page, key not yet released | `/admin/assessments/[id]` | 11 |
| Admin views per-assessment page, key released | `/admin/assessments/[id]` | 12 |

All seven student-facing states render **inside the standard student shell** (sidebar + topbar still visible). None redirect.

## 12. Testing

### Unit (Vitest)
- `<ScoreFraction>` renders `26/30` for `(got=26, total=30, size='lg')` with the right CSS class.
- `<ScoreFraction>` renders an em-dash for `(got=null, total=null, size='sm')`.
- `releaseAnswerKey()` returns `error` for non-admin caller (mocked `requireRole`).
- `releaseAnswerKey()` writes the expected activity-log row on success (mocked Supabase).
- `unreleaseAnswerKey()` does **not** clear `answer_key_released_at` (audit trail preservation).

### Integration (vitest with `vitest.config.integration.ts`)
- List page query fetches submissions for the authenticated student only (no cross-tenant leakage).
- Detail page renders Frame 4 when both gates open, Frame 5 when only A open, Frame 7 when A closed.
- Answer-sheet route renders Frame 10 when A or B is closed; Frame 8 only when both open.

### E2E (Playwright)
- `student-results-list.spec.ts` — populated, empty, and filter-empty states.
- `student-results-detail.spec.ts` — happy path EXAM, locked-key EXAM, pending EXAM, happy path TEST.
- `student-results-answers.spec.ts` — happy path + direct URL access in the locked case.
- `admin-release-answer-key.spec.ts` — release flow (modal → confirm → state change), un-release flow, conditional warning when zero published submissions.

## 13. Open questions for the plan phase

None block the spec.

1. Does the existing `(admin)/admin/assessments/[paperId]/page.tsx` mount path live in `src/app/(admin)/admin/assessments/[id]/page.tsx` or a different sub-route? The plan phase will confirm via grep before placing the Release Answer Key card.
2. Is the answer-key view section on the admin assessment detail page already a separate component, or inline in `page.tsx`? Determines how the new card is mounted.
3. Should the existing `ResultsGpaChart` recharts component be deleted or just unused? Leaning delete after grep confirms zero other importers.
4. The `submissions.dpm` and `submissions.percentage` columns become orphans on the read path. Cleanup task or leave alone?

---

## 14. Approved visual reference

- **Mockup:** `.superpowers/brainstorm/1798-1776124309/content/student-results-flow.html`
- **Frames:** 14 total (10 student frames, 2 admin frames, 2 admin confirmation modals).
- **Score format:** `26/30` — DPM removed from every surface.
- **Approved by:** user, 2026-04-14 session (after the shell-wrap propagation pass and the DPM-removal decision).
