# MINDSPARK — Platform Overview & Exhaustive Feature Specification

> **Document Type:** Layman Explanation & Comprehensive Functional Requirements (PRD)  
> **Target Audience:** Non-technical stakeholders, school administrators, teachers, product managers, and developers.  
> **Platform Name:** MINDSPARK Mental Arithmetic Assessment Platform  

---

## 1. Executive Summary (The Layman Guide)

### 1.1 What is MINDSPARK?
**MINDSPARK** is a modern, high-precision digital assessment platform designed specifically for **mental arithmetic and abacus education**. Built for students aged **6 to 18**, it bridges traditional cognitive math training with cutting-edge digital evaluation. 

Traditional mental math competitions and school exams rely on paper worksheets or stopwatches, which are prone to human timing errors, slow grading, and logistical delays. MINDSPARK turns the entire process into a seamless, distraction-free digital experience that runs on laptops, tablets, and desktop computers in schools, academies, and competition halls.

---

### 1.2 Who is MINDSPARK Built For?
MINDSPARK caters to three core groups of users:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MINDSPARK USER ECOSYSTEM                         │
├─────────────────────────┬─────────────────────────┬─────────────────────────┤
│        STUDENTS         │        TEACHERS         │     ADMINISTRATORS      │
│      (Ages 6 to 18)     │  (Instructors & Tutors) │  (School Principals/HQ) │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Take timed tests      │ • Create assessments    │ • Institutional metrics │
│ • Practice Flash Anzan  │ • Monitor live sessions │ • Student & level setup │
│ • Review instant scores │ • Track class progress  │ • Grade boundary rules  │
│ • View growth history   │ • Release final results │ • Compliance & security │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

### 1.3 The Real-World Problems MINDSPARK Solves
1. **Human Timing Errors in High-Speed Math:** When numbers flash on screen for a fraction of a second (e.g., 300 milliseconds), ordinary software often stutters or lags. MINDSPARK uses a microsecond-accurate visual engine so every flash is exact, fair, and identical for every child.
2. **Unstable School Internet:** School Wi-Fi networks frequently drop mid-exam. Ordinary websites crash and erase children's work, causing panic. MINDSPARK stores the entire exam securely on the student's device before the timer starts. If the internet cuts out completely, the student finishes the exam uninterrupted, and the answers automatically sync the moment Wi-Fi reconnects.
3. **Cheating & Unfair Assistance:** In high-stakes mental math evaluations, students must not switch browser tabs, look up answers, or tamper with system clocks. MINDSPARK includes automatic anti-tampering guards and session tear-down triggers.
4. **Minor Data Privacy Compliance (DPDP Act):** Because students are children under 18, their personal data cannot be collected without verified parental or legal guardian consent. MINDSPARK embeds a legally compliant guardian verification flow.

---

### 1.4 The Two Core Exam Modes Explained

To understand mental arithmetic, think of the brain as a muscle that calculates in two distinct ways:

#### 1. Vertical Abacus Exam Mode ("The Step-by-Step Column Drill")
* **The Analogy:** Imagine a digital worksheet with neatly stacked numbers, just like classical school addition and subtraction on a chalkboard.
* **How It Works:** The student sees a vertical column of arithmetic operands formatted in clear, high-contrast monospace typography. They mentally compute the total and select their answer from a large 4-option multiple-choice grid (A, B, C, or D).
* **Navigation:** Students can move back and forth between questions using a clear question grid, review flagged questions, and change answers before final submission.

