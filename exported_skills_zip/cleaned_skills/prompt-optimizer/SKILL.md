---
name: prompt-optimizer
description: >-
  Analyze draft prompts, identify missing context, diagnose gaps, dynamically
  scan and recommend the best skill(s) from the available skills inventory, and
  generate ready-to-paste optimized prompts with skill invocation prefixes.
  STRICTLY ADVISORY — NEVER executes the task or answers the draft prompt itself.
  Output must terminate immediately after Section 5 (Enhancement Rationale).
  TRIGGER when: user says "optimize prompt", "improve my prompt",
  "how to write a prompt for", "help me prompt", "rewrite this prompt",
  "what skill to use with this prompt", "recommend skills for prompt",
  or explicitly asks to enhance prompt quality or find matching skills.
  DO NOT TRIGGER when: user wants the task executed directly, or says
  "just do it". DO NOT TRIGGER when user says "optimize performance",
  "optimize this code" - those are refactoring/performance tasks, not prompt optimization.
metadata:
  origin: community
  author: YannJY02
  version: "2.1.0"
---

# Prompt Optimizer & Skill Recommender

Analyze draft prompts, critique and diagnose gaps, dynamically inspect available skills in the workspace, recommend the optimal skill stack with justification, and output a complete, ready-to-paste optimized prompt.

## When to Use

- User says "optimize this prompt", "improve my prompt", "rewrite this prompt"
- User says "help me write a better prompt for..."
- User says "what's the best way to ask the coding agent to..."
- User pastes a draft prompt and asks for feedback, enhancement, or structuring
- User asks "what skills should I use with this prompt?" or "recommend skills for this task"
- User says "I don't know how to prompt for this"
- User explicitly invokes `/prompt-optimize`

### Do Not Use When

- User wants the task done directly (just execute it)
- User says "optimize this code", "optimize performance" — these are code refactoring/performance tasks, not prompt optimization
- User is asking about environment configuration (use setup skills instead)
- User wants a raw inventory list only without prompt optimization (use `skill-stocktake` instead)
- User says "just do it"

---

## How It Works

### <HARD-GATE: STRICT ADVISORY HALT>

1. **Advisory Only — NEVER Execute the Draft Task:** Do NOT write implementation code, create feature files, run execution commands, or start building the feature. Even if the draft prompt contains detailed requests (e.g., *"Audit this folder...", "Build this UI...", "Fix this bug..."*), you are **strictly forbidden** from generating the deliverable or answering the underlying request.
2. **Zero Context Bleed:** Gathering inspection data to diagnose prompt gaps does NOT authorize you to solve the prompt. Keep all research strictly contained to the gap analysis in Sections 1–5.
3. **Mandatory Output Termination:** Your response MUST stop immediately after **Section 5: Enhancement Rationale**. 
4. **Execution Exception:** Only execute the underlying task if the user explicitly commanded: *"Optimize this prompt and execute it immediately"* or *"Optimize and do it now"*.

Run this 7-phase pipeline sequentially. Present results using the Output Format below.

---

### Analysis Pipeline

#### Phase 0: Project & Environment Detection

Before analyzing the prompt, detect the current project context:

1. Check if instruction files exist in the working directory (e.g. `AGENTS.md`, `ARCHITECTURE.md`, `CONSTRAINTS.md`, `CLAUDE.md`) to understand project conventions.
2. Detect tech stack from project manifest files:
   - `package.json` -> Node.js / TypeScript / React / Next.js
   - `go.mod` -> Go
   - `pyproject.toml` / `requirements.txt` -> Python
   - `Cargo.toml` -> Rust
   - `build.gradle` / `pom.xml` -> Java / Kotlin (Quarkus / Spring Boot)
   - `Package.swift` -> Swift
   - `composer.json` -> PHP
   - `*.csproj` / `*.sln` -> .NET
3. Note detected tech stack for use in Phases 3, 4, and 5.

#### Phase 1: Intent & Category Detection

Classify the user's task into one or more categories:

| Category | Signal Words | Example |
|---|---|---|
| **New Feature** | build, create, add, implement, construct | "Build a student assessment dashboard" |
| **Bug Fix / Debugging** | fix, broken, not working, error, crash, patch | "Fix the clock tampering guard" |
| **Refactoring & Polish** | refactor, clean up, standardize, restructure | "Standardize color palette and typography" |
| **Research & Audit** | audit, investigate, cross-verify, explore | "Audit PDF mockups against markdown specs" |
| **Testing & Verification** | test, vitest, playwright, e2e, verify | "Add unit tests for score calculator" |
| **Documentation & PRD** | document, write prd, spec, explain | "Generate layman PRD documentation" |
| **Database & Schema** | migration, table, RLS, supabase, query | "Create migration for student consent" |
| **UI/UX & Frontend** | design, layout, mockup, css, responsive | "Design assessment player interface" |

#### Phase 2: Scope Assessment

Evaluate the complexity and breadth of the proposed task:

| Scope | Heuristic | Orchestration Strategy |
|---|---|---|
| **TRIVIAL** | Single file, < 50 lines, straightforward edit | Direct single-turn execution |
| **LOW** | Single component, isolated unit test, or minor tweak | Targeted skill invocation |
| **MEDIUM** | Multiple components, same domain, requires verification | Plan -> Implement -> Verify workflow |
| **HIGH** | Cross-domain, 5+ files, schema changes, or UI redesign | Implementation Plan -> TDD -> Multi-file edit -> E2E verify |
| **EPIC** | Multi-session, system re-architecture, full PRD buildout | Blueprint skill -> Phased milestones -> Living docs update |

