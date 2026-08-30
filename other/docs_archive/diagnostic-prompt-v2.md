# MINDSPARK UI Diagnostic Prompt — v2

You are Claude Opus 4.6 operating at absolute maximum
reasoning depth and effort. This is a pure diagnostic
session. You will not write a single line of code. You
will not suggest fixes. You will not modify any file
except the four scratch/output files listed below.

Your sole output is one comprehensive diagnostic report
saved to UI_DIAGNOSTIC_REPORT.md that covers 100% of
the frontend surface with zero omissions, zero wrong
paths, and zero unverified claims.

Every single finding must have:
- Exact file path (verified to exist before citing)
- Exact line number
- Exact spec reference (which doc, which section)
- Exact user-visible impact

If you cannot verify a claim with a file path and line
number — do not include it in the report.

Writable files for this session (everything else is
read-only):
1. docs/verified-file-inventory.txt
2. docs/verified-docs-inventory.txt
3. docs/diagnostic-findings-raw.md   (scratch log)
4. docs/diagnostic-progress.md       (context-overflow save)
5. UI_DIAGNOSTIC_REPORT.md           (final output)

════════════════════════════════════════════════════════
ENVIRONMENT NOTES — READ BEFORE ANYTHING
════════════════════════════════════════════════════════

Shell: bash on Windows. Use Unix syntax and forward
slashes in paths. NEVER use PowerShell cmdlets
(no Get-ChildItem, no Out-File, no Test-Path, no
Select-Object, no Get-Content).

Preferred tools for file operations (per CLAUDE.md):
- File listing: Glob tool with patterns like "src/**/*.tsx"
- File reading: Read tool with offset/limit
- Content search: Grep tool
- Existence check: Bash with `[ -f "path" ] && echo FOUND || echo MISSING`
- File writing: Write tool (never echo >)
- File editing: Edit tool (never sed/awk)

Graph exploration takes precedence over file reading per
CLAUDE.md mandatory rule:
"IMPORTANT: This project has a knowledge graph. ALWAYS
use the code-review-graph MCP tools BEFORE using
Grep/Glob/Read to explore the codebase."

Admin credentials for visual audit: read from
`C:/Users/ADI/.claude/projects/A--MS-mindspark/memory/reference-tooling.md`
(fields: `admin@mindspark.test` / `Admin@123456`).
Do NOT pause for manual login — the memory file has them.

════════════════════════════════════════════════════════
PRE-FLIGHT — BEFORE ANYTHING ELSE
════════════════════════════════════════════════════════

Run these steps first. Do not skip any.

STEP 0A — Build the verified file inventory:

Use the Glob tool for each of these patterns, one call
per pattern:
  src/**/*.tsx
  src/**/*.ts
  src/**/*.css
  src/**/*.js
  src/**/*.mjs

Aggregate all results (deduplicated, alphabetically
sorted) and write to docs/verified-file-inventory.txt
using the Write tool (one path per line).

Then use the Glob tool on docs/**/*.md and docs/**/*.html
and docs/**/*.pdf. Aggregate and write to
docs/verified-docs-inventory.txt.

Report back:
- Total .tsx files found
- Total .ts files found
- Total .css files found
- Total docs/ files found

This inventory is your ground truth. Every file path
you cite in the final report must appear in one of
the two inventory files. No exceptions. No memory.
No assumptions.

STEP 0B — Verify every authority doc path:
For each file in the list below, run:
  [ -f "path" ] && echo "FOUND: path" || echo "MISSING: path"
via the Bash tool. Batch them in a single bash invocation
where practical.

  docs/abacus-edge-design-spec (4).html
  docs/07_hifi-spec.md
  docs/08_a11y.md
  docs/13_exam-engine-spec.md
  docs/18_performance-budget.md
  docs/10_architecture.md
  docs/06_wireframes.md
  src/app/globals.css
  tailwind.config.ts
  postcss.config.js
  CLAUDE.md
  GOTCHAS.md

Report FOUND or MISSING for each.
If any is MISSING — stop and report immediately.
Do not proceed until all authority docs are confirmed.

STEP 0C — Verify the design spec reads correctly:
Use the Read tool on
"docs/abacus-edge-design-spec (4).html"
with offset:1, limit:5.

Confirm the file reads correctly. Report the title line
from the HTML.

Only after 0A, 0B, 0C all pass — output:
"Pre-flight complete. All [N] authority files
confirmed at verified paths. Beginning Phase 1."

════════════════════════════════════════════════════════
PHASE 1 — READ ALL AUTHORITY FILES
Read every file completely. No skimming.
If a file is over 500 lines, read it in chunks using
Read with offset/limit.
════════════════════════════════════════════════════════

Read in this exact order. After each file, output a
one-line acknowledgement with real counts.

FILE 1: docs/abacus-edge-design-spec (4).html
Read completely. Extract and catalogue:
- Every CSS custom property (--variable-name: value)
- Every colour hex value with its token name
- Every shadow definition
- Every border-radius definition
- Every typography definition (font-family, size, weight)
- Every spacing value
- Every animation/transition definition
- The complete NEVER list
After reading: "FILE 1 READ: [N] tokens, [N] colours,
[N] shadows, [N] radius values catalogued."