#### 2. Flash Anzan Test Mode ("The Lightning Mental Cinema")
* **The Analogy:** Imagine watching a film reel where numbers appear and disappear in the blink of an eye. The child visualizes an imaginary abacus in their mind, moving virtual beads at lightning speed with each number flash.
* **How It Works:** 
  1. **Phase 1 (Preparation / Get Ready):** A calming countdown (3-2-1) with breathing focus indicators prepares the learner.
  2. **Phase 2 (The Flash):** Numbers flash rapidly in the center of the screen at speeds ranging from 200 milliseconds to 3 seconds per number on the standard light background. Positive numbers remain dark forest green (`#1A3829`) and negative numbers remain red (`#991B1B`). All sidebars and navigation disappear.
  3. **Phase 3 (Answer Selection):** As soon as the final number vanishes, the multiple-choice options appear with an active timer bar, allowing the student to lock in their mental sum.
  4. **Phase 4 (Submission Confirmation):** Instant visual confirmation confirming answers have been saved.
* **Integrity:** Once a flash sequence starts, the student cannot pause, rewind, or skip ahead, guaranteeing standard competitive conditions.

---

### 1.5 How the Offline "Airplane Mode" Resilience Works
Think of MINDSPARK like a digital exam booklet that is delivered to the student's desk before the exam begins:
1. **Pre-loading:** When the student enters the exam lobby, the system downloads and encrypts the questions directly onto the device's local memory.
2. **Offline Execution:** If someone unplugs the school router, the student sees a friendly yellow indicator ("Working Offline — Answers Saved Locally"). The student continues answering questions without any lag.
3. **Automatic Reconnection:** As soon as the Wi-Fi returns, the system cryptographically signs the locally saved answers, verifies that the device clock was not modified, and securely syncs the score to the central school server.

---

## 2. Exhaustive Feature Specification

Below is the atomic, functional requirement specification covering every screen, workflow, dialog, and edge state across the MINDSPARK ecosystem.

---

### 2.1 Authentication, Roles & Guardian Consent

#### Student & Admin Authentication
* The system should allow users to sign in using their registered email address or a unique student roll number (e.g., `STUDENT-001`).
* The system should automatically detect user roles upon authentication and route administrators and teachers to `/admin/dashboard` and students to `/student/dashboard`.
* The system should enforce secure server-side session validation and immediately reject tampered or expired tokens.
* The system should automatically terminate inactive user sessions after a configurable duration specified by the institution administrator.
* Users should be able to log out from any screen via a dedicated sidebar logout action, immediately clearing all active credentials from the browser.

#### Guardian Consent Flow (Legal & Privacy Compliance)
* The system should enforce verified legal guardian consent for all minor students before permitting access to live assessments.
* The system should allow guardians to submit their contact email to receive a secure, tamper-proof verification link.
* The system should verify the cryptographic token when the guardian clicks the email link and instantly mark the student's profile as `consent_verified = true`.
* The system should prevent students without verified guardian consent from launching live exams and redirect them to a friendly consent explanation screen.

---

### 2.2 Student Portal, Dashboard & Assessment Lobby

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STUDENT PORTAL WORKFLOW                            │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ 1. DASHBOARD      │ 2. LOBBY & WARMUP │ 3. EXAM RUNNER    │ 4. RESULTS      │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ • Live Exam Card  │ • Exam rules & ID │ • Vertical Exam   │ • Score & Grade │
│ • Empty state     │ • Real-time timer │ • Flash Anzan     │ • Accuracy Rate │
│ • Type-spec views │ • Readiness check │ • Offline caching │ • Speed (DPM)   │
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

#### Student Dashboard & Empty States
* Students should be able to view a prominent "Live Assessment" hero banner if an exam is currently active for their assigned learning level, complete with an identity strip, pulsing LIVE badge, countdown timer, and a large "Enter Examination Hall →" CTA.
* The system should display a reassuring **Dashboard Empty State** when no live assessment is running (representing ~95% of standard student loads), featuring a shield icon, a calming message ("No live assessment right now"), and a secondary "View My Results" link.
* Students should be able to view their assigned level, student roll number, and recent assessment scores directly on their home screen.

