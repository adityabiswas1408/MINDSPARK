# About MINDSPARK

A plain-English guide to what this platform does, who uses it, and
what every button on every screen is for. Written for school owners,
teachers, parents, and anyone who wants to understand the product
without reading code.

---

## 1. What is MINDSPARK in one paragraph?

MINDSPARK is a website and tablet app for abacus and mental-arithmetic
schools. Children between ages 6 and 18 log in and take practice tests
and formal exams on their own device. Teachers and school owners log in
on a separate screen and use it to manage their students, create exam
papers, run live exam sessions, grade answers, and publish results.
The whole thing replaces the paper-and-pen routine of traditional
abacus classrooms with a digital version that works the same way a
real classroom does — but with automatic timing, automatic marking,
automatic record-keeping, and a live view of every student taking an
exam at that moment.

---

## 2. Who uses MINDSPARK?

There are four kinds of users. Each one sees a different screen.

**School Administrator** — the owner or director of an abacus learning
centre. They have full access: they create levels, add students, make
exam papers, monitor live exams, publish results, send announcements
to the whole school, and change settings like timezone or grade
boundaries. Most of this document is about what the administrator
can do.

**Teacher** — a staff member who teaches one group of students. They
see most of what the administrator sees, but only for their own
students. A teacher cannot add a new student to a different class or
change school-wide settings.

**Student** — a child who is learning abacus. They log in with a roll
number and password (or date of birth), see a simple home page, and
take exams when their teacher makes them available. Students cannot
see other students' scores or any administrative screens.

**Guardian** — a parent or legal guardian. They do not log in. They
only click a single link in an email, once, to confirm that their
child has permission to use the platform. After that, guardians are
not involved unless they want to be.

---

## 3. A typical day — how an exam cycle works

This is the journey of a single exam from start to finish. Every
feature in this document is built to support one of these steps.

1. **The school owner creates a new exam paper.** They open the
   admin screen, click "Create Assessment," and walk through a
   three-step wizard: pick the exam type, add the questions, fill
   in the title and how long it runs.

2. **The exam paper is saved as a draft.** Nothing has happened yet.
   The draft is invisible to students. The owner can edit it as
   many times as they want.
 
3. **The owner publishes the paper.** Publishing means "this is
   ready." Students can now see on their home screen that a new
   exam is coming. They cannot start it yet.

4. **The owner starts the exam — "Go Live."** At the moment they
   click this button, every student at the correct level sees a
   big green card on their home screen that says "Live Now" with
   a flashing indicator. They can enter the waiting room.

5. **The student enters the waiting room.** This is a calm screen
   with a breathing circle, a countdown timer, and a "Network
   Status: Optimal" indicator. The student reads the instructions,
   takes a breath, and clicks "I'm Ready" when the countdown hits
   zero.

6. **The exam begins.** Depending on the exam type, the student
   either sees numbers flash rapidly in the centre of the screen
   (Flash Anzan format) or sees a vertical stack of numbers to add
   up (traditional exam format). They pick their answer from four
   choices and confirm it.

7. **The student moves through all the questions.** There is a
   timer on screen. There is a small indicator showing which
   questions are answered and which remain. When they reach the
   last question, they see a "Submit Exam" button.

8. **The student submits.** Their answers are sent to the school's
   server. They see a confirmation screen: "Assessment Submitted —
   your answers have been saved." They can now go back to the
   home page or wait for results.

9. **The owner watches the exam live.** While the exam is running,
   the owner's Live Monitor screen shows a list of every student:
   who is still working, who has submitted, who is disconnected.
   Each student's progress is shown as a bar (for example, "7 of
   10 answered"). The owner can force-close the exam if they
   need to.

10. **The owner grades and publishes results.** After all students
    have submitted, the owner opens the Results screen, picks the
    exam, sees every student's score and grade, and clicks
    "Publish Selected" to share the results with students. Before
    publishing, only the owner sees the scores.

11. **The student sees their result.** Once published, the student's
    Results screen shows their score, their grade (A, B, C etc.),
    and a breakdown of which questions they got right or wrong.

That is a complete cycle. Everything in the rest of this document
is a feature that supports one of these eleven steps.

---

## 4. What the school administrator can do

Every item below is a screen the administrator opens from the left-
side menu.

### 4.1 Dashboard

The first screen after logging in. It is a summary page with four
big number tiles at the top:

- **Total Students** — how many children are enrolled.
- **Active Exams** — how many exam papers are currently live.
- **Average Score** — how well students are doing on average across
  all completed exams.