FILE 2: docs/07_hifi-spec.md
Read completely. Extract and catalogue:
- Every animation specification with exact timing
- Every component state machine
- Every timer threshold (exact percentages)
- Every typography role (all 9)
- Every shadow usage rule
- Every empty state spec
- Every microcopy requirement
- Every NEVER rule
After reading: "FILE 2 READ: [N] animations, [N] states,
[N] typography roles, [N] NEVER rules catalogued."

FILE 3: docs/08_a11y.md
Read completely. Extract and catalogue:
- Every WCAG requirement and level (AA/AAA)
- Every contrast ratio requirement with exact values
- Every ARIA pattern requirement
- Every minimum touch target size
- Every keyboard navigation requirement
- Every screen reader announcement requirement
- Every reduced motion requirement
After reading: "FILE 3 READ: [N] WCAG requirements,
[N] ARIA patterns, [N] touch target rules catalogued."

FILE 4: docs/13_exam-engine-spec.md
Read completely. Extract and catalogue:
- RAF timing engine requirements
- setInterval/setTimeout ban scope (exact files)
- Delta accumulator algorithm requirements
- HMAC clock guard requirements
- Number generator requirements
- Flash display latency budget (exact ms)
After reading: "FILE 4 READ: [N] timing requirements,
[N] algorithm specs catalogued."

FILE 5: docs/18_performance-budget.md
Read completely. Extract and catalogue:
- Every metric with exact threshold value
- JS bundle size limits (first load, per chunk)
- Core Web Vitals targets (LCP, FID, CLS)
- Flash display latency budget
- WebSocket connection budget
- Offline sync budget
After reading: "FILE 5 READ: [N] performance budgets
with exact thresholds catalogued."

FILE 6: docs/10_architecture.md
Read completely. Extract and catalogue:
- Which components MUST be Server Components
- Which components MUST be Client Components
- Component boundary rules
- Supabase realtime topology
- Offline-first data flow
After reading: "FILE 6 READ: [N] component boundary
rules, [N] architecture constraints catalogued."

FILE 7: docs/06_wireframes.md
Read completely. Extract and catalogue:
- Admin sidebar: exact px width
- Admin header: exact px height
- Student sidebar: exact px width
- Student header: exact px height
- Assessment engine: layout rules (no sidebar/header)
- Content area max-width for each panel
- Every layout dimension specified
After reading: "FILE 7 READ: [N] layout dimensions,
[N] grid specs catalogued."

FILE 8: src/app/globals.css
Read completely. Extract and catalogue:
- Every @theme inline token
- Every :root CSS variable
- Every custom class defined
- Every @keyframes animation defined
- Every @config directive
- Which Tailwind configuration is loaded
After reading: "FILE 8 READ: [N] theme tokens,
[N] CSS variables, [N] keyframes, [N] custom classes."

FILE 9: tailwind.config.ts
Read completely. Extract and catalogue:
- Which colors are defined in theme.extend.colors
- Which custom utilities are defined
- Which plugins are loaded
- Whether slate, zinc, or other palettes are extended
After reading: "FILE 9 READ: Tailwind config analysed.
Colors defined: [list]. Plugins: [list]."

FILE 10: postcss.config.js
Read completely. Extract:
- Which PostCSS plugins are loaded and in what order
After reading: "FILE 10 READ: PostCSS chain: [plugins]."

FILE 11: CLAUDE.md
Read completely. Note:
- All hard constraints
- All banned patterns
- All banned colours
- File structure rules
After reading: "FILE 11 READ: [N] hard constraints,
[N] banned patterns catalogued."

FILE 12: GOTCHAS.md
Read completely. Note:
- Every known CSS trap
- Every known DB divergence
- Every known Tailwind v4 issue
After reading: "FILE 12 READ: [N] known gotchas
catalogued."

After all 12 files, output the master catalogue:

"AUTHORITY READING COMPLETE.
Design tokens catalogued: [N]
Banned colours: [list all]
Animations specified: [N]
Typography roles: [N]
WCAG requirements: [N]
Performance budgets: [N]
Layout dimensions: [N]
Hard constraints: [N]
Ready for Phase 1.5 — Graph Exploration."

════════════════════════════════════════════════════════
PHASE 1.5 — GRAPH-FIRST EXPLORATION
Mandatory per CLAUDE.md project rule:
"ALWAYS use the code-review-graph MCP tools BEFORE
 using Grep/Glob/Read to explore the codebase."
════════════════════════════════════════════════════════

Call these in order. Cap each query at 120 seconds per
CLAUDE.md "Code-Review-Graph Build" rule. If any stalls
or returns empty, skip gracefully and continue — do not
retry the same approach.

QUERY 1 — Architecture overview:
  mcp__code-review-graph__get_architecture_overview_tool
Capture the high-level module map. Note which
communities exist and their file counts.

QUERY 2 — Communities:
  mcp__code-review-graph__list_communities_tool
Identify design-system, exam-engine, admin, student
clusters. Note component counts per cluster.

QUERY 3 — Semantic searches for drift candidates:
  mcp__code-review-graph__semantic_search_nodes_tool
Run one call per query string:
  query: "hardcoded hex color inline style"
  query: "hardcoded percentage fake data placeholder"
  query: "setInterval setTimeout animation timing"
  query: "emoji unicode icon"
  query: "undefined keyframe animation name"
  query: "alert confirm native dialog"

QUERY 4 — Critical callers and callees:
  mcp__code-review-graph__query_graph_tool
  pattern: callers_of, node: flash-number.tsx
  pattern: callers_of, node: globals.css
  pattern: callees_of, node: exam-page-client.tsx
  pattern: imports_of, node: live-pulse.tsx
  pattern: imports_of, node: skeletons.tsx

