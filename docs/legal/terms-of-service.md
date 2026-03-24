# MINDSPARK Terms of Service

> **Effective date:** [INSERT DATE BEFORE PUBLISHING]  
> **Document path:** `docs/legal/terms-of-service.md`  
> **Published at:** `[institution-url]/terms`  
> **Jurisdiction:** Republic of India  
> **Governing law:** Indian Contract Act 1872, Information Technology Act 2000, Digital Personal Data Protection Act 2023

*These Terms of Service ("Terms") constitute a legally binding agreement. Continued use of the MINDSPARK platform by teachers, administrators, or students (through their guardian's consent) constitutes acceptance of these Terms in full.*

---

## Table of Contents

1. [Parties & Definitions](#1-parties--definitions)
2. [Scope of Service](#2-scope-of-service)
3. [Permitted Use](#3-permitted-use)
4. [Prohibited Conduct](#4-prohibited-conduct)
5. [Guardian & Parental Consent Obligations](#5-guardian--parental-consent-obligations)
6. [Examination Integrity Rules](#6-examination-integrity-rules)
7. [Data Processing Acknowledgement](#7-data-processing-acknowledgement)
8. [Platform Availability & Force Majeure](#8-platform-availability--force-majeure)
9. [Limitation of Liability](#9-limitation-of-liability)
10. [Intellectual Property](#10-intellectual-property)
11. [Termination & Data Return](#11-termination--data-return)
12. [Governing Law & Jurisdiction](#12-governing-law--jurisdiction)
13. [Grievance Redressal](#13-grievance-redressal)

---

## 1. Parties & Definitions

**"Institution"** means [Institution Legal Name], the educational institution operating the MINDSPARK platform, registered at [address].

**"Platform"** or **"MINDSPARK"** means the digital mental arithmetic assessment software accessible at [institution-url], including all associated web interfaces, APIs, and offline components.

**"Administrator"** means a person designated by the Institution with administrative access to the Platform.

**"Teacher"** means a person designated by the Institution to manage student cohorts and assessments.

**"Student"** means an individual enrolled by the Institution to use the Platform for educational assessments. All students are presumed to be minors under 18 years of age unless otherwise verified.

**"Guardian"** means the parent, legal guardian, or person with parental responsibility for a Student.

**"Assessment"** means a scheduled examination conducted through the Platform, of two types: **EXAM** (vertical equation format) or **TEST** (Flash Anzan timed-stimulus format).

**"Live Examination"** means an Assessment in the LIVE state, actively accessible to enrolled students.

**"Offline Cache"** means temporary local storage on the student's device (using browser IndexedDB technology) that preserves examination data during connectivity interruptions.

**"Service Provider"** means third-party infrastructure providers engaged by the Institution to operate the Platform, including Supabase (database and authentication) and Vercel (application hosting).

---

## 2. Scope of Service

MINDSPARK is a **digital assessment platform** for mental arithmetic examinations. The Platform:

**Does** provide:
- Scheduling and delivery of fixed, administrator-configured EXAM and TEST assessments
- Secure login for enrolled students using roll number and date of birth authentication
- Real-time examination monitoring for authorised teachers and administrators
- Academic result storage, review, and publication to enrolled students
- Offline resilience during temporary connectivity loss

**Does not** provide:
- Tutoring, coaching, or self-directed learning content
- Practice assessments or on-demand worksheet generation
- Parent or guardian portals (Phase 1)
- Certification or qualification issuance
- Integration with any national educational authority or examination board

The Institution is solely responsible for its pedagogical decisions, curriculum design, grading policies, and communications with guardians. MINDSPARK provides the technical infrastructure; it does not determine educational outcomes.

---

## 3. Permitted Use

Access to the Platform is limited to:

| User type | Permitted access |
|-----------|----------------|
| **Administrator** | Platform configuration, student and assessment management, results publication, data export |
| **Teacher** | Monitoring of assigned student cohorts during Live Examinations, review of results for assigned cohorts |
| **Student** | Participation in assessments to which they are enrolled; review of published results |

Use of the Platform is permitted **solely for educational assessment purposes** by the Institution named in these Terms.

The Platform is **not** licensed for:
- Resale, sublicensing, or provision to any party other than the Institution
- Competitive intelligence or benchmarking against other platforms
- Use by institutions or individuals not party to a written agreement with the Platform operator

---

## 4. Prohibited Conduct

The following conduct is strictly prohibited by all users:

**Academic integrity violations:**
- Submitting examination answers on behalf of another student
- Accessing, sharing, or distributing examination questions or answer keys
- Using any automated tool, script, or external assistance during an assessment
- Using a secondary device, communication channel, or reference material during a Live Examination

**Technical abuse:**
- Attempting to bypass, disable, or circumvent the Platform's Row Level Security, HMAC validation, or anti-cheat mechanisms
- Injecting fraudulent data into the offline submission pipeline
- Attempting to enumerate other students' data by probing API endpoints
- Reverse-engineering the HMAC Clock Guard or submission signature mechanisms

**Account misuse:**
- Sharing login credentials with any other person
- Creating accounts for individuals who have not provided required parental consent
- Accessing the Platform using another student's credentials

**General prohibited conduct:**
- Introducing malicious code, scripts, or content to the Platform
- Using the Platform in violation of any applicable Indian law

Violations will result in examination invalidation, account suspension, and may be reported to relevant educational or regulatory authorities.

---

## 5. Guardian & Parental Consent Obligations

Given that all Students are presumed to be minors:

**5.1 Consent prerequisite:** No student account may be created, and no student may access the Platform, until the Institution has obtained and verified parental consent from the relevant Guardian in accordance with Section 9 of the DPDP Act 2023 and Rule 10 of the DPDP Rules 2025. The Institution is solely responsible for this verification.

**5.2 Institution's obligation:** The Institution represents and warrants that it will:
- Collect and verify guardian consent before provisioning any student account
- Maintain records of consent with the date, method of verification, and guardian identity
- Withdraw access and initiate data deletion within 30 days of any valid consent withdrawal request
- Notify the Platform operator of any consent withdrawal that affects a student account

**5.3 Consequences of non-compliance:** Any student access facilitated without valid parental consent constitutes a breach of these Terms. The Institution accepts sole liability for any consequence arising from such breach, including under the DPDP Act.

---

## 6. Examination Integrity Rules

**6.1 Tab monitoring disclosure:**

> *"The platform records an aggregate count of browser tab-switching events per examination session for integrity purposes. This count is made available to the administering teacher. Individual event timestamps are not retained after the session ends. This monitoring is disclosed in our Privacy Policy and constitutes a material term of platform access."*

By accessing a Live Examination, the student (and their Guardian, whose consent was required to create the account) acknowledges this monitoring. The complete anti-cheat disclosure is published in the [Privacy Policy](./privacy-policy.md), Section 5.

**6.2 Acceptable examination environment:** Students must undertake examinations:
- On a device with at least 500MB of free storage space (for offline cache operation)
- In a stable internet-connected environment where possible
- Without assistance from other persons, devices, or reference materials
- Without screen sharing, remote access software, or monitoring tools active

**6.3 Examination results and integrity flags:** Where the Platform records integrity events (tab switches, disconnections, reconnection patterns), these are made available to the administering teacher for review. The teacher and Institution retain sole discretion over whether to invalidate an assessment based on this data.

**6.4 Flash Anzan interval limits:** Flash Anzan TEST assessments use a minimum flash interval of 200ms. This minimum is enforced at the database constraint level and cannot be reduced by administrators. This restriction exists for student well-being in compliance with Section 9(2) of the DPDP Act.

---

## 7. Data Processing Acknowledgement

**7.1 Privacy Policy incorporation:** The Institution's and students' use of the Platform is subject to the [MINDSPARK Privacy Policy](./privacy-policy.md), which is incorporated into these Terms by reference. In the event of conflict between these Terms and the Privacy Policy on a matter of personal data processing, the Privacy Policy prevails.

**7.2 Offline data architecture:**

> *"The platform employs local browser storage (IndexedDB) to preserve examination responses during connectivity interruptions. The institution acknowledges this offline-first architecture and accepts responsibility for ensuring students use devices with adequate storage (minimum 500MB free space)."*

The Institution acknowledges that:
- Examination answers may be temporarily stored on students' devices
- This storage is cleared after successful server synchronisation
- Loss of offline-cached data on student devices due to device failure, forced browser reset, or insufficient storage is the responsibility of the Institution and its device management practices

**7.3 Third-party processors:** The Platform operates on infrastructure provided by:
- **Supabase** (database, authentication, realtime): [Supabase DPA available at supabase.com/legal]
- **Vercel** (application hosting): [Vercel DPA available at vercel.com/legal]

The Institution acknowledges these sub-processors. Their engagement is necessary for Platform operation.

---

## 8. Platform Availability & Force Majeure

**8.1 Service availability:** The Institution acknowledges that the Platform is a hosted web service and availability is not guaranteed at 100% uptime. Planned maintenance will be communicated at least 24 hours in advance and will not be scheduled within 2 hours of a scheduled Live Examination.

**8.2 Force Majeure:** Neither the Institution nor the Platform operator shall be liable for any failure or delay in Platform performance caused by events beyond reasonable control ("Force Majeure Events"), including but not limited to:

- Internet connectivity failures at the examination venue or affecting end-user devices
- Service disruptions by third-party infrastructure providers (including Supabase service outages and Vercel deployment failures)
- Government-directed platform shutdowns, content restrictions, or internet governance actions
- Natural disasters, power grid failures, or telecommunications infrastructure failures
- Cyberattacks, distributed denial-of-service attacks, or force-injected malicious traffic
- Pandemic-related restrictions affecting physical access to examination venues

**8.3 Force Majeure — re-examination rights:** In the event that a Force Majeure Event causes material disruption to a Live Examination (affecting more than 20% of enrolled students), the Institution has full discretion to:
- Declare the affected examination void and schedule a re-examination
- Award marks based on the partial data gathered before the disruption event, at the teacher's discretion
- Extend the examination window by the Force Close + Force Live mechanism (available within 10 minutes of forced closure)

The Platform shall not be liable for any academic consequence arising from an examination voided or invalidated due to a Force Majeure Event.

---

## 9. Limitation of Liability

**9.1 Exam score outcomes:**

> *"MINDSPARK shall not be liable for examination score outcomes resulting from: (a) network connectivity failures outside the platform's control; (b) student device hardware limitations; (c) student non-compliance with examination integrity rules."*

**9.2 Data loss:**
The Platform shall not be liable for loss of examination data caused by:
- Student device failure, browser forced reset, or device storage exhaustion below the recommended 500MB
- Internet connectivity interruption lasting beyond the offline cache capacity
- Guardian or student voluntary deletion of browser data (clearing browser cache, cookies, or storage)

**9.3 Cap on liability:** To the maximum extent permitted by applicable Indian law, the total aggregate liability of the Platform operator for any claim arising from or related to use of the Platform shall not exceed the fees (if any) paid by the Institution to the Platform operator in the 12-month period preceding the claim.

**9.4 No consequential damages:** The Platform operator shall not be liable for indirect, incidental, special, exemplary, or consequential damages including loss of educational opportunity, loss of academic standing, or loss of examination fees paid to external bodies.

**9.5 Indemnification:** The Institution shall indemnify and hold harmless the Platform operator from any claim, liability, or expense arising from:
- Provisioning student accounts without valid parental consent
- Failure to maintain adequate device standards at the examination venue
- Any use of examination integrity data in a manner inconsistent with this agreement or applicable law

---

## 10. Intellectual Property

**10.1 Platform ownership:** All software, code, designs, algorithms, and technical systems comprising the MINDSPARK platform are the intellectual property of the Platform operator or its licensors. Nothing in these Terms grants the Institution any ownership rights in the Platform.

**10.2 Examination content:** Assessment questions, marking schemes, and examination papers created by the Institution's administrators within the Platform are the intellectual property of the Institution. The Platform operator has no claim to curriculum content authored by the Institution.

**10.3 Platform data:** Anonymised, aggregated, and de-identified operational data (excluding personal data) may be used by the Platform operator to improve platform performance. No personal data is used for this purpose.

**10.4 Open-source components:** The Platform incorporates open-source software components. A list of open-source dependencies and their licences is available at `[institution-url]/open-source`.

---

## 11. Termination & Data Return

**11.1 Termination by the Institution:** The Institution may terminate its use of the Platform at any time by written notice to the Platform operator. Upon termination:
- All student access is suspended within 24 hours
- The Institution may request a full data export (CSV format) within 30 days of termination notice
- Following successful data export or expiry of the 30-day export window (whichever comes first), all personal data will be deleted per the retention schedule in the Privacy Policy

**11.2 Termination by the Platform operator:** The Platform operator may terminate access with 30 days' written notice for material breach of these Terms, or immediately in the event of evidence of fraudulent use, abuse, or harm to students.

**11.3 Data portability:** On request, the Institution may receive a full export of all student records, assessment data, and results in a machine-readable format (JSON or CSV). This export will be provided within 30 days of a valid request and prior to any account closure.

**11.4 Post-termination retention:** Following account closure, personal data is retained only for the periods specified in the Privacy Policy (typically 3 years for assessment records). Retention serves audit, legal, and student record integrity purposes.

---

## 12. Governing Law & Jurisdiction

**12.1 Governing law:** These Terms are governed by and construed in accordance with the laws of the Republic of India, including but not limited to the Indian Contract Act 1872, the Information Technology Act 2000, and the Digital Personal Data Protection Act 2023.

**12.2 Jurisdiction:** Any dispute arising from or related to these Terms that cannot be resolved through the grievance mechanism in Section 13 shall be submitted to the exclusive jurisdiction of the courts at [City, State], India.

**12.3 Dispute resolution:** Before initiating formal legal proceedings, parties agree in good faith to attempt resolution through the grievance mechanism in Section 13 for a period of 60 days.

---

## 13. Grievance Redressal

In accordance with Section 13 of the DPDP Act 2023 and Rule 7 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021:

**Grievance Officer:**  
[Full Name]  
[Designation], [Institution Name]  
Email: [grievance@institution.domain]  
Phone: [+91-XXXXX XXXXX]  
Address: [Full institutional address]  
Hours: Monday–Friday, 10:00–17:00 IST

**Process:**
1. Submit grievance in writing to the Grievance Officer via the email or address above
2. Acknowledge receipt: within **24 hours**
3. Resolution or written explanation: within **30 days** of submission

If the grievance concerns personal data processing, it will be handled under the privacy rights mechanism described in the Privacy Policy, Section 7–8.

If unresolved after 30 days, the complainant may file with the Data Protection Board of India once the Board commences enforcement operations.

---

*These Terms were last updated: [DATE]*  
*Document path: `docs/legal/terms-of-service.md`*  
*For questions: [privacy@institution.domain]*
