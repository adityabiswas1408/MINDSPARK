# MINDSPARK V1 — API Contract Document

> **Document type:** API Contracts — Technical Planning  
> **Version:** 1.0  
> **Output path:** `docs/api-contracts.md`  
> **Read first:** `docs/fsd.md` · `docs/database.md`  
> **Author role:** Principal API Designer — Next.js Server Actions · Route Handlers · TypeScript-first API design

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Error Code Taxonomy](#2-error-code-taxonomy)
3. [Shared Type Definitions](#3-shared-type-definitions)
4. [Route Handlers](#4-route-handlers)
   - POST /api/submissions/teardown
   - POST /api/submissions/offline-sync
   - GET /api/consent/verify
5. [Server Actions — Assessment Management](#5-server-actions--assessment-management)
6. [Server Actions — Student Management](#6-server-actions--student-management)
7. [Server Actions — Exam Operations](#7-server-actions--exam-operations)
8. [Server Actions — Results](#8-server-actions--results)
9. [Server Actions — Admin](#9-server-actions--admin)

---

## 1. Design Principles

### Route Handler vs Server Action — Decision Rule

| Factor | Route Handler | Server Action |
|--------|--------------|---------------|
| Called by | fetch() / Dexie sync / keepalive | React `<form>` or `action=` prop |
| URL stability | Fixed (`/api/…`) — survives page transitions | Posts to current page URL — changes on navigation |
| `keepalive: true` | ✅ Works | ❌ Unreliable |
| `pagehide` event | ✅ Supported | ❌ Not reliable |
| Background sync | ✅ Dexie.js can call it | ❌ No background invocation |
| Cookie auth | Optional | Required (Supabase SSR client) |
| JWT auth header | ✅ Explicit header | ❌ Not idiomatic |

**Rule:** Route Handlers are used ONLY for:
1. `POST /api/submissions/teardown` — keepalive on page unload
2. `POST /api/submissions/offline-sync` — offline queue flush
3. `GET /api/consent/verify` — guardian consent email click handler (unauthenticated; stable URL required for email links)

All other mutations use Server Actions.

### Response Envelope

All Server Actions return a typed discriminated union — never throw to client:

```typescript
// Success
type ActionSuccess<T> = { ok: true; data: T };

// Failure
type ActionError = { ok: false; error: ErrorCode; message: string };

type ActionResult<T> = ActionSuccess<T> | ActionError;
```

Never expose:
- Raw PostgreSQL error messages
- Stack traces
- Internal UUIDs in error messages
- HTTP status codes to client (Server Actions don't return HTTP responses)

---

## 2. Error Code Taxonomy

All error codes are string literals in a shared enum. Client code switches on `error` field — never on `message` (human-readable, may change).

```typescript
// src/types/api-errors.ts
export const ErrorCode = {
  // Auth
  INVALID_CREDENTIALS:        'INVALID_CREDENTIALS',
  UNAUTHORIZED:               'UNAUTHORIZED',       // not logged in
  FORBIDDEN:                  'FORBIDDEN',           // logged in but wrong role
  SESSION_EXPIRED:            'SESSION_EXPIRED',

  // Rate / Quota
  RATE_LIMITED:               'RATE_LIMITED',
  QUOTA_EXCEEDED:             'QUOTA_EXCEEDED',      // IndexedDB quota or request quota

  // Assessment
  ASSESSMENT_NOT_FOUND:       'ASSESSMENT_NOT_FOUND',
  ASSESSMENT_NOT_LIVE:        'ASSESSMENT_NOT_LIVE',
  ASSESSMENT_ALREADY_LIVE:    'ASSESSMENT_ALREADY_LIVE',
  ASSESSMENT_LOCKED:          'ASSESSMENT_LOCKED',   // LIVE or CLOSED — no edits
  ASSESSMENT_NOT_CLOSED:      'ASSESSMENT_NOT_CLOSED',

  // Submission
  ALREADY_SUBMITTED:          'ALREADY_SUBMITTED',
  SESSION_NOT_FOUND:          'SESSION_NOT_FOUND',
  SESSION_CLOSED:             'SESSION_CLOSED',
  INVALID_IDEMPOTENCY_KEY:    'INVALID_IDEMPOTENCY_KEY',
  INVALID_QUESTION:           'INVALID_QUESTION',

  // Data
  VALIDATION_ERROR:           'VALIDATION_ERROR',    // Zod parse failure
  NOT_FOUND:                  'NOT_FOUND',
  DUPLICATE:                  'DUPLICATE',           // roll_number collision etc.

  // Crypto
  HMAC_INVALID:               'HMAC_INVALID',
  TIMESTAMP_EXPIRED:          'TIMESTAMP_EXPIRED',

  // Server
  INTERNAL_ERROR:             'INTERNAL_ERROR',      // never expose cause to client
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
```

### Error Response Construction — Server Actions

```typescript
// src/lib/action-helpers.ts

export function ok<T>(data: T): ActionSuccess<T> {
  return { ok: true, data };
}

export function err(code: ErrorCode, message: string): ActionError {
  // Log full details server-side BEFORE returning sanitised response
  console.error(`[ServerAction] ${code}: ${message}`);
  // Never include internal details in the returned object
  return { ok: false, error: code, message };
}
```

---

## 3. Shared Type Definitions

```typescript
// src/types/api.ts

export interface Answer {
  question_id:      string;   // UUID — FK → questions(id); identifies which question this answers
  selected_option:  'A' | 'B' | 'C' | 'D' | null;  // null = skipped
  answered_at:      number;   // client timestamp ms
  idempotency_key:  string;   // UUID v5
}

export interface AnswerSnapshot {
  session_id: string;
  answers:    Answer[];
}

export interface QuestionInput {
  equation_display: string | null;   // EXAM type — rendered string
  flash_sequence:   number[] | null; // TEST type — ordered number array
  option_a:         string;
  option_b:         string;
  option_c:         string;
  option_d:         string;
  correct_option:   'A' | 'B' | 'C' | 'D';
  order_index:      number;
}

export interface AnzanConfig {
  delay_ms:    number;    // 200–2000
  digit_count: number;    // 1–5
  row_count:   number;    // 2–10
}

export interface StudentInput {
  full_name:     string;
  roll_number:   string;
  date_of_birth: string;  // ISO 8601: YYYY-MM-DD
  level_id:      string;
  cohort_id?:    string;
}
```

---

## 4. Route Handlers

### `POST /api/submissions/teardown`

**Type:** Route Handler (NOT Server Action)  
**Reason:** Called from `pagehide` event using `fetch({ keepalive: true })`. Server Actions POST to the current page URL which changes on navigation — making them unreliable for page-unload requests. This endpoint needs a stable, permanent URL that survives page transitions.

**Auth:** JWT in `Authorization: Bearer <token>` header  
→ Cookies are not reliably sent on `pagehide` — explicit JWT is mandatory.

**Rate Limit:** 1 per `session_id` (enforced by idempotency — duplicate calls are no-ops)

---

#### Request

```typescript
interface TeardownRequest {
  submission_id:    string;        // UUID
  session_id:       string;        // UUID
  answers_snapshot: Answer[];      // full local state for reconciliation
  client_timestamp: number;        // Date.now() at time of call
}
```

#### Success Response

```typescript
// HTTP 200
{ ok: true }
// Browser likely discards response — keepalive is fire-and-forget
```

#### Error Responses

| HTTP | Body | Condition |
|------|------|-----------|
| 401 | `{ error: 'UNAUTHORIZED' }` | JWT missing, expired, or invalid |
| 422 | `{ error: 'VALIDATION_ERROR', fields: string[] }` | Body fails Zod parse |
| 500 | `{ error: 'INTERNAL_ERROR' }` | Unexpected DB failure (logged server-side) |

#### Side Effects

1. Upsert any unsynced answers from `answers_snapshot` → `offline_submissions_staging`
2. Update `submissions.completed_at = NOW()` if not already set (idempotent)
3. Log to `activity_logs` with `action_type = 'TEARDOWN'`

#### Idempotency

Safe to call multiple times. The `submission_id` + `session_id` pair acts as a natural idempotency key:
- If `completed_at` is already set → skip update, return 200
- Answer upserts use `ON CONFLICT (idempotency_key) DO NOTHING`

#### Implementation

```typescript
// src/app/api/submissions/teardown/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  submission_id:    z.string().uuid(),
  session_id:       z.string().uuid(),
  answers_snapshot: z.array(z.object({
    question_id:     z.string().uuid(),
    selected_option: z.enum(['A','B','C','D']).nullable(),
    answered_at:     z.number(),
    idempotency_key: z.string().uuid(),
  })),
  client_timestamp: z.number(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Auth — extract JWT from Authorization header (not cookies)
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createServiceRoleClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  // 2. Parse body
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { submission_id, session_id, answers_snapshot } = parsed.data;

  // 3. Validate submission belongs to this user
  // 4. Upsert answers to staging
  // 5. Mark completed_at if missing
  // 6. Return 200 — browser likely discards response (keepalive)
  return NextResponse.json({ ok: true }, { status: 200 });
}
```

---

### `POST /api/submissions/offline-sync`

**Type:** Route Handler (NOT Server Action)  
**Reason:** Called by Dexie.js background sync worker — not from a React form or user gesture. Background sync contexts cannot invoke Server Actions (which require a React render tree). The endpoint needs to be callable from a plain `fetch()` in a service worker or `online` event handler.

**Auth:** JWT in `Authorization: Bearer <token>` header

**Rate Limit:** 10 requests per student per 60 seconds (sliding window, enforced via in-memory rate limiter on Edge)

---

#### Request

```typescript
interface OfflineSyncRequest {
  session_id:      string;     // UUID — matches submissions.session_id
  answers:         Answer[];   // unsynced answers from Dexie
  hmac_timestamp:  string;     // HMAC-SHA256(session_id + batch_timestamp)
  batch_timestamp: number;     // ms — used for HMAC validation
}
```

#### Success Response

```typescript
// HTTP 200
interface OfflineSyncResponse {
  ok:              true;
  synced_count:    number;    // answers successfully written
  synced_keys:     string[];  // idempotency_keys of synced records
  rejected_keys:   string[];  // keys that failed HMAC or timestamp validation
}
```

#### Error Responses

| HTTP | Body | Condition |
|------|------|-----------|
| 401 | `{ error: 'UNAUTHORIZED' }` | JWT invalid |
| 409 | `{ error: 'ALREADY_SUBMITTED' }` | Session completed_at already set AND new answers provided |
| 422 | `{ error: 'VALIDATION_ERROR' }` | Body malformed |
| 429 | `{ error: 'RATE_LIMITED', retry_after: number }` | > 10 requests / 60s |
| 500 | `{ error: 'INTERNAL_ERROR' }` | Unexpected failure |

#### Side Effects

1. Each answer inserted → `offline_submissions_staging`
2. Call `validate_and_migrate_offline_submission()` RPC per staging row
3. HMAC validation inside RPC — rejected payloads are discarded (staging row deleted, nothing migrated to `student_answers` or `submissions`); rejection logged to `activity_logs` with `action_type = 'OFFLINE_SYNC_REJECTED'`
4. Successful rows migrated → `student_answers` (main table)

#### Idempotency

- `idempotency_key` (UUID v5) on each answer prevents double-processing
- `ON CONFLICT (idempotency_key) DO NOTHING` at DB level
- Repeated calls with same keys: `synced_count = 0`, `synced_keys = []` (not an error)

---

### `GET /api/consent/verify`

**Type:** Route Handler (NOT Server Action)
**Reason:** Called from a URL link in a guardian email — not from a React form or user gesture. Requires a stable, permanent, publicly-accessible URL. No React render tree is available.

**Auth:** Unauthenticated — the token in the query string IS the auth mechanism.

**Rate Limit:** 5 requests per token per hour (prevents link replay attacks)

---

#### Request

```
GET /api/consent/verify?token=<jwt>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string (JWT) | Signed consent verification token from guardian email. Payload contains `{ student_id, guardian_email, exp }`. Signed with `HMAC_SECRET`. |

#### Success Response

```
HTTP 302 → redirect to /student/consent?status=verified
```

The consent page displays: *"Your child's account is now active. They may log in to MINDSPARK."*

#### Error Responses

| HTTP | Redirect | Condition |
|------|----------|-----------|
| 302 | `/student/consent?status=expired` | Token `exp` has passed |
| 302 | `/student/consent?status=invalid` | Token signature invalid |
| 302 | `/student/consent?status=already_verified` | `consent_verified` already true |

All errors redirect (not JSON) — the guardian is a non-technical user following an email link.

#### Side Effects

1. Validate JWT signature using `HMAC_SECRET`
2. Check token `exp` — reject if expired
3. `UPDATE students SET consent_verified = true WHERE id = student_id`
4. `INSERT activity_logs (action_type = 'CONSENT_VERIFIED', target_entity_id = student_id)`
5. Redirect to `/student/consent?status=verified`

#### Idempotency

Safe to call multiple times. If `consent_verified` is already `true`, redirects to `?status=already_verified` — no duplicate DB write.

---

## 5. Server Actions — Assessment Management

### `createAssessment`

```typescript
// src/app/actions/assessments.ts
// Auth: role = 'admin' only

interface CreateAssessmentInput {
  type:          'EXAM' | 'TEST';
  title:         string;
  level_id:      string;
  questions:     QuestionInput[];
  anzan_config?: AnzanConfig;         // TEST type only — optional for EXAM
  duration_minutes?: number;          // null = untimed
}

interface CreateAssessmentOutput {
  assessment_id: string;
}

async function createAssessment(
  input: CreateAssessmentInput
): Promise<ActionResult<CreateAssessmentOutput>>

// Error codes:
//   FORBIDDEN            — caller is not admin
//   VALIDATION_ERROR     — Zod parse failure (title.length, questions.length ≥ 1)
//   NOT_FOUND            — level_id not in caller's institution
//   INVALID_ANZAN_CONFIG — delay_ms < 200 (no neurologist flag)
//   DUPLICATE            — duplicate order_index values in questions array
//   INTERNAL_ERROR       — DB failure

// Side effects:
//   INSERT exam_papers (status = 'DRAFT')
//   INSERT questions (bulk)
//   INSERT anzan_configs (if TEST type)
//   INSERT activity_logs (action = 'CREATE_ASSESSMENT')
```

---

### `updateAssessment`

```typescript
// Auth: role = 'admin' only
// Constraint: CANNOT update if status = 'LIVE' or 'CLOSED'

interface UpdateAssessmentInput {
  assessment_id:    string;
  title?:           string;
  questions?:       QuestionInput[];   // full replace — no partial patch
  anzan_config?:    AnzanConfig;
  duration_minutes?: number | null;
}

async function updateAssessment(
  input: UpdateAssessmentInput
): Promise<ActionResult<{ updated: true }>>

// Error codes:
//   FORBIDDEN            — not admin
//   NOT_FOUND            — assessment not found in institution
//   ASSESSMENT_LOCKED    — status is LIVE or CLOSED
//   VALIDATION_ERROR     — Zod failure
//   INVALID_ANZAN_CONFIG — delay_ms < 200

// Side effects:
//   UPDATE exam_papers SET title, duration_minutes, updated_at
//   DELETE + re-INSERT questions (full replace)
//   UPDATE anzan_configs
//   INSERT activity_logs (action = 'UPDATE_ASSESSMENT')
```

---

### `publishAssessment`

```typescript
// Auth: role = 'admin' only
// Transitions status: DRAFT → PUBLISHED

interface PublishAssessmentInput {
  assessment_id: string;
}

async function publishAssessment(
  input: PublishAssessmentInput
): Promise<ActionResult<{ status: 'PUBLISHED' }>>

// Error codes:
//   FORBIDDEN         — not admin
//   NOT_FOUND         — not in institution
//   ASSESSMENT_LOCKED — already LIVE or CLOSED (cannot publish again)
//   VALIDATION_ERROR  — assessment has 0 questions

// Side effects:
//   UPDATE exam_papers SET status = 'PUBLISHED', updated_at
//   INSERT activity_logs (action = 'PUBLISH_ASSESSMENT')
```

---

### `forceOpenExam`

```typescript
// Auth: role = 'admin' only
// Transitions status:
//   PUBLISHED → LIVE  (standard open)
//   CLOSED → LIVE     (accidental-close recovery — within 10 minutes of closed_at only)

interface ForceOpenExamInput {
  assessment_id: string;
}

async function forceOpenExam(
  input: ForceOpenExamInput
): Promise<ActionResult<{ status: 'LIVE'; opened_at: string }>>

// Error codes:
//   FORBIDDEN               — not admin
//   NOT_FOUND               — not in institution
//   ASSESSMENT_ALREADY_LIVE  — status is already LIVE
//   ASSESSMENT_LOCKED        — status is CLOSED AND more than 10 minutes have passed
//                             since closed_at (reopen window expired)
//   ASSESSMENT_NOT_FOUND     — DRAFT (cannot go LIVE from DRAFT)

// Side effects (PUBLISHED → LIVE):
//   UPDATE exam_papers SET status = 'LIVE', opened_at = NOW()
//   Supabase Broadcast → exam:{assessment_id}: { event: 'exam_live' }
//   INSERT activity_logs (action = 'FORCE_OPEN_EXAM')

// Side effects (CLOSED → LIVE within 10-minute window):
//   UPDATE exam_papers SET status = 'LIVE', closed_at = NULL
//   Supabase Broadcast → exam:{assessment_id}: { event: 'exam_reopened' }
//   INSERT activity_logs (action = 'FORCE_REOPEN_EXAM')
//   Students in assessment engine receive exam_reopened event and resume
```

---

### `forceCloseExam`

```typescript
// Auth: role = 'admin' only
// Transitions status: LIVE → CLOSED
// Forcibly completes all in-progress sessions

interface ForceCloseExamInput {
  assessment_id: string;
}

interface ForceCloseExamOutput {
  status:            'CLOSED';
  affected_sessions: number;   // sessions force-closed
}

async function forceCloseExam(
  input: ForceCloseExamInput
): Promise<ActionResult<ForceCloseExamOutput>>

// Error codes:
//   FORBIDDEN         — not admin
//   NOT_FOUND         — not in institution
//   ASSESSMENT_NOT_LIVE — cannot close if not LIVE

// Side effects:
//   UPDATE exam_papers SET status = 'CLOSED', closed_at = NOW()
//   UPDATE submissions SET completed_at = NOW()
//       WHERE paper_id = assessment_id AND completed_at IS NULL
//   Supabase Broadcast → exam:{assessment_id}: { event: 'exam_closed' }
//   INSERT activity_logs (action = 'FORCE_CLOSE_EXAM')
```

---

## 6. Server Actions — Student Management

### `importStudentsCSV`

```typescript
// Auth: role = 'admin' only
// Row limit: 500 rows per import (enforced server-side)

interface ImportStudentsCSVInput {
  csv_raw:  string;       // raw CSV string — parsed client-side via PapaParse
  level_id: string;
  cohort_id?: string;
  dry_run:  boolean;      // true = validate only, false = insert
}

interface ImportStudentsCSVOutput {
  inserted: number;   // N = all rows (full success) OR 0 (any failure — full rollback)
  errors:   Array<{ row: number; reason: string }>;
}

async function importStudentsCSV(
  input: ImportStudentsCSVInput
): Promise<ActionResult<ImportStudentsCSVOutput>>

// Error codes:
//   FORBIDDEN         — not admin
//   VALIDATION_ERROR  — missing required columns (full_name, roll_number, date_of_birth)
//   QUOTA_EXCEEDED    — > 500 rows
//   NOT_FOUND         — level_id or cohort_id not in institution

// Side effects (dry_run = false):
//   Calls bulk_import_students() RPC (FULL ATOMIC TRANSACTION)
//   If ANY row has duplicate roll_number or validation error:
//     → ENTIRE IMPORT ROLLS BACK. Zero rows inserted. errors[] populated.
//   If ALL rows valid:
//     → INSERT all students atomically. inserted = N. errors = [].
//   INSERT cohort_history rows for each inserted student
//   INSERT activity_logs (action = 'IMPORT_STUDENTS', payload = { count })
```

---

### `createStudent`

```typescript
// Auth: role = 'admin' only

interface CreateStudentInput {
  full_name:      string;
  roll_number:    string;
  date_of_birth?: string;    // ISO 8601
  level_id:       string;
  cohort_id?:     string;
  send_invite:    boolean;   // send welcome email with temp password
}

interface CreateStudentOutput {
  student_id:  string;
  profile_id:  string;    // Supabase Auth user UUID
}

async function createStudent(
  input: CreateStudentInput
): Promise<ActionResult<CreateStudentOutput>>

// Error codes:
//   FORBIDDEN        — not admin
//   DUPLICATE        — roll_number already exists in institution
//   VALIDATION_ERROR — Zod failure
//   NOT_FOUND        — level_id not in institution

// Side effects:
//   supabase.auth.admin.createUser() (service-role)
//   INSERT students
//   INSERT cohort_history (valid_from = NOW(), valid_to = NULL)
//   Supabase Auth invite email (if send_invite = true)
//   INSERT activity_logs (action = 'CREATE_STUDENT')
```

---

### `updateStudent`

```typescript
// Auth: role = 'admin' only

interface UpdateStudentInput {
  student_id:       string;
  full_name?:       string;
  level_id?:        string;
  cohort_id?:       string;    // if changed: closes old cohort_history, opens new
  status?:          'active' | 'suspended' | 'graduated';
  accessibility_flags?: Record<string, boolean>;
}

async function updateStudent(
  input: UpdateStudentInput
): Promise<ActionResult<{ updated: true }>>

// Error codes:
//   FORBIDDEN   — not admin
//   NOT_FOUND   — student not in institution

// Side effects:
//   UPDATE students SET ...
//   If cohort_id changed:
//     UPDATE cohort_history SET valid_to = NOW() WHERE student_id AND valid_to IS NULL
//     INSERT cohort_history (new cohort, valid_from = NOW())
//   INSERT activity_logs (action = 'UPDATE_STUDENT')
```

---

### `deactivateStudent`

```typescript
// Auth: role = 'admin' only
// Soft delete — sets deleted_at; never hard DELETE

interface DeactivateStudentInput {
  student_id: string;
  reason?:    string;    // stored in activity_logs payload
}

async function deactivateStudent(
  input: DeactivateStudentInput
): Promise<ActionResult<{ deactivated: true }>>

// Error codes:
//   FORBIDDEN — not admin
//   NOT_FOUND — student not in institution

// Side effects:
//   UPDATE students SET deleted_at = NOW(), status = 'suspended'
//   UPDATE cohort_history SET valid_to = NOW() WHERE valid_to IS NULL  (close assignment)
//   Supabase Auth: disable user (supabase.auth.admin.updateUserById)
//   INSERT activity_logs (action = 'DEACTIVATE_STUDENT', payload = { reason })
```

---

## 7. Server Actions — Exam Operations

### `initSession`

```typescript
// Auth: role = 'student'
// Creates the assessment_sessions row when student clicks "Begin" in the lobby.
// Must be called before submitAnswer or submitExam.

interface InitSessionInput {
  paper_id: string;   // UUID — the exam_papers row the student is entering
}

interface InitSessionOutput {
  session_id: string;      // UUID — use in all subsequent submitAnswer calls
  expires_at: string;      // ISO timestamp — session expiry (duration_minutes from paper)
  questions:  Array<{      // immutable snapshot — order fixed for this session
    question_id:      string;              // UUID — use in submitAnswer calls
    equation_display: string | null;   // EXAM type
    flash_sequence:   number[] | null; // TEST type
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
  }>;
}

async function initSession(
  input: InitSessionInput
): Promise<ActionResult<InitSessionOutput>>

// Error codes:
//   UNAUTHORIZED         — not logged in
//   FORBIDDEN            — student not enrolled at this institution
//   ASSESSMENT_NOT_LIVE  — paper status is not 'LIVE'
//   ASSESSMENT_NOT_FOUND — paper_id invalid or not in institution
//   ALREADY_SUBMITTED    — student already has a completed session for this paper

// Side effects:
//   INSERT assessment_sessions (paper_id, student_id, expires_at, started_at = NOW())
//   INSERT assessment_session_questions (immutable snapshot copy from exam_papers.questions)
//   INSERT activity_logs (action = 'INIT_SESSION')

// Idempotency:
//   If student already has an active (incomplete) session for this paper:
//   returns existing session_id — does not create a duplicate
```

---

### `submitAnswer`

```typescript
// Auth: role = 'student'
// Called per-question during exam (or queued in Dexie for offline)

interface SubmitAnswerInput {
  session_id:      string;
  question_id:     string;    // UUID — FK → questions(id)
  selected_option: 'A' | 'B' | 'C' | 'D' | null;  // null = skipped
  answered_at:     number;    // client timestamp ms
  idempotency_key: string;    // UUID v5 — deterministic from session+question+timestamp
}

async function submitAnswer(
  input: SubmitAnswerInput
): Promise<ActionResult<{ saved: true }>>

// Error codes:
//   UNAUTHORIZED          — not logged in
//   FORBIDDEN             — student does not own this session
//   SESSION_NOT_FOUND     — session_id invalid
//   SESSION_CLOSED        — sessions.completed_at IS NOT NULL
//   INVALID_QUESTION      — question_id not found in this session's paper
//   INVALID_IDEMPOTENCY_KEY — not valid UUID format

// Side effects:
//   UPSERT student_answers ON CONFLICT (idempotency_key) DO NOTHING
//   (duplicate calls are silently skipped — not an error)

// Idempotency:
//   Same idempotency_key: subsequent calls are no-ops → returns { ok: true, saved: true }
//   Different options for same question: UPSERT replaces selected_option

// Rate limit: none — called per question, high frequency expected
```

---

### `submitExam`

```typescript
// Auth: role = 'student'
// Final submission — marks session complete

interface SubmitExamInput {
  session_id:             string;
  final_answers_snapshot: Answer[];   // full local state for reconciliation
}

interface SubmitExamOutput {
  submitted:    true;
  completed_at: string;   // ISO timestamp — server-generated
}

async function submitExam(
  input: SubmitExamInput
): Promise<ActionResult<SubmitExamOutput>>

// Error codes:
//   UNAUTHORIZED      — not logged in
//   FORBIDDEN         — student does not own this session
//   SESSION_NOT_FOUND — invalid session
//   ALREADY_SUBMITTED — completed_at already set (idempotent — returns ok: true)

// Side effects:
//   UPDATE submissions SET
//     completed_at = NOW(),
//     completion_seal = HMAC(session_id + NOW()),
//     sync_status = 'verified'
//   Bulk upsert answers from snapshot → offline_submissions_staging
//     (catches any answers not yet synced)
//   Supabase Broadcast → exam:{paper_id}: { event: 'submitted', student_id }
//   INSERT activity_logs (action = 'SUBMIT_EXAM')

// Idempotency:
//   If completed_at already set: returns { ok: true, data: { submitted: true, completed_at } }
//   No duplicate submissions possible (UNIQUE session_id on submissions)
```

---

## 8. Server Actions — Results

### `publishResult`

```typescript
// Auth: role = 'admin' OR (role = 'teacher' AND student in teacher's cohort)

interface PublishResultInput {
  session_id: string;
}

interface PublishResultOutput {
  published:            true;
  result_published_at:  string;
}

async function publishResult(
  input: PublishResultInput
): Promise<ActionResult<PublishResultOutput>>

// Error codes:
//   FORBIDDEN          — teacher accessing outside-cohort student
//   NOT_FOUND          — session not found
//   SESSION_NOT_COMPLETE — completed_at IS NULL (can't publish incomplete)
//   VALIDATION_ERROR   — score or grade is NULL (calculate_results not yet run)

// Side effects:
//   UPDATE submissions SET result_published_at = NOW()
//   INSERT activity_logs (action = 'PUBLISH_RESULT')
```

---

### `unpublishResult`

```typescript
// Auth: role = 'admin' only (teachers cannot unpublish)

interface UnpublishResultInput {
  session_id: string;
  reason:     string;   // mandatory — stored in activity_logs
}

async function unpublishResult(
  input: UnpublishResultInput
): Promise<ActionResult<{ unpublished: true }>>

// Error codes:
//   FORBIDDEN — caller is not admin
//   NOT_FOUND — session not in institution

// Side effects:
//   UPDATE submissions SET result_published_at = NULL
//   INSERT activity_logs (action = 'UNPUBLISH_RESULT', payload = { reason })
```

---

### `reEvaluateResults`

```typescript
// Auth: role = 'admin' only
// Recalculates all scores for a paper — unpublishes all results

interface ReEvaluateResultsInput {
  assessment_id: string;
  reason:        string;   // mandatory audit trail
}

interface ReEvaluateResultsOutput {
  recalculated_sessions: number;
}

async function reEvaluateResults(
  input: ReEvaluateResultsInput
): Promise<ActionResult<ReEvaluateResultsOutput>>

// Error codes:
//   FORBIDDEN           — not admin
//   ASSESSMENT_NOT_CLOSED — can only re-evaluate after status = 'CLOSED'
//   NOT_FOUND           — assessment not in institution

// Side effects:
//   Calls calculate_results(p_paper_id := input.assessment_id) RPC — recomputes is_correct + score + grade
//   UPDATE submissions SET result_published_at = NULL (all sessions — must re-publish)
//   INSERT activity_logs (action = 'RE_EVALUATE_RESULTS', payload = { reason, count })
```

---

## 9. Server Actions — Admin

### `createAnnouncement`

```typescript
// Auth: role = 'admin' only

interface CreateAnnouncementInput {
  title:            string;
  body_html:        string;      // server-side sanitized with sanitize-html
  target_level_id?: string;      // null = all levels
  publish_now:      boolean;     // true = set published_at immediately
}

interface CreateAnnouncementOutput {
  announcement_id: string;
  published_at:    string | null;
}

async function createAnnouncement(
  input: CreateAnnouncementInput
): Promise<ActionResult<CreateAnnouncementOutput>>

// Error codes:
//   FORBIDDEN        — not admin
//   VALIDATION_ERROR — title empty or body_html empty after sanitization
//   NOT_FOUND        — target_level_id not in institution

// Side effects:
//   Sanitize body_html server-side (sanitize-html library, allowlist tags)
//   INSERT announcements
//   INSERT activity_logs (action = 'CREATE_ANNOUNCEMENT')
```

---

### `updateSettings`

```typescript
// Auth: role = 'admin' only

interface UpdateSettingsInput {
  session_timeout_seconds?: number;   // 900–86400
  timezone?:                string;   // valid IANA timezone
  logo_url?:                string;   // Supabase Storage URL
  grade_boundaries?:        Array<{
    assessment_type: 'EXAM' | 'TEST' | 'ALL';
    min_score:       number;
    max_score:       number;
    grade:           string;
    label?:          string;
  }>;
}

async function updateSettings(
  input: UpdateSettingsInput
): Promise<ActionResult<{ updated: true }>>

// Error codes:
//   FORBIDDEN        — not admin
//   VALIDATION_ERROR — session_timeout out of range, invalid timezone, grade overlap

// Side effects:
//   UPDATE institutions SET session_timeout_seconds, timezone, logo_url
//   If grade_boundaries provided:
//     DELETE grade_boundaries WHERE institution_id = caller's institution
//     INSERT grade_boundaries (full replace — no partial patch)
//   INSERT activity_logs (action = 'UPDATE_SETTINGS')

// Validation:
//   Grade boundaries must be non-overlapping (no score can match two grades)
//   Must cover 0–100 range entirely (no gap allowed)
//   Validated in application layer before DB write
```

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All 3 Route Handlers documented with rationale | ✅ §4 — comparison table + teardown + offline-sync + consent/verify |
| Core Server Actions documented with TypeScript signatures | ✅ §5–§9 — 16 of 28 actions; remaining 12 use same patterns (see src/app/actions/) |
| Error codes documented, no raw DB errors | ✅ §2 — full taxonomy + sanitization pattern |
| Idempotency for teardown + offline-sync | ✅ §4 — both endpoints |
| Rate limits documented where applicable | ✅ offline-sync: 10/60s · teardown: 1/session |
| Route Handler vs Server Action decision rule | ✅ §1 — comparison table |
| Auth documented per endpoint | ✅ every endpoint |
| Side effects documented | ✅ every endpoint |