#### Exams & Tests List Views (Populated & Type-Specific Empty States)
* Students should be able to navigate between dedicated **Exams** and **Tests** navigation sections.
* The system should render populated lists structured into three distinct sections: **Live Now** (red indicator), **Upcoming** (slate indicator with scheduled date), and **Completed** (muted history rows).
* The system should display **Type-Specific Empty States** when no assessments are available:
  - **Exams Empty State:** Features a blue book-open icon with educational copy explaining the Vertical Abacus format and displaying an offline warning banner demo.
  - **Tests Empty State:** Features a purple lightning zap icon with copy explaining the high-speed Flash Anzan calculation format.

#### Pre-Live Exam Info & Assessment Lobby
* Students clicking on an upcoming scheduled exam row should land on a read-only **Exam Info Detail Screen** displaying total duration, question count, target level, and a blue notice stating *"Not yet available — exam will open when the teacher starts it"*.
* Students should be able to enter an **Assessment Lobby** prior to test commencement where sidebars and navigation are completely hidden to eliminate distractions.
* The Lobby should display an animated breathing circle, a 76px DM Mono synchronized countdown timer, network latency indicator ("Optimal Network"), and a mandatory consent checkbox.
* The system should automatically transition all students in the lobby into the active exam room the exact millisecond the administrator opens the assessment.

#### Student Profile & Null Field Fallback
* Students should be able to view their profile card displaying identity hero details (avatar, name, roll number, and learning level).
* The system should display a collapsible **"More Info"** section with a 180° animated chevron toggle containing personal details (DOB, gender), guardian contact emails, and DPDP consent verification status.
* The system should render explicit **`"Not mentioned"` fallback badges** for optional database fields when an administrator creates a student account using only mandatory identity fields.

---

### 2.3 Assessment Player & Dual Exam Engines

#### Common Exam Player Capabilities
* The system should present questions in high-contrast typography designed for legibility and visual ergonomics.
* The system should render large, tactile multiple-choice options (A, B, C, D) with a minimum physical touch target of 64×64 pixels to support young children on touchscreens.
* The system should enforce a 1,200 millisecond anti-double-click cooldown between answers to prevent accidental rapid taps.
* The system should display a persistent countdown timer showing remaining exam time, turning amber with 5 minutes remaining and red with 1 minute remaining.
* The system should automatically submit all answered questions and close the exam when the timer reaches zero.
* Students should be able to open a submission confirmation dialog showing total answered vs. unanswered questions before finalizing their exam.

#### Vertical Abacus Exam Engine
* The system should display vertical arithmetic problems with aligned numbers and arithmetic operator signs.
* The system should render negative numbers in a distinctive, unambiguous dark red shade (`#991B1B`) to prevent sign confusion.
* The system should support tight-gap layout rendering (e.g., operator and number sitting ~18px apart) scaling dynamically between 4-operand drills and 10-operand high-density sequences.
* Students should be able to navigate freely across all questions using an interactive Question Navigator sidebar indicating answered, unanswered, and active questions.
* Students should be able to change their selected answer on any question at any time before clicking final submit.

#### Flash Anzan Engine (4-Phase Interactive Flow)
* The system should execute sequential number flashes with microsecond-level visual stability, strictly avoiding frame drops.
* The system should enforce a four-phase interactive sequence for Flash Anzan tests:
  1. **Screen 1 — Get Ready (Phase 1):** A 3-second animated countdown with breathing focus indicator dots instructing the student to look at the center of the screen.
  2. **Screen 2 — Flash Sequence (Phase 2):** Full-screen distraction-free sequence on the standard light background with 96px tabular numbers flashing at configurable intervals (200ms to 3000ms). Positive numbers remain dark forest green (`#1A3829`) and negative numbers remain red (`#991B1B`). Hides all sidebars, navigation, and exit controls.
  3. **Screen 3 — MCQ Answer Selection (Phase 3):** Multiple-choice answer grid (options A, B, C, D) presented immediately after the flash sequence completes, featuring an active question timer bar and question progress indicator (e.g., "Question 1 of 3").
  4. **Screen 4 — Completion & Submission (Phase 4):** Post-exam confirmation card displaying a green checkmark badge, "3 of 3 Answered" status pill, and a return CTA.
