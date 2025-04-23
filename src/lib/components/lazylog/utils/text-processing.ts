/**
 * Utility functions for processing text into LogLine objects
 */

import type { LogLine } from '$lib/types/log-line.js';

import { parseAnsi } from '$lib/utils/ansi-parser.js';

/**
 * Process text without line wrapping
 *
 * @param text - The text to process
 * @param startLineNumber - The starting line number
 * @returns An array of LogLine objects
 */
export function processTextWithoutWrapping(text: string, startLineNumber: number): LogLine[] {
	return text.split('\n').map((line, index) => ({
		number: startLineNumber + index,
		content: parseAnsi(line)
	}));
}

/**
 * Process text into LogLine objects
 *
 * @param text - The text to process
 * @param startLineNumber - The starting line number
 * @returns An array of LogLine objects
 */
export function processText(text: string, startLineNumber = 1): LogLine[] {
	// Always use standard processing without manual wrapping
	// CSS-based wrapping will be applied via the 'wrapped' class
	return processTextWithoutWrapping(text, startLineNumber);
}
