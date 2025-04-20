/**
 * Utility functions for handling line highlighting
 */

/**
 * Determines if a line is highlighted based on the highlight configuration
 *
 * @param lineNumber - The line number to check
 * @param highlight - A single line number, an array of line numbers, or a range [start, end]
 * @returns True if the line should be highlighted, false otherwise
 */
export function isHighlighted(lineNumber: number, highlight: number | number[]): boolean {
	// Single number case
	if (!Array.isArray(highlight)) {
		return lineNumber === highlight;
	}

	// Range case (array with exactly 2 elements)
	if (highlight.length === 2) {
		return lineNumber >= highlight[0] && lineNumber <= highlight[1];
	}

	// List case (array with arbitrary number of elements)
	return highlight.includes(lineNumber);
}
