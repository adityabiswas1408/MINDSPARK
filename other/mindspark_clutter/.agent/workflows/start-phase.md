---
name: start-phase
description: Run at the start of EVERY session without exception. Prevents context rot, hallucination, and scope drift. Do not skip any step — each one is load-bearing.
---

# Start Phase Workflow

> Run this at the start of every session. Not just when starting a new phase.
> Every. Single. Session.
> Skipping any step is the primary cause of hallucination and scope drift.

---

## Step 1 — Read Context Files Without Truncation

Read these four files completely in this exact order.
Do not skim. Do not truncate. Every line.

```
1. CLAUDE.md               ← all 683 lines — implementation contract + 54 warnings
2. GEMINI.md               ← session protocol + model selection + phase routing
3. PROGRESS.md             ← last save point + next task + open issues
4. docs/17_task-breakdown.md ← first unchecked [ ] task in current phase
```

If CLAUDE.md or PROGRESS.md is not found: stop and tell the user which file is missing.
Do not proceed without both.

---

## Step 2 — State Your Orientation

After reading, say exactly this:

```
"I am in Phase [X] — [Name].
Last completed: [exact task text from PROGRESS.md].
Next task: [exact first unchecked task from docs/17_task-breakdown.md].
First file I will write: [filepath].
Canonical source I will check: [priority 1–8 file from source hierarchy]."
```

Do not write a single character of code before this statement.

---

## Step 3 — Read Phase-Specific Docs

Based on the current phase, read the required documents using @ references.
These are listed in CLAUDE.md §PHASE ROUTING. Read them completely, no truncation.

| Phase | Read before coding |
|-------|--------------------|
| 0 | Nothing additional — CLAUDE.md covers Phase 0 |
| 1 | @docs/11_database.md — all 1,684 lines |
| 2 | @docs/05_ia-rbac.md + @docs/14_security.md |
| 3 | @docs/09_fsd.md §3, §4, §5 |
| 4 | @docs/12_api-contracts.md — all 1,025 lines |
| 5 | @docs/07_hifi-spec.md + @docs/08_a11y.md |
| 6 | @docs/06_wireframes.md Part A + @docs/07_hifi-spec.md §5 + @docs/23_admin-manual.md |
| 7 | @docs/06_wireframes.md Part B + @docs/07_hifi-spec.md §6 + @docs/24_student-guide.md |
| 8 | @docs/09_fsd.md (full) + @docs/13_exam-engine-spec.md (full) |

If your phase requires docs/11_database.md: verify you can see the student_answers DDL
in §12 before writing any database code. If it was truncated, read it again.

---

## Step 4 — Check the Canonical Source for Your Task

Before writing the file, identify which source governs it:

```
Migration or DB query?         → @docs/11_database.md — check column names exactly
Server Action or Route Handler? → @docs/12_api-contracts.md — check payload + error codes
Any component or CSS?          → @docs/07_hifi-spec.md + design-system.html
Auth logic or RLS policy?      → @docs/05_ia-rbac.md + @docs/14_security.md
Assessment engine code?        → @docs/09_fsd.md + @docs/13_exam-engine-spec.md
```

Use @ references to load the relevant file into context before writing.

---

## Step 5 — Check the Relevant Hard Rule

Before writing, re-read the hard rule from CLAUDE.md that applies to this task.

```
Writing anything with phase conditionals?  → Rule 1 (PHASE_2_FLASH)
Writing flash timing code?                  → Rule 2 (RAF)
Writing flash screen layout?                → Rules 3 + 4 (unmount + transition:none)
Writing auth or role checks?                → Rules 5 + 6 (app_metadata)
Writing any Realtime code?                  → Rules 6 + 7 + 8 (channels + cleanup)
Writing pagehide handler?                   → Rule 9 (teardown Route Handler)
Writing student_answers code?               → Rule 10 (submission_id + question_id)
```

---

## Step 6 — Write the File

Write the complete file. Not a stub. Not a skeleton.
A file with TODO comments and import errors is worse than no file.
If you cannot write the complete file, tell the user why before starting.

---

## Step 7 — Verify After Every File

```bash
npm run tsc
```

If 0 errors: run /complete-task workflow.

If errors: fix every error now. Do not move to the next file.
If you cannot fix after two attempts: run /debug-handoff workflow.

---

## Step 8 — Track Progress

After every file, check off the completed task in docs/17_task-breakdown.md.
Change [ ] to [x] for the exact task you completed.

After every 10 files, update PROGRESS.md:
```markdown
## Last Completed Task
[exact task text]

## Files Written This Session
- [every file path]

## Next Task
[exact next unchecked task]

## Known Issues
[any bugs or discrepancies]
```

---

## Step 9 — Manage Context Proactively

When you have written 10+ files in a session, tell the user:

```
"I have written [N] files this session. Context is getting substantial.
I recommend completing [specific task] and then starting a fresh session.
PROGRESS.md is current. Next task will be: [exact task name]."
```

This is not a failure. It is responsible context management.
A fresh session with a current PROGRESS.md resumes seamlessly.

---

## Step 10 — Commit at Phase Boundaries

When a phase is complete (all tasks checked off + all exit criteria from 03-phase-gate.md passing):

```bash
npm run tsc                    # must be 0 errors
npm run lint                   # must be 0 errors
npm run build                  # must complete
git add -A
git commit -m "Phase X complete: [one-line description]"
git push origin main
```

Vercel auto-deploys on push. Confirm the deployment URL is accessible before starting Phase X+1.
