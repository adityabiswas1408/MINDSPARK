# MINDSPARK — Disaster Recovery & Data Retention Playbook

> **Audience:** Site Reliability Engineers (SRE), Database Administrators, Compliance Officers  
> **Security Classification:** Confidential / Operational SOP  
> **Read First:** [`docs/15_incident-response.md`](15_incident-response.md) · [`SECURITY.md`](../SECURITY.md) · [`docs/legal/dpia.md`](legal/dpia.md)

---

## 1. Objectives & SLAs

- **RPO (Recovery Point Objective):** $\le$ 1 hour (Maximum acceptable data loss window during catastrophic infrastructure failure).
- **RTO (Recovery Time Objective):** $\le$ 30 minutes (Time to restore full platform availability).
- **Data Durability:** Zero student answer loss during active examination windows through multi-tier caching (Dexie 4 local client store + Supabase PostgreSQL).

---

## 2. Backup & Point-in-Time Recovery (PITR)

### 2.1 Automated Supabase Backups
- **Daily Physical Backups:** Managed by Supabase Pro tier with 7-day retention.
- **Continuous Write-Ahead Logging (WAL):** Enables Point-in-Time Recovery (PITR) down to the exact second.

### 2.2 Manual On-Demand Backup Execution
Before running major data operations or applying schema migrations:
```bash
# Dump entire PostgreSQL schema and data
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Dump only public data
supabase db dump --data-only -f data_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2.3 Restoration Procedure
1. Navigate to **Supabase Dashboard** → **Database** → **Backups**.
2. Select the target snapshot timestamp prior to the incident.
3. Click **Restore Backup** and confirm.
4. Verify database health:
   ```sql
   SELECT count(*) FROM assessment_sessions WHERE closed_at IS NULL;
   SELECT count(*) FROM submissions;
   ```
5. Trigger cache invalidation in Vercel to sync frontend SSR clients.

---

## 3. DPDP Act Data Retention & Scheduled Deletion

Under Section 9 & 12 of India's Digital Personal Data Protection Act (DPDP), minor examination records and audit logs must not be retained indefinitely once their educational purpose is served.

### 3.1 Retention Timelines
- **Active Student Submissions:** Retained for 1 academic year (365 days) post-evaluation.
- **Audit Logs (`activity_logs`):** Retained for 180 days.
- **Staging Records (`offline_submissions_staging`):** Cleared immediately upon migration (< 24 hours).

### 3.2 Automated Deletion Pipeline (`pg_cron`)
Migration `026_add_deletion_scheduled.sql` provisions `deletion_scheduled_at` columns across `submissions` and `activity_logs`.

```sql
-- View scheduled cron jobs in production
SELECT * FROM cron.job WHERE jobname = 'dpia_scheduled_erasure';

-- Security Definer cleanup execution (runs in FK-safe order)
SELECT execute_scheduled_deletions();
```

**FK-Safe Execution Sequence:**
1. Delete child rows from `student_answers` where `submission_id IN (SELECT id FROM submissions WHERE deletion_scheduled_at <= NOW())`.
2. Delete parent rows from `submissions` where `deletion_scheduled_at <= NOW()`.
3. Delete expired audit records from `activity_logs` where `deletion_scheduled_at <= NOW()`.

---

## 4. Emergency Database Fallback Scenarios

### Scenario A: Remote Supabase Connection Blackout Mid-Exam
- **Client Behavior:** Student devices detect connection loss. The non-intrusive yellow offline banner displays (*"Working Offline — Answers Saved Locally"*).
- **Answer Safety:** All MCQ selections are persisted directly to IndexedDB (Dexie 4).
- **Resolution:**
  1. Teachers instruct students to continue taking the test.
  2. Once Supabase recovers, background `sync-engine.ts` flushes all buffered answers via `/api/submissions/offline-sync`.
  3. Verify zero dropped answers using:
     ```sql
     SELECT count(*) FROM offline_submissions_staging;
     ```

### Scenario B: Accidental Data Corruption (Level / Question Deletion)
1. Lock affected assessment by setting `status = 'DRAFT'`.
2. Check `activity_logs` table for the exact timestamp and actor:
   ```sql
   SELECT * FROM activity_logs 
   WHERE action_type = 'DELETE_QUESTION' 
   ORDER BY timestamp DESC LIMIT 10;
   ```
3. Reconstruct questions from `assessment_session_questions` immutable snapshot table.
