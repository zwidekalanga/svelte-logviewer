import { describe, it, expect, vi } from 'vitest';

import {
	processText,
	processTextWithoutWrapping
} from '$lib/components/lazylog/utils/text-processing.js';
import * as ansiParser from '$lib/utils/ansi-parser.js';

describe('Text Processing Utilities', () => {
	describe('processTextWithoutWrapping', () => {
		it('should process text into LogLine objects', () => {
			// Mock the ansi parser to return predictable results
			vi.spyOn(ansiParser, 'parseAnsi').mockImplementation((text) => [{ text }]);

			const text = 'Line 1\nLine 2\nLine 3';
			const result = processTextWithoutWrapping(text, 1);

			expect(result).toHaveLength(3);
			expect(result[0].number).toBe(1);
			expect(result[1].number).toBe(2);
			expect(result[2].number).toBe(3);

			expect(ansiParser.parseAnsi).toHaveBeenCalledTimes(3);
			expect(ansiParser.parseAnsi).toHaveBeenCalledWith('Line 1');
			expect(ansiParser.parseAnsi).toHaveBeenCalledWith('Line 2');
			expect(ansiParser.parseAnsi).toHaveBeenCalledWith('Line 3');

			vi.restoreAllMocks();
		});

		it('should handle custom starting line number', () => {
			vi.spyOn(ansiParser, 'parseAnsi').mockImplementation((text) => [{ text }]);

			const text = 'Line 1\nLine 2';
			const result = processTextWithoutWrapping(text, 100);

			expect(result).toHaveLength(2);
			expect(result[0].number).toBe(100);
			expect(result[1].number).toBe(101);

			vi.restoreAllMocks();
		});

		it('should handle empty text', () => {
			vi.spyOn(ansiParser, 'parseAnsi').mockImplementation((text) => [{ text }]);

			const result = processTextWithoutWrapping('', 1);

			expect(result).toHaveLength(1);
			expect(result[0].number).toBe(1);
			expect(result[0].content).toEqual([{ text: '' }]);

			vi.restoreAllMocks();
		});
	});

	describe('processText', () => {
		it('should call processTextWithoutWrapping with default line number', () => {
			vi.spyOn(ansiParser, 'parseAnsi').mockImplementation((text) => [{ text }]);

			const text = 'Line 1\nLine 2';
			const result = processText(text);

			expect(result).toHaveLength(2);
			expect(result[0].number).toBe(1);
			expect(result[1].number).toBe(2);

			vi.restoreAllMocks();
		});

		it('should call processTextWithoutWrapping with custom line number', () => {
			vi.spyOn(ansiParser, 'parseAnsi').mockImplementation((text) => [{ text }]);

			const text = 'Line 1\nLine 2';
			const result = processText(text, 50);

			expect(result).toHaveLength(2);
			expect(result[0].number).toBe(50);
			expect(result[1].number).toBe(51);

			vi.restoreAllMocks();
		});
	});
});
