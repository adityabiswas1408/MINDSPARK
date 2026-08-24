# Architecture

## Workspace Structure
- `A:\MS\mindspark/`: Core active repository root (Application source, configs, tests, documentation, agent skills).
- `A:\MS\other/`: Archived legacy scripts, scratch HTML files, previous PDF builds, and test artifacts.

## System Map
- **Frontend / Client Portal:** Next.js 15 App Router with separated route groups:
  - `(admin)/admin/`: 10 administrative management pages protected by `requireRole('admin')`.
  - `(student)/student/`: Student exam lobby, live Flash Anzan engine, and results protected by `requireRole('student')`.
- **Client Offline & Anti-Cheat Subsystem:**
  - `src/lib/offline/`: Dexie 4 IndexedDB store syncing question banks and encrypted answer buffers.
  - `src/lib/anticheat/`: Clock drift detector (HMAC timestamp sealing) + visibility state teardown listener.
- **Dual Calculation Engines (`src/lib/anzan/` & `src/components/assessments/`):**
  - **Flash Anzan Engine:** High-precision `requestAnimationFrame` delta accumulator ensuring <5ms frame jitter across 4 sequential phases (Preparation → Flash → MCQ → Confirmation).
  - **Vertical Abacus Engine:** High-contrast monospace equation columns with negative operands rendered in dark red (`#991B1B`) and 64×64px tactile MCQ buttons with 1,200ms anti-double-tap cooldown.
- **Backend & Database:**
  - Next.js Server Actions (`src/app/actions/`) returning typed `ActionResult<T>`.
  - Route Handlers (`src/app/api/`) for `offline-sync`, `teardown`, and `consent/verify`.
  - Supabase PostgreSQL with 27 applied migrations, RLS policies, and custom RPCs.

## Supabase Realtime Topology
- **Broadcast Channels (`exam:{paper_id}`):** Ephemeral WebSocket messaging for exam lifecycle events (START, FORCE_CLOSE, RESULT_RELEASE). Zero database WAL overhead.
- **Presence Channels (`lobby:{paper_id}`):** Ephemeral connection state tracking for active students waiting in exam lobbies.
- **Thundering Herd Mitigation:** All client connections inject a randomized jitter window (`Math.random() * 5000ms`) upon mass reconnect.

## Data Flow
1. **Assessment Creation:** Admin defines assessment parameters, levels, and question sets via Server Actions → Supabase.
2. **Student Exam Session:** Student opens lobby → verifies HMAC session token → downloads paper to local Dexie store.
3. **Execution:** RAF loop cycles through preparation (PHASE_1) → flash sequence (PHASE_2) → MCQ answer selection (PHASE_3).
4. **Submission & Grading:** Responses submitted online via `submitAnswer` Server Action, or batched to `/api/submissions/offline-sync` → RLS-guarded `submissions` and `student_answers` tables.

## Key Boundaries
- **Role Enforcement:** Server-side JWT validation via `supabase.auth.getUser()`. Role read from `app_metadata.role` (never user metadata or client payload).
- **Submissions Isolation:** Submissions keyed by composite unique index `(session_id, student_id)`.
- **Service Role Restriction:** `src/lib/supabase/admin.ts` permitted only in secure server actions/routes, banned in student routes and client hooks.
