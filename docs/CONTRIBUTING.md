# MINDSPARK — Contributing Guidelines

Thank you for contributing to MINDSPARK! This document provides guidelines and workflows for engineers working on the codebase.

---

## 1. Code Quality & Invariant Rules

Every contribution must adhere to the foundational constraints documented in [`CONSTRAINTS.md`](../CONSTRAINTS.md) and [`SECURITY.md`](../SECURITY.md):

1. **Zero TypeScript Errors:** `npm run tsc` must exit with code 0 before opening a PR.
2. **Timing Engine Sanctity:** Never use `setTimeout` or `setInterval` in `src/lib/anzan/`. All flash timing must be driven by the `requestAnimationFrame` delta accumulator.
3. **Service Role Isolation:** `src/lib/supabase/admin.ts` must never be imported into student routes (`src/app/(student)/`) or client-side components.
4. **Color Strictness:** Use `#991B1B` strictly for arithmetic negative numbers. Never use banned hex codes (`#FF6B6B`, `#121212`, `#1A1A1A`).
5. **Touch Ergonomics:** Ensure all interactive exam targets (MCQ buttons, answers) are $\ge 64 \times 64\text{px}$.

---

## 2. Branching & Commit Conventions

### Branch Naming
- `feature/<ticket-or-feature-name>` (e.g. `feature/guardian-consent-flow`)
- `fix/<bug-description>` (e.g. `fix/lobby-timer-drift`)
- `docs/<doc-update>` (e.g. `docs/api-error-catalog`)

### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(student): add 4-phase Flash Anzan timer bar
fix(auth): prevent student redirect loop on unverified consent
docs(prd): update functional specification to v2.0
test(engine): add RAF jitter regression test suite
```

---

## 3. Pre-Pull Request Checklist

Before submitting your pull request:

```bash
# 1. Type check
npm run tsc

# 2. Linting
npm run lint

# 3. Unit test suite (all 7 suites must pass)
npm run test

# 4. End-to-End smoke tests (Playwright)
npx playwright test e2e/smoke.spec.ts

# 5. Production build test
npm run build
```

---

## 4. Code Review Criteria

- **Architectural Fit:** Changes must align with the Next.js 15 App Router structure (`(admin)` vs `(student)` route groups).
- **Accessibility:** UI components must pass WCAG 2.1 AA checks (`aria-live` on timers, no retinal strobe effects on flashing digits).
- **Database Safety:** Schema changes must include a corresponding migration in `supabase/migrations/` and an updated entry in [`CHANGELOG.md`](../CHANGELOG.md).
