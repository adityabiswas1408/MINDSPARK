# MINDSPARK — API Error Code & Troubleshooting Catalog

> **Audience:** Frontend Developers, QA Engineers, API Integrators  
> **Read First:** [`docs/12_api-contracts.md`](12_api-contracts.md) · [`CONSTRAINTS.md`](../CONSTRAINTS.md)

---

## 1. Error Response Contract

All Next.js Server Actions return a standardized typed union `ActionResult<T>`:

```typescript
export type ActionResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; details?: Record<string, unknown> };
```

Route Handlers return JSON payloads with standard HTTP status codes:

```typescript
// Error response from Route Handlers
{ "ok": false, "error": "Descriptive error message", "code": "ERROR_ENUM" }
```

---

## 2. Standard Error Code Dictionary

### 2.1 Authentication & Authorization Errors

| Error Code | HTTP / Status | Root Cause | Client Handling Action |
|:---|:---:|:---|:---|
| `UNAUTHORIZED` | 401 | Session missing, expired, or invalid JWT. | Redirect user to `/login` with return URL query param. |
| `FORBIDDEN` | 403 | Authenticated user lacks required role (`admin`, `teacher`, `student`). | Redirect student attempting to access `/admin` to `/student/dashboard`. |
| `CONSENT_REQUIRED` | 403 | Minor student profile has `consent_verified = false`. | Redirect to `/student/consent` screen. |
| `ACCOUNT_LOCKED` | 423 | Too many failed login attempts (5+). | Display countdown timer indicating remaining lockout duration (15 min). |

---

### 2.2 Examination & Session Lifecycle Errors

| Error Code | HTTP / Status | Root Cause | Client Handling Action |
|:---|:---:|:---|:---|
| `EXAM_NOT_LIVE` | 400 | Student attempted to enter assessment before admin set status to `LIVE`. | Display pre-live read-only info card with countdown to scheduled start. |
| `SESSION_EXPIRED` | 410 | Assessment timer reached 0 and grace period elapsed. | Force exam completion screen and trigger final sync. |
| `DUPLICATE_SUBMISSION` | 409 | Submission already recorded for `(session_id, student_id)`. | Redirect to `/student/results/[submissionId]`. |
| `IDEMPOTENCY_COLLISION` | 200 / 409 | Re-submission of an identical `idempotency_key`. | Idempotent success response; returns existing record without throwing error. |
| `COOLDOWN_ACTIVE` | 429 | Answer tapped within 1,200ms input cooldown period. | Client debounces and discards subsequent rapid taps. |

---

### 2.3 Offline Sync & Cryptographic Errors

| Error Code | HTTP / Status | Root Cause | Client Handling Action |
|:---|:---:|:---|:---|
| `HMAC_MISMATCH` | 401 | Payload seal does not match server-computed HMAC using `HMAC_SECRET`. | Reject payload migration; log `HMAC_REJECTION` in `activity_logs`. |
| `CLOCK_TAMPERING_DETECTED` | 200 / Flag | Client timestamp deviates > 30s from monotonic time sequence. | Flag submission in `activity_logs` (`CLOCK_GUARD_FLAG`), accept answers under benefit-of-doubt rule. |
| `PAYLOAD_CORRUPT` | 422 | Staged answer payload fails Zod schema validation. | Queue for client re-serialization from Dexie 4. |

---

### 2.4 Administrative & Configuration Errors

| Error Code | HTTP / Status | Root Cause | Client Handling Action |
|:---|:---:|:---|:---|
| `GRADE_OVERLAP` | 400 | Configured grade boundary min/max ranges overlap existing grade. | Highlight conflicting range rows in red in Grade Boundary Editor. |
| `SEQUENCE_CONFLICT` | 409 | Level sequence order conflicts with existing active level. | Trigger two-phase offset update to reorder levels safely. |
| `CSV_PARSE_ERROR` | 422 | Uploaded student roster CSV missing required columns (`roll_number`, `first_name`, `dob`). | Display error badge in CSV Import Wizard showing problematic line numbers. |

---

## 3. Client Error Handling Best Practices

1. **User-Friendly Notifications:** Always use sonner toasts or inline semantic warning pills. Never call browser native `alert()`.
2. **Offline Queuing:** If a network mutation fails due to connection drop, catch error, write to Dexie `mindspark_offline_db`, and emit `'offline'` event.
3. **No Unhandled Rejections:** Every Server Action call inside React components must handle `{ ok: false }` branch explicitly.
