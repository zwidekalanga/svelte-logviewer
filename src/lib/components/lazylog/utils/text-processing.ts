/**
 * Utility functions for processing text into LogLine objects
 */

import { processTextWithWrapping } from './line-wrapping.js';
import { parseAnsi } from '../../../utils/ansi-parser.js';

import type { LogLine } from '$lib/types/log-line.js';

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
 * @param wrapLines - Whether to wrap lines
 * @param maxLineLength - The maximum length of a line
 * @param startLineNumber - The starting line number
 * @returns An array of LogLine objects
 */
export function processText(
	text: string,
	wrapLines = false,
	maxLineLength = 100,
	startLineNumber = 1
): LogLine[] {
	// Standard processing without wrapping
	if (!wrapLines) {
		return processTextWithoutWrapping(text, startLineNumber);
	}

	// Process with line wrapping
	return processTextWithWrapping(text, maxLineLength, startLineNumber);
}
