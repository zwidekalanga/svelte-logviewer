import { describe, it, expect } from 'vitest';

// Import in different ways to test various import formats
import { LogViewer } from '../../dist/index.js';
import { LogViewerLine } from '../../dist/components/log-viewer/index.js';
import * as packageExports from '../../dist/index.js';
import * as logViewerExports from '../../dist/components/log-viewer/index.js';

describe('Package import formats', () => {
	it('should allow importing from main package export', () => {
		expect(LogViewer).toBeDefined();
		expect(typeof LogViewer).toBe('function');
	});

	it('should allow importing specific component from subpath', () => {
		expect(LogViewerLine).toBeDefined();
		expect(typeof LogViewerLine).toBe('function');
	});

	it('should allow importing all exports as namespace', () => {
		expect(packageExports).toBeDefined();
		expect(packageExports.LogViewer).toBeDefined();
	});

	it('should allow importing all components from a subdirectory', () => {
		expect(logViewerExports).toBeDefined();
		expect(logViewerExports.LogViewer).toBeDefined();
		expect(logViewerExports.LogViewerLine).toBeDefined();
		expect(logViewerExports.LogViewerSearchBar).toBeDefined();
	});
});
