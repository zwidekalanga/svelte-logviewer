import { describe, it, expect, vi, beforeEach } from 'vitest';

import { processText, isHighlighted, findMatches } from '../lazylog-utils.js';

// For Svelte 5 compatibility, we'll test utilities individually instead
// of trying to render the component directly in JSDOM

describe('LogViewer Utils Testing', () => {
	// Since we can't easily test the component with jsdom and Svelte 5,
	// we'll test the utility functions directly that power the component

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should test processText utility', () => {
		const text = 'Line 1\nLine 2\nLine 3';
		const result = processText(text);

		expect(result).toHaveLength(3);
		expect(result[0].number).toBe(1);
		expect(result[0].content[0].text).toBe('Line 1');
		expect(result[1].number).toBe(2);
		expect(result[2].number).toBe(3);
	});

	it('should test highlight detection', () => {
		expect(isHighlighted(5, 5)).toBe(true);
		expect(isHighlighted(5, [3, 5, 7])).toBe(true);
		expect(isHighlighted(5, [3, 7])).toBe(true);
		expect(isHighlighted(2, [3, 7])).toBe(false);
	});

	it('should test search matching', () => {
		const lines = [
			{ number: 1, content: [{ text: 'This is line one' }] },
			{ number: 2, content: [{ text: 'This is line two' }] },
			{ number: 3, content: [{ text: 'Line THREE is here' }] }
		];

		const caseInsensitiveMatches = findMatches(lines, 'LINE', true);
		expect(caseInsensitiveMatches).toHaveLength(3);

		const caseSensitiveMatches = findMatches(lines, 'line', false);
		expect(caseSensitiveMatches).toHaveLength(2);
	});
});
