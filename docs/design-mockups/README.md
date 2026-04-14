# MINDSPARK v1 Design Mockups — Canonical Reference

These HTML files are the **approved visual contract** for every UI surface in MINDSPARK v1. Every spec and implementation plan in `docs/superpowers/` references files in this directory as the source of truth for layout, typography, colour, and interaction states.

## Why they live here (not in `.superpowers/brainstorm/`)

The `.superpowers/brainstorm/` workspace directory is **not tracked in git**. Files created during brainstorm sessions live on disk only — they disappear on a fresh clone or a machine reset. Committing the final cuts here preserves them as permanent reference that survives:

- Fresh clones of the repo
- Machine re-images
- Workspace cleanup
- Multi-engineer handoffs

## How to use these mockups during implementation

Every implementation plan task that touches UI references a specific mockup file and a specific frame number within it. The **visual fidelity protocol** (documented in each plan's sacred-rule guardrails) requires engineers to:

1. Open the relevant mockup file in a browser (or `client-deliverables/mindspark-mockups.html` for the bundled view)
2. **Port the mockup's CSS verbatim** into a colocated CSS file next to the React component. Do NOT re-express as Tailwind utility classes — the translation step is where drift happens.
3. **Copy the mockup's HTML structure** into the React JSX, preserving class names verbatim (`<div class="profile-card">` → `<div className="profile-card">`).
4. **Replace static text with React props/state**, leaving every class name, CSS rule, and structural element intact.
5. **Shadcn/ui components are reserved for shared primitives only** — `Button`, `Input`, `Dialog`. Do not substitute `<Card>` or `<Avatar>` for mockup-styled divs.
6. **Run a manual diff pass** in the browser before marking a task complete — open the mockup in one tab, the dev server in another, confirm they render identically at 100% zoom.
7. **Playwright tests codify the contract.** Assertions target the mockup's class names (`.profile-card`, `.score-fraction`, `.hero-score`). If tests pass, the DOM skeleton matches. If they fail, drift happened.

## File inventory

### Student surfaces (5 files)

| File | Spec | Frames |
|---|---|---|
| `student-dashboard.html` | `docs/superpowers/specs/2026-04-13-student-dashboard-design.md` | LIVE hero + empty state |
| `student-exams-tests.html` | `docs/superpowers/specs/2026-04-13-student-exams-tests-flow-design.md` | Tab strip, live/upcoming/completed, lobby |
| `student-assessment-v5.html` | `docs/superpowers/specs/2026-04-14-student-assessment-taking-flow-design.md` | Locked vertical-table equation format (v5 is canonical; v1–v4 are superseded) |
| `student-results-flow.html` | `docs/superpowers/specs/2026-04-14-student-results-flow-design.md` | 14 frames: list, detail, answer sheet, admin release card, modals |
| `student-profile.html` | `docs/superpowers/specs/2026-04-14-student-profile-design.md` | 3 frames: default, expanded, null-heavy |

### Admin — Dashboard + Assessments (3 files)

| File | Spec |
|---|---|
| `dashboard-layout.html` | `docs/superpowers/specs/2026-04-13-admin-dashboard-design.md` |
| `assessments-list.html` | `docs/superpowers/specs/2026-04-13-admin-assessments-list-design.md` |
| `assessment-wizard.html` | `docs/superpowers/specs/2026-04-13-admin-create-assessment-flow-design.md` |

### Admin — Students + Levels (7 files)

| File | Spec |
|---|---|
| `students-list-v2.html` | `docs/superpowers/specs/2026-04-13-admin-students-flow-design.md` |
| `student-detail.html` | `docs/superpowers/specs/2026-04-13-admin-students-flow-design.md` |
| `student-drawer.html` | `docs/superpowers/specs/2026-04-13-admin-students-flow-design.md` |
| `student-dialogs.html` | `docs/superpowers/specs/2026-04-13-admin-students-flow-design.md` |
| `levels-list.html` | `docs/superpowers/specs/2026-04-13-admin-levels-flow-design.md` |
| `level-detail.html` | `docs/superpowers/specs/2026-04-13-admin-levels-flow-design.md` |
| `level-dialog.html` | `docs/superpowers/specs/2026-04-13-admin-levels-flow-design.md` |

### Admin — Monitor + Results + Settings (5 files)

| File | Spec |
|---|---|
| `live-monitor.html` | `docs/superpowers/specs/2026-04-13-admin-live-monitor-flow-design.md` |
| `hub-layout-v4.html` | `docs/superpowers/specs/2026-04-13-admin-results-redesign-design.md` (hub page) |
| `detail-layout-v3.html` | `docs/superpowers/specs/2026-04-13-admin-results-redesign-design.md` (detail page) |
| `answer-sheet.html` | `docs/superpowers/specs/2026-04-13-admin-results-redesign-design.md` (answer sheet) |
| `settings.html` | `docs/superpowers/specs/2026-04-13-admin-settings-design.md` |

## Post-v1 lifecycle

After v1 ships, these files become **historical reference**:

- **Onboarding material** for new engineers ("here's what v1 looks like")
- **Regression baseline** for any future UI tweaks ("does the change still match the approved design?")
- **Stakeholder proof** ("the client approved this look on 2026-04-14; here it is in commit history")
- **Incident triage** ("was the production render wrong, or was it always like this?")

When v2 redesigns a specific surface, the v2 mockup gets committed alongside the v1 version with a date suffix (e.g. `student-results-flow.html` stays as v1; `student-results-flow-v2.html` ships when v2 ships). Git history provides the timeline.

## Related deliverables

- **`client-deliverables/mindspark-mockups.html`** — single-file bundled version of all 20 mockups for client review. Each mockup is embedded as a base64 `data:` URL inside an auto-resizing iframe, so the bundled file renders byte-identically to the originals. Send this file to external reviewers; keep the originals in this directory for engineers.

## Changelog

- **2026-04-14** — initial commit. 20 files promoted from `.superpowers/brainstorm/` working directories into the canonical repo location. No content changes — byte-for-byte copy.
