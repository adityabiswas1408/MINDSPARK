# MINDSPARK — Local Development Setup Runbook

> **Audience:** New developers onboarding to the MINDSPARK codebase  
> **Prerequisites:** Node.js 20+, npm, Git, Docker Desktop (for Supabase Local)  
> **Time to complete:** ~15 minutes  
> **Read first:** [`README.md`](../README.md) · [`ARCHITECTURE.md`](../ARCHITECTURE.md)

---

## 1. Clone & Install Dependencies

```bash
git clone <repository-url> mindspark
cd mindspark
npm install
```

**Expected:** Zero npm peer dependency errors. All packages install cleanly.

---

## 2. Environment Variables

Copy the template and populate credentials:

```bash
cp .env.example .env.local
```

### Required Environment Variables

| Variable | Description | Where to Get It |
|:---|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (local: `http://localhost:54321`) | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (**server-only, never exposed to client**) | Supabase Dashboard → Settings → API |
| `HMAC_SECRET` | 32-byte hex secret for clock guard HMAC timestamp sealing | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `OFFLINE_SYNC_SECRET` | 32-byte hex secret for offline sync payload validation | Generate: same as above |
| `RESEND_API_KEY` | API key for Resend email service (guardian consent emails) | [resend.com](https://resend.com) → API Keys |
| `EMAIL_FROM` | Sender address for consent verification emails | Your verified domain |
| `NEXT_PUBLIC_APP_URL` | Public app URL (local: `http://localhost:3000`) | Set to `http://localhost:3000` for dev |

> [!CAUTION]
> **Never commit `.env.local` to Git.** The `.gitignore` already excludes it. `SUPABASE_SERVICE_ROLE_KEY` grants full database access bypassing RLS.

---

## 3. Local Supabase Setup (Optional — for offline DB development)

If you want a fully local database instead of connecting to the remote Supabase project:

```bash
# Install Supabase CLI (if not already)
npm install -g supabase

# Start local Supabase (requires Docker Desktop running)
supabase init
supabase start
```

**Expected output:** Local Supabase will print connection strings including the local anon key and service role key. Update `.env.local` with these values.

### Apply All 27 Migrations

```bash
supabase db push
```

Or apply manually in order:

```bash
supabase migration up
```

**Verify:** Run in the Supabase SQL Editor (local or remote):
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
```
Expected: 14+ tables (`institutions`, `profiles`, `levels`, `cohorts`, `students`, `teachers`, `cohort_history`, `exam_papers`, `questions`, `grade_boundaries`, `assessment_sessions`, `assessment_session_questions`, `submissions`, `student_answers`, `offline_submissions_staging`, `activity_logs`, `announcements`, `announcement_reads`).

---

## 4. Seed Test Data

After migrations are applied, seed the database with test accounts:

```sql
-- 1. Create test institution
INSERT INTO institutions (id, name, timezone, session_timeout_seconds)
VALUES (gen_random_uuid(), 'Test Academy', 'Asia/Kolkata', 3600)
ON CONFLICT DO NOTHING;

-- 2. Create admin user (via Supabase Auth → create user manually)
--    Email: admin@test.com / Password: Admin@123456
--    Set app_metadata.role = 'admin' via SQL:
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
WHERE email = 'admin@test.com';

-- 3. Create student user
--    Email: student@test.com / Password: Student@123456
--    Set app_metadata.role = 'student' via SQL:
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "student"}'
WHERE email = 'student@test.com';

-- 4. Seed default grade boundaries
-- (Already handled by migration 024 — ON CONFLICT DO NOTHING)

-- 5. Create a test level
INSERT INTO levels (id, institution_id, name, sequence_order)
SELECT gen_random_uuid(), id, 'Level 1 - Beginner', 1
FROM institutions LIMIT 1
ON CONFLICT DO NOTHING;
```

---

## 5. Start the Development Server

```bash
npm run dev
```

**Access the application:**
- **Student Portal:** `http://localhost:3000/student`
- **Admin Portal:** `http://localhost:3000/admin` (requires admin role)
- **Login Page:** `http://localhost:3000/login`

---

## 6. Verify the Setup

| Check | Command / URL | Expected Result |
|:---|:---|:---|
| Dev server starts | `npm run dev` | No errors, accessible at `localhost:3000` |
| TypeScript compiles | `npm run tsc` | 0 errors |
| Unit tests pass | `npm run test` | 49/49 tests passing across 7 suites |
| Admin login works | Navigate to `/login`, sign in as admin | Redirects to `/admin/dashboard` |
| Student login works | Navigate to `/login`, sign in as student | Redirects to `/student/dashboard` |

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|:---|:---|:---|
| `npm run dev` fails with module not found | Missing `node_modules` | Run `npm install` |
| Supabase connection refused | Wrong `NEXT_PUBLIC_SUPABASE_URL` | Verify URL matches your Supabase project |
| Login redirects back to `/login` | Missing or incorrect `SUPABASE_SERVICE_ROLE_KEY` | Check `.env.local` credentials |
| HMAC validation errors on offline sync | `HMAC_SECRET` not set | Generate and set a 32-byte hex secret |
| Docker not running error on `supabase start` | Docker Desktop not started | Start Docker Desktop first |