* The system should enforce zero CSS transitions on flashing numbers to guarantee crisp digit presentation without motion blur.
* The system should prevent students from pausing, skipping, or rewinding an active Flash Anzan sequence once initiated.

---

### 2.4 Offline Resilience & Anti-Cheat Subsystem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OFFLINE RESILIENCE & INTEGRITY PIPELINE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Pre-Cache Paper → 2. Local Storage (Dexie) → 3. HMAC Clock Validation   │
│  4. Reconnection Detection → 5. Cryptographic Sync → 6. Cloud Submission    │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Offline Resilience
* The system should pre-load and store the complete question bank into browser storage (IndexedDB) before the exam starts.
* The system should detect loss of internet connectivity immediately and display a non-obtrusive offline status indicator.
* Students should be able to continue answering questions normally during complete internet outages.
* The system should buffer and encrypt all student answers locally on the device during network disconnects.
* The system should automatically detect network restoration and sync buffered answers to the server in the background without user intervention.

#### Anti-Cheat & Academic Integrity
* The system should monitor browser window focus and document visibility during active assessments.
* The system should record an activity log event whenever a student switches tabs, minimizes the browser, or opens developer tools.
* The system should generate a cryptographic HMAC timestamp seal for every exam session to detect if a student modified their computer clock to gain extra time.
* Administrators should be able to view anti-cheat flags and clock-tampering alerts on the student's submission record without penalizing innocent network lag.

---

