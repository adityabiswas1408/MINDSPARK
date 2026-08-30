---
name: core-rules
description: Always active. Injected into every message. Core constraints for every file in this project. Never deviate from these.
---

# MINDSPARK — Core Rules (Always On)

## Before writing any file
1. Confirm you have read CLAUDE.md completely this session
2. Confirm you have read PROGRESS.md and know the current phase
3. Confirm you have found the first unchecked task in docs/17_task-breakdown.md
4. State the file you are about to write
5. After writing: run npm run tsc and fix all errors before the next file

## After writing any file
- Run npm run tsc immediately
- Fix all TypeScript errors before touching the next file
- Check off the task in docs/17_task-breakdown.md
- If you have written 8 or more files this session, write PROGRESS.md and notify the user

## Banned patterns — these cause silent runtime failures, not build errors

BANNED: setTimeout or setInterval for Flash Anzan timing
REASON: drifts on slow hardware and background tabs
USE: requestAnimationFrame + delta accumulator in timing-engine.ts

BANNED: phase !== 'FLASH' in any conditional
REASON: 'FLASH' is not a valid ExamPhase value. This condition is permanently true.
USE: phase !== 'PHASE_2_FLASH'

BANNED: display:none to hide Navigator during Phase 2
REASON: component stays in DOM, consuming memory and causing visual artifacts
USE: {phase !== 'PHASE_2_FLASH' && <Navigator/>} — true unmount

BANNED: DOMPurify anywhere
REASON: throws ReferenceError: window is not defined in RSC and Server Actions
USE: sanitize-html server-side at write time only

BANNED: auth.jwt() ->> 'role' in RLS policies
REASON: returns 'authenticated', not the app role
USE: (auth.jwt() -> 'app_metadata') ->> 'role'

BANNED: session.user.role on server side
REASON: returns 'authenticated', not the app role
USE: user.app_metadata.role from supabase.auth.getUser()

BANNED: admin.ts import in any (student)/ route or client component
REASON: service-role key would be exposed in client bundle
ENFORCED BY: ESLint no-restricted-imports rule

BANNED: validate_offline_submission (short form)
REASON: this function does not exist in the database
USE: validate_and_migrate_offline_submission (full name, migration 020)

BANNED: assessment.ts (singular)
REASON: file does not exist
USE: assessments.ts (plural) — src/app/actions/assessments.ts

BANNED: question_index in any student_answers write or payload
REASON: column does not exist in student_answers table
USE: question_id UUID FK to questions(id)

BANNED: session_id join on student_answers
REASON: column does not exist in student_answers table
USE: submission_id FK to submissions(id)

BANNED: lobby:{paper_id} channel for lifecycle events
REASON: students in the assessment engine subscribe to exam: not lobby:
USE: exam:{paper_id} for exam_live, exam_closed, exam_reopened
USE: lobby:{paper_id} for Presence tracking only

BANNED: Postgres Changes for exam state events
REASON: WAL overflow at 2,500+ concurrent sessions
USE: Supabase Broadcast exclusively for all exam lifecycle events

BANNED: any magic number inline in code
REASON: values are defined in src/lib/constants.ts and must match across the codebase
USE: import { HEARTBEAT_INTERVAL_MS, INPUT_COOLDOWN_MS, ... } from '@/lib/constants'

## Mandatory patterns

Realtime cleanup:
  Every useEffect that calls supabase.channel() must call supabase.removeChannel() in cleanup
  Subscription leaks exhaust the Supabase connection pool

WebSocket thundering herd prevention:
  setTimeout(() => channel.subscribe(), Math.random() * JITTER_WINDOW_MS)
  Without this, 2,500 simultaneous reconnects cause too_many_joins errors

IndexedDB before network:
  Every answer writes to IndexedDB BEFORE any network call
  The IndexedDB write is the durable record. The network call is optimistic.

idempotency on all answer writes:
  ON CONFLICT (idempotency_key) DO NOTHING on all student_answers upserts
  Same idempotency_key called twice: silent no-op, not an error

## Ask the user before doing any of these
- Adding a package not in the stack list in GEMINI.md
- Modifying any file in supabase/migrations/ (irreversible without full DB reset)
- Changing any column name, table name, or RLS policy
- Creating a new Zustand store beyond the three already defined
- Deviating from the Canonical Source Hierarchy in GEMINI.md
