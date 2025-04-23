import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

// Helper function to check if a file exists
const fileExists = (filePath: string): boolean => {
	return fs.existsSync(filePath);
};

describe('Package structure', () => {
	const distPath = path.resolve(process.cwd(), 'dist');

	it('should have the correct main files', () => {
		expect(fileExists(path.join(distPath, 'index.js'))).toBe(true);
		expect(fileExists(path.join(distPath, 'index.d.ts'))).toBe(true);
	});

	it('should have the components directory', () => {
		const componentsDir = path.join(distPath, 'components');
		expect(fs.existsSync(componentsDir)).toBe(true);
		expect(fs.statSync(componentsDir).isDirectory()).toBe(true);
	});

	it('should have the types directory', () => {
		const typesDir = path.join(distPath, 'types');
		expect(fs.existsSync(typesDir)).toBe(true);
		expect(fs.statSync(typesDir).isDirectory()).toBe(true);
	});

	it('should have the utils directory', () => {
		const utilsDir = path.join(distPath, 'utils');
		expect(fs.existsSync(utilsDir)).toBe(true);
		expect(fs.statSync(utilsDir).isDirectory()).toBe(true);
	});

	it('should have the lazylog component files', () => {
		const logViewerDir = path.join(distPath, 'components', 'lazylog');
		expect(fs.existsSync(logViewerDir)).toBe(true);

		// Check for a component file
		expect(fileExists(path.join(logViewerDir, 'lazylog.svelte'))).toBe(true);
		expect(fileExists(path.join(logViewerDir, 'lazylog.svelte.d.ts'))).toBe(true);

		// Check for a component index file
		expect(fileExists(path.join(logViewerDir, 'index.js'))).toBe(true);
		expect(fileExists(path.join(logViewerDir, 'index.d.ts'))).toBe(true);
	});

	it('should have properly exported type files', () => {
		const typesDir = path.join(distPath, 'types');

		expect(fileExists(path.join(typesDir, 'lazylog.d.ts'))).toBe(true);
		expect(fileExists(path.join(typesDir, 'log-line.d.ts'))).toBe(true);
		expect(fileExists(path.join(typesDir, 'log-content.d.ts'))).toBe(true);
		expect(fileExists(path.join(typesDir, 'ansiparse.d.ts'))).toBe(true);
	});
});
