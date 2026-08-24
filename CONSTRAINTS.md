# Constraints

## Always
- **Type-Check Before Commits:** Run `npm run tsc` and ensure 0 errors before committing or pushing.
- **Server Action Contract:** Return `ActionResult<T>` (`{ ok: true, data: T }` or `{ ok: false, error: string }`).
- **Strict RBAC Gate:** Check `requireRole('admin')` or `requireRole('student')` as the very first line of any Server Action.
- **Parse Numeric Database Outputs:** Wrap all PostgreSQL numeric columns with `Number(val ?? 0)` (Postgres drivers return strings).
- **Composite Key Upserts:** Always specify full composite conflict target `onConflict: 'session_id,student_id'` when upserting to `submissions`.
- **Touch Target Accessibility:** Ensure touch targets for MCQ answer cards and exam buttons are >= 64x64px.
- **Color Semantics:** Use `#991B1B` strictly for negative arithmetic display; use `#DC2626` for errors, incorrect answers, and validation failures.

## Ask First
- Modifying remote database schema directly or adding new migrations beyond the 27 applied migrations.
- Altering the Flash Anzan minimum display floor (< 200ms) or maximum ceiling (> 3000ms).
- Changing public API Route Handler contracts (`/api/submissions/offline-sync`, `/api/submissions/teardown`, `/api/consent/verify`).
- Altering user authentication session lifecycle or JWT claims handling.

## Never
- **Never use `setTimeout` or `setInterval` in `src/lib/anzan/`:** Timing must be driven exclusively by the requestAnimationFrame delta loop in `timing-engine.ts`.
- **Never import `src/lib/supabase/admin.ts` into student routes or client components:** The Service Role client must never leak into client bundles.
- **Never read user role from client payload or `user_metadata`:** Always verify via `app_metadata.role` after a server-validated `getUser()` call.
- **Never commit `.env.local` or hardcode API keys/secrets:** All environment variables belong in local `.env` files or Vercel environment managers.
- **Never use banned colors:** `#FF6B6B`, `#121212`, `#1A1A1A`, `#E0E0E0` are strictly disallowed across all stylesheets and components.
- **Never use `getSession()` for authorization:** Always use `supabase.auth.getUser()` to prevent forged JWT session exploits.
