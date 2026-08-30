# AGENT SKILLS ENCYCLOPEDIA

> **Unabridged and Exhaustive Reference for 57 Agent Skills**

## 1. Planning, Ideation & Context Setup

### 1. clarifying-requests
**Canonical Path:** `A:\MS\mindspark\.agents\skills\clarifying-requests\SKILL.md`

#### 1. Core Philosophy & Working Principles
- **The Material-Ambiguity Test is the universal gate:** before doing anything, ask *"if I proceeded right now, would two reasonable people expect meaningfully different outputs from this?"* Yes → run the loop; No → skip it entirely.
- **Only material unknowns qualify as questions.** Material = changes direction, scope, audience, or what "done" means. Cosmetic = tone tweaks, minor formatting — decide those silently yourself.
- **Batched, not trickled:** all genuine questions go in one round; never drip one-question-at-a-time when you already know you need several.
- **A stated guess must never pass silently:** a strong guess is still a guess — either ask it or explicitly declare it as an assumption.
- **Explicit delegation of judgment IS an answer:** "your call," "surprise me," "whatever you think" means pick your best single interpretation and state it up front — do not re-ask.
- **Rigor in thinking, plainness in wording:** the work can be as technical as needed, but the delivered answer must contain zero unexplained jargon; define any unavoidable term in the same clause.
- **This skill governs only framing before work,** not how the work itself gets done; it is deliberately lighter than `brainstorming` (which handles architectural/spec-level work with written docs and phased approval).
- **No fixed round limit:** loop until "nothing material left to guess," however many rounds that takes — but stop the moment only cosmetic unknowns remain.

#### 2. Semantic Intent & Trigger Conditions
- **Fires when:** any vague, shallow, or underspecified request in ANY domain — writing, planning, coding, research, advice — e.g., a rough idea, a one-liner, "help me with X" with no specifics ("write me something for my sister's birthday," "help me get better at negotiating," "look into whether we should switch CRMs," "make this presentation better," "build me a dashboard").
- **Does NOT fire when:** the request is already specific enough that there's only one reasonable way to satisfy it (e.g., "Summarize this article" → skip the loop, just do it). Running the loop on a clear request adds friction for no benefit.
- **Positive triggers (implicit):** underspecified asks lacking format, audience, scope, success criteria, or constraints.
- **Negative/delegation triggers that terminate questioning:** "your call," "surprise me," "whatever you think" — treat as answers, not invitations to ask more.
- **Boundary condition:** partially-specified debugging tasks ("fix the bug where login sometimes fails") may start immediately without blocking on a full round, looping back only if investigation surfaces a genuine fork.
- **Handoff boundary:** if clarification reveals an architectural design task, control passes to `brainstorming` from step 6 onward.

#### 3. Phase-by-Phase Internal Mechanics
1. **Frame it — short, bounded, silent.** A few sentences of internal reasoning (not an investigation): what is the person actually trying to get? What deliverable is implied (document, answer, plan, code, decision)? What's genuinely unknown vs. safely assumed? This is context-building for step 2, not final analysis.
2. **Sort unknowns into material vs. cosmetic.** Apply the two-reasonable-people test per question. Material → question list. Cosmetic → silently pick sensible default, mention assumption in passing at delivery. Lead with highest-leverage unknowns (the fork in the road, not the paint color); scope/audience beats format.
3. **Ask — batched, not trickled.** Present everything from step 2 in one round via a tappable-question tool if available (faster on mobile), otherwise plain numbered questions in chat. Split into multiple messages only if a later question genuinely can't be framed until an earlier one is answered.
4. **Repeat only if a real unknown remains.** Re-run the material test after each round; re-ask only if answers opened a genuinely new fork. If the user delegated the decision, stop asking and proceed with best interpretation, stated up front.
5. **State the task back, once, briefly.** One to three sentences — "Here's what I'm going to do: ..." This is the handoff contract; catching errors here is cheap before real work is sunk into the wrong direction.
6. **Do the work.** Use whatever approach/tools fit the domain; hand off to a more specific skill if one applies (e.g., `brainstorming` for architectural design).
7. **Deliver in plain language.** Rigorous thinking preserved, but no unexplained jargon in the final answer; any unavoidable technical term defined in the same clause so someone with no background can follow the conclusion and act on it.

