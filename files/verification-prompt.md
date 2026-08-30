# Verification Prompt — systematic-debugging

Use this to grade any transcript (from this skill or a baseline run) against the
eval expectations in `evals.json`. Hand this whole file to a fresh AI agent
session, along with the specific eval's prompt/expectations and the transcript
to grade, and ask it to follow the instructions below.

---

## Instructions for the grading agent

You are grading a single debugging transcript against a fixed checklist. You
did not write the transcript and have no stake in it looking good — grade
skeptically and require actual evidence in the transcript, not the plausibility
of the final answer.

**Inputs you will be given:**
1. `prompt` — the bug report the agent being graded was asked to solve
2. `expectations` — a list of specific, checkable statements (from `evals.json`)
3. `transcript` — the full response/actions of the agent being graded (its
   reasoning, tool calls, code, and final answer — whatever is available)

**What to do:**

For each item in `expectations`, decide `passed: true` or `passed: false` and
write one sentence of `evidence` — a specific pointer to what in the transcript
made you decide that (quote or closely paraphrase the relevant part), or, for
a failed item, state plainly what's missing.

**Grading rules:**
- An expectation passes only if the transcript **explicitly demonstrates** it.
  Do not infer intent — if the agent didn't write it down or do it, it didn't
  happen. "The fix is probably informed by root-cause reasoning" is not
  evidence; a stated hypothesis or traced chain is.
- An expectation about what the agent does **NOT** do (e.g., "does not jump
  straight to a fix") passes if that failure mode is absent from the
  transcript — check the whole transcript, not just the final message, since
  early missteps still count even if the agent recovers later.
- A plausible-sounding final fix does **not** retroactively satisfy
  process expectations (evidence-gathering, hypothesis statement, minimal
  repro). Grade the process, not just the outcome, for those items.
- If the transcript is ambiguous or truncated such that you genuinely cannot
  tell, mark `passed: false` and say so in `evidence` — ungraded/missing
  evidence is a fail, not a free pass.

**Output exactly this JSON shape** (matches skill-creator's `grading.json`
schema so results can be aggregated by that tooling if you're running the
full benchmark harness):

```json
{
  "expectations": [
    {
      "text": "<the expectation text, copied verbatim>",
      "passed": true,
      "evidence": "<one sentence pointing to what in the transcript supports this>"
    }
  ],
  "summary": {
    "passed": 0,
    "failed": 0,
    "total": 0,
    "pass_rate": 0.0
  }
}
```

## Passing criteria — what counts as "100% perfect"

- **100% / pass_rate 1.0** — every expectation for that eval is `true`. This
  means the agent gathered real evidence before proposing a fix, stated an
  explicit hypothesis, avoided the specific symptom-fix trap that eval is
  testing for, and produced a fix aimed at the traced cause. This is the bar
  for "the skill worked as intended" on that eval.
- **Partial (pass_rate between 0 and 1)** — some but not all expectations met.
  Read *which* expectations failed, not just the number — failing "states an
  explicit hypothesis" is a process gap (the skill's discipline wasn't
  followed) even if the eventual fix happened to be correct; that's a more
  important signal than a purely cosmetic miss.
- **0%** — the agent skipped straight to a fix with no visible investigation,
  or made exactly the symptom-fix mistake the eval is designed to catch (e.g.
  bumped a timeout, added a bare retry/try-catch, deleted the polluted file
  without finding the cause).

There is no partial credit *within* a single expectation — each one is a
binary yes/no. "Mostly did it" is a fail; the expectations are written to be
checkable, not fuzzy.

## How to actually run this (given current tooling limits)

This chat interface doesn't have a subagent-spawning tool, so the full
skill-creator loop (spawn with-skill + baseline runs in parallel, auto-grade,
launch the comparison viewer) can't be executed end-to-end from here. Two ways
to use this scaffold:

1. **In Claude Code**, with `skill-creator` available: point it at this skill
   directory and this `evals/evals.json`; it can spawn the with-skill/baseline
   subagent runs and use this file as the grading prompt, producing a
   `benchmark.json` with pass rates for both configurations.
2. **Manually, anywhere:** paste an eval's `prompt` to Claude (with and without
   this skill enabled), save the two transcripts, then start a fresh
   conversation and give it this file plus the `expectations` list plus the
   transcript to grade. You'll get the JSON verdict above for each run.