- **Live Now** — how many students are taking an exam at this very
  moment.

Below the tiles there are two charts. The left chart shows the
average score for the last six months. The right chart shows how
students are spread across the different levels of the curriculum.

Below the charts is a "Recent Activity" feed. It lists the last ten
things that happened in the school: someone created a new student,
someone published a result, someone started a new exam.

In the top-right corner of the dashboard header there is a small
"Live Pulse" widget that pulses red when there is at least one
active exam. The owner can click it to jump straight to the Live
Monitor.

### 4.2 Students

This is where the administrator manages the list of children
enrolled in the school.

**Viewing the list.** The main screen shows every student as a row
in a table. Each row has a coloured initial avatar (like "RS" for
Riya Sharma), the full name, the roll number, the level, the
status (Active or Inactive), and the date they joined. The
administrator can sort, search, and filter by level or status.

**Adding a student one at a time.** The "Add Student" button opens
a small form. Type in the name, roll number, date of birth, and
pick a level. Click save. The student is created and can log in
immediately.

**Adding many students at once.** The "Import CSV" button accepts a
spreadsheet file with one student per row. Up to 500 students can
be imported in one go. The system checks for duplicates, validates
each row, and tells the administrator if any rows failed. Imported
students appear in the list right away.

**The student profile page.** Clicking any student's name opens a
detailed page with their photo (or initials), full academic
history, every exam they have ever taken, their current level,
and three action buttons:

- **Promote to Next Level** — moves the student up.
- **Reset Password** — generates a new password for the student
  when they forget it. The owner sees the temporary password once,
  hands it to the student, and the student is forced to change it
  on their next login.
- **Suspend** — removes the student from active use without
  deleting their history. A suspended student cannot log in or
  take exams but their past results stay on file.

**Bulk actions.** The administrator can tick multiple students
and promote them all at once, suspend them all at once, or
export a list of them to a spreadsheet.

### 4.3 Levels

This screen manages the curriculum — the structure of the school.
An abacus school typically has Levels 1 through 8 (or similar),
each covering a stage of difficulty. Students progress from one
level to the next as they learn.

**The list.** Every level is shown as a card with a drag handle on
the left. The administrator can reorder the curriculum by dragging
cards up or down. Each card shows the level name, how many
students are currently enrolled at that level, and a small
status badge showing whether the level is active or archived.

**Creating a new level.** The "Create Level" button opens a small
dialog. Type in the name (like "Level 4 — Intermediate"), and
save. The new level appears at the end of the list.

**Editing a level.** Clicking any card opens an edit sheet that
slides in from the right. The administrator can rename the level,
change its sequence number, write a description, or archive it.
Archived levels stay in the system for historical purposes but are
not offered as a target when creating new assessments.

### 4.4 Assessments

This is where exam papers are created, managed, and set live.

**The list.** Every exam paper is shown as a row with the title,
the type (EXAM or TEST), the status (Draft, Published, Live, or
Closed), the level it is assigned to, the duration in minutes,
and action buttons.

Status colours:
- **Draft** — grey. Only the owner can see it. Still being edited.
- **Published** — blue. Ready for students. Not running yet.
- **Live** — red, pulsing. Students are taking it right now.
- **Closed** — dark grey. Finished. Results can be published.

**Creating an assessment.** The "Create Assessment" button opens a
three-step wizard in a modal dialog.

*Step 1 — Type.* The administrator picks between two exam formats:

- **EXAM** (traditional vertical format): a stack of numbers written
  top to bottom in a column, with plus and minus signs on the
  left. The student adds them up in their head and picks the answer
  from four multiple-choice options. This is the format most similar
  to the paper-based exams used in traditional abacus classes.

- **TEST** (Flash Anzan format): numbers flash one at a time in
  the centre of the screen at a speed the administrator chooses
  (for example, 400 milliseconds per number). The student holds
  the running total in their head using their visualised abacus
  and picks the answer from four multiple-choice options.
  This is the format used in abacus speed-drill training.

*Step 2 — Questions.* The administrator adds questions one at a
time. For EXAM type, they type the equation and the four answer
options. For TEST type, they specify how many numbers will flash
and let the system generate them automatically using a secure
random method. Each question has one correct answer.

*Step 3 — Configuration.* The administrator gives the assessment a
title, picks the level it applies to, sets the duration in minutes
(how long students have to finish), and for Flash Anzan tests also
sets the flash speed, the digit count, and the number of rows.
Click "Publish" or "Save Draft."