QUERY 5 — Test coverage gaps:
  mcp__code-review-graph__query_graph_tool
  pattern: tests_for, node: anzan-flash-view.tsx
  pattern: tests_for, node: completion-card.tsx
  pattern: tests_for, node: exam-timer.tsx

After all queries: use graph output to re-prioritise
the Groups A-K reading order for Phase 2. Files flagged
by semantic searches move to the front of their group.
Files with no graph edges (suspected dead code) get
flagged for explicit "dead code" check during reading.

If the graph is stale or unavailable, output:
"Phase 1.5 — graph tools unavailable, proceeding with
file-based reading." Do not block on graph issues.

After Phase 1.5, output:
"GRAPH EXPLORATION COMPLETE.
Communities found: [N]
Total nodes in graph: [N]
Drift candidates flagged: [N]
Files prioritised to front of Phase 2: [list]
Ready for Phase 2 — Component Reading."

════════════════════════════════════════════════════════
PHASE 2 — READ EVERY FRONTEND FILE
Read 100% of frontend files. No file left unread.
Use verified-file-inventory.txt as the checklist.
Check off each file as you read it.
════════════════════════════════════════════════════════

Read files in this exact order (grouped by risk/impact):

Group A — Build pipeline (read first — affects everything):
  tailwind.config.ts (already read in Phase 1)
  postcss.config.js (already read in Phase 1)
  src/app/globals.css (already read in Phase 1)
  src/app/layout.tsx
  src/app/page.tsx
  src/app/login/page.tsx
  src/middleware.ts

Group B — Layout wrappers (affects every page):
  src/app/(admin)/layout.tsx
  src/app/(student)/layout.tsx
  src/components/layout/admin-sidebar.tsx
  src/components/layout/top-header.tsx
  src/components/layout/admin-client-provider.tsx
  src/components/layout/student-client-provider.tsx
  src/components/layout/student-header.tsx
  src/components/layout/student-sidebar.tsx
  (verify each exists via [ -f "path" ] before reading)

Group C — Design system primitives (base of everything):
  src/components/ui/badge.tsx
  src/components/ui/button.tsx
  src/components/ui/card.tsx
  src/components/ui/dialog.tsx
  src/components/ui/dropdown-menu.tsx
  src/components/ui/input.tsx
  src/components/ui/label.tsx
  src/components/ui/select.tsx
  src/components/ui/sheet.tsx
  src/components/ui/sonner.tsx
  src/components/ui/table.tsx
  src/components/ui/tabs.tsx
  src/components/ui/textarea.tsx

Group D — Shared components:
  src/components/shared/skeletons.tsx
  src/components/shared/empty-state.tsx
  src/components/shared/loading-spinner.tsx
  src/components/shared/network-banner.tsx
  src/components/shared/sr-announcer.tsx

Group E — Dashboard components:
  src/components/dashboard/kpi-card.tsx
  src/components/dashboard/sparkline-chart.tsx
  src/components/dashboard/score-trend-chart.tsx
  src/components/dashboard/level-distribution-chart.tsx
  src/components/dashboard/live-pulse.tsx
  src/components/dashboard/recent-activity-feed.tsx
  src/components/dashboard/dashboard-charts.tsx
  (verify each path exists before reading)

Group F — Admin pages (all):
  src/app/(admin)/admin/dashboard/page.tsx
  src/app/(admin)/admin/dashboard/loading.tsx
  src/app/(admin)/admin/assessments/page.tsx
  src/app/(admin)/admin/assessments/loading.tsx
  src/app/(admin)/admin/students/page.tsx
  src/app/(admin)/admin/students/loading.tsx
  src/app/(admin)/admin/students/[id]/page.tsx
  src/app/(admin)/admin/levels/page.tsx
  src/app/(admin)/admin/results/page.tsx
  src/app/(admin)/admin/monitor/page.tsx
  src/app/(admin)/admin/monitor/[id]/page.tsx
  src/app/(admin)/admin/monitor/[id]/monitor-client.tsx
  src/app/(admin)/admin/announcements/page.tsx
  src/app/(admin)/admin/announcements/tiptap-editor.tsx
  src/app/(admin)/admin/settings/page.tsx
  src/app/(admin)/admin/settings/settings-client.tsx
  src/app/(admin)/admin/activity-log/page.tsx
  src/app/(admin)/admin/activity-log/activity-log-client.tsx
  src/app/(admin)/admin/reports/page.tsx

Group G — Admin client components:
  src/components/assessments/ — list via Glob and read ALL files
  src/components/dashboard/ — already in Group E
  src/components/levels/ — list via Glob and read ALL files
  src/components/results/ — list via Glob and read ALL files
  src/components/students/ — list via Glob and read ALL files
  src/components/student/ — list via Glob and read ALL files
  (verify each subfolder exists first via Glob)

Group H — Student pages (all):
  src/app/(student)/student/dashboard/page.tsx
  src/app/(student)/student/dashboard/loading.tsx
  src/app/(student)/student/exams/page.tsx
  src/app/(student)/student/exams/loading.tsx
  src/app/(student)/student/exams/[id]/page.tsx
  src/app/(student)/student/exams/[id]/lobby/page.tsx
  src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx
  src/app/(student)/student/results/page.tsx
  src/app/(student)/student/results/loading.tsx
  src/app/(student)/student/profile/page.tsx
  src/app/(student)/student/assessment/[id]/page.tsx
  src/app/(student)/student/assessment/[id]/assessment-client.tsx
  src/app/(student)/student/consent/page.tsx

