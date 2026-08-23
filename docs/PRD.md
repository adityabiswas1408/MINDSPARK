# MINDSPARK V1 — Product Requirements Document (PRD)

> **Document Type:** Production Product Requirements Document (PRD v2.0)  
> **Target Audience:** Engineering Teams, QA Specialists, Systems Architects, and Product Stakeholders.  
> **Status:** Production Baseline · 100% Parity with `MINDSPARK-Mockups-Review.pdf`  
> **Companion Documents:** [`docs/PROJECT_EXPLAINED.md`](PROJECT_EXPLAINED.md) (Layman Guide) · [`ARCHITECTURE.md`](../ARCHITECTURE.md) · [`docs/DESIGN.md`](DESIGN.md)

---

## 1. Executive Summary & Problem Statement

### 1.1 The Product
**MINDSPARK** is an enterprise-grade digital assessment platform purpose-built for **abacus education and competitive mental arithmetic**. Serving learners aged **6 to 18**, it transitions traditional cognitive calculation training from vulnerable paper worksheets and analog stopwatches to an ultra-precise, offline-resilient digital testing environment.

### 1.2 Core Problems Solved
1. **High-Speed Flash Anzan Timing Drift:** Standard browser timers (`setTimeout`/`setInterval`) suffer from 20–50ms frame drift under CPU load, rendering lightning-fast math tests (200ms–3000ms flashes) unfair. MINDSPARK utilizes a hardware-calibrated `requestAnimationFrame` delta loop to guarantee `<5ms` frame jitter.
2. **Unstable Examination Wi-Fi:** School networks frequently drop during mass testing. MINDSPARK pre-caches encrypted question papers into local IndexedDB (Dexie 4) before the exam begins, allowing students to complete tests completely offline without data loss. Answers synchronize cryptographically upon reconnection.
3. **Academic Integrity & Anti-Cheat:** Prevents tab-switching, unauthorized lookups, and local system clock manipulation via window blur monitors and cryptographic HMAC timestamp sealing.
4. **Minor Data Privacy Compliance (DPDP Act):** Implements verifiable legal guardian consent workflows before minor students can access live competitive assessments.

---

## 2. User Personas & Permissions

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MINDSPARK USER ROLES & SCOPES                           │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│         STUDENT          │         TEACHER          │           ADMINISTRATOR           │
│      (Ages 6 to 18)      │     (Cohort Mentor)      │        (School Principal/HQ)      │
├──────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ • Take scheduled exams   │ • Monitor live sessions  │ • Institutional KPI analytics     │
│ • Practice Flash Anzan   │ • View cohort progress   │ • Grade level & student rosters   │
│ • View instant scorecards│ • Review submissions     │ • Assessment paper creation wizard│
│ • Inspect answer sheets  │ • Provide classroom help │ • Batch result release gating     │
│   (when released)        │                          │ • System configuration & logs     │
└──────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

---

## 3. Core Functional Requirements

### 3.1 Authentication, RBAC & Guardian Consent
- **Multi-Identifier Login:** Supports authentication via registered email or unique student roll numbers (e.g., `STU-001`).
- **Strict Server-Side RBAC:** Middleware validates session JWTs via `supabase.auth.getUser()`. User roles are sourced exclusively from `app_metadata.role` (`admin`, `teacher`, `student`).
- **Minor DPDP Compliance:** Students without verified guardian consent (`consent_verified = false`) are redirected to `/student/consent`. Guardians submit an email to receive a tamper-proof verification link (`/api/consent/verify`).

### 3.2 Student Portal & Navigation
- **Live Exam Hero Banner:** Prominent live assessment card on `/student/dashboard` with pulsing status, remaining time, and direct lobby entry CTA.
- **Calm Empty States:** Displayed when no active exams are running (~95% of standard student loads), featuring a shield icon and growth progress links.
- **Dual Assessment Sections:**
  - `/student/exams`: Dedicated listing for Vertical Abacus column exams with live, upcoming, and completed states.
  - `/student/tests`: Dedicated listing for high-speed Flash Anzan calculation drills.
  - **Type-Specific Empty States:** Blue book icon for Exams; Purple lightning bolt for Tests.
- **Pre-Live Schedule Info:** Read-only exam details for scheduled assessments with notice: *"Not yet available — exam will open when the teacher starts it"*.
- **Assessment Lobby (`/student/exams/[id]/lobby`):** Distraction-free waiting room with an animated breathing circle, synchronized DM Mono countdown timer, network latency check, and mandatory consent confirmation.
- **Student Profile (`/student/profile`):** Hero identity card with collapsible guardian information and explicit `"Not mentioned"` fallback badges for empty optional fields.