**Go Live.** When an exam paper is in Published state, a "Go Live"
button appears. Clicking it sends a signal to every student at the
correct level and their dashboards instantly show the exam is
available.

**Force Close.** While an exam is Live, the administrator can
click "Force Close" to end it early. Any students still working
will be submitted automatically.

**Assessment pipeline.** At the top of each assessment's detail page
is a visual stepper that shows: Draft → Published → Live → Closed.
The current stage is highlighted in green.

### 4.5 Live Monitor

While an exam is running, this is the screen the administrator
watches.

**The summary tiles.** Four coloured tiles at the top show:
- **In Progress** (green) — students still working.
- **Submitted** (blue) — students who have finished. This number
  only goes up, never down.
- **Disconnected** (amber) — students whose network dropped in
  the last 25 seconds.
- **Waiting** (grey) — students who have not started yet.

**The student table.** Below the tiles is a live-updating table
with one row per student. Each row shows the student's name,
their roll number, a coloured status badge (In Progress,
Submitted, Disconnected, or Waiting), a progress bar (for
example, "7 of 10 answered"), and the time of their last activity
(for example, "2s ago").

**Real-time updates.** The administrator does not need to refresh.
When a student answers a question, their row updates automatically.
When a student submits, their row turns green permanently. When a
student's network drops, their row turns amber. When they come
back, it turns green again.

**Search.** Above the table is a search box to filter students by
name or roll number. This is useful in large exams where the
administrator wants to find one specific student.

**Force Close Exam button.** Top right. Ends the exam immediately
for everyone. Any in-progress answers are saved.

**Exam countdown.** Top left, next to the exam title. Shows how
much time remains in the exam. Turns red when under one minute.

### 4.6 Results

This is where exam results are reviewed and shared with students.

**Assessment selector.** Pick which exam paper to view results for
from a dropdown. Only closed exams appear in this list, because
only closed exams have final results.

**Grade distribution chart.** An area chart that shows how many
students got each grade (A, B, C, D, F). This helps the
administrator see at a glance whether the exam was too easy, too
hard, or well-calibrated.

**Statistics strip.** Three numbers are shown above the chart:
- **Mean** — the average score in percent.
- **Median** — the middle score in percent.
- **DPM Average** — the average Digits Per Minute rate across
  the class. This is a speed metric specific to abacus training.

**The student results table.** Every student who took the exam is
listed with their name, their score as a percentage, their letter
grade, and a "Publish" button. Each row can be published
individually, or the administrator can tick several rows and
publish them in bulk using the floating action bar.

**Publish Selected.** Once published, the students see the result
on their own Results screen. Before publishing, only the
administrator sees scores — students just see "Pending."

**Re-evaluate.** Top right corner. Recomputes all grades using the
current grade boundaries from Settings. Useful if the grade
boundaries are changed after an exam.

**Export.** Downloads the results as a spreadsheet file.

### 4.7 Announcements

A place to send written messages to students.

**The compose pane.** On the left side of the screen is a rich-text
editor. The administrator types a title, picks an audience (all
students or a specific level), writes the body using bold, italic,
and bulleted lists, and clicks "Publish Announcement."

**The history pane.** On the right side is a list of the last
five announcements. Each one shows a read-count: how many students
have opened it. The administrator can see, for example, "read by
47 of 50 students."

### 4.8 Settings

A page for configuring how the school operates.

**Institution Profile.** Set the school name, the primary timezone
(for example, Asia/Kolkata), and the session timeout in seconds.
The session timeout is how long a student can be inactive before
being automatically logged out. Range: 15 minutes to 24 hours.

**Grade Boundaries.** Set the minimum percentage for each letter
grade. For example: A+ is 90-100, A is 80-89, B is 65-79, C is
50-64, D is 35-49, F is below 35. The administrator can type the
numbers directly or drag the boundaries. The system warns if two
boundaries overlap or leave gaps.

**Data Retention.** Information about how long student records are
kept. Changing this requires contacting support.

**Current Session Timer.** A small card at the bottom shows how
much time remains in the administrator's own login session. Turns
red when under five minutes.

### 4.9 Activity Log

A searchable, filterable audit trail of every action taken in the
school.

**The filter bar.** Filter by action type (for example, only show
"Publish Result" actions), by user (type an email to filter by
actor), or by date range.

