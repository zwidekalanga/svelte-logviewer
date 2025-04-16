import { expect, test } from './coverage-setup';

test('Basic page navigation works', async ({ page }) => {
	// Go to the home page
	await page.goto('/');

	// Basic test that the page loaded
	await expect(page.locator('body')).toBeVisible();
});

test('LogViewer search functionality works if present', async ({ page }) => {
	await page.goto('/');

	// Check if search is enabled
	const searchBar = page.locator('.log-viewer-search');
	if (await searchBar.isVisible()) {
		// Type into search bar
		await searchBar.locator('input').fill('test');

		// Wait for search results
		await page.waitForTimeout(300); // Give it some time to process

		// Check if there are search results
		const matchCount = page.locator('.match-count');
		if (await matchCount.isVisible()) {
			await expect(matchCount).not.toHaveText('0');
		}
	} else {
		console.log('Search bar not visible, skipping test');
		test.skip();
	}
});

test('LogViewer line wrapping works if present', async ({ page }) => {
	await page.goto('/');

	// Find the wrap toggle button if it exists
	const wrapButton = page.locator('button:has-text("Wrap")');
	if (await wrapButton.isVisible()) {
		// Initial state
		const logViewer = page.locator('.log-viewer');
		const initialWrapClass = await logViewer.getAttribute('class');

		// Click the wrap button
		await wrapButton.click();

		// Check for class change
		const updatedWrapClass = await logViewer.getAttribute('class');
		expect(initialWrapClass).not.toEqual(updatedWrapClass);
	} else {
		console.log('Wrap button not visible, skipping test');
		test.skip();
	}
});
