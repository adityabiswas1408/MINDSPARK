# GOTCHAS.md
# Hard-won lessons. Read before starting any task.

---

## Database

### Live DB ≠ Migration files
Columns added via SQL editor don't appear in migrations.
Always verify with:
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = '[table]'
  ORDER BY ordinal_position;
Known divergences:
- submissions.paper_id — in live DB, not in 013_create_submissions.sql
- submissions.dpm — exists in live DB only
- submissions.percentage — NOT score_percentage
- assessment_sessions.cohort_id — NOT NULL, not in CLAUDE.md schema
- assessment_sessions.scheduled_at — NOT NULL, not in CLAUDE.md schema
- profiles.ticker_mode — does NOT exist yet (BUG 8)

### Supabase numeric → JS string
Postgres NUMERIC columns come back as strings from the
Supabase JS client, not numbers.
Always wrap with Number() before arithmetic or display:
  Math.round(Number(row.percentage ?? 0))

### Composite unique indexes
The submissions table has a composite unique index:
  (session_id, student_id)
Upserts must list ALL columns:
  onConflict: 'session_id,student_id'
Using only 'session_id' causes a silent no-op — no error,
upsert just does nothing.
Rule: always run this before any upsert:
  SELECT indexname, indexdef
  FROM pg_indexes WHERE tablename = '[table]';

### Zero-row UPDATEs are silent
Supabase does not error on UPDATE that matches 0 rows.
Always run SELECT with same WHERE first. Show row count.
Only proceed if count > 0.

### Enum/status casing is exact
Check constraints are case-sensitive.
'active' ≠ 'ACTIVE'. Verify before inserting:
  SELECT constraint_name, check_clause
  FROM information_schema.check_constraints
  WHERE table_name = '[table]';

### No FK constraint on submissions.paper_id
paper_id was added to submissions manually — no FK exists.
Supabase JS join syntax exam_papers(...) in select will fail.
Use two-query pattern instead:
  1. Fetch submissions, collect paper_ids
  2. Fetch exam_papers with .in('id', paperIds)

---

## CSS / Layout

### overflow:auto creates a fixed-position trap
Any ancestor with overflow:auto or overflow:hidden becomes
a containing block for position:fixed children in Chrome.
Fixed children are positioned relative to THAT element,
not the viewport.
Symptom: fixed overlay appears at wrong position
  (e.g. top:781px, left:272px instead of 0,0)
Fix: createPortal(content, document.body)
CLAUDE.md rule already covers this — follow it without
needing to rediscover it.

### Tailwind inset-0 can fail to resolve
After a portal, Tailwind class inset-0 may not compute
to top:0, left:0.
Symptom: computed style shows top:781px despite class
Fix: replace with explicit inline styles:
  style={{ position:'fixed', top:0, left:0,
           right:0, bottom:0, zIndex:9999 }}
Use inline styles for any positioning that is critical
to correct layout.

### z-index alone is not enough
z-index only works within the same stacking context.
A parent with transform, filter, will-change, or
overflow creates a new stacking context that traps
children regardless of z-index value.
If a modal/overlay isn't appearing on top: use
createPortal, not a higher z-index.

---

## React / Next.js

### Recharts Tooltip formatter type
Don't annotate the value parameter as number:
  formatter={(value: number) => ...}  ← TS error
ValueType is number | string | undefined.
Use:
  formatter={(value) => [`${value}%`, 'Score']}

### Recharts requires 'use client' + next/dynamic
Recharts accesses window on import — will crash SSR.
Always load chart components with:
  const Chart = dynamic(() => import('./chart'), { ssr: false })
Or put the chart component in a separate 'use client' file
and import it into the Server Component.

### Server Component buttons have no onClick
Buttons in Server Components render as static HTML.
No onClick, no interactivity. If a button needs to do
something, it either needs to be in a 'use client'
component or use a form action.
Export Report button in results page is intentionally
a placeholder — this is fine.

### Phase strings are exact constants
The exam engine uses exact phase string constants.
Never use bare strings — always use the constant:
  PHASE_2_FLASH  ← correct
  'FLASH'        ← wrong, breaks phase guard

---

## Skills / MCP / Tooling

### frontend-design skill breaks on fresh environment
The skill is installed as a symlink into .agents/skills/.
On a new machine the symlink target won't exist.
Symptom: "Unknown skill: frontend-design"
Fix:
  npx skills add https://github.com/anthropics/skills \
    --skill frontend-design --yes --global
This must be re-run on any new machine.

### code-review-graph build hangs
The graph build stalls at ~4050/46502 files consistently.
Rule: if build stalls on the same file twice, abort.
Do not retry. Continue the task without the graph.
detect_changes_tool is also known slow — skip it.

### sentence-transformers embeddings never worked
semantic_search_nodes falls back to text search.
Results may be less precise but still usable.
Do not spend session time trying to fix embeddings.

### Vercel CLI is not installed
vercel env pull, vercel deploy, vercel logs won't work
in terminal.
Deployments go via git push → Vercel GitHub integration.
To install: npm i -g vercel

### PostToolUse:Edit hook runs tsc after every edit
Any Edit or Write triggers: npx tsc --noEmit
If you see a hook error after an edit, it's a type error —
read the output. It is not a hook malfunction.
The hook is hardcoded to A:\MS\mindspark — don't open
a different project in the same session.

---

## Patterns That Burned Us

### Don't debug before checking your own changes
Before diagnosing any build error:
  git diff HEAD~1 --name-only
Check if a recent Claude edit caused it.
Revert first, confirm clean build, then add new fixes.
Two sessions were lost not doing this.

### assessment_sessions requires cohort_id + scheduled_at
Creating a test session via SQL requires both:
  cohort_id  — NOT NULL, get from student record
  scheduled_at — NOT NULL, use NOW()
Neither column is in CLAUDE.md schema docs.

### result_published_at gate requires completed_at too
The results page query filters completed_at IS NOT NULL.
Test submissions created directly in DB (not via exam
submit flow) will have completed_at = null and won't
appear on the results page even if result_published_at
is set.
Fix for test data: set both columns.

### Supabase JS join syntax requires a FK constraint
exam_papers(...) nested select only works if a FK exists.
paper_id on submissions has no FK — use two queries.
Check pg_constraint or information_schema before assuming
a join will work.