#### 4. Supporting Files, Scripts & Reference Docs
- **`SKILL.md`** — the sole file of this skill; self-contained, no scripts, templates, or reference docs accompany it.
- **Related skill (handoff target, not a companion file): `brainstorming`** — referenced twice as the destination for architectural/spec-level work requiring written docs and phased approval; also the explicit handoff point if clarified work turns out to be an architectural design task (step 6).

#### 5. Hard Gates & Anti-Patterns (Red Flags)
**Mandatory gates:**
- The material-ambiguity test runs *before anything else*, every time — treating "any domain" as license to run this on clear requests is forbidden.
- The plain-language delivery pass is **not optional**, even though jargon was natural during the work.
- Answers received in step 3 must actually shape the delivery — asking then ignoring answers is prohibited.

**Forbidden rationalizations (talking yourself out of a question you should ask):**
| Rationalization | Reality |
|---|---|
| "I'll just make a reasonable assumption to save them time" | Fine for cosmetic unknowns; for material ones, a wrong assumption costs more time than the question. |
| "They seem busy / said 'quickly,' so I shouldn't ask" | Speed = not wasting rounds on the wrong direction, not skipping the one question preventing it. |
| "I already asked one round, asking again seems annoying" | If what's left is genuinely material, one more short round is cheaper than a wrong deliverable. |
| "Technically vague but I have a strong guess" | A strong guess is still a guess — state as a question or declare explicitly as assumption in step 5. |
| "Asking makes me look less capable" | Landing the wrong task after zero questions reads as less capable. |

**Opposite failure mode (over-asking):**
| Rationalization | Reality |
|---|---|
| "Ask about everything I'm not 100% sure of" | Only material unknowns qualify; cosmetic details are yours to decide. |
| "More questions = more thorough" | One well-chosen question beats five where four wouldn't change the output. |

**Explicit anti-pattern list:**
- Asking about something where any reasonable answer leads to the same output.
- One-question-at-a-time trickling when you already know you need three.
- Asking, getting answers, then delivering something that ignores them.
- Technical jargon slipping back into final delivery.
- Running the loop on already-clear requests.

#### 6. Artifacts & Outputs
- **No persistent file artifacts** — this skill produces no `STATE.md`, no docs directory, no scripts, no written specs (that heavyweight artifact flow belongs to `brainstorming`, not here).
- **Conversational outputs only:**
  - **One batched question round** — numbered questions in chat, or tappable-question tool output where the environment supports it.
  - **Task restatement ("handoff contract")** — 1–3 sentences inline, phrased as "Here's what I'm going to do: ...", delivered before work begins.
  - **Final deliverable** — domain-appropriate finished work (text, recommendation, code, plan) rendered in plain language with all jargon defined in-line; assumptions resolved silently during the loop are mentioned in passing within the delivery.

### 2. brainstorming
**Canonical Path:** `A:\MS\mindspark\.agents\skills\brainstorming\SKILL.md`

#### 1. Core Philosophy & Working Principles
- **Approval gate is invariant:** ceremony/artifact size scales with task complexity, but the human-approval gate NEVER scales down — every task on every path requires explicit approval before implementation.
- **Classify first, announce out loud:** state the chosen path (spike/bounded/architectural) aloud before the first question so the human can override.
- **One-way ratchet:** when in doubt between two paths, take the heavier one; hidden complexity discovered mid-task upgrades the path — nothing downgrades mid-task.
- **Per-task sovereignty:** each task gets its own classification and its own approval; prior approvals do not carry over.
- **YAGNI ruthlessly:** strip unnecessary features from every approach and design.
- **Isolation and clarity:** decompose systems into small units with one clear purpose, well-defined interfaces, independently testable; if a unit's purpose isn't understandable without reading internals, boundaries need work.
- **Interrogate one question at a time:** prefer multiple choice; focus on purpose, constraints, success criteria.
- **Respect existing codebases:** follow existing patterns; include only targeted improvements that serve the current goal — no unrelated refactoring.
- **Oversized requests get decomposed:** multi-subsystem requests are flagged immediately and split into sub-projects, each with its own spec → plan → implementation cycle.
- **Terminal states are path-bound:** architectural work flows ONLY into `writing-plans`; spike output is an answer/recommendation, not kept code.

