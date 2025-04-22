import type { LazyLogProps } from '$lib/types/lazylog.js';

// Re-export all utility functions from the utils directory
export {
	// ANSI handling
	getVisibleLength,
	getActiveAnsiCodes,
	stripAnsiCodes,
	splitAtVisiblePosition,

	// Highlighting
	isHighlighted,

	// Line wrapping
	shouldWrapLine,
	createWrappedChunk,
	processWrappedLine,
	processTextWithWrapping,

	// Search
	findMatchesInPart,
	findMatchesInLine,
	findMatches,
	getLinesWithMatches,
	getMatchesForLine,
	getActiveMatchForLine,
	getNextMatchIndex,
	getPreviousMatchIndex,

	// Text processing
	processTextWithoutWrapping,
	processText
} from './utils/index.js';

// Re-export types
export type { Match } from './utils/search.js';

/**
 * Default properties for the LazyLog component
 */
export const DEFAULT_PROPS: LazyLogProps = {
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
