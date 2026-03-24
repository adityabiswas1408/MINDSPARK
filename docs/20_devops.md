# MINDSPARK V1 — DevOps & Deployment Plan

> **Document type:** DevOps — Build Support  
> **Version:** 1.0  
> **Output path:** `docs/devops.md`  
> **Read first:** `docs/architecture.md` · `docs/database.md`  
> **Author role:** Senior DevOps Engineer — Vercel · Supabase · GitHub Actions · zero-downtime deployments

---

## Table of Contents

1. [Environment Overview](#1-environment-overview)
2. [Environment Variables](#2-environment-variables)
3. [CI/CD Pipeline — PR](#3-cicd-pipeline--pr)
4. [CI/CD Pipeline — Merge to Main](#4-cicd-pipeline--merge-to-main)
5. [Database Migration Strategy](#5-database-migration-strategy)
6. [Rollback Procedures](#6-rollback-procedures)
7. [Deployment Runbook](#7-deployment-runbook)
8. [Monitoring & Alerting](#8-monitoring--alerting)

---

## 1. Environment Overview

### Three Environments — Strict Promotion Flow

```
Local → Preview (per-PR) → Production
  ↑           ↑                ↑
Developer  Vercel PR      Vercel main
 machine   deploy        branch deploy
Supabase   Supabase       Supabase
  local    staging         prod
 Docker    project        project
```

### Local Environment

| Setting | Value |
|---------|-------|
| Framework | `npm run dev` (Next.js Dev Server) |
| Database | Supabase local stack via Docker (`npx supabase start`) |
| Studio URL | `http://localhost:54323` |
| API URL | `http://localhost:54321` |
| DB URL | `postgresql://postgres:postgres@localhost:54322/postgres` |
| Seeding | `npx supabase db reset` → runs migrations + `seed.sql` |

**Local setup checklist (new developer):**
```bash
git clone [repo]
cp .env.example .env.local          # fill in values
npm install
npx supabase start                  # starts Docker containers
npx supabase db reset               # runs all 28 migrations + seed
npm run dev                         # starts Next.js on :3000
```

### Preview Environment (Per-PR)

| Setting | Value |
|---------|-------|
| Hosting | Vercel preview deployment (auto-created on PR open) |
| URL pattern | `https://mindspark-[hash]-[org].vercel.app` |
| Database | Supabase staging project (shared across all PRs) |
| Migrations | NOT automatically applied to staging — see §5 |
| Branch protection | Direct push to `preview` branch blocked |

> [!IMPORTANT]
> Preview deployments share **one staging Supabase project**. Never run destructive migrations on staging without coordinating with other team members. Use a **PR description checklist** to signal schema changes.

### Production Environment

| Setting | Value |
|---------|-------|
| Hosting | Vercel production (auto-deploy on merge to `main`) |
| URL | `https://mindspark.app` (or custom domain) |
| Database | Supabase production project (separate project, separate keys) |
| Migrations | Run via `npx supabase db push` during deploy pipeline (see §4) |
| Branch protection | `main` requires PR + 1 approving review + all CI checks green |

---

## 2. Environment Variables

Required across all environments. Values stored in `.env.local` locally, Vercel env settings for preview/production. **Never commit `.env.local`**.

```bash
# .env.example — committed to repo (values empty/placeholder)

# Supabase — public (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase — server-only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Anti-cheat — server-only
HMAC_SECRET=[32-char-random-string]   # Clock Guard HMAC signing key
# Rotate this ONLY between exam windows — never mid-exam (breaks active seals)

# App
NEXT_PUBLIC_APP_URL=https://mindspark.app   # canonical URL for CORS + CSP
```

### Variable Validation at Build Time

```typescript
// src/lib/env.ts — fail build if required vars missing
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

const serverOnly = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_DB_URL',
  'HMAC_SECRET',
] as const;

if (typeof window === 'undefined') {
  serverOnly.forEach(key => {
    if (!process.env[key]) throw new Error(`Missing server env var: ${key}`);
  });
}

required.forEach(key => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
});
```

| Variable | Used in | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase calls | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | `admin.ts` only | Server-only |
| `SUPABASE_DB_URL` | `supabase db push` in CI | Server-only |
| `HMAC_SECRET` | `clock-guard.ts` | Server-only |
| `NEXT_PUBLIC_APP_URL` | CSP headers, CORS | Public |

---

## 3. CI/CD Pipeline — PR

Triggered on: `pull_request` (opened, synchronised, reopened)

```yaml
# .github/workflows/pr.yml
name: PR Pipeline
on:
  pull_request:
    branches: [main]
```

### Step 1 — Type Check (FAIL FAST)

```yaml
- name: Type Check
  run: npm run tsc
  # Fails immediately — no subsequent steps run
  # Rationale: tsc catches the largest class of bugs early; 
  # no point running build or tests against broken types
```

**Failure condition:** Any TypeScript error. Zero tolerance.

### Step 2 — Lint

```yaml
- name: Lint
  run: npm run lint
  # Custom rules enforced:
  # - no admin.ts import in src/app/(student)/** (ESLint rule)
  # - no setInterval in src/lib/anzan/** (custom rule)
  # - no #FF6B6B in className strings (regex rule)
```

**Failure condition:** Any ESLint error (warnings are allowed but logged).

### Step 3 — Build (Vercel Simulation)

```yaml
- name: Build
  run: npm run build
  env:
    NEXT_PUBLIC_SUPABASE_URL:  ${{ secrets.STAGING_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.STAGING_ANON_KEY }}
    NEXT_PUBLIC_APP_URL:       ${{ secrets.STAGING_APP_URL }}
  # Note: build uses staging keys — server-side vars like HMAC_SECRET
  # use test values in CI, not production secrets
```

**Failure condition:** Build errors, missing env vars.

### Step 4 — Unit + Integration Tests

```yaml
- name: Start Supabase (for integration tests)
  uses: supabase/setup-cli@v1
  with: { version: latest }
- run: supabase start
- run: supabase db reset

- name: Unit Tests
  run: npm run test:unit

- name: Integration Tests
  run: npm run test:integration
```

**Failure condition:** Any test failure. Integration tests run against local Supabase, not staging — avoids polluting shared staging state.

### Step 5 — Bundle Size Check

```yaml
- name: Bundle Size Gate
  run: |
    npm run build
    node scripts/check-bundle-budget.js \
      --first-load-max=150000 \
      --engine-chunk-max=80000
  # Fails PR if gzipped first-load JS exceeds 150KB
  # Prevents accidental bundle bloat from new dependencies
```

**Failure condition:** First-load bundle > 150KB gzipped.

### Step 6 — Vercel Preview Deploy

```yaml
- name: Deploy to Vercel Preview
  uses: amondnet/vercel-action@v25
  with:
    vercel-token:   ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id:  ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
  id: vercel-deploy
  # Output: ${{ steps.vercel-deploy.outputs.preview-url }}
```

### Step 7 — Playwright E2E on Preview URL

```yaml
- name: E2E Tests
  run: |
    npx playwright install --with-deps chromium
    PLAYWRIGHT_BASE_URL=${{ steps.vercel-deploy.outputs.preview-url }} \
    npx playwright test
  # Runs against live Vercel preview → real network, real Supabase staging
  # Video + traces retained on failure as artifacts
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

**Failure condition:** Any E2E test failure.

### Step 8 — Accessibility Scan

```yaml
- name: Accessibility Scan
  run: |
    PLAYWRIGHT_BASE_URL=${{ steps.vercel-deploy.outputs.preview-url }} \
    npx playwright test --grep "A11Y"
  # axe-playwright: 0 WCAG 2.2 AAA violations across all routes
  # Tags enforced: wcag2a, wcag2aa, wcag21aa, wcag21aaa, wcag22aa
```

**Failure condition:** Any WCAG 2.2 AAA violation detected.

### PR Check Summary

| Check | Tool | Failure stops? |
|-------|------|----------------|
| Type check | `tsc` | Yes — immediately |
| Lint | ESLint | Yes |
| Build | Next.js | Yes |
| Unit tests | Vitest | Yes |
| Integration tests | Vitest + Supabase | Yes |
| Bundle size | Custom script | Yes |
| E2E tests | Playwright | Yes |
| Accessibility | axe-playwright | Yes |

---

## 4. CI/CD Pipeline — Merge to Main

Triggered on: `push` to `main` branch (only via merged PR — direct push blocked).

```yaml
# .github/workflows/main.yml
name: Production Deploy
on:
  push:
    branches: [main]
```

### Step 1 — All PR Checks Implied

Merge to main is only possible after all PR checks pass (branch protection rule). Pipeline starts from production deploy steps only.

### Step 2 — Deploy to Vercel Production

```yaml
- name: Deploy to Vercel Production
  uses: amondnet/vercel-action@v25
  with:
    vercel-token:     ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id:    ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
  id: deploy-prod
```

### Step 3 — Database Migration

```yaml
- name: Run Migrations on Production
  run: |
    npx supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  # Applies any pending migrations from supabase/migrations/ not yet on production
  # WARNING: see §5 for migration rules, especially the no-live-exam-window rule
```

> [!WARNING]
> Migration step runs **automatically on every merge to main**. If a PR contains a schema change in `supabase/migrations/`, it will be applied to production the moment it merges. Coordinate exam windows carefully — see §5.

### Step 4 — Smoke Test

```yaml
- name: Smoke Test
  run: |
    # 1. Health endpoint
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      ${{ secrets.PROD_URL }}/api/health)
    if [ "$STATUS" != "200" ]; then
      echo "Health check failed: $STATUS"
      exit 1
    fi

    # 2. DB connection via health endpoint (not direct)
    BODY=$(curl -s ${{ secrets.PROD_URL }}/api/health)
    echo $BODY | grep -q '"db":"ok"' || (echo "DB check failed"; exit 1)

    echo "Smoke test passed"
```

```typescript
// src/app/api/health/route.ts — production smoke test endpoint
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  try {
    const { error } = await serverSupabase.from('institutions').select('id').limit(1);
    return Response.json({
      status: 'ok',
      db:     error ? 'error' : 'ok',
      ts:     new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({ status: 'error', db: 'unreachable' }, { status: 503 });
  }
}
```

**Failure condition:** `/api/health` returns non-200, or `db` field is not `"ok"`.

### Step 5 — Slack Notification

```yaml
- name: Notify Slack — Success
  if: success()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK:  ${{ secrets.SLACK_WEBHOOK }}
    SLACK_TITLE:    'MINDSPARK deployed ✅'
    SLACK_MESSAGE:  'Production deploy successful. Commit: ${{ github.sha }}'
    SLACK_COLOR:    'good'

- name: Notify Slack — Failure
  if: failure()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK:  ${{ secrets.SLACK_WEBHOOK }}
    SLACK_TITLE:    'MINDSPARK deploy FAILED ❌'
    SLACK_MESSAGE:  'Production deploy failed at: ${{ github.job }}. Commit: ${{ github.sha }}'
    SLACK_COLOR:    'danger'
```

---

## 5. Database Migration Strategy

### Core Rules (Non-Negotiable)

> [!CAUTION]
> **NEVER run migrations during a live exam window.** A migration that acquires a table lock will cause all in-flight Server Actions to fail immediately, including `submitAnswer`. Students will lose answers with no recovery path.

| Rule | Detail |
|------|--------|
| **Changelog first** | Every migration file must have a corresponding CHANGELOG entry in `CHANGELOG.md` **before** the PR is merged |
| **RLS changes = 2-person review** | Any PR touching `016_create_rls_policies.sql` or adding new RLS policies requires 2 approving reviewers (configured in branch protection) |
| **No live-exam migration** | Check `SELECT COUNT(*) FROM assessment_sessions WHERE status = 'LIVE'` before any manual migration. Zero tolerance — reschedule if any exams are live |
| **Every migration needs rollback** | `supabase/rollbacks/0XX_rollback_description.sql` must exist for every numbered migration |
| **Forward-only in CI** | CI runs `supabase db push` (forward only). Rollbacks are manual operations documented in §6 |
| **Additive by default** | Prefer additive changes (new columns with defaults, new tables). Avoid renaming, dropping, or changing column types |

### Migration File Naming

```
supabase/migrations/
  001_create_institutions.sql
  002_create_roles_and_users.sql
  ...
  020_create_indexes.sql
  021_create_student_answers.sql
  022_add_announcement_reads.sql
  023_add_version_seq_trigger.sql
  024_add_ticker_mode.sql
  025_add_consent_verified.sql        # DPDP legally required
  026_add_deletion_scheduled_at.sql   # DPDP legally required
  027_add_deletion_scheduled_at_submissions.sql  # retention pipeline required
  028_add_deletion_scheduled_at_activity_logs.sql # retention pipeline required

supabase/rollbacks/
  001_rollback_create_institutions.sql
  002_rollback_create_roles_and_users.sql
  ...
  020_rollback_create_indexes.sql
  021_rollback_create_student_answers.sql
  022_rollback_add_announcement_reads.sql
  023_rollback_add_version_seq_trigger.sql
  024_rollback_add_ticker_mode.sql
  025_rollback_add_consent_verified.sql
  026_rollback_add_deletion_scheduled_at.sql
  027_rollback_add_deletion_scheduled_at_submissions.sql
  028_rollback_add_deletion_scheduled_at_activity_logs.sql
```

> **Total migrations: 28.** Migrations 025–026 are legally required for DPDP compliance. Migrations 027–028 are required for the automated data retention pipeline. Do NOT skip any. Every migration must have a companion rollback file.

### Before Opening a Migration PR

**PR Description checklist** (template in `.github/pull_request_template.md`):

```markdown
## Migration Checklist
- [ ] Is this migration additive? (new column/table with defaults)
- [ ] Does `supabase/rollbacks/` have a companion rollback file?
- [ ] Is there a CHANGELOG entry in `CHANGELOG.md`?
- [ ] Have I checked that no live exams are scheduled in the next 2 hours?
- [ ] If touching RLS: have I requested 2 reviewers?
- [ ] Tested migration locally with `supabase db reset`?
```

### CHANGELOG Format

```markdown
# CHANGELOG.md

## [Unreleased]
### Database
- 021_add_submission_flagged_at: Adds nullable `flagged_at` column to `submissions`.
  - Additive: YES (nullable with no default — existing rows unaffected)
  - Rollback: `ALTER TABLE submissions DROP COLUMN flagged_at;`
  - RLS impact: None

## [2024-03-15]
### Database
- 020_create_indexes: Adds BRIN index on activity_logs, partial index on submissions.
  - Additive: YES
  - Rollback: supabase/rollbacks/020_rollback_create_indexes.sql
```

---

## 6. Rollback Procedures

### Rollback Philosophy

Supabase does not support automatic schema rollbacks. Every rollback is a **forward migration that undoes the change**. This is intentional — it creates an audit trail and avoids the "time travel" problem with already-committed data.

### Rollback File Template

```sql
-- supabase/rollbacks/0XX_rollback_[description].sql
-- Rollback for: 0XX_[description].sql
-- Author:
-- Date:
-- Risk: LOW / MEDIUM / HIGH
-- Data loss: YES / NO

-- Preconditions: check before running
-- Example: ensure no active sessions reference this column
SELECT COUNT(*) FROM assessment_sessions WHERE status = 'LIVE';
-- If > 0: STOP. Do not proceed during live exams.

-- ============================================================
-- BEGIN ROLLBACK
-- ============================================================

-- [SQL to reverse the migration]

-- Example for a new column rollback:
-- ALTER TABLE submissions DROP COLUMN IF EXISTS flagged_at;

-- Example for a new table rollback:
-- DROP TABLE IF EXISTS new_table CASCADE;
-- ⚠️ CASCADE will drop all FK references — verify before running

-- Example for an index rollback:
-- DROP INDEX IF EXISTS idx_submissions_session_student;

-- ============================================================
-- END ROLLBACK — verify with:
-- \d submissions (check column removed)
-- SELECT COUNT(*) FROM some_table (check data intact)
-- ============================================================
```

### Running a Rollback (Manual Process)

```bash
# 1. Confirm no live exams
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM assessment_sessions WHERE status = 'LIVE';"
# → Must return 0

# 2. Create a backup (Supabase dashboard → Database → Backups → manual snapshot)
# Wait for backup to complete before proceeding

# 3. Run rollback SQL (reviewed by 2nd engineer on call)
psql $SUPABASE_DB_URL -f supabase/rollbacks/0XX_rollback_description.sql

# 4. Verify rollback
psql $SUPABASE_DB_URL -c "\d submissions"    # check schema
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM submissions"  # check data intact

# 5. Redeploy application code without the rolled-back feature
# → Revert commit on main (git revert) or cherry-pick stable version
# → Merging to main will trigger auto-deploy

# 6. Post to Slack incident channel with timeline
```

### Application-Level Rollback (No Schema Change)

If the migration is safe to leave in place but application code needs reverting:

```bash
# Revert the Next.js deploy to last known good commit via Vercel dashboard
# Vercel → Deployments → [last good deployment] → Promote to Production
# No database change needed — code rollback only
```

---

## 7. Deployment Runbook

### Pre-Deployment Checklist (Run Before Every Production Deploy)

```bash
# 1. Verify no live exams
psql $SUPABASE_DB_URL -c \
  "SELECT title, started_at FROM assessment_sessions WHERE status = 'LIVE';"

# 2. Confirm all PR checks green (GitHub UI)

# 3. If migration included: announce in Slack
# "Deploying MINDSPARK v[version] at [time]. Includes DB migration: [description].
#  Exam window blocked for next 15 minutes."

# 4. Merge PR → auto-deploy triggers
# Monitor: GitHub Actions → Production Deploy workflow

# 5. Post-deploy: run smoke test manually
curl https://mindspark.app/api/health | jq .
# → { "status": "ok", "db": "ok" }

# 6. Monitor Supabase dashboard for 5 minutes post-migration
# → Watch: DB CPU, active connections, query latency
```

### GitHub Secrets Required

| Secret Name | Purpose | Set in |
|------------|---------|--------|
| `VERCEL_TOKEN` | Vercel API authentication | Vercel dashboard |
| `VERCEL_ORG_ID` | Vercel organisation | Vercel dashboard |
| `VERCEL_PROJECT_ID` | Vercel project | Vercel dashboard |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI auth | Supabase dashboard |
| `SUPABASE_DB_URL` (prod) | Migration target | Supabase dashboard |
| `STAGING_SUPABASE_URL` | Preview build env | Supabase staging |
| `STAGING_ANON_KEY` | Preview build env | Supabase staging |
| `HMAC_SECRET` | Clock Guard signing | Admin-generated |
| `SLACK_WEBHOOK` | Deploy notifications | Slack app settings |
| `PROD_URL` | Smoke test target | Manually set |

---

## 8. Monitoring & Alerting

### Supabase Dashboard — Real-Time Metrics

| Metric | Location | Alert threshold |
|--------|----------|-----------------|
| DB connections | Supabase → Database → Connection Pool | > 80% of pool capacity |
| RLS query latency | Supabase → Logs → API | p95 > 500ms |
| Realtime connections | Supabase → Realtime → Metrics | > 2,400 concurrent |
| WAL replication lag | Supabase → Database → Replication | Any WAL slot present |
| Auth failure rate | Supabase → Auth → Logs | > 50 failures/min |

> [!NOTE]
> WAL replication slots (Postgres Changes subscriptions) must be zero during live exams. All exam state uses Supabase Broadcast — if a WAL slot is observed growing, a client is incorrectly using Postgres Changes and must be identified immediately.

### Vercel Analytics

| Metric | Target | Action if exceeded |
|--------|--------|-------------------|
| Admin LCP | < 2.5s | Investigate bundle size or RSC query |
| Student LCP | < 3.5s | Check 4G throttling, image optimization |
| Function execution time (Server Actions) | < 500ms p95 | Add DB index or cache |
| Edge Middleware execution | < 50ms | Simplify JWT validation |

### Custom Monitoring — `activity_logs` Table

The `activity_logs` table is the primary audit source for application-level events.

```sql
-- Dashboard query: exam session health in last 24h
SELECT
  action_type,
  COUNT(*)                                                AS count,
  MAX(timestamp)                                          AS last_seen
FROM activity_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
  AND action_type IN (
    'EXAM_START', 'EXAM_SUBMIT', 'OFFLINE_SYNC', 'FORCE_CLOSE',
    'SUBMISSION_TEARDOWN', 'HMAC_MISMATCH', 'CLOCK_DRIFT_DETECTED'
  )
GROUP BY action_type
ORDER BY count DESC;

-- Alert query: HMAC mismatches in last hour (> 10 = possible attack)
SELECT COUNT(*) AS hmac_flags
FROM activity_logs
WHERE action_type = 'HMAC_MISMATCH'
  AND timestamp > NOW() - INTERVAL '1 hour';

-- Alert query: offline syncs that failed verification
SELECT COUNT(*) AS failed_syncs
FROM activity_logs
WHERE action_type = 'OFFLINE_SYNC_REJECTED'
  AND timestamp > NOW() - INTERVAL '1 hour';
```

### Alerting Runbook

| Alert | Severity | First action |
|-------|----------|-------------|
| `/api/health` returns non-200 | P0 | Check Vercel function logs immediately |
| DB connections > 80% | P1 | Check for subscription leaks (`supabase.removeChannel`) |
| HMAC_MISMATCH > 10/hour | P1 | Review flagged submissions in `activity_logs` |
| WAL slot growing during live exam | P0 | Identify offending client, kill subscription |
| Vercel function timeout > 5% rate | P1 | Check slow DB queries, add index |

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| 3 environments documented (local, preview, production) | ✅ §1 |
| Full CI/CD pipeline for PR with failure conditions | ✅ §3 |
| Full CI/CD pipeline for merge to main | ✅ §4 |
| Migration strategy with rollback files | ✅ §5 + §6 |
| No-migration-during-live-exam rule | ✅ §5 (CAUTION alert) |
| All required env vars listed | ✅ §2 |
| Rollback procedure (manual, no data loss) | ✅ §6 |
| Monitoring config with alert thresholds | ✅ §8 |