#### 2. Semantic Intent & Trigger Conditions
- **MUST use before any creative work:** creating features, building components, adding functionality, or modifying behavior.
- **Positive triggers (→ Spike):** feasibility phrasing — "can we…", "is it possible…", "quick and dirty is fine".
- **Positive triggers (→ Bounded):** well-scoped change where the flow being changed already exists in the repo (new flag, small endpoint, one-file fix).
- **Positive triggers (→ Architectural):** new projects, new subsystems, restructuring how components fit together, altering interfaces others depend on.
- **Negative trigger / misclassification guard:** "I understand this kind of app" does NOT make a task bounded — bounded measures the repo, not familiarity. No existing flow to read ⇒ architectural.
- **When NOT to proceed to implementation:** never invoke implementation skills, write code, or scaffold projects from within this skill — its terminal outputs are recommendations (spike), direct normal-workflow implementation after approval (bounded), or handoff to `writing-plans` (architectural).

#### 3. Phase-by-Phase Internal Mechanics
1. **Classify** the request as Spike / Bounded / Architectural and announce the classification aloud.
2. **Spike path:** explore context → present question + probe plan in 2–3 sentences → get a nod → investigate as cheaply as correctness allows → report findings as a recommendation; label any built artifact throwaway.
3. **Bounded path:** explore project context (files, docs, recent commits) → ask clarifying questions one at a time → present short design IN CHAT (approach, files touched, testing) → STOP for explicit "yes" → implement via normal development workflow (TDD applies); no plan document.
4. **Architectural path:** explore project context → ask clarifying questions one at a time (purpose/constraints/success criteria) → propose 2–3 approaches with trade-offs, leading with recommendation → present design in sections scaled to complexity (few sentences up to 200–300 words), getting approval after each section → write design doc → self-review spec → user reviews spec → invoke `writing-plans`.
5. **Scope triage during questioning:** if request spans multiple independent subsystems, flag immediately and help decompose into ordered sub-projects; brainstorm only the first sub-project through the normal flow.
6. **Design presentation coverage:** architecture, components, data flow, error handling, testing; be ready to revisit unclear sections.
7. **Spec self-review loop:** placeholder scan (TBD/TODO/vague) → internal consistency check → scope check (single plan or needs decomposition?) → ambiguity check (pick one interpretation, make explicit); fix inline without re-review.
8. **User review gate:** ask user to review committed spec; if changes requested, revise and re-run self-review; proceed only on explicit approval.
9. **Visual question routing:** per question, decide show-vs-describe — mockups/wireframes/layout comparisons/architecture diagrams/state machines are shown via available tools; requirements/tradeoffs/scope decisions are described in text. UI topic ≠ automatically visual question.

#### 4. Supporting Files, Scripts & Reference Docs
- **`SKILL.md`** — sole file; contains all process logic, red-flag table, checklist, and DOT process-flow diagram.
- **Downstream skill dependency:** `writing-plans` — invoked at the end of the architectural path to produce the implementation plan; explicitly the ONLY permitted successor skill.
- No scripts, templates, or reference documents ship with this skill.

#### 5. Hard Gates & Anti-Patterns (Red Flags)
- **HARD-GATE:** do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until intent has been stated and the human partner approved it — applies to EVERY task on EVERY path.
- **Forbidden shortcut — skipping design because "too simple":** simple means a short design (even two sentences in chat), never no design.
- **Forbidden shortcut — label-shopping:** reaching for "bounded" to skip the spec IS the doubt signal; take the heavier path.
- **Forbidden shortcut — start-while-they-read:** presenting the design and starting in the same breath skips the gate; STOP until explicit yes.
- **Forbidden shortcut — keeping spike code:** a spike's output is an answer; keeping the code is a NEW request requiring new classification and approval.
- **Forbidden shortcut — no re-classification when scope grows:** hidden complexity upgrades the path mid-task; stop and say so.
- **Forbidden shortcut — approval inheritance:** spike approval does not approve the follow-up change.
- **Forbidden successor skills (architectural terminal):** never invoke `frontend-design`, `mcp-builder`, or any other implementation skill after brainstorming — only `writing-plans`.

#### 6. Artifacts & Outputs
- **Spike:** verbal/chat recommendation report; any probe code stays labeled throwaway; NO design doc, NO spec file.
- **Bounded:** short in-chat design + direct implementation through normal development workflow; NO spec file, NO plan document.
- **Architectural:** design doc written to `docs/specs/YYYY-MM-DD-<topic>-design.md` (or presented in chat/an artifact if no file tool available; user preferences for spec location override default); committed to git if working in a git repo; then hands off to `writing-plans` skill for the implementation plan.

### 3. blueprint
**Canonical Path:** `A:\MS\mindspark\.agents\skills\blueprint\SKILL.md`

