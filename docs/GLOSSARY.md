# MINDSPARK — Domain & Technical Glossary

A dictionary of terms, acronyms, and specialized concepts used throughout the MINDSPARK mental arithmetic platform.

---

## 1. Mental Arithmetic & Abacus Concepts

### Abacus (Soroban)
A physical calculation tool consisting of beads sliding on rods. In mental math pedagogy, students practice moving physical beads until they can visualize the entire apparatus in their mind.

### Anzan / Mental Arithmetic
The Japanese term for mental calculation. Calculating mathematical equations purely in one's imagination using a visualized mental abacus without physical tools or scratch paper.

### Flash Anzan
A high-speed mental math training and evaluation method where a sequence of numbers flashes on screen one by one for brief durations (200ms to 3,000ms). Students visualize the numbers altering the beads on their imaginary abacus and compute the running sum instantly.

### Digits-Per-Minute (DPM)
A standardized performance metric measuring the speed and density of arithmetic calculation:
$$\text{DPM} = \frac{\text{Total Correct Digits Calculated}}{\text{Total Time in Minutes}}$$

### Vertical Abacus Drill
A classical arithmetic exam format where operands are stacked vertically in a column with high-contrast monospace alignment, requiring students to compute running addition/subtraction.

---

## 2. Technical & Architecture Terms

### RAF Delta Accumulator
A timing architecture implemented in `src/lib/anzan/timing-engine.ts` utilizing `requestAnimationFrame`. Instead of vulnerable `setTimeout` intervals, it accumulates fractional frame delta time between monitor refresh cycles (`performance.now()`), eliminating timing drift ($<5\text{ms}$ jitter).

### Dexie 4 Store
A wrapper around browser `IndexedDB` (`src/lib/offline/indexed-db-store.ts`) used to store full question banks and encrypted answer buffers locally on student devices for zero-loss offline exam taking.

### Clock Guard / HMAC Seal
A security mechanism in `src/lib/anticheat/clock-guard.ts` that cryptographically signs timestamps using HMAC SHA-256 (`HMAC_SECRET`). When an offline student reconnects, the server validates the signature sequence to verify that the student did not alter their local computer clock to gain extra time.

### Gated Result Release
A state in the student results flow where scorecards are immediately computed but the detailed question-by-question answer sheet is locked until an administrator reviews and releases the paper.

### DPDP Act (2023)
India's *Digital Personal Data Protection Act, 2023*. Mandates that platforms processing personal data of children under 18 obtain verifiable parental/guardian consent before granting access to services.

### Service Role Key
Supabase's administrative key (`SUPABASE_SERVICE_ROLE_KEY`) that completely bypasses Row Level Security (RLS). Banned from client-side bundles and restricted strictly to server actions.
