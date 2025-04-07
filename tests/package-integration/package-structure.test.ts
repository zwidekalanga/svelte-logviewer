import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Helper function to check if file exists
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

	it('should have the log-viewer component files', () => {
		const logViewerDir = path.join(distPath, 'components', 'log-viewer');
		expect(fs.existsSync(logViewerDir)).toBe(true);

		// Check for component file
		expect(fileExists(path.join(logViewerDir, 'log-viewer.svelte'))).toBe(true);
		expect(fileExists(path.join(logViewerDir, 'log-viewer.svelte.d.ts'))).toBe(true);

		// Check for component index file
		expect(fileExists(path.join(logViewerDir, 'index.js'))).toBe(true);
		expect(fileExists(path.join(logViewerDir, 'index.d.ts'))).toBe(true);
	});

	it('should have properly exported type files', () => {
		const typesDir = path.join(distPath, 'types');

		expect(fileExists(path.join(typesDir, 'log-viewer.d.ts'))).toBe(true);
		expect(fileExists(path.join(typesDir, 'log-line.d.ts'))).toBe(true);
		expect(fileExists(path.join(typesDir, 'log-content.d.ts'))).toBe(true);
		expect(fileExists(path.join(typesDir, 'ansiparse.d.ts'))).toBe(true);
	});
});