### 2.5 Student Results Flow & Answer Key Gating Subsystem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ANSWER KEY RELEASE GATING WORKFLOW                    │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│ 1. PENDING GRADING       │ 2. ANSWER SHEET LOCKED   │ 3. RELEASED & UNLOCKED│
├──────────────────────────┼──────────────────────────┼───────────────────────┤
│ • Amber clock banner     │ • Direct URL locked card │ • Full answer sheet   │
│ • Awaiting admin release │ • Non-interactive CTA    │ • Correct/wrong pills │
│ • Score hidden           │ • Unreleased gate alert  │ • Single-line TEST rec│
└──────────────────────────┴──────────────────────────┴───────────────────────┘
```

#### Student Results Ledger & Detail View
* Students should be able to view a unified **Academic Ledger** on `/student/results` combining both published scores and pending submissions with single-select filter chips.
* The system should handle **Results Empty States**:
  - *No Submissions Ever:* Centered welcome card directing student to the Exams catalog.
  - *Filter No-Results:* Compact "Clear filter" reset while keeping hero summary cards visible.
* The system should display a **Pending Grading State** (amber accent rail with Clock icon) when an exam is submitted but results have not yet been approved or published by an administrator.

#### Answer Sheet Gating & Reconstruction
* The system should enforce strict **Answer Key Gating**:
  - If results are published but the administrator has not unlocked the answer key, the scorecard CTA should render in a locked, non-interactive state.
  - If a student directly navigates to the answer sheet URL before release, the system should render a **Centered Lock Screen** explaining that the answer key is restricted.
* When unlocked, the system should render detailed answer sheets:
  - **EXAM Answer Sheet:** Vertical scroll of equation cards with 4 tile states (correct-and-picked in green with Checkmark, correct-only in green, wrong-pick in crimson with X, and neutral).
  - **TEST Answer Sheet:** Reconstructs the flashed sequence as a single centered mathematical line with dark crimson negative numbers and an explanatory caption.

#### Admin Answer Key Release Controls
* Administrators should be able to view an **Answer Key Release Card** on the assessment detail page displaying:
  - Current status (Grey rail for unreleased vs Green rail with CheckCircle for released).
  - Release timestamp and administrative actor ID from audit logs.
  - Active student unlock counter explaining the gate logic interaction.
* Administrators should be able to trigger **Two-Way Confirmation Dialogs**:
  - **Release Confirmation Modal:** Primary warning explaining that only students with published submissions will see the answer sheet.
  - **Un-Release Confirmation Modal:** Amber destructive confirmation noting that revoking access cannot un-see what students have already inspected.

---

### 2.6 Administrator Dashboard & Live Exam Monitor

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ADMIN LIVE MONITORING CONSOLE                        │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ STUDENT NAME      │ ROLL NUMBER       │ PROGRESS (BAR)    │ STATUS / ACTION │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ Jane Doe          │ STU-101           │ [████████░░] 80%  │ Active          │
│ John Smith        │ STU-102           │ [██████████] 100% │ Submitted       │
│ Alex Brown        │ STU-103           │ [████░░░░░░] 40%  │ Offline (Sync)  │
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

#### Administrative Dashboard & Results Hub
* Administrators should be able to view real-time KPI metric cards (Total Students, Live Assessments Running, Active Sessions, and Average Score).
* The administrative navigation should feature visual polish including a hover-reveal forest green accent bar, vertical stat dividers, active left-accent bars, and a bottom sidebar user card with logout.
* Administrators should be able to inspect a **Per-Student Answer Sheet Drill-Down Table** displaying the student's profile summary, mini KPIs (Correct, Wrong, Accuracy), and a question table showing all 4 MCQ choices, student selection, correct answer pill, and light red highlight on errors.

#### Live Exam Monitor & Destructive Controls
* Administrators should be able to view a **Monitor Hub** card grid of currently LIVE exams with urgent red countdown strips, type badges, and real-time student counts.
* Administrators clicking into an exam should access the **Live Monitor Detail Console** featuring a large countdown timer, 4 mini KPI cards (In Progress, Submitted, Disconnected, Waiting), and a realtime student table with search and progress bars.
* Administrators should be able to trigger a high-security **Type-to-Confirm Force Close Dialog**:
  - Features a red-topped destructive warning header with impact counts.
  - The "Force Close Exam" button remains strictly disabled until the administrator types `"CLOSE"` in all capital letters into the verification input.
* When an exam closes, the system should transition to an **Exam Closed Summary State** displaying a gray CLOSED badge, "Ended at" timestamp, a frozen student table, a 4-stat Session Summary card, and an Export CSV CTA.

---

### 2.7 Admin Assessment Creator Wizard (5-Step Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREATE ASSESSMENT WIZARD (5 STEPS)                   │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│ 1. TYPE      │ 2. SETTINGS  │ 3. BUILDER   │ 4. REVIEW    │ 5. SUCCESS      │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────────┤
│ • EXAM card  │ • 12 fields  │ • MCQ Editor │ • Bento grid │ • Published     │
│ • TEST card  │ • Defaults   │ • Flash card │ • Jump edits │ • Draft Saved   │
│              │              │ • Modal prev │              │                 │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘
```

* Administrators and teachers should be able to create assessments through a comprehensive 5-step wizard with full-page chrome (sidebar hidden):
  1. **Step 1 — Type Selection:** Side-by-side selectable cards for EXAM (Vertical Abacus) vs TEST (Flash Anzan) with green check badges upon selection.
  2. **Step 2 — Settings (Full Configurator):** 4 form sections containing all 12 configuration fields (duration, level, pass mark, negative scoring) plus a "Save as Default" toggle.
  3. **Step 3a — MCQ Builder (EXAM variant):** Split-pane editor (40% question list on left, 60% equation editor on right) with automated question generation.
  4. **Step 3b — MCQ Builder (TEST variant with Flash Config):** Same split pane plus a dedicated purple **Flash Config Card** allowing teachers to adjust flash speeds and row lengths.
  5. **Flash Preview Modal (On-Demand):** Interactive modal over a dimmed backdrop allowing teachers to test-run a sample flash at the configured speed with playback controls and a progress bar before finalizing.
  6. **Step 4 — Review (Bento Grid):** Bento grid of summary cards where every section includes an independent *"Edit"* button that jumps directly back to that specific step.
  7. **Step 5 — Success States:**
     - *Published Variant:* Large green check icon, summary chips, and 4 action buttons including a red *"Start Session Now"* CTA.
     - *Draft Variant:* Blue file icon, summary chips, and 3 draft action buttons (excluding the live session start button).

