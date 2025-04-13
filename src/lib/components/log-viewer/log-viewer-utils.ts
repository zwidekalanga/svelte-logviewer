import { parseAnsi } from '../../utils/ansi-parser.js';

import type { LogLine } from '$lib/types/log-line.js';
import type { LogViewerProps } from '$lib/types/log-viewer.js';

// Define a structure to hold each match location
export interface Match {
	lineNumber: number;
	partIndex: number; // Index of the part in the line.content array
	startIndex: number; // Start index within the part text
	endIndex: number; // End index within the part text
}

export const DEFAULT_PROPS: LogViewerProps = {
	containerStyle: { height: 'calc(100% - 40px)' },
	caseInsensitive: false,
	enableGutters: false,
	enableHotKeys: false,
	enableLineNumbers: true,
	enableLinks: false,
	enableMultilineHighlight: true,
	enableSearch: false,
	enableSearchNavigation: true,
	wrapLines: false,
	extraLines: 0,
	fetchOptions: { credentials: 'omit' },
	follow: false,
	formatPart: undefined,
	height: 'auto',
	highlight: [],
	highlightLineClassName: '',
	lineClassName: '',
	onError: undefined,
	onLoad: undefined,
	rowHeight: 19,
	scrollToLine: 0,
	searchMinCharacters: 3,
	selectableLines: false,
	stream: false,
	style: {},
	websocket: false,
	websocketOptions: {},
	eventsource: false,
	eventsourceOptions: {
		maxEmptyEvents: 100 // Default: disconnect after 100 consecutive empty events
	},
	width: 'auto',
	external: false,
	url: undefined,
	text: undefined
};

// Helper function to get visible length of text excluding ANSI codes
function getVisibleLength(text: string): number {
	// Remove all ANSI escape sequences - using ESC constant to avoid linting error
	const ESC = '\u001b'; // ESC character
	return text.replace(new RegExp(`${ESC}\\[[0-9;]*[a-zA-Z]`, 'g'), '').length;
}

// Helper function to get active ANSI codes at a position
function getActiveAnsiCodes(text: string, position: number): string {
	const codes: string[] = [];
	const ESC = '\u001b'; // ESC character
	const regex = new RegExp(`${ESC}\\[([0-9;]*)([a-zA-Z])`, 'g');
	let match;

	while ((match = regex.exec(text)) !== null) {
		if (match.index > position) break;
		if (match[2] === 'm') {
			if (match[1] === '0' || match[1] === '') {
				codes.length = 0; // Reset
			} else {
				codes.push(match[0]);
			}
		}
	}

	return codes.join('');
}

// Helper function to split text at a visible position while preserving ANSI codes
function splitAtVisiblePosition(text: string, maxVisibleLength: number): [string, string] {
	let visibleLength = 0;
	let actualPosition = 0;
	let inEscapeSequence = false;
	const ESC = '\u001b'; // ESC character

	for (let i = 0; i < text.length; i++) {
		if (text[i] === ESC) {
			inEscapeSequence = true;
			continue;
		}

		if (inEscapeSequence) {
			if (text[i] === 'm') {
				inEscapeSequence = false;
			}
			continue;
		}

		visibleLength++;
		if (visibleLength > maxVisibleLength) {
			actualPosition = i;
			break;
		}
	}

	if (actualPosition === 0) {
		actualPosition = text.length;
	}

	const firstPart = text.slice(0, actualPosition);
	const secondPart = text.slice(actualPosition);

	// Get active ANSI codes at the split point
	const activeAnsiCodes = getActiveAnsiCodes(firstPart, firstPart.length);

	return [firstPart, activeAnsiCodes + secondPart];
}