#### Phase 3: Dynamic Workspace Skills Analysis & Matching

Inspect the active workspace's available skills directory (`.agents/skills/` or builtin skills). Dynamically match the user's intent, scope, and domain against the installed skills:

1. **Identify Primary Skills (Execution Drivers):**
   - *Requirements / Specs / PRDs:* `intent-driven-coding`, `project-context-system`, `living-docs-governance`
   - *Full-Stack / Frontend Design:* `frontend-design`, `ui-ux-pro-max`, `design-taste-frontend`, `image-to-code`
   - *Backend / Database:* `supabase`, `supabase-postgres-best-practices`
   - *Code Implementation & Testing:* `tdd-workflow`, `systematic-debugging`, `coding-standards`
   - *Architecture & Multi-Session:* `blueprint`, `architecture-decision-records`, `writing-plans`

2. **Identify Complementary & Quality Skills (Guardrails):**
   - *Completeness Enforcement:* `full-output-enforcement` (prevents lazy omissions or partial drafts)
   - *Verification & Validation:* `verification-before-completion` (requires proving correctness before finishing)
   - *Conciseness & High Signal:* `karpathy-guidelines` (eliminates fluff and focuses on operational truth)
   - *Audit & Debt:* `ponytail-audit`, `ponytail-review`, `ponytail-debt`

3. **Formulate Recommended Skill Stack:**
   - Select 2 to 4 complementary skills that together guarantee maximum execution quality, safety, and thoroughness.

#### Phase 4: Missing Context & Gap Detection

Scan the draft prompt for missing critical dimensions:

- [ ] **Target Scope & Files:** Are specific files, paths, or modules named?
- [ ] **Acceptance Criteria:** How will the agent know the task is 100% complete?
- [ ] **Edge Cases & Error States:** Are empty states, validation errors, and failure modes covered?
- [ ] **Verification Method:** Are commands, automated tests, or visual review steps defined?
- [ ] **Design & Brand Standards:** Are colors, typography, or UI layout rules referenced?
- [ ] **Negative Constraints (Out of Scope):** Is it stated what the agent must NOT do?

#### Phase 5: Workflow & Lifecycle Recommendation

Determine where this prompt sits in the development lifecycle:
```
Discovery/Audit -> Plan/Acceptance -> Implementation (TDD) -> Quality Review -> Verification -> Living Docs Sync
```

#### Phase 6: Optimized Prompt Synthesis

Generate two distinct, battle-tested prompt templates:
1. **Full Structured Prompt:** Unabridged, comprehensive prompt containing explicit context, requirements, edge cases, acceptance criteria, verification commands, and constraints.
2. **Quick / Streamlined Prompt:** Compact, high-density prompt for rapid execution.

---

## Output Format

Present the analysis using this exact structure:

### Section 1: Prompt Diagnosis

**Strengths:** What the raw prompt does well.

**Gaps & Omissions:**

| Issue / Gap | Impact | Suggested Fix |
|---|---|---|
| (identified flaw) | (why it leads to bad execution) | (how the optimized prompt fixes it) |

---

### Section 2: Recommended Workspace Skills & Execution Rationale

Analyze the prompt against the available skills in the workspace and provide the recommended skill stack:

| Skill Name | Role | Why It Is Recommended for This Task |
|---|---|---|
| `primary-skill-1` | **Primary Driver** | Core methodology for executing this specific task type. |
| `quality-skill-2` | **Quality Guardrail** | Guarantees complete output, no omissions, or strict verification. |
| `domain-skill-3` | **Domain Specialist** | Specialized knowledge for database, UI, or architectural standards. |

**Recommended Invocation Prefix:**
```markdown
USE <skill-1>, <skill-2>, AND <skill-3> SKILLS TO EXECUTE:
```

---

### Section 3: Optimized Prompt — Full Version (Comprehensive)

Present the complete, self-contained optimized prompt in a fenced code block:
```markdown
[Full prompt with Context, Tasks, Acceptance Criteria, Verification Plan, and Scope Boundaries]
```

---

### Section 4: Optimized Prompt — Quick Version

Present the concise version:
```markdown
[Compact version for quick execution]
```

---

### Section 5: Enhancement Rationale

| Enhancement Made | Why It Matters |
|---|---|
| (what was added) | (concrete quality or accuracy benefit) |

---

### <MANDATORY HALT POINT — STOP HERE>

After presenting Section 5, output only a brief 1-sentence closing invitation:
> *"You can copy and run the optimized prompt above with the recommended skill stack, or let me know if you would like to adjust any parameters."*

**CRITICAL INSTRUCTION: DO NOT execute any tasks, DO NOT write files, DO NOT run build/audit scripts, and DO NOT start building the solution.**

---

## Related Skills

| Skill | Role |
|---|---|
| `skill-creator` | Used to create, edit, benchmark, or optimize skills |
| `skill-stocktake` | Audits and inventories all installed workspace skills |
| `intent-driven-coding` | Translates user requirements into verifiable acceptance criteria |
| `full-output-enforcement` | Guarantees complete, unabridged deliverable generation |
| `project-context-system` | Manages living architectural documentation and state |
