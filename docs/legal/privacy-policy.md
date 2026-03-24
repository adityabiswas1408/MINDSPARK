# MINDSPARK Privacy Policy

> **Effective date:** [INSERT DATE BEFORE PUBLISHING]  
> **Document path:** `docs/legal/privacy-policy.md`  
> **Published at:** `[institution-url]/privacy`  
> **Accessible:** Without login, publicly

---

# PART A — Guardian & Legal Representative Notice

*This notice is addressed to the parent, guardian, or legal representative of the student using MINDSPARK. It is legally binding and constitutes the consent notice required under Section 5 of the Digital Personal Data Protection Act, 2023 ("DPDP Act").*

---

## 1. Data Controller Identity

**Data Fiduciary (Data Controller):**  
[Institution Legal Name]  
[Registered address]  
[DPBI Registration Number — to be added on registration]

**Grievance Officer:**  
[Name]  
[Email address]  
[Phone number]  
*Available: Monday–Friday, 10:00–17:00 IST. Response within 30 days.*

MINDSPARK is a digital assessment platform operated by the institution named above. It is not a public service. Access is limited to enrolled students of this institution.

---

## 2. Data We Collect

We collect the following personal data about your child. Each item is listed with the specific reason it is collected.

| Data | Who provides it | Why we collect it |
|------|----------------|-------------------|
| **Full name** | Institution admin | To identify your child in examination records and results |
| **Date of birth** | Institution admin | Used as an authentication factor alongside the roll number for secure login |
| **Institutional roll number** | Institution admin | Primary identifier; used for login and academic records |
| **Guardian email address** | Institution admin or guardian | To obtain and verify parental consent before account creation; for pre-deletion notifications |
| **Mathematical performance scores** | System (during assessment) | To record examination results, calculate grades, and generate academic reports |
| **Digits Per Minute (DPM)** | System (during Flash Anzan tests) | A proprietary speed metric calculated from Flash Anzan TEST performance; included in result records |
| **Examination answers** | Student (during assessment) | The substantive purpose of the platform — to conduct and record assessments |
| **Browser tab-visibility states** | System (during active exams only) | Anti-cheat and examination integrity — see Section 5 |
| **Examination answer cache (IndexedDB)** | System (automatically, on student device) | Temporary offline storage during connectivity interruptions — see Section 6 |
| **Device storage capacity status** | System (automatically) | To manage local quota and prevent data loss on low-storage devices |
| **IP address and browser metadata** | System (automatically) | Security, fraud detection, and platform abuse prevention; also retained in server logs per Vercel's standard logging policy |

We do **not** collect: biometric data, webcam footage, physical location, caste, religion, financial information, or health data.

---

## 3. Why We Collect It

We process your child's personal data on two legal bases under the DPDP Act:

**a) Guardian consent (Section 6):** For all assessment data, academic records, and account information. You provided this consent when the institution submitted your guardian verification before creating your child's account.

**b) Legitimate use (Section 7):** For system-generated data necessary to operate the platform — server logs, audit trails, session telemetry, and security operations. This processing is necessary to provide the service you have agreed to.

We do not use your child's data for advertising, marketing, profiling, or sale to third parties. We do not use it for any purpose beyond what is stated in this policy.

---

## 4. How Long We Keep It

We retain personal data only as long as necessary for the stated purpose. No statutory retention schedule exists for EdTech assessment data under Indian law; we have defined the following purpose-specific periods:

| Data category | Retention period | Trigger |
|--------------|-----------------|---------|
| Examination results and scores | **3 years** from the assessment date | Assessment date as recorded in system |
| Examination answers (individual responses) | **3 years** from the assessment date | Assessment date as recorded in system |
| Flash Anzan performance data (DPM) | **3 years** from the assessment date | Assessment date |
| Student account data (name, DOB, roll number) | Duration of enrolment **+ 3 years** | Date of last enrolment record |
| Activity logs (admin actions) | **1 year** from log creation | Log creation timestamp |
| Offline answer sync buffer (server-side staging — `offline_submissions_staging`) | Until answers are verified and migrated to permanent storage — typically minutes after reconnection | Network reconnection event |
| Browser tab-visibility events | **Session end only** — not retained | Examination session teardown |
| Heartbeat telemetry | **Session duration** — not written to database | Real-time only; cleared on channel close |
| Offline answer cache (IndexedDB — student device and briefly on our servers during sync) | Until successfully synced to server | Sync confirmation received |

**Pre-deletion notice:** We will send a notification to the guardian email address on record **at least 48 hours before** any scheduled erasure of your child's personal data.

---

## 5. Anti-Cheat & Examination Integrity Systems

MINDSPARK uses the following integrity mechanism during live examinations:

> *"During active examination sessions only, MINDSPARK uses the browser's Page Visibility API (visibilitychange event) to detect when a student navigates away from the assessment tab. This information is:*
> - *Collected only during active Live Examination states*
> - *Not stored beyond the examination session*
> - *Not used for advertising, profiling, or any commercial purpose*
> - *Not used to track behaviour outside of assessments*
>
> *Parents may opt out by contacting the institution; opting out results in the relevant examination being invalidated."*

An aggregate count of tab-switch events per examination session is recorded in the institution's audit log and made available to the teacher administering the examination. Individual event timestamps and sequences are not retained after the session ends.

