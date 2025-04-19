import { describe, it, expect } from 'vitest';

import {
	processText,
	isHighlighted,
	findMatches,
	getLinesWithMatches,
	getMatchesForLine,
	getActiveMatchForLine,
	getNextMatchIndex,
	getPreviousMatchIndex,
	DEFAULT_PROPS
} from '../../../src/lib/components/log-viewer/log-viewer-utils.js';

import type { LogLine } from '../../../src/lib/types/log-line.js';

describe('log-viewer-utils implementation', () => {
	describe('DEFAULT_PROPS', () => {
		it('should have expected default properties', () => {
			expect(DEFAULT_PROPS).toHaveProperty('containerStyle');
			expect(DEFAULT_PROPS).toHaveProperty('caseInsensitive', false);
			expect(DEFAULT_PROPS).toHaveProperty('enableLineNumbers', true);
			expect(DEFAULT_PROPS).toHaveProperty('wrapLines', false);
		});
	});

	describe('processText', () => {
		it('should process text without wrapping', () => {
			const text = 'Line 1\nLine 2\nLine 3';
			const result = processText(text);

			expect(result).toHaveLength(3);
			expect(result[0].number).toBe(1);
			expect(result[0].content[0].text).toBe('Line 1');
			expect(result[1].number).toBe(2);
			expect(result[2].number).toBe(3);
		});

		it('should handle ANSI colors in text', () => {
			const text = '\u001b[31mRed text\u001b[0m\nNormal text';
			const result = processText(text);

			expect(result).toHaveLength(2);
			expect(result[0].content[0].text).toBe('Red text');
			expect(result[0].content[0].foreground).toBe('red');
		});

		it('should process text with wrapping', () => {
			const longText =
				'This is a very long line that should be wrapped when the wrapLines option is enabled and maxLineLength is set to a small value.';
			const result = processText(longText, true, 20);

			expect(result.length).toBeGreaterThan(1);
			expect(result[0].number).toBe(1);

			// Second line should have the continuation prefix
			expect(result[1].content[0].text.startsWith('↪')).toBe(true);
		});

		it('should handle custom start line number', () => {
			const text = 'Line 1\nLine 2\nLine 3';
			const result = processText(text, false, 100, 10);

			expect(result).toHaveLength(3);
			expect(result[0].number).toBe(10);
			expect(result[1].number).toBe(11);
			expect(result[2].number).toBe(12);
		});
	});

	describe('isHighlighted', () => {
		it('should determine if a line is highlighted (single line)', () => {
			expect(isHighlighted(5, 5)).toBe(true);
			expect(isHighlighted(5, 6)).toBe(false);
		});

		it('should determine if a line is highlighted (line array)', () => {
			expect(isHighlighted(5, [3, 5, 7])).toBe(true);
			expect(isHighlighted(4, [3, 5, 7])).toBe(false);
		});

		it('should determine if a line is highlighted (range)', () => {
			expect(isHighlighted(5, [3, 7])).toBe(true);
			expect(isHighlighted(2, [3, 7])).toBe(false);
		});
	});

	describe('findMatches', () => {
		const lines: LogLine[] = [
			{ number: 1, content: [{ text: 'This is line one' }] },
			{ number: 2, content: [{ text: 'This is line two' }] },
			{ number: 3, content: [{ text: 'Line THREE is here' }] }
		];

		it('should find matches in text (case sensitive)', () => {
			const matches = findMatches(lines, 'line', false);

			expect(matches).toHaveLength(2);
			expect(matches[0].lineNumber).toBe(1);
			expect(matches[1].lineNumber).toBe(2);
		});

		it('should find matches in text (case insensitive)', () => {
			const matches = findMatches(lines, 'LINE', true);

			expect(matches).toHaveLength(3);
			expect(matches[0].lineNumber).toBe(1);
			expect(matches[1].lineNumber).toBe(2);
			expect(matches[2].lineNumber).toBe(3);
		});

		it('should return empty array if minimum character requirement not met', () => {
			const matches = findMatches(lines, 'li', false, 3);
			expect(matches).toHaveLength(0);
		});
	});

	describe('match navigation functions', () => {
		const matches = [
			{ lineNumber: 1, partIndex: 0, startIndex: 0, endIndex: 4 },
			{ lineNumber: 2, partIndex: 0, startIndex: 5, endIndex: 9 },
			{ lineNumber: 5, partIndex: 0, startIndex: 10, endIndex: 14 }
		];

		it('should get all lines with matches', () => {
			const lines = getLinesWithMatches(matches);
			expect(lines).toEqual([1, 2, 5]);
		});

		it('should get matches for a specific line', () => {
			const lineMatches = getMatchesForLine(matches, 2);
			expect(lineMatches).toHaveLength(1);
			expect(lineMatches[0].lineNumber).toBe(2);
		});

		it('should get active match for a line', () => {
			const match = getActiveMatchForLine(matches, 1, 2);
			expect(match).toBeDefined();
			expect(match?.lineNumber).toBe(2);

			const noMatch = getActiveMatchForLine(matches, 1, 3);
			expect(noMatch).toBeNull();
		});

		it('should get next match index', () => {
			expect(getNextMatchIndex(1, 3)).toBe(2);
			expect(getNextMatchIndex(2, 3)).toBe(0);
		});

		it('should get previous match index', () => {
			expect(getPreviousMatchIndex(1, 3)).toBe(0);
			expect(getPreviousMatchIndex(0, 3)).toBe(2);
		});
	});
});
