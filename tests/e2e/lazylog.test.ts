import { expect, test } from './coverage-setup';

test('Basic page navigation works', async ({ page }) => {
	// Go to the home page
	await page.goto('/');

	// Basic test that the page loaded
	await expect(page.locator('body')).toBeVisible();
});

test('LazyLog search functionality works if present', async ({ page }) => {
	await page.goto('/');

	// Check if search is enabled
	const searchBar = page.locator('.svelte-lazylog-searchbar');
	if (await searchBar.isVisible()) {
		// Type into search bar - search for INFO which exists in the example log
		await searchBar.locator('input').fill('INFO');

		// Wait for search results
		await page.waitForTimeout(500); // Give it more time to process

		// Check if there are search results
		const matchCount = page.locator('.results-counter');
		if (await matchCount.isVisible()) {
			await expect(matchCount).not.toHaveText('0 matches');
		}
	} else {
		console.log('Search bar not visible, skipping test');
		test.skip();
	}
});

test('LazyLog line wrapping works if present', async ({ page }) => {
	await page.goto('/');

	// Find the wrap toggle button if it exists
	const wrapButton = page.locator('button:has-text("Wrap")');
	if (await wrapButton.isVisible()) {
		// Initial state
		const lazyLog = page.locator('.lazylog');
		const initialWrapClass = await lazyLog.getAttribute('class');

		// Click the wrap button
		await wrapButton.click();

		// Check for class change
		const updatedWrapClass = await lazyLog.getAttribute('class');
		expect(initialWrapClass).not.toEqual(updatedWrapClass);
	} else {
		console.log('Wrap button not visible, skipping test');
		test.skip();
	}
});
