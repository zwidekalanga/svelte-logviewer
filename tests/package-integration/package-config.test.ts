import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

interface PackageJson {
	svelte: string;
	types: string;
	type: string;
	exports: {
		'.': {
			types: string;
			svelte: string;
			default: string;
		};
		'./dist/*': unknown;
		'./package.json': string;
		[key: string]: unknown;
	};
	peerDependencies: {
		svelte: string;
		[key: string]: string;
	};
	scripts: {
		package: string;
		prepublishOnly: string;
		[key: string]: string;
	};
	dependencies: {
		virtua: string;
		[key: string]: string;
	};
	[key: string]: unknown;
}

describe('Package.json configuration', () => {
	let packageJson: PackageJson;

	beforeEach(() => {
		// Read package.json for testing
		packageJson = JSON.parse(
			fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')
		) as PackageJson;
	});

	it('should have the correct main fields', () => {
		expect(packageJson.svelte).toBe('./dist/index.js');
		expect(packageJson.types).toBe('./dist/index.d.ts');
		expect(packageJson.type).toBe('module');
	});

	it('should have the correct exports configuration', () => {
		expect(packageJson.exports).toHaveProperty('.');
		expect(packageJson.exports['.']).toHaveProperty('svelte');
		expect(packageJson.exports['.']).toHaveProperty('types');
		expect(packageJson.exports['.']).toHaveProperty('default');

		expect(packageJson.exports['.']).toEqual({
			types: './dist/index.d.ts',
			svelte: './dist/index.js',
			default: './dist/index.js'
		});

		// Check for proper subpath export configuration
		expect(packageJson.exports).toHaveProperty('./dist/*');
		expect(packageJson.exports['./package.json']).toBe('./package.json');
	});

	it('should have the correct peer dependencies', () => {
		expect(packageJson.peerDependencies).toHaveProperty('svelte');

		// Verify it supports both Svelte 4 and 5
		const sveltePeerDep = packageJson.peerDependencies.svelte;
		expect(sveltePeerDep).toContain('^4.0.0');
		expect(sveltePeerDep).toContain('^5.0.0');
	});

	it('should have the correct build scripts', () => {
		expect(packageJson.scripts).toHaveProperty('package');
		expect(packageJson.scripts.package).toContain('svelte-package');
		expect(packageJson.scripts).toHaveProperty('prepublishOnly');
	});

	it('should include virtua as a dependency', () => {
		expect(packageJson.dependencies).toHaveProperty('virtua');
	});
});
