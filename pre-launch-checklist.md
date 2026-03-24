# MINDSPARK Pre-Launch Verification Checklist

> **Document path:** `docs/pre-launch-checklist.md`  
> **Owner:** Technical Lead + Legal Counsel  
> **Purpose:** Every gate must be checked before any live student assessment runs.  
> **Rule:** Partial completion does not count. Each item is binary: complete or not complete.

---

<!--
HOW TO USE THIS CHECKLIST:
1. Work through gates in order (Legal → Technical → Performance → Security → Operational)
2. Replace [ ] with [x] only when you can personally verify the item is complete
3. Include verifier name and date beside each completed item
4. All gates must show [x] before the first live exam is authorised
5. This checklist is referenced by the CHANGELOG V1.0.0 entry — file it as an artefact

SIGN-OFF REQUIRED:
- Legal gates: Legal Counsel + Compliance Officer
- Technical gates: Technical Lead
- Performance + Security gates: Technical Lead
- Operational gates: Technical Lead + Institution Admin
-->

---

## Gate 1 — Legal

*All legal gates must be signed by qualified legal and compliance personnel.*

- [ ] **DPIA reviewed and signed** — `docs/legal/dpia.md` bears valid signatures from Compliance Officer, Legal Counsel, and Technical Lead. Date of signing recorded.
  > Verifier: _______________ | Date: _______________

- [ ] **Privacy Policy published at live URL** — accessible at `[institution-url]/privacy` without requiring login. Verified in a private/incognito browser window.
  > Verifier: _______________ | Date: _______________

- [ ] **Terms of Service published and linked from login page** — accessible at `[institution-url]/terms`. A visible link ("Terms of Service") appears on the login screen before any student clicks Sign In.
  > Verifier: _______________ | Date: _______________

- [ ] **Guardian consent flow tested end-to-end** — a test student account was provisioned using the full consent flow: guardian email submitted → verification email received → link clicked → consent recorded in `students` table with `consent_verified = true` → student JWT issued successfully.
  > Verifier: _______________ | Date: _______________

---

## Gate 2 — Technical

*All technical gates must be verified by the Technical Lead against the production environment.*

### Database

- [ ] **All 26 migrations applied to production DB** — run `SELECT version FROM supabase_migrations ORDER BY applied_at;` and confirm migrations 001–026 are present with no gaps. **Migration 025 adds `consent_verified` to `students` (DPDP-legally required). Migration 026 adds `deletion_scheduled_at` to both `submissions` and `activity_logs` (DPDP retention pipeline — required for pg_cron deletion job). All 26 must be present before launch.**
  > Verifier: _______________ | Date: _______________

- [ ] **idempotency_key UNIQUE constraint verified** — in a test exam session, trigger the `submitAnswer` Server Action twice with identical `idempotency_key` values (use a Playwright test or browser console). Confirm: the second call returns success (not an error), and only **one** row appears in `student_answers` for that `idempotency_key`. Confirm: no duplicate row appears in `submissions` for the same session.
  > Verifier: _______________ | Date: _______________

- [ ] **Offline-Sync HMAC validation tested** — submit a tampered payload (modified HMAC) to `/api/submissions/offline-sync` on production. Confirm: request is rejected by `validate_and_migrate_offline_submission` RPC, no row migrated to `student_answers` or `submissions`, rejection logged in `activity_logs`.
  > Verifier: _______________ | Date: _______________

- [ ] **Clock Guard HMAC seal tested (separate from offline-sync HMAC)** — submit a tampered clock guard payload via the `submitExam` Server Action flow (modify the `seal` value before submission). Confirm: `CLOCK_GUARD_FLAG` entry appears in `activity_logs`; answers are still saved (clock guard is non-blocking — benefit of doubt to student).
  > Verifier: _______________ | Date: _______________

- [ ] **Supabase Broadcast (not Postgres Changes) verified in production** — open browser devtools on the admin Live Monitor on production. Confirm: WebSocket messages use the `broadcast` event type, not `postgres_changes`. No Postgres Changes subscriptions visible in Supabase Realtime dashboard for the exam channel.
  > Verifier: _______________ | Date: _______________

### Testing

- [ ] **All Vitest unit + integration tests passing (0 failures)** — run `npm run test` on the production commit SHA. Screenshot or CI log showing `Test Files X passed`, `Tests Y passed`, `0 failed`.
  > Verifier: _______________ | Date: _______________ | CI run: _______________

- [ ] **All Playwright E2E tests passing on production environment** — run `npx playwright test --project=chromium` against the production URL. All 5 critical flows must pass: Full EXAM, Full TEST (Phase 1→2→3), Offline Resume + Sync, Force Close, Result Publish.
  > Verifier: _______________ | Date: _______________ | CI run: _______________

### Load Testing

- [ ] **k6 thundering herd test passed (LT-01)** — run `k6 run scripts/load/lt-01-thundering-herd.js` simulating 2,500 concurrent WebSocket connections. Pass criteria: < 1% error rate, < 5,000ms mean connection time. Attach k6 summary report.
  > Verifier: _______________ | Date: _______________ | Report attached: _______________

### Assessment Engine

- [ ] **Flash Anzan timing precision verified (RAF drift < 5ms)** — run the Vitest unit test `timing-engine.spec.ts`. Confirm: RAF accumulator drift is < 5ms over a 10-second simulated run across 3 consecutive test executions.
  > Verifier: _______________ | Date: _______________

- [ ] **Offline resume E2E test passing** — run the Playwright offline test: start exam → devtools network throttle to offline → answer 5 questions → restore network → confirm (1) all 5 answers appear in `student_answers` for the session_id within 30 seconds, AND (2) the `submissions` header row shows `sync_status = 'verified'`.
  > Verifier: _______________ | Date: _______________

