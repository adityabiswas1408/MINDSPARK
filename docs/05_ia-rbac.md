# MINDSPARK V1 — Information Architecture & RBAC Map

> **Document type:** Production Architecture Reference  
> **Version:** 1.0  
> **Output path:** `docs/ia-rbac.md`  
> **Read first:** `docs/prd.md`  
> **Author role:** Principal Frontend Architect — Next.js App Router, Supabase Auth, RBAC

---

## Table of Contents

1. [Site Map — All Routes](#1-site-map--all-routes)
2. [Route Protection Matrix](#2-route-protection-matrix)
3. [RBAC Role Definitions](#3-rbac-role-definitions)
4. [auth-store.ts Scope Restriction](#4-auth-storests-scope-restriction-critical)
5. [cohort_history Temporal Join Pattern](#5-cohort_history-temporal-join-pattern)
6. [Edge Middleware Logic](#6-edge-middleware-logic)
7. [Session Architecture](#7-session-architecture)

---

## 1. Site Map — All Routes

### Auth Routes (public — no session required)

```
/login                     Login page (split-screen — roll number + masked DOB)
/reset-password            Forced password reset (CSV-imported students only)
```

### Admin Panel Routes (`/admin/*` — role: admin or teacher)

```
/admin/dashboard           KPI overview, live pulse, materialized aggregates
/admin/levels              Curriculum level management (drag-and-drop reorder)
/admin/students            Student directory (data table, faceted filters)
/admin/students/[id]       Student profile detail (academic, history, settings)
/admin/students/import     CSV import wizard (multi-step stepper)
/admin/assessments         Assessment listing (EXAM / TEST tabs)
/admin/assessments/new     Assessment creation (type → questions → config)
/admin/assessments/[id]    Assessment detail (pipeline stepper, question list)
/admin/monitor             Monitor listing (active / recent exam sessions)
/admin/monitor/[id]        Live exam monitor (real-time table, heartbeat status)
/admin/results             Results overview (per-paper listing)
/admin/results/[id]        Results detail (distribution chart, bulk publish)
/admin/announcements       Announcement editor (TipTap, target selector)
/admin/reports             BI reports (time-series, per-level analytics)
/admin/activity-log        Audit trail (compound filters, JSON diff viewer)
/admin/settings            Institution config, grade boundaries, timezone
```

> **Teacher scope:** Teachers access all `/admin/*` routes but data is cohort-scoped
> by RLS policies. The middleware allows the route; the database restricts the rows.

### Student Panel Routes (`/student/*` — role: student)

```
/student/dashboard         "Live Now" hero, upcoming assessments, empty state
/student/exams             Exam listing (3-column grid, live/locked badges)
/student/exams/[id]        Assessment engine — EXAM type (vertical equations + MCQ)
/student/tests             Test listing (Flash Anzan cards with config tags)
/student/tests/[id]        Assessment engine — TEST type (3-phase Flash Anzan)
/student/lobby/[id]        Pre-assessment lobby (countdown, network check)
/student/results           Result hub (published highlighted / pending muted)
/student/results/[id]      Result detail (score, donut chart, review grid)
/student/profile           Digital ID card, level progress bar
/student/consent           Guardian consent verification (token-based, accessible pre-login)
```

### API Route Handlers (`/api/*` — not Server Actions)

```
POST /api/submissions/teardown      keepalive: true endpoint for pagehide sync
POST /api/submissions/offline-sync  Background offline queue flush endpoint
```

> **Critical:** These are Route Handlers (stable HTTP URLs), NOT Server Actions.
> `fetch({ keepalive: true })` requires a real POST endpoint. Server Actions
> have no stable URL and cannot be targeted by `pagehide` keepalive fetches.

---

## 2. Route Protection Matrix

| Route Pattern          | Unauthenticated | admin | teacher | student |
|------------------------|----------------|-------|---------|---------|
| `/login`               | ✅ Allow        | → `/admin/dashboard` | → `/admin/dashboard` | → `/student/dashboard` |
| `/reset-password`      | ✅ Allow        | ✅ Allow | ✅ Allow | ✅ Allow |
| `/student/consent`     | ✅ Allow (token-based, pre-auth) | ✅ Allow | ✅ Allow | ✅ Allow |
| `/admin/*`             | → `/login`      | ✅ Allow | ✅ Allow (cohort-scoped by RLS) | → `/student/dashboard` |
| `/admin/settings`      | → `/login`      | ✅ Allow | ❌ 403 | → `/student/dashboard` |
| `/admin/activity-log`  | → `/login`      | ✅ Allow | ❌ 403 | → `/student/dashboard` |
| `/student/*`           | → `/login`      | → `/admin/dashboard` | → `/admin/dashboard` | ✅ Allow |
| `/api/submissions/*`   | 401 (JWT check) | ✅ Allow | ✅ Allow | ✅ Allow (own data) |

### Redirect Rules Summary

```
No session                     → /login
Student hits /admin/*          → /student/dashboard
Admin / teacher hits /student/* → /admin/dashboard
Authenticated user hits /login  → role-appropriate dashboard
forced_password_reset = true   → /reset-password (blocks all other routes)
locked_at IS NOT NULL          → /login (account locked message)
```

---

## 3. RBAC Role Definitions

Role is stored as a **custom claim** in the Supabase Auth JWT. It is the single
source of truth for role identity. All application code derives role from the JWT.

### Role: `admin`

- **Scope:** Platform-wide; all institutions data (V1 = single institution)
- **Exclusive capabilities:**
  - Institution settings (name, timezone, session timeout, branding)
  - Grade boundary configuration
  - Activity log access (full audit trail)
  - Level management (create, reorder, soft-delete)
  - Force-live and close-exam controls on any session
  - Bulk student import via CSV
  - Re-evaluate results across all submissions

### Role: `teacher`

- **Scope:** Own assigned cohort only (enforced at DB/RLS level)
- **Capabilities:**
  - View and manage students currently or historically in their cohort
  - Create and manage own assessments
  - Live monitor own exam sessions
  - View results for own sessions
  - Publish announcements (targeting own cohort levels)
- **Not permitted:**
  - Institution settings or grade boundaries
  - Activity log
  - Other teachers' students or assessments
  - Platform-wide reports

### Role: `student`

- **Scope:** Own data only
- **Capabilities:**
  - View own live and upcoming assessments
  - Take assessments (EXAM and TEST)
  - View own published results
  - View own profile
- **Not permitted:**
  - Any `/admin/*` route
  - Other students' data (RLS enforces at every table)

### Role Enforcement Layers

```
Layer 1: Edge Middleware (middleware.ts)
  → JWT decoded at Edge runtime
  → RBAC redirect logic applied BEFORE page renders
  → Runs on every /admin/* and /student/* request

Layer 2: PostgreSQL RLS Policies
  → Every table has row-level policies
  → auth.uid() and (auth.jwt() -> 'app_metadata') ->> 'role' used in USING clauses
  → No application code can bypass RLS (except service-role client)

Layer 3: Server Action / Route Handler guards
  → Redundant check: verify role from server-side Supabase session
  → Defense-in-depth; does not replace Middleware or RLS
```

---

## 4. auth-store.ts Scope Restriction — CRITICAL

### What auth-store.ts MUST store (UI flags only)

```typescript
// src/stores/auth-store.ts
interface AuthUIState {
  forced_password_reset: boolean;   // Redirect to /reset-password gate
  locked_at: string | null;         // Account lock timestamp for UI display
  session_active: boolean;          // Controls skeleton / auth-loading state
}
```

### What auth-store.ts MUST NEVER store

```typescript
// ❌ PROHIBITED — never add these to Zustand auth store
role: UserRole;           // NEVER — comes from useUser() or onAuthStateChange
permissions: string[];    // NEVER — derived from role at runtime
user_id: string;          // NEVER — comes from Supabase Auth session
email: string;            // NEVER — lives in Supabase Auth session object
full_name: string;        // NEVER — lives in profiles table, fetched via useUser()
profile: Profile;         // NEVER — entire profile object in Zustand is forbidden
```

### Rationale: Dual Source-of-Truth Race Condition

When a Supabase JWT is refreshed, `onAuthStateChange` fires asynchronously.
If `role` is stored in Zustand, a window exists between the old Zustand value
and the new JWT value where the two sources report different roles.

**Attack vector:** A stale `role: 'admin'` remains in Zustand memory after a
token refresh that downgrades permissions. Client-side guards read Zustand
(stale admin), skip the redirect, render admin UI. Server Actions and RLS still
reject the request — but the UI has leaked admin route structure.

**Solution:** Always derive role from the live session object:

```typescript
// ✅ CORRECT — derive role from auth session, not Zustand
import { useUser } from '@/hooks/use-user';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, role } = useUser(); // reads from Supabase session
  if (role !== 'admin') return null;
  return <>{children}</>;
}

// src/hooks/use-user.ts
export function useUser() {
  const supabase = createBrowserClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  const role = session?.user?.app_metadata?.role as UserRole | undefined;
  return { user: session?.user ?? null, role };
}
```

---

## 5. cohort_history Temporal Join Pattern

### Problem

Teachers must retain access to historical data for students who have since been
promoted to a new level or reassigned to a different teacher. A simple
`assigned_teacher_id` foreign key on `students` evaluates the current state only —
once a student is reassigned, Teacher A loses all historical submission records.
This breaks legitimate analytics, reporting, and audit requirements.

### Solution: cohort_history Temporal Join Table

```sql
-- supabase/migrations/007_create_cohort_history.sql

CREATE TABLE cohort_history (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID         NOT NULL REFERENCES students(id),   -- FK → students, NOT profiles
  teacher_id  UUID         NOT NULL REFERENCES profiles(id),
  cohort_id   UUID         NOT NULL REFERENCES cohorts(id),
  valid_from  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  valid_to    TIMESTAMPTZ,          -- NULL = currently assigned to this teacher
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**Immutability rules:**
- Application code never issues UPDATE on this table directly.
- Row closure is handled automatically by the `trg_close_previous_cohort` trigger on INSERT — the trigger sets `valid_to = NOW()` on the previous open row.
- `valid_to IS NULL` = student is currently in this teacher's cohort.

### RLS Policy: Teacher Historical Access on `submissions`

```sql
-- 016_create_rls_policies.sql

CREATE POLICY "teachers_view_historical_submissions"
ON submissions FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata') ->> 'role' = 'teacher'
  AND student_id IN (
    SELECT DISTINCT ch.student_id
    FROM cohort_history ch
    WHERE ch.teacher_id = auth.uid()
      AND ch.valid_from  <= submissions.started_at
      AND (ch.valid_to IS NULL OR ch.valid_to >= submissions.started_at)
  )
);
```

**What this does:**
- Grants read access if the teacher was assigned to this student at the time the
  assessment session started (`s.started_at`).
- Uses the session start date as the temporal reference, not today's date.
- Allows Teacher A to keep viewing past submissions even after student moves to Teacher B.
- Teacher B gains access only to sessions that started after the reassignment.

### Application-Level Usage

```typescript
// Queries automatically scoped by RLS — no application code change needed
const { data: submissions } = await supabase
  .from('submissions')
  .select('*')
  .eq('student_id', studentId);
// RLS applies the temporal join invisibly
```

### Why Agents Break This Without Documentation

AI coding agents default to `assigned_teacher_id` on the `students` table for
all teacher-scoped queries. This pattern produces correct results today but
silently drops historical data when students are promoted. The `cohort_history`
table must be explicitly used in every teacher-scoped RLS policy.

---

## 6. Edge Middleware Logic

### File: `middleware.ts` (repo root)

Runs at **Next.js Edge Runtime** — before any page renders, before any React
component executes. This is the only layer where route protection is enforced
with zero render flash.

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* cookie adapter */ } }
  );

  // 1. Refresh JWT on every request (keeps session alive)
  const { data: { session } } = await supabase.auth.getSession();
  const role = session?.user?.app_metadata?.role as string | undefined;
  const pathname = request.nextUrl.pathname;

  // 2. Unauthenticated user → /login
  if (!session && pathname !== '/login' && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Authenticated on /login → role-appropriate dashboard
  if (session && pathname === '/login') {
    const dest = role === 'student' ? '/student/dashboard' : '/admin/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // 4. Student accessing /admin/* → /student/dashboard
  if (role === 'student' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // 5. Admin / teacher accessing /student/* → /admin/dashboard
  if ((role === 'admin' || role === 'teacher') && pathname.startsWith('/student')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 6. Teacher accessing admin-only routes → 403
  const adminOnlyRoutes = ['/admin/settings', '/admin/activity-log'];
  if (role === 'teacher' && adminOnlyRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/admin/dashboard?error=forbidden', request.url));
  }

  // 7. forced_password_reset gate
  const forceReset = session?.user?.app_metadata?.forced_password_reset;
  if (forceReset && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/reset-password', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

### Middleware Enforcement Principles

| Principle | Detail |
|-----------|--------|
| **Runs at Edge** | No Node.js runtime; no `fs`, no heavy libraries |
| **JWT refresh** | `getSession()` triggers silent token refresh on every protected request |
| **No client-side guards** | `useEffect` guards are UX sugar only — middleware is the real gate |
| **API routes excluded** | `/api/*` routes have their own JWT validation per handler |
| **Redirect, not 403** | All role mismatches redirect; no naked 403 pages |

---

## 7. Session Architecture

### Authentication Flow

```
Student / Admin                Supabase Auth               Database
      │                              │                         │
      ├─ POST /api/auth/login ──────►│                         │
      │   { roll_number, dob }       │                         │
      │                         Validate credentials           │
      │                         Embed role claim in JWT        │
      │◄─ JWT (access + refresh) ────┤                         │
      │                              │                         │
      ├─ All subsequent requests ────►Middleware extracts JWT   │
      │   Authorization: Bearer...   Validates + refreshes     │
      │                              Checks role for route     │
      │                              ──────────────────────────►RLS filters rows
```

### JWT Structure

```json
{
  "sub": "uuid-user-id",
  "role": "authenticated",
  "app_metadata": {
    "role": "admin",           // "admin" | "teacher" | "student"
    "forced_password_reset": false
  },
  "exp": 1710000000,
  "iat": 1709996400
}
```

> `app_metadata.role` is the **single source of truth** for RBAC.
> Supabase custom claims set via admin API are stored in app_metadata, which is NOT writable by the user.
> Set at account creation by the `bulk_import_students()` RPC (students)
> or manually by the admin for teacher accounts.

### Session Timeout

- **Configured per institution** in `institutions.session_timeout_seconds` (default: 3600s).
- Inactivity tracked via Supabase Auth JWT expiry (`exp` claim) — session timeout is enforced by the JWT TTL configured in Supabase Auth settings, not a DB column. The `institutions.session_timeout_seconds` value is synced to the Supabase Auth session duration via the service-role admin API on institution settings update.
- Checked on every authenticated request in middleware.
- On timeout: JWT invalidated server-side; next request returns `401`; client redirects `/login`.

### Token Refresh Strategy

```typescript
// Supabase SSR handles refresh automatically via createServerClient
// The middleware triggers a silent refresh on every page navigation
// Refresh token rotation: each refresh issues a new refresh token
// Old refresh tokens are invalidated immediately (prevents replay)
```

### Supabase Client Types

| Client | File | Context | RLS | Usage |
|--------|------|---------|-----|-------|
| Browser client | `src/lib/supabase/client.ts` | Client components | ✅ Enforced | Realtime subscriptions, client-side queries |
| Server client | `src/lib/supabase/server.ts` | RSC, Server Actions | ✅ Enforced | Data fetching, form mutations |
| Middleware client | `src/lib/supabase/middleware.ts` | `middleware.ts` only | ✅ Enforced | JWT refresh, session validation |
| **Service-role client** | `src/lib/supabase/admin.ts` | **Server-only** | ❌ **Bypasses RLS** | RPC execution, bulk operations requiring elevated access |

> **`admin.ts` is server-only, always.** It uses `SUPABASE_SERVICE_ROLE_KEY`
> which is never exposed to the client. Import it only in Server Actions or
> Route Handlers. A lint rule should enforce: no import of `admin.ts` in
> files under `src/components/`, `src/hooks/`, or `src/stores/`.

### Forced Password Reset Gate

```typescript
// middleware.ts — checked after role routing
const forceReset = session?.user?.app_metadata?.forced_password_reset;
if (forceReset && pathname !== '/reset-password') {
  return NextResponse.redirect(new URL('/reset-password', request.url));
}
```

- `forced_password_reset` is set to `true` on all CSV-imported student accounts.
- After successful password update, `profiles.forced_password_reset` is set `false`
  via a Server Action, and `app_metadata` is updated via the service-role client.
- The middleware gate blocks ALL other routes until reset is complete.

### Account Lock Gate

- `profiles.locked_at TIMESTAMPTZ` — set by admin action.
- Middleware checks: if `locked_at IS NOT NULL`, redirect `/login` with `?error=account_locked`.
- JWT is revoked server-side; no browser session can continue for a locked account.

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All routes documented with required role | ✅ §1 Site Map + §2 Matrix |
| auth-store.ts scope restriction with prohibited fields | ✅ §4 |
| Dual source-of-truth race condition rationale | ✅ §4 |
| cohort_history temporal join with full SQL example | ✅ §5 |
| RLS policy using assessment session start date | ✅ §5 |
| Edge Middleware logic (not client-side) with code | ✅ §6 |
| service-role admin.ts documented as server-only, RLS bypass | ✅ §7 |
| Session timeout and token refresh strategy | ✅ §7 |
| Forced password reset gate | ✅ §7 |
| Account lock gate | ✅ §7 |
