# Decisions

## 2026-03-10 — requestAnimationFrame Delta Accumulator for Flash Anzan
**Decision:** Implement Flash Anzan sequence timing exclusively via requestAnimationFrame delta accumulation in `src/lib/anzan/timing-engine.ts`, banning `setTimeout` and `setInterval`.
**Why:** Browser timers drift significantly under background load and timer coalescing, corrupting mental arithmetic flash intervals (200ms-3000ms). RAF delta timing guarantees drift stays below 5ms across sustained sequences.

## 2026-03-15 — Dexie 4 IndexedDB with HMAC Clock Guard for Offline Exams
**Decision:** Use Dexie 4 as the client-side offline storage engine paired with an HMAC timestamp sealing mechanism.
**Why:** Unstable student network connections during exams require full question paper caching and local answer persistence. The HMAC clock guard prevents local client clock manipulation during offline periods.

## 2026-03-18 — Unified Forest Green Design System
**Decision:** Standardize entire UI on a unified Forest Green light-mode design palette anchored by `#1A3829` (Forest Green 800) with dark red `#991B1B` reserved exclusively for negative arithmetic operands.
**Why:** Establishes a calm, focused, distraction-free examination aesthetic suitable for children and youth (ages 6–18) while meeting WCAG 2.1 AA / 2.2 AAA contrast standards.

## 2026-03-20 — Server Actions with Strict ActionResult<T> Contract
**Decision:** Standardize all backend mutations on Next.js Server Actions returning `ActionResult<T>` (`{ ok: true, data } | { ok: false, error }`) with mandatory `requireRole()` checks.
**Why:** Provides end-to-end TypeScript type safety across server-client boundaries while enforcing server-side RBAC at mutation entry points.

## 2026-03-22 — sanitize-html for Rich Text Over DOMPurify
**Decision:** Use `sanitize-html` on server-side actions instead of client DOMPurify for rendering TipTap announcements.
**Why:** DOMPurify relies on browser DOM APIs (`window.DOMParser`) which crash in React Server Component (RSC) and Server Action execution environments.

## 2026-03-24 — Submissions Composite Unique Index (session_id, student_id)
**Decision:** Enforce composite unique indexing `(session_id, student_id)` on the `submissions` table and require `onConflict: 'session_id,student_id'` in all upsert queries.
**Why:** Prevents duplicate submissions per student session. Single-column conflict targets caused silent update failures in PostgreSQL.

## 2026-03-28 — Supabase Realtime Broadcast Channels Over Long Polling
**Decision:** Use Supabase Realtime `Broadcast` channels (`exam:{paper_id}`) with random connection jitter for live room monitoring, reserving Presence only for active lobby counts.
**Why:** Reduces PostgreSQL WAL replication overhead by 95% under high student concurrency (2,500 simultaneous examinees) while maintaining sub-second status latency.

## 2026-04-02 — DM Sans and DM Mono Typeface Pairing
**Decision:** Pair `DM Sans` for UI labels and headings with `DM Mono` (with `tabular-nums`) for all equations, countdown timers, scores, and candidate roll numbers.
**Why:** Monospace tabular numbers eliminate horizontal jitter during rapid Flash Anzan sequences and align arithmetic columns vertically for children.

## 2026-04-05 — Route Group Restructuring for (admin)/admin and (student)/student
**Decision:** Move admin pages into `src/app/(admin)/admin/` and student pages into `src/app/(student)/student/`.
**Why:** Ensures clear, predictable URL routing (`/admin/dashboard`, `/student/dashboard`) matching role-based access control and navigation requirements.

## 2026-04-08 — pagehide Keepalive Route Handler Over WebSocket Close for Teardown
**Decision:** Implement `/api/submissions/teardown` as a dedicated HTTP POST Route Handler targeted by `navigator.sendBeacon` and `fetch({ keepalive: true })` on `pagehide` events instead of relying on WebSocket disconnect events.
**Why:** Mobile and desktop browsers frequently kill WebSocket TCP sockets abruptly when tabs close before clean closure frames can transmit. HTTP keepalive guarantees delivery.