Group I — Exam engine (highest stakes):
  src/components/exam/exam-page-client.tsx
  src/components/exam/exam-vertical-view.tsx
  src/components/exam/anzan-flash-view.tsx
  src/components/exam/mcq-grid.tsx
  src/components/exam/question-navigator.tsx
  src/components/exam/exam-timer.tsx
  src/components/exam/flash-number.tsx
  src/components/exam/sync-indicator.tsx
  src/components/exam/network-banner.tsx
  src/components/exam/confirm-submit.tsx
  src/components/exam/completion-card.tsx
  src/components/exam/paused-overlay.tsx
  src/components/exam/transition-interstitial.tsx
  (verify each exists)

Group J — Supporting visual/behavioural files:
  src/components/a11y/a11y-ticker-mode.tsx
  src/stores/exam-session-store.ts
  src/stores/ui-store.ts
  src/stores/auth-store.ts
  src/hooks/use-anzan-engine.ts
  src/hooks/use-exam-timer.ts
  src/hooks/use-heartbeat.ts
  src/hooks/use-input-cooldown.ts
  src/hooks/use-reduced-motion.ts
  src/lib/anzan/timing-engine.ts
  src/lib/anzan/number-generator.ts
  src/lib/anzan/color-calibration.ts
  src/lib/anzan/visibility-guard.ts
  src/lib/anticheat/clock-guard.ts
  src/lib/anticheat/tab-monitor.ts
  src/lib/anticheat/teardown.ts
  (verify each exists; list directory via Glob if unsure)

Group K — Non-visual but user-impacting:
These files do not render UI directly but their
behaviour determines what users see (sync state,
auth gates, HMAC validation, RPC payload shape).
They must be read for architecture and fake-data
findings.

  src/lib/offline/indexed-db-store.ts
  src/lib/offline/sync-engine.ts
  src/lib/offline/hmac-sign.ts
  src/lib/auth/rbac.ts
  src/lib/supabase/client.ts
  src/lib/supabase/server.ts
  src/lib/supabase/admin.ts
  src/lib/supabase/middleware.ts
  src/app/api/offline-sync/route.ts
  src/app/api/teardown/route.ts
  src/app/api/consent/verify/route.ts
  src/app/actions/assessments.ts
  src/app/actions/students.ts
  src/app/actions/results.ts
  src/app/actions/levels.ts
  src/app/actions/announcements.ts
  src/app/actions/settings.ts
  src/app/actions/activity-log.ts
  src/app/actions/auth.ts
  (Use Glob on each directory first — read whatever
  exists. The list above is a starting point, not a
  ceiling.)

════════════════════════════════════════════════════════
PHASE 2 — ADDITIONAL DISCOVERY RULE
════════════════════════════════════════════════════════

The file groups above are a starting checklist, not
a ceiling. You are required to discover and read any
additional file that is relevant to the frontend but
not listed above.

DISCOVERY STEP — run before starting GROUP A:

Use the Glob tool with pattern "src/**/*.{tsx,ts}"
and sort alphabetically.

Compare this output against the GROUP A-K lists.
Every file in the inventory that is NOT in Groups A-K
is a candidate for additional reading.

For each unlisted file, apply this test:
  Q1: Does this file render UI or affect visual output?
  Q2: Does this file contain CSS, colour, or layout logic?
  Q3: Does this file affect the exam engine or animations?
  Q4: Does this file contain user-facing text or microcopy?
  Q5: Does this file affect component behaviour or state?

If YES to ANY of the 5 questions — READ IT.
Add it to the report as an [ADDITIONAL FILE] finding.

Examples of files that must be caught by this rule:
- Any new component added after this prompt was written
- Any utility file that applies CSS transformations
- Any hook that affects visual behaviour
- Any store that controls visible UI state
- Any lib file that generates user-facing content
- Any config file that affects what gets bundled

ADDITIONAL DISCOVERY — docs folder:

Apply the same rule to the docs/ folder.
Any doc file not in the Phase 1 reading list that
could contain design, layout, or UI specifications:
  Q1: Does this doc define visual requirements?
  Q2: Does this doc define component behaviour?
  Q3: Does this doc define user-facing text?
  Q4: Does this doc define accessibility requirements?
  Q5: Does this doc define performance requirements?

If YES to ANY — read it and incorporate into the
master catalogue before Phase 2 component reading.

REPORT REQUIREMENT:
In Appendix A of the final report, add sections:

### ADDITIONAL FILES DISCOVERED AND READ
Files found in inventory but not in the original
group list, that were read due to relevance:
| File | Reason Read | Findings |
|------|-------------|----------|

### FILES FOUND BUT DEEMED IRRELEVANT
Files found in inventory but not read:
| File | Reason Skipped |
|------|---------------|

No file may appear in "Irrelevant" without a
written reason. "Not in the list" is not a reason.
The reason must be: "Does not render UI, affect
visual output, contain CSS/colour/layout logic,
affect exam engine, contain user-facing text, or
affect component behaviour."

HOW TO READ EACH FILE:

For every file in Groups A-K (see Group A through Group K above):

