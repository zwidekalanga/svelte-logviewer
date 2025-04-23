import { describe, it, expect } from 'vitest';

import { isHighlighted } from '$lib/components/lazylog/utils/highlighting.js';

describe('Highlighting Utilities', () => {
	describe('isHighlighted', () => {
		it('should return true when line number matches single highlight number', () => {
			expect(isHighlighted(5, 5)).toBe(true);
		});

		it('should return false when line number does not match single highlight number', () => {
			expect(isHighlighted(5, 10)).toBe(false);
		});

		it('should return true when line number is within highlight range', () => {
			expect(isHighlighted(5, [3, 7])).toBe(true);
		});

		it('should return true when line number is at start of highlight range', () => {
			expect(isHighlighted(3, [3, 7])).toBe(true);
		});

		it('should return true when line number is at end of highlight range', () => {
			expect(isHighlighted(7, [3, 7])).toBe(true);
		});

		it('should return false when line number is outside highlight range', () => {
			expect(isHighlighted(2, [3, 7])).toBe(false);
			expect(isHighlighted(8, [3, 7])).toBe(false);
		});

		it('should return true when line number is in highlight list', () => {
			expect(isHighlighted(5, [1, 3, 5, 7, 9])).toBe(true);
		});

		it('should return false when line number is not in highlight list', () => {
			expect(isHighlighted(6, [1, 3, 5, 7, 9])).toBe(false);
		});
	});
});
