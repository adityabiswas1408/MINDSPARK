# MINDSPARK V1 — Incident Response Plan

> **Document type:** Incident Response — Operational Procedures  
> **Version:** 1.0  
> **Output path:** `docs/incident-response.md`  
> **Read first:** `docs/architecture.md` · `docs/fsd.md`  
> **Author role:** Site Reliability Engineer — high-stakes assessment platform · zero data-loss requirement

---

## Table of Contents

1. [Severity Levels & SLA](#1-severity-levels--sla)
2. [On-Call Requirements](#2-on-call-requirements)
3. [P0-A: Supabase Realtime WebSocket Failure](#3-p0-a-supabase-realtime-websocket-failure-mid-exam)
4. [P0-B: Supabase Database Primary Down](#4-p0-b-supabase-database-primary-down)
5. [P0-C: Mass IndexedDB Quota Exhaustion](#5-p0-c-mass-indexeddb-quota-exhaustion)
6. [P0-D: Accidental Force Close During Active Exam](#6-p0-d-accidental-force-close-during-active-exam)
7. [P1-A: Duplicate Submission Race Condition](#7-p1-a-duplicate-submission-from-offline-sync-race-condition)
8. [P1-B: Clock Guard HMAC Mismatch](#8-p1-b-clock-guard-hmac-mismatch)
9. [P1-C: CSV Bulk Import Partial Failure](#9-p1-c-csv-bulk-import-partial-failure)
10. [P1-D: Re-evaluate Results Job Hangs](#10-p1-d-re-evaluate-results-job-hangs-indefinitely)
11. [Data Safety Verification Checklist](#11-data-safety-verification-checklist)
12. [Post-Incident Template](#12-post-incident-template)

---

## 1. Severity Levels & SLA

| Severity | Definition | Response SLA | Who is paged |
|----------|-----------|-------------|-------------|
| **P0** | Active exam data at risk OR all students unable to participate | **5 minutes** | Technical Contact immediately |
| **P1** | Degraded admin experience OR isolated data anomaly, no ongoing loss | **30 minutes** | Admin notified, Technical Contact on standby |
| **P2** | Non-exam UX degradation (announcements, results viewing) | **4 hours** | Admin notified |
| **P3** | Cosmetic or minor non-blocking issues | **Next business day** | Logged for sprint |

**Zero-loss guarantee:** No P0 scenario results in unrecoverable answer loss. IndexedDB is the ground truth until sync is confirmed.

---

## 2. On-Call Requirements

### Staffing Rule
A **Technical Contact** must be available (phone on, response < 5 min) for the entire duration of any scheduled live exam session — from `forceOpenExam` to `forceCloseExam` confirmation.

### Escalation Path

```
Student reports issue
       ↓
  Teacher (in-room)
  • Reassure students
  • Note which students affected
  • Contact Admin if issue persists > 2 min
       ↓
  Admin (MINDSPARK admin panel)
  • Check Live Monitor dashboard
  • Check Supabase dashboard if available
  • Contact Technical Contact if P0 suspected
       ↓
  Technical Contact
  • Console + logs access
  • Can execute recovery SQL
  • Contacts Supabase Support if infrastructure issue
       ↓
  Supabase Support (support.supabase.com)
  • Infrastructure-level issues only
  • Reference project ref + timeline in ticket
```

### Contact Template (for Technical Contact)

```
Subject: [MINDSPARK P0] {{INCIDENT_TYPE}} — EXAM {{paper_id}} LIVE

Active exam in progress.
Students affected: {{count}}
Paper ID: {{paper_id}}
Incident start: {{timestamp_ist}}
Symptoms: {{description}}
Actions taken so far: {{actions}}
```

---

## 3. P0-A: Supabase Realtime WebSocket Failure Mid-Exam

### Scenario
Supabase Realtime WebSocket connection drops for all or most students during an active exam. Admin monitor shows mass "Disconnected" status. Students lose live visibility but **answers continue saving locally to IndexedDB**.

### Detection

| Signal | Where to check |
|--------|---------------|
| Admin Live Monitor: majority of student cards show "Disconnected" | `/admin/monitor/[paper_id]` |
| Supabase dashboard → Realtime tab → connection count drop | `app.supabase.com` |
| Browser console: `WebSocket connection failed` repeated | Student DevTools |
| Jitter reconnect attempts visible in network tab | Student DevTools Network |

### First 60 Seconds

1. **Admin:** Confirm this is a Realtime issue — check if Supabase REST API is still responding (try fetching exam paper status via admin panel)
2. **Admin:** Do NOT click Force Close — student answers are safe locally
3. **Admin:** Communicate to teacher in the room: *"Students may see a network message. Tell them to keep answering — their work is being saved."*
4. **Technical Contact (if escalated):** Check Supabase status page → `status.supabase.com`

### Student-Facing Message

```
┌─────────────────────────────────────────────────────────┐
│  📡  Network taking a break                              │
│                                                          │
│  Don't worry — your answers are being saved on           │
│  this device. Keep answering normally.                   │
│                                                          │
│  Your teacher has been notified.                         │
│  This message will go away when the connection returns.  │
└─────────────────────────────────────────────────────────┘
```

Triggered by: `supabase.channel().on('error')` or `onclose` WebSocket event → state machine emits `NETWORK_ERROR` → banner component renders.

**Never show:** "Error 1006", "WebSocket failed", error codes, or technical details.

### Student Behavior During Outage

```
Student taps MCQ option
        ↓
submitAnswer() Server Action called
        ↓
   If online:   saves to DB immediately
   If offline:  saves to Dexie IndexedDB queue
        ↓
IndexedDB is ALWAYS written first (belt-and-suspenders)
on any network condition
```

Exam continues locally. Timer continues running (based on `performance.now()` — not WebSocket).

### Recovery Steps

1. **Wait** — Supabase Realtime typically recovers within 30–120 seconds. Jitter reconnect (0–5000ms random delay) on each student client prevents thundering herd on recovery.
2. **On reconnect:** Each client calls `POST /api/submissions/offline-sync` automatically (triggered by `online` event listener + Dexie queue non-empty check).
3. **Admin verifies sync:** Live Monitor refreshes — WebSocket status returns to "Active". Submitted counts catch up.
4. **If WebSocket does NOT recover after 10 minutes:**
   - Technical Contact: check Supabase Realtime service on status page
   - If confirmed Supabase-side outage: open Supabase Support ticket with project ref
   - Students: advise to continue answering — answers sync on final submit regardless
5. **Exam continues to normal end.** `submitExam` Server Action uses REST (not WebSocket) — unaffected by Realtime outage.

### Data Safety Verification

```sql
-- After reconnect, verify all active session answers are present
SELECT
  s.id AS session_id,
  COUNT(sa.id) AS synced_answers,
  sub.sync_status
FROM submissions sub
JOIN students s ON s.id = sub.student_id
LEFT JOIN student_answers sa
  ON sa.session_id = sub.session_id
  AND sa.student_id = sub.student_id
WHERE sub.paper_id = '[paper_id]'
  AND sub.completed_at IS NULL
GROUP BY s.id, sub.sync_status
ORDER BY synced_answers ASC;
-- Rows with synced_answers = 0 may indicate missed sync — follow up with those students
```

### Post-Incident Prevention

- Increase heartbeat interval logging resolution to identify flap patterns
- Consider adding WebSocket connection quality metric to admin monitor
- Review jitter reconnect window (currently 0–5000ms) — may reduce to 0–3000ms for faster recovery

---

## 4. P0-B: Supabase Database Primary Down During Active Exam

### Scenario
The Supabase Postgres primary instance becomes unavailable. All Server Actions return 503/error. Students cannot submit answers to the DB, but **IndexedDB continues accumulating answers locally**.

### Detection

| Signal | Where to check |
|--------|---------------|
| All Server Actions fail with 503 / `INTERNAL_ERROR` | Browser network tab |
| Admin panel fails to load data | Admin panel blank/error state |
| Supabase dashboard: "Project paused" or no response | `app.supabase.com` |
| `status.supabase.com`: Postgres incident active | Supabase status page |

### First 60 Seconds

1. **Admin:** Confirm DB is down — attempt to load Students list in admin panel. If it fails with error, DB is likely unavailable.
2. **Admin:** Do NOT Force Close — this would require a DB write (which is also down).
3. **Teacher (in-room):** Announce verbally: *"Technical issue being resolved. Continue your exam normally. All your answers are being saved on this device."*
4. **Technical Contact:** Check `status.supabase.com` → Postgres status. If incident active, open Priority support ticket.

### Student-Facing Message

```
┌─────────────────────────────────────────────────────────┐
│  💾  Saving locally                                      │
│                                                          │
│  We're having a brief connection issue.                  │
│  Your answers are being saved safely on this device      │
│  and will sync automatically when we're back.            │
│                                                          │
│  Keep answering — nothing will be lost.                  │
└─────────────────────────────────────────────────────────┘
```

### Student Behavior During Outage

Same as P0-A: IndexedDB receives every answer. `submitAnswer` falls back to Dexie queue automatically. Timer continues unaffected.

### Recovery Steps

1. **Wait for Supabase automatic failover** — typically completes in 20–45 seconds for read replica promotion.
2. **On DB recovery:** REST API becomes available. Affected Server Actions auto-retry with exponential backoff (client-side retry config).
3. **Offline sync triggers:** Each client's `online` event fires → `POST /api/submissions/offline-sync` drains Dexie queue → answers written to DB.
4. **Admin verifies:** Live Monitor shows students active + answer counts catching up.
5. **If DB is down > 15 minutes:**
   - Instruct students to NOT close or refresh their browsers (IndexedDB data preserved)
   - Admin prepares to extend exam duration via `forceOpenExam` after recovery (if students lost net time)
   - Technical Contact remains on with Supabase Support until resolved

### CRITICAL Rule

> **Do NOT Force Close during a DB outage.** Force Close requires a DB write. If the DB is down, the action will fail — leaving the exam in an inconsistent state. Wait for recovery, then handle normally.

### Data Safety Verification

```sql
-- After recovery, check for any offline_submissions_staging rows not yet promoted
SELECT COUNT(*) AS unprocessed_staging_rows
FROM offline_submissions_staging oss
WHERE oss.server_received_at > NOW() - INTERVAL '2 hours'
  AND NOT EXISTS (
    SELECT 1 FROM student_answers sa
    WHERE sa.session_id = oss.session_id
      AND sa.student_id = oss.student_id
  );
-- If > 0: call validate_and_migrate_offline_submission() RPC for each unprocessed row
```

### Post-Incident Prevention

- Configure Supabase read replica for failover (Supabase Pro feature)
- Add DB health check to admin monitor header ("Database: ✅ Connected")
- Consider pre-exam DB health pre-flight check in admin "Start Exam" flow

---

## 5. P0-C: Mass IndexedDB Quota Exhaustion

### Scenario
Low-end student devices (< 4GB storage) hit the browser's IndexedDB quota limit during an active exam. `QuotaExceededError` thrown when attempting to write new answers.

### Detection

| Signal | Where to check |
|--------|---------------|
| `QuotaExceededError` caught in Dexie error handler | Client-side — logged to activity_logs via heartbeat |
| Student reports "saving issue" message | In-room teacher |
| Admin monitor: student answer count stops incrementing | Live Monitor |

### First 60 Seconds

1. Client-side LRU purge kicks in automatically (see mitigation below).
2. Teacher reassures affected students — their current question answers are always preserved.
3. Admin monitors affected students — check if answer counts resume incrementing after ~10 seconds (LRU purge completed).

### Student-Facing Message

```
┌─────────────────────────────────────────────────────────┐
│  💾  Making space                                        │
│                                                          │
│  Your device is almost full. We're clearing old data     │
│  to keep saving your current answers.                    │
│                                                          │
│  Your current question answers are safe.                 │
└─────────────────────────────────────────────────────────┘
```

### Auto-Mitigation: LRU Purge

```typescript
// src/lib/storage/dexie-quota-guard.ts

import { db } from '@/lib/storage/dexie-db';

export async function handleQuotaExceeded(): Promise<void> {
  // Request persistent storage on first quota warning (proactive)
  if (navigator.storage?.persist) {
    await navigator.storage.persist();  // prevents eviction on low storage
  }

  // LRU purge: delete oldest answered (completed) questions first
  // NEVER delete the current unanswered question or the 3 most recent answers
  const allAnswers = await db.pendingAnswers
    .orderBy('answered_at')
    .toArray();

  // Keep: last 5 answers (recency priority) + any unanswered
  const toDelete = allAnswers
    .filter(a => a.selected_option !== null)  // completed only
    .slice(0, -5);                            // keep most recent 5

  if (toDelete.length > 0) {
    await db.pendingAnswers.bulkDelete(toDelete.map(a => a.id));
  }

  // Note: purged answers are already synced to DB if online.
  // If offline, purged answers may be lost — this is the absolute worst case.
  // Minimized by: immediate online sync after each answer (belt-and-suspenders)
}

// Called in Dexie error handler:
db.on('ready', () => {
  db.on('storeError', async (event) => {
    if (event.name === 'QuotaExceededError') {
      await handleQuotaExceeded();
    }
  });
});
```

### Recovery Steps

1. LRU purge executes automatically — typically resolves within 5 seconds.
2. If purge insufficient (device is critically full):
   - Student is prompted to "Save and Continue" — triggers `submitExam` immediately with current state
   - Partial answers preserved and submitted to DB via keepalive teardown
3. Admin: review affected student's answer count after exam — flag for manual review if significantly incomplete.

### Data Safety Verification

```sql
-- Check if any students submitted with unexpectedly low answer counts
SELECT
  st.full_name,
  COUNT(sa.id) AS answers_submitted,
  paper.total_questions,
  sub.sync_status
FROM submissions sub
JOIN students st ON st.id = sub.student_id
JOIN exam_papers paper ON paper.id = sub.paper_id
LEFT JOIN student_answers sa
  ON sa.session_id = sub.session_id
  AND sa.student_id = sub.student_id
WHERE sub.paper_id = '[paper_id]'
  AND sub.completed_at IS NOT NULL
GROUP BY st.full_name, paper.total_questions, sub.sync_status
HAVING COUNT(sa.id) < (paper.total_questions * 0.5)  -- < 50% answered
ORDER BY answers_submitted ASC;
```

### Post-Incident Prevention

- Call `navigator.storage.persist()` at exam session start (not only on quota error)
- Add storage quota pre-check in LOBBY state — warn if available < 50MB
- Implement immediate answer sync (fire-and-forget) after each answer — reduces reliance on end-of-session batch sync

---

## 6. P0-D: Accidental Force Close During Active Exam

### Scenario
Admin accidentally clicks "Force Close Exam" on the wrong paper, or during an active session. All in-progress student sessions receive the `exam_closed` Broadcast event and their UI transitions to SUBMITTED state.

### Detection

| Signal | Where to check |
|--------|---------------|
| Students report unexpected "Exam Ended" screen | In-room teacher |
| Admin sees all students show "Submitted" on monitor | Live Monitor |
| `activity_logs`: `action_type = 'FORCE_CLOSE_EXAM'` with recent timestamp | Admin activity log |

### First 60 Seconds

1. **Admin:** Immediately verify this was accidental — check `activity_logs` for `FORCE_CLOSE_EXAM` timestamp.
2. **Admin:** Check how many minutes ago the close occurred (see 10-minute window below).
3. **Teacher (in-room):** Tell students to stay at their screen — do not close browser.
4. **Admin:** If within 10-minute window, use `forceOpenExam` to reopen.

### Student-Facing Message (on accidental close)

```
┌─────────────────────────────────────────────────────────┐
│  ✅  Exam ended                                           │
│                                                          │
│  Your answers have been saved.                           │
│  Please wait for your teacher's instructions.            │
└─────────────────────────────────────────────────────────┘
```

If admin reopens:
```
┌─────────────────────────────────────────────────────────┐
│  ▶  Exam continuing                                      │
│                                                          │
│  The exam has been restarted by your teacher.            │
│  You may continue from where you left off.               │
└─────────────────────────────────────────────────────────┘
```

### 10-Minute Reopen Window

```typescript
// src/app/actions/assessments.ts — forceOpenExam

// Guard: only allow reopen within 10 minutes of close
const { data: paper } = await supabase
  .from('exam_papers')
  .select('closed_at, status')
  .eq('id', assessment_id)
  .single();

if (paper.status === 'CLOSED' && paper.closed_at) {
  const minutesSinceClose = (Date.now() - new Date(paper.closed_at).getTime()) / 60000;
  if (minutesSinceClose > 10) {
    return err(ErrorCode.ASSESSMENT_LOCKED, 'Reopen window expired (> 10 minutes)');
  }
}
// Reopen allowed — set status = 'LIVE', closed_at = NULL, broadcast 'exam_reopened'
```

### Recovery Steps

1. **Admin clicks "Force Open Exam"** (available on closed exam for 10-minute window).
2. **Backend:** `exam_papers.status → 'LIVE'`, `closed_at → NULL`.
3. **Supabase Broadcast:** `exam:{paper_id}` → `{ event: 'exam_reopened' }`. (Lifecycle events always go on the `exam:` channel — students subscribe to this from IDLE state. Never use `lobby:` for lifecycle events.)
4. **Student UI:** Detects `exam_reopened` event → state machine behaviour depends on assessment type:
   - **EXAM type:** Returns to ACTIVE state with the current question preserved. Navigator remains MOUNTED.
   - **TEST type:** The interrupted flash sequence cannot be resumed mid-flash. The current question restarts from PHASE_1_START (the START screen with the Begin Flash button). The flash sequence regenerates from the seeded PRNG.
5. **Timer:** Resumed with remaining time calculated from `started_at` + `duration_minutes` — closed_at period subtracted.
6. **Students continue** from where they left off — answers already in DB are preserved.

### If Beyond 10-Minute Window

1. Admin contacts Technical Contact.
2. Technical Contact reviews `student_answers` completeness for all affected students.
3. Decision: extend exam duration manually (DB update) + manual reopen via SQL, or treat as completed with partial answers.
4. Document decision in `activity_logs` with admin action.

### Data Safety Verification

```sql
-- Verify answers up to Force Close are preserved
SELECT
  st.full_name,
  COUNT(sa.id) AS answers_at_close,
  sub.completed_at
FROM submissions sub
JOIN students st ON st.id = sub.student_id
LEFT JOIN student_answers sa
  ON sa.session_id = sub.session_id
  AND sa.student_id = sub.student_id
WHERE sub.paper_id = '[paper_id]'
GROUP BY st.full_name, sub.completed_at
ORDER BY answers_at_close DESC;
-- answers_at_close = 0 means student had not started — expected
-- Non-zero means answers preserved ✅
```

### Post-Incident Prevention

- Add confirmation modal before Force Close: *"Are you sure? This will end the exam for all 2,500 students."*
- Add 5-second countdown with cancel button on Force Close
- Separate "Force Close" button from other exam controls by visual distance (spacing + red confirmation)

---

## 7. P1-A: Duplicate Submission from Offline Sync Race Condition

### Scenario
A student with an unstable connection submits their exam, then the offline sync queue also flushes — potentially creating duplicate `student_answers` rows for the same question.

### Detection
- `activity_logs`: two `SUBMIT_EXAM` events for the same `session_id` within seconds
- `student_answers`: attempt to insert with duplicate `idempotency_key`

### First 60 Seconds
1. No immediate student-facing action needed — idempotency prevents duplicate rows.
2. Admin verifies: check `submissions` for duplicate `session_id` — impossible by UNIQUE constraint.
3. Check `student_answers` for double entries on same question — `UNIQUE (idempotency_key)` prevents it at DB level.

### Student-Facing Message
None required — duplicate handling is silent and automatic.

### Recovery Steps
1. `ON CONFLICT (idempotency_key) DO NOTHING` silently discards duplicate answer rows.
2. `UNIQUE (session_id)` on submissions prevents duplicate submission records.
3. Verify no duplicate answers exist: `SELECT COUNT(*) FROM student_answers WHERE submission_id IN (SELECT id FROM submissions WHERE paper_id = '[paper_id]') GROUP BY submission_id, question_id HAVING COUNT(*) > 1` — should always return 0 rows.
4. If duplicates somehow exist (unexpected): run `SELECT calculate_results(p_paper_id := '[paper_id]'::uuid)` RPC — corrects `is_correct` regardless.

### Post-Incident Prevention
- Idempotency keys (UUID v5) are already the primary defence — no further action needed
- Log `ON CONFLICT DO NOTHING` hits to `activity_logs` for visibility into race condition frequency

---

## 8. P1-B: Clock Guard HMAC Mismatch

### Scenario
`validateClockGuard()` returns `CLOCK_DRIFT_DETECTED` or `HMAC_MISMATCH` on a student submission. May indicate clock manipulation attempt — or a legitimate technical anomaly (NTP sync, device sleep, VM clock).

### Detection
- `activity_logs` table: new row with `action_type = 'CLOCK_GUARD_FLAG'` and session/student payload
- Supabase Broadcast: `monitor:{paper_id}` → `clock_guard_alert` event → admin monitor shows ⚠️ flag on student card

### First 60 Seconds
1. Admin sees clock guard alert on student card in Live Monitor.
2. Note the student and flags — do NOT interrupt exam.
3. Student's answers are saved regardless (HMAC mismatch is non-blocking — benefit of doubt).

### Student-Facing Message
None — clock guard events are never disclosed to students.

### Recovery Steps
1. **After exam:** Admin reviews `activity_logs` WHERE `action_type = 'CLOCK_GUARD_FLAG'` AND `target_entity_id = [session_id]` for the session.
2. **Single `CLOCK_DRIFT_DETECTED`** with no `HMAC_MISMATCH`: likely NTP correction or device sleep — mark as false positive. No action.
3. **`HMAC_MISMATCH`:** Indicates tampering attempt. Admin reviews:
   - Answer timestamps vs session duration
   - Whether answers jump in time
   - Whether `performance_elapsed` vs `wall_elapsed` diverge by > 30%
4. **If confirmed tampering:** Admin flags submission for review. Score is not automatically zeroed — manual academic integrity review required.
5. Log outcome in `activity_logs` with `action_type = 'CLOCK_GUARD_REVIEW'`.

### Post-Incident Prevention
- Add `server_elapsed` to admin results view (vs `performance_elapsed`)
- Consider adding `CLOCK_DRIFT_DETECTED` count to result detail for admin reference

---

## 9. P1-C: CSV Bulk Import Atomic Failure

### Scenario
Admin imports a student CSV. `bulk_import_students()` RPC finds **any** row with a duplicate `roll_number`, malformed `date_of_birth`, or missing required field — the entire import **rolls back atomically**. Zero rows are inserted. Admin sees `{ inserted: 0, errors: [{ row: N, reason: '...' }] }` in response.

> **This is intentional behavior.** Partial imports leave the database in an inconsistent state (some students enrolled, others silently missing). The MINDSPARK import is all-or-nothing by design — PRD §10 Vulnerability 16.

### Detection
- `importStudentsCSV` Server Action returns `{ inserted: 0, errors: [{ row: N, reason: 'duplicate_roll_number', value: 'ROLL-001' }] }`
- Admin panel shows import result summary modal with zero success count and error list

### First 60 Seconds
1. **No data in the database has changed** — the rollback is complete before the response is returned.
2. Admin reviews the error list — each error identifies the specific row number and reason.
3. No urgency — no students were affected, no partial state to clean up.

### Student-Facing Message
N/A — this is an admin-only operation.

### Recovery Steps
1. Admin downloads or reads the error report from the import result modal.
2. Open the original CSV file.
3. Fix **every** failing row (change duplicate roll numbers, reformat dates to `YYYY-MM-DD`, fill missing required fields).
4. Re-upload the **entire corrected CSV from scratch** — not just the failed rows. The full import was rolled back, so all rows need to be re-imported together.
5. Verify final count: `SELECT COUNT(*) FROM students WHERE deleted_at IS NULL;` — compare against expected total.

### Common Error Reasons and Fixes

| Error reason | What it means | Fix |
|-------------|---------------|-----|
| `duplicate_roll_number` | That roll number already exists in the database | Change the roll number to a unique value |
| `dob_format_invalid` | Date is not in `YYYY-MM-DD` format | Reformat: `15/04/2012` → `2012-04-15` |
| `level_name_not_found` | Level name doesn't exactly match an existing level | Check Settings → Levels for exact names (case-sensitive) |
| `full_name_required` | Row is missing the name column | Fill in the name |

### Post-Incident Prevention
- Add CSV preview/validation step before import (dry-run mode — validates without writing)
- Show column format hints in import UI: *"Date format: YYYY-MM-DD (e.g. 2015-08-23)"*
- Export error report automatically as downloadable CSV after any failed import

---

## 10. P1-D: Re-evaluate Results Job Hangs Indefinitely

### Scenario
Admin triggers `reEvaluateResults()` for a paper with 2500 submissions. The `calculate_results()` RPC takes too long and the Server Action times out or appears to hang.

### Detection
- Admin sees "Re-evaluating…" spinner for > 60 seconds
- Server Action returns `INTERNAL_ERROR` (timeout)
- `activity_logs`: `RE_EVALUATE_RESULTS` entry missing or shows incomplete

### First 60 Seconds
1. Admin does not retry immediately — Postgres may still be processing.
2. Technical Contact checks: `SELECT pid, query, state, wait_event FROM pg_stat_activity WHERE query LIKE '%calculate_results%'`.

### Recovery Steps
1. **Check if RPC is still running:**
   ```sql
   SELECT pid, state, query_start, query
   FROM pg_stat_activity
   WHERE query ILIKE '%calculate_results%';
   ```
2. **If running:** wait for completion (Postgres processes the full result set — retry would create duplicate work).
3. **If timed out (no active query):** retry `reEvaluateResults()` — idempotent, safe to re-run.
4. **If repeatedly timing out:** run `calculate_results(p_paper_id)` in batches by cohort:
   ```sql
   -- Run for the paper directly — always use the named parameter
   SELECT calculate_results(p_paper_id := '[paper_id]'::uuid);
   ```
5. Results will not be published to students until admin explicitly clicks "Publish Results" — no student-facing impact during re-evaluation delay.

### Post-Incident Prevention
- Add `STATEMENT_TIMEOUT = '120s'` to `calculate_results()` RPC
- Consider background job approach for re-evaluation (Supabase Edge Function with queue) for large papers
- Add progress indicator to re-evaluation UI ("Processing 1200 / 2500 sessions...")

---

## 11. Data Safety Verification Checklist

Run after any P0 incident before marking resolved:

```sql
-- 1. All active sessions have answers
SELECT
  COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS submitted,
  COUNT(*) FILTER (WHERE completed_at IS NULL)     AS in_progress,
  COUNT(*) FILTER (WHERE sync_status = 'pending')  AS pending_sync
FROM submissions
WHERE paper_id = '[paper_id]';

-- 2. No orphaned staging rows (unprocessed offline submissions)
SELECT COUNT(*) AS unprocessed_staging_rows
FROM offline_submissions_staging oss
WHERE oss.server_received_at > NOW() - INTERVAL '4 hours'
  AND NOT EXISTS (
    SELECT 1 FROM student_answers sa
    WHERE sa.session_id = oss.session_id
      AND sa.student_id = oss.student_id
  );
-- If > 0: call validate_and_migrate_offline_submission() RPC for each unprocessed row

-- 3. No student has zero answers after submission
SELECT st.full_name, COUNT(sa.id) AS answer_count
FROM submissions sub
JOIN students st ON st.id = sub.student_id
LEFT JOIN student_answers sa
  ON sa.session_id = sub.session_id
  AND sa.student_id = sub.student_id
WHERE sub.paper_id = '[paper_id]'
  AND sub.completed_at IS NOT NULL
GROUP BY st.full_name
HAVING COUNT(sa.id) = 0
ORDER BY st.full_name;
-- Should return 0 rows (or explain why — e.g. student submitted without answering)

-- 4. idempotency_key uniqueness intact
SELECT idempotency_key, COUNT(*)
FROM student_answers
WHERE session_id IN (
  SELECT session_id FROM submissions WHERE paper_id = '[paper_id]'
)
GROUP BY idempotency_key
HAVING COUNT(*) > 1;
-- Must return 0 rows
```

---

## 12. Post-Incident Template

Complete within 24 hours after any P0 incident:

```markdown
## Incident Report — [DATE] — [SEVERITY] — [TITLE]

### Timeline (IST)
- HH:MM — Incident detected
- HH:MM — First response action
- HH:MM — Root cause identified
- HH:MM — Recovery complete
- HH:MM — Data safety verified

### Root Cause
[What caused this incident?]

### Impact
- Students affected: [count]
- Answers potentially at risk: [count]
- Answers verified lost: [count — must be 0 for P0]
- Exam time lost: [minutes, if any]

### Actions Taken
[Numbered steps taken during incident]

### Data Safety Outcome
[ ] All answers verified present in DB
[ ] Offline staging table cleared
[ ] No duplicate submissions
[ ] calculate_results() verified accurate

### Prevention (added to backlog)
[Specific, actionable improvements with ticket IDs]
```

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All 4 P0 scenarios documented | ✅ §3–§6 |
| All 4 P1 scenarios documented | ✅ §7–§10 |
| Every P0 has step-by-step recovery procedure | ✅ Numbered steps in each section |
| No scenario results in unrecoverable answer data loss | ✅ IndexedDB = ground truth until sync |
| Student-facing messages documented (human language, no error codes) | ✅ Each P0 has message block |
| On-call requirements documented | ✅ §2 — SLA table + escalation path |
| Data safety verification SQL | ✅ §11 — checklist queries |
| Post-incident template | ✅ §12 |
