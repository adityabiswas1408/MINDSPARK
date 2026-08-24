# Security

## Secrets
- **Zero Secrets in Client:** The Supabase Service Role key (`SUPABASE_SERVICE_ROLE_KEY`) is strictly confined to server-side Node execution environments. Client applications only receive the public Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Environment Management:** Local credentials are kept in `.env.local` (ignored by Git). Production secrets are injected via Vercel Secret Store.
- **Service Role Restriction:** `src/lib/supabase/admin.ts` is strictly prohibited from being imported into client components or student routes (`src/app/(student)/`) to eliminate privilege escalation vectors.

## Data access & RLS
- **Row Level Security (RLS):** All 14+ Postgres tables enforce RLS policies. Students can only select questions for active sessions and read/write their own submission rows (`auth.uid() = student_id`).
- **Parameterized Queries:** All database interactions execute via Supabase PostgREST client or strongly-typed RPCs (`bulk_import_students`, `validate_and_migrate_offline_submission`). Zero raw dynamic SQL string interpolation.
- **Composite Key Integrity:** The `submissions` table enforces `(session_id, student_id)` composite uniqueness, preventing duplicate submissions per session.

## Auth & sessions
- **Authoritative Token Verification:** Authentication is verified server-side with `supabase.auth.getUser()`. The cached `getSession()` is never trusted for authorization decisions.
- **Role Verification:** User role is sourced strictly from `app_metadata.role` within the cryptographically signed JWT.
- **Anti-Cheat & Teardown Security:** Active exam sessions monitor window blur, tab switching, and developer tools activity. Unauthorized session teardowns log to `activity_logs` with HMAC timestamps.

## Minor Privacy Compliance (DPDP Act 2023)
- **Guardian Consent Flow:** Under Section 9 of the DPDP Act, minor students without verified guardian consent (`consent_verified = false`) are barred from live assessments and redirected to `/student/consent`.
- **Cryptographic Link Verification:** Verification links (`/api/consent/verify`) validate tamper-proof signed tokens before activating student profiles.
- **Automated Data Retention Pipeline:** Migration 026 adds `deletion_scheduled_at`. A `pg_cron` worker executes `execute_scheduled_deletions()` in FK-safe order to erase expired records after 365 days.

## Content Security Policy & Input Validation
- **CSP Nonce Pattern:** Configured in `next.config.ts` to enforce strict script, style, and iframe sources.
- **Schema Validation:** All Route Handlers and Server Actions validate inbound parameters using Zod schemas before database processing.
- **Content Sanitization:** Rich-text announcements and user inputs pass through `sanitize-html` on the server side to prevent XSS (DOMPurify is banned due to RSC crashes).
- **Offline Sync Validation:** The `/api/submissions/offline-sync` endpoint validates payload checksums and cryptographic seals before committing records.
