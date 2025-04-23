import { describe, it, expect } from 'vitest';

import {
	getVisibleLength,
	getActiveAnsiCodes,
	stripAnsiCodes,
	splitAtVisiblePosition
} from '$lib/components/lazylog/utils/ansi-handling.js';

describe('ANSI Handling Utilities', () => {
	const ESC = '\u001b';

	describe('getVisibleLength', () => {
		it('should return correct length for text without ANSI codes', () => {
			expect(getVisibleLength('Hello World')).toBe(11);
		});

		it('should return correct length for text with ANSI codes', () => {
			const text = `${ESC}[31mRed Text${ESC}[0m`;
			expect(getVisibleLength(text)).toBe(8); // "Red Text"
		});

		it('should handle multiple ANSI codes', () => {
			const text = `${ESC}[1m${ESC}[31mBold Red${ESC}[0m`;
			expect(getVisibleLength(text)).toBe(8); // "Bold Red"
		});
	});

	describe('getActiveAnsiCodes', () => {
		it('should return empty string for text without ANSI codes', () => {
			expect(getActiveAnsiCodes('Hello World', 5)).toBe('');
		});

		it('should return active codes at position', () => {
			const text = `${ESC}[31mRed ${ESC}[1mBold Red${ESC}[0m`;
			expect(getActiveAnsiCodes(text, 10)).toBe(`${ESC}[31m${ESC}[1m`);
		});

		it('should handle reset codes', () => {
			const text = `${ESC}[31mRed ${ESC}[0m${ESC}[32mGreen`;
			expect(getActiveAnsiCodes(text, 15)).toBe(`${ESC}[32m`);
		});
	});

	describe('stripAnsiCodes', () => {
		it('should return original text when no ANSI codes present', () => {
			expect(stripAnsiCodes('Hello World')).toBe('Hello World');
		});

		it('should strip all ANSI codes from text', () => {
			const text = `${ESC}[31mRed ${ESC}[1mBold Red${ESC}[0m`;
			expect(stripAnsiCodes(text)).toBe('Red Bold Red');
		});
	});

	describe('splitAtVisiblePosition', () => {
		it('should split text at specified position', () => {
			const [first, second] = splitAtVisiblePosition('Hello World', 5);
			expect(first).toBe('Hello ');
			expect(second).toBe('World');
		});

		it('should preserve ANSI codes when splitting', () => {
			const text = `${ESC}[31mRed ${ESC}[1mBold Red${ESC}[0m`;
			const [first, second] = splitAtVisiblePosition(text, 4);
			expect(stripAnsiCodes(first)).toBe('Red ');
			expect(stripAnsiCodes(second)).toBe('Bold Red');
			expect(second.startsWith(`${ESC}[31m${ESC}[1m`)).toBe(true);
		});

		it('should split at whitespace when possible', () => {
			const [first, second] = splitAtVisiblePosition('Hello World and more text', 12);
			expect(first).toBe('Hello World ');
			expect(second).toBe('and more text');
		});

		it('should handle case when text is shorter than max length', () => {
			const [first, second] = splitAtVisiblePosition('Short', 10);
			expect(first).toBe('Short');
			expect(second).toBe('');
		});

		it('should handle edge case with escape sequences at split point', () => {
			const text = `Text${ESC}[31m with color`;
			const [first, second] = splitAtVisiblePosition(text, 4);
			expect(stripAnsiCodes(first)).toBe('Text ');
			expect(stripAnsiCodes(second)).toBe('with color');
		});
	});
});
