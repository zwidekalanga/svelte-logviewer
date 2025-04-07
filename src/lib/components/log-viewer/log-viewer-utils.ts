import type { LogViewerProps } from '../../../lib/types/log-viewer.js';
import type { LogLine } from '../../../lib/types/log-line.js';
import { parseAnsi } from '../../utils/ansi-parser.js';

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
	eventsourceOptions: {},
	width: 'auto',
	external: false,
	url: undefined,
	text: undefined
};

export function processText(text: string): LogLine[] {
	return text.split('\n').map((line, index) => ({
		number: index + 1,
		content: parseAnsi(line)
	}));
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
