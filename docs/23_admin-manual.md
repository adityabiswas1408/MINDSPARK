# MINDSPARK Administrator Manual

> **Audience:** Institution administrators managing MINDSPARK day-to-day  
> **Version:** 1.0 · MINDSPARK V1  
> **Path:** `docs/manuals/admin-manual.md`  
> **For technical incidents:** refer to `docs/incident-response.md`

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Level Management](#2-level-management)
3. [Student Management](#3-student-management)
4. [Assessment Creation](#4-assessment-creation)
5. [Going Live](#5-going-live)
6. [Live Monitor](#6-live-monitor)
7. [Force Close an Exam](#7-force-close-an-exam)
8. [Results Management](#8-results-management)
9. [Announcements](#9-announcements)
10. [Settings](#10-settings)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Getting Started

### Logging In

1. Navigate to your institution's MINDSPARK URL (e.g., `https://mindspark.app`).
2. Enter your admin **email** and **password**.
3. Click **Sign In**.

If you see a "Please set a new password" prompt on first login, you must complete password reset before accessing any other page. This is mandatory for all accounts provisioned by another admin.

> **Locked out?** After 5 failed login attempts, your account locks for 15 minutes. Contact your institution's primary admin or the escalation contact in [§11](#11-troubleshooting).

---

### Dashboard Overview

After login, you land on the **Dashboard** — the operational command centre for your institution.

| Section | What it shows |
|---------|--------------|
| **KPI Cards** (top row) | Total active students · Pending evaluations · Live exams now · System health |
| **Sparklines** | Week-over-week trend arrow for each KPI (green = up, red = down) |
| **Live Pulse** | Real-time count of exams currently running and students connected |
| **Recent Announcements** | Last 3 published announcements |
| **Pending Actions** | Exams awaiting results publish, imports pending review |

Clicking any KPI card navigates directly to the relevant module with the filter pre-applied (e.g., clicking "Pending Evaluations" opens Results filtered to unpublished).

---

### MINDSPARK Navigation

The left sidebar provides access to all modules. It is role-based — teacher accounts see a reduced sidebar. Your admin view includes all entries:

```
Dashboard
Levels
Students
Assessments
Monitor        ← only appears when a live exam is running
Results
Announcements
Reports
Activity Log
Settings
```

Use **Ctrl+K** (Windows) or **Cmd+K** (Mac) to open the global search palette. Search works across students, assessments, and announcements.

---

## 2. Level Management

Levels define your institution's academic progression structure (e.g., Starter → Bronze → Silver → Gold → Diamond). Every student belongs to exactly one level at any time.

### Creating a Level

1. Go to **Levels** in the sidebar.
2. Click **+ New Level**.
3. Fill in:
   - **Name** — e.g., "Bronze II" (required)
   - **Sequence Order** — the number controlling where this level sits in the hierarchy (1 = first). Must be unique.
   - **Description** — what students learn at this level (optional but recommended)
4. Click **Save Level**.

> The sequence order determines the order displayed to students and the direction of promotions. Level 1 is the entry point; the highest number is the most advanced.

---

### Reordering Levels

The level list supports **drag and drop**:

1. On the Levels page, hover over any level row — a **grip handle** (⠿) appears on the left.
2. Click and drag the row to its new position.
3. Release — the order saves immediately.

The page updates optimistically (you see the change right away) and confirms with a green toast notification once saved to the database.

---

### Editing a Level

Click any level row to open the detail panel on the right side of the screen. Edit the name, sequence order, or description. Click **Save Changes**.

---

### Deleting a Level

1. Click the level row to open the detail panel.
2. Click **Delete Level**.
3. If students are currently assigned to this level, or if assessments are mapped to it, you will see:

> ⚠️ **Cannot delete:** This level has X active students and Y assessments. Promote or reassign students first, then delete associated assessments before deleting the level.

Deletion is **permanently blocked** while any student or assessment references the level. This is a data safety guard — it cannot be overridden.

---

## 3. Student Management

### The Student Directory

Go to **Students** to see all enrolled students. The table supports:

- **Search** — type in the search box; results update after a short pause (300ms debounce)
- **Filter by Status** — Active · Inactive · Locked
- **Filter by Level** — select one or more levels
- **Combine filters** — e.g., Status = Active AND Level = Bronze I

Column headers are sortable. Click once to sort ascending, again to sort descending.

---

### Adding a Single Student

1. Click **+ Add Student**.
2. Fill in:
   - **Full Name** (required)
   - **Roll Number** (required — must be unique across the institution)
   - **Date of Birth** (required — used as the initial password)
   - **Level** (required — select from your existing levels)
3. Click **Create Student**.

The student receives a Supabase Auth account. Their initial password is their date of birth in `DDMMYYYY` format. They will be prompted to set a new password on first login.

---

### CSV Bulk Import

Use CSV import to enrol a class or entire cohort at once.

#### Step 1 — Download the Template

Click **Import Students** → **Download Template**. The CSV template has these exact column headers (do not rename them):

```
full_name,roll_number,dob,level_name
John Smith,ROLL-001,2011-04-15,Bronze I
Jane Doe,ROLL-002,2012-09-22,Silver II
```

| Column | Format | Required |
|--------|--------|----------|
| `full_name` | Text | Yes |
| `roll_number` | Text (unique) | Yes |
| `dob` | `YYYY-MM-DD` | Yes |
| `level_name` | Must exactly match an existing level name | Yes |

#### Step 2 — Fill in Your Data

Open the template in Excel, Google Sheets, or any spreadsheet tool. Fill rows below the header. Save as `.csv`.

#### Step 3 — Upload and Preview

1. Click **Import Students** → **Upload CSV**.
2. Select your file.
3. A preview table appears showing all rows. Rows with errors are highlighted in red with an inline explanation (e.g., "Roll number already exists", "Level name not found", "DOB format invalid").
4. Fix errors in your file and re-upload, or remove the problematic rows from the preview.

#### Step 4 — Confirming the Import

> ⚠️ **CRITICAL — Read before clicking Confirm:**
>
> The import is **atomic** — all rows succeed or none do. If even **one row fails**, the **entire import rolls back** and zero students are added.
>
> This is intentional: it prevents partial imports that leave your database in an inconsistent state (e.g., 47 of 50 students enrolled, and 3 silently missing).

Once the preview shows **0 errors**, click **Confirm Import**.

#### Step 5 — Verifying the Import

After confirmation:
- A success banner shows: "**50 students imported successfully.**"
- Cross-check: the number in the banner must match the number of data rows in your CSV (exclude the header row from your count).
- Go to Students → apply Level filter to your target level — the count should reflect the new students.

#### What to Do If the Import Fails

1. Read the error message — it will identify the specific row(s) and reason(s).
2. Fix your CSV file.
3. Re-upload from the start of Step 3 — the failed import left no data in the database.

---

### Guardian Consent (DPDP Compliance — Required Before Student Access)

MINDSPARK requires verified guardian consent before a student can log in. This is a legal requirement under the DPDP Act 2023. A student with unverified consent will see a "Consent required" message if they attempt to log in.

#### Triggering the Consent Email

When you create a student (manually or via CSV import), the consent email is sent automatically to the guardian email address on file **if** one was provided. If no guardian email was provided at creation, trigger it manually:

1. Open the student's profile.
2. Click the **Settings** tab.
3. Click **Send Consent Email**.
4. Confirm — an email is sent to the guardian with a verification link.

#### Checking Consent Status

The student directory table includes a **Consent** column:
- ✅ **Verified** — guardian clicked the link; student can log in
- ⏳ **Pending** — email sent but not yet clicked
- ✉️ **Not Sent** — no consent email has been sent yet

Filter by "Pending" or "Not Sent" before an exam to identify students who may not be able to participate.

#### Resending the Consent Email

If a guardian did not receive the email or the link expired:

1. Open the student's profile → **Settings** tab.
2. Click **Resend Consent Email**.

The previous link is invalidated when a new one is sent.

#### What Students See Without Consent

If a student attempts to log in before consent is verified, they see:

> *"Your account is not yet active. Ask your teacher to send a consent email to your parent or guardian."*

No exam access is granted until `consent_verified = true` in the database.

---

### Promoting a Student to the Next Level

1. Click the student's row to open their profile.
2. Click the **Academic** tab.
3. Click **Promote to Next Level**.
4. Confirm in the modal.

The promotion performs three steps atomically: (1) updates `students.level_id` to the new level, (2) closes the current `cohort_history` row by setting `valid_to = now()`, and (3) creates a new `cohort_history` row with `valid_from = now()` and `valid_to = NULL`. This preserves the teacher's historical access to the student's prior-level data — previous results remain visible in the History tab even after the student moves up.

> You cannot promote a student past the highest-numbered level. If you need to create a new level, do so in Level Management first.

---

### Locking / Unlocking a Student Account

1. Open the student's profile.
2. Click the **Settings** tab.
3. Toggle **Account Locked**.

Locked accounts cannot log in. Use this for extended absences or data safety after a security concern. Answers in active exams are not affected — they remain saved.

---

## 4. Assessment Creation

MINDSPARK has two assessment types. Choose the correct type at creation — **it cannot be changed afterwards**.

| Type | Format | Use for |
|------|--------|---------|
| **EXAM** | Vertical equations displayed on screen + 4-option MCQ | Standard arithmetic assessment |
| **TEST** | Numbers flash on screen at set intervals + 4-option MCQ | Flash Anzan (mental arithmetic speed) |

---

### Creating an EXAM

1. Go to **Assessments** → **+ New Assessment**.
2. Select **EXAM**.
3. Fill in:
   - **Title** (required)
   - **Level** — which level this paper is assigned to (required)
   - **Duration** — total exam time in minutes (required)
   - **Instructions** — shown to students in the pre-exam lobby (optional)
4. Click **Create Assessment** — this saves a Draft.

#### Adding Questions to an EXAM

1. Open the assessment → click **Questions** tab.
2. Click **+ Add Question**.
3. For each question:
   - Enter the **equation** (e.g., "234 + 567 − 89")
   - Enter exactly **4 answer options** (A, B, C, D)
   - Select the **correct answer** using the radio button
4. Click **Save Question**.
5. Repeat for all questions.

Questions are displayed to students in the order you enter them. Re-order using the drag handle.

---

### Creating a TEST (Flash Anzan)

1. Go to **Assessments** → **+ New Assessment**.
2. Select **TEST**.
3. Fill in:
   - **Title** (required)
   - **Level** (required)
   - **Duration** — total time for the entire test in minutes
4. Configure the **Flash Anzan parameters**:

| Parameter | What it controls | Range |
|-----------|-----------------|-------|
| **Flash Speed (ms)** | Milliseconds each number is displayed | 200–3000ms |
| **Number of digits** | How many digits in each flashed number (e.g., 2 = tens, 3 = hundreds) | 1–4 |
| **Count** | How many numbers flash in sequence | 3–10 |
| **Negative probability** | Likelihood of negative numbers appearing (0 = never, 1 = always) | 0.0–1.0 |

5. Click **Create Assessment**.

#### Adding Questions to a TEST

Each question in a TEST consists of one Flash Anzan sequence + the MCQ that follows it.

1. Open the assessment → **Questions** tab.
2. Click **+ Add Question**.
3. The Flash Anzan sequence is **algorithmically generated** from your parameters — you do not manually enter the numbers.
4. Enter exactly **4 answer options** (A, B, C, D) — one must match the correct sum.
5. Select the **correct answer**.
6. Click **Save Question**.

> **Tip:** Use the **Preview** button to see how the flash sequence will appear to students before publishing.

---

### Assessment Reusability

Assessments are **reusable**. Once created and assigned to a level, every future cohort of students promoted into that level automatically has access to that assessment. You do not need to recreate assessments each term.

---

## 5. Going Live

Every assessment follows a strict lifecycle. Each step is required — you cannot skip stages.

```
DRAFT → PUBLISHED → LIVE → CLOSED
```

### DRAFT

The assessment exists but is invisible to students. Use this stage to add questions and review settings.

- **What students see:** Nothing — the assessment does not appear in their list.
- **What you can do:** Edit everything — title, duration, questions, Flash Anzan parameters.

---

### PUBLISHED

The assessment is visible to students but cannot be started yet.

1. Open the assessment.
2. Click **Publish**.
3. Confirm in the modal.

- **What students see:** The assessment appears in their list as "Upcoming." They can see the title and duration but cannot start.
- **What you can do:** Edit title and instructions only. You **cannot** change questions or parameters once published (this protects academic integrity).

To revert to Draft: click **Unpublish**. This removes it from student view.

---

### LIVE

The assessment is open — students can click to enter the lobby and begin.

1. Open the assessment.
2. Click **Go Live**.
3. Confirm in the modal — this is the point of no return for starting.

- **What students see:** A "Live Now" badge on the assessment card. Clicking takes them to the lobby.
- **What you can do:** Monitor via **Live Monitor** (see §6). You can Force Close if needed (see §7).
- **What you cannot do:** Edit anything. Add or remove questions.

---

### CLOSED

The exam has ended. Students can no longer submit answers.

The assessment closes automatically when:
- The exam duration expires for all students, **or**
- You manually Force Close (see §7)

- **What students see:** "Exam Closed." Any locally-saved drafts are uploaded one final time on reconnect.
- **What you do now:** Go to Results to publish grades (see §8).

---

## 6. Live Monitor

Go to **Monitor** in the sidebar (only visible while at least one exam is LIVE) to see real-time status for all students in the active exam.

### Status Meanings

Each student row shows one of four statuses. These are the **exact** meanings — do not interpret them differently:

| Status | Colour | Pulse | Meaning |
|--------|--------|-------|---------|
| **Waiting** | Grey | No | Student is enrolled in this exam but has not yet connected. They may not have clicked Start yet, or are on a slow connection loading the lobby. |
| **In Progress** | Blue | Yes — slow pulse | Student is actively answering. Their device is sending a heartbeat signal every 5 seconds. |
| **Disconnected** | Amber | No | No heartbeat received for more than 25 seconds. The student's device has lost internet. **Their answers are being saved locally** — their work is not lost. When they reconnect, answers upload automatically. |
| **Submitted** | Green | No | The student has completed and submitted the exam. Their final answers are confirmed in the database. This status is **permanent** — it does not change even if the student refreshes their page. |

> **If you see many Disconnected (amber) students at once:** This is usually a local network issue at the exam venue (e.g., school Wi-Fi dropped). Follow P0-A in `docs/incident-response.md`. Student data is safe — IndexedDB is the source of truth until sync completes.

---

### Reading the Monitor Dashboard

**Upper section — aggregate gauges:**
- Connected students vs. total enrolled
- Submitted count (how many finished)
- In Progress count
- Disconnected count

**Lower section — per-student table:**
- Student name · Roll number · Level
- Current status (colour-coded)
- Last heartbeat timestamp
- Tab-switch count (number of times the student left the exam tab)

The table updates **automatically** via WebSocket — you do not need to refresh the page.

---

### Tab-Switch Alerts

If a student leaves the exam browser tab (e.g., switches to another app), the exam records a "tab switch" event. This count is visible in the Monitor table. No automatic action is taken — the decision to flag the student is at the administrator's discretion. Tab-switch data is included in the Activity Log.

---

## 7. Force Close an Exam

Use Force Close when you need to end an exam immediately — for example, due to a power cut affecting all students, a paper error discovered mid-exam, or at the end of the exam window.

### When to Use Force Close

| Scenario | Action |
|----------|--------|
| Exam duration expired but some students are still connected | **Wait** — the system closes automatically on timeout |
| Power/network failure affecting all students | Force Close, then wait for auto-sync on reconnect |
| A question error is discovered mid-exam | Force Close, fix the question, re-evaluate results |
| An individual student should not continue | Lock their account (§3) — do not force close for everyone |

---

### How to Force Close

1. Go to **Monitor**.
2. Click **Force Close Exam** (top-right of the monitor page).
3. Read the confirmation modal carefully — it states the exact consequences.
4. Type `CLOSE` to confirm.
5. Click **Confirm Force Close**.

---

### What Happens Immediately

- All students see an **"Exam Ended"** overlay on their screen within 3 seconds.
- The message reads: *"This exam has ended. Your answers have been saved."* (No error code is shown to students.)
- The exam transitions from LIVE → CLOSED in the database.

---

### What Happens to Student Answers

- Any student who was **Submitted** before Force Close: their answers are unaffected.
- Any student who was **In Progress**: their last saved answer snapshot (from their device or the server, whichever is more recent) is preserved.
- Any student who was **Disconnected** (amber): their locally-saved IndexedDB answers will upload automatically **the next time** they connect to the internet — even after the exam is closed. This is the offline-first guarantee. No answers are lost.

---

### Accidental Force Close — Re-opening Within 10 Minutes

If you Force Closed by mistake, you have a **10-minute window** to re-open:

1. Go to **Assessments** → open the closed assessment.
2. Click **Force Live** (only visible within the 10-minute window).
3. Confirm — the exam returns to LIVE status.
4. Notify students to return to the exam.

> After 10 minutes, the Force Live option disappears. The exam remains CLOSED and can only proceed to Results.

---

## 8. Results Management

### Accessing Results

After an exam is CLOSED, go to **Results** in the sidebar. Select the assessment from the list.

---

### The Results Dashboard

The top of the results page shows:
- **Grade distribution chart** — an area chart showing how many students scored in each grade band
- **Mean score** — class average
- **Pass rate** — percentage who met the minimum passing grade boundary (configured in Settings)
- **DPM** — average Digits Per Minute (Flash Anzan tests only)

Below the chart is the **student results table**:

| Column | Description |
|--------|-------------|
| Student Name | Click to go to full student profile |
| Roll Number | Unique identifier |
| Raw Score | Number of correct answers |
| Percentage | Score as a percentage |
| Grade | Calculated from grade boundaries (Settings → Grade Boundaries) |
| DPM | Digits Per Minute (TEST type only) |
| Status | Published / Pending |

---

### Publishing Results

Students cannot see their results until you publish them.

**Publish individually:**
1. Click the student's row.
2. Click **Publish Result**.

**Bulk publish:**
1. Tick the checkboxes on the left of each row (or tick the header checkbox to select all).
2. A floating action bar appears at the bottom of the screen.
3. Click **Publish Selected**.
4. Confirm.

Students see their result appear on their Results page **immediately** (within 3 seconds) via Realtime — they do not need to refresh.

---

### Unpublishing a Result

If you published by mistake or need to correct a grade:

1. Click the student's row.
2. Click **Unpublish Result**.

The result disappears from the student's view immediately. Re-publish after making corrections.

---

### Re-evaluating Results

If a question had an error (wrong correct answer marked), you can correct it and recalculate all scores:

1. Go to **Assessments** → open the assessment → **Questions** tab.
2. Click the question → change the **Correct Answer** radio button.
3. Click **Save Question**.
4. Return to **Results** → click **Re-evaluate All Scores**.
5. Confirm — the system recalculates scores for every submission in the background.

Re-evaluation **unpublishes all results for this assessment first** — students will see results move to "Pending" while recalculation runs. After re-evaluation completes (usually under 30 seconds), you must re-publish results for students to see updated grades. This prevents students from seeing incorrect grades during recalculation.

> **Why unpublish first?** If a question had the wrong correct answer marked, published students would briefly see a wrong grade update in real time. Unpublishing first ensures students only see correct final grades.

---

### Exporting Results to CSV

1. On the Results dashboard, click **Export CSV**.
2. To export a subset: tick the rows you want first, then click **Export Selected**.

The CSV includes: Student Name, Roll Number, Score, Percentage, Grade, DPM (if TEST), Submitted At timestamp.

---

## 9. Announcements

### Creating an Announcement

1. Go to **Announcements** → **+ New Announcement**.
2. Write your content in the rich-text editor (supports bold, italic, bullet lists, links).
3. Set the **Target**:
   - **All Students** — every student in the institution sees this
   - **Specific Level** — only students currently assigned to that level see it
4. Click **Save as Draft** to hold, or **Publish Now** to send immediately.

---

### Publishing and Scheduling

- **Publish Now** — appears on student dashboards immediately.
- **Draft** — saves but does not send. Return later to publish.

There is no scheduled publishing (publish at a future time) in V1 — you must manually click Publish.

---

### Read Receipts

Once published, the announcement card in your admin view shows:

> *"Read by 34 / 50 students (68%)"*

This updates in real time as students open the announcement. Clicking the percentage opens a list of students who have — and have not — read it.

---

### Editing and Deleting

- **Drafts** can be fully edited (content and target).
- **Published announcements** can be edited — the updated content appears immediately. Read receipts are not reset.
- **Delete** removes the announcement from all student views permanently.

---

## 10. Settings

Go to **Settings** in the sidebar. Changes here affect the entire institution.

### Institution Profile

| Setting | What it does |
|---------|-------------|
| **Institution Name** | Displayed in the student panel header and digital ID cards |
| **Timezone** | Controls all timestamps displayed across the platform (exams, logs, announcements). All data is stored in UTC; the timezone setting applies display conversion only |
| **Session Timeout** | Minutes of inactivity before an admin or teacher is logged out automatically |

> **Timezone is critical.** Set this correctly before creating any assessments. Timestamps in Reports and Activity Log reflect this timezone.

---

### Grade Boundaries

Grade boundaries determine how raw scores convert to letter grades (A+, A, B, etc.).

1. Go to **Settings** → **Grade Boundaries**.
2. Each row represents one grade:
   - **Grade label** — e.g., A+
   - **Minimum score %** — e.g., 95
   - **Maximum score %** — e.g., 100
3. Adjusting the minimum of one grade **automatically adjusts** the maximum of the grade below it — preventing overlap gaps.
4. Click **Save Grade Boundaries**.

> Changes to grade boundaries apply to **future results only**. To apply new boundaries to an existing exam, use **Re-evaluate All Scores** in Results.

---

### Exam Parameters

| Setting | What it does |
|---------|-------------|
| **Default Exam Duration** | Pre-fills the Duration field when creating new EXAMs |
| **MCQ Cooldown Period** | Milliseconds a student must wait between answering questions (default: 1,200ms) — prevents rapid guessing |
| **Lobby Countdown** | Seconds shown in the pre-exam lobby countdown (default: 5s) |

---

## 11. Troubleshooting

### Common Issues

#### Students can't log in

| Symptom | Likely cause | Action |
|---------|-------------|--------|
| "Invalid credentials" error | Wrong roll number or DOB | Verify roll number format in Students directory |
| "Account locked" message | 5 failed login attempts | Go to Student profile → Settings → Unlock Account |
| "Please reset your password" | First login after import | Student must complete reset — it cannot be bypassed |
| Students from CSV import can't log in | DOB format was wrong in CSV | Check DOB was `YYYY-MM-DD` format; reprovisioning may be needed |

---

#### CSV import failed

All rows must pass validation. Common failures:

| Error message | Fix |
|--------------|-----|
| "Roll number already exists" | That roll number is already in the database — change it |
| "Level name not found" | Check spelling — it must exactly match your Level names (case-sensitive) |
| "DOB format invalid" | Use `YYYY-MM-DD` (e.g., `2012-04-15`, not `15/04/2012`) |
| "Full name required" | That row is missing the name — fill it in |

Fix all errors in your CSV, then re-upload from scratch.

---

#### Exam shows LIVE but students see "Not Available"

The exam is LIVE but the student's level does not match the assessment's assigned level. Verify:
1. The student's current level (Student profile → Academic tab)
2. The assessment's assigned level (Assessments → open the assessment → details panel)
3. They must match exactly.

---

#### Monitor shows many Disconnected (amber) students

This is a network event, not a data loss event. Student answers are saving locally to their devices.

**Do not Force Close.** Wait for the network to recover. When students reconnect, their answers upload automatically. Monitor the Submitted count — it will increase as students reconnect and submit.

If the network does not recover within 10 minutes, see **P0-A** in `docs/incident-response.md`.

---

#### Results don't appear after exam closes

Results are available immediately after the exam closes but are in **Pending** (unpublished) status. Students cannot see them until you publish. Go to Results → follow §8.

---

#### A student submitted twice (duplicate)

The system deduplicates submissions automatically using a unique submission key. Only the **first** submission is recorded — the second is silently accepted (no error) but discarded. You will only see one row per student in Results.

---

#### Grade calculation looks wrong

1. Check your Grade Boundaries in Settings — confirm the percentages are correct and cover 0–100% with no gaps.
2. If boundaries were recently changed, use **Re-evaluate All Scores** in the affected exam's Results page.
3. If the issue persists after re-evaluation, check the Activity Log (action type: `GRADE_RECALCULATION`) for any errors.

---

### Escalation Contacts

If none of the above resolves your issue:

| Severity | Contact | How |
|----------|---------|-----|
| **Data concern** (answers missing, wrong results) | Platform Technical Lead | Slack `#incidents` channel or direct message |
| **Authentication failure** (cannot log in at all) | DevOps On-Call | Slack `#incidents` |
| **Active exam emergency** (P0) | On-Call SRE | Follow `docs/incident-response.md` P0 procedure |
| **General admin help** | Internal support | Your institution's support email (configured during platform onboarding — check with your Technical Contact if you do not know this address) |

> For P0 incidents (active exam failure, data risk), do **not** wait for email responses. Use the Slack `#incidents` channel for immediate response.

---

### Before Contacting Support — Gather This Information

Support engineers will ask for:

1. The **assessment title** and the time it was live
2. The **student roll number(s)** affected
3. A screenshot of the error or Monitor state
4. The approximate **time** the issue occurred (in your institution's local time)

You can find error timestamps in **Activity Log** (Sidebar → Activity Log → filter by Action Type and Date).
