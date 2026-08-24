# MINDSPARK — Environment Variables Reference

> **Audience:** DevOps Engineers, Backend Developers, Systems Administrators  
> **Security Classification:** Confidential / Configuration Spec  
> **Related Documents:** [`docs/LOCAL_SETUP_RUNBOOK.md`](LOCAL_SETUP_RUNBOOK.md) · [`SECURITY.md`](../SECURITY.md) · [`docs/20_devops.md`](20_devops.md)

---

## 1. Environment Variable Summary

All environment variables configured across local development, staging, and production:

| Variable Name | Scope | Required | Secret / Public | Default / Example | Description |
|:---|:---|:---:|:---:|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | **YES** | Public | `https://ahrnkwuqlhmwenhvnupb.supabase.co` | Base URL for the Supabase project instance (PostgREST API, Auth, Realtime). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | **YES** | Public | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Anonymous public API key subject to Row Level Security (RLS) policies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | **YES** | **SECRET** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Admin service-role key bypassing RLS. **Strictly banned from client bundles.** |
| `HMAC_SECRET` | Server Only | **YES** | **SECRET** | `32-byte-hex-string` | Cryptographic key used to verify client Clock Guard timestamp seals (`clock-guard.ts`). |
| `OFFLINE_SYNC_SECRET` | Server Only | **YES** | **SECRET** | `32-byte-hex-string` | Shared secret for authenticating batched offline answer sync payloads. |
| `RESEND_API_KEY` | Server Only | **YES** | **SECRET** | `re_123456789...` | API key for transactional emails (Guardian DPDP Consent verification). |
| `EMAIL_FROM` | Server Only | **YES** | Public | `noreply@yourdomain.com` | Sender email address for outbound transactional notifications. |
| `NEXT_PUBLIC_APP_URL` | Client & Server | **YES** | Public | `http://localhost:3000` / `https://mindspark.app` | Base canonical application URL for OAuth callbacks and verification links. |

---

## 2. Detailed Variable Specifications

### 2.1 Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Purpose:** Injected into `@supabase/ssr` to route all auth and database requests.
- **Client Access:** Safe to expose in client code.
- **Format:** Valid HTTPS URL or localhost endpoint (e.g. `http://localhost:54321` for local dockerized Supabase).

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Purpose:** Used for unauthenticated requests and authenticated requests with a user JWT attached.
- **Client Access:** Safe to expose in client code.
- **Security Rule:** Does not grant access to any table unless explicit RLS `SELECT`/`INSERT`/`UPDATE` policies permit it.

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Purpose:** Used exclusively by server actions and admin route handlers (e.g., student bulk import, results calculation, audit logging).
- **Client Access:** **STRICTLY PROHIBITED.** Must never be prefixed with `NEXT_PUBLIC_` or imported in student-facing components.
- **Enforcement:** Verified via lint rules and build-time bundle analyzer.

---

### 2.2 Cryptographic & Security Keys

#### `HMAC_SECRET`
- **Purpose:** Protects assessment integrity by validating client-generated HMAC seals on exam submissions. Detects if a student manipulated their local device clock while offline.
- **Generation:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Length:** 64 hexadecimal characters (256 bits).

#### `OFFLINE_SYNC_SECRET`
- **Purpose:** Used by `/api/submissions/offline-sync` to authenticate Dexie 4 batched payload reconciliation.
- **Length:** 64 hexadecimal characters (256 bits).

---

### 2.3 Email & Notification Service

#### `RESEND_API_KEY`
- **Purpose:** Transmits guardian verification emails required by India's DPDP Act 2023 for minor students.
- **Provider:** Resend.com.

#### `EMAIL_FROM`
- **Purpose:** `From` header on guardian consent emails. Must be a domain with verified SPF, DKIM, and DMARC DNS records.

---

## 3. Secret Rotation Guide

If any server-side secret is compromised:

1. **Rotate Supabase Keys:**
   - In Supabase Dashboard: Go to **Settings** → **API** → Click **Generate new Secret Key**.
   - Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel Environment Variables.
   - Trigger a production redeployment.

2. **Rotate HMAC & Sync Secrets:**
   - Generate new 32-byte hex keys.
   - Update in Vercel Environment Variables (`HMAC_SECRET` and `OFFLINE_SYNC_SECRET`).
   - Note: In-flight offline exams started under the previous secret will gracefully flag for manual review rather than dropping answers.
