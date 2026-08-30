# 03 — Frontend Makeover (standalone)

**What this does:** Establishes, strengthens, or transforms a project's frontend design governance — the set of rule files, component inventories, and delivery-gate workflows that prevent AI-generated slop and session-to-session design drift. Also produces standalone visual mockups for design exploration, without touching the real app. Works in Antigravity, Claude Code, Cursor, or a plain chat with the repo attached.

Four modes — pick the one that matches what you need this run.

---

## Fill in before sending

**Repo / scope:**
[Path to repo root, or a specific app if this is a monorepo.]

**Mode** (pick one):
- [ ] **Bootstrap** — "Make this project frontend compatible." Scan the codebase, generate all design governance files from scratch. No code changes.
- [ ] **Improve** — "Improve the frontend workflow." Audit existing governance files, fill gaps, strengthen weak rules. No code changes.
- [ ] **Makeover** — "Makeover the frontend." Full visual redesign using the DESIGN.md I'm providing. Archives the old design, builds new governance, transforms every page.
- [ ] **Mockup** — "Mock up these screens." Standalone HTML gallery + PDF of visual designs for review. Doesn't touch the real app or governance files at all.

**If Makeover:** attach or reference your target DESIGN.md here.
[Path to DESIGN.md, or paste its contents.]

**Archive name for current design** (Makeover only, optional):
[Name for the archived design folder, e.g. "v1-original" or "pre-rebrand". Defaults to "original-design".]

