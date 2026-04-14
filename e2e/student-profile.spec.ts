/**
 * /student/profile e2e — covers Frame 1 (populated, collapsed),
 * Frame 2 (More Info toggle), and the sidebar Support removal.
 *
 * Auth helper inlined per the smoke.spec.ts pattern. Credentials are
 * read from the same E2E_STUDENT_* env vars with the same defaults.
 */
import { test, expect, type Page } from '@playwright/test';

const ROLL = process.env.E2E_STUDENT_ROLL ?? 'STUDENT-001';
const DOB  = process.env.E2E_STUDENT_DOB  ?? '01/01/2010';

async function loginAsStudent(page: Page): Promise<void> {
  await page.goto('/login');
  await expect(page.locator('[data-testid="roll-number"]')).toBeVisible();
  await page.fill('[data-testid="roll-number"]', ROLL);
  await page.fill('[data-testid="dob"]', DOB);
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL('/student/dashboard', { timeout: 10_000 });
}

test.describe('/student/profile', () => {
  test('Frame 1 — populated state with collapsed More Info', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/student/profile');

    // Page header
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(
      page.getByText('Your school record. Contact your teacher to update any of these details.'),
    ).toBeVisible();

    // Hero strip — name + role line
    await expect(page.locator('.profile-name')).toBeVisible();
    await expect(page.locator('.profile-role')).toContainText('Student');
    await expect(page.locator('.profile-role')).toContainText('Level');

    // School Info section visible
    await expect(page.locator('.profile-card .section-title')).toContainText('School Info');

    // More Info collapsed by default — DOB row should not be in the DOM
    await expect(page.getByText('Date of Birth')).not.toBeVisible();

    // Cohort must be absent everywhere
    await expect(page.locator('.profile-card')).not.toContainText('Cohort');
  });

  test('Frame 2 — More Info toggles open and closed', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/student/profile');

    const toggle = page.getByRole('button', { name: /more info/i });
    await toggle.click();
    await expect(page.getByText('Date of Birth')).toBeVisible();
    await expect(page.getByText('Guardian Name')).toBeVisible();

    await toggle.click();
    await expect(page.getByText('Date of Birth')).not.toBeVisible();
  });

  test('Sidebar — Profile is active and Support is gone', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/student/profile');

    // Profile nav item should be visible
    const profileNav = page.locator('a[href="/student/profile"]');
    await expect(profileNav).toBeVisible();

    // Support nav must NOT exist
    await expect(page.locator('a[href="/student/support"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Support$/ })).toHaveCount(0);
  });
});
