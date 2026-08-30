# Complete Skills Catalog & Execution Guide

This document is the human- and agent-readable guide for all **57 installed skills** in `.agents/skills/`. It explains what each skill actually does, when to reach for it, how to trigger it, and common pitfalls to avoid.

---

## Quick Navigation by Category

1. [Planning, Ideation & Context Setup](#1-planning-ideation--context-setup) (6 Skills)
2. [Coding Standards, Architecture & Governance](#2-coding-standards-architecture--governance) (7 Skills)
3. [Simplicity & YAGNI (Ponytail Suite)](#3-simplicity--yagni-ponytail-suite) (4 Skills)
4. [Testing, Debugging, Verification & Takeover Recovery](#4-testing-debugging-verification--takeover-recovery) (6 Skills)
5. [Backend, Database & Infrastructure](#5-backend-database--infrastructure) (3 Skills)
6. [Code Review & Meta-Quality](#6-code-review--meta-quality) (3 Skills)
7. [Frontend, UI & Visual Design](#7-frontend-ui--visual-design) (12 Skills)
8. [Agent Optimization, Model Routing & Memory](#8-agent-optimization-model-routing--memory) (7 Skills)
9. [Document Automation, Media & API Tooling](#9-document-automation-media--api-tooling) (9 Skills)

---

## 1. Planning, Ideation & Context Setup

### `brainstorming`
- **What it actually does:** An interactive dialogue workflow that explores product and feature ideas, evaluates tradeoffs, and produces design specs. Strictly enforces a hard gate requiring explicit human confirmation before writing code.
- **When to use it:** Before starting any creative work, building new user-facing features, or adding functionality. When you have a raw idea and need to clarify scope, UX, and technical approaches through collaborative dialogue.

### `clarifying-requests`
- **What it actually does:** A fast, lightweight triage questioning loop that takes vague, shallow, or one-liner requests, separates material unknowns from cosmetic ones, and asks batched targeted questions.
- **When to use it:** When a user provides an underspecified prompt (*"help me with auth"*, *"improve this page"*, *"make it faster"*). Before starting work on any task where multiple distinct interpretations are possible.

### `intent-driven-coding`
- **What it actually does:** Converts ambiguous feature requests, security updates, or database changes into concrete, testable acceptance criteria, explicit error-handling specs, and defined boundaries.
- **When to use it:** When planning high-impact backend, database, security, or API changes. When defining verifiable acceptance criteria or a definition of done for other developers or subagents.

### `blueprint`
- **What it actually does:** Turns a high-level goal into a phased construction plan for multi-session or multi-agent engineering projects with dependency graphs and PR boundaries.
- **When to use it:** For large features, multi-PR architecture upgrades, or systems that span multiple sessions or multiple concurrent subagents.

### `writing-plans`
- **What it actually does:** Generates exhaustive, bite-sized implementation plans where every step represents 2–5 minutes of focused work. Banned from including vague placeholders ("TBD", "TODO").
- **When to use it:** When you have a clear requirement or design spec and need a sequential step-by-step roadmap to execute immediately.

### `mvp-context-kit`
- **What it actually does:** Installs an ultra-fast, lightweight context harness for small projects, prototypes, hackathons, or 30-day builds. Keeps context overhead minimal with a 1-file `AGENTS.md` and feature-level `BUILD.md` checklists.
- **When to use it:** Fast MVP builds, hackathons, weekend prototypes, or early-stage products where multi-file documentation systems create too much friction.

---

## 2. Coding Standards, Architecture & Governance

### `project-context-system`
- **What it actually does:** Bootstraps and continuously maintains a complete tiered agent memory and context system (`AGENTS.md`, `ARCHITECTURE.md`, `CONSTRAINTS.md`, `SECURITY.md`, `STATE.md`, `DECISIONS.md`, `TESTING.md`, `ROLLBACK.md`).
- **When to use it:** Serious production codebases, multi-developer projects, or when initializing long-term AI-assisted projects that require strict architectural consistency.

### `karpathy-guidelines`
- **What it actually does:** Enforces high-discipline engineering habits: surface assumptions explicitly, default to simplicity, make surgical diffs (touch only requested lines), and demand verifiable proof.
- **When to use it:** On every coding task, refactoring session, or bugfix to prevent silent style drift, accidental overwrites, and unprompted large-scale refactors.

### `architecture-decision-records`
- **What it actually does:** Automatically identifies major technical decision points and authors lightweight, standard ADR markdown documents in `docs/adr/`.
- **When to use it:** When choosing between frameworks, selecting databases, altering auth strategies, or adopting new structural patterns.

### `codebase-onboarding`
- **What it actually does:** Performs structured reconnaissance on an unfamiliar repository, creating an architectural overview, directory map, and starter instructions.
- **When to use it:** When opening a fresh clone, switching to an unfamiliar codebase, or onboarding a new agent to a legacy repository.

### `coding-standards`
- **What it actually does:** Establishes cross-language coding conventions for naming clarity, pure functions, immutability, explicit error handling, and test structures.
- **When to use it:** Writing new application logic, setting up clean architecture layers, or auditing code quality.

### `inherit-legacy-style`
- **What it actually does:** Analyzes existing handcrafted or legacy code across four dimensions (file anatomy, state control, utils patterns, error habits) to produce `.ai-style-rules.md`.
- **When to use it:** When working in established legacy codebases to ensure AI additions match existing project idioms rather than imposing modern conventions.

### `living-docs-governance`
- **What it actually does:** Manages documentation lifecycles across 4 distinct roles (Constitution, Map, Status, History) to prevent outdated documentation and zombie features.
- **When to use it:** During regular documentation reviews, sprint closures, or after major refactors.

---

## 3. Simplicity & YAGNI (Ponytail Suite)

### `ponytail`
- **What it actually does:** Enforces a ruthless YAGNI (You Aren't Gonna Need It) hierarchy: Standard Library > Native Platform Features > Minimal One-Liners > Custom Code > Third-Party Dependencies.
- **When to use it:** When implementing new features, writing utility functions, or proposing architectural solutions.

### `ponytail-audit`
- **What it actually does:** Scans the entire codebase to detect speculative abstractions, dead code, unused dependencies, and mock-heavy tests.
- **When to use it:** Periodic maintenance passes, pre-release audits, or when trimming bloated dependencies.

### `ponytail-debt`
- **What it actually does:** Tracks necessary technical debt and shortcuts with explicit expiration conditions and triggers.
- **When to use it:** When taking calculated shortcuts for speed during MVPs that need clear cleanup triggers.

### `ponytail-review`
- **What it actually does:** Reviews pending git diffs or pull requests against the 5 Ponytail simplicity principles.
- **When to use it:** Before opening a PR or merging a feature branch.

---

## 4. Testing, Debugging, Verification & Takeover Recovery

### `tdd-workflow`
- **What it actually does:** Orchestrates strict Test-Driven Development (Red -> Green -> Refactor) requiring a failing test before writing any functional implementation.
- **When to use it:** Writing new features, fixing bugs, or refactoring critical business logic.

### `systematic-debugging`
- **What it actually does:** A 4-phase root-cause investigation framework (Investigate -> Pattern Analysis -> Single Hypothesis -> Targeted Fix) that bans symptom guessing and enforces a 3-strike architectural halt rule. Includes specialized frontend, backend, and condition-based waiting guides.
- **When to use it:** Whenever encountering any bug, crash, flaky test, 500 error, or unexpected UI behavior.

### `verification-before-completion`
- **What it actually does:** Enforces terminal-driven evidence verification before declaring any task complete or fixed. Prohibits assuming code works based on reasoning alone.
- **When to use it:** Right before closing any issue, submitting a PR, or informing the user that work is finished.

### `full-output-enforcement`
- **What it actually does:** Prevents AI code truncation, placeholders (`// ... rest of code`), and incomplete files during edits.
- **When to use it:** Enforced on all file modification and code generation tasks.

### `project-takeover-recovery`
- **What it actually does:** A 5-phase emergency protocol (Recon -> Quarantine -> Triage -> Stabilize -> Handover) to recover broken, abandoned, or half-finished repositories with zero scope creep.
- **When to use it:** Inheriting broken hackathon projects, abandoned freelance repos, or failed refactors.

### `search-dependencies`
- **What it actually does:** Searches npm, PyPI, and GitHub for well-maintained solutions before writing complex custom utilities from scratch.
- **When to use it:** Before writing custom data parsers, crypto logic, date formatters, or client integrations.

---

## 5. Backend, Database & Infrastructure

### `supabase`
- **What it actually does:** Complete operational guide and tooling for the entire Supabase ecosystem: Database, Auth, SSR cookies (`@supabase/ssr`), Edge Functions, Storage, Realtime, Logs Explorer, RLS policies, and CLI migrations.
- **When to use it:** Any time Supabase is used in a project. Debugging auth flows, writing secure RLS policies, deploying Edge Functions, or troubleshooting database errors.

### `supabase-postgres-best-practices`
- **What it actually does:** Postgres performance optimization guide from Supabase covering 8 prioritized impact categories: query optimization, connection pooling limits, composite/partial indexing, schema design, RLS performance, and vacuum/analyze.
- **When to use it:** Writing complex SQL queries, designing database schemas, fixing high latency, tuning connection pools, or profiling query execution plans with `EXPLAIN ANALYZE`.

### `mcp-builder`
- **What it actually does:** Step-by-step engineering guide for authoring high-quality Model Context Protocol (MCP) servers using FastMCP (Python) or the TypeScript MCP SDK.
- **When to use it:** Creating custom MCP tools, wrapping private internal APIs for LLM use, or exposing database capabilities as agent tools.

---

## 6. Code Review & Meta-Quality

### `receiving-code-review`
- **What it actually does:** Guides the agent to rigorously evaluate code review feedback, verify suggestions against codebase realities, and implement accepted changes cleanly.
- **When to use it:** When processing user feedback, PR review comments, or linter suggestions.

### `skill-stocktake`
- **What it actually does:** Audits all installed skills and custom commands for freshness, trigger clarity, and consistency.
- **When to use it:** When adding new skills, reviewing agent performance, or cleaning up obsolete workflows.

### `skill-creator`
- **What it actually does:** Toolkit for creating, testing, and benchmarking new skills with automated evaluation suites.
- **When to use it:** When authoring new agent capabilities or improving existing skill instructions with evals.

---

## 7. Frontend, UI & Visual Design

### `ui-ux-pro-max`
- **What it actually does:** Comprehensive design intelligence database containing 50+ aesthetic styles, 161 color palettes, 57 font pairings, 161 product types, and 99 UX guidelines across 10 modern stacks (React, Next.js, Vue, Tailwind, shadcn/ui, SwiftUI, Flutter).
- **When to use it:** When selecting design systems, choosing color schemes, setting up typography hierarchies, or building production web and mobile UIs.

### `frontend-design`
- **What it actually does:** Creates distinctive, production-grade frontend interfaces with strong aesthetic intentionality, avoiding generic "AI slop" aesthetics.
- **When to use it:** Building creative landing pages, custom dashboards, interactive widgets, or modern web applications that need an unforgettable look and feel.

### `design-taste-frontend`
- **What it actually does:** Anti-slop frontend styling engine tailored for high-converting marketing sites, agency portfolios, and modern SaaS with curated typography and micro-interactions.
- **When to use it:** Building marketing pages, founder portfolios, or redesigning web applications for modern aesthetic appeal.

### `web-design-guidelines`
- **What it actually does:** Audits frontend code against Web Interface Guidelines, checking accessibility, touch targets, contrast ratios, and layout hierarchy with precise `file:line` reports.
- **When to use it:** Auditing UI quality, running accessibility checks, or reviewing frontend components against industry design best practices.

### `minimalist-ui`
- **What it actually does:** High-density, calm productivity UI design system inspired by Linear, Notion, and Raycast.
- **When to use it:** Building productivity tools, developer utilities, markdown editors, or minimalist dashboards.

### `industrial-brutalist-ui`
- **What it actually does:** High-density mechanical interface design combining Swiss typographic layout with telemetry, aerospace, and terminal aesthetics.
- **When to use it:** Analytics consoles, developer dashboards, security tools, or trading interfaces.

### `redesign-existing-projects`
- **What it actually does:** 3-step structured overhaul (Scan -> Diagnose -> Fix) to upgrade existing web applications across 3 quality tiers (Student, Pro SaaS, Premium Agency).
- **When to use it:** Refactoring ugly or outdated existing interfaces without breaking underlying functionality.

### `image-to-code`
- **What it actually does:** Translates design screenshots, Figma mockups, and UI images into pixel-accurate responsive frontend code.
- **When to use it:** Converting visual mockups, wireframes, or reference screenshots into clean HTML/CSS/React.

### `imagegen-frontend-web`
- **What it actually does:** Generates cohesive section-by-section image prompts for web page heroes, features, and testimonials.
- **When to use it:** Sourcing visual assets and marketing illustrations for web pages.

### `imagegen-frontend-mobile`
- **What it actually does:** Produces native mobile app screen concept prompts framed in realistic device bezels.
- **When to use it:** Creating mobile app mockups, app store previews, or onboarding flows.

### `brandkit`
- **What it actually does:** Generates high-end luxury brand guideline prompts, logo systems, color palettes, and identity decks.
- **When to use it:** Creating new brand identities, style guides, or visual design systems.

### `stitch-design-taste`
- **What it actually does:** Formulates structured `DESIGN.md` prompt contracts optimized specifically for Google Stitch UI generation.
- **When to use it:** Preparing design specifications for Google Stitch workflows.

---

## 8. Agent Optimization, Model Routing & Memory

### `prompt-optimizer` (v2.2.0)
- **What it actually does:** 7-phase advisory prompt engineering engine (Phase 0: Tech Stack Detection -> Phase 1: Intent Classification -> Phase 1.5: Debug Evidence Elicitation -> Phase 2: Audit -> Phase 3: Dynamic Skill Matching -> Phase 4: Missing Context Scan -> Phase 5: Lifecycle Placement -> Phase 6: Synthesis). Formulates self-contained debug packets and ready-to-paste prompt templates with `USE <skills> TO EXECUTE:` invocation prefixes.
- **Key Hard Gate:** **Strict Advisory Halt.** Strictly forbidden from executing the underlying draft task or writing code; stops immediately after Section 5 (Enhancement Rationale).
- **When to use it:** When drafting complex agent prompts, optimizing prompt tokens, finding matching workspace skills, or packaging multi-step bug reports into self-contained debug packets.

### `suggest-model`
- **What it actually does:** Intelligent model router that analyzes task briefs and recommends the single best AI model and reasoning tier (e.g. Gemini 3.7 Flash Thinking, Claude Sonnet 4.6, GPT-OSS 120B) with benchmark-backed justifications.
- **When to use it:** When deciding which model to run a task on, or when optimizing cost vs. reasoning depth for complex workflows.

### `chatlog-filter`
- **What it actually does:** Strips internal telemetry, metadata flags, timestamps, and abandoned regeneration branches from Claude.ai chat exports while preserving 100% of substantive prompts, responses, thinking, and code.
- **When to use it:** Before feeding previous Claude chat export JSONs back into AI contexts or summarization pipelines to dramatically save tokens.

### `context-budget`
- **What it actually does:** Diagnoses and benchmarks context window consumption across files, tools, and skills to prevent context bloat.
- **When to use it:** When session performance degrades or context window usage approaches memory limits.

### `unified-memory`
- **What it actually does:** Cross-harness durable memory system storing persistent project knowledge in portable `ecc.memory.v1` format.
- **When to use it:** Maintaining shared project memory across multiple AI assistants and coding harnesses.

### `import-memory`
- **What it actually does:** Parses and imports memory export files from ChatGPT, Gemini, or other AI assistants into project memory.
- **When to use it:** Migrating existing assistant profiles or project memories from other AI platforms.

### `deep-research`
- **What it actually does:** Multi-step autonomous research engine that searches, crawls, verifies facts, and synthesizes comprehensive research briefs.
- **When to use it:** Broad technical investigations, technology evaluations, or in-depth domain research.

---

## 9. Document Automation, Media & API Tooling

### `docx`
- **What it actually does:** Full-featured Word document (.docx/.dotx) generator and editor supporting tables of contents, tracked changes, formatting, and schema validation.
- **When to use it:** Creating formal reports, printable tests, exam papers, and enterprise Word documents.

### `xlsx`
- **What it actually does:** Spreadsheet (.xlsx/.xlsm) creation, formula recalculation, pandas data processing, and validation.
- **When to use it:** Building financial models, calculating grades, exporting datasets, and auditing spreadsheet formulas.

### `pdf`
- **What it actually does:** PDF inspection, form filling, text extraction, coordinate verification, and document conversion.
- **When to use it:** Automating PDF workflows, filling official forms, or extracting structured data from PDFs.

### `pptx`
- **What it actually does:** PowerPoint presentation (.pptx) authoring, slide layout templating, and chart formatting.
- **When to use it:** Generating pitch decks, lecture slides, meeting presentations, and corporate decks.

### `claude-api`
- **What it actually does:** Multi-language reference for prompt caching, token counting, tool calling, and streaming architectures across TypeScript, Python, and cURL.
- **When to use it:** Implementing Anthropic API integrations or optimizing prompt caching setups.

### `canvas-design`
- **What it actually does:** Visual layout engine for posters, certificates, and graphics with 54 included open-source font families.
- **When to use it:** Designing certificates, high-resolution posters, and visual announcement assets.

### `internal-comms`
- **What it actually does:** Standardized templates for engineering status updates, incident postmortems, executive briefs, and newsletters.
- **When to use it:** Writing clear internal communications, incident reports, and stakeholder updates.

### `algorithmic-art`
- **What it actually does:** Generates interactive p5.js algorithmic art, flow fields, and mathematical curves.
- **When to use it:** Creating interactive generative art, math visualizations, or dynamic creative coding experiments.

### `slack-gif-creator`
- **What it actually does:** Programmatic animated GIF generator with easing curves and palette quantization optimized for Slack.
- **When to use it:** Creating instructional GIFs, UI animation demos, or custom chat animations.\n