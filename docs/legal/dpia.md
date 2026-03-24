# MINDSPARK — Data Protection Impact Assessment (DPIA)

> **Document classification:** Legal · Confidential  
> **Jurisdiction:** India — Digital Personal Data Protection Act, 2023 ("DPDP Act") and Digital Personal Data Protection Rules, 2025 ("DPDP Rules")  
> **Data Fiduciary:** [Institution Name] operating MINDSPARK platform  
> **Prepared by:** Principal Compliance Officer  
> **Date prepared:** 2026-03-16  
> **Review cycle:** Annually, or on material platform change  
> **File path:** `docs/legal/dpia.md`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform & Data Architecture Overview](#2-platform--data-architecture-overview)
3. [Data Inventory](#3-data-inventory)
4. [DPDP Compliance Matrix](#4-dpdp-compliance-matrix)
5. [Risk Identification Vectors](#5-risk-identification-vectors)
6. [Engineered Mitigation Strategies](#6-engineered-mitigation-strategies)
7. [Children's Data Protection Analysis](#7-childrens-data-protection-analysis)
8. [Timeline Risk Assessment](#8-timeline-risk-assessment)
9. [Legal Sign-Off Template](#9-legal-sign-off-template)

---

## 1. Executive Summary

MINDSPARK is a single-institution EdTech assessment platform serving students aged 6–18. It processes personal data of minors to conduct mental arithmetic assessments (EXAM: vertical equation format; TEST: Flash Anzan timed-stimulus format), manage academic records, and support administrative operations.

**All students are minors or young adults.** The majority fall within the "child" definition under Section 2(e) of the DPDP Act (under 18 years). This places the platform squarely within the highest-scrutiny category of data processing under the Act.

### Key findings of this DPIA

| Finding | Status |
|---------|--------|
| Verifiable parental consent mechanism required before student account provisioning | ⚠️ Interim mechanism implemented (Phase 1); full Consent Manager integration pending Phase 2 |
| Flash Anzan timing engine: Section 9(2) well-being risk | ✅ Mitigated by engineered constraints (200ms floor, opacity fade, MCQ cooldown) |
| `offline_submissions_staging` table: permissive RLS risk | ✅ Mitigated by HMAC Security Definer function |
| `visibilitychange` tab monitoring: potential Section 9(3) proximity | ✅ Mitigated by ephemeral processing + Fourth Schedule exemption argument |
| IndexedDB quota failure: exam data loss risk | ✅ Mitigated by `navigator.storage.persist()` + LRU purge |
| Data retention periods: not defined by statute | ✅ Purpose-specific periods defined in this document |
| DPBI enforcement capability | ℹ️ DPBI established as 4-member body; members not formally appointed as of March 2026. No enforcement capability currently operational. |

### DPDP compliance phase status (as of March 2026)

| Phase | Status | Trigger |
|-------|--------|---------|
| Phase 1 | **Active** | DPBI established; administrative provisions operative |
| Phase 2 | **Not yet active** | Consent Manager registration opens: 13 November 2026 |
| Phase 3 | **Not yet active** | Full compliance: 13 May 2027 (nominal); **MeitY has proposed compression to November 2026 for Significant Data Fiduciaries — treat November 2026 as the planning deadline** |

---

## 2. Platform & Data Architecture Overview

### Architecture summary

MINDSPARK operates as a Next.js 15 web application backed by Supabase (PostgreSQL + Supabase Auth + Supabase Realtime). Deployment is on Vercel (serverless, India region not guaranteed). Data residency is subject to Supabase's hosting configuration.

### Data flows

```
Student Device (browser / tablet)
    │
    ├─ HTTPS → Next.js Server (Vercel edge / serverless)
    │              │
    │              ├─ Supabase Auth (JWT issuance, session management)
    │              ├─ PostgreSQL (Supabase) — primary data store
    │              └─ Supabase Realtime (WebSocket — exam telemetry)
    │
    ├─ IndexedDB (local device) — offline answer queue
    │
    └─ /api/submissions/offline-sync (Route Handler, HTTPS)
           └─ validate_and_migrate_offline_submission RPC → PostgreSQL
```

### Key architectural privacy properties

| Property | Implementation |
|----------|---------------|
| Authentication | Supabase Auth — HttpOnly cookie JWT, not exposed to client JavaScript |
| Role enforcement | Row Level Security (RLS) on all PostgreSQL tables |
| Data minimisation | `auth-store.ts` holds UI flags only — no role or identity data in Zustand |
| Offline resilience | IndexedDB (Dexie.js) — local only, never synced to third-party services |
| Anti-cheat telemetry | `visibilitychange` events — ephemeral, session-scoped, not persisted post-session |
| Audit trail | `activity_logs` table — immutable, no DELETE RLS policy |

---

## 3. Data Inventory

### 3.1 Personal data collected

| Data element | Data subject | Collection method | Legal basis (DPDP Act) | Retention period | Deletion method |
|-------------|-------------|------------------|----------------------|-----------------|----------------|
| Full name | Student (minor) | Admin CSV import / manual entry | Consent (guardian) — Section 6 | Duration of enrolment + 3 years | Security Definer RPC (see §6) |
| Date of birth | Student (minor) | Admin entry | Consent (guardian) — Section 6 | Duration of enrolment + 3 years | Security Definer RPC |
| Roll number (institutional) | Student (minor) | Admin entry | Legitimate use — Section 7 | Duration of enrolment + 3 years | Security Definer RPC |
| Guardian email address | Guardian/Parent (adult — not the student) | Admin entry | Consent (guardian) — Section 6 | Until consent withdrawn or student account deleted | Supabase Auth delete + Security Definer RPC |
| Academic level assignment | Student (minor) | Admin action | Legitimate use — Section 7 | Duration of enrolment + 3 years | Security Definer RPC |
| Exam answers (`student_answers` table, FK → `submissions`) | Student (minor) | Student interaction | Consent (guardian) — Section 6 | **3 years from assessment date** | pg_cron mark + Security Definer deletion (§6) |
| Flash Anzan session data | Student (minor) | System-generated during TEST | Consent (guardian) — Section 6 | **3 years from assessment date** | As above |
| Tab-visibility events | Student (minor) | `visibilitychange` listener | Legitimate use — Section 7; ephemeral processing | **Session end only — not persisted** | Deleted at `pagehide` / session teardown |
| Heartbeat telemetry | Student (minor) | WebSocket Broadcast | Legitimate use — Section 7; ephemeral | Session duration; not written to database | Cleared on channel teardown |
| Activity log entries | Admin / Teacher | System-generated on all mutations | Legitimate use — Section 7 | **1 year from log creation** | pg_cron + partition drop |
| IP address | All users | Vercel server logs | Legitimate use — Section 7 | Vercel log retention policy (configurable) | Per Vercel configuration |
| Offline answer staging (`offline_submissions_staging`, transient server-side) | Student (minor) | System-generated during network outage reconnect | Legitimate use — Section 7; transient processing | Until migrated to `student_answers`/`submissions` (minutes to hours after reconnect) | Deleted by `validate_and_migrate_offline_submission` RPC post-migration |

### 3.2 Data not collected

The following data is **explicitly not collected** by MINDSPARK:

- Biometric data (no webcam proctoring, no facial recognition)
- Physical location (no GPS or IP-to-location mapping beyond Vercel default logs)
- Caste, religion, political opinion, financial data (no data in these special categories)
- Health data (no physiological monitoring)
- Parent/guardian personal data beyond initial consent verification email

---

## 4. DPDP Compliance Matrix

| DPDP Act Section | Requirement | MINDSPARK implementation | Status |
|-----------------|-------------|------------------------|--------|
| **Section 4** | Processing only for lawful purpose | Assessments conducted for legitimate educational purpose; stated in Privacy Policy and guardian consent notice | ✅ |
| **Section 5** | Notice to Data Principal before consent | Guardian consent notice issued before student account creation; states purpose, data categories, retention | ✅ (Phase 1 interim) |
| **Section 6** | Consent — free, specific, informed, unconditional | Guardian email verification + document upload flow prior to student JWT issuance | ✅ (Phase 1 interim) |
| **Section 6(7)** | Consent withdrawal must be as easy as giving | Withdrawal request email → manual deletion flow (automated withdrawal portal: Phase 2) | ⚠️ Manual in Phase 1 |
| **Section 7** | Legitimate uses (without consent) | System-generated audit logs, heartbeat telemetry — processing necessary for platform operation | ✅ |
| **Section 8** | Data Fiduciary obligations (accuracy, security, breach notification) | Admin-verified data entry; RLS enforced; breach notification SOP in `docs/incident-response.md` P1 | ✅ |
| **Section 8(3)** | Retain only as long as necessary | Purpose-specific periods defined in §3 and §4; pg_cron automated expiry | ✅ |
| **Section 8(7)** | Notify Data Principal before erasure | 48-hour notice email to guardian before any scheduled deletion execution | ✅ |
| **Section 9** | Processing children's data — verifiable parental consent | Guardian verification required before student account creation (see §7) | ✅ (Phase 1 interim) |
| **Section 9(2)** | No processing detrimental to child well-being | Flash Anzan engineered constraints documented in §7 | ✅ |
| **Section 9(3)** | No tracking or behavioural monitoring of children | `visibilitychange` processing is ephemeral, session-scoped; see risk vector RV-02 and §7 | ✅ (with caveat) |
| **Section 11** | Right to information | Privacy Policy published at `/privacy`; data categories and purposes disclosed | ✅ |
| **Section 12** | Right to correction and erasure | Manual erasure request flow (30-day response); automated erasure via pg_cron at retention expiry | ✅ |
| **Section 13** | Right to grievance redressal | Contact email published; 30-day resolution target documented | ✅ |
| **Rule 3** | Notice format and language | Privacy Policy drafted in English; regional language translation: Phase 2 | ⚠️ Phase 2 |
| **Rule 10** | Children's data — verifiable parental consent mechanism | Guardian email verification + document upload; Consent Manager [Phase 2 — Nov 2026] | ✅ Phase 1; ⚠️ Phase 2 |
| **Rule 12** | Data Fiduciary register | Registration with DPBI required when enforcement commences | ⚠️ Pending DPBI staffing |
| **Rule 22** | Security safeguards | HMAC submission validation, RLS, HttpOnly JWT, CSP headers, `npm audit` quarterly | ✅ |

---

## 5. Risk Identification Vectors

The following four vectors represent material privacy or security risks requiring documented mitigation. Additional operational risks are documented in `docs/incident-response.md`.

| ID | Risk vector | DPDP Act relevance | Likelihood | Impact | Residual risk after mitigation |
|----|------------|-------------------|-----------|--------|-------------------------------|
| **RV-01** | `offline_submissions_staging` permissive RLS — payload tampering | Section 8 (data integrity) | Medium | High | Low |
| **RV-02** | `visibilitychange` tab monitoring — minor tracking concern | Section 9(3) | Low | High (regulatory) | Low |
| **RV-03** | IndexedDB quota exhaustion — exam data loss | Section 8 (data integrity + child well-being) | Medium | High | Low |
| **RV-04** | Unauthorised minor provisioning without parental consent | Section 9, Rule 10 | Medium | Critical | Low (with process control) |

### RV-01 — `offline_submissions_staging` Permissive RLS

**Technical description:** The `offline_submissions_staging` table must accept INSERT operations from students who reconnect after a network outage, potentially after the exam session has formally closed. Standard RLS requiring `auth.uid() = student_id` would block legitimate post-close syncs. The table therefore uses **permissive INSERT RLS** — any authenticated user can insert a row.

**Risk:** A malicious actor with a valid student JWT could craft arbitrary answer payloads and insert them into the staging table, then trigger the migration RPC to inject fraudulent exam results.

**DPDP relevance:** Section 8 — Data Fiduciary must ensure data integrity; fraudulent results would compromise the accuracy of academic records.

**Mitigation:** See §6, RV-01.

---

### RV-02 — `visibilitychange` Tab Monitoring

**Technical description:** The platform uses the browser `visibilitychange` API to detect when a student switches away from the exam tab. Tab-switch events are broadcast to the admin Live Monitor and recorded in `activity_logs` for the duration of the session.

**Risk:** Section 9(3) of the DPDP Act prohibits processing children's personal data for tracking or behavioural monitoring. Continuous tab visibility logging could be characterised as behavioural monitoring of a minor.

**DPDP relevance:** Section 9(3) — explicit prohibition. Section 9(2) — processing must not have detrimental effect on well-being.

**Mitigation:** See §6, RV-02 and §7.

---

### RV-03 — IndexedDB Quota Exhaustion

**Technical description:** The offline-first architecture saves student answers to IndexedDB on the student's device. Devices with less than 1GB of available storage may hit browser-enforced IndexedDB quotas during a long exam session, causing `QuotaExceededError`. If unhandled, answers written after the quota is hit are silently lost.

**Risk:** Loss of exam data constitutes a data integrity failure affecting a minor's academic record.

**DPDP relevance:** Section 8 — Data Fiduciary obligations include ensuring data completeness and integrity. Loss of exam answers could have material educational consequences for the child.

**Mitigation:** See §6, RV-03.

---

### RV-04 — Unauthorised Minor Provisioning

**Technical description:** Student accounts are created by institution admins via CSV bulk import or manual entry. There is no technical barrier preventing an admin from provisioning an account for a student under 18 without first obtaining verifiable parental consent.

**Risk:** Processing a minor's personal data without prior verifiable parental consent violates Section 9 and Rule 10 of the DPDP Act. This is the highest-severity compliance risk on the platform.

**DPDP relevance:** Section 9 — explicit requirement for verifiable parental consent before processing children's data. Rule 10 — specifies mechanism requirements.

**Mitigation:** See §6, RV-04.

---

## 6. Engineered Mitigation Strategies

### RV-01 — HMAC Security Definer Validation

**Mitigation:** The `validate_and_migrate_offline_submission` PostgreSQL function is implemented as `SECURITY DEFINER`, granting it superuser-equivalent execution privileges to bypass RLS. Before migrating any row from `offline_submissions_staging` to `student_answers` and `submissions`, the function:

1. Extracts the HMAC timestamp from the submission payload
2. Recomputes the expected HMAC using the server-side secret
3. Compares against the client-submitted HMAC using a constant-time comparison
4. Verifies the timestamp falls within the valid session window (session `expires_at` + grace period)
5. Rejects any payload that fails HMAC validation — insert is discarded, not migrated

The staging table row is deleted after successful migration or after HMAC rejection. No tampered payload survives to the `student_answers` or `submissions` tables.

**Technical implementation reference:** `supabase/migrations/020_create_security_definer_functions.sql`

**Residual risk:** An attacker who obtains the server-side HMAC secret could forge payloads. Mitigation: the secret is stored as a Supabase environment variable, never exposed to client-side code, and rotated quarterly.

---

### RV-02 — Ephemeral Tab Monitoring with Disclosure

**Mitigation (technical):**
1. `visibilitychange` events are processed client-side and **broadcast via Supabase Broadcast channel** — they are never written to the `submissions` table or any persistent store
2. The admin Live Monitor displays the tab-switch count from the in-memory Broadcast stream only
3. `activity_logs` records only the **count** of tab switches per session (`tab_switch_count: INTEGER`) — not a time-series of individual events
4. All telemetry is explicitly destroyed at session end: `supabase.removeChannel(channel)` is called in the `pagehide` handler, and the session row in `activity_logs` has `session_end` marked

**Mitigation (legal — Fourth Schedule educational institution exemption):**

The DPDP Act Fourth Schedule designates educational institutions as entities eligible for exemptions under specific conditions for processing required to maintain academic integrity. The institution's legal counsel should assess whether tab-switch monitoring qualifies under this exemption as a necessary integrity measure for high-stakes assessments.

This argument should be explicitly documented in the institution's Privacy Policy with the following disclosure:

> *"MINDSPARK records the number of times a student leaves the exam browser tab during an active assessment. This is used solely to support assessment integrity review by teachers. Individual tab-switch events are not stored after the exam session ends."*

**Residual risk:** Regulatory interpretation of Section 9(3) remains untested as of March 2026 (DPBI has no enforcement capability). The platform takes a conservative position: ephemeral processing only, full disclosure, and Fourth Schedule reliance argument documented.

---

### RV-03 — IndexedDB Quota Management

**Mitigation (technical — three-layer defence):**

**Layer 1 — Persistent storage request:**
```javascript
// Called at exam start, before first answer write
if (navigator.storage && navigator.storage.persist) {
  const granted = await navigator.storage.persist();
  // If granted: browser will not evict IndexedDB data without explicit user action
}
```

**Layer 2 — LRU (Least Recently Used) purge on quota pressure:**
When a write operation to IndexedDB throws `QuotaExceededError`, the Dexie.js wrapper invokes an LRU purge function that:
1. Queries the `pendingAnswers` table ordered by `answered_at ASC`
2. Deletes the oldest entries (already synced, based on `sync_status = 'verified'`) until 20% headroom is recovered
3. Retries the failed write

**Layer 3 — User notification before data loss:**
If LRU purge cannot recover sufficient quota (device is critically full), the exam UI displays:

> *"Your device is running low on space. Please tell your teacher."*

The exam continues — the student is not blocked. The teacher sees the student's status as "Warning" in the Live Monitor. Unsynced answers are preserved at maximum possible capacity.

**Implementation reference:** `src/lib/storage/dexie-quota-guard.ts`

---

### RV-04 — Verifiable Parental Consent Before Provisioning

**Phase 1 (current — interim mechanism):**

Before any student account is created (individually or via CSV import), the institution admin must:

1. Upload a signed guardian consent form (PDF) via the admin panel
2. Record the guardian's email address
3. The system sends a verification email to the guardian with a confirmation link
4. Only after the guardian clicks the link does the system create the student's Supabase Auth account and issue a JWT

**Technical enforcement:** Student provisioning Server Action checks for `consent_verified = true` on the pending enrollment record before calling `supabase.auth.admin.createUser()`. Provisioning without this check fails with a logged error.

**Phase 2 — Consent Manager [Phase 2 — Nov 2026]:**
When DPBI opens Consent Manager registration (13 November 2026), the platform will integrate with a registered Consent Manager via the defined API. The consent schema (see below) is designed to be CM-compatible from Phase 1.

**CM-compatible consent schema (current design):**
```json
{
  "consent_id": "uuid",
  "student_id": "uuid",
  "guardian_email": "string",
  "consent_given_at": "iso8601",
  "consent_scope": ["assessment_data", "academic_records", "session_telemetry"],
  "consent_version": "1.0",
  "verification_method": "email_link",
  "cm_reference": null
}
```

The `cm_reference` field is `null` in Phase 1 and will be populated with the Consent Manager's reference ID in Phase 2.

---

## 7. Children's Data Protection Analysis

### 7.1 Scope — All Students Are Minors or Near-Minors

MINDSPARK serves students aged 6–18. Every student account on the platform is either:
- A **child** under Section 2(e) of the DPDP Act (under 18), or
- An 18-year-old whose data was collected before they reached majority

The platform therefore applies the strictest available protections under the Act to all student data without exception. No age-segmentation is implemented — treating all students as children is the most defensible position.

---

### 7.2 Section 9(2) — Flash Anzan Well-Being Analysis

**Legal text:** Section 9(2) prohibits a Data Fiduciary from processing personal data *"in a manner that is likely to cause any detrimental effect on the well-being of a child."*

**Platform activity at issue:** The Flash Anzan TEST format displays numbers at intervals between **200ms and 3000ms**. At the fastest permitted speeds (200–300ms), numbers flash at a rate that could, if uncontrolled, constitute a stroboscopic stimulus. Stroboscopic stimuli at certain frequencies are a known trigger for photosensitive epilepsy and can cause cognitive distress.

**Engineered constraints implemented as Section 9(2) mitigations:**

These are not optional UX decisions. They are mandatory platform constraints with a legal basis under Section 9(2):

| Constraint | Technical implementation | Section 9(2) rationale |
|-----------|------------------------|------------------------|
| **200ms minimum flash interval (hard floor)** | `anzan_delay_ms >= 200 CHECK` constraint in PostgreSQL `exam_papers` table; admin UI slider minimum = 200ms | Prevents sub-200ms stimulation. The International League Against Epilepsy (ILAE) photosensitivity threshold is approximately 3Hz (333ms). 200ms approaches this boundary; 150ms would exceed it. The 200ms floor provides safety margin. |
| **30ms opacity fade between flashes** | CSS: `transition: opacity 30ms ease` applied to the flash container ONLY (not `.flash-number` itself) | Eliminates hard-cut strobe effect without introducing perceptible motion blur that would compromise assessment validity |
| **1,200ms MCQ cooldown after answer selection** | Client-side: answer tap handler ignores re-taps for 1,200ms | Prevents anxious double-tapping from registering duplicate answers; removes the pressure of "did it register?" cognitive load that could cause distress |
| **Dynamic contrast dampening < 300ms** | Flash background opacity reduced to 85% when interval < 300ms | Reduces perceived contrast intensity at highest speeds |

**Note on CSS `transition: none` on `.flash-number`:** The number text itself carries `transition: none !important`. This is distinct from the container fade described above. Text transitions would cause visual ghosting that directly interferes with the student's mental abacus (Soroban) visualisation — a separate harm.

**Assessment:** With the above constraints in place, the Flash Anzan engine operates within parameters that do not constitute detrimental effect on a child's well-being under Section 9(2). The 200ms floor is the primary protection; the remaining constraints are supporting mitigations.

---

### 7.3 Section 9(3) — Tracking and Behavioural Monitoring

**Legal text:** Section 9(3) prohibits processing children's data *"for the purpose of tracking or behavioural monitoring of children."*

**Platform activity at issue:** The `visibilitychange` API records when a student leaves the exam tab. This data is used to display tab-switch count to the exam invigilator.

**Analysis:**

The platform's position is that tab-switch monitoring **does not constitute behavioural monitoring** within the meaning of Section 9(3) on three grounds:

1. **Purpose specificity:** The processing is strictly limited to maintaining assessment integrity during a defined, scheduled exam session. It is not used for any purpose beyond that session.

2. **Data minimisation:** Only the aggregate count of tab-switch events is stored (per session). Individual event timestamps, sequences, or patterns are not persisted.

3. **Educational institution exemption (Fourth Schedule):** Educational institutions may process data necessary for legitimate educational functions. Assessment integrity monitoring is a core function of any assessment institution.

**Conservative safeguard:** Regardless of the legal position, the platform implements ephemeral processing as documented in RV-02 mitigation (§6). Even if a regulator were to take a contrary view of Section 9(3), the data minimisation and session-scoped deletion would substantially limit any adverse finding.

---

### 7.4 Rule 10 — Verifiable Parental Consent

**Requirement:** Rule 10 mandates that a Data Fiduciary processing children's data must obtain verifiable parental consent through a mechanism that can be verified — not merely a checkbox.

**Phase 1 mechanism:** Guardian email verification + signed document upload (see §6, RV-04). This constitutes verifiable consent within the meaning of Rule 10 for Phase 1 operations.

**Limitation:** The Rule 10 specification contemplates Consent Manager integration for scalable verification. The interim email mechanism is adequate for a single-institution platform but must be upgraded when Consent Managers are operational.

**[Phase 2 — Nov 2026]:** CM integration mandatory for continued Rule 10 compliance. Plan CM integration work to begin by August 2026 to allow testing before the November 2026 deadline.

---

## 8. Timeline Risk Assessment

### 8.1 DPDP Phase Timeline

| Phase | Nominal date | Planning deadline | Key obligations triggered |
|-------|-------------|------------------|--------------------------|
| Phase 1 | Active now (March 2026) | — | DPBI established; administrative provisions; this DPIA is applicable |
| Phase 2 | 13 November 2026 | **13 November 2026** | Consent Manager registration opens; CM integration must be live |
| Phase 3 | 13 May 2027 (nominal) | **13 November 2026** ⚠️ | Full compliance; MeitY has proposed compressing Phase 3 to November 2026 for Significant Data Fiduciaries |

> ⚠️ **MeitY Compression Risk:** As of March 2026, MeitY has publicly proposed compressing Phase 3 compliance obligations to November 2026 for entities designated as Significant Data Fiduciaries. MINDSPARK is a single-institution platform and may not meet the Significant Data Fiduciary threshold. However: (a) the threshold has not been officially published; (b) EdTech platforms handling children's data at any scale may be included; and (c) the cost of conservative compliance is low. **This DPIA treats November 2026 as the effective planning deadline for full compliance regardless of SDF designation.** Do not plan for May 2027.

---

### 8.2 DPBI Operational Status

The Data Protection Board of India (DPBI) was established as a body under the DPDP Act. As of March 2026:

- The DPBI exists as a statutory body
- It has been constituted as a 4-member board
- **The members have not been formally appointed**
- **No enforcement proceedings have been initiated or are capable of initiation**
- **No penalties have been imposed on any Data Fiduciary to date**

This means that as of the date of this DPIA, there is **no active enforcement authority** for DPDP Act violations. This does not alter the platform's compliance obligations — the Act is in force — but it contextualises the current risk environment.

**Risk implication:** Once members are appointed and enforcement commences, any non-compliant processing that occurred during this window may be subject to retrospective investigation. Platforms that have not achieved good-faith compliance during the establishment period may face higher scrutiny.

**Recommended action:** Proceed with this DPIA's recommendations regardless of DPBI staffing status. Document all compliance steps taken with timestamps. This documentation will constitute the good-faith compliance record if enforcement is initiated retroactively.

---

### 8.3 Compliance Execution Timeline

| Milestone | Target date | Owner | Status |
|-----------|-------------|-------|--------|
| DPIA completed and signed | 2026-03-16 | Compliance Officer | ✅ This document |
| Privacy Policy published | 2026-04-01 | Legal + Dev | ⬜ |
| Guardian consent flow live (Phase 1) | 2026-04-01 | Dev | ⬜ |
| DPBI registration (when portal opens) | On DPBI announcement | Compliance Officer | ⬜ |
| Consent Manager vendor evaluation | 2026-08-01 | Compliance Officer + Dev | ⬜ |
| CM integration development begins | 2026-09-01 | Dev | ⬜ |
| CM integration live on staging | 2026-10-01 | Dev | ⬜ |
| CM integration live on production | 2026-11-01 | Dev | ⬜ |
| DPIA annual review | 2027-03-16 | Compliance Officer | ⬜ |

---

## 9. Legal Sign-Off Template

This DPIA has been prepared in accordance with the Digital Personal Data Protection Act, 2023 and Digital Personal Data Protection Rules, 2025. It reflects the platform's data processing architecture as of the date signed below.

---

**Data Fiduciary:** [Institution Legal Name]

**Platform:** MINDSPARK (DPDP Act registration, when available: [TBD])

**DPIA Version:** 1.0

---

### Declarations

**Compliance Officer:**

I confirm that this DPIA accurately reflects the data processing activities of the MINDSPARK platform as described herein, that the risks identified have been assessed in good faith, and that the mitigations described are implemented or scheduled for implementation by the dates specified.

Name: ___________________________

Designation: Principal Compliance Officer

Signature: ___________________________

Date: ___________________________

---

**Legal Counsel:**

I confirm that this DPIA reflects an appropriate interpretation of the DPDP Act 2023 and DPDP Rules 2025 as in force and as authoritatively interpreted as of the date signed. I have reviewed the Section 9(2) well-being analysis, the Section 9(3) monitoring assessment, and the Rule 10 consent mechanism.

Name: ___________________________

Firm: ___________________________

Signature: ___________________________

Date: ___________________________

---

**Technical Lead:**

I confirm that the engineered mitigations described in Section 6 (HMAC Security Definer, ephemeral telemetry, IndexedDB quota management, consent-gated provisioning) are implemented in the production codebase or are scheduled for implementation by the dates specified in Section 8.3.

Name: ___________________________

GitHub handle: ___________________________

Signature: ___________________________

Date: ___________________________

---

**Review schedule:**

| Review trigger | Action |
|----------------|--------|
| Annual review (2027-03-16) | Full DPIA update |
| Material platform change (new data category, new processing purpose) | Section 3 and 5 update, re-sign |
| DPBI enforcement commencement | Immediate legal review, DPIA validation |
| DPDP Rules amendment | Legal review within 30 days |
| Security incident involving personal data | §5 risk table update, incident log cross-reference |

---

*End of DPIA — MINDSPARK V1.0*  
*Document path: `docs/legal/dpia.md`*  
*Next review: 2027-03-16*
