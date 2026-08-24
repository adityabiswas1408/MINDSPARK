# MINDSPARK Platform

MINDSPARK is an enterprise-grade digital assessment platform purpose-built for mental arithmetic and abacus education. Built for learners aged 6 to 18, it bridges traditional cognitive math training with cutting-edge digital evaluation.

---

## Why it exists
Traditional mental math competitions and school exams rely on paper worksheets or stopwatches, which are prone to human timing errors, slow grading, and logistical delays. MINDSPARK turns the entire process into a seamless, distraction-free digital experience with **sub-5ms timing precision** for Flash Anzan drills, **zero-loss offline resilience** for unstable school networks, and strict anti-tampering guards.

---

## Quick Start (< 5 minutes)

### Prerequisites
- Node.js 20+
- npm or pnpm
- Supabase CLI (optional, for local DB development)

### Setup & Run
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env.local` and populate credentials (see [Environment Variables](#environment-variables)):
   ```bash
   cp .env.example .env.local
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   - **Student Portal:** `http://localhost:3000/student`
   - **Admin Portal:** `http://localhost:3000/admin` (requires admin role)
   - **Login Screen:** `http://localhost:3000/login`

---

## Environment Variables

| Variable | Scope | Required | Description |
|:---|:---|:---:|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | **Yes** | Supabase project URL (`https://xyz.supabase.co` or `http://localhost:54321`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | **Yes** | Supabase Anon Key subject to Row Level Security (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | **Yes** | Admin service role key (**Server-only — never expose to client**) |
| `HMAC_SECRET` | **Secret** | **Yes** | 32-byte hex secret for Clock Guard timestamp sealing |
| `OFFLINE_SYNC_SECRET` | **Secret** | **Yes** | 32-byte hex secret for offline payload sync validation |
| `RESEND_API_KEY` | **Secret** | **Yes** | Resend API key for guardian consent verification emails |
| `EMAIL_FROM` | Server | **Yes** | Sender email address for notifications |
| `NEXT_PUBLIC_APP_URL` | Public | **Yes** | Canonical app URL (`http://localhost:3000` for dev) |

*Full reference available in [`docs/ENV_VARS_REFERENCE.md`](docs/ENV_VARS_REFERENCE.md).*

---

## Testing & Quality Assurance

```bash
# Type check (0 errors required)
npm run tsc

# Run Vitest unit & integration test suites (49/49 passing)
npm run test

# Run unit tests in verbose mode
npm run test:unit

# Run Playwright End-to-End browser tests
npm run test:e2e

# Run linter
npm run lint

# Production build validation
npm run build
```

*Full testing strategy and test case catalog in [`TESTING.md`](TESTING.md) and [`docs/19_test-plan.md`](docs/19_test-plan.md).*

---

## Key Documentation Index

### Core Specifications & Architecture
- [Product Requirements Document (PRD v2.0)](docs/PRD.md) — Official engineering, functional, and data model specification.
- [Project Overview & Layman Guide](docs/PROJECT_EXPLAINED.md) — Comprehensive product walkthrough and educational concepts.
- [System Architecture](ARCHITECTURE.md) — High-level architecture, data flows, and subsystem maps.
- [Design System](docs/DESIGN.md) — Forest Green color tokens, typography scales, and UI component standards.
- [Technical Constraints](CONSTRAINTS.md) — Non-negotiable Always / Ask First / Never development boundaries.
- [Security Threat Model](SECURITY.md) — RLS policies, secrets management, and minor DPDP compliance.
- [Architectural Decisions](DECISIONS.md) — Chronological log of key architectural decisions.
- [Living State & Milestones](STATE.md) — Active project status, completed milestones, and roadmap.

### Developer Runbooks & Guides
- [Local Setup Runbook](docs/LOCAL_SETUP_RUNBOOK.md) — Step-by-step developer onboarding and database seeding guide.
- [Environment Variables Reference](docs/ENV_VARS_REFERENCE.md) — Complete environment variable dictionary and rotation procedures.
- [Disaster Recovery Playbook](docs/DISASTER_RECOVERY.md) — Backup restoration and DPDP data retention procedures.
- [API Error Code Catalog](docs/API_ERROR_CATALOG.md) — Consolidated error codes and client-side troubleshooting.
- [Contributing Guidelines](docs/CONTRIBUTING.md) — Code style, branch conventions, and PR review checklist.
- [Domain & Tech Glossary](docs/GLOSSARY.md) — Definitions for mental arithmetic, Flash Anzan, and technical terms.
- [Pre-Launch Verification Checklist](pre-launch-checklist.md) — 5-gate production readiness sign-off checklist.
- [Changelog](CHANGELOG.md) — Semantic version history and database migration ledger.