1. Verify the path exists in verified-file-inventory.txt.
   If NOT in inventory: skip and note as "path not found".
   Never read a file that is not in the inventory.

2. Read the complete file — no truncation.
   If the file is over 400 lines, read in two passes
   using the Read tool:
     First: offset:1, limit:200
     Second: offset:201, limit:(rest)

3. While reading, check against the master catalogue:

   COLOUR CHECK:
   Every hex value found → is it in the allowed token list?
   Every inline style colour → should it be a CSS variable?
   Every hardcoded #XXXXXX → is it a banned colour?

   TOKEN CHECK:
   Is the component using var(--token) or hardcoded values?
   Are shadcn default tokens overridden with MINDSPARK tokens?

   TYPOGRAPHY CHECK:
   Is DM Mono used for ALL numeric displays?
   Are the 9 typography roles applied correctly?
   Is font-weight correct per spec?

   ANIMATION CHECK:
   Are specified animations implemented?
   Are any forbidden transitions present on flash numbers?
   Are setInterval/setTimeout used where RAF is required?

   A11Y CHECK:
   Are aria-* attributes present where spec requires them?
   Are minimum touch targets met (44px paediatric standard)?
   Is aria-live present on timer?
   Is aria-hidden on decorative flash numbers?

   PERFORMANCE CHECK:
   Is next/dynamic with ssr:false used for heavy components?
   Are recharts components server-rendered (they must not be)?
   Is TipTap loaded without dynamic import?

   ARCHITECTURE CHECK:
   Is 'use client' present only where browser APIs are needed?
   Is adminSupabase used in student routes (BANNED)?
   Are server actions using requireRole()?

   FAKE DATA CHECK:
   Any hardcoded percentages, counts, or placeholder text?
   Any TODO comments indicating incomplete wiring?

   MICROCOPY CHECK:
   Are empty states using spec-approved text?
   Are error states using banned language?
   Are any raw error codes exposed to users?

   LAYOUT CHECK:
   Admin sidebar: is it 240px?
   Student panel max-width: is it 960px?
   Assessment engine: is sidebar/header absent?

   NEVER LIST CHECK:
   Is #FF6B6B used anywhere?
   Is #1A1A1A used anywhere?
   Is #E0E0E0 used anywhere?
   Is #121212 used anywhere?
   Is Roboto Mono used anywhere?
   Is DOMPurify imported anywhere?
   Is transition used on .flash-number?

4. After reading each file, APPEND findings to
   docs/diagnostic-findings-raw.md using the Edit tool
   (or Write tool if first append). Format:

   ## FILE: [exact verified path]
   - line [N] | SEV: [CRITICAL|HIGH|MEDIUM|LOW] | SPEC: [doc § ref] | [finding]
   - line [N] | SEV: ...

   Do NOT output findings to the conversation. Only
   output a progress acknowledgement per group:
   "Group [X] COMPLETE: [N] files read,
    [N] findings appended to diagnostic-findings-raw.md."

   This incremental write is mandatory — findings held
   in conversation memory will be lost to context
   compaction before Phase 5 begins.

════════════════════════════════════════════════════════
PHASE 3 — VISUAL AUDIT
Run this AFTER reading all files, not before.
════════════════════════════════════════════════════════

Use chrome-devtools MCP for visual verification.
Maximum 3 screenshots total — use take_snapshot
(accessibility tree) for all other pages per
CLAUDE.md Screenshot Policy.

Admin login:
  Navigate to https://mindspark-one.vercel.app/login
  Credentials from
  C:/Users/ADI/.claude/projects/A--MS-mindspark/memory/reference-tooling.md
  (admin@mindspark.test / Admin@123456)
  Never paste the password in chat output.

For each page, use take_snapshot (not screenshot):
  /admin/dashboard
  /admin/assessments
  /admin/students
  /admin/levels
  /admin/results
  /admin/monitor
  /admin/announcements
  /admin/settings
  /admin/activity-log
  /student/dashboard
  /student/exams

Use take_screenshot (counts toward 3 limit) for:
  1. /student/exams/[id]/lobby (most complex layout)
  2. /student/exams/[id] (exam engine fullscreen)
  3. /admin/dashboard (most data-dense page)

For EVERY page, run these evaluate_script checks:

CHECK 1 — Sidebar dimensions:
  document.querySelector('aside')?.getBoundingClientRect()
  Expected admin: width = 240px
  Expected student: width = 240px

CHECK 2 — Typography on page:
  Array.from(document.querySelectorAll('*'))
    .filter(el => el.children.length === 0 &&
                  el.textContent.trim().length > 0)
    .map(el => ({
      text: el.textContent.trim().slice(0,30),
      font: getComputedStyle(el).fontFamily,
      size: getComputedStyle(el).fontSize,
      weight: getComputedStyle(el).fontWeight
    }))
    .slice(0,20)
  Check: Are numeric elements using DM Mono?

CHECK 3 — Token usage:
  getComputedStyle(document.documentElement)
    .getPropertyValue('--clr-green-800')
  If empty: tokens not loading. Critical finding.

CHECK 4 — Console errors:
  list_console_messages after each page load
  Record every error and warning.

CHECK 5 — Missing animations:
  On /student/dashboard:
  document.querySelector('[class*="animate-ping"]')
  Expected: LIVE badge pulse ring exists

  On /student/exams/[id]:
  document.querySelector('[class*="transition"]')
  Check timer element has transition on colour change.

