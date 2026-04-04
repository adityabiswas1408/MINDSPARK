/**
 * Smoke tests — @smoke
 * Run on every branch, both Chromium and Firefox.
 *
 * These tests verify the critical path is alive end-to-end:
 *   1. The app serves a login page
 *   2. A student can authenticate with roll number + date of birth
 *   3. After login, the student lands on /student/dashboard
 *   4. The dashboard renders key structural elements (sidebar, heading)
 *
 * Credentials are read from environment variables — never hardcoded.
 * Set these in .env.test.local (not committed) for local runs:
 *
 *   E2E_STUDENT_ROLL=STUDENT-001
 *   E2E_STUDENT_DOB=01/01/2010
 *
 * The seeded test student must exist in your Supabase database.
 * Run `npx supabase db reset` with the seed file to create it locally.
 */
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Credentials — fall back to seed defaults so smoke tests run out of the box
// against a locally reset Supabase instance.
// ---------------------------------------------------------------------------
const ROLL = process.env.E2E_STUDENT_ROLL ?? 'STUDENT-001';
const DOB  = process.env.E2E_STUDENT_DOB  ?? '01/01/2010';

// ---------------------------------------------------------------------------
// Helper: log in as a student and wait for navigation to complete
// ---------------------------------------------------------------------------
async function loginAsStudent(page: Page, roll: string, dob: string): Promise<void> {
  await page.goto('/login');

  // Page must render the login form
  await expect(page.locator('[data-testid="roll-number"]')).toBeVisible();
  await expect(page.locator('[data-testid="dob"]')).toBeVisible();

  await page.fill('[data-testid="roll-number"]', roll);
  await page.fill('[data-testid="dob"]', dob);
  await page.click('[data-testid="login-submit"]');
}

// ---------------------------------------------------------------------------
// Smoke suite
// ---------------------------------------------------------------------------
test.describe('@smoke Student authentication and dashboard navigation', () => {

  // SM-01: Login page renders correctly (no auth required)
  test('SM-01: /login renders login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/MINDSPARK/i);
    await expect(page.locator('[data-testid="roll-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="dob"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
  });

  // SM-02: Unauthenticated request to /student/dashboard redirects to /login
  test('SM-02: unauthenticated /student/dashboard redirects to /login', async ({ page }) => {
    await page.goto('/student/dashboard');

    // Middleware must redirect — we should land on /login, not get a 404 or blank page
    await expect(page).toHaveURL(/\/login/);
  });

  // SM-03: Unauthenticated request to /admin/dashboard redirects to /login
  test('SM-03: unauthenticated /admin/dashboard redirects to /login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  // SM-04: Core smoke — student logs in and lands on /student/dashboard
  test('SM-04: student logs in and navigates to /student/dashboard', async ({ page }) => {
    await loginAsStudent(page, ROLL, DOB);

    // After successful auth, middleware should redirect to /student/dashboard
    await expect(page).toHaveURL('/student/dashboard', { timeout: 10_000 });

    // Dashboard must render — verify structural elements are present
    // These are layout-level checks, not content checks (content is seeded-data dependent)
    await expect(page.locator('[data-testid="student-sidebar"]')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  // SM-05: Login with wrong credentials shows an error, does not navigate away
  test('SM-05: wrong credentials show error, no redirect', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="roll-number"]', 'DOES-NOT-EXIST');
    await page.fill('[data-testid="dob"]', '01/01/2000');
    await page.click('[data-testid="login-submit"]');

    // Must stay on /login — no redirect on bad credentials
    await expect(page).toHaveURL(/\/login/);

    // An error message must be visible (text is implementation-defined)
    // We check for any element with role="alert" or data-testid="login-error"
    const errorLocator = page.locator('[role="alert"], [data-testid="login-error"]');
    await expect(errorLocator).toBeVisible({ timeout: 5_000 });
  });

});
