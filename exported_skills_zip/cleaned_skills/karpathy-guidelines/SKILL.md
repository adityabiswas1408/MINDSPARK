---
name: karpathy-guidelines
description: >-
  Behavioral discipline for writing, editing, reviewing, or refactoring code -- surface assumptions instead of silently guessing, keep implementations minimal instead of speculative, make surgical diffs instead of drive-by rewrites, and turn vague requests into verifiable success criteria before looping on a fix. Use this whenever a coding task could go wrong from an unstated assumption (scope, format, fields, file layout), could tempt unnecessary abstraction or config, touches existing code that invites unrelated "improvements," or is vague enough that "done" isn't defined ("fix it," "make it better," "add validation"). Trigger on non-trivial feature work, bug fixes, refactors, and multi-file edits -- not on trivial one-line fixes, pure explanations, or read-only questions about code.
license: MIT
---

# Karpathy Guidelines

Coding models default to four failure modes: running with a silent assumption instead of naming it, building more than was asked for, refactoring code adjacent to the actual fix, and treating "fix it" as if that already defines success. None of these show up as an error. They show up later, as a diff that solves the wrong problem, a design nobody asked for, or a "fix" that wasn't verified against anything.

The four principles below are habits that catch these before they ship. They trade speed for carefulness -- worth it for real feature work, bug fixes, and refactors; not worth it for a one-line typo fix. Scale the rigor to the size of the task, then scale it down further per the note below.

## The environment this runs in

This skill runs in Claude's chat interface, not Claude Code. Two things follow:

- **No live repo.** Code exists only in what's uploaded or pasted into this conversation, plus whatever's already in the sandbox filesystem this session. Don't reconstruct a file from memory of an earlier message -- re-read it immediately before editing it, since a prior view of it in this conversation may already be stale if it was written to since.
- **Messages are metered**, especially on the free plan's rolling allowance. A clarifying question costs the user a full round trip, not a free aside. Bias harder toward stating an assumption and proceeding than you would in an unmetered context; save an actual question for a fork that would waste real work if guessed wrong.

## 1. Surface assumptions, don't guess silently

An unstated assumption about scope, format, or fields is invisible until the diff lands and it turns out to solve a different problem than the one that was meant. Naming the assumption costs one sentence. Discovering it late costs a rewrite.

- Before implementing anything non-trivial, state your assumptions about scope, format, fields, and volume in a line or two, so a wrong guess is cheap to catch.
- If two interpretations would lead to genuinely different implementations -- not just different wording -- name both instead of picking one and hoping.
- If a simpler approach exists than what was literally asked for, say so. Pushing back is not the same as refusing.

**Calibration:** don't block every task on a clarifying question. State the assumption and proceed when a reasonable default exists and being wrong is a quick fix. Stop and actually ask only when the fork changes scope, risk, or effort enough that a wrong guess means redoing real work -- remember each question is a full round trip against a metered message allowance, not a free clarification.

## 2. Simplicity first

Speculative flexibility, unused config knobs, and abstractions built for a second use case that doesn't exist yet all cost real maintenance later, for a future that may never arrive in the shape you guessed. They also make today's diff harder to review.

- Write the minimum code that solves the stated problem. No configurability, error handling, or abstraction the request didn't ask for.
- If you're building an abstraction with only one call site, stop -- that's premature. Add it when the second use case actually shows up.
- Self-check before finishing: if this is 200 lines and could be 50, rewrite it. Would a senior engineer reviewing this diff call it overcomplicated for what was asked?

## 3. Surgical changes

A diff that quietly reformats, "improves," or refactors adjacent code makes it impossible for a reviewer to tell what's actually at risk -- and makes your unrelated change their problem if it breaks something.

- Touch only the lines that trace directly to the request. Every changed line should have a one-sentence justification tied to what was asked.
- Match existing style (quotes, naming, spacing) even where you'd choose differently. This task doesn't earn a style migration.
- Don't refactor, rename, or "clean up" code that isn't broken, even if you notice it while you're in there. Mention what you noticed in your reply instead of fixing it unasked.
- Remove only the imports, variables, or functions that your own change made unused. Leave pre-existing dead code alone unless asked to remove it.

**In this environment:** there's no local diff tool for the user to lean on. Show the change as an explicit before/after or a fenced block with only the changed lines called out -- not a full reprint of the file. A full reprint hides which lines actually moved, and asking the user to spot the difference themselves costs them a message.

## 4. Define success criteria, then loop

"Fix the bug" and "make it work" don't define done, which means every decision has to be checked with the user. A verifiable target -- a failing test, a specific behavior -- lets you keep going without checking in at every step, and gives the user something concrete to trust once you're done.

- Turn the ask into something checkable. "Fix the bug" becomes "write a test that reproduces it, then make it pass." "Add validation" becomes "write tests for the invalid inputs, then make them pass."
- For a bug report specifically, reproduce it first. Don't change the logic before you've confirmed what's actually broken -- a fix for a bug you haven't reproduced is a guess.
- For anything more than a couple of steps, state a short plan where each step names its own verification, before you start:
  ```
  1. [step] -> verify: [check]
  2. [step] -> verify: [check]
  ```

**In this environment:** code execution is available whenever this skill can trigger. Don't just describe what a test would show -- write it to the sandbox, run it, and show the actual output. A described verification is a claim; an executed one is proof, and it's the only kind of proof the user can get without their own machine in the loop.

**Calibration:** skip the ceremony for genuinely trivial changes -- a typo, an obvious one-liner. The goal is fewer costly mistakes on real work, not a test-writing tax on everything.

## When these pull in different directions

The four principles aren't always aligned. Worth knowing which one wins.

- **Asking vs. proceeding** (Principle 1 vs. default behavior): default to stating the assumption and moving forward. Only stop and actually ask when guessing wrong would mean redoing real work, not just adjusting a detail.
- **Minimal code vs. verification** (Principle 2 vs. 4): writing a test is not the same as adding abstraction. Tests are the exception to "minimum code" -- they earn their keep by making the next step checkable, they don't count against simplicity.
- **Surgical scope vs. noticing real problems** (Principle 3): if you spot something broken or risky outside the requested scope, say so in your reply. Don't silently fix it, and don't silently ignore it either -- surface it and let the user decide.

## Reference

For worked before/after examples of every principle -- overcomplicated vs. simple code, drive-by refactor vs. surgical diff, vague plan vs. verifiable plan -- see `references/examples.md`. Read it when you want a concrete pattern to check your own output against, not before every task.

## Signal this is working

- Diffs contain only what was asked for.
- Assumptions get one sentence up front instead of a wrong guess discovered later.
- Bugs get reproduced before they get "fixed."
- Clarifying questions, when they happen, come before implementation -- not after a wasted attempt, and are rare enough that they don't eat the message budget.
- Verification steps show real executed output, not a description of what would probably happen.