This processing is conducted under the DPDP Act Fourth Schedule educational institution exemption for assessment integrity purposes.

---

## 6. Offline Storage — IndexedDB

When a student's internet connection is interrupted during an examination, MINDSPARK automatically saves their in-progress answers to **local browser storage on their device** (a browser technology called IndexedDB). This is not a cloud server — it is storage on the physical device being used.

The offline cache:
- Contains only the current examination's answers — no other personal data
- Is automatically deleted once the answers are successfully uploaded to our servers after reconnection
- Is never transmitted to any third party
- Is stored only on the student's device — we cannot access it remotely

If the examination ends before reconnection, the cached answers are uploaded the next time the device connects to the internet.

---

## 7. Your Rights Under the DPDP Act 2023

As the guardian of a minor student, you have the following rights:

| Right | What it means |
|-------|--------------|
| **Right to access** (Section 11) | You may request a summary of all personal data we hold about your child |
| **Right to correction** (Section 12) | You may request correction of inaccurate or outdated data |
| **Right to erasure** (Section 12) | You may request deletion of your child's personal data. We will execute deletion within 30 days, with 48 hours' notice before erasure runs |
| **Right to grievance redressal** (Section 13) | You may raise a complaint with our Grievance Officer; response within 30 days |
| **Right to withdraw consent** (Section 6(7)) | You may withdraw consent at any time. Withdrawal does not affect the lawfulness of processing that occurred before withdrawal. Withdrawal will result in account closure and scheduled data deletion |
| **Right to nominate** (Section 14) | You may designate another person (e.g., your own guardian or legal representative) to exercise these rights on your behalf |

---

## 8. How to Exercise Your Rights

**Exercising rights must be as easy as granting consent.** To submit any request:

**Email:** [privacy@institution.domain]

**Subject line:** `MINDSPARK Privacy Request — [Student Roll Number]`

**Or:** Use the withdrawal form at: `[institution-url]/privacy/withdraw`

Include in your request:
- Student's full name and roll number
- Your relationship to the student
- The specific right you wish to exercise

We will respond within **30 days** of receiving a valid request.

**Withdrawing consent:** Request via the email or URL above. We will confirm receipt within 24 hours, and initiate account closure and data deletion within 30 days. You will receive a 48-hour advance notice email before deletion executes, allowing you to cancel if submitted in error.

**Consent Manager [Phase 2 — Nov 2026]:**

> *"MINDSPARK is designed to support Consent Manager integration as defined under DPDP Rule 4 (effective November 2026). Until Consent Managers are registered with the Data Protection Board of India, guardians may exercise all consent rights directly through the institution using the contact details below."*

---

## 9. Data Protection Board Complaints

If you are not satisfied with our response to a rights request or grievance, you may file a complaint with the **Data Protection Board of India (DPBI)** established under the DPDP Act.

**Important note on DPBI operational status (as of the date of this policy):** The DPBI has been established as a statutory body. However, as of the date of this policy, its members have not been formally appointed and it does not yet have active enforcement capability. Complaints filed with the DPBI will be processed once the Board becomes fully operational.

DPBI complaint portal: [To be published by DPBI — currently unavailable]

In the interim, all complaints should be directed to our Grievance Officer listed in Section 1. We are committed to resolving all grievances regardless of DPBI operational status.

---

## 10. Contact Details

**Grievance Officer:**  
[Full Name]  
[Designation]  
[Institution Name]  
[Address]  
Email: [grievance@institution.domain]  
Phone: [+91-XXXXX XXXXX]  
Hours: Monday–Friday, 10:00–17:00 IST  

**Data Protection queries:**  
Email: [privacy@institution.domain]  
URL: [institution-url]/privacy

---

---

# PART B — Child-Friendly Summary

*Hi! This part is for you. It explains what MINDSPARK knows about you.*  
*Ask a parent or teacher if you have any questions.*

---

## What does MINDSPARK know about me?

MINDSPARK knows:
- Your name
- Your date of birth
- Your school roll number
- Your exam answers and scores

Your teacher and the institution keep all of this safe.

---

## Why does MINDSPARK have this information?

MINDSPARK uses your information so you can:
- Log in safely
- Take your maths tests
- Get your results

That is all. We do not use it for anything else.

---

## What happens during my exam?

When you are doing an exam, MINDSPARK can tell if you leave the exam tab.

This is to keep the exam fair for everyone. It is like a teacher watching the room.

This information is only used during your exam. It is deleted when your exam is over.

---

## What if the internet stops?

MINDSPARK saves your answers on your tablet. This is like writing in a notebook.

When the internet comes back, the answers are sent to your teacher. Then they are removed from the tablet.

---

## How long does MINDSPARK keep my information?

MINDSPARK keeps your exam results for 3 years. This is so your school has a record.

After 3 years, your information is deleted. Your parents will always be told 2 days before anything is deleted.

---

## What are my rights?

You — and your parent or guardian — can:

- Ask to see what information MINDSPARK has about you ✓
- Ask to fix anything that is wrong ✓
- Ask to delete your information ✓
- Change your mind and withdraw permission ✓

To do any of these things, your parent or guardian can email: **[privacy@institution.domain]**

---

*This Privacy Policy was last updated: [DATE]*  
*Document path: `docs/legal/privacy-policy.md`*
