# Phase 4 Execution Prompts (Admin Announcements TipTap Editor)

**Instructions:** 
Run these steps sequentially. Do not start a step until the previous step's verification gate has been fully met and confirmed with terminal output. Update the `.agent-context/` files as specified at the end of every step.

---

### Step 4.1: Build the isolated TipTap Editor component

**Read first:** `.agent-context/GOTCHAS.md` (React / Next.js section regarding SSR), `.agent-context/Constraints.md` (Part 2: Strict Scope Lock)
**Skill(s):** `minimalist-ui` (ensure UI tokens match globals.css, no inline hex codes), `verification-before-completion` (to verify SSR doesn't crash).
**Files in scope:** `src/app/(admin)/admin/announcements/tiptap-editor.tsx`
**Out of scope:** The announcements page or server actions (handled in next steps). Do not add any toolbar features beyond the specced minimum (Bold, Italic, BulletList).

**Task:**
1. Create the `tiptap-editor.tsx` component.
2. Ensure the editor mounts with ONLY these explicit extensions — do not import @tiptap/starter-kit: Document, Paragraph, Text, Bold, Italic, BulletList, ListItem. The editor's schema must not be able to represent any node/mark outside this set, regardless of what toolbar buttons are shown — a request that bypasses the UI and posts directly to the server action must not be able to produce disallowed content structurally.
3. The component must be exported as a default component that can be dynamically imported by the client.
4. Apply the `gotchas` lesson: the editor must be structured so it doesn't crash on SSR. (Hint: The parent component will do the `next/dynamic` import, but this file itself must be `'use client'`).

**Verification:**
`npm run tsc` → 0 errors. `npm run build` → succeeds with no SSR/hydration errors (tsc alone does not catch runtime SSR crashes).

**STOP AND REPLAN if:**
You find that `@tiptap/react` or `@tiptap/starter-kit` are not installed or have unpinned versions (`"latest"`) in `package.json`. If unpinned, fix them to explicit versions before proceeding.

**On completion, update:**
- [ ] `Handover.md` — one line: TipTap editor component created.
- [ ] `Decisions.md` — only if a real tradeoff was made this step.
- [ ] `git commit` — small, scoped to this step's files only.

---

### Step 4.2: Enhance the Announcements Server Action (RBAC, Zod, Sanitization)

**Read first:** `.agent-context/Constraints.md` (Part 1: RBAC Gate Pattern, Server Action Data Validation), `PHASE-4-PREFLIGHT-PROMPT.md` (Part C: Zod validation ≠ output sanitization).
**Skill(s):** `karpathy-guidelines`
**Files in scope:** `src/app/actions/announcements.ts`, `package.json` (adding `isomorphic-dompurify` or `xss` as a dependency)
**Out of scope:** The UI components.

**Task:**
1. Audit `createAnnouncement` (and any other write actions in `announcements.ts`).
2. Implement strict Zod schema validation for the input payload.
3. Assert that `requireRole('admin')` is explicitly called at the top of the action.
4. Implement HTML sanitization (e.g., using `isomorphic-dompurify` or `xss`) to scrub the rich text output from TipTap *before* it is saved to the database. Zod only checks the shape; you must sanitize against XSS payloads.
5. Default to `requireRole('admin')` only (not `teacher`), unless a decision already exists elsewhere stating otherwise. Add a `Decisions.md` entry tagged `STATUS: PROPOSED` (not `APPROVED`) noting this default was applied and needs explicit user confirmation before it's treated as final.
6. Preserve the original TipTap JSON in its own column alongside the sanitized HTML render column, so an announcement can be reopened for editing rather than only ever existing as inert sanitized HTML. This will likely trigger the STOP-AND-REPLAN clause below (schema/migration needed) — that's expected, follow it. Add a `Decisions.md` entry tagged `STATUS: PROPOSED` for this default.

**Verification:**
`npm run tsc` → 0 errors.
`npm run test` → passing, and must include two new tests added this step: (a) `requireRole('admin')` rejects a caller without the admin role, (b) the sanitizer strips a real XSS payload (e.g. assert `<script>` and an `onerror=` attribute do not survive the round trip through sanitization). These are not optional — write them if they don't already exist.

**STOP AND REPLAN if:**
The `announcements` table does not have the necessary columns to store the rich text (e.g., `body_html`), or if the schema requires a migration. (Check live DB schema if needed).

**On completion, update:**
- [ ] `Handover.md` — one line: announcements action secured and sanitized.
- [ ] `Decisions.md` — required this step (see Tasks 5 and 6 below).
- [ ] `git commit` — small, scoped to this step's files only.

---

### Step 4.3: Wire the Announcements Admin UI

**Read first:** `.agent-context/GOTCHAS.md` (Fake Data Landmines, `createPortal` CSS traps), `.agent-context/Constraints.md` (Service Role Isolation).
**Skill(s):** `karpathy-guidelines`, `minimalist-ui` (match existing admin dashboard layout).
**Files in scope:** `src/app/(admin)/admin/announcements/announcements-client.tsx`, `src/app/(admin)/admin/announcements/page.tsx`
**Out of scope:** Modifying `globals.css` or layout wrappers outside of the announcements feature.

**Task:**
1. In `announcements-client.tsx`, dynamically import `tiptap-editor.tsx` using `next/dynamic` with `ssr: false`.
2. Wire the compose form to submit the rich text payload to the secured server action.
3a. Default to a regular authenticated client respecting RLS rather than `adminSupabase` for this read, unless a specific reason requires bypassing RLS. If `adminSupabase` is used anyway, state why in `Decisions.md` tagged `STATUS: PROPOSED`.
3b. Before writing the fetch, grep/read the (admin) layout to confirm it already gates non-admin access. Paste the actual confirming evidence — do not assume this is already handled just because no prior audit flagged it missing.
4. Render the history panel and ensure NO fake data literals (like "Engagement Insights: 25% higher read rate") are hardcoded. If data doesn't exist in DB, don't invent it.

**Verification:**
Run `npm run build` to verify that the dynamic TipTap import does not trigger SSR hydration crashes or build errors.
Start the dev server (`npm run dev`) and manually verify the page renders without crashing.

**STOP AND REPLAN if:** the `(admin)` route group's layout does not already gate non-admin access to this page (verify with a grep/read before assuming — see Task 3b below), or if wiring the compose form surfaces a schema mismatch with what Step 4.2 actually implemented (e.g. if 4.2 added a second column per the JSON-preservation default, this step's fetch/render must account for both columns).