- [ ] **`transition: none` verified on `.flash-number` elements** — on production, open a TEST (Flash Anzan) assessment in devtools. Inspect the `.flash-number` CSS element. Confirm: `transition: none !important` is applied. No CSS transition of any property is present on this element.
  > Verifier: _______________ | Date: _______________

---

## Gate 3 — Performance

*All performance gates must pass against the production environment (not localhost or staging).*

- [ ] **Admin LCP < 2.5s (Lighthouse CI passing)** — run Lighthouse on the admin dashboard (`[institution-url]/admin/dashboard`) with desktop preset. Confirm: LCP < 2.5s, CLS < 0.1, FID/INP < 100ms. Attach Lighthouse report.
  > Verifier: _______________ | Date: _______________ | Report attached: _______________

- [ ] **Student LCP < 3.5s on simulated 4G** — run Lighthouse on the student dashboard (`[institution-url]/student/dashboard`) with Moto G4 + 4G throttle preset. Confirm: LCP < 3.5s, CLS < 0.1. Attach report.
  > Verifier: _______________ | Date: _______________ | Report attached: _______________

- [ ] **JS bundle < 150KB gzipped (first load)** — run `npm run build` and inspect `.next/build-manifest.json` or Vercel build output. Confirm: first-load JS is < 150KB gzipped. Attach bundle analysis screenshot.
  > Verifier: _______________ | Date: _______________ | Screenshot attached: _______________

- [ ] **No WCAG 2.2 AAA violations (axe-playwright scan clean)** — run `npx playwright test --project=accessibility`. Confirm: 0 critical violations across all admin routes (dashboard, students, assessments, monitor, results, announcements, settings) and all student routes (dashboard, exam, test, results, profile). axe tags: `wcag2a, wcag2aa, wcag21aa, wcag21aaa, wcag22aa`.
  > Verifier: _______________ | Date: _______________ | CI run: _______________

---

## Gate 4 — Security

*Security gates must be verified by the Technical Lead. No exceptions or partial passes.*

- [ ] **CSP headers verified in production response** — run `curl -I [institution-url]` or use a browser's Network tab and inspect response headers. Confirm: `Content-Security-Policy` header is present and includes `default-src`, `script-src`, `connect-src` directives. No `unsafe-eval` in script-src.
  > Verifier: _______________ | Date: _______________

- [ ] **No service-role key in client-side code** — run `grep -r "service_role" src/app/(student)/ src/components/` on the production commit. Confirm: zero matches. Also run `grep -r "SUPABASE_SERVICE_ROLE_KEY" src/app/(student)/`. Confirm: zero matches.
  > Verifier: _______________ | Date: _______________

- [ ] **No secrets in repository (git-secrets scan clean)** — run `git secrets --scan` (or equivalent: `gitleaks detect --source .`) on the repository. Confirm: 0 secrets detected.
  > Verifier: _______________ | Date: _______________

- [ ] **RLS policies tested for all roles** — manually verify the following in the production Supabase SQL editor:
  - Student cannot query another student's submissions: `SELECT * FROM submissions WHERE student_id = '[other-student-uuid]'` returns 0 rows when run as a student JWT
  - Teacher cannot query students outside assigned cohort: confirm RLS policy enforcement
  - Admin can query all records: confirm full access
  > Verifier: _______________ | Date: _______________

---

## Gate 5 — Operational

*Operational gates must be verified jointly by the Technical Lead and Institution Admin.*

- [ ] **CHANGELOG has V1.0.0 entry with all 26 migrations listed** — open `CHANGELOG.md`. Confirm: `## [1.0.0]` section exists with `### Database` subsection listing migrations 001 through 026. All migration names and descriptions present.
  > Verifier: _______________ | Date: _______________

- [ ] **Incident Response Plan reviewed by on-call technical contact** — the designated on-call engineer has read `docs/incident-response.md` in full, confirmed they understand P0-A (WebSocket failure) and P0-B (DB down) procedures, and acknowledges their on-call obligations.
  > Verifier (engineer): _______________ | Date: _______________

- [ ] **On-call contact has Supabase + Vercel dashboard access** — the on-call engineer has logged into both the Supabase production project dashboard and the Vercel production team dashboard using their own credentials (not shared credentials). Access confirmed and working within 48 hours of the first live exam.
  > Verifier: _______________ | Date: _______________

- [ ] **Admin manual tested with institution admin** — the designated institution administrator has walked through `docs/manuals/admin-manual.md` and successfully completed the following tasks in the production environment: (1) Create a test student, (2) Create a test assessment, (3) Move it to LIVE, (4) View it in Live Monitor, (5) Force Close, (6) View Results.
  > Verifier (admin): _______________ | Date: _______________

- [ ] **Student guide reviewed by one student aged 6–10** — a student aged between 6 and 10 years has read `docs/manuals/student-guide.md` (or its printed/on-screen equivalent) and was able to answer: "What do you do if the internet stops during your exam?" and "What is the breathing circle for?" without additional adult explanation.
  > Student age: ___ | Verifier (teacher/admin): _______________ | Date: _______________

---

## Pre-Launch Sign-Off

All gates above are confirmed as complete. The platform is authorised for its first live student assessment.

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Technical Lead | | | |
| Legal Counsel | | | |
| Compliance Officer | | | |
| Institution Admin | | | |

---

> **First live exam authorised for:** [DATE/TIME] — [Assessment title]  
> **Authorising admin:** [Name]  
> **On-call engineer:** [Name] · [Phone] · [Slack handle]

---

*Document path: `docs/pre-launch-checklist.md`*  
*This checklist must be retained as a dated artefact. File a copy alongside the DPIA sign-off.*
