# MINDSPARK UI Fix Prompt — v1

You are Claude Opus 4.6 (1M context) operating at maximum reasoning
depth. This is an implementation session. You will execute the fixes
identified in UI_DIAGNOSTIC_REPORT.md, in strict tier order, with
computed-style verification gates between every tier, and commit
each tier as an independent unit of work.

Your sole output is a working, spec-compliant MINDSPARK frontend
deployed to https://mindspark-one.vercel.app that passes every
verification assertion in this prompt.

════════════════════════════════════════════════════════
MISSION
════════════════════════════════════════════════════════

1. Read the diagnostic report and the 6 most load-bearing authority
   docs. Do not re-do the diagnostic — it is finished and committed.
2. Execute the fix list in strict tier order: root-cause first,
   security second, HIGH tail third, from-scratch rebuilds fourth,
   polish last.
3. After each tier: commit, push, and run the verification gate for
   that tier against the live site. Fail → stop and fix before
   proceeding. Never move to the next tier until the current gate
   passes.
4. The exam engine core (`src/lib/anzan/*`, `src/lib/anticheat/*`,
   `src/lib/auth/rbac.ts`, `src/lib/offline/*`, `src/stores/*`, and
   the `flash-number.tsx` / `anzan-flash-view.tsx` internals) is
   spec-clean per the diagnostic. **DO NOT modify these files except
   when a specific finding in the diagnostic report explicitly
   identifies a bug in them.**
5. `npm run tsc` must report 0 errors before every commit. Run it
   after every edit.

════════════════════════════════════════════════════════
ENVIRONMENT NOTES — READ BEFORE ANYTHING
════════════════════════════════════════════════════════

Shell: bash on Windows. Use Unix syntax and forward slashes.
Working directory: A:/MS/mindspark
Production URL: https://mindspark-one.vercel.app
Deploy: `git push origin main` triggers Vercel auto-deploy. Wait
  ~60 seconds after push before running live verification.

Admin test credentials: from
  C:/Users/ADI/.claude/projects/A--MS-mindspark/memory/reference-tooling.md
  (`admin@mindspark.test` / `Admin@123456`). Never paste the
  password in chat output — use chrome-devtools fill tool directly.

Student test credentials: same memory file
  (`student-001@mindspark.local` / `Student@123456`).

Tools (preferred over bash commands per CLAUDE.md):
- File listing: Glob tool
- File reading: Read tool with offset/limit
- Content search: Grep tool
- File writing: Write tool (create) / Edit tool (modify)
- Existence check: Bash `[ -f "path" ] && echo OK || echo MISSING`
- Graph: code-review-graph MCP (impact radius before edits)
- Live browser: chrome-devtools MCP (verification gates)
- Docs lookup: context7 MCP (Tailwind v4, shadcn v4 conventions)

If chrome-devtools throws "browser already running":
  `taskkill //PID <parent-pid> //T //F` after locating the parent
  via `wmic process where "name='chrome.exe'" get ProcessId,CommandLine`
  filtered by `chrome-devtools-mcp\chrome-profile`.

════════════════════════════════════════════════════════
PRE-FLIGHT — BEFORE ANYTHING ELSE
════════════════════════════════════════════════════════

STEP 0A — Verify context files exist:

Use Bash tool to check all required reference files:
  [ -f "UI_DIAGNOSTIC_REPORT.md" ] && echo OK || echo MISSING
  [ -f "docs/diagnostic-findings-raw.md" ] && echo OK || echo MISSING
  [ -f "docs/abacus-edge-design-spec (4).html" ] && echo OK || echo MISSING
  [ -f "docs/07_hifi-spec.md" ] && echo OK || echo MISSING
  [ -f "docs/08_a11y.md" ] && echo OK || echo MISSING
  [ -f "docs/10_architecture.md" ] && echo OK || echo MISSING
  [ -f "docs/13_exam-engine-spec.md" ] && echo OK || echo MISSING
  [ -f "CLAUDE.md" ] && echo OK || echo MISSING
  [ -f "GOTCHAS.md" ] && echo OK || echo MISSING
  [ -f "src/app/globals.css" ] && echo OK || echo MISSING
  [ -f "tailwind.config.ts" ] && echo OK || echo MISSING

All must return OK. If any MISSING — stop and report.

STEP 0B — Read context files in full:
  1. UI_DIAGNOSTIC_REPORT.md (entire file — ~818 lines)
  2. CLAUDE.md (entire file — ~496 lines)
  3. GOTCHAS.md (entire file — ~323 lines)
  4. docs/07_hifi-spec.md (entire file — ~839 lines)
  5. docs/10_architecture.md §3 §5 Zone 1 (lines 140–290) — for
     the postgres_changes → broadcast migration
  6. docs/abacus-edge-design-spec (4).html §28 token sheet
     (search for "28 — Reference" through end) — THIS IS THE
     CANONICAL TOKEN SET you will port into globals.css in Tier 1

After each file: output a one-line acknowledgement with line count.

STEP 0C — Clean baseline:
  Run `npm run tsc` via Bash.
  If errors > 0: stop, fix pre-existing tsc errors first, do not
  add the token work on top of a broken baseline.

STEP 0D — Git state:
  Run `git status --short` via Bash.
  Verify current branch is `main` and tree has no unexpected
  modifications. If there are uncommitted changes from a previous
  session, stop and ask the user whether to include or reset them.

Only after 0A/0B/0C/0D pass — output:
  "Pre-flight complete. Beginning Tier 1 — Root Cause Foundation."

════════════════════════════════════════════════════════
EXECUTION PLAN — 5 TIERS
════════════════════════════════════════════════════════

Each tier is a single atomic commit. Never interleave tiers.
Never skip a tier. Never move to Tier N+1 until Tier N gate passes.

────────────────────────────────────────────────────────
TIER 1 — ROOT CAUSE FOUNDATION (highest leverage)
Target files: 4
Est. effort: 2–3 hours
Commit message prefix: `fix(theme):`
────────────────────────────────────────────────────────

