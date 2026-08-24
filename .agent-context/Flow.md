# Verified Code Flows

> Running catalog of user & system flows traced through real code execution.
> Entries are added only after empirical verification in code/tests. Do not backfill from documentation.

### FLOW-001: Anti-Cheat Lifecycle (Standard Exams)
- **Trigger:** `exam-page-client.tsx` mounts for a standard exam.
- **Path:** `useEffect` in `exam-page-client.tsx` initializes `startTabMonitor()` and `registerTeardownListener()`. These listeners bind to global window/document events. The `exam-vertical-view.tsx` component is rendered as a child, implicitly inheriting full anti-cheat protection.
- **Files Touched:** `exam-page-client.tsx`, `exam-vertical-view.tsx`, `tab-monitor.ts`, `teardown.ts`.
- **Verified By:** Manual source-code flow check on 2026-08-23.

## Entry Format
```markdown
### FLOW-XXX: [Flow Title]
- **Trigger:** [UI action, API call, or event]
- **Path:** [Step-by-step code path from entry point to database]
- **Files Touched:** [List of files involved in the execution chain]
- **Verified By:** [Test name, terminal command, or manual run with timestamp]
```

---

*(No flows added yet. Flows will be populated as each feature and route is audited and verified in upcoming phases.)*

### FLOW-002: Announcement Creation & Security Pipeline
- **Trigger:** Admin clicks "Publish Announcement" in `announcements-client.tsx`.
- **Path:** Compose in TipTap editor → Extract HTML and JSON payloads → Submit to Server Action `createAnnouncement` → `requireRole('admin')` RBAC check → Zod Schema validation (`CreateAnnouncementSchema`) → HTML sanitization via `isomorphic-dompurify` → Write to DB (`adminSupabase`) → Insert audit log into `activity_logs` → Client receives `ok: true` and updates state to render announcement card.
- **Files Touched:** `announcements-client.tsx`, `tiptap-editor.tsx`, `announcements.ts`
- **Verified By:** `npm run test` (unit tests added for RBAC and XSS) and `npm run build` on 2026-08-24.
