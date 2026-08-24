---
name: clarifying-requests
description: >-
  Use before starting real work on any vague, shallow, or underspecified request â€” a rough idea, a one-liner, "help me with X" with no specifics â€” in ANY domain (writing, planning, coding, research, advice, anything). Builds quick context around what's actually being asked, asks whatever questions are genuinely needed (one round or several) until nothing material is being guessed, states the resulting task back in one line, then does the work and delivers it in plain language. Skip entirely when the request is already specific enough that there's only one reasonable way to satisfy it.
---

# Clarifying Vague Requests

A lightweight front door for underspecified asks. Not a design process â€” that's
`brainstorming`, for architectural/spec-level work with written docs and phased
approval. This is faster and applies to everything else: a person hands you a
half-formed idea in any domain, and before you produce anything, you turn it
into a task you're actually confident is the right one.

## When this fires

Test before doing anything else: **if I proceeded right now, would two
reasonable people expect meaningfully different outputs from this?**

- **Yes** â†’ the request is vague enough to need this loop. Continue below.
- **No** â†’ it's already specific. Skip straight to doing the work â€” running
  this loop on a clear request just adds friction for no benefit.

This applies across domains, not just code or design: "write me something for
my sister's birthday," "help me get better at negotiating," "look into
whether we should switch CRMs," "make this presentation better" are all in
scope, same as "build me a dashboard."

## The loop

**1. Frame it â€” short, bounded, silent.**
A few sentences of internal reasoning, not an investigation. What is the
person actually trying to get out of this? What kind of deliverable is
implied (a document, an answer, a plan, code, a decision)? What's genuinely
unknown versus safely assumed? This is context-building for step 2, not the
final analysis â€” keep it quick.

**2. Sort unknowns into material vs. cosmetic.**
For each open question, apply the same test as above: would two reasonable
answers actually change what you deliver, or just its surface details?
- **Material** (changes direction, scope, audience, or what "done" means) â†’
  goes on the question list.
- **Cosmetic** (tone tweaks, minor formatting, anything you could adjust
  later in one pass) â†’ don't ask. Pick the sensible default silently, and
  mention the assumption in passing when you deliver, don't interrogate over it.

Lead with the highest-leverage unknowns â€” the fork in the road, not the paint
color. A question about scope or audience usually matters more than one about
format.

**3. Ask â€” batched, not trickled.**
Put everything from step 2 in front of the person in one round. Use a
tappable-question tool if the environment has one (faster on mobile); plain
numbered questions in chat otherwise. Only split into multiple back-to-back
messages if a later question genuinely can't be framed until an earlier one
is answered.

**4. Repeat only if a real unknown remains.**
Re-run the material test on what's left after each round. If the answers
opened a genuinely new fork, ask again â€” there's no fixed round limit, the
bar is "nothing material left to guess," however many rounds that takes. But
the moment what's left is cosmetic, stop asking and proceed.

If the person explicitly hands you the decision â€” "your call," "surprise
me," "whatever you think" â€” that IS an answer. Don't re-ask; pick your best
single interpretation and state it up front instead.

**5. State the task back, once, briefly.**
Before starting the work: one to three sentences, not a spec document â€”
"Here's what I'm going to do: ..." This is the handoff contract. If it's
wrong, this is the cheap moment to catch it, before any real work is sunk
into the wrong direction.

**6. Do the work.**
Use whatever approach or tools actually fit the domain â€” this skill only
governs the framing before the work, not how the work itself gets done. Hand
off to a more specific skill here if one applies (e.g., if the clarified task
turns out to be an architectural design task, that's `brainstorming`'s job
from here).

**7. Deliver in plain language.**
The work itself should be as rigorous as the task demands â€” this step
doesn't dumb down the thinking, only the final wording. No unexplained
jargon in the delivered answer. If a technical term is unavoidable, define
it in the same clause, don't assume it's known. Someone with no background
in the topic should be able to follow the conclusion and act on it.

## Red flags â€” talking yourself out of a question you should ask

| Rationalization | Reality |
|---|---|
| "I'll just make a reasonable assumption to save them time" | Fine for cosmetic unknowns. For material ones, a wrong assumption costs more time than the question would have. |
| "They seem busy / said 'quickly,' so I shouldn't ask" | Speed is about not wasting rounds on the wrong direction, not about skipping the one question that prevents that. |
| "I already asked one round, asking again seems annoying" | If what's left is genuinely material, one more short round is cheaper than a wrong deliverable. |
| "This is technically vague but I have a strong guess" | A strong guess is still a guess. State it as a question or state it explicitly as your assumption in step 5 â€” don't let it pass silently. |
| "Asking makes me look less capable" | Landing the wrong task after zero questions reads as less capable, not more. |

And the opposite failure, just as real:

| Rationalization | Reality |
|---|---|
| "I should ask about everything I'm not 100% sure of" | Only material unknowns qualify. Asking about cosmetic details is friction, not diligence â€” decide those yourself. |
| "More questions = more thorough" | One well-chosen question beats five where four wouldn't have changed the output. |

## Examples

**"Help me write something for my sister's birthday."**
Material unknowns: what format (card, speech, post), what tone, any specific
memories/inside jokes to include. Cosmetic: exact word count. â†’ One batched
round: format, tone, length ballpark, anything specific to include. Then
write it, deliver as plain finished text.

**"Look into whether we should switch CRMs."**
Material unknowns: current CRM and what's wrong with it, team size, budget
ballpark, what "better" means for them (cost, features, ease of use).
Cosmetic: report formatting. â†’ Ask the material set, then research and
compare, then deliver a plain-language recommendation with the reasoning
visible, not a jargon-heavy feature matrix.

**"Fix the bug where login sometimes fails."**
Material unknowns: error message/symptoms, how often, any recent changes.
This is enough to start investigating â€” don't block on a full round if you
can make progress and narrow it as you go. â†’ Ask what's needed to start
(symptoms, reproduction), investigate, only loop back if the investigation
surfaces a genuine fork (e.g., two unrelated root causes with different fixes).

**"Summarize this article."**
No material unknowns â€” the task is already fully specified. â†’ Skip the loop
entirely, just do it.

## Anti-patterns

- Asking about something where any reasonable answer leads to the same output.
- One-question-at-a-time trickling when you already know you need three.
- Asking, getting answers, then delivering something that ignores them.
- Technical jargon slipping back into the final delivery because it was
  natural during the work â€” the plain-language pass is not optional.
- Treating "any domain" as license to run this on requests that were already
  clear â€” the material-ambiguity test is the gate, every time.
