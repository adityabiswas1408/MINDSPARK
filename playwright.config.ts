import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 * Test plan §4: chromium primary, firefox smoke, sequential execution (exam flows are stateful).
 *
 * Credentials for smoke tests are read from environment variables so they are
 * never committed to source control:
 *   E2E_STUDENT_ROLL   — roll number of a seeded test student (e.g. STUDENT-001)
 *   E2E_STUDENT_DOB    — date of birth in the format the login page expects (e.g. 01/01/2010)
 *   E2E_ADMIN_EMAIL    — admin email (used in multi-actor E2E tests)
 *   E2E_ADMIN_PASSWORD — admin password
 *
 * For local development, put these in a `.env.test.local` file (not committed).
 */
export default defineConfig({
  testDir: './e2e',

  // Sequential — exam flows are stateful; parallel execution risks cross-test contamination
  fullyParallel: false,

  // Retry once on CI to absorb flaky network/timing issues; no retries locally
  retries: process.env.CI ? 1 : 0,

  // Default options shared across all tests
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',   // traces captured only when tests fail
    video: 'retain-on-failure',   // video captured only when tests fail
    screenshot: 'only-on-failure',
  },

  projects: [
    // Primary — all tests run on Chromium
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Smoke-only — Firefox runs only the @smoke tagged tests
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grep: /@smoke/,
    },
  ],

  // Spin up the dev server automatically when running locally.
  // In CI, the server is expected to already be running (reuseExistingServer: false).
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // Next.js cold start can take up to 2 minutes on first run
  },

  // Output directories
  outputDir: 'playwright-results/',
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'on-failure' }]],
});
