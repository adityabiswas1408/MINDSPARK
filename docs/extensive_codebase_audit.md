# Extensive Codebase Audit (Phase 1 & 2)

## 1. Security & Data
- **Server Actions:** All 11 files in `src/app/actions/` correctly invoke `requireRole()` at the top of their exported functions. However, **data validation is entirely missing**. Functions like `createQuestion` accept plain TypeScript interfaces (`CreateQuestionInput`) and insert data directly into Supabase without Zod or Joi schema validation. User input is blindly trusted.
- **Supabase RBAC:** `requireRole()` securely uses `supabase.auth.getUser()` to validate the session and derives roles strictly from `app_metadata.role`, effectively preventing client tampering.
- **API Routes:** The `offline-sync/route.ts` and `teardown/route.ts` API routes invoke `adminSupabase.auth.getUser(token)` to verify the JWT but **fail to verify the user role**. They check authentication, but do not enforce that the caller is a `student`.

## 2. Core Engines
- **Timing Engine:** `src/lib/anzan/timing-engine.ts` correctly utilizes a `requestAnimationFrame` loop with an accumulator (`state.accumulator += clampedDelta`) to prevent drift. Zero instances of `setTimeout` or `setInterval` are used. Jitter tests pass successfully.
- **Anti-Cheat:** `clock-guard.ts` (HMAC bounds), `tab-monitor.ts` (visibility tracking), and teardown listeners are **ONLY wired into the Flash Anzan Engine (`use-anzan-engine.ts`)**. Standard exams (`EXAM` / `TEST` handled via `exam-page-client.tsx` and `exam-vertical-view.tsx`) completely bypass all anti-cheat protections.

## 3. State & Architecture
- **State Management:** The codebase heavily relies on Zustand (`useExamSessionStore`) for both Anzan and Standard exams. This maintains state consistency and largely avoids prop drilling (e.g. `ExamVerticalView` manages most interactions by reading directly from the store).
- **Dexie Offline Buffering:** `indexed-db-store.ts` correctly enforces the `synced: false` flag requirement. `sync-engine.ts` groups pending answers by `session_id` and securely transmits them to `offline-sync/route.ts`. The implementation handles failure modes gracefully (e.g. aborting sync if `!navigator.onLine` or JWT is missing) preventing silent data loss.
- **Hydration Risk:** `exam-page-client.tsx` synchronously accesses `document.body` within its render function to render `<ExamVerticalView>` and `<CompletionCard>` via `createPortal`. Because Next.js SSR executes the render function on the server first, accessing `document.body` during SSR/hydration is a serious error and will trigger a ReferenceError or Hydration Mismatch.