**The table.** Every action is listed with a timestamp in UTC,
the person who took the action, the type of action, and the
target (for example, "Student #042" or "Assessment Q3 Mental
Arithmetic").

**Row expansion.** Clicking any row expands it to show a detailed
metadata panel: the IP address, the browser, any additional
details about the change, and a JSON payload of the exact data
that was changed.

**Export CSV.** Download the filtered results as a spreadsheet.

---

## 5. What the teacher can do

Teachers use the same screens as the administrator but with two
key differences:

1. They only see their own students, their own exams, and their
   own results. The database enforces this — a teacher cannot
   accidentally see another teacher's class.

2. They cannot change school-wide settings (institution profile,
   grade boundaries, activity log). Those screens are admin-only.

Everything else is the same: dashboard, students list, assessments,
live monitor, results, announcements.

---

## 6. What the student sees

Students log in on a separate screen. Their interface is simpler,
calmer, and designed for younger users.

### 6.1 Dashboard

The student home page shows a hero card at the top. If there is a
live exam available, the card is prominent and says "Live Now" with
a big "Enter Exam" button. If there is no live exam, the card
changes to a calm "No live exams right now — check back when your
teacher posts one" message.

Below the hero card is an Upcoming Assessments section, showing a
small row for each future exam with its date, its type, and its
duration.

On the right side of the dashboard is a sidebar card showing the
student's candidate profile — their name, roll number, current
level, and a progress bar showing how far they have progressed
toward the next level.

### 6.2 Exams list

A complete list of every exam the student has access to, grouped
into three sections:

- **Live Now** — exams currently available to take. Clicking one
  takes the student to the lobby.
- **Upcoming** — exams that have been published but are not yet
  running. Shown in date order.
- **Completed** — exams the student has already finished. Clicking
  one shows the result if it has been published, or a "Pending"
  message if the teacher has not published it yet.

### 6.3 Pre-assessment Lobby

This is a calm, focused screen that opens when a student enters a
live exam.

**Exam name and description** at the top.

**Countdown timer** showing how long until the exam closes.

**A breathing circle.** A soft, slowly pulsing circle in the centre
of the screen that expands and contracts over four seconds. This
is designed to help the student regulate their breathing and calm
their nerves before a high-stakes exam. The effect is the same as
the deep-breathing exercise coaches use in real competitions.

**Network Status indicator.** A small dot and label showing whether
the connection is stable, degraded, or offline. The "I'm Ready"
button is disabled if the student is offline.

**"I'm Ready" button.** When the student clicks this button, they
agree to begin the exam and are taken straight into it.

### 6.4 Taking an EXAM (traditional vertical format)

The student sees a vertical stack of numbers, one per line, with
a plus or minus sign on the left of each. For example:

```
+    345
     182
−    194
     167
```

Below the stack is a four-option multiple-choice grid. The student
does the arithmetic in their head, taps the answer, confirms it,
and moves to the next question. There is a timer pill in the top-
right corner of the screen.

On the left side of the exam screen is a "question navigator" — a
vertical list of small buttons, one per question, that lets the
student jump to any question. Answered questions show a green
check; the current question is highlighted in dark green; unanswered
questions are grey.

When the student reaches the last question, a big "Submit Exam"
button appears. Clicking it shows a confirmation dialog: "You have
answered 8 of 10 questions. Are you sure?" Clicking Confirm
submits the exam.

### 6.5 Taking a TEST (Flash Anzan format)

This is the speed-drill format used in abacus training.

**Phase 1 — Start.** The student sees a "Begin Flash" button and
information about the test: the flash speed, the digit count, the
number of rows. They tap Begin when they are ready.

**Phase 2 — Flash.** The screen goes pure white. Numbers flash
one at a time in the centre, large and bold, at the speed the
administrator chose (for example, 450 milliseconds per number).
Negative numbers are shown in a special crimson colour so the
student knows to subtract them. During this phase there is
absolutely no other UI — no sidebar, no timer, no navigation —
because any distraction would break the student's mental
visualisation of the abacus. If the student accidentally switches
browser tabs, the flash pauses immediately and a "Paused" message
appears; when they return to the tab, it resumes automatically.

**Phase 3 — MCQ.** Once the last number has flashed, the student
sees a four-option multiple-choice grid: "What was the total?"
The student picks their answer, confirms it, and moves to the
next question. They can also tap "Skip" to move on without
answering.

The student repeats Phase 1, 2, 3 for each question in the test.

### 6.6 Submission and confirmation

When the student submits, they see a short confirmation screen
with a green checkmark, a "Assessment Submitted" heading, and
two buttons: "View Results" and "Back to Dashboard." If the
confetti animation is enabled (and the student's device is not in
reduced-motion mode), small green particles fall across the
screen for two seconds. A single completion chime plays.

### 6.7 Results

Published results are shown on the student's Results screen. For
each exam the student has completed, they see:

- The exam title.
- The date they took it.
- The score in percent.
- The letter grade.
- A "View Details" button that shows a full breakdown of every
  question they answered — which ones were right, which were
  wrong, and what the correct answer was for each.

Unpublished results show as "Pending" with a soft message like
"Your teacher is reviewing your answers."

### 6.8 Profile

The student's own profile page shows a digital ID card: their
photo (or initials), their name, their level, their roll number,
and their date of birth. Below the ID card is a level progress
bar and an accessibility toggle:

**Ticker Mode.** An accessibility option for students with low
vision or motion sensitivity. When Ticker Mode is on, Flash Anzan
numbers appear as a slow scrolling tape at the bottom of the
screen rather than a full-centre flash, and each number is also
read aloud by the screen reader.

---

## 7. What guardians need to do

A guardian is the parent or legal guardian of a student under the
legal age for digital consent.

When a new student is added to MINDSPARK, the school sends an
email to the guardian with a subject line like "Consent Required
for [Child's Name]." The email contains a single button: "Verify
Consent." The guardian does not need to create an account or
remember a password.

Clicking the button opens a simple web page that says "Consent
Verified — Thank you. [Child's Name] can now access MINDSPARK
assessments." That is the entire guardian flow. They can close
the tab and are done.

If the guardian tries to use an expired or invalid link, they see
a friendly error page that tells them to ask the school for a
new one. No technical error codes are shown.

---

## 8. How the platform keeps exams fair and safe

These are features the user does not see but that matter a lot for
running exams honestly and reliably.

### 8.1 Offline mode

If a student's internet drops in the middle of an exam, their
answers are saved on the device itself and sent to the server as
soon as the connection comes back. A small amber banner at the top
of the exam screen says "You are offline — your answers are saving
locally and will sync when reconnected." The student never loses
an answer because of a bad wifi connection.

### 8.2 Anti-cheat clock guard

Some students used to try to cheat by advancing their device's
clock forward to make the exam timer expire early, giving
themselves more real time. MINDSPARK uses a special cryptographic
seal issued by the server at the start of every exam. When the
student submits, the server compares the exam's elapsed time
measured two independent ways. If they disagree by more than a
small tolerance, the submission is flagged for review. The student
is never accused — their answers are still saved — but the
administrator sees an alert on the Live Monitor.

### 8.3 Tab monitor

If a student opens a new browser tab during an exam and switches
to it (for example, to search for the answer online), MINDSPARK
counts the switch. If it happens during Flash Anzan Phase 2, the
flash pauses immediately and the student sees a "Paused" message.
Repeated tab switches are recorded on the student's session for
the teacher to review afterward.

### 8.4 Teardown handler

If a student closes their browser or their device crashes during
an exam, MINDSPARK sends any unsynced answers to the server as
part of the shutdown. The answers do not get lost.

### 8.5 Live status authority

Once a student has officially submitted an exam, that status is
permanent. The Live Monitor will always show them as "Submitted"
in green, even if their network drops afterward. Submission is
treated as a contract — the student cannot lose their submitted
state due to a flaky network.

### 8.6 Row-level security

The database that stores every student, every exam, and every
answer has a strict rule engine built in. The rules say, for
example, "a student can only read their own answers" and "a
teacher can only see students in their own cohort." Even if
someone tried to trick the system from outside, the database
itself would refuse to return data it should not show.

### 8.7 Session timeout

Every user (administrator, teacher, or student) is automatically
logged out after a period of inactivity. The default is one hour.
The school administrator can change this in Settings.

### 8.8 Guardian consent

Students under the legal consent age cannot take exams until a
guardian has verified consent (see section 7 above).

### 8.9 Accessibility

The entire platform is designed to comply with WCAG 2.2 AAA, the
highest standard for web accessibility. Specifically:

- **Reduced motion.** If the student's device has "reduce motion"
  enabled in accessibility settings, all decorative animations
  (breathing circle, confetti, skeleton shimmer) are suppressed.
  Essential visual feedback is always shown.
- **Screen reader support.** Every interactive element has an
  accessible label. The exam timer announces at the five-minute
  and one-minute marks only — never every second — to avoid
  saturating the audio channel during concentration.
- **Keyboard navigation.** The entire platform can be operated
  without a mouse, using Tab, Shift+Tab, arrow keys, and
  Enter/Space.
- **Ticker Mode.** A special alternative to Flash Anzan for
  students who cannot see rapidly flashing numbers.
- **Touch targets.** Every button meets or exceeds 64 pixels in
  height and width. This is larger than the standard 44-pixel
  guideline and is specifically chosen to accommodate the
  motor variability of younger children (ages 6-8).
- **Colour contrast.** Every text and background combination is
  checked for contrast. Negative numbers in arithmetic displays
  use a specific crimson colour that is equally bright to dark
  text when measured scientifically, so students with colour-
  vision differences can still read them clearly.
- **No hover-only interactions.** Tablet users cannot hover. Every
  feature that works with hover on a desktop also works with tap
  on a tablet.

---

## 9. Glossary

Terms specific to abacus training or to this platform, in plain
language.

**Abacus** — a physical counting frame with beads. Used for
teaching arithmetic for over 2,000 years.

**Soroban** — the Japanese-style abacus, with four beads in the
lower section and one bead in the upper section of each rod. The
soroban is the most common type used in modern mental-arithmetic
training.

**Mental arithmetic** — doing arithmetic in your head by imagining
the beads of an abacus moving. With practice, a skilled student
can add dozens of numbers faster than most people can type them
on a calculator.

**Flash Anzan** — a mental arithmetic drill in which numbers flash
one at a time on a screen and the student adds them in their head.
"Anzan" is the Japanese word for mental calculation.

**EXAM type** — in this platform, an exam paper that uses the
traditional vertical equation format: a column of numbers with
plus and minus operators, summed top to bottom.

**TEST type** — in this platform, an exam paper that uses the
Flash Anzan speed-drill format.

**Level** — a stage of the abacus curriculum. Most abacus schools
use eight to ten levels, progressing from single-digit addition
at the lowest level to multi-digit multiplication and division
with negative numbers at the highest.

**DPM — Digits Per Minute** — a speed metric. It measures how many
numerical digits a student can process per minute. A beginner
might have a DPM of 20; a competition-grade student exceeds 200.

**MCQ — Multiple-Choice Question** — a question where the student
picks from four answer options rather than typing an answer.
MINDSPARK uses MCQ for all questions because it can be graded
instantly and is fair across typing-ability differences.

**Live Monitor** — the real-time screen that shows every student's
status during a running exam.

**Session** — one attempt at one exam paper by one student. A
session starts when the student enters the lobby and ends when
they submit or when the exam is closed.

**Cohort** — a group of students taught together by the same
teacher, typically a single classroom batch.

**Announcement** — a written message from the school or teacher
to students. Used for exam reminders, schedule changes, or
general communication.

**Published** — the state of an exam paper or a result that has
been shared with students. Before publishing, only the
administrator can see it.

**Draft** — an exam paper that has been created but not yet
published. Drafts are invisible to students.

**Live** — an exam that students can enter and take right now.

**Closed** — an exam that is finished. Its results can be
published to students.

**Roll number** — the school's unique identifier for a student,
used as their login username. Like a student ID number.

**Consent verified** — the state of a student whose guardian has
clicked the verification link in their email. Students must be
consent-verified before they can take exams.

**Breathing circle** — the soft pulsing circle shown on the lobby
screen before an exam begins. Used to help the student calm their
nerves with synchronised breathing.

**Retinal ghosting** — a visual effect where a rapidly changing
image leaves an after-image on the eye. In Flash Anzan, ghosting
would make it impossible for the student to read the numbers
cleanly. MINDSPARK specifically prevents this by flashing
numbers with zero transition time between them.

**Tabular numerals** — a typographic feature where every digit
takes up the same amount of horizontal space, so numbers line up
in columns. MINDSPARK uses tabular numerals everywhere numbers
appear so that the place-value columns stay aligned — essential
for abacus training where students track columns vertically.

**Yomiage** — the Japanese word for a vertical arithmetic exercise
where numbers are called aloud or displayed vertically, to be
added in sequence. The EXAM type in MINDSPARK is a digital
yomiage sheet.

---

## 10. What is not in this document

This document explains what the platform does from the user's
point of view. It does not cover:

- How the platform is built, hosted, or updated.
- Technical details about the programming languages or databases
  used.
- Costs, licensing, or commercial terms.
- How to install or configure the platform on a new school's
  infrastructure.

For any of those, please contact the technical team directly.

---

*Last updated: 2026-04-12*
*Audience: non-technical readers (school owners, teachers, parents)*
*Source: current product specification and working implementation*
