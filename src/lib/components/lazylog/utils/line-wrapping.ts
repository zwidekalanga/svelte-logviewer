/**
 * Utility functions for handling line wrapping
 */

import { getVisibleLength, splitAtVisiblePosition } from './ansi-handling.js';
import { parseAnsi } from '../../../utils/ansi-parser.js';

import type { LogLine } from '$lib/types/log-line.js';

/**
 * Determines if a line should be wrapped based on its visible length
 */
export function shouldWrapLine(line: string, maxLength: number): boolean {
	return getVisibleLength(line) > maxLength;
}

/**
 * Creates a wrapped chunk from text
 *
 * @param text - The text to wrap
 * @param isFirstChunk - Whether this is the first chunk of a wrapped line
 * @param maxLength - The maximum length of a line
 * @returns An object containing the chunk and the remaining text
 */
export function createWrappedChunk(
	text: string,
	isFirstChunk: boolean,
	maxLength: number
): { chunk: string; remaining: string } {
	// Adjust available length based on whether this is the first chunk
	const availableLength = isFirstChunk ? maxLength : maxLength - 2; // Account for prefix

	// Split the text at the appropriate position
	const [chunk, remaining] = splitAtVisiblePosition(text, availableLength);

	return { chunk, remaining };
}

/**
 * Processes a single line that needs to be wrapped
 *
 * @param line - The line to wrap
 * @param maxLineLength - The maximum length of a line
 * @param lineNumber - The starting line number
 * @returns An array of LogLine objects representing the wrapped line
 */
export function processWrappedLine(
	line: string,
	maxLineLength: number,
	lineNumber: number
): LogLine[] {
	const wrappedLines: LogLine[] = [];
	let remainingText = line;
	let isFirstChunk = true;
	let currentLineNumber = lineNumber;

	while (remainingText.length > 0) {
		// Create a wrapped chunk
		const { chunk, remaining } = createWrappedChunk(remainingText, isFirstChunk, maxLineLength);

		// Add prefix for continuation lines
		const prefix = isFirstChunk ? '' : '↪ ';

		// Add the chunk as a new line
		wrappedLines.push({
			number: currentLineNumber++,
			content: parseAnsi(prefix + chunk)
		});

		// Update for next iteration
		remainingText = remaining;
		isFirstChunk = false;

		// Break if we can't make any more progress
		if (chunk.length === 0) break;
	}

	return wrappedLines;
}

/**
 * Processes text with line wrapping
 *
 * @param text - The text to process
 * @param maxLineLength - The maximum length of a line
 * @param startLineNumber - The starting line number
 * @returns An array of LogLine objects
 */
export function processTextWithWrapping(
	text: string,
	maxLineLength: number,
	startLineNumber: number
): LogLine[] {
	const lines: LogLine[] = [];
	let lineNumber = startLineNumber;

	text.split('\n').forEach((line) => {
		// If the line doesn't need wrapping, add it as is
		if (!shouldWrapLine(line, maxLineLength)) {
			lines.push({
				number: lineNumber++,
				content: parseAnsi(line)
			});
			return;
		}

		// Process the line with wrapping
		const wrappedLines = processWrappedLine(line, maxLineLength, lineNumber);
		lines.push(...wrappedLines);

		// Update the line number
		lineNumber += wrappedLines.length;
	});

	return lines;
}
