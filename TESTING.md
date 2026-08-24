# Testing

## Commands
- **Unit tests:** `npm run test` (or `npx vitest run --include 'src/**/*.test.{ts,tsx}'`)
  - *Expected:* 7 test suites pass (49+ tests) with 0 failures.
- **Unit tests (verbose):** `npm run test:unit`
  - *Expected:* Full test suite breakdown reporting pass state across arithmetic, anticheat, and offline modules.
- **Integration tests:** `npm run test:integration`
  - *Expected:* Integration test runner executed via `vitest.config.integration.ts`.
- **E2E tests (Playwright):** `npm run test:e2e`
  - *Expected:* Playwright test runner executes specs in `e2e/`.
- **Typecheck:** `npm run tsc`
  - *Expected:* 0 errors. Must run before every git commit.
- **Lint:** `npm run lint`
  - *Expected:* 0 ESLint errors in `src/`.

## Key Test Suites
- `src/lib/anzan/timing-engine.test.ts` — RAF delta accumulator drift < 5ms over 10s.
- `src/lib/anticheat/clock-guard.test.ts` — HMAC timestamp verification and clock tampering detection.
- `src/lib/anzan/number-generator.test.ts` — Arithmetic operand generator with zero consecutive duplicates.
- `src/components/profile/profile-helpers.test.ts` — Profile data parsing and formatting tests.
- `src/components/profile/profile-card.test.tsx` — Profile rendering and accessibility tests.
- `src/components/results/score-fraction.test.tsx` — Fractional score calculation and display.
- `src/app/actions/results.test.ts` — Server action result processing logic.

## Manual Checks
1. **Flash Anzan Precision:** Launch Flash Anzan in test mode and observe visual smoothness, number flashing duration, and absence of frame drops.
2. **Offline Exam Recovery:** Disconnect network in browser DevTools during active exam, submit answers, reconnect, and verify submission syncs to remote database via `/api/submissions/offline-sync`.
3. **RBAC Guarding:** Attempt direct navigation to `/admin/dashboard` while logged in with student credentials -> verify immediate redirect to login.
