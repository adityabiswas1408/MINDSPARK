# MINDSPARK Maintenance & Support Plan

> **Owner:** Platform Operations Manager  
> **Version:** 1.0 · MINDSPARK V1  
> **Last reviewed:** 2026-03-16  
> **Next review due:** 2027-03-16 (annually)  
> **Related docs:** `docs/incident-response.md` · `docs/devops.md`

---

## Table of Contents

1. [On-Call Requirements](#1-on-call-requirements)
2. [Blackout Windows](#2-blackout-windows)
3. [Routine Maintenance Schedule](#3-routine-maintenance-schedule)
4. [Data Retention & DPDP Compliance](#4-data-retention--dpdp-compliance)
5. [Supabase Upgrade Cadence](#5-supabase-upgrade-cadence)
6. [Support Escalation Ladder](#6-support-escalation-ladder)
7. [Maintenance Log](#7-maintenance-log)

---

## 1. On-Call Requirements

### Mandatory Coverage

A qualified technical contact **MUST** be available and reachable during every scheduled live exam. "Available" means:

- Phone on (not silent), responding within the SLA time
- Active access to Supabase Dashboard and Vercel Dashboard
- Able to execute incident procedures from `docs/incident-response.md`

This is non-negotiable. An exam running without technical on-call cover is an operational risk that the institution accepts in writing.

---

### Response SLAs

| Severity | Definition | Response Time | Resolution Target |
|----------|-----------|---------------|-------------------|
| **P0** | Active exam failure · data loss risk · all students disconnected | **5 minutes** | Stabilise within 30 min |
| **P1** | Degraded exam · single-student data concern · admin panel unavailable | **30 minutes** | Resolve within 2 hours |
| **P2** | Non-exam hours issue · slow load · report error | Next business day | Within 3 business days |
| **P3** | Feature request · minor UI issue | Weekly review | Backlog prioritisation |

P0 and P1 procedures are documented in full in `docs/incident-response.md`. Reference that document during incidents — do not improvise.

---

### On-Call Tools Required

| Tool | Purpose | Access required |
|------|---------|----------------|
| **Supabase Dashboard** | DB health, WAL slot monitor, RLS audit, realtime connections | Admin role on Supabase project |
| **Vercel Dashboard** | Deployment status, function logs, rollback | Admin or member role on Vercel team |
| **Slack `#incidents`** | Primary incident communication channel | All technical contacts |
| **GitHub** | Rollback via revert PR if needed | Write access to repo |
| **`activity_logs` table** | Query audit trail for forensics | Supabase dashboard SQL editor |

---

### Escalation Chain

```
On-Call Engineer
    │ (SLA breached or out of depth)
    ▼
Senior Technical Lead (phone + Slack)
    │ (infrastructure failure)
    ▼
Supabase Support (plan-dependent SLA — see §6)
    │ (billing / account issue)
    ▼
Vercel Support
```

---

## 2. Blackout Windows

### Definition

A **blackout window** is a period during which **no deployments, migrations, or configuration changes** may be made to the production environment.

### Live Exam Blackout Rule

> **No production deployments within ±2 hours of any scheduled live exam.**

| Time | Action |
|------|--------|
| Exam start − 2 hours | 🔴 Production deploy **BLOCKED** |
| Exam duration | 🔴 Blocked |
| Exam end + 2 hours | 🔴 Blocked (result sync window) |
| Outside this window | ✅ Deployments permitted (weekday preference) |

The ±2 hour buffer covers:
- Pre-exam: student lobby connections, network jitter window
- Post-exam: offline answer sync flush, results processing, `activity_logs` write drain

### Enforcing Blackouts

**Process:**
1. The teacher or admin who schedules a live exam **must** notify the on-call engineer at least 24 hours in advance.
2. The engineer marks the blackout window in the shared team calendar.
3. Any PR merges to `main` are held until the blackout clears.
4. Emergency hotfixes during a blackout require sign-off from the on-call senior lead.

**GitHub Actions guard (recommended):**

```yaml
# .github/workflows/deploy.yml
- name: Check blackout window
  run: |
    EXAM_START=$(cat .exam-schedule 2>/dev/null || echo "")
    if [ -n "$EXAM_START" ]; then
      echo "⛔ Blackout active. Deploy blocked."
      exit 1
    fi
```

> Until automated, the blackout is enforced manually via team calendar and PR review.

---

## 3. Routine Maintenance Schedule

All maintenance actions should be logged in §7 (Maintenance Log) with date, actor, and outcome.

---

### Daily (Every Business Day)

**Owner:** On-call engineer or nominated team member

| Task | How | Pass condition |
|------|-----|---------------|
| Review `activity_logs` for anomalies | Supabase SQL editor: query last 24h, filter `action_type IN ('FORCE_CLOSE','GRADE_RECALCULATION','BULK_IMPORT_FAILURE')` | No unexpected force closes, no import failures |
| Check Vercel function error rate | Vercel → Functions → Error Rate | < 1% error rate |
| Check Supabase realtime connection count | Supabase → Realtime → Reports | No unexpected spike |
| Verify last pg_cron job ran | `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;` | All jobs `succeeded` |

---

### Weekly (Every Monday Morning)

**Owner:** Technical Lead

| Task | How | Pass condition |
|------|-----|---------------|
| Review DB performance metrics | Supabase → Database → Performance (query times, index utilisation) | No queries > 500ms average |
| Check WAL slot health | `SELECT slot_name, active, restart_lsn, confirmed_flush_lsn FROM pg_replication_slots;` | No inactive slots accumulating WAL |
| Check `submissions` table for unsynced rows | `SELECT COUNT(*) FROM submissions WHERE sync_status != 'verified';` | 0 rows (or investigate) |
| Check `offline_submissions_staging` for stale rows | `SELECT COUNT(*) FROM offline_submissions_staging WHERE server_received_at < NOW() - INTERVAL '48 hours';` | 0 rows — stale means migration did not fire |
| Storage growth review | Supabase → Storage → Usage | Within plan limits, flag if > 80% |

---

### Monthly (First Monday of Each Month)

**Owner:** Technical Lead

| Task | How | Pass condition |
|------|-----|---------------|
| Purge expired sessions | Run `DELETE FROM assessment_sessions WHERE expires_at < NOW() - INTERVAL '30 days' AND closed_at IS NOT NULL;` | Rows deleted, table size stable |
| Review `activity_logs` partition health | Check monthly partition exists for upcoming month | Partition created (or create manually) |
| Run `VACUUM ANALYSE` on high-write tables | `VACUUM ANALYSE submissions; VACUUM ANALYSE activity_logs;` | No bloat warnings |
| Rotate `.env` secrets if any compromised flag raised | Supabase → Settings → API Keys | Keys rotated, team notified |
| Review Lighthouse CI scores in last month's PRs | GitHub PR checks history | Admin LCP < 2.5s, Student LCP < 3.5s met |

---

### Quarterly (January, April, July, October)

**Owner:** Technical Lead + 1 developer

| Task | How | Pass condition |
|------|-----|---------------|
| Dependency audit | `npm audit` — fix all critical and high severity | 0 critical, 0 high vulnerabilities |
| Update Supabase CLI | `npm install supabase@latest` | Latest stable version |
| Re-run full Playwright E2E suite | `npx playwright test` on staging | 100% pass rate |
| Re-run k6 load test (LT-01) | Thundering herd: 2,500 WebSocket connections | < 1% error rate, < 5s connect time |
| Review and update `docs/incident-response.md` | Check phone numbers, Slack channels, Supabase plan support tier | All contacts verified current |
| Check Node.js version against Vercel runtime | Vercel → Settings → General → Node.js version | On LTS, not EOL |

---

### Annually (Each March)

**Owner:** Platform Operations Manager + Legal

| Task | Who | Pass condition |
|------|-----|---------------|
| DPDP compliance review | Legal counsel + Ops Manager | No violations, retention schedule confirmed correct |
| Review data retention execution logs | Ops Manager | All expiry jobs ran as scheduled, deletions confirmed |
| Review privacy notice | Legal | Notice reflects current data practices |
| Supabase plan review | Ops Manager | Plan capacity matches usage projections for next 12 months |
| Disaster recovery drill | Technical Lead | Full restore verified within RTO (see `docs/incident-response.md` P2-B) |

---

## 4. Data Retention & DPDP Compliance

MINDSPARK processes student personal data and assessment records under the **Digital Personal Data Protection Act (DPDP), India, 2023**. The following schedule is the binding operational policy.

---

### Retention Schedule

| Data category | Retention period | Legal basis | Deletion method |
|--------------|-----------------|------------|----------------|
| **Exam results** (`submissions`) | **3 years** from assessment date | Legitimate educational interest | `pg_cron` marks + Security Definer deletion |
| **Exam answers** (`student_answers`) | **3 years** from assessment date | Legitimate educational interest | `pg_cron` marks + Security Definer deletion (delete before parent `submissions` row) |
| **Activity logs** (`activity_logs`) | **1 year** from log creation | Processing log compliance minimum | `pg_cron` + partition drop |
| **Session data** (`assessment_sessions`) | Until session ends + 30-day buffer | Operational necessity | Manual purge (see Monthly schedule) |
| **Offline staging** (`offline_submissions_staging`) | Until migrated to `student_answers` and `submissions` | Transient processing | Deleted by `validate_and_migrate_offline_submission` RPC post-migration |
| **Announcement reads** (`announcement_reads`) | 1 year | Analytics minimum | `pg_cron` sweep |
| **Student profiles** (`students`, `profiles`) | Duration of enrolment + 3 years | DPDP data minimisation | Manual deletion request flow |

---

### Automated Retention Pipeline

#### Step 1 — pg_cron marks records for deletion

A `pg_cron` job runs at **02:00 UTC daily** and marks records that have passed their retention expiry:

```sql
-- Run by pg_cron at 02:00 UTC daily
-- Mark submissions approaching 3-year retention limit
UPDATE submissions
SET deletion_scheduled_at = NOW() + INTERVAL '48 hours'
WHERE completed_at < NOW() - INTERVAL '3 years'
  AND deletion_scheduled_at IS NULL;

-- Mark activity_logs approaching 1-year limit
UPDATE activity_logs
SET deletion_scheduled_at = NOW() + INTERVAL '48 hours'
WHERE created_at < NOW() - INTERVAL '1 year'
  AND deletion_scheduled_at IS NULL;
```

The `deletion_scheduled_at` column must exist on both `submissions` and `activity_logs`. These columns are **not** in the base 26-migration schema — they require two additional migrations:

- **Migration 027:** `ALTER TABLE submissions ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;`
- **Migration 028:** `ALTER TABLE activity_logs ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;`

> ⚠️ Migrations 027 and 028 are required for the automated DPDP retention pipeline. Without them, the pg_cron job will fail at first execution. Add these to `supabase/migrations/` and `supabase/rollbacks/` before Phase 7 (Data Retention) build work begins. The canonical migration total is therefore **28**.

---

#### Step 2 — 48-hour guardian notification

When `deletion_scheduled_at` is set, the platform must send a notification email to the student's guardian **within 24 hours** of the field being set (before the 48-hour window expires).

**Implementation:** A second `pg_cron` job or a Supabase Edge Function triggered by the `deletion_scheduled_at` update sends an email via the platform's configured email provider.

Email content must include:
- Student name
- Data category being deleted (e.g., "exam results from [assessment title]")
- Date of deletion
- Contact for data retention requests

---

#### Step 3 — Security Definer function executes deletion

At **02:00 UTC** on `deletion_scheduled_at` day, a Security Definer RPC function executes the actual deletion:

```sql
-- Security Definer function — bypasses RLS only for deletion
CREATE OR REPLACE FUNCTION execute_scheduled_deletions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete student_answers for submissions past retention
  -- MUST run BEFORE deleting submissions (FK constraint: student_answers.submission_id → submissions.id)
  DELETE FROM student_answers
  WHERE submission_id IN (
    SELECT id FROM submissions
    WHERE deletion_scheduled_at IS NOT NULL
      AND deletion_scheduled_at <= NOW()
  );

  -- Delete submissions past retention and past notification window
  DELETE FROM submissions
  WHERE deletion_scheduled_at IS NOT NULL
    AND deletion_scheduled_at <= NOW();

  -- Delete activity_logs past retention
  DELETE FROM activity_logs
  WHERE deletion_scheduled_at IS NOT NULL
    AND deletion_scheduled_at <= NOW();

  -- Log the deletion run
  INSERT INTO activity_logs (action_type, metadata)
  VALUES ('DATA_RETENTION_EXECUTION', json_build_object('run_at', NOW()));
END;
$$;
```

The deletion itself is logged in `activity_logs` as `DATA_RETENTION_EXECUTION`. This log entry is exempt from the 1-year retention rule — it is retained permanently for compliance audit evidence.

---

### Data Deletion Requests

Students (or guardians on behalf of minors) may request early deletion under DPDP Act 2023, Section 12 (Right to Correction and Erasure).

**Process:**
1. Request received by institution admin → forwarded to Technical Lead
2. Technical Lead verifies identity (institution roll number + guardian contact)
3. Execute deletion using the Security Definer function with specific `student_id` filter
4. Confirm deletion in writing to the guardian within 30 days

---

## 5. Supabase Upgrade Cadence

### General Principles

- All upgrades are tested on the **preview/staging environment** before production
- Never upgrade Supabase or Postgres during a live exam blackout window
- All upgrades are recorded in `CHANGELOG.md`

---

### Minor Version Upgrades (e.g., Supabase CLI 1.x → 1.y)

| Step | Action |
|------|--------|
| 1 | Check Supabase release notes for breaking changes |
| 2 | Update on preview environment: `npm install supabase@latest` |
| 3 | Run full Playwright E2E suite on preview |
| 4 | If passing: deploy to production on a **weekday morning** (outside blackout window) |
| 5 | Log in `CHANGELOG.md` under `### Changed` |

Turnaround: typically same-week for minor versions.

---

### Major Version Upgrades (e.g., Supabase 1.x → 2.0)

| Step | Action |
|------|--------|
| 1 | Review official Supabase migration guide — identify all breaking changes |
| 2 | Set a **2-week testing window** on preview environment |
| 3 | Run full Vitest unit + integration suite |
| 4 | Run full Playwright E2E suite |
| 5 | Run k6 load test (LT-01 thundering herd) |
| 6 | Run axe-playwright accessibility scan |
| 7 | If all pass: schedule production deploy at least 72 hours after preview confirmation |
| 8 | Senior Lead must approve the production deploy PR |
| 9 | Document in `CHANGELOG.md` under `### Changed` |

Turnaround: minimum 2 weeks from preview deployment.

---

### Postgres Version Upgrades

Postgres upgrades are the highest-risk operation on the platform and require coordination with Supabase Support.

| Step | Action |
|------|--------|
| 1 | Open Supabase Support ticket requesting Postgres upgrade guidance for the target version |
| 2 | Create a **full Supabase database backup** (Dashboard → Settings → Backups → Generate) |
| 3 | Verify the backup is downloadable and intact |
| 4 | Test the upgrade on a branch environment first |
| 5 | Run all regression tests on the branch |
| 6 | Schedule with Supabase Support — they coordinate the upgrade during low-traffic hours |
| 7 | Monitor DB performance for 48 hours post-upgrade |

> ⚠️ **Never initiate a Postgres upgrade unilaterally.** Always coordinate with Supabase Support. The upgrade may involve brief downtime.

---

### npm Dependency Updates

| Type | Cadence | Process |
|------|---------|---------|
| Security patches | Immediately on `npm audit` alert | PR → all tests pass → merge |
| Minor updates | Quarterly (see §3) | Batch update → staging test → merge |
| Major updates (e.g., Next.js 15 → 16) | As needed, planned | Full regression test + 1-week preview |

---

## 6. Support Escalation Ladder

### Level 1 — Teacher Self-Service

**Who handles:** Teacher  
**Resources:** `docs/manuals/admin-manual.md` — Chapters 6 (Live Monitor), 7 (Force Close), 11 (Troubleshooting)  
**Covers:** Can't see a student in Monitor, student locked out, results not appearing

If the teacher cannot resolve it within 10 minutes using the manual → escalate to Level 2.

---

### Level 2 — Institution Admin

**Who handles:** Institution admin  
**Resources:** `docs/manuals/admin-manual.md` + `docs/incident-response.md` (P1 procedures)  
**Covers:** CSV import failure, exam lifecycle issue, student data question, monitor shows all-amber

If the admin cannot resolve it within 30 minutes → escalate to Level 3.

---

### Level 3 — Technical Contact

**Who handles:** On-call engineer  
**Channel:** Slack `#incidents` + phone (during live exams)  
**Response SLA:** P0 = 5 min, P1 = 30 min  
**Covers:** Infrastructure errors, data integrity concern, deployment issues, P0 exam failures

If the issue requires Supabase infrastructure intervention → escalate to Level 4.

---

### Level 4 — Supabase Support + Vercel Support

**Who handles:** Supabase and/or Vercel support teams  
**How to contact:**
- Supabase: Dashboard → Support → New Ticket (or email if on Pro/Enterprise plan)
- Vercel: vercel.com/help → Support Ticket

**Response SLA:** Depends on your Supabase subscription tier:

| Supabase Plan | Support SLA |
|--------------|-------------|
| Free | Community only (no SLA) |
| Pro | Email response, business hours |
| Team | Faster email response |
| Enterprise | Dedicated SLA (negotiated) |

> ⚠️ For a platform running live exams with 2,500 students, at minimum the **Pro plan** is required. Enterprise is recommended if SLA guarantees are needed during exam windows.

---

## 7. Maintenance Log

Use this table to record all maintenance actions performed outside of routine automated tasks.

| Date | Engineer | Task | Outcome | Notes |
|------|---------|------|---------|-------|
| 2026-03-16 | — | Initial maintenance plan created | Plan published | V1.0 |
| — | — | — | — | — |

> **Instruction:** Add a row every time a manual maintenance task is performed. Include date, your name, what you did, whether it passed, and any relevant notes. This log is reviewed during the annual DPDP compliance review.
