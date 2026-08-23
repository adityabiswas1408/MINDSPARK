# Trace Template (BUG / FEATURE)

> Reusable template. Copy as `BUG-<slug>.md` or `FEATURE-<slug>.md` in this directory. Never edit this template file directly.

---

- **Title:** 
- **Type:** `[Bug | Feature | Refactor]`
- **Phase:** `[Phase Number]`
- **Related Files:**
  - `path/to/file1.ts`
  - `path/to/file2.tsx`
- **Related Decision / ADR:** `[e.g., DEC-001]`
- **Scope Definition:** `[Concise boundary of what is being touched]`

---

## Attempts (Chronological Log)

### Attempt 1
- **Approach:**
- **Outcome:** `[Failed | Partial | Success]`
- **Findings / Error Output:**

---

## What Worked (Root Cause & Final Solution)
- **Root Cause / Mechanism:**
- **Final Fix / Implementation:**

---

## Verification Evidence
- **Verification Command:** `[e.g., npm run test, npm run tsc, playwright test]`
- **Terminal Output:**
```
[Paste actual terminal command output here]
```

---

## Context Files Updated Checklist
- [ ] `.agent-context/Handover.md`
- [ ] `.agent-context/Decisions.md` (if architectural decision made)
- [ ] `.agent-context/Architecture.md` (if structural changes made)
- [ ] `.agent-context/Constraints.md` (if new invariant identified)
- [ ] `.agent-context/Flow.md` (if flow verified)