Record all visual findings with page URL as the
"file" reference and computed value as evidence.
Append to docs/diagnostic-findings-raw.md under a
new heading "## VISUAL AUDIT — [url]".

════════════════════════════════════════════════════════
PHASE 4 — CROSS-REFERENCE AND VALIDATE
Before writing the report, validate every finding in
docs/diagnostic-findings-raw.md.
════════════════════════════════════════════════════════

For every finding recorded in Phase 2:

VALIDATION STEP 1 — Path verification:
  Confirm the cited file path is in
  verified-file-inventory.txt.
  Use Grep tool on the inventory file, looking for
  the exact path.
  If not found: discard the finding entirely. Record
  the discarded finding in Appendix C.

VALIDATION STEP 2 — Line verification:
  Confirm the cited line number contains the
  claimed content. Use the Read tool with offset:N,
  limit:1 (where N is the line number).
  If the content does not match: correct or discard.

VALIDATION STEP 3 — Spec reference verification:
  Confirm the spec section cited actually says what
  you claim it says. Re-read the relevant section of
  the authority doc — do NOT cite from memory.
  If uncertain: mark finding as [NEEDS VERIFICATION]
  rather than stating it as fact.

VALIDATION STEP 4 — Assumption check:
  Before claiming "X does not exist" — search for it:
    Grep tool with pattern "X" on src/
    Glob tool with pattern "**/*X*"
  Never claim something is missing without searching.
  This rule exists because prior audits falsely
  claimed `live-pulse.tsx`, `skeletons.tsx`, and
  `kpi-card.tsx` were missing when they were present
  at unexpected paths.

After validation: discard all unverified findings.
Only findings that pass all 4 steps enter the final
report. The discarded findings go to Appendix C with
the reason for discard.

════════════════════════════════════════════════════════
PHASE 5 — WRITE THE DIAGNOSTIC REPORT
Write to UI_DIAGNOSTIC_REPORT.md
Do not start writing until Phases 1, 1.5, 2, 3, 4
are complete.
════════════════════════════════════════════════════════

If the final report is projected to exceed 4,000 lines,
write it in incremental passes:
  Pass 1: Write tool — Metadata + Executive Summary +
          Master Token Catalogue
  Pass 2: Edit tool (append) — Hardcoded + Banned +
          Typography
  Pass 3: Edit tool (append) — Animation + A11y + Perf
  Pass 4: Edit tool (append) — Architecture + Fake Data
          + Microcopy + Layout
  Pass 5: Edit tool (append) — Component-by-component
          findings
  Pass 6: Edit tool (append) — Visual Audit + Root Cause
          + Fix List
  Pass 7: Edit tool (append) — Effort Estimate + What
          Works + Appendices A/B/C

This prevents any single Write call from exceeding tool
input limits.

The report must contain ALL sections below.
Do not skip any section.
Do not write vaguely — every statement needs evidence.

────────────────────────────────────────────────────────
## METADATA
────────────────────────────────────────────────────────
Date: [today]
Model: Claude Opus 4.6
Files read: [exact count]
Files in inventory: [exact count]
Coverage: [files read / files in inventory × 100]%
Authority docs read: [list all 12 with line counts]
Findings total: [N]
Findings discarded (failed validation): [N]
Findings in report: [N]

────────────────────────────────────────────────────────
## EXECUTIVE SUMMARY
────────────────────────────────────────────────────────
Maximum 5 sentences.
The single root cause of the broken UI in one sentence.
The 3 most impactful findings.
The estimated effort to fix.

────────────────────────────────────────────────────────
## MASTER TOKEN CATALOGUE
────────────────────────────────────────────────────────
Two columns: SPEC TOKEN vs IMPLEMENTATION TOKEN.

For every token in docs/abacus-edge-design-spec (4).html:

| Spec Token | Spec Value | globals.css Name | globals.css Value | Status |
|------------|------------|------------------|-------------------|--------|
| [SPEC_TOKEN_NAME] | [SPEC_VALUE] | [IMPL_TOKEN_NAME or MISSING] | [IMPL_VALUE or —] | [MATCH or DRIFT or MISSING or RENAMED] |

Do not invent token names. Every row must come from
actually reading the authority file in Phase 1. If a
spec token has no corresponding implementation, the
globals.css column reads MISSING.

Status values: MATCH / DRIFT / MISSING / RENAMED

────────────────────────────────────────────────────────
## HARDCODED VALUE INVENTORY
────────────────────────────────────────────────────────
Every hardcoded hex, px, or magic number found:
| File | Line | Hardcoded Value | Should Be Token | Severity |
|------|------|-----------------|-----------------|----------|

────────────────────────────────────────────────────────
## BANNED VALUE VIOLATIONS
────────────────────────────────────────────────────────
Every instance of banned values from NEVER list:
| File | Line | Banned Value | Spec Reference |
|------|------|--------------|----------------|
If none found: "No banned values detected."

────────────────────────────────────────────────────────
## TYPOGRAPHY AUDIT
────────────────────────────────────────────────────────
For each of the 9 typography roles from spec:
| Role | Spec | Applied Correctly | Violations (file:line) |
|------|------|-------------------|------------------------|

DM Mono violations:
Every numeric element not using DM Mono:
| File | Line | Element | Current Font | Should Be |
|------|------|---------|--------------|-----------|