**If Mockup:** what to mock up, and optionally a target look.
[Screens/flows in scope — a feature, a whole app, or "N directions for X." Path or pasted DESIGN.md if exploring a new direction; leave blank to use the current codebase's own tokens. Name any screen that deserves a full interactive demo instead of a static preview — leave blank if none do.]

---

## Instructions (leave as-is)

You're establishing or transforming this project's frontend design governance so every future AI session produces visually consistent, non-sloppy, functionally correct UI. Work autonomously; don't check in until you're done or genuinely blocked.

### The file system you're building or maintaining

```
AGENTS.md                          ← router (pointer lines to design rules)
.agents/
├── rules/
│   ├── DESIGN.md                  ← tokens + qualitative design philosophy
│   ├── ANTISLOP.md                ← AI slop pattern filter + delivery gate
│   ├── COMPONENTS.md              ← component inventory with all states
│   ├── CONTENT.md                 ← voice, UX writing, copy rules
│   ├── ACCESSIBILITY.md           ← contrast, focus, keyboard, motion
│   └── STACK.md                   ← framework, CSS approach, build commands
└── workflows/
    └── design-review.md           ← repeatable delivery-gate checklist
```

### How this works, regardless of mode

**Before generating any governance file, scan the real codebase.** Identify:
- Framework and CSS approach (Tailwind config, CSS Modules, vanilla, styled-components).
- Colors actually used — extract hex values and their roles, not swatches.
- Font families loaded, type scale per role (H1/H2/body/caption).
- Spacing patterns, border-radius conventions, container widths.
- Every reusable component that exists, with which states are implemented (default, hover, active, focus, disabled, loading, error) and which are missing.
- Layout patterns, grid usage, responsive breakpoints.
- Voice and tone of existing copy, label conventions, error message style.

Every file you write must be derived from this scan, not from generic templates.

---

### If Bootstrap mode is selected

1. **Scan** the codebase as described above.
2. **Generate all 7 governance files** derived from the scan findings:
   - `DESIGN.md` — two halves: (a) hard tokens — color hex values with usage roles, type scale, spacing unit, component states, all extracted from what exists; (b) qualitative layer — overall vibe, when tokens are allowed/prohibited, explicit do/don't pairs. Nine sections: visual theme, color palette & roles, typography, component styling across states, layout principles, depth & elevation, do's & don'ts, responsive behavior, agent prompt guide.
   - `ANTISLOP.md` — a filter, not a style guide. Lists recognizable AI slop patterns: generic hero+gradient+three-stat-cards, symmetric three-column layouts, purple/blue AI gradients, cream-and-terracotta palettes, glassmorphism used decoratively, filler marketing copy ("Unlock the power of…"). Ends with a mandatory delivery-gate checklist. This directly overrides Antigravity's built-in "premium glassmorphism" lean.
   - `COMPONENTS.md` — inventory of every component in the codebase with states per component. Rule: "check here before creating a new variant."
   - `CONTENT.md` — voice rules, active voice, consistent action naming ("Publish" → "Published" toast, not generic "Success!"), tone for empty/error/loading states.
   - `ACCESSIBILITY.md` — contrast minimums (4.5:1), visible focus states, keyboard nav, `prefers-reduced-motion`, semantic landmarks, `aria-label` for icon-only buttons.
   - `STACK.md` — framework, CSS approach, file/folder conventions, build commands. Separate from DESIGN.md so swapping projects means swapping one file.
   - `design-review.md` — workflow: ANTISLOP checklist → accessibility pass → component state audit → content/voice check.
3. **Add pointer lines to `AGENTS.md`:** "If the task touches UI, read `.agents/rules/DESIGN.md` and `.agents/rules/ANTISLOP.md` before writing any code." Append if `AGENTS.md` exists; create if it doesn't.
4. **Run the generated design-review workflow** against the current frontend as a baseline audit. Report findings — this is the starting state, not a fix list.

---

### If Improve mode is selected

1. **Inventory** which governance files exist in `.agents/rules/` and which are missing.
2. **For existing files:** diff their rules against the real codebase. Are there components in the code not in `COMPONENTS.md`? Colors used but not in `DESIGN.md`? Slop patterns the filter misses? Strengthen what's there — add undocumented items, fix stale references, tighten weak rules. Never overwrite developer-authored content; append, annotate, or restructure, but preserve intent.
3. **For missing files:** create them using the same scan-and-derive logic as Bootstrap.
4. **Run `design-review.md`** (create it if missing) and report findings.

---

### If Makeover mode is selected

**Do NOT begin any code transformation until the governance files are fully set up. The governance files are the source of truth — without them, transformations drift.**

1. **Scan for existing governance files** — regardless of whether they're mentioned.
   - If they don't exist: create them first, documenting the *current* design (not the target), using Bootstrap logic. This full pass is deliberate even though it's about to be archived — it gives real rollback parity (a complete governance set for the old design) rather than just a snapshot, in case the makeover needs to be reverted.
   - If they exist: verify they're current.
2. **Archive** all current governance files to `.agents/rules/archive/{archive-name}/`. Never delete.
3. **Build new governance files** from the provided DESIGN.md. Generate `ANTISLOP.md`, `COMPONENTS.md`, `CONTENT.md`, `ACCESSIBILITY.md`, `STACK.md`, and `design-review.md` derived from the new design spec. Update `AGENTS.md` pointer lines.
4. **Transform page-by-page.** For each page/route in the app:
   a. Inventory every component, layout structure, and data connection on this page.
   b. Apply the new design tokens, component styles, layout patterns, and content voice.
   c. **Verify after each page:**
      - Does it render without errors?
      - Do all interactive elements still work (buttons, forms, navigation, links)?
      - Are API calls, server actions, and database queries still connected and returning correct data?
      - Are form field `name` attributes, URL slugs, and `id` attributes unchanged?
      - In Next.js/Nuxt: does SSR hydration still work after structural or class-name changes?
   d. Move to the next page only after the current one is verified.
   e. If a CSS change affects a shared component used on other pages — transformed or not — apply it globally but verify all pages that use it still render, not just the untransformed ones. A shared component touched again on page 8 can invalidate the verification you already did on page 2; that's what the final delivery-gate re-check below exists to catch.
   f. If a transformation requires backend changes to work, **stop and flag it** — don't modify backend code.
5. **Delivery gate** — before reporting done:
   - **Re-run the functional check (interactive elements, forms, API/data calls) across every transformed page, not just the most recent one.** A shared-component edit made while transforming page 8 can silently break page 2, which you already marked verified — this is the pass that catches that.
   - Run `design-review.md` against every transformed page.
   - Run `ANTISLOP.md` checklist — zero AI slop patterns in the new design.
   - Accessibility pass — contrast, focus states, keyboard nav, reduced-motion all confirmed.
   - App still boots and all routes load without errors.

**Ship every file complete** — no `// rest unchanged`, no truncated diffs, no "similar for the others."

---

### If Mockup mode is selected

**No code changes, ever.** This mode never touches the real app, its routes, or the governance files — everything it makes is a new, standalone artifact.

1. **Establish the token source.** If a target DESIGN.md was given, use it. Otherwise scan the codebase (same logic as Bootstrap) and derive tokens from what already exists — mockups should look native to the real product, never invented per screen.

2. **For every screen/flow in scope, design every state that matters — not just the happy path.** At minimum: empty state and populated/default state, plus whatever the domain actually has (loading, error, locked/pending, live/active). A stakeholder who only sees the page full of ideal data has no idea what a brand-new user sees. Each state needs:
   - A specific title ("Screen N — [what this state is]").
   - A one-paragraph design note: what's different here, why it looks this way, and how common this state is if that's useful ("default state, ~95% of loads").
   - Realistic, on-brand sample data — not lorem ipsum. Real-sounding names and content in the product's actual voice. Reviewers judge information density and edge cases (long names, big numbers) far better against real-looking data than placeholder text.

3. **Build the interactive gallery — the primary deliverable.** One self-contained `index.html`:
   - Sticky top bar: title, a dropdown that jumps to any screen (`location.hash = this.value`), a screen count.
   - Screens grouped by role/area, however the app is actually organized.
   - Each screen is a self-contained iframe (`src="data:text/html;base64,..."`) — its own full HTML document, with every state for that screen stacked vertically inside it, each state preceded by its title + note and wrapped in a bordered "PREVIEW: /path (state)" frame so it reads like a captured screenshot of a real route.
   - Give each iframe a small script that reports its rendered height to the parent via `postMessage` on load and on `ResizeObserver`, and have the parent resize the iframe to match — otherwise content clips or leaves dead space.
   - **At most one or two screens — reserved for whatever interaction is genuinely hardest to judge from a static picture — get a real interactive treatment instead:** actual HTML/CSS/JS embedded directly, clickable/playable, launched from a clearly labeled "Interactive Demo" button. Everything else stays a static preview; this is expensive to build well, so spend it only where it earns its keep.

4. **Export a PDF for offline review, derived from the gallery — don't design it separately, or the two will drift.**
   - One page per *state*, not per screen (a screen with five states is five pages): breadcrumb (group › screen), title, a file-path reference, the design note, the state rendered inside its "PREVIEW: /path" frame, and a footer with page count ("[Project] Mockup Review · Screen N of Total").
   - A cover page: project name, "Final Mockups · Design Review," total screen count, generation date.
   - Render each state via whatever headless-browser or print pipeline is already available in this project's toolchain (Puppeteer/Playwright `page.pdf()`, the browser tool's own print-to-PDF, etc.) — capture from the gallery, don't hand-rebuild the markup a second time.

