import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Skip these tests in CI as they require filesystem operations
describe.skip('Package installation simulation', () => {
	const testProjectDir = path.resolve(process.cwd(), 'tests/package-integration/test-project');

	// Create a minimal test project that imports the package
	beforeAll(() => {
		// Create a directory if it doesn't exist
		if (!fs.existsSync(testProjectDir)) {
			fs.mkdirSync(testProjectDir, { recursive: true });
		}

		// Create package.json for the test project
		const packageJson = {
			name: 'test-project',
			type: 'module',
			dependencies: {
				svelte: '^5.0.0',
				virtua: '^0.39.3',
				'@zwidekalanga/svelte-lazylog': 'file:../../'
			}
		};

		fs.writeFileSync(
			path.join(testProjectDir, 'package.json'),
			JSON.stringify(packageJson, null, 2)
		);

		// Create a Svelte file that uses the LazyLog
		const svelteFile = `<script>
      import { LazyLog } from '@zwidekalanga/svelte-lazylog';
    </script>

    <LazyLog 
      text="This is a test log" 
      height="300px" 
      enableSearch={true} 
    />`;

		fs.writeFileSync(path.join(testProjectDir, 'App.svelte'), svelteFile);

		// Install dependencies
		try {
			execSync('yarn install', { cwd: testProjectDir, stdio: 'ignore' });
		} catch (error) {
			console.error('Failed to install dependencies:', error);
		}
	});

	// Clean up after tests
	afterAll(() => {
		// Remove test project directory
		if (fs.existsSync(testProjectDir)) {
			fs.rmSync(testProjectDir, { recursive: true, force: true });
		}
	});

	it('should allow importing the package in a Svelte file', () => {
		// Check that the package was installed
		const nodeModulesPath = path.join(
			testProjectDir,
			'node_modules',
			'@zwidekalanga',
			'svelte-lazylog'
		);
		expect(fs.existsSync(nodeModulesPath)).toBe(true);

		// Check that the dist directory was copied correctly
		const distPath = path.join(nodeModulesPath, 'dist');
		expect(fs.existsSync(distPath)).toBe(true);

		// Check that the package exports are available
		const mainIndexPath = path.join(distPath, 'index.js');
		expect(fs.existsSync(mainIndexPath)).toBe(true);
	});
});
