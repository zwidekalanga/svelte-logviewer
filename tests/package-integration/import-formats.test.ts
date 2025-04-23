import { describe, it, expect } from 'vitest';

// Import in different ways to test various import formats
import { LazyLogLine } from '../../dist/components/lazylog/index.js';
import * as lazylogExports from '../../dist/components/lazylog/index.js';
import { LazyLog } from '../../dist/index.js';
import * as packageExports from '../../dist/index.js';

describe('Package import formats', () => {
	it('should allow importing from main package export', () => {
		expect(LazyLog).toBeDefined();
		expect(typeof LazyLog).toBe('function');
	});

	it('should allow importing specific component from subpath', () => {
		expect(LazyLogLine).toBeDefined();
		expect(typeof LazyLogLine).toBe('function');
	});

	it('should allow importing all exports as namespace', () => {
		expect(packageExports).toBeDefined();
		expect(packageExports.LazyLog).toBeDefined();
	});

	it('should allow importing all components from a subdirectory', () => {
		expect(lazylogExports).toBeDefined();
		expect(lazylogExports.LazyLog).toBeDefined();
		expect(lazylogExports.LazyLogLine).toBeDefined();
		expect(lazylogExports.LazyLogSearchBar).toBeDefined();
	});
});
