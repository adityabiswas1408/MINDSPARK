# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> @smoke Student authentication and dashboard navigation >> SM-01: /login renders login form
- Location: e2e\smoke.spec.ts:51:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1   | /**
  2   |  * Smoke tests — @smoke
  3   |  * Run on every branch, both Chromium and Firefox.
  4   |  *
  5   |  * These tests verify the critical path is alive end-to-end:
  6   |  *   1. The app serves a login page
  7   |  *   2. A student can authenticate with roll number + date of birth
  8   |  *   3. After login, the student lands on /student/dashboard
  9   |  *   4. The dashboard renders key structural elements (sidebar, heading)
  10  |  *   5. The student can navigate to exams and start a live exam
  11  |  *
  12  |  * Credentials are read from environment variables — never hardcoded.
  13  |  * Set these in .env.test.local (not committed) for local runs:
  14  |  *
  15  |  *   E2E_STUDENT_ROLL=STUDENT-001
  16  |  *   E2E_STUDENT_DOB=01/01/2010
  17  |  *
  18  |  * The seeded test student must exist in your Supabase database.
  19  |  * Run `npx supabase db reset` with the seed file to create it locally.
  20  |  */
  21  | import { test, expect, type Page } from '@playwright/test';
  22  | 
  23  | // ---------------------------------------------------------------------------
  24  | // Credentials — fall back to seed defaults so smoke tests run out of the box
  25  | // against a locally reset Supabase instance.
  26  | // ---------------------------------------------------------------------------
  27  | const ROLL = process.env.E2E_STUDENT_ROLL ?? 'STUDENT-001';
  28  | const DOB  = process.env.E2E_STUDENT_DOB  ?? '01/01/2010';
  29  | 
  30  | // ---------------------------------------------------------------------------
  31  | // Helper: log in as a student and wait for navigation to complete
  32  | // ---------------------------------------------------------------------------
  33  | async function loginAsStudent(page: Page, roll: string, dob: string): Promise<void> {
  34  |   await page.goto('/login');
  35  | 
  36  |   // Page must render the login form
  37  |   await expect(page.locator('[data-testid="roll-number"]')).toBeVisible();
  38  |   await expect(page.locator('[data-testid="dob"]')).toBeVisible();
  39  | 
  40  |   await page.fill('[data-testid="roll-number"]', roll);
  41  |   await page.fill('[data-testid="dob"]', dob);
  42  |   await page.click('[data-testid="login-submit"]');
  43  | }
  44  | 
  45  | // ---------------------------------------------------------------------------
  46  | // Smoke suite
  47  | // ---------------------------------------------------------------------------
  48  | test.describe('@smoke Student authentication and dashboard navigation', () => {
  49  | 
  50  |   // SM-01: Login page renders correctly (no auth required)
  51  |   test('SM-01: /login renders login form', async ({ page }) => {
> 52  |     await page.goto('/login');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  53  | 
  54  |     await expect(page).toHaveTitle(/MINDSPARK/i);
  55  |     await expect(page.locator('[data-testid="roll-number"]')).toBeVisible();
  56  |     await expect(page.locator('[data-testid="dob"]')).toBeVisible();
  57  |     await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
  58  |   });
  59  | 
  60  |   // SM-02: Unauthenticated request to /student/dashboard redirects to /login
  61  |   test('SM-02: unauthenticated /student/dashboard redirects to /login', async ({ page }) => {
  62  |     await page.goto('/student/dashboard');
  63  | 
  64  |     // Middleware must redirect — we should land on /login, not get a 404 or blank page
  65  |     await expect(page).toHaveURL(/\/login/);
  66  |   });
  67  | 
  68  |   // SM-03: Unauthenticated request to /admin/dashboard redirects to /login
  69  |   test('SM-03: unauthenticated /admin/dashboard redirects to /login', async ({ page }) => {
  70  |     await page.goto('/admin/dashboard');
  71  |     await expect(page).toHaveURL(/\/login/);
  72  |   });
  73  | 
  74  |   // SM-04: Core smoke — student logs in and lands on /student/dashboard
  75  |   test('SM-04: student logs in and navigates to /student/dashboard', async ({ page }) => {
  76  |     await loginAsStudent(page, ROLL, DOB);
  77  | 
  78  |     // After successful auth, middleware should redirect to /student/dashboard
  79  |     await expect(page).toHaveURL('/student/dashboard', { timeout: 10_000 });
  80  | 
  81  |     // Dashboard must render — verify structural elements are present
  82  |     // These are layout-level checks, not content checks (content is seeded-data dependent)
  83  |     await expect(page.locator('[data-testid="student-sidebar"]')).toBeVisible();
  84  |     await expect(page.locator('h1, h2').first()).toBeVisible();
  85  |   });
  86  | 
  87  |   // SM-05: Login with wrong credentials shows an error, does not navigate away
  88  |   test('SM-05: wrong credentials show error, no redirect', async ({ page }) => {
  89  |     await page.goto('/login');
  90  | 
  91  |     await page.fill('[data-testid="roll-number"]', 'DOES-NOT-EXIST');
  92  |     await page.fill('[data-testid="dob"]', '01/01/2000');
  93  |     await page.click('[data-testid="login-submit"]');
  94  | 
  95  |     // Must stay on /login — no redirect on bad credentials
  96  |     await expect(page).toHaveURL(/\/login/);
  97  | 
  98  |     // An error message must be visible (text is implementation-defined)
  99  |     // We check for any element with role="alert" or data-testid="login-error"
  100 |     const errorLocator = page.locator('[role="alert"], [data-testid="login-error"]');
  101 |     await expect(errorLocator).toBeVisible({ timeout: 5_000 });
  102 |   });
  103 | 
  104 |   // SM-06: Student can navigate to exam lobby and reach the exam screen
  105 |   test('SM-06: student navigates to lobby and exam screen', async ({ page }) => {
  106 |     await loginAsStudent(page, ROLL, DOB);
  107 |     await expect(page).toHaveURL('/student/dashboard', { timeout: 10_000 });
  108 | 
  109 |     // Navigate to Exams page
  110 |     await page.goto('/student/exams');
  111 |     await expect(page).toHaveURL(/\/student\/exams/);
  112 | 
  113 |     // Wait for the exam cards to load
  114 |     await page.waitForTimeout(1000);
  115 | 
  116 |     // Find the first available exam and click it
  117 |     const enterBtn = page.getByRole('link', { name: /Enter Examination Hall/i }).first();
  118 |     const isLiveExam = await enterBtn.isVisible();
  119 | 
  120 |     if (isLiveExam) {
  121 |       await enterBtn.click();
  122 | 
  123 |       // Verify navigation to lobby
  124 |       await expect(page).toHaveURL(/\/student\/exams\/.*\/lobby/);
  125 | 
  126 |       // Check consent box
  127 |       await page.locator('input[type="checkbox"]').check();
  128 | 
  129 |       // Start exam
  130 |       await page.getByRole('button', { name: /Start Exam/i }).click();
  131 | 
  132 |       // Verify navigation to active exam screen
  133 |       await expect(page).toHaveURL(/\/student\/assessment\/.*/);
  134 |       
  135 |       // Verify some UI element of the exam is visible
  136 |       await expect(page.locator('text="Time Left"').first()).toBeVisible({ timeout: 10000 });
  137 |     } else {
  138 |       console.log('No live exams available for testing.');
  139 |     }
  140 |   });
  141 | 
  142 | });
  143 | 
```