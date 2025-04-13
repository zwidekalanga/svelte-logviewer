import { describe, it, expect } from 'vitest';

import { LogViewerLine } from '../../dist/components/log-viewer/index.js';
import * as packageExports from '../../dist/index.js';
import { LogViewer } from '../../dist/index.js';

import type { LogViewerProps, LogLine, LogContent, AnsiParseResult } from '../../dist/index.js';

describe('Package exports', () => {
	it('should export the LogViewer component', () => {
		expect(LogViewer).toBeDefined();
		expect(typeof LogViewer).toBe('function');
	});

	it('should have all expected exports', () => {
		// The main export should contain the LogViewer component
		expect(packageExports).toHaveProperty('LogViewer');
	});

	it('should export component types', () => {
		// Create a typed object to verify TypeScript types are exported correctly
		const props: LogViewerProps = {
			text: 'Sample log content',
			enableSearch: true,
			height: '400px'
		};

		expect(props).toBeDefined();

		// Verify we can use the LogLine type
		const logLine: LogLine = {
			number: 1,
			content: []
		};

		expect(logLine).toBeDefined();

		// Verify LogContent type
		const content: LogContent = {
			text: 'test content',
			foreground: 'white',
			background: 'black'
		};

		expect(content).toBeDefined();

		// Verify AnsiParseResult type
		const ansiResult: AnsiParseResult = {
			text: 'test',
			foreground: 'red'
		};

		expect(ansiResult).toBeDefined();
	});

	it('should be able to import internal components directly', () => {
		expect(LogViewerLine).toBeDefined();
		expect(typeof LogViewerLine).toBe('function');
	});
});
