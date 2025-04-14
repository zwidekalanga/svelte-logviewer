import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();
// */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	/* Maximum time one test can run for. */
	timeout: 30 * 1000,
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		['list'],
		['html'],
		['json', { outputFile: 'playwright-report/test-results.json' }],
		[
			'monocart-coverage-reports',
			{
				outputFile: './coverage/e2e-coverage/coverage-final.json',
				sourceFilter: {
					excludePatterns: ['**/node_modules/**'],
					includePatterns: ['**/src/**']
				},
				format: 'istanbul',
				reports: [
					['lcov', { outputFile: './coverage/e2e-coverage/lcov.info' }],
					['html', { outputFile: './coverage/e2e-coverage/html' }]
				]
			}
		]
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: 'http://localhost:4173',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry'
	},
	testDir: 'tests/e2e',
	/* Run your local dev server before starting the tests */
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
