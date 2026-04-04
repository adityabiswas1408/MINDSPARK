/**
 * Accessibility Tests — axe-playwright
 * Test plan §6: 0 WCAG 2.2 AAA violations across all routes.
 *
 * Tags: wcag2a, wcag2aa, wcag21aa, wcag21aaa, wcag22aa
 *
 * Run:
 *   npx playwright test e2e/a11y.spec.ts --project=chromium
 *
 * Requires:
 *   npm install --save-dev @axe-core/playwright
 *
 * Credentials (from .env.test.local):
 *   E2E_STUDENT_ROLL  — seeded student roll number
 *   E2E_STUDENT_DOB   — student date of birth for login form
 *   E2E_ADMIN_EMAIL   — admin account email
 *   E2E_ADMIN_PASSWORD — admin account password
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ---------------------------------------------------------------------------
// Route lists — from pre-launch-checklist.md Gate 3
// ---------------------------------------------------------------------------
const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/students',
  '/admin/levels',
  '/admin/assessments',
  '/admin/monitor',
  '/admin/results',
  '/admin/announcements',
  '/admin/reports',
  '/admin/activity-log',
  '/admin/settings',
];

const STUDENT_ROUTES = [
  '/student/dashboard',
  '/student/exams',
  '/student/tests',
  '/student/results',
  '/student/profile',
];

// axe tags — WCAG 2.2 AAA (from CLAUDE.md: "wcag2a, wcag2aa, wcag21aa, wcag21aaa, wcag22aa")
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21aaa', 'wcag22aa'];

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------
async function loginAsAdmin(page: Page): Promise<void> {
  const email    = process.env.E2E_ADMIN_EMAIL    ?? 'admin@mindspark.local';
  const password = process.env.E2E_ADMIN_PASSWORD ?? 'admin-password';

  await page.goto('/login');
  await page.fill('[data-testid="roll-number"]', email);
  await page.fill('[data-testid="dob"]', password);
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 });
}

async function loginAsStudent(page: Page): Promise<void> {
  const roll = process.env.E2E_STUDENT_ROLL ?? 'STUDENT-001';
  const dob  = process.env.E2E_STUDENT_DOB  ?? '01/01/2010';

  await page.goto('/login');
  await page.fill('[data-testid="roll-number"]', roll);
  await page.fill('[data-testid="dob"]', dob);
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL('/student/dashboard', { timeout: 10_000 });
}

// ---------------------------------------------------------------------------
// A11Y-01: All admin routes — 0 WCAG 2.2 AAA violations
// ---------------------------------------------------------------------------
for (const route of ADMIN_ROUTES) {
  test(`A11Y-01: ${route} — 0 WCAG 2.2 AAA violations`, async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(AXE_TAGS)
      .analyze();

    expect(
      results.violations,
      `${route} has ${results.violations.length} violation(s): ` +
      results.violations.map((v) => `${v.id} — ${v.description}`).join('; ')
    ).toHaveLength(0);
  });
}

// ---------------------------------------------------------------------------
// A11Y-02: All student routes — 0 WCAG 2.2 AAA violations
// ---------------------------------------------------------------------------
for (const route of STUDENT_ROUTES) {
  test(`A11Y-02: ${route} — 0 WCAG 2.2 AAA violations`, async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(AXE_TAGS)
      .analyze();

    expect(
      results.violations,
      `${route} has ${results.violations.length} violation(s): ` +
      results.violations.map((v) => `${v.id} — ${v.description}`).join('; ')
    ).toHaveLength(0);
  });
}

// ---------------------------------------------------------------------------
// A11Y-03: Flash number — aria-hidden="true" during Phase 2
// (WCAG 2.2 AAA: rapidly changing content must not be announced)
// ---------------------------------------------------------------------------
test('A11Y-03: flash-number has aria-hidden="true" during Phase 2', async ({ page }) => {
  await loginAsStudent(page);
  // Navigate to a LIVE test exam — this requires a seeded TEST paper
  await page.goto('/student/tests');
  await page.waitForLoadState('networkidle');

  // Skip if no LIVE test available in this environment
  const testCard = page.locator('[data-testid^="test-card-"]').first();
  if (await testCard.count() === 0) {
    test.skip();
    return;
  }

  await testCard.click();
  await page.click('[data-testid="ready-button"]');
  await page.waitForTimeout(3_200); // interstitial

  await page.waitForSelector('[data-testid="anzan-flash-view"]', { timeout: 10_000 });

  // 1. flash-number span must be fully hidden from AT (aria-hidden="true")
  //    — AT users rely on Ticker Mode, not the flash number directly
  const ariaHidden = await page.locator('.flash-number').getAttribute('aria-hidden');
  expect(ariaHidden).toBe('true');

  // 2. Phase 2 wrapper region must silence live announcements (08_a11y.md §6.1)
  //    aria-live="off" — content updates NOT announced by screen reader
  //    aria-busy="true" — conveys "something is happening" without reading it out
  const flashRegion = page.locator('[data-testid="anzan-flash-view"]');
  await expect(flashRegion).toHaveAttribute('aria-live', 'off');
  await expect(flashRegion).toHaveAttribute('aria-busy', 'true');

  // 3. Flash number must never announce via assertive live region
  const ariaLive = await page.locator('.flash-number').getAttribute('aria-live');
  expect(ariaLive).not.toBe('assertive');
});

// ---------------------------------------------------------------------------
// A11Y-04: MCQ buttons — role="radio" + aria-checked
// ---------------------------------------------------------------------------
test('A11Y-04: MCQ option buttons have correct ARIA roles and states', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/student/exams');
  await page.waitForLoadState('networkidle');

  const examCard = page.locator('[data-testid^="exam-card-"]').first();
  if (await examCard.count() === 0) {
    test.skip();
    return;
  }

  await examCard.click();
  await page.click('[data-testid="ready-button"]');
  await page.waitForTimeout(3_200);
  await page.waitForSelector('[data-testid="exam-vertical-view"]', { timeout: 10_000 });

  const optionA = page.locator('[data-testid="mcq-option-A"]');
  await expect(optionA).toHaveAttribute('role', 'radio');
  await expect(optionA).toHaveAttribute('aria-checked', 'false');

  await optionA.click();
  await expect(optionA).toHaveAttribute('aria-checked', 'true');
});

// ---------------------------------------------------------------------------
// A11Y-05: Exam timer — aria-live="polite", aria-atomic="true"
// (Announces only at milestone moments — not every tick)
// ---------------------------------------------------------------------------
test('A11Y-05: exam timer has correct aria-live and aria-atomic attributes', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/student/exams');
  await page.waitForLoadState('networkidle');

  const examCard = page.locator('[data-testid^="exam-card-"]').first();
  if (await examCard.count() === 0) {
    test.skip();
    return;
  }

  await examCard.click();
  await page.click('[data-testid="ready-button"]');
  await page.waitForTimeout(3_200);
  await page.waitForSelector('[data-testid="exam-timer"]', { timeout: 10_000 });

  const timer = page.locator('[data-testid="exam-timer"]');
  await expect(timer).toHaveAttribute('aria-live', 'polite');
  await expect(timer).toHaveAttribute('aria-atomic', 'true');

  // Timer must NOT announce every tick (aria-relevant would cause that)
  const ariaRelevant = await timer.getAttribute('aria-relevant');
  expect(ariaRelevant).toBeNull();
});
