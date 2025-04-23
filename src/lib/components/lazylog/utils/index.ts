/**
 * Re-exports all utility functions for the log viewer
 */

// Re-export from ansi-handling.ts
export {
	getVisibleLength,
	getActiveAnsiCodes,
	stripAnsiCodes,
	splitAtVisiblePosition
} from './ansi-handling.js';

// Re-export from highlighting.ts
export { isHighlighted } from './highlighting.js';

// Line wrapping is now handled via CSS, so we no longer need these exports
// export {
// 	shouldWrapLine,
// 	createWrappedChunk,
// 	processWrappedLine,
// 	processTextWithWrapping
// } from './line-wrapping.js';

// Re-export from search.ts
export {
	findMatchesInPart,
	findMatchesInLine,
	findMatches,
	getLinesWithMatches,
	getMatchesForLine,
	getActiveMatchForLine,
	getNextMatchIndex,
	getPreviousMatchIndex
} from './search.js';
export type { Match } from './search.js';

// Re-export from text-processing.ts
export { processTextWithoutWrapping, processText } from './text-processing.js';
