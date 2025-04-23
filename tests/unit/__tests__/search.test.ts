import { describe, it, expect } from 'vitest';

import type { LogLine } from '$lib/types/log-line.js';

import {
	findMatchesInPart,
	findMatchesInLine,
	findMatches,
	getLinesWithMatches,
	getMatchesForLine,
	getActiveMatchForLine,
	getNextMatchIndex,
	getPreviousMatchIndex
} from '$lib/components/lazylog/utils/search.js';

describe('Search Utilities', () => {
	describe('findMatchesInPart', () => {
		it('should find matches in text part', () => {
			const matches = findMatchesInPart(1, 0, 'Hello World', 'ello', false);
			expect(matches).toHaveLength(1);
			expect(matches[0]).toEqual({
				lineNumber: 1,
				partIndex: 0,
				startIndex: 1,
				endIndex: 5
			});
		});

		it('should find multiple matches in text part', () => {
			const matches = findMatchesInPart(1, 0, 'Hello Hello', 'ello', false);
			expect(matches).toHaveLength(2);
		});

		it('should handle case sensitivity', () => {
			const insensitive = findMatchesInPart(1, 0, 'Hello World', 'ELLO', true);
			const sensitive = findMatchesInPart(1, 0, 'Hello World', 'ELLO', false);

			expect(insensitive).toHaveLength(1);
			expect(sensitive).toHaveLength(0);
		});
	});

	describe('findMatchesInLine', () => {
		it('should find matches in line with content array', () => {
			const line: LogLine = {
				number: 1,
				content: [{ text: 'Hello ' }, { text: 'World' }]
			};

			const matches = findMatchesInLine(line, 'orld', false);
			expect(matches).toHaveLength(1);
			expect(matches[0].partIndex).toBe(1);
		});

		it('should return empty array for line without content array', () => {
			const line = {
				number: 1,
				content: 'Not an array'
			} as unknown as LogLine;

			const matches = findMatchesInLine(line, 'test', false);
			expect(matches).toHaveLength(0);
		});

		it('should handle parts without text property', () => {
			const line: LogLine = {
				number: 1,
				content: [{ notText: 'Hello' } as unknown as { text?: string }, { text: 'World' }]
			};

			const matches = findMatchesInLine(line, 'orld', false);
			expect(matches).toHaveLength(1);
		});
	});

	describe('findMatches', () => {
		it('should find matches across multiple lines', () => {
			const lines: LogLine[] = [
				{
					number: 1,
					content: [{ text: 'Hello World' }]
				},
				{
					number: 2,
					content: [{ text: 'Another World' }]
				}
			];

			const matches = findMatches(lines, 'World', false);
			expect(matches).toHaveLength(2);
			expect(matches[0].lineNumber).toBe(1);
			expect(matches[1].lineNumber).toBe(2);
		});

		it('should return empty array for short search text', () => {
			const lines: LogLine[] = [
				{
					number: 1,
					content: [{ text: 'Hello World' }]
				}
			];

			const matches = findMatches(lines, 'He', false, 3);
			expect(matches).toHaveLength(0);
		});
	});

	describe('getLinesWithMatches', () => {
		it('should return unique line numbers with matches', () => {
			const matches = [
				{ lineNumber: 1, partIndex: 0, startIndex: 0, endIndex: 5 },
				{ lineNumber: 1, partIndex: 1, startIndex: 0, endIndex: 5 },
				{ lineNumber: 3, partIndex: 0, startIndex: 0, endIndex: 5 }
			];

			const lines = getLinesWithMatches(matches);
			expect(lines).toEqual([1, 3]);
		});
	});

	describe('getMatchesForLine', () => {
		it('should return matches for specific line', () => {
			const matches = [
				{ lineNumber: 1, partIndex: 0, startIndex: 0, endIndex: 5 },
				{ lineNumber: 2, partIndex: 0, startIndex: 0, endIndex: 5 },
				{ lineNumber: 1, partIndex: 1, startIndex: 0, endIndex: 5 }
			];

			const lineMatches = getMatchesForLine(matches, 1);
			expect(lineMatches).toHaveLength(2);
			expect(lineMatches.every((m) => m.lineNumber === 1)).toBe(true);
		});
	});

	describe('getActiveMatchForLine', () => {
		it('should return active match for line', () => {
			const matches = [
				{ lineNumber: 1, partIndex: 0, startIndex: 0, endIndex: 5 },
				{ lineNumber: 2, partIndex: 0, startIndex: 0, endIndex: 5 },
				{ lineNumber: 3, partIndex: 0, startIndex: 0, endIndex: 5 }
			];

			const activeMatch = getActiveMatchForLine(matches, 1, 2);
			expect(activeMatch).toEqual(matches[1]);
		});

		it('should return null if active match is not on specified line', () => {
			const matches = [
				{ lineNumber: 1, partIndex: 0, startIndex: 0, endIndex: 5 },
				{ lineNumber: 2, partIndex: 0, startIndex: 0, endIndex: 5 }
			];

			const activeMatch = getActiveMatchForLine(matches, 1, 1);
			expect(activeMatch).toBeNull();
		});

		it('should return null for invalid match index', () => {
			const matches = [{ lineNumber: 1, partIndex: 0, startIndex: 0, endIndex: 5 }];

			const activeMatch = getActiveMatchForLine(matches, -1, 1);
			expect(activeMatch).toBeNull();
		});
	});

	describe('getNextMatchIndex', () => {
		it('should return next match index', () => {
			expect(getNextMatchIndex(1, 3)).toBe(2);
		});

		it('should wrap around to beginning', () => {
			expect(getNextMatchIndex(2, 3)).toBe(0);
		});

		it('should return -1 for zero matches', () => {
			expect(getNextMatchIndex(1, 0)).toBe(-1);
		});
	});

	describe('getPreviousMatchIndex', () => {
		it('should return previous match index', () => {
			expect(getPreviousMatchIndex(1, 3)).toBe(0);
		});

		it('should wrap around to end', () => {
			expect(getPreviousMatchIndex(0, 3)).toBe(2);
		});

		it('should return -1 for zero matches', () => {
			expect(getPreviousMatchIndex(1, 0)).toBe(-1);
		});
	});
});