---

### 2.8 Student Roster & Level Detail Management

#### Student Roster Management
* Administrators should be able to view a searchable, paginated table of students with Roll Number, Name, Level, and Action controls.
* The system should support **Student List Empty States** (Empty State 1: first-time welcome card; Empty State 2: filtered no-results reset).
* Administrators should be able to open a **Student Detail Page** with an inline **Edit Mode**:
  - Clicking "Edit Profile" reveals a top banner making Personal Info and Academic Info fields editable.
  - Keeps immutable areas (Recent Sessions and Danger Zone) read-only to prevent accidental data corruption.
* Administrators should be able to open a **Slide-Over Student List Drawer** from the right side of the screen featuring total attendance stats, search, and a quick-view list of students who completed the assessment.
* Administrators should be able to open modal dialogs for **Create Student** (4 fields: Name, Roll No, Level, DOB) and **Import CSV** (drag-and-drop upload zone with template download callout).

#### Level Detail & Curriculum Management
* Administrators should be able to manage sortable levels with drag handles, sequence badges, student counts, and overflow menus.
* Administrators should be able to open a **Single-Field Create Level Dialog** that auto-appends the new level to the end of the sortable sequence.
* Administrators opening `/admin/levels/[id]` should access a **Tabbed Level Detail View**:
  - **Students Tab:** Dedicated "+ Add Student to Level" CTA, search bar, and 3-column student table.
  - **Assessments Tab:** Dedicated "+ Create Assessment for Level" CTA, search bar, and 3-column card grid pre-filtered specifically to that level.

---

### 2.9 Institutional Settings & Sticky Save State

#### Institutional Settings & Grade Boundaries
* Administrators should be able to manage institution settings in a clean, centered single-column layout containing three stacked sections:
  - **Institution Info:** Logo uploader, school name, address, contact details.
  - **Grade Boundaries:** Segmented EXAM/TEST toggle with editable score threshold rows (`A+`, `A`, `B`, `C`, `F`).
  - **Session Settings:** Timeout and active session limits.
* The system should feature a **Floating Sticky Bottom Save Bar** that automatically appears in an amber "Unsaved Changes" state whenever form inputs are modified.

#### Security & Activity Audit Log
* The system should maintain an immutable, chronological activity audit log of every major administrative and student action.
* Administrators should be able to filter audit logs by action type, user, and date range.
* The system should record IP addresses, user agents, and timestamps for all sensitive security events (e.g., grade boundary changes, manual score adjustments, force-close actions).

---

## 3. Core System Guarantees & Summary Matrix

| Domain | User Capability | System Guarantee |
|---|---|---|
| **Timing Accuracy** | Visual Flash Anzan drills | Exact millisecond frame pacing with < 5ms drift across 10s runs. |
| **Offline Resilience** | Continuous exam taking during Wi-Fi drops | Zero data loss; automatic local buffering and cryptographic sync upon reconnect. |
| **Anti-Cheat** | Fair competition ranking | Clock tampering detection, tab blur logging, and type-to-confirm force closure. |
| **Answer Key Gating** | Controlled post-exam review | Locked direct URLs, two-way release modals, and audit-stamped release cards. |
| **Legal Compliance** | Minor student account safety | DPDP Act guardian consent verification and 180-day automated data retention policy. |
| **Operational Control** | Emergency supervisor overrides | Instant exam go-live, live student drawer, and on-demand flash preview modal. |

---

*Document path: `docs/PROJECT_EXPLAINED.md`*  
*MINDSPARK Mental Arithmetic Assessment Platform — All rights reserved.*
