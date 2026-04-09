@"

\# MINDSPARK — Quick Context



\## What it is

Mental arithmetic exam platform. Next.js 15 + Supabase + Tailwind v4.

Production: https://mindspark-one.vercel.app

Repo: A:\\MS\\mindspark



\## What works right now

\- Admin: login, sidebar, create assessment wizard, go live, force close

\- Student: login, dashboard with live exam card, lobby with timer, exam MCQ page

\- Full flow verified: admin creates exam → goes live → student enters lobby → takes exam



\## What is NOT built yet (priority order)

1\. Exam submit → completion screen

2\. Admin dashboard charts (recharts)

3\. Student results page

4\. Admin students table

5\. Admin results publish flow

6\. Wire Create Level button

7\. Admin monitor real-time table

8\. Admin announcements TipTap

9\. Admin settings forms

10\. Admin activity log



\## Hard constraints

\- No new migrations — DB fixes via Supabase SQL editor only

\- No setTimeout in src/lib/anzan/

\- admin.ts banned in student routes

\- Run tsc before every commit

\- Banned colours: #FF6B6B #121212 #1A1A1A #E0E0E0



\## Design system

Primary green: #1A3829 | Page bg: #F8FAFC | Font: DM Sans

All designs are in admin.pdf and student.pdf in the repo root



\## Key paths

Admin pages:  src/app/(admin)/admin/

Student pages: src/app/(student)/student/

Actions:      src/app/actions/

Components:   src/components/

"@ | Out-File A:\\MS\\mindspark\\PROJECT.md -Encoding UTF8

