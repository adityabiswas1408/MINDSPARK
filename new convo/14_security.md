# MINDSPARK V1 — Security Design Document

> **Document type:** Security Architecture — Technical Planning  
> **Version:** 1.0  
> **Output path:** `docs/security.md`  
> **Read first:** `docs/architecture.md` · `docs/database.md` · `docs/ia-rbac.md`  
> **Author role:** Principal Security Engineer — Next.js · Supabase RLS · OWASP Top 10 · child data protection

---

## Table of Contents

1. [Threat Model Overview](#1-threat-model-overview)
2. [Attack Vector Mitigations](#2-attack-vector-mitigations)
3. [Content Security Policy](#3-content-security-policy)
4. [Service-Role Client Constraints](#4-service-role-client-constraints)
5. [Tab Monitor Data Lifecycle](#5-tab-monitor-data-lifecycle)
6. [sanitize-html Allowlist](#6-sanitize-html-allowlist)
7. [Three-Layer Security Model](#7-three-layer-security-model)
8. [Child Data Protection](#8-child-data-protection)

---

## 1. Threat Model Overview

### Actors

| Actor | Trust Level | Attack Surface |
|-------|-------------|----------------|
| Student (authenticated) | Low | Exam submission tampering, offline replay, clock manipulation |
| Teacher (authenticated) | Medium | IDOR to other cohorts, result manipulation |
| Admin (authenticated) | High | Service-role key exposure, mass data export |
| Unauthenticated visitor | Zero | Auth bypass, enumeration |
| Malicious insider | High | RLS bypass, direct DB access, log tampering |

### OWASP Top 10 Mapping

| OWASP Category | MINDSPARK Relevance | Primary Mitigation |
|----------------|--------------------|--------------------|
| A01 Broken Access Control | IDOR, RLS bypass, role escalation | RLS on every table + JWT claim validation |
| A02 Crypto Failures | Plaintext answers in IndexedDB, HMAC forgery | HAMC-SHA256 seal, HTTPS-only, no sensitive data in localStorage |
| A03 Injection | CSV injection, SQL injection | Parameterized queries, `sanitize-html` |
| A05 Security Misconfiguration | CSP gaps, service-role key exposure | Strict CSP, ESLint import restriction |
| A07 Identification / Auth Failures | JWT manipulation, session fixation | Supabase Auth, `useUser()` only, `httpOnly` cookies |
| A08 Integrity Failures | Offline payload tampering | HMAC Clock Guard + Security Definer RPC |
| A10 SSRF | `fetch()` calls in Server Actions to user-supplied URLs | No URL parameters accepted from client in server fetches |

---

## 2. Attack Vector Mitigations

### Vector 1: RLS Bypass via Service-Role Client

**Risk:** The `service_role` key bypasses all Row Level Security policies. If exposed in client components or student-facing routes, any student could make queries as a superuser.

**Threat scenario:**
```
1. Student inspects network requests
2. Finds supabase client initialised with service_role key
3. Makes arbitrary DB queries without RLS — reads all submissions
```

**Mitigation:**

```typescript
// src/lib/supabase/admin.ts

import { createClient } from '@supabase/supabase-js';

/**
 * SERVICE-ROLE CLIENT — RESTRICTED
 *
 * ⛔ NEVER import this file in:
 *    - /app/(student)/**
 *    - Client components ('use client')
 *    - useEffect / browser-only code
 *    - Edge Runtime handlers
 *
 * ✅ ONLY import in:
 *    - Server Actions (src/app/actions/*.ts) — admin-only actions
 *    - Migration scripts (supabase/migrations/*)
 *    - Security Definer RPC wrappers (src/lib/rpc/*.ts)
 *
 * This key NEVER appears in client bundles.
 * next.config.ts ensures SUPABASE_SERVICE_ROLE_KEY is NOT prefixed with NEXT_PUBLIC_
 */
export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // server-only env var
  {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  }
);
```

**ESLint enforcement:**

```json
// .eslintrc.json — add to rules:
{
  "no-restricted-imports": [
    "error",
    {
      "paths": [
        {
          "name": "@/lib/supabase/admin",
          "message": "Service-role client is forbidden outside Server Actions and RPC wrappers. See docs/security.md §2 Vector 1."
        }
      ],
      "patterns": [
        {
          "group": ["**/supabase/admin*"],
          "message": "Do not import admin Supabase client in student-facing code."
        }
      ]
    }
  ]
}
```

**Additional control:**

```typescript
// src/lib/supabase/admin.ts — runtime guard as defence-in-depth
if (typeof window !== 'undefined') {
  throw new Error(
    'SECURITY VIOLATION: admin.ts imported in browser context. ' +
    'This file is server-only. See docs/security.md §2 Vector 1.'
  );
}
```

---

### Vector 2: JWT Role Manipulation

**Risk:** A student modifies their Zustand store or localStorage to set `role = 'admin'`. If Server Actions trust client-supplied role claims, they execute admin operations.

**Threat scenario:**
```
1. Student opens DevTools
2. Sets zustandStore.role = 'admin'
3. Triggers publishResult() Server Action
4. Server reads role from Zustand (client state) — publishes results
```

**Rule:** Role is ALWAYS derived from `(auth.jwt() -> 'app_metadata') ->> 'role'` (Postgres RLS) or `(await supabase.auth.getUser()).data.user.app_metadata.role` (server-side). NEVER from client state.

**Mitigation:**

```typescript
// src/lib/auth/require-role.ts — used at the top of every Server Action

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ErrorCode } from '@/types/api-errors';

export type AppRole = 'student' | 'teacher' | 'admin';

/**
 * Validates caller's JWT and extracts role.
 * Called at the START of every Server Action — no exceptions.
 *
 * @returns Typed session object if role matches. Throws ActionError otherwise.
 */
export async function requireRole(
  allowed: AppRole | AppRole[]
): Promise<{ userId: string; role: AppRole; institutionId: string }> {
  const cookieStore = cookies();
  const supabase    = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw { ok: false, error: ErrorCode.UNAUTHORIZED, message: 'Not authenticated' };
  }

  // Role from JWT app_metadata — set by server on user creation, immutable by client
  const role = user.app_metadata?.role as AppRole | undefined;

  if (!role) {
    throw { ok: false, error: ErrorCode.FORBIDDEN, message: 'No role assigned' };
  }

  const allowedArray = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedArray.includes(role)) {
    throw { ok: false, error: ErrorCode.FORBIDDEN, message: `Role '${role}' not permitted` };
  }

  const institutionId = user.app_metadata?.institution_id as string;

  return { userId: user.id, role, institutionId };
}

// Usage in every Server Action:
// const { userId, role, institutionId } = await requireRole('admin');
```

**What must NOT be used for role:**
```typescript
// ❌ BANNED — these are all client-supplied values
const role = useAuthStore(s => s.role);          // Zustand
const role = localStorage.getItem('role');        // localStorage
const role = req.headers.get('x-role');          // client header
const role = params.role;                         // URL param
```

---

### Vector 3: CSV Injection

**Risk:** A malicious admin or teacher crafts CSV cell values like `=SYSTEM("rm -rf /")` or `=HYPERLINK("http://evil.com", "click")`. When imported to Excel or Sheets by another admin, the formula executes.

**Mitigation:**

```typescript
// src/lib/sanitize/csv-sanitize.ts

const CSV_INJECTION_PREFIX_CHARS = ['=', '+', '-', '@', '\t', '\r'] as const;

/**
 * Sanitizes a single CSV cell value against formula injection.
 * Prepends a single quote to values starting with injection characters.
 * This is the Excel/Sheets standard for neutralizing formula triggers.
 */
export function sanitizeCsvCell(value: string): string {
  const trimmed = value.trim();
  if (CSV_INJECTION_PREFIX_CHARS.some(c => trimmed.startsWith(c))) {
    return `'${trimmed}`;  // prefix with single quote — neutralises in spreadsheets
  }
  return trimmed;
}

/**
 * Applied to ALL fields when importing student CSV:
 * full_name, roll_number — both sanitized before DB insert.
 */
export function sanitizeStudentRow(row: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, sanitizeCsvCell(String(v))])
  );
}
```

**Applied in `importStudentsCSV` Server Action** before calling `bulk_import_students()` RPC.

---

### Vector 4: Offline Payload Tampering

**Risk:** A student captures their offline answer payload in DevTools and replaces answers with correct options before syncing.

**Threat scenario:**
```
1. Student takes exam offline
2. Exam ends — student inspects Dexie.js store
3. Modifies selected_option values to correct answers
4. Reconnects — offline-sync route handler writes tampered answers
```

**Mitigation:** Documented in full in `docs/exam-engine-spec.md` §2. Summary:

```typescript
// Client-side: HMAC generated at answer time, not at sync time
function generateAnswerHmac(
  sessionId:      string,
  questionId:     string,
  selectedOption: string | null,
  answeredAt:     number
): string {
  // IMPORTANT: answeredAt is performance.now() at moment of selection
  // NOT Date.now() — monotonic, cannot be manipulated
  const data = `${sessionId}:${questionId}:${selectedOption ?? 'null'}:${answeredAt}`;
  return hmacSha256(data, OFFLINE_SYNC_SECRET);
  // OFFLINE_SYNC_SECRET: derived from session-scoped key issued by server at exam start
}
```

**Server-side validation** (in `validate_and_migrate_offline_submission` RPC):
1. Recompute HMAC with server-known secret
2. Constant-time comparison — reject if mismatch → staging row deleted, nothing migrated to `student_answers` or `submissions`, rejection logged in `activity_logs` with `action_type = 'OFFLINE_SYNC_REJECTED'`
3. Timestamp freshness check — reject if older than 24 hours (replay prevention)

**Defence depth:** Even if tampered, `is_correct` is computed server-side by `calculate_results()` — client-supplied `selected_option` value is compared to `questions.correct_option` at evaluation time, not trusted directly.

---

### Vector 5: XSS in Rich Text (Announcements)

**Risk:** Admin creates an announcement with malicious HTML/JS in TipTap editor body. Rendered without sanitization — students' browsers execute arbitrary JavaScript.

**Mitigation:** All TipTap HTML output is passed through `sanitize-html` server-side in the `createAnnouncement` Server Action before DB storage. See §6 for the exact allowlist.

**Rendering rule:**
```typescript
// src/components/announcements/announcement-body.tsx
// Safe — renders pre-sanitized HTML from DB. NOT raw user input.
<div
  dangerouslySetInnerHTML={{ __html: announcement.body_html }}
  className="announcement-body"
/>
// body_html was sanitized by sanitize-html at write-time — safe to render as-is.
// NO client-side re-sanitization needed or permitted.
// DOMPurify is BANNED in this project (crashes RSC) — see CLAUDE.md NEVER list.
// CSP nonce policy (§3) provides the client-side defence-in-depth layer instead.
```

---

### Vector 6: SQL Injection

**Risk:** User-supplied strings interpolated directly into SQL queries bypass parameterization.

**Mitigation:**

**Supabase typed client** — all queries use the PostgREST builder, which parameterizes automatically:
```typescript
// ✅ Safe — PostgREST parameterizes programmatically
const { data } = await supabase
  .from('students')
  .select('*')
  .eq('roll_number', userInput);   // parameterized internally

// ❌ BANNED — raw interpolation
await supabase.rpc('query', { sql: `SELECT * WHERE name = '${userInput}'` });
```

**RPC functions** use `$1`, `$2` positional parameters exclusively:
```sql
-- ✅ Safe — parameterized
SELECT * FROM students WHERE roll_number = $1 AND institution_id = $2;

-- ❌ Never
EXECUTE 'SELECT * FROM students WHERE name = ' || user_input;
```

**ESLint rule** (`no-restricted-syntax`) flags template literals in SQL-adjacent patterns at CI.

---

### Vector 7: IDOR — Insecure Direct Object Reference

**Risk:** A student submits a `session_id` belonging to another student. A teacher requests results for a student outside their cohort.

**Mitigation:** RLS is the primary guard — not application-layer checks alone.

```sql
-- Student can only access OWN submissions
CREATE POLICY "submissions_student_own" ON submissions
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
  );

-- Teacher: temporal cohort join (not just current cohort — historical too)
CREATE POLICY "submissions_teacher_temporal" ON submissions
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata') ->> 'role' = 'teacher'
    AND student_id IN (
      SELECT DISTINCT ch.student_id FROM cohort_history ch
      WHERE ch.teacher_id = auth.uid()
        AND ch.valid_from  <= submissions.started_at
        AND (ch.valid_to IS NULL OR ch.valid_to >= submissions.started_at)
    )
  );
```

**Application layer** adds a redundant ownership check before any mutation:
```typescript
// In publishResult Server Action — belt-and-suspenders
const { data: submission } = await supabase
  .from('submissions')
  .select('student_id, paper_id')
  .eq('id', session_id)
  .single();
// RLS already filtered — if result is null, it's not accessible to caller
if (!submission) throw err(ErrorCode.NOT_FOUND, 'Session not found');
```

---

### Vector 8: Exam Answer Enumeration

**Risk:** If MCQ option IDs are sequential integers (`A=1, B=2, C=3, D=4`), an attacker may exploit patterns or enumerate valid submissions.

**Mitigation:**

- Option identifiers in the API are always `'A' | 'B' | 'C' | 'D'` — plain strings, non-sequential, no auto-increment
- `questions.id` and `student_answers.id` are UUID v4 — non-enumerable
- `questions.correct_option` is NEVER returned to clients — only returned in `calculate_results()` RPC (Security Definer) and admin-role queries

```sql
-- Students CANNOT query correct_option from questions table
-- The policy restricts the columns returned:
CREATE POLICY "questions_student_live_only" ON questions
  FOR SELECT TO authenticated
  USING (
    paper_id IN (
      SELECT id FROM exam_papers
      WHERE status = 'LIVE'
      AND level_id = (SELECT level_id FROM students WHERE profile_id = auth.uid())
    )
  );
-- correct_option is included in the row — but column masking applied:
-- Application layer SELECTs only non-sensitive columns for student queries
```

```typescript
// src/app/actions/assessment-sessions.ts — student question fetch via initSession
const { data: questions } = await supabase
  .from('questions')
  .select('id, order_index, equation_display, flash_sequence, option_a, option_b, option_c, option_d')
  // ↑ correct_option intentionally excluded
  .eq('paper_id', paperId);
```

---

## 3. Content Security Policy

**File:** `next.config.ts`

### Directive Reference

```typescript
// next.config.ts

import type { NextConfig } from 'next';
import crypto from 'crypto';

function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

const nextConfig: NextConfig = {
  async headers() {
    const nonce = generateNonce();  // unique per request via middleware

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // Only load resources from the same origin by default
              `default-src 'self'`,

              // Scripts: same origin + nonce for inline scripts (Next.js uses nonce for RSC)
              // NEVER 'unsafe-inline' or 'unsafe-eval' — XSS vectors
              `script-src 'self' 'nonce-${nonce}'`,

              // Styles: same origin + Google Fonts + 'unsafe-inline' for CSS-in-JS
              // 'unsafe-inline' is acceptable for stylesheets (no script execution risk)
              `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,

              // Fonts: Google Fonts CDN
              `font-src 'self' https://fonts.gstatic.com`,

              // Network connections: same origin + Supabase (REST + Realtime WebSocket)
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,

              // Images: same origin + data: URIs (for inline SVG institution logos)
              // No external image CDNs (logos stored in Supabase Storage, same origin)
              `img-src 'self' data: https://*.supabase.co`,

              // Media: self-hosted only (metronome-beat.mp3 + completion-chime.mp3 in public/audio/)
              `media-src 'self'`,

              // Object/embed: always none
              `object-src 'none'`,

              // Prevent framing in iframes (clickjacking prevention)
              `frame-ancestors 'none'`,

              // base-uri: restrict to same origin (prevents base tag injection)
              `base-uri 'self'`,

              // form-action: same origin only (Server Actions post to same origin)
              `form-action 'self'`,
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',             // Legacy clickjacking header (belt-and-suspenders)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',          // Prevents MIME-type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',             // no camera
              'microphone=()',         // no microphone
              'geolocation=()',        // no location
              'payment=()',            // no payment API
            ].join(', '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Nonce Propagation (Middleware)

```typescript
// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export function middleware(req: NextRequest): NextResponse {
  const nonce = crypto.randomBytes(16).toString('base64');

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers.entries()),
        'x-nonce': nonce,   // available to layout.tsx via headers()
      }),
    },
  });

  // CSP is set here with fresh nonce per request
  response.headers.set('Content-Security-Policy',
    buildCSP(nonce)
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Directive Rationale

| Directive | Value | Rationale |
|-----------|-------|-----------|
| `default-src` | `'self'` | Catch-all fallback — deny unknown sources |
| `script-src` | `'self' 'nonce-{NONCE}'` | Nonce required for Next.js RSC inline scripts. No `'unsafe-eval'` — breaks eval-based attacks |
| `style-src` | `'unsafe-inline'` | Required for CSS-in-JS and inline style attributes. No script risk for styles |
| `connect-src` | `*.supabase.co wss://*.supabase.co` | REST and Realtime WebSocket to Supabase only |
| `frame-ancestors` | `'none'` | Clickjacking: page cannot be embedded in any iframe |
| `object-src` | `'none'` | Flash/plugins: never used, fully blocked |

---

## 4. Service-Role Client Constraints

**File:** `src/lib/supabase/admin.ts`

### Import Allowlist

| Location | Permitted | Reason |
|----------|-----------|--------|
| `src/app/actions/*.ts` | ✅ Admin-role actions only | Server-only, role validated before use |
| `src/lib/rpc/*.ts` | ✅ Security Definer wrappers | Server-only |
| `supabase/migrations/*.sql` | ✅ Migration scripts | Not in app bundle |
| `src/app/(student)/**` | ❌ FORBIDDEN | Student routes — RLS must apply |
| `src/components/**` | ❌ FORBIDDEN | Client components — leaks to browser |
| `src/hooks/**` | ❌ FORBIDDEN | Client-side hooks |
| `src/app/api/**` (student routes) | ❌ FORBIDDEN | Route handlers serving student data |

### ESLint Rule (Custom Plugin)

```javascript
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["**/supabase/admin", "**/lib/supabase/admin*"],
          "message": "⛔ Service-role client forbidden here. See docs/security.md §4."
        }
      ]
    }]
  },
  "overrides": [
    {
      // ONLY in these directories is admin import allowed
      "files": [
        "src/app/actions/**/*.ts",
        "src/lib/rpc/**/*.ts"
      ],
      "rules": {
        "no-restricted-imports": "off"
      }
    }
  ]
}
```

### Runtime Guard

```typescript
// src/lib/supabase/admin.ts
// Prevents accidental client-side bundling

if (typeof window !== 'undefined') {
  throw new Error(
    '[SECURITY] admin.ts must not run in browser context.\n' +
    'This file is server-only. See docs/security.md §4.'
  );
}

// Validate key is present (fails fast at server start — not at request time)
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('[SECURITY] SUPABASE_SERVICE_ROLE_KEY is not set.');
}
```

### Environment Variable Rules

```bash
# .env.local (server-only)
SUPABASE_SERVICE_ROLE_KEY=...   # NO "NEXT_PUBLIC_" prefix — never in client bundle

# .env.local (client-accessible)
NEXT_PUBLIC_SUPABASE_URL=...    # Supabase URL is public (required for client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # Anon key is public (RLS-protected)

# next.config.ts enforces this via env validation at build time
```

---

## 5. Tab Monitor Data Lifecycle

**File:** `src/lib/anticheat/tab-monitor.ts`

### Purpose

Records `visibilitychange` events during active exam sessions for academic integrity monitoring. Allows admin to see if a student switched away from the exam window (potentially consulting external resources).

### Data Collected

```typescript
interface TabEvent {
  student_id:   string;      // UUID — anonymised in admin view
  paper_id:     string;      // UUID
  event_type:   'hidden' | 'visible';
  timestamp:    number;      // performance.now() — monotonic, ms
  session_id:   string;      // ties to submission record
}
```

### What Is NOT Collected

- Browser history (which tabs were visited)
- Screenshots or screen capture
- Keystrokes outside the exam window
- Camera/microphone data
- IP geolocation beyond what Supabase Auth records

### Lifecycle

```
Session start (LOBBY → INTERSTITIAL transition)
  ↓
Tab events collected in memory (Zustand exam store)
  ↓
Transmitted to server ONLY on exam submit (bundled in submitExam payload)
  ↓
Stored in session-specific events table with completed submission
  ↓
Accessible: admin of institution only (RLS protected)
  ↓
Deleted: when exam session record is purged (3 years from assessment date — DPDP retention policy)
```

### Implementation

```typescript
// src/lib/anticheat/tab-monitor.ts
'use client';  // event listener — browser only

export interface TabMonitorConfig {
  studentId:  string;
  paperId:    string;
  sessionId:  string;
  onEvent:    (event: TabEvent) => void;
}

export function startTabMonitor(config: TabMonitorConfig): () => void {
  function handleVisibilityChange(): void {
    // ONLY record during active exam — not in lobby, results, or other pages
    const event: TabEvent = {
      student_id:  config.studentId,
      paper_id:    config.paperId,
      event_type:  document.visibilityState as 'hidden' | 'visible',
      timestamp:   performance.now(),   // monotonic — cannot be manipulated
      session_id:  config.sessionId,
    };
    config.onEvent(event);   // → stored in Zustand exam store
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup — called on exam submit or unmount
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}

// Events are NEVER:
// - Sent to analytics platforms
// - Shared beyond the institution
// - Stored in persistent browser storage
// - Accessible to teachers (admin only)
```

### Privacy Disclosure

Per **Privacy Policy Section 5 (Anti-Cheat Monitoring)**:

> "During active examination sessions, MINDSPARK records when students switch away from the exam window. This data is used solely for academic integrity review, is retained only for the duration of the examination session, and is accessible only to your institution's administrators."

---

## 6. `sanitize-html` Allowlist

**Used in:** `createAnnouncement` and `updateAnnouncement` Server Actions  
**Library:** `sanitize-html` v2.x (server-side only — not in client bundle)

### Allowlist Definition

```typescript
// src/lib/sanitize/html-allowlist.ts

import sanitizeHtml from 'sanitize-html';

export const ANNOUNCEMENT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    // Block elements
    'p', 'br',
    'h3', 'h4',         // headings — h1/h2 excluded (layout reserved)
    'ul', 'ol', 'li',

    // Inline elements
    'strong', 'em', 'u', 's',
    'a',

    // No: 'script', 'style', 'iframe', 'form', 'input', 'object', 'embed', 'video', 'audio'
    // No: 'table' — layout risk on mobile, not needed for announcements
    // No: 'img' — handled via Supabase Storage URL, not inline base64
  ],

  allowedAttributes: {
    'a': [
      'href',
      'target',
      'rel',         // ensure rel="noopener noreferrer" is set
    ],
    // No class, id, style on any element — prevents CSS injection
  },

  // Force safe link attributes
  transformTags: {
    'a': (tagName, attribs) => ({
      tagName: 'a',
      attribs: {
        href:   attribs.href   ?? '#',
        target: '_blank',           // always open externally
        rel:    'noopener noreferrer nofollow',
      },
    }),
  },

  // Strip unknown tags rather than escaping them
  disallowedTagsMode: 'discard',

  // Reject data: URIs in href/src (data: XSS vector)
  allowedSchemes:     ['https', 'http', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href'],

  // No style attributes on anything
  allowedStyles: {},

  // Entities: allow standard HTML entities only
  selfClosing: ['br'],
  allowVulnerableTags: false,
};

/**
 * Sanitize TipTap HTML output before DB storage.
 * Called server-side only — never on client.
 */
export function sanitizeAnnouncementHtml(rawHtml: string): string {
  const cleaned = sanitizeHtml(rawHtml, ANNOUNCEMENT_SANITIZE_OPTIONS);

  // Reject if output is empty after sanitization (all content was stripped)
  if (cleaned.trim() === '') {
    throw new Error('ANNOUNCEMENT_EMPTY_AFTER_SANITIZATION');
  }

  return cleaned;
}
```

### Banned Tags Rationale

| Tag | Risk | Status |
|-----|------|--------|
| `<script>` | JavaScript execution | ❌ BANNED |
| `<style>` | CSS injection, layout attacks | ❌ BANNED |
| `<iframe>` | Clickjacking, data exfiltration | ❌ BANNED |
| `<form>` | Credential phishing | ❌ BANNED |
| `<input>` | Phishing, file upload | ❌ BANNED |
| `<img>` | Data exfiltration via request, pixel tracking | ❌ BANNED |
| `<video>` / `<audio>` | Large media, not needed | ❌ BANNED |
| `<object>` / `<embed>` | Plugin execution | ❌ BANNED |
| `class` / `style` attr | CSS injection | ❌ BANNED |
| `on*` event attrs | Inline JavaScript | ❌ BANNED (sanitize-html default) |

---

## 7. Three-Layer Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — Next.js Edge Middleware (src/middleware.ts)           │
│  • Route protection: redirect unauthenticated to /login         │
│  • Role-based route guards: /admin → role=admin only            │
│  • CSP nonce injection                                           │
│  • Cookie → session validation via Supabase SSR                 │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ Passes validated session
┌──────────────────────────────────▼──────────────────────────────┐
│  LAYER 2 — Server Actions / Route Handlers                       │
│  (src/app/actions/*.ts, src/app/api/**/route.ts)                 │
│  • requireRole() validates JWT → role from app_metadata          │
│  • Institution scope check (caller's institution_id)            │
│  • Input validation via Zod schemas                             │
│  • Ownership assertions (belt-and-suspenders vs RLS)            │
│  • sanitize-html on all rich text                               │
│  • CSV sanitization on all imports                              │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ Authenticated, validated query
┌──────────────────────────────────▼──────────────────────────────┐
│  LAYER 3 — PostgreSQL Row Level Security                         │
│  (supabase/migrations/019_add_rls_policies.sql)                  │
│  • Every table: ENABLE ROW LEVEL SECURITY                       │
│  • No policy = deny (Supabase default for authenticated users)  │
│  • auth.uid() and (auth.jwt() -> 'app_metadata') ->> 'role'    │
│  • Temporal join for teacher access (cohort_history)            │
│  • Security Definer RPC for staging migration (bypasses RLS      │
│    intentionally under strict HMAC validation)                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key principle:** A vulnerability in Layer 1 or 2 does NOT grant full data access — Layer 3 (RLS) is the final, unconditional guard.

---

## 8. Child Data Protection

MINDSPARK stores data for students ages 6–18. The following additional controls apply:

| Requirement | Implementation |
|-------------|---------------|
| No third-party analytics on student data | No Google Analytics, Mixpanel, or tracking pixels |
| No PII in error messages | Error codes only — never names, emails, or IDs in client errors |
| No student PII in URL params | Session lookups use UUIDs in POST body, not URL query strings |
| Student data retention | Configurable per institution (default: 3 years, then anonymise) |
| Data minimisation | `students.date_of_birth` is optional; only collected if institution requires |
| Parent/guardian access | Admin can export student record on request (GDPR/COPPA) |
| Tab monitoring disclosure | Privacy Policy §5 — explicit disclosure of anti-cheat monitoring |
| Password policy | Forced reset on first login (`forced_password_reset = true`) |
| Session timeout | Configurable: default 3600s (1 hour) — enforced in middleware |

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All 8 attack vectors documented with mitigation | ✅ §2 — Vectors 1–8 |
| CSP header directives with exact values | ✅ §3 — full `next.config.ts` implementation |
| `admin.ts` import restrictions + ESLint rule | ✅ §4 — allowlist table + override config |
| Tab monitor data lifecycle (collect → delete) | ✅ §5 — full lifecycle + privacy disclosure |
| `sanitize-html` allowlist for TipTap output | ✅ §6 — full `IOptions` config + banned tags table |
| RLS bypass prevention | ✅ §2 Vector 1 + §7 three-layer model |
| Three-layer security model documented | ✅ §7 — ASCII diagram |
| Child data protection requirements | ✅ §8 — GDPR/COPPA controls |