────────────────────────────────────────────────────────
## ANIMATION AND INTERACTION AUDIT
────────────────────────────────────────────────────────
For every animation specified in 07_hifi-spec.md:
| Animation | Spec Section | Status | File | Notes |
|-----------|-------------|--------|------|-------|
Status: IMPLEMENTED / PARTIAL / MISSING / WRONG

Forbidden transitions found:
| File | Line | Forbidden Pattern | Spec Reference |
|------|------|-------------------|----------------|

────────────────────────────────────────────────────────
## ACCESSIBILITY AUDIT
────────────────────────────────────────────────────────
For each WCAG requirement from 08_a11y.md:
| Requirement | Level | Status | File | Notes |
|-------------|-------|--------|------|-------|

Touch target violations:
| File | Line | Element | Current Size | Required |
|------|------|---------|--------------|---------|

ARIA violations:
| File | Line | Missing/Wrong ARIA | Spec Reference |
|------|------|-------------------|----------------|

────────────────────────────────────────────────────────
## PERFORMANCE AUDIT
────────────────────────────────────────────────────────
For each budget from 18_performance-budget.md:
| Budget | Target | Current Implementation | Status |
|--------|--------|----------------------|--------|

Server-side rendering violations:
| File | Line | Component | Issue |
|------|------|-----------|-------|
(recharts loaded without dynamic, TipTap SSR, etc.)

────────────────────────────────────────────────────────
## ARCHITECTURE VIOLATIONS
────────────────────────────────────────────────────────
'use client' violations (used where not needed):
| File | Line | Reason it's wrong |
|------|------|-------------------|

adminSupabase in student routes:
| File | Line | Severity |
|------|------|----------|

requireRole() missing:
| File | Line | Severity |
|------|------|----------|

────────────────────────────────────────────────────────
## FAKE DATA INVENTORY
────────────────────────────────────────────────────────
Every hardcoded value that should be real data:
| File | Line | Hardcoded Value | Should Query |
|------|------|-----------------|--------------|

────────────────────────────────────────────────────────
## MICROCOPY VIOLATIONS
────────────────────────────────────────────────────────
Banned microcopy found:
| File | Line | Banned Text | Approved Alternative |
|------|------|-------------|---------------------|

Missing empty states:
| Page/Component | Current | Spec Requires |
|----------------|---------|---------------|

────────────────────────────────────────────────────────
## LAYOUT VIOLATIONS
────────────────────────────────────────────────────────
Violations against wireframe dimensions:
| Page | Element | Spec Value | Actual Value | File:Line |
|------|---------|------------|--------------|-----------|

────────────────────────────────────────────────────────
## COMPONENT-BY-COMPONENT FINDINGS
────────────────────────────────────────────────────────
For EVERY component file read:

### [ComponentName]
Path: [exact verified path]
Lines: [line count]
Severity: CRITICAL / HIGH / MEDIUM / LOW / CLEAN
Issues:
  1. Line [N]: [exact finding] — [spec ref]
  2. Line [N]: [exact finding] — [spec ref]
If no issues: "CLEAN — no violations found."