export function processText(
	text: string,
	wrapLines = false,
	maxLineLength = 100,
	startLineNumber = 1
): LogLine[] {
	// Standard processing without wrapping
	if (!wrapLines) {
		return text.split('\n').map((line, index) => ({
			number: startLineNumber + index,
			content: parseAnsi(line)
		}));
	}

	// Process with line wrapping
	const lines: LogLine[] = [];
	let lineNumber = startLineNumber;

	text.split('\n').forEach((line) => {
		// If the visible length is shorter than maxLineLength, just add it normally
		if (getVisibleLength(line) <= maxLineLength) {
			lines.push({
				number: lineNumber++,
				content: parseAnsi(line)
			});
			return;
		}

		let remainingText = line;
		let isFirstChunk = true;

		while (remainingText.length > 0) {
			const availableLength = isFirstChunk ? maxLineLength : maxLineLength - 2; // Account for prefix
			const [chunk, remaining] = splitAtVisiblePosition(remainingText, availableLength);
			const prefix = isFirstChunk ? '' : '↪ ';

			lines.push({
				number: lineNumber++,
				content: parseAnsi(prefix + chunk)
			});

			remainingText = remaining;
			isFirstChunk = false;

			// Break if we can't make any more progress
			if (chunk.length === 0) break;
		}
	});

	return lines;
}

export function isHighlighted(lineNumber: number, highlight: number | number[]): boolean {
	if (Array.isArray(highlight)) {
		if (highlight.length === 2) {
			return lineNumber >= highlight[0] && lineNumber <= highlight[1];
		}
		return highlight.includes(lineNumber);
	}
	return lineNumber === highlight;
}

/**
 * Finds all matches for a search query in the provided lines
 */
export function findMatches(
	lines: LogLine[],
	searchText: string,
	caseInsensitive: boolean,
	minCharacters: number = 3
): Match[] {
	// Return empty array if search text is too short
	if (searchText.length < minCharacters) {
		return [];
	}

	const matches: Match[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Check each part of the line
		if (Array.isArray(line.content)) {
			for (let partIndex = 0; partIndex < line.content.length; partIndex++) {
				const part = line.content[partIndex];
				if (!part.text) continue;

				const contentText = part.text;

				// Get comparison values based on case sensitivity
				const compareText = caseInsensitive ? contentText.toLowerCase() : contentText;
				const compareSearch = caseInsensitive ? searchText.toLowerCase() : searchText;

				// Find all instances of the search text in this part
				let startIdx = 0;
				while (true) {
					const foundIdx = compareText.indexOf(compareSearch, startIdx);
					if (foundIdx === -1) break;

					// Add this match
					matches.push({
						lineNumber: line.number,
						partIndex: partIndex,
						startIndex: foundIdx,
						endIndex: foundIdx + compareSearch.length
					});

					// Move to check for next instance
					startIdx = foundIdx + 1;
				}
			}
		}
	}

	return matches;
}

/**
 * Returns an array of line numbers that have matches
 */
export function getLinesWithMatches(matches: Match[]): number[] {
	return [...new Set(matches.map((match) => match.lineNumber))];
}

/**
 * Returns all matches for a specific line
 */
export function getMatchesForLine(matches: Match[], lineNumber: number): Match[] {
	return matches.filter((match) => match.lineNumber === lineNumber);
}

/**
 * Returns the active match if it's on the specified line, or null otherwise
 */
export function getActiveMatchForLine(
	matches: Match[],
	currentMatchIndex: number,
	lineNumber: number
): Match | null {
	if (currentMatchIndex >= 0 && matches[currentMatchIndex]?.lineNumber === lineNumber) {
		return matches[currentMatchIndex];
	}
	return null;
}

/**
 * Returns the index for the next match based on current index
 */
export function getNextMatchIndex(currentIndex: number, totalMatches: number): number {
	if (totalMatches === 0) return -1;
	return (currentIndex + 1) % totalMatches;
}

/**
 * Returns the index for the previous match based on current index
 */
export function getPreviousMatchIndex(currentIndex: number, totalMatches: number): number {
	if (totalMatches === 0) return -1;
	return currentIndex <= 0 ? totalMatches - 1 : currentIndex - 1;
}