#### 1. Core Philosophy & Working Principles
- **Cold-start executability:** Every plan step must be fully self-contained (context brief, task list, verification commands, exit criteria) so a fresh agent can execute any step cold, without reading prior steps.
- **One-PR granularity:** Objectives are decomposed into one-PR-sized steps, typically 3–12.
- **Adversarial verification:** No plan is final until a strongest-model sub-agent reviews it against a checklist and anti-pattern catalog; all critical findings must be fixed first.
- **Dependency-first design:** Steps carry explicit dependency edges, parallel/serial ordering, per-step model tier assignment (strongest vs default), and rollback strategy.
- **Graceful degradation:** The skill detects git/GitHub CLI availability automatically — full branch/PR/CI workflow when present, direct mode (edit-in-place, no branches) when absent.
- **Zero runtime risk:** Pure Markdown only — no hooks, shell scripts, executable code, `package.json`, or build step; nothing runs on install or invocation beyond Claude Code's native Markdown loader.
- **Formal mutation:** Plans can be split, inserted, skipped, reordered, or abandoned only via formal protocols with an audit trail.

#### 2. Semantic Intent & Trigger Conditions
- **Trigger when:** user requests a plan, blueprint, or roadmap for a complex multi-PR task; or describes work that needs multiple sessions.
- **Do NOT trigger when:** task is completable in a single PR; task needs fewer than 3 tool calls; user says "just do it".
- **Positive use cases:** breaking a large feature into multiple PRs with dependency order; planning multi-session refactors/migrations; coordinating parallel workstreams across sub-agents; any task where context loss between sessions would cause rework.

#### 3. Phase-by-Phase Internal Mechanics
Blueprint runs a 5-phase pipeline:
1. **Research** — Pre-flight checks (git, gh auth, remote, default branch); reads project structure, existing plans, and memory files to gather context.
2. **Design** — Breaks objective into one-PR-sized steps (3–12 typical); assigns dependency edges, parallel/serial ordering, model tier (strongest vs default), and rollback strategy per step.
3. **Draft** — Writes a self-contained Markdown plan file to `plans/`; each step includes context brief, task list, verification commands, and exit criteria.
4. **Review** — Delegates adversarial review to a strongest-model sub-agent (e.g., Opus) against a checklist (completeness, dependency correctness, anti-pattern detection); fixes all critical findings before finalizing.
5. **Register** — Saves the plan, updates memory index, presents step count and parallelism summary to the user.

Environment branching: with git + GitHub CLI → generates full branch/PR/CI workflow plans; without them → switches to direct mode (edit-in-place, no branches). Parallel steps are detected via dependency graph analysis of shared files/output dependencies.

#### 4. Supporting Files, Scripts & Reference Docs
- **`SKILL.md`** — the sole artifact; entire repository contains only `.md` files (no scripts, hooks, or executables).
- **Memory files / memory index** — read during Research; updated during Register.
- **Anti-pattern catalog & review checklist** — embedded reference material consumed by the Review phase.
- **Upstream source:** antbotlab/blueprint (community origin; upstream project and reference design).
- **Distribution contexts:** ships with Everything Claude Code (ECC) at `skills/blueprint/SKILL.md`; vendored standalone installs go to `~/.claude/skills/blueprint/SKILL.md`.

#### 5. Hard Gates & Anti-Patterns (Red Flags)
- **Adversarial review gate:** plan cannot be finalized until all critical findings from the strongest-model reviewer are resolved.
- **Scope gate:** refuse usage for single-PR tasks, <3 tool calls, or explicit "just do it" instructions.
- **Update discipline for vendored copies:** no git remote exists — update by re-copying from a reviewed ECC commit, never via `git pull`.
- **Update discipline for ECC checkouts:** review the diff (`git fetch`, `git log HEAD..origin/main`) and pin to a specific reviewed full SHA before updating.
- **Forbidden shortcuts:** skipping self-contained context briefs per step; executing steps without exit criteria/verification commands; mutating plans outside the formal mutation protocol.

#### 6. Artifacts & Outputs
- **Plan file:** `plans/<project>-<objective-slug>.md` (e.g., `plans/myapp-migrate-database-to-postgresql.md`) — Markdown containing ordered steps, each with context brief, task list, verification commands, exit criteria, dependency edges, model tier assignment, rollback strategy, and post-step invariants (e.g., "all existing tests pass").
- **Memory index update** — registered alongside the saved plan.
- **User-facing summary** — step count and parallelism report presented at completion.