**STOP AND REPLAN if:**
The required data (e.g., read counts, engagement insights) doesn't exist in the DB schema and would force you to use fake data. Stop and update `Decisions.md` to omit those UI elements to maintain strict scope lock.

**On completion, update:**
- [ ] `Handover.md` — one line: announcements admin UI wired, TipTap dynamically imported.
- [ ] `Decisions.md` — required if the `adminSupabase` vs. RLS-client choice (Task 3a) was made this step.
- [ ] `git commit` — small, scoped to this step's files only.

---
### Step 4.4: Phase 4 Close-Out & Verification Rollup
**Read first:** `.agent-context/Handover.md`, `.agent-context/Decisions.md`, `PHASE-PLAN.md`, `PHASE-4-PREFLIGHT-PROMPT.md` (Part A/B, to confirm nothing from preflight was left open)
**Skill(s):** `verification-before-completion`, `architecture-decision-records` (for any tradeoff below that isn't already logged)
**Files in scope:** `Handover.md`, `Decisions.md`, `Flow.md`, `PHASE-PLAN.md`, the phase-gate document (`implementation_plan.md` or equivalent)
**Out of scope:** Any Phase 5 (Recharts) work — this step consolidates and closes, it doesn't start new work.

**Task:**
1. Re-run `npm run tsc`, `npm run build`, and `npm run test` together in one pass, on the final state of all Phase 4 files. Paste the combined output — one source of truth, not three separate claims from three separate steps.
2. State explicitly whether each STOP-AND-REPLAN condition from 4.1 and 4.2 fired, and if so, how it was resolved.
3. Confirm the two tests from 4.2 (admin-role rejection, sanitizer strips a real payload) exist and are in the Step 1 test run. If either wasn't added, log why in `DEC-007` rather than letting it drop silently.
4. Every `Decisions.md` entry tagged `STATUS: PROPOSED` from Steps 4.1-4.3 (role scope, schema for re-editability, RLS-client choice) needs an explicit resolution here: either the user confirms it and it flips to `STATUS: APPROVED`, or it's called out clearly as still open and blocking phase close. Do not let a `PROPOSED` entry silently age into treated-as-approved.
5. Add a `Flow.md` entry (`FLOW-00X`) for the full verified path: compose → Zod validate → sanitize → write → render.
6. Rewrite `Handover.md` per its own protocol (full rewrite, not appended) — fold in the three per-step one-liners into one current-state summary, retire "in progress: TipTap" now that it's done.
7. Update `PHASE-PLAN.md`: mark Phase 4 `CLOSED`, confirm Phase 5's row is still accurate.
8. Merge the `phase-4-tiptap` branch per `Rollback.md`'s branch-per-phase strategy, or state explicitly why not yet.
9. Replace the phase-gate document's trailing question with a fresh, correct one: *"Do you approve closing Phase 4 and moving to Phase 5?"* — not a leftover from an earlier state.

**Verification:** The single consolidated command output from item 1, plus explicit yes/no on items 2, 3, and 4 — this step produces no new code, only confirms and records what 4.1-4.3 already did.

**STOP AND REPLAN if:** anything from 4.1-4.3's individual verification doesn't reproduce when re-run together against the final combined state, or if any `STATUS: PROPOSED` decision from item 4 can't be resolved without the user's input — flag those explicitly rather than defaulting them to approved.

**On completion, update:**
- [ ] `Handover.md` — full rewrite (see task 6)
- [ ] `Decisions.md` — `DEC-007` plus resolution status for every `PROPOSED` entry
- [ ] `Flow.md` — `FLOW-00X`
- [ ] `PHASE-PLAN.md` — Phase 4 → `CLOSED`
- [ ] `git` — branch merge or explicit deferral