────────────────────────────────────────────────────────
## VISUAL AUDIT FINDINGS
────────────────────────────────────────────────────────
For each page visited:
### /admin/dashboard
Snapshot: [describe what was seen]
Computed styles found:
  Sidebar width: [value] (spec: 240px)
  Token --clr-green-800: [value] (spec: #1A3829)
Console errors: [list or NONE]
Visual deviations from spec: [list]

────────────────────────────────────────────────────────
## ROOT CAUSE ANALYSIS
────────────────────────────────────────────────────────
Based on all evidence — the 5 root causes:

Root Cause 1: [Name]
Evidence: [3 specific file:line examples]
Scope: [N files affected]
User impact: [exact description]

[Repeat for all 5]

────────────────────────────────────────────────────────
## PRIORITISED FIX LIST
────────────────────────────────────────────────────────
Grouped by shared root cause — not by page.
Fixing one item in a group should fix all items.

CRITICAL — [N items]:
  1. [What] — [N files affected] — [user impact]

HIGH — [N items]:
  1. [What] — [N files affected] — [user impact]

MEDIUM — [N items]:
  1. [What] — [N files affected] — [user impact]

LOW — [N items]:
  1. [What] — [N files affected] — [user impact]

────────────────────────────────────────────────────────
## WHAT IS WORKING CORRECTLY
────────────────────────────────────────────────────────
List everything that matches the spec.
This scopes the fix work precisely.

────────────────────────────────────────────────────────
## EFFORT ESTIMATE
────────────────────────────────────────────────────────
| Fix Group | Files to Touch | Regression Risk | Hours |
|-----------|---------------|-----------------|-------|

────────────────────────────────────────────────────────
## APPENDIX A — COMPLETE FILE MANIFEST
────────────────────────────────────────────────────────
Every file in verified-file-inventory.txt.
Status: READ / SKIPPED (with reason) / NOT FOUND

### ADDITIONAL FILES DISCOVERED AND READ
### FILES FOUND BUT DEEMED IRRELEVANT

────────────────────────────────────────────────────────
## APPENDIX B — AUTHORITY DOCS USED
────────────────────────────────────────────────────────
For each authority doc:
| Doc | Path | Lines | Key Extractions |
|-----|------|-------|-----------------|

────────────────────────────────────────────────────────
## APPENDIX C — DISCARDED FINDINGS
────────────────────────────────────────────────────────
Every finding discarded in Phase 4 validation:
| Original Claim | Reason Discarded |
|----------------|-----------------|
This section proves the report's findings are verified.

════════════════════════════════════════════════════════
PHASE 6 — FINAL VERIFICATION BEFORE COMMIT
════════════════════════════════════════════════════════

Before committing the report, run these checks:

CHECK 1 — Path verification:
For every file path cited in the report, verify it
exists using the Bash tool:
  [ -f "path" ] && echo OK || echo BROKEN
Batch paths into a single bash invocation using a for
loop. If any returns BROKEN: fix the citation before
committing.
Report: "[N] paths verified, [N] corrected."

CHECK 2 — Coverage verification:
Count lines in UI_DIAGNOSTIC_REPORT.md via wc -l.
Count files in Appendix A marked READ.
Coverage = files READ / files in inventory × 100
Report: "Coverage: [X]% ([N] of [M] files)"
Minimum acceptable coverage: 100%.
Any skip must appear in "Files Found but Deemed
Irrelevant" with a written Q1-Q5 reason. A skip
without a reason is a blocker.
If coverage is below 100% without all skips justified:
read the missing files before committing.

CHECK 3 — Section completeness:
Verify every section header from Phase 5 exists
in the written report. Use Grep tool on the report
file for each expected `## ` heading.
Report: "[N] of [N] sections present."

CHECK 4 — No memory-based wrong paths:
Use Grep tool on UI_DIAGNOSTIC_REPORT.md for these
known-wrong patterns:
  "docs/specs/"
  "docs/designs/"
  "components/ui/kpi-card"
  "components/admin/admin-sidebar"
  "design-system-v3.html"
If any match: these are the exact mistakes from the
previous audit — fix each cited path before committing.

Only after all 4 checks pass:

CHECK 5 — git status gate:
Run `git status` via the Bash tool.
Confirm that only these files are unstaged changes:
  UI_DIAGNOSTIC_REPORT.md
  docs/verified-file-inventory.txt
  docs/verified-docs-inventory.txt
  docs/diagnostic-findings-raw.md  (optional — scratch)
  docs/diagnostic-progress.md      (optional — overflow save)
Any OTHER modified or untracked file that would be
caught by `git add .` is a blocker — either those
files are unrelated (do not stage them) or represent
scope creep (stop and report).

Then stage ONLY the target files by exact name:
  git add UI_DIAGNOSTIC_REPORT.md
  git add docs/verified-file-inventory.txt
  git add docs/verified-docs-inventory.txt
  git add docs/diagnostic-findings-raw.md   (if present)
Never use `git add -A` or `git add .`.

Then commit:
  git commit -m "chore: comprehensive UI diagnostic —
  [N] files, [N] findings, [X]% coverage"
  git push

════════════════════════════════════════════════════════
FINAL OUTPUT
════════════════════════════════════════════════════════

After the commit, output this summary:

"DIAGNOSTIC COMPLETE.

Files in inventory:     [N]
Files read:             [N]
Coverage:               [X]%   (target: 100%)
Authority docs read:    12 of 12
Graph queries run:      [N]    (Phase 1.5)

Findings breakdown:
  CRITICAL:  [N]
  HIGH:      [N]
  MEDIUM:    [N]
  LOW:       [N]
  Total:     [N]
  Discarded: [N] (failed validation)

Report committed: UI_DIAGNOSTIC_REPORT.md
Scratch log:      docs/diagnostic-findings-raw.md
Commit:           [hash]

Ready for fix phase on your instruction."

════════════════════════════════════════════════════════
ABSOLUTE RULES FOR THIS SESSION
════════════════════════════════════════════════════════

1. NEVER cite a file path not in verified-file-inventory.txt
2. NEVER claim something is missing without searching for it
3. NEVER write a finding from memory — always verify
4. NEVER skip Phase 4 validation — every finding validated
5. NEVER start Phase 5 before completing Phases 1, 1.5, 2, 3, 4
6. NEVER commit until Phase 6 checks all pass
7. NEVER write fix code — diagnosis only
8. NEVER modify any source file (only the 5 writable files
   listed at the top of this prompt)
9. Append findings to docs/diagnostic-findings-raw.md
   after each file read. Do NOT hold findings in
   conversation memory — context compaction will lose
   them before Phase 5. The scratch file is the single
   source of truth for all findings between phases.
10. If context runs out before completion:
    Save progress to docs/diagnostic-progress.md via Write tool.
    Include: last file read, findings count so far,
    which phase you are in, scratch file line count.
    Commit that file so work is not lost.
    Then output: "Context limit reached. Progress
    saved. Continue with: claude --continue"
11. NEVER use PowerShell cmdlets. This session runs
    bash on Windows. Use Unix syntax and the dedicated
    Glob/Grep/Read/Write/Edit/Bash tools.
12. NEVER use `git add -A` or `git add .`. Stage files
    by exact name per CLAUDE.md rule.
13. NEVER paste the admin password in chat output.
    Read it from reference-tooling.md and use it
    directly via the chrome-devtools fill tool.

════════════════════════════════════════════════════════
BEGIN
════════════════════════════════════════════════════════

Start with Pre-flight Step 0A immediately.
Do not ask any questions.
Do not wait for permission between phases.
Execute all phases autonomously.
Only pause if a MISSING authority file is found in 0B
or if the git status gate in Phase 6 CHECK 5 is
blocked by unexpected unstaged files.
