# MINDSPARK — Claude Code Context

## Project
Mental arithmetic assessment platform for ages 6–18.
Stack: Next.js 15, Supabase (PostgreSQL), shadcn/ui, Tailwind v4, Zustand, Dexie 4.

Production: https://mindspark-one.vercel.app
Supabase: ahrnkwuqlhmwenhvnupb
GitHub: https://github.com/adityabiswas1408/MINDSPARK
Branch: main

## Current Status (as of April 2026)
- Auth: working (admin + student login)
- Routing: working (all 10 admin routes, all student routes)
- Database: 26 migrations applied, RPCs deployed
- CSS: Tailwind v4 — slate palette added to @theme inline, sidebar fixed
- Sign Out: fixed in top-header.tsx
- Create Assessment: BUTTON EXISTS BUT NO HANDLER — highest priority

## What Needs Building
Every admin and student page is a placeholder shell.
The designs are in docs/designs/ (admin.pdf and student.pdf).
Build each page to match those designs exactly.

Priority order:
1. Create Assessment wizard (3 steps: Type → Questions → Config)
2. Admin Dashboard (recharts KPI cards, score trend, level distribution)
3. Student Dashboard (live exam hero card, upcoming list)
4. Admin Students (filters, paginated table, profile page)
5. Admin Assessments (EXAM/TEST tabs, status management)
6. Student exam flow (lobby → flash → MCQ → submit)
7. Admin Results (grade distribution chart, publish flow)
8. Admin Monitor (real-time student table)
9. Admin Announcements (TipTap editor)
10. Admin Levels (drag-handle cards)
11. Admin Settings (institution form, grade boundaries)
12. Admin Activity Log (filterable table)

## Hard Constraints — Never Violate
- No new migrations — all DB fixes via Supabase SQL editor
- JWT role: (auth.jwt() -> 'app_metadata') ->> 'role'
- RPC name: validate_and_migrate_offline_submission
- PowerShell: use ; not &&
- Never commit .env files or secrets
- Banned colours: #FF6B6B #121212 #1A1A1A #E0E0E0
- #991B1B for negative arithmetic numbers ONLY
- No setTimeout/setInterval in src/lib/anzan/
- Phase string: PHASE_2_FLASH never just 'FLASH'
- admin.ts banned in (student)/ routes, client components, hooks
- Run npm run tsc after every file change — 0 errors before commit
- DOMPurify BANNED — use sanitize-html server-side

## Design System
Primary green:    #1A3829  (sidebar, CTAs, buttons)
Brand navy:       #204074  (login background)
Page background:  #F8FAFC
Card background:  #FFFFFF
Card border:      #E2E8F0
Body text:        #0F172A
Secondary text:   #475569
Error:            #DC2626 on #FEE2E2
Live badge:       #FFFFFF on #EF4444
Font UI:          DM Sans
Font numbers:     DM Mono (tabular-nums always)

## Tailwind v4 Notes
- Uses @theme inline for color definitions (NOT tailwind.config.ts colors)
- Slate palette is defined in @theme inline in globals.css
- Sidebar uses .admin-sidebar CSS class (NOT hidden md:flex — v4 cascade bug)
- bg-bg-page, bg-green-800, border-slate-200 etc all compile correctly now

## Key File Paths
src/app/(admin)/admin/       — all admin pages
src/app/(student)/student/   — all student pages
src/components/layout/       — admin-sidebar, top-header
src/components/ui/           — shadcn components (Base UI based)
src/app/actions/             — Server Actions
src/app/api/                 — Route Handlers
src/lib/supabase/            — client, server, admin clients
src/lib/auth/rbac.ts         — requireRole() function
src/lib/offline/             — sync engine + IndexedDB

## Database Tables (key ones)
- exam_papers (id, title, type EXAM|TEST, status DRAFT|PUBLISHED|LIVE|CLOSED)
- questions (id, paper_id, question_type, content, options, correct_option)
- assessment_sessions (id, paper_id, student_id, started_at, closed_at)
- submissions (id, session_id, student_id, paper_id, completed_at)
- student_answers (id, submission_id, question_id, selected_option, idempotency_key)
- students (id, roll_number, full_name, level_id, institution_id, consent_verified)
- levels (id, name, institution_id, sort_order)
- activity_logs (id, user_id, institution_id, action_type, entity_type, metadata)
- profiles (id, institution_id, role, forced_password_reset)

## Server Action Pattern
Every action must start with requireRole():
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error };
  const { userId, institutionId } = authResult;

## Component Pattern
Pages use Server Components for data fetching.
Interactive parts use 'use client' components.
shadcn components are Base UI based — use them as-is.
Charts use recharts (already installed).

## Recent Fixes Applied
- globals.css: slate palette in @theme inline
- admin-sidebar.tsx: .admin-sidebar class, no hidden md:flex
- top-header.tsx: Sign Out calls supabase.auth.signOut()
- offline-sync/route.ts: HMAC generated server-side
- sync-engine.ts: no NEXT_PUBLIC_ secret, correct field names
- assessment-sessions.ts: submission_id fix (select id not just completed_at)
- teardown/route.ts: submission_id optional, looked up from session_id
- next.config.ts: HSTS header added

## Vercel Env Vars (production)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
SUPABASE_SERVICE_ROLE_KEY
HMAC_SECRET
OFFLINE_SYNC_SECRET
