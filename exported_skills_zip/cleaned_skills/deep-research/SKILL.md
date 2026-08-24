---
name: deep-research
description: >-
  Use for research questions that have real breadth or depth — comparisons ("X vs Y"), open-ended investigations ("research X", "what's the state of X"), multi-part topics, or grounding for substantial content generation (presentations, articles, reports, mockups that need real examples or current data). Provides a systematic multi-angle methodology so Claude doesn't stop after one shallow search. Do NOT use this for single-fact lookups — a date, a price, a current officeholder, "is X still true," "who won Y" — those need one focused search, not a multi-phase process; running the full methodology on them wastes time and makes Claude slower for no benefit. Trigger proactively whenever a topic has multiple sub-dimensions worth covering, or content generation would otherwise lean on stale/general knowledge — even if the user doesn't say "research" explicitly.
---

# Deep Research Skill

## Overview

This skill provides a methodology for thorough web research: multiple angles, multiple passes, full-content reads instead of snippets. Load it before content generation tasks that depend on real-world, current, or comprehensive information.

The methodology is only worth its cost when the question actually has depth. The first job when this skill loads is figuring out how much depth the question needs — see **Calibrate Depth** below before doing anything else.

## When to Use This Skill

**Use it for:**
- Multi-dimensional topics: "explain X" where X has several distinct angles (technical, market, regulatory, etc.)
- Comparisons: "X vs Y", "which is better for Z"
- Open-ended investigation: "research X", "what's the current landscape of X"
- Pre-research for content generation: slide decks, articles, reports, UI mockups, or anything else that needs real examples, current data, or authoritative grounding rather than general knowledge

**Skip it (or use a single targeted search instead) for:**
- Single-fact lookups: a date, a price, a spec, a current title-holder
- Yes/no or "is X still the case" questions with one clear answer
- Questions Claude can already answer correctly from stable, non-time-sensitive knowledge
- A sub-question that comes up mid-task and just needs one quick check, not its own investigation

If it's genuinely unclear which bucket a question falls in, default to a quick Phase 1 survey (below) and let what you find tell you whether it deepens into a real investigation or resolves in one or two searches.

## Calibrate Depth First

Not every research trigger deserves the same amount of work. Match effort to what the question actually needs — this mirrors how search effort should scale generally, not just within this skill:

| Tier | What it looks like | Depth |
|---|---|---|
| **Quick** | One clear fact, even if it needed a search to confirm | 1 search, no phases needed — this shouldn't really be in this skill's territory at all |
| **Medium** | A "what is X" or "how does X work" with a few natural sub-parts, or a comparison between two clear options | Phase 1 (broad survey) + a couple of targeted Phase 2 searches on the sub-parts that matter; skip the full Phase 3 diversity sweep unless something's clearly missing |
| **Deep** | "Research X", open-ended investigation, or grounding for a real content-generation deliverable (deck, report, article) | Full Phase 1–4 methodology below |

Getting this judgment call right matters more than following every phase mechanically on autopilot. A medium-depth question run through the full four-phase process isn't more thorough, it's just slower — the extra searches mostly return the same things the first few already established.

## Research Methodology (Medium and Deep tiers)

### Phase 1: Broad Exploration

Start broad to understand the landscape:

1. **Initial Survey**: Search the main topic to understand overall context
2. **Identify Dimensions**: From initial results, note the subtopics, angles, or perspectives that need deeper exploration
3. **Map the Territory**: Note different viewpoints or stakeholders where relevant

Example:
```
Topic: "AI in healthcare"
Initial searches:
- "AI healthcare applications 2026"
- "artificial intelligence medical diagnosis"
- "healthcare AI market trends"

Identified dimensions:
- Diagnostic AI (radiology, pathology)
- Treatment recommendation systems
- Administrative automation
- Patient monitoring
- Regulatory landscape
```

For a **Medium**-tier question, this phase alone often tells you which 1-2 dimensions actually matter for the answer — go straight to those in Phase 2 rather than exhaustively covering all of them.

### Phase 2: Deep Dive