### 3.3 Assessment Player & Dual Calculation Engines

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DUAL CALCULATION ENGINE FLOWS                              │
├────────────────────────────────────────────┬────────────────────────────────────────────┤
│         VERTICAL ABACUS EXAM ENGINE        │          FLASH ANZAN TEST ENGINE           │
├────────────────────────────────────────────┼────────────────────────────────────────────┤
│ • High-contrast monospace equation column  │ • Phase 1: 3-second Get Ready Countdown    │
│ • Negative numbers in Dark Red (#991B1B)   │ • Phase 2: Distraction-free 96px Flashes   │
│ • Dynamic tight-gap operator alignment     │ • Phase 3: MCQ Grid with active timer bar  │
│ • Tactile 64x64px MCQ options (A, B, C, D) │ • Phase 4: Instant checkmark confirmation  │
│ • 1,200ms anti-double-tap cooldown         │ • Zero CSS transitions (zero motion blur)  │
│ • Interactive question navigator sidebar   │ • Locked sequence (no pause or rewind)     │
└────────────────────────────────────────────┴────────────────────────────────────────────┘
```

### 3.4 Offline Resilience & Sync Subsystem
- **Question Bank Pre-Caching:** Automatically downloads and encrypts the full question set into IndexedDB (Dexie 4) during the lobby phase.
- **Seamless Offline Continuity:** Network disconnects trigger a non-intrusive yellow status alert (*"Working Offline — Answers Saved Locally"*). Students continue answering without input latency.
- **Cryptographic Background Sync:** Automatically detects Wi-Fi reconnection, validates payload HMAC checksums, and synchronizes buffered answers via `/api/submissions/offline-sync`.

### 3.5 Anti-Cheat & Academic Integrity
- **HMAC Timestamp Sealing:** Generates cryptographic HMAC seals across submission timestamps to detect local device clock manipulation.
- **Focus & Visibility Monitor:** Tracks window blur, document visibility changes, and tab switches during active sessions.
- **Emergency Teardown:** Fires `/api/submissions/teardown` via `navigator.sendBeacon` upon unauthorized window destruction or tampering events.
- **Service Role Isolation:** `src/lib/supabase/admin.ts` is strictly prohibited from client bundles and student route trees.

### 3.6 Student Results Flow & Answer Key Gating
- **Instant Result Card:** Immediately displays overall score, percentage, earned grade, accuracy rate, and digits-per-minute (DPM) calculation speed.
- **Answer Sheet Release Gating:**
  - *Pending State:* Amber banner stating *"Results Under Review — Answer key will be published once released by admin"*.
  - *Locked Direct Access:* Unreleased direct URL visits render a locked card alert with disabled review controls.
  - *Released State:* Interactive question-by-question answer sheet displaying student choice, correct answer, and green/red status pills.

### 3.7 Administrator Management Suite
- **Institutional Dashboard (`/admin/dashboard`):** Real-time active student counts, session gauges, and materialized aggregate KPIs.
- **Live Exam Monitor (`/admin/monitor/[id]`):** WebSocket-driven live room monitor tracking student connection health, progress percentage, heartbeats, and cheat flags.
- **Assessment Creator Wizard (`/admin/assessments`):** Multi-step configuration pipeline for paper type (Exam vs Test), grade levels, question count, and Flash Anzan timing intervals (200ms–3000ms).
- **Roster & Level Management (`/admin/students`, `/admin/levels`):** Student enrollment, roll number assignment, and abacus level boundaries.
- **Batch Result Management (`/admin/results`):** One-click answer key release toggles, score auditing, and CSV performance exports.
- **Announcements Broadcaster (`/admin/announcements`):** Rich-text TipTap announcement editor with role-based targeting.

---

## 4. Technical Architecture & Data Invariants

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS design tokens (`src/app/globals.css`), shadcn/ui primitives.
- **Backend:** Next.js Server Actions (typed `ActionResult<T>`) and HTTP Route Handlers.
- **Database:** Supabase PostgreSQL with **27 applied migrations**, Row-Level Security (RLS) policies, and custom RPCs (`validate_and_migrate_offline_submission`, `dashboard_aggregates`).
- **Composite Unique Keys:** The `submissions` table strictly enforces `UNIQUE(session_id, student_id)` to eliminate duplicate submissions.

---

## 5. Non-Functional Requirements (NFRs)

| Metric | Requirement | Verification Method |
|---|---|---|
| **Concurrency** | 2,500 simultaneous active students in a single exam | k6 distributed load simulation (`k6/lt-01-thundering-herd.js`) |
| **Timing Jitter** | `< 5ms` frame deviation during Flash Anzan flashes | Vitest hardware timing tests (`timing-engine.test.ts`) |
| **Accessibility** | WCAG 2.1 AA compliant, 64x64px touch hitboxes | Playwright axe-core audit (`e2e/a11y.spec.ts`) |
| **Page Performance** | Core Web Vitals LCP < 1.5s, CLS = 0 | Production build Lighthouse audit |
| **Data Durability** | Zero answer loss during complete network loss | Dexie 4 IndexedDB offline sync test suite |

---

## 6. Acceptance Criteria & Traceability

Every screen and feature specified in this PRD matches 100% parity against the 64 approved mockup screens in [`docs/MINDSPARK-Mockups-Review.pdf`](MINDSPARK-Mockups-Review.pdf) and is verified via automated test suites:
- **Unit & Integration Coverage:** 49/49 passing tests across 7 Vitest suites.
- **E2E Journeys:** Playwright smoke, profile, and accessibility test suites.