5. **Before reporting done:**
   - Open the gallery and confirm every screen loads, the jump dropdown works, and the interactive demo(s) actually function.
   - Confirm the PDF's page count matches the state count plus cover (and any group dividers), and spot-check a few pages.
   - This is presentation output, not application code — no backend, no forms, nothing functional to verify. Don't run the Makeover delivery gate against it.

**Relationship to the other modes:** a natural precursor to Makeover — cheap to explore two or three directions here before committing one to a real DESIGN.md and running Makeover on the live app. Also useful standalone for a feature that doesn't exist in code yet.

---

### Edge cases to handle

- **Third-party component libraries (shadcn, MUI, Radix):** document in governance files, but during makeover: transform project-owned components directly, library components get theme/config changes only.
- **CSS-in-JS vs. Tailwind vs. vanilla:** `STACK.md` must correctly identify the CSS approach before any transformation begins.
- **Monorepo:** run per-app, never merge two apps' design systems.
- **If you find a real bug during transformation:** don't fix it. Log it in `STATE.md` (if it exists) or flag it in your final report, with enough detail for a dedicated debugging pass.
- **Mockup scope too large for one pass ("mock up the whole app"):** default to the highest-value screens/flows first (primary user journeys, not every settings sub-page) rather than producing a thin pass at everything — 15 well-executed states beats 60 shallow ones.
