# 01 — Omni Debugger (v2.1)

**What this does:** Paste this into Antigravity with the fields below filled in. Works across any stack or layer (UI glitches, design inconsistencies, backend crashes, or database bugs). It reproduces the problem itself, isolates the root cause before touching code, writes a failing reproduction test where that's actually meaningful, applies a surgical fix, and can optionally sweep the codebase for identical anti-patterns — with a review checkpoint before anything gets mass-edited.

---

## Fill in before sending

**What's wrong:**
[Describe what you saw. Be specific — "the submit button on the checkout page does nothing when clicked" beats "checkout is broken."]

**Where / how you found it:**
[Page URL, screen, API endpoint, or user flow. Exact steps to reproduce, if known.]

**Type:**
- [ ] Doesn't work / throws an unhandled error
- [ ] Looks visually wrong or broken
- [ ] Works fine, but deviates from the design/pattern used elsewhere in the app
- [ ] Backend server error / API failure
- [ ] Database query, schema, or permission (RLS) issue
- [ ] Not sure / possibly multi-layer

**Evidence** (optional, but speeds things up a lot):
[Attach a screenshot, paste the exact error/stack trace, or paste relevant console/network/server log lines.]

**Suspected location** (optional):
[File path, component, route, or table name — leave blank if you don't know.]

---

## Instructions (leave as-is)

`USE systematic-debugging, verification-before-completion, tdd-workflow, karpathy-guidelines, full-output-enforcement, AND clarifying-requests SKILLS TO EXECUTE:`

You're debugging the issue described above, in this workspace. Detect the stack and architecture dynamically from the repo — don't assume.

**Before anything else:** if what's described above is too vague to start investigating at all — not just imperfectly worded — ask the minimum you need to begin. Otherwise, proceed straight to reproduction; don't ask about anything you can go check yourself in the next step.

### 1. Reproduce it yourself (`systematic-debugging`)
- **UI / frontend:** use your browser tool to actually load the page/flow and trigger the defect live — don't take a screenshot as ground truth, confirm it and compare.
- **Backend / API / DB:** trigger it via the smallest direct call, script, or query, then confirm it also happens through the real entry point (API route, UI action, etc.).

### 2. Triage — decide what kind of problem this is
- **Something is broken or errors** (crash, wrong output, silent failure, wrong data): trace backward from where the symptom appears to where the bad state actually originated. Read the full trace. Never fix at the point the error happened to surface if that isn't where it started.
- **Nothing is broken — it just looks wrong or doesn't match the rest of the app**: find how the same kind of component/screen/flow is implemented elsewhere in this codebase and bring this one in line with it. Don't invent a new pattern. If nothing comparable exists, say so and propose the closest existing convention.
- Can't tell which? Investigate first. Only ask me if the two paths need materially different fixes and investigation didn't resolve it.

### 3. Automated reproduction test (`tdd-workflow`) — when it actually applies
- For logic, backend, API, or data bugs in a project that already has a test setup: write a test that fails on the current code and passes once fixed, before touching production files.
- **Skip this** — don't bolt on new test infrastructure just to fix one bug — if the project has no test runner configured, or this is a pure visual/pattern-mismatch issue that a unit test wouldn't meaningfully capture. The live reproduction from step 1 is your regression check instead.

### 4. Surgical root-cause fix (`karpathy-guidelines`)
- One explicit hypothesis first: *"I think X is the root cause because Y."* Test it with the smallest possible change.
- Fix only the lines that trace directly to this root cause. No drive-by refactors, renames, or "while I'm here" cleanup — mention anything else you notice instead of touching it.
- **Circuit breaker:** if three fix attempts fail, stop. Tell me what's ruled out and that this looks architectural, not one more guess away.

### 5. Ship complete code (`full-output-enforcement`)
- Every file you touch, written out in full. No `// rest unchanged`, no truncated diffs, no "similar for the others."

### 6. Verify before calling it done (`verification-before-completion`)
- Reproduce the fix actually working — not "should work now." Run the relevant tests/build/typecheck and show fresh output, not a claim.

---

## Optional add-on: codebase-wide pattern sweep

*Only include this block if you want a full sweep this run — leave it out for a single, contained fix.*

> `USE ponytail-audit SKILL TO EXECUTE:`
>
> 1. Once the primary fix is verified, search the codebase for other occurrences of the same bad pattern, missing check, or inconsistent component.
> 2. **First, output an inventory table** — `File | Line | Description` — of every candidate match. Don't fix anything yet.
> 3. Apply the same verified fix only to entries that are clearly the same root cause, with matching test coverage where step 3 applied. Flag — don't silently touch — anything that looks similar but isn't clearly the same issue.

---

### Example of a filled-in version

**What's wrong:** Clicking "Add to Cart" on a product page does nothing — no error, no toast, no cart update.
**Where / how you found it:** Product detail page, `/products/[id]`. Happens on every product tried, logged in or as guest.
**Type:** Doesn't work / throws an unhandled error
**Evidence:** *(screenshot attached — console shows `TypeError: Cannot read properties of undefined (reading 'id')`)*
**Suspected location:** Probably `AddToCartButton` or the cart context
