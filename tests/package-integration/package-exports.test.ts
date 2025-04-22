import { describe, it, expect } from 'vitest';

// Import types directly from source for testing
import type { AnsiParseResult } from '../../src/lib/types/ansiparse.js';
import type { LazyLogProps } from '../../src/lib/types/lazylog.js';
import type { LineContent } from '../../src/lib/types/log-content.js';
import type { LogLine } from '../../src/lib/types/log-line.js';

// Import component to verify it exists (commented until build)
// import { LazyLog } from '../../src/lib/index.js';

describe('Type Definitions', () => {
	it('should define proper LazyLogProps type', () => {
		// Create a typed object to verify TypeScript types are exported correctly
		const props: LazyLogProps = {
			text: 'Sample log content',
			height: '400px',
			wrapLines: true
		};
		expect(props).toBeDefined();
		expect(props.text).toBe('Sample log content');
	});

	it('should define proper LogLine type', () => {
		// Verify we can use the LogLine type
		const logLine: LogLine = {
			number: 1,
			content: []
		};
		expect(logLine).toBeDefined();
		expect(logLine.number).toBe(1);
	});

	it('should define proper LineContent type', () => {
		// Verify LineContent type
		const content: LineContent = {
			text: 'test content',
			foreground: 'white',
			background: 'black'
		};
		expect(content).toBeDefined();
		expect(content.text).toBe('test content');
	});

	it('should define proper AnsiParseResult type', () => {
		// Verify AnsiParseResult type
		const ansiResult: AnsiParseResult = {
			text: 'test',
			foreground: 'red'
		};
		expect(ansiResult).toBeDefined();
		expect(ansiResult.text).toBe('test');
	});

	it('should define comprehensive LazyLog props', () => {
		// Testing comprehensive props coverage
		const fullProps: LazyLogProps = {
			text: 'Sample log content',
			url: 'https://example.com/logs',
			height: '600px',
			width: '100%',
			follow: true,
			highlight: [1, 5, 10],
			caseInsensitive: true,
			wrapLines: true
			// Add other props as needed based on actual LazyLogProps definition
		};
		expect(fullProps).toBeDefined();
		expect(Array.isArray(fullProps.highlight)).toBe(true);
	});
});