Per UI_DIAGNOSTIC_REPORT.md "ROOT CAUSE ANALYSIS", five root causes
drive ~250 of the 446 findings. This tier fixes them in one pass.

### EDIT 1: src/app/globals.css — token layer rebuild

Replace the `@layer base { :root { ... } }` block AND the
`@theme inline { ... }` block AND the `:root` MINDSPARK override
block (lines ~31–330) with a rewrite that:

1. Declares every token from `docs/abacus-edge-design-spec (4).html`
   §28 "CSS Variables — Final Token Sheet v3" verbatim. Include:
   - Brand: --ms-navy, --ms-navy2, --ms-blue, --ms-orange, --ms-yellow
   - UI system: --page, --card, --border, --bmd, --t1, --t2, --t3
   - Green ramp (ALL 9 shades): --g900 #0D2B1F, --g800 #1A3829,
     --g700 #1E4A35, --g600 #2D6A4F, --g500 #40916C, --g400 #52B788,
     --g300 #74C69D, --g200 #B7E4C7, --g50 #EFFAF4
   - Semantic: --live, --ok-bg/tx, --wn-bg/tx, --er-bg/tx, --in-bg/tx
     (fix --in-bg to #DBEAFE and --in-tx to #1E40AF per spec drift)
   - Crimson: --s-neg #991B1B
   - Flash contrast: --ff-std-tx/bg, --ff-mid-tx/bg, --ff-fast-tx/bg
   - Fonts: --font-sans, --font-mono
   - Shadows: --shadow-sm, --shadow-md, --shadow-lg (exact spec values)
   - Radii: --r1..--r5, --rf

2. Extends Tailwind v4 `@theme inline` with the full colour ramps
   for: green-50..900, red-50..900, blue-50..900, amber-50..900,
   orange-50..900, emerald-50..900, teal-50..900, purple-50..900,
   rose-50..900, indigo-50..900, violet-50..900, gray-50..900,
   yellow-50..900. Use Tailwind v4 default hex values.

3. Fixes the `text-secondary` class collision:
   - Rename MINDSPARK's intent token `--text-secondary` → keep it
   - In the shadcn override block, keep `--secondary: #F1F5F9`
     (shadcn Card bg) but add an explicit `--color-text-secondary:
     var(--text-secondary)` in `@theme inline` so Tailwind generates
     a `text-muted-foreground` OR a new `text-body` utility that
     resolves to `#475569`.
   - Alternative simpler fix: in `@theme inline` add
     `--color-secondary: #475569` to remap the shadcn token to the
     MINDSPARK colour. Verify this doesn't break shadcn Card
     `bg-secondary` usage by grepping `bg-secondary` across src/ —
     if used, pick the `text-muted-foreground` rename instead.
   - Final assertion: `getComputedStyle(body).color` must return
     `rgb(71, 85, 105)` on /login and /admin/dashboard after deploy.

4. Fixes the sidebar token inversion:
   - Change `--sidebar: #1A3829` → `#FFFFFF`
   - Change `--sidebar-foreground: #FFFFFF` → `#0F172A`
   - Change `--sidebar-primary: #FFFFFF` → `#1A3829`
   - Change `--sidebar-primary-foreground: #1A3829` → `#FFFFFF`
   - Change `--sidebar-accent: rgba(255,255,255,0.10)` → `#F0FDF4`
     (green-50 active nav background per 07_hifi-spec §4.6)
   - Change `--sidebar-accent-foreground: #FFFFFF` → `#1A3829`
   - Change `--sidebar-border: rgba(255,255,255,0.15)` → `#E2E8F0`
   - Change `--sidebar-ring: #FFFFFF` → `#1A3829`

5. Adds the 3 missing animation keyframes required by components
   that currently silent-fail:
   - `@keyframes confirm-slide-in` — used by mcq-grid.tsx:128
     ```
     @keyframes confirm-slide-in {
       0%   { transform: translateY(8px); opacity: 0; }
       100% { transform: translateY(0);   opacity: 1; }
     }
     ```
   - `@keyframes completion-slide-up` — used by completion-card.tsx:141
     ```
     @keyframes completion-slide-up {
       0%   { transform: translateY(24px); opacity: 0; }
       100% { transform: translateY(0);    opacity: 1; }
     }
     ```
   - `@keyframes pulse-ring` already exists in globals.css line 161 —
     verify it matches spec `0 → 0 12px rgba(26,56,41,0)` envelope.
     If not, rewrite.

Before writing: use `code-review-graph` MCP
  `get_impact_radius` on `src/app/globals.css` to confirm the
  blast radius is ≤ every tsx file that uses `text-secondary`,
  `bg-sidebar`, or arbitrary colour classes. Report the count.

### EDIT 2: tailwind.config.ts

Keep the file as a minimal v4 config. Tailwind v4 reads colours
from `@theme inline` in globals.css, not from `theme.extend.colors`.
Remove the redundant colour declarations from tailwind.config.ts
EXCEPT keep `fontFamily.sans` and `fontFamily.mono` (they read CSS
vars from next/font). This avoids two sources of truth drifting.

Alternative: if keeping tailwind.config.ts declarations, mirror
every ramp added to globals.css. Do NOT leave tailwind.config.ts
with only `green-800` declared — that's the current bug.

Pick ONE approach (globals.css as source OR tailwind.config.ts as
source) and make it consistent.

### EDIT 3: src/components/layout/admin-sidebar.tsx

Line 34: change `w-[260px]` → `w-[240px]` (spec 07_hifi-spec §4.6).

Line 35: remove the entire inline `style={{ backgroundColor:
'#1A3829', borderRight: '1px solid rgba(255,255,255,0.1)' }}`.
Replace the className with:
```tsx
className="admin-sidebar w-[240px] h-screen shrink-0 flex-col
  bg-sidebar border-r border-sidebar-border"
```

Line 41: `text-white` → `text-sidebar-foreground` (token-driven).

Lines 58–65: Remove the inline style objects for active/inactive
states. Replace with className-based approach using
`data-[active=true]:` variants, or use two className branches:
```tsx
className={cn(
  "flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium",
  "transition-colors outline-none focus-visible:ring-2",
  "focus-visible:ring-sidebar-ring focus-visible:ring-offset-1",
  isActive
    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
)}
```

Lines 65–78: Delete the `onMouseEnter` and `onMouseLeave` handlers
entirely. CSS `:hover` via Tailwind replaces them. This also fixes
the "no touch feedback on tablet" a11y finding.

Line 83: `style={{ color: isActive ? '#1A3829' : 'rgba(255,255,255,0.70)' }}`
→ remove style, let parent text colour cascade.

Verify: import `cn` from `@/lib/utils` if not already.

### EDIT 4: src/components/layout/student-sidebar.tsx

Apply the same pattern as admin-sidebar.tsx:
- Remove `backgroundColor: '#1A3829'` from line 65
- Use `bg-sidebar border-r border-sidebar-border` className
- Replace onMouseEnter/onMouseLeave with Tailwind :hover
- Remove hardcoded hex colours

Keep 240px width (already correct).

### EDIT 5: src/app/layout.tsx

Line 54: Remove `text-secondary` from the body className because it
collides with shadcn's `--secondary`. Replace with:
```tsx
className={cn(
  dmSans.variable,
  dmMono.variable,
  'font-sans antialiased bg-page min-h-screen'
)}
style={{ color: 'var(--text-secondary)' }}
```

Line 65: Skip link `text-[#1A3829]` → `text-green-800`,
`border-[#1A3829]` → `border-green-800`. These now compile because
Tier 1 Edit 1 added the green ramp to `@theme inline`.

### TIER 1 PRE-COMMIT

1. Run `npm run tsc` — must be 0 errors.
2. Stage only these 5 files by exact name.
3. Commit:
   ```
   git commit -m "fix(theme): root cause foundation — tokens, sidebars, keyframes

   Rebuilds the design token layer per abacus-edge-design-spec §28.
   Declares missing Tailwind colour ramps (green-50..900, red, blue,
   amber, orange, emerald, teal, purple, rose, indigo, violet, gray).
   Un-inverts sidebar theme via --sidebar tokens + removes inline
   backgroundColor overrides. Fixes text-secondary class collision.
   Adds missing confirm-slide-in and completion-slide-up keyframes.

   Root causes 1/2/3/4/5 from UI_DIAGNOSTIC_REPORT.md resolved.

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
   ```
4. Push and wait 90 seconds for Vercel deploy.

### TIER 1 VERIFICATION GATE

Use chrome-devtools MCP. Log in as admin. Run `evaluate_script`
with this function on each listed page:

On /admin/dashboard:
```js
() => {
  const aside = document.querySelector('aside');
  const body = document.body;
  const h1 = document.querySelector('aside h1');
  const kpiNumbers = Array.from(document.querySelectorAll('*'))
    .filter(el => el.children.length === 0 &&
      ['Total Students','Active Exams','Avg Score','Live Now']
        .includes(el.textContent?.trim() ?? ''))
    .map(el => el.parentElement?.querySelector('.text-3xl, [class*="text-3xl"], [class*="text-4xl"]'))
    .filter(Boolean)
    .map(el => ({
      font: getComputedStyle(el).fontFamily,
      size: getComputedStyle(el).fontSize,
      weight: getComputedStyle(el).fontWeight,
    }));
  const chartsGrid = document.querySelector('[class*="lg:grid-cols-"]');
  const chartsCols = chartsGrid
    ? getComputedStyle(chartsGrid).gridTemplateColumns
    : 'NONE';
  return {
    assertions: {
      sidebarBg: getComputedStyle(aside).backgroundColor,
      sidebarWidth: aside.getBoundingClientRect().width,
      bodyColor: getComputedStyle(body).color,
      sidebarH1Color: h1 ? getComputedStyle(h1).color : 'MISSING',
      kpiNumbers,
      chartsCols,
    },
  };
}
```

PASS criteria:
- `sidebarBg === 'rgb(255, 255, 255)'`
- `sidebarWidth` between 239 and 241
- `bodyColor === 'rgb(71, 85, 105)'`
- `sidebarH1Color === 'rgb(15, 23, 42)'` (dark on white)
- `kpiNumbers[0].size === '36px'` AND `kpiNumbers[0].weight === '700'`
  (note: this will only pass after Tier 3 kpi-card.tsx fix. For
   Tier 1 gate, accept `size >= '24px'` as provisional pass.)
- `chartsCols` contains a space (two columns, not "1388.67px")

On /admin/monitor (after at least one exam is LIVE):
```js
() => {
  const live = Array.from(document.querySelectorAll('*')).find(el =>
    el.textContent?.trim() === 'LIVE' && el.children.length === 0);
  return {
    bg: live ? getComputedStyle(live).backgroundColor : 'NO-LIVE',
    color: live ? getComputedStyle(live).color : 'NO-LIVE',
  };
}
```

PASS: `bg === 'rgb(239, 68, 68)'` AND `color === 'rgb(255, 255, 255)'`
OR `bg === 'NO-LIVE'` (no live exam to check).

On /admin/students:
```js
() => {
  const avatar = document.querySelector('[class*="bg-teal-100"], [class*="bg-blue-100"], [class*="bg-purple-100"]');
  return avatar
    ? getComputedStyle(avatar).backgroundColor
    : 'NO-AVATAR';
}
```

PASS: result is NOT `rgba(0, 0, 0, 0)` (ramp compiles).

Console check — `list_console_messages` after each page load.
PASS: zero errors. Warnings acceptable.

If ANY assertion fails — stop, fix, re-commit, re-verify. Do not
proceed to Tier 2.

────────────────────────────────────────────────────────
TIER 2 — SECURITY & ARCHITECTURE
Target files: 4
Est. effort: 1 day
Commit message prefix: `fix(security):` for the 3 security items,
                       `fix(architecture):` for the Zone 1 migration
────────────────────────────────────────────────────────

### EDIT 1: src/app/actions/auth.ts

Per UI_DIAGNOSTIC_REPORT.md Component Findings > auth.ts:

Line 15: Replace
  `const tempPassword = 'tempPassword123!';`
With:
  ```ts
  const tempPassword = crypto.randomUUID().replace(/-/g, '') + '!Ab1';
  ```

Line 23: Change
  `await adminSupabase.from('profiles').update({ forced_password_reset: false })`
To:
  `await adminSupabase.from('profiles').update({ forced_password_reset: true })`

Add: after the update, return the `tempPassword` in the ActionResult
data so the admin UI can display it ONCE for hand-off:
```ts
return { ok: true, data: { reset: true, temp_password: tempPassword } };
```

Update the return type. Do NOT log the password anywhere.
Do NOT store it in activity_logs metadata.

### EDIT 2: src/app/api/submissions/offline-sync/route.ts

Line 66: Replace
  `createHmac('sha256', process.env.HMAC_SECRET ?? '')`
With a top-of-file guard:
```ts
const HMAC_SECRET = process.env.HMAC_SECRET;
if (!HMAC_SECRET) {
  throw new Error('[security] HMAC_SECRET env var is not set');
}
```
And in the route body use `HMAC_SECRET` directly.

This fails-closed instead of silently computing HMACs with empty
secret (which are trivially forgeable).

### EDIT 3: src/app/actions/assessment-sessions.ts

Line 196: Replace
  `const seal = 'sealed-' + input.session_id + '-' + Date.now();`
With a real HMAC call:
```ts
import { issueExamSeal } from '@/lib/anticheat/clock-guard';
// ...
const seal = issueExamSeal({
  student_id: userId,
  paper_id: session.paper_id,
  server_timestamp: Date.now(),
  duration_ms: /* paper.duration_minutes * 60000 */,
});
```

You will need to fetch `paper.duration_minutes` from the exam_papers
table if not already in scope. Verify the fetch via GOTCHAS.md
"submissions.paper_id" caveat (no FK).

### EDIT 4: src/app/(admin)/admin/monitor/[id]/monitor-client.tsx

This is the Zone 1 architecture fix per 10_architecture.md §5 Zone 1.

Replace the `postgres_changes` channel at line 130 with a Broadcast
channel. Reference the architecture doc §3 "Channel Architecture"
for the `exam:{assessment_id}` channel spec.

Specifically, replace:
```ts
const dbCh = supabase
  .channel(`monitor-db-${paperId}`)
  .on('postgres_changes', { event: '*', schema: 'public',
      table: 'assessment_sessions', filter: `paper_id=eq.${paperId}` },
      payload => { /* ... */ })
  .subscribe();
```

With:
```ts
const examCh = supabase
  .channel(`exam:${paperId}`)
  .on('broadcast', { event: 'heartbeat' }, ({ payload }) => {
    const { student_id, question_index, timestamp } = payload as
      { student_id: string; question_index: number; timestamp: number };
    setRows(prev => prev.map(r =>
      r.student_id === student_id
        ? { ...r, last_seen: new Date(timestamp), answered_count: question_index }
        : r));
  })
  .on('broadcast', { event: 'answer_saved' }, ({ payload }) => {
    /* similar update */
  })
  .on('broadcast', { event: 'submitted' }, ({ payload }) => {
    /* permanent status transition */
  })
  .on('broadcast', { event: 'status_change' }, ({ payload }) => {
    /* generic status update */
  })
  .subscribe();
```

NOTE: you will also need to add the heartbeat/answer_saved broadcast
emitters from the student-side exam engine. Check `use-anzan-engine.ts`
and `exam-page-client.tsx` — if they don't already send these events,
wire them in. This is the Zone 2 mitigation per architecture spec.

This edit has the highest risk in Tier 2 — it touches realtime
wiring. Run `verify-exam-flow` skill after the push to confirm
the student side still works.

### TIER 2 PRE-COMMIT

1. `npm run tsc` — 0 errors.
2. Split into two commits (security and architecture are separable):
   - Commit A: auth.ts + offline-sync/route.ts + assessment-sessions.ts
     `fix(security): eliminate hardcoded password, empty HMAC fallback, fake seal`
   - Commit B: monitor-client.tsx + any student-side broadcast emitters
     `fix(architecture): migrate monitor from postgres_changes to broadcast (Zone 1)`
3. Push both. Wait for deploy.

### TIER 2 VERIFICATION GATE

Grep assertions (instant):
- `grep -rn "tempPassword123" src/` → 0 matches
- `grep -rn "HMAC_SECRET ?? ''" src/` → 0 matches
- `grep -rn "'sealed-'" src/app/actions/assessment-sessions.ts` → 0 matches
- `grep -rn "postgres_changes" src/app/(admin)/admin/monitor/` → 0 matches

Run verify-exam-flow skill → must pass all steps.
Run verify-admin-pages skill → must pass.

Live test:
1. As student, start an exam. Confirm an answer.
2. As admin (second browser or incognito), observe /admin/monitor/[id]
   — confirm the student's answered_count updates in real-time
   (via the new broadcast channel, not postgres_changes).

If any fails — stop, fix, re-verify.

────────────────────────────────────────────────────────
TIER 3 — HIGH TAIL (component cleanup + widget wiring)
Target files: ~30
Est. effort: 3–5 days
Commit message prefix: `fix(ui):` / `feat(dashboard):`
────────────────────────────────────────────────────────

This tier is the longest but lowest-risk because the token foundation
from Tier 1 means most fixes are 1-line className swaps.

### BATCH 3A — shadcn primitive resize (1 commit)

Per UI_DIAGNOSTIC_REPORT.md Accessibility > Touch target violations:

- `src/components/ui/button.tsx`:
  - Line 32: `size default: "h-8"` → `"h-10"` (40px per spec §4.1)
  - Line 34: `size sm: "h-7"` → `"h-9"`
  - Line 35: `size lg: "h-9"` → `"h-12"` (48px large CTA)
  - Add `size xl: "h-14"` for the Begin Flash button (56px)

- `src/components/ui/input.tsx`:
  - Line 11: `"h-8"` → `"h-10"`

- `src/components/ui/select.tsx`:
  - Line 44: `data-[size=default]:h-8` → `data-[size=default]:h-10`

- `src/components/ui/badge.tsx`:
  - Line 6: `rounded-4xl` → `rounded-md` (6px per spec §3)

- `src/components/ui/card.tsx`:
  - Line 15: `py-4` → `py-6` (24px spec §4.4)
  - Line 29: `px-4` → `px-6`
  - Line 77: `px-4` → `px-6`
  - Replace `ring-1 ring-foreground/10` with `shadow-sm border border-border`
    for spec shadow-sm conformance

- `src/components/ui/dialog.tsx`:
  - Line 51: `rounded-xl` → `rounded-[18px]` or `rounded-2xl`
    (radius-overlay 18px per spec §3)
  - Line 51: add `shadow-lg`
  - Line 34: `bg-black/10` → `bg-[var(--bg-overlay)]` for spec
    0.4 opacity

Commit: `fix(ui): resize shadcn primitives to spec (button 40px, card padding 24px, badge radius 6px)`

Verify: chrome-devtools on /admin/students — check Input height,
Button heights, Card padding via evaluate_script.

### BATCH 3B — KPI card typography + Live Pulse wire-up

Per UI_DIAGNOSTIC_REPORT.md Component Findings > kpi-card.tsx:

- `src/components/dashboard/kpi-card.tsx`:
  - Line 27: Replace className `text-3xl font-bold text-primary
    font-mono tabular-nums leading-none tracking-tight` with:
    ```tsx
    style={{
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '36px',
      fontWeight: 700,
      color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1,
      letterSpacing: 0,
    }}
    ```
    This forces the spec size even if shadcn Card cascade interferes.

  - Line 35: Replace `bg-green-100 text-green-800` trend badge with
    spec-token className (now that green ramps compile):
    `bg-green-50 text-green-800 border border-green-200`

  - Add count-up animation: wrap value in a `useCountUp` hook call
    (800ms ease-out from 0 to value). Spec `abacus-edge-design-spec §24`.

- `src/app/(admin)/admin/dashboard/page.tsx`:
  - Add Live Pulse widget to the header area (top-right of "Dashboard"
    h1). Import `LivePulse` from `@/components/dashboard/live-pulse`.
    Query `exam_papers` where `status = 'LIVE'` and
    `assessment_sessions.status = 'active'` to get counts.
    Render if liveSessionCount > 0.

- `src/components/dashboard/live-pulse.tsx`:
  - Verify the `animate-pulse-ring` class actually compiles after
    Tier 1 added the `@keyframes pulse-ring`. If the Tailwind
    utility `animate-pulse-ring` doesn't auto-generate, use
    inline `style={{ animation: 'pulse-ring 2s infinite' }}`.
  - Line 19: `bg-green-100` now compiles after Tier 1. Verify.

- `src/components/dashboard/dashboard-charts.tsx`:
  - Line 24: `className="grid gap-4 lg:grid-cols-2"` →
    `className="grid gap-4 lg:grid-cols-[3fr_2fr]"` (explicit 60/40
    spec ratio per 07_hifi-spec §5). If that doesn't compile in
    Tailwind v4, use inline `style={{ gridTemplateColumns:
    'minmax(0, 3fr) minmax(0, 2fr)' }}` on lg breakpoint.

Commit: `feat(dashboard): wire Live Pulse widget + fix KPI typography + 60/40 charts`

### BATCH 3C — eliminate hardcoded hex from components (bulk tokenization)

Goal: replace every inline `style={{ backgroundColor: '#1A3829' }}`
and `className="bg-[#1A3829]"` with token references.

Files (from HARDCODED VALUE INVENTORY in the diagnostic):
- `src/components/layout/top-header.tsx` — 5 inline hexes, token replace
- `src/components/layout/student-header.tsx` — line 22 height 64 → 56,
  5 inline hexes → tokens
- `src/components/student/live-exam-card.tsx` — **CRITICAL** line 43
  `backgroundColor: '#1A3829'` → white card with 2px green border
  per 07_hifi-spec §6. Rewrite the card to match spec exactly.
  Also line 148: remove 📋 emoji, use lucide `ClipboardList`.
- `src/app/(student)/student/results/page.tsx` — line 135 same hero
  card inversion fix. Line 112 remove 📋 emoji, use lucide `Inbox`.
- `src/app/(student)/student/dashboard/page.tsx` — convert ENTIRE
  file from inline style={} to className + tokens. Remove fake data
  (see batch 3D).
- `src/app/(admin)/admin/monitor/page.tsx` — line 91 Button className
  `bg-[#1A3829] hover:bg-[#1A3829]/90 text-white` →
  `bg-green-800 hover:bg-green-700 text-primary-foreground`
- `src/app/(admin)/admin/monitor/[id]/monitor-client.tsx` — lines 69-74
  status badge map: all `bg-green-500/green-100/blue-500/red-500/gray-400`
  references now compile since Tier 1 added the ramps. Verify visually.
- `src/app/(admin)/admin/settings/settings-client.tsx` — replace
  all `bg-[#1A3829]` button classes with `bg-green-800`.
- `src/components/assessments/*` — step-type, step-config,
  step-questions, create-assessment-wizard, assessment-card: full
  tokenization sweep. Mostly inline style={{}} → className.
- `src/components/levels/levels-client.tsx` — verify `bg-green-100
  text-green-800` Active badge now compiles.
- `src/components/results/results-client.tsx` — GRADE_BADGE map:
  `bg-emerald-100/orange-100/rose-100` now compile.

Commit this as a single bulk commit:
`fix(ui): tokenize hardcoded hex values across admin + student components`

Before the commit: `grep -rn "#1A3829" src/` — any remaining
instances should be in `src/app/login/page.tsx` (brand anchor) and
`src/lib/anzan/color-calibration.ts:22` (spec rule: negative number
colour is hardcoded). Flag those as acceptable exceptions.

### BATCH 3D — fake data elimination

Per UI_DIAGNOSTIC_REPORT.md FAKE DATA INVENTORY table:

For each row, either:
- Wire the data to real DB queries, OR
- Remove the entire UI widget if no DB backing exists yet.

Priority (delete the fake, don't invent DB columns):
- `src/app/(student)/student/dashboard/page.tsx`:
  - Delete "Progress to next level 42%" + bar
  - Delete "RANK" and "BADGES" tiles
  - Delete "Skill Metrics" card (Logical Reasoning / Speed / Accuracy)
  - Keep only: LiveExamCard, upcoming exams list, level name
- `src/components/levels/levels-client.tsx`:
  - Delete "Avg Competencies" and "Curriculum Density" stat tiles
- `src/app/(admin)/admin/announcements/announcements-client.tsx`:
  - Delete "Engagement Insights" card (lines 196-212)
- `src/app/(admin)/admin/settings/settings-client.tsx`:
  - Delete Auto-Archive toggle + warning (lines 340-370) OR add a
    real `institutions.auto_archive_enabled` column first
- `src/app/(admin)/admin/activity-log/activity-log-client.tsx`:
  - Delete the fake status bar at bottom (INDEX_HEALTH/RETENTION/ALERTS)
- `src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx`:
  - Camera & Mic checklist item: either actually call
    `navigator.mediaDevices.getUserMedia` to check, or DELETE the
    checklist row
  - Secure Browser checklist: DELETE the row (no real check possible
    without a paid SecureBrowser integration)
- `src/components/layout/top-header.tsx`:
  - Line 85: replace hardcoded "PS" avatar with real initials.
    Accept `fullName` prop from parent or fetch in a Client Component
    via `supabase.auth.getUser()`.

Commit: `fix(data): eliminate fake data landmines across dashboard, announcements, activity log, lobby`

### BATCH 3E — banned values cleanup (emoji + alerts)

- `src/components/students/students-table-client.tsx:364` —
  `alert('CSV export coming soon')` → inline toast via sonner
  or remove the button entirely until CSV export is built.
- `src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx:98` —
  `alert(\`Failed to start session: ...\`)` → set local error state
  and render an inline error pill.
- Already handled in 3C: 📋 emoji in live-exam-card.tsx and
  student/results/page.tsx.
- `src/app/(student)/student/exams/[id]/lobby/page.tsx:78` — delete
  the `SESSION ID: ...` debug footer entirely.

Commit: `fix(ui): remove banned alerts, emoji, and debug telemetry from student lobby`

### BATCH 3F — animation + a11y polish

- `src/components/shared/skeletons.tsx`:
  - Replace `animate-pulse` on all skeleton blocks with the spec's
    `skeleton` class from globals.css line 143 (linear-gradient
    shimmer). `className="skeleton rounded-md ..."` instead of
    `className="... animate-pulse rounded-md"`.
  - Add `aria-busy="true"` on the container of each skeleton.
  - Rewrite `DashboardHeroSkeleton` to match the NEW spec live-exam
    card (white card with 2px green border), not the old dark green.

- `src/components/exam/mcq-grid.tsx`:
  - Add arrow-key navigation per 08_a11y §8.2. Wrap the radiogroup
    with `onKeyDown` that cycles A→B→C→D with ArrowRight/Down and
    B→A etc with ArrowLeft/Up.

- `src/components/exam/exam-timer.tsx`:
  - Line 50: replace `text-sm` with inline style
    `fontSize: '30px', fontWeight: 500, fontFamily: 'var(--font-mono)'`
    per spec `mono-timer` role.
  - Fix urgent threshold: compute 20% of total exam duration, not
    hardcoded 5 minutes. Thread total duration down from props or
    compute from expires_at - started_at.

- `src/hooks/use-exam-timer.ts`:
  - Line 50: `const isUrgent = remainingSeconds <= 300`
    → Requires totalDurationMs param. Change signature:
    `useExamTimer(expiresAtIso: string | null, totalDurationMs: number)`
    `const isUrgent = remainingSeconds > 0 && remainingSeconds <= totalDurationMs * 0.0002;`
    (0.2 × 1000 / 1000 seconds conversion; verify math.)

- `src/app/(admin)/admin/announcements/tiptap-editor.tsx`:
  - Add `aria-label` to each toolbar button (replace `title=`).

- `src/components/exam/network-banner.tsx`:
  - Line 17: `border-b-4` → `border-t-4` (spec says border-top)
  - `py-2` → `py-3` for 44px target height
  - `z-[9998]` → `z-[9999]`

Commit: `fix(a11y): skeleton shimmer + aria-busy + MCQ keyboard nav + timer 20% threshold + network banner`

### BATCH 3G — sparkline + chart token corrections

- `src/components/dashboard/sparkline-chart.tsx`:
  - Default `color="text-green-500"` now compiles. Verify.
  - Default width/height: change to spec 60×28 per 07_hifi-spec §4.4.

- `src/components/dashboard/score-trend-chart.tsx`:
  - Replace hardcoded `stroke="#E2E8F0"`, tick `fill: '#475569'`,
    Line `stroke="#1A3829"` with CSS var references.
  - Add area fill `rgba(26,56,41,0.06)` per spec §5 "6-month score trend".

- `src/components/dashboard/level-distribution-chart.tsx`:
  - Same hardcoded hex → token conversion.

- `src/components/results/results-client.tsx`:
  - Area chart stroke `#166534` → `#1A3829` per spec §5 Results detail.
  - Bulk action bar: convert inline pill to floating fixed bottom
    pill per spec §5 "Floating Action Bar".

Commit: `fix(charts): tokenize all recharts configs + sparkline dimensions + area fills`

### TIER 3 PRE-COMMIT

After EACH batch commit:
1. `npm run tsc` — 0 errors.
2. Push.
3. Wait 90s for Vercel deploy.
4. Run chrome-devtools smoke test on the affected pages.

### TIER 3 VERIFICATION GATE

Run the full `verify-admin-pages` skill and `verify-exam-flow` skill.

Bulk grep assertions:
- `grep -rn "#1A3829" src/app/` → only in login/page.tsx
- `grep -rn "#1A3829" src/components/` → only in color-calibration.ts
  and flash-number.tsx (spec-approved)
- `grep -rn "📋\|🧠" src/` → 0 matches outside CLAUDE.md quotes
- `grep -rn "alert(" src/app/ src/components/` → 0 matches
- `grep -rn "bg-green-100\|bg-red-100\|bg-blue-100" src/` — fine
  now that ramps compile

Live visual pass: chrome-devtools navigates /admin/dashboard,
/admin/students, /admin/assessments, /admin/monitor,
/admin/announcements, /admin/settings, /student/dashboard,
/student/exams. evaluate_script batch asserts no `rgba(0,0,0,0)`
computed background on badges/avatars/status indicators.

────────────────────────────────────────────────────────
TIER 4 — FROM-SCRATCH REBUILDS
Target files: 4 (2 required, 2 product decisions)
Est. effort: 3–4 days
Commit message prefix: `feat(profile):` / `feat(lobby):`
────────────────────────────────────────────────────────

### STOP-AND-ASK POINT 1: /student/tests and /admin/reports

These two routes exist as placeholder pages with sidebar nav links.
Before building them:

ASK THE USER:
"The diagnostic surfaced two placeholder routes: /student/tests and
/admin/reports. Both have sidebar nav links but no spec definition.
Do you want to:
(a) Build /student/tests as a 'Practice Tests' page (spec undefined,
    would need product input on what content it shows)
(b) Remove the Tests nav link from student sidebar
(c) Same options for /admin/reports
Please choose a, b, c per page."

Wait for answer. Then execute per choice.

### EDIT 1: src/app/(student)/student/profile/page.tsx — full rebuild

Current: 15-line placeholder.
Target: full digital ID card per 06_wireframes.md B10 and
07_hifi-spec.md §6 Student Profile.

Structure:
1. Server Component fetches: student profile, level, level progress,
   avatar initials, date of birth, roll number.
2. Renders a client component `StudentProfileClient` that shows:
   - Digital ID card: avatar 96px + name + level + roll + DOB + barcode
     (use `react-barcode` or a simple SVG QR code of the roll number)
   - Level progress bar: 8px tall, #E2E8F0 track, #1A3829 fill,
     animated width on mount (600ms ease-out)
   - "Level X · N% to Level X+1" label
   - Accessibility section:
     - Ticker Mode toggle (shadcn Switch)
     - Checked: `#1A3829` track, white thumb
     - Persists to `profiles.ticker_mode` on change
   - **BUT** ticker_mode column does not exist per GOTCHAS.md.
     Before wiring the toggle, check live DB:
     ```sql
     SELECT column_name FROM information_schema.columns
     WHERE table_name='profiles' AND column_name='ticker_mode';
     ```
     If 0 rows: either render the toggle as disabled with a
     "Coming soon" sublabel, or ADD THE COLUMN via SQL editor
     (not via migration file per CLAUDE.md) and document.

Commit: `feat(profile): full student profile with digital ID card + level progress + ticker mode toggle`

Verification:
- Navigate to /student/profile as student
- evaluate_script: check presence of `.digital-id-card`, check
  level progress bar width matches computed percentage.

### EDIT 2: src/app/(student)/student/exams/[id]/lobby/lobby-client.tsx — rewrite

Current: 222-line component with countdown circle but missing spec
elements.

Apply 07_hifi-spec §6 Pre-Assessment Lobby spec:

1. **Replace 200px countdown circle with 120px breathing circle:**
   ```tsx
   <div
     className="breathing-circle"
     style={{
       width: '120px',
       height: '120px',
       borderRadius: '50%',
       border: '2px solid rgba(26, 56, 41, 0.3)',
       backgroundColor: 'rgba(26, 56, 41, 0.04)',
     }}
   />
   ```
   The `breathing-circle` class is already defined in globals.css
   line 147 with the 4s keyframe.

2. **Move countdown timer OUTSIDE the circle**, as a separate
   display below the breathing circle, using `mono-flash`-scale
   but smaller: `72px DM Mono 700 #1A3829` (spec Lobby countdown).

3. **3-state network health indicator** (replace current
   STABLE/OFFLINE binary):
   ```tsx
   const [networkState, setNetworkState] = useState<'optimal'|'degraded'|'severed'>('optimal');
   // On 'online' event: test fetch latency, classify:
   //   <500ms → optimal, <2000ms → degraded, fail → severed
   ```
   Render the 3-state dot + label + sublabel per §6.

4. **Remove the camera + secure browser fake checklist** entirely.
   Replace with a single "I'm Ready" CTA per wireframe B3.

5. **Remove native `alert()` on line 98** — replace with inline
   error pill using the `error-pill` pattern (red background,
   sanitize-html rendered).

6. **Remove the debug footer from lobby/page.tsx line 78**
   ("SESSION ID: ..." — already covered in Tier 3 Batch 3E).

Commit: `feat(lobby): breathing circle + 3-state network + remove fake checklist`

Verification:
- Navigate to lobby. Check breathing circle class applied.
- Toggle network offline: confirm state transitions through optimal
  → degraded → severed.

### EDIT 3 + 4: /student/tests and /admin/reports

Per STOP-AND-ASK decision:
- If (a) build: design and implement per user direction
- If (b) remove: delete the page.tsx file, remove the nav link from
  student-sidebar.tsx NAV_ITEMS array (or admin-sidebar.tsx for reports)

Commit: `chore(nav): remove unused /student/tests placeholder route` OR
       `feat(tests): implement practice tests page per product spec`

### TIER 4 VERIFICATION GATE

- `verify-exam-flow` passes
- `verify-admin-pages` passes
- Manual navigation to /student/profile shows a full ID card
- Manual navigation to /student/exams/[id]/lobby shows breathing
  circle + 3-state network + no fake checklist

────────────────────────────────────────────────────────
TIER 5 — POLISH, MICROCOPY, LOW PRIORITY
Target files: ~30
Est. effort: 2–3 days
Commit message prefix: `polish(ui):`
────────────────────────────────────────────────────────

Pick off LOW severity items from UI_DIAGNOSTIC_REPORT.md that
weren't covered by Tiers 1–4. Examples:

- Card titles: `text-sm text-slate-600` → `text-base text-t2`
  (spec heading-md 18px 600)
- Table header uppercase tracking-wide per spec
- Empty state illustrations 64×64 → 160×160 SVG
- Dialog shadow + radius-overlay 18px
- Auto-adjust adjacent grade boundary fields (settings-client)
- Dropdown menu item touch target ≥40px
- Cosmetic microcopy matches per 07_hifi-spec §10

Commit in 2-3 batches grouped by theme (spacing, typography, microcopy).

### TIER 5 VERIFICATION GATE

- Full 22-screen visual pass per `06_wireframes.md` checklist
- Lighthouse CI (if installed) passes budgets
- axe-core playwright test suite (if installed) passes

════════════════════════════════════════════════════════
PROGRESS SAVE MECHANISM
════════════════════════════════════════════════════════

If context runs out mid-tier:

1. Save current state to `docs/fix-progress.md` via Write tool:
   - Current tier + batch
   - Last completed commit hash
   - Which gate assertions already passed
   - Which files are partially edited (list with line counts)
   - Open product decisions
2. Commit `docs/fix-progress.md` alone.
3. Output: "Context limit reached. Progress saved to
   docs/fix-progress.md. Resume with: claude --continue"

On resume: read docs/fix-progress.md first, then continue from the
last-completed commit.

════════════════════════════════════════════════════════
ABSOLUTE RULES FOR THIS SESSION
════════════════════════════════════════════════════════

1. NEVER modify files in `src/lib/anzan/`, `src/lib/anticheat/`,
   `src/lib/auth/rbac.ts`, `src/lib/supabase/*`, `src/stores/*`
   unless a SPECIFIC finding in UI_DIAGNOSTIC_REPORT.md explicitly
   requires it. These areas are spec-clean per the audit.
2. NEVER create new Supabase migrations — all DB fixes via
   Supabase SQL editor per CLAUDE.md.
3. NEVER commit .env files or secrets. .env.production already
   exists as untracked — do not stage it.
4. `npm run tsc` 0 errors before every commit. If errors appear,
   fix them before pushing.
5. Phase string: `PHASE_2_FLASH` only, never `'FLASH'`.
6. No `setTimeout`/`setInterval` in `src/lib/anzan/*`.
7. No native `alert()`/`confirm()` in any UI file — use sonner
   toasts or inline error pills.
8. No emoji in production UI — use lucide-react icons.
9. No hardcoded hex colours in component files except:
   - `src/app/login/page.tsx` (brand anchor, documented exception)
   - `src/lib/anzan/color-calibration.ts` (spec rule for
     negative number colour)
   - `src/components/exam/flash-number.tsx:83` (per-frame inline
     style assignment, documented exception)
10. Use `createPortal(content, document.body)` for any overlay
    that must escape parent stacking contexts (per CLAUDE.md).
11. Before any DB mutation: run SELECT first with the same WHERE
    clause, verify row count > 0.
12. Before any status/enum column update: verify the check_clause
    via information_schema.
13. Never use `git add -A` or `git add .`. Stage by exact filename.
14. Commit only the files listed in the active batch. Never stage
    unrelated changes.
15. Never skip verification gates. If a gate fails, stop and fix.

════════════════════════════════════════════════════════
TIER-AGNOSTIC STOP-AND-ASK CONDITIONS
════════════════════════════════════════════════════════

Stop and ask the user before proceeding if:

1. A proposed fix would touch the exam engine core (anzan/anticheat/
   flash-number.tsx internals) — flag it, present the reasoning,
   wait for approval.
2. A proposed fix requires a new DB column that isn't trivially
   nullable — ask before creating it via SQL editor.
3. Spec interpretation is ambiguous (e.g., two specs disagree on
   a dimension — report both sources and ask which wins).
4. A verification gate fails after 2 attempted fixes — stop and
   escalate rather than trying a third approach.
5. The rebuild of /student/tests or /admin/reports (Tier 4
   stop-and-ask #1 above).
6. Any change to `CLAUDE.md`, `GOTCHAS.md`, `TASKS.md` or other
   operator docs.

════════════════════════════════════════════════════════
FINAL OUTPUT (after all 5 tiers + gates pass)
════════════════════════════════════════════════════════

Output:

"FIX COMPLETE.

Tier 1 — Root Cause Foundation:  PASS  commit: <hash>
Tier 2 — Security + Architecture: PASS  commits: <hashA>, <hashB>
Tier 3 — HIGH Tail:              PASS  commits: <list>
Tier 4 — From-Scratch Rebuilds:  PASS  commits: <list>
Tier 5 — Polish:                 PASS  commits: <list>

Verification:
  verify-exam-flow:    PASS
  verify-admin-pages:  PASS
  tsc errors:          0
  Console errors:      0 on 11 audited pages
  Grep assertions:     all pass

Deployed to https://mindspark-one.vercel.app

Remaining known gaps (documented, not fixed):
  <any items deliberately deferred with reason>

Ready for human visual review."

════════════════════════════════════════════════════════
BEGIN
════════════════════════════════════════════════════════

Start with Pre-flight Step 0A immediately. Read the context files.
Run pre-flight checks. Then execute Tier 1 without waiting for
intermediate confirmation. Stop only at:
  - pre-flight failure
  - any verification gate failure
  - a stop-and-ask point
  - progress-save trigger on context limit
