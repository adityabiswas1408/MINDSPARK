---
name: complete-task
description: Run after completing every individual file. Ensures quality gates are met before proceeding. This workflow prevents errors from compounding across files.
---

# Complete Task Workflow

> Run this after EVERY file you write.
> Not just at phase boundaries. After every. single. file.
> Errors in file A cause 10 errors in file B. Fix them immediately.

---

## Step 1 — TypeScript Check (Always First)

```bash
npm run tsc
```

**If 0 errors:** Proceed to Step 2.

**If errors exist:**
- Fix every error now, in the file you just wrote
- Do not write the next file until tsc passes with 0 errors
- If you cannot fix after two genuine attempts: run /debug-handoff workflow

Common errors and where to look:
- `Column does not exist` → check docs/11_database.md for exact column name
- `Function does not exist` → RPC name wrong — check docs/11_database.md §17
- `Type does not have property` → stale types/supabase.ts — run npx supabase gen types
- `Cannot find module` → import path wrong — check project structure in CLAUDE.md
- `Property 'role' does not exist on User` → use user.app_metadata.role not user.role

---

## Step 2 — Check Off the Task

Open docs/17_task-breakdown.md.
Find the exact task you just completed — match the text precisely.
Change `[ ]` to `[x]`.

If you cannot find the task: tell the user — the task may not have been in scope for this phase.

---

## Step 3 — Run Banned Pattern Check on the File You Just Wrote

Run these greps on the specific file (not the whole codebase yet):

### For any file touching the database or API
```bash
FILE="[the file you just wrote]"

# Wrong RPC name
grep "validate_offline_submission\b" $FILE
# Expected: 0 results

# Wrong join column on student_answers
grep "student_answers.*session_id\|session_id.*student_answers" $FILE
# Expected: 0 results

# Wrong payload field
grep "question_index" $FILE
# Expected: 0 results

# Wrong table name
grep "\bassessments\b" $FILE
# Expected: 0 results (correct name is exam_papers)

# Wrong status check
grep "assessment_sessions.*status\|status.*assessment_sessions" $FILE
# Expected: 0 results (use closed_at IS NOT NULL)
```

### For any UI component file
```bash
FILE="[the file you just wrote]"

# Banned colours
grep "FF6B6B\|1A1A1A\|E0E0E0\|121212" $FILE
# Expected: 0 results

# Wrong phase string
grep "!== 'FLASH'\b\|=== 'FLASH'\b" $FILE
# Expected: 0 results (must be PHASE_2_FLASH)

# Hidden instead of unmounted
grep "display.*PHASE_2\|PHASE_2.*display\|visibility.*PHASE_2" $FILE
# Expected: 0 results (must be conditional JSX)
```

### For any Flash Anzan timing file
```bash
FILE="[the file you just wrote]"

# setTimeout/setInterval
grep "setTimeout\|setInterval" $FILE
# Expected: 0 results (must use RAF + delta accumulator)
```

### For any file using Supabase Realtime
```bash
FILE="[the file you just wrote]"

# Channel cleanup present
CHANNEL_CALLS=$(grep -c "supabase\.channel" $FILE)
CLEANUP_CALLS=$(grep -c "removeChannel" $FILE)
echo "channel() calls: $CHANNEL_CALLS — removeChannel() calls: $CLEANUP_CALLS"
# They must match
```

---

## Step 4 — Update PROGRESS.md (Every 10 Files)

If you have written 10+ files since the last update:

```markdown
# MINDSPARK — Development Progress

## Current Phase
Phase X — [Name]

## Last Completed Task
[Copy the exact task text from docs/17_task-breakdown.md — verbatim]

## Files Written This Session
- src/path/to/file1.ts
- src/path/to/file2.tsx
[complete list — every file]

## Next Task
[Exact text of next unchecked [ ] task]

## Known Issues
[Any bug, type error, or discrepancy you observed — be specific]

## Current Errors
[Empty if clean — or paste exact npm run tsc output]
```

---

## Step 5 — Phase Boundary Check

If the task you just completed was the LAST unchecked task in the current phase,
do not immediately start the next phase. First:

1. Run all exit criteria from .agent/rules/03-phase-gate.md for the current phase
2. For Phase 8 specifically: run ALL self-verification commands from CLAUDE.md §SELF-VERIFICATION COMMANDS
3. Fix anything that fails
4. Then run:
   ```bash
   git add -A
   git commit -m "Phase X complete: [description]"
   git push origin main
   ```
5. Verify Vercel deployment succeeds
6. Only then start Phase X+1 using /start-phase workflow

---

## Step 6 — Proceed to Next Task

Go to docs/17_task-breakdown.md.
Find the next unchecked `[ ]` task.
Return to /start-phase workflow Step 4 (Check the Canonical Source) for that task.

Do not skip /start-phase just because you are in the middle of a phase.
The source check step is what prevents hallucination from accumulating.
