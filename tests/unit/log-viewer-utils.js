// Import mocks
import './mocks/types/log-viewer.js';
import './mocks/types/log-line.js';

/**
 * @typedef {Object} Match
 * @property {number} lineNumber - Line number where match was found
 * @property {number} partIndex - Index of the part in the line.content array
 * @property {number} startIndex - Start index within the part text
 * @property {number} endIndex - End index within the part text
 */

export const DEFAULT_PROPS = {
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

/**
 * Process text content into log lines with ANSI color parsing
 *
 * @param {string} text - Raw text content
 * @returns {Array} - Parsed log lines
 */
export function processText(text) {
	if (!text) return [];

	const lines = text.split('\n');
	return lines.map((line, index) => {
		// Mock ANSI color parsing for tests
		if (line.includes('\u001b[31m')) {
			return {
				number: index + 1,
				content: [
					{
						text: 'Red text',
						foreground: 'red'
					}
				]
			};
		}

		return {
			number: index + 1,
			content: [{ text: line }]
		};
	});
}

/**
 * Check if a line number is highlighted
 *
 * @param {number} lineNumber - Line number to check
 * @param {number|Array} highlight - Line number(s) to highlight
 * @returns {boolean} - Whether the line is highlighted
 */
export function isHighlighted(lineNumber, highlight) {
	if (!highlight) return false;
	if (typeof highlight === 'number') return lineNumber === highlight;

	if (Array.isArray(highlight)) {
		if (highlight.length === 2 && highlight.every((h) => typeof h === 'number')) {
			// Consider it a range
			const [start, end] = highlight;
			return lineNumber >= start && lineNumber <= end;
		}
		// List of line numbers
		return highlight.includes(lineNumber);
	}

	return false;
}

/**
 * Find matches for search term in log lines
 *
 * @param {Array} lines - Log lines to search
 * @param {string} term - Search term
 * @param {boolean} ignoreCase - Whether to ignore case
 * @param {number} minChars - Minimum characters to trigger search
 * @returns {Array} - Matches
 */
export function findMatches(lines, term, ignoreCase = false, minChars = 2) {
	if (!term || term.length < minChars || !lines || !lines.length) {
		return [];
	}

	const matches = [];
	const searchTerm = ignoreCase ? term.toLowerCase() : term;

	lines.forEach((line) => {
		line.content.forEach((part, partIndex) => {
			const text = ignoreCase ? part.text.toLowerCase() : part.text;
			let startIndex = 0;

			while (startIndex < text.length) {
				const foundIndex = text.indexOf(searchTerm, startIndex);
				if (foundIndex === -1) break;

				matches.push({
					lineNumber: line.number,
					partIndex,
					startIndex: foundIndex,
					endIndex: foundIndex + searchTerm.length - 1
				});

				startIndex = foundIndex + 1;
			}
		});
	});

	return matches;
}

/**
 * Get array of line numbers that have matches
 *
 * @param {Array} matches - Search matches
 * @returns {Array} - Line numbers with matches
 */
export function getLinesWithMatches(matches) {
	if (!matches || !matches.length) return [];
	return [...new Set(matches.map((match) => match.lineNumber))];
}

/**
 * Get matches for a specific line
 *
 * @param {Array} matches - Search matches
 * @param {number} lineNumber - Line number
 * @returns {Array} - Matches for the line
 */
export function getMatchesForLine(matches, lineNumber) {
	if (!matches || !matches.length) return [];
	return matches.filter((match) => match.lineNumber === lineNumber);
}

/**
 * Get active match for a line
 *
 * @param {Array} matches - Search matches
 * @param {number} activeMatchIndex - Active match index
 * @param {number} lineNumber - Line number
 * @returns {Object|null} - Active match or null
 */
export function getActiveMatchForLine(matches, activeMatchIndex, lineNumber) {
	if (!matches || !matches.length || activeMatchIndex === null) return null;
	const activeMatch = matches[activeMatchIndex];

	if (activeMatch && activeMatch.lineNumber === lineNumber) {
		return activeMatch;
	}

	return null;
}

/**
 * Get next match index
 *
 * @param {number} currentIndex - Current match index
 * @param {number} total - Total matches
 * @returns {number} - Next match index
 */
export function getNextMatchIndex(currentIndex, total) {
	if (total <= 1) return 0;
	return (currentIndex + 1) % total;
}

/**
 * Get previous match index
 *
 * @param {number} currentIndex - Current match index
 * @param {number} total - Total matches
 * @returns {number} - Previous match index
 */
export function getPreviousMatchIndex(currentIndex, total) {
	if (total <= 1) return 0;
	return (currentIndex - 1 + total) % total;
}
