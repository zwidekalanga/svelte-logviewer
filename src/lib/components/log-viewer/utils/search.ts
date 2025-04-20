/**
 * Utility functions for handling search functionality
 */

import type { LogLine } from '$lib/types/log-line.js';

/**
 * Interface representing a match location
 */
export interface Match {
	lineNumber: number;
	partIndex: number; // Index of the part in the line.content array
	startIndex: number; // Start index within the part text
	endIndex: number; // End index within the part text
}

/**
 * Finds all matches for a search term in a specific text part
 */
export function findMatchesInPart(
	lineNumber: number,
	partIndex: number,
	text: string,
	searchText: string,
	caseInsensitive: boolean
): Match[] {
	// Get comparison values based on case sensitivity
	const compareText = caseInsensitive ? text.toLowerCase() : text;
	const compareSearch = caseInsensitive ? searchText.toLowerCase() : searchText;

	const matches: Match[] = [];
	let startIdx = 0;

	// Find all instances of the search text in this part
	while (true) {
		const foundIdx = compareText.indexOf(compareSearch, startIdx);
		if (foundIdx === -1) break;

		// Add this match
		matches.push({
			lineNumber,
			partIndex,
			startIndex: foundIdx,
			endIndex: foundIdx + compareSearch.length
		});

		// Move to check for next instance
		startIdx = foundIdx + 1;
	}

	return matches;
}

/**
 * Find matches for a search term in a specific log line
 */
export function findMatchesInLine(
	line: LogLine,
	searchText: string,
	caseInsensitive: boolean
): Match[] {
	if (!Array.isArray(line.content)) {
		return [];
	}

	// Use flatMap to simplify the code and reduce nesting
	return line.content.flatMap((part, partIndex) => {
		if (!part.text) return [];
		return findMatchesInPart(line.number, partIndex, part.text, searchText, caseInsensitive);
	});
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

	// Use flatMap to simplify the code and reduce nesting
	return lines.flatMap((line) => findMatchesInLine(line, searchText, caseInsensitive));
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