For each dimension that matters, research it specifically:

1. **Specific Queries**: Precise keywords for each subtopic
2. **Multiple Phrasings**: Try different keyword combinations
3. **Fetch Full Content**: Use `web_fetch` (or your environment's page-fetch tool) to read important sources in full — snippets alone often miss the actual data or nuance
4. **Follow References**: When a source points to another key resource, go get that one too

### Phase 3: Diversity & Validation (Deep tier)

For a genuine deep-research task, round out coverage across information types:

| Information Type | Purpose | Example Searches |
|---|---|---|
| **Facts & Data** | Concrete evidence | "statistics", "data", "market size" |
| **Examples & Cases** | Real-world grounding | "case study", "implementation" |
| **Expert Opinions** | Authority perspective | "expert analysis", "interview" |
| **Trends & Predictions** | Future direction | "trends 2026", "forecast" |
| **Comparisons** | Context vs. alternatives | "vs", "alternatives" |
| **Challenges & Criticisms** | Balance | "limitations", "criticism" |

A Medium-tier question doesn't need all six rows covered — pull in whichever 2-3 are actually relevant to what's being asked.

### Phase 4: Synthesis Check (Deep tier)

Before generating content from a Deep-tier investigation, check:

- [ ] Searched from several genuinely different angles, not just rephrasings of the same query
- [ ] Fetched and read the most important sources in full, not just snippets
- [ ] Have concrete data, real examples, and more than one perspective
- [ ] Covered both the upside and the limitations/challenges
- [ ] Information is current, not stale relative to the topic's pace of change

If something's missing, keep going before moving to content generation. If everything's covered, stop — more searches past this point are diminishing returns, not extra rigor.

## Search Strategy Tips

### Effective Query Patterns

```
# Be specific with context
❌ "AI trends"
✅ "enterprise AI adoption trends 2026"

# Include authoritative source hints
"[topic] research paper"
"[topic] industry analysis"

# Search for specific content types
"[topic] case study"
"[topic] statistics"

# Use temporal qualifiers — pull the real current year from <current_date>, never hardcode one
"[topic] 2026"
"[topic] latest"
```

### Temporal Awareness

Check `<current_date>` before forming any time-sensitive query — it gives year, month, day, and weekday.

| User intent | Precision needed | Example query |
|---|---|---|
| "today / just released" | Month + day | `"tech news February 28 2026"` |
| "this week" | Week range | `"releases week of Feb 24 2026"` |
| "recently / latest" | Month | `"AI breakthroughs February 2026"` |
| "this year / trends" | Year | `"software trends 2026"` |

Never drop to year-only precision when day-level precision is what's needed — `"tech news 2026"` will not surface today's news. Try both numeric (`2026-02-28`) and written (`February 28, 2026`) forms, plus relative terms (`today`, `this week`), across different queries.

### When to Use web_fetch

Fetch full content when a result looks highly relevant and authoritative, when you need detail beyond the snippet, or when the source likely has data, case studies, or analysis worth reading in full rather than skimming a summary of.

### Iterative Refinement

After initial searches: review what you've learned, identify the actual gaps (not just "could search more"), formulate targeted follow-ups for those gaps specifically, and stop once the gaps are closed.

## Common Mistakes to Avoid

- Stopping after one search on a genuinely Deep-tier question
- Relying on snippets when the source clearly has more relevant detail
- Running the full four-phase process on a Quick or Medium-tier question — this is padding, not thoroughness
- Searching only one angle of a genuinely multi-faceted topic
- Ignoring contradicting viewpoints or challenges when they exist
- Using stale information when current data is available and matters
- Starting content generation before a Deep-tier investigation's Phase 4 checklist is actually clean

## Output

After research proportional to the tier:
1. A grounded understanding of the topic at the depth the question actually called for
2. Concrete facts/data where they matter to the answer
3. Real examples where relevant
4. Multiple perspectives for genuinely contested or multi-sided topics
5. Current information where recency matters

Then proceed to content generation, using what was actually gathered — don't pad the output to look more researched than the underlying search depth supports.
